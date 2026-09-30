#!/usr/bin/env python3
"""Drive-screen: guarded Hyprland desktop fallback, adapted from coleam00/skills.

MIT; upstream dfaa9105741fc5ba9b16b6a72551cad4bad70415 is preserved in ../upstream.
Never use this for permission approval, vault unlock, or master-password entry.
All capture/focus/input requires fresh human desktop handover and --handover.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import secrets
import shutil
import stat
import struct
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path


POINTER_BACKEND = Path.home() / ".local/libexec/drive-screen/wlrctl"
CAPTURE_MAX_AGE = 120
VAULT_APP = re.compile(r"1password|bitwarden", re.I)
HUMAN_PROMPT = re.compile(r"\b(unlock|master password|account password|sign in|sign-in|authenticate|authentication)\b", re.I)


class Refusal(Exception):
    pass


def refuse(code: str, message: str) -> None:
    raise Refusal(f"{code}: {message}")


def command(args: list[str], *, data: bytes | None = None,
            env: dict[str, str] | None = None, check: bool = True, capture: bool = True) -> subprocess.CompletedProcess:
    # Never echo argv, stdin, stderr, clipboard contents, or payloads in errors.
    try:
        stream = subprocess.PIPE if capture else subprocess.DEVNULL
        result = subprocess.run(args, input=data, stdout=stream, stderr=stream, env=env, timeout=15)
    except FileNotFoundError:
        refuse("MISSING_TOOL", f"Install {Path(args[0]).name} with the user's approval.")
    except subprocess.TimeoutExpired:
        refuse("COMMAND_TIMEOUT", f"{Path(args[0]).name} timed out; inspect the application before retrying.")
    if check and result.returncode:
        refuse("COMMAND_FAILED", f"{Path(args[0]).name} failed (exit {result.returncode}); no automatic retry.")
    return result


@dataclass(frozen=True)
class Window:
    id: str
    pid: int
    app: str
    title: str
    x: int
    y: int
    width: int
    height: int

    @classmethod
    def from_client(cls, client: dict) -> Window:
        wid = client.get("address", "")
        if not re.fullmatch(r"0x[0-9a-fA-F]+", wid):
            refuse("INVALID_WINDOW", "Hyprland did not return an exact window address.")
        return cls(wid.lower(), int(client["pid"]), client.get("class", ""),
                   client.get("title", ""), *map(int, client["at"]), *map(int, client["size"]))

    def line(self) -> str:
        # JSON quoting makes titles containing control characters terminal-safe.
        return f"{self.id}\t{self.x},{self.y} {self.width}x{self.height}\t{json.dumps(self.title, ensure_ascii=True)}"

    def identity(self) -> tuple:
        return self.id, self.pid, self.app

    def geometry(self) -> tuple:
        return self.x, self.y, self.width, self.height


class Desktop:
    def __init__(self, safe_ui: str | None = None) -> None:
        if not sys.platform.startswith("linux"):
            refuse("PLATFORM_UNSUPPORTED", "This installation is the Linux/Hyprland adaptation.")
        self.env = os.environ.copy()
        self.safe_ui = safe_ui
        runtime = Path(self.env.get("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}"))
        if not runtime.is_dir() or runtime.stat().st_uid != os.getuid():
            refuse("NO_USER_SESSION", "No owned XDG_RUNTIME_DIR; log into the graphical session as this user.")
        self.env["XDG_RUNTIME_DIR"] = str(runtime)
        instances = self.json("instances")
        signature = self.env.get("HYPRLAND_INSTANCE_SIGNATURE")
        candidates = [x for x in instances if not signature or x.get("instance") == signature]
        if len(candidates) != 1:
            refuse("AMBIGUOUS_SESSION", "Select one live session using HYPRLAND_INSTANCE_SIGNATURE; never guess.")
        instance = candidates[0]
        self.env["HYPRLAND_INSTANCE_SIGNATURE"] = instance["instance"]
        display = instance.get("wl_socket", "")
        if not display or "/" in display:
            refuse("NO_WAYLAND_SOCKET", "The selected instance did not expose a local Wayland socket.")
        sock = runtime / display
        if not sock.exists() or not stat.S_ISSOCK(sock.stat().st_mode) or sock.stat().st_uid != os.getuid():
            refuse("NO_WAYLAND_SOCKET", "The selected Wayland socket is unavailable to this user.")
        self.env["WAYLAND_DISPLAY"] = display
        self.state_dir = runtime / "drive-screen"
        if self.state_dir.exists() or self.state_dir.is_symlink():
            state_stat = self.state_dir.lstat()
            if not stat.S_ISDIR(state_stat.st_mode) or state_stat.st_uid != os.getuid() or stat.S_IMODE(state_stat.st_mode) != 0o700:
                refuse("UNSAFE_STATE_DIRECTORY", "The private capture-state directory must be owned by this user with mode 0700.")

    def capture_state(self, window: Window) -> Path:
        session = hashlib.sha256(self.env["HYPRLAND_INSTANCE_SIGNATURE"].encode()).hexdigest()[:16]
        return self.state_dir / f"{session}-{window.id}.json"

    def invalidate_capture(self, window: Window) -> None:
        self.capture_state(window).unlink(missing_ok=True)

    def monitor_layout(self) -> list[dict]:
        fields = ("id", "name", "x", "y", "width", "height", "scale", "transform",
                  "activeWorkspace", "specialWorkspace", "dpmsStatus")
        return sorted(({k: m.get(k) for k in fields} for m in self.json("monitors")), key=lambda m: m["id"])

    def run(self, args: list[str], **kwargs) -> subprocess.CompletedProcess:
        return command(args, env=self.env, **kwargs)

    def json(self, action: str):
        result = self.run(["hyprctl", "-j", action])
        try:
            return json.loads(result.stdout)
        except (ValueError, UnicodeError):
            refuse("INVALID_HYPRLAND_RESPONSE", f"hyprctl {action} did not return JSON.")

    def dispatch(self, expression: str) -> None:
        result = self.run(["hyprctl", "dispatch", expression])
        if result.stdout.strip() != b"ok":
            refuse("DISPATCH_FAILED", "Hyprland rejected the operation; no fallback input was attempted.")

    def unlocked(self) -> None:
        if self.json("locked").get("locked") is not False:
            refuse("SESSION_LOCKED", "Unlock is human-only; no input or capture is allowed.")

    def windows(self) -> list[Window]:
        return [Window.from_client(c) for c in self.json("clients")
                if c.get("mapped") and not c.get("hidden")]

    def resolve(self, title: str | None, wid: str | None) -> Window:
        windows = self.windows()
        if wid:
            if not re.fullmatch(r"0x[0-9a-fA-F]+", wid):
                refuse("INVALID_ID", "Use the complete 0x address returned by list.")
            matches = [w for w in windows if w.id == wid.lower()]
        elif title:
            matches = [w for w in windows if title.casefold() in w.title.casefold()]
        else:
            refuse("NO_TARGET", "Pass --id or an unambiguous --title.")
        if not matches:
            refuse("NOT_FOUND", "No mapped, non-hidden window matches the requested target.")
        if len(matches) != 1:
            refuse("AMBIGUOUS", "Multiple windows match; use an exact --id:\n" + "\n".join(w.line() for w in matches))
        return matches[0]

    def permitted_target(self, window: Window) -> None:
        self.unlocked()
        if re.search(r"pinentry|polkit|hyprlock|gcr.prompter", window.app, re.I):
            refuse("HUMAN_ONLY_WINDOW", "Unlock and OS authentication dialogs are human-only.")
        if VAULT_APP.search(window.app):
            if HUMAN_PROMPT.search(window.title):
                refuse("HUMAN_ONLY_WINDOW", "Password-manager unlock and sign-in are human-only.")
            if not self.safe_ui:
                refuse("SAFE_UI_REQUIRED", "Only authorized nonsecret settings/autofill UI is supported; use --safe-ui after the human exposes that surface. Never capture vault data.")

    def focused(self, window: Window) -> Window:
        self.permitted_target(window)
        client = self.json("activewindow")
        if not client or client.get("address", "").lower() != window.id:
            refuse("FOCUS_LOST", "Target is not foreground. Stop and hand back; never retry input or auto-refocus.")
        current = Window.from_client(client)
        if current.identity() != window.identity():
            refuse("WINDOW_CHANGED", "Target identity changed; rediscover only after consulting the user.")
        self.permitted_target(current)
        return current

    def focus(self, window: Window) -> Window:
        self.permitted_target(window)
        self.dispatch(f'hl.dsp.focus({{ window = "address:{window.id}" }})')
        time.sleep(0.3)
        return self.focused(window)

    def key(self, window: Window, keys: str) -> None:
        mods, key = chord(keys)
        if VAULT_APP.search(window.app) and (mods or key not in {"Tab", "ISO_Left_Tab", "Escape", "Up", "Down", "Left", "Right", "Home", "End", "Prior", "Next"}):
            refuse("VAULT_KEY_REFUSED", "Password-manager shortcuts are limited to nonsecret navigation; no copy, reveal, submit, or unlock.")
        self.focused(window)
        # A previous virtual keyboard may leave a reduced keymap selected.
        # Give this shortcut its own keymap instead of resolving in that map.
        modifiers = [modifier.lower() for modifier in mods.split()]
        argv = ["wtype"]
        for modifier in modifiers:
            argv.extend(["-M", modifier])
        argv.extend(["-k", key])
        for modifier in reversed(modifiers):
            argv.extend(["-m", modifier])
        self.run(argv)
        # Input may itself close/change focus. Fail closed after the one send,
        # never assert that a successful dispatch proves app acceptance.
        self.focused(window)


def chord(keys: str) -> tuple[str, str]:
    parts = keys.lower().split("+")
    modifiers = {"ctrl": "CTRL", "control": "CTRL", "shift": "SHIFT",
                 "alt": "ALT", "super": "SUPER", "win": "SUPER", "cmd": "SUPER"}
    aliases = {"enter": "Return", "return": "Return", "esc": "Escape", "escape": "Escape",
               "backspace": "BackSpace", "delete": "Delete", "insert": "Insert", "pageup": "Prior", "pagedown": "Next",
               "tab": "Tab", "space": "space", "up": "Up", "down": "Down", "left": "Left",
               "right": "Right", "home": "Home", "end": "End", "backtick": "grave",
               "grave": "grave", "minus": "minus", "equals": "equal", "comma": "comma",
               "period": "period", "slash": "slash", "semicolon": "semicolon", "plus": "plus"}
    if not parts or any(p not in modifiers for p in parts[:-1]):
        refuse("INVALID_CHORD", "Use modifiers ctrl/shift/alt/super followed by one named key.")
    key = aliases.get(parts[-1], parts[-1])
    if key not in aliases.values() and not re.fullmatch(r"[a-z0-9]|f(?:[1-9]|1[0-9]|2[0-4])", key):
        refuse("INVALID_KEY", "Use one letter, digit, F1-F24, or a documented named key; mouse codes are not keys.")
    return " ".join(modifiers[p] for p in parts[:-1]), key


def type_text(desktop: Desktop, window: Window, text: str) -> None:
    if VAULT_APP.search(window.app):
        refuse("VAULT_TEXT_REFUSED", "Secret-field detection is unavailable; text entry in password managers is human-only.")
    if any(ord(c) < 32 or ord(c) == 127 for c in text):
        refuse("CONTROL_IN_TYPE", "Type accepts printable literals only; use key separately or paste a file.")
    desktop.focused(window)
    # Keep one virtual keyboard/keymap for the entire literal. Recreating a
    # keyboard per character can expose applications to transient keymaps.
    with subprocess.Popen(["wtype", "-d", "15", "-"], stdin=subprocess.PIPE,
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                          env=desktop.env) as process:
        with ThreadPoolExecutor(max_workers=1) as executor:
            delivery = executor.submit(process.communicate, text.encode("utf-8"))
            deadline = time.monotonic() + 15 + len(text) * 0.02
            try:
                while not delivery.done():
                    desktop.focused(window)
                    if time.monotonic() > deadline:
                        refuse("TYPE_TIMEOUT", "Input delivery timed out; partial text may have landed.")
                    time.sleep(0.01)
                delivery.result()
                if process.returncode:
                    refuse("TYPE_FAILED", "Virtual keyboard failed; inspect for partial input.")
            finally:
                if process.poll() is None:
                    process.kill()
                delivery.result()
    desktop.focused(window)
    print(f"TYPE_SENT: {len(text)} characters; no Enter. App acceptance still needs visual confirmation.")


def clipboard_snapshot(desktop: Desktop) -> tuple[str | None, bytes]:
    result = desktop.run(["wl-paste", "--list-types"], check=False)
    if result.returncode:
        # wl-paste documents this error for an empty selection. Other failures
        # are not permission to destroy the user's clipboard.
        if b"Nothing is copied" in result.stderr:
            return None, b""
        refuse("CLIPBOARD_UNREADABLE", "Cannot snapshot clipboard safely; nothing was changed.")
    types = result.stdout.decode("utf-8", "strict").splitlines()
    # wl-copy --sensitive adds this metadata hint; restoration retains it.
    allowed = {"text/plain;charset=utf-8", "text/plain", "UTF8_STRING", "STRING", "TEXT", "x-kde-passwordManagerHint"}
    if not types or any(t not in allowed for t in types):
        refuse("CLIPBOARD_FORMAT_UNSUPPORTED", "Clipboard is not plain text; preserve it and use another input path.")
    mime = next((t for t in ("text/plain;charset=utf-8", "UTF8_STRING", "text/plain", "TEXT", "STRING") if t in types), None)
    if mime is None:
        refuse("CLIPBOARD_FORMAT_UNSUPPORTED", "No restorable plain-text content is available.")
    result = desktop.run(["wl-paste", "--no-newline", "--type", mime])
    return mime, result.stdout


def copy_bytes(desktop: Desktop, mime: str, payload: bytes) -> None:
    # Sensitive is a history-manager hint, not a guarantee. Never use secrets.
    # wl-copy's serving child must not inherit pipes that communicate() waits on.
    desktop.run(["wl-copy", "--sensitive", "--type", mime], data=payload, capture=False)


def paste_text(desktop: Desktop, window: Window, payload: bytes, paste_keys: str) -> None:
    if VAULT_APP.search(window.app):
        refuse("VAULT_TEXT_REFUSED", "Never borrow the clipboard or paste into password-manager fields.")
    payload.decode("utf-8", "strict")
    if b"\0" in payload:
        refuse("NUL_IN_PASTE", "NUL bytes are not supported in text paste.")
    chord(paste_keys)  # validate before borrowing the clipboard
    desktop.focused(window)
    mime, saved = clipboard_snapshot(desktop)
    changed = False
    try:
        changed = True  # restore even if the clipboard-write command fails
        copy_bytes(desktop, "text/plain;charset=utf-8", payload)
        readback = desktop.run(["wl-paste", "--no-newline", "--type", "text/plain;charset=utf-8"]).stdout
        if readback != payload:
            refuse("CLIPBOARD_MISMATCH", "Clipboard changed before paste; nothing was sent.")
        desktop.key(window, paste_keys)
        # Wayland paste is asynchronous: this gives ordinary apps a chance to
        # request data, but is not proof they consumed it. Verify visually.
        time.sleep(0.6)
        desktop.focused(window)
    finally:
        if changed:
            if mime is None:
                desktop.run(["wl-copy", "--clear"])
            else:
                copy_bytes(desktop, mime, saved)
        # The snapshot stays in this process memory, never on disk or stdout.
        saved = b""
    print(f"PASTE_REQUESTED: {len(payload)} UTF-8 bytes; no Enter. Clipboard text restored; verify the destination.")


def capture(desktop: Desktop, window: Window, output: str, max_width: int, settle: float) -> None:
    if max_width < 0 or not 0 <= settle <= 10:
        refuse("INVALID_CAPTURE_OPTIONS", "max-width must be nonnegative; settle must be 0..10 seconds.")
    time.sleep(settle)
    current = desktop.focused(window)
    layout = desktop.monitor_layout()
    if current.width <= 0 or current.height <= 0:
        refuse("INVALID_GEOMETRY", "The window has no capturable area.")
    path = Path(output).expanduser().absolute()
    meta_path = Path(str(path) + ".json")
    if path.exists() or path.is_symlink() or meta_path.exists() or meta_path.is_symlink():
        refuse("OUTPUT_EXISTS", "Choose a new capture path; existing files are never overwritten.")
    scale = min(1.0, max_width / current.width) if max_width else 1.0
    geometry = f"{current.x},{current.y} {current.width}x{current.height}"
    # O_EXCL and 0600 avoid overwriting user files or exposing private screenshots.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    meta_created = False
    try:
        result = desktop.run(["grim", "-t", "png", "-s", str(scale), "-g", geometry, "-"])
        after = desktop.focused(window)
        if after.geometry() != current.geometry() or desktop.monitor_layout() != layout:
            refuse("GEOMETRY_CHANGED", "Window or monitor layout moved during capture; obtain fresh coordinates.")
        image = result.stdout
        if image[:8] != b"\x89PNG\r\n\x1a\n" or len(image) < 24:
            refuse("CAPTURE_FAILED", "grim did not produce PNG data.")
        width, height = struct.unpack(">II", image[16:24])
        if width <= 0 or height <= 0:
            refuse("CAPTURE_FAILED", "PNG dimensions are invalid.")
        with os.fdopen(fd, "wb") as stream:
            fd = -1
            stream.write(image)
        metadata = {"schema": 1, "capture_id": secrets.token_hex(16),
                    "window_id": current.id, "pid": current.pid, "app": current.app,
                    "session": desktop.env["HYPRLAND_INSTANCE_SIGNATURE"],
                    "safe_ui": desktop.safe_ui, "monitor_layout": layout,
                    "image_sha256": hashlib.sha256(image).hexdigest(),
                    "capture_kind": "composited_desktop_region_not_isolated_window",
                    "coordinate_space": "Hyprland global logical coordinates",
                    "window_origin": [current.x, current.y], "window_size": [current.width, current.height],
                    "image_size": [width, height],
                    "image_scale_x": width / current.width, "image_scale_y": height / current.height,
                    "mapping": "x = origin_x + image_x / image_scale_x; y = origin_y + image_y / image_scale_y",
                    "warning": "Region capture can include overlapping windows, popups, or layers; inspect before using.",
                    "captured_at_unix": time.time()}
        meta_fd = os.open(meta_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        meta_created = True
        with os.fdopen(meta_fd, "w", encoding="utf-8") as stream:
            json.dump(metadata, stream, indent=2)
            stream.write("\n")
        desktop.state_dir.mkdir(mode=0o700, exist_ok=True)
        state_path = desktop.capture_state(window)
        temporary = state_path.with_suffix(f".{metadata['capture_id']}.tmp")
        try:
            state_fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(state_fd, "w", encoding="utf-8") as stream:
                json.dump({"capture_id": metadata["capture_id"], "metadata": str(meta_path)}, stream)
            os.replace(temporary, state_path)
        finally:
            temporary.unlink(missing_ok=True)
    except BaseException:
        if fd != -1:
            os.close(fd)
        path.unlink(missing_ok=True)
        if meta_created:
            meta_path.unlink(missing_ok=True)
        raise
    print(f"SHOT: {path}")
    print(f"METADATA: {meta_path}")
    print(f"WINDOW_ORIGIN: {current.x},{current.y}  IMAGE_SCALE_X: {width/current.width:.8f}  IMAGE_SCALE_Y: {height/current.height:.8f}")
    print("REGION_CAPTURE: overlays may be visible; inspect before continuing. Metadata uses logical, not physical, coordinates.")


def pointer_coordinates(desktop: Desktop, window: Window, metadata_path: str,
                        image_x: float, image_y: float) -> tuple[int, int]:
    path = Path(metadata_path).expanduser().absolute()
    if not str(path).endswith(".png.json"):
        refuse("INVALID_CAPTURE", "--from-shot must name the JSON sidecar of a fresh .png screenshot.")
    metadata = json.loads(path.read_text())
    state_path = desktop.capture_state(window)
    if not state_path.exists():
        refuse("FRESH_CAPTURE_REQUIRED", "Take and inspect a new screenshot before each pointer action.")
    latest = json.loads(state_path.read_text())
    if latest != {"capture_id": metadata.get("capture_id"), "metadata": str(path)}:
        refuse("STALE_CAPTURE", "This is not the latest screenshot of the selected window.")
    if metadata.get("schema") != 1 or metadata.get("session") != desktop.env["HYPRLAND_INSTANCE_SIGNATURE"]:
        refuse("INVALID_CAPTURE", "Screenshot belongs to a different session or metadata version.")
    if (metadata.get("window_id"), metadata.get("pid"), metadata.get("app")) != window.identity():
        refuse("WINDOW_CHANGED", "Screenshot window identity does not match the explicit target.")
    if metadata.get("safe_ui") != desktop.safe_ui:
        refuse("SURFACE_CHANGED", "The declared nonsecret surface must match the screenshot.")
    age = time.time() - metadata["captured_at_unix"]
    if not math.isfinite(age) or not 0 <= age <= CAPTURE_MAX_AGE:
        refuse("STALE_CAPTURE", "Screenshot is older than 120 seconds; take and inspect another.")
    image = Path(str(path)[:-5]).read_bytes()
    if hashlib.sha256(image).hexdigest() != metadata["image_sha256"]:
        refuse("IMAGE_CHANGED", "Screenshot bytes no longer match their metadata.")
    width, height = metadata["image_size"]
    if not all(math.isfinite(v) for v in (image_x, image_y, width, height)) or not (0 <= image_x < width and 0 <= image_y < height):
        refuse("OUTSIDE_CAPTURE", "Pointer coordinates must be finite pixels inside the screenshot.")
    current = desktop.focused(window)
    if list(current.geometry()) != metadata["window_origin"] + metadata["window_size"] or desktop.monitor_layout() != metadata["monitor_layout"]:
        refuse("GEOMETRY_CHANGED", "Window, workspace, or monitor layout changed; capture again.")
    # Independently measured PNG dimensions include fractional-scale rounding.
    x = math.floor(current.x + image_x * current.width / width)
    y = math.floor(current.y + image_y * current.height / height)
    if not (current.x <= x < current.x + current.width and current.y <= y < current.y + current.height):
        refuse("OUTSIDE_WINDOW", "Mapped coordinates are outside the window.")
    return x, y


def pointer_guard(desktop: Desktop, window: Window, geometry: tuple, layout: list[dict],
                  x: int, y: int, *, check_cursor: bool) -> None:
    current = desktop.focused(window)
    if current.geometry() != geometry or desktop.monitor_layout() != layout:
        refuse("GEOMETRY_CHANGED", "Window or monitor layout changed; no further pointer input.")
    # Top/overlay layer rectangles are conservative: input-transparent layers may
    # also refuse. We cannot safely infer their input regions from Hyprland IPC.
    for output in desktop.json("layers").values():
        for level in ("2", "3"):
            for layer in output.get("levels", {}).get(level, []):
                if layer.get("alpha", 1) <= 0:
                    continue
                if layer["x"] <= x < layer["x"] + layer["w"] and layer["y"] <= y < layer["y"] + layer["h"]:
                    refuse("LAYER_OVER_TARGET", "A top/overlay layer covers the point. Dismiss it through an authorized surface and recapture.")
    if check_cursor:
        cursor = desktop.json("cursorpos")
        if abs(cursor["x"] - x) > 1 or abs(cursor["y"] - y) > 1:
            refuse("POINTER_MOVED", "Cursor is not at the verified point; stop rather than retry.")


def pointer_action(desktop: Desktop, window: Window, args: argparse.Namespace) -> None:
    if not args.id or not args.from_shot or args.x is None or args.y is None:
        refuse("POINTER_TARGET_REQUIRED", "Use exact --id, --from-shot NEW.png.json, and --x/--y screenshot pixels.")
    if args.action == "scroll" and not (-1000 <= args.amount <= 1000 and args.amount != 0):
        refuse("INVALID_SCROLL", "--amount must be a nonzero integer from -1000 to 1000; compositor settings determine direction.")
    if not POINTER_BACKEND.is_file() or not os.access(POINTER_BACKEND, os.X_OK):
        refuse("MISSING_POINTER_BACKEND", "Run scripts/build-pointer.py once as this user; no root or desktop permissions are needed.")
    x, y = pointer_coordinates(desktop, window, args.from_shot, args.x, args.y)
    geometry = window.geometry()
    layout = desktop.monitor_layout()
    pointer_guard(desktop, window, geometry, layout, x, y, check_cursor=False)
    # Consume before moving: partial failure can never replay an old screenshot.
    desktop.invalidate_capture(window)
    result = desktop.run(["hyprctl", "dispatch", f"hl.dsp.cursor.move({{ x = {x}, y = {y} }})"])
    if result.stdout.strip() != b"ok":
        refuse("DISPATCH_FAILED", "Hyprland rejected absolute cursor movement; no click or scroll was sent.")
    pointer_guard(desktop, window, geometry, layout, x, y, check_cursor=True)
    if args.action == "click":
        for index in range(2 if args.double else 1):
            if index:
                time.sleep(0.1)
            pointer_guard(desktop, window, geometry, layout, x, y, check_cursor=True)
            desktop.run([str(POINTER_BACKEND), "pointer", "click", "right" if args.right else "left"])
            desktop.focused(window)
    elif args.action == "scroll":
        dy, dx = (0, args.amount) if args.horizontal else (args.amount, 0)
        pointer_guard(desktop, window, geometry, layout, x, y, check_cursor=True)
        desktop.run([str(POINTER_BACKEND), "pointer", "scroll", str(dy), str(dx)])
        desktop.focused(window)
    print(f"{args.action.upper()}_SENT: logical {x},{y}; screenshot consumed. Capture and inspect before another action.")


def doctor() -> int:
    required = ("hyprctl", "grim", "wtype", "wl-copy", "wl-paste")
    missing = [name for name in required if not shutil.which(name)]
    print("READ_ONLY_DOCTOR: no capture, clipboard access, focus, input, or permission requests.")
    for name in required:
        print(f"{name}: {'missing' if name in missing else 'available'}")
    if missing:
        return 1
    desktop = Desktop()
    version = desktop.json("version")
    print("Hyprland:", version.get("version", version.get("tag", version.get("commit", "unknown"))))
    print("session_locked:", desktop.json("locked").get("locked", "unknown"))
    print("KEYS/TYPE: focus-guarded wtype with per-call keymaps; PASTE: restorable plain-text clipboard only.")
    print(f"POINTER: native absolute logical move + unprivileged wlrctl button/axis at {POINTER_BACKEND}; {'available' if POINTER_BACKEND.is_file() else 'build required'}.")
    print("PREREQUISITES_FOUND: desktop operations remain untested by doctor.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["doctor", "list", "find", "focus", "shot", "type", "paste", "key", "move", "click", "scroll"])
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--title")
    target.add_argument("--id")
    payload = parser.add_mutually_exclusive_group()
    payload.add_argument("--text")
    payload.add_argument("--file")
    payload.add_argument("--stdin", action="store_true")
    parser.add_argument("--keys")
    parser.add_argument("--paste-keys", choices=["ctrl+v", "ctrl+shift+v", "shift+insert"], default="ctrl+v")
    parser.add_argument("--out")
    parser.add_argument("--max-width", type=int, default=1280, help="Maximum image width; 0 uses logical-resolution pixels.")
    parser.add_argument("--settle", type=float, default=0.3)
    parser.add_argument("--from-shot", help="Latest inspected .png.json sidecar; single-use for pointer input, expires after 120 seconds.")
    parser.add_argument("--x", type=float, help="X pixel coordinate in the screenshot, not global coordinates.")
    parser.add_argument("--y", type=float, help="Y pixel coordinate in the screenshot, not global coordinates.")
    parser.add_argument("--amount", type=int, default=120, help="Wheel axis units, not detents; natural-scroll settings can invert direction.")
    parser.add_argument("--horizontal", action="store_true")
    parser.add_argument("--safe-ui", choices=["settings", "autofill"], help="Human-exposed nonsecret password-manager UI only. Never unlock, reveal, copy, or read vault items.")
    parser.add_argument("--right", action="store_true")
    parser.add_argument("--double", action="store_true")
    parser.add_argument("--handover", action="store_true", help="Acknowledge the human explicitly handed over this desktop for this task. Not permission approval.")
    args = parser.parse_args()
    if args.action == "doctor":
        if args.out:
            refuse("DOCTOR_IS_READ_ONLY", "Use shot separately after explicit handover; doctor never captures.")
        return doctor()
    if args.action not in {"list", "find"} and not args.handover:
        refuse("HANDOVER_REQUIRED", "Obtain fresh explicit desktop handover from the human, announce the interruption, then pass --handover.")
    desktop = Desktop(args.safe_ui)
    if args.action == "list":
        desktop.unlocked()
        for window in desktop.windows():
            print(window.line())
        return 0
    window = desktop.resolve(args.title, args.id)
    if args.action in {"focus", "type", "paste", "key"}:
        desktop.invalidate_capture(window)
    if args.action == "find":
        desktop.unlocked()
        print(window.line())
    elif args.action == "focus":
        print("FOCUS_OK:", desktop.focus(window).id)
    elif args.action == "shot":
        if not args.out:
            refuse("NO_OUT", "shot requires --out with a fresh .png path.")
        capture(desktop, window, args.out, args.max_width, args.settle)
    elif args.action in {"move", "click", "scroll"}:
        pointer_action(desktop, window, args)
    elif args.action == "key":
        if not args.keys:
            refuse("NO_KEYS", "key requires --keys.")
        desktop.key(window, args.keys)
        print("KEY_SENT: verify the application before another action.")
    elif args.action in {"type", "paste"}:
        if args.file:
            payload_bytes = Path(args.file).read_bytes()
        elif args.stdin:
            payload_bytes = sys.stdin.buffer.read()
        elif args.text is not None:
            payload_bytes = args.text.encode("utf-8")
        else:
            refuse("NO_PAYLOAD", "Pass --text, --file, or --stdin; never provide credentials.")
        if args.action == "type":
            type_text(desktop, window, payload_bytes.decode("utf-8", "strict"))
        else:
            paste_text(desktop, window, payload_bytes, args.paste_keys)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Refusal as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
    except (OSError, ValueError, KeyError, TypeError) as error:
        # Do not dump tracebacks or data: payloads/clipboard snapshots are private.
        print(f"OPERATION_FAILED: {type(error).__name__}; no automatic retry. Inspect state and hand back.", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("INTERRUPTED: stop and hand the desktop back.", file=sys.stderr)
        sys.exit(130)

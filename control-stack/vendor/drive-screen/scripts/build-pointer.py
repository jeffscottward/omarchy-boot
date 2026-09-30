#!/usr/bin/env python3
"""Build pinned wlrctl with wheel-source scrolling, without Meson or privileges."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor" / "wlrctl"
DEST = Path.home() / ".local" / "libexec" / "drive-screen" / "wlrctl"


def run(args: list[str]) -> bytes:
    return subprocess.run(args, check=True, stdout=subprocess.PIPE).stdout


def main() -> None:
    manifest = json.loads((ROOT / "vendor" / "wlrctl-source.json").read_text())
    for relative, expected in manifest["sha256"].items():
        path = SOURCE / relative
        if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(f"Pinned source mismatch: {relative}; no build performed")
    for executable in ("cc", "pkg-config", "wayland-scanner"):
        if not shutil.which(executable):
            raise SystemExit(f"Missing build tool: {executable}")
    flags = shlex.split(run(["pkg-config", "--cflags", "--libs", "wayland-client", "xkbcommon"]).decode())
    with tempfile.TemporaryDirectory(prefix="drive-screen-build-") as temporary:
        build = Path(temporary)
        generated = []
        for name in ("virtual-keyboard-unstable-v1", "wlr-virtual-pointer-unstable-v1",
                     "wlr-foreign-toplevel-management-unstable-v1", "wlr-output-management-unstable-v1"):
            xml = SOURCE / "protocol" / f"{name}.xml"
            header = build / f"{name}-client-protocol.h"
            implementation = build / f"{name}-protocol.c"
            run(["wayland-scanner", "client-header", str(xml), str(header)])
            run(["wayland-scanner", "private-code", str(xml), str(implementation)])
            generated.append(str(implementation))
        binary = build / "wlrctl"
        sources = [str(SOURCE / name) for name in ("main.c", "ascii_raw_keymap.c", "keyboard.c",
                   "pointer.c", "toplevel.c", "output.c", "util.c")]
        # GTK does not consume this short-lived client's finger gesture. Report
        # real wheel axes instead; keep the verified upstream archive unchanged.
        pointer = (SOURCE / "pointer.c").read_text()
        if pointer.count("WL_POINTER_AXIS_SOURCE_FINGER") != 4:
            raise SystemExit("Unexpected upstream wheel patch context")
        pointer = pointer.replace("WL_POINTER_AXIS_SOURCE_FINGER", "WL_POINTER_AXIS_SOURCE_WHEEL")
        (build / "pointer.c").write_text(pointer)
        sources[sources.index(str(SOURCE / "pointer.c"))] = str(build / "pointer.c")
        run(["cc", "-std=c11", "-O2", "-DMEMFD_CREATE", '-DWLRCTL_VERSION="0.2.2"',
             "-Wno-unused-parameter", "-Wno-missing-braces", "-I", str(SOURCE / "include"),
             "-I", str(build), *sources, *generated, *flags, "-o", str(binary)])
        DEST.parent.mkdir(parents=True, exist_ok=True)
        fd, staging = tempfile.mkstemp(prefix=".wlrctl-", dir=DEST.parent)
        try:
            with os.fdopen(fd, "wb") as stream:
                stream.write(binary.read_bytes())
                os.fchmod(stream.fileno(), 0o755)
            os.replace(staging, DEST)
        finally:
            Path(staging).unlink(missing_ok=True)
    print(f"Installed {manifest['commit']} + wheel-source patch to {DEST}; no desktop connection or input performed.")


if __name__ == "__main__":
    main()

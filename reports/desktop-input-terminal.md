# Desktop, input, voice and terminal reconstruction

## Scope and evidence standard

This is a reference configuration derived from an earlier capture, not a live network map or a list of everything an assistant once proposed. It covers **all 52 assigned summary packets and all 778 change claims** in the private review: desktop-shell packets 17–45 (375 claims), keybindings-input 75–79 (111), retired-stack 94–96 (59), terminal-herdr 99–112 (215), and voice-input 113 (18). Duplicate accounts are consolidated below; requests, unsuccessful trials and reversals remain identified rather than becoming installation instructions. Agent internals, networking, audio hardware, RGB and application packaging have companion reports; their desktop consequences are retained here.

Companion reports: [agents and development](agents-development.md), [system, applications and networking](system-apps-network.md), [current-state inventory](current-state-inventory.md), and [evidence coverage](evidence-coverage.md). These divide subject ownership, not the historical review: cross-domain claims in this assignment were still processed.

References such as **P79** and **H4** are opaque private review labels. Historical evidence was reviewed privately; raw transcripts and locators are not published. Raw conversations, captures, clipboard contents, account data, private addresses and notification capabilities are not reproduced here.

Three kinds of statement must not be confused:

- **Verified export:** inspected bytes in `profiles/mac.json`, `profiles/rig.json` and their payload files, or the collector's current inventory. This establishes saved configuration or installed-file presence, not successful interaction on a newly installed machine.
- **Reported history:** user observations and archived assistant/checkpoint claims, including records that the previous summarizer labeled `verified`. Those labels are not fresh proof. The 778 records originally comprise 208 reported-applied, 156 requested, 96 failed, 109 uncertain, 63 preference, 128 verified-labeled and 18 reverted claims.
- **Intended state:** explicit current decisions. These override obsolete history, but any disagreement with captured files is recorded rather than silently hidden.

No desktop session was changed or restarted for this report. No builds, tests, linters or formatters were run. Configuration/source inspection is the verification performed here; physical shortcuts, microphone capture, Bluetooth reconnection and restored-session operation have not been re-tested.

“Current,” “saved,” and “exported” below refer to the earlier capture. Profile, payload, source-tree and installer paths describe privately reviewed artifacts, not files supplied by this documentation-only publication. Obtain authorized source and dependencies separately. Example role aliases `laptop-host`, `workstation-host`, and `other-os-host` are placeholders, not observed hostnames; configure actual endpoints for the target installation.

Unless a machine is named, a destination below applies to both profiles. For a home-relative destination such as `~/.config/hypr/input.lua`, the corresponding portable source is `payload/<mac|rig>/home/.config/hypr/input.lua`. The profile's `files`, `links`, `sources`, `services`, exclusions and prerequisites are authoritative for exact copying, ownership, sanitization and architecture.

## 1. Final machine roles and important differences

| Component | Native Omarchy Mac | Omarchy rig | Restore boundary |
|---|---|---|---|
| Platform | Apple Silicon/aarch64; capture identifies Omarchy 4.0.4-mac.1 | x86_64; capture identifies Omarchy 4.0.3-1 | Fresh hardware-appropriate Omarchy first; do not transplant kernels, compositor binaries, driver state or device identity |
| Primary terminal | Foot launching native multi-machine Herdr, local server session `local` | Foot launching native multi-machine Herdr, local server session `default` | Separate host-local sessions with optional authorized remote backends; no outer automatic SSH/tmux layer |
| Plain local terminal | `Super+Alt+Return`, green host cue | Same shortcut, blue host cue | Preserve this escape hatch; it deliberately bypasses Herdr and OMP startup |
| Herdr prefix | `Ctrl+Space`; detach `prefix+d`, reload `prefix+q` | `Ctrl+Space`; detach remains default `prefix+q` | Do not copy the Mac's entire key map over rig defaults |
| Voice | Unofficial native ARM64 Wispr Flow; physical Fn translated to F19 | Voxtype user service, `base.en` model | Wispr login/settings and real microphone selection are separate setup; old remote-input mappings are retired |
| Input | Sensitivity 0.45, natural touchpad scrolling, three-finger horizontal workspace gesture | Native Alt-arrow word navigation and virtual-keyboard release-on-close safeguard | Adapt actual keyboard/trackpad identifiers; no macOS remapper required |
| Bar | Top; base font 14; 12-hour clock | Top; base font 16; 24-hour clock | Agents and Eye Breaks are menu-accessible, not persistent bar clutter |
| Login applications | Foot workspace 1, Chrome 2, LocalSend 5; Wispr also starts | Foot workspace 1, Chrome 2, LocalSend 5 | Runs on `hyprland.start`, not each config reload |
| Steam | ARM host launcher into muvm/FEX guest, guest D-Bus session, scale 3 | Not installed by intended state | Both have a harmless future main-window rule: fullscreen on an empty workspace; the rule does not install Steam |
| AirPods | LibrePods daemon/binaries present; exported Omapods widget absent | LibrePods plus Omapods widget present | Historical “installed on both” is not proof of present Mac widget availability |

Here “Mac” means the native Linux/aarch64 laptop role, not macOS; “rig” means the Linux/x86_64 workstation role. Earlier macOS client work belongs to a different environment. “Local” in Herdr means the machine hosting that client, not automatically either role. These role labels do not disclose or prescribe a live hostname.

**Sources:** profiles and current-state inventory; P27–38, P42, P75–79, P94–113; private review labels H4–H8.

## 2. Hyprland, display topology, session startup and windows

### Configuration loading and stock behavior

**Verified export.** `~/.config/hypr/hyprland.lua` bootstraps from `/usr/share/omarchy`, loads `default.hypr.omarchy`, then the user `monitors`, `input`, `bindings`, `looknfeel` and `autostart` modules, and finally `default.hypr.toggles`. Neither `omarchy_default_bindings=false` nor `omarchy_preinstalled_bindings=false` is active: both are commented examples. Therefore this is a set of overrides atop installed Omarchy defaults, not an independent full compositor configuration.

`looknfeel.lua` on both hosts contains commented examples, not an active custom layout, zero-gap, rounded-corner, dimming or animation override. The persisted toggle layer can still affect the live result. Historical reports of inner gap 5, outer gap 10 and border 2, or a no-gap toggle being undone, must not be mistaken for literal settings in this file. `Super+Shift+Backspace`/Mac Shift+Command+Delete is the gap-toggle reference; preserve unrelated input and theme settings. Historical visual observations are not fresh runtime measurements.

**Recreate:** install the appropriate current Omarchy Lua baseline, then restore these user modules and relevant saved toggles. Preserve default load order. Copying only `hyprland.lua` without its required helper modules is incomplete.

### Monitor and scaling settings

| Host | Verified configuration | History not to resurrect | Limitation |
|---|---|---|---|
| Mac | `monitors.lua`: `GDK_SCALE=2`; generic output preferred mode, automatic position and automatic monitor scale | No basis for forcing the rig's Samsung DP-1 modes onto the laptop | Automatic scale and real connected displays must be checked on the replacement Mac hardware |
| Rig | `GDK_SCALE=2`; generic preferred output scale 2; DP-1 `2560x1440@59.95`, position `0x0`, scale `1.666667`; a `HEADLESS-MOONLIGHT` rule still specifies `3024x1964@60`, automatic position, scale 2 | DP-1 disabled/headless-only 1440p120 configurations; 4K scale-3 fallback; old safe-mode fallback values; “canonical-good” rollback snapshots | A monitor rule is not proof an output exists. The rig headless-creation autostart is explicitly commented out because that output repeatedly crashed Hyprland on NVIDIA |

The rig's retained `HEADLESS-MOONLIGHT` declaration is **live-file/intended-state divergence**, not authorization to recreate the retired streaming topology. Do not uncomment `sunshine-display ensure`, restore an old `10-headless-output.conf`, or disable DP-1 during restoration. A future streaming requirement needs its own physical-output/encoder validation.

**Historical diagnosis:** disabling the physical DRM anchor while using a headless stream was associated with `GL_GUILTY_CONTEXT_RESET`, Hyprland SIGABRT, portal failures and safe-mode recovery. Other Sunshine failures were attributed to duplicate listeners, software encoding after NVENC/VAAPI failures and inaccessible cores. These were distinct incidents, not one verified root cause. The claimed roughly 65–67 FPS software path despite a 120-FPS request was not a fixed native encoder configuration. Dummy-plug and physical-anchor alternatives were recommendations, not installed devices. P17, P94–96; H1–H3.

### Startup and placement

**Verified export.** Both `autostart.lua` files register `hl.on("hyprland.start", ...)`: focus workspace 1, start `uwsm-app -- foot` on `1 silent`, `google-chrome-stable` on `2 silent`, and `localsend` on `5 silent`. The Mac additionally calls `o.launch_on_start("wispr-flow")`. The rig's old Sunshine-output creation is disabled. Discord-on-workspace-3 was an earlier request; it is **not** in the final startup hook. Configuration reload is deliberately not a new-login event.

**Important distinction:** startup directly invokes `foot`, whereas the primary shortcut invokes `omarchy-unified-terminal`. The rig's Bash generic auto-attach block then starts Herdr; the Mac's current Bash has no generic outer auto-SSH/auto-Herdr block. Thus the saved Mac login hook proves “Foot opens on workspace 1,” not “the unified Herdr launcher opens on login.” This is an explicit behavior difference, not a reason to reintroduce the retired auto-SSH block.

**Recreate:** restore the hook and install its real applications; authenticate Chrome separately. Avoid duplicate XDG/autostart entries and do not launch another batch of windows on every `hyprctl reload`. Existing app windows, workspace contents and running agent sessions are not portable saved state.

### Special windows and opacity

- **Wispr, Mac:** its `Flow Status Indicator` window is floated, made non-focusing/no-initial-focus/no-animation and moved silently to special workspace `wispr`, because the Omarchy bar plugin is the intended status surface. Its `Hub` window floats centered.
- **UxPlay, Mac:** class `^uxplay$` floats centered with width `monitor_h * 0.38`, height `monitor_h * 0.8`, no initial focus and full-opacity overrides. It is an iPhone display receiver, not phone remote control.
- **Steam, both:** class `^steam$`, title `^Steam$`, nonmodal main window is tiled/fullscreen on workspace `empty`. Login/update dialogs, friends and game windows are deliberately excluded. Static rules take effect at next matching window creation, not retroactively on reload. Rig rule presence does not establish a Steam installation.
- **Text to MD5, both:** `hypr.text-to-md5` floats and centers the installed Text to MD5 application class. Use the real installed application ID when constructing the anchored class regex; `<installed-text-to-md5-app-id>` is a documentation placeholder, not a literal setting or a renamed application.
- **Opacity, both:** `Super+backslash` uses stock `omarchy-hyprland-window-transparency-toggle`; `Super+Shift+backslash` invokes `~/.local/bin/omarchy-window-opacity-cycle`. The helper cycles 90%, 80%, 70%, then opaque. Strength is a property of the chosen window; switching opaque preserves the prior strength for the ordinary toggle. The export verifies the implementation, not the visual appearance of a current window.

The original Super+Backspace transparency use was displaced by the Files trash shortcut. Earlier visual-transparency claims were explicitly narrowed to a property-level result. Neither a generic all-window opacity rewrite nor a restoration of the old conflicting shortcut is warranted. P38–45, P79, P111; H5–H8.

### Night light, screen sharing and capture

`hyprsunset.conf` on both hosts has an identity profile at 07:00 so it does not tint the display by default; a 20:00/4000K profile and launch instruction are commented examples, not an enabled night-light schedule.

`hypr/xdph.conf` permits screencopy tokens by default and selects `hyprland-preview-share-picker`. The rig retains an obsolete Punktfunk comment around that same picker; the picker itself is not a retired application. Its user configuration and the portal/package baseline belong in the restore. Screen-sharing permission/session tokens are not proof of a permanent granted capture session.

The original rig capture contained four-modifier screenshot/record shortcuts naming retired helpers. The **final portable `bindings.lua` removes those calls**; see §10. This is an intentional retirement filter, not a replacement capture stack or a live desktop edit.

## 3. Keyboard, pointing, clipboard and IME

### Effective custom shortcut map

`Super` is Command on the Mac keyboard; `Alt` is Option. This table lists custom behavior, not every inherited Omarchy default.

| Shortcut | Machine | Saved action and boundary |
|---|---|---|
| `Super+Return` | Both | `~/.local/bin/omarchy-unified-terminal` |
| `Super+Ctrl+Return` | Both | Same native multi-machine Herdr launcher |
| `Super+Alt+Return` | Both | `~/.local/bin/omarchy-local-terminal`, never automatic SSH/Herdr/OMP |
| `Super+Backspace`, `Super+Delete` | Both | Send ordinary Delete only to an active, visible, mapped, input-accepting `org.gnome.Nautilus` window; Files decides whether focus means filename editing or trashing |
| `Super+backslash` | Both | Stock per-window transparency toggle |
| `Super+Shift+backslash` | Both | Custom 90/80/70/opaque cycle |
| `Super+Ctrl+M` | Both | Native Text to MD5 popup |
| `Alt+Left/Right` | Rig | Native Hyprland `send_shortcut` of Ctrl+Left/Right, repeating |
| `Alt+Shift+Left/Right` | Rig | Native Ctrl+Shift+Left/Right word selection, repeating |
| `Super+Alt+Ctrl+Shift+3/4/5` | Rig historical residual | Original live override called `punktfunk-capture screenshot/region/record`; final portable override removes these retired calls |
| `Super+semicolon` | Both IME | Explicit Fcitx Quick Phrase popup; not unconditional typed abbreviation expansion |

**Recreate:** restore `bindings.lua`, `word-navigation.lua` on the rig, `text-to-md5.lua`, and their actual executable dependencies. The Files handler intentionally checks focus and dispatches the application's ordinary action rather than deleting files itself. Word navigation uses complete compositor shortcuts rather than timer-based synthetic key-up bookkeeping. Do not install the old Hammerspoon/Karabiner remaps to obtain it.

**Historical gaps:** Chrome/Discord Ctrl+Tab and Ctrl+Shift+Tab investigation did not establish a durable cross-machine fix. Some inspections found no compositor conflict, others could not reach the compositor; extension shortcuts, selection interception and remote modifier loss remained hypotheses. Ctrl+number was explained, not rebound. No equivalent Mac `word-navigation.lua` is exported, so the rig's native override must not be advertised as verified on the Mac. Use a rig-first rollout followed by explicit operator approval before laptop application/testing, not speculative shortcut synchronization.

### Caps Lock, trackpad and virtual keyboard

**Verified export:** both `input.lua` files set `kb_options=""`, restoring normal Caps Lock rather than Compose/Shift-cancels-Caps options. Mac adds sensitivity **0.45**, `touchpad.natural_scroll=true`, and the native three-finger horizontal workspace gesture. Rig adds `input.virtualkeyboard.release_pressed_on_close=true` to release held modifiers when a streaming/virtual device disconnects. Rig's natural-scroll and gesture examples remain comments.

These Mac settings supersede earlier incremental sensitivity trials (0.2, 0.6, 0.5, 0.4) and the initial Chrome-only natural-scrolling proposal. The final saved natural-scroll override is global to the touchpad, not a browser-only inversion. Sensitivity 0.45 is a compositor setting, not an exact percentage increase in physical acceleration. LED state, finger recognition and physical Fn delivery require the actual keyboard/trackpad; no driver PR or media-key-first change is proven by these overrides.

**Retired experiment:** negative Chrome `scroll_mouse`/`scroll_touchpad` factors were rejected by Hyprland's minimum 0.01 and reportedly reverted byte-for-byte. Remote Punktfunk forwarded pointer/keyboard events rather than native multitouch finger counts, so native three-finger gestures could not be inferred from its remote input. Do not restore either the invalid negative rule or a remote-client finger-remapping proposal. P18–31, P75–79, P100–105.

### Clipboard, Quick Phrase and menu routing

**Verified export:** both Fcitx profiles use `keyboard-us`; `conf/clipboard.conf` clears its `TriggerKey` and `PastePrimaryKey`, avoiding competing IME clipboard popups. `conf/quickphrase.conf` sets Choose Modifier Alt and `[TriggerKey] 0=Super+semicolon`. Private quick-phrase data is not a generic restoration default and is omitted from this publication. The retained workflow is invoke the shortcut, release it, type an operator-defined abbreviation, and accept with Space. The old accidental backtick/semicolon trigger behavior is not the desired restoration.

Stock Omarchy clipboard behavior, observed in history, used Super+C/V translated to Ctrl+C/V, with terminal copy/paste variants, and **Super+Ctrl+V** for clipboard history. That is inherited behavior, not a new blanket Ctrl remap in the custom file. Foot's Mac-specific Ctrl+V addition is described in §6.

**Mac-only menu correction:** `~/.config/omarchy/extensions/omarchy-menu.jsonc` retains ID `trigger.share.clipboard` but explicitly sets parent `trigger`, label Clipboard history, action `omarchy-menu-clipboard`. The final location is **Trigger → Clipboard history**, not Trigger → Share → Clipboard history. File/folder/LocalSend sharing is not replaced. The rig export lacks this override and therefore retains its baseline menu behavior. Do not claim that a later both-machines policy retroactively applied this earlier Mac-only edit.

**Recreate and gaps:** restore safe Fcitx configuration/data and enable `omarchy-fcitx5.service` per the manifest. Clipboard history, recent pasted text and browser application profiles are not copied. Private personal snippets are user data, not generic default snippets for another person's machine. Popup operation and typing into a Wayland application require an actual graphical session. P33–35, P78–79, P113; H4–H5.

## 4. Shell bar, every captured plugin and menus

### Layout and stock widgets

**Verified export:** `shell.json` selects a nontransparent top bar, with `centerAnchor="omarchy.clock"`. `shell.toml` sets base font 14 on Mac and 16 on rig. Historical intermediate 12→14 changes and measured bar heights are not the final size contract for both machines.

| Region | Mac saved order | Rig saved order |
|---|---|---|
| Left | Menu, workspaces | Menu, workspaces |
| Center | Indicators, keyboard layout, Wispr Flow, system update | Keyboard layout, system update, Radio Atlas |
| Right | Tray, Radio Atlas, hidden-on-idle Agents, Omaplug, audio, Bluetooth, Tailscale, network, monitor, power, weather, clock | Indicators, tray, Omapods, hidden-on-idle Agents, Bluetooth, power, monitor, network, audio, weather, clock |

Mac clock format is `ddd d MMM h:mm AP`; rig is `ddd d MMM HH:mm`. Both have alternate date/week/year and vertical clock formats. The tray's chevron governs tray applications such as Wispr/1Password, not arbitrary Omarchy bar widgets. Removing a bar widget is not the same as quitting its background service.

The exported rig layout deliberately removes a live residual retired Punktfunk plugin. The presence of directories, manifests or a menu item alone does not prove the plugin is enabled or currently running.

### Third-party and cloned plugin matrix

All plugin paths below are under `~/.config/omarchy/plugins/`. Preserve authorized modified sources rather than blindly fetching upstream and losing local behavior. Recorded public repositories/revisions can guide reconstruction. `<local-namespace>.agents` and `<local-namespace>.input-watch` below are **documentation placeholders**: use each real installed plugin ID consistently in registration, layout and IPC/menu actions. These substitutions do not rename an installed plugin.

| Plugin | Current export / intended behavior | Recreate mechanism | Historical, retired or incomplete state |
|---|---|---|---|
| `akshar.radio-atlas` 0.1.9 | Both; bar registration exists, globe/radio panel with MPRIS integration, keepLoaded | Restore plugin source plus shell placement; upstream AksharP5/omarchy-radio-atlas | Actual station playback/network availability not exercised here; no account/library history inferred |
| `fkcodes.key-promoter` 0.1.0 | Mac source exists; service shows a shortcut when a menu action is used | Restore source; inspect plugin enabled state through Omarchy before claiming service activation | Historical user-success report exists, but current `shell.json` has no explicit plugin entry. Not present in rig payload; do not label both installed/enabled |
| `io.github.mcurtis.wispr-flow` 0.1.2 | Mac only; bar/service combination, hidden idle, microphone meter while listening, transcription indicator | Source/helper/scripts, configured center slot, native Wispr app and PipeWire; source mcurtis/omarchy-wispr-flow | Notetaker was unsupported; installation and meter simulation history are not proof of present speech-to-text success |
| `io.github.sirjul1337.lock-explorer` 1.7.7 | Both; service/overlay replaces cloned stock lock, `omarchy.lock` disabled and clone source restore registered | Restore source/design assets, plugin entry and disabled-stock-lock state together | Initial failed install later superseded by source/config presence. Do not enable two lock providers simultaneously |
| `io.github.tahler.eye-twenty` 1.0.0 | Both service entries enabled in config; **no persistent bar slot**; reminders retained | Restore modified Service.qml, plugin entry and Plugins menu controls | 20-minute repeating timer, 20-second normal notification; persistent active flag and IPC status/pause/resume/remind. A pause runtime state is not proof the service should be removed |
| `<local-namespace>.agents` 1.0.0 (placeholder) | Both cloned Agents panels; bar layout slot remains but `Panel.qml` explicitly has `visible: opened` | Restore authorized modified Panel.qml, assets and menu action using the real installed ID, not just shell.json | Its slot does **not** contradict “hide from bar”: panel is IPC-accessible without a persistent icon. Provider usage requires fresh authorization; no usage history/credentials transplanted |
| `omaplug` 1.6.5 | Mac source and bar registration; plugin-manager menu actions | Restore source and Mac menu extension | Rig source/registration absent. The generic Plugins submenu on rig is not proof Omaplug is installed |
| `io.github.thisisgm.omapods` 1.3.6 | Rig source and right bar registration; battery/listening controls, default hidden while disconnected | Restore source, `librepods`/`librepods-ctl`, installed user service, Bluetooth baseline | History claimed setup on both, but current Mac plugin tree/layout lack it. Mac daemon alone is not the widget. Pair/trust actual AirPods; no Bluetooth identity cloning |
| `aperture` 0.1.2 | Rig source retained, absent from active shell entries | Retain source only when restoring the observed source set; do not automatically enable | Reportedly installed for OMP attention, then intentionally disabled without stopping agents. No active widget/service may be inferred from `keepLoaded` in its manifest |
| `<local-namespace>.input-watch` 1.0.0 (placeholder) | Rig historical plugin source remains; absent from shell layout | Do not activate its recorder/recovery controls | Retired Punktfunk diagnostics; source presence is residue, not supported monitoring. Raw logs/native observers/recording state are not portable UX |

There is no captured custom Hyprshell/Hyprswitch visual app switcher. An icon-row Command+Tab proposal, cross-workspace remote cycling and Mac alert-dismissal experiments never establish a retained native plugin.

### Lock, idle, eye breaks and menu destinations

Both `shell.json` files set screensaver **150 seconds** and lock **300 seconds**. Mac Lock Explorer options explicitly select design `split`, unlock `fade`, boot `theme`, `bootResync=false`; rig explicitly sets `bootResync=false` but does not pin the design in the exported entry. The historical rig Greeting Card/card selection is not a verified current override. Disabling boot resynchronization was intended to stop repeated boot-theme administrative prompts while keeping lock-screen/desktop theme behavior; it is not disabling authentication or the lock screen.

The final state export additionally captures `~/.local/state/omarchy/toggles/screensaver-off` **on the rig only**. Therefore the 150-second configured interval must not be advertised as an active rig screensaver. Neither host's exported `toggles/hypr/flags.lua` contains an active toggle override; both are comment-only placeholder files.

Both payloads include the three lock videos `gruvbox-river.mp4`, `omarchy-eye.mp4`, `omarchy-storm.mp4`. Mac has a direct Lock Screen Explorer desktop entry and Style → Lock Screen action. Both have **Plugins → Agents** and **Plugins → 20-20-20 Eye Breaks → Remind me now / Pause reminders / Resume reminders**. Mac additionally has Plugin Manager and Lock Screen Explorer under Plugins. This supersedes history in which the Mac Plugins move was still pending.

**Recreate and limits:** restore source/config/menu together and keep default lock replacement bookkeeping. Authentication, PAM, boot theme generation and hardware bootloader settings belong to the fresh baseline. A plugin update can overwrite the hidden Agents panel or Eye Twenty IPC changes; the exported modified files are the restoration source. No actual lock/unlock or notification delivery was performed for this report. P18, P30–45, P79, P99–113; H4–H8.

## 5. Voice input: two different current stacks

### Mac: Wispr Flow, Fn and microphone

**Verified export:** the Mac package source records the unofficial ARM64 `wispr-flow-appimage` **1.0.3+wispr1.6.7-1**, with a retained fingerprint-reviewed recipe in `~/.local/share/wispr-flow-package`. The proprietary app tree is not vendored. Startup launches `wispr-flow`, the bar plugin is registered, and window rules suppress the redundant floating status indicator.

`/etc/keyd/omarchy-wispr-fn.conf` targets one full built-in keyboard device ID and maps **`fn = f19`**. This is a host/hardware-specific administrative override. The earlier vendor/product-only match inadvertently included the trackpad; the earlier **F20** mapping collided with `XF86AudioMicMute`. Both are failed experiments, not alternatives to restore. The intended Fn dictation behavior is the F19-backed mapping, not a rig Voxtype shortcut and not a macOS Karabiner rule.

**Recreate:** obtain the recorded Wispr build through its recipe, restore the plugin and startup/window configuration, review the physical keyd device ID, enable keyd only through the administrative stage, sign in to Wispr, and set its push-to-talk binding to match F19. The app's private profile is deliberately excluded, so copying the keyd file alone cannot restore the in-app shortcut/account. Confirm actual microphone selection and unmuted capture before dictation; mere appearance of the meter is insufficient.

**Microphone boundary:** check the selected input device, availability, mute state and gain before testing dictation. A device-specific gain or default-source choice is not a universal restoration constant. Fn detection, helper insertion, clipboard output and spoken tests establish different things; a visible meter alone does not prove transcription. Wispr Command Mode enablement is not established by the captured configuration.

A duplicate `wispr-flow://open` launch produced a reported Node native-addon shutdown SIGABRT while the first instance stayed alive. A truncated core prevented exact attribution; `node_sqlite3.node` presence was not proof of causation. There was no verified fix. Focusing the existing instance is not a reason to delete its data or disable the native app. P75, P77, P113; H5, H9–H10.

### Rig: Voxtype

**Verified export:** `voxtype-bin`, `voxtype.service` in enabled user services, `~/.config/voxtype/config.toml`, and the exact `~/.local/share/voxtype/models/ggml-base.en.bin` are captured. The configuration selects:

- state file `auto`; Voxtype's own hotkey listener disabled because compositor bindings own the trigger;
- default audio device, 16 kHz sample rate, maximum recording 60 seconds, pause MPRIS media during recording;
- Whisper `base.en`, language `en`, no translation;
- typed output, clipboard fallback enabled, 1 ms character delay;
- no recording-start/stop/transcription notifications.

**Recreate:** restore the config and model, install the package, enable its unit and establish a functioning real microphone/output typing path. No remote `punktfunk-mic` device should be recreated. Current custom rig `bindings.lua` does not contain the historical Fn/F9/F13 forwarding rules; inherited Omarchy voice shortcuts must be checked against the installed baseline. History described F9 hold and Super+Ctrl+X toggle, with multiple superseded Control-first-Fn and F13/F9 remapping experiments. Those old bridge-era mappings are not final custom bindings.

Voxtype's GTK4 OSD suffered reported Wayland/GTK DMA-BUF crashes during remote monitor changes. The dictation daemon and OSD were distinct processes; diagnosis did not prove the daemon stopped or fix the underlying compositor interaction. The rig model is intentionally included; recordings and meeting/transcription histories are not. P18, P75–79, P113; H2–H3, H9.

## 6. Foot and retained alternative terminals

### Foot: shared default surface, host-sized fonts

**Verified export:** `~/.config/foot/foot.ini` on both hosts imports `~/.local/state/omarchy/current/theme/foot.ini`, sets `term=xterm-256color`, JetBrainsMono Nerd Font, 14×14 padding, windowed startup, `workers=0`, 10,000-line scrollback, scroll multiplier **7.0**, block cursor and no blink. Mac font is **9**, rig **11**. The exported `foot.desktop` provides xdg-terminal argument capabilities and launches ordinary Foot.

Copy bindings: Ctrl+Insert, Ctrl+Shift+C, XF86Copy. Primary-selection paste is disabled. Both paste with Shift+Insert, Ctrl+Shift+V, XF86Paste; **Mac additionally Ctrl+V** for the Wispr Linux helper. This deliberately consumes the terminal's traditional quoted-insert Ctrl+V on the Mac. Existing already-running Foot processes may need a new window to consume changed configuration; persistent Herdr sessions need not be destroyed.

Both send distinct CSI-u sequences for Shift+Return (`ESC[13;2u`) and Alt+Shift+Return (`ESC[13;4u`), preserving TUI multiline input and legacy tmux split distinctions. The 7.0 multiplier controls scroll amount, **not** kinetic inertia.

**Recreate:** restore Foot config, the active Omarchy theme target/generation, desktop entry and the real font files/package. A copied config that points to a missing current theme is not a complete terminal restore. Exact current defaults and theme selection must be restored or generated separately from the generic package install.

### Kinetic scrolling and its native patch

Both `input.lua` files load `~/.local/share/hypr-kinetic-scroll/kinetic-scroll.lua`. The exported loader declaratively loads the architecture-specific `.so`, tolerates the namespace being absent on the first parse, configures **decel 0.96**, resets application rules, disables the default/global rule, and enables only **`foot`** and **`omarchy-unified-terminal`**. Both also apply `scroll_touchpad=1.5` to the unified app ID. The source/Makefile/header files accompany the binary.

Source inspection confirms direct events pass through, kinetic decay is separate, target changes can stop inertia, a new gesture stops existing decay, and there is a touchpad-contact callback. This corresponds to the reported stationary-touch-cancels-glide repair. Historical 0.92→0.96 and approximately 0.50→1.11 second measurements are reports, not fresh timing measurements. Earlier missing loader and the mistaken assumption that a custom app ID matched `foot` are superseded by the saved loader/rule.

**Recreate and gap:** the plugin must match the installed Hyprland ABI and CPU architecture. `tools/recreate.py` checks the installed `hyprland` package version against captured package-version provenance and refuses a mismatch unless `--allow-version-mismatch` is explicitly supplied. Hyprland itself is base-owned rather than blindly installed from this profile. Use a matching baseline; choosing the explicit override requires review and a manual rebuild from the exported source against that compositor. The installer does not promise an automatic arbitrary-ABI rebuild or hide load failures. Native plugin loading is session-impacting and must be coordinated. The plain local terminal has app ID **`omarchy-local-terminal`**, which is not in the two-entry allowlist: do not promise it the same inertia as the unified terminal. Browsers/Discord are not globally given synthetic inertia by this configuration. Old trial unload/rollback helpers are historical, not login startup dependencies.

### Alternative terminals and tmux are retained, not the primary launcher

| Component | Verified saved behavior | Restore / distinction |
|---|---|---|
| Alacritty | Both import current Omarchy theme; JetBrainsMono size Mac 9/rig 11; 14px padding, no decorations, xterm-256color, OSC52 CopyPaste; Insert copy/paste and both CSI-u Return encodings | Preserve configuration if retaining package; not evidence Alacritty is default |
| Ghostty | Both optional current-theme include; fonts 9/11; 14px padding, no close confirmation, block nonblinking cursor, `no-cursor,ssh-env` integration, Insert/CSI-u bindings, four-modifier arrow split resizing, mouse multiplier .95, epoll async backend | Keep as alternate; do not confuse its terminal widgets with Herdr panes |
| Kitty | Mac mainly current-theme include and examples. Rig actively sets font 11, 14px padding, no decorations/close confirmation, Insert bindings, nonblinking block cursor, no audio bell, bottom slanted powerline tabs and runtime Unix listener path | `allow_remote_control yes` is commented, so a listener declaration is not proof remote control is enabled |
| tmux | Both same retained config: Ctrl+Space plus secondary Ctrl+B; q reload, vi copy, mouse, RGB, current-cwd splits/windows/sessions, Alt-arrow/window navigation, numbered windows, 50,000 history, top transparent/default-color blue status line, basename-cwd auto-rename, CSI-u extended keys | Not removed from the computer; its former Super+Alt+Return Work wrapper is no longer the shortcut. Do not nest it around the new unified Herdr workflow |

P99–112; H4–H6. The older Oh My Posh uninstall or Herdr key reset is not the current state of these configs.

## 7. Herdr: topology, exact bindings and local escape hatch

### Native client and server roles

**Verified export:** both include architecture-specific `~/.local/bin/herdr`, exported Herdr 0.9.1 source under `~/.local/share/omarchy-local-builds/herdr-0.9.1/`, and `~/.config/herdr/config.toml`. The historical upgrade installed a compatible 0.9.1 client while retaining existing rig 0.9.0/default and Mac old 0.8.2/default servers, alongside a new Mac `local` server. Those historical process versions/sockets are not proof of current live processes and are not instructions to recreate obsolete daemon processes.

`omarchy-unified-terminal` clears inherited `HERDR_*`, disables generic Herdr autostart, selects session `local` on the Mac or `default` on the rig, and execs Foot with app ID `omarchy-unified-terminal`, title Herdr — Mac + Rig, and the explicit user-installed Herdr binary. Configure hostname-dependent branches for the target installation; example role aliases are not literal captured hostnames.

`~/.local/state/herdr/client/endpoints.json` stores backend definitions, while `endpoint-selection.json` stores the selected backend. Each client can select a local or authorized remote backend; the launcher's local server-session argument therefore does not by itself determine the initially visible backend. Use operator-defined endpoints such as the example roles `laptop-host` and `workstation-host`, not copied private selections. Provision SSH trust and authentication independently. Running sockets, histories, workspace processes and in-flight OMP sessions cannot be restored by copying configuration; an archived SSH check does not establish new-host connectivity.

Herdr hierarchy is **machine → workspace → tab → pane**. Workspaces/panes remain owned by their server. One client can switch machines but does not tile a Mac pane and a rig pane inside one server-local tab. The horizontal row is tabs in the selected workspace, not a configurable replacement for the workspace hierarchy. Theme/frame/sidebar are client-local; switching backend does not retheme the entire enclosing Foot window. “Local” refers to the client machine. The colored machine tokens label agent rows, not separate full-window palettes per endpoint.

### Shared and machine-specific UI

Both configs set onboarding false, terminal-palette theme, black custom panel background, follow-current-cwd new terminals, blue accent, no pane gaps/outer borders/scrollbars, no close confirmation, mouse capture, and a zoom+hostname tab-bar right area. Window title is `{hostname}: {workspace}`. `prompt_new_tab_name=true` retains an optional naming popup; Enter accepts a numbered default. Existing named tabs should not be renamed from their cwd by `hdl()`.

Sidebar agent rows contain state icon, bold machine, workspace, tab, then agent on a second row. Mac green is `#6ee7b7`, rig blue `#93c5fd`; Local receives the host-appropriate color. A blue online dot was not established to mean an error or pending update. Sidebar flicker was investigated but not reproduced/fixed; source/binary presence must not become a claimed flicker fix.

### Binding reference

Let **P** mean Ctrl+Space, then release it and press the next key. The following Mac mappings are explicit in the export; the rig intentionally has a much smaller override block.

| Action | Mac exported binding | Rig contract |
|---|---|---|
| Detach | P,d | P,q, inherited default; preserves server panes |
| Reload | P,q | Inherited default reload binding, historically P,Shift+r; not Mac q |
| Help / copy mode | P,? / P,[ | Installed defaults |
| New tab | P,c | Installed default P,c |
| Rename / close tab | P,r / P,k | Installed defaults differ; do not infer Mac map |
| Select tab | P,1..9 or Alt+1..9 | Same explicit override |
| Select workspace | P,Shift+1..9 | Same explicit override |
| Previous/next tab | P,p / P,n; Alt+Left/Right deliberately free | Installed defaults plus compositor word-navigation interaction |
| Split horizontal / vertical action | P,h or Alt+Enter / P,v or Alt+Shift+Enter | Installed defaults |
| Close / zoom / last pane | P,x or Alt+Esc / P,z / P,semicolon | Installed defaults |
| Focus pane | Ctrl+Alt+arrows | Installed defaults; avoid overwriting based on old failed remote chords |
| Resize pane | Ctrl+Alt+Shift+arrows; P,Ctrl+arrows enters resize mode | Installed defaults |
| Rename pane | P,Shift+o | Installed defaults |
| Move tab | Alt+Shift+Left/Right | Installed defaults; compositor-level word selection may consume this on rig |
| New/rename/close workspace | P,Shift+c / P,Shift+r / P,Shift+k | Installed defaults, not Mac mappings |
| Previous/next workspace | P,Shift+p or Alt+Up / P,Shift+n or Alt+Down | Not explicitly set in the rig override |

History describes P,g for the cross-machine hierarchy picker and P,w for online-machine workspace previews. These inherited capabilities are useful orientation, not added custom bindings. There is no observed dedicated indexed-machine override. Old advice saying Ctrl+B,q on every machine is superseded by the explicit Ctrl+Space configuration, and old advice saying q detaches the Mac is wrong for its current custom map.

### Patched keybinding popup and upgrade limitations

The exported local Herdr source contains the repair for a keybinding-help layout problem: long multi-binding resize labels wrapped across the description column in roughly 73-column layouts. Historical claims describe patched 0.9.1 builds on both architectures and isolated renderer/layout checks; those checks were not rerun here. Replacing the captured binary with a stock package/upstream update can lose this local UI repair. Preserve source, patch provenance and architecture, and rebuild intentionally rather than assuming the package named `herdr` is the patched executable.

A new client window is needed to use a replaced executable; indiscriminately restarting a server would destroy the preservation goal. Fresh restore cannot reproduce live process state, while in-place remediation should preserve existing sessions. Experimental handoff, forced server replacement and migration from Mac's old default server were investigated, not a blanket approved rebuild step.

### Plain local terminal

`omarchy-local-terminal` clears inherited Herdr variables, exports `HERDR_AUTO_START=0 OMP_AUTO_START=0`, and execs `foot ... bash --login` under app ID `omarchy-local-terminal`. It forces dark colors/full alpha: Mac background/foreground `10261e/e1f3e8`, rig `12243a/e1ecff`, fallback other-host `25212b/f0e8ff`; title `LOCAL — <hostname>`. The initial invalid Foot `colors` section was corrected to `colors-dark` and `main.initial-color-theme=dark` in the actual export.

This is a real outer shell, not a Herdr pane named Terminal and not an SSH session carrying a local-looking label. Detaching a directly launched Herdr client can close that Foot window; launching Herdr from this plain shell leaves a shell to return to. `exit` inside a pane closes that pane, not necessarily the remote connection/client. The local launcher opens an outer shell independent of the selected remote endpoint, without restoring automatic SSH.

**Sources:** actual launchers/configs, P35–38, P99–112; H4–H6. See §11 for runtime-profile restoration prerequisites.

## 8. Bash layout, prompts, themes and persistent refresh

### Shell startup and pane roles

**Verified export:** both `.bash_profile` files/source arrangement lead to Bash `.bashrc`; Omarchy's `env-bootstrap` is loaded before the noninteractive return, installed default Bash rc only afterward. Both retain enhanced Omarchy tooling/aliases and `l='ls'`. Mac explicitly prefers `~/.local/bin` for the compatible Herdr client. The old Mac auto-SSH-on-every-terminal block is absent.

Both implement `_herdr_split` and a role-aware `hdl()` override. For **`hdl omp` with no second AI**, the current pane becomes OMP, a bottom Terminal pane is split at ratio **0.85**, and OMP runs above a small plain shell; no editor pane is opened. Explicit other-agent or dual-agent layouts retain the editor-oriented branch. Tab names are not replaced with cwd basenames. Newly split Terminal panes receive `OMP_AUTO_START=0` and persistent role labels.

Interactive startup asks Herdr for the current pane's role. Editor starts the editor once; OMP starts OMP once; Terminal suppresses agent autostart. An unlabeled fresh one-pane tab uses `hdl omp`; an existing multipane/known layout is not blindly resplit. Guard variables prevent recursion/repeated starts. Existing already-running shell processes do not magically acquire a newly written `.bashrc`.

Rig additionally auto-starts/attaches Herdr in a normal interactive TTY shell when not already in Herdr and not opted out. Mac does not copy that generic block. Both local escape launchers opt out explicitly. The earlier requested CSH equivalent has no established implementation. An older bare `bash --noprofile --norc` comparison was a diagnostic bypass, not the desired everyday shell.

Rig also retains separate Zsh/Oh My Zsh configuration, git convenience functions/aliases, eza listing helpers and a Night Owl prompt preset. That retained alternative shell does not change the current Bash/Foot/Herdr default. It must not be used as a workaround for broken Bash theme refresh.

### Omarchy-driven OMP and Oh My Posh palettes

**Verified export:** both Bash configs initialize `~/.local/bin/oh-my-posh` with **`~/.config/oh-my-posh/omarchy.omp.json`**, enable native reload, and source `~/.local/share/omarchy-prompt-refresh/init.bash`. During Omarchy default-rc loading, TERM is temporarily `dumb` only when the Oh My Posh binary/config exists, suppressing competing Starship initialization, then restored including the originally-unset case. This is not permanently downgrading terminal capabilities or uninstalling Starship.

The shared theme mechanism consists of:

1. `~/.config/omarchy/themed/omp.json.tpl` and `oh-my-posh.json.tpl` generate files in the current Omarchy theme.
2. `~/.config/omarchy/hooks/theme-set.d/sync-agent-themes` validates both JSON files before publishing either, atomically copies OMP's generated palette to `~/.omp/agent/themes/omarchy-system.json` and the prompt to `~/.config/oh-my-posh/omarchy.omp.json`.
3. The hook calls `~/.local/share/omarchy-prompt-refresh/notify.py`.
4. Bash's exported native `redraw.so`/source enables idle-primary-prompt redraw via guarded SIGWINCH handling and process registration. It respects another pre-existing signal handler and only activates in interactive TTY/POSH contexts; it is not a daemon that injects typed input.

**Recreate:** preserve templates, hook, generated destination palettes, prompt-refresh source/binary and the correct architecture together. Generate/select the active Omarchy theme after installation. The hook expects both generated files; copying only a Night Owl JSON preset does not restore automatic synchronization. OMP's own theme-selection/watch behavior is covered in [agents and development](agents-development.md).

**Current selection versus history:** the final exported `~/.local/state/omarchy/current/theme.name` is **`retro-82` on Mac** and **`tokyo-night` on rig**. Both profiles now include the current theme files, generated OMP/Oh My Posh palettes and selected background bytes, closing the early missing-current-theme omission. The rig additionally has a full user `~/.config/omarchy/themes/tokyo-night` definition/assets. Earlier Mac Retro 82, Matte Black, Lumon and Tokyo Night reports are historical task outcomes, not authority to overwrite this current Retro 82 selection. Fixed Tokyo Night/Storm and Night Owl prompt experiments, including an early Oh My Posh removal, preceded the current generated approach. Reported rig Nord/light-theme round trips and later restoration were tests, not removal of the integration.

Old sessions sometimes failed to follow palette changes, and historical scrollback does not necessarily recolor like active widgets. Later prompt work claimed idle repaint without Enter/re-source and preservation of partial commands/cursor/running jobs; source confirms the mechanism but this report did not repeat the interaction. Existing clients may need one theme reselect/reopen to acquire a newer integration; that is different from restarting all server sessions. P18–19, P38–44, P99, P104–112; H4–H6.

## 9. Desktop tools, launchers and adjacent installed behavior

### Text to MD5

Both export `~/.local/bin/text-to-md5`, its desktop entry and `hypr.text-to-md5`. The Python GTK4 popup hashes exact UTF-8 text locally, displays lowercase digest and byte count, copies without trailing newline via `wl-copy`, offers Ctrl+Enter to Copy and Escape to close, and also supports `--text`/`--stdin` CLI modes. The clipboard subprocess discards inherited output descriptors and has a timeout, addressing the reported Copy-hang class rather than shell-interpolating user text. MD5 is for compatibility, not password/security use.

**Recreate:** Python, GTK4/PyGObject, wl-clipboard, script, desktop entry and Lua require/rule/binding together. Obtain authorized utility source separately; `<tools-root>/text-to-md5` is an example checkout location, not an observed private path. Keep launcher paths and the installed application ID consistent. Historical Mac automated GUI work stopped at a focus guard; subsequently reported manual success is not automation proof. No sample input/clipboard value is retained here.

### UxPlay, Steam, browser, file transfer and audio

- **UxPlay:** the Mac reference window rule supports a centered, non-focus-stealing iPhone display. Configure the intended receiver host explicitly. Same-LAN discovery, real phone approval and administrative firewall review remain prerequisites; source/recipe availability does not prove a picture appeared. UxPlay is not an Apple TV casting sender. See [system, applications and networking](system-apps-network.md) for receiver packaging/startup and actual network requirements.
- **Mac Steam:** `~/.local/bin/steam` executes `/usr/bin/muvm -- /usr/bin/dbus-run-session -- /usr/bin/env GDK_SCALE=3 STEAM_FORCE_DESKTOPUI_SCALING=3 /usr/bin/FEXBash ... bin_steam.sh -cef-force-occlusion -forcedesktopscaling 3`. The D-Bus session and scale are applied **inside the guest**, not only in the host environment. `steam.desktop` points at this wrapper. The runtime/rootfs/game/account prerequisites are not satisfied by the desktop rule alone. Do not install rig Steam simply because both hosts have its window rule.
- **Chrome/LocalSend:** captured startup specifies Google Chrome; the rig default-browser observation is `google-chrome.desktop`. Browser profiles, extensions, signed-in accounts and shortcuts need separate review rather than session transplantation. LocalSend startup is independent of any optional rsync-based transfer helper.
- **AirPods:** daemon-enabled state, real Bluetooth pairing/trust, a connected audio profile and the Omapods widget are separate facts. Historical insertion auto-pause/right-stem-click behavior and microphone defaults cannot be reconstructed from the widget's existence alone. Both have A2DP auto-connect WirePlumber rules; Mac has Apple audio no-suspend configuration as well. Hardware/audio details belong to [system, applications and networking](system-apps-network.md), not a guessed generic headset route.
- **Other launchers:** web-app and terminal/media/system desktop entries establish launch affordances, not native installations, account ownership or imported web sessions. A proposed messaging integration or startup rule is not evidence of an installed integration.

P17–19, P38–45, P75–79, P94–96; H5–H8. The [current inventory](current-state-inventory.md) and [system report](system-apps-network.md) cover package/application breadth beyond this domain's claims.

## 10. Retired and failed work: preserve the explanation, not the stack

| Historical component | What the evidence says | Final restoration decision |
|---|---|---|
| Headless NVIDIA workstation Sunshine streaming | Multiple 1440p120/scale/DP-1 configurations, disabled physical output, crashes/safe mode, duplicate Sunshine starts and software-encoder fallback | Retired as the everyday workstation path. Do not restore old output scripts/service drop-ins, launch duplicate Sunshine or treat a rollback folder as desired state |
| Native ARM Sunshine streaming to an authorized receiver | Separate reference use case, software H.264 and conservative 1080p30 guidance; historical streaming success reported | **Not the retired headless workstation stack.** Preserve authorized native-ARM service/package configuration; select the receiver explicitly and establish fresh pairing and hardware/network proof |
| Punktfunk Linux host/client | Canary versions and display multipliers 3 then 4; capture protocol/clipboard/microphone/firewall experiments; repeated stuck Super and stream reconnection problems | Explicitly retired. Do not restore host/client services, profile secrets or native capture automation |
| macOS Karabiner | Control-first Fn→F13 then F9 dictation mappings, repeat adjustments, Option-word navigation; approvals and physical checks uneven | Retired. Native Mac F19/keyd and rig native word navigation are different current mechanisms |
| macOS Hammerspoon bridge | Scoped Cmd+V whole-text paste bridge, SSH reuse, Cmd+W, Cmd+Space repair, Cmd+Tab/Shift+Tab and Cmd+Comma forwarding, paired-release/stream-focus guards | Retired. These were not generic global keybinding requirements; no old event taps or autostart restoration |
| Input Watch/held-key diagnostics | Native observer, recorder, Mac event tap, mask/ledger discrepancy handling, explicit recovery and private ring logs; partial disable/WAIT/reconnection failures | Disabled/retired. Retained widget source does not authorize recording, automatic key reset or revival of a missing native observer |
| Stop Stutter | Tray/no-Dock and AWDL/Boost suggestions; quitting behavior discussed; install completion unclear in some records | Explicitly retired. Do not apply AWDL or Wi-Fi workarounds to native Omarchy |
| Old capture shortcuts | Cmd+Shift+3/4/5 conflicted with workspace moves and triggered remote stuck-key issues; revised four-modifier Linux bindings remained in the source capture | Final portable override removes the retired helper calls; preserve normal/silent workspace moves without reinstalling the old capture stack |
| Negative per-Chrome scroll factors | Rejected by compositor minimum; rollback reported | Do not resurrect invalid inversion rules |
| Wispr F20 | Mapped to microphone mute, overbroad device-match trial also caught trackpad | Use the reviewed full-device Fn→F19 mechanism only on appropriate Mac hardware |
| Blanket new-terminal SSH / nested tmux Work | Made local/remote identity confusing and produced double status bars | Superseded by native Herdr profiles and the plain-local shortcut |
| Aperture | Installed attention panel/source, later requested reversible disable | Retain source/history without re-enabling scanning/panel/worker by inference |
| Fixed-palette prompt workarounds | Tokyo Night/Storm/Night Owl snapshots, temporary uninstall and source/reconnect advice | Superseded for Bash by generated Omarchy palette + native reload/idle redraw; retain alternate Zsh preset only as captured |

**Resolved portable retirement conflicts:** the original rig capture named `punktfunk-capture` in `bindings.lua` and retained Punktfunk host/client/pairing/status/recording menu actions. Final-generation portable files remove those executable references, and the exported active shell layout removes the retired plugin. Old `omarchy/rollback/sunshine-headless-*` and `shell.json.input-watch-backup` targets are absent from the final profiles. This is intentional export filtering, not a claim that live hosts were cleaned up. Retained inactive Input Watch source and the rig's disabled headless creator/declaration remain distinguishable from a working supported feature; none authorizes revival of the retired programs.

Other unresolved requests are not missing “must-install” components: a native icon-row Command+Tab switcher; Mac/Discord browser-tab diagnosis; media-first function keys/upstream PR; a CSH auto-attach equivalent; Command Mode enablement; iMessage Linux integration; automatic desktop control through Wispr; guaranteed fix for sidebar flicker; a never-stuck-keys guarantee. Neither generic documentation reads nor an assistant's completed task list establish those features. P17–45, P75–79, P94–113.

## 11. Restoration dependencies and known limits

### Ordered reconstruction

1. **Establish fresh machine baseline.** Correct architecture, hardware drivers, Omarchy/Hyprland Lua version, real monitors, user session, fonts and repository packages. Do not interchange Mac/rig native binaries or reproduce old kernel/DRM experiments.
2. **Restore safe files through the chosen profile.** Hyprland modules/helpers; Foot/Herdr/Bash config and launchers; plugin sources/layout/menu; Fcitx settings; theme templates/hooks/prompt refresh; model and permitted app/source assets. Respect modes, sanitization, versioned source and modified working-tree contents.
3. **Restore/generate nonsecret selection state.** Current Omarchy theme/background/toggles and terminal defaults are not interchangeable with generic configuration templates. Configure Herdr backend roles and selection intentionally, resolving authorized endpoints through freshly provisioned trust/SSH. Review explicit prerequisites rather than importing entire state directories or historical endpoint selections.
4. **Install architecture-bound and proprietary dependencies intentionally.** The Herdr/prompt/LibrePods binaries and kinetic-scroll `.so` have different architecture/ABI constraints. Wispr's recipe downloads the distribution; its account/settings are not included. FEX/muvm and Steam guest runtime need their real installation. Source trees alone are not installed systemd units.
5. **Enable only intended units.** Follow the final manifest's user/system lists. Fcitx both, LibrePods both, Voxtype rig, Wispr Mac via desktop startup; Mac Sunshine is separate from retired rig streaming. Administrative keyd/firewall settings need review. Never infer activation from a source manifest or copy a runtime socket/PID catalogue.
6. **Verify on the real desktop after installation, with coordination.** Check configured shortcuts, local escape identity, selected Herdr endpoint, new-tab naming/layout, theme changes, IME/clipboard behavior, real microphone/dictation, lock replacement and real monitor/trackpad behavior. These are future restoration acceptance checks, not claims this documentation task executed them. Disruptive compositor/plugin/service tests require explicit coordination; keybinding changes are rig-first with operator approval before laptop rollout. This policy does not authorize activity monitoring or assumptions about the operator's physical location.

### Concrete omissions, divergences and hardware/authentication gates

- **Endpoint/theme capture omissions were closed.** The reviewed profiles include `~/.local/state/herdr/client/{endpoints.json,endpoint-selection.json}`, `~/.local/state/omarchy/current/theme.name`, complete theme files/generated palettes and background bytes. The captured themes are Retro 82 on Mac and Tokyo Night on rig. Select backends for the new installation rather than copying private endpoint choices; fresh SSH trust remains a prerequisite.
- **Installed daemon-unit omission is closed.** Both final profiles include `~/.local/share/systemd/user/librepods.service`, not merely the plugin source-tree copy. This fixes the early rig enable-without-installed-fragment problem; Bluetooth pairing and a real audio profile remain hardware gates.
- **Mac Omapods source/registration and Key Promoter activation differ from history.** The current observed Mac has LibrePods but no exported Omapods widget. Key Promoter source exists without explicit shell registration. These are live/history divergences, not justification to claim successful automatic parity.
- **Retirement filtering is intentional.** Final portable bindings/menu entries omit retired Punktfunk commands rather than reinstalling the missing stack. The retained rig headless monitor rule must not reactivate its disabled creator, and inactive diagnostic source must not be treated as service enablement.
- **Voice restoration is not only package copying.** Wispr login/F19 in-app mapping is excluded private profile state; input permissions, keyd device match and actual microphone need setup. Voxtype's model is captured, but the correct live input device and compositor trigger must be verified.
- **ABI and local patch durability:** compositor updates can invalidate kinetic-scroll; Bash/readline changes can affect the loadable redraw helper; replacing Herdr with upstream can remove popup wrapping fixes. The installer refuses captured Hyprland-version mismatches by default. An explicit `--allow-version-mismatch` is a manual compatibility/rebuild decision, not evidence of automatic rebuild or safe plugin loading. Source and Makefiles are preserved for that work.
- **Mac startup and standalone inertia are deliberately limited observations.** Mac login hook starts plain Foot, not the unified launcher; the local escape app ID is outside the kinetic allowlist. Do not claim stronger parity than these saved paths implement.
- **Account and device state remains manual:** browser/Wispr/provider sessions, AirPods pairing, Sunshine/Moonlight pairing, iPhone consent, SSH host trust/Tailscale enrollment, actual display/output names, audio gain/default source and GPU encoding capability. No password/token/private-address transplant is a restoration mechanism.
- **Historical successes do not waive these gates.** Reported manual success, mocked shell tests, isolated Herdr sessions, successful configuration reloads and clean `configerrors` prove different things. None proves a replacement machine's physical keyboard, microphone, rendering and paired-device paths.

## 12. Evidence locator guide

### Reviewed artifact categories (not supplied here)

- `profiles/mac.json`, `profiles/rig.json`: source→destination maps, packages, installed service plan, architecture, source revisions, exclusions and prerequisites.
- `reports/current-state-inventory.md`: collector coverage, final export policy and per-machine differences.
- `payload/<profile>/home/.config/hypr/`: actual load order, input, monitor, keybindings, autostart, window rules, screen-share picker and night-light overrides.
- `payload/<profile>/home/.config/omarchy/{shell.json,shell.toml,extensions/omarchy-menu.jsonc,plugins/}`: full layout, menus, plugin registration, modified widget/service code.
- `payload/<profile>/home/.config/{foot,herdr,alacritty,ghostty,kitty,tmux,fcitx5}/`, `.bashrc`, `.bash_profile`, `.local/bin/omarchy-{local,unified}-terminal`: terminal/input saved state.
- `payload/<profile>/home/.local/share/{hypr-kinetic-scroll,omarchy-prompt-refresh,omarchy-local-builds/herdr-0.9.1}/`: local native behavior and rebuild source.
- Mac `payload/mac/etc/keyd/omarchy-wispr-fn.conf`; rig `payload/rig/home/.config/voxtype/config.toml` and `.local/share/voxtype/models/ggml-base.en.bin`: distinct voice mechanisms.

### Historical locators

Historical reference labels identify private review records. Exact session identifiers, personal paths, timestamps, and transcript line locators are intentionally omitted from this public copy.

All 52 packets were processed, including duplicate handoffs, failures, inspection-only records and cross-domain items. No claim was promoted solely because an archived assistant marked its own task complete. Where the final files contradict a reported historical outcome, this report names that discrepancy instead of restoring the historical experiment.

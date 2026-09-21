# Final state and reconstruction map

## What this repository represents

The target is the **current intended Omarchy experience**, reconciled against available historical evidence, not a replay of every past command. Two profiles are necessary: Apple-Silicon Mac and x86_64 rig differ in hardware, voice input, installed applications, runtime versions and service state.

Every exported file and package is enumerated in `profiles/mac.json` or `profiles/rig.json`. Those manifests are the complete machine-readable inventory; the domain reports below explain behavior and historical decisions. They separate observed configuration, previously reported tests, failed experiments, retired components and fresh-machine prerequisites.

## Report index

- [Evidence coverage](evidence-coverage.md): both-host source counts, time ranges, exhaustive narrative-review method, non-chat evidence and unavailable logs.
- [Supplemental history](supplemental-history.md): project-local/regression sessions and otherwise-unseen prompt-history requests, with outcomes kept distinct from commands.
- [Current-state inventory](current-state-inventory.md): every immediate configuration-directory and custom executable decision, package/service inventory and export exclusions.
- [Desktop, input, voice and terminal](desktop-input-terminal.md): keybindings, clipboard/IME, shell/plugins, windows/displays, dictation, Foot/Herdr and retired input/remote stacks.
- [Agents and development environment](agents-development.md): OMP versions/settings/instructions, CLI wrappers, MCP integrations, skills, custom binaries and source provenance.
- [System, applications and network](system-apps-network.md): installed software, routing/firewall/SSH/Tailscale, Bluetooth/audio/power, services and machine-use history outside OMP.
- [Native backup findings](native-backup.md): what Omarchy snapshots do and do not protect.
- [Verification](verification.md): exercised reconstruction scenarios and untested clean-machine boundaries.
- [Privacy audit](privacy-audit.md): removed raw-history fixtures, hash-bound source/debug-key exceptions and publication limits.
- [Operating instructions](../README.md): plan, one-run application, isolated rehearsal, verification and backup locations.

## High-impact current behavior

| Area | Mac | Rig |
|---|---|---|
| Base | Apple-specific aarch64 Omarchy/Asahi environment | x86_64 Omarchy |
| Default terminal | Foot launching Herdr directly | Foot launching Herdr directly |
| Bare terminal | `Super+Alt+Return`, no Herdr/OMP autostart | Same intended bare-terminal behavior |
| Herdr prefix/detach | `Ctrl+Space`, then `d`; reload moved to `q` | `Ctrl+Space`; detach remains default `q` |
| Login workspace launch | Foot 1, Chrome 2, LocalSend 5; Wispr retained | Foot 1, Chrome 2, LocalSend 5 |
| Voice | Wispr Flow; account/hardware setup separate | Voxtype with captured English base model |
| Agents / 20-20-20 | Plugins menu; no persistent bar icons | Same intended behavior |
| Steam | FEX/muvm launcher with guest D-Bus and scale 3 | Not installed at capture; matching window rule present only |
| Steam main window | Fullscreen, tiled, empty workspace rule | Rule only; no rig runtime claim |
| AI runtime | Captured current executable and YAML; auto-update wrapper behavior documented | PATH-priority local executable distinguished from mise-selected version |
| Retired stack | Do not restore Punktfunk/Karabiner/Hammerspoon/stop-stutter | Same; stale live remnants excluded from portable intended state |

This table is an orientation, not the inventory. See the domain reports for the remaining components and exact payload paths. A startup configuration check is not a completed reboot test; a Steam guest D-Bus fix is not proof that every separate CEF/FEX crash is solved.

## Reconstruction boundary

The installer overlays an **already installed compatible Omarchy base**. It does not transplant disk layout, bootloader, machine identity, private keys, authentication stores, browser sessions, recordings, personal research or unrelated private projects. New-machine enrollment and login remain separate because copying those credentials is neither necessary nor safe.

One command orchestrates the reviewed software/configuration steps. Architecture-specific packages/assets and source recipes preserve the different machines' behavior. Required network parameters are supplied for the destination; existing credentials and old interface identities are not guessed. Services are enabled/disabled without starting them immediately, and desktop activation is deferred to a user-controlled logout/login.

An exact offline image is **not** provided: repository/AUR availability, upstream downloads, package hooks, hardware and authentication remain external dependencies. Captured package versions and binary hashes establish provenance; they do not make rolling repositories immutable.

## Deliberate exclusions and live/intended differences

Historical rollback files, obsolete patch backups and retired commands are not activated merely because they remain on disk. Safe plugin source may be preserved without claiming the plugin is enabled. A daemon and its optional bar widget are separate components. Private project workload units are inventoried but not enabled as part of desktop reconstruction.

The profiles' `exclusions`, `prerequisites`, `notes`, source metadata and per-file sanitization metadata record those choices. Unreadable privileged logs/helpers, missing tools and hardware-specific prerequisites remain explicit rather than being filled with fake fallbacks.

## Publication status

This public repository contains sanitized documentation only. The earlier reconstruction bundle, executable payload, machine-readable profiles, and raw evidence are not included. References to their contents describe the original capture and do not promise that those files are available here. See the [publication privacy review](privacy-audit.md) and [repository guide](../README.md).

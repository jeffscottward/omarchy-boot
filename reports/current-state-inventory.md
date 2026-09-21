# Current state inventory

This is a **reference inventory derived from an earlier read-only capture**, not a live host/service map. It describes managed reconstruction inputs and exclusion policies, not every application profile found on a source computer. A captured component is not automatically intended for restoration, and hardware identities cannot be cloned.

**Laptop** denotes the Apple Silicon/Asahi aarch64 profile; **workstation** denotes the x86_64/NVIDIA profile. `laptop-host`, `workstation-host` and optional `other-os-host` are **example role aliases**, not observed hostnames. The separate local bundle used `mac` and `rig` as profile/path labels. References to its payload, manifests, recipes and installer describe that earlier reconstruction; those assets are **not included in this documentation-only repository**.

The complete source inventory and its original locations are retained privately. The earlier capture did not modify source files and used a read-only export method. This public report does not enumerate private profiles, original metadata or evidence locators.

## Export and exclusion policy

- Preserve reviewed user overrides, source plugins and licenses, terminal/shell tooling and architecture-specific unmanaged binaries. Rebuild dependencies from reviewed manifests rather than copying generated trees.
- Exclude version-control history, caches, command/application histories, historical backups and experimental rollback copies. Their dates, suffixes and locations are not reconstruction inputs.
- Exclude private application profiles, account databases, browser state, clipboard data, device pairing, network identity, credentials and runtime process state. Their presence on any source computer is not catalogued here.
- Original paths, modification times and source checksums stay private. Sanitized payload checksums describe sanitized bytes. Home/user/host-role placeholders are `{{HOME}}`, `{{USER}}` and `{{HOSTNAME}}`; configure peer aliases deliberately for the new environment.
- Clear credential fields in supported structured configuration; exclude whole credential-bearing or unreviewed files rather than assuming partial redaction is sufficient. Review source dependencies privately before rebuilding. No private source/test filenames or exclusion IDs are needed for public reconstruction.
- Distinguish selected enablement from disabled, masked, baseline and transient units. Unit/plugin presence alone does not establish activation or working behavior.
- Retired Punktfunk/Karabiner/Hammerspoon/stop-stutter components and obsolete headless/input-repair experiments are not install or activation inputs.
- Package selection excludes base/hardware/kernel/firmware/Omarchy components that must come from a compatible destination baseline. “Foreign” does not mean “available from AUR”; verify provenance and availability.

## Profile baselines

| Reference profile | Recorded Omarchy version | Architecture and compatibility boundary |
|---|---|---|
| Laptop | `4.0.4-mac.1` | Apple Silicon aarch64, matching Asahi graphics/audio/speaker-safety baseline |
| Workstation | `4.0.3-1` | x86_64, matching GPU/kernel/firmware baseline |

These are captured versions, not a claim that installing an arbitrary current release reproduces every ABI or runtime. Do not interchange local binaries, drivers, boot configuration or Hyprland native plugins. Complete package records are separate reconstruction inputs; package totals and source metadata are not published as a personal software fingerprint.

## Intended reference service selection

This table documents reconstruction choices, **not actual running services, reachability or source-host security posture**. Review all destination units, authentication and firewall scope before activation.

| Scope | Both profiles | Laptop | Workstation |
|---|---|---|---|
| Selected user units | `bt-agent.service`, `librepods.service`, `omarchy-fcitx5.service` | `app-dev.lizardbyte.app.Sunshine.service`, `omarchy-tailscale-receive.service` | `omarchy-rgb-off.service`, `voxtype.service` |
| System units, administrative review required | `cups.path`, `avahi-daemon.service`, `bluetooth.service`, `cups.service`, `NetworkManager.service`, `sshd.service`, `tailscaled.service`, `ufw.service`, `avahi-daemon.socket`, `cups.socket`, `docker.socket` | `keyd.service` | Root `omarchy-rgb-off.service` requires separate hardware review |
| Not login-enabled | `uxplay.service`; `docker.service` is socket-activatable | — | `app-dev.lizardbyte.app.Sunshine.service`, `omarchy-tailscale-receive.service` |

Native PipeWire/WirePlumber, compositor/portal/UWSM and hardware services retain their destination baseline/session relationships. Do not clone every observed mask or transient scope. An inactive completed oneshot is not automatically a failure. Selecting a service does not prove first-login, reboot, pairing or end-to-end application behavior.

## Managed configuration coverage

The following table retains supported configuration locations without listing excluded private-profile directories or historical backup filenames. Paths are beneath `~/.config/` unless shown otherwise. “Both” describes selected safe configuration in both reference profiles, not equal contents. All subtrees still require file-level exclusion review; a managed parent is never permission to copy an entire application profile.

| Managed path | Profile coverage and boundary |
|---|---|
| `AirPodsTrayApp` | Laptop safe configuration; workstation directory was link-only/empty, not an additional restored profile |
| `Omacom` | Both; reviewed safe configuration only |
| `OpenRGB` | Workstation; device selection and permissions require hardware review |
| `alacritty` | Both; selected terminal configuration, not default-terminal proof |
| `autostart` | Both; laptop and workstation declarations differ |
| `btop` | Both |
| `chrome-flags.conf`, `chromium-flags.conf` | Both; browser profile data excluded |
| `fcitx5` | Both; selected configuration, no historical backup archives |
| `fex-emu` | Laptop link-only/empty directory; runtime/rootfs dependencies must be restored separately |
| `foot` | Both; selected default terminal |
| `ghostty` | Both; alternate terminal configuration |
| `git` | Both; sanitized configuration, not credentials or account authorization |
| `gtk-3.0` | Both |
| `gtk-4.0` | Laptop link-only/empty directory; not additional exported settings |
| `herdr` | Both; profile-specific bindings and startup selection |
| `hypr` | Both; target monitor/input identifiers and compositor ABI require review |
| `hyprland-preview-share-picker` | Both |
| `imv`, `kitty`, `lazygit` | Both |
| `mimeapps.list`, `mise` | Both; application/runtime selection, not authenticated state |
| `mpv`, `nautilus` | Link-only/empty configuration directories; review links/dependencies rather than assuming exported settings |
| `nvim` | Both; compatible `omarchy-nvim` baseline and dependencies required |
| `obsidian` | Both; safe preferences only, not vault contents |
| `oh-my-posh` | Both; configuration and selected user binary are distinct from package presence |
| `omarchy` | Both; profile-specific plugin/layout assets and licenses |
| `omp-notify` | Both; destination and prior delivery-verification state cleared |
| `opencode` | Both; sanitized configuration, no provider credentials |
| `pavucontrol.ini` | Laptop safe preferences; actual output requires target selection |
| `starship.toml` | Both |
| `sunshine` | Both; safe `sunshine.conf`/`apps.json`, not credentials, certificates or pairings |
| `systemd` | Both; selected user units, not every observed service state |
| `tmux`, `user-dirs.dirs` | Both; destination home paths must resolve correctly |
| `voxtype` | Workstation safe configuration and recorded model dependency |
| `wireplumber` | Both; laptop additionally has Asahi-specific audio overrides |
| `xournalpp` | Both; safe configuration, not documents |
| `yay` | Link-only/empty config directory; reviewed source recipes are separate inputs |
| `~/.muttrc` | Workstation sanitized NeoMutt TLS/authenticator/editor/cache preferences; identity and SMTP authentication are manual |

Empty/link-only entries are not claims of a running or selected application. Source configuration directory presence alone cannot establish application installation or account use. Consult [desktop/input reconstruction](desktop-input-terminal.md), [agents/development reconstruction](agents-development.md) and [system/applications/network reconstruction](system-apps-network.md) for functional behavior and dependencies.

## Current executable coverage

Entries below are names beneath `~/.local/bin/`. “Script” and “binary” describe the earlier selected export route, not an assurance that an isolated executable works without its dependencies. Historical copies, generated caches and retired helpers are covered by the general exclusion policy rather than individually identified.

### Scripts selected in both profiles

| Executable | Reconstruction boundary |
|---|---|
| `claude`, `codex`, `copilot`, `crush`, `cursor-agent`, `gemini` | Restore reviewed CLI/runtime dependencies; authenticate selected tools anew |
| `gh`, `ghui`, `grok` | Restore reviewed dependencies; no account authorization implied |
| `hermes`, `hunk`, `hyperresearch`, `muse` | Source/runtime dependencies remain required; no private workload state |
| `omarchy-local-terminal`, `omarchy-unified-terminal` | Preserve profile-specific local/remote terminal behavior; configure example peer roles for the destination |
| `omarchy-window-opacity-cycle` | Desktop/compositor integration requires compatible target configuration |
| `omp-notify` | Fresh private destination and manual delivery verification required |
| `opencode`, `pi`, `playwright` | Restore reviewed runtime dependencies; no credentials or browser-session state |
| `text-to-md5` | Local utility, not a background service |

### Architecture-specific binaries and differing entrypoints

| Executable | Laptop profile | Workstation profile |
|---|---|---|
| `herdr` | Architecture-specific binary | Architecture-specific binary |
| `librepods`, `librepods-ctl` | Architecture-specific binaries | Architecture-specific binaries |
| `oh-my-posh` | Architecture-specific binary | Architecture-specific binary |
| `omp` | Script entrypoint | Architecture-specific binary |
| `age`, `age-keygen` | Not listed as selected local binaries | Architecture-specific binaries; keys are not included |

### Profile-specific scripts, links and runtimes

| Executable | Profile and decision |
|---|---|
| `steam` | Laptop script; FEX/muvm/rootfs and compatible graphics baseline required |
| `playwriter` | Laptop dependency/system link; destination prerequisite, not an isolated vendored runtime |
| `agent-reach` | Workstation script |
| `blender` | Workstation link to reviewed user-installed x64 distribution, not a pacman package |
| `graphify`, `graphify-mcp` | Workstation scripts; dependency restoration required |
| `hpr` | Workstation script |
| `omarchy-rgb-off`, `omarchy-rgb-switch` | Workstation scripts; local lighting only, target hardware review required |
| `python3.12` | Workstation executable recreated through the recorded uv-python runtime source |
| `teleport` | Workstation legacy SSH/rsync helper; fresh private pairing required, no automatic activation |

The obsolete `sunshine-display` headless helper, retired Punktfunk command family and historical rollback/backup commands are **not active reconstruction requirements**. Keep current executables distinct from similarly named historical copies. Local ELF binaries and Hyprland `.so` plugins are architecture/ABI-bound; rebuild native plugins against the installed compositor when its ABI changes.

## Destination prerequisites and evidence gaps

| Requirement | Action |
|---|---|
| Fresh architecture baseline | Install compatible Omarchy/Asahi or x86_64 hardware baseline. Do not transplant bootloader, kernel, GPU, firmware, storage, login-security or identity state. |
| SSH and Tailscale | Enroll afresh, provision keys and host trust, and configure example `laptop-host`/`workstation-host` aliases consistently. Use key-only SSH and separate identities for separate OS installations. |
| Accounts and secrets | Authenticate selected browser, password manager, AI and developer tools independently; no account-provider association or previous authorization is implied. |
| Mail | Provision mail identity and SMTP authentication privately; create appropriate cache/certificate paths and restrict destination configuration permissions. |
| Notifications | Provision a fresh private destination/subscription. Cleared topic and old verification state cannot establish delivery; test manually. |
| `LAN_CIDR` | Supply the destination trusted-network scope for selected SSH, discovery, AirPlay and Sunshine access. |
| `DOCKER_DNS_ADDRESS` | Supply the destination resolver for applicable UDP 53 firewall rules. |
| `ROUTE_INTERFACE` | If using dual-interface source routing, supply the actual Wi-Fi interface and check routing table 2018 / priority 12018 ownership for collisions. |
| Firewall review | Inspect effective destination UFW rules and any `before.init`/`after.init` hooks with authorized administrative access; saved files alone are not proof of effective policy. |
| Root RGB review | Before enabling root `omarchy-rgb-off.service`, verify I2C modules, actual OpenRGB device selection, NZXT USB IDs and permissions. No fan/pump/thermal changes are required. |
| Input/monitors/audio | Configure real target displays, keyboards and audio devices. `/etc` keyd and other hardware overrides need review before activation. |
| Architecture and ABI | Rebuild native compositor plugins as needed; preserve source/license provenance and compatible runtimes. Proprietary application trees are not vendored. |
| Source dependencies | Credential-bearing or unreviewed development files are excluded. Review dependencies privately before rebuilding; do not mistake an incomplete source subset for a reproducible build. |
| External acceptance | Verify first login, runtime selection, audio, Bluetooth, approved file transfer, deliberate streaming and any boot-time behavior on the actual target. |

The earlier capture did not establish complete tool-manager and effective-firewall coverage. Recheck applicable Flatpak, pipx, uv, Cargo and Rust toolchain inventories on a reconstruction target rather than interpreting missing observations as absence. Private diagnostics and permission history are not published. No fresh runtime or firewall verification is claimed by this inventory.

## Intent differences and reconciliation

- The laptop selects Wispr Flow and Asahi/FEX/Steam-specific components; the workstation selects Voxtype and hardware-reviewed GPU/RGB components. Do not force symmetry.
- Both use Omarchy Lua overrides, foot/Herdr terminal roles, themed terminal configurations and selected agent/lock-explorer/eye-twenty plugins. Restore reviewed configuration rather than isolated recent changes.
- Login layout opens foot, Chrome and LocalSend on designated workspaces. The laptop additionally starts Wispr Flow; workstation voice input uses a Voxtype unit. First login/reboot remains a destination acceptance step.
- The terminal configuration uses the generic session names `local` for the laptop profile and `default` for the workstation profile. These are runtime configuration names, not private conversation/session identifiers. Destination hostname selection and SSH peer roles must be configured consistently.
- Retired Punktfunk bindings, launcher entries, shell-layout references and tagged streaming firewall blocks are excluded. Review the resulting firewall for intended scope and valid structure; no statement about source-host residual rules or cleanup is made here.
- The obsolete headless monitor rule is excluded because that topology was associated with NVIDIA compositor failures. Preserve appropriate physical-display settings, with actual target identifiers.
- The recorded Voxtype `base.en` model is a runtime input; meetings and recordings are excluded. Large assets may require separate artifact storage or Git LFS in a private reconstruction bundle; this public repository contains reports, not those assets.
- Selected JetBrains Mono basic fonts and their OFL license replace reliance on an unavailable foreign font-package route; preserve the reviewed font files/license when assembling reconstruction inputs.
- Locally patched components can lose behavior on normal upstream updates. Source directory presence does not prove the selected executable uses a patch; verify actual runtime selection and behavior.
- Source package-manager versions and reviewed dependency manifests govern rebuilding. Generated dependency trees are not vendored. Restore required dependencies before starting MCP servers or plugins.

## System overrides and defaults

Review relevant NetworkManager, SSH, firewall, keyd, udev, modprobe, sysctl and systemd overrides rather than cloning all of `/etc`. Unchanged package defaults are not custom payload. Hardware, boot, login, security and identity paths remain exclusions or manual-review inputs. **Never overwrite `fstab`, `crypttab`, `machine-id`, SSH host keys, firmware or bootloader state from another machine.**

The private reconstruction manifests retain file-level decisions; this report intentionally replaces private-profile presence, dated backups, source-file exclusions and history locators with general policies. Captured configuration and reported outcomes remain distinct from verified target behavior. Publication sanitization performed no builds, tests, linters, formatters or live-system changes.

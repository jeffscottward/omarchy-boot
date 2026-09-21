# System, applications, network and recovery reconstruction

## Reading this report

This is a **reference configuration derived from an earlier capture**, not a live network map or an instruction to replay private conversations. Package records, selected configuration and historical reports informed the reconstruction. Captured files take precedence over abandoned plans; neither a package nor an enabled unit proves end-to-end operation on a new target.

- **Laptop** means an Apple Silicon/Asahi aarch64 Linux reference profile; **workstation** means an x86_64/NVIDIA Linux reference profile. `laptop-host`, `workstation-host` and optional `other-os-host` are **example role aliases**, not observed literal hostnames or DNS records.
- **Captured** identifies stored-state evidence from the earlier review. **Reported** identifies a historical outcome that was not independently re-tested for publication. Generalized network and service recommendations below are reference requirements, not claims about a source machine's current security posture.
- Paths such as `payload/mac/...` and `payload/rig/...` describe the separate local bundle's laptop and workstation profile labels. `home/...` resolves beneath the destination user's home; `etc/...` denotes system overrides requiring administrative review. That payload, its profile manifests and installer are **not included in this documentation-only repository**. Do not copy architecture-specific binaries between profiles.

See [desktop/input reconstruction](desktop-input-terminal.md), [agents/development reconstruction](agents-development.md), [current-state inventory](current-state-inventory.md) and [native backup findings](native-backup.md) for the companion requirements.

## 1. Reference platform and access design

| Component | Laptop profile | Workstation profile | Reconstruction boundary |
|---|---|---|---|
| Base platform | Omarchy `4.0.4-mac.1`, aarch64 Apple-specific baseline in the capture | Omarchy `4.0.3-1`, x86_64 baseline in the capture | Install a compatible hardware/architecture baseline first; these reports are not an OS image. |
| Desktop | Local Hyprland, trackpad, Chrome and foot/Herdr | Independent native desktop, optionally used for remote computation | Check destination and graphical session before administration. |
| NetworkManager | Reference `wifi.backend=iwd` override | Optional dual-interface source-routing hook below | Wi-Fi credentials and device/network identity are not portable. |
| Tailscale and SSH | Fresh enrollment and host/client trust | Fresh enrollment and host/client trust | Configure example role aliases for the new environment; do not reuse identities. |
| File transfer | LocalSend or SSH/SFTP | LocalSend or SSH/SFTP | Preserve approval and authenticated transport; no plaintext FTP service is required. |
| Streaming/input boundary | Native local input; Sunshine is an optional selected profile component | No automatic headless streaming topology | Punktfunk, Karabiner, Hammerspoon, stop-stutter and obsolete input-recovery bridges are excluded. |

### SSH and Tailscale restoration

A reconstruction may use sanitized `home/.ssh/config` and `etc/ssh/ssh_config.d/20-omarchy-keepalive.conf`, but peer routes and trust must be provisioned independently. Use the example aliases `laptop-host`, `workstation-host` and, only if needed, `other-os-host` consistently across clients. Aliases do not establish DNS or mDNS registration. Separate OS installations on one physical device require separate host-key identities.

Use key-only SSH: review server settings including `PasswordAuthentication no` and `KbdInteractiveAuthentication no`, authorize fresh public keys, and verify access before closing the administrative session. Do not resolve a timeout by weakening host-key checks, copying host identities or enabling password authentication. Reachability, key exchange and authentication are distinct checks; verify access from each intended client without publishing its profile or endpoint.

Permanent reverse tunnels, a Teleport infrastructure service, router reservations and other-OS configuration are not required by this reference. Do not treat a historical troubleshooting proposal as a deployed dependency.

### Optional dual-interface return routing

On a destination with Ethernet and Wi-Fi, asymmetric routing can send replies over a different interface from the incoming connection. Diagnose the route policy before changing authentication. The reviewed reference hook is:

`payload/rig/etc/NetworkManager/dispatcher.d/90-wifi-lan-source-routing`

It handles `up`, `dhcp4-change`, `reapply` and `down`, reads current IPv4 interface addresses, reconciles source-and-local-network rules and removes stale entries. It uses routing table **2018** and priority **12018** without replacing the ordinary default route or overlay-network rules. Supply **`{{ROUTE_INTERFACE}}`** for the destination Wi-Fi interface and review table/priority ownership for collisions before activation. DHCP-aware subnet handling does not eliminate hardware/network review. This optional workstation component is not a universal laptop requirement; verify the actual client path after applying it.

### Firewall and discovery

UFW and `ufw-docker` are reference components. `LAN_CIDR` and `DOCKER_DNS_ADDRESS` are destination parameters. Saved configuration is not proof of an effective firewall; perform an authorized rule review on the new target and preserve working access while changing it. The table lists protocol needs, not source-host exposure or an instruction to open every port.

| Feature, if selected | Protocol requirements | Restoration boundary |
|---|---|---|
| LocalSend | TCP/UDP 53317 | Review and scope access to the intended network; do not assume inherited rules are LAN-only. |
| SSH | TCP 22 | Prefer trusted-network scoping and appropriate rate limiting in addition to key-only authentication. |
| AirPlay/UxPlay | TCP/UDP 7000–7002; mDNS discovery | Review discovery and transport together; package installation is insufficient. |
| Sunshine | TCP 47984/47989/48010; UDP 47998/47999/48000/48002/48010 | LAN-scoped only in this design; no public/router port openings. Setup, pairing and capture permissions are separate. |
| Docker DNS | UDP 53 to a selected resolver | Supply a destination-appropriate resolver rather than a source address. |

Do not restore retired streaming rules or assume an allow rule enables a service. Review overlapping rules and preserve valid ruleset structure. Avahi, `nss-mdns`, Bluetooth and CUPS support discovery but do not prove printer setup, device pairing or Internet reachability. The reference NetworkManager override `omarchy-wifi-powersave.conf` uses `wifi.powersave=2` to avoid adapter sleep/idle-link latency; it is not a static-IP configuration.

## 2. Application and package requirements

Recorded `packages.versions` and `packages.explicit` are provenance, not an offline mirror or cross-architecture lockfile. Repository candidates, reviewed source recipes, assets and exclusions determine restoration. An explicit pacman flag does not establish a personal application choice; base distributions also mark packages explicit. Recheck repository availability and target compatibility.

| Area | Reference application surface | Boundary |
|---|---|---|
| Browsers | Google Chrome and Chromium; Chrome selected as default | Restore safe flags, policies, MIME and desktop files, not profiles, cookies, history or account state. |
| Password management | `1password`, `1password-cli` | Package/autostart references do not establish an account; enrollment and unlock are manual. |
| Office and notes | `libreoffice-fresh`, `obsidian`, `omawrite`, `omacalc`, `omacut`, `xournalpp`, `evince` | Documents, notebooks and vault contents are separate data. |
| Graphics/media | `kdenlive`, `obs-studio`, `pinta`, `imagemagick`, `imv`, `mpv`, `mpv-mpris`, `cliamp`, FFmpeg/thumbnail tools, `yt-dlp` | Presence does not prove launch/configuration; Blender is described below. |
| Screen capture | `gpu-screen-recorder`, `grim`, `slurp`, portals; workstation `wf-recorder` | Use current desktop launchers, not obsolete headless experiments. |
| Files/sharing | Nautilus, `nautilus-python`, `sushi`, LocalSend, GVfs MTP/NFS/SMB, `udiskie`, GNOME disk utility, OpenSSH/rsync | No mounted-share credentials, source data or receiver identities. |
| Printing/discovery | CUPS, CUPS filters, `cups-pk-helper`, `system-config-printer`, Avahi, `nss-mdns` | Configure printers afresh; do not restore obsolete `cups-browsed`/`cups-pdf` merely from history. |
| Shell/terminal | Bash, foot, Herdr, Oh My Posh, Starship, tmux, `bat`, `eza`, `fd`, `fzf`, `ripgrep`, `zoxide`, `btop`, `fastfetch`, `dua-cli`, lazygit/lazydocker | Foot/Herdr is the selected workflow; workstation Zsh availability does not change the Bash choice. |
| Development | Docker/Buildx/Compose, Git, clang/LLVM, CMake/Ninja, Qt tools, Ruby, .NET runtime, Lua/LuaRocks, Python libraries, mise | See agents/development for runtime/source requirements; database client libraries do not imply servers. |
| Audio/input/accessibility | PipeWire, WirePlumber, ALSA, BlueZ, `pamixer`, Fcitx5 GTK/Qt integration, `wl-clipboard`, `wtype`, Tesseract/English data, QR/barcode tools | Preserve profile-specific voice/input policy; no automated typing is required for restore. |
| Fonts/desktop | Noto/emoji/CJK, IA Writer, JetBrains Mono Nerd Font, Font Awesome, Yaru, brightness/DDC tools, `hyprsunset`, `aether`, `tensaku`, `ttfx`, `tobi-try`, `tzupdate` | Display identifiers and compositor ABI remain target-specific. |
| Power/networking | `power-profiles-daemon`, UPower, NetworkManager, Tailscale, UFW, `ufw-docker` | No cloned battery, BIOS, router or network-identity settings. |

Desktop/web-app launchers do not prove native application installation or account use. Alternate application configuration directories likewise do not establish that an application is installed or selected.

### Sunshine and Moonlight

The laptop reference selects `app-dev.lizardbyte.app.Sunshine.service` with a `sunshine.service` alias and architecture-correct `Sunshine_2026.914.233613_aarch64.AppImage` under `payload/mac/home/.local/opt/sunshine/`. The reviewed unit waits for the graphical/portal session, delays five seconds and restarts on failure. Settings belong in `home/.config/sunshine/{sunshine.conf,apps.json}`. The AppImage approach avoids an unsuitable dependency in the normal package for this ARM64 baseline; recheck compatibility on a new target.

The workstation reference retains package `2026.830.165455-1`, safe configuration and an admin launcher, but **does not enable the streaming service**. `sunshine-display ensure` remains disabled. A synthetic headless-output topology was associated with NVIDIA/Hyprland failures; do not reintroduce it, old display toggles or synthetic-input recovery from historical configuration.

Moonlight Qt is a client option for both profiles. Provision Sunshine credentials, certificates and pairing afresh, review capture/encoder permissions, and test a real stream. A running unit is not proof of pairing or streaming; no end-to-end client claim is made here.

### UxPlay / AirPlay Screen Mirroring

UxPlay `1:1.73.7-1` and reviewed recipes under `payload/<machine>/home/.cache/yay/uxplay/` were captured for both profiles. The reference leaves `uxplay.service` disabled: launch the receiver deliberately rather than at every login. Audio/video operation was historically reported for the workstation profile; laptop package evidence alone did not establish equivalent end-to-end operation. Neither is a fresh target test.

Recreate LAN-scoped firewall/discovery rules and verify both picture and sound. Apple's macOS iPhone Mirroring interface is separate from AirPlay Screen Mirroring; do not apply other-OS pairing actions as Linux setup steps.

### Steam on Apple Silicon

The laptop profile uses Steam `20241231-4` through FEX/muvm, not native x86 execution. `payload/mac/home/.local/bin/steam`, reached from `home/.local/share/applications/steam.desktop`, starts **`muvm -- dbus-run-session --` inside the guest**, sets `GDK_SCALE=3` and `STEAM_FORCE_DESKTOPUI_SCALING=3`, launches the guest script and retains `-cef-force-occlusion -forcedesktopscaling 3`. Guest session D-Bus and guest-side scaling are important; do not replace them with global desktop scaling. A bounded historical run was reported without a quit/reopen loop, not an indefinite stability or game-compatibility result.

Required repository inputs are `steam` `20241231-4`, `FEX-Emu` `2604-1`, `fex-emu-rootfs-arch` `20260318-1` and `muvm` `0.6.0-1`. The recorded launcher target is `payload/mac/home/.local/share/fex-steam/steam-launcher/bin_steam.sh`, alongside `bootstraplinux_ubuntu12_32.tar.xz` and its agreement. This supports a fresh bootstrap rather than reuse of an authenticated `~/.steam` tree.

`mesa-fex-emu-overlay-i386` and `mesa-fex-emu-overlay-x86_64` `26.2.3-1` are **hardware-baseline exclusions**: the matching Apple/Asahi installation must supply compatible FEX overlays and Vulkan support. Rootfs compatibility, repository availability and first launch require destination verification. Sign-in, games and per-game data are separate. Shared main-window fullscreen/empty-workspace rules do not install Steam/FEX on the workstation, whose Steam launch behavior was not tested.

### Blender and NeoMutt

- **Blender:** the workstation profile uses a user installation, not a pacman package. The retained `blender-4.5.9-linux-x64.tar.xz` distribution corroborates the reported Blender 4.5 LTS setup. A source recipe installs runtime/resources under `~/.local/opt`, with `~/.local/bin/blender` linking into it. Do not copy this x64 distribution to aarch64; projects/assets are separate.
- **NeoMutt:** workstation version `1:20260616-1`; not part of the laptop package profile. Sanitized `home/.muttrc` preserves SMTP TLS/STARTTLS, authenticator, `nvim` editor and cache behavior. Optional IMAP was not established as active. **Provision mail identity, SMTP authentication and local cache/certificate paths privately.** Restrict permissions on destination mail configuration; copied preferences do not create a working account.

### LocalSend, SFTP and legacy `teleport`

LocalSend is the selected transfer application, with the Nautilus extension at `home/.local/share/nautilus-python/extensions/localsend.py` and workspace 5 login placement. Verify discovery and an approved disposable transfer on the target; receiver identity, downloads and trust state are not portable. Multiple interfaces can produce duplicate discovery entries without proving duplicate devices.

The workstation's `~/.local/bin/teleport` is a legacy SSH/rsync helper with inbox/status/send/retry semantics, **not** the Teleport infrastructure product. Its pairing configuration and prior jobs/inbox are excluded. It is not an autostart requirement; deliberate fresh configuration is required to use it. Other-OS compatibility work does not justify installing Homebrew on native Linux.

### Voice, utilities and plugins

- **Laptop voice:** native ARM64 Wispr Flow recipe `home/.local/share/wispr-flow-package`, version `1.0.3+wispr1.6.7-1`, login autostart and Wispr bar plugin. Dictation/insertion was historically reported, not freshly verified. This unofficial port requires destination login and permissions, lacks Notetaker, and has manual-update considerations. The recipe downloads proprietary software rather than vendoring its application tree; see desktop/input for keyd/uinput boundaries.
- **Workstation voice:** `voxtype-bin` `1.0.1-1`, selected user service and safe configuration/model asset. Do not replace this with the laptop voice stack. An overlay failure need not imply daemon failure.
- **Text to MD5:** local source, executable and desktop launcher for both profiles; not a background service. Installation/binding evidence and reported popup/Copy behavior informed the reference, but target shortcut and clipboard checks remain necessary.
- **librepods/Omapods:** both profiles include native librepods binaries and a selected daemon service. The reviewed workstation plugin layout includes Omapods; the laptop layout does not. Do not add an absent UI plugin merely to make profiles symmetric.
- **Key Promoter, Lock Screen Explorer, Omaplug, Radio Atlas, Agents and 20-20-20:** use the selected plugin configuration in desktop/input. Agents and 20-20-20 belong under Plugins, hidden from the persistent bar. Source presence alone does not prove a patch is deployed.
- **Aperture:** not established as a required component by the selected reconstruction; no automatic installation is implied.

### Removed or unsupported components

The workstation's removed packaged Herdr `0.8.2` is distinct from selected user-installed `0.9.1`. The laptop's older packaged version alongside a newer user binary requires correct PATH selection. Removal of laptop `oh-my-posh-bin` likewise does not remove the selected user-installed binary/configuration.

Do not reintroduce workstation `cups-pdf`, `cups-browsed`, `libayatana-indicator`, `ayatana-ido`, or laptop `gtk-layer-shell` and `omarchy-apple-boot` solely from old package records. Punktfunk and the obsolete macOS/streaming input stack are excluded, including ABI-pinned observers, remappers, watchdogs and repair bridges. The intended portable Flatpak application set is empty; availability of Flatpak on the workstation does not change that.

Speculative model stacks, unsupported providers, other-OS message bridges and unselected transfer products are outside scope. Restore the reviewed Neovim configuration against an appropriate `omarchy-nvim` baseline; an earlier Lazy `E5113`/lockfile failure did not establish a successful repair or theme installation. Other OS environments and previously authenticated developer sessions are outside scope; authenticate required services anew.

## 3. Audio, lighting and hardware safety

### Audio and Bluetooth

The reference uses PipeWire/PipeWire-Pulse, WirePlumber, Bluetooth, `bt-agent.service` and `librepods.service`. The reviewed `home/.config/wireplumber/wireplumber.conf.d/bluetooth-a2dp-autoconnect.conf` auto-connects A2DP playback/capture profiles for BlueZ cards. It does not preserve device trust, establish a microphone profile or choose the correct output.

Pair afresh, obtain an audio-capable rather than LE-only endpoint, select the output and verify playback. Battery, in-ear detection and playback-control features need separate acceptance checks; not every behavior was independently proven in the earlier review. Do not indiscriminately forget devices or factory-reset them as a reconstruction step.

The laptop's `asahi-audio-no-suspend.conf` appears in user and system WirePlumber override locations. It keeps matching Apple speaker/headphone ALSA outputs open with `session.suspend-timeout-seconds=0` to avoid amplifier power-cycle pops. Its companion `payload/mac/home/.local/share/wireplumber/scripts/node/software-dsp.lua` keeps matching Asahi speaker filter-chain graphs from pausing/suspending between short-lived streams, leaving microphone graphs unchanged. The system `/usr/share` script was an unchanged package baseline, not a second custom file to transplant. **Compatible Asahi audio/speaker-safety baseline and real target playback checks are mandatory.** These are not workstation settings.

### Workstation RGB and NZXT LCD

The reference intent is lights off at boot/login with explicit local on/off/toggle controls, **not fan, pump, thermal, BIOS or overclock changes**. Lighting Node, ASUS headers and NZXT Kraken Z-family controls are hardware-specific examples supported by the reviewed helper; they are not an inventory of a public operator's devices. Enumerate actual target devices, USB IDs and wiring rather than copying device numbers. Header-connected strip coverage depends on wiring. No remote-control listener or authentication bypass is required.

Recorded local-bundle components are:

- `payload/rig/home/.config/OpenRGB/OpenRGB.json`
- `payload/rig/home/.config/systemd/user/omarchy-rgb-off.service`
- `payload/rig/home/.local/bin/omarchy-rgb-off`
- `payload/rig/home/.local/bin/omarchy-rgb-switch`
- `payload/rig/etc/systemd/system/omarchy-rgb-off.service`
- `payload/rig/usr/local/sbin/omarchy-rgb-off`

The user helper delegates to `omarchy-rgb-switch off`. The switch enumerates OpenRGB devices, applies black/white to selected classes/names and uses device-specific liquidctl commands for LEDs/LCD brightness; its scope can include a directly attached keyboard. Unsupported off modes and logged failures can coexist with continued execution. The `status` file records **requested software state, not proof that every LED obeyed**. Inspect actual lights; cooling telemetry does not imply cooling adjustments.

The user service is selected, but the root boot service requires **`root-rgb-hardware-review`** before enablement. Its helper loads relevant I2C modules, uses a narrower device set excluding keyboards, tries off/static-black/direct-black modes and controls LEDs/LCD without speed commands. Review module/device assumptions and permissions. Do not copy RGB configuration to the laptop or run a competing continuous OpenRGB daemon. Reboot persistence was not exercised for this report.

### Power, graphics, display and boot

- Use the matching `power-profiles-daemon`/UPower baseline; no specific battery/AC or thermal policy is established here.
- Preserve native socket/session relationships for PipeWire, WirePlumber and NetworkManager dependencies rather than cloning every observed systemd mask or transient unit.
- Apple Asahi kernel/firmware/audio, speakersafetyd, m1n1/U-Boot and graphics overlays belong to the matching Apple baseline. NVIDIA/DKMS, firmware, microcode, kernel/initramfs and Limine belong to the workstation baseline.
- **Never transplant storage layout, encryption, `fstab`, `crypttab`, machine IDs, host keys or bootloader state.**
- Laptop media-first function keys were reported consistent with upstream `hid_apple fnmode=1`; that is not a reason to copy a boot image or duplicate an upstream change.
- USB autosuspend/modprobe, logind power-button and udev changes need destination hardware review, not blanket restoration.
- Historical GTK DMA-BUF/Voxtype overlay failure attribution did not establish a fixed GPU/compositor release. Do not reinstall old GTK builds, monitor observers or crash-prone headless topologies from that diagnosis.

## 4. Login, service selection and administration

The reviewed `home/.config/hypr/autostart.lua` registers a `hyprland.start` callback: workspace 1 with foot, Chrome on 2 and LocalSend on 5. The laptop additionally starts Wispr Flow. These are login/start actions, not actions to repeat on every configuration reload. Historical reload checks were reported clean; fresh login/reboot behavior was not re-tested.

Foot/Herdr is the selected terminal workflow; the standalone local terminal binding is `Super+Alt+Return`. Laptop Herdr uses `Ctrl+Space`, then `d` to detach and `q` to reload; the workstation retains its default detach command `q`. A remote-hosted client's “Local” means that host, and exiting a remote pane does not necessarily produce a shell on the client laptop. See the companion reports for PATH and session selection; do not restore automatic SSH loops or the removed per-tab editor pane.

### Intended reference services, not a live service map

| Scope | Both reference profiles | Laptop-specific | Workstation-specific |
|---|---|---|---|
| Selected user units | `bt-agent.service`, `librepods.service`, `omarchy-fcitx5.service` | `app-dev.lizardbyte.app.Sunshine.service`, `omarchy-tailscale-receive.service` | `omarchy-rgb-off.service`, `voxtype.service` |
| System units requiring administrative review | NetworkManager, sshd, tailscaled, UFW, Bluetooth, Avahi service/socket, CUPS service/socket/path, Docker socket | `keyd.service` | Root RGB requires separate hardware review |
| Not login-enabled | Docker service, UxPlay user service | — | Sunshine and Taildrop receiver user services |
| Native baseline/session activation | PipeWire sockets, WirePlumber, compositor/portal/UWSM, power daemon | Apple-specific services | NVIDIA/storage/snapshot services |

An enabled `docker.socket` can activate Docker even when `docker.service` is not login-enabled. Containers, volumes, databases, private images and project services are not an environment overlay. An inactive completed RGB oneshot is not automatically a failure; inspect its result and hardware behavior.

The separately reviewed installer selected service states without `systemctl --now`, compositor reload, focus changes, input injection or reboot; package hooks can still have effects. That installer is not shipped here. Review dependencies before activation, avoid transient UWSM scopes, and perform acceptance checks deliberately.

Coordinate disruptive changes with the operator and keep administrative authentication local. Provision a fresh private notification destination/subscription and manually test delivery; configuration presence is not delivery proof. No notification topic or prior delivery timestamp is published. See agents/development for publisher behavior.

## 5. Backups and recovery

See [native backup findings](native-backup.md): root snapshots are not home backups, backend availability is platform-dependent, refresh is a reset, and migrate is not personal-environment transfer. No snapshot creation, restoration, reboot or fresh-VM reconstruction was performed for this report.

Preserve separately:

1. **Reconstruction inputs:** reviewed configuration, manifests, recipes, licenses and required runtime/model assets. This documentation repository is not a substitute for the separate local bundle.
2. **Private data:** documents, mail, game libraries, browser/application data and credentials recovered through supported methods. Keep secure backups independently of source machines; never publish them as environment configuration.
3. **Private evidence:** diagnostics and original source references may explain decisions, but are neither public transcripts nor executable installation input.

Per-change backups and receipts are not proof of an off-machine backup or a successful restore. They support manual file recovery, **not automatic rollback of packages, service activation or source dependencies**. Preserve a full backup before reconstruction. Do not revive retired helpers, extracted cores or temporary input tests as startup components, and do not indiscriminately remove active-service temporary directories or authentication sockets.

## 6. Destination acceptance and proof limits

| Required action | Why copying configuration is insufficient |
|---|---|
| Install compatible OS/hardware baseline | Kernel, boot, GPU, firmware, storage, display IDs and Asahi speaker safety are not portable preferences. |
| Review routes/firewall parameters | Supply `ROUTE_INTERFACE`, `LAN_CIDR` and `DOCKER_DNS_ADDRESS`; check table 2018/priority 12018 for collisions if using the dispatcher. |
| Enroll Tailscale and establish fresh SSH trust | No keys, authorization relationships or endpoints are exported; verify intended routes and SFTP from actual clients. |
| Authenticate selected applications | Packages do not restore accounts or sessions. |
| Pair Bluetooth and streaming clients | Trust, active output, capture permissions, picture and sound require real target checks. |
| Provision NeoMutt privately | Identity, SMTP authentication, cache/certificate paths and permissions remain manual. |
| Review root RGB hardware | Module/device selection and permissions gate boot activation; software state cannot prove darkness. |
| Verify Asahi audio | Overrides require a safe compatible baseline and actual playback. |
| Restore private data separately | Configuration does not contain documents, mail, games, histories or account databases. |
| Verify first login and runtimes | Earlier reports and captured files are not fresh boot, gaming, audio or desktop-rendering tests. |
| Test notification delivery | A new private destination and explicit delivery check are required. |

## 7. Methodology

The earlier review reconciled stored configuration, package inventories, removals and selected service metadata with narrative evidence. Repeated checkpoints, failed plans and reverted changes were not counted as independent successes. Mechanical journal aggregation did not establish semantic review of every message, and old activity did not override selected service policy.

This public copy omits original paths, source-file mappings, session identifiers, private counts and personal history. Technical reported-versus-captured qualifications remain, but no fresh runtime verification is implied. Publication sanitization did not run builds, tests, formatters, live desktop operations or disruptive checks. See [current-state inventory](current-state-inventory.md) for managed configuration, executable categories and destination prerequisites.

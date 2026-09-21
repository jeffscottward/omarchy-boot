# Omarchy-native backup versus recreation

## Finding

Neither installed host exposes a complete personal-environment backup/export/new-machine migration command. This repository is an architecture-aware reconstruction overlay, not an image of either boot disk. Keep its private evidence/data archive separately and back that archive up off the source machine.

| Observed capability | Mac | Rig |
|---|---|---|
| Reported Omarchy version | 4.0.4-mac.1 | 4.0.3-1 |
| Architecture | aarch64, Apple Silicon | x86_64 |
| Omarchy package provenance | omarchy-dev 4.0.4.r7017.g8f40def-1 | omarchy 4.0.3-1 |
| Snapshot help exposed | Yes | Yes |
| Snapper installed | No | Yes, 0.13.1-3 |
| Limine snapshot integration installed | No | Yes, 1.31.0-1.1 |
| Configured snapshot coverage | None verified | Root `/` only |
| Separate home subvolume | Yes | Yes |

The rig's configured root snapshot retention is five numbered snapshots, with timeline creation disabled and cleanup/Limine synchronization enabled. The actual snapshot listing was permission-denied, including a `sudo -n` attempt; snapshot count, age, and successful restorability were **not verified**. Nothing was snapshotted or restored during this investigation.

## What the commands mean

- **`omarchy snapshot create|restore`** uses configured Snapper subvolumes and Limine restoration. The rig's root-only setup does not include `/home`: personal dotfiles, home-installed applications, OMP conversations, and application data therefore need their own backup. The Mac's backend is absent; visible help is not evidence of working recovery.
- **`omarchy refresh ...`** restores shipped defaults, often retaining an adjacent timestamped `.bak` of changed configuration. It is a reset, not a comprehensive export or durable off-machine backup.
- **Reinstall commands** replace defaults; the rig's package reinstall route can downgrade packages to distribution defaults. They do not replay the user's captured application set.
- **`omarchy migrate`** applies release migrations to the current installation. It does not move a personalized environment to another computer. Copying old migration markers onto a different release is unsafe.
- **Unattended installation** can provision a fresh compatible Omarchy install, but does not export the current environment. Installation media/configuration may contain a plaintext encryption passphrase and must not be committed to a repository.

## Architecture boundary

A root snapshot does not translate x86_64 software into aarch64 or adapt storage, bootloader, kernel, GPU, and firmware configuration. Install an appropriate base OS first, then apply the matching recreation profile. This working Apple Silicon system is a custom Mac release; it is not evidence that the generic upstream Omarchy ISO supports M-series Macs. Upstream's current Mac-support documentation explicitly distinguishes unsupported M-series installation.

## Safe discovery commands

```sh
omarchy version
omarchy commands --all --json
omarchy snapshot --help
omarchy refresh --help
omarchy migrate --help
findmnt -n -o TARGET,SOURCE,FSTYPE,OPTIONS -T /
findmnt -n -o TARGET,SOURCE,FSTYPE,OPTIONS -T /home
snapper list-configs
systemctl is-enabled snapper-cleanup.timer snapper-timeline.timer limine-snapper-sync.service
```

These inspect state; they do not establish that a restore would succeed. Do not run refresh, reinstall, migration execution, or snapshot restoration merely to inspect them.

## Primary sources

- [Omarchy system snapshots](https://omarchy.org/manual/system-snapshots/)
- [Omarchy dotfiles](https://omarchy.org/manual/dotfiles/)
- [Omarchy unattended installs](https://omarchy.org/manual/unattended-installs/)
- [Omarchy Mac support](https://omarchy.org/manual/mac-support/)
- [Version-pinned v4.0.3 snapshot implementation](https://raw.githubusercontent.com/basecamp/omarchy/v4.0.3/bin/omarchy-snapshot)

Installed package sources and runtime inventories take precedence over documentation describing a newer release.

# omarchy-boot

Documentation for reconstructing a customized Omarchy environment on an x86_64 rig and an Apple-Silicon Linux laptop.

**Documentation only.** This repository contains no application binaries, models, source trees, executable restore scripts, machine-readable profiles, credentials, or raw conversation/system logs. It is not a bootable image or a one-command installer.

## Start here

- [Changes after first publication (2026-09-21 to 2026-09-28)](reports/updates-2026-09-28.md) — read this first; it corrects older statements
- [Final state and reconstruction map](reports/final-state.md)
- [Desktop, keyboard, voice, and terminal behavior](reports/desktop-input-terminal.md)
- [Agents and development environment](reports/agents-development.md)
- [System, applications, and network](reports/system-apps-network.md)
- [Current-state inventory](reports/current-state-inventory.md)
- [Backup limitations](reports/native-backup.md)
- [Verification and untested boundaries](reports/verification.md)
- [Evidence coverage](reports/evidence-coverage.md)
- [Supplemental historical findings](reports/supplemental-history.md)
- [Publication privacy review](reports/privacy-audit.md)

## Reconstruction order

1. Back up the destination's existing system and home directory separately. A root-only snapshot does not protect home-directory configuration.
2. Install a compatible base OS for the destination hardware. The Apple-Silicon profile describes an Apple-specific Omarchy/Asahi environment, not support for installing the ordinary x86_64 Omarchy ISO on an M-series Mac.
3. Review the inventory and domain reports. Distinguish current configuration from historical requests, failed experiments, retired components, and unresolved differences.
4. Obtain the required software from its upstream sources. Check architecture, versions, native-plugin compatibility, package availability, and licensing before installing.
5. Recreate the documented configuration for the new machine. Adapt account paths, network ranges, interface names, and hardware settings; never copy another machine's identity or credentials.
6. Authenticate services individually, generate fresh SSH keys where needed, establish trusted hosts, enroll the destination in its network, and provision private notification settings separately.
7. Verify packages, managed configuration, services, and actual desktop/input behavior. Activate desktop changes at a user-controlled logout/login. A sandbox file-restoration check is not a fresh-machine or hardware test.

## How to read the reports

Reports describe an earlier, separate local reconstruction bundle. References to `bootstrap`, `tools/`, `profiles/`, `payload/`, private evidence, and supporting JSON files refer to that bundle, **not files supplied by this public repository**. Commands that depend on those files cannot run here. Historical testing and capture-time publication statements apply to the earlier bundle, not to this documentation repository.

Private source locators, personal paths, unrelated project details, and unnecessary account/network identifiers have been removed or generalized in the public copies. Technical preferences and the two hardware profiles remain because they are the subject of these instructions. Original local reports and raw evidence are not published.

Secret scanning and editorial review reduce disclosure risk; they cannot prove that arbitrary prose is free of all sensitive information. See the [publication review](reports/privacy-audit.md) for the exact scope and limitations.

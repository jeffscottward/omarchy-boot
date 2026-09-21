# Reconstruction verification

## Executed proof

The actual `bootstrap` CLI was executed against both final profiles in isolated roots beneath the private evidence directory. No package manager, source build, service action, compositor reload, focus change or input injection was executed on either live desktop.

| Scenario | Mac profile | Rig profile |
|---|---:|---:|
| Read-only plan | Exit 0 | Exit 0 |
| First sandbox apply | 13,378 managed paths; exit 0 | 13,731 managed paths; exit 0 |
| Managed-path verification | 13,378 checked; zero differences; exit 0 | 13,731 checked; zero differences; exit 0 |
| Second sandbox apply | Zero changed paths; exit 0 | Zero changed paths; exit 0 |

The test identities were `rebuildtest` and `fresh-mac` / `fresh-rig`, not the source login/hostname. Network values used the documentation-only `192.0.2.0/24` range and `test0`; they were never applied to a real interface or firewall. Both home paths and system overrides were mapped into the sandbox.

Private final results: `sandbox-verification/final-{mac,rig}-{apply,verify,repeat}.json`, copied `final-*-receipt.json` receipts and `final-summary.json` below the evidence root. The final run followed removal of four non-runtime raw-history fixtures discovered during privacy review. Sandbox payload copies are removed after validation; result/receipt JSON is retained.

Rendered configuration syntax also passed: Mac 7 Hyprland Lua files, 21 shell launchers and 1 Python launcher; rig 8 Lua files, 20 shell launchers and 7 Python launchers. Lua used `luac -p`, shell scripts `bash -n`, and Python launchers AST parsing without execution. The existing Omarchy menu parser accepted both rendered custom menus (11 Mac / 6 rig entries), including Agents and eye-break actions, with no retired Punktfunk entries.

The Git staging helper's read-only plan succeeded. Its `--apply` branch stopped before staging because Git LFS is absent, as intended. No commit/push or remote action occurred; full LFS staging has not been exercised here.

The private full-history index passed SQLite `quick_check` and returned results for representative full-text searches. A separate throwaway CLI scenario verified compressed-text indexing, duplicate-free resume of two documents/events, and rejection of a changed captured source by checksum. The throwaway input was removed; no real evidence was altered.

## Safety regression tests

`python3 -m unittest discover -s tests -p 'test_*.py'` passed **18 tests**. The tests exercise:

- Identity retargeting and repeat-apply idempotence.
- Backups of existing files before replacement.
- Tampered payload hashes rejected before writes.
- Traversal, payload-parent symlink, source-directory symlink and internal receipt-directory escapes rejected.
- Protected system paths rejected even with noncanonical spelling.
- Unsupported source actions rejected before restoring unrelated files.
- Declared unresolved parameters fail closed; genuine upstream template syntax stays literal.
- Native binary byte preservation and executable mode.
- Sandbox suppression of package/service commands.
- Package option-injection rejection.
- Archive traversal rejection and backup of existing extracted trees.
- Private runtime-directory creation/permissions without deleting existing contents.

Independent static reviews identified five restoration hazards; the implementation was corrected before this run. Those reviews were not counted as runtime proof.

## Deliberately not claimed

This was **not a bare-metal reinstall or an end-to-end application-login test**. Sandbox mode does not prove current repository availability, package builds, dependency downloads, service activation, device identifiers, audio/dictation, Bluetooth pairing, native plugin compatibility, GPU/FEX translation or graphical rendering on a fresh machine.

The base compatibility checks require the appropriate architecture, Apple hardware for the Mac profile, Lua-based Omarchy, and captured Omarchy/Hyprland package versions. `--allow-version-mismatch` is an explicit review override, not an automatic native-plugin rebuild.

Real package installations may run distribution hooks. Services are configured without `--now`; desktop startup changes activate at a user-controlled logout/login. The README explains authentication and hardware prerequisites, backup receipts and recovery limits. Package/source changes do not have an automatic rollback.

## Privacy audit

The full portable tree was scanned for credential signatures, raw-evidence filenames, unsafe file modes, broken checksums and orphan payload files. Initial findings were reviewed rather than treated as automatically safe: compiled binaries and upstream fixtures can contain real-looking key material. See the final audit report and its explicit reviewed exceptions for the disposition. Regex scanning cannot prove that arbitrary code or prose contains no secrets. Nothing was published.

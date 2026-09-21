# Evidence coverage and limitations

## Snapshot boundaries

This is a reconstruction from the **available** evidence, not a claim that deleted history can be recovered. Collection used authenticated existing access and preserved host identity checks. Files have individual snapshot times; neither filesystem was frozen. Concurrent package/configuration work can therefore appear at different versions between the history capture and later live-state export.

The evidence archive is retained privately; its machine-specific location is omitted from the public report.

The raw evidence is outside this repository. Per-host manifests record original paths, byte lengths, SHA-256, modification/snapshot metadata, capture commands, omissions and access errors. Remote transport hashes were checked. Private files/directories use restrictive permissions. Incidental secrets may exist inside explicitly requested historical logs; never publish them.

## Captured history

| Evidence | Mac | Rig |
|---|---:|---:|
| Captured files, including inventory | 1,973 | 6,175 |
| Captured bytes | 338,727,195 | 4,527,892,670 |
| OMP session JSONLs | 39 | 141 |
| OMP session records | 9,859 | 24,953 |
| System-journal records | 77,004 | 332,950 |
| User-journal records | 52,688 | 180,126 |

Authoritative primary-root counts: `hosts/{mac,rig}/inventory/coverage-summary.json` and each host's `manifest.json`. The rig's generic `/sessions/` counter is 143 because it also sees two files outside the primary OMP session set; it is not a count of 143 primary user conversations. Additional project-local and retained regression histories were captured and reviewed separately below. Zero malformed/trailing records were found in the captured primary OMP session JSONLs.

Collection also includes available nested OMP tool artifacts/runtime logs/blobs, transactional `history.db` snapshots, legacy `.pi` sources where present, complete Herdr session trees and logs, shell histories, package/install/application logs and discovered machine-use logs. Browser profiles/history, clipboard contents, private keys, authentication stores and core dumps are intentionally excluded.

## Review method

1. Capture raw evidence with source provenance before interpreting it.
2. Inspect current configuration, package inventories, service states, custom scripts and relevant source/installed binaries on each host.
3. Extract every distinct user/assistant narrative and compaction summary from the initial 189 structured OMP/legacy JSONL files, including nested sources: **1,930 unique narratives, 2,324,177 characters** before redaction. The completed full index then identified 13 additional narrative-bearing sources outside those roots (12 retained regression-session sources and one project-local session). Their **10 additional unique narratives** were also reviewed, bringing the total to **1,940**.
4. Review all **116 packets**: 114 original domain packets, one supplemental narrative packet and one prompt-history packet. In addition to the 1,940 narratives, **49 distinct `history.db` prompts** absent from that prose were reviewed. No packet was dropped through relevance sampling. The review produced **1,710 intermediate claims**; these are leads with provenance, not independent proof of successful installation. Supplemental requests/results are reconciled in [supplemental history](supplemental-history.md); older regression-fixture timestamps do not establish earlier physical-machine use.
5. Reconcile those claims against current payloads and live inventories. A request is not an applied change; an assistant assertion is not a reproduced result; a rollback or retirement overrides an earlier install. Machine-specific differences remain explicit.
6. Separately aggregate every captured package-log line, shell history entry and journal JSON record. Full original bytes remain in the private archive; supported text/message/tool fields are searchable in the private index rather than published in this repository.

The private `narrative-review/coverage.json` maps every packet to a completed review; `result-*.json` retain claim references. No public classification API received the raw histories. Narrative review used the assistant's session-model processing, with best-effort redaction; this is not an assertion that no model processing occurred.

The completed private SQLite/FTS index contains **4,639 documents**, **6,774,056 source records**, **5,426,680 searchable text events** and **217 JSONL documents**. It reported zero malformed records and zero indexing gaps. SQLite `quick_check` returned `ok`; full-text queries for Wispr, Herdr and Tailscale all returned results. Its 148 generated text/tool packets are a separate storage partitioning from the 116 narrative/prompt-review packets above. All original selected bytes remain authoritative in the archive.

**Review boundary:** complete narrative coverage and machine-log indexing/aggregation do not mean every journal line received individual human-like semantic review. Structured metadata fields not handled by the index decoder remain available in the original raw files. System logs primarily establish observed activity/failures and timing; current configuration establishes what the rebuild should restore. Historical unrelated application-development work is accounted for separately from desktop reconstruction.

## Outside-chat package evidence

| Package-log action | Mac | Rig |
|---|---:|---:|
| Installed | 1,049 | 1,084 |
| Reinstalled | 10 | 3 |
| Upgraded | 129 | 155 |
| Removed | 3 | 5 |
| Downgraded | 1 | 0 |

These are logged **transactions**, not current package counts. The complete last-observed transaction per package is retained privately in `machine-use-summary.json`, with source line references. The profiles contain the current package state, explicit/foreign distinctions and version provenance; historical removal/upgrade counts are not replay scripts. Shell summaries retain executable frequencies, not private command arguments. Journal summaries count priority and service/unit activity without publishing message bodies.

## Known unavailable evidence

Noninteractive sudo authorization was unavailable on both hosts. No authentication policy or permissions were weakened.

- Both: `/var/log/audit`, `/var/log/private`, and `/var/log/boot.log` could not be read.
- Mac: `/var/log/omarchy-provision-owner.log` could not be read.
- Rig: `/var/log/snapper.log` and the kernel ring buffer could not be read.
- System and user journal exports **did** succeed on both, included root-UID entries, and emitted no limited-access warnings. Do not conflate the unreadable standalone files with failed journal capture.
- Some optional histories/directories never existed; stale links and absent tools are recorded in the manifests. Fish history was absent. Mac Zsh history was absent; rig Zsh history was available.
- Deleted/rotated history, unsaved shell buffers, inaccessible sources, unmounted storage and activity never logged cannot be reconstructed from these captures.

There are 40 Mac and 27 rig capture-gap entries, many describing absent optional roots rather than lost logs. State-export command gaps are a separate ledger. Neither count means that many whole features are missing.

## Privacy exclusions are not missing installation steps

New-machine account authentication, SSH key generation/host trust, Tailscale enrollment, private notification-topic provisioning, personal project data and application pairing must be performed separately. These are intentionally not portable credentials. Hardware/boot/storage identity remains the responsibility of the base OS install. Retired stacks and stale backup files are inventory evidence, not commands to reactivate.

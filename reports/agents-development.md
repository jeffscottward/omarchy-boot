# Agents, integrations, shell, and development environment

## Scope and evidence standard

This is a reference configuration derived from an earlier capture, not a replay of installation conversations or a live network map. “Mac” means the **native Linux/aarch64 Omarchy laptop role**, unless a paragraph explicitly says macOS; “rig” means the Linux/x86_64 workstation role. Example role aliases are `laptop-host`, `workstation-host`, and `other-os-host`; they are documentation placeholders, not observed hostnames. A source archive label does not establish where a remote command executed.

The complete assigned review input was processed: **37 packets, 463 component claims, and all 37 coverage notes**, including packets containing only project development and therefore zero customization claims. The claims contain **567 distinct raw source references**; that is a reference count, not 567 independent installations or conversations. Original review labels comprise 117 requested, 124 reported-applied, 79 verified, 58 failed, 31 preference, 51 uncertain, and 3 reverted. These labels are not upgraded here: an assistant's successful-test statement remains a historical report unless its underlying result or the current export supports it.

Evidence precedence is: current direct user decisions; current exported configuration/source and inventory; visible historical results or user observations; historical assistant reports; proposals. No application, login, desktop interaction, build, test, formatter, or linter was run for this report. Inspection was read-only except this report. Binary version observations below are static embedded strings, not newly executed version commands.

“Current,” “saved,” and “exported” below refer to that earlier capture. Profile, payload, source-tree and installer paths describe the privately reviewed reconstruction artifacts; those artifacts are not supplied by this documentation-only publication. Obtain authorized source and dependencies separately before applying the reference configuration.

### Reading the references

- **M / R** mean `profiles/mac.json` / `profiles/rig.json`, especially `files`, `sources`, `package_managers`, `prerequisites`, and `exclusions`.
- A target such as `~/.omp/agent/config.yml` maps to `payload/<profile>/home/.omp/agent/config.yml`; system targets map through their manifest entries. The manifest contains exact sanitized payload hashes and permissions. References to a target below refer to that payload, not a promise that a fresh machine has already been configured.
- **P8.C3**, for example, is an opaque private review label. Personal paths, exact session identifiers, and raw transcript locators are omitted from this public copy. Raw conversations, credentials, provider databases, private research, and logs are not included.

Desktop bindings, terminal windows, input, and MD5 popup UX are also reconciled in [desktop-input-terminal.md](desktop-input-terminal.md). Packages, remote access, transfer tools, mail, Docker, and general applications are covered in [system-apps-network.md](system-apps-network.md). Their overlap with this domain was reviewed, not discarded.

## 1. OMP: effective defaults, versions, and patch survival

### Persisted settings are not identical

| Setting | Native Omarchy Mac | Rig |
|---|---|---|
| Authoritative file | `~/.omp/agent/config.yml` | Same target |
| Default model | `openai-codex/gpt-6-astra` | `openai-codex/gpt-6-astra:xhigh` |
| Explicit thinking default | Not present | `defaultThinkingLevel: xhigh` |
| Explicit advisor default | Not present | `advisor.enabled: true` |
| Explicit fast/priority tier | Not present | `tier.openai: priority` |
| Theme | `omarchy-system`, both dark and light | Same |
| Other captured settings | Nerd symbols; box composer; setup version 2; AutoQA consent; Context Mode native adapter extension | Setup version 2; AutoQA consent |

Both manifests have **`omp_settings: []`**. The credential-bearing `agent.db` was not exported; the inspected settings table supplied no additional settings. The YAML, not an imagined database setting, is therefore the source of truth. Existing processes and saved sessions can still retain older per-session choices.

The rig YAML records xhigh, advisor and priority defaults; the Mac export does **not** establish them. This is a captured configuration divergence, not permission to infer missing YAML values or copy the rig file wholesale. Restore each authorized captured file, then deliberately reconcile those three settings if desired. [M/R; P0.C37–C38; P4.C18]

### There are multiple OMP binaries, not one common version

| Artifact | Mac | Rig | Reconstruction consequence |
|---|---|---|---|
| Active mise selection | 18.2.7 | 18.2.6 | Captured in mise configuration and package-manager inventory |
| Captured active mise executable | `~/.local/share/mise/installs/github-can1357-oh-my-pi/18.2.7/omp` | Corresponding `18.2.6/omp` | Architecture-specific exact payload; embedded strings match these versions |
| `~/.local/bin/omp` | Bash wrapper invoking mise | Separate ELF containing `omp/18.1.7` | Rig file is an old competing executable, not another name for current mise OMP |
| Compact-startup patch base | 18.2.6, commit `78b753124d11f8dd3ae73e2524125890ff7c977e` | 18.2.5, commit `37273117021129e96bd05d8277b140ec3fd61990` | Earlier patched version than current mise selection |
| Historical inactive mise versions | 18.1.18, 18.1.19, 18.2.6 | 18.1.4, 18.1.13, 18.1.14, 18.1.15, 18.2.0, 18.2.5 | Inventory/rollback history; not evidence these should become defaults |

The normal Mac wrapper sets `MISE_MINIMUM_RELEASE_AGE=0s`, runs unversioned `mise use -g`, and then `mise x`. Most other AI CLI wrappers do the same, using `0` on the rig. This means launching a wrapper can alter the selected version or install a tool. The captured pinned config is a snapshot, not an immutable future-version policy. Historical 24-hour release-age deferrals and old-path verification warnings explain earlier 18.1.x update confusion; do not reproduce those failed old-path checks as setup steps. `auto_prune=false` is currently saved on both machines. [M/R; P0.C3–C7, C11, C15, C36]

The rig's old local executable can win in a PATH that prefers `~/.local/bin`; historical interactive probes instead resolved mise 18.2.5. Those facts are compatible with differing PATH order between shells, launchers, and an already running process. **Do not identify an actual running session's version from mise selection alone.** The export preserves both artifacts; a clean intended-state cutover still needs an explicit decision about the stale 18.1.7 file. No live removal or PATH change was made here.

### Compact startup patch: preserved source, unproven current activation

The requested change retained the welcome screen, the short “Connected to MCP servers” list, and the model's full tool inventory while removing the redundant human-facing per-method mount dump. Setting `startup.quiet=true` was considered but would also hide useful startup information; it is not equivalent to the patch and is not a saved replacement here.

Both profiles carry `~/.local/share/omp-compact-startup/compact-startup.patch`, `local-patch.json`, the modified source tree, and its license/notices. Historical reports say the affected 47 tests passed and fresh sessions connected the expected servers. Mac patch metadata also records no injected desktop input. These are recorded historical results, not tests repeated for this reconstruction. [P7.C14–C16; P8.C2–C3; P62.C5]

The current captured active mise binary hashes **do not equal** the earlier `patchedSha256` values in `local-patch.json`; neither does the rig's old local ELF. Therefore the old patch metadata does not prove compact startup remains active after the subsequent updates. Version changes alone would be insufficient evidence, but the hashes also differ. Do not label current 18.2.7/18.2.6 binaries as the verified historical compact builds. Original backup binaries are deliberately excluded as historical backups.

**Restore:** package/runtime installation plus exact platform payload restores the observed binaries and files. It does not automatically rebase, rebuild, or reapply the compact patch. Some source files and security fixtures were intentionally omitted because they matched credential/private-key signatures, including a CLI source file as well as tests. The exported source tree is **not a guaranteed complete build/test input**. Any future rebuild must start with a reviewed trusted upstream version, resolve each recorded exclusion safely, and port the patch intentionally. Do not reinstate credential-bearing fixtures merely to make a build pass.

## 2. MCPs and research integrations

### The two machines intentionally have different saved server inventories

| Integration | Mac current state and restoration | Rig current state and restoration |
|---|---|---|
| Context Mode | MCP `context-mode`; Node launches isolated `~/.local/share/omp-integrations/context-mode/node_modules/context-mode/server.bundle.mjs`; package 1.0.169. `CONTEXT_MODE_PLATFORM=omp` and the native adapter in OMP YAML are present. Restore package manifests and lockfile, then the recorded npm recipe. | MCP `context-mode`, explicitly enabled; absolute Node 26.7.0 and global npm Context Mode 1.0.169 paths. Restore that concrete runtime and global npm package. OMP `SYSTEM.md` supplies routing guidance; no native adapter extension is saved in this YAML. |
| Chrome DevTools | MCP 1.9.0 in `browser-mcps`; explicit `/usr/bin/google-chrome-stable`; `--no-usage-statistics` and `--no-performance-crux`. Restore locked npm dependencies and Chrome separately. | Not in the saved OMP MCP registry. A Chrome DevTools skill is not proof of a registered server. |
| Playwriter | MCP 0.5.0 in isolated `browser-mcps`; convenience symlink in `~/.local/bin/playwriter`. | MCP 0.5.0 from global npm under Node 26.7.0, explicitly enabled. |
| Hyperresearch | MCP `hyperresearch`, timeout 120000, wrapper under `~/.local/share/omp-integrations/hyper-research/bin/`; research cwd is its `vault` directory. Python 3.13 venv recipe, complete observed `requirements.lock.txt`, Hyperresearch 0.11.1, Playwright Chromium install and dedicated browser path. | Hyperresearch 0.11.1 is a **uv CLI tool**, with `hyperresearch` and `hpr` launchers. It is not in the saved OMP MCP registry. Claude workflow skill/agent assets exist. Do not infer an OMP server merely because this CLI is installed. |
| grep.app | Not in the saved registry. | Enabled HTTP MCP `grep-app` at `https://mcp.grep.app`; `disabledServers` is empty. No local daemon package needed. |

[M/R; `~/.omp/agent/mcp.json`; Mac integration package/lock files and Hyperresearch requirements; P0.C23–C25, C29–C31]

The initial Hyper Research request named a different upstream. The reported installed implementation was `jordan-gibbs/hyperresearch` 0.11.1, and current runtime requirements support that package identity. Do not install an unrelated substitute based on the first request. The full 16-step workflow was originally described as Claude Code-specific; the Mac's exported OMP-facing skills explicitly provide native OMP vault-operation guidance rather than proof that every original Claude hook or orchestration feature was installed.

The historical rig repair replaced disabled/ignored source-only MCP definitions with concrete executable/URL launch definitions and reported successful connections to Context Mode, grep.app, and Playwriter. Mac history reported four connections. Those prior counts do not establish current service availability, extension attachment, account login, or a fresh-machine connection.

Both profiles select `omp` in `~/.config/omarchy/defaults/agent`. This desktop default is separate from model selection inside OMP. The rig retains **Aperture 0.1.2** source under `~/.config/omarchy/plugins/aperture`, but neither current shell activation list nor OMP YAML establishes an active Aperture extension; the Mac has no corresponding source payload. Historical reversible disabling therefore must not be mistaken for an instruction to restart its attention worker. Its manifest's recommended shortcut is descriptive metadata, not proof of an installed binding. The ordinary **Agents** and **20-20-20** UI entries are a separate current menu-placement decision: intended on-demand Plugins access with bar widgets hidden, not removal of all agent tooling. The desktop report reconciles any captured-menu/intended-state difference. [P0.C19; P47.C9–C10; current shell JSON/default-agent files]

**Authentication and runtime limits:**

- Playwriter requires the browser extension to be installed and attached to the intended tab. One recorded rig attempt failed because it was not connected. Cookies, extension browser profiles, and authenticated sessions are not restored. Do not expose debugging sessions to unrelated clients or interpret extension availability as authorization to act on every tab. [P53.C8]
- Chrome DevTools' separate managed browser is not a copy of the user's authenticated browser. The CLI flags preserve the observed privacy choices, not sign-in state.
- Hyperresearch's private vault contents and browser state are deliberately absent. The final Mac manifest declares its configured vault cwd as an empty directory with mode `0700`, closing the missing-directory restoration gap without copying private research. Package restoration does not reconstruct research.
- Global npm and Python installations are recipes, not vendored `node_modules` or venvs. Network/package availability and platform support remain prerequisites. Mac requirements pin installed distributions, not a promise that future package servers retain every artifact.
- A temporary MCP bridge and temporary remote-debugging setup were one-task workarounds, not permanent services to resurrect. [P0.C9; P47.C5]

## 3. Skills and persistent instructions

### Skills restored as actual files, not a handpicked list

The manifests include the full safe skill trees and `.agents/.skill-lock.json`, not only the skills mentioned by name in recent chat. Mirrored copies are not separate installations; baseline Omarchy symlinks are not copied source trees.

**Mac:** the shared `.agents/skills` tree contains `bulk-classify`, `caveman`, the `hyperresearch` router and all 18 stage/half-stage directories: steps 1–16 plus `1-5-chapter-partition` and `14-5-cite-check`. That is 21 populated skill directories in the snapshot. `context-mode` is an additional symlink into the npm package. `diagnose-crash` and `omarchy` link to `/usr/share/omarchy/default/agents/skills/`; their availability depends on the matching baseline. Pi additionally has `bulk-classify` and the two baseline links. The Claude skill directory has the baseline links, not the rig's large custom skill collection.

**Rig shared skill tree, all 51 populated directories:** `adapt`, `agent-browser`, `ai-sdk`, `animate`, `audit`, `avoid-feature-creep`, `better-auth-best-practices`, `bolder`, `bulk-classify`, `cavecrew`, `caveman`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `chrome-devtools-axi`, `clarify`, `colorize`, `convert-documents-to-markdown`, `create-auth`, `create-auth-skill`, `critique`, `delight`, `distill`, `dogfood`, `domain-modeling`, `extract`, `find-skills`, `frontend-design`, `gh-axi`, `graphify`, `grilling`, `harden`, `improve`, `lavish`, `next-best-practices`, `normalize`, `onboard`, `optimize`, `polish`, `prototype`, `quieter`, `remotion-best-practices`, `research`, `setup-matt-pocock-skills`, `teach-impeccable`, `to-spec`, `to-tickets`, `vercel-react-best-practices`, `wayfinder`, and `website-to-cli`.

The rig's **75 populated Claude skill directories** contain that shared set plus `agents-caveman`, `autobrowse`, `beautiful-mermaid`, `codex-scheduled-tasks`, `download-docs`, the ten `ecc-*` role skills (architect, build-error-resolver, code-reviewer, database-reviewer, doc-updater, e2e-runner, planner, refactor-cleaner, security-reviewer, tdd-guide), `hyperresearch`, `last30days`, `qwen-tts-local`, `simplify`, `source-harvest-report`, `taste-skill`, `teach`, `ui-ux-pro-max`, and `x-research`. The rig also carries 16 Hyperresearch Claude agent definitions under `~/.claude/agents/`.

The rig's **22 populated Pi skill directories** are `agent-browser`, `ai-sdk`, `better-auth-best-practices`, `bulk-classify`, `cavecrew`, `caveman`, `caveman-compress`, `chrome-devtools-axi`, `create-auth`, `domain-modeling`, `find-skills`, `gh-axi`, `grilling`, `lavish`, `prototype`, `remotion-best-practices`, `research`, `setup-matt-pocock-skills`, `to-spec`, `to-tickets`, `wayfinder`, and `website-to-cli`. Both shared/Claude/Pi roots have the applicable baseline Omarchy links. Neither profile establishes a separate populated `.codex/skills` tree or `.omp/agent/skills` tree; shared discovery and exported agent-specific locations must not be confused.

These are file inventory statements. A skill containing installation instructions is not proof its named external tool is installed. Nor does reading a skill prove the user adopted every default in it. The generic documentation-only packets were reviewed with that distinction. [M/R files and links; P50; P56; P61.C1]

### Notable skill decisions

- **Caveman:** reported installed version 2.3.1; Mac source provenance is `JuliusBrussee/caveman`, commit `b5ec6351396b643a17cbbec4a6eee8b3fb9dd782`. It is a discoverable optional communication mode, not automatically applied to all tasks. Preserve supporting files and licenses. Some upstream tests were excluded for credential signatures; do not promise a complete source test run. [P0.C24–C25]
- **Bulk Classify:** current shared and Pi assets on both hosts; lockfile identifies `https://classifier.dev/skill.md` and the captured digest. Historical requests and reports describe anonymous classification with calibrated confidence, used for bulk filtering/triage, separate from the main chat model and separate from paid/provider authentication. The reported four-text HTTP 200 examples are historical smoke claims, not a permanent service guarantee. [P8.C7–C8]
- **Website to CLI:** captured rig shared/Claude/Pi assets; lockfile records `dennisonbertram/website-to-cli`, skill path `skills/website-to-cli/SKILL.md`, and folder hash `5f448ace9b5f1d89dae3a60cec4759439cd651d3`. Historical filesystem evidence confirms the skill; Mac inventory does not. A separate proposed tool is not evidence of a successful installation. [P1–P3; P52.C3]
- **Channel to KB:** `channel-to-kb` and `channel-to-kb-ytdlp` are distinct workflows. Neither exported shared tree establishes a current globally installed `channel-to-kb` skill; do not invent a global restoration from repository-only material. [P0.C10; P47.C3–C6; P92.C20]

### Current machine rules and older global rules

The reference dual-machine policy is operator-controlled: adapt authorized shared changes for hardware and paths rather than copying blindly; verify destination identity; preserve unrelated state. **Keybinding rollout is rig-first, followed by explicit operator approval before laptop application/testing. Other disruptive actions require coordinated approval.** This is a rollout boundary, not permission to infer the operator's location, monitor activity, or expand access.

The Mac file additionally carries explicit ordinary-notepad text-entry testing rules. The rig file carries machine responsibilities, trusted administration scope, and the retired-stack warning. Preserve their differences. A routine shared-rule addition is not authorization to overwrite either entire file. [Current OMP AGENTS files; P5.C6–C10; P8.C4; P54.C16–C17]

Rig `~/.omp/agent/SYSTEM.md` supplies Context Mode routing, continuity/memory behavior, notification policy, and durable checkpoints. `~/.claude/CLAUDE.md` supplies broader development and tool-routing rules; keep any intentionally mirrored Codex/Claude instructions consistent. Agent-global instructions and workspace-root instructions have different scopes. Preserve applicable per-profile files, but choose workspace locations for the target installation rather than recreating a private directory layout.

Install project dependencies only when that project is intentionally used. Keep task-specific tools under an operator-selected tools root, and do not delete or consolidate directories merely because they appear duplicated or one looks newer. These safeguards do not authorize project migration. [P7.C5; P8.C13–C14; P63.C1–C3; P69.C3–C6; P67.C14]

Keep operational checkpoints private and scoped to the task. Preserve verified facts, goal, progress, verification, next action, and stop condition without importing raw histories, session identifiers, or secret-bearing checkpoints into the public repository. Report-formatting capabilities do not imply a global speech-service requirement. [P5.C1, C5; P8.C13–C14; P71.C4]

## 4. Authentication, providers, and notifications

### Provider authentication is intentionally not portable

OMP's built-in **TypeSafe typed-judgment integration** is separate from the main chat model. Restoring OMP and its nonsecret settings does not restore provider authorization: authenticate any desired provider anew through its supported flow. Credential stores are deliberately excluded; an empty exported settings table does not supply credentials or establish authentication state.

**Experimental providers are not part of the active reference configuration.** An isolated registration or an OpenAI-compatible schema does not establish working authenticated inference, streaming, native tool loops, quotas, pricing, or official service limits. Do not restore experimental adapters, provisional model settings, or private assessment artifacts as supported provider configuration.

Any account-backed integration requires fresh authorization where used. CLI or browser availability is not proof of an authenticated session. Use only supported authorization flows and explicitly authorized accounts; do not import tokens, keys, cookies, account relationships, private endpoints, or authorization codes.

For an authorized workstation operation needing interactive privilege, use existing trusted routes and authorization first. If a prompt is required, let the operator choose an accessible terminal and use the exact pending command over SSH with a TTY where appropriate. Never request passwords in chat, weaken host verification, or alter sudo policy to bypass the prompt. A narrowly approved authentication step does not authorize unrelated host changes. Close only an automation-created window after completion without disturbing other terminals. An open prompt is not proof installation succeeded.

### Notification sender is preserved, but the instruction/CLI mismatch is real

Both profiles restore `~/.local/bin/omp-notify`, `~/.local/share/omp-notify/notify.mjs`, and an owner-private disabled configuration under `~/.config/omp-notify/ntfy.json`. The portable topic is blank and prior delivery verification is cleared. A fresh private topic, subscription, explicit delivery test, and verified local configuration are prerequisites before enabling automatic messages.

The current sender accepts `--kind`, `--summary`, `--action`, and a single `--dry-run`; summary/action limits are 240 Unicode characters. Test mode does not accept summary/action. Other kinds require summary; non-completion kinds require a meaningful action. Non-test publishing requires both enabled state and a recorded phone-delivery verification value. It rejects duplicate/unknown options. Do not apply the contradictory historical summary saying test mode requires summary; the actual exported source wins. [Sender source; P49.C23 versus P70.C6]

Rig persisted OMP/Claude instructions still demand `--workspace` and `--tab`, which this sender **does not implement**. The repeated historical `INVALID_ARGUMENTS` failures and final workspace/tab complaint therefore have a current source-supported explanation. Copying the captured files preserves that mismatch; successful restore is not successful notification delivery. Horizontal body-rule/title-divider requests are historical intent, not proof that the current sender has that formatting. Repairing the contract is an explicit remaining task, not hidden by suppressing errors or automatic retries. [Rig SYSTEM.md:87–96, CLAUDE.md:94–103; P0.C39; P3.C6; P62.C3; P67.C8; P71.C6]

The reference notification policy is one parent completion alert after verified completion, no subagent/progress spam, no secret text, server acceptance distinguished from display on the destination device, and no automatic iMessage/SMS fallback. A macOS messaging service must not be inferred on a native Linux installation.

## 5. Shell, terminal environment, prompt, and editor

### Bash is the current common terminal contract

Both `.bash_profile` files source `.bashrc`; both Bash configs load Omarchy environment defaults before the noninteractive guard. Interactive shells then load the stock Omarchy aliases/functions and the custom prompt/layout. `l='ls'` is explicitly added. Historical interactive probes on both machines showed `ls='eza -lh --group-directories-first --icons=auto'` and `lt='eza --tree --level=2 --long --icons --git'` from the defaults.

`hdl omp` now means one full-width **OMP pane above a 15% Terminal pane**, with no mandatory editor. Explicit other/dual-AI layouts retain the editor-based behavior. New unlabeled singleton panes build the layout; named roles and existing layouts are preserved; terminal panes set role flags instead of recursively starting another agent. Tab labels chosen at creation are not overwritten with cwd. The rig additionally has a plain interactive-shell Herdr auto-attach block. The Mac uses the unified launcher for the same intended terminal experience rather than an automatic SSH back to the rig. [Both `.bashrc`; P0.C8, C12–C13; P6.C2–C8; P54.C5–C10; P71.C1–C2]

The plain local escape hatch is `~/.local/bin/omarchy-local-terminal`, reached with **Super+Alt+Return**. It clears inherited `HERDR_*` values, disables Herdr/OMP autostart, opens an opaque host-colored foot window, and starts login Bash. It is distinct from the normal foot+Herdr launcher and does not rely on exiting a remote pane to reach a local shell. The exported launcher intentionally preserves local machine identity. Herdr prefix is Ctrl+Space on both; Mac detach is `d` and reload `q`, while the rig retains default detach `q`. Full desktop restoration details are in the desktop report.

**The `!l`/`!lt` failure is not repaired by an alias file copy.** OMP's noninteractive command runner does not load interactive aliases past the `.bashrc` guard; plain `ls` can succeed without being the eza alias. Historical diagnosis and current guard agree. For such a runner, use the explicit eza command or deliberately invoke an interactive shell with automatic-app startup disabled. Do not remove the guard merely to make an agent command inherit all desktop startup side effects. This remained a user-observed issue, not a shown universal alias fix. [P6.C9–C10; P7.C1–C2; P93.C12–C13]

### Oh My Posh and live theme synchronization

Despite an earlier request to remove Oh My Posh, both current Bash configs explicitly initialize it from `~/.local/bin/oh-my-posh` and `~/.config/oh-my-posh/omarchy.omp.json`. They temporarily use `TERM=dumb` while sourcing stock rc to avoid a second Starship prompt, then restore TERM. They enable Oh My Posh reload and source `~/.local/share/omarchy-prompt-refresh/init.bash`. Thus the earlier removal discussion is superseded by the final exported setup, not an uninstall recipe. Starship configuration remains present but is not evidence two prompt engines should run simultaneously. [P0.C4, C27–C28; current Bash files]

The theme hook `~/.config/omarchy/hooks/theme-set.d/sync-agent-themes` validates generated OMP/Oh My Posh JSON, publishes both atomically, and calls the prompt notifier. Both profiles preserve OMP `omarchy-system.json`, Oh My Posh generated and Night Owl files, `notify.py`, `init.bash`, `redraw.c`, the Makefile, and a platform-specific `redraw.so`. Historical tests report live OMP recoloring, old scrollback replay through Ctrl+L, and prompt repaint preserving a partly typed command/cursor/status. Ordinary live UI repaint is distinct from automatically repainting historical scrollback. [P7.C11–C12, C16; P8.C1; P66.C11–C12; P93.C27–C28]

**Restore:** use the target-architecture binary/module plus hook, templates/generated theme assets, shell config, and matching Bash/readline dependencies. If the Bash/readline ABI changes, rebuild the small prompt module from its captured source using its Makefile after checking compiler, Bash headers, and readline, rather than transplanting the other architecture's `.so`. Rebuild capability was not tested here. A current configuration export supports the mechanism; it does not independently prove every historical idle-redraw check.

### Zsh is a rig secondary environment, not the Mac default

The rig `.zshrc` retains optional Oh My Zsh, Git plugin, mise activation, Night Owl Oh My Posh, Python aliases, Git helpers, and eza-based `ls/l/lt` functions. Its `gup` helper uses temporary stashing, fetch, optional git-machete traversal, and a rebase fallback. `.zprofile` is also captured. These are not Bash aliases and are not automatically available in OMP's command runner.

The final rig payload also includes the actual `~/.oh-my-zsh` backing source, not merely the conditional `.zshrc` reference. Provenance is `https://github.com/ohmyzsh/ohmyzsh.git`, commit `18e7e5d0339f3491a6c0324e2443415309b56173`, recorded unmodified with `LICENSE.txt`. This closes the secondary-shell source omission without making Zsh the default terminal contract.

No equivalent Mac Zsh configuration is established by the capture. Historical macOS `/opt/homebrew/bin/pi` and NVM-path guidance is platform-specific, not a Linux installation recipe. [P63.C3; P69.C5; P93.C28]

### Neovim

Both profiles restore `~/.config/nvim`, the 51-entry lazy lockfile, and the Omarchy theme hot-reload plugin. Historical Mac repair restored branch metadata for `lazy.nvim` and `blink.cmp`, replaced an unavailable Monokai repository with `loctvl842/monokai-pro.nvim`, and regenerated the damaged lockfile. Current locks include that replacement, with different Monokai commits on Mac and rig. The theme config also differs: Mac has retro-82 configuration while rig has Tokyo Night, alongside dynamic Omarchy handling. Preserve the per-host files rather than forcing identical editor colors.

The safe restore supplies configuration and lock metadata, not a complete private/generated plugin cache. Plugin fetching and any native compilation remain dependent on upstream availability and the installed Neovim/runtime. The old plugin-manager traceback is not a reason to change Hyprland input settings. For user-facing dictation/clipboard tests, current preference is a regular graphical notepad, not Neovim. [Current nvim files; P49.C14–C16; P92.C34]

## 6. Other AI CLIs and development runtimes

| Tool/runtime | Mac inventory | Rig inventory | Restore interpretation |
|---|---|---|---|
| Node | Active 26.8.1 | Active 26.7.0 | Use recorded runtime for absolute MCP paths and globals |
| npm | 11.19.0 | 11.19.0 | Major/minor/latest prefixes are aliases, not four distinct global installs |
| Codex | Active mise 0.155.1; inactive 0.154.0 | Active 0.153.4 | Local wrapper present both; login not exported |
| Claude Code | Launcher present, no active mise install recorded | Active 2.1.266; inactive 2.1.263 | Mac launcher is not proof of an installed authenticated runtime |
| Pi | Launcher and theme settings present | Active mise 0.85.1; theme settings present | Do not restore historical Homebrew path onto Linux |
| GitHub CLI | Active 2.101.0 | Active 2.100.0 | Auth is separate |
| Bun | 1.4.2 installed, not active | 1.4.0 active; 1.4.2 installed | OMP compact builds recorded Bun 1.4.2, not necessarily current shell Bun |
| Rust / Zig | Installed Rust 1.96.1 and Zig 0.16.0, no active mise selection | Rust stable/1.96.1 and Zig 0.16.0 installed, inactive | Installed files do not imply working `cargo` or `rustup` shim; inventory recorded missing-default errors |
| pnpm / uv | No pnpm active inventory; Mac integration restoration adds needed uv support | pnpm 12.3.4 and uv 0.12.11 active; older uv 0.12.10 recorded | Captured recipes, not project dependency bootstrapping |
| OpenCode | Config theme `system`, autoupdate false, launcher | Same | Saved application preference is distinct from the wrapper's unpinned mise setup behavior |

The common launchers also include **Copilot, Crush, Cursor Agent, Gemini, ghui, Grok, Hermes, Hunk, Muse, OpenCode, and Playwright**. They are real exported scripts, but most are Omarchy-style install-on-demand wrappers rather than evidence of installed tool payloads or authenticated use. Hermes specifically requests Python 3.13 for its setup and removes that pin from the environment before executing the agent. Do not preinstall every wrapper's remote dependency merely to count it as customized.

Rig global npm packages additionally include `@firecrawl/anydoc` 0.1.6, `agent-browser` 0.36.0, `context-mode` 1.0.169, `git-gac` 1.0.0, `playwriter` 0.5.0, `pm2` 7.0.4, and `portless` 0.15.6. uv tools include Agent Reach 1.5.0, Graphifyy 0.9.53, and Hyperresearch 0.11.1. Their generated console launchers are captured, while package-manager recipes reconstruct environments. Graphify supplies both `graphify` and `graphify-mcp`; a binary named MCP does not establish registration in OMP. Agent Reach's observed direct source was an unpinned upstream `main.zip`, so that recipe cannot promise exact 1.5.0 reproduction without an immutable source revision.

Anydoc CSV-to-Markdown and Agent Reach doctor/help success are historical migration reports, not checks repeated here. A `gh-axi` skill is not evidence a `gh-axi` executable exists; a historical PATH probe found no such command. Similarly, QML tools were sometimes present only under explicit Qt paths. [M/R package-manager inventory; P7.C3, C10; P57 coverage note]

Restore PM2 as an available tool, **not** transient search jobs, temporary results, browser sessions, development previews, or temporary test servers. A one-shot process does not establish a persistent workstation service requirement. [P46.C14; P69.C7–C8; P70.C1–C2; P71.C5]

## 7. Locally patched/source-built desktop tools

### Herdr

Both profiles carry native `~/.local/bin/herdr` binaries and source under `~/.local/share/omarchy-local-builds/herdr-0.9.1/`. Captured Cargo metadata says 0.9.1 and Rust 1.96.1; embedded binary text includes 0.9.1. The Mac package inventory also lists distro Herdr 0.8.2, which is not the custom user's client. Older still-running default/local servers in historical checkpoints were 0.9.0/0.9.1; a deleted executable path in inherited environment was observed but not itself a demonstrated failure. A package version, binary on disk, and already running server must be distinguished.

The relevant local repair addressed help-overlay shortcut wrapping: one long Mac resize binding was expanding global key width and wrapping unrelated descriptions. The requested repair used bounded key/description columns, untruncated wrapping, correct row heights/scrolling, narrow widths/filtering, and an inline short prefix row. Current source is preserved; historical source assignments alone are not proof of a deployed fix on a given date. The per-architecture binaries/configuration are the restoration artifacts. [P54.C22; current Herdr source/config/binaries; P69.C2]

**Restore:** copy the exact architecture-specific client and current configuration/launchers. Do not replace it with the older packaged client merely because pacman lists it. Rebuilding is a separate reviewed action using retained source, Rust toolchain, vendored Ghostty source/build requirements, and platform libraries. Generated Zig caches are not a source-of-truth dependency. Do not copy a rig ELF onto the Mac or restart active servers just to make a version label match.

### Text to MD5

Text to MD5 is included because it was installed as a machine tool, unlike unrelated application development. The reviewed artifacts include native GTK4 source, command/desktop launcher, and `~/.config/hypr/text-to-md5.lua`. Use an authorized checkout at an operator-selected location, for example `<tools-root>/text-to-md5`; this is a placeholder, not the observed private checkout path. Python/PyGObject/GTK4/wl-clipboard are the runtime dependencies.

Its contract is exact UTF-8 hashing with whitespace/newlines retained, lowercase digest, empty-input support, byte count, local-only calculation, no input history, Copy/Ctrl+Enter, ordinary selected-text Ctrl+C, and Escape/clear-on-close. MD5 is for compatibility, not password storage or cryptographic security. The installer supports a no-shortcut mode and rejects occupied physical/logical shortcuts before writing. Current desktop binding is Super+Ctrl+M.

Rig history contains visible 15-test and native GUI/clipboard results. Mac deployment recovered from an initial bundle-branch failure; installed CLI and bindings were subsequently shown. **The automated Mac GUI test failed its focus guard and stopped.** Manual success was subsequently reported; it must not be relabeled as a passing automated Mac GUI test. [P63–P67]

**Restore:** use separately obtained, authorized source, launcher, desktop file, and Lua integration with the recorded dependencies. Keep launcher references consistent with the chosen checkout path. This report does not provide the utility source or publication rights. Keybinding rollout still follows the operator-controlled approval rule. See the desktop report for the final UI contract.

## 8. Project work, migration history, and retired experiments

Unrelated application development, research content, private deployments, migration inventories, and private security history are omitted from the public report. They are not workstation settings.

Preserve only established desktop consequences:

- Installed tools and their runtime dependencies belong in the reconstruction; project assets, CI, datasets, temporary preview servers, and task-specific subprocess settings do not.
- The installed Text to MD5 utility is covered above. A repository checkout or proposed plugin change alone does not prove desktop installation.
- Retired Punktfunk, Hammerspoon, Karabiner-era input bridges, and stop-stutter experiments must not be reactivated.
- The current native Linux laptop and local terminal workflow supersede earlier thin-client assumptions. macOS services are not native Linux services.
- Historical OMP recovery/compaction symptoms do not establish a deployed fix. Do not invent watchdogs, queues, or other workarounds.
- Optional model, remote-access, and mirroring proposals do not authorize installing additional services. Use the current system/desktop inventory and fresh hardware verification.

## 9. What restoration covers, and what it does not

`tools/recreate.py` reads the selected profile, checks payload hashes, installs package/runtime recipes, copies rendered files with recorded modes, recreates links, handles actionable source recipes, and reapplies payload after package installation. For this domain that means concrete mise versions/selection, deduplicated npm globals, uv tools, Mac locked npm integrations and Hyperresearch venv/browser setup, architecture-specific binaries, source snapshots, skills, instructions, and shell/editor configuration. Consult the root README for the supported invocation and prerequisite/approval flags; a report is not a second installer interface.

The following limitations are material, not cosmetic:

1. **Authentication stays manual/private.** AI provider, browser, GitHub, mail, Cloudflare, SSH/Tailscale, and notification setup cannot be cloned by restoring sanitized files. `agent.db`, keys/cookies and account histories are excluded.
2. **OMP defaults diverge.** The Mac YAML does not save xhigh/advisor/priority; captured restoration will not invent those settings.
3. **OMP executable/patch state diverges.** Rig local 18.1.7, current mise 18.2.6/18.2.7, and old compact-patch metadata are distinct. Exact observed binary replay does not guarantee the intended compact startup patch or consistent PATH resolution.
4. **Source preservation is not guaranteed recompilability.** Credential-signature omissions and deliberately absent generated dependencies must be resolved before a future OMP/Caveman build. Native Herdr/prompt/plugin binaries also require compatible architecture/ABI or a reviewed rebuild.
5. **Notification rules and CLI disagree.** Reauthentication alone does not fix unsupported workspace/tab arguments or implement requested divider formatting.
6. **MCP runtime context must be recreated.** Browser extension attachment/login is manual. The final manifest creates Hyperresearch's empty private cwd, but excludes private vault contents. No historical temporary bridge should be revived.
7. **Reproducibility of remote packages has limits.** On-demand wrappers use unpinned mise requests, Agent Reach's recorded URL tracks main, and package/network availability is external. Installed inactive toolchains are not automatically usable defaults. These are not claims of byte-for-byte future upstream availability.
8. **Project environments and process state are not workstation defaults.** Repositories/worktrees/dependencies, project datasets, private research, PM2 jobs, temporary preview servers, browser profiles, live Herdr sessions and task checkpoints need separate intentional restoration. Do not turn historical one-off work into autostart services.
9. **Historical instructions need context.** macOS Homebrew paths, old thin-client assumptions, and retired input-stack recipes must not override native Linux requirements or the operator's current rollout policy.
10. **Editor dependencies may need fetching.** Neovim lockfiles preserve selected versions, not plugin caches. Rig Oh My Zsh backing source is now included with immutable provenance; it does not change the Bash default or make the Mac a Zsh machine.

Final capture reconciliation closed the concrete export gaps found during this review: the rig's workspace/Codex rules and Oh My Zsh source are included; the Mac Hyperresearch vault cwd is declared as an empty `0700` directory; both disabled notification templates preserve `phoneDeliveryVerifiedAt: null`; the legitimate `async-cheap-condition-before-await.md` skill rule is retained; and generated Herdr Zig artifacts plus the timestamped retired input-watch shell backup are excluded. These are portable reconstruction corrections, not changes to either live desktop. The account, source-rebuild, version/default, and notification-contract limitations above remain unresolved and explicit.

## 10. Complete packet accounting

| Packet set | Claims per packet | Treatment |
|---|---|---|
| 0–8 | 40, 10, 9, 13, 20, 11, 18, 16, 15 | All reviewed: OMP/MCP/skills/defaults, history recovery, instructions, shell, authentication and cross-desktop context |
| 46–54 | 17, 10, 33, 23, 2, 8, 8, 15, 22 | All reviewed: development consequences, retired input stack, editor, provider assessment, terminal/Herdr repairs |
| 55–62 | 0, 0, 1, 2, 0, 0, 1, 8 | All coverage notes reviewed, including zero-claim project-only packets; repository work distinguished from desktop installation |
| 63–71 | 9, 8, 9, 13, 14, 1, 8, 7, 6 | All reviewed: MD5 installation, workspace policies, transient search process and final history requests |
| 92–93 | 52, 34 | All reviewed: mixed environment requests, direct user observations, unresolved/ambiguous material and project exclusions |
| **Total** | **37 packets / 463 claims** | **No packet omitted; 567 distinct claim source references** |

Raw source anchors are retained only in the private evidence archive. They are omitted here to avoid publishing personal paths and conversation identifiers.

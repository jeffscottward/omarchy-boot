# User stories × surfaces

Scenarios come from the agent instructions, the saved lessons, and user requests in OMP sessions from 2026-09-21 to 2026-09-29. Only scenario descriptions were extracted, never secrets or clipboard contents. Each cell gives **the chosen tool → the fallback**. "Tested" refers to [RESULTS.md](RESULTS.md).

## Legend

| Code | Meaning |
|---|---|
| **CLI** | Direct command, config file, or API (`hyprctl`, `omarchy-*`, `gws`, `op`, `xdg-open`, `wl-copy`, OMP `read`) |
| **RLY** | OMP Browser Relay: Eval `browser.open({app: {relay: true, target}})` or raw CDP (`Target.createTarget` to open a new tab) |
| **JEV** | `jev_*` MCP adapter: named tab, allowed origins, agent-reviewed steps |
| **MGD** | Eval `browser` facade with managed headless Chromium (no user session) |
| **DS** | drive-screen: screenshot + guarded input, only with a live human handover |
| **HRD** | `herdr` CLI: pane split/run/read/wait-output in the caller's session |
| **SSH** | Trusted SSH alias; `-L` forwards for relay (rig→Mac 9225) and OAuth callbacks |
| **OMNI / UNCL / 1P** | Omni Reborn / Unclutter / 1Password Chrome extensions |
| **H** | Human only (secrets, unlocks, approvals, 2-step prompts) |
| — | Not applicable on this surface |

Surfaces: **Chrome** = the user's real, logged-in Google Chrome profile; **Chromium** = managed headless Chromium (OMP-owned profile); **OS** = Omarchy/Hyprland desktop; **Local term** = a terminal not in Herdr (for example, Super+Alt+Enter Foot); **SSH term** = a shell on the other machine; **Herdr** = a pane in the caller's Herdr session; **Rig→Mac** = agent runs on the rig, the target is the Mac.

## Matrix

| # | Story (source) | Chrome | Chromium | OS | Local term | SSH term | Herdr | Rig→Mac |
|---|---|---|---|---|---|---|---|---|
| S01 | Read the text of a logged-in page, such as an Instagram comment thread or a dashboard (IG reply bot, Vertex dashboard) | **RLY** (tested) → DS screenshot. JEV cannot return text | — no session | — | — | — | — | **RLY via 9225 forward** (tested) |
| S02 | Open the exact task page or OAuth URL in the user's browser ("required browser pages", "open URLs for me") | **RLY** `Target.createTarget` (tested) → CLI `xdg-open` on that host's desktop → DS | MGD `browser.open` | CLI `xdg-open` (handler = Chrome, tested read-only) | — | — | — | **RLY via forward** (tested) → `ssh omarchy-mac` + `xdg-open` with desktop env |
| S03 | Multi-step interaction on a logged-in site: Instagram reply/post, Google Cloud console (switch OAuth app to production) | **JEV** (task-scoped, reviewed) → RLY scripted selectors → DS | MGD | — | — | — | — | JEV reaches only Chrome on the OMP host: `ssh omarchy-mac bridge.py rpc …` (**blocked**: Mac adapter not loaded) → RLY via forward |
| S04 | Log in with 1Password autofill; Google passkey or "Try another way" | **1P** autofill, field icon clicked via JEV/RLY; unlock = **H** | — no vault | DS to click the 1Password unlock trigger → H types | — | — | — | Same on the Mac; H approves the second device |
| S05 | Finish OAuth for a CLI running on one machine in the other machine's browser (rig OMP login from the Mac) | RLY opens `http://localhost:<port>/launch`; H signs in | — | — | — | SSH `-L <port>` on the browser host | HRD pane if the tunnel needs a prompt | **SSH forward + RLY via forward**; verify on the CLI host from metadata |
| S06 | Load an unpacked extension (`chrome://extensions`, GTK folder picker) | **DS** + handover: mouse through the picker, never type into it (wtype drops characters) → H | `--load-extension` works only for Chromium/managed; branded Chrome ignores it | DS | — | — | — | DS over SSH on the Mac, with handover |
| S07 | Organize tabs: move a tab, add tabs to a group, move a group (Omni Reborn) | **OMNI** command palette via DS keyboard (handover) → H. Neither the relay nor JEV exposes tab groups | — | — | — | — | — | Same on the Mac |
| S08 | Hide ads and cookie walls | **UNCL** (passive) | — | — | — | — | — | — |
| S09 | End-to-end test a dev frontend before handback (Vertex dashboard) | RLY for the tab the user sees; JEV for flows | **MGD** first (isolated, tested 1.6 s) | — | — | — | — | Port forward/LAN route + RLY via forward |
| S10 | Static or public page | CLI `read` | MGD when JavaScript is needed | — | — | — | — | — |
| S11 | Put a path or link on the user's clipboard ("copy it to my Mac clipboard") | — | — | CLI `wl-copy` on the target host (**manual test**; Wispr clipboard safeguards) | `wl-copy` | `ssh omarchy-mac` + `wl-copy` with `WAYLAND_DISPLAY` | — | `ssh omarchy-mac` + `wl-copy` |
| S12 | Copy a link out of a non-OMP terminal into a browser | RLY opens it | — | — | Foot outside Herdr: DS screenshot to read it → H copy | — | **HRD** `pane read` → RLY open (no clipboard) | HRD on the Mac session via SSH → RLY via forward |
| S13 | Password, sudo, or auth prompt for already-authorized work | — | — | — | — | `ssh -t` inside the new pane | **HRD** split below the caller, `OMP_AUTO_START=0`, verify the shell, H types (create/run/close tested) | HRD pane runs `ssh -t omarchy-mac …` |
| S14 | Shadow an auth pane and open the URL it prints | RLY opens it | — | — | — | — | **HRD** `pane wait-output --regex https://` → RLY | Same, RLY via forward |
| S15 | Change Omarchy/Hyprland config: keybindings, menus, opacity, notifications | — | — | **CLI**: edit the Lua config (both hosts), `hyprctl reload`, `omarchy-*`. Launch programs with `hyprctl eval 'hl.exec_cmd(…)'` (`dispatch exec` fails on the Mac). Keybindings go rig-first, then need approval | — | Same via SSH | — | SSH + CLI; verify with `hyprctl -j` |
| S16 | Query desktop state: windows, monitors, DPMS, lock | — | — | **CLI** `hyprctl -j` (tested) | — | Same via SSH (tested; instance autodetected) | — | SSH + `hyprctl` (tested) |
| S17 | GUI-only desktop action: native dialog, 1Password unlock trigger, stuck toast | DS | — | **DS** (handover) → H | — | — | — | DS over SSH (handover) |
| S18 | Run a command locally vs. on the other machine | — | — | — | CLI after checking `hostname`/`uname -m` | **SSH** BatchMode (tested both directions) | **HRD** `pane run` (tested) | SSH |
| S19 | Open a rig file or URL on the Mac (lesson P05) | RLY opens it on the Mac | — | Mac file manager over the existing SSH/SFTP route | — | — | — | RLY via forward / SSH |
| S20 | Check that a task email arrived | — | — | — | **CLI** `gws` read-only (tested both) | Same via SSH | — | — |
| S21 | Credential for an authorized process | **1P** autofill | — | — | **CLI** `op run` (presence tested; never prints secrets) | `op run` on the target | `op run` in an HRD pane | — |
| S22 | Screenshot for visual verification | RLY CDP screenshot (page only) | MGD screenshot | DS `shot` (handover) | — | — | — | RLY via forward |
| S23 | Uploads, iframes, shadow DOM, canvas (JEV unsupported) | **RLY** facade (`uploadFile`, `frame()`) → DS | MGD | — | — | — | — | RLY via forward |

A human-facing view of the rig desktop from the Mac (Sunshine → Moonlight) also exists. Agents do not use it as a control route.

## Coverage per tool

| Tool | Stories it uniquely covers | Verdict |
|---|---|---|
| Direct CLI (`hyprctl`, `omarchy-*`, `gws`, `op`, `xdg-open`, `wl-copy`, `read`) | S10, S11, S15, S16, S18, S20, S21 | **Keep** (OS built-ins) |
| OMP Browser Relay | S01, S02, S19, S23 on the real session, and all Rig→Mac browser cells | **Keep**: core |
| JEV adapter | None strictly: RLY + the main model can do S03. It keeps step planning cheap and follows the user's JEV-first rule | **Keep** (user rule). Fix the Mac install |
| Eval `browser` managed Chromium | S09 (isolated), S10 with JavaScript | **Keep**: built into OMP |
| drive-screen | S06, S07, S17, and the S12 bare-terminal case | **Keep**: GUI fallback |
| Herdr CLI | S12, S13, S14 | **Keep** |
| Omni Reborn | S07 | **Keep**. Load it on the rig |
| Unclutter | S08 | **Keep** |
| 1Password extension + `op` | S04, S21 | **Keep** |
| browser-routing OMP extension | Injects the routing policy into OMP sessions | **Keep**. Update its text once the routing decision is made |
| context-mode MCP | Context budgeting; not a control route | Keep (out of scope here) |
| Vercel agent-browser 0.36.0 (rig npm global + skill) | None: duplicates MGD (≈1.0 s vs 1.6 s for the same read), rig-only, and cannot use the logged-in profile | **Remove** (proposal) |
| `chrome-devtools-axi` skill (rig skills tree) | None; its CLI is not installed. Duplicates MGD/RLY | **Remove** (proposal) |
| agent-reach 1.5.0 (rig uv tool) | None: platform readers (Jina Reader, RSS, YouTube subtitles, Bilibili; 4/15 channels usable), covered by `read`, web search, and `yt-dlp` | **Remove** (proposal) |
| OpenCLI 1.0.24 Chrome extension (Mac) | None: the `opencli` CLI is on neither host, so the extension is orphaned while holding broad tab permissions | **Remove** (proposal) |
| Midscene.js (Mac Chrome, disabled) | None | **Remove** (proposal) |
| Playwriter leftovers (Mac: dangling `~/.local/bin/playwriter` symlink, empty `omp-integrations/browser-mcps`) | Retired by the user 2026-09-21 | **Remove** leftovers (proposal) |
| omarchy-jev 0.1.0 (both hosts) | None: its bounded actions (focus owned windows, Nautilus, fixed terminal recipes, fresh Chromium profile) are direct `hyprctl`/CLI/MGD work. It needs TypeSafe calls for choices the agent already makes | **Keep the repo; remove from routing** (proposal) |
| Web Store "Jev for Chrome" (Mac, manual popup) | Manual use by the user; duplicate once the adapter build is loaded (the adapter includes the same popup) | Remove **after** the Mac adapter is loaded (proposal) |
| `~/.local/bin/playwright` (both hosts) | A lazy `mise use -g npm:playwright` installer stub (no package owns it); Playwright itself is not installed | Leave as is; harmless until run |

## Keep / remove

**Keep (final stack):** direct CLI/OS tools, OMP Browser Relay, the Eval `browser` facade (relay client + managed Chromium), the JEV adapter, drive-screen, Herdr CLI, Unclutter, Omni Reborn, 1Password (extension + `op`), `gws`, and the browser-routing extension.

**Proposed removals (not executed):**

1. `npm rm -g agent-browser` on the rig, and remove the `agent-browser` skill directory from the shared skills tree.
2. Remove the `chrome-devtools-axi` skill directory.
3. `uv tool uninstall agent-reach` on the rig.
4. Remove the OpenCLI and Midscene.js extensions from Mac Chrome (via `chrome://extensions`, which needs drive-screen or the user).
5. Delete the dangling Mac `~/.local/bin/playwriter` symlink and the empty `~/.local/share/omp-integrations/browser-mcps`.
6. Remove omarchy-jev from any routing text; keep the GitHub repo and CLI as a project.
7. After the Mac JEV adapter is loaded, remove the Web Store Jev copy on the Mac.

## Known gaps

- **Tab groups without the GUI:** CDP exposes no tab-group API, so organizing tabs needs Omni Reborn through keyboard input (DS handover) or the user. A small message API in Omni Reborn that a relay-driven page could call would remove this dependency. That would be a feature, not a fix.
- **Clipboard:** never tested automatically, to protect the user's clipboard/Wispr history. Treat it as a manual check.
- **Branded Chrome extension loading:** always GUI (S06). Chrome 136+ blocks `--load-extension` and remote debugging on the default profile.

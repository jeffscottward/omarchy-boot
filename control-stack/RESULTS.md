# Test results: 2026-09-29

Run from `omarchy-rig` at about 2026-09-30T00:30Z (evening of 2026-09-29 local), while the user was away:

```bash
bash control-stack/tests/run-both.sh --with-tab
```

This ran `tests/run.sh --with-tab` on the rig, again on `omarchy-mac` over SSH from a temporary directory (removed afterwards), and then the rig→Mac relay route through a temporary `127.0.0.1:9225` forward (closed afterwards). Raw rows: [`tests/results/`](tests/results/). An earlier run exposed two harness bugs on the Mac (a broken `bun` mise shim, and no Hyprland environment over SSH). They were fixed in `run.sh`, and this is the run after the fixes. The whole battery takes about 12–18 s per host.

## Summary

| Host | PASS | FAIL | SKIP | MANUAL | Failures, and why |
|---|---|---|---|---|---|
| omarchy-rig | 20 | 4 | 2 | 3 | C1, R1, J3: **the user's Chrome is not running on the rig**. Only OMP's headless daemon Chrome is running, so the relay extension and the JEV adapter have no browser to connect from. The relay server itself answers (HTTP 503 = waiting for the extension). C5: **Omni Reborn is not loaded** in rig Chrome. |
| omarchy-mac | 21 | 3 | 2 | 3 | C3, J2, J3: **the JEV adapter is not loaded** in Mac Chrome. Only the Web Store "Jev for Chrome" (manual popup, different ID) is installed; the native-host allowlist still names a removed ID. |
| rig → Mac | 3 | 0 | 0 | 0 | Relay reachable through the forward. Opened, read, and closed its own tab in 340 ms. Forward torn down. |

Also run from the rig's OMP Eval (the facade is an Eval API, so the shell battery cannot run it): `browser.open({url: "https://example.com/?omp-control-stack-test", headed: false})` → title "Example Domain", body text read, tab released. **PASS, 1.56 s** end to end on managed headless Chromium. It was not run on the Mac, which would need an OMP session there. The Mac's headless Chrome passed M1.

`jev_status` through this session's `jev` MCP tool (rig) returned `EXTENSION_DISCONNECTED`, the same as J3.

### Speed (rig unless noted)

| Route | Task | Time |
|---|---|---|
| Relay, rig → Mac forward | open own tab + read text + close | 0.34 s (0.68 s first run) |
| Relay, Mac local | same | 0.47 s |
| Eval `browser`, managed Chromium | open + read + release | 1.56 s |
| agent-browser 0.36.0 | open + get title | 0.97 s |
| `google-chrome --headless=new --dump-dom` | cold start + dump | 1.09 s |

JEV timing could not be measured: the adapter was disconnected on the rig and not installed on the Mac.

## What the battery does not do (manual or needs a handover)

- **Clipboard (O5):** never touched. `wl-copy`/`wl-paste` presence only.
- **drive-screen input (D2):** the doctor is read-only. Screenshots, clicks, and typing need a live human handover.
- **1Password (P1/P2):** `op --version` only. `op whoami` or vault access could raise a desktop unlock prompt. Autofill and unlock are human-gated.
- **JEV live run and omarchy-jev live run:** both send observations to TypeSafe and need a selected tab or desktop handover. Not run unattended.
- **Omni Reborn and Unclutter behavior:** installation state only. Both act inside the user's visible tabs.

## Side effects of this run

- On the Mac, Chrome briefly showed one new tab on `example.com` per relay tab test (two in total: local and cross-machine). The relay extension creates tabs as active, and each was closed within a second. Chrome then activates a neighboring tab, which may not be the tab that was active before. No existing tab was read, navigated, or closed. Chrome was not focused at the OS level; no keyboard or mouse input was sent.
- Herdr: two throwaway named sessions (`ctlstack-<pid>`), one per host, were created, stopped, and deleted. The user's `default` session was not touched.
- Headless Chrome (M1) used throwaway profiles in `mktemp` directories, which were removed. agent-browser (rig) used and closed its own session.
- `gws gmail users getProfile` (read-only) ran on both hosts. Only the exit status and the presence of a field were recorded.

## Needs the user's decision

1. **Routing rule:** the standing rule says to try JEV first for every browser step, but JEV cannot open a URL or return page text. Proposal: the relay opens and reads, JEV handles model-planned clicks, and the relay verifies the result. This would update `AGENTS.md` and the browser-routing extension on both hosts.
2. **Rig Chrome:** the user's Chrome is closed on the rig, so relay/JEV/Omni/Unclutter cannot run there. Is rig Chrome meant to stay closed, with browser work always targeting the Mac through the forward? The results support that: the Mac route passed.
3. **Mac JEV adapter:** load `~/.local/share/omp-integrations/jev-browser/extension` unpacked (drive-screen with handover), then `bridge.py install --extension-id <new id>`. Afterwards, decide whether to remove the Web Store Jev duplicate.
4. **Omni Reborn on the rig:** load it unpacked (handover), or accept it as Mac-only. The `reborn` branch (commit `6875608`) exists only locally; the GitHub fork has only `master`. Pushing it is a user decision.
5. **Removal proposals** in [USER-STORIES.md](USER-STORIES.md#keep--remove) (agent-browser, chrome-devtools-axi skill, agent-reach, OpenCLI/Midscene extensions, Playwriter leftovers, omarchy-jev out of routing).
6. **Mac OMP version drift:** `~/.local/bin/omp` 18.2.11 shadows mise 18.3.5 (the rig has 18.4.4). The Mac's relay extension is the 18.2.11 build and lacks the newer `instanceId` handshake. It still works.
7. **Public repo scope:** this section adds scripts and vendored sources to a documentation-only repository. Decide before pushing; see [sources.md](sources.md).

## Per-check results

| ID | Check | omarchy-rig | omarchy-mac |
|---|---|---|---|
| H0 | host | **INFO** omarchy-rig x86_64 omarchy=4.0.4-1 hyprland=0.56.2 | **INFO** omarchy-mac aarch64 omarchy=4.0.4-mac.1 hyprland=0.56.2 |
| C1 | chrome-real-profile | **FAIL** user's Google Chrome (default profile) is not running; only headless/automation profiles found. Relay/JEV/Omni/Unclutter stories cannot run until the user opens Chrome | **PASS** user's Google Chrome (default profile) is running |
| C2 | chrome-extension | **PASS** OMP Browser Relay 0.1.0 unpacked:~/.local/share/omp-integrations/omp-browser-relay | **PASS** OMP Browser Relay 0.1.0 unpacked:~/.local/share/omp-integrations/omp-browser-relay |
| C3 | chrome-extension | **PASS** JEV adapter (unpacked Jev for Chrome) 1.5.1 unpacked:~/.local/share/omp-integrations/jev-browser/extension | **FAIL** JEV adapter (unpacked Jev for Chrome) not installed in Chrome Default profile |
| C4 | chrome-extension | **PASS** Unclutter 0.3.0 unpacked:~/.local/share/omp-integrations/unclutter | **PASS** Unclutter 0.3.0 unpacked:~/.local/share/omp-integrations/unclutter/.output/chrome-mv3 |
| C5 | chrome-extension | **FAIL** Omni Reborn not installed in Chrome Default profile | **PASS** Omni Reborn 2.0.0 unpacked:~/.local/share/omp-integrations/omni-reborn |
| C6 | chrome-extension | **PASS** 1Password 8.12.37.1 webstore | **PASS** 1Password 8.12.37.1 webstore |
| R1 | relay-reachable:9224 | **FAIL** relay server up but Chrome extension not connected (HTTP 503) | **PASS** extension connected (Chrome/154.0.0.0); 3 attachable tabs (not read) |
| R2 | relay-own-tab-open-read-close:9224 | **SKIP** relay not connected | **PASS** opened+read own tab "Example Domain" in 465 ms; closed |
| J1 | jev-mcp-tools | **PASS** bridge.py exposes 5 jev_* tools | **PASS** bridge.py exposes 5 jev_* tools |
| J2 | jev-native-host | **PASS** allowlisted adapter id ejehnkkfjojnekhmilppjddkihniafji is loaded | **FAIL** allowlist=cmenjaijboicmmgjjpepihofamhhedfh but loaded adapter id=none |
| J3 | jev-status | **FAIL** {"error": "EXTENSION_DISCONNECTED"} | **FAIL** {"error": "EXTENSION_DISCONNECTED"} |
| J4 | jev-tabs | **SKIP** adapter disconnected | **SKIP** adapter disconnected |
| O1 | os-hyprctl-read | **PASS** monitors=1 dpms=True workspaces=1 clients=0 activeClass=none locked=false | **PASS** monitors=1 dpms=True workspaces=4 clients=5 activeClass=google-chrome locked=false |
| O2 | os-omarchy-commands | **PASS** 456 omarchy-* commands on PATH (omarchy-menu present) | **PASS** 488 omarchy-* commands on PATH (omarchy-menu present) |
| O3 | os-xdg-open | **PASS** xdg-open present; https handler=google-chrome.desktop (not invoked) | **PASS** xdg-open present; https handler=google-chrome.desktop (not invoked) |
| O4 | os-wayland-cli | **PASS** wl-copy wl-paste wtype grim present | **PASS** wl-copy wl-paste wtype grim present |
| O5 | clipboard-roundtrip | **MANUAL** not run: the battery never touches the user's clipboard (wl-copy/Wispr history) | **MANUAL** not run: the battery never touches the user's clipboard (wl-copy/Wispr history) |
| D1 | drive-screen-doctor | **PASS** prereqs found; pointer available; desktop input untested (needs handover) | **PASS** prereqs found; pointer available; desktop input untested (needs handover) |
| D2 | drive-screen-input | **MANUAL** screenshot/click/type need a live human handover (chrome://extensions, GTK file picker) | **MANUAL** screenshot/click/type need a live human handover (chrome://extensions, GTK file picker) |
| X1 | herdr-pane-create-run-close | **PASS** herdr 0.9.1 [~/.local/bin/herdr=0.9.1]; split pane w1:p2 fg=sh; run+wait-output PASS; panes after close=1 | **PASS** herdr 0.9.1 [~/.local/bin/herdr=0.9.1 /usr/bin/herdr=0.8.2]; split pane w1:p2 fg=bash; run+wait-output PASS; panes after close=1 |
| X2 | herdr-cleanup | **PASS** throwaway session ctlstack-1518455 stopped and deleted | **PASS** throwaway session ctlstack-4034228 stopped and deleted |
| M1 | headless-chrome-temp-profile | **PASS** Google Chrome 154.0.8037.57  dumped example.com in a throwaway profile | **PASS** Google Chrome 154.0.8037.57  dumped example.com in a throwaway profile |
| M2 | omp-native-browser-facade | **INFO** facade is an Eval API (browser.open), tested from OMP Eval, not this script; 2 managed headless profile(s) under ~/.omp/run/daemons | **INFO** facade is an Eval API (browser.open), tested from OMP Eval, not this script; 1 managed headless profile(s) under ~/.omp/run/daemons |
| M3 | agent-browser-headless | **PASS** agent-browser 0.36.0 read example.com title | **SKIP** agent-browser not installed on this host |
| W1 | omp-wiring | **PASS** omp/18.4.4 at ~/.local/share/mise/installs/github-can1357-oh-my-pi/18.4.4/omp; browser-routing extension=yes; mcp=context-mode,grep-app,jev | **PASS** omp/18.2.11 at ~/.local/bin/omp; browser-routing extension=yes; mcp=context-mode,hyperresearch,jev |
| A1 | omarchy-jev-doctor | **PASS** read-only doctor ok; liveControlTested=false (TypeSafe run not executed) | **PASS** read-only doctor ok; liveControlTested=false (TypeSafe run not executed) |
| A2 | agent-reach | **INFO** Agent Reach v1.5.0 (reader CLI, not a control tool) | **INFO** not installed |
| A3 | opencli | **INFO** CLI not installed | **INFO** CLI not installed; Chrome extension present (orphaned without CLI) |
| G1 | gws-readonly | **PASS** gws 0.22.5: gmail getProfile ok (content not recorded) | **PASS** gws 0.22.5: gmail getProfile ok (content not recorded) |
| P1 | op-cli-present | **PASS** op 2.39.0; vault/whoami not queried (would prompt desktop unlock) | **PASS** op 2.39.0; vault/whoami not queried (would prompt desktop unlock) |
| P2 | 1password-autofill | **MANUAL** domain-matched autofill + unlock are human-gated; verified manually 2026-09-28 | **MANUAL** domain-matched autofill + unlock are human-gated; verified manually 2026-09-28 |
| W3 | context-mode-mcp | **INFO** context-mode 1.0.169 via ~/.local/share/mise/installs/node/26.7.0/bin/node ~/.local/share/mise/installs/node/26.7.0/lib/node_modules/context-mode/server.bundle.mjs | **INFO** context-mode 1.0.169 via node ~/.local/share/omp-integrations/context-mode/node_modules/context-mode/server.bundle.mjs |
| S1 | ssh-to-peer | **PASS** omarchy-rig -> omarchy-mac BatchMode ok | **PASS** omarchy-mac -> omarchy-rig BatchMode ok |
| C7 | chrome-extension | — | **INFO** other automation extensions enabled: OpenCLI |
| W2 | omp-version-shadow | — | **INFO** PATH omp is omp/18.2.11 but newest mise omp is 18.3.5 (~/.local/bin/omp) |

Cross-machine (omarchy-rig-to-omarchy-mac):

| ID | Check | Result |
|---|---|---|
| K1 | cross-relay-reachable:omarchy-rig->omarchy-mac | **PASS** extension connected (Chrome/154.0.0.0); 3 attachable tabs (not read) |
| K2 | cross-relay-own-tab-open-read-close:omarchy-rig->omarchy-mac | **PASS** opened+read own tab "Example Domain" in 340 ms; closed |
| K3 | cross-tunnel-closed | **PASS** ssh -L 9225 forward torn down |

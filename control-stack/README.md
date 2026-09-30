# Control stack: how agents drive the two Omarchy machines

This section records which tools an OMP agent uses to control `omarchy-rig` (x86_64) and `omarchy-mac` (Apple Silicon, native Omarchy): browser, desktop, terminals, and the route between the two machines. The goal is **the fewest tools, the fastest route, and every scenario covered**.

- [USER-STORIES.md](USER-STORIES.md): every scenario the user has needed (mined from instructions, lessons, and recent sessions) × target surface, with the chosen tool and fallback per cell, and the keep/remove evidence.
- [RESULTS.md](RESULTS.md): results of the test battery on both hosts (2026-09-29).
- [sources.md](sources.md): upstream URLs, pinned versions, hashes, and the rules for the local copies in `vendor/`.
- [tests/](tests/): the non-disruptive test battery (`run.sh` for one host, `run-both.sh` for both hosts plus the cross-machine route).

> **Scope exception.** The rest of this repository is documentation only. This section also includes test scripts and small vendored extension/skill sources with their licenses, because the user asked to keep local copies in case upstream links disappear. Read [sources.md](sources.md) before publishing it. Nothing here is an installer.

## Final minimal stack

| Layer | Tool | Why it stays |
|---|---|---|
| Deterministic work | Direct CLI/API/config: `hyprctl`, `omarchy-*`, `herdr`, `ssh` (+ `-L` tunnels), `gws`, `op run`, `xdg-open`, `wl-copy`/`wl-paste`, OMP `read` | Fastest and exact. Covers OS state, config changes, terminals, email checks, secret injection, and static pages. |
| User's real Chrome: open, read, script | **OMP Browser Relay** (Chrome extension + `omp browser-relay` on 127.0.0.1:9224), driven by OMP's Eval `browser` facade (`app.relay: true`) or raw CDP | The only tool that both **opens URLs and returns page text** from the logged-in profile. Works across machines through an SSH forward. Measured: open + read + close own tab in 0.34–0.7 s. |
| User's real Chrome: model-planned clicks | **JEV for Chrome** through the `jev` MCP adapter (`bridge.py` + unpacked adapter extension; uses OMP's TypeSafe key) | Plans steps on unfamiliar UIs without spending the main model's context. Cannot read page text or open a typed URL, so it pairs with the relay. |
| Sessionless browser work | OMP Eval `browser` facade with managed headless Chromium | Built into OMP; nothing to install. Frontend E2E tests, JavaScript-heavy public pages. Measured 1.6 s open + read + close. |
| GUI-only fallback | **drive-screen** (screenshots + guarded `wtype`/`wlrctl` input) | Only route to `chrome://extensions`, GTK file pickers, native dialogs, and extension popups. Requires a live human handover. |
| Chrome helpers | **Unclutter** (ads/cookie walls), **Omni Reborn** (keyboard tab moves and tab-group actions), **1Password** (domain-matched autofill) | User-facing extensions that agents can also use; no agent-side install. |
| Human | Secrets, master/unlock passwords, security approvals, 2-step prompts | Never automated. |

Proposed removals are listed in [USER-STORIES.md](USER-STORIES.md#keep--remove). Nothing has been uninstalled.

## Routing order

1. **Direct interface first**: CLI/API/config or `read` for static URLs.
2. **User's real Chrome** (logged-in sessions):
   1. Relay to open the exact page and read its text/state. Use the relay for scripted actions with known selectors.
   2. JEV for multi-step clicks on UIs the agent has not scripted, in the named tab and allowed origins. The agent reviews each proposal. After JEV reports DONE, read the resulting page through the relay.
   3. The standing user rule (2026-09-29) says to try JEV first for every browser step. Because JEV cannot open URLs or return text, this stack uses the relay for those steps. Changing the rule is a [pending user decision](RESULTS.md#needs-the-users-decision).
3. **No session needed**: managed headless Chromium through the Eval `browser` facade.
4. **GUI-only**: drive-screen, only with a current human handover and exact-window focus guards.
5. **Human**: secrets, unlocks, security prompts, and physically blocked steps.

Across machines, work runs on the rig and targets the Mac's desktop. Forward the Mac's relay to the rig (`ssh -f -N -o ExitOnForwardFailure=yes -L 127.0.0.1:9225:127.0.0.1:9224 omarchy-mac`; the rig's own 9224 belongs to the IG reply bot), and close the forward afterwards. OAuth callbacks go the opposite way: forward the rig's `localhost:<port>` to the Mac and open `/launch` in the Mac browser. JEV only reaches Chrome on the host that runs the OMP session.

Privacy rules stay as written in the agent instructions: JEV may observe ordinary authenticated dashboards for the task, but never banking/financial, secret-bearing, or vault pages. The relay and facade operate on the real session, so name a target or create a dedicated tab and never navigate the user's visible tab without authorization.

## Where each tool comes from

Pinned versions observed 2026-09-29. Hashes and vendoring notes are in [sources.md](sources.md).

| Tool | Upstream | omarchy-rig | omarchy-mac | Local copy |
|---|---|---|---|---|
| OMP (includes relay server, Eval `browser`, managed Chromium) | https://github.com/can1357/oh-my-pi | 18.4.4 (mise) | 18.2.11 on PATH (`~/.local/bin/omp`) shadows mise 18.3.5 | version only |
| OMP Browser Relay extension 0.1.0 | same repo, `packages/browser-relay` (MIT) | unpacked, `~/.local/share/omp-integrations/omp-browser-relay` (build from omp 18.4.4) | unpacked, same path (build from omp 18.2.11) | `vendor/omp-browser-relay` (18.4.4 build) |
| JEV for Chrome 1.5.1 + OMP adapter | https://github.com/chy4pro/jev-for-chrome v1.5.1 `5e7e898` (MIT); adapter `bridge.py` is local | adapter loaded unpacked, native host registered | adapter **not loaded**; Web Store Jev 1.5.1 (manual popup) | `vendor/jev-for-chrome-adapter` (built extension + `bridge.py`) |
| drive-screen | https://github.com/coleam00/skills `dfaa910` `.claude/skills/drive-screen` (MIT), adapted; pointer via https://git.sr.ht/~brocellous/wlrctl v0.2.2 (MIT) | installed, wlrctl built | installed, wlrctl built | `vendor/drive-screen` (source only, no binary) |
| Unclutter 0.3.0 | https://github.com/kitze/unclutter `9ef9bec` (MIT) | unpacked build | unpacked build from local source checkout | `vendor/unclutter` (source + chrome-mv3 build) |
| Omni Reborn 2.0.0 | fork https://github.com/jeffscottward/omni-reborn of https://github.com/alyssaxuu/omni (MIT); local branch `reborn` `6875608` **not pushed** | source in `~/Github/tools/omni-reborn`; **not loaded in Chrome** | unpacked, `~/.local/share/omp-integrations/omni-reborn` | `vendor/omni-reborn` (`src/`) |
| browser-routing OMP extension | local | `~/.local/share/omp-integrations/browser-routing/extension.mjs` | identical | `vendor/omp-browser-routing` |
| Herdr 0.9.1 | https://herdr.dev | `~/.local/bin/herdr` | `~/.local/bin/herdr` (older `/usr/bin/herdr` 0.8.2 is shadowed) | not vendored |
| Hyprland 0.56.2 / Omarchy 4.0.4 | https://github.com/hyprwm/Hyprland, https://github.com/basecamp/omarchy | 4.0.4-1 | 4.0.4-mac.1 | OS packages |
| gws 0.22.5 | https://github.com/googleworkspace/cli | `~/.local/bin/gws` | `~/.local/bin/gws` | not vendored |
| 1Password CLI 2.39.0 + extension 8.12.37.1 | https://developer.1password.com/docs/cli/ (proprietary) | `/usr/bin/op`, Web Store extension | same | not vendored (proprietary) |
| context-mode 1.0.169 (context routing, not control) | https://github.com/mksglu/context-mode (Elastic-2.0) | npm global | bundled under `omp-integrations/context-mode` | not vendored (license) |
| Google Chrome 154.0.8037.57 | https://www.google.com/chrome/ | `/usr/bin/google-chrome-stable` | same | not vendored |

## Running the tests

```bash
cd control-stack
bash tests/run.sh                 # this host, relay reachability only
bash tests/run.sh --with-tab      # also open/read/close one own example.com tab through the relay
bash tests/run-both.sh --with-tab # this host, the peer over SSH, and the cross-machine relay route
```

Output is TSV (`id  story  PASS|FAIL|SKIP|MANUAL|INFO  detail`). `run-both.sh` writes `tests/results/*.tsv`. The battery never touches the clipboard, existing tabs, focus, keyboard, or mouse. It never prints credentials, and it cleans up its throwaway Herdr session and SSH forward.

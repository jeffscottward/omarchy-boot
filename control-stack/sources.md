# Sources, pins, and local copies

`vendor/` keeps small, permissively licensed copies of the pieces that are hard to get again if an upstream link disappears: unpacked Chrome extensions, the drive-screen skill, and local glue. Everything else is recorded by URL and version only.

Rules:

- Copy only sources or unpacked builds under a permissive license, with that license next to them. No binaries, `node_modules`, `.git`, `__pycache__`, or backup files.
- Never copy keys, extension storage, Chrome profiles, native-host manifests (they contain host paths and extension IDs), or `agent.db`.
- Record the upstream URL and commit/version, plus a tree hash for each copy (`find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum`, run inside the directory).
- Large or proprietary items: URL + version (+ hash when there is a single artifact) only.
- Refresh a copy when the installed version changes, then rerun `tests/run-both.sh`.

## Vendored

| Directory | What | Upstream / pin | License | Tree hash (sha256) |
|---|---|---|---|---|
| `vendor/omp-browser-relay/` | Unpacked relay extension 0.1.0, as written by `omp browser-relay install` from OMP 18.4.4 (`background.js` sha256 `cd7dffb9…bdef`). The Mac's loaded copy is the older 18.2.11 build | https://github.com/can1357/oh-my-pi `packages/browser-relay` | MIT (`LICENSE`, `THIRD-PARTY-NOTICES.txt`) | `9f6999847e8e83ea1513b900911bed6c9f74f74134fcdf4d30109d7915c3177d` |
| `vendor/jev-for-chrome-adapter/` | `extension/`: built Jev for Chrome 1.5.1 as loaded unpacked on the rig (identical to the Mac's `jev-browser/source/dist`). `bridge.py`: the local OMP MCP adapter (sha256 `567e7793…b330`). `upstream.json` | https://github.com/chy4pro/jev-for-chrome tag v1.5.1, commit `5e7e8980ffdbd8098de964825faee4b229c505f6` | MIT (`LICENSE`); `bridge.py` is local glue | `d3ccc11e4db0868bff55bd1c733d344a443d179400e85b255dc517ef07e099ac` |
| `vendor/drive-screen/` | Adapted drive-screen skill (SKILL.md, scripts, references, pristine `upstream/`, `provenance.json`) plus wlrctl **source** used to build the pointer helper | https://github.com/coleam00/skills commit `dfaa9105741fc5ba9b16b6a72551cad4bad70415`; https://git.sr.ht/~brocellous/wlrctl v0.2.2 `afe60da062ea315b92f2a9857e50b77e0b3a4b7e` | MIT (`LICENSE`, `vendor/wlrctl/LICENSE`) | `052bff7967f50fd2dca5686342ba20219f9675c447b80525bcf3cad92605fb66` |
| `vendor/unclutter/` | `source/`: `git archive` of the Mac checkout. `build-chrome-mv3/`: the unpacked build loaded on both hosts (identical tree on both) | https://github.com/kitze/unclutter commit `9ef9beccc1e57b4e3115ae68644b8fc9c19c29f6` (0.3.0) | MIT (`LICENSE`) | `200ddf73e6aaef94ab7fc10165b883a25e51879703fd75ff1c83ce24ba386453` |
| `vendor/omni-reborn/` | `src/` of Omni Reborn 2.0.0 (identical to the Mac's loaded copy), README, LICENSE | Fork https://github.com/jeffscottward/omni-reborn, local branch `reborn` commit `687560894b40e86f2244d12272da2d986ec347f3` (**not pushed**; the fork only has `master`); upstream https://github.com/alyssaxuu/omni | MIT (`LICENSE`) | `84a8887bcc504b3c30ec9c731d5101a11a03501e93a448fc77a6440a74c95515` |
| `vendor/omp-browser-routing/` | `extension.mjs`, the OMP extension that injects the browser-routing policy (identical on both hosts) | local | local | `70a22c075d516f83c3681eb7025d59d25761133bb3cbfd4c24dc15a2d8797b3c` |

## Recorded only (not vendored)

| Item | Why not vendored | Source / pin |
|---|---|---|
| JEV for Chrome full source tree (159 MB with `node_modules`) | Size; the build and tag are enough | https://github.com/chy4pro/jev-for-chrome v1.5.1 `5e7e898` |
| OMP binary (~228 MB) | Size | https://github.com/can1357/oh-my-pi, rig 18.4.4, Mac 18.2.11 (PATH) / 18.3.5 (mise) |
| drive-screen wlrctl binary | Binary, architecture-specific; rebuild with `python3 scripts/build-pointer.py` | wlrctl v0.2.2 above |
| Herdr 0.9.1 | Binary | https://herdr.dev |
| gws 0.22.5 | Binary | https://github.com/googleworkspace/cli |
| 1Password CLI 2.39.0, 1Password extension 8.12.37.1 (`aeblfdkhhhdcdjpifhhbdiojplfjncoa`) | Proprietary | https://developer.1password.com/docs/cli/, Chrome Web Store |
| context-mode 1.0.169 | Elastic-2.0 license and size | https://github.com/mksglu/context-mode |
| omarchy-jev 0.1.0 | Own public repo; not part of the final stack | https://github.com/jeffscottward/omarchy-jev `fb06db7cc68d2c73924e106b02e91c5c101259ba` |
| agent-browser 0.36.0 | Proposed for removal | https://github.com/vercel-labs/agent-browser (Apache-2.0) |
| agent-reach 1.5.0 | Proposed for removal | https://github.com/Panniantong/agent-reach (MIT) |
| OpenCLI Chrome extension 1.0.24 | Proposed for removal | https://github.com/jackwener/opencli |
| Google Chrome 154.0.8037.57, Hyprland 0.56.2, Omarchy 4.0.4 | OS/vendor packages | https://www.google.com/chrome/, https://github.com/hyprwm/Hyprland, https://github.com/basecamp/omarchy |

## Publishing note

The main README describes this repository as documentation only, with no source trees or executable scripts. This section is a deliberate exception made at the user's request. Before pushing, confirm the user wants the `vendor/` copies and `tests/` scripts in the public repository. The alternative is to keep `vendor/` on a private branch or release asset and publish only the hashes above. A secret-pattern scan and a personal-path scan of `control-stack/` found no matches on 2026-09-29.

# Driving and observing coding-agent sessions on Omarchy

Adapted from Cole Medin's MIT-licensed drive-screen skill, pinned to `dfaa9105741fc5ba9b16b6a72551cad4bad70415`. Full upstream reference is preserved under `upstream/references/driving-agents.md`. The active installation targets Linux/Hyprland on both hosts, not Apple's macOS.

## Prefer sessions and APIs

For OMP sessions use OMP-native process, session, and transcript tools rather than another foreground terminal. For ordinary terminal tasks, prefer an explicitly authorized tmux session or CLI. Do not launch, attach to, or inject into an unrelated existing session. Omarchy commands come before pixel-driven work; read the Omarchy skill before desktop customization.

For browser tasks try JEV, direct APIs, and native OMP browser automation first. Drive-screen is the final GUI fallback before manual work, not a substitute for safer working automation. A missing API is not permission to seize the desktop.

## Claude Code transcript tools

The retained `session_watch.py` reads **Claude Code** JSONL transcripts under `~/.claude/projects`. It does not read OMP transcripts or prove a GUI prompt is awaiting permission. Pin the intended session whenever more than one may exist. Read its `--help` for the full commands (`dir`, `sessions`, `mark`, `wait`, `last`, `reads`). Transcript data can be private: do not send it to a cloud bulk classifier.

The adapted monitor is:

```bash
python3 ~/.local/share/omp-integrations/drive-screen/scripts/autodrive.py \
  --repo /path/to/repository --session SESSION_UUID --timeout 900 --idle 45
```

It is **monitor-only**. Exit 0 means the observed turn ended; 1 means timeout; 3 means a quiet open turn needs human inspection. No screenshots or keystrokes are generated. No `--approve-blind`, permission approval, or automatic retry exists. Completion can precede subagent completion: read the actual final transcript before reporting a task finished.

A quiet/open turn can mean a running tool, thinking, or a prompt. Transcripts can lag the UI; an unanswered tool call is not proof of a permission prompt or its command. If a permission, trust, OS authentication, or vault unlock prompt appears, hand control to the human. Do not send Enter, select "don't ask again", pregrant permissions for a demo, or weaken approval policy.

## Noninteractive verification (Main/operator)

These commands do not capture, focus, read the clipboard, launch windows, or synthesize input:

```bash
python3 ~/.local/share/omp-integrations/drive-screen/scripts/screenctl.py --help
python3 ~/.local/share/omp-integrations/drive-screen/scripts/screenctl.py doctor
python3 ~/.local/share/omp-integrations/drive-screen/scripts/autodrive.py --help
```

`doctor` was changed from upstream: it is strictly read-only, and `doctor --out ...` refuses. It reports binary presence and the selected Hyprland version/lock state, not proof that capture or input works. Over SSH run the same absolute command with `ssh -o BatchMode=yes omarchy-rig ...`; exactly one graphical instance must be discoverable or explicitly selected.

For an authorized target, `list` and `find --id 0x...` inspect window metadata without focus. Titles can be sensitive; never publish/bulk-classify them. Ambiguous title lookup and locked sessions must refuse. Input without `--handover` must fail before desktop access. Pointer commands require exact ID, latest single-use screenshot metadata, and in-bounds PNG coordinates. Missing/expired/replayed/wrong-session metadata, changed geometry, and overlaid layer rectangles refuse rather than guessing coordinates.

Source-only verification may syntax-check/import scripts without calling their `main`; no upstream integration test is approved for an active desktop. The archived `_test_screenctl.py` and `_test_autodrive.py` are upstream artifacts for upstream behavior, not validation of this adaptation.

Build the pinned source with its build-local wheel compatibility patch separately on **each architecture**, without root or Meson:

```bash
python3 ~/.local/share/omp-integrations/drive-screen/scripts/build-pointer.py
ssh omarchy-rig 'python3 ~/.local/share/omp-integrations/drive-screen/scripts/build-pointer.py'
```

Both hosts already have the required compiler, scanner, and development libraries; there is no unavoidable package-auth prerequisite. The script checks `vendor/wlrctl-source.json`, generates protocol code, builds in a temporary directory, and atomically installs `~/.local/libexec/drive-screen/wlrctl`. It never launches or connects to the desktop. Do not copy the binary between architectures.

## Interactive verification (requires a new explicit handover)

1. Obtain task/host desktop handover (existing explicit consent for this task suffices; ordinary benign clicks need no separate consent). Explain that mouse/keyboard use must stop until handback. Use an authorized disposable blank graphical editor and a synthetic browser page with click counters/scrollable content; no secret pages, authentication dialogs, vault screens, or unrelated windows.
2. Run `list`, then `find --id ID`. Pin the exact `0x...` ID. Run `focus --id ID --handover` and require `FOCUS_OK`.
3. Capture `shot --id ID --handover --out /private/new-path.png`; inspect the image and sidecar. Confirm origin, logical geometry, both measured scale axes, PNG size, and the region-not-isolated-window warning. For multi-monitor/scaled layouts, compare the sidecar to the actual editor region. Do not infer functionality from the file merely existing.
4. Type a harmless short Unicode string with `type --id ID --handover --text 'café test'`; capture and inspect. No Enter should be added. Use the editor's harmless navigation keys with `key` and inspect again. Confirm unsupported key names fail without input.
5. With an explicitly approved **nonsecret** clipboard marker, paste a harmless file using `paste --id ID --handover --file /path/to/safe.txt`; choose the actual app's paste shortcut. Inspect the result and confirm the original marker is restored without printing any unknown clipboard content. Non-text clipboard formats must refuse before mutation. Only use multiline text in an editor known not to execute/submit it.
6. Have the human deliberately focus a different disposable window, then attempt a harmless key against the original ID. It must return `FOCUS_LOST` and never refocus or inject. Do not induce focus changes without handover. Monitored wtype delivery reduces but cannot eliminate the focus race; it cannot detect every change between fields in one window.
7. In a fresh inspected screenshot of the editor, choose an interior insertion point. Run `click --id ID --handover --from-shot NEW.png.json --x X --y Y`, with **PNG pixel** X/Y. Capture again, type harmless text, and inspect actual caret placement. Exercise `move`, right-click, and double-click only on benign targets, each with its own fresh screenshot. Right-click may open an app popup; inspect it rather than reusing the old image. Never substitute `sendshortcut mouse:272` or `pass`.
8. On a synthetic scrollable page/editor, capture and choose a point inside the scroll pane. Run `scroll --id ID --handover --from-shot NEW.png.json --x X --y Y --amount 120`; capture and verify content changed in the expected direction. Recapture before `--amount -120`. Check `--horizontal` on an actual horizontal pane. Amounts are continuous axis units, not wheel detents; app/compositor settings affect distance. The protocol emits real axis/stop events, not keyboard navigation.
9. Check guards with harmless synthetic surfaces: replay used metadata, use an expired/wrong-target image, change window size or monitor/workspace layout, use out-of-bounds pixels, and deliberately change focus through the authorized handover. Each must refuse before button/axis dispatch; failed pointer actions never automatically refocus/retry. Inspect actual state after every failure, since an earlier motion/click may already have happened. A visible top/overlay layer over the selected point must refuse. Include fractional scale or negative monitor origins where available; verify mapped cursor and actual app event coordinates, not only CLI output.
10. Do not use live vault material to test safety. Known manager classes without `--safe-ui` refuse; known unlock/sign-in titles and auth classes still refuse. `--safe-ui settings|autofill` permits only human-exposed nonsecret UI, not vault reading. Native-manager text/paste and copy/reveal/submit shortcuts refuse. Browser extension prompts require the operator to enforce the same boundary because their window class is just the browser. There is no secret-field classifier; never test by entering an unlock password.
11. Remove only disposable artifacts you created. Close only windows you opened with authorization. Tell the human what remains open and that desktop handback is complete.

The component worker performed source/dependency inspection and deployment only: no builds, tests, doctor, screenshots, clipboard access, focus changes, launches, or synthetic input. Main/operator owns native builds and actual runtime verification on both desktops; report any behavior not exercised. Cursor/focus checks cannot atomically prove app-popup pointer-surface identity, so screenshot inspection and supervised handover remain essential.

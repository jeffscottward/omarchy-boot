#!/usr/bin/env bash
# Control-stack test battery for one Omarchy host (omarchy-rig or omarchy-mac).
#
# Non-disruptive by design:
#   - never reads, focuses, navigates, or closes an existing browser tab
#   - never touches the clipboard, never injects keys/mouse, never takes screenshots
#   - never prints credentials; gws/op checks report exit status only
#   - Herdr checks run in a throwaway named session that is stopped and deleted
#   - relay tab test (--with-tab) opens ONE own tab on example.com and closes it
#
# Usage: tests/run.sh [--with-tab] [--relay-port N] [--out FILE]
# Output: TSV rows  id <TAB> story <TAB> PASS|FAIL|SKIP|MANUAL|INFO <TAB> detail
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
WITH_TAB=0
RELAY_PORT=9224
OUT=""
while [ $# -gt 0 ]; do
	case "$1" in
		--with-tab) WITH_TAB=1 ;;
		--relay-port) RELAY_PORT="$2"; shift ;;
		--out) OUT="$2"; shift ;;
		-h|--help) sed -n '2,15p' "$0"; exit 0 ;;
		*) echo "unknown arg $1" >&2; exit 2 ;;
	esac
	shift
done

# Keep the caller's PATH order; only append user bin dirs missing in non-interactive SSH shells.
for d in "$HOME/.local/bin" "$HOME/.local/share/mise/shims"; do case ":$PATH:" in *":$d:"*) ;; *) PATH="$PATH:$d" ;; esac; done
export PATH
INTEG="$HOME/.local/share/omp-integrations"
JEV="$INTEG/jev-browser/bridge.py"
DS="$INTEG/drive-screen/scripts/screenctl.py"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PASS=0 FAIL=0 SKIP=0 MANUAL=0

rec() { # id story status detail
	local line
	line="$(printf '%s\t%s\t%s\t%s' "$1" "$2" "$3" "$(printf '%s' "$4" | tr '\t\n' '  ' | cut -c1-300)")"
	echo "$line"
	[ -n "$OUT" ] && echo "$line" >>"$OUT"
	case "$3" in PASS) PASS=$((PASS + 1)) ;; FAIL) FAIL=$((FAIL + 1)) ;; SKIP) SKIP=$((SKIP + 1)) ;; MANUAL) MANUAL=$((MANUAL + 1)) ;; esac
}
have() { command -v "$1" >/dev/null 2>&1; }
js() { if bun --version >/dev/null 2>&1; then bun "$@"; else node "$@"; fi; }
# Over SSH the desktop session variables are absent; attach read-only queries to the
# user's running Hyprland/Wayland session (same uid) when exactly identifiable.
RT="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
if [ -z "${HYPRLAND_INSTANCE_SIGNATURE:-}" ] && [ -d "$RT/hypr" ]; then
	HYPRLAND_INSTANCE_SIGNATURE="$(ls -t "$RT/hypr" | head -1)"; export HYPRLAND_INSTANCE_SIGNATURE
fi
if [ -z "${WAYLAND_DISPLAY:-}" ] && [ -S "$RT/wayland-1" ]; then export WAYLAND_DISPLAY=wayland-1; fi
[ -n "$OUT" ] && : >"$OUT"

# ---------------------------------------------------------------- host
HOST="$(hostname)"
rec H0 host INFO "$HOST $(uname -m) omarchy=$( (omarchy-version 2>/dev/null || cat "$HOME/.local/share/omarchy/version" 2>/dev/null) | head -1) hyprland=$(hyprctl version -j 2>/dev/null | python3 -c 'import json,sys;print(json.load(sys.stdin).get("version","?"))' 2>/dev/null)"

# ---------------------------------------------------------------- real Chrome + extensions
REAL_CHROME=0
for p in $(pgrep -f '^/opt/google/chrome/chrome ' 2>/dev/null); do
	a="$(tr '\0' ' ' <"/proc/$p/cmdline" 2>/dev/null)"
	case "$a" in "/opt/google/chrome/chrome "*) ;; *) continue ;; esac
	case "$a" in *--type=*|*--headless*|*--user-data-dir=*) ;; *) REAL_CHROME=1 ;; esac
done
if [ "$REAL_CHROME" = 1 ]; then
	rec C1 "chrome-real-profile" PASS "user's Google Chrome (default profile) is running"
else
	rec C1 "chrome-real-profile" FAIL "user's Google Chrome (default profile) is not running; only headless/automation profiles found. Relay/JEV/Omni/Unclutter stories cannot run until the user opens Chrome"
fi
python3 "$HERE/lib/chrome-extensions.py" >"$TMP/ext.tsv" 2>/dev/null
ext_check() { # id name-regex location-regex label
	local row
	row="$(awk -F'\t' -v n="$2" -v l="$3" '$1=="Default" && $2 ~ n && $5 ~ l' "$TMP/ext.tsv" | head -1)"
	if [ -z "$row" ]; then
		rec "$1" "chrome-extension" FAIL "$4 not installed in Chrome Default profile"
	elif [ "$(cut -f4 <<<"$row")" != enabled ]; then
		rec "$1" "chrome-extension" FAIL "$4 installed but disabled ($(cut -f3,5 <<<"$row"))"
	else
		rec "$1" "chrome-extension" PASS "$4 $(cut -f3 <<<"$row") $(cut -f5 <<<"$row")"
	fi
}
ext_check C2 '^OMP Browser Relay$' 'unpacked:' 'OMP Browser Relay'
ext_check C3 '^Jev for Chrome$' 'unpacked:~/.local/share/omp-integrations/jev-browser' 'JEV adapter (unpacked Jev for Chrome)'
ext_check C4 '^Unclutter$' '.' 'Unclutter'
ext_check C5 '^Omni Reborn$' 'unpacked:' 'Omni Reborn'
ext_check C6 '^1Password' 'webstore' '1Password'
OTHER="$(awk -F'\t' '$4=="enabled" && $2 ~ /OpenCLI|Midscene|Playwriter|agent-browser|Browser MCP|Claude/ {print $2}' "$TMP/ext.tsv" | paste -sd, -)"
[ -n "$OTHER" ] && rec C7 "chrome-extension" INFO "other automation extensions enabled: $OTHER"

# ---------------------------------------------------------------- OMP Browser Relay
if have bun || have node; then
	R="$(js "$HERE/lib/relay-tab.mjs" "$RELAY_PORT" 2>&1 | tail -1)"
	st="$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["status"])' "$R" 2>/dev/null || echo FAIL)"
	dt="$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["detail"])' "$R" 2>/dev/null || echo "$R")"
	rec R1 "relay-reachable:$RELAY_PORT" "$st" "$dt"
	if [ "$WITH_TAB" = 1 ] && [ "$st" = PASS ]; then
		R="$(js "$HERE/lib/relay-tab.mjs" "$RELAY_PORT" --with-tab 2>&1 | tail -1)"
		rec R2 "relay-own-tab-open-read-close:$RELAY_PORT" "$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["status"])' "$R" 2>/dev/null || echo FAIL)" "$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["detail"])' "$R" 2>/dev/null || echo "$R")"
	elif [ "$WITH_TAB" = 1 ]; then
		rec R2 "relay-own-tab-open-read-close:$RELAY_PORT" SKIP "relay not connected"
	else
		rec R2 "relay-own-tab-open-read-close:$RELAY_PORT" SKIP "run with --with-tab"
	fi
else
	rec R1 relay-reachable FAIL "neither bun nor node on PATH"
fi

# ---------------------------------------------------------------- JEV adapter
if [ -f "$JEV" ]; then
	n="$(python3 "$JEV" tools 2>/dev/null | python3 -c 'import json,sys;d=json.load(sys.stdin);print(len(d if isinstance(d,list) else d.get("tools",[])))' 2>/dev/null)"
	[ "${n:-0}" = 5 ] && rec J1 "jev-mcp-tools" PASS "bridge.py exposes 5 jev_* tools" || rec J1 "jev-mcp-tools" FAIL "bridge.py tools returned ${n:-nothing}"
	nh="$HOME/.config/google-chrome/NativeMessagingHosts/dev.omp.jev.json"
	allowed="$(python3 -c 'import json,sys;print(" ".join(o.split("/")[2] for o in json.load(open(sys.argv[1]))["allowed_origins"]))' "$nh" 2>/dev/null)"
	loaded="$(awk -F'\t' '$2=="Jev for Chrome" && $5 ~ /jev-browser/ {print $6}' "$TMP/ext.tsv" | paste -sd' ' -)"
	if [ -z "$allowed" ]; then rec J2 "jev-native-host" FAIL "native host manifest missing"
	elif [ -n "$loaded" ] && grep -qw -- "$loaded" <<<"$allowed"; then rec J2 "jev-native-host" PASS "allowlisted adapter id $loaded is loaded"
	else rec J2 "jev-native-host" FAIL "allowlist=$allowed but loaded adapter id=${loaded:-none}"
	fi
	s="$(timeout 10 python3 "$JEV" status 2>&1)"; rc=$?
	if [ $rc = 0 ]; then
		rec J3 "jev-status" PASS "$s"
		t="$(echo '{}' | timeout 15 python3 "$JEV" rpc jev_tabs 2>&1)"
		c="$(python3 -c 'import json,sys;print(len(json.loads(sys.argv[1]).get("tabs",[])))' "$t" 2>/dev/null)"
		[ -n "$c" ] && rec J4 "jev-tabs" PASS "$c eligible tabs listed (ids/origins not recorded)" || rec J4 "jev-tabs" FAIL "$(cut -c1-120 <<<"$t")"
	else
		rec J3 "jev-status" FAIL "$s"
		rec J4 "jev-tabs" SKIP "adapter disconnected"
	fi
else
	rec J1 "jev-mcp-tools" FAIL "bridge.py not installed"
fi

# ---------------------------------------------------------------- OS control (read-only)
if have hyprctl && hyprctl version >/dev/null 2>&1; then
	mon="$(hyprctl monitors -j | python3 -c 'import json,sys;m=json.load(sys.stdin);print(len(m), "dpms=" + ",".join(str(x["dpmsStatus"]) for x in m))')"
	ws="$(hyprctl workspaces -j | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
	cl="$(hyprctl clients -j | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
	aw="$(hyprctl activewindow -j | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d.get("class") or "none")' 2>/dev/null)"
	rec O1 "os-hyprctl-read" PASS "monitors=$mon workspaces=$ws clients=$cl activeClass=$aw locked=$(hyprctl locked 2>/dev/null | head -1)"
else
	rec O1 "os-hyprctl-read" FAIL "hyprctl cannot reach a Hyprland instance"
fi
nom="$(compgen -c omarchy- | sort -u | wc -l)"
have omarchy-menu && rec O2 "os-omarchy-commands" PASS "$nom omarchy-* commands on PATH (omarchy-menu present)" || rec O2 "os-omarchy-commands" FAIL "omarchy-menu not on PATH ($nom omarchy-* commands)"
h="$(xdg-mime query default x-scheme-handler/https 2>/dev/null)"
have xdg-open && [ -n "$h" ] && rec O3 "os-xdg-open" PASS "xdg-open present; https handler=$h (not invoked)" || rec O3 "os-xdg-open" FAIL "xdg-open=$(command -v xdg-open) handler=${h:-none}"
miss=""; for b in wl-copy wl-paste wtype grim; do have "$b" || miss="$miss $b"; done
[ -z "$miss" ] && rec O4 "os-wayland-cli" PASS "wl-copy wl-paste wtype grim present" || rec O4 "os-wayland-cli" FAIL "missing:$miss"
rec O5 "clipboard-roundtrip" MANUAL "not run: the battery never touches the user's clipboard (wl-copy/Wispr history)"

# ---------------------------------------------------------------- drive-screen (read-only doctor)
if [ -f "$DS" ]; then
	d="$(timeout 30 python3 "$DS" doctor 2>&1)"; rc=$?
	if [ $rc = 0 ] && grep -q 'POINTER:.*available' <<<"$d"; then rec D1 "drive-screen-doctor" PASS "prereqs found; pointer available; desktop input untested (needs handover)"
	else rec D1 "drive-screen-doctor" FAIL "rc=$rc $(grep -E 'missing|unavailable|error' -i <<<"$d" | head -2)"
	fi
	rec D2 "drive-screen-input" MANUAL "screenshot/click/type need a live human handover (chrome://extensions, GTK file picker)"
else
	rec D1 "drive-screen-doctor" FAIL "drive-screen not installed"
fi

# ---------------------------------------------------------------- Herdr throwaway session
if have herdr; then
	HV="$(herdr --version 2>&1 | head -1)"
	SHADOW="$(type -ap herdr | awk '!s[$0]++' | while read -r b; do echo "$b=$("$b" --version 2>/dev/null | awk '{print $2}')"; done | sed "s#$HOME#~#g" | paste -sd' ' -)"
	S="ctlstack-$$"
	UNSET=""; for v in $(env | grep -o '^HERDR[A-Z_]*'); do UNSET="$UNSET -u $v"; done
	H() { env $UNSET herdr --session "$S" "$@"; }
	setsid env $UNSET OMP_AUTO_START=0 TERM=xterm-256color script -qfc "herdr session attach $S" /dev/null </dev/null >/dev/null 2>&1 &
	ok=0
	for _ in $(seq 1 20); do H pane list >/dev/null 2>&1 && { ok=1; break; }; sleep 0.5; done
	if [ $ok = 1 ]; then
		p1="$(H pane list 2>/dev/null | python3 -c 'import json,sys;print(json.load(sys.stdin)["result"]["panes"][0]["pane_id"])')"
		p2="$(H pane split "$p1" --direction down --no-focus --env OMP_AUTO_START=0 2>/dev/null | python3 -c 'import json,sys;d=json.load(sys.stdin)["result"];print((d.get("pane") or d).get("pane_id",""))' 2>/dev/null)"
		sleep 1
		proc="$(H pane process-info --pane "$p2" 2>/dev/null | python3 -c 'import json,sys;print(",".join(p["name"] for p in json.load(sys.stdin)["result"]["process_info"]["foreground_processes"]))' 2>/dev/null)"
		M="CTLSTACK_$$_OK"
		H pane run "$p2" "echo ${M%_OK}_\$((1+1))_OK" >/dev/null 2>&1
		if H pane wait-output "$p2" --match "${M%_OK}_2_OK" --timeout 8000 >/dev/null 2>&1; then r=PASS; else r=FAIL; fi
		H pane close "$p2" >/dev/null 2>&1
		left="$(H pane list 2>/dev/null | python3 -c 'import json,sys;print(len(json.load(sys.stdin)["result"]["panes"]))' 2>/dev/null)"
		rec X1 "herdr-pane-create-run-close" "$r" "$HV [$SHADOW]; split pane $p2 fg=${proc:-?}; run+wait-output ${r}; panes after close=$left"
	else
		rec X1 "herdr-pane-create-run-close" FAIL "$HV: throwaway session server did not start"
	fi
	H server stop >/dev/null 2>&1; sleep 1
	pkill -f "herdr session attach $S" 2>/dev/null
	herdr session delete "$S" >/dev/null 2>&1
	herdr session list 2>/dev/null | grep -q "^$S " && rec X2 "herdr-cleanup" FAIL "session $S left behind" || rec X2 "herdr-cleanup" PASS "throwaway session $S stopped and deleted"
else
	rec X1 "herdr-pane-create-run-close" FAIL "herdr not on PATH"
fi

# ---------------------------------------------------------------- managed / headless browsers
CH="$(command -v google-chrome-stable || command -v chromium)"
if [ -n "$CH" ]; then
	prof="$TMP/chrome-profile"
	if timeout 45 "$CH" --headless=new --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="$prof" --dump-dom https://example.com/ 2>/dev/null | grep -q 'Example Domain'; then
		rec M1 "headless-chrome-temp-profile" PASS "$($CH --version 2>/dev/null) dumped example.com in a throwaway profile"
	else rec M1 "headless-chrome-temp-profile" FAIL "$CH headless dump failed"
	fi
fi
dm="$(ls -d "$HOME"/.omp/run/daemons/*/omp.browser.headless.profile 2>/dev/null | wc -l)"
rec M2 "omp-native-browser-facade" INFO "facade is an Eval API (browser.open), tested from OMP Eval, not this script; $dm managed headless profile(s) under ~/.omp/run/daemons"
if have agent-browser; then
	sess="ctlstack$$"
	t="$(timeout 60 agent-browser --session "$sess" open https://example.com/ >/dev/null 2>&1 && timeout 20 agent-browser --session "$sess" get title 2>/dev/null)"
	timeout 20 agent-browser --session "$sess" close >/dev/null 2>&1
	grep -q 'Example Domain' <<<"$t" && rec M3 "agent-browser-headless" PASS "$(agent-browser --version) read example.com title" || rec M3 "agent-browser-headless" FAIL "$(agent-browser --version 2>&1) could not read example.com"
else
	rec M3 "agent-browser-headless" SKIP "agent-browser not installed on this host"
fi

# ---------------------------------------------------------------- OMP wiring
OV="$(omp --version 2>/dev/null)"
cfg="$HOME/.omp/agent/config.yml"
grep -q 'browser-routing/extension.mjs' "$cfg" 2>/dev/null && br=yes || br=no
mcp="$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));print(",".join(sorted((d.get("mcpServers") or d).keys())))' "$HOME/.omp/agent/mcp.json" 2>/dev/null)"
grep -q jev <<<"$mcp" && grep -q context-mode <<<"$mcp" && [ $br = yes ] && st=PASS || st=FAIL
rec W1 "omp-wiring" "$st" "$OV at $(command -v omp | sed "s#$HOME#~#"); browser-routing extension=$br; mcp=$mcp"
MV="$(ls "$HOME/.local/share/mise/installs/github-can1357-oh-my-pi" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)"
[ -n "$MV" ] && [ "omp/$MV" != "$OV" ] && rec W2 "omp-version-shadow" INFO "PATH omp is $OV but newest mise omp is $MV ($(command -v omp | sed "s#$HOME#~#"))"

# ---------------------------------------------------------------- other CLIs (presence / read-only)
if have omarchy-jev; then
	d="$(timeout 20 omarchy-jev doctor 2>/dev/null)"
	grep -q '"sessionFound": true' <<<"$d" && rec A1 "omarchy-jev-doctor" PASS "read-only doctor ok; liveControlTested=false (TypeSafe run not executed)" || rec A1 "omarchy-jev-doctor" FAIL "$(cut -c1-120 <<<"$d")"
else rec A1 "omarchy-jev-doctor" SKIP "not installed"
fi
have agent-reach && rec A2 "agent-reach" INFO "$(agent-reach --version 2>&1 | head -1) (reader CLI, not a control tool)" || rec A2 "agent-reach" INFO "not installed"
have opencli && rec A3 "opencli" INFO "$(opencli --version 2>&1 | head -1)" || rec A3 "opencli" INFO "CLI not installed$(grep -q OpenCLI "$TMP/ext.tsv" && echo '; Chrome extension present (orphaned without CLI)')"
if have gws; then
	g="$(timeout 30 gws gmail users getProfile --params '{"userId":"me"}' 2>&1)"; rc=$?
	if [ $rc = 0 ] && grep -q emailAddress <<<"$g"; then rec G1 "gws-readonly" PASS "$(gws --version 2>/dev/null | head -1): gmail getProfile ok (content not recorded)"
	else rec G1 "gws-readonly" FAIL "$(gws --version 2>/dev/null | head -1): rc=$rc $(grep -o -i -E 'invalid_grant|unauthenticated|401|403|expired|revoked|no credentials|not authenticated' <<<"$g" | sort -u | paste -sd, -)"
	fi
else rec G1 "gws-readonly" FAIL "gws not installed"
fi
have op && rec P1 "op-cli-present" PASS "op $(op --version); vault/whoami not queried (would prompt desktop unlock)" || rec P1 "op-cli-present" FAIL "op not installed"
rec P2 "1password-autofill" MANUAL "domain-matched autofill + unlock are human-gated; verified manually 2026-09-28"
cm="$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));s=(d.get("mcpServers") or d)["context-mode"];print(" ".join([s.get("command","")]+s.get("args",[])[:1]))' "$HOME/.omp/agent/mcp.json" 2>/dev/null)"
cmv="$(python3 -c 'import json,os,sys;p=sys.argv[1].split()[-1];d=os.path.dirname(p);print(json.load(open(os.path.join(d,"package.json"))).get("version","?"))' "$cm" 2>/dev/null)"
cm="$(sed "s#$HOME#~#g" <<<"$cm")"
rec W3 "context-mode-mcp" INFO "context-mode ${cmv:-?} via ${cm:-not configured}"

# ---------------------------------------------------------------- cross-machine
case "$HOST" in omarchy-rig) PEER=omarchy-mac ;; omarchy-mac) PEER=omarchy-rig ;; *) PEER="" ;; esac
if [ -n "$PEER" ]; then
	ph="$(timeout 10 ssh -o BatchMode=yes -o ConnectTimeout=5 "$PEER" hostname 2>/dev/null)"
	[ "$ph" = "$PEER" ] && rec S1 "ssh-to-peer" PASS "$HOST -> $PEER BatchMode ok" || rec S1 "ssh-to-peer" FAIL "$HOST -> $PEER got '${ph:-no answer}'"
fi

printf '# %s summary: PASS=%d FAIL=%d SKIP=%d MANUAL=%d\n' "$HOST" "$PASS" "$FAIL" "$SKIP" "$MANUAL"
[ -n "$OUT" ] && printf '# %s summary: PASS=%d FAIL=%d SKIP=%d MANUAL=%d\n' "$HOST" "$PASS" "$FAIL" "$SKIP" "$MANUAL" >>"$OUT"
exit 0

#!/usr/bin/env bash
# Run the battery on this host and its peer, plus the cross-machine relay route.
#   tests/run-both.sh [--with-tab]
# Writes tests/results/<host>.tsv, tests/results/<peer>.tsv, tests/results/cross-<host>-to-<peer>.tsv
# The peer copy runs from a private temp dir that is removed afterwards.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
RES="$HERE/results"
mkdir -p "$RES"
EXTRA=()
[ "${1:-}" = "--with-tab" ] && EXTRA=(--with-tab)
HOST="$(hostname)"
case "$HOST" in omarchy-rig) PEER=omarchy-mac ;; omarchy-mac) PEER=omarchy-rig ;; *) echo "unknown host $HOST" >&2; exit 2 ;; esac
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=8)

echo "== $HOST (local)"
bash "$HERE/run.sh" "${EXTRA[@]}" --out "$RES/$HOST.tsv"

echo "== $PEER (via ssh)"
REMOTE="$("${SSH[@]}" "$PEER" 'mktemp -d /tmp/ctlstack.XXXXXX')" || { echo "peer unreachable" >&2; exit 1; }
tar -C "$HERE" -cf - run.sh lib | "${SSH[@]}" "$PEER" "tar -xf - -C '$REMOTE'"
"${SSH[@]}" "$PEER" "bash -lc 'bash $REMOTE/run.sh ${EXTRA[*]} --out $REMOTE/out.tsv >/dev/null 2>&1; cat $REMOTE/out.tsv; rm -rf $REMOTE'" | tee "$RES/$PEER.tsv"

# Cross-machine: reach the peer's own relay (its 127.0.0.1:9224) through a temporary
# local forward on 9225. Local 9224 may belong to another consumer (IG reply bot on the rig).
echo "== cross: $HOST -> $PEER relay via 127.0.0.1:9225"
X="$RES/cross-$HOST-to-$PEER.tsv"
: >"$X"
if ss -ltn 2>/dev/null | grep -q '127.0.0.1:9225 '; then
	printf 'K1\tcross-relay-tunnel\tSKIP\tlocal port 9225 already in use; not reusing a foreign listener\n' | tee -a "$X"
else
	"${SSH[@]}" -f -N -o ExitOnForwardFailure=yes -L 127.0.0.1:9225:127.0.0.1:9224 "$PEER"
	sleep 1
	TPID="$(pgrep -f -- '-L 127.0.0.1:9225:127.0.0.1:9224' | head -1)"
	js() { if bun --version >/dev/null 2>&1; then bun "$@"; else node "$@"; fi; }
	for mode in reach "${EXTRA[@]}"; do
		arg=(); [ "$mode" = --with-tab ] && arg=(--with-tab)
		R="$(js "$HERE/lib/relay-tab.mjs" 9225 "${arg[@]}" | tail -1)"
		st="$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["status"])' "$R" 2>/dev/null || echo FAIL)"
		dt="$(python3 -c 'import json,sys;print(json.loads(sys.argv[1])["detail"])' "$R" 2>/dev/null || echo "$R")"
		id=K1; [ "$mode" = --with-tab ] && id=K2
		lbl=reachable; [ "$mode" = --with-tab ] && lbl=own-tab-open-read-close
		printf '%s\tcross-relay-%s:%s->%s\t%s\t%s\n' "$id" "$lbl" "$HOST" "$PEER" "$st" "$dt" | tee -a "$X"
	done
	[ -n "$TPID" ] && kill "$TPID"
	sleep 0.5
	pgrep -f -- '-L 127.0.0.1:9225:127.0.0.1:9224' >/dev/null && st=FAIL || st=PASS
	printf 'K3\tcross-tunnel-closed\t%s\tssh -L 9225 forward torn down\n' "$st" | tee -a "$X"
fi

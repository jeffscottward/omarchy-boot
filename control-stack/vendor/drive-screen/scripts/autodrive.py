#!/usr/bin/env python3
"""Monitor a pinned Claude Code turn; never capture, focus, type, or approve.

Linux safety adaptation of coleam00/skills drive-screen (MIT, Cole Medin 2026).
Original pinned source is archived in ../upstream, not an approved executable path.
This is not an OMP transcript reader. Use OMP-native session tools for OMP sessions.
"""
from __future__ import annotations

import argparse
import time

import session_watch as sw


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--session", required=True, help="Pin the exact driven Claude Code session, never newest-by-time.")
    parser.add_argument("--timeout", type=float, default=900)
    parser.add_argument("--idle", type=float, default=45)
    parser.add_argument("--poll", type=float, default=3)
    args = parser.parse_args()
    if min(args.timeout, args.idle, args.poll) <= 0:
        parser.error("timeout, idle, and poll must be positive")
    sw.PIN = args.session
    path = sw.latest(args.repo)
    records = sw.records(path)
    baseline = len(sw.turn_ends(records))
    count = len(records)
    changed = time.monotonic()
    deadline = changed + args.timeout
    print("MONITOR_ONLY: no screenshots, desktop input, or autonomous permission approval.")
    while time.monotonic() < deadline:
        records = sw.records(path)
        if len(sw.turn_ends(records)) > baseline or not sw.turn_in_flight(records):
            print("TURN_COMPLETE: inspect the actual final transcript; completion may precede subagent completion.")
            return 0
        if len(records) != count:
            count = len(records)
            changed = time.monotonic()
        elif time.monotonic() - changed >= args.idle:
            print("HUMAN_REQUIRED: turn is open and quiet. This does not prove a permission prompt.")
            print("No command is approved. Hand back for human review; never send Enter blindly.")
            return 3
        time.sleep(args.poll)
    print("TIMEOUT: session may still be working; nothing was approved.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

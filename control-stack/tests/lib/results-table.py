#!/usr/bin/env python3
"""Render tests/results/*.tsv as a Markdown table (rig vs Mac, then cross-machine rows)."""
import csv
import glob
import os
import sys

res = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'results')


def load(path):
    try:
        return {r[0]: r for r in csv.reader(open(path), delimiter='\t') if r and not r[0].startswith('#')}
    except FileNotFoundError:
        return {}


def cell(row):
    return '—' if not row else f"**{row[2]}** {row[3].replace('|', '\\|')}"


rig, mac = load(os.path.join(res, 'omarchy-rig.tsv')), load(os.path.join(res, 'omarchy-mac.tsv'))
print('| ID | Check | omarchy-rig | omarchy-mac |')
print('|---|---|---|---|')
for i in dict.fromkeys(list(rig) + list(mac)):
    r, m = rig.get(i), mac.get(i)
    print(f"| {i} | {(r or m)[1]} | {cell(r)} | {cell(m)} |")
for path in sorted(glob.glob(os.path.join(res, 'cross-*.tsv'))):
    print()
    print(f"Cross-machine ({os.path.basename(path)[6:-4]}):")
    print()
    print('| ID | Check | Result |')
    print('|---|---|---|')
    for i, r in load(path).items():
        print(f"| {i} | {r[1]} | {cell(r)} |")

#!/usr/bin/env python3
"""List Chrome extensions (name/version/state/location/id) per profile.

Reads extension manifests and the extension-settings section of the Chrome
Preferences files only (path/location/state). Never reads cookies, history,
storage, or credentials.
"""
import glob
import json
import os

HOME = os.path.expanduser('~')
BASE = os.path.join(HOME, '.config/google-chrome')


def resolve(name, mfdir):
    if not name.startswith('__MSG_'):
        return name
    key = name[6:-2].lower()
    for loc in ('en', 'en_US', 'en_GB'):
        try:
            msgs = json.load(open(os.path.join(mfdir, '_locales', loc, 'messages.json')))
        except Exception:
            continue
        for k, v in msgs.items():
            if k.lower() == key:
                return v.get('message', name)
    return name


for prof in sorted(glob.glob(BASE + '/*/')):
    pname = os.path.basename(prof.rstrip('/'))
    if pname != 'Default' and not pname.startswith('Profile'):
        continue
    rows = {}
    for mf in glob.glob(prof + 'Extensions/*/*/manifest.json'):
        eid = mf.split('/')[-3]
        try:
            m = json.load(open(mf))
        except Exception:
            continue
        rows[eid] = [resolve(m.get('name', '?'), os.path.dirname(mf)), m.get('version', '?'), 'webstore', None]
    for pf in ('Secure Preferences', 'Preferences'):
        try:
            p = json.load(open(prof + pf))
        except Exception:
            continue
        for eid, s in (p.get('extensions', {}).get('settings', {}) or {}).items():
            path = s.get('path', '')
            if s.get('location') == 4 and path:  # unpacked
                name, ver = '?', '?'
                try:
                    m = json.load(open(os.path.join(path, 'manifest.json')))
                    name, ver = resolve(m.get('name', '?'), path), m.get('version', '?')
                except Exception:
                    pass
                rows[eid] = [name, ver, 'unpacked:' + path.replace(HOME, '~'), None]
            if eid in rows:
                state, dis = s.get('state'), s.get('disable_reasons')
                enabled = (state == 1) if state is not None else (not dis)
                rows[eid][3] = 'enabled' if enabled else 'disabled'
    for eid, (n, v, loc, en) in sorted(rows.items(), key=lambda kv: kv[1][0].lower()):
        if n.startswith('__MSG_') or n in ('Web Store', 'Chrome Web Store Payments', 'Google Docs Offline', 'Chromium PDF Viewer'):
            continue
        print(f"{pname}\t{n}\t{v}\t{en or '?'}\t{loc}\t{eid}")

#!/usr/bin/env python3
# Operator 112: print the open launch PR board as markdown (head, merge state, latest verdict per lens, * = at current head).
# usage: python3 board.py > board.md   (needs gh with api_credentials github)
import json, re, subprocess, sys, datetime
def gh(args):
    return subprocess.run(['timeout', '60', 'gh'] + args, capture_output=True, text=True).stdout
def lens_name(l):
    l = l.lower()
    if 'sol' in l or 'gpt' in l: return 'Sol'
    if 'opus' in l or 'claude' in l: return 'Opus'
    return l[:10]
out = []
for repo, floor in (('growth-project-backend', 595), ('growth-project-mobile', 305)):
    full = 'BradleyGleavePortfolio/' + repo
    prs = json.loads(gh(['pr', 'list', '-R', full, '--state', 'open', '--limit', '200', '--json', 'number,title,headRefOid,headRefName,baseRefName,mergeStateStatus,author']) or '[]')
    prs = [p for p in prs if p['number'] >= floor and not p['headRefName'].startswith('dependabot/')]
    prs.sort(key=lambda p: p['number'])
    out.append(f"\n**{repo}** ({len(prs)} open launch PRs; dependabot bumps and pre-launch PRs omitted)\n")
    out.append('| PR | Head | State | Base | Latest Opus | Latest Sol | Title |')
    out.append('|---|---|---|---|---|---|---|')
    for p in prs:
        head = p['headRefOid']
        raw = gh(['api', f'repos/{full}/issues/{p["number"]}/comments?per_page=100', '--paginate'])
        try: cs = json.loads(raw.replace('][', ','))
        except Exception: cs = []
        latest = {}
        for c in cs:
            first = c['body'].split('\n', 1)[0]
            if not first.startswith('AUDIT'): continue
            m = re.search(r'AUDIT\s+(.*?)\s+—.*?@\s*([0-9a-f]{7,40}).*?VERDICT:\s*([A-Z ]+)', first)
            if not m: continue
            ln = lens_name(m.group(1)); sha = m.group(2); v = m.group(3).strip()
            mark = '*' if head.startswith(sha[:8]) else ''
            latest[ln] = f"{v} @{sha[:8]}{mark}"
        base = p['baseRefName'] if p['baseRefName'] != 'main' else 'main'
        t = p['title'].replace('|', '/')[:90]
        out.append(f"| #{p['number']} | {head[:8]} | {p['mergeStateStatus']} | {base[:28]} | {latest.get('Opus','-')} | {latest.get('Sol','-')} | {t} |")
print('\n'.join(out))

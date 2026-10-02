#!/usr/bin/env python3
# usage: verdicts.py backend 607 635 ... | verdicts.py mobile 326 ...  (needs gh with api_credentials github)
import json, re, subprocess, sys
repo = 'BradleyGleavePortfolio/growth-project-' + sys.argv[1]
def gh(args):
    return subprocess.run(['timeout', '45', 'gh'] + args, capture_output=True, text=True).stdout
for n in sys.argv[2:]:
    pr = json.loads(gh(['api', f'repos/{repo}/pulls/{n}']) or '{}')
    head = pr.get('head', {}).get('sha', '?')
    print(f"== #{n} head={head[:8]} state={pr.get('state')} mergeable={pr.get('mergeable_state')} branch={pr.get('head',{}).get('ref')} base={pr.get('base',{}).get('ref')}")
    raw = gh(['api', f'repos/{repo}/issues/{n}/comments?per_page=100', '--paginate'])
    try:
        cs = json.loads(raw.replace('][', ','))
    except Exception:
        cs = []
    for c in cs:
        first = c['body'].split('\n', 1)[0]
        if not first.startswith('AUDIT'):
            continue
        m = re.search(r'AUDIT\s+(.*?)\s+—.*?@\s*([0-9a-f]{7,40}).*?VERDICT:\s*([A-Z ]+)', first)
        if m:
            lens, sha, v = m.group(1), m.group(2), m.group(3).strip()
            mark = '*' if head.startswith(sha[:8]) else ' '
            print(f"  {mark} {c['created_at']} {lens[:22]:22} {sha[:8]} {v}")
        else:
            print('    ?', c['created_at'], first[:120])

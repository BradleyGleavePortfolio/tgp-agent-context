#!/usr/bin/env python3
"""LN-OPUS-D3-129 board reader: lists PRs that need an Opus verdict at the head.
Masks the Sol column so no Sol verdict is read before an Opus verdict is posted."""
import json, re, time

b = json.load(open('/home/user/workspace/ops/board/board.json'))
print('board updated', b.get('updated_pdt'), 'age_s', int(time.time() - b.get('updated_epoch', 0)))
cands = []
import datetime
skip = set()
try:
    for l in open('/home/user/workspace/ops/reports/LN-OPUS-D3-129-skip.txt'):
        f = l.split()
        if len(f) >= 3:
            t = datetime.datetime.strptime(f[2], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=datetime.timezone.utc)
            if (datetime.datetime.now(datetime.timezone.utc) - t).total_seconds() < 45 * 60:
                skip.add((f[0], f[1]))
except FileNotFoundError:
    pass
done = set()
try:
    for l in open('/home/user/workspace/ops/reports/LN-OPUS-D3-129-done.txt'):
        if l.strip(): done.add(tuple(l.split()[:2]))
except FileNotFoundError:
    pass
for p in b['prs']:
    opus_claims = []
    for c in p.get('claims_at_head', []):
        m = re.match(r'OPUS LENS:(\S+) (\d+)m', c)
        if m:
            opus_claims.append((m.group(1), int(m.group(2))))
    needs = re.sub(r'REQUEST CHANGES by Sol', 'fix requested (other lens)', p.get('needs', ''))
    needs = needs.replace(' and Sol', '')
    free = (p['ready_at_head'] and not p['draft'] and p['opus'] == '-' and
            not any(age < 45 for _, age in opus_claims) and (p['pr'], p['head']) not in done and (p['pr'], p['head']) not in skip)
    line = f"{p['pr']:<8} {'FREE ' if free else '     '} ready={str(p['ready_at_head'])[0]} draft={str(p['draft'])[0]} ci={p['ci']:<6} opus={p['opus']:<16} lines={p['lines']:<5} merge={p.get('merge')} opus_claims={opus_claims} | {p['title'][:70]} | {needs}"
    print(line)
    if free:
        cands.append(p)
print('FREE for Opus:', [(p['pr'], p['head'][:8], (p.get('last_ready') or '')[:90]) for p in cands])

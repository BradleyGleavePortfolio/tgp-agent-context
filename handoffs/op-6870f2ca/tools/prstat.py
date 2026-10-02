import json,subprocess,sys,re
repo=sys.argv[1]; nums=sys.argv[2:]
for n in nums:
    d=json.loads(subprocess.check_output(['gh','pr','view',n,'-R',f'BradleyGleavePortfolio/{repo}','--json','number,state,headRefOid,mergeStateStatus,baseRefName,body,comments,title']))
    head=d['headRefOid']
    m=re.search(r'\*\*Tier\*?\*?[:|]*\s*\*?\*?\s*\|?\s*\*?\*?(T[0-4])',d['body'] or '') or re.search(r'Tier[^T\n]{0,20}(T[0-4])',d['body'] or '')
    tier=m.group(1) if m else '?'
    v=[]
    for c in d['comments']:
        b=c['body']
        if b.startswith('AUDIT') and head in b[:300]:
            who=re.match(r'AUDIT ([^—]+?) —',b); verdict=re.search(r'VERDICT: ([A-Z ]+?)(\n|$|\s{2})',b)
            v.append(f"{who.group(1).strip() if who else '?'}:{verdict.group(1).strip() if verdict else '?'}")
    print(f"#{d['number']} {d['state']} {head[:8]} {d['mergeStateStatus']} base={d['baseRefName']} {tier} | {', '.join(v) or '-'} | {d['title'][:60]}")

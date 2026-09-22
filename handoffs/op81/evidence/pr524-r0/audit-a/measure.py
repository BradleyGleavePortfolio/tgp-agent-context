import subprocess, json, pathlib, re, hashlib, datetime
root=pathlib.Path('/home/user/workspace/tgp-study/op81-backend-audit-a')
out=pathlib.Path('/home/user/workspace/tgp-study/op81-execution/audit-a')
def git(*args): return subprocess.check_output(['git','-C',str(root),*args],text=True)
base='c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7'
diff=git('diff',base,'HEAD')
(out/'complete.diff').write_text(diff)
a=json.loads(git('show',base+':package-lock.json'))['packages']
b=json.loads((root/'package-lock.json').read_text())['packages']
changes=[]
for p in sorted(a.keys()|b.keys()):
    if a.get(p)!=b.get(p):
        changes.append(dict(path=p,before=a.get(p),after=b.get(p)))
(out/'lock-changes.json').write_text(json.dumps(changes,indent=2)+'\n')
report=[]
for c in changes:
    x,y=c['before'],c['after']
    report.append(f"{c['path'] or '<root>'}: {x.get('version') if x else '-'} -> {y.get('version') if y else '-'}; fields={','.join(k for k in sorted((x or {}).keys()|(y or {}).keys()) if (x or {}).get(k)!=(y or {}).get(k))}")
(out/'lock-inventory.txt').write_text('\n'.join(report)+'\n')
tokens=['@ts-ignore','as any','as unknown as','as never','.catch(()=>undefined)','.catch(()=>null)','.catch(()=>{})','Coming soon']
added='\n'.join(x[1:] for x in diff.splitlines() if x.startswith('+') and not x.startswith('+++'))
removed='\n'.join(x[1:] for x in diff.splitlines() if x.startswith('-') and not x.startswith('---'))
data={
'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),
'head':git('rev-parse','HEAD').strip(),'tree':git('rev-parse','HEAD^{tree}').strip(),
'status':git('status','--porcelain=v1'),
'numstat':git('diff','--numstat',base,'HEAD'),
'lockEntriesBefore':len(a),'lockEntriesAfter':len(b),
'addedEntries':sum(x['before'] is None for x in changes),
'removedEntries':sum(x['after'] is None for x in changes),
'modifiedEntries':sum(x['before'] is not None and x['after'] is not None for x in changes),
'tokens':{t:{'added':added.count(t),'removed':removed.count(t),'net':added.count(t)-removed.count(t)} for t in tokens},
'candidateLockSHA256':hashlib.sha256((root/'package-lock.json').read_bytes()).hexdigest(),
'nonRegistryResolved':[(p,v.get('resolved')) for p,v in b.items() if p and v.get('resolved') and not v['resolved'].startswith('https://registry.npmjs.org/')],
'missingIntegrity': [p for p,v in b.items() if p and not v.get('integrity')],
'installScriptsChanged':[(c['path'],c['before'] and c['before'].get('hasInstallScript'),c['after'] and c['after'].get('hasInstallScript')) for c in changes if (c['before'] or {}).get('hasInstallScript') or (c['after'] or {}).get('hasInstallScript')],
}
(out/'measurements.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps(data,indent=2))
print('\n'.join(report))

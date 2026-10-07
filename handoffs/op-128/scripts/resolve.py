import re, sys, subprocess, os
path, owned = sys.argv[1], set(sys.argv[2].split(','))
src = open(path).read().split('\n')
out, i = [], 0
key = lambda l: (re.match(r'\|\s*(.+?)\s*\|', l) or [None, l])[1]
def own(k): return any(o in k for o in owned)
while i < len(src):
    l = src[i]
    if l.startswith('<<<<<<< '):
        j = src.index('=======', i); k = next(x for x in range(j, len(src)) if src[x].startswith('>>>>>>> '))
        head, main = src[i+1:j], src[j+1:k]
        hk = {key(x): x for x in head}; mk = [key(x) for x in main]
        res = [hk[key(x)] if own(key(x)) and key(x) in hk else x for x in main]
        prev = None
        for x in head:
            kx = key(x)
            if kx not in mk:
                pos = (next((n for n, r in enumerate(res) if key(r) == prev), -1) + 1) if prev else 0
                res.insert(pos, x)
            prev = kx
        out += res; i = k + 1
    else:
        out.append(l); i += 1
open(path, 'w').write('\n'.join(out))
print(path, 'markers left:', sum(1 for x in out if x.startswith(('<<<<<<<', '=======', '>>>>>>>'))))

#!/bin/bash
# LN-OPUS-D3-129: try to claim PRs in order. Args: <repo-short m|b> <number> [<repo> <number> ...]
# For each: re-check head on GitHub; skip if an Opus verdict or an Opus claim (<45 min) exists at the head;
# else post the claim, re-read, and if an earlier Opus claim at the head exists, delete ours and move on.
# Prints CLAIMED <repo>#<n> <head> on success. Never prints Sol verdict text.
while [ $# -ge 2 ]; do
  r=$1; n=$2; shift 2
  if [ "$r" = "m" ]; then R=BradleyGleavePortfolio/growth-project-mobile; else R=BradleyGleavePortfolio/growth-project-backend; fi
  H=$(gh api repos/$R/pulls/$n --jq .head.sha) || { echo "ERR head $r#$n"; continue; }
  state=$(gh api "repos/$R/issues/$n/comments?per_page=100" --jq '[.[] | {id, t: .created_at, b: (.body | split("\n")[0] | .[0:200])}]')
  verdict=$(python3 - "$H" "$state" <<'EOF'
import sys, json, datetime
H = sys.argv[1]; cs = json.loads(sys.argv[2])
now = datetime.datetime.now(datetime.timezone.utc)
ready = [c for c in cs if 'READY FOR AUDIT' in c['b'] and H in c['b']]
opus_v = [c for c in cs if c['b'].startswith('AUDIT Claude Opus 5.5') and H in c['b']]
claims = []
for c in cs:
    if c['b'].startswith('OPUS LENS CLAIM') and H in c['b']:
        t = datetime.datetime.strptime(c['t'], '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=datetime.timezone.utc)
        claims.append(((now - t).total_seconds() / 60, c['b'][:60]))
if not ready: print('NOREADY')
elif opus_v: print('HASVERDICT ' + opus_v[0]['b'][:80])
elif any(a < 45 for a, _ in claims): print('CLAIMED_BY_OTHER ' + str([(round(a), b) for a, b in claims]))
else: print('FREE')
EOF
)
  echo "$r#$n head=$H -> $verdict"
  if [ "$verdict" != "FREE" ]; then continue; fi
  mine=$(gh api repos/$R/issues/$n/comments -f body="OPUS LENS CLAIM (LN-OPUS-D3-129) @ $H" --jq .id) || { echo "ERR claim"; continue; }
  sleep 4
  cutoff=$(date -u -d '45 minutes ago' +%Y-%m-%dT%H:%M:%SZ)
  earlier=$(gh api "repos/$R/issues/$n/comments?per_page=100" --jq "[.[] | select((.body|startswith(\"OPUS LENS CLAIM\")) and (.body|contains(\"$H\")) and (.id < $mine) and (.created_at > \"$cutoff\"))] | length")
  if [ "$earlier" != "0" ]; then
    gh api -X DELETE repos/$R/issues/comments/$mine >/dev/null && echo "lost race on $r#$n, deleted my claim $mine"
    continue
  fi
  echo "CLAIMED $r#$n $H comment=$mine"
  exit 0
done
echo "NOTHING CLAIMED"

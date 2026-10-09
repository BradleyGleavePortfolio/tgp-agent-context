#!/bin/bash
# merge_loop133.sh: every 180 s, run merge_if_dual.sh on every open agent133/* PR (dual APPROVE at exact head + green checks only).
# Skips while the last HOLD ALL in COORDINATION.md is after the last RELEASE HOLD. Log: ops/lanes133/merge.log
L=/home/user/workspace/ops/lanes133/merge.log; C=/home/user/workspace/repos/tgp-agent-context
export GIT_TERMINAL_PROMPT=0
while true; do
  for f in /home/user/workspace/ops/.ghtoken133 /home/user/workspace/ops/.ghtoken; do export GH_TOKEN=$(cat $f 2>/dev/null); timeout 20 gh api rate_limit >/dev/null 2>&1 && break; done
  coord=$(timeout 30 gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/handoffs/op-132/COORDINATION.md -H "Accept: application/vnd.github.raw" 2>/dev/null)
  last_hold=$(printf '%s\n' "$coord" | grep -n "HOLD ALL" | tail -1 | cut -d: -f1); last_rel=$(printf '%s\n' "$coord" | grep -n "RELEASE HOLD" | tail -1 | cut -d: -f1)
  if [ -n "$last_hold" ] && [ "${last_rel:-0}" -lt "$last_hold" ]; then echo "$(TZ=America/Los_Angeles date +%H:%M) HOLD active, skip" >> $L; sleep 180; continue; fi
  n_seen=0
  for r in growth-project-backend growth-project-mobile; do
    for n in $(timeout 60 gh pr list -R BradleyGleavePortfolio/$r --state open --limit 100 --json number,headRefName,baseRefName -q '.[]|select((.headRefName|startswith("agent133/")) and .baseRefName=="main")|.number' 2>/dev/null); do
      n_seen=$((n_seen+1))
      out=$(timeout 120 bash /home/user/workspace/ops/merge_if_dual.sh BradleyGleavePortfolio/$r $n 2>&1 | tail -1)
      case "$out" in *MERGED*) echo "$(TZ=America/Los_Angeles date +%H:%M) $out" >> $L;; esac
    done
  done
  echo "$(TZ=America/Los_Angeles date +%H:%M) tick open=$n_seen" > /home/user/workspace/ops/lanes133/merge.tick
  sleep 180
done

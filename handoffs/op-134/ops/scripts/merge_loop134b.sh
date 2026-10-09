#!/bin/bash
# merge_loop134.sh (operator agent 134): every 180 s, merge_if_dual.sh on every open agent132/133/134 PR whose base is main.
# After any merge, retarget PRs stacked on the merged branch to main. Logs EVERY tick (open count + per-PR one-liner).
# Token: ops/.ghtoken134 (operator) then ops/.ghtoken (fleet), exported as GH_ENTERPRISE_TOKEN (GH_HOST is inherited).
L=/home/user/workspace/ops/lanes134/merge.log; O=BradleyGleavePortfolio
export GIT_TERMINAL_PROMPT=0
while true; do
  ok=0
  for f in /home/user/workspace/ops/.ghtoken134 /home/user/workspace/ops/.ghtoken; do
    export GH_ENTERPRISE_TOKEN=$(cat $f 2>/dev/null); timeout 20 gh api rate_limit >/dev/null 2>&1 && { ok=1; break; }
  done
  if [ $ok = 0 ]; then echo "$(TZ=America/Los_Angeles date +%H:%M) NO VALID TOKEN (both token files stale)" >> $L; sleep 180; continue; fi
  coord=$(timeout 30 gh api repos/$O/tgp-agent-context/contents/handoffs/op-132/COORDINATION.md -H "Accept: application/vnd.github.raw" 2>/dev/null)
  last_hold=$(printf '%s\n' "$coord" | grep -n "HOLD ALL" | tail -1 | cut -d: -f1); last_rel=$(printf '%s\n' "$coord" | grep -n "RELEASE HOLD" | tail -1 | cut -d: -f1)
  if [ -n "$last_hold" ] && [ "${last_rel:-0}" -lt "$last_hold" ]; then echo "$(TZ=America/Los_Angeles date +%H:%M) HOLD active, skip" >> $L; sleep 180; continue; fi
  n_seen=0; summary=""
  for r in growth-project-backend growth-project-mobile; do
    s=$( [ $r = growth-project-backend ] && echo b || echo m )
    list=$(timeout 60 gh pr list -R $O/$r --state open --limit 100 --json number,headRefName,baseRefName -q '.[]|select((.headRefName|test("^agent13[234]/")) and .baseRefName=="main")|"\(.number) \(.headRefName)"' 2>&1) || { echo "$(TZ=America/Los_Angeles date +%H:%M) gh pr list failed $r: ${list:0:120}" >> $L; continue; }
    while read -r n br; do
      [ -z "$n" ] && continue
      n_seen=$((n_seen+1))
      out=$(timeout 120 bash /home/user/workspace/ops/merge_if_dual.sh $O/$r $n 2>&1 | tail -2 | tr '\n' ' ')
      case "$out" in
        *MERGED*) echo "$(TZ=America/Los_Angeles date +%H:%M) $out" >> $L
          for st in $(gh pr list -R $O/$r --state open --base "$br" --json number -q '.[].number'); do
            gh pr edit $st -R $O/$r --base main >/dev/null 2>&1 && echo "$(TZ=America/Los_Angeles date +%H:%M) RETARGETED $s#$st to main (base $br merged)" >> $L && sleep 3 && gh pr close $st -R $O/$r --comment "Operator agent 134: close and reopen only to start the required CodeQL checks after the retarget to main. Head unchanged; verdicts stand. agent 134" >/dev/null 2>&1 && sleep 2 && gh pr reopen $st -R $O/$r >/dev/null 2>&1 && echo "$(TZ=America/Los_Angeles date +%H:%M) REOPENED $s#$st (CodeQL trigger)" >> $L
            gh pr comment $st -R $O/$r --body "RETARGET (operator agent 134) — $r#$st base $br merged in $s#$n; base is now main. Head unchanged; verdicts stand once main-only checks pass. agent 134" >/dev/null 2>&1
          done;;
        *) summary="$summary $s#$n:$(echo "$out" | grep -o 'opus_approve=[0-9]* sol_approve=[0-9]* bad_checks=[0-9]*' | sed 's/opus_approve=/o/;s/ sol_approve=/s/;s/ bad_checks=/c/')";;
      esac
    done <<< "$list"
  done
  echo "$(TZ=America/Los_Angeles date +%H:%M) tick open=$n_seen |$summary" >> $L
  sleep 180
done

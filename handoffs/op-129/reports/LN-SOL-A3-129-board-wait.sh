#!/usr/bin/env bash
set -euo pipefail
board=/home/user/workspace/ops/board/board.md
log=/home/user/workspace/ops/reports/LN-SOL-A3-129-board-waits.log
reviewed=/home/user/workspace/ops/reports/LN-SOL-A3-129-reviewed-heads.tsv
known_claims=/home/user/workspace/ops/reports/LN-SOL-A3-129-known-claims.tsv
deadline=$(TZ=America/Los_Angeles date -d '2026-10-07 22:45:00' +%s)
# Invocation follows an empty pass. Sleep before the next board read.
while :; do
  now=$(TZ=America/Los_Angeles date +%s)
  if (( now >= deadline )); then
    TZ=America/Los_Angeles date '+DEADLINE %Y-%m-%d %H:%M:%S %Z' | tee -a "$log"
    exit 0
  fi
  delay=180
  if (( deadline - now < delay )); then delay=$((deadline-now)); fi
  sleep "$delay"
  TZ=America/Los_Angeles date '+PASS %Y-%m-%d %H:%M:%S %Z' | tee -a "$log"
  now=$(TZ=America/Los_Angeles date +%s)
  active_claims=$(while IFS=$'\t' read -r pr sha expiry; do
    [[ -z "$pr" ]] && continue
    until=$(TZ=America/Los_Angeles date -d "$expiry" +%s)
    if ((now < until)); then printf '%s\t%s\n' "$pr" "$sha"; fi
  done < "$known_claims")
  candidates=$(awk -F'|' '
    function trim(s){gsub(/^[[:space:]]+|[[:space:]]+$/,"",s);return s}
    FILENAME!=ARGV[3] {split($0,done,"\t"); completed[done[1] " " done[2]]=1;next}
    /^\| [bm]#[0-9]+ / {
      ready=trim($6); sol=trim($8); claims=trim($9); pr=trim($2)
      if(completed[pr " " trim($3)])next
      if(ready!="yes" || sol!="-" || pr~/draft/)next
      recent=0
      n=split(claims,cs,";")
      for(i=1;i<=n;i++){
        c=trim(cs[i])
        if(c~/^SOL LENS:/){
          age=c; sub(/^.* /,"",age); sub(/m$/,"",age)
          if(age+0<45)recent=1
        }
      }
      if(!recent)print pr " | " trim($3) " | " trim($4) " lines | " trim($5) " | " trim($11)
    }' "$reviewed" - "$board" <<< "$active_claims")
  if [[ -n "$candidates" ]]; then
    printf 'ELIGIBLE BOARD ROWS (scanned from top; prioritize T4/T3 and B fixes):\n%s\n' "$candidates" | tee -a "$log"
    awk -F'|' 'BEGIN{OFS="|"} /^\|/{
      if($2~/PR/ && $0~/Opus/){for(i=2;i<NF;i++)if($i~/Opus/)o=i}
      if(o)$o=" [independent lens withheld] "; print; next
    } /^## Merged/{exit} {print}' "$board"
    exit 0
  fi
  printf 'No eligible READY head without a Sol verdict or recent Sol claim.\n' | tee -a "$log"
done

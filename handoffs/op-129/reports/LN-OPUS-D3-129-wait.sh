#!/bin/bash
# LN-OPUS-D3-129: sleep 180 between board reads until a PR is free for the Opus lens, or MAXMIN minutes pass, or 22:45 PDT.
MAXMIN=${1:-15}
start=$(date +%s)
while true; do
  now_pdt=$(TZ=America/Los_Angeles date +%H%M)
  if [ "$now_pdt" -ge 2245 ]; then echo "DEADLINE 22:45 reached"; TZ=America/Los_Angeles date; exit 0; fi
  out=$(python3 /home/user/workspace/ops/reports/LN-OPUS-D3-129-board.py)
  free=$(echo "$out" | grep '^FREE for Opus:')
  if [ "$free" != "FREE for Opus: []" ]; then
    echo "$out"; TZ=America/Los_Angeles date; exit 0
  fi
  el=$(( ($(date +%s) - start) / 60 ))
  if [ "$el" -ge "$MAXMIN" ]; then echo "$out" | head -1; echo "nothing free after ${el}m"; TZ=America/Los_Angeles date; exit 0; fi
  sleep 180
done

#!/usr/bin/env bash
# health_loop.sh: sandbox health every 2 minutes (operator agent 132).
while :; do
  printf '%s load=%s mem_avail_mb=%s procs=%s node=%s jest=%s git=%s disk_free=%s\n' "$(TZ=America/Los_Angeles date +%H:%M)" "$(cut -d' ' -f1-3 /proc/loadavg | tr ' ' '/')" "$(free -m | awk '/Mem:/{print $7}')" "$(ps -e --no-headers | wc -l)" "$(pgrep -c node)" "$(pgrep -fc jest)" "$(pgrep -c git)" "$(df -h /home/user/workspace | awk 'NR==2{print $4}')" >> /home/user/workspace/ops/board/health.log
  sleep 120
done

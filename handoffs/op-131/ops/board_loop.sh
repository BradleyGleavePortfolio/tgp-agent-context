#!/usr/bin/env bash
# board_loop.sh: refresh the fleet PR board every 3 minutes (operator agent 131).
# GitHub proxy tokens expire after about 20 minutes, so each pass re-reads ops/.ghtoken (mode 600, never committed),
# which the operator rewrites on each of its own GitHub calls.
while :; do
  [ -s /home/user/workspace/ops/.ghtoken ] && export GH_ENTERPRISE_TOKEN="$(cat /home/user/workspace/ops/.ghtoken)"
  python3 /home/user/workspace/ops/board.py >> /home/user/workspace/ops/board/loop.log 2>&1
  sleep 180
done

#!/usr/bin/env bash
# board_loop.sh: refresh the fleet PR board every 3 minutes (operator agent 129).
while :; do python3 /home/user/workspace/ops/board.py >> /home/user/workspace/ops/board/loop.log 2>&1; sleep 180; done

#!/usr/bin/env bash
# Serialize every heavy job (npm ci, jest, tsc, prisma generate, eslint over many files, builds)
# across ALL agents in this sandbox (2 CPU / 7 GB RAM). Usage: /home/user/workspace/ops/heavy.sh <cmd...>
# Waits for the global lock; runs with low priority and a 2.5 GB Node heap cap unless NODE_OPTIONS is set.
set -uo pipefail
LOCK=/home/user/workspace/ops/heavy.lock
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2560}"
export CI=true HUSKY=0 LEFTHOOK=0
echo "[heavy] waiting for lock: $*" >&2
exec flock -w 5400 "$LOCK" nice -n 10 "$@"

#!/usr/bin/env bash
# Serialize heavy jobs (npm, jest, tsc, prisma generate, eslint over many files, builds) across ALL agents in this sandbox
# (2 CPU / 7.9 GB RAM). Operator 112 (13:15 10-02): TWO slots (one per CPU; jest --runInBand / tsc are single-threaded),
# each job capped at a 2.5 GB Node heap unless NODE_OPTIONS is set. Usage: /home/user/workspace/ops/heavy.sh <cmd...>
set -uo pipefail
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2560}"
export CI=true HUSKY=0 LEFTHOOK=0
D=/home/user/workspace/ops
echo "[heavy] waiting for a slot: $*" >&2
deadline=$(( $(date +%s) + 5400 ))
while :; do
  for L in "$D/heavy.lock" "$D/heavy.lock.2"; do
    exec 9>>"$L"
    if flock -n 9; then
      # low-memory guard: if available memory is under 2.2 GB, wait instead of starting a second heavy job
      avail=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)
      if [ "$avail" -lt 2200 ] && [ "$L" = "$D/heavy.lock.2" ]; then flock -u 9; exec 9>&-; continue; fi
      nice -n 10 "$@"; rc=$?; flock -u 9; exit $rc
    fi
    exec 9>&-
  done
  [ "$(date +%s)" -ge "$deadline" ] && { echo "[heavy] timed out waiting for a slot" >&2; exit 124; }
  sleep 3
done

# DEPRECATED 2026-06-18 19:50 UTC — see R85 v3. Do not invoke.
# Kept for historical reference only.

#!/bin/bash
# R85 BACKGROUND PUSHER — runs independently of foreground agent work.
# Pushes the in-progress audit report to GitHub every 90 seconds.
# Survives long npm/jest/tsc runs that would otherwise block foreground push cadence.
#
# Usage (BUILDER/FIXER variant — pushes their working branch):
#   export R85_MODE=builder
#   export R85_BRANCH=feat/tm-Xx-lane
#   export R85_WIP_REF=wip/tm-Xx-lane-snapshot
#   export R85_WORKTREE=/home/user/workspace/tgp/lane-dir
#   bash /tmp/r85_background_pusher.sh &
#
# Usage (AUDITOR variant — pushes to ctxrepo in-progress/):
#   export R85_MODE=auditor
#   export R85_CTXREPO=/tmp/ctxrepo
#   export R85_REPORT_FILE=/path/to/your/report.md
#   export R85_DEST_NAME=TM-Xx-A-SHA8.md
#   bash /tmp/r85_background_pusher.sh &
#
# Identity: ALWAYS bradley@bradleytgpcoaching.com — no AI tokens (R74).
# Cadence: every 90 seconds, forever, until SIGTERM.

set -uo pipefail

R85_INTERVAL=${R85_INTERVAL:-90}
R85_MAX_MIN=${R85_MAX_MIN:-60}  # auto-exit after this many minutes as a safety net
R85_PIDFILE=${R85_PIDFILE:-/tmp/r85-pusher.pid}
echo $$ > "$R85_PIDFILE"

GIT_OPTS="-c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley"

log() {
  echo "[R85 $(date -u +%H:%M:%S)] $*" >&2
}

push_builder() {
  cd "${R85_WORKTREE:?R85_WORKTREE not set}" || return 1
  git add -A 2>/dev/null
  if git diff --cached --quiet 2>/dev/null && [ ! -f .r85_force_push ]; then
    # Nothing staged AND no force-push marker — still push HEAD to wip ref to refresh timestamp
    :
  fi
  git $GIT_OPTS commit -m "wip: ${R85_BRANCH:-lane} snapshot" --allow-empty 2>/dev/null
  git push --force-with-lease origin "HEAD:${R85_WIP_REF:?R85_WIP_REF not set}" 2>&1 | tail -2
}

push_auditor() {
  cd "${R85_CTXREPO:?R85_CTXREPO not set}" || return 1
  if [ ! -f "${R85_REPORT_FILE:?R85_REPORT_FILE not set}" ]; then
    log "report file missing: $R85_REPORT_FILE"
    return 1
  fi
  mkdir -p handoffs/audit-reports/in-progress
  cp "$R85_REPORT_FILE" "handoffs/audit-reports/in-progress/${R85_DEST_NAME:?R85_DEST_NAME not set}"
  # Pull + rebase before push to handle parallel auditors writing
  git fetch origin main --quiet
  git reset --soft origin/main 2>/dev/null
  git add "handoffs/audit-reports/in-progress/${R85_DEST_NAME}"
  if git diff --cached --quiet; then
    log "no changes in $R85_DEST_NAME — skipping push"
    return 0
  fi
  git $GIT_OPTS commit -m "wip: ${R85_DEST_NAME%.md} background snapshot" 2>/dev/null
  # Retry push up to 3 times if non-fast-forward (parallel pushers)
  for attempt in 1 2 3; do
    if git push origin main 2>&1 | tail -2; then
      return 0
    fi
    log "push attempt $attempt failed — rebasing"
    git fetch origin main --quiet
    git rebase origin/main 2>/dev/null || git rebase --abort
  done
  return 1
}

mode="${R85_MODE:?R85_MODE must be 'builder' or 'auditor'}"
start_ts=$(date +%s)
log "R85 background pusher started (mode=$mode, interval=${R85_INTERVAL}s, max=${R85_MAX_MIN}min)"

while true; do
  now=$(date +%s)
  elapsed_min=$(( (now - start_ts) / 60 ))
  if [ "$elapsed_min" -gt "$R85_MAX_MIN" ]; then
    log "max runtime reached — exiting"
    exit 0
  fi

  if [ "$mode" = "builder" ]; then
    push_builder
  else
    push_auditor
  fi

  sleep "$R85_INTERVAL"
done

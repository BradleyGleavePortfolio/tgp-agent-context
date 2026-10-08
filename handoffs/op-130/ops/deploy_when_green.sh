#!/usr/bin/env bash
# deploy_when_green.sh <full main sha> <deploy label> [apply-migrations]  (operator agent 130)
# Polls every 180 s. Deploys ONLY if backend main is still exactly <sha> and the CI, codeql and SBOM (CycloneDX) runs at <sha>
# all concluded success. Dispatches fly-deploy.yml (release_sha=<sha>, confirm=deploy, migrations only if passed), approves the
# production environment (owner standing approval, ops/approve_deploy.sh), waits for the run, then checks /health and /readyz.
# Any failed check, a moved main or a failed run: logs and exits WITHOUT deploying or retrying. Re-reads ops/.ghtoken each pass.
set -uo pipefail
SHA=$1; LABEL=$2; MIG=${3:-}; R=BradleyGleavePortfolio/growth-project-backend; W=/home/user/workspace
LOG=$W/ops/deploy_${SHA:0:8}.log; FLEET=$W/ops/FLEET130.md
t() { TZ=America/Los_Angeles date +%H:%M; }
tok() { [ -s $W/ops/.ghtoken ] && export GH_ENTERPRISE_TOKEN="$(cat $W/ops/.ghtoken)"; }
say() { echo "$(t) $*" >> $LOG; }
fleet() { echo "- $(t) $*" >> $FLEET; say "$*"; }
end=$(( $(date +%s) + 7200 ))
while :; do
  tok
  head=$(gh api repos/$R/commits/main --jq .sha 2>/dev/null)
  if [ -n "$head" ] && [ "$head" != "$SHA" ]; then fleet "$LABEL NOT dispatched: main moved to ${head:0:8} (watcher for ${SHA:0:8} stopped)"; exit 0; fi
  runs=$(gh api "repos/$R/actions/runs?head_sha=$SHA&per_page=50" --jq '[.workflow_runs[]|select(.name=="CI" or .name=="codeql" or .name=="SBOM (CycloneDX)")|"\(.name)=\(.status)/\(.conclusion)"]|join(" ")' 2>/dev/null)
  say "checks: $runs"
  if echo "$runs" | grep -Eq '=completed/(failure|cancelled|timed_out|action_required|startup_failure)'; then fleet "$LABEL NOT dispatched: a required check failed at ${SHA:0:8} ($runs)"; exit 0; fi
  ok=$(echo "$runs" | grep -o '=completed/success' | wc -l)
  if [ "$ok" -ge 3 ] && echo "$runs" | grep -q 'CI=completed/success' && echo "$runs" | grep -q 'codeql=completed/success' && echo "$runs" | grep -q 'SBOM (CycloneDX)=completed/success'; then break; fi
  [ $(date +%s) -ge $end ] && { fleet "$LABEL NOT dispatched: checks not green after 2 hours ($runs)"; exit 0; }
  sleep 180
done
tok
before=$(gh api "repos/$R/actions/workflows/fly-deploy.yml/runs?per_page=1" --jq '.workflow_runs[0].id' 2>/dev/null)
if [ -n "$MIG" ]; then gh workflow run fly-deploy.yml -R $R --ref main -f release_sha=$SHA -f confirm=deploy -f migrations=apply-migrations >> $LOG 2>&1
else gh workflow run fly-deploy.yml -R $R --ref main -f release_sha=$SHA -f confirm=deploy >> $LOG 2>&1; fi
run=""; for i in $(seq 1 20); do sleep 6; run=$(gh api "repos/$R/actions/workflows/fly-deploy.yml/runs?per_page=1" --jq '.workflow_runs[0].id' 2>/dev/null); [ -n "$run" ] && [ "$run" != "$before" ] && break; done
fleet "$LABEL dispatched: fly-deploy run $run at ${SHA:0:8} (CI, codeql, SBOM green; migrations: ${MIG:-none})"
bash $W/ops/approve_deploy.sh $run 600 >> $LOG 2>&1
while :; do sleep 60; tok; st=$(gh api repos/$R/actions/runs/$run --jq '"\(.status)/\(.conclusion)"' 2>/dev/null); [ "${st%%/*}" = completed ] && break; done
h=$(curl -s -m 20 https://api.trygrowthproject.com/health | head -c 300); rz=$(curl -s -m 20 https://api.trygrowthproject.com/readyz | head -c 300)
fleet "$LABEL run $run finished $st. /health: $h | /readyz: $rz"

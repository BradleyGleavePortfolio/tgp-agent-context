#!/usr/bin/env bash
# flag_sync.sh <plan|apply>: dispatch Fly Env Sync (operator), approve the production environment
# (standing approval), wait, then print the plan/apply summary lines. Never prints values.
set -uo pipefail
R=BradleyGleavePortfolio/growth-project-backend; mode=$1; W="Fly Env Sync (operator)"
export GH_TOKEN=$(cat /home/user/workspace/ops/.ghtoken)
before=$(gh run list -R $R -w "$W" -L 1 --json databaseId --jq '.[0].databaseId')
if [ "$mode" = apply ]; then gh workflow run "$W" -R $R -f app=backend-spring-lake-3890 -f mode=apply -f confirm=SET -f deploy_staged=true
else gh workflow run "$W" -R $R -f app=backend-spring-lake-3890 -f mode=plan; fi
id=$before; for i in $(seq 1 30); do sleep 5; id=$(gh run list -R $R -w "$W" -L 1 --json databaseId --jq '.[0].databaseId'); [ "$id" != "$before" ] && break; done
echo "RUN $id mode=$mode $(TZ=America/Los_Angeles date +%H:%M)"
bash /home/user/workspace/ops/approve_deploy.sh $id 150
for i in $(seq 1 60); do st=$(gh run view $id -R $R --json status,conclusion --jq '"\(.status)/\(.conclusion)"'); case $st in completed/*) break;; esac; sleep 10; done
echo "STATUS $st $(TZ=America/Los_Angeles date +%H:%M)"
gh run view $id -R $R --log 2>/dev/null | sed -E 's/^[^\t]*\t[^\t]*\t[0-9TZ:.-]+ //' | rg -i 'ROMAN|action|stage|unproven|precondition|error|fail|summary|change|restart|proved|verified' | cut -c1-260 | tail -60

#!/usr/bin/env bash
# usage: prcheck.sh <backend|mobile> <nums...>  -> head, check rollup (fail/pending/success counts + failing names), last comment
r=$1; shift
for n in "$@"; do
  gh pr view $n -R BradleyGleavePortfolio/growth-project-$r --json headRefOid,statusCheckRollup,comments --jq '
   "#'"$n"' \(.headRefOid[0:8]) checks: " +
   ([.statusCheckRollup[] | (.conclusion // .state // .status)] | group_by(.) | map("\(.[0])=\(length)") | join(",")) +
   " FAIL:[" + ([.statusCheckRollup[] | select((.conclusion // .state)=="FAILURE") | (.name // .context)] | join(";")) + "]" +
   " PEND:[" + ([.statusCheckRollup[] | select((.status // "")!="COMPLETED" and (.state // "")!="SUCCESS" and .conclusion==null) | (.name // .context)] | join(";")) + "]" +
   " | last: " + ((.comments|last) as $c | if $c then "\($c.createdAt) \($c.body|split("\n")[0]|.[0:90])" else "-" end)'
done

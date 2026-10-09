#!/bin/bash
# usage: merge_if_dual.sh <owner/repo> <pr>  — merges only if BOTH lenses APPROVE at the exact current head and no check is failing/pending
R=$1; n=$2
sha=$(gh pr view $n --repo $R --json headRefOid --jq .headRefOid)
# agent 134: count only the LATEST verdict per lens at the exact head (a later REQUEST CHANGES voids an earlier APPROVE)
cm=$(gh api repos/$R/issues/$n/comments --paginate --jq '.[]|.body|split("\n")[0]')
opus=$(printf '%s\n' "$cm" | grep "^AUDIT Claude Opus 5.5" | grep -F "@ $sha — VERDICT:" | tail -1 | grep -c "VERDICT: APPROVE")
sol=$(printf '%s\n' "$cm" | grep "^AUDIT GPT-6.1 Sol" | grep -F "@ $sha — VERDICT:" | tail -1 | grep -c "VERDICT: APPROVE")
# agent 134 21:25: only the LATEST run of each check name counts (GitHub's own rule); a stale failure from a red main no longer blocks.
bad=$(gh pr view $n --repo $R --json statusCheckRollup --jq '[.statusCheckRollup[]|{k:((.workflowName // "")+"/"+(.name // .context // "?")),t:(.startedAt // .completedAt // ""),c:(.conclusion // .state // "PENDING")}]|group_by(.k)|map(max_by(.t))|[.[]|select(.c|test("FAILURE|ERROR|PENDING|IN_PROGRESS|QUEUED|CANCELLED|TIMED_OUT|ACTION_REQUIRED"))]|length')
echo "$R#$n head=$sha opus_approve=$opus sol_approve=$sol bad_checks=$bad"
if [ "$opus" -ge 1 ] && [ "$sol" -ge 1 ] && [ "$bad" = 0 ]; then
  gh pr merge $n --repo $R --merge --match-head-commit $sha && echo "MERGED $R#$n"
else
  echo "SKIP $R#$n (not dual-approved at head or checks not green)"
fi

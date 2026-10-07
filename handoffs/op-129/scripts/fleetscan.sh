#!/usr/bin/env bash
# fleetscan: open agent127/agent128/agent129 PRs, head, last READY head, Opus/Sol verdict at head, checks
for r in backend mobile; do R=BradleyGleavePortfolio/growth-project-$r
  gh pr list -R $R --state open --limit 100 --json number,headRefName,headRefOid,title,additions,deletions --jq '.[]|select(.headRefName|test("^agent12[789]/"))|"\(.number)\t\(.headRefOid)\t\(.additions+.deletions)\t\(.headRefName)"' | while IFS=$'\t' read n h l br; do
    c=$(gh api repos/$R/issues/$n/comments --paginate --jq '.[]|.body|split("\n")[0]' 2>/dev/null)
    rd=$(echo "$c" | rg 'READY FOR AUDIT' | tail -1 | rg -o '@ [0-9a-f]{40}' | cut -c3-10)
    op=$(echo "$c" | rg "^AUDIT Claude Opus 5.5.*@ $h" | tail -1 | rg -o 'VERDICT: .*' | cut -c10-)
    so=$(echo "$c" | rg "^AUDIT GPT-6.1 Sol.*@ $h" | tail -1 | rg -o 'VERDICT: .*' | cut -c10-)
    ck=$(gh pr view $n -R $R --json statusCheckRollup --jq '[.statusCheckRollup[]|(.conclusion // .state // "PENDING")]|group_by(.)|map("\(.[0])=\(length)")|join(",")')
    echo "${r:0:1}#$n ${h:0:8} L=$l ready@${rd:-none} opus=${op:--} sol=${so:--} [$ck] $br"
  done; done

#!/bin/bash
# Flags cross-session writes: 114-S commits on agent-114 PRs, or agent-114 commits on 114-S PRs (since 2026-10-03T01:15Z).
O=BradleyGleavePortfolio; SINCE=2026-10-03T01:15:00Z
check(){ repo=$1; n=$2; forbidden=$3; owner=$4
  gh api "repos/$O/growth-project-$repo/pulls/$n/commits?per_page=100" --paginate --jq ".[] | select(.commit.committer.date > \"$SINCE\") | .sha[0:8]+\" \"+.commit.committer.name" 2>/dev/null \
  | while read sha name; do case "$name" in *$forbidden*) echo "COLLISION $repo#$n (owner $owner) commit $sha by $name";; esac; done; }
for p in "backend 627" "mobile 321" "backend 654" "mobile 334" "backend 608" "mobile 327" "backend 611" "backend 650" "backend 652" "backend 656" "backend 628" "mobile 322" "backend 641" "mobile 329" "mobile 332" "backend 640" "mobile 328" "backend 647" "backend 648" "backend 609" "mobile 312" "backend 661" "mobile 331" "mobile 335"; do check $p "114-S" "agent 114"; done
for p in "mobile 305" "mobile 317" "mobile 326" "mobile 315" "backend 634" "mobile 325" "backend 651"; do check $p "Agent 114" "114-S"; done
echo "writer_guard done $(date -u +%H:%MZ)"

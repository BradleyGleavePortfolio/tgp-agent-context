Method (all 113 auditor lanes): read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first (verdict format, IDs, tier-header
check, "outside this diff" notes). Detailed method contract: /home/user/workspace/ops/lanes/AUD-SOL-3.md and AUD-OPUS-3.md (same
for both lenses). gh/git need bash api_credentials=["github"]. One worktree per PR under /home/user/workspace/wt/<lane>-<n>
(`git -C /home/user/workspace/repos/<repo> fetch origin pull/<n>/head` then `worktree add`), link deps
(/home/user/workspace/ops/link_deps.sh), targeted tests/probes only through /home/user/workspace/ops/heavy.sh (never wrap heavy.sh
in a short timeout). CI carries tsc/full suites: green required checks at the exact head are evidence (read with `gh pr checks`).
Owner: wall clock is the #1 resource; quality non-negotiable (hyperscaler bar; no generic errors; Apple-level UX). For a re-audit or
delta: first decide your own lens's prior findings (closed with code + test, or not), then hunt what is new in the diff since your
last verdict (`git diff <old>..<new>`; for main merges confirm conflict resolutions and that nothing else changed). Full audits:
read the whole diff. Re-read the head right before posting; if it moved, audit the new head. Post exactly one verdict comment per PR
per head. Remove each worktree right after posting (unlink node_modules first, then `git worktree remove --force`). If an item waits
on CI/builder/operator, skip it and come back; never idle on one PR. No pushes, merges, workflow dispatches or production actions.
Append each verdict to your report file as you go (/home/user/workspace/ops/reports/<LANE>-113.md) and end the report with
"## HANDOFF". If your queue empties, write "QUEUE EMPTY" in the report and finish; the operator will re-task you by message.
Final answer (<300 words): each PR, exact head, verdict, A/B/C counts, comment URL, anything the operator must decide.

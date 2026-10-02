# Lane AUD-OPUS-8 (agent 113) — Claude Opus 5.5 audit lens (independent; never push code)
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

Queue (in order). Lens name in the verdict first line: "Claude Opus 5.5". Report: /home/user/workspace/ops/reports/AUD-OPUS-8-113.md
1. backend #636 @ 608985cf — data export private bucket storage + 5-minute user-bound links (T4 privacy). Stacked on #608 (base =
   #608 branch, so no CI of its own): audit its diff against its base. Read your lens's previous verdicts on #636 in the PR comments.
   After both lenses APPROVE, the operator merges #636 into the #608 branch and tells you the new #608 head.
2. backend #645 @ 7b6165ab — ci(branch-protection): setup script lists the 10 live required checks (T4: CI gate file). Line by line:
   the script must match the live protection exactly (10 contexts, strict, enforce_admins) and must not weaken anything.
3. mobile #327 @ 395c3312 — data export download via fresh 5-minute link (pairs with #608/#636). Full or delta per your lens history.
4. backend #608 — account deletion completes on re-auth (T4). Current head bdadfcb4; audit it NOW at bdadfcb4 (decide your lens's
   prior findings incl. C-608-2 step-up and C-608-7 HMAC dispositions), then when the operator merges #636 into it, do a delta at the
   new head. C-636-6 pre-deploy check belongs in your notes (what production must look like before deploy).
Then QUEUE EMPTY.

# Lane AUD-OPUS-7 (agent 113) — Claude Opus 5.5 audit lens (independent; never push code)
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

Queue (in order). Lens name in the verdict first line: "Claude Opus 5.5". Report: /home/user/workspace/ops/reports/AUD-OPUS-7-113.md
1. backend #610 @ 9f2c3865 — T4 community safety (UGC, App Review 1.2). Your lens APPROVED at a98d08b5. Delta: fix round 6 (B-UGC-6:
   B-610-13 moderation action + notice in one transaction, B-610-8 voice erasure certified only on definite not-found from a
   confirmed bucket, C-610-9) + main 9cfd70d6 merged. Sol APPROVED 9f2c3865. FAST: this unblocks the community merge + deploy.
2. mobile #333 @ 806467b9 — release-env check (T4). Your lens APPROVED at abfc5d12; delta = fix round S-RELEASE-2 (B-333-2/3,
   C-333-1). Sol APPROVED at 806467b9.
3. mobile #330 @ 7d640548 — Sentry native init, no PII. Your lens APPROVED at 4c61d915; delta = fix round (B-330-3/4, C-330-1).
   Sol APPROVED at 7d640548.
4. backend #634 @ 4d987916 — S-SCHED-2 booking lifecycle (T4). Delta from your last verdict on this PR (read the PR comments for
   your lens's last head and findings). Mobile #325 pairs with it.
5. mobile #326 @ 16e7e97c — AI consent error handling (rebased onto main by B-CONSENT-4). Delta from your last verdict.
6. backend #611 @ fda3afad — public privacy/health policy pages (B-611-2, C-611-8 + vendor-deletion/backup procedures doc). Delta.
Then QUEUE EMPTY (the operator will send merge-train deltas, e.g. mobile #314 after #610 merges).

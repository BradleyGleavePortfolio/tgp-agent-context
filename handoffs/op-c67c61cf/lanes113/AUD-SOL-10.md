# Lane AUD-SOL-10 (agent 113) — GPT-6.1 Sol audit lens (independent; never push code)
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

Queue (in order). Lens name in the verdict first line: "GPT-6.1 Sol". Report: /home/user/workspace/ops/reports/AUD-SOL-10-113.md
1. backend #640 @ 213a186d — S-MWB coach program library API, bulk assign, delivery (T4; migration 20270223000000). Read your
   lens's prior verdicts in the PR comments; re-audit/delta accordingly. Mobile #328 pairs with it.
2. mobile #328 @ 67f9ef4f — coach Programs tab (pairs with #640). Re-audit/delta per your lens history.
3. backend #641 @ bb17e19a — coach Money read model, truthful Connect status, tax CSV export route (T4). Mobile #329 + #332 pair with it.
   Also check: package create must be idempotent end to end (OR-112-16: client retries must not create duplicate packages) —
   report whether #641 honors an Idempotency-Key on package create; if not, raise it as a B finding with the minimal fix.
4. backend #647 @ 3a93fbde — booking notifications in the recipient's zone, once (T3/T4). Re-audit/delta per your lens history.
5. backend #648 @ 81c52a12 — deliver inbox notifications to devices (push) (T4). Full audit if your lens has none at this head.
Then QUEUE EMPTY.

# Lane S-SCHED-5 (agent 113) — Claude Opus 5.5 builder, T4: mobile #325 main merge, then booking auto-expiry
Method (all 113 builder lanes): read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. gh/git need bash
api_credentials=["github"]. Commit identity: git -c user.name="TGP Agent 113" -c user.email="agent@tgp.invalid". Expo Free: never
start an EAS build. Owner bar (binding): hyperscaler quality, get it right the first time (no audit ping-pong), more functionality
not less, pristine Apple-level UX, no generic errors ever (every failure: what happened + a working next action; unknown -> short
reference + support path + Sentry without PII), Quiet Luxury copy (no emojis, no exclamation marks, plain warm words, no first person
"we/us" in client-facing error copy unless it is a named human).
Process: your own worktree(s) under /home/user/workspace/wt/<lane>-<n>; wait for /home/user/workspace/deps/<kind>/READY, then
link_deps.sh; backend: `/home/user/workspace/ops/heavy.sh npx prisma generate` after linking. Run ONLY targeted jest (your touched
files + new failing-before tests) and eslint/prettier on changed files, all through /home/user/workspace/ops/heavy.sh (never wrap it
in a short timeout). Push early; GitHub CI runs tsc + full suites (stacked PRs get no CI: say so in your report). Every finding you
close gets a test that fails before and passes after. Keep the PR body tier header current (Tier / Why / T4 trigger scan / T3 trigger
scan / Bounded T1 / Builder-owner / Acceptance evidence / Promotion triggers) and add a "Fix round" table (finding -> change ->
commit -> test); if the platform refuses a long PR-body edit, post it as a PR comment instead and say so. Conventional Commits PR
titles. Merging origin/main into your branch is fine (merge commit, no force-push unless your own branch after a rebase). Wait for
required checks at your final head (max ~30 min; fix real failures; rerun the known flake once). Never merge, never dispatch
workflows, never touch production, never change branch protection. Before your final answer: unlink node_modules and remove your
worktrees. Report: /home/user/workspace/ops/reports/<LANE>-113.md (append as you go; end with "## HANDOFF").
Final answer (<400 words): PR number(s), final head SHA(s), CI state at head, per-finding disposition, tests (command + result),
overlaps/conflicts with other open PRs, anything needing an operator/owner decision (with your recommended default).

Part 1 (now): mobile #325 (agent110/s-sched-mobile @ 36f05bba; native Calendar, coach controls, welcome call) is dual-APPROVED but
DIRTY (conflicts with main f34b5b99). Merge origin/main into it, resolve conflicts preserving both sides' behavior, run the targeted
specs for every conflicted file, push, and post a comment listing each conflict and its resolution (auditors do a delta). Pair:
backend #634 (S-SCHED-2 lifecycle, being re-audited now). Prior: /home/user/workspace/ops/reports/S-SCHED-4-112.md.
Part 2: booking auto-expiry (OR-112-5; read v6 notes in the S-SCHED-4 report and the #634 PR body): pending booking requests the
coach does not answer expire automatically at a clear time, both sides get a calm notice, the slot frees, idempotent sweeper with
lease (follow the CronLease pattern), RLS on anything new, per-cause copy on mobile. Backend on a new branch from origin/main if #634
has merged (operator will tell you) or stacked on #634's branch (agent110/s-sched-lifecycle) if not; migration prefix
20270226000000 if needed. Mobile part on a new branch. Tier T3/T4 (state it). Report: /home/user/workspace/ops/reports/S-SCHED-5-113.md.

# Lane S-COACH-3 (agent 113) — Claude Opus 5.5 builder, T4 (money UI): mobile #329 + #332 (+ backend #641 after its audits)
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

PRs: mobile #329 (agent/clinic/s-coach-wizard @ 83ee0e46; coach setup wizard with Stripe Express onboarding), mobile #332
(agent/clinic/s-coach-money-mob @ 61eea115, stacked on #329; coach Money page + Home Money card), backend #641
(agent/clinic/s-coach-money-be @ bb17e19a; Money read model, Connect status, tax CSV export) — merge set #641/#329+#332.
Prior: /home/user/workspace/ops/reports/S-COACH-MOB-2-112.md and S-COACH-BE-2-112.md (HANDOFF sections).
Now: close #332 B-332-1 and every open A/B from both lenses on #332 and #329 (stale period numbers, cache/schema/cadence issues per
the verdicts), merge origin/main into #329 then #329 into #332. OR-112-16: package create must be idempotent end to end (mobile sends
a stable Idempotency-Key per create attempt; backend dedupes). PUSH HOLD on backend #641: lanes AUD-OPUS-9 and AUD-SOL-10 are
re-auditing #641 @ bb17e19a right now; do not push to #641 until both verdicts are posted (check the PR comments), then close
their findings + the backend idempotency in one round. Coach UX: Apple-level, truthful Connect status (never claim payouts work when
Stripe says otherwise), specific copy for every Connect state. Report: /home/user/workspace/ops/reports/S-COACH-3-113.md.

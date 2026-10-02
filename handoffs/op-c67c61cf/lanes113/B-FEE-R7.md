# Lane B-FEE-R7 (agent 113) — Claude Opus 5.5 builder, T4 (money): backend #627 round 7
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

PR: backend #627 (agent/clinic/s-fee-coach-net @ c1d69c7f), coach payout = price - actual Stripe fee - 2% (T4). You are its only
writer. Opus APPROVED c1d69c7f (0/0/2); Sol REQUEST CHANGES 0/1/2 at c1d69c7f: B-627-8 = a won-dispute reinstatement can be paid
twice after a lost Stripe response or lost receipt combined with request-key (idempotency key) expiry. Sol's probes:
/home/user/workspace/ops/probes/AUD-SOL-6-112/ (627-final-original-aged-control-probes.spec.ts etc.); Sol's verdict comment on #627
has the details. Prior round: /home/user/workspace/ops/reports/B-FEE-R6-112.md (HANDOFF section).
Do: 1) fix B-627-8 at the root (durable per-operation record + lookup-before-resend so an expired idempotency key can never cause a
second reinstatement; same uncertainty rule as round 6 reversals), turn Sol's probe into permanent failing-before tests; 2) close the
cheap Opus/Sol Cs on #627 itself if they are local to this PR (C-627-8 stale repay amount in the failed-transfer log goes into the
follow-up PR below, not here); 3) merge origin/main (9cfd70d6) into the branch; 4) push, fix-round comment/table, required checks green.
SPEED MATTERS: lane B-RECUR is stacked on your branch (never touch their branch) and mobile #321 + backend #629 wait on #627.
After #627 is pushed and green, build the follow-up PR "B-SECRETS-3" (new branch from origin/main, T4): #646's Cs (owner admin
purchase routes still return raw Stripe secrets -> never return client secrets/ephemeral keys from admin/owner routes; cached
payment secrets never cleared after a payment completes -> clear on terminal states) + C-627-8 (stale repay amount in the
failed-transfer log). Read the #646 audit comments (merged PR) for exact findings. Failing-before tests. Report both PRs.
Report: /home/user/workspace/ops/reports/B-FEE-R7-113.md.

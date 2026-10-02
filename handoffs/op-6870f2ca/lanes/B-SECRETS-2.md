# Lane B-SECRETS-2 (agent 112, post-stop light round) — Claude Opus 5.5 builder, backend PR #646 only

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first (owner facts, heavy.sh, CI offload, Conventional Commits, worktree hygiene).
Commit identity: git -c user.name="TGP Agent 112" -c user.email="agent@tgp.invalid". gh/git need bash api_credentials=["github"].

PR: BradleyGleavePortfolio/growth-project-backend #646 "fix(payments): never send client Stripe secrets to coach routes",
branch agent/clinic/coach-payments-field-select, head ea919f6b (T4: secrets). Unaudited; you may extend it.

Task (operator ruling OR-112-19): GET /v1/checkout/purchases (src/checkout/checkout.controller.ts ~line 147, the buyer's own list)
still returns a Stripe client secret to the client on purchases that need no client action. Fix:
1. First grep mobile main (/home/user/workspace/repos/growth-project-mobile, `git fetch origin main`, `git grep` on origin/main src/)
   for any read of a client secret from purchase rows (ClientPurchase type, getPurchases, purchase detail). Record what you find.
2. Rule: a Stripe client secret (PaymentIntent/SetupIntent client_secret, ephemeral key, or any `*_secret` value) is returned on the
   client's purchase list/detail ONLY when that purchase is still awaiting client action (PaymentIntent status requires_payment_method
   / requires_confirmation / requires_action) AND the mobile app actually reads it to resume payment. If mobile never reads it, drop it
   from every client purchase response entirely. Use an explicit field allow-list, the same pattern #646 uses for the coach routes.
   Check GET /v1/checkout/purchases/:id and any other client purchase read route for the same leak.
3. Failing-before test: a spec that hits the real controller/service path and asserts no `*_secret` field on settled purchases (and
   the resume case, if kept). It must fail on ea919f6b and pass after. Keep #646's existing tests green.
4. Targeted jest only, through /home/user/workspace/ops/heavy.sh (never wrap heavy.sh in a short `timeout`); CI runs tsc + full suites.
   eslint on changed files; `node scripts/check-r75.js --mode=range` (no banned casts).
5. Push to the #646 branch. Do not merge main unless the PR conflicts. Wait for all required checks green (re-check every few minutes,
   max 30 min). Update the PR body: tier header unchanged (T4), add a fix-round row "OR-112-19 client purchases secret"; retitle in
   Conventional Commits form if the scope changed, e.g. "fix(payments): never send Stripe client secrets to coach routes or settled client purchases".
   Post one fix-round comment on #646 (what changed, commit, failing-before evidence).
Worktree: /home/user/workspace/wt/b-secrets-2 (git worktree add from repos/growth-project-backend), `bash /home/user/workspace/ops/link_deps.sh backend`
inside it, `heavy.sh npx prisma generate` if needed. At the end unlink node_modules, then `git worktree remove --force`.
Report: /home/user/workspace/ops/reports/B-SECRETS-2-112.md ending with "## HANDOFF FOR AGENT 113" (head, CI, what's done, anything not done).
Never touch production, never merge, never dispatch workflows. Final answer (<250 words): head, CI, what changed, mobile-grep finding, risks.

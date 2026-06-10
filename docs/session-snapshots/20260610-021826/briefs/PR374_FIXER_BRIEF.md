# PR #374 Fixer Brief — Bank-Payout Phase A R1 DIRTY Resolution

**You are the Opus 4.8 fixer (R31: different agent, different worktree from the builder and auditor). The R1 auditor (GPT-5.5) returned DIRTY. Your job is to address the REAL issues in this brief — NOT the brief-drift items the orchestrator already triaged out.**

## Repo & branch
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Worktree: `/home/user/workspace/tgp/backend-ach-payout` (the builder's worktree; check out branch `feature/bank-payout-ach`)
- Branch: `feature/bank-payout-ach` (PR #374, currently head `deb9d52`)
- Base: `9322eeb`

## Read first
- Audit report: `/home/user/workspace/tgp/backend-ach-payout-audit/AUDIT_R1_PR_374_REPORT.md`
- Original builder brief: `/home/user/workspace/BANK_PAYOUT_BUILDER_BRIEF.md`
- Spec: `/tmp/BANK_PAYOUT_SPEC.md`

## REAL ISSUES TO FIX (in order)

### Fix 1 — Gate 6 Invariant test (`coach + platform + stripe = gross`)
The brief said "`coachPayout + platformFee === gross`" which is mathematically wrong when Stripe takes a real cut. Add a unit test in `test/payouts-v2.spec.ts` that asserts:

```ts
expect(coach_net_cents + platform_fee_cents + stripe_fee_cents).toBe(amount_cents);
```

Cover ≥5 adversarial inputs:
- $1,000 ACH (gross=100000, stripe=500)
- $25 micro-purchase (gross=2500, stripe=125)
- $9,999.99 large (gross=999999, stripe=stripe ACH fee at that scale)
- $1.00 minimum (gross=100, stripe=1 or however the calc resolves)
- Rounding-edge case where internal penny is absorbed by platform (use existing `reconcileInternal` path; assert visible coach + visible platform + stripe == gross AND `platform_absorbed_delta_cents > 0`)

### Fix 2 — Gate 7 Webhook HTTP-level reject test
Current test calls `verifyStripeSignature()` directly. Replace/augment with an HTTP-level test using NestJS testing module that:
1. Mounts the Stripe Connect webhook controller (use existing `checkout-webhook-handler.service.ts` integration or a new `payouts-v2-webhook.controller.ts` if one is appropriate).
2. Sends a POST with missing `Stripe-Signature` header → expects **400** (NestJS BadRequest convention) or **401** (whichever the existing handler returns; document the choice).
3. Sends a POST with INVALID `Stripe-Signature` → same expected status.
4. After both rejects, asserts NO database row was created in `PayoutMethod`, no audit log entry, no side effect (use prisma test client + count assertion before/after).
5. Sends a POST with VALID signature → expects 200 and the expected state transition.

If a dedicated webhook controller doesn't exist for payouts and Stripe Connect events flow through the existing checkout webhook handler, write the test against the existing handler's payouts-v2 delegation path.

### Fix 3 — Gate 9 Controller 503 test
Add controller-level test that:
1. Sets `FEATURE_BANK_PAYOUTS_V2=false` for the test (e.g., `withEnv` helper or NestJS overrideProvider for the feature flag).
2. Hits `GET /me/payout-methods` (and 1-2 other route methods, e.g., `POST /me/payout-methods/financial-connections/session`).
3. Expects HTTP **503** with error body containing `BANK_PAYOUTS_V2_DISABLED` (or whatever the actual ServiceUnavailableException message is — match source).
4. Assert no DB writes.

### Fix 4 — Gate 5 Fee math verification + documentation
The auditor's $36.10 figure used different inputs than the code's. Add a comment block in `src/payouts-v2/platform-fee.service.ts` that:
1. Documents the exact formula: `cardCost = round(0.029 × gross) + 30; platform_fee = round(0.02 × gross) + round(0.5 × max(0, cardCost − stripe_actual_cost))`
2. Worked example for $1,000 ACH: `cardCost = round(0.029 × 100000) + 30 = 2900 + 30 = 2930; stripe_actual_cost = 500 (Stripe ACH 0.8% capped at $5); savings = 2930 − 500 = 2430; platform_fee = round(0.02 × 100000) + round(0.5 × 2430) = 2000 + 1215 = 3215 cents = $32.15. Coach net = 100000 − 3215 − 500 = 96285 cents = $962.85.` — **VERIFY THIS MATCHES THE SOURCE** before committing.
3. If the source actually uses different `stripe_actual_cost` assumption (e.g., $5 cap vs 0.8%), document it explicitly.
4. The corresponding worked-example test should reference the documented formula in a comment so future readers see the derivation inline.

### Fix 5 — Gate 8 S3 DI deferred-note OR placeholder
The audit gate asked for S3 constructor-injection DI, but the builder didn't add S3 because Phase A doesn't need it. Two options — pick the lighter one:
- **Option A (preferred)**: Add a comment in `src/payouts-v2/payouts-v2.module.ts` and PR body stating "Phase A does not use AWS S3; S3Client DI scaffolding added in Phase B (1099-K storage)." Then in `package.json` keep `@aws-sdk/client-s3` as a forward-declared dep with the audit-report cross-reference. Do NOT remove the dep.
- **Option B**: Add a tiny `src/payouts-v2/storage/s3.provider.ts` with a constructor-injectable `S3Client` token, a unit test that injects a mock and asserts no real network call, even though no code path uses it yet. This satisfies the gate but adds dead code.

If A: also update the PR body to call out the deferral so the auditor doesn't re-flag.

## OUT OF SCOPE (do NOT touch)
- The audit brief listed `app.module.ts` and `checkout.module.ts` as out-of-scope; orchestrator triaged these as the legitimate "additive checkout-webhook delegation tweak" allowed by the original brief. Leave them.
- `test/payouts-v2.spec.ts` path: keep where it is — repo convention is `test/`.
- Migration directory name (`20261215000000_payouts_v2_bank_payout_methods`): keep.
- Do NOT change anything outside `src/payouts-v2/**`, `test/payouts-v2.spec.ts`, and PR body. Specifically do NOT edit other modules, contracts code, community code.

## Process
1. Check out the branch: `git -C /home/user/workspace/tgp/backend-ach-payout checkout feature/bank-payout-ach && git pull --ff-only`
2. Apply fixes 1–5.
3. Run lane tests: `./node_modules/.bin/jest test/payouts-v2 --runInBand` — expect all new tests to pass plus existing 37 stay green.
4. Run no-regression sanity: `./node_modules/.bin/jest test/dunning test/entitlement test/entitlements test/checkout --runInBand`.
5. `./node_modules/.bin/tsc --noEmit` → 0 errors.
6. Commit each fix as a separate title-only commit (author `Dynasia G <dynasia@trygrowthproject.com>`), e.g.:
   - `test(payouts): add gross-conservation invariant across 5 adversarial inputs`
   - `test(payouts): webhook signature reject returns 400 and no DB mutation`
   - `test(payouts): controller returns 503 when FEATURE_BANK_PAYOUTS_V2 off`
   - `docs(payouts): document fee formula with $1k ACH worked example`
   - `chore(payouts): note S3 DI deferred to Phase B (1099-K storage)`
7. Push (R64): `git push origin feature/bank-payout-ach` (or `--force-with-lease` if needed).
8. Comment on PR #374 with the fix summary via `gh pr comment 374 --body-file ...`.
9. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.

## Hard rules
- Sonnet 4.6 FORBIDDEN as runtime (you're Opus 4.8).
- R31: you are the fixer, not the auditor.
- Commit format title-only, no body/emoji/trailers.
- Force-push prefer `--force-with-lease`.
- `api_credentials=["github"]` for gh.

End your return message with: head SHA + PR comment URL + status: FIXED_READY_FOR_RE_AUDIT | PARTIAL_NEED_GUIDANCE.

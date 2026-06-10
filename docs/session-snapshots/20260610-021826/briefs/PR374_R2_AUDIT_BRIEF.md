# R2 AUDIT — PR #374 Bank-Payout Post-Fix Verification

**You are GPT-5.5 R2 auditor. R31: different agent, different worktree. Verify ONLY the fixes from the R1 → fixer cycle; do NOT re-litigate brief-drift items the orchestrator already triaged out.**

## Repo & worktree
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Worktree: `/home/user/workspace/tgp/backend-ach-payout-r2-audit` (detached at `c49d0a6`)
- Branch under review: `feature/bank-payout-ach`, PR #374 head `c49d0a66656b384d302f34023bf49f6fc7aaf416`

## Reference
- R1 audit report (the issues we're verifying fixes for): `/home/user/workspace/tgp/backend-ach-payout-audit/AUDIT_R1_PR_374_REPORT.md`
- Fixer brief: `/home/user/workspace/PR374_FIXER_BRIEF.md`
- Fixer PR comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/374#issuecomment-4664699498

## Output
1. New branch `audit/r2-pr-374` off the R2 worktree HEAD.
2. Single file `AUDIT_R2_PR_374_REPORT.md` at repo root.
3. Commit title: `audit(r2): PR #374 bank payout post-fix verification`, title-only, author `Dynasia G <dynasia@trygrowthproject.com>`.
4. Push branch, end return message with verdict: **CLEAN** / **DIRTY-MINOR** / **DIRTY**.

## ONLY verify these 5 fix items (do not re-run full R1 gates)

### V1 — Gate 6 gross-conservation invariant (commit `616e64f`)
- Find the `it.each` block in `test/payouts-v2.spec.ts` asserting `coach_net + platform_fee + stripe_fee === gross`.
- Confirm ≥5 adversarial inputs ($1k ACH, $25, $9,999.99, $1.00, $50 card, $200 ACH).
- Confirm rounding-edge case using `reconcileInternal` proves platform absorbs internal penny while coach-visible sums to gross.
- Run: `./node_modules/.bin/jest test/payouts-v2.spec.ts --runInBand` → expect 51/51 (37 prior + 14 new).

### V2 — Gate 7 webhook HTTP-level reject (commit `4620073`)
- Find `PayoutsV2WebhookController` (`POST /v1/webhooks/payouts-v2/stripe-connect`).
- Confirm test uses real HTTP (Node `http` + `app.listen(0)` per repo convention, not just direct service call).
- Verify: missing sig → 400; invalid sig → 400; routing layer NOT invoked on rejects; valid sig → 200.

### V3 — Gate 9 controller 503 test (commit `a5b42bd`)
- Find HTTP-level test in `test/payouts-v2.spec.ts` mounting `PayoutMethodController`.
- With `FEATURE_BANK_PAYOUTS_V2=false`: 3 routes (`GET /me/payout-methods`, `POST /financial-connections/session`, `POST /:id/default`) return **503** with `{ error: 'BANK_PAYOUTS_V2_DISABLED' }`.
- Service mock asserts never-called during flag-off requests.

### V4 — Gate 5 fee formula doc (commit `efff66c`)
- Open `src/payouts-v2/platform-fee.service.ts` and confirm "FEE FORMULA — EXACT DERIVATION" block.
- Verify the worked example: `cardCost = round(0.029×100000) + 30 = 2930; stripe_actual_cost = 500; savings = 2430; platform_fee = 2000 + 1215 = 3215 = $32.15; coach_net = 96285 = $962.85.`
- Verify the doc explicitly notes that the auditor's $36.10 used different inputs (uncapped 0.8% + cardCost=$33).
- Confirm a worked-example test references the derivation.

### V5 — Gate 8 S3 DI deferred note (commit `c49d0a6`)
- Open `src/payouts-v2/payouts-v2.module.ts` and confirm the comment block stating "Phase A does not use AWS S3; S3Client DI scaffolding deferred to Phase B (1099-K storage)."
- Confirm `@aws-sdk/client-s3` still present in `package.json` dependencies as `^3.1065.0`.

## No-regression sanity (briefly confirm)
```
./node_modules/.bin/jest test/payouts-v2.spec.ts test/checkout-webhook-handler test/checkout-webhook-fee-split test/dunning test/entitlement test/entitlements --runInBand
```
Expect green (the fixer reported 51 + 116 = 167 pass).

## Hard rules
- Verify ONLY. Do NOT modify source.
- The orchestrator already triaged out the R1 brief-drift items (app.module/checkout.module wiring, test/ path convention, migration directory name). Do NOT flag these again.
- `api_credentials=["github"]` for gh. Force-push `--force-with-lease` if needed.

End your return message with verdict on its own line.

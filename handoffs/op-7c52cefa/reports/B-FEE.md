# B-FEE report (lane S-FEE, owner priority #1)

## PR 1: backend T4, coach net = price - actual Stripe fee - TGP 2%

- PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627
- Branch `agent/clinic/s-fee-coach-net`, rebased on origin/main 8a709a68 (#625).
- Mechanism: **separate charges and transfers with `on_behalf_of`** on every paid checkout path (Checkout Session, PaymentSheet, guest one-time, guest and member subscriptions). No `transfer_data` and no application fee. After each charge (first charge and every renewal) `ChargeSettlementService` reads the actual fee from `charge.balance_transaction.fee`, splits it with the single fee function `computeChargeSplit` (`src/payouts-v2/platform-fee.service.ts`) and transfers the coach net with `source_transaction` (idempotent per charge and leg). TGP keeps exactly floor(2%), so platform net >= 0 on every charge.
- Why: with destination charges "Your platform pays the Stripe fee after the `application_fee_amount` is transferred" (https://docs.stripe.com/connect/destination-charges.md?platform=web&integration=custom&ui=elements&api-integration=paymentintents). With separate charges and transfers the platform sets the transfer amount itself, after the fee is known (https://docs.stripe.com/connect/separate-charges-and-transfers.md?platform=web&integration=checkout&ui=stripe-hosted); subscriptions are created on the platform with `on_behalf_of` (https://docs.stripe.com/connect/subscriptions). Account Debits would need the platform to take on negative balances plus legally binding consent from each coach (https://docs.stripe.com/connect/account-debits), so it was not used.
- Refunds and disputes: the coach bears the refunded principal, Stripe's non-returned fee (https://docs.stripe.com/refunds) and dispute fees (https://docs.stripe.com/connect/disputes). Handled by transfer reversal, then a `PayeeRecovery` netted from the coach's next transfer. Voluntary cancel is unchanged (access to the end of the paid period, no refund).
- Free packages, $0 invite-code grants (#595) and $0 charges never create settlement rows, transfers, fees or ledger revenue.
- Ledger: new `ChargeSettlement` (one row per charge: gross, stripe_fee, platform_fee, head_coach_split, coach_net, refunds, disputes, targets; DB CHECKs) and `PayeeRecovery`, both with RLS. `SplitLedgerEntry` slices per charge, unique `SplitLedgerEntry_purchase_kind_payee_charge_key`. `ConnectTransfer` gets settlement_id, kind and netted_recovery_cents. One schema-parity baseline line was deleted, because the migration drops the old 3-column unique.
- Same net everywhere: `coachNetCents` feeds both `/v1/coach/payments/earnings` (`net_cents`, `recoveries_cents`) and `/coach/connect/metrics` `net_30d`.

### Worked examples (US card 2.9% + 30c)

| Case | Gross | Stripe fee | TGP | Head coach | Coach net |
|---|---:|---:|---:|---:|---:|
| $19.99 | 19.99 | 0.88 | 0.39 | - | 18.72 |
| $49.00/month first charge | 49.00 | 1.72 | 0.98 | - | 46.30 |
| $49.00/month renewal | 49.00 | 1.72 | 0.98 | - | 46.30 |
| $50 | 50.00 | 1.75 | 1.00 | - | 47.25 |
| $200 | 200.00 | 6.10 | 4.00 | - | 189.90 |
| $1000 | 1000.00 | 29.30 | 20.00 | - | 950.70 |
| $200 international (4.4% + 30c) | 200.00 | 9.10 | 4.00 | - | 186.90 |
| $100 sub-coach sale | 100.00 | 3.20 | 2.00 | 5.00 | 89.80 |
| $49 full refund | refunded | 1.72 kept | 0.00 | - | -1.72 (netted from next payout) |
| $49 dispute lost ($15 fee) | 0 | 16.72 | 0.00 | - | -16.72 |
| $49 dispute won | 49.00 | 16.72 | 0.98 | - | 31.30 |

### Tests (local, through ops/heavy.sh)

- `npx jest --runInBand --forceExit <39 related suites>`: 39 passed, 566 tests passed.
- `npx tsc --noEmit -p tsconfig.json`: 0 errors. eslint on changed files: 0 errors. `node scripts/check-r75.js --mode=range`: no positive token change (`as any` net -14).
- CI round 1: everything green except build-and-test (`test/stripe-connect-api-phase6.spec.ts` expected the old createRefund defaults). Fixed in round 2, see the Fix round table on the PR.

### Open risks and decisions (recommended default in brackets)

1. On a full refund TGP is short by the non-returned fee until the coach's next transfer nets it; if the coach never sells again it stays a receivable. Same when Stripe refuses a reversal because the coach was already paid out. Account Debits would close this gap but needs the coach's consent. [Ship with netting; owner/legal to decide on Account Debits.]
2. No cron runs the settlement/transfer sweeper yet; the admin endpoint is the backstop. [Schedule it every 15 min in a follow-up.]
3. Head coach without a Connect account: the sub-coach keeps the 5%. [Keep.]
4. ACH follows the owner ruling strictly (actual fee + 2%). The old 50% rail-savings share stays only in the flagged payouts-v2 compute(). [Keep strict.]
5. Subscriptions created before this PR keep destination charges (TGP pays the fee) until they are recreated. [Owner to decide on migrating them.]
6. Legacy per-purchase ledger rows now dedupe by find-then-create, so concurrent legacy webhooks could create a duplicate row. Reconciliation would flag it as drift.
7. Overlap with #595 is adjacent lines only; whichever merges second rebases.

### PR 1 status

- Head 606b4760efb2b35ab4a5fded7bea034f88fec101: all required checks green (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, schema parity, forward migrations, reversibility). MERGEABLE, behind main (#597, #622 landed after; no conflicts).
- Note: #622 added migration `20270203000000`, which sorts after this PR's `20270126000000_s_fee_charge_settlement`. Prisma deploy still applies it, but it is applied out of order. Recommended: rename it to a later timestamp when this PR is rebased to merge.

## PR 2: $19.99 minimum or exactly $0 (T3)

- Backend: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629 (head 32d81faa). `PackagesService.assertValidPricing`: a paid price must be >= 1999 cents; otherwise the package must be exactly 0, one-time, with no recurring price. Codes: `PACKAGE_PRICE_BELOW_MINIMUM` ("Paid packages start at $19.99, or make it free."), `PACKAGE_RECURRING_PRICE_BELOW_MINIMUM`, `PACKAGE_FREE_MUST_BE_ONE_TIME`. The floor applies on create, on an update that changes the price, and on a draft's first publish. Packages below the floor are never rewritten. Local: 3 suites / 134 tests passed, tsc 0 errors.
- Mobile: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321 (head 8bc4de3a). Package editor shows the rule inline under the price field, blocks the save with the same copy and maps the backend codes to a "Check the price" alert. Local: 2 suites / 15 tests passed, tsc 0 errors.
- Existing packages below $19.99: not checked against production. A read-only SQL query for the operator is in the #629 body.
- Overlap: #595 changes the same validation block and defines free the same way. Recommended merge order: #595, #629, then mobile #321.

## CI at final heads (2026-10-01)

- #627 @ 606b4760: all required checks green.
- #629 @ 32d81faa: all required checks green.
- mobile #321 @ 8bc4de3a: Typecheck/lint/test, Analyze (js-ts), Analyze (actions), CodeQL all green.
- Worktrees removed after the final push.

## Round 2 (operator 17:05 mail, wrap-up 19:10), 2026-10-01 16:40 PDT

**PR:** backend #627, head `70680675ab1e45159c60f94b1204014e5bf828e0` (branch `agent/clinic/s-fee-coach-net`). This is a normal push of a merge commit; nothing was force pushed. PR body updated with a WIP/handoff banner and the fix-round table. Fix-round comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5942743139

**Done**
- **(a) Scheduled sweep.** `src/checkout/settlement-sweep.cron.ts` (`*/15 * * * *`) and `src/checkout/cron-lease.service.ts`.
  - Single runner: CronLease row, one conditional UPDATE `lease_until < now` or a primary-key INSERT; 10-minute lease, released at the end of the run.
  - Bounded: 25 settlements plus 50 transfers per run, 8-minute deadline.
  - Retries: per-transfer backoff (1/5/15/60/240/1440 minutes, 6 attempts).
  - Idempotent: unique ChargeSettlement per charge; the unique ConnectTransfer idempotency key is the Stripe Idempotency-Key.
  - Kill switch `SFEE_SETTLEMENT_SWEEP_ENABLED`, registered in ENV_RULES, prod-switches.yml (owner billing, STUB_ALLOWED) and .env.example.
  - Codes: SFEE_TRANSFER_FAILED, SFEE_TRANSFER_PLATFORM_BALANCE_INSUFFICIENT, SFEE_TRANSFER_ACCOUNT_RESTRICTED (+_FINAL, stored as the last_error prefix), SFEE_SWEEP_{DISABLED,SKIPPED_LOCK_HELD,LOCK_ERROR,FAILED,DEADLINE_REACHED,TRANSFERS_FAILED,DONE}, SFEE_SETTLEMENT_{RETRY_FAILED,FAILED}.
- **(b) Main merge and migration rename.** Merged origin/main 10dff85c in merge commit aaa2655f, no conflicts. Migration renamed to `20270210000000_s_fee_charge_settlement`, after #622's 20270203000000 and the open-PR prefixes of #595, #604, #587, #601, #602, #605, #607 and #609. It now also creates CronLease with RLS enabled and forced, plus service_role and owner policies.
- **(c)** PR body and comment updated; this report section written.

**Tests (local, via heavy.sh)**
- `env CI=false npx jest --runInBand --forceExit` on these 9 files: test/s-fee-settlement-sweep.spec.ts, test/transfer-orchestrator.service.spec.ts, test/purchase-split-handler.service.spec.ts, test/s-fee-charge-settlement.spec.ts, test/payment-ops.controller.spec.ts, test/checkout-webhook-fee-split.spec.ts, test/env-validation.spec.ts, test/deploy-readiness.spec.ts and test/prod-readiness/env-discovery.spec.ts. Result: 9 suites, 379 passed, 1 skipped.
- eslint on changed files: clean.
- r75 range check against 10dff85c: OK, no positive token change.
- Local tsc: **not verified.** It ran out of memory at the 2.5 GB heap cap; the 4 GB re-run was still waiting for the shared lock at wrap-up and was cancelled. The CI build-and-test is the typecheck.

**CI at 70680675**
- Pass: Banned cast tokens, CodeQL, Forward migrations, Reversible migrations, Schema parity, build-sbom, danger, mwb-3-live-tests, npm audit, rls-floor-guard, rls-live-tests, test-deploy-readiness.
- build-and-test: see the final line below.

**Opus REQUEST CHANGES @ 606b4760**
- **B-627-1: PARTIAL.** Fixed in 70680675: the sweeper is now scheduled, and transfer failures are coded and retried, not swallowed. **Open:** the orphan backfill in `runSettlementSweep` (`charge-settlement.service.ts`) filters `settlements: { none: {} }`. A missed renewal charge on a purchase that already has a settlement is therefore never settled. Fix direction: list paid invoices/charges per subscription (or reconcile `invoice.paid` events) against ChargeSettlement by charge id.
- **B-627-2: NOT ADDRESSED.** Concurrent or duplicate refund events over-reverse. Probe: /home/user/workspace/ops/aud-opus/probe_627_concurrency.spec.ts. Fix direction: serialize per charge (row lock or a compare-and-set on ChargeSettlement.refunded_cents), and derive reversal amounts from the charge's cumulative `amount_refunded` minus what is already reversed, keyed by refund id.

**Not started (remaining queue):** the B-627-1 renewal backfill, the B-627-2 refund concurrency fix, and a local tsc confirmation. #629 and mobile #321 are untouched this round, as instructed.
- **CI final:** all required checks green at 70680675, including build-and-test. deploy-readiness-gate was skipped, as on PRs. MERGEABLE. Worktree /home/user/workspace/wt/s-fee-backend removed.

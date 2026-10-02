# B-FEE-R3-110 report (lane B-FEE-R3, operator agent 110)

## backend #627 (agent/clinic/s-fee-coach-net), T4

- Head before: 70680675. Head now: **7d66b350** (pushed, no force).
- Commits: d623dd9d (merge origin/main 53b625d2), 6b02b23b (fix), 7d66b350 (merge origin/main 990d2f31, #595; one import conflict in refund-dispute-handler resolved by keeping both sides).
- B-627-1: CLOSED. The sweep walks paid invoices from the last 35 days (`listPaidInvoices`, 4×100 per run, resumable `CronLease.cursor`) and settles every invoice charge with no ChargeSettlement, matched by charge id. If Stripe is unavailable on the first read, a provisional awaiting row is kept. The orphan window goes 14→35 days. Stale alerts fire after 1 h (SFEE_SETTLEMENT_STALE, SFEE_TRANSFER_STALE).
- B-627-2: CLOSED. A per-charge `ChargeLock` (CronLease row, CAS, TTL 120 s, wait 3 s, re-entrant) covers settleCharge, applyAdjustments and the refund handler's per-refund apply. The refunded amount is cumulative from ChargeRefund rows keyed by refund id. Positions are re-read under the lock and refunds are drained before release. Disputes are re-read from Stripe. The ledger leg position is absolute (setLegPosition). The legacy reversal key carries the refund id. An admin refund racing its webhook is handled with P2002→update.
- C-627-1: unchanged (20270210000000). Cursor column added inside it.
- C-627-2: #608 still open. Whichever lands second adds the erasure-manifest entries. No action needed in #627 now.
- Tests: `env CI=false ops/heavy.sh npx jest --runInBand --forceExit` on 18 suites (new: test/s-fee-charge-concurrency.spec.ts 13 tests, test/s-fee-renewal-backfill.spec.ts 12 tests) → 18/18 suites, 550 passed, 1 skipped (pre-existing). Mutation check: with the lock disabled, 9/13 concurrency tests fail.
- tsc (alone, NODE_OPTIONS=--max-old-space-size=3584): 0 errors. eslint on changed files: 0. check-r75 range vs origin/main: no positive change.
- PR body: tier header kept (T4). Added round-3 sections, a worked $100 example and a Fix round 3 table. Body saved at ops/reports/bfee-r3/627-body-r3.md.
- CI at 7d66b350: all required checks green (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity, forward/reversible migrations). PR showed BEHIND because main moved 3 commits (#630, #631, #623).
- Update: a clean merge of origin/main 4bcfb444 (no conflicts, no overlapping files; r75 OK) was pushed as **2c57cc41**, so the PR is mergeable without another round. CI is re-running at 2c57cc41.
- CI at **2c57cc41**: all 16 checks pass (1 skipping: deploy-readiness-gate). mergeStateStatus CLEAN.

## backend #629 (agent/clinic/s-fee-min-price), promoted T3 → T4 (migration)

- Head before: 32d81faa. Head now: **858eb40b** (pushed, no force).
- Commits: 2881a0e4 (merge origin/main 990d2f31, #595; conflict in assertValidPricing resolved to the #629 rule, which uses the same free definition as #595), 442920cb (fix), 6608c745 (merge origin/main 4bcfb444, clean), 858eb40b (prettier on this PR's hunks only).
- **Migration prefix claim: 20270216000000** (`20270216000000_package_first_published_at`). Additive nullable column, two idempotent backfills (current published_at; earliest ClientPurchase/GuestCheckout), down.sql drops the column. No RLS change.
- B-629-1: CLOSED. The DTOs (`amount_cents`, `recurring_amount_cents`) are `@IsInt @Min(0)` with specific messages, so exactly 0 reaches the service. The service owns the coded $19.99 floor (`PACKAGE_PRICE_BELOW_MINIMUM` / `PACKAGE_RECURRING_PRICE_BELOW_MINIMUM` / `PACKAGE_FREE_MUST_BE_ONE_TIME`). It was proven over real HTTP (production ValidationPipe + HttpExceptionFilter) in the new `test/packages-pricing-http.spec.ts`.
- B-629-2: CLOSED. A durable `CoachPackage.first_published_at` is set on the first publish and never cleared. `publish()` enforces the floor only if the package has never been on sale, so an unchanged grandfathered offer can be unpublished and republished. Never-published drafts still meet the floor.
- C-629-1: CLOSED. `primaryConfigChanged` (amount, currency, billing_type, interval, interval_count, duration_periods) and `recurringConfigChanged` (amount, interval, interval_count; currency when a companion exists) decide floor enforcement in update().
- Extra (owner 13:34): every package error body now carries `code` next to `error` (18 throw sites).
- Tests: `env CI=false ops/heavy.sh npx jest --runInBand --forceExit test/packages.service.spec.ts test/packages-pricing-http.spec.ts test/invite-grant.spec.ts` → 3/3 suites, 100 passed. tsc alone (NODE_OPTIONS=--max-old-space-size=3584) at 6608c745: 0 errors. eslint on changed files: 0. prettier: clean on every changed hunk; the remaining differences are pre-existing on main and outside the diff. check-r75 range: no positive change.
- PR body: tier promoted to T4, migration section, $0 DTO note (shape only; the service owns the coded floor), Fix round table. Saved at ops/reports/bfee-r3/629-body-r3.md (old: 629-body-before-r3.md).

## mobile #321 (agent/clinic/s-fee-min-price-mobile), T3

- Head before: 8bc4de3a. Head now: **a9b1f49d** (pushed). Commits: f3c966e (merge origin/main 0b7f197f, clean), a9b1f49d (fix).
- B-321-1: CLOSED. New `src/utils/packageSaveFailure.ts` maps the status plus machine code (`code`, then `error`) to a specific message and a working action:
  - offline / timeout / 5xx: Try again
  - 401: Sign in
  - 403 plan codes: Open billing
  - other 403 / 404 / archived: Back to packages
  - 400 floor codes / PACKAGE_INVALID: the specific price or field fix
  - 409 locked: create a new package
  - 429: wait
  
  Unknown failures show a short reference from `request_id` and offer Contact support (SupportInbox). They also send a sanitised Sentry event (`package_save_<mode>_failed`, {flow, mode, status, code, reference}). The message stays inline. Archive no longer falls back to a bare "Please try again.".
- C-321-1: CLOSED. `packagePriceIssue(cents, interval, saved)`: grandfathered only while the price and interval are unchanged.
- Tests: `ops/heavy.sh npx jest --runInBand src/utils/__tests__/packageSaveFailure.test.ts src/utils/__tests__/packagePrice.test.ts src/__tests__/CoachPackageEditScreen.lockPreview.test.tsx` → 3/3 suites, 34 passed (real screen: 500 with request_id "sol321-reference" → reference SOL321RE + Sentry; network error → Try again, no Sentry). tsc 0. eslint 0 errors (1 pre-existing warning).
- PR body updated (ops/reports/bfee-r3/321-body-r3.md). Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5945982729
- Note: the app-wide `errorCode()` in src/types/common.ts still reads `data.error` only. I left it alone on purpose (wide blast radius). The package path uses `toAuthErrorDetail` (code, then error). Recommend that the S-ERRORS lane switch `errorCode` to code-first.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629#issuecomment-5945996480
- Re-verification at 858eb40b: eslint 0; 5 package suites (adds packages-archive-guard, package-contents.service): 173 passed.
- CI at 858eb40b: the first build-and-test run failed one unrelated test, `test/ci/release-evidence-gate.spec.ts` ("environment without a required_reviewers rule fails"; the script hit an SBOM-fixture error first). The same main passes on #627 and main. This PR touches nothing under CI, SBOM or package files. I re-ran the failed job (a rerun, not a dispatch) and it passed. All 16 checks pass (deploy-readiness-gate skipping). mergeStateStatus CLEAN.

## CI summary (final)

| PR | Head | Required checks | Merge state |
|---|---|---|---|
| backend #627 | 2c57cc41 | all pass (16, 1 skipping) | CLEAN |
| backend #629 | 858eb40b | all pass (16, 1 skipping; build-and-test green on rerun after one flaky CI-gate test) | CLEAN |
| mobile #321 | a9b1f49d | Typecheck/lint/test, Analyze (js-ts), Analyze (actions), CodeQL: pass | CLEAN |

## Open risks / decisions

1. #627: TGP fronts the recovery amount on a full refund or lost dispute until it is netted from the coach's future transfers. Recommended default: keep netting now, and decide Stripe Account Debits later (owner).
2. #627: a busy charge lock makes the webhook return an error so Stripe retries; this is bounded by the 120 s TTL.
3. #629: packages published and then unpublished before the migration, with no purchase or guest checkout, have no recoverable history. They are treated as drafts (the floor applies on their next publish). Recommended default: accept this (the conservative side). The operator can list them read-only with the SQL in the PR body.
4. #629 is now T4 (migration). Merge order: #629, then mobile #321.
5. Mobile `errorCode()` app-wide still reads `data.error` only. Recommend that S-ERRORS switch it to code-first.
6. Worktrees bfee-r3-627, bfee-r3-629 and bfee-r3-321 were removed (symlinks unlinked first; shared deps intact).

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

# B-FEE-R4 (agent 110) — fee model fix round 4

Status: IN PROGRESS (#627 done; #629 and #321 next)

## #627 backend `agent/clinic/s-fee-coach-net`

- Base: 2c57cc41. Merged origin/main 7a6cfd82 → b82c98f1 (merge commit, no rebase).
- Fix commits: 7b6fd4f0 (code + tests), ef19980f (spec without cast tokens). Head: **ef19980f54ba3cd08f92726ff83266b72583dfb7** (fast-forward push).
- PR body updated (tier header kept, round-4 status, T4 trigger scan, risk 1 owner decision, risk 9, Tests round 4, "Fix round 4" table). Saved: ops/reports/bfee-r4/627-body-r4.md (before: 627-body-before.md).

| Finding | Disposition | Test |
|---|---|---|
| B-627-2 lease admits a 2nd live holder | Closed: CAS fence `cronLease.updateMany({name, holder})` inside each money-write tx + 60 s hold budget → `SFEE_CHARGE_LOCK_LOST` | s-fee-r4-money-protocol: takeover, budget, stale holder refused, paused-in-Stripe holder collapses on same key |
| B-627-5 uncertain reversal → 2nd recovery | Closed: durable `TransferReversalOp` before Stripe, CAS `reversal_seq`; recovery only on 400/402/404; otherwise list reversals by `metadata.tgp_reversal_op` or stay pending + `SFEE_REVERSAL_UNCERTAIN`; transfer.reversed re-converges | response lost ($49/$20 → 2670, 0 recoveries), DB receipt lost, unknown→sweeper, webhook, transfer.reversed, definitive refusal; transfer-orchestrator spec |
| B-627-4 stale dispute after failed read | Closed: `SFEE_DISPUTE_STATE_UNAVAILABLE`, no event fallback; webhook rethrows; reconcile flag + sweeper re-run | won→late created+read failure (coach stays 3130), malformed, reverse order, webhook non-2xx |
| B-627-3 unsecured receivable | In-code closed (clawback from other transfers ≤90 d, reinstatement netting, cash vs receivable); residual = owner decision (activation hold) | clawback, refused clawback, no-sale negative cash + alert, reinstatement netting |
| C-627-3 alerts | Closed: `SFEE_RECOVERY_OPEN` per payee >24 h; `SFEE_PLATFORM_CASH_NEGATIVE`; reversal/reconcile pending alerts | asserted alert text |
| C-627-2 #608 manifest | No action (whoever lands second) | - |

Tests (all `env CI=false /home/user/workspace/ops/heavy.sh npx jest --runInBand --forceExit <files>`):
- batch 1: s-fee-r4-money-protocol, s-fee-charge-settlement, s-fee-charge-concurrency, s-fee-settlement-sweep, s-fee-renewal-backfill → 5 suites, 84 passed
- batch 2: refund-dispute-handler.service, transfer-orchestrator.service, reconciliation.service, split-ledger.service, checkout-webhook-fee-split, purchase-split-handler.service, cancel-pending-on-refund, stripe-connect-api-phase6 → 8 suites, 79 passed (after updating the orchestrator stub)
- batch 3: payment-ops.controller, env-validation, deploy-readiness, prod-readiness/env-discovery, checkout-webhook-handler, packages.service → 6 suites, 406 passed, 1 skipped (pre-existing)
- Failing-before: new spec vs round-3 code (5 service files from b82c98f1, ts-jest diagnostics off) → 17 of 18 fail; 1 control. Log: ops/reports/bfee-r4/627-failing-before.txt
- tsc (`NODE_OPTIONS=--max-old-space-size=3584 heavy.sh npx tsc --noEmit -p tsconfig.json`): 0 errors. eslint/prettier changed files clean. check-r75 range: no positive token change.

Owner decision (B-627-3): hold activation until owner picks a Stripe-side authority (payout delay on coach Express accounts, `debit_negative_balances`, or Account Debits). Recommended: hold; once chosen, (a) payout delay + in-code clawback, then (b) once coach terms carry consent.

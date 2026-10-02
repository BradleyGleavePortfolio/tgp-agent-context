# B-FEE-R5 (agent 111) report

## Backend #627 (agent/clinic/s-fee-coach-net)

- Head: `9d6351b06a0a04fa35ba6ea777b34f2ff388041a` (was `ef19980f`). Main merge `b9ee8e0a` (#604, #629) via merge commit `ea0e14f9`. No conflicts, no rebase, no force push.
- Fix commit `9d6351b0`. PR body updated: status, tier header (T4 scan for round 5), owner decision verbatim + OR-111-1, refund/dispute section, OR-111-1 worked examples, operator item 1 (hold replaced by the owner decision), Fix round 5 table, Round 5 tests. Fix-round comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5957773543
- Body source: `ops/reports/bfee-r5-627-body-draft.md` (the before body is in `bfee-r5-627-body-before.md`).

### Dispositions
| Item | Disposition |
|---|---|
| CI-627-2 env-registration ("zero unregistered env reads"; "real code default and a reason") + deploy-readiness full mode | Fixed. `FLY_MACHINE_ID` registered (optional, default os.hostname(), reason: lease holder id). `SFEE_SETTLEMENT_SWEEP_ENABLED` now records its real default. No test weakened, no exemption widened. |
| OR-111-1 (1) fee rule | `computeAdjustedTargets` keeps platform fee = 2% of the sale; the coach bears the TGP fee, the Stripe fee and the dispute fee. |
| OR-111-1 (1) alert | `PayoutAdjustmentNotice` table (RLS forced, CHECKs) recorded under the charge lock. Delivered claim-once: in-app (Money "needs attention") + push (COACH_ALERT) + email `coach-payout-adjustment` (log transport until the provider is live). The sweep re-delivers failures. The generic refund alert is replaced for settlement charges. |
| OR-111-1 (2) own-transfer reversal | Round-4 `TransferReversalOp` kept; a refused part becomes `held_not_reversed_cents`. |
| OR-111-1 (3) forward-only netting | Clawback removed (code, columns `recovery_clawback_cents`, `recovery_id`, purpose). Netting is carried across sales, with CAS retries on netting and release. |
| OR-111-1 (4) won disputes / residual | Release, then net, then reinstate; `dispute_won` notice. `SFEE_RECOVERY_OPEN` stays (accepted residual). |
| Money API | `GET /v1/coach/payments/adjustments`, `POST /v1/coach/payments/adjustments/:id/acknowledge` (caller-scoped, 404 `PAYOUT_NOTICE_NOT_FOUND`). |

### Worked examples (asserted in `test/s-fee-r5-or-111-1.spec.ts`)
- $100 full refund: 94.80 reversed, 5.20 held (2.00 + 3.20); the next $100 sale transfers 89.60; TGP +2.00.
- $100 lost dispute, $15 fee: 94.80 reversed, 20.20 held (2.00 + 3.20 + 15.00); `dispute_lost` notice; the next $100 sale transfers 74.60; TGP +2.00.
- Refused reversal after payout: 100.00 held (2.00 + 3.20 + 94.80). The $49 sale nets 46.30 and transfers 0 (`netted`). The $100 sale nets 53.70 and transfers 41.10. Only one reversal call (on the refunded sale). TGP +2.00 / +0.98 / +2.00.

### Tests (all via heavy.sh, `env CI=false npx jest --runInBand --forceExit`)
- Batch 1: 16 suites, 269/270 passed. The one failure (email render subject for the new template) was fixed.
- Batch 2: email.service, deploy-readiness, env-discovery, fly-env-classifier, schema-parity-gate passed; that jest process then hit a heap OOM, so the rest moved to batch 3.
- Batch 3: env-registration, env-validation, payment-ops.controller, s-fee-r5: 150/150.
- Batch 4: checkout-webhook-handler, packages.service, s-fee-renewal-backfill: 111/111.
- Failing-before: the new spec on pre-change services (`git checkout ea0e14f9 -- 6 files`, ts-jest diagnostics off) fails 10 of 11 (the 11th, money formatting, is a control).
- `NODE_OPTIONS=--max-old-space-size=3584 heavy.sh npx tsc --noEmit -p tsconfig.json`: 0 errors. eslint on 19 changed files: 0 errors (1 old warning). check-r75 range: no positive change.
- CI at 9d6351b0: see the final section.

### Open risks / decisions
- Schema parity, forward and reversible migrations were not run locally (no Postgres replay); CI is authoritative.
- Email copy and template are new user-facing text; the email goes through the log transport until the provider is live.
- #608 erasure manifest: add `PayoutAdjustmentNotice.payee_user_id` (retain/finance) when #608 lands.

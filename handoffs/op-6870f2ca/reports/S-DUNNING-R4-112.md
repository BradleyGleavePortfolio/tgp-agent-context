# S-DUNNING-R4 (agent 112): stopped under the 13:34 CLEAN-STOP order

This lane started at 12:54. The 13:18 #634 priority interrupt parked it, and the 13:34 clean-stop order stopped it. It is **not finished**. Nothing was pushed to the #628 or #322 PR branches.

## HANDOFF FOR AGENT 113

**PRs (unchanged by this lane):**
- backend #628 `agent/clinic/s-dunning-v2-live` @ `739e9a541df7401276ae769080e99547edf8bd8d`
- mobile #322 `agent/clinic/s-dunning-lockout-screen` @ `0b4813dcfc37fbbeebd16283b1a326e9b8caa734`

The CI state at those heads predates this lane, and this lane did not change it.

**WIP branches:**
- `wip/s-dunning-r4-backend` @ `c8a1c95bf0c99a0a975df698ad32c456cbf221be`
  - Base: #628 head `739e9a54`, plus merge commit `c15342fc` of backend main `f04289f9` (clean merge). Migration `20270215000000` is kept.
  - Changes: 6 files, about 926 lines added and 81 removed (client-billing.service.ts, dunning-v2.service.ts, the webhook dispute pass-through, schema.prisma, the 20270215 migration, test/dunning-r3-money-truth-e2e.spec.ts).
- `wip/s-dunning-r4-mobile` @ `0b4813dc`. This is identical to the #322 head: **no mobile work was started**. Main `2c17c241` is not merged.

**Sol findings, partly closed in the WIP (backend; tests written, not yet pushed to the PR or run in CI):**
- **B-628-11:** pay and void intent is journaled (`paying`/`voiding` plus an idempotency key) before Stripe is called. Resume re-asks Stripe with the same key and never charges twice. Reconciler and catch paths now treat `paying` as uncertain.
- **B-628-8:** dispute obligations are aggregated across all disputes in the transaction. `resolveDisputeCycle` returns blocked with `other_dispute_outstanding`, and the lock uses the same aggregate.
- **B-628-6:** notice delivery is claimed with `claim_token`/`key_attempt`. Fencing:
  - `sending` status with a 10-min claim expiry
  - a cycle-live re-check after the claim
  - stale receipts dropped
  - due-only retry
  - takeover keeps the email idempotency key
- **Tests:** 16 new tests in `describe('S-DUNNING-R4...')`. Locally 31/31 pass. Before the fix, 14 fail and 2 pass (`ops/sdr4-112/r4be_failing_before.log`).

**Open (backend, before pushing WIP to #628):**
1. Remove the banned cast `w.v2 as unknown as {...}` in the test "cycle ends between the retry read". Use `jest.spyOn(DunningV2Service.prototype, ...)` instead. CI's banned-cast check will fail until this is done.
2. Run eslint and prettier.
3. Run these targeted specs: dunning-r3-http-codes, dunning-r2-surfaces, dunning-r2-native-card-1a-2a-e2e, dunning-v2-service, checkout-webhook-handler, dunning-v2-e2e-lifecycle, env-registration. Also confirm `DUNNING_NOTICE_CLAIM_MS`, if it is read from env, is registered in env-validation.ts.
4. Push to #628. Update the fix-round table and add worked examples. Check CI.

**NOT STARTED (mobile #322):** B-322-1, B-322-5, B-322-7, C-322-2 (details are in the lane file and `ops/aud-sol3-112/mobile-322-verdict.md`). Use `ops/sdr4-112/r4contract.json` (the backend partial-busy `in_progress` response) as the paired fixture for B-322-7.

**Next step:** check out `wip/s-dunning-r4-backend`, finish the 4 open items above, and push to `agent/clinic/s-dunning-v2-live`. Then do the mobile round on a branch from `0b4813dc`, merging main `2c17c241`.

**Risk:** dunning migration `20270215000000` sorts before main's `20270216000000`. The operator ruled that it stays.

**Worktrees:** `wt/sdr4-be` and `wt/sdr4-mob` are removed.

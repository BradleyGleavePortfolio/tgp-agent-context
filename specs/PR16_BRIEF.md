# PR-16 BRIEF — Refund/cancel → cancelPendingForPurchase (backend FIX)

Repo: growth-project-backend. Pillar 2/3. Type: FIX. Branch: `pr16/cancel-pending-on-refund`.
PR title: `PR-16: Cancel pending drops on refund / dispute / subscription cancellation`

## Why
Today a refund / chargeback / subscription cancellation revokes the buyer's entitlement, but the **ScheduledDrops already seeded by the fan-out engine (PR-9) keep firing** via the DripDispatcherCron (PR-10). A refunded buyer would keep receiving dripped content (workouts, meal plans, PDFs, videos, auto-messages) they no longer paid for, and the coach would keep getting "delivered" side effects. Master plan §4 Pillar 2: "Refund/cancel → `cancelPendingForPurchase` from refund/dispute/sub-deleted handlers." Decision #10 governs failure→coach-alert; this is the cancellation counterpart.

## Scope — exactly this
Add a single idempotent method `cancelPendingForPurchase(purchaseId, reason, tx?)` and call it from the three revocation webhook handlers. Do NOT change the fan-out seeding, the cron dispatch logic, or resolvers beyond what's needed to mark drops canceled.

### 1. `cancelPendingForPurchase(clientPurchaseId, reason, tx?)`
- Lives wherever the drop lifecycle is owned (likely the PurchaseFanoutService / a DripService alongside PR-9/PR-10 — find the service that already owns ScheduledDrop writes; do NOT create a parallel writer).
- Effect: set `status='canceled'` for all ScheduledDrops of that purchase whose status is in **('pending','due')** — i.e. not-yet-fired. Do NOT touch `fired` (already delivered — can't un-deliver), `failed` (terminal, owned by the alert path), `skipped`, or already-`canceled` rows.
- Must run as a **single UPDATE ... WHERE status IN ('pending','due')** (set-based, not row-by-row) so it's atomic and has no N+1.
- Must accept an optional `tx` so it can run INSIDE the webhook handler's existing entitlement-revocation `$transaction` (so revoke-entitlement + cancel-drops commit-or-rollback together — 50-Failures #44). If no tx passed, run in its own.
- **Idempotent:** calling it twice (Stripe webhook replay) is a no-op the second time (the WHERE clause already excludes canceled rows). Verify replay-safety.
- Record the `reason` (e.g. 'refund' | 'dispute' | 'subscription_canceled') on the drop or a cancellation audit field if the schema supports it; if ScheduledDrop has no reason column, do NOT add one unless trivial/additive — prefer logging + a structured event. Document the choice.
- Interaction with the cron (PR-10): the DripDispatcherCron's findDue must NOT pick up canceled drops. Verify PR-10's claim query filters to pending/due/stale-dispatching and does NOT include 'canceled' — if there's any window where a drop is being dispatched (status='dispatching') at the moment of cancellation, define the rule: a drop already mid-dispatch (claimed) may complete (it was in-flight before cancellation) — but a 'dispatching' row should be flipped to 'canceled' too if not yet delivered, OR left to the dispatcher to finish then no further. Choose the simpler correct rule (recommend: cancel pending+due now; if a dispatching row exists, let the in-flight dispatch finish — it's exactly-once and already claimed — and do not re-seed; document this). Do NOT introduce a race that double-delivers or strands a 'dispatching' row.

### 2. Wire the three revocation handlers (master plan §5 hooks)
Call `cancelPendingForPurchase` inside each, within their existing revocation tx, after entitlement is set inactive:
- **`applySubscriptionDeleted`** (`checkout-webhook-handler.service.ts:284-313` per the inventory — verify current line) — subscription canceled/ended → cancel that purchase's pending drops.
- **`applyPaymentIntentFailed`** (`:359-406`) — payment failed/reversed → cancel pending drops for the affected purchase (only if this actually revokes entitlement; if PI-failed is a pre-entitlement state, scope correctly — do NOT cancel drops for a purchase that was never entitled. Verify the semantics before wiring).
- **`RefundDisputeHandlerService.handle`** — refund AND dispute/chargeback paths → cancel pending drops for the refunded/disputed purchase. Handle both full and (if modeled) partial refunds: for v1, a full refund cancels all pending drops; a partial refund's behavior should match however entitlement is treated today (if partial refund does NOT revoke entitlement, do NOT cancel drops — match the existing entitlement rule). Document.

For each: resolve the ClientPurchase from the Stripe object (subscription id / payment intent id / charge id) the SAME way the existing handler already does — reuse the existing lookup, don't add a new one.

### 3. Coach signal (optional, keep light)
If the existing handlers already emit a coach notification on refund/cancel, leave it. Do NOT add a new notification kind in this PR unless the master plan requires it (it does not — COACH_NEW_PURCHASE was PR-15; cancellation alerts are not a listed decision). Cancelling drops silently is acceptable for v1; note any follow-up in the polish backlog.

## Tests (real, not mocked-away)
- `cancelPendingForPurchase` flips pending+due → canceled in one UPDATE; leaves fired/failed/skipped/already-canceled untouched.
- Idempotent: second call is a no-op (no extra rows changed, no error).
- Runs inside a passed tx and rolls back with the handler tx on failure (revoke + cancel are atomic).
- Each of the 3 handlers, given a Stripe event for an entitled purchase, cancels that purchase's pending drops and does NOT touch a DIFFERENT purchase's drops (scope isolation).
- Replay of the same refund/subscription-deleted/dispute event does not error and does not change additional rows.
- Cron interaction: a canceled drop is NOT returned by the dispatcher's findDue (assert against PR-10's claim query).
- PI-failed for a never-entitled purchase does NOT cancel drops (if that's the correct semantic).

## Deliverables
- Branch + PR vs default. Pull latest default first (builds on PR-1..15).
- `/home/user/workspace/specs/PR16_BUILD_REPORT.md`: file:line of the new method + each handler wiring, the dispatching-row rule you chose, the partial-refund decision, idempotency + atomicity proof, cron-exclusion proof, actual tsc/lint/test counts.
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.

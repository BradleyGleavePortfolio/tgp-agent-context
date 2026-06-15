# PR-395-FOLLOWUP — F3 design clarification: first-payment is PER COACH, FOREVER

**Date:** 2026-06-15
**Context:** R81 follow-up to PR #395 (Roman P4 `CoachFirstPaymentNotification`),
addressing the audit at `audits/PR395_AUDIT_2026-06-14.md` (merge commit
`adc066bd`).
**Decision owner:** PR-395-FOLLOWUP fixer (R81 cycle).

## The mismatch (audit F3, P2)

PR #395's title and the original brief said the first-payment celebration was
scoped **"per coach×client"** (i.e. "second payment for the same coach×client →
NO emit"). The actual implementation enforces **per coach, FOREVER** via
`CoachFirstPaymentNotification.coachId @unique` — once a coach has had their
first-ever client payment, **no later payment from any client** (same or
different) fires the celebration again.

The schema comment, the migration header ("Exactly one row per coach can ever
exist"), the service doc, and the unit tests were all internally consistent on
**per-coach-forever**. Only the title/brief wording was wrong.

## Decision: keep per-coach-forever; correct the wording

We take the audit's **default** path: the per-coach-forever design is correct
and deliberate (it matches the schema + migration + every existing test), so we
do **NOT** change the unique key. Instead we corrected the wording everywhere it
was imprecise:

- **PR title** for the follow-up: "fix tx-escape on first-payment emit +
  spec/test gaps (R81 cycle)" — no longer claims per-coach×client.
- **`ROMAN_P4_BACKEND_PLAN.md`**: added an explicit "Scope of first payment —
  per coach, FOREVER" section.
- **`prisma/schema.prisma`** model comment: now states "PER COACH, FOREVER — NOT
  per coach×client".
- **`coach-first-payment.service.ts`**: the `coachId` doc already framed it as
  "the coach's first-ever payment"; reinforced by the new F4/F6 tests.

### Behaviour, stated unambiguously

| Scenario | Emit? |
|---|---|
| Coach A's first-ever payment (any client) | ✅ yes |
| Coach A's later payment, different client | ❌ no (A already had their first-ever) |
| Coach B's first-ever payment, same client as A | ✅ yes (B's own first-ever) |

The third row is now locked by a new test ("two distinct coaches, same client →
both emit", audit F4).

### Why NOT per-coach×client

Per-coach×client would fire the celebration on every *new client's* first
payment, turning a once-ever "you landed your first client" milestone into a
recurring "new client" event. That is a different product feature; the schema,
migration, and tests were never written for it. Changing the key would have
broken the existing idempotency / second-payment tests, which the brief
forbade.

## Related decisions captured in the same follow-up

- **F5 (refund/chargeback):** RETAIN-BY-DESIGN — a refund or chargeback does NOT
  un-record the ledger row; the milestone is permanent. Locked by
  `first-payment-refund-retention.spec.ts`.
- **F6 (Stripe Connect / sub-coach):** the emit is attributed to the SELLING
  coach (`ClientPurchase.coach_user_id`); a sub-coach selling under a head coach
  celebrates the sub-coach's first client payment, not the head coach's.
- **F1/F2 (the P0/P1):** the notification rows now ride the purchase `tx`
  (threaded `maybeEmitFirstPayment → tryEmitFirstPayment → emitter →
  createNotification(input, tx)`), so an outer rollback leaves zero committed
  notifications and Stripe redelivery produces exactly one.
- **F8 (observability):** an `AuditService` entry
  (`notification.first_payment_emitted`) is written on the winning insert before
  the emit.

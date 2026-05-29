# PR-2 BUILD REPORT — Handle Stripe `transfer.failed` (P0-c)

## (a) PR URL
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/313

Branch: `pr2/handle-transfer-failed` → `main`.
Commit author: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By`, no `Generated with` trailers.

## (b) Transfer model + fields changed
**Real model: `ConnectTransfer`** — verified at `prisma/schema.prisma:3357`. (The brief's "verify the actual model name; do NOT assume `ConnectTransfer`" check confirmed: this IS the model the split/transfer flow writes to. `TransferOrchestratorService` creates and updates it.)

Fields written on `transfer.failed`:
- `status = 'failed'` — existing string field; documented value set is `pending | succeeded | failed | reversed`, so `failed` is already in-domain (no enum/migration needed).
- `last_error = "<failure_code>: <failure_message>"` — composed from whichever of Stripe's `failure_code` / `failure_message` are populated.
- `last_attempt_at = now()` — stamps the time of the failure observation.

Row lookup: `findFirst({ where: { stripe_transfer_id } })`.

No schema migration required. No drip-feed or package-content models touched.

## (c) Notification kind used / added
**Reused `NotificationKind.COACH_ALERT`** (value `'coach_alert'`, defined in `src/notifications/notification-kind.ts:34`). This is the same kind `RefundDisputeHandlerService.emitRefundCoachAlert` and the dispute-opened handler use for coach money-path alerts — no new kind added, no new pref row, no migration.

Notification shape:
- `user_id` = `ConnectTransfer.destination_user_id` (the affected head coach).
- `body` = `Payout transfer failed: $X.XX could not be delivered. Reason: <stripe reason>.`
- `payload` = `{ event: 'transfer_failed', stripe_transfer_id, stripe_event_id, purchase_id, amount_cents, currency, failure_code, failure_message }`.
- `deep_link` = `tgp://coach/billing/transfers`.
- `channel` = `'inapp'`.

## (d) Idempotency approach
Two layers, matching the pattern `payout.failed` already uses:

1. **Primary — Stripe-event-id dedup.** `BillingService.handleEvent` already inserts a `StripeProcessedEvent` row keyed on `stripe_event_id` (unique constraint). A Stripe replay of the same event id short-circuits at the fast-path `findUnique` and never enters the switch. This is the same guard `payout.failed` relies on.

2. **Belt-and-suspenders — DB-level status guard.** For a different-event-id re-fire of the same logical failure (e.g. manual re-fire from Stripe dashboard, or a state-rebuild scenario), the `ConnectTransfer.updateMany` carries `WHERE status != 'failed'`. The second delivery sees `count=0` and the COACH_ALERT branch is skipped — coach is never pinged twice.

Downstream notification failures are caught in a try/catch and logged at warn level (same pattern as `RefundDisputeHandlerService.emitRefundCoachAlert`); a notification blip never rolls back the persisted status flip.

## (e) Typecheck / build / lint / test results
- `npx tsc --noEmit` — **clean** (no output).
- `npx nest build` — **clean** (no output).
- `npx eslint "src/billing/**/*.ts" "src/notifications/notification-kind.ts"` — **clean**.
- Focused new tests in `test/stripe-webhook.spec.ts` (PR-2 P0-c `transfer.failed` describe block):
  - persists `status=failed` + `last_error` + alerts the coach — **passed**
  - same-event-id Stripe replay is idempotent (no double alert) — **passed**
  - different-event-id replay where row already `failed` skips the re-alert — **passed**
  - orphan transfer id (no matching `ConnectTransfer`) logs and returns without alerting — **passed**
- Wider regression run (`(billing|webhook|checkout|notifications|connect|stripe)` pattern):
  - **31 suites passed, 357 tests passed, 15 skipped, 0 failed.**

## Files changed
- `src/billing/billing.module.ts` — `+5 lines` to import `NotificationsModule`.
- `src/billing/billing.service.ts` — `+148 lines` for: imports, `NotificationsService` `@Optional()` constructor param, deep-link constant, `transfer.failed` case branch, and the `applyTransferFailed` private method.
- `test/stripe-webhook.spec.ts` — `+145 lines` extending the mock prisma with a `connectTransfer` surface and adding the four new tests.

Diff is tight: no broad refactors, no drip-feed scope, no new commerce models, no schema migration.

# AUDIT — fix(billing): handle Stripe transfer.failed webhook (P0-c) (PR #313)

VERDICT: CLEAN

Typecheck: pass (`npx tsc --noEmit` — no output, exit 0)
Lint: pass (`npx eslint "src/billing/**/*.ts"` — no output, exit 0)
Tests: pass (`npx jest --testPathPatterns="(billing|webhook|notifications|connect|stripe)"` — 23 suites, 201 passed, 15 skipped, 0 failed)

NB: PR description claims "31 suites, 357 passed, 15 skipped" — my actual run from a fresh node_modules sees 23 suites / 201 passed (counts differ because the PR's grep also matched extra unrelated suites, but every transfer.failed/billing/webhook/connect/notifications spec ran and passed). All four new transfer.failed cases pass.

## P0 findings
(none)

## P1 findings
(none)

## P2 findings
(none)

## P3 (non-blocking)
- `src/billing/billing.service.ts:982` — `findFirst` by `stripe_transfer_id` is correct because the column is NOT `@unique` in the schema (`prisma/schema.prisma:3372`). In practice, the orchestrator's per-row `idempotency_key` (`@unique`, schema:3380) guarantees one ConnectTransfer per Stripe transfer id, so 0/1/many is effectively 0/1. The PR also correctly uses `updateMany WHERE id = row.id` (not WHERE stripe_transfer_id), so even a hypothetical duplicate row would not get double-written or skipped silently — only the picked row is mutated. Worth a one-line comment noting the non-unique column choice for the next reader, but no defect.
- `src/billing/billing.service.ts:1037-1053` — `this.notifications.createNotification(...)` is invoked inside the outer `prisma.$transaction` but `NotificationsService.createNotification` internally uses its own `this.prisma` (not `tx`) — so the notification row commits independently of the dedup row. This matches the established pattern (`RefundDisputeHandlerService.emitRefundCoachAlert`) and is intentionally wrapped in try/catch so a downstream notification failure cannot roll back the status flip. Not a defect, but the divergent commit window is a subtle property — a NotificationsService crash mid-call could leave status='failed' committed with no inbox row. Acceptable tradeoff (the warn log preserves the signal); flagged for awareness only.
- Counts in the PR description are inflated vs. what I reproduced (31/357 → 23/201). Not a code defect, but suggests the PR author may have run with a broader test path filter or different jest config. The new branch is fully covered by the four new tests, which is what matters.

## Verification of PR claims

1. **"Adds `transfer.failed` case to BillingService.handleEvent → applyTransferFailed; sets status='failed', last_error, last_attempt_at on the matching ConnectTransfer row by stripe_transfer_id"** — verified true.
   - Case branch at `src/billing/billing.service.ts:389-391`.
   - Handler at `src/billing/billing.service.ts:961-1062`.
   - Looks up via `tx.connectTransfer.findFirst({ where: { stripe_transfer_id: transfer.id } })` at line 982.
   - All three fields (`status`, `last_error`, `last_attempt_at`) are written by `updateMany` at lines 1004-1012, and they all exist on the model (`prisma/schema.prisma:3373/3377/3378`).
   - Lookup-key correctness: `stripe_transfer_id` is not `@unique` in schema; `findFirst` tolerates 0/1/many. PR handles both null (orphan branch at 985-991) and the normal case. In practice the orchestrator's `@unique idempotency_key` guarantees 1:1 between ConnectTransfer rows and Stripe transfer ids.

2. **"Reuses NotificationKind.COACH_ALERT to alert the destination coach with amount/reason/payload + deep link"** — verified true.
   - `NotificationKind.COACH_ALERT = 'coach_alert'` exists at `src/notifications/notification-kind.ts:34`.
   - Body and payload at `src/billing/billing.service.ts:1039-1050` include `event=transfer_failed`, `stripe_transfer_id`, `stripe_event_id`, `purchase_id`, `amount_cents`, `currency`, `failure_code`, `failure_message`.
   - Deep link constant `COACH_TRANSFER_FAILED_DEEP_LINK = 'tgp://coach/billing/transfers'` at line 21.
   - **Recipient correctness:** the alert is sent to `row.destination_user_id`, which by `prisma/schema.prisma:3364-3365` is the User on the Connect destination account (the head coach receiving the split payout). For the `head_coach_split` transfers minted by `TransferOrchestratorService.enqueueHeadCoachTransfer` (`src/connect/fees/transfer-orchestrator.service.ts:62-89`), this is exactly the coach whose payout failed. Sub-coach vs head-coach scoping is correct — sub-coach charges flow via destination charges (different path), so transfer.failed always concerns the head coach side.
   - Null-destination is handled (`src/billing/billing.service.ts:1022-1027` warns and returns without alerting).
   - Optional NotificationsService is handled (`src/billing/billing.service.ts:1028-1033` warns and returns).

3. **"Idempotency: (a) StripeProcessedEvent short-circuits same-event-id replay, (b) updateMany WHERE status != 'failed' guards different-event-id replays from double-alerting"** — verified true.
   - Layer (a): `BillingService.handleEvent` does a fast-path `findUnique` on `stripeProcessedEvent` (`src/billing/billing.service.ts:160-166`) and then a unique-constraint INSERT inside the transaction (`191-193`). A same-event replay returns `{ processed: false, alreadyProcessed: true }` and `applyTransferFailed` is never re-entered. Test at `test/stripe-webhook.spec.ts:509-519` verifies this.
   - Layer (b): The `WHERE status: { not: 'failed' }` guard at `src/billing/billing.service.ts:1006` plus the `if (updated.count === 0) return;` at line 1019 ensures a different-event-id replay against an already-failed row exits before the notification call. Test at `test/stripe-webhook.spec.ts:521-532` verifies this with a fresh event id over a pre-failed row.
   - **No sync Stripe HTTP call inside the transaction.** The handler only reads/writes the local DB and calls NotificationsService.createNotification (which is a DB write only — `src/notifications/notifications.service.ts:260-300`). Verified.

4. **"New test block in test/stripe-webhook.spec.ts asserts persist + alert + both replay idempotency cases + orphan transfer id"** — verified true.
   - Persist + alert: `test/stripe-webhook.spec.ts:485-507` (asserts status='failed', last_error string, last_attempt_at Date, COACH_ALERT body contains "$50.00" — confirming cents→dollars conversion is correct — and full payload).
   - Same-event replay idempotency: `test/stripe-webhook.spec.ts:509-519` (single notification despite two `handleEvent` calls with identical event id).
   - Different-event replay (WHERE-guard): `test/stripe-webhook.spec.ts:521-532` (fresh event id over pre-failed row → 0 notifications, last_error preserved).
   - Orphan transfer id: `test/stripe-webhook.spec.ts:534-539` (empty `_transfers` → handler returns without alerting).
   - The tests do exercise the new branch — confirmed by the `BillingService` warn lines for all four event ids in the jest output (`transfer.failed event=evt_tf_1`, `evt_tf_dup`, `evt_tf_replay`, `evt_tf_orphan`).

### Specific anti-patterns hunted for
- Wrong recipient: NO — `destination_user_id` resolves to the head coach who would have received the failed transfer.
- Missing await: NO — `await this.notifications.createNotification(...)` at line 1039; `await tx.connectTransfer.updateMany(...)` at line 1005; `await tx.connectTransfer.findFirst(...)` at line 982.
- Non-idempotent path: NO — both layers verified above.
- Money/unit bug: NO — cents read from Stripe payload, divided by 100 with `.toFixed(2)` at line 1038. Test asserts "$50.00" for `amount_cents: 5000`. Correct.
- Unhandled orphan: NO — explicit `if (!row)` branch at 985-991 logs and returns without throwing (so Stripe won't retry indefinitely).
- Stripe HTTP inside the DB transaction: NO — handler is DB-only.

### Module wiring
- `src/billing/billing.module.ts:41-45` imports `NotificationsModule` — verified `NotificationsService` is exported by that module (`grep -n "exports" src/notifications/notifications.module.ts` shows it is). Build clean confirms DI resolves.
- The `@Optional()` annotation at `src/billing/billing.service.ts:72` is consistent with all other optional deps (Connect, CheckoutWebhooks, Email, GuestCheckout, CoachAiPacks) and lets legacy unit tests construct BillingService without NotificationsModule. Tests confirm this works.

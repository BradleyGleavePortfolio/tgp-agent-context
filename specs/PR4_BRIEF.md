# PR-4 BUILD BRIEF — PurchaseFanoutService (no-op body) + wire all 3 hook points

**Repo:** growth-project-backend (NestJS). **Pillar 2/3. Type: BUILD (seam only — no-op fan-out body).**
**Branch:** `pr4/fanout-seam` off latest default (which now includes PR-2 + PR-3; pull latest first — PR-3 added the `PurchaseFanout` model you will write to).

## GOAL
Introduce `PurchaseFanoutService` and wire its single entry method `onPurchaseEntitled(...)` into ALL THREE checkout paths, INSIDE the existing entitlement `$transaction`. The BODY is intentionally a near-no-op this PR: it just creates/loads the `PurchaseFanout` bookkeeping row (idempotent) and returns — NO scheduled-drop seeding, NO asset materialisation yet (those come in PR-9). The point of this PR is to land the SEAM safely so later PRs fill in the body without touching the checkout transaction again.

## THE 3 HOOK POINTS (exact — verify line numbers against current code, they may have shifted after PR-2/PR-3 merges)
All three flip `entitlement_active=true`. Call `purchaseFanout.onPurchaseEntitled(purchase, ctx, tx)` inside the SAME `$transaction`, AFTER the ClientPurchase/entitlement write and the revenue split:

1. `src/checkout/checkout-webhook-handler.service.ts` — `applyCheckoutCompleted` (in-app hosted), after `splits.onChargeSucceeded` (~line 152). entrypoint = `in_app_hosted`.
2. `src/checkout/checkout-webhook-handler.service.ts` — `applyPaymentIntentSucceeded` (in-app PaymentSheet) (~line 348). entrypoint = `in_app_ps`.
3. `src/storefront/guest-checkout.service.ts` — inside `convertGuestToUser`'s tx, after `ClientPurchase.create` (~line 1320). entrypoint = `storefront_guest`.

VERIFY each call site is genuinely inside the Prisma `$transaction` callback (receives the `tx` client), and pass that SAME `tx` into the service so the fan-out row commits-or-rolls-back atomically with the entitlement. If any of these three is NOT currently wrapped in a `$transaction`, STOP and report it — do not silently create one without flagging the change.

## THE SERVICE (no-op body)
```
onPurchaseEntitled(purchase: {id, ...}, ctx: { entrypoint: 'in_app_hosted'|'in_app_ps'|'storefront_guest', coachId?, clientId? }, tx: Prisma.TransactionClient): Promise<void>
```
Body THIS PR:
- Upsert a `PurchaseFanout` row keyed on `purchase_id` (which is `@unique`): if it already exists, do nothing (idempotent across Stripe webhook replays — CRITICAL, the same checkout.completed/payment_intent.succeeded event can be redelivered). Set `entrypoint` and leave `state='pending'`.
- That's it. Add a structured debug log "fanout seam invoked (no-op)" with purchase id + entrypoint. Add a `// PR-9 will seed ScheduledDrop + fire immediate here` TODO marker.
- The method MUST NOT make any synchronous Stripe HTTP call (anti-pattern A276-P1-3). It only touches the DB via the passed `tx`.

## IDEMPOTENCY (the thing the auditor will hammer)
- Use the `@@unique(purchase_id)` to make the upsert a true on-conflict-do-nothing. A Stripe event replay must NOT create a second PurchaseFanout row and must NOT throw a unique-violation that aborts the (now-idempotent) checkout. Prefer `tx.purchaseFanout.upsert({ where:{purchase_id}, create:{...}, update:{} })` or an equivalent on-conflict-nothing. Verify the surrounding webhook handler is already idempotent (StripeProcessedEvent) and that your addition does not break that.

## SCOPE GUARDRAILS
- Seam + no-op body ONLY. NO ScheduledDrop logic, NO resolver, NO cron, NO materialisation, NO endpoints, NO mobile.
- Wire the service into the right Nest module (`checkout.module.ts` and/or storefront module) so DI resolves in all 3 call sites. Avoid circular-import issues (the guest service is in storefront, the webhook handler in checkout — make `PurchaseFanoutService` live in a place both can import, e.g. its own provider/module, and export it).
- Do NOT change checkout/guest behavior other than adding the (idempotent, no-op) fan-out row.

## VERIFICATION
1. tsc --noEmit / nest build + eslint — must pass.
2. Add focused unit tests: (a) onPurchaseEntitled creates exactly one PurchaseFanout row, (b) calling it twice for the same purchase (replay) leaves exactly one row and does not throw, (c) it writes via the passed tx (rolls back with the tx if the outer tx aborts). Plus assert it's invoked at each of the 3 hook points (or at least the webhook ones via existing webhook tests).
3. Run existing checkout/guest/webhook tests — must still pass.

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr4/fanout-seam`, PR against default, report PR URL.
- PR description: the 3 hook points (file:line) + confirmation each is inside the entitlement $transaction, the idempotency mechanism, and test results.

## DELIVERABLE
Report: (a) PR URL, (b) the 3 wired hook points with file:line + tx confirmation, (c) idempotency mechanism, (d) module wiring approach (how circular import avoided), (e) test results. Write a copy to /home/user/workspace/specs/PR4_BUILD_REPORT.md.

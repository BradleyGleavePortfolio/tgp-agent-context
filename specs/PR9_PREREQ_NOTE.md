# CRITICAL PREREQ FOR PR-9 (real fan-out body) — transaction atomicity

**Discovered during PR-4 build + audit (both confirmed):**

The two in-app webhook hook points are NOT currently wrapped in a Prisma `$transaction`:
- `checkout-webhook-handler.service.ts` `applyCheckoutCompleted` (~141-152)
- `checkout-webhook-handler.service.ts` `applyPaymentIntentSucceeded` (~365-372)

Only the guest path (`guest-checkout.service.ts` `convertGuestToUser` ~1245, 1344-1348) runs inside a real `$transaction` and gets the real `tx`.

PR-4 (no-op fanout row) called the service with `this.prisma` at the two webhook sites — acceptable at no-op scope (P3), idempotency held via `PurchaseFanout.purchase_id @unique` + `upsert({update:{}})` + outer `StripeProcessedEvent` dedup.

**PR-9 MANDATE (else it's a P1 atomicity bug — "money+content commit-or-rollback together", 50-Failures gate):**
Before introducing the real fan-out body (seed ScheduledDrop + fire immediate inline), PR-9 MUST transaction-wrap BOTH webhook hook points so the entitlement write + revenue split + fan-out (drop seeding + immediate materialisation) all commit-or-roll-back atomically. The auditor's recommended approach: plumb `BillingService.handleEvent`'s outer transaction through `checkoutWebhooks.handle(event, tx)` so the webhook handler receives and uses a real `tx` at both sites. Then pass that `tx` into `onPurchaseEntitled`.

This is now a hard precondition baked into the PR-9 brief.

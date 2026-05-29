# PR-9 BUILD BRIEF — Real fan-out body (seed ScheduledDrops + fire immediate inline) + atomicity prereq

**Repo:** growth-project-backend (NestJS). **Pillar 3 (the heart of the engine). Type: BUILD.**
**Branch:** `pr9/real-fanout-body` off latest default (will have PR-2/3/4/6/7/8).

## GOAL
Replace PurchaseFanoutService's no-op body (from PR-4) with the REAL fan-out: at the moment a purchase becomes entitled, read the package's `CoachPackageContent` rows (authored in PR-8), SNAPSHOT them into per-buyer `ScheduledDrop` rows (decision: snapshot-at-purchase so later coach edits don't retroactively change existing buyers — PR-17 handles opt-in push), compute each drop's `fire_at` from its cadence, and for `immediate` cadence MATERIALISE the deliverable INLINE at checkout (decision #3 + #8) by calling the PR-7 `AssignableAssetResolverRegistry`. Future-dated drops stay pending for PR-10's cron to dispatch.

## HARD PREREQUISITE (do this FIRST — else P1 atomicity bug, 50-Failures gate)
The two in-app webhook hook points are NOT currently wrapped in a Prisma `$transaction` (only the guest path is). See /home/user/workspace/specs/PR9_PREREQ_NOTE.md (READ IT).
- `checkout-webhook-handler.service.ts` `applyCheckoutCompleted` (~141-152)
- `checkout-webhook-handler.service.ts` `applyPaymentIntentSucceeded` (~365-372)

**MANDATE:** Before introducing the real body, transaction-wrap BOTH webhook hook points so entitlement write + revenue split + fan-out (drop seeding + immediate materialisation) all commit-or-roll-back ATOMICALLY (money + content commit together). Recommended approach (auditor-endorsed): plumb `BillingService.handleEvent`'s outer transaction through `checkoutWebhooks.handle(event, tx)` so the webhook handler receives and uses a real `tx` at both sites, then pass that `tx` into `onPurchaseEntitled`. The guest path (`guest-checkout.service.ts convertGuestToUser`) ALREADY has a real tx — reuse it, pass it through identically. ALL THREE entitlement paths must call fan-out with a real tx.

## THE REAL FAN-OUT BODY (PurchaseFanoutService.onPurchaseEntitled(purchaseId, tx))
Idempotent (PR-4 already guards with `PurchaseFanout.purchase_id @unique` + upsert + outer StripeProcessedEvent dedup — KEEP that). Inside the passed tx:
1. Load the purchase → its `CoachPackage` → non-removed `CoachPackageContent` rows ordered by display_order.
2. For each content, create a `ScheduledDrop` SNAPSHOT row (copy asset_type, asset_id, asset_revision_id, cadence_kind, cadence_payload, display_title/caption AT PURCHASE TIME — do not FK-follow live content for delivery). Compute `fire_at`:
   - `immediate` → fire now (materialise inline, see step 3).
   - `relative_to_purchase` → purchase_time + offset_days.
   - `fixed_calendar` → release_at; **if release_at is already in the past at purchase, treat as immediate** (materialise inline now) — this is the documented rule from PR-8.
   - `on_completion` / `on_milestone` → `fire_at = NULL`, status pending-trigger (PR-11 fires these; PR-9 just seeds them, does NOT wire triggers).
3. For drops that should fire immediately (immediate + past fixed_calendar): call `AssignableAssetResolverRegistry` (PR-7) to materialise INLINE inside the tx. Honor PR-7's at-least-once contract + the `ScheduledDrop.drip_drop_id @unique` / `materialised_ref IS NULL` guard PR-7 added for meal_plan TOCTOU. On success set the drop's `materialised_ref` + status delivered. Send the drop alert (push + in-app, decision #9) — BUT alert dispatch is a side-effect: enqueue/emit it so it does NOT roll back the money tx if the push provider fails (alerts are at-least-once, not in the money tx; a failed push must not undo entitlement). Document this boundary.
4. Future-dated drops (relative_to_purchase, future fixed_calendar) remain status=pending with fire_at set — PR-10's cron dispatches them. Do NOT dispatch them here.

## CRITICAL CORRECTNESS (50-Failures gate)
- **Atomicity:** money + entitlement + drop seeding + immediate materialisation commit-or-rollback together. A resolver failure on an immediate drop must roll back the whole purchase OR be handled per PR-7's at-least-once contract (decide and DOCUMENT: recommended = immediate materialisation failure should NOT silently lose money; either roll back and let Stripe retry the webhook, or commit money+drops and let the drop retry as pending — pick the one consistent with PR-7's contract and idempotency, and justify).
- **Idempotency:** webhook re-delivery must not double-seed drops or double-materialise (PurchaseFanout unique + per-drop unique guards). Verify replay safety explicitly.
- **Snapshot semantics:** existing buyers unaffected by later content edits/soft-deletes (drops copy content, don't live-join). 
- **Side-effect boundary:** push/in-app alerts are outside the money tx (fire-and-forget / outbox), failures logged + retried, never roll back entitlement.
- Do NOT regress PR-4's three wired hook points or PR-8's authoring endpoints.

## SCOPE GUARDRAILS
- Backend only. Fan-out body + tx-wrap of the two webhook sites + immediate inline materialisation + seed future drops. 
- NO cron (PR-10), NO trigger glue for on_completion/on_milestone (PR-11 — just seed them with fire_at NULL), NO media upload (PR-12), NO mobile (PR-13), NO refund/cancel (PR-16), NO push-to-existing (PR-17).

## VERIFICATION
1. nest build + tsc + eslint clean.
2. Tests: 
   - Purchase of a package with mixed cadences seeds the right ScheduledDrops with correct fire_at per cadence; immediate ones are materialised inline (resolver called, materialised_ref set, status delivered) within the tx; future ones are pending with fire_at.
   - past fixed_calendar treated as immediate.
   - on_completion/on_milestone seeded with fire_at NULL, pending-trigger.
   - Idempotency: replaying the same webhook event does not double-seed or double-materialise.
   - Atomicity: a forced resolver failure on an immediate drop behaves per the documented contract (rollback OR pending-retry) — assert money+content consistency (no orphan entitlement without drops, no drops without entitlement).
   - All THREE entitlement paths (checkout.completed, payment_intent.succeeded, guest conversion) run fan-out with a real tx.
   - Alert dispatch failure does NOT roll back entitlement.
3. Existing tests pass (the 3388+ suite).

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr9/real-fanout-body`, PR against default, report PR URL.
- PR description: the tx-wrap of both webhook sites (how outer tx is plumbed), the fan-out body, snapshot semantics, per-cadence fire_at computation, immediate inline materialisation via PR-7 registry, the atomicity contract decision + justification, the alert side-effect boundary, idempotency, test results.

## DELIVERABLE
Report: (a) PR URL, (b) how you plumbed the outer tx through both webhook sites + guest path, (c) the fan-out body logic + per-cadence fire_at, (d) the atomicity contract you chose for immediate-drop resolver failure + why, (e) the alert side-effect boundary, (f) idempotency/replay safety, (g) test results. Copy report to /home/user/workspace/specs/PR9_BUILD_REPORT.md.

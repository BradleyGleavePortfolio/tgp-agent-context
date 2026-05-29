# PR-9 BUILD REPORT — Real PurchaseFanout body + outer-tx plumbing (the heart of the engine)

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/319

- Branch: `pr9/real-fanout-body` off latest `main` (PR-2/3/4/6/7/8 already merged).
- Two commits on the branch:
  - `e111a09c` — initial build (fan-out body + outer-tx plumbing + 21 tests).
  - `c6c6dc39` — **R1 audit-fix** — closes P1-1 and P1-2 by re-keying workout + auto_message idempotency on the stable `(purchaseId, contentId)` pair (not the regenerated `scheduledDropId`); adds `DripResolverMarker` (one additive migration); adds P2-1 splits-rollback observability log; adds P2-2 rollback+retry-with-regenerated-UUIDs spec.
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. NO `Co-Authored-By` / generated trailers on either commit.

## R1 audit-fix summary

### P1-1 + P1-2 — workout / auto_message double-fire across rollback+retry

The auditor flagged that the PR-9 atomicity contract — "resolver throw → outer tx rolls back → Stripe retries → per-resolver uniques make the retry safe" — was BROKEN for the two resolver types whose downstream commits land OUTSIDE the outer `$transaction`:

- `WorkoutAssetResolver` delegates to `WorkoutBuilderService.assignPlan`, which opens its own internal `$transaction` on `this.prisma`. The idempotency key embedded `scheduledDropId` (a UUID `@default(uuid())` regenerated when the outer tx rolls back and the retry's `createMany` mints a fresh UUID). On retry the ledger cache-missed → second `ClientWorkoutAssignment`.
- `AutoMessageAssetResolver` had no per-type unique at all. `MessagingService.sendAsCoach` commits `CoachMessage` on its own connection; on retry a second `CoachMessage` was sent.

**Fix** — thread `(clientPurchaseId, contentId)` (both stable across rollback+retry) into `AssignableAssetMaterialiseInput` and re-key the two resolvers:

| Resolver | Stable key | Survives rollback because |
|---|---|---|
| `WorkoutAssetResolver` | `drip:workout:p={purchaseId}:c={contentId}` (fallback to `drip:workout:{client}:{plan}:{scheduledDropId}` for PR-10 cron) | `WorkoutBuilderIdempotencyKey` row is written via `this.prisma` outside the outer tx; the retry observes the cached `completed` claim and returns the cached assignment without re-firing `assignPlan`. |
| `AutoMessageAssetResolver` | `DripResolverMarker(purpose='auto_message', purchase_id, content_id)` claimed BEFORE `sendAsCoach`, updated with `materialised_ref` AFTER | Marker is written via `this.prisma` outside the outer tx. On retry the second `create` P2002s; the resolver re-reads the marker. If `materialised_ref` is set → return cached message id (no second send). If null → the prior attempt died after marker insert but before `sendAsCoach` commit; complete the send and stamp. |

`MealPlanAssetResolver` and `MediaAssetResolver` were already safe (the former rides the outer tx and rolls back cleanly; the latter has `ClientAssetGrant @@unique([client_id, media_asset_id])` which is naturally stable across UUID churn).

### Additive migration

`prisma/migrations/20261204000000_pr9_drip_resolver_marker/migration.sql`:

```sql
CREATE TABLE "DripResolverMarker" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "materialised_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DripResolverMarker_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DripResolverMarker_purpose_purchase_id_content_id_key" ON "DripResolverMarker"("purpose", "purchase_id", "content_id");
CREATE INDEX "DripResolverMarker_purchase_id_idx" ON "DripResolverMarker"("purchase_id");
```

NO `DROP`, NO `RENAME`, NO type change on any existing column. New table starts empty → metadata-only migration. The `purpose` namespace allows future resolver types to share the table without further migrations.

### P2-1 — splits-rollback observability

`BillingService.handleEvent`'s catch block now emits a structured `warn` line on rollback enumerating the three classes of side-effect that committed outside the outer tx and may be visible against a rolled-back purchase (splits ledger; `WorkoutBuilderIdempotencyKey` rows under `drip:workout:p={purchase}:c=*`; `DripResolverMarker(purpose='auto_message', purchase_id=...)`). This is the operator runbook hint the audit asked for — oncall hitting a rollback storm now knows exactly which three tables to check before manual intervention.

### P2-2 — strengthened tests

`test/purchase-fanout-rollback-retry.spec.ts` (3 new tests) actually simulates the rollback+retry production failure mode the audit identified:
1. Runs fan-out on a fresh tx (resolvers fire, sub-effects commit on shared `this.prisma`-equivalent stores).
2. "Rolls back" the outer tx by discarding it.
3. Runs fan-out on a NEW tx — `createMany` mints FRESH drop UUIDs (proven by `expect(attempt2DropIds).not.toEqual(attempt1DropIds)`).
4. Asserts the underlying side-effect commit was made EXACTLY ONCE across both attempts.

Three scenarios:
- workout + auto_message — both resolvers' caches collapse the retry onto the cached row (`wb._cache.size === 1`, `sendCalls.length === 1`).
- auto_message reclaim — first attempt throws mid-send; retry observes `materialised_ref==null`, completes, stamps the marker.
- auto_message cached — both attempts succeed; retry observes `materialised_ref` set and returns the cached id without `sendAsCoach` being called a second time.

Two new workout unit tests in `test/assignable-asset-resolver-workout.spec.ts` assert the new key shape — stable vs. fallback paths.

### R1 verification

- `tsc --noEmit` — clean.
- `nest build` — clean.
- `eslint` — 0 errors, 17 pre-existing warnings unchanged.
- Full jest: **286 suites pass; 3428/3428 active tests pass** (+5 over R0's 3423; +26 over `main`'s 3402), 20 skipped + 5 todo unchanged, 6 snapshots pass.

---

## R0 original report (preserved for reference)

## (b) How the outer tx is plumbed through both webhook sites + guest path

The auditor-endorsed plan: `BillingService.handleEvent`'s outer `$transaction` is the source of truth; we thread its `tx` through the checkout webhook handler so the entitlement update + fan-out (drop seed + immediate materialisation) all commit-or-roll-back together with the `StripeProcessedEvent` dedup row.

| Path | Call site (file:line) | tx source | What runs inside the tx |
|---|---|---|---|
| `checkout.session.completed` | `checkout-webhook-handler.service.ts:applyCheckoutCompleted` | `BillingService.handleEvent` → `checkoutWebhooks.handle(event, tx)` | `ClientPurchase.update({ entitlement_active:true })` + `PurchaseFanoutService.onPurchaseEntitled(updated, ctx, tx)` |
| `payment_intent.succeeded` | `checkout-webhook-handler.service.ts:applyPaymentIntentSucceeded` | same | same |
| Storefront guest convert | `guest-checkout.service.ts:convertGuestToUser` | The path's pre-existing `this.prisma.$transaction(async (tx) => …)` | `tx.clientPurchase.create({entitlement_active:true})` + `tx.guestCheckout.update(...)` + `PurchaseFanoutService.onPurchaseEntitled(purchaseRow, ctx, tx)` |

Mechanical changes:

- `CheckoutWebhookHandlerService.handle(event, tx?: Prisma.TransactionClient)` — `tx` is optional so legacy hand-constructed test wiring (no `$transaction`) keeps working; in production wiring `tx` is always present.
- `applyCheckoutCompleted` and `applyPaymentIntentSucceeded` use `db = tx ?? this.prisma` for the read + update so they participate in the outer tx, and call `fanout.onPurchaseEntitled(updated, …, tx)` when `tx` is present.
- `BillingService.handleEvent` captures the result of `checkoutWebhooks.handle(event, tx)`; when `result.claimed && result.purchase_id` it stages the purchase id for post-commit alert flush (see (e)).
- Guest path now passes `purchaseTime: new Date()` so cadence math is anchored to the actual entitlement moment, not the original `pending` row creation, and captures `purchaseRow.id` into a hoisted `entitledPurchaseId` so the post-tx alert flush sees it after the `$transaction` callback returns.
- **Splits intentionally stays OUTSIDE the outer tx** (uses `this.prisma`). `TransferOrchestratorService` issues synchronous Stripe HTTP calls to mint the head-coach `Transfer`; holding the Postgres connection through that round-trip is the documented A276-P1-3 anti-pattern. The split ledger inserts are idempotent via composite-unique upserts + the existing sweeper, and FK to a `ClientPurchase` row that ALREADY exists in `pending` state (the webhook only flips `entitlement_active`, it doesn't create the row), so a rolled-back outer tx never orphans a ledger row.

## (c) Fan-out body logic + per-cadence `fire_at`

`PurchaseFanoutService.onPurchaseEntitled(purchase, ctx, tx)`:

1. **Idempotency row** — `tx.purchaseFanout.upsert({where:{purchase_id}, create:{...}, update:{}})` (PR-4 contract preserved).
2. **Load** — `tx.clientPurchase.findUnique` for the purchase row; `tx.coachPackageContent.findMany({package_id, removed_at:null}, orderBy:{display_order:'asc'})`. Empty package → short-circuit (no drops to seed, fanout row left `pending`).
3. **Snapshot + seed** — for each content row, build a `ScheduledDrop` snapshot (copies `asset_type`, `asset_id`, `asset_revision_id`, `cadence_kind`, `cadence_payload`, `display_title`, `display_caption` AT PURCHASE TIME — the snapshot semantic is the whole point: later authoring edits cannot retroactively change existing buyers' delivery; PR-17 will handle opt-in push to existing) with a per-cadence `fire_at`:

| `cadence_kind` | `fire_at` | Status seeded |
|---|---|---|
| `immediate` | `now` | (materialised inline below) |
| `relative_to_purchase` | `purchaseTime + offset_days * 86400000` | `pending` |
| `fixed_calendar` (future) | `release_at` | `pending` |
| `fixed_calendar` (past) | `now` | (materialised inline — PR-8 documented rule) |
| `on_completion` / `on_milestone` | `NULL` | `pending` (PR-11 wires triggers) |
| (unknown / malformed) | `NULL` | `pending` (no blind firing — operator alarm) |

   The seed is `tx.scheduledDrop.createMany({data, skipDuplicates:true})` against the existing `@@unique([client_purchase_id, content_id])` so a webhook replay does NOT P2002.

4. **Materialise immediate** — `tx.scheduledDrop.findMany({client_purchase_id})` re-reads, then for each drop with `materialised_ref IS NULL && fire_at <= now`: call `AssignableAssetResolverRegistry.materialise(asset_type, { clientId, coachId, assetId, assetRevisionId, displayTitle, displayCaption, scheduledDropId, tx })`. On success: `tx.scheduledDrop.update({ materialised_ref, status:'fired', fired_at, attempt_count:{increment:1} })`. The `tx` is forwarded into the resolver so the resolver's own writes (per PR-7: `DailyMealPlanAssignment` insert with `drip_drop_id`; `ClientAssetGrant` insert with `granted_via_drop_id`) commit-or-roll-back with the parent tx.
5. **Stamp succeeded** — `tx.purchaseFanout.update({state:'succeeded', finished_at:NOW})`. A partial commit (entitlement+drops without fanout state) is impossible.
6. **Stage alerts** — per-drop `AlertDescriptor` records pushed onto an in-memory bucket keyed by `purchase_id`. The bucket is flushed (or discarded) by the caller AFTER the outer tx returns — see (e).

## (d) Atomicity contract for immediate-drop resolver failure + justification

**Choice: PROPAGATE the resolver error so the outer `$transaction` rolls back the whole event** (entitlement flip, `PurchaseFanout` row, drop seeds, the dedup row insert). Stripe retries the same event id; on the next attempt the dedup row + per-row uniques make the retry safe.

**Why not the alternative** (commit money+drops, leave the failed immediate drop as `pending` for PR-10's cron to retry):

- Decision #8 locks immediate cadence as "delivered inline at checkout". If we silently committed money + entitlement and left the immediate drop in `pending`, the buyer would see their purchase succeed in the UI but the promised content would not arrive until PR-10's cron fires — and PR-10 does NOT exist yet on this branch (it's the next PR). Even after PR-10 lands, the buyer just paid for content they were told they'd get AT checkout, so a "next minute" delivery violates the product contract.
- Rolling back gives Stripe a normal retry path. The buyer's checkout return UI briefly shows "still processing" (a state the UI already handles) rather than "succeeded but empty". The DB stays consistent: no entitlement without drops, no drops without entitlement.
- PR-7's at-least-once contract describes a *crash between successful materialisation and ref-persist* — the per-drop `@unique` (`drip_drop_id`, `WorkoutBuilderIdempotencyKey`, `ClientAssetGrant @@unique`) covers the loser. That contract is preserved here: a crash after the resolver's write commits but before our `update({materialised_ref})` runs would still be safe on retry, because the per-drop `@unique` catches the second resolver attempt and returns the same `materialised_ref`.
- A resolver-internal failure that NEVER materialised the deliverable is a different beast — silently leaving it pending is the failure mode we explicitly reject.

**Boundary nuance** (relevant for PR-10 to know): future-dated drops + `on_completion`/`on_milestone` drops are seeded BUT NOT materialised in PR-9. They are PR-10's job. If the seed half of fan-out succeeds and the immediate-materialise half fails, the outer tx rolls back everything — Stripe retries, the next attempt re-seeds (no-op via `skipDuplicates`) and re-materialises. There is no path where future drops persist without their immediate siblings.

## (e) Alert side-effect boundary (decision #9)

Push + in-app drop alerts are a SIDE EFFECT. A failed push provider must NEVER roll back entitlement. PR-9 enforces this structurally:

- During fan-out (inside the tx), each materialised drop is recorded as an `AlertDescriptor` in an in-memory bucket on the `PurchaseFanoutService` instance, keyed by `purchase_id`. The bucket is NOT touched by the resolver; it lives outside the DB tx semantically.
- After the outer `$transaction` commits, `BillingService.handleEvent` (in-app paths) and `GuestCheckoutService.convertGuestToUser` (guest path) call `flushDripAlerts(purchaseId)` → `PurchaseFanoutService.flushAlerts(purchaseId)`. Each alert is dispatched via an optional `DripAlertDispatchHook` (PR-13 will wire the real push + in-app emit behind this seam). The hook is wrapped in a try/catch so a hostile push provider only logs a warning — it can never bubble up to a non-2xx webhook response.
- If the outer tx ROLLS BACK, the caller invokes `discardPendingDripAlerts(purchaseId)` → `PurchaseFanoutService.discardPendingAlerts(purchaseId)` so the inevitable Stripe retry does not double-alert (the retry's fan-out will produce its own fresh bucket).
- Feature-detection on the `flushDripAlerts` / `discardPendingDripAlerts` methods is in `BillingService` so legacy test wiring that stubs `CheckoutWebhookHandlerService` with only the `handle` method still works.

Verified by tests:

- `purchase-fanout-real-body.spec.ts` "alert side-effect boundary": a hostile hook that throws on `enqueue` does not bubble; `flushAlerts` returns normally; the alert *was* recorded in the bucket.
- `billing-drip-alert-flush.spec.ts` "flushDripAlerts hook errors are SWALLOWED": even though the hook throws, `handleEvent` returns `{processed:true}`.
- `billing-drip-alert-flush.spec.ts` "on a tx rollback, discardPendingDripAlerts is called and flushDripAlerts is NOT".
- `billing-drip-alert-flush.spec.ts` "flushDripAlerts is called AFTER the tx callback resolves (post-commit ordering)": order is `handle → tx-commit → flush`.

## (f) Idempotency / replay safety

Full chain across a webhook replay:

| Level | Mechanism |
|---|---|
| Webhook | `StripeProcessedEvent.stripe_event_id @unique` (BillingService — unchanged). |
| Fan-out row | `PurchaseFanout.purchase_id @unique` + `upsert({update:{}})` (PR-4 — unchanged). |
| Drop seed | `ScheduledDrop @@unique(client_purchase_id, content_id)` + `createMany({skipDuplicates:true})`. |
| Immediate materialise | Re-read after `createMany`; filter `materialised_ref IS NULL && fire_at <= now`. Replay finds prior fire's ref already set → skips. |
| Resolver writes | PR-7 per-type uniques (`DailyMealPlanAssignment.drip_drop_id @unique`, `WorkoutBuilderIdempotencyKey`, `ClientAssetGrant @@unique([client_id, media_asset_id])`) — exactly-once even on a true TOCTOU race; `auto_message` is at-least-once and gated by our `materialised_ref IS NULL` filter. |

Verified by tests:

- `purchase-fanout-real-body.spec.ts` "replaying the same event leaves the SAME number of drops, immediate drop is materialised exactly once": two consecutive `onPurchaseEntitled` calls produce `_drops.length === 2`, `registry.getCalls().length === 1`, `_fanouts.length === 1`.
- `purchase-fanout-tx-plumbing.spec.ts` "checkout.session.completed" / "payment_intent.succeeded": drop seed + materialise inside the tx.
- `purchase-fanout-hooks.spec.ts` (existing PR-4 test, still passing): webhook replay does not create a second fanout row + does not throw.

## (g) Test results

### Commands

- `node_modules/.bin/tsc --noEmit -p tsconfig.json` — **clean (0 errors)**.
- `npm run build` (`nest build`) — **clean**.
- `npm run lint` — **0 errors**, 17 pre-existing warnings unchanged from `main` (`landing-pages.service.ts`, `lists.dto.ts`, `macros.service.ts`, `meal-plans.dto.ts`, `nudge-detector.service.ts`, `nudge-engine.service.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`).
- `node_modules/.bin/jest` — **285 suites pass; 3423/3423 active tests pass** (up from 3402 on `main` — +21 new), 20 skipped + 5 todo unchanged, 6 snapshots pass.

### New tests by file

- `test/purchase-fanout-real-body.spec.ts` — **10 tests**.
  - Mixed-cadence seed: 6 drops, correct per-cadence `fire_at`; immediate + past `fixed_calendar` materialised inline; `on_completion` / `on_milestone` seeded `fire_at NULL`; soft-removed content excluded; registry called with the ambient tx, drop id, snapshot title/caption.
  - Snapshot semantics: post-fan-out mutation of the source content row does NOT reach the seeded drop.
  - Idempotency: replay leaves drop count + materialise count unchanged.
  - Atomicity (resolver throws): error propagates; fanout state stays `pending`.
  - Atomicity (one of two resolvers throws): no `succeeded` fanout state.
  - Alerts: hostile hook never bubbles; `flushAlerts` is the only path that dispatches; `discardPendingAlerts` drops the bucket.
  - Edge: empty package; unknown cadence kind seeds with `fire_at NULL`; missing registry throws.
- `test/purchase-fanout-tx-plumbing.spec.ts` — **6 tests**. The `handle(event, tx)` plumbing for both in-app webhook paths; legacy no-tx path still records the fanout row; resolver failure propagates through the handler; `flushDripAlerts` + `discardPendingDripAlerts` round-trip.
- `test/billing-drip-alert-flush.spec.ts` — **5 tests**. `BillingService.handleEvent` passes the outer tx to `handle(event, tx)`; flush happens AFTER the tx callback resolves; flush errors are swallowed; rollback path discards; legacy webhook handler without the new methods is feature-detected.

### Existing tests

All 3402 prior tests still pass — including `test/purchase-fanout-hooks.spec.ts` (PR-4), `test/checkout-webhook-handler.spec.ts`, `test/billing-checkout-routing.spec.ts`, `test/checkout-webhook-fee-split.spec.ts`, `test/package-contents.service.spec.ts` (PR-8), and the full assignable-asset-resolver suite (PR-7).

## Scope guardrails honoured

- Backend only.
- No cron (PR-10).
- No trigger glue (PR-11 — `on_completion`/`on_milestone` are seeded with `fire_at NULL`).
- No media upload pipeline (PR-12).
- No mobile changes.
- No refund/cancel surface (PR-16).
- No push-to-existing buyers (PR-17 — snapshot-at-purchase semantic is enforced; later content edits do NOT reach existing drops, as verified by the snapshot-semantics test).
- ONE additive schema migration (R1 audit-fix `DripResolverMarker` — required for the P1-2 fix; new nullable table, no DROP/RENAME/type-change on any existing column).
- No regression to PR-4's three wired hook points; the no-tx legacy path still works for hand-constructed unit tests.

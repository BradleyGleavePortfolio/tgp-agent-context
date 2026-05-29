# AUDIT — PR-9 real PurchaseFanout body + outer-tx plumbing (PR #319)

VERDICT: NOT CLEAN
Typecheck: pass (`npx tsc --noEmit -p tsconfig.json` — clean, 0 errors)
Lint: pass (`npm run lint` — 0 errors, 17 pre-existing warnings unchanged)
Build: pass (`npm run build` / `nest build` — clean)
Tests: pass (`npx jest` — 285 suites, 3423/3423 active tests pass, +21 new; matches builder's claim)

Branch fetched from `pr9/real-fanout-body`, one commit `e111a09c` off `main`. Author: `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By/Generated trailers.

## P0 findings
None.

## P1 findings

### P1-1 — Outer-tx rollback + Stripe retry double-fires `workout_*` and `auto_message` immediate drops (atomicity-contract leak)

**Files:** `src/packages/asset-resolvers/workout.resolver.ts:55-94`, `src/packages/asset-resolvers/auto-message.resolver.ts:63-90`, `src/packages/purchase-fanout.service.ts:247-286`, the documented atomicity contract at `purchase-fanout.service.ts:43-63`.

**Trigger:** the brief's documented happy path on resolver failure: an immediate-drop resolver throws → outer `$transaction` rolls back the entitlement flip + `PurchaseFanout` row + ALL `ScheduledDrop` seeds (their UUIDs are gone) → Stripe redelivers the event → fan-out re-seeds → drops get **fresh UUIDs**.

**Why it breaks:**
- `MediaAssetResolver` (`pdf`/`video`) and `MealPlanAssetResolver` write through `input.tx ?? this.prisma`, so their writes ride the outer tx and roll back cleanly — these are safe.
- `WorkoutAssetResolver` does NOT honour `input.tx` (delegates to `WorkoutBuilderService.assignPlan`, which opens its own internal `$transaction` against `this.prisma` — confirmed by `workout-builder.service.ts:144-225` and `assignPlan` body at `:511-541`). The PR-7 contract claims "exactly-once via the ledger" using idempotency key `drip:workout:{clientId}:{assetId}:{scheduledDropId}` (`workout.resolver.ts:100-107`). But `scheduledDropId` is the ScheduledDrop UUID, which is `@default(uuid())` (`prisma/schema.prisma` ScheduledDrop model) and is regenerated after a rollback. On retry the key is `drip:workout:{client}:{plan}:{NEW-uuid}` → `WorkoutBuilderIdempotencyKey` ledger has no row → `assignPlan` blindly inserts a SECOND `ClientWorkoutAssignment` (`workout-builder.service.ts:531-538` has no per-(client,plan) uniqueness). The first assignment from the rolled-back attempt persists in `this.prisma`.
- `AutoMessageAssetResolver` delegates to `messaging.sendAsCoach` with no caller-supplied idempotency key (`auto-message.resolver.ts:78-82` and the file-level comment at `:39-44`). The message commits in its own internal write outside the outer tx. After a rollback, the first message is already in the database. On retry the resolver fires again — **the buyer receives a second message**. The interface contract (`assignable-asset-resolver.interface.ts:84-104`) explicitly puts the burden of replay-gating on "PR-10's drip executor", but PR-9 IS the executor for immediate drops, and PR-9 has no such gate beyond `ScheduledDrop.materialised_ref IS NULL` — which is moot because the rolled-back drop's `materialised_ref` was never set AND the drop UUID is new on retry.

**Why the build report's reasoning is wrong:** the builder cites "PR-7 per-type uniques (`WorkoutBuilderIdempotencyKey`, `DailyMealPlanAssignment.drip_drop_id @unique`, `ClientAssetGrant @@unique`) make the retry safe" (`purchase-fanout.service.ts:38-41` and PR9_BUILD_REPORT §(f)). Only `ClientAssetGrant @@unique([client_id, media_asset_id])` is naturally stable across rollback-retry — the other two embed `scheduledDropId` and lose their stability when the outer tx regenerates the UUID. The mealplan one is moot for our path because mealplan writes ride the outer tx anyway and are rolled back with it.

**Direct contradiction of the brief.** PR9_BRIEF.md "Idempotency end-to-end: replay the same Stripe event id twice — assert no duplicate ScheduledDrops, no double materialisation". The "no double materialisation" property holds for media + meal_plan, breaks for workout + auto_message on the rollback path. 50-Failures gate #28 (race conditions) + #44 (transactions: side-effects commit-or-rollback together) are violated for these two resolver types.

**Why this is P1 not P0:** money is consistent (entitlement either fully lands or fully rolls back together with the dedup row; Stripe charge is unaffected). Content arrives twice instead of zero times, which is content noise — embarrassing but not lost-money / lost-content. The buyer sees two welcome auto-messages and possibly a duplicate workout assignment.

**Test gap that masked it:** `purchase-fanout-real-body.spec.ts:343-388` ("atomicity — resolver failure on an immediate drop") uses an in-memory tx stub that has no rollback semantics — the test asserts only that the service throws and that `fanout.state === 'pending'`. It never replays the event under fresh drop UUIDs and never asserts the workout/auto_message side-effect count. The "idempotency — replaying the same event" test at `:316-341` re-uses the SAME tx stub with stable drop UUIDs (rows aren't actually deleted between calls), so it never exercises the rollback-and-retry case where UUIDs change. The build-report's "Verified by tests" claim for replay safety is misleading.

**Concrete fix recommendations** (any one is sufficient):
1. **Preferred:** derive a stable, content-keyed idempotency surface for the inline-checkout path that does NOT depend on the regenerated drop UUID — e.g. key = `drip:workout:{purchaseId}:{contentId}` (purchase id is stable across retries; content id is the package-content authoring id, also stable). Plumb that into `workout.resolver.ts`'s `buildIdempotencyKey` and into a new `auto_message` dedup column (`CoachMessage.drip_purchase_content_unique @unique`). This makes both resolvers truly exactly-once on the inline-checkout path regardless of drop UUID churn.
2. **Alternative:** restrict the inline-checkout body to resolver types whose writes ride the passed `tx` (currently meal_plan + media). For `workout_*` and `auto_message` immediate drops, seed the drop with `fire_at = now` but DO NOT materialise inline at checkout — let PR-10's cron pick them up on its first tick. Document this as a deliberate boundary in the PR. This trades a few seconds of latency for true atomicity.
3. **Weakest:** explicitly skip the rollback-and-retry double-fire concern as a known limitation, narrow the brief's "no double materialisation" requirement to the happy path, and add operator-visible metrics on workout/auto_message duplicates so support can reconcile manually. (Not recommended — punts the problem.)

### P1-2 — Workout / auto_message resolver-internal commit-then-fail leaks an orphan even on the happy path

**Files:** same as P1-1, plus `purchase-fanout.service.ts:255-294`.

**Independent trigger from P1-1:** even without a resolver throwing, ANY post-resolver failure inside the outer tx (the `tx.scheduledDrop.update({materialised_ref})` at `:266-275`, the `tx.purchaseFanout.update({state:succeeded})` at `:290-293`, or anything BillingService does in the same tx after fan-out returns including the `stripeProcessedEvent.updateMany` at `billing.service.ts:416-422`) rolls back the outer tx. WorkoutBuilderService's internal-tx commit and `messaging.sendAsCoach`'s commit have already landed. On Stripe retry: new drop UUIDs → workout key miss → SECOND ClientWorkoutAssignment; auto_message → SECOND CoachMessage.

**Why this matters separately:** P1-1's trigger (resolver throws) might be argued as rare. This one fires on any transient DB hiccup during the post-resolver writes, which is the exact failure mode the outer tx was put in place to protect against. The probability is non-trivial under load.

**Same fix options as P1-1.**

## P2 findings

### P2-1 — Splits run outside the outer tx with a documented "safe via composite-unique upserts + sweeper" boundary, but the entitlement window is briefly inconsistent on rollback

**Files:** `src/checkout/checkout-webhook-handler.service.ts:209-217` (applyCheckoutCompleted), `:449-457` (applyPaymentIntentSucceeded), `src/checkout/purchase-split-handler.service.ts:63-130`.

The builder deliberately keeps `this.splits.onChargeSucceeded({purchase: updated})` against `this.prisma` (not the outer tx) to avoid the A276-P1-3 in-tx-Stripe-HTTP anti-pattern. The reasoning is solid: TransferOrchestratorService makes synchronous Stripe HTTP calls and holding a Postgres connection through that is the documented saturation pattern. Idempotency claim — composite-unique upserts + Stripe idempotency-key on Transfer create + sweeper — is plausible against the schema.

The remaining gap is visibility, not correctness: if the outer tx rolls back, the entitlement flip reverts to `false` while split ledger rows pointing at the `pending` purchase persist. Until Stripe redelivers, ops see ledger entries for a purchase whose `entitlement_active` is false. The brief expects this to be documented; the PR description mentions it. Not blocking on its own, but flag it alongside P1-1 because BOTH workout/auto_message side-effects AND splits leak across a rollback, increasing operator-confusion blast radius.

**Fix recommendation:** add a brief operator runbook note in the PR description (or a comment block on `applyCheckoutCompleted`) listing the three side-effects that can outlive a rolled-back outer tx (splits ledger, workout assignment, auto_message) so an oncall investigator on a rollback-and-retry storm knows where to look.

### P2-2 — Rollback-replay test never actually exercises rollback semantics

**Files:** `test/purchase-fanout-real-body.spec.ts:316-388`.

The "idempotency — replaying the same event" test calls `onPurchaseEntitled` twice against the SAME in-memory tx stub. The stub never resets and never "rolls back" — the second call sees the same `_drops` array with the same UUIDs as the first. This is the happy-path replay (which is fine and works because of the `materialised_ref IS NULL` filter), but it is NOT the rollback-and-retry replay that the brief asks for. The atomicity test similarly does not simulate UUID regeneration on retry.

Adding a test that (a) runs `onPurchaseEntitled` to completion on a fresh tx, (b) "rolls back" by discarding the tx state, (c) runs again with NEW drop UUIDs, and (d) asserts the workout idempotency-key collision behavior + auto_message dedup behavior would have caught P1-1/P1-2 immediately. Today the suite gives false confidence on the "no double materialisation" property.

**Fix recommendation:** add an integration-style spec that runs the resolver chain against the real Prisma test database (or a stricter in-memory model that regenerates UUIDs on `createMany`) under simulated outer-tx rollback. Even a single test that proves the workout+auto_message paths re-fire under rollback would document the contract honestly.

## P3 (non-blocking)

### P3-1 — `coachAiPacks.handleStripeEvent` runs inside the outer tx BEFORE `checkoutWebhooks.handle`; on a fan-out rollback the credit-pack apply also rolls back

`billing.service.ts:218-243`. This is intentional (the credit-pack handler was explicitly threaded into the outer tx in the A276 audit) and the behaviour is correct — if any in-tx step fails, the credit pack and the entitlement both unwind together. Documenting it here because it interacts with P1: a credit-pack purchase that fails fan-out (extremely unlikely since credit packs typically have no `CoachPackageContent` rows) would also see the credit-pack apply rolled back and retried. Today this is the safer behaviour, so leaving it alone is correct; just noting the coupling.

### P3-2 — `tx ?? this.prisma` casts in `applyCheckoutCompleted` / `applyPaymentIntentSucceeded` lose strict typing

`checkout-webhook-handler.service.ts:162`, `:429`, plus the `as unknown as WebhookTx` at `:250` and `:482`. Functionally fine but the casts paper over the legacy/no-tx path. A small union helper type would clean it up; cosmetic only.

### P3-3 — `Empty package` fanout state stays `pending` rather than `succeeded`

`purchase-fanout.service.ts:188-193`. Documented by the test at `purchase-fanout-real-body.spec.ts:455-471` ("That's fine — no immediate work needed"). Future PR-10 cron should treat a `pending` fanout with zero drops as a no-op. Worth a one-liner comment in the fan-out body so the next reader doesn't think it's a bug.

## Verification of PR claims

| Claim (from PR9_BUILD_REPORT) | Verified |
|---|---|
| `checkoutWebhooks.handle(event, tx)` plumbs the outer tx through both in-app paths | TRUE — `billing.service.ts:220`, `checkout-webhook-handler.service.ts:78-82, 144-147, 229-239, 419-422, 462-472` |
| `db = tx ?? this.prisma` for the read+update in both paths | TRUE — `checkout-webhook-handler.service.ts:162, 429` |
| Guest path passes `purchaseTime: new Date()` and hoists `entitledPurchaseId` for post-tx flush | TRUE — `guest-checkout.service.ts:1246, 1357-1365, 1380-1402` |
| Splits intentionally OUTSIDE the outer tx; FK to a pre-existing `pending` purchase row | TRUE — `checkout-webhook-handler.service.ts:209-217` + `purchase-split-handler.service.ts` does not accept a tx |
| Empty package short-circuits with no drops seeded | TRUE — `purchase-fanout.service.ts:188-193` |
| `createMany({skipDuplicates:true})` for the seed | TRUE — `purchase-fanout.service.ts:222-225` |
| Immediate materialise uses `materialised_ref IS NULL` + status filter | TRUE — `purchase-fanout.service.ts:233-241` |
| Per-cadence `fire_at` matches the documented table | TRUE — `purchase-fanout.service.ts:346-377` matches every row; past `fixed_calendar` correctly mapped to `now`; unknown kind returns `null` (no blind firing) |
| `purchaseFanout.update({succeeded})` happens INSIDE the tx | TRUE — `purchase-fanout.service.ts:290-293` |
| Resolver failure re-throws so outer tx rolls back | TRUE — no try/catch wraps `resolvers.materialise(...)` at `:255-264` |
| Alerts stage in-tx, flush AFTER outer tx commits, discard on rollback | TRUE — bucket at `:300-302`, flush at `flushAlerts` `:312-333`, discard at `:340-342`; caller wiring at `billing.service.ts:222-224, 442-453, 462-474` and `guest-checkout.service.ts:1357-1402` |
| Alert hook errors swallowed | TRUE — try/catch at `purchase-fanout.service.ts:317-331` |
| Replay does not double-seed or double-materialise (per the new test) | TRUE for the happy-path replay (same drop UUIDs). **FALSE for the rollback-then-retry path** where drop UUIDs regenerate — see P1-1. |
| "PR-7 per-type uniques make the retry safe" (`purchase-fanout.service.ts:38-41`) | FALSE for workout (`WorkoutBuilderIdempotencyKey` key embeds `scheduledDropId`) and auto_message (no per-type unique at all). TRUE for meal_plan (writes ride the outer tx and roll back with it) and media (composite unique on `client_id + media_asset_id` is stable across UUID regeneration). |
| 3423/3423 active tests pass | TRUE — reproduced locally |
| No schema migrations | TRUE — `git diff main..HEAD --name-only` shows zero `prisma/` changes |
| No cron / trigger / media-upload / mobile / refund-cancel / push-to-existing | TRUE — scope held |

VERDICT: NOT CLEAN

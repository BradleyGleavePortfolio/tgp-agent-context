# AUDIT (R2) — PR-9 real PurchaseFanout body + R1 audit-fix (PR #319)

VERDICT: CLEAN
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` — clean, 0 errors)
Lint: pass (`npm run lint` — 0 errors, 17 pre-existing warnings unchanged)
Build: pass (`npm run build` / `nest build` — clean)
Tests: pass (`node_modules/.bin/jest` — 286 suites, 3428/3428 active tests pass, 20 skipped, 5 todo, 6 snapshots; matches the build-report's `+5 over R0 (3423→3428)` claim)

Branch `pr9/real-fanout-body` checked out at HEAD. Two commits visible on top of `main`:
- `e111a09c` — initial PR-9 (the body audited in R1)
- `c6c6dc39` — R1 audit-fix (the diff under audit here)
- Author identity: `Dynasia G <dynasia@trygrowthproject.com>`, no `Co-Authored-By` / generated trailers on either commit. Brief's commit-rule satisfied.

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking, informational)

### P3-1 — Stuck `WorkoutBuilderIdempotencyKey` row after process crash mid-`assignPlan` is now a sticky failure mode on retry

**Files:** `src/workout-builder/workout-builder.service.ts:144-225`, `src/packages/asset-resolvers/workout.resolver.ts:78-90`.

The R1 fix re-keys the WorkoutBuilderIdempotencyKey ledger on the stable `drip:workout:p={purchaseId}:c={contentId}` value. This correctly collapses the rollback+retry duplicate-assignment case (which was P1-1).

Side-effect: `withIdempotency` (workout-builder.service.ts:144-225) writes a `status='in_progress'` row BEFORE running the protected op, deletes that row on op() failure, and updates it to `status='completed'` AFTER success. A process crash (or any non-throwing failure on the connection) in the window between op() returning and the `update({status:'completed'})` running leaves an `in_progress` orphan row. Pre-fix this was harmless because the next retry minted a fresh `scheduledDropId` and therefore a different key. Post-fix the key is stable, so every Stripe retry of the same event re-hits the same orphan row, sees `status='in_progress'`, throws `ConflictException` (workout-builder.service.ts:188-192), the outer tx rolls back, Stripe retries again, and the loop continues until Stripe's webhook-retry budget expires (~3 days) or an operator deletes the orphan row by hand.

Why P3 not P2:
- Trigger is a process crash / connection drop in a single-digit-ms window between two sequential awaits on the same connection — vanishingly rare.
- The fix already documents the WorkoutBuilderIdempotencyKey table as one of the three rollback-side-effect tables to check (billing.service.ts:439-464), so an oncall investigator hitting a sustained rollback storm has the runbook hint.
- The net risk profile is strictly better than pre-fix: the routine rollback+retry case (which actually does happen) used to double-fire workout assignments → buyer gets two workouts (content noise, support overhead). Post-fix the routine case is exactly-once; only the rare crash-mid-update case can stick.
- Workout-builder's `withIdempotency` mechanism predates PR-9 and is used by other coach-initiated routes too; refactoring the in_progress lifecycle (e.g. TTL sweeper, "stuck >5min → release") is out of scope for PR-9.

If a follow-up wants to harden this: add a sweeper that releases `in_progress` rows older than N minutes, or change `withIdempotency` to upsert (claim if missing, treat any same-key state as "go check the response_json") rather than throwing 409 on stuck rows.

### P3-2 — `auto_message` reclaim path is at-most-once on the routine rollback case, at-least-once in a narrow process-crash window

**Files:** `src/packages/asset-resolvers/auto-message.resolver.ts:161-202`, file-level comment at `:56-67`.

The resolver claims the `DripResolverMarker` BEFORE calling `sendAsCoach`, then stamps `materialised_ref` AFTER. The resolver's own file-level comment frankly documents the residual narrow window: "process kill / Stripe HTTP timeout between the marker insert and the messaging service's commit" leaves the marker un-stamped while the message *may* have committed (the messaging service's own internal commit happened, but the resolver did not get to observe the result). I traced both interleavings:

- Common case: marker.create succeeds → `sendAsCoach` throws (e.g. network blip before the message row's INSERT commits) → resolver re-throws → outer tx rolls back. Marker exists with `materialised_ref=null`. Retry sees `reclaim`, calls `sendAsCoach` again, sends the message, stamps the marker. Net: exactly-one message. ✓
- Routine rollback case: marker.create succeeds → `sendAsCoach` commits message → resolver stamps marker → resolver returns → fanout.update(drop) → some later in-tx step throws → outer tx rolls back. Marker exists with `materialised_ref` set. Retry sees `cached`, returns the cached id WITHOUT firing `sendAsCoach`. Net: exactly-one message. ✓
- Narrow crash window: marker.create succeeds → `sendAsCoach` commits message → process crashes / Prisma client disconnects BEFORE the `dripResolverMarker.update({materialised_ref})` runs → outer tx rolls back. Marker exists with `materialised_ref=null`. Retry sees `reclaim`, calls `sendAsCoach` AGAIN, sends a SECOND message, stamps the marker. Net: two messages. ⚠️

The resolver's own comment names this exact failure mode and accepts it as the trade-off ("at-least-once for the send in that narrow window … but it is at-most-once across the routine rollback-and-retry path"). The window is microseconds between two sequential awaits on `this.prisma`. The pre-fix behavior was second-message on EVERY rollback+retry. Post-fix it is second-message only on a crash inside the sub-millisecond gap between `sendAsCoach`'s commit and the marker update. Net improvement is overwhelming and the documentation is honest.

A future hardening (out of scope for PR-9) could pull `messaging.sendAsCoach` and the marker update into one transaction-bound write, or have `sendAsCoach` accept and use the marker as its own dedup row. Today's compromise is reasonable.

### P3-3 — `dripAlertPurchaseId` observability log misses rollbacks that happen BEFORE `checkoutWebhooks.handle` returns

**Files:** `src/billing/billing.service.ts:189-225, 439-479`.

The new operator-runbook log line at `billing.service.ts:460-464` only fires when `dripAlertPurchaseId` is non-null, which is only set when `checkoutWebhooks.handle(event, tx)` returned successfully with `claimed && purchase_id`. If the rollback happens DURING `checkoutWebhooks.handle` (e.g. the resolver throws inside `applyCheckoutCompleted` → `onPurchaseEntitled`), the runbook hint is missing — the side-effect rows are still potentially present on `this.prisma` (workout-builder ledger, drip-resolver marker, splits ledger) but the log line at line 460 is skipped.

Why P3: the underlying behavior is still correct (Stripe retries the event id, idempotency makes the retry safe, eventually commits). The audit asked for the runbook hint and the hint exists for the most common scenario (resolver succeeds, post-resolver in-tx step fails). The "resolver-throws-mid-handle" case is the case the audit also documents — and Stripe-retry-driven self-healing is exactly what's expected for that path. Mostly an observability nit.

A two-line fix would be to set `dripAlertPurchaseId` opportunistically inside `applyCheckoutCompleted` / `applyPaymentIntentSucceeded` as soon as the purchase row is fetched, rather than after `handle()` returns. Not blocking.

## Verification of PR claims (the things the R1 fix said it did)

| Claim | Verified |
|---|---|
| Two commits on branch: `e111a09c` (initial) + `c6c6dc39` (R1 audit-fix) | TRUE — `git log --oneline -10` |
| Commit identity `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By / generated trailers | TRUE — `git log --format=fuller` shows clean identity on both commits |
| **P1-1 fix**: workout key is `drip:workout:p={purchaseId}:c={contentId}` on the inline-checkout path, fallback to `drip:workout:{clientId}:{assetId}:{scheduledDropId}` for PR-10 cron | TRUE — `src/packages/asset-resolvers/workout.resolver.ts:121-133` (`buildIdempotencyKey`) gates on `clientPurchaseId && contentId`; both unit tests at `test/assignable-asset-resolver-workout.spec.ts:124-145, 147-163` cover both branches |
| **P1-1 fix**: the WorkoutBuilderIdempotencyKey ledger writes on `this.prisma` (outside the outer tx) so attempt-1's claim survives a rollback | TRUE — `src/workout-builder/workout-builder.service.ts:155-162, 205-207, 215-222` all use `this.prisma.workoutBuilderIdempotencyKey.{create,delete,update}`. The outer tx passed by the fanout caller is NOT threaded into `withIdempotency`; the ledger row commits on the WorkoutBuilderService's own connection and outlives a rollback of the fanout's outer tx. |
| **P1-1 fix**: attempt-1 and attempt-2 produce the IDENTICAL key when the drop UUID regenerates | TRUE — the key is a pure function of `(clientPurchaseId, contentId)`; `clientPurchaseId` is the existing pre-flip `ClientPurchase.id` (webhook only flips `entitlement_active`, never the id), `contentId` is `CoachPackageContent.id` (immutable across buyer-side webhook activity). Proven by `test/purchase-fanout-rollback-retry.spec.ts:286-370` which explicitly regenerates drop UUIDs between attempts (line 357: `expect(attempt2DropIds).not.toEqual(attempt1DropIds)`) and asserts exactly one `ClientWorkoutAssignment` across both (`wb._cache.size === 1`, line 363). The test would FAIL if the key reverted to the scheduledDropId form — not self-fulfilling. |
| **P1-1 fix**: claim lifecycle on op() failure releases the in_progress row so a retry can proceed | TRUE — `workout-builder.service.ts:201-211`; `withIdempotency` deletes the in_progress row in the catch block, so a resolver-failed attempt's row does not block the retry. See P3-1 for the residual stuck-row case (op success but pre-update process crash). |
| **P1-2 fix**: new `DripResolverMarker(purpose, purchase_id, content_id)` table with composite @@unique, additive nullable migration | TRUE — `prisma/migrations/20261204000000_pr9_drip_resolver_marker/migration.sql:33-50`; the migration is a single CREATE TABLE + CREATE INDEX, no DROP / RENAME / ALTER on any existing column. `prisma/schema.prisma:4739-4750` matches. `materialised_ref` is `String?` (nullable) as required for the claim-then-stamp lifecycle. |
| **P1-2 fix**: marker is claimed on `this.prisma` BEFORE `sendAsCoach`, stamped on `this.prisma` AFTER | TRUE — `src/packages/asset-resolvers/auto-message.resolver.ts:113-122` (pre-send claim), `:124-128` (send), `:136-156` (post-send stamp); all three persist via `this.prisma.dripResolverMarker.*`, never the caller's tx. The marker survives an outer-tx rollback. |
| **P1-2 fix**: on retry, marker exists + `materialised_ref` set → return cached id (no second send) | TRUE — `auto-message.resolver.ts:114-119` (early-return on `cached` claim). Test coverage: `test/purchase-fanout-rollback-retry.spec.ts:457-527` (the "cached path" test) explicitly asserts `sendCalls` length stays at 1 across two attempts with regenerated drop UUIDs. |
| **P1-2 fix**: on retry, marker exists + `materialised_ref` null → reclaim path completes the send and stamps | TRUE — `auto-message.resolver.ts:192-198` returns `reclaim`, and the main flow at `:124-156` then runs `sendAsCoach` + stamps the marker. Test coverage: `test/purchase-fanout-rollback-retry.spec.ts:372-455` (the "reclaim path" test) drives the first attempt to throw inside `sendAsCoach`, asserts marker exists with `materialised_ref=null`, then retries and asserts exactly one final CoachMessage. |
| **P1-2 fix**: the narrow window where a process crash between `sendAsCoach.commit` and `marker.update` leaves an unstamped marker + a sent message → retry sends a second message | TRUE and DOCUMENTED. Logged as P3-2 above. The resolver's own file-level comment at `auto-message.resolver.ts:56-62` calls this out and accepts the trade-off; the alternative is to push `sendAsCoach` into a tx with the marker update, which is an out-of-scope MessagingService signature change. |
| meal_plan + media still retry-safe (unchanged) | TRUE — `src/packages/asset-resolvers/meal-plan.resolver.ts:47-49, 69` honors `input.tx ?? this.prisma` AND has `DailyMealPlanAssignment.drip_drop_id @unique` (writes ride the outer tx and roll back; retry starts clean). `src/packages/asset-resolvers/media-asset.resolver.ts:29, 56` honors `input.tx ?? this.prisma` AND has `ClientAssetGrant @@unique(client_id, media_asset_id)` (composite is stable across drop-UUID churn). Neither resolver changed in R1 except for accepting the new `clientPurchaseId/contentId` fields on the interface, which they ignore. |
| **P2-1 splits-rollback observability**: BillingService.handleEvent catch logs the three side-effect tables to reconcile | TRUE — `src/billing/billing.service.ts:439-464`. The log line names `SplitLedgerEntry`, `WorkoutBuilderIdempotencyKey (key=drip:workout:p={purchase}:c=*)`, `DripResolverMarker(purpose='auto_message', purchase_id={purchase})`, all three reconcilation targets the audit asked for. See P3-3 for the gap (rollback before `handle()` returns skips the log). |
| **P2-2 strengthened tests**: rollback+retry test regenerates drop UUIDs between attempts | TRUE — `test/purchase-fanout-rollback-retry.spec.ts:37-40` defines `freshDropUuid()`, `:84-109` mints a fresh UUID per row inside `createMany`, `:357` asserts `attempt2DropIds !== attempt1DropIds`. |
| **P2-2 strengthened tests**: asserts exactly-one `ClientWorkoutAssignment` and exactly-one `CoachMessage` across rollback+retry | TRUE — workout case at `test/purchase-fanout-rollback-retry.spec.ts:362-366`: `wb.assignPlan` called twice (`toHaveBeenCalledTimes(2)`) but `wb._cache.size === 1`; cached key shape `drip:workout:p=${PURCHASE_ID}:c=c-workout` asserted explicitly. Auto-message cases at `:368-369` (sendAsCoach 1×, sendLog 1 entry), `:519` (`sendAsCoach` 1×). |
| **P2-2 strengthened tests**: not self-fulfilling — would FAIL if the key reverted to scheduledDropId | TRUE — the test stubs build the workout idempotency cache keyed on whatever string the resolver supplies as its 4th positional arg. Reverting `workout.resolver.ts:128-133` to the `scheduledDropId` form would cause attempt-1 and attempt-2 to write to DIFFERENT cache keys (since the stub mints fresh UUIDs each attempt), so `wb._cache.size` would be 2 not 1 and the test would fail. Similarly for the auto-message marker tests — reverting the marker write to the outer-tx-bound store (instead of `this.prisma`) would make the marker disappear with the rollback, so the second attempt would re-create and re-send. |
| Three rollback+retry scenarios + two new unit tests are legitimate | TRUE — the three scenarios cover (a) workout + auto_message cached, (b) auto_message reclaim, (c) auto_message cached without workout. Unit tests cover the stable-key and fallback-key branches independently of the integration scenario. |
| No regression to outer-tx plumbing across all 3 entitlement paths | TRUE — `checkout-webhook-handler.service.ts:229-239, 462-472` (hosted + payment-intent paths), `guest-checkout.service.ts:1356-1365` (guest path), all unchanged from R0. All three pass `(updated/purchaseRow, ctx, tx)`. |
| No regression to snapshot semantics, per-cadence fire_at, on_completion/on_milestone seeded-not-fired, alert side-effect boundary, PR-4/7/8 | TRUE — `purchase-fanout.service.ts:212-242` (snapshot create), `:372-403` (fire_at computation including the documented past-fixed_calendar → now rule), `:394-397` (on_completion / on_milestone → fire_at=null), `:265-329` (alert bucket in-tx, flush/discard after tx) all unchanged from R0. Existing PR-4 + PR-7 + PR-8 specs in the suite still pass. |
| 3428/3428 active tests pass (+5 over R0's 3423) | TRUE — `jest` final tally: `286 suites passed`, `Tests: 20 skipped, 5 todo, 3428 passed, 3453 total`, `Snapshots: 6 passed`. R0's audit recorded 3423; +5 lines up with 3 rollback+retry integration tests + 2 new workout unit tests. |

## Net assessment

The R1 fix correctly closes both P1s from R0:

**P1-1 (workout double-fire on rollback+retry)** — the (purchaseId, contentId) re-key is the right fix. The WorkoutBuilderIdempotencyKey ledger genuinely commits on `this.prisma` (verified at workout-builder.service.ts:155, 205, 215), survives the outer-tx rollback, and a retry observing the same `(purchaseId, contentId)` key collapses onto the cached completed claim without re-running the inner assignment SQL. The new rollback+retry spec exercises exactly this path with regenerated UUIDs and the assertions are sharp enough to catch a regression. P3-1 (the stuck-in_progress case) is a strictly narrower failure mode than what was being fixed, has operator runbook hints, and is out of scope for this PR to fully eliminate.

**P1-2 (auto_message double-send on rollback+retry)** — the DripResolverMarker design is sound. The marker uses the only stable identifier pair available across a Stripe-retry boundary (purchase + content), commits outside the outer tx, supports both the cached and reclaim paths, and has a sensible documented narrow failure window (P3-2) which is strictly rarer than the failure being fixed. The migration is additive-only (verified at prisma/migrations/20261204000000_pr9_drip_resolver_marker/migration.sql) and the schema entry is a clean nullable composite-unique table.

**P2-1 observability** — the rollback log line names all three side-effect tables an oncall investigator needs to check. The gap noted in P3-3 (line only fires after `handle()` returns) is a minor observability nit, not a behavioral problem.

**P2-2 tests** — the new rollback+retry spec explicitly regenerates drop UUIDs between attempts and asserts exactly-one side-effect across both. The two new workout unit tests cover both keying modes. Neither test is self-fulfilling.

No regressions detected to outer-tx plumbing, snapshot semantics, fire_at, alert boundary, PR-4/7/8, or the existing suite. Build/typecheck/lint all clean.

VERDICT: CLEAN

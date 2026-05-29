# AUDIT — PR-7 AssignableAssetResolver registry + per-type resolvers (PR #316)
VERDICT: NOT CLEAN
Typecheck: pass (`npx nest build`, exit 0)
Lint: pass (`npx eslint src/packages/asset-resolvers/**/*.ts test/assignable-asset-resolver-*.spec.ts`, exit 0, zero warnings)
Tests: pass — 5 suites / 32 tests for the resolver specs (resolver-registry / -workout / -meal-plan / -media / -auto-message). `test/module-graph.spec.ts` also passes (2/2): no DI cycle reintroduced by `AssignableAssetResolversModule`.

Scope check: the PR is registry + 4 resolvers + unit tests only. No PurchaseFanout wiring, no cron, no endpoints, no mobile, no CoachMediaAsset upload pipeline — matches the brief's guardrails.

## P0 findings
None.

## P1 findings

### `meal-plan.resolver.ts:57-91` — meal_plan idempotency has a TOCTOU race; replay can produce duplicate `DailyMealPlanAssignment` rows
The resolver claims idempotency via an existence-probe → insert sequence:
```
existing = db.dailyMealPlanAssignment.findFirst({ where: { client_id, daily_meal_plan_id }, … })
if (existing) return existing.id
… mealPlans.assignPlan(coachId, planId, { client_id, starts_on })
```
This is **not atomic**. `DailyMealPlanAssignment` has no `@@unique` on `(client_id, daily_meal_plan_id)` (verified at `prisma/schema.prisma:4561-4581`), and `RealMealPlansService.assignPlan` (`real-meal-plans.service.ts:247`) plainly does `prisma.dailyMealPlanAssignment.create(...)` with no on-conflict handling. Two concurrent PR-10 retries of the same `ScheduledDrop` can both pass `findFirst → null` and then both `create`, producing two assignments for the same `(client, plan)`. The brief explicitly required "verify the idempotency-key / existence-probe approach is sound (no double-assignment on retry)" — it is not.

The PR header at `meal-plan.resolver.ts:23-31` acknowledges that `RealMealPlansService` has no per-call idempotency ledger and that the resolver relies on the probe instead. Documenting the gap does not close it.

Fix options for PR-7 scope:
1. Add a `@@unique([client_id, daily_meal_plan_id])` migration so the second writer fails on P2002 and the resolver can do the same `try-create / catch-P2002 / re-query` dance as `MediaAssetResolver`.
2. Or wrap the probe+insert inside `prisma.$transaction` with `SERIALIZABLE` isolation and let one of the racers retry at the tx layer.
3. Or push an idempotency-key ledger into `RealMealPlansService.assignPlan` mirroring `WorkoutBuilderService.withIdempotency`.

(Option 1 is the cheapest and most analogous to the workout-builder/media-asset patterns.)

## P2 findings

### `auto-message.resolver.ts:62-68` — sub-coach drip-fed messages are mis-attributed (sender is recorded as the head coach, not the acting sub-coach)
`MessagingService.sendAsCoach` already has native sub-coach handling: `assertClientOfCoach` (`messaging.service.ts:264-317`) falls back to a `SubCoachAssignment` lookup when the caller is a sub-coach and explicitly pins `coach_id: headCoachId` while `sender_id` stays the sub-coach (see the Phase 11 comment block and `messaging.service.ts:430-435`). It expects the **acting coach id** and resolves the head/sender split itself.

By passing `acting.tenantCoachId` (the head coach id) the resolver bypasses that mechanism: the fast path in `assertClientOfCoach` matches on `client.coach_id === headCoachId` and `sender_id` ends up as the head coach id. Result: every auto_message drop a sub-coach owns will appear in the client's inbox as sent by the head coach, with no record of which sub-coach authored it. This is inconsistent with how the coach app's existing `sendAsCoach` callers behave and will confuse any audit/analytics that buckets by `sender_id`.

The brief flagged this exact failure mode: "some may expect the acting sub-coach, others the head coach — confirm per service, don't assume uniform." The resolver currently uses a uniform "always head."

Fix: for `AutoMessageAssetResolver` only, pass `input.coachId` (the acting/sub-coach id) into `sendAsCoach` and let MessagingService do its native scope+attribution split. Keep the upfront `scope.resolve` call as defence-in-depth, but stop overriding the coachId on the downstream call.

(Workout + meal_plan delegates do NOT have the same shape — `WorkoutBuilderService.assignPlan` and `RealMealPlansService.assignPlan` both call `assertClientBelongsToCoach` / `assertClientOfCoach` against the raw `client.coach_id` column, which is the head coach id. Passing the sub-coach id there would 403. So `tenantCoachId` is correct there — but `assigned_by_coach_id` then records the head coach instead of the sub-coach who initiated the drop. Same attribution loss, different cause — P3, separately listed below, because the underlying services have no current path for sub-coach attribution at all.)

### `auto-message.resolver.ts:30-37` — at-least-once delivery for auto_message is documented but not gated
The header explicitly states a PR-10 retry of an auto_message drop will produce a second `CoachMessage` row, deferring suppression to "once the ScheduledDrop has `materialised_ref` set." Two issues:
1. This file is the resolver. Nothing in the resolver writes `materialised_ref` — that is the caller's job, which lands in PR-9/PR-10. Between now and then, any other call site invoking the registry directly (a Stream-3 ad-hoc trigger, an ops backfill) would silently duplicate messages.
2. The contract in `assignable-asset-resolver.interface.ts:77-83` says "MUST be idempotent." The auto_message implementation is not; the contract and the implementation disagree.

This is borderline P2 because the documented deferral is honest about the limitation. Recommend either (a) tighten the interface comment to "MUST be idempotent when the underlying delegate supports it, otherwise caller is responsible for suppression," or (b) add a probe (e.g. dedupe on `(client_id, sender_id, body, time-bucket)`) to make the resolver replay-safe in isolation.

## P3 (non-blocking)

- `media-asset.resolver.ts:48-50` — `canHandle` returns true for both `pdf` and `video`, but the resolver never validates that `CoachMediaAsset.kind` matches the requested `assetType`. A misconfigured package row could pair `asset_type=video` with a pdf media asset and the grant would still be minted. Low severity because `kind` is currently advisory and the upload pipeline (PR-12) will own this.
- `workout.resolver.ts:75-83`, `meal-plan.resolver.ts:77-84` — `assigned_by_coach_id` on the resulting assignment is the head coach id (because the resolver passes `tenantCoachId`), losing sub-coach audit attribution. Not the resolver's fault per se — the underlying services have no separate "acting coach" argument — but worth a follow-up so the drip-feed audit trail tells you which sub-coach actually fired the drop.
- `workout.resolver.ts:96-107` — idempotency key segment `no-drop` (when `scheduledDropId` is absent) collides for two genuinely-distinct ad-hoc materialise calls of the same `(client, plan)`. Fine for PR-9/PR-10 usage where dropId is always present, but worth a comment or a defensive `randomUUID()` fallback so a future caller without a drop id doesn't inadvertently dedupe.
- `assignable-asset-resolver.registry.ts:42-48` — accepting `AssignableAssetResolver | AssignableAssetResolver[] | null` in the constructor is ergonomic but means a single-resolver array with `null` entries gets silently filtered. A `Logger.warn` on filtered-null entries would catch a wiring slip during PR-9 integration.
- `auto-message.resolver.ts:54-61` — `displayCaption ?? displayTitle` falls through `?? ''` then `.trim()`. The `AutoMessageBodyMissingError` is correctly thrown on empty body, but no upper bound on body length is enforced here; rely on the downstream `assertSendablePayload` to cap it.

## Verification of PR claims

- "Delegates to `WorkoutBuilderService.assignPlan` (workout-builder.service.ts:511)" — **VERIFIED.** Method exists at line 511, signature `(coachId, planId, dto: CreateAssignmentDto, idempotencyKey?: string | null)`. Resolver passes `(tenantCoachId, assetId, { client_id, scheduled_for }, idempotencyKey)` — matches.
- "Delegates to `RealMealPlansService.assignPlan` (real-meal-plans.service.ts:247)" — **VERIFIED.** Method exists at line 247, signature `(coachId, planId, dto: AssignDailyPlanDto)`. Resolver passes `(tenantCoachId, assetId, { client_id, starts_on: YYYY-MM-DD })` — matches.
- "Delegates to `MessagingService.sendAsCoach` (messaging.service.ts:396)" — **VERIFIED at the method level**, **PARTIALLY FALSE in spirit.** Method exists at line 396; resolver invokes it correctly. But `sendAsCoach` already understands sub-coach scope and the resolver overrides the coachId argument in a way that defeats the service's attribution split. See P2 above.
- "MediaAssetResolver honors tx for all reads/writes" — **VERIFIED.** Lines 56, 61, 83, 97 all use `db = input.tx ?? this.prisma`. Test `assignable-asset-resolver-media.spec.ts:164-188` asserts the PrismaService is never touched when `tx` is given.
- "MealPlanAssetResolver honors tx for its probe" — **VERIFIED.** Line 56 uses `db = input.tx ?? this.prisma` for the `findFirst`. NOTE: the delegated `assignPlan` write itself does NOT honor `tx` (RealMealPlansService uses the unscoped client) — the resolver comment at lines 28-31 explicitly acknowledges this gap.
- "ClientAssetGrant on-conflict-nothing via @@unique(client_id, media_asset_id) — won't throw on replay" — **VERIFIED.** `prisma/schema.prisma:4717` defines the unique constraint; `media-asset.resolver.ts:82-114` does the optimistic insert with `P2002` race-recovery via `findUnique` on the composite key. Test `assignable-asset-resolver-media.spec.ts:86-111` exercises the race path.
- "For workout/meal delegation, verify the idempotency-key / existence-probe approach is sound" — **MIXED.** Workout: sound (delegates to `withIdempotency` which uses a unique-constraint claim row). Meal: **NOT SOUND** (probe-then-create TOCTOU, no @@unique on the target table). See P1.
- "@Global module in AppModule to avoid cycle" — **VERIFIED.** `app.module.ts:244` registers `AssignableAssetResolversModule` directly (not under PackagesModule). `test/module-graph.spec.ts` passes — no cycle reintroduced. `SubCoachModule` is `@Global` at `src/sub-coach/sub-coach.module.ts:29` and exports `SubCoachScopeService` (line 50), so the resolver helper can inject it without an explicit import.
- "Registry resolves all 4 resolvers at runtime" — **VERIFIED via build + spec coverage.** The multi-provider useFactory in `asset-resolvers.module.ts:52-66` enumerates all four; `npx nest build` resolves the DI graph without error; the unit spec asserts the dispatch by `canHandle`.
- "MediaAssetNotFoundError on missing/archived/cross-tenant asset" — **VERIFIED.** Missing: line 65; archived: line 65 (`asset.archived_at` truthy); cross-tenant: line 68 (`asset.coach_id !== acting.tenantCoachId`). Tests cover all three.
- "Cross-tenant check actually prevents IDOR" — **VERIFIED.** A coach passing another tenant's `media_asset_id` gets `MediaAssetNotFoundError` before the grant insert (test at `assignable-asset-resolver-media.spec.ts:146-162`), and the error message deliberately does not leak the asset's true owner.
- "No resolver opens a nested transaction when a tx is provided" — **VERIFIED.** `MediaAssetResolver` never calls `prisma.$transaction`. `MealPlanAssetResolver` never calls `$transaction`. The two delegating resolvers (workout, auto_message) push the call into their underlying service, which manages its own transactions — the resolver itself never opens one.
- "Sub-coach scope check is enforced before any DB call" — **VERIFIED** for every resolver: each calls `scope.resolve(coachId, clientId)` first, and the unit tests assert the delegate is never invoked when `canAccessClient` returns false.

---

**MERGE BAR:** the PR has 1 P1 (meal_plan idempotency TOCTOU) and 2 P2s (auto_message sub-coach attribution, auto_message at-least-once contract gap). Per the auditor brief's merge bar ("CLEAN of P0, P1, and P2"), this PR is NOT CLEAN. The P1 is fixable in PR-7 scope with a one-line `@@unique` migration on `DailyMealPlanAssignment` + a P2002 catch in the resolver mirroring `MediaAssetResolver`. The P2s should be resolved before PR-9/PR-10 wire the resolver into the fan-out and cron, since those paths are exactly where the duplication + mis-attribution will hit production.

VERDICT: NOT CLEAN

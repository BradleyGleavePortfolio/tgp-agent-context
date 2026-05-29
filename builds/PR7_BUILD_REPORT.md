# PR-7 BUILD REPORT — AssignableAssetResolver registry

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/316

Branch: `pr7/assignable-asset-resolver` off latest `main` (commits PR-2/PR-3/PR-4 already merged).

## (b) Registry pattern + which existing registry it mirrors

Mirrors **`CapabilityMaterializerRegistry`** (`src/ai/gateway/materialisers/capability-materialiser.registry.ts:23-75`) and its module wiring in `AiGatewayModule` (`src/ai/gateway/ai-gateway.module.ts:60-83`):

- Multi-provider injection token (`ASSIGNABLE_ASSET_RESOLVERS`, a `Symbol`).
- Each resolver registered as BOTH a concrete-class provider AND as an entry in the array bound to the token (via a `useFactory` that pulls them out of DI).
- Registry constructor normalises array | single | null shapes (test ergonomics).
- Duplicate `asset_type` registrations log a warning; first one wins.

**Deliberate divergence:** `resolve()` THROWS `UnknownAssignableAssetTypeError` on an unregistered asset_type instead of returning `null`. `CapabilityMaterializerRegistry` returns null because some capabilities legitimately materialise inline elsewhere; PR-7's resolvers are the ONLY place per-type fan-out happens, so a missing resolver is a wiring bug that must surface as a failed drop (caller marks `ScheduledDrop.failure_reason` and pages operators).

## (c) Each resolver → reused service (file:line)

| asset_type | Resolver class | Delegates to |
|---|---|---|
| `workout_program` + `workout_plan` | `WorkoutAssetResolver` (`src/packages/asset-resolvers/workout.resolver.ts`) | `WorkoutBuilderService.assignPlan` — `src/workout-builder/workout-builder.service.ts:511` |
| `meal_plan` | `MealPlanAssetResolver` (`src/packages/asset-resolvers/meal-plan.resolver.ts`) | `RealMealPlansService.assignPlan` — `src/real-meal-plans/real-meal-plans.service.ts:247` |
| `auto_message` | `AutoMessageAssetResolver` (`src/packages/asset-resolvers/auto-message.resolver.ts`) | `MessagingService.sendAsCoach` — `src/messaging/messaging.service.ts:396` |
| `pdf` + `video` | `MediaAssetResolver` (`src/packages/asset-resolvers/media-asset.resolver.ts`) | Direct insert into `ClientAssetGrant` (PR-3 model — no pre-existing service since the CoachMediaAsset upload pipeline is PR-12) |

No assignment SQL was duplicated.

## (d) Sub-coach scope approach

A single shared helper, `ResolverSubCoachScope` (`src/packages/asset-resolvers/sub-coach-scope.helper.ts`), is the only place the rule is implemented. Every resolver calls `scope.resolve(coachId, clientId)` as the FIRST line of `materialise()`:

1. `SubCoachScopeService.canAccessClient(coachId, clientId)` (`src/sub-coach/sub-coach-scope.service.ts:105`) → throws `SubCoachOutOfScopeError` when the caller is a sub-coach with no open `SubCoachAssignment` to the client.
2. `SubCoachScopeService.getHeadCoachIdForSubCoach(coachId)` (`src/sub-coach/sub-coach-scope.service.ts:91`) → returns the head coach id when the caller is a sub-coach.
3. The returned `tenantCoachId` (head coach id for sub-coaches, raw coachId for head coaches) is what the resolver passes to the downstream service.

This matters because the underlying services (`WorkoutBuilderService.assignPlan`, `RealMealPlansService.assignPlan`) enforce strict `plan.coach_id === coachId` ownership. Passing a sub-coach's id would 403; passing the head coach id matches the plan's tenant column.

Centralising the rule means a future resolver added in PR-12+ can't accidentally bypass the check.

## (e) Idempotency per resolver

| Resolver | Strategy |
|---|---|
| `WorkoutAssetResolver` | Deterministic key `drip:workout:{clientId}:{assetId}:{scheduledDropId|no-drop}` passed to `WorkoutBuilderService.assignPlan(coachId, planId, dto, idempotencyKey)`. The existing `WorkoutBuilderIdempotencyKey` ledger (`src/workout-builder/workout-builder.service.ts:144`) replays the cached row on retry. |
| `MealPlanAssetResolver` | Existence-check probe: `prisma.dailyMealPlanAssignment.findFirst({ client_id, daily_meal_plan_id })` runs FIRST and short-circuits to return the existing id when a prior fire already landed. `DailyMealPlanAssignment` has no natural `@@unique` today so we cannot use on-conflict-nothing. |
| `AutoMessageAssetResolver` | At-least-once. `MessagingService.sendAsCoach` does not accept a caller-supplied idempotency key (see the TODO at `src/ai/gateway/materialisers/coach-message.materialiser.ts:78-81`). PR-10 will suppress retries once `ScheduledDrop.materialised_ref` is set; a duplicate send within a retry window is preferable to silently dropping a paid-for delivery. |
| `MediaAssetResolver` | On-conflict-nothing via `ClientAssetGrant @@unique([client_id, media_asset_id])` (`prisma/schema.prisma:4717`). Optimistic INSERT; on `Prisma.PrismaClientKnownRequestError` code `P2002`, re-query `findUnique` with the composite key `client_id_media_asset_id` and return the existing grant id. Mirrors the P2002 race-recovery in `AssignWorkoutMaterializer` (`src/ai/gateway/materialisers/assign-workout.materialiser.ts:201-218`). |

## (f) Test results

- **`tsc --noEmit -p tsconfig.json`** → clean.
- **`nest build`** → clean.
- **`eslint`** → 0 errors. 21 warnings, all in pre-existing unrelated files (`packages.controller.ts`, `packages.dto.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`); unchanged from `main`. My new files lint clean.
- **New unit tests: 32 specs across 5 files, all pass.**
  - `test/assignable-asset-resolver-registry.spec.ts` — 8 tests covering resolution, unknown-type throw, empty/falsy input, single-instance DI, empty registry, duplicate warning + first-wins, `materialise()` convenience, symbol token stability.
  - `test/assignable-asset-resolver-workout.spec.ts` — 5 tests covering both `workout_plan` and `workout_program`, delegation args (tenant id, client_id, ISO scheduled_for, deterministic idempotency key), head-coach rewrite for sub-coaches, out-of-scope refusal, idempotency key for the no-drop path.
  - `test/assignable-asset-resolver-meal-plan.spec.ts` — 5 tests covering narrow `canHandle`, delegation args + head-coach rewrite, existence-check idempotency, tx-honoring on the probe, out-of-scope refusal.
  - `test/assignable-asset-resolver-auto-message.spec.ts` — 5 tests covering narrow `canHandle`, delegation args + head-coach rewrite + trimmed body from `displayCaption`, fallback to `displayTitle`, empty-body refusal, out-of-scope refusal.
  - `test/assignable-asset-resolver-media.spec.ts` — 9 tests covering both `pdf` and `video`, happy-path grant creation, P2002 on-conflict-nothing → existing grant id, missing asset → `MediaAssetNotFoundError`, archived asset → not-found, cross-tenant asset → not-found, tx-honoring across ALL reads + writes (PrismaService never touched), sub-coach head-coach rewrite, out-of-scope refusal.
- **Existing tests still pass.** Full suite: **281/281 suites, 3331/3331 active tests pass**, 20 skipped + 5 todo unchanged from main, 6 snapshots pass.

## Files added / changed

Added (`src/packages/asset-resolvers/`):
- `assignable-asset-resolver.interface.ts` — `AssignableAssetType`, input/result types, resolver interface.
- `assignable-asset-resolver.errors.ts` — typed errors: `UnknownAssignableAssetTypeError`, `SubCoachOutOfScopeError`, `MediaAssetNotFoundError`, `AutoMessageBodyMissingError`.
- `assignable-asset-resolver.registry.ts` — registry + `ASSIGNABLE_ASSET_RESOLVERS` token.
- `sub-coach-scope.helper.ts` — `ResolverSubCoachScope` (the single sub-coach gate).
- `workout.resolver.ts`, `meal-plan.resolver.ts`, `auto-message.resolver.ts`, `media-asset.resolver.ts` — the four resolvers.
- `asset-resolvers.module.ts` — `@Global` module wiring (registered at AppModule, not under PackagesModule, to avoid the module cycle through MessagingModule → AuditModule → AuthModule → InviteCodesModule → BillingModule → CheckoutModule → PackagesModule).

Changed:
- `src/app.module.ts` — import + register `AssignableAssetResolversModule`.

Tests added (`test/assignable-asset-resolver-*.spec.ts`): 5 new spec files, 32 tests total, all passing.

## Guardrails honoured

- Registry + resolvers + unit tests ONLY.
- NOT wired into `PurchaseFanoutService`.
- No cron, no endpoints, no mobile changes, no CoachMediaAsset upload pipeline (PR-12).
- No assignment SQL duplicated — every resolver delegates.
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.

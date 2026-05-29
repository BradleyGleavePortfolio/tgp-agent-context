# PR-7 BUILD REPORT — AssignableAssetResolver registry

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/316

Branch: `pr7/assignable-asset-resolver` off latest `main` (commits PR-2/PR-3/PR-4 already merged).

**Two commits on the branch:**
- `71f931b4` — initial build (registry + 4 resolvers + 32 tests).
- `ed596758` — audit fixes (P1 meal_plan race guard, P2(a) sub-coach attribution, P2(b) idempotency contract). All three flagged-as-blocking findings addressed; six new tests added.

## (b) Registry pattern + which existing registry it mirrors

Mirrors **`CapabilityMaterializerRegistry`** (`src/ai/gateway/materialisers/capability-materialiser.registry.ts:23-75`) and its module wiring in `AiGatewayModule` (`src/ai/gateway/ai-gateway.module.ts:60-83`):

- Multi-provider injection token (`ASSIGNABLE_ASSET_RESOLVERS`, a `Symbol`).
- Each resolver registered as BOTH a concrete-class provider AND as an entry in the array bound to the token (via a `useFactory` that pulls them out of DI).
- Registry constructor normalises array | single | null shapes (test ergonomics).
- Duplicate `asset_type` registrations log a warning; first one wins.

**Deliberate divergence:** `resolve()` THROWS `UnknownAssignableAssetTypeError` on an unregistered asset_type instead of returning `null`. `CapabilityMaterializerRegistry` returns null because some capabilities legitimately materialise inline elsewhere; PR-7's resolvers are the ONLY place per-type fan-out happens, so a missing resolver is a wiring bug that must surface as a failed drop (caller marks `ScheduledDrop.failure_reason` and pages operators).

## (c) Each resolver → reused service (file:line)

| asset_type | Resolver class | Underlying surface |
|---|---|---|
| `workout_program` + `workout_plan` | `WorkoutAssetResolver` (`src/packages/asset-resolvers/workout.resolver.ts`) | `WorkoutBuilderService.assignPlan` — `src/workout-builder/workout-builder.service.ts:511` |
| `meal_plan` | `MealPlanAssetResolver` (`src/packages/asset-resolvers/meal-plan.resolver.ts`) | Direct `DailyMealPlanAssignment` insert (see (e) — the audit-fix required setting `drip_drop_id` on the row, which `RealMealPlansService.assignPlan` doesn't accept) |
| `auto_message` | `AutoMessageAssetResolver` (`src/packages/asset-resolvers/auto-message.resolver.ts`) | `MessagingService.sendAsCoach` — `src/messaging/messaging.service.ts:396` |
| `pdf` + `video` | `MediaAssetResolver` (`src/packages/asset-resolvers/media-asset.resolver.ts`) | Direct insert into `ClientAssetGrant` (PR-3 model — no pre-existing service since the CoachMediaAsset upload pipeline is PR-12) |

No assignment SQL was duplicated for workout / auto_message. The meal_plan resolver does its own INSERT for the idempotency reason in (e), with inline plan-ownership + scope checks that mirror what `RealMealPlansService` does internally.

## (d) Sub-coach scope approach

A single shared helper, `ResolverSubCoachScope` (`src/packages/asset-resolvers/sub-coach-scope.helper.ts`), is the only place the rule is implemented. Every resolver calls `scope.resolve(coachId, clientId)` as the FIRST line of `materialise()`:

1. `SubCoachScopeService.canAccessClient(coachId, clientId)` (`src/sub-coach/sub-coach-scope.service.ts:105`) → throws `SubCoachOutOfScopeError` when the caller is a sub-coach with no open `SubCoachAssignment` to the client.
2. `SubCoachScopeService.getHeadCoachIdForSubCoach(coachId)` (`src/sub-coach/sub-coach-scope.service.ts:91`) → returns the head coach id when the caller is a sub-coach.

The helper returns BOTH:
- `tenantCoachId` — head coach id for sub-coaches, raw coachId for head coaches.
- `actingCoachId` — always the raw caller id.

**Each resolver picks the right one for its downstream service** — they are NOT uniformly substituted:

- **workout / meal_plan**: pass `tenantCoachId` because `WorkoutBuilderService.assignPlan` and the meal_plan insert both enforce strict `plan.coach_id === coachId` on a tenant column. Passing a sub-coach id would 403 or reject ownership.
- **auto_message**: pass `actingCoachId` because `MessagingService.sendAsCoach` runs its OWN Phase-11 sub-coach split internally (`messaging.service.ts:285-314`); it expects the acting id and resolves the head-coach split itself so `sender_id` ends up correctly attributed to the sub-coach. **Passing tenantCoachId here was the P2(a) audit finding — fixed in `ed596758`.**

Centralising the scope check means a future resolver added in PR-12+ can't accidentally bypass the rule, while still letting each call site choose the tenant-vs-acting id its underlying service expects.

## (e) Idempotency per resolver

The interface contract (`src/packages/asset-resolvers/assignable-asset-resolver.interface.ts`) now explicitly states the baseline is **AT-LEAST-ONCE**, with each resolver documenting its own per-type strategy. Three of four resolvers are effectively exactly-once via schema-enforced uniques; auto_message is the exception, which is the P2(b) audit finding.

| Resolver | Strategy | Race guarantee |
|---|---|---|
| `WorkoutAssetResolver` | Deterministic key `drip:workout:{clientId}:{assetId}:{scheduledDropId\|no-drop}` passed to `WorkoutBuilderService.assignPlan(coachId, planId, dto, idempotencyKey)`. The existing `WorkoutBuilderIdempotencyKey` ledger (`src/workout-builder/workout-builder.service.ts:144`) replays the cached row on retry. | Exactly-once via the ledger. |
| `MealPlanAssetResolver` | **PR-7 audit fix (P1).** Resolver writes the row directly with `drip_drop_id: scheduledDropId`. Migration `20261203000000_pr7_meal_plan_drip_drop_unique` adds `DailyMealPlanAssignment.drip_drop_id String? @unique`. Best-effort prior-fire short-circuit via `findUnique({ drip_drop_id })`; on INSERT, P2002 catch falls through to a re-read of the winner's row. | **Exactly-once.** Concurrency simulation test in the suite asserts two parallel `materialise` calls on the same drop produce exactly one assignment row and both callers see the same `materialisedRef`. |
| `AutoMessageAssetResolver` | **At-least-once.** `MessagingService.sendAsCoach` does not today accept a caller-supplied idempotency key (TODO at `src/ai/gateway/materialisers/coach-message.materialiser.ts:78-81`). Per the P2(b) contract amendment, PR-10's drip executor MUST gate retries on `ScheduledDrop.materialised_ref IS NULL` — the per-drop dispatch guard lives in the executor. The auto-message resolver's file-level comment mirrors this so PR-10 cannot miss it. | At-least-once; PR-10 executor must enforce no-replay on success. |
| `MediaAssetResolver` | On-conflict-nothing via `ClientAssetGrant @@unique([client_id, media_asset_id])` (`prisma/schema.prisma:4717`). Optimistic INSERT; on P2002, re-query `findUnique` with the composite key `client_id_media_asset_id` and return the existing grant id. | Exactly-once via the unique. |

### Additive migration confirmation

`prisma/migrations/20261203000000_pr7_meal_plan_drip_drop_unique/migration.sql`:

```sql
ALTER TABLE "DailyMealPlanAssignment" ADD COLUMN "drip_drop_id" TEXT;
CREATE UNIQUE INDEX "DailyMealPlanAssignment_drip_drop_id_key" ON "DailyMealPlanAssignment"("drip_drop_id");
```

- NO DROP, NO RENAME, NO type change on any existing column.
- New column is NULLABLE with no DEFAULT → the `ALTER TABLE` is metadata-only with no row rewrite and no backfill required.
- Postgres treats NULLs as distinct in a UNIQUE, so every pre-existing row (NULL `drip_drop_id`) is unaffected, manual coach-assigned plans continue to set NULL, and only drip-materialised assignments contend on the constraint.
- Mirrors the existing `ai_draft_id @unique` pattern at `prisma/schema.prisma:2188`.

## (f) Test results

- **`tsc --noEmit -p tsconfig.json`** → clean.
- **`nest build`** → clean.
- **`eslint`** on new + modified files → 0 errors. (Unrelated pre-existing warnings in `packages.controller.ts`, `packages.dto.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts` are unchanged from `main`.)
- **38 resolver unit tests pass** across 5 spec files (up from 32 pre-audit — six new for the audit fixes):
  - `test/assignable-asset-resolver-registry.spec.ts` — 8 tests (unchanged).
  - `test/assignable-asset-resolver-workout.spec.ts` — 5 tests (unchanged).
  - `test/assignable-asset-resolver-meal-plan.spec.ts` — **10 tests, reworked** for the new direct-insert path. New coverage: drip-path delegation args + `drip_drop_id` wiring; prior-fire short-circuit by drop id; **focused P2002 race recovery test** (loser re-reads winner by drop id); **end-to-end concurrency simulation** (`Promise.all` of two concurrent `materialise` calls on the same drop, asserting exactly one INSERT succeeds and both callers receive the same `materialisedRef`); missing/archived/cross-tenant plan refusal; tx-honoring across ALL reads + writes (PrismaService never touched); back-compat (no-drop) latest-assignment probe; sub-coach refusal pre-DB.
  - `test/assignable-asset-resolver-auto-message.spec.ts` — **6 tests**. **Audit-fix assertion added:** the first arg to `sendAsCoach` is the ACTING coach id (`sub-1`), not the head coach id (`head-1`), when the caller is a sub-coach. New head-coach passthrough case anchors the symmetric assertion.
  - `test/assignable-asset-resolver-media.spec.ts` — 9 tests (unchanged).
- **Existing tests still pass.** Full suite: **281/281 suites, 3337/3337 active tests pass** (up from 3331 — six new), 20 skipped + 5 todo unchanged from main, 6 snapshots pass.

## Files added / changed

**Initial build (commit `71f931b4`):**
- Added `src/packages/asset-resolvers/` — interface, errors, registry, sub-coach helper, 4 resolvers, module.
- Modified `src/app.module.ts` — import + register `AssignableAssetResolversModule` (`@Global`).
- Added 5 spec files under `test/`.

**Audit-fix commit `ed596758`:**
- Added `prisma/migrations/20261203000000_pr7_meal_plan_drip_drop_unique/migration.sql` — additive `drip_drop_id` column + UNIQUE index on `DailyMealPlanAssignment`.
- Modified `prisma/schema.prisma` — adds `drip_drop_id String? @unique` on `DailyMealPlanAssignment`.
- Modified `src/packages/asset-resolvers/meal-plan.resolver.ts` — direct-insert path with P2002 race recovery; inline plan-ownership + scope checks; back-compat probe for the no-drop path.
- Modified `src/packages/asset-resolvers/auto-message.resolver.ts` — pass `acting.actingCoachId` (was `tenantCoachId`); contrast comment vs. workout/meal_plan resolvers.
- Modified `src/packages/asset-resolvers/assignable-asset-resolver.interface.ts` — amended `materialise()` contract to AT-LEAST-ONCE baseline with per-resolver notes; `scheduledDropId` doc upgraded from "only pdf/video" to enumerate the meal_plan use; `tx` doc updated to note meal_plan now honours tx directly.
- Modified `src/packages/asset-resolvers/assignable-asset-resolver.errors.ts` — added `MealPlanNotFoundError`.
- Modified `src/packages/asset-resolvers/asset-resolvers.module.ts` — dropped `RealMealPlansModule` from imports (no longer needed).
- Modified `test/assignable-asset-resolver-meal-plan.spec.ts` — reworked for the new path (10 tests).
- Modified `test/assignable-asset-resolver-auto-message.spec.ts` — added sub-coach attribution assertion + head-coach case (6 tests).

## Guardrails honoured

- Registry + resolvers + unit tests + ONE additive migration (required by the P1 fix).
- NOT wired into `PurchaseFanoutService`.
- No cron, no endpoints, no mobile changes, no CoachMediaAsset upload pipeline (PR-12).
- No assignment SQL duplicated for workout / auto_message. The meal_plan resolver does its own INSERT only because the row needs `drip_drop_id` set for the unique-key race guard.
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers on either commit.

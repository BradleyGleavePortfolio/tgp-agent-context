# Backend Workout Inventory — Master Workout Builder Feature

Read-only inventory feeding the design spec for the "Master Workout Builder + Build-with-AI + real undo/autosave" feature.
All file:line citations are relative to `/home/user/workspace/growth-project-backend-27454ddb/`.

---

## 1. `src/workout-builder/*` — current Phase-11 builder surface

### Module wiring

`src/workout-builder/workout-builder.module.ts:27-33`
- Imports: `AuthModule`, `ExerciseLibraryModule`.
- Controllers: `WorkoutBuilderController`, `AssignmentController`.
- Providers: `WorkoutBuilderService`, `RolesGuard` (local).
- Exports: `WorkoutBuilderService` (consumed by `CoachAIService`).

### Coach-facing routes — `WorkoutBuilderController` (mounted at `/workout-plans`)

Guards (class-level): `JwtAuthGuard`, `RolesGuard`; `@Roles('coach', 'owner')`. Idempotency-Key header is mandatory on every coach mutation via the `RequiredIdempotencyKey` param decorator (`workout-builder.controller.ts:81-95`).

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/workout-plans` | `listPlans` (`controller.ts:109-118` → `service.ts:234-275`) | Paginated keyset (`created_at DESC, id DESC`); active plans only. `limit ≤ WORKOUT_BUILDER_PAGE_MAX=50` (`service.ts:49,86-91`). Cursor is base64 `iso|id` (`service.ts:101-123`). |
| POST | `/workout-plans` | `createPlan` (`controller.ts:131-138` → `service.ts:293-314`) | Inserts a `WorkoutPlan`. `CreateWorkoutPlanDto` (`dto.ts:37-51`): `name ≤120`, `type ∈ {strength,cardio,mobility}`, optional `duration_estimate_minutes ∈ [1,600]`. |
| GET | `/workout-plans/:planId` | `getPlan` (`controller.ts:140-147` → `service.ts:277-291`) | Includes non-archived exercises, ordered by `order ASC`. Ownership re-checked. |
| PATCH | `/workout-plans/:planId` | `updatePlan` (`controller.ts:153-161` → `service.ts:316-346`) | Metadata only (`name`, `type`, `duration_estimate_minutes`) per `UpdateWorkoutPlanDto` (`dto.ts:53-69`). No exercise edits via PATCH. |
| DELETE | `/workout-plans/:planId` | `archivePlan` (`controller.ts:171-176` → `service.ts:360-390`) | Soft-archive (`archived_at = now()`); idempotent at the data layer using a single `updateMany WHERE archived_at IS NULL` (`service.ts:373-378`). No `Idempotency-Key` required. |
| PUT | `/workout-plans/:planId/exercises` | `setExercises` (`controller.ts:186-199` → `service.ts:408-507`) | **Bulk replace** under `Serializable` transaction with `SELECT … FOR UPDATE` on the plan row. If any active (`completed_at = null`) assignment exists, the call returns **409** (refuses to mutate) so assigned clients keep their snapshot (`service.ts:461-472`). Otherwise prior rows are soft-archived and the new rows inserted. Rows validated by `UpsertExerciseRowDto` (`dto.ts:73-119`): per-row `sets ∈ [1,100]`, `reps_or_duration_seconds ≥ 1`, optional `weight_lbs`, `rest_seconds`, `superset_group_id`, `notes ≤ 500`. Array cap `200` rows (`dto.ts:126`). Duplicate `order` rejected (`service.ts:416-421`). |
| POST | `/workout-plans/:planId/assignments` | `assignPlan` (`controller.ts:205-213` → `service.ts:511-541`) | Creates a `ClientWorkoutAssignment`. `CreateAssignmentDto` (`dto.ts:134-141`): `client_id`, ISO `scheduled_for`. Checks client belongs to coach (`service.ts:769-774`). |
| GET | `/workout-plans/:planId/assignments` | `listAssignments` (`controller.ts:217-227` → `service.ts:548-585`) | Per-plan paginated (`scheduled_for ASC, id ASC`). |

### Client-facing routes — `AssignmentController` (mounted at `/assignments`)

Class-level guards: `JwtAuthGuard`, `ClientEntitlementGuard` (`controller.ts:241`). No role gate — students hit this. ClientEntitlementGuard 402s un-entitled students.

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/assignments/me` | `listMine` (`controller.ts:253-262` → `service.ts:593-637`) | Paginated; includes `workout_plan` + non-archived exercises in order. `WHERE client_id = req.user.id`. |
| GET | `/assignments/:assignmentId` | `getOne` (`controller.ts:273-278` → `service.ts:651-672`) | **404** for missing, **403** for cross-tenant (intentional split, audit P1). |
| PATCH | `/assignments/:assignmentId/complete` | `complete` (`controller.ts:291-297` → `service.ts:686-759`) | Body: `CompleteAssignmentDto` (`dto.ts:148-184`) — required `idempotency_key` (UUID v1–v5), optional `started_at`, `completion_payload` (Json), `post_rpe ∈ [1,10]`, `post_notes ≤ 1000`. Atomic conditional `updateMany WHERE completed_at IS NULL`; replays with same idempotency key return the original row; **409** on different key against an already-completed row. |

### Service-layer concerns

- **Idempotency** (`service.ts:144-225` `withIdempotency`): atomically claims `WorkoutBuilderIdempotencyKey` with `status='in_progress'`, runs `op()`, then flips to `completed` and caches the response_json. `P2002` collision → if `completed` returns cached response, else `409`. Failed ops delete the claim row to let the client retry.
- **Plan ownership check** (`service.ts:763-767`): hard `plan.coach_id === coachId` — does NOT consult `SubCoachAssignment`. See §5 below.
- **Client-belongs-to-coach** (`service.ts:769-774`): hard `client.coach_id === coachId` — same gap; sub-coaches who legitimately own the relationship via `SubCoachAssignment` cannot assign workouts.
- **Defense-in-depth `assertCoach`** (`service.ts:73-82`): re-checks role against the DB even though `RolesGuard` already did.

### Autosave / draft / undo support

**NONE.** No PATCH-row endpoint, no version table, no draft snapshot of the plan itself, no undo log. The only "draft" concept anywhere is the AI workflow's `AIDraft` / `AiActionDraft` rows (§4). The `setExercises` endpoint is whole-array replace under a Serializable lock.

---

## 2. `src/workout/*` (legacy "log a workout") + exercise catalog/library

These are SEPARATE from the workout-builder module.

### `src/workout/*` — client-side workout LOGGING (a completed session and its sets)

Module: `src/workout/workout.module.ts`.

Controller: `src/workout/workout.controller.ts:20-73` — guarded by `JwtAuthGuard`, `ClientEntitlementGuard`, `RolesGuard` with `@Roles('student')`.

Routes:
- `POST /workouts` — `createWorkout` (`controller.ts:24-26` → `service.ts:21-71`): creates a `WorkoutSession` + nested `ExerciseSet[]`. Emits PTM signal + invalidates AI context.
- `GET /workouts` — list recent sessions (`controller.ts:29-31` → `service.ts:73-80`).
- `GET /workouts/volume` — per-muscle-group volume aggregation (`controller.ts:34-36` → `service.ts:82-108`).
- `PUT /workouts/:id` — `updateWorkout` (`controller.ts:41-47` → `service.ts:116-164`); replace-all on exercises in a transaction.
- `DELETE /workouts/:id` — `deleteWorkout` (`controller.ts:50-52` → `service.ts:166-184`).
- `GET /routines` — `getRoutines` (`controller.ts:55-57` → `service.ts:186-191`): own + `is_template=true`.
- `POST /routines` — `createRoutine` (`controller.ts:60-62` → `service.ts:193-218`): note `is_template` is NOT in the DTO (`service.ts:196`).
- `PUT /routines/:id`, `DELETE /routines/:id` — owner-only updates/deletes (`service.ts:220-236`).

This module is for self-logged training history, NOT the coach-prescribed workout-builder surface. The two data models do not share tables (`WorkoutSession`/`ExerciseSet`/`WorkoutRoutine` vs `WorkoutPlan`/`WorkoutPlanExercise`/`ClientWorkoutAssignment`).

### `src/exercise-catalog/*` — canonical Mux-backed catalog

Module: `src/exercise-catalog/exercise-catalog.module.ts`.

Controllers (`exercise-catalog.controller.ts`):
- `GET /exercise-catalog` (`controller.ts:77-82`) — list, JWT only. `@Roles('student','coach','owner')`. Filters: `q`, `category`, `primaryMuscle`, `equipment` (`service.ts:48-84`). Paginated by offset cursor (`service.ts:303-314`).
- `GET /exercise-catalog/:idOrSlug` (`controller.ts:91-100`) — detail with `playbackUrl` mint policy at `service.ts:116-144`: owner/coach always allowed; students only when an assignment of theirs references this row via `WorkoutPlanExercise.exercise_external_id`, or row is public-policy.
- Admin (`controller.ts:106-154`, gated by `OwnerGuard`): `POST /admin/exercise-catalog`, `POST /admin/exercise-catalog/:idOrSlug/video/upload` (Mux direct upload), `PUT /:idOrSlug/video` (attach existing asset), `DELETE /:idOrSlug/video` (detach).

`getPlaybackInfo` / `playbackInfoFromRow` (`service.ts:235-258`) are public helpers for cross-module enrichment (workout-builder consumers).

### `src/exercise-library/*` — ExerciseDB search proxy

Module: `src/exercise-library/exercise-library.module.ts` (16 lines).

`ExerciseLibraryController` (`exercise-library.controller.ts:34-100`):
- `GET /exercises/search` — q + `muscleGroup` + `equipment` + `limit` (1..100) + opaque `cursor`. Returns `ExerciseSearchResult` (paged). 503 on `EXERCISEDB_NOT_CONFIGURED`.
- `GET /exercises/:id` — single lookup by ExerciseDB id.

Both are JWT-authenticated only (no role gate). Backed by `ExerciseLibraryService` over the upstream ExerciseDB API. **Note**: this is the search surface, distinct from the locally-curated `ExerciseCatalogItem` table. `WorkoutPlanExercise.exercise_external_id` is intentionally not a FK (`schema.prisma:2014-2015`); it is just a stable string token that may resolve to either an ExerciseDB id or a local catalog slug.

---

## 3. Data model deep-read (Prisma `schema.prisma`)

### `model WorkoutPlan` (`schema.prisma:1993-2008`)

```
id                        String   @id @default(uuid())
coach_id                  String   (FK User, onDelete Cascade)
name                      String
type                      WorkoutPlanType   (strength|cardio|mobility)
duration_estimate_minutes Int?
created_at                DateTime @default(now())
updated_at                DateTime @updatedAt
archived_at               DateTime?
exercises                 WorkoutPlanExercise[]
assignments               ClientWorkoutAssignment[]
@@index([coach_id, archived_at, created_at(sort: Desc)], name: …)
```

**No `version` / `revision` / `lock_token` column on the plan.** No soft-delete via "active flag"; archive is timestamp-based. No "is_template" or "is_master" concept distinguishing reusable library templates from per-client plans — a plan is owned by a coach and reused by being assigned to multiple clients.

### `model WorkoutPlanExercise` (`schema.prisma:2010-2033`)

```
id                       String @id @default(uuid())
workout_plan_id          String (FK WorkoutPlan, onDelete Cascade)
exercise_external_id     String   ← NOT a FK to ExerciseCatalogItem
order                    Int
sets                     Int
reps_or_duration_seconds Int      ← dual-purpose rep count OR seconds
weight_lbs               Float?
rest_seconds             Int?
superset_group_id        String?  ← rows sharing this id are back-to-back
notes                    String?
archived_at              DateTime? ← soft-delete
@@index([workout_plan_id])
@@index([workout_plan_id, archived_at])
@@index([exercise_external_id])
```

Comment at `schema.prisma:2027-2029`: `(workout_plan_id, order)` partial unique index `WHERE archived_at IS NULL` is declared via raw SQL in a migration (Prisma cannot express partial unique indexes). This is what lets `setExercises` soft-archive everything and re-insert with the same order values.

### `model ClientWorkoutAssignment` (`schema.prisma:2035-2066`)

```
id                         String   @id
workout_plan_id            String   (FK WorkoutPlan)
client_id                  String   (FK User → "ClientWorkoutAssignments")
assigned_by_coach_id       String   (FK User → "CoachWorkoutAssignments")
scheduled_for              DateTime
completed_at               DateTime?
post_rpe                   Int?
post_notes                 String?
idempotency_key            String?  @unique  ← legacy/unused on assignPlan path
completion_payload         Json?
started_at                 DateTime?
completion_idempotency_key String?           ← per-assignment dedup of complete()
approved_by_coach_at       DateTime?         ← R43 Coach Brief — coach reviews submission
ai_draft_id                String? @unique    ← Stream 2 single-emit guard
@@index([client_id, scheduled_for])
@@index([workout_plan_id, scheduled_for])
@@index([assigned_by_coach_id])
@@index([assigned_by_coach_id, approved_by_coach_at])
```

### Trace: assign → persist → client visibility

1. Coach `POST /workout-plans/:id/assignments` with `Idempotency-Key` header (`controller.ts:201-213`).
2. `WorkoutBuilderService.assignPlan` (`service.ts:511-541`) — under the idempotency wrapper: re-asserts coach role, plan ownership (`assertPlanOwnership`), and **`assertClientBelongsToCoach`** (`service.ts:769-774`). Creates a single row in `ClientWorkoutAssignment` (no transaction; the row IS the source of truth).
3. Mobile client polls `GET /assignments/me` (`controller.ts:253` → `service.ts:593-637`), which JOINs `workout_plan` + non-archived `WorkoutPlanExercise`. So a coach's later `setExercises` AFTER assignment is **blocked at 409** (`service.ts:465-472`) to preserve the client snapshot — but soft-archived rows from prior plans are filtered out by `archived_at IS NULL` in the include filter, meaning if assignment happens BEFORE any setExercises, the client sees the most recent live rows. There is NO assignment-time snapshotting; the read is always "live exercises of the plan at read time".
4. There is NO push notification on coach-driven assignment (only the AI-materialised path sends a `WORKOUT_ASSIGNED` push at `assign-workout.materialiser.ts:228-253`).
5. `approved_by_coach_at` (R43) is the "coach has reviewed the client's submission" timestamp; there is no controller-mounted endpoint in this module to flip it yet (column exists, no service method writes it as of this read).

### Other inventoried models

- `WorkoutBuilderIdempotencyKey` (`schema.prisma:2072-2089`): unique `(user_id, route_key, idempotency_key)`. Status `in_progress|completed`, cached `response_json`. See `service.ts:144-225`.
- `ExerciseCatalogItem` (`schema.prisma:3841-3890`): owner-curated catalog row with `slug`, `name`, `category`, `primary_muscle`, `secondary_muscles[]`, `equipment[]`, `difficulty`, `instructions[]`, Mux state (`mux_asset_id`, `mux_playback_id`, `mux_playback_policy`, `mux_asset_status` enum `none|uploading|processing|ready|errored`, `mux_duration_seconds`, `mux_error_message`, `mux_upload_id @unique`), third-party video enrichment (`video_url`, `video_provider`).
- `MealTemplate` (`schema.prisma:2119-…`), `DailyMealPlan` (`schema.prisma:2139-…`) — not central to workout but spec mentions; coach-side reusable library exists for meal plans.
- `WorkoutSession` / `ExerciseSet` / `WorkoutRoutine` / `RoutineExercise` (`schema.prisma:772-828`) — the legacy client-logged training history (see §2). `WorkoutRoutine.is_template` exists but is never settable via the DTO; this is the closest thing to a reusable "template library" in the existing schema, but it is creator-scoped to one user, not a global library.

---

## 4. AI workout generation

There are **TWO independent AI paths** that produce workout artefacts. Both produce drafts; coaches must approve.

### Path A — `CoachAIService.generateWorkoutProgram` → `AIDraft` (Coach AI v1)

Files: `src/ai/coach/coach-ai.service.ts:67-105`, `src/ai/coach/coach-ai.controller.ts:67-75`, prompt `src/ai/prompts/workout-program.prompt.ts`.

Flow (`coach-ai.service.ts:67-105`):
1. `assertReady()` (`coach-ai.service.ts:50-57`) — 503 `ai_disabled` if `CoachAIStateService.isReady()` false.
2. `assertCoachOwnsClient(coachId, clientId)` (`coach-ai.service.ts:59-65`) — direct `User.coach_id` check; **does NOT consult SubCoachAssignment** — same gap as workout-builder (§5).
3. `ClientContextService.build(clientId)` — snapshot of profile, prescribed macros, recent assignments, weight trend.
4. `AnthropicAdapter.completeStructured<WorkoutProgramPayload>` (`coach-ai.service.ts:75-92`) using:
   - Model: `claude-sonnet-4-6` pinned in `coach-ai.constants.ts:14` as `COACH_AI_MODEL`.
   - Prompt: `WorkoutProgramPrompt` (`workout-program.prompt.ts:126-175`). Output is multi-week (`weeks × daysPerWeek`) with per-day ordered exercise rows.
   - `prompt.validate` (`workout-program.prompt.ts:142-174`) parses the JSON: rejects missing `days[]`, coerces types, caps `notes` to 500 chars.
   - `maxTokens: 4096`.
5. `persistDraft` (`coach-ai.service.ts:355-381`) — inserts `AIDraft` row with `type='WORKOUT_PROGRAM'`, status `DRAFT`, raw payload, `inputContext` snapshot, `modelUsed`, `promptVersion`, `tokensIn/Out`, `costCents`.

Controller (`coach-ai.controller.ts:67-75`): class-level guards `JwtAuthGuard, CoachGuard, SubscriptionGuard` and `@RequiresTier('pro')` (Pro tier feature). Per-route throttle `COACH_AI_GENERATION`: 5/hour for workout-program (`coach-ai.controller.ts:69`).

Approval / materialisation: `coach-ai.service.ts:253-268` `approveDraft` → `materializeWorkoutProgram` (`coach-ai.service.ts:272-316`):
- For EACH day in the payload it calls `WorkoutBuilderService.createPlan` then `setExercises`. So the AI **does CREATE multiple `WorkoutPlan` rows live** at approval time (one per `WxDy`), not "produce a draft that the coach refines". `approvedAsId` is the first plan's id (`coach-ai.service.ts:284,311-315`).
- Only validates "payload.days is non-empty" (`coach-ai.service.ts:277-279`); deeper validation is what the prompt-validator already did at generation time. No injury-vs-payload re-check on approve.
- Inline materialisation (NOT via `CapabilityMaterializerRegistry`) — bypasses the gateway's PRODUCT-1 race protections.

Other AIDraft state machine bits:
- `editDraft` (`coach-ai.service.ts:225-240`): coach can patch `generatedPayload` while `status='DRAFT'` — this is the closest thing to "edit before approve" but it is whole-object merge, not autosave.
- `rejectDraft` (`coach-ai.service.ts:242-251`).

Schema: `AIDraft` (`schema.prisma:2330-2354`) with `type` (`WORKOUT_PROGRAM|MEAL_PLAN|INSIGHT`), `status` (`DRAFT|APPROVED|REJECTED|EXPIRED`), `generatedPayload Json`, `approvedAsId String?` (FK by-id-only, single column points at multiple tables), `tokensIn/Out`, `costCents`. `AICallLog` (`schema.prisma:2359-2377`) is per-call cost+latency.

### Path B — `draft.assign_workout` capability → `AssignWorkoutMaterializer` (Stream 2 gateway)

Files: `src/ai/gateway/materialisers/assign-workout.materialiser.ts`, gateway controller `src/ai/gateway/ai-gateway.controller.ts`, approval service `src/ai/gateway/ai-approval.service.ts`.

Flow:
1. `POST /ai/gateway/invoke` (`ai-gateway.controller.ts:58-114`) with `capability='draft.assign_workout'` and a `proposed_action` payload `{ workoutPlanId, clientId, scheduledFor, notificationBody? }`. Throttled 20/hour (`ai-gateway.controller.ts:59`).
2. `AiGatewayService.invoke` validates the payload against `AssignWorkoutPayloadSchema` (zod, `assign-workout.materialiser.ts:57-83`) and creates an `AiActionDraft` row with `tenant_coach_id`, `subject_user_id`, `requester_id`, `payload`, `rationale`, `provenance`, `expires_at` (`schema.prisma:2265-2302`).
3. Coach views `GET /ai/gateway/drafts` (`ai-gateway.controller.ts:116-132`) — owner-or-tenant-scoped.
4. Coach decides: `PATCH /ai/gateway/drafts/:id` (`ai-gateway.controller.ts:134-151`) → `AiApprovalService.decide` (`ai-approval.service.ts:75-302`). This service **does NOT live-create the workout**: it picks the registered `AssignWorkoutMaterializer` and calls `materialize(draft)`:
   - Re-verifies the requester is still a coach/owner at approval time (`assign-workout.materialiser.ts:114-135` — layer-3 defence).
   - Re-validates payload schema (defence-in-depth, `:147-154`).
   - Re-checks `plan.coach_id === draft.tenant_coach_id` inside a transaction (`assign-workout.materialiser.ts:167-188`).
   - Inserts a SINGLE `ClientWorkoutAssignment` with `ai_draft_id = draft.id` (`schema.prisma:2060`, `@unique`) — schema-level single-emit guard. P2002 → returns `{status:'already_materialised'}` (`:202-220`).
   - Fires `WORKOUT_ASSIGNED` push notification fire-and-forget (`:227-253`).
5. `AiApprovalService.decide` only flips draft status to `approved` AFTER materialise returns and gates with `materialised_ref IS NOT NULL` via `updateMany` (the PRODUCT-1 race fix at `ai-approval.service.ts:194-267`). On materialise failure the draft stays `pending` for retry (`:153-184`).

**Critical:** Path B never creates a `WorkoutPlan` — it only assigns an EXISTING coach-owned plan. Path A is the only AI path that creates a plan.

### Capabilities registered
`assign_meal_plan.materialiser.ts`, `assign-workout.materialiser.ts`, `coach-message.materialiser.ts`, `send-notification.materialiser.ts` are all registered into `CAPABILITY_MATERIALIZERS` (`capability-materialiser.registry.ts:12`). There is no `draft.create_workout_plan` / `draft.edit_workout_plan` / `draft.build_workout` capability today — AI cannot author plan content through the gateway.

---

## 5. Authorization model

### Guards in scope

- **`JwtAuthGuard`** (`src/auth/auth.guard.ts:62-180`): registered globally as `APP_GUARD`. Verifies Supabase ES256 JWT via JWKS; loads `User` and sets `req.user`; GDPR lifecycle gate (`auth.guard.ts:120-133`); emits `app_open` PTM signal.
- **`RolesGuard`** (`src/auth/roles.guard.ts:39-60`): reads `@Roles(…)` reflector key. Hierarchy `owner > coach > student` (`roles.guard.ts:67-75`). `owner` is a TOTAL bypass for any `@Roles` gate.
- **`CoachGuard`** (`src/auth/coach.guard.ts:4-18`): 18 lines; `role === 'coach' || role === 'owner'`. Used by `/coach/ai/*` (`coach-ai.controller.ts:43`). **Does not differentiate head vs sub coach.**
- **`ClientEntitlementGuard`** (`src/common/guards/client-entitlement.guard.ts:7-55`): only enforces for `role==='student'`; requires a non-expired `ClientPurchase` row with `status ∈ {paid,active,trialing}` and `entitlement_active=true`. Returns **HTTP 402** with `{error:'CLIENT_ENTITLEMENT_REQUIRED', action:'OPEN_PLANS'}`. Used by `AssignmentController` (`workout-builder.controller.ts:241`).
- **`SubscriptionGuard`** (`src/billing/subscription.guard.ts:83-…`): tier-based gate via `@RequiresTier('pro')`. Owners bypass. `past_due` allowed during 7-day grace (`subscription.guard.ts:51`). `BILLING_ENFORCEMENT=enforce` env toggles enforce vs observe-only.
- **`OwnerGuard`** (`src/common/guards/owner.guard.ts`): `role === 'owner'` only, used for the admin exercise-catalog write surface.

### Stack actually applied to workout-builder

- `WorkoutBuilderController` (`/workout-plans`): `JwtAuthGuard, RolesGuard` + `@Roles('coach','owner')`. **NO `SubscriptionGuard` and NO `@RequiresTier`.** A free-tier coach can use the workout builder. (Contrast with `/coach/ai/*` which IS Pro-only.)
- `AssignmentController` (`/assignments`): `JwtAuthGuard, ClientEntitlementGuard`. No role gate.

### Sub-coach access enforcement

**Gap.** `SubCoachAssignment` exists in schema (`schema.prisma:3947-3964`) and `SubCoachScopeService.canAccessClient` is the canonical authoritative scope check (`sub-coach/sub-coach-scope.service.ts:105-108`). But the workout-builder service uses ONLY direct `User.coach_id` equality:

- `assertPlanOwnership` (`workout-builder.service.ts:763-767`) — checks `plan.coach_id === coachId`. A sub-coach assigned a client cannot edit the head coach's plans (probably correct), but the head coach still owns the plan rows. There is no "edit-on-behalf" path for sub-coaches.
- `assertClientBelongsToCoach` (`workout-builder.service.ts:769-774`) — `client.coach_id === coachId`. Since `User.coach_id` always points at the HEAD COACH (`schema.prisma:3941-3945` comment), a sub-coach cannot assign a workout to a client even if they hold an open `SubCoachAssignment` row. This is the 50-Failures #5 (IDOR) / #9 (privilege escalation) shape: scoping is at the *route layer* (RolesGuard) and the direct-FK *service-layer check* only — there is no data-layer (RLS or query-builder) sub-coach scope check. A future controller that forgot `assertClientBelongsToCoach` would have no second line of defence.

Workout-builder does NOT import `SubCoachScopeService` (grep returned no matches).

### Tenant boundary at the materialiser

`AssignWorkoutMaterializer.materialize` (`assign-workout.materialiser.ts:99-256`) is the only place that re-checks at the trust boundary on approval:
- Layer 3 role re-check at approval time (`:114-135`).
- Plan-coach tenant match against `draft.tenant_coach_id` (`:181-188`).
- These run inside a transaction with the assignment INSERT.

But it does NOT check `clientId` membership against the coach — it trusts the gateway's payload (which trusted the draft creator's chat context). If a coach asks the AI to assign a workout to "their client X" and X migrated to another head coach mid-draft, the materialiser would let the assignment land.

---

## 6. Concurrency / persistence primitives

### Idempotency
- `WorkoutBuilderIdempotencyKey` model (`schema.prisma:2072-2089`) + `withIdempotency` (`workout-builder.service.ts:144-225`): the only general-purpose idempotency in this module. Race-safe: `status='in_progress'` is the lock.
- Per-assignment completion idempotency: `ClientWorkoutAssignment.completion_idempotency_key` (`schema.prisma:2051`) + atomic `updateMany WHERE completed_at IS NULL` (`workout-builder.service.ts:719-734`).
- `ai_draft_id @unique` on `ClientWorkoutAssignment` (`schema.prisma:2060`) — schema-level single-emit for AI path.
- `AiActionDraft.materialised_ref + materialised_at` (`schema.prisma:2289-2293`) — gateway PRODUCT-1 race guard. Coach AI v1 `AIDraft` has no equivalent (single-shot status flip).

### Transactions / locking
- `setExercises` (`workout-builder.service.ts:442-504`) uses Prisma `$transaction` with `IsolationLevel.Serializable` plus `SELECT … FOR UPDATE` on the `WorkoutPlan` row to serialise against concurrent `assignPlan`. This is the only `FOR UPDATE` in the workout-builder module.
- `archivePlan` (`workout-builder.service.ts:373-378`) — atomic conditional `updateMany WHERE archived_at IS NULL`, no transaction needed.
- `completeAssignment` (`workout-builder.service.ts:719-734`) — atomic conditional `updateMany WHERE completed_at IS NULL`.

### Optimistic locking / version columns
**None.** `WorkoutPlan` has `updated_at @updatedAt` but no integer `version`, no `etag` / `lock_token`. Two concurrent metadata PATCHes are not detected — last-write-wins. Two concurrent `setExercises` are serialised by the row lock (`service.ts:448-452`) but the second still hits the 409 active-assignment check or wipes the first's rows.

### Existing autosave endpoint
**None.** No PATCH-row, no `/draft`, no incremental save. The PATCH `/workout-plans/:planId` route covers metadata only (`name`, `type`, `duration_estimate_minutes`); the exercises array uses PUT bulk-replace gated by the 409 active-assignment check.

---

## 7. Gaps for "Master Workout Builder + Build-with-AI + real undo/autosave"

Concrete backend pieces that are MISSING today:

### a. Versioning / revision history (for real undo)
- No `WorkoutPlanRevision` (or `WorkoutPlanVersion`) table to snapshot prior states of a plan + its exercises.
- No `parent_version_id` or monotonic `version` column on `WorkoutPlan` or `WorkoutPlanExercise`.
- The only history we keep is `WorkoutPlanExercise.archived_at` — but that conflates "soft-deleted because plan was edited" and "soft-deleted because previously-assigned snapshot" and gives no per-edit grouping; you cannot reconstruct "what did the plan look like 3 edits ago".
- Required design pieces: a per-edit revision row with the full exercise array snapshot, a "current head revision" pointer on `WorkoutPlan`, and an undo endpoint that creates a NEW revision rolled back to a target snapshot (so the undo itself is auditable).

### b. Autosave
- No PATCH-row endpoints on individual exercises (`PATCH /workout-plans/:planId/exercises/:rowId` does not exist). The only mutator is whole-array PUT.
- No autosave endpoint at all (e.g. `PATCH /workout-plans/:planId/autosave` for incremental coach edits while the builder UI is open).
- No client-supplied `lock_token` / `version` for optimistic concurrency on partial edits. Coach A and Coach B (or two devices) editing simultaneously would currently collide either at the PUT call (one wins, no merge) or at the 409 active-assignment gate (neither wins if a client was already assigned).
- Required: an explicit `WorkoutPlanDraft` (or per-row PATCH path keyed by row uuid + version) so the mobile builder can persist edits as the coach taps, with conflict detection.

### c. Program / multi-week structure
- There is no `WorkoutProgram` (or `WorkoutBlock` / `TrainingWeek`) parent table. A "program" in the Coach AI v1 flow is N independent `WorkoutPlan` rows whose names happen to include `WxDy`. There is no FK linking the days back to a single program parent.
- `WorkoutProgramPayload` (`workout-program.prompt.ts:40-46`) has the right shape in transit (`weeks`, `days_per_week`, `days[]`) but the materialiser flattens it (`coach-ai.service.ts:281-315`). Programmatic operations like "reassign all 12 weeks", "archive the whole program", "show this client's current program week" are not possible.
- Required: a `WorkoutProgram` model with `coach_id`, `name`, `weeks`, `days_per_week`; `WorkoutPlan.program_id` FK + `week_index` + `day_index`; and an assignment surface that schedules an entire program (`POST /workout-programs/:id/assignments` that fans out into per-day `ClientWorkoutAssignment` rows).

### d. Reusable template library distinct from per-client plans
- Today every `WorkoutPlan` is coach-owned and consumed by being assigned to a client. There is no "master / template" flag — the spec name "Master Workout Builder" implies a coach-owned library of reusable masters that get cloned to client-specific plans.
- The legacy `WorkoutRoutine.is_template` flag exists (`schema.prisma:811`) but lives in the disconnected client-logging module and is not surfaced for write through any DTO.
- Required: `WorkoutPlan.is_template: Boolean` (or a separate `MasterWorkoutPlan` model) + a "clone master to client plan" service method that copies plan + exercises with a fresh id and a `cloned_from_master_id` FK so usage analytics work.

### e. Build-with-AI surface on the master builder
- The current AI surface (`/coach/ai/workout-program`) is a "generate-N-plans-and-immediately-create-them" path. It does not produce a single editable master that the coach iterates on; the AIDraft is whole-object replace via `editDraft`. There is no "AI suggests a single exercise to add", "AI swaps one exercise for an injury-safe variant", "AI scales the volume of this week" sub-capability.
- Required: per-edit AI capabilities (e.g. `draft.suggest_exercise_swap`, `draft.scale_block_volume`) that target a single `WorkoutPlan` (or a single revision range) and produce reviewable diffs rather than whole-program rewrites.

### f. Sub-coach scoping at the data layer
- `assertClientBelongsToCoach` (`service.ts:769-774`) is direct `User.coach_id` only — a sub-coach with an open `SubCoachAssignment` for a client cannot assign workouts to that client. Either the workout-builder service should consult `SubCoachScopeService.canAccessClient` OR the queries should be expressed as the union "head-coach roster ∪ open sub-coach assignments" via a Prisma view / raw SQL helper. Same gap on the AI path (`coach-ai.service.ts:59-65`).
- 50-Failures #5/#9: scoping is enforced only at the service layer with a single direct FK check; if a new controller route forgot the call, there would be no second line of defence (RLS not used here).

### g. AI plan-creation under the gateway approval surface
- Today, AI-created plans land via `coach-ai.service.ts:approveDraft` (inline materialisation, no `CapabilityMaterializerRegistry`, no `materialised_ref/materialised_at` race guards). Migrating to a `draft.create_workout_plan` (and `draft.edit_workout_plan`) capability on the gateway would give the same PRODUCT-1 race protections that `draft.assign_workout` already enjoys, and unify the approval inbox.
- Currently coach reviews TWO inboxes: `/coach/ai/drafts` (Coach AI v1 generation) and `/ai/gateway/drafts` (Stream 2 capability proposals).

### h. Coach approval of client submissions (`approved_by_coach_at`)
- Column exists on `ClientWorkoutAssignment` (`schema.prisma:2054`) and is even indexed (`@@index([assigned_by_coach_id, approved_by_coach_at])`), but there is no controller endpoint or service method that writes it. The "coach reviews completed workout and approves" half of R43 has schema but no API yet.

### i. Push on coach-driven assignment
- `WorkoutBuilderService.assignPlan` does NOT fire any notification. Only the AI materialiser sends `WORKOUT_ASSIGNED` (`assign-workout.materialiser.ts:228-253`). A coach who manually assigns via PATCH path leaves the client to discover it via polling `/assignments/me`.

### j. Snapshot-at-assignment-time
- Read path joins live exercises (`service.ts:618-627`). The current "snapshot" is implicit (the 409 gate that refuses edits while there are active assignments). A real master/template builder needs to copy exercise rows into a per-assignment immutable snapshot at assign time, so the master can keep evolving while assigned clients keep their as-given workout.

---

## Quick map of the most critical files

| Area | Path | Key lines |
|---|---|---|
| Coach plan CRUD + assignments | `src/workout-builder/workout-builder.service.ts` | 144 (idem), 408 (setExercises), 511 (assignPlan), 686 (completeAssignment), 763-774 (auth helpers) |
| Coach plan controller | `src/workout-builder/workout-builder.controller.ts` | 81 (idem header), 99-101 (guards), 230-298 (assignment controller) |
| DTOs / validation | `src/workout-builder/workout-builder.dto.ts` | 37 (CreatePlan), 73-119 (UpsertExerciseRow), 148-184 (CompleteAssignment) |
| Prisma — plan/exercise/assignment | `prisma/schema.prisma` | 1993-2066 |
| Prisma — AI drafts | `prisma/schema.prisma` | 2265-2354 |
| Prisma — sub-coach | `prisma/schema.prisma` | 3947-3990 |
| AI workout-program generation | `src/ai/coach/coach-ai.service.ts` | 67-105 (generate), 253-316 (approve+materialize) |
| AI assign-workout capability | `src/ai/gateway/materialisers/assign-workout.materialiser.ts` | 57-83 (zod), 99-256 (materialize) |
| AI approval state machine | `src/ai/gateway/ai-approval.service.ts` | 75-302 (decide with race-guards) |
| Guards — JWT | `src/auth/auth.guard.ts` | 62-180 |
| Guards — Roles | `src/auth/roles.guard.ts` | 39-75 |
| Guards — Coach | `src/auth/coach.guard.ts` | 4-18 |
| Guards — ClientEntitlement | `src/common/guards/client-entitlement.guard.ts` | 7-55 |
| Guards — Subscription | `src/billing/subscription.guard.ts` | 83-… |
| Sub-coach scope service | `src/sub-coach/sub-coach-scope.service.ts` | 50-108 |

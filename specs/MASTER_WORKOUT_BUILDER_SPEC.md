# Master Workout Builder — Deep Engineering & UX Spec

**Stream 3 · TGP (The Growth Project)** — NestJS backend + React Native (Expo) mobile.
Author: Dynasia G. Status: **DRAFT for build sequencing**. Date: 2026-05-28.

This spec is the authoritative build plan for the Master Workout Builder: a coach-owned
reusable program/template system, a Build-with-AI **live create** capability (coach-editable
diffs, not a chat), real **undo** via revision history, and **Google-Docs-style autosave** — all
held to the **Everfit competitive bar**, the **50-Failures auditor gate**, and the **quiet-luxury**
design system.

Grounded in two read-only inventories committed to R64:
- `specs/BACKEND_WORKOUT_INVENTORY.md` (362 lines)
- `specs/MOBILE_WORKOUT_INVENTORY.md` (507 lines)

All `file:line` citations below are relative to the inventoried snapshots
(`growth-project-backend-27454ddb/`, `growth-project-mobile-e086da42/`) and remain valid
against `origin/main` @ `d8698b77` per `specs/ISSUE_VERIFICATION_RESULTS.md`.

---

## 0. Why this exists (north-star tie-in)

North star: **3 / 10 coaches reach Activated**. ICP = trainers billing **$2K–$8K/mo, 10–40 clients**.

A coach at 10–40 clients lives or dies on **programming throughput**: how fast they can build a
good multi-week program once and reuse it across many clients without losing the per-client
nuance. Today TGP cannot do this — every `WorkoutPlan` is a flat, single-week, one-shot artifact
with no template concept, no week/day structure on the persisted plan, no autosave, no undo, and a
sub-coach who legitimately owns a client **cannot even assign a workout to them**
(`workout-builder.service.ts:769-774`). That is an activation blocker, not a polish item.

The Master Workout Builder closes the gap to Everfit (Program Builder + Master Planner grid + AI
paste-to-trackable) **and** overtakes it on the three things Everfit does poorly: real undo, true
instantaneous autosave, AI that live-creates a coach-editable program (not a chatbot), wrapped in
quiet-luxury UX with **sub-coach-scoped permissions** that Everfit has no equivalent of.

---

## 1. Scope

### In scope
1. **Master / template data model** — a `WorkoutProgram` parent + `WorkoutPlan.is_template` +
   clone-to-client + snapshot-at-assignment (§3).
2. **Build-with-AI LIVE create** — `draft.create_workout_plan` / `draft.edit_workout_plan`
   gateway capabilities producing reviewable diffs, materialised through the
   `CapabilityMaterializerRegistry` (§4).
3. **Real undo** — `WorkoutPlanRevision` table + an auditable rollback endpoint (§5).
4. **Google-Docs autosave** — `PATCH`-row / draft-autosave endpoint with optimistic concurrency
   (`version` / `lock_token`) + a reusable mobile `useAutosave` hook + "Saving / Saved / Offline"
   pill (§6).
5. **Coach ↔ sub-coach parity** — wire `SubCoachScopeService.canAccessClient` into the workout
   builder; closes SC-2 / EFF-3 / the IDOR shape (§7).
6. **RLS second line of defence** (50-Failures #2 / #5) on all new tables (§7.4).
7. **UI/UX** per the quiet-luxury design system — pages, navigation page-paths, interaction model
   (§8).
8. **Everfit parity+ matrix** baked in (§9).

### Out of scope (explicit non-goals for this stream)
- Real-time multi-coach collaborative cursors / presence (we ship *conflict-safe* concurrent edit
  via optimistic concurrency, not live co-editing; see §6.5 "deferred").
- Migrating the legacy client-owned `/routines` system (`workout.module.ts`, §2 of backend
  inventory) — it stays a parallel system; we only stop *adding* to it.
- Wearables (Stream 4).
- The broader open security/data backlog (A1/A3/A7/B5/B7/CC-*/LTV-*) — tracked separately in
  `audits/issue-registers-2026-05/OPEN_ISSUES_PRUNED_2026-05-28.md`. This spec only *fixes the
  subset that the Master Builder touches*: the sub-coach scope gap (SC-2/EFF-3-adjacent) and adds
  RLS where new tables are introduced.

---

## 2. Current-state summary (the starting line)

From the inventories — what we are building *on top of*:

**Backend (`src/workout-builder/*`):**
- `WorkoutPlan` (schema.prisma:1993) — flat, `archived_at` soft-delete, **no** `version`,
  **no** `is_template`, **no** program parent.
- `WorkoutPlanExercise` (schema.prisma:2010) — `superset_group_id` exists, partial-unique
  `(plan, order) WHERE archived_at IS NULL`.
- `ClientWorkoutAssignment` (schema.prisma:2035) — `ai_draft_id @unique`, `approved_by_coach_at`
  column exists but **no endpoint** writes it.
- `setExercises` = **PUT bulk-replace** under `Serializable` + `FOR UPDATE`; **409s** if an active
  assignment exists (`service.ts:461-472`). `withIdempotency` is race-safe (`service.ts:144-225`).
- Two AI paths: **Path A** (`/coach/ai/workout-program`, `claude-sonnet-4-6`) where `approveDraft`
  **does live-create N WorkoutPlans inline** — NOT via the registry (`coach-ai.service.ts:272-316`);
  **Path B** (gateway `draft.assign_workout`) only **assigns an existing** plan. **No
  `draft.create_workout_plan` capability exists.**
- **Sub-coach gap:** `assertClientBelongsToCoach` / `assertPlanOwnership` use direct
  `User.coach_id` only (`service.ts:763-774`); never consult `SubCoachScopeService.canAccessClient`
  (the canonical check, `sub-coach-scope.service.ts:105-108`).
- **No** autosave / PATCH-row / version / revision / undo. **No** snapshot-at-assignment (reads
  live exercises, `service.ts:618-627`). **No** push on coach-driven assign (only the AI
  materialiser pushes, `assign-workout.materialiser.ts:228-253`).

**Mobile (`src/screens/coach/*`):**
- `CoachWorkoutBuilderScreen` — flat list, Up/Down buttons (no DnD), **explicit Save** via
  PUT-replace-all, **no** autosave / dirty-guard (`CoachWorkoutBuilderScreen.tsx:14-17, 391`).
- `AIWorkoutDraftScreen` — edits weeks→days→exercises, approve-while-dirty modal
  (`AIWorkoutDraftScreen.tsx:214-241`).
- `ActiveWorkoutScreen` has the **debounced-AsyncStorage autosave** pattern to model `useAutosave`
  on (`ActiveWorkoutScreen.tsx:361-384`, `PERSIST_DEBOUNCE_MS=500`).
- "Templates" tab = **guidelines-only**, not workouts (`ProgramTemplatesScreen.tsx:155-159`).
- **No** DnD / undo / `onMutate`-rollback / inline-AI / supersets-UI / weight-UI.
- Theming split: new screens use `semanticColors`/`tokens.ts`; older use flat `ThemeColors`.
  **Standardize on `semanticColors`.**

**Everfit bar (target):**
- AI paste → trackable workout ~2s (parses sets/reps/weight/set-types, supersets `1A/1B`,
  auto-creates exercises).
- Multi-week **Program Builder** (assign to multiple clients).
- **Master Planner** grid (copy/paste across weeks, drag-drop).

**TGP outperform:** real undo + true autosave + AI live-create coach-editable + quiet-luxury UX +
**sub-coach scoped perms** (Everfit has no equivalent).

---

## 3. Master / Template Data Model

### 3.1 Design decision: parent `WorkoutProgram` + `is_template` on `WorkoutPlan`

We model the hierarchy as **Program → Plan (= a day) → Exercise**, where a Program spans multiple
weeks and each Plan is one training day within a `(week_index, day_index)` slot. This matches both
the AI payload shape that already exists in transit (`WorkoutProgramPayload`:
`weeks × days_per_week × days[]`, `workout-program.prompt.ts:40-46`) and Everfit's
"Program → Week → Day → Exercise" mental model.

We deliberately **reuse `WorkoutPlan` as the "day"** rather than inventing a new `WorkoutDay`
table, because `WorkoutPlan` already carries the exercise relation, the assignment relation, the
soft-delete, the idempotency wiring, and the ownership checks. Adding a parent FK + two index
columns is far lower-risk than a parallel hierarchy.

**Template vs instance** is a boolean flag on the plan and program, not a separate table — this
keeps the clone path trivial (copy rows, flip the flag) and lets analytics join through one table.

```prisma
// NEW
model WorkoutProgram {
  id              String    @id @default(uuid())
  coach_id        String    // FK User, onDelete Cascade — the OWNING (head) coach tenant
  name            String
  description     String?
  weeks           Int       // 1..52
  days_per_week   Int        // 1..7
  is_template     Boolean   @default(true)   // master library entry vs per-client instance
  cloned_from_id  String?   // self-FK: instance points back at the master it was cloned from
  goal_tag        String?   // 'fat_loss'|'lean_bulk'|'recomp'|'maintenance'|'mobility'|null
  version         Int       @default(1)      // optimistic-concurrency token (see §6.4)
  head_revision_id String?  // FK WorkoutProgramRevision (see §5) — "current" snapshot pointer
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  archived_at     DateTime?
  plans           WorkoutPlan[]
  revisions       WorkoutProgramRevision[]
  @@index([coach_id, is_template, archived_at, updated_at(sort: Desc)])
  @@index([coach_id, cloned_from_id])
}

// MODIFY model WorkoutPlan (schema.prisma:1993) — ADDITIVE columns only
//   program_id        String?   // FK WorkoutProgram, onDelete Cascade (null = legacy standalone)
//   week_index        Int?      // 0-based; null for standalone plans
//   day_index         Int?      // 0-based within the week
//   is_template       Boolean   @default(false)  // mirrors program for fast filtering
//   version           Int       @default(1)      // per-plan optimistic-concurrency token
//   head_revision_id  String?   // FK WorkoutPlanRevision — current head snapshot pointer
//   cloned_from_plan_id String? // provenance for clone-to-client analytics
//   @@index([program_id, week_index, day_index])
//   @@index([coach_id, is_template, archived_at])
```

Migration is **additive and backward-compatible**: every existing plan keeps `program_id = null`,
`is_template = false`, `version = 1` and continues to behave exactly as today. The flat
`CoachWorkoutBuilderScreen` path remains valid for one-off "quick plans".

### 3.2 Clone-to-client (master → instance)

New service method `WorkoutBuilderService.cloneProgramToClient(masterProgramId, clientId, opts)`:

1. Authorize via the **new scope check** (`§7`): the requesting coach must `canAccessClient`.
2. In a single `$transaction` (`IsolationLevel.Serializable`):
   - Insert a new `WorkoutProgram` row with `is_template=false`, `cloned_from_id=masterProgramId`,
     copying `weeks`/`days_per_week`/`goal_tag`.
   - For each template `WorkoutPlan` under the master, insert a clone with fresh ids,
     `is_template=false`, `cloned_from_plan_id` set, same `(week_index, day_index)`.
   - For each `WorkoutPlanExercise`, copy the row (fresh id, same `order`, `superset_group_id`
     re-mapped to the new plan's namespace).
   - Write the initial `WorkoutPlanRevision` head for each instance plan (§5) so undo has a
     baseline.
3. Return the new program + its plans.

The clone is a **deep copy by value**, not a reference: editing the master later never mutates an
already-cloned client instance. This is the inverse of today's "reuse by assigning the same plan to
many clients" model, and it is what lets a coach keep refining a master without disturbing clients
mid-program.

### 3.3 Snapshot-at-assignment (immutability for the client)

Gap (j) in the backend inventory: today the client read path joins **live** exercises
(`service.ts:618-627`), and the only protection is the 409 gate that refuses edits while an active
assignment exists. That is brittle (it blocks the coach) and wrong for a template model (the master
must keep evolving).

**Decision: snapshot exercise rows into the assignment at assign time.**

```prisma
// NEW
model ClientWorkoutAssignmentSnapshot {
  id             String   @id @default(uuid())
  assignment_id  String   @unique  // FK ClientWorkoutAssignment, onDelete Cascade
  plan_name      String
  plan_type      WorkoutPlanType
  exercises_json Json     // frozen, ordered array of the exercise rows as-assigned
  source_plan_id String   // provenance
  source_version Int      // the WorkoutPlan.version at assign time
  created_at     DateTime @default(now())
}
```

- `assignPlan` and the AI `assign-workout` materialiser both write a snapshot row inside their
  existing transaction.
- `GET /assignments/me` and `GET /assignments/:id` read from the snapshot, **not** live exercises.
- This **removes the 409-on-edit-while-assigned restriction** (`service.ts:461-472`) — the coach
  can freely edit the master/plan after assigning because clients hold a frozen snapshot. (Keep a
  `Serializable` guard only against two concurrent `setExercises` on the same plan, not against
  assignments.)
- Backward-compat: assignments created before this migration have no snapshot row; the read path
  falls back to the live-join exactly as today when `snapshot IS NULL`.

This is a **net UX win + correctness win + unblocks the coach** — the single highest-leverage
backend change in the spec.

### 3.4 Program-level assignment fan-out

New `POST /workout-programs/:id/assignments` → for each plan in the program, create a
`ClientWorkoutAssignment` + snapshot, scheduling `scheduled_for` by `week_index`/`day_index` offset
from a `start_date`. One idempotency key covers the whole fan-out (claim once, emit N rows in one
transaction). Mirrors Everfit "assign program to client(s)".

---

## 4. Build-with-AI — LIVE create, coach-editable diffs (NOT a chat)

### 4.1 The problem with both current AI paths

- **Path A** (`coach-ai.service.ts:272-316`): `approveDraft` **inline-creates** N `WorkoutPlan`
  rows, bypassing the `CapabilityMaterializerRegistry` and therefore missing the PRODUCT-1 race
  guards (`materialised_ref`/`materialised_at`) that `draft.assign_workout` enjoys
  (`ai-approval.service.ts:194-267`). It is a whole-program rewrite via `editDraft` (whole-object
  merge), not a surgical edit.
- **Path B**: only **assigns an existing** plan. AI cannot author plan content through the gateway.
- Coaches juggle **two inboxes** (`/coach/ai/drafts` and `/ai/gateway/drafts`).

### 4.2 Decision: new gateway capabilities, diff-based, registry-materialised

Add two capabilities to `CAPABILITY_MATERIALIZERS` (`capability-materialiser.registry.ts:12`),
alongside the existing five:

| Capability | Proposed action payload | Materialiser effect |
|---|---|---|
| `draft.create_workout_plan` | `{ programId?, name, type, week_index?, day_index?, exercises[] }` | Creates ONE `WorkoutPlan` (+ exercises) under the registry, with `materialised_ref` race guard. Optionally attaches to an existing `WorkoutProgram`. |
| `draft.edit_workout_plan` | `{ planId, baseVersion, ops[] }` where `ops` = a JSON-patch-style diff (`add_exercise`/`remove_exercise`/`reorder`/`set_field`/`swap_exercise`/`scale_block`) | Applies the diff to an existing plan under optimistic concurrency (`baseVersion` must match `WorkoutPlan.version`), creating a `WorkoutPlanRevision` (§5). |

Both:
- Go through `AiGatewayService.invoke` → create an `AiActionDraft` row (schema.prisma:2265) with
  zod-validated payload, `tenant_coach_id`, `expires_at` — same machinery as `assign_workout`.
- Are **reviewed as a diff**, not approved blind. The coach opens the draft and sees a
  **before/after** rendering (added rows highlighted, removed rows struck, reordered rows badged).
- Materialise via `AiApprovalService.decide` → registry → the new materialiser, which runs the
  same layer-3 role re-check, payload re-validation, tenant match, and `materialised_ref`
  single-emit guard the `assign-workout` materialiser already does
  (`assign-workout.materialiser.ts:114-220`).

### 4.3 "Live create" + "coach-editable" — the interaction contract

- **Live create** means: the coach taps "Build with AI", the model proposes a full program, and on
  approval the plans/exercises are **materialised into real editable `WorkoutPlan` rows** that the
  coach can immediately keep editing in the same builder (with autosave + undo). It is NOT a
  read-only chat transcript and NOT a one-shot black box.
- **Coach-editable diffs** means: AI *edits* (`draft.edit_workout_plan`) are proposed as a diff the
  coach can accept whole, accept partially (per-op toggles in the review sheet), or reject — then
  the accepted ops apply through the normal autosave/revision path so they are **undoable** like
  any manual edit.
- The model stays pinned to `claude-sonnet-4-6` (`coach-ai.constants.ts:14`); cost disclosure
  (tokens in/out, cents) carries through to the diff review footer exactly as
  `AIWorkoutDraftScreen.tsx:434-438` does today. `CoachAIBudgetService.canCharge` gates pre-call
  (already wired, A2 FIXED).

### 4.4 Migrating Path A

Re-point `coach-ai.service.ts:approveDraft` for `WORKOUT_PROGRAM` drafts to **emit
`draft.create_workout_plan` actions per day through the gateway** instead of inline-creating. This:
- Unifies the approval inbox (one `/ai/gateway/drafts`).
- Inherits the PRODUCT-1 race protections.
- Is sequenced as a **follow-on** (4.4 lands after 4.2/4.3 are stable) to avoid destabilising the
  one working AI-create path. Until then, Path A stays as-is behind a feature flag.

### 4.5 Per-exercise inline AI (the Everfit-beating affordance)

The diff capability unlocks **surgical** AI actions the manual builder exposes inline (mobile gap
#9): "swap this exercise for an injury-safe variant", "scale week 3 volume −10%", "add a finisher
to day 2". Each is a `draft.edit_workout_plan` with a single op, reviewed as a one-line diff. This
is the thing Everfit's whole-plan AI cannot do.

---

## 5. Real undo — revision history (auditable rollback)

### 5.1 Decision: append-only revision table + head pointer

Backend gap (a): no revision table, the only history is `archived_at` which conflates "edited" and
"previously-assigned snapshot" and gives no per-edit grouping.

```prisma
// NEW
model WorkoutPlanRevision {
  id             String   @id @default(uuid())
  workout_plan_id String  // FK WorkoutPlan, onDelete Cascade
  revision_index Int      // monotonic per plan, 1..N
  exercises_json Json     // full ordered snapshot of exercise rows at this revision
  plan_meta_json Json     // { name, type, duration_estimate_minutes }
  author_id      String   // who made this revision (coach or sub-coach user id)
  author_kind    String   // 'coach'|'sub_coach'|'ai'
  cause          String   // 'manual_edit'|'autosave'|'ai_apply'|'undo'|'clone'|'initial'
  created_at     DateTime @default(now())
  @@unique([workout_plan_id, revision_index])
  @@index([workout_plan_id, created_at(sort: Desc)])
}

// NEW (program-level, for program-wide structural ops)
model WorkoutProgramRevision {
  id             String   @id @default(uuid())
  program_id     String   // FK WorkoutProgram, onDelete Cascade
  revision_index Int
  structure_json Json     // weeks/days_per_week/plan-slot layout snapshot
  author_id      String
  author_kind    String
  cause          String
  created_at     DateTime @default(now())
  @@unique([program_id, revision_index])
}
```

- `WorkoutPlan.head_revision_id` points at the current head; `version` increments on every commit.
- Every committing mutation (`setExercises`, the autosave flush, an AI diff apply, a clone) writes a
  revision **inside its transaction**, then advances `head_revision_id` + `version`.
- **Undo is itself a revision.** `POST /workout-plans/:planId/undo` (body: `{ toRevisionIndex }`)
  reads the target snapshot, writes a NEW revision with `cause='undo'` whose content equals the
  target, and advances the head. This keeps the timeline append-only and fully auditable — you can
  always see "coach undid to revision 4 at 14:02".
- **Redo** = undo to a later revision index (no separate machinery).

### 5.2 Retention / pruning

- Keep the **last 50 revisions per plan** + all revisions from the last 30 days, whichever is
  larger. Older interior revisions are pruned by a nightly cron (the `initial` and any `clone`
  revisions are never pruned, to preserve provenance). Pruning never deletes the head or anything
  reachable by an outstanding `cloned_from` reference.

### 5.3 Mobile undo model

Mobile gap #3: no command history anywhere. The mobile undo stack is a **thin client mirror** over
the server revisions:
- Local working copy holds an in-memory `Action[]` stack for instant Cmd-Z (two-finger swipe / a
  visible toolbar undo button) — sub-100ms, optimistic.
- The local stack is reconciled against server revisions on each autosave round-trip; the server
  revision list is the durable source of truth (survives app kill, cross-device).
- Undo's source of truth is the **local working copy**, applied optimistically, then confirmed by
  the server undo endpoint (rolls back via `onError` if the server rejects on a version conflict).

---

## 6. Google-Docs-style autosave

### 6.1 The wire problem

Backend gap (b) + mobile gap #16: the only mutator for exercises is **`PUT` replace-all**
(`workoutBuilderApi.ts:125-126`), gated by the 409-active-assignment check. Instantaneous autosave
on a replace-all endpoint would saturate the wire and collide.

### 6.2 Decision: an explicit draft-autosave endpoint with diff ops + optimistic concurrency

```
PATCH /workout-plans/:planId/autosave
  Headers: Idempotency-Key (required, per the existing RequiredIdempotencyKey decorator)
  Body: {
    baseVersion: number,          // client's last-known WorkoutPlan.version
    ops: AutosaveOp[],            // ordered diff since baseVersion
    clientEditId: string          // ULID for client-side dedup/ordering
  }
  → 200 { version, headRevisionId, appliedOps }      // success, advances version
  → 409 { currentVersion, serverOps }                // conflict: server moved ahead
```

`AutosaveOp` (zod-validated, mirrors `UpsertExerciseRowDto` bounds, `dto.ts:73-119`):
`add_row | remove_row | reorder | set_field(field, value) | set_superset(group_id)`.

- The endpoint applies ops under a `Serializable` transaction with `SELECT … FOR UPDATE` on the
  plan row (reuse the `setExercises` pattern, `service.ts:442-504`), validates `baseVersion ===
  plan.version` (optimistic concurrency), writes a `WorkoutPlanRevision` (`cause='autosave'`),
  advances `version` + `head_revision_id`, and returns the new version.
- On `baseVersion` mismatch → **409 with the server-side ops** the client is missing, so the client
  can rebase its local ops (or, for the common single-editor case, fast-forward).
- This **coexists** with the existing `PUT` replace-all (kept for the "explicit big save" and the
  legacy flat builder). Autosave is the incremental fast path.

### 6.3 Reusable mobile `useAutosave` hook

Mobile gap #2/#14: no reusable autosave hook, no save-state UI. Build:

```ts
useAutosave<TWorkingCopy>({
  value: workingCopy,
  diff: (prev, next) => AutosaveOp[],          // compute ops since last flush
  flush: (ops, baseVersion) => api.autosave(planId, { ops, baseVersion, ... }),
  debounceMs: 800,                              // typing debounce (longer than the 500ms session one)
  onConflict: (serverOps) => rebaseLocal(serverOps),
})  → { status: 'idle'|'saving'|'saved'|'offline'|'conflict', lastSavedAt, version }
```

- Modeled on `ActiveWorkoutScreen.tsx:361-384` (debounced persist + force-flush on AppState
  background, `L307-352`) but pointed at the **server** with idempotency keys + an **offline mirror**
  in AsyncStorage so edits survive an app kill and replay on reconnect (reuse the sync-engine
  dead-letter pattern from `offline/sync/sync-engine.ts:46-60`).
- Force-flush on background and on `beforeRemove` (also satisfies the dirty-guard gap #12).

### 6.4 Optimistic concurrency tokens

Backend gap: `WorkoutPlan` has `updated_at` but no `version`/`lock_token`. Add `version Int`
(§3.1). Every committing write checks-and-increments it. Two devices / two coaches editing the same
plan are detected at the autosave 409 boundary and rebased — last-write-wins is eliminated for the
exercise array.

### 6.5 Save-state UI + deferred collaboration

- A header pill: **"Saved · 2s ago" / "Saving…" / "Offline — will sync" / "Edited elsewhere —
  refreshing"** (the conflict case). Reuse `OfflineBanner` styling but per-screen.
- **Deferred (non-goal this stream):** live presence / cursors / `last_edited_by` avatars. The
  optimistic-concurrency 409 path makes concurrent editing *safe* (no lost writes) without the
  complexity of real-time co-editing. We ship safety now, presence later.

---

## 7. Coach ↔ sub-coach parity with scoped permissions

### 7.1 The gap (security-relevant)

Backend inventory §5 + SC-2/EFF-3 in the verification results: the workout-builder service uses
**only** direct `User.coach_id` equality (`assertClientBelongsToCoach`, `service.ts:769-774`;
`assertPlanOwnership`, `service.ts:763-767`). Since `User.coach_id` always points at the **head
coach** (`schema.prisma:3941-3945`), a sub-coach holding a legitimate open `SubCoachAssignment`
**cannot assign a workout to their own client**. The canonical scope check
`SubCoachScopeService.canAccessClient` (`sub-coach-scope.service.ts:105-108`) exists but the
workout-builder module does not even import it (grep: 0 matches). The AI path has the identical gap
(`coach-ai.service.ts:59-65`).

This is the **50-Failures #5 (IDOR) / #9 (privilege escalation)** shape: scoping is enforced only
at the route layer (`RolesGuard`) and a single direct-FK service check — no data-layer second line
of defence.

### 7.2 Decision: wire `SubCoachScopeService` into the builder + a scoped-access helper

1. `WorkoutBuilderModule` imports `SubCoachModule` (exporting `SubCoachScopeService`).
2. Replace `assertClientBelongsToCoach(coachId, clientId)` with
   `assertCanAccessClient(actingUserId, clientId)` which returns true if **either**:
   - `client.coach_id === actingUserId` (head coach / owner), **or**
   - `SubCoachScopeService.canAccessClient(actingUserId, clientId)` returns true (open
     `SubCoachAssignment`).
3. Apply the same helper on the AI path (`coach-ai.service.ts:assertCoachOwnsClient`).
4. **Plan ownership stays head-scoped** for *editing the master library* (sub-coaches assign and
   build *client-instance* plans, but the head coach owns the shared template library) — unless the
   `SubCoachAssignment` scope explicitly grants template-edit. This is a **scoped permission**, not
   a binary: the scope row's capability set decides build-vs-assign-vs-template-edit.

### 7.3 Scoped permission shape

`SubCoachScopeService.canAccessClient` is the gate for **client-bound** actions (assign, clone-to,
build a client-instance plan). For **library-bound** actions (edit a master template), add a
capability check `SubCoachScopeService.canEditTemplates(subCoachId)` (new, defaulting to false) so a
head coach can opt a senior sub-coach into shared-library editing without granting it to all.

### 7.4 RLS — the second line of defence (50-Failures #2 / #5)

Every new table (`WorkoutProgram`, `WorkoutPlanRevision`, `WorkoutProgramRevision`,
`ClientWorkoutAssignmentSnapshot`) ships with **Postgres RLS policies** so that even a controller
that forgot the service-layer check cannot leak cross-tenant rows:
- `WorkoutProgram`: `USING (coach_id = current_setting('app.user_id') OR
  EXISTS(open SubCoachAssignment for the program's clients))`.
- Revision/snapshot tables: policy joins back to the owning plan/program's coach tenant.
- This is the **data-layer** defence the inventory flags as missing (50-Failures #2 RLS, #5 IDOR).
  Wire `app.user_id` / `app.role` GUCs from `JwtAuthGuard` via a Prisma middleware that sets them
  per-request (the same pattern used by RLS-enabled tables elsewhere; if none exists yet, this
  spec introduces it and the auditor verifies it under the standing gate).

### 7.5 Mobile parity

Mobile inventory §4.2: sub-coaches and coaches share the same `ClientsStack`, no per-screen
capability fork. Keep the binary UI but **surface the scoped capability**: if
`canEditTemplates=false`, the sub-coach sees the master library **read-only** (can clone-to-client,
cannot edit the master). The "Build with AI" and per-client builder remain available within their
assigned roster. Defence-in-depth in-screen guard mirrors `PendingAiDraftsScreen.tsx:57,66-69`.

---

## 8. UI / UX — quiet-luxury design system

Design tokens are `src/theme/tokens.ts` (the single source of truth). **All new surfaces use
`semanticColors` + `typography`/`spacing`/`radius` tokens** — never the legacy flat `ThemeColors`.

### 8.1 Design principles applied

- **Don Norman's three levels** — *visceral* (Cormorant Garamond serif headers, bone/cream palette,
  velvet 400ms motion = the "expensive coaching software" feel); *behavioral* (autosave means the
  coach never fears losing work; undo means fearless experimentation); *reflective* (the coach
  feels like a pro using pro tooling, reinforcing the $2K–$8K/mo self-image).
- **Miller's law (≤5)** — the builder's top-level tabs/sections cap at five: **Overview · Weeks ·
  Day editor · Assign · AI**. The program grid never shows more than a week's worth of days at once
  without horizontal paging.
- **Progressive disclosure** — week→day→exercise drills down; supersets, weight, rest, notes, and
  exercise video live behind a per-row expand, not crammed into the row (fixes mobile gaps #7/#8
  without clutter).
- **Quiet luxury** — `bone #F5EFE4` bg, `cream #F1E8D5` surface, `ink #1A1A18` text, `forest
  #2C4A36` primary accent (Body pillar), `stone #B1A89F` hairlines, `mutedGold #C5A253` reserved
  for founding-tier only. Radius `sm 0 / md 2 / lg 4`. Shadows capped at 0.04–0.08 opacity. No
  neon, no heavy borders, no "SaaS dashboard" density.
- **Motion** — `fast 120ms` for taps, `base 400ms` "velvet timing", decel easing
  `[0.16, 1, 0.3, 1]`. DnD reorder animates with Reanimated (already installed 4.3.1).

### 8.2 Pages & navigation page-paths

A **dedicated coach Workouts surface** (fixes mobile gap: no dedicated workouts tab today; the only
entry is `ClientDetailScreen.tsx:449` which always opens a new blank plan). New stack on the
existing `ClientsStack` (and a top-level Coach tab repurposing the misnamed "Templates" tab so it
finally means *workout* templates):

| Page | Page-path (route name) | Purpose |
|---|---|---|
| Program Library | `WorkoutProgramLibrary` | Coach's master templates grid; "New program", "New from template", search, goal-tag filter. (Replaces guideline-only `ProgramTemplatesScreen` semantics for the workouts tab.) |
| Program Builder | `WorkoutProgramBuilder { programId? }` | The Master Planner grid: weeks × days matrix, copy/paste across weeks, drag-drop, week duplication. |
| Day Editor | `WorkoutDayEditor { programId, week, day }` | The exercise list for one day: DnD rows, per-row expand (sets/reps/weight/rest/superset/notes/video), inline AI actions. |
| AI Compose | `WorkoutAIDraftReview { draftId }` | Diff review of a `draft.create_workout_plan` / `edit_workout_plan` (before/after, per-op accept). Supersedes `AIWorkoutDraftScreen`, migrated to `semanticColors`. |
| Assign | `WorkoutProgramAssign { programId }` | Clone-to-client + program fan-out assignment; client multi-select scoped by `canAccessClient`. |
| Preview-as-client | `WorkoutClientPreview { programId|planId }` | Renders the plan exactly as the client sees it (fixes mobile gap #11). |

The legacy flat `CoachWorkoutBuilderScreen` is retained as a "Quick plan" entry but routes its save
through the new autosave path; it is no longer the primary surface.

### 8.3 Key interactions

- **Master Planner grid** (Everfit parity): weeks as columns, days as rows (or vice-versa on
  portrait), each cell a day card showing exercise count + volume sparkline (`TgpSparkline`).
  Long-press a cell → copy; paste into another cell/week; "duplicate week" button. DnD via
  `react-native-gesture-handler` + Reanimated (installed).
- **Day editor DnD reorder** (mobile gap #5): long-press a row → drag; reorder animates; persists
  incrementally via autosave; undoable via the same stack.
- **Supersets UI** (mobile gap #8): rows sharing `superset_group_id` render grouped with a `1A/1B`
  badge (Everfit's notation); a "group as superset" action on multi-select.
- **Exercise video preview** (mobile gap #7): builder search hits show a thumbnail/gif; tap → a
  preview sheet (Mux `playbackUrl`, already minted for coaches, `exercise-catalog.service.ts:116`).
- **Inline AI** (gap #9): each day has "Ask AI to draft this day"; each exercise row has
  "swap / scale" → emits a `draft.edit_workout_plan` single-op diff.
- **Save-state pill** (gap #14) + **dirty-guard** (gap #12): always-visible status; no silent loss.
- **Undo button** in the editor toolbar + two-finger-swipe gesture.
- **Empty states**: reuse `EmptyStateNoWorkouts` (passive) for clients; library empty state gets a
  CTA ("Create your first program").
- **Skeletons**: `SkeletonWorkoutRow` / `SkeletonScreen` on load.

### 8.4 Accessibility & polish

WCAG-AA color matrix already encoded in `tokens.ts:7-27`; all new text/background pairs validated
against it (the spec's own review gate: no dark-on-dark, no low-contrast). Haptics via
`HapticPressable` on every primary action (DnD pickup = `medium`, save-confirmed = `success`,
conflict = `warning`).

---

## 9. Everfit parity+ matrix

| Capability | Everfit | TGP today | TGP after this spec | TGP edge |
|---|---|---|---|---|
| Multi-week Program Builder | ✅ | ❌ (flat plans) | ✅ `WorkoutProgram` + week/day model (§3) | Equal |
| Master Planner grid (copy/paste/DnD) | ✅ | ❌ | ✅ grid + DnD + week-duplicate (§8.3) | Equal |
| Assign program to multiple clients | ✅ | ⚠️ assign single plan only | ✅ program fan-out (§3.4) | Equal |
| AI paste → trackable workout | ✅ ~2s | ⚠️ whole-program generate only | ✅ live-create + per-exercise diffs (§4) | **Surgical AI diffs Everfit lacks** |
| Supersets `1A/1B` | ✅ | ⚠️ DTO only, no UI | ✅ grouped UI (§8.3) | Equal |
| Exercise video in builder | ✅ | ❌ | ✅ inline preview (§8.3) | Equal |
| Real undo / revision history | ❌ | ❌ | ✅ auditable revisions (§5) | **TGP-only** |
| Google-Docs autosave | ⚠️ partial | ❌ | ✅ diff autosave + offline mirror (§6) | **TGP edge** |
| Client snapshot immutability | ⚠️ | ❌ (live read) | ✅ snapshot-at-assign (§3.3) | **TGP edge** |
| Sub-coach scoped permissions | ❌ | ❌ (blocked) | ✅ scoped assign/build/template (§7) | **TGP-only** |
| Preview-as-client | ✅ | ❌ | ✅ (§8.2) | Equal |
| Quiet-luxury UX | ❌ (utilitarian) | partial | ✅ full token system (§8) | **TGP-only** |

Net: **parity on every Everfit table-stakes feature**, plus four capabilities Everfit has no
equivalent of (undo, true autosave, snapshot immutability, sub-coach scoping) and a category-defining
UX.

---

## 10. 50-Failures auditor gate — pre-mapped

The standing 8-pass auditor gate is pre-addressed for every new surface (the implementing agent
does NOT audit itself — R31):

| Failure | Where addressed |
|---|---|
| #2 RLS | §7.4 — RLS on all 4 new tables + GUC middleware |
| #5 IDOR | §7.2 scope helper + §7.4 RLS second line |
| #8 input validation | §4.2/§6.2 — zod + DTO bounds reused from `UpsertExerciseRowDto` |
| #9 privilege escalation | §7.2/§7.3 — scoped capabilities, not binary |
| #21 N+1 | clone/fan-out batch inserts in one transaction, not per-row loops |
| #23 pagination | library list keyset-paginated like `listPlans` (`service.ts:234-275`) |
| #28 race | §6.2 `Serializable` + `FOR UPDATE`; registry `materialised_ref` guard (§4.2) |
| #30 optimistic rollback | §5.3/§6.3 — `onMutate`/`onError` rollback on every builder mutation |
| #44 transactions | every commit (clone, autosave, undo, assign+snapshot) is transactional |
| #45 soft deletes | additive columns; archive semantics preserved; revisions append-only |

---

## 11. Build sequencing (pipeline-ready)

Each item is a Builder (claude_opus_4_7) → Auditor (gpt_5_5, separate worktree) → Fixer loop until
CLEAN, one subagent / one worktree, backend-main & mobile READ-ONLY (R56–R60). All commits authored
`Dynasia G <dynasia@trygrowthproject.com>`, no trailers (R4). Findings to tgp-agent-context same
turn (R64).

**Phase 1 — backend data model (no behavior change):**
1. Migration: `WorkoutProgram`, additive `WorkoutPlan` columns, `WorkoutPlanRevision`,
   `WorkoutProgramRevision`, `ClientWorkoutAssignmentSnapshot` + RLS policies (§3, §5, §7.4).
2. `WorkoutBuilderService`: scope helper wiring `SubCoachScopeService` (§7.2); clone-to-client
   (§3.2); snapshot-at-assign + remove 409-on-edit (§3.3); program fan-out (§3.4); push on
   coach-driven assign (closes inventory gap i).

**Phase 2 — autosave + undo backend:**
3. `PATCH /autosave` endpoint + optimistic concurrency + revision write (§6.2).
4. `POST /undo` endpoint (§5.1). Revision pruning cron (§5.2).

**Phase 3 — AI gateway capabilities:**
5. `draft.create_workout_plan` + `draft.edit_workout_plan` materialisers in the registry (§4.2).
6. (Follow-on) re-point Path A behind a flag (§4.4).

**Phase 4 — mobile:**
7. `useAutosave` hook + save-state pill + dirty-guard (§6.3, §6.5).
8. Unified Program Library / Builder grid / Day editor with DnD, supersets, weight, video, inline
   AI (§8). Migrate `AIWorkoutDraftScreen` to `semanticColors` + diff review.
9. Mobile undo stack + optimistic rollback on all builder mutations (§5.3).
10. Preview-as-client + scoped sub-coach UI (§7.5, §8.2).

PR #207 (app icon) remains awaiting operator merge (R32) and is independent of this stream.

---

## 12. Open questions for the operator

1. **Template-edit scope default** (§7.3): default sub-coaches to *read-only* on the head coach's
   master library (clone-to-client allowed, edit-master gated by `canEditTemplates`)? Recommended:
   yes.
2. **Path A migration timing** (§4.4): land the new gateway create-capability first and keep the
   inline path behind a flag for one release, or cut over immediately? Recommended: flag for one
   release.
3. **Revision retention** (§5.2): 50-revisions-or-30-days acceptable, or do coaches need longer
   audit trails for compliance? Recommended: 50/30 to start, revisit.
4. **"Templates" tab repurposing** (§8.2): the current guideline-only `ProgramTemplatesScreen` —
   move guidelines to a sub-section of client detail and reclaim the tab for workout programs?
   Recommended: yes (the tab name has been misleading since Phase 11).

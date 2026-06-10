# MWB-1 — Master Workout Builder Phase 1 (backend data model)

**Builder model:** Opus 4.8
**Worktree:** `/home/user/workspace/tgp/backend-mwb-1`
**Branch:** `feature/mwb-1-data-model`
**Base:** `origin/main` at `9322eeb` (post-PR #373)

## Mission
Build Phase 1 of the Master Workout Builder spec — backend data model only, no behavior change to legacy paths. Five concrete deliverables (per spec §11):

1. **Migration**: new tables `WorkoutProgram`, `WorkoutPlanRevision`, `WorkoutProgramRevision`, `ClientWorkoutAssignmentSnapshot` + additive columns on `WorkoutPlan` + RLS policies. Pure additive: every existing plan keeps `program_id=null`, `is_template=false`, `version=1` and behaves exactly as today.
2. **`WorkoutBuilderService` scope helper wiring** with `SubCoachScopeService` (§7.2). Import `SubCoachModule` in `WorkoutBuilderModule`; replace `assertClientBelongsToCoach` with `assertCanAccessClient(actingUserId, clientId)` checking head-coach OR open `SubCoachAssignment`. Mirror on `coach-ai.service.ts:assertCoachOwnsClient`.
3. **`forkTemplate(sourceTemplateId, actingUserId)`** method (§7.3): deep-copy a `tenant_shared` template into an `owner_only` row owned by actor with `forked_from_id` set. Fresh revision baseline.
4. **`cloneProgramToClient(masterProgramId, clientId, opts)`** method (§3.2): inside one Serializable transaction copies program → plans → exercises with fresh ids + writes `initial` revisions.
5. **Snapshot-at-assign** (§3.3): `assignPlan` + the AI `assign-workout` materialiser write a `ClientWorkoutAssignmentSnapshot` row inside their existing tx. Read paths (`GET /assignments/me`, `GET /assignments/:id`) read from snapshot when present, fall back to live join when null. **REMOVE** the 409-on-edit-while-assigned restriction (`service.ts:461-472`). Keep Serializable guard against concurrent `setExercises` on the same plan only.
6. **Program-level assignment fan-out** (§3.4): `POST /workout-programs/:id/assignments` schedules N child assignments by `(week_index, day_index)` from a `start_date`, one idempotency key for the whole fan-out, all rows in one tx.

## Read FIRST — ground truth (in order)
1. `/tmp/tgp-agent-context/specs/MASTER_WORKOUT_BUILDER_SPEC.md` — §3 (data model), §5 (revision history), §7 (sub-coach scope + RLS), §11 (Phase 1 build list)
2. `/tmp/tgp-agent-context/specs/BACKEND_WORKOUT_INVENTORY.md` — gaps a, b, i, j
3. Existing code in `src/workout-builder/` — read all files, especially `service.ts` (the existing 409 guard, the Serializable lock, `setExercises`, `assertPlanOwnership`, `assertClientBelongsToCoach`)
4. `src/sub-coach/sub-coach-scope.service.ts` — `canAccessClient` signature
5. `prisma/schema.prisma` lines around `WorkoutPlan` (~1993), `User`, `SubCoachAssignment`
6. Existing RLS examples: grep for `current_setting('app.user_id')` to find the established pattern and Prisma middleware that sets the GUC

## Hard constraints (do NOT violate)
- **Additive migration only.** Zero `DROP`, `RENAME`, `ALTER COLUMN TYPE`, `TRUNCATE`, `DELETE FROM` on existing tables. Every new column is nullable OR has a default. Existing rows must continue to work without backfill.
- **No behavior change to legacy paths.** The flat `CoachWorkoutBuilderScreen` path must keep working (one-off "quick plans"). Plans with `program_id=null` go through the old code path unchanged.
- **NO migration of existing data.** Don't backfill old plans into a parent program. Forward-compat only.
- **Sonnet 4.6 FORBIDDEN as agent runtime.** R31 rule applies to runtime, NOT product code in `src/ai/*`.
- **RLS is the second line of defence.** Every new table gets policies wired to `app.user_id` + `app.tenant_id` GUCs. Hectacorn-quality cybersecurity — the operator's standing instruction: "I need RLS to be HECTACORN QUALITY — dont half-ass cybersecurity".
- **No new feature flag** — this is pure data-model + service-wiring; nothing flips on for users yet.

## Hard gates (R66 — full-suite-before-PR)
1. `npx tsc --noEmit` exits 0
2. `npx prisma migrate dev --name mwb_1_data_model` runs locally clean; migration SQL is reviewable and additive-only
3. Full non-RLS Jest lane passes
4. Add NEW tests covering:
   - `forkTemplate` happy path + cross-tenant rejection + sub-coach forking head-coach `tenant_shared` template
   - `cloneProgramToClient` deep-copies all plans + exercises with fresh ids, writes initial revisions
   - `assignPlan` writes snapshot row inside the tx; read path returns snapshot when present, falls back to live join when null
   - Removal of 409: coach CAN now edit a plan that has an active assignment — assertion that the existing 409 test is updated to reflect new behavior (NOT silently dropped)
   - `canAccessClient` integration: a sub-coach with an open `SubCoachAssignment` CAN assign a workout to that client; without it, CANNOT
   - RLS: a sub-coach session (set `app.user_id`) cannot SELECT a `tenant_shared` template owned by a different tenant; CAN read one in their own tenant; cannot UPDATE a row they don't own
5. Entitlement pin lane stays 17/17
6. v1 dunning regression lane stays 26/26
7. Run R70 fail-fast lane if `scripts/r70-fail-fast.sh` exists, SKIP-BECAUSE otherwise

## Workflow
1. Read all ground-truth docs and existing code first. Do NOT write code until you've grokked the existing service.
2. Write the migration. Run it. Verify the SQL is additive.
3. Write the service methods + module wiring.
4. Write the RLS policies + Prisma middleware that sets GUCs.
5. Write tests as you go. Hit every gate above.
6. Commit in title-only format, no body, no emoji, no trailers. Author `Dynasia G <dynasia@trygrowthproject.com>`.
7. Push after EVERY commit (R64). Branch is `feature/mwb-1-data-model`.
8. Open PR titled `feat(workout): MWB-1 master workout builder data model + RLS + sub-coach scope` against `BradleyGleavePortfolio/growth-project-backend` main.
9. Update `/tmp/tgp-agent-context/handoffs/dispatch.json` with one journal entry per phase (R67) — append as new lines, do not rewrite the file.

## Anti-scope (do NOT do in this PR)
- Autosave endpoint (§6) — that's MWB-2
- Undo endpoint (§5 wire) — that's MWB-2
- AI gateway capabilities (§4) — that's MWB-3
- Mobile (§8) — separate PR
- Deleting any legacy code

## Deliverables (final message)
- Branch + final commit SHA
- PR URL
- Test counts (full lane + new tests added)
- TypeScript exit code
- Migration SQL file path
- Confirmation of additive-only verification: `grep -E '\b(DROP|RENAME|TRUNCATE|DELETE FROM|ALTER COLUMN)\b' prisma/migrations/*/migration.sql` returns nothing operative
- Confirmation RLS policies wired on all 4 new tables
- Token usage

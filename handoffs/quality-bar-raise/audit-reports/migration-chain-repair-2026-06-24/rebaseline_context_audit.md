# Rebaseline Context Audit — growth-project-backend PR #427 forward-migration gate

Date: 2026-06-24
Repo: BradleyGleavePortfolio/growth-project-backend
Branch created: `chore/rebaseline-migration-history` (from `main` @ `be1cdb75`)
Work dir: /home/user/workspace/gpb-rebaseline-work
Local Postgres: PostgreSQL 18.3 on port 54399 (CI uses postgres:15.18; DDL-type
errors below are version-independent).

## Documents read IN FULL
- `prisma/migrations/00000000000000_baseline/migration.sql` — 378 lines. Creates
  10 enums + 16 tables (User, UserProfile, FoodItem, LoggedFoodEntry,
  WorkoutSession, ExerciseSet, WorkoutRoutine, RoutineExercise, FastingWindow,
  WeightLog, NotificationPreferences, Habit, HabitLog, Lesson, LessonCompletion,
  CheckIn, water_logs) + indexes + FKs. **Does NOT create SubCoachInvite** (nor
  any of the ~150 other tables that exist in schema.prisma today). `User.id` is
  `TEXT`.
- `prisma/schema.prisma` — 6716 lines, 168 models, includes `model SubCoachInvite`
  (line 4270) with `token`/`token_hash` columns, and a `community_*` subsystem.
- `.github/workflows/migration-dry-run.yml` — the gate. See exact behavior below.
- 5 early post-baseline migrations + several deeper ones (see findings).

## What the "Forward migration applies cleanly" gate actually does
Job `forward-only` (migration-dry-run.yml):
1. Spins up a **bare `postgres:15.18`** service (DB `migration_dryrun`). **No
   Supabase bootstrap** — no `auth` schema, no `auth.uid()`, no `service_role` /
   `authenticated` / `anon` roles.
2. `npm ci`.
3. Detects whether the PR touches `prisma/migrations/**`. If yes →
   `pr_touches_migrations=true` and a forward-deploy failure is a HARD FAIL.
   (Grandfather clause: PRs that DON'T touch migrations get a warning instead.)
4. Runs `npx prisma migrate deploy` against the bare DB.
5. If apply succeeded, runs
   `prisma migrate diff --from-url $DATABASE_URL --to-schema-datamodel
   prisma/schema.prisma --exit-code` to assert the resulting DB == schema.prisma.

So to pass, the **entire chain (baseline + 155 migrations) must apply on vanilla
Postgres with zero Supabase scaffolding**, and the final DB must match schema.prisma.

## Migration inventory
- 156 directories total: `00000000000000_baseline` + 155 post-baseline.
- `migration_lock.toml` provider = postgresql.

## ROOT-CAUSE FINDINGS (all reproduced locally)

### Finding 1 — Reproduced the reported failure (baseline gap + ordering bug)
With the **current** baseline, `prisma migrate deploy` on a fresh DB fails at the
2nd migration:
```
Applying migration `00000000000000_baseline`
Applying migration `20250724120000_subcoach_invite_token_hash`
Error: P3018 ... 42P01 ERROR: relation "SubCoachInvite" does not exist
```
`SubCoachInvite` is CREATEd in `20260604000000_add_team_profile_and_sub_coach_invite`,
but the migration that ALTERs it (`20250724120000`) is dated **2025‑07‑24**, i.e.
it runs ~10 months BEFORE the table is created. This is a **misdated / mis-ordered
migration**, not merely a baseline gap. Same pattern for the 2nd early migration
`20250724120001_team_audit_revenue_sharing_changed`, which does
`ALTER TYPE "TeamAuditEventKind" ADD VALUE` — but `TeamAuditEventKind` is created
in `20260510000000_add_team_mode` (also ~10 months later).

### Finding 2 — Path A (regenerate baseline from schema.prisma) is IMPOSSIBLE
`prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
--script` produces a 5205-line baseline. It contains SubCoachInvite (8 refs),
token_hash (3), revenue_sharing_changed (1), 168 CreateTable. **But the generated
SQL does not even apply to an empty Postgres** — it fails on its own first FK:
```
Error: P3018 ... 42804
ERROR: foreign key constraint "community_voice_notes_author_id_fkey" cannot be implemented
DETAIL: Key columns "author_id" of the referencing table and "id" of the referenced
        table are of incompatible types: uuid and text.
```
Applying the generated baseline standalone via `psql ON_ERROR_STOP=0` yields **14
such FK errors**, all in the `community_*` subsystem:
community_voice_notes, community_workspaces (coach_id), community_memberships,
community_messages (sender_id, recipient_user_id), community_posts,
community_responses, community_events, community_event_rsvps,
community_challenges, community_challenge_participations,
community_moderation_actions (reported_by_id, actor_id), community_classroom_posts.

**Cause:** `schema.prisma` is internally inconsistent for from-scratch generation.
The community tables declare user-referencing columns as `@db.Uuid` (e.g.
`CommunityVoiceNote.author_id String @db.Uuid` → relation to `User`), but
`model User { id String @id @default(uuid()) }` has **no `@db.Uuid`**, so `User.id`
is `TEXT`. A uuid→text foreign key is illegal DDL on any Postgres version. The
real migration `20261217000000_community_voice_notes` (and `20261212000000_community_v1_1_schema`)
create these exact uuid→text FKs too — so the migration history itself is
internally inconsistent, independent of the baseline.

### Finding 3 — Even with a perfect baseline, the chain cannot apply on bare CI Postgres
Diagnostic: restored the original baseline, temporarily neutralized the 2 misdated
early migrations, ran the real chain:
```
... Applying migration `20260508000001_rls_workout_builder`
Error: P3018 ... 3F000 ERROR: schema "auth" does not exist
```
The migrations depend on a **Supabase environment** that the CI gate never
provisions:
- 10 migrations reference `auth.uid()` / the `auth` schema (earliest:
  `20260508000001_rls_workout_builder`).
- 29 migrations reference `service_role` / `authenticated` / `anon` roles
  (earliest: `20260520000001`).
- **NO migration bootstraps the `auth` schema or any of these roles.**
`prisma/migrations/rls_fitness_backend.sql` (a non-migration helper file) even
notes "Prisma's production connection uses Supabase service_role" and "service_role
already has BYPASSRLS on Supabase managed instances."

### Finding 4 — Further chain breakage beyond the environment
Diagnostic: bootstrapped a minimal Supabase-like env (auth schema + stub
`auth.uid()` + service_role/authenticated/anon roles), restored original baseline,
neutralized the 2 misdated migrations, ran the chain. It now reached
`20260702000000_fix_workout_rls_coach_role` (~migration #90) before failing:
```
Error: P3018 ... 22P02 ERROR: invalid input value for enum "Role": "sub_coach"
```
i.e. another content/ordering defect (a `Role` enum value `sub_coach` used before
it is added). There are likely additional issues past this point.

## CI reality check (GitHub)
- PR #427 "Forward migration applies cleanly" = **fail**, dying at
  `20250724120000` → `relation "SubCoachInvite" does not exist` (same as local
  Finding 1). CI runs bare postgres:15.18 with no bootstrap (confirmed from job log
  run 28118919870 / job 83265505983).
- All other required checks on #427 currently pass (danger, LOC, test density,
  banned casts, size-label, CodeQL, rls-*, mwb-3, build-and-test).

## CONCLUSION
The user-selected **Path A ("regenerate baseline from current schema.prisma via
prisma migrate diff --from-empty")** is **not viable as specified**:
1. The generated baseline does not apply to an empty DB (14 uuid→text FK errors)
   because schema.prisma is internally inconsistent.
2. A full-schema baseline collides with the 2 misdated 2025‑07‑24 migrations
   (which would re-ALTER tables/enums the baseline already contains).
3. The forward gate runs on bare Postgres; ≥10 migrations need a Supabase `auth`
   schema and ≥29 need Supabase roles that nothing in the repo creates — so the
   chain cannot complete on the CI environment regardless of the baseline.
4. There is at least one additional content/ordering defect downstream (Role enum
   `sub_coach`).

Making `migrate deploy` green on bare Postgres would require: reordering/rewriting
the 2 misdated early migrations, fixing 14 uuid→text FK type mismatches across the
community subsystem (touching schema.prisma AND multiple committed migrations),
bootstrapping the Supabase env in the workflow, and fixing the Role-enum ordering.
All of that **violates the task's hard constraints** ("Do NOT change schema.prisma",
"Do NOT lose/modify existing migrations — only modify the baseline") and goes far
beyond "rewrite the recipe card."

Recommendation surfaced to parent — see rebaseline_builder_summary.md.

# Lane B-DRIFT — P0: production database is missing schema objects; signup and every User read fail. Backend, T4. Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly. This is the top priority in the program.

## Evidence (operator, read-only production checks 13:35 PDT)
- Production Postgres logs: "column User.archived_at does not exist" about 390 times per day since at least 09-29 (every
  cron tick and every User read). The owner's signup at 13:25 PDT failed with it (generic error in the app).
- Diff of origin/main prisma/schema.prisma (scalar fields, @map/@@map honored) vs production information_schema:
  - Missing tables: ListItem, Recipe, SavedRecipe, UserPreferences.
  - Missing columns: User.archived_at; UserProfile.bio, weight_unit, meals_per_day, water_goal_oz, calorie_display,
    onboardingCompleted; NotificationPreferences.daily_checkin_enabled, weekly_summary_enabled, new_client_alerts.
  - Full JSON: /home/user/workspace/ops/prod_schema_drift_20261001.json. Production has 175 _prisma_migrations rows, last
    applied 20270124000000_scout_run_observation_expand; 2 old rolled-back baseline attempts from April (harmless).
- No migration under prisma/migrations creates any of these objects; they were added to schema.prisma without migrations
  (e.g. 69c80ee1, #35, April). CI did not catch it: `.github/workflows/migration-dry-run.yml` has a schema-parity
  (`prisma migrate diff --exit-code`) step with a grandfather clause and is not a required check.

## Deliver (one PR against main; T4: migration on the production database)
1. One additive, idempotent migration (IF NOT EXISTS guards; no drops; no rewrite of existing rows; defaults exactly as
   the schema declares) that creates exactly what schema.prisma declares for those objects: types, nullability, defaults,
   primary keys, foreign keys with the declared onDelete, unique constraints and indexes. Do not change schema.prisma
   unless a field is provably dead (zero references in src/ and tests); if you propose removing one, list the evidence and
   keep it in a separate commit so auditors can judge it.
2. New public tables must satisfy the repo's RLS floor (rls-floor-guard and rls-live-tests must pass): ENABLE ROW LEVEL
   SECURITY and policies/grants consistent with the closest existing per-user tables.
3. Prove parity: after this migration, `prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel
   prisma/schema.prisma --exit-code` (shadow database in CI) returns 0. Remove the grandfather clause for these objects and
   make the parity step fail the workflow on any drift. Tell the operator the exact check name so the owner can make it a
   required check (only the owner changes branch protection).
4. In the PR body: tier header (T4), the exact SQL, rollback note, and a post-deploy verification SQL (information_schema
   query) the operator will run read-only after `fly-deploy.yml`. Note any code path that will start behaving differently
   once the columns exist (for example features gated on onboardingCompleted).
Never touch production. Report: /home/user/workspace/ops/reports/B-DRIFT.md + final answer (PR, head, SQL summary, tests,
CI status, open risks).

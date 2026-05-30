# WAVE 0 — SCHEMA-OWNER BRIEF (one migration, two tables)

## Why this unit exists
Two open issues each need a new table. To allow the downstream logic agents to run FULLY PARALLEL afterward without colliding on `prisma/schema.prisma` or migration ordering, ONE agent (you) lands BOTH tables in a SINGLE migration + PR, merged first. After this lands, no other agent touches `schema.prisma`.

You are a BUILDER. Work in your isolated worktree only. Commit + push to GitHub every ~2 min (R61). Author identity R4 STRICT: `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-author lines.

## Repo / branch
- Repo: `growth-project-backend` (NestJS + Prisma + Stripe).
- Base: `origin/main` @ `934d837` (latest migration is `20261209000000_pr17_scheduled_drop_push_seq` — B1's). Your new migration MUST sort AFTER it (use timestamp `20261210000000_*` or later).
- Branch: `issues/wave0-schema-ai-quota-ltv-peak`.

## SCOPE — schema + migration ONLY. NO application logic.
You add the two models to `prisma/schema.prisma`, generate ONE migration, and wire the minimal relation back-references. You do NOT write any quota-enforcement logic or LTV-persistence logic — that is the downstream logic agents' job (A1-logic, LTV-3-logic). Keep this PR a pure data-layer change so it audits fast and merges first.

### Table 1 — `UserAIQuota` (for issue A1)
Purpose: per-user DAILY AI token quota (today only a 20/hr per-IP throttle exists; A1 needs a persisted daily token counter). Design for the downstream A1-logic agent to read/increment.
- Model name: `UserAIQuota`.
- Fields (final call yours, but cover): `id` (cuid/uuid PK consistent with repo convention — check how other models do IDs), `user_id` FK → `User`, a `quota_date` (DATE, the UTC day bucket), `tokens_used Int @default(0)`, optional `request_count Int @default(0)`, `created_at`/`updated_at` timestamps consistent with repo convention.
- Uniqueness: `@@unique([user_id, quota_date])` so each user has exactly one row per day (enables atomic upsert-increment by the logic agent).
- Relation: add the inverse relation field on `User` (model at `schema.prisma:154`). Match the existing relation-naming + onDelete conventions used by other User-owned models.
- Index any FK per repo convention.

### Table 2 — `coach_ltv_peak` (for issue LTV-3)
Purpose: persist `zero_churn_streak` and `all_time_peak_rpcm` per coach so they don't regress month-over-month (currently recomputed-not-persisted at `ltv-metrics.service.ts:279-294`).
- Model name: pick the PascalCase Prisma model name consistent with repo convention and map it to table `coach_ltv_peak` via `@@map` if the repo maps snake_case tables (CHECK existing models — many use `@@map`). Look at how `CoachEffectivenessScore` (`schema.prisma:1636`) and similar coach-scoped metric tables are named/mapped and MATCH that exactly.
- Fields: `id` PK, `coach_id` (FK → whatever the repo uses for coach identity — CHECK: is it `User` with a role, or a `CoachProfile`? Match how `ltv-metrics.service.ts` currently identifies a coach and how `CoachEffectivenessScore` scopes its coach), `zero_churn_streak Int @default(0)`, `all_time_peak_rpcm` (Decimal/Float — match the type `rpcm` uses elsewhere; rpcm = revenue per client month, likely Decimal), `updated_at`.
- Uniqueness: one row per coach → `@@unique([coach_id])` (or `coach_id` as PK if that's the repo pattern for 1:1 metric tables).
- Relation back-reference on the coach model, matching convention.

## Migration
- Run the repo's prisma migrate command in dev/diff mode to GENERATE the SQL migration (check package.json scripts — likely `npx prisma migrate dev --name pr_wave0_ai_quota_ltv_peak --create-only` then inspect, OR the repo may use `prisma migrate diff`). Do NOT run a destructive reset against any real DB. Generate the migration SQL FILE only and inspect it.
- The migration must be PURELY additive (two CREATE TABLE + indexes + FKs). NO column drops, NO data backfill, NO changes to existing tables except the additive FK/relation if Prisma emits one (additive only).
- Migration folder name MUST sort after `20261209000000_pr17_scheduled_drop_push_seq`.
- Run `npx prisma generate` and confirm the client builds.

## Verification you MUST run and report actual results
- `npx prisma validate` → schema valid.
- `npx prisma generate` → client generates, exit 0.
- `npx tsc --noEmit` → 0 errors (the new client types must compile against existing code; since you add no logic, existing code should be unaffected — if tsc breaks, you introduced a relation that conflicts; fix it).
- `npm run lint` → no NEW errors in touched files.
- Inspect the generated migration SQL and paste the CREATE TABLE statements into your build report.
- If the repo has a migration-consistency or schema-snapshot test, run it.

## Cadence + push
- Push branch to GitHub every ~2 min as you go (R61), force-with-lease only against your own prior pushes.
- Open a PR to `main` titled `Wave0: add UserAIQuota + coach_ltv_peak tables (A1, LTV-3 schema)`. Report the PR number.
- Write a build report to `specs/WAVE0_SCHEMA_OWNER_BUILD_REPORT.md` in the tgp-agent-context repo (the two model definitions, the migration filename + CREATE TABLE SQL, relation back-refs added, verification counts, final branch HEAD SHA). Commit it (R4 identity) and push to docs `main` after rebasing clean.

## Report back
Final branch HEAD SHA, PR number, the two model names + their `@@map`/table names, the migration folder name, and all verification results (validate/generate/tsc/lint). This is a builder record, not a verdict — an independent GPT-5.5 auditor re-checks at your SHA before merge.

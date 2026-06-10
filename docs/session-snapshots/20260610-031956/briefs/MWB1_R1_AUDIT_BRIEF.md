# R1 AUDIT — PR #376 MWB-1 Master Workout Builder Data Model

**You are GPT-5.5 R1 auditor. R31: different agent, different worktree. Verify ONLY — do not modify source.**

## Repo & worktree
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Worktree: `/home/user/workspace/tgp/backend-mwb-1-audit` (detached at `73fca48`)
- Branch under review: `feature/mwb-1-data-model`, PR #376
- Base: `main` @ `9322eeb`

## Output
1. New branch `audit/r1-pr-376`.
2. Single file `AUDIT_R1_PR_376_REPORT.md`.
3. Commit title: `audit(r1): PR #376 MWB-1 master workout builder data model`, title-only, author `Dynasia G <dynasia@trygrowthproject.com>`.
4. Push, end with verdict.

## 10 gates

### Gate 1 — Commit hygiene
- `git log --format='%an <%ae>%n%B%n---' 9322eeb..HEAD`
- All title-only; author `Dynasia G <dynasia@trygrowthproject.com>`.

### Gate 2 — Scope boundaries
- `git diff --name-only 9322eeb..HEAD` MUST stay inside:
  - `src/workout/**` or `src/workouts/**` or `src/programs/**` (whatever the actual MWB module path is)
  - `prisma/migrations/<timestamp>_mwb1*/migration.sql`
  - `prisma/schema.prisma` (additive only)
  - `test/rls-mwb1-workout-builder-policies.spec.ts` (the new RLS spec)
  - Other test files under `test/` for MWB
  - Possibly `src/app.module.ts` or module wiring (additive imports only)
- NO edits to `src/community/**`, `src/dunning/**`, `src/entitlement/**`, `src/payouts-v2/**`, `src/contracts/**`, `src/ai/**`.

### Gate 3 — TypeScript clean
- `./node_modules/.bin/tsc --noEmit` returns 0.

### Gate 4 — Test lanes pass
- `./node_modules/.bin/jest test/rls-mwb1-workout-builder-policies.spec.ts --runInBand` → finisher reported 61 tests pass. Requires `RLS_FN_TEST_DATABASE_URL=postgresql://rls_tester:rls_tester_pw@localhost:5432/rls_fn_test`. If grant lost: `psql "$RLS_FN_TEST_DATABASE_URL" -c "GRANT USAGE ON SCHEMA app TO anon, app_authenticated, service_role;"`
- Run MWB-adjacent specs: workout-builder, coach-ai, ai-execution-stream2, module-graph, controller-rbac, sub-coach-scope, entitlement-guards-mounted. Confirm green.
- Run dunning lane: 127/127.

### Gate 5 — Migration shape
- `git show origin/main:prisma/schema.prisma > /tmp/base.prisma`
- `./node_modules/.bin/prisma migrate diff --from-schema-datamodel /tmp/base.prisma --to-schema-datamodel prisma/schema.prisma --script`
- MUST show only ADD COLUMN (nullable/default), CREATE TABLE, CREATE INDEX, ADD CONSTRAINT. Zero DROP/RENAME/ALTER COLUMN TYPE/TRUNCATE/DELETE FROM.
- Run destructive grep over actual migration files for MWB-1.

### Gate 6 — RLS posture on 4 new tables (HECTACORN)
- Find the 4 new tables in the migration (likely `WorkoutProgram`, `WorkoutPlanRevision`, `WorkoutProgramRevision`, `ClientWorkoutAssignmentSnapshot` per finisher report).
- Each MUST have `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`.
- Confirm policies cover: owner R/W, tenant-shared sub-coach read-only scoping, sub-coach overlay (read assigned client snapshot), anon zero-access, service_role bypass.
- Confirm 2 SECURITY DEFINER helpers exist with pinned `search_path`.

### Gate 7 — Sub-coach scope correctness
- Find the sub-coach scope helper used by MWB-1 (likely `assignable-asset-resolver-workout` or similar).
- Confirm tests cover positive (assigned client → can access) and negative (non-assigned client → denied).

### Gate 8 — Feature flag posture
- Data model itself is data-only — verify.
- Any new controller/service that exposes MWB-1 reads/writes MUST be auth+roles+entitlement gated.
- Builder's PR body should note any follow-up launch flag if applicable. Report what you find.

### Gate 9 — Forbidden tokens
- `git diff 9322eeb..HEAD -- 'src/**' 'test/**' | grep -iE '^\+.*\b(sonnet|claude-3|TODO\(audit\)|FIXME|XXX)\b'`
- Expect zero new-line matches.

### Gate 10 — openapi-spec SKIP-BECAUSE documented
- The finisher noted `openapi-spec.spec.ts` 6 failures are env DB-seed limitation (missing `WearableMetricDef` table). Confirm PR body or commit message documents this as SKIP-BECAUSE, not a regression. Confirm none of the 10 changed files touch wearables/openapi/auth/app.module.

## Verdict rubric
- **CLEAN**: all 10 gates pass.
- **DIRTY-MINOR**: cosmetic only.
- **DIRTY**: any functional/security/scope/test failure.

## Hard rules
- Verify ONLY.
- `./node_modules/.bin/prisma` v6, `migrate diff` only.
- `api_credentials=["github"]` for gh.

End with verdict on its own line.

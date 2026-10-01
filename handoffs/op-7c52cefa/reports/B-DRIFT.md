# B-DRIFT report — P0 production schema drift

PR: BradleyGleavePortfolio/growth-project-backend#625 — `fix(db): create the schema-declared objects production is missing; make schema parity a blocking gate`
Branch: fix/p0-prod-schema-drift (from main be667142). Final head: 3647e78532a1216b239392547dddada3ebabf4c5. Tier T4. Not merged, nothing deployed, production not touched.

## Deliverables / disposition
1. Migration `prisma/migrations/20270125000000_restore_schema_declared_objects/migration.sql` — DONE. Additive, idempotent, single transaction (lock_timeout 5s, statement_timeout 30s). Creates enum ListType; User.archived_at; UserProfile.bio, weight_unit ('lbs'), meals_per_day, water_goal_oz, calorie_display ('net'), onboardingCompleted (false); NotificationPreferences.daily_checkin_enabled / weekly_summary_enabled / new_client_alerts (NOT NULL DEFAULT true); tables UserPreferences(8 cols), Recipe(18), SavedRecipe(4), ListItem(9) with PKs, 2 unique + 5 plain indexes, 5 FKs ON DELETE RESTRICT ON UPDATE CASCADE (no relation declares onDelete). DDL is Prisma 6.19.3's own output, guarded. A $verify$ block raises (rolls back) unless every object has the declared shape, plus RLS flags, policies and per-role grants. schema.prisma unchanged (every field is referenced in src). down.sql is CI-only.
2. RLS floor — DONE. ENABLE+FORCE, service_role permissive policy, RESTRICTIVE deny-all for anon and authenticated, REVOKE ALL from PUBLIC/anon/authenticated, GRANT S/I/U/D to service_role (S1-DB-01 server-only pattern, same as UserAIQuota/NudgeLog). rls-floor-guard and rls-live-tests pass. Note: rls-floor-guard measures DATABASE_URL_AUDIT and rls-live-tests runs only helper-functions.spec.ts, so neither touches these tables. The live proof is the verify block, which ran during "Forward migrations apply cleanly".
3. Parity — DONE with one deviation. New workflow .github/workflows/schema-parity.yml; required-check candidate name: **`Schema parity (migrations match schema.prisma)`**. The old informational job (continue-on-error, grandfather clause, path filter) was removed from migration-dry-run.yml. The gate fails on any missing table/enum/enum value/column (these can never be baselined), on new drift, and on stale baseline lines. Deviation: strict zero drift was not possible inside this lane. 104 pre-existing non-missing items are pinned in a baseline that can only shrink (prisma/schema-parity-baseline.sql). Clearing them needs schema.prisma edits or destructive SQL.
4. PR body — DONE: T4 header, statement summary of the exact SQL (the full file is in the diff), rollback (forward-fix; `prisma migrate resolve --rolled-back 20270125000000_restore_schema_declared_objects` if the apply fails), read-only post-deploy verification SQL (information_schema + pg_catalog), behavior-change list, Fix round table.

## Tests
- Local: `/home/user/workspace/ops/heavy.sh npx jest --runInBand test/ci/schema-parity-gate.spec.ts test/restore-schema-declared-objects-migration.spec.ts test/utils/g2-s11-db-guard.spec.ts test/scout/g2-s9c-db-guard.spec.ts test/scout/g2-s8c-db-guard.spec.ts test/scout/g2-s9-db-guard.spec.ts test/scout/g2-s8g-db-guard.spec.ts test/roman-coach-reviewed-migration.spec.ts test/guest-checkout-status-check.spec.ts`: 9 suites / 374 tests passed. After the last commit, the 2 new specs were re-run: 41/41 passed. `heavy.sh npx tsc --noEmit -p tsconfig.json`: exit 0. eslint clean on the new specs.
- Offline syntax check (pglast/libpg_query) of migration.sql, every DO body and every dynamic DDL template: /home/user/workspace/ops/bdrift/sqlcheck.py.
- CI at 3647e785: all checks pass except `shellcheck (scripts/*.sh)`. That failure is pre-existing (SC2015 in scripts/s10-core-diff-gate.sh, which this PR does not touch); Infra Lint fails the same way on other open PRs. deploy-readiness-gate was skipped.

## CI history
- c6abf232: forward apply FAILED. `notnull` is a reserved word and was used as an alias in the verify block. This would also have failed in production; the transaction rolled back cleanly. R75 also failed on the words "as never" in a test title. Both fixed in 5a90c354.
- 5a90c354: Schema parity FAILED as intended (empty baseline): 104 items, zero missing objects. This is live proof that the gate fails on drift.
- 6234f497: baseline pinned; parity passes. 3647e785: verify block also checks policies and grants.

## Behavior changes once deployed
User reads, signup and crons recover. Recipes, lists, prep guide, preferences, account-deletion finalize and data export start working (they fail today). The onboarding-abandoned nudge (NUDGE_ENABLED != off) starts matching users created 48–96h ago whose onboardingCompleted is false; existing profiles read false. Existing NotificationPreferences rows read true for the 3 new flags; no sender reads them. RESTRICT FKs block a hard delete of a User who has child rows. Account deletion tombstones the User row instead, so it is unaffected.

## Open risks
- The baseline still contains 3 missing unique indexes (CoachPackage.share_token, ScoutImport.import_intent_id, SubCoachInvite.token_hash), 4 column type differences (CoachLandingLead.next_eligible_at, WorkoutBuilderIdempotencyKey.status, recent_auth_nonce.expires_at/created_at), and the DataExportRequest/deletion_audit tables, which exist in the chain but not in the schema. These are owned by BL-MIGRATION-REBASELINE.
- The gate compares the migration chain to the schema, not to production. Production could also carry manual drift; the operator's information_schema diff after deploy covers that.
- If the lock_timeout trips on User/UserProfile under load, the deploy fails closed. Fix: run migrate resolve --rolled-back, then redeploy.
- Mobile reads `profile.onboarding_completed` but the backend returns `onboardingCompleted`. This contract mismatch predates the PR and is out of scope.

## Decisions needed (recommended default)
1. Make `Schema parity (migrations match schema.prisma)` a required check on main. Recommended: yes, right after merge. It also belongs in scripts/setup-branch-protection.sh, which I did not edit.
2. Accept the shrink-only baseline instead of strict zero drift. Recommended: accept, and schedule a BL-MIGRATION-REBASELINE PR.
3. Onboarding-abandoned nudge exposure on first ticks. Recommended: no action, because signups were failing during the 48–96h window.

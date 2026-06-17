# Re-Audit 421 — Auditor A (Correctness & Security), R81 doctrine

- **PR:** #421 "W1.5-A4: reusable RLS live-DB test harness"
- **Head:** d4d4d22097d46cbc62bb73516aff65f9da92ef14
- **Base:** wave-1-5-planning
- **Scope:** test-only (`.github/workflows/ci.yml`, `test/rls/rls-harness.spec.ts`, `test/rls/support/rls-harness.ts`)
- **Verdict:** CLEAN_NO_FINDINGS
- **Counts:** P0=0, P1=0, P2=0, P3=0

## Central invariant — no false-green (VERIFIED GENUINE)

**Negative control genuinely fails when RLS is off.** `disableHarnessRls`
(rls-harness.ts:99) issues `DROP POLICY IF EXISTS` + `NO FORCE` + `DISABLE ROW
LEVEL SECURITY`. With RLS disabled, no policy is enforced for any role; the
harness role `app_user` (NOBYPASSRLS) holds `GRANT SELECT` (rls-harness.ts:
GRANT in bootstrapSchema), so it then sees the cross-tenant row. The failability
test (rls-harness.spec.ts:162) re-runs the SAME `expectCannotSeeOtherTenant` and
requires `.rejects.toThrow(/RLS is not isolating tenants/)` — a permission error
or other failure would NOT match that specific message, so the proof is robust,
not a tautology.

**Policy-lifecycle refactor preserved exact semantics.** `enableHarnessRls`
(rls-harness.ts:90s region) = `ENABLE` + `FORCE` + `DROP POLICY IF EXISTS` +
`CREATE POLICY ... FOR SELECT USING (gym_id = ANY(app.current_gym_ids()))`.
`bootstrapSchema` calls `enableHarnessRls`, and the spec restores via the same
function — single source of truth, no SQL copy that could drift. DROP-before-
CREATE keeps it idempotent. No weakening of ENABLE+FORCE+CREATE / DROP+NOFORCE+
DISABLE.

**New positive-failability test is non-tautological (P2-1 fix).**
rls-harness.spec.ts:147 constructs `ownGymOtherRow = {...tenants[0], rowId:
tenants[1].rowId}` and asserts `expectCanSeeOwnTenant` rejects with `/should see
own row/`. Acting scoped to `tenants[0].gymId` while querying `tenants[1]`'s row
(gym_id = tenants[1].gymId) → policy hides it → count 0 → throws. Genuine.

## Acting-identity selector — no vacuous pass (P3-2 / P3-1)

The `ActingIdentity` selector (`as: 'coach'|'student'`, `role`) only chooses
which provisioned **userId** acts and which value is stamped into the
`app.current_user_role` **GUC**. It is NOT a Postgres role switch: the actual DB
role is ALWAYS `app_user` (NOBYPASSRLS) via `SET LOCAL ROLE` inside
`makeAsUser` (rls-harness.ts). The harness SELECT policy is gym-scoped and
identity-agnostic (`gym_id = ANY(current_gym_ids())`), and `role='gym_owner'`
touches no BYPASSRLS path, so isolation still holds and the assertion cannot
pass vacuously. Verified.

## SQL injection / role-switch / teardown

- **Injection:** all raw SQL in the exported helpers interpolates only module
  constants (`HARNESS_TABLE`, `HARNESS_POLICY`, `HARNESS_ROLE`); row seeding
  uses bound params `$1,$2`. No external/user input reaches raw SQL. Clean.
- **Role switch:** GUCs are stamped (as owner `postgres`) inside
  `withRlsContext`, then `SET LOCAL ROLE app_user` runs before the user query —
  correct ordering; superuser can SET ROLE to a NOINHERIT role; SET LOCAL is
  tx-scoped so it cannot leak to the next pooled borrower.
- **Teardown/restore:** the failability `afterAll` restores via the harness's
  own idempotent `enableHarnessRls` as a safety net even if an inner test fails;
  `teardownTenants` drops the table. Ordering under `--runInBand` is correct
  (positive-throw runs while RLS still on, then disable, then restore).

## Helper fidelity to production

The harness's copy of `app.current_gym_ids()` (rls-harness.ts:134) is
semantically identical to the real migration
(`prisma/migrations/20261220000000_rls_helpers_v2/migration.sql:49`): same
`NULLIF(current_setting('app.gym_ids', true),'')` empty→NULL deny path and
`string_to_array(...)`. `CREATE OR REPLACE` is therefore a safe no-op against
the real DB. GUC key `app.gym_ids` matches `RLS_GYM_IDS_KEY` stamped by
`withRlsContext`. Empty-gyms DENY is preserved end-to-end (`[]` → `""` → NULL →
`gym_id = ANY(NULL)` never true).

## CI wiring — runs for real, not skipped

The new step (`Run W1.5-A4 RLS live-DB harness self-test`) is in the
`rls-live-tests` job which provisions postgres and sets `TEST_DATABASE_URL=...
?connection_limit=1`. `liveDbUrl()` returns that URL → top-level `describe`
runs (not `describe.skip`). `jest.rls.config.js` `testMatch` includes
`test/rls/**/*.spec.ts`, and the step passes an explicit scoped path. No
vacuous CI green. No `.only`/`xit`; the sole `describe.skip` is the no-DB-URL
env gate.

## P0 banned patterns

This PR adds NO `src/` changes (only ci.yml + 2 test files). The repo's only
`as unknown as` hit is in a pre-existing untouched file
(`src/database/__tests__/rls-context.middleware.spec.ts:27`), outside this
diff. P0 rule satisfied.

---

CLEAN_NO_FINDINGS

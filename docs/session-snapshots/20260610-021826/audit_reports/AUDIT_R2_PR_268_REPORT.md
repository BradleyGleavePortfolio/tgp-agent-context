# AUDIT R2 — PR #268 (RLS Helper Lockdown + HIBP), Post-Fixer

**Role:** GPT-5.5 R2 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 · Branch `feat/rls-01-helper-searchpath-hibp`
**Head SHA:** `1a15dbf7331fb1b10c077b14b88ae0daef7c0a1d` · **Base:** `6c4f618c` (current `main`)
**Worktree:** `/home/user/workspace/tgp/backend-rls-268-r2-audit` (detached @ `1a15dbf7`)
**Date:** 2026-06-10

## VERDICT: **CLEAN**

All five R1 findings (R1-P1-001..004 + R1-P2-001) are **fully closed** — verified both by source inspection and by independently running the live RLS suite (31/31) against a real Postgres, plus a negative-control injection proving the assertions are non-vacuous. No regressions. No new P0/P1/P2 findings. Two informational P3 notes below (no action required).

---

## R1 Finding Re-Verification

### R1-P1-001 — `pg_temp` missing from all 5 hardened helpers' search_path → **CLOSED**
`prisma/migrations/20260704000000_rls01_helper_searchpath_hibp/migration.sql`

All 5 hardened helpers carry the **exact** clause `SET search_path = pg_catalog, public, app, pg_temp` with **`pg_temp` LAST**:

| Helper | Line | search_path | CREATE OR REPLACE | SECURITY DEFINER |
|---|---|---|---|---|
| `app.current_user_id()` | 63 | `pg_catalog, public, app, pg_temp` | ✅ (no DROP) | ✅ |
| `app.current_user_role()` | 92 | `pg_catalog, public, app, pg_temp` | ✅ (no DROP) | ✅ |
| `app.is_owner()` | 121 | `pg_catalog, public, app, pg_temp` | ✅ (no DROP) | ✅ |
| `app.is_current_coach_of(text)` | 151 | `pg_catalog, public, app, pg_temp` | ✅ (no DROP) | ✅ |
| `public.enforce_subcoach_head_cap()` | 205 | `pg_catalog, public, app, pg_temp` | ✅ (no DROP) | ✅ |

- Exactly 5 active `SET search_path` clauses; all identical; `pg_temp` is last in every one (`grep` line refs 63/92/121/151/205).
- Pattern is `CREATE OR REPLACE FUNCTION` for all 5 — **no `DROP`** in the active migration (the only `DROP`-adjacent text is the commented-out rollback block, lines 235-306, which intentionally omits `SET search_path` to restore the pre-PR state — documented at lines 241-245).
- `SECURITY DEFINER` present on all 5; trigger function additionally pins `VOLATILE` explicitly (line 203, addresses prior P3-001).
- Rationale documented in migration header (lines 18-24) and in `docs/SPEC_…` — pg_temp-last forces `public`/`app` to win for the unqualified `"TeamSubCoachAssignment"` reference in the trigger body.

### R1-P1-002 — Live RLS suite skipped in CI → **CLOSED**
`.github/workflows/ci.yml` lines 184-272 (`rls-live-tests` job).

- ✅ `postgres:15` service container with healthcheck (`pg_isready`, lines 205-219).
- ✅ `TEST_DATABASE_URL` wired into job env (line 226), alongside `DATABASE_URL`/`DIRECT_URL`.
- ✅ **No `continue-on-error`** anywhere in the job; every `psql` step uses `-v ON_ERROR_STOP=1`; the jest step runs unconditionally.
- ✅ Runs the **live** suite: `npx jest test/rls/helper-functions.spec.ts --runInBand --testTimeout=60000` (line 272). `--runInBand` correctly chosen so per-connection GUC/search_path state isn't interleaved.
- ✅ Hard-fail on unreachable DB enforced in the spec itself: `beforeAll` probes `SELECT 1` and **throws** if `DB_URL` is set-but-unreachable (`helper-functions.spec.ts:75-83`). The no-URL path uses `describe.skip` (clean skip); the set-but-unreachable path throws — this closes the exact "false green" R1 flagged.
- Bootstrap sequence (shim → scoped bootstrap → PR migration verbatim → trigger bind) is sound; the choice to scope-bootstrap instead of `prisma migrate deploy` is justified by a **pre-existing, out-of-scope** migration-chain defect (documented at `rls01-live-bootstrap.sql:3-13` and in the workflow comment 197-203). The PR migration is applied **verbatim** so the suite asserts real migration output.

### R1-P1-003 — Narrow shadowing coverage (only 1 helper) → **CLOSED**
`test/rls/helper-functions.spec.ts`

- ✅ Attacker schema `rls01_attacker` plants **same-name decoys for all 5 helpers** plus the chained built-ins (`current_setting`, `is_user_coached_by`): lines 593-626.
- ✅ Per-helper hostile-search_path tests for **each** of the 5 (caller path `rls01_attacker, public, app`), asserting the hardened helper still returns the correct value, not the attacker-forced value: lines 650-745.
- ✅ Dedicated **pg_temp relation-shadow** test on `enforce_subcoach_head_cap()`: plants empty `pg_temp."TeamSubCoachAssignment"`, sets caller path `pg_temp, public, app`, attempts a 3rd active assignment, asserts the cap still fires — proving `public` won resolution over `pg_temp` (lines 758-820). This is the test that specifically proves pg_temp-LAST positioning matters.

### R1-P1-004 — Metadata assertions don't check exact search_path string → **CLOSED**
`test/rls/helper-functions.spec.ts`

- ✅ **`proconfig` exact-equality** test: for all 5 helpers, filters `search_path=` entries, asserts exactly one, asserts value `=== 'pg_catalog, public, app, pg_temp'` verbatim, asserts last element is `pg_temp` and appears exactly once (lines 442-481).
- ✅ **`pg_get_functiondef()`** test: normalizes per-element quoting, asserts ordered clause with pg_temp last via regex `SET search_path (?:TO|=) pg_catalog, public, app, pg_temp\b`, plus a **negative guard** that the app-terminated (no-pg_temp) form is absent, plus `SECURITY DEFINER` (lines 483-513).
- ✅ Static-file test asserts exactly 5 matches of the full literal and **zero** matches of the no-pg_temp form, after stripping comments + string/dollar-quoted literals (lines 968-1002).
- ✅ **Independently verified non-vacuous (this audit):** injecting the buggy no-pg_temp helper into the live DB made the `proconfig` test fail with `Expected: "pg_catalog, public, app, pg_temp" / Received: "pg_catalog, public, app"`. A substring match would have passed; this exact match did not. The fix is real.

### R1-P2-001 — `docs/SUPABASE_CONFIG.md:89` wrong migration path → **CLOSED**
- ✅ Line 89 now references `prisma/migrations/20260704000000_rls01_helper_searchpath_hibp` (the correct, renamed path).
- ✅ Bonus: the post-deploy "Expected result" string (line 111) was updated to `search_path=pg_catalog, public, app, pg_temp` (with pg_temp last), keeping the doc consistent with the migration.

---

## HECTACORN Quality-Bar Cross-Checks

| Check | Result |
|---|---|
| SECURITY DEFINER on all hardened helpers | ✅ all 5 |
| CREATE OR REPLACE (never DROP) | ✅ no active DROP; rollback is commented-only |
| `auth.uid()`/`auth.role()` from JWT, never `current_user`/`session_user` | ✅ no Postgres `current_user`/`session_user` built-ins used; all matches are the `app.current_user_id`/`_role` GUC helper names or `current_setting`. Supabase `auth.uid/role/jwt` shim reads `request.jwt.claims->>'sub'/'role'` (CI-only shim) |
| No dynamic SQL with user-input concatenation in helpers | ✅ helper bodies use parameterized `current_setting` + schema-qualified refs; no `EXECUTE format(...)` with user input |
| RLS policies have BOTH USING and WITH CHECK | **N/A** — this PR adds **no `CREATE POLICY`** statements. It is a helper-function lockdown + HIBP-toggle-doc PR. (Policy USING/WITH CHECK is the concern of downstream RLS-02..08 PRs.) |
| Test matrix: positive same-tenant, negative cross-tenant, anon denial, role bypass | ✅ positive coach-of (line 306), negative cross-coach (282), anon NULL/false paths throughout, anon EXECUTE denial (519-545), authenticated/service_role EXECUTE granted (547-566) |
| HIBP constant-time compare + k-anonymous (5-char SHA1) + no full hash | **N/A to repo code** — see HIBP note below |

### HIBP note (P3, informational)
HIBP in this PR is **not a code integration**. It is the Supabase Auth `auth_leaked_password_protection` **dashboard toggle**; the k-anonymity API call and comparison are performed server-side by Supabase Auth, not by any code in this repo. The PR correctly scopes HIBP as: (a) a documented operator dashboard action (`docs/SUPABASE_CONFIG.md`, `docs/SPEC_…` §3.2), and (b) a release-blocking manual smoke test (register `test+hibp@…` with `Password123!` must be rejected). Therefore the brief's HIBP byte-level checks (constant-time compare, 5-char SHA1 prefix, no full hash) apply to Supabase's managed implementation and have **no surface in this PR to audit**. This is the correct treatment — there is no half-implemented HIBP client to flag.

---

## Re-run Gates (in worktree @ 1a15dbf7)

| Gate | Result |
|---|---|
| `prisma format` | ✅ formatted, no errors |
| `prisma migrate diff --from-empty --to-schema-datamodel` (DROP scan) | ✅ PASS — additive only, no `DROP` |
| `tsc --noEmit` | ✅ exit 0 (clean) |
| `eslint test/rls/helper-functions.spec.ts` | ✅ exit 0 (0 problems) |
| `jest test/rls/helper-functions.spec.ts` (no DB) | ✅ 2 passed, 29 skipped (clean skip; static checks run) |
| **`jest …` live (local Postgres 17, exact CI bootstrap)** | ✅ **31 passed, 31 total** |
| Negative control: inject no-pg_temp helper → metadata test | ✅ **fails as expected** (assertions non-vacuous) |
| PR mergeable (GitHub) | ✅ `mergeable: true` (state `unstable` = CI pending, not conflict) |
| File surface | ✅ 8 files, all within allowed surface; clean cherry-pick onto main, no stray/unrelated-history files |

> Live suite run on local Postgres **17** (the only engine available in this audit sandbox); CI targets postgres **15**. The asserted behaviors (proconfig, pg_get_functiondef rendering, pg_temp resolution order, SECURITY DEFINER) are stable across 15↔17, so this is a faithful proxy. Confidence: high.

---

## Findings Ledger (R2)

| Code | Sev | Status | Note |
|---|---|---|---|
| R2-P1 | — | none | No R1 finding regressed or partially-addressed |
| R2-P2 | — | none | — |
| R2-P3-001 | P3 (info) | accept | HIBP is a dashboard toggle, not repo code — correctly scoped as doc + smoke test; no code to audit |
| R2-P3-002 | P3 (info) | accept | Live CI bootstrap is scoped (not full `migrate deploy`) due to a **pre-existing** migration-chain ordering defect (`20250724120000` ALTERs `SubCoachInvite` before `20260604000000` creates it). Out of PR-RLS-01 scope; well-documented. Recommend a separate ticket to repair global migration history so future RLS PRs can `migrate deploy` from empty. |

## Conclusion
PR #268 fully and correctly closes all five R1 findings. The fixes are verified by independent execution (31/31 live) and a negative-control injection. Migration is forward-only/additive, SECURITY DEFINER + pg_temp-last on all 5 helpers, anon EXECUTE revoked, CI now hard-runs the live suite. **VERDICT: CLEAN.**

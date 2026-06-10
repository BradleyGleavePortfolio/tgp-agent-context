# PR #268 R2 Audit Brief — RLS Helper Lockdown + HIBP (Post-Fixer)

**Role:** GPT-5.5 R2 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 · Branch `feat/rls-01-helper-searchpath-hibp` · Head SHA `1a15dbf7` · Base `6c4f618c`
**Worktree:** `/home/user/workspace/tgp/backend-rls-268-r2-audit` (detached @ `1a15dbf7`)
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

## Context

R1 audit ( `/home/user/workspace/AUDIT_R1_PR_268_REPORT.md` or similar ) returned DIRTY with:
- R1-P1-001: `pg_temp` missing from all 5 hardened helpers' search_path
- R1-P1-002: Live RLS suite skipped in CI (no TEST_DATABASE_URL)
- R1-P1-003: Narrow shadowing coverage (only 1 helper tested)
- R1-P1-004: Metadata assertions don't check exact search_path string
- R1-P2-001: `docs/SUPABASE_CONFIG.md:89` wrong migration path

Fixer reported all 5 fixed (see `/home/user/workspace/PR268_FIXER_RESULT.md`). Branch was cherry-picked onto current main (unrelated histories — verify that's been handled cleanly).

## R2 audit scope

**For each R1 finding, re-verify the fix landed correctly:**

1. **P1-001 (pg_temp last)** — grep the migration file for `SET search_path` and assert:
   - Exactly `pg_catalog, public, app, pg_temp` (in that order, pg_temp LAST) on every hardened helper.
   - Applied to all 5 helpers, not just some.
   - Verify pattern uses CREATE OR REPLACE (no DROP).
   - SECURITY DEFINER preserved.

2. **P1-002 (CI live RLS)** — inspect `.github/workflows/ci.yml`:
   - New job (e.g. `rls-live-tests`) with `postgres:15` service container.
   - `TEST_DATABASE_URL` wired into env.
   - Job hard-fails on unreachable DB (no `continue-on-error: true`, no silent skip).
   - Job runs the live RLS suite, not just static.

3. **P1-003 (per-helper shadowing)** — find shadowing test file(s); confirm same-name decoy tests exist for ALL 5 helpers, not just 1.

4. **P1-004 (exact search_path assertion)** — find the metadata assertion test; confirm it asserts the full literal `pg_catalog, public, app, pg_temp` via `pg_get_functiondef()` or `proconfig`, not a substring match.

5. **P2-001 (docs path)** — `docs/SUPABASE_CONFIG.md:89` references correct migration path now.

## Re-run gates in the worktree

```bash
cd /home/user/workspace/tgp/backend-rls-268-r2-audit
npm ci 2>&1 | tail -5   # OR use prior install if it exists
./node_modules/.bin/prisma format
./node_modules/.bin/prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma | grep -i 'drop' && echo "FAIL: destructive change" || echo "PASS: additive only"
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint .
npm test -- --testPathPattern='rls' 2>&1 | tail -20
```

**Live RLS suite verification:** if local DB available, run the live suite and confirm 31/31 (as claimed). If not, inspect the test file and confirm no `.skip` or `xdescribe` gates the live tests.

## Cross-checks (HECTACORN quality bar)

- All policies use `auth.uid()` / `auth.role()` derived from JWT, never `current_user`/`session_user`.
- No helper function uses dynamic SQL with user input concatenation.
- All RLS policies have BOTH USING and WITH CHECK clauses where applicable.
- Test matrix covers: positive same-tenant, negative cross-tenant, service_role bypass, anon denial.
- HIBP integration: token comparison uses constant-time compare (no early-exit on byte match); requests are k-anonymous (first 5 chars of SHA1, not full hash).

## Deliverables

1. `/home/user/workspace/AUDIT_R2_PR_268_REPORT.md` — structured findings with R2-P0/P1/P2/P3 codes, file:line refs, and explicit cite to R1 finding number where applicable. If a R1 finding regressed or wasn't fully addressed, log it as R2-P1.
2. `/home/user/workspace/PR268_R2_AUDIT_RESULT.md` — short verdict summary (verdict, finding counts, gate output, link to full report).
3. Post a single PR comment on #268 via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/268/comments` with the R2 verdict + summary. USE `gh api`, NOT `gh pr comment`.

## Constraints

- READ-ONLY: do NOT modify code, do NOT push, do NOT merge.
- `gh` CLI with `api_credentials=["github"]`.
- Audit branch (if you make one for notes) named `audit/r2-pr-268`.
- HECTACORN-quality RLS standard applies — this is the operator's explicit "do not half-ass cybersecurity" directive.

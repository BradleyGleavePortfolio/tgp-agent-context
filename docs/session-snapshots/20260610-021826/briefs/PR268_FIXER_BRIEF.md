# FIXER BRIEF — PR #268 RLS Helper Lockdown + HIBP

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 — "PR-RLS-01: Helper function search_path lockdown + HIBP enable"
**Current head:** `c9d6c14049794a98ef5ccea26cf4be28c5d47f31`
**R1 verdict:** DIRTY (4 P1, 1 P2)
**R1 report:** `/home/user/workspace/tgp/backend-rls-268-audit/AUDIT_R1_PR_268_REPORT.md`
**Worktree:** `/home/user/workspace/tgp/backend-rls-268-fixer` on `fix/pr-268-pg-temp-and-ci`
**Fixer model:** Opus 4.8 (R31: Sonnet 4.6 FORBIDDEN as runtime; Opus 4.8 builders/fixers)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

---

## 0. Operator priority

**"I need RLS to be HECTACORN QUALITY — don't half-ass cybersecurity."**

These are real security findings — not cosmetic. Fix every one.

---

## 1. The 5 findings to fix

### R1-P1-001 — `pg_temp` missing from all 5 hardened functions (P1)

**Files:** `prisma/migrations/20260704000000_rls01_helper_searchpath_hibp/migration.sql:58, :87, :116, :146, :200`

**Current:** `SET search_path = pg_catalog, public, app`
**Required:** `SET search_path = pg_catalog, public, app, pg_temp`

`pg_temp` MUST be last. Without it, a session with CREATE on `pg_temp` can override unqualified references — same threat class as the search_path shadowing this PR exists to fix.

**Particularly critical** for `public.enforce_subcoach_head_cap()` whose body uses unqualified `TeamSubCoachAssignment` relation reference.

**Fix:** edit migration SQL — add `, pg_temp` to all 5 `SET search_path =` clauses.

Also update spec doc `docs/SPEC_pr_rls_01_helper_searchpath_hibp.md` to document this requirement explicitly.

### R1-P1-002 — Live RLS suite skipped in CI (P1)

**Files:** `.github/workflows/ci.yml:42-43`, `test/rls/helper-functions.spec.ts:28-35, :64`

**Problem:** Workflow runs `npm test` without `TEST_DATABASE_URL`. Test file gates all live checks behind `dbAvailable`. Default PR gate skips the actual RLS behavior tests.

**Fix:**
- Add a new CI job `rls-live-tests` that:
  - Provisions a Postgres 15+ service container (use the `postgres` GitHub Action service, NOT supabase Docker — too heavy for CI)
  - Applies migrations: `./node_modules/.bin/prisma migrate deploy`
  - Exports `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres`
  - Runs `npx jest test/rls --runInBand`
  - Fails if connection unavailable (no silent skip)
- Keep existing static SQL checks as a separate fast job (don't replace)
- Document the new job in PR body

If a Supabase-specific helper is needed (e.g. `auth.uid()`), create a CI bootstrap SQL file `scripts/ci/supabase-shim.sql` that stubs the bare minimum (DEFINE `auth.uid()` returns `current_setting('jwt.claim.sub')::uuid` or similar). Cite Supabase docs for the shim shape.

### R1-P1-003 — Narrow shadowing coverage (P1)

**File:** `test/rls/helper-functions.spec.ts:526-568`

**Problem:** Only `rls01_attacker.current_setting(text, boolean)` is created as a decoy, and only `app.current_user_id()` is exercised.

**Required additions:**
For EACH of the 5 hardened helpers, create an attacker-schema same-name decoy and call the helper under `SET search_path = attacker_schema, public, app` — verify the hardened version still executes.

PLUS: add a `pg_temp` relation-shadow test for `public.enforce_subcoach_head_cap()`:
- Create a temporary table named `TeamSubCoachAssignment` in `pg_temp`
- Insert rows that would trigger over-cap if used
- Fire the trigger
- Verify the cap-check resolves against `public.TeamSubCoachAssignment`, NOT `pg_temp.TeamSubCoachAssignment`

This proves `pg_temp`-last positioning matters.

### R1-P1-004 — Metadata assertions don't check exact search_path string (P1)

**Files:** `test/rls/helper-functions.spec.ts:435-463, :716-718`

**Current:** Live test only checks that `pg_catalog`, `public`, `app` appear somewhere. Static test hard-codes `SET search_path = pg_catalog, public, app` (the BUGGY string).

**Required:**
- For each hardened helper: assert exact `proconfig` value: `search_path=pg_catalog, public, app, pg_temp`
- Assert `pg_get_functiondef()` output contains `SET search_path TO 'pg_catalog, public, app, pg_temp'` (or equivalent Postgres canonical form)
- Assert `pg_temp` is the LAST element
- Update the static test to use the corrected string (post-fix)

### R1-P2-001 — Doc path typo (P2)

**File:** `docs/SUPABASE_CONFIG.md:89`

`prisma/migrations/20260525000000_rls01_helper_searchpath_hibp` should be `prisma/migrations/20260704000000_rls01_helper_searchpath_hibp` (match the actual path in the PR).

---

## 2. Anti-rebase awareness

PR #268 was opened against an OLD main (`d6a127d9` per spec body). Current main is `6c4f618c` (PR #374 ACH + #375 contracts + #376 MWB-1 merged).

**You MUST rebase onto current main before fixing.** Expected conflict surfaces:
- `prisma/migrations/` — none expected (timestamps don't collide; #374 used 20260601*, #375 used 20260602*, #376 used 20260603* approximately — verify)
- `.github/workflows/ci.yml` — possible if other PRs modified it; resolve by keeping both PRs' jobs
- `package.json` — none expected (PR #268 doesn't add deps)

**Rebase strategy:**
1. `git rebase origin/main` from `fix/pr-268-pg-temp-and-ci`
2. If conflict in ci.yml: keep BOTH sets of jobs
3. If conflict in any other file: STOP and report

Run `./node_modules/.bin/prisma generate` after rebase to refresh client if any other PR touched schema.prisma.

---

## 3. Gates

- [ ] All 5 findings fixed
- [ ] `./node_modules/.bin/prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` produces only additions
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint .` clean
- [ ] Static SQL tests in `test/rls/helper-functions.spec.ts` still pass
- [ ] If you can spin up a local postgres: live tests pass (or document why not run locally and confirm CI job will run them)
- [ ] No file outside `prisma/migrations/...`, `test/rls/...`, `.github/workflows/...`, `docs/SUPABASE_CONFIG.md`, `docs/SPEC_pr_rls_01_helper_searchpath_hibp.md`, `scripts/ci/...` is touched

---

## 4. Workflow

1. `cd /home/user/workspace/tgp/backend-rls-268-fixer`
2. Verify branch: `git rev-parse --abbrev-ref HEAD` = `fix/pr-268-pg-temp-and-ci`
3. Rebase: `git fetch origin && git rebase origin/main` — resolve any conflicts per §2
4. `npm install --no-audit --no-fund` (verify deps install)
5. Fix each finding §1.1-§1.5 in logical commits (title-only):
   - "fix(rls-01): pin pg_temp last in search_path for all 5 hardened helpers"
   - "ci(rls-01): provision postgres service for live RLS regression tests"
   - "test(rls-01): per-helper shadowing decoys + pg_temp relation-shadow trigger test"
   - "test(rls-01): assert exact search_path string with pg_temp last via proconfig"
   - "docs(rls-01): correct migration path reference in SUPABASE_CONFIG"
6. Run all gates §3
7. Push: `git push -u origin fix/pr-268-pg-temp-and-ci` (this is a NEW branch, not force-push)
8. Update PR #268: target branch needs to change to `fix/pr-268-pg-temp-and-ci` OR push fix commits directly to the existing PR branch `feat/rls-01-helper-searchpath-hibp`. **PREFER the latter** — push commits to the existing branch so PR #268 updates in-place. Use `git push --force-with-lease=feat/rls-01-helper-searchpath-hibp:<remote-sha> origin HEAD:feat/rls-01-helper-searchpath-hibp` from the fixer worktree.
9. PR comment: `gh pr comment 268 --repo BradleyGleavePortfolio/growth-project-backend --body "@dynasia R1 findings addressed at <new-head-sha>. Ready for R2."` (`api_credentials=["github"]`)
10. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`
11. Save result to `/home/user/workspace/PR268_FIXER_RESULT.md`

Return: new head SHA, commits applied, gate status, rebase conflict notes.

**STOP if:** rebase produces unexpected conflicts; any non-listed file would need modification; you can't determine the canonical Postgres search_path string format.

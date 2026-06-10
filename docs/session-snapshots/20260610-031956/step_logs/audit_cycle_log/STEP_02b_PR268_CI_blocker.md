# Audit Cycle — Step 02b: PR #268 CI Blocker (post-R2-CLEAN)

**Date:** 2026-06-09 17:18 PDT
**PR:** #268 — RLS helper search_path lockdown + HIBP
**Status before this step:** R2 audit returned CLEAN (live RLS suite 31/31, all R1 findings closed with non-vacuous proof). PR `mergeStateStatus: UNSTABLE`.

## CI status

| Check | Result | Time |
|---|---|---|
| `build-and-test` | **FAIL** (exit 134) | 4m53s |
| `rls-floor-guard` | PASS | 23s |
| `rls-live-tests` | PASS | 1m58s |

## Root cause of the failing `build-and-test` job

Inspecting the `Test` step log (`gh api .../jobs/80452909681/logs`), there are two distinct problems:

### Problem A — RLS metadata tests reach for a DB that the default job doesn't have

The `test/rls-helper-search-path.spec.ts` suite calls `prisma.$connect()` in `beforeAll` and fails with:
```
PrismaClientInitializationError: Can't reach database server at `localhost:5432`
```
across at least 6 test cases (e.g. `app.is_current_coach_of(text) exists and pins search_path`, `all five helpers carry a pinned search_path in pg_proc.proconfig`, etc).

The CI design intent (per the fixer's CI workflow change) is:
- **`rls-live-tests`** job — has a `postgres:15` service container + `TEST_DATABASE_URL` → runs the live RLS suite. Passing.
- **`build-and-test`** job — no DB service → runs everything else.

But `test/rls-helper-search-path.spec.ts` is **picked up by both jobs** because the default jest config has no `testPathIgnorePatterns` for it. So the default job tries to run live-DB tests against no DB → fail.

### Problem B — JS heap OOM during the broader test run

After the RLS errors, the suite eventually crashes with:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```
Exit code 134. Same OOM the Roman builder reported in its R66 run. This is a separate, longer-standing issue with the full backend Jest suite memory footprint — not introduced by this PR.

## Decision: small follow-on fixer

A targeted fix is needed. **Two viable options** for Problem A:

**Option 1 (recommended):** Add a `testPathIgnorePatterns` entry in the default jest config (or a separate config for the non-live job) excluding `test/rls-helper-search-path.spec.ts` and any other DB-required RLS spec. The `rls-live-tests` job then runs ONLY those specs via a separate config file (e.g. `jest.rls.config.js`) — clean separation.

**Option 2:** Add a top-level `describe.skip(... when !process.env.TEST_DATABASE_URL)` guard inside the spec. Less clean (test silently skips), but smaller diff.

Pick **Option 1** — explicit separation, no silent skips, matches the "no continue-on-error" / no-silent-skip standard the R1 audit's P1-002 just enforced for the CI workflow.

**Problem B** (OOM): out of scope for this fixer — needs a memory-budget investigation. Document only.

## Required next action

Dispatch a small Opus 4.8 fixer for PR #268:
- Split the jest test paths into "default" (no DB) and "rls-live" (needs DB).
- Update the CI workflow if needed so `rls-live-tests` job runs only the RLS config.
- Document Problem B in the PR body as a separate ticket.
- Push to the existing PR branch `feat/rls-01-helper-searchpath-hibp` so PR updates in place.

## Worktree

Reuse `/home/user/workspace/tgp/backend-rls-268-fixer` (existing PR branch).

## Next step in cycle

**Step 04:** Dispatch PR #268 CI fixer (Opus 4.8) — jest config split + workflow alignment.

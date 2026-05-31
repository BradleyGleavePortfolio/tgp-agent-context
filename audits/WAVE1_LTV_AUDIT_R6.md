# WAVE1 LTV Audit R6

Auditor: independent adversarial code audit (R31; did not author the code)

## Fixed target

- Worktree: `/home/user/workspace/wt-ltv`
- Expected SHA: `4fa645f64095b2ddabb6c66a51379c59783b0d9d`
- Verified SHA:
  ```text
  $ git -C /home/user/workspace/wt-ltv rev-parse HEAD
  4fa645f64095b2ddabb6c66a51379c59783b0d9d
  ```
- Backend origin/main base for write-set: `c909c188f0938c723b77c42b1fd128d228b5257a`

## Write-set

Command:
```text
$ git -C /home/user/workspace/wt-ltv diff --name-only c909c188f0938c723b77c42b1fd128d228b5257a 4fa645f64095b2ddabb6c66a51379c59783b0d9d
src/coach/command-center/ltv-metrics.dto.ts
src/coach/command-center/ltv-metrics.service.ts
test/ltv-metrics.service.spec.ts
```

Assessment: expected service and service test changed. DTO also changed; this was allowed by the audit brief ("DTO may or may not appear"). No unexpected file was present.

Diff stat:
```text
src/coach/command-center/ltv-metrics.dto.ts     |  38 +-
src/coach/command-center/ltv-metrics.service.ts | 339 ++++++++++--
test/ltv-metrics.service.spec.ts                | 704 +++++++++++++++++++++++-
3 files changed, 1017 insertions(+), 64 deletions(-)
```

## Gate results

### npm ci

PASS.

Snippet:
```text
> growth-project-backend@1.0.0 postinstall
> prisma generate

Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 1.82s

added 1011 packages, and audited 1012 packages in 25s
found 0 vulnerabilities
```

### TypeScript

PASS.

Command:
```text
$ cd /home/user/workspace/wt-ltv && npx tsc --noEmit
```

Snippet: command exited 0 with no output.

### Lint

PASS with warnings only; no errors.

Snippet:
```text
> growth-project-backend@1.0.0 lint
> eslint "src/**/*.ts"

/home/user/workspace/wt-ltv/src/coach/command-center/ltv-metrics.service.ts
  77:11  warning  'startOfLastMonth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 16 problems (0 errors, 16 warnings)
```

### Jest LTV tests

PASS; fixer claim of 47/47 confirmed.

Snippet:
```text
PASS test/ltv-metrics.service.spec.ts (10.591 s)
PASS test/ltv-metrics.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        11.202 s
Ran all test suites matching test/ltv-metrics.service.spec.ts|test/ltv-metrics.controller.spec.ts.
```

## Code audit notes

### Existing-row P0 race: appears fixed

- `lockedPeakUpsert` runs as an interactive `this.prisma.$transaction(async (tx) => { ... })` at `src/coach/command-center/ltv-metrics.service.ts:533-602`.
- The prior peak read is inside that transaction and uses `SELECT "all_time_peak_rpcm" ... WHERE "coach_id" = ${coachUserId} FOR UPDATE` at `src/coach/command-center/ltv-metrics.service.ts:539-546`.
- The existing-row write is inside the same transaction and updates only `all_time_peak_rpcm` and `updated_at` at `src/coach/command-center/ltv-metrics.service.ts:587-592`.
- `priorPeakRpcmCents` is taken from the locked row at `src/coach/command-center/ltv-metrics.service.ts:580`, `newPeakCents = Math.max(priorPeakRpcmCents, incomingPeakCents)` at line 582, and the caller derives `isNewRpcmRecord = rpcmCents > persisted.priorPeakRpcmCents` at line 396.
- Re-running the required scenario against the actual code: stored peak $100; A with $300 locks/reads $100, writes $300, returns true; B with $250 then locks/reads live $300, writes `max(300,250)=300`, and returns false. The non-advancing existing-row request no longer has a path to report `is_new_rpcm_record=true`.
- I found no executable `WITH prev AS`, `ON CONFLICT`, or `EXCLUDED` pattern in the LTV service; occurrences in the service are explanatory comments only.

### Monotonicity and zero-churn preservation

- Existing-row peak update is monotonic because it writes `Math.max(priorPeakRpcmCents, incomingPeakCents)` at `src/coach/command-center/ltv-metrics.service.ts:580-590`.
- First-run insert stores the incoming peak at `src/coach/command-center/ltv-metrics.service.ts:555-569`; because prior peak is treated as 0 at lines 570-573, first-run `is_new_rpcm_record` is correct for a single brand-new request with positive RPCM.
- The update set-list does not include `zero_churn_streak`; it updates only `all_time_peak_rpcm` and `updated_at` at `src/coach/command-center/ltv-metrics.service.ts:587-592`.
- The response streak is the live recompute (`computedStreak`) assigned to `zeroChurnStreakMonths` at `src/coach/command-center/ltv-metrics.service.ts:332-354` and then returned at line 441; it is not read from the persisted row.

## Findings

### P1 — First-run concurrent insert race is not handled; one request can throw, and a higher concurrent first run can be lost until a later retry

**File/lines:** `src/coach/command-center/ltv-metrics.service.ts:533-574`; schema uniqueness at `prisma/schema.prisma:4925-4933` and migration unique index at `prisma/migrations/20261210000000_pr_wave0_ai_quota_ltv_peak/migration.sql:49-50`.

**Problem:** The no-row branch does `SELECT ... FOR UPDATE`, but when there is no row, PostgreSQL has no row to lock. The code then issues a plain `INSERT` without `ON CONFLICT`, advisory lock, serializable retry, or unique-violation catch/retry. The inline comment acknowledges that the unique constraint makes a racing duplicate insert fail and "surfaces as an error to retry" at `src/coach/command-center/ltv-metrics.service.ts:552-554`, but the service does not implement that retry.

**Reproduction / interleaving:**
1. Brand-new coach; `coach_ltv_peak` has no row.
2. Request A has RPCM $250; request B has RPCM $300.
3. Both run the pre-read `findUnique` and see no row (`src/coach/command-center/ltv-metrics.service.ts:344-371`).
4. Both enter `lockedPeakUpsert`.
5. Both transactions execute `SELECT ... FOR UPDATE` at lines 539-546 and get `locked.length === 0` because there is no row to lock.
6. A inserts first at lines 555-569, creating peak $250.
7. B then attempts the same plain insert and hits the unique constraint on `coach_id`; there is no catch/retry path, so the API call fails instead of re-reading the now-live row and advancing the peak to $300.

**Impact:** The ledger is not corrupted by duplicate rows because the unique constraint prevents that, but the metrics endpoint can return a 500 on an ordinary first-use race. If the failed request had the higher RPCM, the persisted high-water mark remains lower until another successful request happens to recompute it. This violates the intended "safe retry" behavior requested for the first-run path and leaves a first-run lost-update/availability window.

**Expected fix:** On the no-row path, use a conflict-safe strategy that serializes first creation too, e.g. `INSERT ... ON CONFLICT (coach_id) DO UPDATE SET all_time_peak_rpcm = GREATEST(coach_ltv_peak.all_time_peak_rpcm, EXCLUDED.all_time_peak_rpcm), updated_at = now() RETURNING ...` plus derive prior/new-record from a subsequent locked read or retry on unique violation by re-entering the locked existing-row path. Another option is to take a per-coach advisory transaction lock before the first `SELECT`, then perform the current read/insert/update logic under that lock.

## Test-quality assessment

- For the existing-row P0 race, the new tests are materially stronger than the prior weak mock. The mock has a shared `__store`, seeds it once from `findUnique`, and the mocked `SELECT ... FOR UPDATE` returns the current shared store at `test/ltv-metrics.service.spec.ts:119-155`.
- The main stale-racer assertions at `test/ltv-metrics.service.spec.ts:880-910` and `913-942` would fail against the old stale-snapshot flag logic because the second request would still compare against $100 and report true.
- The structural guard tests at `test/ltv-metrics.service.spec.ts:647-687` and `995-1020` would also fail against an implementation that still used the legacy snapshot CTE / `ON CONFLICT` path instead of a transaction-local `FOR UPDATE` read.
- However, the tests do not cover the first-run insert conflict. The mock's insert handler blindly overwrites `__store` at `test/ltv-metrics.service.spec.ts:157-163` and does not simulate the real unique constraint on `coach_id`, so the test suite would not catch the P1 no-row race above. There is no `Promise.all` / unique-violation / retry test for two first-run requests.

## Deadlock / isolation / exception notes

- Existing-row path has a single-row lock order by `coach_id`, so I do not see a multi-row deadlock risk in the audited code.
- Prisma interactive transaction uses the default isolation unless overridden; no isolation level is supplied. That is acceptable for the existing-row `SELECT ... FOR UPDATE` design, but it does not protect the no-row insert branch because no row is locked.
- Exceptions inside the transaction should roll back that transaction. The first-run unique-violation case leaves the table with whichever insert committed first, but the failed higher request does not update the peak and the endpoint fails.

VERDICT: NOT-CLEAN

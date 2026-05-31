# WAVE1 LTV Audit R5

Auditor: Dynasia G  
Role: independent/adversarial code auditor (did not write this code)  
SHA audited: `94c0fbc0752fa7ab0e5369c95d28374452f66512`  
Worktree audited: `/home/user/workspace/wt-ltv`

## Fixed-SHA / write-set verification

- `git -C /home/user/workspace/wt-ltv rev-parse HEAD` returned:

```text
94c0fbc0752fa7ab0e5369c95d28374452f66512
```

- Write-set confirmed with `git -C /home/user/workspace/wt-ltv diff --name-only c909c188f0938c723b77c42b1fd128d228b5257a..94c0fbc`:

```text
src/coach/command-center/ltv-metrics.dto.ts
src/coach/command-center/ltv-metrics.service.ts
test/ltv-metrics.service.spec.ts
```

- Schema confirmed in `prisma/schema.prisma:4925-4934`:

```prisma
model CoachLtvPeak {
  id                 String   @id @default(uuid())
  coach_id           String   @unique
  coach              User     @relation("CoachLtvPeakCoach", fields: [coach_id], references: [id], onDelete: Cascade)
  zero_churn_streak  Int      @default(0)
  all_time_peak_rpcm Decimal  @default(0) @db.Decimal(20, 6)
  updated_at         DateTime @updatedAt

  @@map("coach_ltv_peak")
}
```

## Real gate results

### 1. `npm ci`

PASS.

```text
> growth-project-backend@1.0.0 postinstall
> prisma generate

Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 1.45s

added 1011 packages, and audited 1012 packages in 25s
found 0 vulnerabilities
```

### 2. TypeScript

PASS: `npx tsc --noEmit` exited `0` with no output.

### 3. Lint

PASS with warnings only: `npm run lint` exited `0`.

```text
/home/user/workspace/wt-ltv/src/coach/command-center/ltv-metrics.service.ts
  77:11  warning  'startOfLastMonth' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 16 problems (0 errors, 16 warnings)
```

### 4. LTV specs

PASS: relevant LTV specs are `test/ltv-metrics.service.spec.ts` and `test/ltv-metrics.controller.spec.ts`.

```text
PASS test/ltv-metrics.service.spec.ts (16.704 s)
PASS test/ltv-metrics.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        17.955 s
Ran all test suites matching test/ltv-metrics.service.spec.ts|test/ltv-metrics.controller.spec.ts.
```

### 5. Full Jest / known fanout failure

Full Jest on audited SHA failed only in `test/purchase-fanout-real-body.spec.ts`:

```text
Summary of all failing tests
FAIL test/purchase-fanout-real-body.spec.ts (7.199 s)
  ● PurchaseFanoutService.onPurchaseEntitled — real body (PR-9) › idempotency — webhook replay does NOT double-seed or double-materialise › replaying the same event leaves the SAME number of drops, immediate drop is materialised exactly once

    expect(received).toHaveLength(expected)

    Expected length: 1
    Received length: 2

      329 |       // First delivery: 2 drops seeded, 1 immediate materialised.
      330 |       expect(tx._drops).toHaveLength(2);
    > 331 |       expect(registry.getCalls()).toHaveLength(1);
          |                                   ^

Test Suites: 1 failed, 306 passed, 307 total
Tests:       1 failed, 20 skipped, 5 todo, 3727 passed, 3753 total
```

I checked `origin/main` at `c909c188f0938c723b77c42b1fd128d228b5257a` by temporarily detaching `/home/user/workspace/wt-ltv` to `origin/main`, running `npx jest test/purchase-fanout-real-body.spec.ts --runInBand`, and restoring `94c0fbc0752fa7ab0e5369c95d28374452f66512`. The same test failed there with the same assertion, confirming it is pre-existing/unrelated to this LTV change:

```text
MAIN_HEAD=c909c188f0938c723b77c42b1fd128d228b5257a
FAIL test/purchase-fanout-real-body.spec.ts (7.147 s)
  ● PurchaseFanoutService.onPurchaseEntitled — real body (PR-9) › idempotency — webhook replay does NOT double-seed or double-materialise › replaying the same event leaves the SAME number of drops, immediate drop is materialised exactly once

    expect(received).toHaveLength(expected)

    Expected length: 1
    Received length: 2

      329 |       // First delivery: 2 drops seeded, 1 immediate materialised.
      330 |       expect(tx._drops).toHaveLength(2);
    > 331 |       expect(registry.getCalls()).toHaveLength(1);
          |                                   ^

Test Suites: 1 failed, 1 total
Tests:       1 failed, 9 passed, 10 total
```

## Findings

### P0 — `is_new_rpcm_record` race is still present: `prev` CTE does not capture the conflict-row value immediately before the `ON CONFLICT DO UPDATE`

Location: `src/coach/command-center/ltv-metrics.service.ts:380`, `src/coach/command-center/ltv-metrics.service.ts:491-521`.

The SQL under audit is:

```ts
const rows = await this.prisma.$queryRaw<
  Array<{
    new_peak: Prisma.Decimal;
    old_peak: Prisma.Decimal | null;
  }>
>(Prisma.sql`
  WITH prev AS (
    SELECT "all_time_peak_rpcm" AS old_peak
    FROM "coach_ltv_peak"
    WHERE "coach_id" = ${coachUserId}
  )
  INSERT INTO "coach_ltv_peak" (
    "id", "coach_id", "all_time_peak_rpcm", "zero_churn_streak", "updated_at"
  )
  VALUES (
    gen_random_uuid(),
    ${coachUserId},
    ${incomingPeakCents}::numeric,
    ${seedStreak}::int,
    now()
  )
  ON CONFLICT ("coach_id") DO UPDATE SET
    "all_time_peak_rpcm" = GREATEST(
      "coach_ltv_peak"."all_time_peak_rpcm",
      EXCLUDED."all_time_peak_rpcm"
    ),
    "updated_at" = now()
  RETURNING
    "coach_ltv_peak"."all_time_peak_rpcm" AS new_peak,
    (SELECT old_peak FROM prev) AS old_peak
`);
```

The caller then sets:

```ts
isNewRpcmRecord = rpcmCents > persisted.priorPeakRpcmCents;
```

This is not a safe proof that only the real peak-advancing request reports `is_new_rpcm_record=true`. In PostgreSQL `READ COMMITTED`, a `SELECT` sees a snapshot as of when the query begins, while `INSERT ... ON CONFLICT DO UPDATE` can update a row affected by another transaction even when that row version is not visible to the command snapshot; PostgreSQL documents both behaviors at https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED. Therefore the leading `prev` CTE can return a stale `old_peak` from the statement snapshot, while the `ON CONFLICT DO UPDATE` waits for and applies `GREATEST` against the later current row version.

Concrete race:

1. Stored peak starts at `$100`.
2. Request A has RPCM `$300`; request B has RPCM `$250`.
3. Both statements begin while the visible row is `$100`, so both `prev` CTEs can capture `old_peak=$100`.
4. A wins first and updates the row to `$300`.
5. B's `ON CONFLICT DO UPDATE` waits/continues against the current row and `GREATEST(300, 250)` preserves `$300`, so monotonicity is safe.
6. B still returns `(SELECT old_peak FROM prev) = $100`, and line 380 computes `$250 > $100`, so B falsely reports `is_new_rpcm_record=true` even though it did not move the high-water mark.

This is exactly the race the fix claims to eliminate. The tests do not catch it because the mock at `test/ltv-metrics.service.spec.ts:115-151` makes `old_peak` equal to the mock's shared post-conflict baseline, which is stronger than what the real SQL guarantees for a leading read-only CTE under PostgreSQL snapshot rules.

Impact: duplicate/false "New Record" badge events under concurrent LTV reads. Peak persistence remains monotonic, but the returned API flag is still race-prone.

## Verified non-findings / confirmations

- Peak monotonicity is preserved by the `ON CONFLICT DO UPDATE SET "all_time_peak_rpcm" = GREATEST("coach_ltv_peak"."all_time_peak_rpcm", EXCLUDED."all_time_peak_rpcm")` assignment at `src/coach/command-center/ltv-metrics.service.ts:512-517`.
- `zero_churn_streak` is returned live from `computedStreak` / `zeroChurnStreakMonths` at `src/coach/command-center/ltv-metrics.service.ts:320-341` and assigned to the DTO at `src/coach/command-center/ltv-metrics.service.ts:425`.
- The conflict update set-list does not assign `zero_churn_streak`; it only updates `all_time_peak_rpcm` and `updated_at` at `src/coach/command-center/ltv-metrics.service.ts:512-517`. The insert branch still seeds `zero_churn_streak` at `src/coach/command-center/ltv-metrics.service.ts:502-510`, which is acceptable for initial row creation and is not the racy conflict-path clobber.

## Verdict

VERDICT: NOT-CLEAN

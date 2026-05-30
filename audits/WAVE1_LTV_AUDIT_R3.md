# AUDIT — Wave1 LTV re-audit R3: peak/streak atomic persistence (PR #332 @ aa0e1af)
VERDICT: NOT CLEAN
Typecheck: pass — ran `cd /home/user/workspace/wt-ltv && npx tsc --noEmit` (0 errors)
Lint: pass — ran `cd /home/user/workspace/wt-ltv && npx eslint src/coach/command-center/ltv-metrics.service.ts src/coach/command-center/ltv-metrics.dto.ts test/ltv-metrics.service.spec.ts` (0 errors, 1 warning: pre-existing `startOfLastMonth` unused at `src/coach/command-center/ltv-metrics.service.ts:75`)
Tests: pass — ran `cd /home/user/workspace/wt-ltv && npx jest test/ltv-metrics.service.spec.ts --runInBand` (Test Suites: 1 passed / 1 total; Tests: 36 passed / 36 total; Snapshots: 0 total)
Install gate: pass — ran `cd /home/user/workspace/wt-ltv && npm ci` (added 1011 packages, audited 1012 packages; Prisma Client v6.19.3 generated; 0 vulnerabilities)

## P0 findings
- None.

## P1 findings
- None. The prior all-time peak lost-update P1 remains fixed: the raw upsert sets `"all_time_peak_rpcm" = GREATEST("coach_ltv_peak"."all_time_peak_rpcm", EXCLUDED."all_time_peak_rpcm")` at `src/coach/command-center/ltv-metrics.service.ts:468-472`, so a stale lower peak candidate cannot regress the stored high-water mark.

## P2 findings
- [src/coach/command-center/ltv-metrics.service.ts:81-103] [src/coach/command-center/ltv-metrics.service.ts:313] [src/coach/command-center/ltv-metrics.service.ts:347-350] [src/coach/command-center/ltv-metrics.service.ts:473] `zero_churn_streak` is now reset-capable, but the “race-safe” claim is still too broad because the recompute is based on a separate earlier read of `ClientPurchase` rows and the later upsert blindly writes that snapshot-derived value with `EXCLUDED`. There is no stored-streak accumulator/read-modify-write left, but there is still a stale-source race: request A can read purchases before a cancellation and compute streak 8; the cancellation commits; request B reads the new source state and writes 0; then request A reaches the upsert later and overwrites the current 0 with its stale 8. That persists a wrong current streak until another metrics read corrects it. Concrete fix: either do not persist this current streak on the read path, or add a freshness guard/watermark to the upsert (for example, store a source-data `updated_at`/max cancellation watermark and only overwrite `zero_churn_streak` when the incoming recompute is at least as fresh), or compute and write from the database under an isolation/locking scheme that prevents an older source snapshot from landing after a newer one.

## P3 (non-blocking)
- [src/coach/command-center/ltv-metrics.service.ts:75] Existing lint warning remains: `startOfLastMonth` is assigned and never used. This is present in the touched-file ESLint run but does not fail lint.
- Scope verification is not as claimed for this R3 objective: `git diff --name-only origin/main...HEAD` includes `src/coach/command-center/ltv-metrics.dto.ts` in addition to `src/coach/command-center/ltv-metrics.service.ts` and `test/ltv-metrics.service.spec.ts`. I did not find schema or controller changes in this diff.

## Verification of PR claims
- `all_time_peak_rpcm` still uses DB-side `GREATEST(existing, EXCLUDED)` — verified true at `src/coach/command-center/ltv-metrics.service.ts:468-472`. This preserves the original race fix for the monotonic high-water mark.
- `zero_churn_streak` now writes the incoming recomputed value directly — verified true at `src/coach/command-center/ltv-metrics.service.ts:473`, where the SQL uses `"zero_churn_streak" = EXCLUDED."zero_churn_streak"` and does not wrap the streak in `GREATEST`.
- Legitimate reset/drop is now possible — verified true for the stored-streak semantics. The write is triggered whenever `computedStreak !== persistedStreak` at `src/coach/command-center/ltv-metrics.service.ts:340-347`, and the reset regression test proves a stored 8 drops to returned/persisted 0 after churn at `test/ltv-metrics.service.spec.ts:607-646`.
- Hidden stored-streak accumulator/read-modify-write — not found. The incoming streak is computed from `computeZeroChurnStreak(allPurchases, now)` at `src/coach/command-center/ltv-metrics.service.ts:313`; `computeZeroChurnStreak` derives the value solely from purchase rows and local month walking at `src/coach/command-center/ltv-metrics.service.ts:514-555`, and the raw upsert receives that computed value at `src/coach/command-center/ltv-metrics.service.ts:347-350`. However, as noted in P2, that does not make the persisted current streak race-safe against out-of-order requests whose source reads have different freshness.
- ON CONFLICT target — verified true. The raw SQL still uses `ON CONFLICT ("coach_id")` at `src/coach/command-center/ltv-metrics.service.ts:468`, matching the unique coach row model/migration previously verified.
- RETURNING preserved — verified true. The raw SQL still returns `"all_time_peak_rpcm", "zero_churn_streak"` at `src/coach/command-center/ltv-metrics.service.ts:475`, and the caller uses those returned values at `src/coach/command-center/ltv-metrics.service.ts:347-353`.
- `is_new_rpcm_record` semantics — verified intact. It remains a strict comparison of the current recompute against the pre-write persisted peak (`rpcmCents > persistedPeakCents`) at `src/coach/command-center/ltv-metrics.service.ts:327-329`, so ties are not flagged as new records.
- Parameterized raw SQL / no injection — verified true. The helper calls Prisma's tagged-template raw API (`Prisma.sql`) at `src/coach/command-center/ltv-metrics.service.ts:455-457`, and binds `coachUserId`, `incomingPeakCents`, and `incomingStreak` via template parameters at `src/coach/command-center/ltv-metrics.service.ts:462-465` rather than string concatenation.
- Peak monotonicity-under-stale-low test — verified green in the actual Jest run, with the relevant test at `test/ltv-metrics.service.spec.ts:540-574`.
- New streak-reset test — verified green in the actual Jest run, with the reset test at `test/ltv-metrics.service.spec.ts:607-646` proving a stored 8 becomes returned/persisted 0 after churn.
- Diff scope — FALSE as stated. `git diff --name-only origin/main...HEAD` returned `src/coach/command-center/ltv-metrics.dto.ts`, `src/coach/command-center/ltv-metrics.service.ts`, and `test/ltv-metrics.service.spec.ts`; schema and controller files were not touched.

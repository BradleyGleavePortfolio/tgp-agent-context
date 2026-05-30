# AUDIT — Wave1 LTV: persist peak/streak (coach_ltv_peak) + honest estimate/NRR flags (PR #332)
VERDICT: NOT CLEAN
Typecheck: pass — ran `cd /home/user/workspace/wt-ltv && npx tsc --noEmit` (0 errors)
Lint: pass — ran `cd /home/user/workspace/wt-ltv && npx eslint src/coach/command-center/ltv-metrics.service.ts src/coach/command-center/ltv-metrics.dto.ts test/ltv-metrics.service.spec.ts` (0 errors, 1 warning: pre-existing `startOfLastMonth` unused at `src/coach/command-center/ltv-metrics.service.ts:74`)
Tests: pass — ran `cd /home/user/workspace/wt-ltv && npx jest test/ltv-metrics.service.spec.ts --runInBand` (Test Suites: 1 passed / 1 total; Tests: 32 passed / 32 total; Snapshots: 0 total)
Install gate: pass — ran `cd /home/user/workspace/wt-ltv && npm ci` (Prisma Client v6.19.3 generated; 0 vulnerabilities)

## P0 findings
- None.

## P1 findings
- [src/coach/command-center/ltv-metrics.service.ts:299] [src/coach/command-center/ltv-metrics.service.ts:306] [src/coach/command-center/ltv-metrics.service.ts:316] [src/coach/command-center/ltv-metrics.service.ts:324] Peak/streak persistence is not concurrency-safe: it does `findUnique`, computes `Math.max` against that stale row, then `upsert`s absolute values outside a serializable transaction or atomic DB-side max. Two concurrent requests can both read a persisted peak of 100; the request with current RPCM 200 can write 200, then the request with current RPCM 150 can write 150 afterward, regressing `all_time_peak_rpcm` and violating the LTV-3 monotonic/source-of-truth requirement. The same lost-update pattern exists for `zero_churn_streak` via `zero_churn_streak: zeroChurnStreakMonths` at [src/coach/command-center/ltv-metrics.service.ts:325]. Concrete fix: make the write atomic, e.g. a PostgreSQL upsert that sets `all_time_peak_rpcm = GREATEST(coach_ltv_peak.all_time_peak_rpcm, EXCLUDED.all_time_peak_rpcm)` and `zero_churn_streak = GREATEST(coach_ltv_peak.zero_churn_streak, EXCLUDED.zero_churn_streak)`, or a serializable `$transaction` with retry on serialization failure and a re-read before write. A default read-then-write transaction is not sufficient unless it prevents the lost update.

## P2 findings
- None.

## P3 (non-blocking)
- [src/coach/command-center/ltv-metrics.service.ts:74] Existing lint warning remains: `startOfLastMonth` is assigned and never used. This is pre-existing on `origin/main`, so it is not a merge blocker for this PR.
- Scope note: `git diff --name-only origin/main...HEAD` shows `test/ltv-metrics.service.spec.ts` in addition to `src/coach/command-center/ltv-metrics.service.ts` and `src/coach/command-center/ltv-metrics.dto.ts`. The Wave-1 build brief allowed the spec/test if needed, but the auditor task asked to confirm only service + DTO were touched; that stricter check is false.

## Verification of PR claims
- LTV-3 schema alignment → verified true. `origin/main:prisma/schema.prisma` has model `CoachLtvPeak` with `id`, unique `coach_id`, `zero_churn_streak Int @default(0)`, `all_time_peak_rpcm Decimal @default(0) @db.Decimal(20, 6)`, `updated_at`, and `@@map("coach_ltv_peak")`; the service references `coachLtvPeak`, `coach_id`, `all_time_peak_rpcm`, and `zero_churn_streak` consistently.
- LTV-3 monotonic peak/streak → FALSE under concurrency. The single-request max logic is correct, but the read-then-upsert sequence can lose updates and persist a lower peak/streak after a higher concurrent write.
- LTV-1 estimate flag → verified true. DTO includes `estimated_ltv_is_estimate` and `estimated_ltv_estimate_note`, and the service sets them on the returned DTO at `src/coach/command-center/ltv-metrics.service.ts:350` and `src/coach/command-center/ltv-metrics.service.ts:351`.
- LTV-2 NRR stub flag → verified true. DTO includes `nrr_is_stub`, and the service returns `dto.nrr_is_stub = true` at `src/coach/command-center/ltv-metrics.service.ts:357`.
- Endpoint wiring → verified true. `LtvMetricsController.getLtvMetrics` returns `this.ltvMetrics.getMetrics(req.user.id)`, so the DTO fields assigned by the service are returned by the endpoint.
- Error handling → no swallowed LTV persistence errors found. `findUnique`/`upsert` errors propagate rather than being converted to empty or zero metrics.

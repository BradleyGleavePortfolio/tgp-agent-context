# AUDIT — Wave1 LTV re-audit R4: live streak + peak persistence (PR #332 @ 034150b)
VERDICT: NOT CLEAN
Typecheck: pass — ran `cd /home/user/workspace/wt-ltv && npx tsc --noEmit` (0 errors)
Lint: pass — ran `cd /home/user/workspace/wt-ltv && npx eslint src/coach/command-center/ltv-metrics.service.ts src/coach/command-center/ltv-metrics.dto.ts test/ltv-metrics.service.spec.ts` (0 errors, 1 warning: existing `startOfLastMonth` unused at `src/coach/command-center/ltv-metrics.service.ts:77`)
Tests: pass — ran `cd /home/user/workspace/wt-ltv && npx jest test/ltv-metrics.service.spec.ts --runInBand` (Test Suites: 1 passed / 1 total; Tests: 37 passed / 37 total; Snapshots: 0 total)
Install gate: pass — ran `cd /home/user/workspace/wt-ltv && npm ci` (added 1011 packages, audited 1012 packages; Prisma Client v6.19.3 generated; 0 vulnerabilities)

## P0 findings
- None.

## P1 findings
- None. The all-time peak high-water mark remains race-safe: the raw upsert uses `ON CONFLICT ("coach_id") DO UPDATE SET "all_time_peak_rpcm" = GREATEST("coach_ltv_peak"."all_time_peak_rpcm", EXCLUDED."all_time_peak_rpcm")` at `src/coach/command-center/ltv-metrics.service.ts:478-482`, so an out-of-order lower peak candidate cannot regress the stored peak.

## P2 findings
- [src/coach/command-center/ltv-metrics.service.ts:337] [src/coach/command-center/ltv-metrics.service.ts:357-367] `is_new_rpcm_record` is still derived from the stale pre-write `findUnique` snapshot, not from the authoritative peak returned by the atomic `GREATEST` upsert. In a race where both requests read persisted peak 100, request A writes current RPCM 300 first, and request B later writes current RPCM 250, B's upsert correctly returns peak 300, but B still returns `is_new_rpcm_record=true` because 250 > its stale pre-write 100. That response is internally inconsistent (`revenue_per_client_month_cents` 250, `all_time_peak_rpcm_cents` 300, but `is_new_rpcm_record=true`) and can show a false “New Record” badge. Concrete fix: compute the badge after `allTimePeakRpcmCents` is known, and require the current RPCM to equal the authoritative returned peak (for example, `rpcmCents > persistedPeakCents && rpcmCents === allTimePeakRpcmCents`, with the existing strict/tie semantics preserved as desired).

## P3 (non-blocking)
- [src/coach/command-center/ltv-metrics.service.ts:329-331] The stale streak is not used, but `findUnique` has no `select`, so Prisma will still fetch the whole `CoachLtvPeak` row, including `zero_churn_streak`. If the claim is intended literally as “never read from persistence,” narrow this query to `select: { all_time_peak_rpcm: true }`; this is not a P0/P1/P2 because no code path consumes the persisted streak.

## Verification of PR claims
- Stale-source streak race — fixed for the API response. `computedStreak` is derived from `computeZeroChurnStreak(allPurchases, now)` at `src/coach/command-center/ltv-metrics.service.ts:320`, assigned directly to `zeroChurnStreakMonths` at `src/coach/command-center/ltv-metrics.service.ts:343`, and the DTO field is populated from that live value at `src/coach/command-center/ltv-metrics.service.ts:408`.
- No remaining response path uses the persisted streak. The pre-write row is fetched at `src/coach/command-center/ltv-metrics.service.ts:329-331`, but only `all_time_peak_rpcm` is read from it at `src/coach/command-center/ltv-metrics.service.ts:333`; `zero_churn_streak` is not referenced in service logic, and the helper returns only `{ allTimePeakRpcmCents }` at `src/coach/command-center/ltv-metrics.service.ts:460-490`.
- Atomic upsert updates only the peak on conflict — verified. The INSERT seeds `"zero_churn_streak"` for the initial row at `src/coach/command-center/ltv-metrics.service.ts:468-476`, but the `DO UPDATE` block updates only `"all_time_peak_rpcm"` and `"updated_at"` at `src/coach/command-center/ltv-metrics.service.ts:478-483`; the old `zero_churn_streak = EXCLUDED...` assignment is gone.
- `RETURNING` for persistence is peak-only — verified. The raw SQL returns only `"all_time_peak_rpcm"` at `src/coach/command-center/ltv-metrics.service.ts:484`, and the DTO streak is not sourced from the returned row.
- Parameterized raw SQL — verified. The raw query is executed through Prisma's tagged-template API at `src/coach/command-center/ltv-metrics.service.ts:465-485`, with `coachUserId`, `incomingPeakCents`, and `seedStreak` bound as template parameters at `src/coach/command-center/ltv-metrics.service.ts:473-475`.
- Peak monotonicity — verified. The DB-side `GREATEST` upsert at `src/coach/command-center/ltv-metrics.service.ts:478-482` preserves the P1 monotonic high-water-mark fix, and the regression test for stale-low writers asserts the peak remains 30000 at `test/ltv-metrics.service.spec.ts:546-579`.
- Streak reset test — verified green. The test with a stale stored streak of 8 and a churn last month returns live streak 0 at `test/ltv-metrics.service.spec.ts:621-655`.
- Out-of-order streak race test — verified green. The new test asserts pre-cancel and post-cancel requests return their live recomputes, and a later re-read still returns 0 rather than a persisted stale value at `test/ltv-metrics.service.spec.ts:679-739`.
- Guard test for dropping `zero_churn_streak = EXCLUDED` — verified green. The SQL assertion checks the `DO UPDATE` block does not mention `zero_churn_streak` and does not assign it from `EXCLUDED` at `test/ltv-metrics.service.spec.ts:582-617`.
- Other readers of the now-stale persisted streak — none found in production code. `rg "zero_churn_streak|coachLtvPeak|coach_ltv_peak"` found production references only in `ltv-metrics.service.ts`, DTO docs, Prisma schema/migration, tests, and an audit doc; no other production service/controller consumes `coach_ltv_peak.zero_churn_streak`. The column can remain stale without another current reader returning a wrong value.
- Diff scope — acceptable for this R4 objective. `git diff --name-only origin/main...HEAD` returned only `src/coach/command-center/ltv-metrics.dto.ts`, `src/coach/command-center/ltv-metrics.service.ts`, and `test/ltv-metrics.service.spec.ts`; schema and controller files are untouched.

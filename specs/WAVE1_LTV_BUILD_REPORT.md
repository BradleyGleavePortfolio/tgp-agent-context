# Wave-1 LTV — Build Report (LTV-1 / LTV-2 / LTV-3)

- **Builder**: Dynasia G (Opus) — auditor (GPT-5.5) re-checks at the SHA below.
- **Repo**: `growth-project-backend`. **Branch**: `issues/ltv-metrics-fixes` (base `origin/main` @ `9c191be`).
- **PR**: #332 — "Wave1 LTV: persist peak/streak (coach_ltv_peak) + honest estimate/NRR flags".
- **Final SHA**: `175f066d3735f46e6ac5a64a473c298bd6845d11`.
- **Files touched** (scope-disjoint): `src/coach/command-center/ltv-metrics.service.ts`, `src/coach/command-center/ltv-metrics.dto.ts`, `test/ltv-metrics.service.spec.ts`. No `prisma/schema.prisma` edits (table shipped Wave-0); no `command-center.*`, no `coach-effectiveness.*`, no other modules.

## Already done at base vs. added

### Already present at base (`9c191be`)
- **LTV-1**: `lifespanIsEstimate` / `lifespanEstimateNote` computed for the <3-cancellation stub; surfaced as `lifespan_is_estimate` / `lifespan_estimate_note` on the DTO + response.
- **LTV-2**: internal var already renamed `grossRetentionPct`; honest comments present; `net_revenue_retention_pct` kept for API compat; `nrr_is_stub = true` already wired to DTO + response.
- **LTV-3**: `computeZeroChurnStreak` and a stub `estimatePeakRpcm` (returned current RPCM); response fields `zero_churn_streak_months`, `all_time_peak_rpcm_cents`, `is_new_rpcm_record`, `peak_rpcm_is_estimate` existed but were **recomputed-not-persisted** and regressed month-over-month. `isNewRpcmRecord` used a `>=` tie (always "new record" on first use).

### Added / changed this build
- **LTV-3 (main)** — persistence via `CoachLtvPeak`:
  - Read the coach's row with `prisma.coachLtvPeak.findUnique({ where: { coach_id } })`.
  - **Peak (source of truth)**: `persistedPeakCents = Number(row.all_time_peak_rpcm)`; `allTimePeakRpcmCents = max(persistedPeakCents, rpcmCents)`. `is_new_rpcm_record = rpcmCents > persistedPeakCents` (now **strict** — a tie is not a new record).
  - **Streak (floor)**: `zeroChurnStreakMonths = max(persistedStreak, computeZeroChurnStreak(...))` so it never regresses across the month boundary when the in-memory recompute window shrinks.
  - **Upsert by `coach_id`**: write only when a value advanced or no row exists yet (`!peakRow || peakAdvanced || streakAdvanced`), via `prisma.coachLtvPeak.upsert`. Stored as RPCM **in cents** in the `Decimal(20,6)` `all_time_peak_rpcm` column.
  - Removed the now-unused `estimatePeakRpcm` helper. `peak_rpcm_is_estimate` now always `false` (value is persisted). Field names kept stable: `all_time_peak_rpcm_cents/_label`, `zero_churn_streak_months`, `is_new_rpcm_record`.
- **LTV-1** — honest estimated-LTV label:
  - Added `estimated_ltv_is_estimate: boolean` and `estimated_ltv_estimate_note: string | null` to the DTO and wired them in the response. Set when the lifespan is the <3-cancellation stub (mirrors `lifespan_is_estimate`, exposed separately so the LTV card carries its own honesty label). No fabricated "real" LTV.
- **LTV-2** — verified `nrr_is_stub: true` reaches the response/DTO; added an explicit test asserting presence + value.

### CoachLtvPeak upsert approach (summary)
Read-modify-write per `getMetrics` call: `findUnique` by `coach_id` → compute `max(persisted, current)` for peak and `max(persisted, computed)` for streak → conditional `upsert` (where `{ coach_id }`, create+update both set both columns) only when something advanced. Persisted peak/streak are authoritative; transient recomputes can extend but never lower them.

### Response-flag changes (DTO)
| Field | Before | After |
|---|---|---|
| `estimated_ltv_is_estimate` | — | **added** (bool) |
| `estimated_ltv_estimate_note` | — | **added** (string \| null) |
| `peak_rpcm_is_estimate` | `true` (stub) | `false` (persisted) |
| `is_new_rpcm_record` | `current >= peak` | `current > persistedPeak` (strict) |
| `nrr_is_stub` | `true` (present) | unchanged; now test-covered |

## Verification (actual)
- `npm ci`: clean install, Prisma client regenerated (v6.19.3, `coachLtvPeak` delegate present).
- `npx tsc --noEmit`: **0 errors**.
- `npm run lint` on touched files: **0 errors**, 1 warning — `startOfLastMonth` unused-var, **pre-existing at base** (`git show HEAD:...` confirms), not introduced here.
- `npx jest test/ltv-metrics.service.spec.ts`: **32 passed / 32 total** (Test Suites: 1 passed). New tests:
  - peak: persisted>current → returns persisted, `is_new_rpcm_record=false`, no upsert; current>persisted → upserts + `=true`; tie → not a record; first-run (null row) → creates + records current.
  - streak: persisted floor not regressed across simulated month boundary; advanced streak persisted via upsert.
  - LTV-1: estimate flag + note true when <3 cancellations; false/null when ≥3.
  - LTV-2: `nrr_is_stub` present and true.
  - All pre-existing tests remain green.

## Source / spec
Brief: `specs/WAVE1_LTV_BRIEF.md`. Model `CoachLtvPeak` (`@@map("coach_ltv_peak")`) from Wave-0 (`prisma/schema.prisma`): `id`, `coach_id` (`@unique` FK→User), `zero_churn_streak Int @default(0)`, `all_time_peak_rpcm Decimal(20,6) @default(0)`, `updated_at`.

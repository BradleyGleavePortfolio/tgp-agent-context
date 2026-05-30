# WAVE-1 LTV — LTV metrics fixes (issues LTV-1, LTV-2, LTV-3)

## Role
BUILDER (Opus 4.8). Worktree `/home/user/workspace/wt-ltv` only. R4 identity `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers. Push every ~2 min (R61). api_credentials=["github"] for git ops.

## Repo / base / branch
- Repo `growth-project-backend`. Base `origin/main` @ `9c191be` (includes Wave-0 `coach_ltv_peak` table = model `CoachLtvPeak`, `@@map("coach_ltv_peak")`: `id`, `coach_id` FK→User `@unique`, `zero_churn_streak Int @default(0)`, `all_time_peak_rpcm Decimal(20,6) @default(0)`, `updated_at`).
- Branch `issues/ltv-metrics-fixes`.

## Scope — files you may edit (file-disjoint from all other Wave-1 units)
PRIMARY: `src/coach/command-center/ltv-metrics.service.ts`. You MAY also touch its DTO `src/coach/command-center/ltv-metrics.dto.ts` and its spec/test, IF needed for new response fields. DO NOT touch `command-center.service.ts`/`command-center.controller.ts` (owned by the CC+SC unit), DO NOT touch `prisma/schema.prisma` (table exists — NO migrations), DO NOT touch any other module.

## The three issues
- **LTV-3 (📊, the main one — now unblocked by Wave-0)**: `ltv-metrics.service.ts:279-294` — `zero_churn_streak` (`computeZeroChurnStreak`) and `all_time_peak_rpcm` (`estimatePeakRpcm`) are recomputed-not-persisted and regress month-over-month. PERSIST them in the new `CoachLtvPeak` table. On each metrics computation for a coach: read the coach's `CoachLtvPeak` row (one per `coach_id`). For `all_time_peak_rpcm`: the persisted peak is the SOURCE OF TRUTH — `newPeak = max(persistedPeak, currentRpcmCents)`; if currentRpcm > persistedPeak, upsert the new peak (and that's when `isNewRpcmRecord` is true). For `zero_churn_streak`: persist the computed streak so it survives the month boundary without regressing (use the persisted value as a floor / continuation per the existing TODO intent — read the current compute logic and persist its result, never letting a transient recompute drop a real historical peak). Use upsert-by-`coach_id`. Keep response field names stable (`all_time_peak_rpcm`, `zero_churn_streak`, `isNewRpcmRecord`).
- **LTV-1 (📊💰)**: `:197-207` — `estimated_ltv` uses a hardcoded 6-month industry stub but is displayed as a real dollar figure. The code ALREADY sets `lifespanIsEstimate`/`lifespanEstimateNote` when <3 cancellations. Ensure the RESPONSE surfaces an explicit `estimated_ltv_is_stub`/`is_estimate` boolean + the note so the frontend can label it as an estimate, not a hard number. If such a flag already exists in the response, verify it's wired; if not, add it to the DTO + response. Do NOT fabricate a "real" LTV — just make the estimate honestly labeled.
- **LTV-2 (📊)**: `:262-271` — `net_revenue_retention_pct` is gross logo retention (1−churn), mislabeled as NRR; can't exceed 100%. Code already renamed the internal var to `grossRetentionPct` and mentions `nrr_is_stub`. VERIFY the response includes `nrr_is_stub: true` (or rename the field honestly) so the frontend stops presenting gross retention as true NRR. If `nrr_is_stub` isn't actually in the response/DTO, add it.

## Important
Read the FULL method before editing — much of LTV-1/LTV-2 may already be 90% done (estimate flags + honest comments exist). Your job is to (a) finish LTV-3 persistence via `CoachLtvPeak`, and (b) confirm/complete the LTV-1 + LTV-2 honesty flags actually reach the API response + DTO. Don't duplicate existing work.

## Tests
Extend the LTV spec: (a) peak persists — given a persisted peak higher than current rpcm, response returns the persisted peak and isNewRpcmRecord=false; current rpcm higher → upserts + isNewRpcmRecord=true; (b) zero_churn_streak persists across a simulated month boundary (doesn't regress); (c) estimated_ltv response carries the is-estimate flag when <3 cancellations; (d) nrr_is_stub present/true. Keep existing tests green.

## Verify (run, report actual counts)
`npm ci` if needed. `npx tsc --noEmit` (0 errors); `npm run lint` (no NEW errors in touched files); `npx jest` on the LTV spec (counts); `npm run build` if quick.

## Deliverables
Push branch; open PR `Wave1 LTV: persist peak/streak (coach_ltv_peak) + honest estimate/NRR flags` to main (gh, #). Build report `specs/WAVE1_LTV_BUILD_REPORT.md` (what was already done vs what you added, the CoachLtvPeak upsert approach, response-flag changes, test counts, final SHA), commit (R4) + push to docs main after rebase. Report final SHA, PR#, counts. Builder record — GPT-5.5 auditor re-checks at your SHA.

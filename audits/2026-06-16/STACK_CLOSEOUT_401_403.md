# Stack Closeout — #401 / #403 (R81 cleanup) — 2026-06-16

## Outcome
Both PRs MERGED to `main`, bottom-up, full R81 gate satisfied.

| Step | PR | Result |
|---|---|---|
| 1 | #401 Named Regimes | merged to main → `b6cb4cfb` (LOC cap WAIVED: pre-400-rule grandfather <1000 LOC; refactor tracked in issue #422) |
| 2 | #403 fix/pr401-r81-cleanup | rebased onto main, dual-CLEAN audit held, merged → main `8d22a4f6`, branch deleted |

Final main HEAD: **`8d22a4f68a727eaa42511e38ab426f01d0627e65`**

## Parallelization failure that was corrected (operator-flagged)
The prior sequence audited #403 on pre-rebase head `0709b02d`, then merged #401 (which moved main to `b6cb4cfb`), producing a STALE audit + a rebase conflict — the audited SHA no longer matched what would merge. This violated the stacked-PR discipline.

**Correction applied:**
1. Rebased #403 (`fix/pr401-r81-cleanup`) onto the new main `b6cb4cfb` in an ISOLATED worktree (Opus 4.8).
2. Applied an explicit DRIFT-CHECK GATE: if rebase is a pure ancestry re-parent (no content change), the dual-CLEAN audit holds; if ANY content drift, STOP and re-audit on the new head before merge.
3. **DRIFT VERDICT: NO DRIFT** (rigorously verified — see below). The audited tree on `0709b02d` is semantically identical to the merged tree on `f9e8191e`.
4. Re-verified all 4 CI lanes GREEN on the exact rebased head `f9e8191e` before merging.

### Drift verification detail
- Post-rebase head: `f9e8191e844bdb3804397a7b743afda5e345f12f`
- 1 conflict only: `test/openapi-spec.spec.ts` — both #403 and main (#401's other parent) independently made the SAME logical fix (raise AppModule-compile timeout 20s→60s). Resolved to #403's intended final state; resulting file byte-identical to #403's approved head.
- All non-openapi files: content-only diff vs approved head → byte-identical (only blob hashes + a schema.prisma hunk-header line-number shift differ; the actual `decided_by_coach_id`→`decided_by_coach_user_id` change unchanged).
- All #403 fixes confirmed present: decide() zero-row race throw, updateRegime FOR UPDATE lock, P2002-catch idempotent skip, coach-only RLS migration, rename migration, @Throttle on write routes, take-cap on getRegimeRevisions, typed Prisma double via sanctioned @ts-expect-error.

## Doctrine lesson (binding for next operator)
**Stacked PRs on the same files are sequentially dependent.** Correct order:
1. Rebase the upper PR onto the FINAL base first.
2. Dual-audit on the FINAL rebased head (or prove NO DRIFT from a prior audit).
3. The dual-CLEAN audit MUST pin to the exact SHA that merges.
4. Merge bottom-up.

A NO-DRIFT mechanical rebase preserves a prior dual-CLEAN audit; a DRIFTED rebase mandates re-audit on the new head before merge.

## Watchdog
Hourly cron `31091f86` updated to add a per-run ZOMBIE/STALL check on in-flight agents (git-activity proxy on active branches), persisting baseline SHAs to `cron_tracking/31091f86/state.md`.

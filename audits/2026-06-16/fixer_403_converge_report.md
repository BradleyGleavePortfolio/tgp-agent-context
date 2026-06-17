# R81 Fixer — PR #403 Converge Report

**Branch:** `fix/pr401-r81-cleanup` (base `feature/named-regimes` = #401 head `43147109`)
**New head SHA:** `0709b02d5963010748eb7e1752070f457ccd2e09`
**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com> (no co-author trailer)
**Mergeable:** `MERGEABLE` (was `CONFLICTING`/`DIRTY`). NOT merged.

## STEP 1 — Rebase

Rebased the 8 #403 commits onto `feature/named-regimes`. The first commit
(`27484e0` "break 5-module DI cycle via BillingPrimitivesModule") conflicted in
`src/checkout/checkout.module.ts` and `src/regimes/regimes.module.ts`.

**Root cause:** the base branch already broke the DI cycle, but with a *simpler*
mechanism — `RegimesModule` imports `PackagesModule` directly and obtains its
guards from the `@Global SecurityGuardsModule` (no `forwardRef`, acyclic). The
#403 commit had invented a parallel `BillingPrimitivesModule` re-export to solve
the same goal.

**Resolution:** took the base ("ours") version of both module files (goal
already achieved upstream) and dropped the now-redundant
`src/billing/billing-primitives.module.ts` that the commit added — avoiding a
parallel module. Remaining 7 commits applied cleanly. Result: acyclic graph, no
duplicate module, F1 intact.

## STEP 2 — Findings

| Finding | Disposition | Notes |
|---|---|---|
| **P1-1** RACE in `decide()` | **NEWLY FIXED** | Was still open on #403. Captured `updated.count`; throw `NotFoundException('Refund decision already decided')` inside the tx when zero rows match, so the tx rolls back and `cancelPendingForPurchase` only runs when the guarded update actually persisted. A concurrent keep_drops/unassign_drops loser can no longer cancel the buyer's drops. Test added (`decide` zero-row branch: throws + does NOT call cancel). |
| **P2-3** LOCK in `updateRegime` | **NEWLY FIXED** | Was still open on #403. Added `SELECT "id" FROM "WorkoutProgram" WHERE "id" = ${id} FOR UPDATE` (parameterised) at the top of the tx — the sanctioned `lockPlanAndHead` pattern from `workout-builder-autosave.service.ts`. Concurrent edits serialise, so the `findFirst(desc)+create` revision_index allocation no longer 500s on the `@@unique([program_id, revision_index])`. Zero-row lock result → in-tx 404. Tests added (lock-taken/index=head+1, first revision index 0, in-tx 404 when row vanished). |
| **P2-1** BANNED CAST | **NEWLY FIXED** | `prisma-test-double.ts` used the banned double-assertion. Replaced with a justified `@ts-expect-error` (the repo's R0-sanctioned escape, mirroring `src/community/voice/__tests__`); parameter stays typed `PartialPrisma` for autocomplete. Also corrected the stale "No `as any` / [banned cast]" claim in the `regime-revision-retention.service.spec.ts` header. `grep -rE "as unknown as|@ts-ignore|as any" src/regimes` → 0 hits (code + comments). |
| **P3-2** column rename | **NEWLY FIXED (safe)** | `decided_by_coach_id` → `decided_by_coach_user_id`. Done as an additive `RENAME COLUMN` migration (`20261218000200_rename_decided_by_coach_user_id`). Safe: feature flag OFF, table empty in all envs (pure metadata op), timestamp strictly after both the #401 DDL and #403's RLS migration, and the RLS policies derive the owning coach via the parent ClientPurchase (never reference this column) so no conflict. Updated `schema.prisma` + the single service write site. |
| P3-1 sub-coach scope | **SKIPPED** | Product-confirmed exclusion. |
| P3-3 / dupe-const | **SKIPPED** | Cosmetic, non-trivial — not in scope. |

## Verification (full checkout, not sparse)

- `npx tsc --noEmit` — **PASS** (confirms `@ts-expect-error` fires correctly under strict; all edits compile).
- `npm run lint` — **PASS** (0 errors; only pre-existing warnings, incl. a pre-existing unused-import warning on the regimes spec that is also present on base).
- `npm run build` (`nest build`) — **PASS**.
- `npx jest src/regimes --runInBand` — **30/30 PASS** (5 suites), including the 4 new tests.
- `npx jest test/partial-refund-decision-rls-migration.spec.ts test/doctrine-cleanup.spec.ts` — **13/13 PASS** (RLS static-integrity + schema doctrine guard unaffected by the rename).

## CI status

Pushed `0709b02`. **All 4 required lanes GREEN** (run 27655434937):

- `build-and-test`: **SUCCESS**
- `rls-floor-guard`: **SUCCESS**
- `rls-live-tests`: **SUCCESS**
- `mwb-3-live-tests`: **SUCCESS**

PR #403 final state: `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`. NOT merged (per instruction).

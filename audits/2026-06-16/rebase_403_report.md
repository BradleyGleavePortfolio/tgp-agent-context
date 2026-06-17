# PR #403 Rebase Report — fix/pr401-r81-cleanup onto main

**Task:** Mechanical rebase of PR #403 ("fix(pr401): R81 cleanup") onto current `main` after #401 merged. Zero content drift.

## Head SHAs
| | SHA |
|---|---|
| Pre-rebase head | `0709b02d5963010748eb7e1752070f457ccd2e09` |
| Target base (main) | `b6cb4cfb18380ab33000cbaad879aa5534e6eae9` |
| Pre-rebase merge-base | `43147109ac30bc383a6b7aa13aecdd82ba1413f1` (= 2nd parent of #401 merge) |
| **Post-rebase new head** | **`f9e8191e844bdb3804397a7b743afda5e345f12f`** |

> Note: repo arrived as a shallow sparse worktree; `origin/main` had no common ancestor locally. Ran `git fetch --unshallow` to recover the true merge-base before rebasing. No content impact.

## Rebase outcome
All 8 of #403's commits re-applied on top of `b6cb4cfb`. Authorship preserved as **Bradley Gleave <bradley@bradleytgpcoaching.com>** on every commit; **no co-author trailer** added.

Commits (main..HEAD):
- f9e8191 fix(regimes): R81 #401 converge — decide() zero-row race, updateRegime row-lock, typed Prisma double, column rename
- 3c2ae0a test(regimes): pin write-route @Throttle metadata (R79 F6)
- 7bc581e test(openapi): raise AppModule-compile beforeAll timeout to 60s (R81 F1 CI)
- f54042f fix(regimes): add take cap to getRegimeRevisions findMany (R81 F5)
- 5b6520c fix(regimes): add @Throttle to regime + refund-decision write routes (R81 F4)
- 61477c1 test(regimes): rename RLS migration spec so jest does not ignore it (R81 F3)
- ce9348e feat(regimes): add coach-only RLS for PartialRefundDecision via additive migration (R81 F3)
- 7b5a08a fix(regimes): tx-wrap onPartialRefund find+create with P2002 idempotent skip (R81 F2)

## Conflicts + resolution
**1 conflicting file:** `test/openapi-spec.spec.ts` (at commit raising the beforeAll timeout).

- **Cause:** Both #403 and main (via #401's other parent `28c5f75`) independently made the *same logical fix* — raise the OpenAPI AppModule-compile timeout from 20s to 60s, adding an explanatory comment. Only the comment wording and the literal style (`60000` vs `60_000`) differed.
- **Resolution:** Kept **#403's intended final state** (the `60_000` literal + #403's comment block) for both conflict hunks, per task instruction. The resulting file is **byte-identical to #403's approved head** (`git diff 0709b02:...spec.ts HEAD:...spec.ts` → empty).
- All other #403 files (regimes service/controllers, migrations `20261218000100_rls_partial_refund_decision` & `20261218000200_rename_decided_by_coach_user_id`, regimes tests) re-applied cleanly with **no conflicts** — their content does not overlap main's changes.

## DRIFT VERDICT: **NO DRIFT**

The effective tree #403 produces on top of main is semantically identical to what the dual auditors approved on `0709b02`.

Verification performed:
- **Non-openapi files:** content-only comparison of `git diff <pre-mb>..0709b02` vs `git diff main..<new-head>` (added/removed lines, ignoring blob-index hashes and hunk-header line numbers) → **byte-identical**. The only metadata deltas are blob hashes and a hunk header shifting `4113`→`4117` in `schema.prisma` (main added 4 lines above `PartialRefundDecision`); the actual change `decided_by_coach_id` → `decided_by_coach_user_id` is unchanged.
- **openapi-spec.spec.ts:** final file byte-identical to approved #403 head. The net change vs main is cosmetic only (comment wording + `60000`→`60_000`, numerically equal → same 60s timeout). No behavior change.
- All #403 fixes confirmed present: decide() zero-row race throw, updateRegime FOR UPDATE lock, P2002-catch idempotent skip, RLS migration, rename migration, @Throttle on write routes, take-cap on getRegimeRevisions, typed Prisma double via @ts-expect-error.

**No re-audit required** — the rebase only re-parented ancestry; it forced no real content change.

## Mergeable state
- `mergeable`: **MERGEABLE**
- `mergeStateStatus`: UNSTABLE → (pending CI; no longer CONFLICTING)
- base: `main`, head: `f9e8191`

## CI status (4 lanes)
_Run: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/27656360182_

| Lane | Conclusion |
|---|---|
| build-and-test | _pending — see below_ |
| rls-floor-guard | _pending — see below_ |
| rls-live-tests | _pending — see below_ |
| mwb-3-live-tests | _pending — see below_ |

(Updated after CI completion below.)

## Not merged
Per instruction, PR #403 was **NOT merged**.

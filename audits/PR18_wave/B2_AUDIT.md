# AUDIT — PR-18 B2 content scope + display-order polish (PR #344)

HEAD verified: `b9a4568f394b840fcfcddcacb6d33fff8e4fd9ee`.
Write-set verified: only `src/packages/package-contents.controller.ts`, `src/packages/package-contents.service.ts`, and `test/package-contents.service.spec.ts` differ from `origin/main`; `SubCoachScopeService` was used, not modified.

Typecheck: fail/incomplete — ran `cd /home/user/workspace/wt-b2-content && npx tsc --noEmit`; process was killed by the environment before completion. An earlier accidental run outside the worktree failed because it did not see the repo TypeScript install; the in-worktree run is the relevant result.
Lint: pass — ran `cd /home/user/workspace/wt-b2-content && npx eslint src/packages/package-contents.controller.ts src/packages/package-contents.service.ts test/package-contents.service.spec.ts`.
Tests: fail/incomplete — ran `cd /home/user/workspace/wt-b2-content && npx jest test/package-contents.service.spec.ts --runInBand`; process was killed by the environment before completion.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [src/packages/package-contents.service.ts:282-320] `patch()` still accepts a `display_order` with zero active holders and writes it directly, so a coach can move a row from a contiguous list (for example `0,1,2`) to order `5`, leaving gaps (`1,2,5`). This violates the B2 requirement that swap-aware patch preserve a bijection with no gaps and that patching to an empty order be rejected. The tests encode the wrong behavior as accepted legacy behavior at [test/package-contents.service.spec.ts:1407-1415], despite the brief requiring empty-order rejection. Fix by rejecting `holders.length === 0` when the requested order differs from the row's current order (or equivalently validating the target belongs to the current active order set under the advisory lock), leaving multi-row moves to `/reorder`.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Item 1, sub-coach fork-on-attach guard: verified for current asset types. The controller forwards both `actorUserId` and `tenantCoachId` at [src/packages/package-contents.controller.ts:84-88]. The service checks actor head-team membership through `SubCoachScopeService.getHeadCoachIdForSubCoach()` and denies mismatched actors with `ASSET_NOT_FOUND` at [src/packages/package-contents.service.ts:653-671]. The client-bound hook gates non-null client contexts through `canAccessClient()` at [src/packages/package-contents.service.ts:679-692]; for current schema-backed package asset types, `clientContextForAsset()` returns null and the underlying models are coach-global, not client-bound. The original tenant asset ownership check remains at [src/packages/package-contents.service.ts:120] and [src/packages/package-contents.service.ts:733-800]. The actor-scope check is repeated inside the transaction after acquiring the package-order advisory lock at [src/packages/package-contents.service.ts:129-142].
- Item 2, soft-delete compaction: verified. `softDelete()` re-reads under the existing package-order advisory lock, marks only the target row removed, and decrements only active `CoachPackageContent` rows with greater `display_order`; it does not touch removed rows or `ScheduledDrop` rows at [src/packages/package-contents.service.ts:366-405]. Already-removed rows return without compaction at [src/packages/package-contents.service.ts:364] and [src/packages/package-contents.service.ts:381].
- Item 3, swap-aware patch: partially verified but not clean. Single-holder collisions swap under the advisory lock at [src/packages/package-contents.service.ts:250-320], and ambiguous `>1` target holders still reject at [src/packages/package-contents.service.ts:293-300]. However, zero-holder/empty target orders are still accepted, creating gaps; see P2 above.

VERDICT: NOT-CLEAN

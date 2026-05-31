# AUDIT — PR-18 B2 content scope + display-order polish re-audit (PR #344)

Re-audit target: fixed pinned HEAD `8991cafebc88b40c7540c2d1cf637a04b21c77d1` in `/home/user/workspace/wt-b2-content`.

HEAD verified: `8991cafebc88b40c7540c2d1cf637a04b21c77d1`.
Write-set verified: only `src/packages/package-contents.controller.ts`, `src/packages/package-contents.service.ts`, and `test/package-contents.service.spec.ts` differ from `origin/main`.

Typecheck: pass — ran `cd /home/user/workspace/wt-b2-content && npx tsc --noEmit`; completed with exit 0 and no errors.
Lint: pass — ran `cd /home/user/workspace/wt-b2-content && npx eslint src/packages/package-contents.controller.ts src/packages/package-contents.service.ts test/package-contents.service.spec.ts`; completed with exit 0 and no errors/warnings.
Tests: pass — ran `cd /home/user/workspace/wt-b2-content && npx jest test/package-contents.service.spec.ts --runInBand`; 1 suite passed, 68/68 tests passed.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of prior P2 fix
- Fixed. `patch()` now runs display-order changes under the per-package advisory lock, re-fetches the active row, and rejects a requested `display_order` held by zero active rows with `DISPLAY_ORDER_OUT_OF_RANGE` at `src/packages/package-contents.service.ts:250-320`. This prevents the previously observed gap case (`0,1,2` → `1,2,5`).
- Single-row patch is now limited to a true transposition: same-order requests skip swap logic, exactly-one-holder targets swap the holder into the row's old slot, and ambiguous `>1`-holder targets still reject `DISPLAY_ORDER_TAKEN` at `src/packages/package-contents.service.ts:291-334`.
- The previously wrong test was corrected rather than hidden. The dedicated regression now asserts that patching to an empty slot is rejected and that the active set remains `[0,1,2]` at `test/package-contents.service.spec.ts:1432-1448`. The adjacent/non-adjacent swap, same-order no-op, and ambiguous duplicate-holder cases are covered at `test/package-contents.service.spec.ts:1382-1470`.

## Regression checks
- Sub-coach attach guard remains intact. The controller passes both `actorUserId` and `tenantCoachId` at `src/packages/package-contents.controller.ts:84-88`; the service checks `SubCoachScopeService.getHeadCoachIdForSubCoach()` before asset disclosure, gates client-bound assets through `canAccessClient()`, returns `ASSET_NOT_FOUND`/404 style errors, and re-runs the actor-scope check inside the advisory-lock transaction before insert at `src/packages/package-contents.service.ts:95-142` and `src/packages/package-contents.service.ts:661-713`. Tests cover head coach, same-team sub-coach, different-team sub-coach, client-bound deny/allow, and head-actor tenant mismatch at `test/package-contents.service.spec.ts:782-886`.
- Soft-delete compaction remains intact. `softDelete()` marks only the target row removed under the per-package advisory lock, then decrements only active rows with greater `display_order`; already-removed rows return idempotently without a second compaction, and no `ScheduledDrop` rows are touched at `src/packages/package-contents.service.ts:364-425`. Tests cover middle/first/last delete, append after delete, already-removed idempotence, lock acquisition, and delete-vs-attach interleaving at `test/package-contents.service.spec.ts:1249-1355`.

## Merge bar
- No open P0/P1/P2 findings.

VERDICT: CLEAN

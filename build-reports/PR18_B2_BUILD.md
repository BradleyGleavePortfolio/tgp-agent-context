# PR-18 (B2) — Build Report: sub-coach attach guard + display-order compaction/swap

**Branch:** `pr18/b2-content-scope-order` (off backend main `19e51b0`)
**Builder:** Dynasia G (Opus 4.8)
**HEAD SHA:** `b9a4568f394b840fcfcddcacb6d33fff8e4fd9ee`
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §2.3, §3.1, §3.2, §4(B2)
**Brief:** `specs/PR18_B2_CONTENT_SCOPE_ORDER_BRIEF.md`

## Write-set (STRICT — only these touched)
- `src/packages/package-contents.controller.ts`
- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

No other files modified. `SubCoachScopeService` is INJECTED + used only (not modified); it is provided by the `@Global` `SubCoachModule`, so no module wiring change was required.

Diffstat vs base `19e51b0`:
```
 src/packages/package-contents.controller.ts |  14 +-
 src/packages/package-contents.service.ts    | 263 +++++++++++++-
 test/package-contents.service.spec.ts        | 541 +++++++++++++++++++++++-----
 3 files changed, 713 insertions(+), 105 deletions(-)
```

## Item 1 — Sub-coach fork-on-attach guard (IDOR / privilege escalation, #5)
- **Controller** (`package-contents.controller.ts` attach handler): now resolves BOTH
  `actorUserId = req.user.id` AND `tenantCoachId = await resolveEffectiveCoachId(actorUserId)`
  and passes both to the service. Previously it passed ONLY the promoted (head) id, which let a
  sub-coach attach a head-owned asset without proving sub-coach scope.
- **Service** `attach(actorUserId, tenantCoachId, packageId, body)`:
  - Injected `SubCoachScopeService`.
  - New `assertActorCanAttachAsset(actorUserId, tenantCoachId, assetType, input)`:
    - Head-coach actor (`getHeadCoachIdForSubCoach === null`): requires `actorUserId === tenantCoachId`;
      the existing tenant ownership check is the sufficient gate.
    - Sub-coach actor: requires `getHeadCoachIdForSubCoach(actorUserId) === tenantCoachId`
      (routed through `SubCoachScopeService`, NOT raw `User.coach_id`). For client-bound assets it
      additionally requires `canAccessClient(actorUserId, clientId)`. All asset types wired today are
      tenant-global coach media with NO client dimension (WorkoutPlan / DailyMealPlan / CoachMediaAsset
      key only on `coach_id`), so head-team membership is the default-safe allow. A `clientContextForAsset`
      hook centralises the client-id mapping so any future client-private asset type AUTOMATICALLY forces
      the `canAccessClient` gate (deny-by-default).
    - Any failure throws `NotFoundException` (`ASSET_NOT_FOUND`) — no existence leak across scopes.
  - The existing head-coach asset-ownership check (`assertAssetOwnedByCoach`) is kept as an ADDITIONAL gate.
  - **Race (TOCTOU):** the actor-scope check is re-run inside the existing per-package display-order
    transaction/advisory lock immediately before the insert, so a revoked sub-coach assignment between
    the up-front guard and the insert is caught.

## Item 2 — PR-8 display_order compaction on soft delete
- `softDelete()` now, after idempotently marking a non-removed row removed, acquires the EXISTING
  per-package display-order advisory lock and decrements `display_order` by 1 for every ACTIVE
  (`removed_at IS NULL`) row whose order was strictly greater than the removed row's order
  (single set-based `updateMany`, no N+1).
- Idempotent: an already-removed row (pre-lock or via a racing delete observed under the lock) returns
  as-is and performs NO compaction. Removed rows are never mutated; content is never resurrected.
- `ScheduledDrop` rows are NEVER touched (PR-9 snapshots reference content by id, so buyers' drops keep
  their snapshotted order). Only active `CoachPackageContent` rows compact.

## Item 3 — PR-8 swap-aware patch (`DISPLAY_ORDER_TAKEN` dead-end)
- Patch-with-display-order, under the EXISTING advisory lock: when the target order is held by EXACTLY
  ONE active row, swap that row into the patched row's old order, then set the patched row to the
  requested order (a transposition — still a bijection over the active set, no gaps, no duplicates,
  no negatives — zod rejects `< 0` before we reach the swap).
- Patch to the row's own current order = no-op (swap skipped).
- AMBIGUOUS state (>1 active row already holds the target — corrupt set) still rejects with
  `DISPLAY_ORDER_TAKEN` and directs the caller to `/reorder`.
- Full `/reorder` multi-row path unchanged. `ScheduledDrop` rows never reordered.

## Tests (`test/package-contents.service.spec.ts`)
Added/updated coverage:
- **Item 1:** head coach attaches own asset (unchanged); sub-coach on the head team can attach;
  sub-coach on a DIFFERENT head team → 404 (no leak); client-bound asset with sub-coach NOT assigned to
  the client → 404 `ASSET_NOT_FOUND` (and `canAccessClient` is consulted); client-bound asset with the
  sub-coach assigned → succeeds; head-actor-with-foreign-tenant → 404. Controller path covered via the
  service's actor/tenant split (the controller forwards both).
- **Item 2:** delete MIDDLE/FIRST/LAST compacts active orders to contiguous `0..n-1`; subsequent append
  reuses the freed tail slot; deleting an already-removed row stays idempotent and does NOT re-compact;
  softDelete acquires the lock; delete-vs-attach interleaving preserves distinct contiguous orders.
- **Item 3:** adjacent swap; non-adjacent swap; swap acquires the lock; patch-to-own-order no-op; patch to
  a free slot; negative order rejected; ambiguous (>1 holder) rejected. The pre-existing
  `DISPLAY_ORDER_TAKEN` single-collision test was updated to assert the new swap behaviour, and the
  concurrent-same-order test now asserts exactly one row at the target with no duplicates.
- All pre-existing race / lock / IDOR / cadence-validation / auto_message tests retained and passing
  (existing 3-arg `attach` calls migrated to the 4-arg `attach(actor, tenant, pkg, body)` signature).

## Verification (run by the builder in the worktree)
- **Typecheck:** `npx tsc --noEmit -p tsconfig.json` → PASS (exit 0).
- **Lint:** `npx eslint src/packages/package-contents.controller.ts src/packages/package-contents.service.ts` → PASS (0 errors, 0 warnings). `npx eslint test/package-contents.service.spec.ts` → PASS (0 errors, 0 warnings).
- **Tests:** `npx jest test/package-contents.service.spec.ts --runInBand` → **68 passed, 1 suite passed**.

## Doctrine
- Commits authored as `Dynasia G <dynasia@trygrowthproject.com>` (R4 STRICT) with NO trailers.
- All display-order mutations (attach append, patch swap, reorder, soft-delete compaction) run under the
  existing per-package `pg_advisory_xact_lock`.
- Pushed to `origin pr18/b2-content-scope-order`.

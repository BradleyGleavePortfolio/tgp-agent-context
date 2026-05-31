# PR-18 / B2 — Backend content scope + display-order polish

**Repo:** growth-project-backend. **Off backend main `19e51b0`.** Builder = Opus 4.8.
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §2.3, §3.1, §3.2, §4(B2).

## Write-set (STRICT — touch ONLY these)
- `src/packages/package-contents.controller.ts`
- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

Do NOT touch `packages.service.ts`, `drip-dispatcher.cron.ts`, `landing-pages.*`, or any sub-coach service file (use the EXISTING `SubCoachScopeService` by injection, do not modify it).

## Item 1 — Sub-coach fork-on-attach guard (IDOR / privilege escalation)
Current gap: attach controller (~`:70-79`) resolves `coachId = resolveEffectiveCoachId(req.user.id)` (promotes sub-coach → head) and the attach service (~`:75-91`) checks only head/tenant ownership. A sub-coach can attach a head-owned asset without proving sub-coach scope.
1. Controller: pass BOTH `actorUserId = req.user.id` AND `tenantCoachId = await resolveEffectiveCoachId(req.user.id)` into attach/fork. Do not pass only the promoted ID.
2. Inject/use `SubCoachScopeService` in `PackageContentsService`.
3. Add `assertActorCanAttachAsset(actorUserId, tenantCoachId, assetType, input)`:
   - Head coach actor → existing ownership checks suffice.
   - Sub-coach actor → require `getHeadCoachIdForSubCoach(actorUserId) === tenantCoachId`, then enforce client scope via `SubCoachScopeService` (NOT raw `User.coach_id`).
   - Client-context assets → check `canAccessClient(actorUserId, clientId)`. Global coach media with no client dimension → default-safe: allow only if no client-private context AND actor belongs to head-coach team; DENY client-bound assets outside `canAccessClient()`.
4. Keep existing head-coach asset-ownership check (additional gate, not replacement).
5. Return `NotFoundException`/404-style for unauthorized assets (do not leak existence across scopes).
6. Race: re-check scope just before insert; if stricter, wrap with the existing display-order transaction.

## Item 2 — PR-8 display_order compaction on soft delete
- `softDelete()` (~`:253-277`) currently only stamps `removed_at`; gaps persist (append uses `max+1`, ~`:455-465`).
- After idempotently marking a non-removed row removed, acquire the EXISTING per-package display-order advisory lock and decrement `display_order` for non-removed rows whose order was greater than the removed row.
- Keep idempotent for already-removed rows. Never mutate removed rows; never resurrect content. Do NOT reorder `ScheduledDrop` rows (snapshot invariant) — only active `CoachPackageContent` rows compact.

## Item 3 — PR-8 swap-aware patch (`DISPLAY_ORDER_TAKEN` dead-end)
- Patch-with-display-order (~`:225-242`) currently throws `DISPLAY_ORDER_TAKEN` on collision.
- Under the EXISTING advisory lock: when target order is held by exactly ONE active row, swap that row into the patched row's old order, then set the patched row to the requested order.
- Preserve duplicate rejection for out-of-range/ambiguous states. Keep full `/reorder` for multi-row moves. Patch to same order = no-op. Never create gaps or negative orders.

## Tests (`test/package-contents.service.spec.ts`)
- Head coach attaches own asset (unchanged). Sub-coach assigned to client/context can attach. Sub-coach on same head team but NOT assigned to client → 404/`ASSET_NOT_FOUND`. Controller passes both actor + tenant.
- Delete middle row → active orders compact to contiguous `0..n-1`. Deleting already-removed row stays idempotent. Delete-vs-attach/reorder interleaving preserves distinct orders.
- Adjacent swap succeeds, unique contiguous orders. Non-adjacent swap succeeds if target exists. Patch to empty order rejected (no gaps). Existing race tests still pass.

## Doctrine
- Commit (R4 STRICT, NO trailers): `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m "..."`.
- Push every ~2 min to `pr18/b2-content-scope-order` (R61). `api_credentials=["github"]` for all git.
- Keep all display-order mutations under the existing per-package advisory lock. Bar = CLEAN P0/P1/P2.

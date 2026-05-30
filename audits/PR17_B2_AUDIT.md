# AUDIT — PR-17 B2: package push service + endpoints + DTO (PR #330)
VERDICT: NOT CLEAN

SHA-bound verdict: audited `/home/user/workspace/audit-pr17-b2` at `ee0432e8d3666a38a08f243b27203b85877db1d6` (confirmed by `git rev-parse HEAD`).

Typecheck: pass — ran `cd /home/user/workspace/audit-pr17-b2 && npx tsc --noEmit` (exit 0).
Lint: pass with warnings — ran `cd /home/user/workspace/audit-pr17-b2 && npm run lint` (exit 0; 17 pre-existing warnings, 0 errors).
Tests: pass for requested suites — ran `npx jest test/package-push.service.spec.ts --runInBand` (1 suite / 23 tests passed) and `npx jest packages --runInBand` (1 suite / 33 tests passed; note this Jest pattern only matched `test/packages.service.spec.ts`).

## P0 findings
- [src/packages/package-contents.controller.ts:168, src/packages/package-push.service.ts:187-190, src/packages/package-push.service.ts:206-210, src/packages/package-push.service.ts:237-248, src/packages/package-push.service.ts:333-342] `resend` is not idempotent after the first re-send has shipped/fired. The controller/service only log the `Idempotency-Key`; there is no UUID validation, persisted idempotency record, or request-level dedup. For `resend`, the service reads existing drops before the transaction and always seeds `max(push_seq)+1` whenever the latest drop is shipped. A due-now re-send is immediately stamped `status='fired'`; replaying the same request/header then sees the just-created seq-1 row as shipped and creates seq-2, producing a second fresh delivery. The same happens for a forward-dated re-send if the client retries after the cron delivers seq-1. This violates the frozen #8 contract that a replayed identical request lands on the same seq and `skipDuplicates` no-ops; it is a P0 double-action bug on the correctness core. Concrete fix: persist and enforce the mutation `Idempotency-Key` for this endpoint, and/or compute target resend seq from a stable request-scoped marker inside the transaction rather than from mutable latest shipped state; add a test that replays a due-now `mode:'resend'` request with the same idempotency key after seq-1 is `fired` and asserts no seq-2 row/materialise call.

## P1 findings
- None.

## P2 findings
- [src/packages/package-push.service.ts:193-218, src/packages/package-push.service.ts:263-347, test/package-push.service.spec.ts:493-508] Large-audience pushes are unbounded while the implementation keeps all seed creation, re-read, and due-now materialisation in one interactive transaction. The spec's watchpoint explicitly calls out 10k+ buyer audiences as a statement/transaction-timeout risk requiring a cap, pagination, or an operator decision; this code has no max audience guard and the test only proves 1,201 rows are chunked, not that production-scale `all`/`active` audiences are safe. Concrete fix: enforce a documented maximum audience size for the synchronous endpoint, or move to a paged/background job design with explicit partial-failure semantics.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Scope claim: verified. The PR diff touches only `src/packages/package-push.service.ts`, `src/packages/package-contents.dto.ts`, `src/packages/package-contents.controller.ts`, `src/packages/packages.module.ts`, and `test/package-push.service.spec.ts`; no forbidden schema/migration/cron/billing/connect/AI/mobile/feature-flag files are changed.
- Frozen POST endpoint: mostly verified. `POST v1/coach/packages/:id/contents/:contentId/push` is appended under the guarded contents controller and returns `{ scheduled, skipped, fire_at, audience, notify }`; body fields match `audience`, `cohort_purchase_ids`, `fire_at`, `mode`, and `notify` with `notify` defaulting true. Defect: the `Idempotency-Key` header is read as optional and merely logged, not UUID-validated or deduped, which is part of the P0 above.
- Frozen GET preview endpoint: verified. `GET v1/coach/packages/:id/contents/:contentId/push/preview` returns `{ count, audience, already_delivered }` and is a read-only service path.
- Guards / IDOR: verified. Both new routes inherit `JwtAuthGuard`, `CoachOrOwnerGuard`, `SubscriptionGuard`, and `@Roles('coach','owner')`; the controller calls `resolveEffectiveCoachId`, and the service calls `requireOwnedPackage` plus `requireContent(packageId, contentId)`. Cohort IDs are re-filtered with `where.package_id = packageId` and `id IN cohortPurchaseIds`.
- Resolver-key bypass: verified in the real code. Inline materialise uses `const isResend = drop.push_seq > 0` and passes `clientPurchaseId/contentId` only when `push_seq===0`; for `push_seq>0` both are `null` while `scheduledDropId` is supplied. Cron already has the same conditional. Auto-message therefore skips the pair marker and workout falls back to the per-drop key for re-sends. Media collapse on `ClientAssetGrant @@unique(client_id, media_asset_id)` is documented in the cron as expected idempotent grant behavior, not a B2 bug.
- G4 shipped-set: verified. `SHIPPED_STATUSES = ['fired','delivered']` is centralized; `push_existing` skips buyers with any existing drop for the pair, and `resend` gates on the latest drop being in the shipped set.
- Atomicity + NO Stripe: partially verified. Seeds are created through chunked `createMany({ skipDuplicates:true })` inside one `$transaction`, and no Stripe/billing references exist in the push path beyond comments/test guards. The large-audience transaction-bounding risk remains a P2 above.
- Date / `computeFireAt`: acceptable. The push path deliberately uses the coach-chosen `fire_at` directly, rejects dates before start-of-today, and snapshots cadence fields onto the drop. Not invoking `computeFireAt` does not violate §2.2 because coach-chosen date overrides cadence timing for pushes; due-now handling is the simple `fire_at <= now` check.
- Notify: verified. `notify===false` pre-stamps `alert_dispatched_at` at seed time; `notify===true` leaves it null for forward-dated cron alerting and sends inline alerts only after due-now materialisation.
- Idempotency: FALSE. `push_existing` replay after a just-created pending row no-ops, but `resend` replay after seq-1 is fired/delivered creates seq-2 because target `push_seq` is computed from mutable latest shipped state and the Idempotency-Key is not enforced.

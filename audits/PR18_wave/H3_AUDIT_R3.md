# AUDIT R3 — Fix: add @Roles('coach') defence-in-depth to coach-messaging + clean roles allowlist (PR #336)
VERDICT: CLEAN

Pinned HEAD: 27ad452cfeb04a5431ef1b9bea89af531ab6a132 (verified in isolated worktree `/home/user/workspace/r3-audit-h3`).

Finding counts: P0=0, P1=0, P2=0, P3=0.

Typecheck: PASS — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc -p tsconfig.json --noEmit --pretty false` exited 0.

Lint: PASS — `npx eslint src/messaging/coach-messaging.controller.ts test/roles-enforced.spec.ts test/coach-messaging-roles.spec.ts test/purchase-fanout-real-body.spec.ts` exited 0.

Tests: PASS — targeted `yarn jest` commands exited 0:
- `NODE_OPTIONS=--max-old-space-size=1536 yarn jest test/purchase-fanout-real-body.spec.ts --runInBand` → 1 suite passed, 10/10 tests passed.
- `NODE_OPTIONS=--max-old-space-size=1536 yarn jest test/coach-messaging-roles.spec.ts --runInBand` → 1 suite passed, 5/5 tests passed.
- `NODE_OPTIONS=--max-old-space-size=1536 yarn jest test/roles-enforced.spec.ts --runInBand` → 1 suite passed, 2/2 tests passed.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Date-determinism fix is present and narrow: `test/purchase-fanout-real-body.spec.ts:324-330` now anchors `const purchaseTime = new Date()` in the idempotency test with a comment explaining why the relative `offset_days: 30` drop must remain future-dated; both replayed `onPurchaseEntitled` calls pass the same explicit `purchaseTime` at `test/purchase-fanout-real-body.spec.ts:336` and `test/purchase-fanout-real-body.spec.ts:344`.
- The formerly-red purchase fanout idempotency test now passes in the real spec run: `test/purchase-fanout-real-body.spec.ts` reported 10/10 tests passing, including `replaying the same event leaves the SAME number of drops, immediate drop is materialised exactly once`.
- H3 production code is unchanged from R2: `git diff --quiet 572c423bf37ecaa9bc5e21a514ea41fc20a92534..27ad452cfeb04a5431ef1b9bea89af531ab6a132 -- 'src/**'` returned no diff, and the H3 write-set files `src/messaging/coach-messaging.controller.ts`, `test/roles-enforced.spec.ts`, and `test/coach-messaging-roles.spec.ts` are unchanged across the same range.
- The full R2-to-R3 diff is test-only and exactly scoped to the R2 P2: `git diff --name-status 572c423bf37ecaa9bc5e21a514ea41fc20a92534..27ad452cfeb04a5431ef1b9bea89af531ab6a132` shows only `M test/purchase-fanout-real-body.spec.ts`; `git diff --stat` shows 1 file changed, 10 insertions, 2 deletions.
- H3's original defence-in-depth remains intact: `src/messaging/coach-messaging.controller.ts:31-35` has class-level `@Roles('coach')` plus `@UseGuards(JwtAuthGuard, CoachGuard)`, and the `CoachMessagingController` handlers remain under that class-level role gate.
- The role decorator is enforced, not cosmetic: `src/app.module.ts:377-387` registers `RolesGuard` as a global `APP_GUARD`, and `src/auth/roles.guard.ts:43-48` reads class-level metadata with `reflector.getAllAndOverride(ROLES_KEY, [handler, class])`.
- The allowlist cleanup remains correct: `test/roles-enforced.spec.ts:75-77` documents that `CoachMessagingController` was removed because it now carries explicit class-level `@Roles('coach')`, and `CLASS_LEVEL_LEGACY_ALLOWLIST` at `test/roles-enforced.spec.ts:133-164` contains no `CoachMessagingController` entry.
- Fix commit metadata is clean: `27ad452cfeb04a5431ef1b9bea89af531ab6a132` is authored and committed by `Dynasia G <dynasia@trygrowthproject.com>` with subject `fix(H3): address R2 audit P2 unrelated test (date mocking)` and an empty body (no trailers).

VERDICT: CLEAN. The R2 P2 is fixed by a bounded, test-only date-determinism change; H3 production behavior and the R2-clean coach-messaging role implementation are unchanged.

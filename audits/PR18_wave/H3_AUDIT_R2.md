# AUDIT R2 — Fix: add @Roles('coach') defence-in-depth to coach-messaging + clean roles allowlist (PR #336)
VERDICT: NOT CLEAN

Pinned HEAD: 572c423bf37ecaa9bc5e21a514ea41fc20a92534 (verified after fetch/checkout; audited in an isolated pinned worktree after the shared root moved during concurrent work).

Finding counts: P0=0, P1=0, P2=1, P3=0.

Typecheck: PASS — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc -p tsconfig.json --noEmit --pretty false` exited 0.
Lint: PASS — `npx eslint src/messaging/coach-messaging.controller.ts test/roles-enforced.spec.ts test/coach-messaging-roles.spec.ts` exited 0; `npm run lint` exited 0 with 16 pre-existing warnings in unrelated `src/**` files and 0 errors.
Tests: FAIL for full Jest gate — `NODE_OPTIONS=--max-old-space-size=4096 npx jest --runInBand` completed (not killed) with 307/308 suites passing, 3755/3781 tests passing, and 1 failing test in `test/purchase-fanout-real-body.spec.ts`. Focused H3/relevant tests passed: `test/coach-messaging-roles.spec.ts` 5/5, `test/roles-enforced.spec.ts` 2/2, and existing messaging regressions (`test/messaging.service.spec.ts`, `test/messaging-voice.spec.ts`, `test/messaging.dto.spec.ts`) 39/39.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [test/purchase-fanout-real-body.spec.ts:160, test/purchase-fanout-real-body.spec.ts:320-331] Full Jest is red at the pinned SHA because the idempotency test fixes `basePurchase().created_at` to `2026-05-01T00:00:00Z` and then adds a `relative_to_purchase` content row with `offset_days: 30`; on the audit date (`2026-05-31`) that relative drop is already due, so the real fanout body materialises 2 drops while the test still asserts only the immediate drop was materialised (`expect(registry.getCalls()).toHaveLength(1)`). This is outside the H3 write-set and was reproduced by running `npx jest test/purchase-fanout-real-body.spec.ts --runInBand` alone, but it keeps the required Jest gate red. Concrete fix: freeze time in this spec or move the purchase fixture far enough in the future/past per scenario so “future relative_to_purchase” is deterministic.

## P3 (non-blocking)
- None.

## Verification of PR claims
- P2 from round 1 is closed: no `Function` type remains in the changed files (`src/messaging/coach-messaging.controller.ts`, `test/roles-enforced.spec.ts`, `test/coach-messaging-roles.spec.ts`), and the changed-files ESLint command exits 0.
- Write-set discipline against requested base `9a8e210b`: diff contains only `src/messaging/coach-messaging.controller.ts`, `test/roles-enforced.spec.ts`, and new `test/coach-messaging-roles.spec.ts`; no `payment-ops.*`, `admin.*`, `storefront-public.*`, or `real-meal-plans.*` files changed.
- `@Roles('coach')` is present at controller class level and therefore covers every handler in `CoachMessagingController` (`listThread`, `send`, `voiceUpload`, `markRead`, `unreadCount`) at `src/messaging/coach-messaging.controller.ts:31-35`.
- The role annotation is enforced, not decorative: `RolesGuard` is registered globally as an `APP_GUARD` at `src/app.module.ts:377-387`, and it reads class-level metadata via `reflector.getAllAndOverride(ROLES_KEY, [handler, class])` at `src/auth/roles.guard.ts:43-48`.
- A non-coach role gets 403, not 200: the committed focused spec asserts student rejection at `test/coach-messaging-roles.spec.ts:50-53`, and an audit ad hoc guard check returned HTTP 403 for `buyer`, `student`, and `sub_coach` role strings with response `Insufficient role`.
- Allowlist prune is correct: the diff removes only the five `CoachMessagingController` entries (`listThread`, `send`, `voiceUpload`, `markRead`, `unreadCount`) from `LEGACY_GUARD_ALLOWLIST` and replaces them with an explanatory comment at `test/roles-enforced.spec.ts:73-77`; `CLASS_LEVEL_LEGACY_ALLOWLIST` contains no `CoachMessagingController` entry at `test/roles-enforced.spec.ts:133-164`.
- There is no `@Public()` bypass on `CoachMessagingController`; `JwtAuthGuard` only skips auth when `IS_PUBLIC_KEY` metadata is present at `src/auth/auth.guard.ts:71-77`, and the global prefix exclusions in `src/main.ts:169-211` do not include `/coach` or any coach-messaging route.
- Defence-in-depth remains layered: `@Roles('coach')` and global `RolesGuard` sit on top of existing `@UseGuards(JwtAuthGuard, CoachGuard)` at `src/messaging/coach-messaging.controller.ts:31-35`; `CoachGuard` still rejects non-coach/non-owner users at `src/auth/coach.guard.ts:9-16`.
- Service-level ownership checks are preserved: `listThreadForCoach`, `sendAsCoach`, and `markReadByCoach` still call `assertClientOfCoach` at `src/messaging/messaging.service.ts:353-359`, `src/messaging/messaging.service.ts:397-408`, and `src/messaging/messaging.service.ts:695-707`; `voiceUpload` still performs the pre-signed-URL ownership check through `listThreadForCoach` before creating the upload at `src/messaging/coach-messaging.controller.ts:75-83`.
- R0 review: the permission model is appropriately redundant (global role gate + controller guard + service ownership), which matches the “defence in depth” standard Apple/Notion/Google would ship for sensitive messaging. The visible role-guard 403 string is generic (`Insufficient role`) at `src/auth/roles.guard.ts:56-58`, so it does not leak coach-internal client/thread state.

VERDICT: NOT CLEAN (H3 implementation is clean, but the required full Jest gate is red because of an unrelated deterministic-date failure outside the H3 write-set).

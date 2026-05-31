# AUDIT — Fix: add @Roles('coach') defence-in-depth to coach-messaging + clean roles allowlist (PR #336)
VERDICT: NOT-CLEAN

Pinned HEAD: f10301ab5f4cd32d9861bd8bf59fa659af342279 (verified after fetch).

Typecheck: FAIL/INCONCLUSIVE — `npx tsc --noEmit` was run and the process was killed by signal; retry with `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit --pretty false` and `--skipLibCheck` were also killed.
Lint: FAIL — `npx eslint src/messaging/coach-messaging.controller.ts test/roles-enforced.spec.ts test/coach-messaging-roles.spec.ts` exited 1 with 2 errors.
Tests: PASS for focused spec (`npx jest test/coach-messaging-roles.spec.ts --runInBand`: 5/5). PASS for roles meta-test after heap retry (`NODE_OPTIONS=--max-old-space-size=4096 npx jest test/roles-enforced.spec.ts --runInBand --logHeapUsage`: 2/2). First unmodified roles-enforced Jest run was killed by signal.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [test/coach-messaging-roles.spec.ts:15] Required changed-files ESLint fails because the new focused spec uses the banned `Function` type (`@typescript-eslint/no-unsafe-function-type`). This is a merge-blocking hygiene/CI issue under the requested audit command; replace it with a specific constructor/type such as Nest `Type<unknown>` or another explicit class type. Note: the same required lint command also reports an existing `Function` type in the touched meta-test at `test/roles-enforced.spec.ts:207`, so the changed-files lint command remains red until that is addressed or excluded.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Write-set: diff against base `19e51b0` contains only `src/messaging/coach-messaging.controller.ts`, `test/roles-enforced.spec.ts`, and the focused `test/coach-messaging-roles.spec.ts`; no guard implementation or unrelated controller file was changed.
- Coach messaging controller now imports `Roles` and has class-level `@Roles('coach')` above `@UseGuards(JwtAuthGuard, CoachGuard)` at `src/messaging/coach-messaging.controller.ts:13-35`.
- Runtime enforcement is real, not cosmetic: `RolesGuard` is registered globally as an `APP_GUARD` at `src/app.module.ts:377-387`, and `RolesGuard.canActivate` reads metadata with `reflector.getAllAndOverride(ROLES_KEY, [handler, class])` at `src/auth/roles.guard.ts:43-47`.
- Owner bypass and coach→student hierarchy are preserved by `roleSatisfies` at `src/auth/roles.guard.ts:67-74`, and the unchanged `CoachGuard` still allows coach/owner while rejecting missing/student users at `src/auth/coach.guard.ts:9-16`.
- Student and unauthenticated rejection for the new class-level role metadata is covered by `test/coach-messaging-roles.spec.ts:50-59`; the same test covers coach allow and owner bypass at `test/coach-messaging-roles.spec.ts:38-48`.
- The allowlist edit removed only the five `CoachMessagingController` per-handler entries present in the base version (`listThread`, `send`, `voiceUpload`, `markRead`, `unreadCount`) and replaced them with an explanatory comment at `test/roles-enforced.spec.ts:72-78`; `CLASS_LEVEL_LEGACY_ALLOWLIST` still has no coach-messaging entry.
- No evidence found that any other guard/role was weakened; the only runtime code diff is the added `Roles` import and class-level `@Roles('coach')` decorator.

VERDICT: NOT-CLEAN

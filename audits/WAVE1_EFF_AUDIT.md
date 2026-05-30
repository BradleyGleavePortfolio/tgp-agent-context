# AUDIT — Wave1 EFF: sub-coach roster scoping + batch predictions (N+1) + /coach/my-effectiveness (PR #334)
VERDICT: CLEAN
Typecheck: pass (`npx tsc --noEmit`)
Lint: pass (`npm run lint` → 0 errors, 17 warnings outside touched effectiveness files)
Tests: pass (`npx jest test/coach-effectiveness.service.spec.ts test/coach-effectiveness.scheduler.spec.ts test/coach-my-effectiveness.controller.spec.ts test/roles-enforced.spec.ts` → 4 suites passed / 4 total; 20 tests passed / 20 total)
Dependency install: pass (`npm ci` → 1011 packages added/audited, 0 vulnerabilities)

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Scope control claim verified: `git diff --name-only origin/main...HEAD` shows only `src/coach/coach-effectiveness.controller.ts`, `src/coach/coach-effectiveness.service.ts`, `src/coach/coach.module.ts`, `test/coach-effectiveness.service.spec.ts`, and `test/coach-my-effectiveness.controller.spec.ts`; no `command-center.*`, `ltv-metrics.*`, `admin.controller.ts`, `sub-coach-scope.service.ts`, or `schema.prisma` edits.
- EFF-2 IDOR claim verified true: the new controller has no path or query parameter for coach identity and always uses `req.user.id` for both `getLatest` and fallback `score` (`src/coach/coach-effectiveness.controller.ts:38-43`). The route is class-scoped with `@Controller('coach')`, `@UseGuards(CoachGuard)`, and `@Roles('coach')` (`src/coach/coach-effectiveness.controller.ts:25-29`), and `CoachGuard` rejects non-coach/non-owner users (`src/auth/coach.guard.ts:5-14`). No route input allows naming a peer coach.
- EFF-3 roster scoping verified true: `computeFactors` resolves the authorized client id set via `SubCoachScopeService.getAuthorizedClientIds(coachId)` (`src/coach/coach-effectiveness.service.ts:210-220`), then reloads only live student roster rows with `id IN clientIds` (`src/coach/coach-effectiveness.service.ts:221-233`). The scope service returns direct live student roster ids for head coaches and open assignment live student ids for sub-coaches (`src/sub-coach/sub-coach-scope.service.ts:50-79`).
- EFF-3 downstream scoping verified true: completion counts use `id IN clientIds` and outcomes use `user_id IN clientIds` (`src/coach/coach-effectiveness.service.ts:269-301`); risk and retention consume only the already-scoped `allClients` (`src/coach/coach-effectiveness.service.ts:254-258`, `src/coach/coach-effectiveness.service.ts:312-414`, `src/coach/coach-effectiveness.service.ts:416-450`); engagement uses `client_id IN clientIds` rather than `coach_id` (`src/coach/coach-effectiveness.service.ts:452-498`). This avoids cross-coach leakage and does not over-restrict sub-coach engagement because coach messages are written under the head-coach thread namespace while `sender_id` captures the actual sub-coach sender (`src/messaging/messaging.service.ts:427-435`).
- EFF-3 module wiring verified true: `CoachModule` imports `SubCoachModule` and registers the new controller (`src/coach/coach.module.ts:67-78`); `SubCoachModule` exports `SubCoachScopeService` (`src/sub-coach/sub-coach.module.ts:29-48`).
- EFF-1 N+1 claim verified true: the prior implementation performed two `ptmPrediction.findFirst` calls inside the eligible-client loop (`origin/main:src/coach/coach-effectiveness.service.ts:306-330`), while the new implementation performs one `ptmPrediction.findMany` over all eligible client ids before the loop (`src/coach/coach-effectiveness.service.ts:340-355`) and the test asserts one `findMany` and zero service-path `findFirst` calls (`test/coach-effectiveness.service.spec.ts:406-415`).
- EFF-1 equivalence claim verified true for the stated selection semantics: the batched query fetches all predictions for eligible users after the earliest eligible `created_at`, then per client selects the first row with `computed_at >= client.created_at` and the last row with `client.created_at <= computed_at <= created_at + 60d` (`src/coach/coach-effectiveness.service.ts:367-389`). This reproduces the old lower-bound-only ascending `earliest` and bounded descending `latestInWindow` behavior (`origin/main:src/coach/coach-effectiveness.service.ts:311-326`), including the same inclusive boundary checks.
- Tests covering the claims are present: sub-coach assigned-roster scoring and head/sub roster split (`test/coach-effectiveness.service.spec.ts:347-391`), no-assignment empty roster (`test/coach-effectiveness.service.spec.ts:393-399`), batched prediction query count and old-findFirst equivalence (`test/coach-effectiveness.service.spec.ts:406-455`), and self-scoped controller behavior plus guard checks (`test/coach-my-effectiveness.controller.spec.ts:36-88`).

## Gate evidence
- Logs saved during audit:
  - `/home/user/workspace/wave1_eff_npm_ci.log`
  - `/home/user/workspace/wave1_eff_tsc.log`
  - `/home/user/workspace/wave1_eff_lint.log`
  - `/home/user/workspace/wave1_eff_jest_relevant.log`

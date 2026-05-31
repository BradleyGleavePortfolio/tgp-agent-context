# AUDIT — Fix: hoist repeated per-handler guard stack to class level in real-meal-plans (#3) (PR #337)
VERDICT: NOT-CLEAN

Pinned HEAD verified: `34254776aed47ac84d18f212f9981065cbf61592`.

Typecheck: fail/incomplete — `npx tsc --noEmit` was run for real and was terminated by the environment with `signal: killed`; retries with explicit Node heap limits also failed/terminated before producing TypeScript diagnostics.
Lint: pass — `npx eslint src/real-meal-plans/real-meal-plans.controller.ts test/real-meal-plans-guards.spec.ts` exited 0.
Tests: pass when split to avoid runner memory pressure — `npx jest test/real-meal-plans-guards.spec.ts --runInBand --logHeapUsage` passed 5/5; `npx jest test/entitlement-guards-mounted.spec.ts --runInBand --logHeapUsage` passed 14/14. The combined Jest invocation was terminated with `signal: killed`.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- Tooling gate incomplete: the required `npx tsc --noEmit` command could not be completed in this audit environment because the process was killed before diagnostics were emitted. I cannot mark the PR clean while the required typecheck gate is unverified.

## P3 (non-blocking)
- Write-set note: the branch changes `src/real-meal-plans/real-meal-plans.controller.ts` and adds `test/real-meal-plans-guards.spec.ts`; `test/roles-enforced.spec.ts` is not touched. The added focused spec is consistent with the H5 brief/test command, but it means the diff is not literally controller-only.

## Verification of PR claims
- Controller hoist verified: `CoachMealTemplatesController` now has class-level `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` at `src/real-meal-plans/real-meal-plans.controller.ts:31-34`, and its five handlers no longer carry method-level guard decorators at `src/real-meal-plans/real-meal-plans.controller.ts:37-65`.
- Controller hoist verified: `CoachDailyMealPlansController` now has class-level `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` at `src/real-meal-plans/real-meal-plans.controller.ts:68-71`, and its seven handlers no longer carry method-level guard decorators at `src/real-meal-plans/real-meal-plans.controller.ts:74-118`.
- Client controller untouched/enforcement preserved: `ClientMealPlanController` remains class-level `@UseGuards(JwtAuthGuard, ClientEntitlementGuard)` at `src/real-meal-plans/real-meal-plans.controller.ts:121-124`, with the `today` route still at `src/real-meal-plans/real-meal-plans.controller.ts:127-131`.
- Method-level non-guard decorators preserved: `@Throttle({ default: { ttl: 60_000, limit: 60 } })` remains on meal-template create at `src/real-meal-plans/real-meal-plans.controller.ts:37-39`; `@Throttle({ default: { ttl: 60_000, limit: 30 } })` remains on daily-plan create at `src/real-meal-plans/real-meal-plans.controller.ts:74-76`; `@Throttle` and `@HttpCode(HttpStatus.CREATED)` remain on assignment create at `src/real-meal-plans/real-meal-plans.controller.ts:104-107`.
- No role/decorator drift found: independent decorator comparison found no `@Roles` in either before or after state and found identical effective guards, throttle decorators, and HTTP code decorators for every route.

## Route-by-route enforcement parity
| Controller | Handler / route | Before effective guards | After effective guards | Result |
|---|---|---|---|---|
| CoachMealTemplatesController | `create` / POST `coach/meal-templates` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachMealTemplatesController | `list` / GET `coach/meal-templates` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachMealTemplatesController | `get` / GET `coach/meal-templates/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachMealTemplatesController | `update` / PATCH `coach/meal-templates/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachMealTemplatesController | `archive` / DELETE `coach/meal-templates/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `create` / POST `coach/daily-meal-plans` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `list` / GET `coach/daily-meal-plans` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `get` / GET `coach/daily-meal-plans/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `update` / PATCH `coach/daily-meal-plans/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `archive` / DELETE `coach/daily-meal-plans/:id` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `assign` / POST `coach/daily-meal-plans/:id/assignments` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| CoachDailyMealPlansController | `listAssignments` / GET `coach/daily-meal-plans/:id/assignments` | JwtAuthGuard, CoachGuard, SubscriptionGuard | JwtAuthGuard, CoachGuard, SubscriptionGuard | identical |
| ClientMealPlanController | `today` / GET `me/meal-plan/today` | JwtAuthGuard, ClientEntitlementGuard | JwtAuthGuard, ClientEntitlementGuard | identical |

VERDICT: NOT-CLEAN

# BUILD REPORT — H5 meal-plans guards

Unit: H5 (meal-plans guards) — hygiene refactor (#3 guard-stack repetition / silent-gap trap)
Repo: `BradleyGleavePortfolio/growth-project-backend`
Branch: `hygiene/meal-plans-guards` (off backend main `19e51b0`)
Builder identity: Dynasia G <dynasia@trygrowthproject.com> (no trailers)

## Scope (write-set)
- `src/real-meal-plans/real-meal-plans.controller.ts` (primary)
- `test/real-meal-plans-guards.spec.ts` (new focused guard contract test)

No other files touched. `test/roles-enforced.spec.ts` NOT touched.

## What changed
Hoisted the per-handler guard stack `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` —
which was repeated on every handler — up to the **class level** on the two coach controllers:
- `CoachMealTemplatesController`
- `CoachDailyMealPlansController`

and removed the now-redundant per-handler `@UseGuards(...)` decorators. This matches the
in-file pattern already used by `ClientMealPlanController` (`@UseGuards(JwtAuthGuard, ClientEntitlementGuard)`).

`ClientMealPlanController` was **left untouched**.

Method-level `@Throttle(...)` and `@HttpCode(...)` decorators were preserved as-is on the
handlers that had them; only the guard decorators were moved.

## Enforcement parity — per-route guard set, before vs after

Verified every handler in both coach controllers had the **identical** stack
`{JwtAuthGuard, CoachGuard, SubscriptionGuard}` and **no** `@Roles` or extra/differing guard.
Therefore the hoist is behavior-preserving (class-level + method-level compose in NestJS; here
the method-level guards were removed because they are now redundant with the class-level stack).

| Route | Before (per-handler) | After (effective) |
|---|---|---|
| POST `coach/meal-templates` (`create`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `coach/meal-templates` (`list`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `coach/meal-templates/:id` (`get`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| PATCH `coach/meal-templates/:id` (`update`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| DELETE `coach/meal-templates/:id` (`archive`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| POST `coach/daily-meal-plans` (`create`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `coach/daily-meal-plans` (`list`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `coach/daily-meal-plans/:id` (`get`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| PATCH `coach/daily-meal-plans/:id` (`update`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| DELETE `coach/daily-meal-plans/:id` (`archive`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| POST `coach/daily-meal-plans/:id/assignments` (`assign`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `coach/daily-meal-plans/:id/assignments` (`listAssignments`) | Jwt, Coach, Subscription | Jwt, Coach, Subscription (class) |
| GET `me/meal-plan/today` (`today`, ClientMealPlanController) | Jwt, ClientEntitlement (class) | Jwt, ClientEntitlement (class) — UNCHANGED |

Net effective guard set per route is **identical** pre/post. No route lost or gained a guard.
No `@Roles`, route path, or handler logic changed.

## Tests
Added `test/real-meal-plans-guards.spec.ts` (reflected-metadata contract, mirrors the existing
`test/entitlement-guards-mounted.spec.ts` pattern):
- Asserts each coach controller's class-level guard stack is exactly `[JwtAuthGuard, CoachGuard, SubscriptionGuard]`.
- Asserts no handler carries a duplicated method-level guard stack (class-level only).
- Asserts `ClientMealPlanController` keeps its `[JwtAuthGuard, ClientEntitlementGuard]` stack.

## Verification run (with installed deps)
- Typecheck: `npx tsc --noEmit -p tsconfig.json` → PASS (exit 0)
- Lint: `npx eslint` on both changed files → PASS (exit 0)
- Tests:
  - `test/real-meal-plans-guards.spec.ts` → 5 passed / 5
  - `test/entitlement-guards-mounted.spec.ts` (regression check, includes ClientMealPlanController) → 14 passed / 14

## Git
- Feature commit: `3425477` on `hygiene/meal-plans-guards`, author Dynasia G, no trailers.
- Pushed to origin `hygiene/meal-plans-guards`.

## Post-audit verification (Opus 4.8 FIXER/VERIFIER, re-audit completion)
The GPT-5.5 audit returned NOT-CLEAN with NO P0/P1 and route-by-route guard-hoist parity CLEAN.
The sole P2 was that the required `npx tsc --noEmit` gate was killed by the sandbox before
emitting diagnostics. Re-ran all gates to COMPLETION in worktree `wt-h5-meal` at pinned HEAD
`34254776aed47ac84d18f212f9981065cbf61592` (deps present via node_modules in worktree).

- Typecheck: `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit --incremental false`
  → **COMPLETED, exit 0, zero diagnostics** (ran ~33s, no `signal: killed`). tsc 5.9.3.
- Lint: `npx eslint src/real-meal-plans/real-meal-plans.controller.ts test/real-meal-plans-guards.spec.ts`
  → **PASS (exit 0)**.
- Tests (split to avoid runner memory pressure):
  - `npx jest test/real-meal-plans-guards.spec.ts --runInBand` → **5 passed / 5**.
  - `npx jest test/entitlement-guards-mounted.spec.ts --runInBand` → **14 passed / 14**.

No real tsc/lint/jest errors surfaced; code is correct. **No code change made** — HEAD remains
`34254776aed47ac84d18f212f9981065cbf61592`. Guard enforcement unchanged (hoist enforcement-neutral).
Unit is re-verifiable CLEAN.

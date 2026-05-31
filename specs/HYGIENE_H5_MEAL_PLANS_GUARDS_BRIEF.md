# FIX BRIEF — H5 Real-meal-plans class-level guard refactor (#3)

Repo: `growth-project-backend`. Type: 🧹 hygiene (silent-gap trap). Base: origin/main `19e51b0`.
Branch: `hygiene/meal-plans-guards`. PR title: `Fix: hoist repeated per-handler guard stack to class level in real-meal-plans (#3)`.

## WRITE-SET (disjoint)
- `src/real-meal-plans/real-meal-plans.controller.ts` (primary)
- A focused test `test/real-meal-plans-guards.spec.ts` if useful.
- Do NOT touch `payment-ops.*`, `admin.*`, `coach-messaging.*`, `storefront-public.*`, or `test/roles-enforced.spec.ts`.

## Issue (verified @ 19e51b0)
**#3 (🧹 guard-stack repetition / silent-gap trap)** — `real-meal-plans.controller.ts` repeats `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` per-handler across ~12 routes (lines 37,44,50,56,66,78,85,91,97,107,113,125 in the two coach controllers `CoachMealTemplatesController` @:33 and `CoachDailyMealPlansController` @:74). Per-handler repetition means a 13th route added without the decorator silently bypasses the guards. NOTE: `ClientMealPlanController` @:133 ALREADY uses class-level `@UseGuards(JwtAuthGuard, ClientEntitlementGuard)` — use it as the in-file pattern. FIX:
1. For `CoachMealTemplatesController` and `CoachDailyMealPlansController`, HOIST the common `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` to the CLASS level and REMOVE the per-handler duplicates — but ONLY where every handler in that class shares the exact same stack. 
2. CRITICAL: before hoisting, VERIFY every handler in each class truly has the identical guard stack. If ANY handler has a different/extra guard (e.g. one route also has `@Roles` or a different guard), do NOT blindly hoist — keep that handler's specific guard at the method level and hoist only the common ones. Behavior must be byte-equivalent: every route ends up protected by exactly the same set of guards as before (no route loses or gains a guard).
3. Do NOT change `@Roles`, route paths, or any handler logic. Pure guard-placement refactor.

## Constraints
- The net effective guard set per route MUST be identical pre/post. This is the whole point — a refactor that drops or adds a guard on any route is a P0.
- Class-level + method-level guards COMPOSE in NestJS (both run). Ensure you don't accidentally double-apply in a way that changes behavior (usually harmless, but remove the now-redundant method decorator after hoisting).
- Commit as Dynasia G, NO trailers, push every ~2min to `hygiene/meal-plans-guards`.

## Test bullets
- Every previously-guarded route is still guarded by JwtAuthGuard + CoachGuard + SubscriptionGuard (assert via reflected metadata on each handler/class, or an integration unauth→401/403 check if a harness exists).
- A hypothetical new method added to the class would inherit the guards (demonstrate the class-level metadata).
- No route's guard set changed.

## Auditor gate (GPT-5.5, real tsc/lint/jest)
#2 RLS / guard coverage. CRITICAL: enumerate EVERY route's effective guard set before and after and confirm they are identical — the refactor must not silently drop a guard on any route (that would be a security P0). Confirm only the two coach controllers were hoisted, ClientMealPlanController untouched, and no out-of-write-set file changed.

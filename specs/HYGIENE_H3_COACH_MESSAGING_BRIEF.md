# FIX BRIEF — H3 Coach-messaging @Roles defence-in-depth (#5)

Repo: `growth-project-backend`. Type: 🔴🧹 security defence-in-depth. Base: origin/main `19e51b0`.
Branch: `hygiene/coach-messaging-roles`. PR title: `Fix: add @Roles('coach') defence-in-depth to coach-messaging + clean roles allowlist (#5)`.

## WRITE-SET (disjoint — H3 is the ONLY unit allowed to edit the roles allowlist)
- `src/messaging/coach-messaging.controller.ts` (primary)
- `test/roles-enforced.spec.ts` — ONLY to remove coach-messaging's now-redundant `LEGACY_GUARD_ALLOWLIST` / `CLASS_LEVEL_LEGACY_ALLOWLIST` entries for this controller. Do NOT touch any other controller's allowlist entries.
- A focused test file `test/coach-messaging-roles.spec.ts` if useful.
- Do NOT touch `payment-ops.*`, `admin.*`, `storefront-public.*`, `real-meal-plans.*`.

## Issue (verified @ 19e51b0)
**#5 (🔴🧹)** — `coach-messaging.controller.ts:32` has class guards `@UseGuards(JwtAuthGuard, CoachGuard)` but NO `@Roles('coach')` defence-in-depth decorator; and `test/roles-enforced.spec.ts` lists this controller in its legacy-guard allowlist. FIX:
1. Add `@Roles('coach')` at the class level (or per-handler if the repo's RolesGuard requires method-level — match how other coach controllers do it). This is defence-in-depth: the runtime `CoachGuard` already gates, but the global `RolesGuard` + `@Roles` is the second layer the allowlist test enforces.
2. Verify the global `RolesGuard` is actually applied (globally or via the guard stack) so `@Roles('coach')` is enforced, not just decorative. If `RolesGuard` is global, confirm; if not, mirror exactly how a non-allowlisted coach controller wires it. Do NOT change `CoachGuard` behavior.
3. Remove coach-messaging's entries from `LEGACY_GUARD_ALLOWLIST` (and `CLASS_LEVEL_LEGACY_ALLOWLIST` if present) in `test/roles-enforced.spec.ts`, since the controller now carries explicit `@Roles`. The `roles-enforced` test must still PASS (every route has `@Roles`/`@Public` or is legitimately allowlisted) — coach-messaging routes now satisfy via `@Roles`, not the allowlist.

## Constraints
- Behavior must NOT change for legitimate coaches (same access). The only change is adding the explicit role decorator + removing the stale allowlist exemption.
- Do NOT alter any OTHER controller's allowlist entry. If removing the coach-messaging entry reveals the test references it by a shared key, edit ONLY the coach-messaging key.
- Commit as Dynasia G, NO trailers, push every ~2min to `hygiene/coach-messaging-roles`.

## Test bullets
- `roles-enforced.spec.ts` passes with coach-messaging removed from the allowlist (its routes pass via `@Roles`).
- A coach can still hit the messaging routes; a non-coach is rejected (assert the RolesGuard path if a harness exists, else assert the decorator metadata is present).

## Auditor gate (GPT-5.5, real tsc/lint/jest)
#2 RLS / role enforcement, #5 IDOR. CRITICAL: verify `@Roles('coach')` is actually ENFORCED at runtime (global or stacked RolesGuard), not just metadata that nothing reads — otherwise the "defence-in-depth" is cosmetic (that would be a P2). Verify the allowlist edit removed ONLY coach-messaging and the spec still passes. Confirm NO other unit's file changed.

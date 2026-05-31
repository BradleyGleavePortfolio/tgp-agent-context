# BUILD REPORT — H3 Coach-messaging @Roles defence-in-depth (#5)

**Unit:** H3 (coach-messaging roles)
**Builder:** Dynasia G (Opus 4.8)
**Repo:** `growth-project-backend`
**Branch:** `hygiene/coach-messaging-roles` (off backend main `19e51b0`)
**Type:** 🔴🧹 security defence-in-depth

## Issue (verified @ 19e51b0)
`src/messaging/coach-messaging.controller.ts:31-33` had class-level guards
`@UseGuards(JwtAuthGuard, CoachGuard)` but was MISSING the `@Roles('coach')`
defence-in-depth decorator. As a result the controller was carried in
`test/roles-enforced.spec.ts`'s `LEGACY_GUARD_ALLOWLIST` (5 per-handler
entries) to exempt it from the Phase-10 role-gating meta-test.

## Fix
1. **`src/messaging/coach-messaging.controller.ts`** — added the import
   `import { Roles } from '../common/decorators/roles.decorator';` and a
   class-level `@Roles('coach')` decorator (placed above `@UseGuards`, matching
   the repo's coach-controller convention, e.g. `coach-ai.controller.ts`).
   Class-level decoration covers every handler (`listThread`, `send`,
   `voiceUpload`, `markRead`, `unreadCount`). `CoachGuard` behaviour is
   unchanged; this is a second layer, not a replacement.
2. **`test/roles-enforced.spec.ts`** — removed ONLY the 5
   `CoachMessagingController` entries from `LEGACY_GUARD_ALLOWLIST` and replaced
   them with a one-line explanatory comment. No other controller's allowlist
   entry was touched. `CoachMessagingController` was not present in
   `CLASS_LEVEL_LEGACY_ALLOWLIST`, so no change was needed there.
3. **`test/coach-messaging-roles.spec.ts`** (new, focused) — asserts the
   class-level `@Roles('coach')` metadata is present AND that the global
   `RolesGuard` actually enforces it (coach ✓, owner ✓ via hierarchy bypass,
   student ✗ Forbidden, unauthenticated ✗ Forbidden). This proves the
   defence-in-depth is real, not cosmetic.

## Enforcement is real (not cosmetic)
`RolesGuard` is registered as a global `APP_GUARD` in
`src/app.module.ts:387` (`{ provide: APP_GUARD, useClass: RolesGuard }`,
Phase 10). It reads required roles via
`reflector.getAllAndOverride(ROLES_KEY, [handler, class])`
(`src/auth/roles.guard.ts:44-47`), so a class-level `@Roles('coach')` is
read and enforced at runtime for every route. Owner-bypass and the
coach→student hierarchy are preserved (`roleSatisfies`), so legitimate coach
access is unchanged.

## Behaviour change
None for legitimate coaches/owners — same access. The only changes are the
explicit role decorator (a second enforcement layer) and removal of the stale
allowlist exemption.

## Verification (run locally in the worktree)
- **Typecheck:** `npx tsc -p tsconfig.json --noEmit` → **PASS** (exit 0).
- **Lint:** `npx eslint "src/**/*.ts"` → **PASS** (0 errors; 16 pre-existing
  warnings in unrelated files, none in the changed controller).
- **Tests:**
  - `npx jest test/coach-messaging-roles.spec.ts` → **PASS** (5/5).
  - `npx jest test/roles-enforced.spec.ts --runInBand` → **PASS** (2/2): the
    meta-test passes with coach-messaging removed from the allowlist (its
    routes now satisfy via the class-level `@Roles('coach')`), and the global
    `RolesGuard` APP_GUARD registration assertion passes.

## Write-set (disjoint — respected)
- `src/messaging/coach-messaging.controller.ts`
- `test/roles-enforced.spec.ts` (ONLY coach-messaging entries removed)
- `test/coach-messaging-roles.spec.ts` (new focused test)

No `payment-ops.*`, `admin.*`, `storefront-public.*`, `real-meal-plans.*`, or
any other unit's files were touched.

## Sources / references
- Brief: `specs/HYGIENE_H3_COACH_MESSAGING_BRIEF.md`
- Common auditor brief: `specs/AUDITOR_BRIEF_COMMON.md`
- RolesGuard: `src/auth/roles.guard.ts`
- Roles decorator: `src/common/decorators/roles.decorator.ts`
- Global APP_GUARD registration: `src/app.module.ts:387`

---

## FIX NOTE — Audit follow-up (NOT-CLEAN → resolved P2)

The independent GPT-5.5 audit returned **NOT-CLEAN** on one P2: the required
changed-files ESLint command failed because the focused spec used the banned
`Function` type (`@typescript-eslint/no-unsafe-function-type`).

### What was fixed
- `test/coach-messaging-roles.spec.ts:15` — replaced `controllerClass: Function`
  with the precise Nest `Type<unknown>` (imported from `@nestjs/common`). This is
  the proper type for a controller class reference passed to `getClass()`.
- `test/roles-enforced.spec.ts:207` — the audit noted the same rule also flagged
  a PRE-EXISTING `instance.constructor as Function` in this meta-test (present in
  base `19e51b0`, NOT introduced by H3). Because this file is already in the H3
  write-set and is part of the changed-files lint gate that must pass clean, the
  identical minimal, behavior-preserving type annotation was applied
  (`as Type<unknown>`). No guard logic, role enforcement, or test behavior changed.

### Verification (real tooling, completed green runs, in worktree wt-h3-msg)
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit --pretty false` → **PASS** (exit 0).
- **Lint (the failed gate):** `npx eslint src/messaging/coach-messaging.controller.ts test/roles-enforced.spec.ts test/coach-messaging-roles.spec.ts` → **PASS** (exit 0, 0 errors, 0 warnings).
- **Tests:**
  - `npx jest test/coach-messaging-roles.spec.ts --runInBand` → **PASS** (5/5).
  - `npx jest test/roles-enforced.spec.ts --runInBand --logHeapUsage` → **PASS** (2/2).

### Enforcement integrity
`@Roles('coach')` enforcement is unchanged and remains real (global `RolesGuard`
APP_GUARD reads class-level metadata). No guard/role was weakened. Write-set
respected: only `test/coach-messaging-roles.spec.ts` and `test/roles-enforced.spec.ts`
were touched in this follow-up (type-only edits).

Commit on `hygiene/coach-messaging-roles`: `572c423` (fix), authored Dynasia G, no trailers.

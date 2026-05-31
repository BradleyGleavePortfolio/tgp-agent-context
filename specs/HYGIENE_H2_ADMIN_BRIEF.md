# FIX BRIEF — H2 Admin controller hygiene (#8, #2, #6)

Repo: `growth-project-backend`. Type: 🧹 hygiene + input-safety. Base: origin/main `19e51b0`.
Branch: `hygiene/admin-controller`. PR title: `Fix: admin controller pagination + validated query DTOs + Swagger (#8/#2/#6)`.

## WRITE-SET (disjoint — do NOT edit any other unit's files)
- `src/admin/admin.controller.ts` (primary)
- `src/admin/admin.dto.ts` (add validated query DTOs)
- `src/admin/admin.service.ts` ONLY if the cursor/pagination requires a service-signature change (keep minimal).
- A focused test file `test/admin-controller-hygiene.spec.ts`.
- Do NOT touch `payment-ops.*`, `coach-messaging.*`, `storefront-public.*`, `real-meal-plans.*`, or `test/roles-enforced.spec.ts`.

## Issues (verified file:line @ 19e51b0)
1. **#6 (🧹 raw parseInt, no validation)** — `admin.controller.ts:59,84,123,147,168,202` parse query params via raw `parseInt(...)` (NaN-prone, unvalidated). FIX: introduce validated query DTOs in `admin.dto.ts` using `class-validator` (`@IsInt`/`@IsOptional`/`@Min`/`@Max`/`@Type(() => Number)` via the global transform), and bind them with `@Query() dto: SomeQueryDto`. Remove the raw `parseInt` calls. The global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` in `main.ts` will coerce.
2. **#2 (🧹 no pagination)** — `admin.controller.ts:65-86` `listCoaches`/`listUsers` have no cursor/offset pagination. FIX: add cursor pagination (validated `limit` default 50 / hard max 100 + `cursor`), mirroring the repo's existing cursor idiom. Return `{ items/coaches/users, next_cursor }` consistent with existing response shapes. Push the bound into the service query (`take`, `cursor`), don't slice in memory.
3. **#8 (🧹 Swagger)** — `admin.controller.ts` has 0 `@ApiOperation` across its 27 handlers (incl. GDPR scrub / user promote). FIX: add a concise `@ApiOperation({ summary })` to EVERY handler. Behavior-neutral. Follow the repo's existing swagger idiom if any.

## Constraints
- Do NOT change auth/guards/roles on any admin route (these are owner/admin-gated; preserve exactly). This unit MUST NOT touch `test/roles-enforced.spec.ts` — admin's guard posture is unchanged, so the allowlist stays valid.
- Mirror existing DTO + pagination conventions in the repo; do not invent a new pagination shape.
- Commit as Dynasia G, NO trailers, push every ~2min to `hygiene/admin-controller`.

## Test bullets
- #6: invalid/NaN query param is rejected (400) instead of silently NaN; valid coerces to int.
- #2: listCoaches/listUsers cap at `take`, cursor advances; large datasets don't load unbounded.
- #8: handlers carry `@ApiOperation` metadata (assert/smoke).

## Auditor gate (GPT-5.5, real tsc/lint/jest)
#8 input validation, #23 pagination (real cursor in the query, bounded), #2 RLS unchanged. Verify NO guard/role weakened, NO out-of-write-set file changed, and pagination is in the DB query not in-memory.

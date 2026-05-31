# AUDIT — H1 Payment-Ops query bounds + Swagger (PR #340)

Status: NOT-CLEAN
Pinned HEAD audited: `bac3cc0db22e447f74a14811d55063306f5e16c1` (verified in `/home/user/workspace/wt-h1-payops`).

Typecheck: pass — `npx tsc --noEmit` exited 0.
Lint: pass — `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` exited 0.
Tests:
- pass — `node --max-old-space-size=2048 ./node_modules/.bin/jest --runTestsByPath test/payment-ops.controller.spec.ts --runInBand --no-cache --verbose`: 36 passed / 36 total.
- pass — `node --max-old-space-size=2048 ./node_modules/.bin/jest --runTestsByPath test/split-ledger.service.spec.ts --runInBand --no-cache --verbose`: 6 passed / 6 total.
- unable to complete — `node --max-old-space-size=2048 ./node_modules/.bin/jest --runTestsByPath test/roles-enforced.spec.ts --runInBand --no-cache --verbose` was killed by signal in this audit environment. `test/roles-enforced.spec.ts` is not in the write-set diff.

## Write-set / guard check
- Changed files are limited to `src/checkout/payment-ops.controller.ts`, new `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`.
- `test/roles-enforced.spec.ts` has no diff versus `origin/main`.
- No guard or role decorator was weakened in the diff. Existing coach-facing guards remain `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard)` and coach routes remain role-decorated where previously required.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [src/checkout/payment-ops.dto.ts:15-18] `coerceInt` uses `parseInt`, so partially numeric malformed `limit` values are accepted instead of rejected. I verified via `plainToInstance(CursorPageQueryDto, ...)` + `validate()` that `limit=1.5` becomes `1`, `limit=99abc` becomes `99`, `limit=100foo` becomes `100`, and `limit=1e2` becomes `1`, all with zero validation errors. This violates the brief/build claim that non-integer limits are rejected and leaves an input-validation gap on the new bounded pagination surface. Fix by using strict numeric coercion (for example, `Number(value)` plus `Number.isInteger`) or a DTO transform that preserves invalid strings for `@IsInt`, and add DTO/global-pipe tests for decimal, exponent, and suffix cases.
- [src/checkout/payment-ops.controller.ts:721-743] `exportEarningsCsv` silently truncates the “full ledger” export at `maxRows = 100_000` while returning a normal CSV response. The H1 brief requires `earnings/export.csv` to return the coach's full ledger; this reintroduces a silent truncation failure mode (larger threshold than the old 200-row bug, but still wrong) and the client receives no error or continuation signal. Fix by using a true streaming response/generator with bounded DB batches, or fail explicitly when a defensive cap is reached instead of returning a partial export as if complete.

## P3 (non-blocking)
- The payment-ops controller spec covers the new direct controller behavior, but it does not exercise the Nest `ValidationPipe` path for `CursorPageQueryDto`; adding a focused DTO validation spec would have caught the `parseInt` issue above.

## Verification of PR claims
- B5 bounded pagination: implemented for `listOwn` with `take: limit + 1`, `skip: 1` cursor pagination, stable `created_at/id` ordering, and retained `where: { coach_user_id: req.user.id }` scope at `src/checkout/payment-ops.controller.ts:592-604`. The page/cursor/scope unit tests pass at `test/payment-ops.controller.spec.ts:582-637`.
- B6 earnings cursor + summary: implemented with bounded page fetch at `src/checkout/payment-ops.controller.ts:669-684`; summary is computed via a single payee-scoped `groupBy` over all statuses at `src/checkout/payment-ops.controller.ts:752-771`, avoiding an N+1 scan and correcting totals past 200 rows. The >200-row and payee-scope tests pass at `test/payment-ops.controller.spec.ts:657-688`.
- B6 export.csv: endpoint exists at `src/checkout/payment-ops.controller.ts:690-743`, sets CSV/cache/content-disposition headers, and scopes queries to `payee_user_id: req.user.id`; however, it silently caps the export at 100,000 accumulated rows, so the “full ledger” claim is false for ledgers above that cap.
- #1 Swagger coverage: verified 36 route decorators and 36 `@ApiOperation` decorators in `src/checkout/payment-ops.controller.ts`, so every handler in this controller has API operation metadata.
- IDOR/scope regression check: listOwn and earnings/export keep `coach_user_id` / `payee_user_id` predicates tied to `req.user.id`; no cross-coach query parameter was introduced on the coach surface.
- N+1 check: earnings summary uses one grouped aggregate query, not per-row service calls.
- Validation check: UUID cursor validation and max/min limit decorators exist, and malformed UUID / over-max / below-min / nonnumeric strings are rejected under class-validator; partially numeric malformed limits are not rejected because of `parseInt`, which is the P2 above.

VERDICT: NOT-CLEAN

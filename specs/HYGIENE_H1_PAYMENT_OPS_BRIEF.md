# FIX BRIEF — H1 Payment-Ops query bounds + Swagger (B5, B6, #1)

Repo: `growth-project-backend`. Type: 💰 data/perf + 🧹 hygiene. Base: origin/main `19e51b0`.
Branch: `hygiene/payment-ops-bounds`. PR title: `Fix: payment-ops unbounded queries + earnings cursor/export + Swagger coverage (B5/B6/#1)`.

## WRITE-SET (disjoint — do NOT edit any other file)
- `src/checkout/payment-ops.controller.ts` (primary)
- Its DTO/service ONLY if strictly needed for the cursor (e.g. a new `EarningsQueryDto`, or `SplitLedgerService.findByPayee` signature). If you add a DTO, put it in a payment-ops-local file. Do NOT touch `admin.*`, `coach-messaging.*`, `storefront-public.*`, `real-meal-plans.*`, or `test/roles-enforced.spec.ts`.
- A focused test file under `test/` named for this unit (e.g. `test/payment-ops-bounds.spec.ts`).

## Issues (verified file:line @ 19e51b0)
1. **B5 (💰 unbounded query)** — `payment-ops.controller.ts:534` `listOwn` → `clientPurchase.findMany({ where:{coach_user_id}, orderBy:{created_at:'desc'} })` with **NO `take`**. Unbounded → OOM/slow-query at scale. FIX: add a bounded `take` with cursor pagination (mirror the cursor pattern used elsewhere in this file / repo — see the `take:`-bearing handlers at :84/:138/:155/:178). Accept a validated `limit` (default e.g. 50, hard max e.g. 100) + `cursor` (the `id` of the last row) query param; return `{ purchases, next_cursor }`. Keep the existing `coach_user_id` scope (RLS/IDOR #2/#5) intact.
2. **B6 (💰 truncation + no export)** — `payment-ops.controller.ts:590` `earnings` → `this.ledger.findByPayee(req.user.id, { limit: 200 })`. >200 ledger entries silently truncated (summary computed inline at :592-600 over only the first 200, so the SUMMARY IS ALSO WRONG past 200). FIX: (a) make the listing cursor-paginated (validated `limit` default 50 / max 100 + `cursor`), returning `{ summary, entries, next_cursor }`; (b) the `summary` rollup MUST be computed over the FULL ledger (an aggregate query / full scan in the service), NOT just the returned page — otherwise the money totals are wrong. Prefer a dedicated `SplitLedgerService` aggregate method for the summary; if that's too large, compute the summary via a `groupBy`/`aggregate` over all payee entries. (c) Add `GET …/earnings/export.csv` returning a streamed/bounded CSV of the coach's full ledger (Content-Type text/csv, Content-Disposition attachment). Scope strictly to `req.user.id` as payee.
3. **#1 (🧹 Swagger)** — `payment-ops.controller.ts` has 0 `@ApiOperation` across its handlers. FIX: add a concise `@ApiOperation({ summary })` (and `@ApiResponse` where cheap) to EVERY handler in this controller. Do NOT change behavior. If the repo has a `swagger-coverage` test pattern, follow it; do NOT add a new global CI test in this unit.

## Constraints
- Mirror EXISTING conventions: reuse the repo's existing cursor/pagination shape (find a handler that already does cursor pagination and copy its idiom), existing `class-validator` DTO + global `ValidationPipe`, existing `@Roles`/guard decorators (do NOT weaken scope). 
- No money-math changes beyond making the B6 summary correct over the full set.
- Keep every handler idempotent/read-only as today (these are GETs).
- Commit as Dynasia G, NO trailers, push every ~2min to `hygiene/payment-ops-bounds`.

## Test bullets
- B5: listOwn caps at `take`; cursor returns the next page; scope still filters by coach_user_id (a different coach sees none).
- B6: with >200 entries, the listing paginates AND the `summary` reflects ALL entries (not just 200). export.csv returns correct rows, scoped to payee.
- Validation: `limit` over max is clamped/rejected; invalid cursor handled.
- #1: assert (or smoke) that handlers carry `@ApiOperation` metadata.

## Auditor gate (GPT-5.5 will run real tsc/lint/jest)
50-Failures focus: #5 IDOR (scope intact), #21 N+1 (summary aggregate not per-row), #23 pagination (real cursor, bounded), #8 input validation (limit/cursor). Verify summary correctness past 200, export scope, and that NO out-of-write-set file changed.

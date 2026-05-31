# AUDIT — H1 Payment-Ops query bounds + Swagger (PR #340) — Round 3

VERDICT: NOT CLEAN
Pinned HEAD audited: `4754802be61ab6223ed98af00db336143774f771` (verified in `/home/user/workspace/r3-audit-h1`).

Typecheck: not completed — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` was killed by the sandbox before producing diagnostics.
Lint: pass — `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` exited 0.
Tests: pass — `yarn jest --runTestsByPath test/payment-ops.controller.spec.ts --runInBand --no-cache --verbose`: 54 passed / 54 total.

## Write-set / guard check
- PASS: `git diff origin/main..4754802b --stat` is limited to the three H1 files: `src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`.
- PASS: commit stack from `origin/main..4754802b` is authored by `Dynasia G <dynasia@trygrowthproject.com>` and contains no trailers.
- PASS: no guard or role weakening found in the H1 coach payment surface. `CoachPaymentOpsController` remains under `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard)` at `src/checkout/payment-ops.controller.ts:562-565`, and the audited coach routes remain `@Roles('coach', 'owner')` at `src/checkout/payment-ops.controller.ts:580`, `src/checkout/payment-ops.controller.ts:656`, and `src/checkout/payment-ops.controller.ts:691`.

## R2 finding verification
- R2 P1 streaming CSV export: PARTIALLY addressed. The old `rows[]` accumulator / single `rowsToCsv` return is gone, and the export now writes a header plus one chunk per 500-row DB batch at `src/checkout/payment-ops.controller.ts:729-747`. However, the new implementation ignores writable-stream backpressure, so it is still not a fully bounded streaming export under a slow client; see P1 below.
- R2 P2 strict `limit` validation: verified fixed. `coerceInt` treats only `undefined` as omitted, coerces `null`, `''`, and blank strings to `NaN`, and leaves malformed strings uncoerced so `@IsInt` rejects them at `src/checkout/payment-ops.dto.ts:26-42` and `src/checkout/payment-ops.dto.ts:57-68`; tests now cover `''`, `null`, and whitespace at `test/payment-ops.controller.spec.ts:826-847`.
- R2 P2 write-set rebase: verified fixed. The diff versus `origin/main` contains only the three H1 files named above.

## P0 findings
- None.

## P1 findings
- [src/checkout/payment-ops.controller.ts:729, src/checkout/payment-ops.controller.ts:747] `exportEarningsCsv` now writes chunks to the Express response, but it ignores the boolean returned by `res.write()` and never waits for the response stream's `drain` event. Under a slow client, Node will keep accepting subsequent 500-row chunks into the writable buffer while the DB loop continues, so memory can still grow with ledger size and the claimed `O(batchSize)` request memory bound is false. This keeps the full-ledger export exposed to the same scale-class failure the R2 P1 was meant to eliminate, just in the HTTP buffer instead of a local `rows[]` array. Fix by wrapping writes in an awaited helper (`if (!res.write(chunk)) await once(res, 'drain')`), handling `error`/`close` to stop fetching, and adding a unit test where `write()` returns `false` until a synthetic `drain` is emitted.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## 50-Failures checklist
- #5 IDOR / tenant scope: verified. B5 purchases remain scoped to `coach_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:593-595`; B6 listing/export/summary remain scoped to `payee_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:672-675`, `src/checkout/payment-ops.controller.ts:733-735`, and `src/checkout/payment-ops.controller.ts:765-768`.
- #8 input validation: verified fixed for the R2 edge set (`''`, `null`, whitespace-only, partial numerics, decimal/exponent/hex/suffix, over max, below min, malformed UUID cursor) via DTO code at `src/checkout/payment-ops.dto.ts:26-68` and tests at `test/payment-ops.controller.spec.ts:775-854`.
- #21 performance / N+1: earnings summary is a single `groupBy` over the payee ledger at `src/checkout/payment-ops.controller.ts:765-779`, not per-entry service calls. The export's DB access is cursor-batched at 500 rows, but the stream backpressure defect above is still a P1 performance/robustness gap.
- #23 pagination: verified. B5 and B6 list endpoints use deterministic `created_at desc, id desc` ordering, `take: limit + 1`, and cursor/skip at `src/checkout/payment-ops.controller.ts:593-604` and `src/checkout/payment-ops.controller.ts:670-685`.
- #28/#30/#44/#45: no new mutation path, optimistic UI path, money side-effect transaction, or soft-delete behavior is introduced by the H1 changes.
- Error-handling #33-37: no swallowed data errors found in the paginated JSON endpoints. The export stream still lacks backpressure/error/close handling as described in P1.

## Verification of PR claims
- Claim: **"`exportEarningsCsv` rewritten to TRUE streaming; writes header and each bounded DB batch directly to `res.write`, no `rows[]`, no full CSV string, O(batchSize) memory."** FALSE as stated. It does write header and batch chunks directly at `src/checkout/payment-ops.controller.ts:729-747`, and no local full-CSV accumulator remains, but it ignores `res.write()` backpressure at `src/checkout/payment-ops.controller.ts:729` and `src/checkout/payment-ops.controller.ts:747`, so total request memory is not bounded by `batchSize` under slow consumers.
- Claim: **"No total-row cap; cursor loop drains the entire payee-scoped ledger."** Verified for normal writable behavior: the loop uses `where: { payee_user_id: req.user.id }`, deterministic order, `take: 500`, cursor/skip, and exits only on empty/short batch at `src/checkout/payment-ops.controller.ts:730-749`.
- Claim: **"`limit` strict validation now rejects `''`, `null`, and whitespace-only values while omitted remains optional."** Verified at `src/checkout/payment-ops.dto.ts:26-42` and `test/payment-ops.controller.spec.ts:819-847`.
- Claim: **"PR diff against current main is exactly the 3 H1 files."** Verified with `git diff origin/main..4754802b --stat` / `--name-status`.
- Claim: **"Payment-ops tests are 54/54."** Verified with the required `yarn jest --runTestsByPath test/payment-ops.controller.spec.ts --runInBand --no-cache --verbose`: 54 passed / 54 total.
- Claim: **"ApiOperation coverage."** Verified: `payment-ops.controller.ts` has 36 route decorators and 36 `@ApiOperation` decorators, including the H1 coach endpoints at `src/checkout/payment-ops.controller.ts:582-584`, `src/checkout/payment-ops.controller.ts:658-661`, and `src/checkout/payment-ops.controller.ts:693-695`.

## Counts
- P0: 0
- P1: 1
- P2: 0
- P3: 0

VERDICT: NOT CLEAN

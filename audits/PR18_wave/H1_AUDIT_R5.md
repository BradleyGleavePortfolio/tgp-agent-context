# AUDIT — H1 Payment-Ops query bounds + Swagger (PR #340) — Round 5

VERDICT: NOT CLEAN
Pinned HEAD audited: `9faba45a3834ac1a2077fbd1890160fb351257d4` (verified in `/home/user/workspace/r5-audit-h1`).

Typecheck: pass — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` exited 0.
Lint: pass with warning — `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` exited 0 with one warning in the test file (`chunk` unused in the older disconnect mock at line 857).
Tests: pass — `yarn jest test/payment-ops.controller.spec.ts` passed: 57 passed / 57 total.

## Write-set / guard check
- FAIL: `git diff origin/main..9faba45a3834ac1a2077fbd1890160fb351257d4 --name-status` is NOT limited to the three H1 files. It currently shows 18 changed paths: `docs/deploy-runbook.md`, `scripts/admin-federation-smoke.ts`, `src/admin/README.md`, `src/admin/admin.controller.ts`, `src/admin/admin.dto.ts`, `src/admin/admin.service.ts`, `src/billing/billing.service.ts`, `src/checkout/checkout-webhook-handler.service.ts`, `src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, `src/packages/packages.service.ts`, `src/storefront/storefront-public.controller.ts`, `src/throttler/throttler.config.ts`, `test/admin-controller-hygiene.spec.ts` deleted, `test/checkout-webhook-handler.spec.ts`, `test/packages.service.spec.ts`, `test/payment-ops.controller.spec.ts`, and `test/storefront-public.controller.spec.ts`. The R4-to-R5 incremental diff is limited to `src/checkout/payment-ops.controller.ts` and `test/payment-ops.controller.spec.ts`, but the required SHA-pinned boundary against current `origin/main` fails.
- PASS: pinned HEAD check returned `9faba45a3834ac1a2077fbd1890160fb351257d4`.
- PASS: commit stack from `origin/main..9faba45a3834ac1a2077fbd1890160fb351257d4` is authored only by `Dynasia G <dynasia@trygrowthproject.com>`.
- PASS: `git log origin/main..9faba45a3834ac1a2077fbd1890160fb351257d4 --format='%(trailers:unfold)'` showed no commit trailers.
- PASS: the coach payment surface remains under `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard)` at `src/checkout/payment-ops.controller.ts:612-615`, and the audited coach endpoints remain `@Roles('coach', 'owner')` at `src/checkout/payment-ops.controller.ts:630`, `src/checkout/payment-ops.controller.ts:663`, `src/checkout/payment-ops.controller.ts:706`, and `src/checkout/payment-ops.controller.ts:741`.

## R4 finding verification
- R4 P1 close-during-drain hang: addressed. `writeWithBackpressure` now accepts `isClientGone: () => boolean`, checks it before writing, and after a refused `res.write()` awaits a promise with `drain`, `close`, and `error` listeners that all unblock the same wait by calling `resolve()` at `src/checkout/payment-ops.controller.ts:73-101`.
- Listener cleanup: verified. The helper's cleanup removes all three listeners with `res.off('drain', onDrain)`, `res.off('close', onClose)`, and `res.off('error', onClose)` at `src/checkout/payment-ops.controller.ts:83-88`, so the losing race listeners are not leaked.
- Call-site threading: verified. `exportEarningsCsv` registers `res.once('error', stop)` and `res.once('close', stop)`, defines `const isClientGone = () => clientGone`, and passes it to both the header write and per-batch body write at `src/checkout/payment-ops.controller.ts:790-817`.
- Early exit after false return: verified. Both write sites use `if (!(await writeWithBackpressure(...))) return;` at `src/checkout/payment-ops.controller.ts:797` and `src/checkout/payment-ops.controller.ts:817`, so a close/error observed during the helper wait exits before additional DB fetches or `res.end()`.
- New R4 regression test: verified. `B6: export.csv exits cleanly when client closes while parked on drain` makes the first `res.write()` return false, never emits `drain`, emits `close` via `setImmediate`, races the export promise against a 1,000 ms timeout, asserts the promise resolves as `done`, asserts `res.end()` is not called, and asserts the DB fetch count is unchanged after the parked write at `test/payment-ops.controller.spec.ts:886-938`.

## P0 findings
- None.

## P1 findings
- [write-set guard] The required SHA-pinned write-set boundary fails. The audit instruction requires `git diff origin/main..9faba45a --name-status` to touch ONLY `src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`, but the actual diff touches 18 paths across admin, billing, checkout webhook, packages, storefront, throttler, docs/scripts, and tests. Even though the R4-to-R5 incremental patch is limited to the close-during-drain fix files, the PR head at this SHA is not clean against current `origin/main` under the requested boundary, so this audit cannot sign off the PR as clean.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## 50-Failures checklist
- #5 IDOR / tenant scope: verified. B5 purchases remain scoped to `coach_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:643-645`; B6 listing/export/summary remain scoped to `payee_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:721-725`, `src/checkout/payment-ops.controller.ts:802-804`, and `src/checkout/payment-ops.controller.ts:836-839`.
- #8 input validation: verified. `coerceInt` treats only `undefined` as omitted, rejects explicit `null`/empty/blank values via `NaN`, rejects partially numeric strings by leaving them uncoerced, and enforces safe integers at `src/checkout/payment-ops.dto.ts:25-42`; tests cover malformed limits, over/under range, omitted, empty, null, whitespace, and malformed cursor at `test/payment-ops.controller.spec.ts:941-1024`.
- #21 performance / N+1: verified for the audited B5/B6 paths. Earnings summary is a single full-ledger `groupBy` over the payee ledger at `src/checkout/payment-ops.controller.ts:831-849`; list endpoints use bounded cursor pages; export uses `batchSize = 500` and streams each cursor batch without accumulating the full CSV at `src/checkout/payment-ops.controller.ts:797-819`.
- #28/#29 concurrency / replay: no new mutation, idempotency, or replay-sensitive money side-effect path is introduced by the R5 close-during-drain fix. The audited export/list/summary paths remain read-only.
- #35 timeouts / #50 graceful degradation: verified. A refused write now waits on `drain` OR `close` OR `error`, cleanup removes all race listeners, and the returned boolean is checked immediately so close/error exits before further fetches, writes, or `res.end()` at `src/checkout/payment-ops.controller.ts:73-101` and `src/checkout/payment-ops.controller.ts:797-821`.
- #36 silent failure swallow: acceptable for this read-only streaming endpoint. Client close/error sets explicit `clientGone` state and exits the export path; it does not silently commit or skip any money-side effect. The route does not log client aborts, but that is acceptable graceful degradation for a disconnected HTTP stream rather than a P-level finding.

## Verification of PR claims
- Claim: **"R4 P1 close-during-drain hang is fixed."** Verified. The helper races `drain` against `close`/`error`, cleans up listeners, returns `false` when the client is gone, and both call sites short-circuit on `false`.
- Claim: **"New B6 close-while-parked-on-drain regression test exists."** Verified at `test/payment-ops.controller.spec.ts:886-938`, and the targeted Jest suite passed 57/57.
- Claim: **"Every write respects backpressure and client disconnect."** Verified for the implemented header and body write sites: both route through `writeWithBackpressure` at `src/checkout/payment-ops.controller.ts:797` and `src/checkout/payment-ops.controller.ts:817`.
- Claim: **"No total-row cap; cursor loop drains the entire payee-scoped ledger."** Verified for the happy path: the export uses `take: 500`, `where: { payee_user_id: req.user.id }`, deterministic order, cursor/skip, and exits only on empty/short batch at `src/checkout/payment-ops.controller.ts:797-819`; the 1,250-row regression test remains covered and passing.
- Claim: **"PR diff against current main is exactly the three H1 files."** FALSE for this pinned audit. The required `git diff origin/main..9faba45a3834ac1a2077fbd1890160fb351257d4 --name-status` shows 18 changed paths, not only the three allowed paths.
- Claim: **"Payment-ops tests are 57/57."** Verified with `yarn jest test/payment-ops.controller.spec.ts`: 57 passed / 57 total.

## Counts
- P0: 0
- P1: 1
- P2: 0
- P3: 0

VERDICT: NOT CLEAN

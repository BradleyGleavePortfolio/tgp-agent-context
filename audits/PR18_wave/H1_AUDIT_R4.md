# AUDIT — H1 Payment-Ops query bounds + Swagger (PR #340) — Round 4

VERDICT: NOT CLEAN
Pinned HEAD audited: `8f1e7b7513b7e1650e7e575b06d69ca568a4f274` (verified in `/home/user/workspace/r4-audit-h1`).

Typecheck: pass — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` exited 0.
Lint: pass with warning — `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` exited 0 with one warning in the test file (`chunk` unused in the disconnect mock).
Tests: pass — after installing dependencies with `npm ci`, `yarn jest test/payment-ops.controller.spec.ts` passed: 56 passed / 56 total. Initial `yarn jest ...` before dependency install failed because the worktree had no `node_modules` / local `jest` binary; this was an environment setup miss, not a test failure.

## Write-set / guard check
- PASS: `git diff origin/main..8f1e7b7513b7e1650e7e575b06d69ca568a4f274 --name-status` is limited to the three H1 files: `src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`.
- PASS: commit stack from `origin/main..8f1e7b7513b7e1650e7e575b06d69ca568a4f274` is authored by `Dynasia G <dynasia@trygrowthproject.com>` and contains no trailers.
- PASS: the coach payment surface remains under `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard)` at `src/checkout/payment-ops.controller.ts:580-582`, and the audited coach endpoints remain `@Roles('coach', 'owner')` at `src/checkout/payment-ops.controller.ts:597`, `src/checkout/payment-ops.controller.ts:673`, and `src/checkout/payment-ops.controller.ts:708`.

## R3 finding verification
- R3 P1 streaming CSV export backpressure: PARTIALLY addressed. The helper imports `once` from `events` and awaits `once(res, 'drain')` when `res.write()` returns false at `src/checkout/payment-ops.controller.ts:17` and `src/checkout/payment-ops.controller.ts:62-68`. The header and every per-batch body chunk route through `writeWithBackpressure` at `src/checkout/payment-ops.controller.ts:763` and `src/checkout/payment-ops.controller.ts:783`, so the normal slow-client backpressure path now parks before fetching/writing further batches.
- Client-disconnect early exit: PARTIALLY addressed. `res.once('error', stop)` and `res.once('close', stop)` set `clientGone` at `src/checkout/payment-ops.controller.ts:757-762`, and the loop checks that flag before DB fetch, before batch write, and before `res.end()` at `src/checkout/payment-ops.controller.ts:767`, `src/checkout/payment-ops.controller.ts:782`, and `src/checkout/payment-ops.controller.ts:787`. However, the helper itself is not close-aware while it is already awaiting `drain`; see P1 below.
- Negative-control/backpressure test: verified. `B6: export.csv WAITS for the drain event when write() signals backpressure` uses an `EventEmitter` response, makes the first `write()` return false, asserts the export promise remains unresolved with only the header written, emits synthetic `drain`, then verifies completion at `test/payment-ops.controller.spec.ts:780-835`.
- Disconnect test: verified. `B6: export.csv stops the DB loop early when the client disconnects` emits `close` on the first body write and asserts `res.end()` is not called and the DB cursor loop stops before all four batches at `test/payment-ops.controller.spec.ts:842-875`.

## P0 findings
- None.

## P1 findings
- [src/checkout/payment-ops.controller.ts:62-68, src/checkout/payment-ops.controller.ts:761-763] `writeWithBackpressure` awaits only `once(res, 'drain')` after a refused write, while the `close` listener only flips `clientGone` outside the helper. If the client disconnects after `res.write()` returns false but before `drain`, `close` does not resolve or reject the `once(res, 'drain')` promise, so the route can remain parked forever with the request/response context retained. I verified the underlying EventEmitter behavior with a minimal probe: a promise from `once(emitter, 'drain')` remains unsettled after `emitter.emit('close')`. This leaves a client-abort/backpressure edge in the infra-resilience path and is not covered by the new disconnect test, which has every write return true. Fix by making the helper abort-aware, e.g. race `drain` against `close`/`error` or pass an `AbortSignal`/`isClientGone` guard so a close during backpressure exits immediately without waiting for an event that may never arrive; add a unit test where `write()` returns false and `close` is emitted before `drain`.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## 50-Failures checklist
- #5 IDOR / tenant scope: verified. B5 purchases remain scoped to `coach_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:611-612`; B6 listing/export/summary remain scoped to `payee_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:690-692`, `src/checkout/payment-ops.controller.ts:768-770`, and `src/checkout/payment-ops.controller.ts:801-803`.
- #8 input validation: verified. `coerceInt` treats only `undefined` as omitted, rejects explicit `null`/empty/blank values via `NaN`, rejects partially numeric strings by leaving them uncoerced, and enforces safe integers at `src/checkout/payment-ops.dto.ts:25-42`; tests cover malformed limits, over/under range, omitted, empty, null, whitespace, and malformed cursor at `test/payment-ops.controller.spec.ts:883-962`.
- #21 performance / N+1: mostly verified. Earnings summary is a single full-ledger `groupBy` over the payee ledger at `src/checkout/payment-ops.controller.ts:801-816`, and listing/export queries are cursor-batched. The remaining performance/infra-resilience gap is the P1 close-during-backpressure hang above.
- #23 pagination: verified. B5 and B6 list endpoints use deterministic `created_at desc, id desc` ordering, `take: limit + 1`, and cursor/skip at `src/checkout/payment-ops.controller.ts:611-617` and `src/checkout/payment-ops.controller.ts:690-696`.
- #28/#30/#44/#45: no new mutation path, optimistic UI path, money side-effect transaction, or soft-delete behavior is introduced by the H1 changes.
- Error handling / infra resilience: normal `drain` backpressure and normal post-write disconnect are tested and improved, but close while awaiting `drain` remains unresolved as described in P1.

## Verification of PR claims
- Claim: **"The sole R3 P1 (streaming backpressure) is resolved."** FALSE as stated. Normal drain backpressure is fixed for header and batch writes at `src/checkout/payment-ops.controller.ts:763` and `src/checkout/payment-ops.controller.ts:783`, but close during a pending drain wait can leave the route hung at `src/checkout/payment-ops.controller.ts:62-68`.
- Claim: **"Every write respects backpressure."** Verified for the implemented header and body write sites: both call `writeWithBackpressure` at `src/checkout/payment-ops.controller.ts:763` and `src/checkout/payment-ops.controller.ts:783`.
- Claim: **"Client-disconnect early-exit stops the DB loop."** Verified for disconnects observed between writes: `clientGone` is set by `error`/`close` and checked before fetch/write/end at `src/checkout/payment-ops.controller.ts:757-787`. Not verified for disconnect while already blocked on a `drain` wait; see P1.
- Claim: **"No total-row cap; cursor loop drains the entire payee-scoped ledger."** Verified for the happy path: the export uses `take: 500`, `where: { payee_user_id: req.user.id }`, deterministic order, cursor/skip, and exits only on empty/short batch at `src/checkout/payment-ops.controller.ts:764-785`; the 1,250-row regression test confirms no truncation at `test/payment-ops.controller.spec.ts:728-771`.
- Claim: **"Negative-control test exists for write false until synthetic drain."** Verified at `test/payment-ops.controller.spec.ts:780-835`.
- Claim: **"PR diff against current main is exactly the 3 H1 files."** Verified with `git diff origin/main..8f1e7b7513b7e1650e7e575b06d69ca568a4f274 --name-status` / `--stat`.
- Claim: **"Payment-ops tests are 56/56."** Verified with `yarn jest test/payment-ops.controller.spec.ts`: 56 passed / 56 total.
- Claim: **"ApiOperation coverage."** Verified: `payment-ops.controller.ts` has 36 route decorators and 36 `@ApiOperation` decorators.

## Counts
- P0: 0
- P1: 1
- P2: 0
- P3: 0

VERDICT: NOT CLEAN

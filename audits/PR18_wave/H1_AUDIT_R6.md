# AUDIT — H1 Payment-Ops query bounds + Swagger (PR #340) — Round 6

VERDICT: CLEAN
Pinned HEAD audited: `2030d5315f1e60cd67ab7f36cf3e5ed614624ce1` (verified in `/home/user/workspace/r6-audit-h1`).
Base used for write-set check: `origin/main` = `978d4a35f6ddccd3aaaaec9c17295eefb0414459`.

Typecheck: pass — `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` exited 0.
Lint: pass with warning — `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` exited 0 with one warning in the test file (`chunk` unused in the existing disconnect mock at line 857). No errors.
Tests: pass — `yarn jest test/payment-ops.controller.spec.ts` passed: 57 passed / 57 total.

## Write-set / guard check
- PASS: pinned HEAD check returned `2030d5315f1e60cd67ab7f36cf3e5ed614624ce1`.
- PASS: `git diff origin/main..HEAD --name-status` is limited to the exact three allowed H1 files:
  - `M src/checkout/payment-ops.controller.ts`
  - `A src/checkout/payment-ops.dto.ts`
  - `M test/payment-ops.controller.spec.ts`
- PASS: diff stat confirms only those three files changed (`src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`).
- PASS: commit stack from `origin/main..HEAD` contains exactly five commits.
- PASS: all five commits are authored only by `Dynasia G <dynasia@trygrowthproject.com>`:
  - `2030d5315f1e60cd67ab7f36cf3e5ed614624ce1` — `H1 R4 fix: race drain against close/error in writeWithBackpressure`
  - `ff45a80ccf54c14c05b02f4a27bce8a728a00186` — `fix(H1) R3: stream backpressure + client-disconnect early-exit in exportEarningsCsv`
  - `feb41976c1a1599ca5ee3776073b319eb5c94ca2` — `fix(H1): address R2 audit P1 + P2 findings`
  - `8af07c56d7a57d2cc87d34a1cca989d512c4da82` — `fix(H1): strict limit validation + uncapped full-ledger CSV export (P2)`
  - `f47a96e23ed5bdc16238c349c60b811071786e0a` — `hygiene(H1): payment-ops bounds + earnings cursor/export + ApiOperation`
- PASS: `git log origin/main..HEAD --format='%(trailers:unfold)' | sed '/^$/d'` returned no trailers, including no co-authors.
- PASS: the coach payment surface remains under `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard)` at `src/checkout/payment-ops.controller.ts:612-615`, and the audited coach endpoints remain `@Roles('coach', 'owner')` at `src/checkout/payment-ops.controller.ts:630`, `src/checkout/payment-ops.controller.ts:663`, `src/checkout/payment-ops.controller.ts:706`, and `src/checkout/payment-ops.controller.ts:741`.

## R5 finding resolution
- R5 was NOT CLEAN only because the SHA-pinned write-set boundary against then-current `origin/main` showed 18 changed paths instead of the allowed three H1 files.
- RESOLVED: the R6 rebased head restores the required write-set boundary. `git diff origin/main..2030d5315f1e60cd67ab7f36cf3e5ed614624ce1 --name-status` shows only `src/checkout/payment-ops.controller.ts`, `src/checkout/payment-ops.dto.ts`, and `test/payment-ops.controller.spec.ts`.
- The preserved R4 close-during-drain fix is present in the rebased history as commit `2030d5315f1e60cd67ab7f36cf3e5ed614624ce1`.

## R4 finding verification
- R4 P1 close-during-drain hang: addressed. `writeWithBackpressure` accepts `isClientGone: () => boolean`, checks it before writing, and after a refused `res.write()` awaits a promise with `drain`, `close`, and `error` listeners that all unblock the same wait by calling `resolve()` at `src/checkout/payment-ops.controller.ts:73-101`.
- Listener cleanup: verified. The helper's cleanup removes all three listeners with `res.off('drain', onDrain)`, `res.off('close', onClose)`, and `res.off('error', onClose)` at `src/checkout/payment-ops.controller.ts:83-88`, so the losing race listeners are not leaked.
- Call-site threading: verified. `exportEarningsCsv` registers `res.once('error', stop)` and `res.once('close', stop)`, defines `const isClientGone = () => clientGone`, and passes it to both the header write and per-batch body write at `src/checkout/payment-ops.controller.ts:790-817`.
- Early exit after false return: verified. Both write sites use `if (!(await writeWithBackpressure(...))) return;` at `src/checkout/payment-ops.controller.ts:797` and `src/checkout/payment-ops.controller.ts:817`, so a close/error observed during the helper wait exits before additional DB fetches or `res.end()`.
- R4 regression test: verified. `B6: export.csv exits cleanly when client closes while parked on drain` makes the first `res.write()` return false, never emits `drain`, emits `close` via `setImmediate`, races the export promise against a 1,000 ms timeout, asserts the promise resolves as `done`, asserts `res.end()` is not called, and asserts the DB fetch count is unchanged after the parked write at `test/payment-ops.controller.spec.ts:886-938`.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## 50-Failures checklist
- #5 IDOR / tenant scope: verified. B5 purchases remain scoped to `coach_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:643-645`; B6 listing/export/summary remain scoped to `payee_user_id: req.user.id` at `src/checkout/payment-ops.controller.ts:721-725`, `src/checkout/payment-ops.controller.ts:802-804`, and `src/checkout/payment-ops.controller.ts:836-839`.
- #8 input validation: verified. `coerceInt` treats only `undefined` as omitted, rejects explicit `null`/empty/blank values via `NaN`, rejects partially numeric strings by leaving them uncoerced, and enforces safe integers at `src/checkout/payment-ops.dto.ts:25-42`; tests cover malformed limits, over/under range, omitted, empty, null, whitespace, and malformed cursor at `test/payment-ops.controller.spec.ts:941-1024`.
- #21 performance / N+1: verified for the audited B5/B6 paths. Earnings summary is a single full-ledger `groupBy` over the payee ledger at `src/checkout/payment-ops.controller.ts:831-849`; list endpoints use bounded cursor pages; export uses `batchSize = 500` and streams each cursor batch without accumulating the full CSV at `src/checkout/payment-ops.controller.ts:797-819`.
- #28/#29 concurrency / replay: no new mutation, idempotency, or replay-sensitive money side-effect path is introduced by the R6 rebased H1 write-set. The audited export/list/summary paths remain read-only.
- #35 timeouts / #50 graceful degradation: verified. A refused write now waits on `drain` OR `close` OR `error`, cleanup removes all race listeners, and the returned boolean is checked immediately so close/error exits before further fetches, writes, or `res.end()` at `src/checkout/payment-ops.controller.ts:73-101` and `src/checkout/payment-ops.controller.ts:797-821`.
- #36 silent failure swallow: acceptable for this read-only streaming endpoint. Client close/error sets explicit `clientGone` state and exits the export path; it does not silently commit or skip any money-side effect. The route does not log client aborts, but that is acceptable graceful degradation for a disconnected HTTP stream rather than a P-level finding.
- #23 pagination: verified. B5 and B6 use cursor pagination with `take: limit + 1`, deterministic ordering by `created_at desc` plus `id desc`, `cursor`/`skip: 1`, and `next_cursor` from the last returned row at `src/checkout/payment-ops.controller.ts:643-655` and `src/checkout/payment-ops.controller.ts:720-735`.

## Verification of PR claims
- Claim: **"R5 write-set boundary failure has been resolved by rebasing onto current main."** Verified. The R6 diff against `origin/main` contains only the three allowed files.
- Claim: **"R4 P1 close-during-drain hang is fixed and preserved."** Verified. The helper races `drain` against `close`/`error`, cleans up listeners, returns `false` when the client is gone, and both call sites short-circuit on `false`.
- Claim: **"New B6 close-while-parked-on-drain regression test exists."** Verified at `test/payment-ops.controller.spec.ts:886-938`, and the targeted Jest suite passed 57/57.
- Claim: **"Every write respects backpressure and client disconnect."** Verified for the implemented header and body write sites: both route through `writeWithBackpressure` at `src/checkout/payment-ops.controller.ts:797` and `src/checkout/payment-ops.controller.ts:817`.
- Claim: **"No total-row cap; cursor loop drains the entire payee-scoped ledger."** Verified for the happy path: the export uses `take: 500`, `where: { payee_user_id: req.user.id }`, deterministic order, cursor/skip, and exits only on empty/short batch at `src/checkout/payment-ops.controller.ts:797-819`; the 1,250-row regression test remains covered and passing.
- Claim: **"Payment-ops tests are 57/57."** Verified with `yarn jest test/payment-ops.controller.spec.ts`: 57 passed / 57 total.

## Counts
- P0: 0
- P1: 0
- P2: 0
- P3: 0

VERDICT: CLEAN

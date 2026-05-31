# BUILD REPORT — H1 R4 fix (close-during-drain) — PR #340

- Repo: `growth-project-backend`
- Branch: `hygiene/payment-ops-bounds`
- Base head before fix: `8f1e7b7513b7e1650e7e575b06d69ca568a4f274`
- New head after fix: `9faba45a3834ac1a2077fbd1890160fb351257d4`
- Author: Dynasia G <dynasia@trygrowthproject.com> (no trailers, no co-authors)
- Audit addressed: `audits/PR18_wave/H1_AUDIT_R4.md` (commit b7114839), P1 finding.

## Problem (R4 P1: close-during-drain hang)

`writeWithBackpressure` in `src/checkout/payment-ops.controller.ts` awaited ONLY
`once(res, 'drain')` after a refused `res.write()`. A `drain` event is not
guaranteed to ever fire: if the client disconnects (`close` event) or the stream
errors while the export is parked in `once(res, 'drain')`, that promise never
settles. The request remains hung forever, retaining the request/response context
and memory. The existing `clientGone` flag (set by `res.once('close', stop)` /
`res.once('error', stop)`) did not help because it was only checked *between*
writes in the export loop — never *during* a pending drain wait inside the helper.

This left a client-abort/backpressure edge in the infra-resilience path that was
not covered by the prior R3 disconnect test (which had every write return true,
so the helper was never parked).

## Fix

Made `writeWithBackpressure` abort-aware:

1. New signature: `writeWithBackpressure(res, chunk, isClientGone: () => boolean): Promise<boolean>`.
2. Short-circuits before writing if `isClientGone()` is already true.
3. When `res.write()` returns false (backpressure), it now **races `drain`
   against `close`/`error`** via a single promise that registers `once` listeners
   for all three events and resolves on whichever fires first, cleaning up the
   other listeners. This guarantees the helper unblocks immediately on disconnect
   instead of awaiting an event that may never arrive.
4. Returns `true` if it is safe to keep writing, `false` if the client is gone —
   so the caller can short-circuit.
5. Removed the now-unused `import { once } from 'events'`.

At the two call sites in `exportEarningsCsv` (header write and per-batch body
write), the export now threads an `isClientGone = () => clientGone` closure and
`return`s early if the helper reports the client is gone — so no further DB
fetches, writes, or `res.end()` happen for a disconnected consumer.

## File diffs

### `src/checkout/payment-ops.controller.ts` (+41 / −7)
- Removed `import { once } from 'events'`.
- Rewrote `writeWithBackpressure` to be abort-aware (race `drain` vs
  `close`/`error`, accept `isClientGone`, return `boolean`).
- Header write site: `if (!(await writeWithBackpressure(res, header, isClientGone))) return;`
- Batch write site: `if (!(await writeWithBackpressure(res, chunk, isClientGone))) return;`
- Added `const isClientGone = () => clientGone;` after the close/error listeners.

### `test/payment-ops.controller.spec.ts` (+62 / −0)
- Added test: **`B6: export.csv exits cleanly when client closes while parked on drain`**.
  - Mocks `res.write` to return `false` on the first (header) write so the helper
    parks awaiting `drain`.
  - Never emits `drain`; emits `close` instead (scheduled on a later tick).
  - Races the export promise against a 1s timeout and asserts it resolves
    (`'done'`, not `'timeout'`) — i.e. not hung.
  - Asserts `res.end()` is NOT called.
  - Asserts no further DB fetches occur after the parked write
    (`fetchesAtEnd === fetchesAtPark`, and `< 4` of the would-be 4 batches).

Net diff is limited to the two intended H1 files (`git diff --name-status`):
```
M  src/checkout/payment-ops.controller.ts
M  test/payment-ops.controller.spec.ts
```

## Test list (B6 streaming/export group)
- B6: summary aggregates the FULL ledger even when the page is truncated past 200
- B6: earnings page is bounded and cursor advances
- B6: summary is scoped to payee (another coach ledger does not leak in)
- B6: export.csv returns the full payee ledger, scoped, as CSV
- B6: export.csv drains MULTIPLE cursor batches and does NOT truncate the full ledger
- B6: export.csv WAITS for the drain event when write() signals backpressure
- B6: export.csv stops the DB loop early when the client disconnects
- **B6: export.csv exits cleanly when client closes while parked on drain (NEW — R4 P1)**

## Verification — all green
- Typecheck: `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` → exit 0.
- Lint: `npx eslint src/checkout/payment-ops.controller.ts src/checkout/payment-ops.dto.ts test/payment-ops.controller.spec.ts` → 0 errors, 1 pre-existing warning (`chunk` unused in the older R3 disconnect mock at line 857 — not part of this change; the new test uses `_chunk`).
- Tests: `yarn jest test/payment-ops.controller.spec.ts` → **57 passed / 57 total** (56 prior + 1 new).

---

## Addendum — Rebase onto main (978d4a3f)

Rebased `hygiene/payment-ops-bounds` onto current backend main (`978d4a3f`) to restore a clean write-set boundary. Prior to rebase, `git diff origin/main..HEAD --name-only` showed 18 files due to B1/H2/H4 merges that landed in main after this branch was created. After rebase, write-set is exactly the 3 H1 files:

- `src/checkout/payment-ops.controller.ts`
- `src/checkout/payment-ops.dto.ts`
- `test/payment-ops.controller.spec.ts`

All gates re-verified post-rebase: TSC exit 0, ESLint 0 errors, Jest 57/57.

New head SHA: `2030d5315f1e60cd67ab7f36cf3e5ed614624ce1`

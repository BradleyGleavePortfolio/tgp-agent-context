# H1 PAYMENT-OPS FIX — R3 (stream backpressure + client-disconnect early-exit)

PR: #340 — `hygiene(H1): payment-ops bounds + earnings cursor/export + ApiOperation`
Branch: `hygiene/payment-ops-bounds`
Author: `Dynasia G <dynasia@trygrowthproject.com>` (no commit trailers)

## SHAs
- Pre-fix (R3-audited) HEAD: `4754802be61ab6223ed98af00db336143774f771` (`4754802`)
- Post-fix HEAD (pushed): `8f1e7b7513b7e1650e7e575b06d69ca568a4f274` (`8f1e7b7`)
- Rebased onto `origin/main` @ `a344ec4d47b4a3503707253ccf93335807a6af2e`
- Pre-rebase merge-base (stale): branch had been built on an older `main`; rebase replayed the
  3 H1 commits onto `a344ec4` cleanly (zero conflicts — absorbed PRs touch disjoint files).

## R3 audit result addressed
The R3 audit returned **VERDICT: NOT CLEAN** with exactly **one P1** and zero P0/P2/P3:

> [src/checkout/payment-ops.controller.ts:729, :747] `exportEarningsCsv` writes chunks to the
> Express response but ignores the boolean returned by `res.write()` and never waits for the
> response stream's `drain` event. Under a slow client, Node keeps accepting subsequent 500-row
> chunks into the writable buffer while the DB loop continues, so memory can still grow with
> ledger size and the claimed `O(batchSize)` request-memory bound is false.

## Root cause
The R2 rewrite removed the `rows[]` accumulator and streamed header + per-batch chunks directly to
`res.write()`, but it treated `res.write()` as fire-and-forget. `res.write()` returns `false` once
Node's internal writable buffer fills (a slow or stalled consumer). Ignoring that return value lets
the cursor loop race ahead of the socket, buffering the entire payee ledger in the Node process
heap — relocating the same unbounded-memory exposure from a local array into the HTTP write buffer.
The export also kept paging the full ledger even after the client disconnected.

## Fix (code change — `exportEarningsCsv` only)
File: `src/checkout/payment-ops.controller.ts`

1. **Backpressure helper.** Added a module-level helper that awaits `drain` whenever a write is
   refused:
   ```ts
   import { once } from 'events';
   async function writeWithBackpressure(res: Response, chunk: string): Promise<void> {
     if (!res.write(chunk)) {
       await once(res, 'drain');
     }
   }
   ```
2. **Every write respects backpressure.** The header write and every per-batch chunk write now go
   through `writeWithBackpressure(res, ...)`, so the cursor loop parks (and stops fetching the next
   500-row batch) until the socket drains. In-flight memory is bounded to ~one batch + the kernel
   socket buffer regardless of ledger size — restoring the honest `O(batchSize)` claim.
3. **Client-disconnect early-exit.** Registered `res.once('error', stop)` and `res.once('close', stop)`
   which set a `clientGone` flag. The loop checks the flag before each DB fetch and before each
   write and `return`s immediately if the client has gone, so an aborted download no longer pages
   through (potentially millions of) ledger rows for a consumer that is no longer there. `res.end()`
   is likewise skipped when the client has already disconnected.

No other behavior changed: the route remains `@Roles('coach','owner')`, payee-scoped to
`req.user.id`, id-stable cursor batched at 500, with no total-row cap (full ledger still drained on
the happy path).

## Tests added (`test/payment-ops.controller.spec.ts`)
Two new unit tests, both modeling the response as a real `EventEmitter` so `once(res,'drain')`
genuinely suspends:

1. **`B6: export.csv WAITS for the drain event when write() signals backpressure`** — the header
   `write()` returns `false`; the test asserts the export is parked (promise unresolved, no further
   chunk written, `res.end()` not called) until a synthetic `drain` is emitted, then resumes and
   drains all 600 seeded rows. This directly verifies the backpressure wait is actually awaited.
2. **`B6: export.csv stops the DB loop early when the client disconnects`** — emits `close` on the
   first body write over a 2,000-row (4-batch) ledger and asserts the loop bails out early
   (`findMany` called fewer than 4 times) and `res.end()` is never reached.

The two pre-existing export tests were given a no-op `res.once` stub so they continue to exercise
the streaming path unchanged.

### Negative control (verifies the tests catch the defect)
Reverting the fix to the old fire-and-forget writes (and removing the early-exit guards) makes
**both** new tests fail (`2 failed, 54 passed`), confirming they fault the actual defect rather than
passing trivially. Restoring the fix returns the suite to green.

## Write-set verification — CLEAN
`git diff origin/main..8f1e7b7 --stat` (against `origin/main` @ `a344ec4d`) is limited to the three
H1 files:

```
src/checkout/payment-ops.controller.ts
src/checkout/payment-ops.dto.ts
test/payment-ops.controller.spec.ts
```

## Quality gates (re-run on post-fix HEAD `8f1e7b7`)
- **Tests:** `yarn jest test/payment-ops.controller.spec.ts` → **56/56 passed** (was 54/54; +2 new
  backpressure / disconnect tests).
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` →
  **pass (exit 0)**, no payment-ops diagnostics.

## Author / commit metadata
- HEAD author & committer: `Dynasia G <dynasia@trygrowthproject.com>`
- Commit message: `fix(H1) R3: stream backpressure + client-disconnect early-exit in exportEarningsCsv` — no trailers.

## Outcome
The sole R3 P1 (streaming backpressure) is resolved: writes now honor `drain`, the export stops
early on client disconnect, and the `O(batchSize)` memory bound is enforced and test-verified.
Branch contains only the three H1 files against current `origin/main`, all gates green.

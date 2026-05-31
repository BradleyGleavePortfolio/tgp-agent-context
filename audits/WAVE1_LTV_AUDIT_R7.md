# WAVE1 LTV Audit R7

Auditor: independent/adversarial (did not author the code)

## SHA / scope

- Worktree: `/home/user/workspace/wt-ltv`
- Verified HEAD: `af1630d5e28320bbaa5060da3ef84c6c0ddc90ed`
- Backend origin/main baseline: `c909c188f0938c723b77c42b1fd128d228b5257a`
- Write-set vs baseline:
  - `src/coach/command-center/ltv-metrics.dto.ts` (DTO-only/API docs; optional/expected)
  - `src/coach/command-center/ltv-metrics.service.ts`
  - `test/ltv-metrics.service.spec.ts`
- Unexpected files: none.

## Gates

- `npm ci`: PASS. Snippet: `added 1011 packages, and audited 1012 packages in 33s`; `found 0 vulnerabilities`.
- `npx tsc --noEmit`: PASS. Snippet: `TSC_PASS`.
- `npm run lint`: PASS with warnings only. Snippet: `✖ 16 problems (0 errors, 16 warnings)`; one warning is in touched `src/coach/command-center/ltv-metrics.service.ts:77` for pre-existing/unchanged `startOfLastMonth` unused.
- `npx jest test/ltv-metrics.service.spec.ts test/ltv-metrics.controller.spec.ts --runInBand`: PASS. Snippet: `Test Suites: 2 passed, 2 total`; `Tests: 50 passed, 50 total`.

## Code audit

### P1 first-run insert race

Status: CLOSED.

- `src/coach/command-center/ltv-metrics.service.ts:594-612` runs the ensure-row insert inside an interactive `prisma.$transaction` and uses `ON CONFLICT ("coach_id") DO NOTHING` exactly. It seeds `all_time_peak_rpcm` to literal `0::numeric` and `zero_churn_streak` to the request's computed seed only when the row is absent; an existing row's peak/streak cannot be clobbered because the conflict action is `DO NOTHING`, not `DO UPDATE`.
- `src/coach/command-center/ltv-metrics.service.ts:620-627` then performs `SELECT "all_time_peak_rpcm" ... FOR UPDATE` in the same transaction, and `src/coach/command-center/ltv-metrics.service.ts:640-645` updates only `all_time_peak_rpcm` and `updated_at` before the transaction callback returns. The lock is held from the `FOR UPDATE` read through the update and commit.
- The old first-run no-row `INSERT ... RETURNING` branch is absent. After the ensure-row step, first-run and existing-row requests use one path: ensure row, lock live row, compute max, update peak only.

Concurrent first-run trace:

1. Both requests pre-read no `coach_ltv_peak` row and enter `lockedPeakUpsert`.
2. One transaction's ensure insert materializes a single `0/seed` row; the other transaction's ensure insert waits on or observes the unique conflict and then does nothing.
3. The first `SELECT ... FOR UPDATE` reads prior `0`, updates peak to its incoming RPCM, and commits.
4. The second `SELECT ... FOR UPDATE` reads the live committed peak from the first request, computes `Math.max(livePrior, incoming)`, and updates the row to the max of the two incoming values.
5. Neither path emits a unique-constraint error, the final row count is one, the final peak is the max, and `is_new_rpcm_record = incoming > liveLockedPrior` means a lower-first then higher-second race can legitimately return `true` for both because both advanced the high-water mark in sequence; a higher-first then lower-second race returns `true` only for the higher request.

### P0 existing-row snapshot race

Status: CLOSED.

- `src/coach/command-center/ltv-metrics.service.ts:391-402` derives `is_new_rpcm_record` from `persisted.priorPeakRpcmCents`, returned by the locked transaction, not from the pre-write `findUnique` snapshot.
- `src/coach/command-center/ltv-metrics.service.ts:620-635` reads the live row with `FOR UPDATE` and computes `newPeakCents = Math.max(priorPeakRpcmCents, incomingPeakCents)` in application code. No `WITH prev` / `ON CONFLICT DO UPDATE` / `EXCLUDED` snapshot pattern remains in the persistence path.
- Existing-row race trace: stored $100, request A incoming $300, request B incoming $250. Both may pre-read $100 and enter the transaction, but B's `SELECT ... FOR UPDATE` blocks behind A and then reads live $300. B computes max($300,$250)=$300 and returns `is_new_rpcm_record=false`; A returns true; final peak remains $300.

### Peak monotonicity and streak handling

Status: CLOSED.

- All write paths that enter persistence compute peak as `Math.max(priorPeakRpcmCents, incomingPeakCents)` at `src/coach/command-center/ltv-metrics.service.ts:632-635`; the dominated no-write branch at `src/coach/command-center/ltv-metrics.service.ts:403-410` returns the already-persisted peak and false new-record.
- The update statement at `src/coach/command-center/ltv-metrics.service.ts:640-645` writes only `all_time_peak_rpcm` and `updated_at`; it never writes `zero_churn_streak` on the update path.
- The response streak is assigned from `computedStreak` at `src/coach/command-center/ltv-metrics.service.ts:332-354` and returned at `src/coach/command-center/ltv-metrics.service.ts:447`; it is never read from the persisted row for the response.

### Edge cases

- Existing-row `ON CONFLICT DO NOTHING`: safe. If the ensure insert conflicts because the row already exists, the subsequent `SELECT ... FOR UPDATE` reads the correct live row under lock in the same transaction.
- Concurrent coach delete / cascade: if the metrics transaction obtains the FK/child-row locks first, the delete waits until metrics commits. If the delete wins first, the ensure insert can fail its FK check or the child row can disappear before locking; that can surface as a request error for a coach being deleted. I do not classify this as an LTV peak-race regression because the coach is concurrently being removed and no surviving peak row is required.
- Deadlock risk with two coaches: this code locks at most one `coach_ltv_peak` row per request and does not acquire multiple coach locks, so there is no two-coach lock-order inversion in this path.
- Isolation level: Prisma's default/read-committed behavior is adequate here because the correctness-critical prior is read with `SELECT ... FOR UPDATE` inside one transaction; after waiting, Postgres locks and returns the current committed row version, which is exactly the required semantics.

## Test-quality assessment

- The committed tests include the claimed focused coverage and the focused Jest run reports `50 passed, 50 total`.
- The mock now models a shared live store, an ensure-row `INSERT ... ON CONFLICT DO NOTHING`, a `SELECT ... FOR UPDATE` live read, and a peak-only update; this is strong enough to catch regressions back to a missing ensure-row step or a snapshot/pre-read `is_new_rpcm_record` decision.
- The first-run tests are sequential simulations of the two possible lock acquisition orders rather than true `Promise.all` interleavings, but they exercise the relevant serialized outcomes that row locking produces. They would fail against the immediately previous first-run branch because that branch performed `SELECT ... FOR UPDATE` before any ensure row and then used a bare `INSERT ... RETURNING` via `tx.$queryRaw`; the current guard test explicitly requires the ensure-row `ON CONFLICT DO NOTHING`, no `RETURNING` lock/read pattern, and a peak-only `UPDATE`.
- I did not find a committed throwaway proof test that demonstrates the old implementation throwing and losing the $300 peak; the comments describe the old failure mode, and the committed regression tests are adequate for the fixed behavior, but the proof itself is not present in the tracked test file.

## Findings

No blocking findings.

VERDICT: CLEAN

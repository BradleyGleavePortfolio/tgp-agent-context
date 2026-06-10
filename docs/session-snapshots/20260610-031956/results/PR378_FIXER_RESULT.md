# PR #378 Roman Phase 1 — Fixer RESULT

## Outcome: COMPLETE ✅

Both R1-P2 findings closed. Resumed from the dead agent's wip snapshot, validated it, added the missing piece (real `Retry-After` HTTP header), ran all gates green, pushed, and commented.

## HEAD SHA on `feat/roman-phase-1-chat`

- **New HEAD:** `2537794292edc93b30f7ea95a1591b640c43f26b`
- **Previous PR head:** `1aaf6d4483aabbbccc32d2d6e89a9808b3300d74`
- Fast-forward (no force-push needed); remote tip was unchanged at push time.
- **Author:** `Dynasia G <dynasia@trygrowthproject.com>`, title-only commit:
  `fix(roman): rate-limit returns 429 with Retry-After; SSE abort forwarded to Anthropic SDK`

## Was the wip snapshot usable as-is?

**Mostly — but incomplete on R1-P2-1.** The snapshot `062d48d2` was applied verbatim for:

- **R1-P2-2 (SSE abort):** COMPLETE as-is. Snapshot plumbs an `AbortController` into
  `anthropic.messages.stream({...}, { signal: upstream.signal })`, forwards client
  `opts.signal` abort to it, preserves the partial-token write-back (persists `acc` with
  `interrupted=true` regardless of exit path), and cleans up the listener + aborts upstream in
  `finally`. Tests assert the SDK received a signal, that it aborts on client disconnect, and
  that it also aborts on clean completion (no leak). No changes needed.

- **R1-P2-1 (429):** PARTIAL in the snapshot. It correctly swapped `ForbiddenException` →
  `HttpException(..., HttpStatus.TOO_MANY_REQUESTS)` (429) and updated the service unit test.
  **But the brief explicitly requires a real `Retry-After` HTTP header**, and the snapshot only
  carried `retryAfterSeconds` in the JSON body — no header was set.

### Additional change I made (to finish R1-P2-1)

- `src/roman/roman.controller.ts`: wrapped `assertWithinRateLimit` in try/catch; on the thrown
  429, read `retryAfterSeconds` from `err.getResponse()` and set
  `res.setHeader('Retry-After', String(retryAfterSeconds))` before re-throwing so the NestJS
  exception filter still serialises the structured body. The header is set before the SSE
  stream opens (writeHead never runs on a rate-limited request).
- `test/roman/roman.controller.spec.ts`: added `setHeader` to the `makeRes()` mock; converted
  the existing rate-limit rejection test to a real 429 `HttpException`; added a new test
  asserting status 429 **and** `Retry-After: '42'` header is set, and that `writeHead` is never
  called when rate-limited.

## File-surface overlap check vs in-flight work

5 files touched, **all within the allowed surface** (`src/roman/**`, `test/roman/**`):

- `src/roman/roman.controller.ts`
- `src/roman/roman.service.ts`
- `test/roman/roman-streaming.spec.ts`
- `test/roman/roman.controller.spec.ts`  (brief permitted "only if needed for 429 plumbing" — used exactly for that)
- `test/roman/roman.service.spec.ts`

**No forbidden files touched:** no `prisma/schema.prisma`, no `prisma/migrations/**`, no
`app.module.ts`, no `package.json` / lockfile, nothing outside `src/roman` / `test/roman`.

Sibling-repo / `tgp/` checkouts were left untouched (other agents' workspaces). The only disk
reclaim performed was `npm cache clean --force` (regenerable cache) to recover from a
disk-full (100%) condition before installing deps — no repo content removed.

## Gate output (tails)

### 1. `tsc --noEmit`
```
---TSC EXIT: 0---
```
(clean — no output, exit 0)

### 2. `eslint src/roman test/roman`
```
---ESLINT EXIT: 0---
```
(clean — no output, exit 0)

### 3. `jest --testPathPatterns='test/roman' --runInBand`
```
Test Suites: 4 passed, 4 total
Tests:       56 passed, 56 total
Snapshots:   0 total
Time:        10.055 s
Ran all test suites matching test/roman.
---JEST EXIT: 0---
```

### 4. `jest --testPathPatterns='module-graph' --runInBand`
```
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        28.285 s
Ran all test suites matching module-graph.
---EXIT: 0---
```
(module-graph.spec.ts compiles the full `AppModule` end-to-end via @nestjs/testing — this is
the repo's real app-boot smoke; see note below.)

### 5. app-boot smoke
The brief's literal `app-boot` testPathPattern matches **no test file** in this repo (the brief
assumed pnpm + a test name that does not exist here). The app-boot intent — "does the app's
module graph instantiate cleanly with Roman mounted" — is covered by **`module-graph.spec.ts`
(gate 4)**, which does `Test.createTestingModule({ imports: [AppModule] }).compile()`. As an
extra integration check I also ran the full-app smoke `e2e-saas-smoke`:
```
Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        9.026 s
Ran all test suites matching e2e-saas-smoke.
---EXIT: 0---
```

**All gates PASS.**

## PR comment URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/378#issuecomment-4665909410

## Notes for R2

- Package manager is **npm** (`package-lock.json`), not pnpm; `npm ci` + `npx <tool>` used.
- Jest version requires `--testPathPatterns` (plural), not `--testPathPattern`.
- Environment hit disk-full (100%) on first install; cleared npm cache to proceed. If gates
  fail to install in future dispatches, reclaim disk before retrying.

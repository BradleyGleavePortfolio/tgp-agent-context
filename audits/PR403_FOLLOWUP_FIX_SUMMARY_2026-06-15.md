# PR #403 Follow-up Fix — F1 (CI) + F6 (throttle test) — COMPLETE / CI GREEN

## Outcome: both open re-audit items closed. All 4 PR checks PASS.

## Final state
- Branch: `fix/pr401-r81-cleanup` (commits added on top, no rebase/branch-off — R52 honored).
- **Final commit SHA: `e8fef8c6`**
- Commit chain (top two are new):
  - `e8fef8c6` test(regimes): pin write-route @Throttle metadata (R79 F6)  ← Item 2
  - `83649a5a` test(openapi): raise AppModule-compile beforeAll timeout to 60s (R81 F1 CI)  ← Item 1
  - `630de034` (prior fixer head)
- Both commits authored inline as `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R74). No AI co-author trailers.

## CI status — `gh pr checks 403` (run 27531145018, head e8fef8c6)
| Job | Conclusion | Time |
|---|---|---|
| build-and-test | **pass** | 7m12s |
| mwb-3-live-tests | pass | 2m40s |
| rls-floor-guard | pass | 18s |
| rls-live-tests | pass | 1m57s |

Previous head (630de034) had build-and-test = FAILURE. Now green.

## Item 1 (F1) — CI verification
Edited only `test/openapi-spec.spec.ts`:
- Raised file-level `jest.setTimeout(20000)` → `jest.setTimeout(60_000)`.
- Added explicit per-hook arg: `beforeAll(async () => { ... }, 60_000)`.
- Added rationale comment referencing sibling AppModule-compiling specs (module-graph 30s, roles-enforced 45s, "extended for CI environments with heavy concurrent load").

**CI log proof (run 27531145018, build-and-test job 81369261610):**
- `PASS test/openapi-spec.spec.ts (10.302 s)` — no "Exceeded timeout of 20000 ms for a hook".
- `Test Suites: 12 skipped, 420 passed, 420 of 432 total` (was: 1 failed).
- `Tests: 151 skipped, 5 todo, 5464 passed, 5620 total` (was: 6 failed).

Local verification before push:
- `npx jest test/openapi-spec.spec.ts` → 8/8 pass (11.0s).
- `npx jest --runInBand test/openapi-spec.spec.ts test/module-graph.spec.ts test/roles-enforced.spec.ts` → 12/12 pass (15.1s).

Mocking the heaviest providers was NOT needed — raising the timeout turned CI green.

## Item 2 (F6) — throttle regression-pinning test
New file: `src/regimes/__tests__/regimes-throttle-metadata.spec.ts` (62 lines, **4 assertions**).
Matches the established `test/billing-throttle-metadata.spec.ts` pattern (keys `THROTTLER:LIMITdefault` / `THROTTLER:TTLdefault`, `Reflect.getMetadata` off `Controller.prototype.method`, `throttle()` helper, `toEqual({ limit, ttl })`). Lives under `src/regimes/__tests__/`, already a configured jest root, so it runs in build-and-test.

Assertions (verified against decorator source values):
- `RefundDecisionsController.prototype.decide` → `{ limit: 10, ttl: 60000 }`
- `RegimesController.prototype.promote` → `{ limit: 30, ttl: 60000 }`
- `RegimesController.prototype.update` → `{ limit: 30, ttl: 60000 }`
- `RegimesController.prototype.archive` → `{ limit: 30, ttl: 60000 }`

Local: `npx jest src/regimes/__tests__/regimes-throttle-metadata.spec.ts` → 4/4 pass.
CI: `PASS src/regimes/__tests__/regimes-throttle-metadata.spec.ts` in run 27531145018.

## Lane scope (R77)
Only two files touched, both in scope:
- `test/openapi-spec.spec.ts` (timeout)
- `src/regimes/__tests__/regimes-throttle-metadata.spec.ts` (new test)

## Blockers
None. CI is fully green; no escalation to mocking required.

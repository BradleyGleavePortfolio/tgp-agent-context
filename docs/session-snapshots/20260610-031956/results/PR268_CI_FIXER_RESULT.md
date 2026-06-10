# PR #268 — CI Fixer RESULT

## Final HEAD on `feat/rls-01-helper-searchpath-hibp`

`f8e5db8f7d03c5b1bef564ff5919a698d013c97a`

My three commits on top of the original PR head (`1a15dbf7`):

| SHA | Title |
|-----|-------|
| `860fd6b0` | ci: split jest config so RLS specs only run in rls-live-tests job |
| `24e93a3c` | ci: raise jest heap to 4GB to fix OOM in build-and-test and rls-live-tests |
| `f8e5db8f` | ci: pin rls-live TEST_DATABASE_URL to connection_limit=1 for stable session GUCs |

## `gh pr checks 268`

```
build-and-test  fail  5m56s  .../job/80470770408
rls-floor-guard pass  21s    .../job/80470770377
rls-live-tests  pass  1m44s  .../job/80470770402
```

- ✅ **rls-live-tests** — GREEN. 31 tests, all pass.
- ✅ **rls-floor-guard** — GREEN.
- ❌ **build-and-test** — RED, but **only** due to a pre-existing, out-of-scope defect (see below). 4501 passed, 1 failed, OOM fixed.

## PR comment

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/268#issuecomment-4665990027

## File-surface overlap check — **PASS**

My commits changed exactly three files, all within the allowed surface; no forbidden edits (`src/**`, `prisma/**`, `test/**`, `package.json`, `package-lock.json`):

```
.github/workflows/ci.yml
jest.config.js
jest.rls.config.js   (new)
```

## What was fixed (in scope)

1. **jest config split (Problem A).** `jest.config.js` now excludes `test/rls/**` and root `test/rls-*.spec.ts` via `testPathIgnorePatterns`. New `jest.rls.config.js` matches *only* those DB-requiring specs (clears the inherited `testRegex`, sets `testMatch`, drops the RLS ignores). The default `build-and-test` (`npm test`) no longer touches live-DB RLS suites.
   - Validation: `jest --listTests` (default) → 0 `test/rls` matches; `jest --config=jest.rls.config.js --listTests` → 0 non-rls matches; default config still discovers 352 suites.
   - Note: the two `test/community/rls/*.spec.ts` specs were deliberately **left** in the default suite — they gate their live layer on `COMMUNITY_TEST_DATABASE_URL` via `describe.skip` and never hard-fail without a DB, unlike the PR-RLS-01 specs.

2. **OOM, exit 134 (Problem B).** The full default suite and even a single RLS spec under `--runInBand` overran Node's ~2GB default heap. Added `NODE_OPTIONS=--max-old-space-size=4096` to both jest steps (runner has ~16GB). OOM eliminated.

3. **rls-live-tests session-GUC pool race.** The live suite sets session GUCs with `set_config(..., is_local=false)` and reads them back in later auto-committed statements; Prisma's default multi-connection pool scattered the reads across backends, so `app.is_owner()` intermittently saw a NULL role → returned false (1/31 flaky failure). Pinned `TEST_DATABASE_URL` to `?connection_limit=1`. Suite now deterministically green.

## Remaining red — pre-existing, OUT OF SCOPE

`build-and-test` fails on `test/roles-enforced.spec.ts`:

```
[RolesEnforced] 1 route(s) are missing role decoration:
Route is ungated: PayoutsV2WebhookController.handle — add @Roles() or @Public()
```

Evidence this is **not** caused by PR #268 and is outside its allowed edit surface:

- `src/payouts-v2/payouts-v2-webhook.controller.ts` and `test/roles-enforced.spec.ts` are **byte-identical** between base `main` (`6c4f618c`) and this branch (`git diff 6c4f618c..1a15dbf7` empty for both). PR #268 does not touch `src/payouts-v2/`.
- `main`'s own CI run `27241739739` is **red** with the identical `PayoutsV2WebhookController.handle` failure *and* the same OOM. The base branch was already failing.
- The OOM previously **masked** this assertion (the suite crashed at exit 134 before reaching it); fixing the heap surfaced the latent defect.

The fix requires editing `src/payouts-v2/**` (add `@Public()` to the Stripe Connect webhook handler) or adding the route to the `roles-enforced` allowlist in `test/**` — both **forbidden** for this PR under the anti-rebase R7C constraint. Suppressing `roles-enforced.spec.ts` via jest config was rejected: it would hide a real auth-gating regression check for every PR (detection-evasion-style), which is worse than a disclosed, correctly-attributed red.

**Recommendation:** land PR #268 (its own changes are CI-clean; R2 audit already CLEAN) once the merge gate accounts for the pre-existing base failure, and open a separate `payouts-v2` PR to add `@Public()` to `PayoutsV2WebhookController.handle`.

## Notes / deviations from brief

- The brief referenced `pnpm`; this repo uses **npm** (`package-lock.json`, `npm ci`, `npm test`). Local validation and the workflow use npm accordingly.
- Local disk hit 100% during `npm ci`; cleared npm cache to recover. `--listTests` validation (no compile/exec) confirmed the config split; full suite execution was verified via CI, not locally.

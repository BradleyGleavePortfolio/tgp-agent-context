# H4.B FIXER R1 — Lens B finding closure (PR #464)

## BUILD MATRIX
- main HEAD (target base): 868000088fab1fc5929e02291bec4d4928e99aaf
- new main HEAD referenced in brief (conflict check): 8467c6f568a51337a7acbfb14f72ac85b996d605
- branch: wave-h4b-env-discovery
- branch HEAD pre-fix: c9ae7391e9ee3853da47cc0a98046b50806781fd
- final head SHA: 50c12090092d8ead56802bd4d524d0dc5023092d
- PR number: #464
- files changed: test/prod-readiness/env-discovery.ts, test/prod-readiness/env-discovery.spec.ts
- net prod LOC (excluding test/lockfile/data): 0  (both files live under test/** → R23/R76 exempt; [LOC-EXEMPT] preserved)
- net source LOC changed (scanner file, still under test/**): +66 / -9
- net test LOC changed (spec): +189 / -18
- test:src ratio: N/A in prod terms (prod-src delta = 0); test-only diff with 0 prod LOC added — R74 satisfied (no prod source introduced; 21 net new test cases added)
- snapshot branches pushed: wip/h4b-fixer-snapshot-20260619T160143Z (pre-fix R6), wip/h4b-fixer-aftertests-20260619T164129Z (post-tests checkpoint)
- CI status at exit: all-green (10/10 pass)
- mergeability: MERGEABLE / CLEAN (no conflict vs main; no rebase required)
- R3 identity check: PASS — author AND committer = Bradley Gleave <bradley@bradleytgpcoaching.com>; commit message scanned, zero banned identity tokens (commit-msg no-ai-tokens hook passed)
- R75 banned-tokens check: PASS — zero banned cast tokens in diff (CI "Banned cast tokens R75/R100.A2" green; local lefthook banned-cast-tokens green)
- timestamp UTC: 2026-06-19T16:55:00Z

## FINDING CLOSURE SUMMARY

### Finding 1 — MAJOR: `_TEST_` regex hid real prod env vars  [CLOSED]
- Before: `TEST_ONLY_ENV = /(^|_)_?TEST_/` matched any `_TEST_` *segment*, silently excluding genuine prod vars `MY_TEST_VAR`, `AB_TEST_BUCKET`, `FEATURE_TEST_MODE` from the readiness scan.
- Fix: anchored exclusion to PREFIX-only — `TEST_ONLY_ENV = /^_?TEST_/`. A name is test-only only when it *starts* with an optional underscore then `TEST_`.
- JSDoc on `TEST_ONLY_ENV` documents the prefix-anchor and explicitly names the prod vars that are now correctly retained.
- Behaviour delta:
  - `TEST_ONLY` → excluded (test-only) ✓
  - `_TEST_FLAG` → excluded (test-only) ✓
  - `MY_TEST_VAR` → included (real prod var) ✓
  - `AB_TEST_BUCKET` → included (real prod var) ✓
  - `FEATURE_TEST_MODE` → included (real prod var) ✓
- Tests: new `describe('isTestOnly — prefix-anchored TEST_ exclusion (Finding 1)')` block with 8 cases (includes a cross-reference probe proving an infixed-TEST_ var now surfaces as UNDECLARED rather than being hidden). Two PRE-EXISTING tests that asserted the old infix behaviour were corrected: the `FEATURE_TEST_MODE` registry-side test now expects it as a real (DEAD) prod var, and `isTestOnly('FEATURE_TEST_MODE')` now expects `false`.

### Finding 2 — MAJOR: `process["env"]` bracket access bypassed discovery  [CLOSED]
- Before: `isProcessEnv` only matched `PropertyAccessExpression` (`process.env`), so `process["env"].HIDDEN` and `process["env"]["HIDDEN2"]` slipped past discovery entirely.
- Fix: extended `isProcessEnv` to ALSO recognize `ElementAccessExpression` whose `expression` is identifier `process` and whose `argumentExpression` is a string literal with value `"env"` (single- or double-quoted). The existing outer-key extraction (property `.X`, string `["Y"]`, in-file const key, and destructuring) then applies uniformly to whichever inner form was used.
- Behaviour delta — all now discovered: `process["env"].HIDDEN`, `process['env'].HIDDEN`, `process["env"]["HIDDEN2"]`, `process['env'][CONST]`, `const { D } = process["env"]`. Non-env shapes (`process["notenv"].X`, `other["env"].X`) correctly remain ignored.
- Tests: new `describe('extractEnvVarRefs — process["env"] bracket access (Finding 2)')` block with 10 cases, including an end-to-end probe via `discoverEnvVars` that confirms a bracket-env var is recorded with `inCode: true` and the correct `codeRefs`.

### Finding 3 — MINOR: `import.meta.env` not supported  [CLOSED — intentional scope limitation documented]
- Decision: this repository is a NestJS backend with no Vite build, so `import.meta.env` is never a real prod env source. Supporting it would invent phantom vars. The correct resolution is to DOCUMENT the scope boundary, not extend the scanner.
- Fix: added a SCOPE JSDoc on `discoverEnvVars` and a matching note on `extractEnvVarRefs` stating the scanner is Node-scoped (`process.env.*` and `process['env'].*` only) and that Vite-style `import.meta.env.*` is intentionally out of scope. No code path matches `import.meta.env` (its base `import.meta` is not an identifier `process`), so it yields `[]` by construction.
- Tests: new `describe('extractEnvVarRefs — import.meta.env is out of scope (Finding 3)')` block with 3 cases asserting `import.meta.env.VITE_FLAG` → `[]`, `import.meta.env["VITE_OTHER"]` → `[]`, and that a sibling `process.env.NODE_REAL` in the same file is still found.

## VERIFICATION

### Local gates (all pre-push)
- Scoped tsc (`env-discovery.ts` + `.spec.ts` + `registry-loader.ts`, extends repo tsconfig.json, strict): exit 0, 0 errors.
- Full-project tsc via lefthook pre-commit (with raised Node heap): PASS (Prisma client generated first; full tree clean).
- Jest (`test/prod-readiness/env-discovery.spec.ts`): 112/112 pass (was 91 cases pre-fix; +21 net new cases plus the new probe blocks for all three findings).
- Prettier: all matched files conform.
- ESLint (max-warnings 0): PASS.
- Local R75 banned-cast grep on diff: clean. Stub-literal grep: clean.
- R3 word-boundary identity grep on diff and commit message: clean.

### CI at final head 50c12090 (R100 — 10/10)
| Check | Result |
|---|---|
| Test density (R100.A1) | pass |
| Banned cast tokens (R75 / R100.A2) | pass |
| LOC budget (R100.A3) | pass |
| build-and-test | pass (7m35s) |
| CodeQL JS/TS | pass (6m36s) |
| danger | pass |
| mwb-3-live-tests | pass |
| rls-live-tests | pass |
| rls-floor-guard | pass |
| size-label | pass |

mergeStateStatus = CLEAN, mergeable = MERGEABLE.

## STEPS TAKEN
- Read H4B_FIXER_BRIEF.md and H4_SPLIT_BUILDER_COMMON.md (R3/R6/R74/R75/R114/R124).
- Cloned BradleyGleavePortfolio/growth-project-backend to /tmp/gpb-b-fix; set git identity to Bradley Gleave; checked out wave-h4b-env-discovery (confirmed HEAD c9ae7391).
- Pushed R6 pre-fix snapshot wip/h4b-fixer-snapshot-20260619T160143Z.
- Applied Fix 1 (prefix-anchored TEST_ regex + JSDoc), Fix 2 (bracket-env recognition in isProcessEnv), Fix 3 (Vite scope JSDoc on discoverEnvVars + extractEnvVarRefs).
- Corrected two pre-existing spec tests that depended on the old infix behaviour; appended three new finding-specific describe blocks (21 net new cases).
- Generated Prisma client to unblock the full-project tsc gate; ran scoped tsc (0 errors) and full jest suite (112/112).
- Ran Prettier --write to satisfy the prettier lefthook gate.
- Committed with all lefthook gates green (banned-cast, prod-readiness-quick, eslint, prettier, tsc, commit-msg no-ai-tokens); pushed post-tests checkpoint wip/h4b-fixer-aftertests-20260619T164129Z and the branch.
- Waited for CI; polled until all 10 checks passed; confirmed PR MERGEABLE/CLEAN.

## DECISIONS & DEVIATIONS
- Test runner is Jest (ts-jest preset), not Vitest as the common preamble suggested; specs already use the shared describe/it/expect API, no change needed.
- The interrupted initial `npm ci` (sandbox timeout) corrupted node_modules and produced a bus error on first test run; resolved with a clean reinstall.
- Full-project tsc OOM-crashed (exit 134) under sandbox memory limits when run with default heap. This is environmental, not a type error — proven by (a) scoped tsc exit 0 with 0 errors and (b) the lefthook tsc gate passing once the Node heap was raised to ~3.5 GB. The authoritative CI build-and-test job also passed.
- Fix 3 is, per brief, a documented intentional scope limitation rather than a feature addition; closed by JSDoc + comment + an assertion test, not by extending the scanner.
- Brief's new main HEAD 8467c6f… conflict check: GitHub reports MERGEABLE/CLEAN, so no rebase was required (env-discovery files are net-new; conflicts did not arise, as anticipated).

## OPEN ITEMS
- None. All three findings closed, CI 10/10 green, PR mergeable.

VERDICT: FIXED

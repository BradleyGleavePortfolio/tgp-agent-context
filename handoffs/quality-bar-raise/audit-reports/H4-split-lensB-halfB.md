# H4 Split Audit Half B — Lens B Adversarial Report

Auditor: Lens B adversarial
Base main HEAD for all PRs: `868000088fab1fc5929e02291bec4d4928e99aaf`
Audit timestamp UTC: `2026-06-19T15:56:04Z`
Evidence rule: R11 independence; all evidence below was re-derived from PR diffs/source and targeted probes, not builder reports.
Probe artifact: `/home/user/workspace/audit-reports/H4-split-lensB-halfB-probe-results.json`

## PR #464 — H4.B env-discovery (head c9ae7391e9ee3853da47cc0a98046b50806781fd)

### BUILD MATRIX
- main pre-work: `868000088fab1fc5929e02291bec4d4928e99aaf`
- final head: `c9ae7391e9ee3853da47cc0a98046b50806781fd`
- branch: `wave-h4b-env-discovery`
- commits: 1 (all Bradley: yes — `Bradley Gleave <bradley@bradleytgpcoaching.com>`)
- net prod LOC: 0
- net test LOC: 1302
- test:src ratio: ∞ (prod LOC is 0)
- snapshots present (wip/*): yes — `wip/h4b-init-snapshot-20260619T143916Z`, `wip/h4b-pre-push-20260619T152530Z`
- CI at audit time: all-green (Banned cast tokens, CodeQL JS/TS, LOC budget, Test density, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label all pass)
- timestamp UTC: `2026-06-19T15:56:04Z`
- doctrine checks: R3 commit identity clean; R75 banned-cast grep clean; R114 no package/semver additions; R23/R76 pass; R74 pass; R6 snapshots present; R100 checks green.

### ADVERSARIAL PROBES PERFORMED
- `process.env["X" + suffix]`: expected either constant-fold discovery or explicit safe miss; observed `[]` from `extractEnvVarRefs`.
- ``process.env[`PREFIX_${dyn}`]``: expected miss for non-static template; observed `[]`.
- `process["env"].HIDDEN`: expected discovery of `HIDDEN` because it is equivalent to `process.env.HIDDEN`; observed `[]`.
- `process["env"]["HIDDEN2"]`: expected discovery of `HIDDEN2`; observed `[]`.
- `import.meta.env.VITE_FLAG`: expected discovery if scanner is meant to cover Vite-style env; observed `[]`.
- `const { DATABASE_URL } = process.env`: expected `DATABASE_URL`; observed `["DATABASE_URL"]`.
- Comment probe `/* process.env.FAKE */ const x = process.env.REAL`: expected only `REAL`; observed `["REAL"]`.
- Multi-line probe `process.env.\nMULTI`: expected `MULTI`; observed `["MULTI"]`.
- `isTestOnly("MY_TEST_VAR")`: expected false if only test scaffolding prefixes are excluded; observed `true`.
- Case-sensitivity probe `FOO` registry with discovered `FOO` and `foo`: observed `FOO:TRACKED`, `foo:UNDECLARED`; case handling is exact.

### FINDINGS
1. MAJOR — H4.B test-name exclusion is not anchored and can hide real prod env vars. Evidence: `TEST_ONLY_ENV = /(^|_)_?TEST_/` excludes any name containing `_TEST_`, and `isTestOnly("MY_TEST_VAR")` returned `true`; code location `test/prod-readiness/env-discovery.ts:289-319`. Impact: legitimate production controls such as `MY_TEST_VAR`, `AB_TEST_BUCKET`, or `FEATURE_TEST_MODE` can vanish from UNDECLARED/DEAD/TRACKED reporting. Fix: anchor the exclusion to known scaffolding prefixes, e.g. `/^_?TEST_/`, or replace regex exclusion with an explicit allowlist of test-only names.
2. MAJOR — H4.B misses bracketed `process["env"]` access. Evidence: `isProcessEnv` only accepts a `PropertyAccessExpression` whose expression is identifier `process` and name is `env` at `test/prod-readiness/env-discovery.ts:170-174`; probes for `process["env"].HIDDEN` and `process["env"]["HIDDEN2"]` both returned `[]`. Impact: code can read env vars through an equivalent JavaScript shape and bypass discovery entirely. Fix: teach `isProcessEnv` to recognize element access `process['env']` / `process["env"]` and then apply the existing property/string-key extraction to the outer access.
3. MINOR — H4.B does not support `import.meta.env` references. Evidence: the extractor only checks `process.env` shapes in `test/prod-readiness/env-discovery.ts:180-206`; `import.meta.env.VITE_FLAG` returned `[]`. Impact: any Vite/browser-side code under `src/` can carry production env switches invisible to the registry cross-reference. Fix: either add AST support for `import.meta.env.NAME` or explicitly scope the scanner to Node-only code and exclude frontend trees from its claimed coverage.

### VERDICT: FINDINGS

## PR #465 — H4.D provider-wiring (head 5b8acb133d2264d08f9bb4efd13a13d9edbc25ea)

### BUILD MATRIX
- main pre-work: `868000088fab1fc5929e02291bec4d4928e99aaf`
- final head: `5b8acb133d2264d08f9bb4efd13a13d9edbc25ea`
- branch: `wave-h4d-provider-wiring`
- commits: 1 (all Bradley: yes — `Bradley Gleave <bradley@bradleytgpcoaching.com>`)
- net prod LOC: 0
- net test LOC: 1064
- test:src ratio: ∞ (prod LOC is 0)
- snapshots present (wip/*): yes — `wip/h4d-init-snapshot-20260619T141724Z`, `wip/h4d-pre-push-20260619T153204Z`
- CI at audit time: all-green (Banned cast tokens, CodeQL JS/TS, LOC budget, Test density, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label all pass)
- timestamp UTC: `2026-06-19T15:56:04Z`
- doctrine checks: R3 commit identity clean; diff token sweep only hit legitimate provider name `OpenAI`, not author/message/trailer identity; R75 banned-cast grep clean; R114 no package/semver additions; R23/R76 pass; R74 pass; R6 snapshots present; R100 checks green.

### ADVERSARIAL PROBES PERFORMED
- Stripe malformed live key `sk_live_aaaaa` + `whsec_short`: expected STUB if key shape is validated; observed `WIRED`.
- Stripe publishable key in secret slot `pk_live_publishable` + `whsec_short`: expected STUB; observed `WIRED`.
- Stripe restricted key in secret slot `rk_live_restricted` + `whsec_short`: expected STUB or restricted classification; observed `WIRED`.
- `looksLikePlaceholder("sk_live_aaaaa")`: expected maybe invalid/placeholder; observed `false`.
- AWS IAM/web-identity probe with `AWS_REGION=us-east-1` and `AWS_WEB_IDENTITY_TOKEN_FILE=/definitely/not/here`: expected STUB because token file is unusable; observed `WIRED`.
- Env-map injection: core `classifyProvider` reads only supplied `env`; the only `process.env` default is edge wrapper `scanProvidersFromProcess`.
- Banned-cast smuggling: added-diff R75 grep found no banned cast tokens.

### FINDINGS
1. MAJOR — H4.D treats malformed/wrong Stripe key types as WIRED because it validates only placeholder sentinels, not provider key shape. Evidence: Stripe requires only `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` at `test/prod-readiness/provider-wiring.ts:67-72`; `classifyVars` marks any non-empty, non-placeholder value as present at `test/prod-readiness/provider-wiring.ts:123-129`; `looksLikePlaceholder` only checks generic substrings and `sk_test_` at `test/prod-readiness/provider-wiring.ts:325-348`. Probes classified `sk_live_aaaaa`, `pk_live_publishable`, and `rk_live_restricted` as `WIRED`. Fix: add provider-specific validators: `STRIPE_SECRET_KEY` must match a realistic `sk_live_...` secret-key shape and reject `pk_*`/`rk_*`; `STRIPE_WEBHOOK_SECRET` must match `whsec_...` with a minimum length.
2. MAJOR — H4.D can report AWS S3 WIRED for an unusable IAM/web-identity configuration. Evidence: AWS accepts the alternative group `["AWS_WEB_IDENTITY_TOKEN_FILE"]` at `test/prod-readiness/provider-wiring.ts:83-93`, and `classifyVars` only checks that the env string is non-empty/non-placeholder at `test/prod-readiness/provider-wiring.ts:123-129`; a nonexistent token path still returned `WIRED`. Fix: for file-based credential alternatives, check path existence/readability in the I/O edge and surface STUB/diagnostic if the token file is missing; keep the pure core injectable by passing a credential-evidence map.
3. MINOR — H4.D import discovery can be bypassed with common non-`from` import forms. Evidence: `collectImports` uses `/from\s+['"]([^'"]+)['"]/g` only at `test/prod-readiness/provider-wiring.ts:235-255`. Impact: `require('stripe')`, `await import('stripe')`, or side-effect `import 'stripe'` can leave a used provider classified `NOT_USED`. Fix: use the TypeScript AST to collect static import declarations, dynamic import string literals, and CommonJS require string literals.

### VERDICT: FINDINGS

## PR #466 — H4.F auto-flipper (head 2a58c17990f0690fb4d176baee56772bb9474002)

### BUILD MATRIX
- main pre-work: `868000088fab1fc5929e02291bec4d4928e99aaf`
- final head: `2a58c17990f0690fb4d176baee56772bb9474002`
- branch: `wave-h4f-auto-flipper`
- commits: 1 (all Bradley: yes — `Bradley Gleave <bradley@bradleytgpcoaching.com>`)
- net prod LOC: 0
- net test LOC: 851
- test:src ratio: ∞ (prod LOC is 0)
- snapshots present (wip/*): yes — `wip/h4f-init-snapshot-20260619T141729Z`, `wip/h4f-pre-push-20260619T153602Z`
- CI at audit time: all-green (Banned cast tokens, CodeQL JS/TS, LOC budget, Test density, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label all pass)
- timestamp UTC: `2026-06-19T15:56:04Z`
- doctrine checks: R3 commit identity clean; R75 banned-cast grep clean; R114 no package/semver additions; R23/R76 pass; R74 pass; R6 snapshots present; R100 checks green.

### ADVERSARIAL PROBES PERFORMED
- Secret leak via normal log: expected redaction; observed operator log uses `KEY=***` at `test/prod-readiness/auto-flipper.ts:232-236`.
- Secret leak via audit jsonl: expected no value; observed audit entry has `operator/action/key/before/after/timestamp` only at `test/prod-readiness/auto-flipper.ts:195-208`.
- Secret leak via failed runner: injected error `flyctl stderr echoed FEATURE_SECRET=true`; observed `result.failed[0].error` contains `FEATURE_SECRET=true`.
- `execFileSync` safety: expected argv array/no shell; observed `execFileSync(FLY_BIN, [...args], { stdio: ['ignore', 'pipe', 'pipe'] })`.
- `READINESS_AUTO_FLIP` strictness: `undefined`, `TRUE`, `yes`, and `1` returned false; only `true` returned true.
- Dry-run default: `flip(..., env unset)` returned a plan and `result: null`; runner was not invoked.
- Sequential ordering: source loop is synchronous over `plan.to_set`; no concurrent runner launch observed in code.
- Timeout/hang probe: source has no timeout option in `execFileSync`; a hung `flyctl` can block indefinitely.
- Race/TOCTOU probe: `plan` snapshots current values once; `commit` does not refresh current Fly state before each set.
- Malformed `flyctl secrets list --json`: no parser/list function exists in this PR; `current` is injected as a map, so malformed CLI JSON is outside this module's implemented boundary.
- Malicious `flyctl` on PATH: not mitigated; `FLY_BIN='flyctl'` is resolved on PATH. Marked out-of-scope per brief, but noted.

### FINDINGS
1. MAJOR — H4.F returns raw error/stderr text and can leak `KEY=value` from failure paths. Evidence: `flyErrorMessage` returns raw stderr or raw `Error.message` at `test/prod-readiness/auto-flipper.ts:181-192`, and `commit` stores `err.message` directly in `failed.push({ row, error: message })` at `test/prod-readiness/auto-flipper.ts:238-240`; the adversarial failed-run probe produced `FEATURE_SECRET=true` in `result.failed[0].error`. Fix: centralize redaction before throwing/storing errors, replacing every `\b[A-Z][A-Z0-9_]*=(true|false|[^\s]+)\b` with `KEY=***`, and never include raw argv-bearing command messages in thrown errors.
2. MAJOR — H4.F can hang indefinitely because `execFileSync` has no timeout. Evidence: `runFlyctl` calls `execFileSync(FLY_BIN, [...args], { stdio: ['ignore', 'pipe', 'pipe'] })` at `test/prod-readiness/auto-flipper.ts:157-160`; no `timeout`, `killSignal`, or watchdog exists. Impact: a stalled `flyctl` process can freeze the readiness agent and block the PR/ops workflow. Fix: set a bounded timeout, surface a redacted timeout error, and document retry behavior.
3. MAJOR — H4.F has a plan/commit TOCTOU race and no per-key recheck/lock. Evidence: `plan` compares a caller-supplied `current` snapshot at `test/prod-readiness/auto-flipper.ts:128-149`, while `commit` blindly sets each planned `KEY=target` at `test/prod-readiness/auto-flipper.ts:229-236` without rereading Fly state. Impact: two operators/processes, or one manual change between plan and commit, can cause stale writes over fresher production state. Fix: immediately before each set, reread that key/digest and skip or require force if current no longer matches the planned precondition; optionally add a lock/audit correlation id.

### VERDICT: FINDINGS

## OVERALL VERDICT
- PR #464: FINDINGS:3
- PR #465: FINDINGS:3
- PR #466: FINDINGS:3
- Wave (Half B): FINDINGS

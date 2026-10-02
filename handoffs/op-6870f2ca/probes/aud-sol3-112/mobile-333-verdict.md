AUDIT GPT-6.1 Sol — growth-project-mobile#333 @ abfc5d12ae593de67e83e8cf5d7bfe53cca61afc — VERDICT: REQUEST CHANGES

Independent **T4** release-infra audit per operator assignment (the PR header still says T3; reconcile it), **A/B/C 0/2/1**. Full diff, builder report and the prior other-lens verdict were read. Pre-install wiring and profile inheritance work, but release validation accepts trivially incomplete credentials and one diagnostic reflects private value text. [Candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333), [other-lens verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333#issuecomment-5961012291).

### B-333-2 — malformed credential placeholders pass the new release gate

`scripts/check-expected-env.js:405-423` validates Stripe only by its prefix and a Supabase JWT only by the decoded payload's role. Independent actual-function probes return **no problem** for both bare `pk_live_` / `pk_test_`, and for `.<base64url({"role":"anon"})>.` with **empty header and signature**. These cannot be usable release credentials, yet the new gate reports them valid instead of preventing an unusable auth/payment build. This is a bounded shape-validation defect, not a request to prove provider validity or JWT authenticity offline. [Candidate validation contract](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333).

**Minimal fix:** require a nonempty, bounded valid key body for the allowed Stripe mode; validate all JWT segments as nonempty base64url and decode/validate header and role payload before accepting a legacy anon key. Continue rejecting service-role and secret keys without reflecting their text. Add the three missing malformed-credential tests and retain real-looking positive controls; do not weaken required variables or install/live-call providers.

### B-333-3 — value text is reflected in an error destined for build logs

`scripts/check-expected-env.js:402,487-490,602` constructs its invalid-URL error using `u.protocol` and then prints it. A synthetic private-value probe sets the API URL to `auditsyntheticprivatecanary:opaque`: the actual validator returns **“must be an https URL (got auditsyntheticprivatecanary)”**, failing the no-reflection assertion. The claim “value not printed” does not sanitize this value-derived substring. This demonstrates the sink, not a real leaked credential. [Candidate no-values/logging contract](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333).

**Minimal fix:** use a fixed “must be an https URL” diagnostic, never interpolate any substring derived from a configured value; keep variable name, profile and actionable fix. Extend the CLI no-value test across malformed URL/key/DSN cases and review parse-error/parity diagnostics for the same invariant.

### C-333-1 — carried optional: remaining non-public hosts

`scripts/check-expected-env.js:386` does not cover 172.16/12, IPv6 loopback/ULA or `.internal`/`.lan`; add coverage if the validator is to fully support its “real host” claim. The DSN's separate regex likewise checks syntax, not reachability. Retain the other lens's optional ID, and do not treat this gate as an availability or provider-authentication probe. [Existing C-333-1](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333#issuecomment-5961012291).

### Verified and executed

`eas-build-pre-install` invokes `--eas-hook` before install; its executed path uses Node built-ins, with TypeScript loaded only by the unchanged source-scan path. Missing profile fails closed; development skips; clinic/production/preview require the reviewed names/modes, clinic inheritance merges env, mismatched profile values refuse, and service-role/secret-shaped-name checks remain. Package change is **scripts only**, no dependency or lock delta; no install performed. The helper is byte-identical to #305's copy. [Candidate and tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333), [paired helper](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305).

Through `ops/heavy.sh`, `env CI=true npx jest --runInBand --forceExit --runTestsByPath scripts/__tests__/releaseEnvProfile.test.js scripts/__tests__/expectedEnv.test.js scripts/__tests__/validateAppConfig.test.js` passed **3 suites / 99 tests**, exit 0. Independent `scripts/__tests__/auditSol333.boundaries.test.js` executed **4 failed invariants / 1 positive passed**, exit 1; the positive service-role check confirms the token itself is not reflected on that path. All inputs are synthetic. [Reviewed test scope](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333).

All three required contexts and CodeQL are SUCCESS at this head; these do not cover the failed invariants. `git diff --check` passes. Operator should run the documented production/preview `eas env:exec` dry checks after fixes; this auditor ran no EAS command/build, install, publish, production access, push, merge or workflow action. **Hold merge for B-333-2/3.** Logs and executable probe retained under `ops/aud-sol3-112/`. [Candidate checks and operator procedure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333).

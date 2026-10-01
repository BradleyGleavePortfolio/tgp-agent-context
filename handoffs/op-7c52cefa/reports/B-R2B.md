
## B-R2B — R2b AI consent enforcement (2026-10-01, Claude Opus 5.5 builder)

- PR: backend #626 (stacked on #622, base `agent/clinic/r2a-ai-consent-ledger`), head `9e72ab93d1704320900818f43dd3b99e3f77f546`. Tier T4. PR body copy: `ops/reports/B-R2B.prbody.md`.
- What it does:
  - One egress gate (`src/ai-egress`). Every client-data AI send checks the live box-2 grant at send time, with no cache. Ledger errors fail closed.
  - Refusal: 403 `{code:'ai_consent_required', message}` with coach or client wording. Policy defects return 503 `ai_egress_blocked`.
  - Paths with no client data use typed exemptions, each proven by a test.
  - The guard spec fails on any AI SDK import or provider call outside `src/ai-egress`.
  - The inventory table (13 paths) is in the PR body.
- Local evidence (all via ops/heavy.sh):
  - tsc: 0 errors.
  - The 24 changed specs: 24/24 suites, 420/420 tests.
  - 36 related specs: 467/467.
  - Boot/DI specs (module-graph, openapi-spec, roles-enforced, importer-contract, wearables-module.integration, and others): pass.
  - `check-r75 --mode=range --base=fcb984f2`: OK (`as any` net -5).
  - eslint: clean except a no-control-regex error that already exists at the base in test/coach-brief.service.spec.ts.
- CI: the PR is stacked, so it is ready for CI after retarget. Some workflows started anyway; at the time of writing, npm audit, rls-floor-guard and test-deploy-readiness passed, and build-and-test, rls-live-tests and mwb-3-live-tests were pending.
- No flags flipped. package.json and the lock file are unchanged.
- Decisions:
  1. Flip FEATURE_AI_CONSENT_LEDGER_ENABLED with the R2b deploy or just before it. Otherwise every client-data AI path returns 403 or the deterministic fallback.
  2. Diagnostic de-identified prospect scores to Perplexity are exempt (default: keep).
  3. Head-coach business totals and Roman coach-surface text are treated as non-client data (default: keep).
  4. Triage leaves out non-consenting authors, and the new gateway tenancy pre-flight may return 404 for non-roster ids (default: accept).

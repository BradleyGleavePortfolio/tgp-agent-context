
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

## Fix round 1 on #626 (operator mail 17:55; wrap-up order 19:10)

- Merged origin/main (53b625d2, #599) into the branch with merge commit 4db7b9b0, no force push. Fixes are in **9551d2c8**, which is now the pushed head.
- **A-626-1 (Sol) fixed.** SDK auto-retry is off on every client and forced to `maxRetries: 0` on every request. `AiEgressService.sendGated` owns retries (max 2, SDK-equivalent retryable rule, honours retry-after) and calls `assertMaySend` before each attempt. Streams retry only before the response opens. Test: `test/ai-egress/ai-egress-retry.spec.ts` (real SDKs, in-memory transport).
- **A-626-2 (Sol) fixed.** The `/ai/chat` context no longer selects `coach_notes_md`, and community wins are the caller's own. Test: `test/ai/client-ai-context-self-only.spec.ts` runs end to end with only the SDK mocked.
- **B-626-1 (Sol) fixed.** The 503 `ai_egress_blocked` copy names the support path and the reference, and the Roman SSE error event carries `requestId`. Tests: `test/ai-egress/ai-egress-policy-copy.spec.ts` and `roman-streaming.spec.ts` "B-626-1".
- **C-626-1 (Opus) fixed.** Call sites hold opaque frozen handles, and the SDK client sits in a module-private WeakMap. ESLint `no-restricted-imports` blocks AI SDK value imports outside src/ai-egress. The gate rejects unbound or forged handles. Tests: guard spec "AI provider capability boundary".
- **C-626-2 (Opus) not changed (justified).** The egress contract governs sending, and delivered output is the user's record. Recommend privacy copy that says past AI replies stay in history.
- **C-626-3 (Opus) fixed.** One bounded re-filter in triage on a mid-flight consent refusal. Tests: the 2 "C-626-3" tests in the triage spec.
- **Commands and results** (all through ops/heavy.sh):
  - tsc: 0 errors. This needed NODE_OPTIONS=--max-old-space-size=3584, because the default 2.5 GB cap ran out of memory on the merged tree.
  - jest `--runInBand` over 62 suites: 924/924 passed.
  - The new specs were copied onto a 360d8705 worktree: 5/5 suites failed (6 assertion failures, and 2 suites failed to compile on the old API).
  - eslint changed files and `src/**/*.ts`: 0 errors.
  - r75 range against 360d8705: OK, net -14.
  - package.json and lock: unchanged.
- PR body updated (Fix round 1 table, T3 mobile mapping for `ai_egress_blocked`). Fix-round comment: issuecomment-5942871895.
- CI at 9551d2c8: all 14 checks pass (build-and-test, CodeQL, rls-live-tests, mwb-3-live-tests, banned casts, schema parity, danger, npm audit, sbom, size-label, deploy readiness); deploy-readiness-gate skipped. Worktree removed. Status: fix round complete; awaiting Sol and Opus re-audit at 9551d2c8. No other queue items were started (wrap-up order).

# B-FLAGS-2 (agent 111) - Claude Opus 5.5 builder: one audited launch-flag path (T4) + SC2015 fix

Status: IN PROGRESS (started 08:10 PDT 10-02). Base: backend main e5a6044a. Worktree /home/user/workspace/wt/b-flags-2.

## Read-only findings
- Production secret NAMES (fly-secrets-list run 36885057965, 10-01 15:32Z; no Fly-writing workflow has run since): none of the
  Wave A/B flags, GOOGLE_CLIENT_IDS or MWB_AUTOSAVE_LOCK_TOKEN_SECRET is present. GOOGLE_OAUTH_CLIENT_ID/_SECRET/_REDIRECT_URI are present.
  Names-only extract: /home/user/workspace/ops/bflags2-111/prod-names-36885057965.txt.
- GitHub repo-level secrets include GOOGLE_CLIENT_IDS and FLY_API_TOKEN; none of the other 24 fly-env-sync allowlist names exists as a
  GitHub secret (so today's fly-env-sync would stage only GOOGLE_CLIENT_IDS).
- Fly's `secrets list` digest is a server-side HSM authenticator tag (flaps API); it cannot be reproduced from a local value, so
  "unchanged" cannot be decided from digests. Design uses an in-machine salted-hash compare (env-truth pattern) instead.
- flyctl: `secrets unset --stage` is supported; unsetting a missing name is not an error (internal/appsecrets.Update).

## Build log
- 10-02 ~08:50 PDT: PR 1 code written in /home/user/workspace/wt/b-flags-2 (branch agent/clinic/flags-manifest), rebased onto
  main e5d10bd8 (main moved past e5a6044a; #604 touched env-validation.ts, no conflict). Commit 40098fb1 (+ test robustness fixup pending).
  Files: .github/fly-env-desired-state.json, scripts/fly-env/fly-env-manifest.{js,d.ts}, .github/workflows/fly-env-sync.yml (rewrite),
  src/common/env-validation.ts (+values field, 26 one-line entries), test/ci/fly-env-manifest.spec.ts (new),
  test/ci/fly-env-sync-behavior.spec.ts (rewrite, stateful fake flyctl incl. ssh console), test/ci/fly-env-workflows.spec.ts
  (fly-env-sync describe rewritten; env-truth block unchanged), docs/runbooks/launch-flags.md (new), docs/runbooks/deploy-readiness.md s2.
- Round 1 jest (pre-rebase): 4 suites / 143 tests PASS (fly-env-manifest, fly-env-workflows, fly-env-sync-behavior, env-registration).
- actionlint 1.7.7 + shellcheck 0.9.0 (ubuntu-latest version; installed via pip shellcheck-py==0.9.0.6 in /tmp): 0 findings over all workflows.
- Manifest vs prod names (run 36885057965): 0 mismatches over 53 managed names.
- PR 2 worktree /home/user/workspace/wt/b-flags-2-sc2015 (branch agent/clinic/s10-sc2015 off main e5d10bd8): 3 SC2015 lists rewritten
  to `if ! { A && B; }; then fail ...; fi`; shellcheck 0.9.0 over scripts/*.sh -> 0 findings (was 3). Equivalence spec: 15 decision
  cases identical old vs new (incl. annotated-tag B for clause 2, 100755 + symlink for rewrite 3) + text proof.
- 10-02 ~09:10 PDT: PR 1 = #637 (agent/clinic/flags-manifest @ 6879d164, base main). Evidence: jest 5 suites / 197 tests PASS
  (fly-env-manifest, fly-env-workflows, fly-env-sync-behavior, env-registration, fly-env-classifier); tsc exit 0
  (NODE_OPTIONS=--max-old-space-size=3584; default heap OOMs); eslint changed files clean; prettier new/test files clean;
  check-r75 range OK; actionlint+shellcheck 0.9.0 clean.
  Behaviour/manifest specs start from a "production today" baseline, so a flip PR is exactly one line and needs no test edits;
  one extra case runs the checked-in manifest as is (plan clean, zero writes).
- Stacked draft flip = #638 (agent/clinic/flags-ai-consent-ledger-on @ c375b2ac, base agent/clinic/flags-manifest): one line
  FEATURE_AI_CONSENT_LEDGER_ENABLED "unset" -> "true"; validate OK (manifest sha256 0ed9002f...). Ready for CI (stacked).
- #633 comment posted recommending closure as superseded by #637 (not closed):
  https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/633#issuecomment-5956373821
- PR 2 equivalence spec: 17/17 PASS (2 text + 15 decision cases).
- PR 2 = #639 (agent/clinic/s10-sc2015 @ 54a7aec8, base main): CI all green (17 pass incl. shellcheck (scripts/*.sh) and
  build-and-test; deploy-readiness-gate skipped). Local: jest 17/17, tsc exit 0, eslint/prettier clean, check-r75 OK,
  shellcheck 0.9.0 over scripts/*.sh 0 findings.
- #637 CI: all pass incl. build-and-test, actionlint, R75, schema parity, rls/mwb live tests, test-deploy-readiness; only
  shellcheck (scripts/*.sh) fails, solely the pre-existing SC2015 lines 58/77/132 of s10-core-diff-gate.sh (fixed by #639).
  Main moved to b9ee8e0a (#629, packages; no file overlap): #637 and #639 merge-tree clean; not rebased to avoid CI churn.
- #638 flip: jest 3 suites / 114 tests PASS at c375b2ac with no test edits. Ready for CI (stacked; retarget to main after #637).

## Status: DONE (builder). Audit needed: #637 (T4), #639 (T4), #638 (T4 one-line flip).
Merge order: #639 (any time; turns infra-lint green), #637, then retarget #638 -> main and merge in the #626 window, then
operator runs plan -> apply (confirm=SET) -> #626 deploy -> plan (expect Deployed|match|keep).
Risks: in-machine check uses `flyctl ssh console -C` (same pattern as env-truth; never yet run against real Fly) - if ssh fails or
output is unparseable, plan warns with Fix and declared values are re-staged (safe; may cost one restart with deploy_staged).
`flyctl secrets deploy` applies every staged secret on the app (plan lists foreign staged names). Legacy
fly-feature-flags-set.yml (scout/pairing, awk post-check) untouched; its names are excluded. Calendar/meet/zoom/diagnostic/importer
flags are on Fly with unknown values -> excluded until an in-machine read adopts them. ENV_RULES `values:` must stay one-line.

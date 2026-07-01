# PR #0 · Fixer Brief · Round 1

You are the Opus 4.8 fixer-of-record for PR #0 of `BradleyGleavePortfolio/zion-preserve`.

Both GPT-5.5 auditors (Lens A + Lens B) returned `VERDICT: FINDINGS` on head `a71aecb130cae41842998fd78d8ec890fd738ca5`. This brief consolidates and deduplicates their findings and constitutes your fix scope. **Do exactly this scope — nothing more.**

## BUILD MATRIX (start-of-turn)

```
- zion-preserve pr0/constitutional-layer HEAD: a71aecb130cae41842998fd78d8ec890fd738ca5
- zion-preserve main HEAD:                     1c450ddae58b75ad86f003622824557833f4f672
- tgp-agent-context HEAD:                      82efe545db3d045d2af2dd13bfb4679b6e12c385
- PR #:                                        1
- PR URL:                                      https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- doctrine file:                               (in tgp-agent-context) projects/zion-preserve/doctrine/AGENT_RULES.md
- timestamp UTC:                               (record when you start)
```

Re-record BUILD MATRIX at end-of-turn. If PR head drifts to a SHA not authored by you during this turn, halt and report `INFRA_DRIFT` — do not push over external commits.

## Non-negotiables

- **R3 identity on every commit**: inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m …`. Zero AI/Claude/Computer/Agent/Opus/Anthropic/GPT/Sonnet tokens in commit messages, author, committer, or trailers.
- **R6 foreground only**; **R4 push every 2 min at natural checkpoints**.
- **R23/R76 LOC**: keep total added prod LOC ≤200 for this fix round. Governance files (docs, workflows, PR template) count. If you exceed 200 net additions, halt and report.
- **R15**: you are Opus. Do not delegate to other models.
- **R101 mirror**: any new enforced rule must have a checkbox in `.github/PULL_REQUEST_TEMPLATE.md`.
- **R124**: BUILD MATRIX at start and end of your report.

## Fix scope (consolidated from Lens A + Lens B)

### Group F1 — Broken enforcement (P0/P1 — must fix)

**F1.1 · R75/R112 banned-tokens gate has false negatives (Lens A P0)**  
`.github/workflows/banned-tokens.yml` uses `grep -E` with PCRE lookaheads (silently unsupported by GNU grep), regex anchored `^\s*` against diff lines that begin with `+`, and does not check the Python `Any` ban at all.  
**Fix**: rewrite the check body as a small inline Python 3.14 script that:
- runs `git diff --unified=0 origin/main...HEAD -- '*.py' '*.sol'` to get only added/removed lines
- parses `^\+` (added) and `^-` (removed) lines separately
- computes net delta per token; fails if net delta > 0 for any token
- token set (Python): bare `# type: ignore` (no `[code]`), `\bAny\b` (import + annotation), bare `except:`, `except:\s*pass`, `# noqa` without `: <code>`
- token set (Solidity): `\bassembly\s*\{`, `\bunchecked\s*\{`, `\.call\{[^}]*\}\([^)]*\)` when not followed by an assigned `bool success` check in the next 10 lines (this is a heuristic; err strict — a single occurrence without `require(success` inside a window fails), `\.transfer\(`
- add fixtures under `tests/fixtures/banned-tokens/` (2 Python files, 2 Solidity files) and a `pytest`-free smoke: workflow runs the check against fixtures first with `--self-test` and asserts each token is caught.

**F1.2 · R108 switch-registry is a no-op (Lens A P0)**  
`switch-registry-check.yml` and `lefthook.yml` print a notice and pass when `scripts/deploy-readiness.py` is missing.  
**Fix**: implement `scripts/deploy-readiness.py` (Python 3.14, stdlib only) that:
- walks the repo, finds every `os.environ`, `os.getenv`, `getenv(`, and `import.meta.env` / `process.env` usage in `.py`/`.sol`/`.ts`/`.tsx`/`.js`/`.yml`/`.yaml`
- also parses `.env.example` (if present) and every workflow `env:` block for env-var names
- loads `prod-switches.yml`, extracts the `name:` set
- prints and exits non-zero if the discovered set ≠ registered set
- CLI flags: `--check` (default), `--report` (JSON)
- update `.github/workflows/switch-registry-check.yml` and `lefthook.yml` to invoke the script and **fail** (not skip) if it is missing or non-zero.

**F1.3 · R23/R76/R105 xl-gate can pass a same-commit size/XL PR (Lens A P1)**  
`.github/workflows/pr-size.yml` reads `github.event.pull_request.labels` from the event payload, so labels added by `size-label-action` in an earlier step of the same run are not visible to `xl-gate`.  
**Fix**: rewrite `xl-gate` to compute LOC directly using `gh api repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }} --jq '.additions'` (and `gh api ... --jq '.body'` for the override string), then fail when additions > 400 unless the body contains an `R23 EXCEPTION` block AND the `r23-override` label is present (fetched via `gh api ... /issues/N/labels`).

**F1.4 · R114/R95 Actions not SHA-pinned (Lens A P1)**  
Every third-party and first-party action across all workflows must be pinned to a full 40-char commit SHA, with the human tag in a comment.  
**Fix**: update pins in `banned-tokens.yml`, `ci.yml`, `codeql.yml`, `iac-security.yml`, `sast.yml`, `secrets-scan.yml`, `r3-identity-guard.yml`, `switch-registry-check.yml`, `pr-size.yml`. Use these known-good SHAs (verify each with `gh api` before pushing):
- `actions/checkout@v4` → `11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2)
- `actions/setup-python@v5` → `0b93645e9fea7318ecaed2b359559ac225c90a2b` (v5.3.0)
- `github/codeql-action/*@v3` → `4f3212b61783c3c68e8309a0f18a699764811cda` (v3.27.1)
- `bridgecrewio/checkov-action@master` → **replace with** `38a95e98d734de90b74687a0fc94cfb4dcc9c169` (v12.2687.0). Verify SHA with `gh api repos/bridgecrewio/checkov-action/git/refs/tags/v12.2687.0`.
- Any others: verify with `gh api repos/OWNER/REPO/git/refs/tags/TAG --jq '.object.sha'` before pinning.

**F1.5 · R120 IaC scan misses required surfaces (Lens A P1)**  
`iac-security.yml` triggers omit `**/*.tf`, `fly.toml`, `.github/actions/**`, and its checkov framework list omits `terraform`.  
**Fix**: expand `paths:` and framework list; add `terraform`; keep SHA pin from F1.4.

**F1.6 · ci.yml Doctrine sweep is broken and command-injects PR body (Lens A P1)**  
`.github/workflows/ci.yml` R22 sweep interpolates `${{ github.event.pull_request.body }}` into shell (command injection surface) and runs `git log -1` on the merge commit, so R3 identity on PR is checked against the wrong commit.  
**Fix**:
1. checkout `${{ github.event.pull_request.head.sha }}` (add `ref:` and `fetch-depth: 0`), then reuse the range-check logic from `r3-identity-guard.yml` (`git log --format=... origin/${{ github.base_ref }}..HEAD`).
2. write PR body to a file with `jq -r '.pull_request.body' "$GITHUB_EVENT_PATH" > /tmp/pr-body.txt`, then `grep -Fq` against that file. Never embed PR-controlled text into `run:`.

**F1.7 · R110 gitleaks allowlist too broad (Lens A P1)**  
`.gitleaks.toml` allowlists `docs/examples/.*\.md`.  
**Fix**: remove that path allowlist entirely. Keep only per-fingerprint entries for known dummy secrets (add fingerprint entries in a follow-up if fixture leaks appear).

**F1.8 · CodeQL/Semgrep/Gitleaks currently red (Lens A P1)**  
These three security workflows are failing on an empty constitutional PR. Make them functional-on-empty:
- CodeQL: guard the analyze step to skip cleanly when no `.py`/`.js`/`.ts`/`.sol` source files exist under configured paths. Use `if: hashFiles('**/*.py','**/*.js','**/*.ts') != ''`.
- Semgrep: same guard; if no source files, print "no source yet" and exit 0.
- Gitleaks: after removing the broad allowlist (F1.7), rerun and confirm green on the current diff.

### Group F2 — Documentation/mapping honesty (P1/P2)

**F2.1 · R102 mapping falsely claims branch protection configured (Lens B P1)**  
`AGENT_RULES_ZION_MAPPING.md:641-645` says "Configured in this PR" — false.  
**Fix**: change verdict text to state: branch protection is an operator/platform action per R102; PR #0 ships the required-check names (`ci`, `secrets-scan`, `codeql`, `sast`, `iac-security`, `banned-tokens`, `pr-size`, `r3-identity-guard`, `switch-registry-check`) so the operator can wire them exactly once. Cross-reference `DECISION_LOG.md:81-82`.

**F2.2 · R97 money-path scope missing risk/execution/reconciliation/sizing (Lens B P1)**  
Mapping and PR template ban floats only in `zion_preserve/{trading,vault,pnl}/`.  
**Fix**: extend to `zion_preserve/{trading,vault,pnl,risk,execution,reconciliation,sizing}/` in both `AGENT_RULES_ZION_MAPPING.md` (R97 row) and `.github/PULL_REQUEST_TEMPLATE.md` (R97 checkbox). Also extend `CODEOWNERS` money-path list.

**F2.3 · R109 mapping contradicts upstream (Lens B P1)**  
Mapping permits user-visible "feature not yet available — track ZION-XX" state.  
**Fix**: strike that phrasing. Replace with: features unready must not be reachable by the user at all — no dead-end entry point. Off-flag features hide the entry point entirely.

**F2.4 · R101 template missing checkboxes for enforced rules (Lens A P1 + Lens B P2)**  
`.github/PULL_REQUEST_TEMPLATE.md` lacks checkboxes for R22, R66, R71, R95, R98 (PII), R83 (feature flag), R102, R103, R104, R105, R111, R121, R122.  
**Fix**: add a "CI/Governance enforcement (auto-checked)" group with checkboxes for R22/R71/R95/R102/R103/R104/R105/R111/R121/R122, and add R66 (dead code), R83 (feature flag), R98 (PII) to the semantic checklist.

**F2.5 · R13 delivery mechanism misstated in template (Lens A P2 + Lens B P2)**  
Template line 105-107 tells auditors to paste reports as PR review comments.  
**Fix**: replace with: "Auditors return the full report in the response message per R13. The operator (never the auditor) may paste findings as PR comments after review."

**F2.6 · R82 cites missing `docs/upgrade-strategy.md` (Lens B P2)**  
Either add the doc (≤40 lines) covering the V1/V2-parallel strategy, no `TransparentUpgradeableProxy`, indefinite V1 withdraw rights, and user-approved migration — or remove the file citation from the mapping. **Prefer adding the doc** — it is ≤40 lines and factually anchors R82.

**F2.7 · R125 defense-in-depth gaps for ZION-* extensions (Lens B P1)**  
Mapping claims every ZION-N extension has three enforcers, but many gates/docs/tests don't exist.  
**Fix**: for each ZION-N extension row that lacks an enforcer in this PR, replace the specific enforcer name with the honest text: "Enforcer deferred to follow-up PR — tracking issue #<N>". Then in Group F3 open the tracking issues so the reference is real.

### Group F3 — R20/R131 tracking-issue creation (P1)

**F3.1 · Open GitHub issues for every declared deferral (both lenses)**  
Use inline R3 identity on git operations; issue creation is via `gh` — GitHub attributes the issue to the authenticated user, which is correct.

Open these issues on `BradleyGleavePortfolio/zion-preserve`:

1. **R70 wallet-restore drill implementation** — label `r131-challenge`, `r20-tracking`, `wave-1`. Body: describes the R131 challenge (Supabase PITR → wallet-key recovery), links `docs/runbooks/wallet-key-recovery.md`, requires `scripts/wallet-restore-drill.py`, monthly drill log at `docs/drill-log.md`, operator sign-off. Target: PR #1.
2. **R87 WCAG re-application on UI landing** — label `r131-challenge`, `r20-tracking`. Body: WCAG 2.2 AA re-applies when monitoring dashboard lands. Target: whichever PR ships first UI.
3. **R27 dashboard XSS re-application on UI landing** — label `r20-tracking`. Target: same UI PR as R87.
4. **ZION-1 testnet-drill workflow** — label `r20-tracking`, `wave-1`. Target: PR that adds first Solidity contract.
5. **ZION-2 wallet-tiers doc** — label `r20-tracking`, `wave-1`.
6. **ZION-3 kill-switch tests** — label `r20-tracking`, `wave-1`.
7. **ZION-5 / ZION-25 Slither + Aderyn workflows** — label `r20-tracking`, `wave-1`. Target: contract PR.
8. **ZION-30 wallet-tiers gate + doc** — label `r20-tracking`, `wave-1`.
9. **Repo default-branch reset from `pr0/constitutional-layer` to `main`** — label `r20-tracking`, `operator-action`. Target: pre-merge.
10. **Branch protection on `main`** — label `r20-tracking`, `operator-action`. Target: pre-merge. Body: lists exact required checks: `ci`, `secrets-scan`, `codeql`, `sast`, `iac-security`, `banned-tokens`, `pr-size`, `r3-identity-guard`, `switch-registry-check`. Also signed commits + linear history + no admin bypass + no force-push.

After creating each, **update `AGENT_RULES_ZION_MAPPING.md` and `docs/runbooks/wallet-key-recovery.md`** to replace `#<TBD>` with the concrete `#N` issue numbers. Also update `DECISION_LOG.md` R131 section (`:43-59`) with issue links.

### Group F4 — Ledger + report (mandatory close-out)

- Append a row to `handoffs/wave-0/dispatch-ledger.jsonl` for each subagent completed this cycle (Opus builder, Lens A, Lens B, this fixer). One JSONL line each. Fields per R126: `dispatch_id`, `wave`, `subagent_type`, `dispatched_at_utc`, `completed_at_utc`, `head_sha`, `expected_verdict`, `actual_verdict`, `notes`.
- Write your fixer report to `/tmp/pr0-fixer-report-round1.md` (workspace) with: BUILD MATRIX (start and end), summary of each fix, commit SHAs per fix group, ledger update line-count, and any items you could not fix (must be zero — halt and report if not).

## Explicitly out of scope

- Do not attempt to configure branch protection (operator/platform-only, R102).
- Do not attempt to reset repo default branch (repo-admin, out of builder OWNS).
- Do not write `scripts/wallet-restore-drill.py` — deferred to PR #1 (tracked in F3.1).
- Do not add tests/source files. This is still PR #0 (constitutional layer). Fixtures under `tests/fixtures/banned-tokens/` are the only exception (they are input data, not source).
- Do not touch files outside this scope.

## Commit sequence discipline

Use this commit pattern (each commit ≤50 LOC where possible):
1. `[R75/R112] rewrite banned-tokens gate as python parser + fixtures`
2. `[R108] implement scripts/deploy-readiness.py + wire ci/lefthook to fail on missing script`
3. `[R23/R76/R105] fix xl-gate to compute additions via gh api`
4. `[R114/R95] SHA-pin all actions across workflows`
5. `[R120] expand IaC scan surfaces + framework list`
6. `[R22/R3] fix ci.yml doctrine sweep — checkout PR head + jq PR body`
7. `[R110] remove broad gitleaks allowlist`
8. `[R103/R118] guard codeql/semgrep for empty repo`
9. `[R101] add missing enforced-rule checkboxes to PR template`
10. `[R97] extend money-path ban to risk/execution/reconciliation/sizing`
11. `[R102/R109] correct mapping doc — remove false claims`
12. `[R82] add docs/upgrade-strategy.md`
13. `[R125] correct ZION-* enforcer references in mapping`
14. `[R20] open tracking issues + patch references`
15. `[R13] correct PR template audit delivery text`
16. `[R126] append dispatch-ledger rows for audit cycle round 1`

Push after every 2-3 commits per R4.

## End-of-turn checklist

Before returning your report:
- [ ] `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` matches your final push SHA
- [ ] `git log origin/main..HEAD --format='%an <%ae> | %cn <%ce>' | sort -u` shows only `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- [ ] `git log origin/main..HEAD --format='%B' | grep -iE 'claude|anthropic|opus|sonnet|gpt|openai|computer|agent|ai\b'` returns empty
- [ ] Every tracking issue opened is linked back from the mapping doc / decision log
- [ ] Total net additions in this fix round ≤200 LOC (mapping-doc line edits count as additions net of deletions)
- [ ] Fixer report saved to `/tmp/pr0-fixer-report-round1.md`
- [ ] BUILD MATRIX (end-of-turn) recorded in your response

## Return format

Your response must contain:
1. BUILD MATRIX (start-of-turn)
2. Per-group summary (F1.1 through F4) with commit SHA for each fix
3. All 10 tracking-issue numbers created (F3.1)
4. Net LOC additions in this round
5. BUILD MATRIX (end-of-turn)
6. Final line: `FIXER_STATUS: READY_FOR_REAUDIT` or `FIXER_STATUS: BLOCKED — <reason>`

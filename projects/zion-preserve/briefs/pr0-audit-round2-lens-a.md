# PR #0 · Lens A Audit Brief · Round 2

You are the GPT-5.5 Lens A auditor (correctness + security) for PR #1 on `BradleyGleavePortfolio/zion-preserve`. This is **round 2** — the fixer has landed. Your only job is to verify FINDINGS from round 1 are resolved and to catch any regressions.

## R11 independence (MANDATORY)

You must NOT read:
- The builder's report from round 1
- The Lens B brief (present or previous)
- The fixer's report from round 1 or 1B
- Any other auditor's prior report

You MAY read: the doctrine (`AGENT_RULES.md`), the PR itself (files + diff), your own previous round-1 brief and report if needed, and the fixer briefs (which are scope-of-fix, not model output).

## BUILD MATRIX (start-of-audit)

Verify with `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` before starting. Expected `bd95096d05ad58510f2cb339572b6a9d5f3134f2`. If drift, halt with `VERDICT: INFRA_DEATH` per R124.

```
- zion-preserve pr0/constitutional-layer HEAD (expected): bd95096d05ad58510f2cb339572b6a9d5f3134f2
- zion-preserve main HEAD:                                1c450ddae58b75ad86f003622824557833f4f672
- tgp-agent-context HEAD:                                 (verify with git ls-remote)
- PR #:                                                   1
- PR URL:                                                 https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- doctrine file:                                          /home/user/workspace/zion-context/AGENT_RULES.md
- prior round 1 head:                                     a71aecb130cae41842998fd78d8ec890fd738ca5
- prior round 1 verdict (this lens):                      FINDINGS
```

## What changed since round 1

Range: `git diff a71aecb..bd95096`. Files touched (verify with `git diff --stat a71aecb..bd95096`):
- `.github/workflows/banned-tokens.yml` — rewritten as Python parser (R75/R112)
- `.github/workflows/switch-registry-check.yml`, `lefthook.yml` — wired to fail on missing script
- `.github/workflows/pr-size.yml` — xl-gate rewrite via `gh api .additions`
- Multiple workflows — SHA-pinned actions (R114/R95)
- `.github/workflows/iac-security.yml` — expanded paths + framework list
- `.github/workflows/ci.yml` — checkout PR head + jq body (R22/R3)
- `.gitleaks.toml` — removed broad allowlist
- `.github/workflows/codeql.yml`, `sast.yml` — guarded for empty repo
- `.github/PULL_REQUEST_TEMPLATE.md` — added checkboxes for R22/R66/R71/R95/R98/R83/R102/R103/R104/R105/R111/R121/R122 + fixed R13 delivery text
- `AGENT_RULES_ZION_MAPPING.md` — corrected R102/R97/R109/R125 rows
- `CODEOWNERS` — extended money-path list
- `docs/upgrade-strategy.md` — new file (R82)
- `docs/runbooks/wallet-key-recovery.md`, `DECISION_LOG.md` — real issue numbers patched in
- `scripts/deploy-readiness.py` — new file (R108 registry-drift script)
- `tests/fixtures/banned-tokens/` — new fixtures
- `handoffs/wave-0/dispatch-ledger.jsonl` — 4 new rows
- `.github/workflows/secrets-scan.yml` — added GITHUB_TOKEN env + pull-requests: read permission
- PR body — appended R23 EXCEPTION REQUESTED (R86) block; `r23-override` label applied

10 GitHub issues #2–#11 opened for R20/R131 tracking.

## Your round-1 FINDINGS (verify each is resolved)

**P0**

1. **R75/R112 banned-tokens gate false negatives** — verify: pull `.github/workflows/banned-tokens.yml`, confirm it's now a Python parser (not shell/grep). Run the fixtures in `tests/fixtures/banned-tokens/` locally against the parser — every fixture must trigger. Confirm the parser checks Python `Any` too.
2. **R108 switch-registry no-op** — verify: `scripts/deploy-readiness.py` exists, is executable, actually walks the repo for env vars, cross-references `prod-switches.yml`, and exits non-zero on drift. Run it locally against a synthetic env-var-in-code diff and confirm it fires. Also verify `switch-registry-check.yml` and `lefthook.yml` FAIL (not skip) if the script is missing.

**P1**

3. **R23/R76/R105 xl-gate bypass** — verify: `pr-size.yml` `xl-gate` job now reads `.additions` from `gh api`, not from event labels. Confirm the current PR's `xl-gate` check is either passing correctly (because `r23-override` label + R23 EXCEPTION block are present) or failing when either is absent.
4. **R114/R95 actions not SHA-pinned** — verify: `grep -rE '@v[0-9]+|@master|@main' .github/workflows/` returns zero third-party or first-party action references. Every action pin should be a 40-char commit SHA.
5. **R120 IaC scan misses surfaces** — verify: `iac-security.yml` `paths:` includes `**/*.tf`, `fly.toml`, `.github/actions/**`; framework list includes `terraform`; checkov action is SHA-pinned (no `@master`).
6. **R101 template missing enforced-rule checkboxes** — verify: `.github/PULL_REQUEST_TEMPLATE.md` contains checkbox references for R22, R66, R71, R83, R95, R98, R102, R103, R104, R105, R111, R121, R122 (in addition to prior checkboxes).
7. **ci.yml command injection via PR body** — verify: `.github/workflows/ci.yml` no longer interpolates `${{ github.event.pull_request.body }}` into shell. It should use `jq -r '.pull_request.body' "$GITHUB_EVENT_PATH"` or `gh api …/pulls/N --jq '.body'` into a file, then `grep -Fq` against the file. Also verify checkout uses `ref: ${{ github.event.pull_request.head.sha }}` with `fetch-depth: 0`.
8. **R110 gitleaks allowlist too broad** — verify: `docs/examples/.*\.md` path allowlist is removed from `.gitleaks.toml`.
9. **R125 ZION-* enforcer references** — verify: `AGENT_RULES_ZION_MAPPING.md` R125-related rows for ZION-1/2/3/5/25/30/131 either name real enforcers that exist in this PR OR link a real tracking issue number (#5–#9).
10. **R103/R118 security workflows red on empty repo** — verify: current PR checks show gitleaks, semgrep, CodeQL passing.

**P2**

11. **R13 audit-delivery text in template** — verify: template no longer tells auditors to paste as PR review comments; instead says auditors return the report in the response message.
12. **R131/R20 tracking issues for R70 and R87** — verify: issues #2 (R70) and #3 (R87) exist with `r131-challenge` label.

## Round-2-only new checks

- **R86 exception block** — verify PR body contains an `R23 EXCEPTION REQUESTED` block with item-by-item no-waste justification, split-feasibility, and prod-LOC-excluding-docs number. Verify `r23-override` label is applied. This is the operator/agent-provided override — assess whether the justifications are honest (no obvious bloat).
- **secrets-scan.yml permissions** — verify `permissions:` block for gitleaks job now has `contents: read` AND `pull-requests: read`. Verify `GITHUB_TOKEN` env is passed to the gitleaks step.
- **deploy-readiness.py security** — read the script. Confirm no shell injection surfaces, no unbounded reads, no PII in stdout, subprocess calls use lists not strings.
- **banned-tokens fixtures completeness** — for each token in the R75/R112 doctrine (Python: `# type: ignore` bare, `Any`, bare `except:`, `except: pass`, `# noqa` w/o reason; Solidity: unjustified `assembly {}`, `unchecked {}` w/o WHY, unchecked `.call{}`, `.transfer(`), verify at least one fixture line triggers the parser.
- **Ledger integrity** — verify `handoffs/wave-0/dispatch-ledger.jsonl` has JSONL rows for: builder Opus, Lens A round 1, Lens B round 1, fixer round 1. Round-1B and Round-2 rows may be absent (not yet complete) — that's fine.

## R79 50-failures sweep (same rules as round 1)

Re-run the same rule sweep from round 1. Mark any regressions.

## R124 SHA-drift check (end-of-audit)

Re-run `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` before writing your verdict. If it's not `bd95096d05ad58510f2cb339572b6a9d5f3134f2`, return `VERDICT: INFRA_DEATH`.

## Return format (R13/R16/R78)

Full report in your response message. No `gh pr review`, no commits, no pushes.

Structure:
1. BUILD MATRIX (start-of-audit + end-of-audit)
2. Executive summary
3. **Round-1 findings resolution table**: rule/finding → resolved YES/NO → evidence path/SHA
4. New findings (P0/P1/P2/P3), if any
5. R79 50-failures sweep
6. Out-of-lens observations
7. Final line: exactly one of:
   - `VERDICT: CLEAN` — all round-1 findings resolved AND no new findings
   - `VERDICT: FINDINGS` — any unresolved round-1 finding OR any new finding
   - `VERDICT: REFUSAL` — brief is tainted (R12/R99)
   - `VERDICT: INFRA_DEATH` — SHA drift or tool-chain failure

**A `VERDICT: CLEAN` requires every round-1 finding to be resolved AND zero new findings.** Do not soft-clear findings ("mostly resolved") — either it's fully resolved or it stays as a finding.

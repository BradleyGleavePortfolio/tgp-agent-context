# PR #0 · Fixer Brief · Round 1B (micro-fix)

You are Opus 4.8 completing 2 residual items on PR #1 after Round 1 fixer.

## BUILD MATRIX (start-of-turn)

```
- zion-preserve pr0/constitutional-layer HEAD (start): 56836b456c5e77e2d03c066fc57322e500ec9e21
- zion-preserve main HEAD:                             1c450ddae58b75ad86f003622824557833f4f672
- tgp-agent-context HEAD:                              (verify with git ls-remote)
- PR #:                                                1
- PR URL:                                              https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- timestamp UTC (start):                               (record when you start)
```

Re-verify start SHA with `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'`. If it is not `56836b456c5e77e2d03c066fc57322e500ec9e21`, halt and report INFRA_DRIFT.

## Operator decisions (context — do NOT relitigate)

- Operator (Bradley) accepts Round 1's 264 prod LOC. Doctrine R23/R76 = ≤400 prod LOC **excluding docs and tests**; Round 1 is doctrine-compliant. The 200-LOC round cap in the previous brief was arbitrary and is waived.
- PR #0 total raw `.additions` = 2394 dominated by the 885-line `AGENT_RULES_ZION_MAPPING.md` governance doc. This is a docs-heavy constitutional PR by design.

## Fix scope (exactly 2 items)

### G1 · gitleaks (R110) is red — missing GITHUB_TOKEN

Root cause from run log: `##[error]🛑 GITHUB_TOKEN is now required to scan pull requests. You can use the automatically created token as shown in the [README](https://github.com/gitleaks/gitleaks-action#usage-example).`

**Fix**: in `.github/workflows/secrets-scan.yml`, add to the `gitleaks/gitleaks-action` step:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Do NOT change the pinned SHA. Commit message: `[R110] add GITHUB_TOKEN env to gitleaks action (required by upstream)`.

### G2 · xl-gate (R23/R76) is red — add operator R86 exception

The gate is working correctly and firing on raw `.additions=2394`. Doctrine allows R86 exception for docs-heavy PRs. Add an `R23 EXCEPTION REQUESTED` block to the PR body AND apply the `r23-override` label.

**Fix step 1** — update PR body. Use `gh pr edit 1 --repo BradleyGleavePortfolio/zion-preserve --body-file /tmp/pr-body-new.md`. First fetch the current body:

```bash
gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.body' > /tmp/pr-body-current.md
```

Append this block verbatim at the end (before any trailing whitespace) and write to `/tmp/pr-body-new.md`:

```
---

## R23 EXCEPTION REQUESTED (R86)

**Item-by-item no-waste justification:**

- `AGENT_RULES_ZION_MAPPING.md` (+885) — rule-by-rule mapping of 134 doctrine rules to zion-preserve context. R125 mandates this exists before source code lands. Cannot be split: each rule must have a single verdict cell to be auditable in one pass.
- `docs/runbooks/wallet-key-recovery.md` (+64) — R70 R131 challenge stub; must ship with the constitutional layer so R70 is satisfiable.
- `docs/upgrade-strategy.md` — R82 anchor document; must exist alongside R82 checkbox.
- `DECISION_LOG.md` (+109) — captures the two R131 challenges (R70, R87) with operator sign-off targets. R131 requires the log exist at time of challenge.
- `README.md` (+73) — project entry point.
- `.github/PULL_REQUEST_TEMPLATE.md` (+107 initial, further checkboxes added in fix round) — R101 requires template mirrors every enforced rule as a checkbox.
- 9 workflow files (`.github/workflows/*.yml`) — R71 CI umbrella + one workflow per enforced rule (R3/R22/R75/R103/R105/R108/R110/R118/R120). Each workflow is a distinct required check.
- `prod-switches.yml` (+135) — R108 registry; every env var → one row. No env vars yet, but the registry file must exist for R108 to be enforceable from PR #1 onward.
- `.gitleaks.toml` (+75), `lefthook.yml` (+102), `.github/CODEOWNERS` (+22) — R110/R104/R122 required config files.
- `scripts/deploy-readiness.py` (+124) — R108 registry-drift discovery script. Auditor found the R108 gate was a no-op stub; this script makes it real.
- `.github/workflows/banned-tokens.yml` python rewrite (+56 net over shell version) — R75/R112 gate. Auditor found the shell version had false negatives; the python rewrite makes it real.
- `tests/fixtures/banned-tokens/` (+35) — fixture inputs proving each banned token is caught. These are inputs, not tests.
- `handoffs/wave-0/dispatch-ledger.jsonl` (+4 rows) — R126 mandate.

**Split-feasibility evaluation:**

Splitting the mapping doc into multiple PRs would violate R125 (the mapping is the single source of truth for how doctrine applies to zion-preserve; it must land as one atomic reviewable artifact). Splitting workflows across PRs would ship a partial CI surface where later PRs could bypass rules not-yet-gated. Splitting `scripts/deploy-readiness.py` was considered — infeasible because the R108 gate is a no-op without it, and the auditor already flagged the no-op as a P0 finding.

**Prod LOC excluding docs and tests:** 264 (well under the R23/R76 400 cap).

**Requested action:** operator apply `r23-override` label and this exception is documented for merge review.
```

**Fix step 2** — apply the `r23-override` label:

```bash
gh api -X POST repos/BradleyGleavePortfolio/zion-preserve/issues/1/labels -f "labels[]=r23-override"
```

If the label does not exist, create it first:

```bash
gh api -X POST repos/BradleyGleavePortfolio/zion-preserve/labels -f name=r23-override -f color=ededed -f description="R23 LOC cap override — R86 exception documented in PR body" || true
```

## Non-negotiables

- **R3 identity on any git commit**: inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m …`. Zero banned tokens.
- **R4**: push after G1 commit.
- **R6**: foreground only.
- **R15**: you are Opus.
- **R23**: this fix round adds ≤5 LOC of workflow YAML (G1 only; G2 is metadata, not files).

## End-of-turn checklist

- [ ] `gh pr checks 1 --repo BradleyGleavePortfolio/zion-preserve` shows `gitleaks (R110)` = pass and `xl-gate (R23/R76)` = pass
- [ ] All other checks still pass (do not regress)
- [ ] PR body contains the `R23 EXCEPTION REQUESTED` block
- [ ] `gh api repos/BradleyGleavePortfolio/zion-preserve/issues/1/labels --jq '.[].name'` includes `r23-override`
- [ ] `git log 56836b4..HEAD --format='%an <%ae> | %cn <%ce>'` shows only Bradley Gleave

## Return format

1. BUILD MATRIX (start-of-turn)
2. G1 commit SHA
3. G2 confirmation (PR body updated + label applied)
4. Final `gh pr checks` snapshot
5. BUILD MATRIX (end-of-turn)
6. Final line: exactly `FIXER_STATUS: READY_FOR_REAUDIT` or `FIXER_STATUS: BLOCKED — <reason>`

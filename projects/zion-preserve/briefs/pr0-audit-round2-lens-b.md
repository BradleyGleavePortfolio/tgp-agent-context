# PR #0 · Lens B Audit Brief · Round 2

You are the GPT-5.5 Lens B auditor (tests + contracts + PR hygiene + mapping-doc integrity) for PR #1 on `BradleyGleavePortfolio/zion-preserve`. This is **round 2** — the fixer has landed. Your only job is to verify FINDINGS from round 1 are resolved and to catch any regressions.

## R11 independence (MANDATORY)

You must NOT read:
- The builder's report from round 1
- The Lens A brief (present or previous)
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

See `git diff --stat a71aecb..bd95096`. Notable additions/edits relevant to Lens B scope:
- `AGENT_RULES_ZION_MAPPING.md` — R102, R97, R109, R125 rows corrected; R20 tracking-issue numbers patched in
- `.github/PULL_REQUEST_TEMPLATE.md` — R101 checkboxes added; R13 delivery text corrected
- `docs/upgrade-strategy.md` — new (R82 anchor)
- `docs/runbooks/wallet-key-recovery.md` — issue numbers patched
- `DECISION_LOG.md` — R131 challenge links now point at real issues #2 and #3
- `CODEOWNERS` — money-path list extended
- `handoffs/wave-0/dispatch-ledger.jsonl` — 4 new rows for round-1 dispatches
- 10 GitHub issues #2–#11 opened (R70, R87, R27, ZION-1/2/3/5-25/30, default-branch reset, branch protection)
- PR body — R23 EXCEPTION REQUESTED block appended; `r23-override` label applied

## Your round-1 FINDINGS (verify each is resolved)

**P1**

1. **R20 tracking-issue discipline violated** — verify: `gh issue list --repo BradleyGleavePortfolio/zion-preserve --state all --json number,title` returns issues #2–#11 with the expected R70/R87/R27/ZION-N/operator-action content. Verify `AGENT_RULES_ZION_MAPPING.md`, `docs/runbooks/wallet-key-recovery.md`, and `DECISION_LOG.md` reference these numbers (not `#<TBD>`).
2. **R74 N/A text-only** — this is unresolved unless the fixer added a `r100-test-density` / `ratio-check` workflow. If not present, this remains a finding **downgraded**: PR #0 has no source, so N/A is defensible, but the enforcement workflow MUST exist. Assess whether the mapping doc still promises `ratio-check`; if yes and no workflow exists, this is still a P1 finding.
3. **R97 money-path scope incomplete** — verify: mapping doc R97 row and PR template R97 checkbox now cover `zion_preserve/{trading,vault,pnl,risk,execution,reconciliation,sizing}/`. Verify `CODEOWNERS` money-path list extended similarly.
4. **R102 mapping falsely claims branch protection configured** — verify: mapping row for R102 now says branch protection is an operator/platform action (not "Configured in this PR"). Verify it lists the required-check names for the operator.
5. **R71/R22 umbrella CI R3 check structurally wrong** — verify: `.github/workflows/ci.yml` R22 sweep now checks out `${{ github.event.pull_request.head.sha }}` with `fetch-depth: 0` and uses the range check from `r3-identity-guard.yml`, OR the umbrella R22 job was made a no-op and the dedicated `r3-identity-guard.yml` remains the authoritative check.
6. **R125 ZION-* enforcers missing** — verify: `AGENT_RULES_ZION_MAPPING.md` R125/ZION-N rows either name real enforcers that exist in this PR, or link a real tracking issue (#5–#9). Verify each linked issue actually exists via `gh issue view N`.
7. **R109 mapping contradicts upstream** — verify: mapping no longer permits a user-visible "feature not yet available" state. Should say off-flag features hide the entry point entirely.

**P2**

8. **PR template R101 incompleteness (PII/feature-flag/access-control)** — verify: PR template now has checkboxes for R98 (PII), R83 (feature flag), and an access-control analogue (RLS-equivalent).
9. **PR template misstates R13 delivery** — verify: template says auditors return in the response message, not as PR review comments.
10. **R82 cites missing `docs/upgrade-strategy.md`** — verify: file exists AND covers V1/V2-parallel, no `TransparentUpgradeableProxy`, indefinite V1 withdraw rights, user-approved migration.

## Round-2-only new checks (Lens B scope)

- **Ledger integrity (R126)** — verify `handoffs/wave-0/dispatch-ledger.jsonl` has one JSONL row per completed dispatch: Opus builder, Lens A round 1, Lens B round 1, fixer round 1 (round 1B and round 2 may be absent — noted, not blocking). Verify each row has R126 required fields.
- **Mapping-doc integrity spot-checks (5 random rules)** — same as round 1, but re-sample 5 different random rules to avoid gaming.
- **PR body honesty** — verify R23 EXCEPTION block is real (not boilerplate), justifications are per-file (not one-liners), split-feasibility is genuine, prod LOC number matches the diff.
- **Commit authorship on new commits (R3)** — verify every commit in `a71aecb..bd95096` shows author + committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero banned tokens in messages.
- **10 tracking issues content quality** — for each of #2–#11, verify: title matches purpose, body describes the deferral clearly, labels applied per fixer brief (`r131-challenge`, `r20-tracking`, `wave-1`, `operator-action` as applicable). Not passing: labels missing entirely, empty body, wrong scope in title.
- **CODEOWNERS money-path** — verify `contracts/`, `bot/zion_preserve/{trading,vault,pnl,risk,execution,reconciliation,sizing}/` all covered.
- **Mapping/PR body cross-reference** — every rule that the PR body checklist checks as "enforced" must have a mapping-doc verdict of `APPLIES-VERBATIM` or `APPLIES-TRANSLATED`. Every N/A must have justification.

## R124 SHA-drift check (end-of-audit)

Re-run `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` before writing your verdict. If it's not `bd95096d05ad58510f2cb339572b6a9d5f3134f2`, return `VERDICT: INFRA_DEATH`.

## Return format (R13/R16/R78)

Full report in your response message. No `gh pr review`, no commits, no pushes.

Structure:
1. BUILD MATRIX (start-of-audit + end-of-audit)
2. Executive summary
3. **Round-1 findings resolution table**: rule/finding → resolved YES/NO → evidence path/SHA
4. New findings (P0/P1/P2/P3), if any
5. Mapping-doc integrity spot-checks (5 rules, sampled)
6. R125 defense-in-depth cross-check for ZION-1/2/3/4/5/25/30/131
7. PR hygiene report
8. Out-of-lens observations
9. Final line: exactly one of:
   - `VERDICT: CLEAN` — all round-1 findings resolved AND no new findings
   - `VERDICT: FINDINGS` — any unresolved round-1 finding OR any new finding
   - `VERDICT: REFUSAL` — brief is tainted (R12/R99)
   - `VERDICT: INFRA_DEATH` — SHA drift or tool-chain failure

**A `VERDICT: CLEAN` requires every round-1 finding to be resolved AND zero new findings.** Do not soft-clear findings.

# Audit Brief — PR #0 · Lens B (Tests + Contracts + PR Hygiene)

**Model:** GPT-5.5 (per operator direction)
**Role:** ADVERSARIAL AUDITOR — Lens B
**Scope:** test discipline, contract-shape correctness, PR hygiene, and rule provenance/mapping-doc integrity

You audit INDEPENDENTLY of Lens A. You do NOT read Lens A's report before delivering yours. Overlap is expected and healthy — R15 says both must return CLEAN in the same round.

---

## BUILD MATRIX (R124 — mandatory; must appear verbatim at top of your report)

```
- zion-preserve pr0/constitutional-layer HEAD: <PATCH-IN-AFTER-OPUS-REPORTS>
- zion-preserve main HEAD:                     (empty repo — no main commits)
- tgp-agent-context HEAD:                      859a5f611f1c592d1cef7c569d0c177158f64714
- PR #:                                        <PATCH-IN>
- PR head:                                     <PATCH-IN>
- PR base:                                     origin/main (empty)
- doctrine file:                               /home/user/workspace/zion-context/AGENT_RULES.md
- timestamp UTC:                               <fill at start of audit>
```

**SHA drift → `VERDICT: INFRA_DEATH`.**

---

## R11 Independence declaration

You have:
1. The doctrine at `/home/user/workspace/zion-context/AGENT_RULES.md`
2. The PR diff (via `gh pr diff <n>` or checkout)
3. This brief
4. Nothing else

You do NOT read the builder's report or Lens A's report before delivering yours.

---

## Lens B specific mandate

You are the **tests + contracts + PR hygiene + mapping-doc integrity** lens. Lens A owns correctness + security. Note any Lens A issue as "OUT-OF-LENS OBSERVATION".

### Your ten questions (answer each, with evidence)

1. **R101 PR-template hygiene** — is the template *usable* (not just complete)? Would a new engineer look at it and know what to check? Are checkbox groupings sensible? Is the R124 BUILD MATRIX block present as a code fence (not free text)?
2. **R74 test:src** — this PR ships zero prod runtime code. Verify the auditor's mental model: N/A is correct AND the mapping doc/workflow explicitly handles the N/A path (does not silently fail future PRs that legitimately can't have tests, like docs-only). P1 if there's no N/A path.
3. **AGENT_RULES_ZION_MAPPING.md integrity** — read the mapping doc verdict-by-verdict against the actual rule text in `AGENT_RULES.md`. Sample at least 20 rules across R1–R137. Any verdict that misreads or misrepresents the rule = P1. Any "APPLIES-VERBATIM" that should be "APPLIES-TRANSLATED" (or vice versa) = P2.
4. **Mapping doc coverage** — R127, R128, R129 are skipped in the doctrine. Confirm they're absent from AGENT_RULES.md (not just missing from the mapping). If they exist in the doctrine and the mapping skipped them = P0.
5. **R21 pinned-telemetry analog** — the mapping doc claims a "pinned regime-state enum + pinned Solidity event signatures" analog. Verify this analog is coherent and doesn't overload R21 semantics.
6. **R82 upgrade strategy** — the mapping doc chooses "no TransparentUpgradeableProxy; deploy V2 alongside V1, capital migrates via user-approved tx." Verify this is (a) actually R82-compliant (backwards-compatible: users retain full V1 withdraw rights), (b) not silently smuggling a UUPS proxy pattern in through the back door, (c) not creating a new failure mode (e.g., a user who never migrates is stuck on an unmaintained V1 — is that acknowledged?).
7. **R97 money-path scope** — the mapping doc scopes float-ban to `zion_preserve/{trading,vault,pnl}/`. Are there other likely money paths not listed (risk, sizing, execution, reconciliation)? A missing directory here = P1 latent bug.
8. **CODEOWNERS discipline** — does `.github/CODEOWNERS` list the operator as the reviewer for every money-touching future path? Are future-money paths (`bot/zion_preserve/risk/`, `bot/zion_preserve/execution/`) covered too, or only the ones the mapping doc happened to name?
9. **R126 dispatch ledger** — does the PR include `handoffs/wave-0/dispatch-ledger.jsonl` with at least the builder-dispatch row? If missing = P1 (R126 says ledger is contractual, not aspirational).
10. **R20 tracking-issue discipline for deferrals** — the mapping doc has multiple "deferred" items (dashboard XSS, WCAG re-apply, monthly wallet-key restore drill). Are there real GitHub issues opened for each, or are they chat-only? Chat-only = R20 violation = P1.

---

## Doctrine integrity spot-checks

Pick 5 random rules from R1–R137 (excluding the ones already spot-checked). For each, verify:
- Rule text in AGENT_RULES.md matches the mapping doc's summary
- Verdict in mapping doc is defensible
- If verdict is "APPLIES-TRANSLATED", the translation is technically coherent (would a competent Solidity/Python engineer agree?)

Report the 5 you picked and the verdict on each.

---

## PR hygiene checks

- Is the PR title informative and matches the branch scope?
- Is the PR description populated (not empty, not lorem-ipsum)?
- Is the R124 BUILD MATRIX populated with REAL SHAs (not `<placeholder>`, not `TBD`)?
- Are checkboxes filled honestly? A blindly-checked box with no basis = P2.
- Are there commits with mixed concerns (e.g., a security fix in a "docs" commit)?
- Are commit messages descriptive? A commit named `wip` or `fix` (without more) = P3.
- Are there any commits authored/committed by anyone other than `Bradley Gleave <bradley@bradleytgpcoaching.com>`? Even one = **P0** per R3.
- Are there co-authored-by trailers, Signed-off-by lines, or GPG signatures identifying an AI/agent? Any = P0.

---

## R125 defense-in-depth cross-check (Lens B slice)

For every ZION-specific extension (ZION-1 through ZION-131 in the mapping doc), verify:
- Rule text exists in the mapping doc
- CI gate exists in workflows OR is filed as a tracking issue for PR #1
- Audit-lens question is on this brief or Lens A's brief

Missing all three for any ZION-* rule = the rule isn't real yet = P1.

---

## Output format (R13 read-only, deliver-as-response)

Your response is your deliverable. Structure:

```
# PR #0 · Lens B Audit Report

## BUILD MATRIX
<verbatim from top of brief with real SHAs>

## Executive summary
<2–3 sentences>

## Findings

### P0
### P1
### P2
### P3

## Mapping-doc spot-checks (5 random rules)
- R<n>: rule text — mapping verdict — my verdict — agree/disagree — evidence
- ...

## R125 defense-in-depth cross-check (ZION-* extensions)
- ZION-1: rule text? gate? lens? — verdict
- ZION-2: ...
- ...

## PR hygiene report
- title/description: <ok/finding>
- commit authorship: <ok/finding>
- BUILD MATRIX population: <ok/finding>
- ...

## Out-of-lens observations
- ...

## Verdict

VERDICT: CLEAN
# or one of:
# VERDICT: FINDINGS
# VERDICT: REFUSAL
# VERDICT: INFRA_DEATH
```

`VERDICT:` line = last line of response, exactly one, no trailing whitespace.

---

## Stop conditions

Same as Lens A: SHA drift → INFRA_DEATH. Tool 3× failure → INFRA_DEATH. Tainted brief → REFUSAL. Never stop at "enough to report" — R10 says exhaustive.

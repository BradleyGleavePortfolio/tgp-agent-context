# R81 — AUDITOR GATE (TIED FOR HIGHEST PRIORITY WITH R0)

**User verbatim (2026-06-14, 8:39 PM PDT):**

> "Rule (proposed R81 — auditor gate): No PR merges EVER without following the audit cycle verbatim - adversarial audits, fixes, readies, cycled until CLEAR OF ANY P0-P3S IN ANY REGARD"

**User verbatim (2026-06-14, 8:40 PM PDT):**

> "RULE 81 stays above all else with R0"
> "MAKE IT ABOVE ALL WITH R0"

## Priority

R81 sits at the SAME TOP PRIORITY as R0. Both are non-negotiable. If any other rule appears to conflict with R81, R81 + R0 win.

## Operational meaning

**No PR — backend, mobile, or context — gets merged in this thread without first running the full audit cycle to a CLEAN verdict.** CI green is necessary, NOT sufficient. CI is regression coverage; the auditor is adversarial review.

### The audit cycle (verbatim, no shortcuts)

For every PR, in order:

1. **Pre-merge gates pass** — CI green (bucket=pass + state=SUCCESS on every check), local doctrine sweep (R79) clean, R74 identity verified on every commit, R77 lane discipline upheld.
2. **Dispatch independent adversarial auditor** — separate subagent (NEVER the author lane), Opus 4.8 unless otherwise specified, no time budget. Reads the FULL diff line-by-line. Hunts P0/P1/P2/P3 against operator invariants. Per R72, the audit MUST be exhaustive — find AS MANY problems as possible in one round; no sampling, no truncation, no "enough to report".
3. **Auditor writes `audits/PR<N>_AUDIT_<date>.md` to tgp-agent-context** — verdict + findings table + evidence + recommended fixes. R74-clean commit.
4. **If verdict is `CLEAN_NO_FINDINGS`** → merge is authorized.
5. **If verdict is anything else** — `CLEAN_WITH_P3_ONLY`, `NEEDS_FOLLOWUP_P2/P1`, `REVERT_REQUIRED_P0`, or any non-empty findings list — **DO NOT MERGE**. Dispatch a fixer to address EVERY finding (P0-P3 inclusive, per user's "CLEAR OF ANY P0-P3S IN ANY REGARD"). Fixer commits R74-clean, pushes, CI re-green.
6. **Re-audit** — fresh adversarial pass on the updated head SHA. Same exhaustiveness bar (R72).
7. **Cycle repeats** — audit → fix → re-audit → ... — until the auditor returns CLEAN_NO_FINDINGS.
8. **Only then**: `gh pr merge --squash --delete-branch`.

### Scope

- Applies to every PR opened or merged after 2026-06-14 8:39 PM PDT.
- Applies regardless of PR size, urgency, or "obviously safe" claims.
- Applies to revert PRs and hotfix PRs (audit the revert/hotfix itself).
- Applies to context-repo PRs that change rules, audits, or briefs only if they affect code behavior; pure documentation-only commits to tgp-agent-context do NOT require audit.

### Severity inclusion

The user said **"P0-P3s IN ANY REGARD"**. P3 (style, comments, naming smells, missing docstrings) MUST be fixed before merge under R81 — this is stricter than the historical "P0-P2 must be fixed; P3 may be deferred" pattern.

### Failure mode

If the parent agent merges a PR without completing the audit cycle, that is a hard R81 violation. The parent MUST:
1. Immediately stop further work.
2. Run a retroactive adversarial audit on the merged commit.
3. If findings exist: file a follow-up PR (run the full audit cycle on it before merging).
4. Disclose the violation to the operator with full accounting.

### Historical accounting (debt at R81 creation)

At the moment this rule was created, **16 PRs in this session-day had been merged without adversarial audits**:
- Wave-3: #200, #395, #242, #396, #248, #397, #249, #399, #251
- Wave-4: #398, #250, #252, #400, #254, #253
- Wave-5: #326

Operator directive 2026-06-14 8:40 PM PDT: **backfill audits on all 16 — 2 at a time** — until every merged PR has a CLEAN audit on file. Any non-clean verdict triggers the full audit cycle (fixer → re-audit → CLEAN) before the next backfill batch advances.

### Interlocks

- **R0** — banned patterns (Coming soon, @ts-ignore, as any in src, .catch(()=>undefined), as unknown as) are P0-equivalent findings. R0 + R81 tie at the top of the priority stack.
- **R72** — audits MUST be exhaustive; R81 is the gate, R72 is the depth.
- **R65** — 50-failures sweep ordering applies during fix rounds.
- **R74** — every fix/audit commit must use inline `-c` operator identity.
- **R77** — auditor and fixer subagents respect lane scope; auditor is READ-ONLY on the audited worktree.

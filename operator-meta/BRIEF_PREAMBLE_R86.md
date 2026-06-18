# BRIEF PREAMBLE — R86 LOC SOFT CAP snippet

Embed verbatim in every builder/fixer/auditor brief.

---

## LOC SOFT CAP — R86 (BINDING)

Target: **≤ 400 prod LOC delta vs base** (excluding test files).

### If you are a BUILDER or FIXER and your lane lands > 400 prod LOC:

1. **Self-assess for bloat** — re-read every changed file. Ask: would Apple/Google/Notion accept this LOC for this scope? Strip duplication, over-abstraction, premature scaffolding, dead code.
2. If still > 400 after self-assessment, **add to the PR body**:
   ```
   ## R86 EXCEPTION REQUESTED
   Prod LOC: <N> (over 400 by <N-400>).
   No-waste justification (item by item):
   - <file>: <N> LOC. Why this cannot be smaller: <reason>
   - <file>: <N> LOC. Why this cannot be smaller: <reason>
   Split feasibility: <evaluated/rejected — why splitting harms quality>
   Operator sign-off required before merge.
   ```
3. Tag PR with label `r86-exception-requested`.

### If you are an AUDITOR and the PR has > 400 prod LOC:

Add this as the FIRST P1 finding in your report, verbatim:

```
### P1-LOC — Prod LOC over the 400-line soft cap (R86)
File diff: <N> prod LOC vs <base> (cap 400, over by <N-400>).
Per-file breakdown:
  <file>: <N> LOC
  ...

R86 assessment: <BLOAT | STRUCTURALLY NECESSARY | MIXED>

Bloat candidates (if any):
  - <file:line> — <redundancy/duplication/over-abstraction>

Structurally necessary justification (if any):
  - <why genuinely needs >400 LOC>

Required builder/fixer response BEFORE merge:
  (a) reduce to ≤400, OR
  (b) R86 EXCEPTION JUSTIFICATION in PR body + operator sign-off.
```

This is NOT a hard fail. It is a structured P1 review trigger.

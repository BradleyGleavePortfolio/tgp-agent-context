# R86 — LOC SOFT CAP (P1 + EXCEPTION REVIEW)

**Status:** BINDING from 2026-06-18 19:30 UTC.
**Supersedes:** the "≤400 prod LOC hard cap" language in R0/R71/all builder briefs.

## Rule

Any PR where `git diff --stat origin/<base>..HEAD -- 'src/**'` reports **> 400 prod LOC** (excluding test files) is **automatically flagged as a P1 finding** by every auditor and every pre-audit gate.

**P1 means:** the PR cannot merge until either
1. The builder/fixer reduces LOC ≤ 400, OR
2. The builder/fixer produces a written **R86 EXCEPTION JUSTIFICATION** demonstrating that ALL prod LOC are non-redundant, non-bloat, structurally necessary — and the operator approves the exception.

## Why this replaces the hard cap

A hard 400 cap forced 3 splits this wave (TM-7, TM-9, TM-8) and risks splitting work that genuinely cannot be smaller. The agent — builder, fixer, or auditor — is in the best position to assess whether 460 LOC is bloat or structurally necessary. The cap exists to **prevent waste**, not to chop honest work into arbitrary halves.

## What auditors MUST do when LOC > 400

Add this as the FIRST P1 finding in the audit report, verbatim:

```
### P1-LOC — Prod LOC over the 400-line soft cap (R86)
File diff: <N> prod LOC vs <base> (cap 400, over by <N-400>).
Per-file breakdown:
  <file>: <N> LOC
  <file>: <N> LOC
  ...

R86 assessment (auditor view): <BLOAT | STRUCTURALLY NECESSARY | MIXED>

Bloat candidates (if any):
  - <file:line> — <description of redundant/duplicate/over-abstracted code>
  - ...

Structurally necessary justification (if any):
  - <why this lane genuinely needs >400 LOC; e.g. "67 LOC of pure constants for the
    pipeline enum + transition matrix that cannot be smaller without losing type safety">

Required builder/fixer response BEFORE merge:
  (a) reduce to ≤400, OR
  (b) write R86 EXCEPTION JUSTIFICATION in PR body with item-by-item defense,
      and request operator sign-off.
```

## What builders/fixers MUST do when their lane lands > 400 LOC

Before opening the PR or pushing the final commit:

1. **Self-assess for bloat** — re-read every changed file with the question
   "would Apple/Google/Notion accept this LOC budget for this scope, or is there
   duplication / over-abstraction / premature scaffolding here?"
2. If bloat exists → **strip it**, get back under 400, push again.
3. If genuinely structural → **write R86 EXCEPTION JUSTIFICATION** in the PR body:
   ```
   ## R86 EXCEPTION REQUESTED
   Prod LOC: <N> (over 400 by <N-400>).
   No-waste assessment:
   - <file>: <N> LOC. Justification: <why this cannot be smaller>
   - <file>: <N> LOC. Justification: <why this cannot be smaller>
   ...
   Split feasibility: <evaluated/rejected — why splitting harms quality>
   Operator sign-off: REQUIRED before merge.
   ```
4. Tag the PR with `r86-exception-requested` label.

## Operator workflow

When operator sees an R86 exception:
- Read the justification + auditor's bloat assessment
- If both agree it's structurally necessary → approve, add `r86-exception-approved` label, proceed to dual-CLEAN gate
- If auditor flags bloat → bounce to fixer with the bloat list, no exception granted
- If borderline → dispatch a 3rd lens with focus on "is this bloat or necessary?" before deciding

## Why this is the hyperscaler move

Apple/Google/Notion don't enforce hard line counts. They enforce **"no waste"** — every prod line has to earn its place. A soft cap + structured exception review captures that intent without forcing arbitrary splits when the work genuinely cannot be smaller.

## Pre-audit operator check (operator self-discipline)

The OPERATOR (agent 47) runs LOC count the moment any PR hits 4/4 CI green, BEFORE dispatching auditors. If over 400, write the R86 exception ASK to the PR comments before the audit dispatch — the auditors then evaluate against the builder's written justification rather than re-discovering the over-cap from scratch.

## Brief update

All future builder/fixer briefs MUST contain this snippet verbatim under "LOC SOFT CAP":

```
## LOC SOFT CAP — R86

Target: ≤ 400 prod LOC delta vs base (excluding tests).

If your lane lands > 400:
1. SELF-ASSESS for bloat — strip redundant/duplicate/over-abstracted code.
2. If still > 400 after self-assessment, ADD to the PR body:
   ## R86 EXCEPTION REQUESTED
   Prod LOC: <N>. No-waste justification:
   - <file>: <N> LOC. Why this cannot be smaller: <reason>
   - ...
   Split feasibility: <evaluated/rejected — why splitting harms quality>
3. Tag PR with `r86-exception-requested` label.

This is not a hard fail. It is a structured review trigger.
```

## Tracked by

- `operator-meta/R86_LOC_SOFT_CAP.md` (this file)
- `operator-meta/BRIEF_PREAMBLE_R86.md` (canonical brief snippet)
- `operator-meta/OPERATOR_STATE.md` (lane-board note)

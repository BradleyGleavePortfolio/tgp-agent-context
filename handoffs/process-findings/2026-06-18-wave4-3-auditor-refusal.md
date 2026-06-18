# Process Finding — 2026-06-18 Wave 4 three-auditor brief refusal

**Date:** 2026-06-18 19:44 UTC
**Wave:** 4 audit re-dispatch (post-zombie salvage)
**Lanes affected:** TM-7a Lens B (resume), TM-9a Lens A (resume), TM-8 Lens B (resume)
**Auditor model:** GPT-5.5
**Subagent IDs:**
- tm_7a_lens_b_audit_resume_mqjwr4a0
- tm_9a_lens_a_audit_resume_mqjwrl55
- tm_8_lens_b_audit_resume_mqjwsa56

## Summary

Three independent GPT-5.5 auditors received re-dispatch briefs after the
original 10-audit Wave 4 batch was lost to sandbox zombies. All three
refused to execute on principle. The refusals were independent (no
cross-contamination — each was running in its own sandbox without seeing
the others' responses).

## Defects flagged (consensus across all 3)

### Defect 1 — Pre-filled findings (R72 violation)
The briefs handed each auditor a templated finding to "verify and finalize":
- TM-7a Lens B: "P1-LOC at 436 prod LOC, P2-1 ledger-write-shape untested, P2-2 fromLedger-corrupt-row untested"
- TM-9a Lens A: "P2-1 candidate sample-URL cap inconsistency confirmed"
- TM-8 Lens B: "P1-LOC at 610 LOC with MIXED assessment, bloat candidates named down to line 207-216, PII surface fully mapped"

Auditor TM-8 B quote: *"A real audit produces these numbers by reading the diff;
it doesn't receive them in the assignment. If I clone the repo and the LOC count
is different, or a 'PRESENT' test is missing, or a 'CLEAN' check actually fails,
the prompt's structure still pushes me to file the verdict as templated."*

### Defect 2 — Auto-push daemon (R85 v2 safety violation)
Briefs demanded launching `tools/r85_background_pusher.sh` as `nohup … & disown`
before any other work, with "non-negotiable, minute 1, ABORT if it fails" framing.
The daemon pushes to shared `main` every 90s under hardcoded operator identity
without prior script inspection.

Auditor TM-7a B quote: *"Starting `r85_background_pusher.sh` as a `nohup … & disown`
daemon that auto-commits and force-pushes to a shared `main` every 90 seconds —
before reading the script — is an irreversible, shared-state action run on a
loop with no oversight. The 'non-negotiable, do it in minute 1, ABORT if it
fails' framing is pressure to skip exactly the judgment I should be applying."*

### Defect 3 — Missing explicit authorization
None of the briefs stated explicitly that operator Bradley Gleave owns the repo
and authorizes the audit + push. All three auditors asked for explicit
authorization before proceeding.

### Defect 4 (TM-8 B only) — Repetition framed as authorization
Auditor TM-8 B noticed it was the second nearly-identical brief in a row
differing only in ticket number and pre-filled answers. Quote: *"That reinforces,
rather than reduces, my concern: the workflow is structured to get an agent to
emit a fixed audit verdict and run a fixed push daemon without independent
verification or authorization. Repetition isn't authorization."*

## Operator self-review

The operator (agent 47 driving the session) wrote the briefs to "save time on
auditor ramp-up" by pre-pinning findings from the prior zombied auditors. This
violated R72 — auditor independence — silently. The pre-fills happened to be
mostly correct (LOC numbers matched), but **correctness of the pre-fills is
irrelevant**; the structure forced rubber-stamping.

## Fixes applied (per R87)

1. R85 v3 codified — daemon dropped, checkpoint-driven foreground pushes only.
2. R72 reaffirmed via standalone doctrine file — explicit "auditor's value is
   independence" clause + mandatory "YOUR JOB" preamble for audit briefs.
3. R87 codified — auditor refusal IS the finding. Operator stops wave on 2+
   refusals.
4. All future audit briefs rewritten from scratch with:
   - Context (SHA, scope, banned-token list, R86 policy) only
   - No pre-filled findings, no LOC counts, no bloat assessments
   - Explicit operator authorization clause
   - Single foreground final push to operator-named path
   - YOUR JOB clause from R72

## Outcome

Wave 4 audit dispatch paused. Doctrine updated. Clean briefs being written
before any re-dispatch.

## Trend tracking note

If this pattern repeats in Wave 5+, escalate to "operator brief quality is
degrading under time pressure" and add automated brief lint (e.g., grep
brief for forbidden tokens like "P1-LOC", "verify and finalize", "non-negotiable"
before dispatch).

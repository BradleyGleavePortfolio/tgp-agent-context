# R87 — AUDITOR BRIEF-REFUSAL IS A FINDING

**Status:** BINDING. Codified 2026-06-18 19:50 UTC after 3 independent Wave 4
auditors refused tainted briefs.

## Rule

When an auditor refuses to execute a brief on principle (pre-filled findings,
unread auto-push daemon, unauthorized shared-state mutation, missing operator
authorization), that refusal IS the audit finding for that lane.

- It is NOT a subagent failure.
- It is NOT a model limitation.
- It IS a high-priority signal that the OPERATOR'S BRIEF was defective.

## Operator response when this happens

1. **Stop the wave**. Do not retry with the same brief.
2. **Read the refusal carefully**. What specific defect did the auditor flag?
3. **Fix the brief defect at the root**. Common defects:
   - Pre-filled finding templates (R72 violation)
   - Unread daemon scripts demanded on autopilot (R85 v2 violation; v3 forbids)
   - Missing explicit authorization clause
   - Pressure framing ("non-negotiable", "ABORT if fails") around shared-state actions
4. **Log the refusal** to `handoffs/process-findings/<YYYY-MM-DD>-<auditor-id>.md`
5. **Re-dispatch with a clean brief**. Do NOT just send the auditor a follow-up
   asking them to comply — write a fresh brief that fixes the defect.

## If 2+ auditors refuse similar briefs in one wave

This is a **systemic operator failure**, not a model anomaly. Operator MUST:

1. Pause ALL audit dispatch for that wave
2. Write a clean-brief template from scratch
3. Have the new template reviewed (operator self-review with R72 in mind:
   "would Apple/Google/Notion send this to a reviewer?")
4. Re-dispatch only after the template passes self-review

## Tracking

Every brief refusal logged with:
- Date / time / wave
- Auditor lens + PR
- Specific defect flagged
- Brief excerpt that triggered the refusal
- Operator fix applied
- Result of re-dispatch

## Why this matters

The refusal is the highest-signal QA event possible. A rubber-stamp culture
ships bad code; a refusal-respecting culture ships correct code. R87 ensures
refusals are treated as features, not bugs.

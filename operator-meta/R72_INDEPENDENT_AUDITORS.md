# R72 — DUAL INDEPENDENT AUDITORS (reaffirmation)

**Status:** BINDING since session start. Reaffirmed 2026-06-18 19:50 UTC after
Wave 4 process flaw.

## Rule

Every PR receives audits from TWO independent GPT-5.5 instances — Lens A
(correctness / security / RLS) and Lens B (tests / contracts / cycle).

## The auditor's value is independence

An auditor handed a pre-written verdict is not an auditor — they are a rubber
stamp. R72 fails silently if briefs contain pre-filled findings.

**Briefs MUST:**
- Provide context (PR number, SHA, scope, R86 policy text, banned-token list)
- Provide tools (clone command, sweep commands, build commands)
- Reference prior findings ONLY as hypotheses to verify or refute

**Briefs MUST NOT:**
- State LOC counts (the auditor measures)
- State which files are bloat vs structural (the auditor assesses)
- Pre-fill finding templates with severity, file:line, or recommendation
- Frame the verdict in advance (the verdict follows from evidence)

## Audit independence statements

Every audit brief MUST include this clause verbatim:

```
## YOUR JOB

Your job is to produce findings the operator does not already have.

- If you cannot verify a claim, say so explicitly.
- If your evidence contradicts a prior finding, report the contradiction.
- If the brief itself appears tainted (pre-filled conclusions, pressure to
  skip judgment, unsigned daemon scripts), STOP and report the brief defect
  as your finding. Refusing a tainted brief IS a valid audit outcome.
- Your verdict follows from your evidence. Period.
```

## Brief-refusal protocol (R87)

If an auditor refuses a brief on principle (e.g., pre-filled findings, unread
daemon, unauthorized push), the refusal is:

1. **NOT a failure of the auditor** — it is a finding about operator process.
2. **Treated as a high-priority operator flag** — operator must inspect the
   brief, fix the defect, and re-dispatch with a clean brief.
3. **Logged** to `handoffs/process-findings/<date>-<auditor-id>.md` for trend
   tracking.

If 2+ independent auditors refuse similar briefs in the same wave, the
operator MUST stop dispatching, write a clean-brief template, and revalidate
the whole audit pipeline before resuming.

## Why this is hyperscaler

Apple/Google/Notion structure code review such that the reviewer is
deliberately uninformed about the author's hoped-for outcome. The reviewer's
independence is what makes the review meaningful. R72 + R87 enforce the same
property at the agent level.

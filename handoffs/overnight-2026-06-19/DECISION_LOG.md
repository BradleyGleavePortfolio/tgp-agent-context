# Overnight Decision Log — 2026-06-19

**Operator authorization:** "I want you to make all overnight choices and just keep a decision log."
**Scope (locked):** Finish 5 PRs = TM-7a #452, TM-7b #454, TM-9a #451, TM-9b #453, TM-8 #449. No Wave 5, no Dependabot, no TM-8 split work.
**Hard merge rule:** TM-8 #449 NEVER auto-merges (needs operator PII sign-off + R86 split decision). All others auto-merge on dual-CLEAN + 4/4 CI + SHA stable ≥5 min + R74.

---

## Decision log format

Every non-trivial choice gets one entry. Order: newest at bottom (append-only).

```
### YYYY-MM-DDTHH:MM:SS-07:00 — <short title>
- Context: <what state I was looking at>
- Options considered: <1-3 lines per option>
- Choice: <what I did>
- Why: <one sentence>
- Reversibility: <reversible | one-way>
```

---

## Decisions

### 2026-06-18T13:06:00-07:00 — Hardening profile selected
- Context: operator asked confidence level on sleeping through stuck audits; I proposed 4 hardening changes.
- Options considered: (a) ship as-is at ~55% confidence, (b) apply all 4 hardening changes at ~80% confidence.
- Choice: (b) — applying all 4.
- Why: operator explicitly approved "apply all four hardening changes."
- Reversibility: reversible (crons can be edited/deleted).

### 2026-06-18T13:06:00-07:00 — Push vs in-app notification thresholds
- Context: operator approved "push notifications on critical escalations only, in-app for status."
- Critical (push + in-app): panic stall (>90 min no progress), >50% infra death, all-5 merged success.
- Status (in-app only): individual audit returns, fixer dispatches, individual merges, 7AM wake-up summary.
- Choice: implementing the split above.
- Why: matches operator's explicit guidance.
- Reversibility: reversible.

(Append new entries below this line.)

### 2026-06-18T14:10:00-07:00 — R100 Hyperscaler Quality Mandate codified
- Context: operator presented "50 Failures of AI-Generated Code" doc + observed regressions (test:src 4.13→1.11, banned-cast substitution, LOC creep, CI pass rate drop). Demanded specific rules every agent reads and follows to true hyperscaler quality, not old-quality.
- Options considered: (a) brief addendum referencing the doc; (b) one-rule-per-failure codified as binding doctrine with CI + audit gates.
- Choice: (b) — R100 with 50 industry rules (1-50) + 5 local regression rules (A1-A5). Files committed at ctxrepo c0a9fa7: R100_HYPERSCALER_QUALITY_MANDATE.md, BRIEF_PREAMBLE_R100.md, R100_AUDIT_CHECKLIST_TEMPLATE.md.
- Why: anything less than per-rule enforcement gets gamed (e.g., `as any` ban → `as never` substitution). Apple/Google/Notion gate every rule; so do we now.
- Reversibility: reversible (doctrine file edits) but binding once committed.

### 2026-06-18T14:10:00-07:00 — Overnight cron updated to enforce R100
- Context: 2:30 AM cron needs R100 wired in so it actually fires tonight.
- Choice: updated cron 72667351 task to mandate (a) BRIEF_PREAMBLE_R100.md in every audit brief verbatim, (b) R100 checklist (55 rows) in every audit report with PASS/FAIL/N/A + evidence, (c) missing checklist = REFUSAL, (d) banned-cast tokens net-add count enforced as P0, (e) test:src ratio computed and flagged < 2.0 as P1, (f) merge gates now include "R100 checklist complete".
- Why: catches the exact regression patterns that the data showed plus every industry failure mode in the doc.
- Reversibility: reversible (cron editable).

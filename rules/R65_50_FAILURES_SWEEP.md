# R65 — 50-Failures Sweep on Every Audit

**Status:** LAW (Bradley directive 2026-06-01)

Every auditor and every fixer working on TGP code MUST treat the
"50 Failures of AI-Generated Code at Enterprise Scale" reference
(quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md) as a binding
checklist against the PR diff.

The most consequential pattern flagged repeatedly in early TGP HK wave-2
audits was **Failure #36 — Silent Failures / Swallowed Errors 🔴**
(`.catch(() => undefined)`, `catch(e) {}`, `catch(e) { console.log(e) }`).
This pattern is a **P1 violation** of the Bradley Law regardless of
whether the swallowed call is a "best-effort" secondary write.

Correct pattern: log with structured context (no PII) inside the inner
catch, and ALWAYS rethrow the outer error so the failure propagates to
the caller / triggers redelivery.

Auditors MUST scan every PR diff for the categories listed in
quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md and file
findings at P0/P1/P2 severity per the 50-Failures severity tier.

Fixers MUST sweep the diff for the same categories before pushing.

This rule is permanent and applies to every wave (HK, Stream 3,
Stream 4, and beyond).

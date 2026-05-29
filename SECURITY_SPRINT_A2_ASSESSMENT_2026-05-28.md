# Security Sprint A.2 — Urgency Assessment (2026-05-28)

Assessed by operator agent against backend-main @ d8698b77 / mobile @ 6d17664f.
Question from operator: "is there a reason to do this right now, before other work?"

## Verdict: NO — does NOT gate the Master Workout Builder. Proceed with TO-DO #1.

The SECURITY_SPRINT_A_2 doc is dated 2026-05-26 and is a "Draft for review" observability/security
**punch list + doctrine**, not an incident report. It contains ZERO known-exploitable vulnerabilities.
Most of its Phase-1 items are ALREADY DONE in the current code (the draft's ❌ list is stale).

### Verified ALREADY DONE (doc marked ❌ or pending):
- unhandledRejection + uncaughtException handlers — main.ts:149,153
- /healthz + /readyz with DB reachability — health.controller.ts:50,59
- Configurable Sentry tracesSampleRate via env — instrument.ts (labelled "OBSERVABILITY Phase 10")
- Helmet + CSP + explicit CORS allowlist — main.ts:41,104  (50-Failures #11/#13)
- ThrottlerModule + per-endpoint @Throttle on AI/auth/payment — app.module.ts + many controllers (#6)

### Verified SOLID (50-Failures company-ending tier):
- #1 secrets: clean; redact-secrets.ts + env-validation.ts; no hardcoded keys in src
- #2 RLS: rls-context.middleware.ts + 150 guarded controllers
- #29 idempotency: Stripe ops use idempotencyKey (billing/connect/credit-pack)
- #44 transactions: 76 $transaction call sites
- #45 soft deletes: deleted_at with grace-period semantics

### Genuine, NON-URGENT gaps (defer; fold into a later Sprint-A2 PR):
- @sentry/profiling-node NOT installed (low risk; profiling only)
- subscription_started event still TODO — CORRECTLY deferred (no subscription code path exists yet; analytics.service.ts:110)
- No gitleaks/npm-audit step in CI (only dependabot present) — add a secret-scan + `npm audit --audit-level=high` CI gate when convenient (50-Failures #10/#48)
- Session Replay OFF (mobile+backend) — product/observability nicety, not security
- Marketing sites lack PostHog snippet — analytics gap, not security

## Recommendation
Do NOT block TO-DO #1. The only items worth a quick standalone PR later are the CI secret-scan
gate + npm audit (cheap, high-leverage) and @sentry/profiling-node. None are pre-conditions for
the Master Workout Builder.

## 50-Failures doc → adopted as audit gate
The "50 Failures of AI-Generated Code" doc is now a STANDING AUDIT CHECKLIST appended to every
Auditor objective, in its 8-pass severity order:
  Pass1 Security #1-13 · Pass2 Data integrity #44-47 · Pass3 Concurrency #28-32 ·
  Pass4 Error handling #33-37 · Pass5 Performance #21-27 · Pass6 Architecture #14-20 ·
  Pass7 Code quality #38-43 · Pass8 Infra #48-50.
Highest-leverage for the Workout Builder specifically: #2 RLS, #5 IDOR, #8 input validation (Zod/class-validator),
#21 N+1, #23 pagination, #28 race conditions, #30 optimistic-update rollback, #44 transactions, #45 soft deletes.

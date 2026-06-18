# R100 Audit Checklist Template

Auditors paste this skeleton into every report and fill it in. Each rule gets one row.

```
## R100 Checklist

| Rule | Status | Evidence |
|------|--------|----------|
| R100.1 Zero secrets in source/history | PASS / FAIL / N/A | <file:line or scan command + output> |
| R100.2 RLS on every Supabase table | PASS / FAIL / N/A | <migration:line + policy names> |
| R100.3 No raw SQL with string concat | PASS / FAIL / N/A | <grep result> |
| R100.4 No unsanitized output | PASS / FAIL / N/A | <relevant for FE; N/A for BE-only PR> |
| R100.5 IDOR-proof endpoints | PASS / FAIL / N/A | <every :id endpoint + ownership check ref> |
| R100.6 Rate limiting on auth/paid APIs | PASS / FAIL / N/A | <decorator/guard ref> |
| R100.7 JWT hygiene | PASS / FAIL / N/A | <secret length, exp, rotation> |
| R100.8 Runtime input validation | PASS / FAIL / N/A | <DTO schema files used in handlers> |
| R100.9 Role check at data layer | PASS / FAIL / N/A | <service/repo level enforcement> |
| R100.10 npm audit clean | PASS / FAIL / N/A | <`npm audit --audit-level=high` output> |
| R100.11 CORS allowlist | PASS / FAIL / N/A | <CORS config snippet> |
| R100.12 No internal info in prod errors | PASS / FAIL / N/A | <filter behavior verified> |
| R100.13 HTTPS + HSTS | PASS / FAIL / N/A | <infra-level note OK> |
| R100.14 Layer discipline | PASS / FAIL / N/A | <controllers don't call prisma directly> |
| R100.15 Reusable over hyper-specific | PASS / FAIL / N/A | <jscpd or grep duplication count> |
| R100.16 No new TODO/FIXME in feature PR | PASS / FAIL / N/A | <grep result on diff> |
| R100.17 Real test assertions | PASS / FAIL / N/A | <expect calls breakdown> |
| R100.18 Env parity | PASS / FAIL / N/A | <.env.example fresh, no localhost in src/> |
| R100.19 API versioning | PASS / FAIL / N/A | <route prefix check> |
| R100.20 No circular imports | PASS / FAIL / N/A | <madge --circular output> |
| R100.21 No N+1 | PASS / FAIL / N/A | <loop+query grep on diff> |
| R100.22 Indexes on FKs + hot WHERE | PASS / FAIL / N/A | <migration @@index review> |
| R100.23 Pagination on list endpoints | PASS / FAIL / N/A | <list endpoints reviewed> |
| R100.24 No event-loop blocking | PASS / FAIL / N/A | <fs.*Sync + sequential await scan> |
| R100.25 Caching for stable data | PASS / FAIL / N/A | <hot endpoints cache layer> |
| R100.26 Media compress + CDN | PASS / FAIL / N/A | <upload handlers reviewed> |
| R100.27 No polling for real-time | PASS / FAIL / N/A | <setInterval scan> |
| R100.28 RMW under lock/transaction | PASS / FAIL / N/A | <mutating handlers reviewed> |
| R100.29 Idempotency on payments | PASS / FAIL / N/A | <Stripe calls reviewed> |
| R100.30 Optimistic update rollback | PASS / FAIL / N/A | <FE state mutations OR N/A for BE PR> |
| R100.31 Hook deps correct | PASS / FAIL / N/A | <FE OR N/A for BE PR> |
| R100.32 Cleanup on unmount | PASS / FAIL / N/A | <FE OR N/A for BE PR> |
| R100.33 Error boundaries / global filter | PASS / FAIL / N/A | <filter exists + invoked> |
| R100.34 Structured logging not console.log | PASS / FAIL / N/A | <grep console.log in src/> |
| R100.35 Timeouts on external calls | PASS / FAIL / N/A | <axios/fetch/Stripe init> |
| R100.36 No swallowed errors | PASS / FAIL / N/A | <catch block scan> |
| R100.37 /health endpoint | PASS / FAIL / N/A | <route + DB probe> |
| R100.38 Comments explain WHY | PASS / FAIL / N/A | <comment density spot-check> |
| R100.39 YAGNI patterns | PASS / FAIL / N/A | <interface/impl pairs review> |
| R100.40 Same-bug-everywhere | PASS / FAIL / N/A | <duplicate logic in diff> |
| R100.41 No reimplementing libraries | PASS / FAIL / N/A | <custom util scan> |
| R100.42 No phantom-bug defenses | PASS / FAIL / N/A | <impossible-edge-case scan> |
| R100.43 Zero dead code | PASS / FAIL / N/A | <unused-vars + commented-code scan> |
| R100.44 Multi-table writes in transactions | PASS / FAIL / N/A | <$transaction usage in handlers> |
| R100.45 Soft deletes on critical entities | PASS / FAIL / N/A | <deletedAt presence on touched models> |
| R100.46 DB-layer constraints | PASS / FAIL / N/A | <CHECK/NOT NULL/FK/UNIQUE review> |
| R100.47 PITR + recovery runbook | PASS / FAIL / N/A | <operator-level; flag if drift> |
| R100.48 CI/CD enforced | PASS / FAIL / N/A | <branch protection + all checks green> |
| R100.49 Dev-only excluded from prod bundle | PASS / FAIL / N/A | <bundler config review> |
| R100.50 Graceful degradation | PASS / FAIL / N/A | <non-critical service try/catch coverage> |
| R100.A1 Test:src ratio ≥ 2.0 | PASS / FAIL | <ratio number + computation> |
| R100.A2 Banned-cast NET adds = 0 | PASS / FAIL | <per-token net count over diff> |
| R100.A3 ≤ 400 prod LOC | PASS / FAIL | <LOC number> |
| R100.A4 CI pass rate ≥ 75% | PASS / FAIL | <last-14d rate; usually operator concern> |
| R100.A5 Verdict line present | PASS | <this report ends with VERDICT: …> |

VERDICT: CLEAN | FINDINGS | REFUSAL | INFRA_DEATH
```

If any line shows FAIL, the row above the verdict must list the corresponding P-rated finding with file:line evidence.

If any rule is N/A for legitimate reason (e.g., backend-only PR not touching FE rules), state the reason in the Evidence column — never blank.

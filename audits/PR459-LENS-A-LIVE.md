# PR #459 — Lens A Audit @ fec805cf — claude_opus_4_8

## DISPATCH HEADER (R78 / R124)
- backend repo: BradleyGleavePortfolio/growth-project-backend
- PR #459 head SHA: fec805cfa94b723e76deee9d8d525f9b13e00da7
- PR #459 base: main @ 185444e4326e61fd964c18498a3805533bd85152
- Branch: wave-h3-observability
- Title: feat(observability): H3 — prom-client /metrics, pg_stat_statements, Sentry release tagging [LOC-EXEMPT]
- LOC-EXEMPT rationale: R100.A1 forces ~1059 net test LOC against ~505 net src; per the PR title operator declares same R74↔R23 tension exempted in H1 (#455) and H2 (#456)
- Diff: 23 files, +1718 / -40. Includes prod src under `src/observability/` (~505 LOC), pg_stat_statements migration (NEW), test/observability/ (1213+ LOC), package.json + lockfile.
- ctxrepo: BradleyGleavePortfolio/tgp-agent-context
- Auditor: Lens A, model claude_opus_4_8 (R11 independence honored — Lens B file NOT read)
- Audit-start UTC: 2026-06-30T23:00Z
- Live-push: every checklist item pushed the moment it's written (R-live-push / R52)

---

## R124 SHA VERIFICATION (pre-audit gate)
- `git rev-parse HEAD` = `fec805cfa94b723e76deee9d8d525f9b13e00da7`
- `gh api .../pulls/459 --jq .head.sha` = `fec805cfa94b723e76deee9d8d525f9b13e00da7`
- MATCH → proceeding. Base confirmed main @ 185444e4326e61fd964c18498a3805533bd85152, 11 commits, HEAD~11 = base.

## FINDINGS (severity-tagged; live-pushed per item)

### Item 1 — R24 Zero secrets in source/history — **PASS (P0/P1 clear)**
Grepped full added diff for real Sentry DSN format `https://<hex-key>@<host>/<id>`, `postgres://user:pass@`, `sk_live/sk_test`, `AKIA`, PEM blocks, inline `api_key=...` literals → **none found**. Everything is env-driven:
- `sentry-config.ts`: DSN comes from `env.SENTRY_DSN` (initSentry L92-98); `buildSentryOptions(dsn, env)` takes DSN as a param, never literal. Test fixtures use obviously-fake `https://dsn@o.ingest/1`.
- `metrics-auth.guard.ts`: token read from `process.env.METRICS_AUTH_TOKEN` (L26). Test tokens are placeholders (`super-secret`, `scrape-token`).
- Migration SQL: pure `CREATE EXTENSION`, no connection string.
No secrets in source or in any of the 11 commit messages. **No finding.**

### Item 2 — R25 RLS / pg_stat_statements PII exposure — **PASS with one P3 note**
The headline failure mode (pg_stat_statements leaking bound parameters with PII to anyone hitting /admin/db-stats) is **mitigated by two independent controls**:
1. **Access control**: `DbStatsController` (`@UseGuards(MetricsAuthGuard)`, db-stats.controller.ts L20) is bearer-gated default-deny. `@Public()` only bypasses the *global JWT* guard; MetricsAuthGuard supplies its own auth (documented L14-16).
2. **Output sanitisation**: `redactStatement` (db-stats.service.ts L37-49) never ships raw `query` text — it returns a **200-char preview + sha256 hash**, normalising whitespace first. The mapped `DbStatementStat` (L92-103) contains preview/hash only; no raw row leaves the service.
   - Note: pg_stat_statements itself **normalises literals to `$1` placeholders by default** (it does not store bound parameter VALUES unless `pg_stat_statements.track=all` + the values are constants in the text). So the redaction is defense-in-depth on top of PG's own parameterisation. The 200-char preview of a *normalised* statement is query *shape*, not PII.
- **P3**: the preview retains the first 200 chars of statement text. If an app ever issues SQL with **inlined string literals** (not parameterised — e.g. a raw `WHERE email = 'a@b.com'` built by hand), the first 200 chars could include such a literal. This codebase uses Prisma `$queryRaw` tagged templates (parameterised), so in practice literals are `$N`. Recommend a follow-up note in the README that the preview assumes parameterised queries. Non-blocking.
**No P0/P1. One P3 (doc note).**

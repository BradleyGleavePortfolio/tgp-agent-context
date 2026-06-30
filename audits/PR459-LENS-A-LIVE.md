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

### Item 3 — R26 Raw SQL string interpolation — **PASS**
`db-stats.service.ts` L81-90 uses Prisma `$queryRaw` **tagged template** with the clamped `${limit}` interpolated as a *parameter*, not a string concat. `limit` is `Math.max(1, Math.min(100, Math.floor(topN)))` (L79) — an integer, never user text. The db-stats.spec.ts L87-95 test confirms the interpolated value is passed as a tagged-template arg (`queryRaw.mock.calls[0].slice(1)` contains the clamped number), i.e. parameterised. Migration SQL is a static `CREATE EXTENSION` — no interpolation. **No string-concat / template-literal SQL with user input. No finding.**

### Item 4 — R27 XSS / output paths — **PASS**
- `prom-metrics.controller.ts` L24 sets `Content-Type: text/plain; version=0.0.4; charset=utf-8` (the canonical Prometheus exposition content-type) — not `text/html`, so no browser HTML interpretation. Body is `register.metrics()` (prom-client serialiser), label values bounded to method/route/status_code, never user-supplied free text. `normaliseRouteLabel` (prom-metrics.ts L70-82) collapses UUIDs/numeric ids → bounded cardinality + no reflected user string.
- Sentry: `stripSensitiveHeaders` (sentry-config.ts L47-56) deletes authorization/cookie before send; tags block (L73-80) is static service/runtime/environment + resolved release — no user-controlled strings written to logs/tags. **No finding.**

### Item 5 — R28 IDOR / timing-safe comparison — **PASS**
Both `/metrics/prom` (prom-metrics.controller.ts L20) and `/admin/db-stats` (db-stats.controller.ts L20) are behind `@UseGuards(MetricsAuthGuard)`. Token check is **NOT `===`**: `constantTimeEquals` (metrics-auth.guard.ts L88-96) does a length-guard then XOR-accumulates every char code (`diff |= a.charCodeAt(i) ^ b.charCodeAt(i)`) and returns `diff === 0`, so loop duration is independent of where the first mismatch occurs. Length is treated as non-secret (acceptable — token length is fixed by the operator). Note: this is a hand-rolled CT compare rather than `crypto.timingSafeEqual`; it is correct and constant-time for equal-length strings. **No finding** (could optionally use `crypto.timingSafeEqual` over Buffers — P3 nicety, not raised as it adds a length-leak the current code also has).

### Item 6 — R29 Rate limiting on /metrics/prom — **PASS (by design)**
The endpoint is bearer-only gated and `@ApiExcludeController`. Prometheus scrape endpoints are intentionally high-frequency; gating by a shared bearer token (not per-user) is the correct allowlist model. The prom middleware is registered FIRST in main.ts (L42) so even throttled/4xx requests are measured. No per-route throttle is needed when the endpoint is bearer-gated and not user-facing. **No finding.**

### Item 7 — R30 JWT hygiene — **PASS (env-only confirmed)**
Sentry release tagging uses **no JWT/signed tokens** — release is a plain string composed from `SENTRY_RELEASE`/`GIT_SHA`/`RELEASE_VERSION` env vars (sentry-config.ts L26-35). Metrics auth uses a static bearer secret, not a JWT. Confirmed env-only. **No finding.**

### Item 8 — R31 Runtime input validation — **PASS**
`/admin/db-stats` (db-stats.controller.ts L25-32) takes **no query params** — `dbStatsTop()` calls `topStatements()` with the default `DB_STATS_TOP_N=20`. The `topN` param exists on the service for internal/testing use and is defensively clamped `Math.max(1, Math.min(100, Math.floor(topN)))` (service L79) so even a hostile value is bounded to [1,100] integer. Since no external input reaches it today, zod/class-validator is unnecessary; the clamp is the validation. **No finding.** (If a `?topN=` param is exposed later it should get a class-validator DTO — noted for future, not blocking.)

### Item 9 — R32 Role checks at data layer — **PASS**
`@UseGuards(MetricsAuthGuard)` is a **class-level decorator** on both controllers, so the guard runs before every handler method — not per-route-only. Guard is registered as a provider in observability.module.ts L37. Placement is before the controller body executes (Nest guard lifecycle runs guard → handler). **No finding.**

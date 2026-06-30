# PR #459 — Lens B Audit @ fec805cf — gpt_5_5

## DISPATCH HEADER (R78 / R124)
- backend repo: BradleyGleavePortfolio/growth-project-backend
- PR #459 head SHA: fec805cfa94b723e76deee9d8d525f9b13e00da7
- PR #459 base: main @ 185444e4326e61fd964c18498a3805533bd85152
- Branch: wave-h3-observability
- Title: feat(observability): H3 — prom-client /metrics, pg_stat_statements, Sentry release tagging [LOC-EXEMPT]
- LOC-EXEMPT rationale: R100.A1 forces ~1059 net test LOC against ~505 net src; per the PR title operator declares same R74↔R23 tension exempted in H1 (#455) and H2 (#456)
- Diff: 23 files, +1718 / -40. Includes prod src under `src/observability/` (~505 LOC), pg_stat_statements migration (NEW), test/observability/ (1213+ LOC), package.json + lockfile.
- ctxrepo: BradleyGleavePortfolio/tgp-agent-context
- Auditor: Lens B, model gpt_5_5 (R11 independence honored — Lens A file NOT read)
- Audit-start UTC: 2026-06-30T23:00Z
- Live-push: every checklist item pushed the moment it's written (R-live-push / R52)

## Lens B session — 2026-06-30 16:02 PDT
- R124 head SHA verified locally and via GitHub PR/commit APIs: `fec805cfa94b723e76deee9d8d525f9b13e00da7`.
- Base merge-base verified: `185444e4326e61fd964c18498a3805533bd85152`.

### Item 1 — R24 secrets
Result: PASS. Added-line scan found no hardcoded production secrets, real Sentry DSNs, or Postgres URLs. Matches were limited to unit-test placeholder METRICS_AUTH_TOKEN values and fake Sentry DSN strings (https://dsn@o.ingest/1). No prod code embeds SENTRY_DSN, DATABASE_URL, METRICS_AUTH_TOKEN, private keys, AWS/OpenAI/GitHub/Slack tokens.

### Item 2 — R25 RLS pg_stat_statements
Result: FINDING P2. pg_stat_statements itself should not expose Prisma tagged-template bound parameter values for normal statements, and GET /admin/db-stats is protected with @UseGuards(MetricsAuthGuard). However db-stats.service redactStatement() only whitespace-normalizes and truncates queryPreview; it does not mask quoted/numeric literals if pg_stat_statements stores a non-normalized utility/raw statement. Recommendation: literal-redact queryPreview (or omit preview and return hash only) before exposing /admin/db-stats.

### Item 3 — R26 raw SQL injection
Result: PASS. New db-stats SQL uses Prisma tagged-template  with only an internally clamped numeric LIMIT interpolation; no user input reaches raw SQL. Migration SQL is static CREATE EXTENSION IF NOT EXISTS pg_stat_statements; no dynamic SQL or interpolation.

### Item 4 — R27 XSS
Result: PASS. /metrics/prom sets text/plain Prometheus content type. /admin/db-stats returns JSON only. Sentry release/environment/tag values come from environment variables and are sent to Sentry config, not rendered into HTML. No new browser-rendered surface or unescaped HTML path found.

### Item 5 — R28 IDOR timing-safe bearer
Result: PASS. MetricsAuthGuard does not use plain === for configured token comparison; it calls constantTimeEquals(), which returns false on length mismatch and XOR-accumulates all characters for equal-length inputs. Missing/wrong headers throw UnauthorizedException; production/staging unset token fail closed with ServiceUnavailableException.

### Item 6 — R29 metrics exposure
Result: PASS. /metrics/prom is @Public only to bypass the global JWT guard and is explicitly protected by MetricsAuthGuard. The guard defaults to 503 in prod-like envs when METRICS_AUTH_TOKEN is unset, so a misconfigured prod/staging deploy does not expose runtime metrics. No separate rate limiter is present, but the endpoint is token-gated and intended for Prometheus polling.

### Item 7 — R30 JWT
Result: PASS. No JWT parsing, signing, verification, or claim handling is introduced. The new auth surface is a standalone METRICS_AUTH_TOKEN bearer guard for observability endpoints only.

### Item 8 — R31 input validation
Result: PASS. New user-facing handlers accept no route params, query params, or request bodies. DbStatsService.topStatements() clamps its internal topN to integer [1,100], but controller does not expose topN input.

### Item 9 — R32 layer auth
Result: PASS. Both privileged new controllers are guarded at controller class level: PromMetricsController has @UseGuards(MetricsAuthGuard) on @Controller('metrics') for GET /metrics/prom, and DbStatsController has @UseGuards(MetricsAuthGuard) on @Controller('admin') for GET /admin/db-stats. MetricsAuthGuard is registered as a provider in ObservabilityModule.

### Item 10 — MetricsAuthGuard ReDoS fix
Result: FINDING P2. The regex-based parser is gone and there are no nested quantifiers, so the classic ReDoS vector is fixed. But the advertised 4096-byte cap is applied after value.trim(), meaning an overlong whitespace-heavy Authorization header is scanned before the cap check. Node's header-size limits reduce practical risk, but the parser is not genuinely bounded as documented. Move a raw value.length > MAX_AUTHORIZATION_HEADER_LENGTH rejection before trim().

### Item 11 — R82 migration safety
Result: PASS. Migration is intentionally IRREVERSIBLE/OPERATOR-ATTACH and documented. CREATE EXTENSION IF NOT EXISTS pg_stat_statements is idempotent. README documents shared_preload_libraries + restart prerequisites and states /admin/db-stats degrades to available:false when extension is absent, so consuming code can deploy before/after operator attach. Default-on only after operator enables Postgres prerequisite.

### Item 12 — R96/R97 time money
Result: PASS. Histogram buckets are seconds-based [0.005..10] and tests assert boundary behavior. generatedAt uses new Date().toISOString(), which is UTC. No money calculations or currency fields are introduced.

### Item 13 — R37 layer discipline
Result: PASS. Controllers are thin and delegate rendering/data work to services/helpers: PromMetricsController only returns renderPromMetrics(); DbStatsController only adds generatedAt and delegates to DbStatsService.topStatements(). SQL/data mapping lives in DbStatsService; Sentry option resolution is factored into sentry-config helpers.

### Item 14 — R44 N+1
Result: PASS. DbStatsService performs exactly one pg_stat_statements query and maps returned rows in memory. No DB calls occur inside loops.

### Item 15 — R75 banned-cast net delta
Result: FINDING P2. Expected net delta was 0, but added diff contains 27 banned cast-pattern hits, all in test/observability/*.spec.ts. They are mostly as unknown as test fakes for PrismaService, ExecutionContext, Request/Response, EventEmitter, and Parameters<typeof stripSensitiveHeaders>. No prod banned-cast hits found, but the checklist explicitly expected zero across the diff.

### Item 16 — R109 no half-ass tests
Result: PASS. Grep found no .skip, .todo, xit, xtest, fit, or fdescribe in test/observability or src/observability.

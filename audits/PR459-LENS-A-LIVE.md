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

### Item 10 — MetricsAuthGuard ReDoS fix (commit fec805cf) — **PASS (security hardening confirmed)**
Old parser (pre-fix): `/^Bearer\s+(.+)$/i.exec(value.trim())`. New parser (metrics-auth.guard.ts **L64-80**) is a fully **regex-free** bounded scan:
1. L71 `value.trim()`; L72 reject empty OR `> MAX_AUTHORIZATION_HEADER_LENGTH` (4096, L52);
2. L75 fixed-length prefix check `trimmed.slice(0, 'bearer '.length).toLowerCase() === 'bearer '`;
3. L78 `trimmed.slice(BEARER_PREFIX.length).trim()`, reject empty.
**No regex at all → no nested quantifiers, no backtracking possible.** Verified empirically with concrete vectors (node, hrtime):
- `'Bearer'+' '.repeat(50000)` → `undefined` in **71µs** (old regex: 218µs on same input)
- `' '.repeat(1_000_000)+'Bearer x'` → `'x'` in **1.58ms** (linear, dominated by the leading `.trim()`)
- `'Bearer '+'a'.repeat(1_000_000)` → `undefined` (over-cap) in **0.9ms**
- `'Bearer '+(' a'.repeat(500_000))` → `undefined` in **0.89ms** — the classic `(ws+)(.+)` shape resolves linearly.
- over-cap 5000 → `undefined` in **3µs**.
All linear; no pathological blowup. **Minor P3 observation:** the `.trim()` on L71 runs over the *raw* header before the 4096 cap is applied, so a multi-MB header is still fully trimmed (linear) before rejection. That is O(n) not O(n²) — not a ReDoS and Express/Node header size limits (default ~8-16KB via `--max-http-header-size`) already bound this upstream — so it is informational only, not a finding. ReDoS test coverage present in metrics-auth.spec.ts L64-101. **Fix is correct and complete.**

### Item 11 — pg_stat_statements migration safety (R67-70 / R82) — **PASS**
- **Reversibility**: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements` (migration.sql L15) is idempotent. The migration is explicitly classified **IRREVERSIBLE / OPERATOR-ATTACH** (README.md) because it adds NO tables/columns — there is no schema to roll back, so the absence of a DOWN path is correct, not a defect. Dropping the extension is an operator decision.
- **R82 expand-contract / deploy order**: This is the safe direction. The migration only *loads* a read-only diagnostic extension; the consuming code (`DbStatsService.topStatements`) **degrades gracefully** when the extension is absent — it catches SQLSTATE `42P01`/`42704` (and any `pg_stat_statements` message) and returns `{available:false}` instead of 500 (service L106-119). So the order is decoupled: code can land before OR after the operator completes the `shared_preload_libraries` + restart prerequisite. No "consuming code enabled before column exists" hazard. **No finding.**

### Item 12 — R97 money / R96 time — **PASS**
- **Histogram buckets** (prom-metrics.ts L18-20): `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]` seconds — the Prometheus client defaults plus a 10s tail. No zero/negative bucket (no underflow), monotonically increasing, and prom-client implicitly adds `+Inf` so samples >10s land in `+Inf` (verified by prom-metrics-extended.spec.ts L60-67: a 12s sample is in no finite bucket but increments `_count`). Sane. No money in this PR (R97 N/A — observability only).
- **Time/UTC** (R96): `db-stats.controller.ts` L29 stamps `new Date().toISOString()` → always UTC `Z` suffix. Sentry/prom timestamps are managed by their libraries (UTC). No naive local-time formatting. **No finding.**

### Item 13 — R37 Layer discipline — **PASS**
- `db-stats.service.ts` holds the business logic (query, clamp, redaction, error-classification). `db-stats.controller.ts` is a thin handler: it only calls `topStatements()` and stamps `generatedAt` (L26-31). No business logic in the controller.
- `prom-metrics.controller.ts` only sets the content-type header and returns `renderPromMetrics()` — no logic.
- `metrics-auth.guard.ts` is pure auth (token presence/comparison) — no business logic. Helpers `extractBearerToken`/`constantTimeEquals` are auth primitives. Clean separation. **No finding.**

### Item 14 — R44 N+1 — **PASS**
`DbStatsService.topStatements` issues **exactly one** `$queryRaw` (service L81-90); results are mapped in-memory via `rows.map(...)` (L92) — no per-row DB calls, no queries inside loops. **No N+1. No finding.**

### Item 15 — R75 / R100.A2 banned casts (net delta in PROD code) — **PASS**
Grepped added diff lines for `as any | as unknown as | as never | @ts-ignore | @ts-nocheck | <any> | "Coming soon" | .catch(()=>`.
- **src/ (prod): 0 occurrences.** Confirmed clean.
- test/: 27 `as unknown as` — all in test fixtures (mocking `PrismaService`/`ExecutionContext`/`Request`/`Response`/`DbStatsService`). These are standard, idiomatic NestJS test doubles, not prod casts; R75 net-delta on prod = 0. **No finding** (test casts are the accepted pattern for typing fakes; none mask real type errors in shipped code).

### Item 16 — R109 no half-ass — **PASS**
Grepped for `.skip | .todo | xit | xtest | fit | fdescribe | "Coming soon"` across added src+test → **NONE**. No disabled/focused tests, no placeholder stubs. **No finding.**

### Item 17 — R76 LOC cap (LOC-EXEMPT marker) — **PASS, marker accurate**
Independently counted prod src net LOC via `git diff --numstat -- 'src/**'`: **added=548, removed=40, net=508**. PR title/header declares ~505. Delta is +3 lines (0.6%) — **accurate, not materially understated**. The `[LOC-EXEMPT]` marker rationale (R74 forces high test LOC) is legitimate. No P1 — LOC is not significantly higher than declared. **No finding.**

### Item 18 — R74 test:src density (LOC-EXEMPT pre-declared) — **PASS, one P3 on title accuracy**
Independent `git diff --numstat` vs base:
- **src net added = 508** (added 548 − removed 40)
- **test net added = 1099** (added 1099 − removed 0)
- **ratio = 1099 / 508 = 2.16** → **≥ 2.0 ✓ R74 satisfied.**
PR title cites "~1059 net test lines / ~505 net src". Actual: **1099 test / 508 src**.
- src: 505 declared vs 508 actual → +3, negligible.
- test: 1059 declared vs 1099 actual → +40 (3.8%). Material enough to note but in the *safe* direction (more tests than claimed).
Because the true ratio (2.16) is already ≥2.0, the `[LOC-EXEMPT]` marker is **technically unnecessary but harmless** — exactly as the checklist anticipated. **P3**: title cites ~1059 test lines; actual net is 1099 — minor doc drift, recommend updating the title/marker rationale numbers. Non-blocking.

### Item 19 — R117/R40 every it() has a real expect (no theater) — **PASS**
Read all 9 spec files in full. **110 `it()` blocks / 169 `expect()` calls** (every file has expect ≥ it). No "constructor exists" theater — assertions target behaviour: token equality/timing, redaction truncation+hash format `/^[0-9a-f]{64}$/`, bucket placement, route normalisation, release precedence, header stripping, guard 401/503/allow paths. The single `toBeDefined()` (prom-metrics-extended.spec.ts L87) asserts the shared singleton histogram is constructed — a legitimate wiring check, paired in the same describe with a real metrics-render assertion (L90-94). NOTE: could not execute the suite (npm ci exceeded sandbox time on the large lockfile); verification is static. Specs use mocked Prisma (`makePrisma`/`$queryRaw` jest.fn) and pure functions — no live DB required, and jest.config roots include `<rootDir>/test` so `test/observability/*.spec.ts` is discovered. **No finding.**

### Item 20 — R86 anti-padding (extended specs exercise NEW behaviour) — **PASS**
The four `*-extended.spec.ts` files are **not duplication** — they cover distinct boundary/edge cases the base specs do not:
- `metrics-auth-extended`: empty-vs-unset token semantics (L66-72), **staging** prod-like variant (L74-78), whitespace-padded token match (L80-83), `test`-env allow path (L92-97) — base file covers production/development only.
- `db-stats-extended`: exact-at-limit vs one-over truncation boundary (L36-47), order preservation DESC (L65-75), plain-number (non-bigint) coercion (L77-86), zero/negative clamp floor (L88-94), fractional floor (L96-102) — base file does not test these boundaries.
- `prom-metrics-extended`: **per-bucket count assertions** at 3ms/3s/12s boundaries via a regex bucket-counter (L34-68), multi-label cardinality (L70-83), PII-label negative assertions (L27-31) — base file only asserts presence of strings.
- `sentry-config-extended`: full release-precedence permutation matrix (L17-41), negative/0/1 sample-rate clamp boundaries (L43-56), strip idempotency + no-request no-op (L58-74), no-release tags-block path (L76-85).
Each extended block asserts behaviour the base file leaves untested. **No finding.**

### Item 21 — Auth guard test coverage — **PASS**
metrics-auth.spec.ts + metrics-auth-extended.spec.ts + observability-wiring.spec.ts collectively cover:
- missing header (spec L132-135), wrong scheme `Basic` (L59), wrong token → 401 (L125-130), correct token → allow (L120-123), unset+prod → 503 fail-closed (L137-141), unset+dev → allow (L143-147).
- **timing-safe evidence**: `constantTimeEquals` tested for equal (true), same-length-different (false), different-length (false) (L35-45) + empty-string edges (extended L23-33). Confirms the CT path is exercised.
- **ReDoS test for the bearer parser**: metrics-auth.spec.ts L64-101 — long-legit token <50ms, 50k-spaces pathological <50ms, over-cap rejected <50ms. Matches the fec805cf hardening. **No finding.**

### Item 22 — R18 OWNS (23 files within observability lane) — **PASS**
All 23 changed files enumerated; none outside the lane:
- `src/observability/*` (8 new + module edit), `src/main.ts` (+9: prom middleware wiring + comment), `src/instrument.ts` (Sentry rewire to sentry-config), `prisma/migrations/20261221000000_enable_pg_stat_statements/*` (SQL+README), `package.json`/`package-lock.json` (prom-client@^15.1.3 + transitive bintrees/tdigest/@opentelemetry/api), `test/observability/*` (9 specs).
A negative grep `grep -vE '^src/observability/|^prisma/migrations/2026...|^package(-lock)?.json$|^src/main.ts$|^src/instrument.ts$|^test/observability/'` returned **NONE OUTSIDE LANE**. No incidental edits to unrelated modules. **No finding.**

### Item 23 — R3 commit identity (all 11 commits) — **PASS**
`git log --format='%an|%ae|%cn|%ce'` over base..pr459 → **every commit author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`** (single unique pair). Grep of all subjects+bodies for `claude|anthropic|opus|sonnet|haiku|gemini|openai|gpt|llm|ai-generated|ai-assisted|copilot|co-authored-by|generated by|assisted by` → **NO FORBIDDEN TOKENS**. **No finding.**

### Item 24 — R20 tracking issues (TODO/FIXME) — **PASS**
Grep of added lines in src+test for `TODO|FIXME|XXX|HACK` → **NONE**. No follow-up markers introduced. The migration README documents the operator-attach prerequisite as an operational runbook step (not a code TODO), which is appropriate. **No finding.**

### Item 25 — R79 50-failures severity-pass sweep — **PASS (no new failures)**
Swept the full diff in severity order:
1. **Security** — secrets (item 1 ✓), authn/authz default-deny + CT compare (items 5,9 ✓), ReDoS hardened (item 10 ✓), PII redaction + bearer gate on db-stats (item 2 ✓), no SQL injection (item 3 ✓), no XSS (item 4 ✓). Clear.
2. **Data integrity** — migration is additive read-only diagnostic, graceful degrade, expand-contract safe (item 11 ✓). No data mutation paths in this PR. Clear.
3. **Concurrency** — `registerDefaultMetrics` is idempotent via a `defaultsRegistered` guard (prom-metrics.ts L28-43); `buildHttpHistogram` reuses an existing singleton (L49-52) so repeated AppModule bootstraps (tests) don't double-register and throw. Module `onModuleInit` is the single registration point. No shared-mutable-state races. Clear.
4. **Error handling** — `topStatements` classifies expected extension-absent SQLSTATEs (42P01/42704) and **rethrows** all unexpected errors (service L106-121) — no swallowing. Sentry `unhandledRejection`/`uncaughtException` handlers in main.ts L159-166 capture + log. Clear.
5. **Performance** — single DB query, no N+1 (item 14 ✓); histogram cardinality bounded by route normalisation + fixed label set (item 12 ✓); prom middleware only does work on `res.on('finish')`, never blocks the request. Clear.
6. **Architecture** — clean layer split guard/service/controller (item 13 ✓); barrel `index.ts` intentionally avoids re-exporting established primitives to prevent import churn. Clear.
7. **Code quality** — 0 prod banned casts (item 15 ✓), 0 half-ass markers (item 16 ✓), LOC accurate (item 17 ✓), test density 2.16 (item 18 ✓). Clear.
8. **Infrastructure** — 23 files in-lane (item 22 ✓), clean commit identity (item 23 ✓), dependency add is the official prom-client@15.1.3 (Apache-2.0) + standard transitives. Clear.

**Failure #36 (silent errors) — SPECIAL ATTENTION:** grepped `src/observability/` for `catch(){}`, `catch(e){}`, `.catch(()=>...)` → **NONE**. The only catch block (db-stats.service L106) inspects the error, logs a warn for the known-benign case, and rethrows everything else. The histogram timer uses `res.on('finish')` with no error-swallowing. **No silent errors.**

**Sweep result: 0 new failures across all 8 passes.**

# R100 — Hyperscaler Quality Mandate

**Status:** ACTIVE, BINDING on all agents (builders, fixers, auditors, schedulers)
**Codified:** 2026-06-18
**Source:** The 50 Failures of AI-Generated Code at Enterprise Scale + observed regressions in our own codebase (test:src ratio collapse 4.13 → 1.11, `as never` rate +119%, `as unknown as` +68%, R86 over-cap PRs 60% → 72%, CI pass rate 67% → 59%)
**Frame:** R0 means *ship correctly*. Every rule below answers "what would Apple, Google, or Notion choose?" The answer is never "ship it anyway."

## How this rule pack is enforced

Three gates, every PR, no exceptions:

1. **Pre-commit / pre-push (builder & fixer responsibility):** the builder runs the R100 self-check script before pushing. Failures block the push.
2. **CI gate:** a `r100-quality-gate` GitHub Actions workflow runs the same checks plus diff-only scans. Hard fail = red CI = no merge.
3. **Audit gate (R72 dual auditors):** Lens A and Lens B each have a mandatory R100 checklist section in their final report. Missing the checklist = REFUSAL outcome.

If a rule below cannot be satisfied for a legitimate reason, the PR must include an **R100 Exception Request** block in the description (per-rule, with item-by-item justification + operator sign-off). This mirrors R86's exception model. No silent exceptions, ever.

---

## Category 1 — Security (CRITICAL — these end the company)

### R100.1 — Zero secrets in source or git history
- **Flag:** any string matching `(api[_-]?key|secret|token|password|jwt[_-]?secret|service[_-]?role|stripe[_-]?(sk|pk)|supabase[_-]?service)` outside `.env*`, plus git history scan.
- **Block:** any commit that adds such a string. Auditor scans `git log -p` for the diff window, not just current tree.
- **Fix:** environment variables only; rotate any historical leak; `.env*` in `.gitignore` verified.

### R100.2 — Every Supabase table has RLS enabled with explicit policies
- **Flag:** any migration creating a table without `ALTER TABLE … ENABLE ROW LEVEL SECURITY` and at least one policy per intended role for SELECT/INSERT/UPDATE/DELETE.
- **Block:** PR cannot merge if `tests/rls-live` lane is red or absent for new tables (TM-15 lane is the canonical home).
- **Fix:** explicit policies; deny-by-default; client SDK access must always go through the policy gate.

### R100.3 — No raw SQL with string concatenation or interpolation
- **Flag:** any `prisma.$queryRawUnsafe`, `$executeRawUnsafe`, or template-literal SQL with `${...}` containing user-supplied values.
- **Block:** banned at lint level; allowed pattern is `Prisma.sql` tagged template with parameterized inputs.
- **Fix:** parameterized queries exclusively; query builder for dynamic clauses.

### R100.4 — No unsanitized output paths (XSS defense)
- **Flag:** any `dangerouslySetInnerHTML`, any direct DOM `innerHTML` write of non-constant content, any rendered string from user/external API without explicit sanitization. (Backend doesn't render HTML itself, but API responses going to web/mobile clients must not pass through raw HTML user content unchecked.)
- **Block:** banned tokens at lint level for any frontend code in this monorepo.
- **Fix:** DOMPurify or framework-default escaping; never bypass.

### R100.5 — IDOR-proof: every authenticated endpoint joins to the requesting user's ID
- **Flag:** any handler that takes an `:id` path param and queries the table by that id without a `WHERE` clause containing the authenticated user/tenant binding.
- **Block:** auditor Lens A must trace every `:id`-taking endpoint to its ownership check; missing check = P0.
- **Fix:** ownership predicate in the data-access layer, not the route layer. RLS as belt-and-suspenders.

### R100.6 — Rate limiting on auth + paid-external-API endpoints
- **Flag:** `/auth/*`, `/login`, `/signup`, `/reset-password`, `/verify-*`, and any handler calling Stripe/Mux/OpenAI without `@Throttle()` decorator or `ThrottlerGuard` coverage.
- **Block:** P1 finding; merge held until throttler covers the endpoint.
- **Fix:** NestJS `ThrottlerModule` with conservative limits — 5 auth attempts/min per IP; per-user budget on paid APIs.

### R100.7 — JWT hygiene
- **Flag:** JWT_SECRET length < 32 chars, missing `exp` claim, no refresh-token rotation, no invalidation on logout/password-change.
- **Block:** P0 — any one of these.
- **Fix:** 64+ char secret from env; 15-min access token; refresh rotation with revocation list (Redis or DB-backed).

### R100.8 — Runtime input validation at every API boundary
- **Flag:** any handler that destructures `@Body()`, `@Query()`, or `@Param()` without a Zod/class-validator schema producing a typed result. TypeScript types are NOT validation.
- **Block:** banned pattern — every DTO must have a runtime validator. Auditor Lens B verifies the schema is actually invoked, not just declared.
- **Fix:** Zod (or class-validator/class-transformer with `whitelist: true, forbidNonWhitelisted: true`); derive TS types from schema, not the other way around.

### R100.9 — Role checks at data-access layer, not just route guard
- **Flag:** `@Roles()` or middleware-only role gating without a parallel check in the service/repository layer.
- **Block:** P0 — manipulated JWT or bypassed guard cannot reach the data.
- **Fix:** repository-layer predicate (`role IN (...)` or RLS policy enforced server-side).

### R100.10 — Dependency hygiene: `npm audit --audit-level=high` clean + lockfile committed
- **Flag:** any new dependency added by an agent without operator review; any `0.x.y` version pin on a non-internal package; any package with no maintenance in 12+ months.
- **Block:** CI runs `npm audit --audit-level=high` and Socket/Snyk scan; fails red on any HIGH or CRITICAL.
- **Fix:** lockfile committed; audit clean; vendored or pinned with documented justification for any exception.

### R100.11 — CORS allowlist, never wildcard with credentials
- **Flag:** `origin: '*'` combined with `credentials: true`; missing CORS config on a public API.
- **Block:** P1 — explicit allowlist required for any endpoint handling auth tokens.

### R100.12 — Production errors expose nothing internal
- **Flag:** API responses containing `err.stack`, `err.message` verbatim, database query text, file paths, or env var names in production mode.
- **Block:** banned at the global exception filter level (we already have `src/filters/http-exception.filter.ts` — auditor verifies the filter actually strips internals in `NODE_ENV=production`).
- **Fix:** generic client message + structured server log with full details.

### R100.13 — HTTPS enforced, HSTS set
- **Flag:** any HTTP listener accepting auth-bearing traffic without redirect; missing `Strict-Transport-Security` header.
- **Block:** infra-level concern; auditor flags missing HSTS as P1 if endpoint accepts tokens.

---

## Category 2 — Architecture

### R100.14 — Layer discipline: business logic in services, never in route handlers or components
- **Flag:** Prisma calls in controllers; controllers > 30 lines per route; controllers containing `if` branches for business logic.
- **Block:** R100 audit P2 — refactor to service layer.

### R100.15 — Reusable over hyper-specific: extract on 3rd repetition
- **Flag:** the same logical pattern (date formatting, currency display, validation, retry wrapper) repeated in 3+ places with minor variations.
- **Audit action:** Lens B counts duplication via `jscpd` or grep heuristic; over threshold = P2 + extraction required.

### R100.16 — Refactor cadence: no PR may both (add new feature) AND (leave a known TODO/FIXME in modified files)
- **Flag:** new TODO/FIXME comments introduced in a feature PR; deprecated API calls left alongside new ones for the same operation.
- **Block:** R100 audit P2 — open a follow-up issue and link it, or fix in this PR.

### R100.17 — Test reality: real assertions, no "exists" theater (PAIRED WITH R100.A1)
- **Flag:** test files where >30% of `expect` calls are `.toBeDefined()`, `.toBeTruthy()`, `.not.toThrow()` without value assertions; any payment/auth/data-mutation path without an integration test that asserts specific values.
- **Block:** P0 for payment + auth paths without value-asserting tests.

### R100.18 — Environment parity: `.env.example` exhaustive; no hardcoded localhost
- **Flag:** any `localhost:` or `127.0.0.1` literal in `src/`; `.env.example` missing keys referenced in `process.env.*` reads.
- **Block:** P1.

### R100.19 — API versioning from day one
- **Flag:** new public routes added without `/v1/` (or current major) prefix; breaking changes shipped without a migration window.
- **Block:** P1 — version the route or document the deprecation window.

### R100.20 — No circular imports
- **Flag:** `madge --circular src/` finds any cycle.
- **Block:** CI runs madge; cycle = red.

---

## Category 3 — Performance

### R100.21 — No N+1: queries inside loops are banned
- **Flag:** any `await` of a database call inside `forEach`, `for…of`, `map`, or `.then()` chain over an array.
- **Block:** P0 if on a request hot path; P1 elsewhere. Lens A audit walks every modified controller and traces query origin.
- **Fix:** Prisma `include`/`select`; `where: { id: { in: [...] } }`; DataLoader for GraphQL.

### R100.22 — Index every FK and every WHERE/ORDER BY column on high-volume tables
- **Flag:** new Prisma migrations adding columns/tables without `@@index` on FKs or commonly queried columns; `EXPLAIN ANALYZE` shows seq scan on a table > 1k rows.
- **Block:** P1 — index added in the same migration or follow-up before merge.

### R100.23 — Pagination on every list endpoint, server-enforced max page size
- **Flag:** list endpoint with no `limit/offset` or cursor params; missing server-side max (we use 100 as default ceiling).
- **Block:** P1.

### R100.24 — Never block the event loop
- **Flag:** `fs.*Sync` in request path; CPU-heavy parsing in main thread; `await` inside `forEach` (runs sequentially).
- **Block:** P1.

### R100.25 — Cache stable data with explicit TTL
- **Flag:** hot endpoint querying data that changes < daily (gym config, workout templates, role lookups) without Redis/in-mem cache or HTTP `Cache-Control`.
- **Audit action:** Lens A flags as P2 with TTL recommendation.

### R100.26 — Media: compress + resize on upload; serve via CDN; WebP+fallback
- **Flag:** image upload handlers that store the original without `sharp` resize/compress; serving binary files from app server instead of object storage + CDN.
- **Block:** P1 for new upload paths.

### R100.27 — No polling for real-time
- **Flag:** `setInterval` hitting an API at < 60s cadence; identical query repeated within 1s window.
- **Block:** P2 — switch to WebSockets / Supabase Realtime / SSE.

---

## Category 4 — Concurrency & State

### R100.28 — Read-modify-write paths require optimistic locking or transactions
- **Flag:** counter increments, balance updates, status transitions, or aggregate recomputes without `version` field + WHERE-clause version check, OR not wrapped in a Prisma `$transaction`.
- **Block:** P0 on financial/payment paths; P1 otherwise.

### R100.29 — Idempotency keys on every payment + side-effecting external call
- **Flag:** any Stripe charge/subscription/payout without `idempotencyKey`; any non-idempotent webhook handler.
- **Block:** P0 — payments lose money silently otherwise.

### R100.30 — Every optimistic UI update has a rollback path
- **Flag:** state mutation preceding `await` without `.catch()` restoring prior state. (Frontend lane, but applies to any optimistic backend pre-flight too.)
- **Block:** P1.

### R100.31 — React hooks: correct dependency arrays
- **Flag:** `useEffect(() => {...}, [])` referencing state inside; `useCallback` with empty deps using changing values.
- **Block:** `eslint-plugin-react-hooks` set to `error`, not `warn`.

### R100.32 — Cleanup on unmount: AbortController + unsubscribe
- **Flag:** `useEffect` initiating fetch/subscription without a cleanup `return`.
- **Block:** P1.

---

## Category 5 — Error Handling & Observability

### R100.33 — Error boundaries around every major UI section
- **Flag:** route trees without an `ErrorBoundary` parent; backend services without a global exception filter (we have one — verify it stays).
- **Block:** P1.

### R100.34 — Structured logging, not `console.log`
- **Flag:** `console.log` / `console.error` in `src/` (except clearly-marked CLI tools and tests); missing user/request context on logs.
- **Block:** banned token at lint level. Logger of record: Pino (or whatever NestJS Logger is configured to).

### R100.35 — Timeouts on every external call
- **Flag:** `axios`/`fetch`/Stripe-SDK call without an explicit `timeout` value; default-no-timeout Mux uploads.
- **Block:** P0 — set 10s default, document any exception.

### R100.36 — No swallowed errors
- **Flag:** `catch (e) {}`, `catch (e) { console.log(e) }`, `.catch(() => undefined)`, `.catch(() => null)`. (We already ban `.catch(()=>undefined)` — extending here to all silent-swallow forms.)
- **Block:** P0.

### R100.37 — `/health` endpoint checking DB + critical dependencies
- **Flag:** no `/health` route; route exists but doesn't probe DB / external deps.
- **Block:** P1.

---

## Category 6 — Code Quality

### R100.38 — Comments explain WHY, not WHAT
- **Flag:** comment-to-code ratio > 1:3 in any file; comments that paraphrase the next line.
- **Audit action:** Lens B flags clusters; P3.

### R100.39 — YAGNI: no patterns without a present problem
- **Flag:** interface/impl pairs with one impl; abstract factories for one concrete type; repository pattern around 3 calls.
- **Audit action:** Lens A flags as P3 with simplification suggestion.

### R100.40 — Same-bug-everywhere: extract on first repetition under audit
- **Flag:** identical logic in 2+ files in the SAME PR; bug fix that only touches one of N duplicates.
- **Block:** P2 — fix all occurrences or extract.

### R100.41 — Don't reimplement libraries
- **Flag:** custom date math (use `date-fns` or `dayjs`); manual JWT decode (use library); hand-rolled debounce (use `lodash` or `radash`); custom validation (use Zod).
- **Audit action:** P2 if substantial; P3 if trivial.

### R100.42 — No defenses for impossible edge cases
- **Flag:** concurrency control on single-user paths; retry logic on synchronous code; integer-overflow guards on counters bounded by domain logic.
- **Audit action:** P3 — delete.

### R100.43 — Zero dead code
- **Flag:** unused imports, unreferenced exports, files with no callers, always-false feature flags, commented-out code blocks.
- **Block:** ESLint `no-unused-vars` + `no-unreachable` = error. `ts-prune` run weekly; backlog issues opened for findings.

---

## Category 7 — Data Integrity

### R100.44 — Multi-table writes in transactions
- **Flag:** any handler writing to 2+ tables without `prisma.$transaction([...])` or interactive transaction.
- **Block:** P0 on financial/payment/auth flows; P1 elsewhere.

### R100.45 — Soft deletes on business-critical entities
- **Flag:** hard `DELETE` on `User`, `Client`, `Coach`, `Workout`, `Payment*`, `Plan*`, `Application*`, or any table with audit/compliance requirements.
- **Block:** P1 — add `deletedAt` column and update queries to filter.

### R100.46 — DB-layer constraints mirror app validation
- **Flag:** numeric column without CHECK constraint where app validates a range; required field without NOT NULL; FK relation without FOREIGN KEY constraint; missing UNIQUE on natural keys.
- **Block:** P2 — added in same migration.

### R100.47 — Point-in-time recovery enabled + restore tested monthly
- **Flag:** Supabase PITR off; no documented recovery runbook; no restore test record in `operator-meta/runbooks/` within last 30 days.
- **Audit action:** operator-level concern, flagged by R100 audit, not blocking on a code PR.

---

## Category 8 — Infrastructure

### R100.48 — CI/CD enforced: lint → typecheck → test → build → deploy
- **Flag:** any merged PR that bypassed CI; missing pipeline stage; failed-but-merged commits.
- **Block:** branch protection rules require all checks green; auditor verifies branch protection state during R100 audit.

### R100.49 — Dev-only code excluded from production bundle
- **Flag:** mock adapters, fixtures, demo seeding, screenshot modes bundled in production; conditional `if (env === 'dev')` instead of build-time exclusion.
- **Block:** P2.

### R100.50 — Graceful degradation: non-critical services can fail
- **Flag:** uncaught throw when PostHog/Sentry/analytics is down; full app crash if Stripe is unavailable instead of payment-only impairment.
- **Block:** P1 — wrap non-critical calls; feature flags for integrations.

---

## Local-codebase rules (closing the regressions we measured)

### R100.A1 — Test:src line ratio ≥ 2.0 per PR (was 4.13, dropped to 1.11 — this restores the floor)
- **Metric:** `(test lines added) / (src lines added)` over PR diff, computed only over `.ts/.tsx/.js/.jsx` files in `src/` vs `test/` + `__tests__/` + `*.spec.*` + `*.test.*`.
- **Block:** ratio < 2.0 = P1 finding with required exception justification.
- **CI:** `r100-test-density` job computes the ratio and fails if below floor without `R100-A1-EXCEPTION` label.

### R100.A2 — Banned-cast substitution gate (closes the `as never` / `as unknown as` loophole)
- **Banned tokens (P0 in `src/` + `test/`):** `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(() => null)`, `.catch(()=>{})`, `Coming soon`.
- **Allowed:** `@ts-expect-error <reason>` on a single line with a non-empty reason; narrow concrete casts (`as User`, `as string`) where the underlying type is provably the target.
- **CI:** `r100-banned-tokens` job greps the PR diff for each token; any net addition = red.
- **Audit:** Lens A counts NET additions of each banned token per PR; > 0 = P0.

### R100.A3 — LOC soft cap (R86 reaffirmed and enforced)
- **≤ 400 prod LOC per PR** excluding tests, lockfiles, generated code, docs.
- **Over-cap = automatic P1 + R100/R86 Exception Request** with item-by-item no-waste justification + operator sign-off.
- **CI:** existing R86 LOC gate (to be added if not yet wired).

### R100.A4 — CI pass rate floor (closes the 67% → 59% regression)
- **Metric:** running 14-day window pass rate for `pull_request` event runs.
- **Floor:** ≥ 75%. Below floor for 7 consecutive days = automatic process-finding logged + dispatch pause until root cause identified (infra vs code quality).
- **Why:** flaky CI is a quality signal too — either tests are non-deterministic (code quality) or infra is unstable (operator concern); either way it stops being invisible.

### R100.A5 — Auditor verdict line (closes the silent-loop hole that almost cost us Wave 4)
- Every audit response MUST end with exactly one of:
  - `VERDICT: CLEAN`
  - `VERDICT: FINDINGS` (followed by P-rated, file:line, evidence)
  - `VERDICT: REFUSAL` (per R72/R87 with reason)
  - `VERDICT: INFRA_DEATH` (sandbox died, retry once)
- Anything else = STUCK and triggers operator notification per the overnight cron stuck-classifier.

---

## R100 self-check script

Builder/fixer runs this before push. Auditor runs it as evidence. CI runs it as gate.

Location (to be added): `scripts/r100-self-check.sh`

Outputs structured JSON listing every rule + PASS/FAIL/EXCEPTION_REQUESTED + evidence. PR description embeds the output; auditor verifies it matches reality.

(Script implementation in a follow-up PR — for now agents run the checks manually and document them in the PR description under an `R100 Self-Check` heading.)

---

## Brief preamble (paste into every audit + builder brief)

> **R100 Hyperscaler Quality Mandate is binding.** You will be evaluated against all 50 + 5 rules in `operator-meta/R100_HYPERSCALER_QUALITY_MANDATE.md`. Builder: run the R100 self-check before push; failing rules block the push unless you've authored an R100 Exception Request justifying the deviation item-by-item. Auditor: every report MUST include an R100 checklist section enumerating each rule as PASS / FAIL (with evidence) / N/A (with reason). End your response with the mandatory verdict line per R100.A5. R0 means ship correctly, not ship fast — a missing R100 check is itself a finding.

---

## Why this exists

We measured a 73% drop in test:src ratio, a doubling of banned-cast substitutions, a 12-point increase in over-cap PRs, and an 8-point CI pass-rate drop — all within the last 10 days. R100 is the response: every failure mode in the literature, plus every regression in our own data, becomes a numbered, gated, auditable rule. No more rule-gaming via substitution. No more silent test-density collapse. No more LOC creep. Apple, Google, and Notion do not have these regressions because they have these gates. Now we do too.

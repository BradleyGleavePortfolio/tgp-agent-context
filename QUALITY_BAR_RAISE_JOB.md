# QUALITY_BAR_RAISE_JOB — Hyperscaler Infrastructure Rollout

**Owner:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Authorized:** 2026-06-18 (operator approval of all 6 H-waves)
**Doctrine:** `/AGENT_RULES.md` R100–R107 + §12 (infra-as-doctrine)
**Repo:** `growth-project-backend` (https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git)

---

## Why This Document Exists

R100 (PROD READINESS BOARD) and R101–R107 codified WHAT hyperscaler quality means.
The 12 items in §12 (INFRA-AS-DOCTRINE) listed the table-stakes infra components.
This document is the executable build plan that translates both into 6 sequential
PR waves (H1–H6), with explicit scope, acceptance criteria, audit charter, and
operator decision points for each.

Any operator inheriting this thread reads this document second (after AGENT_RULES.md).
Any agent dispatched to build any H-wave reads its own section verbatim and obeys
the wave's scope contract.

R23 (LOC soft cap, 400 net LOC) applies to every wave. R14 (audit cycle) applies
to every wave. R86 (LOC cap on PRs) is non-negotiable — if a wave exceeds the cap,
it splits.

---

## Wave Summary Table

| Wave | Title | Risk | LOC est. | Wave 4 collision? | Status | Schedule |
|---|---|---|---|---|---|---|
| H1 | Config & policy files | LOW | ~250 | No | DISPATCHING TONIGHT | 2026-06-18 evening |
| H2 | CI workflows & branch protection | LOW-MED | ~350 | No | DISPATCHING TONIGHT | 2026-06-18 evening |
| H3 | Observability (Grafana, pg_stat, Sentry tags) | MED | ~300 | No | Queued | After Wave 4 lands |
| H4 | **PROD_READINESS_TEST (R100 flagship)** | HIGH | ~400 | Yes (touches services) | Queued | Operator-supervised |
| H5 | Persistent staging env + canary | HIGH | Infra-only | No | Queued | Operator-supervised |
| H6 | Audit log table + circuit breakers | HIGH | ~350 | Yes (touches PII services) | Queued | After H4 |

**Collision rule:** "Wave 4 collision" means the wave modifies files Wave 4 PRs are
likely touching (services, controllers, migrations). Collision waves wait until Wave 4
merges to avoid forced rebases on the 5-PR train.

---

## Universal Acceptance Criteria (every H wave must satisfy)

1. **R14 audit cycle:** dual auditor (Lens A + Lens B), no shortcuts, CLEAN_NO_FINDINGS on both before merge.
2. **R23 LOC cap:** net additions ≤ 400 LOC. If exceeded, split before audit.
3. **R3 identity:** every commit signed-or-explicit `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/Co-Authored tokens.
4. **R6 durability:** WIP push at scaffold, after each file, before any long command, before ready-for-audit.
5. **R100 self-check:** every wave's PR must NOT introduce new stub values that R100's test would flag (chicken-and-egg note: H4 ships R100 itself; H1–H3 ship without R100 but must not regress).
6. **R75 banned cast tokens:** zero net new `as any`, `as never`, `as unknown as`, `.catch(()=>undefined)` etc.
7. **R74 test:src ratio:** ≥ 2.0 over the diff (test lines / src lines added). For config-only waves (H1, H2 partial), this is N/A with documented justification.
8. **R101 PR template:** every wave's PR uses the new template (once H1 ships it; pre-H1 waves use ad-hoc PR body but mirror the same checklist).
9. **CI green:** all required checks pass. No `--admin` overrides, no force-push to `main`.
10. **DECISION_LOG entry:** wave completion appended to `handoffs/quality-bar-raise/DECISION_LOG.md` with commit SHA + audit verdicts.

---

# WAVE H1 — Config & Policy Files

**Risk:** LOW. Pure additive configuration. No runtime code paths touched. No migrations. No imports added to existing modules.

**LOC budget:** ~250 net (mostly config files + one workflow yaml).

**Wave 4 collision:** None — all new files in `.github/`, `.well-known/`, root config.

**Files added:**

| Path | Purpose | Rule |
|---|---|---|
| `.github/PULL_REQUEST_TEMPLATE.md` | Mandatory PR checklist mirroring R-rules | R101 |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Standardized bug surface | (supports R101) |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Standardized feature surface | (supports R101) |
| `.github/workflows/codeql.yml` | CodeQL `security-and-quality` queryset, JS/TS | R103 |
| `.editorconfig` | Indent + line-ending consistency | §12 |
| `.prettierrc.json` | Format config (if not already present; reconcile if so) | §12 |
| `.prettierignore` | Format exclusions | §12 |
| `.well-known/security.txt` | RFC 9116 disclosure contact (root-served via Next or Fly static) | §12 |
| `.well-known/ai.txt` | AI-training opt-out declaration | §12 |
| `renovate.json` | Renovate config (groups @types/*, auto-merge patch+minor, lockfile maintenance, weekly schedule) | §12 |
| `lefthook.yml` | Pre-commit hooks: banned-cast grep, tsc --noEmit on staged, eslint, prettier check | R104 |
| `.github/workflows/pr-size-labeler.yml` | Auto-label size/XS|S|M|L|XL based on diff LOC | R105 |

**Wave 4 collision check:** None of these files exist today (verified). Wave 4 PRs are not touching any of these paths.

**Acceptance criteria (H1-specific):**
- `codeql.yml` runs successfully on the PR itself (meta-validation).
- `lefthook` installation documented in README; `npm run prepare` (or pnpm equivalent) wires `lefthook install`.
- `renovate.json` validated by Renovate's config validator.
- `pr-size-labeler.yml` triggers and labels the PR with its own size (≤M expected).
- PR template renders correctly when opening a new PR (manual verification in GitHub UI by operator before merge).
- `.well-known/security.txt` includes a valid contact, expires field, preferred-languages, canonical URL.
- `.well-known/ai.txt` follows the current convention (opt-out for major crawlers).

**Audit charter (Lens A):**
- Verify no runtime code paths touched (`src/**` not modified except possibly a `prepare` script in `package.json`).
- Verify `lefthook.yml` banned-token list matches R75 verbatim.
- Verify `codeql.yml` actually runs the `security-and-quality` queryset (not just `default`).
- Verify `renovate.json` has `dependencyDashboard: true` and a CVE-priority schedule.

**Audit charter (Lens B):**
- Verify PR template mirrors every R-rule listed in R101.
- Verify size labeler thresholds match R105 (XS<50, S<150, M<300, L<400, XL≥400).
- Verify `.editorconfig` doesn't conflict with existing Prettier config (or reconcile cleanly).
- Verify all new files are committed to the repo, not workspace-only.

**Builder model:** Claude Opus 4.8.
**Audit models:** Lens A — Opus 4.8; Lens B — Opus 4.8 (independent subagents per R11).

**Operator decision points:**
- (D-H1-1) Approve security.txt contact email + expires date.
- (D-H1-2) Approve Renovate auto-merge policy for patch+minor (default proposal: yes for non-prod deps, no for runtime deps like Next/Nest/Stripe SDK).
- (D-H1-3) Verify PR template renders correctly in GitHub UI before merge.

**Estimated wall time:** 2-3 hours (dispatch + build + audit + fix loop + merge).

---

# WAVE H2 — CI Workflows & Branch Protection

**Risk:** LOW-MED. CI workflow additions are safe; branch protection itself is a one-time GitHub API call that changes who can merge to `main`.

**LOC budget:** ~350 net (workflows + branch-protection setup script + minor `package.json` changes).

**Wave 4 collision:** None — workflows are additive. Branch protection is applied AFTER Wave 4 merges (sequencing rule: protection activates post-Wave 4 to avoid blocking the 4 mergeable Wave 4 PRs).

**Files added:**

| Path | Purpose | Rule |
|---|---|---|
| `.github/workflows/migration-dry-run.yml` | Up + down + re-up migration dry-run on PRs touching `supabase/migrations/` | R106 |
| `.github/workflows/sbom.yml` | Generate SBOM via `anchore/sbom-action` on every build | §12 |
| `.github/workflows/release-please.yml` | Auto-CHANGELOG + auto-version from conventional commits | §12 (R81) |
| `.github/workflows/pr-checks-watcher.yml` | Posts PR comment distinguishing CI flake vs true fail | §12 |
| `.github/workflows/r100-quality-gate.yml` | Composite gate: lint + tsc + test + banned-token + size — required check | R102 supporting |
| `scripts/setup-branch-protection.sh` | One-shot script to apply R102 protection rules via `gh api` | R102 |
| `scripts/setup-branch-protection.README.md` | Documents the override procedure (`R102-override` issue + temp unprotect) | R102 |
| `.github/release-please-config.json` | Release-please config | §12 |
| `.github/.release-please-manifest.json` | Release-please manifest (initial version 0.1.0 or current) | §12 |
| `package.json` (modified) | Add `release-please` to scripts, add conventional-commits config | §12 |

**Wave 4 collision check:** `package.json` is the only potentially-touched file. Wave 4 PRs may also modify `package.json` (deps). Mitigation: H2 lands AFTER Wave 4's 4 mergeable PRs merge, OR H2 modifies `package.json` only in fields Wave 4 isn't touching (scripts section, not deps). Audit verifies.

**Acceptance criteria (H2-specific):**
- `migration-dry-run.yml` succeeds against current Supabase migrations (full forward + reverse + forward).
- `sbom.yml` produces a valid SPDX or CycloneDX artifact on every PR.
- `release-please.yml` opens a release PR on merge to `main` (validated by triggering manually post-merge).
- `setup-branch-protection.sh` is dry-run tested first (`--dry-run` flag prints what it WOULD do); only applied to `main` after operator approval.
- `r100-quality-gate.yml` composite check is added as a required status check ONLY after H4 lands (it references the prod-readiness test).
- Branch protection on `main` requires: `ci`, `codeql`, `r100-quality-gate` (when H4 lands), signed commits, linear history, NO admin bypass.

**Audit charter (Lens A):**
- Verify `migration-dry-run.yml` actually runs a reverse migration (not just forward).
- Verify `sbom.yml` artifacts are stored long enough for compliance (≥90 days retention).
- Verify `setup-branch-protection.sh` uses `gh api` with idempotent PATCH (not blind POST that fails on re-run).
- Verify NO admin bypass clause in branch-protection JSON (`enforce_admins: true`).

**Audit charter (Lens B):**
- Verify release-please config aligns with R81 SemVer rule (proper major/minor/patch from conventional commits).
- Verify `pr-checks-watcher.yml` distinguishes flake vs true fail with a documented heuristic (not "trust the agent's vibe").
- Verify `r100-quality-gate.yml` composite check is well-defined and doesn't silently skip on missing jobs.
- Verify operator override procedure in `setup-branch-protection.README.md` is unambiguous.

**Builder model:** Claude Opus 4.8.
**Audit models:** Lens A — Opus 4.8; Lens B — Opus 4.8.

**Operator decision points:**
- (D-H2-1) Approve initial SemVer version baseline for release-please (proposal: read current `package.json` version; if empty, start at `0.1.0`).
- (D-H2-2) **Branch protection activation timing.** Default: apply AFTER Wave 4's 4 mergeable PRs merge tomorrow. Approve, or approve immediate activation (risks blocking Wave 4 if any PR needs a force-push fix).
- (D-H2-3) Approve required status check list. Default: `ci`, `codeql`, `pr-size-labeler`. Add `r100-quality-gate` post-H4. Add `migration-dry-run` (conditional on path) post-H2.
- (D-H2-4) Renovate vs Dependabot — keep both or sunset Dependabot? Default: sunset Dependabot once Renovate is configured and produces its first grouped PR.

**Estimated wall time:** 3-4 hours.

---

# WAVE H3 — Observability

**Risk:** MED. Touches Sentry config, adds Prometheus client + metrics middleware, requires external accounts (Grafana Cloud, optional Honeycomb).

**LOC budget:** ~300 net.

**Wave 4 collision:** Likely none if Wave 4 has merged. Metrics middleware adds a NestJS interceptor — if Wave 4 PRs add new controllers, those automatically get covered, no rebase needed.

**Files added/modified:**

| Path | Purpose | Rule |
|---|---|---|
| `src/observability/metrics.module.ts` | Prometheus client setup (prom-client) | R85 |
| `src/observability/metrics.interceptor.ts` | Per-route latency histogram + request count + error class | R85 |
| `src/observability/metrics.controller.ts` | `/metrics` endpoint for Prometheus scrape | R85 |
| `src/main.ts` (modified) | Wire interceptor globally | R85 |
| `supabase/migrations/<timestamp>_enable_pg_stat_statements.sql` | Enable extension + create slow-query view | §12 |
| `scripts/weekly-slow-query-report.ts` | Cron-runnable report (top 20 slow queries from `pg_stat_statements`) | §12 |
| `.github/workflows/sentry-release.yml` (modified or new) | Tag every deploy with git SHA + version | §12 |
| `fly.toml` (modified) | Add `/metrics` private port for Grafana scrape | R85 |
| `docs/observability/README.md` | How metrics flow, dashboard URLs, SLO definitions | R85, R86 |

**Acceptance criteria (H3-specific):**
- `/metrics` endpoint returns Prometheus-formatted text and is NOT exposed publicly (private port or auth gate).
- Every route in the app emits: `http_requests_total{route, method, status}`, `http_request_duration_seconds_bucket{route, method}`, `http_errors_total{route, error_class}`.
- Grafana Cloud free-tier account configured + dashboard URL documented (operator provisions account; agent wires the scrape config).
- `pg_stat_statements` extension enabled in production Supabase (operator approves migration).
- Weekly slow-query cron runs and posts to a Slack channel or GitHub issue (operator picks).
- Sentry releases tagged with git SHA; sourcemap upload tied to release version.
- SLO definitions documented for the 5 highest-traffic routes (operator approves the SLO targets).

**Audit charter (Lens A):**
- Verify `/metrics` is NOT publicly exposed (Fly private port or auth middleware).
- Verify metrics interceptor doesn't add measurable latency (run benchmark, doc result).
- Verify `pg_stat_statements` view doesn't leak query plans containing PII (audit the view definition).
- Verify Sentry release tagging doesn't leak secrets in the release name.

**Audit charter (Lens B):**
- Verify Prometheus histogram bucket choices are sensible (operator-meta: SRE-grade buckets, e.g., `[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]`).
- Verify the weekly slow-query report deduplicates and ranks correctly.
- Verify documentation includes "how to add a new SLO" runbook.
- Verify integration tests for the metrics interceptor exist and prove the histograms are populated.

**Operator decision points:**
- (D-H3-1) Provision Grafana Cloud free tier (or Honeycomb free tier) account. Provide API key as Fly secret `GRAFANA_API_KEY`.
- (D-H3-2) Approve `pg_stat_statements` enablement migration on production Supabase. (Low risk — Supabase docs confirm safe.)
- (D-H3-3) Pick destination for weekly slow-query report: Slack channel | GitHub issue | email digest.
- (D-H3-4) Approve initial SLO targets for top 5 routes (proposal: API routes p99 < 500ms, auth routes p99 < 1s, webhook routes p99 < 2s, error rate < 0.1%, availability 99.9%).
- (D-H3-5) Confirm Sentry org + project (already in use — verify the deploy hook wiring).

**Estimated wall time:** 4-6 hours.

---

# WAVE H4 — PROD_READINESS_TEST (R100 Flagship)

**Risk:** HIGH (operator-supervised). This is the rule the operator invented. Botching it defeats its own purpose. Deserves the most careful execution.

**LOC budget:** ~400 net (test + config + provider wiring checks).

**Wave 4 collision:** Yes — touches a registry of services and may add hooks to PII-touching services. Lands AFTER Wave 4.

**Files added:**

| Path | Purpose | Rule |
|---|---|---|
| `test/deploy-readiness.spec.ts` | The single test that runs the full board | R100 |
| `test/prod-readiness.config.ts` | Registry of stub patterns, prod switches, OAuth/integration wirings | R100 |
| `test/prod-readiness/scanners/stub-scanner.ts` | Greps codebase for stub markers | R100.1 |
| `test/prod-readiness/scanners/switch-scanner.ts` | Reads env + asserts prod values | R100.2 |
| `test/prod-readiness/scanners/wiring-scanner.ts` | Asserts OAuth + webhook + integration secrets | R100.3 |
| `test/prod-readiness/reporters/board-reporter.ts` | Plain-text board output | R100.5 |
| `.github/workflows/r100-prod-readiness.yml` | Runs the test on every PR + as required check on production deploy | R100.6 |
| `scripts/prod-readiness-precheck.sh` | Quick local pre-commit version (`--quick` mode, stubs only) | R104 wiring |
| `docs/r100-prod-readiness.md` | How to register a new integration, switch, or stub pattern | R100.7 |

**Registered scan items (initial set — grows over time):**

*Stub patterns (file-content grep):*
- `STUB`, `MOCK`, `FAKE`, `PLACEHOLDER`, `TODO_BEFORE_PROD`, `XXX_REPLACE`
- `pk_test_`, `sk_test_`, `whsec_test_` (Stripe test keys in prod-bound code)
- `localhost:`, `127.0.0.1`, `example.com`, `example.org`
- `admin@example.`, `test@`, `noreply@example.`
- Mux test stream patterns
- Twilio sandbox numbers (`+15005550006` etc.)
- Sentry placeholder DSN patterns
- Hardcoded JWT secrets matching common test values

*Prod switches (env var asserts):*
- `STRIPE_LIVE_MODE` must be `true` in prod
- `SENTRY_ENABLED` must be `true`
- `RATE_LIMIT_ENABLED` must be `true`
- `SUPABASE_RLS_ENFORCED` must be `true`
- `EMAIL_PROVIDER` must NOT be `*-sandbox`
- `LOG_LEVEL` must be `info` or `warn` (not `debug`)
- `FEATURE_*` flags must each be in registry with explicit prod value
- `JWT_SECRET` must be set + length ≥ 32 + not the dev default
- `DATABASE_URL` must point to production Supabase (regex check)

*OAuth / integration wirings:*
- Google OAuth: `client_id` + `client_secret` + `redirect_url` matches prod host
- Apple OAuth: `team_id` + `key_id` + private key set
- Stripe: webhook endpoint registered + secret matches + signing version
- Mux: webhook secret + signing key
- SendGrid: API key + verified sender domain
- Twilio: account SID + auth token + verified number
- Dropbox Sign: API key + webhook secret
- Each integration prints: `<provider>: <status> — <specific missing piece or OK>`

**Acceptance criteria (H4-specific):**
- Running `npm run test:deploy-readiness` against the current dev env prints the full board, identifies known stubs (sanity check that the scanner works).
- Running against a simulated prod env (operator-provided fixture) returns exit 0 with ALL CLEAR.
- The scanner is fast: < 30s on the full codebase.
- New integrations added by any future PR fail audit unless `prod-readiness.config.ts` is updated in the same PR (R10/R11 auditor checklist item added).
- Documentation includes a worked example: "Adding a new Stripe webhook — checklist."

**Audit charter (Lens A):**
- Verify the stub scanner doesn't false-negative (test fixtures with each pattern; all must be caught).
- Verify the switch scanner correctly distinguishes prod vs non-prod env (NODE_ENV + FLY_REGION + DATABASE_URL pattern).
- Verify wiring scanner doesn't print secrets in the board output (only status + missing-piece names).
- Verify the test fails loudly (non-zero exit) when ANY red exists — no silent passes.
- Verify the registry pattern is extensible (new integrations require ≤10 LOC to add).

**Audit charter (Lens B):**
- Verify test:src ratio ≥ 2.0 (this IS a test — should be easy to hit).
- Verify board output is readable + copy-pasteable + non-JSON.
- Verify CI integration: warn on PR, hard-fail on deploy.
- Verify `r100-quality-gate.yml` composite check from H2 is updated to include this.
- Verify the documentation includes the operator's verbatim quote from AGENT_RULES.md R100.

**Operator decision points:**
- (D-H4-1) Approve initial registry of stub patterns (above list — expand?).
- (D-H4-2) Approve initial registry of prod switches (above list — add/remove?).
- (D-H4-3) Approve initial registry of integrations (above list — add Postmark, Loops, others if used?).
- (D-H4-4) Confirm enforcement timing: PR warn-only initially, hard-block on deploy from day one? Or hard-block both from day one?
- (D-H4-5) Where do board outputs get archived? (Proposal: artifact attached to each CI run + posted as PR comment.)

**Estimated wall time:** 6-8 hours (justified by importance; this is the flagship).

---

# WAVE H5 — Persistent Staging Environment

**Risk:** HIGH (operator-supervised). Not a code change — it's infra provisioning.

**LOC budget:** Infra only (Fly app + Supabase project + DNS + secrets) + a few config files referencing the staging targets.

**Wave 4 collision:** None — net-new environment.

**Provisioning tasks (sequence):**

1. **Fly app:** `fly apps create growth-project-backend-staging` (separate from prod app).
2. **Supabase project:** Create new project `growth-project-staging` (operator action — requires Supabase dashboard login).
3. **DNS:** `staging-api.<domain>` → Fly staging app.
4. **Secrets:** Mirror prod secret structure with staging values. Anonymized fixtures only — NO prod data copy.
5. **Migration parity:** Staging Supabase runs the same migrations as prod (CI workflow added in H2 already covers this).
6. **Smoke tests retarget:** Existing `scripts/smoke.ts`, `admin-federation-smoke.ts`, `stripe-webhook-smoke.ts` get a `--env=staging` flag. Default still runs against ephemeral.
7. **Canary deploy step:** Add `.github/workflows/canary-deploy.yml` — every merge to `main` deploys to staging first, runs smoke tests, then promotes to prod (manual approval).

**Acceptance criteria (H5-specific):**
- Staging Fly app responds at `staging-api.<domain>/healthz` with 200.
- Staging Supabase runs an identical migration set to prod (R106 dry-run passes).
- All smoke tests pass against staging with `--env=staging`.
- Canary deploy workflow runs end-to-end: PR merge → staging deploy → smoke green → manual promote → prod deploy.
- No prod data ever lands in staging (audit verifies Supabase fixtures are anonymized).

**Audit charter (Lens A):**
- Verify staging secrets are NOT the same as prod (no `STRIPE_LIVE_MODE=true` in staging).
- Verify staging Supabase has `RLS_ENFORCED=true` (test mode doesn't relax safety).
- Verify canary workflow can't accidentally promote a failing smoke run.
- Verify no prod webhook secrets leak into staging (separate Stripe/Mux/SendGrid test accounts).

**Audit charter (Lens B):**
- Verify smoke tests cover the same surface they cover in ephemeral CI today.
- Verify `--env=staging` flag is the ONLY toggle (no hidden env-detection logic).
- Verify documentation explains how to seed staging with anonymized fixtures.
- Verify the manual-approval gate is documented and tested.

**Operator decision points:**
- (D-H5-1) Approve creation of new Supabase project (paid plan? Free tier?).
- (D-H5-2) Approve creation of new Fly app (machine count + region).
- (D-H5-3) Approve DNS subdomain for staging (default: `staging-api.<your-domain>`).
- (D-H5-4) Approve test-account creation for Stripe/Mux/SendGrid/Twilio for staging.
- (D-H5-5) Confirm anonymization strategy for staging fixtures (proposal: generated via `@faker-js/faker`, never copied from prod).
- (D-H5-6) Manual-promote vs auto-promote-on-green for prod deploys.

**Estimated wall time:** 1-2 days (heavy operator involvement for account provisioning).

---

# WAVE H6 — Audit Log Table + Circuit Breakers

**Risk:** HIGH. Touches every PII service. Adds a runtime dependency on a new table. Circuit breakers change failure behavior of Stripe/Mux/external calls.

**LOC budget:** ~350 net.

**Wave 4 collision:** Yes — TM-8 (#449) is PII-heavy. H6 lands AFTER TM-8 ships (operator signs off).

**Files added/modified:**

| Path | Purpose | Rule |
|---|---|---|
| `supabase/migrations/<timestamp>_create_audit_log.sql` | `audit_log` table + indexes + RLS policies | R107 |
| `src/audit-log/audit-log.module.ts` | NestJS module | R107 |
| `src/audit-log/audit-log.service.ts` | `withAuditLog(action, target, fn)` helper | R107 |
| `src/audit-log/audit-log.types.ts` | Action enum + target classification | R107 |
| `src/<pii-services>/*.service.ts` (modified) | Wrap PII mutations with `withAuditLog` | R107 |
| `src/external/circuit-breaker.module.ts` | Opossum setup | §12 |
| `src/external/stripe.client.ts` (modified) | Wrap in circuit breaker | §12 |
| `src/external/mux.client.ts` (modified) | Wrap in circuit breaker | §12 |
| `src/external/sendgrid.client.ts` (modified) | Wrap in circuit breaker | §12 |
| `docs/audit-log.md` | How to wrap a new PII mutation | R107 |
| `docs/circuit-breakers.md` | Tuning thresholds, fallback behavior | §12 |

**Audit log schema (proposed):**

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL,  -- 'user' | 'admin' | 'system' | 'webhook'
  action TEXT NOT NULL,       -- 'create' | 'update' | 'delete' | 'access'
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  old_jsonb JSONB,
  new_jsonb JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_target ON audit_log(target_table, target_id);
CREATE INDEX idx_audit_log_at ON audit_log(at DESC);
-- RLS: only admins can read; service-role writes only
```

**Circuit breaker defaults (per external call):**
- `errorThresholdPercentage: 50` (trip after 50% errors over rolling window)
- `timeout: 10000` (10s, aligns with R66)
- `resetTimeout: 30000` (30s before half-open)
- `volumeThreshold: 10` (need 10 requests before tripping)
- Fallback: throw a typed `CircuitOpenError` (caught by middleware → 503 with retry-after).

**Acceptance criteria (H6-specific):**
- `audit_log` migration runs cleanly forward + reverse (R106 verifies).
- Every PII mutation in every service goes through `withAuditLog` (R10/R11 audit verifies).
- Audit log writes are async-fire-and-forget — failure to write does NOT fail the mutation (logged to Sentry).
- Circuit breakers measurably open under simulated Stripe failure (integration test required).
- Fallback behavior is graceful — user sees a 503 with retry-after, not a hang or generic 500.
- Documentation includes worked examples for both audit log + circuit breaker.

**Audit charter (Lens A):**
- Verify RLS on `audit_log` is strict (only admins read, only service role writes).
- Verify `old_jsonb` / `new_jsonb` do NOT contain raw PII (must be classified + redacted per R98).
- Verify circuit breaker state is per-instance (not shared) OR explicitly distributed (Redis-backed).
- Verify circuit breaker doesn't mask security errors (a 401 from Stripe is NOT a "transient failure").
- Verify withAuditLog wrapping is on EVERY PII mutation (zero misses).

**Audit charter (Lens B):**
- Verify integration test for audit log writes exist for each PII service.
- Verify integration test for circuit breaker trip + recover exists.
- Verify the `withAuditLog` helper is genuinely reusable (no per-service variants).
- Verify documentation covers the "what NOT to wrap" cases (idempotent reads, public endpoints).

**Operator decision points:**
- (D-H6-1) Approve `audit_log` table schema (additions/removals from proposal above).
- (D-H6-2) Approve circuit breaker default thresholds (above) or adjust per-provider.
- (D-H6-3) Approve PII classification map (which services are PII-touching — operator confirms).
- (D-H6-4) Approve retention policy for `audit_log` (proposal: 7 years for healthcare-adjacent, 2 years otherwise).
- (D-H6-5) Approve sync vs async audit log writes (proposal: async with Sentry on write failure).

**Estimated wall time:** 1-2 days.

---

# Cross-Wave Dependencies

```
H1 (configs) ──────────────────┐
                               │
H2 (CI workflows) ─────────────┼─→ H3 (observability) ─→ H4 (R100 flagship)
   (needs PR template from H1) │                                  │
                               │                                  ↓
                               └────────────────────────→ H5 (staging) ─→ H6 (audit log + circuit breakers)
                                                                                      ↑
Wave 4 must merge ─────────────────────────────────────────────────────────── (TM-8 must merge first)
```

**Critical path:** Wave 4 → H1 → H2 → H4. Everything else can parallelize once those four ship.

---

# Schedule Estimate

| Wave | Earliest start | Earliest finish | Operator hours needed |
|---|---|---|---|
| H1 | 2026-06-18 evening | 2026-06-18 late evening | 0.5 (decision points only) |
| H2 | 2026-06-18 evening (parallel with H1) | 2026-06-19 morning | 0.5 |
| H3 | 2026-06-19 afternoon (post Wave 4) | 2026-06-20 | 2 (Grafana provisioning) |
| H4 | 2026-06-19 afternoon (post Wave 4) | 2026-06-21 | 2 (registry approval) |
| H5 | 2026-06-21 | 2026-06-23 | 4 (account provisioning) |
| H6 | 2026-06-23 (post TM-8) | 2026-06-25 | 2 (PII classification approval) |

**Full Wave H rollout:** ~7 days end-to-end, with the operator-supervised waves (H4, H5, H6) representing the majority of operator time.

---

# Tracking & Status

| Wave | PR | Status | Audit Lens A | Audit Lens B | Merged | Notes |
|---|---|---|---|---|---|---|
| H1 | TBD | DISPATCHING | — | — | — | Tonight |
| H2 | TBD | DISPATCHING | — | — | — | Tonight |
| H3 | — | QUEUED | — | — | — | Post Wave 4 |
| H4 | — | QUEUED | — | — | — | Post Wave 4 — flagship |
| H5 | — | QUEUED | — | — | — | Operator-supervised infra |
| H6 | — | QUEUED | — | — | — | Post TM-8 + H4 |

Update this table on every wave milestone. Append every audit verdict + commit SHA + decision to `handoffs/quality-bar-raise/DECISION_LOG.md`.

---

# References

- `/AGENT_RULES.md` — the constitution (R1–R107)
- `/operator-meta/R100_AUDIT_CHECKLIST_TEMPLATE.md` — audit checklist applied to every wave
- `/operator-meta/BRIEF_PREAMBLE_R100.md` — embedded verbatim in every wave's builder + auditor brief
- `/handoffs/overnight-2026-06-19/DECISION_LOG.md` — overnight Wave 4 decisions (separate from Wave H)
- `/handoffs/quality-bar-raise/DECISION_LOG.md` — TO BE CREATED (Wave H decisions)

---

*Owner:* Bradley Gleave <bradley@bradleytgpcoaching.com>
*Plan authored:* 2026-06-18 PM
*Doctrine basis:* AGENT_RULES.md R100–R107 (commit ddedf63)
*This document is the master build plan. Every Wave H builder, auditor, and operator reads this in full before dispatching their wave.*

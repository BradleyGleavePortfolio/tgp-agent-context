# HK-3a Backend Fixer Brief — R2 (Opus 4.8)

**Source brief:** This document. Pin to commit SHA at time of dispatch (R55).
**Authored:** 2026-06-01 by current operator after R64 rescue of prior-session audit findings.
**Builder model:** Opus 4.8 (Bradley directive: builders/fixers are Opus 4.8 always).
**You are NOT an auditor.** R31/R32: auditor ≠ builder. The R1 auditor was GPT-5.5.

---

## 1. PR under fix

- **Repo:** `BradleyGleavePortfolio/growth-project-backend`
- **PR:** #356 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/356
- **Branch:** `hk/PR-HK-3a-fitness-bucket`
- **Title:** `PR-HK-3a: H&F bucket UI + samples API + WearablesShell`
- **Label:** `hk-phase-2a`
- **Pinned head SHA (R55, 40-char):** `85d1111d1bb8becde8a2cbf680a6d127fe5cde46`
- **Base SHA:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
- **CI state at audit:** RED — `build-and-test` failed 4m54s. Run ID: 26796308624.
- **CI failure log:** `gh run view 26796308624 --repo BradleyGleavePortfolio/growth-project-backend --log-failed`

---

## 2. ABSOLUTE RULES (read before touching code)

### Commit author — EVERY commit
```
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R1 fixes — Prisma e2e + cross-provider agg + freshness + 400 envelope"
```
Title-only. **NO** `Co-Authored-By`, **NO** `Generated-By`, **NO** body. One squashable commit is fine.

### Bradley LAW (R0 Decacorn)
> "ABSOLUTELY NOTHING SHOULD BE COMING SOON OR A SILENT FAILURE — ALL OF THIS IS BUILT TO LAUNCH QUALITY, DECACORN QUALITY, POLISHED AND COMPLETE"

**Banned in any code, comment, test title, or string literal:**
- "Coming soon" / "TODO: implement" / "Not yet implemented"
- `@ts-ignore`, `@ts-nocheck`, `as any`
- `.catch(() => undefined)`, `catch (e) {}`, `catch (e) { console.log(e) }` — **R65 / 50-Failures #36, P1**
- Silent fallbacks that mask backend errors
- Spinner-only states with no error or empty branch

**Required pattern for "best-effort secondary write":** log with structured context (NO PII) inside the inner catch, then **always rethrow** so the outer caller sees the failure. From R65 verbatim.

### R0 decision filter
At every choice point ask: **What would Apple, Notion, or Google do?** If the answer doesn't survive that crit, iterate. Specifically for this backend PR:
- **Google:** error-rate engineering, structured logging, observability budgets, parameterized queries always, status-code semantics matter (400 ≠ 403 ≠ 503).
- **Apple:** error response shape is part of the user-facing surface — every error must be classifiable and copy-quality on the client.
- **Notion:** API contracts are documented (OpenAPI), idempotent where the verb implies idempotency (DELETE).

### Auth & environment
- GitHub: `bash` with `api_credentials=["github"]`. Token is `$GITHUB_TOKEN`. Use `gh` CLI. **Never** print the token. **Never** run `gh auth status`.
- **Disk at ~93%** — do NOT `npm ci` from scratch. The worktree at `/tmp/wt-hk3a-backend` already has `node_modules` (or a working symlink). If it's truly missing, use `npm ci --cache /tmp/npm-cache-fixer-be` (isolated cache per R-parallel-agent landmine).

### R55 pinning
You start at SHA `85d1111d1bb8becde8a2cbf680a6d127fe5cde46`. If `git rev-parse HEAD` shows anything else, STOP and report `BLOCKED+wrong_starting_sha`.

### Landmines (must respect)
- `.git/info/exclude` silently ignores files. Before `git add -A`, run `git ls-files --others --exclude-standard` and `git check-ignore -v <each-new-file>`. Use `git add -f` if needed. (HK-3a almost shipped without 8 files this way.)
- `gh pr merge --match-head-commit` requires full 40-char SHA (short SHA → `GitObjectID coerce` error). You won't merge — but you'll capture the new SHA so the audit/merge step has it.

---

## 3. R65 — 50-Failures sweep checklist (run BEFORE you push)

Scan your diff for every line and flag if any of these patterns exist (P0 → fix immediately, P1 → fix unless documented exemption):

| # | Pattern | Severity |
|---|---|---|
| #1 | Hardcoded secrets / keys / tokens in source | 🔴 P0 |
| #2 | Missing RLS on new Prisma tables (N/A here — no schema changes expected, verify) | 🔴 P0 |
| #3 | SQL injection via string concatenation or `Prisma.raw('${userInput}')` | 🔴 P0 |
| #5 | IDOR — endpoint accepts resource ID without verifying authenticated user owns it | 🔴 P0 |
| #6 | Missing input validation (no Zod / DTO / class-validator on body or query) | 🔴 P0 |
| #7 | Unhandled async rejection / missing `await` on a promise that mutates state | 🟠 P1 |
| #36 | Silent failures / swallowed errors (`.catch(()=>undefined)`, `catch(e){}`) | 🟠 P1 |
| — | `as any` / `@ts-ignore` / `@ts-nocheck` | 🟠 P1 |
| — | Magic numbers / strings used to make logic work without a named constant | 🟡 P2 |
| — | Missing OpenAPI decorators on a controller method (`@ApiBearerAuth`, `@ApiQuery`, `@ApiOkResponse`, error responses) | 🟡 P2 |
| — | Test title containing "Coming soon" or "TODO" | 🔴 P0 (Bradley LAW applies to test output too) |

You will run this sweep again right before `git push`. Any P0/P1 you don't fix must be in `DEFERRED` with a one-line reason — and that reason must be defensible to Bradley.

---

## 4. FINDINGS TO FIX (verbatim from R1 GPT-5.5 audit)

### P0 (blocker) — must fix

**P0 #1 — Fake Prisma integration test**
- **File:** `test/wearables/samples-integration.spec.ts:10-18`
- **Issue:** Hand-rolled fake replaces the required Prisma-backed integration test. Does not exercise raw SQL/`date_trunc`, enum casts, real Prisma query shape, or DST bucketing.
- **Fix:** Replace with a real e2e/Prisma integration test:
  1. Seed real rows: `WearableConnection`, `WearableSample`, `WearableUserMetricPreference` for Oura + Whoop.
  2. Execute the service/controller against Prisma (no fakes for repo layer).
  3. Assert actual daily aggregation output and DST-boundary correctness (cross a US DST boundary, assert the bucket count and timestamps).
- **If repo has no live Postgres in the jest harness:** use a containerized test DB (testcontainers) OR move this to `*.e2e-spec.ts` with appropriate config (matches existing `test/jest-e2e.json` pattern if present).
- **Last-resort fallback (must be documented in-file with a TODO referencing this brief):** make the test invocation pattern faithful enough that the builder-brief §integration-test contract holds, and document the gap explicitly. This is acceptable ONLY if a containerized DB cannot be set up within the fix window; default to doing it right.

### P1 (major) — must fix

**P1 #1 — Cross-provider aggregation wrong when `preferredOnly=false`**
- **File:** `src/wearables/samples/wearable-samples.service.ts:190-207, 272-279`
- **Issue:** Code uses `rows.length > 0 ? rows[0].provider : null` so buckets scope to only the first provider while `sample_count`/`samples` include all. Response shape is inconsistent across `preferredOnly` modes.
- **Fix:** Aggregate across ALL returned providers (compare-all mode) OR return provider-partitioned buckets. The brief's response envelope must remain consistent across both `preferredOnly` modes.
- **Test:** add a unit test that requests `preferredOnly=false` with multi-provider data and asserts the response shape matches the `preferredOnly=true` shape (modulo provider field).

**P1 #2 — Freshness omits connected providers with zero bucket samples**
- **File:** `src/wearables/samples/wearable-samples.service.ts:362-367`
- **Issue:** `inBucket.has(c.provider) || c.last_synced_at === null` hides connected-but-synced-zero-data providers.
- **Fix:** Include every non-disconnected connected provider relevant to the bucket. A provider connected and synced should appear in freshness even if its bucket sample count is zero.
- **Test:** add a test asserting a connected provider with non-null `last_synced_at` and zero bucket samples appears in the freshness array.

**P1 #3 — Connection status ignored when computing freshness**
- **File:** `src/wearables/samples/wearable-samples.service.ts:335-342, 371-380`
- **Issue:** SELECT lists only `{provider, last_synced_at}` so expired/error connections with recent `last_synced_at` report as `current`.
- **Fix:** SELECT `status` from `WearableConnection`. Any non-`connected` and non-`disconnected` state (e.g. `expired`, `error`, `revoked`) MUST force the freshness tier to `needs_attention` regardless of recency.
- **Test:** add a test where a connection has `status=expired` and `last_synced_at=now()`, and assert freshness reports `needs_attention`.

**P1 #4 — Raw SQL interpolation violates parameterized-binding contract (R65 #3 + #36)**
- **File:** `src/wearables/samples/wearable-samples.service.ts:283-297`
- **Issue:** Uses `` Prisma.raw(`'${metric}'`) `` and `` Prisma.raw(`'${provider}'`) ``. This is a real SQL-injection-class risk if `metric`/`provider` ever flow from user input without Zod validation, **which they do here** via the controller query DTO.
- **Fix:** Use Prisma-bound parameters with explicit enum casts. Prefer pattern:
  ```ts
  Prisma.sql`${metric}::"WearableMetric"`  // bound, cast
  Prisma.sql`${provider}::"WearableProvider"`
  ```
  Reserve `Prisma.raw` for server-controlled SQL identifiers/functions only (column names, function names) — never for values that originated from a request.
- **Test:** add a test that feeds a malicious string (e.g. `"FOO'; DROP TABLE…"`) through the controller and asserts the request is rejected by Zod (400 BadRequest), never reaching the SQL layer. This double-binds defense.

**P1 #5 — Metric/bucket mismatch returns 403 instead of 400**
- **File:** `src/wearables/samples/wearable-samples.service.ts:91-95`
- **Issue:** `ForbiddenException` with `WEARABLE_SAMPLES_FORBIDDEN` conflates authorization failure with query validation failure.
- **Fix:** Move cross-field metric-vs-bucket validation into a Zod `superRefine` on the GET query DTO (preferred — matches the brief's locked envelope). If that's not practical in the time window, throw `BadRequestException` with code `WEARABLE_SAMPLES_QUERY_INVALID`.
- **Update tests:** any test currently asserting 403 on this path must be updated to assert 400.

### P2 (fix if cheap, OK to defer with documented reason)

**P2 #1 — OpenAPI under-described**
- **Files:**
  - `src/wearables/samples/wearable-samples.controller.ts:9-20`
  - `src/wearables/preferences/preferences.controller.ts:12-24`
- **Fix:** Add `@ApiBearerAuth()`, `@ApiQuery()` for each query param, `@ApiBody()` where applicable, `@ApiOkResponse({ type: … })`, and documented 400/403/503 responses via `@ApiResponse`.
- **Why P2 not P1:** ships without breaking, but R0 Notion test fails (API not documented properly).

**P2 #2 — DELETE preference is non-idempotent**
- **File:** `src/wearables/preferences/preferences.service.ts:76-84`
- **Fix:** Return 204 No Content for already-absent rows (matches builder brief: "Removes override; subsequent reads fall back"). Unless an existing test explicitly requires 404, change to 204.
- **Why P2:** correctness gap but no user-facing failure in current call sites.

### P3 (skip — audit noted as soft)
- Misleading "FIRST action" comment. **Skip.**

---

## 5. CI investigation (do this first, before fixes)

```bash
cd /tmp/wt-hk3a-backend
git rev-parse HEAD   # MUST be 85d1111d1bb8becde8a2cbf680a6d127fe5cde46

gh run view 26796308624 --repo BradleyGleavePortfolio/growth-project-backend --log-failed > /tmp/be-ci-fail.log 2>&1 || true
head -200 /tmp/be-ci-fail.log
```

**Interpret:**
- If the CI red is HK-3a-introduced (touches `wearables/samples`, `wearables/preferences`, or the new test file): **fix it. It's covered by P0/P1 above or is a new finding you must add.**
- If it's a pre-existing failure on `main` unrelated to HK-3a (audit noted: possible `ConnectorRegistry` export from `WearablesModule`): verify by checking out the base SHA `a73b02f21dffb711f5b6634abdf2ac5f52eec310` and confirming the same failure exists there. If so, document it in `UNRELATED_PRE_EXISTING_TOUCHED` and DO NOT expand scope.

Pre-existing jest failures on main (per UPDATE_2.md): **17 byte-for-byte identical failures** in scheduling/openapi/roles. HK-3a adds zero regressions. Match this expectation.

---

## 6. Workflow (do in this order)

```bash
cd /tmp/wt-hk3a-backend
git status --short        # must be clean
git rev-parse HEAD        # must be 85d1111d…cde46

# 1. CI investigation (above) — capture log
# 2. Apply P1s first (smaller, faster feedback)
#    Order: P1 #5 (400 envelope) → P1 #4 (raw SQL bind) → P1 #1 (agg) → P1 #2 (freshness coverage) → P1 #3 (status)
# 3. P0 #1 (Prisma e2e) — invasive, last
# 4. P2s (only if low-cost)

# After each fix, run the relevant test(s):
npx jest test/wearables/samples-integration.spec.ts --runInBand
npx jest test/wearables --runInBand
# etc.

# Final gate sweep (REQUIRED before push):
npx prisma validate
npx tsc --noEmit
npx eslint src --max-warnings=0
npx jest --runInBand
npx nest build

# R65 50-Failures sweep — re-read §3 above and grep your diff:
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "\.catch\(\s*\(\)\s*=>" || echo "ok no silent catches"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "as any|@ts-ignore|@ts-nocheck" || echo "ok no ts escapes"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "Coming soon|TODO: implement" || echo "ok no placeholders"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "Prisma\.raw\(.*\\\$\{" || echo "ok no raw interp"

# Verify nothing being silently ignored
git ls-files --others --exclude-standard
git status --short

git add -A
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R1 fixes — Prisma e2e + cross-provider agg + freshness + 400 envelope"

git push origin hk/PR-HK-3a-fitness-bucket
git rev-parse HEAD   # capture for NEW_SHA in deliverable

gh pr view 356 --repo BradleyGleavePortfolio/growth-project-backend \
  --json headRefOid,mergeStateStatus,statusCheckRollup
```

---

## 7. DELIVERABLE (return EXACTLY this — no preamble, no postscript)

```
FIXED_FINDINGS:
- P0 #1 (Prisma e2e): <one-line summary>
- P1 #1 (cross-provider agg): <fix>
- P1 #2 (freshness zero-data coverage): <fix>
- P1 #3 (freshness status check): <fix>
- P1 #4 (raw SQL bound params): <fix>
- P1 #5 (400 vs 403 envelope): <fix>
- P2 #1 (OpenAPI): <FIXED|DEFERRED + why>
- P2 #2 (DELETE idempotency): <FIXED|DEFERRED + why>

R65_50_FAILURES_SWEEP:
- silent catches scanned: 0 found | <N> fixed
- as any / ts-ignore: 0 found | <N> fixed
- raw SQL interpolation: 0 remaining | <N> converted to bound params
- input validation on every endpoint: <verified/gaps>
- IDOR check on every resource-ID endpoint: <verified/gaps>

UNRELATED_PRE_EXISTING_TOUCHED:
- <list anything outside HK-3a scope, with reason — should normally be EMPTY>

GATES_AFTER_FIX:
- prisma validate: <pass/fail>
- tsc: <pass/fail>
- eslint src: <pass/fail>
- jest: <N passed, M failed>  # M should be 0 OR equal to the 17 pre-existing main failures
- nest build: <pass/fail>

NEW_SHA: <40-char>
CI_AFTER_PUSH: <IN_PROGRESS|PASS|FAIL+reason>

STATUS: READY_FOR_R2 | BLOCKED+<reason>
```

If you cannot fix a P0 or P1, STATUS: `BLOCKED+<reason>` and stop. **Do not push red unless** the only red is a pre-existing main failure unrelated to HK-3a — and that must be documented in `UNRELATED_PRE_EXISTING_TOUCHED`.

---

## 8. Why each fix matters (R0 grounding)

- **P0 #1:** Apple test — a fake integration test is a competence-engineering failure. Prisma + DST + enum casts ARE the integration surface. If the test doesn't exercise them, the product fails on production data.
- **P1 #4:** Google test — `Prisma.raw('${userInput}')` is the textbook OWASP-#1 pattern (50-Failures #3). At enterprise scale this WILL be exploited.
- **P1 #5:** Notion test — API verbs and status codes are part of the contract. 403 means "you're not allowed" and triggers logout flows on the client. 400 means "your input was malformed." Confusing them ruins client error UX.
- **P1 #1/#2/#3:** Apple test — freshness is a visible UI signal. If "current" actually means "this provider hasn't synced for a week but the row says so anyway," the user is being lied to.

**End of brief. Execute now.**

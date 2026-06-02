# HK-3a Backend Fixer Brief — R3 (Opus 4.8)

**Source brief:** This document. Pin to commit SHA at dispatch (R55).
**Authored:** 2026-06-01 after R2 GPT-5.5 audit returned NEEDS_FIX.
**Builder model:** Opus 4.8 (Bradley directive).
**R31/R32:** You are NOT an auditor.

---

## 1. PR

- Repo: `BradleyGleavePortfolio/growth-project-backend`
- PR: #356 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/356
- Branch: `hk/PR-HK-3a-fitness-bucket`
- **Pinned head SHA (R55, 40-char):** `0d52e16aa4865bde33ce936f03a6ea59bde48260`
- Base SHA: `a73b02f21dffb711f5b6634abdf2ac5f52eec310`

---

## 2. R2 audit summary

R1 P0 + 5 P1 + 2 P2 verified fixed EXCEPT two PARTIALs and 3 NEW findings.

**R1 PARTIALs you must close:**
- P0 #1 Prisma e2e — current test mocks Prisma client (validates SQL template/binds). Audit calls this PARTIAL — gap is no live PG execution. **Decision:** add a **testcontainers-based live PG e2e** if the repo's jest harness supports it (check `test/jest-e2e.json`, `docker-compose.test.yml`, or existing `*.e2e-spec.ts` with `setupFiles` that spin up PG). If no such harness exists and adding one is out-of-scope for this PR, DOCUMENT the rationale clearly in the test file (one paragraph, no "TODO: implement" phrasing — describe what it asserts today and what a future PR would add). Mark as DOCUMENTED in deliverable.
- P2 #1 OpenAPI 200 schema — add `@ApiOkResponse({ type: <DTO> })` with response DTO classes. Create response DTOs if missing.

**NEW findings:**
- **P1 NEW #1 (DATA INTEGRITY):** `src/wearables/samples/metric-bucket.map.ts:24` misclassifies `RESTING_HEART_RATE_BPM` as `HEALTH_FITNESS`. Authoritative seed (`prisma/migrations/20260531000000_wearables_foundation/migration.sql:404`) has it in `SLEEP_RECOVERY`. **Fix:** either mirror the seed bucket exactly, OR replace the static map by querying `WearableMetricDef` from Prisma at module init (cache result). Mirroring the seed is the lower-risk path for this PR — do that, and add a runtime sanity check on module bootstrap that asserts the in-memory map matches `prisma.wearableMetricDef.findMany()`.
- **P1 NEW #2:** `wearable-samples.service.ts:344-352` hardcodes SUM/AVG, ignoring seeded per-metric aggregation (`last`, `max`). **Fix:** use `WearableMetricDef.aggregation`. Build an in-memory map on module init (or fetch lazily and cache) keyed by metric → aggregation enum. Add exhaustive TypeScript switch to ensure every `WearableMetricAggregation` value is handled.
- **P2 NEW #1:** `wearable-samples.service.ts:375-380` returns every non-disconnected connection in freshness regardless of bucket. **Fix:** filter freshness to providers relevant to the requested bucket (those that produce ANY metric in `METRIC_BUCKET[bucket]`), while keeping the R1 #2 zero-data behavior (connected+synced+zero-bucket-samples still appears).

---

## 3. ABSOLUTE RULES (unchanged from R2)

- Commit author EVERY commit: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO trailers.
- Bradley LAW: NO "Coming soon", NO silent failures, NO `@ts-ignore`/`@ts-nocheck`/`as any`, NO `.catch(()=>undefined)`.
- R65 sweep on full diff before push.
- R55: start at `0d52e16a…`. If `git rev-parse HEAD` differs, STOP + `BLOCKED+wrong_starting_sha`.
- Disk at ~93%: do NOT `npm ci` from scratch. Existing worktree has `node_modules` if it was preserved.
- GitHub auth: `bash` with `api_credentials=["github"]`. Use `gh`. Never print `$GITHUB_TOKEN`. Never run `gh auth status`.
- `.git/info/exclude` landmine: `git ls-files --others --exclude-standard` before staging; `git check-ignore -v` on any new file.

---

## 4. R65 50-Failures sweep (clean slate this round)

The R2 audit found:
- 0 secrets, 0 SQL injection, 0 IDOR, 0 input gaps, 0 silent catches, 0 `as any` (src), 0 ts-ignore, 0 banned phrases, rate limits verified, 0 TOCTOU.
- 5 test-only `:any` annotations exist (`spec.ts` files). Optional cleanup — type those test fixtures (use `Prisma.WearableSampleGetPayload<…>` shapes). If trivial, do it. Otherwise leave.
- 2 deferred-TODO comments in `samples-integration.spec.ts:33,37` — these are documentation comments referencing this brief, NOT "TODO: implement" placeholders. Rephrase to descriptive prose (e.g. "Future containerized-PG e2e would seed via Prisma migrate + assert live `date_trunc` output") — Bradley LAW reads test-file COMMENTS narrowly, but be defensive.

Run before push:
```bash
cd /tmp/wt-hk3a-backend
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "\.catch\(\s*\(\)\s*=>" || echo "ok no silent catches"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "as any|@ts-ignore|@ts-nocheck" || echo "ok no ts escapes"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "Coming soon|TODO: implement" || echo "ok no placeholders"
git diff a73b02f21dffb711f5b6634abdf2ac5f52eec310...HEAD | grep -nE "Prisma\.raw\(.*\\\$\{" || echo "ok no raw interp"
```

---

## 5. Workflow

```bash
# Worktree
cd /tmp/wt-hk3a-backend 2>/dev/null || {
  git clone --filter=blob:none https://x-access-token:$GITHUB_TOKEN@github.com/BradleyGleavePortfolio/growth-project-backend.git /tmp/gpb-clone
  cd /tmp/gpb-clone && git fetch origin hk/PR-HK-3a-fitness-bucket
  git worktree add /tmp/wt-hk3a-backend 0d52e16aa4865bde33ce936f03a6ea59bde48260
  cd /tmp/wt-hk3a-backend
}
git rev-parse HEAD   # MUST equal 0d52e16aa4865bde33ce936f03a6ea59bde48260

# Order:
#  1. P1 NEW #1: metric-bucket.map.ts fix + bootstrap sanity check
#  2. P1 NEW #2: WearableMetricDef.aggregation wiring
#  3. P2 NEW #1: freshness bucket filter
#  4. P2 #1: OpenAPI response DTOs + @ApiOkResponse
#  5. P0 #1: testcontainers OR documented prose

# Tests:
npx jest test/wearables --runInBand
# If you wire testcontainers, run the new e2e in isolation first:
npx jest test/wearables/samples-live.e2e-spec.ts --runInBand

# Gate sweep:
npx prisma validate
npx tsc --noEmit
npx eslint src --max-warnings=0
npx jest --runInBand
npx nest build

# R65 grep set (above)
# Stage check:
git ls-files --others --exclude-standard
git status --short

git add -A
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R2 fixes — metric-bucket map + aggregation from def + freshness bucket filter + OpenAPI 200 DTOs"
git push origin hk/PR-HK-3a-fitness-bucket
NEW_SHA=$(git rev-parse HEAD); echo "$NEW_SHA"

gh pr view 356 --repo BradleyGleavePortfolio/growth-project-backend \
  --json headRefOid,mergeStateStatus,statusCheckRollup
```

---

## 6. Deliverable (return EXACTLY this block — no preamble/postscript)

```
FIXED_FINDINGS:
- P1 NEW #1 (RESTING_HEART_RATE_BPM bucket): <fix + bootstrap sanity-check approach>
- P1 NEW #2 (aggregation from def): <fix + exhaustiveness approach>
- P2 NEW #1 (freshness bucket filter): <fix>
- P2 #1 (OpenAPI 200 schema): <DTOs added>
- P0 #1 (Prisma e2e): <testcontainers added | documented prose; rationale>

R65_50_FAILURES_SWEEP:
- silent catches scanned: 0 | <N>
- as any / ts-ignore: 0 in src | <N in tests cleaned>
- raw SQL: 0 remaining
- input validation: verified
- IDOR: verified
- "Coming soon" / "TODO: implement": 0 (incl. test files)

GATES_AFTER_FIX:
- prisma validate / tsc / eslint / jest (N pass, M=17 pre-existing fail) / nest build: <pass/pass/pass/pass/pass>

UNRELATED_PRE_EXISTING_TOUCHED: <list or EMPTY>

NEW_SHA: <40-char>
CI_AFTER_PUSH: <state>
STATUS: READY_FOR_R3_AUDIT | BLOCKED+<reason>
```

If you cannot close a P0/P1, `STATUS: BLOCKED+<reason>` and stop.

Execute now.

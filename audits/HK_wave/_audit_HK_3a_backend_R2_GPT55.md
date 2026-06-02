# HK-3a Backend — R2 Code-Depth Audit (GPT-5.5)

**PR:** BradleyGleavePortfolio/growth-project-backend #356
**Pinned SHA (R55):** `0d52e16aa4865bde33ce936f03a6ea59bde48260`
**Base SHA:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
**Auditor model:** GPT-5.5 (general_purpose)
**Date:** 2026-06-01

---

## VERDICT: NEEDS_FIX

## R1_FINDINGS_VERIFICATION
- **P0 #1 (Prisma e2e):** PARTIAL+gap — `test/wearables/samples-integration.spec.ts:14-19` documents no live Postgres and `:37-41` defers the real migrate/seed/live-engine e2e. Current test validates the real service SQL template/bind vector, NOT a real Prisma/Postgres execution.
- **P1 #1 (cross-provider agg):** VERIFIED_FIXED — `src/wearables/samples/wearable-samples.service.ts:199-224` aggregates across all providers, `provider_used` null when multi; test at `test/wearables/samples-integration.spec.ts:244-268`.
- **P1 #2 (freshness zero-data):** VERIFIED_FIXED — service `:380-386` selects all non-disconnected connections; test at `test/wearables/wearable-samples.service.spec.ts:135-156`.
- **P1 #3 (freshness status):** VERIFIED_FIXED — `:386,404-410` selects status, forces `needs_attention` for non-connected; tests `:173-204`.
- **P1 #4 (raw SQL bind):** VERIFIED_FIXED — `:306-328` binds metric/provider/window with enum casts; controller test `:146-153` rejects malicious metric pre-SQL.
- **P1 #5 (400 envelope):** VERIFIED_FIXED — Zod superRefine 400 at `dto/get-samples.query.ts:61-72`; defense-in-depth `BadRequest` at service `:94-98`.
- **P2 #1 (OpenAPI):** PARTIAL+gap — bearer/query/body/error decorators present, but 200 response types are descriptions-only with no schema at `samples.controller.ts:107` and `preferences.controller.ts:73`.
- **P2 #2 (DELETE idempotency):** VERIFIED_FIXED — `preferences.service.ts:78-87` deleteMany + no-op log; controller returns 204 at `:90-113`.

## NEW_FINDINGS
- **P1 NEW #1:** `src/wearables/samples/metric-bucket.map.ts:24` misclassifies `RESTING_HEART_RATE_BPM` as `HEALTH_FITNESS` while the authoritative seed has it in `SLEEP_RECOVERY` (`prisma/migrations/20260531000000_wearables_foundation/migration.sql:404`). **Fix:** mirror `WearableMetricDef.bucket` or query the seeded def table.
- **P1 NEW #2:** `wearable-samples.service.ts:344-352` hardcodes SUM for four metrics and AVG for the rest, despite the seed declaring per-metric aggregation including `last`/`max` at migration `:396-402`. **Fix:** consume `WearableMetricDef.aggregation`, or maintain an exhaustively-typed map and add a compile-time exhaustiveness check.
- **P2 NEW #1:** `wearable-samples.service.ts:375-380` ignores the `bucket` parameter and returns every non-disconnected connection in freshness. **Fix:** filter by provider/bucket capability while retaining zero-sample relevant providers.

## R65 50-Failures Sweep
- secrets in source: none
- SQL injection patterns remaining: none exploitable; `Prisma.raw` retained only for server allow-listed aggFn at `:322`
- IDOR on new endpoints: verified safe (`assertCoachOwnsClient` first action; preferences scoped to `req.user.id`)
- input validation gaps: none
- silent catches: 0
- `as any` / `ts-ignore`: 0 in src; 5 test-only `:any` annotations at `wearable-samples.service.spec.ts:75,245` and `preferences.service.spec.ts:14,26,32`
- "Coming soon" / placeholders in code or test titles: 0 banned phrases; 2 deferred-TODO comments at `samples-integration.spec.ts:33,37`
- rate limiting on new endpoints: verified
- TOCTOU races: none

## CI Verification
- Only 17 pre-existing main failures present (module-graph / openapi-spec / roles-enforced / scheduling.service — all cascade from pre-existing ConnectorRegistry module-graph bug). No new failures.

## STATUS: NEEDS_R3_FIX

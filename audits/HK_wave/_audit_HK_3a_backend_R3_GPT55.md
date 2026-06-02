# HK-3a Backend — R3 Code-Depth Audit (GPT-5.5)

**PR:** BradleyGleavePortfolio/growth-project-backend #356
**Pinned SHA (R55):** `14aa1454c3dc4ec21260d2ea6025d177e8564184`
**Base SHA:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
**Auditor model:** GPT-5.5
**Date:** 2026-06-02
**Verdict:** NEEDS_FIX (R4)

## R2 NEEDS_FIX items
All VERIFIED_FIXED:
- P1 NEW #1 RHR bucket + onModuleInit sanity (throws on drift): VERIFIED_FIXED (`metric-bucket.map.ts:48-54`, `wearable-samples.service.ts:140-167`)
- P1 NEW #2 aggregation from def + exhaustive switch with `never` arm: VERIFIED_FIXED (`metric-bucket.map.ts:76-81,105-136`; `wearable-samples.service.ts:414-480,481-486`)
- P2 NEW #1 freshness bucket filter (preserves zero-data coverage): VERIFIED_FIXED (`wearable-samples.service.ts:523-596`)
- P2 #1 OpenAPI 200 DTOs: VERIFIED_FIXED (`samples.controller.ts:109-112`, `preferences.controller.ts:76-79`)
- P0 #1 documented prose: VERIFIED_FIXED (`test/wearables/samples-integration.spec.ts:13-51`)

## NEW finding — P1
`src/wearables/samples/wearable-samples.service.ts:113-128` catches **any** `WearableMetricDef.findMany` error and silently falls back to compile-time mirrors. Also `:130-132` only warns when the defs table is empty.

This handles **DB-unreachable** correctly, but **masks** non-connectivity errors (schema mismatch, permission denied, seed drift, malformed enum), turning real config bugs into silent fallbacks. Sanity check is bypassed in those cases. R65 #36 in a different shape.

### Fix
Narrow the catch to **connectivity-class errors only**. Prisma error code surface:
- `P1001` (can't reach DB)
- `P1002` (DB timeout)
- `P1008` (operation timed out)
- `P1011`/`P1017` (TLS/connection closed)

Pattern:
```ts
try {
  const defs = await this.prisma.wearableMetricDef.findMany();
  if (defs.length === 0) {
    this.logger.error('WearableMetricDef table empty at boot — seed not applied');
    throw new Error('WearableMetricDef seed missing');
  }
  this.assertMetricMapMatchesSeed(defs);
} catch (err) {
  if (isConnectivityError(err)) {
    this.logger.warn('WearableMetricDef sanity check skipped — DB unreachable at boot; using compile-time mirrors', { err });
    return; // fail-open ONLY for connectivity
  }
  // schema/permission/seed errors must propagate
  this.logger.error('WearableMetricDef sanity check failed', { err });
  throw err;
}
```

Add `isConnectivityError(err: unknown): boolean` returning true for `PrismaClientInitializationError` and `PrismaClientKnownRequestError` codes `P1001|P1002|P1008|P1011|P1017`.

Empty-table case should THROW (not warn-return) — empty defs table is a real config bug, not a connectivity issue.

## R65 50-Failures Sweep
- secrets: none
- SQL injection: none
- IDOR: verified safe
- input validation: verified
- silent catches: 0 (the broad onModuleInit catch flagged above is *behavior*, not pattern — R65 cares about both)
- `as any` / `ts-ignore`: 5 test-only `:any` (pre-existing fixtures); 0 in src
- "Coming soon" / "TODO: implement": 0
- onModuleInit DB unreachable: handled
- **onModuleInit non-connectivity errors: SILENTLY SWALLOWED → P1 above**
- exhaustiveness `never` arm: verified compiles, unreachable

## CI
17 pre-existing failures (module-graph / openapi-spec / roles-enforced / scheduling). No new wearables failures.

## STATUS: NEEDS_R4_FIX

# HK-3a Backend R4 code audit

**Pinned HEAD SHA:** `92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df`  
**Base SHA:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`  
**Repo / PR:** `BradleyGleavePortfolio/growth-project-backend` PR #356, branch `hk/PR-HK-3a-fitness-bucket`  
**Audit worktree:** `/tmp/wt-hk3a-backend-r4-audit`

## Per-item verification table

| Item | Status | Evidence |
|---|---:|---|
| R3 P1: `onModuleInit` catch narrowed to connectivity-class errors only | VERIFIED_FIXED | `isConnectivityError` only accepts `PrismaClientInitializationError` or `PrismaClientKnownRequestError` codes `P1001/P1002/P1008/P1011/P1017` (`src/wearables/samples/wearable-samples.service.ts:66-90`); `onModuleInit` only returns on connectivity and rethrows all other errors (`src/wearables/samples/wearable-samples.service.ts:147-183`). |
| Empty `WearableMetricDef` table fails loud | VERIFIED_FIXED | Empty defs log and throw `WearableMetricDef seed missing` (`src/wearables/samples/wearable-samples.service.ts:155-161`); unit test covers it (`test/wearables/wearable-samples.service.spec.ts:621-625`). |
| Non-connectivity / drift errors rethrow | VERIFIED_FIXED | Non-connectivity branch logs and `throw err` (`src/wearables/samples/wearable-samples.service.ts:176-183`); tests cover P2002 and seed/map drift (`test/wearables/wearable-samples.service.spec.ts:628-653`). |
| R3 P1 tests covering catch branches | VERIFIED_FIXED | Five tests cover initialization error, known connectivity code, empty seed, non-connectivity known error, and drift (`test/wearables/wearable-samples.service.spec.ts:583-654`). |
| R4 supplemental: Prisma enum adds `SLEEP_DURATION_MIN`, `SLEEP_ONSET_ISO`, `SLEEP_WAKE_ISO` | VERIFIED_FIXED | Schema enum contains all three keys (`prisma/schema.prisma:5021-5023`); migration uses `ALTER TYPE ... ADD VALUE IF NOT EXISTS` for each (`prisma/migrations/20261211000000_add_sleep_consistency_metrics/migration.sql:16-18`). |
| R4 supplemental: seed rows added for three sleep-consistency metrics | VERIFIED_FIXED | Seed migration inserts all three as `SLEEP_RECOVERY`, with aggregations `sum/last/last` (`prisma/migrations/20261211000001_seed_sleep_consistency_metric_defs/migration.sql:14-18`). |
| R4 supplemental: TS bucket map and aggregation mirror updated | VERIFIED_FIXED | Bucket map places all three in `SLEEP_RECOVERY` (`src/wearables/samples/metric-bucket.map.ts:42-44`); aggregation map uses `sum/last/last` (`src/wearables/samples/metric-bucket.map.ts:136-140`). |
| R4 supplemental: 6 new spec tests | VERIFIED_FIXED | `metric-bucket.map.spec.ts` has six tests for new key bucket membership, enumeration, aggregation, seed rows, seed aggregation, and ALTER TYPE migration (`test/wearables/metric-bucket.map.spec.ts:22-93`). |
| R2/R3: RHR bucket remains fixed | VERIFIED_FIXED | `RESTING_HEART_RATE_BPM` maps to `SLEEP_RECOVERY` (`src/wearables/samples/metric-bucket.map.ts:54-60`) and aggregation is `avg` (`src/wearables/samples/metric-bucket.map.ts:127`). |
| R2/R3: aggregation switch exhaustive with `never` arm | VERIFIED_FIXED | `aggSqlExprFor` handles `sum/avg/max/last` and default assigns to `const exhaustive: never` (`src/wearables/samples/wearable-samples.service.ts:533-553`). |
| R2/R3: freshness bucket filter intact | VERIFIED_FIXED | Freshness collects bucket-specific and any-sample provider sets, filters through `isProviderRelevantToBucket`, and retains zero-data providers (`src/wearables/samples/wearable-samples.service.ts:588-662`); tests cover exclude-other-bucket and keep-zero-data (`test/wearables/wearable-samples.service.spec.ts:499-536`). |
| R2/R3: OpenAPI DTOs intact | VERIFIED_FIXED | Samples controller uses `@ApiOkResponse({ type: SamplesResponseDto })` (`src/wearables/samples/wearable-samples.controller.ts:109-112`); response DTOs mirror runtime Zod schema (`src/wearables/samples/dto/sample-response.dto.ts:21-220`). Preferences endpoint has typed body/response docs (`src/wearables/preferences/preferences.controller.ts:61-79`, `src/wearables/preferences/dto/upsert-preference.dto.ts:50-70`). |
| IDOR / authz / input validation | VERIFIED_FIXED | Samples endpoint is `JwtAuthGuard` guarded, coach/client path checks `assertCoachOwnsClient` before reading (`src/wearables/samples/wearable-samples.controller.ts:52-54`, `src/wearables/samples/wearable-samples.service.ts:257-260`, `326-349`); query schema is strict, typed, window-capped, and rejects metric/bucket mismatch (`src/wearables/samples/dto/get-samples.query.ts:35-73`). Preferences writes are scoped to `req.user.id` with strict schemas (`src/wearables/preferences/preferences.controller.ts:50-91`, `src/wearables/preferences/dto/upsert-preference.dto.ts:12-28`). |

## NEW findings

None. No P0/P1/P2/P3 findings introduced by PR #356 at the pinned SHA.

## R65 50-failures sweep results

| Sweep | Result |
|---|---|
| Silent failures / empty catch / `.catch(()=>undefined)` | PR-changed `src` files: **0**. Whole `src`: **24**, all pre-existing versus base (`hk3a_backend_r4_r65_compact_counts.txt`). |
| `as any` / `@ts-ignore` / `@ts-nocheck` | PR-changed `src` files: **0**. Whole `src`: **38**, all pre-existing versus base (`hk3a_backend_r4_r65_compact_counts.txt`). |
| `Coming soon` / `TODO: implement` in src and test titles | PR-changed `src` files: **0**. Whole `src`: **1**, pre-existing versus base (`src/gym/gym-distribution.service.ts:9`). Test titles: **0**. |
| `onModuleInit` fail-open scope | Pass: only connectivity errors fail open (`src/wearables/samples/wearable-samples.service.ts:169-175`); empty seed/non-connectivity/drift rethrow. |
| Migration safety | Pass: additive `ALTER TYPE ... ADD VALUE IF NOT EXISTS`; no destructive ops in the two R4 supplemental migrations. |
| Enum exhaustiveness | Pass: `Record<WearableMetricType, ...>` maps compile; aggregation switch has `never` default arm. |
| New enum key agreement | Pass: schema enum, ALTER migration, seed rows, bucket map, aggregation map, and tests agree on all three new keys. |
| IDOR / authz / input validation | Pass, no new gap found. |
| Secrets | No hardcoded secrets found in PR-changed files. Broad search only found placeholder/example strings and test fixture values. |

## CI / gate status

| Gate | Status | Notes / saved output |
|---|---:|---|
| `npx prisma validate` | PASS | Required dummy local `DATABASE_URL`/`DIRECT_URL` env for validation; output saved to `/home/user/workspace/hk3a_backend_r4_prisma_validate.log`. |
| `npx tsc --noEmit` | PASS | Output saved to `/home/user/workspace/hk3a_backend_r4_tsc.log`. |
| `npx eslint src --max-warnings=0` | FAIL (pre-existing unrelated warnings) | 15 warnings in unrelated files; output saved to `/home/user/workspace/hk3a_backend_r4_eslint.log`. PR-changed source files pass `eslint --max-warnings=0`; output saved to `/home/user/workspace/hk3a_backend_r4_eslint_changed_files.log`. |
| `npx jest --runInBand` | EXPECTED FAIL | 17 failures across 4 suites, matching the task's “17 pre-existing main failures expected”; 313 suites passed. Output saved to `/home/user/workspace/hk3a_backend_r4_jest.log`. |
| `npx nest build` | PASS | Output saved to `/home/user/workspace/hk3a_backend_r4_nest_build.log`. |
| GitHub PR checks | FAIL | `build-and-test` failed on GitHub; output saved to `/home/user/workspace/hk3a_backend_r4_gh_checks.log`. No PR-scope P0/P1/P2 was identified locally. |

## Final verdict

**CLEAN** — zero PR-scope P0/P1/P2 findings at pinned SHA `92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df`.

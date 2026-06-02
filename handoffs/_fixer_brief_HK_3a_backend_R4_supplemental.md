# HK-3a Backend — R4 SUPPLEMENTAL Fixer Brief (Sleep Enum Add)

**PR:** BradleyGleavePortfolio/growth-project-backend #356
**Branch:** `hk/PR-HK-3a-fitness-bucket`
**Pin from SHA (R55):** `23fc58ac4d4b4c5d15a8c16fa67950fdbead3658` (R4 head)
**Base:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
**Model:** Opus 4.8
**Round:** R4-supplemental

## Why this exists

HK-3b PR #223 (recovery bucket) imports three sleep metric keys that exist in **neither** backend nor mobile until now. Mobile R4 added them (per mobile R4 brief). Backend must mirror EXACTLY so the keys flow on the wire when HK-3b lands.

Semantic intent (from HK-3b `recoveryData.ts`):
- `SLEEP_DURATION_MIN`: **total time asleep in minutes** (distinct from existing `SLEEP_TOTAL_MIN` which represents total time in bed)
- `SLEEP_ONSET_ISO`: bedtime encoded as **local minutes-of-day** (value column is numeric minutes, not ISO string despite the suffix — naming follows the established backend convention for time-of-day keys)
- `SLEEP_WAKE_ISO`: wake-time encoded as local minutes-of-day, same convention

## Bradley R0 LAW
- NO "Coming soon", silent failures, `as any`, `@ts-ignore`, `catch(e){}`, `.catch(()=>undefined)`, spinner-only empty states.
- Bans apply to test titles too.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By.

## Required changes

### 1. Prisma schema enum
`prisma/schema.prisma` — `enum WearableMetricType`. Add (within the `── Sleep & Recovery ──` block, in this order, after `SLEEP_AWAKE_MIN`):
```prisma
  SLEEP_DURATION_MIN
  SLEEP_ONSET_ISO
  SLEEP_WAKE_ISO
```

### 2. Migration
Create a new Prisma migration `prisma/migrations/<timestamp>_add_sleep_consistency_metrics/migration.sql` adding the 3 enum values to the existing Postgres enum type. Use `ALTER TYPE "WearableMetricType" ADD VALUE 'SLEEP_DURATION_MIN'` (and the other two), each as a separate statement — Postgres requires this for enum additions.

The migration MUST be reviewable (no destructive ops, idempotent if possible — use `ALTER TYPE ... ADD VALUE IF NOT EXISTS` since we're on Postgres 12+).

### 3. TS enum mirror
The compile-time mirror in `src/wearables/samples/metric-bucket.map.ts` (or wherever the union/map lives — search for `SLEEP_TOTAL_MIN` to locate). Add the 3 new keys to:
- the `WearableMetricType` union/const map
- the bucket mapping: all three belong to the `sleep` bucket
- the aggregation strategy mapping:
  - `SLEEP_DURATION_MIN`: `sum` over the night, then daily-latest (treat like other `_MIN` durations)
  - `SLEEP_ONSET_ISO`: `latest` per day (a point-in-time minute-of-day value)
  - `SLEEP_WAKE_ISO`: `latest` per day

  If the existing aggregation switch uses a `never` arm, the new keys MUST appear before the `never` exhaustiveness check.

### 4. Seed
`prisma/seed.ts` (or wherever `WearableMetricDef` seed rows live — search for `SLEEP_TOTAL_MIN`). Add 3 new rows mirroring the existing sleep metric defs structure:
- `SLEEP_DURATION_MIN`: unit `min`, bucket `sleep`, aggregation `sum`/`last_per_day` matching mirror
- `SLEEP_ONSET_ISO`: unit `min_of_day` (or whatever the existing convention is for time-of-day — match `SLEEP_TOTAL_MIN`'s pattern if no clearer precedent exists), bucket `sleep`, aggregation `latest`
- `SLEEP_WAKE_ISO`: same as ONSET

If any tests fixture-mirror these defs (search `WearableMetricDef.*Seed` or `wearableMetricDefSeed`), update those too.

### 5. assertMetricMapMatchesSeed
The onModuleInit drift check (`assertMetricMapMatchesSeed`) — since we're adding both to seed and mirror together, the check should pass cleanly after this change. Verify with a dry-run unit test or by running the existing spec.

### 6. Unit tests
Add a test asserting:
- The 3 new keys are present in the bucket map under `sleep`
- The aggregation strategy mapping returns the expected strategy for each
- The seed array contains all 3 defs

Test titles MUST NOT contain banned phrases.

## Gates (all must pass)
```
npx prisma validate
npx prisma format
npx tsc --noEmit
npx eslint src --max-warnings=0
npx jest --runInBand
npx nest build
```

17 pre-existing main failures expected — verify by stash-diff if any new failures appear.

## R65 50-Failures sweep mandatory.

## Constraints
- Touch only: prisma/schema.prisma, the new migration file, the TS mirror file, prisma/seed.ts, related test files.
- Do NOT modify the migration timestamp format (Prisma owns this — use `npx prisma migrate dev --name add_sleep_consistency_metrics --create-only` to generate, then ensure the SQL matches the spec above).
- Do NOT touch controllers, DTOs, or mobile code.
- Title-only commit: `PR-HK-3a: add SLEEP_DURATION_MIN / SLEEP_ONSET_ISO / SLEEP_WAKE_ISO metrics`
- Push with `--force-with-lease`.

## Deliverable
Write `_fixer_result_HK_3a_backend_R4_supplemental.md` to `/home/user/workspace/`:
- New head SHA (40-char)
- Files changed (paths)
- Migration filename
- Test output
- Gate confirmations
- R65 sweep
- Any deviations

## STATUS expected
CLEAN. Goal: wire-format parity with mobile so HK-3b imports resolve end-to-end.

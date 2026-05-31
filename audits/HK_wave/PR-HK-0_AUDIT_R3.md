# PR-HK-0 R3 Audit
**SHA:** 2cc36d27142e708e8140b597d9a0fd4c8eaa7db5
**Auditor model:** GPT-5.5
**Date:** 2026-05-31
**Verdict:** CLEAN

**R1 findings status:**
- P1-#1 (token RLS): FIXED — migration lines 420-459 now revoke table-wide `SELECT` on `public."WearableConnection"` from `authenticated, anon`, grant `authenticated` column-level `SELECT` only on safe columns, create `public."WearableConnectionSafe" WITH (security_invoker = true)`, and grant the safe view to `authenticated`. The safe projection includes `id`, `user_id`, `provider`, `external_account_id`, `access_token_expires_at`, `scopes`, `webhook_subscription_id`, `channel_expires_at`, `status`, `last_error`, `last_synced_at`, `backfilled_until`, `disconnected_at`, `created_at`, and `updated_at`; it excludes all four sensitive columns: `encrypted_refresh_token`, `encrypted_access_token`, `credentials_secret_ref`, and `webhook_secret_ref`. The schema comment above `encrypted_refresh_token` documents that the encrypted token and secret-pointer columns are service-role-only and that coach/client reads use `WearableConnectionSafe`.
- P1-#2 (transactional): FIXED — `IngestionService.ingest()` wraps `wearableSample.createMany`, `wearableConnection.updateMany`, and insight-cache invalidation in `this.prisma.$transaction(async (tx) => { ... }, { timeout: 10_000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })`. All three write paths use `tx.*` inside the callback, and `invalidateInsightCache(samples, tx)` accepts a transaction client. Tests assert `$transaction` is called with the expected options, that the three side effects are bracketed by transaction boundaries, and that an in-transaction failure propagates before cache invalidation runs.
- P1-#3 (error logging): FIXED — validation is wrapped in a redacted `logger.error({ msg: 'wearables.ingest.validation_failure', user_id, provider, submitted_count, error_message })` before rethrow, and transaction failures are logged with `msg`, `user_id`, `provider`, `submitted_count`, `connection_count`, `error_code`, and `error_message` before rethrow. The success path emits one redacted `wearables.ingest.success` log. Tests cover success logging, DB failure log-then-rethrow, validation failure log-then-rethrow, and absence of raw sample fields in success logs.
- P2-#1 (Date validation): FIXED — `resolveBest()` now rejects non-`Date` or invalid/NaN `startAt` and `endAt` via `instanceof Date` plus `Number.isNaN(date.getTime())` before building Prisma filters; tests cover invalid `startAt` and invalid `endAt` and assert no Prisma query is issued.

## Regression check

- SHA was verified exactly: `git rev-parse HEAD` returned `2cc36d27142e708e8140b597d9a0fd4c8eaa7db5`.
- Base unchanged: `a80013f` resolves to `a80013fb4a3995212f8da434eafa3276aa029894`, and the merge-base of base and audited head is the same base commit.
- Tracked diff vs base remains confined to the original 13 PR-HK-0 files with no new tracked files:

```text
A  prisma/migrations/20260531000000_wearables_foundation/migration.sql
M  prisma/schema.prisma
M  src/app.module.ts
A  src/wearables/connectors/connector.interface.ts
A  src/wearables/http/provider-http-client.spec.ts
A  src/wearables/http/provider-http-client.ts
A  src/wearables/ingestion/dedup.util.spec.ts
A  src/wearables/ingestion/dedup.util.ts
A  src/wearables/ingestion/ingestion.service.spec.ts
A  src/wearables/ingestion/ingestion.service.ts
A  src/wearables/normalization/normalizer.types.ts
A  src/wearables/wearables.constants.ts
A  src/wearables/wearables.module.ts
```

- `git diff --stat a80013f..2cc36d2` reports 13 files changed and 2,440 insertions, with no deletions. The schema diff is additive: `258 insertions, 0 deletions` for `prisma/schema.prisma`; the only post-R1 schema edit is the security comment above token columns.
- R2 changes over the R1 head touch only 4 existing PR files: the migration, `schema.prisma`, `ingestion.service.ts`, and `ingestion.service.spec.ts`.
- Wearables schema shape remains unchanged from R1 clean aspects: 3 enums (`WearableProvider`, `WearableMetricBucket`, `WearableMetricType`) and 6 models (`WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableUserMetricPreference`). Enum counts remain 15 provider values, 2 bucket values, and 26 metric values.
- Migration still seeds 26 `WearableMetricDef` rows.
- RLS still has `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` for all 6 wearable tables.
- New commits after R1 are authored and committed by `Dynasia G <dynasia@trygrowthproject.com>` and have no co-author trailers:
  - `9a231f36c864a2f490f4b9e88d2cc15ff3282a74` — `fix(wearables): PR-HK-0 — column-level GRANTs + safe view for WearableConnection tokens`
  - `2cc36d27142e708e8140b597d9a0fd4c8eaa7db5` — `fix(wearables): PR-HK-0 — transactional ingest, error-path logging, resolveBest Date validation`
- No `toBeDefined` placeholder assertions were found in `src/wearables`.
- Note: the local working tree had two pre-existing untracked root-level verification files (`h4_redis_down_verify.ts`, `h4_throttle_runtime_verify.ts`). They are not part of the tracked SHA-pinned diff and were not modified for this audit.

## Gates

| Gate | Command | Result |
|---|---|---|
| Prisma validate | `DATABASE_URL='postgresql://x:x@localhost:5432/x' DIRECT_URL='postgresql://x:x@localhost:5432/x' npx prisma validate` | PASS — schema valid |
| Prisma migrate diff | `DATABASE_URL='postgresql://x:x@localhost:5432/x' DIRECT_URL='postgresql://x:x@localhost:5432/x' npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma` | PASS — exit 0; DDL diff rendered |
| Prisma generate | `npx prisma generate` | PASS — Prisma Client v6.19.3 generated |
| TypeScript | `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` | PASS — exit 0 |
| ESLint | `npx eslint src/wearables/` | PASS — exit 0 |
| Jest | `npx jest --roots src/wearables --runInBand` | PASS — 3 suites, 52/52 tests passed |

## New findings

None.

## Conclusion

PR-HK-0 is **CLEAN** at `2cc36d27142e708e8140b597d9a0fd4c8eaa7db5`. The R1 P1 findings are fixed with schema-level token-column protection, transactional ingestion, and redacted error-path logging; the P2 Date-validation nit is fixed; the tracked write-set remains confined to the expected 13 files; RLS/seed/schema clean aspects hold; and all required gates pass.

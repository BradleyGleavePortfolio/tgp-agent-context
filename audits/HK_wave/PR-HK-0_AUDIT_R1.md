# PR-HK-0 R1 Audit
**SHA:** 66658eaba5486a1e5a209f76c899747e677da775
**Auditor model:** GPT-5.5
**Date:** 2026-05-31
**Verdict:** NOT CLEAN

## Write-set verification

Pinned head was fetched from `origin hk/PR-HK-0-foundation` and checked out at `66658eaba5486a1e5a209f76c899747e677da775`. Base `a80013f` resolves to `a80013fb4a3995212f8da434eafa3276aa029894`.

Commit metadata:
- `2615bf910f76229a0710a9b5ae54e8e4ceb66c82` — Author/Committer `Dynasia G <dynasia@trygrowthproject.com>`; no trailers.
- `66658eaba5486a1e5a209f76c899747e677da775` — Author/Committer `Dynasia G <dynasia@trygrowthproject.com>`; no trailers.

Diff vs `a80013f` is confined to the expected PR-HK-0 write-set (13 physical files; 11 grouped write-set bullets in the plan):

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

`git diff --stat a80013f..66658eab` reports 2,133 insertions and 0 deletions. `origin/main` is still `a80013f`, so there is no overlap with newer main changes.

Schema/migration verification:
- `prisma/schema.prisma` adds the 3 expected enums: `WearableProvider` (15 values), `WearableMetricBucket` (2 values), and `WearableMetricType` (26 values).
- The 6 expected models are present: `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, and `WearableUserMetricPreference`.
- `User` receives additive wearables back-relations only.
- `dedup_key` is unique, hot-path indexes are present, and all declared FKs are indexed.
- Migration enables and forces RLS for all 6 new tables and seeds 26 `WearableMetricDef` rows.
- The 5 RLS helper functions are present via `CREATE OR REPLACE`.

Quality gates run by auditor:
- `npx prisma validate` passed after setting local placeholder `DATABASE_URL` and `DIRECT_URL`.
- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma` passed.
- Initial `tsc` failed because the checked-out workspace had a stale generated Prisma client; after `npx prisma generate`, `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit -p tsconfig.json` passed.
- `npx eslint` on all touched TypeScript files passed.
- `npx jest --roots src/wearables --runInBand` passed: 3 suites, 43/43 tests.
- No `toBeDefined` placeholder assertions were found in the touched files.

## Findings

### P0 (blocking)

None.

### P1 (must-fix before merge)

1. **`WearableConnection` RLS does not actually prevent coach/client reads of encrypted token columns through table access.** `WearableConnection` stores `encrypted_refresh_token` and `encrypted_access_token` in `prisma/schema.prisma:5046-5052`, and the migration creates `wc_client_all` and `wc_coach_select` table-level policies in `prisma/migrations/20260531000000_wearables_foundation/migration.sql:302-311`. The comment says controller projection enforces “never token columns,” but PR-HK-0 ships no controller or safe view, and the migration contains no column-level `REVOKE`/`GRANT` or projection object. RLS filters rows, not columns, so the schema/RLS gate does not satisfy the audit requirement that no coach/client policy can read `encrypted_*` columns through PostgREST/table access. Fix by enforcing column-level privileges or exposing only a safe projection/view for coach/client reads before adding table-level SELECT access to `WearableConnection`.

2. **`IngestionService.ingest()` is not transactional, contrary to the PR-HK-0 spec’s transaction expectation.** The service performs `wearableSample.createMany` at `src/wearables/ingestion/ingestion.service.ts:89-93`, then `wearableConnection.updateMany` at `src/wearables/ingestion/ingestion.service.ts:96-103`, then cache invalidation at `src/wearables/ingestion/ingestion.service.ts:105-108` as separate awaits. If the connection update or cache invalidation fails after samples are inserted, the DB is left in a partial state with stale connection/cache metadata. Fix by wrapping insert, connection bump, and cache invalidation in a Prisma transaction or otherwise making the post-insert side effects recoverable and explicitly tested.

3. **`IngestionService.ingest()` does not log error paths before propagating failures.** The only ingestion log line is the success log at `src/wearables/ingestion/ingestion.service.ts:110-112`; validation failures and Prisma failures from `createMany`, `updateMany`, or cache invalidation propagate without a local redacted error log. The audit checklist requires ingestion error paths to be logged, not merely uncaught. Fix with redacted `logger.error` coverage around validation/DB failure paths while preserving fail-loud rethrow behavior.

### P2 (nit, can defer)

1. `resolveBest()` validates missing `userId` and `startAt > endAt`, but it does not reject invalid `Date` objects before building Prisma filters (`src/wearables/ingestion/ingestion.service.ts:136-153`). `ingest()` has stronger Date validation; `resolveBest()` should match it for fail-loud consistency.

2. `src/app.module.ts` is effectively additive and correct, but the “one-line additive” criterion is implemented as one import plus one module entry with explanatory comments (`src/app.module.ts:116-118`, `src/app.module.ts:334-336`). This is acceptable but slightly broader than the strict wording.

## Conclusion

PR-HK-0 is close: the write-set is correct, schema additions are additive, migration RLS coverage is broad, metric seed coverage is complete, dedup/provider HTTP tests are real-value assertions, and local quality gates pass after Prisma client generation.

Verdict is **NOT CLEAN** because the RLS/token-column protection is not enforceable at the schema/RLS gate and the ingestion lane lacks transactional atomicity plus required error-path logging. Fix the P1 items and request a new SHA-pinned audit.

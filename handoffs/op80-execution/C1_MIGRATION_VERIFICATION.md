# C1 Migration and Ownership Verification

## Result and scope

Parent bounded proof passed 18 grouped assertions on the frozen C1 review tree `3c3d09cf95851fb91e66ed20fe770a1a8164845c`. This is synthetic local integration evidence, not release approval, consumer contract freeze, full backend regression or a production migration.

The parent created a separate database `op80_c1_migration_20260917` on the pre-existing loopback-only disposable PostgreSQL 18.6 cluster. No application database, live account, production flag or existing proof database was changed. The original pairing-table migration ran against a minimal referenced User fixture, followed by the unchanged C1 up/down migrations; the frozen production `ExtensionPairService` and its private generated Prisma client exercised real queries.

## Checks

- **Persistence and compatibility:** 10,000 synthetic legacy rows remained NULL/unbound after the additive migration; multiple NULLs stayed legal and duplicate non-null UUIDs were rejected.
- **Row-level security:** Exact existing policy definitions plus ENABLE/FORCE flags were unchanged. Both anon and authenticated roles saw zero rows, could not insert, and updated/deleted zero rows; existing service-role access remained available.
- **Owned lookup:** Real production init/session preserved the server ID and returned only status, ID and selected platform. Unknown and foreign reads returned the same not-found result; demotion and soft deletion denied previously owned setup.
- **Lifecycle:** A used pairing remained retrievable after code TTL; legacy status omitted the ID, owner remained eligible and sub-coach remained rejected. Existing hard-account deletion cascaded to pairing rows.
- **Index and migration behavior:** Known-ID query used the unique index. An active writer lock produced the expected bounded lock timeout before column creation; the subsequent uncontended up took approximately 4 ms on this small synthetic table, not a production-size benchmark.
- **Reversibility limits:** Disposable down/up preserved rows and policies but erased IDs. This proves structural reversibility only; after durable IDs are issued, rollback must retain the column rather than destroy correlation.
- **Input integrity:** The source tree was identical before and after the proof. The C1 split builder used a different clone and dependency copy; no generator, test output or writable code was shared.

## Limitations and remaining gates

PostgreSQL 18.6 is not the checked-in CI PostgreSQL 15 environment. The fixture is not a replay of the complete application migration chain, and this run did not exercise HTTP middleware/guards, external token minting, production-scale locking or the backend full suite.

Evidence applies directly to the original frozen combined C1 tree, not automatically to C1a/C1b after their split. The final migration and runtime deltas must be reconciled before carrying this evidence forward. Init idempotency/lost-response recovery, retained-code capacity, role-policy alignment, inherited dependency/security findings, backend recovery composition and independent exact-head audits remain separate unresolved gates.

The initial runner attempts stopped before database creation: a missing tool-only PostgreSQL driver and an address-display normalization assumption were corrected. The final run completed successfully; original failure logs remain preserved rather than being labeled product regressions. The helper dependency was installed in an evidence-only tooling directory, not any product manifest, lockfile or agent dependency tree.

## Evidence custody

`build-reports/c1-migration/RESULT.json` records every assertion, migration hashes, frozen tree, server version, timing, index query plan and limitations. The evidence-only runner and its local tooling manifest/lock are preserved with the execution workspace; the disposable database is retained and the runner refuses to reuse or overwrite an existing database.

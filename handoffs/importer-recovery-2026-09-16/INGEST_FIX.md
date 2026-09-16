# Ingest integrity repair and live verification

## Build matrix

- Backend main: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
- Input PR522: `e045cfc5e70124061b13e5dc4f4f4efb6132cceb`
- Extension main: `0111be661922234d670bbf23e23d270eec1b4a4e`
- Context before preparation: `59675a2`
- Date: 2026-09-16 UTC

## Ownership

Worktree `/home/user/workspace/tgp/backend-ingest-integrity`,
branch `fix/scout-ingest-integrity`. Own the seven files already changed by
PR522 plus `.github/workflows/ci.yml`. No other backend writer owns those files.
Parent may separately change `src/scout/scout.service.ts` and its colocated
spec on a different branch; do not touch either. All extension work is disjoint.

Resume, preserve and repair PR522; do not rebuild the importer. Inspect the
existing diff and `/home/user/workspace/reports/backend-investigation.md`.
The widened identity must retain coach, intent, family and source identifier,
preserve duplicate replay and captured_at semantics, and prevent cross-family
data loss. Do not change source billing, identity, authentication or native writers.

## Acceptance

- Preserve every meaningful assertion in the current structural and live tests.
- Get the actual repository LOC gate below 400 without weakening it, minifying
  tests, moving assertions out of scope, or dropping live proof. The current
  implementation contains substantial repeated explanatory prose; remove
  duplication where it improves clarity while retaining rollback/safety rationale.
  If a coherent compliant slice cannot fit, STOP with a concrete split proposal.
- Wire the live uniqueness test into an actual CI disposable Postgres job so
  the required path cannot silently skip due to an absent environment variable.
  Never pass production DATABASE_URL. Test setup is destructive, so use a
  clearly dedicated disposable database and explain the boundary.
- Run real migrations and generated Prisma createMany behavior: cross-family
  collision, same-tuple replay, timestamp replay, tenant/intent independence,
  rollback empty and rollback-refusal with widened-key dependent rows, and RLS.
- Read the SQL execution API carefully; applying multiple statements through
  Prisma's prepared-query path may not execute as intended. Verify empirically,
  not by asserting the test exists. Retain transaction safety and no data deletion.
- No production DB, flags, credentials or GitHub settings. Parent provisions
  local disposable Postgres separately. No remote actions or branch/main changes.
- Node20 matches backend CI. Install npm dependencies only in this worktree if
  needed. No lockfile changes or dependency upgrades in this slice.
- Tests and exact-head full gates precede any audit request. Parent handles
  hooked commit and push, with Bradley Gleave identity and explicit owned staging.
  Inform parent at each checkpoint; never silently batch uncommitted work.

## R138 decision gate

1. Preserve existing repair; delete redundant prose, not tests or controls.
2. Enforce idempotency in the database and prove real conflict behavior rather
   than relying on a mocked count. Existing migration remains authority.
3. Prevent data loss while preserving tenant isolation and truthful duplicate
   reporting; no capture expansion or activation.
4. Root cause is the incomplete uniqueness key and unexecuted integration test.
   Rollback can safely narrow only if no stored rows depend on the widened key;
   otherwise rollback must refuse without deleting data. This is not an
   unconditional instant rollback.

Return exact input/output state, all files written, commands and results,
remaining findings and environment limitations. Do not claim production readiness
or whole-importer completion. Fresh independent dual audits remain mandatory.

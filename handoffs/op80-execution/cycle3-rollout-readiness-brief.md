# Backend Recovery: Concrete Expand-Contract Design

## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: ad2259c0649e4e53a663a2600343da1a08ac8b35
- importer PR #21 head: fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
- importer PR #21 base (origin/main): 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- frozen backend recovery tree: a8908132a9c4882dbe80f9fbc1052532c7e68c3b
- timestamp (ISO 8601 UTC): 2026-09-17T21:03:21Z

## Bounded task

Produce the concrete deployment-compatible design needed before the next backend writer builds the preserved recovery. This is read-only architecture/readiness work, not implementation or a final R14 audit. Requested Astra is inherited; runtime identity is unverified.

Read all canonical rules/addendum in immutable `/tmp/tgp-op80-cycle2-inputs/context/AGENT_RULES.md`. Read `operator80/repos/context/handoffs/op80-execution/RECOVERY_SEQUENCING.md`, the original complete `operator80/execution/backend/BUILD_REPORT.md`, and the original 21-case live proof. Use readonly bare `/tmp/tgp-op80-backend-compose.git` with `git show`/`git diff` for base and tree; do not use the active dependency clone as a mutable source of truth.

## Known issue, not a premise to gloss over

The recovery adds required ledger source_platform and replaces the old narrow uniqueness selector while old code neither supplies the field nor knows the new selector. Final-state 21/21 local proof and collision-free down success do not prove a mixed-version deployment. Narrow rollback correctly refuses collisions after newly allowed identities exist.

Find the smallest safe concrete sequence: additive schema while old writer works; transitional writer/read and bounded unambiguous backfill; drain/compatibility evidence; final identity constraints; rollback boundary/forward repair. Trace the actual Prisma client selectors, old/new insert/upsert semantics and RLS policies, including concurrent writes. Do not invent platform values or assume a trigger can recover ambiguous history.

Do not silently drop the previous uncommitted candidate, rewrite historical migrations, delete original tests, relax the 400-line actual gate or move obligatory proof after the feature. A standalone test-harness prerequisite is valid only if executable and useful against its own current base. Map every original live assertion to a proposed stage.

## Outputs

Write only `operator80/execution/recovery-rollout-design/`.

Deliver:
1. A concise implementation-ready stage table with explicit files/SQL constraints/writer behavior, prerequisites, deployment order, fallback and rollback.
2. A compatibility matrix covering old/new binaries and old/expanded/contracted schema, including failure cases and where real proof is still needed.
3. An assertion-preservation map for all 21 original live cases plus new mixed-version/concurrency tests.
4. A realistic per-stage size/test-density forecast based on existing line inventory, clearly not measured built trees. Identify any genuinely unsplittable unit rather than fabricate a fit.
5. Exact unresolved decisions, smallest next writer task, and relation to the already frozen C1a/C1b contract versions.

Use the already preserved AWS continuous-delivery reference for compatibility-aware promotion; if a new external factual design claim is needed, verify it with search and cite the actual URL. Prefer the actual repo's SQL/Prisma behavior to general claims.

## Prohibitions and closeout

No product edits, commits, installs, test runs, DB queries, code generation, GitHub calls, package changes, remote writes, shared context edits, live accounts or subdelegation. Parent and the sole backend builder own execution resources. Preserve all inputs and report exact pins/drift.

Return a findings-oriented readiness report, not a release checklist pass or CLEAN audit. Clearly separate static reasoning, existing proof and new proof still required. Finish with `VERDICT: FINDINGS` unless infrastructure prevents completion, and explicitly release ownership.

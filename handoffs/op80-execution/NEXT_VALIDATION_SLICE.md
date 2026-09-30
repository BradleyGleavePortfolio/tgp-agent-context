# Next Backend Slice: Import Validation and Contract 2.x

## Purpose and status

Reject malformed import records before any database write or analytics event, while preserving valid source records and useful billing metadata. This is a read-only preparation record for the third unpublished slice after diagnostics D1/D2, not a candidate, execution allocation, passed-test result or consumer contract freeze.

Reuse the frozen recovery rather than rebuilding it. The recovery input is tree `a8908132a9c4882dbe80f9fbc1052532c7e68c3b`, relative to backend `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`; dependency prerequisite is tree `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`, published as238f0f1f. The eventual integration base must explicitly include the accepted/frozen diagnostics composition, and every prerequisite must be rechecked before dispatch.

## Proposed ownership boundary

- **DTO and runtime validator:** `src/scout/scout-ingest.dto.ts` and new `src/scout/scout-ingest.validation.ts`. Preserve exact platform namespaces and finite supported timestamps across both HTTP validation and direct service calls.
- **Ingest service:** Validation-before-write and payload-redaction hunks in `src/scout/scout-ingest.service.ts` only. Retain the actual current three-key idempotency comment; do not copy the recovered future five-key claim before its database change.
- **Contract producer:** `scripts/importer-contract.ts` and generated `docs/contracts/importer-openapi.json`. Advance the tightened client-visible contract to2.0.0, generate with the authoritative exporter, and prove deterministic drift checks. Do not hand-merge generated JSON.
- **Assertion-bearing tests:** Preserve the complete original137-line `test/scout/scout-ingest.integrity.spec.ts`, then add tests for demonstrated uncovered behavior. Put the recovered contract-version assertion in a coherent contract test without importing unlanded database-CI assumptions.

No schema, migration, reconstruction writer, diagnostics, dependency, dunning, feature flag, mobile, extension or CI-workflow edits are part of this proposed slice. One writer and one generator owner must be named explicitly before implementation.

## Known separation constraints

The recovered controller's only changed description advertises the future five-key database identity. Leave `src/scout/scout-ingest.controller.ts` unchanged in this slice, and regenerate the contract from the truthful current controller. A byte difference from the frozen full-recovery artifact is expected for this reason and must be explained, not manually erased.

The recovered `test/scout/scout-ingest-ci.spec.ts` combines a2.0.0 version assertion with live-database workflow guards. Do not copy it wholesale before those workflows land. Preserve every database guard and its original assertions for the later rollout/CI slice; separation is not deletion.

The original recovery decision document assumes the older atomic migration and LOC-exception plan. Retain it as historical evidence, not current rollout authority. Record the scoped validation decision additively and keep the staged database sequence authoritative.

C1's isolated draft versions1.5.0/1.6.0 are provisional. Later integration must move forward within2.x rather than overwriting a landed2.0.0 contract. Neither this version bump nor the C1 local candidate is a consumer freeze.

## Test-first investigation

These are static hypotheses and proof obligations, not reproduced findings. Run native RED against the authorized baseline before any new production repair.

- **Runtime type coercion:** The recovered platform predicate uses `RegExp.test` without a preceding runtime string check. Exercise non-string direct-call values without new banned casts; require a400 and no `createMany` or analytics call.
- **Whole-string matching:** Probe final newline/line-terminator inputs at both HTTP and direct boundaries. Determine actual platform/timestamp behavior before claiming a defect or changing patterns.
- **Finite date boundaries:** Cover valid leap days, rejected rollover dates, offsets crossing UTC years1/9999, fractional-second limits, required zone/seconds and supported string types. Assert parsed dates for positive controls.
- **Namespace boundaries:** Verify exact length limits, valid `auto:host`, rejected aliases/case/whitespace/Unicode and no silent canonicalization.
- **Batch atomicity:** Put a malformed entity after a valid entity and prove the service performs neither storage nor analytics. Preserve valid-batch behavior and exact data mapping.
- **Payload safety:** Retain all existing credential-alias assertions, useful billing metadata, nested array/object behavior and prototype-key defenses. Add only meaningful missing controls.
- **Contract truth:** Assert2.0.0, actual patterns and deterministic export while retaining the current three-key idempotency description. Do not claim future schema behavior.

## Size, resources and acceptance

The earlier recovered grouping was about192 workflow net lines but had137 test additions for83 canonical source additions, below the2.0 density floor. These are planning measurements, not a final passing gate; source extraction, real repairs, complete formatting and new assertions require fresh canonical and actual workflow measurements. If the coherent final slice exceeds400 actual counted lines, propose a sequential assertion-preserving split instead of removing tests or changing exclusions.

Source-only preparation may later run alongside independent audits because its candidate and owned paths will be isolated. Package access, generation, native tests, strict checks and full suites require a separately allocated exclusive slot; no shared writable dependency tree or simultaneous backend execution is permitted. An upstream correction reblocks acceptance until an explicit re-pin and revalidation.

Freeze exact patch/tree, preserve RED and GREEN separately, complete all55+18 self-check rows, and release ownership before parent publication and independent review. No production import, flag, security-setting change, database migration or merge is authorized by this preparation.

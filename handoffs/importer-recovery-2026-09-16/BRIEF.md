# Importer recovery and execution brief

## Scope and truth boundary

Resume existing work, not a greenfield replacement. Current extension main is
`0111be661922234d670bbf23e23d270eec1b4a4e`. PR21 is awaiting independent
audits at `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`. PR20 is paused pending
the C2b-0B shared membership seam. PR19 proposes the zero-post-start-action,
five-minute, fully reconciled goal; it is not yet landed.

No real-account proof exists in this recovery session. No production flags,
source writes, billing capture expansion, money movement, or live migrations
are authorized by this brief. Newer supplied billing requirements conflict
with historical exclusions; report and resolve before a billing implementation.

## Independent lanes

- Backend research: current ingest, reconstruction, idempotency PR522, pairing,
  and relevant unfinished backend work. Read-only.
- Product research: mobile importer prerequisites and actual signup/revenue
  flows; website and finance release inventory. Read-only. Private repository
  content must not be copied into this public context repository.
- Pagination Lens A and Lens B: independently review the entire PR21 diff at
  the same exact SHA. No sibling reports, no fixing, no product edits. Report
  all P0-P3 findings, concrete reproduction, tests run and limitations.
- C2b-0B builder: separate worktree, canonical observation-to-cluster membership
  provenance only. Must not edit pagination, roles, runtime, adapters, UI,
  backend or production flags.

## C2b-0B acceptance contract

Carry snapshot-local, non-secret observation references through the existing
URL clustering algorithm rather than rematching endpoint patterns downstream.
Expose a shared bounded validation boundary for consumers. Document reference
lifetime and deterministic ordering, duplicate multiplicity, excluded/capped
observations, and malformed or forged membership behavior. Do not hash PII
into persistent identifiers. Existing public inference behavior must remain
compatible; an explicit opt-in membership mode is acceptable where necessary
to retain existing callers. Normalized capture-order invariance must hold.

Validation must reject invalid/out-of-range/duplicate/stale or forged membership,
cross-origin/method mismatches and omitted support, not merely check a count.
Reuse the clustering algorithm itself as authority if re-derivation is needed;
do not introduce a second regex/path rematcher. Bound all work by existing
1000-observation limits. No raw body, query values, credentials or PII in
references or diagnostics. Preserve original provenance through partitions,
encoding, dynamic segment grouping and deterministic truncation.

Add adversarial tests before implementation, run the full suite and real
pull-request-context gates with PROD_LOC_CAP=400 and test:source >=2.
No gate weakening, generated JavaScript, new dependencies or fixtures posing
as real-account proof. Do not unpause or change PR20 in this slice.

## R138 decision gate

1. Question/deletion/simplification: reuse already-shipped inference and replay;
   remove the need for each consumer to implement its own URL membership join.
2. Reliability lens: carry explicit provenance through a deterministic
   transformation; validate at consumption boundaries. Independent review and
   bounded inputs contain failures. External reference verification is required
   before a product landing.
3. Good without bad: unlock generic role/edge inference without source writes,
   credential persistence, false evidence attribution or new platform coupling.
4. Root cause: the paused role lane cannot reliably relate clustered endpoints
   to source observations. Fix that ownership seam before expanding roles.

Rollback is an isolated revert; these primitives are not wired to runtime.
Any unrepresentable/unsafe input fails closed. Product landing requires fresh
dual-independent zero-finding audits, exact-SHA CI, identity and base-drift
checks through the canonical git-native runbook. No completion claim from
primitive-only work.

# 1. M-NEW-SUBSTRATE.D — Reconciliation Diff Engine

Slug: `M-NEW-SUBSTRATE.D`

## 2. Doctrine cites

- R0/R3: Bradley-only commit identity; use `scripts/push_one.sh`; no assistant/agent attribution.
- R52/R71/R72: checkpoint push discipline and dual-lens adversarial audit.
- R74/R86: tests must cover real diff/reconciliation failure modes, not fixture-padding.
- R75: zero net banned-cast tokens.
- R76: ≤400 prod LOC.
- R82: any diff-table migration must be reversible.
- R98: diffs can contain PII; redact audit logs while preserving evidence facts.
- R107: every persisted diff/reconciliation mutation goes through H6A `withAuditLog(tx, args, op)`.
- R125: `scout_diffs` and any diff evidence tables are Tier-1 RLS by `coach_id + scout_run_id`.
- D-7/D-8: consumes generic scout profile output and canonical schema; no vendor-specific reconciliation code.
- D-H6-5: audit helper must use caller-provided transaction.

## 3. Dependencies

Must land first:

1. H6A/H6B/H6C.
2. M-NEW-SCHEMA canonical scout result and diff tables.
3. `.A` profile loader for reconciliation config.
4. `.B` selector engine for source-evidence paths.
5. `.C` if live session output is included, though `.D` can be built against stored scout output fixtures first.

## 4. What this slice ships

Prod LOC budget: **395 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/reconciliation/reconciliation.types.ts` | 65 | Canonical entity, field evidence, diff, conflict, and strategy types. |
| `src/migration-scout/reconciliation/canonical-path.ts` | 45 | Validates and normalizes canonical schema paths from M-NEW-SCHEMA. |
| `src/migration-scout/reconciliation/scout-diff-engine.ts` | 130 | Computes structured diffs from previous canonical state + scout output. |
| `src/migration-scout/reconciliation/conflict-policy.ts` | 65 | Implements `vendor_wins | tgp_wins | manual`, `deep_merge | replace | append_only`. |
| `src/migration-scout/reconciliation/scout-diff.repository.ts` | 70 | Persists diff batches under caller tx with H6A audit wrapper. |
| `src/migration-scout/reconciliation/index.ts` | 20 | Public exports. |
| **Total** | **395** | 5 LOC buffer under R76. |

## 5. Public API contract

```ts
export type DiffStrategy = 'deep_merge' | 'replace' | 'append_only';
export type ConflictResolution = 'vendor_wins' | 'tgp_wins' | 'manual';
export type DiffOp = 'add' | 'update' | 'remove' | 'unchanged' | 'conflict';

export interface ScoutCanonicalRecord {
  readonly entityType: 'client' | 'program' | 'workout' | 'check_in' | 'note' | 'billing' | string;
  readonly primaryKey: string;
  readonly canonical: Record<string, unknown>;
  readonly evidence: readonly FieldEvidence[];
}

export interface CanonicalExistingRecord {
  readonly entityType: string;
  readonly primaryKey: string;
  readonly canonicalId?: string;
  readonly canonical: Record<string, unknown>;
  readonly updatedAt?: Date;
}

export interface ScoutDiffEngine {
  diff(input: BuildScoutDiffInput): Promise<ScoutDiffBatch>;
}

export interface ScoutDiffRepository {
  persist(tx: Prisma.TransactionClient, input: PersistScoutDiffInput): Promise<PersistedScoutDiffBatch>;
}
```

Diff behavior:

- Primary key comes from profile `reconciliation.primary_key` and must resolve to a non-empty value.
- `deep_merge` compares nested fields and emits field-level ops with source evidence.
- `replace` emits entity-level replacement proposal with full before/after summaries.
- `append_only` never emits remove/update against existing records; it emits add or manual conflict.
- `manual` conflict resolution never mutates canonical data; it records a conflict for preview/commit UI.
- Field values are not redacted inside protected user-data tables, but audit rows must use H6A redaction/tokenization contract.

## 6. Database changes

Expected ownership: M-NEW-SCHEMA.

Required tables/columns:

- `scout_results`
  - `id uuid pk`
  - `scout_run_id uuid not null`
  - `coach_id uuid not null`
  - `vendor text not null`
  - `entity_type text not null`
  - `primary_key text not null`
  - `parsed_payload jsonb not null`
  - `evidence_json jsonb not null default '[]'`
- `scout_diffs`
  - `id uuid pk`
  - `scout_run_id uuid not null`
  - `coach_id uuid not null`
  - `entity_type text not null`
  - `primary_key text not null`
  - `op text not null`
  - `strategy text not null`
  - `conflict_resolution text not null`
  - `before_json jsonb null`
  - `after_json jsonb null`
  - `field_diffs jsonb not null default '[]'`
  - `status text not null default 'pending_review'`
  - `created_at timestamptz not null default now()`

Indexes:

- `(coach_id, scout_run_id, entity_type)`
- unique `(scout_run_id, entity_type, primary_key)` where appropriate.

RLS:

- Force RLS by `coach_id` and verify no cross-coach diff reads.
- Service role may persist batches only with tenant context and audit logging.

R82:

- Any new migration must include down steps for policies, indexes, and tables in reverse order.

## 7. Test strategy

Real failure modes only:

1. **Primary-key miss fails closed.** Scout record without configured primary key returns structured error and does not persist a diff.
2. **Manual conflict preserves both sides.** Existing canonical field differs from scout field under `manual`; output includes before, after, evidence, and `op: conflict`.
3. **Append-only cannot overwrite.** Existing record under `append_only` never emits update/remove.
4. **Persist uses caller tx + audit.** Repository persists a batch through caller transaction and emits one redacted audit fact per batch, not raw PII in logs.

Rejected padding: fixture permutations with identical strategy behavior, snapshot-only golden files that do not assert conflict semantics, and type guard tests that only prove TypeScript compilation.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is ≤395.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-reconciliation-diff-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.D reconciliation diff engine
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Missing primary key fails closed with no persistence.
- Manual conflict preserves before/after/evidence.
- Append-only cannot overwrite existing canonical data.
- Persist path uses caller transaction and redacted audit event.
Padding explicitly rejected:
- Golden snapshots without semantic assertions.
- Duplicate strategy permutations.
- Type-only tests.
Split feasibility: Already under R76; splitting persistence from diff core would hide the key audit/tx integration risk.
```

If prod LOC exceeds 400, stop for operator approval.

## 9. Out of scope

- Final canonical record commit/dedupe; that belongs to M-NEW-RECONCILER / M1 replacement.
- UI preview/commit screens.
- Roman-generated copy or coaching suggestions.
- Vendor-specific reconstructor modules.
- Selector/page/session execution.
- Legal/vendor permission gating.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- scout-diff-engine`
- `pnpm test -- conflict-policy`
- `pnpm test -- scout-diff.repository`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC
- Migration reversibility and RLS isolation tests if schema changes are touched

## 11. VERDICT line

VERDICT: _______________

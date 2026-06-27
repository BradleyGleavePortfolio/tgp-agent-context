# 1. M-NEW-RECONCILER — Scout-Result Reconciler, Dedupe, and Conflict Resolution

**Slug:** `M-NEW-RECONCILER`  
**Replaces:** M1 reconciler slice  
**Target prod LOC:** ~400.

## 2. Doctrine cites

- R0/R3: every commit authored and committed as Bradley Gleave only.
- R74/R86: tests target actual dedupe/conflict failures; use `[TEST-EXEMPT: anti-padding-reconciler-real-failure-modes]` only if honest tests leave ratio <2.0.
- R76: ≤400 prod LOC; this brief budgets exactly ~400 and should be split if the builder cannot stay under cap.
- R82: any commit/rollback state mutation must be reversible or transactionally aborted.
- R98: email, names, messages, health notes, and workout history are PII; logs redact raw values.
- R107: every canonical write and conflict-resolution update goes through H6A `withAuditLog(tx, args, op)`.
- R125: all scout-source reads remain Tier-1 coach-scoped; no cross-coach dedupe.
- D-8: reconciliation rules live in scout-profile config; this slice is generic and contains no vendor-specific TypeScript.

## 3. Dependencies

Must land first:

1. **H6A/H6B/H6C**: audit substrate, circuit breakers, and canonical wrappers.
2. **M-NEW-SCHEMA**: `scout_runs`, `scout_results`, `scout_diffs`, `operator_overrides`, and `scout_audit_events` tables.
3. **M-NEW-SUBSTRATE.A**: profile loader exposes validated reconciliation config.
4. **M-NEW-SUBSTRATE.D**: diff engine emits normalized scout-output records and field evidence.
5. **M-NEW-SUBSTRATE.E**: kill-switch checks must abort reconciliation at checkpoints if operator disables a platform mid-run.

Can land before:

- `M-NEW-ONBOARDING` review UI, if API returns conflict queues consumable by later UI.
- `M-NEW-PROFILE-TRUECOACH`, if tests use generic fixtures.

## 4. What this slice ships

File inventory and LOC budget:

| File | Purpose | Prod LOC budget |
|---|---|---:|
| `src/scout/reconciler/types.ts` | Entity, evidence, dedupe, and conflict types. | ~55 |
| `src/scout/reconciler/scoutReconciler.ts` | Orchestrates read → dedupe → diff → commit/queue flow. | ~145 |
| `src/scout/reconciler/dedupe.ts` | Vendor-id scoped matching, email normalization, collision detection. | ~90 |
| `src/scout/reconciler/conflicts.ts` | Conflict-resolution strategy handling and manual queue writer. | ~70 |
| `src/scout/reconciler/index.ts` | Public exports only. | ~10 |
| `src/server/trpc/routers/scoutReconciler.ts` | Minimal routes for previewing and resolving manual conflicts. | ~30 |

**Total prod LOC budget:** ~400.

## 5. Public API contract

```ts
export type CanonicalEntityKind = 'client' | 'workout' | 'session' | 'message';

export interface ScoutReconcileInput {
  scoutRunId: string;
  coachId: string;
  dryRun: boolean;
  actorUserId: string;
}

export interface ReconcileEntityResult {
  entityKind: CanonicalEntityKind;
  created: number;
  updated: number;
  unchanged: number;
  queuedConflicts: number;
}

export interface ScoutReconcileResult {
  scoutRunId: string;
  status: 'previewed' | 'committed' | 'blocked_by_operator' | 'manual_conflicts';
  entities: ReconcileEntityResult[];
  diffIds: string[];
}

export interface DedupeCandidate {
  kind: CanonicalEntityKind;
  scoutResultId: string;
  vendor: string;
  vendorId: string | null;
  normalizedEmail: string | null;
  canonicalTargetId: string | null;
  confidence: 'exact' | 'probable' | 'conflict' | 'none';
  reasons: string[];
}

export async function reconcileScoutRun(
  tx: Prisma.TransactionClient,
  input: ScoutReconcileInput,
): Promise<ScoutReconcileResult>;

export async function buildDedupeCandidates(
  tx: Prisma.TransactionClient,
  input: { scoutRunId: string; coachId: string },
): Promise<DedupeCandidate[]>;
```

tRPC route shapes:

```ts
scoutReconciler.preview.useMutation({ scoutRunId: string })
// returns ScoutReconcileResult with dryRun=true and scout_diffs rows.

scoutReconciler.commit.useMutation({ scoutRunId: string })
// applies non-conflicting canonical writes and queues manual conflicts.

scoutReconciler.resolveConflict.useMutation({
  scoutDiffId: string,
  resolution: 'vendor_wins' | 'tgp_wins',
  patch?: Record<string, unknown>,
})
// updates scout_diffs and writes canonical mutation in one audited tx.
```

## 6. Database changes

No new tables expected if `M-NEW-SCHEMA` landed correctly.

Permitted additions only if the builder proves an existing column is missing:

- Add `scout_diffs.resolution_patch jsonb null` if manual resolution needs a stored coach/operator edit patch.
- Add `scout_diffs.resolution_source text null check (...)` for `profile_default`, `coach_manual`, `operator_manual`.

Any DB change requires:

- RLS Tier-1 policy update.
- `down.sql` mirror if added as a migration.
- H6A audit logging for mutation.

## 7. Test strategy targeting REAL failure modes

Required tests:

1. `test/scout/reconciler.vendor-id-collision.spec.ts`
   - Same `vendor_id` appears under two coaches.
   - Reconciler must scope by coach and never merge across coaches.
2. `test/scout/reconciler.email-dedupe.spec.ts`
   - Same coach imports same client with vendor id missing but email variants like `Sarah+app@Gmail.com` and case differences.
   - Reconciler links to one canonical client and preserves source evidence.
3. `test/scout/reconciler.manual-conflict.spec.ts`
   - Profile has `conflict_resolution: manual` and scout payload conflicts with existing TGP field.
   - Reconciler writes `scout_diffs`, does not mutate canonical row, and returns `manual_conflicts`.
4. `test/scout/reconciler.audit-transaction.spec.ts`
   - Canonical client/workout/session/message writes are wrapped by H6A `withAuditLog` inside caller-owned transaction.
   - If canonical write fails, no orphan `scout_diffs` resolution is committed.
5. `test/scout/reconciler.kill-switch.spec.ts`
   - Operator flips `scout_authorized=false` while reconciling.
   - Reconciler exits at checkpoint as `blocked_by_operator` without partial unaudited writes.

Padding rejected: testing every enum branch with identical fixtures, snapshotting entire diff JSON, or duplicate tests per entity kind where the generic path is identical.

## 8. R86 anti-padding exception block

Expected status: **not expected to exceed R76** if file budgets are honored.

If R74 ratio remains below 2.0 after the tests above:

```md
[TEST-EXEMPT: anti-padding-reconciler-real-failure-modes]
R86 TEST EXCEPTION REQUESTED
- Real failure modes covered: cross-coach vendor_id collision, email dedupe normalization, manual conflict queue, audited transaction atomicity, kill-switch abort.
- Padding rejected: per-entity duplicate tests over the same generic branch, snapshot-only diff tests, enum branch loops.
- Split feasibility: not useful below 400 LOC because dedupe and conflict behavior must be reviewed as one atomic correctness surface.
```

## 9. Out of scope

- No browser/session/MFA logic.
- No vendor-specific parser or TrueCoach-specific TypeScript.
- No UI beyond minimal tRPC endpoints.
- No billing migration.
- No Roman AI generation; this slice may preserve field evidence for later Roman overlays.
- No cross-coach dedupe, even if emails match.

## 10. CI verification gates

- `npm run lint`
- `npm run typecheck`
- `npm test -- scout/reconciler`
- R75 banned-cast token gate: net +0.
- R74 density gate or valid `[TEST-EXEMPT: ...]` + R86 block.
- R76 LOC gate ≤400 prod LOC.
- RLS live DB tests from `M-NEW-SCHEMA` still green.
- Audit-log coverage check: every canonical mutation and conflict resolution shows H6A wrapper usage.
- No vendor-specific TypeScript names in `src/scout/reconciler/**`.

## 11. VERDICT line

VERDICT: <builder fills after implementation>

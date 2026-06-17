# Re-Audit Report — PR #403 (CORRECTNESS & SECURITY / Re-Auditor A)

- **PR:** #403 "fix(pr401): R81 cleanup"
- **Head audited:** `0709b02d5963010748eb7e1752070f457ccd2e09`
- **Base:** `feature/named-regimes` (#401 head `43147109ac30bc383a6b7aa13aecdd82ba1413f1`)
- **Merge-base == #401 head:** confirmed (rebase clean; merges to main AFTER #401)
- **Doctrine:** R81 — independent correctness/security key (did NOT defer to Re-Auditor B's CLEAN verdict)
- **Diff scope:** 14 files / +715 −48 (2 migrations, schema, 4 prod src, controllers, 6 test/spec)

---

## VERDICT

CLEAN_NO_FINDINGS

- P0: 0
- P1: 0
- P2: 0
- P3: 0

---

## Surface-by-surface sweep

### 1. decide() zero-row race (P1-1) — CLOSED, no residual TOCTOU
`src/regimes/partial-refund-decision.service.ts:185-225`
- Pre-tx `findUnique` loads `coach_user_id`; foreign coach → `NotFoundException` (no existence leak, no 403).
- Inside `$transaction`: `updateMany({ where: { id, decision: 'pending' }, ... })` then `if (updated.count === 0) throw NotFoundException`. Throwing inside the Prisma `$transaction(async)` callback rolls the tx back — verified semantics. `cancelPendingForPurchase` runs ONLY after the guarded update persisted (count>0).
- The keep_drops/unassign_drops hole is fully closed: the loser matches zero rows → throws → rolls back → drops are NOT canceled against a decision this call didn't persist. Asserted by spec `throws and does NOT cancel drops when the guarded update matches zero rows` (`expect(cancel).not.toHaveBeenCalled()`).
- No residual TOCTOU: `coach_user_id` is effectively immutable on a purchase; even under a hypothetical change the in-tx WHERE-guard + RLS UPDATE policy are the authoritative safeties. The drop-cancel shares the decide() tx (`cancelPendingForPurchase(..., tx)`) so write + cancel commit atomically.

### 2. updateRegime FOR UPDATE lock (P2-3) — correct, no SQLi, no deadlock
`src/regimes/regimes.service.ts:246-251`
- `tx.$queryRaw\`SELECT "id" FROM "WorkoutProgram" WHERE "id" = ${id} FOR UPDATE\`` — tagged-template parameterization; `id` is bound, never interpolated → no injection surface.
- Lock target correct: parent `WorkoutProgram` row, taken BEFORE the `findFirst(desc)+create` revision_index allocation under `@@unique([program_id, revision_index])`. Second writer blocks until first commits, then reads bumped head → no P2002 500. Matches the sanctioned `workout-builder-autosave.service.ts` lockPlanAndHead pattern.
- Single-table, single-row lock → no multi-resource deadlock ordering risk. Missing row → `NotFoundException` (404). Covered by spec `locks the program row FOR UPDATE before allocating the next revision_index`.

### 3. PartialRefundDecision RLS (F3) — tenant-isolated, IDOR-safe
`prisma/migrations/20261218000100_rls_partial_refund_decision/migration.sql`
- `ENABLE` + `FORCE ROW LEVEL SECURITY`. Wrapped in `BEGIN/COMMIT`.
- SELECT + UPDATE policies: `app.is_owner() OR (current_user_id() IS NOT NULL AND EXISTS (... ClientPurchase cp WHERE cp.id = client_purchase_id AND cp.coach_user_id = current_user_id()))`. Owning coach derived via parent `ClientPurchase` (table carries no coach column — ContractAuditEvent child-via-parent pattern).
- UPDATE `WITH CHECK` mirrors `USING` → a decision can never be re-pointed at another coach's purchase. decide() only mutates decision/decided_at/decided_by_coach_user_id (never client_purchase_id), so WITH CHECK is satisfied.
- No client policy, no tenant INSERT/DELETE (service_role-only insert via webhook, Primitive A). Foreign coach / anon → zero rows = cross-tenant not-found. IDOR airtight.
- Renamed column `decided_by_coach_user_id` is NOT referenced by any policy → rename cannot break RLS derivation. Test suite (`test/partial-refund-decision-rls-migration.spec.ts`) asserts every policy shape + append-only ordering.

### 4. onPartialRefund P2002-catch — correctly scoped
`src/regimes/partial-refund-decision.service.ts:114-130`
- `catch` narrows to `err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'` → logs + returns false (idempotent Stripe redelivery). All other errors `throw err` — no broad swallow. find-then-create runs inside one tx (ambient when supplied, else fresh `$transaction`). Flag re-checked at entry (`if (!isNamedRegimesEnabled()) return false`).

### 5. Migration ordering / additivity — correct, flag OFF
- Order: `20261214000000` (base DDL, creates `decided_by_coach_id`) → `20261218000100` (RLS) → `20261218000200` (rename to `decided_by_coach_user_id`).
- RLS (0100) runs BEFORE rename (0200) but never references the column → no conflict.
- Rename is a pure metadata `ALTER ... RENAME COLUMN`; feature flag OFF + table empty in all envs → no data migration. `schema.prisma` matches the post-rename name. No stale `decided_by_coach_id` references anywhere except base DDL + rename file.

### 6. Feature gating — 404 not 403, default-OFF
- `NamedRegimesFeatureGuard.canActivate` throws `NotFoundException` (404) when flag OFF — hides existence, never 403. Applied class-level on both controllers.
- `isNamedRegimesEnabled()` ON only when env value is exactly `'true'` (case-insensitive); unset/empty/other → OFF. Hook (`onPartialRefund`) re-checks independently.

### 7. Throttle on write routes (F4)
- `regimes.controller.ts`: `@Throttle(30/min)` on promote / PATCH update / archive.
- `refund-decisions.controller.ts`: `@Throttle(10/min)` on `:refundId/decide` (tightest — financial write-amplification). Read routes unthrottled (acceptable). `DecideRefundDto` enforces `@IsIn(['keep_drops','unassign_drops'])`. `:refundId` correctly NOT a UUID pipe (Stripe `re_*` id).

### 8. Banned patterns (P0) — none in production
- Diff added-line scan for `@ts-ignore | as any | as unknown as | .catch(()=>undefined) | "Coming soon"`: zero hits.
- Full scan of all production `src/regimes/*.ts`: zero banned patterns.
- P2-1 fix verified: the banned `as unknown as` in `prisma-test-double.ts` (a test file) was replaced with a justified `@ts-expect-error` (R0-sanctioned escape) — and that is a test, outside the P0 production scope regardless.

### 9. getRegimeRevisions take-cap (F5)
`regimes.service.ts:159` — `take: REGIME_REVISIONS_HARD_CAP (20)` bounds the read; defence-in-depth over the per-program retention window. No unbounded result set.

### Incidental
- `test/openapi-spec.spec.ts`: timeout bump 20s→60s with documented CI-load rationale — benign, no correctness/security impact.
- The `as unknown as TxOrPrisma` in `purchase-fanout.service.ts` is PRE-EXISTING base code, NOT in this diff.

---

## Conclusion
Independent re-sweep of the entire #403 diff found no correctness or security defects across the money/refund and RLS surfaces. The four #401 audit fixes (decide race, FOR UPDATE lock, typed Prisma double, column rename) and #403's original fixes (DI-cycle via base, P2002 TOCTOU, RLS policies, throttle, take-cap) are all correct, well-tested, and consistent with established repo patterns.

CLEAN_NO_FINDINGS

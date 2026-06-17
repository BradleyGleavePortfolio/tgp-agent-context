# RE-AUDIT B (TESTS, CONTRACTS & HYGIENE) — PR #403 (rebased + expanded)

- **PR**: #403 `fix(pr401): R81 cleanup`
- **Head audited**: `0709b02d5963010748eb7e1752070f457ccd2e09`
- **Base**: `feature/named-regimes` (#401 head `43147109`)
- **Doctrine**: R81
- **Scope**: tests, contracts, migration/code hygiene, doctrine bans, authorship

## Verdict

```
CLEAN_NO_FINDINGS
```

Counts — P0: 0, P1: 0, P2: 0, P3: 0.

---

## Evidence reviewed

### 1. New tests — meaningful & non-vacuous (PASS)

**decide() zero-row race (P1-1)** — `partial-refund-decision.service.spec.ts:282`
- Harness sets pre-tx `findUnique.decision='pending'` (initial guard passes) + `updateCount:0` (in-tx `updateMany` matches zero rows). This is the *exact* TOCTOU branch.
- Asserts: `rejects.toBeInstanceOf(NotFoundException)` **AND** `updateMany` was called **AND** `cancel` (cancelPendingForPurchase) was **NOT** called. Non-vacuous — all three are load-bearing; the `cancel` negative assertion is the substantive safety claim (a losing unassign_drops must not cancel a buyer's drops). Verified against service `partial-refund-decision.service.ts:208-218`: the zero-count throw is inside the tx, before the `cancelPendingForPurchase` call. Correct.

**P2002 concurrency (F2)** — `partial-refund-decision.service.spec.ts:228`
- Uses the *real* `Prisma.PrismaClientKnownRequestError` with `code:'P2002'` (helper `p2002()`), not a structural fake — so the service's `instanceof … && code==='P2002'` branch is genuinely exercised.
- Two `Promise.all` deliveries both see `findUnique=null`; the in-memory `rows` Set forces the second `create` to throw P2002.
- Asserts `rows.size===1`, exactly one truthy return, `[a,b].sort()).toEqual([false,true])`, `create` called twice. Non-vacuous and precise: proves exactly-one-row + loser-swallows-P2002-without-throwing.

**$transaction boundary** — `:209` asserts `prisma.$transaction` called once (proves the find+create is atomic, the F2 fix).

**flag-off** — `:110` now also asserts `$transaction` NOT called (short-circuit before tx opens). Tightened, not vacuous.

**updateRegime FOR UPDATE lock (P2-3)** — `regimes.service.spec.ts:516`
- Asserts `queryRaw` called once **and** `rawArg.join('')` matches `/FOR UPDATE/` (real predicate inspection, not a call-count-only check) **and** `revision_index` allocated = head+1 (=5). Companion test `:538` pins index 0 for first revision; `:552` proves in-tx 404 when locked rows empty (`updateMany`/`revisionCreate` NOT called). All meaningful.

**take-cap (F5)** — `regimes.service.spec.ts:579`
- Asserts `findMany` called with `take: REGIME_REVISIONS_HARD_CAP` (the exported constant, not a hard-coded literal — so test and source can't silently drift). Companion `:607` proves ownership 404 short-circuits before any `findMany`. Meaningful.

**throttle metadata (F6)** — `regimes-throttle-metadata.spec.ts`
- Reads real reflect-metadata keys (`THROTTLER:LIMITdefault`/`TTLdefault`), matching the established `test/billing-throttle-metadata.spec.ts` convention. Asserts exact `{limit, ttl}` per handler (decide 10/60000; promote/update/archive 30/60000). Pins the F4 decorators against silent removal. Non-vacuous.

**RLS migration static** — `test/partial-refund-decision-rls-migration.spec.ts`
- Asserts ENABLE+FORCE RLS, service_role bypass, coach-of-purchase SELECT/UPDATE keyed on parent `ClientPurchase.coach_user_id`, matching `WITH CHECK`, NO `FOR INSERT/DELETE TO public`, NO `client_id`, and the original DDL file untouched. Verified each `toMatch` corresponds to a real line in the migration SQL. Timestamp-ordering assertion present (`:1040`). Solid drift guard.

### 2. Column rename consistency (PASS)

`git grep decided_by_coach_id` across `src/ prisma/ test/`:
- `schema.prisma:4116` → new name `decided_by_coach_user_id` ✓
- Original migration `20261214000000/...:23` still has old name — **correct** (additive doctrine: never edit shipped migration) ✓
- Rename migration `20261218000200` renames old→new ✓
- Only ORM write site `partial-refund-decision.service.ts:213` → new name ✓
- No stale ORM reference to old name anywhere. No read site reads this column (decide writes only). `doctrine-cleanup.spec.ts` only scans for streak/badge/reaction tokens — rename introduces none, unaffected.

### 3. Contract hygiene (PASS)

- `decide` controller (`refund-decisions.controller.ts:52`) returns service shape `{id, decision, drops_canceled}` unchanged. No DTO/response-shape change. No breaking change.
- New in-tx `NotFoundException('Refund decision already decided')` (`service.ts:216`) **reuses the identical exception type + message** as the existing pre-tx guard (`service.ts:196`). A concurrent loser therefore sees the same 404 as a sequential second decide — error contract is consistent and already-documented behavior; no new contract surface to document.

### 4. Migration hygiene (PASS)

- Timestamps strictly ordered: newest are `…000000_add_coach_reviewed_at` < `…000100_rls…` < `…000200_rename…`, all after the table-creating `20261214000000`.
- Both new migrations are additive (RLS DDL only; pure metadata `RENAME COLUMN`). No `CREATE/DROP TABLE`, no `ADD/DROP COLUMN`, no edit to any shipped migration (asserted by the static spec).
- RLS (000100) precedes rename (000200); policies derive coach via parent ClientPurchase and never reference the renamed column — no ordering conflict. Both wrap in `BEGIN/COMMIT` (RLS) / single statement (rename).

### 5. Code hygiene (PASS)

- **Dropped BillingPrimitivesModule**: `git grep -i BillingPrimitives` over `src/ test/` → **zero** remnants. Clean rebase.
- **Magic numbers**: take-cap extracted to exported `REGIME_REVISIONS_HARD_CAP=20` with rationale (`regimes.service.ts:50`). Throttle limits (10/30, 60000ms) are inline per-decorator with justifying comments — consistent with repo precedent (`checkout.controller.ts`, `billing-throttle-metadata.spec.ts`); acceptable as decorator literals. Test timeout 60_000 documented (`openapi-spec.spec.ts:18`) matching sibling specs.
- No dead code, no duplication introduced. `txPrismaDouble`/`p2002` helpers are used and scoped to the spec.

### 6. Doctrine bans (PASS)

- `git grep -E "@ts-ignore|as any|as unknown as|.catch(()=>undefined)|Coming soon"` over `src/regimes/` → **none**.
- The prior banned `as unknown as PrismaService` double-cast in `prisma-test-double.ts` was **removed** and replaced with a single narrow `@ts-expect-error` on the exact `return mock` statement (`prisma-test-double.ts:42`) with a one-line justification. This is the R0-sanctioned escape — precedent confirmed in `src/community/voice/__tests__/voice-forbidden-cast-scan.spec.ts:15` ("`@ts-expect-error <reason>` is permitted by R0 when justified"). Not a blanket file-level suppression; targets one line. The stale "no `as any`/`as unknown as`" header claim in `regime-revision-retention.service.spec.ts` was corrected to describe the `@ts-expect-error` approach (P2-1 fix verified).

### 7. Authorship (PASS)

All 8 commits `43147109..0709b02` authored `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No `Co-Author`/`Co-authored-by` trailer in any commit body. Committer is the GitHub web identity on 7 (web-edit) commits — expected, not a co-author trailer.

---

## Summary

The rebase cleanly dropped the redundant BillingPrimitivesModule (no remnants) and the folded-in #401 fixes (P1-1 decide race, P2-3 row lock, P2-1 sanctioned ts-expect-error + corrected header, P3-2 column rename) are all correctly implemented with meaningful, non-vacuous tests. Column rename is consistent schema↔migration↔ORM. Migrations are additive and strictly ordered. No banned patterns, no breaking contracts, no dead code, authorship clean.

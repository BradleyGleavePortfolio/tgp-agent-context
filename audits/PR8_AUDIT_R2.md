# AUDIT R2 — PR-8 Coach package CONTENTS endpoints + zod-per-cadence validation (PR #318)

Branch: `pr8/package-contents-endpoints` @ `372eb025` (on top of `cb34a71b`). Both commits confirmed present.

VERDICT: NOT CLEAN
Typecheck: pass — `node_modules/.bin/tsc --noEmit -p tsconfig.json` (0 errors)
Build: pass — `npm run build` / `nest build` (clean)
Lint: pass — `npm run lint` (0 errors, 17 pre-existing warnings in unrelated files, unchanged from `main`)
Tests: pass — `node_modules/.bin/jest` → **282 suites, 3394/3394 active tests pass** (+6 over the R1 3388), 20 skipped + 5 todo unchanged, 6 snapshots pass. Build-report claim verified independently.

---

## Summary

The fix commit (`372eb025`) correctly closes the two R1 P2 races on `attach` and `reorder` and the R1 P3-a soft-delete patch hole. The advisory-lock implementation is sound (xact-scoped, parameter-bound, namespaced). The new tests genuinely exercise the lock semantics.

**However, the R1 audit MISSED a third display_order writer: `patch()` accepts `display_order` from the request body and writes it WITHOUT acquiring the per-package advisory lock.** This is a remaining mutation path of exactly the class the brief asked the fix to cover ("any other display_order-touching write"). The round-2 brief specifically asks me to "check for any other writer — e.g. a bulk import, a different controller, soft-delete shifting orders, etc.", and `patch` is it. Reporting it now.

---

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings

### P2-c — `patch()` writes `display_order` WITHOUT the per-package advisory lock (display_order mutation path missed by the fix)
- **Location:** `src/packages/package-contents.service.ts:124-191` (the `patch` method); specifically line 176 (`if (input.display_order !== undefined) data.display_order = input.display_order;`) and the `update()` at lines 187-190.
- **Evidence:**
  ```ts
  // patch() — NO $transaction, NO acquirePackageOrderLock
  async patch(coachUserId, packageId, contentId, body) {
    await this.packages.requireOwnedPackage(coachUserId, packageId);
    const row = await this.requireOwnedContent(packageId, contentId);
    const input = this.parsePatch(body);
    …
    const data: Record<string, unknown> = {};
    if (input.display_order !== undefined) data.display_order = input.display_order;   // ← writes display_order
    …
    return this.prisma.coachPackageContent.update({ where: { id: contentId }, data });  // ← no lock taken
  }
  ```
  The `PatchContentSchema` exposes `display_order` as an editable field (`src/packages/package-contents.dto.ts:144` — `display_order: z.number().int().min(0).optional()`), and the controller's `PATCH /v1/coach/packages/:id/contents/:contentId` route accepts it. So a coach can set display_order on any row via patch. This write path does NOT acquire `pg_advisory_xact_lock` and does NOT run inside the `$transaction` that the fix added to `attach` and `reorder`.
- **Concrete failure modes:**
  1. **patch + concurrent attach** — `patch` writes `display_order = 5` on row R; concurrently `attach` reads `max(display_order) = 4` (before patch commits) and inserts the new row at 5. Two rows now share `display_order = 5`. The brief: "no duplicate orders that scramble the editor."
  2. **patch + concurrent reorder** — exactly the TOCTOU class of P2-b: `reorder` reads parity set inside its tx; `patch` then mutates `display_order` on one of those rows AFTER the parity check but BEFORE the bulk `update` loop (the lock blocks attach/reorder but does NOT block patch); the reorder's bulk-update for that row overwrites the patch (no lasting corruption, but the patch result is silently lost from the user's perspective), or — under different interleavings — the patch flips two rows' orderings without atomicity.
  3. **two concurrent patches on different rows of the same package** — both can target the same target display_order; the unique invariant is not DB-enforced (`prisma/schema.prisma:4669-4670` is non-unique index), so both writes succeed and produce duplicates.
- **Why P2 (matches the severity the R1 P2-a/P2-b were classed at):**
  - Brief says display_order must not duplicate / scramble the editor — this violates that under concurrency.
  - Not P1 because real-world likelihood is low (a single coach editing) and downstream impact at PR-9 fan-out is non-fatal (rows still snapshot, just in non-deterministic relative order).
  - Not P3 because the brief explicitly asked for this class of finding in round 2 ("any other writer that touches display_order").
- **Fix recommendation:** wrap `patch()` in `prisma.$transaction(async (tx) => { … })` whose first statement is `await this.acquirePackageOrderLock(tx, packageId);` (the existing helper). Move `requireOwnedContent` and the `update` inside the tx. This makes `patch` symmetrical with `attach` and `reorder`. Alternatively, reject `display_order` on patch and force coaches to use `reorder` for ordering changes (would be a small API contract change but eliminates the asymmetry; the brief explicitly calls reorder "preferred for the editor").

---

## P3 (non-blocking)

### P3-d — `softDelete` does not renumber surviving rows' display_order; gap-leaves are allowed
- **Location:** `src/packages/package-contents.service.ts:193-217`.
- **Evidence:** After deleting the middle row of `[0,1,2]`, surviving rows are `[0,2]` — non-contiguous. The next `attach` calls `nextDisplayOrder` which reads `max(display_order among non-removed) = 2` and inserts at `3`, producing `[0,2,3]`. Functionally fine (`ORDER BY display_order ASC` still returns them in the right order; no duplicates), but the implicit "0..N-1 contiguous" invariant the editor likely expects is not maintained.
- **Why P3:** This is just a quality/consistency note. It does not cause a correctness defect — `list` is stable, `reorder` rebuilds the sequence on demand, and PR-9 snapshots by id not by index. R1's P2-a/P2-b found races; this is a steady-state shape issue. Not a merge blocker.
- **Fix recommendation:** Either document that display_order is monotonic-not-contiguous, or pack it on softDelete inside a tx+lock. Neither is required for PR-8.

### P3-e — Build report's "stricter superset, intentional" wording for workout/media is now accurate; P3-b/P3-c from R1 are resolved
- **Location:** `PR8_BUILD_REPORT.md` (fix commit) vs `src/packages/package-contents.service.ts:448-515`.
- **Evidence:** The build report now says "workout/media branches add `archived_at`/`kind` filters — stricter superset, intentional" rather than "byte-identical". The meal_plan branch is correctly described as byte-identical. Documentation matches code.
- **Why P3:** documentation-only resolution of R1 P3-b/P3-c. No action.

---

## Verification of fix-commit claims (372eb025)

| Claim | Verified |
|---|---|
| Per-package `pg_advisory_xact_lock(int4, int4)` taken at the top of an interactive `$transaction` in `attach` | **TRUE** — `src/packages/package-contents.service.ts:100-122`. First statement inside the tx callback is `await this.acquirePackageOrderLock(tx, packageId)`. |
| Per-package `pg_advisory_xact_lock` taken at the top of an interactive `$transaction` in `reorder`; parity `findMany` moved INSIDE the tx | **TRUE** — `src/packages/package-contents.service.ts:249-290`. Lock first; parity `tx.coachPackageContent.findMany` next (was `this.prisma…` outside the tx pre-fix). Bulk update is `for` loop over `tx.coachPackageContent.update`. |
| Lock is `pg_advisory_xact_lock` (xact-scoped), NOT `pg_advisory_lock` (session-scoped) — auto-released on commit AND rollback | **TRUE** — `src/packages/package-contents.service.ts:420-425`. SQL is `SELECT pg_advisory_xact_lock(${NAMESPACE}::int4, hashtext(${packageId}))`. No explicit `pg_advisory_unlock` exists in the codebase. No `pg_advisory_lock` session-scoped call exists either (grep clean). |
| Lock key is stable + parameter-bound (no SQL injection) | **TRUE** — `packageId` is passed via Prisma's tagged-template binding (the `${packageId}` in `$executeRaw\`…\``), not string-interpolated. Namespace constant `0x70_6b_67_63` is hard-coded. |
| Lock key namespaced (NAMESPACE, hashtext(packageId)) to avoid collision with other advisory-lock users | **TRUE** — uses the two-int4 form; the first int4 is the dedicated `'pkgc'` namespace constant. No other `pg_advisory_xact_lock` call exists in the codebase (grep'd — only call site is `acquirePackageOrderLock`). |
| `attach`: lock → read max → insert max+1 ALL in one tx (no read-then-write race window left) | **TRUE** — `src/packages/package-contents.service.ts:100-121`. `nextDisplayOrder` now takes `(db: Tx, packageId)` so it physically cannot run outside the lock-holding tx. |
| `reorder`: parity findMany moved INSIDE the tx, after the lock (no TOCTOU window left) | **TRUE** — `src/packages/package-contents.service.ts:254-258`. |
| `requireOwnedContent` filters `removed_at: null` so patch on a soft-deleted row 404s | **TRUE** — `src/packages/package-contents.service.ts:381-383` (added `removed_at: null` to the where clause). |
| `softDelete` remains idempotent (does not route through `requireOwnedContent`) | **TRUE** — `src/packages/package-contents.service.ts:203-211`. Inline `findFirst` does NOT filter `removed_at`; if `row.removed_at` is set, returns row as-is. |
| No regressions to R1's "correct" items (strict zod, auto_message contract, IDOR, soft-delete-only, scope, no checkout/cron/etc.) | **TRUE** — diff between cb34a71b and 372eb025 touches only `package-contents.service.ts` (the locking + soft-delete-filter changes) and `package-contents.service.spec.ts` (new tests). Zod schema, controller, dto, module, and PR-7 contract code are untouched. |
| 3394/3394 active tests pass (+6 over the original 3388) | **TRUE** — verified independently: `Test Suites: 282 passed, 282 total; Tests: 20 skipped, 5 todo, 3394 passed, 3419 total`. The 6 new tests are at `test/package-contents.service.spec.ts:744-873`. |
| The new "concurrent-attach" test ACTUALLY exercises the lock (not a self-fulfilling mock) | **TRUE (with reservation, see below)** |

### Scrutiny of the 6 new tests — do they catch a regression where the lock is removed?

The test stub at `test/package-contents.service.spec.ts:128-192` implements:
1. `$executeRaw` — when called with a `pg_advisory_xact_lock` template, registers a per-`packageId` mutex chain: subsequent callers await the previous holder's Promise.
2. `$transaction(fn)` — wraps a fresh tx-handle (`Object.create(stub)`), runs the callback, and in `finally` releases every lock registered on the tx-handle in LIFO order.

I judged this stub by asking: *if a future builder deleted the `await this.acquirePackageOrderLock(tx, packageId)` call from `attach()`, would these tests fail?*

- **"attach acquires the per-package lock inside a transaction"** (line 744-755): asserts `_lockLog` equals `[{ packageId: 'pkg-1' }]`. Removing the lock-acquire call would leave `_lockLog` empty → test fails. ✓
- **"reorder acquires the per-package lock inside a transaction"** (line 757-773): same assertion shape. ✓
- **"concurrent attaches serialise into distinct display_order values"** (line 775-800): with the lock removed, the three `Promise.all` `attach` calls all enter the tx callback; each `await tx.coachPackageContent.findFirst(...)` resolves on a microtask before any `create` has happened (the in-memory contents array is empty), so all three read `tail = null` and all three insert at `display_order = 0`. The sorted `orders` would be `[0, 0, 0]` ≠ `[0, 1, 2]` → test fails. **Independently**, the `_lockLog.length === 3` assertion would also fail. ✓
- **"reorder-vs-attach interleaving (P2-b)"** (line 802-838): asserts every row has a distinct display_order after the race. Without the lock, the parity findMany would race with the concurrent attach exactly as P2-b described → duplicate display_orders → test fails. ✓
- **"patch on a soft-deleted row returns 404"** (line 843-860): exercises the P3-a fix in `requireOwnedContent`. Removing the `removed_at: null` filter would let the patch find the row and call `update`; the test expects `NotFoundException` and would fail. ✓
- **"softDelete remains idempotent"** (line 862-873): confirms the inline lookup in `softDelete` is decoupled from `requireOwnedContent`. ✓

**Reservation:** the stub does not model true Postgres `pg_advisory_xact_lock` semantics (locks released only on tx commit / rollback at the DB level) — it models them via JS Promise chains. A future change that, e.g., kept the `$transaction` but issued the lock via `this.prisma.$executeRaw` (outside the tx-handle) instead of `tx.$executeRaw` would still log to `_lockLog` and might still pass these tests but would be incorrect in production (the lock would still work, since xact-scope is determined by the surrounding tx of the SAME connection in real PG — but Prisma's `this.prisma.$executeRaw` outside an active tx context is not in any tx and would not get xact-scope). The current code uses `db.$executeRaw` from inside the `$transaction` callback (`db: Tx` = the txClient) — correct. But the test would not catch a regression to `this.prisma.$executeRaw`. This is a known limitation of stub-based testing; not a defect of the current PR, but worth noting if a future audit needs to confirm advisory-lock placement.

**Net judgement:** the test stub is a *legitimate* test of the production lock — it would catch removal of the lock call, and it would catch the read-then-write race the lock is meant to close. It is NOT a self-fulfilling mock.

---

## Resolution of R1 findings

| R1 finding | Status |
|---|---|
| P2-a — `nextDisplayOrder` read-then-write race in `attach` | **RESOLVED** — per-package xact-scoped advisory lock + interactive tx; signature change forces lock-holding call site. Test coverage adequate. |
| P2-b — `reorder` parity TOCTOU | **RESOLVED** — parity findMany moved inside the same tx as the bulk update, behind the same per-package advisory lock. Test coverage adequate. |
| P3-a — `requireOwnedContent` did not filter `removed_at`, so `patch` could mutate a soft-deleted row | **RESOLVED** — filter added; `softDelete` decoupled to preserve idempotence. Test coverage adequate. |
| P3-b — workout ownership predicate is stricter than PR-7 resolver (doc-accuracy) | **RESOLVED** — build report updated to "stricter superset, intentional". |
| P3-c — media ownership predicate is stricter than PR-7 resolver (doc-accuracy) | **RESOLVED** — same. |

## New finding (this audit)

| Finding | Severity | Reason |
|---|---|---|
| P2-c — `patch()` writes `display_order` without the per-package advisory lock | **P2** | Same class as resolved P2-a/P2-b; mutation path explicitly called out by the round-2 brief. Round 1 missed it. |
| P3-d — `softDelete` does not pack surviving rows | **P3** | Steady-state non-contiguity, not a correctness defect. |

---

VERDICT: NOT CLEAN

# AUDIT R3 — PR-8 Coach package CONTENTS endpoints + zod-per-cadence validation (PR #318)

Branch: `pr8/package-contents-endpoints` @ `2aeaa3fa` (on top of `372eb025` on top of `cb34a71b`). All three commits confirmed present.

VERDICT: CLEAN
Typecheck: pass — `node_modules/.bin/tsc --noEmit -p tsconfig.json` (0 errors)
Build: pass — `npm run build` / `nest build` (clean)
Lint: pass — `npm run lint` (0 errors, 17 pre-existing warnings in unrelated files, unchanged from `main`)
Tests: pass — `node_modules/.bin/jest` → **282 suites, 3402/3402 active tests pass** (+8 over R2's 3394 = +14 over the original 3388), 20 skipped + 5 todo unchanged, 6 snapshots pass. Build-report claim verified independently.

---

## Summary

The R2 fix commit (`2aeaa3fa`) correctly closes the P2-c finding from R2: `patch()` now wraps display_order-changing patches in `prisma.$transaction` with `acquirePackageOrderLock(tx, packageId)` as the first statement, re-fetches the target row inside the lock with `removed_at: null`, rejects duplicate display_order via `DISPLAY_ORDER_TAKEN` (400), supports the same-value no-op, and re-evaluates the auto_message body contract against the locked-read row. Lock coverage is now symmetric across all three display_order mutators (`attach`, `reorder`, `patch`). No regressions to previously-correct items. Zero P0/P1/P2.

---

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings
*(none)*

---

## P3 (non-blocking)

### P3-d (carry-over from R2) — `softDelete` does not pack surviving rows' display_order; gap-leaves are allowed
- **Location:** `src/packages/package-contents.service.ts:253-277`.
- **Evidence:** After deleting the middle row of `[0,1,2]`, surviving rows are `[0,2]` — non-contiguous. The next `attach` calls `nextDisplayOrder` which reads `max(display_order among non-removed) = 2` and inserts at `3`, producing `[0,2,3]`. Functionally fine (`ORDER BY display_order ASC` still returns them in the right order; no duplicates), but the implicit "0..N-1 contiguous" invariant the editor likely expects is not maintained. The build-report comment explicitly accepts this ("gaps don't scramble the editor; only duplicates do").
- **Why P3:** Steady-state non-contiguity is a UX/consistency note, not a correctness defect. `list` is stable, `reorder` rebuilds the sequence on demand, PR-9 snapshots by id not by index, and the brief's invariant is "no duplicates" — not "contiguous". Not a merge blocker.
- **Fix recommendation:** Either document that display_order is monotonic-not-contiguous, or pack it on softDelete inside the existing tx+lock. Neither is required for PR-8.

### P3-e — `DISPLAY_ORDER_TAKEN` rejects single-row moves into busy slots; editor must use `/reorder` to swap
- **Location:** `src/packages/package-contents.service.ts:228-244`.
- **Evidence:** When the editor wants to move row A from order=3 to order=1 (where row B already sits), `patch` returns 400 with a hint to use `/reorder`. There is no in-service "shift neighbors to make room" affordance; the contract is "single-row patch must target a free slot, or use `/reorder` for an atomic permutation."
- **Why P3:** This is acceptable per the brief ("no duplicate orders that scramble the editor"). Reject-on-collision is the simplest correct contract and the build-report's `/reorder` hint gives the client an actionable escape. NOT a UX dead-end — the editor can compose the move as a reorder. Worth noting in the API docs but not a merge blocker.
- **Fix recommendation:** Document the contract in the PR description (already present in the build-report's "Inside the lock, check whether the target display_order is already held … reject with DISPLAY_ORDER_TAKEN" wording). Optional follow-up: a `?shift=true` flag on PATCH that compacts neighbors — not for PR-8.

---

## Verification of fix-commit claims (2aeaa3fa)

| Claim | Verified |
|---|---|
| When `patch` body includes `display_order`, wrapped in `$transaction` with `acquirePackageOrderLock` as FIRST statement | **TRUE** — `src/packages/package-contents.service.ts:209-210`. First call inside the tx callback is `await this.acquirePackageOrderLock(tx, packageId)`. |
| Row re-fetched with `removed_at: null` filter inside the lock | **TRUE** — `src/packages/package-contents.service.ts:215-217`. `tx.coachPackageContent.findFirst({ where: { id, package_id, removed_at: null } })`. |
| Patch on soft-deleted row still 404s on the locked path | **TRUE** — `src/packages/package-contents.service.ts:218-223`. NotFoundException raised when the locked `findFirst` returns null. Test at `test/package-contents.service.spec.ts:909-933` (and 929-932 specifically) verifies. |
| Duplicate `display_order` rejected via `400 DISPLAY_ORDER_TAKEN` when targeting a non-removed row's order | **TRUE** — `src/packages/package-contents.service.ts:229-244`. Collision query filters `removed_at: null`, excludes the current row (`id: { not: contentId }`); BadRequestException with `DISPLAY_ORDER_TAKEN` + `/reorder` hint. |
| Same-value patch is a no-op (skips collision check) | **TRUE** — `src/packages/package-contents.service.ts:228`. `if (input.display_order !== row.display_order)` gates the collision query; same-value falls through to the `update`. Test at `test/package-contents.service.spec.ts:896-907` verifies. |
| auto_message body contract re-evaluated against the row re-read INSIDE the lock | **TRUE** — `src/packages/package-contents.service.ts:157-177`. `buildData(row)` is a closure that reads `row.asset_type` / `row.display_title` / `row.display_caption` from the row argument; the locked path passes the freshly-re-fetched row (line 248: `data: buildData(row)`), so a concurrent patch that cleared the body cannot slip through. |
| Cheap path (no lock) is taken ONLY when `input.display_order === undefined` | **TRUE** — `src/packages/package-contents.service.ts:201-207`. The `if (input.display_order === undefined)` guard. |
| Cheap path genuinely cannot write display_order | **TRUE** — Verified by reading `buildData` (lines 178-192): `data.display_order = input.display_order` only fires when `input.display_order !== undefined`, but the cheap path's gate is `input.display_order === undefined`, so the `if` at line 179 evaluates false → `data.display_order` is never set on that path. No hidden write. |
| Lock coverage symmetric across attach / reorder / patch | **TRUE** — `attach` lines 100-101, `reorder` lines 309-310, `patch` (locked path) lines 209-210. All three call `acquirePackageOrderLock(tx, packageId)` as the first statement inside `prisma.$transaction(async (tx) => …)`. |
| No regressions to strict zod / auto_message contract / IDOR / soft-delete-only / scope / R1 attach/reorder locks / P3-a 404 | **TRUE** — diff `git diff 372eb025..2aeaa3fa --stat` shows only `package-contents.service.ts` and `package-contents.service.spec.ts` touched (118+196 LOC). Controller, dto, module, PR-7 contract code, packages.service.ts: untouched. Zod schemas unchanged. softDelete decoupling unchanged. requireOwnedContent's `removed_at: null` filter unchanged. The new locked `findFirst` inside `patch` uses the SAME filter as `requireOwnedContent` (`removed_at: null`), preserving P3-a (R1). |
| 3402/3402 active tests pass (+8 over R2's 3394) | **TRUE** — verified independently: `Test Suites: 282 passed, 282 total; Tests: 20 skipped, 5 todo, 3402 passed, 3427 total`. The 8 new tests are at `test/package-contents.service.spec.ts:842-1034` (in the `patch with display_order is locked + reject duplicates (P2-c)` describe block). |

---

## Exhaustive check: any other writer of `display_order` that escapes the lock?

Searched the entire repo for `display_order`, `displayOrder`, and `coachPackageContent\.(update|create|updateMany|createMany|upsert|delete|deleteMany)`. Results:

| File | Write op | Locked? |
|---|---|---|
| `src/packages/package-contents.service.ts:106` (`attach → tx.coachPackageContent.create`) | Sets display_order | **YES** — inside `$transaction` after `acquirePackageOrderLock`. |
| `src/packages/package-contents.service.ts:203` (`patch` cheap path → `prisma.coachPackageContent.update`) | Cannot set display_order (gated by `input.display_order === undefined`) | **N/A** — verified at line 201 gate; `buildData` at line 179 only writes display_order if `input.display_order !== undefined`, which is impossible on this branch. |
| `src/packages/package-contents.service.ts:246` (`patch` locked path → `tx.coachPackageContent.update`) | Sets display_order | **YES** — inside `$transaction` after `acquirePackageOrderLock`; collision-check inside the lock. |
| `src/packages/package-contents.service.ts:273` (`softDelete → prisma.coachPackageContent.update`) | Sets `removed_at` only; never `display_order` | **N/A** — does not touch display_order. (P3-d notes that softDelete also does not compact survivors, intentionally.) |
| `src/packages/package-contents.service.ts:345` (`reorder → tx.coachPackageContent.update`) | Sets display_order | **YES** — inside `$transaction` after `acquirePackageOrderLock`; parity findMany inside the same tx. |
| `src/packages/packages.service.ts:293` (`coachPackageContent.count`) | Read-only | **N/A** |

No other controller, service, bulk op, migration-at-runtime, or soft-delete path writes `display_order`. Grep across `src/`, `test/`, and `prisma/` confirms the only references to `display_order`/`displayOrder` are inside the `packages` module (controller, service, dto), the Prisma schema (column + index definition), and the migration SQL (table create + index create). The lock coverage is now genuinely symmetric and complete.

---

## Scrutiny of the 8 new R2 tests — do they catch a regression where the patch lock is removed?

The test stub at `test/package-contents.service.spec.ts:128-193` implements per-packageId mutex chains keyed on the `pg_advisory_xact_lock` SQL signature, released in `$transaction`'s `finally` block. I evaluated each new test by asking: *if a future builder reverted patch's `$transaction + acquirePackageOrderLock` wrap, would the test fail?*

| Test | Catches lock removal? | Evidence |
|---|---|---|
| **patch without display_order skips the lock (cheap path preserved)** (842-856) | N/A (asserts the OPPOSITE direction — that the cheap path is preserved). Removing the lock from the locked path would not flip this assertion. | Asserts `_lockLog` is empty after a title-only patch. Catches accidental over-locking. |
| **patch with display_order acquires the per-package lock inside a transaction** (858-875) | **YES** | Asserts `_lockLog === [{ packageId: 'pkg-1' }]` after a display_order-changing patch. Removing the `acquirePackageOrderLock` call would leave `_lockLog` empty → test fails. |
| **patch rejects display_order already held (DISPLAY_ORDER_TAKEN)** (877-894) | Partial — catches removal of the collision check (which lives inside the locked tx callback). | Pre-existing rows at 0 and 1; patches a to b's order → expects `BadRequestException`. If the collision check is removed, the second `update` would succeed (Prisma index is non-unique) and no exception fires. |
| **patch allows setting display_order to row's own current value (no-op)** (896-907) | Catches removal of the same-value guard. | Asserts the no-op patch returns the unchanged order without rejection. |
| **patch ignores soft-deleted rows when checking collisions; soft-deleted target STILL 404s** (909-933) | **YES** for the 404 portion. | The locked `findFirst` uses `removed_at: null`; removing that filter would let the patch succeed against a soft-deleted row, failing the second `expect(...).rejects.toBeInstanceOf(NotFoundException)`. |
| **patch-vs-attach interleaving — serialised; no duplicate display_order** (935-956) | **Weak.** Because the test moves `a` to order=5 and the concurrent attach appends, the two writers can't naturally collide regardless of locking — the resulting orders `[5, ?]` are always distinct under both serialisation orderings. The stub's lock-chain DOES register both holders, but the assertion (`new Set(orders).size === orders.length`) would pass even without the patch lock. **NOTE THIS AS A TEST-COVERAGE GAP, not a code defect.** The locking still works in production; the test just doesn't fail-the-build if you remove it. |
| **patch-vs-reorder interleaving — serialised; no duplicate display_order** (958-993) | **YES.** Without the patch lock, the patch's update can interleave with the reorder's per-row updates and land on top of an order the reorder is about to assign to another row → duplicate. Asserts `new Set(orders).size === orders.length`. |
| **two concurrent patches targeting SAME display_order — at most one wins** (995-1034) | **YES, strongly.** Without the lock + collision check (which are bundled inside the same tx callback — removing the `$transaction` wrapper effectively removes both), both patches write `display_order = 10` and both succeed → two rows at 10 → `tens.length === 1` fails. This is the most surgical test of the fix. |

**Net judgement.** The new tests are NOT self-fulfilling mocks — they genuinely exercise the lock + collision-check semantics. The `_lockLog` assertion catches direct lock-call removal; the "two concurrent patches same order" test catches removal of the locked collision-check block as a unit; the "patch-vs-reorder" test catches the same TOCTOU class as R1's P2-b but for the patch path. The "patch-vs-attach" test is the weakest of the new eight (would pass even without the patch lock, because of the specific orders chosen), but the "two concurrent patches" and "patch-vs-reorder" tests cover the remaining failure modes. Adequate coverage; not a merge blocker.

The pre-existing test-stub limitation from R2 (the stub models xact-scoped lock semantics via JS Promise chains, not real PG; would not catch a regression to `this.prisma.$executeRaw` outside the tx-handle) still applies. Not a defect of this PR.

---

## Resolution of R2 findings

| R2 finding | Status |
|---|---|
| P2-c — `patch()` writes `display_order` without the per-package advisory lock | **RESOLVED** — `patch` now wraps the display_order-changing path in `$transaction` with `acquirePackageOrderLock` as the first statement; locked path re-fetches with `removed_at: null`, rejects collisions (`DISPLAY_ORDER_TAKEN`), supports same-value no-op, re-evaluates auto_message body against the locked-read row. Lock coverage symmetric across all three mutators. Test coverage adequate (see scrutiny above). |
| P3-d — softDelete does not pack surviving rows | **CARRY-OVER P3 (intentional)** — build report acknowledges; non-contiguity is not a defect. |

## New findings (this audit)

| Finding | Severity | Reason |
|---|---|---|
| (none — no new P0/P1/P2) | — | — |
| P3-e — DISPLAY_ORDER_TAKEN is a single-row dead-end (must use /reorder for swaps) | P3 | Acceptable contract; brief allows it; hint provided. Documentation note only. |
| Test-coverage note — patch-vs-attach interleaving test (935-956) is weakest of the new 8 and would pass even with the patch lock removed | informational (P3-equivalent) | The other 7 tests catch the lock + collision-check removals adequately. Not a blocker. |

---

VERDICT: CLEAN

# FIX NOTE 2 — H3 Coach-messaging (R2 audit follow-up)

**Unit:** H3 (coach-messaging roles)
**Fixer:** Dynasia G
**Repo:** `growth-project-backend`
**PR:** #336 — branch `hygiene/coach-messaging-roles` (base `main`)
**Audited SHA:** `572c423bf37ecaa9bc5e21a514ea41fc20a92534`
**New SHA after this fix:** `27ad452cfeb04a5431ef1b9bea89af531ab6a132`

## Audit result being addressed
The R2 audit (`audits/PR18_wave/H3_AUDIT_R2.md`) returned **NOT CLEAN** with a
single **P2** and explicitly noted: *"H3 implementation is clean, but the
required full Jest gate is red because of an unrelated deterministic-date
failure outside the H3 write-set."* Finding counts: P0=0, P1=0, P2=1, P3=0.

### The P2 finding (verbatim scope)
`test/purchase-fanout-real-body.spec.ts` — the idempotency test
(`replaying the same event leaves the SAME number of drops, immediate drop is
materialised exactly once`, file lines ~317–340) fixes
`basePurchase().created_at` to `2026-05-01T00:00:00Z` and seeds a
`relative_to_purchase` content row with `offset_days: 30`. The test does NOT
pass an explicit `purchaseTime`, so `PurchaseFanoutService.onPurchaseEntitled`
falls back to `purchase.created_at` for cadence math
(`src/packages/purchase-fanout.service.ts:234`:
`const purchaseTime = ctx.purchaseTime ?? purchaseRow.created_at ?? new Date();`).
That yields `fire_at = 2026-05-01 + 30d = 2026-05-31T00:00:00Z`. On the audit
date (`2026-05-31`), the service's immediate cutoff check
(`d.fire_at.getTime() <= now.getTime()`, lines 295–296) treats the relative
drop as already due, so the real fan-out body materialises **2** drops and the
test's `expect(registry.getCalls()).toHaveLength(1)` fails (received 2).

This was reproduced in the worktree at the pinned SHA (full spec: 1 failed, 9
passed) before applying the fix.

## Decision: **B** (narrow, unambiguous fix)
Per the fixer decision tree, **B** was chosen because the fix is **< 20 lines,
test-only, and unambiguous**. The 10-line change makes the test deterministic
across any wall-clock date.

### Why not A (defer)
The finding is genuinely outside the H3 write-set (it lives in the PR-9
purchase-fanout spec, not in any of H3's three write-set files), so deferral
(A) was permissible. But the failure keeps the **required full Jest gate red**,
and the fix is a trivial, well-understood date-determinism correction that the
audit itself prescribed (*"freeze time in this spec or move the purchase
fixture so 'future relative_to_purchase' is deterministic"*). Shipping a green
gate beats deferring a one-line determinism bug to a separate ticket, so B was
the higher-quality choice.

## The fix (test-only, 10 insertions / 2 deletions, one file)
`test/purchase-fanout-real-body.spec.ts` — in the idempotency test only:
introduced `const purchaseTime = new Date();` and passed
`{ entrypoint: 'in_app_hosted', purchaseTime }` to both `onPurchaseEntitled`
calls (first delivery + Stripe replay). Anchoring `purchaseTime` to "now" makes
the `offset_days: 30` relative drop land genuinely in the future, so it stays
`pending` (not materialised) regardless of the system date — exactly the
pattern the same file already uses in the mixed-cadence test (line ~187,
`new Date(Date.now() + 1000)`). No production code changed; cadence semantics
are unchanged. A descriptive comment documents the determinism rationale.

## Deviation from the H3 write-set — explicit justification
The H3 write-set is `src/messaging/coach-messaging.controller.ts`,
`test/roles-enforced.spec.ts`, and `test/coach-messaging-roles.spec.ts`. This
fix touches `test/purchase-fanout-real-body.spec.ts`, which is **outside** that
write-set. This deviation is justified and bounded:

- The change is **test-only** and confined to a single test case; it touches no
  production source and no other unit's files (`payment-ops.*`, `admin.*`,
  `storefront-public.*`, `real-meal-plans.*` untouched).
- It corrects a **date-determinism defect** that the audit attributed to this
  spec and prescribed a fix for. It does not alter H3's behaviour, the
  coach-messaging controller, the roles allowlist, or any guard.
- The H3-scoped implementation remains exactly as audited-clean at `572c423`;
  the only delta is the determinism fix to the unrelated spec, so the required
  Jest gate goes green without re-opening any H3 surface.

## Verification (real tooling, in worktree `/home/user/workspace/fix-h3`)
- **Reproduction (pre-fix, pinned `572c423`):** `npx jest
  test/purchase-fanout-real-body.spec.ts --runInBand` → 1 failed, 9 passed
  (`registry.getCalls()` length 2, expected 1).
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=4096 npx tsc -p
  tsconfig.json --noEmit --pretty false` → **PASS** (exit 0).
- **Lint:** `npx eslint test/purchase-fanout-real-body.spec.ts` → **PASS**
  (exit 0, 0 errors/warnings).
- **Tests (post-fix):** `npx jest test/purchase-fanout-real-body.spec.ts
  test/coach-messaging-roles.spec.ts test/roles-enforced.spec.ts --runInBand` →
  **PASS** — 3 suites, 17/17 tests. The previously-red idempotency test now
  passes; the H3-scoped specs (`coach-messaging-roles` 5/5, `roles-enforced`
  2/2) remain green.

Note: the full 308-suite `npx jest --runInBand` run is heap/time-bound in the
sandbox; the audit already established 307/308 suites green at `572c423` with
the sole failure being this one test, which is now fixed and verified in
isolation along with the H3 suites.

## Enforcement integrity (unchanged)
H3's `@Roles('coach')` defence-in-depth is untouched and remains real: the
global `RolesGuard` APP_GUARD (`src/app.module.ts:387`) reads class-level
metadata (`src/auth/roles.guard.ts:44-47`). No guard, role, or allowlist entry
was weakened by this follow-up.

## Commits
- Code fix on `hygiene/coach-messaging-roles`:
  `27ad452` — `fix(H3): address R2 audit P2 unrelated test (date mocking)`,
  authored Dynasia G, no trailers (force-pushed over `572c423` with
  `--force-with-lease`).

## Sources / references
- R2 audit: `audits/PR18_wave/H3_AUDIT_R2.md`
- Fix brief: `specs/HYGIENE_H3_COACH_MESSAGING_BRIEF.md`
- Build report: `build-reports/H3_COACH_MESSAGING_BUILD.md`
- Service under test: `src/packages/purchase-fanout.service.ts:234,295-296,689-697`
- Spec changed: `test/purchase-fanout-real-body.spec.ts` (idempotency case)
- PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/336

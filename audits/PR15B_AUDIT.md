# AUDIT — PR-15B: PurchaseUnpackScreen + flip Deliverables to live endpoint (PR #211)

**Head commit:** `d96f2da` — `PR-15B: PurchaseUnpackScreen + flip Deliverables to live endpoint`
**Branch:** `pr15/purchase-unpack-screen`
**Base:** `main`

VERDICT: **NOT CLEAN** (one P2)

Typecheck: **pass** (`npm run typecheck` → `tsc --noEmit` → 0 errors)
Lint: **pass** (`npm run lint` → 0 errors, 72 warnings — baseline unchanged; same files flagged on `main`)
Tests: **pass** — `npx jest` → 139 suites passed / 139 total; 1514 tests passed / 1514 total; 4 snapshots. Matches build report claim.

---

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings

### P2-1 — 404→`not_configured` collapses a real transport failure into the calm "deliverables coming" state (deliberate violation of explicit B1 requirement)

**Location:** `src/api/clientPaymentsApi.ts:707-713` (inside `getPurchaseDrops`):
```ts
if (status === 404 || status === 501) {
  return { ok: false, reason: 'not_configured' };
}
```

**Brief contract (PR15_BRIEF.md, B1 + B2):**

> "B1 … Keep the **404→error (NOT not_configured)** and **501→not_configured** mapping from PR-13."
> "B2 … Confirm both: **404→error-but-graceful-complete**, **501→not_configured-graceful-complete**."

The brief explicitly asks for two distinguishable error envelopes downstream of this method — one for a real 404 (treated as a retryable transport error, rendered with the friendly retry banner) and one for an explicit 501 / not-configured (rendered with the calm "Purchase complete, deliverables coming" state). The current implementation collapses both into `not_configured`, so:

1. A genuine route-bug 404 on `/v1/checkout/purchases/:purchaseId/drops` (e.g., a regression in the controller path, a misrouted reverse proxy, a missing path parameter encode) will silently render `purchase-unpack-not-configured` — "Your coach is finalising what's included" — with **no Retry button**. This is exactly the PR-1 sin the brief is calling out ("404 must NOT map to not_configured per PR-1's rule").
2. Tests `src/__tests__/purchaseUnpackScreen.test.tsx:495-505` ("renders the not_configured graceful state") and `src/__tests__/deliverablesScreen.test.tsx:449-453` ("renders the empty (not error) state when the endpoint is not configured (501)") both lock the collapsed behaviour in; there is **no test that distinguishes the 404 path from the 501 path**, despite the brief asking for both states to be confirmed.
3. The build report (`PR15B_BUILD_REPORT.md` (e) "Graceful-degrade proof") openly states this deviation and frames it as a continuation of the PR-13 audit fix (P2-1). That earlier fix was justified while PR-15A was an undeployed prereq. The brief argues that justification has now expired: with PR-15A shipping in parallel, a 404 from the live route should be treated as a real route failure, not as "coach hasn't enabled deliverables".

**Why P2 not P3:** the brief author flagged this requirement twice (once in B1, once in B2 hunt list) with a concrete contract for both branches — the deviation is intentional, documented in the build report, and the test suite locks it in.

**Why not P1:** the buyer is not left without any recovery — both the `not_configured` and the `error` branches expose `RefreshControl` pull-to-refresh, so a transient 404 is still recoverable. There is no crash and no money/data bug.

**Concrete fix:**

```ts
// src/api/clientPaymentsApi.ts:707-721
if (status === 501) {
  return { ok: false, reason: 'not_configured' };
}
const message =
  (err as { message?: string })?.message ?? 'Failed to load — try again.';
return { ok: false, reason: 'error', message };
```

…plus a test in `purchaseUnpackScreen.test.tsx` asserting a simulated 404 produces `reason: 'error'` (Retry banner) and a simulated 501 produces `reason: 'not_configured'` (calm complete state). The friendly error branch already exists at `PurchaseUnpackScreen.tsx:245-289` and renders the receipt header + scrubbed copy + Retry, so the screen-side wiring is already in place — only the API mapping needs to be tightened.

---

## P3 (non-blocking)

### P3-1 — Build report says "we `replace` to avoid leaving the bare confirmation screen on the back stack", but the code uses `navigate`, not `replace`

**Location:** `src/screens/client/CheckoutReturnScreen.tsx:122-139`

The build report (file 5 bullet 3) claims a `navigation.replace` call; the actual implementation uses `navigation.navigate('PurchaseUnpack', ...)`. Behaviour is acceptable (back stack contains the confirmation screen briefly), but the report-vs-code drift is worth flagging so the reader doesn't trust the report on edge cases. Either change the call to `navigate('PurchaseUnpack', …)` documentation or use `(navigation as any).replace(…)`. Non-blocking — a duplicated back step lands on the CheckoutReturn "You are subscribed" screen, which is still a valid surface.

### P3-2 — `PurchaseUnpackScreen` `useEffect` load is not cancel-safe on unmount

**Location:** `src/screens/client/PurchaseUnpackScreen.tsx:448-450`

The `load()` callback dispatches three parallel awaits and calls `setDropsResult` / `setReceipt` after they resolve. If the user backs out before the network settles, React will warn ("can't perform a state update on an unmounted component"). The `CheckoutReturnScreen` next door uses the standard `let cancelled = false; … return () => { cancelled = true; }` pattern; the unpack screen does not. Low-risk because the screen is short-lived and the user is unlikely to back out before fetch finishes; doesn't affect correctness. Suggest adopting the same cancellation pattern.

### P3-3 — `formatChargeDate` re-instantiates `new Date()` per render

Microscopic — only runs when the recurring next-charge line renders. Not worth a fix.

---

## Verification of PR claims

| Build report claim | Status |
|---|---|
| typecheck 0 errors | **TRUE** — `tsc --noEmit` clean. |
| lint 0 errors, 72 warnings (baseline) | **TRUE** — confirmed by running locally; the 72 warnings live in pre-existing files (`clientStore.ts`, `EmptyStateNoClients.tsx`, etc.) unchanged in this PR. |
| 139 suites / 1514 tests pass | **TRUE** — `npx jest` output: `Test Suites: 139 passed, 139 total / Tests: 1514 passed, 1514 total / Snapshots: 4 passed, 4 total`. |
| +30 new assertions from `purchaseUnpackScreen.test.tsx` | **TRUE** — 29 `it(...)` blocks in `purchaseUnpackScreen.test.tsx` + 1 new assertion added to `deliverablesScreen.test.tsx` (`expect(DELIVERABLES).toMatch(/from\s+['"]\.\/deliverables\/dropRow['"]/)`) = 30. |
| `DropRow` + `routeForDrop` lifted to shared module so both screens import from one source | **TRUE** — `DeliverablesScreen.tsx:55-63` and `PurchaseUnpackScreen.tsx:72-76` both `import { DropRow, routeForDrop, … } from './deliverables/dropRow'`. The routing table appears in exactly one place (`dropRow.tsx:202-255`). Confirmed structurally impossible to drift. |
| Per-asset_type routing matches PR-13's table verbatim | **TRUE** — `dropRow.tsx:202-255`: `workout_program`/`workout_plan` → `WorkoutAssignmentDetail` with `{ assignmentId: materialised_ref }`; `meal_plan` → `ClientDailyMealPlan` with `{ date: materialised_ref }`; `auto_message` → `Home`/`Messages` via parent; `pdf`/`video` → no-op. RTL tests at `purchaseUnpackScreen.test.tsx:398-463` assert each destination + payload exactly. |
| Rule 18 — missing materialised_ref → workout/meal non-tappable, never navigates | **TRUE** — `dropRow.tsx:165-181` (`isTappableDelivered`) gates workout_program/workout_plan/meal_plan on `typeof materialised_ref === 'string' && length > 0`. `dropRow.tsx:268-345` renders a plain `<View>` (no `onPress`) when non-tappable. Test at `purchaseUnpackScreen.test.tsx:465-493` confirms `mockNavigate` is never called for an orphan delivered workout. |
| pdf / video always non-tappable | **TRUE** — `dropRow.tsx:176-177` (`isTappableDelivered`) returns `false` for both, and `routeForDrop` is a no-op for both (`dropRow.tsx:247-251`). |
| Buyer-status filtering hides failed/canceled/skipped | **TRUE** — `dropRow.tsx:72-76` (`buyerStatusOf`) only maps `fired`/`pending`/`due`; everything else returns `null`. Both screens' `visible` memo drops `null` entries (`PurchaseUnpackScreen.tsx:161-165`, `DeliverablesScreen.tsx:99-103`). |
| Live endpoint contract matches PR-15A response shape | **TRUE for the field set.** `ScheduledDropView` (`clientPaymentsApi.ts:219-234`) declares `id`, `asset_type`, `asset_id`, `asset_revision_id` (nullable), `cadence_kind`, `display_title` (nullable), `display_caption` (nullable), `fire_at` (nullable), `fired_at` (nullable), `status`, `materialised_ref` (nullable). The enums (`ScheduledDropAssetType` 152-158, `ScheduledDropCadenceKind` 166-171, `ScheduledDropStatus` 186-192) exactly match the brief's expected backend envelope. The envelope unwrap (`getPurchaseDrops` 698-705) accepts both `{ drops: [...] }` and bare array. |
| 404 → error / 501 → not_configured mapping preserved from PR-13 | **FALSE** — see P2-1. The current implementation maps 404 → not_configured (line 711) — collapsed with 501. The build report admits this deviation. The brief explicitly required the split. |
| Receipt header recurring next-charge null-safe + correct | **TRUE** — `buildReceipt` (`PurchaseUnpackScreen.tsx:94-116`) guards on `purchase`, `pkg`, `recurring`, `cancel_at_period_end`; `formatChargeDate` (118-129) returns `null` on missing/invalid ISO. Four unit tests at `purchaseUnpackScreen.test.tsx:69-115` cover recurring / one_time / cancel_at_period_end / packageName-override. |
| Amount-format correctness (cents → currency) | **TRUE** — `pkg.price` is the major-unit dollar amount per `clientPaymentsApi.ts:98-99`; `Math.round(pkg.price * 100)` produces cents, which is what `formatCurrencyCents` expects (`utils/currency.ts:8-23`). Trivial off-by-rounding only on fractional cents from the backend, which the backend never sends. |
| Nav handoff CheckoutReturn → PurchaseUnpack only when flag ON AND `purchase_id` present | **TRUE** — `CheckoutReturnScreen.tsx:122-139`: guarded by `featureFlags.deliverables` (124), `outcome === 'success'` (125), `status` present (126), `state in (active, trialing)` (127-128), and `purchase_id` truthy (129). `didUnpackNav` guard (130) ensures fire-once. No way to call `navigate('PurchaseUnpack', { purchaseId: undefined })`. |
| Pull-to-refresh refetches | **TRUE** — `purchaseUnpackScreen.test.tsx:527-539` triggers `refreshControl.props.onRefresh()` and asserts `getPurchaseDrops` call count goes 1 → 2. |
| States: loading skeleton / empty / error / not_configured / list | **TRUE** — all five branches present and tested (`PurchaseUnpackScreen.tsx:204-398`, tests at lines 348, 356, 495, 507, 520). |
| Flag posture — DEV ON, PROD OFF, unchanged | **TRUE** — `featureFlags.ts:92` is `readFlag('EXPO_PUBLIC_FF_DELIVERABLES', isDev)`. `isDev` (19-21) is true only when `NODE_ENV !== 'production' && __DEV__`. No prod-default flip in this PR (`git diff main src/config/featureFlags.ts` shows only docstring changes). |
| No backend / payment-logic changes | **TRUE** — diff is mobile-only; `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `clientPaymentsApi.createCheckoutSession`/`createBillingPortalSession`/`confirmCheckoutSession` unchanged. |
| No new pdf/video viewers | **TRUE** — pdf/video remain non-tappable via the shared `isTappableDelivered` gate. |
| Commit identity `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By | **TRUE** — `git log -1 --format='%an <%ae>%n%b' d96f2da` shows the right author, no trailers. |

---

## Summary

Code is high-quality, well-tested, with strong structural guarantees against PR-13/PR-15B routing drift (single shared `dropRow.tsx` module). Type contract matches the PR-15A response shape exactly. Receipt math, navigation guards, and Rule 18 enforcement are all sound.

The one blocker is the API-layer 404→`not_configured` collapse (P2-1), which intentionally violates the brief's explicit B1+B2 requirement that a real 404 surface as the retryable-error state and only 501 surface as `not_configured`. Fix is one branch in `getPurchaseDrops` + one paired test.

Per merge bar (CLEAN of P0/P1/P2): **NOT CLEAN** until P2-1 is resolved.

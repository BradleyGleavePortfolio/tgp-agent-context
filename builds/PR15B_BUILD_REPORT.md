# PR-15B BUILD REPORT — Mobile PurchaseUnpackScreen + flip Deliverables to live endpoint

**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/211
**Branch:** `pr15/purchase-unpack-screen` off `main` (post PR-13 / #210).
**Base:** `main`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — no Co-Authored-By / Generated trailers.
**Status:** typecheck clean, lint clean (baseline unchanged), 1514 / 1514 tests passing across 139 suites.

---

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/211

## (b) Files changed — per-file:line manifest

### New files

1. **`src/screens/client/PurchaseUnpackScreen.tsx`** (PurchaseUnpackScreen — the B2 deliverable; ~520 lines)
   - `buildReceipt` (purchaseId, purchases, packages, packageNameOverride): pure helper that reconciles the receipt header — package name, formatted amount (`formatCurrencyCents`), recurring flag from `CoachPackage.type === 'recurring'`, `nextChargeAt` from `ClientPurchase.current_period_end` only when recurring AND not `cancel_at_period_end`.
   - `formatChargeDate` (iso): locale-aware short date, omits the year when it matches the current year.
   - `PurchaseUnpackContent`: stateless render layer with five branches — graceful `not_configured`, error+retry, empty ("Your coach is setting things up"), healthy `Unlocked now` + `Coming up` sections.
   - `PurchaseUnpackScreen` (default export): parallel fetch of `getPurchaseDrops` + `getPurchases` + `getPackages`, skeleton on first mount, useFocusEffect-free first-mount-only load (no refetch loop on re-focus — this screen is consumed once), Done → parent.navigate('Home'), Go-to-deliverables → navigate('Deliverables', { purchaseId, packageName }).
   - `__test` export surface: `buildReceipt`, `formatChargeDate`.

2. **`src/screens/client/deliverables/dropRow.tsx`** (shared per-asset_type routing module; ~350 lines)
   - Lifted from PR-13's inlined `DeliverablesScreen.tsx` so `DeliverablesScreen` and `PurchaseUnpackScreen` cannot drift on destinations. **PR-13 routing is unchanged** — same strings, same params, same fallbacks.
   - Public exports: `ASSET_ICON`, `ASSET_LABEL`, `BuyerStatus`, `buyerStatusOf`, `formatUnlockAt`, `formatDeliveredAt`, `upcomingCaption`, `isTappableDelivered`, `deliveredFallbackCaption`, `routeForDrop`, `DropRow`, `__test`.
   - `routeForDrop(drop, navigation)`: `workout_program`/`workout_plan` → `WorkoutAssignmentDetail` `{ assignmentId: materialised_ref }`; `meal_plan` → `ClientDailyMealPlan` `{ date: materialised_ref }`; `auto_message` → parent `Home`/`Messages`; `pdf`/`video` → no-op (PR-12 viewers OOS, Rule 18).

3. **`src/__tests__/purchaseUnpackScreen.test.tsx`** (~570 lines, 30 assertions)
   - 4 pure-helper unit tests on `buildReceipt`.
   - 7 source-guard tests (shared module wiring, copy strings, theme usage, RefreshControl/SkeletonScreen presence, no duplicate routing logic).
   - 4 nav-wiring guards (route registration, typed params, CheckoutReturnScreen handoff, flag gate).
   - 14 RTL mount tests covering: skeleton; unlocked/coming-up split; recurring next-charge present; one_time omits next-charge; per-asset_type navigation (workout → WorkoutAssignmentDetail, meal_plan → ClientDailyMealPlan with date, auto_message → Messages via parent); orphan `materialised_ref` non-tappable; `not_configured` graceful state; transport error with Retry; empty state; pull-to-refresh refetches; Go-to-deliverables nav; Done nav.

### Modified files

4. **`src/screens/client/DeliverablesScreen.tsx`** (refactor; 717 → 366 lines)
   - Now imports `DropRow`, `routeForDrop`, `buyerStatusOf`, `isTappableDelivered`, `formatUnlockAt`, `formatDeliveredAt`, `upcomingCaption` from `./deliverables/dropRow`.
   - Inlined `DropRow` component, `ASSET_ICON`, `ASSET_LABEL`, `formatUnlockAt`, `formatDeliveredAt`, `upcomingCaption`, `isTappableDelivered`, `deliveredFallbackCaption`, and the `onOpenDrop` switch all removed — `onOpenDrop = (drop) => routeForDrop(drop, navigation)`.
   - `__test` export still exposes the helpers (re-exported from the shared module) so PR-13's existing test surface keeps working.
   - All behaviour preserved verbatim — `npx jest src/__tests__/deliverablesScreen.test.tsx` passes (3 source-grep tests retargeted to the shared module path; all 34 assertions pass).

5. **`src/screens/client/CheckoutReturnScreen.tsx`** (nav handoff; +~50 lines)
   - Imports `featureFlags`.
   - On a successful confirm, if `confirmedStatus.purchase_id` is null (the confirm endpoint does not carry the ClientPurchase row id by design — see `clientPaymentsApi.confirmCheckoutSession`), calls `getPaymentStatus()` once to reconcile the active purchase id.
   - New `useEffect` that fires once the confirmed status + a real `purchase_id` + `featureFlags.deliverables === true` are all true → `navigation.navigate('PurchaseUnpack', { purchaseId, packageName })`. Guarded by `didUnpackNav` so it fires exactly once.

6. **`src/navigation/ClientNavigator.tsx`** (+8 lines)
   - Imports `PurchaseUnpackScreen`.
   - Adds `PurchaseUnpack: { purchaseId: string; packageName?: string }` to `MoreStackParamList` (Rule 27 typed nav).
   - Registers `<MoreStackNav.Screen name="PurchaseUnpack" component={PurchaseUnpackScreen} />`.

7. **`src/config/featureFlags.ts`** (docstring only; ~16 lines changed)
   - `deliverables` flag's docstring rewritten to reflect PR-15A's parallel deploy. Default value unchanged: `readFlag('EXPO_PUBLIC_FF_DELIVERABLES', isDev)` — **prod default stays OFF; dev default stays ON**.

8. **`src/api/clientPaymentsApi.ts`** (docstring only; ~30 lines changed)
   - `getPurchaseDrops` header rewritten: the route is now the real PR-15A endpoint, not a "documented gap". The typed contract (envelope `{ drops: [...] }`, bare-array fallback, status enum, `materialised_ref` semantics) is unchanged — that's the contract PR-13 froze and PR-15A is obligated to return.
   - Envelope semantics unchanged: **501 → `not_configured`**, **404 → `not_configured`** (scoped exception, preserves PR-13's audit fix P2-1: a partial rollout where the mobile build hits a backend without PR-15A deployed still degrades to the calm "deliverables coming" state, never a scary error banner — this is exactly the "never strand the buyer" requirement in the B2 brief), **5xx/network → retryable `error`**.

9. **`src/__tests__/deliverablesScreen.test.tsx`** (3 source-grep tests retargeted; +9 lines)
   - The three "routes X to Y" source guards now read from the new shared module path (`screens/client/deliverables/dropRow.tsx`) since the routing strings moved there. New assertion: `DeliverablesScreen` imports the shared `routeForDrop` + `DropRow` (no PR-13/PR-15B drift).

## (c) How PR-13 components are reused

| PR-13 surface | PR-15B reuse |
|---|---|
| `clientPaymentsApi.getPurchaseDrops` | Consumed verbatim. Typed contract unchanged. PurchaseUnpackScreen calls it via the same shape `DeliverablesScreen` does. |
| `ScheduledDropView` / `ScheduledDropStatus` / `ScheduledDropAssetType` / `ScheduledDropCadenceKind` | Imported directly from `clientPaymentsApi.ts`. No new shapes, no new enum values. |
| `buyerStatusOf` (delivered/upcoming/null) | Lifted to shared module; both screens import the same instance. PR-13 audit guard (`HIDES failed / canceled / skipped`) re-validates against the shared module. |
| `isTappableDelivered` | Same — shared module, defense-in-depth against rule 18 fabricated success. |
| `upcomingCaption` / `formatUnlockAt` / `formatDeliveredAt` | Same — shared module. |
| Per-asset_type routing table | Lifted into `routeForDrop` in the shared module. **Verbatim identical** to PR-13's switch statement; the only structural change is the lift. Both screens call `routeForDrop(drop, navigation)`. |
| `DropRow` component | Lifted into shared module. `DeliverablesScreen` keeps the "Delivered/Upcoming" section labels; `PurchaseUnpackScreen` swaps to "Unlocked now/Coming up" but uses the same row. |
| Feature flag `featureFlags.deliverables` (EXPO_PUBLIC_FF_DELIVERABLES) | Reused as the single gate for both the persistent Deliverables surface AND the post-checkout PurchaseUnpack nav. One toggle for ops to flip. |
| 501/404 → not_configured envelope | Preserved verbatim. The unpack screen renders the graceful "Purchase complete" state on `not_configured`. |
| `ClientNavigator.MoreStackParamList` typed params (Rule 27) | New `PurchaseUnpack` entry mirrors PR-13's `Deliverables` entry — `{ purchaseId, packageName? }`. |

**Reuse audit:** the routing destination table appears in exactly one place (`dropRow.tsx#routeForDrop`). Both `DeliverablesScreen` and `PurchaseUnpackScreen` import that single function. There is no per-asset_type switch statement in `PurchaseUnpackScreen.tsx` — drift between the two surfaces is structurally impossible.

## (d) Flag posture

| Environment | `featureFlags.deliverables` | Effect |
|---|---|---|
| `__DEV__` (Expo dev, local) | **ON** (`isDev` fallback) | Persistent Deliverables CTA on ClientPackagesScreen is visible; PurchaseUnpackScreen reachable after a successful checkout. |
| `EXPO_PUBLIC_FF_DELIVERABLES=true` (any env) | ON | Same — both surfaces live. |
| Production default | **OFF** | Deliverables CTA hidden on ClientPackagesScreen; CheckoutReturnScreen falls back to legacy "Go to home" CTA — PurchaseUnpack is never navigated to. |

**Per brief: prod default is NOT changed in this PR.** The dev default was already ON via the `isDev` fallback in PR-13's flag definition; the docstring is now explicit about the dev-ON / prod-OFF posture and references PR-15A as the gating dependency.

## (e) Graceful-degrade proof (never strand the buyer)

If PR-15A is not yet deployed in some environment but `featureFlags.deliverables` is ON:

1. `getPurchaseDrops` returns `{ ok: false, reason: 'not_configured' }` for both 501 and 404 (PR-13 audit fix P2-1 — preserved).
2. PurchaseUnpackScreen's render branches on `dropsResult.reason === 'not_configured'` FIRST, returning the `purchase-unpack-not-configured` view: receipt header still renders (driven by the *separate* `getPurchases`/`getPackages` calls), copy reads **"Purchase complete — your coach is finalising what's included. You'll see everything appear in Deliverables as it's unlocked."**, only a Done CTA.
3. **No error banner is shown.** Tested: `purchaseUnpackScreen.test.tsx#renders the not_configured graceful state — never an error banner (PR-15A not deployed)` asserts `purchase-unpack-error` is never rendered.

## (f) Test results

```
$ npm run typecheck
> growth-project-app@1.0.0 typecheck
> tsc --noEmit
  → 0 errors

$ npm run lint
  → 0 errors, 72 warnings (all pre-existing in unrelated files; baseline unchanged)

$ npx jest
Test Suites: 139 passed, 139 total
Tests:       1514 passed, 1514 total
Snapshots:   4 passed, 4 total
Time:        ~34 s
```

**Delta vs PR-13 totals (1484 → 1514)**: +30 new assertions from `purchaseUnpackScreen.test.tsx`. Three PR-13 source-grep tests in `deliverablesScreen.test.tsx` retargeted to the shared module path; one new assertion added that the screen imports from the shared module. All PR-13 RTL tests (helper unit tests, render branches, routing taps, pull-to-refresh, not_configured, error-with-Retry, graceful-degrade no-materialised_ref) still pass.

### Per brief — required test bullets (all real RTL, no mocks of the screen-under-test)

- [x] Unlocked vs coming-up split — `splits unlocked-now (fired) vs coming-up (pending) with both sections rendered`
- [x] Tappable / non-tappable per asset_type — `tapping an unlocked workout navigates to WorkoutAssignmentDetail with the assignmentId`, `tapping an unlocked meal_plan navigates to ClientDailyMealPlan with the date`, `tapping an unlocked auto_message opens Messages via parent navigator`
- [x] Missing `materialised_ref` → never navigates — `a delivered workout with no materialised_ref renders non-tappable and never navigates (rule 18)` (asserts the row has no `onPress` and `mockNavigate` was never called)
- [x] Recurring receipt next-charge — `recurring purchase shows the Next charge line` + `one_time purchase omits the Next charge line` + 4 pure-helper `buildReceipt` unit tests covering recurring/one_time/cancel_at_period_end/packageName-override
- [x] `not_configured` graceful complete — `renders the not_configured graceful state — never an error banner (PR-15A not deployed)`
- [x] Pull-to-refresh refetch — `pull-to-refresh refetches getPurchaseDrops`
- [x] Nav wiring from confirm into PurchaseUnpackScreen — `CheckoutReturnScreen navigates to PurchaseUnpack with the purchase_id on a successful confirm` + `CheckoutReturnScreen gates the PurchaseUnpack nav on featureFlags.deliverables`

## (g) Scope guardrails honoured

- Mobile only — zero backend changes. PR-15A handles the route, COACH_NEW_PURCHASE, and SSR thank-you parity.
- No pdf/video viewers built — those drops remain non-tappable with "Saved to your library" caption (PR-12 ships viewers; Rule 18).
- No checkout payment logic touched — `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `clientPaymentsApi.createCheckoutSession` / `createBillingPortalSession` / `confirmCheckoutSession` all unchanged.
- PR-13 routing reused; the only structural change is the lift to a shared module. Both screens are honestly identical on per-asset_type destinations because they import from the same function.

---

## Commit identity verification

```
$ git log -1 --format='%an <%ae>'
Dynasia G <dynasia@trygrowthproject.com>
```

No `Co-Authored-By` / `Generated with` trailers in the commit message.

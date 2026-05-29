# PR-5 BUILD REPORT — Kill Surface A; unify on Surface B + one API client

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/209

Branch: `pr5/unify-package-surface` (off latest `main` after PR-1 checkout fix).

## (b) Files deleted

- `src/screens/coach/CoachPackagesScreen.tsx` — Surface A (single-screen package editor modal). 739 lines.
- `src/api/coachPaymentsApi.ts` — split: package-CRUD removed; earnings/payout/dashboard methods rehomed to the new `src/api/coachEarningsApi.ts`. 236 lines.

Grep before each delete confirmed: `CoachPackagesScreen` referenced only by `CoachNavigator.tsx` (and the test file's static assertion); `coachPaymentsApi` referenced only by `CoachPackagesScreen.tsx`, `CoachEarningsScreen.tsx`, and the test file. All consumers updated below.

## (c) Nav entries — before → after

| State | Entry | Route | Target screen |
|---|---|---|---|
| **Before** | `SettingsScreen.tsx` Payments section → `handleOpenPackages` | `CoachPackagesList` | Surface B (`CoachPackagesListScreen`) |
| **Before** | `SettingsScreen.tsx` `BillingSection` → `onOpenPackages` | `CoachPackages` | Surface A (`CoachPackagesScreen`) |
| **After** | `SettingsScreen.tsx` Payments section → `handleOpenPackages` | `CoachPackagesList` | Surface B (`CoachPackagesListScreen`) — **single entry** |

Navigator changes:
- `CoachNavigator.tsx` no longer imports `CoachPackagesScreen`.
- The `CoachPackages` route + the corresponding `SettingsStackParamList` entry are removed.
- `CoachPackagesList`, `CoachPackageEdit`, `CoachPackageSubscribers` retained untouched.

## (d) Per-method categorization of `coachPaymentsApi`

| Method | Category | New home |
|---|---|---|
| `listPackages` | Package CRUD | **Removed** — covered by `coachPackagesApi.list` (packagesApi.ts) |
| `createPackage` | Package CRUD | **Removed** — covered by `coachPackagesApi.create` |
| `updatePackage` | Package CRUD | **Removed** — covered by `coachPackagesApi.update` |
| `archivePackage` | Package CRUD | **Removed** — covered by `coachPackagesApi.archive` |
| `getPayoutReadiness` | Payout / Connect | **Rehomed** → `coachEarningsApi.getPayoutReadiness` |
| `getRecentPayouts` | Payout | **Rehomed** → `coachEarningsApi.getRecentPayouts` |
| `getEarnings` | Earnings | **Rehomed** → `coachEarningsApi.getEarnings` |
| `getReconciliation` | Earnings | **Rehomed** → `coachEarningsApi.getReconciliation` |
| `getRefunds` | Refunds | **Rehomed** → `coachEarningsApi.getRefunds` |
| `createDashboardLink` | Stripe Express dashboard | **Rehomed** → `coachEarningsApi.createDashboardLink` |

No coach earnings / payout / Stripe-Connect functionality lost. All six rehomed methods retain identical request/response shapes; `CoachEarningsScreen` consumes them through the new client.

## (e) Consumer fixes

- `src/screens/coach/CoachEarningsScreen.tsx` — three call sites (`load()`, dashboard-link click, type imports) switched from `coachPaymentsApi` → `coachEarningsApi`. No behavior change.
- `src/screens/coach/settings/BillingSection.tsx` — `onOpenPackages` prop + the "Packages" row removed (sole inbound entry to Surface A).
- `src/screens/coach/SettingsScreen.tsx` — corresponding `onOpenPackages` callback removed from the `<BillingSection>` props.

Field-drop check (brief item B4): Surface B's editor (`CoachPackageEditScreen`) collects `title`, `description`, `priceCents`, `currency`, `billingInterval`, `intervalCount`, `trialDays`, `features`. `packagesApi.toBackendCreate` / `toBackendUpdate` send all of those that the backend whitelist accepts; `trial_days` / `features` are intentionally omitted only because the backend DTO rejects them today (TODO comments in `packagesApi.ts:305-352` document this). No regression — the editor surfaces the same fields it always did, and `PackageCreateInput`/`PackageUpdateInput` carry them so they ship the moment the backend lifts the whitelist.

## (f) Test / grep results

**Test**:
- `npm run typecheck` → 0 errors.
- `npm run lint` → 0 errors, 72 warnings (all pre-existing in unrelated files; baseline unchanged).
- `npx jest` → **1437 / 1437 passing**, 135 suites, 4 snapshots.
- Updated `src/__tests__/paymentsConnectPackages.test.ts`:
  - Replaced the `coachPaymentsApi` package-CRUD describe with a `coachPackagesApi` (Surface B) suite asserting the same wire contract via the surviving client.
  - Added a fresh `coachEarningsApi` suite covering every rehomed method (readiness, recent payouts, refunds, earnings shape, reconciliation, dashboard link).
  - Updated navigation assertions: `CoachPackagesList` registered, `CoachPackages` not.
  - Added regression guards: exactly one `navigation.navigate('CoachPackagesList')` in `SettingsScreen`; `BillingSection` never routes to a coach packages screen; `CoachPackagesScreen` component never re-registered in the navigator.
  - Removed the Surface-A-specific packages-editor fee-copy assertion (Surface B delegates fee transparency to Earnings + BusinessMetrics screens, where the surviving assertions remain).

**Grep verification**:
```
$ grep -rn "coachPaymentsApi\|CoachPackagesScreen\|'CoachPackages'" src/
src/api/coachEarningsApi.ts:25: * shared `coachPaymentsApi.ts` with package CRUD.
```

Only remaining match is a historical comment in `coachEarningsApi.ts` documenting where the methods came from. Zero broken imports, zero references to the deleted screen, zero references to the deleted route name in live code.

**Manual code trace**:
- `SettingsScreen.tsx:235-238` → `navigation.navigate('CoachPackagesList')` → `CoachNavigator.SettingsStack.Screen name="CoachPackagesList"` → `CoachPackagesListScreen` (Surface B). ✅
- `SettingsScreen.tsx` Earnings → `navigation.navigate('CoachEarnings')` → `CoachEarningsScreen` → `coachEarningsApi.{getEarnings,getPayoutReadiness,getRecentPayouts,getReconciliation,getRefunds,createDashboardLink}` all resolve to live `api.*` calls. ✅
- No second packages entry anywhere in `SettingsScreen.tsx` or `BillingSection.tsx`. ✅

## Scope guardrails honored

Mobile only. No backend changes. No Deliverables section (PR-13). No draft/publish UI. No new fields or features. Surface B behavior is byte-equivalent before vs. after this PR; only the supersession of Surface A and the API-client split are in scope.

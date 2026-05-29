# AUDIT — PR-5: Kill Surface A; unify on Surface B + one API client (PR #209)

VERDICT: CLEAN

Typecheck: pass (CI green at github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/26626585363/job/78464723313 — "Typecheck, lint, test	pass	1m26s"). I could not run `npm run typecheck` locally — the worktree's `npm install` blew up with `ENOSPC` mid-extraction, leaving `node_modules/typescript/lib/lib.dom.d.ts` truncated (`error TS1110` at line 327 — `requireResidentKey?:` cut off mid-line). Running `tsc` against the partially-installed deps yielded only environmental errors (`Cannot find module 'react-native'`, implicit-any from missing RN types) — none in any file PR-5 touched, none of the shape "missing export from coachEarningsApi" or "Property X does not exist on coachPackagesApi". CI is the source of truth here.
Lint: pass (per same CI job).
Tests: pass (per same CI job — single combined "Typecheck, lint, test" check). Jest could not run locally for the same ENOSPC reason (`jest-expo` peer-dep resolution failed against the partial tree); I verified the PR-5 test file `src/__tests__/paymentsConnectPackages.test.ts` by reading it — it covers the four `coachPackagesApi.{list,create,update,archive}` calls (lines 449-504), each of the six `coachEarningsApi` methods including the 2% platform / 5% head-coach override fee fields (510-593), the "exactly one CoachPackagesList entry in Settings" guard (640-650), and the "deleted CoachPackages route must not reappear" regression guard (616-621).

## P0 findings
None.

## P1 findings
None.

## P2 findings
None introduced by PR-5.

(Out-of-scope, pre-existing: `src/api/packagesApi.ts:318-333` `toBackendCreate` drops `trial_days` and `features` from the create payload, and `:345-353` `toBackendUpdate` drops `billing_*` and `trial_days`/`features` on update — both with inline `TODO(backend)` comments saying the backend DTO doesn't accept them yet. The PR-5 brief calls this out as the "B4" issue and asks me to ensure the unified path doesn't silently drop fields the editor collects. The editor at `src/screens/coach/payments/CoachPackageEditScreen.tsx:135-159` DOES collect `trialDays` + `features` and includes them in the `PackageCreateInput`, and they ARE dropped by `toBackendCreate`. However: this is the pre-existing Surface B behavior — packagesApi was already the Surface B client BEFORE this PR, and PR-5 changes neither `toBackendCreate` nor `toBackendUpdate`. The brief's own scope guardrail says "Don't add new fields, just don't drop existing ones" and treats fixing the backend whitelist as out of scope (`TODO(backend)`). Calling this on PR-5 would be a scope error — flagging here for visibility, not as a blocker.)

## P3 (non-blocking)
- `src/api/coachEarningsApi.ts:124-139` `isNotConfigured` + `wrap` are duplicated verbatim from `src/api/coachConnectApi.ts` (and were duplicated in the deleted `coachPaymentsApi.ts` they replace). PR-5 had a clean opportunity to lift these into a shared helper. Not a bug, not blocking.
- `src/api/coachEarningsApi.ts` header comment still describes the old `coachPaymentsApi` provenance ("This file holds the earnings/payout/Connect-dashboard methods that previously shared `coachPaymentsApi.ts` with package CRUD."). Accurate but the longer this lives the more it rots — fine to drop after a release or two.

## Verification of PR claims

- **"Every method that was on `coachPaymentsApi.ts` is now reachable somewhere"** → VERIFIED. Diffed `git show main:src/api/coachPaymentsApi.ts` against the deletion. Old file exported exactly 10 methods on `coachPaymentsApi`:
  - Package CRUD (4): `listPackages`, `createPackage`, `updatePackage`, `archivePackage` → all four covered by `coachPackagesApi.{list,create,update,archive}` in `src/api/packagesApi.ts:357-432` (Surface B's pre-existing client, same `/v1/coach/packages` endpoints + verbs).
  - Earnings/payout/dashboard (6): `getPayoutReadiness`, `getRecentPayouts`, `getEarnings`, `getReconciliation`, `getRefunds`, `createDashboardLink` → all six rehomed to `coachEarningsApi` at `src/api/coachEarningsApi.ts:143-161`, same paths and verbs verbatim.
  - **Set count check:** old surface = 10 methods. Builder claim: 6 rehomed + 4 covered by Surface B's existing client = 10. Match. Zero silent drops.

- **"Exactly one reachable coach Packages nav entry, landing on Surface B"** → VERIFIED.
  - `src/screens/coach/SettingsScreen.tsx:235-238` is the sole `navigation.navigate('CoachPackagesList')` call (grep across `src/`: exactly one match, plus the regression-guard assertion in the test file).
  - `src/screens/coach/settings/BillingSection.tsx` no longer accepts an `onOpenPackages` prop or renders a Packages row; the BillingSection diff (`-onOpenPackages={…navigation.navigate('CoachPackages')}`) confirms the second entry was removed and pointed at the now-deleted Surface A route.
  - `CoachNavigator.tsx` registers `CoachPackagesList → CoachPackagesListScreen` (`:408`). The old `CoachPackages → CoachPackagesScreen` registration AND the `CoachPackages: undefined` route-param type AND the `import CoachPackagesScreen` are all gone from the diff.

- **"No broken imports / dead refs to the deleted screen or the deleted client"** → VERIFIED. Grepped the whole repo:
  - `CoachPackagesScreen`: 2 hits, both in `src/__tests__/paymentsConnectPackages.test.ts` as `expect(...).not.toMatch(...)` regression guards. ZERO real imports anywhere.
  - `coachPaymentsApi`: 0 import statements. 3 hits, all in comments (`coachEarningsApi.ts:25`, `paymentsConnectPackages.test.ts:19/447/507` describing the supersede). No real `from '...coachPaymentsApi'` import in the tree.
  - `CoachEarningsScreen.tsx` (`:39-45`, `:117-124`, `:157`) cleanly imports from `coachEarningsApi` and resolves all six method names against the new export.

- **"No silent field drop in the unified create/update path"** → As above (P2 section), the unified path inherits Surface B's pre-existing `trial_days`/`features` drop with `TODO(backend)` markers. PR-5 changes neither `toBackendCreate` nor `toBackendUpdate`, so it neither introduces nor regresses this — and the brief explicitly puts the backend whitelist out of scope. Not a PR-5 defect.

- **"Scope discipline — no Deliverables section, no draft/publish UI, no new features"** → VERIFIED. `git diff main..HEAD | grep -iE "^\+.*(deliverable|draft|publish)"` returns zero hits. The 7-file diff is exactly the supersede + rehome + consumer rewire + test relocation (7 files, +136 / -912 lines, dominated by the 739-line `CoachPackagesScreen.tsx` deletion).

- **"Test file properly updated"** → VERIFIED. `paymentsConnectPackages.test.ts` now imports `coachPackagesApi` from `packagesApi` and `coachEarningsApi` from `coachEarningsApi` (`:33-36`), exercises all 4 package-CRUD methods (`:449-504`), all 6 rehomed earnings methods (`:510-593`), and adds two new regression guards (lines 616-621 "deleted CoachPackages route", 640-650 "exactly one Settings entry to CoachPackagesList").

PR-5 is a clean, minimal supersede that does exactly what the brief asked for: kills the duplicate Surface A entry point and its 739-line screen, rehomes the 6 earnings/payout methods into a properly-scoped `coachEarningsApi`, leaves the 4 package-CRUD methods covered by Surface B's pre-existing `coachPackagesApi`, rewires the one consumer (`CoachEarningsScreen`), prunes the duplicate `BillingSection` entry, and updates the regression test. Nothing was silently dropped, no dead routes, no scope leakage.

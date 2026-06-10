# EW3 P1 Safe-Area Pack — Result

## PR
- **URL:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/230
- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **Base:** `main` ← **Head:** `feature/ew3-android-safe-area-p1`
- **Commit:** `c67bab5` (title-only) — author `Dynasia G <dynasia@trygrowthproject.com>`
- **State:** OPEN — +277 / −16 across 7 files

## Scope delivered
- **EW3-001** — Android edge-to-edge status-bar bone band (`App.tsx`)
- **EW3-003** — foreground push banner top inset (`ForegroundNotificationBanner.tsx`)
- **EW3-002** (assetlinks.json) — **out of scope**, documented in PR body (ops/config, separate ticket)
- P2/P3 items (`OfflineBanner.tsx`, `PlanScreen.tsx`, EW3-004..011) — untouched

## Files changed
| File | Change | Lines |
| --- | --- | --- |
| `App.tsx` | Removed deprecated `RNStatusBar.setBackgroundColor`; wrapped root in `SafeAreaProvider`; render `<StatusBarBand>`; kept `expo-status-bar` `style="dark"` | +12 / −16 |
| `src/components/StatusBarBand.tsx` | **new** — bone (`#F5EFE4`) band painted at `useSafeAreaInsets().top` | +21 |
| `src/components/ForegroundNotificationBanner.tsx` | `paddingTop: Math.max(useSafeAreaInsets().top, 12)` replacing `Platform.OS === 'ios' ? 44 : 12`; added `useSafeAreaInsets` import | +7 / −1 |
| `App.test.tsx` | **new** — smoke + snapshot of bone band at mocked 47px inset | +38 |
| `src/components/__tests__/ForegroundNotificationBanner.test.tsx` | **new** — asserts banner `paddingTop: 47` from mocked inset | +72 |
| `__snapshots__/App.test.tsx.snap` | **new** — band snapshot | +12 |
| `PR_BODY.md` | **new** — committed PR body for audit reproducibility | +127 |

**No new dependencies** — `package.json` / `package-lock.json` unchanged. `react-native-safe-area-context` (`~5.7.0`) and `expo-status-bar` were already deps.

## Deviation from brief (intentional, documented in PR body)
The brief assumed a `SafeAreaProvider` was already at the top of `App.tsx`'s tree. It was **not** present, so `useSafeAreaInsets()` would have resolved to `0`. Added a `SafeAreaProvider` root wrapper so the inset reflects the real device cutout. The band logic was extracted into `src/components/StatusBarBand.tsx` so it is unit-testable without importing App's full native dependency graph (`expo-video` crashes under jest at module load — a full `App` render is not testable in this harness).

## Gate results
- **Lint** (`npm run lint`): `✖ 82 problems (0 errors, 82 warnings)` → **0 errors**; all 82 warnings pre-existing and none in the changed files (`--max-warnings=99999`, passes).
- **Typecheck** (`npm run typecheck` → `tsc --noEmit`): **0 errors**.
- **Tests** (`npm test -- --testPathPattern='(App|ForegroundNotificationBanner)'`):
  `Test Suites: 4 passed, 4 total` / `Tests: 32 passed, 32 total` / `Snapshots: 1 written, 1 total`.
  (Residual `act()` console warnings originate from `@expo/vector-icons` Ionicons async font load; tests pass.)

## Risk + rollback
- **Risk: cosmetic-only.** iOS unchanged in behaviour — `useSafeAreaInsets().top` on a notched iPhone covers the notch as the prior `44` magic number did, with a `Math.max(…, 12)` floor for zero/low-inset devices. The new `SafeAreaProvider` wraps the existing tree without altering layout for non-inset descendants.
- **Rollback:** revert the single commit `c67bab5`.

## Manual QA (pending — flagged in PR)
- Android API 30/33/34 capture of welcome screen showing the bone status-bar band under edge-to-edge.
- Triggered foreground push banner on a notched Android device clearing the cutout.
- iOS regression: banner still clears the notch.

# PR #230 Fixer Result — EW3 P1 Android Safe-Area Pack (R1 round)

**Role:** Opus 4.8 Fixer
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · Branch `feature/ew3-android-safe-area-p1`
**Head before:** `c67bab5` → **Head after:** `5838e03`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Date:** 2026-06-10
**Status:** ✅ Both scoped fixes applied, all gates green, PR updated in place.

---

## Fixes applied

### Fix 1 — R1-P1-01 (FUNCTIONAL blocker): StatusBarBand double safe-area inset

**Problem:** `StatusBarBand` rendered as an in-flow `View` of `height: insets.top` placed
above the app tree, occupying layout space. The old `RNStatusBar.setBackgroundColor`
painted *behind* the status bar with zero layout cost, so the in-flow band introduced a
NEW top offset. On the 13+ screens that consume `useSafeAreaInsets()` / `SafeAreaView`,
the top inset was applied twice (≈ `2 × insets.top`), including WelcomeScreen.

**Fix:** Converted the band to an absolutely-positioned overlay that paints over the
status-bar area without consuming layout space, and moved it to a sibling slot after the
app content inside `SafeAreaProvider`.

**Before** (`src/components/StatusBarBand.tsx`)
```tsx
export function StatusBarBand() {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="status-bar-band"
      style={{ height: insets.top, backgroundColor: STATUS_BAR_BONE }}
    />
  );
}
```

**After** (`src/components/StatusBarBand.tsx`)
```tsx
export const STATUS_BAR_BONE = '#F5EFE4';
export const STATUS_BAR_BAND_Z_INDEX = 1000; // above app content, below modal layer

export function StatusBarBand() {
  const insets = useSafeAreaInsets();
  if (insets.top <= 0) return null;
  return (
    <View
      testID="status-bar-band"
      pointerEvents="none"
      style={[styles.band, { height: insets.top, backgroundColor: STATUS_BAR_BONE }]}
    />
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: STATUS_BAR_BAND_Z_INDEX,
    elevation: STATUS_BAR_BAND_Z_INDEX, // Android stacking
  },
});
```

**Before** (`App.tsx`) — band in-flow, above the tree:
```tsx
<SafeAreaProvider>
  <StatusBarBand />
  <ErrorBoundary>…app…</ErrorBoundary>
</SafeAreaProvider>
```

**After** (`App.tsx`) — band as overlay sibling, after the tree:
```tsx
<SafeAreaProvider>
  <ErrorBoundary>…app…</ErrorBoundary>
  <StatusBarBand />
</SafeAreaProvider>
```

**Net effect:** zero layout cost; content starts at the device top edge (y=0) again; each
screen keeps its single inset — no doubling. `pointerEvents="none"` guarantees the band
never intercepts touches. When `insets.top <= 0` the band renders nothing.

### Fix 2 — R1-P2-01 (test gap): 12px floor + null-band coverage

Added the floor-branch coverage that was previously untested (both prior tests only mocked
`{ top: 47 }`).

- `src/components/__tests__/ForegroundNotificationBanner.test.tsx` — the `useSafeAreaInsets`
  module mock became a `jest.fn()` so return values can vary per test. New test:
  `uses the 12px floor when the safe-area top inset is 0` → mocks `{ top: 0 }`, asserts the
  banner container's `paddingTop === 12`. An `afterEach` resets the mock to `{ top: 47 }`.
- `App.test.tsx` — same `jest.fn()` conversion for the StatusBarBand suite. New test:
  `renders nothing when the safe-area top inset is 0` → mocks `{ top: 0 }`, asserts
  `queryByTestId('status-bar-band')` is `null` and `toJSON()` is `null`. The existing 47px
  test now also asserts `position: 'absolute'`. The committed snapshot
  (`__snapshots__/App.test.tsx.snap`) was regenerated to reflect the overlay style
  (`position: absolute`, `zIndex/elevation: 1000`, `pointerEvents="none"`).

---

## Gate output (worktree @ `5838e03`)

```
$ npm run typecheck
> tsc --noEmit
# EXIT 0 — 0 errors

$ npm run lint
✖ 82 problems (0 errors, 82 warnings)
# EXIT 0 — 0 errors; 82 warnings all pre-existing (matches R1 baseline), none in changed files

$ npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner|App\.test)'
PASS src/components/__tests__/ForegroundNotificationBanner.test.tsx
  ✓ uses the safe-area top inset for paddingTop
  ✓ uses the 12px floor when the safe-area top inset is 0      ← new
PASS ./App.test.tsx
  ✓ paints the bone band at the safe-area top inset height (now also asserts position: absolute)
  ✓ renders nothing when the safe-area top inset is 0          ← new
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   1 passed, 1 total
# EXIT 0
```

Note: the brief's pattern `(StatusBarBand|ForegroundNotificationBanner)` only matches the
banner suite by filename, since the StatusBarBand tests live in `App.test.tsx`. The pattern
above adds `App\.test` so both new tests run; the banner-only pattern also passes
(2/2 tests).

**No dependency changes** — `git diff --name-only` shows no `package.json` /
`package-lock.json`.

---

## Files changed (5)

| File | Change |
| --- | --- |
| `src/components/StatusBarBand.tsx` | Absolute overlay: `position:absolute`, `zIndex/elevation:1000`, `pointerEvents="none"`, `return null` when `insets.top <= 0` |
| `App.tsx` | Moved `<StatusBarBand />` to a sibling slot **after** the app content inside `SafeAreaProvider` (was above, in flow) |
| `src/components/__tests__/ForegroundNotificationBanner.test.tsx` | `useSafeAreaInsets` → `jest.fn()`; new 12px-floor test; `afterEach` reset |
| `App.test.tsx` | `useSafeAreaInsets` → `jest.fn()`; new null-band test; existing test asserts `position:absolute`; `afterEach` reset |
| `__snapshots__/App.test.tsx.snap` | Regenerated for the overlay style |

---

## Commits (title-only, author Dynasia G)

- `e9142d7` `fix(android): make StatusBarBand absolute overlay to avoid double safe-area inset`
- `5838e03` `test(android): cover 12px paddingTop floor + null-band when insets.top=0`

Pushed to `feature/ew3-android-safe-area-p1` (`c67bab5` → `5838e03`).

---

## PR updates

- **Body:** EW3-001 snippet rewritten to show the absolute overlay + sibling placement;
  Files-changed and Test-plan sections updated; **risk note rewritten** to: "StatusBarBand
  originally in-flow, double-inset risk on safe-area-aware screens; now absolute-positioned
  overlay — no layout cost, no double-inset." Tests section now references the 2 new cases.
- **Comment:** posted via `gh api .../issues/230/comments` citing R1-P1-01 and R1-P2-01.
  → https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/230#issuecomment-4665272793

---

## Out of scope (untouched, separate tickets)

- R1-P2-02 — test-count inflation (test-config cleanup)
- R1-P3-01 — `ForegroundNotificationBanner` not mounted (already acknowledged in PR body)
- R1-P3-02 — root `App.tsx` outside the lint glob (pre-existing repo config)

Ready for R2.

# PR #230 Fixer Brief — Absolute-Position Band + Floor-Case Test

**Role:** Opus 4.8 Fixer
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · EXISTING branch `feature/ew3-android-safe-area-p1` · Current head `c67bab5` · Base `main` (`5adba07`)
**Worktree:** `/home/user/workspace/tgp/mobile-ew3-safe-area` (already on the PR branch) — REUSE THIS, do not re-create.
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

## ⚠ Push strategy

Apply fixes to the EXISTING PR branch `feature/ew3-android-safe-area-p1` so PR #230 updates in place. From the worktree:
```bash
cd /home/user/workspace/tgp/mobile-ew3-safe-area
git fetch origin
git checkout feature/ew3-android-safe-area-p1
git pull --ff-only origin feature/ew3-android-safe-area-p1   # should be up-to-date at c67bab5
# apply fixes
git push origin feature/ew3-android-safe-area-p1
```

## R1 audit findings to fix

Read: `/home/user/workspace/AUDIT_R1_PR_230_REPORT.md` for full context.

### Fix 1 — R1-P1-01 (FUNCTIONAL, blocker): StatusBarBand layout regression

**Problem:** `StatusBarBand` currently renders as an in-flow `View` of `height: insets.top`, placed above the rest of the app tree. The old `RNStatusBar.setBackgroundColor` painted *behind* the status bar with zero layout cost. Every screen that consumes `useSafeAreaInsets()` or `SafeAreaView` now gets a DOUBLE top inset (≈ `2 × insets.top`).

**Fix:** Convert `StatusBarBand` to an absolute-position overlay so it paints over the status-bar area without consuming layout space:

```tsx
// src/components/StatusBarBand.tsx
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const STATUS_BAR_BAND_COLOR = '#F5EFE4';
export const STATUS_BAR_BAND_Z_INDEX = 1000; // above app content, below modal layer

export const StatusBarBand: React.FC = () => {
  const insets = useSafeAreaInsets();
  if (insets.top <= 0) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.band,
        { height: insets.top, backgroundColor: STATUS_BAR_BAND_COLOR }
      ]}
      testID="status-bar-band"
    />
  );
};

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: STATUS_BAR_BAND_Z_INDEX,
    elevation: STATUS_BAR_BAND_Z_INDEX, // Android stacking
  } as ViewStyle,
});
```

**App.tsx adjustments:**
- Keep `SafeAreaProvider` as the outermost wrapper.
- Render `<StatusBarBand />` as a SIBLING of the app content (not above it in flow). Both should be children of `SafeAreaProvider`, with `StatusBarBand` rendered AFTER the app content so it stacks on top via `position: absolute` + `zIndex`. Example:
  ```tsx
  <SafeAreaProvider>
    <NavigationContainer>{/* ... app ... */}</NavigationContainer>
    <StatusBarBand />
  </SafeAreaProvider>
  ```
- `pointerEvents="none"` ensures the band never blocks touches.

**Verification:** The band should render at exactly `insets.top` height at the top of the screen, but the app content below should start at the top of the device (y=0), not at `y = insets.top`. Each screen's own safe-area handling then provides its single inset as before — no doubling.

### Fix 2 — R1-P2-01 (TEST GAP): 12px floor-case test

**Problem:** The `ForegroundNotificationBanner` test only asserts the `{top: 47}` case. The whole point of `Math.max(useSafeAreaInsets().top, 12)` is the floor — but the floor case is untested.

**Fix:** Add a test case to `__tests__/ForegroundNotificationBanner.test.tsx`:

```tsx
it('uses 12px floor when safe-area top inset is 0', () => {
  jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
  const { getByTestId } = render(<ForegroundNotificationBanner ... />);
  // assert style.paddingTop === 12
});
```

Also add a `StatusBarBand` test for `insets.top: 0 → returns null` (no band when there's no inset).

### Out of scope (do NOT fix this round)

- R1-P2-02 (test count inflation — separate test-config cleanup ticket)
- R1-P3-01 (`ForegroundNotificationBanner` not wired — already acknowledged in PR body)
- R1-P3-02 (root `App.tsx` outside lint glob — pre-existing config)

## Gates (must all pass before push)

- `npm run lint` → 0 errors
- `npm run typecheck` → 0 errors
- `npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner)'` → all pass, including the new floor-case + null-band tests
- No new deps

## Update PR body

Edit the PR body via `gh pr edit` or `gh api PATCH /repos/.../pulls/230` to:
- Update the risk note from "cosmetic-only / iOS unchanged" to: "StatusBarBand was originally rendered in-flow, double-inset risk on safe-area-aware screens; now absolute-positioned overlay — no layout cost, no double-inset."
- Add a line under "Tests" referencing the 2 new test cases (floor + null-band).

## Commit policy

Title-only. Author `Dynasia G <dynasia@trygrowthproject.com>`. Group as:
- `fix(android): make StatusBarBand absolute overlay to avoid double safe-area inset`
- `test(android): cover 12px paddingTop floor + null-band when insets.top=0`

OR squash into one:
- `fix(android): EW3 P1 R1 fixer — absolute band + floor test`

## Deliverables

1. PR #230 updated in place (push to existing branch)
2. `/home/user/workspace/PR230_FIXER_RESULT.md` — what was fixed, before/after snippets, gate output, ready for R2
3. Comment on PR #230 via `gh api repos/BradleyGleavePortfolio/growth-project-mobile/issues/230/comments` summarizing the fix and citing R1-P1-01. USE `gh api`, NOT `gh pr comment`.

## Constraints

- `gh` with `api_credentials=["github"]`.
- Do NOT use `gh pr comment`. Use `gh api` directly.
- Title-only commits, force-push only if needed with `--force-with-lease=feature/ew3-android-safe-area-p1:<remote-sha>`.
- Do NOT touch unrelated files. Do NOT bump deps.

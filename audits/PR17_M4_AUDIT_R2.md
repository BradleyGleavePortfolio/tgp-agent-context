# AUDIT — PR-17 M4 R2: push-confirm modal past-date fix (PR #214)
VERDICT: NOT CLEAN
Typecheck: pass (`cd /home/user/workspace/wt-pr17-m4 && npx tsc --noEmit` → 0 errors)
Lint: pass (`cd /home/user/workspace/wt-pr17-m4 && npm run lint -- src/screens/coach/payments/contents/PushConfirmModal.tsx src/__tests__/PushConfirmModal.test.tsx` → 0 errors, 72 pre-existing repo-wide warnings because the script still expands `src/**/*.{ts,tsx}`; focused touched-file lint `npx eslint src/screens/coach/payments/contents/PushConfirmModal.tsx src/__tests__/PushConfirmModal.test.tsx --max-warnings=0` → 0 errors / 0 warnings)
Tests: pass (`cd /home/user/workspace/wt-pr17-m4 && npx jest src/__tests__/PushConfirmModal.test.tsx` → 1 suite passed, 18 tests passed, 0 failed, 0 snapshots)
Install: pass (`cd /home/user/workspace/wt-pr17-m4 && npm ci` → added 1074 packages, audited 1075 packages; no ENOSPC; npm reported 14 moderate audit vulnerabilities)

## P0 findings
- None.

## P1 findings
- [src/screens/coach/payments/contents/PushConfirmModal.tsx:103, src/screens/coach/payments/contents/PushConfirmModal.tsx:116] The R2 past-date gate still goes stale across midnight because `minimumDate` is computed once for the component lifetime with `useMemo(..., [])`, and `hasFireAt` compares against that captured start-of-day instead of the current start-of-today at confirm time. If the modal/screen is mounted before midnight with a same-day `fireAt`, then after midnight that `fireAt` is now in the past, but `canConfirm` remains true and `handleConfirm` will still call `onConfirm`; even a rerender will keep the old `minimumDate` because the memo has no dependency. This contradicts the R2 comment's stated defence for “a value that crossed midnight” and decision #6 that past dates are blocked. Concrete fix: compute the start-of-today basis fresh whenever the modal opens/renders and again inside `handleConfirm`/picker change, or maintain a day key that updates when `visible` changes; add a fake-timer regression that mounts before midnight, advances past midnight, rerenders/presses Confirm, and verifies Confirm is disabled and `onConfirm` is not called.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of PR claims
- Prior P1 normal prop-path fix → partially verified. A static past `fireAt` prop from yesterday is now blocked by `hasFireAt = fireAt != null && fireAt.getTime() >= minimumDate.getTime()` and the test suite covers disabled UI, no `onConfirm`, future `fireAt`, and start-of-today boundary cases at src/__tests__/PushConfirmModal.test.tsx:152-197.
- Prior P1 midnight/defence-in-depth claim → FALSE as a complete fix. The chosen basis is “today or later,” which is compatible with the picker, but the basis is captured once at src/screens/coach/payments/contents/PushConfirmModal.tsx:103 and reused at src/screens/coach/payments/contents/PushConfirmModal.tsx:116, so a date can cross from valid to past while the mounted modal still enables Confirm.
- Null date protection → verified true. `hasFireAt` is false for `fireAt == null`, `canConfirm` includes `hasFireAt`, the submit button is disabled through `disabled={!canConfirm}`, and `handleConfirm` returns before `onConfirm` when `canConfirm` is false at src/screens/coach/payments/contents/PushConfirmModal.tsx:116-147 and src/screens/coach/payments/contents/PushConfirmModal.tsx:243-250.
- Picker-originated past-date protection → verified true for the current captured basis. `DateTimePicker` receives `minimumDate={minimumDate}` and `handlePickerChange` refuses selections earlier than that basis at src/screens/coach/payments/contents/PushConfirmModal.tsx:189-194, src/screens/coach/payments/contents/PushConfirmModal.tsx:212-217, and src/screens/coach/payments/contents/PushConfirmModal.tsx:121-135.
- 18/18 test-count claim → verified true by the real Jest run: `src/__tests__/PushConfirmModal.test.tsx` passed 18 tests in 1 suite.
- Test coverage of past-date branch → verified for static past-prop and picker-selection cases, but missing the midnight rollover case; see src/__tests__/PushConfirmModal.test.tsx:155-175 and src/__tests__/PushConfirmModal.test.tsx:209-218.
- UI Bible / locked decisions → no blocking violations found. The component uses `useTheme().semanticColors`, has no component hardcoded hex colors, no emoji, warm preview copy, a zero-audience empty state, a single primary action, safe-area use, and the required testIDs at src/screens/coach/payments/contents/PushConfirmModal.tsx:96-97, src/screens/coach/payments/contents/PushConfirmModal.tsx:149-153, src/screens/coach/payments/contents/PushConfirmModal.tsx:177-181, src/screens/coach/payments/contents/PushConfirmModal.tsx:188-205, src/screens/coach/payments/contents/PushConfirmModal.tsx:231-239, and src/screens/coach/payments/contents/PushConfirmModal.tsx:243-267. The hex values in src/__tests__/PushConfirmModal.test.tsx:21-28 are mocked theme tokens, not component styling.

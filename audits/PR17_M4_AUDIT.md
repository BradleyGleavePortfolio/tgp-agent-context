# AUDIT — PR-17 M4: push confirm modal + date picker (PR #214)
VERDICT: NOT CLEAN
Typecheck: pass (`npx tsc --noEmit` → 0 errors)
Lint: pass (`npx eslint src/screens/coach/payments/contents/PushConfirmModal.tsx src/__tests__/PushConfirmModal.test.tsx` → 0 errors / 0 warnings)
Tests: pass (`npx jest src/__tests__/PushConfirmModal.test.tsx` → 1 suite passed, 14 tests passed, 0 failed)

## P0 findings
- None.

## P1 findings
- [src/screens/coach/payments/contents/PushConfirmModal.tsx:105-109] Past `fireAt` values supplied by the parent still enable Confirm. The brief requires defence-in-depth so a past `fireAt` cannot enable Confirm, but `canConfirm` only checks `fireAt != null`, `audienceCount > 0`, and `!submitting`; the past-date guard exists only in `handlePickerChange` and only protects picker-originated changes. M5 can pass a stale/restored/past `fireAt` prop and this modal will present an enabled `push-confirm-submit`, allowing scheduling with a date the UI is supposed to block. This is a P1 input-validation/correctness gap. Concrete fix: derive `hasValidFireAt = fireAt != null && fireAt.getTime() >= minimumDate.getTime()` and use that for preview/confirm gating, then add a test that a past `fireAt` prop disables Confirm and does not call `onConfirm`.

## P2 findings
- None.

## P3 (non-blocking)
- [app.json] `app.json` is unchanged versus base and does not include `@react-native-community/datetimepicker` as an Expo config plugin. I do not grade this as a P0/P1/P2 because the installed package's README describes the config plugin as Android dialog styling support for Expo development builds, not a required runtime registration path for the default picker; `npx expo install --check @react-native-community/datetimepicker` reports dependencies are up to date, and `npx tsc --noEmit` resolves the package types. This is an M5/integration seam only if the team wants custom Android picker styling or a native-build smoke check after wiring.

## Verification of PR claims
- Scope claim → verified true. `git diff 4cef1aa --stat` shows only `package.json`, `package-lock.json`, `src/__tests__/PushConfirmModal.test.tsx`, and `src/screens/coach/payments/contents/PushConfirmModal.tsx`; there are no edits to `ContentAttachForm.tsx` or `CoachPackageContentsScreen.tsx`.
- Props contract → verified true. `PushConfirmModalProps` exports the required names and types: `visible`, `contentTitle`, `audienceCount`, `audienceLabel?`, `buyerNotify`, `onChangeBuyerNotify`, `fireAt`, `onChangeFireAt`, `onConfirm`, `onCancel`, and `submitting?`.
- Dependency claim → verified true. `package.json` pins `@react-native-community/datetimepicker` to `9.1.0`, `package-lock.json` contains the same resolved package, `npx expo install --check @react-native-community/datetimepicker` reports dependencies are up to date for Expo `~56.0.4`, and TypeScript resolves `src/index.d.ts` during `npx tsc --noEmit`.
- Date-picker minimumDate claim → partially true / insufficient. The component passes `minimumDate={minimumDate}` to the native picker and rejects past dates emitted by `onChange`, but Confirm remains enabled when the `fireAt` prop itself is already in the past.
- Confirm disabled claim → FALSE for the past-date branch. Confirm is disabled for `fireAt === null`, `audienceCount === 0`, and `submitting`, but not for a non-null past `fireAt`.
- Notify toggle claim → verified true. The `Switch` reflects `buyerNotify`, uses `onChangeBuyerNotify`, and exposes `testID="push-confirm-notify"`.
- Preview / empty-state claim → verified true. The preview includes title, audience count, audience label, and formatted date when present; zero audience shows the calm empty-state and disables confirm.
- Brand / UI constraints → verified true for shipped component. The component uses `useTheme().semanticColors`, has no hand-typed hex color literals in the component, has no emoji, includes the requested `push-confirm-date`, `push-confirm-notify`, `push-confirm-submit`, and `push-confirm-cancel` testIDs, uses `SafeAreaView`, and sets 44pt minimum heights on the tappable rows/buttons. Test mocks contain hex values only as mocked theme tokens, not as component styling.

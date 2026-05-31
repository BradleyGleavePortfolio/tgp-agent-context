# PR17 M5 Re-audit R2 — Mobile Push Flow

Auditor: Dynasia G (independent/adversarial; did not write the code)

## SHA audited

- Worktree: `/home/user/workspace/wt-m5`
- Expected SHA: `710d9c8ca047394e226b98803771fd8a85e6ceb5`
- Verified SHA: `710d9c8ca047394e226b98803771fd8a85e6ceb5`

## Write-set check

Command:

```bash
git -C /home/user/workspace/wt-m5 diff --name-only fd58961b80566e89c948f42e31abf8d5f6b34523..710d9c8ca047394e226b98803771fd8a85e6ceb5
```

Output:

```text
src/__tests__/CoachPackageContentsScreen.test.tsx
src/screens/coach/payments/CoachPackageContentsScreen.tsx
```

Write-set matches the requested two files.

## Real gates

### `npm ci`

Result: PASS.

Snippet:

```text
added 1074 packages, and audited 1075 packages in 15s
14 moderate severity vulnerabilities
```

### `npx tsc --noEmit`

Result: PASS.

Snippet:

```text
(no output; exit status 0)
```

### `npm run lint` (`eslint "src/**/*.{ts,tsx}" --max-warnings=99999`)

Result: PASS with warnings.

Snippet:

```text
> growth-project-app@1.0.0 lint
> eslint "src/**/*.{ts,tsx}" --max-warnings=99999

✖ 72 problems (0 errors, 72 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

### `npx jest src/__tests__/CoachPackageContentsScreen.test.tsx`

Result: PASS, 23/23 tests.

Snippet:

```text
PASS src/__tests__/CoachPackageContentsScreen.test.tsx (6.183 s)
Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        6.535 s
```

The Jest run also emitted existing React `act(...)` warnings from `ContentAttachForm` during the run; they did not fail the focused suite.

## Contract checks

- `PushPromptSheet` is rendered with the frozen props used by this screen: `visible`, `contentTitle`, `mode="new_content"`, `onPushExisting`, `onFutureOnly`, and `onDismiss` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:566-573`.
- `PushConfirmModal` is rendered with the frozen props used by this screen: `visible`, `contentTitle`, `audienceCount`, `audienceLabel`, `buyerNotify`, `onChangeBuyerNotify`, `fireAt`, `onChangeFireAt`, `onConfirm`, `onCancel`, and `submitting` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:575-587`.
- Audience defaults to `active` via `PUSH_AUDIENCE` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:72-76`, and both preview and push use `mode: 'push_existing'` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:316-319` and `src/screens/coach/payments/CoachPackageContentsScreen.tsx:382-391`.
- Buyer notify defaults ON at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:108`, is reset ON when a push intent begins at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:286`, and is reset ON after preview at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:321`.
- The prior P2 loading-state claim is closed for the single-preview path: `previewLoading` is set before awaiting `pushPreview` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:310-316`, and the UI renders `Checking your buyers…` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:593-603`.
- The prior confirm double-submit claim is closed for two same-tick confirm taps after a single preview: `submitInFlightRef.current` is checked before target/date/key work and set synchronously before the `await coachPackageContentsApi.push(...)` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:366-380`.

## Findings

### P0 — Double-tapping the prompt can start two previews; the late preview can reset the confirm in-flight lock and replace the idempotency key while the first push is already in flight

**File:line:** `src/screens/coach/payments/CoachPackageContentsScreen.tsx:307-340` and `src/screens/coach/payments/CoachPackageContentsScreen.tsx:366-392`

**Why this violates the frozen contract:** The locked decision requires exactly-once push defense with one stable UUID idempotency key per push intent. The current fix only guards the confirm handler. `onPushExisting` itself has no synchronous in-flight guard, disables nothing, and mints/replaces the intent key after each `pushPreview` resolves.

**Code path:**

- `onPushExisting` closes the prompt with state only, sets preview loading, then awaits `coachPackageContentsApi.pushPreview(...)`; there is no `previewInFlightRef` / early return before the await at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:307-316`.
- Every resolving preview runs `const intentKey = generateIdempotencyKey(); pushIdemKeyRef.current = intentKey; submitInFlightRef.current = false; setConfirmVisible(true);` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:324-331`.
- The confirm handler correctly sets `submitInFlightRef.current = true` before awaiting `coachPackageContentsApi.push(...)` at `src/screens/coach/payments/CoachPackageContentsScreen.tsx:366-392`, but a second/late preview resolution can later set that same ref back to `false` and replace `pushIdemKeyRef.current` while the first push is still in flight.

**Reproduction:**

1. Tap a row's paper-plane push button.
2. Double-tap `Send to existing buyers` in the prompt fast enough that both press handlers run before React unmounts the sheet.
3. Let preview A resolve and open confirm; select a date and press confirm. Push call #1 is now in flight with idempotency key A.
4. Let preview B resolve after push #1 starts. The second preview resolution writes a fresh idempotency key B and resets `submitInFlightRef.current = false`.
5. Press confirm again while push #1 is still in flight. The synchronous guard no longer blocks, and `coachPackageContentsApi.push(...)` fires again with key B, defeating backend idempotency and allowing duplicate delivery.

**Impact:** Duplicate push delivery is possible from one user intent. This is an exactly-once/idempotency violation and can notify/deliver content twice to buyers.

**Suggested fix:** Add a synchronous preview/intent guard in `onPushExisting` that is set before any await, and do not mint/replace the push idempotency key or reset `submitInFlightRef` from stale preview completions. For example, claim a `previewInFlightRef`/intent token before calling `pushPreview`, ignore stale preview responses, and clear it only on reset/success/failure for the same intent.

## Verdict

VERDICT: NOT-CLEAN

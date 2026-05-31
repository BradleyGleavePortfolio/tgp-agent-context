# PR-17 M5 Re-audit R3 — Mobile fix audit

## Scope

- Auditor: R31 independent adversarial audit (did not write the code).
- Worktree audited: `/home/user/workspace/wt-m5`.
- SHA audited: `962b6fa708eb340d1ebe05f9b42114cbab34e8de`.
- Base for write-set check: mobile origin/main `fd58961b80566e89c948f42e31abf8d5f6b34523`.

## SHA and write-set verification

`git -C /home/user/workspace/wt-m5 rev-parse HEAD`:

```text
962b6fa708eb340d1ebe05f9b42114cbab34e8de
```

`git -C /home/user/workspace/wt-m5 diff --name-only fd58961b80566e89c948f42e31abf8d5f6b34523..962b6fa708eb340d1ebe05f9b42114cbab34e8de`:

```text
src/__tests__/CoachPackageContentsScreen.test.tsx
src/screens/coach/payments/CoachPackageContentsScreen.tsx
```

Write-set is exactly the two allowed files. No extra file finding.

## Gates

### `npm ci`

Result: PASS.

Snippet:

```text
added 1074 packages, and audited 1075 packages in 15s
14 moderate severity vulnerabilities
```

No ENOSPC occurred.

### `npx tsc --noEmit`

Result: PASS.

Snippet:

```text
TSC_EXIT:0
```

### `npm run lint`

Result: PASS, warnings only; no errors.

Snippet:

```text
> growth-project-app@1.0.0 lint
> eslint "src/**/*.{ts,tsx}" --max-warnings=99999
✖ 72 problems (0 errors, 72 warnings)
```

### `npx jest src/__tests__/CoachPackageContentsScreen.test.tsx`

Result: PASS, 26/26 tests.

Snippet:

```text
PASS src/__tests__/CoachPackageContentsScreen.test.tsx (7.169 s)
Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        7.502 s
```

Jest emitted existing React `act(...)` warnings from test rendering, but the suite passed.

## Adversarial audit notes

### Prior R2 P0: double prompt tap / stale preview exactly-once violation

Status: CLOSED.

Evidence reviewed in `src/screens/coach/payments/CoachPackageContentsScreen.tsx`:

- `previewInFlightRef` is claimed synchronously before the first `await`: line 342 checks the guard and line 343 sets it; the first awaited operation is `coachPackageContentsApi.pushPreview(...)` at lines 354-357.
- `intentTokenRef` is bumped/stamped synchronously at line 347 before preview starts.
- Stale successful previews return before mutating key/submit/modal state: line 363 returns if `myToken !== intentTokenRef.current`; key minting and `submitInFlightRef.current = false` happen only after that at lines 374-376.
- Stale failed previews return before warning/reset state: line 382 returns if stale; only current failures clear `previewInFlightRef`, alert, and call `resetPushState()` at lines 383-389.
- `pushIdemKeyRef.current` is minted once for the current preview winner at lines 374-375, then reused by confirm at lines 427-428. I found no path where a stale preview can replace it while a push is in flight.
- Confirm double-submit guard is still synchronous: line 421 returns if `submitInFlightRef.current`, and line 430 claims it before the push `await` at lines 433-443.
- Reset paths release preview guard and bump token: `resetPushState()` lines 284-299; on cancel lines 402-404; future-only/dismiss lines 325-327; success lines 445-446; fresh intent lines 304-321. A legitimate next push is not permanently locked out.

I tried to break exactly-once by tracing: double prompt taps, stale resolve after cancel/reset, stale reject after reset, confirm while push in-flight, failed push retry, success then new push, and fresh row tap after prior stale preview. The token/ref ordering blocks the prior R2 race without introducing a permanent lockout.

### Frozen contracts and expected behavior checks

- `PushPromptSheet` props are unchanged outside the allowed write-set; audited call site passes `visible`, `contentTitle`, `mode="new_content"`, `onPushExisting`, `onFutureOnly`, and `onDismiss` at lines 617-624.
- `PushConfirmModal` props are unchanged outside the allowed write-set; audited call site passes `audienceCount`, `audienceLabel`, `buyerNotify`, `onChangeBuyerNotify`, `fireAt`, `onChangeFireAt`, `onConfirm`, `onCancel`, and `submitting` at lines 626-638.
- Push API contract is unchanged outside the allowed write-set; call site still sends `audience: PUSH_AUDIENCE`, `fire_at`, `mode: 'push_existing'`, `notify`, and the idempotency key as the 4th argument at lines 433-443.
- Audience default remains `active`: `PUSH_AUDIENCE: PushAudience = 'active'` at line 75; preview and push use it at lines 355 and 437.
- Buyer notify default remains ON: state initializes `buyerNotify` to `true` at line 108 and reset/fresh intent/preview success set it true at lines 287, 309, and 368.
- Past dates remain blocked by `PushConfirmModal` (unchanged outside write-set): minimum date and call-time guard are in `contents/PushConfirmModal.tsx` lines 112, 125-128, and 149-165.
- No feature flag was introduced in the audited files; grep only matched a test comment containing “flagged”.
- The “Checking your buyers…” preview loading state is present at lines 644-654 and covered by the targeted test suite.

## Findings

No P0/P1/P2 findings.

VERDICT: CLEAN

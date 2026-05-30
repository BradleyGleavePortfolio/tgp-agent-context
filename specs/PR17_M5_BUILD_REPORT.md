# PR-17 M5 BUILD REPORT — wire push prompt → confirm → push API (SOLO)

**Builder:** Dynasia G (Opus 4.8). **Repo:** growth-project-mobile (RN/Expo SDK 56).
**Branch:** `pr17/m5-wire-prompt-confirm` (off `origin/main` = `fd58961`, contains M1–M4).
**HEAD SHA:** `4eac41d7af45d97b4789ab795553fe27176d6b4f`
**PR:** #216 → https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/216

## What was built
Replaced the M2 placeholder seam in `CoachPackageContentsScreen.tsx` (`onPushPress`,
the "coming soon" Alert / `TODO(M5)` at ~line 212) with the real per-card push flow
(PR-17 decision #12), confined entirely to the screen via added state + handlers.

### Flow (state machine in the screen)
1. **Row push tap** (`onPushPress`) → open `PushPromptSheet` (M3) with `mode='new_content'`
   and `contentTitle = display_title?.trim() || assetTypeLabel(asset_type)`.
2. **onFutureOnly / onDismiss** → close sheet, no push, reset transient state (decision #5).
3. **onPushExisting** → close sheet, call
   `coachPackageContentsApi.pushPreview(packageId, content.id, { audience: 'active', mode: 'push_existing' })`,
   then open `PushConfirmModal` (M4) with `audienceCount = preview.count`,
   `audienceLabel = 'active buyers'`, `buyerNotify = true` (default ON, decision #9),
   `fireAt = null` (coach picks, decision #2).
   - **Preview FAILURE** → `warningTap()` + warm Alert ("Could not check buyers"); confirm
     modal is **NOT** opened (error-prevention: a real error is never shown as a benign empty state).
4. **Confirm modal** → manage `buyerNotify` / `fireAt` via state.
5. **onConfirm** → `submitting=true`, call
   `coachPackageContentsApi.push(packageId, content.id, { audience: 'active', fire_at: fireAt.toISOString(), mode: 'push_existing', notify: buyerNotify }, idempotencyKey)`.
   - **success** → `successTap()`, close modal, warm Alert in decision #10 preview language
     ("This delivers to N active buyers."), reset state, `await load()` (refresh).
   - **error** → `warningTap()` + warm Alert ("Could not push"); modal stays **OPEN** for
     retry, `submitting` back to `false`.
6. **onCancel** → close modal, reset transient state.

### Idempotency / double-submit (decision #8 / R19)
ONE UUID `Idempotency-Key` is generated when the coach taps Confirm and reused across
retries of the same intent (`pushIdemKey` state). Double-submit is blocked by the
`pushSubmitting` guard (the modal also disables Confirm while `submitting`).

## Locked decisions honored
#1 audience per-push (default `'active'` for M5) · #2 coach-chosen fire date ·
#5 future-only = no push · #8 UUID idempotency · #9 buyer-notify default ON ·
#10 confirm preview language.

## UI Bible
`useTheme()` colors, NO emoji, NO hardcoded hex, haptics (`lightTap`/`successTap`/`warningTap`),
`errorMessage`, error-prevention/CALM, matches existing file style.

## Scope (frozen contracts untouched)
Edited ONLY:
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx`
- `src/__tests__/CoachPackageContentsScreen.test.tsx`

`PushPromptSheet.tsx`, `PushConfirmModal.tsx`, `packageContentsApi.ts` imported and used
only — not modified. `git diff --name-only origin/main...HEAD` = exactly the two files above.

## Tests (extended `CoachPackageContentsScreen.test.tsx`)
Updated the M2 placeholder guard to assert the real M3/M4 wiring (imports + render +
`pushPreview`/`push` verbs; `TODO(M5)`/"coming soon" gone). New behavioral cases (mocked
`pushPreview` + `push`, lightweight M3/M4 stand-ins driving the real prop callbacks):
- sheet opens with the right `contentTitle` + `mode='new_content'`
- "Future only" and dismiss close with NO preview/push call
- "Push existing" calls `pushPreview` then opens confirm modal with the returned count
- preview FAILURE shows a warm error and does NOT open the confirm modal
- confirm calls `push` with the correct body (audience, fire_at ISO, mode, notify) + Idempotency-Key, shows success, refreshes
- double-submit cannot fire `push` twice while submitting
- push FAILURE keeps the modal open + resets submitting
All pre-existing screen tests kept green.

## Gates (cd /home/user/workspace/wt-m5)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint` on the two touched files → **0 errors**
- `npx jest src/__tests__/CoachPackageContentsScreen.test.tsx` → **19 passed / 19 total** (1 suite)

Ready for GPT-5.5 audit at SHA `4eac41d7af45d97b4789ab795553fe27176d6b4f`.

# PR-17 M5 BRIEF — Wire push prompt → confirm in CoachPackageContentsScreen (SOLO)

**Unit:** M5 (final mobile wiring of the per-card push flow).
**Repo:** growth-project-mobile (RN/Expo SDK 56). **Branch:** `pr17/m5-wire-prompt-confirm` (off mobile `origin/main` = `fd58961`, which already contains M1+M2+M3+M4).
**Worktree:** `/home/user/workspace/wt-m5`.
**Builder model:** Opus 4.8. **SOLO** — this edits M2's shared screen; NEVER parallel with other mobile work.

## Goal
Replace the M2 placeholder seam in `CoachPackageContentsScreen.tsx` (`onPushPress`, currently a "coming soon" Alert at ~line 212) with the real flow:
**per-card push tap → PushPromptSheet (M3) → PushConfirmModal (M4) → `coachPackageContentsApi.push` → success / error feedback.**

This completes PR-17's mobile authoring + per-card push line (decision #12).

## Files you MAY edit (write-set)
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx` (wire the flow)
- `src/__tests__/CoachPackageContentsScreen.test.tsx` (extend tests)
DO NOT edit PushPromptSheet.tsx, PushConfirmModal.tsx, packageContentsApi.ts, or anything else — their contracts are STABLE (frozen). Import and use them only.

## Component contracts (frozen — DO NOT change these files)

### PushPromptSheet (M3) — `./contents/PushPromptSheet`
```
export type PushPromptMode = 'new_content' | 'cadence_edit' | 'full_edit';
export interface PushPromptSheetProps {
  visible: boolean;
  contentTitle: string;
  mode: PushPromptMode;
  audienceHint?: string;
  onPushExisting: () => void;   // coach chose "push to existing buyers"
  onFutureOnly: () => void;     // coach chose "future buyers only" (no push)
  onDismiss: () => void;
}
```

### PushConfirmModal (M4) — `./contents/PushConfirmModal`
```
export interface PushConfirmModalProps {
  visible: boolean;
  contentTitle: string;
  audienceCount: number;        // from pushPreview().count — "delivers to N buyers"
  audienceLabel?: string;       // e.g. "active buyers" / "all buyers" / cohort name
  buyerNotify: boolean;         // per-push toggle, default ON (decision #9)
  onChangeBuyerNotify: (next: boolean) => void;
  fireAt: Date | null;          // selected fire date (decision #2); confirm disabled until set
  onChangeFireAt: (next: Date) => void;
  onConfirm: () => void;        // → M5 calls coachPackageContentsApi.push
  onCancel: () => void;
  submitting?: boolean;         // disable confirm + spinner while push API in flight
}
```
NOTE: PushConfirmModal already HARD-blocks past dates at render-time AND call-time (M4, merged). M5 must still send a valid `fire_at` ISO string.

### Push API client (frozen) — `../../../api/packageContentsApi`
```
export type PushAudience = 'all' | 'active' | 'cohort';
export type PushMode = 'push_existing' | 'resend';
export interface PushRequest { audience: PushAudience; cohort_purchase_ids?: string[]; fire_at: string /*ISO, today-or-later*/; mode: PushMode; notify: boolean; }
export interface PushPreview { count: number; audience: PushAudience; already_delivered: number; }
export interface PushResult { scheduled: number; skipped: number; fire_at: string; audience: PushAudience; notify: boolean; }
coachPackageContentsApi.pushPreview(packageId, contentId, { audience, mode }) => api.get<PushPreview>(...)
coachPackageContentsApi.push(packageId, contentId, body: PushRequest, key?) => api.post<PushResult>(...)  // sends Idempotency-Key (decision #8/#19)
```
Use `generateIdempotencyKey()` (already imported in the screen) for the push call — UUID idempotency (decision #8, R19). Generate ONE key per confirmed push attempt (stable across retries of the same intent is acceptable; simplest correct = one key created when the coach taps Confirm).

## Flow to implement (state machine in the screen)
1. **Tap push icon on a row** (`onPushPress(content)`): open PushPromptSheet for that content. `mode='new_content'` is the correct default for the per-card "push this existing content to buyers" entry (the cadence_edit/full_edit modes belong to the edit-save flow, which is out of M5 scope — keep it simple: this per-card affordance is a fresh push of existing content). `contentTitle` = the row's resolved title (`display_title?.trim() || assetTypeLabel(asset_type)`).
2. **onFutureOnly / onDismiss**: close the sheet, no further action (decision #5 — future-only means no push to existing).
3. **onPushExisting**: close the sheet, then resolve the audience. Per decision #1 the coach picks audience per-push (all/active/cohort). For M5, default audience = `'active'` (sensible default; the confirm modal shows the resolved count and label). Call `pushPreview(packageId, content.id, { audience: 'active', mode: 'push_existing' })` to get the count, then open PushConfirmModal with `audienceCount = preview.count`, `audienceLabel = 'active buyers'`, `buyerNotify = true` (default ON), `fireAt = null` (coach must pick).
   - While preview is loading, show a calm inline state (e.g. a brief ActivityIndicator or open the modal in a loading posture) — do NOT leave a dead tap. If preview FAILS, surface a warm Alert ("Could not check buyers — please try again") and do not open the confirm modal (error-prevention; never show a real error as a benign empty state).
4. **PushConfirmModal**: manage `buyerNotify` and `fireAt` via state (`onChangeBuyerNotify`, `onChangeFireAt`). Confirm is disabled until `fireAt` is set and `audienceCount > 0` (M4 already enforces this).
5. **onConfirm**: set `submitting=true`, call `coachPackageContentsApi.push(packageId, content.id, { audience, fire_at: fireAt.toISOString(), mode: 'push_existing', notify: buyerNotify }, idempotencyKey)`. On success: close modal, warm success feedback (e.g. Alert "Scheduled — delivers to N buyers on <date>" using PushResult.scheduled, decision #10 preview language) + success haptic; optionally refresh list. On error: `warningTap()` + warm Alert, keep modal open so the coach can retry (submitting back to false). Guard against double-submit (submitting flag + idempotency key).
6. **onCancel**: close modal, reset transient push state (selectedContent, fireAt, buyerNotify, audienceCount).

Keep all of this confined to the screen via added state + handlers; reuse existing patterns (useTheme, haptics lightTap/mediumTap/warningTap, errorMessage, Alert). NO emoji, NO hardcoded hex, use theme colors. Match the existing code style in this file exactly.

## Tests (extend `src/__tests__/CoachPackageContentsScreen.test.tsx`)
Mock `coachPackageContentsApi.pushPreview` and `.push`. Cover:
- Tapping a row's push icon opens the prompt sheet with the right contentTitle.
- "Future only" / dismiss closes with NO push/preview call.
- "Push existing" calls pushPreview, then opens the confirm modal with the returned count.
- Preview FAILURE shows an error affordance and does NOT open the confirm modal.
- Confirm calls `push` with the correct body (audience, fire_at ISO, mode 'push_existing', notify) and an Idempotency-Key, shows success, and (double-submit) cannot fire twice while submitting.
- Push FAILURE keeps the modal open and surfaces a warm error.
Keep all existing screen tests green.

## Gates (cd /home/user/workspace/wt-m5)
- `npx tsc --noEmit` → 0 errors
- `npx eslint` on the two touched files → 0 errors
- `npx jest src/__tests__/CoachPackageContentsScreen.test.tsx` → all pass (report counts)

## Commit / push (R4 STRICT, R61)
Author `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers/co-authors:
`git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m 'PR-17 M5: wire push prompt -> confirm -> push API in CoachPackageContentsScreen'`
Push every ~2min and at end: `git push origin pr17/m5-wire-prompt-confirm` (api_credentials=["github"]; rebase if rejected). Open PR to `main`.

## Report back
New HEAD SHA, PR #, gate counts, the exact files changed (`git diff --name-only origin/main...HEAD` must be ONLY the screen + its test), and a short BUILD_REPORT to `specs/PR17_M5_BUILD_REPORT.md` (committed+pushed to tgp-agent-context). Ready for GPT-5.5 audit at the new SHA.

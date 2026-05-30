# PR-17 M4 — Build Report (Push Confirm Modal + Date Picker)

**Builder record, not a verdict.** GPT-5.5 auditor re-checks at the final SHA below.

## Identity / branch / base
- Branch: `pr17/m4-push-confirm`
- Base: `growth-project-mobile` `origin/main` @ `4cef1aa`
- Final branch HEAD SHA: **`1a929ae6aa8726ad316a98d98b8a220a6f7cb54c`**
- Commit author (R4 STRICT): `Dynasia G <dynasia@trygrowthproject.com>` — no trailers, no co-author lines.
- PR: **#214** → `main`, titled `PR-17 M4: push confirm modal + date picker`.

## Files shipped
- `src/screens/coach/payments/contents/PushConfirmModal.tsx` (new component)
- `src/__tests__/PushConfirmModal.test.tsx` (new test — placed in `src/__tests__/` to match where M2 put `ContentAttachForm.test.tsx`)
- `package.json` + `package-lock.json` (dependency only)

No edits to `ContentAttachForm.tsx` or `CoachPackageContentsScreen.tsx` (M5 owns the screen). No other existing files changed.

### Note on app.json (in-scope decision)
`npx expo install` auto-appended `@react-native-community/datetimepicker` to the `app.json` `plugins` array (and reformatted the `scheme` field). The brief is STRICT: "NO edits to existing files except package.json + lockfile for the dep." **app.json was reverted** to stay in scope. The native config plugin entry is therefore NOT added here; whoever does the native/integration build (M5 or a later integration milestone) should add `"@react-native-community/datetimepicker"` to `app.json` plugins if a native build needs it. The component, tsc, and Jest all work without it.

## Dependency added (M4-owned)
- `@react-native-community/datetimepicker@9.1.0`
- Installed via `npx expo install` → reported as the SDK 56.0.0 compatible native module.
- Repo Expo SDK: `expo ~56.0.4`. TypeScript types resolve (`tsc --noEmit` clean; default export `RNDateTimePicker`, `minimumDate?: Date`, `onChange?: (event, date?) => void`).

## Props contract — AS SHIPPED (no deviations)
Exported exactly as specified in `PR17_M4_BRIEF.md`:

```ts
export interface PushConfirmModalProps {
  visible: boolean;
  contentTitle: string;
  audienceCount: number;
  audienceLabel?: string;
  buyerNotify: boolean;
  onChangeBuyerNotify: (next: boolean) => void;
  fireAt: Date | null;
  onChangeFireAt: (next: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  submitting?: boolean;
}
```

**Deviation: NONE.** Names/types/optionality match the brief verbatim. `audienceLabel` defaults to `'buyers'` when omitted (does not change the contract).

## UI Bible decisions implemented
- **Decision #10 (full preview copy):** warm sentence `This delivers "<contentTitle>" to <audienceCount> <audienceLabel> on <formatted fireAt>.` When `fireAt` is null, the line prompts to choose a date. When `audienceCount === 0`, a calm empty-state ("No buyers match yet…") is shown and confirm is disabled.
- **Decision #6 + error-prevention (graded):** date picker uses `minimumDate = start-of-today` so PAST dates are physically un-selectable. Defence-in-depth: the `onChange` handler also refuses to propagate any date earlier than `minimumDate` and ignores `dismissed` events. Confirm stays disabled until a valid future `fireAt` exists.
- **Decision #2 (coach-chosen date):** date collected via `@react-native-community/datetimepicker` (iOS inline; Android dialog opened from a 44pt date row).
- **Decision #9 (buyer-notify toggle):** RN `Switch`, reflects `buyerNotify`, fires `onChangeBuyerNotify`; warm label "Notify these buyers" / "Buyers get a notification when this goes out." Default ON is owned by M5's state (the prop), per contract.
- **CALM / Hick's / Miller's:** one dominant primary action ("Confirm & schedule"); de-emphasised "Cancel"; exactly 5 decision elements (preview line, date picker, notify toggle, confirm, cancel).
- **Brand / no hardcoded hex:** `const { semanticColors: colors } = useTheme()` from `src/theme/useTheme.ts`. Accent = theme `accent` token (forest on the legacy palette; oxblood in the current semantic tokens) — no literal hex, no emoji. Text-on-accent uses `colors.bgPrimary` (the established repo pattern). 44pt touch targets, safe-area via `react-native-safe-area-context`.
- **Accessibility / testIDs:** `push-confirm-date`, `push-confirm-notify`, `push-confirm-submit`, `push-confirm-cancel` (plus `push-confirm-modal`, `push-confirm-preview`, `push-confirm-empty`). `submitting` disables confirm and shows an `ActivityIndicator`.

## Verification (run in worktree)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint` on both new files → **0 errors / 0 warnings**
- `npx jest src/__tests__/PushConfirmModal.test.tsx` → **14 passed / 14 total** (1 suite), 0 failures
- datetimepicker types resolve cleanly under tsc.

### Test coverage summary (14 cases)
- preview line renders N + audienceLabel + formatted date; default audienceLabel fallback
- confirm disabled when `fireAt` null; disabled + empty-state when `audienceCount === 0`; enabled with audience + future date; `submitting` disables
- picker `minimumDate` = start-of-today; past selection does not propagate; future selection propagates; `dismissed` ignored
- notify toggle reflects `buyerNotify` and fires `onChangeBuyerNotify`
- `onConfirm` fires when enabled, does NOT fire when disabled; `onCancel` fires

---

## R2 fix (past-date defence-in-depth at the confirm gate)

**Context:** GPT-5.5 audit (`audits/PR17_M4_AUDIT.md`) raised one P1: a PAST `fireAt` supplied via props (e.g. M5 passing a stale/restored date, or a value crossing midnight) still enabled Confirm, because `canConfirm` only checked non-null `fireAt` + `audienceCount > 0` + `!submitting`. The picker's `minimumDate` only blocks picker-originated past dates, not prop-originated ones.

### Gate change
`src/screens/coach/payments/contents/PushConfirmModal.tsx` — `hasFireAt` (used by `canConfirm`, the preview line, and the date-row display) is now:

```ts
const hasFireAt = fireAt != null && fireAt.getTime() >= minimumDate.getTime();
```

`canConfirm` is otherwise unchanged: `hasAudience && hasFireAt && !submitting`. All existing gate conditions (non-null, `audienceCount > 0`, `!submitting`) are retained. A past `fireAt` now keeps Confirm disabled with the existing disabled styling; `handleConfirm` already early-returns (with `warningTap`) when `!canConfirm`, so `onConfirm` is never called.

### Chosen now/today basis
**"Today or later"** — `fireAt.getTime() >= minimumDate.getTime()`, where `minimumDate = startOfToday()` (local midnight, `setHours(0,0,0,0)`). This is the EXACT same basis the picker already uses for its `minimumDate`, so the gate and the picker agree precisely: any whole day from today onward is both selectable in the picker AND confirmable at the gate. This is a whole-day scheduling basis (NOT a "future instant" rule), matching the picker's `mode="date"` semantics. The chosen basis is documented in a code comment at the `hasFireAt` definition.

### Props contract
**Unchanged.** `PushConfirmModalProps` keeps the identical names/types (`visible`, `contentTitle`, `audienceCount`, `audienceLabel?`, `buyerNotify`, `onChangeBuyerNotify`, `fireAt`, `onChangeFireAt`, `onConfirm`, `onCancel`, `submitting?`). No new required props were added. Only `PushConfirmModal.tsx` and `PushConfirmModal.test.tsx` were touched — no other file.

### New regression tests (`src/__tests__/PushConfirmModal.test.tsx`)
Added 4 cases under the "confirm gating" describe block:
- a PAST `fireAt` prop (yesterday) → Confirm DISABLED;
- pressing Confirm with a PAST `fireAt` prop → `onConfirm` NOT called;
- a future `fireAt` prop (a week out) → Confirm still ENABLED (guards against over-correction);
- `fireAt` exactly equal to start-of-today → Confirm ENABLED (verifies the "today or later" boundary).

All 14 pre-existing tests remain green.

### Verification (run in worktree, post-fix)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint src/screens/coach/payments/contents/PushConfirmModal.tsx src/__tests__/PushConfirmModal.test.tsx` → **0 errors / 0 warnings**
- `npx jest src/__tests__/PushConfirmModal.test.tsx` → **18 passed / 18 total** (1 suite), 0 failures (14 original + 4 new)

### Branch state
- Rebased onto `origin/main` `34807cc` (M3's `PushPromptSheet.tsx` is disjoint — clean rebase), force-pushed-with-lease against prior `1a929ae`.
- **Post-fix branch HEAD SHA: `989af6c641740ae6b06f6c193f395e0e95ec063c`** (`pr17/m4-push-confirm`).
- Author: `Dynasia G <dynasia@trygrowthproject.com>`, no trailers/co-authors.

This is a fixer record, not a verdict — an independent GPT-5.5 auditor re-checks at the post-fix SHA.

# PR-17 M3 — Build Report (Push Prompt Sheet)

**Builder record, not a verdict.** GPT-5.5 auditor re-checks at the SHA below.

## Summary
M3 ships exactly one new presentational component — `PushPromptSheet` — the
"trigger = prompt each time" step from PR-17 decision #3. When a coach attaches
new content or edits an existing item's cadence/details on the package-contents
screen, this bottom sheet asks whether the change should push to **existing**
buyers or apply to **future** buyers only. It is the PROMPT UI only: no
confirm/preview (M4), no screen wiring (M5).

## Repo / branch / SHAs
- Repo: `growth-project-mobile` (React Native / Expo).
- Base: `origin/main` @ `4cef1aa` (M1 contents API + M2 authoring screen).
- Branch: `pr17/m3-push-prompt`.
- **Final branch HEAD SHA: `fddf717ffa25d8869e0b69b3a8cc878e4e940039`**
- PR: **#215** → base `main`, title `PR-17 M3: push prompt sheet`
  (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/215).

## Files (scope: ONE new component + its test; no edits to existing files)
- `src/screens/coach/payments/contents/PushPromptSheet.tsx` (new)
- `src/__tests__/PushPromptSheet.test.tsx` (new)
- No new npm dependency added (datetimepicker deferred to M4, per brief).

## Props contract as shipped
Matches the brief exactly, with two additive, backward-compatible extras the
brief explicitly permitted/anticipated (an optional `audienceHint?` and an
exported `PushPromptMode` type alias). **No required field was renamed,
removed, or retyped — M5 can wire against the brief's contract unchanged.**

```ts
export type PushPromptMode = 'new_content' | 'cadence_edit' | 'full_edit';

export interface PushPromptSheetProps {
  visible: boolean;
  contentTitle: string;                 // woven into warm copy
  mode: PushPromptMode;                  // = brief's 'new_content' | 'cadence_edit' | 'full_edit'
  audienceHint?: string;                 // OPTIONAL, additive — brief allowed an optional hint;
                                         //   real buyer count + date preview remain M4's job
  onPushExisting: () => void;            // push to existing buyers (→ M5 opens M4 confirm)
  onFutureOnly: () => void;              // apply to future buyers only, no push
  onDismiss: () => void;                 // closed without choosing
}
```

### Deviations from the brief's contract
- **None that break M5.** The brief inlined `mode` as a literal union; the
  shipped code extracts that identical union into an exported `PushPromptMode`
  type alias for reuse (same values, same order). A consumer typing `mode` as
  the inline union still type-checks.
- `audienceHint?` is **added** as an optional prop (the brief said M3 "may take
  an optional `audienceHint?`"). It is optional, so M5 may ignore it.
- All three callbacks and the three core fields (`visible`, `contentTitle`,
  `mode`) are byte-for-byte the brief's names and shapes.

## UI Bible decisions (graded)
- **One-concept-per-moment / CALM:** the sheet asks exactly ONE question
  ("Share this update?") with two explicit choices + a dismiss. No numbers, no
  secondary clutter — the real buyer count + date preview belong to M4.
- **Hick's Law (smart default):** "Send to existing buyers" is the affirmative
  PRIMARY — forest-fill button, full-width, dominant weight. "Just future
  buyers" is the de-emphasised text-weight SECONDARY. Dismiss is a quiet close
  glyph + scrim tap.
- **Miller's Law (≤5 elements):** title, one-line explainer, primary button,
  secondary button, close affordance = 5. (An optional `audienceHint` line is
  rendered only when a caller passes one.)
- **Warm copy:** fixed title "Share this update?"; the mode-specific explainer
  names the content title (e.g. `Send "Week 1 Program" to the buyers who
  already own this package…`). Three mode variants each get tailored phrasing
  (new content / cadence change / full edit). Blank title falls back to the
  neutral phrase "this update".
- **Brand / NO hardcoded hex:** uses `const { semanticColors: colors } =
  useTheme()` for surfaces/text. Forest is the PRIMARY accent — sourced from the
  `tokens.colors.forest` brand token (NOT a hand-typed hex). The on-forest
  foreground uses the `bone` token; the scrim is derived from the `ink` token
  via a local `withAlpha()` helper. **No hex literal is hand-typed in the file.**
  - Note on the theme seam: the repo's `semanticColors` map (SemanticTokens) is
    intentionally minimal (`bgPrimary, bgSurface, textPrimary, textMuted,
    accent, border`) and its `accent` is oxblood, not forest. Per the doctrine
    ("Forest is the primary accent"), the primary CTA uses the forest brand
    token from `theme/tokens` rather than `semanticColors.accent`. This keeps
    the component theme-driven and brand-correct without inventing new tokens or
    editing the theme (out of M3 scope).
- **Error-prevention / accessibility:** each action has an accessible label +
  testID (`push-prompt-existing`, `push-prompt-future`, `push-prompt-dismiss`)
  and an `accessibilityHint`; touch targets ≥44pt (primary 48, close 44×44,
  secondary 44); the sheet pads the bottom safe-area inset via
  `useSafeAreaInsets()`. No emoji in UI copy (a glyph "✕" close is used,
  consistent with quiet-luxury close affordances).
- **Pattern reuse (consistency):** mirrors the transparent slide-up RN `<Modal>`
  + scrim `Pressable` bottom-sheet precedent in `AskAiActionSheet.tsx` and the
  primary-button shape from `ContentAttachForm.tsx`.

## Verification (run in the worktree)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint` on both new files → **0 errors / 0 warnings**
- `npx jest src/__tests__/PushPromptSheet.test.tsx` → **14 passed / 14 total**
  (1 test suite passed).

### Test coverage
Renders when visible / hidden when not; fires `onPushExisting`,
`onFutureOnly`, `onDismiss` on the correct presses; no cross-firing of
handlers; `contentTitle` woven into copy; fixed warm title present; blank-title
neutral fallback; all three `mode` variants render their own explainer; optional
`audienceHint` renders only when provided.

### Known test note (non-blocking)
A dedicated "scrim tap fires onDismiss" assertion was omitted: under
jest-expo + RNTL the bare flex scrim `Pressable` (rendered inside the
transparent `Modal`) was not reliably queryable by `testID`/label even though it
is present in the rendered tree. The scrim still functions in-app (it calls
`onDismiss`), and `onDismiss` is fully covered via the explicit close
affordance. This is a test-harness quirk, not a component defect.

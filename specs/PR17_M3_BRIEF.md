# PR-17 M3 — Push Prompt Sheet (mobile)

## Role
You are a BUILDER (Opus 4.8). Isolated worktree only. Push to GitHub every ~2 min (R61). Commit identity R4 STRICT: `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-author lines.

## Repo / base / branch
- Repo: `growth-project-mobile` (React Native / Expo).
- Base: `origin/main` @ `4cef1aa` (includes M1 contents API + M2 authoring screen).
- Branch: `pr17/m3-push-prompt`.
- Your worktree will be set up for you at the base SHA; build only there.

## What M3 is (one new file, parallel-safe)
The "trigger = prompt each time" step from PR-17 decision #3. When a coach attaches NEW content or edits an existing item's cadence/details on the package-contents screen, they must be ASKED whether the change should push to EXISTING buyers (vs apply future-only). M3 is the PROMPT UI ONLY — a bottom sheet that asks the question. It does NOT do the confirm/preview (that's M4) and does NOT wire into the screen (that's M5).

### Single new file
`src/screens/coach/payments/contents/PushPromptSheet.tsx` — a presentational bottom-sheet component. NO edits to any existing file. NO new dependency (use the sheet/modal primitive already used elsewhere in the app — check how existing bottom sheets are built; if none, use RN `Modal` with a slide-up animated view consistent with repo patterns). Do NOT add @react-native-community/datetimepicker — that's M4's dependency.

### Props contract (so M5 can wire it without changes)
Export a typed props interface, e.g.:
```ts
export interface PushPromptSheetProps {
  visible: boolean;
  contentTitle: string;                 // for warm copy: "Send '<title>' to existing buyers?"
  mode: 'new_content' | 'cadence_edit' | 'full_edit';  // matches decision #4 coverage
  onPushExisting: () => void;           // coach chose: push to existing buyers (→ M5 opens M4 confirm)
  onFutureOnly: () => void;             // coach chose: apply to future buyers only, no push
  onDismiss: () => void;                // closed without choosing
}
```
Confirm exact field names/shape with the M5 seam in mind — keep it minimal and stable. If you change the contract, document it loudly in the build report so M5's brief can match.

## UI Bible compliance (MANDATORY — graded)
Read `/home/user/workspace/UI_BIBLE.txt`. This sheet is a high-stakes one-concept moment. Apply:
- **CALM framework + one-concept-per-moment**: the sheet asks exactly ONE question. Two clear choices + dismiss. No secondary clutter.
- **Hick's Law**: one PRIMARY path with a smart default. "Send to existing buyers" is the primary affirmative (default emphasis); "Just future buyers" is the secondary. Make the primary visually dominant.
- **Miller's Law**: ≤5 elements on screen (title, one-line explainer, primary button, secondary button, dismiss/close).
- **Warm copy**: e.g. title "Share this update?", body "Send '<contentTitle>' to the N buyers who already own this package, or apply it only to future buyers." (M3 may take an optional `audienceHint?: string` if helpful, but the real buyer count + date preview belongs to M4 — keep M3 about the choice, not the numbers.)
- **Brand / NO hardcoded hex**: use `const { semanticColors: colors } = useTheme()` from `src/theme/useTheme.ts`. NEVER hardcode a hex value. Forest is the primary accent. Typography per the app's existing text components. NO emoji.
- **Error-prevention / accessibility**: buttons have accessible labels + testIDs (`push-prompt-existing`, `push-prompt-future`, `push-prompt-dismiss`); min 44pt touch targets; respects safe-area at the bottom.

## Tests
Add `src/__tests__/PushPromptSheet.test.tsx` (or co-located per repo convention — check where M2's tests live: `src/__tests__/`). Cover: renders when visible, hidden when not, fires `onPushExisting`/`onFutureOnly`/`onDismiss` on the right presses, renders the contentTitle in copy, mode variants render appropriate copy. Use the repo's existing RN testing-library setup.

## Verification (run, report actual counts)
From your worktree:
- `npx tsc --noEmit` → 0 errors
- `npx eslint` on your new files → 0 errors/warnings
- `npx jest src/__tests__/PushPromptSheet.test.tsx` → all pass (report counts)

## Deliverables
- Branch pushed; open PR to `main` titled `PR-17 M3: push prompt sheet`. Report PR number.
- Build report `specs/PR17_M3_BUILD_REPORT.md` in tgp-agent-context (props contract as shipped, UI-Bible decisions, test counts, final SHA). Commit (R4) + push to docs main after rebasing clean.
- Report final branch HEAD SHA. Builder record, not a verdict — GPT-5.5 auditor re-checks at your SHA.

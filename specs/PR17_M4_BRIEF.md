# PR-17 M4 — Push Confirm Modal (mobile)

## Role
You are a BUILDER (Opus 4.8). Isolated worktree only. Push to GitHub every ~2 min (R61). Commit identity R4 STRICT: `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-author lines.

## Repo / base / branch
- Repo: `growth-project-mobile` (React Native / Expo).
- Base: `origin/main` @ `4cef1aa` (includes M1 contents API + M2 authoring screen + the `contents/` subdir).
- Branch: `pr17/m4-push-confirm`.
- Worktree set up for you at base SHA; build only there.

## What M4 is (new file(s) + one dependency, parallel-safe with M3)
PR-17 decision #10: the FULL confirmation/preview step — "delivers to N buyers on <date>". After the coach chooses "push to existing buyers" (M3's prompt), this modal shows the concrete preview AND collects the fire-at DATE (decision #2: coach-chosen date) with past dates BLOCKED (decision #6, UI Bible error-prevention). M4 is the CONFIRM UI ONLY — it does NOT call the API and does NOT wire into the screen (that's M5).

### New files
- `src/screens/coach/payments/contents/PushConfirmModal.tsx` (new component).
- `src/screens/coach/payments/contents/__tests__/pushConfirmModal.test.tsx` OR `src/__tests__/PushConfirmModal.test.tsx` — match where M2 put tests (`src/__tests__/`). Pick one location and be consistent.
- Dependency: add `@react-native-community/datetimepicker` (this is M4's owned dependency — M3 must NOT add it). Add to package.json + lockfile. Confirm it's Expo-compatible with the repo's Expo SDK version (check app.json / package.json expo version; use the Expo-recommended version via `npx expo install @react-native-community/datetimepicker` if expo CLI is available, else pin the version matching the SDK).

NO edits to existing files except package.json + lockfile for the dependency. Do NOT touch `ContentAttachForm.tsx` or `CoachPackageContentsScreen.tsx` (M5 owns the screen).

### Props contract (stable for M5 wiring)
```ts
export interface PushConfirmModalProps {
  visible: boolean;
  contentTitle: string;
  audienceCount: number;            // "delivers to N buyers" (M5 passes resolved count from preview endpoint)
  audienceLabel?: string;           // e.g. "active buyers" / "all buyers" / cohort name (decision #1)
  buyerNotify: boolean;             // per-push toggle, default ON (decision #9)
  onChangeBuyerNotify: (next: boolean) => void;
  fireAt: Date | null;              // selected fire date (decision #2)
  onChangeFireAt: (next: Date) => void;
  onConfirm: () => void;            // coach confirms → M5 calls the push API
  onCancel: () => void;
  submitting?: boolean;             // disable confirm + show spinner while M5's API call is in flight
}
```
Keep names stable; if you change them, document loudly in the build report so M5's brief matches.

## Behavior + UI Bible compliance (MANDATORY — graded)
Read `/home/user/workspace/UI_BIBLE.txt`.
- **Full preview copy (decision #10)**: a clear sentence like "This delivers '<contentTitle>' to <N> <audienceLabel> on <formatted fireAt>." Warm, not technical. When `audienceCount === 0`, disable confirm and show a calm empty-state ("No buyers match yet").
- **Date picker — error-prevention (decision #6 + UI Bible)**: use `@react-native-community/datetimepicker` with `minimumDate = today` so PAST dates are physically un-selectable. If `fireAt` is null, confirm is disabled until a valid future date is chosen. Format the date with the repo's existing date util if present.
- **Buyer-notify toggle (decision #9)**: a switch, default ON, labeled warmly ("Notify these buyers" / "Buyers get a notification"). Reflects `buyerNotify` prop.
- **CALM / Hick's / Miller's**: one primary action ("Confirm & schedule") visually dominant; "Cancel" secondary; ≤5 decision elements (preview line, date picker, notify toggle, confirm, cancel).
- **Brand / NO hardcoded hex**: `const { semanticColors: colors } = useTheme()` from `src/theme/useTheme.ts`. Forest primary accent. NO emoji. NO literal hex.
- **Accessibility**: testIDs (`push-confirm-date`, `push-confirm-notify`, `push-confirm-submit`, `push-confirm-cancel`); 44pt touch targets; safe-area; `submitting` disables the confirm button and shows progress.

## Tests
Cover: renders preview line with N + audienceLabel + formatted date; confirm DISABLED when fireAt null or audienceCount 0; date picker minimumDate prevents past selection (assert the prop / that an attempted past date doesn't enable confirm); toggle reflects + fires onChangeBuyerNotify; onConfirm/onCancel fire on the right presses; submitting disables confirm. Use the repo's RN testing-library + mock datetimepicker per its conventions.

## Verification (run, report actual counts)
- `npx tsc --noEmit` → 0 errors
- `npx eslint` on new files → 0 errors/warnings
- `npx jest <your test file>` → all pass (counts)
- Confirm the datetimepicker dep installs cleanly and tsc resolves its types.

## Deliverables
- Branch pushed; open PR to `main` titled `PR-17 M4: push confirm modal + date picker`. Report PR number.
- Build report `specs/PR17_M4_BUILD_REPORT.md` in tgp-agent-context (props contract as shipped, dep + version, UI-Bible decisions, test counts, final SHA). Commit (R4) + push to docs main after rebasing clean.
- Report final branch HEAD SHA. Builder record, not a verdict — GPT-5.5 auditor re-checks at your SHA.

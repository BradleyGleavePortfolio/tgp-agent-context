# QA-COACH-STATES-131 (agent 131)

Lane: QA-COACH-STATES-131, group C3, Opus, T1 mobile. Plan row: "Five different loading looks and nine error looks across coach screens: one calm error with a 'Try again' text button, and one loading look." Source: AUD-FIN-DESIGN-129 job QA-COACH-STATES-129 ("one calm error (sentence + forest 'Try again' text button, no red fill/box/icon), skeleton loading, 'Could not' wording, 'Check your connection' only for network errors").

Worktree `/home/user/workspace/wt/QA-COACH-STATES-131-mobile`, branch `agent131/qa-coach-states-131`, cut from mobile main `e1688b51`, merged `origin/main` `96b83d0f` (clean, no conflicts) before the PR.

## Scope traced

All five recon files exist; line refs below are on main `e1688b51`.

| File | Loading look on main | Error look on main |
|---|---|---|
| `src/screens/coach/CoachBookingInboxScreen.tsx` | full screen `SkeletonScreen` (kept); past sessions: printed "Loading past sessions." text (:417-420) | requests: ink text plus filled oxblood "Retry" (:242-259); upcoming: red text, no action (:368-371); past: red text, no action (:421-424) |
| `src/screens/coach/CoachInvitesScreen.tsx` | full screen `ActivityIndicator` that hid Back and Bulk invite (:285-291) | red cloud icon, "Couldn't load invites", raw server text through `errorMessage`, filled forest "Retry" |
| `src/screens/coach/PendingAiDraftsScreen.tsx` | empty-state title "Loading pending drafts…" | empty-state "Could not load drafts / Pull down to retry.", no button |
| `src/screens/coach/RiskBoardScreen.tsx` | `SkeletonList` (kept); footer `ActivityIndicator` | "Could not load risk data" plus raw `err.message`, no button |
| `src/screens/coach/programs/ProgramUi.tsx` | `LoadingRow`: spinner plus printed label | `FailureBox`: pink box, red border, red icon, filled `SmallButton`s (Retry / Sign in again / Contact support) |

Helpers read: `calendarErrorMessage` (`src/calendar/schedulingErrors.ts`, already network-aware, "could not" wording, kept for the booking inbox); `errorMessage` (`src/types/common.ts:37-67`, passes raw server text, no longer used for the invites load); `describeProgramFailure` (`src/utils/programErrors.ts`, kept). Primitives: `SkeletonRow` (`src/ui/skeletons/Skeleton.tsx`), `quietActions` (`src/ui/sections/QuietSection.tsx`, 44 pt text actions), `HapticPressable`. `CoachErrorState` (`src/components/community/coach/CoachErrorState.tsx`) was not reused: it draws a red "Could not load" chip (:53-58) and a filled button, and client screens use it (QA-PRIM-131 owns it).

New: `src/ui/states/QuietStates.tsx`
- `QuietError`: sentence in `colors.textPrimary` (Inter body), no icon, fill or border; first action forest `colors.primary` text, further actions `colors.textMuted`; every action `quietActions.action` (minHeight 44); `accessibilityRole="alert"`, live region polite; `layout` block (centred) or inline; `retrying` disables Try again; retry testID `${testID}-retry`.
- `QuietLoading`: `SkeletonRow` rows inside an accessible View whose label is spoken, not printed.
- `isConnectionFailure` / `loadFailureMessage(err, what)`: "<What> could not load. Check your connection, then try again." only when the request got no answer (no `response`; `ERR_NETWORK`, `ECONNABORTED`, `ETIMEDOUT`, "Network Error" or an axios error without a response); otherwise "<What> could not load. Try again in a moment." Server text is never shown.

## B list

- **B1** Risk board printed the raw error (`RiskBoardScreen.tsx` catch, `err.message`, e.g. "Request failed with status code 500", "Network timeout") and had no retry button. Fixed: calm sentence plus Try again -> `fetchPage('initial', filter)`. Seen in a test (`qaCoachStates131` "never shows the raw error", `RiskBoardScreen.test.tsx` updated).
- **B2** Invites printed raw server text for refused loads ("Forbidden resource") under "Couldn't load invites" with a red icon. Fixed: `loadFailureMessage(err, 'Your invites')`. Seen in a test.
- **B3** Pending AI drafts error had no action ("Pull down to retry."). Fixed: Try again -> `query.refetch()`. Seen in a test.
- **B4** Booking inbox upcoming and past-session errors were red text with no retry. Fixed: inline `QuietError`, Try again -> `agendaQ.refetch()` / `endedQ.refetch()`. Upcoming press seen in a test; past-sessions button seen in a test, press from the code.

## U list

- **U1** One loading look: invites skeleton under the top bar (Back and Bulk invite stay reachable, seen in a test); pending drafts skeleton (seen); booking inbox past sessions skeleton with spoken label (seen); Programs `LoadingRow` skeleton with spoken label (seen); risk board footer skeleton row (from the code).
- **U2** One error look across the nine variants (booking requests, upcoming, past; invites; pending drafts; risk board; `FailureBox` retry, sign-in and support). No red text, icon, pink box or filled red button; forest "Try again" text action. Seen in a test for all surfaces (the shared `expectCalm` check: no `colors.error` / `noticeCritical*` value anywhere in the state, Try again has no fill or border, minHeight 44, forest label).

## C one-liners

- C1 Risk board: a failed "load more" page is silent when rows exist (ListEmptyComponent only renders with no rows), `RiskBoardScreen.tsx:239-240`. Pre-existing.
- C2 Booking inbox: a failed request list replaces the whole screen, hiding upcoming and past sessions that did load, `CoachBookingInboxScreen.tsx:244`. Pre-existing structure.
- C3 A permanent refusal (403) reads "Try again in a moment"; the coach endpoints are coach-scoped, so this is unlikely. `QuietStates.tsx` `loadFailureMessage`.
- C4 Booking inbox, pending drafts and risk board have no in-screen back control (`headerShown: false`, `CoachNavigator.tsx:350`); system back works. Out of scope.
- C5 `FailureBox` "Sign in again" uses a dynamic `import()` jest cannot run; its handler is unchanged from main, graded from the code.

## PRs

- growth-project-mobile#556 `fix(coach): one calm load error and one skeleton loading look on five coach screens`, head `53f10d0a84ac7a342b996a6d8fe57fc6895dc5b7`. 11 files, 746 changed lines (tests 277).

Failing first on main `e1688b51` (clean detached checkout, test file copied in): `qaCoachStates131.test.tsx` 13 of 13 fail for the intended reasons (no `coach-requests-error`, red `#B91C1C` text in upcoming, no skeleton testIDs, "Forbidden resource" printed, pink `#F2E0E0` `FailureBox`, printed "Loading programs"). Log: `ops/reports/QA-COACH-STATES-131-evidence/failing_first_main_e1688b51.log`.

Local on the branch (one file at a time through `heavy.sh`): qaCoachStates131 13/13, RiskBoardScreen 16/16, coachInvitesScreen 6/6, coachTeamP0Blockers 19/19, programsScreens 9/9, coachSchedulingFixRound 16/16, conciergePhase1 4/4, coachMediaPicker 7/7, copyVoice.guard 8/8, truthfulCopy.guard 20/20, quietLuxuryDoctrine 30/30.

CI at head `53f10d0a`: run 37728323182 "CI" (Typecheck, lint, test) completed success at 21:43 PDT. Conflict check against main `842eb059` at 21:52 PDT (`git merge-tree`): clean, so the head was not moved.

## Not fixed / Proposed (needs operator)

| # | Where | Smallest fix | Default |
|---|---|---|---|
| P1 | Booking inbox Confirm filled oxblood, Decline oxblood border: `CoachBookingInboxScreen.tsx:169`, `:324`, `:340`, `:343` | forest Confirm, ink-bordered Decline | follow-up QA job; not part of "error and loading looks" |
| P2 | Booking inbox action notices in red: `CoachBookingInboxScreen.tsx:265`, `:413` | ink text for error tone (message words already explain) | same follow-up job as P1 |
| P3 | `describeProgramFailure` copy says "Retry" while the button says "Try again": `src/utils/programErrors.ts:177`, `:341`, `:355` | replace "Retry" with "Try again" in the three strings | later QA copy job (tests pin these strings) |
| P4 | `CoachErrorState` red "Could not load" chip and filled button on client screens: `src/components/community/coach/CoachErrorState.tsx:53-58`, `:75` | render `QuietError` inside it | QA-PRIM-131 adopts `QuietError` |
| P5 | Risk board silent "load more" failure (C1): `RiskBoardScreen.tsx:239` | inline `QuietError` in the footer when `error && items.length` | follow-up; low traffic |
| P6 | Two calm-error primitives now exist: `src/components/coach/LoadFailedNotice.tsx` (QA-COACH-HOME-131, merged on main after this branch was cut; sentence plus forest Try again, `semanticColors`) and `src/ui/states/QuietStates.tsx` `QuietError` (adds extra actions, inline/block layout, `retrying`, plus `QuietLoading` and `loadFailureMessage`). Same look, from the code | make `LoadFailedNotice` render `QuietError` (about 30 lines, one PR) | keep both tonight; agent 132 or QA-PRIM picks one owner |

## HANDOFF

- State: growth-project-mobile#556 open, head `53f10d0a84ac7a342b996a6d8fe57fc6895dc5b7`, CI green (run 37728323182), no conflict with main `842eb059` (merge-tree clean at 21:52 PDT). READY posted at 21:55 PDT at that exact head (issuecomment-6052580340). Builder ended after READY, per the wind-down; no verdicts awaited.
- Next: Claude Opus 5.5 and GPT-6.1 Sol review at the exact head; the operator merges only after both approve. Never merge from this lane.
- If a lens asks for changes (agent 132 or a fix lane): worktree `/home/user/workspace/wt/QA-COACH-STATES-131-mobile`, branch `agent131/qa-coach-states-131`. Bring in main with `git merge origin/main`, no rebase. Run one file at a time via `ops/heavy.sh`: `src/__tests__/qaCoachStates131.test.tsx`, `RiskBoardScreen.test.tsx`, `coachInvitesScreen.test.tsx`, `coachTeamP0Blockers.test.tsx`, `programsScreens.test.tsx`, `coachSchedulingFixRound.test.tsx`. Notes: the theme mocks in the invites, team and risk-board tests provide only `colors`, so `QuietStates` must keep using `useTheme().colors`. The `FailureBox` "Sign in again" handler uses a dynamic `import()` that jest cannot run (graded from the code). Keep testIDs `coach-invites-error-state(-retry)`, `coach-agenda-error`, `coach-ended-error`, `coach-ended-loading`.
- Not reached, for agent 132 or the operator: P1 to P6 above (oxblood Confirm/Decline and red notices in the booking inbox; "Retry" wording in `describeProgramFailure`; the `CoachErrorState` red chip; the silent risk-board load-more failure; `LoadFailedNotice` vs `QuietError` consolidation).
- Evidence: `ops/reports/QA-COACH-STATES-131-evidence/` (failing-first log on main, PR body, READY text). Scratch proof checkout `/tmp/qa131-main` (detached at `e1688b51`, test file copied in, untracked) is left in place.
- Push state: branch pushed, local HEAD equals remote, worktree clean. No stash used.

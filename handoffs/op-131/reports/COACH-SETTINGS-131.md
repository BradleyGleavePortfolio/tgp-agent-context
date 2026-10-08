# COACH-SETTINGS-131 (Claude Opus 5.5, builder, T3 mobile, agent 131)

Status 23:33 PDT: m#559 READY at head 173beb3218d4e8680446c67efc384b04fa61a4b5. READY comment 6053919897 posted at 23:32:09 after checking the head on GitHub. CI green at that head; GitHub reports MERGEABLE, CLEAN. Not merged.
Branch agent131/coach-settings-131 (from mobile main 842eb059, merged origin/main 5dbab278). Worktree /home/user/workspace/wt/COACH-SETTINGS-131-mobile, clean and pushed.
Sources: JOBS131 restart row COACH-SETTINGS-131; FIX_PLANS_130_131 C3 row; AUD-COACH-WEEK1-129 U2 (and B2, whose mobile half m#546 already merged).

## Scope traced
- src/screens/coach/SettingsScreen.tsx on main 842eb059: clientCount `useState(0)` (:59), set from `coachApi.getClients()` inside loadSettings (:118-122), shown at :415-416; Notification preferences `navigation.navigate('NotificationPreferences')` (:635).
- src/navigation/CoachNavigator.tsx: NotificationPreferences is registered only in ClientsStack (:236 type, :503 screen), and SettingsHome is in SettingsStack. This is React Navigation 7 (core 7.21.1) without `navigationInChildEnabled`: `useOnAction` lets child navigators handle only NAVIGATE_DEPRECATED, so no navigator handles the bare name sent from SettingsStack. pushTapRouter.ts:98 already uses `{ root: 'ClientsStack', screen: 'NotificationPreferences' }`.
- Backend (RO-backend 21598a39): GET /coach/clients defaults to status active and `take ?? 20` (coach.controller.ts:63-75, coach.service.ts:149-174; take max 50). GET /coach/ai/budget is `@Roles('coach','owner')`, so a sub_coach gets 403. It returns the head coach's combined envelope (coach-ai.controller.ts:38-51). period_end is the start of the next UTC month (coach-ai-budget.service.ts:158).
- src/hooks/useAIBudget.ts and src/api/types/coachAIBudget.ts (`surfaceFor`, `clampPctForDisplay`) are reused unchanged. src/components/coach/ai-budget/* and CoachNavigator.tsx were not touched (m#551 edits them).
- Roman sub-label: main already reads "Ask about programming, nutrition or running your practice." (m#546, merged 21:05). Kept as is, and its test is unchanged.

## B list
- None.

## U list (all fixed in m#559)
- U-1, seen in a test (failing-first on main renders the text "0" while loading and after a failed load): Active Clients read 0 in both cases. Fix: a null state shows "—", and the count has its own request.
- U-2, from the code: the count stopped at 20 (the default page). Fix: one 50-row page, shown as "50+" when the page is full.
- U-3, seen in a test (failing-first on main: the press reached no screen): the Notification preferences row did nothing. Fix: `navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false })`.
- U-4, from the code (AUD-COACH-WEEK1-129 U2): coaches had no screen showing the AI-credit balance or a warning. Fix: a text-only AI credits row in Payments:
  - percent left, "Used by Roman and AI drafts for you and your clients." and the renewal day
  - a low-credit note from 80 percent used, and a paused note at 100 percent
  - "—" while loading; a failed read says so and retries on tap
  - hidden for sub_coach, and it polls only while Settings is focused

## C one-liners
- C: Notification preferences opens in the Clients tab, like the other ClientsStack rows in Settings.
- C (edge, deferred to 10k clients): the renewal day is formatted in UTC, so a Pacific coach may get credits back a few hours before the stated day.
- C: rowSubLabel is 12 pt (existing shared style, not restyled here).
- C: NotificationCenterScreen.tsx:332 also uses a bare `navigate('NotificationPreferences')`. It works because NotificationCenter is in the same ClientsStack. No action.

## PRs
- m#559 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/559 @ 173beb3218d4e8680446c67efc384b04fa61a4b5. Commits: 91e00978, 83abc705 and merge 173beb32 (origin/main 5dbab278).
  - Size: 510 changed lines (499 added, 11 deleted): tests 323, source 185, README 2.
  - 6 files: SettingsScreen.tsx; settings/AICreditsRow.tsx (new); __tests__/SettingsScreen.coachSettings131.test.tsx (new); a coach README paragraph; and an AICreditsRow stub in two existing Settings harnesses (coachSettingsMoneyRow, imessageDmRoutes). Those harnesses render without a QueryClient, so they get a stub like the existing BookingOptionsEntry one.
- Local results:
  - New test 11/11. Failing-first on main's SettingsScreen: 10/11 fail (logs: reports/COACH-SETTINGS-131-failing-first-main.log, reports/COACH-SETTINGS-131-failing-first-main-zero.log).
  - Other suites: coachSettingsMoneyRow 9/9, imessageDmRoutes 2/2, quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, coachSaasBlockers 29/29, followUpDeadRows126 7/7, romanConversationsReachable 8/8.
  - Targeted ESLint is clean. A targeted tsc over the changed files' import graph (temporary config /tmp/tsconfig.cs131.json, 1,344 files) is clean. After the main merge, the new test (11/11) and coachSettingsMoneyRow (9/9) were run again and pass.
- CI history:
  - 91e00978 failed Typecheck: in the new test, the untyped `createNavigationContainerRef()` gave `getCurrentRoute()?.name` the type `never` (TS2339). Fixed in 83abc705 with `createNavigationContainerRef<ParamListBase>()`. The targeted tsc reproduced the error on the old line.
  - 83abc705 (run 37735856655): Lint and Typecheck green. Test failed only on the unrelated flake src/screens/client/__tests__/WorkoutScreen.calm130.test.tsx (9679/9680 passed). Rerunning my failed job failed again on the same test (job 113177432640).
  - 173beb32: all green (Typecheck, lint, test run 37737526321; Analyze actions and javascript-typescript; CodeQL).
- Merge checks: merges clean with m#551 at 1138ea71 (git merge-tree; both edit src/screens/coach/README.md, in hunks that do not touch). The PR body is in reports/COACH-SETTINGS-131-pr-body.md and the READY text in reports/COACH-SETTINGS-131-ready-comment.md.
- Verdicts at 173beb32: none yet.

## Not fixed (needs operator)
- None inside this entry.

## Proposed (needs operator)
- P-1: coach Settings rows that open ClientsStack screens switch the coach to the Clients tab, and Back does not return to Settings. Those rows: Invite Codes, Bulk invite, Invites & email, Workout Builder, Booking Inbox, Availability, Appointment Types, Time Off, Booking Options, and now Notification preferences. Fix: register those screens in SettingsStack too (CoachNavigator.tsx). Default: one PR after the iOS cut, after m#551 merges (it edits CoachNavigator.tsx).
- P-2: main CI flake, from the code and the CI render tree. The test src/screens/client/__tests__/WorkoutScreen.calm130.test.tsx, "weights read lb ...", fails on fast CI runners.
  - Cause: the fixture session is dated `new Date()` (test :103), and the Training volume chart's newest bucket is `[now - 7 days, now)` (src/screens/client/WorkoutScreen.tsx:420-427, `d < weekEnd`). If less than 1 ms passes between building the fixture and the screen computing `now`, the session lands in no bucket. CI then shows "Complete workouts to see volume data" while Recent workouts lists the session and the week count is 1, so "500 lb" never appears.
  - Seen on: main 842eb059 (run 37729508645) and m#559 at 83abc705 twice. Main d39d8180 CI also failed in Test (suite not checked). CI passed on main 5dbab278 (run 37736316043), and FLEET131 23:09 lists m#557 and m#558 with green CI.
  - Product impact (U, from the code): the same strict bound leaves a session off the chart when its server timestamp is a few seconds ahead of the phone clock, until the clock catches up.
  - Smallest fix: make the newest bucket inclusive (`d <= weekEnd` when w = 0), or date the fixture one minute in the past. Default: FIX lane, one PR with a test, now if main CI keeps failing, otherwise after the iOS cut.

## HANDOFF
- Done: COACH-SETTINGS-131 is built. m#559 READY at 173beb3218d4e8680446c67efc384b04fa61a4b5 (comment 6053919897, 23:32 PDT), CI green, MERGEABLE/CLEAN, no holds (m#546 merged; m#551 merges clean with it).
- Next: two lens audits at 173beb32 (T3, Opus-built). For a REQUEST CHANGES, the fixer uses worktree /home/user/workspace/wt/COACH-SETTINGS-131-mobile on branch agent131/coach-settings-131. It is clean and pushed, and node_modules is linked. Bring in main with `git merge origin/main` only.
- Lens pointers:
  - Copy claims and their sources are in the PR body's "Truthful sweep": tutorial lines AIBudgetTutorialModal.tsx:98-99 and :108-109; budget envelope coach-ai.controller.ts:38-51; renewal coach-ai-budget.service.ts:158.
  - The route fix is proven by the real-navigator test (the stack becomes ClientsList, NotificationPreferences).
- Open items for the operator: P-1 (SettingsStack registration) and P-2 (calm130 flake and the chart bound). Defaults are above.
- Nothing is left running. Temporary files are outside the workspace (/tmp/cs131-*).

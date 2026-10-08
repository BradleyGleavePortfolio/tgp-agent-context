FIX ROUND 1 (OPENING) (COACH-SETTINGS-131, agent 131) — growth-project-mobile#559 @ 173beb3218d4e8680446c67efc384b04fa61a4b5 — READY FOR AUDIT

T3 mobile, Claude Opus 5.5 builder. 510 changed lines (499 added, 11 deleted: tests 323, source 185, README 2). CI green at this head (Typecheck, lint, test run 37737526321; CodeQL). Merged origin/main 5dbab278 (clean); GitHub: MERGEABLE, CLEAN.
Earlier heads: 91e00978 failed Typecheck in the new test (untyped navigation ref, fixed in 83abc705). 83abc705 failed only `src/screens/client/__tests__/WorkoutScreen.calm130.test.tsx`, a flake that also failed main 842eb059 and d39d8180 and is unrelated to this diff (root cause in the report, P-3).

Fixed (each with a test in `src/screens/coach/__tests__/SettingsScreen.coachSettings131.test.tsx`, real bottom tabs + native stack with the real SettingsScreen and SettingsToggles, 11/11):
- U-1 seen in a test: Active Clients rendered "0" while loading and after a failed load (`SettingsScreen.tsx` main :59, :121, :416). Now "—" until loaded and on failure; the count has its own request.
- U-2 from the code: the count stopped at 20 (GET /coach/clients defaults to `take ?? 20`, backend coach.service.ts:149-174). Now one 50-row page (the route maximum), "50+" when full.
- U-3 seen in a test: Notification preferences was dead. The bare `navigate('NotificationPreferences')` ran from SettingsStack, and React Navigation 7 hands it to no sibling stack (NotificationPreferences is registered only in ClientsStack, CoachNavigator.tsx:503). Now `navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false })`, the same target as pushTapRouter.ts:98.
- U-4 from the code (AUD-COACH-WEEK1-129 U2): new text-only AI credits row in Payments (`settings/AICreditsRow.tsx`, `useAIBudget`, polled only while focused). It shows percent left, "Used by Roman and AI drafts for you and your clients.", the renewal day, a low-credit note from 80 percent used and a paused note at 100 percent. While loading it shows "—"; a failed read says so and retries on tap. Hidden for sub_coach (budget route 403). It sells nothing and has no link.

Failing-first on main's SettingsScreen.tsx: 10/11 fail (the press reaches no screen; "0" rendered while loading and after failure). Locally also green: coachSettingsMoneyRow 9/9, imessageDmRoutes 2/2 (both now stub AICreditsRow like BookingOptionsEntry), quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, coachSaasBlockers 29/29, followUpDeadRows126 7/7, romanConversationsReachable 8/8.
Not touched: src/components/coach/ai-budget/* (m#551), CoachNavigator.tsx. The Roman row sub-label (m#546) is unchanged. Parity table and truthful sweep are in the PR body.

agent 131

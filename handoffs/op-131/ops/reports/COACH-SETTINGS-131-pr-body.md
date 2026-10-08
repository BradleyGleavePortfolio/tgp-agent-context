Tier: T3
Why: coach Settings states numbers that are not true (Active Clients reads 0 while loading and after a failed load, and caps at 20), the Notification preferences row does nothing, and a coach has no place to see the AI-credit balance or a low-credit warning (AUD-COACH-WEEK1-129 U2; FIX_PLANS C3 COACH-SETTINGS-131).
T4 trigger scan: none. Read-only display of `GET /coach/ai/budget` (existing `useAIBudget`); no payment, pool, consent, auth, PII or data-write path changes. No purchase surface is added: the AI credits row is text only and sells nothing. `src/components/coach/ai-budget/*` untouched (m#551 edits it).
T3 trigger scan: customer-facing claims about the AI-credit balance, what uses credits and what happens when they run out; a customer-facing client count.
Bounded T1: NO (customer-facing money-adjacent copy).
Canonical builder: Claude Opus 5.5 (COACH-SETTINGS-131, agent 131)
Parent owner: operator agent 131
Acceptance evidence: new `src/screens/coach/__tests__/SettingsScreen.coachSettings131.test.tsx` (real bottom tabs + native stack, the real coach SettingsScreen and its real SettingsToggles), 11/11 on this branch. Failing-first on main's `SettingsScreen.tsx` (842eb059): 10/11 fail. The Notification preferences press reaches no screen ("Unable to find an element with text: Notification preferences screen"), and the loading and failed-load cases render the text "0". Existing suites pass locally: coachSettingsMoneyRow 9/9, imessageDmRoutes 2/2, quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, coachSaasBlockers 29/29, followUpDeadRows126 7/7, romanConversationsReachable 8/8; targeted ESLint clean.
Promotion triggers: any change that makes the AI credits row open a checkout or a pack, any change to how the pool is charged or when AI pauses, or showing the row to a sub_coach.

## What changes for coaches/clients
- Coaches, Settings > Client Management: *Active Clients* shows "—" while the roster loads and if it fails to load (it used to show 0). It reads one 50-row page of active clients, so a coach with 21-49 clients sees the real number (the route returns 20 rows by default, so it used to stop at 20); a full page reads "50+".
- Coaches, Settings > Notifications: *Notification preferences* now opens the notification preferences screen. It opens in the Clients tab, the only place the coach navigator registers that screen (the coach push router uses the same target). Before, the tap did nothing.
- Coaches, Settings > Payments: a new *AI credits* line, text only: "62% left", "Used by Roman and AI drafts for you and your clients. Renews Nov 1." From 80 percent used it adds "Running low. AI features pause when credits run out."; at 100 percent it reads "None left" and "AI features are paused until Nov 1." While loading it shows "—"; a failed read says "The balance did not load. Tap to try again." and retries on tap. Hidden for a sub_coach, whom `GET /coach/ai/budget` refuses (403). It polls only while Settings is focused.
- Clients: nothing changes. Backend: nothing changes.
- The Roman row's sub-label already reads "Ask about programming, nutrition or running your practice." (m#546, merged); this PR keeps it and its test unchanged.

## B/U list
- U-1 (seen in a test, failing-first on main): Active Clients reads 0 while loading and stays 0 after a failed load. A coach opening Settings on a slow or failed connection is told they have no clients. Fixed: "—", and the count has its own request so a failed settings or bio read cannot hide it.
- U-2 (from the code; backend `src/coach/coach.controller.ts:63-75` and `coach.service.ts:149-174`, `take ?? 20`): the count stopped at 20. A coach with 30 active clients saw 20. Fixed: one 50-row page (the route's maximum), "50+" when full.
- U-3 (seen in a test, failing-first on main): the Notification preferences row was dead. `navigate('NotificationPreferences')` ran from the Settings stack, and React Navigation 7 hands an unknown name to no sibling stack without `navigationInChildEnabled` (`@react-navigation/core` useOnAction). A coach tapping it saw nothing happen. Fixed: `navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false })`.
- U-4 (from the code, AUD-COACH-WEEK1-129 U2): a coach never saw the AI-credit balance or a warning (AIBudgetMount mounts only on the legacy CoachHomeScreen). Fixed: the AI credits row with a low-credit note.
- C: the row opens a screen in the Clients tab, like the other ClientsStack rows in Settings (see Proposed in the report). C: renewal day is shown in UTC (the period ends at 00:00 UTC on the 1st), so a Pacific coach may get credits back a few hours before the stated day (edge, deferred).

## Routes/actions before -> after (coach SettingsScreen)
| label | before | after |
|---|---|---|
| Active Clients (value) | `{clientCount}`, 0 until loaded, 0 on failure, max 20 | count, "50+" when the page is full, "—" while loading and on failure |
| Notification preferences | `navigate('NotificationPreferences')`: no navigator handled it (dead) | `navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false })` |
| AI credits (new, Payments) | none | text only; on a failed read, tap = `refetch()` of `GET /coach/ai/budget`; hidden for sub_coach |
| Featured coach, Import my records, Invite Codes, Bulk invite clients, Invites & email | unchanged | unchanged |
| Packages, Payouts (Stripe Connect), Money | unchanged | unchanged |
| Workout Builder, Booking Inbox, Availability, Booking Options, Appointment Types, Time Off | unchanged | unchanged |
| Team / Gym profile, Billing (BillingSection), Haptics, Security | unchanged | unchanged |
| Roman, Blocked Users, Your conversations with Roman, Both pillars view | unchanged | unchanged |
| Trust Center, Data export, Delete account, Keep account, Sign out, Support, Help centre | unchanged | unchanged |
| Bio and password modals | unchanged | unchanged |
Parity: no row removed or rerouted except Notification preferences (dead before). The new test presses the real row inside real navigators and asserts the stack becomes ClientsList, NotificationPreferences; coachSettingsMoneyRow.test.tsx (9/9) still drives Roman, Money, Help and Featured coach.

## Truthful sweep
- "—" is shown whenever the number is not known; no 0 is invented. "50+" is true for a full page.
- "Used by Roman and AI drafts for you and your clients." The budget is the combined coach and client envelope (backend `coach-ai.controller.ts:38-51`), and the approved tutorial lists AI drafts, briefs and client chat (`AIBudgetTutorialModal.tsx:98-99`).
- "AI features pause when credits run out" and "AI features are paused until <day>" match the approved card "AI features pause until your allowance renews at the start of your next period." (`AIBudgetTutorialModal.tsx:108-109`). No link, URL or instruction to buy elsewhere (3.1.1 / 3.1.3).
- "Renews <day>": `period_end` is the start of the next calendar month in UTC (backend `coach-ai-budget.service.ts:158`, `startOfNextMonth`), formatted in UTC.
- Thresholds reuse `surfaceFor` (`src/api/types/coachAIBudget.ts`): low = 80-99 percent used, paused = 100 or more.
- No first person, no exclamation marks, no emojis, no generic errors. Theme colours only (existing `styles.row*`; icon `pie-chart-outline`, outline, `colors.textSecondary`). No red; low credit is said in words.
- README: `src/screens/coach/README.md` paragraph after the Roman row.

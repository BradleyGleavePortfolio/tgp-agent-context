# FW-NOTIF-128: first-week notifications and reminders (auditor, read-only)

Auditor FW-NOTIF-128 (an FW-AUD-128 instance), agent 128. 14:31-14:44 PDT 10-07. No code, no PRs, no comments.
Traced on mobile origin/main 4185b9b2 (newer than RO d0875d26; m#481 Settings and the Notification Center redo are merged) and
backend origin/main c7caffff (no notification files changed since RO 0d179edb). Production flags: FEATURE_COMMUNITY_PUSH true,
BOOKING_REMINDERS_ENABLED on, WORKOUT_REMINDERS_ENABLED unset (= on), FEATURE_DUNNING_V2 true, NUDGE_ENABLED not set (= on),
EMAIL_DIGEST_* not set (= on).

## Scope traced
- Permission: Day-1 step 4 (day-one/NotificationsScreen.tsx), Home card (components/home/PushPermissionCard.tsx, coach/coachless copy),
  token registration (App.tsx:144-170 on every auth change, permission never prompted there), sign-out token clear (authActions.ts:350).
- What fires in week one (client): coach message push (sendPush outbox, lock-screen fixed copy), booking 24 h / 1 h reminders,
  workout reminder "From Roman" (first-session day + plan days, engagement/workout-reminder.service.ts), workout/meal-plan assigned,
  nudges (missed check-in 2-6 days, onboarding abandoned), trial-ending notice (3 days before end), community pushes, local "Fast
  Complete" alert, daily 07:00 UTC email digest + Sunday weekly digest, each with an in-app row.
- Preferences: client Settings > Notifications (4 switches), Settings > Notification preferences (full screen: mute all, 4 kinds x 3
  channels, fixed quiet hours), the category screen settings/NotificationPreferencesScreen.tsx; backend gates (push-preferences.ts,
  createNotification gate, outbox re-check, direct pushToUser callers).
- Deep links: backend pushTapData / direct data payloads vs. mobile pushTapRouter CLIENT_PUSH_ROUTES and inbox normalize.
- Badges: in-app bell unread count (consistent filter list vs. count); no OS icon badge is set anywhere (none goes stale).
- Open PRs on my files: m#507 (DES-BA, head 0cd0e8ee, 294/72, CI "Typecheck, lint, test" FAILURE) touches both preference screens.
  Judged at its head; its fixes are not re-reported.

## (1) B list
None. Nothing found in this area that an ordinary user hits on a normal day with money, privacy, safety, data loss or a core-flow dead
end. Mute all is honoured by every client push path that fires in week one (outbox, booking, workout reminder, nudges, trial, community,
digest), lock screens carry fixed copy with no message text or health detail, and the inbox is JWT-scoped.

## (2) U list
U1. Pushes that arrive while the app is open are dropped without a trace. The foreground handler hides the system banner and the list
    entry (mobile src/services/pushNotifications.ts:107-114: shouldShowBanner false, shouldShowList false) and hands the payload to
    foregroundBannerStore, but ForegroundNotificationBanner is never mounted (no import anywhere outside its own file and tests). A client
    who is in the app when the coach writes, or when the 1 h session reminder fires, sees nothing until the 30 s bell poll.
    Smallest fix: mount <ForegroundNotificationBanner/> once inside the NavigationContainer (RootNavigator.tsx) and make its tap call
    routeInAppNotification(actionScreen ?? fallbackScreenForKind(kind), params) instead of a raw navigate (ForegroundNotificationBanner.tsx:96-104).
U2. All four switches in client Settings > Notifications do nothing (SettingsScreen.tsx:151-156, 303-350):
    "Daily Check-in" -> daily_checkin_enabled, read by no backend code; "Meal Reminders" -> eat_enabled, no meal reminder exists
    anywhere; "Fasting Alerts" -> fasting_enabled, but the local "Fast Complete" alert is scheduled unconditionally
    (FastingScreen.tsx:200) and the switch defaults to off (useSettings.ts:26) while alerts fire; "Weekly Summary" ->
    weekly_summary_enabled, but the digest selects on muted + digest_email only (backend digest.service.ts:383-398), so the daily
    and weekly emails keep coming. Smallest fix: Fasting Alerts gates scheduleFastingAlert and defaults on; Weekly Summary becomes
    "Summary emails" mapped to digest_email; remove Daily Check-in and Meal Reminders (rule 2, nothing behind them) or map Daily
    Check-in to nudge_missed_checkin_push/_inapp with honest label "Check-in nudges".
U3. Workout reminders ("From Roman", default on, week one) have no switch a client can reach. The only switch lives on
    settings/NotificationPreferencesScreen.tsx, registered as MoreStack "NotificationPreferences" (ClientNavigator.tsx:548) and
    navigated to by nothing on the client side (Settings goes to NotificationSettings, the center to HomeStack NotificationPreferences).
    Session reminders, check-in nudges and summary emails also have no client switch; only Mute all stops them. The Day-1 bullet
    "Every alert can be turned off in Settings" (day-one/i18n/en.json:66) is therefore only true via Mute all.
    Smallest fix (mobile only, backend DTO already allows the columns): add workout_reminder, booking, nudge_missed_checkin and
    digest (email) rows to KIND_PREFS_PREFIX (notificationsApi.ts:114) and KIND_COPY in notifications/NotificationPreferencesScreen.tsx.
U4. Push denied = silent dead end. After "Not now"/deny, Day-1 says "You can turn these on later from Settings" (en.json:69), the Home card
    hides once iOS cannot ask again, and Notification settings shows every push switch on with no OS state and no way to iOS Settings.
    Smallest fix: one row on the full preferences screen when getPermissionsAsync() is not granted: "Notifications are off for this app
    in your phone's settings." + button Linking.openSettings().
U5. Trial-ending push and its inbox row land on the Notification Center, not the plan. Backend sends actionScreen "ClientPackages"
    (trial-notice.service.ts:113, 442, 742); CLIENT_PUSH_ROUTES (pushTapRouter.ts:64-90) has no ClientPackages, so both resolve to the
    center; the copy says "Cancel anytime before." Smallest fix: add ClientPackages: { root: 'MoreTab', screen: 'ClientPackages',
    initial: false } to CLIENT_PUSH_ROUTES (the route exists, ClientNavigator.tsx:578). Also map meal_plan_assigned and nudge_missed_checkin
    to their screens (today: center).
U6. Daily digest email numbers are wrong (backend digest.service.ts:244-296): "Current streak" = count of check-ins in the last 8 calendar
    days, not consecutive days; weekly "Personal best streak" = the same number; "X of 7" can read 8 of 7; weight is always "lbs"
    (weight_lbs) for kg users. Each send also writes an unread inbox row "Your daily summary has been sent to <email>." (:145-157), so the
    bell shows 1 every morning for every client. Smallest fix: drop the streak rows (or compute consecutive days), label "Check-ins in the
    last 7 days", show weight in the user's unit or omit it, and stop writing the digest inbox row (or write it inbox_hidden).
U7. Quiet hours copy is broader than the code. "Notifications that arrive overnight wait until 8:00 AM" (notifications/
    NotificationPreferencesScreen.tsx:183) holds only for the outbox path. Community pushes (community-notifications.service.ts:240) send
    at once at any hour, and a "Morning" workout reminder fires at 07:00 (workout-reminder.policy.ts:17). Smallest fix: copy "Most
    notifications that arrive between 9:00 PM and 8:00 AM wait until 8:00 AM. Session reminders and reminders at a time you chose still
    arrive." (or route community through sendPush).
U8. First-day workout reminder invents a plan: "Your first session is today. Everything is laid out and ready when you are."
    (workout-reminder.policy.ts:139-140) is sent on the C1 first-session day whether or not any workout is assigned; a coachless client
    with no plan taps into an empty Workouts tab. Smallest fix: when the day has no plan workout, "Your first session is today. Open
    Workouts to start one." (state-driven, tested).
U9. m#507 at head 0cd0e8ee adds a new false line: "The System switch controls weekly summary email." The System switch PATCHes
    weekly_summary_enabled, which the digest ignores (see U2). For the m#507 fix round: either map System to digest_email or say
    "Saved preference." Also its new Reminders copy "Meal reminder preference." labels a switch with no reminder behind it.

## (3) Dead-button table (client, week one)
| Screen | Control | What happens | Verdict |
|---|---|---|---|
| Settings > Notifications | Daily Check-in switch | saves daily_checkin_enabled, nothing reads it | dead (U2) |
| Settings > Notifications | Meal Reminders switch | saves eat_enabled, no meal reminders exist | dead (U2) |
| Settings > Notifications | Fasting Alerts switch | alert fires either way; default off | dead (U2) |
| Settings > Notifications | Weekly Summary switch | digest ignores it | dead (U2) |
| Notification settings | push switches when OS permission is denied | save, nothing can arrive | misleading (U4) |
| Trial-ending push / inbox row | tap | opens the center it came from | dead end (U5) |
| Foreground push | (nothing shown) | n/a | missing (U1) |
| Notification center | rows, Mark all read, Notification preferences link, pull to refresh | real | ok |
| Home card | Turn on / Not now | prompt + token / dismiss per user | ok |
| Day-1 step 4 | Turn on / Not now / Continue | real | ok |
| Notification settings | Mute all, 12 channel switches, back | real (blank screen on load failure is fixed by m#507) | ok |

## (4) First-week polish (ranked)
1. FIX: show pushes that arrive while the app is open (U1). Calm hairline banner, 4 s, tap routes through the router.
2. FIX: one honest Notifications group: the four Settings switches either work or go (U2), and the full screen gains Workout reminders,
   Session reminders, Check-in nudges and Summary emails rows (U3). Every alert really can be turned off, as Day-1 promises.
3. FIX: OS-permission row with "Open phone settings" (U4).
4. FIX: every push opens its own screen: trial ending -> Your plan, meal plan -> meal plan, check-in nudge -> Log (U5).
5. FIX: digest tells the truth and stops the daily inbox row (U6).
6. NEW (owner yes): client daily digest email off by default, weekly kept. Today every client gets an email every day from day 1,
   most reading "0 of 7 check-ins". Recommended default: daily off for clients, weekly on (calm, mentally deloading).
7. FIX: quiet hours and first-day reminder copy (U7, U8).

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs)
- NOTIF-FG-128 (GPT-6.1 Sol, T2 mobile, ~200 lines): U1 + U5. Files: src/components/ForegroundNotificationBanner.tsx,
  src/navigation/RootNavigator.tsx (mount only), src/services/pushTapRouter.ts, src/services/pushNotifications.ts (fallback for
  meal_plan_assigned / nudge_*), tests src/components/__tests__/ForegroundNotificationBanner.test.tsx,
  src/services/__tests__/pushTapRouter.test.ts.
- NOTIF-SET-128 (GPT-6.1 Sol, T2 mobile, ~150 lines): U2. Files: src/screens/client/SettingsScreen.tsx (Notifications group only),
  src/screens/client/FastingScreen.tsx (gate), src/hooks/useSettings.ts (fastingAlerts default true), parity test
  src/screens/client/__tests__/SettingsScreen.parity.test.tsx. Mobile-only; works against current production.
- NOTIF-PREFS-128 (GPT-6.1 Sol, T2 mobile, ~250 lines): U3 + U4 + U7 copy + U9. Files: src/services/notificationsApi.ts,
  src/screens/notifications/NotificationPreferencesScreen.tsx, src/screens/day-one/i18n/en.json (bullet only if needed),
  tests src/__tests__/notificationCenter.test.tsx. CONFLICTS with m#507: launch after m#507 merges, or fold into the m#507 fix round
  (FIX-PR-128) - recommended: fold U9 into m#507's fix round now, run the rest after it merges.
- NOTIF-DIGEST-128 (GPT-6.1 Sol, T2 backend, ~200 lines): U6 + U8. Files: src/notifications/digest.service.ts,
  src/notifications/templates/digest-client.hbs, digest-client-weekly.hbs, src/engagement/workout-reminder.policy.ts (+ the
  service line that passes "has plan workout"), specs. Commit with LEFTHOOK=0. The daily-off default (polish 6) only with an owner yes.

## C (one line each)
- C (edge, deferred to 10k clients): sign-out offline leaves the token on the old account, so a shared phone could show the old
  account's generic "New message" push.
- C: trial-ending push body shows the charge amount on the lock screen (billing, not health); consider "Your free trial ends soon."
- C: dunning-v2 client "Payment" push ignores Mute all (pushToUser direct); arguably correct for billing; Mute all copy could say
  "Billing notices still arrive."
- C: churn-intervention push bypasses mute and lock-screen copy, but no mobile UI sends it (unreachable).
- C: Day-1 grant does not send the token until Day-1 finishes (authEvents.emit), harmless.

## Cross-area (one line each, for the operator)
- FW-COACH / coach side: coach Settings > "Notification preferences" (coach/SettingsScreen.tsx:635) navigates to a route the coach
  SettingsStack does not register (CoachNavigator.tsx:513-545; it lives in ClientsStack), so the row is likely a dead button. Fix:
  navigate('ClientsStack', { screen: 'NotificationPreferences' }) or register it in SettingsStack. Verify with a parity test.
- FW-MONEY: confirm ClientPackages shows the trial end date and the cancel path (U5 lands there).
- FW-BODY: digest and weight emails use weight_lbs only (kg users).

## Not fixed (needs operator)
- Owner decision: client daily digest off by default (polish 6). Recommended default: yes, weekly stays.
- m#507 (DES-BA) CI is red and carries U9; route to its fix round.

## HANDOFF
Audit complete at 14:44 PDT. Mobile origin/main 4185b9b2, backend origin/main c7caffff. B=0, U=9. Four fix jobs above are ready to
launch (NOTIF-PREFS-128 after m#507 or folded into its fix round). A fresh agent continuing: re-check U1-U9 line numbers on the newest
mains, then launch the jobs; nothing else is in flight from this auditor.

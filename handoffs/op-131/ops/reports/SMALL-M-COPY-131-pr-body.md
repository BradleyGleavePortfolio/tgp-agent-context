Tier: T2  
Why: Remove one nonfunctional preference and correct bounded client labels and failure copy inside existing screens.  
T4 trigger scan: None; auth, tenancy, payment, credentials and existing fasting-write behavior are unchanged.  
T3 trigger scan: None; no new sender, shared architecture or API contract.  
Bounded T1: NO; identifying real preference consumers requires engineering judgment.  
Canonical builder: GPT-6.1 Sol  
Parent owner: operator agent 131  
Acceptance evidence: Round 1 had eight failing-first regressions and eleven targeted passes. The operator-authorized follow-up adds two failing-first HTTP 400/409 regressions and four passing failure cases, through `heavy.sh`.  
Promotion triggers: A new notification sender, shared error contract or any T4 boundary.

## Operator-authorized follow-up — FIX ROUND 2

Current head: `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c`. Main `726f90baf1bb946aef9564c250e6ebaf935a073d` was merged normally in `b2fbe098c4bb28b70fa870099bc098b66f750346`; the sole manual merge resolution preserved the incoming EditProfile row and this PR's Shortcuts row, with no other merge edits. ([Combined README](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/README.md))

The Opus lens's nonblocking U1 is fixed: Shortcuts Start fast reads the existing `errorStatus` helper and shows "A fast is already running. Open Fasting to see it." for HTTP 400/409, while every other failure retains the connection instruction. The alert never displays raw backend text. ([Opus finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064837514), [Updated Shortcuts handler](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/WidgetsScreen.tsx))

Both HTTP 400/409 tests failed before the handler fix at the merge-only head; four updated cases now pass: HTTP 400, HTTP 409, HTTP 500 and no connection. A rejected start schedules nothing, does not navigate, and releases the action. Existing routes, successful start/alert behavior, and all other screen code remain unchanged. ([Restored failure coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/__tests__/WidgetsScreen.test.tsx))

The original round's evidence below remains pinned to its original head; the current exception and regression evidence are above.

## What changes for coaches/clients

Clients no longer see the meal-reminder switch that controls no sender; other category switches remain, and existing saved `client_bot` values are retained harmlessly. ([Notification preferences](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/settings/NotificationPreferencesScreen.tsx))

Profile now calls its existing quick-action destination Shortcuts, Quick log simply says it opens the food log, and fasting failures give fixed, action-specific retry instructions instead of raw error text. ([Profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/ProfileScreen.tsx), [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/WidgetsScreen.tsx), [Fasting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/FastingScreen.tsx))

## B/U list

B: none in the assigned scope.

| Fixed U | Before -> after |
|---|---|
| U1: dead Reminders switch | Removed the row and its backend mapping, not saved values; backend `eat_enabled` is only defined/defaulted/persisted and has no sender consumer. ([Backend preference persistence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/notifications.service.ts)) |
| U2: mislabeled destination | Widgets/customization wording -> Shortcuts/Opens quick actions; destination remains `Widgets`. ([Profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/ProfileScreen.tsx)) |
| U3: overstated Quick log description | Open the food log from anywhere -> Open the food log. ([Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/WidgetsScreen.tsx)) |
| U4–U6: raw fasting failure text | Fixed Start, End and Shortcuts Start bodies name the failed action and the next step. ([Fasting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/FastingScreen.tsx), [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/WidgetsScreen.tsx)) |

## Routes/actions before -> after

| Screen | Label/action before | Destination/effect after |
|---|---|---|
| [Notification preferences](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/settings/NotificationPreferencesScreen.tsx) | Back; Coach messages; Reminders; Workout reminders; Milestones; System; failed-save retry/support | Back unchanged; `message_push/inapp`, `workout_reminder_push/inapp`, `milestone_push/inapp`, `digest_email` unchanged; only the dead Reminders row removed under redo rules 1/2; retry/support unchanged; client-only workout-reminder role gate unchanged |
| [Profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/ProfileScreen.tsx) | Settings; My report; Widgets; Learn; Edit/every personal-info row; Sign out/Cancel | Same `Settings`, `Report`, `Widgets`, `Learn`, `EditProfile` routes and confirmed sign-out; visible and spoken Widgets label becomes Shortcuts |
| [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/WidgetsScreen.tsx) | Back; Quick log; Start fast; Cancel/Start confirmation | Same Back, `Log`, 16:8 start/end-alert scheduling and `Fast` navigation; failed start still leaves the action available |
| [Fasting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/FastingScreen.tsx) | Five protocol choices; Start; End; Keep going/End anyway; Remove/Cancel confirmation on running/history rows; Try again; pull refresh | Every handler and API call unchanged; only Start/End alert bodies changed |
| [Settings coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/settings/__tests__/SettingsScreen.parity.test.tsx) | Password/modal controls; appearance; haptics; biometrics; redo/sign-out confirmations; deletion; meal/water steppers; notification switches and details; privacy/sharing/blocked/data routes; Roman; support; tutorial | No Settings source change; all controls retained; additional proof that Summary emails reads/writes `digest_email`, not the legacy mirror |

## Truthful sweep

- No backend sender consumes the meal preference, so removing its switch is more truthful than relabeling it; storage remains compatible. ([Backend preference persistence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/notifications.service.ts))
- Keep Summary emails / Progress summaries sent to your email: the existing client weekly digest builds check-in, workout and weight summaries and sends them through the client template; `digest_email` gates recipients. The client daily digest is separately opt-in, and this copy makes no frequency promise. ([Digest service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/digest.service.ts), [Digest scheduler](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/digest.scheduler.ts))
- No invented widget customization, global food-log availability, raw error text, first-person copy, exclamation marks, emoji, new colours or layout changes. ([Profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/ProfileScreen.tsx), [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/WidgetsScreen.tsx), [Fasting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/FastingScreen.tsx))

## Acceptance evidence

Local failing-first proof used the new/changed assertions against unchanged source at `868a629c` before production edits; the eight failures covered the dead switch (3), Profile label (1), Shortcuts description/start error (2), and Fasting Start/End errors (2). The after-fix runs passed eleven focused tests in six files; logs are retained in the operator workspace. ([Category tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/settings/__tests__/PreferenceScreens.calm.test.tsx), [Profile tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/ProfileScreen.savedValues.test.tsx), [Shortcuts tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/WidgetsScreen.test.tsx), [Fasting tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/FastingScreen.remove.test.tsx))

- Existing Profile doctrine parity fixture updated to the truthful label. ([Doctrine route test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/__tests__/quietLuxuryDoctrine.test.ts))
- Summary copy and both digest toggle directions remain covered, including a mismatched legacy mirror. ([Settings parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/settings/__tests__/SettingsScreen.parity.test.tsx))
- Matching client, client/settings and settings READMEs updated in the same commit.
- Current PR: 170 changed lines (134 additions / 36 deletions); no dependencies, lockfiles, backend edits, migrations or production changes.

agent 131

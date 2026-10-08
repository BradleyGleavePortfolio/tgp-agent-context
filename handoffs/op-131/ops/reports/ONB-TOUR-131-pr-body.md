Tier: T2
Why: Roman's tour says untrue things to a client without a coach or a plan (FW-ONB-128 B2; JOBS131 ONB-TOUR-131). Every client sees Settings > "Take the tour again", even one who never took it. In the tour, Roman says "I work with your coach", sends a client with no coach to a coach thread, a coach's community, a coach's open times and a welcome call, and always ends with "Your plan is set, your numbers are set, and your coach has your message", whatever really happened.
T4 trigger scan: none. No auth, RLS/tenancy, PII, money, credentials or destructive data path. The only new input is `user.coach_id` from the existing user cache (Home, Community and HomeHeaderActions already read it). No backend change, no new request, no change to the saved tour format (`unavailable` already exists).
T3 trigger scan: customer-facing Roman copy (welcome and closing lines) and the Settings row label; no privacy, consent or money claim.
Bounded T1: NO (Roman copy).
Canonical builder: Claude Opus 5.5 (ONB-TOUR-131, agent 131)
Parent owner: operator agent 131
Acceptance evidence: new `src/tutorial/__tests__/tutorialTruth.test.tsx`, 14/14 on this branch. Failing-first: the same test against main 868a629c's six source files gives 12 of 14 failing. The 2 that pass cover coached behaviour this PR keeps: the community step still shows when a coach is linked, and the full closing line still appears when plan, numbers and message are all done. Changed suites pass locally: tutorialCopy 33/33, tutorialMachine 21/21, tutorialCalendarFlag 5/5, tutorialStore 13/13, TutorialOverlay 9/9. Targeted ESLint is clean. 492 changed lines.
Promotion triggers: any change that reads coach or consent data beyond `user.coach_id`, stores tour state on the server, or changes what a coach can see.

## What changes for coaches/clients
- Clients with no coach linked (no `coach_id`, so Home has no "Message your coach" row): Roman names no coach. The welcome reads: "Welcome, {name}. I am Roman. This takes a few minutes. I will show you where everything lives, and then you will log your first meal yourself." The five steps about a coach are skipped (recorded as `unavailable`, with no done line): Community (spaces live in the coach's workspace), Messaging your coach, Calendar (it explains the coach's open times), Message your coach, and the welcome call. The tour still covers the plan and daily numbers when they exist, wearables and health, and the first meal.
- Clients with a coach but no plan yet: the welcome says "to help you get the most from your training" instead of "your plan".
- Everyone: the closing line says only what this tour did. It says "Your plan is set" only if the plan step ended done, "your numbers are set" only if the macros step did, and "{coach} has your message" only if the first message was sent. If none of these happened: "That is everything, {name}. One thing at a time. Consistency matters more than perfection."
- Settings > Support: the row reads "Take the tour" until a tour has been completed on this phone, then "Take the tour again". The resume and in-progress states are unchanged.
- Coaches: nothing changes. Clients with a coach and a plan get the same tour, lines and order as before. No backend change.

## B/U list
- B2 (FW-ONB-128; found from the code, now reproduced by a test that fails on main): a client without a coach hears "I work with your coach" and "your coach has your message", and is asked to message a coach they do not have. Fixed with a 'coach' requirement on community, coach_messages, calendar, first_message and welcome_call, a welcome line without a coach, and a closing line built from the step outcomes.
  - B2 named three steps; two more also need the coach. Community and calendar name the coach too ("where the people training with your coach talk", "your coach's open times"), and both features belong to a coach: community spaces live in the coach's workspace, and the open times are the coach's.
- U (seen in a test that fails on main): Settings says "Take the tour again" to a client who never took it. Fixed: "Take the tour" until a tour is completed.
- U (seen in a test that fails on main): a coached client with no plan hears "help you get the most from your plan". Fixed: "your training".
- C (edge, deferred to 10k clients): a client who paused on the last gate of a coach step before this change stays on that step after resuming. C (edge): the progress count jumps over skipped steps (Step 3 of 10, then Step 7 of 10), as it already did for pending and unavailable steps. C: the `pendingLine` copy still names the coach, but the overlay never shows it (dead copy, left as is).

## Routes/actions before -> after
| label | before | after |
|---|---|---|
| Settings > Support tour row, never taken (`not_started`) | "Take the tour again" -> `startClientTutorial(null, { restart: true })`, then Home | "Take the tour" -> same action, same navigation |
| Settings tour row, completed | "Take the tour again" -> restart, then Home | unchanged |
| Settings tour row, paused | "Resume the tour" -> RESUME, then Home | unchanged |
| Settings tour row, active | "The tour is in progress" (disabled) | unchanged |
| Tour: Begin, Skip the tour, Take me there, Later, Book your welcome call, Done | unchanged handlers | unchanged. The coach steps, with their Take me there and Book your welcome call, appear only when a coach is linked |
| Home "Message your coach" row, Community tab, Calendar tab | unchanged (TutorialHomeSlot untouched) | unchanged |

Parity: no route, screen or handler is removed. `tutorialTruth.test.tsx` presses the real Settings row through not_started, active and completed, and checks the Home navigation. `SettingsScreen.parity.test.tsx` still covers the resume, "again" and in-progress variants, unchanged.

## Truthful sweep
- "Coach linked" means `user.coach_id` is set. Home's "Message your coach" row (`TutorialHomeSlot.tsx:27`) and the Community leaderboard (`CommunityTabScreen.tsx:47`) already use this signal. The onboarding complete call refuses a client without a coach (backend `src/onboarding/onboarding.service.ts:674-675`), so every consultation client has one. The coach in the saved onboarding payload is never treated as the link, so a payload stored on the phone cannot make Roman name a coach the client no longer has.
- The welcome without a coach names no coach and no plan. "You will log your first meal yourself" matches the one teach-back left (first_meal). With a coach, "two things" means the first meal and the first message.
- Each closing-line clause needs its step outcome to be `done`. A `pending`, `deferred` or `unavailable` outcome never adds a clause.
- "Take the tour again" shows only when `status === 'completed'`. Progress is stored per phone (README Known limits), so after a reinstall the row reads "Take the tour".
- Voice: the first person is Roman's own (the allowed exception). No exclamation marks, emoji, em dashes or contractions. The tutorialCopy voice suite runs over the new lines, and tutorialTruth checks every new variant. No colours or layout changed.
- README: `src/tutorial/README.md` (steps marked "coach linked", a new "Truthful tour" section, the tests line) and the `ClientTutorialSetting` paragraph in `src/screens/client/settings/README.md`.

Files: `src/tutorial/{tutorialSteps,tutorialMachine,tutorialStore,types}.ts`, `src/components/tutorial/TutorialHost.tsx` (passes `!!user.coach_id` to `hydrateTutorial`), `src/screens/client/settings/ClientTutorialSetting.tsx`, and tests. Not touched: `TutorialHomeSlot.tsx` (DES-K2 area) and `TutorialSettingsRow.tsx` (not rendered anywhere in the app).

agent 131

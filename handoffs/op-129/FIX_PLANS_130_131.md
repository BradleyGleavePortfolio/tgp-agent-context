# Fix plans for agents 130 and 131 (draft)

Operator agent 129, Wednesday 7 October 2026, 17:40 PDT. Draft only. It goes into the agent 130 handoff when the owner says "handoff", with group A and the counts refreshed then.

## The count: 92 PRs

| Group | What | PRs | Roman |
|---|---|---:|---:|
| A | Open PRs from tonight, still waiting at 17:30 (each one merged tonight comes off) | 14 | 3 |
| B | Built tonight, no PR yet: finish, open, review | 11 | 1 |
| C | New fixes for the bugs found today | 35 | 1 |
| D | Never started from agent 128's launch list (the leftovers of agents 122-128) | 32 | 4 |
| | Total | 92 | 9 |

Split:
- **Agent 130: 37 PRs. Make it safe for real clients.**
  - A: 14 open PRs.
  - B: 11 finishes.
  - C1: the 8 serious fixes.
  - D1: the Roman playbook gap and the 3 second halves.
- **Agent 131: 55 PRs. The smaller fixes and the rest.**
  - C2: 6 client fixes.
  - C3: 15 coach fixes.
  - C4: 6 team fixes.
  - D2: 28 never-started jobs.

Reviews are the limit. Every PR needs both reviewers at its exact head, so 92 PRs means about 184 reviews. Tonight the Sol reviewer was the bottleneck: eight PRs sat with an Opus approval waiting for Sol. Run more Sol reviewers than Opus reviewers.

Not counted:
- **Older PRs:** 25 open PRs from agents before 122. They include the Roman eval harness backend#605, importer and Scout candidates backend#574 to #594, older importer repairs backend#525 to #529, custom exercises backend#427 and #428 and mobile#264 and #265, mobile#302, and the backlog note backend#491. Several are over 5,000 lines. The source of truth calls the big ones "not launch work": split them into pieces of 1,500 lines or less if they are ever needed. Default: leave them parked until after launch.
- **Dependency bumps:** about 22 Dependabot PRs. Default: leave them until after launch.
- **Owner items and build tasks:** these have no PR. See the last section.

## Rules for every plan

- **Scope:** one agent, one PR, under 400 lines where possible. The target is under 800 and the hard limit is 1,500.
- **Process:** failing test first, then the fix. CI must be green, then the READY line.
- **Merge:** Claude Opus 5.5 and GPT-6.1 Sol both approve at the exact head. The operator merges with merge_if_dual.sh.
- **Copy:** no first person (Roman excepted), no exclamation marks, no emojis, no generic errors. Theme colours only.
- **"After X":** the plan shares a file with X. Start it only when X has merged.
- **Sources:** each plan names the report it came from: tgp-agent-context handoffs/op-129/reports/<ID>.md.
- **Grades:** "seen in a test" means a test reproduced it. "From the code" means read from the code only.

---

# Agent 130: 37 PRs

## A. Open PRs from tonight (14): review, fix, merge

Status at 17:30. Refresh at handoff and drop anything merged.

| PR | Job | What it fixes | Needs at 17:30 |
|---|---|---|---|
| mobile#532 | CF-COACH-BILLING-129 | Coach Billing & access screen crash | both reviews (top priority) |
| backend#864 | CF-NOTIF-DIGEST-128 | Digest emails show true numbers; daily digest off by default | both reviews |
| backend#863 | CF-COMM-SAFE-128 (backend) | Leaderboard names pass the community filter | Sol review |
| backend#862 | CF-COMM-BE-128 | Community posts and replies carry author first names and reactions | both reviews |
| backend#861 | ROMAN-GUARD-129 (Roman) | A correct figure no longer gets Roman's whole reply replaced | Sol review |
| backend#860 | CF-GUIDE-READ-128 | Clients can read their coach guidelines (every client gets an error today) | Sol review |
| backend#859 | CF-BODY-J2-128 | A client can edit or delete their own weigh-in | both reviews |
| backend#858 | CF-FOOD-UNDO-BE-128 | A client can delete their own water entry or fast | Sol review |
| backend#855 | FLIP-PB-128 (Roman) | Turns on Roman's coach playbook | merge main; only after PB-GAP-130 and mobile#513 |
| mobile#530 | CF-ONB-LEAN-128 | Lean onboarding answers stay honest; setup not repeated | CI fix (fix lane) |
| mobile#529 | CF-COMM-SAFE-128 (mobile) | Self-harm report shows 911 and 988 | Sol review |
| mobile#524 | CF-HOME-START-128 | Home "Start" opens the right workout | fix the Opus REQUEST CHANGES |
| mobile#513 | PB-POOL-A-128 (Roman) | Says that Roman learning a coach's method uses AI credits | fix the Sol REQUEST CHANGES |
| mobile#502 | DES-AW-127 | Calm, truthful invite and verification screens | Sol review |

## B. Built tonight, no PR yet (11): finish, open, READY

| Agent | Where the work is | What it fixes | Left to do |
|---|---|---|---|
| MONEY-PLANS-FIN-130 | mobile agent129/cf-money-plans-128 @ 331a3a58 (about 490 lines) | The refund line says "or through your coach", which no coach can do (B). A trial is shown when none is offered. Raw error text. A renewing plan is shown twice. | merge main, PR (T3) with a before/after table, CI, READY |
| MONEY-MEMBER-FIN-130 | mobile agent129/cf-money-member-128 @ f4d1d169 | Membership says "Active" just because a coach is linked, and a failed payment never shows (B) | PR (T3), CI, READY |
| SETTINGS-FIN-130 | mobile agent129/cf-settings-128 @ 658e5def | "Meal Reminders" and "Weekly Summary" do nothing. Also: turning Fasting alerts off must cancel the current fast's alert (SettingsScreen.tsx:336, cancelFastEndAlert). | three test updates, README row, merge main, PR, READY |
| COMM-THREAD-FIN-130 | mobile agent129/cf-comm-thread-128 @ d6e7900a (about 530 lines) | Community reactions never showed; posts have no author names or times | failing-first run, README, PR, READY; ship after backend#862 is deployed |
| LOGPLAN-FIN-130 | mobile agent129/cf-logplan-128 @ 74b605e1 | "Log this meal" straight from the meal plan | wire-in is unblocked now that mobile#490 merged; PR, READY |
| TRAIN-TAB-FIN-130 | patch only: handoffs/op-129/reports/CF-TRAIN-TAB-128.wip.patch (2 files) | Train tab shows true states, in the calm design | apply on a fresh branch from main, tests, PR |
| FAST-CALM-FIN-130 | patch only: handoffs/op-129/reports/CF-FAST-CALM-128.wip.patch (10 files) | Fasting screen redo; the fasting alert follows the setting; the water goal comes from the profile | after SETTINGS-FIN-130 (both touch useSettings.ts); apply on a fresh branch, tests, PR |
| SHARE-GATE-FIN-130 | backend agent129/cf-share-gate-128 @ dc75b0e5 (501 lines) | Nine coach screens ignore the client's sharing switches (B) | merge main, PR (T4), CI, READY. Three more reads only matter if their screens ship: coach-home.service.ts:190-195, v1-coach.service.ts:144-155, command-center.controller.ts:237. |
| ALLERGY-FIN-130 | backend agent129/cf-allergy-128 @ be06333c (has a migration) | Real allergy filtering (safety) | PR (T4); deploy with migrations=apply-migrations |
| COACH-PAY-BE-FIN-130 | backend agent129/cf-coach-pay-be-128 @ 001f6b21 (behind a flag) | Coach refunds, pause and cancel recurring payments | PR (T4); the flag stays off until COACH-PAY-M-130 ships |
| ROMAN-COPY-B-FIN-130 (Roman) | backend agent129/cf-roman-copy-b-128 @ f772b8d7 | The 911 reply assumes a coach. It names a "Today tab" that does not exist. Blocked eating-disorder messages get an error instead of the crisis reply. | PR (T4), CI, READY |

## C1. Serious fixes (8): new

### 1. SESSION-KEEP-130
Claude Opus 5.5, T4, mobile, about 80 lines. Source: EXPLORE-CLIENT-129.
- **Bug (seen in a test):** if the signal drops while the app renews sign-in, the client is signed out, and any unsynced workout and offline meals are deleted. The Sign Out button deletes them too, with no warning.
- **Fix:** a network failure during renewal never signs the client out; only an invalid sign-in does. Before any sign-out, try one sync of the food queue and the workout. If anything is still unsynced, the confirm says what will be removed, for example "2 workouts and 1 meal have not synced yet and will be removed from this phone".
- **Files:** src/services/api.ts (performRefresh, handleRefreshFailure), src/services/authActions.ts (signOut), src/screens/client/SettingsScreen.tsx and ProfileScreen.tsx (confirm copy only), and two tests.
- **Test first:** the explorer's two throwaway tests (offline renewal keeps the session; sign-out with queued rows tries a sync first).

### 2. FOOD-GATE-RETRY-130
Claude Opus 5.5, T4, mobile, about 120 lines. Source: AUD-FIN-FOOD-129.
- **Bug (seen in a test):** on weak signal, a paying client's first access check fails. Food then shows "Choose a Plan" or "Your coach manages your access", with no retry.
- **Fix:** when access can't be checked and nothing is confirmed, show "Your access could not be checked. Check the connection, then try again." with a Try again button that calls refreshEntitlement. The gate stays closed. Also make the coachless Food gate copy promise only what exists.
- **Files:** src/entitlements/EntitlementProvider.tsx, ProtectedScreen.tsx, PaywallSheet.tsx (COACHLESS_* only), and a new src/__tests__/foodGateRetry.test.tsx.

### 3. MONEY-INBOX-130
Claude Opus 5.5, T2, mobile, about 80 lines. Source: AUD-FIN-MONEY-129.
- **Bugs:**
  - "New content unlocked" opens "No content is listed for this purchase." Seen in a test.
  - The day 3 and day 7 lockout warning never pops up.
  - Every money notification is titled "Update".
  - Tapping the failed-payment push opens nothing.
- **Fix:**
  - normalizeNotification passes purchaseId (from payload.client_purchase_id) for drip_released.
  - Each kind gets a real title.
  - dunning_blocker opens UpdateCard, with the payload headline as its title.
  - Add an UpdateCard push route.
- **Files:** src/services/notificationsApi.ts, one line in src/services/pushTapRouter.ts (CF-NOTIF-FG-131 must not also edit that line), and a new src/__tests__/moneyInboxRows.test.tsx.

### 4. MONEY-DUNNING-COPY-130
Claude Opus 5.5, T3, backend, about 80 lines. Source: AUD-FIN-MONEY-129. Needs the owner's yes, because this copy is marked locked.
- **Bug (from the code):** failed-payment pushes say "I will try again tomorrow. You need do nothing". Stripe does not retry lost or stolen cards or 3-D Secure declines, and the copy is first person.
- **Fix:** day 0, 1 and 3 push lines that are true for every decline, with no unnamed "I". The push data carries { kind, actionScreen: 'UpdateCard' }.
- **Files:** src/checkout/dunning-v2/dunning-v2.copy.ts (lines 51-79; update ROMAN_STEMS and the specs that pin these strings) and dunning-v2.dispatcher.ts:220. Commit with LEFTHOOK=0.

### 5. COACH-AI-GATE-130
Claude Opus 5.5, T4, backend, under 400 lines. Source: AUD-FIN-COACH-129.
- **Bug (seen in backend tests):** a client who turns sharing off still appears in the coach's daily brief ("Weight change of 4.6 lbs needs review"). Weekly insight and AI workout and meal-plan drafts still use their weights, mood, sleep and check-in notes. No one is exposed yet, because no briefs or drafts exist in production.
- **Fix:** gate every read with ConsentService.coachCanAccess (import only). If they fit, also gate Roman adjustment proposals, which use workout effort ratings, and the churn AI draft, which uses check-ins.
- **Files:** src/coach/brief/coach-brief.service.ts, src/ai/coach/coach-ai.service.ts (and coach-ai.module.ts if the import is needed), src/roman-adjust/roman-adjust.service.ts, src/coach/command-center/churn-intervention.service.ts, and a new test/coach-ai-sharing-gate.spec.ts.
- **Test first:** the auditor's two throwaway specs.

### 6. COACH-ROW-SCRUB-130
Claude Opus 5.5, T4, backend, about 50 lines. Source: AUD-FIN-FOOD-129. Runs after SHARE-GATE-FIN-130 (same file, different functions).
- **Bug (from the code):** opening a client's food log review, and archiving or unarchiving a client, sends that client's phone push address to the coach's app.
- **Fix:** return only { id, name, archived_at } for the client. A spec checks that the push token, hash and supabase_id are absent.
- **Files:** src/coach/coach.service.ts (getClientTimeline, archiveClient and unarchiveClient only) and a new test/coach-client-row-redaction.spec.ts.

### 7. COACH-ROMAN-SURFACE-130 (Roman)
Claude Opus 5.5, T3, backend prompt, about 25 lines. Source: AUD-COACH-WEEK1-129.
- **Bug (from the code):** coach Roman promises "a client read" but receives no client data, and no rule stops it making numbers up. The auditor says this could be graded U.
- **Fix (default):** reword the coach framing line to what coach Roman really does, and add the rule "never state a number you were not given", with a prompt version bump. Building a real client read is a larger T4 job, only if the owner asks.
- **Files:** src/roman/roman.prompts.ts (surfaceFraming 'coach') and its prompt spec (one case).

### 8. HEALTH-STRINGS-130
GPT-6.1 Sol, T1, mobile, about 10 lines. Source: STORE-AUD-129. Done tonight if the owner says yes, otherwise first in the next build.
- **Bug:** one Apple Health message says the app may write workouts to Apple Health, but it never does (healthKitClient.ts:317-320 requests no write access). The other names only the coach, but Roman also reads daily summaries when the AI permission is on.
- **Fix:** the read message names the coach and Roman. The write message is removed or made true.
- **Files:** app.json:29-30 (NSHealthShareUsageDescription, NSHealthUpdateUsageDescription) and app.json:195-196 (the react-native-health plugin strings). The change only reaches people in a new build.

## D1. Roman playbook and second halves (4)

| Agent | What | When |
|---|---|---|
| PB-GAP-130 (Roman) | At most one playbook rebuild per coach every 6 hours (JOBS129 entry PB-GAP-129) | first. Then merge mobile#513 and backend#855, then set FEATURE_ROMAN_PLAYBOOK in fly-env-desired-state.json |
| ALLERGY-M-130 | Mobile half of real allergy filtering | after ALLERGY-FIN-130 is deployed |
| FOOD-UNDO-M-130 | Delete buttons for water entries and fasts | after backend#858 is deployed |
| COACH-PAY-M-130 | The coach payments screen: refunds, pause, cancel | after COACH-PAY-BE-FIN-130 is deployed |

---

# Agent 131: 55 PRs

## C2. Smaller fixes, clients (6): new

| Agent | Model, size | What is wrong | Fix and files |
|---|---|---|---|
| WORKOUT-CLAMP-131 | Sol, T2 backend, about 30 | A workout resumed more than 24 hours after it started can never be saved. Offline it says "Saved on this phone", then disappears. | src/workout/workout.dto.ts: a @Transform caps duration_minutes at 1440 (keep @Min(0)), plus one spec. This also rescues rows already queued on phones. |
| WORKOUT-RESUME-131 | Opus, T3 mobile, about 80 | Resuming a stale session counts the duration up to "now". If the phone closes the app in the background, the next workout opened can show the old empty one under its name. | src/screens/client/ActiveWorkoutScreen.tsx (around :323-334): base the duration on the session's last update; clear the old session before opening the next. Tests. |
| HOME-FOOD-STORE-131 | Sol, T1 mobile, about 40 | Home can show another day's meals under today's date. A failed metric water add shows "8.453510744416454 oz". | src/store/clientStore.ts (loadDayData only; Math.round at :213), plus a test |
| HOME-FOOD-UI-131 | Sol, T1 mobile, about 90; after mobile#524 | Home shows water in ounces for kilogram users and 0 intake before the day loads. A client without a plan is told to check the connection, and the main button opens the lock screen. Home shows the long water decimal. | src/screens/client/HomeScreen.tsx (:229 rounding), plus a test |
| SESSION-REMINDER-COPY-131 | Sol, T1 backend, about 30 | The 24-hour reminder says "Session tomorrow" on the day itself. The copy promises "Your coach will add the call link" even when there is none. | src/notifications/emitters/booking.emitter.ts (reminder() title and the no-link line only), plus the matching specs |
| HABIT-ADD-GUARD-131 | Sol, T1 mobile, about 15 | A fast double tap on Add habit creates the same habit twice | AddHabitSheet.tsx:82-83: disable Add while saving, plus a test |

## C3. Smaller fixes, coaches (15): new

| Agent | Model, size | What is wrong | Fix and files |
|---|---|---|---|
| COACH-WEEKLY-131 | Sol, T1 mobile, about 140 | The Weekly tab shows no training volume while Workouts shows 3,375 lb. Weekly calories ignore servings; protein always reads 0 g. Summary shows 0 calories for "today" every evening after 5 pm Pacific. Food log review shows raw labels. Units mix "lbs" and "lb". | useClientDetailData.ts (loadWeeklySummaries, loadSummary; :290-299 quantity_multiplier), WeeklySummaryTab.tsx, WorkoutsTab.tsx (labels), FoodLogReviewSection.tsx, api.ts (coachApi.getClientSummary only), a new test |
| COACH-TIMELINE-STATES-131 | Sol, T1 mobile, about 120; after COACH-WEEKLY-131 | Offline, a client's Timeline and Weekly tabs say "No activity" or "No data" instead of "could not load" | useClientDetailData.ts (loadTimeline, loadWeeklySummaries), TimelineTab.tsx, WeeklySummaryTab.tsx, ClientDetailScreen.tsx (2 props): an error state with Try again |
| CLIENT-ARCHIVE-COPY-131 | Sol, T1 mobile, about 40; after COACH-TIMELINE-STATES-131 | Archiving a client leaves their plan charging, with no warning | ClientDetailScreen.tsx (handleToggleArchive copy only): the confirm says payments continue and who can end them |
| QA-COACH-HOME-131 | Opus, T1 mobile | On coach Home, the setup checklist and Money card disappear while numbers load or fail, and those are the only links to Stripe setup and Money. Gold numbers fail contrast. The top tabs are small. | command-center OverviewScreen, AtRiskScreen, WinStreaksScreen, InboxScreen, ActionQueueScreen, CommandCenterScreen, KpiTile.tsx, TeamManagementScreen.tsx |
| QA-COACH-STATES-131 | Opus, T1 mobile | Five different loading looks and nine error looks across coach screens | CoachBookingInboxScreen, CoachInvitesScreen, PendingAiDraftsScreen, RiskBoardScreen, programs/ProgramUi.tsx (FailureBox, LoadingRow): one calm error with a "Try again" text button, and one loading look |
| QA-EMPTY-131 | Opus, T1 mobile | Shared empty states use square 12 pt buttons and a system-font title | ui/empty-states/EmptyState.tsx, components/EmptyState.tsx, EmptyStateNoClients.tsx, CheckoutReturnScreen.tsx and PurchaseUnpackScreen.tsx (style only): 44 pt buttons, sentence case, brand font |
| COACH-SETTINGS-131 | Opus, T3 mobile, about 120 | "Active Clients" reads 0 while loading and stays 0 if the load fails. The notification preferences link is wrong. Coaches can't see their AI-credit balance or a low-credit warning. | src/screens/coach/SettingsScreen.tsx: show "—" until loaded and on failure; fix the route; add an AI credits row (useAIBudget) and the Roman sub-label. New tests. |
| PACKAGE-ARCHIVE-COPY-131 | Sol, T1 mobile, about 50 | The archive alert names a "Take off sale" button that doesn't exist. Archiving a package with clients tells the coach to cancel subscriptions, which the app can't do. The editor's "Open billing" button still opens the hidden billing screen. | CoachPackageEditScreen.tsx (alert copy at :502; map PACKAGE_HAS_ACTIVE_SUBSCRIBERS in the archive catch; remove or reroute "Open billing"), plus one test |
| AI-DRAFT-KEEP-131 | Sol, T1 mobile, about 80 | Edits to an AI workout draft are lost on Back. The footer shows the model name, tokens and dollar cost. | AIWorkoutDraftScreen.tsx: a "Discard edits?" guard, remove the footer, reword the reject prompt. Test. |
| BROADCAST-KEEP-131 | Sol, T1 mobile, about 60 | Broadcast text is lost on Back or close | broadcasts/BroadcastComposerScreen.tsx: a leave guard when the text isn't empty. Test. |
| MEAL-TEMPLATES-ROUTE-131 | Sol, T1 mobile, about 20 | The Meal templates screen exists but nothing opens it | Default: delete the orphan route and keep the API (CoachMealTemplatesScreen.tsx) |
| TEAMPROFILE-131 | Sol, T1 mobile, about 100 | The Team / Gym profile page shows "Network Error Tap to retry." offline. A business name over 120 characters fails with "Bad Request". Invite codes sends coaches to another tab. "Team" wording promises a feature hidden for launch. | src/api/coachTeamApi.ts (message = errorMessage(err)), CoachTeamProfileScreen.tsx (maxLength 120, offline copy), settings/BillingSection.tsx (rows; mobile#532 edited this file, so it must merge first), one test |
| ONB-N2-COPY-131 | Sol, T1 mobile, about 15 | A consultation answer promises food filtering that doesn't exist yet. Nobody reaches the consultation today. | src/lib/consultation/definitions.ts:441: "So your coach knows what you avoid." plus one test. Before the consultation is switched on. |
| PACKAGE-SHARE-BE-131 | Opus, T3 backend | The app never creates a package share link, and the link would open a 404 | Create the link on publish, with a landing page that resolves. Default: after the iOS submission (needs the web storefront). |
| PACKAGE-SHARE-M-131 | Sol, T2 mobile; after PACKAGE-SHARE-BE-131 | "Share link" never appears for coaches | Show the link and share sheet once the backend makes it |

## C4. Team feature (6): before teams are switched on

Teams are hidden for launch, so no one can reach these today. Two auditors proposed overlapping jobs (AUD-ORG-129 and EXPLORE-SUBCOACH-129); each plan below merges both.

| Agent | Model, size | What is wrong | Fix and files |
|---|---|---|---|
| TEAM-ROUTES-MODEL-131 | Opus, T4 backend, about 300 | Two team models disagree, and duplicate routes answer the same paths | One handler per /sub-coaches path. Retire the duplicate controller. One team model (default: overlay; the client stays the head coach's). Accepting an invite writes membership. src/sub-coach/*, src/sub-coaches/sub-coaches.controller.ts, app.module.ts, test/sub-coach-routes.spec.ts |
| TEAM-REVOKE-SCOPE-131 | Opus, T4 backend, about 350; after TEAM-ROUTES-MODEL-131 | Removing a sub-coach moves their own clients to the head coach. A sub-coach sees no logs for clients assigned to them. | Removal keeps a coach's own clients (owner default), ends assignments, and grants consent on assignment. sub-coach-invite.service.ts (accept, revoke), sub-coaches.service.ts, specs |
| TEAM-UI-131 | Sol, T2 mobile, about 250; after TEAM-ROUTES-MODEL-131 | The Team tab always says "Scale plan required". Reassigning a client fails. Revoke copy is wrong. | TeamManagementScreen.tsx (drop the tier gate), src/api/subCoachApi.ts, ClientReassignModal.tsx (head coach option, errors), SubCoachDetailScreen.tsx, a test |
| TEAM-INVITE-BE-131 | Opus, T3 backend, about 120 | The invite says "was emailed" but nothing is sent, and the link opens nothing | invite-landing.controller.ts GET join/sub-coach/:token, and a mailer (or change the copy to "share this link") |
| TEAM-INVITE-M-131 | Opus, T3 mobile, about 300; after TEAM-INVITE-BE-131 | Same: the invite link opens no screen | A new accept screen, RootNavigator.tsx linking and guard, pendingInviteCode.ts, SubCoachInviteModal.tsx:206 copy |
| TEAM-PHANTOM-131 | Opus, T3 backend, about 60 | A client promoted to coach keeps a phantom coach link | admin.service.ts setRole (clear coach_id on promotion), auth.service.ts becomeCoach, the two specs. Check for open auth.service.ts PRs first. |

## D2. Never started from agent 128's list (28)

Each has an entry already: CLIENTFIX-128 rows in JOBS128.md, the rest in JOBS128.md or JOBS129.md. Agent names take the 131 suffix.

| Agent | What it fixes |
|---|---|
| CF-REMIND-COPY-131 | Honest workout reminder copy (backend, workout-reminder.policy.ts) |
| CF-BODY-J4-131 | Report screen dates and states |
| CF-INVITE-131 | A pending coach invite refreshes |
| CF-CONTACT-131 | Honest change-coach support copy |
| CF-CHECKIN-131 | A check-in without a package is explained, not silently refused |
| CF-SHARE-UI-131 | Sharing screen states |
| CF-TRUST-131 | Trust and Privacy copy |
| CF-DATA-COPY-131 | Data export, delete account and blocked users copy |
| CF-HELP-131 | Change email through a prefilled support email row |
| CF-COMM-SPACE-131 | Community spaces states |
| CF-COMM-WINS-131 | Wins screen redo and an honest privacy line |
| CF-NOTIF-FG-131 | In-app banner for pushes while the app is open (the pushTapRouter.ts UpdateCard line belongs to MONEY-INBOX-130) |
| CF-ONB-TOUR-131 (Roman) | Roman's tour says only true things |
| CF-ONB-WIN-131 | First-day win |
| CF-ONB-NUDGE-131 | Onboarding nudges |
| CF-ROMAN-COPY-M-131 (Roman) | Roman app copy |
| CF-MEAL-IMAGES-131 | No missing meal images; calm placeholder |
| CF-QA-THEME-131 | One hairline colour and one overline size across the app |
| DES-AQ-131 | Community messages screen |
| DES-AZ-131 | Devices screen |
| DES-P-131 | Progress, the full picture |
| QA-PRIM-131 | Wave 2 design QA (JOBS129 Wave 2) |
| QA-LIVE-131 | Wave 2 design QA of the live workout (mobile#521 has merged) |
| QA-SETTINGS-131 | Wave 2 design QA of Settings (after SETTINGS-FIN-130) |
| QA-HABITS-CAL-COMM-131 | Wave 2 design QA of habits, calendar and community |
| QA-ROMAN-PROFILE-131 (Roman) | Wave 2 design QA of Roman and Profile |
| QA-COACH-131 | Wave 2 design QA of coach screens (file-disjoint from QA-COACH-HOME, QA-COACH-STATES and QA-EMPTY) |
| QA-SHEETS-131 | Wave 2 design QA of sheets |

---

## Owner items (no PR)

1. **Supabase sign-in:** turn on Apple (Client ID com.growthproject.app) and add Redirect URLs tgp://auth/callback, tgp://verified and tgp://reset-password. This fixes Apple and Google sign-in.
2. **App Store Connect:**
   - Fill in the privacy labels from the table in STORE-AUD-129.
   - Review notes: the tabs are "You" and "Food". Roman and AI is under Settings > Roman. Coach deletion is under Settings > Privacy & Data. Include the demo accounts.
   - The description says training, food logging, Calendar and Community need an active coaching plan.
   - Support URL: https://app.trygrowthproject.com/help.
   - Upload only the 10 listed screenshots per size.
3. **Tester accounts:** a coach, and a client of that coach with an active package, one meal plan and one workout.
4. **Featured coach (optional):** set one up, so a client without a coach sees more than "Enter a coach code".
5. **Checks after the build:** confirm the first push on a real device (none has ever been delivered in production), and check Roman memory with the tester client (FEATURE_ROMAN_MEMORY has been on since 15:57).

## Decisions inside these plans (each with its default)

1. **Payment push copy:** the failed-payment push copy is marked locked; MONEY-DUNNING-COPY-130 may change it. Default: yes.
2. **Coach Roman:** reword its promise rather than build a client read. Default: reword.
3. **Meal templates:** delete the orphan screen. Default: delete.
4. **Package share link:** build it after the iOS submission. Default: after.
5. **Teams:** when a coach who brought their own clients leaves a team, the clients stay with them. Default: yes.
6. **Older PRs and dependency bumps:** park them until after launch. Default: park.

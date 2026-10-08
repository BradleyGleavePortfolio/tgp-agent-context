# V11_ROMAN_PLAN_132: Roman v1.1, reworked for the owner's 13:45 addendum (V11-ROMAN-PLAN-132, agent 132, 2026-10-08, PDT)

Rework of /home/user/workspace/ops/V11_PLAN_132.md (ROMAN-V11-PLAN-132, finished 13:33). Read-only: no branches, PRs, comments or
GitHub writes; read-only `gh pr view` for open-PR file lists only. Every "from the code" fact is at backend main
cd0f90ed823d43dc8a9f0937554dc59fce7b6b94 (fetched 13:47, unchanged) and mobile main a3a1c18e6a551b292b2eb6180e4b80c78e289d25
(fetched 13:47; read with `git show origin/main:<path>`). Every change to the earlier plan is marked **[CHANGE Cn]** and listed in A3.

## 0. One screen, plain words

- **What exists.** Roman remembers each client (notes from chats), follows the client's own coach's method (the playbook), reads the
  client's real logs with tools, and checks every number he says against those logs. All of it is on in production
  (FEATURE_ROMAN_MEMORY, _PLAYBOOK, _TOOLS). Clients reach Roman in one tap from Home (the Roman face in the header); coaches from
  Settings. Coach-run challenges and leaderboards exist on the server and as client screens, but they are switched off everywhere and
  a coach has no way in the app to create a challenge.
- **What is missing to finish Roman v1.1 (owner 12:52 "finish it").** Roman cannot yet do things (log water or food on the client's tap,
  draft a note to the coach), cannot take a meal photo or a lab file, never speaks first (no morning brief, no check-ins), does not
  spot patterns in a client's own data, and the client cannot see "what Roman saw" (built on the server, no screen).
- **The plan (PART A).** The same 10 PRs as before, with 7 marked changes (C1-C7) (where each piece lives in the app, the design rules each PR
  follows, Roman's first messages also waiting in the bell, Roman never mentioning a challenge the client cannot open), plus 4 marked
  additions (C8, C9): PR 11 challenge progress counted from what clients already log, PR 12 coaches create and run challenges from the Clients
  tab, PR 13-14 a read-only "What Roman saw" screen. 14 PRs, 5 waves, 4 new off switches from PR 1 (plus REDLINE and SUMMARIES for
  later), none on until both lenses and the owner say yes.
- **Why this beats the best rivals (A2).** WHOOP and Oura have memory and first messages, Fitbit an Ask Coach button and generated plans, but none has a human coach; Trainerize and
  Everfit have AI for the coach's admin but little for the client between sessions, and Trainerize charges from $150 a month with a
  25-client minimum for it. Roman is the client's own coach's method, awake between sessions, honest with numbers, acting only on the
  client's tap, quiet by design, and included for a coach with five clients.
- **Owner decisions.** D1-D10 kept (D9 amended), new D11 (switch challenges on for the first coaches), D12 (which metrics count
  themselves), D13 ("What Roman saw" in v1.1). No cash anywhere in PART A.
- **PART B.** Seven optional pitches (session prep, week in review, the coach teaches Roman, the coach's cue in the workout, "Ask Roman
  about this", threshold challenges, Roman on the landing page). None is in PART A.

# PART A: the owner's idea exactly as stated

Owner 12:52: "roman intelligence increase is largely built - finish it". Owner 13:20: best features for the first 5 coaches and their
clients. Owner 13:21: leaderboards and coach-run challenges are in scope. Plan of record: SoT A7.2 (TGP_SOURCE_OF_TRUTH.md:1434-1615).

## A1. Inventory (re-checked; the full table of V11_PLAN_132.md section 1, rows A1-S5 and X1-X3, stands unchanged)

Re-check at the new heads: backend main did not move. Mobile main moved 14faa32f -> a3a1c18e (m#569, m#570, m#571, m#572, m#574);
`git diff --stat 14faa32f origin/main` touches no file under src/screens/roman, src/components/roman, src/api/romanApi.ts or
package.json; expo-image-picker is still absent; CLINIC-APK-132 (m#572) merged at 13:46. New rows from this rework (from the code):

| # | Item | Status | Where |
|---|---|---|---|
| X4 | Roman's pathways today | built and on | Client: Home header Roman face -> MoreTab / RomanChat (src/components/home/HomeHeaderActions.tsx:114-116, 1 tap); More > Roman row (src/screens/client/MoreScreen.tsx:207-218, 2 taps); More > Settings > Roman AI (RomanAiConsentScreen, 3 taps). Coach: Settings tab > Roman (src/screens/coach/SettingsScreen.tsx:710) and Roman conversations (:757). `romanChat` is on in the production and clinic profiles (eas.json:47, :73) |
| X5 | Coach-run challenges | built but off, and unreachable | Server: create, edit, archive for coaches (src/community/challenges/community-challenges.controller.ts:53, :73, :93); the coach's community space is made on first read (src/community/community.repository.ts:49). Off: FEATURE_COMMUNITY_CHALLENGES "unset" (.github/fly-env-desired-state.json:28). Mobile: CommunityChallenges and CommunityChallengeDetail are registered only behind `communityChallenges` (src/navigation/CommunityNavigator.tsx:88-99), which no eas.json profile sets (featureFlags.ts:318 default false). No create call in src/api/communityChallengesApi.ts (list, get, join, updateProgress, leaderboard opt-in, leaderboard, comments only) and the coach Community tab sits behind `coachCommunity` (featureFlags.ts:222, off). Progress is typed in by the client (the server keeps the higher value, community-challenges.service.ts:430); metric_key is free text (community-challenges.dto.ts:85) |
| X6 | Roster leaderboard | built, reachable | Community tab header "Leaderboard" link, only with a coach (src/screens/community/CommunityTabScreen.tsx:116-125); server LEADERBOARD_ENABLED "not in clinic scope" (desired state :183). Not needed for the owner's 13:21 note: each challenge has its own opt-in board |
| X7 | "What Roman saw" | built on the server, no screen | GET /roman/context/me (src/roman/context/roman-context.controller.ts:44), no mobile caller. Owner 10:44: read-only; clients do not remove single items; deleting the account erases notes and summaries (SoT:1471-1486, :1566) |
| X8 | Bell and push reuse | built | The nudge engine writes an in-app row with NotificationsService.createNotification and then sends pushToUser (src/notifications/nudges/nudge-engine.service.ts:393-420; at most 1 push per user per kind per 60 s). Bell rows route through routeInAppNotification (src/screens/notifications/NotificationCenterScreen.tsx:38 -> src/services/pushTapRouter.ts), the same file push taps use |

Open PRs (board 13:44 and `gh pr view --json files`): only b#885 (SMALL-BE-COPY-132) touches Roman files
(src/roman/guardrails/roman-post-check.ts, safety-router.ts, src/roman/voice/*). None of the 14 PRs edits those files; b#884
(FLAG-TOOL-132) holds .github/fly-env-desired-state.json, which PR 1 waits for (unchanged).

## A2. TGP's proposition, the rivals, and how Roman makes TGP superior (addendum C and D)

SoT A7.5 (TGP_SOURCE_OF_TRUTH.md:1674-1700): "the fitness platform for the new Post-AI world"; "AI-native, not AI-added: Roman is the
butler and friend between sessions for every client of every coach; AI drafts give one coach the leverage of a team". The coach's brand
is the product; TGP is the engine.

| Rival | What it does well | Where it falls short | How Roman is superior, not a prettier copy |
|---|---|---|---|
| WHOOP Coach | Memory the member can view, edit and delete; proactive check-ins; a Daily Outlook each morning; "When nothing warrants action, WHOOP stays quiet" ([WHOOP AI guidance](https://www.whoop.com/us/en/thelocker/new-ai-guidance-from-whoop/), [My Memory](https://www.whoop.com/us/en/thelocker/my-memory-whoop/)) | No human coach: the method is WHOOP's, and guidance comes from biometrics, not from a program someone wrote for you | Roman speaks in the client's own coach's method (playbook, on) and hands every judgment call to that coach (drafts, Ask your coach). Same quiet rule: no brief on a day with nothing useful (D2) |
| Oura Advisor | Memories the member can view or delete, trend detection, tone choice; 60 percent of beta users came back several times a week ([Oura launch](https://www.silicon.co.uk/press-release/oura-advisor-an-ai-powered-personal-health-companion-now-rolling-out-to-all-oura-members), [Oura support](https://support.ouraring.com/hc/en-us/articles/39512345699219-Oura-Advisor)) | Ring data only; at launch it read only the past seven days of metrics ([Android Authority](https://www.androidauthority.com/oura-advisor-hands-on-3472107/)); no coach | Patterns over the client's own 90 days with sample-size guards (PR 7: n of at least 8 each side) across training, food, sleep and check-ins, and a coach behind every answer |
| Fitbit personal health coach (Gemini) | Setup conversation, adaptive multi-week plans, an "Ask Coach" button anywhere ([Google](https://blog.google/products-and-platforms/devices/fitbit/personal-health-coach-public-preview/)) | The preview launched without nutrition and water logging and without leaderboards ([PhoneArena](https://www.phonearena.com/news/fitbit-is-launching-a-brand-new-experience-for-those-who-want-more-from-a-fitness-tracker-app_id175097)); plans are generated, not coached | The coach writes the plan; Roman logs food and water on a tap (PR 3-4); challenges are the coach's own (PR 11-12) |
| Apple Workout Buddy | Spoken, personal motivation in the workout from your history and milestones ([Apple](https://www.apple.com/newsroom/2025/06/watchos-26-delivers-more-personalized-ways-to-stay-active-and-connected/)) | Needs an Apple Intelligence iPhone and headphones ([Apple Support](https://support.apple.com/en-gb/guide/watch/apd65c7938e6/watchos)); cheerleading, not a coach's cue | Roman gives facts in the coach's method and never cheers (doctrine section 4); a workout cue is PART B B4 |
| Strava Athlete Intelligence | Instant summaries after each activity, with guardrails, on Claude Haiku ([AWS case study](https://aws.amazon.com/solutions/case-studies/strava-case-study/)) | A celebration register ("AI's got the celebration ready", [Strava](https://stories.strava.com/articles/meet-athlete-intelligence-personalized-ai-insights-that-help-you-reach-your)); one activity at a time | Calm facts with numbers and dates (doctrine sections 3-4) and links across domains (sleep to the next day's session, PR 7) |
| ABC Trainerize + FitMetrics | AI workout builder; AI-drafted check-ins the coach reviews; meal-photo macros; leaderboard and threshold challenges ([FitMetrics](https://www.trainerize.com/features/fitmetrics/), [pricing](https://www.trainerize.com/pricing/)) | FitMetrics starts at $150 a month with a 25-client minimum and adds capability "only on the coach's side" (same FitMetrics page): not for a coach with five clients, nothing for the client between sessions | Roman is client-side and included from a coach's first client; the head coach's AI pool and the $10 a day ceiling hold the cost (D4) |
| Everfit | Olly assistant, Smart Response drafts in the coach's tone, Macrosnap meal scan, an AI push-up challenge that counts reps into a live leaderboard ([Everfit AI suite](https://everfit.io/ai-suite/), [March 2026 release](https://blog.everfit.io/march-2026-everfit-new-features)) | AI for coach productivity; the automatic challenge counts only push-ups on camera | Roman acts for the client in the coach's method; PR 11 counts challenge progress from anything the client already logs (workouts, steps, water, protein, check-ins) |
| Future | A human coach texts daily, adjusts the plan, follows up on missed sessions ([BarBend](https://barbend.com/future-app-review/)) | $149-199 a month, asynchronous, the coach may sit in another time zone ([SELF](https://www.self.com/story/future-fit-app-review)) | A coach with five clients gives Future-level daily touch at their own price: Roman answers at 2 am in the coach's method, the coach keeps the relationship |
| MacroFactor | Photo and "Describe" logging that maps to real database foods on an editable plate ([MacroFactor AI](https://macrofactor.com/ai-food-logging/), [logging guide](https://help.macrofactorapp.com/en/articles/215-how-to-log-food-in-macrofactor)) | No coach; the log stays with the user | PR 3 and 5 meet the same rule (numbers from the food database, never the model) and the log lands in the coach's view |
| Headspace Ebb (outside fitness) | Companion with memory; a safety classifier on every message; LLM-as-judge evaluations; "not a replacement for human care" ([Headspace AI principles](https://www.headspace.com/ai)) | No human in the day-to-day loop | Roman's safety router runs on every path, outreach included, and "Ask your coach" routes to a real person (PR 3, 5, 6) |

The superiority thesis, five lines:
1. **Coach-anchored.** No wearable AI has the client's human coach behind it; no coaching platform has a client-side companion that speaks in
   that coach's method. Roman is both (playbook built and on).
2. **Honest by construction.** Every number is checked against the client's own data (answer contract, built and on); food numbers come
   from the database; patterns need n of at least 8 each side; challenge numbers are counted, not typed (PR 11).
3. **Hands, on the client's tap only.** Confirm cards log for the client; drafts to the coach are sent only by the client (PR 3-4, D5).
4. **Quiet.** At most 1 brief and 2 check-ins a day, never in quiet hours, nothing on a sensitive signal, nothing when nothing is useful;
   no confetti, badges or hype (Quiet Luxury Doctrine sections 3-4).
5. **Small-coach economics.** Included from the first client, no add-on, no client minimum; background work runs on the head coach's pool
   within the existing daily ceiling.

## A3. Changes to the earlier plan (each marked in A4-A8)

| Change | What | Why (addendum part) | Touches |
|---|---|---|---|
| C1 | Roman's first messages also write an in-app row in the bell (NotificationsService.createNotification), then push when allowed | A: a client with push off must still find them, 1 tap from Home (X8) | PR 6 |
| C2 | The bell row and the push tap route through the one router edit already planned | A: two pathways, one file | PR 10 |
| C3 | challenge_progress is empty unless community challenges are on (resolveChallengesFlag) | A and redo rule 1: Roman never mentions a challenge the client cannot open (X5) | PR 2 |
| C4 | Challenge moments only from challenge_progress; a rank only for opted-in boards | A, redo rule 1 | PR 9, D9 |
| C5 | PR 8's wait for CLINIC-APK-132 is gone (merged 13:46) | state | PR 8 |
| C6 | Every mobile PR names the doctrine rules it follows (A6) | B | PRs 4, 8, 10, 12, 13 |
| C7 | Copy rules for templates, card labels and web text; a fourth privacy sentence for counted challenges | B | PRs 1, 6, 9 |
| C8 | Added PR 11 CHALLENGE-AUTO-132 and PR 12 CHALLENGE-COACH-M-132 | Owner 13:21 in scope, but A shows no coach pathway and typed-in numbers that Roman would quote as facts | new |
| C9 | Added PR 13 ROMAN-SAW-M-132 and PR 14 ROMAN-SAW-132 ("What Roman saw", read-only) | C: WHOOP and Oura show members what the AI knows; A: built on the server with no screen (X7); outreach makes it matter | new |

Kept as they were: PRs 1-10 (IDs, repos, tiers, goals, sizes), the four switches of PR 1, flip order, D1-D8 and D10, the after-list
(renumbered 15-18), the deferred list.

## A4. The 14 PRs (merge order inside waves; T4 = Claude Opus 5.5 builder + both lenses)

| # | ID | Repo | Tier | Goal (plain words) | Switch | Size | Depends on |
|---|---|---|---|---|---|---:|---|
| 1 | ROMAN-GATES-132 | backend | T4 config + privacy copy | Declares the new switches (all off) and writes the privacy sentences first [C7: four sentences] | declares INSIGHTS, ACTIONS, UPLOADS, OUTREACH (+ REDLINE_CHECK, SUMMARIES) | ~320 | FLAG-TOOL-132 (b#884) merged |
| 2 | ROMAN-INSIGHTS-132 | backend | T4 health data | 8 detectors on one client's own data with exact numbers and dates [C3: challenge detector empty while challenges are off] | none (no caller) | ~650 | none |
| 3 | ROMAN-ACTIONS-132 | backend | T4 health-data writes, migration | Roman proposes; the client taps; only then water, food or a coach draft | FEATURE_ROMAN_ACTIONS | ~780 | 1 |
| 4 | ROMAN-ACTIONS-M-132 | mobile | T3 | Confirm / Not now cards under Roman's reply [C6] | none (server-driven) | ~400 | 3 |
| 5 | ROMAN-PHOTO-132 | backend | T4 health data/egress | Meal photo -> food card; lab file -> plain explanation + Ask your coach; file not kept | FEATURE_ROMAN_UPLOADS | ~600 | 1, 3 |
| 6 | ROMAN-OUTREACH-132 | backend | T4 PII/push/consent, migration | Roman may message first: caps, quiet hours, off switch [C1: also in the bell] | FEATURE_ROMAN_OUTREACH | ~790 | 1, 2, 3 |
| 7 | ROMAN-PATTERNS-132 | backend | T4 health data | Patterns in one client's own 90 days, n >= 8 each side, and the insights tool | rides INSIGHTS | ~600 | 2, 3 |
| 8 | ROMAN-PHOTO-M-132 | mobile | T3 | Camera / photo / file button in Roman's composer [C5, C6] | none | ~500 | 4, 5 |
| 9 | ROMAN-BRIEF-132 | backend | T4 egress/spend | Brief and check-ins in Roman's words and the coach's method [C4, C7] | rides OUTREACH | ~460 | 6, 7 |
| 10 | ROMAN-OUTREACH-M-132 | mobile | T3 | "Roman can message me first" switch; push and bell open today's Roman chat [C2, C6] | none | ~320 | 6 |
| 11 | CHALLENGE-AUTO-132 [C8] | backend | T4 health data + privacy | Challenge progress counted from what the client already logs, never typed in, never another user's rows | rides FEATURE_COMMUNITY_CHALLENGES (unset) | ~600 | none |
| 12 | CHALLENGE-COACH-M-132 [C8] | mobile | T3 | The coach creates, runs and ends a challenge from the Clients tab; clients see counted progress | none (shows only when the server answers) | ~650 | 11 |
| 13 | ROMAN-SAW-M-132 [C9] | mobile | T3 (PII display) | Read-only "What Roman saw" in Settings > Roman AI | none (server-driven) | ~450 | 10, 14 |
| 14 | ROMAN-SAW-132 [C9] | backend | T4 PII | GET /roman/context/me grows: Roman's notes and the reason for each Roman-first message; read-only | rides MEMORY (on) | ~400 | 6, 7 |

Flip order (operator, after the owner's yes, D10): ACTIONS (3 + 4 in an APK), UPLOADS (5 + 8), OUTREACH (6 + 9 + 10), INSIGHTS
(2 + 7); then [C8] community challenges per D11 (11 + 12 in an APK/iOS build). PRs 13-14 need no switch: the screen appears when the
build has it and reads what the server returns (v1 sections now, v2 sections after PR 14).

## A5. Pathway placement (addendum A; reachability from src/navigation at a3a1c18e; taps counted from the Home tab or the coach Overview tab)

| Piece (PR) | Who | Where it lives (tab > screen > entry) | Taps | Replaces | Routes and actions before -> after |
|---|---|---|---:|---|---|
| Action cards (3, 4) | client | Home > header Roman face > Roman chat > card under Roman's reply (also More > Roman) | 1 to chat, +1 Confirm | nothing | Before: Back, history, composer, send, send retry, older messages. After: the same + Confirm / Not now per card; a draft card opens Messages (client-coach chat) with the text filled, sent only by the client; Ask your coach opens Messages |
| Photo and file (5, 8) | client | Roman chat > composer > attach (camera, photo library, file) | 2 | nothing | Composer before: field, send. After: + attach, shown only when the server says uploads are on |
| Roman's first messages (6, 9) [C1] | client | Push -> today's Roman chat; Home > bell > row -> Roman chat; the message also sits in today's chat | 0 push, 2 bell | nothing | Bell before: every existing kind. After: + `roman_outreach` rows routed to RomanChat; nothing else in the bell changes |
| "Roman can message me first" (10) | client | More > Settings > Roman AI > switch above the memory switch | 4 | nothing | Roman AI before: consent, memory switch, delete-account link. After: + one switch, shown only when GET /roman/outreach/settings answers 200 |
| Insights and patterns (2, 7) | client | No new screen: Roman's answers and first messages | - | - | none |
| Privacy sentences (1) | everyone | Web trust pages (src/public-pages/trust-pages.html.ts, e.g. GET /privacy), linked from Settings > Trust & Privacy | - | adds four sentences | none removed |
| Coach challenges (12) [C8] | coach | Clients tab > header pill "Challenges" (next to "At risk", ClientsListScreen.tsx:186-219) > Challenges > "New challenge" | 2, +1 New | nothing | Clients header before: invite pill, At risk. After: + Challenges, shown only when the coach's challenge list answers 200 |
| Client challenges (11, 12) [C8] | client | Community tab > Challenges segment > challenge (existing screens, after D11) | 2-3 | for a counted challenge only, the typed progress field is replaced by the counted number and one line on how it is counted | Detail before: join, progress, board opt-in, comments, report. After: the same; typed progress stays for challenges members count themselves |
| What Roman saw (13, 14) [C9] | client | More > Settings > Roman AI > "What Roman saw" (read-only) | 4 | nothing | + one row and a read-only screen with Back; no delete control (owner 10:44) |
| Coach's Roman | coach | Settings tab > Roman (unchanged by the 14) | 2 | - | - |

No route, button or action is removed by any of the 14 (redo rule 6); each mobile PR proves it with the "Routes/actions before ->
after" table and a parity test.

## A6. Design (addendum B): the rules each PR follows

Sources: docs/QUIET_LUXURY_DOCTRINE.md (QLD), src/theme/README.md, docs/HAPTICS.md, docs/SKELETON_LOADERS.md, docs/dark-mode.md,
docs/charting.md, docs/share-card.md, ENGINEERING_RULES.md, redo rules 1-8
(tgp-agent-context/handoffs/op-131/ops/lanes131/_COMMON_131.md:282-310). The owner's standard:
luxurious, simple, mentally deloading and calm.

| PR | Rules named | How |
|---|---|---|
| 4 cards | QLD 2, 3, 4, 5, 8; redo 1-3, 7; HAPTICS; QuietStates | A card only when the server sends one; Confirm is the one forest action, "Not now" a muted 44 pt text action; the result replaces the card with one fade; "Log 500 ml water" / "Logged." in plain words; radius 4, hairline, theme tokens; mediumImpact() on Confirm, success() after the write, error() on failure; an expired card says so and has no button |
| 8 attach | QLD 2, 5, 6; redo 2, 3, 7; HAPTICS; QuietBar | Inside the composer, never floating; shown only when uploads are on; permission denied -> one sentence and an Open Settings text action; selection() on the choice; upload progress with QuietBar |
| 10 switch | QLD 4, 8; redo 1, 2, 7; HAPTICS | The label says what is true (at most three a day, never in quiet hours, off at any time); selection() on change |
| 12 challenges | QLD 1, 3, 4, 5, 8; redo 3, 5, 6, 7; SKELETON_LOADERS; charting; share-card | No trophies, badges or confetti; a board is a monochrome list with tabular numerals; one forest action per screen ("New challenge", "Publish"); optional fields behind one disclosure; lists load with the shared skeleton; progress as QuietBar (no chart); no new share-card variant |
| 13 What Roman saw | QLD 2, 4, 5; redo 1, 4, 5, 7; QuietStates | Shows only what the server returned; sections collapsed under one-line summaries; calm error with Try again; no delete control |
| 1, 6, 9 copy | QLD 4; Q9 item 14 | Roman's own voice may say "I"; facts with numbers and dates; no praise words ("Crushing it", "Amazing"), no exclamation marks, no emoji; a personal best is a fact; a sensitive signal never gets upbeat text; web text keeps the same plain register |

Dark mode stays hidden for launch; every colour comes from useTheme / semantic tokens so the screens are ready for it.

## A7. Waves (no two PRs in flight share a file)

| Wave | Start when | PRs | Files (exclusive within the wave) |
|---|---|---|---|
| 1 | now (1 opens after b#884 merges) | 1, 2, 11 [C8] | 1 and 2: as in V11_PLAN_132.md section 2. 11: src/community/challenges/community-challenges.service.ts, .dto.ts, .repository.ts, NEW challenge-metrics.ts, NEW challenge-progress.scheduler.ts, src/community/community.module.ts, NEW test/community/challenges/challenge-auto-progress.spec.ts |
| 2 | 1 merged (3); 11 merged (12) | 3, 12 [C8] | 3: as before. 12 (mobile): src/api/communityChallengesApi.ts, src/screens/coach/ClientsListScreen.tsx, src/navigation/CoachNavigator.tsx, NEW src/screens/coach/CoachChallengesScreen.tsx, NEW CoachChallengeEditScreen.tsx, src/components/community/ChallengeProgressSheet.tsx, src/screens/coach/README.md, src/navigation/README.md, src/components/README.md |
| 3 | 3 merged (6 and 7 also after 2) | 4, 5, 6, 7 | as before; 6 also calls NotificationsService (no edit) [C1] |
| 4 | 8 after 4 and 5; 9 after 6 and 7; 10 after 6; 14 after 6 and 7 | 8, 9, 10, 14 [C9] | 8, 9, 10: as before. 14: src/roman/context/roman-context.controller.ts, its service file(s) under src/roman/context/, NEW test/roman/context/roman-context-v2.spec.ts |
| 5 | 10 and 14 merged | 13 [C9] | NEW src/screens/roman/RomanContextScreen.tsx, NEW src/api/romanContextApi.ts, src/navigation/ClientNavigator.tsx, src/screens/settings/RomanAiConsentScreen.tsx, src/screens/settings/README.md, src/navigation/README.md |

Merge order: 1, 2, 11, 3, 12, 4, 5, 6, 7, 8, 9, 10, 14, 13.

Overlap with the other v1.1 plans (read 14:10; never two in flight on one file):
- src/notifications/notification-kind.ts: PR 6 and REFERRAL-NOTIFY-132 (V11_REFERRAL_PLAN_132.md:241, which already names this
  overlap at :265 and :311). Whichever opens second merges origin/main first.
- src/account-deletion/account-deletion.manifest.ts and the data export: PRs 3 and 6 and the REFERRAL plan (:265, :393).
- src/screens/coach/ClientsListScreen.tsx: PR 12 and TEAMS PR 13 (V11_TEAMS_PLAN_132.md:218, overline and filter).
- src/navigation/CoachNavigator.tsx: PR 12 and TEAMS PR 16 (:219), REFERRAL PR 7 (:255) and the optional CHURN-M-RETIRE-132
  (V11_CHURN_PLAN_132.md:223).
- The CHURN and TEAMS plans read src/roman/tools/roman-tools.feature.ts as a pattern only; no Roman file is edited by another plan.

## A8. Ready-to-paste JOBS132 entries (PRs 1-10 as in V11_PLAN_132.md with the marked edits; PRs 11-14 new)

```
## ROMAN-GATES-132 (builder R1, Claude Opus 5.5, backend, T4 config + privacy copy; one PR; time box 75 minutes)
Worktree /home/user/workspace/wt/ROMAN-GATES-132-backend, branch agent132/roman-gates-132 (off backend main). LEFTHOOK=0.
Waits for FLAG-TOOL-132 to merge (both edit .github/fly-env-desired-state.json): build now, `git merge origin/main`, then open.
PR 1 of the Roman v1.1 train (/home/user/workspace/ops/V11_ROMAN_PLAN_132.md PART A; file detail in
/home/user/workspace/ops/V11_PLAN_132.md section 2). Six readers, same shape as
src/roman/tools/roman-tools.feature.ts (only 'true', case-insensitive, is on): isRomanInsightsEnabled
(src/roman/insights/roman-insights.feature.ts, FEATURE_ROMAN_INSIGHTS), isRomanActionsEnabled (src/roman/actions/roman-actions.feature.ts,
FEATURE_ROMAN_ACTIONS), isRomanUploadsEnabled (src/roman/uploads/roman-uploads.feature.ts, FEATURE_ROMAN_UPLOADS),
isRomanOutreachEnabled (src/roman/outreach/roman-outreach.feature.ts, FEATURE_ROMAN_OUTREACH), isRomanRedlineCheckEnabled
(src/roman/guardrails/roman-redline.feature.ts, FEATURE_ROMAN_REDLINE_CHECK), isRomanSummariesEnabled
(src/roman/memory/roman-summaries.feature.ts, FEATURE_ROMAN_SUMMARIES). ENV_RULES after src/common/env-validation.ts:2250; "unset"
rows after .github/fly-env-desired-state.json:54 and notes after :138 ("off until both lenses and the owner say yes; emergency kill:
unset"); runbook rows after docs/runbooks/launch-flags.md:144; `=false` lines after .env.example:1016; ROMAN_OUTREACH_CAPABILITY =
'roman.outreach' in ROMAN_BACKGROUND_CAPABILITIES (src/roman/roman.constants.ts:139-144). Privacy text in
src/public-pages/trust-pages.html.ts next to the Roman paragraphs (:270-311, :436-437), one plain sentence each, true for the
switched-on behaviour of V11_ROMAN_PLAN_132 PRs 3, 5 and 6: Roman logs or drafts only when you tap Confirm and never sends a message for
you; a photo or file you send Roman goes to Anthropic for that reply and is not kept by the app (owner D6); Roman may message you
first, at most three times a day, outside quiet hours, and you can turn it off in Settings. [CHANGE C7] A fourth sentence for
PR 11: in a coach's challenge counted from your logs, progress comes from what you already log, and other members see it only if
you join that challenge's board. Web copy follows docs/QUIET_LUXURY_DOCTRINE.md section 4 (plain sentences, periods, no exclamation
marks, no emoji). No first person, no clinic partner name.
No caller anywhere (inert). Failing-first: test/roman/r11-seams.spec.ts (:483-518 pattern; each reader off for unset, '', '1', on
for 'true'/'TRUE'; desired state "unset"; .env.example =false), the trust-pages test (`rg -l trust-pages test`) for the four [CHANGE C7]
sentences; test/ci/fly-env-manifest.spec.ts passes. Under 350 lines. Title "feat(roman): v1.1 switches (all off) and privacy text
for actions, photos and outreach (T4)". READY. End.

## ROMAN-INSIGHTS-132 (builder R2, Claude Opus 5.5, backend, T4 health data; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/ROMAN-INSIGHTS-132-backend, branch agent132/roman-insights-132 (off backend main). LEFTHOOK=0.
No dependency: new files only, no caller (inert). Start now.
PR 2 (from the code: no detector exists). NEW src/roman/insights/roman-insights.types.ts (RomanInsight: kind, metric, numbers,
dates, sensitive); NEW roman-insight-inputs.ts (reads ONLY the caller's rows: readBaselines from src/roman/tools/roman-baselines.ts:163
(import, no edit), workouts done and missed, check-ins, bookings, and the caller's own CommunityChallengeParticipation with its
challenge's title, target_value, unit, ends_at); NEW roman-detectors.ts, pure functions: under_normal_run (sleep, HRV, resting HR;
3+ days past the ADJUST_THRESHOLDS lines), missed_session_run, protein_shortfall_run, streak, personal_best (roman-exercise-history.ts),
check_in_drop (sensitive), booking_tomorrow, challenge_progress (own progress and days left only; never another participant; [CHANGE C3] empty unless
resolveChallengesFlag() is true (src/community/challenges/community-challenges-flag.guard.ts:31, import only, no edit) and the client
joined an active challenge of their own coach's workspace; for a counted challenge it reads the counted progress of PR 11).
Failing-first: NEW test/roman/insights/roman-detectors.spec.ts (each fires with exact numbers and dates on a fixture; not below its
minimum days; inputs never select another user's rows; sensitive set on check_in_drop; [CHANGE C3] challenges flag off -> no challenge_progress). Under 700 lines. Title
"feat(roman): insight detectors from one client's own data (T4, no caller yet)". READY. Then ROMAN-PATTERNS-132.

## ROMAN-ACTIONS-132 (builder R3, Claude Opus 5.5, backend, T4 health-data writes; one PR; time box 3 h)
Worktree /home/user/workspace/wt/ROMAN-ACTIONS-132-backend, branch agent132/roman-actions-132. LEFTHOOK=0. Code now against the
names pinned in ROMAN-GATES-132; open after it merges (`git merge origin/main`).
PR 3: NEW migration (prisma/schema.prisma + migration.sql + down.sql): RomanAction (id, client_id, message_id, kind
log_water|log_food|draft_coach_message|ask_coach, payload Json, status proposed|confirmed|dismissed|expired, confirmed_at,
result_ref, created_at; ON DELETE CASCADE); manifest row (account-deletion.manifest.ts) and export row (data-export.service.ts +
README). Tool `propose_action` (src/roman/tools/roman-tool.types.ts; listed in roman-read-tools.ts:233-241 only when
isRomanActionsEnabled(); NEW src/roman/actions/roman-action-tools.ts): zod-checked; food items looked up through FoodService search
(src/food/food.controller.ts:20) so every number comes from the food database, never the model; stores a proposed row, writes
nothing. NEW src/roman/actions/roman-actions.controller.ts: POST /roman/actions/:id/confirm and /dismiss (owner only, else 404;
confirm writes once through the existing water (src/water) and food-log (src/log) services keyed by the action id;
draft_coach_message returns the text and sends nothing; ask_coach is a no-write card the app opens as the coach chat; proposals
expire after 24 h). GET /roman/sessions/:id/messages (roman.controller.ts:77) returns each Roman message's actions. Register in
src/roman/roman.module.ts. Failing-first: NEW test/roman/actions/roman-actions.spec.ts (flag off -> no tool; propose writes nothing;
another user -> 404; confirm twice -> one log; dismissed or expired -> refused; food numbers from the database fixture; a draft never
sends) + NEW test/roman/eval/actions.eval.spec.ts. Under 800 lines (over: move draft_coach_message to the next batch). Title
"feat(roman): Roman proposes, the client confirms: water, food, coach drafts (T4, FEATURE_ROMAN_ACTIONS off)". READY. Then
ROMAN-OUTREACH-132.

## ROMAN-ACTIONS-M-132 (builder R4, Claude Opus 5.5, mobile, T3; one PR; time box 2 h)
Worktree /home/user/workspace/wt/ROMAN-ACTIONS-M-132-mobile, branch agent132/roman-actions-m-132. Build against the
ROMAN-ACTIONS-132 contract once it is READY; open after it merges.
PR 4: src/api/romanApi.ts (messages gain optional actions; confirm and dismiss calls); NEW src/components/roman/RomanActionCard.tsx
(what will be logged, numbers from the server; Confirm / Not now; after Confirm the logged result; ask_coach and draft cards open
the client's chat with their coach, a draft filled in and sent only when the client taps send); src/components/roman/RomanMessageBubble.tsx
renders cards under a Roman message; src/screens/roman/useRomanChat.ts holds card state. Cards appear only when the server sends
them (no app flag, no OTA). Mobile redo rules: parity table, truthful sweep, README row (src/screens/roman/README.md).
[CHANGE C6] Design: docs/QUIET_LUXURY_DOCTRINE.md sections 2 (a card only when the server sends one), 3 (the result replaces the
card with one fade, no pop or celebration), 4 ("Log 500 ml water", "Logged.": plain words, periods), 5 (radius 4, hairline, forest
only, motion.duration tokens, at most 300 ms for anything waited on) and 8 (README row); redo rules 1-3 and 7 (Confirm is the one
forest action, "Not now" a muted 44 pt text action, an expired card says so and has no button, useTheme tokens only);
docs/HAPTICS.md mediumImpact() on Confirm, success() after the write, error() on failure; pending state uses the QuietStates label.
Failing-first: NEW src/components/roman/__tests__/RomanActionCard.test.tsx (confirm once, double tap -> one call, dismiss, error ->
real retry, a draft never auto-sends). Under 500 lines. READY. Then ROMAN-PHOTO-M-132.

## ROMAN-PHOTO-132 (builder R5, Claude Opus 5.5, backend, T4 health data/egress; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/ROMAN-PHOTO-132-backend, branch agent132/roman-photo-132. LEFTHOOK=0. Code now; open after
ROMAN-ACTIONS-132 merges.
PR 5: POST /roman/sessions/:id/messages/attachment in src/roman/roman.controller.ts (multipart, one file <= 5 MB, image/jpeg, png,
webp or application/pdf; same guards, consent, spend and safety path as a normal client turn; 404 unless isRomanUploadsEnabled();
students only; client surface only). src/roman/roman.service.ts: the file goes to the model as one image or document block for that
turn only, held in memory, never written to disk, storage or a log; the stored user message says "(photo)" or "(file)". A meal
photo: Roman may call propose_action log_food (ROMAN-ACTIONS-132, no edit). A PDF, or an image Roman reads as a lab report: the reply
follows the existing safety router (no diagnosis, no naming conditions) and an ask_coach action row is added to that reply.
src/roman/roman.prompts.ts: one rule for files. roman.dto.ts: the form fields. GET /roman/uploads/status (or a field on an existing
Roman response) tells the app whether to show the button. Failing-first: NEW test/roman/uploads/roman-photo.spec.ts (flag off -> 404;
6 MB -> 413; wrong type -> 415; no consent -> refused before any send; nothing written to disk or the database except the placeholder
message and action rows; a PDF reply carries ask_coach; another user's session -> 404) + NEW test/roman/eval/photo.eval.spec.ts
(stub model). Under 650 lines. Title "feat(roman): photos and lab files to Roman, food card and Ask your coach (T4,
FEATURE_ROMAN_UPLOADS off)". READY. End.

## ROMAN-OUTREACH-132 (builder R3 again, after ROMAN-ACTIONS-132 and ROMAN-INSIGHTS-132 merge; T4 PII/push/consent; one PR; 3 h)
Worktree /home/user/workspace/wt/ROMAN-ACTIONS-132-backend, fresh branch agent132/roman-outreach-132 off origin/main.
PR 6: NEW migration: RomanOutreach (id, client_id, kind brief|moment, trigger_key, day_key, status
sent|suppressed_cap|suppressed_quiet|suppressed_off|suppressed_sensitive|suppressed_dedupe, message_id, created_at; unique
client_id+trigger_key+day_key; ON DELETE CASCADE) and NotificationPreferences.roman_outreach_enabled (schema :1072; default per owner
D1); manifest and export rows. NEW src/roman/outreach/roman-outreach.engine.ts: only when isRomanOutreachEnabled(); clients with a live
client-ai-v5 grant and the switch on; caps 1 brief + 2 moments per local day; quiet hours via src/notifications/push/push-quiet-hours.ts;
one message per trigger per day; triggers = ROMAN-INSIGHTS-132 detectors; a sensitive insight never messages the client (logged
suppressed_sensitive); the safety router runs on every text; the message is appended to today's client RomanSession as role 'roman'
and [CHANGE C1] delivered through NotificationsService (call only, no edit) as the nudge engine does
(src/notifications/nudges/nudge-engine.service.ts:393-420): createNotification({ kind 'roman_outreach', channel 'inapp', deep_link to
today's Roman chat }) so it waits in the bell even with push off, then pushToUser when the client's push preference for the kind
allows (kind added at src/notifications/notification-kind.ts:74 pattern, push/push-preferences.ts:40). [CHANGE C7] Template copy
follows docs/QUIET_LUXURY_DOCTRINE.md section 4 and Q9 item 14: Roman's own voice, plain facts with numbers and dates, no praise
words, no exclamation marks, no emoji; a sensitive signal never produces upbeat text.
NEW roman-outreach.composer.ts (deterministic templates from the insight numbers; ROMAN-BRIEF-132 upgrades this file only),
roman-outreach.scheduler.ts (every 15 min; brief window per owner D2), roman-outreach.controller.ts (GET/PATCH
/roman/outreach/settings {enabled}; students only; 404 while the flag is off). Register in src/roman/roman.module.ts.
Failing-first: NEW test/roman/outreach/roman-outreach.engine.spec.ts (flag off -> nothing; switch off; quiet hours; 4th message ->
cap; same trigger twice -> dedupe; sensitive -> no client message; no v5 -> nothing; own rows only; one message + one in-app row + one push; [CHANGE C1] push off -> in-app row only) and a
manifest test. Under 800 lines (over: move the controller to a follow-up in the same wave). Title "feat(roman): outreach engine with
caps, quiet hours and an off switch (T4, FEATURE_ROMAN_OUTREACH off)". READY. End.

## ROMAN-PATTERNS-132 (builder R2 again, after ROMAN-INSIGHTS-132 and ROMAN-ACTIONS-132 merge; T4 health data; one PR; 2 h)
Worktree /home/user/workspace/wt/ROMAN-INSIGHTS-132-backend, fresh branch agent132/roman-patterns-132 off origin/main.
PR 7: NEW src/roman/insights/roman-patterns.ts: inside one client's own last 90 days (sleep -> next-day session volume, sleep ->
next-day steps, training day -> that night's sleep), each side n >= 8, effect at least 5 percent, plain words with n, no condition or
medical words (lint list in the test); 3 more detectors in roman-detectors.ts: plateau, fast weight change (sensitive), late-night
logging. The `insights` tool (roman-tool.types.ts; roman-read-tools.ts) returns detectors + patterns, listed only when
isRomanInsightsEnabled(); students only, caller.id only; protein numbers as facts (average_past_g) for the reply check; sensitive
items carry "never praise, suggest the coach". Failing-first: NEW test/roman/insights/roman-patterns.spec.ts (n=7 -> nothing;
fixture -> exact percent and n; no medical words; fast weight change sensitive) and tool tests (flag off -> absent; coach caller ->
not_allowed). Under 650 lines. Title "feat(roman): patterns in the client's own data and the insights tool (T4, FEATURE_ROMAN_INSIGHTS
off)". READY. End.

## ROMAN-PHOTO-M-132 (builder R4 again, after ROMAN-ACTIONS-M-132 and ROMAN-PHOTO-132 merge; mobile, T3; one PR; 2 h)
Worktree /home/user/workspace/wt/ROMAN-ACTIONS-M-132-mobile, fresh branch agent132/roman-photo-m-132 off origin/main. [CHANGE C5]
CLINIC-APK-132 merged at 13:46 (m#572, mobile main a3a1c18e): no wait for it; app.json still has no image-picker permission text.
PR 8: add expo-image-picker (owner D7; package.json; camera and photo-library permission text in app.json, plain and true);
src/components/roman/RomanComposer.tsx: one attach button (camera, photo library, file via the existing expo-document-picker), shown
only when the server says uploads are on; resize to <= 5 MB before upload; src/api/romanApi.ts multipart send;
src/screens/roman/useRomanChat.ts sending state; RomanActionCard.tsx ask_coach opens the coach chat. Mobile redo rules: parity table,
truthful sweep, README row. [CHANGE C6] Design: doctrine sections 2 (button only when the server allows uploads), 5 and 6 (inside
the composer, never a floating button); redo rules 2 (permission denied -> one plain sentence and an Open Settings text action), 3
and 7; docs/HAPTICS.md selection() on the camera / library / file choice; upload progress with QuietBar (src/ui/progress/QuietBar.tsx).
Failing-first: NEW src/components/roman/__tests__/RomanComposerAttach.test.tsx (hidden when off; picked
photo sends once; too large -> plain message; permission denied -> plain message, no dead button). Under 550 lines. READY. End.

## ROMAN-BRIEF-132 (builder R5 again, after ROMAN-OUTREACH-132 and ROMAN-PATTERNS-132 merge; T4 egress/spend; one PR; 2 h)
Worktree /home/user/workspace/wt/ROMAN-PHOTO-132-backend, fresh branch agent132/roman-brief-132 off origin/main.
PR 9: src/roman/outreach/roman-outreach.composer.ts only: the morning brief (today's session, one focus, one personal note from live
notes) and check-in texts worded by ROMAN_MODEL_BACKGROUND from code-computed facts, carrying the coach's own rule for that moment
from the client's head coach's active playbook (recovery after poor sleep or low HRV; missed sessions; protein; read with the rules of
roman-coach-method.augmenter.ts, memory-scope clients only) and, where useful, a draft_coach_message card ("ask your coach for a
lighter session"); challenge moments from challenge_progress [CHANGE C4] only (empty while community challenges are off),
never another participant's name or numbers, a rank only when the client opted in to that challenge's board; [CHANGE C7] a personal
best is a fact with the number and the date, never praise words (doctrine section 4). Admission through RomanBackgroundSpendService with
ROMAN_OUTREACH_CAPABILITY (head coach pool, daily ceiling); 'memory' scope send; safety router and postCheckRomanReply on the output;
any refusal, timeout or failed check -> the template. Rides FEATURE_ROMAN_OUTREACH. Failing-first: NEW
test/roman/outreach/roman-brief.composer.spec.ts (pool empty -> template, no call; invented number -> template; sensitive -> no
upbeat text; no playbook -> no coach rule claimed) + NEW test/roman/eval/outreach.eval.spec.ts (travel day, bad-sleep run, missed
sessions, personal best, challenge week). Under 500 lines. Title "feat(roman): morning brief and check-ins in the coach's method
(T4, behind FEATURE_ROMAN_OUTREACH)". READY. End.

## ROMAN-OUTREACH-M-132 (builder R6, Claude Opus 5.5, mobile, T3; one PR; time box 90 minutes)
Worktree /home/user/workspace/wt/ROMAN-OUTREACH-M-132-mobile, branch agent132/roman-outreach-m-132. Build against the
ROMAN-OUTREACH-132 contract once it is READY; open after it merges.
PR 10: "Roman can message me first" switch in src/screens/settings/RomanAiConsentScreen.tsx (above the memory switch at :406), shown
only when GET /roman/outreach/settings answers 200 (hidden on 404: no app flag, no OTA); NEW src/api/romanOutreachApi.ts;
src/services/pushTapRouter.ts (:158 pattern) routes kind 'roman_outreach' to the Roman chat; [CHANGE C2] the same file's
routeInAppNotification serves the bell rows (src/screens/notifications/NotificationCenterScreen.tsx:38), so this one edit covers push
taps and the bell; theme colours, honest copy. [CHANGE C6] Design: doctrine sections 4 and 8; redo rules 1 (the label says what is
true: at most three a day, never in quiet hours, off at any time), 2 and 7; docs/HAPTICS.md selection() on the switch. Do not edit
src/api/romanApi.ts. Mobile redo rules: parity table, truthful sweep, README row (src/screens/settings/README.md). Failing-first:
NEW src/screens/settings/__tests__/RomanOutreachSwitch.test.tsx (404 -> no row; on/off PATCH; error -> real retry) and a
pushTapRouter.test.ts case for a push tap and one for a bell row [CHANGE C2]. Under 400 lines. READY. End.

## CHALLENGE-AUTO-132 [CHANGE C8, new] (builder R7, Claude Opus 5.5, backend, T4 health data + privacy; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/CHALLENGE-AUTO-132-backend, branch agent132/challenge-auto-132 (off backend main). LEFTHOOK=0.
No dependency: wave 1, files disjoint from ROMAN-GATES-132 and ROMAN-INSIGHTS-132. Start on the operator's go.
PR 11 of /home/user/workspace/ops/V11_ROMAN_PLAN_132.md (owner 13:21: leaderboards and coach-run challenges). From the code: progress
is typed in by the client (the repository keeps the higher value, src/community/challenges/community-challenges.service.ts:430) and
metric_key is free text (community-challenges.dto.ts:85). NEW src/community/challenges/challenge-metrics.ts: the owner D12 list of
counted metrics: workouts_completed (WorkoutSession completed), steps (WearableSample steps), water_days_at_target (WaterLog against
the client's target), protein_days_at_target (food logs against the current macro target), check_ins_sent (CheckIn), each counted
only from the participant's own rows between starts_at and ends_at, by the participant's local day; never another user's rows.
community-challenges.dto.ts: metric_key is one of the list or absent (absent = members enter progress, exactly as today).
community-challenges.service.ts: for a counted metric, progress is the count, refreshed on join, on reading the challenge or its board
(at most once per 10 minutes per participant) and by NEW challenge-progress.scheduler.ts (every 30 minutes, active challenges only,
nothing unless resolveChallengesFlag() is true); POST progress on a counted challenge -> 409 with one plain sentence; the challenge
response gains progress_counted (true or false) next to metric_key (:111). The board is unchanged: only members who opted in appear.
Register the scheduler in src/community/community.module.ts. Everything stays behind FEATURE_COMMUNITY_CHALLENGES (unset).
Failing-first: NEW test/community/challenges/challenge-auto-progress.spec.ts (each metric counts its fixture exactly; rows outside the
dates ignored; another user's rows never counted; a coach of another workspace cannot read it (404); typed metric keeps POST progress;
counted metric POST -> 409; flag off -> the scheduler does nothing; the board lists only opted-in members). Under 600 lines. Title
"feat(challenges): progress counted from the client's own logs (T4, behind FEATURE_COMMUNITY_CHALLENGES)". READY. Then ROMAN-SAW-132.

## CHALLENGE-COACH-M-132 [CHANGE C8, new] (builder R8, Claude Opus 5.5, mobile, T3; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/CHALLENGE-COACH-M-132-mobile, branch agent132/challenge-coach-m-132 (off mobile main). Build
against the CHALLENGE-AUTO-132 contract once it is READY; open after it merges. Then ROMAN-SAW-M-132.
PR 12: the coach creates and runs a challenge. src/api/communityChallengesApi.ts gains create, update and archive (POST
/community/workspaces/:workspaceId/challenges, PATCH /community/challenges/:id, POST /community/challenges/:id/archive; the coach's
workspace id from GET /community/me) and reads progress_counted. src/screens/coach/ClientsListScreen.tsx: a "Challenges" header pill
next to "At risk" (:186-219), shown only when featureFlags.communityChallenges is on and the coach's challenge list answers 200 (no
dead button while the server switch is off). NEW src/screens/coach/CoachChallengesScreen.tsx (active, drafts, ended; participants
and, when the board is on, the opted-in board) and NEW CoachChallengeEditScreen.tsx (title, description, what counts: one of the D12
metrics or "Members enter progress", target and unit, start and end dates, board on or off; Publish; Archive confirmed in a native
dialog), both registered in the coach Clients stack (src/navigation/CoachNavigator.tsx). Client side:
src/components/community/ChallengeProgressSheet.tsx shows the counted number and one line ("Counted from your workout logs.") instead
of the input when progress_counted is true. Design [CHANGE C6]: docs/QUIET_LUXURY_DOCTRINE.md sections 1, 3 (no trophies, badges or
confetti; the board is a monochrome list with tabular numerals), 4, 5 and 8; redo rules 3 (one forest action per screen), 5 (optional
fields behind one disclosure), 6 and 7; docs/SKELETON_LOADERS.md shared skeleton for lists; progress as QuietBar, no chart; no new
share-card variant. README rows: src/screens/coach/README.md, src/navigation/README.md, src/components/README.md. Mobile redo rules:
parity table for the Clients header and the challenge detail, truthful sweep. Failing-first: NEW
src/screens/coach/__tests__/CoachChallenges.test.tsx (pill hidden when the flag is off or the list 404s; create -> publish -> listed;
archive asks first; board toggle sent) and NEW src/components/community/__tests__/ChallengeProgressSheetCounted.test.tsx (counted ->
no input, number shown; typed -> input kept). Under 700 lines. READY. Then ROMAN-SAW-M-132.

## ROMAN-SAW-132 [CHANGE C9, new] (builder R7 again, after ROMAN-OUTREACH-132 and ROMAN-PATTERNS-132 merge; backend, T4 PII; one PR; 2 h)
Worktree /home/user/workspace/wt/CHALLENGE-AUTO-132-backend, fresh branch agent132/roman-saw-132 off origin/main. LEFTHOOK=0.
PR 14: GET /roman/context/me (src/roman/context/roman-context.controller.ts:44) keeps its v1 sections and adds v2 sections: `notes`
(the caller's live Roman notes, text and date, newest first, at most 50, plus whether notes are in use now, from the same consent
check the memory augmenter uses) and `first_messages` (the caller's Roman-first messages of the last 7 days from RomanOutreach: date,
kind, the insight in one plain sentence). Students only, caller.id only, read-only: no delete route (owner 10:44, SoT:1471-1486).
Failing-first: NEW test/roman/context/roman-context-v2.spec.ts (another user's notes never returned; a coach caller gets no client
notes; memory off -> notes listed with in_use false; outreach off -> first_messages empty; v1 fields unchanged). Under 450 lines.
Title "feat(roman): what Roman saw shows his notes and why he wrote first (T4, read-only)". READY. End.

## ROMAN-SAW-M-132 [CHANGE C9, new] (builder R8 again, after ROMAN-OUTREACH-M-132 and ROMAN-SAW-132 merge; mobile, T3; one PR; 2 h)
Worktree /home/user/workspace/wt/CHALLENGE-COACH-M-132-mobile, fresh branch agent132/roman-saw-m-132 off origin/main.
PR 13: NEW src/screens/roman/RomanContextScreen.tsx: read-only "What Roman saw", sections from GET /roman/context/me (v1 now; notes and
first messages when present), each collapsed under a one-line summary; one plain line at the top that is true per owner 10:44 and SoT
A7.2 (Roman reads your logs and his notes from your chats; single items cannot be removed; deleting your account erases them). NEW
src/api/romanContextApi.ts (zod; unknown sections ignored). Register RomanContext in the client More stack next to RomanChat
(src/navigation/ClientNavigator.tsx, behind featureFlags.romanChat). One row "What Roman saw" on
src/screens/settings/RomanAiConsentScreen.tsx below the outreach switch. Design [CHANGE C6]: doctrine sections 2, 4, 5 and 8; redo
rules 1, 4, 5 and 7; QuietStates loading and error with Try again; no delete control anywhere. README rows:
src/screens/settings/README.md, src/navigation/README.md. Failing-first: NEW src/screens/roman/__tests__/RomanContextScreen.test.tsx
(v1 only renders; v2 sections render when present; error -> real retry; no delete control; Back returns to Roman AI). Under 500 lines.
READY. End.
```

## A9. Owner decisions (spend no money: Roman's existing Anthropic client and AI pools only; health data only with the Roman permission)

| # | Decision | Recommended default |
|---|---|---|
| D1 | Who gets Roman's first messages; switch default | Clients with Roman's memory on (client-ai-v5) only; switch on by default, in Settings > Roman AI (unchanged) |
| D2 | Morning brief time | 07:30 client local time, never in quiet hours; nothing useful = no brief (unchanged) |
| D3 | Sensitive signals | Never a client message; no new coach alert in this batch (unchanged) |
| D4 | Who pays for briefs and check-ins | The head coach's AI pool, Haiku 4.5, inside the $10/day background ceiling (unchanged) |
| D5 | Actions without coach approval | Water and food logs and coach drafts, each only after the client taps; nothing sent for the client (unchanged) |
| D6 | Photos and files sent to Roman | Sent to Anthropic for that reply, never stored by the app (unchanged) |
| D7 | Photo picker | Add expo-image-picker (free Expo module) with plain permission text; next APK/iOS build (unchanged) |
| D8 | Lab files | Explain only what was sent, no diagnosis, always with "Ask your coach" (unchanged) |
| D9 | Challenges and leaderboards in Roman **[C4 amended]** | Roman speaks of the client's own progress and days left only while community challenges are on and the client joined; a rank only when the client opted in to that challenge's board; never another client's name or numbers |
| D10 | Flip gate per switch | Both lenses at the exact head, owner yes, privacy sentence live, a device pass on the review accounts; mobile parts in the next APK/TestFlight build, no OTA (unchanged) |
| D11 **[C8 new]** | Switch coach-run challenges on for the first coaches | Yes, after PRs 11 and 12 are dual approved and device-passed: FEATURE_COMMUNITY_CHALLENGES true (one-line desired-state PR) and EXPO_PUBLIC_FF_COMMUNITY_CHALLENGES true in the clinic, clinic-apk and production profiles (one-line eas.json PR), in the same build as PR 12. LEADERBOARD_ENABLED (roster-wide board) stays as it is |
| D12 **[C8 new]** | Metrics that count themselves | Workouts completed, steps, days at the water target, days at the protein target, check-ins sent; anything else stays "members enter progress" |
| D13 **[C9 new]** | "What Roman saw" in v1.1 | Yes: client only, read-only (owner 10:44), in Settings > Roman AI; shows what Roman used, Roman's notes and why Roman wrote first |

## A10. After the 14, deferred, and Proposed (needs operator)

After the 14, in order (renumbered from 11-14): 15 ROMAN-REDLINE-132 (start after b#885 merges, it edits roman-post-check.ts and
safety-router.ts; and after PR 5); 16 ROMAN-SUMMARIES-132 (after PR 6); 17 ROMAN-ACTIONS-2-132 (log a described workout, a swap from the
coach's list, move a session inside the coach's availability); 18 ROMAN-EVAL-132 (more multi-week personas; tests only). Deferred for
scale, unchanged: cohorts, pgvector, success analytics at volume, the 200+ persona gate. Out of this plan: the importer (SoT A7.3).

Proposed (needs operator):
- P1 (replaces the earlier P1) D11-D13 go to the owner with the defaults above.
- P2 Staffing: R1 (1), R2 (2 then 7), R3 (3 then 6), R4 mobile (4 then 8), R5 (5 then 9), R6 mobile (10), R7 backend (11 then 14), R8
  mobile (12 then 13). Default: launch nothing until the owner says go (owner 13:21 "slow down"); then R1, R2, R3, R7 first.
- P3 The Sol posting rule applies to PRs 2, 5, 7, 9, 13 and 14 (sensitive signals, lab files, notes shown to the client).
- P4 Cross-plan file order (A7 list): PR 12 before TEAMS PR 13 and TEAMS PR 16 on ClientsListScreen.tsx and CoachNavigator.tsx; PR 6
  before REFERRAL-NOTIFY-132 on notification-kind.ts. Default: the PR whose wave opens first goes first; the other merges origin/main
  before opening.

# PART B: additional Roman ideas, pitched separately (optional; nothing here is in PART A)

Each pitch: the idea, why it makes TGP superior, the rival gap, size, cost, what it depends on, and where it would live. All are no cash
unless marked "owner decision (cash)". All would ship behind a new off switch and the same flip gate as D10.

### B1. Session prep, both sides
- **Idea.** The evening before a booked session, Roman asks the client two short questions in the Roman chat (how the week felt; anything
  to raise). With the client's tap, Roman turns the answers into a three-line prep note sent to the coach as the client's own message.
- **Why superior.** The coach starts every session already knowing the week, without writing a check-in form; the client feels heard.
- **Rival gap.** Future's coaches do this by hand at $149-199 a month ([BarBend](https://barbend.com/future-app-review/)); Trainerize's
  AI-drafted check-ins are coach-side and start at $150 a month with a 25-client minimum ([FitMetrics](https://www.trainerize.com/features/fitmetrics/));
  WHOOP's proactive check-ins know your trips but not your coach's calendar ([WHOOP](https://www.whoop.com/us/en/thelocker/new-ai-guidance-from-whoop/)).
- **Size.** 1 backend PR (a booking_tomorrow template and a draft through the PR 3 draft card). **Cost.** No cash (Haiku on the coach pool).
- **Depends on.** PRs 2 (booking_tomorrow), 3-4 (drafts), 6 and 9 (outreach). **Lives.** Push or bell -> Roman chat; the note lands in
  the client-coach Messages thread.

### B2. Week in review, weekly not daily
- **Idea.** Sunday evening, for clients with the outreach switch on, one calm Roman message: sessions done against planned, one pattern
  from PR 7, one focus for next week taken from the coach's plan.
- **Why superior.** A weekly rhythm is mentally deloading; every number is checked by the answer contract; the focus is the coach's.
- **Rival gap.** WHOOP's Day in Review and Daily Outlook are daily and metric-led ([WHOOP support](https://support.whoop.com/s/article/How-to-Use-the-AI-Powered-WHOOP-Coach?language=en_US));
  Strava summarises one activity at a time ([Strava](https://support.strava.com/en-us/articles/15401629-athlete-intelligence-on-strava)).
- **Size.** 1 backend PR (a 'review' kind in the outreach composer; counts inside the existing caps). **Cost.** No cash.
- **Depends on.** PRs 6, 7, 9 and 10. **Lives.** Today's Roman chat and the bell.

### B3. The coach teaches Roman, in plain words
- **Idea.** The coach sees Roman's plain summary of their method (from the playbook) and adds "always" and "never" rules in their own
  words ("never suggest fasting", "always offer a lighter session after poor sleep"). Never-rules are enforced in Roman's reply check;
  a "how Roman would answer" preview shows the effect on a sample question.
- **Why superior.** The client-side AI is governed by the coach, not by a vendor: the coach's brand and judgment scale without the coach
  typing more.
- **Rival gap.** Everfit's Smart Response matches the coach's tone in drafts for the coach ([Everfit](https://everfit.io/ai-suite/));
  WHOOP, Oura and Fitbit coach with their own method. Nobody lets a five-client coach set the rules of the client's AI.
- **Size.** 3 PRs (backend rules and preview; mobile coach screen in Settings > Roman; it needs ROMAN-REDLINE-132, #15 of the after-list).
  **Cost.** No cash (preview calls on the coach pool).
- **Depends on.** #15 REDLINE; an owner decision on what of the playbook a coach may see (A7.2 limits what coaches see of Roman's memory
  of clients, not of the coach's own method; owner to confirm). **Lives.** Coach: Settings tab > Roman > "Your method" (3 taps).

### B4. The coach's cue in the workout
- **Idea.** In the active workout, under an exercise, one line: the coach's own cue for it (from the program notes or the playbook) and,
  after the set, one fact against last time ("2.5 kg over last Tuesday").
- **Why superior.** The coach's voice is present in the moment that matters, quietly, with exact numbers; no model call needed.
- **Rival gap.** Apple Workout Buddy gives generic spoken motivation and needs an Apple Intelligence iPhone and headphones
  ([Apple Support](https://support.apple.com/en-gb/guide/watch/apd65c7938e6/watchos)).
- **Size.** 2 PRs (backend cue read from stored text; mobile one line in ActiveWorkout). **Cost.** No cash (code-computed, no model call).
- **Depends on.** PLAYBOOK and the exercise history tool (both on). **Lives.** Workout tab > session > exercise row.

### B5. "Ask Roman about this", where the client already is
- **Idea.** A quiet text action on Progress, the Log day totals, workout history and the Health metric detail opens Roman with that
  context attached ("Ask Roman about this week's protein").
- **Why superior.** Explanations arrive in the coach's method with checked numbers, at the point of curiosity, without hunting for chat.
- **Rival gap.** WHOOP puts "context-aware explanations and answers where you already are" ([WHOOP](https://www.whoop.com/us/en/thelocker/new-ai-guidance-from-whoop/));
  Fitbit has an "Ask Coach" button ([Google](https://blog.google/products-and-platforms/devices/fitbit/personal-health-coach-public-preview/)); neither has a coach behind it.
- **Size.** 2 PRs (mobile entry points; backend context parameter when a session opens). **Cost.** No cash. No floating button (QLD 6):
  a text action inside each screen's existing section.
- **Depends on.** TOOLS (on). **Lives.** 1 tap from each of those screens.

### B6. Threshold challenges, with Roman as the quiet scorekeeper
- **Idea.** A challenge mode where everyone who reaches the target completes it (no ranks), next to the opt-in board mode; Roman's brief
  carries one line of the client's own progress.
- **Why superior.** Competition without shame suits small groups of five clients and the calm doctrine (no trophies, no badges).
- **Rival gap.** Trainerize offers leaderboard and threshold challenges with badges and streak chrome ([Trainerize pricing](https://www.trainerize.com/pricing/));
  Everfit's automatic challenge counts only push-ups on camera ([Everfit](https://blog.everfit.io/march-2026-everfit-new-features)).
- **Size.** 2 PRs (backend mode field and migration; mobile option in the PR 12 editor). **Cost.** No cash.
- **Depends on.** PRs 11 and 12, D11. **Lives.** Coach: Clients > Challenges > New challenge; client: Community > Challenges.

### B7. Roman on the coach's landing page (pre-sale questions)
- **Idea.** A visitor asks about the coach's package on the coach's landing page; Roman answers only from that page and the package
  details, then the normal flow continues (landing -> info -> account -> checkout -> download).
- **Why superior.** The coach's AI starts working before the sale, inside the coach's brand.
- **Rival gap.** The coaching platforms reviewed put AI behind the login (Everfit, Trainerize); none answers buyers on the sales page.
- **Size.** 2 PRs (backend public endpoint with strict limits; landing-page widget following the same doctrine). **Cost.** Owner
  decision (cash): model calls on anonymous traffic are paid by TGP or the coach pool; abuse limits needed.
- **Depends on.** The FUNNEL plan (V11_FUNNEL_PLAN_132.md); no change to PART A. **Lives.** Web: the coach's landing page, step 1.

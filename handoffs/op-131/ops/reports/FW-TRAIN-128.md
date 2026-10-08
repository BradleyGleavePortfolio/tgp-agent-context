# FW-TRAIN-128 — first-week training audit (agent 128, read-only)

Auditor FW-TRAIN-128 (instance of FW-AUD-128). Report finalised 14:47 PDT 10-07 (credit emergency; not checked: coach-side view of client logs, Android back gesture in live workout, RoutineBuilder delete copy at m#493 head).
Read on mobile main f240af37 and backend main 675242fd (detached read-only worktrees
/home/user/workspace/wt/FW-TRAIN-128-ro-mobile and -ro-backend). No code, no PRs, no comments.
Supabase: one aggregate SELECT on production (row counts only, no personal data).

## Scope traced
A brand-new client in days 1-7, entitled (paid package; a client without one sees the ProtectedScreen gate, which is FW-MONEY's area),
with a coach and coachless where copy differs; Roman flag as shipped in eas.json "clinic" (EXPO_PUBLIC_FF_ROMAN_CHAT=true).
- Train tab: src/screens/client/WorkoutScreen.tsx, components/workout/WorkoutSyncCards.tsx, ui/empty-states/EmptyStateNoWorkouts.tsx
- Assigned workout: WorkoutAssignmentDetailScreen.tsx, ClientWorkoutViewerScreen.tsx, utils/workout/buildActiveWorkout.ts, hooks/useWorkoutBuilder.ts
- Live workout: ActiveWorkoutScreen.tsx, active-workout/{ExerciseCard,SetLogger,WorkoutFinishSummary,sessionQuality,ExerciseImage}.tsx,
  storage/activeWorkoutSession.ts, offline queue entry points, rest timer and rest-end alert
- History edit/delete: WorkoutHistoryEditScreen.tsx; backend src/workout/{controller,service,dto}.ts
- Routines: RoutineBuilderScreen.tsx (+ m#493 head); backend routines endpoints
- Exercise library/detail: ExerciseLibraryScreen.tsx, ExerciseDetailScreen.tsx, api/exerciseCatalog.ts (+ m#495 head); backend exercise-catalog
- Personal bests: sessionQuality.workoutSummary (finish dialog + summary only; no PB screen exists)
- Coach guidelines (Train header icon): CoachGuidelinesScreen.tsx; backend src/coach/coach.controller.ts
- Workout reminders: backend src/engagement/workout-reminder.{service,policy}.ts; mobile push routing (services/pushNotifications.ts)
- Entry from Home: HomeScreen.tsx onContinue / workoutLabel
- Entitlement gate wrapping every Train screen: entitlements/{ProtectedScreen,EntitlementProvider}.tsx (traced only for how it affects training)

Open PRs touching these files, judged at their heads (not re-reported):
- m#495 ed9dbbe1 (DES-AH, exercise library + detail, presentation only; does not change the data source)
- m#493 89449237 (DES-AI, routine builder, presentation + picker loading/error states; mergeable_state=dirty)
- m#485 ea0c96ea (DES-AE, assigned-workout viewer + history edit; viewer now says "reps / sec"; detail screen not touched)
- m#507 0cd0e8ee (DES-BA, notification/app preferences incl. workout-reminder toggle)
- m#264/#265 (custom-exercise composer, coach side, flag off) — not in area.

Production facts (aggregate SELECT, 14:40): ExerciseCatalogItem = 0 rows (0 with video); WorkoutRoutine templates = 0;
CoachGuideline = 0; 3 users, 1 workout, 5 assignments.

## (1) B list

B1 — The live workout is torn down every time the app returns to the foreground; offline it becomes a paywall.
- Story: a paying client mid-workout glances at a text or changes the song and comes back to "Resume workout?" with a destructive
  "Start Fresh" first, or, with weak gym signal, to "Choose a Plan — Select a coaching package to access this feature", and cannot
  finish or save the workout until signal returns.
- Why: EntitlementProvider.tsx:130-139 re-checks entitlement on every inactive/background -> active transition (iOS Control Center and
  notification banners count) and :82 sets status 'checking'; ProtectedScreen.tsx:39-48 renders a spinner INSTEAD of children for
  'checking', so ActiveWorkoutScreen (ClientNavigator.tsx:160,449, withProtectedScreen) unmounts; on remount ActiveWorkoutScreen.tsx:288-386
  finds the persisted session and shows the Resume/Start Fresh alert (rest timer lost). A network failure sets 'unavailable'
  (EntitlementProvider.tsx:85-90) and ProtectedScreen.tsx:51-110 shows the coach-managed/paywall copy to a client who is paid up.
  The same gate wraps the food Log, so FW-FOOD sees the same thing.
- Smallest fix (T4 entitlement gate, Claude Opus 5.5): in ProtectedScreen keep rendering children while status is 'checking', and
  while 'unavailable' if this session already confirmed 'active' (keep a lastConfirmedActive ref in EntitlementProvider and expose it).
  Server-side ClientEntitlementGuard still 402s every paid call, so nothing leaks; first-load fail-closed behaviour is unchanged.
  Tests: foreground re-check keeps the ActiveWorkout subtree mounted; transport error after a confirmed active keeps children; first
  fetch failing still shows the gate. ~120 lines incl. tests. Cross-area: FW-MONEY owns these two files; route one job, not two.

No other B. Data persists (server save + local queue + AsyncStorage recovery), delete/edit are ownership-checked server-side
(workout.service.ts:121-200), nothing private is shown to another person in this area.

## (2) U list
U1 — "Coach guidelines" icon on the Train tab is dead for every client. WorkoutScreen.tsx:670-678 -> CoachGuidelinesScreen.tsx:36-50 ->
  GET /coach/my-guidelines, which is inside the class-level CoachGuard (backend src/coach/coach.controller.ts:14-15, 189-192; pinned in
  test/roles-enforced.spec.ts:76). Every student gets 403 and sees "Could not load guidelines" + raw "Request failed with status code
  403" + a Retry that loops. Guidelines a coach writes (POST /coach/guidelines/:client_id) can never reach the client.
  Fix: serve the client read from a client-accessible route (e.g. GET /client/guidelines with JwtAuthGuard + @Roles('student'),
  same service call scoped to req.user.id), point coachApi.getMyGuidelines at it; until deployed, hide the icon. Privacy-scoped read -> Opus.
U2 — Exercise library is empty in production. ExerciseLibraryScreen.tsx:102 lists GET /exercise-catalog; ExerciseCatalogItem has 0 rows
  (scripts/seed-exercise-catalog.ts was never run), so the Train header library icon opens "No exercises match." with no filter set.
  The coach builder and the in-workout picker use other catalogs (seed library / local SQLite), so they work.
  Fix (needs operator/owner): run the idempotent metadata seed once (production write), or switch the list to exerciseLibraryApi.search
  (the seed proxy that already answers in prod) after m#495 merges. Recommended default: run the seed (no code, no CI).
U3 — Live-workout "Watch video" button opens "Exercise not found." for every Quick Workout and routine exercise. ExerciseCard.tsx:66-74 ->
  ActiveWorkoutScreen.tsx:654-673 sends exerciseId, which is 'ex_<random>' (db/workoutDb.ts:348-356 seed ids) or 'routine:<id>/<slug>'
  (utils/workout/exerciseId.ts); neither resolves in /exercise-catalog (empty) nor the seed library. Coach-assigned 'seed:' ids do resolve.
  Fix: render the button only for ids the detail screen can resolve (seed:/catalog uuid), or resolve by name against the seed library.
U4 — Weight unit is fixed to lb across training while Preferences offers metric "Display units" (PreferencesScreen.tsx:284-295). A
  metric client types kg into "Weight (lbs)" and the coach sees lb. Labels also disagree: "Weight (lbs)" ExerciseCard.tsx:110,
  "Weight (lb)" WorkoutHistoryEditScreen.tsx:70, "lbs" WorkoutScreen.tsx:144,877,881 and WorkoutAssignmentDetailScreen.tsx:213,
  "lb" WorkoutFinishSummary.tsx:34,62, Roman readback "pounds" (lib/roman/copy.ts:317,323). Short-term fix: one "lb" label everywhere;
  real fix is NEW item P3.
U5 — Coachless copy promises a coach. ActiveWorkoutScreen.tsx:1062-1065 "will be sent to your coach automatically";
  WorkoutSyncCards.tsx queued notice "will be sent to your coach"; WorkoutScreen.tsx:541 "removed ... from what your coach sees".
  Fix: coach_id-driven variants ("will be sent once the phone is back online").
U6 — Timed exercises read as reps. Coach enters "Reps / sec" (CoachWorkoutBuilderScreen.tsx:1881); client detail says
  "3 sets × 30 reps" (WorkoutAssignmentDetailScreen.tsx:212) and the live logger's column is "Reps". m#485 fixes only the viewer list
  ("reps / sec"). Fix: same wording on the detail screen.
U7 — Home "Start <plan name>" does not start it. HomeScreen.tsx:226,310-314 navigates to the Train tab root; the client then taps the
  coach card (cross-tab into More), then Start (cross-tab back). Fix: navigate straight to WorkoutAssignmentDetail (or ActiveWorkout with
  resume:true for "Resume workout"). File may collide with DES-K2 (check before launch).
U8 — Roman readback mid-workout says "0 pounds, 10 reps." on bodyweight sets (ActiveWorkoutScreen.tsx:1242 + copy.ts:323), and adds
  a second voice element to the busiest screen. Fix: omit weight when 0 ("10 reps."), or show the card only after weighted sets.
U9 — First-day workout reminder says "Everything is laid out and ready when you are." (backend engagement/workout-reminder.policy.ts:139-140)
  even when nothing is assigned and no routine exists (decideReminder sends firstDay regardless, :119-131,152). Fix: "Your first session is
  today." without the claim when the client has no assignment that day.
U10 — Completed coach workouts are unreachable with 0 or 1 pending. ClientWorkoutViewer (the only list with "Completed") is opened only
  when 2+ are pending (WorkoutScreen.tsx:598-615). Fix: a quiet "All coach workouts" row whenever any assignment exists.
U11 — Calm-luxury misses on the two most-used training screens (no DES job owns the Train tab visual pass; DES-V did copy only):
  Train tab cards with surface fills and borders, flash icon tile, 8-9 pt chart text (WorkoutScreen.tsx:921-955), Title Case
  ("My Routines", "Quick Workout", "Training Volume"); live picker uses category-coded muscle colours incl. red for chest
  (ExerciseImage.tsx:23-26, ActiveWorkoutScreen.tsx:1361-1369); Title Case alerts/buttons "Finish Workout?", "Start Fresh",
  "Add Exercise", "Add Set" (ActiveWorkoutScreen.tsx:335,753,1274; ExerciseCard.tsx:132).
U12 — Muscle Breakdown never counts coach workouts: buildActiveWorkout.ts:34-45 sets no muscleGroup, so they save as full_body and the
  six rows show "–" after a week of coach-assigned training. Fix: carry the seed library bodyPart into muscleGroup. (small)

C one-liners
- C (edge, deferred to 10k clients): un-ticking a set during a backgrounded rest leaves the scheduled rest alert until foreground.
- C (edge, deferred to 10k clients): "This Week" / volume windows use now-7d against date-only rows (day-boundary drift).
- C (edge, deferred to 10k clients): GET /coach/my-guidelines-equivalent should prefer the current coach's row if a client changes coach.
- C: "N workouts waiting" counts every future-scheduled program workout (true, but heavy on day 1) — see polish P5.

## (3) Dead-button table (mobile main f240af37)
| Screen | Element | Result | Verdict |
|---|---|---|---|
| Train tab | Exercise library icon | List of 0 rows, "No exercises match." | Dead in prod (U2) |
| Train tab | Coach guidelines icon | 403 -> error + looping Retry | Dead (U1) |
| Train tab | From your coach card | 1 pending -> detail; 2+ -> list | Works |
| Train tab | Quick Workout | Empty live workout | Works |
| Train tab | + / Create a routine | RoutineBuilder | Works |
| Train tab | Routine card / pencil | Starts routine / edits own routine (templates hide pencil) | Works |
| Train tab | History edit / delete / Show older | Edit screen / confirm + DELETE / toggle 50 | Works |
| Train tab | Resume card | ActiveWorkout resume:true | Works |
| Train tab error | Retry | Reloads | Works (but hides Quick Workout and Resume while offline) |
| Assignment detail | Start / Resume workout, Try again | ActiveWorkout via WorkoutTab | Works |
| Live workout | Watch video (play) | "Exercise not found." for quick/routine exercises | Dead for most (U3) |
| Live workout | Remove, up, down, swap, rest 60/90/120, Add Set, notes, Previous cell | Real effects | Works |
| Live workout | Add Exercise, search, muscle chips | Local 150-exercise list | Works |
| Live workout | Rest +30s / Skip | Real | Works |
| Live workout | Finish / Discard | Save (online or queued) / confirm discard | Works (until B1) |
| History edit | Cancel / Save changes | Discard confirm / PUT replace-all | Works (no delete-set or add-exercise) |
| Exercise detail | Retry | Re-fetch | Works; no "Add to workout" (P4) |
| Coach guidelines | Retry | 403 again | Dead (U1) |
| Home | "Start <plan>" | Opens Train root only | Mislabelled (U7) |

## (4) First-week polish (ranked)
P1 FIX — Keep the live workout alive across foreground/offline (B1). Highest value: every real gym session hits it.
P2 FIX — Train tab calm pass (U11 + U5 + U10): one hero (assigned workout if any, else Quick Workout as the single forest action),
   hairline rows, typography tokens, tabular numerals, charts only once data exists, coach_id-driven copy, "All coach workouts" row.
P3 NEW — Honour "Display units" in training: show and enter kg when metric, store lb as today (server columns are lb). Recommended
   default: YES, display-only conversion (no migration). Owner yes needed (changes what coaches see labelled).
P4 NEW — Personal bests and exercise history: a quiet "Personal bests" list (heaviest set per exercise from saved workouts, stated as
   "heaviest in your saved workouts") and "Add to workout" from exercise detail. Recommended default: YES for PB list; library add later.
P5 FIX — One-tap start from Home and the coach card (U7) and "Today" instead of "12 workouts waiting" when a program is assigned.
P6 FIX — Fix the two dead header icons (U1 backend route; U2 seed run) and the play button (U3).
P7 FIX — History edit can remove a mistaken set or exercise (today only values and notes can change). After m#485 merges.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs m#485 #493 #495 #507)
J1 TRAIN-GATE-128 — Claude Opus 5.5, T4 (entitlement gate), ~120 lines. Files: src/entitlements/ProtectedScreen.tsx,
   src/entitlements/EntitlementProvider.tsx, src/__tests__/protectedScreenFailClosed.test.tsx, src/__tests__/entitlementProvider.test.tsx
   (+ one new ActiveWorkout remount test). B1. Coordinate with FW-MONEY-128 (same files): launch once.
J2 GUIDE-READ-128 — Claude Opus 5.5, T3 (privacy-scoped read), backend ~120 lines + mobile 1 line. Files: backend
   src/coach/client-guidelines.controller.ts (new), src/coach/coach.module.ts, test/roles-enforced.spec.ts, new spec; mobile
   src/services/api.ts (getMyGuidelines path only). U1. Mobile must keep working against current prod: ship backend first, mobile after deploy.
   Tell DES-BD-127 (coach guidelines visual) that the screen's error copy shows raw axios text.
J3 TRAIN-LIVE-128 — GPT-6.1 Sol, T1/T2 mobile, ~200 lines. Files: src/screens/client/ActiveWorkoutScreen.tsx,
   src/screens/client/active-workout/ExerciseCard.tsx, src/screens/client/active-workout/ExerciseImage.tsx,
   src/screens/client/WorkoutAssignmentDetailScreen.tsx, src/utils/workout/buildActiveWorkout.ts (+ tests). U3, U5 (live copy), U6, U8,
   U11 (picker chips monochrome, sentence case), U12, one "lb" label in these files (U4 short-term). Starts after J1 merges
   (ActiveWorkout remount test lives in J1).
J4 TRAIN-TAB-128 — GPT-6.1 Sol, T1 mobile, ~350 lines. Files: src/screens/client/WorkoutScreen.tsx,
   src/components/workout/WorkoutSyncCards.tsx, src/screens/client/README.md (+ parity test). U5 (tab copy), U10, U11 (tab visual pass
   per A23 rules, parity table), "lb" label (U4 short-term). Keep both header icons; hide guidelines icon only if J2 is not live.
J5 REMIND-COPY-128 — GPT-6.1 Sol, T1 backend copy, ~40 lines. Files: backend src/engagement/workout-reminder.policy.ts,
   src/engagement/workout-reminder.service.ts (+ spec). U9.
J6 HOME-START-128 — GPT-6.1 Sol, T1 mobile, ~60 lines. File: src/screens/client/HomeScreen.tsx (+ test). U7. Check DES-K2-128 does not
   hold HomeScreen.tsx; if it does, fold into DES-K2.
Operator-only (no code): U2 — run backend scripts/seed-exercise-catalog.ts against production once (metadata upsert, idempotent) with
   the owner's yes; recommended default yes.
NEW (owner yes first): P3 units (after J3+J4, ~300 lines, Sol), P4 personal bests list (~250 lines, Sol).

## Cross-area (one line each, for the operator)
- FW-MONEY / FW-FOOD: B1 is the shared ProtectedScreen gate; the food Log unmounts and paywalls the same way on foreground/offline.
- FW-NOTIF: workout-reminder push for an assigned day lands on WorkoutMain, not the assignment (pushNotifications.ts:158; payload carries assignment_id).
- FW-ACCOUNT / FW-BODY: "Display units" is not honoured in training (U4); check body weight too.
- FW-COACH: coach-written guidelines never reach the client (U1).

## PRs
None (read-only auditor).

## Not fixed (needs operator)
- B1: src/entitlements/ProtectedScreen.tsx:39-48,51-110 + EntitlementProvider.tsx:82-90,130-139 — keep children on 'checking' and on
  'unavailable' after a confirmed active (J1, Opus).
- U1: backend src/coach/coach.controller.ts:14-15,189-192 — client read route outside CoachGuard (J2, Opus).
- U2: production catalog seed run (owner yes).

## HANDOFF
Audit complete at 14:47 PDT on mobile f240af37 / backend 675242fd. B=1, U=12. Next steps for a fresh agent: none in this lane; the
operator launches J1-J6 (J1 first, J3 after J1), asks the owner for the catalog seed run and the P3/P4 NEW items. Re-check U6 and U10
after m#485 merges, U2 copy after m#495 merges. Worktrees wt/FW-TRAIN-128-ro-* are detached read-only checkouts and can be left.

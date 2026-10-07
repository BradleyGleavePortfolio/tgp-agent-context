# AUD-FIN-TRAIN-129 — finish of the FW-TRAIN-128 audit (agent 129, read-only auditor)

Instance of AUD-FIN-129 (JOBS129.md). Started 16:05 PDT 10-07; report written 16:27 PDT and kept current.
Original audit: reports/FW-TRAIN-128.md (stopped 14:46). Unchecked list (STOPPED_HALFWAY.md section A): coach view of client
logs, Android back mid-workout, routine-delete wording. Nothing from FW-TRAIN-128 is repeated here.
Read on mobile main a1be6fb2 and backend main c3324d4a (wt/RO-*, re-fetched 16:08, match the operator's 15:56 check) and at the
open PR m#521 (TRAIN-GATE-128, agent128/train-gate-128) head 0b10156da508c37cba55a18f902ad97ab6cb953e (re-fetched 16:28).
Re-checked 16:28: mobile main is now e634d19e (m#506 #518 #519 #520 merged) and backend main fd190078 (b#857); none of them
changes any file cited below, so every line reference holds on the new mains.
Throwaway jest tests live only in my local worktree /home/user/workspace/wt/AUD-FIN-TRAIN-129-mobile (branch
agent129/aud-fin-train-129, never pushed, no commit). No PRs, no comments, no production calls, no SELECTs needed.

## TOP: B-candidate for m#521 (not on main) — iOS back swipe strands the live workout
REPRODUCED (jest render of the real @react-navigation/native-stack 7.17.5 view, file
wt/AUD-FIN-TRAIN-129-mobile/src/__tests__/zzAudFinTrain129NativeBack.test.tsx, 2/2 pass).
- Story: on an iPhone with m#521 merged, a client mid-workout swipes from the left edge (the normal iOS back gesture); the
  live workout slides away while the app still thinks it is open, so the client lands on the Train tab under "Log this
  workout?", and after "Keep training" the Resume card does not bring the workout back (only "Finish and log" or an app
  restart gets out).
- Why: m#521 guards leaving with a raw `navigation.addListener('beforeRemove', ...)` (ActiveWorkoutScreen.tsx:1156-1163 at
  0b10156d). native-stack only blocks the iOS swipe natively for `usePreventRemove`: NativeStackView.native.tsx:278 and :411
  (`preventNativeDismiss={isRemovePrevented}` from usePreventRemoveContext). ActiveWorkout has no `gestureEnabled: false`
  (ClientNavigator.tsx:449), so the iOS swipe is on.
- Shown by the test: raw listener -> `preventNativeDismiss=undefined`; after the native dismiss event the JS stack still holds
  ActiveWorkout and native-stack itself logs "The screen 'ActiveWorkout' was removed natively but didn't get removed from JS
  state. This can happen if the action was prevented in a 'beforeRemove' listener ..."; a following
  `navigate('ActiveWorkout', { resume: true })` (what the Resume card calls, WorkoutSyncCards.tsx:130) adds no screen
  (routes 2 -> 2). Same stand-in screen with `usePreventRemove`: `preventNativeDismiss=true`, the guard asks, no desync.
- Not proven: the exact on-device picture (needs one iOS simulator run). Data is safe either way ("Finish and log" saves).
- Android is NOT affected: native-stack handles Android back in JS (NativeStackView.native.tsx:369-374), so m#521's listener
  does stop Android back and asks.
- Smallest fix (inside m#521, T4 PR, its fixer; Opus): add `options={{ gestureEnabled: false }}` to the ActiveWorkout screen in
  src/navigation/ClientNavigator.tsx:449 (1 line; m#521 already edits this file), or swap the listener for
  `usePreventRemove(<state, not the ref>, ({ data }) => askBeforeLeavingRef.current(() => navigation.dispatch(data.action), true))`.
  Test: the throwaway test above, pointed at the real stack options. Must land before m#521 merges (iOS cut 23:00).

## (1) B list
None on main a1be6fb2 in the three unchecked areas. The one B-grade problem is the m#521 item above (open PR, not merged).

## (2) U list
U1 (coach view, REPRODUCED) Coach's Weekly tab shows no training volume for a week in which the Workouts tab shows it.
U2 (coach view, CODE-ONLY) Units on the coach's training screens disagree ("Volume (lbs)", "vol (lbs)", "lb").
Cross-area for AUD-FIN-FOOD-129 (REPRODUCED in the same test): the Weekly tab's calories ignore servings and protein is always 0 g.
Details in the two tables below.

## REPRODUCED findings (throwaway jest render tests, local worktree only, never pushed)
| # | Grade | Finding (one plain sentence) | Proof | file:line, handler, API path | Smallest fix |
|---|---|---|---|---|---|
| R1 | B-candidate (m#521 only) | See TOP: iOS edge swipe on the live workout desyncs native and JS stacks. | zzAudFinTrain129NativeBack.test.tsx: raw listener `preventNativeDismiss=undefined`, JS routes stay `[WorkoutMain, ActiveWorkout]`, native-stack desync error, Resume navigate 2 -> 2; `usePreventRemove` -> `true`, no error | m#521 ActiveWorkoutScreen.tsx:1156-1163; ClientNavigator.tsx:449; native-stack NativeStackView.native.tsx:278,411,595-602; no API | `gestureEnabled: false` on ActiveWorkout (1 line) or `usePreventRemove` |
| R2 | U | A coach opens a client's Weekly tab after a week of weighted sessions and reads volume "—" and "N/A", while the Workouts tab shows 3,375 lb for the same session. | zzAudFinTrain129CoachWeekly.test.tsx (2/2 pass): one real ExerciseSet row (3 x 5 @ 225 lb) -> Workouts tab "3375" + "3 sets · 225 lb x 5, ..."; Weekly `totalWeightMoved: 0`, renders "—" and "N/A" | mobile src/screens/coach/client-detail/useClientDetailData.ts:301-321 reads `ex.sets` / `set.completed` / `set.weight` / `set.reps`, which the server row does not have (backend prisma/schema.prisma:1008-1020: `sets_completed`, `reps_per_set[]`, `weight_per_set[]`); data from GET /coach/clients/:id/timeline -> CoachController.getClientTimeline (backend src/coach/coach.controller.ts:158) -> CoachService.getClientTimeline (`include: { exercises: true }`); shown at WeeklySummaryTab.tsx:79,81,108 | Compute weekly volume from `weight_per_set[i] * reps_per_set[i]` (or reuse `mapCoachWorkoutSessions`, utils/workout/workoutLogging.ts:153, as the Workouts tab does); ~15 lines + test |
| R3 | U (cross-area, food) | The same Weekly tab tells the coach 200 kcal and 0 g protein for a client who logged 2 servings of a 200 kcal / 30 g item (true: 400 kcal, 60 g). | same test: `totalCalories: 200`, `totalProtein: 0` | useClientDetailData.ts:290-299 (`meal.calories \|\| meal.food_item?.calories`, no `quantity_multiplier`; `meal.protein \|\| meal.food_item?.protein`, but FoodItem has `protein_g`, backend schema.prisma:937-940); same GET /coach/clients/:id/timeline | Multiply by `quantity_multiplier`, read `food_item.protein_g`; fold into the R2 job (same function) and tell AUD-FIN-FOOD-129 |
| R4 | check, no defect | Routine delete wording is true on main (m#493 merged 14:51): "Delete routine?" / "This cannot be undone.", Cancel first, Delete (destructive) calls DELETE only after confirm. | zzAudFinTrain129RoutineDelete.test.tsx (2/2 pass), logged `{"title":"Delete routine?","body":"This cannot be undone.","buttons":[["Cancel","cancel"],["Delete","destructive"]]}` | mobile RoutineBuilderScreen.tsx:200-217; DELETE /routines/:id -> WorkoutController (backend src/workout/workout.controller.ts:69) -> WorkoutService.deleteRoutine (workout.service.ts:262-272): owner check, hard delete in one transaction; WorkoutSession has no routine link (schema.prisma:991-1006), so past workouts stay | none |
| R5 | C | Back chevron ("Cancel routine") on a new routine with an exercise added leaves at once, no confirm (unsaved draft lost). | same RoutineBuilder test, 2nd case: `goBack` called once, no Alert | RoutineBuilderScreen.tsx:222 | C (not a core flow; nothing saved is lost) |

## CODE-ONLY findings (traced from code; no runtime proof)
| # | Grade | Finding | file:line, handler, API path | Smallest fix / owner |
|---|---|---|---|---|
| K1 | status (fixed by m#521) | Android back on the live workout on main leaves silently: no "log or save?" question (owner 15:03 asks for one). Nothing is lost: the session stays saved and the Train tab shows Resume with the running clock. | main ActiveWorkoutScreen.tsx: no `beforeRemove` / BackHandler; native-stack handles Android back in JS (NativeStackView.native.tsx:369-374) -> pop to WorkoutMain; session saved 500 ms after each change (:93, :470-500); Resume card WorkoutSyncCards.tsx:97-145 -> adoptPersistedSession :268-280 (clock from the saved start). No API (local key activeWorkoutSession:<userId>) | m#521 adds the listener + tab guard (ActiveWorkoutScreen.tsx:1124-1166, ClientNavigator.tsx tabPress, workoutLeaveGuard.ts at 0b10156d). Android works there; iOS needs R1 |
| K2 | U | Units on the coach's training screens disagree: Workouts tab "Volume (lbs)" next to "top recorded load (lb)", Weekly "vol (lbs)" / "N lbs". Extends FW-TRAIN U4 (client files only) to the coach side. | WorkoutsTab.tsx:126,154,161-162; WeeklySummaryTab.tsx:55,81,108,115 | One label "lb" in these two files, in the R2 job |
| K3 | decision | At m#521, with 1+ set logged, Android back, the back chevron and every other tab offer only "Keep training" or "Finish and log", so a client cannot open Messages or Food mid-workout without finishing (push taps still work: they do not remove the screen). | m#521 ActiveWorkoutScreen.tsx:1124-1149, :1156-1166; ClientNavigator.tsx tabPress guard | Operator/owner: default KEEP (matches owner 15:03 "ask ... to log/save"); alternative: a third, non-destructive "Leave it open" choice |
| K4 | works | Coach view of client workout logs works on main: Workouts tab = last 10 sessions with sets, weights, reps, notes, duration; Timeline lists each workout; edits/deletes from the client show (same rows); assignment completion updates only the assignment (no duplicate session) and Program history shows "N of M workouts done"; reads are consent-gated. | GET /coach/clients/:id/summary -> CoachController.getClientSummary (coach.controller.ts:184) -> CoachService.getClientSummary (coach.service.ts:556-660, `flags.workouts`, `take: 10`); mobile useClientDetailData.ts:101-108 + workoutLogging.ts:153-213 + WorkoutsTab.tsx; PATCH /assignments/:id/complete -> WorkoutBuilderService.completeAssignment (workout-builder.service.ts:819+); ProgramHistoryScreen.tsx:76-77,189-190 | none |

C one-liners
- C: `mapCoachWorkoutSessions` drops `rpe`, so the coach's "RPE n" line (WorkoutsTab.tsx:136) never shows; the client app records no RPE today.
- C (edge, deferred to 10k clients): coach lists date a workout by `created_at` (sync time) before `date`, so an offline workout synced the next day shows on the sync day (workoutLogging.ts:156, useClientDetailData.ts:304).
- C (edge, deferred to 10k clients): on main the save after a set tick waits 500 ms and nothing flushes it on unmount (ActiveWorkoutScreen.tsx:93, :495-500; flush only on background, :430-440), so Back within half a second of a tick can drop that tick.
- C (edge, deferred to 10k clients), m#521: duration is the uncapped wall clock (ActiveWorkoutScreen.tsx:733 at 0b10156d) and the 12-hour stale prompt is gone, so a workout abandoned yesterday and finished today saves many hours.
- Already handled elsewhere: "shared workouts" wording when sharing is off (LN-SOL-B-128 on m#479).

## Proposed fix jobs (file-disjoint from CLIENTFIX-128 claims and from each other)
| job | model / tier | files | covers | size |
|---|---|---|---|---|
| (into m#521, not a new job) TRAIN-GATE iOS swipe | Claude Opus 5.5, T4 (m#521's fixer / FIX-OPUS lane) | src/navigation/ClientNavigator.tsx (ActiveWorkout `gestureEnabled: false`) + one test (pattern: zzAudFinTrain129NativeBack.test.tsx) | R1 | ~40 lines |
| COACH-WEEKLY-129 (new) | GPT-6.1 Sol, T1 mobile | src/screens/coach/client-detail/useClientDetailData.ts (loadWeeklySummaries only), src/screens/coach/client-detail/WeeklySummaryTab.tsx (labels), src/screens/coach/client-detail/WorkoutsTab.tsx (labels only), new src/__tests__/coachWeeklyTotals129.test.tsx | R2, R3 (with AUD-FIN-FOOD-129's agreement), K2 | ~80 lines |
No CLIENTFIX-128 row claims these coach client-detail files (checked reports/ for useClientDetailData / WeeklySummaryTab / WorkoutsTab).

## Cross-area (one line each)
- AUD-FIN-FOOD-129 / FW-FOOD: coach Weekly calories ignore servings and protein is 0 g (R3), useClientDetailData.ts:290-299.
- m#521 lenses (Opus + Sol): R1 (iOS swipe) and K3 (no "leave it open" choice) at head 0b10156d.

## PRs
None (read-only auditor). No pushes, no comments.

## Not fixed (needs operator)
- R1: route to m#521's fixer before m#521 merges: ClientNavigator.tsx:449 `options={{ gestureEnabled: false }}` (or `usePreventRemove`).
- R2/R3/K2: launch COACH-WEEKLY-129 (Sol, T1).
- K3: owner/operator decision, default keep.

## HANDOFF
Done 16:30 PDT. All three unchecked items of FW-TRAIN-128 are closed:
- Coach view of client logs: works on main (K4), except the Weekly tab totals (R2 volume, R3 food) and unit labels (K2):
  job COACH-WEEKLY-129 (Sol, T1, ~80 lines), files above.
- Android back mid-workout: main leaves silently with nothing lost (K1); m#521 asks first and works on Android. Its iOS edge
  swipe is not blocked natively (R1, B-candidate for m#521): route the 1-line `gestureEnabled: false` (or `usePreventRemove`)
  fix to m#521's fixer before it merges; then one iOS simulator swipe confirms.
- Routine-delete wording at main (m#493 merged): true (R4), no fix.
Open decision: K3 (no "leave it open" choice in m#521's question), default keep.
Throwaway tests (do not push; leave in place): wt/AUD-FIN-TRAIN-129-mobile/src/__tests__/zzAudFinTrain129CoachWeekly.test.tsx,
zzAudFinTrain129NativeBack.test.tsx, src/screens/client/__tests__/zzAudFinTrain129RoutineDelete.test.tsx. Run one with
`cd /home/user/workspace/wt/AUD-FIN-TRAIN-129-mobile && /home/user/workspace/ops/heavy.sh npx jest <file>`. A fixer may copy
them into a PR as failing-first tests. Nothing else in this lane.

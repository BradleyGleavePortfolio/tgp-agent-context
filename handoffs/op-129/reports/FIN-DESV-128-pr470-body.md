Tier: T2
Why: Makes client copy truthful and moves first-day Train actions ahead of empty charts without changing access or payment logic.
T4 trigger scan: none; privacy text reads existing consent state only, with no grant/revoke or access-control changes.
T3 trigger scan: none; no backend contract, durable data format, or dependency change.
Bounded T1: NO; a real routine CTA and state-dependent privacy copy change behaviour.
Canonical builder: GPT-6.1 Sol
Parent owner: TGP operator agent 128
Acceptance evidence: failing-first render tests in quietLuxuryDoctrine.test.ts; existing Day-1, wearables, fasting and Progress render tests; required CI.
Promotion triggers: any change to consent writes/enforcement, money, authentication, or persistent data.

## What changes for coaches/clients
Train starts with assigned work, Quick Workout, routines and history. Both charts remain, below history; empty charts become one sentence. The empty routine section has a working Create a routine link. Progress keeps its number and share button and names what is counted. Profile removes invented progress and reads real sharing permissions. Report keeps advice but labels it general. Day-1 and unavailable-feature copy stop making promises.

No restyle, dependency, lockfile, token, App.tsx or navigation changes. The longer factual weigh-in label sits immediately below the header so it cannot crowd out Share/Report. Production API compatibility is preserved; unavailable sharing reads suppress reassurance rather than invent access. Round 3 describes only what is shared with the assigned coach; no absolute “only to you” promise remains. Coachless clients have no sharing sentence. Confirmed `owner_access` retains the owner-coach visibility line; missing/nonboolean access suppresses uncertain scope statements. The read clears stale text and reruns whenever Profile regains focus after Settings.

Minimal shared-file exceptions required to complete the named rows: NotificationsScreen.tsx adds a user read and switches one translation key for the paired/unpaired title (3 added/1 deleted lines). Three existing test files update five assertions pinned to retired empty-state/wearables wording. No other builder-owned implementation file is changed.

## B/U user stories
- B16/19/20: A new client opens Train or Profile and sees invented coach activity, progress or privacy claims; neutral copy and confirmed sharing state replace them.
- B22: A client whose weight chart fails is promised an automatic retry that does not occur; the line now names the chart and explicit refresh action.
- B25/27/28/30: A coachless client starts onboarding or connects health data and sees unmeasured setup times, unsupported alert/health-availability claims or an unevidenced morning recommendation; instructional copy replaces them.
- U39: A scheduled fasting alert overstates what was measured; the existing early-end cancellation remains and the alert now names the planned window.
- U17/18: A first-day client meets empty stats/charts before starting training; stats wait for workouts and charts move below all existing actions.
- U21: A client cannot tell what the Progress count means; the number/share explicitly count consecutive days with weigh-ins.
- U23/24: A client reads canned advice as personal analysis; the guidance stays under its general heading and the slogan is removed.
- U26/29: Onboarding first-person server/button wording becomes neutral while connection, pairing, skip and Home actions stay.

## Routes/actions before -> after
Every working action retains its target/effect and tap count. Child surfaces not changed by this PR retain their existing tests.

| Surface / action before | After / target or effect |
|---|---|
| Train: Exercise library | Same -> ExerciseLibrary |
| Train: Coach guidelines | Same -> CoachGuidelines |
| Train: assigned workout / assigned list | Same -> MoreTab / WorkoutAssignmentDetail with assignmentId, or ClientWorkoutViewer |
| Train: PlanExplanationCard and sync-card actions | Same child components, props and handlers; sync completion still reloads |
| Train: Retry; pull to refresh | Same loadData and assignment refresh |
| Train: Quick Workout | Same -> ActiveWorkout, empty exercise list |
| Train: + routine | Same -> RoutineBuilder |
| Train: empty-state passive copy | False coach/session promise removed (rule 1); Create a routine added -> RoutineBuilder |
| Train: routine; Edit routine | Same -> ActiveWorkout with routine payload; RoutineBuilder with routineId |
| Train: Edit workout; Delete workout / Keep / Delete confirmation | Same -> WorkoutHistoryEdit; same confirmation and DELETE handler |
| Train: Show older workouts / Show recent workouts only | Same full/recent history toggle |
| Train: stats and both charts | All real information retained; stats hidden only before any workout; no coach label without a linked coach; charts moved lower, not removed |
| Progress: Share streak | Same -> ShareCard; value retained; label now days in a row with a weigh-in, 60+ at the look-back cap |
| Progress: View progress report | Same -> Report |
| Progress: 7D, 30D, 90D, All | Same selected chart period |
| Progress: chart Retry; pull to refresh | Same explicit retry and reload handlers |
| Progress: Log weight; pounds; notes; Save; Close | Same modal, inputs, weightApi.log and close |
| Profile: Settings; My Report; Widgets; Learn | Same -> Settings / Report / Widgets / Learn |
| Profile: return from Settings | Existing route preserved; sharing text clears and refreshes on focus |
| Profile: Edit personal info; every personal-info row | Same -> EditProfile; analytics retained |
| Profile: milestone list actions | Same MilestoneCabinet child and props |
| Profile: Sign Out; Cancel; confirm Sign Out | Same confirmation and signOut handler |
| Profile: fixed Day 7 line | Removed under rule 1: no real progress data supported it |
| Profile: global exclusive-access sentence | Removed under rule 1: platform-owner access means it was false; assigned-coach sharing remains state-driven |
| Report: Back; advice; report numbers | Same goBack; advice/metrics remain |
| Report: slogan | Removed under rule 1: not analysis of the client's data |
| Day-1: Welcome Get started; Back | Same -> CoachPairing / previous screen |
| Day-1: Pair with my coach; I don't have a code yet; code field; Retry | Pair with coach / Continue without a code; same pairing, validation, skip and retry |
| Day-1: goal selection; Continue; Skip | Same selection/save -> Notifications |
| Day-1: notification enable; Not now; denied Continue; Back | Same OS permission/save, skip, continue -> CheckInTime and previous screen |
| Day-1: hour/minute increment/decrement; AM/PM; Save; Skip; Retry; Back | Same time selection/save -> Ready and previous screen |
| Day-1: Open my dashboard | Open Home; same completion/cache/root navigation |
| Wearables: disabled import/cloud connection messages | Neutral unavailability text; action dispositions unchanged |
| Fasting: Start; End; Keep going; End anyway; protocol; history; refresh | No FastingScreen change; existing early-end cancel verified; scheduled notification payload retains type |

## Test stage
Opening head `110f9f74c583d2b4b260f964814ad85be8cd41db` passed 666 suites / 8,835 tests and CodeQL; its [opening READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/470#issuecomment-6044287703) is historical, superseded by the two requested privacy fixes.

Round 2 fixes only the two audit Bs: owner-coach visibility and stale Profile reassurance after Settings. New regressions cover true/false/missing/nonboolean `owner_access`, and Profile → Settings → Profile with a pending read. Test-first head `95a99d8853937484586b79d2904b7a0c61f2c63f` retains the original implementation: lint/typecheck passed; exactly the four owner/unknown-state/focus regressions failed, with 8,779 other tests passing. [Failing-first proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37668408034).

Historical round-2 head `ec5dc175594a181586002aac2b89f72edb839afa` was **437 changed lines** (326 additions / 111 deletions). [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37668523999) passed **672 suites / 8,888 tests** and all [CodeQL checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37668523949) passed, but both lenses requested B1's correction. [Round 2 READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/470#issuecomment-6044741582) is superseded. No consent writes or access-control change.

## Round 3 truthful sweep

B1 is bounded to Profile's false exclusive-access statement, identified by both [Opus](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/470#issuecomment-6044790193) and [Sol](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/470#issuecomment-6044805115). No coach means no sharing sentence; a normal coach's four workout/meal grant combinations are named as shared/not shared with that coach. Confirmed owner-coach access retains “visible to you and <coach>”, without excluding anyone else. Unknown access and focus-refresh suppression remain. All existing routes and effects are retained; README now documents the actual Profile surface. No permission-policy change.

Failing-first regression commit: `9ac9b873c67cb344c0d65dac55f743165a5942ef` changes only rendered expectations against the unchanged Profile implementation. [Test-first CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680449505/job/112994799386) passed lint/typecheck and failed exactly the seven Profile regressions, with 678 other suites / 8,928 tests passing. A tests-only CI push was used because shared local dependencies were not ready; this is not a READY head.

Completed round-3 head: `e0ba7662b752e0f60e4f26a33a281f3ae46d7110`, **455 lines** (+342/-113). [Exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681524974/job/112998506378) passed lint/typecheck and **679 suites / 8,935 tests**; all [CodeQL checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681524798) passed. After the shared dependency install finished, targeted local `quietLuxuryDoctrine.test.ts` passed **30/30** through the shared heavy-command lock at this unchanged head.

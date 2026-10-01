# Lane S-MWB — Master Workout Builder "Programs" library (owner, 2026-10-01 11:31/11:32 PDT) — T3 (promote to T4 if auth/RLS/consent touched)

Builder: read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it.

## Owner intent (verbatim)
"I want a non-client specific, overreaching master workout builder system - think 'I give every male an intro package, let me build it once, save it, and use it for everyone + auto-assign tools'". MWB templates, autosave/undo and named regimes must be live on day 1 (clinic go-live Wed 10-07; App Store binary Sat 10-03, OTA after).

## What exists (operator survey 11:45 PDT)
- Backend merged June, flags OFF on Fly: MWB-1 data model (#376: WorkoutProgram {name, description, weeks, days_per_week, is_template, goal_tag, visibility, forked_from_id, is_regime, regime_display_name, revisions}; WorkoutPlan rows carry program_id/week_index/day_index), MWB-2 templates + clone-to-client + sub-coach scope (#381, FEATURE_MWB_TEMPLATES), MWB-3 autosave + undo + revision prune (#386, FEATURE_MWB_AUTOSAVE_UNDO), MWB-5 AI live-create (#385, FEATURE_MWB_AI_LIVE_CREATE — client-specific, needs R2b consent enforcement; OUT of this lane), named regimes (`/coach/regimes`, FEATURE_NAMED_REGIMES).
- Routes: `/workout-plans` CRUD + `/:id/exercises` + `/:id/assignments`; `/workout-programs/:id/{fork,clone,clone-to-client,assignments}`; `/assignments/me|:id|:id/complete`; `/coach/regimes`. Verify whether list/create/update/get for programs (templates) exist; add the minimal missing endpoints in a backend PR (tenancy, RLS, roles, idempotency per existing patterns).
- Package contents already support asset_type `workout_program` and fan out on purchase/grant (`src/packages/package-contents.service.ts`, `purchase-fanout.service.ts`, `asset-resolvers/workout.resolver.ts`) → "attach a program to a package = auto-assigned when a client joins". Confirm this also fires for $0 grants from invite codes (#595 path) — if not, report (do not edit #595's branch; propose follow-up).
- Mobile: `CoachWorkoutBuilderScreen` (single plan, autosave behind EXPO_PUBLIC_FF_MWB_AUTOSAVE) opens only from one client's page; coach "Templates" tab (`ProgramTemplatesScreen`) is four hard-coded text protocols applied as guidelines — replace it.
- Clinic: #607 materializes the 3 seeded clinic masters into client clones via a rule table; do not break that path.

## Deliver (Phase 1, day 1)
1. Coach tab "Programs" replacing "Templates": my programs list (search, goal tag, weeks x days, assigned count), create program (name, goal, weeks, days/week, description), program editor (week/day grid; each day opens the existing workout builder with autosave + undo), duplicate, archive, revision history (read-only), promote to named regime if FEATURE_NAMED_REGIMES.
2. Assign to many: multi-select clients → clone-to-client per client with start date; progress + per-client result; idempotent.
3. Auto-assign via packages: from a program, "Add to package" (and from the package contents screen, pick a program) so every client who joins the package gets it automatically; show which packages include the program.
4. Standalone workouts library: list a coach's saved workout plans (non-client), open/edit/duplicate, assign.
5. Flags: backend FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO, FEATURE_NAMED_REGIMES expected ON at day 1 (operator flips through fly-env-sync); mobile EXPO_PUBLIC_FF_MWB_AUTOSAVE + a new EXPO_PUBLIC_FF_PROGRAMS_LIBRARY ON in eas.json `clinic` profile (do not change other flags). Honest empty/unavailable states when a route 404s.
6. Exclusions: client booking/Calendar (S-SCHED), consultation onboarding (#310), wearables (#317), money screens (S-MONEY), report/block (#314), TrustCenter (#315). Coordinate with S-REACH (another builder is wiring orphan routes; do not edit the same navigator lines — keep Programs changes in CoachNavigator tab definition + new files; if conflict, rebase).
7. Tests: navigation + flag gating, editor grid, assign-to-many idempotency, package attach, backend endpoint tests (tenancy, sub-coach scope, RLS live tests if new tables), tsc/eslint/jest targeted, CI green.

## Phase 2 (report only, do not build): coach-defined auto-assign rules ("when a client joins package X and matches intake answers Y, assign program Z starting next Monday"), generalizing #607's clinic rule table. Write a design note with data model, matching on which intake fields (health-adjacent → T4 + D2 implications), and UI sketch.

## Report
Final answer + /home/user/workspace/ops/lanes/S-MWB_REPORT.md: PR URLs, heads, screens, endpoints added, flags, tests, CI, open risks, Phase 2 design note path.

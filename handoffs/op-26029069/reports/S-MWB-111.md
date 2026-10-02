# S-MWB-111 — coach "Programs" master workout builder, Phase 1 (builder lane, agent 111)

Started 2026-10-02 09:35 PDT. Backend base main b9ee8e0a, mobile base main e3986e89.
Worktrees: /home/user/workspace/wt/s-mwb-be (agent/clinic/s-mwb-programs-be), /home/user/workspace/wt/s-mwb-mob (agent/clinic/s-mwb-programs-mob).

## MIGRATION PREFIX CLAIM (operator please confirm)
I need ONE additive migration on WorkoutProgram (client linkage + delivery idempotency key). Per the brief the next free prefix is
20270223000000; no open PR uses it (checked every open backend PR's file list at 09:50 PDT). I am using
`20270223000000_mwb_program_delivery`. If the operator assigns a different prefix I rename the folder (no other change).

## Recon (read-only, backend main b9ee8e0a + mobile main e3986e89)

What exists (June MWB):
- MWB-1 (#376): WorkoutProgram / WorkoutPlan(program_id, week_index, day_index) / revisions / assignment snapshots.
  Routes: `POST /workout-programs/:id/fork`, `/clone`, `/assignments` (fan-out assign from start_date, one Idempotency-Key),
  `/workout-plans` CRUD + `PUT :id/exercises` + `:id/assignments`. Pro-tier SubscriptionGuard on /workout-programs.
- MWB-2 (#381): `POST /workout-programs/:id/clone-to-client` behind FEATURE_MWB_TEMPLATES (MwbTemplatesFeatureGuard, 404 when off),
  Serializable + advisory lock.
- MWB-3 (#386): `PATCH /workout-plans/:id/autosave`, `POST /workout-plans/:id/undo {to_revision_index}` behind
  FEATURE_MWB_AUTOSAVE_UNDO (+ MWB_AUTOSAVE_LOCK_TOKEN_SECRET), revision prune cron.
- F2 named regimes (#385): `/coach/regimes` list / revisions / promote-from-program / rename / archive behind FEATURE_NAMED_REGIMES.
- Packages: `workout_program` is an allowed CoachPackageContent asset_type; PurchaseFanoutService.onPurchaseEntitled seeds drops and
  materialises due-now drops inline. VERIFIED: $0 invite grants and free-package claims call it (InviteGrantService.deliver,
  entrypoint `invite_grant` / `free_package_claim`), so whatever a package contains is delivered on $0 grants too.

Gap list (before coding):
- G1 (blocker) No program library API at all. WorkoutProgram rows can only be created by fork/clone, the AI materialiser or #607's
  seed. Missing: create, list (search, goal tag, weeks x days, assigned count), get with the week x day grid, edit metadata,
  set/clear a day, copy a saved workout into a day, duplicate, archive/restore, program revision history for non-regimes.
- G2 (blocker for bulk assign) `cloneProgramToClient` duplicate probe is keyed on (master, coach), not (master, client): the
  second client of the same master gets 409 "A clone of this program for this client already exists". Clones carry no client link.
- G3 (blocker, money-adjacent) "Add to package" for a program does not work: `PackageContentsService.assertAssetOwnedByCoach`
  looks the `workout_program` asset_id up in WorkoutPlan (404 ASSET_NOT_FOUND for a real program id), and
  `WorkoutAssetResolver` calls `assignPlan(asset_id)` (a single plan). A program id in a package would throw inside the
  purchase/grant transaction and roll back the purchase fan-out ($0 grant -> `failed`). Regimes list already counts
  attachments by WorkoutProgram id, so the intended contract is "asset_id = WorkoutProgram id".
- G4 No bulk assign (many clients, start date, per-client result).
- G5 `GET /workout-plans` mixes program-day plans with standalone saved workouts; no way to reuse a saved workout in a program day.
- G6 Mobile: Templates tab = four hard-coded text protocols (ProgramTemplatesScreen posts free-text guidelines). The single-workout
  builder (CoachWorkoutBuilderScreen) is registered only in ClientsStack. Undo: #253 (June) is not on main; #262 (R81 rebuild)
  open and stale since 2026-06-15. Backend undo route exists.
- G7 Mobile ContentAttachForm asks the coach to type a raw asset id (no picker).
- G8 Sub-coaches: `getPlan` requires plan.coach_id === caller, so sub-coaches cannot open program days. Phase 1 = head coach/owner.
- G9 #607 (open): rule table masters are is_template=true WorkoutPrograms owned by the coach; they will appear in the library.
  #607 clones via its own writeProgramTree + `writeProgramAssignmentsInTx` (adds to workout-builder.service.ts and reformats the
  whole file). To stay conflict-free my code lives in NEW files and does not touch workout-builder.service.ts. When #607 merges,
  archiving a master referenced by ClinicProgramSet must be refused (ClinicProgramSet is not on main yet) — follow-up noted.

(Build log, PRs and manifest entries appended below.)

## Backend PR #640 (10:25 PDT) — T4 — head 2ac6395f
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/640 (base main b9ee8e0a). Migration 20270223000000 confirmed by operator.
- /api/v1/coach/programs library API (FEATURE_MWB_TEMPLATES), bulk assign, unassign, saved workouts, revisions, assignees.
- ProgramDeliveryService (unique delivery_key, advisory lock, in caller tx) used by bulk assign and package delivery.
- workout_program package content = master WorkoutProgram id (authoring check + resolver delivers whole program in the purchase/$0 grant fan-out tx).
- Tests: 8 targeted suites pass; tsc clean; R75 range check OK. CI: pending at push.
- Manifest entries needed (#637, do not edit): FEATURE_MWB_TEMPLATES=true; FEATURE_MWB_AUTOSAVE_UNDO=true with
  MWB_AUTOSAVE_LOCK_TOKEN_SECRET (secret, 32+ random bytes hex); FEATURE_NAMED_REGIMES=true.
- Operator decision flagged: library routes are NOT tier-gated (parity with /workout-plans); June /workout-programs routes keep
  SubscriptionGuard pro. Recommended default: keep ungated for launch.

## Mobile PR #328 (10:50 PDT) — T3 — head 0bd9e21
https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/328 (base main e3986e8).
- EXPO_PUBLIC_FF_MWB_PROGRAMS (new, default off, registered in config/expected-env.json): Programs tab replaces Templates
  (route name kept; flag off = legacy screen).
- Screens: library (search, goal chips, active/archived, live counts), saved workouts, editor grid (weeks x 7) -> existing
  CoachWorkoutBuilder registered in the stack, fill day blank/saved/copy, clear, edit details (expected_version), duplicate,
  archive/restore, history + assignees (unassign), promote to regime, bulk assign (chunks of 50, per-client results, retry
  failed with same key), add to package (incl. $0); ContentAttachForm program/saved-workout picker (flag on).
- Error copy per backend code; unknown -> reference + Contact support (SupportInbox registered) + Sentry.
- eas.json clinic profile: EXPO_PUBLIC_FF_MWB_PROGRAMS=true, EXPO_PUBLIC_FF_MWB_AUTOSAVE=true (operator decision; drop hunk to ship dark).
- Tests: 7 targeted suites / 86 tests pass; tsc exit 0; eslint 0/0; banned-cast grep clean.

## CI (10:55 PDT)
- Backend #640: all checks pass incl. Schema parity, forward migrations, reversible migrations, R75, mwb-3-live-tests,
  rls-live-tests, build-and-test, CodeQL — EXCEPT shellcheck (scripts/*.sh): pre-existing SC2015 in
  scripts/s10-core-diff-gate.sh (file not touched by this PR).
- Mobile #328: CodeQL + Analyze pass; Typecheck/lint/test pending at report time.

## Open gaps
1. Mobile builder undo button: backend undo route exists (FEATURE_MWB_AUTOSAVE_UNDO) but useAutosave has no API to adopt the
   post-undo head index + lock token (next autosave would 409 -> "conflict"). Needs a hook + builder follow-up (#262 stale).
2. Sub-coaches can view/assign team programs but cannot open day workouts (backend getPlan head-coach only; unchanged).
3. Legacy MWB-2 clone-to-client probe keyed (master, coach) not client (route flag-gated, unused by mobile) — not fixed to
   avoid #607 conflict in workout-builder.service.ts.
4. After #607 merges: refuse archiving a master referenced by ClinicProgramSet.
5. Library routes not tier-gated (parity with /workout-plans) — operator decision.
6. Program push deep link 'tgp://workouts' follows the existing WORKOUT_ASSIGNED convention; backend sets no actionScreen so
   a tap lands on the default destination (pre-existing for all workout pushes).
7. Live-DB proof of advisory locks / unique delivery_key race relies on CI live suites + schema parity; no new live spec.

## Fix round 1 + final CI (11:10 PDT)
- Mobile #328 head dbd5ceb: CI quietLuxuryDoctrine flagged fontWeight 700/800 in Programs screens -> all 600. CI now: Typecheck/lint/test PASS, Analyze PASS, CodeQL PASS.
- Backend #640 head 2ac6395f: all green except shellcheck (pre-existing SC2015 in scripts/s10-core-diff-gate.sh, untouched).
- Worktrees removed after push (branches remain on origin).

# Session Log — 2026-05-28 (operator agent)

R64 "NEVER LOSE ANYTHING" consolidated log of everything done/learned this session.
Operator: Bradley/Dynasia. Backend @ d8698b77 (origin/main start), mobile @ 6d17664f (origin/main start).

---

## 1. App Icon Rebrand — SHIPPED to PR (awaiting operator merge, R32)

**What:** Replaced the busy tree/wreath "The Growth Project" lockup with the minimal TGP serif monogram
(charcoal on cream #F5EFE4) — the quiet-luxury brand mark. Source = operator-uploaded monogram (rounded-corner JPG).

**Process:** Generated a pristine FLAT-SQUARE 1024×1024 master (no rounded corners, no alpha — iOS applies
its own mask; baking corners would double-clip). Derived the full Expo asset set via PIL.

**Assets produced** (in workspace `/home/user/workspace/icon_build_out/`, copied into branch `assets/`):
- icon.png 1024×1024 RGB flat square (iOS App Store + home screen; Expo derives all sizes)
- splash-icon.png 1024×1024 RGBA (launch screen, contain on #F5EFE4)
- android-icon-foreground.png 512×512 RGBA (safe-zone padded ~central 50%)
- android-icon-background.png 512×512 RGB solid cream
- android-icon-monochrome.png 512×512 RGBA (themed icons)
- favicon.png 48×48 RGB

**PR:** growth-project-mobile **#207** `chore/rebrand-app-icon`, head **c9fc31f**.
- Commit 1 (66b2854): the six asset swaps.
- Commit 2 (c9fc31f): FIX from audit — added `adaptiveIcon.backgroundImage: "./assets/android-icon-background.png"`
  to app.json (the background PNG was orphaned; app.json only had backgroundColor).
- Both commits authored `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers (R4 ✅).
- CI "Typecheck, lint, test" = **PASS**. Mergeable.

**Pipeline run (doctrine):**
- Auditor (gpt_5_5, worktree `mobile-icon-swap-audit`, detached): verdict NEEDS_CHANGES (1 major: orphaned bg PNG).
  Audit file: `/home/user/workspace/audits/ICON_SWAP_AUDIT_20260529T053115Z.md`.
- Fixer: wired backgroundImage in app.json.
- Re-audit (gpt_5_5): verdict **CLEAN**, 0 findings.
  Audit file: `/home/user/workspace/audits/ICON_SWAP_REAUDIT_20260529T053310Z.md`.
- **STATUS: proposed merge to operator (R32). Awaiting human merge of PR #207.**

**Worktrees created (clean up after merge):** `mobile-icon-swap` (branch chore/rebrand-app-icon),
`mobile-icon-swap-audit` (detached). Both link node_modules conventions N/A (asset-only).

---

## 2. Documents Digested This Session (all 4 + 1 side-read)

1. **The-50-Failures-of-AI-Generated-Code** → ADOPTED as standing Auditor checklist. 8-pass severity order:
   Pass1 Security #1-13 · Pass2 Data integrity #44-47 · Pass3 Concurrency #28-32 · Pass4 Error handling #33-37 ·
   Pass5 Performance #21-27 · Pass6 Architecture #14-20 · Pass7 Code quality #38-43 · Pass8 Infra #48-50.
   Workout-Builder-critical items: #2 RLS, #5 IDOR, #8 input validation, #21 N+1, #23 pagination,
   #28 race conditions, #30 optimistic-update rollback, #44 transactions, #45 soft deletes.
   (Extracted to `/home/user/workspace/AI_50_FAILURES.txt`.)

2. **SECURITY_SPRINT_A_2** → assessment doc saved separately (SECURITY_SPRINT_A2_ASSESSMENT_2026-05-28.md).
   VERDICT: does NOT gate the Workout Builder; most Phase-1 items already shipped (draft's ❌ list is stale).
   (Extracted to `/home/user/workspace/SECURITY_SPRINT_A_2.txt`.)

3. **CPO_BRIEFING** (read prior turn) — north star 3/10 coaches Activated; ICP $2-8k/mo, 10-40 clients;
   4 killers; simplicity mandate; 800 founding users; iOS launch forcing function.

4. **EXHAUSTIVE_BACKLOG** (read prior turn) — 150 items / 10 cycles. Master Workout Builder = item 43;
   Undo+Autosave Google-Docs-style = EW2; Apple Health/Oura/Whoop = EW6/CC29; ASO pack = item #46/Section 10.

5. **Mobile-App-Design-Intelligence** (read prior turn) — UX bible (Don Norman 3 levels; Duolingo/Phantom/
   Revolut/Strava/Apple; streak forgiveness; Miller ≤5 tabs; Hick smart defaults; progressive disclosure 20%;
   Fogg B=MAP; Fitness domain = completion-drive rings + competence feedback). UX reference for ALL mobile work.

6. **product-dominance-playbook** (side-read) → digest saved (PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md).
   8 killers; aha moment = "assigned first program to a client"; AI program builder is a 10x feature;
   competitive position vs Trainerize/Everfit.

---

## 3. Security Sprint A.2 — Grounded Verification (code-checked, not just doc-read)

Verified against backend-main @ d8698b77. Full detail in SECURITY_SPRINT_A2_ASSESSMENT_2026-05-28.md.
- ALREADY DONE (doc said ❌): unhandledRejection/uncaughtException (main.ts:149,153); /healthz+/readyz
  (health.controller.ts:50,59); configurable Sentry tracesSampleRate (instrument.ts); helmet+CSP+CORS
  allowlist (main.ts:41,104); ThrottlerModule + per-endpoint @Throttle on AI/auth/payment (app.module.ts).
- SOLID (50-Failures tier): #1 no hardcoded secrets (redact-secrets.ts, env-validation.ts);
  #2 RLS (rls-context.middleware.ts + 150 guarded controllers); #29 Stripe idempotencyKey throughout billing;
  #44 76 $transaction call sites; #45 soft deletes (deleted_at, grace period).
- GENUINE non-urgent gaps: @sentry/profiling-node not installed; subscription_started event TODO (correctly
  deferred — no subscription code path yet, analytics.service.ts:110); no gitleaks/npm-audit CI step (only dependabot).
- **Recommendation: proceed with TO-DO #1; fold CI secret-scan + npm audit + profiling-node into a later small PR.**

---

## 4. Everfit Competitive Bar (parity-plus target for Master Workout Builder)

Sources: everfit.io/ai, Everfit webinar (youtube Hxim7XBXx8A), blog.everfit.io Jan-2026 updates, trainerize.com blog,
help.everfit.io supersets.
- **AI Workout Builder:** paste free-text/notes → trackable workout in ~2s; Strength/Interval/Timed/AMRAP;
  parses sets/reps/weight + set types (failure/drop/warm-up); superset syntax (1A/1B, giant sets);
  auto-creates missing exercises; section titles (warm-up/workout). ← ALSO the Killer#1 migration wedge.
- **Program Builder:** multi-week programs; assign to multiple clients at once; sections; set types;
  alternate/substitute exercises.
- **Master Planner/Plan:** whole-program-on-one-screen grid; copy/paste workouts across weeks; auto-save & apply;
  drag-drop exercises/sections between days & weeks (Jan 2026).
- **Other:** supersets/circuits/EMOM; exercise library w/ demo videos + custom uploads; Autoflow scheduled delivery.

**TGP OUTPERFORM levers:** real undo (revision history) + true Google-Docs autosave (Everfit only "auto-save & apply");
AI that CREATES live in-app & is coach-editable before approve; quiet-luxury Apple-grade UX; sub-coach scoped permissions.

---

## 5. Workout Builder — Existing Foundation Found in Code (Streams 1-2 already shipped a lot)

**Schema (prisma/schema.prisma) — already present:**
- WorkoutPlan (L1993): coach_id, name, type(strength/cardio/mobility), duration_estimate, archived_at soft-delete,
  composite index [coach_id, archived_at, created_at desc]. exercises[] + assignments[].
- WorkoutPlanExercise (L2010): exercise_external_id (ExerciseDB, NOT internal FK), order, sets,
  reps_or_duration_seconds (dual-purpose), weight_lbs, rest_seconds, superset_group_id, notes, archived_at.
  Partial unique index on (workout_plan_id, order) WHERE archived_at IS NULL (raw SQL).
- ClientWorkoutAssignment (L2035): workout_plan_id, client_id, assigned_by_coach_id, scheduled_for,
  completed_at, post_rpe, post_notes, idempotency_key(@unique), completion_payload(Json), started_at,
  approved_by_coach_at (R43 coach approval), ai_draft_id(@unique, set by AssignWorkoutMaterializer for AI).
- WorkoutBuilderIdempotencyKey (L2072): (user_id, route_key, idempotency_key) unique ledger; status in_progress/
  completed; cached response_json + status_code; concurrent same-key → 409. Used by WorkoutBuilderService.withIdempotency().
- Also: ExerciseCatalogItem(L3841)+ExerciseVideoStatus enum; MealTemplate/DailyMealPlan/DailyMealPlanSlot/Assignment;
  TeamSubCoachAssignment(L2420); SubCoachAssignment(L3947); SubCoachMutationIdempotency(L3971); SubCoachInvite(L3788).

**Backend modules:** src/workout-builder/, src/workout/, src/exercise-catalog/, src/exercise-library/.
**Mobile screens:** coach/CoachWorkoutBuilderScreen, coach/AIWorkoutDraftScreen, coach/ProgramTemplatesScreen,
coach/client-detail/WorkoutsTab; client/RoutineBuilderScreen, ActiveWorkoutScreen, ClientWorkoutViewerScreen,
WorkoutAssignmentDetailScreen, active-workout/* (ExerciseCard/SetLogger/ExerciseImage).
**Mobile primitives:** hooks/useWorkoutBuilder, api/workoutBuilderApi, api/exerciseLibraryApi, db/workoutDb,
storage/activeWorkoutSession, offline/models/WorkoutLog. Nav: CoachNavigator / ClientNavigator.

**DEEP INVENTORY IN PROGRESS:** two READ-ONLY coding subagents writing
`/home/user/workspace/specs/BACKEND_WORKOUT_INVENTORY.md` and `MOBILE_WORKOUT_INVENTORY.md`
(routes, guards, AI draft→approve flow, assign→client-visibility path, autosave/undo gaps, sub-coach scoping).
These feed the master spec. NOT yet complete at time of this log.

---

## 6. TO-DO #1 (operator's actual ask) — scope for the master spec

1.A Master Workout Builder: pages per the UX design bible, a new page-path, memory/persistence of regimes,
    assign-to-client; MATCH + outperform Everfit's master workout builder.
1.B "Build with AI": coach describes plan → intelligent AI call BUILDS the regime LIVE IN-APP (not chat),
    coach edits/approves.
1.C REAL working undo + instantaneous Google-Docs-style autosave (competitor failure point).
Cross-cutting: coaches AND sub-coaches see similar pages BUT client permissions scoped; AI creates the regime
inside the app live (not just talk back); assigned regime PERSISTS and is seen by clients. Decacorn quality.

---

## 7. Decisions / rules reaffirmed this session
- 50-Failures doc = permanent audit gate appended to every Auditor objective (8-pass order).
- Security Sprint A.2 does NOT block TO-DO #1.
- AI builder must CREATE live persisted data (coach-editable pre-approve), not just return chat.
- Hold the UX moat (playbook Killer #5): complexity budget/screen, progressive disclosure, ≤5 primary actions.
- Assign→client-visibility = the activation "aha" — must be instant, reliable, persisted, client-visible.

## 8. Open threads at log time
- PR #207 awaiting operator merge.
- Backend + Mobile workout inventory subagents running → master spec to follow.
- Operator will lay out 5 TO-DOs; #1 detailed above; #2-5 still pending.

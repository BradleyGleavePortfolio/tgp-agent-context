# Session Log — 2026-05-28 PART 2 (operator agent, late evening)

R64 continuation. Captures findings made after the first SESSION_LOG_2026-05-28.md was committed (224e29f).

---

## 9. Third-Party Architectural Review — LOCATED (operator asked "find the 3rd party audit file")

**File:** `growth-project-backend/docs/audits/architectural_refactor_priorities_2026-05-27.md` (97 lines).
**URL:** https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/architectural_refactor_priorities_2026-05-27.md
**Attribution (verbatim header):** "*Filed verbatim from third-party architectural review. Findings are ordered by structural impact and effort.*"
This is the ONLY backend audit explicitly attributed to an outside/third party. (Others — issue_register_28_findings, bug_register_round3, codebase_hygiene_findings, coach_data_accuracy_subcoach_experience, pr280/281/282_audit_v2, ux_review_report — are agent-authored from direct source inspection, NOT third-party.)

**Findings (structural, not security):**
- 🔴 **D — Direct Prisma coupling** (81% of services hit DB directly; a column rename could break ~122 files). Fix = incremental Repository Pattern, start with 5 most-touched domains in order: UserRepository → CheckInRepository → PtmRepository → CoachMessageRepository → ClientPurchaseRepository.
- 🟠 **C — Fat controller** `checkout/payment-ops.controller.ts` (18 imports). Fix = extract `CheckoutOrchestratorService`; controller drops to 3–4 imports, becomes unit-testable.
- 🟡 **B- — Two CCN>50 functions:** `client-context.service.ts:build` (CCN 72, ~145 lines, ~15 conditional data gathers) → decompose into pipeline of small build* methods (each CCN ≤5); anonymous billing callback (CCN 61) → name it + extract switch/if into a `BillingEventRouter` (one method per event type).
- **TL;DR priority/effort table** in the doc: UserRepository (1-day AI sprint) → CheckoutOrchestratorService (2-3h) → decompose client-context build (1-2h) → extend repositories to 4 more domains (1-day AI sprint). All structural refactors that preserve existing behaviour/tests.

**Relevance to TO-DO #1:** The Workout Builder backend already couples directly to Prisma (workout-builder/service.ts). The Repository-Pattern recommendation is a candidate for the new builder work but is NOT a blocker — defer unless it cleanly fits the builder PR.

---

## 10. Backend Workout Builder Inventory — COMPLETE (subagent backend_workout_builder_inventory_mpqhnyyd)

Full report: `specs/BACKEND_WORKOUT_INVENTORY.md` (361 lines, also in workspace /home/user/workspace/specs/).

**Existing pieces:**
- `src/workout-builder/` = Phase-11 coach CRUD over WorkoutPlan + WorkoutPlanExercise + ClientWorkoutAssignment: 8 coach routes + 3 client routes. Strong idempotency via WorkoutBuilderIdempotencyKey (race-safe in_progress→completed claim, service.ts:144-225). setExercises = bulk-replace under Serializable + SELECT…FOR UPDATE (service.ts:442-504), 409s if any active assignment exists. Soft-archive WorkoutPlanExercise.archived_at + partial unique index (workout_plan_id, order) WHERE archived_at IS NULL.
- **Two AI paths.** Path A (`/coach/ai/workout-program`): claude-sonnet-4-6, WorkoutProgramPrompt → AIDraft; approval DOES create live WorkoutPlan+WorkoutPlanExercise rows immediately (one plan per W×D, coach-ai.service.ts:272-316). Path B (gateway `draft.assign_workout`): assigns EXISTING plan only; AssignWorkoutMaterializer + ai_draft_id @unique guard + materialised_ref race protection (ai-approval.service.ts:194-267). NO `draft.create_workout_plan` capability exists yet.
- **Auth:** JwtAuthGuard global; coach routes RolesGuard + @Roles('coach','owner'); client routes ClientEntitlementGuard (402 on un-entitled). NO SubscriptionGuard on builder. Owner = total RolesGuard bypass.

**Top gaps:**
1. No versioning/revision history/undo — only archived_at timestamps; cannot reconstruct prior states.
2. No autosave — whole-array PUT only; no per-row PATCH, no lock_token/version, no optimistic-concurrency primitive on WorkoutPlan.
3. No program parent model — multi-week programs flattened into N independent WorkoutPlan rows on AI approve.
4. No master/template distinction — no is_template flag, no clone-to-client path.
5. **Sub-coach scoping gap (50-Failures #5/#9):** assertClientBelongsToCoach/assertPlanOwnership use direct User.coach_id only; SubCoachScopeService NOT consulted (workout-builder doesn't import it). Service-layer-only enforcement; no RLS second line.
6. No snapshot-at-assignment — clients read live WorkoutPlanExercise via assignment join; the 409 active-assignment gate is the only freeze.
7. No push on coach-driven assign — only AI materialiser sends WORKOUT_ASSIGNED.
8. approved_by_coach_at column exists but has NO endpoint — R43 coach-review half-built.
9. AI plan-creation (Path A) bypasses gateway race protections (no CapabilityMaterializerRegistry/materialised_ref). Migrating to a draft.create_workout_plan capability would unify the two approval inboxes.

---

## 11. Mobile Workout Builder Inventory — COMPLETE (subagent mobile_workout_builder_inventory_mpqhoack)

Full report: `specs/MOBILE_WORKOUT_INVENTORY.md` (workspace /home/user/workspace/specs/).

**Existing screens/flows:**
- Coach manual builder (CoachWorkoutBuilderScreen.tsx:66-414): flat exercise list (no weeks), Up/Down buttons (no DnD), explicit Save → useCreateWorkoutPlan → useUpdateWorkoutPlan → useSetWorkoutExercises (PUT replace-all, workoutBuilderApi.ts:125-126). No autosave, no dirty-guard.
- AI draft flow: generation from CoachAiSection.tsx:208-238 (coachAi.ts:81-84, 120s timeout). AIWorkoutDraftScreen edits weeks→days→exercises in place (L140-190); Save via /edit, Approve via /approve. Approve-while-dirty modal L214-241 gates approve on save success (C-2 fix). Reject requires reason. Footer shows model/tokens/cost provenance.
- Client viewer/log: ClientWorkoutViewerScreen lists /assignments/me; WorkoutAssignmentDetailScreen.tsx:56-84 cross-stack-jumps into WorkoutTab→ActiveWorkout; ActiveWorkoutScreen.tsx:361-384 debounces (500ms) AsyncStorage saves of live session, stale-prompt resume, AppState force-flush, NTP-rollback handling, offline-first SQLite via sync-engine.ts.
- Nav: coach CoachWorkoutBuilder + AIWorkoutDraft on ClientsStack (CoachNavigator.tsx:295-329); "Templates" tab = ProgramTemplatesScreen = guidelines-only, NOT workouts. Client surfaces in WorkoutStack + MoreStack. No coach/sub-coach fork for the builder; role checks exist only on PendingAiDraftsScreen.

**Top gaps:**
1. No weeks/days on WorkoutPlan (only the AI draft schema models weeks; flattens on approve).
2. No autosave anywhere in builder; only live-session has debounced-AsyncStorage. No reusable useAutosave hook.
3. No undo/redo/command stack; mutations in useWorkoutBuilder.ts:53-158 all use plain invalidateQueries — NO onMutate optimistic updates/rollback (50-Failures #30 unmet).
4. No drag-and-drop reorder (gesture-handler/reanimated installed but unused here).
5. No dirty-guard on navigation away from unsaved edits.
6. No inline AI affordances in manual builder (only whole-plan generation from ClientDetail).
7. No workout-template library (Templates tab repurposed for guidelines); no is_template on DTO.
8. No supersets/weight UI despite DTO support (weight_lbs, superset_group_id).
9. No exercise demo/video in builder though video_url/mux_playback_id exist on Exercise.
10. PUT /workout-plans/:id/exercises is replace-all — instantaneous autosave needs batched diffs or a new PATCH endpoint.
- Theming split: modern semanticColors (new screens) vs older flat ThemeColors (AI draft, active workout, routine builder). New builder should standardize on tokens.ts semanticColors + typography/spacing/radius.

---

## 12. Synthesis seed for the Master Workout Builder spec (next step)

Backend + mobile inventories agree on the gap set. The master spec must add:
- **Program parent model** (multi-week container) + **is_template** so a "Master Workout" is a reusable template, distinct from a per-client assignment.
- **Versioning/revision-history** table → enables REAL undo (1.C) — both repos confirm none exists.
- **Autosave**: new PATCH/diff endpoint (replace the PUT replace-all) + a reusable mobile useAutosave hook modeled on the live-session debounce pattern; optimistic onMutate + rollback (50-Failures #30).
- **Sub-coach scoping via SubCoachScopeService** wired into workout-builder service guards (closes gap #5) + RLS second line (50-Failures #2).
- **AI live-create capability** `draft.create_workout_plan` through the gateway materializer (unify the two approval inboxes; gives Path A the same race protections as Path B). Satisfies 1.B "AI creates the regime live, coach edits/approves".
- **Snapshot-at-assignment** + push on coach-driven assign so assigned regimes persist + are seen by clients reliably (the activation "aha").
- **DnD reorder, supersets/weight UI, exercise demo video** in builder.

---

## 13. Open threads at PART 2 log time
- PR #207 still awaiting operator merge (R32).
- Master Workout Builder master spec = next deliverable, synthesizing specs/BACKEND_WORKOUT_INVENTORY.md + specs/MOBILE_WORKOUT_INVENTORY.md against the Everfit bar (§4 of Part 1) and the 50-Failures gate.
- TO-DO #2-5 still pending from operator.

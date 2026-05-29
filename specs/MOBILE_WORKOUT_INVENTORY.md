# Mobile Workout Inventory — Master Workout Builder design input

Read-only investigation. Covers the existing mobile workout surface in
`growth-project-mobile-e086da42/` after Streams 1–2 (AI credits, pending-drafts
inbox) merged. Every claim cites a file path with line numbers. The bottom
section enumerates concrete gaps relative to a "Master Workout Builder" with
real undo, Build-with-AI, and Google-Docs-style instantaneous autosave.

---

## 1. Coach builder screens — what exists today

### 1.1 `CoachWorkoutBuilderScreen` — manual plan CRUD
`src/screens/coach/CoachWorkoutBuilderScreen.tsx` (499 lines).

UI flow:
- Param `{ planId?: string }` (`L53`). Edit vs. create branches on
  `isEditing = Boolean(planId)` at `L70`.
- Single scrollable form with: plan name `TextInput` (`L233`), 3-chip workout
  type picker `strength | cardio | mobility` (`L246–268`, list `L55`),
  duration-minutes numeric input (`L273`), exercise rows list (`L293–356`),
  and an exercise-catalog search box with up-to-8 results (`L361–389`).
- Row controls are **Up / Down / Remove buttons** (no drag), comment on
  `L15` ("Reorder is intentionally simple — up/down arrow buttons on each
  row instead of pulling in a drag-and-drop dependency").
- Per-row inputs via `<NumberField>` (`L416–447`) for sets,
  reps-or-duration-seconds, rest_seconds — `weight_lbs`, `superset_group_id`,
  and `notes` exist in the DTO but are **not surfaced** in this UI (cf.
  `UpsertExerciseRowInput`, `src/api/workoutBuilderApi.ts:34–47`).

API calls (all via `useWorkoutBuilder` → `workoutBuilderApi`):
- `useWorkoutPlan(planId)` hydrate on edit (`L75`).
- `useCreateWorkoutPlan` (`L76`) → `POST /workout-plans` (`workoutBuilderApi.ts:115`).
- `useUpdateWorkoutPlan` (`L77`) → `PATCH /workout-plans/:id`
  (`workoutBuilderApi.ts:118`).
- `useSetWorkoutExercises` (`L78`) → `PUT /workout-plans/:id/exercises`
  (**replace-all** semantics, `workoutBuilderApi.ts:125`).
- Single explicit "Save" button (`L391–410`). `onSave` (`L154–218`) runs three
  sequential `mutateAsync` calls, then `Alert.alert('Plan saved')` →
  `navigation.goBack()`.

Autosave / undo: **none**. The only persistence is the explicit Save button.
Reorder, add, remove, edit all mutate local component state (`L108–146`) and
are lost if the user leaves the screen without tapping Save. No
`onBeforeRemove`/dirty-guard either.

### 1.2 `AIWorkoutDraftScreen` — review/edit/approve an AI draft
`src/screens/coach/AIWorkoutDraftScreen.tsx` (892 lines).

This is the AI-side counterpart, **not** a generation surface. The actual
generation is invoked from `src/components/coach/CoachAiSection.tsx:208–238`
(`coachAiApi.generateWorkout({ clientId, weeks, daysPerWeek, focus, notes })`,
`src/api/coachAi.ts:81–84`). On success it navigates to `'AIWorkoutDraft'`
with `{ draftId, clientId, clientName }` (`CoachAiSection.tsx:223`).

What `AIWorkoutDraftScreen` does:
- `GET /coach/ai/drafts/:draftId` on mount (`L122–127`, `coachAi.ts:99–100`).
- Adapts the backend's flat `days[]` shape into `weeks[].days[]` for rendering
  (`adaptPayload`, `L63–99`).
- Renders an editable tree: weeks → days → exercises (`L343–429`).
  Per-exercise: name, sets (numeric), reps (string), RIR, RPE, notes —
  `NumericField` (`L526–557`) / `StringField` (`L559–585`).
- Local `dirty` flag set on every edit (`L145`, `L160`, `L189`).
- Three actions, all on the footer (`L433–476`):
  - **Save edits** → `POST /coach/ai/drafts/:id/edit` with whole `payload`
    body (`L201–212`, `coachAi.ts:115–122`). Alert "Saved" on success.
  - **Reject** → opens reason modal (`L478–519`), then
    `POST /coach/ai/drafts/:id/reject` (`L274`).
  - **Approve & assign** → if `dirty`, prompt
    *Cancel / Discard and approve / Save and approve* (`L214–241`). The
    Save-and-approve path is gated on `handleSave()` returning `true`
    (`L228–232`) so a server save failure no longer ships the pre-edit draft
    (C-2 fix comment, `L192–197`). Final call: `coachAiApi.approveDraft` →
    `POST /coach/ai/drafts/:id/approve` (`coachAi.ts:106–109`). Backend
    materializes a `WorkoutPlan` row.

**Coach edits before approve**: yes — same screen, in-place. **Approval
contract**: a single POST to `/approve` with no body — the server uses
whatever is currently persisted on the draft (so edits must be saved first;
the dirty-guard exists exactly to prevent silently approving stale content).

Footer "provenance" line (`L434–438`) shows `modelUsed`, tokens in/out, cost
in cents — explicit cost disclosure for every draft.

### 1.3 `ProgramTemplatesScreen` — **misnamed**, does NOT build workouts
`src/screens/coach/ProgramTemplatesScreen.tsx` (519 lines).

Despite the name and the Coach tab labelled "Templates" in
`CoachNavigator.tsx:544–553`, this screen is **guideline templates**, not
workout templates. The subtitle says so explicitly (`L155–159`):
> "Prefilled nutrition + training notes you can post as guidelines to a
> client. Does not create a workout or meal plan — use Workout Builder or
> Meal Templates for those."

It hard-codes five `ProgramTemplate` cards in `makePROGRAM_TEMPLATES`
(`L35–98`: Fat Loss / Lean Bulk / Recomp / Maintenance / Mobility), each
carrying free-text `nutritionNotes` + `trainingNotes`. The "Apply" action
calls `usePostClientGuidelines` (`L111`) which posts a markdown blob to
`/clients/:id/guidelines` — not the workout-builder backend.

So there is **no "workout template library" surface** at all today.

### 1.4 `PendingAiDraftsScreen` — Stream 2 cross-capability inbox
`src/screens/coach/PendingAiDraftsScreen.tsx` (430 lines).
Lists `status='pending'` `AiActionDraft` rows for the coach
(`usePendingAiDrafts`, `L43–45`, focus-gated 30 s poll `L73–74`). Approve /
Reject use `coachAiExecutionApi` and `invalidateQueries` only — no
optimistic update, no per-draft edit (`L76–88`).

---

## 2. AI draft flow on mobile — full path

Entry: `CoachAiSection` lives inside `ClientDetailScreen` (mounted from
`src/screens/coach/ClientDetailScreen.tsx:32, 449`). It exposes
"Build with AI" sheets per capability:

1. Coach taps **Generate workout program** → modal collects
   `weeks`, `daysPerWeek`, optional `focus`, free-text `notes`
   (`CoachAiSection.tsx:208–220`).
2. `coachAiApi.generateWorkout(input)` POST `/coach/ai/workout-program`
   with a 120 s per-call timeout (`coachAi.ts:70, 81–84`).
3. On success → `navigation.navigate('AIWorkoutDraft',
   { draftId, clientId, clientName })` (`CoachAiSection.tsx:223`).
4. AIWorkoutDraftScreen loads the draft, lets the coach edit weeks/days/
   exercises **in place** (no diff view, no per-field history). See §1.2.
5. Coach taps **Approve & assign** → `POST /coach/ai/drafts/:id/approve`.
   The backend creates a real `WorkoutPlan` row and presumably assigns it
   (the comment header `L4–7` says "navigate back to ClientDetail
   (workouts tab)"; current implementation `Alert.alert` then
   `navigation.navigate('ClientDetail', ...)` on OK, `L249–258`).
6. If the user closes the AI draft screen via the back arrow (`L312–319`)
   **dirty edits are silently dropped** — no save-on-blur, no warning.
7. Reject path collects a mandatory reason string (`L266–285`).

Pending drafts that aren't approved yet *also* show in
`PendingAiDraftsScreen` (Stream 2). From that inbox the coach navigates to
the matching draft screen via `CoachAiSection.tsx:181–201`
(`draftTypeToScreen`).

Timeout fallback (`CoachAiSection.tsx:225–228`): if axios times out, the
modal closes and a polling loop watches for the draft to appear server-side
— backend keeps working, mobile reconnects when ready.

The screen has **no streaming UI** — generation is a single blocking POST,
spinner-then-result. No "regenerate week 2" affordance. No prompt history.

---

## 3. Client side — view → load → log → sync

### 3.1 `ClientWorkoutViewerScreen` — list of assignments
`src/screens/client/ClientWorkoutViewerScreen.tsx` (224 lines).
- `useMyWorkoutAssignments()` → `GET /assignments/me`
  (`useWorkoutBuilder.ts:121–128`, `workoutBuilderApi.ts:138–139`).
- Sorts by `scheduled_for`, splits into **Upcoming** vs **Completed**
  (`L43–54`). Honest empty state at `L87–96` ("Your coach has not
  assigned a workout yet").
- Tap → `navigation.navigate('WorkoutAssignmentDetail', { assignmentId })`
  (`L56–61`).

### 3.2 `WorkoutAssignmentDetailScreen` — detail + Start
`src/screens/client/WorkoutAssignmentDetailScreen.tsx` (214 lines).
- `useMyWorkoutAssignment(assignmentId)` → `GET /assignments/:id`
  (`workoutBuilderApi.ts:141–142`). Returns the assignment **with its full
  `workout_plan`** (`ClientWorkoutAssignmentWithPlan`,
  `workoutBuilderApi.ts:102–104`).
- Renders exercises sorted by `order` (`L101`, `L129–148`).
- `Start workout` button (`L156–165`) → calls
  `buildActiveWorkoutExercises(plan)`
  (`src/utils/workout/buildActiveWorkout.ts:22–28`) which seeds
  `{ exerciseId, exerciseName, sets, reps, restSec, workoutPlanExerciseId }`,
  then nested-navigates into `WorkoutTab → ActiveWorkout` (`L56–84`, W-4
  cross-stack fix).

### 3.3 `ActiveWorkoutScreen` — live session, the most complex screen
`src/screens/client/ActiveWorkoutScreen.tsx` (989 lines). The persistence
machinery here is the closest thing the codebase has to an autosave/undo
primitive — it is **session-scoped**, *not* generic to the builder.

Live session state:
- `sessionExercises: SessionExercise[]` (`L91`).
- Wallclock-anchored timer (`L93–107, L177–181`) tolerant to background
  suspension + NTP rollback (`L334–352`).
- Rest timer (`L137–140, L387–411`) with haptic-on-zero (`L405`).

Recovery / autosave:
- Persisted to AsyncStorage via debounced `saveActiveWorkoutSession`
  (`L361–384`, debounce constant `PERSIST_DEBOUNCE_MS = 500`, `L74`).
- Per-user key `active_workout_session:<userId>` — see
  `src/storage/activeWorkoutSession.ts:30–36`. Sign-out sweep purges by
  prefix (`L26–29`).
- Schema-versioned (`ACTIVE_WORKOUT_SESSION_VERSION = 1`, `L50`); per-element
  shape validated (`L78–101`) so a corrupt payload doesn't crash on resume
  (audit #8).
- Stale-threshold = 12 h (`ACTIVE_WORKOUT_STALE_MS`, `L46`). Restore-on-mount
  shows a *Resume / Start Fresh* alert (`ActiveWorkoutScreen.tsx:203–280`).
- Force-flush on AppState background (`L307–352`) — prevents the OS killing
  the process inside the debounce window.
- Legacy global key migration (`LEGACY_ACTIVE_WORKOUT_SESSION_KEY`,
  `activeWorkoutSession.ts:43`) for sessions started before R15.

Offline-first write path (Finish workout, `ActiveWorkoutScreen.tsx:562–769`):
1. Per-exercise row written to expo-sqlite `workout_logs` with
   `sync_status='pending'` via `writeWorkoutLog` (`src/offline/index.ts:24`,
   `src/offline/sync/sync-engine.ts:71–96`).
2. Local SQLite write succeeded = first durable checkpoint →
   `clearActiveWorkoutSession(userId)` (`L639`, comment R18).
3. `createWorkout.mutate` POSTs the server payload
   (`useCreateWorkout` from `useApi.ts`).
4. On 200, `markSessionSyncedBySessionName(routineName, serverId)` flips
   pending rows to synced (`L700–704`, W-1 fix).
5. If `assignmentId` present, **fire-and-forget**
   `workoutBuilderApi.completeMyAssignment` with the full per-set
   `completion_payload`, `idempotency_key`, and `started_at`
   (`L713–734`, contract `workoutBuilderApi.ts:144–151`).
6. On server error: revert `finishingRef`, re-save the active session
   (`L748–760`, audit #4 / R7 / R18) — workout remains recoverable.

Conflict / dead-letter handling lives in
`src/offline/sync/sync-engine.ts:1–60` (server-wins on 409 → toast bus;
permanent 4xx → `dead_letter`).

### 3.4 `RoutineBuilderScreen` — legacy client-owned routines
`src/screens/client/RoutineBuilderScreen.tsx` (499 lines).
Pre-Sprint-B-2 surface: lets a **client** build a personal routine. Reads
the exercise catalog from local SQLite (`getAllExercises`, `L90`, defined
in `src/db/workoutDb.ts:1`). Saves via `useCreateRoutine` /
`useUpdateRoutine` (`L23, L177`) which post to `/routines` — a separate
endpoint family from `/workout-plans`. This is a **parallel system** to the
coach builder and shares no code with `CoachWorkoutBuilderScreen`. The
schema (`workoutDb.ts:25–31`: `{ exerciseId, exerciseName, sets, reps,
restSec }`) is flatter than the coach `WorkoutPlanExercise` shape
(`workoutBuilderApi.ts:66–77`).

### 3.5 `WorkoutsTab` (in client detail) — coach-side history
`src/screens/coach/client-detail/WorkoutsTab.tsx` (86 lines).
Renders parsed JSON exercises from `workout_sessions` rows; pure read,
no edit. Counts total/completed sets and rough volume.

---

## 4. Navigation — where the surfaces sit + role gating

### 4.1 Coach navigator
`src/navigation/CoachNavigator.tsx`.
- Coach tabs (`L504–589`): `CommandCenter | ClientsStack | Templates |
  Messages | (TeamStack) | SettingsStack`. Templates tab points at
  `ProgramTemplatesScreen` — the **guideline** screen, not workouts
  (`L544–553`).
- `ClientsStackParamList` (`L120–173`) declares `CoachWorkoutBuilder:
  { planId?: string } | undefined` (`L136`) and `AIWorkoutDraft:
  { draftId, clientId, clientName }` (`L147`). Both register on the
  Clients stack (`L295–298`, `L326–329`).
- There is **no dedicated workouts tab** for the coach. The only coach
  entry to the builder is from `ClientDetailScreen.tsx:449`:
  `navigation.navigate('CoachWorkoutBuilder', undefined)` — i.e. the
  builder always opens with `planId === undefined` (new), never edit, from
  this entry point. Editing a plan requires the caller to pass `planId`,
  but no such caller exists in coach UI today (only `CoachWorkoutBuilder
  ` itself reads `planId` for edit mode at `L69`).

### 4.2 Role gating
- `TeamStack` is gated `head_coach` only (`CoachNavigator.tsx:489–578`,
  uses `useCoachRoleType()`). Sub-coaches don't see the Team tab.
- `PendingAiDraftsScreen` has a defence-in-depth in-screen role guard
  (`L57, L66–69`) matching backend `@Roles('coach', 'owner')`.
- Sub-coaches and coaches **share the same `ClientsStack`** — there is no
  fork between them for workout-builder access. There is no per-screen
  capability check on `CoachWorkoutBuilderScreen` or
  `AIWorkoutDraftScreen`. So a sub-coach can build/AI-draft workouts in
  the current binary; permissions are enforced server-side.

### 4.3 Client navigator
`src/navigation/ClientNavigator.tsx`.
- 4 tabs (`L147–152`): `Home / WorkoutTab / Log / MoreTab`.
- `WorkoutStackParamList` (`L154–167`):
  `WorkoutMain | ActiveWorkout | RoutineBuilder | CoachGuidelines |
  ExerciseLibrary | ExerciseDetail`.
- `MoreStackParamList` (`L174–246`) contains the coach-assigned read
  surfaces: `ClientWorkoutViewer` (`L215`), `WorkoutAssignmentDetail`
  (`L216`). Mounted with `withProtectedScreen` (`L118–120`).
- W-4 cross-stack jump: `WorkoutAssignmentDetailScreen.tsx:72–84` reaches
  up through the parent chain to `WorkoutTab → ActiveWorkout` because
  `ActiveWorkout` is registered on `WorkoutStackNavigator` only.

---

## 5. State, autosave, undo primitives — what exists vs what doesn't

| Primitive | Exists? | Where |
|---|---|---|
| Debounced AsyncStorage save | yes, scoped to live session | `ActiveWorkoutScreen.tsx:74, 361–384` |
| Force-flush on background | yes, scoped to live session | `ActiveWorkoutScreen.tsx:314–324, 334–352` |
| Schema-versioned persisted state | yes, scoped to live session | `storage/activeWorkoutSession.ts:50, 78–101` |
| Per-user key scoping | yes, scoped to live session | `storage/activeWorkoutSession.ts:30–36` |
| `useDebouncedValue` generic hook | yes, value-only (no callback) | `hooks/useDebouncedValue.ts:15–28` |
| Offline-first SQLite write + sync engine | yes, **for completed workouts only** | `offline/sync/sync-engine.ts:1–96`; `offline/models/WorkoutLog.ts` |
| Conflict / dead-letter event bus | yes | `sync-engine.ts:46–60` |
| React Query optimistic update on workout-builder mutations | **no** — every mutation uses plain `invalidateQueries` | `hooks/useWorkoutBuilder.ts:58–158` (none of `useCreateWorkoutPlan`, `useUpdateWorkoutPlan`, `useSetWorkoutExercises`, `useAssignWorkoutPlan` define `onMutate`) |
| Undo stack / command history | **no** — no Cmd-Z anywhere in the workout surfaces | grep `onMutate.*=|optimistic|rollback` finds zero hits in `src/hooks/useWorkoutBuilder.ts` |
| Zustand store slice for builder | **no** — `coachStore`, `clientStore`, `blockedUsersStore`, `fastingStore`, `foregroundBannerStore` (none for workout builder) | `src/store/` |
| Drag-and-drop reorder | **no** — explicit "intentionally simple … instead of pulling in a drag-and-drop dependency" comment | `CoachWorkoutBuilderScreen.tsx:14–17` |
| Dirty-guard / `onBeforeRemove` on builder | **no** | `CoachWorkoutBuilderScreen.tsx` (only `dirty` state in AIWorkoutDraftScreen at `L112`) |
| `react-native-gesture-handler` / Reanimated installed | yes, 2.31.1 / 4.3.1 | `package.json` |

Conclusion: a Google-Docs-style instantaneous-save and undo stack does
**not exist** for the coach builder. The only autosave in the codebase is
the per-user active-workout-session debounce, and it's a hand-rolled
single-purpose effect, not a reusable primitive.

---

## 6. Design system primitives (quiet-luxury) — reusable surface

`src/theme/tokens.ts` is the single source of truth (Wave 2 luxury
repositioning + Phase 11 dark mode).

- **Palette** (`L31–62`): `bone #F5EFE4` background, `cream #F1E8D5`
  surface, `ink #1A1A18` text, `charcoal #3D3D3A` secondary, `stone #B1A89F`
  hairline, `forest #2C4A36` PRIMARY accent (Body pillar), `mutedGold
  #C5A253` (founding-tier typography only), `oxblood #4A0404` reserved for
  Wealth pillar (`L57–60`). WCAG-AA matrix at `L7–27`.
- **Semantic tokens** (`L300–333`): `SemanticTokens` interface +
  `lightTokens` / `darkTokens` exports; resolved by `ThemeProvider.tsx`.
- **Typography** (`L132–216`): Cormorant Garamond serif for h1–h3 (weight
  400, the "amateur tell" warning at `L133–137`), Inter for body / caption /
  eyebrow / micro.
- **Spacing** (4 px base grid, `L219–228`).
- **Radius** (`L231–240`): `sm 0 / md 2 / lg 4 / pill 999`. xl/2xl
  remapped to lg for legacy back-compat.
- **Shadows** (`L243–268`): sm/md/lg with 0.04 / 0.06 / 0.08 opacity caps.
- **Motion** (`L271–286`): fast 120 ms, base 400 ms ("velvet timing"),
  decel easing `[0.16, 1, 0.3, 1]` (expo-out).

Reusable UI building blocks (relevant subset):
- **HapticPressable** (`src/components/HapticPressable.tsx:14–43`) —
  drop-in Pressable with intent-based haptic + scale/opacity micro-animation
  (`light | medium | heavy | success | warning | error`).
- **FadeInView** (`src/components/FadeInView.tsx`) — entry animation.
- **Skeletons** (`src/ui/skeletons/Skeleton.tsx`): `Skeleton`,
  `SkeletonRow`, `SkeletonList`, `SkeletonScreen`. Reanimated-based
  ping-pong opacity. Also `SkeletonClientCard`, `SkeletonProfileHeader`,
  `SkeletonProgressChart`, `SkeletonStatTile`, `SkeletonWorkoutRow`.
- **Empty states** (`src/ui/empty-states/`): `EmptyState`,
  `EmptyStateNoData`, `EmptyStateNoResults`, `EmptyStateNoClients`,
  `EmptyStateNoWorkouts` (passive, no CTA — coach assigns,
  `EmptyStateNoWorkouts.tsx:5–18`), `EmptyStateOffline`. Icons module
  `icons.tsx`.
- **Charts** (`src/ui/charts/`): `TgpAreaChart`, `TgpBarChart`,
  `TgpLineChart`, `TgpSparkline`.
- **Haptic service** (`src/ui/haptics/haptics.service.ts`):
  `softImpact`, `heavyImpact`, `error`, used in `ActiveWorkoutScreen` for
  rest-timer-zero and finish.
- **Generic UI in `src/components/`**: `EmptyState`, `ErrorBoundary`,
  `MultiSelectChip`, `OptionCard`, `HeroAction`, `OfflineBanner`,
  `SkeletonLoader`, `ExerciseLogModal`. (Note the older
  `SkeletonLoader.tsx` predates `ui/skeletons/Skeleton.tsx`; either can
  be used.)
- **Theme provider** (`src/theme/ThemeProvider.tsx`): exposes
  `tokens`, `colors`, `semanticColors`, founder-tier overrides, dark-mode
  toggle (`gp_appearance` AsyncStorage key, `L34`).

Two flavors of theming co-exist:
- Modern: `useTheme().semanticColors` (`sc.bgPrimary`, `sc.bgSurface`,
  `sc.textPrimary`, `sc.textMuted`, `sc.accent`, `sc.border`). Used by
  `CoachWorkoutBuilderScreen` and the new client viewer/detail screens.
- Older flat: `useTheme().colors` (ThemeColors interface). Used by
  `AIWorkoutDraftScreen`, `RoutineBuilderScreen`, `ActiveWorkoutScreen`,
  `ProgramTemplatesScreen`.
A Master Workout Builder build-out should standardize on
`semanticColors` + `typography`/`spacing`/`radius` tokens from `tokens.ts`.

---

## 7. Gaps — what a decacorn Master Workout Builder needs that doesn't exist

Ordered by impact for the spec.

1. **No unified builder surface.** Three disconnected systems:
   `CoachWorkoutBuilderScreen` (single plan, no week/day structure, no
   superset UI), `AIWorkoutDraftScreen` (week → day → exercise tree, AI
   only), `RoutineBuilderScreen` (client-owned, separate `/routines`
   backend). The coach builder doesn't even model weeks. The AI-draft
   schema does. A Master Builder needs **one** weekly-program schema and
   one editor that handles both manual and AI-seeded plans.

2. **No real autosave.** `CoachWorkoutBuilderScreen` requires an explicit
   Save button (`L391`). `AIWorkoutDraftScreen` has an explicit Save edits
   button (`L440`). Closing either screen drops dirty edits without
   warning. Need a debounced-save effect equivalent to
   `ActiveWorkoutScreen`'s 500 ms AsyncStorage write — but pointed at the
   server with idempotency keys, local mirror, and offline queue. The
   existing primitives are: `useDebouncedValue` (value-only,
   `useDebouncedValue.ts:15`), the per-screen debounce pattern in
   `ActiveWorkoutScreen.tsx:361–384`. There is **no** reusable
   `useAutosave(mutationFn, value)` hook.

3. **No undo / redo.** Nowhere in the workout surfaces is there a command
   history, action log, or `setQueryData(..., previous)` rollback. Mutations
   in `useWorkoutBuilder.ts:53–158` only `invalidateQueries`. A decacorn
   builder needs an explicit `Action[]` stack (move, edit-field,
   add-exercise, swap, bulk-paste) with Cmd-Z (mobile gesture: two-finger
   swipe or a visible toolbar undo button). This must be additive over the
   autosave — undo's source of truth is local working copy, not the wire.

4. **No optimistic update + rollback on workout-plan mutations.** Compare
   `useCreateWorkoutPlan` (`useWorkoutBuilder.ts:53–62`) — `onSuccess`
   invalidates only. Should have `onMutate` cancelling in-flight queries,
   snapshotting `previousData`, returning context, then `onError` rolling
   back. Per "50-Failures #30" this is a known omission.

5. **No drag-and-drop reorder.** `react-native-gesture-handler` 2.31.1 and
   Reanimated 4.3.1 are already installed (`package.json`). The current
   UI uses Up/Down buttons (`CoachWorkoutBuilderScreen.tsx:303–322`).
   Need a long-press DnD primitive that animates the reorder, persists
   incrementally, and undoes via the same stack.

6. **No week/day model in `WorkoutPlan`.** Backend `WorkoutPlan`
   (`workoutBuilderApi.ts:79–89`) is flat: `exercises[]` with `order`.
   AI drafts model weeks via `AiWorkoutWeek` / `AiWorkoutDay`
   (`types/coachAi.ts`, used in `AIWorkoutDraftScreen.tsx:140–161`).
   When AI-approve materializes a `WorkoutPlan`, that structure flattens.
   The Master Builder needs weeks/days first-class on the assignment-time
   plan, not only on the draft.

7. **No exercise demo / video in the builder.** `Exercise.video_url` /
   `mux_playback_id` exist on the type (`exerciseLibraryApi.ts:40–42`)
   and the Library/Detail surfaces consume them
   (`ExerciseLibraryScreen` / `ExerciseDetailScreen`,
   `ClientNavigator.tsx:51–52`). The builder search hit
   (`CoachWorkoutBuilderScreen.tsx:371–387`) shows only `name` +
   `bodyPart`. A decacorn UI shows a thumbnail/gif and a tap-to-preview
   sheet inline.

8. **No supersets/weight UI**, even though the DTO supports
   `superset_group_id` and `weight_lbs` (`workoutBuilderApi.ts:42–45`).
   `CoachWorkoutBuilderScreen.tsx:333–354` exposes only sets / reps / rest.

9. **No "Build with AI" entry from the manual builder.** Today the AI
   generation lives behind `CoachAiSection` inside `ClientDetailScreen`.
   The manual builder has no "Ask AI to draft this" or "Ask AI to suggest
   substitutions for exercise N" affordance. A Master Builder should
   offer per-day / per-exercise inline AI actions, not just whole-plan
   generation.

10. **No template library.** The "Templates" coach tab points at
    `ProgramTemplatesScreen` which is guideline-only (§1.3). There is no
    surface where a coach can save the current plan as a template, browse
    a library of their own templates, or seed a new plan from one. The
    DTO has no `is_template` flag either (`WorkoutPlan` shape
    `workoutBuilderApi.ts:79–89`).

11. **No coach-side preview of how the plan renders to the client.** The
    builder has no "Preview as client" mode. The client surfaces
    (`WorkoutAssignmentDetailScreen`, `ActiveWorkoutScreen`) live in a
    different navigator entirely; verifying readability requires
    assigning to a real client.

12. **No dirty-guard on navigation.** Neither
    `CoachWorkoutBuilderScreen` nor `AIWorkoutDraftScreen` register a
    `useNavigation`-`beforeRemove` listener; back-arrow during an unsaved
    edit silently drops it (the AI screen at least has the
    Save-and-approve / Discard-and-approve modal at `L214–241`, but only
    on the approve path).

13. **No collaboration / multi-coach editing primitives.** No
    last-edited-by, no presence indicator, no conflict resolution UI.
    Server-side `WorkoutPlan` carries `coach_id` (single owner,
    `workoutBuilderApi.ts:81`).

14. **No reusable autosave-state UI.** A "Saved" / "Saving…" /
    "Offline — will sync" pill in the header is missing. The closest is
    `OfflineBanner` (`src/components/OfflineBanner.tsx`) — global banner,
    not per-screen save state.

15. **Theming inconsistency** within workout surfaces: the new screens
    use `semanticColors` + `typography` from `tokens.ts`
    (`CoachWorkoutBuilderScreen`, `WorkoutAssignmentDetailScreen`,
    `ClientWorkoutViewerScreen`) while the AI draft screen and the active
    workout screen still use the older flat `ThemeColors` and inline
    `StyleSheet` blocks with bespoke font references. The Master Builder
    must pick one and migrate.

16. **`PUT /workout-plans/:id/exercises` is replace-all** — the wire
    contract (`workoutBuilderApi.ts:125–126`) forces a full payload on
    every save. Instantaneous autosave will saturate this. Either: batch
    diffs locally and PUT periodically; or push the backend to expose
    per-row PATCH endpoints. Worth flagging up-front in the spec.

---

## Top gaps (one-line summary)

Master Workout Builder mobile prerequisites that are missing today:
1. Unified weeks→days→exercises model on the **plan** (not just AI drafts).
2. Reusable `useAutosave` hook with "Saving/Saved/Offline" indicator.
3. Real command-stack undo/redo (no equivalent exists anywhere).
4. Optimistic update + rollback on every workout-plan mutation.
5. Drag-and-drop reorder using the already-installed gesture-handler/reanimated.
6. Inline AI affordances on the builder (not only whole-plan generation).
7. A genuine workout-template library (Templates tab is currently
   guidelines).
8. Per-row UI for `weight_lbs`, `superset_group_id`, exercise video preview.
9. Dirty-guard on navigation away from unsaved builder edits.
10. Per-row PATCH (or batched diff) to make Google-Docs-style saves cheap.

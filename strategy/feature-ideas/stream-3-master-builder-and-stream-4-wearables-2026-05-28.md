## 2. STREAM 3 & 4 — WHAT'S NEXT (operator-dictated 2026-05-28 21:52 PT)

> Captured under R64. Operator dictated this brief in two messages on 2026-05-28. Verbatim quotes preserved below; interpretation and open design questions follow each. This section supersedes the prior placeholder.

### 2a. Stream 3 — Master Workout Builder + AI Workout Builder + Meal Planning

#### Operator's words, verbatim

> "We have no 'Master Builder' for making multi week workout programs OR meal planning -> We need to build this out + There should be a 'AI workout builder' that allows the coach to describe the workout regime/client(s), and it puts together a plan. Then the coach can edit it, approve it, and save it. The Coach AI needs to be able to assign these workouts if later asked 'can you give Sarah our 12wk legs plan?'. - This page needs a autosave feature like google docs, and a robust undo button!"

> "Clarifying - master workout builder + AI workout builder. This will be a separate page path/pages. The AI will be an OPTION, but manually creating workout regimes will be an option/needs to be an option. These pages needs a autosave feature like google docs, and a robust undo button!"

#### What this decomposes into (interpretation)

**Two distinct surfaces, distinct page paths:**

1. **Master Workout Builder (manual)** — a multi-week workout program authoring tool. The coach creates the plan by hand, week-by-week, day-by-day, exercise-by-exercise. No AI in the critical path. This must exist as a first-class path even when AI is unavailable, broken, or the coach simply wants to build manually.
2. **AI Workout Builder (option, layered on Master Builder)** — separate page path. Coach describes the regime in natural language ("4-day push/pull/legs/upper, 12 weeks, intermediate lifter, knee injury history, prefer barbell"). Optionally references a specific client or list of clients. AI produces a full plan that lands inside the Master Builder UI for the coach to edit, approve, and save.
3. **Master Meal Plan Builder (manual)** — same product shape as the Master Workout Builder, but for meals. Multi-week, day-by-day, meal-by-meal. Manual authoring is the required option.
4. **(Implied) AI Meal Plan Builder** — operator did NOT explicitly call this out, but the symmetric design implies it. **Confirm with operator** before spawning a builder.
5. **Coach AI assignment hook** — the existing Coach AI surface (`/coach/ai/*`) must be able to look up a saved Master Plan and assign it to a client via natural language: *"can you give Sarah our 12wk legs plan?"* This is a Stream 2 materialiser extension, not a Stream 3 surface.

**Cross-cutting requirements (every Master Builder surface):**

- **Autosave "like Google Docs"** — every meaningful edit persists without an explicit save action. No "Save" button as the primary commit path; "Saved" / "Saving…" / "Offline — will sync" status is the only UI indicator.
- **Robust undo button** — operator emphasised this twice. Must handle multi-step undo (not just last action), survive page navigation, and ideally survive page reload (server-side undo log).

#### Open design questions (must be answered with the operator BEFORE spawning a builder)

1. **Schema.** Does Stream 2's `CoachAIDraft` table support N-week payloads, or do we need a dedicated `MasterPlan` / `MasterWorkoutPlan` / `MasterMealPlan` table? My read: separate table. Drafts are ephemeral, masters are saved coach IP.
2. **Master → Assignment relationship.** When a coach "assigns Sarah our 12wk legs plan," does the system:
   - (a) deep-copy the master into a per-client `WorkoutPlan` row (snapshot semantics, edits to master don't affect Sarah's copy), or
   - (b) reference the master and overlay per-client deltas (live link, edits to master propagate)?
   - Decacorn answer: (a) snapshot by default, with an explicit "sync to master" affordance later. Confirm with operator.
3. **AI Builder → Master handoff.** Does the AI builder write directly into a Master Builder draft, or does it produce a `CoachAIDraft` that the coach explicitly promotes to a Master? Suggest: AI writes into a Master draft tagged `source: 'ai'`, coach edits in place, coach clicks "Save Master" to commit.
4. **Autosave cadence.** Debounce window? Operator said "like Google Docs" — Google Docs uses ~2–3s debounce with immediate flush on blur and navigation. Adopt that as default.
5. **Conflict resolution.** Coach has the plan open in two tabs / on mobile + web. Last-write-wins, OT/CRDT, or operational lock? Decacorn answer: per-field last-write-wins with version vector + visible "another session has changes" banner. Defer CRDT.
6. **Undo scope.** Per-field edit, per-row (exercise/meal), per-day, per-week? Server-side journal or client-only? Survives reload? Suggest: server-side journal of last 50 edits per plan, indexed by `plan_id, edit_seq`. Per-field granularity. Survives reload.
7. **Coach AI lookup language.** *"Give Sarah our 12wk legs plan"* requires a fuzzy name → master-plan mapping. Coach tags / aliases / names on master plans must be designed for this disambiguation. Single coach may have multiple "legs" plans; AI must ask for disambiguation if >1 match.
8. **Permissions.** Sub-coach can author masters? Can assign masters owned by the head coach? Confirm with operator (R1 of engineering rules: every service method has explicit tenant scope; sub-coach ≠ head coach).
9. **AI workflow scope.** Does the AI Builder also handle PROGRESSION across the 12 weeks (e.g., 5/3/1 wave logic, periodisation), or does it just lay out exercises and leave loading to the coach? My read: it should propose progression schemes, label them, let the coach swap.
10. **AI cost.** A 12-week plan generation is the most expensive single AI call in the product. Per-call credit cost must be sized in Stream 1's `ai_credits` framework before launch; rate limits per coach.

**Decacorn quality bar (R1) reminders specific to this stream:**
- Autosave must NOT lose data when the coach loses connectivity mid-edit. Local journal → sync on reconnect.
- Undo must NOT silently fail. Visible toast on undo success; visible error if undo is not possible (e.g., plan was assigned to a client and that assignment created downstream dependencies).
- The AI Builder must NEVER bypass coach approval. Even when prompted by Coach AI to "build and assign," the assignment step requires explicit coach confirmation (same approval pattern as Stream 2 materialisers).
- Manual path is FIRST CLASS. The product must remain fully usable if every AI surface is broken. Coach should not feel the manual path is a fallback; it should feel like the default with AI as a power-up.

### 2b. Stream 4 — Wearables UI: Oura, Apple HealthKit, Whoop

#### Operator's words, verbatim

> "Then, I want the UI redisigned in preperation for Oura ring/sleep data (new page paths and pages) + Apple healthkit + Whoop integration! These sleep pages need to display all Whoop/Oura data cleanly + Have an option for the AI to summarize this data both when a coach searches a clients profile for it AND when the clients looks through!"

> "Clarification - we need new COACH/SUBCOACH pages for this data (homepage -> client search -> client results -> client sleep data page + client extensions data page as options/tabs that are populated with the clients wearable data). THEN, the client POV needs new pages - sleep data page, wearable page, ect."

#### What this decomposes into (interpretation)

**Coach / sub-coach navigation flow (NEW page paths):**

```
Coach Home
  → Client Search
    → Client Results (list of matched clients)
      → Client Profile
        → [tab] Client Sleep Data            ← NEW
        → [tab] Client Wearables / "Extensions" Data   ← NEW (operator wrote "client extensions data" — read as "wearables" until confirmed)
        → "AI Summarise" affordance on each tab (Stream 1 metered call)
```

**Client navigation flow (NEW page paths):**

```
Client Home
  → Sleep Data page                          ← NEW
  → Wearables page (Oura / HealthKit / Whoop) ← NEW
  → "AI Summarise" affordance on each page (Stream 1 metered call, athlete tier of Coach AI)
```

**Data surfaces required (per provider):**
- **Oura** — sleep stages, HRV, readiness, body temperature deviation, activity
- **Whoop** — sleep, recovery, strain, HRV, RHR, journal entries
- **Apple HealthKit** — sleep analysis, heart rate (resting + working), HRV, steps, workouts. Note: iOS-only; Android coaches / clients see a stub.

All three must be displayed "cleanly" — operator's word. Decacorn bar: one unified sleep visualisation that normalises across providers (Stream 4 may need a provider abstraction layer in the backend before the UI can promise this).

**AI summarisation:**
- Coach POV: "Summarise Sarah's last 7/14/30 days of sleep and flag anything that explains her plateau." Coach pays in Coach AI credits (Stream 1).
- Client POV: "How did I sleep this week? What should I do differently?" Client pays in their own AI credit budget (Stream 1, athlete tier).
- Each summary is a distinct AI surface call — add to the AI Surface Map in §11 once built.

#### Open design questions (must be answered with the operator BEFORE spawning a builder)

1. **"UI redesigned in preparation" — scope.** Does the operator want:
   - (a) the new sleep / wearables pages designed and shipped now, with stub data until provider OAuth ships, or
   - (b) the existing nav structure refactored to accommodate the new pages later (smaller scope, prep only)?
   - My read: (a) full pages + stub data. Confirm.
2. **Provider OAuth scope.** Stream 4 explicitly says "UI scaffold" in the prior session notes. But the operator now says "Oura ring/sleep data" and "display all Whoop/Oura data cleanly" — which implies real data. Confirm whether Stream 4 includes the OAuth + ingest backend, or just the UI consuming a mocked data API.
3. **Sub-coach access.** Operator wrote "COACH/SUBCOACH pages." Sub-coaches see their assigned clients' wearable data — not the head coach's other clients. This requires the same head-coach-vs-sub-coach tenant scoping as everywhere else (R1 of engineering rules).
4. **"Client extensions data page" — what is "extensions"?** Operator's literal word. Two readings: (i) "extensions" = wearables = same page as Wearables tab (most likely — the surrounding context is wearable data), or (ii) something else entirely (browser extensions? data exports?). **Ask operator to clarify** before spawning a builder.
5. **AI summary persistence.** Are summaries one-shot (generated on demand, not stored) or cached per time-window (e.g., one summary per client per week, regenerated only on explicit request)? Caching saves credits but goes stale. Suggest: cache per (client, window) with explicit "refresh" button + last-generated timestamp.
6. **Cross-pillar AI insight.** Coach AI (Stream 2) may eventually want to read wearable data when generating workouts (e.g., "low HRV this week → lighter session"). Confirm whether Stream 4 ingest writes into a model that Stream 2 materialisers can read. R1 answer: yes, but defer the read path until Stream 4 ingest is shipped.
7. **Personal-health skill.** The `personal-health/wearables-data` skill in the available skills catalogue likely has provider-specific guidance. `load_skill(name="personal-health/wearables-data")` before designing.

#### Decacorn quality bar (R1) reminders specific to this stream
- iOS HealthKit access requires Apple permission strings + Info.plist entries + permission prompt UX gated to value moments (R28 mobile).
- Whoop and Oura OAuth tokens are long-lived; refresh + revocation must be handled. Token storage must be encrypted at rest (R15 mobile + RLS at the DB).
- Sleep data is PHI-adjacent. RLS policies on every wearable table (per `ENGINEERING_RULES.md` §2). FORCE ROW LEVEL SECURITY, not just ENABLE.
- The AI summary surface must NOT leak data across tenants. Coach summarising Sarah must scope strictly to Sarah's data; sub-coach summarising Sarah must verify sub-coach owns Sarah's relationship first.

### 2c. Cross-stream dependencies

Stream 3 (Master Builder + AI Builder) and Stream 4 (Wearables UI) share infrastructure with Stream 1 (AI Credits) and Stream 2 (AI Execution):

- **Stream 1** — every AI call in Stream 3 and Stream 4 must be metered through the existing `ai_credits` framework. Workout generation = Coach AI bucket. Wearable summary (client POV) = athlete AI bucket. Wearable summary (coach POV) = Coach AI bucket.
- **Stream 2** — the "Coach AI assigns Sarah the 12wk legs plan" hook is a new Stream 2 materialiser: `draft.assign_master_workout_plan` (and the meal equivalent). Materialiser writes to `WorkoutPlan` (or `WorkoutPlan` referencing `MasterWorkoutPlan` depending on Q2 above).
- **Stream 4 → Stream 2 (future)** — Coach AI may eventually read wearable data to adjust generated workouts. Out of scope for the first Stream 3 + Stream 4 cuts, but the data model should not foreclose it.

### 2d. Sequencing recommendation (for the next operator to confirm with Bradley)

My read of decacorn sequencing:

1. **Stream 3 schema first.** Decide `MasterWorkoutPlan` / `MasterMealPlan` tables, draft → master → assignment lifecycle, before any UI.
2. **Stream 3 manual UI second.** Ship Master Workout Builder (manual only) with autosave + undo. Decacorn-quality undo is the riskiest single feature; ship it without AI in the path so the foundation is solid.
3. **Stream 3 AI Builder third.** Layer the AI Builder on top of the manual Master Builder. AI writes into the same draft surface the coach uses manually.
4. **Stream 3 Coach AI assignment hook fourth.** Wire `draft.assign_master_workout_plan` into Coach AI's natural-language surface.
5. **Repeat 2–4 for Master Meal Plan Builder.** Same shape; reuse autosave + undo infrastructure built in step 2.
6. **Stream 4 UI scaffold sixth.** New page paths (coach + sub-coach + client) with stub data.
7. **Stream 4 OAuth + ingest seventh.** Oura → Whoop → HealthKit (Oura is easiest API; HealthKit is iOS-only and requires native bridge).
8. **Stream 4 AI summary eighth.** Coach and client summary surfaces on top of real data.

Do NOT do all of this in parallel. Each step gates the next on schema decisions. Sub-streams within a step (e.g., autosave vs undo in step 2) CAN parallelise per R56 worktree discipline.

---

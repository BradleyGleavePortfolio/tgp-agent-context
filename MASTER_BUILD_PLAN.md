# TGP MASTER BUILD PLAN — Strict Priority Lane

> **Author:** Dynasia G. **Status:** OPERATOR-LOCKED 2026-06-09. **Supersedes:** all ad-hoc dispatch ordering up to commit `2c5c950`.
>
> This is the single source of truth for **build order** across community expansion, billing, voice, and the Master Workout Builder. Everything below is sequenced to the operator priority lane and the strict R0–R70 rules.

---

## 0. Operator-locked priority lane (verbatim, in force)

> "I need **v1-4, v1-5, v1-6 and V2 PR's done top priority**, so make sure those are always in flight! The other stuff, roman + ACH work + dunning etc. can go in parallel, but if needed will be **second to community expansion**."

> "We need to finish the community expansion -> You are 1 in a chain of 100 agents building this — **deep work, done right**. No rushing to get it all done, just do V1-4 RIGHT, then move to v1-5 in due time."

> "Strict — keep priority lane: CC32 builder dispatches **AFTER v2 ships**."

### Concrete sequence

```
TIER 1 (community lane — never blocked, always in flight):
  v1-4 → v1-5 → v1-6 → v2-1 → v2-2 → v2-3 → v2-4 → v3-1 → v3-2 → v3-3 → v3-4

TIER 2 (parallel, but second to Tier 1 when contention):
  Roman integration (Phase 1 chat MVP → Phase 2 in-app → Phase 3 push/email)
  B3 Smart Dunning v2 (in flight)
  Bank-payout / ACH / Stripe Connect
  Master Workout Builder (MWB) — phased
  EW3 Android parity (after FCM merged ✅)
  EW2 undo+autosave (sub-slice of MWB §5+§6)
  B5 digital contracts

TIER 3 (after v2-4 ships — Reading A LOCKED, runs in parallel with v3.x):
  CC32 voice-first logging ("Hey Roman" wake word + Whisper for workouts/food/check-ins)

TIER 4 (queued — operator decisions RESOLVED 2026-06-09):
  BUG-R4 AWS SDK dep        — Option A: core dep (every install gets ACH support)
  BUG-R5 StripeConnect inj  — Option A: constructor injection (fewer flaky tests forever)
  Fee-formula penny delta   — Option A: platform absorbs (clean UX, slight margin hit)
  B5 eIDAS Advanced (EU)    — defer to v1.1
  B5 signature plan         — HelloSign Embedded (inline iframe, ~30% premium accepted)
  B5 contract drafting      — agent-drafted with deep research; FEATURE_CONTRACTS_ENABLED stays OFF in prod until lawyer review

TIER 5 (LAST — runs ONLY after every Tier 1-4 item ships):
  PAGE REORGANIZATION (mobile IA cleanup)
  WEB APP BUILD (browser-based dashboard for coaches — does NOT exist today)
```

---

## 1. Where we are right now (snapshot)

| Track | PR | State |
|---|---|---|
| v1-4 community realtime+push+telemetry | #370 | R3 audit in flight on fixer `95d9f44` — sentinel cleared |
| v1-3 community foundation | merged | ✅ |
| BUG-R2 meal-plan dedup | #371 → `c48e79a` | ✅ merged |
| BUG-R3 package archive guard | #372 → `f9b3c05` | ✅ merged |
| FCM wire (mobile) | #228 → `2883b22` | ✅ merged |
| Roman voice policy (Option 3) | #9 | open |
| B3 dunning copy in Roman voice | #6 | open + updated to Option 3 |
| Roman integration plan | #8 | open + updated to Option 3, 31 touchpoints |
| Roman identity spec | #1 | open |
| B5 digital contracts spec | #2 | open |
| CC32 voice-first logging spec | #3 | open (Tier 3 — DO NOT DISPATCH BUILDER UNTIL v2 SHIPS) |
| Bank payout + ED.3 + milestone shareables spec | #4 | open |
| EW2 undo+autosave spec | (no PR yet) | branch only |
| EW3 Android parity audit | #7 | open — FCM unblocked, awaiting triage |
| B3 v2 backend builder | (new) | **IN FLIGHT** — Opus 4.8 |

---

## 2. Tier 1 — Community lane (the heartbeat)

### 2.1 v1-4 — REALTIME + PUSH + TELEMETRY (CURRENT)

**Scope:** WebSocket realtime fanout for community posts/comments/reactions, Expo Push for mentions/replies, PostHog telemetry. All three behind feature flags (`FEATURE_COMMUNITY_REALTIME`, `FEATURE_COMMUNITY_PUSH`, `FEATURE_COMMUNITY_TELEMETRY`) default OFF.

**Status:** PR #370 fixer `95d9f44` complete, R3 audit running.

**Exit criteria:**
- R3 audit returns CLEAN.
- All 7 hard gates green (entitlement-guards pin 17/17, zero schema mutation, no user-authored bodies, lockscreen STOP path documented, 3 flags OFF, zero new deps, no `sonnet` string).
- R70 fail-fast lane: 15/15 (or SKIP-BECAUSE if script absent).
- Full non-RLS/non-OpenAPI jest lane: green.

**Then:** `gh pr merge 370 --squash --admin --repo BradleyGleavePortfolio/growth-project-backend` → **v1-4 SHIPS**.

---

### 2.2 v1-5 — MOBILE CLIENT COMMUNITY TAB

**Scope source of truth:** `COMMUNITY_EXECUTION_PLAN.md` §"PR v1-5".

**Scope:** Mobile client surface consuming the v1-4 backend. 7 screens (CommunityTab, Today, Space, Thread, DmList, DmThread, Composer), shared `src/components/community/**`, typed `communityApi.ts`, 4 Expo flags default OFF, WebSocket subscription for unread badges, optimistic updates. Roman voice Option 3 Phase 1 scope = in-app empty states + onboarding only (NOT push/email — Phase 3).

**Flags:** `EXPO_PUBLIC_FF_COMMUNITY_TAB`, `EXPO_PUBLIC_FF_COMMUNITY_HALL`, `EXPO_PUBLIC_FF_COMMUNITY_COHORTS`, `EXPO_PUBLIC_FF_COMMUNITY_DM` — all default false.

**Builder dispatch:** Opus 4.8, R31, worktree `mobile-community-v1-5`. **IN FLIGHT.**

**Audit:** GPT-5.5 R1.

**Hard gates:** flag-off route absence, no spinner-only empty states, no placeholder launch text, ≥44pt touch targets, standardize on `semanticColors`, optimistic updates with rollback, full Jest+RNTL coverage, TS strict, lint clean, no `sonnet` references, no new heavyweight deps.

---

### 2.3 v1-6 — COACH ADMIN INBOX + MODERATION

**Scope source of truth:** `COMMUNITY_EXECUTION_PLAN.md` §"PR v1-6".

**Scope:** Backend coach endpoints + mobile coach screens. `src/community/coach/**`, `CoachCommunityHomeScreen`, `CoachCommunityInboxScreen`, `CoachCommunityLabScreen`, `CoachCommunityCohortsScreen`, `CoachCommunityCohortDetailScreen`, `CoachCommunityModerationScreen`. ~1900 LOC.

**Flags:** `FEATURE_COMMUNITY_COACH_ADMIN`, `EXPO_PUBLIC_FF_COACH_COMMUNITY` — default false.

**Hard gates:** destructive moderation actions require confirmation, no foreign-coach access, audit-log row for every moderation action, no `sonnet` references.

**Tests:** coach creates cohort, coach invites/assigns clients, coach inbox aggregates unanswered items, moderator actions hide content.

---

### 2.4 v2 cycle — 4 sub-PRs (plan tags → ack signals → events → AI triage)

**Scope source of truth:** `COMMUNITY_EXECUTION_PLAN.md` §§"PR v2-1" through "PR v2-4".

v2 cycle is **4 sequential PRs**:

| Sub-PR | Title | LOC | Flag |
|---|---|---|---|
| **v2-1** | `community: v2-1 plan context tags` | ~1000 | `FEATURE_COMMUNITY_PLAN_TAGS` |
| **v2-2** | `community: v2-2 coach ack signals` (seen / acked / replied + SLA timer) | ~850 | `FEATURE_COMMUNITY_ACKS` |
| **v2-3** | `community: v2-3 event objects` (5-state machine: scheduled/tomorrow/live/replay/reflected) | ~1600 | `FEATURE_COMMUNITY_EVENTS`, `EXPO_PUBLIC_FF_COMMUNITY_EVENTS` |
| **v2-4** | `community: v2-4 AI inbox triage` (coach AI aggregation; never autonomous) | ~1400 | `FEATURE_COMMUNITY_AI_TRIAGE` |

**Tier 3 (CC32) unlocks the moment v2-4 merges — Reading A LOCKED 2026-06-09.** v3 cycle continues Tier 1 in parallel with CC32 in Tier 2.

---

### 2.5 v3 cycle — 4 sub-PRs (challenges → classroom → voice notes → search+wearables)

**Scope source of truth:** `COMMUNITY_EXECUTION_PLAN.md` §§"PR v3-1" through "PR v3-4".

| Sub-PR | Title | LOC | Flag |
|---|---|---|---|
| **v3-1** | `community: v3-1 challenges` (cohort-scoped challenges, opt-in leaderboards) | ~1600 | `FEATURE_COMMUNITY_CHALLENGES`, `EXPO_PUBLIC_FF_COMMUNITY_CHALLENGES` |
| **v3-2** | `community: v3-2 classroom posts` (media-backed posts, pinned lessons, release locks) | ~1500 | `FEATURE_COMMUNITY_CLASSROOM_POSTS` |
| **v3-3** | `community: v3-3 voice notes` (community-scoped voice composer — distinct from CC32 voice-first logging) | ~1200 | `FEATURE_COMMUNITY_VOICE_NOTES`, `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES` |
| **v3-4** | `community: v3-4 search + wearable prompts` (depends on v3-3, P0-0A, P0-0B) | ~1800 | `FEATURE_COMMUNITY_SEARCH`, `FEATURE_COMMUNITY_WEARABLE_PROMPTS` |

**Community expansion ENDS at v3-4.** Total remaining LOC across the v1.x → v2.x → v3.x lane after v1-4: ~15,050.

**Note: v3-3 voice notes ≠ CC32 voice-first logging.** v3-3 = attach an audio blob to a community post/DM (reuses Phase 6C upload pipeline). CC32 = transcribe "Hey Roman, 315 for 5" via Whisper and write a `WorkoutSetLog`. Different modules (`src/community/voice/**` vs `src/voice-logging/**`), different schemas, different telemetry. They coexist.

---

## 3. Tier 2 — Parallel tracks (running alongside Tier 1)

### 3.1 Roman integration — Option 3 brand voice (LOCKED)

**Spec source:** `ROMAN_VOICE_POLICY.md` (#9) + Roman integration plan (#8).

**Phasing:**

| Phase | Surfaces | Triggers builder when |
|---|---|---|
| **Phase 1** | Chat MVP only (assistant chat, voice modal placeholder text-only) | After Roman PRs #1, #8, #9 merge |
| **Phase 2** | In-app Roman: dunning blockers, paywall, lockout screen, billing-update, milestone shareables, ED.3 wow, empty states, onboarding | After Phase 1 ships + B3 v2 ships |
| **Phase 3** | Push + email: dunning Day 1/3/7/10, milestones, transactional emails, welcome | After Phase 2 ships |

**Phase 1 dispatch:** Opus 4.8 mobile + backend split. Mobile builds the chat UI + avatar swap + monogram badge. Backend wires the Roman chat route to existing AI gateway (no Whisper yet — text only in Phase 1).

**Phase 2 dispatch:** Mobile builder for in-app surface integration; backend dispatcher already exists from B3 v2.

**Phase 3 dispatch:** Backend builder to swap notification template strings to Roman variants from `ROMAN_VOICE_POLICY.md`. Mobile push handler already supports the new copy.

---

### 3.2 B3 Smart Dunning v2 (CURRENT, IN FLIGHT)

**Scope:** 4-attempt cadence `[0, 1, 3, 7]` + Day-10 hard lockout + late-reversal handler + Roman copy (Option 3). All behind `FEATURE_DUNNING_V2` default OFF.

**Status:** Backend builder `b3_v2_smart_dunning_backend_builder_mq712wjm` (Opus 4.8) running.

**Next:** GPT-5.5 R1 audit on PR open. CLEAN → merge → flag-flip on staging → smoke → flag-flip prod.

**Mobile follow-up:** lockout-screen UI + billing-update-screen tweaks + Roman copy variants. Separate mobile builder after backend merges.

---

### 3.3 Master Workout Builder (MWB) — phased rollout

**Spec source:** `MASTER_WORKOUT_BUILDER_SPEC.md` (782 lines, APPROVED, operator decisions A–D locked).

**Operator decisions (LOCKED):**
- **A:** Sub-coach templates = grab-a-copy, never mutate source.
- **B:** Rip out legacy AI workout path entirely. New gateway path must build the regime in-app, VISIBLY.
- **C:** Undo retention = last 30 edits per plan.
- **D:** Repurpose "Templates" tab into unified Assignables Library.

**5-phase build order** (each phase = one PR, one builder, one auditor, ships behind a phase flag):

| Phase | What | Files touched (backend) | Files touched (mobile) | Flag |
|---|---|---|---|---|
| **MWB-1** Data model | `WorkoutProgram` parent + `WorkoutPlan.{program_id, week_index, day_index, is_template, version, head_revision_id, cloned_from_plan_id}` + indexes. Additive Prisma migration only — backward-compatible. RLS policies on new tables. | `prisma/schema.prisma`, `src/workout-builder/`, new migration | none | `FEATURE_MWB_DATAMODEL` |
| **MWB-2** Templates + clone-to-client | `cloneProgramToClient` service method (Serializable txn). Snapshot-at-assignment. Sub-coach scope wired via `SubCoachScopeService.canAccessClient`. | `src/workout-builder/`, `src/sub-coach-scope/` | none | `FEATURE_MWB_TEMPLATES` |
| **MWB-3** Real undo (revisions) | `WorkoutPlanRevision` + `WorkoutProgramRevision` tables. 30-edit-per-plan retention pruner (cron). `POST /workout-plans/:id/rollback/:revisionId` endpoint. | `src/workout-builder/`, new migration, cron module | none | `FEATURE_MWB_UNDO` |
| **MWB-4** Google-Docs autosave | `PATCH`-row autosave endpoint with `version` / `lock_token` optimistic concurrency. Mobile `useAutosave` hook + "Saving / Saved / Offline" pill. Builds on top of MWB-3 revisions. | `src/workout-builder/` | `src/hooks/useAutosave.ts`, `src/screens/coach/CoachWorkoutBuilderScreen.tsx`, status pill component | `FEATURE_MWB_AUTOSAVE` |
| **MWB-5** Build-with-AI LIVE create | `draft.create_workout_plan` / `draft.edit_workout_plan` gateway capabilities. `CapabilityMaterializerRegistry` extension. Reviewable diffs (not chat). Legacy AI path REMOVED (Decision B). Mobile inline-diff review UI. | `src/ai/coach/`, `src/ai/gateway/`, registry | `src/screens/coach/AIWorkoutDraftScreen.tsx` (rewrite for diffs), new diff component | `FEATURE_MWB_AI_LIVE_CREATE` |

**Hard rule across all 5 phases:** legacy `CoachWorkoutBuilderScreen` flat-list path stays valid until MWB-5 ships. No phase breaks the old path.

**Builder model:** Opus 4.8 per phase.
**Auditor model:** GPT-5.5 per phase, R31.
**Worktree per phase:** `backend-mwb-{1,2,3,4,5}` and `mobile-mwb-{4,5}`.

**Sequencing with community lane:** MWB phases dispatch **only when no Tier-1 community PR is in audit/fix**. MWB never blocks v1-5/v1-6/v2 dispatch. Pause MWB the moment a Tier-1 PR enters audit; resume after merge.

**EW2 undo+autosave spec** = the design pre-work for MWB-3 + MWB-4. It is already specced; MWB-3 and MWB-4 briefs incorporate it verbatim.

---

### 3.4 Bank-payout / ACH / Stripe Connect

**Spec source:** PR #4.

**Scope:**
- Option B Stripe Connect Custom + Financial Connections.
- $1k ACH worked example (note: $1 reconcile typo — operator deferred).
- Coach payout dashboard.
- Plaid/Financial Connections OAuth flow.

**Builder dispatch:** After MWB-2 ships (sub-coach scope service touched in both).

**Mobile:** payout dashboard screen, bank-connect screen, payout-history.

---

### 3.5 EW3 Android parity

**Status:** PR #7 audit, FCM blocker resolved by mobile #228.

**Builder dispatch:** Operator triage post-merge of #370. Most rows in the 21-row severity table are now actionable.

---

### 3.6 B5 digital contracts

**Spec source:** PR #2.

**Builder dispatch:** Sequenced after Bank-payout (#4) and Roman Phase 1 ship. Contract emails will use Roman voice.

---

## 4. Tier 3 — CC32 voice-first logging ("Hey Roman" + Whisper)

**LOCKED: do NOT dispatch CC32 builder until v2 community ships.**

**Spec source:** `strategy/CC32_VOICE_FIRST_LOGGING_SPEC.md` on branch `spec/cc32-voice-logging` (PR #3, 507 lines, operator decisions D1–D6 locked).

**Scope (recap):**
- "Hey Roman" wake word — iOS only via `SFSpeechRecognizer` (on-device, free, low battery). Android = tap-to-talk only.
- Whisper (`whisper-1`, $0.006/min) server-side as canonical transcript.
- GPT-4o-mini structured-output extraction.
- 3 surfaces: workouts, nutrition, check-ins.
- 3 backend routes: `POST /voice-logging/{workout-set,nutrition-entry,check-in}`.
- Metered through existing `CoachAIBudgetService` with current AI-usage multiplier.
- New `VoiceLoggingEvent` audit table.
- New module `src/voice-logging/` — deliberately collision-free with community/MWB worktrees.

**2-phase build:**

| Phase | What | Worktree |
|---|---|---|
| **CC32-1 backend** | New `src/voice-logging/` module, 3 routes, Whisper + GPT-4o-mini wiring, AI-budget withdrawal, idempotency window, `VoiceLoggingEvent` table, `FEATURE_VOICE_LOGGING` flag default OFF. | `backend-cc32` |
| **CC32-2 mobile** | `SFSpeechRecognizer` wake-word hook (iOS), tap-to-talk button on workout/nutrition/check-in screens (both platforms), audio recorder + auto-stop on 1.5s silence, upload flow, Roman voice reply UI, mic permission strings in `app.json`/`Info.plist`/`AndroidManifest.xml`. | `mobile-cc32` |

**Builders:** Opus 4.8 each phase. Auditors: GPT-5.5 R31.

**Dispatch trigger:** v2-4 merged (NOT waiting for v3.x). v3.x community PRs continue in Tier 1 alongside CC32 in Tier 2.

---

## 5. Tier 4 — Queued operator decisions (RESOLVED 2026-06-09)

| Item | Decision | Rationale (plain English) |
|---|---|---|
| BUG-R4 AWS SDK dep PR | **Option A — core dep** | Every coach who downloads the app gets ACH capability out of the box; no opt-in install step. |
| BUG-R5 StripeConnect injection | **Option A — constructor injection** | Fewer flaky tests forever. Slightly more wiring boilerplate, but tests can inject fakes cleanly and no global service-locator state to leak between tests. |
| Fee-formula $1 reconcile | **Option A — platform absorbs** | Clean UX. User ledger shows the clean computed number; platform eats the 1¢ delta as cost of business. No weird "Adjustment $0.01" lines for coaches to question. |
| B5 provider | **HelloSign** (locked) | Best balance of legal weight, cost, UX, and integration effort. |
| B5 default scope | **Two layers** | Layer 1: TGP↔Client liability waiver REQUIRED for every client (signed once); Layer 2: Coach↔Client service agreement OPT-IN per package. |
| B5 contract drafting | **Agent-drafted** | Builder agent does deep live research per contract type. `FEATURE_CONTRACTS_ENABLED` stays OFF in prod as code-level invariant until lawyer review clears the wording. |
| B5 eIDAS Advanced (EU) | **Defer to v1.1** | Ship US-grade signatures first; EU stronger-tier upgrade later. |
| B5 HelloSign plan | **Embedded** | Inline iframe at checkout, no redirect — required for the inline-before-Stripe gate. ~30% per-envelope premium accepted. |

All Tier 4 items are now UNBLOCKED for dispatch (subject to Tier 1 capacity rules).

---

## 6. Standing rules (in force across all dispatches)

- **R31:** builder ≠ auditor ≠ fixer. Different agents AND different worktrees.
- **Sonnet 4.6 FORBIDDEN.** Auditor greps for the literal `sonnet`. Always Opus 4.8 builders, GPT-5.5 auditors.
- **R56–R60:** one subagent per worktree, isolated.
- **R61:** push every ~2 min during active work.
- **R64:** journal + push at every state change.
- **R66:** full-suite-before-PR.
- **R67:** dispatch.json updated BEFORE wait.
- **R69:** SKIP-BECAUSE annotations (no silent skips).
- **R70:** <30 s fail-fast lane (15/15) when present.
- **`codebase` subagent type BROKEN** — use `general_purpose` with explicit worktree.
- **`gh` CLI** with `api_credentials=["github"]`.
- **Commit format:** title-only, no body, no emoji, no trailers.
- **Author:** `Dynasia G <dynasia@trygrowthproject.com>`.

---

## 7. Dispatch queue (next-N agents to spawn, in order)

These are the **next dispatches** once v1-4 R3 audit returns CLEAN and v1-4 merges:

```
1. v1-5 community moderation BUILDER (Opus 4.8)        [backend-community-v1-5]
2. R1 audit B3 v2 backend (GPT-5.5)                    [backend-b3-v2-audit]
3. v1-5 community moderation R1 AUDIT (GPT-5.5)        [backend-community-v1-5-audit]
4. v1-6 community profiles BUILDER (Opus 4.8)          [backend-community-v1-6]   (when v1-5 audit CLEAN)
5. MWB-1 data-model BUILDER (Opus 4.8)                 [backend-mwb-1]            (parallel with #4 if no Tier-1 in audit)
6. MWB-1 R1 AUDIT (GPT-5.5)                            [backend-mwb-1-audit]
7. v2 community events BUILDER (Opus 4.8)              [backend-community-v2]     (when v1-6 audit CLEAN)
8. MWB-2 templates BUILDER (Opus 4.8)                  [backend-mwb-2]
9. v2 community events R1 AUDIT (GPT-5.5)              [backend-community-v2-audit]
— v2 MERGES → Tier 3 unlocks —
10. CC32-1 backend BUILDER (Opus 4.8)                  [backend-cc32]
11. CC32-2 mobile BUILDER (Opus 4.8)                   [mobile-cc32]
12. MWB-3 undo BUILDER (Opus 4.8)
13. MWB-4 autosave BUILDER (Opus 4.8)
14. MWB-5 AI-live-create BUILDER (Opus 4.8)
15. Roman Phase 3 push+email BUILDER (Opus 4.8)
```

Bank-payout, B5, and EW3 dispatches inserted as gaps allow.

---

## 7B. Tier 5 — LAST track (page reorganization + web app)

Locked 2026-06-09 as the absolute LAST items in the master plan. Dispatched ONLY after every Tier 1 / 2 / 3 / 4 item has shipped or been explicitly de-prioritized by the operator.

### 7B.1 Page reorganization (mobile information architecture)

Mobile-app navigation / IA cleanup. Scope to be specced when we reach this tier — current placeholder: rationalize tab structure, consolidate redundant screens, align surface-to-feature mapping with the post-MWB / post-CC32 / post-community feature set. Spec TBD.

### 7B.2 Web app build (browser dashboard for coaches)

**Status today (2026-06-09):** does NOT exist. There is no web app, no `trygrowthproject.com` dashboard, no browser-based coach surface. Everything is the mobile app (Expo / React Native).

**Scope (placeholder):** browser-based coach dashboard. Likely Next.js + the existing NestJS backend, reusing the same auth/RLS layer. Surfaces:
- Master Workout Builder web client (Cmd-Z + version drawer per EW2 §6)
- Community admin inbox + moderation
- Coach storefront editing
- Analytics + revenue dashboards

**Dependencies that MUST land first:**
- All Tier 1 community PRs merged (v1-4 through v3-4)
- All Roman phases (1, 2, 3) shipped
- All Whisper / CC32 phases shipped
- All MWB phases (MWB-1 through MWB-5) shipped
- Page reorganization (§7B.1) complete

**Spec:** TBD when we reach this tier. EW2 §6 already pre-plans the web-shared undo+autosave hooks for the day this exists.

---

## 8. Out-of-scope / NOT in this plan

- Wearables (Stream 4) — separate plan.
- Real-time multi-coach collaborative cursors (MWB §6.5 "deferred").
- Legacy `/routines` migration — stays parallel system.
- Coach-side voice messaging (CC32 v1 explicit non-goal).
- Voice-driven UI navigation (CC32 v1 explicit non-goal).
- Continuous whole-session transcription (CC32 v1 explicit non-goal).

---

## 9. Owner sign-off

- **Operator:** ✅ Locked 2026-06-09 via session message: *"Strict — keep priority lane: CC32 builder dispatches AFTER v2 ships"*.
- **Spec dependencies:** `MASTER_WORKOUT_BUILDER_SPEC.md` (approved 2026-05-28), `CC32_VOICE_FIRST_LOGGING_SPEC.md` (D1–D6 locked), `ROMAN_VOICE_POLICY.md` (Option 3 locked 2026-06-09), `COMMUNITY_PRODUCT_PLAN.md`.

---

**This document is the canonical build-order doctrine. Any deviation requires explicit operator approval and a journal entry in `handoffs/dispatch.json`.**

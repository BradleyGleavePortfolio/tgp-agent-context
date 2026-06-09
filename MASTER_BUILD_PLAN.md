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
  v1-4 → v1-5 → v1-6 → v2

TIER 2 (parallel, but second to Tier 1 when contention):
  Roman integration (Phase 1 chat MVP → Phase 2 in-app → Phase 3 push/email)
  B3 Smart Dunning v2 (in flight)
  Bank-payout / ACH / Stripe Connect
  Master Workout Builder (MWB) — phased
  EW3 Android parity (after FCM merged ✅)
  EW2 undo+autosave (sub-slice of MWB §5+§6)
  B5 digital contracts

TIER 3 (after v2 ships — STRICT, no exceptions):
  CC32 voice-first logging ("Hey Roman" wake word + Whisper for workouts/food/check-ins)

TIER 4 (queued — operator decision needed):
  BUG-R4 AWS SDK dep PR
  BUG-R5 StripeConnect inject into GdprScrubService
  $1 fee-formula reconcile in bank-payout spec
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

### 2.2 v1-5 — COMMUNITY MODERATION + REPORT + BLOCK

**Scope source of truth:** `tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md` (v1-5 section). Brief gets drafted from there.

**Expected scope (subject to spec confirmation):**
- Report flow: client reports post/comment → server stores report → moderator queue.
- Block flow: user blocks user → bi-directional filter at fanout + read paths.
- Moderator queue UI (admin web or in-coach app — confirm in spec).
- Soft-hide vs hard-delete distinction.
- Telemetry: `community.report.created`, `community.report.actioned`, `community.user.blocked`, `community.user.unblocked`.
- Feature flag: `FEATURE_COMMUNITY_MODERATION` default OFF.

**Builder dispatch:** Opus 4.8, R31, fresh worktree `backend-community-v1-5`. Brief written the moment v1-4 merges; do not pre-dispatch.

**Audit:** GPT-5.5 R1; same R31 worktree split.

**Hard gates:**
- Zero schema mutation outside flag-gated code.
- Entitlement-guards pin 17/17.
- Re-use existing RLS pattern from v1-4; no schema additions without `FEATURE_COMMUNITY_MODERATION` flag.
- Tests: report-creates-row, block-filters-fanout, block-filters-reads, idempotent report-twice.

---

### 2.3 v1-6 — COMMUNITY PROFILES + FOLLOW + FEED

**Expected scope:**
- User profile page (avatar, bio, milestones, recent posts).
- Follow / unfollow.
- "Following" feed view (alongside global feed).
- Suggested-to-follow (cold-start: coach + top milestone hitters).
- Telemetry: `community.profile.viewed`, `community.follow.created`, `community.feed.viewed`.
- Feature flag: `FEATURE_COMMUNITY_FOLLOWS` default OFF.

**Builder dispatch:** Opus 4.8, R31, fresh worktree.

**Hard gates:** same template as v1-4/v1-5.

---

### 2.4 v2 — COMMUNITY EVENTS + CHALLENGES + LEADERBOARDS

**Expected scope:**
- Time-bounded community events ("30-day squat challenge", "coach-led streak week").
- Leaderboards (opt-in, anonymizable).
- Event-scoped reactions / posts.
- Event-creation flow (coach-only).
- Push: event-start, leaderboard-position-change, event-end.
- Telemetry: `community.event.created`, `community.event.joined`, `community.event.completed`, `community.leaderboard.viewed`.
- Feature flag: `FEATURE_COMMUNITY_EVENTS` default OFF.

**Builder dispatch:** Opus 4.8, R31, fresh worktree.

**Hard gates:** same template.

**v2 ships → Tier 3 unlocks (CC32).**

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

**Dispatch trigger:** v2 community PR merged + all in-flight Tier 1 work complete.

---

## 5. Tier 4 — Queued operator decisions

| Item | Blocker |
|---|---|
| BUG-R4 AWS SDK dep PR | Operator must approve adding `@aws-sdk/client-s3` to the dependency tree (zero-new-deps gate vs export need). |
| BUG-R5 StripeConnect injection into GdprScrubService | Operator design call. |
| $1 fee-formula reconcile in bank-payout spec $1k ACH example | Worked-example arithmetic typo. Formula correct (`2% + 50% × (card_cost - stripe_actual_cost)` → ~$32.15/$1k ACH). |

These do NOT block any Tier 1 / 2 / 3 work.

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

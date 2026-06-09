# Handoff — TGP Community Expansion Build

**From:** Outgoing operator
**To:** Next operator
**Date:** 2026-06-08 19:00 PT
**Status:** v1-3 just shipped (PR #368 merged as `ed78bbef`). v1-4 is NEXT and not yet dispatched.

> **READ THIS DOCUMENT END-TO-END BEFORE TOUCHING ANYTHING.** Dynasia runs a deca/hectacorn-quality bar with a strict adversarial audit cycle. Skipping any rule below will get caught by the next auditor and you will have to redo the work — twice. There are no shortcuts.

---

## 1. Who you are working for, and the quality bar

You are working for **Dynasia G** (`<dynasia@trygrowthproject.com>`), founder/operator of **The Growth Project (TGP)**, a coaching platform. Repo owner is `BradleyGleavePortfolio`.

The standing R0 verbatim:

> **"ALWAYS BUILD TO DECACORN QUALITY + LAUNCH READINESS, NEVER STUB DATA, NEVER SILENT FAILURES, NEVER QUICK PATCHES — DO THE WORK RIGHT!"**

This is not aspirational. Every PR is audited by an adversarial third-party AI (fresh GPT-5.5, no context from the builder) before merge. Every claim you make in a builder/fixer report is verified by direct shell inspection. The auditors **will** catch:

- Stubs, mocks, or placeholder data left in non-test code
- Silent failures (catch blocks that swallow, default `false` returns that hide errors)
- Test skips without `console.warn` skip reasons (R66)
- Schema mutations sneaked into non-schema PRs (R69)
- Endpoint counts misstated by more than ±1
- Test pass-count drift between two runs of the full suite (R67)
- Any reference to Sonnet 4.6 (which is forbidden — see model policy below)
- Customer-data isolation gaps (this is the **DIRTY-CRITICAL** category — instant rollback consideration)

**The standing rule that supersedes asking the user:**

> **"once an auditor has deemed CLEAN, always merge, no waiting on me"**

Extended transitively (per the user's correction in this thread): after a slice ships, dispatch the next dependency-cleared slice immediately. Only pause at slices that explicitly require product input (the v3-x band of the execution plan). Do not stop to ask "shall I proceed to v1-4?" after v1-3 lands. **Just go.**

---

## 2. The PR audit cycle — internalize this before doing anything else

This is the single most important section. Every PR follows this cycle. Deviating from it is a fireable offense (figuratively — but Dynasia will notice and call it out).

### The cycle

```
[BUILD] (Opus 4.8)
   ↓
[R1 AUDIT] (fresh GPT-5.5) → CLEAN? merge. DIRTY? continue.
   ↓
[R2 FIXER] (Opus 4.8) — surgical fixes per audit findings only
   ↓
[R2 AUDIT] (fresh GPT-5.5, brand-new context) → CLEAN? merge. DIRTY? continue.
   ↓
[R3 FIXER] (Opus 4.8) — surgical
   ↓
[R3 AUDIT] (fresh GPT-5.5, brand-new context)
   ↓
... repeat until CLEAN ...
   ↓
[ADMIN-SQUASH-MERGE] on CLEAN — no waiting on user
```

### Verdict taxonomy

- **CLEAN** — no blocking findings; merge immediately
- **DIRTY** — blocking findings exist, but no customer-data isolation/RLS/leak/default-OFF kill-switch surface broke
- **DIRTY-CRITICAL** — at least one customer-data isolation, leak, RLS, or default-OFF kill-switch surface broke. Triggers immediate rollback consideration. **v1-3 hit this once.** Took an R3 round to fix.

The auditor MUST end their report with exactly one line: `VERDICT: CLEAN` / `VERDICT: DIRTY` / `VERDICT: DIRTY-CRITICAL`.

### Hard rules of the cycle (R31)

- **Builder ≠ auditor ≠ fixer.** Same agent cannot play two roles on one PR.
- **Every audit round uses a FRESH auditor** with no context from the builder, prior auditors, or fixers. Pass them only the audit brief and tell them to verify by direct shell inspection.
- **Auditors do not modify code.** Verify only.
- **Fixers do not self-audit.** They apply the brief's fixes and report.

### Model policy (NON-NEGOTIABLE)

| Role | Model | Notes |
|---|---|---|
| Builders | Opus 4.8 (`claude_opus_4_8`) | |
| Fixers | Opus 4.8 (`claude_opus_4_8`) | |
| Code auditors | GPT-5.5 (`gpt_5_5`) | Must be FRESH per round |
| Visual auditors | Opus 4.8 (`claude_opus_4_8`) | (rare — for UI work) |
| **Sonnet 4.6** | **FORBIDDEN** | The auditor will grep for "sonnet" in the diff. Any reference and you fail H4. |

### Subagent type to use

- **Prefer `codebase` subagent type** for builders, fixers, and auditors when accessing the worktree.
- **Fallback: `general_purpose`** if `codebase` returns "Paused sandbox not found" (this happened 3 times in a row this session — see Section 9, infrastructure notes). `general_purpose` works fine; it just needs to receive worktree-reconstruction instructions in the objective.

### How to dispatch (template)

```python
run_subagent(
    subagent_type="codebase",
    model="claude_opus_4_8",  # or gpt_5_5 for auditors
    task_name="v1-X R<n> <role>",
    working_directory="/tmp/wt-builder-v1-X",  # if codebase type
    objective="""
    [Identity + role + R31]
    [Pointer to AUTHORITATIVE BRIEF file in workspace]
    [Standing rules block — copy from this handoff, Section 2]
    [Self-verification checklist]
    [Output file path]
    """,
    preload_skills=["coding"],
)
```

### When the cycle is done

```bash
gh pr merge <PR#> --repo BradleyGleavePortfolio/growth-project-backend \
  --squash --admin \
  --subject "community: v1-X <slice title> (#<PR#>)" \
  --body ""
```

`--admin` is required because the `rls-tier1-policies.spec.ts` CI job fails on an env-pre-existing issue unrelated to community work. This precedent was set on v1-2 (PR #367) and has been the norm since. Do NOT touch `test/rls-*` or `.github/workflows/**` to "fix" CI — that's out of scope. Just admin-merge once CLEAN.

---

## 3. Repos and key files — read in this order

### Repos

| Repo | Purpose | Where it lives |
|---|---|---|
| `BradleyGleavePortfolio/growth-project-backend` | Backend NestJS + Prisma. All community work lands here. | Worktrees at `/tmp/wt-builder-v1-X` |
| `BradleyGleavePortfolio/tgp-agent-context` | Plans + journal + audit findings. Persistent across sandbox death. | `/tmp/tgp-agent-context` |
| `BradleyGleavePortfolio/growth-project-mobile` | React Native client. Community v1-5/v1-6 will touch this. | Not yet cloned for community work — clone fresh when v1-5 starts |

### Must-read files (read these IN ORDER on day one)

#### From `tgp-agent-context/` (persistent — survives sandbox death):

1. **`COMMUNITY_PRODUCT_PLAN.md`** — the WHY. Read first, 15 min. Product vision behind the v1/v2/v3 phases.
2. **`COMMUNITY_EXECUTION_PLAN.md`** — the WHAT. 14 slices total (v1-1 through v3-4), each with: title, branch name, scope, files touched, deps, tests, rollout flags, kill switches, audit checklist. **This is the source of truth for every PR's scope.**
3. **`COMMUNITY_PARALLELIZATION_PLAN.md`** — the WHEN. Dispatch schedule, dependency graph, which slices can run in parallel (v1-5 ∥ v1-6 is the first parallel pair). Includes a doc-map section at the top that lists every other file. **Read this section twice — it's the navigation map.**
4. **`STEP0_COMMUNITY_INTEGRATIONS_AND_GAPS.md`** — pre-flight inventory. What integrations are live/dead/missing. Used to justify v1-3+ dependency decisions (e.g., "no SMS provider", "Expo push only").
5. **`COMMUNITY_BUILD_JOURNAL.md`** — R64 live log. Every state change on every PR is appended here and pushed before the next action. **You will append to this file every time a state changes.** Tail it on day one to see exactly where v1-3 left off.

#### From `growth-project-backend/` (in the worktree):

6. **`AGENT_RULES.md`** — R0 through R70 (the canonical rule book). Open this and skim every R-rule. The ones that bite hardest:
   - **R0** — quality bar (verbatim above)
   - **R31** — builder ≠ auditor ≠ fixer
   - **R61** — push every ~2 minutes (sandboxes die)
   - **R64** — persist state to `tgp-agent-context` at every state change
   - **R66** — full suite must run before push; no silent test skips (use `itLive`/`describe.skip` with `console.warn` reason)
   - **R67** — full suite must run twice with byte-identical pass counts
   - **R68** — typed DTOs everywhere
   - **R69** — zero schema mutation outside schema PRs (`git diff main..HEAD -- prisma/` must be empty)
   - **R70** — fail-fast lane: `npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts test/diagnostic-prompt-doctrine.spec.ts --runInBand` must be 15/15 green at every checkpoint
7. **`docs/REPO_DOCTRINE_GUARDS.md`** — index of doctrine guard tests, R70 fail-fast lane at the top.
8. **`docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md`** — the v1-1 ADR. Sets precedent for how doctrine collisions get resolved.

#### From `/home/user/workspace/` (ephemeral per-PR artifacts — summarize before sandbox recycle):

These accumulate as you do each PR. They're the contracts between rounds of a single PR's audit cycle. After merge, copy the conclusion into `COMMUNITY_BUILD_JOURNAL.md` and let the workspace files die with the sandbox.

| Kind | Naming pattern | Created when | Discarded when |
|---|---|---|---|
| `BUILDER_BRIEF` | `COMMUNITY_V1-X_BUILDER_BRIEF.md` | Before builder dispatch | After PR merge |
| `BUILDER_REPORT` | `COMMUNITY_V1-X_BUILDER_REPORT.md` | Written by builder | After audit verdict |
| `AUDITOR_BRIEF` | `COMMUNITY_V1-X_R<n>_AUDITOR_BRIEF.md` | Before each audit round | After CLEAN verdict |
| `AUDIT_REPORT` | `COMMUNITY_V1-X_R<n>_AUDIT_REPORT.md` | Written by auditor | After PR merge |
| `FIXER_BRIEF` | `COMMUNITY_V1-X_R<n>_FIXER_BRIEF.md` | Only when audit was DIRTY | After next audit CLEAN |
| `FIXER_REPORT` | `COMMUNITY_V1-X_R<n>_FIXER_REPORT.md` | Written by fixer | After next audit CLEAN |

**Rule:** if you want to keep one of these around for the next session, copy the conclusion into `COMMUNITY_BUILD_JOURNAL.md` first. Workspace files do not survive across sessions.

---

## 4. Current state — where v1-3 left off

### What just landed

- **PR #368** (`feature/community-v1-feed-messages`) — squash-merged at `2026-06-09T01:31:53Z` as commit **`ed78bbef`**.
- v1-3 ships: posts (7 endpoints), messages (5), reactions (6), DMs (4), moderation (3) = **25 endpoint decorators** across 5 sub-modules.
- Took R1 (DIRTY, 4 fixes) → R2 fixer → R2 audit (DIRTY-CRITICAL, real DM listThreads leak) → R3 fixer → R3 audit CLEAN.

### What's at `main` now

```
ed78bbef community: v1-3 posts messages reactions (#368)    ← latest
d84ceb27 community: v1-2 backend module foundation (#367)
6160fd86 docs: R66-R70 build discipline rules (#366)
7e851d8a community: v1-1 schema workspace cohorts (#365)
... (RLS preflight commits)
```

### Status board

| Slice | Title | Status |
|---|---|---|
| v1-1 | schema + workspaces/cohorts/memberships | ✅ SHIPPED |
| v1-2 | feed + win-posts + reactions seed | ✅ SHIPPED |
| v1-3 | posts + messages + reactions + DMs + moderation | ✅ SHIPPED |
| **v1-4** | **realtime + push + telemetry** | **🟡 NEXT — not yet dispatched** |
| v1-5 | mobile client UI (parallel-eligible with v1-6) | ⚪ blocked on v1-4 |
| v1-6 | mobile coach UI (parallel-eligible with v1-5) | ⚪ blocked on v1-4 |
| v2-1 | plan-context tags (chips on messages) | ⚪ blocked on v1-6 |
| v2-2 | coach ack signals (seen/acked/replied) | ⚪ blocked on v2-1 |
| v2-3 | event objects (5-state lifecycle + RSVP) | ⚪ blocked on v2-2 |
| v2-4 | AI inbox triage (co-pilot, never autonomous) | ⚪ blocked on v2-3 |
| v3-1 | challenges (opt-in, no public shame) | ⚪ blocked on v2-4 |
| v3-2 | classroom posts (media + time-locks) | ⚪ blocked on v3-1 |
| v3-3 | voice notes (signed upload + entitlement) | ⚪ blocked on v3-2 |
| v3-4 | search + wearable-aware coach prompts | ⚪ blocked on v3-3, P0-0A, P0-0B |

Per the parallelization plan: **3 cycles to launch-ready** (v1-1 → v1-2 → v1-3 → v1-4 → (v1-5 ∥ v1-6) → v2-1...), **7 cycles to fully done** (vs 12 strict-serial). The parallel pair v1-5 ∥ v1-6 unlocks after v1-4. **All v2 and v3 slices are strict-serial** per the dependency declarations; the parallelization plan analyzed them and found no safe pair (each one touches files the next one extends).

### The three phases — what each delivers

The execution plan splits into three phases. The handoff above covered v1-1 → v1-3 (foundation shipped) and v1-4 (next). Here's what every remaining slice ships and what the platform looks like once each phase is in.

#### Phase 1 — Foundation (v1-1 → v1-6) — "can a coach and client talk inside a workspace?"

| Slice | Title | What it ships | Why it matters |
|---|---|---|---|
| v1-1 ✅ | schema + workspaces/cohorts/memberships | 11 Prisma models, partitioned messages table, RLS Tier 5 coverage | Foundation — every later slice writes against these tables |
| v1-2 ✅ | feed + win-posts + reactions seed | 5 read endpoints, kill switch, entitlement guards | Read-only feed — coaches can see the surface exists |
| v1-3 ✅ | posts + messages + reactions + DMs + moderation | 25 endpoints across 5 sub-modules, gateDmRead helper, comment isolation | Full write surface — clients can post, message, react, report |
| **v1-4** 🟡 | **realtime + push + telemetry** | broadcast layer, Expo push fan-out, PostHog event names | The feed comes alive — no more REST polling |
| v1-5 | mobile client tab (~2200 LOC) | `CommunityTabScreen`, `Today/Space/Thread/DM/Composer` screens, `communityApi.ts`, `ClientNavigator` wiring | Clients finally SEE Community in the app |
| v1-6 | coach admin inbox (~1900 LOC) | `CoachCommunityHomeScreen`, `Inbox/Lab/Cohorts/Moderation` screens, cohort CRUD, moderator actions with audit-log rows | Coaches finally USE Community |

**End of Phase 1 = launch-ready.** A coach onboards a cohort, clients join via invite, messages and posts flow, moderation works, realtime + push deliver, telemetry lands in PostHog. This is the minimum shippable product. Everything after is the moat.

#### Phase 2 — Coaching Loop (v2-1 → v2-4) — "does this make coaches more effective?"

This is where TGP stops being "a community feature" and becomes the coaching loop the product plan describes. Each slice ties messages back to the client's plan.

- **v2-1 — plan-context tags (~1000 LOC)** — Every message can be tagged to a workout, meal, habit, or check-in. Renders as a chip on the message; filterable by plan tag. Backend verifies ownership before allowing a tag (no client trusts a plan ID coming from the client). Flag: `FEATURE_COMMUNITY_PLAN_TAGS`. Audit-critical: no client can tag a foreign plan item.
- **v2-2 — coach ack signals (~850 LOC)** — Replaces full read receipts (which Slack research showed members hate) with a coach-only explicit signal: `seen`, `acked`, `replied`. SLA timer, badge state ordering, telemetry. Kill switch hides badges but keeps timestamps for analytics. Audit-critical: badges never imply medical or emergency support (this is a coaching product, not 911).
- **v2-3 — event objects (~1600 LOC)** — First-class event with five states (`upcoming` → `tomorrow` → `live` → `replay attached` → `reflected`), RSVPs, scheduling integration. External video links validated (no native live-room until provider chosen). Kill switch renders events as read-only cards; write endpoints disabled.
- **v2-4 — AI inbox triage (~1400 LOC)** — Aggregates a coach's unanswered messages, summarizes patterns ("3 clients flagged sleep this week"), suggests draft replies. **Critical:** AI never sends autonomously, source IDs always attached, prompt scoped to the coach's tenant only. Kill switch hides AI cards; human inbox stays. This is where the Coach AI vision lands.

**End of Phase 2 = the coaching loop.** Messages aren't a chat blob — they're a timeline of the client's plan. Coaches don't grind through unread counts — they triage with AI assistance. Events aren't "@channel announcements" — they're objects with a lifecycle.

#### Phase 3 — The Moat (v3-1 → v3-4) — "why would a coach leave Skool/Geneva for this?"

These are the differentiators that no general-purpose community tool can replicate. They require the coaching context, the plan timeline, and (for v3-4) the wearable integration.

- **v3-1 — challenges (~1600 LOC)** — Opt-in, cohort-only. Coach defines reward (free week, merch, 1:1 call) — platform never imposes. **No public ranking visible by default** (this is the explicit anti-shame design from the product plan). Members opt in to see leaderboard. Moderation extends to challenge comments.
- **v3-2 — classroom posts (~1500 LOC)** — Media-backed posts with **release time locks** (no scrolling ahead through coach-released content). Signed upload via existing `coach-media` adapter, membership-gated access, pinned lessons, replay cards. Audit-critical: media URL access checks coach workspace AND cohort membership.
- **v3-3 — voice notes (~1200 LOC)** — Voice composer with signed upload, bucket assertion, duration/size/MIME limits. Provider extraction from `messaging.service.ts` (avoids the forbidden double-cast pattern flagged in the execution plan landmines). Kill switch hides mic affordance; text send remains. Privacy copy explicitly states who can listen.
- **v3-4 — search + wearable-aware coach prompts (~1800 LOC)** — Intent-driven search ("find" not "search" — see product plan §3.4). Plus **the moat**: wearable-aware coach prompts. "3 of you slept under 6h last night — take it easy on volume." Only generates for opted-in clients, prompt source sample IDs recorded, fallback when connector disabled. Depends on P0-0A + P0-0B (already shipped — that's why those preflights ran).

**End of Phase 3 = full platform.** A coach can ship a 12-week cohort with media-locked lessons, voice notes, opt-in challenges, AI-triaged inbox, and biometric-aware prompts. No other tool on the market can do all of this in one place. This is the hectacorn pitch.

---

### Product vision — what the user feels at the end

From `COMMUNITY_PRODUCT_PLAN.md` §0 (verbatim):

> TGP Community = the place a client opens five times a day to feel seen, accountable, and forward-moving on their plan — without ever feeling like they are inside a Slack workspace or a noisy Facebook group. It is *not* a chat product. It is a **coaching loop with messaging primitives**, where every message, post, and reaction is a signal that informs the next coach action and the next client behavior.

The **10 design pillars** (product plan §2 — internalize these; they constrain every PR):

1. **Spaces, not channels** — 3 fixed types (`Lab`, `Cohort`, `Direct`). No arbitrary channels. Caps visible surface at ~5-15 items (vs Slack's 50+).
2. **Messages live on the client's plan timeline**, not in a chat blob (v2-1 delivers this).
3. **The Lab is a *post*, not a chat** — coach broadcast feed, one per coach.
4. **Coach ack signals, not read receipts** (v2-2). Coach-only seen/acked/replied. No member shame.
5. **Time-locked content** — coach-released, no scrolling ahead (v3-2).
6. **The "Today" object** — universal home for everything happening for ME. `CommunityTodayScreen` ships in v1-5.
7. **Opt-in challenges, never always-on leaderboards** (v3-1).
8. **Wearable-aware coach prompts** (v3-4 — the moat).
9. **Coach AI as a first-class community participant** — `@coachAI` tagging, auto-summary, draft assist. Never autonomously sends as the coach (v2-4).
10. **No member-to-member DM by default in free programs** (v1-3 already ships this — `dm_enabled_default=false`).

**Bottom-tab order in the client app once shipped:**
1. Home (calm daily summary)
2. Food (meal logging)
3. Workout (workout tracking)
4. Coach AI (Perplexity Sonar chat)
5. **Community** ← this feature

**Coach context mirrors this** with admin + member-health overlays.

---

### The aggregate surface — what ships when everything's done

Once v3-4 lands, here's what exists:

**Backend (`growth-project-backend/src/community/`):**
- 11+ Prisma models (workspaces, memberships, cohorts, messages partitioned, posts, comments-as-messages, reactions, DMs, moderation, events, challenges, classroom assets, voice uploads, search index, wearable prompts)
- ~15 sub-modules: `messages`, `posts`, `reactions`, `dms`, `moderation`, `realtime`, `notifications`, `telemetry`, `plan-context`, `ack`, `events`, `ai-triage`, `challenges`, `classroom`, `voice`, `search`, `wearable-prompts`
- ~80+ endpoint decorators (v1-3 alone shipped 25; later slices add 4-15 each)
- ~15+ feature flags, all default-OFF except `FEATURE_COMMUNITY_TELEMETRY` (default ON in staging)
- Kill switches at every layer: global feature flag, per-workspace policy gate, per-membership override
- RLS Tier 5 policies covering every table (already shipped in preflight)
- 17+ entitlement guard pins (monotonically increasing across slices — auditor checks this stays monotonic)

**Mobile (`growth-project-mobile/src/`):**
- Client screens (~15): `CommunityTabScreen`, `CommunityTodayScreen`, `CommunitySpaceScreen`, `CommunityThreadScreen`, `CommunityDmListScreen`, `CommunityDmThreadScreen`, `CommunityComposerScreen`, `CommunityEventDetailScreen`, `CommunityChallengeDetailScreen`, `CommunityClassroomScreen`, `CommunityFindScreen`
- Coach screens (~7): `CoachCommunityHomeScreen`, `CoachCommunityInboxScreen`, `CoachCommunityLabScreen`, `CoachCommunityCohortsScreen`, `CoachCommunityCohortDetailScreen`, `CoachCommunityModerationScreen`, `CoachCommunityEventsScreen`
- Components: `PlanTagChip`, `CoachAckBadge`, `EventCard`, `AiTriageCard`, `ChallengeCard`, `ChallengeProgressSheet`, `LessonCard`, `VoiceNoteComposer`, `WearablePromptCard`, plus base components
- Realtime client (`src/services/realtime.ts`) wired to the broadcast contract from v1-4
- Push channels (`src/notifications/push-channels.ts`) — Expo push, no SMS
- 9+ `EXPO_PUBLIC_FF_*` flags shadowing the backend ones

**Telemetry (PostHog — already wired in the codebase):**
- Event taxonomy lands in v1-4; every slice afterward emits to it
- Coach-side: triage usage, ack SLA compliance, moderation actions, AI prompt acceptance rate
- Client-side: session depth, prompt response rate, challenge participation, voice-note send rate
- Privacy: no PII in event payloads; lock-screen privacy respected for push (no message body if user opted)

**Total estimated LOC across all 14 slices:** ~17,000 LOC (backend + mobile combined). v1-1 → v1-3 alone shipped ~6,000+ LOC.

### Three product questions outstanding for Dynasia (do NOT block v1-4 → v1-6 on these)

From `COMMUNITY_PRODUCT_PLAN.md` §7 — these need product input before the related v2/v3 slice goes wide, but Phase 1 ships without them:

1. **Voice notes scope (v3-3)** — only client→coach, only coach→client, or both? Default in execution plan is both, but product plan flags this as open.
2. **Challenge reward types (v3-1)** — "free week, merch credit, 1:1 call" placeholder. Real reward catalog and fulfillment process needs Dynasia.
3. **AI triage tone (v2-4)** — how directive should Coach AI suggestions be? Suggest-only vs draft-with-edit vs auto-draft-on-deadline. Defaults to suggest-only but the dial is exposed in the spec.

These surface in the relevant slice's builder brief as explicit "please confirm product intent before going wide." If Dynasia doesn't answer in time, default-to-conservative (most restrictive option) is the rule.

### Carried-forward BLOCKERS for a future schema PR (not v1-4 territory)

These are intentional limitations of the v1-3 schema-stable approach. They each have a single named relax point in v1-3 code, ready for mechanical migration once the schema PR lands:

1. **`dm_policy:enum('coach_only','members','disabled')` on `CommunityWorkspace`** — currently using `dm_enabled_default:boolean`. Relax point: `gateDmRead()` / `authoriseDm()` / `resolveDmEnabled()` in `src/community/dms/community-dms.service.ts`.
2. **`clientPostsEnabled:boolean` on `CommunityWorkspace`** — currently coach/owner-only. Relax point: `canCreatePost()` in `src/community/posts/community-posts.service.ts`.
3. **First-class `CommunityComment` model** — currently comments are `CommunityMessage` rows tagged `plan_context_type='community_post_comment'`. Relax point: `COMMENT_CONTEXT_TYPE` filter in `src/community/messages/community-messages.repository.ts:137` plus three guards in `community-messages.service.ts`.

When the schema PR is ready, search for these named symbols and update them. Do NOT pile these into v1-4.

### What I was about to do but didn't

After PR #368 merged, I asked Dynasia "shall I proceed to v1-4?" instead of just doing it. She corrected me: the standing CLEAN-→-merge rule extends transitively. **Just dispatch v1-4. Don't ask.**

She also asked me to write this handoff before continuing. So v1-4 is the next thing for you (or for me-next-session).

---

## 5. v1-4 — what to do next (executable plan)

Read `COMMUNITY_EXECUTION_PLAN.md` section "### PR v1-4" (line 252) for the authoritative scope. High-level summary:

- **Branch:** `feature/community-v1-realtime-push-telemetry` off current `main` (`ed78bbef`).
- **Worktree:** `/tmp/wt-builder-v1-4` — clone fresh from main.
- **Scope:**
  - `src/community/realtime/**` — broadcast layer for domain events (post created, message created, reaction added, moderation action). Build on existing realtime pattern noted in execution plan lines 61-73.
  - `src/community/notifications/**` — push notification fan-out via existing Expo push channel pattern (lines 84-103 of execution plan).
  - `src/community/telemetry/**` — event emitters for analytics (audit existing `src/telemetry/**` for conventions before adding).
  - Wire domain events emitted by v1-3 services (posts/messages/reactions/moderation) to realtime broadcasts and push.
- **Feature flags:**
  - `FEATURE_COMMUNITY_REALTIME` (default OFF)
  - `FEATURE_COMMUNITY_PUSH` (default OFF)
  - `FEATURE_COMMUNITY_TELEMETRY` (default ON — telemetry is observability, not user surface)
- **Kill switches:** the two OFF-by-default flags above. Telemetry is fail-open (best-effort, never blocks the main request).
- **Tests:** new e2e specs in `test/community/` for:
  - `community-realtime.e2e.spec.ts` — domain event → broadcast wiring
  - `community-push.e2e.spec.ts` — Expo push fan-out (mocked at the adapter boundary)
  - `community-telemetry.e2e.spec.ts` — event emission shapes
  - All `itLive`-gated with `console.warn` (R66)
- **Schema:** zero mutation (R69). If you find yourself wanting a column, it goes in the schema PR queue (see Section 4 BLOCKERS).
- **Entitlement guards carry-forward:** the next pin-set must extend `entitlement-guards-mounted.spec.ts` from **17/17** (current v1-3 state) to cover any new realtime/push endpoints. The auditor will check this count is monotonically increasing.

### Day-one dispatch sequence (literal steps)

1. **Resync state:**
   ```bash
   cd /tmp/tgp-agent-context && git pull
   tail -100 COMMUNITY_BUILD_JOURNAL.md   # confirm last entry is v1-3 CLOSEOUT
   ```
2. **Set up v1-4 worktree:**
   ```bash
   cd /tmp && git clone https://github.com/BradleyGleavePortfolio/growth-project-backend.git wt-builder-v1-4
   cd /tmp/wt-builder-v1-4 && git checkout -b feature/community-v1-realtime-push-telemetry
   npm ci --no-audit  # or npm install if ci fails
   ```
3. **Write the v1-4 builder brief** at `/home/user/workspace/COMMUNITY_V1-4_BUILDER_BRIEF.md`. Template the brief on the v1-3 one (which is excellent): scope, feature flags, rate limits, body validation, test surfaces, R66-R70 compliance, carry-forward entitlement pins.
4. **Dispatch Opus 4.8 builder** as `codebase` subagent. Working directory: `/tmp/wt-builder-v1-4`.
5. **Push journal checkpoint** ("v1-4 builder dispatched") immediately after dispatch. R64.
6. **Wait → R1 audit → fixer cycles → CLEAN → admin-merge.**
7. After merge: **immediately set up v1-5 and v1-6 worktrees in PARALLEL** (separate branches, separate worktrees). Both can dispatch builders simultaneously. See parallelization plan for file-ownership rules so they don't collide.

---

## 6. Technical knowledge you need

### Stack

- **Backend:** NestJS (TypeScript), Prisma (PostgreSQL), Jest for tests. Adapter-pattern preferred (see existing realtime/push adapters before writing your own).
- **Auth:** JWT via `JwtAuthGuard`. Role gating via `RolesGuard`. Feature flags via `CommunityFeatureFlagGuard` + per-feature `Community<X>EnabledGuard`. Per-workspace gates inside service methods (e.g., `gateDmRead`).
- **Validation:** **Zod for response schemas, class-validator for request DTOs** (this split was established in v1-3 — keep it).
- **Mobile:** React Native + Expo. Realtime over WebSocket. Push via Expo push channels. **No SMS provider** (per Step 0 inventory).

### Code patterns that work

- **Repository pattern** for Prisma access. Service consumes repository, controller consumes service. Don't bypass.
- **Constant-named context discriminators** (e.g., `COMMENT_CONTEXT_TYPE = 'community_post_comment'`). Import the constant; never hardcode the string.
- **Single source of truth for gate logic.** v1-3 R3 lesson: when you have two methods that both need a gate (`listThreads` + `authoriseDm`), factor a helper (`gateDmRead`) and call it from both. Don't duplicate the check.
- **Kill switches at controller level** via `@UseGuards(...Community<X>EnabledGuard)`. Per-workspace policy gates inside service methods. Both layers must exist.
- **Moderation routes stay UP under content freeze.** Critical: if `FEATURE_COMMUNITY_MESSAGES` or `FEATURE_COMMUNITY_POSTS` is OFF mid-incident, moderation endpoints must still work. Use a separate flag set for moderation (`CommunityFeatureFlagGuard` only, NOT the write-flag guards).
- **Default-OFF is the customer-data isolation default.** Any workspace-scoped feature defaults to OFF and requires explicit opt-in. The auditor will probe this.

### Code patterns that get caught

- ❌ Returning DM/post/message data without going through the per-workspace gate (this was the v1-3 R2 DIRTY-CRITICAL)
- ❌ `it.skip(...)` without `console.warn` (R66 silent-skip violation)
- ❌ Touching `prisma/**` in a non-schema PR (R69 instant DIRTY-CRITICAL)
- ❌ Mocking real services in non-test code "for now" (R0 no-stubs)
- ❌ Catch blocks that swallow exceptions and return defaults
- ❌ Hardcoding string literals that should be imported constants
- ❌ Endpoint counts misstated by more than ±1 (honesty violation — R2 caught the v1-3 fixer claiming "28 endpoints" when actual was 25)
- ❌ Any commit with `Co-Authored-By` / `Generated-By` / emoji / body / trailers — commits are TITLE-ONLY, author `Dynasia G <dynasia@trygrowthproject.com>`

### Commit hygiene (verbatim — auditor checks H1)

```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "community: v1-X <short title>"
```

- Title-only, no body
- No emoji
- No `Co-Authored-By`
- No `🤖 Generated with [Claude Code]` or similar trailers
- Author must be `Dynasia G <dynasia@trygrowthproject.com>` exactly

### Testing patterns (REQUIRED)

```typescript
// At the top of every new e2e spec:
const itLive = liveDbUrl() ? describe : describe.skip;

itLive('community-X', () => {
  beforeAll(() => {
    if (!liveDbUrl()) {
      console.warn(
        '[SKIP] community-X.e2e.spec.ts: COMMUNITY_TEST_DATABASE_URL not set',
      );
    }
  });

  it('1. <case description>', async () => { ... });
  it('2. <case description>', async () => { ... });
});
```

The `console.warn` is REQUIRED by R66. The auditor will grep for `it.skip(` or `describe.skip(` without an adjacent `console.warn` and flag DIRTY.

### Verification commands you'll run repeatedly

```bash
# R69 — zero schema mutation
git diff main..HEAD -- prisma/

# R70 fail-fast lane (must be 15/15)
npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts test/diagnostic-prompt-doctrine.spec.ts --runInBand

# Carry-forward entitlement guards (must monotonically increase)
npx jest test/entitlement-guards-mounted.spec.ts --runInBand

# Type check
npx tsc --noEmit

# RLS / .github untouched (must be empty)
git diff main..HEAD --name-only -- test/rls-* .github/

# Endpoint decorator count (per sub-module)
grep -rnE "@(Get|Post|Patch|Delete|Put)\(" src/community/
```

---

## 7. The R64 protocol — journal everything

**R64 rule:** the journal at `tgp-agent-context/COMMUNITY_BUILD_JOURNAL.md` is appended to and pushed at **every state change**. The workspace is ephemeral; the journal is your only persistent memory across sandbox death.

State changes that trigger a journal append:

- Subagent dispatched (builder, fixer, auditor)
- Subagent completed with verdict
- PR opened
- PR merged
- BLOCKER discovered and deferred
- Infra issue encountered (sandbox death, etc.)

### Journal append template

```bash
cd /tmp/tgp-agent-context && cat >> COMMUNITY_BUILD_JOURNAL.md << 'EOF'

## v1-X <state change description> — YYYY-MM-DDTHH:MMZ

- <bullet 1>
- <bullet 2>
- <head SHA if applicable>
- <verdict / next action>
EOF
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" add COMMUNITY_BUILD_JOURNAL.md
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "journal: v1-X <state change>"
git push
```

Use `api_credentials=["github"]` on the `bash` calls that push.

---

## 8. Tools and credentials

### Subagent dispatch
- `run_subagent` with `subagent_type="codebase"` (preferred) or `"general_purpose"` (fallback)
- `wait_for_subagents` after dispatch — you do NOT poll, you wait for the system notification

### GitHub
- **`gh` CLI via `bash` with `api_credentials=["github"]`** — preferred for ALL GitHub ops (PR view/edit/merge, branch ops, status checks)
- **NEVER `browser_task` for GitHub** (system reminder reinforced this — too slow, hits auth issues)
- The `github_mcp_direct` connector exists but `gh` CLI is the primary path

### Git operations
- Always use `git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "..."` (don't rely on global git config)
- `git push` from `tgp-agent-context` and from worktrees works with `api_credentials=["github"]`

### Other connectors available
- `posthog__pipedream` — analytics (will matter for v1-4 telemetry)
- `supabase` — DB operations (rarely needed — Prisma is primary)
- `finance` — irrelevant to community work

---

## 9. Known infrastructure issues

### Sandbox death — "Paused sandbox 019ea55f-1fe1-7dd3-b426-eb8c674208aa not found"

Hit 3 consecutive times on `codebase` subagent dispatches today (2026-06-08). Same UUID each time — looks like a stuck paused-sandbox reference or cleanup race in the platform.

**Workaround:** if `codebase` subagent fails with this error, retry once. If it fails again, fall back to `general_purpose` subagent type and include worktree-reconstruction instructions in the objective:

```
If /tmp/wt-builder-v1-X does not exist, reconstruct:
  cd /tmp && git clone https://github.com/BradleyGleavePortfolio/growth-project-backend.git wt-builder-v1-X
  cd wt-builder-v1-X && git fetch origin <branch> && git checkout <branch>
Use api_credentials=["github"] for all gh/git operations.
```

Engineering ticket filed: **`e2209543`** (logged via `system_diagnostic`).

### CI red on `rls-tier1-policies.spec.ts`

Pre-existing env issue, unrelated to community work. **DO NOT try to fix it.** Admin-merge precedent set on v1-2 (PR #367) and confirmed on v1-3 (PR #368). Use `gh pr merge <N> --squash --admin` on CLEAN.

---

## 10. Decisions that have been made (do not relitigate)

These came up during v1-1 through v1-3 and are settled:

1. **`app.current_user_id()` for RLS** — v1-1 ADR (`docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md`). Path A chosen.
2. **Partitioned messages table** — v1-1 schema. Cohort-id partitioning. Don't suggest alternatives.
3. **Zod for responses, class-validator for requests** — established v1-3. Keep the split.
4. **Comments stored as `CommunityMessage` rows with `plan_context_type='community_post_comment'`** — deferred to schema PR. Don't add a `CommunityComment` model in v1-4.
5. **DM gate via `dm_enabled_default:boolean` + per-membership override** — temporary until schema PR adds `dm_policy:enum`. Don't change the model in v1-4.
6. **Moderation kill switch is independent of content freeze** — moderation stays UP. Already encoded in v1-3 controller guards.
7. **`itLive` uses `describe.skip` (not `it.skip`)** — the brief example said `it/it.skip` but every spec uses `describe.skip` with `console.warn`. Both are R66-compliant; the discrepancy is auditor-acknowledged. Match existing pattern.
8. **Admin-merge on CLEAN despite red CI** — RLS spec env-pre-existing failure, precedent set v1-2.
9. **No SMS provider in stack** — push is Expo-only.

---

## 11. Quick reference — the "I just sat down" checklist

```
[ ] Read this handoff doc end-to-end
[ ] Pull tgp-agent-context: cd /tmp/tgp-agent-context && git pull
[ ] Tail journal: tail -100 COMMUNITY_BUILD_JOURNAL.md (confirm last entry is v1-3 closeout at 01:32Z)
[ ] Read COMMUNITY_PRODUCT_PLAN.md (15 min)
[ ] Read COMMUNITY_EXECUTION_PLAN.md sections "### PR v1-4" through "### PR v1-6" (10 min)
[ ] Read COMMUNITY_PARALLELIZATION_PLAN.md doc-map + cycle schedule (10 min)
[ ] Skim AGENT_RULES.md in backend repo (R0, R31, R61, R64, R66-R70) (5 min)
[ ] Verify backend main is at ed78bbef: gh api repos/BradleyGleavePortfolio/growth-project-backend/commits/main --jq .sha
[ ] Set up /tmp/wt-builder-v1-4 worktree on a new branch off main
[ ] Write COMMUNITY_V1-4_BUILDER_BRIEF.md modeled on V1-3
[ ] Dispatch Opus 4.8 builder as codebase subagent
[ ] Append "v1-4 builder dispatched" to journal and push (R64)
[ ] Wait → R1 audit → cycle until CLEAN → admin-merge → repeat for v1-5 ∥ v1-6 in parallel
```

---

## 12. What "done" looks like for v1-4 (acceptance preview)

The R1 auditor on v1-4 will check (this is your forward-shaped self-test):

- All 3 new e2e specs exist, `itLive`-gated, `console.warn` on skip
- Realtime broadcasts wire to every v1-3 domain event (post created, message created, reaction added/removed, moderation report/action)
- Push fan-out goes through Expo adapter, NOT direct to APN/FCM
- Telemetry events have stable shapes, documented in a constants file
- All 3 new feature flags are referenced by both controller guards AND a kill-switch e2e case
- `git diff main..HEAD -- prisma/` empty (R69)
- R70 lane 15/15
- `entitlement-guards-mounted.spec.ts` has new pins for v1-4 endpoints (count > 17)
- Moderation broadcasts/pushes remain UP under content freeze
- No silent test skips, no Sonnet refs, commit hygiene clean
- PR description endpoint count matches actual decorator count ±1

---

## 13. If you only remember three things

1. **Standing rule supersedes asking the user.** CLEAN → merge → next slice. No "shall I proceed?" between slices. Pause only at v3-x for product input.
2. **Every audit round = fresh GPT-5.5 with zero builder context.** R31 is non-negotiable.
3. **R64 — journal every state change to `tgp-agent-context` and push immediately.** Sandboxes die. The journal is your only persistent memory.

Good luck. Dynasia is precise, fast, and will catch sloppiness. The bar is high but the process is clear. Follow the cycle, trust the auditor, and ship.

— Outgoing operator

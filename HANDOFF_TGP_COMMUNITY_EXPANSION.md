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
- Test skips without `SKIP-BECAUSE` annotation (R69)
- Schema mutations sneaked into non-schema PRs (v1-3-scope rule, not R-numbered — see landmines)
- Endpoint counts misstated by more than ±1
- Builder/fixer pushing without running full `npx jest --runInBand` to completion (R66)
- Dispatching a subagent without writing a row to `handoffs/dispatch.json` first (R67)
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
   - **R66** — Full-Suite-Before-PR: `npx jest --runInBand` to completion before force-push, logged to `/home/user/workspace/`. Pre-existing failures listed in `docs/PRE_EXISTING_TEST_FAILURES.md` may be excluded by name in log header.
   - **R67** — Dispatch-State-Persisted: before waiting on any spawned subagent, push a row `{ts, subagent_id, role, worktree, base_sha, branch, brief_path}` to `handoffs/dispatch.json` in `tgp-agent-context`. Recovery breadcrumb if parent sandbox dies.
   - **R68** — Doctrine-Decision-Of-Record: every doctrine/guard/banned-token/invariant/naming change MUST land as merged ADR under `docs/decisions/NNNN-<slug>.md`. No verbal/journal-only doctrine changes.
   - **R69** — Skipped-Tests-Are-Red: any `it.skip`, `describe.skip`, `xit`, `xdescribe` needs `// SKIP-BECAUSE: <reason> — owner: <name> — expires: <YYYY-MM-DD>` immediately above. Env-gated skips (`liveDbUrl() ? describe : describe.skip`) are exempt but still need a comment block.
   - **R70** — Fail-Fast Pre-Push Lane (<30s, run BEFORE R66 full suite):
     ```
     npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts \
              test/diagnostic-prompt-doctrine.spec.ts --runInBand
     ```
     Must be 15/15 green. This is the lane that would have caught PR #365's `Reaction`-token regression in 6s instead of 26-min CI cycles. See `docs/REPO_DOCTRINE_GUARDS.md` for canonical guard-test index.
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
- **Schema:** zero mutation (v1-3-scope rule, enforced by auditor via `git diff main..HEAD -- prisma/` empty check — NOT R69). If you find yourself wanting a column, it goes in the schema PR queue (see Section 4 BLOCKERS).
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
- ❌ `it.skip(...)` without `SKIP-BECAUSE` annotation comment (R69 violation)
- ❌ Touching `prisma/**` in a non-schema PR (v1-3-scope DIRTY-CRITICAL — auditor greps `git diff main..HEAD -- prisma/`)
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

The `console.warn` is REQUIRED by R69 (the auditor accepts it as an inline SKIP-BECAUSE equivalent for `itLive`-gated specs). The auditor will grep for `it.skip(` or `describe.skip(` without an adjacent `console.warn` or `// SKIP-BECAUSE:` comment and flag DIRTY.

### Verification commands you'll run repeatedly

```bash
# v1-3-scope — zero schema mutation (NOT R-numbered)
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
[ ] Skim AGENT_RULES.md in backend repo — rules 1-14 standing + R31, R56-R61, R64, R66-R70 (10 min, see Section 14 verbatim)
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
- `git diff main..HEAD -- prisma/` empty (v1-3-scope rule)
- R70 lane 15/15
- `it.skip`/`describe.skip` either env-gated with `console.warn` or annotated with `// SKIP-BECAUSE:` (R69)
- `handoffs/dispatch.json` updated for every subagent spawned this slice (R67)
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


---

## 14. Gaps audit — verbatim rules, landmines, inventory (added on operator handoff)

This section was added after a final-pass gap audit of the handoff. It captures the
material the prior sections referenced but did not enumerate: the 14 standing rules,
the worktree discipline R56-R61, the full R66-R70 build discipline rules verbatim,
every landmine carried forward from the execution plan, the existing `src/community/`
module inventory you'll inherit, and the additional backend docs you should skim.

### 14.1 Fourteen standing rules (verbatim from `AGENT_RULES.md:1-16`)

1. EVERYTHING MUST BE BUILT TO DECACORN QUALITY.
2. ALL NEW FEATURES MUST BE BUILT, AUDITED BY CHATGPT 5.5, FIXED PER THE AUDIT, AUDITED AGAIN, AND FIXED AGAIN UNTIL CLEAN.
3. ASSUME THE OWNER HAS THE TECH KNOWLEDGE OF A 7TH GRADER. EXPLAIN CHOICES IN SIMPLE LANGUAGE.
4. ASK QUESTIONS FOR CLARITY AT EVERY NEW FEATURE PROJECT.
5. AVOID THE 50 DOCUMENTED PATTERN FAILURES OF AI CODING AT ENTERPRISE SCALE.
6. NEVER KICK THE CAN. FIX ISSUES AT THE ROOT THE MOMENT THEY APPEAR.
7. DECACORN QUALITY / DEPTH / ENTERPRISE GRADE / 99.99% UPTIME IS THE GOAL.
8. CHECKOUT MUST FEEL IN-APP AND BRANDED — NEVER VISIBLY LEAVE THE APP.
9. NO RAW ERROR CODES TO USERS. EVERY ERROR MUST BE STRUCTURED AND CLEAR.
10. ALWAYS DEFAULT TO THE HIGHEST QUALITY, MOST THOROUGH PATH (DECACORN DEFAULT).
11. NEVER DELETE FEATURES OR SHRINK FEATURE ABILITIES. ALWAYS BUILD OUTWARD.
12. THE OWNER CANNOT CHECK FLY OR GCP VALUES DIRECTLY — DO NOT ASK.
13. OAUTH CONSENT SCREEN MUST BE IN PRODUCTION MODE (LAUNCHING IN FRONT OF 800 PEOPLE).
14. ALWAYS BUILD WITH THE LATEST VERSION OF ALL "PLUMBING" — DEPENDENCIES, LIBRARIES, SDKS, RUNTIMES, GITHUB ACTIONS, TOOLING. WHEN STARTING ANY NEW FEATURE OR PR, USE THE NEWEST STABLE VERSION OF EVERY DEPENDENCY IT TOUCHES. WHEN DEPENDABOT OPENS AN UPGRADE PR, "MERGE IT" IS THE DEFAULT OUTCOME. MAJOR-VERSION BREAKS GET THEIR OWN PR + AUDIT, NEVER DEFERRED INDEFINITELY. STALE PLUMBING IS TECH DEBT.

### 14.2 Worktree discipline R56-R61 (verbatim)

These were codified after the CHECKOUT-HARDENING trampling incident — parallel subagents
in the same worktree ran independent `git checkout` operations and destroyed each
other's uncommitted work. Plus a Claude Code runtime exit dropped 8 concurrent
subagents at once, exposing that uncommitted sandbox work is unrecoverable.

**R56 — One subagent per worktree, always.** Before spawning any code-writing subagent
(codebase / general-purpose with file edits in a repo), the parent MUST create a
dedicated `git worktree add` path. Subagent objective MUST contain the exact absolute
path and the instruction "work ONLY in this directory; do not cd elsewhere."

**R57 — `backend-main` and `mobile` are READ-ONLY for subagents.** They exist for
inspecting current main and as a stable source of symlinkable `node_modules` /
`prisma.config.ts`. No subagent ever writes there. If a subagent's objective directs
work into backend-main or mobile, the objective is malformed and must be rejected
before spawn.

**R58 — Worktree naming convention.** Format:
`/home/user/workspace/tgp/{repo}-{short-task-slug}`. Examples:
`backend-272-fix`, `backend-checkout-hardening`, `backend-dunning`,
`mobile-wb-fix`. Slug is short, lowercase, hyphenated, unique per concurrent task.
Parent maintains a slug → subagent_id ledger.

**R59 — Pre-flight worktree check.** Before spawning a code-writing subagent, run
`ls /home/user/workspace/tgp/` and confirm target path doesn't already exist. If
orphaned: reuse only if same branch and clean; otherwise `git worktree remove
--force` then add fresh, or pick a new slug. Never silently overwrite.

**R60 — Audits get worktrees too.** R31 audit subagents that checkout PR branches
need isolated worktrees per R56. Use slug pattern `{repo}-{task}-audit` (e.g.
`backend-wb-audit`).

**R61 — Push to GitHub every 2 minutes, always.** Every active worktree with
uncommitted or unpushed work must be force-pushed to GitHub at minimum every 2
minutes. If the sandbox dies right now, all ongoing work must be preserved on the
remote. The parent agent runs
`git add -A && git -c user.email=... commit -m "wip-autopush: $(date -Iseconds)" && git push -u origin $BRANCH`
for every active branch on every natural breakpoint (after spawning subagents,
before waiting, after each completion). Uncommitted work on a sandbox is
unrecoverable. Push first, push often.

### 14.3 Build discipline R66-R70 (verbatim, supersedes Section 1's earlier paraphrases)

Codified after the community v1-1 PR #365 unblock. The PR sat red for 5 days on a
single `doctrine-cleanup` token collision; the round-1 auditor's sandbox died before
completing, the dispatch state was lost, and the original builder shipped without
running the full test suite locally. R66-R70 close those holes. See
`docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md` for the
precipitating incident.

**R66 — Full-Suite-Before-PR.** Every builder/fixer MUST run `npx jest --runInBand`
to completion BEFORE force-pushing. Targeted subsets are fine for iteration, but
the push itself is gated by a full green suite — recorded to a log file in
`/home/user/workspace/`. No exceptions; partial runs hide cross-suite regressions
(the class of failure that killed PR #365 in the first place). Pre-existing
grandfathered failures are listed in `docs/PRE_EXISTING_TEST_FAILURES.md` and may
be excluded ONLY by name in the log header.

**R67 — Dispatch-State-Persisted.** When the parent agent dispatches any
code-writing or auditing subagent, it MUST also push a row to
`handoffs/dispatch.json` in `tgp-agent-context` BEFORE waiting:
`{ts, subagent_id, role, worktree, base_sha, branch, brief_path}`. This is the
recovery breadcrumb if the parent sandbox dies mid-flight. Dispatch-without-persist
is forbidden; the next operator must be able to resume from `dispatch.json` alone.

**R68 — Doctrine-Decision-Of-Record.** Every decision that affects a doctrine
guard, a banned-token list, an invariant test, or a repo-wide naming convention
MUST land in a merged Markdown file under `docs/decisions/NNNN-<slug>.md` (ADR
format). The decision is not in force until that PR is merged. No verbal/Slack/
journal-only doctrine changes — those vanish when sandboxes die. See
`docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md` for the template.

**R69 — Skipped-Tests-Are-Red.** Any `it.skip`, `describe.skip`, `xit`, or
`xdescribe` in a committed test file MUST be annotated with a
`// SKIP-BECAUSE: <reason> — owner: <name> — expires: <YYYY-MM-DD>` comment on
the line immediately above. CI rejects PRs where an unannotated skip appears.
Environment-gated skips (`liveDbUrl() ? describe : describe.skip`) are exempt
because the skip reason IS the gate expression — but the surrounding comment
block must still say what the gate means.

**R70 — Fail-Fast Pre-Push Lane.** Before the full R66 suite, builders MUST run
the <30s doctrine fail-fast lane first:

```
npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts \
         test/diagnostic-prompt-doctrine.spec.ts --runInBand
```

If the fast lane is red, fix BEFORE running the full suite. This is the lane that
would have caught PR #365's `Reaction`-token regression in 6 seconds instead of
26-minute CI cycles. See `docs/REPO_DOCTRINE_GUARDS.md` for the canonical
guard-test index and recommended fail-fast lanes for other domains.

### 14.4 R10 is RETIRED

R10 (grandfathered failing tests on `main` allowed while domain ticket exists) is
RETIRED as of 2026-05-26. The 3 remaining grandfathered failures turned out to be
stale test-helper bugs (A1-C5-P1-1, A1-C5-P1-3, A1-C5-P1-4), all fixed in
`chore/r10-cleanup-fix-stale-tests`. New CLEAN bar:
**CI green + 0 P0 + 0 P1 + 0 P2** on `main` at all times. Old PRs/audits citing R10
remain traceable but new work must not invoke it. See `docs/PRE_EXISTING_TEST_FAILURES.md`.

### 14.5 Full landmines list (from `COMMUNITY_EXECUTION_PLAN.md`)

Every Community PR must avoid copying these patterns or stumbling into these traps:

**Code-pattern landmines (do NOT copy):**

- `src/messaging/messaging.service.ts:614-623` uses a forbidden double-cast pattern around Supabase signed upload methods.
- `src/coach-media/supabase-storage.provider.ts:82`, `:132`, `:176`, `:213` — forbidden double-cast around Supabase Storage methods.
- `src/supabase/supabase.service.ts:21` — broad transport cast; avoid in new Community Realtime code.
- `src/services/realtime.ts:78-96` (mobile) suppresses Realtime failures too quietly; Community handlers MUST log redacted diagnostics and fall back to polling.
- `src/coach/brief/coach-brief.scheduler.ts:132` and `:166` use a forbidden scheduler cast; do not copy that test seam.

**API/DTO mismatch landmines:**

- `src/api/messagesApi.ts:137-150` (mobile) posts `parent_message_id` but backend `src/messaging/messaging.dto.ts:62-74` does not declare it; threaded replies fail under strict validation. Community DTOs must declare every field the mobile client sends.

**Schema/migration landmines:**

- Legacy `Message` and `CoachMessage` overlap semantically; the schema PR must keep them separate and introduce new `Community*` tables (Community PRs do NOT mutate either legacy table).

**Naming landmines:**

- Backend roles and schema use `student`, but Bradley wants UI-visible copy to say `client`. Mobile UI strings, push notification bodies, and DTO `displayName` fields go through the `student → client` swap. Backend column names stay `student`.
- Banned placeholder launch wording exists in current mobile tests and comments. Do not add assertions, comments, or docblocks with that wording. The auditor greps for it.

**Test infrastructure landmines (these will cost you hours if you forget):**

- Backend Jest CLI filter is `--testPathPatterns` (plural). Mobile Jest CLI filter is `--testPathPattern` (singular). Same flag spelled different across the two repos.
- Backend `jest.config.js:4` has `roots: ['<rootDir>/test']`, so any spec you put under `src/` will be silently invisible to Jest. All new specs go under `test/`. (R66 will pass and you'll still ship broken code if you forget this.)

**Notification/UX landmines:**

- Notification defaults must avoid Slack-style noise. Default cohort chatter push should be off or digest-only unless the user opts in.
- Old preview wording and stub comments must be replaced with real loaded/empty/error/locked states BEFORE enabling flags.

**Live-call/event landmines:**

- Mux supports video/replay assets, but group live-call infrastructure is not present. Community events must support external links or Mux replay before any native live rooms.

**Build-order landmines (sequencing constraints):**

- Wearables preflight patches land BEFORE wearable-aware Community prompts are enabled.
- Community schema + RLS land BEFORE any REST, Realtime, or mobile UI flags are enabled.

**R0 landmines (will fail audit if copied):**

- Current repos contain legacy forbidden cast, ignore, and swallowed-rejection patterns; every Community PR must fail review if it adds more.

### 14.6 Existing `src/community/` module inventory (post-v1-3 state on `main` @ `ed78bbef`)

When you check out a new v1-X worktree from `main`, this is the file tree you inherit.
Do not delete or restructure these — extend them.

```
src/community/
├── community-access.service.ts        # entitlement+role gating helper
├── community-feature-flag.guard.ts    # read-flag guard (FEATURE_COMMUNITY_READ)
├── community-schema.feature.ts        # schema-presence detector
├── community-write-flag.guard.ts      # write-flag guard (FEATURE_COMMUNITY_WRITE)
├── community.controller.ts            # main entry (cohorts, today, me, workspace)
├── community.dto.ts                   # top-level DTOs re-export
├── community.module.ts                # Nest module wiring
├── community.repository.ts            # cohort/workspace data access
├── community.service.ts               # cohort/workspace business logic
├── dms/
│   ├── community-dms.controller.ts
│   ├── community-dms.repository.ts
│   └── community-dms.service.ts
├── dto/
│   ├── community-cohort.dto.ts
│   ├── community-dm.dto.ts
│   ├── community-me.dto.ts
│   ├── community-message.dto.ts
│   ├── community-moderation.dto.ts
│   ├── community-post.dto.ts
│   ├── community-reaction.dto.ts
│   ├── community-today.dto.ts
│   ├── community-workspace.dto.ts
│   └── disabled-response.dto.ts       # typed kill-switch response
├── messages/
│   ├── community-messages.controller.ts
│   ├── community-messages.repository.ts
│   └── community-messages.service.ts
├── moderation/
│   ├── community-moderation.controller.ts
│   ├── community-moderation.repository.ts
│   └── community-moderation.service.ts
├── posts/
│   ├── community-posts.controller.ts
│   ├── community-posts.repository.ts
│   └── community-posts.service.ts
└── reactions/
    ├── community-emoji.allowlist.ts   # canonical emoji set
    ├── community-reactions.controller.ts
    ├── community-reactions.repository.ts
    └── community-reactions.service.ts
```

**Pattern rules carry-forward:**

- Controllers stay thin; business logic lives in services; data access lives in repositories.
- Every public endpoint goes through BOTH `CommunityFeatureFlagGuard` (read flag) and `CommunityWriteFlagGuard` (write flag) when the endpoint mutates. The auditor pins guard count in `test/community/entitlement-guards-mounted.spec.ts` — when v1-4 adds endpoints, the pin count goes up.
- Every endpoint must return a typed `DisabledResponseDto` when its flag is off (no raw 404 / 503).
- All DTOs use class-validator + class-transformer with strict mode; no `any`, no `as unknown as`.

### 14.7 Additional backend docs the next operator should skim

Beyond `AGENT_RULES.md` (already covered), these docs hold context the next operator
will need at least once:

- `docs/CONTEXT.md` — the standing "what is this repo" briefing.
- `docs/HOUSE_RULES.md` — repo-specific style/architecture rules layered on top of AGENT_RULES.
- `docs/PROJECT_STATE.md` — current launch readiness state, owned features, in-flight workstreams.
- `docs/BACKLOG.md` — work not yet sequenced; useful when scoping v1-4+ to confirm nothing duplicates.
- `docs/PRE_EXISTING_TEST_FAILURES.md` — the only failures R66 lets you exclude by name in the log header.
- `docs/REPO_DOCTRINE_GUARDS.md` — canonical guard-test index, R70 fail-fast lane definition, recommended fail-fast lanes for other domains.
- `docs/AI_MOBILE_PATCH_INSTRUCTIONS.md` — required reading before any mobile-touching slice (v1-5 onwards).
- `docs/SPEC_coach_brief.md` — coach-brief spec; touched indirectly by v2-x Coach Console changes.
- `docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md` — the ADR that R66-R70 came from. Read this so the rules feel concrete, not abstract.

### 14.8 Persistent context layout (`tgp-agent-context` repo)

Everything in `/tmp/tgp-agent-context/` survives sandbox death because it's pushed to
the `tgp-agent-context` GitHub repo. The next operator clones it and reads:

- `HANDOFF_TGP_COMMUNITY_EXPANSION.md` (this file) — the entry point.
- `COMMUNITY_PRODUCT_PLAN.md` — authoritative WHY (product vision).
- `COMMUNITY_EXECUTION_PLAN.md` — authoritative WHAT for all 14 slices (read the slice you're about to ship in full).
- `COMMUNITY_PARALLELIZATION_PLAN.md` — authoritative WHEN/CONCURRENCY (only v1-5 ∥ v1-6 are parallel).
- `STEP0_COMMUNITY_INTEGRATIONS_AND_GAPS.md` — pre-flight inventory of integration gaps.
- `COMMUNITY_BUILD_JOURNAL.md` — R64 live log of every slice round (READ THE LATEST ENTRY FIRST — it tells you what state v1-3 / v1-4 / etc landed in).
- `handoffs/dispatch.json` — R67 dispatch breadcrumbs. If parent sandbox died mid-flight, this tells you what subagents were live.

### 14.9 Final reminder on the bar

Dynasia's bar is decacorn (Rule 1) and hectocorn-trajectory (Rule 7's spirit). Every
PR you ship gets read by an operator who will be running it in front of 800 paying
clients. R0 ("ALWAYS BUILD TO DECACORN QUALITY + LAUNCH READINESS, NEVER STUB DATA,
NEVER SILENT FAILURES, NEVER QUICK PATCHES — DO THE WORK RIGHT!") is the rule that
overrides every other shortcut you might be tempted to take. When in doubt, do more
work, not less. The standing rule (CLEAN → merge → next slice, no asking between
slices) is your trust contract — honor it by being right, not by being fast.


---

## 15. Operational fine print (final gap-audit pass)

The earlier sections cover **what** to do. This section covers the **how** that
bites if you guess wrong — exact file shapes, known broken state, and where the
authoritative source lives for each unanswered question.

### 15.1 `handoffs/dispatch.json` — exact shape

R67 references this file but never shows its schema. It's an **array of objects**
at `tgp-agent-context/handoffs/dispatch.json`. Current content (as of handoff
write) — note this is STALE and you should fix it as your first R67 act:

```json
[
  {
    "ts": "2026-06-08T21:54:00Z",
    "subagent_id": "builder-v1-2-community-foundation",
    "role": "builder",
    "worktree": "/tmp/wt-builder-v1-2",
    "base_sha": "6160fd8638dd99af1c8bd964338d379bba99d273",
    "branch": "agent/builder/v1-2/community-foundation",
    "brief_path": "/home/user/workspace/COMMUNITY_V1-2_BUILDER_BRIEF.md",
    "pr_number": 367,
    "task": "community v1-2 backend module foundation"
  }
]
```

**Known R67 violation to clean up:** v1-3's builder, auditor, fixer, and round-2
auditor were all dispatched WITHOUT writing dispatch.json rows. The slice shipped
fine (PR #368 → `ed78bbef`) but the breadcrumb trail is missing. Before
dispatching v1-4, the next operator should either (a) backfill v1-3 rows
post-hoc from `COMMUNITY_BUILD_JOURNAL.md`, or (b) leave a note in the journal
acknowledging the gap and start clean from v1-4.

**Required fields per row:** `ts` (ISO8601 UTC), `subagent_id`, `role`
(`builder` | `auditor` | `fixer`), `worktree` (absolute path), `base_sha`
(full SHA, not short), `branch`, `brief_path` (workspace absolute path).
**Recommended extras:** `pr_number` (once PR is opened), `task` (one-line
human summary), `parent_subagent_id` (when a fixer is responding to a
specific auditor finding).

**Push cadence:** append the row BEFORE calling `wait_for_subagents` —
never after. The whole point is recovery if the parent dies mid-wait.

### 15.2 Auditor briefs are a separate deliverable

The handoff calls out builder briefs (`COMMUNITY_V1-X_BUILDER_BRIEF.md`) but
not auditor briefs. Every v1-X slice produces **3-5 brief files** in
`/home/user/workspace/` per round:

- `COMMUNITY_V1-X_BUILDER_BRIEF.md` — scope, files, flags, tests, audit
  rubric. Lives in workspace, referenced from `dispatch.json`.
- `COMMUNITY_V1-X_R<N>_AUDITOR_BRIEF.md` — fresh per round (R31). Tells
  the GPT-5.5 auditor what to grep for, what's in scope, what to ignore,
  and the CLEAN/DIRTY/DIRTY-CRITICAL rubric.
- `COMMUNITY_V1-X_R<N>_FIXER_BRIEF.md` — written only if previous round
  was DIRTY. Lists the auditor findings with exact file:line targets.
- `COMMUNITY_V1-X_R<N>_AUDITOR_REPORT.md` — auditor's verdict + findings.
  Persisted to `tgp-agent-context/_audit_v1-X_R<N>_code_GPT55.md` after
  each round.
- `COMMUNITY_V1-X_R<N>_FIXER_REPORT.md` — fixer's response. Persisted
  to `tgp-agent-context/_fixer_result_v1-X_R<N>.md`.

The persistent copies under `tgp-agent-context/_audit_*` and `_fixer_*`
are the durable trail. The workspace copies die with the sandbox.

### 15.3 v1-4 quick-reference (so you don't have to grep)

Pulled verbatim from `COMMUNITY_EXECUTION_PLAN.md:252-263`:

- **Title:** `community: v1-4 realtime push telemetry`
- **Branch:** `feature/community-v1-realtime-push`
- **Scope:** backend + mobile infra, **~1100 LOC**
- **Files:**
  - `src/community/realtime/**` (new subdir)
  - `src/community/notifications/**` (new subdir)
  - `src/notifications/notification-category.enum.ts`
  - `src/notifications/notification-kind.ts`
  - `src/notifications/notifications.service.ts`
  - mobile `src/services/realtime.ts` (touch — remember R57: mobile is
    READ-ONLY for subagents UNLESS the slice's stated scope is mobile;
    v1-4 *does* touch mobile, so spawn a separate `wt-builder-v1-4-mobile`
    worktree if needed)
  - `src/notifications/push-channels.ts`
  - telemetry helpers (PostHog event constants file)
- **Dependencies:** v1-3 (✅ shipped).
- **Tests required:**
  - Broadcast ping contract test
  - No-PII-in-broadcast-payloads test (audit-critical)
  - Push preference default test
  - Digest route test
  - PostHog event names pinned (constants file + spec)
- **Feature flags (3 new):**
  - `FEATURE_COMMUNITY_REALTIME` — default OFF
  - `FEATURE_COMMUNITY_PUSH` — default OFF
  - `FEATURE_COMMUNITY_TELEMETRY` — default OFF in prod, ON in staging
- **Kill switch behavior:** disable Realtime and push while REST polling
  continues to work. Polling is the floor — Realtime is the optimization.
- **Audit-critical (DIRTY-CRITICAL if violated):** no message body content
  in broadcast payloads or push payloads when lock-screen privacy is
  enabled. Push body says "New message in {space}" — never the message text.
- **entitlement-guards-mounted pin update:** count goes up; check
  `test/community/entitlement-guards-mounted.spec.ts` for the current
  pinned count and bump it by the number of new mounted endpoints v1-4 adds.

### 15.4 Subagent infrastructure quirks (avoid repeating my mistakes)

**`codebase` subagent type — broken on this sandbox lineage.**
Three consecutive `codebase` subagent dispatches hit "Paused sandbox
019ea55f-1fe1-7dd3-b426-eb8c674208aa not found" during v1-3. Engineering
ticket `e2209543` is open. **Workaround:** use `general_purpose` subagent
type with explicit worktree-reconstruction instructions in the objective:

```
The worktree at /tmp/wt-builder-v1-X may not exist if the sandbox was
recycled. If you don't see it, reconstruct it:
  cd /tmp && git clone https://github.com/BradleyGleavePortfolio/growth-project-backend.git wt-builder-v1-X
  cd wt-builder-v1-X && git checkout -b <BRANCH> origin/main
  npm ci --no-audit
Then proceed with the task below.
```

**`github_mcp_direct` connector — present but DO NOT use.** It's listed in
the connectors block but the standing rule is `gh` CLI with
`api_credentials=["github"]` for ALL GitHub ops. The MCP version has hit
intermittent auth-token rotation issues. CLI is the source of truth.

**`browser_task` to GitHub — FORBIDDEN.** Even when GitHub is acting weird.
The CLI has retries and is rate-limit aware; the browser session isn't.

### 15.5 Owner context (what Dynasia can and cannot do for you)

Rule 12 says the owner cannot check Fly or GCP values directly. Practical
implications:

- **Don't ask Dynasia to confirm an env var is set in Fly.** They can't see it.
  If a flag isn't taking effect in staging, log it yourself via a temporary
  diagnostic endpoint (and remove the endpoint in the same PR).
- **Don't ask Dynasia to read a GCP secret value.** Same reason. If you need
  to verify a secret is wired, write a test that asserts the secret name is
  in the expected `process.env` lookup chain, not that the value matches.
- **Do ask Dynasia for product decisions, prioritization, copy choices, and
  scope tradeoffs.** They're fast and decisive on those.
- **800-people launch context** (Rule 13): there is a live product demo /
  launch in front of 800 people on the roadmap. Every PR you ship is being
  trusted to not break that demo. When weighing "ship now or polish more,"
  the answer is always polish more — Rule 1 (decacorn) and R0 supersede
  velocity every time.

### 15.6 What to do FIRST when you start

In strict order, the first 30 minutes:

1. `git clone https://github.com/BradleyGleavePortfolio/tgp-agent-context /tmp/tgp-agent-context`
2. Read `tgp-agent-context/COMMUNITY_BUILD_JOURNAL.md` — the LAST entry. It
   tells you exactly what state the expansion landed in.
3. Read `tgp-agent-context/handoffs/dispatch.json` — see if any subagents
   were dispatched and never closed out. If yes, those are zombie dispatches
   you need to either resume or reconcile in the journal.
4. Read this handoff doc end-to-end (it's ~900 lines but it's the map).
5. `cd /tmp && git clone https://github.com/BradleyGleavePortfolio/growth-project-backend backend-main`
6. `cd backend-main && git log --oneline -20` to confirm the journal's stated
   `main` SHA matches reality.
7. Skim `backend-main/AGENT_RULES.md` (the 133-line file) — Section 14 of this
   handoff has the verbatim text but read the file once anyway, it's quick.
8. Create your first v1-4 worktree per R56-R58 conventions.
9. Write the v1-4 builder brief at `/home/user/workspace/COMMUNITY_V1-4_BUILDER_BRIEF.md`.
10. **Push a row to `dispatch.json` BEFORE spawning the builder subagent (R67).**
11. Dispatch Opus 4.8 builder. Standing rule kicks in from here — CLEAN → merge
    → next slice, no asking between slices.

### 15.7 One last thing — when in doubt, ask Dynasia ONCE

The standing rule ("CLEAN → merge → next slice, no waiting on me") covers
the build/audit/merge cycle. It does NOT cover:

- **Scope questions** ("should v1-4 also touch X?") — ask once, lock the
  answer in the builder brief.
- **Product decisions** ("should push default be daily digest or real-time?")
  — ask once. Don't guess on UX defaults that affect 800 launch users.
- **Doctrine changes** ("R66 is too slow, can I skip the full suite?") — no.
  Don't even ask. Doctrine changes go through R68 (ADR), not chat.
- **Pause requests** ("should I stop here?") — never. The rule is explicit.

The cadence is: one focused question at the start of a slice if scope is
ambiguous, then heads-down until CLEAN+merged, then immediately next slice.
That's the contract.

— End of handoff.

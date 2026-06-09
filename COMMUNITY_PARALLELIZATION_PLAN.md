# Community Expansion — Parallelization Plan

**Author:** Dynasia G
**Date:** 2026-06-08
**Backend HEAD at analysis:** `d84ceb27` (post-v1-2 merge)
**Authoritative source for PR sequencing:** `COMMUNITY_EXECUTION_PLAN.md` lines 216–383

**Purpose:** Determine which of the remaining 12 community-expansion PRs (v1-3 → v3-4) can safely run in parallel without compromising R0, R31 (builder ≠ auditor), or R66–R70 (process rules). The execution plan was written as a strict linear chain; this doc replaces that assumption with a dependency-driven graph and proposes a concrete dispatch schedule.

---

## Dependency reality check

Every PR in the execution plan declares the previous one as a dependency. But "declared" and "actually required" diverge once you read the file lists.

### Per-PR file-ownership matrix

| PR | Declared deps | Backend files | Mobile files | True dependency type |
|---|---|---|---|---|
| v1-3 (in flight) | v1-2 | `src/community/{messages,posts,reactions,moderation}/**` | — | hard — needs v1-2 module + DTOs |
| v1-4 | v1-3 | `src/community/realtime/**`, `src/community/notifications/**`, `src/notifications/*` | `src/services/realtime.ts`, `push-channels.ts` | hard — broadcasts depend on v1-3 domain events |
| v1-5 | v1-4 | — | `src/screens/community/Community*Screen.tsx`, `src/components/community/**` (non-coach), `src/api/communityApi.ts`, `ClientNavigator.tsx`, `featureFlags.ts` | hard on v1-4 (realtime), soft on v1-6 (none) |
| v1-6 | v1-5 | `src/community/coach/**` | `CoachCommunity*Screen.tsx`, `src/components/community/coach/**` | hard on v1-4 (realtime), **soft on v1-5 (declared but disjoint)** |
| v2-1 | v1-6 | `src/community/plan-context/**`, `src/community/messages/**` | `PlanTagChip.tsx`, `CommunityThreadScreen.tsx` | hard on v1-6 for screens; touches `messages/**` |
| v2-2 | v2-1 | `src/community/ack/**`, `src/community/messages/**` | `CoachAckBadge.tsx`, `CoachCommunityInboxScreen.tsx` | conflicts with v1-6 + v2-1 + v2-4 on shared files |
| v2-3 | v2-2 | `src/community/events/**` | `Community/CoachCommunityEvents*.tsx`, `EventCard.tsx` | **disjoint from v2-1/v2-2/v2-4 sub-modules** |
| v2-4 | v2-3 | `src/community/ai-triage/**`, `src/coach/brief/**` | `CoachCommunityInboxScreen.tsx`, `AiTriageCard.tsx` | conflicts with v2-2 on inbox screen |
| v3-1 | v2-4 | `src/community/challenges/**` | Challenge screens/cards | **disjoint** |
| v3-2 | v3-1 | `src/community/classroom/**`, `src/coach-media/**` (reuse) | Classroom screens, LessonCard | **disjoint from v3-3** |
| v3-3 | v3-2 | `src/community/voice/**`, `src/messaging/messaging.service.ts` (extract) | Voice composer | source of v3-4 reuse |
| v3-4 | v3-3, P0-0A, P0-0B | `src/community/search/**`, `src/community/wearable-prompts/**` | Search + wearable prompt screens | hard on v3-3 voice extraction |

### Where the linear chain is REAL

1. **v1-3 → v1-4.** v1-4's broadcast contract test requires the message-send code path from v1-3 to emit domain events. You cannot test "broadcast ping contract" against an unbuilt sender. Hard serial.
2. **v1-4 → v1-5 / v1-6 (realtime half).** Mobile clients integrate Supabase Realtime channels defined in v1-4. Mobile-side stubbing of realtime channels is fragile and historically caused integration-time rework. Hard serial.
3. **v3-3 → v3-4.** v3-4 explicitly extracts the voice-upload provider from v3-3's messaging service refactor. Hard serial.

### Where the linear chain is ARTIFICIAL (declared but not required)

1. **v1-5 ∥ v1-6.** File ownership is disjoint. v1-5 owns the client navigator + client screens; v1-6 owns coach screens + `src/community/coach/**`. Only shared touchpoint is `src/api/communityApi.ts`, which is easy to split via clear file-ownership briefs.
2. **v2-1 ∥ v2-3 ∥ v3-1.** Plan tags, events, challenges all live in disjoint backend sub-modules (`plan-context`, `events`, `challenges`). Mobile screens are different files. Three-way parallelism is safe with file-ownership rules.
3. **v3-2 ∥ v3-3** (after v3-1 lands). Classroom and voice notes touch disjoint sub-modules.

### Hard conflict points (must serialize through these)

| File / module | PRs that touch it | Conflict type |
|---|---|---|
| `src/community/messages/**` | v1-3 (creates), v2-1 (plan tags), v2-2 (ack) | DTO/field additions |
| `CoachCommunityInboxScreen.tsx` | v1-6 (creates), v2-2 (ack badges), v2-4 (AI triage cards) | screen composition |
| `CommunityThreadScreen.tsx` | v1-5 (creates), v2-1 (chip integration), v3-3 (voice composer) | screen composition |
| `src/community/community.module.ts` | every backend slice (sub-module imports) | trivial — alphabetical merge usually clean |
| `src/app.module.ts` | v1-2 (touched), v1-4 (notifications module) | trivial |
| `src/messaging/messaging.service.ts` | v3-3 (typed extraction) | refactor target — touchy |
| `src/coach-media/**` | v3-2 (typed reuse) | refactor target — touchy |

---

## Concurrency constraints from the agent stack

These are real constraints, not theoretical, and they bound what parallelism actually buys us:

1. **Subagents CAN run in parallel.** The platform supports concurrent subagents. So two builders or one builder + one auditor on a disjoint PR is mechanically feasible.

2. **R31 still applies per PR.** Builder ≠ auditor. Each PR's audit must be a fresh GPT-5.5 subagent independent from its builder. Running two parallel PRs means up to 4 active subagents (2 builders or 2 builders + 1 auditor or 1 builder + 2 auditors).

3. **The merge gate is single-threaded in practice.** Bradley's standing rule "auto-merge on CLEAN, no waiting" is per-PR. Two PRs hitting CLEAN at the same moment will still serialize at the squash-merge step because the second PR must rebase if the first changed any shared file.

4. **One worktree per PR.** Each parallel builder needs its own checkout (`/tmp/wt-builder-<id>`). Workspace + sandbox are shared, so disk/RAM headroom matters. v1-5 mobile (2200 LOC, React Native) + v1-6 (1900 LOC across backend + mobile) together is the heaviest pair; should fit in 20 GB / 8 GB sandbox but worth monitoring.

5. **Journal hygiene gets harder.** With two PRs in flight, R64 checkpoints must be tagged by PR ID — never interleave state changes for different PRs in the same paragraph.

---

## Proposed dispatch schedule

### Phase A — Strict serial through launch realtime (cycles 1–2)

Cannot parallelize. Build cleanly.

| Cycle | Active PRs | Why serial |
|---|---|---|
| 1 (current) | v1-3 | v1-2 just merged; v1-4 cannot start without v1-3's domain events |
| 2 | v1-4 | v1-5/v1-6 cannot start without realtime channels defined |

### Phase B — Parallel mobile builds (cycle 3)

**Dispatch v1-5 and v1-6 simultaneously** once v1-4 merges. Two Opus 4.8 builders, two fresh GPT-5.5 auditors, written file-ownership rules.

**File ownership for v1-5 (client mobile):**
- OWNS: `src/screens/community/Community*Screen.tsx` (Tab/Today/Space/Thread/DmList/DmThread/Composer — all CLIENT screens)
- OWNS: `src/components/community/**` excluding `coach/` subfolder
- OWNS: `src/api/communityApi.ts` (canonical client API hooks)
- OWNS: `src/navigation/ClientNavigator.tsx`, `src/config/featureFlags.ts`
- DOES NOT TOUCH: any `Coach*` screen or `src/community/coach/**`

**File ownership for v1-6 (coach admin):**
- OWNS: `src/community/coach/**` (backend)
- OWNS: `src/screens/community/CoachCommunity*Screen.tsx` (Home/Inbox/Lab/Cohorts/CohortDetail/Moderation)
- OWNS: `src/components/community/coach/**`
- DOES NOT TOUCH: `src/api/communityApi.ts` — if a coach API hook is needed, place it in `src/api/coachCommunityApi.ts` and document the split
- DOES NOT TOUCH: any client (non-coach) screen

**Merge order:** whichever returns CLEAN first merges; the second rebases on the new main, re-runs fail-fast lane (R70), and re-pushes. R67 (idempotent full suite ×2) verifies post-rebase before the second merge.

**Cycle savings:** 1 cycle (would otherwise need cycles 3 + 4 sequential).

### Phase C — Launch (after v1-6)

Cut the launch from `main` post-v1-6. v2 and v3 are deferrable.

### Phase D — Extension fan-out (cycle 4)

**Three-way parallel: v2-1 ∥ v2-3 ∥ v3-1.** Disjoint backend sub-modules (`plan-context`, `events`, `challenges`), disjoint mobile screen sets. Three Opus 4.8 builders, three fresh GPT-5.5 auditors.

**Defer to cycle 5:**
- v2-2 (ack signals) — conflicts with v2-1 on `messages/**` and with v2-4 on `CoachCommunityInboxScreen.tsx`.
- v2-4 (AI triage) — conflicts with v2-2 on inbox screen.

### Phase E — Serial through conflict points (cycle 5)

| Order | PR | Why this order |
|---|---|---|
| 1 | v2-2 | Ack signals; rebases on whichever of v2-1/v2-3/v3-1 merged last |
| 2 | v2-4 | AI triage; depends on v2-2 inbox screen state to avoid double-conflict |

### Phase F — Final fan-out (cycle 6)

**Parallel: v3-2 ∥ v3-3.** Classroom and voice are disjoint sub-modules. v3-3 must complete before v3-4 (hard reuse dependency), so v3-4 is cycle 7.

### Phase G — Search and wearables (cycle 7)

v3-4 solo. Depends on v3-3 voice extraction and on the already-merged P0-0A / P0-0B wearable patches.

---

## Cycle count comparison

| Strategy | Cycles to launch-ready (v1-6 merged) | Cycles to fully done (v3-4 merged) |
|---|---|---|
| Strict serial (plan as written) | 4 | 12 |
| **Proposed parallelism** | **3** | **7** |

**~25% saving on launch, ~42% saving on full completion.** All savings come from parallelizing disjoint file scopes — no audit gates weakened, R0 preserved.

---

## R-rule implications of parallel dispatch

| Rule | Implication |
|---|---|
| R0 | Unchanged. Each parallel PR is judged independently against the same decacorn bar. |
| R31 | Each parallel PR gets its own fresh GPT-5.5 auditor. Auditors do not share context. |
| R61 | Each builder pushes its own branch every ~2 min. No interleaving. |
| R64 | Journal entries must be tagged with PR ID. One paragraph per state change per PR. |
| R66 | Same per-PR test gates. No relaxation. |
| R67 | Each PR's full-suite idempotency check is independent. |
| R68 | Each PR ships typed DTOs. |
| R69 | Schema mutation is forbidden in any v1-3+ PR. Reaffirmed. |
| R70 | Fail-fast lane runs on each PR — and runs AGAIN on the rebasing PR after merge of its sibling. |

New rule implied by parallelization that should be added to AGENT_RULES.md:

> **R71 (Parallel-PR file ownership):** When two PRs are dispatched concurrently, each builder brief must enumerate which files/directories that PR OWNS and which it must NOT touch. Sibling builders coordinate only through shared documents (briefs, journal); they do not read each other's branches. On merge collision, the second-merging PR must rebase, re-run R70 fail-fast lane, and re-attest R67 idempotency on the rebased SHA before re-pushing.

---

## When NOT to parallelize

Parallelism is a tool, not a default. Cases where serial is correct even when files are disjoint:

1. **Bradley flags the upcoming PR as exploratory** (scope might widen, files may shift) — serial until scope settles.
2. **A prior audit flagged a cross-domain risk** (the v1-2 `ClientEntitlementGuard` move was one such case) — let that settle before adding parallel surface area.
3. **Sandbox/credit pressure** — two simultaneous builders cost ~2× the credits per cycle. Worth it for time-sensitive cycles, not for low-priority extensions.
4. **Auditor context budget** — if a PR requires reading many existing modules (e.g., v3-4 search touches both community AND wearable subtrees), give it the sandbox to itself.

---

## Action items

1. ✅ This plan committed to `tgp-agent-context` (per R64) as the canonical reference for the next session / next background agent.
2. → Add **R71 (parallel-PR file ownership)** to `AGENT_RULES.md` in the next docs PR.
3. → When dispatching v1-5 + v1-6 in cycle 3, the builder briefs must include the file-ownership sections from Phase B verbatim.
4. → When dispatching v2-1 ∥ v2-3 ∥ v3-1 in cycle 4, write a single 3-way coordination header at the top of each brief listing the other two PR IDs and their owned modules so each builder knows what it must not touch.

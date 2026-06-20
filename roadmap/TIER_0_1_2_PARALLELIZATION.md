# TIER_0_1_2_PARALLELIZATION.md — wave-by-wave dispatch order for Tier 0, Tier 1, Tier 2

**Author:** operator 48 (2026-06-19)
**Purpose:** Make merge order explicit so operators don't rebase each other's work. This doc is the **dispatch sequencing authority** for Tier 0 (Wave H carry-over) and Tiers 1–2 of [`POST_H_LADDER.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/POST_H_LADDER.md). Read this BEFORE assigning any operator to a lane.

**Governing constraints:**
- **R71** — max 5 parallel lanes at any one time.
- **R-merge-safety** (operator-stated 2026-06-19) — "I don't care if up to 4 PRs work at once, but only if they are what NEEDS to be merged first and merged safely." → parallelism is earned, not assumed. If lanes share OWNS files or shared spec files, they go sequential.
- **Tier gate doctrine** — no Tier-N+1 lane starts until every Tier-N lane is dual-CLEAN merged + `current-state.json` shows `tier_N: complete`.

**Reading guide:** Each wave below names the lanes that run in parallel inside that wave, the file collision check that makes the parallelism safe, and the gate that must close before the next wave starts. "Tier 0" in this doc = the carry-over Wave H tail (T1.A in POST_H_LADDER); it is technically inside Tier 1 but sequenced first because it owns the readiness substrate and the migration-repair PR everything else depends on.

---

## Table of contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Tier 0 — Wave H carry-over (the substrate gate)](#2-tier-0--wave-h-carry-over-the-substrate-gate)
3. [Tier 1 — Infrastructure / plumbing (waves 2-4)](#3-tier-1--infrastructure--plumbing-waves-24)
4. [Tier 2 — Security (waves 5-7)](#4-tier-2--security-waves-57)
5. [Collision matrix (one-screen view)](#5-collision-matrix-one-screen-view)
6. [Dispatch template per wave](#6-dispatch-template-per-wave)

---

## 1. How to use this doc

For each wave: dispatch every lane in the **Run in parallel** block at the same time. Each lane gets its own operator with its own dispatch prompt referencing `POST_H_LADDER.md` for the lane spec. Operators state-write to `current-state.json` on every event. The wave is done when every lane in it is dual-CLEAN merged. Then — and only then — open the next wave.

**Why "what NEEDS to be merged first":** waves are ordered by *downstream-unblocking power*, not by perceived urgency. A lane goes into an early wave if (a) its merge unblocks lanes that are otherwise rebase-trapped, or (b) it owns load-bearing substrate the rest of the tier depends on.

**Why "merged safely":** every parallel block has been checked for shared file OWNS, shared test-spec files, shared migrations, and shared services. If two lanes share *any* of those, they go sequential, not parallel.

---

## 2. Tier 0 — Wave H carry-over (the substrate gate)

**Source lane:** T1.A in `POST_H_LADDER.md` §2.1. Renamed "Tier 0" here for sequencing clarity — it is the carry-over from Wave H that must land before broader Tier 1 work can run safely.

**Why this is its own pseudo-tier:** four sub-items inside T1.A are internally sequential (they share `src/readiness/**` and `.github/workflows/h*.yml`), and one of them — the **forward-migration repair PR** — touches `prisma/migrations/` broadly and is a hard prerequisite for any new migration (T1.E TM migrations, T3.B AI economics migrations, T3.A H3 observability CI green). Until the migration repair lands, anything migration-shaped will rebase against it.

### Wave 1 — single lane, sequential merges

**Lane W1.1 — T1.A R5 audit + sequential merge of #464, #465, #466**

- **Owner files:** `src/readiness/h4-b-*`, `src/readiness/h4-d-*`, `src/readiness/h4-f-*` (the three sub-scanners).
- **Why solo:** all three PRs sit on `src/readiness/**` and share the same audit spec scaffolding. R5 audit must run on each, then merge each in sequence so the next PR rebases cleanly onto the prior.
- **Order inside the lane:** R5 on #464 → merge #464 → R5 on #465 → merge #465 → R5 on #466 → merge #466.
- **Expected PR count:** 3 merges, no new PRs.
- **Gate to Wave 2:** all three green on main, `current-state.json` updated.

### Wave 2 — up to 4 parallel lanes

After Wave 1 closes, this is the first real parallelization opportunity. All four lanes have disjoint OWNS sets — verified below.

| Lane | What it does | OWNS files | Collision check |
|---|---|---|---|
| **W2.1** | T1.A H4.H orchestrator + H5 staging config builder | `src/readiness/h4-h-*`, `.github/workflows/h4-readiness.yml`, `OPERATOR_ATTACH.md` partial | Disjoint from W2.2/2.3/2.4 |
| **W2.2** | T1.B backend Roman P4 fixer | `src/notifications/notifications.service.ts`, `test/notifications.service.spec.ts`, `test/first-payment-rollback-redelivery.spec.ts` | Disjoint from W2.1/2.3/2.4 |
| **W2.3** | T1.B mobile Roman P4 fixer | `src/screens/coach/CoachHomeScreen.tsx`, `src/components/coach/FirstPaymentWow.tsx`, `src/hooks/useFirstPaymentGate.ts` | Disjoint (mobile repo) |
| **W2.4** | T1.C lane #326 dispatcher-claim race | `src/packages/package-contents.service.ts`, `test/push-to-existing*.spec.ts` | Disjoint from W2.1/2.2/2.3 |

**Why these four and not others:**
- W2.1 unblocks H4.H → H5 → migration repair → H3 observability. It's the next critical-path step inside T1.A.
- W2.2 + W2.3 close Roman P4 — the only Tier-1 lane that has a feature flag (`FEATURE_ROMAN_FIRST_PAYMENT`) waiting on it. Doing them in Wave 2 means the flag can flip in Wave 3.
- W2.4 picks the **cleanest** T1.C P1 lane (#326 — single backend file, single spec). The other T1.C lanes (#248, #251) are deferred to Wave 3 because #251 in particular is the largest mobile fixer and would consume a full operator's bandwidth.
- T1.D Repository pattern is **deliberately not in Wave 2**. See §3 Wave 4.
- T1.E TM lanes are **deliberately not in Wave 2**. They depend on the migration repair (Wave 3) landing first.

**Gate to Wave 3:** all four lanes dual-CLEAN merged. Roman P4 `FEATURE_ROMAN_FIRST_PAYMENT=ON` can flip after W2.2 + W2.3 land.

---

## 3. Tier 1 — Infrastructure / plumbing (waves 2-4)

Wave 2 is shared between Tier 0 and Tier 1 (T1.B + T1.C #326 land inside it). Waves 3 and 4 close out Tier 1.

### Wave 3 — solo migration repair + 3 parallel T1.C lanes

After Wave 2 closes, only Wave 3.1 is solo; the other three run alongside it because they don't touch migrations.

| Lane | What it does | OWNS files | Why this slot |
|---|---|---|---|
| **W3.1** | T1.A forward-migration repair PR (sub_coach lookup table, drop CONCURRENTLY, split-by-risk) | `prisma/migrations/2026*_h*`, repair migration file(s) | Solo on migrations — must land before T1.E TM migrations and T3.B AI migrations |
| **W3.2** | T1.C #248 CommunityLessonDetail schema fix | `src/screens/community/CommunityLessonDetailScreen.tsx`, related Zod schemas | Mobile-only, disjoint from migrations |
| **W3.3** | T1.C #251 CommunityVoiceNoteDetail build + feature-flag hook + wearable-prompts hook | `src/screens/community/CommunityVoiceNoteDetailScreen.tsx` (new), feature-flag hook, wearable-prompts hook | Largest mobile fixer — disjoint from W3.2 |
| **W3.4** | T1.C #262 MWB undo re-audit + merge (already in flight) | MWB undo files (per `PHASE_2_CLEANUP_PLAN.md` §4) | Already built; this is finish-the-job |

**Why W3.1 isn't blocked by W2:** the migration repair is conceptually downstream of H4.H + H5 (it consolidates forward-migration learnings into a single PR), but it touches only migration files, not readiness files. So once W2.1 closes H4.H+H5, W3.1 can dispatch immediately.

**T1.A H3 observability (#459)** is **not** in Wave 3. It's Tier 3 work (T3.A) and gets re-triggered after Tier 1 closes — but its CI red status is what the migration repair fixes, so functionally Wave 3.1 unblocks it.

**Gate to Wave 4:** Wave 3 all dual-CLEAN merged. At this point T1.B is fully closed (W2.2+W2.3) and T1.C is fully closed (W2.4+W3.2+W3.3+W3.4). Open Phase 2 PRs #401, #399, #403, #405 piggyback as paired fixers per `PHASE_2_CLEANUP_PLAN.md` — treat as merge-only PRs inside this wave.

### Wave 4 — T1.E TM lanes (up to 3 parallel) + T1.A tail

T1.E TM PRs have file overlap on `coach-application.service.ts` and `coach-offer.service.ts` — that caps parallelism at 3, per `POST_H_LADDER.md` §2.5.

| Lane | What it does | OWNS files | Collision check |
|---|---|---|---|
| **W4.1** | T1.E TM-7a #452 admin listing moderation (re-audit + merge) | `src/talent-marketplace/admin/listings/**` | Disjoint TM sub-dir |
| **W4.2** | T1.E TM-7b #454 admin applicant review (re-audit + merge) | `src/talent-marketplace/admin/applicants/**` | Disjoint TM sub-dir |
| **W4.3** | T1.E TM-9a #451 OR TM-9b #453 (pick one — both touch `job-hunter-dashboard.service.ts`) | `src/talent-marketplace/job-hunter/**` | Run sequentially within this slot |
| **W4.4** | T1.A H6 (waits for TM-8 #449 to merge first) → R109 codebase sweep → aggregate `OPERATOR_ATTACH.md` | `src/readiness/h6-*`, full-repo sweep PR | TM-8 merges as a precondition; TM-8 itself sits inside this wave |

**Why TM-8 #449 isn't in W4.1-W4.3:** TM-8 is gated by **operator decision T1.E.1** (background check provider — in-house F-KYC vs Checkr vs Stripe Identity). That gate is open. TM-8 dispatches the moment the decision lands; until then W4.1-W4.3 run without it.

**T1.D Repository pattern is deliberately the LAST Tier-1 wave** — see Wave 5.

**Gate to Wave 5:** Wave 4 dual-CLEAN merged. Open TM lanes from §2.5 (TM-11, TM-12a/b, TM-13, TM-15) dispatch in a Wave 4.5 batch — they share `coach-application.service.ts` so cap at 2 parallel and run TM-13 only after T1.A's H4.D provider-wiring confirmed (✅ once #465 landed in Wave 1).

### Wave 5 — T1.D Repository pattern solo lane (5 sequential PRs)

**Why solo and last:** T1.D rewrites every service file in 5 domains. It collides with T1.B's `notifications.service.ts`, T1.C's `package-contents.service.ts`, and the open TM PRs' service imports. Running it concurrently with ANY of those = guaranteed rebase pain. Running it after all of them = clean substrate refactor.

| Lane | What it does | Order |
|---|---|---|
| **W5.1** | UserRepository extraction | First (most cross-cutting) |
| **W5.2** | CheckInRepository extraction | After W5.1 |
| **W5.3** | PtmRepository extraction | After W5.2 |
| **W5.4** | CoachMessageRepository extraction | After W5.3 |
| **W5.5** | ClientPurchaseRepository extraction | After W5.4 |

**Why sequential, not parallel:** every PR touches multiple service files. Two T1.D PRs in flight = same service file modified twice = rebase loop. The ladder already calls this out — "1 lane at a time."

**Gate to Tier 2:** `tier_1: complete` in `current-state.json`. All 25-30 Tier-1 PRs merged. Per-lane retrospectives logged. Then Tier 2 opens.

---

## 4. Tier 2 — Security (waves 5-7)

Tier 2 is structurally simpler than Tier 1 — fewer shared files, lanes are mostly disjoint. The main constraint is `test/roles-enforced.spec.ts` which is touched by both T2.A and T2.B → those go in different waves.

### Wave 6 — T2.A 4 parallel P1 lanes

All four T2.A P1s sit on disjoint controllers. The shared file is the `roles-enforced.spec.ts` allowlist — but T2.A only **removes** entries from it (one entry per lane, no edit overlap on the same line). Safe to parallelize.

| Lane | File | Collision check |
|---|---|---|
| **W6.1** | `src/messaging/coach-messaging.controller.ts:31-32` | Disjoint controller |
| **W6.2** | `src/storefront/storefront-public.controller.ts:55` | Disjoint controller |
| **W6.3** | `src/admin/admin.controller.ts:65-86` | Disjoint controller |
| **W6.4** | `src/ai/coach/coach-ai.service.ts:366-378` (budget gate) | Disjoint service |

**Caveat on `roles-enforced.spec.ts`:** if two lanes both delete from `LEGACY_GUARD_ALLOWLIST` simultaneously, git can usually auto-merge (different lines). But if a third PR adds a new entry concurrently, rebase. → cap at 4 parallel + serialize the allowlist-edit step at merge time (whichever PR merges first wins; the rest rebase the one-line allowlist delete).

**Gate to Wave 7:** all 4 P1 lanes dual-CLEAN merged.

### Wave 7 — T2.B sequential (4 PRs) + T2.C parallel

T2.B is the 94-ungated-routes sweep. All 4 of its PRs share `test/roles-enforced.spec.ts` → must go **sequential**, one controller family at a time. T2.C is the credential/badge engine — fully disjoint new directory (`src/credentials/**`) → can run in parallel with T2.B.

| Lane | What it does | Order |
|---|---|---|
| **W7.1** | T2.B PR 1 — auth controller family | First |
| **W7.2** | T2.B PR 2 — payments controller family | After W7.1 |
| **W7.3** | T2.B PR 3 — coach surface controller family | After W7.2 |
| **W7.4** | T2.B PR 4 — owner surface controller family | After W7.3 |
| **W7.5** | T2.C CredentialBadgeEngine spine (3-4 PRs internally) | Parallel with W7.1-W7.4 |

**T2.C internal sequencing** (per `POST_H_LADDER.md` §3.3): DB layer → service layer → controller layer → webhook integration. Sequential within the lane, but the lane as a whole runs alongside T2.B.

**T2.C pre-requisite:** **operator decision T1.E.1 must resolve** (background check provider). Without that, the Checkr integration PR can't dispatch. Operator should resolve T1.E.1 during Wave 4 so T2.C is unblocked when Wave 7 opens.

**Gate to Wave 8:** T2.B all 4 PRs + T2.C all 3-4 PRs dual-CLEAN merged.

### Wave 8 — T2.D P2 sweep (solo)

T2.D batches 5 P2 findings + B1-B9 billing P2s + A1-A9 register Part 2-3 into a single per-controller-family PR sweep. Per `POST_H_LADDER.md` §3.4: **1 lane**. 2-3 PRs total. Solo because it touches multiple controller families which by Wave 7 already had `@Roles` adjustments.

**Gate to Tier 3:** `tier_2: complete` in `current-state.json`. CI lint rules added (admin `@ApiOperation` required, `TODO:` requires issue ref, no `parseInt` on query params).

---

## 5. Collision matrix (one-screen view)

Read this when deciding whether a new lane can join an open wave. ✅ = safe to parallelize. ⚠️ = shared file, sequence required. ❌ = explosive collision, never concurrent.

|  | T1.A R5 (W1) | T1.A H4.H+H5 (W2.1) | T1.A migration (W3.1) | T1.B backend (W2.2) | T1.B mobile (W2.3) | T1.C #326 (W2.4) | T1.C #248 (W3.2) | T1.C #251 (W3.3) | T1.C #262 (W3.4) | T1.D Repos (W5) | T1.E TM (W4) | T2.A P1s (W6) | T2.B routes (W7.1-7.4) | T2.C credentials (W7.5) | T2.D P2 sweep (W8) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **T1.A R5** | — | ⚠️ same dir | ⚠️ same dir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.A H4.H+H5** |  | — | ⚠️ same dir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ migrations | ✅ | ✅ | ✅ | ✅ |
| **T1.A migration** |  |  | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ migrations | ✅ | ✅ | ⚠️ migrations | ✅ |
| **T1.B backend** |  |  |  | — | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ notifications.service | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.B mobile** |  |  |  |  | — | ✅ | ⚠️ mobile screens | ⚠️ mobile screens | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.C #326** |  |  |  |  |  | — | ✅ | ✅ | ✅ | ❌ package-contents.service | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.C #248** |  |  |  |  |  |  | — | ⚠️ community screens | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.C #251** |  |  |  |  |  |  |  | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.C #262** |  |  |  |  |  |  |  |  | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **T1.D Repos** |  |  |  |  |  |  |  |  |  | — | ❌ TM services | ⚠️ services | ⚠️ services | ✅ | ⚠️ services |
| **T1.E TM** |  |  |  |  |  |  |  |  |  |  | — | ✅ | ✅ | ⚠️ TM-12 needs T2.C | ✅ |
| **T2.A P1s** |  |  |  |  |  |  |  |  |  |  |  | — | ⚠️ roles-enforced.spec | ✅ | ✅ |
| **T2.B routes** |  |  |  |  |  |  |  |  |  |  |  |  | — | ✅ | ⚠️ controllers |
| **T2.C credentials** |  |  |  |  |  |  |  |  |  |  |  |  |  | — | ✅ |

**Five ❌ explosive collisions, all involving T1.D:** this is why T1.D goes LAST in Tier 1, not first or middle.

---

## 6. Dispatch template per wave

When opening a wave, every lane gets an operator with a dispatch prompt referencing this doc + `POST_H_LADDER.md`. The wave-open checklist:

1. **State-write check:** previous wave's `current-state.json` shows `wave_N: complete` for the predecessor wave.
2. **Operator gate check:** any open operator decisions blocking lanes in this wave are resolved. (Tracked in `OPERATOR_DECISIONS_LOG.md`.)
3. **Lane assignment:** one operator per lane in the wave's parallel block.
4. **Dispatch prompt:** each operator's prompt includes:
   - Link to `POST_H_LADDER.md` (lane spec)
   - Link to this doc (`TIER_0_1_2_PARALLELIZATION.md`) for wave context
   - Link to `AGENT_BOOTSTRAP.md` + `AGENT_RULES.md` + `DOCTRINE_INVARIANTS.md`
   - The lane's OWNS / MUST-NOT-TOUCH files
   - Acknowledgment check (anti-skim trap per the operator-49 dispatch convention)
5. **Wave-close criteria:**
   - Every lane dual-CLEAN merged
   - Every lane wrote `current-state.json` retrospective paragraph
   - No open follow-up PRs from this wave's lanes
6. **Open next wave** — repeat.

**Operator-count estimate for Tier 0+1+2 if waves run cleanly:**
- Wave 1: 1 operator
- Wave 2: 4 operators
- Wave 3: 4 operators
- Wave 4: 4 operators (+1 for TM-8 once decision lands)
- Wave 4.5: 2 operators (open TM lanes)
- Wave 5: 5 operators (sequential — same operator can cycle)
- Wave 6: 4 operators
- Wave 7: 5 operators (4 sequential T2.B + 1 T2.C parallel)
- Wave 8: 1 operator

≈ **30 operator-dispatches** across Tier 0+1+2 if every lane lands first-try. With audit loops + fixer cycles, double it → ≈ 60 operator-dispatches. That's the realistic credit-spend budget before Tier 3 opens.

---

## Operator change-log

| Date | Operator | Change |
|---|---|---|
| 2026-06-19 | 48 | Initial doc — wave-by-wave dispatch order for Tier 0, Tier 1, Tier 2 |

# POST_H_LADDER.md — what to build after Wave H lands

**Author:** outgoing operator (save-point at credit floor 2026-06-19 17:45 PDT)
**Source-of-truth:** this file + `current-state.json` + `HANDOFF_NEXT_OPERATOR.md`
**Locked priority pyramid (operator-stated 2026-06-19):**

> **Infrastructure/plumbing → Security → Data collection & observability → Unique features → Mobile design & UX polish**

**Lane structure (operator-stated):** **Parallel lanes within a tier, hard gate between tiers.** Inside a tier, run up to 5 lanes in parallel per R71. Only when ALL lanes in a tier are green does the next tier unlock.

**Why this doc exists:** prior operators were tempted to chase "next feature" (Talent Marketplace, Consumer Marketplace) before the substrate underneath them was clean. The R81 backfill exposed the cost — 16 PRs merged without audits, 7 P1 fixers still open, 28-finding security register filed and parked. This ladder fixes the order: substrate first, features last, polish behind that.

**Honest caveat:** the operator's own stated "Roman first, Stillwater, security, Phase 2, AI-econ, Dunning" order from earlier in the thread has been reshaped to match the explicit pyramid given afterward. Where they conflict, the pyramid wins. Roman P4 close-out is Tier 1 (it's plumbing); Stillwater is Tier 5 (it's UX polish). The pyramid is the authority.

---

## Table of contents

1. [How to read this document](#1-how-to-read-this-document)
2. [Tier 1 — Infrastructure / plumbing](#2-tier-1--infrastructure--plumbing)
3. [Tier 2 — Security](#3-tier-2--security)
4. [Tier 3 — Data collection & observability](#4-tier-3--data-collection--observability)
5. [Tier 4 — Unique features](#5-tier-4--unique-features)
6. [Tier 5 — Mobile design & UX polish (Stillwater)](#6-tier-5--mobile-design--ux-polish-stillwater)
7. [Cross-tier appendix](#7-cross-tier-appendix)

---

## 1. How to read this document

**Tier order is non-negotiable.** A Tier-2 lane MUST NOT start until every Tier-1 lane has merged. The R71 5-lane parallel cap applies *within* a tier; it does not relax the gate.

**Lane definition.** Each lane = (name, deliverable, OWNS files, MUST-NOT-TOUCH files, dispatch model, expected merge count, blocking dependency). Lanes inside the same tier with disjoint OWNS sets run in parallel; lanes that share OWNS run sequentially.

**Dispatch doctrine** (unchanged from Wave H):
- Builder = Opus 4.8 with brief at `audit_briefs/<lane>_BUILDER_BRIEF.md`
- Auditor = Opus 4.8 Lens A + GPT-5.5 Lens B (dual-lens R72 exhaustive)
- Fixer = Opus 4.8 (never Sonnet; R82-style violation)
- Re-audit = same dual-lens loop until both CLEAN
- Live-push agent sovereignty (R-live-push): every finding pushed to GitHub immediately so a subagent death doesn't lose work

**State enforcement** (Mechanism 1+3+6):
- First message to every dispatched subagent = paste-able prompt at `FRESH_INSTANCE_PROMPT.md`
- Every lane writes to `current-state.json` at every event (subagent start/finish, audit verdict, merge)
- The "state-write: confirmed" marker is required before lane is considered started

**Gate criteria — when can a tier unlock the next?**
- Every PR in the tier has dual-CLEAN audits at the latest commit
- Every PR has merged to main with [LOC-EXEMPT] markers where applicable
- `current-state.json` reflects all merges + an explicit `tier_N: complete` field
- `current-state.json` includes a one-paragraph retrospective per lane (what went well / what to carry forward)

---

## 2. Tier 1 — Infrastructure / plumbing

**Goal:** Land every load-bearing piece of substrate before adding any new product surface. After Tier 1, the product can grow without compounding tech debt.

### 2.1 — Lane T1.A — **Finish Wave H** (immediate continuation)

**Status at save-point:** R4 fixers all CLEAN on PR #464/#465/#466. R5 dual-lens audit is the next operator's first task.

**Deliverable:** Land in order, dual-CLEAN at every step:
1. R5 audit on #464 (H4.B env-discovery), #465 (H4.D provider-wiring), #466 (H4.F auto-flipper).
2. Merge those three sequentially with `[LOC-EXEMPT]` markers.
3. **H4.H orchestrator+CI** — builder lane (depends on A-G all merged). Brief at `audit_briefs/H4H_BUILDER_BRIEF.md` (write it). Wires the seven sub-scanners into a single orchestrator + adds `.github/workflows/h4-readiness.yml`.
4. **H5 staging config + OPERATOR_ATTACH.md** — builder lane. Brief at `audit_briefs/H5_BUILDER_BRIEF.md` (already exists).
5. **Forward-migration repair PR** — driven by D1/D2/D3 operator locks (sub_coach = lookup table, drop CONCURRENTLY, split by risk class).
6. **H3 #459 observability** — re-trigger CI once migrations green; dual-lens audit; merge.
7. **H6** — waits for TM-8 #449 to merge (TM dependency; see Tier 4).
8. **R109 codebase sweep** — after H4.H lands.
9. **Aggregate OPERATOR_ATTACH.md** — final Wave H artifact.

**OWNS:** `src/readiness/**`, `.github/workflows/h*.yml`, `prisma/migrations/2026*_h*`.
**MUST-NOT-TOUCH:** Roman P4 files (T1.B), repository-pattern files (T1.D), TM files (T1.E).
**Dispatch:** Opus 4.8 builder + dual-lens audit + Opus 4.8 fixer per PR.
**Expected merge count:** 4–6 PRs.
**Blocker for:** Tier 1 completion gate.

### 2.2 — Lane T1.B — **Roman P4 close-out** (transaction-correct plumbing)

**Why Tier 1:** Roman P4 is a transaction-boundary fix on `CoachFirstPaymentNotification`. The R81 Phase 2 audit found a **P1 still open** on the merged PR #395/#402: the in-process `recentPushes` Map is mutated BEFORE the ambient transaction commits, so a rollback + Stripe redelivery within 60s loses the push silently. That's plumbing, not feature work, and it's the blocking item to flip `FEATURE_ROMAN_FIRST_PAYMENT=ON`.

**Deliverable:**
1. **Backend fixer for PR #395/#402 N1** — minimal patch: in `NotificationsService.createNotification()`, skip `recentPushes.set()` when `tx` is present (DB-backed exactly-once ledger already covers it). Regression test simulates rollback + immediate redelivery WITHOUT fake clock advancement.
2. **Mobile fixer for PR #242 F1** — write-only MMKV gate makes celebration re-fire on every app restart. Fix: gate `onFirstPayment` on `await hasSeenFirstPayment(coachId)` read-on-mount. Add regression test with pre-set persisted gate.

**OWNS:**
- Backend: `src/notifications/notifications.service.ts`, `test/notifications.service.spec.ts`, `test/first-payment-rollback-redelivery.spec.ts` (new).
- Mobile: `src/screens/coach/CoachHomeScreen.tsx`, `src/components/coach/FirstPaymentWow.tsx`, `src/hooks/useFirstPaymentGate.ts` (likely new), test files for the above.

**MUST-NOT-TOUCH:** `FirstPaymentEmitter`, `CheckoutWebhookHandlerService`, `CoachFirstPaymentNotification` schema (all already CLEAN), Wave H files.

**Dispatch:** 1 backend lane + 1 mobile lane in parallel. Opus 4.8 fixer each.
**Expected merge count:** 2 PRs.
**Source-of-truth:** [`plans/PHASE_2_CLEANUP_PLAN.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/PHASE_2_CLEANUP_PLAN.md) §4 priorities 5 and 11; [`plans/ROMAN_P4_OPTION_C_EXPLAINED.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/ROMAN_P4_OPTION_C_EXPLAINED.md).

### 2.3 — Lane T1.C — **Phase 2 P1 fixer queue** (R81 backfill close-out)

**Why Tier 1:** Seven P1 fixers sit on already-merged surfaces. Each one is a flag-flip blocker. R81 zero-finding doctrine means these surfaces can't be considered "shipped" until all P1s close. This is plumbing because the bugs are correctness/race/data-loss class, not feature work.

**Deliverable** (per [`PHASE_2_CLEANUP_PLAN.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/PHASE_2_CLEANUP_PLAN.md) §4 urgent queue):

| # | PR | Fix | Lane shape |
|---|---|---|---|
| 1 | #401/#403 | CLEAN — holding for dependency-ordered merge wave | merge only |
| 2 | #399/#405 | CLEAN — ditto | merge only |
| 3 | #326 | F1 dispatcher-claim race: `updateMany({ where: {id, status:'pending'} })`; `count===0` → throw | backend fixer |
| 4 | #253 → #262 | D7B canonical delete-set refactor + N1 add-undo clientId preservation + N2 undo-push-outside-updater fix + telemetry | **already in flight as #262**; needs re-audit + merge |
| 5 | #242 | Read-on-mount MMKV gate — **covered by T1.B mobile lane** | (no separate lane) |
| 6 | #248 | Drop `.strict()` on detail schema OR accept `upload_targets` optionally; add `CommunityLessonDetailScreen.test.tsx` | mobile fixer |
| 7 | #251 | Build `CommunityVoiceNoteDetail` per D4B; implement D5B γ `GET /me/feature-flags`; fix wearable-prompts hook enablement; add flag-off pin tests; correct issue #255 | mobile fixer (largest) |

**OWNS** (disjoint, can run in parallel):
- #326 lane: `src/packages/package-contents.service.ts`, `test/push-to-existing*.spec.ts`
- #262 lane (already in flight): MWB undo files only
- #248 lane: `src/screens/community/CommunityLessonDetailScreen.tsx`, related Zod schemas
- #251 lane: `src/screens/community/CommunityVoiceNoteDetailScreen.tsx` (new), feature-flag hook, wearable-prompts hook

**MUST-NOT-TOUCH:** Wave H files, Roman P4 files (T1.B owns), TM files (T1.E).

**Dispatch:** Up to 4 parallel lanes (R71 cap), Opus 4.8 fixers.
**Expected merge count:** 6 PRs (#401, #399, #326, #262, #248, #251) — #403/#405 piggyback as paired fixers per PHASE_2.
**Pre-flag-flip P2 wave** (lower priority but still Tier 1): #396, #400, #398, #395/#402 polish, plus PR #200 followup (2 P2 + 1 P3). Treat as a single batched cross-PR polish PR per repo once all P1s close.

### 2.4 — Lane T1.D — **Repository pattern extraction** (5-domain)

**Why Tier 1:** [`architectural_refactor_priorities_2026-05-27.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/architectural_refactor_priorities_2026-05-27.md) calls 81% direct-Prisma-coupling the largest structural debt in the repo: rename a column → 122 files break. The fix is incremental, not a rewrite — extract the 5 most-touched domains into thin repository classes. AI-agent-friendly: each is a 1-day-AI-sprint with a clear instruction.

**Deliverable:** Five repositories, one PR each, in priority order:
1. `UserRepository` — most cross-cutting. Pulls all `prisma.user.*` calls from every service.
2. `CheckInRepository`
3. `PtmRepository`
4. `CoachMessageRepository`
5. `ClientPurchaseRepository`

Per the priority doc: "Extract all Prisma queries scoped to the User model across all service files into a single UserRepository class." — that's literally the dispatched-builder instruction.

**OWNS:** new `src/<domain>/<domain>.repository.ts` + every service file that imports `PrismaService` for that domain.
**MUST-NOT-TOUCH:** schema (no migrations), other domains' services, anything Wave H / Roman / Phase 2 owns.

**Dispatch:** 1 lane at a time (each PR touches many service files; parallel lanes would collide). Opus 4.8 builder.
**Expected merge count:** 5 PRs.
**Source-of-truth:** [`docs/audits/architectural_refactor_priorities_2026-05-27.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/architectural_refactor_priorities_2026-05-27.md).

### 2.5 — Lane T1.E — **Talent Marketplace backend completion** (substrate for Consumer Marketplace)

**Why Tier 1:** Operator explicitly placed TM **backend** in Tier 1 because TM is the shared spine for Consumer Marketplace (badge engine, Stripe Connect, RLS spine). Without TM backend, Consumer can't be built. TM **web/mobile** ships in Tier 5 (UX polish).

**Deliverable** (per [`plans/TM_REBUILD_CHAIN_V2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/TM_REBUILD_CHAIN_V2.md)):

**Currently open PRs (5):**
- TM-7a #452 admin listing moderation
- TM-7b #454 admin applicant review
- TM-8 #449 hirer applicant tracking (PII gate — operator sign-off required per ADR-0002 decision 8)
- TM-9a #451 job-hunter dashboard
- TM-9b #453 specialty alerts

**Unbuilt lanes (4):**
- TM-11 (per chain V2)
- TM-12a/b auto-flip applicant → sub_coach + onboarding checklist (PII gate)
- TM-13 revenue split (depends on H4.D provider-wiring — H must merge first; ✅ once T1.A done)
- TM-15 RLS test lane (mirrors H4.E learning-ledger shape)

**Open operator gates blocking forward progress** (require operator decision before lanes dispatch):
1. **Talent-side background check** — in-house F-KYC vs Checkr vs Stripe Identity (gates TM-12b)
2. **Anti-bot production default** (gates TM-6 prod ship — TM-6 already merged but flag-off)
3. **Web SSR sequencing vs Consumer Marketplace** — shared Next.js shell or two separate apps? (gates TM-W lane in Tier 5)

**OWNS:** `src/talent-marketplace/**`, `prisma/schema.prisma` (TM tables only), `prisma/migrations/2026*_tm_*`.
**MUST-NOT-TOUCH:** Wave H files, Roman files, Phase 2 fixer files, repository pattern targets.

**Dispatch:** Up to 3 parallel lanes (file overlap on `coach-application.service.ts` and `coach-offer.service.ts` limits parallelism). Opus 4.8 builder.
**Expected merge count:** 9 PRs (5 open + 4 new).
**Plan-doc-stale warning:** `TM_REBUILD_CHAIN_V2.md` embedded LIVE STATUS table is dated 2026-06-17 when only TM-0/TM-1 had merged. Use `gh pr list` truth, not the embedded table.

### 2.6 — Tier 1 gate

All of T1.A through T1.E green. `current-state.json` includes `tier_1: complete` and per-lane retrospectives. Expected total: ~25–30 merged PRs.

---

## 3. Tier 2 — Security

**Goal:** Close every active R1-violation finding. Without this tier, every Tier-4 feature inherits a hostile-attacker-friendly substrate.

### 3.1 — Lane T2.A — **28-finding security register P1s**

**Why first in Tier 2:** Active R1 violations. From [`codebase_hygiene_findings.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/codebase_hygiene_findings.md):

| # | File | Fix |
|---|---|---|
| 1 (P1) | `src/messaging/coach-messaging.controller.ts:31-32` | Add explicit `@Roles(Role.COACH)`; remove from `roles-enforced.spec.ts` allowlist |
| 2 (P1) | `src/storefront/storefront-public.controller.ts:55` | Apply composite `(share_token, IP)` throttle from POST to GET; add regression test |
| 3 (P1) | `src/admin/admin.controller.ts:65-86` | Migrate `GET /admin/coaches` + `GET /admin/users` to cursor pagination matching `listPurchases`; add e2e tests |
| 9 (P1) | `src/ai/coach/coach-ai.service.ts:366-378` | Add `checkCoachAIBudget(coachId)` before each generation call — sum `costCents` for rolling 24h window; throw 402 `BUDGET_EXCEEDED` above ceiling. Default $5/day/coach. |

**OWNS:** the four files above + their spec files.
**MUST-NOT-TOUCH:** anything else.
**Dispatch:** 4 parallel lanes (R71 max), Opus 4.8 builder.
**Expected merge count:** 4 PRs.

### 3.2 — Lane T2.B — **94 ungated routes (BL-2026-05-25-001)**

**Why Tier 2:** the `roles-enforced.spec.ts` legacy allowlist is institutionalized security debt. 94 controller routes lack `@Roles(...)`. From [`docs/BACKLOG.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/BACKLOG.md): "Decompose into one PR per controller family (auth → payments → coach surface → owner surface)."

**Deliverable:** 4 PRs, one per controller family. Each PR removes its controllers from `LEGACY_GUARD_ALLOWLIST` + `CLASS_LEVEL_LEGACY_ALLOWLIST` and adds explicit `@Roles` metadata.

**OWNS:** one controller family per PR.
**Dispatch:** Sequential (single shared spec file `test/roles-enforced.spec.ts`).
**Expected merge count:** 4 PRs.

### 3.3 — Lane T2.C — **Identity + background check spine** (powers TM-12 + Consumer Marketplace trust)

**Why Tier 2:** [`CONSUMER_MARKETPLACE_SPEC.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/CONSUMER_MARKETPLACE_SPEC.md) §2.5 names this as **listing-gate** requirement. TM-12 also needs background check decision (open operator gate T1.E.1). Building it as security infra in Tier 2 means BOTH downstream products inherit the same credential-revocation engine.

**Deliverable:**
1. **CredentialBadgeEngine service** — uniform revocable-badge primitive (used for cert tier, trust badges, verified-client marks).
2. **Stripe Identity integration** — lightweight "Identity verified" badge (Stripe Connect already on platform).
3. **Background check provider integration** — Checkr (industry standard) per spec §2.5. **Operator decision T1.E.1 must resolve before this lane starts.**
4. **Insurance/liability attestation flow** — coach uploads proof → admin verification → "Insured" badge.

**OWNS:** new `src/credentials/**`, new tables `Credential`, `CredentialBadge`, `BackgroundCheck`. RLS policies on each.
**Dispatch:** 1 lane (architectural cohesion), Opus 4.8 builder.
**Expected merge count:** 3–4 PRs (DB layer, service layer, controller layer, webhook integration).

### 3.4 — Lane T2.D — **P2 security findings (5)**

Per [`codebase_hygiene_findings.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/codebase_hygiene_findings.md): #4 PaginationQueryDto, #5 `@UseGuards` lifting on real-meal-plans, #6 dead-route SLA, plus billing/AI P2s (B1–B9, A1–A9 register Part 2-3).

**Dispatch:** 1 lane batching all P2s into a single per-controller-family PR sweep.
**Expected merge count:** 2–3 PRs.

### 3.5 — Tier 2 gate

All security findings P1+P2 closed. CI lint rules added: (a) `@Controller('admin')` requires `@ApiOperation` on every handler, (b) `TODO:` comments require GitHub issue reference, (c) `parseInt` on query params forbidden. `tier_2: complete` in state.

---

## 4. Tier 3 — Data collection & observability

**Goal:** When something breaks in production, you find out before users do. Without this tier, Tier-4 features ship blind.

### 4.1 — Lane T3.A — **H3 observability** (already in flight)

**Status:** PR #459 already open with prom-client `/metrics`, `pg_stat_statements`, Sentry wiring. CI red on migrations — repaired by Tier 1 forward-migration PR (T1.A step 5).

**Deliverable:** Re-trigger CI once T1.A done; dual-lens audit; merge. Already mostly built — this lane is finish-the-job.

**Expected merge count:** 1 PR.

### 4.2 — Lane T3.B — **AI usage economics → production**

**Why Tier 3:** [`ai_usage_economics_plan_2026-05-27.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/ai_usage_economics_plan_2026-05-27.md) is locked. The numbers ($40 hard cap, 3.125× multiplier, $125 displayed, $10/$25/$99/custom packs) need to ship. This is *both* data collection (rolling spend per coach) AND a unique feature (credit packs). Placed in Tier 3 because the per-coach dollar tracking is the prerequisite — credit pack purchases ride on top.

**Deliverable** (PRs AI-1 through AI-5 + Credits-1/2/3):
1. **AI-1** — `COACH_AI_MAX_ACTUAL_CENTS=4000`, `COACH_AI_VALUE_MULTIPLIER=3.125` env wiring + rolling 24h spend cumulator on `CoachAIUsageLog`.
2. **AI-2** — `GET /coach/ai/budget` endpoint (mobile polls this; returns `{ used_cents, allowance_cents, percent }`).
3. **AI-3** — 402 `AI_BUDGET_EXHAUSTED` on every coach AI endpoint when over cap.
4. **AI-4** — Brief dormancy guard: skip auto-generation if last 3 daily briefs went unread (`CoachBrief.read_at` reference).
5. **AI-5** — Audit log of every AI cost charge for ops debugging.
6. **Credits-1 backend** — Stripe SKUs `small` ($10) / `medium` ($25) / `large` ($99) / `custom` ($10–$500); webhook + ledger.
7. **Credits-2 mobile** — buy-credits flow.
8. **Credits-3 admin** — operator console for credit pack visibility + manual top-up.

**Companion specs:** [`ai_credit_marketplace_2026-05-27.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/ai_credit_marketplace_2026-05-27.md), [`issue_register_28_findings_2026-05-26.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/issue_register_28_findings_2026-05-26.md) Part 3 + PRODUCT-1/2.

**OWNS:** `src/ai/coach/**`, `src/credits/**` (new), `prisma/schema.prisma` (CoachAIUsageLog + CreditPack + CreditLedger), `src/screens/coach/CreditsScreen.tsx` (mobile, new).
**Dispatch:** Backend lanes sequential within (shared `coach-ai.service.ts`), mobile + admin parallel after backend lands.
**Expected merge count:** 8 PRs.

### 4.3 — Lane T3.C — **Dunning v1**

**Status check needed first:** `dunning_v1_plan.md` and `dunning_v1_result.md` both exist. Operator should verify whether v1 already shipped before dispatching this lane.

**Deliverable** (per [`dunning_v1_plan.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/audits/dunning_v1_plan.md)) IF not shipped:
1. `DunningAttempt` table — one row per cadence step (Day 0/3/7/14).
2. `tick` loop materializing attempts when `scheduled_for` arrives.
3. 4 new email templates (`payment-reminder-soft`, `payment-reminder-urgent`, `payment-final-notice`, `payment-recovered`).
4. 4 admin endpoints: `POST /v1/admin/payments/dunning/:purchaseId/{advance|reset|cancel|trigger}`.
5. Structured logging + counter metrics (`dunning_entered_total`, etc.).
6. `customer.subscription.deleted` webhook → terminate dunning with `status='abandoned'`.

**OWNS:** `src/dunning/**`, `prisma/schema.prisma` (DunningAttempt), `src/admin/payment-ops.controller.ts` (4 new endpoints).
**Dispatch:** 1 lane, Opus 4.8 builder.
**Expected merge count:** 2–3 PRs.

### 4.4 — Lane T3.D — **Telemetry pin hygiene + structured logging sweep**

**Why Tier 3:** R78/R79 codified during Wave H — pinned telemetry tables (`posthog-event-names.spec.ts`, `COMMUNITY_TELEMETRY_EVENTS`, `quietLuxuryDoctrine.test.ts`) must update with feature PRs. Tier 3 sweeps for any drift and adds structured `logger.log()` JSON lines on every Stripe webhook, AI call, auth event, and dunning transition.

**Dispatch:** 1 lane sweep PR.
**Expected merge count:** 1–2 PRs.

### 4.5 — Tier 3 gate

All observability lanes merged. `prom-client` exporting; `pg_stat_statements` enabled; Sentry receiving events; per-coach AI spend visible; dunning cadence emitting metrics. `tier_3: complete`.

---

## 5. Tier 4 — Unique features

**Goal:** Now ship the differentiators. The substrate underneath is clean, secure, and observed.

### 5.1 — Lane T4.A — **Talent Marketplace web SSR** (TM-W lanes)

5 Next.js pages: TM-W2 SEO job-posting (schema.org JSON-LD already emitted by TM-3 backend, ✅), TM-W5/W8/W9/W12. Resolves operator gate T1.E.3 (shared shell vs separate app from Consumer).

**Expected merge count:** 5 PRs.

### 5.2 — Lane T4.B — **Consumer Marketplace planner + execution**

**Why Tier 4:** [`CONSUMER_MARKETPLACE_SPEC.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/CONSUMER_MARKETPLACE_SPEC.md) is operator-locked but architecture/PR-chain = "next planner stage." Tier 4 starts with the planner, then execution.

**Deliverable shape** (per spec §1–§8):
- Coach profile (mandatory photo, modality, packages, trust stack, badges, reviews)
- Three-path engagement (buy-now / message / book-appointment)
- Auto-award badge engine (Certified 300+ clients ≥4.0★; Elite 1500+ + ≥4.3★ + $150k+; Sponsored admin-grant)
- Verified-client reviews
- Trust stack (Stripe Identity + Checkr + insurance + admin moderation + response-rate signal) — leverages T2.C credential engine
- 4-rail ranked search (earned / new / paid / your-gym)
- Flat 2% platform fee per purchase + sub-coach head-coach split toggle

**Dependencies (all satisfied by lower tiers):** T2.C credential engine, T3.B per-coach metrics, T1.E TM backend (Stripe Connect, RLS spine, profile model).

**Expected merge count:** ~15–20 PRs (largest single feature wave in the ladder).

### 5.3 — Lane T4.C — **Admin Control Room §11.A–O**

Per [`docs/admin/control-room-spec.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend) — EHR-style operator console. 15 placeholder PR slots `TBD-admin-A..O` already allocated. Once Tier 1 and Tier 3 land, admin console has real data + real endpoints to surface.

**Expected merge count:** 7–10 PRs (subset; full §17 7-week rollout is multi-quarter).

### 5.4 — Lane T4.D — **Custom Exercise composer close-out**

4 open PRs idle since 2026-06-17: backend #427 + #428, mobile #264 + #265. Flag-off. Coach-side feature.

**Deliverable:** Audit, fix to dual-CLEAN, merge.
**Expected merge count:** 4 PRs.

### 5.5 — Tier 4 gate

All differentiators shipped, flags ready to flip when product team gives go-ahead. `tier_4: complete`.

---

## 6. Tier 5 — Mobile design & UX polish (Stillwater)

**Goal:** Make every shipped surface feel like one premium product. Without this tier, features ship visually inconsistent.

**Plain-language preface** (from the explainer the operator asked for):

> Stillwater is the app's design language — the visual + interaction vocabulary that makes the whole product feel like one calm, premium thing instead of a pile of screens. Think Apple HIG, but yours. It's a bag of Lego bricks every screen must use, plus a CI rule that fails the build if you use the wrong brick.

**Source-of-truth:** [`docs/design-system/04-rollout-plan.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/docs/design-system/04-rollout-plan.md).

### 6.1 — Lane T5.A — **Stillwater Tier 1: primitives + lints** (~15 eng-days)

Ten T1 items from the rollout plan:
- T1.1 `CompletionMoment` primitive (3 variants: quiet/standard/peak)
- T1.2 `useHaptic()` hook (6 patterns: tap/confirm/success/peak/caution/error)
- T1.3 `useSpring()` preset hook (5 presets: enter/exit/morph/peak/breath)
- T1.4 `<QuietSkeleton>` standardization
- T1.5 `<CalmError>` primitive + migrate top 10 `Alert.alert('Error', …)` sites
- T1.6 HomeScreen polish
- T1.7 Homepage hero reduction (`tgp-platform-site/app/page.tsx`)
- T1.8 Banned-vocabulary lint (CI: blocks "crush"/"smash"/"destroy"/"beast mode"/"let's go"/"you got this")
- T1.9 Token-discipline lint (CI: fails on hardcoded hex outside `tokens.ts`)
- T1.10 Stillwater meta-export lint (every screen exports `stillwater` const)

**Expected merge count:** 10 PRs (one per item; each ≤200 LOC per hyperscaler doctrine R-LOC).

### 6.2 — Lane T5.B — **Stillwater Tier 2: 8 highest-leverage redesigns** (~6 weeks)

- T2.1 Notification Preferences (both copies → one shared component, 3-preset surface)
- T2.2 Branded Checkout choreography
- T2.3 Client Settings (792 lines → drill-down)
- T2.4 Coach AI Meal Plan Draft (3-screen summary-first approval flow)
- T2.5 Coach AI Workout Draft (apply T2.4 template)
- T2.6 Migrate worst 5 remaining `Alert.alert` clusters
- T2.7 Auth flow sequencing (split `CreateAccountScreen` into 3-step LeanQ)
- T2.8 Empty-state migration to `<NextPrompt>` (top 15 sites)

**Expected merge count:** 8 PRs.

### 6.3 — Lane T5.C — **TM mobile + web mobile screens** (deferred from T1.E per operator pyramid)

TM mobile screens (5): TM-M2/M5/M8/M9/M12. Built on Stillwater primitives from T5.A.

**Expected merge count:** 5 PRs.

### 6.4 — Lane T5.D — **Stillwater Tier 3 quarter sweep**

Per [`04-rollout-plan.md`](https://github.com/BradleyGleavePortfolio/growth-project-backend) — sweep the remaining surfaces.

**Expected merge count:** ~15–25 PRs.

### 6.5 — Tier 5 gate

Every shipped surface uses Stillwater primitives. CI doctrine lints hard-fail (no more soft-warn). `tier_5: complete` = product is shippable to the public marketing wave.

---

## 7. Cross-tier appendix

### 7.1 — Dependabot

9 open backend (#438–447), 5 open mobile (#266–270). **Treat as continuous low-priority lane** — one slot of the R71 5-lane budget always reserved for the safest bumps. Process per [`PARALLEL_LANE_PLAN_2026-06-13.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/PARALLEL_LANE_PLAN_2026-06-13.md) shape (rebase, audit, merge).

### 7.2 — Branch protection on main

Currently BLOCKED by GitHub Free plan. Carried into OPERATOR_ATTACH list (Wave H artifact). Operator must upgrade GH plan to enable.

### 7.3 — Backlog charters (BL-2026-05-25-002, -003, -004)

- **-002** 4 red Jest suites — pre-existing red on main, charter-protected. One-file hotfix PRs.
- **-003** CHECK-constraint replacement runbook — `docs/runbooks/migrations-concurrently.md` addition.
- **-004** Per-email storefront rate limit — closes the `(email, package_id)` spam vector.
- **BL-GDPR-BRIEF-3** — `brief_context` re-architecture (P3, telemetry-gated trigger).

**Slot:** One Tier 2 polish PR can sweep -003/-004 together; -002 lives as a per-suite hotfix lane in Tier 1 background.

### 7.4 — Reserved operator decisions (NOT lane work)

Decisions only the operator can make. Block specific lanes:
1. **TM background-check provider** (Checkr vs in-house F-KYC vs Stripe Identity) — blocks T1.E TM-12b + T2.C
2. **Anti-bot production default** — blocks T1.E TM-6 prod flip
3. **Web SSR sequencing** (shared Next.js shell with Consumer vs two apps) — blocks T4.A + T4.B
4. **GitHub plan upgrade** — blocks branch protection on main

### 7.5 — Total merge count estimate

| Tier | PRs | Calendar (1 operator session ≈ 3-5 PRs) |
|---|---|---|
| Tier 1 | ~25-30 | 6-10 sessions |
| Tier 2 | ~11-13 | 3-4 sessions |
| Tier 3 | ~12-15 | 3-5 sessions |
| Tier 4 | ~30-40 | 8-13 sessions |
| Tier 5 | ~38-58 | 10-19 sessions |
| **Total** | **~115-155 PRs** | **~30-50 operator sessions** |

This is the multi-month roadmap. Each session opens with `current-state.json` → finds the highest-priority unblocked lane within the current tier → dispatches.

### 7.6 — When this doc is wrong

This is a snapshot dated 2026-06-19 17:45 PDT. The world will change. Rules for updating it:
1. **Adding a lane** — requires operator approval. The pyramid is the authority on tier placement.
2. **Removing a lane** — requires lane completion OR operator explicit kill.
3. **Re-ordering within a tier** — operator discretion; no approval needed.
4. **Promoting/demoting between tiers** — requires operator approval (violates the pyramid).
5. **Skipping a tier** — never allowed without explicit operator override. The gate is the doctrine.

---

**End of POST_H_LADDER.md**

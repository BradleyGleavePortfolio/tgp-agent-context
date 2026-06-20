# TGP Master Plan — v2 (ranked + scoped, ready for planning)

**Supersedes:** `roadmap/TGP-Feature-Roadmap-v1.md` (Jun 2026) and `roadmap/TGP-MASTER-EXPANSION-PLAN.md` Stage 3 section.
**Date:** 2026-06-19 (ranked pass)
**Method:** Direct audit of `growth-project-backend` (168 Prisma models, 156 migrations, ~95 modules) and `growth-project-mobile` (50+ screens, 4 health-platform adapters) against every Stage-3 feature in v1. Cross-checked against `CONSUMER_MARKETPLACE_SPEC.md`, `TALENT_MARKETPLACE_SPEC.md`, `PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md`, and the in-flight Wave H + `POST_H_LADDER.md`. Operator-ranked 2026-06-19.

> **What this document is:** the working feature ledger after audit + operator ranking. Tells the next planner: (a) what's actually built, (b) what's left to build, (c) how the operator ranked it, (d) any scope expansions the operator added during ranking.

> **What this document is NOT:** a re-statement of the strategic vision. The decacorn frame, the 5-stage waterfall, the 5 quality rules, and the Product Dominance Playbook remain unchanged — see `TGP-MASTER-EXPANSION-PLAN.md`. PROD features are not re-listed here (they're done); see §6 for the PROD inventory if context is needed.

---

## §0. Ranked execution order (THE answer)

After audit + rank, here is the working plan for everything not already shipped or in flight. Use this as the input to the next planner stage; it maps directly into `POST_H_LADDER.md` Tier 4 (Features) and Tier 5 (UX polish).

### §0.1 Bucket A — Pre-launch-gate MUST-DOs (in order)

These are the items the App Store launch gate depends on (per Master Expansion Plan), ranked by operator-stated priority for the post-H sequencing.

| Order | Feature | Why this slot |
|---|---|---|
| **A1** | **Roman P4 close-out** | Operator: "before anything else, it's in our original plans for the next operator." Already on `POST_H_LADDER` Tier 1 T1.B. |
| **A2** | **Migration / import tooling (2.10)** | Operator: "#1 post-H feature after TM and prior in-flight work is done." Master Plan flags as launch-gate prerequisite. |
| **A3** | **Wearable deep — full provider parity + recovery feed (1.2)** | Operator RED FLAG: "Sleep data is a massive MOAT — ALL wearables wired and working to hyperscaler quality." Whoop/Oura/Garmin adapters + coach recovery badge + feed into adaptive engine. |
| **A4** | **Closed-loop adaptive autopilot (1.1)** | Operator: "MOAT feature." Substrate exists; close the loop. Depends on A3 wearable feed. |
| **A5** | **Consumer Marketplace (1.3-b)** | Per `CONSUMER_MARKETPLACE_SPEC.md`. Launch-gate item per Master Plan. |
| **A6** | **Hyperscaler lead funnel (2.7)** | Operator-expanded scope: TGP-built landing page → link in bio → guest checkout → superlink to download → auto-assigned coach + package. End-to-end "Apple-grade" funnel composer. |
| **A7** | **Unified coach inbox (2.1)** | Operator-expanded scope: split into "client stuff" and "team stuff" tabs; sub-coaches and solo coaches see client tab only; head coaches see both. |
| **A8** | **AI check-in summaries — client-side (2.3)** | Operator: "for clients, high." Client-facing weekly summary digest. |
| **A9** | **Referral tracking — both sides (2.11)** | Operator-expanded scope: client↔client AND coach↔coach. Coach-to-coach referral triggers popup "Your referral just processed their first payment! Here's a gift from us →" + free TGP shirt fulfillment. |
| **A10** | **Coach money-flow engine (3.5)** | Operator-expanded scope: full configurable money flow per sub-coach. Examples: "SC A pays me 4% of all money," "SC B pays $200/mo flat on the 1st." Per-sub-coach rule type: percent / flat / hybrid / custom billing date. |

### §0.2 Bucket B — IMPORTANT (post-launch-gate, ship ASAP after Bucket A)

| Order | Feature | Notes |
|---|---|---|
| B1 | **Re-engagement automations + Dunning consolidation (2.9 + 5.8)** | Operator: "important (higher)" — couple with dunning v2 finish. |
| B2 | **Team QA / manager ops layer (2.2)** | Operator: "head coach and managerial stuff to be elite/world-class, mark this as important." |
| B3 | **White-label multi-tenant — scope-cut (2.12)** | Operator scope: colors + name + logo only. **Opt-in side flow, NOT the default.** Dead simple upload, clean, luxurious. No app-store-per-tenant in this scope. |

### §0.3 Bucket C — MEDIUM (real work, but not before A or B)

| Order | Feature | Notes |
|---|---|---|
| C1 | **Reusable smart check-in forms (2.6)** | Operator: "medium." Coach-defined form builder + per-template assign + auto-populate prior answers + recurring cron. |
| C2 | **Client loyalty & rewards (2.8)** | Operator: "medium important, needs detailed planning though." Must pass anti-badge-theater doctrine first. Plan before build. |
| C3 | **Admin Control Room — war-room expansion (5.4)** | Operator: "medium/low — needs every single coach and their financial data rolled into a clean web UI + per-person search and profiles — like a war room for all of TGP as a business." Web-first, ops-facing. |

### §0.4 Bucket D — NICE TO HAVE (substrate built, UI-only finishes)

| Order | Feature | Notes |
|---|---|---|
| D1 | **Async video replies (3.3)** | Operator: "yes, ship the UI, low effort." Coach records 30–60s video reply in a check-in/message thread; Mux + Whisper substrate already shipped. |
| D2 | **Progressive overload viz (3.4)** | Operator: "low imp." 1RM strength curve + PR markers + composite Strength Score. May already be in `ProgressScreen` — verify before building. |

### §0.5 Bucket E — PARK (deferred indefinitely)

| # | Feature | Reason |
|---|---|---|
| E1 | **Cross-pillar Fitness + Wealth (5.7)** | Operator: "park for now, long term play." |
| E2 | **AI class demand forecasting (3.2)** | Operator: "throw behind gym mode." Stage 4E. |
| E3 | **All of Gym Mode (4.1–4.8)** | Per Master Plan, post-launch-gate. Stage 4A/B/D/E. |
| E4 | **Door hardware / access control (4.5)** | Operator: "behind gym mode — whole other ball game." Stage 4E. |

### §0.6 Bucket F — KILL

| # | Feature | Reason |
|---|---|---|
| F1 | **AI video form analysis (2.4)** | Operator: "not that important right now." Substrate (Mux + Anthropic) reusable for D1 video replies. Revisit only if a premium-tier customer explicitly asks. |

---

## §1. The full feature ledger (with audit details preserved)

Build-state scoring legend:

| Tag | Meaning |
|---|---|
| **PROD** | Shipped, in active use. *Not re-listed here; see §6.* |
| **MOSTLY** | 70–95% built — primary surfaces exist, edges/polish/one sub-feature outstanding. |
| **PARTIAL** | 30–70% built — clear scaffolding (controllers, services, schema), but the *closing-the-loop* piece is missing. |
| **SCAFFOLD** | <30% — name reserved, model exists, or controller stub, but no real path through. |
| **ZERO** | Not started. No model, no module, no screen. |

### §1.A — Pre-launch-gate MUST-DOs (Bucket A)

#### A1 · Roman P4 close-out
**Rank:** MUST DO (FIRST)
**State:** IN FLIGHT (already on `POST_H_LADDER` Tier 1 T1.B). Backend N1 `recentPushes` pre-commit + mobile F1 MMKV gate remaining.
**Reference:** `POST_H_LADDER.md` Tier 1, `ROMAN_P4_OPTION_C_EXPLAINED.md`.
**Why first:** Operator: "before anything else, it's in our original plans for the next operator."

#### A2 · Migration / import tooling (v1 §2.10)
**Rank:** MUST DO (#1 post-H feature after TM + infra)
**State:** ZERO. No Trainerize/Everfit importer, no spreadsheet upload, no program-format converter.
**What to build:**
- Trainerize CSV/JSON importer with field mapping to TGP schema
- Spreadsheet importer (name, email, start date, program columns)
- Branded invite emails: "Your coach [Name] has moved to TGP. Download the app to continue."
- Program-format conversion: parse Trainerize program export → TGP `WorkoutProgram` + `WorkoutPlan` schema
- Billing migration: detect imported clients with active subs → prompt coach to set up equivalent Stripe Connect plans
**Operator note:** "extremely important, #1 after TM and prior in-flight work is done (infra and plumbing need done, too)."
**Master Plan tie:** App Store launch gate prerequisite ("REQUIRED before marketing") per Stage-3 ranking #6.

#### A3 · Wearable deep — full provider parity + recovery feed (v1 §1.2)
**Rank:** MUST DO (RED FLAG — MOAT)
**State:** MOSTLY (Apple/Google/Samsung shipped; Whoop/Oura/Garmin enumerated only).
**What's built:** `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableUserMetricPreference`. Mobile adapters: `services/health/{healthkit, healthConnect, samsungHealth, onDeviceConnect}`. Hooks: `useHealthKitSync`, `useHealthConnectSync`, `useSamsungHealthSync`. Community-side surfacing: `community/wearable-prompts/`.
**What to build:**
- Whoop adapter (webhook + OAuth; their developer API)
- Oura adapter (REST polling or webhook)
- Garmin adapter (Connect IQ or webhook)
- Coach client-card recovery-score badge (green/yellow/red) in `ClientDetailScreen` / `CoachClientDetail`
- Feed recovery score as a primary signal into the adaptive programming engine (shared interface with A4)
**Operator note:** "RED FLAG — Sleep data is a massive MOAT of ours, so we need to make sure ALL wearables are wired and working to hyperscaler quality!"

#### A4 · Closed-loop adaptive autopilot (v1 §1.1)
**Rank:** MUST DO (MOAT)
**State:** PARTIAL — substrate present, loop unwritten.
**What's built:** `WorkoutProgram` (template + cloned), `WorkoutPlan`, `WorkoutPlanRevision`, `WorkoutProgramRevision`, `ClientWorkoutAssignment`, `WorkoutPlanExercise`, `WorkoutBuilderIdempotencyKey`, `ExerciseSet.rpe`, `Intensity` enum. AI write path: `AIDraft`, `AiActionDraft`, `PendingAiDraftsScreen`, `useCoachAckActions`. `WeeklyInsightCron` (`src/ai/coach/weekly-insight.cron.ts`) generates per-client adjustment suggestions. `CoachBriefService` (82KB) surfaces them.
**What to build:**
- Rule+LLM layer that *automatically writes* the next-week program revision from trailing RPE + completion + wearable HRV
- Coach-approval queue with bulk approve / per-row override
- Per-coach model that learns coach philosophy over time (deferrable v2)
**Dependency:** A3 wearable feed for HRV/sleep input.
**Operator note:** "MOAT feature, so important."
**Cost gating:** Per-call cost flows through Coach AI Budget (already shipped via `ai-credits/`); land within POST_H Tier 3 T3.B AI usage economics cap ($40/3.125×/$125).

#### A5 · Consumer Marketplace (v1 §1.3 — split product)
**Rank:** MUST DO (launch-gate)
**State:** ZERO on consumer side; foundation reusable from Talent Marketplace (coach profile, Stripe Connect, RLS spine, badge engine).
**Authoritative spec:** `plans/CONSUMER_MARKETPLACE_SPEC.md` (operator-locked 2026-06-16).
**Scope highlights:** Badge engine (Certified/Elite/Sponsored auto-award + Roman celebration popup), four-rail search (merit / new+upcoming / sponsored / your-gym), modality filters (in-person/hybrid/online), web parity (every mobile screen = web page), gym-affinity rail via `app.current_gym_ids()` RLS.

#### A6 · Hyperscaler lead funnel (v1 §2.7 — operator-expanded)
**Rank:** MUST DO (Apple-grade)
**State:** MOSTLY — all four primitives shipped, integration missing.
**What's built:** `storefront/` (20+ files including guest-checkout, reconciliation, recovery, rate-limiter, idempotency, PII scrub), `contracts/` (envelope + template + signed-PDF + providers + webhooks — e-sign engine), `checkout/` (purchase-split-handler, dunning, dunning-v2), `landing-pages/` (custom-domain + DNS verifier + lead-rate-limiter + section-schemas + CRM dir), `CoachLandingPage`, `CoachLandingPageSection`, `CoachLandingLead`, `CoachLandingPageView`. Mobile: `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `CheckoutReturnScreen`, `OnboardingStep1…10`, `LeanQ1…6`, `Day1Win`, `PurchaseUnpackScreen`.
**Operator-expanded scope — the hyperscaler funnel:**
1. **TGP creates the landing page for the coach** (template-driven, drop-in customization, on-doctrine)
2. **Coach puts link in bio** (Instagram/TikTok/X) — short branded URL
3. **Prospect lands → reads → guest checkout** (no account required, already supported by `guest-checkout.service`)
4. **Superlink to download the app** (deep-link that survives App Store / Play Store install)
5. **App opens → auto-assigns the prospect to the coach** (no manual code entry)
6. **App auto-assigns the package they just bought on the web page** (no re-selection)
7. **Coach gets notified, client lands on Day-1 Win**
**What to build (the welding):** funnel composer that chains the 7 steps into a coach-configurable single setup screen; superlink generation + deferred-deep-link handling; landing-page → guest-checkout → install → auto-assign-coach-and-package atomic flow.
**Operator note:** "I want this to be hyperscaler quality flow."

#### A7 · Unified coach inbox (v1 §2.1 — operator-expanded)
**Rank:** MUST DO
**State:** MOSTLY → arguably PROD on data layer.
**What's built:** `coach/command-center/` (28KB churn-intervention.service, 32KB command-center.service, 37KB ltv-metrics.service, 14KB controller), `community/inbox/` (community-coach-inbox controller+service+repository+dto), `community/ai-triage/` (15KB service, prompts, output schema, triage-cache — *the AI triage layer v1 calls for*). Mobile: `CoachHomeScreen`, `RiskBoardScreen`, `ClientRiskDetailScreen`, `coach/command-center/` directory, `services/commandCenterApi`, `useInboxTriage`.
**Operator-expanded scope — role-gated split:**
- **Two tabs:** "Clients" tab (client communication, check-in responses, urgency triage) and "Team" tab (sub-coach ops, response-time metrics, unanswered check-in flags — basically A7 surfaces 2.2 Team QA inside the inbox shell).
- **Sub-coaches and solo coaches:** see Clients tab only. Team tab hidden.
- **Head coaches (with sub-coaches):** see both tabs.
- Role detection via existing `TeamProfile` + `SubCoachAssignment` + `User.role`.
**What to build:** UX polish on the three-panel layout, role-gated tab rendering, bulk approve-all-AI-changes button, read receipts, "coach last seen", broadcast-to-segment.
**Tie to A4:** the bulk-approve action surfaces autopilot revisions.

#### A8 · AI check-in summaries — client-side (v1 §2.3)
**Rank:** MUST DO (high — client-facing)
**State:** PARTIAL.
**What's built:** `CheckIn` model present, `coach-check-ins.controller`, `client-check-ins.controller`, `community/ai-triage/` (closest analogue — triages community messages with Claude), `CoachBriefService` (82KB, already reads check-in data for daily briefs), `HolisticInsightCache` + `holistic-insights.service`.
**Operator scope clarification:** "for clients, high" — client-side summary surface, not just coach-side digest. Client gets a weekly summary of their own check-ins: trends in mood/energy/soreness/sleep, weekly themes, "your coach noticed X."
**What to build:** Dedicated client-facing weekly digest screen + per-check-in AI urgency classification + suggested-coach-reply panel (coach-side, editable, not auto-sent — guardrail) + weekly-theme aggregation across coach's whole roster.

#### A9 · Referral tracking — both sides (v1 §2.11 — operator-expanded)
**Rank:** MUST DO
**State:** ZERO. Substrate adjacent in `invite-codes/` + `share-link/` modules.
**Operator-expanded scope — bidirectional + first-payment celebration:**
- **Client → client referrals** (a client refers a friend to their coach)
- **Coach → coach referrals** (a coach refers another coach to TGP)
- **First-payment trigger event:** when a referred party (whether client paying their coach, or coach paying TGP seat fee) processes their first payment, the system AUTOMATICALLY fires:
  1. Popup to the referrer: *"Your referral just processed their first payment! Here's a gift from us →"*
  2. **Free TGP shirt fulfillment** (shipping address collection → fulfillment provider integration)
- Reward types per side: client-side = storefront discount / free week / cash via Connect; coach-side = TGP swag (shirt for first, ladder up later) + month free, etc.
**What to build:**
- `Referral` model (referrer_user_id, referred_user_id, type: client_to_client / coach_to_coach, status, first_payment_at, reward_fulfilled_at, idempotency_key)
- Unique referral URL per user (extend `share-link/` for personalized tokens)
- Stripe-webhook attribution: on `payment_intent.succeeded` for a referred user → flip referral to fulfilled → trigger gift workflow
- Gift fulfillment integration: shirt-shipping provider (Printful, Shopify, etc. — operator-decide)
- Celebration popup component (mobile + web) — on-doctrine, Roman voice ("Your referral just processed…")
- Coach-side dashboard: referral leaderboard, total referrals, total revenue attributed

#### A10 · Coach money-flow engine (v1 §3.5 — operator-expanded)
**Rank:** MUST DO
**State:** PARTIAL — payout/Connect spine shipped, configurable money flow ZERO.
**What's built:** `payouts-v2/` (payout-method controller/service, payout-routing, platform-fee, stripe-connect provider, webhook controller), `connect/` (Stripe Connect adapter), `sub-coaches/sub-coach-analytics.service`, `checkout/purchase-split-handler.service`. DB: `SplitLedgerEntry`, `ConnectTransfer`, `PayoutSnapshot`, `PayoutMethod`, `FeePolicy`, `SubCoachAssignment`. MIG: `20261215_payouts_v2_bank_payout_methods`.
**Operator-expanded scope — not just a tracker, a configurable money-flow engine:**
> "Subcoach A pays me 4% of all money, SC B only pays me 200/mo flat on the 1st"

Per head-coach ↔ sub-coach relationship, the head coach configures ONE of:
- **Percent-of-revenue** rule: X% of every sub-coach sale routes to head coach
- **Flat monthly** rule: $Y flat on the Zth of the month (auto-debit from sub-coach's Connect account)
- **Hybrid** rule: $Y flat + X% above a threshold
- **Custom billing date** per rule
- **Per-sub-coach override** (every SC can have a different rule)
**What to build:**
- `MoneyFlowRule` model (head_coach_id, sub_coach_id, type: percent / flat / hybrid, percent_bps, flat_cents, billing_day_of_month, threshold_cents, active, idempotency_key, audit_trail_id)
- Per-sub-coach configuration UI (head-coach side)
- Monthly auto-execution scheduler (cron) that creates `SplitLedgerEntry` rows + Stripe Connect transfers per active rule
- Sub-coach earnings dashboard: revenue generated, rule applied, head-coach cut, net payout, payout history
- Head-coach view: per-SC rule status + monthly inflow projection + actual inflow + audit log
- Idempotency: re-run for same month + same rule = no-op
**Doctrine:** all money movements RLS-tier-1 (financial privacy), audit-event-emitting, idempotent, dispute-traceable.

---

### §1.B — IMPORTANT (Bucket B)

#### B1 · Re-engagement automations + Dunning consolidation (v1 §2.9 + post-v1 §5.8)
**Rank:** IMPORTANT (higher)
**State:** MOSTLY.
**What's built:** `src/nudges/` (full module: coach-nudges, client-nudges, dto, service), `src/notifications/nudges/`, `CoachNudge`, `NudgeLog`, `ChurnIntervention` (full draft → edit → send workflow with idempotency, alert linkage, risk_score_at_draft), `ptm/` module (heuristic, weighted, scheduler — churn prediction in production), `coach-alerts` controller + service. Dunning: `checkout/dunning-v2/`, `DunningState`, `DunningAttempt`, `PaymentRecoveryToken`, `PaymentReminder`, MIG `20261214_dunning_v2_lockout_recovery`.
**What to build:**
- Coach-configurable trigger UI ("if no login 5d, send Message A; if 10d send Message B")
- Message template library (coach-authored voice; AI-suggested drafts)
- Verify dunning v2 has fully superseded v1 — if so, retire POST_H T3.C "Dunning v1" as redundant.
- Consolidate `ChurnIntervention` (already shipped) + new trigger config into a single "Re-engagement" surface.
**Operator note:** "Re-engagement automations + dunning — important (higher)."

#### B2 · Team QA / manager-level ops layer (v1 §2.2)
**Rank:** IMPORTANT (elite / world-class)
**State:** MOSTLY.
**What's built:** `sub-coaches/` (sub-coach-analytics.service, head-coach-only.guard, sub-coach-invite.service, controller, dto, types), `team/`, `team-mode/` (tier-resolver), `TeamSubCoachAssignment`, `TeamAuditEvent`, `TeamProfile`, `SubCoachInvite`, `SubCoachAssignment`, `SubCoachMutationIdempotency`. Mobile: `TeamManagementScreen`, `TeamMembersScreen`, `SubCoachDetailScreen`, `SubCoachInviteModal`, `CoachTeamProfileScreen`.
**What to build:**
- Per-sub-coach metrics: avg check-in response time, % clients with programs updated in 7d, client satisfaction proxy, churn-risk count
- Unanswered check-in flagging (>48h)
- Program audit (head coach can view any SC's client programs)
- Weekly ops digest: AI-generated team performance summary
**Tie to A7:** Team Ops surfaces inside the unified inbox "Team" tab.
**Operator note:** "head coach and managerial stuff to be elite/world-class."

#### B3 · White-label multi-tenant — scope-cut (v1 §2.12)
**Rank:** IMPORTANT (with scope cut)
**State:** SCAFFOLD.
**What's built:** `CommunityWorkspace` model, `landing-pages/custom-domain.controller`, `custom-domain.service`, `dns-verifier`, RLS tier 1–5 (precondition), `Role.owner`.
**Operator scope cut:**
- **IN:** Colors + name + logo only. Clean, luxurious, dead-simple upload.
- **OUT (this scope):** App-store-per-tenant (separate Apple/Google developer accounts), full per-tenant data partitioning beyond RLS, custom domain (already exists via `custom-domain.service`).
- **Side flow, not default:** Opt-in toggle. Default UX stays TGP-branded.
**What to build:**
- Theme configuration table (`TenantTheme` or per-coach-team theme columns): brand_color_primary, brand_color_secondary, logo_url, display_name, opt_in_at
- Logo upload + crop + validation (luxury bar: rendering checks)
- Live preview on coach dashboard + client app
- Render path: when opt-in is on, swap brand surfaces (header, splash, push templates) for the tenant's
- Reversibility: opt-out instantly reverts
**Operator note:** "only to colors + name/logo work, nothing huge — also should be a side flow, not the default — but still, when opted in, needs to be dead simple, easy to upload logos and customize, clean and luxurious."

---

### §1.C — MEDIUM (Bucket C)

#### C1 · Reusable smart check-in forms (v1 §2.6)
**Rank:** MEDIUM
**State:** PARTIAL.
**What's built:** `CheckIn` (fixed-schema), `MealTemplate` proves templating pattern, `DiagnosticSubmission` proves form-engine existence.
**What to build:**
- Coach-defined form builder (drag-drop question blocks: 1–10 scale, text, yes/no, photo upload)
- Form templates: save once, assign to one client or segment
- Auto-populate: prefill prior answer per question on new submission
- Recurring scheduling: auto-send weekly cron
- AI summary trigger on submission (couples to A8)
**Tie to A8:** these become the input streams to AI check-in summaries.

#### C2 · Client loyalty & rewards (v1 §2.8)
**Rank:** MEDIUM (needs detailed planning before build)
**State:** ZERO → partial via streaks.
**What's built:** `Habit` + `HabitLog` (streak data), `community/challenges/` (26KB service, challenge + participation model — closest analogue), `CommunityWin`, `first-win/` module, `LeaderboardScreen` + `leaderboard/`, `mobile/lib/milestones.ts`.
**Operator note:** "medium important, needs detailed planning though" + "Loyalty/rewards COULD be done right, just needs planning."
**Pre-build planning gate:**
- Doctrine review: must pass anti-badge-theater test (Product Dominance Playbook). Loyalty ≠ vanity gamification. Genuine outcomes-over-opens.
- Is "milestone" just a private personal challenge in the existing `community/challenges/` engine? Decide reuse vs. new.
- Reward types catalog: badge / push from coach / auto-discount code / coach-recorded video message
- Privacy: rewards are personal, not leaderboarded by default
- Operator-approved spec doc required before any code.
**What to build (after planning):** Configurable per-coach milestone engine, reward fulfillment, client timeline integration.

#### C3 · Admin Control Room — war-room expansion (post-v1 §5.4)
**Rank:** MEDIUM/LOW
**State:** PARTIAL.
**What's built:** `AdminControlRoomScreen.tsx` + `coach/ADMIN_CONTROL_ROOM_README.md`. Backend `admin/` module (admin.controller, admin.dto, admin.service, console/, entitlements/, federation/, metrics.service, owner-console.controller, ptm/, reports/, soc2/). POST_H Tier 4 T4.C currently lists §11.A–O sections outstanding.
**Operator-expanded scope — TGP biz war room:**
> "needs every single coach and their financial data rolled into a clean web UI + per person search and profiles — like a war room for all of TGP as a business"

- **Web-first surface** (not just mobile screen — operator's biz dashboard)
- Every coach as a row, searchable, filterable
- Per-coach profile drill-down: financials (revenue, payouts, splits, Connect status), risk signals (PTM scores, churn interventions), team structure (sub-coaches, clients), activity (last login, last brief, last program update)
- Per-person search across coaches + clients + applicants
- Financial roll-ups: total platform revenue, total payouts, fee-take, dunning recoveries, refunds, disputes
- Trust signals roll-up: % coaches with credentials verified, % with insurance, % with background check
- "War room" feel: dense information, fast filters, exports to CSV
**Tie:** consumes the same data that `coach-effectiveness.service`, `ltv-metrics.service`, `ptm/`, `payouts-v2/` already produce; adds nothing new on the backend side beyond aggregation endpoints and a real web surface.

---

### §1.D — NICE TO HAVE (Bucket D)

#### D1 · Async video replies (v1 §3.3)
**Rank:** NICE (yes, ship the UI, low effort)
**State:** PARTIAL.
**What's built:** `CommunityVoiceNote` + `community/voice/` (voice replies shipped), `mux.service` + `mux-webhook.controller`, `CoachMediaAsset`, `MuxProcessedEvent`, `ClientAssetGrant`, `MessagesScreen`, `community/messages/`.
**Scope clarification:** Coach records a 30–60s video reply to a client's check-in or message thread (Loom-style, in-app). NOT client-uploads-form-video (that's the killed F1).
**What to build:**
- Mobile: in-thread "Video Reply" button → camera → 60s max → upload via existing Mux pipeline
- Whisper API transcription (already in stack via OpenAI) for searchability + accessibility
- 30-day auto-expire policy on `CoachMediaAsset`
- Client receives push: "Your coach sent you a video message"

#### D2 · Progressive overload viz (v1 §3.4)
**Rank:** NICE (low importance)
**State:** PARTIAL.
**What's built:** `ExerciseSet.{reps_per_set, weight_per_set, rpe, notes}` — all required inputs for 1RM (Epley) calc. `ExerciseCatalogItem`, `exercise-library/`, `exercise-catalog/`. Mobile: `ProgressScreen`, `client/progress/`, `ExerciseDetailScreen`, `ExerciseLibraryScreen`.
**Pre-build verification:** audit `ProgressScreen` first — may already be partly rendered. If so, this is finishing, not building.
**What to build (if confirmed missing):**
- 1RM per-set computation (Epley: weight × (1 + reps/30))
- Time-series chart per exercise, PR markers
- Composite "Strength Score": weighted avg across client's top 5 lifts
- Shareable progress-chart image (coach marketing tool)

---

### §1.E — PARK (Bucket E)

| # | Feature | Why parked |
|---|---|---|
| E1 | Cross-pillar Fitness + Wealth (5.7) | Operator: "park for now, long term play." Substrate: `coach/cross-pillar/`, `User.coach_practice_type` enum, `BothPillarsScreen`. Leave as-is. |
| E2 | AI class demand forecasting (3.2) | Operator: "throw behind gym mode." Stage 4E. |
| E3 | Gym Mode 4.1 toggle / gym-first architecture | Stage 4A per Master Plan. |
| E4 | Gym Mode 4.2 membership creation | Stage 4A. |
| E5 | Gym Mode 4.3 billing operations (gym-side) | Stage 4A. |
| E6 | Gym Mode 4.4 class & facility scheduling | Stage 4A (coach-level 1:1 scheduling already PROD). |
| E7 | Gym Mode 4.5 door hardware / access control | Operator: "behind gym mode — whole other ball game." Stage 4E. |
| E8 | Gym Mode 4.6 general member account type | Stage 4A. |
| E9 | Gym Mode 4.7 staff role architecture | Stage 4A. |
| E10 | Gym Mode 4.8 gym ops dashboard | Stage 4A. |

### §1.F — KILL (Bucket F)

| # | Feature | Reason |
|---|---|---|
| F1 | AI video form analysis (v1 §2.4) | Operator: "not that important right now." Mux + Anthropic substrate reusable for D1 video replies. Revisit only on explicit premium-customer demand. |

---

## §2. Operator-added scope expansions (summary)

These are the NEW product spec additions from the ranking pass — fold into engineering specs when building each item.

| # | Original feature | Expansion |
|---|---|---|
| 1 | A6 lead onboarding | TGP-built landing page → bio link → guest checkout → superlink to download → auto-assign coach + bought package, all in one flow. Hyperscaler quality. |
| 2 | A7 unified inbox | Role-gated 2-tab split: Clients tab + Team tab. Sub-coaches/solo coaches see Clients only. Head coaches see both. |
| 3 | A9 referral | Bidirectional (client↔client AND coach↔coach) + first-payment-triggers-celebration-popup + free-TGP-shirt fulfillment for first referral. |
| 4 | A10 commission | Full configurable money-flow engine: percent / flat / hybrid / custom-date rules, per-sub-coach. Not a tracker, an *engine*. |
| 5 | B3 white-label | Scope-cut: colors + name + logo only. Opt-in side flow, not default. Dead-simple luxurious UX. |
| 6 | C3 Admin Control Room | War-room expansion: every coach + financial data + per-person search + profiles, in a clean web UI. TGP biz operational dashboard. |

---

## §3. Strategic recap (unchanged, for context only)

Authority: `roadmap/TGP-MASTER-EXPANSION-PLAN.md`.

- **Vision:** Apple-grade coaching platform → fitness operating system replacing Trainerize + Mindbody simultaneously.
- **Quality bar:** decacorn / luxury / Maya voice / ≤300ms motion / no exclamation / no emoji / no hype.
- **Stage waterfall:** Stage 0 cleanup → Stage 1 mobile refactor → Stage 2 IA → Stage 3 19-feature roadmap (this doc) → App Store launch gate → Stage 4 gym expansion.
- **Engineering priority pyramid (POST_H_LADDER):** Infrastructure → Security → Observability → Features → UX polish. This ledger feeds Tier 4 (Features).

---

## §4. Retired items

- v1 §1.3 single "marketplace" → split into Consumer + Talent (specs locked 2026-06-16).
- v1 §4 "Gym Mode as Priority 4" → re-sequenced to Stage 4A/B/D/E.
- v1 §6 priority matrix overall → superseded by §0 ranked execution order above.

---

## §5. Auditor unknowns

Things that still need a brief code-verification pass — flag before building:

- Does `coach/command-center` already render the three-panel inbox UX or only the data API? (Affects A7 effort estimate.)
- Does `client/progress/` already render 1RM strength curve? (Affects D2 — finish vs. build.)
- Has `dunning-v2` fully superseded v1? (Affects POST_H T3.C — may be retirable.)
- Does the AI-triage prompt use the same Anthropic budget POST_H T3.B wants to formalize? (Affects cost-gating story.)

Each resolvable in <500 credits; do before scoping the PR chains.

---

## §6. PROD inventory (informational — do not re-build)

These were originally on the v1 ledger or discovered in audit. **All shipped, all in active use.** Listed here only so the next planner doesn't re-scope them.

**Originally v1 features now PROD:**
- Daily AI coach briefing (v1 §3.1) — `coach/brief/` 82KB service + `CoachBriefScreen`
- Native nutrition / meal plan (v1 §2.5) — `food/`, `macros/`, `meal-plans/`, `recipes/`, `fasting/`, `water/`, `lists/`, 11 mobile screens, USDA-shaped schema with `NutrientBasis` enum

**Post-v1 discovered (built after v1 was written):**
- Roman flagship voice/chat coach (`roman/`, `RomanSession`, `RomanMessage`, `RomanChatScreen`) — close-out is A1
- Stillwater design system (in flight on POST_H Tier 5)
- Coach AI credits / budget economics (`ai-credits/`, `CoachAIBudget`, `UserAIQuota`) — production formalization on POST_H Tier 3 T3.B
- Community full social layer (`community/` 18 sub-modules, 16 DB models)
- Bloodwork module (`bloodwork/`, `BloodworkPanel/Result/Attachment`, 2 mobile screens)
- Dunning v2 (`checkout/dunning-v2/`, full lockout-recovery flow)
- Build Week (`build-week/`, `BuildWeekDay/Enrollment/Completion`, seed data)
- Diagnostic submissions / lean intake (`DiagnosticSubmission`, `AiRoadmap`, `LeanQ1…6Screen`)
- Named regimes / partial-refund decisions (`regimes/`)
- GDPR scrub / right-to-erasure (`users/gdpr-scrub`, `User.deletion_*`)
- First-win / Day-1 ceremony (`first-win/`, `CommunityWin`, `Day1WinScreen`)
- 1:1 scheduling (`scheduling/`, full Google Calendar OAuth, availability, sessions)
- Storefront + Stripe Connect spine
- E-sign contracts engine (`contracts/`, full envelope + template + audit)
- PTM churn prediction (`ptm/`, `PtmPrediction`, heuristic + weighted + scheduler)
- Coach effectiveness + LTV metrics (`coach-effectiveness`, `ltv-metrics.service` 37KB)
- Coach landing pages + custom domain (`landing-pages/`, `custom-domain.service`, DNS verifier)
- Wearable Apple/Google/Samsung adapters (Whoop/Oura/Garmin still missing — see A3)

---

**End of v2 ranked ledger.** Next: planner stage maps Bucket A → POST_H Tier 4 PR chains.

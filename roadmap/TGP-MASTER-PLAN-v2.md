# TGP Master Plan — v2 (audited build state + ranking-ready)

**Supersedes:** `roadmap/TGP-Feature-Roadmap-v1.md` (Jun 2026) and `roadmap/TGP-MASTER-EXPANSION-PLAN.md` Stage 3 section.
**Date:** 2026-06-19
**Method:** Direct audit of `growth-project-backend` (168 Prisma models, 156 migrations, ~95 modules) and `growth-project-mobile` (50+ screens, 4 health-platform adapters) against every Stage-3 feature in v1. Cross-checked against `CONSUMER_MARKETPLACE_SPEC.md`, `TALENT_MARKETPLACE_SPEC.md`, `PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md`, and the in-flight Wave H + `POST_H_LADDER.md`.

> **What this document is:** a single replacement source-of-truth that tells you, for each originally-planned feature: (a) what's actually built, (b) what's missing, (c) what's been superseded by a newer, sharper spec, and (d) a blank "must do / nice to have / not important" column for you to rank. After you rank, the next planner stage will rebuild a PR chain that maps ranked items to Tier 4 of `POST_H_LADDER.md` (Features tier).

> **What this document is NOT:** a re-statement of the strategic vision. The decacorn frame, the 5-stage waterfall, the 5 quality rules, and the Product Dominance Playbook remain unchanged — see `TGP-MASTER-EXPANSION-PLAN.md` for those. This doc is purely the *feature ledger*.

---

## Build-state scoring legend

| Tag | Meaning |
|---|---|
| **PROD** | Shipped, in active use, behind a feature flag or live. Backend + mobile + (where relevant) data layer all present. |
| **MOSTLY** | 70–95% built — primary surfaces exist, edges/polish/one sub-feature outstanding. |
| **PARTIAL** | 30–70% built — clear scaffolding (controllers, services, schema), but the *closing-the-loop* piece is missing. This is where the v1 doc's "partially built — must complete" lives. |
| **SCAFFOLD** | <30% — name reserved, model exists, or controller stub, but no real path through. |
| **ZERO** | Not started. No model, no module, no screen. |
| **SUPERSEDED** | A newer, operator-locked spec absorbs or replaces this. Pointer in the supersession column. |
| **DEPRECATE?** | Built but possibly obsolete given strategic shifts — flag for explicit kill decision. |

## Evidence anchors (so this is reproducible, not vibes-based)

Every audit row cites at least one of:
- **BE-MOD:** backend module path under `growth-project-backend/src/`.
- **BE-SVC:** backend service file with line count proxy for depth.
- **DB:** Prisma model name(s) in `prisma/schema.prisma`.
- **MIG:** migration date stamp from `prisma/migrations/`.
- **MOB:** mobile path under `growth-project-mobile/src/`.
- **HOOK:** mobile React hook.
- **SPEC:** operator-locked spec doc that supersedes.

---

## §1. The feature ledger — ranked-ready

> Fill the **Your rank** column with one of: `MUST DO` · `IMPORTANT` · `NICE TO HAVE` · `NOT IMPORTANT` · `KILL`. Numeric tie-breaks are optional. Strikethrough rows in §3 are already retired from the plan.

### 1.A — Originally "Partially built — must complete" (v1 §1)

| # | Feature (v1 §) | Audited state | What's actually built | What's missing | Supersession / notes | **Your rank** |
|---|---|---|---|---|---|---|
| 1.1 | **Closed-loop adaptive programming (autopilot)** (v1 §1.1) | **PARTIAL** | Workout-program data model is rich: `WorkoutProgram` (template + cloned), `WorkoutPlan`, `WorkoutPlanRevision`, `WorkoutProgramRevision`, `ClientWorkoutAssignment`, `WorkoutPlanExercise`, `WorkoutBuilderIdempotencyKey`, `ExerciseSet.rpe` field, `Intensity` enum. AI write path exists (`AIDraft`, `AiActionDraft`, `PendingAiDraftsScreen.tsx`, `useCoachAckActions.ts` — coach reviews AI-proposed program changes). `WeeklyInsightCron` (BE-MOD: `src/ai/coach/weekly-insight.cron.ts`) generates per-client adjustment suggestions. `CoachBriefService` (BE-SVC: 82KB) surfaces them. | The **closed loop** itself: a rule+LLM layer that *automatically writes* the next-week program revision based on trailing RPE + completion + wearable HRV, then puts it in a coach-approval queue. Today's path is AI-assist (coach asks AI to suggest), not autopilot (system proposes weekly without prompt). | None — still the marquee feature. v1's spec is correct; what changes is the build estimate is now smaller because all four substrate pieces exist. | _____ |
| 1.2 | **Wearable deep integration** (v1 §1.2) | **MOSTLY** | Full multi-provider pipeline shipped: `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableUserMetricPreference` (DB), `WearableProvider` + `WearableMetricType` + `WearableMetricBucket` enums. Mobile has four adapters: `services/health/healthkit`, `services/health/healthConnect`, `services/health/samsungHealth`, `services/health/onDeviceConnect`. Hooks: `useHealthKitSync.ts`, `useHealthConnectSync.ts`, `useSamsungHealthSync.test.tsx`. Community-side surfacing exists (`CommunityWearablePrompt`, `community/wearable-prompts/` BE module). MIG: `20261211_add_sleep_consistency_metrics`. | Whoop / Oura / Garmin are enumerated in `WearableProvider` but adapter code looks Apple/Google/Samsung-only. Coach client card recovery-score badge (green/yellow/red) needs confirmation in `CoachClientDetail`. Feed of recovery score into the adaptive engine = same blocker as 1.1. | None. | _____ |
| 1.3 | **Marketplace / public discovery layer** (v1 §1.3) | **SUPERSEDED → split into two products** | The v1 spec described a single marketplace. Operator on 2026-06-16 split this into TWO operator-locked specs: `CONSUMER_MARKETPLACE_SPEC.md` (clients discover coaches) and `TALENT_MARKETPLACE_SPEC.md` (gyms/head-coaches hire new coaches). Backend already has: `talent-marketplace/` BE module (anti-bot, apply controller/service/dto, hirer-verified guard, job-listing controller, public-listing controller, idempotency, JSON-LD job posting); DB: `JobListing`, `Applicant`, `Application`, `CoachOffer`, `MarketplaceMutationIdempotency`, `MarketplaceConnectEvent`, `MarketplaceAbuseSignal`; MIGs: `20261220_talent_marketplace_rls`, `…_marketplace_idempotency_claim_nonce`, `…_marketplace_abuse_signal_rls`. Public listing controller spec test exists. Consumer Marketplace remains ZERO on the consumer side but reuses the coach profile + Stripe Connect + RLS spine that Talent already proves out. | Consumer Marketplace: every section of `CONSUMER_MARKETPLACE_SPEC.md` (badge engine Certified/Elite/Sponsored auto-award + Roman celebration popup, four-rail search, modality filters, web parity, gym-affinity rail). Talent Marketplace: web parity, public SEO listings UI, applicant tracking, "candidates like this", new-applicant alerts, applicant portfolio. | Use `CONSUMER_MARKETPLACE_SPEC.md` §1–4 and `TALENT_MARKETPLACE_SPEC.md` §1–6 as the authoritative replacement for v1 §1.3. v1 §1.3 retired. | _____ (rank each marketplace separately below) |
| **1.3-a** | **Talent Marketplace (gyms/HCs hire coaches)** | **PARTIAL → backend mostly there, no UI** | See above. | Mobile screens for hirer + applicant; web parity surface; anti-bot challenge provider selection (open architecture Q). | TM is `POST_H_LADDER` Tier 1 (TM backend = plumbing) + Tier 4 (TM web/mobile = consumer-shaped feature). | _____ |
| **1.3-b** | **Consumer Marketplace (clients discover coaches)** | **ZERO on consumer side; foundation exists** | Coach profile, Stripe Connect, RLS spine, reviews-as-signal, badge engine — all reusable from Talent. | Everything client-facing: discovery, search rails, badge UI, celebration popup, modality filters, web pages, SEO city pages. | Tier 4 of `POST_H_LADDER`. | _____ |

### 1.B — Originally "Not yet built — core coaching gaps" (v1 §2)

| # | Feature (v1 §) | Audited state | What's actually built | What's missing | Supersession / notes | **Your rank** |
|---|---|---|---|---|---|---|
| 2.1 | **Unified coach inbox / command center** | **MOSTLY → arguably PROD** | Backend: `src/coach/command-center/` (28KB churn-intervention.service, 32KB command-center.service, 37KB ltv-metrics.service, 14KB controller). `src/community/inbox/` (community-coach-inbox controller+service+repository+dto). `src/community/ai-triage/` (15KB service, prompts, output schema, triage-cache.service — *the AI triage layer v1 calls for*). Mobile: `CoachHomeScreen.tsx`, `RiskBoardScreen.tsx`, `ClientRiskDetailScreen.tsx`, `coach/command-center/` directory, `services/commandCenterApi.ts`, `useInboxTriage.ts` hook. | Final UX polish — three-panel layout, bulk approve-all-AI-changes button, read receipts, "coach last seen", broadcast-to-segment. Some of this may already be present in `command-center/`; need a UX audit, not a new build. | This is much further along than v1 implies. Recommend re-scoping to "Inbox UX polish + AI triage activation" instead of "build inbox from scratch." | _____ |
| 2.2 | **Team QA / manager-level ops layer** | **MOSTLY** | Backend: `sub-coaches/` module (sub-coach-analytics.service, head-coach-only.guard, sub-coach-invite.service, controller, dto, types), `team/` module, `team-mode/` module (tier-resolver), `TeamSubCoachAssignment`, `TeamAuditEvent`, `TeamProfile`, `SubCoachInvite`, `SubCoachAssignment`, `SubCoachMutationIdempotency` (DB). Mobile: `TeamManagementScreen.tsx`, `TeamMembersScreen.tsx`, `SubCoachDetailScreen.tsx`, `SubCoachInviteModal.tsx`, `CoachTeamProfileScreen.tsx`. | The QA *view* — per-sub-coach response-time metrics, % clients with programs updated in 7d, unanswered check-in flags, weekly ops digest. Substrate exists; the dashboard surface may not. | None. | _____ |
| 2.3 | **AI-generated check-in summaries** | **PARTIAL** | `CheckIn` DB model present; `coach-check-ins.controller.ts` + `client-check-ins.controller.ts`; community AI-triage is the closest existing analogue (it triages community messages with Claude). `CoachBriefService` (82KB) already reads check-in data to write daily briefs. `HolisticInsightCache` + `holistic-insights.service.ts` exist. `coach/brief/coach-brief.scheduler.ts` (18KB). | A dedicated "check-in digest" panel that aggregates urgency, generates suggested replies per check-in, and surfaces weekly themes. The data is read; the digest UI isn't dedicated. | Heavily overlaps with §3.1 daily briefing — consider merging into one "AI coach assistant" workstream. | _____ |
| 2.4 | **AI video form analysis** | **SCAFFOLD** | `ExerciseSet.video_url` field exists; `src/video/mux.service.ts` + `mux-webhook.controller.ts` (Mux video pipeline); `CoachMediaAsset`, `MuxProcessedEvent`, `ClientAssetGrant` (DB); `ai/adapters/anthropic.adapter.ts`. | The computer-vision provider integration (ymove/MediaPipe), pose-estimation pipeline, scoring + timestamped annotations, coach review queue, client upload screen. Video plumbing for storage/streaming is there; the *analysis* is not. | None. Cost-per-analysis (~$0.25) means this needs to land *behind* the AI usage economics spine (POST_H Tier 3 T3.B). | _____ |
| 2.5 | **Native nutrition / meal-plan module** | **PROD** | Backend: `src/food/`, `src/macros/`, `src/meal-plans/`, `src/real-meal-plans/`, `src/recipes/`, `src/fasting/`, `src/water/`, `src/prep-guide/`, `src/lists/`. DB: `FoodItem` (USDA-shaped with `NutrientBasis` enum PER_100G/PER_SERVING), `LoggedFoodEntry`, `MealPlan`, `DailyMealPlan`, `DailyMealPlanSlot`, `DailyMealPlanAssignment`, `MealTemplate`, `MacroTarget`, `Recipe`, `SavedRecipe`, `WaterLog`, `FastingWindow`. Mobile: `ClientDailyMealPlanScreen`, `ClientMacrosScreen`, `CoachMealTemplatesScreen`, `CoachMacrosReviewScreen`, `RecipesScreen`, `RecipeDetailScreen`, `GroceryListScreen`, `ShoppingListScreen`, `PrepGuideScreen`, `FastingScreen`, `AIMealPlanDraftScreen`. Seed data: `prisma/seed-foods.ts`, `seed-recipes.ts`. | Barcode scan flow if not already in the food browser (`useFoodBrowse.ts` exists), end-of-day AI compliance summary if not in `holistic-insights`. | This is **far** more built than v1 implies. v1 listed this as "Priority 5 high build effort" — it's actually shipped. Recommend re-scoping to "Nutrition polish + AI summary." | _____ |
| 2.6 | **Reusable smart check-in forms** | **PARTIAL** | `CheckIn` model has mood/energy/soreness/sleep_hours/weight_kg/notes — *fixed-schema*, not coach-configurable. `MealTemplate` proves the templating pattern exists elsewhere. `DiagnosticSubmission` + `prisma/seed-diagnostic.json` proves form-engine existence. | Coach-defined form builder, per-template assignment, auto-populate previous answers, recurring-schedule cron, AI summary trigger. | Tightly coupled to 2.3 (check-in AI summaries). | _____ |
| 2.7 | **Automated lead-to-client onboarding flow** | **MOSTLY** | Backend: `src/storefront/` (20+ files: checkout, guest-checkout, reconciliation, recovery, rate-limiter, idempotency, cookie service, thank-you, PII scrub, lost-webhook reconcile), `src/contracts/` (envelope service, template service, signed-pdf-store, providers, webhooks, telemetry — *e-sign engine*), `src/checkout/` (purchase-split-handler, dunning, dunning-v2). DB: `ClientPurchase`, `GuestCheckout`, `ContractTemplate`, `ContractEnvelope` (with `template_version`, `signed_pdf_url`, `signed_at`, `expires_at`), `ContractAuditEvent`, `CoachLandingPage`, `CoachLandingPageSection`, `CoachLandingLead`. Mobile: `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `CheckoutReturnScreen`, `OnboardingStep1…10`, `LeanQ1…6` (lean intake), `Day1Win`. MIG: `20261215_b5_digital_contracts`, `20261215_seed_b5_contract_templates`, `…_contracts_rls`. | Welding the four pieces (intake → contract sign → Stripe checkout → first program assignment) into a single coach-configurable funnel template. Each piece is built; the *configured sequence* may not be a single setup screen. | This is much further along than v1 implies. Recommend re-scoping to "Lead funnel composer" (chain existing primitives) instead of "build onboarding flow." | _____ |
| 2.8 | **Client loyalty & reward system** | **ZERO → partial via streaks** | `Habit` + `HabitLog` (DB) gives streak data; `community/challenges/` (26KB service, 24KB repository, 12KB dto) is the closest analogue (challenges, participations). `CommunityWin` model + `first-win/` module for one-time milestone celebrations. `LeaderboardScreen` + `leaderboard/` module. `mobile/src/lib/milestones.ts`. | A configurable per-coach milestone engine (define trigger → define reward → fire on hit), reward-types catalog (badge/notification/discount-code/coach-video), client timeline integration. | Overlaps with community challenges — consider whether milestone = "personal challenge" in the challenge engine. | _____ |
| 2.9 | **Re-engagement automations** | **MOSTLY** | Backend: `src/nudges/` (full module: coach-nudges, client-nudges, dto, service), `src/notifications/nudges/`, `CoachNudge` model, `NudgeLog`, `ChurnIntervention` (full draft → edit → send workflow with idempotency, alert linkage, risk_score_at_draft), `PtmPrediction` + `ptm/` module (heuristic, weighted, scheduler — *churn prediction in production*), `coach-alerts.controller.ts` + service. Mobile: `useCoachAckActions`, `coach-alerts` likely surfaced in CoachHome. | Coach-configurable triggers ("if no login 5d, send Message A; if 10d send Message B") and message templates. The *send* path exists (ChurnIntervention); the *trigger configuration UI* may not. | None. | _____ |
| 2.10 | **Migration / import tooling** | **ZERO** | None. No Trainerize/Everfit importer module, no import-pipeline scaffold, no spreadsheet upload. | All of it. CSV importer, Trainerize JSON parser, branded invite emails, program-format conversion, billing-migration prompt. | **Master Plan explicitly flags this as the App Store launch gate prerequisite** ("REQUIRED before marketing") — it's #6 in the Stage-3 ranking. Don't deprioritize. | _____ |
| 2.11 | **Referral tracking engine** | **ZERO** | None. No Referral model, no referral-link service, no Stripe-webhook attribution to a referrer. Closest existing primitive: `InviteCode` + `invite-codes/` module (bulk invite), `share-link/` module. | All of it. Unique referral URL per client, Stripe-webhook attribution, reward triggers (discount/free week/cash payout via Connect), leaderboard. | Could be built on top of the existing `invite-codes` + `share-link` modules — substrate is closer than zero. | _____ |
| 2.12 | **White-label multi-tenant packaging** | **SCAFFOLD** | `community/community-workspace.ts` model (`CommunityWorkspace`) — community-level tenancy. `landing-pages/custom-domain.controller.ts` + `custom-domain.service.ts` + `dns-verifier.ts` (CNAME engine). Backend RLS spine is extensively tiered (`20261213_rls_tier1…tier5` migrations) which is the technical precondition. `Role` enum has `owner` tier above `coach`. | App-store-per-tenant (Apple/Google developer accounts), theme configuration UI, per-tenant data partitioning (RLS goes most of the way), white-label pricing tier. | v1 marked Priority 9 (long-term). Recommend `DEPRECATE?` or `NOT IMPORTANT` until Stage-4 gym chains land. | _____ |

### 1.C — Originally "New ideas — high impact" (v1 §3)

| # | Feature (v1 §) | Audited state | What's actually built | What's missing | Supersession / notes | **Your rank** |
|---|---|---|---|---|---|---|
| 3.1 | **Daily AI coach briefing** | **PROD** | Backend: `src/coach/brief/` — 82KB service, 18KB scheduler, 14KB ai-triage analogue, plus `coach-brief.controller`, `coach-brief-preferences.service`, `coach-brief.dto`, `coach-brief.module`, `coach-brief.types`, `coach-daily-log.service`, `coach-brief-enabled.guard`. DB: `CoachBrief`, `CoachBriefPreferences`, `CoachDailyLog`, `CoachBriefPushLedger`. Constants: Claude 3.5 Sonnet, 15s timeout, idempotent per (coach_id, brief_date), generation lease. Mobile: `CoachBriefScreen.tsx`, `COACH_BRIEF_README.md`. | Possibly: head-coach view (substrate has `BriefContextHeadCoach`, `HeadCoachActionItem`, `SubCoachHighlight`), one-tap actions from briefing. Push-notification ledger says push delivery is wired. | This is **shipped**. v1 listed it alongside features that aren't yet built; in reality the Daily Brief is one of the most-developed pieces. | _____ |
| 3.2 | **AI class demand forecasting (gym mode)** | **ZERO** | None. `gym/gym-distribution.service.ts` exists but is a single file (scaffold). No class-attendance schema, no time-series model. | All of it. Depends on Gym Mode landing first (see §1.D below). | Stage-4E in Master Plan — appropriate to defer. | _____ |
| 3.3 | **Async video replies** | **PARTIAL** | `CommunityVoiceNote` model (DB) + `community/voice/` module — voice replies likely shipped. `mux.service.ts` + `CoachMediaAsset` + `MuxProcessedEvent` — video upload pipeline ready. Mobile: `MessagesScreen.tsx`, `community/messages/`. | Coach-specific 30–60s video reply UI in a check-in/message thread, Whisper transcription wire-up, 30-day auto-expire. Substrate is fully there. | Recommend re-scope to "Video reply *UI*" — the engine is built. | _____ |
| 3.4 | **Progressive overload visualization** | **PARTIAL** | DB: `ExerciseSet.reps_per_set`, `weight_per_set`, `rpe`, `notes` → 1RM calculation has all required inputs. `ExerciseCatalogItem`, `exercise-library/`, `exercise-catalog/`. Mobile: `ProgressScreen.tsx`, `client/progress/` directory, `ExerciseDetailScreen.tsx`, `ExerciseLibraryScreen.tsx`. | Time-series 1RM chart per exercise, PR marker logic, composite Strength Score, shareable image. | Possibly already partly rendered in `ProgressScreen` — needs UX audit. Low effort once 1RM computation is in place. | _____ |
| 3.5 | **Coach staff commission tracking** | **PARTIAL** | Backend: `payouts-v2/` (payout-method controller/service, payout-routing, platform-fee, stripe-connect provider, webhook controller), `connect/` (Stripe Connect adapter), `sub-coaches/sub-coach-analytics.service.ts`, `checkout/purchase-split-handler.service.ts`. DB: `SplitLedgerEntry`, `ConnectTransfer`, `PayoutSnapshot`, `PayoutMethod`, `FeePolicy`, `SubCoachAssignment`. MIG: `20261215_payouts_v2_bank_payout_methods`. | Configurable per-sub-coach commission % UI, monthly auto-calculation, sub-coach earnings dashboard. Engine is there; the *configuration surface* + reporting view may not be. | None. | _____ |

### 1.D — Originally "Gym mode" (v1 §4) — full status

| # | Feature (v1 §) | Audited state | What's actually built | What's missing | Supersession / notes | **Your rank** |
|---|---|---|---|---|---|---|
| 4.1 | **Gym Mode toggle / gym-first architecture** | **SCAFFOLD** | `src/gym/gym-distribution.service.ts` (single file, ~scaffold). Consumer Marketplace spec §2.8 mentions `app.current_gym_ids()` RLS function and "coaches at your gym" rail — so the gym↔member spine is contemplated. `CommunityWorkspace` is the closest existing tenancy model. | The whole thing. No `Gym`, `Membership`, `Class`, `Booking`, `Facility`, `DoorAccess`, `MemberCheckIn` models. No member-first profile path. | This is **Stage 4A/B/D** in the Master Expansion Plan — explicitly after App Store launch gate. v1 had it earlier than Master Plan; defer to Master Plan ordering. | _____ |
| 4.2 | **Membership creation system** | **ZERO** | Stripe `Products`/`Prices` integration exists via `CoachPackage`, `ClientPurchase`. Same primitives reusable. | Gym-side membership builder UI, draft/publish states, archive grandfathering, access rules, capacity limits. | Stage 4A. | _____ |
| 4.3 | **Billing operations (gym)** | **ZERO** | Stripe Subscriptions exists at coach level (`CoachSubscription`). Dunning v2 (`checkout/dunning-v2/`, MIG `…_dunning_v2_lockout_recovery`) reusable. Stripe Terminal: not present. | Member-side billing, freeze/pause, prorated billing, comps, POS, daily revenue report. | Stage 4A. | _____ |
| 4.4 | **Class & facility scheduling** | **PARTIAL → coach-level scheduling shipped** | Backend: `src/scheduling/` (12 files: availability, open-slots, session-lifecycle, slot-computer, webhook, controller, types, permissions, google-calendar/, google-oauth/, jobs/, providers/). DB: `SessionType`, `CoachAvailability`, `CoachAvailabilityOverride`, `CoachingSession`, `SessionParticipant`, `CalendarConnection`. Mobile: `CoachAvailabilityEditorScreen`, `CoachBookingInboxScreen`, `ClientBookingRequestScreen`, `ClientUpcomingSessionsScreen`, `RescheduleSheet`. | Class (group) version: capacity, waitlist auto-promote, cancellation windows + fee, recurring weekly templates, facility/equipment booking, staff scheduling. | 1:1 substrate is fully built; class version reuses it. | _____ |
| 4.5 | **Access control (door / kiosk)** | **ZERO** | None. No QR check-in, no BLE/NFC integration, no door-hardware provider (Kisi/Salto). | All of it including hardware contracts. | v1 Priority 8. Stage 4E in Master Plan. Recommend deferring. | _____ |
| 4.6 | **General member account type** | **ZERO** | `User.role` enum has `coach`, `student`, `owner` — no `member` tier. RLS spine ready. | New role + schema, simplified profile, self-service portal, family/household accounts, upsell CTA. | Stage 4A. | _____ |
| 4.7 | **Staff role architecture (front desk / trainer / manager / owner)** | **PARTIAL** | `Role` enum has `coach`/`student`/`owner`. `HeadCoachOnlyGuard`, sub-coach permissions. Soc2 admin module exists (`admin/soc2`). RLS tier 2 = coach/team. | Granular roles below owner: front_desk, trainer, manager. Permission matrix. | Stage 4A. | _____ |
| 4.8 | **Gym ops dashboard** | **ZERO** (coach version partially built) | Coach-side: `coach-effectiveness.controller.ts` + scheduler + service, `CoachBusinessMetricsScreen`, `ltv-metrics.service.ts` (37KB). | Gym-tier daily revenue, attendance heatmap, member health metrics, churn risk panel (substrate via PTM exists), bulk SMS/push, e-sign waiver. | Stage 4A. | _____ |

### 1.E — Features added/discovered during execution (not in v1, but built)

These represent the *delta* — things the team shipped after v1 was written, which now belong on the master ledger.

| # | Feature | State | Where it lives | Notes / rank-able? | **Your rank** |
|---|---|---|---|---|---|
| 5.1 | **Roman (TGP's flagship voice/chat coach AI)** | **PROD-ish, in flight** | BE-MOD: `src/roman/` (controller, service, prompts, voice/, anthropic-client provider, roman-feature.guard, coach-reviewed.feature). DB: `RomanSession`, `RomanMessage`. MIG: `20261216_add_roman_chat`. Mobile: `RomanChatScreen.tsx`, `useRomanChat.ts`, `mobile/src/lib/roman/`. POST_H Tier 1 has "Roman P4 close-out" as a remaining task. | This is post-v1 invention; ranks as "MUST DO finish." | _____ |
| 5.2 | **Stillwater design system** | **IN FLIGHT** | Workspace doctrine. POST_H Tier 5 (UX Polish) has Tier 1 primitives + Tier 2 redesigns + Tier 3 sweep. | Operator priority 5 in pyramid; not ranked here since it's a doctrine, not a feature. | _____ |
| 5.3 | **Coach AI credits / budget economics** | **PARTIAL** | BE-MOD: `src/ai-credits/` (budget service, scheduler, credit-pack checkout, dormancy guard, bankers-round util). DB: `CoachAIBudget`, `UserAIQuota`, `CoachCreditPackPurchase`. Mobile: `CreditPackCheckoutScreen`, `useAIBudget`. POST_H Tier 3 T3.B = "AI usage economics → production" with locked numbers ($40 cap / 3.125× / $125 / $10-25-99-custom packs). | Not in v1 — emerged from operational reality. **Critical: gates 2.4 video form analysis and 1.1 autopilot from runaway cost.** | _____ |
| 5.4 | **Admin Control Room** | **PARTIAL** | Mobile: `AdminControlRoomScreen.tsx` + `coach/ADMIN_CONTROL_ROOM_README.md`. BE-MOD: `src/admin/` (admin.controller, admin.dto, admin.module, admin.service, console/, entitlements/, federation/, metrics.service, owner-console.controller, ptm/, reports/, soc2/). POST_H Tier 4 T4.C lists §11.A–O sections outstanding. | Operator-facing console for risk, payouts, support, federation. Ranks as separate workstream. | _____ |
| 5.5 | **Community (full social layer)** | **MOSTLY → PROD** | BE-MOD: `src/community/` (18 sub-modules: ack, ai-triage, challenges, classroom, cohorts, dms, events, inbox, messages, moderation, notifications, plan-context, posts, reactions, realtime, search, voice, wearable-prompts). 16 Community* DB models. Mobile: `CommunityScreen`, `PrivateCommunityHubScreen`, `community/` directory. | Not in v1 at all. Probably an "ecosystem moat" feature — rank explicitly. | _____ |
| 5.6 | **Bloodwork module** | **PROD** | BE-MOD: `src/bloodwork/`. DB: `BloodworkPanel`, `BloodworkResult`, `BloodworkAttachment`. Mobile: `BloodworkEntryScreen`, `BloodworkReviewQueueScreen`. | Not in v1; medical-grade differentiator. | _____ |
| 5.7 | **Cross-pillar (Fitness + Wealth)** | **SCAFFOLD** | BE-MOD: `src/coach/cross-pillar/`. `User.coach_practice_type` enum (`fitness_only` / `finance_only` / `both`). Mobile: `BothPillarsScreen`. | Hints at a TGP Wealth product — strategic; rank separately. | _____ |
| 5.8 | **Dunning v2** | **PROD** | BE-MOD: `src/checkout/dunning-v2/`, `src/checkout/dunning.service.ts`. DB: `DunningState`, `DunningAttempt`, `PaymentRecoveryToken`, `PaymentReminder`. MIG: `20261214_dunning_v2_lockout_recovery`. | POST_H Tier 3 T3.C = "Dunning v1" — may already be superseded by v2. Verify status. | _____ |
| 5.9 | **Build Week (structured client onboarding)** | **PROD** | BE-MOD: `src/build-week/`. DB: `BuildWeekDay`, `BuildWeekEnrollment`, `BuildWeekDayCompletion`. Seed: `prisma/seed-build-week.json`. | Possibly subsumes/replaces parts of v1 §2.7. | _____ |
| 5.10 | **Diagnostic submissions / lean intake** | **PROD** | DB: `DiagnosticSubmission`, `AiRoadmap`. Mobile: `LeanQ1…6Screen`. | Not in v1; key onboarding piece. | _____ |
| 5.11 | **Named regimes / partial-refund decisions** | **PROD** | BE-MOD: `src/regimes/`. MIG: `20261214_named_regimes_and_partial_refund_decision`, `20261218_rls_partial_refund_decision`. | Not in v1; coach-business operational. | _____ |
| 5.12 | **GDPR scrub / right-to-erasure** | **PROD** | `users/gdpr-scrub.scheduler.ts` + service, `User.deletion_*` columns, MIG `20260507_add_gdpr_deletion_flow`. | Compliance feature. | _____ |
| 5.13 | **First-win / Day-1 ceremony** | **PROD** | BE-MOD: `src/first-win/` (uses OpenAI for celebration copy). Mobile: `Day1WinScreen`, `day-one/` directory, `client/first-win/`. | Retention micro-feature. | _____ |

### 1.F — Features in v1 that may be **DEPRECATE?**

Flag any of these for explicit kill:

| # | v1 feature | Why flagged |
|---|---|---|
| 2.12 | White-label multi-tenant | Stage 4 Master Plan defers indefinitely; may never be product-market-fit if TGP wins on direct relationships. **Your call:** _____ |
| 3.2 | AI class demand forecasting | Requires Gym Mode first; Gym Mode is post-launch-gate. Worth keeping in v2 list but rank `NOT IMPORTANT`. **Your call:** _____ |
| 4.5 | Access control (door hardware) | Hardware partnership cost may not be justified pre-Stage-4E. **Your call:** _____ |
| 2.8 | Loyalty / rewards | If sustainable-gamification doctrine kills "badge theater," is this still on-doctrine? Or is it just `community/challenges/` rebranded? **Your call:** _____ |

---

## §2. Strategic recap (unchanged, for context only)

These are NOT being re-asked. Authority: `roadmap/TGP-MASTER-EXPANSION-PLAN.md`.

- **Vision:** Apple-grade coaching platform → complete fitness operating system replacing Trainerize + Mindbody simultaneously.
- **Quality bar:** decacorn / luxury / Maya voice / ≤300ms motion / no exclamation / no emoji / no hype.
- **Stage waterfall:** Stage 0 cleanup → Stage 1 mobile refactor → Stage 2 IA → Stage 3 19-feature roadmap (this doc) → App Store launch gate → Stage 4A/B/C/D-prereq/D/E gym expansion.
- **App Store launch gate prerequisites:** Closed-loop autopilot (1.1) + wearable deep (1.2) + unified inbox (2.1) + AI summaries (2.3) + daily brief (3.1, already shipped) + migration tooling (2.10, NOT shipped) + marketplace launch (1.3-b consumer side).
- **Engineering priority pyramid (POST_H_LADDER):** Infrastructure → Security → Observability → Features → UX polish. Tier-gates between tiers. This Stage-3 ledger feeds **Tier 4** of the pyramid.

---

## §3. Retired items (do not rebuild)

These were in v1's competitive-moat table or build-priority matrix but are now either superseded, absorbed, or obsoleted:

- **v1 §1.3 single "marketplace"** → split into Consumer + Talent (specs locked 2026-06-16).
- **v1 §4 "Gym Mode" as Priority 4** → re-sequenced to Stage 4A/B/D, post-launch-gate.
- **v1 §6 priority matrix overall** → superseded by POST_H_LADDER tier pyramid + this ledger's ranking column.
- **v1 §5 competitive moat table** → still valid as marketing, but no longer drives engineering priority.

---

## §4. How to use this document

1. **Fill the "Your rank" column** in each table above (1.A–1.E). Use `MUST DO` / `IMPORTANT` / `NICE TO HAVE` / `NOT IMPORTANT` / `KILL`.
2. **Resolve the DEPRECATE? rows** in §1.F.
3. Hand back to planner. Planner will:
   - Group all `MUST DO` rows into POST_H_LADDER Tier 4 lanes, sequenced by engineering dependency.
   - Move all `IMPORTANT` to a Tier 4 stretch lane.
   - Park `NICE TO HAVE` as a post-launch-gate backlog.
   - Delete `NOT IMPORTANT` / `KILL` from the working plan.
4. The output of step 3 becomes a child of `POST_H_LADDER.md` Tier 4 — not a separate plan. **Strategic vision document (Master Expansion Plan) > this ledger > POST_H_LADDER engineering ordering.**

---

## §5. Auditor notes / known unknowns

Things this audit could **not** verify without running the codebase:

- Whether `coach/command-center` already renders the three-panel inbox UX or only the data API.
- Whether `client/progress/` already renders the 1RM strength curve, or just shows raw logs.
- Whether `dunning-v2` has fully superseded `dunning v1`, and what POST_H T3.C "Dunning v1" actually means.
- Whether the `WearableProvider` enum's Whoop/Oura/Garmin values have working adapters or are placeholder-only.
- Whether the AI-triage prompt currently uses the same Anthropic budget that POST_H T3.B wants to formalize.

If any of these matter to ranking, flag them and a follow-up audit will resolve in <500 credits.

---

**End of v2 ledger.** Rank, return, plan.

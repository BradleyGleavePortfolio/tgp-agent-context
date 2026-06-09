# TGP — Open Backlog (pruned 2026-06-09)

**Source:** `EXHAUSTIVE_BACKLOG.md` (150 items) cross-referenced against `main@ed78bbef` (2026-06-09) + Round-3 bug register (`docs/audits/bug_register_round3_open_hunt_2026-05-27.md`) + recent PRs (#327, #361, #364, RLS-01..05, etc.).

**Removed as superseded / closed:** ~80 items. Most of Cycle A (PR-A merged), all 8 Cycle B RLS PRs merged (`3fa75ff`, `370a7ae`, `c94fa14`, …), HK-2..HK-6 wearables PRs merged through #364, AI gateway hardened (#327), payment-ops hardened (cursor pagination, throttles, transfer/payout webhook cases all live on main).

**Status keys:** OPEN (verified-open today), IN-FLIGHT (subagent running this session), DEFERRED (collides with active work), STRATEGIC (needs operator decision), FAR-HORIZON (post-launch).

---

## 0. ACTIVE — Round-3 Tier-1 fixers (in-flight this session)

| ID | Title | Subagent | Worktree |
|---|---|---|---|
| BUG-R2 | Dedup legacy MealPlansModule routes → real-meal-plans canonical | `bug_r2_meal_plan_dedup_mq6wh9rs` | `backend-r2-meal-plan-dedup` |
| BUG-R3 | Block archive of `CoachPackage` with active recurring subscribers | `bug_r3_package_archive_guard_mq6whvla` | `backend-r3-package-archive-guard` |
| BUG-R4 | GDPR export → S3 presigned URL | `bug_r4_r5_gdpr_fix_mq6wilno` | **STOPPED** — `@aws-sdk/client-s3` not in lockfile; needs dep PR |
| BUG-R5 | GDPR scrub cancels Stripe subs | (same subagent) | **STOPPED** — `StripeApiService.deleteCustomer` does not exist; `cancelSubscription` signature mismatches stub; correct service is likely `StripeConnectApiService` (used by `dunning.service.ts`); needs wiring decision |
| v1-4 | Community realtime + push + telemetry | `v1_4_community_builder_mq6w5fwk` | `backend-community-v1-4` |

---

## 1. Round-3 bugs still genuinely OPEN (verified 2026-06-09)

### Tier 1 — Security / money / data integrity (after current fixers land)

| ID | Title | Notes |
|---|---|---|
| BUG-R4* | Dep PR for `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, then re-dispatch R4 | Parent decision required (adds 2 deps) |
| BUG-R5* | Wire `StripeConnectApiService` into `GdprScrubService` + `UsersModule`, add `deleteCustomer` TODO | Parent decision required |
| BUG-R1 | `attachManualVideoLink` at `scheduling-session-lifecycle.service.ts:494` does not call `notifications.createNotification` — client never alerted to attached video | **DEFERRED:** collides with v1-4 builder on `notification-kind.ts`; spawn AFTER v1-4 merges |

### Tier 2 — Serious issues (need verification + fix)

| ID | Title | Verification needed |
|---|---|---|
| BUG-S1 | Single push token per user → multi-device & reinstall silently break notifications | Re-check `User` + `PushDeliveryLog` schema after v1-4 lands; may need `UserPushToken` 1:N table |
| BUG-S2 | Notifications accumulate forever — no TTL, no cap, no deletion job | Add scheduled prune + per-user cap (e.g. 500) |
| BUG-S3 | GDPR export missing Purchases, Sessions, Bloodwork, AI data | Couple with BUG-R4 dep PR — same file |
| BUG-S4 | Community Wins have no content moderation | DEFER until v1-5/v1-6 moderation pass — must coordinate with v1-4 broadcast payload contract |
| BUG-S5 | No notification when coach assigns workout/meal plan | Wire `notifications.createNotification` in plan-assignment paths |

### Tier 3 — Notable gaps

| ID | Title | Notes |
|---|---|---|
| BUG-N1 | `getAlerts()` has no cap — 200-client roster returns 200+ alerts | Add `take: 200` + cursor (same shape as `payment-ops.controller.ts:139`) |
| BUG-N2 | Check-in unique constraint prevents evening / multiple check-ins per day | Schema mutation — needs migration; coordinate with mobile UX |

---

## 2. Cycle A — leftover items (most of A.1–A.18 are merged)

| # | ID | Title | Status |
|---|---|---|---|
| A.13 | Mobile PR #192 R2 — `asyncStoragePersister` re-key on auth change | OPEN (mobile) |
| A.14 | PR-A-SubCoach-Consolidation — delete `src/sub-coach/`, port `assign-client`, add `(verb,path)` duplicate-registration contract test | OPEN |
| A.15 | PR-A2 — `ServiceTokenAdmin.req.user` shim so OwnerConsole `@Roles('owner')` works → drop allowlist entry | OPEN |
| A.16 | RecentAuthGuard sweep — password reset, MFA disable, payout method change, Stripe key rotation, email change | OPEN |
| A.17 | DataExport hardening — audit all "DB-state rate-limit" claims for predicate completeness | OPEN |
| A.18 | R46 prod-shaped env-validation smoke test on `main` after each merge | RECURRING |

A.1, A.2, A.3, A.4, A.5, A.6, A.7, A.8, A.9, A.10, A.11, A.12 — **REMOVED (merged)**.

---

## 3. Cycle C — Dependabot triage (still open)

| # | ID | Title |
|---|---|---|
| C.1 | Dependabot PR #1 — bump & full-CI |
| C.2 | Dependabot PR #2 |
| C.3 | Dependabot PR #3 |
| C.4 | Dependabot PR #4 |
| C.5 | Dependabot PR #5 |
| C.6 | Dependabot PR #6 |

---

## 4. Cycle D — Mobile foundation cleared

| # | ID | Title |
|---|---|---|
| D.1 | Mobile PR #123 — workout builder, 12 P1 bugs-only |
| D.3 | Backend `AGENT_RULES.md` sync with mobile R15–R33 (0.4 in canon) |
| D.4 | Apple Sign-In + Biometric flow App Store Guideline 4.8 audit |
| D.5 | Push permission timing audit — gate to value moments (R28) |
| D.6 | Codify canonical domain in `CPO_BRIEFING.md` — `app.trygrowthproject.com` (mobile), `joingrowthproject.com` (marketing + storefront), `tgp.app` BANNED (R45) |

D.2 — **REMOVED** (folded into A.13).

---

## 5. Cycle E — Pre-launch competitive hardening

| # | ID | Title | Priority |
|---|---|---|---|
| EW8 | Trainerize importer — Google Sheets / Excel program import | P0 launch |
| CC30 | AI Program Builder — natural-language brief → 12-week periodized program | P0 launch |
| ED.1 / AI Butler | AI Butler Identity ("Roman") — voice contract gate for all Cycle H polish | Spec first |
| Coach Brief v2 | Per-coach voice; sub-coach→head-coach escalation; replay; cross-Brief streaks | P1 |
| Master Workout Builder | Named regimes, auto-assign on package purchase, **separate PR** (not bundled with #123) | P0 launch — operator explicit ask |
| ME12 / Storefront Phase 2 | Course Builder — modules + drip + completion certs | P1 |
| Storefront Phase 3 | Elite per-coach landing pages (custom domain optional) | P1 |
| Section 10 | App Store ASO pack — title + subtitle + 10 screenshots + 15-30s preview + first-3-lines + ratings strategy | P0 launch |
| ME11 decision | White-label client app — kill or commit | STRATEGIC |

---

## 6. Cycle F — Billing P1 + early moat

| # | ID | Title |
|---|---|---|
| B3 | Smart Dunning — auto-retry Day 1/3/7, branded payment links, coach-notified only when human needed |
| B4 | Automatic Session Lock on Non-Payment |
| B5 | Digital Contracts + E-Signatures at Checkout |
| B6 | One-Click Package & Program Sales — auto-enroll on payment |
| EW1 | Proper Exercise Library — search, multi-criteria filter, crowdsourced (backend partial PR #182) |
| EW2 | Undo Button + Autosave across builder |
| EW3 | Full Android Parity verification |
| EW4 | Broadcast Messaging by Segment (scheduled sends + templates) |
| EW5 | Audio Content Support (warmups, breathwork, mindset) |
| EW7 | Easy Cancellation + Honest Billing (locked via B1/B10) |
| EW9 | Video Upload Without Caps — intelligent backend compression |
| EW10 | Smart Notification Engine — context-aware per behavioral pattern |

---

## 7. Cycle G — Billing P2 + medium-effort differentiation

| # | ID | Title |
|---|---|---|
| B7 | Flexible Billing Cadences — 28-day, bi-weekly, weekly |
| B8 | Built-In Installment Plans |
| B10 | Subscription Pause (Not Cancel) — 4-week pause flow |
| B12 | Automated Revenue Reporting for Tax |
| B13 | Client Lifetime Value Dashboard (builds on PR #264) |
| ME13 | Client-Side Social Feed / Accountability Layer (community v1-5+) |
| ME14 | Photo Meal Logging with AI Macro Estimation |
| ME15 | Automatic Workout Adaptation After Missed Sessions |
| ME16 | Progress Photo Transformation Timeline |
| ME17 | Client Engagement Scoring + Churn Prediction (mobile surface for PR #264) |
| ME18 | In-App Live Session Booking + Video Calls |
| ME19 | PT Marketplace / Discovery Layer |
| ME20 | Gamification Layer (streaks, badges, opt-in leaderboards) |
| ME21 | Grocery List Generator (optional Instacart hand-off) |
| ME22 | Offline Mode — full functionality + sync-on-reconnect |
| ME23 | API + Zapier Integration Layer |
| ME24 | Automated Client Win Stories — auto-generated shareable graphics |
| ME25 | Injury & Mobility Assessment On-Boarding |

---

## 8. Cycle H — Emotional Design (Apple/WHOOP/Linear-grade polish)

| # | ID | Title |
|---|---|---|
| ED.1 | AI Butler Identity ("Roman") — ships FIRST |
| ED.2 | Completion Drive rings — 3 arcs (check-in / brief / review) + deep-link routing |
| ED.3 | First Payment Wow Screen — Supabase realtime trigger, particle burst, MMKV once-only gate |
| ED.4 | Client Progress Chart Animation — Victory Native XL draw-in + haptic scrubber + auto PR flagging |
| ED.5 | Onboarding Polish — step transitions, Stripe Connect card flip, package creation permanence markers |
| ED.6 | Coach-Is-Watching Micro-Signal — competence pill ("Your coach reviewed this in 2 hours.") |

---

## 9. Cycle I — Content-to-Client Pipeline (THE MOAT)

| # | ID | Title |
|---|---|---|
| CC28 | TikTok/Reel post → auto-branded landing page → buy/book → nurture → client |

---

## 10. Cycle J — Crazy Cool (ICP-prioritized big bets)

| # | ID | Title | Size |
|---|---|---|---|
| CC26 | Real-Time AI Form Check via Camera | XL |
| CC27 | AI Clone of the PT | L |
| **CC29** | **Biometric-Adaptive Programming — Oura/Whoop/Apple Watch → auto-deload** (operator explicit ask) | L |
| **EW6** | **Wearable Integration — HealthKit + Oura + Whoop + Garmin + Samsung** (operator explicit ask) | L |
| CC31 | Body Scan via Smartphone Camera | XL |
| CC32 | Voice-First Workout Logging (Whisper-class on-device) | M |
| CC33 | Predictive Revenue Dashboard — MRR projection + at-risk action items | M |
| CC34 | Referral Engine in Client App | M |
| CC35 | Multi-PT Gym Dashboard | L |
| CC36 | Stripe Connect Marketplace | XL |

---

## 11. Billing P3 / Experimental

| # | ID | Title |
|---|---|---|
| B9 | Gym Revenue Split & PT Payroll — 70/30 splits |
| B14 | Referral Billing Credit System |
| B17 | Corporate Wellness Billing Portal (B2B) |
| B11 | Tip & Gratuity Feature |
| B15 | Dynamic / Surge Pricing by Time Slot |
| B16 | Business Credit Line on Verified MRR |
| B18 | Client Gifting & Milestone Rewards via Billing |

---

## 12. Section 7 Backlog

| # | ID | Title |
|---|---|---|
| BL.1 | Private Community Hub (largely subsumed by community v1-2..v1-6) |
| BL.2 | Community Voice Notes |
| BL.3 | Pro Upgrade Endpoint |
| BL.4 | LTV Peak Table |
| BL.5 | Bloodwork AI Interpret (consumes RLS-secured BloodworkResult/Attachment) |
| BL.6 | Subscription analytics event |
| BL.7 | Auto Dunning mobile surface (consumes B3) |
| BL.8 | First-Client Payment Nudge |

---

## 13. Cross-cutting ops / security hygiene (recurring)

| # | ID | Title | Cadence |
|---|---|---|---|
| OPS.1 | R46 prod-shaped env-validation smoke test after every merge | Recurring |
| OPS.2 | Floor List CI guard — fail build on `it.skip` / `testPathIgnorePatterns` / `eslint-disable` near Floor List paths | Recurring |
| OPS.3 | Duplicate-route `(verb, path)` contract test in Nest bootstrap | One-time (in A.14) |
| OPS.4 | "DB-state rate-limit" claims audit | Recurring |
| OPS.5 | RecentAuthGuard coverage matrix doc | Recurring |
| OPS.6 | RLS regression suite expansion — every new user-data table gets a cross-tenant test same PR | Recurring |
| OPS.7 | App Store / Play Store policy compliance recheck per release | Recurring |
| OPS.8 | Stripe API version bump cadence | Quarterly |
| OPS.9 | Supabase + Postgres + Nest + Expo SDK pinning + Dependabot cadence | Recurring |

---

## 14. Strategic decisions outstanding (need operator judgment)

| # | ID | Question |
|---|---|---|
| SD.1 | White-label client app — kill or commit? Recommendation: defer to v1.1 + survey founding 800 users |
| SD.2 | AI Butler name — finalize "Roman" or alternative? Trademark + domain check needed |
| SD.3 | App Store ASO keywords + screenshots direction? |
| SD.4 | Trainerize importer vs AI Program Builder — which ships first in Cycle E? |

---

## 15. Far-horizon (post-Cycle-J, do NOT bet runway on these)

FH.1–FH.27 — iPad-native, Apple Watch coach, Garmin Connect IQ, TGP Brain Trust, Coach Awards, TGP Certification, Whisper transcription, AI inbox triage, client recovery score, coach revenue benchmarking, i18n (es/pt/de), Stripe Tax + VAT, coach onboarding cohort, client lifecycle email automation, affiliate program, TGP Editorial, group programs, nutrition coach role, public AI API, TGP Books, TGP Verified badge, SOC2 + HIPAA BAA + ISO 27001, TGP for Teams, hardware partnerships, coach-to-coach marketplace, gym-floor CRM, Founders Program v2.

---

## What changed vs `EXHAUSTIVE_BACKLOG.md` (2026-05-28)

- **Removed (merged or superseded):** A.1–A.12 (PR-A), B.1–B.8 (all 8 RLS PRs merged), D.2 (folded into A.13), most of the May-28 28-finding register (A1/A3/A7/A9/B2/B3/B5/B6/B7/B8/SC-1/SC-2/EFF-2/EFF-3/CC-3/CC-4/HK-2..HK-6).
- **Added:** community v1-4 (in-flight) + BUG-R1..R5 + BUG-S1..S5 + BUG-N1..N2 from Round-3 register.
- **Reclassified:** BL.1 Private Community Hub → largely subsumed by community v1-2..v1-6 chain.

---

**Total remaining work items: ~70 distinct (down from 150).**

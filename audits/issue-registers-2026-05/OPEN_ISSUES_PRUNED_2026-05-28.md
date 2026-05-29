# Backend Open-Issues List — PRUNED (2026-05-28)

This is the **live problems list** after verifying all 38 issues from the three operator-provided registers against `growth-project-backend` @ origin/main (HEAD `d8698b77`). **Issues confirmed FIXED in the current codebase have been removed** so this list contains only what is still a genuine problem.

- Verified: 38 → **Removed (FIXED): 4** → **Still open: 30 full + 2 partial remainders = 32 actionable.**
- Removed as FIXED (do not work these): **PRODUCT-1** (CapabilityMaterializerRegistry + CoachMessageMaterializer shipped, Stream 2), **A2** (CoachAIBudgetService + admin budgets, Stream 1), **A5** (named throttle bucket, commit d8698b77), **B9** (effectively enforced by class-level OwnerGuard — the missing method-level @Roles is stylistic only).
- Source detail: `audits/issue-registers-2026-05/ISSUE_VERIFICATION_RESULTS.md` (full evidence table).

Severity tags: 🔴 security · 💰 money · 📊 data-integrity · 🧹 hygiene/maintainability.

---

## TIER 1 — Highest severity, still open (work these first)

| ID | Sev | Problem (current evidence) |
|---|---|---|
| **A3** | 🔴 | `ai-gateway.service.ts:221-223` passes `conversation_history[i].role` through verbatim — no `user`/`assistant` whitelist. System-role prompt injection reaches every gateway-mediated provider call. |
| **A9** | 🔴 | Same shape one layer up: `ai.controller.ts:26` types history `role: string`; `ai.service.ts:295` coerces non-`assistant` → "User", folding `system` text into the user prompt. |
| **A1** | 🔴 | `POST /ai/chat` body still inline type — no `ChatMessageDto`, no `@MaxLength`, no daily token quota (`UserAIQuota` absent). Only a 20/hr per-IP throttle. Client-surface token-amplification vector. |
| **A7** | 🔴 | `ai.controller.ts:39` returns `model: result.model_used` outside the dev-only debug block — leaks `perplexity`/`anthropic`/`fallback` provider name in prod. |
| **B7** | 🔴💰 | `billing.service.ts:365-373` switch has no `transfer.failed` / `payout.failed` cases — failed coach payouts hit the default "ignoring unhandled" branch and are dedup-swallowed. Coaches think they were paid. |
| **B5** | 💰 | `payment-ops.controller.ts:531-539` `GET /v1/coach/payments/purchases` → `clientPurchase.findMany` with **no `take`**. Unbounded query → OOM / slow-query risk at scale. |
| **EFF-3** | 📊 | `coach-effectiveness.service.ts:207-218` roster filter is `coach_id = coachId` only; sub-coaches always score 0/"developing". No `SubCoachScopeService`. |
| **SC-2** | 📊 | `command-center.service.ts` (lines 159,200,219,324,414,427,453,504,517) scope by `User.coach_id` (= head coach) — sub-coaches see head-coach data, not their assigned roster. `SubCoachScopeService` never imported. |
| **SC-1** | 📊 | `command-center.controller.ts:62` applies `NoActiveSubCoachGuard` at class level — blocks sub-coaches from the ENTIRE Command Center (overview/at-risk/win-streaks/inbox/action-queue), not just financial surfaces. |

---

## TIER 2 — Stripe-write throttles & billing surfaces (money/abuse)

| ID | Sev | Problem (current evidence) |
|---|---|---|
| **B2** | 🔴💰 | Neither portal-session POST has `@Throttle` (`coach-billing.controller.ts:54`, `mobile-coach-billing.controller.ts:88`). |
| **B3** | 🔴💰 | `owner-billing.controller.ts:69-74` `start-subscription` (Stripe createCustomer/createSubscription) — no `@Throttle` on file. |
| **B8** | 🔴💰 | `connect.controller.ts:62-83` `onboarding-link` + `dashboard-link` POSTs — no `@Throttle`; single-use Stripe links can be burned/rate-limited. |
| **B6** | 💰 | `payment-ops.controller.ts:587-601` `GET …/earnings` hard-codes `limit: 200` — no cursor, no `export.csv`. >200 ledger entries silently truncated (summary now computed inline, but pagination/export still missing). |

---

## TIER 3 — Command-Center / metrics data integrity

| ID | Sev | Problem (current evidence) |
|---|---|---|
| **CC-1** | 📊 | `command-center.service.ts:251,255` — `pending_actions: openAlerts` and `open_alerts: openAlerts` are the same variable. Two KPI tiles, identical number. |
| **CC-2** | 📊 | `command-center.service.ts:186-190,249` — `active_today` counts `ClientSignal` rows (PTM recalcs, streak updates), not `CheckIn`. |
| **CC-3** | 📊 | `command-center.service.ts:302-310` — `topFactorLabel()` returns hard-coded generic strings; never reads `PtmPrediction.factors` (logic already proven in `churn-intervention.service.ts`). |
| **CC-4** | 📊 | `command-center.service.ts:425-448` — inbox built from `take: 1000` messages in-memory; threads past position 1000 vanish (but their unread still counts). |
| **CC-5** | 📊 | `command-center.service.ts:242-245` — `check_in_rate_7day` is binary participation (any check-in in 7d / roster), not adherence frequency. 10 clients × 1 check-in shows 100%. |
| **EFF-1** | 📊🧹 | `coach-effectiveness.service.ts:307-326` — 2 sequential `ptmPrediction.findFirst` per client in a loop (N×2 round-trips). N+1 / perf (50-Failures #21). |
| **EFF-2** | 📊 | No `GET /coach/my-effectiveness` route — only owner/admin surface (`admin.controller.ts:302-307`). Coaches can't see their own score. |
| **LTV-1** | 📊💰 | `ltv-metrics.service.ts:197-207` — `estimated_ltv` uses hardcoded 6-month industry stub; displayed as a real dollar figure. |
| **LTV-2** | 📊 | `ltv-metrics.service.ts:262-271` — `net_revenue_retention_pct` is gross logo retention (1 − churn), mislabeled as NRR; can't exceed 100%. |
| **LTV-3** | 📊 | `ltv-metrics.service.ts:279-294` — `zero_churn_streak` / `all_time_peak_rpcm` recomputed-not-persisted (no `coach_ltv_peak` table); regress month-over-month. |

---

## TIER 4 — Sub-coach experience & engagement

| ID | Sev | Problem (current evidence) |
|---|---|---|
| **SC-3** | 📊 | `sub-coach-analytics.service.ts:52-60` — engagement Signal 1 (+20/100, highest weight) = "sent ≥1 message in 7d" proxy; rewards superficial activity, punishes conscientious review. |
| **SC-4** | 📊 | `sub-coach-reassign.service.ts` — zero notifications on assign/reassign (grep notif/push/message/sendAsCoach = 0). Client/coaches get silent handoffs. |

---

## TIER 5 — API hygiene & defence-in-depth (lower urgency, but real)

| ID | Sev | Problem (current evidence) |
|---|---|---|
| **A4** | 🧹 | `coach-brief.controller.ts:74-85` + `coach-brief.dto.ts:26-48` — brief history uses `page`+`limit` offset pagination (skip-on-insert bug). No cursor. |
| **A8** | 🔴🧹 | `ai.controller.ts:53-65` — `GET /ai/context` + `/ai/structured-context` (heavy multi-join) have no `@Throttle` and no cache. |
| **1** | 🧹 | `payment-ops.controller.ts` — 0 `@ApiOperation` across 35 handlers; no `swagger-coverage` CI test. |
| **8** | 🧹 | `admin.controller.ts` — 0 `@ApiOperation` across 27 handlers (incl. GDPR scrub / user promote). |
| **2** | 🧹 | `admin.controller.ts:65-86` — `listCoaches`/`listUsers` have no cursor/offset pagination. |
| **6** | 🧹 | `admin.controller.ts:58,79-84` — query params parsed via raw `parseInt`, not validated DTOs. |
| **3** | 🧹 | `real-meal-plans.controller.ts:36-125` — guard stack repeated per-handler ×12 instead of class-level (silent-gap trap on 13th route). |
| **5** | 🔴🧹 | `coach-messaging.controller.ts:31-32` — class guards present but NO `@Roles('coach')` defence-in-depth; `roles-enforced.spec.ts` allowlist not cleaned. |
| **7** | 🔴🧹 | `storefront-public.controller.ts:119-120` — `GET /join/:token` throttled by IP only (60/min), not `(token,IP)` composite (the POST already is). Token enumeration vector. |
| **B1** | 🧹 | Portal-session logic duplicated across `coach-billing.controller.ts:54` and `mobile-coach-billing.controller.ts:88` (drift risk). |
| **4** | 🧹 | `users.controller.ts:81-90` — dead `GET /me/badges` still throws `GoneException`; PR #311 (remove-dead-410-badges) never landed. |

---

## PARTIAL — remainder only (the rest is already done)

| ID | Done | Still open |
|---|---|---|
| **PRODUCT-2** | `generated_at` surfaced in brief responses ✅; cost protection via `DormancyGuardService` + global `CoachAIBudgetService` ✅ | No `reconcileNarrativeNumbers` (numeric-hallucination guard) — narrative can still state fabricated dollar/client figures that pass structural validation. |
| **B4** | Global `ValidationPipe({ whitelist, forbidNonWhitelisted })` enabled in `main.ts:116-118` ✅ | `start-subscription` body still an inline `{ plan?; trialDays? }` type, not a `StartSubscriptionDto` — `plan` has no runtime `@IsIn` validation. |

---

*Generated 2026-05-28 from ISSUE_VERIFICATION_RESULTS.md. The three full source registers live alongside this file. FIXED items intentionally excluded.*

# Backend Issue-Register Verification Results

Read-only verification against `growth-project-backend` @ `origin/main`
(HEAD `d8698b77`, branch `main`, 2026-05-29). Status legend: OPEN / FIXED /
PARTIAL / MOVED-STALE / CANT_VERIFY.

## Deep Issue Register

| ID | Status | Evidence file:line | Note |
|---|---|---|---|
| A1 | OPEN | `src/ai/ai.controller.ts:19-32` | `@Body() body: { message: string; conversation_history?: ... }` — still inline type, no `ChatMessageDto`, no `@MaxLength`. No `UserAIQuota` model anywhere (`grep ChatMessageDto/UserAIQuota` returns 0). Only per-IP throttle 20/hr at L20. |
| PRODUCT-1 | FIXED | `src/ai/gateway/ai-approval.service.ts:120-145` + `src/ai/gateway/materialisers/coach-message.materialiser.ts` | `CapabilityMaterializerRegistry` injected; `decide()` runs `materialiser.materialize(draft)` BEFORE flipping status; `CoachMessageMaterializer` calls `MessagingService.sendAsCoach` with row-level claim + STUCK-CLAIM recovery. Five materialisers exist: coach-message, assign-meal-plan, assign-workout, send-notification, registry. |
| PRODUCT-2 | PARTIAL | `src/ai/coach/weekly-insight.cron.ts:31-74`, `src/coach/brief/coach-brief.service.ts:1983` | `generated_at` IS surfaced in brief responses (FIXED). No `reconcileNarrativeNumbers` exists (grep returns 0). Weekly-insight cron has NO local `WEEKLY_INSIGHT_BUDGET_CENTS`; cost protection delegated to `DormancyGuardService` (skip 3+ unread) + global `CoachAIBudgetService` per-call gate — different mechanism than asked. |
| A2 | FIXED | `src/ai-credits/coach-ai-budget.service.ts:73-`, `src/ai-credits/ai-credits.module.ts:32`, `src/ai-credits/admin-coach-ai.controller.ts:28` | `CoachAIBudgetService` owns `CoachAIBudget` table, `canCharge` pre-call + `recordUsage` post-call wired through `AiGatewayService` (`@Optional() private budget?`). Admin owner endpoint exposes paginated budgets. |
| B6 | OPEN | `src/checkout/payment-ops.controller.ts:587-601` | `GET /v1/coach/payments/earnings` still hard-codes `{ limit: 200 }`, returns `{ summary, entries }` in one shot. No cursor, no `export.csv` route. Summary IS computed inline (mini-improvement) but pagination/export unchanged. |

## Complete Issue Register (27)

| ID | Status | Evidence file:line | Note |
|---|---|---|---|
| 1 | OPEN | `src/checkout/payment-ops.controller.ts` | `grep -c @ApiOperation` = 0 across 35 route handlers. No `swagger-coverage` test file found. |
| 8 | OPEN | `src/admin/admin.controller.ts` | `grep -c @ApiOperation` = 0 across 27 route handlers. |
| 2 | OPEN | `src/admin/admin.controller.ts:65-86` | `listCoaches()` takes no args; `listUsers` accepts `?limit` parsed as raw int — no cursor/offset DTO. |
| 3 | OPEN | `src/real-meal-plans/real-meal-plans.controller.ts:36-125` | `@UseGuards(JwtAuthGuard, CoachGuard, SubscriptionGuard)` repeated 12× per handler; class declared `@Controller()` without class-level guards. |
| 4 | OPEN | `src/users/users.controller.ts:81-90` | `@Get('me/badges')` still throws `GoneException` with `// REMOVED (doctrine cleanup)` comment. PR #311 didn't land. |
| 5 | OPEN | `src/messaging/coach-messaging.controller.ts:31-32` | Class-level `@UseGuards(JwtAuthGuard, CoachGuard)` but NO `@Roles('coach')`. `roles-enforced.spec.ts` not updated. |
| 6 | OPEN | `src/admin/admin.controller.ts:58,79-84` | Raw `parseInt(sinceDaysRaw, 10)` / `parseInt(limit, 10)` for query params — no DTO. |
| 7 | OPEN | `src/storefront/storefront-public.controller.ts:119-120` | `@Throttle({ default: { ttl: 60000, limit: 60 } })` on `GET /join/:token` — default IP-keyed bucket, no (token,IP) composite. |
| B1 | OPEN | `src/billing/coach-billing.controller.ts:54`, `src/billing/mobile-coach-billing.controller.ts:88` | Two separate `@Post('portal-session')` handlers — comments explicitly note "same code path"; not yet deduplicated. |
| B2 | OPEN | `src/billing/coach-billing.controller.ts:54`, `mobile-coach-billing.controller.ts:88` | Neither portal-session POST has `@Throttle`. |
| B3 | OPEN | `src/billing/owner-billing.controller.ts:69-74` | `@Post('coaches/:id/start-subscription')` — no `@Throttle` decorator anywhere on file. |
| B4 | PARTIAL | `src/billing/owner-billing.controller.ts:73`, `src/main.ts:116-118` | Body still inline `{ plan?: 'flat_300'; trialDays?: number }` (OPEN half). BUT `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` IS enabled globally (FIXED half). |
| B5 | OPEN | `src/checkout/payment-ops.controller.ts:531-539` | `@Get('purchases')` coach-self lists via `prisma.clientPurchase.findMany({ where: { coach_user_id: req.user.id }, orderBy: ... })` — no `take`. |
| B7 | OPEN | `src/billing/billing.service.ts:365-373` | Cases handled: subscription, invoice, customer, checkout, payment_intent, charge, account. Default branch logs "Ignoring unhandled". `transfer.failed` / `payout.failed` not in switch. |
| B8 | OPEN | `src/connect/connect.controller.ts:62-83` | `@Post('onboarding-link')` and `@Post('dashboard-link')` — no `@Throttle`. |
| B9 | FIXED (effective) | `src/billing/owner-billing.controller.ts:51` | Class-level `@UseGuards(JwtAuthGuard, OwnerGuard)`. `start-subscription` lacks method-level `@Roles('owner')` but OwnerGuard at class scope enforces it. Asymmetry with method-level `@Roles('owner')` on `cancel-subscription` (L270) is stylistic only. |
| A3 | OPEN | `src/ai/gateway/ai-gateway.service.ts:221-223` | `redactedHistory = (req.conversationHistory ?? []).map((t) => ({ role: t.role, content: ... }))` — `role` passed through unchecked, no whitelist of `user`/`assistant`. System-role injection still possible. |
| A4 | OPEN | `src/coach/brief/coach-brief.controller.ts:74-85`, `src/coach/brief/coach-brief.dto.ts:26-48` | `BriefHistoryQueryDto` uses `page` + `limit` (offset). No cursor. |
| A5 | FIXED | `src/ai/coach/coach-ai.controller.ts:69,82,95` | All three generation routes use `@Throttle({ [THROTTLER_NAMES.COACH_AI_GENERATION]: { ttl: 3600000, limit: ... } })`. Named bucket. (Confirms recent commit `d8698b77 chore(ai): isolate coach-ai generation throttle into named bucket`.) |
| A7 | OPEN | `src/ai/ai.controller.ts:36-50` | Response always returns `model: result.model_used` outside the dev-only `debug` block — `model` leaks `perplexity`/`anthropic`/`fallback` provider name in prod. |
| A8 | OPEN | `src/ai/ai.controller.ts:53-65` | `@Get('context')` and `@Get('structured-context')` — no `@Throttle`. Class has no `@Throttle` either. |
| A9 | OPEN | `src/ai/ai.controller.ts:26`, `src/ai/ai.service.ts:277` | `conversation_history?: Array<{ role: string; content: string }>` — `role` accepts any string. `ai.service.ts:295` maps `'assistant' ? 'Assistant' : 'User'` — non-assistant silently coerced to "User", `system` text gets folded into user prompt. |

## Coach Data Accuracy & Sub-Coach

| ID | Status | Evidence file:line | Note |
|---|---|---|---|
| SC-1 | OPEN | `src/coach/command-center/command-center.controller.ts:62` | `@UseGuards(JwtAuthGuard, CoachGuard, NoActiveSubCoachGuard)` at class level — applies to entire CommandCenter, blocks sub-coaches uniformly. |
| SC-2 | OPEN | `src/coach/command-center/command-center.service.ts:159,200,219,324,414,427,453,504,517` | All reads filter `where: { coach_id: coachId, ... }`. No import or use of `SubCoachScopeService`. |
| SC-3 | OPEN | `src/sub-coach/sub-coach-analytics.service.ts:52-60` | Signal 1 = `recentMessage = coachMessage.findFirst(... sender_id: subCoachId, last 7d)` then `loggedInWithin7d = recentMessage != null ? 20 : 0`. Still "sent ≥1 message" proxy. |
| SC-4 | OPEN | `src/sub-coach/sub-coach-reassign.service.ts` | `grep -n notif/push/message/sendAsCoach/Notification` returns 0. No notifications emitted on reassignment. |
| CC-1 | OPEN | `src/coach/command-center/command-center.service.ts:251,255` | `open_alerts: openAlerts` and `pending_actions: openAlerts` — same value. |
| CC-2 | OPEN | `src/coach/command-center/command-center.service.ts:186-190,249` | `activeTodayGroups = prisma.clientSignal.groupBy(...)` then `active_today: activeTodayGroups.length`. Not `CheckIn`. |
| CC-3 | OPEN | `src/coach/command-center/command-center.service.ts:302-310` | `topFactorLabel()` returns hard-coded strings ("No app activity in N days", "High churn risk — multiple signals fired", "Declining engagement signals"). Never reads `PtmPrediction.factors`. |
| CC-4 | OPEN | `src/coach/command-center/command-center.service.ts:425-448` | `coachMessage.findMany({ ... take: 1000, ... })` then thread state built via in-memory `Map` reduce. |
| CC-5 | OPEN | `src/coach/command-center/command-center.service.ts:242-245` | `checkInRate = checkInsLast7dGroups.length / rosterSize` — binary participation ratio (any check-in in 7d). Not weekly adherence frequency. |
| EFF-1 | OPEN | `src/coach/coach-effectiveness.service.ts:307-326` | `for (const client of eligible) { ptmPrediction.findFirst(...earliest...); ptmPrediction.findFirst(...latest...); }` — two sequential queries per client inside the loop. |
| EFF-2 | OPEN | `src/admin/admin.controller.ts:302-307` + grep | Only admin endpoints exist (`admin/coach-effectiveness`). No `GET /coach/my-effectiveness` route found. |
| EFF-3 | OPEN | `src/coach/coach-effectiveness.service.ts:207-218` | Roster filter `where: { coach_id: coachId, role: 'student', deleted_at: null }`. No sub-coach awareness anywhere (`grep sub_coach/subCoach` = 0 hits in file). Sub-coaches' clients (whose `coach_id` points to head) → service returns empty/0. |
| LTV-1 | OPEN | `src/coach/command-center/ltv-metrics.service.ts:197-207` | `// TODO: Replace 6-month stub once ≥3 cancellation data points exist. avgLifespanMonths = 6;` — still the documented stub. |
| LTV-2 | OPEN | `src/coach/command-center/ltv-metrics.service.ts:262-271` | `// STUB: gross_logo_retention approximation (1 - churn_rate). True NRR requires expansion/contraction MRR data not yet available.` |
| LTV-3 | OPEN | `src/coach/command-center/ltv-metrics.service.ts:279-294` | `// TODO: Persist this streak in a coach_ltv_peak table...` (zero-churn). `// TODO: Persist all-time peak in coach_ltv_peak table.` Still recomputed from history each call. |

## Summary

**Counts (38 issues verified):**
- OPEN: **30**
- FIXED: **4** (PRODUCT-1, A2, A5, B9-effective)
- PARTIAL: **3** (PRODUCT-2, B4)
- MOVED-STALE: **0**
- CANT_VERIFY: **0**

(Three FIXED + one PARTIAL line up directly with the three recent merged
streams visible in `git log`: Stream-2 approval materialisers, Stream-1
AI credits/budget, and the named-throttle bucket.)

## Highest-severity STILL-OPEN shortlist

**Security**
- **A3** — `ai-gateway.service.ts:221-223` passes `conversation_history[i].role` through verbatim; permits `system`-role injection into provider input. Touches every gateway-mediated call.
- **A9** — same shape one layer up at `ai.controller.ts:26` / `ai.service.ts`; user-controllable history role.
- **A1** — `POST /ai/chat` body unvalidated (no DTO, no `@MaxLength`); only 20/hr IP throttle. A long-prompt abuse vector still open even with the new `CoachAIBudgetService`, since `/ai/chat` is the *client* surface, not coach.
- **A7** — Provider name (`perplexity` / `anthropic` / `fallback`) leaked in prod via `model:` field at `ai.controller.ts:39`. Cheap fingerprinting / per-provider attack tailoring.
- **B7** — `transfer.failed` / `payout.failed` Stripe events silently logged as "ignored" (`billing.service.ts:372`). Failed payouts to coaches go undetected by the platform.
- **B2/B3/B8** — Stripe-write POSTs (`portal-session`, `start-subscription`, `onboarding-link`, `dashboard-link`) have no `@Throttle` — repeated abuse can rack up Stripe API spend / hit Stripe rate limits.

**Data integrity**
- **CC-1** — `pending_actions == open_alerts` in command-center summary; the two distinct UI counters are wired to the same value. Coaches see misleading dashboards.
- **CC-2** — `active_today` counts `ClientSignal` rows, not `CheckIn`. Reports "active" for any background-signal write.
- **CC-5** — `check_in_rate_7day` is binary participation, not adherence rate; misrepresents weekly engagement quality.
- **EFF-3** — `CoachEffectivenessService` returns 0 for sub-coaches because the roster filter only matches direct `coach_id`. Sub-coach performance reviews are statistically meaningless under the current implementation.
- **SC-2** — CommandCenter scopes by `User.coach_id` (head coach). Sub-coaches viewing the CommandCenter see head-coach data, not their own roster.

**Money**
- **B5** — `GET /v1/coach/payments/purchases` `findMany` with no `take`. A coach with 100k+ purchases pulls the whole table into one response; OOM risk and slow-query risk on the prod DB.
- **B6** — `GET /v1/coach/payments/earnings` hard-limit 200 entries with no pagination or CSV export. Coaches with >200 ledger entries cannot reconcile their lifetime earnings; silently truncated.
- **LTV-1/LTV-3** — `estimated_ltv` uses an industry-stub 6-month lifespan; `zero_churn_streak` and `all_time_peak_rpcm` are recomputed-not-persisted, can regress month-over-month even when reality didn't. Drives onboarding / pricing copy that is presented as data-backed but isn't.

Highest-priority triage (my read): **A3 / A9** (prompt-role injection), **B7**
(missed Stripe payout failures), **EFF-3 + SC-2** (sub-coach data wrongness),
**B5** (unbounded purchase query) — these are the items where the surface
visible to operators or end-users is materially wrong/abusable today.

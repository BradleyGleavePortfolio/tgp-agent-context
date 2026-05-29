Growth Project Backend — Deep Issue Register
All findings are derived from direct inspection of source files in BradleyGleavePortfolio/growth-project-backend. File paths and line numbers are cited throughout.

Section 1 — AI Rate-Limiting Architecture
Issue A1 — The AI Chat Endpoint Has No Per-Message or Per-Day Protections
The Problem
src/ai/ai.controller.ts:19–32 exposes POST /ai/chat behind a single throttle: 20 requests per hour per user via @Throttle({ default: { ttl: 3600000, limit: 20 } }). The body.message field is typed as a bare TypeScript string with no length, character, or token constraints. It flows directly to this.aiService.chat(req.user.id, body.message, body.conversation_history || []) at line 31 — no trimming, no length check, no sanitisation.
Inside src/ai/ai.service.ts:276–287, userMessage is concatenated into the provider request verbatim: when the Anthropic fallback is active the final user turn is ${historyText}\nUser: ${userMessage}, where historyText is the last 10 turns of conversationHistory with no per-turn length cap. A user can send a 100 KB message body on each of their 20 hourly slots — that is potentially 2 MB of raw text dispatched to the LLM per hour from a single account, consuming the full available maxTokens: 600 output budget on every call regardless of whether the input was a one-word question or a full novel.
There is no daily quota anywhere. The 20/hr throttle resets every rolling hour, meaning a determined user can send 480 requests per day with no additional check. There is no AICallLog equivalent for the student /ai/chat surface (that table exists for the coach AI engine at coach-ai.service.ts:366–378 only). You have no visibility into how much the student chat surface actually costs per user per day, and no mechanism to stop a single user from generating a disproportionate share of that spend.
The Correct Solution
Implement a two-layer enforcement model:
Layer 1 — Request-level size gate. Create a ChatMessageDto class-validator DTO:
export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  conversation_history?: Array<ConversationTurnDto>;
}

export class ConversationTurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(2000)
  content: string;
}

Replace the inline body type at ai.controller.ts:24–27 with @Body() body: ChatMessageDto. This is enforced by the global ValidationPipe at the NestJS pipeline level before any service code runs — no LLM call is possible from an oversized payload.
Layer 2 — Daily token budget per user. Add a UserAIQuota table:
CREATE TABLE user_ai_quota (
  user_id       UUID    PRIMARY KEY REFERENCES "User"(id),
  date          DATE    NOT NULL,
  requests_used INT     NOT NULL DEFAULT 0,
  tokens_in     INT     NOT NULL DEFAULT 0,
  tokens_out    INT     NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

Before dispatching to any LLM adapter in ai.service.ts, call a checkAndIncrementQuota(userId) method that:
Reads the row for (userId, today) — atomic upsert
Throws 429 DAILY_QUOTA_EXCEEDED if requests_used >= 50 or tokens_in >= 40_000
Increments the counters inside the same DB transaction as the LLM call record
This gives you per-user daily observability, a hard cost ceiling, and the infrastructure to expose per-user AI usage in a future "What does TGP know about me?" disclosure screen.

Section 2 — The "AI Can Suggest But Cannot Act" Gap
Issue PRODUCT-1 — draft.coach_message Is a Dead Capability: The Approval Loop Terminates With a Status Flip, Not a Message Send
The Problem
The ai-gateway.config.ts defines DEFAULT_APPROVAL_REQUIRED  — the set of capabilities that require a human to approve before any action fires downstream. One of the four members is draft.coach_message. The comment at line 74–76 makes the design intent explicit: "Capabilities that consequential outputs must hit before any downstream mutation (sending a coach message, applying a meal-plan change, etc)."
The AI is architected to suggest coach messages. The coach can see the suggestion, approve it, and the system is supposed to send it. But tracing the execution path from approval to message delivery reveals a critical missing link.
src/ai/gateway/ai-approval.service.ts:61–128 is the only place draft decisions are processed. When a coach calls PATCH /ai/gateway/drafts/:id with { decision: 'approved' }, the decide() method:
Updates AiActionDraft.status = 'approved'
Mirrors the status to AiRequestAudit.approval_status
Writes an AuditLog entry with action: 'ai.draft_approved'
Returns the updated draft row
That is the entire post-approval execution. There is no call to MessagingService.sendAsCoach(). There is no event emitted. There is no webhook triggered. The AiApprovalService has no reference to MessagingService in its constructor.
Comparing this to the coach-ai approval path (src/ai/coach/coach-ai.service.ts:253–347), which does materialize downstream rows (calling materializeWorkoutProgram() and materializeMealPlan()) — the draft.coach_message capability has no equivalent materialisation handler. The capability exists in the config. The approval workflow exists. The MessagingService.sendAsCoach() method exists at src/messaging/messaging.service.ts. The wire between them was never built.
The consequence is the most damaging kind of product gap: one that is invisible to the coach. The AI surface can confidently surface "Want me to message Sarah to prevent her from churning?" as a suggested action. The coach approves it. The draft flips to approved. Nothing happens. Sarah never receives the message. The coach assumes TGP sent it. No error is thrown. No notification fires.
The Correct Solution
This is not a hotfix — it requires a deliberate capability materialisation architecture:
Step 1 — Define a capability materialisation registry. Create src/ai/gateway/capability-materializer.ts:
export interface CapabilityMaterializer {
  canHandle(capability: string): boolean;
  materialize(draft: AiActionDraft): Promise<MaterializeResult>;
}

Step 2 — Implement CoachMessageMaterializer. Inject MessagingService and implement:
async materialize(draft: AiActionDraft): Promise<MaterializeResult> {
  const payload = draft.payload as { clientId: string; body: string };
  // Validate payload shape before sending
  if (!payload?.clientId || !payload?.body) {
    throw new Error('draft.coach_message payload missing clientId or body');
  }
  // coachId is the tenant_coach_id — the coach who approved owns the send
  await this.messaging.sendAsCoach(draft.tenant_coach_id, payload.clientId, {
    body: payload.body,
  });
  return { materializedType: 'message', ref: draft.id };
}

Step 3 — Wire into AiApprovalService.decide(). After the status flip at line 94, add:
if (input.decision === 'approved') {
  const materializer = this.materializerRegistry.resolve(draft.capability);
  if (materializer) {
    await materializer.materialize(draft);
  }
}

Step 4 — Notify the coach. After materialisation, push a real-time notification via MessageReceivedEmitter so the coach's console shows "TGP sent your approved message to Sarah." This closes the feedback loop that is currently invisible.
Step 5 — Guard the payload schema. The proposed_action body on POST /ai/gateway/invoke is typed as Record<string, unknown>. Before any draft.coach_message draft is created, validate the payload against a CoachMessageActionSchema (Zod or class-validator) to guarantee clientId and body are present and correctly typed. A draft with a malformed payload that gets approved and fails to materialise is worse than a rejected draft.

Section 3 — Autonomous AI Prompts: Quality and Haywire Risk
Issue PRODUCT-2 — The Coach Daily Brief Is Well-Structured But Has Systemic Failure Modes That Are Not Covered by Its Validation Contract
What the System Actually Does
src/coach/brief/coach-brief.service.ts generates a daily narrative paragraph for each coach using Claude claude-3-5-sonnet-20241022 with BRIEF_MAX_TOKENS = 300 and BRIEF_TEMPERATURE = 0.6. The system prompt is injected via buildSoloCoachSystemPrompt() and buildHeadCoachSystemPrompt(), both of which are tightly specified: 3–5 sentences, first-person plural TGP voice ("we", "we've", "we're"), coach's first name in the opener, no markdown, no meta prefixes, ends with a handoff to action items. The user/data prompt (buildBriefPrompt) is a structured block of named numeric fields — check-in counts, payment totals, dunning counts — not free text. All user-controlled string fields (coach names, sub-coach names) pass through sanitizePromptIdentifier() before interpolation, stripping control characters, collapsing whitespace, and capping at 80 characters.
Output is validated by validateClaudeNarrative()  which checks: not empty, ≤600 characters, no meta prefix, no markdown artifacts, 3–5 sentences, coach first name appears in sentences 1 or 2, and at least one first-person plural marker. If the output fails any check, the system falls back to buildFallbackNarrative() — a fully deterministic template-rendered paragraph that never touches the LLM.
This is among the better-structured autonomous AI implementations in the codebase. The failure modes are subtler than "prompt goes haywire."
Failure Mode 1 — The Validation Contract Checks Voice But Not Accuracy
validateClaudeNarrative() confirms that the output sounds like TGP but does not verify that the numbers in the narrative match the numbers in the context. If Claude writes "we've collected $1,200 today" when revenue_today_cents = 0, the validation passes because it checks structure, not content. The data-context is injected as structured text fields, but Claude is free to hallucinate numbers, invent client-count sentences, or reference events not in the prompt. A coach reading a brief with fabricated numbers will make wrong decisions — "I thought TGP said I had two failed payments but there's only one" erodes trust faster than a fallback narrative would.
Failure Mode 2 — The Weekly Insight Cron Has No Per-Coach or Global Rate Limit
src/ai/coach/weekly-insight.cron.ts:36–51 runs every week and calls generateClientInsight(coachId, { clientId }) for every active client of every active coach in a nested loop with no concurrency control and no spend cap. A coach with 50 clients generates 50 sequential Anthropic calls on one cron tick. Two coaches with 50 clients each = 100 calls. If the cron fires and CRON_COACH_AI_INSIGHT=on, and the coach count has grown, this is an uncapped Anthropic burst with no circuit breaker. The per-request costCents is recorded, but there is no check before or during the run that asks "how much have we spent so far this run?"
Failure Mode 3 — The Fallback Narrative Leaks Fabricated Data in a Different Way
buildFallbackNarrative() is template-based and never calls the LLM. But it interpolates live context data into English sentences: "We've collected $${(ctx.revenue_today_cents / 100).toFixed(0)} across ${ctx.paid_today_count} payment(s) today." These numbers are correct at generation time but the brief is cached for the rest of the day. If a payment comes in at 2pm and the brief was generated at 7am, the fallback narrative is silently stale. The LLM path has the same problem but is less obviously wrong because the prose is smoother. Neither path includes a generated_at timestamp visible to the coach.
The Correct Solution
For Failure Mode 1 — Add a data-fidelity check post-generation. After calling Claude and before accepting the output, run a numeric reconciliation pass:
function reconcileNarrativeNumbers(
  narrative: string,
  ctx: BriefContext,
): string | null {
  // If context says $0 revenue today, the narrative must not contain a dollar figure > 0
  if (ctx.revenue_today_cents === 0 && /\$[1-9][0-9]*/.test(narrative)) {
    return 'fabricated_revenue';
  }
  // If roster_size is e.g. 12, narrative must not reference a number > 20 as a client count
  // (Claude sometimes rounds up or invents round numbers)
  return null;
}

This is not a complete semantic check — that would require another LLM call — but it catches the highest-value fabrication class (money numbers) at near-zero cost.
For Failure Mode 2 — Add a global spend gate to the weekly cron. Before the outer loop in weekly-insight.cron.ts, add:
const weeklyBudgetCents = parseInt(process.env.WEEKLY_INSIGHT_BUDGET_CENTS ?? '500', 10);
let spentCents = 0;

for (const coachId of coachIds) {
  const clientIds = await this.svc.listActiveClientsForCoach(coachId);
  for (const clientId of clientIds) {
    if (spentCents >= weeklyBudgetCents) {
      this.logger.warn(`weekly insight cron hit budget cap at ${spentCents} cents`);
      return;
    }
    const result = await this.svc.generateClientInsight(coachId, { clientId, windowDays: 7 });
    spentCents += result.costCents ?? 0;
  }
}

This ensures a runaway cron on a large coach list cannot spend more than a configurable ceiling. Add WEEKLY_INSIGHT_BUDGET_CENTS to Fly secrets documentation.
For Failure Mode 3 — Surface a generated_at timestamp in the response. The CoachBriefResponse type already has a generated_at field from the DB row. The mobile client should render "Brief as of 7:02 AM" so coaches know when it was last generated and can tap regenerate if needed. The existing POST /coach/brief/regenerate endpoint supports this (3/hr throttle) but the mobile client needs to surface generated_at as a UI affordance to prompt the coach to refresh rather than trusting stale numbers.

Section 4 — AI Spend Display Architecture (CoachAIBudget)
Issue A2-Extended — Per-Coach AI Budget Should Be Perceived as Value, Not a Limit
Design Principle
The costCents field is recorded on every AIDraft row via AnthropicAdapter.computeCostCents() using the public Anthropic price card ($3.00/MTok input, $15.00/MTok output). This is your raw infrastructure cost. The coach should never see this number. What they should see is what the feature would cost them if they were paying retail for it — which, per the product design intent, is 5× the infrastructure cost.
This is not dishonest: it is value pricing. The coach is getting AI-generated workout programs, meal plans, and client insights that would cost a human PT assistant's hourly rate to produce. Showing them "You've used $47.50 of your $250 monthly AI allowance" (where $47.50 = 5 × $9.50 actual cost) anchors them to value, not to compute spend.
The Correct Implementation
Schema:
CREATE TABLE coach_ai_budget (
  coach_id              UUID        PRIMARY KEY REFERENCES "User"(id),
  billing_period_start  DATE        NOT NULL,
  billing_period_end    DATE        NOT NULL,
  included_value_cents  INT         NOT NULL DEFAULT 25000,  -- $250.00 displayed allowance
  used_cost_cents       INT         NOT NULL DEFAULT 0,      -- raw infra cost accumulated
  VALUE_MULTIPLIER      NUMERIC     NOT NULL DEFAULT 5.0,    -- display = used_cost × multiplier
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

Display value formula: displayed_used = used_cost_cents × VALUE_MULTIPLIER
When a draft is created in coach-ai.service.ts:persistDraft(), upsert the budget row:
await tx.coachAIBudget.upsert({
  where: { coach_id: coachId },
  update: { used_cost_cents: { increment: costCents } },
  create: {
    coach_id: coachId,
    billing_period_start: startOfMonth,
    billing_period_end: endOfMonth,
    used_cost_cents: costCents,
  },
});

Endpoint: Add GET /coach/ai/budget that returns:
{
  "allowance_cents": 25000,
  "used_display_cents": 1250,
  "remaining_display_cents": 23750,
  "pct_used": 5.0,
  "period_end": "2026-06-30",
  "reset_days": 34
}

where used_display_cents = used_cost_cents × 5. The mobile UI renders this as a progress bar: "You've used $12.50 of your $250.00 monthly AI allowance." The coach sees generous, substantive value. You see actual infrastructure cost internally. The 5× multiplier is a config value in the CoachAIBudget table, not a hardcoded constant, so it can be adjusted per tier or per promotion.
Hard cap enforcement: When used_cost_cents × 5 >= included_value_cents (i.e., the displayed usage hits the displayed allowance), throw 402 AI_BUDGET_EXHAUSTED from checkCoachAIBudget(). This is the product-correct behaviour: "You've used your monthly AI allowance. Upgrade for more." It also means your infrastructure cost is capped at included_value_cents / VALUE_MULTIPLIER / 100 dollars per coach per month — at current settings, that is a maximum of $50 actual Anthropic spend per coach per billing period.

Section 5 — Billing: Earnings Pagination
Issue B6 — GET /v1/coach/payments/earnings Silently Truncates and Has No Export Path
The Problem
src/checkout/payment-ops.controller.ts:524–537 calls this.ledger.findByPayee(req.user.id, { limit: 200 }) and returns all entries in a single response with an in-memory reduce rollup. There is no has_more field, no next_cursor, and no indication to the caller that the response may be incomplete. A coach with >200 split ledger entries receives a response that looks complete but is not. The summary totals (posted, pending, reversed) computed from the truncated 200 rows are arithmetically incorrect for any coach above that threshold.
The Correct Solution — Paginated Export
Replace the single endpoint with two:
1. GET /v1/coach/payments/earnings/summary — returns the aggregate totals only, computed from the full ledger (no row limit, no pagination, just a GROUP BY aggregate query):
const summary = await this.prisma.splitLedgerEntry.groupBy({
  by: ['status'],
  where: { payee_user_id: req.user.id },
  _sum: { amount_cents: true, reversed_cents: true },
});

This is always accurate regardless of row count, and is fast because it's a single aggregation query.
2. GET /v1/coach/payments/earnings/entries?cursor=<id>&limit=50 — returns paginated ledger entries, keyset-paginated on id descending:
return this.prisma.splitLedgerEntry.findMany({
  where: {
    payee_user_id: req.user.id,
    ...(cursor ? { id: { lt: cursor } } : {}),
  },
  orderBy: { id: 'desc' },
  take: limit + 1, // fetch one extra to determine has_more
});

Response shape includes { entries, next_cursor, has_more }. The mobile UI renders the summary totals from endpoint 1 at the top of the earnings screen (always correct) and lazy-loads entries from endpoint 2 on scroll. Coaches who want a full export can add a GET /v1/coach/payments/earnings/export.csv endpoint that streams all rows as CSV — this is the only appropriate place to do a full table scan, and it should be rate-limited to 1/day.
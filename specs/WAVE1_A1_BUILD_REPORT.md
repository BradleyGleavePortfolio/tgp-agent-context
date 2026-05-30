# WAVE-1 A1 — Build Report: per-user daily AI token quota (UserAIQuota)

**Builder:** Dynasia G (Opus 4.8). **Branch:** `issues/a1-ai-daily-token-quota` → PR **#333** to `main`.
**Repo:** `growth-project-backend`. **Base:** `origin/main` @ `9c191be`.
**Final SHA:** `978e0746e836864a4e2da42d4153d789f8e8b7e2`

## Issue
`POST /ai/chat` had only a 20/hr per-user `@Throttle` and **no daily token quota** — a client-surface token-amplification vector. The `UserAIQuota` table exists from Wave-0; the DTO already had `@MaxLength`. A1's remaining work was to enforce a per-user **daily** token budget against `UserAIQuota`.

## Scope
Edited **only** within `src/ai/` (+ AI test files). No `prisma/schema.prisma` change, **no migrations** (table already exists). No `src/coach/**` or other modules touched.

- `src/ai/ai.service.ts` — quota constants + reserve/reconcile enforcement in `chat()` + helper methods.
- `src/ai/ai.dto.ts` — corrected a stale comment claiming quota persistence was deferred.
- `test/ai.service.spec.ts` — 4 new quota tests + in-memory `UserAIQuota` ledger stub.
- `test/ai/ai-gateway-hardening.spec.ts`, `test/analytics-instrumentation.spec.ts` — added permissive prisma stubs to the existing `new AiService(...)` constructions so the AI specs stay green (these construct `AiService` and `chat()` now touches `prisma.userAIQuota`).

## Quota design

### Constant value & rationale
```
MAX_TOKENS_PER_CALL = 600          // matches the per-turn max_tokens for both providers
DAILY_TOKEN_QUOTA   = 20 * 600     // = 12000 tokens/day
AI_DAILY_QUOTA_EXCEEDED            // machine code on the 429
```
The model call is bounded to `max_tokens = 600` per turn. We set the daily budget to **20 full-budget calls/day** — equivalent to one hour's worth of the existing 20/hr burst throttle, spread across the day. This is generous for a legitimate client but caps an attacker who slow-drips requests under the hourly throttle. `20 * 600 = 12000`.

### Reserve vs reconcile — **reserve-then-reconcile** (chosen)
- **Reserve** `MAX_TOKENS_PER_CALL` (600) up front, **before** building context or calling any model.
- **Reconcile** after the call: if the provider reports usage (`response.usage.total_tokens` for Perplexity; `tokensIn + tokensOut` for Anthropic), adjust `tokens_used` by `actual - reserved` — refunding the unused delta (or charging extra if the call ran hot).
- **Why reserve, not charge-actual-only:** for amplification safety, concurrent in-flight requests are each charged the full worst-case 600 before they run, so they cannot collectively race past the cap while their model calls are pending. Charging only actual usage *after* the call would let many concurrent requests sail past the cap check before any of them recorded usage.
- If no usage is returned (fallback path, or a provider that omits usage), the conservative 600 reservation stands.

### Atomic-increment approach (race-safety)
Reservation is a two-step, DB-atomic operation in `reserveDailyTokens()`:
1. `upsert` the `(user_id, quota_date)` row at zero if absent — idempotent under concurrency via `@@unique([user_id, quota_date])` (`UserAIQuota_user_id_quota_date_key`). The `create` seeds `tokens_used: 0`; `update: {}` is a no-op so a racing upsert never double-charges.
2. A single guarded `updateMany`:
   ```
   where: { user_id, quota_date, tokens_used: { lte: DAILY_TOKEN_QUOTA - cost } }
   data:  { tokens_used: { increment: cost }, request_count: { increment: 1 } }
   ```
   The guard + increment are evaluated atomically by the database. `count === 1` ⇒ reserved; `count === 0` ⇒ at/over cap ⇒ throw **HTTP 429** `AI_DAILY_QUOTA_EXCEEDED` **before** any model call (no provider tokens burned). N concurrent requests each either win the guarded update or are rejected — no read-modify-write race.

Reconcile (`reconcileDailyTokens()`) uses `increment` for an over-run and a floor-guarded `decrement` (`where tokens_used >= refund`) for a refund, so `tokens_used` never goes negative. Reconcile failures are non-fatal (logged, conservative reservation kept).

### Testability seam
`getQuotaDate()` (UTC midnight date bucket, matching `quota_date @db.Date`) is `protected` so tests stub the day boundary deterministically — no wall-clock coupling.

### Preserved behavior
- 20/hr `@Throttle` on `/ai/chat` left intact (defense-in-depth).
- A7 provider-name debug-gating in the controller untouched.

## Tests
`test/ai.service.spec.ts` — new `describe('AiService.chat daily token quota (A1)')`:
- **under cap** → call proceeds, model invoked once, ledger reconciled to actual usage (250), `request_count = 1`.
- **at cap** → seeded row at `DAILY_TOKEN_QUOTA`; `chat()` rejects with 429 `AI_DAILY_QUOTA_EXCEEDED`, `mockCreate` **never** called.
- **day rollover** → stub `getQuotaDate()` across two UTC days; two distinct ledger rows, each a fresh budget.
- **concurrent same-user** → oversubscribe `capacity + 10` requests via `Promise.allSettled`; exactly `capacity` (20) fulfilled, rest rejected, `tokens_used = 20 * 600` (never exceeds cap), model ran exactly 20×.

## Verification (actual counts)
- `npm ci --no-audit --no-fund`: OK (node_modules was missing; 1011 packages).
- `npx tsc --noEmit`: **0 errors**.
- `npm run lint` (touched files: ai.service.ts, ai.dto.ts, 3 spec files): **0 errors / 0 new warnings**.
- `npx jest` AI specs: **30 passed / 30 total** across `test/ai.service.spec.ts` (10), `test/ai/ai-gateway-hardening.spec.ts`, `test/analytics-instrumentation.spec.ts`.

## Deliverables
- Branch pushed: `issues/a1-ai-daily-token-quota`.
- PR **#333** → `main`: "Wave1 A1: per-user daily AI token quota (UserAIQuota)".
- Final SHA: `978e0746e836864a4e2da42d4153d789f8e8b7e2`.

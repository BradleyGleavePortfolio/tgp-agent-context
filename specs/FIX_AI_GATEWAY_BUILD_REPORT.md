# FIX_AI_GATEWAY — Build Report

**Repo:** `growth-project-backend` (BradleyGleavePortfolio, private)
**Branch:** `fix/ai-gateway-hardening`
**Base:** `main`
**PR:** [#327](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/327)
**Head SHA:** `3371d755ee045a34fab30e7ce43a87347d30e394` (`3371d75`)
**Author identity:** Dynasia G <dynasia@trygrowthproject.com>
**Date:** 2026-05-30

All changes confined to `src/ai/*` + `test/*`. No `src/packages/*`, `prisma/schema.prisma`,
migration, billing, or connect file was touched.

---

## Issues fixed (file:line)

### A3 — 🔴 system-role prompt injection (gateway sink)
- **`src/ai/gateway/ai-gateway.service.ts:221-234`** — the `redactedHistory` map now
  whitelists every history turn's role: `role: t.role === 'assistant' ? 'assistant' : 'user'`.
  A client-supplied `system` (or any non-`assistant`) role is demoted to `user`, so the
  content is preserved (no silent drop) but can never reach a provider with a privileged
  role. The trusted system prompt is supplied separately by the gateway (`req.systemPrompt`).
- This is the true sink: `src/ai/gateway/ai-gateway.controller.ts` passes the client
  `conversation_history` (wire-typed `'user'|'assistant'|'system'`) into
  `AiGatewayRequest.conversationHistory` (`AiChatTurn.role` includes `'system'`), so the
  whitelist had to live in the service for defense in depth — not just at a DTO.

### A9 — 🔴 same vector one layer up (controller/service)
- **`src/ai/ai.controller.ts:6,22`** — `chat()` now takes `@Body() body: ChatRequestDto`
  (import added at line 6), so the global `ValidationPipe` validates the role union and
  lengths before the handler runs.
- **`src/ai/ai.service.ts:8,284`** — `chat()` `conversationHistory` param is now typed
  `Array<{ role: ChatRole; content: string }>` (strict `'user'|'assistant'` union; `ChatRole`
  imported at line 8).
- **`src/ai/ai.service.ts:342-348`** — Perplexity branch still narrows defensively:
  `const role: 'assistant' | 'user' = m.role === 'assistant' ? 'assistant' : 'user'`. The
  Anthropic branch (`~line 300-303`) already folds history into `User:`/`Assistant:` plain
  text, so a `system` role cannot be emitted there either.

### A7 — 🔴 provider-name leak in prod
- **`src/ai/ai.controller.ts:28-49`** — `model: result.model_used` (and the `debug` block)
  is now emitted only inside the `includeDebug` guard (`process.env.NODE_ENV !== 'production'`).
  The top-level response keeps the buyer-facing `degraded` flag; production no longer
  discloses which provider/fallback backs a request.

### A8 — 🔴 unthrottled heavy context routes
- **`src/ai/ai.controller.ts:55-56`** — `@Throttle({ default: { ttl: 3600000, limit: 60 } })`
  added to `GET /ai/context`.
- **`src/ai/ai.controller.ts:65-66`** — same `@Throttle` added to `GET /ai/structured-context`.
- 60/hr/user, mirroring the existing `@Throttle` envelope on `POST /ai/chat` (which is 20/hr).

### A1 — chat input validation (NON-SCHEMA half only)
- **`src/ai/ai.dto.ts`** (new file) — `ChatMessageDto` + `ChatRequestDto`:
  - `CHAT_MESSAGE_MAX_LENGTH = 4000` (`@MaxLength` on both `message` and history `content`).
  - `CHAT_HISTORY_MAX_TURNS = 50` (`@ArrayMaxSize`).
  - `CHAT_ROLES = ['user','assistant']` with `@IsIn` on the role (forged `system` rejected
    at the HTTP boundary).
  - `@ValidateNested({ each: true }) @Type(() => ChatMessageDto)` so each turn is validated.
  - Relies on the existing global `ValidationPipe` (`whitelist`/`forbidNonWhitelisted`/`transform`)
    configured in `src/main.ts`.

#### DEFERRED — A1 daily token quota (UserAIQuota)
The persistent **daily-token-quota** half of A1 (`UserAIQuota` table + per-user accounting)
is intentionally **NOT** implemented here. It requires a Prisma schema change + migration,
which the brief placed out of scope ("DO NOT add the UserAIQuota table or any schema/migration").
Only the request-shape/length/role validation (the non-schema half) was delivered. The quota
should be picked up as a separate unit that owns the migration.

---

## Verification (real runs)

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc -p tsconfig.json --noEmit` | **clean (exit 0)** |
| Lint | `npx eslint "src/ai/**/*.ts"` | **0 errors** (3 pre-existing warnings in untouched files: `client-ai-context.service.ts`, `gateway/ai-gateway.controller.ts`) |
| New spec | `npx jest test/ai/ai-gateway-hardening.spec.ts` | **12 passed / 12** |
| Full AI area | `npx jest test/ai test/ai*.spec.ts test/client-ai-context.service.spec.ts` | **20 suites passed, 227 passed / 4 skipped (pre-existing), 0 failures** |

### New tests (`test/ai/ai-gateway-hardening.spec.ts`, 12 tests)
- **A3** (2): no provider turn keeps a `system` role even when the client sends one;
  forged-turn content is preserved but demoted to `user` (asserts on provider call args
  via a `complete` spy on the resolved stub adapter).
- **A9** (1): `ai.service` Perplexity branch — a `system` history entry reaching the
  service directly is demoted to `user`; trusted `messages[0]` system prompt is unaffected
  (asserts on the mocked OpenAI/Perplexity `create` call args).
- **A7** (2): `NODE_ENV=production` response omits `model` + `debug` but keeps `degraded`;
  non-production keeps both.
- **A8** (2): both `getContext` and `getStructuredContext` handlers carry
  `THROTTLER:TTLdefault=3600000` / `THROTTLER:LIMITdefault=60` metadata.
- **A1** (5): valid payload passes; rejects over-length `message`; rejects forged `system`
  role in a history turn; rejects over-length history `content`; rejects history beyond the
  turn cap.

---

## Deviations from the brief
- **Test-fixture type fix (1 line):** `test/ai.service.spec.ts:182` — pinned the history
  fixture's role literal to `'user' as const` so it satisfies the now-strict `ChatRole`
  param introduced by A9. Without it the pre-existing test failed typecheck (string is not
  assignable to the `'user'|'assistant'` union). This is the only edit outside the issue
  scope and is a direct, necessary consequence of the A9 type tightening.
- No other deviations. A1's quota table deferral is per the brief (documented above).

---

## Commits
1. `939c1ac` — `Fix: AI gateway role-injection + provider-leak + chat input validation + context throttle` (source: A3/A9/A7/A8/A1)
2. `3371d75` — `test: AI gateway hardening regression suite (A3/A7/A8/A9/A1)` (tests + fixture fix)

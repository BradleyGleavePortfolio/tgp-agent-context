# AUDIT — Fix: AI gateway role-injection + provider-leak + chat input validation + context throttle (PR #327)
VERDICT: CLEAN
Typecheck: pass (`npx tsc -p tsconfig.json --noEmit`)
Lint: pass (`npm run lint` → 0 errors, 17 warnings; AI-only `npx eslint "src/ai/**/*.ts"` → 0 errors, 3 warnings)
Tests: pass (`npx jest test/ai test/ai*.spec.ts test/client-ai-context.service.spec.ts --runInBand` → 20 suites passed, 227 passed, 4 skipped, 231 total)

SHA audited: `3371d755ee045a34fab30e7ce43a87347d30e394` (confirmed with `git rev-parse HEAD`).
Dependencies: `npm ci` completed successfully before validation runs.
Guardrails: pass — diff is confined to `src/ai/ai.controller.ts`, `src/ai/ai.dto.ts`, `src/ai/ai.service.ts`, `src/ai/gateway/ai-gateway.service.ts`, `test/ai.service.spec.ts`, and `test/ai/ai-gateway-hardening.spec.ts`; no `src/packages/*`, `prisma/schema.prisma`, or migration files were modified.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- [src/ai/gateway/ai-gateway.controller.ts:52] Existing AI-area lint warning remains: `req` is accepted by `getStatus()` but unused. This is polish only and does not affect the security fixes.

## Verification of PR claims
- A3 gateway role whitelist → verified true. `AiGatewayService.invoke()` maps every `req.conversationHistory` turn to `role: t.role === 'assistant' ? 'assistant' : 'user'` before building `turns`, and the provider call receives only that sanitized `turns` array (`src/ai/gateway/ai-gateway.service.ts:229`, `src/ai/gateway/ai-gateway.service.ts:239`, `src/ai/gateway/ai-gateway.service.ts:251`). The trusted system prompt is passed separately as `systemPrompt`, not as a client history turn (`src/ai/gateway/ai-gateway.service.ts:251`).
- A9 controller/service role typing and coercion → verified true. `/ai/chat` now binds `@Body()` to `ChatRequestDto` (`src/ai/ai.controller.ts:22`), the DTO restricts history roles to `['user', 'assistant']` (`src/ai/ai.dto.ts:29`, `src/ai/ai.dto.ts:33`), `AiService.chat()` accepts the strict `ChatRole` union (`src/ai/ai.service.ts:284`), the Anthropic fallback folds non-assistant history to `User:` text (`src/ai/ai.service.ts:300`), and the Perplexity branch narrows any non-assistant runtime value to `user` before calling the provider (`src/ai/ai.service.ts:342`, `src/ai/ai.service.ts:347`).
- A7 provider-name leak gating → verified true. The top-level `/ai/chat` response no longer returns `model` outside the debug guard; `model` and `debug.model_used` are emitted only in the `includeDebug` branch, while production gets only the buyer-facing `degraded` flag (`src/ai/ai.controller.ts:28`, `src/ai/ai.controller.ts:38`, `src/ai/ai.controller.ts:39`, `src/ai/ai.controller.ts:41`).
- A8 throttles on heavy context routes → verified true. `GET /ai/context` has `@Throttle({ default: { ttl: 3600000, limit: 60 } })` (`src/ai/ai.controller.ts:55`, `src/ai/ai.controller.ts:56`), and `GET /ai/structured-context` has the same throttle metadata (`src/ai/ai.controller.ts:65`, `src/ai/ai.controller.ts:66`).
- A1 non-schema chat validation → verified true. `/ai/chat` uses `ChatRequestDto` at the route boundary (`src/ai/ai.controller.ts:22`), `message` has `@IsString()` and `@MaxLength(CHAT_MESSAGE_MAX_LENGTH)` (`src/ai/ai.dto.ts:41`, `src/ai/ai.dto.ts:43`), history `content` has `@IsString()` and `@MaxLength(CHAT_MESSAGE_MAX_LENGTH)` (`src/ai/ai.dto.ts:36`, `src/ai/ai.dto.ts:37`), history role is validated with `@IsIn(CHAT_ROLES)` (`src/ai/ai.dto.ts:29`, `src/ai/ai.dto.ts:33`), and nested history validation is wired with `@ValidateNested({ each: true })` plus `@Type(() => ChatMessageDto)` (`src/ai/ai.dto.ts:49`, `src/ai/ai.dto.ts:50`). The global `ValidationPipe` is configured with `whitelist`, `forbidNonWhitelisted`, and `transform` (`src/main.ts:116`, `src/main.ts:117`, `src/main.ts:118`, `src/main.ts:119`).
- Tests for the critical branches → verified true. The new hardening suite covers forged gateway `system` role demotion, service-level Perplexity demotion, production omission of `model`/`debug`, throttle metadata on both context handlers, and DTO rejection of over-length/bad-role payloads (`test/ai/ai-gateway-hardening.spec.ts:50`, `test/ai/ai-gateway-hardening.spec.ts:96`, `test/ai/ai-gateway-hardening.spec.ts:158`, `test/ai/ai-gateway-hardening.spec.ts:199`, `test/ai/ai-gateway-hardening.spec.ts:215`).
- A1 daily-token-quota/UserAIQuota table deferral → verified not implemented and not flagged, as required by the brief. No Prisma schema or migration files were modified.

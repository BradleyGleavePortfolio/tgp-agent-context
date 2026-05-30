# FIX BRIEF — AI gateway hardening (A3, A9, A7, A8, A1-non-schema)

Repo: growth-project-backend. Type: SECURITY FIX (🔴). Branch: `fix/ai-gateway-hardening`.
PR title: `Fix: AI gateway role-injection + provider-leak + chat input validation + context throttle`

## Why
Five open security/hygiene issues in the AI surface (verified against origin/main in `audits/issue-registers-2026-05/OPEN_ISSUES_PRUNED_2026-05-28.md`). All live in `ai*` files — DISJOINT from PR-17 (`src/packages/*`). The `UserAIQuota` TABLE half of A1 is OUT OF SCOPE here (it needs a Prisma migration that would collide with PR-17's schema migration — defer it). Fix only the non-schema halves + the role/leak/throttle issues.

## Scope — EXACTLY these issues
1. **A3 (🔴 system-role prompt injection)** — `src/ai/gateway/ai-gateway.service.ts:221-223`: `conversation_history[i].role` is passed through verbatim with no whitelist. Add a strict whitelist so only `'user'`/`'assistant'` roles reach any provider call; coerce/reject anything else (a `system` role from client history must NOT pass through). Verify the exact current line range before editing.
2. **A9 (🔴 same shape one layer up)** — `src/ai/ai.controller.ts:26` types history `role: string`; `src/ai/ai.service.ts:295` coerces non-`assistant` → "User", folding `system` text into the user prompt. Tighten the controller/service types + coercion so `system` (or any non-user/assistant) history entries are rejected or safely demoted to `user` content WITHOUT carrying a system role. Make the controller DTO role a strict union (`'user'|'assistant'`).
3. **A7 (🔴 provider-name leak in prod)** — `src/ai/ai.controller.ts:39` returns `model: result.model_used` OUTSIDE the dev-only debug block — leaks `perplexity`/`anthropic`/`fallback` provider name in production responses. Move the `model` field INSIDE the existing dev-only/debug guard (or strip it in prod). Verify how the debug block is gated elsewhere in the file and match that pattern.
4. **A8 (🔴 unthrottled heavy context routes)** — `src/ai/ai.controller.ts:53-65`: `GET /ai/context` + `/ai/structured-context` (heavy multi-join) have no `@Throttle` and no cache. Add a sensible `@Throttle` (match the project's throttle conventions — find an existing `@Throttle` usage and mirror the limit/ttl style). Caching is optional/out-of-scope if it risks scope-creep; a throttle alone closes the abuse vector.
5. **A1 (NON-SCHEMA half only)** — `POST /ai/chat` body is an inline type. Add a `ChatMessageDto` (or `ChatRequestDto`) with `@MaxLength` on the message/content fields and validated `role` union, wired through the global `ValidationPipe`. DO NOT add the `UserAIQuota` table or daily-token-quota persistence (schema change → deferred to avoid PR-17 migration collision). Note the deferred quota piece in the build report.

## Guardrails
- Do NOT touch any `src/packages/*` file, `prisma/schema.prisma`, or any migration (stay collision-free with PR-17).
- Reuse existing DTO/validation conventions (`class-validator`, the global pipe in `main.ts:116-118`). Reuse the existing `@Throttle` import + style already present in the repo.
- Do NOT change AI provider routing logic beyond the role whitelist + the response-field gating.

## Tests (real)
- A history entry with `role:'system'` (or arbitrary string) is rejected/sanitized and NEVER reaches the provider with a system role (assert against the gateway call args). Cover both the gateway layer (A3) and the controller/service layer (A9).
- Prod response (debug OFF) does NOT include `model`/provider name; dev/debug ON still does (A7).
- `/ai/context` + `/ai/structured-context` carry a `@Throttle` (assert metadata or an integration 429 if a harness exists) (A8).
- `POST /ai/chat` rejects an over-length message and a bad `role` via the DTO (A1 non-schema).
- Run the repo typecheck + lint + the AI-area tests; report actual counts.

## Deliverables
- Branch + PR vs default. Pull latest default first. Push every ~2 min (R61).
- `/home/user/workspace/specs/FIX_AI_GATEWAY_BUILD_REPORT.md`: file:line per issue, what changed, the deferred-A1-quota note, actual tsc/lint/test counts.
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.

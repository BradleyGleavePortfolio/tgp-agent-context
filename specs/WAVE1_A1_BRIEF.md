# WAVE-1 A1 — AI chat daily token quota (issue A1)

## Role
BUILDER (Opus 4.8). Worktree `/home/user/workspace/wt-a1-quota` only. R4 identity `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers. Push every ~2 min (R61). api_credentials=["github"] for git ops.

## Repo / base / branch
- Repo `growth-project-backend`. Base `origin/main` @ `9c191be` (includes Wave-0 `UserAIQuota` table + AI-gateway hardening A3/A9/A7).
- Branch `issues/a1-ai-daily-token-quota`.

## The issue (A1, 🔴)
`POST /ai/chat` has only a 20/hr per-IP throttle and NO daily token quota — a client-surface token-amplification vector. The `UserAIQuota` table now exists (Wave-0): `id`, `user_id` (FK→User), `quota_date @db.Date` (UTC day bucket), `tokens_used Int @default(0)`, `request_count Int @default(0)`, timestamps, `@@unique([user_id, quota_date])`. The DTO (`ChatRequestDto`/`ChatMessageDto` in `src/ai/ai.dto.ts`) ALREADY has `@MaxLength`. So A1's remaining work = enforce a per-user DAILY token quota using `UserAIQuota`.

## Scope — files you may edit (file-disjoint from all other Wave-1 units)
ONLY within `src/ai/`: `ai.service.ts`, `ai.controller.ts`, `ai.dto.ts`, plus the AI module/test files in `src/ai/`. Do NOT touch `src/coach/**`, `prisma/schema.prisma` (table already exists — DO NOT add migrations), or any other module.

## What to build
1. **Daily token accounting**: before/after the model call in `AiService.chat(...)` (`ai.service.ts:275`), enforce a per-user daily token budget against `UserAIQuota`.
   - Pick a sane `DAILY_TOKEN_QUOTA` constant (document rationale; the existing per-call `max_tokens: 600` at `ai.service.ts:357` is a useful unit — e.g. allow N calls/day). Make it a named, commented constant.
   - On each chat: compute today's UTC `quota_date`. Upsert-by-`@@unique([user_id, quota_date])`: if no row, create with the request's token cost; else atomically increment `tokens_used` (+ `request_count`). Use an atomic increment (Prisma `update ... { tokens_used: { increment: n } }` inside an upsert or a transaction) so concurrent requests can't race past the cap.
   - If the user is ALREADY at/over the cap for today, REJECT before calling the model (so you don't burn provider tokens) with HTTP 429 and a calm machine code (e.g. `AI_DAILY_QUOTA_EXCEEDED`) + a buyer-friendly message. Decide whether you charge estimated tokens up-front (reserve) or actual usage after the call — for safety against amplification, reserve the per-call `max_tokens` budget BEFORE the call, then optionally reconcile to actual usage after. Document your choice.
   - Token cost source: if the provider response exposes a usage/token count, use it for the post-call reconcile; otherwise charge the `max_tokens` estimate. Look at what `result` from the gateway/provider returns.
2. Keep the existing 20/hr `@Throttle` (defense-in-depth) and all A7 debug-gating intact.
3. Make the quota enforcement testable (inject PrismaService as already done; no clock-coupling that breaks tests — derive "today" via an injectable/now-able boundary or a private method you can stub).

## Tests
Add/extend the AI spec (e.g. `test/ai.service.spec.ts` or co-located `src/ai/*.spec.ts` — match repo convention): (a) under cap → call proceeds + counter increments; (b) at cap → 429 `AI_DAILY_QUOTA_EXCEEDED`, model NOT called; (c) day rollover → new `quota_date` row, fresh budget; (d) concurrent same-user requests don't exceed the cap (assert the atomic increment / final tokens_used). Keep existing AI tests green.

## Verify (run, report actual counts)
`npm ci --no-audit --no-fund` if node_modules missing. `npx tsc --noEmit` (0 errors); `npm run lint` (no NEW errors in touched files); `npx jest` on the AI spec(s) (report counts); `npm run build` if quick.

## Deliverables
Push branch; open PR `Wave1 A1: per-user daily AI token quota (UserAIQuota)` to main (gh, report #). Build report `specs/WAVE1_A1_BUILD_REPORT.md` to tgp-agent-context (quota design + chosen reserve/reconcile + constant value, the upsert/atomic-increment approach, test counts, final SHA), commit (R4) + push to docs main after rebase. Report final SHA, PR#, verification counts. Builder record — GPT-5.5 auditor re-checks at your SHA.

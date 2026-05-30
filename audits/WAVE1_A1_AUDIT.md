# AUDIT — Wave1 A1: per-user daily AI token quota (PR #333)
VERDICT: NOT CLEAN
Typecheck: pass (`cd /home/user/workspace/wt-a1-quota && npx tsc --noEmit`)
Lint: pass (`npm run lint`: 0 errors / 17 pre-existing warnings outside touched files; touched source lint `npx eslint src/ai/ai.service.ts src/ai/ai.dto.ts`: 0 errors)
Tests: pass (`npx jest --runInBand test/ai.service.spec.ts test/ai/*.spec.ts test/ai-*.spec.ts`: 19 suites passed; 220 passed / 224 total, 4 skipped; 6 snapshots passed)

## P0 findings
- None.

## P1 findings
- [src/ai/ai.service.ts:311, src/ai/ai.service.ts:384-416, src/ai/ai.service.ts:527-530, src/ai/ai.dto.ts:28-50] The up-front reservation is only `MAX_TOKENS_PER_CALL` (600 output tokens), but the reconciled usage is provider total tokens (`response.usage.total_tokens` / Anthropic input+output). The request can still carry a 4,000-character live message plus up to 10 sliced history turns of 4,000 characters each, before the generated context/system prompt is added. That means concurrent high-input calls can all reserve only 600 tokens, pass the guarded quota check up to 20 in-flight calls, burn far more than 12,000 provider tokens, and then `reconcileDailyTokens()` increments the ledger above the daily cap after the spend has already happened. This preserves the client-surface token-amplification vector for prompt/input tokens. Fix: reserve a conservative total-token upper bound for the rendered request (system/context + sliced history + live message + max output), or reduce/enforce input sizes so 600 is truly a total-token upper bound; keep the guarded atomic reservation on that total estimate.
- [src/ai/ai.service.ts:311-420] Reservations are not released when the chat request fails after the initial reserve. `chat()` reserves before context construction, provider work, guardrails, and analytics, but there is no `try/catch/finally` that refunds the reservation on an exception path. For example, `contextSvc.build()` can throw before any model call, yet the 600-token reservation remains and the user receives a failed request. This is a significant robustness/correctness gap for quota accounting. Fix: track the reservation's quota date/amount and refund it on thrown request failures where no successful response is returned, while preserving conservative accounting for successful fallback responses if that is the intended policy.

## P2 findings
- [src/ai/ai.service.ts:457-525, src/ai/ai.service.ts:535-538] Day-boundary reconciliation recomputes `getQuotaDate()` after the provider call instead of using the quota date that was reserved. A request reserved just before UTC midnight and reconciled just after midnight will attempt to adjust the new day's row, usually match zero rows, and silently leave the old day's reservation unreconciled. Fix: have `reserveDailyTokens()` return the exact `quotaDate`/row key used for the reservation and pass it to `reconcileDailyTokens()` and any refund path.

## P3 (non-blocking)
- [test/ai.service.spec.ts:304-324] The concurrency test only covers responses with no usage block, so it proves the 600-token reservation guard but not the important `actualTokens > reserved` path where the ledger can exceed the cap after reconciliation. Add a concurrent test with high `usage.total_tokens` and assert the chosen hard-cap behavior.

## Verification of PR claims
- Scope claim: verified true. `git diff --name-only origin/main...HEAD` lists only `src/ai/ai.dto.ts`, `src/ai/ai.service.ts`, and AI-related spec files.
- Schema compatibility claim: verified true. `origin/main:prisma/schema.prisma` has `UserAIQuota` with `user_id`, `quota_date @db.Date`, `tokens_used`, `request_count`, timestamps, and the named `@@unique([user_id, quota_date], name: "UserAIQuota_user_id_quota_date_key")` used by the code.
- Atomic reserved-token increment claim: partially true. The quota reserve path uses `updateMany` with `tokens_used: { lte: DAILY_TOKEN_QUOTA - cost }` and `tokens_used/request_count` increments, so there is no read-modify-write race for the 600-token reservation itself. It is not a hard daily total-token cap because actual total usage can exceed the reservation and is reconciled after provider spend.
- 429 claim: verified true for the at-cap reservation path. `reserveDailyTokens()` throws `HttpException` with `AI_DAILY_QUOTA_EXCEEDED` and `HttpStatus.TOO_MANY_REQUESTS` before model invocation when the guarded update affects zero rows.
- UTC day-bucket claim: partially true. `getQuotaDate()` computes midnight UTC, but reconciliation does not reuse the reserved day bucket and can miss across a midnight boundary.
- Reserve-then-reconcile claim: partially true. Successful provider usage is reconciled when available, but failed request paths leak the initial reservation.

Tier: T4
Why: money: every coach AI pool debit rounded each call up to a whole hard-cost cent (or to the nearest cent on the coach AI tools), so the pool was drawn down faster than the 3.125x multiplier coaches are quoted (a 0.5-cent call debited 1 cent: 6.25x).
T4 trigger scan: money accounting (CoachAIBudget `actual_used_cents`, the figure behind the displayed credit balance and the hard stop) and an ADDITIVE MIGRATION on CoachAIBudget. No Stripe call, no auth, flag, price or multiplier change.
T3 trigger scan: none (no endpoint or response shape change; `BudgetSnapshot` gains one internal field).
Bounded T1: NO (money accounting on persisted data, schema change).
Canonical builder: Claude Opus 5.5 (CREDIT-METER-130, agent 130)
Parent owner: operator agent 130
Acceptance evidence: test/ai-credits-exact-metering.spec.ts 13/13 (new). Failing-first on main 80cebd11 (src unchanged): 13 of 13 fail (cost of 1,500 / 200 tokens 1 not 0.5, 6,000 / 400 2 not 1.6, 20,000 / 1,500 6 not 5.5; four 0.5-cent Guide answers use 4 cents not 2; five 1.6-cent gateway calls 10 not 8; two 5.5-cent Roman turns 12 not 11; four 0.5-cent background jobs 4 not 2; four 0.5-cent coach AI drafts 4 not 2; a fractional debit cannot be stored; rollover leaves the exact total). Touched specs at this head: ai-guide-coach-pool 6/6, roman-c2-pool 4/4, roman-rmn2-fixes 6/6, ai-credits-stream1 30 passed + 4 pre-existing skips, ai-credits-round1-fixes 15/15, coach-ai-metering 23/23, r11-seams 22/22, r11-tool-loop 6/6, ai-credits-gateway-402 2/2; schema and migration guards (g2 db-guard x5, schema-parity-gate, deploy-readiness, erasure-manifest-coverage, manifest-fk-order) pass. eslint on the changed src files clean. Production read-only aggregate SELECT (19:37 PDT 10-07): 1 CoachAIBudget row, 0 with usage, column not present yet.
Promotion triggers: any change to `recordUsage`, the rollover or a debit path's cost function; a price change in coach-ai.constants / roman.constants; any other migration on CoachAIBudget.

## ADDITIVE MIGRATION: deploy needs migrations=apply-migrations

`prisma/migrations/20270405000000_coach_ai_budget_exact_usage` adds `"CoachAIBudget"."actual_used_micro_cents" BIGINT NOT NULL DEFAULT 0` (catalog-only on Postgres 11+, `SET lock_timeout = '5s'`). `down.sql` drops it. No backfill. Newer than every migration on main (newest 20270404000000_recipe_declared_allergens). The code reads the column, so this head must not run against a database without it: deploy with migrations=apply-migrations. During a rolling deploy, machines still on the old code keep writing whole cents; the new code reads such a row without ever lowering its used figure.

## What changes for coaches and clients

- Coaches: each AI answer, Roman reply, background job and coach AI draft now takes its exact provider cost from the monthly AI credit pool. The pool rounds up once for the whole month (under one hard-cost cent, about 3 displayed cents) instead of on every call, so the credit lasts as long as the quoted 3.125x says. Example: four 0.5-cent answers used 13 displayed cents of credit before and 6 now.
- Coach AI drafts (workout programs, meal plans, insights) under half a cent were free before (rounded to 0); they now count at their exact cost.
- The balance shown, the "used up" stop, the pre-call checks and the 1st-of-month reset work as before. Clients see no change.
- Production today: 1 pool row, nothing used yet, so no balance changes on deploy.

## B list

- B1 (money wrong, seen in a test; CREDIT-REFILL-130 B2): five debit paths rounded per call. `src/ai/ai.service.ts:185-190` (`aiGuideCostCents`, Math.ceil), `src/ai/gateway/ai-gateway.service.ts:704-716` (Math.ceil plus a 1-cent minimum), `src/roman/roman.service.ts:1728` (Math.ceil), `src/roman/background/roman-background-spend.ts:212-214` (Math.ceil), and coach AI drafts via `AnthropicAdapter.computeCostCents` (`src/ai/adapters/anthropic.adapter.ts:236-241`, Math.round) at `src/ai/coach/coach-ai.service.ts:122`. A coach hits it by letting clients ask the AI Guide short questions all month: each 0.5-cent answer took 1 cent (3.125 displayed cents of credit instead of 1.56). Fix: every path passes the exact cost (`coachAiCostCents` for the coach AI price, `costUsd * 100` for Roman); `recordUsage` adds it to `actual_used_micro_cents` and sets `actual_used_cents` to the ceiling of the period total, pinned to the usage it read (re-read on a lost race, up to 3 writes); the rollover resets both columns.

## U list

- U3 (from the code, not fixed, no change needed): the gateway's flat 5-cent debit when a response has no token counts (`src/ai/gateway/ai-gateway.service.ts:707-710`) is unreachable for paid calls: the Anthropic provider adapter always sets both counts (0 when the SDK omits usage, `src/ai/gateway/providers/anthropic-provider.adapter.ts:64-65`), the stub reports `enabled: false` and the gateway debits only enabled responses (`ai-gateway.service.ts:374-379`). A paid call that reports 0 / 0 keeps the 1-cent floor it always had.

## Numbers (Sonnet 5.5, $2 / $10 per million tokens, multiplier 3.125)

| Calls in one period | exact cost (cents) | used before | used now | displayed used before | displayed used now |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 x AI Guide, 1,500 in / 200 out | 2.0 | 4 | 2 | 13 | 6 |
| 5 x gateway, 6,000 / 400 | 8.0 | 10 | 8 | 31 | 25 |
| 2 x Roman, 20,000 / 1,500 | 11.0 | 12 | 11 | 38 | 34 |
| 0.5 + 1.6 + 5.5 (one each) | 7.6 | 9 | 8 | 28 | 25 |
| 1 x coach AI draft, 1,400 / 180 | 0.46 | 0 | 1 | 0 | 3 |

## Not in this PR

- `AICallLog.costCents` and `AIDraft.costCents` still store whole cents rounded to nearest (records only; the pool no longer reads them).
- No backfill: a row written in whole cents before this deploy reads as (used - 1) cents plus one millionth, so at most under one cent is not counted once per row until the next rollover (production: 1 row, 0 used).

agent 130


# CREDIT-METER-130 (agent 130) — the coach AI pool debits the exact AI cost

Status: STOPPED 19:43 PDT on the operator's STOP (19:41). PR open (growth-project-backend#874), NOT READY. Head 9216885a pushed, worktree clean.
Worktree: /home/user/workspace/wt/CREDIT-METER-130-backend (agent130/credit-meter-130). Base: origin/main 80cebd11 (fast-forwarded from 0903c728 before the first commit; b#868 had merged).

## Scope traced

Owner order 18:02: the 3.125x multiplier must be correctly quoted and delivered. Fixes B2 of CREDIT-REFILL-130 with its Proposed 2 (exact sub-cent total on CoachAIBudget).

Debit paths into `CoachAIBudgetService.recordUsage` (from the code, origin/main 80cebd11):
- AI Guide: `src/ai/ai.service.ts:185-190` `aiGuideCostCents` (Math.ceil), used by `debitCoachPool` at :771.
- Gateway: `src/ai/gateway/ai-gateway.service.ts:704-716` `estimateAnthropicCostCents` (Math.ceil, minimum 1 cent), called at :381 for every metered enabled call.
- Roman turn: `src/roman/roman.service.ts:1728` (Math.ceil).
- Roman background (memory, playbook): `src/roman/background/roman-background-spend.ts:212-214` (Math.ceil).
- Coach AI drafts (workout program, meal plan, insight): `src/ai/coach/coach-ai.service.ts:122` via `AnthropicAdapter.computeCostCents` (`src/ai/adapters/anthropic.adapter.ts:236-241`, Math.round).
- Pre-call worst-case checks stay whole cents rounded up (`aiGuideWorstCaseCents`, `RomanService.worstCaseTurnCents`, background reserve): they only refuse, never debit.
- Only writer of `actual_used_cents`: coach-ai-budget.service.ts (recordUsage, rollover). Readers (gateway/coach AI hard stop, Roman/background pre-checks, workout-builder status, admin list, DTO) all read the whole-cent figure, which keeps its meaning (ceiling of the exact total).

Prices (from the code): coach AI $2 / $10 per MTok (`src/ai/coach/coach-ai.constants.ts:19-20`), `ROMAN_PRICE_PER_MTOK` {2, 10}, background `ROMAN_MODEL_PRICE_PER_MTOK`.

## B list

- B1 (money wrong, seen in a test; CREDIT-REFILL-130 B2): five debit paths rounded each call (four up, coach AI to nearest), so a 0.5-cent call debited 1 cent (6.25x instead of 3.125x) and a coach AI draft under 0.5 cents debited 0. A coach hits it by letting clients ask the AI Guide short questions all month: each 0.5-cent answer took 3.125 displayed cents of credit instead of 1.56. Fixed in b#874: exact cost on every path; `actual_used_micro_cents` (BIGINT, additive migration 20270405000000_coach_ai_budget_exact_usage, down.sql) holds the exact period total; `actual_used_cents` = its ceiling (one round-up per period, under one hard-cost cent per coach); write pinned to the usage read, re-read on a lost race (3 writes, then the callers' existing remainder fallback); rollover resets both.

Failing-first (local, src at origin/main 80cebd11): /home/user/workspace/ops/reports/CREDIT-METER-130.failing-first.txt, 13 of 13 fail; 13/13 pass at the fix.

| Calls in one period | exact cost | used before | used now | displayed before | displayed now |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 x AI Guide 1,500 / 200 | 2.0 | 4 | 2 | 13 | 6 |
| 5 x gateway 6,000 / 400 | 8.0 | 10 | 8 | 31 | 25 |
| 2 x Roman 20,000 / 1,500 | 11.0 | 12 | 11 | 38 | 34 |
| 0.5 + 1.6 + 5.5 | 7.6 | 9 | 8 | 28 | 25 |
| 1 x coach AI 1,400 / 180 | 0.46 | 0 | 1 | 0 | 3 |

## U list

- U3 (from the code, not fixed, nothing to fix): the gateway's flat 5-cent debit when a response has no token counts (`ai-gateway.service.ts:707-710`) is unreachable for paid calls. `AnthropicProviderAdapter` always sets both counts (0 when the SDK omits usage, `src/ai/gateway/providers/anthropic-provider.adapter.ts:64-65`); the stub is `enabled: false` and the gateway debits only enabled responses. A paid call reporting 0 / 0 keeps its old 1-cent floor.

## C one-liners

- C1: `AICallLog.costCents` / `AIDraft.costCents` stay whole cents rounded to nearest (records only, not the pool).
- C2: production read-only aggregate (19:37 PDT): 1 CoachAIBudget row, 0 with usage, no `actual_used_micro_cents` column yet: no backfill needed, no balance moves on deploy.
- C3: CREDIT-PAY-130 backend (agent130/credit-pay-130) has no PR yet and waits on owner decision 10; its pool-empty string edits are on other lines. Merged in only if it merges before READY.

## PRs

- growth-project-backend#874 `fix(ai-credits): debit the exact AI cost and round once per period (CREDIT-METER-130, T4)`, head 9216885a (2 commits: failing-first test, fix + migration), 15 files +504 / -73. Body: /home/user/workspace/ops/reports/CREDIT-METER-130-pr-body.md. ADDITIVE MIGRATION: deploy needs migrations=apply-migrations.

## Not fixed (needs operator)

- READY not posted (STOP): b#874 still needs `git merge origin/main` after b#870 merges, CI green at that head, then READY. Default: a later builder run finishes it (see HANDOFF).
- Deploy order: the code reads the new column, so b#874 must deploy with migrations=apply-migrations. Default: operator deploys it that way; never with migrations skipped.

## Proposed (needs operator)

- None beyond the entry. Default: nothing further.

## HANDOFF

State: STOPPED at 19:43 PDT by the operator's STOP. Lane not finished: no READY posted.
- Branch: agent130/credit-meter-130, worktree /home/user/workspace/wt/CREDIT-METER-130-backend (clean, deps linked).
- PR: growth-project-backend#874, head 9216885a9ab380c0be3f7bd9712bed61bf56b8c0 (local = remote). Commits: f57bcfab failing-first test, 9216885a fix + migration.
- CI at 19:42 PDT (last check, no poll after STOP): migration gates green (forward apply, reversible, schema parity), danger, rls, community, mwb-3, npm audit, banned casts green; build-and-test and CodeQL JS/TS still running. Result unknown.
- Local runs (heavy.sh, one file each): new spec 13/13; ai-guide-coach-pool, roman-c2-pool, roman-rmn2-fixes, ai-credits-stream1, ai-credits-round1-fixes, coach-ai-metering, r11-seams, r11-tool-loop, ai-credits-gateway-402, r11-playbook-builder, roman-notes.writer, aib2/aib4 workout builder, g2 db-guard x5, deploy-readiness, schema-parity-gate, branch-protection-checks, restore-schema-declared-objects, erasure-manifest-coverage, manifest-fk-order all pass. eslint on changed src clean. Full-project tsc only in CI.

What is left:
1. Check b#874 CI at 9216885a (build-and-test runs tsc over src and test; the new Prisma field is typed only after CI's prisma generate). Fix anything red in one push.
2. b#870 (CREDIT-REFILL-130) at 7be96721 was in a fix round (CI failing build-and-test at 19:42). After it merges: `git merge origin/main` in the worktree. Expected clean auto-merge: b#870 edits the rollover `select`, `where` and the pack comment lines; b#874 only adds `actual_used_micro_cents: 0,` after `actual_used_cents: 0,` in the rollover data. Keep both. b#870's spec test/ai-credits-rollover-pack-carry.spec.ts never calls recordUsage, so it is unaffected; re-run it and test/ai-credits-exact-metering.spec.ts (the rollover test there pins `actual_used_cents` equality, which the fake supports).
3. CREDIT-PAY-130 backend (agent130/credit-pay-130) had no PR at 19:43 and waits on owner decision 10; if it merges first, merge origin/main again (pool-empty strings, other lines).
4. Push, CI green at the new head, re-check the head on GitHub, post READY with first line `FIX ROUND 1 (OPENING) (CREDIT-METER-130, agent 130) — growth-project-backend#874 @ <full head sha> — READY FOR AUDIT`, then update this HANDOFF and the notify line.
5. Deploy (operator): migrations=apply-migrations.

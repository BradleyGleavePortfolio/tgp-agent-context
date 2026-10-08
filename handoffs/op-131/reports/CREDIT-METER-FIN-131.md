# CREDIT-METER-FIN-131 (agent 131) — finish b#874: the coach AI pool debits the exact AI cost

Status: DONE 21:08 PDT. READY posted on growth-project-backend#874 @ fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a (21:07:49 PDT,
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6051993234). CI green at that head (19 check runs: all success, deploy-readiness-gate skipped as on every PR run). GitHub: mergeable, clean against main b72e2c45.
Worktree: /home/user/workspace/wt/CREDIT-METER-FIN-131-backend (branch agent130/credit-meter-130), clean, local = remote, deps linked. No `prisma generate` was run (shared node_modules; jest is transpile-only; CI generates).

## Scope traced (finisher, from the code at fbab7f99)
- Reviewed the builder's full T4 diff: migration + down.sql, schema, `recordUsage` / `writeUsage` pinned write (src/ai-credits/coach-ai-budget.service.ts:214-276), `exactUsedMicroCents` (:608-615), rollover reset (`actual_used_micro_cents: 0`), all five debit paths and their remainder steps: ai.service.ts:773-786, roman.service.ts:1731-1752, roman-background-spend.ts:216-233, coach-ai.service.ts:125-145, ai-gateway.service.ts:381. Every `recordUsage` caller in src passes the exact cost; the playbook files only call `resolveHeadCoachId`. Read paths are full-row `findUnique` / `upsert`, so the new column always reaches `toSnapshot`.
- After 3 lost races the callers' remainder step retries `min(rest, exact cost)`: it re-records the exact cost when room exists; it does not drain the pool.
- Merged origin/main f0cd518a (b#873: roman.service.ts prompt-version lines only, no interaction with the debit): merge commit 5929ad80, clean. Main then moved to b72e2c45 (b#855: playbook flag declaration, runbook, r11-seams flag test; no shared file; GitHub clean): no further merge needed under the entry (CREDIT-PAY-131's backend PR has not merged; it is not on GitHub yet).
- Migration 20270405000000_coach_ai_budget_exact_usage is newer than every migration on main (newest 20270404000000_recipe_declared_allergens); b#870, b#872 and b#855 add none.

## B list
- B1 (builder CREDIT-METER-130, seen in a test; CREDIT-REFILL-130 B2): per-call rounding on five debit paths; fixed in b#874 (unchanged by the finisher). Line refs re-checked on main f0cd518a.

## U list
- U3 (seen in a test; NOT reachable, no src change): the gateway's 5-cent no-counts debit, src/ai/gateway/ai-gateway.service.ts:708-710. Only caller :381 under `response.enabled && ... && !errorMsg` (:374-379); the registry gives only the stub or the Anthropic adapter (providers/provider-registry.ts:23-29); stub `enabled: false` (stub-provider.adapter.ts:28), Anthropic engine-off `enabled: false` (anthropic-provider.adapter.ts:34); the only `enabled: true` return (anthropic-provider.adapter.ts:63-65) always carries both counts, typed `number` (src/ai/adapters/anthropic.adapter.ts:48-49), `?? 0` when usage is missing (:132-133); a failed call throws (:171) and the gateway answers from the stub (:347, :351). New pin test "CREDIT-METER-130 U3" (test/ai-credits-exact-metering.spec.ts). Mutation check: removing anthropic-provider.adapter.ts:64-65 makes it debit 5,000,000 micro-cents and the test fails.

## C one-liners
- C1: after 3 lost races plus a lost remainder retry, a debit is dropped (coach-favourable, logged). C (edge, deferred to 10k clients).
- C2: `COACH_AI_BUDGET_RACE_OVERSHOOT` is logged for both a true refusal and an exhausted retry. C.

## PRs
- growth-project-backend#874 `fix(ai-credits): debit the exact AI cost and round once per period (CREDIT-METER-130, T4)`, head fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a. Commits: f57bcfab failing-first test, 9216885a fix + migration (builder), 5929ad80 merge origin/main f0cd518a, fbab7f99 U3 pin test (finisher). 15 files +553 / -73 = 626 lines. CI green. Verdicts: none yet (Opus and Sol needed at this head).
- Body: /home/user/workspace/ops/reports/CREDIT-METER-FIN-131-pr-body.md (builder's original: CREDIT-METER-FIN-131-pr-body.orig.md). READY comment text: CREDIT-METER-FIN-131-ready-comment.md.
- Local runs at fbab7f99 (heavy.sh, one file each): exact-metering 14/14, ai-guide-coach-pool 6/6, roman-c2-pool 4/4, roman-rmn2-fixes 6/6, ai-credits-stream1 30 + 4 pre-existing skips, r11-seams 22/22, roman-launch-hardening 60/60, coach-ai-metering 23/23, ai-credits-gateway-402 2/2, ai-credits-round1-fixes 15/15, ai-gateway.service 17/17, roman.prompts 20/20. eslint on the changed test clean.

## Not fixed (needs operator)
1. Deploy: b#874 must deploy with **migrations=apply-migrations** (said loudly in the body and READY). Default: operator deploys it that way, never with migrations skipped.
2. Merge-main round owed after b#870 (merge order b#870 before b#874): `git merge-tree` vs b#870 @ 58490669 (and 7be96721) = ONE textual conflict in src/ai-credits/coach-ai-budget.service.ts, both PRs add module-level helpers after `toSnapshot`; resolution: keep both (`exactUsedMicroCents` and `packSpentAtClose` / `packCreditLeft`); the rollover auto-merges with `actual_used_micro_cents: 0` and b#870's pinned `where`. Then re-run test/ai-credits-exact-metering.spec.ts and test/ai-credits-rollover-pack-carry.spec.ts. Same after CREDIT-PAY-131's backend PR if it merges first (pool-empty strings, other lines). b#872: merge-tree clean. Default: FIX-OPUS-131 does it after b#870 merges, then a FIX ROUND 2 READY.

## Proposed (needs operator)
- None. Default: nothing further.

## HANDOFF
State: DONE. READY posted at 21:07:49 PDT on b#874 @ fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a; CI green there; worktree clean and pushed.
- Branch agent130/credit-meter-130, worktree /home/user/workspace/wt/CREDIT-METER-FIN-131-backend.
- Next for anyone: the two lens verdicts at fbab7f99. If b#870 merges first: `git merge origin/main` in this worktree (no rebase, no stash), resolve the one helper-adjacency hunk by keeping both sides, run the two specs above through heavy.sh, push, CI green, post `FIX ROUND 2 (CREDIT-METER-FIN-131, agent 131, <your ID>) — growth-project-backend#874 @ <sha> — READY FOR AUDIT`.
- Deploy (operator only): migrations=apply-migrations.

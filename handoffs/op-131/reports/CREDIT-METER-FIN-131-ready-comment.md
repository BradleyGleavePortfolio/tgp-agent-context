FIX ROUND 1 (OPENING) (CREDIT-METER-FIN-131, agent 131) — growth-project-backend#874 @ fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a — READY FOR AUDIT

Finisher of CREDIT-METER-130 (builder stopped at 9216885a). T4 money + ADDITIVE MIGRATION. 626 changed lines (15 files, +553 / -73). CI green at this head (every check run success; deploy-readiness-gate skipped as on every PR run).

**DEPLOY NEEDS migrations=apply-migrations** (`20270405000000_coach_ai_budget_exact_usage`, additive, `down.sql`; newest on main is 20270404000000). Never deploy this head with migrations skipped: the code reads the new column.

Finisher changes since 9216885a:
- `git merge origin/main` at f0cd518a (b#873, roman.service.ts prompt-version lines only): merge commit 5929ad80, clean. Main has since moved to b72e2c45 (b#855: playbook flag declaration, runbook line, r11-seams flag test; no file shared with this PR); GitHub reports this PR clean against it, so no further merge-main is needed now.
- U3 (gateway flat 5-cent debit with no token counts, `ai-gateway.service.ts:708-710`): not reachable by any paid call, file:line proof in the body; new pin test "CREDIT-METER-130 U3" in test/ai-credits-exact-metering.spec.ts (real Anthropic provider adapter, 0 / 0 counts, 1-cent floor). Mutation check: dropping `anthropic-provider.adapter.ts:64-65` makes it debit 5 cents and the test fails. No src change.
- Spec 14/14 locally; the touched specs re-run at this head are listed in the body.

Merge-main rounds owed (shared files):
- b#870 (merge order: b#870 before b#874): `git merge-tree` against b#870 @ 58490669 (and 7be96721) gives ONE textual conflict in `src/ai-credits/coach-ai-budget.service.ts`: both add module-level helpers after `toSnapshot`; keep both. The rollover auto-merges with `actual_used_micro_cents: 0`.
- CREDIT-PAY-131's backend PR (ai.service.ts, ai-gateway.service.ts): not open yet; this PR takes a merge-main round after it if it merges first.
- b#872: merge-tree clean.

agent 131

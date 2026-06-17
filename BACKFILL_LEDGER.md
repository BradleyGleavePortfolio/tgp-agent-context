
## 2026-06-16 — PR #401 LOC cap waiver (pre-rule grandfather)
- PR #401 (F2 Named Regimes + Partial Refund Decision) flagged P0 by Auditor A: 595 prod LOC > 400 cap.
- OPERATOR RULING: #401 was BUILT PRE the 400-LOC rule. Pre-rule PRs are grandfathered under a HARD LIMIT of 1000 prod LOC, refactored down later.
- 595 < 1000 → cap "P0" WAIVED, reclassified as tracked refactor item (see R82 issue). NOT a merge blocker.
- Real bugs from the same audit (P1 refund race, P2 idempotency, P2 revision-index lock, P2 banned `as unknown as` in test double) ARE being fixed by the Opus Fixer before merge.

## 2026-06-16 (cont.) — Phase 1.5 / stack merges landed
- W1.5-A4 #421 (RLS live-DB harness): dual re-audit BOTH CLEAN_NO_FINDINGS -> MERGED to wave-1-5-planning. wave-1-5-planning: 849ee474 -> 81d96dd6. Branch deleted. A5-A8 now have a reusable, proven-failable RLS harness.
- #401 (F2 Named Regimes + Partial Refund Decision): LOC P0 waived (pre-rule grandfather, issue #422). MERGED to main. main: 28c5f757 -> b6cb4cfb. feature/named-regimes branch deleted.
- #403 (fix/pr401 R81 cleanup, stacked): dual re-audit BOTH CLEAN_NO_FINDINGS on head 0709b02d. Folded all remaining #401 audit findings (decide() zero-row race throw, updateRegime FOR UPDATE lock, P2002-catch, typed prisma double via @ts-expect-error, column rename decided_by_coach_user_id). Base re-pointed to main; rebase onto b6cb4cfb in progress before final merge.
- Audit artifacts saved under audits/2026-06-16/.
- Infra note: a poisoned paused sandbox (019ed182...) repeatedly killed freshly-spawned subagents (6 deaths); filed system diagnostic; resolved by re-spawning in fresh isolated worktrees.

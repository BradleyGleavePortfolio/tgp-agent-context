
## 2026-06-16 — PR #401 LOC cap waiver (pre-rule grandfather)
- PR #401 (F2 Named Regimes + Partial Refund Decision) flagged P0 by Auditor A: 595 prod LOC > 400 cap.
- OPERATOR RULING: #401 was BUILT PRE the 400-LOC rule. Pre-rule PRs are grandfathered under a HARD LIMIT of 1000 prod LOC, refactored down later.
- 595 < 1000 → cap "P0" WAIVED, reclassified as tracked refactor item (see R82 issue). NOT a merge blocker.
- Real bugs from the same audit (P1 refund race, P2 idempotency, P2 revision-index lock, P2 banned `as unknown as` in test double) ARE being fixed by the Opus Fixer before merge.

FIX ROUND 1 (OPENING) (HABIT-ADD-GUARD-131, agent 131) — growth-project-mobile#548 @ ba855c3ef4e0115017d38a6c07051af0ef52ad9d — READY FOR AUDIT

B: none. U1 — seen in a test: a client presses Create habit again while the first request is saving and submits the same habit twice; failing-first reproduced two API calls ([initial CI evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37724677580/job/113140030144)).

Fix: `HabitsScreen.tsx:210-232` prevents an immediate repeat request and clears the guard on settlement; `AddHabitSheet.tsx:84-94` disables Create while saving, uses existing themed styling, and exposes its actual busy state ([PR #548 changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548)).

Acceptance: 22/22 habit/fasting, 20/20 truthful-copy guard, and 30/30 doctrine tests passed locally, one targeted file per `ops/heavy.sh` run; success resets the sheet, failure retains values and allows another attempt, and blank names remain blocked ([regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548)).

CI is green at this exact head; GitHub reports no merge conflict. Size: 91 changed lines (85 additions, 6 deletions), four files ([PR #548 checks and diff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548)).

Existing routes/actions retained; matching README and parity/truthful sweep updated. No backend, dependency, flag or production change ([PR #548](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548)).

agent 131

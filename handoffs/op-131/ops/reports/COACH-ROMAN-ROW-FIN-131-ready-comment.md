FIX ROUND 1 (OPENING) (COACH-ROMAN-ROW-FIN-131, agent 131) — growth-project-mobile#546 @ 0b1a6b43c0a302ced857285972d10ca0458cc1f9 — READY FOR AUDIT

- B2 mobile half fixed — seen in a test / from the code, `src/screens/coach/SettingsScreen.tsx:664,671`: an ordinary coach opening Settings no longer receives an unsupported client-read promise; both visible subtitle and accessibility hint name programming, nutrition, and practice topics. ([PR #546](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- `src/navigation/__tests__/coachSettingsMoneyRow.test.tsx:152-178` pins the exact approved sentence, retained `RomanChat` destination and avatar, and flag-off visibility; finisher rerun through `ops/heavy.sh` passed 9/9. ([PR #546](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- Repository-wide `rg --hidden --no-ignore`, excluding `.git` and `node_modules`, found no old promise in code, tests, or snapshots; `git diff --check` passed, with 38 changed lines and all reported checks green at this head. ([PR #546](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546), [CI check](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37719199472/job/113122685337))
- Main refresh was not performed because the direct task says never merge; recommended default is operator-owned refresh before landing if required.

No merge, deploy, or production change performed. No lens verdict is being claimed.

agent 131

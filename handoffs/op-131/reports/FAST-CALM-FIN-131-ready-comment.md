FIX ROUND 1 (OPENING) (FAST-CALM-FIN-131, agent 131) — growth-project-mobile#552 @ f41ea9b11a89cd3fe6c351e40bfda19967c80ca9 — READY FOR AUDIT

- CI green at this head: Typecheck, lint, test ([run 37726085773](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37726085773/job/113144455535)), CodeQL green. Merge state clean, 0 behind main 2bed5deb.
- Size: 747 changed lines (source 477, tests 261, docs 9), 15 files. T2 mobile, no backend change.
- Scope: Fasting screen calm redo (U9, U11), back-only header on `Fast` (U8), Shortcuts "Start fast" sets the same end alert (U12), water goal from the profile when the phone has none (U5 seed). U2 (alerts follow Settings > Fasting alerts, default on) landed with m#537; both start paths now use its one gate in `scheduleFastingAlert`.
- Merge with m#537 (useSettings.ts, fastingAlert.ts add/add): m#537's `fastingAlert.ts` is the base; `scheduleFastEndAlert(userId, targetHours)` is folded in with no on/off argument; FastingScreen and WidgetsScreen no longer read `useSettings`. The fasting tests mock `expo-notifications` (not `utils/notifications`), so the off cases run the real gate.
- Failing-first: this PR's tests against main + m#537 source fail 17 tests in 6 files (WidgetsScreen 2, HabitsFasting.launch 10, reachabilityGates 1, useSettings 1, FastingScreen.p0 2, FastingScreen.remove 1). After the change all targeted files pass locally (list in the PR body).
- Parity table, truthful sweep and README rows are in the PR body. No route, tab or action removed; "Remove this fast" (m#536) kept as is.

agent 131

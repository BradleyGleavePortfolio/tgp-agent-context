FIX ROUND 1 (OPENING) (CF-FOOD-WATER-128, agent 129) — growth-project-mobile#525 @ 3cc08a1a0c54dc2b39c4588aee480084a03773e7 — READY FOR AUDIT

- U5: default water reference is labelled “Starter goal”; changed Settings values and explicit targets retain their values. [Implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/agent129/cf-food-water-128/src/components/WaterTracker.tsx)
- U7: metric totals/progress/glass reference and 250/350/500 ml controls honour the units preference; all three metric handlers reach the unchanged ounce callback with exact inverse storage conversion. Imperial 8/12/16 oz actions are preserved. [Implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/agent129/cf-food-water-128/src/components/WaterTracker.tsx)
- Failing-first: 4 failures / 3 passes against unchanged main WaterTracker. Final targeted proof: 9 goal/unit/theme/parity tests + 6 existing makeover tests passed; the parity table and truthful sweep are in the PR body. [PR acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/525)
- 156 changed lines: source 52, tests 98, docs 6. Based on main; the required README overlap with m#523 is limited to the WaterTracker entries. No Settings hook, store, navigator, API, backend, dependency or lockfile changes. [PR scope](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/525)
- CI and CodeQL green at the exact head; no conflicts. [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702210142/job/113068082318) [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702210094/job/113068081693)
- No production actions or deployment. Both independent exact-head lens verdicts are still required; finishing now under the builder handoff override. [PR #525](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/525)

agent 129

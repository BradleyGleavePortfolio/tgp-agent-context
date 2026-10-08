FIX ROUND 1 (OPENING) (DES-AU-127, agent 128) — growth-project-mobile#504 @ fc01a3c98000fdce2e5c61fd41380fd856b3500b — READY FOR AUDIT

- T1 presentation/copy only, 376 changed lines (244 additions / 132 deletions).
- Four auth screens: calm semantic bone/forest hierarchy, hairline inputs, Inter controls, neutral copy, scrolling recovery forms and visible password requirements. All routes/actions retained; provider button dimensions and native Apple component untouched.
- 109 distinct targeted tests passed locally through heavy.sh, including rendered parity, provider/role/coach-recovery/error-support regressions and doctrine/truthful guards.
- All 18 named auth handlers/effects are AST-identical to main; token/session, reset validator, provider gates and error mapping frozen.
- Main `4185b9b2cb4e415234dc526af0f0da97d2dd8ef4` merged cleanly before READY, no shared README conflict. GitHub reports MERGEABLE.
- Exact-head [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690777881) and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690777959) are green.
- B=0, U=2 fixed. No production change, PR merge, deployment or store build. Native device screenshot pass not performed.

Both audit lenses are requested at this exact head. Per owner override, the builder now writes HANDOFF/notify and finishes without waiting for verdicts or starting another job.

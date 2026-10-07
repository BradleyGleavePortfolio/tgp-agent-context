FIX ROUND 3 (DES-V-127, agent 128) — growth-project-mobile#470 @ e0ba7662b752e0f60e4f26a33a281f3ae46d7110 — READY FOR AUDIT

Fixed B1 from both round-2 lenses: Profile no longer claims logs are visible “only to you.” A client without a coach sees no sharing sentence. With a normal linked coach, copy states which workout/meal scopes are shared or not shared with that coach. Confirmed owner-coach access retains “visible to you and <coach>” without excluding platform access; unknown access and focus-refresh suppression remain.

455 changed lines (+342/-113), including tests and the matching client README. [Exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681524974/job/112998506378) passed lint/typecheck and 679 suites / 8,935 tests; all [CodeQL checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681524798) passed.

[Failing-first CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680449505/job/112994799386) at tests-only `9ac9b873c67cb344c0d65dac55f743165a5942ef` passed lint/typecheck and failed exactly seven Profile regressions against the previous implementation; 678 other suites / 8,928 tests passed. Coverage includes unpaired, all four normal-coach sharing combinations, owner/unknown states and Profile→Settings→Profile.

Every existing route/action stays unchanged; no consent writes, permission policy, backend, dependency, lockfile, merge, deploy or production change. Local dependencies were unready, so validation used PR CI; no local test execution claimed.

FIX ROUND 1 (OPENING) (WORKOUT-CLAMP-131, agent 131) — growth-project-backend#876 @ 15db749298b1a0a4b63837adfe40653b81566b5e — READY FOR AUDIT

B1 — seen in a test — fixed at `src/workout/workout.dto.ts:29-30,86,208`: a client finishing a workout started the previous day no longer loses the save to duration validation; both write DTOs cap valid integer durations at 1440 while keeping the zero lower bound and integer/type checks. ([workout DTO](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/src/workout/workout.dto.ts))

Failing-first: 4 over-limit failures and 16 passes before the fix; all 20 targeted cases pass after it, including unchanged notes/exercises and retained optionality. ([regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))

CI is green at this head and GitHub reports MERGEABLE; the production-only deploy gate is skipped as expected for a PR. ([CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724658349/job/113139972747), [PR #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))

64 changed lines: 9 source, 55 tests; no schema, dependency, lockfile, flag, merge, deploy, or production change. ([PR #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))

agent 131

Tier: T2
Why: Bounded workout request normalization prevents a stale elapsed-time value from blocking a normal save. ([workout DTO](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/src/workout/workout.dto.ts))
T4 trigger scan: none; no auth, tenancy, privacy boundary, money, credentials, or destructive data change.
T3 trigger scan: none; one DTO module and one regression spec, without architectural changes.
Bounded T1: NO; incoming duration values change before validation.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 131
Acceptance evidence: production-style ValidationPipe spec failed first in four over-limit cases; all 20 cases now pass locally. ([regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))
Promotion triggers: schema changes, ownership/auth changes, privacy-boundary changes, money, or destructive storage behavior.

## What changes for coaches/clients
Create and update workout requests cap integer durations above 1440 minutes instead of rejecting the workout; this also accepts the same over-limit payload when an existing phone queue uploads it. ([workout DTO](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/src/workout/workout.dto.ts))

The cap is inbound-only, and integer validation, the zero lower bound, optionality, notes, and exercises remain intact. ([workout DTO](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/src/workout/workout.dto.ts), [regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))

## B/U list
- B1 — **seen in a test**: a client finishes a workout started the previous day, and the duration above 1440 minutes causes a validation error instead of a saved workout; fixed at `src/workout/workout.dto.ts:29-30,86,208` by the shared cap. ([workout DTO](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/src/workout/workout.dto.ts), [regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))
- U: none in the assigned scope.

## Test plan
Command: `/home/user/workspace/ops/heavy.sh npx jest test/workout-duration-clamp.spec.ts --runInBand`.

- Before the fix: 4 failed, 16 passed; both DTOs rejected 1441 and 2880 minutes.
- After the fix: 20 passed.
- Cases: cap over-limit integer minutes, preserve 0/45/1440, keep duration optional, preserve notes/exercises, and retain negative/fractional/string rejection. ([regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))
- Backend request validation was tested; the offline phone-disappearance symptom was not exercised end to end.
- Full lint/type-check/build/test proof is left to PR CI, not a full local run.

## Linked plan / brief
WORKOUT-CLAMP-131, group C2 in `handoffs/op-129/FIX_PLANS_130_131.md`; verified agent 131 recon references both duration fields.

## Rollback plan
Revert this commit through a reviewed PR; no migration, dependency, lockfile, flag, or production change is included.

## Audit pack pointer
Private operator report: `ops/reports/WORKOUT-CLAMP-131.md`, with failing-first and passing logs.

## R-rule self-check
- [x] R23 LOC cap: 64 changed lines, 63 additions and 1 deletion; source 9, tests 55.
- [x] R18 lane scope: workout duration DTO cap and one spec only.
- [ ] R100 prod-readiness / deploy-readiness board: PR CI pending; no deploy was requested or performed.
- [x] R75 banned casts: no new forbidden casts, suppression directives, or empty catch.
- [x] R74 test:src ratio: 55 test additions / 8 source additions = 6.875.
- [x] R92 RLS impact: no policy or access-control change.
- [x] R98 PII: no customer records, identifiers, or privacy-boundary change; test data is synthetic.
- [x] R82/R106 migration safety: N/A, no migration.
- [x] R83 feature flag: N/A, bounded correction to existing DTO validation.
- [x] R86 SLO: N/A, no new endpoint.
- [x] R90 idempotency: N/A, no endpoint or mutation semantics change beyond duration normalization.
- [x] R3 commit identity: required author and committer, no co-author trailer.
- [x] R6 push cadence: completed work batched into one push under the agent 131 override.
- [ ] R14 audit cycle: both exact-head lenses required; operator merges only.

## Dependencies
None; main was fetched and has no intervening change to `src/workout/workout.dto.ts`.

agent 131

# LN-SOL-D-131 — independent Sol lens

Operator: agent 131.

Operator wind-down notice: stop rules arrive at 21:50 PDT; finish the review in hand and PRs already READY, then end around 22:10.

## Proven B1 — backend #874

- **Seen in a test:** `src/ai/gateway/ai-gateway.service.ts:383-388` ignores `recorded: false`; `:283-284` admits any positive remaining credit, and `src/ai-credits/coach-ai-budget.service.ts:256-260` refuses a debit larger than the remainder without changing usage. ([Reviewed metering path](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- **Normal-user story:** a coach reaches the last cent of AI credit and keeps tapping Ask AI; paid answers continue without consuming the remainder or reaching the exhausted-pool stop. ([Ask AI and gateway path](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- **Reproduction:** three sequential live `draft.create_workout_plan` explanation requests, each reporting 6000 input/400 output tokens (1.6 cents), all succeeded with a 3999/4000-cent pool; all three reached the mocked provider and both usage columns remained unchanged. ([Reviewed metering implementation](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- **Smallest fix:** consume available credit when `recordUsage` returns `recorded: false`, following `CoachAIService.recordSpend` at `src/ai/coach/coach-ai.service.ts:131-142`, and assert the next sequential call returns 402 without another provider call. ([Existing remainder pattern](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- This is a pre-existing normal-use money blocker on the PR's touched metering path, not a race or unusual-input issue. ([Reviewed path](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Evidence: `/home/user/workspace/ops/recon/LN-SOL-D-131/b874-gateway-remainder-repro.log`; source-unchanged local probe: `/home/user/workspace/ops/recon/LN-SOL-D-131/b874-exact/test/ln-sol-d-131-gateway-remainder.spec.ts`, `LN-SOL-D-131 B1` case at lines 316 onward.

## Scope traced

- Standing queue: newest READY head lacking a Sol verdict, with mobile priority; no Claude Opus verdict body at a current head has been read.
- Mobile #537 was skipped without claiming: LN-SOL-E-131 had already posted APPROVE at `abb296689f21ba7a7dbecb514e404e932ad40044`. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051775887))
- Backend #872 was skipped without claiming: LN-SOL-A-131 already owned `1509818e765c882721118bf1023c85d1a17b1bfd`. ([Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051770878))
- Backend #855 was skipped without claiming: LN-SOL-B-131 already owned `015b8d6ca226374b2b914d2d316146cbec33b50a`. ([Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/855#issuecomment-6051758113))
- Backend #876 is now claimed at `15db749298b1a0a4b63837adfe40653b81566b5e`: the independent review covers inbound workout duration normalization and its create/update ValidationPipe regression spec. ([This lens's claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6051958889), [PR #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- Backend #876 APPROVE was posted after a fresh unchanged-head check; backend #874 is now claimed at `fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a` for independent T4 exact AI-cost metering and additive-migration review. ([Posted #876 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026), [This lens's #874 claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052019422))
- Sanitized GitHub responses, excluding Claude Opus verdict bodies, are saved under `/home/user/workspace/ops/recon/LN-SOL-D-131/`.
- From the code: `src/main.ts:96-103` enables the same transformation and allow-list options as the regression spec; `src/workout/workout.controller.ts:23-25,40-46` binds create and update requests to the changed DTOs, and the service persists their already-normalized duration without changed guards or ownership. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- Seen in a test: independent exact-head `heavy.sh npx jest test/workout-duration-clamp.spec.ts --runInBand` passes 20/20; the new DTO transforms preserve notes/exercises, ordinary durations and optionality while accepting capped stale integer values. ([Regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))
- Test log: `/home/user/workspace/ops/recon/LN-SOL-D-131/b876-duration-test.log`; exact-head snapshot: `/home/user/workspace/ops/recon/LN-SOL-D-131/b876-exact/`; no phone end-to-end reproduction is claimed.
- Backend #874 independent source-unchanged snapshot runs pass exact-metering 14/14, stream1 30 passed/4 existing skips, and coach-ai-metering 23/23; the additional local ordinary near-empty-pool probe establishes B1. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Initial `test/coach-ai-metering.spec.ts` invocation found no tests because the file is under `test/ai/`; the corrected path passed 23/23, with both logs retained.
- Migration review: `20270405000000_coach_ai_budget_exact_usage/migration.sql:19-24` adds only the defaulted BIGINT column; `schema.prisma:6229-6234` matches it, and public/admin budget responses explicitly omit the raw BIGINT. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))

## B list

- None in reviewed backend #876; review conclusion B=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- B1 in backend #874: proven unmetered sequential Ask AI calls at a nearly exhausted pool; see top-of-report finding and evidence. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))

## U list

- None in reviewed backend #876; review conclusion U=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- None in reviewed backend #874; U=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))

## C one-liners

- None added.

## PRs

| PR | Exact head | Lines | CI | This lens |
|---|---|---:|---|---|
| [backend #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876) | `15db749298b1a0a4b63837adfe40653b81566b5e` | 64 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724658349/job/113139972747) | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026) |
| [backend #874](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874) | `fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a` | 626 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724845738/job/113140557088) | REQUEST CHANGES drafted; fresh head check and posting next |

## Not fixed (needs operator)

- B1: route the small gateway remainder fix to the T4 Opus FIX lane; obtain both new-head verdicts after the fix. ([Affected PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Operational prerequisites already declared by the builder: refresh after backend #870 lands, then re-audit the changed head; any deployment containing #874 must apply its additive migration. ([PR dependencies and migration warning](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))

## Proposed (needs operator)

- None.

## HANDOFF

- Backend #876 review is complete and APPROVE posted; verdict text remains in `/home/user/workspace/ops/reports/LN-SOL-D-131-b876-verdict.txt`. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026))
- Backend #874 review is complete with B1, U=0; REQUEST CHANGES is saved in `/home/user/workspace/ops/reports/LN-SOL-D-131-b874-verdict.txt`, pending fresh head check and posting.
- After posting, return to the standing newest-READY queue with mobile priority.
- No repository edits, worktree creation, merges, deployments, or production changes.

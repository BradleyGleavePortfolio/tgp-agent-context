# LN-SOL-D-131 — independent Sol lens

Operator: agent 131.

Operator wind-down received at 21:50 PDT: all reviews in hand are complete; no unclaimed READY-at-cutoff head still needs this Sol lens. No new work will start.

Cumulative findings: B=1, U=1. The B was fixed in backend #874's follow-up head, which the operator has since merged; the optional mobile U remains. ([Fixed B and READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052376868), [Mobile U verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692))

## Proven B1 — backend #874

- Status: FIX-OPUS-131 posted round-2 READY at `24c6c1976a54189f30030e8f6b5a1a2f219184f6`, declaring the remainder fix and a regression that blocks the second sequential provider call; LN-SOL-A-131 reviewed that head, so this lens did not duplicate it or issue a new-head verdict. The 21:50 board shows dual APPROVE, and the operator's fleet records the PR merged at 21:51; this B is historical, not a request to hold the fixed head. ([Fix READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052376868), [New-head Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052409933), [Affected PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
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
- Backend #876 was claimed at `15db749298b1a0a4b63837adfe40653b81566b5e`: the independent review covered inbound workout duration normalization and its create/update ValidationPipe regression spec. ([This lens's claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6051958889), [PR #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- Backend #876 APPROVE was posted after a fresh unchanged-head check; backend #874 was then claimed at `fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a` for independent T4 exact AI-cost metering and additive-migration review. ([Posted #876 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026), [This lens's #874 claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052019422))
- Sanitized GitHub responses, excluding Claude Opus verdict bodies, are saved under `/home/user/workspace/ops/recon/LN-SOL-D-131/`.
- From the code: `src/main.ts:96-103` enables the same transformation and allow-list options as the regression spec; `src/workout/workout.controller.ts:23-25,40-46` binds create and update requests to the changed DTOs, and the service persists their already-normalized duration without changed guards or ownership. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- Seen in a test: independent exact-head `heavy.sh npx jest test/workout-duration-clamp.spec.ts --runInBand` passes 20/20; the new DTO transforms preserve notes/exercises, ordinary durations and optionality while accepting capped stale integer values. ([Regression spec](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/15db749298b1a0a4b63837adfe40653b81566b5e/test/workout-duration-clamp.spec.ts))
- Test log: `/home/user/workspace/ops/recon/LN-SOL-D-131/b876-duration-test.log`; exact-head snapshot: `/home/user/workspace/ops/recon/LN-SOL-D-131/b876-exact/`; no phone end-to-end reproduction is claimed.
- Backend #874 independent source-unchanged snapshot runs pass exact-metering 14/14, stream1 30 passed/4 existing skips, and coach-ai-metering 23/23; the additional local ordinary near-empty-pool probe establishes B1. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Initial `test/coach-ai-metering.spec.ts` invocation found no tests because the file is under `test/ai/`; the corrected path passed 23/23, with both logs retained.
- Migration review: `20270405000000_coach_ai_budget_exact_usage/migration.sql:19-24` adds only the defaulted BIGINT column; `schema.prisma:6229-6234` matches it, and public/admin budget responses explicitly omit the raw BIGINT. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Mobile #551 review is complete at `ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b`; traced credit-pack entry points, the isolated iOS US-link gate, Safari handoff, exact success/cancel parser, budget invalidation, purchase input mapping and current-production backend DTO/controller/Stripe session builder. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551))
- Seen in independent exact-head tests: external-link 6/6, US purchase gates 14/14, success receipt 4/4, non-P2P surfaces matrix 181/181; all ran through `heavy.sh` one file at a time. ([Reviewed tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551))
- Mobile evidence: `/home/user/workspace/ops/recon/LN-SOL-D-131/m551-{external-link,us-purchase-gates,success-receipt,surfaces-matrix}-test.log`; source-unchanged snapshot `/home/user/workspace/ops/recon/LN-SOL-D-131/m551-exact/`.
- Apple explicitly exempts United States storefront apps from the external-purchase-link prohibition; Stripe's iOS Checkout guidance describes browser checkout, webhook-based fulfillment and universal-link returns with a fallback. ([Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/), [Stripe iOS Checkout guidance](https://docs.stripe.com/mobile/digital-goods/checkout))
- A fresh GitHub read identified an operator comment recording owner YES at 20:54 PDT and lifting #551's decision-10 hold; the original builder hold is no longer current. ([Owner decision](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052294493))
- Mobile #555 and #554 were skipped without claiming after the board showed READY: fresh checks found LN-SOL-B-131 already on #555's `042bb82dd9450b8a337170d7a043c313be293a41` and LN-SOL-A-131 already on #554's `da05524f07dcca64465e50634d62478e4887a1fe`. ([#555 Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/555#issuecomment-6052369363), [#554 Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052365045))

## B list

- None in reviewed backend #876; review conclusion B=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- B1 in backend #874: proven unmetered sequential Ask AI calls at a nearly exhausted pool; see top-of-report finding and evidence. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- None in reviewed mobile #551; B=0, with no live payment or phone end-to-end proof claimed. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692))

## U list

- None in reviewed backend #876; review conclusion U=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876))
- None in reviewed backend #874; U=0. ([Reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- U1 — from the code, mobile #551: `AIBudgetMount.tsx:110-118,164-166` supplies `preselect`, but `CreditPackCheckoutScreen.tsx:144-153` never reads it; an ordinary coach selects the $25 pack on the pause sheet and must select it again on checkout. Smallest fix: start the selected numeric pack on mount, retaining normal selection otherwise. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692))

## C one-liners

- Mobile #551: universal-link return with a fallback is Stripe's recommended setup; the reviewed implementation uses the app's custom scheme. ([Stripe iOS Checkout guidance](https://docs.stripe.com/mobile/digital-goods/checkout))

## PRs

| PR | Exact head | Lines | CI | This lens |
|---|---|---:|---|---|
| [backend #876](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876) | `15db749298b1a0a4b63837adfe40653b81566b5e` | 64 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724658349/job/113139972747) | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026) |
| [backend #874 original review](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874) | `fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a` | 626 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37724845738/job/113140557088) | [REQUEST CHANGES posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052093659) |
| [backend #874 fix head](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874) | `24c6c1976a54189f30030e8f6b5a1a2f219184f6` | 696 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37727776083/job/113149762709) | [LN-SOL-A-131 reviewed](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052409933); dual approved per cutoff board, merged per operator fleet; no duplicate review |
| [mobile #551](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551) | `ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b` | 786 | [Green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37726946556/job/113147177085) | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692); U1 recorded |

## Not fixed (needs operator)

1. Backend #874 deployment must apply its additive migration; the operator fleet says deploy 35 was queued with `apply-migrations`, but this lens has not verified the completed deployment. The builder's earlier “refresh #874 after #870” order is superseded by the operator merging #874 first: future #870/main integration must retain both exact-usage and pack helpers. Default: operator/agent 132 checks that deployment and the shared-file integration, rather than reopening a merged PR. ([Migration and shared-file prerequisites](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
2. Mobile #551 U1 is not fixed in this lens. Default: defer the small preselect fix to an agent 132 follow-up; it does not block this approval. ([Finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692))
3. Submission/operations for mobile #551: agent 132 must retain US-only App Store availability and external-link App Review notes, and confirm the declared live credit-pack webhook event subscriptions; this lens did not change or verify live Stripe configuration. Default: verify those prerequisites before shipping the switched-on build. ([Operator submission instructions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052294493), [Declared webhook prerequisite](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551))

## Proposed (needs operator)

- None.

## HANDOFF

- Backend #876 review is complete and APPROVE posted; verdict text remains in `/home/user/workspace/ops/reports/LN-SOL-D-131-b876-verdict.txt`. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/876#issuecomment-6052015026))
- Backend #874 review is complete with B1, U=0; REQUEST CHANGES was posted after a fresh unchanged-head check, with the full text retained in `/home/user/workspace/ops/reports/LN-SOL-D-131-b874-verdict.txt`. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052093659))
- Backend #874's fixed head is CI-green and dual approved per the cutoff board, and merged per the operator's fleet; this lens's REQUEST CHANGES applies only to the original head, not the fixed one. Its new-head Sol review belonged to LN-SOL-A-131. ([Fix READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052376868), [New-head claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052409933), [PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874))
- Mobile #542 was skipped without claiming because LN-SOL-E-131 already owned the READY head. ([Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/542#issuecomment-6052090538))
- Mobile #551 review is complete with APPROVE, B=0/U=1; verdict text is `/home/user/workspace/ops/reports/LN-SOL-D-131-m551-verdict.txt`. Owner decision 10 has been approved, but the submission and live-webhook prerequisites above remain. ([Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052374692), [Owner decision](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052294493))
- Wind-down complete: no review in hand remains, and every head already READY by 21:50 either has a Sol verdict or was owned by another Sol lens. The 21:50 cutoff board is retained at `/home/user/workspace/ops/recon/LN-SOL-D-131/board-winddown-cutoff.md`; no new READY head was claimed after the stop order.
- Final notify: `/home/user/workspace/ops/lanes131/notify/LN-SOL-D-131.txt`; cumulative B=1/U=1, with three operator follow-up categories above.
- No branch/source work exists to push; all three verdicts are already posted and their complete text, independent snapshots, test logs and findings remain in this workspace.
- No repository edits, worktree creation, merges, deployments, or production changes.

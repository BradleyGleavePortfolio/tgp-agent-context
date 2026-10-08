# LN-SOL-A-130 — Sol reviewer A

Operator: agent 130.

## Scope traced

- Read the complete common brief, only the LN-SOL-130 job entry, the required Source of Truth sections, and the referenced owner decisions; this lane takes the oldest eligible READY head without a Sol verdict. [Common brief](/home/user/workspace/ops/lanes130/_COMMON_130.md), [LN-SOL-130 brief](/home/user/workspace/ops/lanes130/JOBS130.md), [Source of Truth](/home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md), [owner decisions](/home/user/workspace/tgp-agent-context/handoffs/op-128/HANDOFF.md).
- Initial board read had no unclaimed READY head requiring its first Sol verdict; yielded b#861, m#533, and m#534 to other current-head Sol claims, then claimed the oldest available READY m#513 fix round. [PR board](/home/user/workspace/ops/board/board.md).
- m#513 delta review: both tutorial variants, the previous Sol finding, unchanged coach-pool/digest path, source archiving, and the added copy assertions; current-head Opus verdict body unread. [Previous Sol finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048719105).
- b#868 full review: recipe list/saved/detail/save, Prep guide ingredients, caller-only profile lookup, author declaration validation, unchanged tenancy/guards, export coverage, additive migration and restore-test change; current-head Opus verdict body unread. [PR scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868).
- b#871 full review: six payment-push variants, LEGACY/snapshot parity, dispatcher payload, dispute exclusion, existing mobile routing fallback and card-payment path; current-head Opus verdict body unread. [PR scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871).
- m#524 delta review from prior Sol-approved `c397b2a4`: the additional assignment Start flag, retained Home flags/payloads, actual-screen mounted regression and modified route assertions; current-head Opus verdict body unread. [Previous Sol approval](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050498798), [current READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237).
- Review only: no worktree, source edits, merges, deployment, or production writes.

## B list

None established.

## U list

None established.

## C one-liners

- C1 — from the code: unchanged ROMAN_V2 dunning strings retain retry claims behind the separate flag; recommended default is to leave that flag off until its copy follow-up is reviewed. [Voice constants](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fa38982ea9ef8ba7b796142e869ce03caa838998/src%2Froman%2Fvoice%2Fvoice-policy.constants.ts), [documented excluded scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871).

## PRs

- b#861 — `c3f69a8ad87d55473611893963fc74ebacc359c0`, 165 changed lines: read the READY explanation, prior Sol finding, and local fix delta, then yielded to the other current-head Sol claims; no claim or verdict posted. [PR and READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/861#issuecomment-6050225358).
- m#513 — `f82b46544c4a9c6b37becea5e4b8b10f84fd27b3`, 37 changed lines, 2 files: **Sol APPROVE posted**; exact GitHub head rechecked, all four checks successful, mergeable; no open B/U/C. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6050524387), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37713230037/job/113103741606).
- b#868 — `a2caccf1e1be613720c2bbf8ad29b71f6f36277b`, 821 changed lines, 14 files: **Sol APPROVE posted**; exact GitHub head rechecked, 18 checks successful/one skipped, mergeable; no open B/U/C. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868#issuecomment-6050616344), [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37713332649/job/113104060925), [schema parity](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37713332761/job/113104061090).
- b#871 — `fa38982ea9ef8ba7b796142e869ce03caa838998`, 160 counted changed lines (166 raw including 6 snapshot lines), 6 files: **Sol APPROVE posted**; exact GitHub head rechecked, 15 checks successful/one skipped, mergeable; B=0/U=0/C=1; owner's permission remains a separate merge hold. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871#issuecomment-6050727206), [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37714455472/job/113107634593), [owner hold](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871#issuecomment-6050633941).
- m#524 — `fa5e66fad4ed82549719b61ed02b34866484ed21`, 291 changed lines, 8 files: **Sol APPROVE posted**; exact GitHub head rechecked, all four checks successful, GitHub mergeability UNKNOWN at posting; no open B/U/C. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050796165), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37715566730/job/113111123086).

### m#513 acceptance evidence

- Seen in a test: the actual AST-selected `getCards` function and learning-copy constant reject the prior addition-only copy in both modes; at this head, all 12 card/copy assertions pass. This is an isolated actual-code probe, not a full native UI render. [Probe](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/m513-copy-check.cjs), [test log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/m513-copy-check.log).
- From the code: `AIBudgetTutorialModal.tsx:84` now describes changed learning sources rather than only additions, covering the previous archived-template finding without changing handlers or permissions. [Current tutorial](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/f82b46544c4a9c6b37becea5e4b8b10f84fd27b3/src%2Fcomponents%2Fcoach%2Fai-budget%2FAIBudgetTutorialModal.tsx), [previous finding and smallest fix](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048719105).

### b#868 acceptance evidence

- Seen in a test: the targeted actual-head Jest file passes 39/39 in an isolated evidence fixture; baseline `d6065661` plus the new lookup file/test gives 11 failures and 28 passes, independently confirming the filtering/declaration failures on main. [Head log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b868/head-tests.log), [baseline log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b868/baseline-tests.log), [isolated runner](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b868/jest.review.config.cjs).
- Seen in a test: matching coach recipes are excluded from list, saved list, direct detail/save and Prep guide ingredients; own recipes remain available, undeclared empty lists remain visible, and another tenant's recipe remains a plain 404. [Head test log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b868/head-tests.log).
- From the code: `allergens.ts:105-108` reads only the caller's profile, and `recipe-access.ts:113-121` applies the negative allergen predicate only to the existing shared-coach branch, without widening tenancy. [Profile lookup](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/a2caccf1e1be613720c2bbf8ad29b71f6f36277b/src%2Frecipes%2Fallergens.ts), [access predicate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/a2caccf1e1be613720c2bbf8ad29b71f6f36277b/src%2Frecipes%2Frecipe-access.ts).
- Deployment prerequisite, not an open finding: migration `20270404000000_recipe_declared_allergens` adds both required columns; the operator must deploy this code with `migrations=apply-migrations` before releasing its dependent mobile change. Recommended default: apply the named additive migration as documented in the PR. [Migration](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/a2caccf1e1be613720c2bbf8ad29b71f6f36277b/prisma%2Fmigrations%2F20270404000000_recipe_declared_allergens%2Fmigration.sql), [deployment instructions](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868).

### b#871 acceptance evidence

- Seen in a test: targeted actual-head renderer/classifier/dispatcher Jest passes 11/11; exact-base `4c3df677` with the new test has 10 failures/one pass, including the unchanged dispute guard. Outbound provider-class imports are metadata-only stubs; the actual test injects transport/telemetry doubles, and no provider or production call runs. [Head log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b871/head-tests.log), [baseline log](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b871/baseline-tests.log), [runner](/home/user/workspace/ops/review-evidence/LN-SOL-A-130/b871/jest.review.config.cjs).
- Seen in a test: both Day 0/1/3 variants have no retry-count/promise or first-person phrasing; all four payment steps include the UpdateCard action, while dispute pushes omit it. [Actual test](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fa38982ea9ef8ba7b796142e869ce03caa838998/test%2Fdunning-v2-push-truth.spec.ts).
- From the code: `dunning-v2.dispatcher.ts:223-226` adds only push data; charge timing, entitlements, dispute handling and cadence remain unchanged. [Dispatcher](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/fa38982ea9ef8ba7b796142e869ce03caa838998/src%2Fcheckout%2Fdunning-v2%2Fdunning-v2.dispatcher.ts).

### m#524 acceptance evidence

- From the code: `WorkoutAssignmentDetailScreen.tsx:142` now passes `initial: false` on its existing cross-tab Start call, preserving the Train root without changing the assignment/name/exercise payload; the earlier Home flags at `HomeScreen.tsx:322,333` remain. [Assignment Start](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/fa5e66fad4ed82549719b61ed02b34866484ed21/src%2Fscreens%2Fclient%2FWorkoutAssignmentDetailScreen.tsx).
- From the code: `homeWorkoutEntry130.test.tsx:151-169` retains the actual assignment screen and asserts Home Start → assignment Start → Leave → Train ends on `WorkoutMain`; the earlier Resume and Back paths remain covered. No local or device execution is claimed for this PR. [Mounted regression](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/fa5e66fad4ed82549719b61ed02b34866484ed21/src%2Fnavigation%2F__tests__%2FhomeWorkoutEntry130.test.tsx).

## Not fixed (needs operator)

- O1 — b#871's previously locked Day 0/1/3 copy requires the owner's yes before merge; code approval does not release that hold. Recommended default: approve the truthful replacement, but do not merge until the owner's authorization is recorded. [READY owner hold](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871#issuecomment-6050633941).

## Proposed (needs operator)

- C1 above: keep FEATURE_ROMAN_COPY_V2 off pending a separate truthful-copy follow-up; no implementation in this lane. [Excluded scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871).

## HANDOFF

Status: active; m#513, b#868, b#871 and m#524 Sol APPROVE posted at their exact heads; no open B/U.

Next action: resume the oldest eligible unclaimed READY queue. Hold b#871 for the owner's yes; deploy b#868 with its documented migration; recheck m#524's mergeability before merging. This lane has not merged, deployed, or written production data.

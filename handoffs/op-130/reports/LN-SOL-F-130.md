# LN-SOL-F-130 — Sol reviewer F

Operator: agent 130.

## Open blocker — b#870

**B-870-SOL-F-130-1 — seen in a test.** `src/ai-credits/coach-ai-budget.service.ts:530-531` now removes consumed pack credit at rollover, but `refundPack:458-464` still removes the original purchase's full credit again; a partly consumed $25 pack leaves 500 actual / 1562 displayed cents after rollover, then refunding its original credit attempts -300 actual / -938 displayed and violates the existing non-negative database constraint ([reviewed PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870), [existing constraint](/home/user/workspace/wt/RO-backend/prisma/migrations/20260528120000_stream1_round1_fixes/migration.sql)).

Ordinary-user story: a coach receives a refund for a partly used prior-month pack, but the owner cannot reverse its remaining credits because rollover already removed usage and refundPack subtracts the original full credit again ([refund endpoint](/home/user/workspace/wt/RO-backend/src/ai-credits/admin-coach-ai.controller.ts)).

Smallest fix: make refund accounting remove only the named pack's residual credit, without subtracting consumed credit twice or removing another pack's credit; carry residual/consumed attribution into refund handling and add the rollover-then-refund regression ([affected service](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870)).

Proof: actual base `4c3df677` methods complete the same refund, actual head methods fail partial/full-spent pack refunds, and the unused-pack control succeeds; the isolated Prisma double enforces the existing SQL check, with no PostgreSQL connection or Stripe call ([probe log](/home/user/workspace/ops/reports/LN-SOL-F-130-b870-rollover-refund-probe.log)).
Evidence and exact base/head source snapshots are in `/home/user/workspace/ops/review-evidence/LN-SOL-F-130/b870/`; one targeted runner executed through `ops/heavy.sh`, no repository change.

## Scope traced

- Read the [common brief](/home/user/workspace/ops/lanes130/_COMMON_130.md) in full and only the LN-SOL-130 entry in the [job file](/home/user/workspace/ops/lanes130/JOBS130.md).
- Queue policy: newest eligible READY first, with HEALTH-STRINGS-130, SESSION-KEEP-130, FOOD-GATE-RETRY-130 and MONEY-INBOX-130 taking priority under the [common brief](/home/user/workspace/ops/lanes130/_COMMON_130.md).
- No worktree, source edits, production changes, merges or deployments.

## B list

B-870-SOL-F-130-1 open; see blocker above ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870)).

No new B identified in the b#861 fix delta; the earlier Sol finding's exact Yesterday forms now select past-day facts before the comparison fallback ([changed guardrail](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3f69a8ad87d55473611893963fc74ebacc359c0/src/roman/guardrails/roman-post-check.ts#L486-L507)).

## U list

None identified in the b#861 fix delta ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/861)).

No B or U identified in m#533's read-only 60-line review ([approval](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533#issuecomment-6050441246)).

No B or U identified in the b#869 full money-route review ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869)).

## C one-liners

None.

## PRs

### b#861 — concurrent claim; no verdict posted

- Head `c3f69a8ad87d55473611893963fc74ebacc359c0`, 165 changed lines, CI green, merge state CLEAN ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/861)).
- [Claim posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/861#issuecomment-6050281992), with current-head Opus verdict bodies excluded from the comment read.
- The next [board refresh](/home/user/workspace/ops/board/board.md) showed LN-SOL-D-130 already claiming the same head ahead of this instance, and LN-SOL-G-130 also claiming it; yield further work to the earlier Sol claim.
- Read the complete PR diff and the previous-head fix delta, especially `dayClaimOf`, kcal/macro fact selection and the 21-case regression file ([fix code](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3f69a8ad87d55473611893963fc74ebacc359c0/src/roman/guardrails/roman-post-check.ts#L376-L523), [regressions](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3f69a8ad87d55473611893963fc74ebacc359c0/test/roman/roman-post-check-day-claim.spec.ts)).
- Evidence: `LN-SOL-F-130-b861-metadata.json` and `LN-SOL-F-130-b861.diff` in this report directory; no local test executed, no verdict posted.

### m#533 — HEALTH-STRINGS-130

- Head `2803331c28b044a38cd2d2393be8a79f3ad57f10`, 60 changed lines, CI green, merge state CLEAN ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37712672402/job/113101951371)).
- [Claim posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533#issuecomment-6050400210), with no existing Sol claim/verdict at this head in the filtered comment read.
- From the code: traced both native purpose-string locations, Expo dynamic-config retention, the installed HealthKit plugin's Info.plist mod, the new generated-string regressions, unchanged read-only authorization, and backend daily-aggregate/AI-consent boundaries ([PR and regression evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533)).
- No local test run; the complete CI check rollup was green ([CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37712672402/job/113101951371)).
- [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533#issuecomment-6050441246) at the rechecked exact head; B=0/U=0, four completed successful checks, no conflict ([CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37712672402/job/113101951371)).
- Payload and final head/check evidence saved as `LN-SOL-F-130-m533-verdict.txt` and `LN-SOL-F-130-m533-final-head.json`.

### b#869 — COACH-PAY-BE-FIN-130

- Head `e1d398cd0440084ed644ea55af6fb4cb95e05737`, 792 changed lines across 12 files, CI green, merge state CLEAN ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869)).
- [Claim posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869#issuecomment-6050495740); no prior Sol claim/verdict at this head in the filtered comment read.
- From the code: traced controller auth/role/sub-coach gates and DTO validation, seller/current-head-coach scoping, field-by-field responses, each named charge and refund amount cap, unchanged shared refund recovery/admin defaults, void-collection pause/resume, existing client cancel, audit calls, module wiring and disabled feature-map/default state ([PR and tests](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869)).
- No local test run; relied on current-head CI and read all changed tests, including named-charge/per-tap-key pass-through coverage ([READY acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869#issuecomment-6050460318)).
- [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869#issuecomment-6050537882) at the rechecked exact head; B=0/U=0, CI green and no conflict ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869)).
- Payload and final head/check evidence saved as `LN-SOL-F-130-b869-verdict.txt` and `LN-SOL-F-130-b869-final-head.json`.

### Skips — existing Sol claims

- m#536 yielded before claiming or reading code to [LN-SOL-E2-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050432972).
- m#524 yielded before claiming or reading code to [LN-SOL-B-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050443656).
- m#539 yielded before claiming or reading code to [LN-SOL-B-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/539#issuecomment-6050526280).
- m#537 yielded before claiming or reading code to [LN-SOL-D-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6050531286).
- b#868 yielded before claiming or reading code to [LN-SOL-A-130](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868#issuecomment-6050532499).
- b#871 yielded before claiming or reading code to [LN-SOL-A-130](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871#issuecomment-6050667430).
- m#535's new fix head yielded before claiming or reading code to [LN-SOL-G-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/535#issuecomment-6050706639).
- m#524's round-three head yielded before claiming or reading code to [LN-SOL-A-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050736954).
- Priority m#543 yielded before claiming or reading code to [LN-SOL-C-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/543#issuecomment-6050772641).
- b#872 yielded before claiming or reading code to [LN-SOL-B-130](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6050877371).
- m#545 yielded before claiming or reading code to [LN-SOL-E2-130](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6050938711).

### b#870 — CREDIT-REFILL-130

- Head `5f89fb1d2366f8ad04b923dd9b4400e62160b586`, 290 changed lines across three files, CI green, merge state CLEAN ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870)).
- [Claim posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6050598409), with no prior Sol claim/verdict at this head in the filtered comment read.
- B=1/U=0, actual-method base/head regression proved; [REQUEST CHANGES posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6050668322) at the rechecked exact head, CI green and no conflict ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870)).
- Payload, final-head evidence and targeted proof saved as `LN-SOL-F-130-b870-verdict.txt`, `LN-SOL-F-130-b870-final-head.json` and `LN-SOL-F-130-b870-rollover-refund-probe.log`.

## Not fixed (needs operator)

b#869 activation remains an operator follow-up after the coach screen ships and the PR's owner defaults are confirmed; default: keep the flag unset until then ([activation gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869)).

B-870-SOL-F-130-1 needs the Opus fix lane; residual pack accounting must remain compatible with the supported refund path before this rollover change merges ([pull request](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870)).

## Proposed (needs operator)

None.

## HANDOFF

Active; m#533 APPROVE posted at `2803331c28b044a38cd2d2393be8a79f3ad57f10`, B=0/U=0 ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533#issuecomment-6050441246)).
b#869 APPROVE posted at `e1d398cd0440084ed644ea55af6fb4cb95e05737`, B=0/U=0 ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869#issuecomment-6050537882)).
b#870 REQUEST CHANGES posted at `5f89fb1d2366f8ad04b923dd9b4400e62160b586`, open B-870-SOL-F-130-1, U=0 ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6050668322)).
Continue newest unclaimed READY first on the [shared board](/home/user/workspace/ops/board/board.md), with the four specified pre-build priorities taking precedence.

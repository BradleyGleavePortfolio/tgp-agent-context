# LN-SOL-E2-130 — independent Sol reviewer

Agent 130. Standing reviewer, instance E; oldest eligible READY first.

Status: three completed independent exact-head audits: mobile #536/#540 APPROVE, mobile #545 REQUEST CHANGES for one reproduced B (false full-refund/access confirmation), total B=1/U=0. Standing lane continues. ([Water/fast verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050504855), [Community-thread verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540#issuecomment-6050683512), [Payment-actions verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051039451))

**B-545-1 — seen in an isolated test:** `src/lib/money/clientPaymentsCopy.ts:84–87` promises “Access and billing on this plan stay as they are” for a refundable active recurring plan whose billing read returned `unknown`, and suppresses the “and end access” button label. An ordinary coach opens a paid client's Payments during a failed provider subscription read and issues the default full refund believing access is preserved, but the full-refund handler ends access. Smallest fix: handle `unknown` explicitly before the unchanged-access return; charge-covering refunds must still warn that access ends and set `endsAccess: true`, without promising a known billing state. Add a focused confirmation/button regression. ([Actual-module reproduction](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe-output.txt), [Backend view contract](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-backend-contract-excerpts.txt), [Full-refund entitlement path](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-backend-refund-excerpts.txt))

## Scope traced

- Relaunch follows the operator's explicit instruction to skip the token-file step; GitHub calls use `api_credentials=["github"]` without writing credentials. ([Operator fleet log](/home/user/workspace/ops/FLEET130.md))
- Read `_COMMON_130.md`, the `LN-SOL-130` entry, SoT A1, A2 owner overrides and A6, and the afternoon owner decisions. ([Common brief](/home/user/workspace/ops/lanes130/_COMMON_130.md), [Sol lane](/home/user/workspace/ops/lanes130/JOBS130.md), [Source of truth](/home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md), [Afternoon handoff](/home/user/workspace/tgp-agent-context/handoffs/op-128/HANDOFF.md))
- At 18:33 PDT the board refreshed at 18:31 offered only backend #861 as READY without a Sol verdict, with other Sol claims already active; this instance did not duplicate them. ([PR board](/home/user/workspace/ops/board/board.md))
- Health-priority mobile #533 and the next oldest eligible mobile #513 were checked on GitHub, then skipped because another Sol reviewer had already claimed each exact head; no duplicate claim was posted. ([Health claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/533#issuecomment-6050400210), [Tutorial claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6050423399))
- Claimed mobile #536 at `eea0a3f5a3ae71da8fc40e66802723365cf1441b` at 18:42 PDT after verifying READY, no other Sol claim, four successful checks and MERGEABLE; reviewing water/fast removal paths independently without reading Opus verdict text. ([Own claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050432972), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37713377625/job/113104206451))
- Traced both mobile id-only DELETE wrappers to caller-owned server predicates at read-only backend main `272dc8ef9dd77255984dca6cb9fa2ac00900c987`, plus saved-water add/read/delete accounting, confirmations, action locking, running-fast-only notification cleanup, history reload and empty-stat reset. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536), [Deployed backend predecessor](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/858))
- Independent isolated proof at the immutable PR head executed the actual `clientStore.ts` with real Zustand and synthetic API fixtures through `heavy.sh`: six probes passed for read shape, pending deletion, failed deletion, sequential quick-add/removal, final-entry deletion and refresh/date/reset behavior. No worktree, native device or production API was used. ([Probe code](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536-store-probe.cjs), [Probe output](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536-store-probe-output.txt))
- Posted independent APPROVE for mobile #536 at 18:48 PDT after fresh GitHub verification of the unchanged exact head, earliest live Sol claim, no existing Sol verdict, MERGEABLE and four successful checks. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050504855), [Pre-verdict evidence](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536-pre-verdict.json))
- At 18:50–18:52 PDT the oldest available board candidates and the newly READY iOS-priority inbox were checked, then skipped without duplicate claims because GitHub already recorded live Sol claims: mobile #538, mobile #539, backend #868 and mobile #537. ([Meal-plan claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/538#issuecomment-6050519701), [Inbox claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/539#issuecomment-6050526280), [Allergy claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868#issuecomment-6050532499), [Settings claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6050531286))
- Claimed the next oldest unclaimed READY, mobile #540 at `81b56cf811e42ebcce9116df10c81cc107aaa5e4`, at 18:56 PDT: four successful checks, MERGEABLE, 581 changed lines; then completed the independent community-thread review. ([Own claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540#issuecomment-6050581855), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37714355657/job/113107318180))
- Mobile #540 trace covers optional first-name/reaction wire schemas, authoritative reaction writes and cache updates, author-only confirmed deletion with unchanged server membership/moderator authorization, safety/crisis menus, Back fallback and post/reply refresh against the deployed `d6065661` predecessor. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540), [Backend dependency recorded in builder report](/home/user/workspace/ops/reports/COMM-THREAD-FIN-130.md))
- Seven independent isolated checks of actual immutable-head helpers, API module/boundary and hook callbacks passed using real Zod, Axios and QueryClient with synthetic transport; this is not a native UI/navigation test. ([Probe code](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-community-probe.cjs), [Passing proof](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-community-probe-passing.txt))
- The first probe stopped on a reviewer-harness cross-realm `deepStrictEqual` comparison; serializing the compared fixture corrected the harness without changing product code, and the original output is retained. ([Original harness output](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-community-probe-output.txt))
- The 19:01 PDT pre-verdict check retained #540's exact head, earliest own claim and all four successful checks, but GitHub temporarily reported mergeability UNKNOWN; the first posting guard withheld the comment rather than claiming verified mergeability. This is not a product finding or a reason to change the verdict. ([Pre-verdict state](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-pre-verdict.json))
- Posted independent APPROVE for mobile #540 at 19:05 PDT after the three-minute interval and fresh verification of the unchanged exact head, earliest own Sol claim, no existing Sol verdict, four successful checks and restored MERGEABLE status. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540#issuecomment-6050683512), [Final verification](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-pre-verdict-2.json))
- Through 19:14 PDT, later oldest-READY backend #871, mobile #524's new round and iOS-priority mobile #543 were likewise skipped after live verification of prior Sol claims; no unfinished own claim remains. ([Dunning-copy claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871#issuecomment-6050667430), [Home delta claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050736954), [Session-keeping claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/543#issuecomment-6050772641))
- Claimed oldest unclaimed READY mobile #545 at `8eab7ee5e2a44b32de02c87cdfd5d01f212df928`, 19:29 PDT: T4 coach payment actions, 1,115 additions across 13 files, four successful checks and MERGEABLE. Reviewing money/permission paths before layout and tests; no Opus verdict text read. ([Own claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6050938711), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37717455741/job/113117114182))
- Seven isolated actual-module probes passed for the deployed plan-view/parser contract, normal full/partial/earlier-payment copy, selected-charge refund payload, pause/resume/cancel transports and confirmations, unreadable replies, and reproduction of B-545-1; the final probe checks the observed bad confirmation, not the required behavior. No native rendering or actual refund was performed. ([Probe code](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe.cjs), [Probe output](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe-output.txt))
- Completed #545's deployed-contract trace: seller/head-coach sale scoping, active-sub-coach 403 guard and role hiding, exact-default-off server gate and app flag wiring, backend-supplied action eligibility, full/partial refund access effects, pause/resume collection semantics, non-delinquent/delinquent cancel outcomes and the existing never-throw restart wrapper; existing Summary pathways remain unchanged in the delta. ([Mobile implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545), [Backend money dependency](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/869))
- Posted independent REQUEST CHANGES for #545 at 19:38 PDT after re-verifying the unchanged head, earliest own Sol claim, no existing Sol verdict, four successful checks and MERGEABLE; B=1/U=0, with the small unknown-billing warning/button fix specified. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051039451), [Pre-verdict state](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-pre-verdict.json))
- Read-only review only: no worktree, no source edits, no merges, no deploys, no production changes.

## B list

Mobile #545: B-545-1 above, not fixed; full-refund access warning is bypassed when billing is unreadable even though the server still permits the refund. ([Reproduction](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe-output.txt))

Mobile #536: none found in the reviewed ordinary-use paths. ([Reviewed delta](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536.diff))

Mobile #540: none found in the reviewed ordinary-use paths. ([Reviewed delta](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540.diff))

## U list

Mobile #536: none found in the reviewed ordinary-use paths. ([Reviewed delta](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536.diff))

Mobile #540: none found in the reviewed ordinary-use paths. ([Reviewed delta](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540.diff))

Mobile #545: none. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051039451))

## C one-liners

Mobile #540, from the code: own replies still have no delete endpoint; failed reaction taps revert silently (both existing, nonblocking). ([PR disclosure and implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540))

Mobile #545, from the code: cross-currency payments omit the reason Refund is unavailable; team-plan restart remains seller-only; a sub-coach can briefly see the entry before role resolution, with server 403 enforcement intact (nonblocking). ([PR disclosure and implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545))

## PRs

| PR | Exact head | Changed lines | CI | Sol status |
|---|---|---:|---|---|
| [mobile #536](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536) | `eea0a3f5a3ae71da8fc40e66802723365cf1441b` | 483 (+466/−17), 14 files | Four checks SUCCESS | [APPROVE, 18:48 PDT](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050504855) |
| [mobile #540](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540) | `81b56cf811e42ebcce9116df10c81cc107aaa5e4` | 581 (+512/−69), 7 files | Four checks SUCCESS | [APPROVE, 19:05 PDT](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540#issuecomment-6050683512) |
| [mobile #545](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545) | `8eab7ee5e2a44b32de02c87cdfd5d01f212df928` | 1,115 (+1,115/−0), 13 files | Four checks SUCCESS | [REQUEST CHANGES, 19:38 PDT](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051039451) |

## Not fixed (needs operator)

B-545-1: `src/lib/money/clientPaymentsCopy.ts:84–87`; route the small T4 copy/confirmation fix through the money-qualified FIX lane. Default: keep `FEATURE_COACH_PAYMENT_ACTIONS` off and do not merge this head until the warning/button regression is fixed and both exact-head lenses approve. ([Reviewed money PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545), [Reproduction](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe-output.txt))

## Proposed (needs operator)

None.

## HANDOFF

Active standing lane. Mobile #536 is complete: independent APPROVE at `eea0a3f5a3ae71da8fc40e66802723365cf1441b`, B=0/U=0, CI four successful checks, six isolated actual-store probes passed. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/536#issuecomment-6050504855), [Probe output](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m536-store-probe-output.txt))

Mobile #540 is complete: independent APPROVE at `81b56cf811e42ebcce9116df10c81cc107aaa5e4`, B=0/U=0, four successful checks, seven isolated API/helper/hook-callback checks passed. Native action/parity proof was inspected in the PR tests and CI, not re-run on a device. ([Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540#issuecomment-6050683512), [Passing proof](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m540-community-probe-passing.txt))

Mobile #545 is complete: independent REQUEST CHANGES at `8eab7ee5e2a44b32de02c87cdfd5d01f212df928`, B=1/U=0, four successful checks, seven isolated probes including the reproduced false-access confirmation. Default: keep the flag off, route B-545-1 through the T4 FIX lane and require both exact-head re-audits. Source approval does not authorize a merge. ([Verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051039451), [Money proof](/home/user/workspace/ops/review-data/LN-SOL-E2-130/m545-money-probe-output.txt))

No unfinished own claim; continue the standing lane with the oldest eligible unclaimed READY on the board, prioritizing the four named iOS blockers if a new head is READY. ([Standing lane brief](/home/user/workspace/ops/lanes130/_COMMON_130.md))

GitHub access worked with the injected credential alone; no token file was written.

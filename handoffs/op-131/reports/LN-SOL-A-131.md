# LN-SOL-A-131 — GPT-6.1 Sol lens

Operator: agent 131.

## Proven blocker — backend #872

**B1 — from the code:** `src/coach/command-center/churn-intervention.service.ts:334-339,421-426,734-760` still passes unfiltered PTM factor labels to the coach's draft provider and stores the first label as `top_factor`; the new sharing check only removes the separate recent-check-in object ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

An ordinary client switches off check-in sharing, then the coach generates a re-engagement draft: the prediction's check-in frequency or streak signal still reaches the provider and the coach despite that switch ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

Smallest fix: apply the appropriate sharing scopes to PTM factors in both the at-risk response and draft path before choosing/persisting `topFactor` or sending `topFactors`; retain allowed factors and use neutral fallback copy when none remain.

Evidence path: `src/ptm/ptm-heuristic.service.ts:79-90,202-214` creates check-in-derived labels, `src/ptm/ptm.service.ts:93-97` returns the stored prediction without a coach-sharing filter, and `src/coach/command-center/churn-intervention.service.ts:259-291` also returns those labels directly to the coach; the new test at `test/coach-ai-sharing-gate.spec.ts:201` sets `getLatestPrediction` to null, so it does not cover this ordinary non-empty prediction ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

**B2 — from the code:** `src/coach/brief/coach-brief.service.ts:1714-1725,2003-2014,2096-2109` returns cached/current and history brief narratives, context and action items without the new consent gate, which runs only during aggregation at `:914-918`; `ConsentService.revoke` at `src/consent/consent.service.ts:243-303` does not invalidate those cached briefs ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

An ordinary client turns weigh-in sharing off after the day's brief is generated, then the coach opens today's brief or its history and still receives that client's named weight-change item and the stored narrative ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

Smallest fix: invalidate or reauthorize brief caches when a fitness scope is revoked, including history, so health-bearing narrative, context and action items cannot be returned under a withdrawn grant.

## Scope traced

- Started with the oldest READY mobile head without a current Sol verdict: [mobile PR #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537).
- Claimed `abb296689f21ba7a7dbecb514e404e932ad40044` for independent review; no current-head Claude verdict was read ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051749184)).
- Review scope: Settings notification switches, fasting-alert cancellation, password validation/copy, profile-setup copy, navigation parity, and main-merge delta ([PR #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537)).
- The Settings review found no launch B in the inspected delta, but the refreshed board showed an earlier same-head Sol claim by LN-SOL-E-131; yielded the verdict to that lane rather than duplicate it ([PR #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537)).
- LN-SOL-E-131 subsequently posted APPROVE at the same Settings head; this lane posted only a relinquishment/handoff, not a duplicate verdict ([handoff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051793931)).
- Skipped backend #855 because LN-SOL-B-131 already holds its current Sol claim ([PR #855](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/855)).
- Claimed backend #872 at `1509818e765c882721118bf1023c85d1a17b1bfd`; independently tracing coach summaries, Coach AI drafts, Roman-adjust inputs, churn drafts, and the shared consent helper ([claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051770878)).
- Claimed mobile #547 at `54b4552deb702f910b1f05c48a67c588c2d959b9`; reviewed its selected-date completion guards, precise water request/rollback, display-only rounding, three new regression cases, and Home's selected-day callers ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051914029)).

## B list

B1: PTM factor labels bypass log-sharing scopes; B2: cached/history briefs bypass the new consent gate ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

## U list

None in the reviewed delta.

## C one-liners

None recorded yet.

## PRs

| PR | Head | Lines | CI | Sol |
|---|---|---:|---|---|
| [mobile #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537) | `abb296689f21ba7a7dbecb514e404e932ad40044` | 641 (+511 / -130) | All reported checks successful | Review complete; yielded to earlier LN-SOL-E-131 claim |
| [backend #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872) | `1509818e765c882721118bf1023c85d1a17b1bfd` | 391 (+370 / -21) | Required checks successful; deploy-readiness gate skipped | [REQUEST CHANGES — B=2, U=0](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593) |
| [mobile #547](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547) | `54b4552deb702f910b1f05c48a67c588c2d959b9` | 88 (+84 / -4) | All reported checks successful | [APPROVE — B=0, U=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051979380) |

CI evidence: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37718433734/job/113120253840).

Backend CI evidence: [build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37716280448/job/113113352399).

## Review evidence

- Backend #872: reviewed all eight changed files and the adjacent context shapes, prompt sinks, prediction producers, Nest consent injection, owner bypass, cache-hit/history responses, and revocation path; the current head was rechecked immediately before posting the independent verdict ([REQUEST CHANGES](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).
- Existing CI is green, but no local tests were executed and both B findings are explicitly code-only ([build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37716280448/job/113113352399)).
- Mobile #537: the inspected main-merge delta preserves `prepareSignOutConfirm` and its asynchronous handler; earlier profile-target overclaim is absent at `src/screens/client/SettingsScreen.tsx:163`, and the matching parity tests include the retained handlers ([PR #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537)).
- Mobile #547: no launch B/U found in the bounded store delta, which guards both success and failure at `src/store/clientStore.ts:86,169` and changes only water-failure display precision at `:233`; no local tests run ([PR #547](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547)).

## Not fixed (needs operator)

B1 and B2: route to the T4 fixer; no source edits by this lens.

## Proposed (needs operator)

None.

## HANDOFF

Current work completed: backend #872 verdict posted at the verified exact head; B1 and B2 need the T4 fixer ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).

Mobile #547 independently approved after the exact-head recheck ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051979380)).

Verdict payloads retained at `/home/user/workspace/ops/reports/LN-SOL-A-131-b872-verdict.txt` and `/home/user/workspace/ops/reports/LN-SOL-A-131-m547-verdict.txt`.

Standing lens continues from the shared board, mobile READY heads first. No source edits, worktree, commits, merges, deploys, production changes, or local test runs.

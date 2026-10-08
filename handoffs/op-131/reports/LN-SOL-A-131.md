# LN-SOL-A-131 — GPT-6.1 Sol lens

Operator: agent 131.

## Proven blockers at the original reviewed head — backend #872

These findings apply to the original reviewed head `1509818e765c882721118bf1023c85d1a17b1bfd`; a later fix head must receive a fresh delta verdict before either finding is marked resolved ([original verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).

At the 21:50 cutoff the shared board showed a new fix head, `b84193df74ffe1c14e874e35f38bbc7261bc8306`, with green CI but no READY at that head; this lane has not reviewed that fix and makes no claim that either blocker still exists there ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

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
- Claimed mobile #553 at `eb552f226dc6a4cbb3d0a814e440594f8a4e13dd`; reviewed all six changed files, restore-to-autosave continuity, untouched-session clearance, queue/start identity, and refusal re-save ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553#issuecomment-6052166319)).
- Claimed mobile #554 at `da05524f07dcca64465e50634d62478e4887a1fe`; reviewed all 13 changed files, persistent setup/Money header, calm initial-loading/error states, Team's truthful empty state, 44 pt tabs/retry, and retained navigation/row/dismiss handlers ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052365045)).
- Claimed backend #874 at `24c6c1976a54189f30030e8f6b5a1a2f219184f6`; reviewed the 70-line fix delta from the prior Sol head plus all 15 changed files, exact period metering, last-cent gateway exhaustion, unchanged budget DTO and additive migration ([claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052409933)).

## B list

B1: PTM factor labels bypass log-sharing scopes; B2: cached/history briefs bypass the new consent gate, both at original head `1509818e765c882721118bf1023c85d1a17b1bfd` ([original verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).

Two historical findings, zero new blockers on the four approved heads; no verdict from this lane on backend #872's latest fix head ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

## U list

None in the reviewed delta.

## C one-liners

C (edge, deferred to 10k clients), from the code: mobile #553 keeps the already-mounted foreground and under-12-hour gap paths unchanged; the change is bounded to stored-session restoration ([PR #553](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553)).

C, from the code: mobile #554 leaves the existing stale-on-refresh display and remaining legacy surfaces unchanged; Dark remains disabled in the actual theme provider ([PR #554](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554)).

C (edge, deferred to 10k clients): backend #874 races/rollout edge cases.

## PRs

| PR | Head | Lines | CI | Sol |
|---|---|---:|---|---|
| [mobile #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537) | `abb296689f21ba7a7dbecb514e404e932ad40044` | 641 (+511 / -130) | All reported checks successful | Review complete; yielded to earlier LN-SOL-E-131 claim |
| [backend #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872) | `1509818e765c882721118bf1023c85d1a17b1bfd` | 391 (+370 / -21) | Required checks successful; deploy-readiness gate skipped | [REQUEST CHANGES — B=2, U=0](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593) |
| [backend #872 latest fix](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872) | `b84193df74ffe1c14e874e35f38bbc7261bc8306` | 520 | Green on 21:50 board; no READY | Not reviewed by A; original verdict does not apply to this head |
| [mobile #547](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547) | `54b4552deb702f910b1f05c48a67c588c2d959b9` | 88 (+84 / -4) | All reported checks successful | [APPROVE — B=0, U=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051979380) |
| [mobile #553](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553) | `eb552f226dc6a4cbb3d0a814e440594f8a4e13dd` | 400 (+354 / -46) | All reported checks successful | [APPROVE — B=0, U=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553#issuecomment-6052207359) |
| [mobile #554](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554) | `da05524f07dcca64465e50634d62478e4887a1fe` | 764 (+488 / -276) | All reported checks successful | [APPROVE — B=0, U=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052399906) |
| [backend #874](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874) | `24c6c1976a54189f30030e8f6b5a1a2f219184f6` | 696 (+622 / -74) | Required checks successful; deploy-readiness gate skipped | [APPROVE — B=0, U=0](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052471183) |

CI evidence: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37718433734/job/113120253840).

Backend CI evidence: [build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37716280448/job/113113352399).

## Review evidence

- Backend #872: reviewed all eight changed files and the adjacent context shapes, prompt sinks, prediction producers, Nest consent injection, owner bypass, cache-hit/history responses, and revocation path; the current head was rechecked immediately before posting the independent verdict ([REQUEST CHANGES](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).
- Existing CI is green, but no local tests were executed and both B findings are explicitly code-only ([build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37716280448/job/113113352399)).
- Mobile #537: the inspected main-merge delta preserves `prepareSignOutConfirm` and its asynchronous handler; earlier profile-target overclaim is absent at `src/screens/client/SettingsScreen.tsx:163`, and the matching parity tests include the retained handlers ([PR #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537)).
- Mobile #547: no launch B/U found in the bounded store delta, which guards both success and failure at `src/store/clientStore.ts:86,169` and changes only water-failure display precision at `:233`; no local tests run ([PR #547](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547)).
- Mobile #553: stale disk restoration carries `pausedMs` through adoption, autosave and refusal re-save; the untouched test preserves completed/edited/added sets and notes before clearance, and the original start/offline identity is retained in the inspected delta; reviewed all eight new regression cases but did not execute them locally ([PR #553](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553)).
- Mobile #554: reviewed the 16 new regression cases and adjacent real setup/Money callback wiring; the same leading scroll children keep the header mounted across numbers-loading/failure/data states, and the changed retry paths rerun existing reads; no local tests executed ([PR #554](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554)).
- Backend #874: the earlier Sol B1's normal sequential last-cent failure is handled by a remainder debit at `src/ai/gateway/ai-gateway.service.ts:393-403`, and the added regression pins exhaustion before the next provider call; independently traced exact usage writes, five cost paths, conservative admission, both-field reset and DTO serialization; no local tests executed ([PR #874](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874)).

## Not fixed (needs operator)

B1 and B2 at the original backend #872 head require a delta review of the T4 fix once READY; recommended default for agent 132: check both the PTM factor sinks and the cached/current/history brief authorization paths before clearing them ([original verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593)).

Backend #874 requires its additive migration applied before the new code runs and a merge-main/new-head review after the declared predecessor merges; do not reuse this head's verdict for that future head ([PR #874](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874)).

## Proposed (needs operator)

None.

The operator's 21:50 wind-down order forbids waiting for new READY lines; the review in hand is complete and this lane is ending ([operator thread](https://www.perplexity.ai/computer/tasks/ae4e0ea8-44f3-4341-b060-dc1e8cdbfeb4)).

## HANDOFF

**Done at wind-down.** Five independent verdict comments posted: backend #872 REQUEST CHANGES at its original reviewed head, then four APPROVEs at mobile #547, #553, #554 and backend #874; the early mobile #537 review was yielded to the earlier Sol claimant rather than duplicated ([original #872 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6051820593), [#537 handoff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051793931)).

Mobile #547 independently approved after the exact-head recheck ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051979380)).

Mobile #553 independently approved after the exact-head recheck ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553#issuecomment-6052207359)).

Mobile #554 independently approved after the exact-head recheck; all four head checks were successful ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052399906)).

Backend #874 independently approved after the exact-head recheck; the earlier Sol B1 is addressed in the inspected code and new sequential-exhaustion regression, without local execution by this lens ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052471183)).

Remaining for agent 132/operator: backend #872 fix head `b84193df74ffe1c14e874e35f38bbc7261bc8306` was not READY at cutoff and remains unaudited by A; re-review both original consent findings once that head is READY, without reusing the old verdict ([PR #872](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872)).

Backend #874's approval applies only to `24c6c1976a54189f30030e8f6b5a1a2f219184f6`; preserve its additive-migration requirement and obtain new-head reviews after the declared predecessor/merge-main rounds ([verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052471183)).

Verdict payloads retained at `/home/user/workspace/ops/reports/LN-SOL-A-131-b872-verdict.txt`, `/home/user/workspace/ops/reports/LN-SOL-A-131-m547-verdict.txt`, `/home/user/workspace/ops/reports/LN-SOL-A-131-m553-verdict.txt`, `/home/user/workspace/ops/reports/LN-SOL-A-131-m554-verdict.txt`, and `/home/user/workspace/ops/reports/LN-SOL-A-131-b874-verdict.txt`.

No review left in hand and no new READY wait. No source edits, worktree, commits, merges, deploys, production changes, or local test runs. No branch/source work to push. Current-head Claude verdicts were not read before this lane's corresponding verdicts.

Final counters: B=2 historical findings, U=0; needs operator=3 (two consent delta checks plus the migration/merge sequencing handoff). Last posted review head: `24c6c1976a54189f30030e8f6b5a1a2f219184f6` ([last verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052471183)).

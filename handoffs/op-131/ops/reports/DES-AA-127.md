# DES-AA-127 — client messages thread

Builder: DES-AA-127, agent 128. Status: COMPLETE / READY — [mobile PR #491](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491) at 69a1dfd0e86b6cf5fe25a454503cd5b048f7ea67, all checks green and GitHub MERGEABLE at 14:21 PDT; [FIX ROUND 2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6047098998) posted. Finishing under the owner override without waiting for new verdicts.

## Scope traced
- Binding brief and the DES-AA-127 entry read; owned files are client MessagesScreen, shared MessageBubble and ThreadV2Parts, and their tests.
- Mobile only; message sending, moderation, report/block and backend behavior remain frozen.
- Shared rendering must preserve coach-thread actions without editing ClientMessagesScreen.
- Before/after action inventory: back; contact -> ContactView (block entry stays there); send; older-page load; error retry; long press -> reply/copy/edit/pin/unpin/delete/report or failed-send retry; cancel reply; edit save/cancel; mute duration/unmute; pinned-message jump; report reason/details/submit/cancel; coach code, code-sheet close/attach/choose-plan; support -> MoreTab/SupportInbox.
- No attach/voice affordance exists in either current screen. No new nonfunctional control added.

## B list
- Remaining owned-code blockers: none identified; [Opus](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046819714) and [Sol](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046855296) independently approved the prior b745dabc head. Current-head reviews remain pending after the README-only restack.
- B1: A client sees an online-status dot when only a coach name was fetched, falsely implying the coach is online; the unsupported dot is removed. [Existing client thread](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/screens/client/MessagesScreen.tsx).
- B2: A client sees a report-success promise of review within 24 hours, but the UI only knows submission succeeded; owned confirmation copy now states that confirmed action, leaving moderation behavior frozen. [Existing client thread](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/screens/client/MessagesScreen.tsx).

## U list
- Quiet shared message rows, grouped timestamps, readable receipts, semantic theme colours, 44-point controls and a hairline composer implemented. [PR changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- A failed initial load used to display both an error and "Start a conversation"; these render states are now separate. [PR render tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- "Pull to retry" incorrectly described a tap-only control; now "Messages could not be loaded. Tap to try again." [PR changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- A contact header had a tappable affordance before coachId was available; now it is a disabled, neutrally labelled header until the contact can open. [PR changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).

## C one-liners
- C: pending-row opacity is no longer dimmed; the clock and "Not sent" still identify the state, so this is only a visual choice. [Opus review](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046819714).
- C: untouched report-sheet review-time copy and pre-existing legacy failed-send retry remain non-blocking operator follow-ups. [Opus](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046819714), [Sol](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046855296).

## PRs
- [Mobile #491](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491): branch agent128/des-aa-127; current head 69a1dfd0e86b6cf5fe25a454503cd5b048f7ea67; 412 changed lines (300 additions / 112 deletions); prior approvals at b745dabc, no current-head verdict yet.
- Current CI, both CodeQL analyses and aggregate CodeQL all pass; GitHub confirms MERGEABLE after preserving both adjacent README entries. [Current CI run](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687374852/job/113018557168), [PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- FIX ROUND 1 (OPENING) posted at 14:01 PDT; waiting window ends 15:16 PDT (75 minutes). [READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046779344).
- Opus APPROVE at 14:04 PDT, B=0. [Exact-head Opus verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046819714).
- Sol APPROVE at 14:06 PDT, B=0 U=0. [Exact-head Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046855296).
- FIX ROUND 2 posted at 14:21 PDT for current head 69a1dfd0; no claim of current-head approvals. [Round 2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6047098998).
- Failing-first proof: client screen implementation reversed in the owned worktree, new render tests run against its unchanged main version, then restored; 3 failed / 3 passed as expected. [Baseline log](/home/user/workspace/ops/reports/DES-AA-127-baseline.log).
- Restored client implementation: 6 / 6 tests passed. [Client V2 log](/home/user/workspace/ops/reports/DES-AA-127-client-v2.log).
- All seven targeted files passed (40 tests total): client V2, MessageBubble light/dark, coach V2, coach moderation/block integration, no-coach, cache, quiet-luxury doctrine. [Local test logs](/home/user/workspace/ops/reports/DES-AA-127-ClientMessagesScreenV2.test.log).

## Not fixed (needs operator)
- ReportMessageSheet.tsx:96-97 separately promises a 24-hour review; the backend documents that operational promise and sends a support email, but the UI has no actual review timing. [Report sheet](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/components/messaging/ReportMessageSheet.tsx), [report-alert service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/src/report-alerts/report-alert.service.ts). Recommended default: operator confirms the operational SLA or routes a copy-only change outside this frozen moderation scope.
- Legacy client failed sends have no retry action when messaging_core_v2 is off (MessagesScreen.tsx:322-339); status copy now says "Not sent" and frozen sending logic is unchanged. [Existing client thread](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/screens/client/MessagesScreen.tsx). Recommended default: route legacy retry behavior as a separate bounded messaging fix.

## HANDOFF
- Own worktree: /home/user/workspace/wt/DES-AA-127-mobile.
- Shared dependencies are READY and linked with ops/link_deps.sh; no duplicate install was attempted.
- Client baseline failing-first proof saved; full client implementation restored; all targeted local tests passed one file at a time through ops/heavy.sh.
- Required author/committer identity verified on both source commit and main-merge commit.
- Complete branch initially pushed once; a second complete push applied the operator's 13:51 README-placement rule and pre-READY main merge; no WIP push or CI rerun. [Mobile #491](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- Both exact-head verdicts received by the first five-minute poll; no fix round required. [Opus](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046819714), [Sol](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6046855296).
- At the post-approval check GitHub reported a README-only conflict caused by the adjacent Notifications entry changing on main; that main row and this PR's Messages row are both preserved. [Assigned PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- Main merge committed and pushed; all owned message source files are byte-for-byte unchanged from the previously dual-approved head. [Assigned PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491).
- Final state: green CI, main merged, GitHub MERGEABLE and FIX ROUND 2 READY at 69a1dfd0e86b6cf5fe25a454503cd5b048f7ea67. [Round 2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/491#issuecomment-6047098998), [current CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687374852/job/113018557168).
- Owner override: builder finishes now, without waiting for current-head verdicts; fresh review findings or later conflicts belong to the standing FIX lane. Nothing was merged or deployed by this builder.
- DES-AQ was withdrawn before any branch, commit or push; read-only prep notes preserved in ops/reports/DES-AQ-127.md.
- Attach/voice controls do not exist on these current thread screens. Do not invent dead controls; all existing send, menus, pins, mute, reply, contact, report, coach-code, support, older messages and retry actions remain.
- No production changes, deployments or merges permitted.

# CF-ROMAN-NAV-128 — builder agent 128

## Scope traced
- Assignment: CLIENTFIX-128 row CF-ROMAN-NAV-128, source FW-ROMAN-128:FW-ROMAN-NAV-128 (U1 + U2).
- Base: mobile main 084ed613. Home Roman shortcut → MoreTab / RomanChat; MoreStack first route is MoreIndex; both client and coach mount the same Roman chat screen with no native header.
- Files: HomeHeaderActions.tsx, RomanChatScreen.tsx, useRomanChat.ts, matching tests and READMEs.
- Open PR overlap at start: m#515 changes the same HomeHeaderActions test expectation but not HomeHeaderActions.tsx. This PR stays based on main with a one-line expectation change. Other Roman-copy work must leave this hook's greeting fix intact; romanVoice.ts is untouched.

## B list
None.

## U list
1. U1: Opening Roman from Home before opening You replaces the stack's root with chat; without Back the You-menu destinations stay inaccessible until restart. Fix: initial:false and a labelled 44 pt theme-token Back in every chat state.
2. U2: An empty daily chat repeatedly presents the first-meeting introduction to returning clients. Fix: check the existing bound history endpoint before creating today's chat, falling back to returning copy on failure.

## C one-liners
None pursued.

## Evidence
- Failing first on unchanged base source: RomanChatNav.test.tsx 7/7 fail (missing Back), RomanGreetingHistory.test.tsx 4/4 fail (history ignored; returning client marked first encounter), HomeHeaderActions.test.tsx 1 failure / 8 passes (missing initial:false).
- Logs: CF-ROMAN-NAV-128-nav-before.log, CF-ROMAN-NAV-128-greeting-before.log, CF-ROMAN-NAV-128-home-before.log in this report directory.
- Green targeted runs: RomanChatNav.test.tsx 7 passed, RomanGreetingHistory.test.tsx 4 passed, HomeHeaderActions.test.tsx 9 passed (20 total); each run separately through heavy.sh. Evidence is also recorded in the [draft PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523).
- After logs: CF-ROMAN-NAV-128-RomanChatNav.test-after.log, CF-ROMAN-NAV-128-RomanGreetingHistory.test-after.log, CF-ROMAN-NAV-128-HomeHeaderActions.test-after.log. Two files emit the existing Jest asynchronous-handle warning, but return exit 0.

## PRs
- [Mobile #523](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523), DRAFT per OWNER STOP.
- Exact head: f75f5857d036cd28c5c36dca24be3c12c54f8d3d; 217 changed lines (205 additions, 12 deletions), 8 files; author and committer both Bradley Gleave.
- origin/main merged/check completed before push: already up to date. GitHub reports MERGEABLE; worktree clean.
- CI at 15:28 PDT: Typecheck/lint/test and both CodeQL jobs QUEUED. [CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37696399072/job/113049090674).
- Lens verdicts: not requested yet; no READY comment, no claims held.

## Not fixed (needs operator)
1. Resume draft #523: await CI, fix any ordinary-path regression, confirm current-main conflict status, mark ready and request audits at the exact head. Recommended default: complete this small navigation fix before any Roman-chat visual redo.

## HANDOFF
OWNER STOP received at 15:27 PDT; wrapped at 15:28 PDT, within five minutes. All implementation and failing-first/green proofs are saved and pushed in draft [#523](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523). Branch agent128/cf-roman-nav-128; worktree /home/user/workspace/wt/CF-ROMAN-NAV-128-mobile; exact head f75f5857d036cd28c5c36dca24be3c12c54f8d3d. Nothing merged, deployed or changed in production.

Next agent: CI and independent audit remain. Do not post READY until CI is green and main has no conflict. Preserve this hook's U2 fix when coordinating CF-ROMAN-COPY-B-128; no romanVoice.ts change is needed for the returning greeting. PR body saved at /home/user/workspace/ops/reports/CF-ROMAN-NAV-128-pr-body.md, including parity table, truthful sweep and the owner-required done/not-done/tests first line. Builder is finishing now, not waiting for CI.

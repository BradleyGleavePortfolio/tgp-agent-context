# COACH-ROMAN-ROW-130 — coach Roman row copy (agent 130)

Worker: COACH-ROMAN-ROW-130, GPT-6.1 Sol, T2 mobile copy, branch `agent130/coach-roman-row-130`, worktree `/home/user/workspace/wt/COACH-ROMAN-ROW-130-mobile`.

## Scope traced

- Base main: `4e9116b5ac42f35ae373633249119efe162ad466`; only the coach Settings Roman subtitle and its punctuation-free accessibility hint contain the old promise, with no occurrences in tracked tests or snapshots. ([Coach Settings at base](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/screens/coach/SettingsScreen.tsx#L664-L671))
- The row opens `RomanChat` and remains behind `featureFlags.romanChat`; its navigator mounts `RomanChatScreen surface="coach"` under the same flag. ([Coach Settings](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/screens/coach/SettingsScreen.tsx#L650-L678), [Coach navigator](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/navigation/CoachNavigator.tsx#L533-L540))
- Approved replacement in both places: “Ask about programming, nutrition or running your practice.” No other customer-facing copy, route, flag, backend call or layout changes are in scope. ([Delegated backend PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/873))

## B list

- B2 mobile half, FIXED in m#546, seen in a test and from the code: a coach opens Settings and is offered a client read even though coach Roman does not receive client data; the scoped fix replaces both visible and spoken copies with the approved topics. ([Mobile fix](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546), [Coach Settings at base](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/screens/coach/SettingsScreen.tsx#L664-L671), [Backend B2 fix](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/873))

## U list

- None identified within this copy-only scope.

## C one-liners

- None identified within this copy-only scope.

## Acceptance evidence

- Runtime failing-first test added to the existing coach Settings render harness; it pins the exact subtitle and accessibility hint, retained avatar and `RomanChat` press handler, with a second test for the flag-off state. ([Existing render harness](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/navigation/__tests__/coachSettingsMoneyRow.test.tsx))
- Failing-first on unchanged source: `COACH-ROMAN-ROW-130-before-pinned.log` records one failure for the old accessibility hint and one passing flag-off case; the first harness-development log (`COACH-ROMAN-ROW-130-before.log`) also shows the new subtitle absent, with a test-only dynamic-flag mock corrected before the pinned run. ([Original hint and subtitle](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/screens/coach/SettingsScreen.tsx#L664-L671))
- Final local acceptance: render harness 9/9, existing coach Settings truthfulness 2/2, Roman flag-off guards 10/10 and quiet-luxury doctrine 30/30 (51/51 total); targeted ESLint on the changed test and `git diff --check` pass. Logs: `COACH-ROMAN-ROW-130-{render,truthfulness,flag-off,doctrine,lint}-final.log`. ([Existing render harness](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/navigation/__tests__/coachSettingsMoneyRow.test.tsx))
- Final `rg --hidden --no-ignore`, excluding `.git` and `node_modules`, finds no remaining old promise; production code changes only the two copies at lines 664 and 671. ([Original row](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4e9116b5ac42f35ae373633249119efe162ad466/src/screens/coach/SettingsScreen.tsx#L664-L671))

## PRs

- m#546 opened at `0b1a6b43c0a302ced857285972d10ca0458cc1f9`, branch `agent130/coach-roman-row-130`; 38 changed lines (36 additions / 2 deletions), comprising source 4, tests 32 and README 2. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- Pushed and opened 19:42:38 PDT; CI pending, mergeability pending, verdicts not requested yet. PR body saved to `COACH-ROMAN-ROW-130-pr-body.md`, with tier header, parity table and truthful sweep. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- Author and committer verified as Bradley Gleave <bradley@bradleytgpcoaching.com>; no co-author trailer. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))

## Proposed (needs operator)

- None beyond the assigned task.

## Not fixed (needs operator)

- None within the assigned task.

## HANDOFF

- In progress: m#546 pushed at `0b1a6b43c0a302ced857285972d10ca0458cc1f9`; CI is pending, then exact-head check and READY comment. ([Mobile PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- No merge, deploy or production action is authorized for this worker.

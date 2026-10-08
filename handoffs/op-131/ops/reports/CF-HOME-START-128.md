# CF-HOME-START-128 — Home workout entry (agent 129)

## Scope traced
- Assigned only `FW-TRAIN-128:HOME-START-128` (U7), the Home workout action; the source job permits `HomeScreen.tsx` and its test, with the required matching README update. [Training audit](../reports/FW-TRAIN-128.md)
- Worktree: `/home/user/workspace/wt/CF-HOME-START-128-mobile`; branch `agent129/cf-home-start-128`, based on fetched mobile main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`. [Home implementation](/home/user/workspace/wt/CF-HOME-START-128-mobile/src/screens/client/HomeScreen.tsx)
- Read the common brief in full, only CLIENTFIX-128 from JOBS128, required SoT sections A1/A2 overrides/A6, and section 9 of the operator handoff. [Common brief](../lanes128/_COMMON_128.md)

## Open-PR file overlap checked before editing
- Used `git fetch origin` and `git diff --name-only origin/main...origin/<branch>` for every mobile head on the 16:06 board; no GitHub PR listing requests. [Operator board](../board/board.md)
- No open head held `HomeScreen.tsx` or `HomeScreen.honestCopy127.test.tsx`; DES-K2 is already merged as m#515 and did not hold the file. [Home implementation](/home/user/workspace/wt/CF-HOME-START-128-mobile/src/screens/client/HomeScreen.tsx)
- m#521 owns `ClientNavigator.tsx`, entitlement files, `ActiveWorkoutScreen.tsx` and associated tests; m#523 owns `HomeHeaderActions.tsx` and its tests, plus Roman files. Both explicitly excluded; neither will be edited. [Operator board](../board/board.md)
- The required `src/screens/client/README.md` overlaps m#521, #520, #519, #514, #506, #494, #490 and #485; update only the Home row on main and keep the PR diff minimal. [Client README](/home/user/workspace/wt/CF-HOME-START-128-mobile/src/screens/client/README.md)

## B list
- None in assigned scope. [Training audit](../reports/FW-TRAIN-128.md)

## U list
- U7 FIXED: Home Start opens the exact pending assignment detail; Resume opens the saved live workout with its own identity and `resume: true`, including saved-only sessions. Navigation registration and header actions are unchanged. [Home fix](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524)

## C one-liners
- No edge-case work added.

## Acceptance evidence
- Regression/parity tests written before production edits: assigned, saved, saved-only, saved-with-assignment, completed-today, empty, coachless, first unfinished assignment, and failed reads. [Home tests](/home/user/workspace/wt/CF-HOME-START-128-mobile/src/screens/client/__tests__/HomeScreen.honestCopy127.test.tsx)
- Shared mobile dependencies became READY by 16:13 PDT; linked with `ops/link_deps.sh`. [Baseline log](CF-HOME-START-128-baseline.log)
- Failing-first on unchanged HomeScreen at main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`: 5 failed / 12 passed, including explicit wrong-destination failures for `active-assigned` and `opens the first unfinished assignment`, plus the saved-only missing Resume label. The first cold mount timed out and disrupted the following active case; that noise is not relied on as the behavioral proof. All runs use only the changed file through `ops/heavy.sh`. [Baseline log](CF-HOME-START-128-baseline.log)
- Passing-after at 16:16 PDT: all 17 tests pass in the same single targeted file through `ops/heavy.sh`; no full local test suite, tsc or eslint. [Targeted test log](CF-HOME-START-128-targeted.log)

## PRs
- FINAL: [mobile#524](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524), head `0eca5fc2758b2fd77cb8d0d83379ccd68310f486`, +90/-24 = 114 lines, four files; all four checks SUCCESS, CLEAN/MERGEABLE, latest main included. [READY posted at 16:39 PDT](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6049054159); Opus/Sol not awaited.
- Commit `a5a32778977d1dd2a2b7298ab5e7d3486f4ba420` plus conflict-free merge of main `e634d19e2869e775cc80367732718caba8b371ba` yields opening head `a6cb635989060b2061df14e21707c4047afd7a31`; author and committer verified as Bradley Gleave. Only source +32/-7, README +1/-1 and tests +53/-14 differ from main (108 changed lines). [Home implementation](/home/user/workspace/wt/CF-HOME-START-128-mobile/src/screens/client/HomeScreen.tsx)
- Post-main targeted rerun: all 17 tests pass at opening head, 16:18 PDT. [Post-main test log](CF-HOME-START-128-post-main.log)
- Created [mobile#524](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524) at 16:19 PDT, head `a6cb635989060b2061df14e21707c4047afd7a31`, 108 changed lines (+86/-22), three files; CI pending, verdicts pending/pending.
- At 16:27 PDT the opening [Typecheck, lint, test job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701595332/job/113066079227) is FAILURE; all three CodeQL checks passed, and the PR is MERGEABLE. Failure diagnosis is next; do not post READY at this head yet.
- Fresh `git fetch origin main` at 16:27 PDT still returns `e634d19e2869e775cc80367732718caba8b371ba`, already included in the branch; no new main merge required. [Current PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524)
- CI diagnosis: lint and typecheck passed; full suite had 702 passed / 1 failed (9,269 passed / 1 failed tests). The only failure is the old `src/__tests__/assignedWorkoutEntry127.test.tsx:103` assertion requiring the Train root, while the corrected implementation opens the named assignment detail. Updated only that assertion to require the exact detail route and `PLAN.id`, plus its test name; production code unchanged. Before editing, checked the file against every mobile head on the available board: no other open listed PR holds it. [Opening CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701595332/job/113066079227)
- At 16:29 PDT, the corrected legacy entry file passes all 15 tests through `ops/heavy.sh` (the Home-copy file already passes 17); the final four-file diff is +90/-24 = 114 lines, with production unchanged at +32/-7. [Legacy entry test log](CF-HOME-START-128-legacy-entry.log)
- At 16:30 PDT committed and pushed tests-only correction `0eca5fc2758b2fd77cb8d0d83379ccd68310f486` on `agent129/cf-home-start-128`; identity verified, worktree clean, PR body updated to the four-file scope and 114-line size. CI at the new head awaits the next rate-limited poll. The immediate PATCH response still reflected the opening head, so exact PR head must be confirmed before READY. [Current PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524)
- At 16:34 PDT GitHub confirms exact current head `0eca5fc2758b2fd77cb8d0d83379ccd68310f486`, +90/-24, four files and MERGEABLE; all CodeQL checks pass and [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702679257/job/113069606043) is still running. Fresh main remains `e634d19e2869e775cc80367732718caba8b371ba` and is included.

## Not fixed (needs operator)
- None in this scope.

## HANDOFF
- Branch `agent129/cf-home-start-128`; exact pushed head `0eca5fc2758b2fd77cb8d0d83379ccd68310f486`; [mobile#524](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524), 114 lines (+90/-24), no unpushed commits.
- Done: U7 only; failing-first evidence saved, 17 + 15 targeted tests passed separately, [typecheck/lint/full tests and CodeQL green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702679257/job/113069606043); prohibited files untouched.
- [READY posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6049054159) at 16:39 PDT after fresh exact-head, CLEAN/MERGEABLE and main-ancestry checks; main `e634d19e2869e775cc80367732718caba8b371ba` included.
- Left: both audit lenses and operator-controlled PR merge; verdicts not awaited or checked after READY. FIX lane owns any findings/conflicts; no owner decision required.
- Stopped immediately on operator STOP message; notify written, no further tests, reviews, claims, fixes, merges or deployments.

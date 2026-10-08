# DES-AC-127 — client macro targets

## Scope traced
- Assigned secondary task: ClientMacrosScreen.tsx, tests and matching client README; separate worktree and PR.

## B list
- B1 fixed locally: a client without a coach opening the empty target screen was falsely told their coach had not set macros; replaced with neutral target copy.

## U list
- U1 implemented locally: tabular calorie hero, three monochrome QuietBar rows from real daily food totals, fiber/notes/date preserved, matching-ID coach attribution only, honest loading/error states and refresh parity.

## C one-liners
- C: an unnamed coach's existing “Your coach” fallback becomes “Set by Your” after first-word splitting; nonblocking cleanup deferred by the lens ([Opus verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486#issuecomment-6046883318)).
- C (edge, deferred to 10k clients): neutral attribution may change after the coach read completes ([Opus verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486#issuecomment-6046883318)).

## PRs
- #486, refreshed pushed head b76e2288d7742ca14a66e93e3e104d9077519a22, 163 lines (136 additions + 27 deletions); all required CI green, GitHub MERGEABLE, no verdicts yet ([current CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685646981)).
- Required opening posted at 14:06:50 PDT; both independent exact-head approvals followed ([READY opening](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486#issuecomment-6046861597)).
- Both lenses APPROVE at b76e2288d7742ca14a66e93e3e104d9077519a22, no open B findings ([Opus verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486#issuecomment-6046883318), [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486#issuecomment-6046956018)).
- GitHub state is MERGED at the same head; builder performed no PR merge ([PR #486](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/486)).
- Previous implementation head 91ad594138689a1f11c511eebc6665a3f677bf0d has all required CI green, but is superseded by the operator-requested main refresh; no READY opening was posted at the old head ([previous CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37684276724)).
- Initial tests-only baseline 2fe9acb56f3db9b1949c4b6dce55b6811e78072a, 55 lines: CI stopped at an unsupported RNTL14 query in the fixture, not a behavioral assertion. Corrected to public queries; no red behavioral proof claimed from this CI run ([baseline CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680966629)).
- Corrected targeted local baseline at main d0875d26: 6 expected presentation assertions fail, 2 pass (DES-AC-127-local-baseline.log). Implementation: 8/8 pass (DES-AC-127-local-test.log). Implementation pushed once after both completed.
- Both CodeQL analyses are green at the tests-only head; no behavioral red proof is claimed from its typecheck failure ([baseline CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680966629)).

## Not fixed (needs operator)
- None identified.

## HANDOFF
- Working tree /home/user/workspace/wt/DES-AC-127-mobile, assigned branch agent128/des-ac-127. Current source+tests+README delta remains below the 250-line entry cap.
- DONE: GitHub reports MERGED; both lenses APPROVE at b76e2288d7742ca14a66e93e3e104d9077519a22, CI green, 163 lines. Owner 14:08 override ends builder waiting; standing FIX lane owns later review/conflict work.
- Working tree /home/user/workspace/wt/DES-AC-127-mobile is clean on agent128/des-ac-127. No PR merge or production action was performed by this builder.
- Baseline tree is /home/user/workspace/wt/DES-AC-127-baseline-mobile at main d0875d26 with the corrected current test copied in. Implementation delta is 163 lines, below the 250-line cap.

# INVITE-REFRESH-131 — pending coach invite refresh

Status: complete, READY posted for exact head `6edd77e9a931828861942c9f822117383593f65b` ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6064797145)).

## Scope traced
- Assigned T1 mobile work only: `PendingInviteBanner.tsx`, `pendingInviteCode.ts`, the new banner test and the components README, plus the dependent Home composition test's mock/copy update required by CI ([PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

## B list
- None identified in this bounded slice.

## U list
- U3, seen in a test: an ordinary signed-in client taps Attach successfully, but the shared entitlement receives zero refresh calls ([focused failing-first proof](/home/user/workspace/ops/reports/INVITE-REFRESH-131-failing-refresh.log)).
- Fixed with successful-attach entitlement refresh and Home query invalidation, read-only coach-name preview and unclamped quiet-section copy; explicit Attach, the advertised sharing-version payload and the existing storage rules remain intact ([banner](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/6edd77e9a931828861942c9f822117383593f65b/src%2Fcomponents%2FPendingInviteBanner.tsx), [regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/6edd77e9a931828861942c9f822117383593f65b/src%2Fcomponents%2F__tests__%2FPendingInviteBanner.test.tsx)).

## C one-liners
- None pursued.

## PRs
- [Mobile #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566), GitHub-confirmed head `6edd77e9a931828861942c9f822117383593f65b`, 293 additions + 47 deletions = 340 changed lines across five files (113 source, 225 tests, 2 docs).
- Exact-head check immediately before READY: GitHub MERGEABLE / CLEAN, with all four checks completed successfully ([final head/CI receipt](/home/user/workspace/ops/reports/INVITE-REFRESH-131-ci-final-head-check.json)).
- CI green: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37811089541/job/113427808132), [CodeQL actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37811089539/job/113427807914), [CodeQL JavaScript/TypeScript](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37811089539/job/113427808301) and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113428055558).
- READY posted once at this head; no audit verdicts awaited ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6064797145)).
- Targeted added tests: 15/15 pass via `ops/heavy.sh`; no full local suite, lint or typecheck ([targeted test output](/home/user/workspace/ops/reports/INVITE-REFRESH-131-targeted-green.log)).
- First CI: lint/typecheck succeeded and 753 suites passed, but the existing Home child-card composition test mocked the pending-invite module without the new preview helper; its mock and expected invite copy are now updated, with production behavior unchanged ([failed CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37809651426/job/113422875398)).
- Dependent Home composition test: 5/5 pass locally, with all previous section and handler assertions retained ([composition output](/home/user/workspace/ops/reports/INVITE-REFRESH-131-home-composition-green.log)).
- Existing pending-invite storage and foreground-refresh suites, and the new 15-case suite, passed in CI ([CI log](/home/user/workspace/ops/reports/INVITE-REFRESH-131-ci-failed-job.log)).
- Author and committer: Bradley Gleave <bradley@bradleytgpcoaching.com>, no AI co-author ([PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

## Proposed (needs operator)
- None.

## Not fixed (needs operator)
- None in assigned scope.

## HANDOFF
- Worktree: `/home/user/workspace/wt/INVITE-REFRESH-131-mobile`; branch: `agent131/invite-refresh-131`.
- One-round builder complete: one PR, exact-head green CI, no conflict and READY posted; no merge, deployment, production write or second job.
- Next operator step: launch the assigned Opus/Sol lenses for mobile #566 at `6edd77e9a931828861942c9f822117383593f65b`; keep the PR open for audit ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6064797145)).
- No unresolved in-scope issue or owner decision; B=0, U=1 fixed.
- Notify: `/home/user/workspace/ops/lanes131/notify/INVITE-REFRESH-131.txt`.
- All logs, PR/body/READY drafts and CI receipts remain beside this report; key proofs are `INVITE-REFRESH-131-failing-refresh.log`, `INVITE-REFRESH-131-targeted-green.log`, `INVITE-REFRESH-131-home-composition-green.log` and `INVITE-REFRESH-131-ci-final-head-check.json`.

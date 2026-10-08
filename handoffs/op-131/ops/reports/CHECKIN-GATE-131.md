# CHECKIN-GATE-131 — Explain refused check-ins

Agent 131; one builder round; T1 / GPT-6.1 Sol.

Status: DONE / READY posted at 09:41:23 PDT, 2026-10-08; no blocking operator decision. [READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562#issuecomment-6064619299)

## Scope traced

- Daily check-in form, existing shared access gate and read/refresh paths; U4 from FWC-CHECKIN-128 only. [PR #562](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562)
- Inactive clients get an explicit coaching-access requirement before entry and the existing plan, coach-message or coach-code recovery action; unknown/failed checks use the shared loading/retry states. [Check-in changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
- The optional hook `enabled` argument and guarded pull-refresh avoid sending a protected check-in read while access is unconfirmed or inactive; the shared confirmed-active recheck policy is retained. [Read/refresh changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
- Active-access editing, payload, save/update, read retry and visible failure feedback remain; habits and the six-tab navigator are unchanged. [Parity tests and source](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
- No backend, entitlement-policy, billing, consent, navigation, dependency or lockfile changes. [Five-file diff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)

## B list

None.

## U list

- U4 FIXED (seen in a test): a client who joined a coach but skipped a package could type a check-in the server would refuse; the tab now explains the requirement before entry and provides the existing recovery action. [Regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)

## C one-liners

- C: unrelated workout-test readiness assertion; default defer the optional `waitFor` follow-up below, no production change. [First CI failure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113416720925)

## Acceptance evidence

- Corrected failing-first baseline on main `868a629c00e55584c5e648f5471410884cf3774c`: 8 failed, 5 passed, 13 total; failures show the missing early gate for inactive, coachless, unknown/loading/checking and failed access checks. [Test cases](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
  - Local record: `/home/user/workspace/ops/reports/CHECKIN-GATE-131-baseline-corrected.log`.
- Fix: `HabitsCheckInGate.test.tsx` 13/13 passed; `HabitsFasting.launch.test.tsx` 29/29 passed, run separately through `ops/heavy.sh`; no full local suite/typecheck/lint. [Targeted tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
  - Local records: `CHECKIN-GATE-131-gate-tests.log`, `CHECKIN-GATE-131-habits-parity-tests.log` in the same reports directory.
- Both local runs exited zero with Jest's existing asynchronous-handle notice; initial draft-test output is retained separately, but the corrected baseline above is the failing-first evidence. [Test implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/files)
- `git diff --check` clean; author/committer Bradley Gleave `<bradley@bradleytgpcoaching.com>`; no co-author trailer. [PR commit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562/commits)

## PRs

| PR | Head | Size | CI | READY / verdicts |
|---|---|---|---|---|
| [mobile #562](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562) | `daa2557e6c5364481026adff79baf54b713c45de` | 331 additions + 70 deletions = 401; five files | [Typecheck/lint/test SUCCESS](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113423800867); all three CodeQL checks SUCCESS | [READY posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562#issuecomment-6064619299); no lens verdicts requested by this builder |

At the 09:23:07 PDT GitHub recheck, the head matched the local commit, base remained `868a629c`, and the PR was MERGEABLE (BLOCKED only by pending checks/reviews). [PR #562](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562)

At 09:26:51 PDT, the same head remained MERGEABLE, but the first CI run had failed; READY was withheld until the failed-job rerun passed. [First CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113416720925)

The first CI run passed both check-in/habits files and failed only the unchanged `WorkoutScreen.calm130.test.tsx:241` assertion for `500 lb` (753 suites and 9,783 tests passed); the source sets muscle volume before awaiting the separate workout-history read, while the test waits only for the muscle value. [Failed CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113416720925)

Local failure log: `/home/user/workspace/ops/reports/CHECKIN-GATE-131-ci-first-readable.log`.

One failed-job rerun was requested at 09:34:56 PDT without a source change; it passed at the same head, and all four rollup checks were SUCCESS immediately before READY at 09:41:23 PDT. [Successful CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113423800867)

The final GitHub recheck showed exact head `daa2557e6c5364481026adff79baf54b713c45de`, main base `868a629c00e55584c5e648f5471410884cf3774c`, MERGEABLE / CLEAN, and 401 changed lines; no main merge was needed. [PR #562](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562)

Local final snapshot: `/home/user/workspace/ops/reports/CHECKIN-GATE-131-ready-snapshot.json`.

## Not fixed (needs operator)

None in scope.

## Proposed (needs operator)

- Optional test follow-up (from the code): `src/screens/client/__tests__/WorkoutScreen.calm130.test.tsx:241`, await `500 lb` before asserting the separate history-backed display; default defer, do not expand this check-in PR. [CI failure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113416720925)

## HANDOFF

- Worktree: `/home/user/workspace/wt/CHECKIN-GATE-131-mobile`; branch `agent131/checkin-gate-131`; one PR opened. [PR #562](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562)
- Current stage: builder DONE at `daa2557e6c5364481026adff79baf54b713c45de`; CI green at that head, MERGEABLE / CLEAN, READY posted and local worktree clean. [READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/562#issuecomment-6064619299)
- Next operator step: launch the two exact-head lenses; keep the PR open until both verdicts and the operator's normal merge gates are satisfied.
- No blocking operator or owner decision; optional unrelated test follow-up defaults to defer. [First-run failure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807851238/job/113416720925)
- Notify: `/home/user/workspace/ops/lanes131/notify/CHECKIN-GATE-131.txt`.
- No PR merge, deploy, flag change, production access/write or stash; no second job and no waiting for verdicts.

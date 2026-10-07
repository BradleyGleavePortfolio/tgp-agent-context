# FIX-SOL-B-128

## Scope traced
- Read the full common brief, its OWNER 14:08 override, FIX-128 entry, SoT A1, A2 owner overrides and A6.
- Queue: open agent127/agent128 T1/T2 PRs, excluding consent/privacy/money/Roman. Started 2026-10-07 14:11 PDT (sandbox date).
- No PR merge, deployment or production changes permitted. Origin/main merges into assigned PR branches are allowed.

## B list
- No current-head B queued at first reconciliation.
- #507 B1: turning System off leaves summary emails enabled because the screen mapped a field the sender does not consume; use existing `digest_email` for hydration/PATCH and daily/weekly copy. [Sol finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047451409)
- #507 B2: choosing cadence Off or Metric still leaves alerts/displays unchanged, while the screen did not disclose that choices are stored only; add explicit limitations beside all five sections and a tested link to real NotificationSettings. [Sol finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047451409)

## U list
- None yet.

## C one-liners
- None yet.

## PRs
- #507 pushed ONCE `4fcc667aa3e3795605f3b5ea5f6c7ed9b248cb0a` at 14:48:19 PDT — 331 additions + 74 deletions = 405 lines, CI pending. Claimed prior head with no earlier claim; read DES-BA-127, full body, builder report, Sol RC and Opus APPROVE. Origin/main already up to date; own worktree `/home/user/workspace/wt/FIX-507-mobile`. Both Bs fixed with payload/read-state/disclosure/navigation assertions; one targeted run passed 7/7, log `FIX-SOL-B-128-pr507-targeted.log`; author/committer verified. PR body/parity table and two owned README entries updated. [Claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047488192)
- #507 first fix CI FAILED: 690 suites / 9,139 tests passed; sole failure is an older source-string guard at `src/__tests__/clientDeadTaps126.test.ts:41-42` that still requires the wrong weekly-summary field/copy. Updated those two expectations to digest_email and daily/weekly. Typecheck/lint and all CodeQL passed. No second local run under owner one-run instruction; current rendered payload/hydration/disclosure tests passed locally and in CI. Failed log `FIX-SOL-B-128-pr507-ci-failed.log`. [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37691959222/job/113034096645)
- #507 guard-only follow-up pushed 14:59:48 PDT: CURRENT HEAD `f39057d4aca2a554f354b7ade218ad2e0b858ae6` — 333 additions + 76 deletions = 409 lines, fresh CI pending. Two total pushes: completed fix, then stale guard correction after failed CI; no WIP product code. [PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507)
- [Mobile #495](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495) claimed at `593005f123dee9039febf9ca7b360e27806a845c` for queue rule (b): both lenses APPROVE, GitHub CONFLICTING. Claim [6047090904](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495#issuecomment-6047090904); no earlier FIX claim at this head. Both verdicts, full body, original job and builder report read.
- Own worktree `/home/user/workspace/wt/FIX-495-mobile`, assigned branch `agent128/des-ah-127`; `worktree add --force` allows the finished builder's branch to remain checked out without editing its worktree.
- #495: merged main `c00a2a5f4f056148af0158edbf6b71b145dc8bc2` with README-only conflict resolution; kept ClientMacros from main before both owned Exercise entries. All five owned source/test blobs unchanged from audited head; every path outside six PR paths exactly matches merged main. No new behavioral fix needed.
- #495 READY `ed9dbbe1fa670c24139f3caf918061d6afcde105` — 288 lines, all four exact-head CI/CodeQL checks SUCCESS and MERGEABLE at 14:29:57 PDT; [FIX ROUND 2](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495#issuecomment-6047233213) posted 14:30:08 PDT. Pushed ONCE; parity 8/8 via heavy.sh, log `FIX-SOL-B-128-pr495-parity.log`; Bradley author/committer verified. Latest queue snapshot shows BOTH lenses APPROVE at this exact new head. [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689048617/job/113024227598)
- First reconciliation 14:12 PDT: 16 eligible mobile PRs, no eligible backend PRs; no queue trigger at the current heads. Older REQUEST CHANGES comments on #483/#479 do not match their current heads; no claim posted.
- Empty-queue clock begins with this reconciliation. Evidence: ops/FIX-SOL-B-128-queue.json; public PRs https://github.com/BradleyGleavePortfolio/growth-project-mobile/pulls.

## Not fixed (needs operator)
- #502 current-head join/auth B requires T4: `src/screens/auth/AcceptInviteScreen.tsx:117-127` loses the validated invite on Sign in. Recommended default: operator route to Opus; preserve invite into the existing explicit attach/sharing flow and add an existing-account regression. Not claimed or edited by Sol. [Finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502)

## HANDOFF
- #495 conflict resolved, merge-only delta READY; operator can route exact-head delta re-attestations. No PR merged or production changed. [READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/495#issuecomment-6047233213)
- OWNER CREDIT EMERGENCY received during current #507: finish only this PR to READY, one targeted test run, no further job. Deadline 20 minutes from 14:46 PDT; otherwise push WIP + handoff and finish. Worktrees retained (shared-workspace rule forbids deleting files).

## Live queue status
- Queue loop stopped by owner CREDIT EMERGENCY; no further job will be taken. Only waiting for current #507 CI, no faster than 120 seconds. Prior queue evidence: ops/FIX-SOL-B-128-polls.jsonl. [Mobile queue](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pulls)

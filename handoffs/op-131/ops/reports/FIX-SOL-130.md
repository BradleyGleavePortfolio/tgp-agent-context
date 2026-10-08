# FIX-SOL-130 — Sol fix lane, agent 130

## B list
- **Original B1 / B-524-SOL-129-1 FIXED, seen in a test:** `HomeScreen.tsx:322,333` now preserves lazy Train/You roots with `initial: false`; a client resuming a saved workout before Train opens can leave and reach the workout list, while Home Start → Back retains the You menu. [Original verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6049480961) [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237)
- **New Opus Start-path B1 FIXED, seen in a test:** `WorkoutAssignmentDetailScreen.tsx:142` adds the same flag to its existing cross-tab Start; a client using Home Start → real assignment Start → Leave with Train unopened no longer reopens the stale session on the next Train tap. [Opus finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050497325) [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237)

## Scope traced
- Read common fully, only FIX-130, required SoT/owner-decision sections, the original Home job/builder report, PR body and both verdicts for each repair; T3/T4, money, consent, privacy, Roman and Opus-built PRs remain excluded. [FIX-130 brief](/home/user/workspace/ops/lanes130/JOBS130.md) [Common brief](/home/user/workspace/ops/lanes130/_COMMON_130.md)
- One isolated worktree `wt/FIX-524-mobile`, existing `agent129/cf-home-start-128`; exact-head claims at `0eca5fc2` and `c397b2a4` were re-read with no earlier live FIX claim, and the operator had already deleted the stale FIX-SOL-129 claim. [Round 2 claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050220185) [Round 3 claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050541243) [Fleet log](/home/user/workspace/ops/FLEET130.md)

## U list
- None accepted for repair.

## C one-liners
- No edge-case work added.

## Acceptance evidence
- Failing-first: Round 2 reproduces both lazy-root failures (2 failed); Round 3 preserves those two fixes but fails the real assignment Start path (1 failed/2 passed), expecting `WorkoutMain` but receiving only `ActiveWorkout`. [Round 2 red](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-mounted-red.log) [Round 3 red](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-mounted-red.log)
- All 49 targeted tests pass, one file per `heavy.sh`: mounted 3, Home parity 17, assignment entry 15, exercise-name contract 8 and approved-set contract 6; targeted new-test lint also passes. [Mounted green](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-mounted-green.log) [Home parity](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-home-copy-green.log) [Assignment entry](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-assigned-entry-green.log) [Name contract](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-names-green.log) [Set contract](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-sets-green.log) [Lint](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-new-test-eslint.log)
- Mounted proof keeps real ClientNavigator, Home, assignment detail, ActiveWorkout and AsyncStorage; other leaves/API hooks are shallow, and native Back uses the real router action. [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237)
- The fix rounds author only three production flags; navigator, ActiveWorkout, storage and leave guard remain byte-equal to integrated approved main, and Round 3 leaves Home's prior repair unchanged. [Freeze/source proof](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-source-freeze-size-proof.log)
- Automatic main merge to `1c7336567c67b9fba198be7fef48f5e42a8a3b41` has expected/committed tree `c783976c92b36be0dadc45b2347aecd15437f1cf`, with no hand-written conflict resolution. [Merge/tree proof](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-source-freeze-size-proof.log)

## PRs
- **mobile#524, operator MERGED 19:21 PDT:** audited head `fa5e66fad4ed82549719b61ed02b34866484ed21`, `agent129/cf-home-start-128`, eight files/+267/-24 = **291 lines**; CI green/no retry, both exact-head lenses APPROVE; **Round 3 READY posted 19:07 PDT** after fresh head/state verification, then no verdict wait by this lane. [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237) [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37715566730/job/113111123086) [Operator merge log](/home/user/workspace/ops/FLEET130.md)

## Proposed (needs operator)
- None.

## Standing lane
- Return to the board after the completed repair; sleep 180 seconds when idle and handle only eligible Sol-built T1/T2 queue entries until operator STOP. [FIX-130 brief](/home/user/workspace/ops/lanes130/JOBS130.md)
- At the 19:17 PDT idle sweep, the 19:15 board shows both exact-head lenses APPROVE on m#524 at `fa5e66fa`, CI green/no conflict; m#533 and m#536 are merged, with no other eligible Sol-built fix queue entry. [Operator board](/home/user/workspace/ops/board/board.md)
- At the 19:24 PDT idle sweep, the board/fleet log records m#524 merged by the operator at 19:21; all three known Sol-built PRs are now merged, with no additional eligible fix queue entry. [Operator board](/home/user/workspace/ops/board/board.md) [Fleet log](/home/user/workspace/ops/FLEET130.md)

## Not fixed (needs operator)
- No unresolved B/U or new escalation from these fixes; both exact-head reviews and any merge remain operator-controlled. [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237)

## HANDOFF
- **#524 DONE and operator MERGED 19:21 PDT:** audited head `fa5e66fad4ed82549719b61ed02b34866484ed21`, 291 lines, CI green and both lenses APPROVE, both Bs repaired; no pending action on this PR. [Round 3 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/524#issuecomment-6050706237) [Operator merge log](/home/user/workspace/ops/FLEET130.md)
- Clean `wt/FIX-524-mobile` on existing `agent129/cf-home-start-128`, all repository work pushed once per repair round; worktree and intermediate files are preserved for operator access. [Round 3 push receipt](/home/user/workspace/ops/reports/FIX-SOL-130-pr524-round3-complete-push.log)
- Full progress history is preserved in `FIX-SOL-130-progress-through-round3-ci.md`; initial metadata/comments, claims, body/push/READY receipts, red/green logs and tree/source proofs use unique `FIX-SOL-130-pr524-*` names in `ops/reports`. [Progress history](/home/user/workspace/ops/reports/FIX-SOL-130-progress-through-round3-ci.md)
- Standing lane stays active: read board every 180 seconds, take only eligible queue work, finish the current step and save a handoff if STOP arrives; no PR merges, deployments, production writes, new dependencies or lockfile edits by this lane. [FIX-130 brief](/home/user/workspace/ops/lanes130/JOBS130.md)

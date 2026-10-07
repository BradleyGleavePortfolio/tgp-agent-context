# DES-BD-127 — learning screens

## Scope traced
- Assigned four client screens, their tests, and only their existing README entries.
- Worktree: `/home/user/workspace/wt/DES-BD-127-mobile`; branch `agent128/des-bd-127`.
- Read common overrides, assigned entry, standing rules and design references. Base main `c00a2a5f4f056148af0158edbf6b71b145dc8bc2`.

## B list
- A client opening Learn sees every lesson labelled Featured without a featured field in its data.
- A client opening coach guidelines sees a workout plan and a last-updated date even though the payload supplies only guidelines and a created date.
- A client opening the gated path screen is promised suggestions and coach review that the current adapter cannot provide.

## U list
- Timeline empty copy wrongly requires a weight entry despite four event lanes.
- Reading surfaces use category colors, filled cards, small labels and fixed palette imports.
- Path load failures escaped the loader; now distinct with refresh recovery.
- Guidelines raw exception text replaced by named connection/retry copy.

## C one-liners
- Shared trust components retain legacy styling; outside assigned files.

## PRs
- Current head `5f2cdf240dfbc883be92da525e4b4329e6a70a3a`; main merged cleanly before the product/fix pushes.
- 398 changed lines: 259 additions / 139 deletions. Only assigned screens/tests and two matching README entries.
- Local tests: 30 screen tests, 8 copy voice tests, 30 doctrine/truthful tests passed; targeted lint 0 errors, 4 pre-existing warnings.
- Failing-first evidence: `DES-BD-127-failing-first.log` (3 failures, 4 passes); final tests: `DES-BD-127-final-tests.log`; doctrine: `DES-BD-127-doctrine.log`.
- [Mobile PR #510](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/510) open at `5f2cdf240dfbc883be92da525e4b4329e6a70a3a`.
- Initial CI failed typecheck only because the imported featureFlags object is readonly. Fixed by using the mutable Jest fixture (no product flag change). Batched explicit timeline lane labels with the fix to preserve the former colored-dot information in words.
- Learning/path and timeline targeted retest: 15 passed. Latest main README auto-merge clean, worktree clean, identity verified. Fix pushed 14:40 PDT (date).
- Second CI: typecheck/lint passed; 9,098 tests passed and only the existing Wave-11 path render guard failed because its old theme mock omitted semanticColors. Added the real semantic token fixture to that test mock only.
- One targeted run under credit-emergency instructions: Wave-11 guard, 26 passed. Latest test-only fix pushed 14:49 PDT (date). CI pending at latest head; no verdicts yet.
- 15:00 PDT (date): exact-head CI Typecheck/lint/test and all CodeQL checks SUCCESS. GitHub MERGEABLE; 398 changed lines, work committed and pushed.
- [READY comment posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/510#issuecomment-6047711667), FIX ROUND 1 (OPENING), at exact head `5f2cdf240dfbc883be92da525e4b4329e6a70a3a`.
- Verdicts pending/pending; builder stops immediately after READY per override. No merge or deploy performed.
- PR body saved to `DES-BD-127-pr-body.md`. No audit verdict yet.

## Not fixed (needs operator)
- None identified.

## HANDOFF
- Completed: mobile PR #510 READY at `5f2cdf240dfbc883be92da525e4b4329e6a70a3a`, 398 lines, CI/CodeQL green and MERGEABLE.
- Main merged cleanly before push; shared README edits restricted to the two assigned entries. Latest subsequent commits fixed tests only.
- B=3, U=4 fixed. No operator/owner decision required. Shared trust-component styling remains outside scope (C).
- Operator can route both audit lenses at this exact head. Any review finding/conflict belongs to the FIX lane; this builder does not wait or take another job.
- Evidence: PR body, READY comment, failing-first log, final targeted test log, doctrine log, CI fixture-fix logs and Wave-11 targeted log saved alongside this report.

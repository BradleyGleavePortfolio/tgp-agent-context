# DES-AI-127 — routine builder

## Scope traced
- Assigned screen: `src/screens/client/RoutineBuilderScreen.tsx` and its tests only; branch `agent128/des-ai-127`, worktree `/home/user/workspace/wt/DES-AI-127-mobile`.
- Existing routes/actions: back/cancel; delete existing routine (confirmation/cancel); name; add exercise; picker search, muscle filters, choose exercise, close; move up/down; remove; sets/reps/rest; create/update and return.
- References read: common 128 brief in full; assigned DES-AI entry; SoT A1, A2 overrides, A6; design audit (c)/(e); catalog and coach-workout-builder target image/README; guide 4.2–4.8, 5.1 step 6, 5.5, VII Layer 2; doctrine and guard.
- Truthful sweep before styling: no invented data, praise, permission claims, or counts. Generic save/delete fallbacks need action-specific recovery; neutral name/example and real exercise metadata stay.

## B list
- None found in traced normal-use paths.

## U list
- Existing icon controls lack labels and 44-point targets; field labels are 11 pt, picker metadata 12 pt.
- Boxed cream surfaces and filled muscle filters compete with Save.
- Save/delete failures use generic “Please try again”; exercise picker has no loading/error/empty feedback.

## C one-liners
- None pursued.

## PRs
- [Mobile PR #493](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/493) opened; implementation complete, bounded to screen, parity test and one README entry (operator instruction 13:51).
- Failing-first proof: unchanged screen failed all 6 initial parity tests (`DES-AI-127-red-stable.log`). First fixture run allocated excessively because its query mock returned a new array each render; corrected the fixture before any product edits.
- After merging current main: targeted parity 7/7 passing (`DES-AI-127-green.log`); quiet-luxury/truthful-copy guard 30/30 passing (`DES-AI-127-doctrine.log`); targeted ESLint passed (`DES-AI-127-lint.log`).
- Updated committed head `894492371613c74a04b08eb4f99f5932ae59e08a`; 382 changed lines (292 additions + 90 deletions), three files. Author/committer verified Bradley Gleave; latest main merged again without conflict.
- 14:21 PDT: all exact-head GitHub checks green (CI typecheck/lint/full tests and CodeQL actions/JS/TS); MERGEABLE; both audit verdicts pending. ([Current CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687526713/job/113019069699))
- 14:09 PDT: GitHub confirms MERGEABLE; CodeQL green; CI typecheck failed because the test gesture fixture omitted React Native's required `_accountsForMovesUpTo` property. Added the missing fixture field; no product-code fix required. ([CI run](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686165129/job/113014422121))
- Hairline serif name, Inter rows/fields, 44-point controls, theme-only colours, one forest Save; native drag grip and existing up/down coexist; edit icon focuses inline sets.

## Not fixed (needs operator)
- None currently. Operator's 13:51 instruction authorizes the corresponding README entry; inserted only the routine-builder row in the existing logging/planning section, not at the end.

## HANDOFF
- [PR #493](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/493) is READY at exact head `894492371613c74a04b08eb4f99f5932ae59e08a`, 382 changed lines (292 additions + 90 deletions); GitHub checks green and MERGEABLE.
- [FIX ROUND 1 (OPENING)](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/493#issuecomment-6047104669) posted at 14:21 PDT; both lenses pending, no verdict claimed.
- Worktree `/home/user/workspace/wt/DES-AI-127-mobile`; branch `agent128/des-ai-127`; all assigned changes committed/pushed; working tree clean at last check.
- Three changed files: screen, its `RoutineBuilderScreen.parity.test.tsx`, and one authorized README row; existing persistence and all routes/actions retained.
- Evidence: `DES-AI-127-red-stable.log` (six failing-first tests), `DES-AI-127-green.log` (7/7), `DES-AI-127-doctrine.log` (30/30), `DES-AI-127-lint.log`; original CI fixture failure retained in `DES-AI-127-ci-failure.log`.
- Local fixture-only CI typecheck failure fixed by adding required React Native gesture field; no production-code follow-up needed.
- Operator's 14:08 override: finish after READY and notify, do not wait for audits; standing FIX lane owns review findings/conflicts. DES-AY withdrawn and not started.
- No PR merge, deployment, production flag/data write or spending. No unresolved operator/owner decision.

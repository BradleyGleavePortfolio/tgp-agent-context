# FIX-RC-128 (fixer for agent 128) — 2026-10-07 from 15:09 PDT

## Scope traced
- m#513 (PB-POOL-A, branch agent128/pb-pool-a-128): Opus REQUEST CHANGES @ 3cc98257, B1 "at most four times a day" false on deploy days
  (backend playbook-builder.scheduler.ts runs tick() 3 min after every boot plus the 6-hourly cron; only the source digest guards rebuilds).
- m#506 (DES-BC-127, branch agent128/des-bc-127): Sol REQUEST CHANGES @ 47733438 (Opus APPROVE @ same head), B1 "Limited guidance is
  available for this reply" banner shown on a plain service failure (AIGuideScreen.tsx error branch set isDegraded=true).

## B list (fixed)
- m#513 B1: src/components/coach/ai-budget/AIBudgetTutorialModal.tsx:83 copy now "When Roman learns your coaching method, each refresh
  uses a few cents of credit. Refreshes run a few times a day, only when something new was added." (no hard maximum; "only when something
  new was added" = the source-digest `unchanged` guard). Test AIBudgetTutorialModal.test.tsx asserts the new line and that "at most" is gone.
- m#506 B1: src/screens/client/AIGuideScreen.tsx:251-253 error branch now setIsDegraded(false); the failure note is the whole state; a
  returned `degraded: true` reply still shows the banner (existing test kept). New mounted regression in
  src/screens/client/__tests__/AIGuideScreen.visual.test.tsx: plain 503 shows the failure note and no "Limited guidance" banner. README
  entry (src/screens/client/README.md, AIGuideScreen row, in place) says so.
- Failing-first: per operator credit limit (one targeted run each) the run was made after the fix. The new assertions fail on the old code
  by construction: the old line contained "at most four times a day" (queryByText(/at most/) non-null), and the old error branch called
  setIsDegraded(true), which renders the banner under `isDegraded && !isOffline`.

## U list
- none.

## C one-liners
- none new.

## PRs
- m#513 head 79e0760d90c7a3cebee3728d4c7e94113498f8d7 (fix 2c174eed + merge origin/main), 33 changed lines, local jest 6/6 pass. CI green (Typecheck, lint, test; CodeQL), MERGEABLE. FIX ROUND 2 READY posted 15:22 (comment 6048055697). Verdicts at this head: pending.
- m#506 head caa9106365efbe92e5adf4dd9f4e297c06e5c124 (fix f556f1de + merge origin/main; README conflict resolved keeping both sides:
  own AIGuide row in place + main's CheckoutReturn/Membership rows), 342 changed lines, local jest 11/11 pass. CI green (Typecheck, lint, test; CodeQL), MERGEABLE. FIX ROUND 2 READY posted 15:22 (comment 6048055892). Verdicts at this head: pending.

## Not fixed (needs operator)
- none.

## HANDOFF
- Done. Claims and FIX ROUND 2 READY posted on both PRs; worktrees removed (local branches fixrc128/513, fixrc128/506 remain, pushed to
  the PR branches). Next: both lenses re-review at 79e0760d (m#513) and caa91063 (m#506).

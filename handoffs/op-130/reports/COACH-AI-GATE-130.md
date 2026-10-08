# COACH-AI-GATE-130 — Coach AI respects sharing (builder, agent 130, Claude Opus 5.5, T4 privacy, backend)
Status: DONE — READY posted 19:20 PDT 10-07 at 1509818e (started 18:16 PDT; PR opened 19:02 PDT). Builder ends at READY. Branch agent130/coach-ai-gate-130,
worktree /home/user/workspace/wt/COACH-AI-GATE-130-backend.
Source: reports/AUD-FIN-COACH-129.md (B1, B2, U3, U4). Base: backend main 0903c728 (merged into the branch, no conflict).

## Scope traced
- Daily brief: `CoachBriefService.aggregateSoloContext` (solo and sub-coach; the AI input `buildSoloAiInput` reuses it). Reads gated:
  check-ins today, "has not checked in today" list (Check-ins and habits), WeightLog flags (Weigh-ins), workouts completed today (Workouts).
  Not client logs, left as is: payments, renewals, dunning, unread messages, approved-today count. Head-coach brief is business-only.
- Coach AI: `CoachAIService.generateClientInsight` (also the weekly insight cron path), `generateWorkoutProgram` (ClientContext plus
  WorkoutContextV2 history, adherence, check-ins), `generateMealPlan`; `persistDraft` stores the scoped snapshot; controller draft
  responses (`getDraft`, `approve`, `edit`, `reject`) drop `inputContext` (`listDrafts` already selected without it). ClientContextService.build
  unchanged (auditor: Roman's client turns use it); filtering happens before the call and before storage.
- Roman adjust: `RomanAdjustService.refreshForCoach` completions query (post_rpe). Wearable samples have no Coach sharing switch.
- Churn: `ChurnInterventionService.generateChurnDraft` last check-in read and `draftWithAnthropic` prompt.
- Rule used everywhere: `ConsentService.coachCanAccess` (import only; ConsentService unchanged) through the new
  `src/consent/coach-sharing-gate.ts` (one caller-role lookup so the owner account passes, then a point lookup per client and scope).
  The four services take ConsentService without `@Optional()`; ConsentModule is `@Global`, module-graph spec green.

## B list
- B1 (proven, fixed): the daily brief listed a client who turned off Weigh-ins and Check-ins ("Weight change of 4.6 lbs needs review",
  "Has not checked in today") and counted their check-ins, weights and workouts. Fix: coach-brief.service.ts:914 (gate), queries use the
  sharing ids, `not_shared` counts (coach-brief.service.ts:1089, coach-brief.types.ts), prompt line "Not shared with the coach ..." and
  fallback copy over sharing clients only (coach-brief.service.ts:420). Output is byte-identical when everyone shares.
- B2 (proven, fixed): weekly insight, workout program and meal plan prompts carried 184.6 lbs, food totals, RPE 9, workout notes, mood 2,
  4.5 h sleep and the check-in note of a client who shares nothing; the stored snapshot held them and draft endpoints returned it.
  Fix: coach-ai.service.ts:44 `coachScopedContext`, :59 `coachScopedWorkoutContext`, :70 `notSharedNote`, :117 `coachSharing`;
  coach-ai.controller.ts:32 `withoutSnapshot` (auditor's fix line: "getDraft/listDrafts never return inputContext").

## U list
- U3 (proven, fixed): Roman adjust read effort ratings for a client who does not share workouts. Fix: roman-adjust.service.ts:231-243.
- U4 (proven, fixed): the churn draft read and sent the last check-in (mood, energy) of a client who does not share check-ins.
  Fix: churn-intervention.service.ts:395-396 plus the prompt line "Their check-ins are not shared with the coach. Do not mention check-ins."

## C one-liners
- Sub-coach brief: consent is checked for the sub-coach (same rule as the client summary in coach.service.ts); teams are off.
- The workouts-completed count covers sharing clients only.
- No ConsentService only in hand-built unit tests (all-shared, as coach.service.ts does); Nest DI is enforced (no @Optional()).
- ClientContextService.build still reads all logs; the scoped copy is what is sent and stored (auditor's advice).
- Churn PTM factor labels may summarize activity; out of scope (see Not fixed).
- Weekly insight cron is dormant (C1); it goes through the gated insight path.
- With Weigh-ins off the coach's client screen hides the whole profile (coach.service.ts:659); AI drafts drop height and weights only and keep
  goals, diet, equipment and injuries (auditor OK2: not the four switches' logs; the program safety pass needs injuries).

## Evidence
- Failing-first, final spec against main 0903c728 sources: reports/COACH-AI-GATE-130-evidence/failing-first-final-spec-on-main-0903c728.txt
  (6 failed, 1 passed: the shares-everything control). Earlier run on d6065661: failing-first-on-main-d6065661.txt.
- At the head: test/coach-ai-sharing-gate.spec.ts 7/7; 16 affected suites pass (341 tests) plus test/module-graph.spec.ts:
  reports/COACH-AI-GATE-130-evidence/legacy-runs.txt and final-runs.txt. R75 check: no positive token change.

## PRs
| PR | Head | Lines | CI | Verdicts |
|---|---|---|---|---|
| growth-project-backend#872 | 1509818e765c882721118bf1023c85d1a17b1bfd | 391 (370 + 21), 8 files | green: 15 success, 1 skipped (build-and-test success); MERGEABLE / CLEAN at 19:20 PDT | not waited for (builder ends at READY) |

CI history: b245a8aa build-and-test failed at Type-check, one error, test/coach-ai-sharing-gate.spec.ts(117,5) TS2345 (fakeOf into the optional
WorkoutContextService parameter inferred `object`). Fixed in 1509818e (`fakeOf<WorkoutContextService>`), spec 7/7 again, pushed 19:06 PDT.

## Not fixed (needs operator)
- Churn PTM factor labels (churn-intervention.service.ts:424 `topFactors`) go into the draft prompt and may describe check-in or workout
  activity for a client who does not share it. Smallest fix: map each factor to its scope and drop factors whose scope is not shared.
  Default: leave for a separate audit (out of this entry).

## Proposed (needs operator)
- Profile with Weigh-ins off: align AI drafts with the client screen (drop the whole profile) or keep goals, diet, equipment and injuries.
  Default: keep (auditor OK2; injuries are needed for the program safety pass).
- Teams launch: decide whether a sub-coach reads the head coach's consent rows. Default: decide at teams launch, same rule as coach.service.ts.

## HANDOFF
- PR growth-project-backend#872, branch agent130/coach-ai-gate-130, head 1509818e765c882721118bf1023c85d1a17b1bfd, CI green, no conflict
  (merge-tree clean against main 80cebd11 at 19:17 PDT; main was 12 commits ahead, none touch the 8 files).
- READY comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/872#issuecomment-6050845673 (19:20 PDT).
- Next owner: the two audit lenses at 1509818e. On REQUEST CHANGES, a fresh builder works in /home/user/workspace/wt/COACH-AI-GATE-130-backend
  (node_modules symlinked to shared deps), runs `/home/user/workspace/ops/heavy.sh npx jest test/coach-ai-sharing-gate.spec.ts` plus the
  16 suites listed in reports/COACH-AI-GATE-130-evidence/final-runs.txt, keeps the PR under 400 lines (now 391), and posts FIX ROUND 2.
- Strict tsc pitfall seen here: `fakeOf(...)` passed straight into an OPTIONAL constructor parameter infers `object`; give it a type argument.
- Notify line written to ops/lanes130/notify/COACH-AI-GATE-130.txt. Operator decisions: see Not fixed and Proposed (3 items, defaults given).

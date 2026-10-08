# LOGPLAN-FIN-130 (finisher, T2 mobile, operator agent 130) — "Log this meal" from the meal plan

Status: DONE. PR m#538 open, CI green at 3ade4f54, READY posted 18:44 PDT 10-07 (builder ends after READY; verdicts go to the lenses).
Source: FIX_PLANS_130_131 section B row LOGPLAN-FIN-130 -> CF-LOGPLAN-128 (JOBS128 CLIENTFIX-128 row) -> NUTR-AUD-128 job
NUTR-LOGPLAN-128 / improvement 1 (owner 14:39: "Log this meal": "yes!"). Branch agent129/cf-logplan-128 (given), worktree
/home/user/workspace/wt/LOGPLAN-FIN-130-mobile.

## Scope traced
- Original builder's branch @ 74b605e1: `src/components/mealplan/LogPlannedMealButton.tsx` (+ test 8/8) and
  `utils/log/logSubmit.ts` `submitManualLogOnlineWithId`. Re-checked against main 9b37c5df: every import, token and typography
  name exists; ManualLogArgs, NetInfo/NetworkStatus and HapticPressable style types match.
- Wire-in on m#490's final screens (merged 17:17): `src/screens/client/PlanScreen.tsx` (MealItem carbs/fat; assignmentToMealPlan
  passes carbs_g/fats_g; one button per coach/assigned row with slot `g.key`; one per AI-day meal via `plannedMealFromFoods`),
  `src/screens/client/ClientDailyMealPlanScreen.tsx` (one per slot via `plannedMealFromSlot`, slot `s.slot_label`; header
  comment no longer says the screen is read-only).
- Backend on production main 272dc8ef (read-only): `POST /log/food` returns the created entry (log.service.ts `return created`),
  so Undo's `DELETE /log/food/:id` gets the right id; `/meal-plans` items carry only calories and protein
  (meal-plans.service.ts:231-249, DTO has no carbs/fat), so those rows open the sheet for carbs and fat.

## B list
(none)

## U list
(none open; fixed: meal rows on Meal plan and the daily plan were not tappable, a planned meal could not be logged)

## C one-liners
- If the entry write fails after the food is created, an unused custom food remains (same as the Food log's manual path). C (edge, deferred to 10k clients)

## Failing-first proof
- `src/screens/client/__tests__/MealPlanLogThisMeal.test.tsx` (6 tests) run with both screens checked out at origin/main
  9b37c5df: 6/6 fail ("Unable to find an element with accessibility label: Log this meal: Pasta", "... role: button").
  Log: /home/user/workspace/ops/reports/LOGPLAN-FIN-130.failing-first.log. On the branch: 6/6 pass, no console output.
- Also green locally (heavy.sh, one file at a time): LogPlannedMealButton 8/8, MealPlan.quiet 11/11 (unchanged),
  PlanScreen.unified 4/4, clientDailyMealPlanRouteParam 5/5, deliveredContentOpens 10/10, foodLoggingContract 17/17,
  quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, wave11Doctrine 8/8; eslint clean on all changed
  files; vendor-name guard passed.

## PRs
| PR | head | lines | CI | READY | verdicts |
|---|---|---|---|---|---|
| m#538 | 3ade4f549a914bd8d84764ec41ad55b9f98d6b06 | 668 (src 326, tests 337, docs 5) | green (Typecheck, lint, test run 37713766688; CodeQL) | posted 18:44 ([comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/538#issuecomment-6050453670)) | none yet (Opus and Sol needed at this head) |

## Not fixed (needs operator)
(none)

## Proposed (needs operator)
- From the code (U, pre-existing, backend): `src/meal-plans/meal-plans.service.ts:41-48` `daysFromItems` writes `calories: r.calories ?? 0`,
  `protein_g: r.protein ?? 0` and drops carbs/fat when a coach edits an AI-approved plan, so an item whose value the coach left
  empty shows "0 kcal" on the client's Meal plan (and "Log this meal" prefills 0 kcal in its sheet). Smallest fix: `?? null` for
  both and day totals only when every item has the value. Default: post-launch backend FIX lane; not in this PR's scope.

## HANDOFF
- PR https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/538, branch agent129/cf-logplan-128 @
  3ade4f549a914bd8d84764ec41ad55b9f98d6b06 (pushed; no rebase, no force-push). Commits on top of 74b605e1: merge of origin/main
  9b37c5df (0e9663bf), wire-in + tests + README rows (1905b4cd), README wording (3ade4f54). Worktree
  /home/user/workspace/wt/LOGPLAN-FIN-130-mobile is clean (node_modules is a symlink to deps/mobile, git-ignored).
- READY line posted at that head 18:44 PDT; CI green; MERGEABLE; no conflict with main 9b37c5df at 18:44.
- PR body: /home/user/workspace/ops/reports/LOGPLAN-FIN-130.pr-body.md (tier header, what changes, B/U, routes/actions before -> after,
  truthful sweep, size). READY text: LOGPLAN-FIN-130.ready.md. Failing-first log: LOGPLAN-FIN-130.failing-first.log.
- Next (not this lane): Opus and Sol lenses at 3ade4f54; any REQUEST CHANGES goes to FIX-OPUS-130 / FIX-SOL-130. If main moves and
  conflicts, the likely files are src/screens/client/README.md (rows for PlanScreen and ClientDailyMealPlanScreen) and
  src/components/README.md (one row under Logging primitives): keep both sides.
- iOS cut 23:00 from mobile main: this PR is a client food-logging improvement (owner yes 14:39); it needs both lens APPROVEs and an
  operator merge before 23:00 to ship in tonight's build.

FIX ROUND 3 (DES-AB-127, agent 129, FIX-OPUS-129) — growth-project-mobile#490 @ dcddb2088c688f1fccf61f5d0358f11374353ff0 — READY FOR AUDIT

Fixes the failed check at the operator's main-merge head e9da3274, then a new README conflict with main. No change to this PR's code. Both lenses please re-check at this head. Both lenses approved 3c5d793b (Opus 6047540498, Sol 6047510584).

- **Failed check at e9da3274.** The "Typecheck, lint, test" run 37692511250 (attempt 1) had 1 failure out of 9151 tests: `src/screens/client/wearables/__tests__/ConnectProviderSheet.importEpoch.test.tsx:303` ("sign-out while the sheet is still open, then the import fails"). The test depends on timing: its `flush` is a `setTimeout(0)` outside `act`. This PR touches no wearables code, and the same suite is green on main 999ac84c and a1be6fb2. I re-ran the failed job (attempt 2) and it passed (SUCCESS) at e9da3274.
- **Main conflict.** GitHub then reported this PR as CONFLICTING with main. I merged origin/main e634d19e. The only conflict was `src/screens/client/README.md`. I took main's `ExerciseLibraryScreen.tsx` row, which comes from m#519 and was unchanged on this branch, and kept this PR's own `PlanScreen.tsx` and `ClientDailyMealPlanScreen.tsx` rows in place.
- **Merge-only tree check.** `git diff 3c5d793b dcddb208` is empty for `PlanScreen.tsx`, `ClientDailyMealPlanScreen.tsx` and `MealPlan.quiet.test.tsx`, and for this PR's README rows. Every other changed file comes from main.
- **Size.** The PR against main is unchanged: +384 / −126 = 510 lines in 4 files.
- **CI at this head:** 4/4 SUCCESS. Local run (ops/heavy.sh): MealPlan.quiet 11/11.

agent 129

# CF-FOOD-WATER-128

## Scope traced
- Assigned FOOD-WATER-128 only: WaterTracker U5 Starter goal labelling and U7 metric quick-add/display. Profile restoration belongs to CF-FAST-CALM-128; undo belongs to CF-FOOD-UNDO-BE-128.
- Baseline main 084ed613; own worktree `/home/user/workspace/wt/CF-FOOD-WATER-128-mobile`, branch `agent128/cf-food-water-128`.
- WaterTracker currently receives ounces from LogScreen; `clientStore.logWater` converts ounces with 29.5735 ml/oz for the existing production API.
- No open PR modifies WaterTracker or its goal test at the initial check. Components README is shared with #515; keep documentation change minimal.

## B list
- None.

## U list
- U5: Identify the unconfigured 100 oz default as a Starter goal rather than implying it was chosen.
- U7: Show ml totals, progress accessibility values and 250/350/500 ml quick-add controls for kg settings, preserving the existing ounce callback contract.

## C one-liners
- Water undo and profile hydration are explicitly outside this row.

## PRs
- Not opened yet. Targeted failing-first tests in progress.

## Not fixed (needs operator)
- Profile goal restoration remains assigned to CF-FAST-CALM-128, not this row.
- Existing settings expose the goal value but no chosen/default provenance. If CF-FAST-CALM-128 introduces provenance, expose `waterGoalIsSet` from `useSettings()` so WaterTracker can distinguish a deliberately chosen 100 oz goal from the default.

## HANDOFF
Building the assigned component-only change; no production actions.

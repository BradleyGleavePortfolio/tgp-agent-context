# CF-ONE-LIST-128 (Claude Opus 5.5, BUILDER, mobile, operator agent 129) — one Grocery list

Status: DONE 16:34 PDT 10-07. mobile#527 @ f980a8e41cf9e06430dffa542ee9f9e54878c7ee (221 lines), CI green, READY posted 16:34 (comment
6048992148). Finished per owner 14:08 override (no waiting for verdicts).
Branch agent129/cf-one-list-128, worktree /home/user/workspace/wt/CF-ONE-LIST-128-mobile, based on mobile main e634d19e.

## Scope traced
- Owner 14:39: "grocery lsit is what to buy this week, shopping lsit is just useless ... merge them/ cut one and keep one" and "makes eating
  healthy SIMPLE AND EASY". Row: keep Grocery as the one list, remove the Shopping entry points, show existing shopping items inside
  Grocery, keep every Grocery action. NUTR-AUD-128 improvement 8: the two lists are the same manual list twice.
- Mobile: GroceryListScreen.tsx and ShoppingListScreen.tsx are identical apart from list type and labels. The only Shopping entry point is
  the More row "Shopping list" (MoreScreen.tsx). The `ShoppingList` route stays registered in ClientNavigator.tsx (m#521 edits that file),
  now with no entry point.
- Backend: none needed. PATCH/DELETE /lists/items/:id are type-agnostic and owner-checked; POST /lists/shopping/clear-checked exists. Works
  against production deploy 26 as is.
- Open PRs on this area (git diff --name-only origin/main...origin/<branch>): m#514 edits PrepGuideScreen.tsx, src/services/api.ts,
  GroceryPrep.parity.test.tsx and the Grocery/Shopping/Prep README row; m#521 edits ClientNavigator.tsx. None of those files or lines is
  edited here (README change goes to "Removed surfaces", far from m#514's row).

## What the change does (mobile#527)
- GroceryListScreen.tsx: reads /lists/grocery, then /lists/shopping (only after grocery succeeds), shows both in one list; shopping rows keep
  check, uncheck, remove; Clear checked also clears /lists/shopping when a checked row came from it; new rows go to grocery; one muted line
  "Includes items from your shopping list." only when such rows exist.
- MoreScreen.tsx: the "Shopping list" row is removed.
- Tests: new src/screens/client/__tests__/GroceryOneList.test.tsx (9 tests); MoreScreen.reach.test.tsx parity rows updated + one-list test.
- Failing-first (local, main code with the new tests): GroceryOneList 6 of 9 fail; MoreScreen.reach 9 fail. With the change: all pass;
  existing GroceryPrep.parity.test.tsx (main and m#514 versions have the same grocery block) passes unchanged (14/14).

## B list
None. (Two identical lists are a U-level confusion, fixed here per owner decision.)

## U list
- U1 (fixed here): two identical manual lists (Grocery and Shopping) — owner: keep one.

## C one-liners
- C (edge, deferred to 10k clients): a name saved on both lists shows as two rows; adding a name that exists only on the old shopping list
  creates a grocery row next to it.

## PRs
- mobile#527 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/527 @ f980a8e41cf9e06430dffa542ee9f9e54878c7ee, 221 lines
  (205+/16-, 6 files), CI green (Typecheck, lint, test; CodeQL; Analyze x2), mergeable, head contains main e634d19e. READY posted 16:34
  (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/527#issuecomment-6048992148). Verdicts: none yet (Opus -, Sol -).
  Body: reports/CF-ONE-LIST-128-pr-body.md; READY text: reports/CF-ONE-LIST-128-ready-comment.md.

## Not fixed (needs operator)
- ShoppingListScreen.tsx and its `ShoppingList` route stay in the code with no entry point (deleting them needs ClientNavigator.tsx, open in
  m#521, and GroceryPrep.parity.test.tsx, open in m#514). Smallest follow-up after both merge: delete the screen, the route line and the
  shopping half of that parity test.

## HANDOFF
DONE. mobile#527 (branch agent129/cf-one-list-128, worktree /home/user/workspace/wt/CF-ONE-LIST-128-mobile) is READY at
f980a8e41cf9e06430dffa542ee9f9e54878c7ee with CI green. Waiting on the Opus and Sol lenses at that head. Review findings or a main conflict
go to the FIX lane: same branch, merge origin/main (no rebase), one push, then `FIX ROUND 2 (CF-ONE-LIST-128, agent 129) — ...`. Run the
tests one file at a time through ops/heavy.sh: src/screens/client/__tests__/GroceryOneList.test.tsx,
src/screens/client/__tests__/MoreScreen.reach.test.tsx and src/screens/client/__tests__/GroceryPrep.parity.test.tsx (must stay unchanged and
green). Follow-up (operator): after m#514 and m#521 merge, delete ShoppingListScreen.tsx, the `ShoppingList` route line and the shopping half
of GroceryPrep.parity.test.tsx.

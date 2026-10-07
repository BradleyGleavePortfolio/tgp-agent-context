## Tier header
- Tier: T2, mobile client screen behaviour (Grocery list reads and clears two existing list types; one More row removed).
- Why: owner 10-07 14:39 "grocery list is what to buy this week, shopping list is just useless ... merge them / cut one and keep one" and "makes eating healthy SIMPLE AND EASY". Grocery stays as the one list; Shopping items are shown inside it.
- T4 trigger scan: no auth, tenancy, consent, PII, money, credentials or destructive data. Writes use existing owner-checked routes (PATCH/DELETE /lists/items/:id, POST /lists/:type/clear-checked). No data is moved or deleted by this PR.
- T3 trigger scan: no backend, API schema, prompt, safety or quota change; no new dependency; no lockfile; works against production backend deploy 26 as is.
- Bounded T2: GroceryListScreen.tsx (+28/-5), one More row removed, docs, tests.
- Canonical builder: CF-ONE-LIST-128, agent 129.
- Parent owner: operator agent 129.
- Acceptance evidence: local, one file at a time through ops/heavy.sh: GroceryOneList.test.tsx 9/9, MoreScreen.reach.test.tsx 21/21, and the existing GroceryPrep.parity.test.tsx 14/14 unchanged (the grocery block is the same in main and in m#514). Failing-first: with main's GroceryListScreen.tsx and MoreScreen.tsx and these tests, GroceryOneList fails 6 of 9 (shopping rows missing, Clear checked misses shopping, Try again) and MoreScreen.reach fails 9 (the Shopping list row is still there).
- Promotion triggers: none. A one-time server-side move of shopping rows was not needed (display merge, additive, reversible).

## What changes for coaches/clients
Clients: More no longer shows "Shopping list". Grocery list shows everything the client saved on either list, in one list. Rows saved on the old shopping list can be checked, unchecked and removed as before, and Clear checked clears them too. New items go to the grocery list. While any such rows exist, one muted line says "Includes items from your shopping list." Nothing else on the screen changes. Coaches: no change.

## B/U list
- B: none.
- U1: two identical manual lists (Grocery and Shopping) confused what to buy (NUTR-AUD-128 improvement 8). Fixed per owner decision: one Grocery list.
- C (edge, deferred to 10k clients): the same name saved on both lists shows as two rows; adding a name that exists only on the old shopping list creates a grocery row next to it.

## Routes/actions before -> after
| Label/action | Before | After |
|---|---|---|
| More > Grocery list | GroceryList | Unchanged |
| More > Shopping list | ShoppingList | Removed (owner 10-07: one list); its rows now show in Grocery list |
| More > Prep guide | PrepGuide | Unchanged |
| Grocery: Back | goBack | Unchanged |
| Grocery: Add item (name, qty, unit) | POST /lists/grocery | Unchanged |
| Grocery: check / uncheck a row | PATCH /lists/items/:id | Unchanged, and works on shopping rows |
| Grocery: Remove a row | DELETE /lists/items/:id | Unchanged, and works on shopping rows |
| Grocery: Clear checked (confirm) | POST /lists/grocery/clear-checked | Same, plus POST /lists/shopping/clear-checked when a checked row came from shopping |
| Grocery: pull to refresh / Try again | refetch grocery | Refetch grocery, then shopping |
| Prep guide: Add all / View List | grocery / GroceryList | Unchanged (not edited here) |
Parity proof: MoreScreen.reach.test.tsx (every remaining More route and the no-Shopping-row assertion), GroceryOneList.test.tsx (every Grocery action on a shopping row) and the unchanged GroceryPrep.parity.test.tsx.

## Truthful sweep
- "Includes items from your shopping list." shows only when at least one row came from /lists/shopping (tested both ways).
- "N to get." and "Remove N checked items?" count the rows on screen, from both lists (tested).
- Empty state "Your grocery list is empty" only when both lists are empty (tested).
- No first person, no exclamation marks, no emojis; colours from the theme (muted note uses semanticColors.textMuted, tested).

## Open PRs on the same area, minimal diff
Based on main e634d19e. m#514 (Prep guide) edits PrepGuideScreen.tsx, src/services/api.ts, GroceryPrep.parity.test.tsx and the Grocery/Shopping/Prep README row; m#521 edits ClientNavigator.tsx. This PR edits none of those files or lines. For that reason ShoppingListScreen.tsx and its `ShoppingList` route stay registered with no entry point; delete them in a follow-up once m#514 and m#521 land. README: one bullet under "Removed surfaces" in src/screens/client/README.md and the ShoppingList row in docs/reachability.md.

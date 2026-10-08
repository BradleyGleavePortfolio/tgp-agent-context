Tier: T2
Why: Client Prep guide copy and controls follow the real origin of its recipes, and "Add all" moves from N parallel POSTs to the existing single transactional bulk endpoint. Folded NUTR-AUD-128 items for mobile#500 (merged at 0df7cc40): B1 mobile, U3 mobile, tappable recipe rows.
T4 trigger scan: No auth, tenancy, RLS, PII, credentials, money or destructive-data change. POST /lists/:type/bulk already exists in production (backend deploy 23 f73c6521, lists.controller.ts:58-69, user-scoped, one $transaction). No backend change.
T3 trigger scan: No navigator, shared architecture or lifecycle change. RecipeDetail is an existing MoreStack route taking `{ recipeId: string }`.
Bounded T1: n/a (T2: client nutrition flow; one screen, one API helper).
Canonical builder: Claude Opus 5.5, FIX-500-128 / agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: GroceryPrep.parity 21/21 passing via ops/heavy.sh; failing-first on main 4185b9b2: 9 of the new/updated cases failed before the change. quietLuxuryDoctrine 30/30, followUpDeadRows126 7/7. FIX ROUND 2 (FIX-OPUS-129): GroceryPrep.parity 24/24 at 7691dc60; failing-first with the d3a4f15d screen: the unknown-source case and both plan-source/no-week-filter cases fail (3 of the new cases). quietLuxuryDoctrine 30/30.
Promotion triggers: Stop and route to the operator if the backend `source` / `week_filter_applied` contract (NUTR-BE-128, b#853, live in backend deploy 26 87f4489b) changes.

## What changes for coaches/clients
Clients: the Prep guide no longer presents the newest recipes as "your prep for the week". Production (backend deploy 26, NUTR-BE b#853) sends `source` and `week_filter_applied: false`. `source: 'library'`: "1 recipe available to this account." and "None of these come from a meal plan.", section "Recipes". `source: 'plan'`: "from your meal plan", section "Recipes to prep", and suggested prep days if the server sends any (it sends none today). A missing source (an older backend) is unknown, not library: "available to this account" with no plan claim either way. The week arrows show only when the server filters by week (`week_filter_applied: true`); today it never does, so arrows that would change nothing are hidden for every source. Once the client is off the current week the selector stays, so they can always come back. Each recipe row now opens the recipe. "Add all" sends one request: either every ingredient is added or none is, and the message says so. Coaches: no change.

## B / U list
- B1 (NUTR-AUD-128 B1, mobile half): a client whose coach never planned any recipe opens Prep guide and is told "6 recipes for the week" with suggested prep days. Fixed: copy, section title, week selector and prep days now depend on `source` (missing = library). PrepGuideScreen.tsx summary/selector/prep-day blocks.
- U3 (NUTR-AUD-128 U3, mobile half): "Add all" fired one POST per ingredient, so a failure could add only some. Fixed: one `listsApi.bulkAdd('grocery', items)` (POST /lists/grocery/bulk). Success count comes from the server's `added`; failure says "Nothing was added to your grocery list. Try again." (true: the endpoint is one transaction). Duplicate merging on the server is NUTR-BE-128's half.
- U (dead-button table, improvement 4): recipe rows were not tappable. Fixed: each row opens RecipeDetail `{ recipeId }`, 44 pt row, outline chevron, label "Open <title>".
- C: section titles now sentence case ("Recipes to prep", "Suggested prep days", "Ingredients"), from the m#500 Opus C.
- FIX ROUND 2 (FIX-OPUS-129, Sol @ d3a4f15d): B1 a missing `source` no longer denies a meal plan: "None of these come from a meal plan." shows only for explicit `source: 'library'` (PrepGuideScreen.tsx:95,219). U1 the week selector follows `week_filter_applied === true` (or off the current week), not the source (PrepGuideScreen.tsx:98).

## Routes/actions before -> after
| Screen | Label/action before | Destination/effect after |
|---|---|---|
| Prep | Back | Same navigation.goBack() |
| Prep | Previous / next week | `week_filter_applied: true`: same weekOffset -1/+1 and weekly query. False or missing (production NUTR-BE sends false for both sources) on the current week: hidden (rule 2: the backend ignores `week`, content was identical). Off the current week: always shown so the client can return |
| Prep | Pull to refresh | Same weekly query refetch |
| Prep | Add all (confirm / Cancel) | Same confirmation and Cancel; Add -> one listsApi.bulkAdd('grocery', all ingredients) instead of N addItem calls; disabled when empty/pending as before |
| Prep | Success OK | Same alert dismissal |
| Prep | Success View List | Same navigation.navigate('GroceryList') |
| Prep | Recipe rows | Were informational -> open RecipeDetail { recipeId } |
| Prep | Suggested prep day badges (not tappable) | Shown for plan source only (rule 1: hard-coded days, invented for library recipes) |
| Grocery / Shopping | all actions | Unchanged (not touched) |

Parity tests: back, both week arrows (server filters by week), return to current week from another week, refresh, Add all confirm/cancel/bulk add, success View List, recipe row -> RecipeDetail, library state hides week arrows and prep days, unknown source stays neutral, plan source without a week filter hides the arrows.

## Truthful sweep
| File:line (main 4185b9b2) | Old line | What is true | Replacement |
|---|---|---|---|
| PrepGuideScreen.tsx summary | "{n} recipes for the week." | Production returns the latest visible recipes, no week filter | Plan: "{n} recipe(s) from your meal plan."; else "{n} recipe(s) available to this account."; plus "None of these come from a meal plan." only for `source: 'library'` |
| PrepGuideScreen.tsx empty | "No recipes to prep" / "Recipes from a meal plan appear here for the selected week." | Empty means no plan recipe and no visible recipe; week is not used | "No recipes yet" / "Recipes from a meal plan or available to this account appear here." |
| PrepGuideScreen.tsx section | "Recipes to Prep (n)" | Only a plan makes them prep | Plan: "Recipes to prep (n)"; else "Recipes (n)" |
| PrepGuideScreen.tsx confirm | "Add n aggregated ingredients from this week's recipes…" | Not week-bound | "Add n ingredient(s) from these recipes to your grocery list?" |
| PrepGuideScreen.tsx error | "Could not add all ingredients" / "Some ingredients may already be in the grocery list…" | Bulk endpoint is one transaction: nothing was added | "Could not add the ingredients" / "Nothing was added to your grocery list. Try again." |
| PrepGuideScreen.tsx success | "{length} ingredients added" | Server returns `added` | "{added} ingredient(s) added to your grocery list." |

## Documentation and scope
src/screens/client/README.md: the existing grocery/shopping/prep row edited in place. Files: PrepGuideScreen.tsx, services/api.ts (`listsApi.bulkAdd`), GroceryPrep.parity test, README row. Works against production backend deploy 26 87f4489b (`source` and `week_filter_applied` present; bulk endpoint present) and against an older backend (missing `source` = neutral). No dependency, lockfile, navigator or backend change.


# CF-ALLERGY-128 (Claude Opus 5.5, builder, T4 safety) — agent 129

Status 16:37 PDT: STOPPED by operator (credits). Backend work committed and pushed to my own branch; NO PR opened; no READY. Mobile not started.

## Scope traced
- Backend main c3324d4a: recipes (src/recipes/*) and prep guide share visibleRecipesWhere; nothing filtered by allergies. No recipe edit endpoint; mobile has no recipe-writing UI (owner deferred coach recipe writing to after iOS).
- Saved allergies: UserProfile.dietary_restrictions (app chips "Nut Allergy", "Peanut Allergy", "Shellfish Allergy", "Egg Allergy", "Dairy Allergy", "Gluten-Free", "No Fish"; consultation N2 "nuts", "dairy", "gluten", "shellfish", "eggs", "soy").
- Production read-only SELECT 16:20: 0 Recipe rows; 0 profiles with saved restrictions. Open PRs touching the area: backend none; mobile m#494 (Recipes screens), m#514 (PrepGuide, api.ts).

## B list
- B1 (built, not yet in a PR): a client with a nut allergy is shown every coach recipe, including ones with nuts; nothing filters by allergies.

## U list
- none
## C one-liners
- Meal templates/meal plans allergen lines: not small (needs coach template editor + client daily plan on open m#490); follow-up.

## PRs
- none. Branch agent129/cf-allergy-128 pushed, head be06333cae3d8743982e734ead86483f0d269289 ( 13 files changed, 783 insertions(+), 14 deletions(-)).
- Local targeted runs (heavy.sh) green: test/recipes-declared-allergens.spec.ts 39/39 (new; fails on main: no src/recipes/allergens.ts, no allergen rule), recipes-tenant-visibility 34/34, nutrition-services-128 16/16, data-export-archive-inventory 13/13, account-deletion/recipe-erasure 5/5. tsc not run locally (CI does it).

## Not fixed (needs operator)
- Open the backend PR from agent129/cf-allergy-128 (T4, both lenses; body must say loudly: additive migration 20270404000000_recipe_declared_allergens, two columns on an empty table, down.sql). Then the mobile PR after m#494 merges.

## HANDOFF
- Backend: branch agent129/cf-allergy-128 @ be06333cae3d8743982e734ead86483f0d269289 (worktree /home/user/workspace/wt/CF-ALLERGY-128-backend). Done: allergens.ts (one list + exact saved-answer lookup), Recipe.allergens/allergens_declared + migration + down.sql, POST /recipes accepts allergens + allergensDeclared, list/saved/detail/save/prep guide hide only on declared match (own recipes exempt, 404 RECIPE_HIDDEN_FOR_ALLERGENS), GET /recipes/allergens, export select, tests.
- Left: open the PR (tier header, B/U, failing-first cite), CI green, READY line "FIX ROUND 1 (OPENING) (CF-ALLERGY-128, agent 129) — growth-project-backend#<n> @ <sha> — READY FOR AUDIT".
- Mobile (worktree /home/user/workspace/wt/CF-ALLERGY-128-mobile, branch agent129/cf-allergy-128, untouched): after m#494 merges, show "Allergens not declared" / "Contains: ..." on recipe rows and detail from allergens_declared/allergens, keep the "check each recipe's ingredients" line, make AllergySafetyPrompt copy state-driven (claim hiding only when GET /recipes/allergens answers; current production keeps today's copy), parity table + README.

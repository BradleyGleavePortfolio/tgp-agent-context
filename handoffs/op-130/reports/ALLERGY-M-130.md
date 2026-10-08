# ALLERGY-M-130 (Claude Opus 5.5, builder, mobile half of allergy filtering) — agent 130

Status 19:29 PDT: DONE. growth-project-mobile#544 READY FOR AUDIT @ 62d1c54657fb6fff2687691eb5344dfc9b563696 (posted 19:28 PDT),
CI green at that head, mergeable clean against mobile main 5c354562. Built after b#868 was deployed (deploy 31, 19:16 PDT).

## Scope traced
- Entry: FIX_PLANS_130_131 D1 "Mobile half of real allergy filtering, after ALLERGY-FIN-130 is deployed"; JOBS130 recon row "read-only
  prep now (waiting rule)"; JOBS128 CF-ALLERGY-128 (hide only on a declared match, label undeclared, keep the check-ingredients line,
  no keyword guessing); reports/CF-ALLERGY-128.md HANDOFF (mobile plan).
- Predecessor m#494 (DES-AN Recipes) is merged on mobile main (a224c697).
- Backend contract (agent129/cf-allergy-128, read via git show; src/recipes, src/prep-guide and schema.prisma are unchanged from be06333c
  to b#868 head a2caccf1):
  - GET /recipes, /recipes/saved, /recipes/:id and /prep-guide rows gain `allergens: string[]` (codes) and `allergens_declared: boolean`.
  - Shared recipes that declare a saved allergen are left out.
  - GET /recipes/:id and POST /recipes/:id/save answer 404 `RECIPE_HIDDEN_FOR_ALLERGENS`.
  - GET /recipes/allergens answers `{ allergens: [{code,label}] x9, your_allergens: code[] }`. On today's production that path falls into
    GET /recipes/:id and answers 404 RECIPE_NOT_FOUND, so the app can tell the two backends apart.
- Mobile main 028f2926, before this change:
  - RecipesScreen rows and RecipeDetailScreen show nothing about allergens.
  - AllergySafetyPrompt says "Recipes are not filtered by it", which is true today and false after the deploy.
  - RecipeDetailScreen keeps painting the list-cache copy when GET /recipes/:id fails.
  - RecipesScreen does not refetch after the prompt saves restrictions (5 min staleTime, cache persisted for 24 h).
  - No recipe-writing UI exists on mobile.
- Every chip in the prompt (Nut, Peanut, Shellfish, Egg and Dairy Allergy, Gluten-Free) maps to a backend allergen code;
  Vegetarian, Vegan and Pescatarian map to none. Logout empties the live and persisted query caches, so the guide read cannot
  cross accounts.

## B list
- B1 (fixed, seen in a test): after the deploy the prompt says "Recipes are not filtered by it" (false), and rows do not mark recipes
  whose allergens were never declared, so a client could read the list as already filtered. Fixed with state-driven prompt copy
  (on / off / unknown, from GET /recipes/allergens; the prompt waits for that read) and labels from the author's declaration on rows,
  detail and the prep guide.
- B2 (fixed, seen in a test): a client saves "Nut Allergy" in the Recipes prompt and the list is not read again, so a recipe declaring
  peanuts stays listed. Opening it paints the cached copy, and the screen keeps it after the server answers 404
  RECIPE_HIDDEN_FOR_ALLERGENS. Fixed: recipe reads refresh after the save, and a 404 on the detail wins over a cached copy, with its own
  hidden line and no retry.

## U list
- U1 (fixed, seen in a test): an allergy change in Edit Profile leaves recipe lists stale for up to 5 min. Fixed with the same refresh
  (refreshRecipeReads).
- U2 (fixed): Prep guide recipe rows say nothing about allergens. They now carry the same line.

## C one-liners
- C (edge, deferred to 10k clients): a bookmark tap that races a newly hidden recipe (POST /recipes/:id/save -> 404 hidden) shows the
  generic "Could not update saved recipe ... check your connection" alert. Rare, because the refresh after saving removes the row first.
- C: src/lib/profileCompletion.ts:31 still has the code comment "The recipe engine reads this". It is not user-facing; left as is.
- C: meal plan and meal template allergen lines are out of scope here (backend follow-up too).

## PRs
- growth-project-mobile#544 (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/544), branch agent130/allergy-m-130,
  head 62d1c54657fb6fff2687691eb5344dfc9b563696 (commit d1c2dd6b plus merges of mobile main; last merge 5c354562, one README conflict
  resolved by keeping both rows). About 475 lines (450+/25-, 243 of them tests).
  - CI at head: Typecheck, lint, test success; CodeQL success; Analyze (actions) success; Analyze (javascript-typescript) success.
  - READY posted 19:28 PDT:
    https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/544#issuecomment-6050934144
  - Verdicts: not waited for (builders end after READY).
  - PR body: /home/user/workspace/ops/reports/ALLERGY-M-130-pr-body.md; READY text: ops/reports/ALLERGY-M-130-ready.md
- Local (heavy.sh, one file at a time):
  - New tests: Recipes.allergens130 9/9 (failing-first 9/9 on main's screens), AllergySafetyPrompt.copy 10/10, EditProfileScreen 13/13
    (the new case fails on main's screen).
  - Unchanged suites: Recipes.quiet128 7/7, Recipes.saved128 4/4, GroceryPrep.parity 24/24, followUpLoadErrors126 5/5,
    quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, wave11Doctrine 8/8, followUpDeadRows126 7/7,
    testflightP0Blockers 16/16.
  - ESLint on the changed files: 0 errors; the 1 warning is pre-existing at RecipesScreen:161. Targeted tsc over the changed files: clean.

## Proposed (needs operator)
- The prompt has no Soy or Sesame allergy chips, and the backend does not map "soy allergy" or "sesame allergy" (only "soy" and
  "sesame"), so a client cannot save those two from the app. Default: add both chips and both backend map entries after the iOS
  submission.

## HANDOFF
- State: growth-project-mobile#544 READY FOR AUDIT @ 62d1c54657fb6fff2687691eb5344dfc9b563696, CI green at that head, mergeable clean
  against main 5c354562. Not merged (builder never merges). For the 23:00 iOS cut it needs Opus + Sol APPROVE at this head and a merge.
- Files: src/lib/recipeAllergens.ts (new: labels, rule read, refresh), src/services/api.ts (recipesApi.allergens),
  src/components/AllergySafetyPrompt.tsx (state-driven lede, `rule` prop with default 'off'), and these screens:
  - RecipesScreen: row line, hidden note, the prompt waits for the rule read, refresh after save.
  - RecipeDetailScreen: ALLERGENS section, a 404 wins over cache, hidden line.
  - PrepGuideScreen: row line.
  - EditProfileScreen: refresh after saving diet_restrictions.
  - The two READMEs and three test files.
- Auditor checks: Recipes.allergens130 (9), AllergySafetyPrompt.copy (10) and EditProfileScreen (13) are the acceptance tests. The
  contract is the one b#868 deployed: allergens, allergens_declared, GET /recipes/allergens, 404 RECIPE_HIDDEN_FOR_ALLERGENS.
- Left open: Soy and Sesame chips (Proposed); C one-liners above. Branch fully committed and pushed; worktree clean.

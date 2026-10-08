# ALLERGY-128 (Claude Opus 5.5, builder, T3 safety copy) — agent 128

## Scope traced
- Backend main 0d179edb: `GET /recipes`, `/recipes/saved`, `/recipes/:id` (src/recipes/recipes.service.ts:25-27, 38, 115) all use `visibleRecipesWhere` (src/recipes/recipe-access.ts): creator + coach tenancy only. Nothing in src/recipes, src/meal-plans, src/real-meal-plans, src/prep-guide, src/lists reads `dietary_restrictions`. **Nothing filters recipes by allergies.**
- Where the saved answer goes: mobile `profileApi.update({ diet_restrictions })` -> backend `user_profile.dietary_restrictions` (profile.service.ts:322). Read by Roman's per-turn context (roman-client-context.service.ts:990, Roman chat is ON), the coach AI meal-plan prompt (ai/prompts/meal-plan.prompt.ts:52; mobile CoachAiSection mirrors it into notes), and the coach client Safety section (SummaryTab) only when the client shares weigh-ins (coach.service.ts getClientSummary returns `profile` only if `bodyMetrics`). All conditional, so the prompt claims only "saved to your profile".
- `src/lib/profileCompletion.ts:31` "The recipe engine reads this": stale code comment, no recipe engine filter exists. Not user-facing; left.

## B list
- B1 (fixed, m#505): a client opening Recipes picks a nut allergy, is told "Your recipe library will hide anything that conflicts", but every recipe still shows; they could cook a nut recipe trusting it.

## U list
- U1 (fixed, m#505): first-person overline "BEFORE WE BEGIN" -> "BEFORE YOU BROWSE".
- U2 (not here): EditProfileScreen hint "The recipe library hides anything that conflicts with these." was the same false claim; fixed by m#496 (DES-AP-127), now merged on main.

## C one-liners
- None.

## PRs
- growth-project-mobile#505 — branch agent128/allergy-128 — head 0cb43959178712c38c3e53fb54f5996cb17be786 (merge of origin/main over ecee5c13) — 107 lines (+101/-6) — CI green — READY posted 14:46 PDT (FIX ROUND 1 OPENING) — verdicts: not waited for (owner 14:08 override).
- CI note: the first head failed twice on an unrelated wearables test (ConnectProviderSheet.attemptFence.test.tsx, sync getByText after async work; passes locally 21/21). Green after merging main.
- Failing-first: locally on main c00a2a5f the 3 copy tests failed, 2 behaviour tests passed; after the fix 5/5 pass. quietLuxuryDoctrine (30) and wave11Doctrine (8) pass locally.

## Owner decision (NEW)
- D1: real allergy filtering of recipes/meal plans. Recommended default: do NOT filter for launch (keyword matching gives false negatives = false safety); keep the honest copy. Post-launch option: structured per-recipe allergen tags set by the recipe author, then hide only recipes tagged with a saved allergen, with the "check ingredients" line kept.

## Not fixed (needs operator)
- None blocking. Watch m#496 (EditProfile hint) merges.

## Filtering design input (owner 14:39: real filtering "absolutely necessary"; not built)
- Where allergies are stored: `UserProfile.dietary_restrictions String[]` (prisma/schema.prisma ~898). Free strings, two vocabularies: the Recipes prompt / Edit Profile chips save labels ("Nut Allergy", "Peanut Allergy", "Shellfish Allergy", "Egg Allergy", "Dairy Allergy", "Gluten-Free", "Vegetarian", "Vegan", "Pescatarian"; None -> []) via `diet_restrictions` (profile.dto.ts ~273, mapped at profile.service.ts:322); the consultation saves slugs from N2 ("dairy", "gluten", "nuts", "shellfish", "eggs", "soy", "pork", "halal", "kosher", "other"; consultation-answers.ts:419). The DTO accepts any string.
- Recipe data to filter on: `Recipe` has `ingredients String[]` (free text) and `tags String[]` (free text). No structured allergen field. MealPlan `items`/`days` are Json; MealTemplate `items` Json; FoodItem has free `tags`. Nothing structured to filter on.
- Client-facing endpoints: `GET /recipes`, `GET /recipes/saved`, `GET /recipes/:id` (recipes.controller.ts, student; policy recipe-access.ts `visibleRecipesWhere`), `GET /prep-guide` (shares the recipe policy), `GET /meal-plans`, `GET /meal-plans/:id`, `GET /me/meal-plan` (client-meal-plans.controller.ts), `GET /me/meal-plan/today` (real-meal-plans.controller.ts). Coach writes: `POST /recipes` (creator), `POST /coach/clients/:client_id/meal-plans`, `POST /coach/meal-templates`, `POST /coach/daily-meal-plans`(+ assignments), AI meal-plan draft (ai/prompts/meal-plan.prompt.ts, LLM-only rule).
- Smallest safe design (never keyword guessing): (1) one canonical allergen enum (e.g. the 9 major allergens + gluten) shared by backend and mobile, with a mapping from both saved vocabularies; (2) additive `Recipe.allergens String[]` and `Recipe.allergens_declared Boolean @default(false)` set by the author on create/edit (required checklist, "contains none" explicit); same for MealTemplate; (3) `visibleRecipesWhere` + prep-guide hide recipes whose declared allergens intersect the client's, and mark undeclared recipes "Allergens not declared" instead of implying safety; (4) meal plans: show a per-item allergen line from declared data and warn the coach at assign time when declared allergens conflict; free-text/AI plans stay "check ingredients"; (5) keep the "check each recipe's ingredients" line. T4-adjacent (health data in a query) -> Claude Opus 5.5 builder.

## HANDOFF
- Worktree /home/user/workspace/wt/ALLERGY-128-mobile, branch agent128/allergy-128, PR m#505. PR body: ops/reports/ALLERGY-128-pr-body.md.
- Next for a fresh agent / FIX lane: act on lens verdicts at the READY head. Files: src/components/AllergySafetyPrompt.tsx, src/components/__tests__/AllergySafetyPrompt.copy.test.tsx, src/components/README.md.

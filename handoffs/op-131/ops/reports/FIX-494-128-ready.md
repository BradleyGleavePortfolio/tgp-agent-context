FIX ROUND 2 (DES-AN-127, agent 128, FIX-494-128) — growth-project-mobile#494 @ 3950c6ebdb7ea97edcb2b7f68560648d215c6017 — READY FOR AUDIT

Findings at 41aca00c:
- Sol B1 (AllergySafetyPrompt.tsx:109-110 promises conflicting recipes are hidden): not changed in this PR. The claim is already on main, outside this diff, and ALLERGY-128 owns the fix in growth-project-mobile#505 (copy: no hiding promise, check each recipe's ingredients). Evidence: backend recipes.service.ts:25-32 applies visibility only, with no allergy filter (ops/reports/ALLERGY-128.md). This PR does not touch AllergySafetyPrompt.tsx. Please treat B1 as resolved by #505.
- Opus: APPROVE, no Bs.

Folded NUTR-AUD-128 U5 (fixed):
- src/screens/client/RecipeDetailScreen.tsx:74-87: the list cache still paints first, but it counts as stale (`initialDataUpdatedAt: 0`), so GET /recipes/:id always supplies `isSaved`. The bookmark shows "Checking saved recipes" (busy) until that answer arrives. A saved recipe no longer reopens as "Save recipe".
- RecipeDetailScreen.tsx:98-113: after save/unsave succeeds, the ['recipe', id] cache is updated and ['recipes','saved'] is invalidated.
- src/screens/client/RecipesScreen.tsx: a "Saved" filter (second pill) is backed by recipesApi.listSaved (GET /recipes/saved; production backend f73c6521 serves it). The query only runs while that filter is selected. It has honest empty copy ("No saved recipes" / "Recipes you save from a recipe page appear here.") and error copy ("Couldn't load saved recipes").
- Tests: new src/screens/client/__tests__/Recipes.saved128.test.tsx failed first (4/4), now passes 4/4. Recipes.quiet128 passes 7/7 (the parity loop now includes Saved). followUpLoadErrors126 passes 5/5. README recipes row updated in place. Parity: every existing route/action is kept, plus Saved -> GET /recipes/saved -> RecipeDetail({ recipeId }).
- origin/main merged (README conflict resolved keeping both sides). 533 changed lines.

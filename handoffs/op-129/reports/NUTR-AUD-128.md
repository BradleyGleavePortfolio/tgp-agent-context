# NUTR-AUD-128 (Claude Opus 5.5, AUDITOR, read-only, T2/T3) — meal plans, grocery, shopping, prep, recipes

Status: DONE 14:26 PDT 10-07. Read-only: no code, no PRs, no comments.
Code read at mobile main d0875d26 (wt/RO-mobile) and backend main 0d179edb (wt/RO-backend). Open redo PRs judged at their heads:
m#490 DES-AB @ 4314f0dd (CI green; Opus APPROVE, Sol REQUEST CHANGES B-490-1 "Created" label), m#494 DES-AN @ 41aca00c (CI green;
Opus APPROVE, Sol REQUEST CHANGES = allergy copy, already routed to ALLERGY-128), m#500 DES-AO @ 0df7cc40 (CI green; READY, no verdicts yet).
Production data was not queried (no Supabase reads); claims about production content are inferred from code and seed scripts.

## Scope traced
Client (More tab > PLAN_MORE_ITEMS / MORE_ITEMS, src/screens/client/MoreScreen.tsx:48-185):
- Meal plan = PlanScreen (route `Plan`): merges GET /meal-plans (legacy MealPlan + canonical fallback) and GET /me/meal-plan/today.
- ClientDailyMealPlanScreen (route `ClientDailyMealPlan`): reached only from Deliverables drops (deliverables/dropRow.tsx:230).
- Macro targets (ClientMacrosScreen) — read-only, honest empty state; no findings.
- Recipes + RecipeDetail, Grocery list, Shopping list, Prep guide.
Coach: ClientDetail > "Plan" tab (MealPlanTab + modal in ClientDetailScreen.tsx:158-250, legacy MealPlan CRUD), AI meal-plan draft
(AIMealPlanDraftScreen, backend coach-ai.service.ts:559 materializeMealPlan), CoachMealTemplatesScreen (registered, no entry point).
Backend: src/meal-plans, src/real-meal-plans, src/recipes (+recipe-access.ts), src/lists, src/prep-guide.

How the pieces really connect today (the root of most findings):
- The only in-app way a coach makes a meal plan is the legacy ClientDetail "Plan" tab or an approved AI draft. Their items carry
  name / kcal / protein / notes / time_of_day only: no recipe link, no carbs/fat (ClientDetailScreen.tsx:192-203).
- There is no in-app way for a coach to create a recipe (recipesApi.create at services/api.ts:1033 has no caller) or a canonical
  DailyMealPlan / assignment (useAssignDailyMealPlan, useCreateDailyMealPlan unused; CoachMealTemplatesScreen has no navigate()).
  Recipes reach clients only through the operator seed script (prisma/seed-recipes.ts, one named coach).
- So the Prep guide never finds a plan-linked recipe and always falls back to "the latest 6 recipes you can see"; Grocery and
  Shopping lists are two identical manual lists; nothing on any plan screen can be logged into the food log.
- Check-off state: stored server-side (ListItem.is_checked, lists.service.ts:35-48) so it survives restarts and days. Good.
- Tenancy: meal plans (assertClientOfCoach, meal-plans.service.ts:61-68), recipes (recipe-access.ts), lists (user_id checks) are
  correctly scoped. No privacy finding.

## (1) B list
B1 — Prep guide lists recipes nobody planned as "your prep for the week" (false customer-facing claim; owner honest-copy rule 1).
- Story: a client of a coach who has shared recipes opens Prep guide and sees "Recipes to Prep (6)", "Suggested Prep Days: Sunday,
  Wednesday" and an ingredient list to buy, although their coach never put any of those recipes in a plan; every week arrow shows the
  same six.
- Where: backend src/prep-guide/prep-guide.service.ts:51-58 (plans not filtered by week; `weekStart` only echoed), :60-77 (only
  legacy `items[].recipe_id`, which no coach path writes), :90-96 (fallback = latest 6 visible recipes), :35/:143 (hard-coded days).
  Mobile src/screens/client/PrepGuideScreen.tsx:195-208 (empty copy "Ask your coach to assign a meal plan with recipes"), section
  title "Recipes to Prep". m#500 @ 0df7cc40 makes it more explicit: "Recipes from a meal plan appear here for the selected week." and
  "{n} recipes for the week." — both untrue with the current backend.
- Smallest fix: backend returns an additive `source: 'plan' | 'library'` (plan only when recipe ids came from plan items) and stops
  pretending a week filter exists; mobile, when `source !== 'plan'`, titles the section "Recipes shared with you", drops "for the
  week" and the prep-day badges, and hides the week arrows (rule 2: they change nothing). Old builds keep working (field ignored).
  Operator may grade this U if "false claim" is read as marketing-only; either way it must not ship with m#500's new copy.
No other B: no money, privacy, safety or data-loss path in this area; logging food itself is untouched by these screens.

## (2) U list
U1 Meal plan shown twice. A client with a canonical (delivered) plan sees it once as "Today · <name>" from /me/meal-plan/today and
   again as "<name>" from /meal-plans' canonical fallback. mobile PlanScreen.tsx:244-256 (merge, no de-dup); backend
   meal-plans.service.ts:181-193. Fix (mobile, inside m#490's next round or after it): drop legacy rows whose `source ===
   'real-meal-plans'` when the today response returned any assignment. m#490 does not fix this.
U2 Ended plan still shown as current. /meal-plans' fallback takes the newest assignment with no ends_on check
   (meal-plans.service.ts:199-212), so after a plan ends it keeps appearing on PlanScreen. Fix: add
   `OR: [{ ends_on: null }, { ends_on: { gte: today } }]` like real-meal-plans.service.ts:289.
U3 Grocery list doubles up. "Add all" in Prep guide (PrepGuideScreen.tsx:76-88) posts every ingredient again; addItem always creates
   a new row (lists.service.ts:22-33). Tapping it twice, or adding "eggs" by hand when "eggs" exists, gives duplicate rows. Fix:
   addItem merges into an unchecked row with the same lower-cased name + unit (sum quantity); mobile should call the existing
   transactional POST /lists/grocery/bulk instead of N parallel POSTs.
U4 Wrong aggregation of units. prep-guide.service.ts:176-182 keeps the unit as typed, so "1 cup rice" + "2 cups rice" become two lines
   ("rice 1 cup", "rice 2 cups"); tbsp/tablespoon, lb/lbs likewise. Fix: map unit to a canonical singular before keying.
U5 Saved recipes: wrong state and nowhere to see them. RecipeDetail paints from the list cache (RecipeDetailScreen.tsx:67-78) which
   has no `isSaved`, and staleTime 5 min with initialData means no refetch, so a saved recipe reopens as "Save recipe". There is no
   Saved view (recipesApi.listSaved unused). Fix: drop initialData for isSaved (or `initialDataUpdatedAt: 0`) and add a "Saved" tag
   filter in RecipesScreen backed by /recipes/saved. Not fixed by m#494.
U6 Recipes empty state promises coach recipes the coach cannot add in the app ("Recipes added by your coach will appear here",
   RecipesScreen.tsx:327). m#494 already changes it to "Recipes available to this account appear here." — fixed at head.
U7 Coach copy points to a tab that does not exist: "the client will see it on their Plan tab" (client-detail/MealPlanTab.tsx:57-59).
   Fix: "The client sees it under Meal plan."
U8 Approving an AI meal plan lands the coach on the client's Summary, not the meal-plan tab, though the flow says it does
   (AIMealPlanDraftScreen.tsx:10 vs :225). Fix: pass `initialTab: 'mealplan'` (ClientDetailScreen already reads it, line 86).
U9 More menu says "The meals planned for you this week" (MoreScreen.tsx:52) but plans are not weekly. Fix: "The meals your coach
   planned for you".
U10 Grocery/Shopping error state says "Pull down to try again" with no RefreshControl on that branch (GroceryListScreen.tsx:263-268,
   ShoppingListScreen same) — dead end. Fixed at m#500 head (Try again button).
U11 PlanScreen "Assigned <today>" date on the today-plan (PlanScreen.tsx:226) — fixed at m#490 head except the /meal-plans canonical
   row (Sol B-490-1, already open on m#490; do not duplicate).
U12 Daily meal plan has per-slot macros but no day total (ClientDailyMealPlanScreen.tsx:139-141); legacy PlanScreen has one. Fix:
   one tabular total line under the plan name.

C (edge, deferred to 10k clients): Prep guide "Add all" partial failure leaves some items added (N parallel POSTs); grocery toggle
failure reverts silently; coach edit of an AI plan drops carbs/fat (meal-plans.service.ts:38-45); Prep guide week start from server
`new Date()` vs device week.

## (3) Dead-button table (mobile main; "PR" = state at the open PR head)
| Screen | Control | What it does | Verdict |
|---|---|---|---|
| Prep guide | Previous / next week arrows | Change the label; backend ignores `week`, content identical | DEAD in effect (B1). Not fixed by m#500 |
| Prep guide | Add all | Adds every ingredient to grocery list | Works; duplicates on repeat (U3) |
| Prep guide | Suggested prep day badges | Static Sunday/Wednesday, not tappable | Not a button; invented content (B1) |
| Prep guide | Recipe rows | Not tappable; no way to open the recipe | Missing link (improvement 4) |
| Grocery / Shopping | Check circle, remove, add, Clear checked | Real server writes | Work |
| Grocery / Shopping | Error "Pull down to try again" | No pull-to-refresh on that branch | DEAD; fixed in m#500 |
| Recipes | Search, tag chips, recipe card | Client-side filter, opens detail | Work |
| Recipe detail | Bookmark | Saves on server, but state shows unsaved on reopen; no Saved list | Half-dead (U5) |
| Meal plan (PlanScreen) | Pull to refresh | Reloads both sources | Works (m#490 adds Try again) |
| Meal plan / Daily plan | Meal rows | Not tappable; cannot log a planned meal | Missing action (improvement 1) |
| Coach Plan tab | New plan, edit, archive, retry | Real legacy MealPlan CRUD | Work (copy U7) |
| Coach AI draft | Save edits, approve, reject | Real; approve lands on wrong tab | Works (U8) |
| CoachMealTemplatesScreen | (whole screen) | Registered, no entry point | Orphan, not reachable (no user impact) |

## (4) World class and useful — ranked
1. NEW (recommended default: YES) "Log this meal" on every planned meal (PlanScreen and daily plan): one tap creates the entry in
   today's food log with the plan's name and macros for that slot (existing foodApi.create + logApi.logFood, the same path
   ManualFoodEntryForm uses). Ties the meal plan to the owner's top priority, food logging; today the client retypes everything.
2. FIX Honest, real Prep guide (B1): plan recipes when they exist; otherwise "Recipes shared with you" without week claims.
3. FIX Grocery list that behaves like one: merge duplicates on add, canonical units, bulk add (U3, U4).
4. FIX Recipe detail actions: "Add ingredients to grocery list" (uses existing `source_recipe_id`) and tappable recipe rows in Prep
   guide; correct saved state plus a Saved filter (U5).
5. FIX Day total against target on the plan: "1,850 kcal planned · target 2,100" using the client's macro target when one exists
   (useCurrentMacrosForSelf); nothing shown when no target (honest copy).
6. FIX De-duplicate and expire plans on PlanScreen (U1, U2) so one current plan is the hero.
7. NEW (recommended default: YES, after launch) Coach recipe authoring in the app and "attach recipe" on plan items, plus carbs/fat on
   coach plan items. Without it Recipes and Prep guide stay seed-only.
8. NEW (recommended default: keep both screens, rename) Grocery vs Shopping are the same manual list twice. Default: keep both (rule 6),
   relabel Shopping "Household list" with description "Anything that is not food". Alternative (owner): merge into one list.
   Allergy filtering of recipes: NEW, recommended default NO for launch (copy fix is ALLERGY-128); post-launch, filter on ingredients.

## (5) Proposed fix jobs (file-disjoint, each under 400 lines)
| Job | Repo | Files (exact) | Tier / model | Lines | Covers | Order |
|---|---|---|---|---|---|---|
| NUTR-PREP-B-128 | backend | src/prep-guide/prep-guide.service.ts, src/prep-guide/prep-guide.service.spec.ts (new or existing) | T2, GPT-6.1 Sol | ~180 | B1 backend (`source` field, no fake week), U4 units | now |
| NUTR-PREP-M-128 | mobile | src/screens/client/PrepGuideScreen.tsx (+ its test) | T2, GPT-6.1 Sol | ~150 | B1 mobile copy/arrows, bulk add, tappable recipe rows | as FIX round on m#500 (same file) before it merges; else after |
| NUTR-LISTS-128 | backend | src/lists/lists.service.ts, src/lists/lists.service.spec.ts | T2, GPT-6.1 Sol | ~120 | U3 merge on add | now |
| NUTR-PLAN-B-128 | backend | src/meal-plans/meal-plans.service.ts, its spec | T2, GPT-6.1 Sol | ~60 | U2 ends_on filter | now |
| NUTR-PLAN-M-128 | mobile | src/screens/client/PlanScreen.tsx, src/screens/client/ClientDailyMealPlanScreen.tsx, test | T2, GPT-6.1 Sol | ~120 | U1 de-dup, U12 day total | fold into m#490 round 2 (same files) or after m#490 merges |
| NUTR-COPY-128 | mobile | src/screens/coach/client-detail/MealPlanTab.tsx, src/screens/coach/AIMealPlanDraftScreen.tsx, src/screens/client/MoreScreen.tsx (+ tests) | T1, GPT-6.1 Sol | ~50 | U7, U8, U9 | now (check no open PR touches MoreScreen) |
| NUTR-SAVED-128 | mobile | src/screens/client/RecipeDetailScreen.tsx, src/screens/client/RecipesScreen.tsx, test | T2, GPT-6.1 Sol | ~150 | U5, recipe "Add to grocery list" | after m#494 merges |
| NUTR-LOGPLAN-128 (needs owner yes) | mobile | new src/components/mealplan/LogPlannedMealButton.tsx + test; wire-in lines in PlanScreen.tsx and ClientDailyMealPlanScreen.tsx | T2 (food logging core), Claude Opus 5.5 | ~350 | improvement 1 | after m#490 and NUTR-PLAN-M merge |
Backend jobs are additive and safe against the current production mobile build. NUTR-PREP-M must work against production backend
23 f73c6521: treat a missing `source` as "library" (honest default).

## Not fixed (needs operator)
- B1 grading (B vs U) and holding m#500 until its new Prep guide copy is true: prep-guide.service.ts:51-96 + PrepGuideScreen.tsx
  empty/summary copy at m#500 head; smallest fix above. Recommended: hold m#500 merge or land NUTR-PREP-M as its FIX round 2.
- Owner decisions: improvement 1 (default yes), 7 (default yes post-launch), 8 (default keep both, relabel), allergy filtering
  (default no for launch).

## HANDOFF
Audit complete; nothing built. Next agent: launch the jobs in section (5) in the listed order; re-verify m#490 / m#494 / m#500 heads
on GitHub first (heads above were 4314f0dd / 41aca00c / 0df7cc40 at 14:22 PDT). Allergy copy is owned by ALLERGY-128; Sol B-490-1
(Created label on the canonical row) is owned by m#490's fix round — do not duplicate either.

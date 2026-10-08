Tier: T1
Why: Bounded recipe presentation, neutral empty copy and stored-value rendering; no new API, navigation, access, consent or save semantics.
T4 trigger scan: No auth, RLS/tenancy, PII, money, credentials or destructive-data changes. Existing allergy prompt handlers are unchanged; the unimplemented allergy-hiding promise is promoted separately to the operator for an Opus safety lane.
T3 trigger scan: No backend contract or cross-system changes.
Bounded T1: Two recipe screens, their rendering/parity tests, one existing recipe-load test mock, and only the existing recipes README row; 389 changed lines including tests.
Canonical builder: DES-AN-127, agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Failing-first local proof (3 failing assertions on baseline), then 7 recipe rendering/parity tests, 5 existing load-error tests and doctrine guards passing through heavy.sh. Targeted eslint has zero errors and one unchanged effect-dependency warning.
Promotion triggers: A necessary auth, access, health-data or safety-policy change goes to the operator/Opus rather than being built here.

## What changes for coaches/clients
Recipes are readable hairline rows rather than coloured boxed cards. Search and all ten filters remain on screen as text controls. Detail keeps every nutrition value, stored images, description, time, servings, tags, ingredients and numbered method steps. The title and nutrition figures use Cormorant; body and controls use Inter. The bookmark is the sole forest primary action, with a saved-state outline checkmark. Empty copy does not assume a coach, and missing values are not converted into invented zeroes.

The list keeps carbs and fat as a second muted line instead of hiding them behind the detail tap: rules 4/6 win over further visual reduction.

## B / U list
- Fixed B1: A coachless client opens an empty recipe list and is incorrectly told recipes will be added by their coach. Copy now describes the account's available recipes.
- U1: Coloured macro boxes, boxed list cards, a decorative image placeholder, small metadata and undersized back targets are replaced with hairlines, semantic colours, readable type and 44 pt targets.
- Not fixed / promoted outside ownership: `src/components/AllergySafetyPrompt.tsx:109-110` promises the library hides conflicting recipes, but `RecipesScreen.tsx:202-208` filters only search/tags. An ordinary client choosing a nut allergy is still shown recipes without restriction-based filtering. Recommended default: operator routes an Opus safety task to remove the false promise immediately and clearly instruct checking ingredients; agree the actual safety policy before building any filter. This PR does not change or claim to fix that shared component.

## Routes/actions before -> after
| Screen / label | Before | After / parity proof |
|---|---|---|
| Recipes / back | `navigation.goBack()` | Same, labelled 44 pt button; rendered press tested |
| Recipes / search, clear | Search recipe titles and tags; native clear resets input | Same TextInput, handler and native clear affordance; search/reset tested |
| Recipes / All, breakfast, lunch, dinner, high-protein, low-carb, meal-prep, quick, vegan, gluten-free | Select matching tag | All ten remain, text with selected state; each pressed and results asserted |
| Recipes / recipe row | `RecipeDetail`, `{ recipeId }` | Same serialisable id-only destination; press/params tested |
| Recipes / pull refresh | `refetch()` with refreshing state | Same RefreshControl and handler; invoked in rendered parity test |
| Recipes / allergy selections, save | Existing prompt submits restrictions through `profileApi.update`, persists shown flag, dismisses | Shared component and caller handlers unchanged; real rendered None/save tested |
| Recipes / allergy later, dismiss | Persist shown flag, then dismiss | Same; real rendered later/dismiss tested |
| Detail / back | `navigation.goBack()` | Same normal/error controls, 44 pt targets; both tested |
| Detail / bookmark | `recipesApi.save` / `unsave`, busy guard and failure alert | Same API calls, busy/selected accessibility, saved state and error feedback; tested |
| Detail / load-error retry | `refetch()`; no retry for real 404 | Same; rendered retry test and existing network/500/404 tests pass |
| Detail / ingredients, method, nutrition | All four macros, ingredient list, numbered instructions | All remain; rendered headings/content/type and missing-value variants tested |
| Image placeholder / decorative restaurant glyph | Decorative, no handler | Removed under rule 2 (not an action); stored recipe images remain in both screens |
| Add to plan, log, add to grocery, share | Not present on either existing screen | No false or dead feature is introduced |

No navigation route, tab, consent wording, allergy policy, save endpoint or current production backend behaviour changes.

## Truthful sweep (baseline main 11d433bc, before styling)
| File:line | Before | What is true / replacement |
|---|---|---|
| `RecipesScreen.tsx:329` | “Recipes added by your coach will appear here.” | A coach may not exist; the endpoint returns recipes available to this account. Neutral “Recipes available to this account appear here.” |
| `RecipesScreen.tsx:56,65,76,83,95,99,103-105` | Unconditional rounded nutrition, time and serving numbers | Render only finite stored values, including valid zero; label nutrition per serving. All four list macros stay visible. |
| `RecipeDetailScreen.tsx:49,90,195,199,227-230` | Unconditional rounded nutrition; missing times defaulted to zero | Render finite stored nutrition/servings and total time only when both time fields are stored. Do not invent a total from missing values. |
| Both screens / loading, failure, missing-recipe and instruction copy | Real loading/error/404 state or neutral headings | Remains truthful. Existing failure messages stay word for word. “Ingredients”, “Instructions” and nutrition headings become the specified INGREDIENTS / METHOD / PER SERVING overlines. |
| Shared `AllergySafetyPrompt.tsx:109-110` (outside exact source ownership) | “Your recipe library will hide anything that conflicts.” | Not implemented in the screen; explicitly promoted above, not silently claimed as fixed. |

## Design / documentation
- Matches the `design-targets/mobile/plan/plan_luxury.jpg` bar: editorial title, generous spacing, monochrome figures, hairline divisions and one accent.
- Intentionally diverges: existing recipe data/actions drive the layout; no fabricated schedule, food name, nutrition, stock photography or new feature.
- All new/changed colours resolve from `useTheme().semanticColors`; no legacy palette import or hex literal.
- Detail fades are 250 ms via the existing reduce-motion-aware FadeInView.
- Updates only the existing recipes row in `src/screens/client/README.md`, per operator instruction; does not append to the shared README.

## Validation
- `heavy.sh npx jest src/screens/client/__tests__/Recipes.quiet128.test.tsx --runInBand --silent`
- `heavy.sh npx jest src/__tests__/followUpLoadErrors126.test.tsx --runInBand --silent`
- `heavy.sh npx jest src/__tests__/quietLuxuryDoctrine.test.ts --runInBand --silent`
- Targeted eslint on the two owned screens and relevant tests: zero errors; existing `useEffect` dependency warning unchanged.
- No dependency or lockfile changes; no local full suite, full-project typecheck or full-project lint; those remain CI work.

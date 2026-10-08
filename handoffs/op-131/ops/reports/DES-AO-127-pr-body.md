Tier: T1
Why: Bounded presentation, truthful copy and a direct query-refetch control on three established client screens.
T4 trigger scan: No auth, tenancy, RLS, PII access, credentials, money, destructive-data semantics or API contracts changed. Existing delete/clear handlers and confirmations are unchanged.
T3 trigger scan: No shared architecture, navigator, cross-system ownership or lifecycle change.
Bounded T1: Exact screen scope, existing theme and query contracts, no new dependency; every existing action remains at its original tap depth.
Canonical builder: GPT-6 Luna (T1); assigned bounded executor GPT-6.1 Sol, DES-AO-127 / agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Targeted GroceryPrep.parity tests, 14/14 passing; quietLuxuryDoctrine guard, 30/30 passing after merging latest main. Before implementation, the baseline failed all 9 initial cases; final tests exercise actual React Query hooks and API handlers. Tests run through ops/heavy.sh only.
Promotion triggers: Stop and route to the operator if an access, data-destruction, payment or shared-contract change becomes necessary.

## What changes for coaches/clients
Grocery and shopping lists use one serif headline and a real-data summary, muted category overlines, hairline item rows, tabular quantities and 44-point outline check/remove controls. Prep shows numbered recipes, suggested-day overlines and all existing duration, serving, calorie and ingredient information. Add is the only filled primary action; clear and week controls stay quiet.

All colors rendered by these screens, including empty states, now come from the active semantic theme. Local adapters retain existing style field names without reading the legacy fixed palette. FadeInView is reused; the old shared EmptyState is not suitable here because it reads fixed colors. No new shared primitives, navigator changes, photos, card fills, shadows, springs, hype or invented schedules.

## B / U list
- B1: When a grocery/shopping request fails, an ordinary client is told to pull down even though that branch has no refresh control; replaced with a working Try again action.
- B2: A coachless client can be told to ask “your coach” on an empty prep guide without a coach lookup; replaced with neutral selected-week guidance.
- B3: Suggested prep days promise fresh food for a whole week without any storage/safety evidence; replaced with a neutral choice instruction.
- U1: Check, remove and week targets were 28/32/40 points; all are now at least 44 points, with accessible action names.
- U2: “Building your prep guide…” claimed generation although the endpoint only loads the guide; changed to “Loading your prep guide…”.
- U3: Add all was enabled with no ingredients and did nothing; now explicitly disabled in that state.
- C: No recipe-opening, sharing or exporting action existed on these three screens; none was invented.

## Routes/actions before -> after
| Screen | Label/action before | Destination/effect after |
|---|---|---|
| Grocery / Shopping | Back | Same navigation.goBack(), now labelled Back |
| Grocery / Shopping | Item-name, quantity and unit fields | Same input values and add payload |
| Grocery / Shopping | + / keyboard submit | Same addItem(list type, name/quantity/unit), clear inputs and haptic |
| Grocery / Shopping | Check / uncheck | Same updateItem(id, is_checked), optimistic state and haptic |
| Grocery / Shopping | Remove | Same deleteItem(id), optimistic removal and haptic |
| Grocery / Shopping | Clear checked | Same count-backed confirmation, Cancel and Clear -> clearChecked(list type) |
| Grocery / Shopping | Pull to refresh | Same list query refetch; no additional tap |
| Grocery / Shopping | Error instruction “Pull down…” | Removed under rule 1: unavailable gesture; working Try again -> refetch added |
| Prep | Back | Same navigation.goBack() |
| Prep | Previous / next week | Same weekOffset -1 / +1 and weekly query key |
| Prep | Pull to refresh | Same weekly query refetch |
| Prep | Add all | Same ingredient-count confirmation, Cancel and Add -> addItem for each ingredient; disabled only when empty/pending |
| Prep | Success OK | Same alert dismissal |
| Prep | Success View List | Same navigation.navigate('GroceryList') |
| Prep | Recipe, ingredient, day rows | Still informational; no existing recipe-detail path removed |

Parity tests render every screen and invoke back, add with quantity/unit, check, uncheck, remove, clear/cancel, week arrows, refresh, ingredient add/cancel and success grocery navigation against their existing handlers.

## Truthful sweep
Line numbers refer to the branch base `11d433bc`.
| File:line | Old line | What is true | Replacement |
|---|---|---|---|
| GroceryListScreen.tsx:267 / ShoppingListScreen.tsx:266 | “Pull down to try again.” | Error branch is not scrollable and has no RefreshControl | Specific list-load failure + working Try again |
| PrepGuideScreen.tsx:173 | “Building your prep guide…” | GET /prep-guide loads a guide | “Loading your prep guide…” |
| PrepGuideScreen.tsx:185 | “Ask your coach…” | Empty recipes do not establish a coach relationship | “Recipes from a meal plan appear here for the selected week.” |
| PrepGuideScreen.tsx:203 | “Prep on these days to keep fresh food ready for the whole week.” | Suggestions provide day names, not validated storage guidance | “Choose the prep days that fit your week.” |

Other factual/instructional lines remain unchanged, except screen titles changed to sentence case. New list summaries are derived from unchecked items and omitted for empty/loading/error states; all-checked and empty variants are tested. Prep's recipe summary uses the response count and singular/plural grammar. Suggested days remain exactly the returned day names; numbering indicates recipe order, not invented cooking instructions.

## Documentation and scope
Per the operator's 13:51 instruction, only the existing grocery/shopping/prep row in src/screens/client/README.md was edited in place, without appending to the shared README. Otherwise changes are limited to the three assigned screens and their parity test. No lockfile or dependency changes.

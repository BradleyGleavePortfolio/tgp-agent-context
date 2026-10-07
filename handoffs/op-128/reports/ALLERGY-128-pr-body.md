Tier: T3
Why: safety copy. The Recipes allergy prompt promised that conflicting recipes are hidden; nothing filters them, so a client with a nut allergy could cook a nut recipe trusting that promise.
T4 trigger scan: none (no auth, tenancy, PII flow, money, credentials or destructive data; the answer is saved exactly as before through the existing profile update).
T3 trigger scan: allergy safety copy (customer-facing health claim).
Bounded T1: NO (safety copy on a health-relevant surface).
Canonical builder: Claude Opus 5.5 (ALLERGY-128, agent 128)
Parent owner: operator agent 128
Acceptance evidence: `src/components/__tests__/AllergySafetyPrompt.copy.test.tsx` (5 tests). Failing-first: run locally against main c00a2a5f, the 3 copy tests failed (prompt said "Your recipe library will hide anything that conflicts" and "BEFORE WE BEGIN"); the 2 behaviour tests (save, later, dismiss, None = []) passed before and after. quietLuxuryDoctrine and wave11Doctrine tests pass locally.
Promotion triggers: any change that actually filters recipes or meal plans by allergies (owner decision below), or any change to where the answer is saved.

## What changes for coaches/clients
Clients opening Recipes for the first time still see the same one-time sheet with the same choices and buttons (Save, Set this up later, close). The sentence under the headline no longer says recipes that conflict are hidden. It now reads: "This is saved to your profile. Recipes are not filtered by it, so check each recipe's ingredients before you cook. Choose None if you have no restrictions." The overline reads "BEFORE YOU BROWSE" instead of "BEFORE WE BEGIN" (no first person). Coaches: nothing changes.

## Evidence: does anything filter recipes by allergies? No.
- Backend main 0d179edb: `GET /recipes` -> `RecipesService.list` (src/recipes/recipes.service.ts:25-27) uses `visibleRecipesWhere(viewer)` (src/recipes/recipe-access.ts), which selects by creator and coach tenancy only. `listSaved` and `getById` use the same policy. No recipe file reads `dietary_restrictions`.
- Mobile main: RecipesScreen filters by search text and tag only (DES-AN-127 B2).
- Where the saved answer IS used: `user_profile.dietary_restrictions` (profile.service.ts:322 maps `diet_restrictions`). It goes into Roman's per-turn context bundle (src/roman/context/roman-client-context.service.ts:990), into the coach AI meal-plan prompt (src/ai/prompts/meal-plan.prompt.ts:52, plus mobile CoachAiSection notes), and onto the coach's client Safety section when the client shares weigh-ins (coach.service.ts getClientSummary returns `profile` only when `bodyMetrics` is shared). These are conditional, so the prompt claims only "saved to your profile".
- `src/lib/profileCompletion.ts:31` ("The recipe engine reads this") is a code comment, not user-facing; there is no recipe engine filter. Left as is (out of this entry's files).

## B/U list
- B (fixed): false allergy-safety promise in AllergySafetyPrompt (a client picks a nut allergy, is told conflicting recipes are hidden, but every recipe still shows).
- U (fixed, one line): first-person overline "BEFORE WE BEGIN".
- Not here: the same false line in EditProfileScreen ("The recipe library hides anything that conflicts with these.") is already replaced in open m#496 (DES-AP), so this PR leaves that file alone to avoid a conflict.

## Routes/actions before -> after
| Label | Before | After |
| --- | --- | --- |
| Restriction chips (10) | toggle selection, None exclusive | same |
| SAVE ("Save restrictions") | onSubmit(selected, None -> []) then dismiss | same (tested) |
| Set this up later | onLater then dismiss | same (tested) |
| Android back / close | onRequestClose -> later | same |

## Truthful sweep
| Line | True? |
| --- | --- |
| BEFORE YOU BROWSE | neutral, shown on first Recipes open |
| Anything to avoid? | neutral question |
| This is saved to your profile. | true: Save calls profileApi.update({ diet_restrictions }) |
| Recipes are not filtered by it, so check each recipe's ingredients before you cook. | true per backend evidence above |
| Choose None if you have no restrictions. | instructional |

Docs: src/components/README.md gains the AllergySafetyPrompt row. Layout/styling unchanged (copy-only safety fix; the sheet's visual redo belongs to the Recipes screen job).

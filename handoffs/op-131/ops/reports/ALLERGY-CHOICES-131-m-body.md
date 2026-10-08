**Tier:** T4 (food-allergy safety: which saved answers hide shared recipes for a client)
**Why:** The allergy choices on the Recipes sheet (`AllergySafetyPrompt`) and in Edit Profile > Allergies and restrictions had no Soy or Sesame chip. A client with a sesame allergy couldn't save it, so shared recipes declaring sesame were never hidden for them (ALLERGY-CHOICES-131, operator agent 131).
**T4 trigger scan:** allergy data path (saved restrictions -> recipe hiding). This change only adds two choices. No change to auth, tenancy, money, credentials, PII exposure or destructive data. No API change.
**T3 trigger scan:** none. No route, navigator, endpoint, flag or dependency change.
**Bounded T1:** two chip lists (`src/components/AllergySafetyPrompt.tsx`, `src/screens/client/EditProfileScreen.tsx`), their tests, two README rows.
**Canonical builder:** ALLERGY-CHOICES-131 (Claude Opus 5.5, agent 131)
**Parent owner:** operator agent 131
**Acceptance evidence:** Failing-first on main 868a629c: 3 tests fail (no Soy or Sesame chip). These are `AllergySafetyPrompt.copy.test.tsx` "offers Soy and Sesame ..." and two in `EditProfileScreen.test.tsx` ("every choice reachable" and "offers Soy and Sesame and keeps every saved answer ..."). At this head both files pass (11/11 and 14/14).
**Promotion triggers:** none

## What changes for clients
- The "Anything to avoid?" sheet on Recipes and Edit Profile > Allergies and restrictions now offer **Soy** and **Sesame**, placed after Dairy Allergy.
- Picking one hides shared recipes whose author declared that allergen, the same rule the other allergy chips follow. The Recipes list then says which allergens hide recipes ("Recipes that list sesame are hidden."). That line comes from the server's own answer.
- **Why the labels are "Soy" and "Sesame" and not "Soy Allergy":** each chip is saved exactly as shown, and production (deploy 37, backend 652b07a8) already maps the strings `soy` and `sesame` to its soy and sesame allergen codes (`src/recipes/allergens.ts:54-55`). So this PR hides recipes correctly against the current backend, in any merge order. A label like "Sesame Allergy" would hide nothing until a backend change deployed, while the sheet already says chosen allergens are hidden. growth-project-backend#880 pins these exact strings end to end in a test.
- Every earlier chip and every saved answer is unchanged. Edit Profile keeps saved answers that have no chip, such as consultation answers (test: `['Nut Allergy', 'nuts', 'Sesame']` + Soy saves all four).

## B / U
- B (fixed): a client with a soy or sesame allergy can't pick it, so shared recipes declaring it stay visible to them.
- U: none. C: a consultation answer `soy` (lower case) does not light the Edit Profile "Soy" chip. This is the same as `nuts` vs "Nut Allergy" today, and filtering is unaffected (C, deferred).

## Routes/actions before -> after
| Surface | Label | Before | After |
|---|---|---|---|
| Recipes allergy sheet | chips | None, Nut, Peanut, Shellfish, Egg, Dairy Allergy, Gluten-Free, Vegetarian, Vegan, Pescatarian (toggle) | same, plus Soy and Sesame (toggle) |
| Recipes allergy sheet | Save restrictions | `onSubmit(selected)`, None -> `[]` | unchanged |
| Recipes allergy sheet | Set this up later / close | `onLater` | unchanged |
| Edit Profile | Allergies and restrictions chips | 14 chips (toggle, None exclusive) | 16 chips (Soy and Sesame added) |
| Edit Profile | Save profile | `profileApi.update`, recipe reads refreshed | unchanged |

Parity is proven in tests: every chip is reachable and toggles, and Save, Later, dismiss and None still work.

## Truthful sweep
- Rule `on`: "Recipes that list an allergen you choose are hidden." This is true for Soy and Sesame against deploy 37. "Vegetarian, Vegan and Pescatarian are saved but do not hide recipes." is still true. Rules `off` and `unknown` are unchanged.
- No new copy beyond the two labels and the README rows. No first person, exclamation marks or emojis, and no style or colour change.

## Needs operator
- Follow-up after growth-project-backend#880 deploys: add the Sesame option to the consultation N2 question (`src/lib/consultation/definitions.ts` about :449, `copy.ts` AVOID about :195). It is not in this PR because the current backend refuses `sesame` in N2.

Signed: agent 131

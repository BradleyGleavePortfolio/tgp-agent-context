**MERGE ONLY AFTER growth-project-backend#880 IS DEPLOYED.** b#880 was merged at 09:56 PDT (f545c7c1), and the operator reports deploy 39 is running. A backend without b#880 refuses `sesame` in N2 ("items must be from ..."), so a client who picks Sesame would be stopped at that question. The Fish chip part works against any backend since deploy 37. Fish is NOT added to the consultation question here: that waits for growth-project-backend#881 to deploy.

**Tier:** T4 (food-allergy safety: which saved answers hide shared recipes for a client)
**Why:** (1) The consultation's N2 question ("Anything you can't or won't eat?") offered Soy but not Sesame, so a client with a sesame allergy couldn't record it while onboarding. Consultation onboarding is on in store builds (`eas.json` clinic). This is the follow-up the operator asked for from ALLERGY-CHOICES-131 ("needs operator" 1). (2) The Recipes allergy sheet had no fish choice, so a fish allergy could only be saved from Edit Profile ("No Fish"). This was found by LN-OPUS-L-131 and routed by the operator at 10:01 PDT.
**T4 trigger scan:** allergy data path (N2 answer -> backend `dietary_restrictions` -> recipe hiding). This change only adds one choice. No change to auth, tenancy, money, credentials, PII exposure or destructive data.
**T3 trigger scan:** the client sends one new N2 value, which the backend accepts from b#880 (`src/onboarding/consultation-answers.ts`). No route, navigator, endpoint, flag or dependency change.
**Bounded T1:** `src/lib/consultation/definitions.ts` (one option), `src/lib/consultation/copy.ts` (its summary word), `AllergySafetyPrompt.tsx` and `EditProfileScreen.tsx` (one chip each), tests, three README lines.
**Canonical builder:** ALLERGY-CHOICES-131 (Claude Opus 5.5, agent 131)
**Parent owner:** operator agent 131
**Acceptance evidence:** Failing-first on main 726f90ba: the new consultationEngine test fails (no Sesame option, `sesame` invalid). On the same main, 3 Fish tests fail: "offers Fish and saves it as shown", "every choice reachable" and "shows a Fish answer saved from the Recipes sheet and lets the client remove it". At this head: consultationEngine 42/42, ConsultationFlow 30/30, AllergySafetyPrompt.copy 12/12, EditProfileScreen 15/15.
**Promotion triggers:** none

## What changes for clients and coaches
- N2 now offers **Sesame**, right after Soy. When picked, it is saved as `sesame` and the closing summary names it ("..., avoiding soy and sesame, ..."). Without the copy entry, the summary would silently drop it.
- The backend (b#880) saves it to the client's dietary restrictions and maps it to the sesame allergen, so shared recipes whose author declared sesame are hidden. The coach's read-only view of the answers shows "Sesame".
- The N2 "why" line ("So your coach knows what you avoid.") is unchanged, and so are validation, Nothing being exclusive, "Something else" with its text, and Continue.
- The Recipes allergy sheet now offers **Fish**, after Sesame, saved as shown. Production has mapped `fish` to its fish allergen since deploy 37 (`allergens.ts:53`), so shared recipes declaring fish are hidden. Edit Profile gets the same Fish chip so an answer saved from the sheet shows there and can be removed: Edit Profile is the only place to change it later. "No Fish" stays unchanged in Edit Profile for answers already saved, and both hide fish recipes.

## B / U
- B (fixed, mobile half): a client onboarding through the consultation can't record a sesame allergy, so recipes declaring sesame stay visible to them. The backend half is b#880.
- B (fixed): the Recipes allergy sheet has no fish choice, so a client with a fish allergy who answers there can't record it.
- U: none. C: none.

## Routes/actions before -> after
| Surface | Label | Before | After |
|---|---|---|---|
| Consultation N2 | choices | Nothing, Dairy, Gluten, Nuts, Shellfish, Eggs, Soy, Pork, Halal only, Kosher only, Something else | same, plus Sesame after Soy |
| Consultation N2 | Continue | validates, then saves answers | unchanged |
| Summary | Eating line | names the chosen avoidances | unchanged, and names sesame too |
| Recipes allergy sheet | chips | ... Dairy Allergy, Soy, Sesame, Gluten-Free ... (toggle) | Fish added after Sesame (toggle). Save, Later and close unchanged |
| Edit Profile | Allergies and restrictions chips | 16 chips | 17 (Fish after Sesame). No Fish and Save profile unchanged |

## Truthful sweep
- The only new copy is the labels "Sesame" and "Fish" and the summary word "sesame". There are no new claims about filtering. The sheet's rule-`on` line "Recipes that list an allergen you choose are hidden." is true for Fish, since production maps it. No first person, exclamation marks or emojis, and no style change.

Signed: agent 131

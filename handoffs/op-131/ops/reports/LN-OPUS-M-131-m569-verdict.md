AUDIT Claude Opus 5.5 (LN-OPUS-M-131) — growth-project-mobile#569 @ ec513fc994c8211256b3bdbbafcfd55eed1f68d9 — VERDICT: APPROVE

Full review (T4 allergy safety). 49 changed lines, 10 files. CI 4/4 green at this head. The base is 726f90ba, and `git merge-tree` with main a5f9d5b5 is clean (m#562's client README row does not touch this PR's rows). The head is the one named in READY, re-checked on GitHub right before posting. The whole diff and all three test files were read. Everything below is from the code; nothing was run locally.

B: none.

U: none.

Merge order is now met. The PR needs b#880 deployed for N2 'sesame', and deploy 39 (backend f545c7c1, which includes b#880) finished at 10:13 PDT with /health and /readyz ok (ops/FLEET131.md). On f545c7c1, 'sesame' is in the N2 list (consultation-answers.ts:247), and the coach view labels it "Sesame".

Checked (from the code):
- Consultation N2. src/lib/consultation/definitions.ts:450 adds Sesame right after Soy, with the same value the backend accepts. `AVOID` at src/lib/consultation/copy.ts:196 means the summary names it; without that entry it is dropped silently. consultationEngine.test.ts:454-464 covers the order, the validation and the summary line.
- Recipes sheet Fish chip. src/components/AllergySafetyPrompt.tsx:58 saves "Fish" as shown. Production folds it to 'fish', which maps to the fish allergen (backend allergens.ts, unchanged since before deploy 37). So the `on` lede "Recipes that list an allergen you choose are hidden." is true for it. backend test/recipes-declared-allergens.spec.ts:379 (b#881) pins this end to end.
- Edit Profile. The same chip is at src/screens/client/EditProfileScreen.tsx:140, so a sheet answer shows there and can be removed (EditProfileScreen.test.tsx:164-172). "No Fish" (:147) and every other saved string are kept.
- N2 Fish is not sent. That correctly waits for b#881 to deploy, so this PR is safe in either merge order with b#881.
- Copy and theme. The only new copy is "Sesame", "Fish" and "sesame": no first person, no style or colour change. The READMEs are updated.

C:
- Edit Profile now shows both "Fish" and "No Fish". Both hide fish recipes; this is wording only.
- Outside this diff (for the operator): lean onboarding saves "Nut-free" as 'nut_free' (src/screens/onboarding/LeanQ6Screen.tsx:63), and backend allergens.ts has no 'nut free' entry. So on builds without EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING (the production and preview profiles; clinic store builds use the consultation), that answer hides no nut recipes. Smallest fix: backend `['nut free', ['peanuts', 'tree_nuts']]` plus one spec case.

agent 131

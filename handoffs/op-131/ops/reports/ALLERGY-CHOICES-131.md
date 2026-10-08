# ALLERGY-CHOICES-131 (Claude Opus 5.5, operator agent 131), round 2026-10-08 09:10 PDT

Status: stopped at a safe point (10:45 PDT, owner: credits nearly gone). m#567, b#880 and b#881 are merged. m#569 @ ec513fc9 has REQUEST CHANGES (LN-SOL-M-131). Its fix round is NOT pushed; nothing pushed after 10:18. Handed to agent 132 below.

## Scope traced (from the code, mobile main 868a629c, backend main 652b07a8 = production deploy 37)
- Chips save their label as is: `AllergySafetyPrompt.tsx` (RESTRICTION_OPTIONS) and `EditProfileScreen.tsx` (RESTRICTION_OPTIONS) -> `profileApi.update({ diet_restrictions })`.
- Backend profile DTO `diet_restrictions` is an open string list (`profile.dto.ts:268-273`: string, max 80, max 30 items). There is no closed list on this path. `profile.service.ts:322` -> `dietary_restrictions`.
- Recipe filter: `src/recipes/allergens.ts` folds each saved string (trim, lower-case, spaces/hyphens/underscores) and looks it up. `soy` -> soy and `sesame` -> sesame already exist (:54-55). `soy allergy` / `sesame allergy` do not.
- Mobile mapping: `src/lib/recipeAllergens.ts:34-35` already names soy and sesame. The Recipes "hidden" line is built from the server's `your_allergens`.
- The closed list that does validate dietary restrictions is the consultation N2 list (`consultation-answers.ts:238-251`). It has `soy` but no `sesame`, and it refuses unknown values. Consultation onboarding is ON in the store profile (`eas.json` clinic: EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING=true), so for store clients N2 is the main allergy question at onboarding. The Recipes sheet only shows after the lean flow.
- Legacy OnboardingStep6 is not mounted (`RootNavigator.tsx:17-21`), so it was left unchanged.

## Design choice
- The chips are labelled **Soy** and **Sesame**. These are the exact strings production already maps, so m#567 is correct against deploy 37 in any merge order. A label like "Sesame Allergy" would need a backend deploy first, and until then the sheet's "Recipes that list an allergen you choose are hidden." would be untrue for it. OTA updates are enabled (`app.json` updates.enabled), so that gap could reach clients.
- The mobile consultation N2 Sesame option is NOT in m#567: the current backend refuses `sesame` in N2. b#880 adds the backend half (expand first).

## B list
- B1 (fixed, m#567, merged): a client with a soy or sesame allergy couldn't pick it on the Recipes sheet or in Edit Profile, so shared recipes declaring it stayed visible. Seen in a test (failing-first on main: 3 failures).
- B2 (fixed: b#880 merged plus m#569): consultation N2 refused `sesame` and didn't offer it, so a client onboarding through the consultation couldn't record a sesame allergy. Seen in a test (failing-first: 2 backend, 1 mobile).
- B3 (fixed, m#569): the Recipes allergy sheet had no fish choice. Seen in a test (failing-first: 3).
- B4 (backend half fixed, b#881): consultation N2 refuses `fish`. Seen in a test (failing-first: 2). The mobile half is Proposed 3.

## U list
- none

## C one-liners
- C: a consultation answer `soy` (lower case) does not light the Edit Profile "Soy" chip. This is the same as `nuts` vs "Nut Allergy" today, and filtering is unaffected (edge, deferred).
- C: the `it.each` table in `test/recipes-declared-allergens.spec.ts` and `src/recipes/allergens.ts` were already not prettier-formatted on main. The new row follows the file's existing style.

## PRs
- growth-project-mobile#567 @ f1dc5ab009eb1291934377471914f32915daee3e: 42 changed lines (+39/-3), 6 files. CI green (Typecheck, lint, test; CodeQL). Mergeable, mobile main 868a629c unchanged. READY 09:40 PDT: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/567#issuecomment-6064599228. Verdicts: none yet.
- growth-project-backend#880 @ c47f73ef68593586cbda948e326eb4950181bb51: 53 changed lines (+52/-1), 5 files. CI green (build-and-test and every other check). Mergeable. READY 09:43 PDT: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/880#issuecomment-6064657103. Verdicts: none yet.
- growth-project-mobile#569 @ ec513fc994c8211256b3bdbbafcfd55eed1f68d9: 49 changed lines (+43/-6), 10 files. CI green. Mergeable (mobile main moved to a5f9d5b5 via m#562; `git merge-tree` is clean, and the only shared file is the client README, on a different row). READY 10:15 PDT: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065194853. MERGE ONLY AFTER b#880 IS DEPLOYED (deploy 39).
- growth-project-backend#881 @ fe17941dc6f5d1d29086b7a14a9cae7b2b00de03: 32 changed lines (+30/-2), 5 files. CI green. Mergeable. READY 10:18 PDT: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881#issuecomment-6065253645. No merge order with m#569.
- m#567 and b#880: merged by the operator (b#880 at 09:56 PDT, f545c7c1; m#567 is in mobile main 726f90ba).
- Backend main moved to 55aa7729 (b#871 dunning copy merged) while CI ran. None of those files overlap with b#880 and `git merge-tree` is clean, so no merge-main round is needed (no conflict, no named predecessor).
- Local runs (heavy.sh, one file each): mobile `AllergySafetyPrompt.copy.test.tsx` 11/11 and `EditProfileScreen.test.tsx` 14/14. Backend `onboarding-consultation-answers.spec.ts` 18/18 and `recipes-declared-allergens.spec.ts` 43/43.

## Follow-up done on operator request (mail 09:57 PDT: b#880 merged 09:56, deploy 39 running)
- growth-project-mobile#569, branch `agent131/allergy-consult-sesame-131` off mobile main 726f90ba (m#567 merged): consultation N2 offers Sesame after Soy (`definitions.ts`), the summary names it (`copy.ts` AVOID; without that entry the summary drops it silently), plus a test and one README line in `src/screens/consultation/README.md`. 17 lines (+17/-1), 4 files.
- The PR body opens with: MERGE ONLY AFTER growth-project-backend#880 IS DEPLOYED.
- Failing-first on main 726f90ba: the new consultationEngine test fails. At the head, consultationEngine passes 42/42 and ConsultationFlow passes 30/30 (heavy.sh).

## Second addition on operator request (mail 10:01 PDT, from LN-OPUS-L-131: no fish choice on the Recipes sheet or in N2)
- m#569 (same branch), commit ec513fc9: the Recipes allergy sheet offers **Fish** after Sesame, saved as shown. Production has mapped `fish` since deploy 37 (`allergens.ts:53`).
- Also added the same Fish chip to Edit Profile. Reason: Edit Profile is the only place to change these answers later and it had only "No Fish". A sheet-only "Fish" would be saved but could not be shown or removed there (None would clear everything). "No Fish" is unchanged, so earlier saved answers still light, and both hide fish recipes. Test: a saved `['Fish', 'No Fish']` lights both, and removing Fish saves `['No Fish']`.
- Failing-first on main 726f90ba: 3 Fish tests fail. At the head: AllergySafetyPrompt.copy 12/12, EditProfileScreen 15/15. m#569 is now 49 lines (+43/-6), 10 files.
- growth-project-backend#881, branch `agent131/allergy-consult-fish-131` off backend main f545c7c1 (b#880 merged): N2 accepts `fish` and the coach view labels it Fish. Tests pin the app's Fish chip end to end. Head fe17941d, 32 lines (+30/-2), 5 files. Failing-first on main f545c7c1: 2 tests fail. At the head: consultation-answers 20/20, recipes-declared-allergens 44/44.
- Fish was NOT added to the mobile consultation question (operator: wait for b#881's deploy).

## Proposed (needs operator)
1. (Done as m#569, see above.) m#569 must not merge before b#880 is in production (deploy 39), or a client who picks Sesame is refused at N2.
2. No merge order was needed between m#567 and b#880 (both now merged).
3. After b#881 deploys: mobile consultation N2 Fish option `{ value: 'fish', label: 'Fish' }` in `src/lib/consultation/definitions.ts` (after Sesame), plus `fish: 'fish'` in AVOID in `src/lib/consultation/copy.ts`, with a test. Default: a next-round builder, about 15 lines. It must not merge before b#881 is in production.
4. C (edge, deferred): Edit Profile now has "Fish" (allergen group) and "No Fish" (diet exclusions). Both hide fish recipes. Folding them into one would need a saved-value change, so it was left as is.

## HANDOFF (for agent 132)
- Merged: m#567, b#880 and b#881 (b#881 merged 10:33 PDT; deploy 40 was running at 10:34).
- **m#569 @ ec513fc9: REQUEST CHANGES** from LN-SOL-M-131 (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693), finding B-569-SOL-M-131-1. Branch `agent131/allergy-consult-sesame-131`, worktree `/home/user/workspace/wt/ALLERGY-CHOICES-131-mobile`. The fix round is not done and nothing is pushed.
  - Bug: the Recipes sheet save (`src/screens/client/RecipesScreen.tsx` handleAllergySubmit, ~:176-193) writes only the legacy AsyncStorage `user_data` key. `useCurrentUser` reads `lib/userCache` (`prefs:auth.user_data`) and ignores that key once the cache exists. So Edit Profile opens without the sheet's answer, and its next save drops it (save Fish on the sheet, then add Soy in Edit Profile, and Fish is lost).
  - Fix (not applied): replace that block with `await patchUserCache({ profile: { diet_restrictions: restrictions } })` (import from `../../lib/userCache`), kept best-effort in try/catch. Edit Profile already patches the cache after its own save (:390).
  - Draft test, untracked: `src/screens/client/__tests__/AllergyAnswerCache.composition.test.tsx`. It uses the real cache and the real `useCurrentUser` with both screens. It fails at ec513fc9, but partly for the wrong reason: the Edit Profile save sent `{current_weight: 180}` because the Soy press was lost to overlapping act() calls. Before saving, press via `await act(async () => { fireEvent.press(...) })` and wait until the Soy chip reads selected. Then run failing-first, apply the fix, push once, wait for CI, and post READY as FIX ROUND 2. Deploy 39 is live, so m#569 may merge once both lenses approve the new head.
  - Optional: `src/screens/client/README.md` :118 and :150 still say `useCurrentUser` reads `AsyncStorage('user_data')`, which is stale.
- **Not started:** backend PR `agent131/allergy-nut-free-131` (operator 10:34, from LN-OPUS-M-131). Lean onboarding on non-clinic builds (including the Android test app) saves "Nut-free", which `src/recipes/allergens.ts` doesn't map, so nut recipes stay visible. Map it, and any other lean-onboarding value the map misses, with a test that fails first on main.
- **Proposed 3, still open:** once deploy 40 (b#881) is live, add the mobile N2 Fish option: `{ value: 'fish', label: 'Fish' }` after Sesame in `src/lib/consultation/definitions.ts`, plus `fish: 'fish'` in AVOID in `src/lib/consultation/copy.ts`, with a test.
- No stash anywhere. The backend worktree is on `agent131/allergy-consult-fish-131` (clean, merged as b#881).

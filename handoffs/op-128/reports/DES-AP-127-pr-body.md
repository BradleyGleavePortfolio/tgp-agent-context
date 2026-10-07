Tier: T1
Why: Bounded edit-profile presentation, copy and local form hydration/validation feedback; existing payloads, ranges, calculators and persistence are unchanged.
T4 trigger scan: None; no auth, access, privacy policy, PII routing, money or credential change. Existing profile writes are preserved, not redesigned.
T3 trigger scan: None; no shared contracts, schema, backend or navigation change.
Bounded T1: YES; one screen and its render tests, no new dependency or cross-screen change.
Canonical builder: GPT-6.1 Sol, DES-AP-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: 12 targeted render/parity tests; 30 quiet-luxury doctrine tests; targeted ESLint; failing-first logs recorded below; main merged without conflict.
Promotion triggers: Any request to change health calculations, profile persistence contracts, sharing/access, photo/name APIs or unowned screens.

## What changes for coaches/clients
- Edit profile becomes a bone-page form with ABOUT YOU / BODY / GOAL overlines, hairline fields and option rows, visible lbs/cm units, readable Inter copy and a single forest Save action.
- All eleven existing fields and all their choices remain on the same screen. Back still cancels, and Save retains profile/cache/macros updates and returns on success.
- Saved details appear when the asynchronous user cache resolves; height/weight validation appears next to the correct field. Existing height range remains 90–250 cm, rather than reducing valid choices to the brief's illustrative 120–230 cm.
- Copy no longer promises an existing coach, a plan, complete recipe filtering or that data never leaves the app.

Start condition: mobile#470 was verified merged at 13:44 PDT. This PR starts from current main and does not change ProfileScreen.

## B/U list
- B1: A client opening Edit profile is told a coach sees their data and nothing leaves the app even when no coach is linked and backend/service providers process app data. Replaced with neutral instructions, with linked/unlinked/loading-state tests.
- B2: A client selecting mobility sees “no caloric target” even though saving computes maintenance calorie targets. Description now names the actual maintenance target.
- U1: Cream boxes, fixed colors, black primary and 32-point Back target replaced with semantic hairlines, theme-led color and 44-point minimum touch targets.
- U2: Height/current-weight errors now sit under their own inputs, not under target weight; validation ranges remain unchanged.
- U3: Generic save fallback now names unsaved profile changes and recovery; loading and failure retain the form/action.
- U4: Recipe filtering and equipment/goal hints now describe data entry without unsupported promises.
- U5: `useCurrentUser()` initially returns null; the old form never adopted its loaded profile. A focused hydration test failed first with height `""` instead of `"178"`; saved details now populate after loading.
- C: None.

## Routes/actions before -> after
| Label / control | Before | After |
| --- | --- | --- |
| Back (cancel) | `navigation.goBack()`, no save | Same, minimum 44-point target |
| Sex: Female / Male | Set `sex` | Same options/values |
| Date of birth | Edit `dob`, YYYY-MM-DD | Same field/range; specific local error |
| Current weight | Edit pounds `currentWeight` | Same field/range; lbs beside input, local error |
| Height | Edit centimetres `heightCm` | Same field/range; cm beside input, local error |
| Target weight | Edit pounds `targetWeight` | Same field/range; lbs beside input, local error |
| Activity: Sedentary / Lightly active / Moderately active / Active / Very active | Set `activityLevel` | Same options/values |
| Goal: Lose weight fast / Lose weight steady / Maintain / Build muscle / Gain mass / Mobility & wellness | Set `primaryGoal` | Same options/values |
| Restrictions: None / Nut Allergy / Peanut Allergy / Shellfish Allergy / Egg Allergy / Dairy Allergy / Gluten-Free / Vegetarian / Vegan / Pescatarian / No Pork / No Beef / No Fish / No Spicy | Toggle restrictions; None exclusive | Same options, toggling and payload |
| Diet: Omnivore / Vegetarian / Vegan / Pescatarian / Keto / Paleo / Mediterranean / Other | Set `dietType` | Same options/values |
| Workout days: 1 / 2 / 3 / 4 / 5 / 6 / 7 | Set weekly days | Same options/values |
| Equipment: Full gym regular / Full gym occasional / Home setup / Bodyweight only | Set `gymMembership` | Same options/values |
| SAVE / SAVE PROGRESS | Profile API update; macro/cache writes; analytics and haptics; goBack | Same effect, sentence-case Save / Save progress, loading label and existing disabled state |
| Photo, name, unit selector, separate Cancel | Not present in assigned current screen | Not invented; no unowned API/screen change. Back remains cancel; pounds/cm unchanged |

The render parity test presses every existing option, changes each input, verifies the resulting API payload including all eleven fields and calorie/macros, checks cache update and success return, and verifies Back/failure/validation do not navigate or save incorrectly.
No action or field was removed.

## Truthful sweep (baseline EditProfileScreen.tsx on main)
| file:line | Before | Actual state / replacement |
| --- | --- | --- |
| `EditProfileScreen.tsx:432` | “These details shape your plan. Your coach sees them; nothing leaves the app.” | A plan/coach is not guaranteed; app data is processed by backend/providers. “Update the details used for daily targets and training preferences.” |
| `:605` | “You can revise these any time. Coaches will see the most recent values.” | Coach visibility depends on real relationships/access. Keep the true first sentence word for word; remove the universal coach claim under rule 1. |
| `:117` | “Maintenance, no caloric target” | Mobility computes maintenance calories. “Maintenance calorie target”. |
| `:113` | “Sustainable deficit (~500 kcal)” | A formula adjustment cannot establish personal sustainability. “Calorie adjustment (~500 kcal deficit)”. |
| `:115` | “Lean surplus (+350 kcal)” | The arithmetic does not establish a lean outcome. “Calorie adjustment (+350 kcal)”. |
| `:504` | “Drives your daily calorie target.” | Activity alone does not calculate targets; required body inputs must exist. “Used with body details to calculate daily calorie targets.” |
| `:519` | “Sets the deficit or surplus on top of your TDEE.” | Maintenance/mobility have zero adjustment. “Choose a goal for daily calorie targets.” |
| `:534` | “The recipe library hides anything that conflicts with these. Pick None if you have none.” | This screen stores restrictions; it cannot guarantee complete recipe filtering. “Record allergies and dietary restrictions. Pick None if you have none.” |
| `:576` | “Used to decide which lifts your plan can prescribe.” | A plan need not exist. “Record the equipment available for training.” |

Other factual/instructional field labels, options and their values remain unchanged. UI-label changes are limited to sentence-case Save and section hierarchy; validation copy names the unchanged ranges.

## Evidence and documentation
- `/home/user/workspace/ops/heavy.sh npx jest src/screens/client/__tests__/EditProfileScreen.test.tsx --runInBand`: 12/12 pass.
- `/home/user/workspace/ops/heavy.sh npx jest src/__tests__/quietLuxuryDoctrine.test.ts --runInBand`: 30/30 pass.
- Targeted ESLint for the two owned files: pass.
- Failing-first: six new acceptance assertions failed against the untouched screen; parity already passed. Logs in operator workspace: `ops/reports/DES-AP-127-failing-first.log`. Additional async hydration proof: `ops/reports/DES-AP-127-hydration-red.log`.
- Documentation updated in the screen's existing module header. The shared client README has no EditProfile entry; the owner's rule forbids appending or rewriting another screen's entry. No shared README row was changed. Recommended default: accept in-place module docs for this scoped PR.
- No new dependency, lockfile, hex literal, cast escape, photo/illustration, navigator, production setting, deployment or merge.

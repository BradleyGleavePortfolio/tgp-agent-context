Tier: T1 (bounded mobile presentation).
Why: Profile must show the answers a client saved and the daily targets the Food tab uses, rather than legacy-only cached fields.
T4 trigger scan: none. Existing authenticated self-read endpoints only; no auth, tenancy, consent, money, secrets, persistence or destructive operations changed.
T3 trigger scan: none. No shared API contract, navigation stack, dependency, feature flag or shared state change.
Bounded T1: ProfileScreen, its pure display helper, focused tests, the existing sentence-case parity assertion and the matching client-screen README.
Canonical builder: CF-PROFILE-FIN-129, agent 129; finishes CF-PROFILE-128 on the existing assigned branch.
Parent owner: operator agent 129; owner truthful-copy and mobile pathway-parity rules.
Acceptance evidence: the saved-server regression fails on main `a1be6fb25538b02e961fd379a0d86d71d610ad7a` at missing `175 lbs`; all 61 focused final-tree tests pass (5 saved values/parity, 6 display, 30 doctrine, 20 truthful-copy guard). Final-head [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702268370/job/113068273362) and all CodeQL checks are SUCCESS at `ce336713016e53f9107ce5cc571b8794b5f6a3f2`.
Promotion triggers: any needed auth/tenancy/consent, server write or API contract change returns to the operator; none is built here.

## What changes for coaches/clients

Clients see their saved server answers when Profile opens or when they return from Edit. Server column names and cached legacy fields render as readable labels with lbs/cm units. Height and allergies are visible without an extra tap. Canonical goals do not invent a pace, and gym membership does not invent a training setup or frequency.

Daily targets use the same existing `/me/macros/current` endpoint as Food. Saved profile targets stand in while a read is pending or failed. A successful null response clears old targets. Explicit zero gram targets remain visible. Loading, unavailable and confirmed-empty targets have different copy.

TDEE is omitted: there is no saved server TDEE value, so a cached local estimate could contradict the real target (truthful-copy rule 1). No route, button or handler is removed.

## B / U list

- B: none.
- U1 fixed: saved server profile answers no longer appear as missing legacy values; labels are readable instead of raw enum tokens.
- U2 fixed: targets prefer the current server target, keep explicit zero gram targets, and do not describe a pending/failed read as confirmed empty.
- U3 fixed: sentence-case Profile headings/sign-out and wrapping personal-row values keep the added information readable.

## Routes/actions before -> after

| Label / control before | Destination / effect before | Label / control after | Destination / effect after |
| --- | --- | --- | --- |
| Settings | `Settings` | Settings | `Settings` |
| My Report | `Report` | My report | `Report` |
| Widgets | `Widgets` | Widgets | `Widgets` |
| Learn | `Learn` | Learn | `Learn` |
| Edit | Track `profile_edit_opened`, open `EditProfile` | Edit | Same tracking + `EditProfile` |
| Name row | Track field, open `EditProfile` | Name row | Same tracking + `EditProfile` |
| Email row | Track field, open `EditProfile` | Email row | Same tracking + `EditProfile` |
| Sex row | Track field, open `EditProfile` | Sex row | Same tracking + `EditProfile` |
| Date of Birth row | Track field, open `EditProfile` | Date of birth row | Same tracking + `EditProfile` |
| Current Weight row | Track field, open `EditProfile` | Current weight row | Same tracking + `EditProfile` |
| Target Weight row | Track field, open `EditProfile` | Target weight row | Same tracking + `EditProfile` |
| Activity Level row | Track field, open `EditProfile` | Activity level row | Same tracking + `EditProfile` |
| Goal row | Track field, open `EditProfile` | Goal row | Same tracking + `EditProfile` |
| Diet row | Track field, open `EditProfile` | Diet row | Same tracking + `EditProfile` |
| Workout Days row | Track field, open `EditProfile` | Workout days row | Same tracking + `EditProfile` |
| Equipment row | Track field, open `EditProfile` | Equipment row | Same tracking + `EditProfile` |
| Height (not displayed) | Available in Edit | Height row | Track field, open `EditProfile` |
| Allergies (not displayed) | Available in Edit | Allergies and restrictions row | Track field, open `EditProfile` |
| Sign Out | Confirmation alert; Cancel does nothing; confirm calls existing `signOut` | Sign out | Same alert, cancellation and confirmed `signOut` |
| Focus / return from Settings | Refresh confirmed coach-sharing sentence | Focus / return from Settings or Edit | Same sharing refresh plus saved-profile/current-target reads |
| Milestones | Existing read-only milestone date/note list | Milestones | Unchanged |
| Calorie Target / Protein / Carbs / Fat | Read-only cached values | Calories / Protein / Carbs / Fat | Read-only current server values, saved fallback; explicit zero grams preserved |
| TDEE | Read-only cached local estimate | Omitted | Honest-copy rule 1; no corresponding saved server target |

Render parity: `src/screens/client/__tests__/ProfileScreen.savedValues.test.tsx` presses all five quick/edit routes, all 13 personal rows and the sign-out confirmation; the existing doctrine/guard tests retain the coach-sharing variants.

## Truthful sweep

| State / claim | Evidence / expected variant |
| --- | --- |
| Saved server-shaped answers, stale cache | Focus reads `/profile`; date, weights, sex, activity, coarse goal, diet, allergies, days and gym membership print from the saved row. |
| Legacy cached answers | Existing aliases and explicit no-restrictions answers remain readable. |
| Saved profile with no restrictions answer | No invented "None" for an unanswered server list; existing completion/allergy semantics are unchanged. |
| Goal / equipment detail | No loss pace or gym-frequency/bodyweight inference from the coarse server columns. |
| Coach target vs profile target | `/me/macros/current` wins; server `macro_target_*` wins over legacy cached targets only when the current target is unknown. |
| Pending target, no known values | "Loading daily targets." |
| Failed target, no known values | "Daily targets did not load. Reopen Profile to try again." |
| Successful null target | "No daily targets yet."; old target rows are removed. |
| Zero gram target | "0 g", not a missing/hidden target. |
| Coach sharing | Existing confirmed sharing variants and owner-access handling are unchanged; no exclusive-access claim. |

## Validation

- Failing-first: the saved-server screen regression fails on main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`: expected `175 lbs` is absent; stale `150 lbs` and `1200 kcal` remain on screen.
- Local focused runs, sequentially through `ops/heavy.sh`, one targeted file at a time:
  - `ProfileScreen.savedValues.test.tsx`: 5/5 PASS, including all routes/13 rows/confirmed sign-out.
  - `profileDisplay.test.ts`: 6/6 PASS.
  - `quietLuxuryDoctrine.test.ts`: 30/30 PASS.
  - `truthfulCopy.guard.test.ts`: 20/20 PASS.
- Final head `ce336713016e53f9107ce5cc571b8794b5f6a3f2`: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702268370/job/113068273362), [CodeQL actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702268298/job/113068273030), [CodeQL JavaScript/TypeScript](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702268298/job/113068273344) and [CodeQL aggregate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113068452399) all SUCCESS; GitHub confirms MERGEABLE/CLEAN.
- Marked ready and posted [FIX ROUND 1 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/522#issuecomment-6049014859) at 16:36 PDT. No full local suite, full-project typecheck or lint is run.
- Existing guard runs emit non-failing React `act`/SafeAreaView and simulated-error warnings; no unrelated polish is included.

## Documentation / doctrine

Updated `src/screens/client/README.md` Profile entry, self-read dependencies, fallback/recovery and tests per Quiet-Luxury Doctrine section 8. No new dependency, lockfile change, hard-coded colour, animation, route or production operation.

agent 129

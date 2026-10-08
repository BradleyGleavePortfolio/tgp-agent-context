**Tier:** T4 (food-allergy safety: which saved answers hide shared recipes for a client)
**Why:** The consultation's N2 question ("Anything you can't or won't eat?") offers no fish choice, and its validator refuses any value outside its closed list, so a fish allergy can't be saved as a consultation answer. This was found by LN-OPUS-L-131 and routed by operator agent 131 at 10:01 PDT. It is the same change b#880 made for sesame.
**T4 trigger scan:** allergy data path (consultation answer -> `dietary_restrictions` -> recipe hiding). This change only adds a value. No change to auth, RLS/tenancy, money, credentials, PII exposure or destructive data. No migration, schema, flag or endpoint change.
**T3 trigger scan:** none. The consultation contract only gains one more accepted N2 value, and every earlier value still validates.
**Bounded T1:** `src/onboarding/consultation-answers.ts` (one N2 value), `src/onboarding/consultation-definitions.ts` (its coach-view label), a comment in `src/recipes/allergens.ts`, tests.
**Canonical builder:** ALLERGY-CHOICES-131 (Claude Opus 5.5, agent 131)
**Parent owner:** operator agent 131
**Acceptance evidence:** Failing-first on main f545c7c1: 2 new tests in `test/onboarding-consultation-answers.spec.ts` fail (`fish` refused, and the coach view has no Fish label). At this head that file passes 20/20 and `test/recipes-declared-allergens.spec.ts` passes 44/44.
**Promotion triggers:** none

## What changes for coaches and clients
- The backend now accepts `fish` as a consultation N2 answer. The coach's read-only view shows it as "Fish". It is saved to the client's dietary restrictions and maps to the fish allergen (`allergens.ts` has mapped `fish` since CF-ALLERGY-128), so shared recipes whose author declared fish are hidden for that client.
- No client sends `fish` in N2 yet. The mobile consultation option is a follow-up that must merge only after this PR is deployed, because sending it before then would be refused.
- A test also pins the app's new Recipes-sheet "Fish" chip (growth-project-mobile#569) end to end: it hides a shared recipe declaring fish, and the recipe shows when nothing is saved.

## B / U
- B (fixed here, backend half): a client in the consultation can't record a fish allergy, so recipes declaring fish stay visible to them.
- U: none. C: none.

## Needs operator
- After this PR deploys: mobile N2 option `{ value: 'fish', label: 'Fish' }` in `src/lib/consultation/definitions.ts` (after Sesame), plus `fish: 'fish'` in the `AVOID` map in `src/lib/consultation/copy.ts` (the summary drops values that are missing there), with a test.

Signed: agent 131

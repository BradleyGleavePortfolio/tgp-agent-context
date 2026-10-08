**Tier:** T4 (food-allergy safety: which saved answers hide shared recipes for a client)
**Why:** The consultation's N2 question ("Anything you can't or won't eat?") offers Soy but not Sesame, and its validator refuses any value outside its closed list, so a sesame allergy can't be saved as a consultation answer. Shared recipes that declare sesame are never hidden for that client (ALLERGY-CHOICES-131, operator agent 131).
**T4 trigger scan:** allergy data path (consultation answer -> `dietary_restrictions` -> recipe hiding). This change only adds a value. No change to auth, RLS/tenancy, money, credentials, PII exposure or destructive data. No migration, schema, flag or endpoint change.
**T3 trigger scan:** none. The consultation contract only gains one more accepted N2 value, and every earlier value still validates.
**Bounded T1:** `src/onboarding/consultation-answers.ts` (one N2 value), `src/onboarding/consultation-definitions.ts` (its coach-view label), a comment in `src/recipes/allergens.ts`, tests.
**Canonical builder:** ALLERGY-CHOICES-131 (Claude Opus 5.5, agent 131)
**Parent owner:** operator agent 131
**Acceptance evidence:** Failing-first on main 652b07a8: 2 of the new tests in `test/onboarding-consultation-answers.spec.ts` fail ("items must be from ..." for `sesame`, and the coach view has no Sesame label). At this head that file passes (18/18) and `test/recipes-declared-allergens.spec.ts` passes (43/43).
**Promotion triggers:** none

## What changes for coaches and clients
- The backend now accepts `sesame` as a consultation N2 answer. The coach's read-only view of the answers shows it as "Sesame". It is saved to the client's dietary restrictions like `soy`, and it maps to the sesame allergen, so shared recipes whose author declared sesame are hidden for that client.
- No client sends `sesame` yet. The mobile consultation option is a follow-up that should merge after this PR is deployed, because sending it before then would be refused (see "Needs operator").
- Tests also pin the app's new "Soy" and "Sesame" restriction chips (growth-project-mobile, same branch `agent131/allergy-choices-131`). Those chips are saved exactly as shown, and production already maps those strings (`allergens.ts:54-55`). The new tests prove end to end that each one hides a shared recipe declaring that allergen, and that the recipe shows when nothing is saved.

## B / U
- B (fixed here, backend half): a client in the consultation can't record a sesame allergy, so recipes declaring sesame stay visible to them.
- U: none. C: none.

## Needs operator
- Follow-up after this PR deploys: the mobile N2 option `{ value: 'sesame', label: 'Sesame' }` in `src/lib/consultation/definitions.ts` (about :449), plus `sesame: 'sesame'` in the `AVOID` map in `src/lib/consultation/copy.ts` (about :195), with a test. This was left out of the mobile PR so it can't reach clients before the backend accepts it.

Signed: agent 131

AUDIT Claude Opus 5.5 (LN-OPUS-M-131) — growth-project-backend#881 @ fe17941dc6f5d1d29086b7a14a9cae7b2b00de03 — VERDICT: APPROVE

Full review (T4 allergy safety). 32 changed lines, 5 files. CI green at this head (15 checks, plus deploy-readiness-gate skipped). Mergeable clean on main f545c7c1. The head is the one named in READY, re-checked on GitHub right before posting. The whole diff and both specs were read. Everything below is from the code; nothing was run locally.

B: none.

U: none.

Checked (from the code):
- src/onboarding/consultation-answers.ts:248 adds 'fish' to the closed N2 list. That list is `listOf(..., { min: 1, exclusive: 'nothing' })` with no maximum, so every earlier answer still validates. `profileFieldsFromAnswers` (:421) saves N2 minus 'nothing' to `dietary_restrictions` as before.
- src/recipes/allergens.ts maps 'fish' to the fish allergen, and production already had that mapping (`fold` lower-cases, so the app's "Fish" chip from m#569 maps too). This is the one map `loadViewerAllergens` uses for every recipe read. The allergens.ts change is a comment only.
- src/onboarding/consultation-definitions.ts:509-512: the coach's read-only view labels it "Fish". These two N2 lists are the only closed vocabularies for N2 in src (grep for the neighbouring values).
- test/onboarding-consultation-answers.spec.ts:263-282: fish is accepted, saved, mapped and labelled (failing first on main, per the PR). test/recipes-declared-allergens.spec.ts:379: a saved "Fish" hides a shared recipe that declares fish.
- This is the same shape as b#880 (sesame), which was dual-approved, merged and deployed (deploy 39). No migration, schema, flag, endpoint, auth or money change.

C: none. Mobile N2 Fish (definitions.ts plus `AVOID` in copy.ts) must wait for this PR to deploy, as the PR says.

agent 131

# DES-AN-127 — recipes and recipe detail

## Scope traced
- Builder agent 128; branch `agent128/des-an-127`; worktree `/home/user/workspace/wt/DES-AN-127-mobile`, based on main `11d433bc`.
- Exact source ownership: `src/screens/client/RecipesScreen.tsx`, `src/screens/client/RecipeDetailScreen.tsx`, and relevant tests; operator subsequently authorised an in-place update to the existing recipes README row.
- Read common brief, last DES-AN entry, SoT A1/A2 overrides/A6, design audit named sections, catalog, design guide named sections, doctrine.
- Existing actions: list back, search/clear, ten tag filters, recipe detail by serializable id, pull refresh, allergy prompt submit/later/dismiss; detail back, bookmark save/unsave, retry on load failure.
- No add-to-plan, log, grocery, or share controls exist on these screens; none will be invented.
- Truth sweep: list empty copy assumes a coach; absent numeric fields render NaN/zero-looking nutrition or time. Replace with neutral copy and stored-value guards.

## B list
- Fixed B1: a client with no coach opens an empty recipe list and is told recipes will be added by their coach; empty copy is now account-neutral.
- Promoted B2 (outside owned files, safety/T4): a client selects a nut allergy in the existing prompt, is promised the library hides conflicting recipes, but this screen filters only search and tags.

## U list
- Recipe rows and detail use boxed coloured macros, undersized metadata and a decorative image placeholder.

## C one-liners
- None.

## PRs
- [Mobile PR #494](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494), current pushed head `41aca00c823680b51fc683ac65a702b3c3bbffe6`, 235 additions + 154 deletions = 389 changed lines including tests.
- CI (14:16 PDT): main CI (typecheck/lint/test), both CodeQL analysis jobs and CodeQL check are all SUCCESS at exact head `41aca00c`. GitHub reports MERGEABLE.
- [FIX ROUND 1 READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494#issuecomment-6047023667) posted at 14:16 PDT. Verdicts: pending / pending; builder does not wait under the owner's 14:08 override.
- Main merged cleanly immediately before the initial push; author and committer both Bradley Gleave.
- Failing-first: 3 tests failed against baseline; proof in `DES-AN-127-red.log`.
- Current parity/state tests: 7 passing; existing load-error regression file: 5 passing; doctrine: 30 passing after latest-main merge; targeted eslint: zero errors, one unchanged missing-effect-dependency warning.
- Test logs: `DES-AN-127-green.log`, `DES-AN-127-regression.log`, `DES-AN-127-lint.log`.

## Not fixed (needs operator)
- `src/components/AllergySafetyPrompt.tsx:109-110` promises conflicting recipes are hidden; `src/screens/client/RecipesScreen.tsx:202-208` only applies search/tag filtering. Recommended default: route the safety policy to Opus; immediately remove the unimplemented hiding promise and explicitly instruct clients to check ingredients, then agree any actual allergy-filter implementation. Do not infer safety from recipe tags.
- README scope conflict resolved by operator's 13:51 instruction: only the existing recipes row is updated in place, never appended.

## HANDOFF
- UI implemented with semantic tokens, hairline rows, text filters, serif title/figures, 16 pt Inter method, 44 pt targets and 250 ms fades.
- All list nutrition values remain visible to avoid cutting information; detail preserves stored images and all existing actions.
- [PR #494](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494) is READY at `41aca00c823680b51fc683ac65a702b3c3bbffe6`: 389 lines, all CI green, MERGEABLE, exact READY posted. Local worktree is clean.
- Operator-required second latest-main merge is complete (notification-screen changes and unrelated README row, no recipe-source changes). Targeted recipe tests reran green after merge; size remains 389.
- Builder finished under the owner's 14:08 override. Operator's standing FIX lane owns review findings and later conflicts. Do not merge until both lenses approve at the exact head. No merge, deploy or production change was performed.
- Continuation: worktree `/home/user/workspace/wt/DES-AN-127-mobile`, branch `agent128/des-an-127`; PR body and READY payload saved as `DES-AN-127-pr-body.md` and `DES-AN-127-ready-comment.md` beside this report.
- Needs operator: promote the existing shared allergy-hiding promise to Opus as described above; 1 fixed B, 1 unresolved promoted B, 1 U completed.
- DES-BA-127 was queued then withdrawn by the operator; no files, worktree, branch or commits were created for it.

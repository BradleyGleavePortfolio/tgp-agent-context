# B-RECIPES report (builder: Claude Opus 5.5, operator agent 109)

Source: Opus C-625-1 on backend #625 (platform-wide public recipe feed and arbitrary remote image links went live with #625).

## Backend PR

- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/630
- **Base / head:** base `main` at 10dff85c; head 5b8739886a7bc4c3239674e803340999796c07fb (branch `agent/clinic/b-recipes-private`).
- **Tier:** T4. The lane said T3; I re-graded upward because G06 puts tenancy and privacy at T4, and the migration rewrites existing rows in a way down.sql deliberately does not reverse. No CI gate files are touched.
- **Audits needed:** two independent audits, Claude Opus 5.5 and GPT-6.1 Sol. The builder does not audit.

### What it does

- **One visibility predicate** (`src/recipes/recipe-access.ts`) is used by every recipe read: list, detail, save, saved list and prep guide. A viewer sees:
  - their own recipes;
  - recipes shared by their own coach: `is_public` AND `created_by_id = viewer.coach_id` AND creator role is coach or owner AND creator not deleted.
  - There is no platform-wide branch. A client's recipe is never visible to anyone else.
- **`POST /recipes`:**
  - private by default;
  - `isPublic: true` now means "share with my own clients", allowed for coach/owner only; a client gets 403 `RECIPE_SHARING_COACH_ONLY`;
  - any non-blank `imageUrl` gets 400 `RECIPE_IMAGE_URL_NOT_ALLOWED`;
  - nothing is written on a refusal.
- **Not visible or missing:** both return 404 `RECIPE_NOT_FOUND` with the same body, so the API is not an existence oracle. This replaces the old 403 "Not accessible".
- **Photos:** every read serves `image_url: null`, so stored links never reach any app build. TGP has no recipe-photo upload storage.
- **Prep guide:** meal-plan recipe ids are filtered by the predicate, and the platform-wide "latest 6 public" fallback is removed.
- **Bounds:** list and saved list return at most 200 rows. Input arrays are bounded too.
- **Migration `20270204000000_recipe_private_by_default`:**
  - sets `is_public` DEFAULT false;
  - makes every existing row private, with a NOTICE giving the row count;
  - verifies its own result;
  - runs in one transaction with `SET LOCAL` lock and statement timeouts;
  - down.sql restores the default only.
- **Seed:** `prisma/seed-recipes.ts` now requires `SEED_RECIPES_COACH_ID` (coach or owner); it no longer picks "the first coach or first user".

### Tests (local, through heavy.sh)

- `npx jest test/recipes-tenant-visibility.spec.ts test/recipe-private-by-default-migration.spec.ts test/restore-schema-declared-objects-migration.spec.ts --runInBand`: 3 suites, 62 tests, all passed.
  - Covered: default private, cross-tenant read denied, coach-curated visible to own clients only, image link validation, prep guide scope, coach change, error copy rules, and migration static checks.
- **Mutation check:** adding a platform-wide `{ is_public: true }` branch and serving `image_url` made 16 tests fail.
- `npx tsc --noEmit -p tsconfig.json`: 0 errors.
- `eslint` on the changed files: 0 errors (1 pre-existing warning).
- `prettier`: clean on the changed src/test files.
- `scripts/check-r75.js`: OK.
- **CI at head 5b873988 (all required checks green):** build-and-test (all three new or affected specs PASS; whole suite 10613 passed, 203 skipped, 5 todo), rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Forward migrations apply cleanly, New migrations are reversible, Schema parity. deploy-readiness-gate was skipped, which is expected on a PR. Mergeable.

### Read-only production SQL for the operator (run before deploying #630)

```sql
-- B-RECIPES: read-only. Counts Recipe rows written since #625 created the table.
BEGIN TRANSACTION READ ONLY;
SELECT
  count(*)                                                                  AS recipes_total,
  count(*) FILTER (WHERE r.is_public)                                       AS recipes_public,
  count(*) FILTER (WHERE r.is_public AND u.role::text IN ('coach','owner')) AS public_by_coach_or_owner,
  count(*) FILTER (WHERE r.is_public AND u.role::text NOT IN ('coach','owner')) AS public_by_client_or_other,
  count(*) FILTER (WHERE coalesce(r.image_url, '') <> '')                   AS with_image_link,
  min(r.created_at)                                                         AS first_created_at,
  max(r.created_at)                                                         AS last_created_at,
  (SELECT count(*) FROM "SavedRecipe")                                      AS saved_rows_total,
  (SELECT count(*)
     FROM "SavedRecipe" s
     JOIN "Recipe" r2 ON r2.id = s.recipe_id
     JOIN "User"  su ON su.id = s.user_id
    WHERE s.user_id <> r2.created_by_id
      AND su.coach_id IS DISTINCT FROM r2.created_by_id)                    AS cross_tenant_saves
FROM "Recipe" r
LEFT JOIN "User" u ON u.id = r.created_by_id;
ROLLBACK;
```

How to read the result:
- `recipes_public > 0`: the migration will make those rows private.
- `cross_tenant_saves > 0`: someone saved another tenant's recipe, so exposure actually happened.
- `with_image_link > 0`: those links are stored but will never be served again.
- Expected result: all zeros. The mobile app has no recipe-create UI.

## Mobile

No mobile PR. None is needed for the risk:
- the backend change covers every installed build (lists are tenant-scoped and `image_url` is always null);
- no mobile UI assumes public recipes;
- `recipesApi.create` has no caller;
- the empty state already says "Recipes added by your coach will appear here."

**Handoff to S-ERRORS** (generic strings that already exist; they are S-ERRORS scope, not new):
- `RecipeDetailScreen`:
  - the save failure Alert says "Could not update saved status. Please try again.";
  - any load error shows "Recipe not found.", including network or 500 errors.
- `RecipesScreen`: the list error says "Couldn't load recipes / Pull down to try again."
- Codes to map:
  - 404 `RECIPE_NOT_FOUND` -> "This recipe is no longer shared with you", with "Back to recipes";
  - 403 `RECIPE_SHARING_COACH_ONLY` and 400 `RECIPE_IMAGE_URL_NOT_ALLOWED` -> create flows only (no UI yet).

## Findings outside this lane (for the operator)

1. **Account deletion leaves recipes behind** (`src/account-deletion/account-deletion.service.ts`).
   - Step 5 `recipe.deleteMany({created_by_id})` runs before step 12 deletes the user's SavedRecipe rows.
   - Any SavedRecipe that points at the user's recipes (their own bookmark, or a client's bookmark of a coach's shared recipe) makes the delete fail on `SavedRecipe_recipe_id_fkey` (ON DELETE RESTRICT).
   - `.catch(() => undefined)` swallows the failure, so the recipe content survives the deletion.
   - #630 hides a deleted creator's recipes from everyone, so nothing is exposed. The gap is retention and deletion integrity (App Store 5.1.1(v)).
   - Minimal fix, in the deletion lane: delete `savedRecipe` where `recipe.created_by_id = userId` before step 5, and do not swallow the error.
2. **Data export is missing the user's own recipes.** `src/users/account.service.ts` and `data-export.service.ts` export `SavedRecipe` rows (ids only), not the recipes the user created.
3. **`_count.saved_by`** on a shared recipe shows a client how many of the coach's clients saved it. This is an aggregate only, and the app does not render it. C-level; drop it when a client-safe response type is introduced.

## Open decisions (recommended default first)

1. **Existing rows:** the migration makes every existing row private, coach rows included, as the lane says. Recommended: keep. If the count shows coach rows that should stay shared, the coach re-creates them with `isPublic: true`.
2. **No update, unshare or delete endpoint for recipes in v1.0, and no coach recipe-authoring UI.** Coach curation is API or seed only. Recommended: accept for v1.0 and queue a coach recipe editor (share toggle and delete) for 1.0.1.
3. **The `is_public` name now means "shared with my own clients".** Recommended: keep the name for v1.0 (no contract churn) and rename it later in an expand/contract migration.
4. **Deploy ordering:**
   - #630 needs the `apply-migrations` acknowledgement;
   - run the read-only count first;
   - run any recipe seed only after the deploy.

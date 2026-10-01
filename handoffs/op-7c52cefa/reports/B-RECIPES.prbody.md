## Tier header

- **Tier:** T4 (re-graded upward from the lane's T3; never lower).
- **Why:** G06 puts tenancy and privacy boundaries at T4. This PR is the tenant boundary for recipe content (who can read whose recipes), and its migration rewrites existing rows (`is_public` true -> false) in a way `down.sql` deliberately does not reverse.
- **T4 trigger scan:** tenancy boundary: YES. PII/privacy (user-authored content reaching other users): YES. Data-rewriting migration not reversed by down.sql: YES. Auth/privilege, RLS policies, money, credentials: no. CI gate files (`.github/workflows/*`, `scripts/ci/*`, `prisma/schema-parity-baseline.sql`, `scripts/setup-branch-protection.sh`): none touched.
- **T3 trigger scan:** persistent data contract changes (column default, API semantics of `isPublic`): yes. One repository only. No concurrency/state-authority change.
- **Bounded T1:** none claimed.
- **Builder-owner:** B-RECIPES (Claude Opus 5.5), operator agent 109.
- **Acceptance evidence:** targeted jest (below), tsc, eslint, prettier, R75 banned-token check; CI at head. Real-Postgres proof of the migration is CI (`migration-dry-run` forward + down/up identity, `schema-parity` chain vs schema).
- **Promotion triggers:** already at the top tier.

## Why (Opus C-625-1 on #625)

#625 created the `Recipe` / `SavedRecipe` tables in production (deployed as 8a709a68), which turned dormant code on:
- `POST /recipes` (any client) defaulted `is_public` to true;
- `GET /recipes` returned every public recipe platform-wide;
- the app renders `image_url` as a remote image.

So one client's title, description and arbitrary image link reached every other coach's clients, with no moderation, reporting, blocking or tenant scope (App Store 1.2 risk, privacy, tenancy).

## What changes

**Access policy, one predicate** (`src/recipes/recipe-access.ts`, used by every recipe read: list, detail, save, saved list, prep guide). A viewer sees:
1. their own recipes (private by default);
2. recipes shared by **their own** coach: `is_public = true` AND `created_by_id = viewer.coach_id` AND creator role is `coach` or `owner` AND creator not deleted.

There is no platform-wide branch. A client's recipe is never visible to anyone else, whatever its `is_public` value. Tenancy is read from the per-request User row (JwtAuthGuard), so a coach change takes effect immediately, saved recipes included.

**API behaviour**

| Route | Before | After |
|---|---|---|
| `GET /recipes` | all public + own + saved (any tenant), unbounded | own + own coach's shared, `take 200` |
| `GET /recipes/:id` | public or own; 403 `Not accessible` otherwise | visible only; 404 `RECIPE_NOT_FOUND` for missing and not-visible (same body, no existence oracle) |
| `POST /recipes` | `is_public` default true for anyone; any `imageUrl` stored | private by default; `isPublic: true` = share with my own clients, coach/owner only, else 403 `RECIPE_SHARING_COACH_ONLY`; non-blank `imageUrl` -> 400 `RECIPE_IMAGE_URL_NOT_ALLOWED`; nothing written on refusal |
| `POST /recipes/:id/save` | public or own | visible only, else 404 `RECIPE_NOT_FOUND` |
| `GET /recipes/saved` | every saved recipe | saved and still visible, `take 200` |
| `DELETE /recipes/:id/save` | own bookmark | unchanged (always allowed, so a client can clear bookmarks after a coach change) |
| `GET /prep-guide` | meal-plan recipe ids unscoped; fallback = latest 6 public platform-wide | both paths filtered by the predicate; no platform-wide fallback |

- **Photos:** TGP has no recipe-photo upload storage, so no link is trusted. Every read serves `image_url: null`; links stored before this release (any host) never reach an app, including builds already installed.
- **Error bodies:** `{ code, error: code, message }`.
  - `code` is read by `HttpExceptionFilter` into the envelope.
  - `error: STABLE_CODE` is the S-ERRORS target shape.
  - Messages say what happened and what to do next, with no exclamation marks and no generic phrases (a test enforces this).
- **Bounded inputs:** `ingredients` and `instructions` have at most 100 items (each up to 500 / 2000 chars); `tags` at most 20 (each up to 50 chars).

**Migration `20270204000000_recipe_private_by_default`**
- `ALTER COLUMN "is_public" SET DEFAULT false` (catalog-only).
- `UPDATE "Recipe" SET is_public = false, updated_at = now() WHERE is_public = true`, with a NOTICE giving the row count.
- A final `DO $verify$` block raises if the default is not `false` or any public row remains.
- Runs in one transaction with `SET LOCAL lock_timeout 5s` and `statement_timeout 30s`.
- `down.sql` restores `DEFAULT true` only and never re-publishes rows.
- `schema.prisma` now declares `@default(false)`.
- No new table, policy or RLS change: `Recipe` keeps the #625 server-only posture.

**Seed** (`prisma/seed-recipes.ts`): now requires `SEED_RECIPES_COACH_ID` (role coach/owner, not deleted). It used to pick the first coach, or even the first user. It writes `image_url: null` and shares with that coach's own clients only.

## Tests

`npx jest test/recipes-tenant-visibility.spec.ts test/recipe-private-by-default-migration.spec.ts test/restore-schema-declared-objects-migration.spec.ts --runInBand`: 3 suites, 62 tests, all passed.

- **Predicate pinned verbatim.** The services run against an in-memory Prisma double that evaluates the where clauses (unknown filter keys throw, and `recipe.findUnique` throws so a read cannot bypass the predicate).
- **Default private:** client and coach recipes, `isPublic:false`.
- **Cross-tenant read denied:**
  - other coach's client: list, detail and save, with nothing written;
  - other coach;
  - coachless client;
  - same 404 body for missing and hidden ids;
  - a legacy public client recipe;
  - a `coach_id` that points at a non-coach;
  - a deleted coach.
- **Coach-curated reaches own clients only:**
  - coach and owner sharing;
  - a client asking to share gets 403 and no write;
  - save, then `isSaved`;
  - a coach change hides saved recipes and unsave still works;
  - list bounds.
- **Photo links:**
  - https, private-IP, `javascript:`, `data:` and padded links are refused;
  - blank means no photo;
  - list, detail, saved list and create never serve a stored link.
- **Prep guide:** another tenant's id in a meal plan is dropped; no platform-wide fallback.
- **Error copy rules.**
- **Mutation check:** adding a platform-wide `{ is_public: true }` branch and serving `image_url` failed 16 tests.
- **Migration static checks:** placement, transaction and bounds, only the `Recipe.is_public` default changes, rows move only towards private, no destructive statement, self-verification, schema `@default(false)`, down.sql never re-publishes.
- The #625 migration spec still passes with the new default.

Local checks:
- `tsc --noEmit -p tsconfig.json`: 0 errors.
- `eslint` on changed files: 0 errors (1 pre-existing warning: unused `DAYS` in prep-guide.service.ts).
- `prettier --check`: clean on the changed src/test files. `prisma/seed-recipes.ts` has a pre-existing unformatted line 378 that this PR does not touch.
- `node scripts/check-r75.js --mode=range --base=10dff85c`: OK.

## Operator notes

- **Deploy:** this release carries a migration, so the deploy needs the `apply-migrations` acknowledgement.
- **Before deploy, count production rows read-only** (query in the B-RECIPES report). Every row counted will become private. If coach-created rows are meant to stay shared, the coach re-creates them with `isPublic: true`; there is no update endpoint in v1.0.
- **Run the recipe seed only after this deploys,** with `SEED_RECIPES_COACH_ID`; a seed run before it would be flipped private.
- **Mobile:** no change is needed for safety. Every installed build gets `image_url: null` and tenant-scoped lists, and the empty state already says "Recipes added by your coach will appear here." The generic recipe error strings in the app are handed to S-ERRORS with the code map.

## Fix round

| Finding | What changed | Commit | Test that proves it |
|---|---|---|---|
| C-625-1 (Opus, #625) platform-wide public feed | one tenant predicate on every read; default private; coach/owner-only sharing; migration flips existing rows | 5b873988 | recipes-tenant-visibility.spec.ts (default private, cross-tenant denied, coach-curated), recipe-private-by-default-migration.spec.ts |
| C-625-1 arbitrary remote image | links refused on create; `image_url: null` on every read | 5b873988 | recipes-tenant-visibility.spec.ts "recipe photo links" |

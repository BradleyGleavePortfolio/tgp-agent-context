**Tier:** T4 (production data path: writes the house program set and, opt-in, the exercise catalog in production; operator-dispatched only)
**Why:** B14. Production has 0 `ClinicProgramSet` rows, so a coachless client finishes the consultation with no plan. The seed script exists but cannot run in production.
**T4 trigger scan:** destructive data: none (the seed is create-only in one transaction, idempotent per coach + fixture version; the catalog upsert writes metadata only and never touches Mux fields). Credentials: no new secret; uses the existing `FLY_API_TOKEN`; the app's `DATABASE_URL` stays inside the machine and is never printed. Auth/RLS/tenancy: unchanged. PII: none read or printed (output is ids only). Money: none.
**T3 trigger scan:** new operator workflow + Dockerfile build stage step + runtime artifact assertion.
**Bounded T1:** docs/clinic-onboarding.md.
**Canonical builder:** HOUSE-SEED-134 (claude_opus_5_5). **Parent owner:** operator agent 134.
**Acceptance evidence:** the targeted tests below (seen in a test); actionlint 1.7.7 with shellcheck on house-seed.yml: clean (seen locally). Not proven here: the Docker image was not built in the sandbox (no Docker); the runtime `test -f` lines fail the Fly build if the compiled seed is missing.
**Promotion triggers:** none (already T4).

## What changes for coaches and clients
Nothing until the operator dispatches the workflow. After a deploy of this commit and a dispatch with `mode=apply`, coachless clients (and clients whose coach has no set of their own) get the house plan when they finish the consultation.

## Bugs
B14 (root cause: no house set in production), 133-2 (fixture approved at the owner's default), 133-10 (house account passed by id, never an email).

## WHY / WHEN / WHO
- The seed loader and the draft fixture (`production_seed_authorized: false`) came in f04289f9 (#607). The house flag came in a7bf9ee1 (b#890, CONSULT-ALL-BE-133), which documented the production seed as a manual operator step from a laptop checkout.
- That step cannot run from production: since b801a776 (prod-only image) the runtime image ships `dist/` only (no `scripts/*.ts`, no `seed/`), and no workflow ran the script.

## What this PR does
1. **`.github/workflows/house-seed.yml`** (workflow_dispatch, `if: github.ref == 'refs/heads/main'`, `environment: production` so its required reviewers gate it). Inputs: `mode` (`dry-run` | `apply`, default dry-run), `coach_id` (uuid, validated; never an email), `exercise_catalog` (`skip` | `upsert`, default skip, apply only). Steps: validate inputs (env only, no `${{ }}` in any `run:`), check `FLY_API_TOKEN`, compute `CLINIC_PROGRAMS_SEED_APPROVED=<fixture_version>:<sha256>` from main's committed fixture at run time, check over `flyctl ssh console` that the running image carries the same fixture and both compiled scripts (stops otherwise: "deploy main first"), optionally upsert the exercise catalog, then run `node /app/dist/house-seed/scripts/seed-clinic-programs.js --house [--dry-run]` with `CLINIC_SEED_TARGET=production`. Output: the script's JSON in the log and the job summary.
   - Path chosen: ssh into the app (no new secret). The runner path was rejected: the repo-level `DATABASE_URL` secret dates from 2026-05-20 and its freshness and runner reachability are unknown; the machine's env is the one serving production now. The same ssh pattern already runs in fly-env-truth.yml.
2. **Dockerfile + `tsconfig.house-seed.json`**: after `npm run build` (and after the Sentry upload), the build stage runs `npx tsc -p tsconfig.house-seed.json` (both seed scripts and their imports → `dist/house-seed/`) and copies the fixture to `dist/house-seed/seed/` (where `main()` reads it). The runtime stage's artifact check now also asserts those three files. Nothing runs them at boot or release.
3. **Fixture** `seed/clinic-programs.v1.json`: `approval_status` `approved`, `production_seed_authorized` `true` (two lines; decision 133-2). The fixture is otherwise byte-identical to the owner's file (sha256 be932a56… before this edit). The new sha256 is d7cd74e7….
4. **Tests**: `test/ci/house-seed-workflow.spec.ts` (new): trigger, inputs, main + production binding, no expression in `run:`, pinned actions, FLY_API_TOKEN as the only secret, input validation run through bash (email, injected flags, unknown mode rejected), the approval flows from the committed fixture, the image check runs before the seed, the catalog upsert is apply-only. The compiled paths from `tsconfig.house-seed.json` equal the workflow's `/app/...` paths, the Dockerfile build `tsc`/`cp` and the runtime `test -f`. A real compile of the tsconfig, then a run of the compiled script: it refuses production with no approval, a wrong hash or a wrong version, and gets past the guard with the exact one. Guard on the committed, approved fixture: still refuses without the exact hash, including the old draft hash. Updated: `test/seed-clinic-programs.spec.ts` (draft-refusal test uses an explicit draft copy), `test/onboarding-clinic-programs.spec.ts` (fixture is approved), `test/ci/delivery-artifact.spec.ts` (house-seed.yml added to the pinned-actions and production-environment lists).

## Operator notes (from a SELECT on production, read-only)
- Production has 0 `ExerciseCatalogItem` rows, so all 22 fixture slugs are missing. A dry run will list them. Use `mode=apply exercise_catalog=upsert` once: it upserts the 50 catalog rows from `src/exercise-library/seed-catalog.ts`, which cover all 22 slugs (seen in a local check). Then the house seed writes in one transaction.
- No user has role `owner` (3 coaches, 2 students). The script accepts role coach or owner, so pass the owner's own coach account id.
- The fixture's own notes (line 602) ask for owner approval of the catalog-linked variations. Decision 133-2 (default: approved) covers that.
- Order: merge, then deploy with fly-deploy.yml, then dispatch `dry-run`, then `apply`. Verify with a SELECT: `SELECT count(*) FROM "ClinicProgramSet" WHERE is_house AND active;` should return 1.

## Tests run (targeted, one file at a time)
- test/ci/house-seed-workflow.spec.ts: 12/12
- test/seed-clinic-programs.spec.ts: 11/11
- test/onboarding-clinic-programs.spec.ts: 17/17
- test/ci/delivery-artifact.spec.ts: 100/100
- test/ci/fly-env-manifest.spec.ts: 69/69 (the workflow names no managed env key)

agent 134

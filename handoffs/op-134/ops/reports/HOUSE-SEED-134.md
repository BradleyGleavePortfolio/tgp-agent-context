# HOUSE-SEED-134 report (agent 134)

Status (20:58 PDT): b#896 DUAL APPROVED at d8a2372e (Opus LN-OPUS-D-134 APPROVE 20:46, Sol LN-SOL-D-134 APPROVE 20:50; B=0 U=0); CI green, mergeable clean. Operator merge. Backend worktree /home/user/workspace/wt/HOUSE-SEED-134-backend
(agent134/house-seed-134 off main 773e355c). Mobile: no PR (see step 2).

## Step 1 — b#896 house-seed workflow (B14, 133-2, 133-10)
PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/896 @ d8a2372e4fbd93f9b6c7d37bdb483b3c7f219156
Size: 461 changed lines (184 workflow, 214 new spec, 12 Dockerfile, 15 tsconfig, 19 docs, 4 fixture, 13 test edits). PR body: HOUSE-SEED-134-pr-body.md.

Path chosen: `flyctl ssh console` into the running app with a compiled copy of the existing scripts in dist/ — NO new secret
(existing FLY_API_TOKEN; the same ssh pattern already runs in fly-env-truth.yml, last green 10-07). Why not the runner path: the repo
secret DATABASE_URL dates from 2026-05-20 (pushed to Fly by fly-db-secrets-set that day; later changes unknown) and runner reachability
of the database host is unknown; the machine env is what production uses now (from the code + GitHub API metadata).

Files:
- .github/workflows/house-seed.yml (new): workflow_dispatch, main only, `environment: production`; inputs mode (dry-run | apply),
  coach_id (uuid validated, never an email), exercise_catalog (skip | upsert, apply only). Computes
  CLINIC_PROGRAMS_SEED_APPROVED=clinic-programs.v1:<sha256 of main's committed fixture> at run time; checks the running image carries the
  same fixture + both compiled scripts (else "deploy main first"); runs `node /app/dist/house-seed/scripts/seed-clinic-programs.js --house
  [--dry-run]` with CLINIC_SEED_TARGET=production. Output: script JSON (ids only). actionlint 1.7.7 + shellcheck clean (seen locally).
- Dockerfile: build stage `npx tsc -p tsconfig.house-seed.json` + copy fixture to dist/house-seed/seed/; runtime `test -f` for the 3 files.
- tsconfig.house-seed.json (new): compiles scripts/seed-clinic-programs.ts + scripts/seed-exercise-catalog.ts into dist/house-seed/.
- seed/clinic-programs.v1.json: approval_status approved, production_seed_authorized true (new sha256 d7cd74e7…; before: be932a56… =
  the owner's file byte for byte, seen with sha256sum).
- tests: test/ci/house-seed-workflow.spec.ts (new, 12), test/seed-clinic-programs.spec.ts, test/onboarding-clinic-programs.spec.ts,
  test/ci/delivery-artifact.spec.ts; docs/clinic-onboarding.md. Local (heavy.sh, one file at a time): 12/12, 11/11, 17/17, 100/100,
  fly-env-manifest 69/69 (seen in a test). The new spec really compiles the tsconfig and runs the compiled script: refuses production
  without / with a wrong approval, passes the guard with the exact one (seen in a test).

Production facts (Supabase SELECT only, about 20:25 PDT): ClinicProgramSet 0, ExerciseCatalogItem 0 (all 22 fixture slugs missing), users:
3 coach, 2 student, 0 owner. The 50-row seed catalog covers all 22 fixture slugs (seen in a local check). So the first apply must be
`mode=apply exercise_catalog=upsert`.

Operator steps (never run by me): merge b#896 -> deploy with fly-deploy.yml -> dispatch `mode=dry-run coach_id=<owner's coach account
User.id> exercise_catalog=skip` (expect dry_run with 22 missing slugs) -> dispatch `mode=apply exercise_catalog=upsert` (expect
"seeded 50 exercise-catalog rows" then {"status":"seeded","house":true,...}) -> SELECT count(*) FROM "ClinicProgramSet" WHERE is_house AND active; = 1.

## Step 2 — mobile 133-9 check (U-890-1)
Not yet true on mobile main b8c1fa22 (from the code): a coachless client with a screening yes reads "Your coach has been told."
(src/screens/consultation/RevealScreens.tsx:377 via fillCopy fallback src/lib/consultation/engine.ts:390-391), and "your coach" at :268
(paused), :336 (macro), :409 (plan).
m#581 (head c632fd01) rewrites exactly those four lines (REVEAL_COPY + COACHLESS_COPY; coachless physician line "Start once your
physician gives you the OK.", coachless macro line dropped, tests in consultationParity133States.test.tsx), and m#579 (head f2facf5d)
adds CopyContext.coachless + the fillCopy swap (engine.ts) and passes coachless from ConsultationFlow. Every line in question is touched
by m#581, so per the entry I opened NO mobile PR (it would only conflict). 133-9 becomes true when m#579 -> m#581 merge.
Mobile worktree /home/user/workspace/wt/HOUSE-SEED-134-mobile left unchanged.

## Proposed (needs operator)
- P1. First apply needs the exercise catalog (production has 0 rows). Default: dispatch apply with exercise_catalog=upsert (idempotent,
  metadata only, never touches Mux fields).
- P2. House account: no user has role owner in production; pass the owner's own coach account id (script accepts coach or owner).

## B / U / C
B=0 U=0. C: Prisma connection errors print host:port (no credentials) on a failed run (edge, deferred to 10k clients).

## HANDOFF
- b#896 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/896 @ d8a2372e4fbd93f9b6c7d37bdb483b3c7f219156: CI green,
  READY posted (issuecomment-6073818484), Opus APPROVE + Sol APPROVE at this head, B=0 U=0. Lens Cs: catalog upsert overwrites
  name/instructions of existing slugs (0 rows today); rolling deploy could split image check and seed across machines (in-script guard
  refuses, safe); Prisma connection error prints DB host (no credentials).
- Next (operator only): merge b#896 -> deploy (fly-deploy.yml) -> dispatch "House Seed (operator)" mode=dry-run, coach_id=<owner's coach
  account User.id>, exercise_catalog=skip -> dispatch mode=apply exercise_catalog=upsert -> SELECT count(*) FROM "ClinicProgramSet"
  WHERE is_house AND active; = 1. I dispatched nothing.
- 133-9: no mobile PR; m#579 -> m#581 carry the coachless reveal copy for every line in question (see step 2). Mobile worktree unchanged.
- Fixture note for COACHLESS-FIX-134: seed/clinic-programs.v1.json differs from the owner's file only in the two approval lines after b#896.
- Nothing pushed half-done. Worktree clean at d8a2372e.

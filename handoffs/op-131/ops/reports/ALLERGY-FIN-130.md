# ALLERGY-FIN-130 (Claude Opus 5.5, finisher, T4 safety) — agent 130

Status 18:48 PDT: DONE. PR b#868 at a2caccf1e1be613720c2bbf8ad29b71f6f36277b, CI green (19/19), merge state CLEAN, READY posted 18:48
(https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/868#issuecomment-6050500336). Verdicts not waited for (builders end after READY).

## Scope traced
- Finished CF-ALLERGY-128's branch agent129/cf-allergy-128 (was be06333c, based on c3324d4a). Merged origin/main d6065661 (17 commits, clean; none touch recipes, prep guide, data export or schema).
- Migration 20270404000000_recipe_declared_allergens is newer than every migration on main (newest: 20270403000000_private_custom_foods); no other open agent129/agent130 branch adds a migration at or after 20270404. Additive only (two ADD COLUMN with constant defaults; down.sql drops them). DDL matches Prisma's form for the same field types (same as UserProfile.dietary_restrictions); CI Schema parity green.
- Other recipe reads outside src/recipes and src/prep-guide: only the client's own data export (src/users/account.service.ts:303, saved bookmarks) and account deletion. Roman and AI paths do not read recipes.

## B list
- B1 (fixed in b#868, seen in a test): a client with a nut allergy is shown every coach recipe, including ones the coach marks as containing nuts (Recipes, Saved, Prep guide). Failing-first on main d6065661: the suite does not load; with only src/recipes/allergens.ts copied onto main, 11/39 fail (list, saved, detail/save 404, prep guide, create, GET /recipes/allergens).

## U list
- none

## C one-liners
- Meal templates / meal plans allergen lines: need the coach template editor (follow-up).
- C (edge, deferred to 10k clients): a plan whose referenced recipes are all hidden gives the prep guide source "plan" with zero recipes (no library fallback).

## Found and fixed in this round
- test/restore-schema-declared-objects-migration.spec.ts "table Recipe has exactly the scalar fields of its model" failed on the branch (seen in a test): it compared the 20270125000000 restore's CREATE TABLE "Recipe" with today's model. It now names the two later columns with their migration and checks that migration adds each in the declared shape. 23/23. (The earlier builder never ran it; no PR CI had run on the branch.)

## PRs
- growth-project-backend#868 "feat(recipes): hide a coach recipe only when its declared allergens match the client's (ALLERGY, T4)", branch agent129/cf-allergy-128, head a2caccf1e1be613720c2bbf8ad29b71f6f36277b, 821 lines (806+/15-; 297 non-test, 524 tests), CI green 19/19 (incl. build-and-test, Schema parity, Forward migrations apply cleanly, New migrations are reversible), READY 18:48. Verdicts: none yet.
- Local (heavy.sh, after the merge): recipes-declared-allergens 39/39, recipes-tenant-visibility 34/34, nutrition-services-128 16/16, data-export-archive-inventory 13/13, data-export.service 8/8, account-deletion/recipe-erasure 5/5, erasure-manifest-coverage 7/7, restore-schema-declared-objects-migration 23/23, dunning-v2-lockout-allowlist-route-table 36/36; eslint clean on the 7 changed src files; R75 net 0. No prisma generate run locally (it would overwrite the shared client; ts-jest is transpile-only).
- PR body: /home/user/workspace/ops/reports/ALLERGY-FIN-130-pr-body.md; READY text: /home/user/workspace/ops/reports/ALLERGY-FIN-130-ready.md

## Production (read-only SELECT 18:31 PDT, counts only)
- 0 Recipe rows, 0 shared, 0 UserProfile rows with saved restrictions; newest applied migration 20270403000000_private_custom_foods (= main's newest); allergen columns absent. This migration is the deploy's whole schema delta unless another migration merges first.

## Proposed (needs operator)
1. Deploy b#868 after dual APPROVE and merge: fly-deploy.yml with migrations=apply-migrations (it adds a migration). Default: the next backend deploy after the merge. ALLERGY-M-130 (mobile half) waits for that deploy.

## HANDOFF
- PR: growth-project-backend#868, branch agent129/cf-allergy-128, head a2caccf1e1be613720c2bbf8ad29b71f6f36277b, READY posted 18:48 PDT (FIX ROUND 1 (OPENING) (ALLERGY-FIN-130, agent 130)). Worktree /home/user/workspace/wt/ALLERGY-FIN-130-backend (clean; node_modules symlinked to deps).
- Next (FIX-OPUS-130 / FIX-SOL-130): act on lens verdicts at that head. Any fix: push to agent129/cf-allergy-128 (no force), CI green, post `FIX ROUND 2 (ALLERGY-FIN-130, agent 130, <your ID>) — growth-project-backend#868 @ <sha> — READY FOR AUDIT`. If main gains a migration newer than 20270404000000 before merge, rename this one (and update test/restore-schema-declared-objects-migration.spec.ts ADDED_LATER) so it stays newest.
- Files: src/recipes/allergens.ts, recipe-access.ts, recipes.service.ts, recipes.controller.ts, recipes.dto.ts; src/prep-guide/prep-guide.service.ts; src/data-export/data-export.service.ts; prisma/schema.prisma; prisma/migrations/20270404000000_recipe_declared_allergens/{migration,down}.sql; tests: test/recipes-declared-allergens.spec.ts, test/restore-schema-declared-objects-migration.spec.ts, test/recipes-tenant-visibility.spec.ts, test/nutrition-services-128.spec.ts.
- Operator: merge only at dual APPROVE; deploy with migrations=apply-migrations; then message ALLERGY-M-130.

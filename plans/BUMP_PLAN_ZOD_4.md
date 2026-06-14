# BUMP PLAN — zod 3.25.76 → 4.4.3 (Backend PR #307)

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-13
**PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/307
**Branch:** `dependabot/npm_and_yarn/zod-4.4.3`
**Audit lane:** backend, OWNS `src/**/*.dto.ts`, `src/**/*.schema.ts`, `src/landing-pages/section-schemas.ts`, `src/wearables/samples/dto/**`

## Summary

zod v4 is a **major rewrite** with several breaking API renames. PR #307 only bumps the dependency — the code changes must be done by a fixer subagent because the bump touches 53+ files importing zod.

This is NOT a trivial bump. The snapshot incorrectly characterized it as "2 sites." Actual surface: **18 `z.nativeEnum` sites + 1 `result.error.errors` + 1 `z.record(z.string(), …)` site + likely cascade in `.uuid()`/`.email()` if peers don't follow**.

## Hard breaking changes that affect this repo

| zod 3 | zod 4 | Repo sites | Fix |
|---|---|---|---|
| `result.error.errors` | `result.error.issues` | 1 confirmed (`src/landing-pages/section-schemas.ts:253`) | Rename `.errors` → `.issues`. Test in `test/observability.spec.ts:335` uses `report.errors` from a different shape (the report's own field, NOT a zod error) — DO NOT touch. |
| `z.nativeEnum(E)` | `z.enum(E)` accepts native enums in v4 | 18 sites (all in `src/wearables/samples/dto/**` + `src/wearables/connectors/**`) | Mechanical replace — but verify v4 `z.enum` supports native TS enums (per zod 4 docs, yes). |
| `z.record(V)` | `z.record(K, V)` required (key arg mandatory) | 1 site (`src/wearables/connectors/strava/strava.types.ts:135`) | Already correct shape: `z.record(z.string(), z.unknown())` — verify no other 1-arg `z.record` calls slipped in. |
| `z.string().uuid()` | Still works in v4 but `z.uuid()` is preferred top-level | 10+ files | LEAVE AS-IS in this PR. v4 keeps backward-compat. Schedule a follow-up cleanup PR. |
| `invalid_type_error` / `required_error` removed | Use `.errors` API or `error` callback | 0 sites (confirmed via grep) | None needed |

## Repo-wide grep audit (must be re-run by builder)

```bash
# In growth-project-backend/
grep -rnE "\.error\.errors\b" src/ test/ --include="*.ts" | grep -v node_modules
grep -rnE "z\.nativeEnum\b" src/ test/ --include="*.ts" | grep -v node_modules
grep -rnE "z\.record\(" src/ test/ --include="*.ts" | grep -v node_modules
grep -rnE "invalid_type_error|required_error" src/ test/ --include="*.ts" | grep -v node_modules
```

Run these BEFORE the fix-up commit. If counts change vs. this plan, STOP and re-plan.

## Lane safety (R71)

- **OWNS:** `src/landing-pages/section-schemas.ts`, `src/wearables/samples/dto/*.ts`, `src/wearables/connectors/strava/strava.types.ts`.
- **MUST-NOT-TOUCH:** All other zod-importing files unless audit reveals a real break (do not pre-emptively migrate to `z.uuid()` — that's deferred polish).
- **No file overlap with any other in-flight lane.** No community/wearables feature PR currently in flight.

## Fixer dispatch (Opus 4.8, R31-fresh)

Builder brief skeleton:

> Branch: `dependabot/npm_and_yarn/zod-4.4.3` (rebased onto post-#301/#304 main).
> Goal: get CI green on zod 4.4.3.
> Required commits (separate, in order on top of the Dependabot bump):
>  1. `chore(zod-4): rename .errors → .issues + nativeEnum → enum`
>  2. `test(zod-4): verify Strava webhook z.record still parses + targeted suite green`
> Gates (R66-R70 fail-fast):
>  - `npx tsc --noEmit` (0 errors)
>  - `npm run lint` (≤ existing warning count)
>  - `npm test` full suite (must match or exceed baseline pre-bump count)
> Push every 2 min (R61). Auditor will run R72-exhaustive + R65 50-failures sweep.

## Audit cycle (R-rules)

PLANNER (this doc) → BUILDER (Opus 4.8, fresh) → AUDITOR R1 (GPT-5.5, fresh) → CLEAN ⇒ merge OR DIRTY ⇒ FIXER → AUDITOR Rn+1.

## Parallelization

- **Safe to run parallel with #200 async-storage fixer** (separate repos, zero file overlap).
- **Safe to run parallel with v3-2/v3-3 builders** (no community DTO conflicts — different `nativeEnum` sites, additive at worst).
- **MUST NOT run parallel with any other backend feature PR that touches `src/wearables/**` or `src/landing-pages/**`** (Roman, MWB don't touch these; community v3-2 classroom + v3-3 voice don't either).

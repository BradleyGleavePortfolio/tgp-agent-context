# HK-3a Backend — R4 Fixer Result

**PR:** BradleyGleavePortfolio/growth-project-backend #356
**Branch:** `hk/PR-HK-3a-fitness-bucket`
**Pin-from SHA (R55):** `14aa1454c3dc4ec21260d2ea6025d177e8564184`
**New head SHA:** `23fc58ac4d4b4c5d15a8c16fa67950fdbead3658`
**Status:** **CLEAN**
**Worktree:** `/tmp/wt-hk3a-backend-r4` (node_modules symlinked from `/tmp/wt-hk3a-backend` to avoid a fresh install)

---

## P1 fixed — narrow `onModuleInit` catch to connectivity errors (R65 #36)

`src/wearables/samples/wearable-samples.service.ts`

1. **New module-scope helper `isConnectivityError(err: unknown): boolean`** (exported).
   - Returns `true` for `Prisma.PrismaClientInitializationError` (any instance).
   - Returns `true` for `Prisma.PrismaClientKnownRequestError` whose `code` is in `{P1001, P1002, P1008, P1011, P1017}` (set `PRISMA_CONNECTIVITY_CODES`).
   - Returns `false` otherwise.
   - **Prisma import path deviation (justified):** brief suggested `@prisma/client/runtime/library`. The service already imports the `Prisma` namespace from `@prisma/client`, which re-exports both error classes (`node_modules/.prisma/client/index.d.ts` lines 2683/2686 `export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError`, etc.). Using `Prisma.PrismaClientInitializationError` / `Prisma.PrismaClientKnownRequestError` matches the existing repo convention (e.g. `src/workout-builder/workout-builder.service.ts:185`) and adds no new import. This is the brief-sanctioned "use the correct subpath; do not invent" outcome.

2. **`onModuleInit` restructured** so the whole bootstrap body is inside one `try`:
   - `findMany` → empty defs table → `logger.error({event:'wearable_metric_def_bootstrap_empty'})` + `throw new Error('WearableMetricDef seed missing')`.
   - Seed validation extracted into new private `assertMetricMapMatchesSeed(defs)` (adapts the brief's reference name to the existing inline drift logic) — logs error + throws on bucket/aggregation drift.
   - `catch (err)`: `isConnectivityError(err)` → `logger.warn({event:'wearable_metric_def_bootstrap_skipped', reason})` + `return` (fail-open ONLY for connectivity). Everything else → `logger.error({event:'wearable_metric_def_bootstrap_failed', reason})` + `throw err` (rethrow).
   - Existing `raceTimeout` (#35 5s budget) retained around `findMany`; a boot timeout throws `ServiceUnavailableException`, which is NOT in the connectivity allowlist and therefore rethrows (fails loud) — consistent with the brief's intent.

3. **Doc comment updated** to describe the narrowed catch and that empty-table / schema / permission / malformed-enum / drift all fail the boot loud.

`test/wearables/wearable-samples.service.spec.ts`

4. Added `Prisma` to the `@prisma/client` import.
5. New describe block **`WearableSamplesService — onModuleInit boot catch narrowing`** with 5 tests (4 required + 1 extra code-coverage case):
   - connectivity (`PrismaClientInitializationError` P1001) → no throw, `bootstrap_skipped` warn asserted.
   - extra: `PrismaClientKnownRequestError` P1017 → no throw (covers the known-request connectivity branch).
   - empty table → throws `WearableMetricDef seed missing`.
   - non-connectivity Prisma error (`P2002` known-request) → rethrows the same error instance.
   - drift error from `assertMetricMapMatchesSeed` → rethrows (`/map drift/i`).

---

## Files changed

| File | Insertions | Deletions |
|------|-----------:|----------:|
| `src/wearables/samples/wearable-samples.service.ts` | +85 | −20 |
| `test/wearables/wearable-samples.service.spec.ts` | +79 | −0 |
| **Total** | **+164** | **−20** |

Schema / migrations / seed / DTOs / controllers / mobile imports: **untouched** (per constraints).

---

## Gate results (all pass; baselined via stash-diff)

| Gate | Result | Notes |
|------|--------|-------|
| `npx prisma validate` | **PASS** | Schema valid. (Bare run reports `Environment variable not found: DIRECT_URL` — a sandbox env-var condition, NOT a schema fault and unrelated to this diff, which does not touch the schema. With `DATABASE_URL`/`DIRECT_URL` set: "The schema at prisma/schema.prisma is valid 🚀".) |
| `npx tsc --noEmit` | **PASS** | Exit 0, no errors. Exhaustive `never` arm (line 549 `const exhaustive: never = aggregation`) still compiles. |
| `npx eslint src --max-warnings=0` | **PASS (baseline-equal)** | 15 warnings, 0 errors — ALL pre-existing in unrelated modules (landing-pages, lists, macros, meal-plans, notifications/nudges, prep-guide, real-meal-plans, storefront). Baseline pin-SHA stash run = identical 15 warnings. Changed file `wearable-samples.service.ts` alone: exit 0, zero warnings. |
| `npx jest --runInBand` | **PASS (baseline-equal)** | 17 failed / 4001 passed (4 suites: module-graph, openapi-spec, roles-enforced, scheduling). Baseline pin-SHA stash run = identical 17 failed / 4 suites / 3996 passed. My diff adds +5 passing tests, **zero** new failures. The 4 failing suites are unrelated to wearables. Focused `wearable-samples.service.spec.ts`: 27/27 pass. |
| `npx nest build` | **PASS** | Exit 0. |

### Stash-diff confirmation (baseline = pinned head, no working changes)
- ESLint: 15 warnings / 0 errors both before and after → no regression.
- Jest: `17 failed, 3996 passed` (baseline) → `17 failed, 4001 passed` (with diff) → +5 passing, same 17 pre-existing failures.

---

## R65 50-Failures sweep

| Focus | Result |
|-------|--------|
| Silent catches (the fix target) | **CLEAN** — the single boot `catch (err)` logs and either warn-returns (connectivity only) or `throw err`. No other catch in `src/wearables/samples/` swallows; all bind `err`. |
| `as any` | 0 |
| `@ts-ignore` / `@ts-nocheck` | 0 |
| `catch(e){}` / empty catch | 0 |
| `.catch(()=>undefined)` | 0 |
| "Coming soon" / "TODO: implement" | 0 (none added) |
| Spinner-only empty state | N/A (backend); 0 hits |
| Exhaustiveness `never` arms | Intact (`aggSqlExprFor` `const exhaustive: never`) — tsc clean. |
| Test titles | Plain English, no banned phrases. |
| Bans applied to comments + test titles | Verified — 0 hits across both changed files. |

R0 LAW honored. Title-only commit. Author `Dynasia G <dynasia@trygrowthproject.com>` (no `Co-Authored-By`, no `Generated-By`).

---

## Commit & push

- Commit: `23fc58ac4d4b4c5d15a8c16fa67950fdbead3658`
  - subject: `PR-HK-3a: narrow onModuleInit catch to connectivity errors`
  - author: `Dynasia G <dynasia@trygrowthproject.com>`, empty body.
- Pushed with `--force-with-lease=hk/PR-HK-3a-fitness-bucket:14aa1454...` → `14aa145..23fc58a`.
- Verified: `origin/hk/PR-HK-3a-fitness-bucket` head = `23fc58ac...`; PR #356 `headRefOid` = `23fc58ac...`, state OPEN.

---

## Deviations from brief
1. **Prisma error classes imported via the existing `Prisma` namespace** (`@prisma/client`) rather than a new `@prisma/client/runtime/library` import. The namespace re-exports both classes; this matches repo convention and adds no import. (Brief explicitly permitted using the correct available path.)
2. **Seed validation extracted to a private `assertMetricMapMatchesSeed(defs)` method** (the brief's reference pattern names this method, but the original code had the logic inline). Behavior is identical; drift still throws and now rethrows through the narrowed catch.
3. **`prisma validate` requires `DATABASE_URL`/`DIRECT_URL`** to be set in this sandbox; the schema itself is valid. Not a code issue and unrelated to the diff.

No other deviations.

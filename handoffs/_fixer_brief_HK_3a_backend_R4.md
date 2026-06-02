# HK-3a Backend — R4 Fixer Brief

**PR:** BradleyGleavePortfolio/growth-project-backend #356
**Branch:** `hk/PR-HK-3a-fitness-bucket`
**Pin from SHA (R55):** `14aa1454c3dc4ec21260d2ea6025d177e8564184`
**Base:** `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
**Model:** Opus 4.8 (R-policy)
**Round:** R4

## Bradley R0 LAW (decacorn) — must honor
- NO "Coming soon" / silent failures / `@ts-ignore` / `@ts-nocheck` / `as any` / `.catch(()=>undefined)` / `catch(e){}` / spinner-only empty states.
- Bans apply to test titles too.
- Commit author MUST be `Dynasia G <dynasia@trygrowthproject.com>` — title-only, no `Co-Authored-By` / no `Generated-By`.

## Single P1 to fix — narrow `onModuleInit` catch (R65 #36)

**File:** `src/wearables/samples/wearable-samples.service.ts`
**Lines:** 113-128 (broad catch around `WearableMetricDef.findMany`); `130-132` (empty-table warn).

### Current behavior (BAD)
Catches **any** error from `WearableMetricDef.findMany` and silently falls back to compile-time mirrors. Also empty-table case only logs a warning.

This correctly handles DB-unreachable at boot, but **masks** schema mismatch, permission-denied, malformed enum, or seed drift — real config bugs become silent fallbacks. Sanity-check is bypassed.

### Required fix

1. Add helper `isConnectivityError(err: unknown): boolean` at module scope (or in a small util in the same file). It must return `true` for:
   - `PrismaClientInitializationError` (any instance)
   - `PrismaClientKnownRequestError` with code in `{P1001, P1002, P1008, P1011, P1017}`
   - Otherwise `false`.

   Import the Prisma error classes from `@prisma/client/runtime/library` (verify in `node_modules` — if path differs at the pinned lockfile, use the correct subpath; do not invent).

2. Restructure `onModuleInit` so that:
   - DB unreachable (connectivity error) → log `warn` with `{ err }`, return (fail-open is OK ONLY for connectivity).
   - Empty defs table → log `error` and **throw** `new Error('WearableMetricDef seed missing')`. Empty table is a real config bug, not connectivity.
   - Any other error from `findMany` or from `assertMetricMapMatchesSeed` → log `error` with `{ err }`, **rethrow**.

3. Reference pattern (adapt to existing logger + naming):
   ```ts
   async onModuleInit() {
     try {
       const defs = await this.prisma.wearableMetricDef.findMany();
       if (defs.length === 0) {
         this.logger.error('WearableMetricDef table empty at boot — seed not applied');
         throw new Error('WearableMetricDef seed missing');
       }
       this.assertMetricMapMatchesSeed(defs);
     } catch (err) {
       if (isConnectivityError(err)) {
         this.logger.warn('WearableMetricDef sanity check skipped — DB unreachable at boot; using compile-time mirrors', { err });
         return;
       }
       this.logger.error('WearableMetricDef sanity check failed', { err });
       throw err;
     }
   }
   ```

4. Add a unit test in `test/wearables/wearable-samples.service.spec.ts` (or nearest existing spec) covering:
   - Connectivity error (mock `prisma.wearableMetricDef.findMany` to reject with a `PrismaClientInitializationError`) → no throw, warn logged.
   - Empty result → throws `WearableMetricDef seed missing`.
   - Non-connectivity Prisma error (e.g. `P2002` known request error) → rethrows.
   - Drift error from `assertMetricMapMatchesSeed` → rethrows.

   Test titles MUST NOT contain banned phrases. Use plain English describing behavior.

## Gates (must all pass)

From repo root (use the existing worktree if convenient, but always validate against the head of `hk/PR-HK-3a-fitness-bucket`):

```
npx prisma validate
npx tsc --noEmit
npx eslint src --max-warnings=0
npx jest --runInBand   # 17 pre-existing main failures expected; verify by stash
npx nest build
```

If a failure exists in baseline `main` but not in your diff, document with a stash-diff in the result.

## R65 50-Failures sweep (mandatory)

Run through all 50 categories, paying special attention to:
- silent catches (the very thing being fixed) — confirm nothing else in `src/wearables/samples/` swallows
- exhaustiveness `never` arms still compile
- no `as any`, no `@ts-ignore`, no `.catch(()=>undefined)`, no `catch(e){}`
- no "Coming soon" / "TODO: implement" added

## Constraints
- Touch only the lines required for the fix + the new helper + tests.
- Do **not** change Prisma schema, migrations, or seed data.
- Do **not** touch DTOs, controllers, or mobile imports.
- Do **not** add `Co-Authored-By` or `Generated-By`. Title-only commits.
- Use `git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "PR-HK-3a: narrow onModuleInit catch to connectivity errors"`.
- Push with `--force-with-lease` to the PR branch.

## Deliverable
Write `_fixer_result_HK_3a_backend_R4.md` to `/home/user/workspace/` with:
- New head SHA (40-char)
- Files changed (paths + line counts)
- Test output summary (Jest results for the new tests + overall)
- Confirmation of all 5 gates
- R65 sweep results
- Any deviations from this brief

## STATUS expected
CLEAN at PR level (zero P0+P1+P2 from this brief). R4 audit will verify.

# PR-HK-FIX-1 Builder Brief — Unblock AppModule graph (v2: 2-file scope)

**Builder model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Branch from:** `origin/main` @ `e49ae5ae2e0320ffcc73f5719dde555452c1f86b` (R55 — full 40-char SHA)
**Branch name:** `dynasia/pr-hk-fix-1-appmodule-graph`
**Worktree path:** create fresh — `/tmp/wt-hk-fix-1`
**Round:** R0 (new PR)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`

---

## CHANGELOG vs v1 (read this first)

**v1 was scoped as a 1-file diff. v1's premise was incomplete.** Empirical replay on a fresh clone proved that the v1 fix unmasks a second, latent defect — once `ConnectorRegistry` is removed from `WearablesModule.exports`, the next error Nest hits while compiling `AppModule` is:

```
Nest can't resolve dependencies of the OauthStateService (?). Please make sure
that the argument at index [0] is available in the current module.
```

Both defects must be fixed **together** for any of the three AppModule-graph suites to go green. v2 expands scope from **1 file → 2 files** but keeps the single concern: *unblock the AppModule graph so main CI is no longer red.*

**Why one PR not two (decacorn rationale):** Apple's actual rule is "a commit must compile and pass tests in isolation," not "one file per PR." Splitting this into FIX-1a (export removal) + FIX-1b (`@Optional()` decorator) would yield two individually-broken commits: 1a alone leaves CI red, 1b alone is dead code with no symptom. A future engineer bisecting would land on 1a and chase a phantom regression for an hour before discovering 1b. Single coherent fix = single PR. See `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` "Drive-by fixes" anti-pattern — it warns about *unrelated* changes hitchhiking, not about a coherent fix that legitimately spans two files because the bug spans two files.

---

## What this PR fixes

Main branch CI has been red since `9c67444c` (PR-HK-0 foundation, 2026-05-31). Two stacked defects in the wearables module graph:

**Defect A:** `WearablesModule` re-exports the bare `ConnectorRegistry` provider in its `exports` array. Nest rejects this at `Test.createTestingModule(AppModule)` time with:

```
Nest cannot export a provider/module that is not a part of the currently
processed module (WearablesModule).
```

**Defect B (unmasked by A):** `OauthStateService` constructor takes a single optional **interface-typed** parameter (`store?: OauthStateStore`). TypeScript emits `undefined` for interface types in `design:paramtypes` metadata, so without an explicit `@Optional()` decorator Nest's instance-loader rejects the provider at AppModule compile time with:

```
Nest can't resolve dependencies of the OauthStateService (?). Please make sure
that the argument at index [0] is available in the current module.
```

This is a textbook Nest quirk — well-documented in the Nest FAQ. The runtime code already handles `undefined` correctly (`this.store = store ?? OauthStateService.resolveStore(this.logger)`), but Nest's DI graph validator fires *before* the constructor runs. The `@Optional()` decorator is the canonical fix.

**Together** these two defects break **three** AppModule-graph test suites (each with 1 failing test):
- `test/module-graph.spec.ts` — `AppModule dependency graph › compiles AppModule without throwing UndefinedModuleException`
- `test/openapi-spec.spec.ts` — `OpenAPI document › declares OpenAPI 3.1`
- `test/roles-enforced.spec.ts` — `RolesEnforced — every route has @Roles or @Public`

`scheduling.service.spec.ts` is also red (14 tests) but that is **calendar rot** with an independent root cause and is fixed in parallel PR-FIX-2. Do NOT touch scheduling in this PR.

Runtime is unaffected by either defect — the production composition root never trips Nest's validator (presumably because `AppModule` is constructed via `NestFactory.create` which is more permissive, or because Defect A masks Defect B in prod the same way it masks it in tests).

---

## Root causes

### Defect A — WearablesModule re-export

`src/wearables/wearables.module.ts:62-71`:

```ts
exports: [
  IngestionService,
  ProviderHttpClient,
  ConnectionsModule,
  OauthModule,
  ConnectorRegistry,        // ← Defect A
  InsightsModule,
  SamplesModule,
  PreferencesModule,
],
```

`ConnectorRegistry` is **provided + exported** by `ConnectionsModule` already. `WearablesModule` imports `ConnectionsModule`, so consumers get `ConnectorRegistry` transitively. The bare re-export is redundant **and** violates Nest's rule.

### Defect B — OauthStateService interface-typed optional param

`src/wearables/oauth/oauth-state.service.ts:155-158`:

```ts
constructor(store?: OauthStateStore) {
  this.store = store ?? OauthStateService.resolveStore(this.logger);
}
```

`OauthStateStore` is a TypeScript `interface`, so `Reflect.getMetadata('design:paramtypes', ...)` at index 0 is `undefined` (interfaces have no runtime representation). Without `@Optional()`, Nest's `lookupComponentInParentModules` refuses to resolve a non-resolvable token. Add `@Optional()` and Nest will pass `undefined` cleanly, which the constructor already handles.

---

## The fix (2 files, 4 line edits total)

### File 1: `src/wearables/wearables.module.ts`

```diff
-import { ConnectorRegistry } from './connector-registry';
```

```diff
   exports: [
     IngestionService,
     ProviderHttpClient,
     ConnectionsModule,
     OauthModule,
-    ConnectorRegistry,
     InsightsModule,
     SamplesModule,
     PreferencesModule,
   ],
```

Also tighten the docblock if it claims the re-export is what surfaces `ConnectorRegistry` to consumers. Replace any such phrasing with: "exposed transitively via `ConnectionsModule`'s exports — connector PRs and submodules consume it through `imports: [ConnectionsModule]` or `imports: [WearablesModule]`."

### File 2: `src/wearables/oauth/oauth-state.service.ts`

```diff
-import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
+import { Injectable, Logger, Optional, OnModuleDestroy } from '@nestjs/common';
```

```diff
-  constructor(store?: OauthStateStore) {
+  constructor(@Optional() store?: OauthStateStore) {
     this.store = store ?? OauthStateService.resolveStore(this.logger);
   }
```

Also tighten the `@param store` JSDoc to note the `@Optional()` decorator: "Optional injected store (`@Optional()` because the type is an interface and Nest cannot reflect on it). Tests pass an in-memory or fake store. In production…"

---

## Files in scope

1. `src/wearables/wearables.module.ts` — Defect A
2. `src/wearables/oauth/oauth-state.service.ts` — Defect B

**Do NOT touch:**
- `src/wearables/connections/connections.module.ts` — already correct
- `src/wearables/connector-registry.ts` — already correct
- `src/wearables/oauth/oauth.module.ts` — already correct (it provides + exports `OauthStateService`)
- Any connector module (`src/wearables/connectors/*/`)
- `test/scheduling.service.spec.ts` — that's PR-FIX-2
- ANY of the other 17 main failures
- ANY HK-5b or HK-6a code (separate PRs in flight)

---

## Bradley R0 LAW (re-read before commit)

- NO "Coming soon", NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, NO `as never`, NO `as never as X`, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed at narrow, unavoidable mock boundaries.
- This PR should have **zero** R0 grep hits — it's a 4-line edit. If you find any, you have changed too much.

R0 grep (run from repo root before commit):

```bash
git diff origin/main -- src/wearables/wearables.module.ts src/wearables/oauth/oauth-state.service.ts | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# Expect: zero matches.
```

---

## Verification checklist (you must run every one and paste output in result file)

### 1. Lint + typecheck

```bash
cd /tmp/wt-hk-fix-1
npx tsc --noEmit
npm run lint -- --max-warnings=0 src/wearables/wearables.module.ts src/wearables/oauth/oauth-state.service.ts
```
Expect: zero errors.

### 2. The three previously-failing AppModule-graph suites now pass

```bash
npx jest test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts --runInBand 2>&1 | tail -25
```

Expect: `Test Suites: 3 passed, 3 total`. Specifically:
- The error string "Nest cannot export a provider/module that is not a part of the currently processed module (WearablesModule)" no longer appears.
- The error string "Nest can't resolve dependencies of the OauthStateService" no longer appears.

### 3. OauthStateService own unit tests still pass (don't regress)

```bash
npx jest src/wearables/oauth/ --runInBand 2>&1 | tail -10
```
Expect: all green. The `@Optional()` decorator is purely a DI hint — it does not change runtime behavior, so existing oauth-state unit tests must continue to pass unchanged.

### 4. Scheduling is still red the same way (sanity — not your job to fix here)

```bash
npx jest test/scheduling.service.spec.ts --runInBand 2>&1 | grep -E "Tests:|SESSION_IN_PAST" | head -5
```
Expect: still 14 failures, all `BadRequestException: Session start time must be at least 5 minutes in the future.` — proves PR-FIX-2 is needed and we have not regressed it.

### 5. Full backend suite delta

```bash
npx jest --listFailingTests 2>&1 | tail -5
```
Expect total failing tests: **14** (down from 17). Scheduling owns all 14.

### 6. R55 — record the SHAs

In `_builder_result_HK_FIX_1.md` paste the output of:
```bash
git log -1 --format='%H %s' origin/main
git log -1 --format='%H %s' HEAD
```

---

## Commit message

Title: `hk-fix-1: unblock AppModule graph — drop redundant WearablesModule re-export + @Optional on OauthStateService store`

Body:
```
Main CI has been red since 9c67444c (PR-HK-0 foundation, 2026-05-31) on
three AppModule-graph suites. Two stacked defects, both at AppModule
compile time:

Defect A (WearablesModule.exports re-exports bare ConnectorRegistry):
  Nest forbids re-exporting a provider that belongs to an imported module.
  ConnectionsModule already provides + exports ConnectorRegistry, and
  WearablesModule imports ConnectionsModule, so the bare re-export was
  redundant from day one. Drop it.

Defect B (OauthStateService constructor has an interface-typed optional
param without @Optional()):
  TypeScript emits `undefined` for interface types in design:paramtypes.
  Without @Optional(), Nest's instance-loader rejects the provider. The
  runtime code already handles `undefined` (this.store = store ?? resolveStore),
  but Nest's DI validator fires before the constructor runs.

Defect A masks Defect B on plain `origin/main`. Fixing only A leaves CI
still red on the OauthStateService DI failure. Both must land together.

Fixes three AppModule-graph test suites:
- test/module-graph.spec.ts
- test/openapi-spec.spec.ts
- test/roles-enforced.spec.ts

scheduling.service.spec.ts remains red (calendar rot, fixed in PR-FIX-2).
Production composition root is unaffected — these validators only run at
Test.createTestingModule() time.
```

NO `Co-Authored-By`, NO `Generated-By`.

---

## PR description (paste into `gh pr create --body-file`)

```
## What

Two minimal edits across two files to make the AppModule graph compile:

1. `src/wearables/wearables.module.ts` — drop the redundant
   `ConnectorRegistry` line from `WearablesModule.exports` (and its now-
   unused import).
2. `src/wearables/oauth/oauth-state.service.ts` — add `@Optional()` to the
   `OauthStateService` constructor parameter so Nest stops rejecting an
   interface-typed optional dep.

## Why

Main CI has been red since PR-HK-0 (`9c67444c`, 2026-05-31) on three
AppModule-graph test suites because Nest hits TWO stacked defects at
`Test.createTestingModule(AppModule)` time:

- Defect A: bare-provider re-export from `WearablesModule` (provider
  belongs to `ConnectionsModule`).
- Defect B: `OauthStateService` constructor takes an interface-typed
  optional dep without `@Optional()`. TypeScript emits `undefined` for
  interface types in `design:paramtypes`, so Nest's instance-loader
  refuses to resolve it.

Defect A *masks* Defect B on plain `origin/main` — Nest reports A first
and never gets to B. Removing A in isolation does not turn the suites
green; both fixes must land together, which is why this is one PR.

The runtime composition root is unaffected — the validators that fire on
these defects only run at `Test.createTestingModule()` time.

## Decacorn discipline note

Apple/Stripe/Notion convention: "single concern" means one *reason for
existing*, not one file. Both edits exist for exactly the same reason —
unblock the AppModule graph. Splitting into two PRs (FIX-1a + FIX-1b)
would create two individually-broken commits: 1a alone leaves CI red, 1b
alone is dead code. Bisect would actively mislead the next engineer.

## Verification

- `npx jest test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts` — 3 suites GREEN
- `npx jest src/wearables/oauth/` — no regressions
- `npx jest test/scheduling.service.spec.ts` — still red (14 tests, calendar rot, separate fix in PR-FIX-2)
- Total backend failing tests: 17 → 14
- `npm run lint`, `npx tsc --noEmit` clean
- R0 grep zero matches

## Risk

Minimal. Two narrow edits totaling 4 lines net. `@Optional()` is a
metadata-only decorator; the runtime path `this.store = store ?? ...` is
unchanged. The export removal is a literal redundancy — consumers already
get `ConnectorRegistry` via `ConnectionsModule`'s own exports.

## Out of scope

- `test/scheduling.service.spec.ts` — calendar rot, fixed in parallel PR-FIX-2
- The 14 scheduling failures themselves
- HK-5b / HK-6a — separate open PRs
```

---

## Workflow

1. Create worktree fresh from main:
   ```bash
   cd /tmp/gpb-clone
   git fetch origin main
   git worktree add -b dynasia/pr-hk-fix-1-appmodule-graph /tmp/wt-hk-fix-1 origin/main
   cd /tmp/wt-hk-fix-1
   # node_modules — if the symlink is broken, run `npm ci --prefer-offline`
   test -d node_modules || npm ci --prefer-offline
   ```

2. Apply the 2 edits to the 2 files (see "The fix" above).

3. Run all 6 verification gates above. Capture output.

4. Configure local git identity:
   ```bash
   git config user.name "Dynasia G"
   git config user.email "dynasia@trygrowthproject.com"
   ```

5. Commit + push:
   ```bash
   git add -A
   git commit -m "hk-fix-1: unblock AppModule graph — drop redundant WearablesModule re-export + @Optional on OauthStateService store" \
              -m "<full body from above>"
   git push origin dynasia/pr-hk-fix-1-appmodule-graph
   ```

6. Open PR:
   ```bash
   gh pr create --repo BradleyGleavePortfolio/growth-project-backend \
                --base main \
                --head dynasia/pr-hk-fix-1-appmodule-graph \
                --title "hk-fix-1: unblock AppModule graph — drop redundant WearablesModule re-export + @Optional on OauthStateService store" \
                --body-file /tmp/wt-hk-fix-1/_pr_body.md
   ```

7. Write `_builder_result_HK_FIX_1.md` to `/home/user/workspace/` containing:
   - PR URL
   - PR number
   - Head SHA (full 40-char)
   - All 6 verification gate outputs
   - R0 grep output (should be zero)
   - Confirmation that scheduling is still red the same way (sanity check)

8. **Do NOT merge.** Audit follows (GPT-5.5, fresh instance, R31/R32).

---

## Acceptance criteria

- [ ] Diff is ≤ 8 lines net across the 2 in-scope files (2 lines wearables.module.ts + 2 lines oauth-state.service.ts + JSDoc tightens)
- [ ] No other files touched
- [ ] All 6 verification gates pass
- [ ] R0 grep zero matches in diff
- [ ] PR opened, CI run started
- [ ] Result file written to `/home/user/workspace/_builder_result_HK_FIX_1.md`
- [ ] PR title and body match exactly what's in this brief

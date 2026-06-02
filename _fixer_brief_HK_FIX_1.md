# PR-HK-FIX-1 Builder Brief — WearablesModule ConnectorRegistry re-export

**Builder model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `growth-project-backend`
**Branch from:** `origin/main` @ `e49ae5ae2e0320ffcc73f5719dde555452c1f86b` (R55 — full 40-char SHA)
**Branch name:** `dynasia/pr-hk-fix-1-wearables-module-export`
**Worktree path:** create fresh — `/tmp/wt-hk-fix-1`
**Round:** R0 (new PR, single-file change)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`

---

## What this PR fixes

Main branch CI has been red since `9c67444c` (PR-HK-0 foundation, 2026-05-31) because `WearablesModule` re-exports the bare `ConnectorRegistry` provider in its `exports` array. Nest rejects this at `Test.createTestingModule(AppModule)` time with:

```
Nest cannot export a provider/module that is not a part of the currently processed module (WearablesModule).
Please verify whether the exported ConnectorRegistry is available in this particular context.
```

This breaks **three** AppModule-graph test suites (each with 1 failing test):
- `test/module-graph.spec.ts` — `AppModule dependency graph › compiles AppModule without throwing UndefinedModuleException`
- `test/openapi-spec.spec.ts` — `OpenAPI document › declares OpenAPI 3.1`
- `test/roles-enforced.spec.ts` — `RolesEnforced — every route has @Roles or @Public › every route handler has @Roles or @Public (or is in the legacy-guard allowlist)`

`scheduling.service.spec.ts` is also red (14 tests) but that is **calendar rot** with an independent root cause and is fixed in PR-FIX-2. Do NOT touch scheduling in this PR.

Runtime is unaffected — the prod composition root never trips this validation. CI-only.

---

## Root cause

`src/wearables/wearables.module.ts:62-71`:

```ts
@Module({
  imports: [
    ConnectionsModule,
    OauthModule,
    InsightsModule,
    SamplesModule,
    PreferencesModule,
  ],
  providers: [IngestionService, ProviderHttpClient],
  exports: [
    IngestionService,
    ProviderHttpClient,
    ConnectionsModule,
    OauthModule,
    ConnectorRegistry,        // ← THIS LINE is the bug
    InsightsModule,
    SamplesModule,
    PreferencesModule,
  ],
})
export class WearablesModule {}
```

`ConnectorRegistry` is **provided + exported** by `ConnectionsModule` already (see `src/wearables/connections/connections.module.ts` — `providers: [..., ConnectorRegistry], exports: [..., ConnectorRegistry]`). `WearablesModule` imports `ConnectionsModule`, so any downstream consumer that imports `WearablesModule` already gets `ConnectorRegistry` transitively. The bare `ConnectorRegistry` line in `WearablesModule.exports` is redundant **and** violates Nest's rule: a module may only export providers it directly registers, or modules whose exports it wants to re-vend.

---

## The fix (single deletion)

Edit `src/wearables/wearables.module.ts`:

```diff
   providers: [IngestionService, ProviderHttpClient],
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

Also remove the now-unused import:

```diff
-import { ConnectorRegistry } from './connector-registry';
```

Update the docblock if it references the re-export (the comment "re-exported here so connector PRs (PR-HK-2.*) and any wearables submodule can inject it" should be tightened to: "exposed transitively via `ConnectionsModule`'s exports — connector PRs and submodules consume it through `imports: [ConnectionsModule]` or `imports: [WearablesModule]`").

---

## Files in scope

1. `src/wearables/wearables.module.ts` — the one-line deletion + import cleanup + docblock tighten

**Do NOT touch:**
- `src/wearables/connections/connections.module.ts` — already correct
- `src/wearables/connector-registry.ts` — already correct
- Any connector module (`src/wearables/connectors/*/`) — already correct
- `test/scheduling.service.spec.ts` — that's PR-FIX-2
- ANY of the other 17 main failures
- ANY HK-5b or HK-6a code (separate PRs in flight)

---

## Bradley R0 LAW (re-read before commit)

- NO "Coming soon", NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, NO `as never`, NO `as never as X`, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed at narrow, unavoidable mock boundaries.
- This PR should have **zero** R0 grep hits — it's a single-line deletion. If you find any, you have changed too much.

R0 grep (run from repo root before commit):

```bash
git diff origin/main -- src/wearables/wearables.module.ts | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# Expect: zero matches.
```

---

## Verification checklist (you must run every one and paste output in result file)

### 1. Lint + typecheck
```bash
cd /tmp/wt-hk-fix-1
npm run lint -- --max-warnings=0 src/wearables/wearables.module.ts
npx tsc --noEmit
```
Expect: zero errors.

### 2. The three previously-failing AppModule-graph suites now pass

```bash
npx jest test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts --runInBand 2>&1 | tail -25
```

Expect: all three GREEN. **Specifically:**
- `Test Suites: 3 passed, 3 total`
- The error string "Nest cannot export a provider/module that is not a part of the currently processed module (WearablesModule)" no longer appears.

### 3. Confirm scheduling is still red the same way (sanity — not your job to fix here)

```bash
npx jest test/scheduling.service.spec.ts --runInBand 2>&1 | grep -E "Tests:|SESSION_IN_PAST" | head -5
```
Expect: still 14 failures, all `BadRequestException: Session start time must be at least 5 minutes in the future.` — proves PR-FIX-2 is needed and we have not regressed it.

### 4. Full backend suite delta (count failures before/after)

```bash
npx jest --listFailingTests 2>&1 | tail -5
# Expect total failing tests: 14 (down from 17). Scheduling owns all 14.
```

### 5. R55 — record the SHA you branched from

In `_builder_result_HK_FIX_1.md` paste the output of:
```bash
git log -1 --format='%H %s' origin/main
git log -1 --format='%H %s' HEAD
```

---

## Commit message

```
hk-fix-1(wearables): drop redundant ConnectorRegistry re-export from WearablesModule

WearablesModule re-exported the bare ConnectorRegistry provider, which Nest
rejects at AppModule compile time because the provider belongs to
ConnectionsModule, not WearablesModule itself.

ConnectionsModule already provides + exports ConnectorRegistry, and
WearablesModule imports ConnectionsModule, so downstream consumers
(connector PRs HK-2.*, wearables submodules, AppModule-graph tests) get
the registry transitively. The bare re-export was redundant from day one.

Fixes three AppModule-graph test suites that have been failing on main
since 9c67444c (PR-HK-0 foundation):
- test/module-graph.spec.ts
- test/openapi-spec.spec.ts
- test/roles-enforced.spec.ts

scheduling.service.spec.ts remains red (calendar rot, fixed in PR-FIX-2).

Production composition root is unaffected — this validation only runs at
Test.createTestingModule() time.
```

Title: `hk-fix-1(wearables): drop redundant ConnectorRegistry re-export from WearablesModule`
NO `Co-Authored-By`, NO `Generated-By`.

---

## PR description (paste into `gh pr create --body`)

```
## What

Drops the redundant `ConnectorRegistry` line from `WearablesModule.exports`.

## Why

Main CI has been red since PR-HK-0 (`9c67444c`, 2026-05-31) on three
AppModule-graph test suites because Nest forbids re-exporting a provider that
belongs to an imported module rather than the current module.

`ConnectionsModule` already provides + exports `ConnectorRegistry`, and
`WearablesModule` imports `ConnectionsModule` — so the bare re-export was
redundant from day one and consumers continue to get the registry via the
transitive `imports: [WearablesModule] → ConnectionsModule → ConnectorRegistry` chain.

## Verification

- `npx jest test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts` — all green
- `npx jest test/scheduling.service.spec.ts` — still red (14 tests, calendar rot, separate fix in PR-FIX-2)
- Total backend failing tests: 17 → 14
- `npm run lint`, `npx tsc --noEmit` clean
- R0 grep zero matches

## Risk

Minimal. Single-line diff to a Nest module's `exports` array, removing a
redundant entry that was already vended via a transitively-imported module.
Production composition root is unaffected.

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
   git worktree add -b dynasia/pr-hk-fix-1-wearables-module-export /tmp/wt-hk-fix-1 origin/main
   cd /tmp/wt-hk-fix-1
   # Verify node_modules are symlinked or run `npm ci --prefer-offline`
   ls -la node_modules 2>/dev/null | head -3
   ```

2. Edit `src/wearables/wearables.module.ts` — apply the one-line deletion + import removal + docblock tighten.

3. Run all 5 verification gates above. Capture output.

4. Configure local git identity:
   ```bash
   git config user.name "Dynasia G"
   git config user.email "dynasia@trygrowthproject.com"
   ```

5. Commit + push:
   ```bash
   git add -A
   git commit -m "hk-fix-1(wearables): drop redundant ConnectorRegistry re-export from WearablesModule" \
              -m "<full body from above>"
   git push origin dynasia/pr-hk-fix-1-wearables-module-export
   ```

6. Open PR:
   ```bash
   gh pr create --repo BradleyGleavePortfolio/growth-project-backend \
                --base main \
                --head dynasia/pr-hk-fix-1-wearables-module-export \
                --title "hk-fix-1(wearables): drop redundant ConnectorRegistry re-export from WearablesModule" \
                --body-file /tmp/wt-hk-fix-1/_pr_body.md
   ```

7. Write `_builder_result_HK_FIX_1.md` to `/home/user/workspace/` containing:
   - PR URL
   - PR number
   - Head SHA (full 40-char)
   - All 5 verification gate outputs
   - R0 grep output (should be zero)
   - Confirmation that scheduling is still red the same way (sanity check)

8. **Do NOT merge.** Audit follows (GPT-5.5, fresh instance, R31/R32).

---

## Acceptance criteria

- [ ] Diff is ≤ 5 lines net in `src/wearables/wearables.module.ts` (1 export line + 1 import line + docblock tighten)
- [ ] No other files touched
- [ ] All 5 verification gates pass
- [ ] R0 grep zero matches in diff
- [ ] PR opened, CI run started
- [ ] Result file written to `/home/user/workspace/_builder_result_HK_FIX_1.md`

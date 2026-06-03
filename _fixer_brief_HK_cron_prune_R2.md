# HK Cron Prune PR #362 — R2 Fixer Brief

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #362 (OPEN, CI clean)
**Head at R1:** `c1fb4252aaf3c4a8374767f3ff7b81dc611b75e4`
**Branch:** the PR branch (do not rebase onto main — push directly to existing branch)
**Base:** `origin/main` = `650cea4c461f8f5249c201bb8a0955e9c24b4cdf`

**Audit:** `_audit_HK_cron_prune_GPT55.md` returned **NEEDS_R2** with 2 actionable blockers + 1 sandbox observation.

## Bradley R0 LAW (must hold post-fix)

- NO "Coming soon" strings. NO `@ts-ignore`/`@ts-nocheck`/`as any`/`as unknown as`/`as never`. NO `.catch(()=>undefined)`. NO `catch(e){}` empty.
- `@ts-expect-error` with one-line justification IS allowed.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`. Body OK and encouraged.

## R0 grep (must be empty post-fix)

```bash
git fetch origin main
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

Currently fails with 4 hits — all in test files. Must be empty after R2.

## Blockers (exact)

### Blocker 1 — R0 `as unknown as` in 4 test locations

```
test/wearables/wearable-processed-event-prune.scheduler.spec.ts:52    } as unknown as WearableProcessedEventPruneService);
test/wearables/wearable-processed-event-prune.scheduler.spec.ts:75    } as unknown as WearableProcessedEventPruneService);
test/wearables/wearable-processed-event-prune.scheduler.spec.ts:96    } as unknown as WearableProcessedEventPruneService);
test/wearables/wearable-processed-event-prune.service.spec.ts:25    } as unknown as PrismaService;
```

**Fix approach (pick the cleanest of these — your judgment):**

1. **Preferred — `Partial<T>` mocks via Nest `Test.createTestingModule`** with `.overrideProvider(...)` and `.useValue({...})`. The `useValue` parameter is typed as `unknown`, no cast needed. This matches the repo's existing test idioms — grep `Test.createTestingModule` in `test/wearables/*.spec.ts` for prior art.

2. **Or — typed jest mocks via `jest.Mocked<T>`-like helper:**
   ```ts
   type ServiceMock = {
     pruneOlderThan: jest.Mock<Promise<{ deleted: number; cutoff: Date }>, [number?]>;
   };
   const service: ServiceMock = { pruneOlderThan: jest.fn().mockResolvedValue({ deleted: 0, cutoff: new Date() }) };
   new WearableProcessedEventPruneScheduler(service as unknown as WearableProcessedEventPruneService); // ← still banned
   ```
   This is still banned because of the `as unknown as`. So instead **define a narrow interface** that both the real service and the mock satisfy structurally, and have the scheduler constructor accept that interface OR use Nest DI with `Partial<T>`.

3. **Or — extract a minimal `IPruneService` interface** (e.g. `interface PruneRunner { pruneOlderThan(retentionDays?: number): Promise<{ deleted: number; cutoff: Date }> }`) co-located with the scheduler, have `WearableProcessedEventPruneService implements PruneRunner`, change the scheduler constructor parameter type to `PruneRunner`, and let mocks satisfy `PruneRunner` directly (no cast). Same for `PrismaService` in the service spec — but Prisma's surface is enormous, so prefer approach (1) for the service spec.

**For `PrismaService` mock specifically:** the test only needs `wearableProcessedEvent.deleteMany`. Use the Nest TestingModule pattern (which is already used elsewhere in this repo) so the mock is typed as `unknown` at the DI boundary:

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    WearableProcessedEventPruneService,
    {
      provide: PrismaService,
      useValue: {
        wearableProcessedEvent: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      },
    },
  ],
}).compile();
const service = moduleRef.get(WearableProcessedEventPruneService);
const prisma = moduleRef.get<PrismaService>(PrismaService);
```

Same trick for the scheduler spec.

**Hard rule:** zero `as unknown as`, zero `as any`, zero `as never` in the additions-only grep. Verify with the R0 grep above before committing.

### Blocker 2 — Test file location vs targeted Jest gate

Audit ran `npx jest --testPathPatterns='wearables/maintenance'` per the brief and matched 0 files because specs live at:
- `test/wearables/wearable-processed-event-prune.service.spec.ts`
- `test/wearables/wearable-processed-event-prune.scheduler.spec.ts`

**Two options — pick one:**

**(a) Recommended — Move specs to `src/wearables/maintenance/` co-located with code.** Check `jest.config.js` / `package.json` `jest.testRegex` first. If `testRegex` is `\.spec\.ts$` rooted at repo, specs in `src/...` will be discovered. If a different rootDir or testPathIgnorePatterns excludes `src/`, fall back to (b).

**(b) Move specs to `test/wearables/maintenance/`** so the path `wearables/maintenance` matches.

Goal: `npx jest --testPathPatterns='wearables/maintenance' --silent 2>&1 | grep -E '^Tests:'` returns `Tests: 12 passed, 12 total`.

### Sandbox observation (NOT a blocker, just verify in your env)

Auditor's full Jest `--silent` was killed by the sandbox twice. They re-ran with `--runInBand` indirectly via the targeted-pattern fallback (`--testPathPatterns='wearable-processed-event-prune'`) — 12/12 PASS. You must run **full Jest** post-fix and capture `Tests:` line:

```bash
npx jest --silent --runInBand 2>&1 | grep -E '^Tests:|^Test Suites:'
```

Target: still **4036 passed / 0 failed (20 skipped + 5 todo)** as baseline; new tests + 12 should give **4048 passed**.

## Verification commands (must all pass before commit)

```bash
cd /tmp/gpb-cron-fix   # or wherever you clone the PR branch

# 0. Check out PR #362 branch
gh pr checkout 362 --repo BradleyGleavePortfolio/growth-project-backend

# 1. R0 grep (additions-only) — MUST BE EMPTY
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# If anything prints, FAIL.

# 2. Type + lint
npx tsc --noEmit
npx eslint src/wearables/maintenance/

# 3. Targeted Jest (the one from the brief that previously matched 0)
npx jest --testPathPatterns='wearables/maintenance' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
# Expect: Test Suites: 2 passed, 2 total / Tests: 12 passed, 12 total

# 4. Full Jest (use --runInBand because of sandbox OOM)
npx jest --silent --runInBand 2>&1 | grep -E '^Tests:|^Test Suites:'
# Expect: Tests: 20 skipped, 5 todo, 4048 passed, 4073 total (or +12 vs baseline)
```

## Commit / push

```bash
GIT_AUTHOR_NAME='Dynasia G' GIT_AUTHOR_EMAIL='dynasia@trygrowthproject.com' \
GIT_COMMITTER_NAME='Dynasia G' GIT_COMMITTER_EMAIL='dynasia@trygrowthproject.com' \
git commit -m "fix(wearables): HK cron prune R2 — remove banned as-unknown-as casts, relocate specs for targeted Jest gate" \
  -m "R2 addresses GPT-5.5 audit blockers on PR #362 (R1 head c1fb4252aaf3c4a8374767f3ff7b81dc611b75e4):" \
  -m "1. Eliminate 4 \`as unknown as\` assertions in test mocks (R0 violation). Replaced with Nest \`Test.createTestingModule().overrideProvider(...)\` typed-as-unknown DI pattern (matches existing test idioms in this repo)." \
  -m "2. Relocate specs so \`--testPathPatterns='wearables/maintenance'\` matches. Targeted gate now returns 12/12 PASS." \
  -m "Verified: R0 additions-only grep empty; tsc/eslint clean; targeted Jest 12 PASS; full Jest <PASTE: 4048 passed / 0 failed>."
git push origin HEAD
```

Then comment on PR #362 with the new HEAD SHA and verification snippet.

## Out of scope (do NOT touch)

- Production service/scheduler/module/env logic — those PASSED audit untouched.
- `.env.example`, `env-validation.ts`, `WearableProcessedEvent` schema/index.
- Cron expression `'0 4 * * *'` — confirmed correct.

## Done when

- R0 grep empty.
- `tsc --noEmit` exit 0.
- `eslint src/wearables/maintenance/` exit 0.
- Targeted Jest gate (the one in the audit) returns `Tests: 12 passed, 12 total`.
- Full Jest returns `Tests: 4048 passed` (or +12 vs prior baseline) and `0 failed`.
- Push to PR branch, write final HEAD SHA + verification snippet to `/home/user/workspace/_fixer_report_HK_cron_prune_R2.md`.

## Model

Opus 4.8 (R0 rule). Sonnet 4.6 FORBIDDEN.

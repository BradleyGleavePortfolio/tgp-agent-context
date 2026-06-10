# PR #268 CI Fixer Brief — Jest Config Split (Default vs Live-DB)

**Role:** Opus 4.8 Fixer
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 · EXISTING branch `feat/rls-01-helper-searchpath-hibp` · Current head `1a15dbf7` · Base `main` (`6c4f618c`)
**Worktree:** `/home/user/workspace/tgp/backend-rls-268-fixer` (already on PR branch — REUSE)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

## Context

PR #268 R2 audit returned CLEAN. RLS hardening verified non-vacuously. But CI `build-and-test` job FAILS with:
1. `PrismaClientInitializationError: Can't reach database server at localhost:5432` in `test/rls-helper-search-path.spec.ts` and other RLS specs that need a live DB.
2. Subsequent JS heap OOM (separate, pre-existing issue — document only).

**Root cause:** The new RLS specs require a DB, but they're picked up by the **default** jest run in `build-and-test` (which has no DB service). They should only run in the new `rls-live-tests` job (which has `postgres:15` + `TEST_DATABASE_URL` and is passing).

## Fix — Option 1 (recommended): explicit jest config split

### 1. Create `jest.rls.config.js`

A focused jest config that runs ONLY the live-DB specs:
```js
// jest.rls.config.js
const base = require('./jest.config.js');
module.exports = {
  ...base,
  displayName: 'rls-live',
  testMatch: [
    '<rootDir>/test/rls/**/*.spec.ts',
    '<rootDir>/test/rls-helper-search-path.spec.ts',
  ],
  testPathIgnorePatterns: [],
};
```
(Adjust to match the actual existing jest config — read `jest.config.js` or `package.json#jest` first.)

### 2. Update default jest config to exclude RLS specs

In `jest.config.js` (or `package.json#jest`), add to `testPathIgnorePatterns`:
```js
testPathIgnorePatterns: [
  '/node_modules/',
  '/dist/',
  '<rootDir>/test/rls/',
  '<rootDir>/test/rls-helper-search-path.spec.ts',
],
```

### 3. Update CI workflow `.github/workflows/ci.yml`

- `build-and-test` job (default suite, no DB): no change needed — it now naturally excludes RLS via the config update.
- `rls-live-tests` job: change the test command to use the new config:
  ```yaml
  run: npm test -- --config jest.rls.config.js
  ```
  Confirm it still runs all the RLS specs the audit ran (31 tests passing).

### Verification path

```bash
cd /home/user/workspace/tgp/backend-rls-268-fixer
git fetch origin
git checkout feat/rls-01-helper-searchpath-hibp
git pull --ff-only origin feat/rls-01-helper-searchpath-hibp

# Apply fixes (jest.rls.config.js + jest.config.js + ci.yml)

# Verify default suite no longer picks up RLS specs:
npm test -- --listTests 2>&1 | grep -i rls
# → should print NOTHING (RLS specs excluded)

# Verify RLS config picks up exactly the RLS specs:
npm test -- --config jest.rls.config.js --listTests 2>&1 | grep -ic rls
# → should match the auditor's 31-test count
```

## Problem B (out of scope, document only)

JS heap OOM during the full backend Jest suite — exit code 134, ineffective mark-compact GC.

This is a pre-existing issue (Roman builder reported it independently in its R66 run). NOT caused by this PR. Document in the PR body:

> **Known pre-existing CI issue:** `build-and-test` may OOM on the full Jest suite (exit 134, heap allocation failure). This predates this PR and tracks separately — needs memory-budget investigation (likely `--maxWorkers=1 --workerIdleMemoryLimit=512MB` or split the default suite into shards).

## Gates (must all pass before push)

- `./node_modules/.bin/tsc --noEmit` → 0 errors
- `./node_modules/.bin/eslint .` → 0 errors
- `npm test -- --listTests` excludes RLS specs ✅
- `npm test -- --config jest.rls.config.js --listTests` includes ALL RLS specs (≥ 31) ✅
- `.github/workflows/ci.yml` is valid YAML

## Commit policy

Title-only. Author `Dynasia G <dynasia@trygrowthproject.com>`. Recommended:
- `fix(ci): split jest config so RLS specs only run in rls-live-tests job`

## Deliverables

1. PR #268 updated in place
2. `/home/user/workspace/PR268_CI_FIXER_RESULT.md` — what was fixed, before/after of jest configs + ci.yml diff, listTests output proving the split works
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/268/comments` summarizing the fix + Problem B note. USE `gh api`, NOT `gh pr comment`.

## Constraints

- `gh` with `api_credentials=["github"]`.
- Title-only commits.
- Force-push only if needed with `--force-with-lease=feat/rls-01-helper-searchpath-hibp:<remote-sha>`.
- Do NOT modify any application code or RLS migration files — pure CI/config change.
- Do NOT bump deps.

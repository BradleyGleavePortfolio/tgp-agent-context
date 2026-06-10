# PR #268 — CI Fixer RESUME BRIEF (jest config split)

## ⚠️ RESUME WORK — DO NOT RESTART

The previous CI fixer died from an infra failure. Their in-progress work is preserved:

- **Snapshot branch (origin):** `wip/pr268-ci-fixer-jest-split-20260610-021743` @ `6f6d5fef`
- **Their progress:**
  - `.github/workflows/ci.yml` (+9/-6)
  - `jest.config.js` (+10/-0)
  - `jest.rls.config.js` (+24/-0) — new file

**Your job:** Inspect the snapshot, validate the jest config split is correct, fix anything broken, push to the real PR branch `feat/rls-01-helper-searchpath-hibp`, and re-trigger CI.

## PR Target

- **Repo:** `BradleyGleavePortfolio/growth-project-backend`
- **PR:** #268 — RLS helper lockdown + HIBP
- **Real branch:** `feat/rls-01-helper-searchpath-hibp` (current head `1a15dbf7`)
- **Base main:** `6c4f618c`

## Pickup Procedure

```bash
git fetch origin
git checkout feat/rls-01-helper-searchpath-hibp   # currently 1a15dbf7
git diff feat/rls-01-helper-searchpath-hibp..origin/wip/pr268-ci-fixer-jest-split-20260610-021743 -- jest.config.js jest.rls.config.js .github/workflows/ci.yml

# If the split looks correct, apply it:
git checkout origin/wip/pr268-ci-fixer-jest-split-20260610-021743 -- jest.config.js jest.rls.config.js .github/workflows/ci.yml
```

## Problem to Fix (from `STEP_02b_PR268_CI_blocker.md` + `PR268_CI_FIXER_BRIEF.md`)

**Two CI problems detected after PR #268 R2 audit came back CLEAN:**

1. **Problem A (root cause):** `build-and-test` (the default job, no DB service container) runs `jest` over the whole repo, which now matches the new RLS spec files. Those require a real Postgres at `TEST_DATABASE_URL`; without it they error. Symptom: `build-and-test` red.

2. **Problem B (downstream consequence):** Even with errors, the broad jest pattern matches dozens of heavy suites and the test runner blows past Node's default heap → OOM. Pre-existing footgun amplified by the RLS-spec inclusion.

**Fix design (already in the wip snapshot — validate it matches):**

- **Split jest into two configs:**
  - `jest.config.js` — explicitly **excludes** `test/rls/**` via `testPathIgnorePatterns` so default `build-and-test` never touches RLS specs.
  - `jest.rls.config.js` — **only** picks up `test/rls/**`, runs `--runInBand`, used by the existing `rls-live-tests` job.

- **CI workflow update:** `.github/workflows/ci.yml`
  - `build-and-test` job: continue running `pnpm jest` (now scoped by `jest.config.js`).
  - `rls-live-tests` job (already exists from PR #268 main commits): switch to `pnpm jest --config=jest.rls.config.js --runInBand`.

## Validation Checklist

Run these locally **after** applying the snapshot:

```bash
# 1. jest --listTests with default config must NOT include test/rls/**
pnpm jest --listTests | grep -c 'test/rls' 
# Expected output: 0

# 2. jest --listTests with rls config must ONLY include test/rls/**
pnpm jest --config=jest.rls.config.js --listTests | grep -vc 'test/rls'
# Expected: 0

# 3. Sanity run a fast non-RLS lane to confirm jest still discovers tests
pnpm jest --listTests | head -20  # should show plenty of non-RLS tests

# 4. yaml lint the workflow
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
```

## Forbidden Edits (anti-rebase R7C)

- Any file in `src/**`
- Any file in `prisma/**`
- Any file in `test/**` (we only re-scope what jest picks up; don't modify test code)
- `package.json` / `pnpm-lock.yaml`

Only edit: `jest.config.js`, `jest.rls.config.js` (new), `.github/workflows/ci.yml`.

## Push & Verify CI

```bash
git -c user.email=dynasia@trygrowthproject.com -c user.name="Dynasia G" commit -m "ci: split jest config so RLS specs only run in rls-live-tests job"
git push origin feat/rls-01-helper-searchpath-hibp

# Wait ~90s then check:
gh pr checks 268 --repo BradleyGleavePortfolio/growth-project-backend
```

**Both `build-and-test` AND `rls-live-tests` must be GREEN.** If either is red, diagnose and fix before declaring done.

```bash
gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/268/comments \
  -X POST -f body="CI fixer landed — jest config split. \`build-and-test\` now skips \`test/rls/**\`; \`rls-live-tests\` job runs them against the postgres:15 service container. Resumed from wip \`6f6d5fef\` after infra-failure interruption. R2 audit was already CLEAN; PR is ready for merge gate."
```

## Result file

Write `/home/user/workspace/PR268_CI_FIXER_RESULT.md` with:
- final HEAD SHA on `feat/rls-01-helper-searchpath-hibp`
- output of `gh pr checks 268`
- one-line PR comment URL
- file-surface overlap check (must be PASS — only ci.yml + 2 jest configs)

## Commit author / discipline

Same as before: `Dynasia G <dynasia@trygrowthproject.com>`, title-only.

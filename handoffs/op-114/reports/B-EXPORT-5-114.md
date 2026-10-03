# B-EXPORT-5 (agent 114) — backend #608 CodeQL round 8, mobile #327 main merge

## Backend #608 — head 1cbecbdc5417dfac463df28ba331d07c579d7cfb
- Commit 1cbecbdc (on 9650ce14; branch already contains main 53b6d472, still current):
  - js/call-to-non-callable x5 (test/data-export-storage.spec.ts:239,240,682,715,733; alerts 115-119): the root cause was
    `import type { Request, Response } from 'express'` shadowing the global fetch Response used by `new Response(...)`. Fix: the
    imports are aliased to ExpressRequest/ExpressResponse.
  - js/incomplete-multi-character-sanitization (high, :1635; alert 114): the regex tag strip is replaced by a stricter assertion
    (the page starts with the doctype, and no `!` appears anywhere after it).
  - js/useless-assignment-to-local (src/data-export/data-export.service.ts:1024; alert 120): the dead assignment is removed.
  - Code scanning on refs/pull/608/merge: 0 open alerts, 114-120 `fixed`. Nothing was dismissed and no suppressions were added.
- Tests: `heavy.sh npx jest --runInBand test/data-export-storage.spec.ts test/data-export.service.spec.ts
  test/data-export-archive-cleanup.spec.ts` -> 3 suites, 98/98 passed (ops/bexport5-114/jest-608-r8.log).
  Prettier and eslint are clean.
- CI: 10 of 11 required checks pass, including CodeQL JS/TS and the alerts check.
- **npm audit FAILS** (see the decision below).
- PR body updated:
  - Why line updated;
  - acceptance pre-deploy note added;
  - new "Fix round 8" section with its table;
  - C-636-6 probe as runnable commands: Step 1 is read-only psql (`BEGIN TRANSACTION READ ONLY`) with go/no-go rules;
    Step 2 is a BEGIN..ROLLBACK dry run of the migration DO block extracted with sed; Step 3 is verify.sql.
    The SQL was parse-checked with pglast.
  - Before/after body: ops/bexport5-114/pr608_body_{before,after}.md.
- Comment (FIX ROUND 8, which also summarizes round 7):
  https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964227676
- C-627-2: pending the #627 merge (#627 OPEN at 18:50 PDT). The erasure-manifest-coverage patterns match all 4 columns, so a
  #608 head that contains #627 fails CI until they are classified. Waiting for the operator's go.

## Mobile #327 — head 06c0f1754d7e0ba19176e8b24f2e832e8be3483c
- Merge commit: 395c3312 + origin/main aae30ac0.
- One conflict, src/services/sentry.ts: main's file is taken whole and #327's sentryScrub pass is composed after main's
  sentryPrivacy on beforeBreadcrumb, beforeSend and beforeSendTransaction.
- New test src/services/__tests__/sentry.composition.test.ts: 3 tests, 3/3 fail against main's sentry.ts alone.
- No other #327 file changed versus 395c3312.
- Tests: 6 suites, 48/48 passed (ops/bexport5-114/jest-327-merge.log; before-run: jest-327-composition-before.log).
- CI: all 3 required checks pass. CLEAN.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964232072
  It states that the #608 client contract is unchanged in rounds 7 and 8 (only additive RecentAuthGuard codes).

## OPERATOR DECISION NEEDED (repo-wide, not caused by #608)
- `npm audit (high+critical, whole graph)` fails on #608 @ 1cbecbdc and on agent/clinic/b-recur-subscriptions (01:27 UTC). It
  passed on other PRs at 00:37 UTC, and main will fail it on its next run.
- Cause: GHSA-vfj7-8cjw-p6xm, `braces` <= 3.0.3, high, NO patched version. Path: danger (dev) -> micromatch -> braces.
  `npm audit fix --force` proposes danger@7.0.19 (breaking).
- Fixing it needs a lockfile change, which builders must not make.
- Recommended: one operator-owned dependency PR on main (an `overrides` entry pointing micromatch/braces at a non-vulnerable
  path, or a danger version change, or a documented audit exception if the CI gate allows one), then every open PR merges main.

## HANDOFF
- #608 @ 1cbecbdc: needs a dual delta audit bdadfcb4..1cbecbdc, the npm audit decision, and C-627-2 once #627 merges.
- #327 @ 06c0f175: needs a dual delta audit 395c3312..06c0f175. Green and CLEAN.
- Worktrees wt/B-EXPORT-5-608 and wt/B-EXPORT-5-327 were removed. Notes and logs are in ops/bexport5-114/.

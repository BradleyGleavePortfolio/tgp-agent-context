# PR496 Lens B Round 1 Live Audit

- Auditor: Lens B round 1
- Repository: BradleyGleavePortfolio/growth-project-backend
- Branch: pr-496 / feat/importer-auth-extension
- Expected head SHA: 5ab0d7f25f37a5c795482becd4d5fb8a95ca629b
- Verified HEAD: 5ab0d7f25f37a5c795482becd4d5fb8a95ca629b
- Verified `git show -s --format=%H HEAD`: 5ab0d7f25f37a5c795482becd4d5fb8a95ca629b
- Verified `git rev-parse pr-496`: 5ab0d7f25f37a5c795482becd4d5fb8a95ca629b
- Base: origin/main 2ad6ae91c9fa1293d639824b5b4e969fae35f42e

## R11 isolation log
- Working checkout: `/tmp/pr496_lensb_r1`.
- Live audit file: `/home/user/workspace/pr496_lensb_r1_LIVE.md`.
- Did not read files with `LENS-A` in the name.
- Did not open `/home/user/workspace/pr496_lensa_*`.
- Did not use recursive grep in `/home/user/workspace/audit_workspace/`.
- Grep activity was confined to `/tmp/pr496_lensb_r1` or explicit workspace output files created by this audit.

## Metrics
- Prod LOC by mandated formula: 87.
- Test LOC by mandated formula: 343.
- Test:src ratio: 3.94.
- New test cases: 17.
- Banned-cast additions: 0.
- R3 commits checked: 5/5 author and committer are bradley@bradleytgpcoaching.com; no forbidden AI tokens in commit subjects or added diff lines.

## Findings

### P1 — Required Jest command does not run any auth tests
- Command run: `npx jest src/auth --runInBand --testTimeout=30000`.
- Result: exit 1, "No tests found".
- Cause observed in `jest.config.js`: roots include `test/` plus selected src subtrees, but not `src/auth`; the new extension-auth suite lives at `test/auth/extension-auth.spec.ts`.
- Direct run of the new test file passed after `npx prisma generate`: 17/17 tests passed.
- Why this matters: the required PR audit command is not green, so the builder's Jest claim is not reproducible under the requested gate.

### P2 — Ref DTO validation coverage misses the too-long ref case and no HTTP 400 assertion exists
- `RegisterDto` and `SignupWithCodeDto` have `@MaxLength(64)` and regex validation.
- New tests cover valid optional refs, uppercase/spaces/symbols, and malformed signup-with-code refs.
- No new test supplies a 65-character `ref`; no test asserts Nest's validation pipe maps an invalid DTO to HTTP 400 for the new routes/fields.
- Why this matters: the brief explicitly required ref constraint tests for uppercase, too-long, and non-alphanumeric inputs, plus invalid DTO -> 400 coverage.

## Non-finding checks
- Extension controller/service methods live in existing `src/auth/auth.controller.ts` and `src/auth/auth.service.ts`.
- DTOs live in `src/auth/auth.dto.ts` and follow class-validator + Swagger property style.
- Extension endpoints have `@Public`, route decorators, `@HttpCode(200)`, and throttles present.
- Extension login does not call `resetLoginCounters`; test pins that behavior.
- Migration folder `20261221010000_add_signup_ref_to_user` is after `20261221000000_enable_pg_stat_statements`.
- Migration is additive nullable: `ALTER TABLE "User" ADD COLUMN "signup_ref" TEXT;`; down path drops the column if present.
- `prisma/migrations/migration_lock.toml` unchanged.
- Fixture updates are confined to test paths (`src/**/__tests__`, `test/**`) and add `signup_ref: null`; there are formatting-only changes in the same test files but no prod behavior changes.
- `NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit` exits 0 after `npx prisma generate`.

## Execution notes
- Initial `npm ci` timed out at the sandbox limit after creating `node_modules`; `postinstall` (`prisma generate`) had not completed, leaving an incomplete Prisma client.
- Manual `npx prisma generate` completed successfully; after that, the direct new test file and TypeScript compile passed.

## Final summary
- Severity counts: P0=0, P1=1, P2=1, P3=0.
- Verdict: findings.
VERDICT: FINDINGS

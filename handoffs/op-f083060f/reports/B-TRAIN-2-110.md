# B-TRAIN-2 report (agent 110 lane, builder Claude Opus 5.5)

Main at start: `4bcfb444` (after #622, #599, #595, #630, #631 and #623 merged). Worktrees: `wt/btrain2-604`, `wt/btrain2-607`, `wt/btrain2-609`. Logs and scripts: `ops/reports/btrain2/`.

## #604 (C14 throttler isolation, T4), pushed ~22:08 PDT

- Branch `clinic/c14-throttler-isolation`.
- Old audited head: `21ffc02c` (Sol APPROVE and Opus APPROVE).
- **New head: `87d09b1d45cb62e9fe44dbdca24f8f8a19c84e3d`**, pushed as a fast-forward. No rebase or force push.
- `87d09b1d` is a single merge commit: parents `21ffc02c` and main `4bcfb444`, tree `14ef4e95`. There is no follow-up commit.

### Proof that the merge is integration-only

Each check can be reproduced:

1. **Tree.** `git merge-tree --write-tree --merge-base=e1dd4c39 4bcfb444 21ffc02c` returns `14ef4e95` with no conflicts. That is the merge commit's tree. `e1dd4c39` is #604's audited base (#595's head before the merge train).
2. **Patch.** `git diff 4bcfb444 87d09b1d | git patch-id --stable` = `b744884a…` = `git diff e1dd4c39 21ffc02c | git patch-id --stable`. The patch-id also matches file by file for all 18 files.
3. **File set.** `git diff origin/main...HEAD` lists the same 18 files as the audited range:
   - `.env.example`, `prod-switches.yml`, `src/auth/README.md`, `src/auth/auth.controller.ts`, `src/auth/auth.service.ts`, `src/common/env-validation.ts`, `src/invite-codes/invite-codes.controller.ts`
   - `src/throttler/{README.md, login-throttle-reset.service.ts, throttler.config.ts, throttler.module.ts, user-throttler.guard.ts}`
   - `test/{auth-signup-role-choice, c13-fix-round, login-account-lock, rate-limit, redis-throttler, throttler-isolation}.spec.ts`
4. **Blobs.** 16 of the 18 files are byte-identical to `21ffc02c`. The other two, `.env.example` and `prod-switches.yml`, are 3-way merges with main's additions.

### Conflict table

The default merge (base `bffae5f3`) produced 10 conflicting files with 21 hunks. The rule applied: main wins for #595, #597 and #599 lineage, and #604's own hunks are kept. Blobs are listed as `e1dd4c39` / `21ffc02c` / main → result.

| File | Hunks | Blobs | Resolution |
|---|---|---|---|
| prod-switches.yml | 1 | 0b378df2 / 05d71f57 / 68b12f1f → 5d5dca88 | 3-way merge on base e1dd4c39. Keeps #604's AUTH_LOGIN_PER_HOUR description plus main's single #599 row and the #623 and #622 rows. |
| src/auth/README.md | 1 | cdb1e4cd / 84ffc03b / cdb1e4cd → 84ffc03b | #604 (main == #604's base) |
| src/auth/auth.controller.ts | 2 | c9bcba86 / 6534db9e / c9bcba86 → 6534db9e | #604. Both hunks are C14 removing the OAuth-success per-IP reset. |
| src/auth/auth.service.ts | 1 | 75841427 / f5d2d8c8 / 75841427 → f5d2d8c8 | #604 (`guardPasswordLogin`) |
| src/throttler/login-throttle-reset.service.ts | 3 | 501ee85f / a769bfdd / 501ee85f → a769bfdd | #604 |
| src/throttler/throttler.config.ts | 2 | 918ae0b4 / 276bb10b / 918ae0b4 → 276bb10b | #604 |
| test/auth-signup-role-choice.spec.ts (add/add) | 1 | 08099569 / 61092911 / 08099569 → 61092911 | #604 |
| test/c13-fix-round.spec.ts (add/add) | 4 | 3143ec32 / a785f203 / 3143ec32 → a785f203 | #604 |
| src/invite-codes/invite-codes.service.ts | 4 | 289d5523 / 289d5523 / 7f979d97 → 7f979d97 | main (#604 never changed this file) |
| test/invite-attach-reliability.spec.ts (add/add) | 2 | a8986689 / a8986689 / a97f9376 → a97f9376 | main (#604 never changed this file) |
| .env.example | 0 (git auto-merge) | → fc3355df | Git's automatic merge was wrong: it duplicated the C13 and C03 blocks. Fixed by keeping main's single copy. |
| src/common/env-validation.ts | 0 (git auto-merge) | → b1c55104 | Git's automatic merge was wrong: it added 3 duplicate ENV_RULES entries. Fixed by keeping main's single copy. |
| prisma/migrations/20270125000000_invite_grant_bindings/ | n/a | n/a | Deleted. Main has 20270205000000; migration.sql blob `bc0355c2` is identical. |

### Integration checks against main's new code

- **#623 wearables:** the skip map is derived from THROTTLER_NAMES, so the new names are skipped automatically. The spec passes on the merged tree.
- **Guard order:** JwtAuthGuard still runs before UserThrottlerGuard.
- **New routes:** routes added by #622, #630, #631 and #606 declare no named throttler.
- **Live Redis:** the CI Redis service and THROTTLER_LIVE_REDIS_URL are already on main.

### Tests at 87d09b1d

- tsc (`NODE_OPTIONS=--max-old-space-size=3584`, via heavy.sh): exit 0. Log: `btrain2/604-tsc.log`.
- jest (`heavy.sh env CI=false npx jest --runInBand --forceExit --runTestsByPath <31 suites>`): **31/31 suites, 726 passed, 12 skipped (live Redis, which CI runs), 0 failed.** The suites cover throttler, auth, invite, env, prod-readiness and wearables throttle isolation. Log: `btrain2/604-jest.log`.
- check-r75 range against main: OK, no positive token change.
- eslint on the 14 changed TS files (via heavy.sh): exit 0. Log: `btrain2/604-lint.log`.
  - Prettier is not a backend dependency. The repo's `lint` script is `eslint "src/**/*.ts"`, and `npx prettier` fetched an unpinned registry copy, so its warnings do not apply to this repo.
  - The 14 TS files are byte-identical to `21ffc02c`.

### PR body

- **Not updated.** The safety classifier blocked `gh pr edit 604 --body-file` because the task brief does not authorise PR-body writes. I did not retry.
- The finished body (tier line plus Fix round 5 with the file list, conflict table and tests) is at `ops/reports/btrain2/604-body.new.md`. The operator can apply it: `gh pr edit 604 --body-file /home/user/workspace/ops/reports/btrain2/604-body.new.md`.

### CI at 87d09b1d

Checked 22:15 PDT. All 9 required checks pass:

- build-and-test (5m35s)
- rls-floor-guard
- rls-live-tests
- mwb-3-live-tests
- npm audit
- CodeQL JS/TS
- Banned cast tokens
- build-sbom
- danger

Also: **Schema parity (migrations match schema.prisma): pass.** test-deploy-readiness: pass. deploy-readiness-gate: skipped (this is a PR). mergeStateStatus: CLEAN.

The migration dry-run did not trigger, because there is no migration change against main.

### Re-attestation needed

Both T4 lenses must re-attest `87d09b1d` over the range `21ffc02c..87d09b1d`; this is a merge only. Schema parity has passed at this head (OR-110-3).

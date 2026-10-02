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

## #607 (C05/C07 consultation intake, onboarding complete, coach consultation view; T4), pushed ~22:31 PDT

### What it is

- **What it adds:**
  - versioned consultation intake (consent first, D2 `consult-consent-v2`);
  - idempotent onboarding completion fenced on current tenancy (A607-3), which writes the program assignment, macros, spaces and the screening alert;
  - a three-program rule table and a seed loader;
  - a coach consultation view;
  - a migration with RLS on health-screening answers.
- **Launch scope:** yes. This is the clinic onboarding contract C05/C07, and the mobile onboarding depends on it.
- **Verdicts at `245da2e7`:** Sol APPROVE (after REQUEST CHANGES for B-607-4, the CI gap, now closed) and Opus APPROVE, with optional findings C607-2 (merge order with the attach code), C607-3 and C607-4.

### New head

- Branch `agent/clinic/c05-c07-onboarding/a02c2791`: `245da2e7` → **`d6ac47e89333007a5b42b45cc08cc33a53abf7ca`**, pushed as a fast-forward.
- Commits:
  - `fd526188`: merge of main `4bcfb444`, pure resolution.
  - `15021bb5`: test-only A607-1 updates.
  - `d6ac47e8`: migration rename to `20270212000000_clinic_onboarding_intake`.

### Proof that the merge is integration-only

1. **Tree.** #606 landed with a tree byte-identical to #607's base `7e00de0c`. `git merge-tree --merge-base=7e00de0c 4bcfb444 245da2e7` conflicts only in `src/invite-codes/invite-codes.service.ts`, and every other file equals the merge commit.
2. **File set and patch-ids.** `git diff 4bcfb444 fd526188` covers the same 36 files as the audited range. Patch-ids match file by file, with two exceptions:
   - `schema.prisma`: identical added lines at shifted offsets.
   - `invite-codes.service.ts`: its delta against main is formatting-only. Main and HEAD token streams are equal once whitespace, trailing commas and type-member separators are removed. #607's 11 reflow hunks are kept.

### Conflict table

Default merge, base bffae5f3:

| File | Resolution |
|---|---|
| README.md, src/macros/macros.service.ts, test/macros-current-self.spec.ts (add/add) | #607 (main == #607's base) |
| .github/workflows/ci.yml | Clean 3-way merge on 7e00de0c |
| invite-codes.service.ts, 3 overlapping hunks | Main (#599) wins on all 3 (details below) |

The 3 overlapping hunks in invite-codes.service.ts:

- the structured coach_not_accepting_clients code;
- consumeInviteSeat;
- the conditional attach writer. This drops #607's A607-1 retire-on-transfer branch, which is unreachable on main: main returns 409 `already_attached_to_different_coach` before any write and only writes `where coach_id IS NULL`. This closes Opus C607-2 by proving that the transfer is refused.

### Follow-up commits

- **`15021bb5` (test-only):**
  - The A607-1 transfer test now asserts the 409 refusal: no transaction, no user write, no assignment write.
  - The A607-1 audit-reproduction double gains `teamSubCoachAssignment.findFirst`, because main's #597 SubCoachScopeService reads it. Without it the suite failed on the merged tree with `findFirst` of undefined.
- **`d6ac47e8` (rename):**
  - The old 20270202000000 prefix sorted before main's 20270203, 20270204 and 20270205 migrations.
  - `migration.sql` is byte-identical (blob 318ef7e4); `down.sql` changes only its header.
  - The ci.yml rls-live step path, the bootstrap SQL comment and the docs are updated to match.
  - This is a T4 CI-gate file change of 1 line.

### Tests

- prisma generate: OK.
- tsc (3.5 GB): exit 0. It ran at the pre-amend tree; the only later change is the test file, and the #609 tsc below covers it.
- jest:
  - Batch 1: 18 suites passed. `onboarding-audit-regressions` failed (the fixture gap fixed in `15021bb5`). Jest then hit an OOM abort at the 2.5 GB default heap.
  - Batch 2 (3.5 GB heap): **12/12 suites, 100/100 tests**. This covers the fixed suite and the 11 suites batch 1 never reached.
  - Total: 30 distinct suites pass (onboarding*, seed-clinic-programs, macros, profile-put*, invite*, c03, grant, migration specs, schema-parity-gate, dunning-v2-lockout route table/guard, roles*, workout-builder*, openapi, coach-onboarding).
  - Logs: `btrain2/607-jest.log`, `btrain2/607-jest2.log`.
- eslint on 27 changed TS files: exit 0.
- check-r75 range: OK.

### PR body

Not editable from this lane: the classifier blocked it for #604. The ready text is at `ops/reports/btrain2/607-body.forward-merge.md`; append it as "Fix round 3" and update the migration name in the tier and Data model lines.

### Open finding INT-607-1 (B, tenancy/PII; not fixed here because it is outside integration-only scope)

- **The defect:** both `OnboardingService.canCoachRead` rule (b) and SQL `app.can_read_client_consultation` (b) trust a bare `coach_id` on the client's coach as head membership.
- **Why it now conflicts with main:** main's #597 (C13 Opus A1) requires an explicit active TeamSubCoachAssignment or an open SubCoachAssignment, because of phantom sub-coaches created by older guest checkouts.
- **Impact:** a phantom head can read the screening answers of that coach's clients.
- **Recommendation:** a bounded fix round on #607, API and SQL together, with unit and live-RLS phantom-chain tests, before merge.

### CI at d6ac47e8

Pending; see the update below.

## #609 (C05 items 6-7: coach welcome message at onboarding complete + 13 min, and workout reminders), pushed ~22:33 PDT

### What it is

- **What it adds:**
  - an owner-set per-coach welcome message, sent once through `MessagingService.sendAsCoach` 13 minutes after onboarding completes;
  - workout reminders 60 minutes before the client's preferred training time, routed through notification prefs;
  - a durable `ClientEngagementJob` table and `CoachWelcomeSettings`, both with RLS;
  - an owner-only `GET`/`PUT /api/admin/coaches/:coachId/welcome-message` route and a CLI.
- **Stacking:** stacked on #607. Its PR base is main.
- **Launch scope:** yes. The owner directed it on 09-30 18:11, and LIVE_STATE queues the "#609/#312 audit".
- **Verdicts:** none at `1f8b22b9`.
- **Tier:** the PR header says T3. **Recommendation: re-grade to T4** (RLS tables holding coach-authored text, messages sent in the coach's name, an owner admin route). That means two audits.

### New head

- Branch `agent/clinic/engagement-be/3f9c21ab`: `1f8b22b9` → **`5fd61a1bc962ee754c11feccb155dc52176ee160`**, pushed as a fast-forward.
- Commits:
  - `cd1908f5`: merge of #607 `d6ac47e8`.
  - `5fd61a1b`: migration rename `20270203000000_clinic_engagement` → `20270213000000_clinic_engagement`. The old prefix duplicated #622's `20270203000000`.

### Integration-only proof

- **Conflicts:** none. The merge base is `245da2e7`, #609's own base, and the tree equals `git merge-tree --write-tree 1f8b22b9 d6ac47e8`.
- **File set:** `git diff d6ac47e8 cd1908f5` covers the same 24 files as `git diff 245da2e7 1f8b22b9`.
- **Patch-ids:** they match file by file, except `schema.prisma`, where the added lines are identical at shifted offsets.
- **Rename:** `migration.sql` is byte-identical (blob `64933536`). `down.sql` changes only its header; the docs are updated to match.

### Tests

All through heavy.sh:

- **prisma generate:** OK.
- **tsc (3.5 GB):** exit 0.
- **jest:** **19/19 suites, 551 passed, 16 skipped (live), 0 failed.** Covered: engagement ×4, roles-enforced, the dunning lockout route table, notification prefs/controller/emitters, prefs routing, nudge, push defaults, messaging, deploy-readiness, env-validation, env-discovery, onboarding.service, onboarding-audit-regressions, schema-parity-gate.
- **eslint (18 TS files + #607's spec):** exit 0.
- **check-r75 range:** OK.

### PR body

The ready text is at `ops/reports/btrain2/609-body.forward-merge.md`. Also change the Change-section migration line to `20270213000000`.

### Audit notes

These are not fixed here.

- `COACH_WELCOME_SCHEDULER_ENABLED`, `WORKOUT_REMINDERS_ENABLED` and `WORKOUT_REMINDER_CRON` are read in `src/engagement`. None of them is registered in env-validation, prod-switches.yml or .env.example (env-truth).
- #609 inherits INT-607-1.

### CI at 5fd61a1b

Pending; see the update below.

## Migration prefixes taken by this lane (please record)

- `20270212000000`: #607, clinic_onboarding_intake
- `20270213000000`: #609, clinic_engagement

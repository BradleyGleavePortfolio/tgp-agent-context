# B-TRAIN report (builder Claude Opus 5.5, operator agent 109)

## #599 — merge train onto main 10dff85c (2026-10-01 ~15:50 PDT)

- Branch `clinic/c03-reliable-attach`. Old approved head `7b496aca`. **New head `8ae0fea5341b1e832356e725fafb46ee1025ea71`** (pushed as a fast-forward, no force push).
- `894263f5` is the merge commit (`git merge origin/main`), a pure resolution. Main's copies of the conflicted auth, invite-codes, env-validation and spec files are byte-identical to #597 `e3167fe7`, the base the #599 delta was audited on. `git diff 10dff85c 894263f5` has the same patch-id as `git diff e3167fe7 7b496aca`, and its tree `1f7c5d1f` equals `git merge-tree --merge-base=e3167fe7 10dff85c 7b496aca`.
- `8ae0fea5` is a follow-up for the "no duplicated helpers" rule. `INVITE_ATTACH_ERROR.COACH_CANNOT_REDEEM` now references `INVITE_ATTACH_COACH_CANNOT_REDEEM`. The attach path throws `coachCannotRedeemBody()`, so its body matches select-role and uses main's actionable copy. Main's warn log for a non-student redeem is restored. A test pins all of this. The attach writer, race handling, seat logic and status codes are unchanged.
- Hunks (12 in 5 files): #599 kept on all of them. Each is #597 code on main against #599's audited rework of that same code. The per-hunk table is in the PR comment https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599#issuecomment-5942229809 and in `ops/reports/btrain-599.comment.md`.
- One race class (`AttachRaceSameCoach`; `SameCoachAttachRace` has 0 references). One attach writer (`attachUserToCoachByCode`, reached through `tryAttachInviteCode` and selectRole).
- Tests at 8ae0fea5:
  - tsc: exit 0.
  - eslint on the touched files: exit 0.
  - check-r75 range: net 0.
  - jest, 26 suites (auth, invite, throttler, env, ai-consent wiring): 550 passed, 3 skipped, 0 failed. Log: `ops/reports/btrain-599.jest.log`.
  - jest, rate-limit and redis-throttler: 51/51. Log: `ops/reports/btrain-599.jest2.log`.
  - Schema-parity gate: not applicable locally (no prisma diff against main); CI ran it and passed.
- PR body: not updated in this round. The draft (a Fix round 5 table plus a tier-header line) is at `ops/reports/btrain-599.body.new.md`.
- CI at `8ae0fea5` (22:56 UTC): all 9 required checks SUCCESS (build-and-test 6m13s, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger). Schema parity also SUCCESS. deploy-readiness-gate was skipped (PR). GitHub reports mergeStateStatus CLEAN, but this is T4: both auditors must re-attest `8ae0fea5` (range `7b496aca..8ae0fea5`) before the operator merges.
- Worktree `wt/btrain-599` removed after CI.

## #599 — merged by the operator (dual APPROVE at 8ae0fea5) as main 53b625d2.

## #595 — merge train onto main 53b625d2 (2026-10-01 ~16:45 PDT)

- Branch `clinic/c01-comp-access`. Old approved head `e1dd4c39`. **New head `f2eecae54020854297210cd490971bf619385e12`** (pushed as a fast-forward, no force push).
- `db7785dd` is the merge commit (`git merge origin/main`), a pure resolution. `git diff 53b625d2 db7785dd` has the same patch-id (`1b0df9a0…`) as `git diff 7b496aca e1dd4c39`, and its tree `bf3b1300` equals `git merge-tree --merge-base=7b496aca 53b625d2 e1dd4c39`. `src/invite-grant/**`, checkout, packages, consent and refund are byte-identical to `e1dd4c39`, including the revoke and activateRow predicates.
- Hunks: 24 in 3 files.
  - #595 kept on the 18 grant-threading hunks: auth.service.ts ×12, invite-codes.service.ts ×6.
  - Main kept on the 6 hunks from the #599 fold `8ae0fea5`: invite-codes ×4 (single `coach_cannot_redeem` constant and body, non-student warn log) and invite-attach-reliability.spec ×2 (add/add).
  - Table: PR comment https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595#issuecomment-5942814054 (also in `ops/reports/btrain-595.comment.md`).
- `f2eecae5`: migration renamed from `20270125000000_invite_grant_bindings` to `20270205000000_invite_grant_bindings`. The old name shared #625's prefix and sorted before #625 and #622; `20270204000000` is taken by open #630. `migration.sql` is byte-identical; `down.sql` changes only its header comment. New `test/invite-grant-bindings-migration.spec.ts` (4 tests). **#604 still has the old directory name** and will pick up the rename when it is merged forward.
- Tests:
  - 44 targeted suites (invite, grant, entitlement, packages, checkout, consent, auth attach, migrations, route tables): 732/732 passed (at `ab46ad20`, before a format-only amend). The new spec was re-run at `f2eecae5`: 4/4.
  - tsc: exit 0. It needed `NODE_OPTIONS=--max-old-space-size=3584`; the default 2.5 GB cap ran out of memory on the merged Prisma client.
  - eslint on the touched files: exit 0.
  - check-r75 range: net 0.
  - prisma validate and generate: OK.
- CI at `f2eecae5`: all 9 required checks SUCCESS. Schema parity, forward migrations and reversibility also SUCCESS. mergeStateStatus CLEAN. Both T4 auditors need to re-attest `f2eecae5` (range `e1dd4c39..f2eecae5`).
- PR body updated: tier-header line, the Migration section's directory name, and a Fix round 5 table.
- Worktree `wt/btrain-595` removed.
- Not started (wrap-up order): #604 (throttler isolation, approved head 21ffc02c). It must be merged forward onto the new main and pick up the 20270205000000 rename.

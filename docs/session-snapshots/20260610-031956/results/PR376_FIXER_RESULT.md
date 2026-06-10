# PR #376 MWB-1 Fixer Result — Gate 8 entitlement gating

**Status: FIXED_READY_FOR_RE_AUDIT**
**Head SHA: `b29cac2680bd3a944ef51514edca7a3c6d08d328` (b29cac2)**
Branch: `feature/mwb-1-data-model` (force-pushed, remote head = b29cac2)

## Rebase
- Rebased onto `origin/main` @ `b966088` (PR #374 ACH payouts + PR #375 digital contracts).
- **Clean rebase, no conflicts** — the MWB-1 commit does not touch `package.json`, `package-lock.json`, or `src/checkout/checkout.module.ts`, so the anticipated conflicts did not occur. MWB-1 commit replayed as `768d643`.
- `./node_modules/.bin/prisma generate` (v6.19.3) re-run successfully after rebase.

## Gate 8 fix (REAL issue)
Mounted the coach-tier paywall on `WorkoutProgramController`:
- Added `SubscriptionGuard` to the class `@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)`.
- Added `@RequiresTier('pro')` at the class level.
- Covers all 3 write routes: `POST /workout-programs/:programId/fork`, `/clone`, `/assignments`.
- Parity with other coach-tier write controllers (`CoachMediaController`, coach-AI controllers).
- Behaviour: free-tier coach -> `403 TIER_UPGRADE_REQUIRED`; canceled/inactive sub -> `403 SUBSCRIPTION_INACTIVE`; pro+active and OWNER -> allowed.
- `SubscriptionGuard` resolves via the global `SecurityGuardsModule` (no module change needed; confirmed by module-graph test).
- Reads unchanged (`WorkoutBuilderController` / `AssignmentController`); `WorkoutProgramController` is write-only.

## Test
New `test/workout-program-controller-entitlement.spec.ts` (13 tests):
- Contract: SubscriptionGuard mounted + `@RequiresTier('pro')` metadata present (+ JwtAuthGuard/RolesGuard retained).
- Behaviour driven through the real guard with the controller's real `@RequiresTier` metadata: 403 without entitlement on each route, 403 SUBSCRIPTION_INACTIVE for canceled, allowed with pro+active, allowed for OWNER.

## Gate 2 (`src/ai/*`) — retained, not a violation
Per R31 (runtime-only restriction), the two `src/ai/*` product-code edits are legitimate MWB-1 integrations and were left in place. PR body now has a **Cross-module integration** section documenting:
- `src/ai/gateway/materialisers/assign-workout.materialiser.ts` — §3.3 in-tx immutable plan snapshot.
- `src/ai/coach/coach-ai.service.ts` — §7.2 sub-coach scope on the AI path.

## Verification
- `tsc --noEmit` -> 0 errors.
- `jest workout-program-controller-entitlement + entitlement-guards-mounted` -> 30/30.
- `jest module-graph + workout-builder.controller-rbac + sprint-b-workout-builder-guard` -> 20/20.

## Commits (title-only, author Dynasia G <dynasia@trygrowthproject.com>)
- `21ebfbe feat(workout): mount entitlement guard on WorkoutProgramController write routes`
- `b29cac2 test(workout): assert entitlement gating on fork/clone/assign endpoints`

## Outputs
- PR body updated via `gh api PATCH` (gh pr edit failed on projectCards GraphQL deprecation).
- PR comment posted: issuecomment-4664842482.
- Journal appended to `/tmp/tgp-agent-context/handoffs/dispatch.json`.
- Comment copy saved at `/tmp/pr376_fix_comment.md`.

## Environment note
Disk at 99% (`/dev/root`). `npm ci` blocked by ENOSPC, so the new `@aws-sdk/client-s3` / `@dropbox/sign` deps from main are NOT installed in this worktree's `node_modules`. They are not needed for the entitlement fix — `tsc --noEmit` and all targeted jest suites pass without them. A full `npm ci` + full suite run should be done in a clean environment for re-audit.

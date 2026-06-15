# F1 — Resurrect PR #326 (push-to-existing for live-edit propagation)

**Lane:** backend only
**Branch:** `pr17/push-to-existing-backend` (existing) — rebase onto current `main`
**Target merge:** squash into `main` (HEAD `0d13bfb2` at brief time)
**Flag:** whatever flag #326 already declares (verify; do NOT introduce a second)

## Why this lane exists

The operator has approved Wave-5 lane F (Named Regimes + Auto-Assign) with a specific live-edit propagation model: **opt-in push button** — coach edits stay local; coach taps "Push to existing buyers" per edit to propagate to all active buyers' `status='pending'` ScheduledDrops, with each buyer's own purchase-anchor recomputed. Already-fired drops stay immutable.

That exact endpoint and behavior is already implemented in PR #326 (`POST /v1/coach/packages/:packageId/contents/:contentId/push-to-existing`, +1216 LOC, 6 files). It has been open since 2026-05-29, CI green as of brief time, but mergeable=UNKNOWN (likely conflicts after 17 days of main churn).

F1's job: **get PR #326 merged**. Do not redesign. Do not rename the endpoint. Do not change semantics.

## Empirical reference points (already verified)

- Branch tip: `eafaf95b` (verify in your fetch).
- Existing CI: 1 check, `build-and-test`, bucket=`pass`, state=`SUCCESS`.
- Migrations in main since PR #326 opened: `20261202000000_pr3_drip_schema_foundation`, `20261203000000_pr7_meal_plan_drip_drop_unique`, `20261203100000_pr6_packages_publish_pricing`, `20261204000000_pr9_drip_resolver_marker`, `20261205000000_pr10_scheduled_drop_retry_lock`, `20261209000000_pr17_scheduled_drop_push_seq`. Most of these the PR depends on (good — they're already on main).
- The endpoint uses PR-8's per-package advisory lock; reuses PR-9's `computeFireAt` extracted to `src/packages/drip-fire-at.ts`; uses each buyer's `ClientPurchase.created_at` as the anchor for `relative_to_purchase` cadence.
- Result shape: `{ drops_updated, buyers_affected, skipped_delivered }`.

## Workflow

1. Use worktree `/tmp/gpb-F1` (already cloned at main `0d13bfb2`).
2. Fetch the existing branch:
   ```
   git fetch origin pr17/push-to-existing-backend:pr17/push-to-existing-backend
   git checkout pr17/push-to-existing-backend
   ```
3. Rebase onto current main:
   ```
   git fetch origin main
   git rebase origin/main
   ```
   Resolve conflicts mechanically. Likely flashpoints: `src/packages/*.service.ts`, `prisma/schema.prisma` (if any), test files. Use R74 identity on the rebase commits (`git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' rebase ...` — note: the `-c` must wrap each `commit --amend` if you `git rebase -i`; safest is `git rebase origin/main` then `git commit --amend --no-edit --reset-author` with the identity flags).
4. Run gates empirically:
   - `NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit` — zero errors
   - `npx jest --testPathPattern='(push-to-existing|drip-fire-at|package-push|drip-dispatcher|refund)'` — every existing test in the PR must still pass; existing main tests must still pass
   - `npx jest --testPathPattern='(roles-enforced|telemetry-pin|doctrine)'` — R79 doctrine sweep MUST be green
   - Ban-scan: `git diff origin/main | grep -E '@ts-ignore|as any|as unknown as|\\.catch\\(\\(\\)=>undefined\\)|Coming soon' | wc -l` must be 0
5. Force-push with lease: `git push --force-with-lease origin pr17/push-to-existing-backend`
6. **Do not open a new PR.** PR #326 already exists. Confirm it now shows green checks + mergeable=MERGEABLE after the rebase.
7. **Do not merge.** Parent handles the merge train.

## R-rules

- **R74** every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>`. After force-push, walk the log via `git log origin/main..HEAD --format='%h %an <%ae>'` and confirm every commit has correct identity. If any has wrong identity (e.g. from old author of #326), use `git rebase -i` to amend with `--reset-author` and the identity flags.
- **R52** push as soon as each conflict file resolves; don't wait until the whole rebase is done.
- **R77** lane scope: only touch `/tmp/gpb-F1`. F2 has its own worktree.
- **R79** doctrine sweep green pre-final-push.
- **R80** if any test fails on code outside this PR's scope, verify against `origin/main` first.

## Success criteria

- PR #326 shows `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`
- All checks bucket=pass + state=SUCCESS
- Every commit in the PR (including rebase commits) authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Final summary includes: PR URL, # of rebase conflicts resolved, gate command outputs, branch HEAD SHA, commit count

Report back when PR #326 is mergeable + green.

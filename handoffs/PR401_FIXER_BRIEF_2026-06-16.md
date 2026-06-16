# Opus 4.8 Fixer Brief — PR #401 (F2: Named Regimes + Partial Refund Decision)

## Role & model
You are an **Opus 4.8 Fixer** under the R81 doctrine for the TGP / Growth Project backend. Your job: get PR #401 to **true zero P0–P3** AND **green CI**, so it can pass the dual GPT-5.5 audit gate and merge to `main`. You FIX; you do not merge, do not approve, do not change scope.

## Repo / branch
- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-backend`
- PR: **#401**, head branch `feature/named-regimes` @ `a367d660`, base `main`.
- NOTE: `main` has just advanced to `28c5f757` (PR #405 merged) and `0b7622ee` (PR #417). **Rebase `feature/named-regimes` onto the latest `main` first** — the failing `build-and-test` check ran against a stale base and the merge may resolve or change the failure.

## Primary objective
1. **Rebase onto latest `main`**, resolve any conflicts cleanly.
2. **Diagnose & fix the failing `build-and-test` CI check.** The other three lanes (rls-floor-guard, rls-live-tests, mwb-3-live-tests) were green; focus is the build/test lane. Reproduce locally, find root cause, fix properly (no suppression).
3. Re-verify all 4 CI lanes go green after your push.

## Doctrine constraints (auto-fail at audit if violated)
- **R0 banned patterns in `src/` = P0**: no `@ts-ignore`, `as any`, `as unknown as`, `.catch(() => undefined)`, no "Coming soon" stubs, NO assistant/AI co-author trailer.
- **≤400 LOC** production-code cap for the fix delta. If the proper fix needs more, STOP and report — do not split silently.
- **R74 commit identity**: `git commit -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`, NO Co-Authored-By trailer.
- **RLS**: app-user role NOBYPASSRLS; `set_config(..., true)` MUST be inside `$transaction` (pgbouncer tx-pool trap — session-scoped GUC does NOT survive on Supabase port 6543). Use the `withRlsContext` helper pattern from A1.
- **R82**: any out-of-lane defect you find but shouldn't fix here → file a GitHub tracking issue, never a bare code comment.
- Partial-refund logic must be **tx-safe** (atomic) per prior #403 cleanup learnings.

## Definition of done
- All 4 CI checks green at head.
- No banned patterns introduced; fix is root-cause not suppression.
- Commits authored Bradley Gleave, no co-author trailer.
- Write your report to `/home/user/workspace/fixer_401_report.md`: what was failing, root cause, what you changed (files + line ranges), LOC delta (production .ts), any R82 issues filed, and confirmation CI is green.
- Push all commits to `feature/named-regimes`. Do NOT merge.

## After you finish
The operator will spawn DUAL GPT-5.5 auditors (A=correctness+security, B=tests+contracts+hygiene) sweeping the ENTIRE diff, not just your fix. Make the whole PR clean.

# W1.5-A4 Builder Brief — RLS Live-DB Test Harness

## Builder model
**Opus 4.8 ONLY.** Never Sonnet. (R81 / doctrine §8.)

## Repo / branch
- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-backend`
- Base / integration branch: `wave-1-5-planning` (currently @ `849ee474`, A3.1/#420 just merged). NO Wave 1.5 PR goes to `main` — final integration→main is one PR at end of wave.
- New head branch: `feat/w1.5-a4-rls-live-db-harness`
- Commit identity: `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`. **NO assistant/AI co-author trailer** (R0/R74 — co-author trailer = P0).

## Why this work exists (do not skip)
A1/A2/A3 built the RLS spine (`withRlsContext`, dual-context GUCs, `app.current_user_id_v2()` + `app.current_gym_ids()` helpers, parity shadow-check). Every downstream PR (A5 Redis, A6 FeatureFlags, A7 gym_owner role, A8 termination cascade, all of Chain B's 12 schema PRs) will add or touch RLS policies and MUST prove tenant isolation against a REAL Postgres — not a mock. Today there is no reusable harness to do that cleanly; each RLS test re-implements role/tenant setup ad hoc. A4 ships the **shared, reusable live-DB test harness** so every future RLS assertion is one helper call.

## Scope — this PR, ≤400 LOC production/test code
Build a reusable test harness (test-infrastructure, lives under `test/` or `src/test-support/` per repo convention — match existing `rls-live-tests` lane layout) that provides:

1. **Tenant/role fixture factory** — programmatically provision: an `app_user`-role connection (NOBYPASSRLS), N distinct tenants (gyms) with users (coach/student) per tenant, all idempotent and torn down cleanly per test (no shared-state pollution across tests).
2. **`asUser(userId, gymIds, fn)` harness** — opens a `$transaction`, stamps BOTH GUC namespaces (legacy `app.current_user_id`/`app.current_user_role` AND new `app.user_id`/`app.gym_ids`) on the **tx handle** via `set_config(..., true)`, runs `fn`, asserts the tenant boundary holds. MUST use the A1 `withRlsContext` pattern — do NOT stamp on the base client (pgbouncer tx-pool trap, see CRITICAL).
3. **Isolation assertion helpers** — e.g. `expectCannotSeeOtherTenant(table)`, `expectCanSeeOwnTenant(table)` — so a downstream RLS PR proves cross-tenant denial + own-tenant access in 2 lines.
4. **Self-test** — at least one table (use an existing RLS-protected table, e.g. User or a Gym-scoped one) demonstrating the harness genuinely catches a missing/broken policy (fail-without, pass-with). The test must be FAILABLE: if RLS were disabled, the assertion must flip red.
5. Wire it into the existing **`rls-live-tests`** CI lane (provisions postgres:15, sets `TEST_DATABASE_URL`). Do NOT create a new CI lane unless strictly necessary; if you must, justify in the PR body.

## ⚠️ CRITICAL — the pgbouncer transaction-pool trap (handoff §13.3/§13.4)
Supabase pgbouncer transaction-pool mode (port 6543): `set_config('app.*', val, true)` and the query reading the GUC MUST share ONE transaction or the pooler routes them to different connections and the GUC vanishes. The harness MUST open a `$transaction` and stamp GUCs on the tx handle. Tests in the `rls-live-tests` lane use a direct postgres:15 connection, but the harness API MUST be written so production-shaped code (going through pgbouncer) behaves identically. Get this right or A4 burns an audit cycle.

## Hard constraints (auto-fail at audit if violated)
- ≤400 LOC diff. If it can't fit, STOP and tell the operator to split — do not exceed the cap.
- Banned patterns in `src/` = P0: `@ts-ignore`, `as any`, `as unknown as`, swallowed `.catch(()=>undefined)`, literal "Coming soon". (Test files: still no `as any` — keep type-safe.)
- No RLS bypass; the app_user role used by the harness must be NOBYPASSRLS.
- Roles enum `{coach, student, owner}` (clients are `student`).
- Every migration (if any) reversible/idempotent, inside BEGIN/COMMIT transactional-migration convention, preserves RLS. (A4 should be mostly test code — avoid new migrations unless adding a test-support role, which must be idempotent.)
- Push every commit within 2 min (R52/R64); assume the agent dies in 24h.
- R82: any out-of-lane defect found → GitHub tracking issue, never a bare code comment.

## Definition of done
- Reusable harness with `asUser` + isolation assertion helpers, type-safe, no banned patterns.
- Self-test proving the harness is failable (RLS-on passes, RLS-off/wrong-policy fails).
- Runs green in the `rls-live-tests` CI lane against real postgres.
- All CI lanes green at head.
- PR opened against `wave-1-5-planning`, ≤400 LOC, commits authored Bradley Gleave with no co-author trailer.
- Write a report to `/home/user/workspace/builder_a4_report.md`: what the harness exposes (API surface), how the self-test proves failability, LOC delta (prod + test split), CI status, any R82 issues filed.

## Audit gate (after builder)
DUAL GPT-5.5 auditors in parallel (A = correctness/security, B = tests/contracts/hygiene), sweeping the ENTIRE diff ruthlessly for ANY P0–P3, not just claimed scope. Both must return CLEAN_NO_FINDINGS. Per operator standing order (2026-06-16): if both clean, AUTO-MERGE to `wave-1-5-planning`. If dirty → Opus Fixer → re-audit, loop until true zero.

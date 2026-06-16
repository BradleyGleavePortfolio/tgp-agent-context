# W1.5-A3 Builder Brief — RLS Spine Convergence (Option B: Expand + Dual-Context + Verify)

> **Reconstructed** by CPO operator on 2026-06-16 after the original
> `audit-work/briefs/W1_5_A3_BUILDER_BRIEF.md` was lost in a workspace reset.
> Source of truth: `handoffs/HANDOFF_R81_WAVE_1_5.md` §13.3, §13.4, §21 (lines 588–658, 849–874).
> **Operator decision: Option (b) — expand + dual-context + verify. Approved by Bradley Gleave 2026-06-16.**

## Builder model
**Opus 4.8 ONLY.** Never Sonnet. (R81 / doctrine §8.)

## Repo / branch
- Repo: `growth-project-backend`
- Base / integration branch: `wave-1-5-planning` (NOT `main` — no Wave 1.5 PR goes to main; final integration→main is one PR at end of wave per handoff §6/line 178)
- New head branch: `feat/w1.5-a3-rls-spine-convergence`
- Commit identity: `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`. **NO assistant co-author trailer** (R0/R74 — co-author trailer = P0).

## Why this work exists (do not skip)
Two RLS context mechanisms coexist per-request today:
- **Legacy:** `src/common/interceptors/rls-context.interceptor.ts` sets GUC `app.current_user_id` / `app.current_user_role`. It reads `user.sub` — **this is the F-1 bug** (should be `user.id`; see ENGINEERING_RULES "req.user.id not req.user.sub"). Consumed by 32 migrations + every live RLS policy = AUTHORITATIVE.
- **New (A2, PR #418 merged):** `src/database/rls-context.middleware.ts` sets GUC `app.user_id` / `app.gym_ids`, reads `user.id`. Consumed by **0** live policies.

Option (b) converges them the hyperscaler way — expand → verify → (contract later) — never replacing the security boundary in place.

## Scope — chained PRs, each ≤400 LOC

### PR-A3.1 (THIS BRIEF) — Expand + dual-context + parity verify
1. **F-1 fix:** in the legacy interceptor, change the identity source from `user.sub` → `user.id`. This is a real security correctness fix (legacy GUC currently stamps the wrong claim).
2. **Dual-context expand:** ensure BOTH context paths set BOTH GUC namespaces with identical, correct values per request — legacy stays authoritative; new namespace begins carrying identical truth. Add new SQL helpers `app.current_user_id_v2()` + `app.current_gym_ids()` (read the new namespace) WITHOUT pointing any live policy at them yet.
3. **Parity / shadow check:** on every request, assert legacy GUC user == new GUC user; on mismatch, **deny-log** (structured, observable, no PII) — modeled on AWS IAM shadow evaluation. Do NOT throw in prod path on mismatch in this PR; log only (shadow mode).
4. **Comment-only gym-scope template** for B1a/B1b in `app.module.ts` / policy docs — comment only, no behavior change (carries forward the existing P3-2 documentation fix).
5. **Tests (R79-compliant, behavior-pinned):**
   - Regression test that FAILS on `user.sub` and PASSES on `user.id` (proves F-1 closed).
   - Parity test proving both GUCs resolve to the same user across a request.
   - These MUST exercise the real transaction path (see CRITICAL below).

### PR-A3.2 (DEFERRED — file R82 tracking issue now, do NOT build in this PR)
Contract step: retire the legacy interceptor and re-point User policies onto `app.current_user_id_v2()` — ONLY after the parity check proves 100% agreement in staging soak. File a GitHub tracking issue (R82) titled "W1.5-A3.2 — retire legacy RLS interceptor after parity soak".

## ⚠️ CRITICAL — the pgbouncer transaction-pool trap (handoff §13.3/§13.4)
Supabase pgbouncer **transaction-pool mode (port 6543):** `set_config('app.*', val, true)` and the query that reads the GUC **MUST share ONE transaction**, or the pooler routes them to different connections and the GUC vanishes. You MUST use the `withRlsContext(prisma, ctx, fn)` helper that opens a `$transaction` and stamps the GUC on the **tx handle** (`tx.$executeRawUnsafe("SELECT set_config('app.user_id', $1, true)", ctx.userId)`). Do NOT stamp on the base prisma client. This is the #1 way A3 burns a full audit cycle — get it right the first time.

## Hard constraints (auto-fail at audit if violated)
- ≤400 LOC diff (>200 ideal). If it can't fit, STOP and tell the operator to split further — do not exceed the cap.
- Banned patterns in `src/` = P0: `@ts-ignore`, `as any`, `as unknown as`, swallowed `.catch(()=>undefined)`, literal "Coming soon".
- No RLS bypass; legacy wall must remain authoritative and intact at end of PR.
- Roles enum `{coach, student, owner}` (clients are `student`); status codes 402/403/404/409/410 per ENGINEERING_RULES.
- Every migration reversible/idempotent, runs inside the BEGIN/COMMIT transactional-migration convention, preserves RLS.
- Push every commit within 2 min (R52/R64); assume the agent dies in 24h.

## Definition of done
- F-1 fixed + regression test proving it.
- Both GUC namespaces set correctly per request via `withRlsContext`.
- Parity shadow-check in place, deny-logging on mismatch.
- New helpers exist, zero live policy re-pointed (that's A3.2).
- R82 tracking issue filed for A3.2.
- PR opened against `wave-1-5-planning`, all CI green, ≤400 LOC.

## Audit gate (after builder)
DUAL GPT-5.5 auditors in parallel (A = correctness/security, B = tests/contracts/hygiene). Both must return CLEAN_NO_FINDINGS. Per operator standing order (2026-06-16): if both clean, AUTO-MERGE to `wave-1-5-planning`.

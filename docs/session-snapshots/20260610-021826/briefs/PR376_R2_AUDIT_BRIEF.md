# R2 AUDIT BRIEF — PR #376 MWB-1 Post-Fix

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #376 — "feat(workout): MWB-1 master workout builder data model + RLS + sub-coach scope"
**Post-fix head SHA:** `b29cac2680bd3a944ef51514edca7a3c6d08d328`
**Previous R1 head:** `73fca48` (DIRTY — entitlement guard missing on WorkoutProgramController)
**Worktree:** `/home/user/workspace/tgp/backend-mwb-1-r2-audit` (detached @ b29cac2)
**Base of comparison:** R1 audit report at `/home/user/workspace/tgp/backend-mwb-1-audit/AUDIT_R1_PR_376_REPORT.md`
**Auditor model:** GPT-5.5
**Verdict rubric:** CLEAN / DIRTY-MINOR / DIRTY

---

## 0. R1 findings to re-verify

Per orchestrator triage of R1:
- **REAL fix required:** Entitlement guard missing on `WorkoutProgramController` write routes (fork/clone/assignments). Free-tier coach must get 403 TIER_UPGRADE_REQUIRED; inactive sub → 403 SUBSCRIPTION_INACTIVE.
- **BRIEF DRIFT (not a defect):** `src/ai/coach-ai.service.ts` and `src/ai/assign-workout.materialiser.ts` edits. R31 explicitly applies to runtime agents, not product code in `src/ai/*`. Both edits are legitimate MWB-1 §3.3 (snapshot freeze in same tx) and §7.2 (sub-coach scope parity). MUST NOT be reverted.

---

## 1. R2 verification checklist

### 1.1 The fix that was required
- [ ] `WorkoutProgramController` decorated with `@UseGuards(JwtAuthGuard, SubscriptionGuard, …)` and `@RequiresTier('pro')` at class level (or per-route, equivalent coverage on ALL write endpoints)
- [ ] Write endpoints covered: `fork`, `clone`, `assignProgram` (plus any other writes — enumerate all)
- [ ] Read endpoints (if any) are unaffected (or also have appropriate guards if reading paywall-gated data)
- [ ] Parity with reference controllers: `CoachMediaController`, coach-AI write controllers — exact same guard pattern
- [ ] `SubscriptionGuard` resolves via global module (no manual provider duplication)
- [ ] Test file `test/workout-program-controller-entitlement.spec.ts` exists
- [ ] At least 1 test per write route asserting: free-tier → 403 + correct code; inactive sub → 403 + correct code; pro+active → 2xx; OWNER → 2xx
- [ ] Test asserts the response BODY contains `{code: "TIER_UPGRADE_REQUIRED"}` or `{code: "SUBSCRIPTION_INACTIVE"}`, not just status
- [ ] All previously-passing tests still pass (no regression)
- [ ] tsc clean
- [ ] Entitlement-guards-mounted suite (cross-controller pin) passes

### 1.2 The drift that was NOT a defect (preservation check)
- [ ] `src/ai/coach-ai.service.ts` still widens client gate to include sub-coach access (per §7.2)
- [ ] `src/ai/assign-workout.materialiser.ts` still creates snapshot in the same tx as assignment.create (per §3.3)
- [ ] No reversion under panic
- [ ] PR body Cross-module integration section present and cites §3.3 + §7.2

### 1.3 Rebase integrity
- [ ] Rebased onto main `b966088` (PR #374 + #375 merged)
- [ ] No conflicts surfaced (fixer reported clean — verify by checking commit graph)
- [ ] Prisma client regenerated (v6.19.3)
- [ ] Migration ordering correct relative to #374 (PayoutMethod) and #375 (Contract*) — no migration timestamp collision

### 1.4 Original §3.3 invariant still holds
**"Client can never observe an assignment without its frozen exercise list."** Re-verify:
- [ ] `assignment.create` and `snapshot.create` are in the SAME `prisma.$transaction` block (or equivalent serializable boundary)
- [ ] No code path that inserts assignment without snapshot
- [ ] Test exists asserting partial-failure scenario (snapshot fails → assignment rollback)

### 1.5 RLS still HECTACORN
- [ ] All 61 tests in original RLS spec still pass
- [ ] No RLS policy modified during fix
- [ ] No table got RLS disabled

### 1.6 Module graph
- [ ] `app.module.ts` cleanly imports WorkoutProgramModule
- [ ] No duplicate provider registrations
- [ ] No circular deps introduced

---

## 2. What to spot-check on top of the checklist

1. The fix commit `feat(workout): mount entitlement guard on WorkoutProgramController write routes` — read the actual diff. Confirm guard isn't a no-op (e.g. wrong tier name like `'PRO'` vs `'pro'`).
2. The test commit `test(workout): assert entitlement gating on fork/clone/assign endpoints` — read the test file. Confirm tests aren't just type-checking; they actually exercise the guard with a mocked subscription state.
3. `gh api PATCH` was used to update PR body (because `gh pr edit` hit a projectCards GraphQL deprecation). Confirm body update did land — pull live PR body via API.
4. Disk constraint note from fixer: `npm ci` blocked → aws-sdk/dropbox-sign deps NOT installed in fixer's worktree. Audit must NOT rely on those installs; use tsc + targeted jest only. If you need to install, install only `@aws-sdk/client-s3` and `@dropbox/sign` from cache.
5. Confirm fixer didn't accidentally weaken the guard to "any authenticated user" while trying to fix it.

---

## 3. Verdict + report

Write `AUDIT_R2_PR_376_REPORT.md` at worktree root.

- CLEAN = all 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 pass. Ready to merge.
- DIRTY-MINOR = cosmetic only (e.g. PR body section misnamed).
- DIRTY = any functional gap remains.

Post verdict as PR comment with `gh pr comment 376 --repo BradleyGleavePortfolio/growth-project-backend --body-file AUDIT_R2_PR_376_REPORT.md` (`api_credentials=["github"]`). Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.

Return verdict, finding count, report file path.

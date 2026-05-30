# FIX BRIEF R2 — Billing throttles PR #329 audit remediation (P0 + P2)

Repo: growth-project-backend. Branch: `fix/billing-throttles` (PR #329). Type: MONEY/SECURITY (🔴💰).
Audited SHA `0c88ce3` verdict NOT CLEAN. Full audit: `audits/FIX_BILLING_THROTTLES_AUDIT.md`.
Everything else in the PR (B2/B3/B8 throttles, B1 extraction, B4 DTO) was verified CLEAN — DO NOT change those.

## The two findings to fix

### P0 — NULL-unsafe `NOT` predicate swallows the first failed payout
`src/billing/billing.service.ts:1418` — `applyPayoutFailed` uses:
```
updateMany({ where: { id: row.id, NOT: { last_payout_stripe_id: payout.id, last_payout_status: terminalStatus } }, ... })
```
`PayoutSnapshot.last_payout_stripe_id` and `.last_payout_status` are NULLABLE (`prisma/schema.prisma:3666,3668`). For a snapshot with no prior payout values (first-ever payout / no snapshot values), the SQL `NOT (col = ? AND col2 = ?)` evaluates to UNKNOWN (not TRUE) under SQL NULL semantics, so the UPDATE matches **0 rows**. The handler then returns before the COACH_ALERT at `:1437`, and the outer webhook still marks the event complete at `:506` → the failed bank payout is **never persisted or surfaced** and Stripe replay is dedup-swallowed. This is the ORIGINAL B7 money bug still present for the nullable/first-payout case. (Auditor reproduced with Prisma 6.19.3: all-NULL row → `{ count: 0 }`.)

**Required fix (auditor's recommendation — implement faithfully):**
- After the `findFirst` that loads `row`, decide idempotency in **TypeScript**, not via a nullable Prisma `NOT`:
  - Compute already-terminal = `row.last_payout_stripe_id === payout.id && row.last_payout_status === terminalStatus`.
  - If already-terminal for THIS exact event/payout → return (true no-op replay; no double-record, no double-alert).
  - Otherwise → update by `{ id: row.id }` ONLY (no nullable `NOT` predicate) and proceed to record + alert.
- Equivalent acceptable alternative: make the Prisma predicate explicitly NULL-safe (e.g. `OR` of the not-equal cases plus the `null` case). Prefer the TS-comparison approach — it is unambiguous and the auditor reproduced the SQL hazard.
- Preserve idempotency: a genuine same-payout same-terminal-status replay must remain a no-op (no second alert, no double row mutation). A DIFFERENT payout, or a first-ever payout with NULL snapshot values, MUST record + alert exactly once.
- Do NOT change the happy-path payout/transfer SUCCESS handling. No money math changes. Keep the PayoutSnapshot fields written at `:1426-1430` as-is (only the gating logic changes).

### P2 — Test masks the real SQL NULL behavior
`test/billing-payout-failed.spec.ts:58` (guard mock at `:61-66`) implements the nullable guard with JS equality, so NULL initial values behave as "not already terminal" — the test passes even though real Prisma would no-op. Add/repair a **regression test** that exercises the NULL-row path:
- Stub/mock `updateMany` (or use a query log) so that for a snapshot whose `last_payout_stripe_id` AND `last_payout_status` are both NULL, the FIRST `payout.failed`/`payout.canceled` event still RECORDS the failure and FIRES the COACH_ALERT exactly once.
- Keep the existing replay/idempotency test (second identical event = no-op, no double alert) green.
- The new logic must make this regression test pass for the right reason (it must fail against the old `0c88ce3` logic).

## Guardrails (unchanged)
- Touch ONLY billing/connect/test files. Do NOT touch `src/packages/*`, `prisma/schema.prisma`, any migration, or any `ai*` file.
- Reuse existing alert mechanism (COACH_ALERT) and PayoutSnapshot model — invent nothing new.

## Process
1. `cd /home/user/workspace/wt-fix-billing` (your isolated worktree, branch `fix/billing-throttles`). Main repo is READ-ONLY.
2. **Rebase onto latest main first** (main moved: now contains B1 #328 + AI-gateway #327). `git fetch origin && git rebase origin/main`. The branch's changed files are billing/connect/test only and are disjoint from the merged work — expect a clean rebase (R55 zero-conflict exception). If a conflict appears, STOP and report; do not force-resolve.
3. Implement the P0 fix + P2 regression test.
4. Run REAL checks: `npx tsc --noEmit`, lint, and the billing-area tests (`npx jest billing`). Report actual counts. `npm ci` if node_modules absent.
5. Commit as `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO Co-Authored-By / Generated trailers. Push every ~2 min (R61); after rebase use `git push --force-with-lease`.
6. Update `specs/FIX_BILLING_THROTTLES_BUILD_REPORT.md` with an R2 section: the exact P0 fix (file:line), the new/updated regression test, idempotency proof, actual tsc/lint/test counts, and the final HEAD SHA.
7. Report the final HEAD SHA in your return message so a fresh re-audit can be SHA-pinned.

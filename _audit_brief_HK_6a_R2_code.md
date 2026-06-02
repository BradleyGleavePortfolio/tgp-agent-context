# HK-6a R2 Code Audit Brief

**Auditor model:** GPT-5.5
**Auditor identity:** Independent code auditor. R31/R32 — auditor ≠ builder.
**Repo:** `growth-project-backend`
**PR:** #357
**Head SHA (R55):** `ca08f618d4bedad48756ff47f23f8776440e26cb`
**Base of fixes:** `afbe84a900f4073ca8b8457c994acc2541c02c8e` (R1 build)
**Origin/main HEAD:** `e49ae5ae2e0320ffcc73f5719dde555452c1f86b`
**Worktree:** `/tmp/wt-hk6-audit-r2-code` (FRESH)
**Round:** R2

## R1 findings being resolved

Cross-reference these reports:
- `/home/user/workspace/_audit_HK_6a_R1_code_GPT55.md` — P1: 15 `as never`, action enum `dismiss`→`reject`, reject response semantics, transactional integrity. `requester_id: null` ACCEPTED.
- `/home/user/workspace/_fixer_result_HK_6a_R2.md` — fixer's claims, including TWO DOCUMENTED DEVIATIONS that this audit must explicitly evaluate.

## 🚨 SPECIAL ATTENTION — fixer's documented deviations

The fixer took **Path A (true `$transaction`)** for transactional integrity but with a SCOPE narrower than the brief's literal example:

- **What the fixer wrapped in `$transaction`:** the status-flip `updateMany` + linked `aiRequestAudit.updateMany` INSIDE `AiApprovalService.decide()` — keeping `decide()`'s signature UNCHANGED (no `tx` param threaded through).
- **What the fixer deliberately kept OUTSIDE:** `MessagingService.sendAsCoach` (external side-effect, cannot rollback) AND the materialiser's idempotency claim (`materialised_at` via `updateMany` — must remain visible across processes; an interactive transaction would hide it until commit and pin a DB connection across the network call).
- **Materialiser DID gain an optional `tx?: Prisma.TransactionClient = this.prisma` parameter** for interface compliance / future composition, defaulting to `this.prisma`. Production code does not pass a wrapping tx.

**Your job is to evaluate whether this scope is the right atomic unit.** The R1 auditor flagged "status flip with missing follow-on audit update" specifically — that exact pair IS now atomic. The question is whether the audit is satisfied by closing exactly that gap.

**Key invariants to verify:**

1. The materialiser's `materialised_at` claim being visible cross-process is a real correctness requirement. Read `coach-wearable-message.materialiser.ts` claim/race/recovery flow and `coach-message.materialiser.ts` (the sibling pattern). Confirm wrapping the claim in an interactive transaction would actually break the race/recovery state machine.
2. Holding a DB connection across an external `sendAsCoach` call is a real anti-pattern (connection pool exhaustion under load). Confirm.
3. The two writes now atomic — status flip + linked audit — are the EXACT pair the R1 auditor flagged. Verify by re-reading R1's transactional-integrity finding.

**Verdict scale for the deviation:**
- **ACCEPT** — the chosen scope is correct; the rationale is sound; no further work needed
- **EXTEND** — the chosen scope is correct AS FAR AS IT GOES, but the audit identifies one more pair that should also be atomic (recommend a P2 follow-up)
- **REJECT** — the chosen scope is wrong; demand a wider transaction (only valid if the auditor can show the cross-process visibility argument is false)

Most likely verdict: ACCEPT. But you must justify it.

The second deviation — **two extra test files touched** (`test/ai-approval.service.spec.ts`, `test/ai-approval-materialiser-integration.spec.ts`) to add `$transaction` to their hand-rolled Prisma mocks — is a mechanical consequence of the production change. Verify by reading the diff that no behavior changed for non-wearable capabilities (the mock should invoke the callback with the same in-memory client).

## Worktree setup

```bash
cd /tmp
(cd /tmp/gpb-clone && git fetch origin && git worktree add /tmp/wt-hk6-audit-r2-code ca08f618d4bedad48756ff47f23f8776440e26cb)
cd /tmp/wt-hk6-audit-r2-code
ln -sfn /tmp/gpb-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal ca08f618d4bedad48756ff47f23f8776440e26cb
```

## Mandatory training docs

1. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (R65 full sweep)
2. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (most backend-N/A)

## R0 ban scan (FIRST)

Use the updated grep (now also runs across the new helper file + the test/ files):

```bash
cd /tmp/wt-hk6-audit-r2-code
git diff origin/main..HEAD -- 'src/**' 'test/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

Builder claim: EMPTY. Verify literally — the fixer noted helper-file comments were "deliberately worded to avoid the literal banned substrings." Read those comments and confirm they don't smuggle in semantic equivalents (e.g. wording like "we used to launder casts" — still acceptable but flag if it does describe the banned pattern in a way that documents it well; we want explicit prohibition, not winking).

## Fix-by-fix verification

### P1-1 — `as never` elimination (15 occurrences)

For EACH of the 15 file:line occurrences from the R1 audit, verify:
- The line no longer contains `as never`
- The replacement is one of the allowed patterns:
  - Pattern A: `createMock<T>()` / `DeepMocked<T>` (auditor confirmed `@golevelup/ts-jest` is NOT a dep, so this pattern is unavailable here — should be ZERO sites)
  - Pattern B: typed `Pick<X, ...>` / `Partial<X>` doubles with an explicit `as X` widening cast at a narrow, named boundary (the fixer's chosen pattern)
  - Pattern C: `@ts-expect-error <one-line justification>` at unavoidable boundaries
- **The replacement is NOT `as unknown as`** (banned) and NOT a new `as never` (banned)

**Specifically evaluate Pattern B's `as X` widening assertions** (e.g. `Pick<delegate,'create'> as delegate` and `Pick<PrismaService,'aiActionDraft'> as PrismaService`). The brief explicitly allowed Pattern B with the caveat that "`as X` from `Partial<X>` IS still a type assertion" but is acceptable because it's explicit and not laundering. Confirm:
- Each cast is from a NAMED narrow shape (a `Pick` or `Partial` with explicit members), not from an anonymous object literal
- The cast site is in a TEST HELPER, not in production code
- The cast is a single hop (not `as never as X` or `as unknown as X`)

Read `wearable-insights.controller.test-helpers.ts` end-to-end. The R0 grep would catch the banned patterns; your job is to confirm the spirit — that the doubles document their shape, not launder type errors.

### P1-2 — Action enum `reject`

- `ApproveBodySchema.action` is `z.enum(['approve', 'edit', 'reject'])` (NO `dismiss`)
- Handler maps `body.action === 'reject' ? 'rejected' : 'approved'` (or includes `edit` correctly — read the actual code)
- Tests exercise `reject` and assert `decision: 'rejected'`

### P1-3 — Reject response `materialised_at: null`

- Response Zod schema has `materialised_at: z.string().nullable()` (or equivalent)
- Handler returns `null` for the reject path; ISO string for approve/edit
- Tests assert null vs ISO string correctly
- Verify the old `decided_at`-as-`materialised_at` fallback is REMOVED (not just nulled in one branch)

### P1-4 — Transactional integrity (the deviation — see top of brief)

Read `AiApprovalService.decide()` in full. Verify:
- The status-flip `updateMany` + linked `aiRequestAudit.updateMany` are inside `this.prisma.$transaction(async (tx) => { ... })`
- Both writes use `tx.*` (not `this.prisma.*`) inside the transaction body
- The early-return on 0-rows-matched case is preserved (caller still gets 409)
- The materialiser's `tx?` param defaults to `this.prisma` and is correctly threaded through every DB call inside the materialiser
- Code comments at `ai-approval.service.ts:244-261` (claimed) document the deliberate exclusions
- The two extra test files' mock changes preserve existing assertions (invoke callback with same in-memory client)

Then EVALUATE THE DEVIATION (ACCEPT / EXTEND / REJECT) per the top of this brief.

### P2-5 — Jest command spelling

Run with the plural form yourself:
```bash
npx jest --testPathPatterns='(coach-wearable-message|wearable-insights.controller)' --no-coverage --roots src test 2>&1 | tail -30
```
Verify 33/33 (or whatever the actual count). Also run regression:
```bash
npx jest --testPathPatterns='(ai-approval|ai-capability-materialiser-registry|ai-gateway.controller)' --no-coverage --roots src test 2>&1 | tail -30
```
Verify 24/24.

## 50-Failures sweep (R65)

Walk every category. Pay extra attention to:
- **#7 silent error swallowing** — does the new `$transaction` swallow rollback errors? It shouldn't — Prisma re-throws transaction errors
- **#15 over-specific code** — is the test helper appropriately abstracted, not over-fitted to one test?
- **#17 fake test coverage** — the mock `$transaction` in the two test files: does it actually exercise the new atomic path, or does it just bypass it? Verify by reading the mock implementation
- **#22 missing edge cases** — what if `aiRequestAudit.updateMany` returns 0 rows inside the transaction (e.g. audit row doesn't exist)? Does the transaction succeed (status flips alone) or rollback? Either is defensible but should be a deliberate choice
- **#28 race conditions** — the materialiser claim is OUTSIDE the transaction. Verify that this is genuinely correct vs accidentally introducing a race where two coaches click Approve simultaneously
- **#31 unsafe assertions** — Pattern B's `Pick<X> as X` casts. Already covered above
- **#34 observability** — does the transaction failure path log? Does the `$transaction` callback propagate errors back to the controller? Verify

## Gates

```bash
cd /tmp/wt-hk6-audit-r2-code
npx tsc --noEmit 2>&1 | tail -20
npx eslint 'src/ai/gateway/**/*.ts' 'src/wearables/insights/**/*.ts' 2>&1 | tail -20
# Use --testPathPatterns (plural):
npx jest --testPathPatterns='(coach-wearable-message|wearable-insights.controller)' --no-coverage --roots src test 2>&1 | tail -30
# Regression:
npx jest --testPathPatterns='(ai-approval|ai-capability-materialiser-registry|ai-gateway.controller)' --no-coverage --roots src test 2>&1 | tail -30
```

All must PASS. Fixer claims 33/33 target + 24/24 regression + 43/43 all materialiser. Verify at least the first two.

## Deliverable

Write to `/home/user/workspace/_audit_HK_6a_R2_code_GPT55.md`:

```
# HK-6a R2 Code Audit — GPT-5.5

**Head SHA verified:** ca08f618d4bedad48756ff47f23f8776440e26cb
**Verdict:** CLEAN | NEEDS_R3 | BLOCKED

## R0 ban scan (UPDATED grep)
<output — MUST be empty>

## P1 fix verification
- P1-1 `as never` (15 occurrences): PASS/FAIL <evidence file:line for each>
- P1-2 reject action: PASS/FAIL
- P1-3 reject response nullable materialised_at: PASS/FAIL
- P1-4 transaction (deviation evaluation): ACCEPT | EXTEND | REJECT — <full justification>

## Pattern B `as X` widening cast evaluation
<is the spirit of R0 preserved? evidence>

## Transaction scope deep-dive
- Status-flip + linked-audit atomicity verified? <evidence>
- Materialiser claim correctly OUTSIDE transaction? <evidence + cross-process visibility argument>
- sendAsCoach correctly OUTSIDE transaction? <evidence>
- Code comments document the exclusions? <evidence>
- Test mocks preserve assertions? <evidence>

## 50-Failures sweep
<table>

## Gate results
- tsc: PASS/FAIL
- eslint: PASS/FAIL
- jest target: PASS/FAIL <X/Y>
- jest regression: PASS/FAIL <X/Y>

## New findings (P0/P1/P2/P3)
<should be empty or near-empty>

## Verdict rationale
```

Do NOT commit. Audit only.

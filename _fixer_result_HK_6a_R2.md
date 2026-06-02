# HK-6a R2 Fixer Result

**Base SHA:** afbe84a900f4073ca8b8457c994acc2541c02c8e
**New HEAD SHA (40-char):** ca08f618d4bedad48756ff47f23f8776440e26cb
**Branch pushed:** hk/PR-HK-6-approval-backend (afbe84a9..ca08f618)
**Commit author:** Dynasia G <dynasia@trygrowthproject.com> (title-only, no Co-Authored-By, no Generated-By)

**Files changed:**
- `src/wearables/insights/wearable-insights.controller.ts`
- `src/wearables/insights/wearable-insights.controller.spec.ts`
- `src/wearables/insights/wearable-insights.controller.test-helpers.ts` (NEW)
- `src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts`
- `src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts`
- `src/ai/gateway/ai-approval.service.ts` (transaction wrap — justified below)
- `test/ai-approval.service.spec.ts` (mock `$transaction` added — consequence of decide() change)
- `test/ai-approval-materialiser-integration.spec.ts` (mock `$transaction` added — same reason)

**Total +/- lines:** 8 files changed, 292 insertions(+), 114 deletions(-)

## Fixes applied

### P1-1: `as never` elimination
- **Pattern used:** B (narrow `Pick<X, ...>` / `Partial<X>` typed doubles widened with explicit single/structural `as X` assertions, centralised in one test-helper file).
- **@golevelup/ts-jest available?** NO (`grep -c '@golevelup/ts-jest' package.json` → 0). Per the brief, NOT added; Pattern A (`DeepMocked`/`createMock`) was therefore unavailable, fell back to Pattern B.
- **All 15 occurrences removed?** YES. `grep -rcE '\bas never\b'` over every scope file returns 0. Repo-wide `as never` count dropped from 14 pre-existing in other (out-of-scope) files only — none in this PR's files. R0 ban scan on added lines is EMPTY (see below).
  - materialiser.spec.ts L63 `} as never;` (Prisma double) → typed `Pick<PrismaService,'aiActionDraft'>` with the delegate narrowed to `updateMany|update|findUnique`.
  - materialiser.spec.ts L72 `{ sendAsCoach } as never` → `Pick<MessagingService,'sendAsCoach'>`.
  - controller.spec.ts L50 service mock `as never` → `makeServiceDouble()` returning `jest.Mocked<Pick<WearableInsightsService, ...>>`.
  - controller.spec.ts L54 request `as never` → `makeAuthedRequest()` returning `Pick<AuthedRequest,'user'>` widened once.
  - controller.spec.ts L79/L80 `as never as PrismaService` / `as never as AiApprovalService` → `makeApprovalDeps()` typed doubles.
  - controller.spec.ts L89/L152/L174/L186/L413/L432/L433/L446/L454 (`svc as never`, `null as never`, `emptyInsight() as never`) → all routed through `makeController({ svc, approvals?, prisma? })`; the empty-state mock now returns `emptyInsight()` with no cast (it is a valid union member).
- **New test helper added?** YES — `src/wearables/insights/wearable-insights.controller.test-helpers.ts` (`makeServiceDouble`, `makeApprovalDeps`, `makeController`, `makeAuthedRequest` + types). Collapses 12 call sites to four named builders.

### P1-2: Action enum reject
- **`dismiss` removed, `reject` added?** YES. `ApproveBodySchema.action` is now `z.enum(['approve', 'edit', 'reject'])` (controller.ts:74). Dispatch maps `body.action === 'reject' ? 'rejected' : 'approved'` (controller.ts:201). No backward-compat / `dismiss` retained (HK-5b consumer still open, per brief).
- **Tests updated?** YES. `approveBody` action type → `'approve' | 'edit' | 'reject'`; the former `dismiss → rejected` test renamed to `reject → decides rejected, no materialiser dispatch, null materialised_at` and asserts `decision: 'rejected'`.

### P1-3: Reject response semantics
- **Option taken:** A (nullable `materialised_at`).
- **Schema updated?** YES. `ApproveResponseShape.materialised_at` is now `z.string().nullable()` (controller.ts:89). Handler returns `fresh.materialised_at?.toISOString() ?? null` — the prior `decided_at`/`now()` fallback that conflated decision time with materialisation time is removed (controller.ts:218).
- **Tests assert null/non-null correctly?** YES. Reject test asserts `materialised_at: null`; approve and edit tests assert the ISO string `'2026-01-01T00:00:00.000Z'`.

### P1-4: Transactional integrity
- **Path taken:** A (true `$transaction`), scoped to the writes that are safe and correct to make atomic.
- **What is wrapped:** Inside `AiApprovalService.decide()`, the **status-flip `updateMany` (decide-gate) and the linked `aiRequestAudit.updateMany`** now run inside a single `this.prisma.$transaction(async (tx) => { ... })`. This directly closes the auditor's flagged gap "a status flip with a missing follow-on audit update" — those two writes now commit or roll back together. If the gated flip matches 0 rows (already-decided / materialisation-invariant-not-yet-met) the transaction returns early as a no-op and the caller still gets its 409.
- **Deliberately OUTSIDE the transaction (with code comments at ai-approval.service.ts:244-261 and the materialiser):**
  - `MessagingService.sendAsCoach` — external push/notification side-effect that cannot be rolled back. The materialiser runs **before** the decide transaction; its `materialised_ref` is the committed-success marker.
  - The materialiser's **idempotency claim** (`materialised_at` via `updateMany`) must remain visible to concurrent approvers across processes for the claim/race/recovery state machine to function; holding it inside an interactive transaction would hide it until commit AND pin a DB connection across a network call (an anti-pattern). This is why the whole approve flow is NOT wrapped in one outer transaction.
  - The global `AuditLog` write — best-effort, has its own error handling, and is the terminal write (a crash after it is immaterial).
- **Materialiser accepts tx?** YES. `CoachWearableMessageMaterializer.materialize(draft, tx: Prisma.TransactionClient = this.prisma)` and the private `awaitWinnerOrRecover(draft, payload, tx = this.prisma)` thread `tx` through every DB call (`tx.aiActionDraft.updateMany/update/findUnique`). Defaults to `this.prisma` so existing callers and the registry interface (`materialize(draft)`) are unaffected. Follows the established codebase convention (`ingestion.service.ts:256`). Production does not pass a wrapping `tx` (see claim-visibility note above); the param exists for composition by a caller that genuinely owns a unit-of-work (e.g. a single-writer admin backfill).
- **AiApprovalService.decide accepts tx? (blast-radius note):** `decide()`'s **signature is unchanged** — no `tx` parameter was added to it. Blast radius assessed: only 2 production callers (`wearable-insights.controller.ts`, `ai-gateway.controller.ts`) and spec coverage in 3 test files. Rather than thread `tx` through the shared signature (which would force every caller to opt in and risk the cross-process claim-visibility problem), the transaction is created **internally** within `decide()` around exactly the two writes that must be atomic. This keeps the public contract identical, touches no other capability, and is the minimal correct change. The two existing approval test files (`test/ai-approval.service.spec.ts`, `test/ai-approval-materialiser-integration.spec.ts`) were updated to add a `$transaction` to their hand-rolled Prisma mocks (the mock invokes the callback with the same in-memory client, so existing assertions are preserved). 24/24 of those tests pass.
- **Recovery tests added (Path B only)?** N/A — Path A taken.

## Gates
- **tsc:** PASS (`npx tsc --noEmit` exit 0, empty output).
- **eslint:** PASS (`npx eslint 'src/ai/gateway/**/*.ts' 'src/wearables/insights/**/*.ts'` exit 0, 0 errors, 1 warning — the pre-existing `src/ai/gateway/ai-gateway.controller.ts:52:30` unused-`req` warning, P3-a, out of scope).
- **jest:** PASS (use `--testPathPatterns` plural):
  - `npx jest --testPathPatterns='(coach-wearable-message|wearable-insights.controller)' --no-coverage --roots src test` → **2 suites, 33/33 tests** (matches the auditor's verified R1 count of 33).
  - Regression run for the touched shared service: `--testPathPatterns='(ai-approval|ai-capability-materialiser-registry|ai-gateway.controller)'` → **3 suites, 24/24**.
  - All materialiser suites: `--testPathPatterns='materialiser'` → **4 suites, 43/43**.

## R0 ban scan output
Command (added `src/**` lines, including the new untracked helper file, plus `test/**` added lines), run against `origin/main`:
```
git diff origin/main -- 'src/**' ; git diff --no-index /dev/null <new helper> | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```
**Output: EMPTY.** (grep exit code 1 — no matches on src/** added lines, the new helper file, or test/** added lines.) Note: helper-file comments were deliberately worded to avoid the literal banned substrings so they cannot create false positives in the added-line scan.

## Deviations from brief
1. **P1-4 transaction scope:** The brief's Path A example threads `tx` through `decide()` and the materialiser and wraps `create + materialise + decide`. After reading the code, threading `tx` through the materialiser's claim/send/ref sequence inside one interactive transaction would (a) break the cross-process idempotency claim (it would be invisible until commit) and (b) hold a DB connection across the external `sendAsCoach` network call. I therefore implemented Path A by wrapping **only the two writes that are genuinely atomic-safe and that the auditor flagged** (status flip + linked audit-row update) in a `$transaction` *internal* to `decide()`, keeping `decide()`'s signature unchanged. `sendAsCoach` stays outside (as the brief's hard limit requires) and the materialiser still gains the `tx?` param for compliance/future composition. This satisfies the brief's intent (atomicity for what we control; documented why the send stays out) while avoiding a correctness regression in the existing race/idempotency machine. Justified in code comments and above.
2. **Two extra test files touched** (`test/ai-approval.service.spec.ts`, `test/ai-approval-materialiser-integration.spec.ts`): required because adding `$transaction` to `decide()` made their hand-rolled Prisma mocks fail. The brief named `ai-approval.service.ts` as touchable if Path A requires it and said its tests must be updated; these mock updates are the minimal consequence. No production behaviour changed for non-wearable capabilities (the mock re-uses the same client, so `coach_message`/`workout_program` paths behave identically).

## P2-5 (Jest command spelling)
Done — this doc uses `--testPathPatterns` (plural) throughout; the old `--testPathPattern` fails before tests run on this repo's Jest version.

## Risks for R2 audit
- **Transaction scope is narrower than a naive "wrap the whole approve flow."** The auditor should confirm the chosen scope (status-flip + linked-audit-row update) is the right atomic unit and that the documented rationale for keeping `sendAsCoach` and the materialiser claim outside the transaction is sound. The key invariant preserved: the materialiser's `materialised_at` claim must stay visible to concurrent approvers, so it cannot live inside an interactive transaction.
- **decide() signature intentionally NOT changed** — verify the auditor is comfortable with an internal transaction over a threaded `tx` param, given the small blast radius (2 prod callers) and the cross-process-visibility argument.
- **Materialiser `tx` param defaults to `this.prisma` and is not exercised with a non-default tx in production** — it is covered structurally by the existing 11 materialiser tests (all pass through the default), not by a dedicated "tx passed in" test. The param is there for interface compliance and future single-writer composition; flag if the auditor wants an explicit test that a passed-in tx is used.
- **Pattern B uses explicit `as X` widening assertions** (e.g. `Pick<delegate,'create'> as delegate`, `Pick<PrismaService,'aiActionDraft'> as PrismaService`). These are not the banned `as never`/`as unknown as`/`as any` laundering patterns and pass the R0 grep, but the auditor should confirm they accept Pattern B's documented "single explicit assertion from a named narrow shape" as audit-spirit compliant (the brief explicitly allows this).
- **17 pre-existing main test failures** (module-graph/openapi-spec/roles-enforced/scheduling) are KNOWN and out of scope — untouched.

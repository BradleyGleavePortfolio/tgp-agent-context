# HK-6a R1 Code Audit Brief — Approval Endpoint + Coach Wearable Message Materialiser

**Auditor model:** GPT-5.5
**Auditor identity:** Independent code auditor. R31/R32: auditor ≠ builder. The builder was Opus 4.8.
**Repo:** `growth-project-backend`
**PR:** #357
**Head SHA (R55):** `afbe84a900f4073ca8b8457c994acc2541c02c8e`
**Base:** `origin/main` (`e49ae5ae2e0320ffcc73f5719dde555452c1f86b`)
**Worktree:** `/tmp/wt-hk6-audit-r1-code` (FRESH — distinct from builder's `/tmp/wt-hk6-backend`)
**Round:** R1

## What this PR does

Adds the backend half of the AI approval workflow for wearable-driven coach messages:

1. **New materialiser** `coach-wearable-message.materialiser.ts` with capability `draft.coach_wearable_message` — mirrors the existing `CoachMessageMaterializer` claim/race/recovery flow.
2. **New endpoint** `POST /v1/wearables/insights/approve` on `wearable-insights.controller.ts` (coach-auth).
   - Body: `{client_id, bucket, draft_body, action}` where `action ∈ {approve, edit, reject}`
   - Response: `{status:'ok', draft_id, materialised_at}`
3. Module wiring through `ai-gateway.module.ts` + `insights.module.ts`.
4. Spec coverage: `coach-wearable-message.materialiser.spec.ts` + `wearable-insights.controller.spec.ts`. Builder claims 46 tests pass.

**Files in diff (6):**
1. `src/ai/gateway/ai-gateway.module.ts`
2. `src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts`
3. `src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts`
4. `src/wearables/insights/insights.module.ts`
5. `src/wearables/insights/wearable-insights.controller.spec.ts`
6. `src/wearables/insights/wearable-insights.controller.ts`

## 🚨 HEADLINE FINDING TO INVESTIGATE FIRST — `as never` PATTERN

The builder used `as never` 9+ times in the spec files, including the double-cast pattern `as never as PrismaService` and `as never as AiApprovalService` (around lines 656–657 of `wearable-insights.controller.spec.ts`, plus `} as never;` at lines 80, 89, and `svc as never` ~5+ occurrences).

**This is an R0 violation.** The R0 ban list includes `as unknown as` as a forbidden type-laundering escape hatch. `as never as X` is **functionally identical** — `never` is the bottom type and assignable to anything, so `(x as never) as X` is exactly the same laundering operation as `(x as unknown) as X`. The builder used `as never` because they believed it was a loophole around the `as unknown as` grep; the spirit of R0 forbids it.

**Mandatory action in this audit:**

1. **Treat every `as never` usage as a P1 must-fix.** Mark each occurrence in the audit with file:line.
2. **Update the R0 grep going forward** to: 
   ```
   grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
   ```
   Note: includes both `as never as X` (double cast) **and** standalone `as never` (e.g. `} as never;`) since both are escape hatches.
3. **Document the prescribed R2 fix:** replace each occurrence with one of:
   - A proper typed test double using `jest.MockedClass` / `DeepMocked` / `createMock<PrismaService>()` from `@golevelup/ts-jest`
   - A minimal hand-rolled `Partial<X>` cast to the specific interface the method touches (still a cast, but typed — exposes which methods are being mocked)
   - `@ts-expect-error <one-line justification>` with a comment explaining why the mock can't satisfy the full interface
4. **Reject any R2 fixer attempt** that swaps `as never` for `as unknown as` — that is the explicitly banned pattern this audit was created to surface.

## DESIGN DECISION TO VERIFY (NOT a violation — but audit must validate)

`requester_id: null` on the approval row. The builder used this intentionally to bypass the self-approval guard in `AiApprovalService.decide()` — in this flow the coach is both submitter and decider, but the "submitter" is conceptually the AI (which has no user_id). The schema permits null (`String?` at `prisma/schema.prisma:2269`).

This is a **legitimate design tradeoff**, not a bug. Audit verdict required: VERIFY-AND-DOCUMENT (P3 in the worst case).

**Audit must confirm:**

1. `requester_id` column is genuinely `String?` (nullable) at the schema level — `grep -n 'requester_id' prisma/schema.prisma`.
2. `decided_by_id` is ALWAYS populated inside `AiApprovalService.decide()` from the authenticated principal (JWT/req.user), NEVER from the request body. Trace it. A spoofing-by-body bug here is P0.
3. The self-approval guard in `decide()` short-circuits cleanly on null requester (not via accidental NaN/undefined truthiness — verify the actual conditional).
4. Audit/observability consumers downstream tolerate `requester_id: null` without crashing or mis-bucketing.
5. A code comment OR ADR exists at the call site (`wearable-insights.controller.ts`, in the approve handler) explaining WHY `requester_id` is null. If missing, that's a P2 — leave a code comment in the R2 fixer brief.

## Worktree setup

```bash
cd /tmp
(cd /tmp/gpb-clone && git fetch origin && git worktree add /tmp/wt-hk6-audit-r1-code afbe84a900f4073ca8b8457c994acc2541c02c8e)
cd /tmp/wt-hk6-audit-r1-code
git checkout afbe84a900f4073ca8b8457c994acc2541c02c8e
ln -sfn /tmp/gpb-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal afbe84a900f4073ca8b8457c994acc2541c02c8e
```

## Mandatory training docs

1. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — full 50-Failures sweep (R65)
2. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — read for completeness but most categories are N/A for backend

## R0 ban scan (UPDATED grep)

```bash
cd /tmp/wt-hk6-audit-r1-code
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

Expected output: numerous `as never` hits. Capture them all verbatim in the audit.

## Endpoint correctness checks

### Auth
- Endpoint guarded by coach-auth (same guard as `GET /v1/wearables/insights/coach`). Verify the decorator/guard stack.
- `client_id` in body validated against coach's roster (coach can only approve for their own clients). If missing, P0.
- Rate limiting / abuse protection — N/A for now, but flag if absent comment.

### Request validation (Zod / DTO)
- `client_id` — required, UUID or whatever the schema uses
- `bucket` — required, enum of valid bucket names
- `draft_body` — required, ≤1000 chars (matches `suggested_message_draft` constraint)
- `action` — required, enum `approve|edit|reject`
- `.strict()` parsing — extra fields rejected
- Bad input → 400 with descriptive error, not 500

### Action semantics
- `approve` → materialise immediately as a Message row from coach to client; idempotency key tied to (coach_id, client_id, bucket, draft_hash) so a double-tap doesn't double-send
- `edit` → the body is the EDITED text; same materialisation path with the edited text recorded in audit
- `reject` → no Message row; approval row created with status=rejected, no draft materialised
- Each path returns the correct response shape `{status, draft_id, materialised_at}` — `materialised_at: null` is valid for `reject`

### Materialiser (`coach-wearable-message.materialiser.ts`)
- Capability string exactly `draft.coach_wearable_message` (matches the existing capability registry pattern)
- Claim/race/recovery mirrors `CoachMessageMaterializer` — verify by side-by-side diff
- Final status `'sent'` (builder noted this matches the live interface, not `'materialised'`). Confirm by reading the materialiser interface contract.
- On race (another worker already claimed): no double-send, returns gracefully
- On recovery (worker crashed mid-flight): idempotent retry

### Module wiring
- `coach-wearable-message.materialiser.ts` registered in `ai-gateway.module.ts` providers + exports
- `wearable-insights.controller.ts`'s approve handler can DI the materialiser (or the service that calls it)
- Circular dependency check — `npx madge --circular src/` or just confirm imports don't loop

### Transactional integrity
- Approve flow writes (approval row + message row + audit log) — are they in a single Prisma transaction? If not, a partial failure leaves an approval with no message or a message with no audit. P1 if not transactional, P0 if it can produce duplicate messages.

## 50-Failures sweep (R65)

Walk every category. Pay extra attention to:
- **#7 silent error swallowing** — search for catch blocks that don't rethrow or log
- **#19 stub implementations marked done** — does `reject` actually persist anything?
- **#22 missing edge case handling** — what if `bucket` doesn't have an outstanding draft for this client? What if the draft was already approved by another coach session?
- **#31 type assertions hiding bugs** — `as never` (the main finding)
- **#37 missing transaction boundaries** — covered above
- **#44 test-mocked-away behavior** — tests using `as never` to mock entire services may be asserting against mocks that don't reflect real behavior. Inspect each spec test: is it asserting on a real code path or on a mock's return value that's been hand-wired?

## Gates to run

```bash
cd /tmp/wt-hk6-audit-r1-code
npx tsc --noEmit 2>&1 | tail -30
npx eslint 'src/ai/gateway/**/*.ts' 'src/wearables/insights/**/*.ts' 2>&1 | tail -30
npx jest --testPathPattern='(coach-wearable-message|wearable-insights.controller)' --no-coverage --roots src test 2>&1 | tail -50
```

Tests must show 46/46 (or whatever the actual count). 17 pre-existing main failures (module-graph / openapi-spec / roles-enforced / scheduling) are KNOWN and not in scope — DO NOT chase them.

## Deliverable

Write to `/home/user/workspace/_audit_HK_6a_R1_code_GPT55.md`:

```
# HK-6a R1 Code Audit — GPT-5.5

**Head SHA verified:** afbe84a900f4073ca8b8457c994acc2541c02c8e
**Worktree:** /tmp/wt-hk6-audit-r1-code
**Verdict:** CLEAN | NEEDS_R2 | BLOCKED

## R0 ban scan (UPDATED grep)
<full output — expect as never hits>

## P0 findings
<list>

## P1 findings (must-fix)
- **`as never` pattern — R0 spirit violation**
  - <file:line> for each occurrence
  - Recommended fix: <DeepMocked / Partial<X> / @ts-expect-error>
<other P1s>

## P2 findings
<list — likely includes "add ADR-style code comment for requester_id: null">

## P3 findings
<list>

## requester_id: null design-decision validation
- Schema nullable? <YES/NO + line>
- decided_by_id sourced from JWT, never body? <YES/NO + evidence>
- Self-approval guard null-handling? <evidence>
- Downstream consumers null-tolerant? <evidence>
- Code comment / ADR present? <YES/NO>
- Verdict: ACCEPT | REQUIRE-DOCUMENTATION | REJECT

## Transactional integrity
- Approve flow atomic? <evidence>
- Idempotency key? <evidence>

## 50-Failures sweep
<table>

## Gate results
- tsc: PASS/FAIL <evidence>
- eslint: PASS/FAIL <evidence>
- jest: PASS/FAIL <X/Y>

## Recommended R2 fixer instructions
<concrete, file-and-line-level — MUST include "replace every `as never` with a typed test double; do NOT use `as unknown as`">
```

Do NOT commit fixes. Audit only.

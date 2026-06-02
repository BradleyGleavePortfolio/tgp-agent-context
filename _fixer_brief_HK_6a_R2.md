# HK-6a R2 Fixer Brief — Approval Endpoint + Coach Wearable Message Materialiser

**Fixer model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `growth-project-backend`
**PR:** #357
**Base SHA to start from (R55):** `afbe84a900f4073ca8b8457c994acc2541c02c8e`
**Worktree:** `/tmp/wt-hk6-backend` (existing builder worktree — reuse for fixes; R31/R32 only require auditor ≠ builder)
**Round:** R2
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>`

## Auditor verdict being resolved

**R1 code audit (GPT-5.5):** NEEDS_R2 — `/home/user/workspace/_audit_HK_6a_R1_code_GPT55.md`

Four P1 findings, no P0/blockers. `requester_id: null` ACCEPTED (schema nullable at `prisma/schema.prisma:2316`, `decided_by_id` JWT-sourced, self-approval guard null-handles cleanly, ADR-style code comment present at `wearable-insights.controller.ts:158-166`).

## Bradley R0 LAW (re-read — this PR has been bitten by it once)

- NO "Coming soon", NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, **NO `as never`**, **NO `as never as X`**, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed at narrow, unavoidable mock boundaries.
- **🚨 The HK-6a builder used `as never` 15 times.** R2 must eliminate every one. **Do NOT swap them to `as unknown as`** — that is the same banned laundering pattern. Replace with typed test doubles.
- Updated R0 grep (use this verbatim before commit):
  ```bash
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
  ```

## Files in scope

1. `src/wearables/insights/wearable-insights.controller.ts`
2. `src/wearables/insights/wearable-insights.controller.spec.ts`
3. `src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts` (only if transaction wrapping requires it)
4. `src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts`
5. `src/ai/gateway/ai-approval.service.ts` (only if transaction wrapping requires it — read carefully, it's shared by other capabilities; touching it has higher blast radius. If atomic wrap forces edits here, document why.)

**Do NOT touch:**
- `prisma/schema.prisma` — schema is correct; `requester_id` nullable was the documented decision
- `src/messaging/messaging.service.ts` — pre-existing, out of scope
- The 17 pre-existing main test failures (module-graph / openapi-spec / roles-enforced / scheduling)

## Mandatory fixes (P1)

### 1. Eliminate all 15 `as never` occurrences

The exact lines from the audit (every one must be removed):

**`coach-wearable-message.materialiser.spec.ts`:**
- L63: `} as never;` (PrismaService mock)
- L72: `{ sendAsCoach } as never` (MessagingService mock)

**`wearable-insights.controller.spec.ts`:**
- L50: service mock returned `as never`
- L54: request user cast `as never`
- L79: `as never as PrismaService` (double-cast)
- L80: `as never as AiApprovalService` (double-cast)
- L89, L152: `svc as never` (constructor args)
- L174, L186, L413, L432, L433, L446, L454: `svc as never, null as never, null as never`
- L432: `emptyInsight() as never` (mock return)

**Prescribed replacement patterns (pick the right one per site):**

**Pattern A — `DeepMocked<T>` / `createMock<T>()` from `@golevelup/ts-jest`** (preferred, idiomatic for Nest):
```ts
import { createMock, DeepMocked } from '@golevelup/ts-jest';

const prisma: DeepMocked<PrismaService> = createMock<PrismaService>();
const messaging: DeepMocked<MessagingService> = createMock<MessagingService>();
prisma.aiActionDraft.update.mockResolvedValue({/* typed shape */});
messaging.sendAsCoach.mockResolvedValue({ id: 'msg_1', sentAt: new Date() });
```

Verify `@golevelup/ts-jest` is already a dev dep (`cat package.json | grep golevelup`). If yes, use it everywhere. If no, **do not add it** — fall back to Pattern B.

**Pattern B — Narrow `Partial<X>` / `Pick<X, ...>` typed double** (acceptable, no new deps):
```ts
type ApprovalsDouble = Pick<AiApprovalService, 'decide'>;
const approvals: ApprovalsDouble = { decide: jest.fn() };
// Pass directly — no cast.
// If the controller constructor parameter type is wider, build a typed factory:
function makeController(overrides: {
  svc?: Partial<WearableInsightsService>;
  approvals?: Partial<AiApprovalService>;
  prisma?: Partial<PrismaService>;
} = {}) {
  return new WearableInsightsController(
    overrides.svc as WearableInsightsService,  // ← STILL a cast — see Pattern C
    overrides.approvals as AiApprovalService,
    overrides.prisma as PrismaService,
  );
}
```
**WARNING:** `as X` from a `Partial<X>` IS still a type assertion. Audit-spirit acceptable because (a) it's explicit about what's being narrowed, (b) the developer sees which methods are mocked, and (c) it's not the laundering `as never` / `as unknown as` pattern that hides every assumption. But if you prefer zero casts, use Pattern A + a small adapter.

**Pattern C — `@ts-expect-error <one-line justification>`** (last resort, only at unavoidable boundaries):
```ts
const ctrl = new WearableInsightsController(
  // @ts-expect-error test double — only insightsService.getCoach is exercised by this suite
  { getCoach: jest.fn() },
  // @ts-expect-error test double — approve path not exercised in this suite
  null,
  // @ts-expect-error test double — prisma not exercised in this suite
  null,
);
```
**Acceptable only when** the type bridge truly cannot be expressed in TS and a comment explains why. Prefer A or B.

**Recommended approach for this PR:**
- Add a single test-helper file `wearable-insights.controller.test-helpers.ts` (or extend an existing one) that exports a typed `makeController(overrides)` factory + typed `makePrismaDouble()` / `makeApprovalsDouble()` / `makeMessagingDouble()` builders. This collapses 10+ sites to one helper and makes the next round of test edits trivial.

**Tests must still pass after replacement** — 33/33 (per the auditor's actual run; the brief said 46 because the builder claimed it, but the auditor's verified count was 33). Verify final count.

### 2. Action enum: accept `reject` (currently `dismiss`)

**Finding:** `ApproveBodySchema` accepts `approve|edit|dismiss` and maps `dismiss → decision: 'rejected'`. The HK-6a contract says `approve|edit|reject`. Mobile clients will send `reject`.

**Fix:** Update the Zod schema to accept `approve | edit | reject`. Map `reject → decision: 'rejected'`. Update tests to use `reject`.

**Backward compatibility:** No mobile client has shipped this yet (HK-5b is the consumer and it's open). No backward-compat needed. Remove `dismiss` entirely — do not accept both.

Specifically:
```ts
// src/wearables/insights/wearable-insights.controller.ts:74
const ApproveBodySchema = z.object({
  client_id: z.string().uuid(),
  bucket: z.enum([/* existing buckets */]),
  draft_body: z.string().trim().min(1).max(1000),
  action: z.enum(['approve', 'edit', 'reject']),  // ← was 'dismiss'
}).strict();
```

And at the action dispatch site (`:196`):
```ts
const decision = body.action === 'reject' ? 'rejected'
  : body.action === 'edit' ? 'approved_edited'
  : 'approved';
```
(Use whatever the existing decision-enum values are — read `AiApprovalService.decide()` for the canonical names.)

Update controller spec test cases that exercised `dismiss` → exercise `reject` with the identical expected `decision: 'rejected'` outcome.

### 3. Reject response: separate `decided_at` from `materialised_at`

**Finding:** Reject path returns `decided_at` in the `materialised_at` slot. Two different concepts conflated.

**Fix:** Two options — pick the one the mobile contract actually wants.

**Option A (preferred — clean contract):** Make `materialised_at: string | null` in the response Zod schema. Return `null` for `reject` (nothing was materialised). Return the actual materialisation timestamp for `approve` / `edit`. Mobile's HK-5b consumer already handles nullable timestamps elsewhere.

**Option B:** Add a separate `decided_at: string` field, always populated; keep `materialised_at: string | null` strictly for actual materialisation. More fields = more truth = better contract.

Use **Option A** unless the mobile contract requires `decided_at` for analytics. Update:
- The response schema in `wearable-insights.controller.ts` (around L81-85)
- The `approve` handler return shape (around L209-223)
- The controller spec — assert `materialised_at: null` for the `reject` case, ISO string for `approve` / `edit`

### 4. Transactional integrity: wrap approve flow in `$transaction` (or document why it can't be)

**Finding:** Draft create → materialiser claim → message send → ref update → status flip → audit update → audit log are 7+ separate writes, not atomic.

**Fix:** Two acceptable paths.

**Path A (preferred — true atomicity, scoped to what we control):**
Use Prisma's interactive transaction to wrap the writes WE control:
```ts
await prisma.$transaction(async (tx) => {
  const draft = await tx.aiActionDraft.create({ /* ... */ });
  await materialiser.run({ draft, tx });  // ← materialiser accepts tx
  await approvals.decide({ draftId: draft.id, decider, decision, tx });
  // audit log
});
```

This requires the materialiser and `AiApprovalService.decide()` to accept an optional `tx: Prisma.TransactionClient`. Read both — if they already accept it, wire it through. If they don't:
- For the materialiser (NEW in this PR — totally fair game): change its signature to accept `tx?: Prisma.TransactionClient` and use `tx ?? this.prisma`
- For `AiApprovalService.decide()` (SHARED — touch carefully): same — add an optional `tx` parameter that defaults to `this.prisma`. Existing callers passing no `tx` continue to work.

**Hard limit:** `MessagingService.sendAsCoach` is OUT of the transaction. It has side effects (notifications, push) that cannot be rolled back. This is expected — the materialiser pattern is "do the side effect, then record success." Document this with a code comment:
```ts
// MessagingService.sendAsCoach is intentionally OUTSIDE the transaction:
// it produces external side-effects (push notifications) that cannot be
// rolled back. The materialiser uses materialised_ref as the committed-
// success marker; on partial failure (message sent, status flip lost),
// the recovery path detects the existing materialised_ref and treats the
// approval as committed. See materialiser race/recovery flow.
```

**Path B (acceptable — document why not):**
If wiring `tx` through `AiApprovalService.decide()` has prohibitive blast radius (e.g. it's called by 5+ other capabilities and changing the signature would require touching them), document this in a code comment at the approve handler and add **two compensating recovery tests**:
1. Simulated mid-flight crash AFTER `MessagingService.sendAsCoach` succeeds but BEFORE status flip — re-running the approval should detect the existing `materialised_ref` and not double-send
2. Simulated crash AFTER status flip but BEFORE audit log — re-running should be a no-op (idempotent)

**Recommendation:** Try Path A first. The materialiser is new; threading `tx` through it is trivial. `AiApprovalService.decide()` is the only shared touch — if its callers number ≤3 and changes are mechanical, do it. If it's a 10-file refactor, fall back to Path B.

## Recommended fixes (P2)

### 5. Update Jest command spelling

`--testPathPattern` was renamed to `--testPathPatterns` (plural) in current Jest. The audit brief used the old spelling. Update the **fixer result doc** to use the plural form. No code change. Also note this in the next round's audit briefs going forward.

## Polish (P3)

- **P3-a:** Pre-existing ESLint warning at `src/ai/gateway/ai-gateway.controller.ts:52:30` (unused `req`). Not HK-6a's. Leave.
- **P3-b:** Backend doesn't apply mobile design intel categories. N/A.

## Workflow

```bash
cd /tmp/wt-hk6-backend
git rev-parse HEAD  # MUST equal afbe84a900f4073ca8b8457c994acc2541c02c8e
# Check if @golevelup/ts-jest is already a dev dep:
grep -c '@golevelup/ts-jest' package.json
# ... make all changes ...

# Gates BEFORE commit:
npx tsc --noEmit 2>&1 | tail -10
npx eslint 'src/ai/gateway/**/*.ts' 'src/wearables/insights/**/*.ts' 2>&1 | tail -10
# Use --testPathPatterns (plural) for current Jest:
npx jest --testPathPatterns='(coach-wearable-message|wearable-insights.controller)' --no-coverage --roots src test 2>&1 | tail -30

# R0 ban scan on ADDED lines (MUST be empty — this is what we're here to fix):
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'

# Commit (ONE commit):
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "fix(wearables): HK-6a R2 — eliminate as-never, reject action, atomic approve flow, null materialised_at on reject"
git push origin HEAD:hk/PR-HK-6-approval-backend
```

## Deliverable

Write `/home/user/workspace/_fixer_result_HK_6a_R2.md`:

```
# HK-6a R2 Fixer Result

**Base SHA:** afbe84a900f4073ca8b8457c994acc2541c02c8e
**New HEAD SHA (40-char):** <SHA>
**Files changed:** <list>
**Total +/- lines:** <stats>

## Fixes applied

### P1-1: `as never` elimination
- Pattern used: <A: DeepMocked | B: Partial+factory | C: @ts-expect-error>
- @golevelup/ts-jest available? <YES/NO>
- All 15 occurrences removed? <YES with file:line each — paste R0 grep showing empty output>
- New test helper added? <path or N/A>

### P1-2: Action enum reject
- `dismiss` removed, `reject` added? <evidence>
- Tests updated? <evidence>

### P1-3: Reject response semantics
- Option taken: A (nullable materialised_at) | B (separate decided_at)
- Schema updated? <evidence>
- Tests assert null/non-null correctly? <evidence>

### P1-4: Transactional integrity
- Path taken: A (true $transaction) | B (compensating recovery tests + comment)
- Materialiser accepts tx? <evidence>
- AiApprovalService.decide accepts tx? <evidence with blast-radius note>
- Recovery tests added (Path B only)? <evidence>

## Gates
- tsc: PASS
- eslint: PASS (with the one pre-existing unused-req warning)
- jest: PASS X/Y (use --testPathPatterns spelling)

## R0 ban scan output
<grep output — MUST BE EMPTY>

## Deviations from brief
<list>

## Risks for R2 audit
<call out anything the auditor should double-check, especially around the transaction>
```

Do NOT merge. Push only. Then R2 code audit (fresh worktree, R31/R32).

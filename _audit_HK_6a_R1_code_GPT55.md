# HK-6a R1 Code Audit — GPT-5.5

**Head SHA verified:** afbe84a900f4073ca8b8457c994acc2541c02c8e  
**Worktree:** /tmp/wt-hk6-audit-r1-code  
**Verdict:** NEEDS_R2

## R0 ban scan (UPDATED grep)

Command run exactly on added `src/**` lines:

```text
80:+  } as never;
89:+  const service = { sendAsCoach } as never;
656:+  } as never as PrismaService;
657:+  const approvals = { decide } as never as AiApprovalService;
666:+    svc as never,
673:+        svc as never,
677:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
678:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
893:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
894:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
895:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
896:+      const ctrl = new WearableInsightsController(svc as never, null as never, null as never);
```

## P0 findings

None found in the audited diff.

## P1 findings (must-fix)

- **`as never` pattern — R0 spirit violation.** `as never` and especially `as never as X` are type-laundering escape hatches functionally equivalent to the banned `as unknown as` pattern. Every occurrence below must be removed in R2:
  - `src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts:63` — `} as never;` for a PrismaService mock. Recommended fix: `createMock<PrismaService>()` / `DeepMocked<PrismaService>` with `aiActionDraft.updateMany/update/findUnique` typed, or a named `Partial<PrismaService>` test double documenting the touched methods.
  - `src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts:72` — `{ sendAsCoach } as never` for a MessagingService mock. Recommended fix: `createMock<MessagingService>()` / `DeepMocked<MessagingService>`, or a named `Partial<MessagingService>` containing only `sendAsCoach`.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:50` — service mock returned `as never`. Recommended fix: use `jest.Mocked<Pick<WearableInsightsService, ...>>` without a cast, or use `createMock<WearableInsightsService>()`.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:54` — request user cast `as never`. Recommended fix: return a typed request helper using the minimal fields read by the controller, or add a targeted `@ts-expect-error` with a one-line justification that the test request intentionally omits unused Prisma `User` fields.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:79` — `as never as PrismaService` double-cast. Recommended fix: replace with `DeepMocked<PrismaService>` or a named `Partial<PrismaService>` / `Pick<PrismaService, 'aiActionDraft'>` double with only `create` exposed.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:80` — `as never as AiApprovalService` double-cast. Recommended fix: `DeepMocked<AiApprovalService>` or a named `Partial<AiApprovalService>` containing `decide`.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:89` — constructor argument `svc as never`. Recommended fix: centralize controller construction behind a typed helper that accepts a `DeepMocked<WearableInsightsService>` or `Partial<WearableInsightsService>`.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:152` — constructor argument `svc as never`. Same fix as line 89.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:174` — `svc as never, null as never, null as never`. Recommended fix: pass typed no-op approval/prisma doubles instead of laundering nulls.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:186` — `svc as never, null as never, null as never`. Same fix as line 174.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:413` — `svc as never, null as never, null as never`. Same fix as line 174.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:432` — `emptyInsight() as never` for mock resolution. Recommended fix: type the mocked return value as the service method's actual return type or use `mockResolvedValue(emptyInsight())` after typing `generateForClient` correctly.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:433` — `svc as never, null as never, null as never`. Same fix as line 174.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:446` — `svc as never, null as never, null as never`. Same fix as line 174.
  - `src/wearables/insights/wearable-insights.controller.spec.ts:454` — `svc as never, null as never, null as never`. Same fix as line 174.
- **Approval action contract mismatch.** The audit brief says the endpoint body action enum is `approve|edit|reject`, but `ApproveBodySchema` accepts `approve|edit|dismiss` and maps only `dismiss` to `decision: 'rejected'` (`src/wearables/insights/wearable-insights.controller.ts:74`, `:196`). Clients following the briefed API cannot reject a draft. R2 must either change the backend schema/tests to `reject` or explicitly document and reconcile a deliberate cross-stack contract change; do not leave the endpoint silently divergent from the stated HK-6a contract.
- **Reject response materialisation semantics mismatch.** The brief allows `materialised_at: null` for reject, but the implementation requires a string and returns `decided_at` for dismiss/reject (`src/wearables/insights/wearable-insights.controller.ts:81-85`, `:209-223`). This conflates decision time with materialisation time. R2 should either make `materialised_at` nullable for the rejected branch or rename/add a separate decision timestamp if the mobile contract needs a non-null timestamp.
- **Approval/message/audit writes are not atomic.** The approve flow creates the draft, materialises by calling `MessagingService.sendAsCoach`, records `materialised_ref`, flips draft status, updates any linked `AiRequestAudit`, and writes an `AuditLog` in separate operations (`src/wearables/insights/wearable-insights.controller.ts:167-207`; `src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts:151-197`; `src/ai/gateway/ai-approval.service.ts:244-299`). This preserves idempotency under common races but does not satisfy the brief's “single Prisma transaction” check; a mid-sequence failure can leave a pending draft with a sent message or a status flip with a missing follow-on audit update. R2 should add a transaction-aware path or document why existing MessagingService side effects cannot be transactionally composed and add compensating recovery/monitoring tests.

## P2 findings

- **Required Jest command is stale for this repo's Jest version.** The exact required command with `--testPathPattern` fails before tests run because Jest replaced it with `--testPathPatterns`. I ran the equivalent current spelling to get a useful signal, and it passed 33/33; R2/CI docs should update the command spelling.

## P3 findings

- **Targeted ESLint gate has one pre-existing warning outside the HK-6a files.** `src/ai/gateway/ai-gateway.controller.ts:52:30` has an unused `req` warning. No errors, and not an HK-6a blocker.
- **Mobile app design intelligence training categories are mostly N/A.** Backend API path does apply cognitive-load/contract principles: the action naming and response timestamp semantics should be made unsurprising for mobile callers.

## requester_id: null design-decision validation

- Schema nullable? **YES.** `AiActionDraft.requester_id` is `String?` at `prisma/schema.prisma:2316`; `AiRequestAudit.requester_id` is also nullable at `prisma/schema.prisma:2269`.
- `decided_by_id` sourced from JWT, never body? **YES for this endpoint.** `ApproveBodySchema` contains only `client_id`, `bucket`, `draft_body`, and `action` (`src/wearables/insights/wearable-insights.controller.ts:63-76`); `approveInsight` passes `decider: { id: req.user.id, role: req.user.role }` to `AiApprovalService.decide()` (`:197-200`); `AiApprovalService.decide()` persists `decided_by_id: input.decider.id` (`src/ai/gateway/ai-approval.service.ts:244-249`).
- Self-approval guard null-handling? **YES.** The guard is `if (draft.requester_id && draft.requester_id === input.decider.id)`, so a null requester short-circuits cleanly without matching the decider (`src/ai/gateway/ai-approval.service.ts:86-94`).
- Downstream consumers null-tolerant? **YES for this capability and observed consumers.** The wearable materialiser sends from `tenant_coach_id`, explicitly not `requester_id` (`src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts:76-81`, `:121-128`, `:164-168`); the approval audit metadata can carry `requester_id: null` (`src/ai/gateway/ai-approval.service.ts:283-299`); RLS update policy explicitly permits null requester via `requester_id IS NULL OR requester_id <> current_user_id()` (`prisma/migrations/20260607000000_rls_remaining_gaps/migration.sql:199-210`). Other materialisers such as assign-workout/meal-plan/send-notification reject missing requester_id, but they are different capabilities and are not used for `draft.coach_wearable_message`.
- Code comment / ADR present? **YES.** The approve handler has an ADR-style inline comment explaining why `requester_id` is intentionally null and why the tenant boundary + coach-owns-client check remain the authz controls (`src/wearables/insights/wearable-insights.controller.ts:158-166`).
- Verdict: **ACCEPT.** The null requester design is valid as implemented and documented for this capability.

## Transactional integrity

- Approve flow atomic? **NO.** Draft creation, materialiser claim, `coachMessage.create`, `materialised_ref` update, draft decision update, audit-status update, and audit write are separate calls, not a single Prisma transaction (`src/wearables/insights/wearable-insights.controller.ts:167-207`; `src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts:151-197`; `src/ai/gateway/ai-approval.service.ts:244-299`).
- Idempotency key? **Partial.** The materialiser uses `AiActionDraft.materialised_at` as a claim marker and `materialised_ref` as the committed-success marker (`src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts:82-89`, `:151-197`), but `MessagingService.sendAsCoach` itself does not accept a caller-supplied idempotency key and creates `coachMessage` directly (`src/messaging/messaging.service.ts:397-443`). The sibling materialiser already notes this limitation for coach messages (`src/ai/gateway/materialisers/coach-message.materialiser.ts:70-81`).

## 50-Failures sweep

| # | Category | Result |
|---:|---|---|
| 1 | Hardcoded secrets/API keys | No new secrets found in audited diff. |
| 2 | Missing RLS | No schema/RLS table addition in diff; existing RLS policy tolerates null requester. |
| 3 | SQL injection | No raw SQL added. |
| 4 | XSS | Backend-only; no rendered HTML added. |
| 5 | IDOR | Pass: approve calls `assertCoachOwnsClient` before draft creation. |
| 6 | Missing rate limiting | Pass: approve handler has `@Throttle` with coach-AI limiter. |
| 7 | Weak JWT config | N/A; endpoint uses existing `JwtAuthGuard`/`CoachGuard`. |
| 8 | Missing input validation | Pass except action-name mismatch: strict Zod body schema, UUID, enum, length, whitespace rejection. |
| 9 | Privilege escalation | Pass: roles/guards plus service tenant boundary. |
| 10 | Unverified dependencies | No dependency changes audited. |
| 11 | CORS | N/A. |
| 12 | Secrets in errors | No secret-bearing errors added. |
| 13 | HTTPS enforcement | N/A. |
| 14 | Layering | Acceptable: controller orchestrates validation/create/decide; materialisation in service. |
| 15 | Over-specific code | Acceptable for one capability, mirrors existing materialiser pattern. |
| 16 | Avoidance of refactors | Acceptable; reused registry/materialiser pattern. |
| 17 | Fake test coverage | Tests assert key paths, but `as never` mocks weaken type-realism. |
| 18 | Environment parity | N/A. |
| 19 | API versioning | Pass: `/v1/wearables/insights/approve`. |
| 20 | Circular dependencies | No obvious import loop; AiGatewayModule remains global and InsightsModule relies on globals. |
| 21 | N+1 queries | N/A; no list loop added. |
| 22 | Missing DB indexes | No schema query/index changes; existing draft indexes present. |
| 23 | No pagination | N/A. |
| 24 | Sync/blocking operations | No blocking filesystem/CPU work added. |
| 25 | No caching | N/A for mutation endpoint. |
| 26 | Media optimization | N/A. |
| 27 | Polling vs realtime | Materialiser has bounded DB polling only for race recovery; acceptable. |
| 28 | Race conditions | Mostly handled by conditional update/claim/ref flow, but not fully transactionally atomic. |
| 29 | Missing idempotency | Partial: draft-level claim exists; no DB idempotency key on `coachMessage`. |
| 30 | Optimistic UI rollback | Backend-only N/A. |
| 31 | Stale closures | N/A. |
| 32 | Unmount cleanup | N/A. |
| 33 | Error boundaries | N/A. |
| 34 | Observability | Partial: audit writes and logs exist; transaction gaps need monitoring/recovery tests. |
| 35 | API timeouts | N/A; no external HTTP call added in this diff. |
| 36 | Swallowed errors | Existing best-effort `.catch(() => undefined)` in `AiApprovalService` appears in added-line grep only if touched? In audited new materialiser rollback catch logs; no empty catch added in HK-6a files. |
| 37 | Health checks | N/A. |
| 38 | Comments everywhere | Comments are heavy but mostly explain non-obvious race/auth decisions. |
| 39 | Textbook patterns | Registry reuse acceptable. |
| 40 | Repeated bugs | Action naming mismatch is localized to controller/spec. |
| 41 | Reimplementing libraries | Uses Zod/Prisma rather than custom validators/SQL. |
| 42 | Over-engineering impossible edges | Race handling is justified by approval/materialisation idempotency. |
| 43 | Dead code | No dead provider found; module wiring used. |
| 44 | No DB transactions | **Fail/P1:** multi-step mutation is not a single transaction. |
| 45 | Missing soft deletes | N/A. |
| 46 | DB-layer validation | No new DB constraints; app-level Zod validation covers request/payload. |
| 47 | Backup/recovery | N/A. |
| 48 | CI/CD | Gates run locally; CI not audited. |
| 49 | Environment-specific code | No env-specific production code added. |
| 50 | Graceful degradation | Materialisation failure leaves draft pending and surfaces retry; audit write is best-effort. |

## Gate results

- tsc: **PASS**. `npx tsc --noEmit` exited 0; log was empty.
- eslint: **PASS with warning**. `npx eslint 'src/ai/gateway/**/*.ts' 'src/wearables/insights/**/*.ts'` exited 0 with one warning in `src/ai/gateway/ai-gateway.controller.ts:52:30`.
- jest: **Required command FAILS before running tests** because `--testPathPattern` has been replaced by `--testPathPatterns` in this Jest version. Equivalent current command passed: **2/2 suites, 33/33 tests** for `coach-wearable-message` and `wearable-insights.controller`.

## Recommended R2 fixer instructions

1. Replace every `as never` and `as never as X` listed above with typed test doubles. Preferred: `DeepMocked<T>` / `createMock<T>()` from `@golevelup/ts-jest`; acceptable: narrowly-scoped `Partial<X>` / `Pick<X, ...>` test doubles that expose exactly the methods the test touches; last resort: `@ts-expect-error <one-line justification>` at the specific unavoidable mock boundary.
2. Do **not** swap `as never` to `as unknown as`; `as unknown as` is explicitly banned and is the same laundering pattern this audit is flagging.
3. Fix the approve action contract: accept the briefed `reject` action and map it to `decision: 'rejected'`; only support `dismiss` if there is a documented backward-compatibility requirement and tests cover both names.
4. Fix rejected response semantics: make `materialised_at` nullable for rejected drafts or return a separate `decided_at` field so the API does not label rejection time as materialisation time.
5. Address transactional integrity: either compose draft/message/status/audit changes in a transaction-aware path or document why `MessagingService.sendAsCoach` cannot be transaction-bound, then add recovery/monitoring tests for partial states such as pending-with-message and approved-without-audit-status.
6. Update the Jest command in the audit/CI documentation from `--testPathPattern` to `--testPathPatterns` for this repo's current Jest version.

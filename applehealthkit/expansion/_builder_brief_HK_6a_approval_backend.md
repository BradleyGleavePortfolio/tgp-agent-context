# HK-6a Builder Brief — Approval Workflow (Backend)

**Phase:** 2c (backend)
**PR target:** `hk/PR-HK-6-approval-backend` (worktree at `/tmp/wt-hk6-backend`, base = backend `main` = `e49ae5ae2e0320ffcc73f5719dde555452c1f86b`)
**Model:** Opus 4.8 (Sonnet 4.6 FORBIDDEN)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`.

## Bradley R0 LAW (verbatim)

- NO "Coming soon" anywhere in the diff — production, comments, **test titles**, **test regex assertions**, docblocks.
- NO `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as` / `.catch(()=>undefined)` / `catch(e){}` / spinner-only empty states.
- `@ts-expect-error` with justification IS allowed.

## Mandatory reads

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/applehealthkit/UNIFIED_BUILD_PLAN.md`
- `/tmp/tgp-agent-context/applehealthkit/AGENT_2_CODING_PLAN.md` §"PR-HK-6"

R55 — pin reference SHAs to 40 chars.
R65 — full 50-Failures sweep before READY_FOR_AUDIT.

---

## Existing infra you REUSE (DO NOT rewrite)

- `AiApprovalService.decide({ draftId, decider, decision, note?, ip?, userAgent? })` — owns the row-level lock, status flip, audit log, materialiser dispatch, IDOR boundary. **Do NOT re-implement any of this.**
- `CapabilityMaterializerRegistry` + the `CAPABILITY_MATERIALIZERS` multi-provider token. **Register your new materialiser in `AiGatewayModule` providers list.**
- `MessagingService.sendAsCoach(coachId, clientId, payload | string)` — the side-effect sink for "approve". Same call CoachMessageMaterializer uses.
- `AuditService` — already invoked by `AiApprovalService.decide`; you do not call it directly.
- Throttler (`THROTTLER_NAMES`), Auth (`JwtAuthGuard`, `CoachGuard`, `RolesGuard`, `Roles` decorator) — reuse the same patterns as `WearableInsightsController`.
- `AiActionDraft` Prisma model — already exists; your materialiser writes to `materialised_at` + `materialised_ref` columns just like `CoachMessageMaterializer`.

## Mobile contract (ALREADY shipped — backend must match)

Mobile sends:
```
POST /v1/wearables/insights/approve
Content-Type: application/json
Authorization: Bearer <coach-jwt>

{
  "client_id": "<uuid>",
  "bucket": "HEALTH_FITNESS" | "SLEEP_RECOVERY",
  "draft_body": "<string, may equal or differ from suggested_message_draft>",
  "action": "approve" | "edit" | "dismiss"
}
```

Mobile expects response (discriminated union by `status`):
```
{ "status": "ok", "draft_id": "<uuid>", "materialised_at": "<ISO-8601 string>" }
```
OR (only valid pre-HK-6, will be obsolete once backend lands):
```
{ "status": "not_implemented", "message": "<string>" }
```

Once this PR ships, the `not_implemented` branch becomes dead code on mobile — HK-6b will remove it.

**Action semantics:**
- `approve` — coach accepted the suggested_message_draft verbatim. Send the message via `MessagingService.sendAsCoach`. `draft_body` == coach AI's `suggested_message_draft`.
- `edit` — coach edited the body before approving. Send the (edited) `draft_body`. Same downstream side-effect as `approve` from the backend's POV — only the recorded body differs. (We do NOT need a separate audit event class — the `note` field on the decision captures "edited" if you want, but it's optional.)
- `dismiss` — coach declined. NO message sent. Draft rejected. Audit row written. Response shape is the SAME `{ status: 'ok', draft_id, materialised_at }` — `materialised_at` for dismissed drafts is the rejection timestamp (the moment the decision was recorded). This keeps the mobile-facing contract uniform.

---

## Scope — what HK-6a builds (backend)

### Files to ADD

1. **`src/ai/gateway/materialisers/coach-wearable-message.materialiser.ts`** — sibling to `coach-message.materialiser.ts` with capability `'draft.coach_wearable_message'`. Same idempotency + claim/recovery pattern. Payload schema differs.
2. **`src/ai/gateway/materialisers/coach-wearable-message.materialiser.spec.ts`** — full materialiser unit test suite mirroring `coach-message.materialiser.spec.ts` if it exists; otherwise build a comprehensive one (see required tests below).
3. **(Re-uses)** `src/wearables/insights/wearable-insights.controller.ts` — ADD a new `@Post('approve')` handler.
4. **(Re-uses)** `src/wearables/insights/wearable-insights.controller.spec.ts` — extend with approve-endpoint tests.
5. **(Re-uses)** `src/ai/gateway/ai-gateway.module.ts` — register the new materialiser in the `CAPABILITY_MATERIALIZERS` factory + providers list.
6. **(Re-uses)** `src/wearables/insights/insights.module.ts` — import the new things it needs (`AiApprovalService`, the new materialiser is registered at AiGatewayModule and resolved via the registry — so the controller just needs `AiApprovalService` + `PrismaService` injection).

### Files to NOT TOUCH

- `ai-approval.service.ts` — leave alone. The `decide()` flow already routes through the registry.
- `ai-gateway.controller.ts` — the PATCH /drafts/:id endpoint stays; we are intentionally adding a wearables-specific endpoint so mobile's contract is exact.
- `coach-message.materialiser.ts` — leave alone. Your new materialiser is a sibling.
- `insight-output.schema.ts`, `wearable-insights.service.ts` — leave alone.

---

## Component contracts

### A. `coach-wearable-message.materialiser.ts`

```ts
export const COACH_WEARABLE_MESSAGE_CAPABILITY = 'draft.coach_wearable_message';

export const CoachWearableMessagePayloadSchema = z
  .object({
    clientId: z.string().uuid(),
    bucket: z.nativeEnum(WearableMetricBucket),    // HEALTH_FITNESS | SLEEP_RECOVERY
    body: z
      .string()
      .min(1)
      .max(1000)                                    // matches insight-output suggested_message_draft max
      .refine((s) => s.trim().length > 0),
  })
  .strict();

export function assertCoachWearableMessagePayload(raw: unknown): CoachWearableMessagePayload {
  return CoachWearableMessagePayloadSchema.parse(raw);
}

@Injectable()
export class CoachWearableMessageMaterializer implements CapabilityMaterializer {
  readonly capability = COACH_WEARABLE_MESSAGE_CAPABILITY;
  // ... constructor injects PrismaService + MessagingService (same as CoachMessageMaterializer)
  // ... canHandle, materialize identical to CoachMessageMaterializer EXCEPT
  //     the payload validator + the MessagingService.sendAsCoach call signature.
}
```

**Implementation rules:**
- Mirror `CoachMessageMaterializer`'s claim/race/recovery pattern verbatim — copy it, then swap the payload validator and the sendAsCoach call. **DO NOT** reinvent the idempotency state machine; it is hard-won and audited.
- `materialize()` returns `MaterializeResult` (`{ status: 'materialised' | 'already_materialised' | 'racing', ref }`).
- The `materialised_ref` value should be the `id` of the resulting `coach_messages` row that `sendAsCoach` returns (same as `CoachMessageMaterializer`).
- Validate payload at materialise time (defence-in-depth); throw on drift.
- Logger name = class name.

### B. `wearable-insights.controller.ts` — new POST endpoint

```ts
const ApproveBodySchema = z.object({
  client_id: z.string().uuid(),
  bucket: z.nativeEnum(WearableMetricBucket),
  draft_body: z.string().min(1).max(1000).refine((s) => s.trim().length > 0),
  action: z.enum(['approve', 'edit', 'dismiss']),
});

const ApproveResponseShape = z.object({
  status: z.literal('ok'),
  draft_id: z.string().uuid(),
  materialised_at: z.string(),  // ISO-8601 — toISOString()
});
type ApproveResponseShape = z.infer<typeof ApproveResponseShape>;

@Roles('coach', 'owner')
@UseGuards(JwtAuthGuard, CoachGuard)
@Throttle({ [THROTTLER_NAMES.COACH_AI_GENERATION]: { ttl: 3_600_000, limit: 60 } })
@Post('approve')
async approveInsight(
  @Request() req: AuthedRequest,
  @Body() rawBody: unknown,
): Promise<ApproveResponseShape>
```

**Endpoint flow:**

1. Parse body with `ApproveBodySchema` (`parseOrThrow` helper or new equivalent — re-use the existing helper from the same file).
2. Assert coach-owns-client (re-use `this.svc.assertCoachOwnsClient(req.user.id, body.client_id, req.user.role)`).
3. **Create the AiActionDraft directly** (the gateway-`invoke` path is for LLM-generated drafts; this draft is **human-validated input that already has a body**, so we skip the gateway):
   ```ts
   const draft = await this.prisma.aiActionDraft.create({
     data: {
       capability: COACH_WEARABLE_MESSAGE_CAPABILITY,
       status: 'pending',
       requester_id: req.user.id,
       subject_user_id: body.client_id,
       tenant_coach_id: req.user.id,             // coach is the tenant (matches CoachMessageMaterializer semantics)
       payload: { clientId: body.client_id, bucket: body.bucket, body: body.draft_body } as Prisma.InputJsonValue,
       rationale: `Approved from wearable insight (bucket=${body.bucket}, action=${body.action})`,
       redacted_inputs: {} as Prisma.InputJsonValue,
       provenance: [{ source: 'wearable_insight_approve', bucket: body.bucket, action: body.action }] as unknown as Prisma.InputJsonValue,
       expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
     },
   });
   ```
4. Then dispatch on `action`:
   - `approve` or `edit` → `await this.approvals.decide({ draftId: draft.id, decider: { id: req.user.id, role: req.user.role }, decision: 'approved', note: body.action === 'edit' ? 'Coach edited body before approve' : undefined, ip: extractIp(req), userAgent: extractUserAgent(req) })`. Read back the draft row to get `materialised_at`.
   - `dismiss` → same decide but `decision: 'rejected'`. The materialiser is not called; the draft is just flipped to `rejected`. Read back the row.
5. Return `{ status: 'ok', draft_id: draft.id, materialised_at: <fresh.materialised_at?.toISOString() ?? fresh.decided_at?.toISOString() ?? new Date().toISOString()> }`. Field name on the wire is `materialised_at` regardless of `approve` vs `dismiss` (mobile contract).
6. Validate the response with `ApproveResponseShape.parse(...)` for defence-in-depth before returning (same pattern as `getCoachInsight`).

**Error handling:**
- Re-use Nest exception filters; `AiApprovalService.decide` already throws `NotFoundException` / `ConflictException` / `ForbiddenException` etc. — let those propagate. Do not catch-and-rewrap.
- Validation errors via Zod → wrap with `BadRequestException` using `parseOrThrow` helper.
- NO empty-catch, NO `.catch(()=>undefined)`.

### C. `ai-gateway.module.ts` — register the new materialiser

Add to providers:
```ts
CoachWearableMessageMaterializer,
```
Add it to the `CAPABILITY_MATERIALIZERS` factory inputs (same pattern as existing entries — add to both the `inject` list and the returned array).

### D. `insights.module.ts` — ensure controller can resolve dependencies

`AiApprovalService` is exported from the global `AiGatewayModule`, so no import change needed. `PrismaService` is global. Should be a NO-OP edit; double-check the controller compiles with no module change required. If the controller injects `AiApprovalService` and it doesn't resolve, add `imports: [AiGatewayModule]` — but `@Global()` should make it unnecessary.

---

## Required tests

### `coach-wearable-message.materialiser.spec.ts`

Mirror the rigour of `coach-message.materialiser.spec.ts` (read it for fixtures + structure). Cover:

1. `canHandle` returns true for `'draft.coach_wearable_message'`, false for others.
2. `materialize` happy path → sends message via `sendAsCoach(coachId, clientId, body)`, sets `materialised_ref` = sent message id, returns `{ status: 'materialised', ref }`.
3. Already-materialised → returns `{ status: 'already_materialised', ref: <existing ref> }` without calling sendAsCoach.
4. STUCK-CLAIM (claim held by crashed prior attempt: `materialised_at != null, materialised_ref == null`) → race-loser path polls + recovers (mirror `CoachMessageMaterializer`'s poll loop).
5. Concurrent decide-reject during claim → claim's `count = 0` (status now `rejected`); race-loser path falls through correctly and we surface `racing` (NOT `materialised`).
6. Payload-validation drift (e.g. `body` whitespace-only) → throws `ZodError`. No side-effect emitted.
7. Missing `tenant_coach_id` → throws Error. No side-effect emitted.

### `wearable-insights.controller.spec.ts` — new test cases

Add (extend existing file; do NOT break existing tests):

1. POST /approve with `action: 'approve'` → 200; response shape `{ status: 'ok', draft_id, materialised_at }`. Mock `AiApprovalService.decide` to set `materialised_at`. Assert the body is validated against `ApproveResponseShape`.
2. POST /approve with `action: 'edit'` → 200; same shape; the persisted draft payload `body` equals the edited body (NOT the original suggested_message_draft).
3. POST /approve with `action: 'dismiss'` → 200; same shape; no materialiser dispatch; draft status is `rejected`.
4. POST /approve with malformed body (e.g. missing `bucket`) → 400 BadRequest with Zod issues.
5. POST /approve where `client_id` is not coach-owned → 403/404 (whatever `assertCoachOwnsClient` throws).
6. POST /approve with `draft_body = "   "` (whitespace) → 400 (BodySchema's `refine` catches it).
7. POST /approve with body length > 1000 → 400.
8. POST /approve as a non-coach (e.g. user role) → guard rejects with 403 (existing `@Roles('coach','owner')` + `CoachGuard`).
9. Throttler — sanity check the decorator is in place (one assertion that the metadata exists; full rate-limit integration is out of scope).

### Hygiene

ONE positive test that a successful approve returns the expected `status: 'ok'` literal — **do not** add any `expect(...).not.toMatch(/coming soon/i)` regex guards. R0 enforcement happens via the grep sweep on the diff.

---

## Quality gates BEFORE reporting READY_FOR_AUDIT

```bash
cd /tmp/wt-hk6-backend

# 1. TypeScript
npx tsc --noEmit
# exit 0 required

# 2. ESLint on touched files
TOUCHED=$(git diff --name-only origin/main..HEAD -- '*.ts' | tr '\n' ' ')
npx eslint $TOUCHED
# exit 0 required

# 3. Targeted Jest pattern (KNOWN: there are 17 pre-existing main jest failures
#    on the FULL tree per the session-handoff note — module-graph/openapi-spec/
#    roles-enforced/scheduling. Do NOT try to fix them. Run a TARGETED pattern
#    so the gate is meaningful.)
npx jest --testPathPattern='(coach-wearable-message|wearable-insights\.controller|ai-approval\.service|capability-materialiser)' --runInBand
# exit 0 required; counts must include your new tests; NO "did not exit" warning

# 4. R0 added-line sweep (REQUIRED)
git diff origin/main..HEAD -- '*.ts' | grep '^+' | grep -v '^+++' \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# MUST return empty (grep exit 1)

# 5. Author check
git log -1 --format='%an <%ae>%n%B'
# expect: Dynasia G <dynasia@trygrowthproject.com>, title-only

# 6. Mobile contract parity check (manual):
#    Read /tmp/wt-hk5b/src/api/wearableInsightsApi.ts approveDraft + ApproveResponseSchema.
#    Confirm your endpoint URL is /v1/wearables/insights/approve and your
#    response shape matches { status: 'ok', draft_id: uuid, materialised_at: string }.
```

### 50-Failures sweep (R65) — actively walk

- **#2 strict schemas:** Both ApproveBodySchema and CoachWearableMessagePayloadSchema are `.strict()`-style — confirm `.strict()` is appended.
- **#5 IDOR / tenant boundary:** `assertCoachOwnsClient` MUST be called before any draft is created. The materialiser uses `tenant_coach_id` for the send — confirm it's set to the requester id, not the subject.
- **#10 status race:** `decide()` already takes the row lock — your endpoint cannot bypass this by calling materialiser directly. **You MUST go through `AiApprovalService.decide()`** for both approve and dismiss paths.
- **#12 error leak:** Don't log `body` content; log only structural facts (action, bucket, draftId).
- **#19 cache stale:** Once a draft is decided, the mobile insight cache for that bucket should be considered stale on next read. The mobile side handles refetch on `useApproveDraft.onSuccess` — backend has no action here, but verify you do not need to bust `InsightCacheService` (the insight cache is per `clientId+bucket+audience`; an approve doesn't change the underlying samples or model output, so a bust is NOT required).
- **#27 idempotency:** Two concurrent POST /approve calls for the same insight payload would create two distinct drafts (we don't dedupe by content). That's acceptable — each gets its own row, and the materialiser's claim ensures at most one message is sent per draft. The user-visible duplicate is a UX concern handled mobile-side by disabling the button while a mutation is in flight.
- **#28 race / #32 unmount:** N/A backend.
- **#35 graceful degradation:** If `MessagingService.sendAsCoach` throws (e.g. blocked recipient → 403), the materialiser's rollback path releases the claim and the draft remains pending. Confirm this matches `CoachMessageMaterializer`'s behaviour — same parent class, same outcome.
- **#48 CI clean exit:** Targeted jest must exit cleanly. If you see "did not exit" warning, find the leaked timer/connection and clean up in `afterAll`.

---

## Commit / push protocol

- **Single commit.**
- Conventional title: `feat(wearables): HK-6a — approval endpoint + coach_wearable_message materialiser`
- Author exactly `Dynasia G <dynasia@trygrowthproject.com>` (title-only).

Commit pattern:
```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "<title>"
```

Push pattern (auth via `api_credentials=["github"]` — token is `$GITHUB_TOKEN`, never print):
```bash
git push -u origin hk/PR-HK-6-approval-backend
```

Open the PR:
```bash
gh pr create --repo BradleyGleavePortfolio/growth-project-backend \
  --base main --head hk/PR-HK-6-approval-backend \
  --title "PR-HK-6: approval endpoint + coach_wearable_message materialiser" \
  --body "Adds POST /v1/wearables/insights/approve and the matching capability materialiser. Reuses AiApprovalService.decide for row-locking, audit, idempotency. Mobile (HK-5a) is already wired to this contract; the 'not_implemented' 404 branch becomes dead code and is removed in a follow-up PR."
```

## Deliverables (write to workspace + commit to context)

- Updated PR branch + PR number/URL.
- `/home/user/workspace/_builder_result_HK_6a_approval_backend.md` with:
  - new HEAD SHA (40-char)
  - PR number + URL
  - gate results (tsc/eslint/jest with counts + exit codes; jest exit-time observation)
  - R0 scan result (must be empty)
  - per-component summary (materialiser, controller, module wiring)
  - test list with pass counts
  - any deviations
- **R64:** copy that result file to `/tmp/tgp-agent-context/applehealthkit/expansion/`, commit as Dynasia G, push.

Begin by:
1. `cd /tmp/wt-hk6-backend && git status && git rev-parse HEAD`
2. Read `src/ai/gateway/materialisers/coach-message.materialiser.ts` end-to-end (your template).
3. Read `src/ai/gateway/ai-approval.service.ts` (so you understand what `decide()` does — you DO NOT modify it).
4. Read `src/wearables/insights/wearable-insights.controller.ts` (your new POST handler attaches to this).
5. Read `src/ai/gateway/ai-gateway.module.ts` (registration pattern).

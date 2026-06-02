# HK-6 — Approval Workflow → Messaging — Builder Brief

**Repos:** `growth-project-backend` (primary), `growth-project-mobile` (UI affordance)
**Branches:**
- Backend: `hk/PR-HK-6-approval-backend`
- Mobile: `hk/PR-HK-6-approval-mobile`

**Model:** Opus 4.8 (builder, both repos)
**Round:** R1
**Depends-on:** HK-5a merged (mobile owns `wearableInsightsApi.ts` + `WearableInsightPanel.tsx`); HK-4 merged (backend has `WearableInsightsService` + `AiGatewayService` + `CoachMessageMaterializer`).
**Parallel-with:** HK-5b (different files; HK-5b is client-side, HK-6 is coach-side).
**Effort:** M (backend) + S (mobile).

## Bradley R0 LAW (decacorn) — every commit
- NO "Coming soon" anywhere in diff (production, tests, comments, regex assertions).
- NO `as any`, `as unknown as`, `@ts-ignore`, `@ts-nocheck`.
- NO empty catches, NO `.catch(()=>undefined)`, NO silent failures.
- NO spinner-only states.
- Author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only commit, no Co-Authored-By/Generated-By.

## Mandatory references
- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`
- `/tmp/tgp-agent-context/applehealthkit/AGENT_1_UX_PLAN.md` §4.5 (approval flow — "Review message → Approve & send / Edit then send / Dismiss; never auto-send; routes through existing MessagesModule")
- `/tmp/tgp-agent-context/applehealthkit/AGENT_2_CODING_PLAN.md` PR-HK-6 section (audit criteria #5/#28/#29/#44/#34)

## Scope summary

Wire the coach's "Approve & send / Edit then send / Dismiss" action on the AI insight panel to actually emit a coach→client message via the existing `MessagesModule`, with full human-in-the-loop guardrails, idempotency, and audit trail.

**Critical constraint:** Reuses `AiActionDraft` (no schema change). The existing `PATCH /ai/gateway/drafts/:id` endpoint handles approve/reject. HK-6 adds:
1. A **draft-mint endpoint** on the wearables side (`POST /v1/wearables/insights/approve`) so mobile can take a suggested text → mint a real `AiActionDraft` → return its id (the body of an Approve & send flow is one HTTP round-trip from the mobile's perspective).
2. A new **capability** `draft.coach_wearable_message` with its own materialiser (`send-coach-wearable-message.materialiser.ts`) so wearable-originated drafts have distinct audit/budget separation.
3. The materialiser invokes `MessagingService.sendAsCoach` exactly like `CoachMessageMaterializer` but logs the wearable-insight provenance.
4. Mobile `WearableInsightPanel.tsx` flips from "graceful 404 degradation" to the real flow.

---

# Part A: Backend (`growth-project-backend`)

## A.1 Write-set (file-disjoint to all in-flight PRs)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/ai/gateway/materialisers/send-coach-wearable-message.materialiser.ts` (NEW) | Materialiser for `draft.coach_wearable_message` capability. |
| 2 | `src/ai/gateway/materialisers/send-coach-wearable-message.materialiser.spec.ts` (NEW) | Unit tests. |
| 3 | `src/ai/gateway/ai-gateway.module.ts` (1-line edit) | Bind the new materialiser to the `CAPABILITY_MATERIALIZERS` multi-provider token. |
| 4 | `src/wearables/insights/approval.controller.ts` (NEW) | Thin HTTP surface for mobile: mint-and-approve draft + edit-then-approve + dismiss. |
| 5 | `src/wearables/insights/approval.controller.spec.ts` (NEW) | Controller integration tests. |
| 6 | `src/wearables/insights/approval.service.ts` (NEW) | Service that mints the `AiActionDraft` row via `AiGatewayService.invoke` and orchestrates the edit/approve/dismiss path. |
| 7 | `src/wearables/insights/approval.service.spec.ts` (NEW) | Unit tests. |
| 8 | `src/wearables/insights/insights.module.ts` (1-line edit) | Register `ApprovalController` + `ApprovalService` providers; import `AiGatewayModule` if not already. |
| 9 | `test/wearables/approval-integration.spec.ts` (NEW) | E2E: mint → approve → materialise → message lands → idempotent re-approve rejected. |

**DO NOT touch:** `prisma/schema.prisma`, `app.module.ts`, `wearable-insights.controller.ts`, `wearable-insights.service.ts`, any sibling materialiser, `coach-message.materialiser.ts`, `MessagingModule`. The existing `CoachMessageMaterializer` is left untouched; HK-6's new materialiser is its sibling.

## A.2 New capability constant

```ts
// In send-coach-wearable-message.materialiser.ts
export const COACH_WEARABLE_MESSAGE_CAPABILITY = 'draft.coach_wearable_message';
```

**Why a new capability (not reuse `draft.coach_message`)?** Per spec: separate audit visibility (operator can filter wearable drafts), separate budget allow-listing if needed, and the materialiser can log the wearable provenance (bucket + source_metrics) on the audit row.

## A.3 Payload schema (Zod)

Same shape as `CoachMessagePayloadSchema` (clientId + body) PLUS a wearable-provenance field:

```ts
export const CoachWearableMessagePayloadSchema = z
  .object({
    clientId: z.string().uuid({ message: 'clientId must be a UUID' }),
    body: z
      .string()
      .min(1, { message: 'body must not be empty' })
      .max(1000, { message: 'body exceeds 1000 chars' })
      .refine((s) => s.trim().length > 0, { message: 'body must not be whitespace-only' }),
    // Provenance — links the message back to the wearable insight that produced it.
    bucket: z.nativeEnum(WearableMetricBucket),
    source_metrics: z.array(z.nativeEnum(WearableMetricType)).min(1),
  })
  .strict();
```

(`.strict()` is mandatory — prevents prompt-injection extra fields.)

## A.4 Materialiser implementation

Mirror `CoachMessageMaterializer` exactly with two changes:
1. `capability = COACH_WEARABLE_MESSAGE_CAPABILITY` (= `'draft.coach_wearable_message'`).
2. After `MessagingService.sendAsCoach` succeeds, log a structured info line: `wearable_draft_materialised { draft_id, client_id, bucket, source_metric_count, materialised_message_id }`. The bucket + source_metrics are NOT included as message metadata (recipient privacy) — just structured logs for ops visibility.

**Idempotency:** Use the same `materialised_at IS NULL` conditional update pattern as `CoachMessageMaterializer`. Tests must cover concurrent-approve race (two `.decide()` calls; one wins; other gets `already_materialised`).

**Reuse `MessagingService.sendAsCoach`** — do NOT create a new send path. The materialiser is a thin adapter, not a parallel messaging surface.

## A.5 Approval service (`approval.service.ts`)

Three public methods:

### `mintDraft(input: { coachId, clientId, bucket, body, sourceMetrics, ip, ua })`

Calls `AiGatewayService.invoke({ capability: 'draft.coach_wearable_message', requester: {id: coachId, role: 'coach'}, subjectUserId: clientId, tenantCoachId: coachId, userMessage: <empty>, proposedActionPayload: { clientId, body, bucket, source_metrics } })`.

The gateway:
- Validates the payload against `CoachWearableMessagePayloadSchema` (do this at draft-creation time per the precedent in `CoachMessageMaterializer`).
- Creates the `AiActionDraft` row with `status='pending'`.
- Returns `{ draftId }`.

Then `mintDraft` returns `{ draft_id }` to the controller.

### `editAndApprove(input: { coachId, draftId, newBody, ip, ua })`

1. Fetch the draft via `prisma.aiActionDraft.findUnique`. Throw 404 if missing.
2. Authz: verify `draft.tenant_coach_id === coachId` (IDOR defence). Throw 403 if not.
3. Verify `draft.status === 'pending'` (idempotency). Throw 409 if already decided.
4. **Update the payload body** atomically with the approve:
   ```ts
   await prisma.$transaction(async (tx) => {
     // Validate the new body against the schema BEFORE persisting
     const currentPayload = CoachWearableMessagePayloadSchema.parse(draft.payload);
     const updatedPayload = { ...currentPayload, body: newBody.trim() };
     CoachWearableMessagePayloadSchema.parse(updatedPayload);  // re-validate
     await tx.aiActionDraft.update({
       where: { id: draftId, status: 'pending' },
       data: { payload: updatedPayload },
     });
   });
   ```
5. Then call `AiApprovalService.decide({ draftId, decider: {id: coachId, role: 'coach'}, decision: 'approved', ip, ua })`. The decide call runs the materialiser inside its own transaction. The two-transaction split is intentional — the edit transaction commits the new payload; the decide path then materialises with the updated body.

Tradeoff documented: a process crash between "edit commit" and "decide call" leaves the payload updated but the draft still pending — the coach can retry approve; safe.

### `dismiss(input: { coachId, draftId, ip, ua })`

Authz + status check as above. Then `AiApprovalService.decide({ ..., decision: 'rejected', note: 'dismissed via wearable insight panel' })`. No materialiser fires on reject (existing behavior).

## A.6 Controller (`approval.controller.ts`)

Mounted at `@Controller('v1/wearables/insights')`. Three endpoints:

```ts
POST /v1/wearables/insights/approve
Body: {
  client_id: string (uuid),
  bucket: WearableMetricBucket,
  draft_body: string (1-1000 chars),
  source_metrics: WearableMetricType[],
  action: 'approve' | 'edit' | 'dismiss',
  // For 'approve' and 'edit': mint a draft, then approve (with the same body for 'approve' or the edited body for 'edit').
  // For 'dismiss': mint a draft + reject in one step? OR (cleaner) just emit an audit-log entry and return ok — no draft row needed if the coach never wants to materialise.
  draft_id?: string,  // OPTIONAL — if mobile already minted a draft and just wants to approve a known id (re-approve UI flow)
}

200 → { status: 'ok', draft_id: string, materialised_at: string, materialised_ref: string }
409 → { status: 'already_decided', message: string }
403 → { status: 'forbidden', message: string }
422 → { status: 'invalid', errors: [...] }
```

**Auth:** `@UseGuards(JwtAuthGuard, CoachGuard)`, `@Roles('coach', 'owner')`. Reuse the same guard chain as `WearableInsightsController.getCoachInsight`.

**Throttle:** Reuse the AI-gateway throttler bucket — the materialiser is one outbound message per approval, identical cost to a normal coach-message send. Limit: 30 / hour / coach (matches existing AiGateway invoke). Use `@Throttle({ [THROTTLER_NAMES.COACH_AI_GENERATION]: { ttl: 3_600_000, limit: 30 } })`.

**Handler logic:**
- `action === 'approve'`: `mintDraft` → immediately call `AiApprovalService.decide({ decision: 'approved' })` on the new draft_id. Return materialised result.
- `action === 'edit'`: `mintDraft` → `editAndApprove` (updates body + approves). Return materialised result.
- `action === 'dismiss'`: Two paths —
  - If `draft_id` provided: just call `dismiss(draft_id)`.
  - If no `draft_id`: write an `AuditLog` entry `wearable_draft_dismissed_without_mint { coach_id, client_id, bucket }` and return ok with `materialised_at: null`. No draft row created. This is the "coach didn't approve anything, just tapped Dismiss" path — keep it lightweight.

**Authz IDOR (audit criteria #5):**
- `subject_user_id` (client) MUST be a client the coach actively coaches. Verify via `WearableInsightsService.assertCoachOwnsClient` (already exists; import + call).
- A coach approving their OWN draft is blocked by `AiApprovalService.decide` (existing rule: requester ≠ decider).

**Transaction wrapping (audit criteria #44):** The decide path already wraps draft-status-update + materialiser execution in `prisma.$transaction` via `AiApprovalService.decide`. We add no extra transactions; we rely on that one.

**Audit row (audit criteria #34):** Every approve/edit/dismiss creates an `AuditLog` entry via the existing `AuditService.record` call inside `AiApprovalService.decide`. The dismiss-without-mint path needs a manual `AuditService.record` call (note that explicitly in code).

## A.7 Module wiring

`insights.module.ts`:
```ts
@Module({
  imports: [..., AiGatewayModule],  // for AiGatewayService + AiApprovalService
  controllers: [WearableInsightsController, ApprovalController],
  providers: [..., ApprovalService],
  exports: [...],
})
```

`ai-gateway.module.ts`:
```ts
providers: [
  ...,
  SendCoachWearableMessageMaterializer,
  { provide: CAPABILITY_MATERIALIZERS, useExisting: SendCoachWearableMessageMaterializer, multi: true },
],
```

Verify the existing pattern by grepping `CAPABILITY_MATERIALIZERS` in the current module file — match the exact binding style (multi-provider).

## A.8 Tests

### `send-coach-wearable-message.materialiser.spec.ts`
- `canHandle` returns true for `draft.coach_wearable_message`, false for `draft.coach_message`.
- `materialize` happy path: pending draft → `sendAsCoach` called with correct args → returns `{ status: 'materialised', ref: <message_id> }`.
- Idempotency: second call on a draft with `materialised_at` set returns `already_materialised` without calling `sendAsCoach`.
- Concurrency: two simultaneous calls — one materialises, one observes the row-already-updated state. Validate via mocked Prisma `update({ where: { materialised_at: null } })` returning 0 rows on the second.
- Payload validation: malformed payload throws (test with missing `bucket`, missing `source_metrics`, body > 1000 chars, body = whitespace).

### `approval.service.spec.ts`
- `mintDraft`: invokes `AiGatewayService.invoke` with correct args → returns the resulting draft_id.
- `editAndApprove`: full happy path. Verify the payload's `body` field is updated before `decide` is called.
- `editAndApprove`: draft not found → 404.
- `editAndApprove`: tenant boundary — coach trying to edit another coach's draft → 403.
- `editAndApprove`: already-decided draft → 409.
- `editAndApprove`: invalid newBody (>1000 chars, whitespace-only) → 422 BEFORE persisting.
- `dismiss`: happy path + 404 + 403 + 409.

### `approval.controller.spec.ts`
- All three actions (approve/edit/dismiss) integration test against mocked services. Validate route guards via `@UseGuards`.
- Throttle test: 31st call within an hour returns 429.
- Authz: client role hitting the endpoint → 403.

### `test/wearables/approval-integration.spec.ts` (E2E)
- Create coach + client + active relationship + `AiActionDraft` row via the controller.
- POST `/v1/wearables/insights/approve { action: 'approve' }` → 200, `materialised_at` non-null, message lands in `coach_messages` table.
- Idempotency: POST again with same `draft_id` (re-approve UI) → 409 `already_decided`.
- Edit path: POST with `action: 'edit'` + new body → draft.payload.body updated AND message body matches the EDITED body.
- Dismiss path: POST with `action: 'dismiss'` + `draft_id` → draft.status='rejected'.
- Coach trying to approve another coach's draft → 403.

## A.9 Backend gates

```bash
cd /tmp/wt-hk6-backend
npm ci  # or use the existing node_modules from /tmp/gpb-clone if present
npm run lint -- src/ai/gateway/materialisers/send-coach-wearable-message.materialiser.ts src/wearables/insights/approval.controller.ts src/wearables/insights/approval.service.ts 2>&1 | tail -10
npx tsc --noEmit 2>&1 | tail -10
npm test -- --testPathPattern='(send-coach-wearable-message|approval)' 2>&1 | tail -30
npm test -- test/wearables/approval-integration.spec.ts 2>&1 | tail -30  # E2E
git diff origin/main..HEAD -- '*.ts' | grep '^+' | grep -v '^+++' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS — STOP" || echo "R0 BANS: CLEAN"
```

---

# Part B: Mobile (`growth-project-mobile`)

## B.1 Write-set

| # | File | Purpose |
|---|------|---------|
| 1 | `src/screens/coach/client-detail/WearableInsightPanel.tsx` (edit) | Remove the "404 → not_implemented graceful degradation"; wire to real approve/edit/dismiss endpoint via existing `useApproveDraft` mutation hook. |
| 2 | `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx` (edit) | Update tests: remove `not_implemented` path; add real success/error paths. |
| 3 | `src/api/wearableInsightsApi.ts` (edit) | Remove the 404-coercion shim in `approveDraft`. Add the new response shape (`{ status, draft_id, materialised_at, materialised_ref }`). |
| 4 | `src/api/__tests__/wearableInsightsApi.test.ts` (edit) | Replace not_implemented test with real success / 409 / 403 / 422 paths. |

**DO NOT touch:** Coach screens beyond the panel internals. HK-5b client panel. HK-3a/3b screens. Backend code (separate PR).

## B.2 API client update (`wearableInsightsApi.ts`)

Remove the `try/catch (err → 404 → not_implemented)` shim from `approveDraft`. Replace with normal axios error propagation. Update the response schema:

```ts
const ApproveResponseSchema = z.object({
  status: z.literal('ok'),
  draft_id: z.string().uuid(),
  materialised_at: z.string(),
  materialised_ref: z.string(),  // message id
}).strict();
```

Error handling: let axios throw. The hook's `onError` (or caller via `mutation.error`) surfaces.

## B.3 Panel update (`WearableInsightPanel.tsx`)

- Remove the `if (res.status === 'not_implemented')` branch in `MessageDraftReviewSheet`.
- On 409 (already decided): show "This insight has already been actioned." in the sheet; the panel can re-fetch to update.
- On 403: "You don't have access to approve this draft." (calm, no internal detail leaked).
- On 5xx: "The server is temporarily unavailable. Try again." + retry button.

## B.4 Mobile gates

Same gate suite as HK-5a but limited to the updated files:

```bash
cd /tmp/wt-hk6-mobile  # branch off post-HK-5a-merge main
npx tsc --noEmit 2>&1 | tee /tmp/6_tsc.log; echo "EXIT $?"
npx eslint 'src/screens/coach/client-detail/WearableInsightPanel.tsx' 'src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx' 'src/api/wearableInsightsApi.ts' 'src/api/__tests__/wearableInsightsApi.test.ts' 2>&1 | tail -10
npx jest --ci --testPathPattern='(WearableInsightPanel|wearableInsightsApi|useWearableInsight)' 2>&1 | tail -20
npx expo prebuild --platform ios --no-install --clean 2>&1 | tail -3
npx expo prebuild --platform android --no-install --clean 2>&1 | tail -3
git checkout -- package.json && rm -rf ios android
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS — STOP" || echo "R0 BANS: CLEAN"
```

---

# C: Commit + PR

**Backend:**
```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "PR-HK-6 backend: wearable insight approval workflow (mint→approve→materialise via existing MessagesModule)"
git push origin hk/PR-HK-6-approval-backend
gh pr create --repo BradleyGleavePortfolio/growth-project-backend \
  --base main --head hk/PR-HK-6-approval-backend \
  --title "PR-HK-6 backend: wearable approval → messaging" \
  --body "Adds the wearable-insight approval workflow. New capability draft.coach_wearable_message with its own materialiser; thin approval controller + service in src/wearables/insights/; reuses existing AiApprovalService.decide and MessagingService.sendAsCoach. No schema change. Audit criteria #5/#28/#29/#34/#44 enforced."
```

**Mobile:**
```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "PR-HK-6 mobile: wire WearableInsightPanel approve/edit/dismiss to backend"
git push origin hk/PR-HK-6-approval-mobile
gh pr create --repo BradleyGleavePortfolio/growth-project-mobile \
  --base main --head hk/PR-HK-6-approval-mobile \
  --title "PR-HK-6 mobile: wire approval flow" \
  --body "Removes the HK-5a graceful 404 degradation and wires the real approve/edit/dismiss flow against /v1/wearables/insights/approve."
```

# D: Output

Write `/home/user/workspace/_builder_result_HK_6.md`:
- Two SHAs (backend + mobile)
- Two PR numbers
- All gate exit codes
- 50-Failures sweep notes (focus on #5, #28, #29, #44, #34)
- R0 ban grep proofs
- Commit metadata proofs
- Verdict: `READY_FOR_AUDIT` or `BLOCKED`

# Important constraints

- **Backend before mobile.** The mobile PR depends on the backend endpoint existing. Land the backend PR first (merge), then push the mobile PR.
- **Stay strictly inside the write-set.** Do NOT touch `coach-message.materialiser.ts` — the new materialiser is its sibling, not a replacement.
- **No schema changes.** Reuse `AiActionDraft.payload` as JSON. The new capability is a string constant, NOT a Prisma enum value.
- **No new HTTP client.** Mobile reuses `services/api.ts`.
- The IDOR check uses `WearableInsightsService.assertCoachOwnsClient` — verify it's exported (or make it public if currently private; if you must edit `wearable-insights.service.ts` to export it, document that one-line edit as a deviation).
- If MessagingService.sendAsCoach has a different signature than expected, adapt — mirror what `CoachMessageMaterializer` actually does verbatim.

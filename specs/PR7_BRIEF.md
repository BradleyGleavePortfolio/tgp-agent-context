# PR-7 BUILD BRIEF — AssignableAssetResolver registry

**Repo:** growth-project-backend (NestJS). **Pillar 3. Type: BUILD.**
**Branch:** `pr7/assignable-asset-resolver` off latest default (now has PR-2/3/4).

## GOAL
Build a registry + resolver abstraction that, given a deliverable `(asset_type, asset_id, asset_revision_id?)` and a target `client_id` (+ coach context), can MATERIALISE that deliverable for the client by REUSING the EXISTING AI-gateway materialisers. This is the indirection the drip executor (PR-9/PR-10) and immediate-delivery path call so they never hard-code per-type assignment logic.

This PR builds the REGISTRY + the per-type RESOLVERS and unit-tests them in isolation. It does NOT wire them into the fan-out body or cron yet (PR-9/PR-10 do that).

## REUSE — do NOT reimplement assignment
The repo already has materialisers in the AI gateway that assign exactly our deliverable types given a client + asset ref. Per the inventory: `ai-gateway.module.ts` registers `assign-workout`, `assign-meal-plan`, `coach-message`, `send-notification` (around lines 60-83), modeled by a `CapabilityMaterializerRegistry`. INSPECT that registry FIRST and MIRROR its pattern — your `AssignableAssetResolver` registry should look and feel like `CapabilityMaterializerRegistry` (same DI/registration style). Each resolver should DELEGATE to the existing materialiser/assignment service, not duplicate the assignment SQL.

## THE SHAPE
- `AssignableAssetResolverRegistry` — holds a map from `asset_type` → resolver. Resolvers self-register (mirror however CapabilityMaterializerRegistry does it — module providers + a register call, or a DI multi-provider token).
- Resolver interface, roughly:
```
interface AssignableAssetResolver {
  readonly assetType: 'workout_program' | 'workout_plan' | 'meal_plan' | 'pdf' | 'video' | 'auto_message';
  // Materialise the deliverable for one client. Returns a ref string stored on ScheduledDrop.materialised_ref.
  materialise(input: {
    clientId: string;
    coachId: string;
    assetId: string;
    assetRevisionId?: string | null;
    displayTitle?: string | null;
    displayCaption?: string | null;
    tx?: Prisma.TransactionClient; // honor an ambient tx when given (immediate-at-checkout path)
  }): Promise<{ materialisedRef: string }>;
}
```
- Resolvers to implement THIS PR (delegating to existing services):
  - `workout_program` + `workout_plan` → delegate to the existing assign-workout materialiser/service.
  - `meal_plan` → delegate to assign-meal-plan.
  - `auto_message` → delegate to the coach-message send path (sendAsCoach) — sends the message as the coach to the client at materialise time.
  - `pdf` + `video` → grant access: create a `ClientAssetGrant` (client_id, media_asset_id=asset_id, granted_via_drop_id passed through) on-conflict-nothing, and (PR-10 will fire the notification) return the grant ref. NOTE: the CoachMediaAsset upload pipeline is PR-12; for THIS PR the pdf/video resolver only needs to create the ClientAssetGrant row and tolerate that the media asset may not yet be uploadable via UI — it just grants by media_asset_id. If a referenced CoachMediaAsset doesn't exist, fail cleanly with a typed error (don't crash).
- Registry method: `resolve(assetType): AssignableAssetResolver` (throws typed error for unknown type) and a convenience `materialise(content, clientId, coachId, opts)` that looks up + delegates.

## CRITICAL CORRECTNESS
- **Sub-coach scope**: when materialising as a coach, respect `SubCoachScopeService` (per 50-Failures gate + builder spec), NOT raw `User.coach_id`. Inspect how existing assignment code resolves the acting coach and mirror it. Do NOT let a sub-coach's drip assign outside their scope.
- **tx-honoring**: if a `tx` is passed (immediate-at-checkout inline path), all DB writes in the resolver use that tx. If absent (cron path), use the normal client. Do NOT open a nested transaction when a tx is provided.
- **Idempotency**: materialise may be retried (PR-10 backoff). Where the underlying assignment is naturally idempotent, rely on it; for `ClientAssetGrant` use on-conflict-nothing via the @@unique. Document idempotency per resolver.
- **No sync Stripe calls** (n/a here but keep clean).

## SCOPE GUARDRAILS
- Registry + resolvers + unit tests ONLY. Do NOT wire into PurchaseFanoutService, do NOT add the cron, do NOT add endpoints, do NOT touch mobile, do NOT build the CoachMediaAsset upload pipeline (PR-12).
- Reuse existing materialisers — if you find yourself writing assignment SQL that already exists elsewhere, STOP and delegate instead.

## VERIFICATION
1. tsc/nest build + eslint pass.
2. Unit tests per resolver: each delegates to the right underlying service with the right args; registry.resolve throws on unknown type; pdf/video creates a ClientAssetGrant idempotently; sub-coach scope respected (mock SubCoachScopeService and assert the scoped coach is used).
3. Existing tests still pass.

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr7/assignable-asset-resolver`, PR against default, report PR URL.
- PR description: the registry pattern mirrored, each resolver's delegation target (file:line of the reused materialiser), sub-coach scope handling, idempotency per resolver, test results.

## DELIVERABLE
Report: (a) PR URL, (b) registry pattern + which existing registry it mirrors, (c) each resolver → reused service (file:line), (d) sub-coach scope approach, (e) idempotency per resolver, (f) test results. Copy to /home/user/workspace/specs/PR7_BUILD_REPORT.md.

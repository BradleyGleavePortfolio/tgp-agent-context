## [134] B31 pattern outside Roman: message blocks and AI draft approvals were never wired in production

Job NEST-TOKENS-134 (agent 134). T4: messaging safety (Apple 1.2 blocks) and AI action approvals. Backend only; no schema, no flags, no money.

### What changes for users (from the code; production counts by SELECT)
1. **Blocks are enforced.** `MessagingService` never received `MessagesSafetyService` (the Apple 1.2 block service), so every block check was skipped. After this PR, once a client or coach blocks the other:
   - a send in either direction is refused with the existing 403 `BLOCKED` ("Messages cannot be sent to blocked users"); nothing is stored or pushed;
   - the blocker no longer sees the blocked party's messages in the thread;
   - unread counts and badges leave the blocked party out (a client who blocked their coach sees 0).
   Production today: `UserBlock` = 0 rows, so no conversation changes on deploy.
2. **Approved AI drafts do what was approved.** `AiApprovalService` never received the capability materialiser registry, so approving a draft (`draft.coach_message`, `draft.coach_wearable_message`, `draft.assign_workout`, `draft.assign_meal_plan`, `draft.send_notification`, `draft.create_workout_plan`, `draft.edit_workout_plan`) flipped it to `approved` and sent or assigned nothing (PRODUCT-1, which #293 was written to prevent). After this PR the materialiser runs before the status flip; if it fails, the draft stays pending so the coach can retry. Production today: `AiActionDraft` = 0 rows, so there is no backlog of "approved but never sent" drafts.
3. Voice uploads: no change. `VoiceUploadProvider` was also missing its token, but the service already built an identical provider itself. It is fixed for consistency.

Nothing could now be "held" by content screening: `MessagesSafetyService` handles blocks and reports, and it does not screen message text.

### WHY / WHEN / WHO
- **Root cause.** This is the same defect as B31 (b#891). A constructor param `@Optional() x: T | null = null` has no `@Inject` token. With `strictNullChecks`, TypeScript emits it as `Object` in `design:paramtypes`. Nest looks up a provider called `Object`, finds none, and the optional param keeps its `null` default. The unit tests build these services with `new`, so they never saw it.
- `src/messaging/messaging.service.ts:146` (`MessagesSafetyService | null`): 58c4588b, #263, 2026-05-23.
- `src/messaging/messaging.service.ts:158` (`VoiceUploadProvider | null`): 592fc39e, #397, 2026-06-14.
- `src/ai/gateway/ai-approval.service.ts:105` (`CapabilityMaterializerRegistry | null`): dec5916c, #293, 2026-05-27.
- Bug IDs: B31 (same pattern), register follow-up "same no-token pattern elsewhere" (ROMAN-CONTEXT-133 HANDOFF).

### Whole-src sweep
I checked all 143 `@Optional()` constructor params in `src/`, with comments stripped.
- **Union-typed with no token:** exactly the 3 above, all fixed.
- `src/throttler/login-throttle-reset.service.ts:90` (`ThrottlerStorage | undefined`) was on the suspect list, but it is **not a bug**: `@InjectThrottlerStorage()` is an explicit token. A new DI test proves it (it passes on main too), and so does the existing `test/login-account-lock.spec.ts:362`.
- **Interface-typed seams** emit `Object` by design. Each has a documented fallback and no provider exists for it, so none is changed:
  - `OauthStateService` store
  - `StravaWebhookController` env
  - `ProviderHttpClient` deps
  - `PurchaseFanoutService` alertHook (no `DripAlertDispatchHook` provider exists anywhere)

### Changes
- `src/messaging/messaging.service.ts`: adds `@Inject(MessagesSafetyService)` and `@Inject(VoiceUploadProvider)`.
- `src/ai/gateway/ai-approval.service.ts`: adds `@Inject(CapabilityMaterializerRegistry)`.
- `test/nest-tokens-134-wiring.spec.ts` (new, 8 tests):
  - `MessagingService` built through Nest DI: both deps are injected, and a block is enforced through the public methods.
  - `AiApprovalService` built through DI: the module's registry is injected.
  - `LoginThrottleResetService`: the storage arrives through DI.
  - **The whole `AppModule` compiled**, as `main.ts` boots it: `MessagingService.safety` is a `MessagesSafetyService`, and `AiApprovalService.materialisers` is the registry and resolves `draft.coach_message`.
  - A src-wide static guard: no `@Optional()` `T | null` or `T | undefined` param without an `@Inject*` token.
- `.github/workflows/ci.yml` (`mwb-3-live-tests`): a new step runs the two Roman live DB specs from b#891 and b#892, which never ran in CI:
  - `test/roman/roman-context-null-lists.live.spec.ts`
  - `test/roman/roman-coach-pool-b31d1.live.spec.ts`

  They use the same `MWB3_TEST_DATABASE_URL` gate and the same reset + bootstrap.

### Evidence (seen in a test)
- **Locally, with this branch:** 8/8 pass (`heavy.sh npx jest test/nest-tokens-134-wiring.spec.ts --runInBand`).
- **Failing first:** with main's two service files and this spec, 7 of 8 fail: `safety` and `materialisers` are `null`, the block is not enforced, the AppModule-built services have no deps, and the scan lists exactly the 3 params. The 1 that passes is the throttler proof, as expected.
- The live specs were not run locally (no Postgres in this sandbox). CI's `mwb-3-live-tests` job runs them at this head.

### Not seen
Not seen on a device. No production behaviour was observed after the fix; both tables are empty today.

agent 134

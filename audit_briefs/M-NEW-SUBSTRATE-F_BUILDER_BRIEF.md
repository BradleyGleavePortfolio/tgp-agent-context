# 1. M-NEW-SUBSTRATE.F — Onboarding Wizard Backend tRPC Routes

Slug: `M-NEW-SUBSTRATE.F`

## 2. Doctrine cites

- R0/R3: Bradley-only author/committer identity; use `scripts/push_one.sh`; no assistant/agent/co-author tokens.
- R52/R71/R72: push discipline, lane discipline, dual-lens adversarial audit.
- R74/R86: tests target real route/orchestration failure modes; no padding.
- R75: zero banned-cast additions.
- R76: ≤400 prod LOC.
- R82: route-owned schema changes must be reversible; expected to use M-NEW-SCHEMA only.
- R90/R91/R85/R86 from the hyperscaler section: mutations are idempotent, public-facing routes are rate-limited, instrumented, and have declared p99/error SLOs.
- R98: credentials, OTPs, raw observations, and status payloads must redact PII.
- R107: every scout-now, MFA response, status mutation, and operator-assist action goes through H6A audit via `.E` wrapper.
- R125: all returned user data is scoped by coach/session/run RLS.
- D-8: onboarding UX is P0 in v0: paste creds, pick platform, scout-now, live status, MFA challenge surface, operator-assist stream.
- D-H6-5: all audit calls use `withAuditLog(tx, args, op)` with caller-provided transaction.

## 3. Dependencies

Must land first:

1. H6A/H6B/H6C.
2. M-NEW-SCHEMA scout run/status/MFA tables.
3. `.A` profile registry.
4. `.C` session pool/MFA service.
5. `.E` audit/kill-switch/checkpoint wrapper.
6. `.B`/`.D` may be stubbed behind substrate interfaces, but route contracts must not hard-code vendor behavior.

This slice feeds M-NEW-ONBOARDING UI and must remain backend-only.

## 4. What this slice ships

Prod LOC budget: **400 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/onboarding/scout-onboarding.router.ts` | 125 | tRPC route definitions: `scoutNow`, `mfaChallengeResponse`, `statusPolling`, `operatorAssistStream`. |
| `src/migration-scout/onboarding/scout-onboarding.service.ts` | 120 | Orchestrates profile lookup, kill-switch guard, session checkout, run creation, status reads. |
| `src/migration-scout/onboarding/scout-onboarding.schemas.ts` | 75 | Zod input/output schemas with redaction-safe DTOs. |
| `src/migration-scout/onboarding/operator-assist-stream.ts` | 55 | Server-side event/observable adapter for live operator-assist status events. |
| `src/migration-scout/onboarding/index.ts` | 25 | Public exports/module wiring. |
| **Total** | **400** | Hard R76 cap. |

## 5. Public API contract

Route shapes:

```ts
export const scoutOnboardingRouter = router({
  scoutNow: protectedProcedure
    .input(ScoutNowInputSchema)
    .mutation(async ({ ctx, input }) => ScoutNowOutputSchema),

  mfaChallengeResponse: protectedProcedure
    .input(MfaChallengeResponseInputSchema)
    .mutation(async ({ ctx, input }) => MfaChallengeResponseOutputSchema),

  statusPolling: protectedProcedure
    .input(StatusPollingInputSchema)
    .query(async ({ ctx, input }) => StatusPollingOutputSchema),

  operatorAssistStream: operatorProcedure
    .input(OperatorAssistStreamInputSchema)
    .subscription(({ ctx, input }) => Observable<ScoutAssistEvent>),
});
```

Input/output contracts:

```ts
export interface ScoutNowInput {
  readonly vendor: string;
  readonly profileVersion?: string;
  readonly credentialRef?: string;
  readonly credentialPayload?: {
    readonly fields: Record<string, string>;
  };
  readonly sourceMode: 'export_upload' | 'browser_scout' | 'copilot' | 'support_assisted';
  readonly idempotencyKey: string;
}

export interface ScoutNowOutput {
  readonly scoutRunId: string;
  readonly status: 'queued' | 'mfa_required' | 'running' | 'blocked_by_operator_override';
  readonly nextAction?: 'wait' | 'answer_mfa' | 'operator_assist' | 'upload_export';
  readonly redactedMessage: string;
}

export interface MfaChallengeResponseInput {
  readonly scoutRunId: string;
  readonly challengeId: string;
  readonly response: string;
  readonly idempotencyKey: string;
}

export interface StatusPollingOutput {
  readonly scoutRunId: string;
  readonly status: ScoutRunStatus;
  readonly progress: { readonly completed: number; readonly total?: number };
  readonly currentStep: string;
  readonly mfaChallenge?: RedactedMfaChallengeView;
  readonly diffSummary?: { readonly adds: number; readonly updates: number; readonly conflicts: number };
  readonly updatedAt: string;
}

export interface ScoutAssistEvent {
  readonly type: 'run_status' | 'mfa_required' | 'checkpoint' | 'blocked' | 'diff_ready' | 'error';
  readonly scoutRunId: string;
  readonly coachId: string;
  readonly vendor: string;
  readonly payloadRedacted: Record<string, unknown>;
  readonly at: string;
}
```

Route behavior:

- `scoutNow` is idempotent by `coach_id + vendor + idempotencyKey`.
- `mfaChallengeResponse` never logs raw response and rejects expired challenges from `.C`.
- `statusPolling` returns redacted status only for the owning coach or authorized operator-assist user.
- `operatorAssistStream` is operator-only and emits redacted payloads; it cannot send credentials or OTP values.
- All routes call `.E` kill-switch before mutating scout state.

SLO:

- `scoutNow`: p99 ≤750ms for enqueue/run creation, excluding downstream scout execution.
- `mfaChallengeResponse`: p99 ≤500ms.
- `statusPolling`: p99 ≤250ms.
- `operatorAssistStream`: first event p99 ≤1s; heartbeat every ≤15s.
- Error budget: <1% 5xx per route over 7 days after rollout.

## 6. Database changes

No route-specific migration expected; use M-NEW-SCHEMA tables.

Required schema contract:

- `scout_runs`: `id`, `coach_id`, `vendor`, `profile_version`, `source_mode`, `status`, `idempotency_key`, `created_by_user_id`, `created_at`, `updated_at`, `blocked_reason`.
- `scout_mfa_challenges`: as defined in `.C`.
- `scout_run_status_events` or equivalent event table for polling/stream replay.
- `operator_overrides`: as defined in `.E`.

RLS:

- Coach routes can read/write only rows for their `coach_id`.
- Operator-assist can read redacted events only through operator role and must audit every assist view/action.
- All status queries include `coach_id` and `scout_run_id` predicates; no run ID-only lookups.

R82:

- If this slice discovers missing idempotency/status columns, add them through M-NEW-SCHEMA or a reversible expand migration with `down.sql`.

## 7. Test strategy

Real failure modes only:

1. **Kill-switch blocks scoutNow.** With `scout_authorized=false`, route returns blocked status and creates no active run.
2. **Idempotency prevents duplicate runs.** Replaying same `idempotencyKey` returns original `scoutRunId` and does not create a second run.
3. **Expired MFA response is rejected and redacted.** Route returns challenge expired; raw OTP is absent from logs/audit args.
4. **Cross-coach status read denied.** Coach B cannot poll Coach A run even with valid run ID.
5. **Operator stream redacts payloads.** Operator-assist event includes run/vendor/status but no credential, OTP, cookie, or raw payload fields.

Rejected padding: route existence tests that do not assert behavior, schema happy-path duplicate tests, stream heartbeat-only tests without auth/redaction assertions.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is capped at 400.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-onboarding-routes-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.F onboarding wizard backend tRPC routes
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Kill-switch blocks scoutNow with no active run.
- Idempotency replay returns original run.
- Expired MFA response is rejected and redacted.
- Cross-coach status polling is denied.
- Operator-assist stream emits redacted events only.
Padding explicitly rejected:
- Route registration smoke tests.
- Schema happy-path duplicates.
- Heartbeat-only stream tests.
Split feasibility: Already at/under R76; splitting routes from orchestration would hide auth/idempotency/audit integration risk.
```

If prod LOC exceeds 400, stop for operator approval.

## 9. Out of scope

- Frontend wizard UI; M-NEW-ONBOARDING.
- Vendor-specific profile content or export instructions.
- Browser runtime implementation.
- Reconciliation preview/commit UI.
- Notification fan-out, smart dunning, or super-loaded link send.
- Legal permission matrix UI.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- scout-onboarding.router`
- `pnpm test -- scout-onboarding.service`
- `pnpm test -- operator-assist-stream`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC
- tRPC contract/type generation gate, if present
- RLS isolation tests for status polling
- Audit-log contract tests proving H6A caller-tx integration through `.E`

## 11. VERDICT line

VERDICT: _______________

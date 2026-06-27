# 1. M-NEW-SUBSTRATE.E — Audit Hooks, Kill-Switch, PG NOTIFY Hot Reload

Slug: `M-NEW-SUBSTRATE.E`

## 2. Doctrine cites

- R0/R3: all commits authored/committed as Bradley Gleave only; use `scripts/push_one.sh`.
- R52/R71/R72: push checkpoints, lane discipline, dual-lens adversarial audit.
- R74/R86: tests target kill-switch/audit failure modes; no ratio padding.
- R75: zero banned-cast additions.
- R76: ≤400 prod LOC.
- R82: operator override migration must be reversible.
- R98: audit rows redact PII while preserving action facts.
- R107: every scout action goes through H6A `withAuditLog`; missing wrapper is P0.
- R125: `operator_overrides`, `scout_action_events`, and scout-user data tables enforce defense-in-depth and RLS where user data appears.
- D-8: default `scout_authorized=true`; operator hard cut via `OPERATOR_OVERRIDES.scout_authorized=false`; new runs blocked and in-flight runs abort at next checkpoint ≤30s; PG NOTIFY hot reload target ≤2s; no grace period.
- D-H6-5: corrected `withAuditLog(tx, args, op)` caller-provided transaction is mandatory.

## 3. Dependencies

Must land first:

1. H6A fixed and merged; this slice is invalid without D-H6-5 caller-tx helper.
2. H6B circuit breakers.
3. H6C audit-log wraps.
4. M-NEW-SCHEMA operator override and scout action/event tables.
5. `.A` profile registry for vendor/profile metadata.
6. `.C` session pool and `.D` diff engine should expose checkpoints that can call this guard.

## 4. What this slice ships

Prod LOC budget: **395 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/control/scout-action.types.ts` | 55 | Action context, checkpoint, kill-switch, and audit result types. |
| `src/migration-scout/control/scout-audit.service.ts` | 95 | `withScoutActionAudit` wrapper around H6A `withAuditLog(tx, args, op)`. |
| `src/migration-scout/control/scout-kill-switch.service.ts` | 95 | Reads operator override cache/DB, blocks new runs, throws abort signal at checkpoints. |
| `src/migration-scout/control/operator-override-notify.listener.ts` | 65 | PG LISTEN for override hot reload; target ≤2s cache update; debounced and observable. |
| `src/migration-scout/control/scout-checkpoint.guard.ts` | 65 | Reusable `assertScoutAuthorized` checkpoint called before/after every scout action. |
| `src/migration-scout/control/index.ts` | 20 | Public exports. |
| **Total** | **395** | 5 LOC buffer under R76. |

## 5. Public API contract

```ts
export type ScoutActionKind =
  | 'profile.load'
  | 'session.checkout'
  | 'session.login'
  | 'mfa.challenge.create'
  | 'mfa.challenge.answer'
  | 'route.fetch'
  | 'selector.evaluate'
  | 'result.persist'
  | 'diff.compute'
  | 'diff.persist'
  | 'run.abort'
  | 'run.complete';

export interface ScoutActionContext {
  readonly actorUserId: string;
  readonly coachId: string;
  readonly scoutRunId?: string;
  readonly vendor: string;
  readonly profileVersion?: string;
  readonly requestId: string;
  readonly action: ScoutActionKind;
  readonly metadata?: Record<string, unknown>;
}

export interface ScoutAuditService {
  withScoutActionAudit<T>(
    tx: Prisma.TransactionClient,
    ctx: ScoutActionContext,
    op: () => Promise<T>,
  ): Promise<T>;
}

export interface ScoutKillSwitchService {
  isAuthorized(vendor: string): Promise<ScoutAuthorizationState>;
  assertNewRunAllowed(vendor: string): Promise<void>;
  assertCheckpointAllowed(input: ScoutCheckpointInput): Promise<void>;
  reloadOverrides(tx?: Prisma.TransactionClient): Promise<ScoutOverrideReloadResult>;
}
```

Behavior contract:

- Default state is authorized unless an operator override explicitly sets `scout_authorized=false`.
- New runs are blocked immediately when cache/DB says disabled.
- In-flight runs must call `assertCheckpointAllowed` before every meaningful action; disabled vendors abort by next checkpoint and no later than 30 seconds.
- PG NOTIFY updates in-memory override cache within target ≤2 seconds; DB read remains source of truth on cache miss.
- Audit metadata must redact credentials, OTPs, cookies, raw payloads, and PII; keep action, vendor, run ID, selector path, counts, and failure codes.

## 6. Database changes

Expected ownership: M-NEW-SCHEMA.

Required table:

- `operator_overrides`
  - `id uuid pk`
  - `scope text not null` (`global | vendor`)
  - `vendor text null`
  - `scout_authorized boolean not null default true`
  - `reason text null`
  - `updated_by_user_id uuid not null`
  - `updated_at timestamptz not null default now()`
  - unique `(scope, vendor)`

Optional table if not already covered by audit-log:

- `scout_action_events`
  - only non-PII operational facts: action, vendor, run, status, duration, counts, error code.
  - If added, it is Tier-1 by `coach_id` when it references a coach/run.

PG channel:

- `operator_overrides_changed` with payload `{ vendor?: string, scout_authorized: boolean, updated_at: string }`.

Policies:

- Operator/admin write only.
- Service read.
- Coach has no direct access to global overrides; coach-facing status route can return derived safe mode only.

R82:

- Reversible migration with policy/index drops in reverse order.

## 7. Test strategy

Real failure modes only:

1. **Hard cut blocks new runs.** Insert override `scout_authorized=false`, assert `assertNewRunAllowed` rejects with stable abort code.
2. **In-flight abort at checkpoint.** Start with authorized cache, flip override via reload/notify, assert next checkpoint aborts and emits `run.abort` audit fact.
3. **PG NOTIFY hot reload updates cache.** Simulate notification and assert override visible without process restart; DB remains fallback.
4. **Audit wrapper uses caller tx and redacts.** `withScoutActionAudit` must pass exact tx to H6A and must not include OTP/cookie/raw PII in audit args.

Rejected padding: cache getter tests, enum-only tests, and duplicate action-kind audit snapshots without new redaction risk.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is ≤395.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-audit-kill-switch-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.E audit hooks + kill-switch + PG NOTIFY
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Operator hard cut blocks new runs.
- In-flight run aborts at next checkpoint after override flip.
- PG NOTIFY refreshes override cache without restart.
- Scout action audit uses caller tx and redacts sensitive data.
Padding explicitly rejected:
- Enum snapshots.
- Cache getter/setter tests.
- Duplicate audit action snapshots with identical behavior.
Split feasibility: Already under R76; splitting audit from kill-switch would allow unguarded scout actions to slip through integration seams.
```

If prod LOC exceeds 400, stop for operator approval.

## 9. Out of scope

- Profile parsing or profile hot reload; `.A`.
- Selector execution; `.B`.
- Session login/MFA flows; `.C`.
- Diff computation; `.D`.
- tRPC route definitions; `.F`.
- Building an operator UI for overrides.
- Legal/vendor permission matrix beyond consuming `operator_overrides`.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- scout-kill-switch`
- `pnpm test -- scout-action-audit`
- `pnpm test -- operator-override-notify`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC
- Migration reversibility gate if override schema is touched
- Audit-log contract tests proving D-H6-5 caller tx usage

## 11. VERDICT line

VERDICT: _______________

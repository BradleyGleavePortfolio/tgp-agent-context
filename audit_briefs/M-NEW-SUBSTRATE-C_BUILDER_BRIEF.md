# 1. M-NEW-SUBSTRATE.C — Session Pool + MFA / Device Trust

Slug: `M-NEW-SUBSTRATE.C`

## 2. Doctrine cites

- R0/R3: Bradley-only author/committer identity; use `scripts/push_one.sh`; no assistant/agent/co-author strings.
- R52/R71/R72: checkpoint pushes, limited active lanes, dual-lens adversarial audit.
- R74/R86: tests target real auth/session outage modes; no padding.
- R75: zero banned-cast additions.
- R76: ≤400 prod LOC.
- R82: session/MFA migrations must be reversible.
- R98: credentials, OTPs, cookies, and device-trust tokens are sensitive; encrypt at rest, redact logs, and preserve only audit facts.
- R107: every session mutation and MFA state transition goes through H6A `withAuditLog` with caller-provided transaction.
- R125: `scout_sessions`, `session_cookies`, and `scout_mfa_challenges` are Tier-1 user-data tables with RLS by `coach_id` and `scout_run_id`.
- D-8: supports TOTP, SMS/email OTP, and device-trust cookies; hot reload/kill-switch handled downstream; no per-vendor code.
- D-H6-5: `withAuditLog(tx, args, op)` caller-owned transaction is mandatory.
- D-H6-6: write-path PII representation may be amended; do not hard-code a conflicting redaction primitive.

## 3. Dependencies

Must land first:

1. H6A corrected audit substrate and PII redaction primitives.
2. H6B circuit breakers for vendor login retries and MFA wait windows.
3. H6C coverage for user-mutating routes.
4. M-NEW-SCHEMA tables for scout runs, session cookies, and MFA challenges.
5. `.A` profile loader for auth/session config.
6. `.B` selector engine for login marker and challenge detection selectors.

## 4. What this slice ships

Prod LOC budget: **400 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/session/scout-session.types.ts` | 55 | Session, credential, cookie, MFA challenge, and device-trust types. |
| `src/migration-scout/session/scout-session-pool.ts` | 115 | Per-coach/vendor session checkout, lease, heartbeat, release, invalidation. |
| `src/migration-scout/session/mfa-challenge.service.ts` | 95 | Creates TOTP/SMS/email/device-trust challenges, 90s response window, status transitions. |
| `src/migration-scout/session/device-trust-cookie.store.ts` | 70 | Encrypted cookie upsert/read/rotate/invalidate abstraction. |
| `src/migration-scout/session/session-audit-wrapper.ts` | 45 | Central wrapper around session mutations using H6A caller-provided tx. |
| `src/migration-scout/session/index.ts` | 20 | Public exports. |
| **Total** | **400** | Hard R76 cap. |

## 5. Public API contract

```ts
export type ScoutSessionStatus =
  | 'pending_login'
  | 'authenticating'
  | 'mfa_required'
  | 'trusted'
  | 'active'
  | 'invalidated'
  | 'expired'
  | 'failed';

export type MfaChallengeKind = 'totp' | 'sms' | 'email' | 'device_trust';
export type MfaChallengeStatus = 'open' | 'answered' | 'expired' | 'cancelled' | 'failed';

export interface ScoutSessionPool {
  checkout(tx: Prisma.TransactionClient, input: CheckoutScoutSessionInput): Promise<ScoutSessionLease>;
  heartbeat(tx: Prisma.TransactionClient, leaseId: string): Promise<void>;
  release(tx: Prisma.TransactionClient, leaseId: string, outcome: ScoutSessionReleaseOutcome): Promise<void>;
  invalidate(tx: Prisma.TransactionClient, input: InvalidateScoutSessionInput): Promise<void>;
}

export interface MfaChallengeService {
  createChallenge(tx: Prisma.TransactionClient, input: CreateMfaChallengeInput): Promise<MfaChallengeView>;
  submitResponse(tx: Prisma.TransactionClient, input: SubmitMfaChallengeResponseInput): Promise<MfaChallengeView>;
  expireOpenChallenges(tx: Prisma.TransactionClient, now?: Date): Promise<number>;
  waitForResponse(input: WaitForMfaResponseInput): Promise<MfaChallengeResult>;
}

export interface DeviceTrustCookieStore {
  upsertEncrypted(tx: Prisma.TransactionClient, input: UpsertDeviceTrustCookieInput): Promise<void>;
  listForSession(tx: Prisma.TransactionClient, input: ListDeviceTrustCookiesInput): Promise<readonly BrowserCookie[]>;
  rotateOnInvalidation(tx: Prisma.TransactionClient, input: RotateDeviceTrustInput): Promise<void>;
}
```

Rules:

- Raw credentials and OTP values must never be logged or stored after use.
- Cookie values are encrypted at rest; audit rows store cookie names/domains and redacted fact only.
- MFA response window defaults to 90 seconds unless profile config narrows it.
- Device-trust cookies are scoped by `coach_id + vendor + domain` and invalidated on login failure or explicit operator action.
- Session leases expire and cannot be reused after release/invalidation.

## 6. Database changes

Expected ownership: M-NEW-SCHEMA, with this slice validating the contract.

Required tables:

- `scout_sessions`
  - `id uuid pk`
  - `coach_id uuid not null`
  - `vendor text not null`
  - `profile_version text not null`
  - `status text not null`
  - `lease_expires_at timestamptz null`
  - `last_heartbeat_at timestamptz null`
  - `created_at/updated_at timestamptz not null`
- `session_cookies`
  - `id uuid pk`
  - `coach_id uuid not null`
  - `vendor text not null`
  - `domain text not null`
  - `cookie_name text not null`
  - `encrypted_cookie_value bytea not null`
  - `expires_at timestamptz null`
  - `invalidated_at timestamptz null`
  - unique active cookie on `(coach_id, vendor, domain, cookie_name)`
- `scout_mfa_challenges`
  - `id uuid pk`
  - `scout_session_id uuid not null`
  - `coach_id uuid not null`
  - `kind text not null`
  - `status text not null`
  - `prompt_redacted text null`
  - `response_hash text null`
  - `expires_at timestamptz not null`
  - `answered_at timestamptz null`

RLS:

- Enable and force RLS on all three tables.
- Coach can access only rows where `coach_id = current_setting('app.coach_id')::uuid`.
- Service role can process leases but must still set tenant/coach context for audit.

R82:

- Add indexes only with reversible drops in `down.sql`.
- No destructive rename/drop in the same deploy.

## 7. Test strategy

Real failure modes only:

1. **Expired MFA cannot authenticate.** Create challenge, advance time past 90s, submit code, assert `expired` and no session becomes active.
2. **Cookie invalidation rotates trust.** Upsert trusted cookie, invalidate session, assert old cookie is not returned and audit fact is emitted with redacted value.
3. **Lease exclusivity under contention.** Two concurrent checkouts for same coach/vendor cannot both get the same active lease.
4. **Audit wrapper uses caller tx.** Session mutation test asserts H6A receives the exact transaction object from caller, not a nested transaction.

Do not test TOTP math libraries unless implemented locally; rely on library contract and test orchestration around it.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is capped at 400.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-session-mfa-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.C session pool + MFA/device trust
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Expired MFA challenge cannot activate a session.
- Device-trust cookie invalidation prevents reuse and preserves redacted audit fact.
- Concurrent checkout cannot double-lease a session.
- H6A wrapper uses caller-provided transaction.
Padding explicitly rejected:
- Enum snapshot tests.
- TOTP library internal tests.
- DTO constructor tests.
Split feasibility: Already at/under 400 LOC; splitting MFA from session pool would duplicate audit and lease plumbing.
```

If prod LOC exceeds 400, stop for operator approval.

## 9. Out of scope

- Profile parsing and validation; `.A`.
- Selector implementation; `.B`.
- Browser automation/runtime provider choice.
- Kill-switch checks and PG NOTIFY override listener; `.E`.
- Onboarding tRPC route wiring; `.F`.
- Vendor-specific MFA pages/selectors.
- Long-term legal/vendor permission matrix.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- scout-session`
- `pnpm test -- mfa-challenge`
- `pnpm test -- device-trust`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC
- Migration reversibility dry-run if schema changes are included
- RLS tests for coach isolation if tables/policies are touched

## 11. VERDICT line

VERDICT: _______________

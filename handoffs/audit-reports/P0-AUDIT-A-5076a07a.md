# P0-AUDIT — Lens A (correctness / security / RLS) — backend SHA `5076a07a`

**Rung:** `P0-AUDIT` ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md)) ·
**Subject:** `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` — *"feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to /roman/\*"* (PR #520) ·
**Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>

> **Retroactive audit.** This commit is already published on shared `main`. Per
> [R14](../../AGENT_RULES.md) failure-mode clause and ladder rung `P0-AUDIT`, the audit is produced
> **additively after the fact**. Nothing here rewrites history: **no force-push, no rebase, no
> amend** (R3-INC-1 precedent, R5). Findings are **recorded and routed to rungs**, not fixed in
> this rung — every affected file is under `src/checkout/**`, which is **W-DUN-owned** and on the
> W-IMP MUST-NOT-TOUCH list (§1). Fixing them here would breach §1 and stop-condition §5.2.

## VERDICT: FINDINGS — 0 P0 · 1 P1 · 3 P2 · 2 P3

---

## BUILD MATRIX (R124)

| Repo | Pinned (Op 74) | Live at audit time | Drift |
|---|---|---|---|
| `growth-project-backend` | `5076a07a` | `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | **none** |
| `tgp-agent-context` | `9c25a06` → superseded by the Op-74 landing | `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | expected (Op 74 itself) |
| `growth-project-mobile` | `a5933fd` | not touched by this rung | n/a |
| `tgp-importer-extension` | `95be0222` | not touched by this rung | n/a |

Backend HEAD re-read both ways (`git rev-parse HEAD` and `git ls-remote origin HEAD`) — both
`5076a07a1e54b14e3db84d3aa128fb0bb44542d7`. **No INFRA_DEATH.**

---

## Scope audited

The commit mounts `DunningLockoutGuard` as the terminal global `APP_GUARD`. The guard is the
single enforcement point for the Day-10 hard lockout, so its **only** security property is:
*while a client is locked out, every route except an explicitly allow-listed recovery route
returns `403 LOCKED_DUNNING`.* Lens A audits that property.

| File | Role |
|---|---|
| `src/checkout/dunning-v2/dunning-lockout.guard.ts` | guard + `normalizePath` + `isAllowedWhileLocked` |
| `src/app.module.ts:396-460` | `APP_GUARD` chain; lockout guard registered last |
| `src/checkout/dunning-v2/dunning-v2.feature.ts` | `FEATURE_DUNNING_V2`, default OFF |
| `prisma/schema.prisma:3781-3826` | `DunningState` |
| `test/dunning-v2-lockout-guard.spec.ts` | 14 cases |

---

## Findings

### P1-1 — Allow-list second-segment match leaks a real non-recovery route

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:163`

```ts
if (ALLOWED_PREFIXES.includes(head) || (segments[1] && ALLOWED_PREFIXES.includes(segments[1]))) {
  return true;
}
```

The second-segment clause exists to admit *"coach-scoped billing variants (e.g. `coach/billing`)"*.
It is not scoped to a billing head — it admits **any** path whose second segment is one of the
eight `ALLOWED_PREFIXES` tokens, regardless of the first segment.

`src/scheduling/google-oauth/google-oauth.controller.ts:44` mounts
`@Controller('scheduling/auth/google')`. Its second segment is `auth`.

Executed against the head's own `normalizePath` + `isAllowedWhileLocked`:

```
REACHABLE  /api/scheduling/auth/google/connect    -> scheduling/auth/google/connect
REACHABLE  /api/scheduling/auth/google/callback   -> scheduling/auth/google/callback
```

A locked-out client can complete Google Calendar OAuth while the lockout is in force. This is a
paid integration surface, not a payment-recovery route, so it is a **bypass of the guard's only
security property**. It is generic, not one-off: any future controller with `auth`, `health`,
`billing`, `checkout`, `recover`, `payment-recovery`, `healthz`, or `readyz` as its **second**
path segment silently inherits the exemption. `admin/payments` is safe only because `payments`
happens not to be in the list — the code comment at `:159-161` asserts this as if it were a
design property; it is a coincidence of vocabulary.

Not exploitable today (`FEATURE_DUNNING_V2` is default-OFF and the guard hard-no-ops at `:80`),
which is why this is P1 and not P0.

**Route to:** **DUN-1**. Replace the positional match with an explicit allow-list of full
normalized route prefixes, or restrict the second-segment clause to a known head set
(`coach`, `client`, `me`). Add a table-driven test enumerating every mounted controller against
the allow-list so a new controller cannot silently gain an exemption.

---

### P2-1 — The real coach billing route is *not* covered by the carve-out it was written for

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:157-164`

The inverse of P1-1. The comment justifies the second-segment clause with `coach/billing`, but
the repo's actual coach billing endpoint is `@Controller('v1/coach/me')` +
`@Get('billing')` (`src/billing/coach-billing.controller.ts:21,26`) → normalized
`coach/me/billing`, where `billing` is segment **three**:

```
  LOCKED    /api/v1/coach/me/billing                 -> coach/me/billing
  LOCKED    /api/v1/coach/me/billing/portal-session  -> coach/me/billing/portal-session
REACHABLE  /api/coach/billing                        -> coach/billing
```

Only the mobile variant (`src/billing/mobile-coach-billing.controller.ts:33`,
`@Controller('coach/billing')`) is admitted. `coach/me/billing/portal-session` is the Stripe
billing-portal opener — the exact route a locked user needs. Impact is bounded because the guard
locks on `ClientPurchase.client_user_id`, so a coach who is not also a client is never locked;
but a coach who *is* a client of another coach would be locked out of their own billing portal.

**Route to:** **DUN-1**, fixed together with P1-1 — both are the same allow-list defect.

---

### P2-2 — `status: 'active'` narrows the lockout read; a free-text status silently un-locks

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:127-140`

```ts
where: { locked_out_at: { not: null }, status: 'active', purchase: { client_user_id: userId, entitlement_active: false } }
```

`DunningState.status` is `String @default("active")` (`prisma/schema.prisma:3785`) with the
vocabulary carried only in a trailing comment (`active | resolved | abandoned`). There is no
enum, no CHECK constraint, and no validation on the write path. Any writer that sets a status
outside that vocabulary — or legitimately transitions a still-locked row to `abandoned` —
**releases the lockout** while `locked_out_at` remains non-null and `entitlement_active` remains
`false`. Lockout release is therefore an emergent property of an unconstrained string rather than
a declared transition.

This is precisely the condition `R-DUNNING-BAR-1` **P1** exists to remove ("entitlement as a
derived projection of an explicit state machine").

**Route to:** **DUN-1**. When the state machine lands, the lockout read must derive from the
machine's terminal state, not from a string equality.

---

### P2-3 — `DunningState.locked_out_at` is unindexed on a per-request hot path

**File:** `prisma/schema.prisma:3824-3826` (indexes: `[status]`, `[status, cancel_scheduled_at]`,
`[status, next_attempt_at]`)

With the flag ON, the guard is the terminal global `APP_GUARD`, so **every authenticated request
to a non-allow-listed route** issues `dunningState.findFirst` filtering on `locked_out_at IS NOT
NULL` joined to `ClientPurchase` on `client_user_id` + `entitlement_active`. No index covers
`locked_out_at`, and none covers the `ClientPurchase` join predicate for this shape. There is no
request-scoped memo and no cache, so N guarded requests in one page load are N queries.

Correctness is unaffected; this is a latency/SLO defect that appears only under the flag. It is
the reason `R-DUNNING-BAR-1` **P5** (declared p99 + error budget) must precede enablement.

**Route to:** **DUN-4** (SLO/observability), with the index itself in **DUN-1**'s migration.

---

### P3-1 — Two `ALLOWED_PREFIXES` entries are dead

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:47-48` (`payment-recovery`, `recover`)

No controller mounts either prefix at this head (`@Controller` scan: 0 matches). Both entries
anticipate the recovery route that does not exist yet. Harmless — but they make the allow-list
read as if a recovery path were reachable, and a reader auditing "can a locked user recover?"
would wrongly conclude yes.

This is direct confirmation of A03 **gap 3** and the reason rung **DUN-3** exists.

**Route to:** **DUN-3**. Keep the entries; they become live when the route lands.

---

### P3-2 — `lockout_copy` is computed on every 403 and then discarded

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:112-119`; envelope in `src/main.ts`

`this.voice.copyFor('lockout_day10')` runs, then the global `HttpExceptionFilter` rebuilds the
body through `buildErrorEnvelope`, which emits only
`statusCode/code/message/error/timestamp/path/request_id`. `lockout_copy` never reaches the
client. This is **known and documented** at `src/app.module.ts:450-459` and is not a regression —
recorded so the retroactive trail is complete.

**Route to:** **DUN-9** (Roman-voiced surfaces), where the envelope decision is actually made.

---

## Checks passed

- **Fail-open on lookup error** (`:99-105`) — correct. An infra fault cannot mass-lock. This is
  the single most important safety property under `R-DUNNING-BAR-1` and it holds. Covered by
  `test/dunning-v2-lockout-guard.spec.ts:155`.
- **Flag-OFF hard no-op** (`:80`) — `isDunningV2Enabled()` returns `true` only for the exact
  string `'true'` (case-insensitive); absent/empty/any other value → OFF. The guard returns
  before reading `req`, so v1 deployments are provably unaffected. Covered at `:84`.
- **Guard ordering** — `DunningLockoutGuard` is registered last in the `APP_GUARD` chain
  (`app.module.ts:396` `JwtAuthGuard` → `:408` `UserThrottlerGuard` → `:432` `RolesGuard` →
  `:460` lockout). `req.user.id` is therefore populated when the lockout guard runs. Correct.
- **Unauthenticated passthrough** (`:93-94`) — `if (!userId) return true`. Correct given the
  ordering above: public routes have no user to lock, and authenticated routes have already been
  rejected by `JwtAuthGuard`. Not a bypass.
- **Tenant scoping** — the lookup is scoped by `purchase.client_user_id === req.user.id`. No
  cross-tenant read is reachable. No raw SQL, no `$queryRaw`, no dynamic `where` construction.
- **RLS** — the guard adds no table and no migration; it reads `DunningState` through the
  service-role Prisma client on an existing FORCE-RLS table. No RLS posture change.
- **Banned casts (R75)** — 0 `as any` / `as unknown as` introduced in the guard.
- **No secret, credential, or provider key** appears in the guard or its tests.

---

## Ownership note (Op 74 §1)

Every finding above lives in `src/checkout/**` or `prisma/schema.prisma`'s `DunningState` —
**W-DUN territory**. This rung records and routes; it repairs nothing. Routing summary:

| Finding | Sev | Rung |
|---|---|---|
| P1-1 allow-list second-segment leak | P1 | **DUN-1** |
| P2-1 real coach billing route not carved out | P2 | **DUN-1** |
| P2-2 free-text `status` releases lockout | P2 | **DUN-1** |
| P2-3 `locked_out_at` unindexed hot path | P2 | **DUN-1** (index) / **DUN-4** (SLO) |
| P3-1 dead recovery prefixes | P3 | **DUN-3** |
| P3-2 `lockout_copy` dropped by envelope | P3 | **DUN-9** |

**No finding blocks the W-IMP ladder.** `FEATURE_DUNNING_V2` remains default-OFF, so none of the
above is live. Gate B (dunning activation) must not pass until P1-1, P2-1 and P2-2 are closed.

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Audit evidence only; 0 production LOC.*

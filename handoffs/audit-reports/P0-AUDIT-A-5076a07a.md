# P0-AUDIT — Lens A (correctness / security / RLS) — backend SHA `5076a07a`

## BUILD MATRIX
- backend HEAD: `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
- ctxrepo HEAD: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 head: `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`
- PR #28 base (origin/main): `b76d0962de53ce494fa8f869a706ff0c15aee0b6`
- timestamp (ISO 8601 UTC): `2026-07-27T21:30:00Z`

**Rung:** `P0-AUDIT` ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md)) ·
**Subject:** `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` — *"feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to /roman/\*"* ·
**Companion:** [Lens B](P0-AUDIT-B-5076a07a.md) ·
**Op:** 75 · **Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>

---

## BUILD MATRIX — R124 evidence (both ways, full 40-char)

The block above is the R124 verbatim format ([`AGENT_RULES.md` R124 §Compliance.1](../../AGENT_RULES.md)),
repeated identically at the top of [Lens B](P0-AUDIT-B-5076a07a.md). The evidence behind each line:

| Value | `gh api` | local `git rev-parse` / `git ls-remote` | Match |
|---|---|---|---|
| backend HEAD | `gh api repos/…/growth-project-backend/commits/HEAD --jq .sha` → `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | `git ls-remote https://…/growth-project-backend refs/heads/main` → `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | ✅ |
| ctxrepo HEAD / PR #28 head | `gh api repos/…/tgp-agent-context/pulls/28 --jq .head.sha` → `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650` | `git rev-parse HEAD` → `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`; `git ls-remote origin refs/heads/docs/op75-p0-audit-5076a07a` → same | ✅ |
| PR #28 base | `gh api …/pulls/28 --jq .base.sha` → `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | `git rev-parse HEAD^` and `git ls-remote origin refs/heads/main` → both `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | ✅ |

Backend commit envelope at the audited SHA (`gh api …/commits/5076a07a…`):
tree `ba056fff8e760f3e1a12ed628c808c104ec5be0d` · single parent
`07ff974079eb1da02f1de4f5ecd18c1f223afeae` · committer date `2026-07-23T01:26:39Z`.

**No SHA moved during this audit. No INFRA_DEATH.**

> **`ctxrepo HEAD` semantics — deliberate.** `5c2f0057` is the **exact head both independent
> reviews examined** and the head this remediation is authored against. It is the **prior tip**,
> not the SHA of the commit that carries this file: an artifact cannot record the SHA of the
> commit that lands it (the same constraint Op 74 recorded for the Op-73 context pin,
> [`BASELINE_HEADS_OP74.json`](../op74/BASELINE_HEADS_OP74.json) `repos.context.note`). **The
> post-landing context SHA is deliberately NOT claimed anywhere in this document.** Full
> reconciled pins: [`handoffs/op75/BASELINE_HEADS_OP75.json`](../op75/BASELINE_HEADS_OP75.json).

### Other repos (not touched by this rung)

| Repo | Op-74 pin | Live | Drift |
|---|---|---|---|
| `growth-project-mobile` | `a5933fd` | `a5933fd6de5616493de75f0db907098b149b955c` | none; not touched |
| `tgp-importer-extension` | `95be0222` | `95be0222df3d47d787566743c8781005d8fbec69` | none; not touched |

---

> **Retroactive audit.** This commit is already published on shared `main`. Per
> [R14](../../AGENT_RULES.md)'s failure-mode clause and ladder rung `P0-AUDIT`, the audit is
> produced **additively after the fact**. Nothing here rewrites history: **no force-push, no
> rebase, no amend** (R3-INC-1 precedent, R5). Findings are **recorded and routed**, not fixed in
> this rung — every finding but one lands in `src/checkout/**` / `DunningState`, which is
> **W-DUN-owned** and on the W-IMP MUST-NOT-TOUCH list (§1). The one exception (P3-2) lands on an
> **unowned** backend surface and is routed to an ownership decision, not to a rung that cannot
> execute it.

## Scope audited

The commit mounts `DunningLockoutGuard` as the terminal global `APP_GUARD`. The guard is the
single enforcement point for the Day-10 hard lockout, so its **only** security property is:
*while a client is locked out, every route except an explicitly allow-listed recovery route
returns `403 LOCKED_DUNNING`.* Lens A audits that property.

| File | Role |
|---|---|
| `src/checkout/dunning-v2/dunning-lockout.guard.ts` (171 lines at head) | guard + `normalizePath` + `isAllowedWhileLocked` |
| `src/app.module.ts:396-460` | `APP_GUARD` chain; lockout guard registered last |
| `src/checkout/dunning-v2/dunning-v2.feature.ts:34-36` | `FEATURE_DUNNING_V2`, default OFF |
| `prisma/schema.prisma:3781-3826` | `model DunningState` |
| `test/dunning-v2-lockout-guard.spec.ts` (167 lines) | **37** unit cases |
| `test/dunning-v2-lockout-guard.e2e.spec.ts` (307 lines) | **10** over-the-wire e2e cases |

### Measured diff at the audited SHA (R23/R74/R75/R76)

Recomputed from the GitHub commits API for `5076a07a` — **not** estimated from absolute file
sizes, and **not** deferred (an earlier draft recorded this as unmeasurable from a depth-1
worktree; see [Lens B P3-1](P0-AUDIT-B-5076a07a.md#p3-1--loc-and-testsrc-are-now-measured-at-this-head-earlier-not-measurable-claim-superseded)).

| Path | + | − | Class |
|---|---|---|---|
| `src/app.module.ts` | 29 | 0 | production |
| `src/checkout/dunning-v2/dunning-lockout.guard.ts` | 27 | 23 | production |
| `test/dunning-v2-lockout-guard.e2e.spec.ts` | 307 | 0 | test |
| `test/dunning-v2-lockout-guard.spec.ts` | 32 | 25 | test |
| **totals** | **395** | **48** | 4 files |

- **Production LOC added: 56** (`29 + 27`). **R23/R76 ≤ 400 — PASS**, at 14% of the cap.
- **Test lines added: 339** (`307 + 32`). **R74 test:src = 339 ÷ 56 = 6.05:1** — **PASS**,
  3.0× the 2.0 floor.
- **R75 banned-cast net = 0**, computed over **`src/` AND `test/`** in the full 551-line patch:
  0 added and 0 removed occurrences of `@ts-ignore` / `as any` / `as unknown as` / `as never` /
  `Coming soon`. Scoping the R75 grep to `src/` only is the misread named in
  [R131](../../AGENT_RULES.md); it is stated here as the full-surface measurement.

---

## Findings

### P1-1 — Allow-list second-segment match leaks a real non-recovery route

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:163`

```ts
if (ALLOWED_PREFIXES.includes(head) || (segments[1] && ALLOWED_PREFIXES.includes(segments[1]))) {
  return true;
}
```

The second-segment clause exists to admit *"coach-scoped billing variants (e.g. `coach/billing`)"*
(comment at `:157-161`). It is not scoped to a billing head — it admits **any** path whose second
segment is one of the eight `ALLOWED_PREFIXES` tokens (`:45-54`), regardless of the first segment.

`src/scheduling/google-oauth/google-oauth.controller.ts:44` mounts
`@Controller('scheduling/auth/google')` with `@Get('initiate')` (`:48`) and `@Get('callback')`
(`:70`). Its second segment is `auth`.

Executed against the head's own `normalizePath` + `isAllowedWhileLocked`, over the **actually
mounted** decorator pairs (`@Controller` + method decorators enumerated from the head's tree —
161 controllers scanned):

```
REACHABLE  /api/scheduling/auth/google/initiate   -> scheduling/auth/google/initiate
REACHABLE  /api/scheduling/auth/google/callback   -> scheduling/auth/google/callback
```

> **Route names corrected (Op-75 remediation).** An earlier draft of this finding listed
> `scheduling/auth/google/connect`. **No `connect` route is mounted at this head** — the two
> mounted methods are `initiate` and `callback`. The defect and its severity are unchanged; only
> the route names were wrong. Prior wording recorded here rather than silently replaced (R5/R132).

A locked-out client can complete Google Calendar OAuth while the lockout is in force. This is a
paid integration surface, not a payment-recovery route, so it is a **bypass of the guard's only
security property**. It is generic, not one-off: any future controller with `auth`, `health`,
`billing`, `checkout`, `recover`, `payment-recovery`, `healthz`, or `readyz` as its **second**
path segment silently inherits the exemption. `admin/payments` is safe only because `payments`
happens not to be in the list — the comment at `:159-161` asserts this as if it were a design
property; it is a coincidence of vocabulary.

Not exploitable today (`FEATURE_DUNNING_V2` is default-OFF and the guard hard-no-ops at `:80`),
which is why this is P1 and not P0.

**Route to:** **DUN-1** (backend, W-DUN-owned). Replace the positional match with an explicit
allow-list of full normalized route prefixes, or restrict the second-segment clause to a known
head set. Add a table-driven test enumerating **every mounted controller** against the allow-list
so a new controller cannot silently gain an exemption.

---

### P2-1 — The carve-out the second-segment clause was written for does not cover the v1 coach billing route

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:157-164`

The inverse of P1-1. `normalizePath` (`:145-153`) strips a leading `v1/`, so the two coach
billing surfaces normalize differently:

| Mounted route | Decorators | Normalized | Verdict while locked |
|---|---|---|---|
| `/api/v1/coach/me/billing` | `@Controller('v1/coach/me')` + `@Get('billing')` (`src/billing/coach-billing.controller.ts:21,26`) | `coach/me/billing` | **LOCKED** |
| `/api/v1/coach/me/billing/portal-session` | `@Controller('v1/coach/me')` + `@Post('billing/portal-session')` (`:21,51`) | `coach/me/billing/portal-session` | **LOCKED** |
| `/api/coach/billing/status` | `@Controller('coach/billing')` + `@Get('status')` (`src/billing/mobile-coach-billing.controller.ts:33,43`) | `coach/billing/status` | REACHABLE |
| `/api/coach/billing/portal-session` | `@Controller('coach/billing')` + `@Post('portal-session')` (`:33,83`) | `coach/billing/portal-session` | REACHABLE |

> **Route names corrected (Op-75 remediation).** An earlier draft listed the bare paths
> `coach/me/billing`, `coach/me/billing/portal-session` and `coach/billing`. `coach/billing` is a
> **`@Controller` prefix, not a mounted route** — the mounted mobile routes are
> `coach/billing/status` and `coach/billing/portal-session`. Prior wording recorded, not erased
> (R5/R132). The defect is unchanged: only the **mobile** variant is admitted.

`coach/me/billing/portal-session` is the Stripe billing-portal opener — the exact route a locked
user needs. Impact is bounded because the guard locks on `ClientPurchase.client_user_id`
(`:127-140`), so a coach who is not also a client is never locked; but a coach who *is* a client
of another coach would be locked out of their own v1 billing portal while the mobile variant of
the same capability stays open. Two routes to one capability, opposite lockout verdicts, by
accident of segment position.

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
**releases the lockout** while `locked_out_at` remains non-null (`:3815`) and
`entitlement_active` remains `false`. Lockout release is therefore an emergent property of an
unconstrained string rather than a declared transition.

This is precisely the condition [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md)
**P1** exists to remove ("entitlement as a derived projection of an explicit state machine").

**Route to:** **DUN-1**. When the state machine lands, the lockout read must derive from the
machine's terminal state, not from a string equality.

---

### P2-3 — `DunningState.locked_out_at` is unindexed on a per-request hot path

**File:** `prisma/schema.prisma:3824-3826` — the three declared indexes are `[status]`,
`[status, cancel_scheduled_at]`, `[status, next_attempt_at]`.

With the flag ON, the guard is the terminal global `APP_GUARD`, so **every authenticated request
to a non-allow-listed route** issues `dunningState.findFirst` filtering on `locked_out_at IS NOT
NULL` joined to `ClientPurchase` on `client_user_id` + `entitlement_active`. No index covers
`locked_out_at`, and none covers the `ClientPurchase` join predicate for this shape. There is no
request-scoped memo and no cache, so N guarded requests in one page load are N queries.

Correctness is unaffected; this is a latency/SLO defect that appears only under the flag. It is
the reason `R-DUNNING-BAR-1` **P5** (declared p99 + error budget, grounded in **R86**) must
precede enablement.

**Route to:** **DUN-4** (SLO/observability), with the index itself in **DUN-1**'s migration.

---

### P3-1 — Two `ALLOWED_PREFIXES` entries are dead

**File:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:47-48` (`payment-recovery`, `recover`)

No controller mounts either prefix at this head (`@Controller` scan across all 161 controller
files in the head's tree: 0 matches). Both entries anticipate the recovery route that does not
exist yet. Harmless — but they make the allow-list read as if a recovery path were reachable, and
a reader auditing "can a locked user recover?" would wrongly conclude yes.

This is direct confirmation of A03 **gap 3** and the reason rung **DUN-3** exists.

**Route to:** **DUN-3**. Keep the entries; they become live when the route lands.

---

### P3-2 — `lockout_copy` is computed on every 403 and then discarded by the error envelope

**Files:** `src/checkout/dunning-v2/dunning-lockout.guard.ts:112-119` (producer) ·
`src/filters/not-found-envelope.ts:12-38` (`ErrorEnvelopeFields` + `buildErrorEnvelope`) ·
`src/filters/http-exception.filter.ts` (the global filter that calls it)

`this.voice.copyFor('lockout_day10')` runs and is attached to the `ForbiddenException` payload,
then the global `HttpExceptionFilter` rebuilds the body through `buildErrorEnvelope`, whose
`ErrorEnvelopeFields` interface admits only `statusCode / code / message / error / timestamp /
path / request_id`. `lockout_copy` is not a member of that interface and never reaches the
client. This is **known and documented** at `src/app.module.ts:450-459` and is not a regression —
recorded so the retroactive trail is complete.

> **Implementation path corrected (Op-75 remediation).** An earlier draft placed the envelope in
> **`src/main.ts`**. That is wrong: `src/main.ts` bootstraps the app and does not define the
> envelope. `buildErrorEnvelope` and the `ErrorEnvelopeFields` interface are defined in
> **`src/filters/not-found-envelope.ts`** and consumed by `src/filters/http-exception.filter.ts`.
> Prior path recorded, not erased (R5/R132). This matters operationally: the fix touches
> `src/filters/**`, which changes **who is allowed to make it**.

**Route to — ownership decision required, NOT `DUN-9`.**

> **Routing corrected (Op-75 remediation).** An earlier draft routed this to **`DUN-9`**. `DUN-9`
> is a **mobile** rung ("Re-engagement UX + Roman-voiced surfaces", `OWNERSHIP_AND_PR_LADDER.md`
> §3, `Repo: mobile`). A mobile rung **cannot** widen a backend error envelope, so that routing
> was unexecutable as written. Prior routing recorded, not erased (R5/R132).

`src/filters/**` appears on **neither** the W-IMP nor the W-DUN OWNS list, and is not on either
MUST-NOT-TOUCH list either — it is an **unowned cross-cutting backend surface**. Under
`OWNERSHIP_AND_PR_LADDER.md` §1 there is therefore **no workstream currently authorized to
change it**, and §5 stop-condition 2 (a rung needing scope not named in it requires a fresh
**R138** four-question gate first) applies. The correct disposition is therefore, in order:

1. **Assign the surface.** `src/filters/**` needs an explicit §1 owner (or an explicit
   "cross-cutting, requires its own R138 gate" designation). Recorded as a governance action in
   [`handoffs/op75/PRE_BUILD_REVIEW_OP75.md`](../op75/PRE_BUILD_REVIEW_OP75.md) §6 — **this
   audit does not assign it**, because §1 authorship is not a `P0-AUDIT` power.
2. **Then** an authorized **backend** rung (candidate: fold into **DUN-4**'s scope, which already
   owns the guard's observability contract, or open a fresh R138-gated backend rung) makes the
   envelope change under the R80 contract discipline — widening a client-visible error body is a
   contract change.
3. **Only then** may **DUN-9** (mobile) consume `lockout_copy`. `DUN-9` remains correctly
   dependent, not responsible.

Until step 1 lands, the honest statement of the client-visible 403 contract at this head is
**exactly `code` + `message`** — which is what the commit message and `app.module.ts:450-459`
already say. Gated behind **Gate B**; not a blocker on `I1`.

---

## Checks passed

- **Fail-open on lookup error** (`:99-105`) — correct. An infra fault cannot mass-lock. This is
  the single most important safety property under `R-DUNNING-BAR-1` **P8** and it holds. Covered
  by `test/dunning-v2-lockout-guard.spec.ts:155`.
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
- **R75 banned casts — net 0 across `src/` AND `test/`** (measured above, not src-scoped).
- **R23/R76 — 56 production LOC**, 14% of the 400 cap. **R74 — 6.05:1** test:src.
- **No secret, credential, or provider key** appears in the guard, its tests, or the diff.

---

## Ownership note (Op 74 §1)

Five of six findings live in `src/checkout/**` or `prisma/schema.prisma`'s `DunningState` —
**W-DUN territory**. This rung records and routes; it repairs nothing.

| Finding | Sev | Routed to | Executable as routed? |
|---|---|---|---|
| P1-1 allow-list second-segment leak (`initiate`, `callback`) | P1 | **DUN-1** (backend, W-DUN) | yes |
| P2-1 v1 `coach/me/billing*` not carved out; mobile `coach/billing/*` is | P2 | **DUN-1** | yes |
| P2-2 free-text `status` releases lockout | P2 | **DUN-1** | yes |
| P2-3 `locked_out_at` unindexed hot path | P2 | **DUN-1** (index) / **DUN-4** (SLO) | yes |
| P3-1 dead recovery prefixes | P3 | **DUN-3** | yes |
| P3-2 `lockout_copy` dropped by `src/filters/not-found-envelope.ts` | P3 | **ownership decision first** (`src/filters/**` unowned), then an authorized backend rung; `DUN-9` consumes only | **no** — blocked on §1 assignment |

**No finding blocks the W-IMP ladder.** `FEATURE_DUNNING_V2` remains default-OFF, so none of the
above is live. **Gate B** (dunning activation) must not pass until P1-1, P2-1 and P2-2 are closed.

---

## Remediation record for this document (Op 75, newest-wins)

Corrections applied at the Op-75 remediation pass, after two independent exact-head reviews of
`5c2f0057`. Every prior wording is retained visibly in place above under R5/R132 — nothing was
silently rewritten.

| # | Corrected | Was | Now |
|---|---|---|---|
| 1 | R124 BUILD MATRIX | 4-row drift table, no verbatim block, short SHAs, no PR head/base, no timestamp | Full **six-line** verbatim R124 block at the very top, full 40-char SHAs, PR #28 head + base, UTC timestamp, both-ways `gh api` vs local evidence table |
| 2 | Google OAuth route names | `scheduling/auth/google/connect` | `scheduling/auth/google/initiate`, `scheduling/auth/google/callback` |
| 3 | Coach billing route names | bare `coach/billing`, `coach/me/billing` | mounted `coach/billing/status`, `coach/billing/portal-session` (reachable) vs `coach/me/billing`, `coach/me/billing/portal-session` (locked) |
| 4 | Error-envelope path | `src/main.ts` | `src/filters/not-found-envelope.ts` (+ `src/filters/http-exception.filter.ts`) |
| 5 | P3-2 routing | mobile **`DUN-9`** — unexecutable | ownership decision on unowned `src/filters/**`, then an authorized **backend** rung; `DUN-9` consumes only |
| 6 | Unit test count | 14 | **37** unit (1 `normalizePath` + 15 ALLOWS + 12 BLOCKS + 9 guard) + **10** e2e = **47** |
| 7 | LOC / ratio | absent (deferred as unmeasurable) | **56** production LOC; **6.05:1** test:src; both measured from the commits API |
| 8 | R75 scope | "0 `as any` … in the guard" (src-scoped, the R131-named misread) | net **0** across **`src/` + `test/`** over the full 551-line patch |
| 9 | Verdict line | `## VERDICT:` heading at line 14, above the findings | exactly one `VERDICT:` line, on the **true final line** (R78/R16) |

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Audit evidence only; 0
production LOC in this document's PR. Findings recorded and routed; nothing repaired here.*

VERDICT: FINDINGS — 0 P0 · 1 P1 · 3 P2 · 2 P3

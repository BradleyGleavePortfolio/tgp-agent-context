# TM-5 Audit — Lens B (CYCLE adversarial auditor)

- **PR:** #435 — `feat/tm-5-apply-precoach`
- **SHA audited:** `c7298ae101906e431cde248f5e1e7560b4b645a1`
- **HEAD verified:** `c7298ae1` (clean tree; branch `feat/tm-5-apply-precoach`)
- **Lens:** B (CYCLE adversarial) — second of dual GPT-5.5 audit (R72)
- **Scope:** Apply funnel + pre-coach account + applicant profile (talent-marketplace)
- **Mode:** READ-ONLY. No code written or pushed to the backend repo.
- **Date:** 2026-06-18

---

## VERDICT: CLEAN

## COUNTS: P0=0  P1=0  P2=0  P3=0

No blocking or sub-blocking findings. The apply lane is owner-scoped at every read,
returns explicit allow-list DTOs at every boundary, idempotent at two independent
layers (ledger fencing-nonce + DB unique key), and emits zero PII to logs or
analytics. The single residual observation (listing-existence enumeration via
201-vs-404) is a deliberate, RLS-mirroring design property of a public funnel and
does not rise to P3 — recorded below as a non-blocking note.

---

## DIFF SCOPE

10 files, +1694/−2. All within the `talent-marketplace` apply lane plus module wiring:

```
src/talent-marketplace/apply.controller.ts                 (+96)
src/talent-marketplace/apply.service.ts                    (+486)
src/talent-marketplace/apply.dto.ts                        (+217)
src/talent-marketplace/apply-fit.ts                        (+81)
src/talent-marketplace/application-cursor.ts               (+39)
src/talent-marketplace/talent-marketplace.module.ts        (+14/−2)
src/talent-marketplace/__tests__/apply.controller.spec.ts  (+181)
src/talent-marketplace/__tests__/apply.service.spec.ts     (+392)
src/talent-marketplace/__tests__/apply-fit.spec.ts         (+121)
src/talent-marketplace/__tests__/application-cursor.spec.ts (+69)
```

- **No new Prisma migration in this PR.** The `Applicant` / `Application` /
  `MarketplaceMutationIdempotency` / `MarketplaceAbuseSignal` tables + RLS pre-exist
  on `main` from the TM-1 foundation migration (`20261220000000_talent_marketplace_rls`).
  This lane consumes that RLS rather than adding any.
- **Anti-bot lane is pre-existing** (landed prior; not in this diff). TM-5 only
  *applies* `@AntiBotGate(Apply) + AntiBotGuard` to the apply route and imports
  `AntiBotModule` in the marketplace module.

---

## CYCLE-LENS VERIFICATION (12 checks)

### 1. Cross-tenant / cross-applicant read leak — PASS
- `getOwnProfile` / `updateOwnProfile` query `where: { user_id: userId }` where
  `userId = req.user.id` (session subject), never a URL param.
  (`apply.service.ts:124`, `:137`, `:153`)
- `myApplications` filters `where: { applicant_user_id: userId }` and applies the
  owner scope **independently of the cursor** (`apply.service.ts:167`), so a forged
  cursor cannot widen visibility.
- Controller forwards `req.user.id` only — pinned by spec
  (`apply.controller.spec.ts:81-110`). No route accepts an applicant/user id from
  the path or body for a read.
- Defense-in-depth on top of RLS: `p_application_select` =
  `(applicant_user_id = app.current_user_id() OR hirer_id = app.current_user_id())`;
  `p_applicant_select` = `user_id = self` (+ head-coach assignment). Anon → zero rows.

### 2. Replay / double-submit idempotency — PASS
- Two independent layers:
  - **Ledger** (`MarketplaceIdempotencyService`): `claimOrReplay` inserts a `pending`
    row under composite-unique `(user_id, route_key, idempotency_key)` with a fresh
    **fencing `claim_nonce`**. Completed row → `replay` (verbatim stored response).
    Fresh pending within TTL → `in_flight` (retryable 409, never a bogus success).
    Stale pending (> TTL, default 600s) → reclaimed with a **rotated nonce** that
    fences the dead owner (P1-8 staleness sweep). `markCompleted` / `releaseClaim`
    are compare-and-set on the nonce → typed `conflict`, never a silent blind write.
  - **DB**: `Application.idempotency_key` is `@unique`; the create stamps
    `${idempotencyKey}:application`. A concurrent winner triggers P2002, caught in
    `apply()` → `releaseClaim` + `recoverConfirmation` (owner-scoped read-back),
    returning the existing application rather than a 500 (`apply.service.ts:106-119`).
- Default key is namespaced per `(account, listing)`: `apply:${account.id}:${listing.id}`
  (`apply.service.ts:75-77`), pinned by spec (`apply.service.spec.ts:336`). No
  cross-user key collision possible.
- **Note (non-blocking):** schema has no `@@unique([applicant_user_id, listing_id])`,
  so two *different* idempotency keys (e.g. a client-supplied key on one tap and the
  default key on another) could in principle create two applications to the same
  listing by the same applicant. In practice the funnel sends a stable key per
  attempt and the default key is deterministic, so the realistic double-tap path is
  covered. A semantic "one application per (applicant, listing)" constraint would be
  a hardening improvement, not a defect of the idempotency contract under audit.

### 3. Account takeover / pre-coach account confusion — PASS
- `resolveAccount` looks up by normalized email (`trim().toLowerCase()`), returns the
  existing row if present, else creates with `supabase_id = precoach:<sha256(email)>`
  — an explicit placeholder identity, **not** a real Supabase principal
  (`apply.service.ts:263-299`). The pre-coach account cannot authenticate as anyone;
  TM-12 auto-flip links a real identity at conversion.
- Email-uniqueness race handled: P2002 on user-create → re-read winner row
  (`apply.service.ts:284-298`). No duplicate accounts, no lost-update takeover.
- Apply is `@Public()` but mints only a `role: 'student'` pre-coach account; it cannot
  self-assign coach/owner (role is hard-coded server-side, `apply.service.ts:280`).

### 4. Consent drift — N/A (no consent bit in scope)
- No consent/marketing-opt-in field exists on `ApplyDto`, `UpdateApplicantDto`, or the
  `Applicant` model. There is no consent state to drift. If a consent bit is added
  later it must be a server-set field, not a client-writable DTO field — flagged for
  the next lane that introduces it, not actionable here.

### 5. Fit-scoring opacity / protected attributes — PASS
- `computeFitSignal` is a **pure, deterministic, side-effect-free** function
  (`apply-fit.ts:26`). Two explainable axes only: specialty overlap (0.7) +
  compensation_type alignment (0.3), clamped to an integer 0–100.
- **No protected attributes**: age, gender, ethnicity, location are never inputs.
  `years_experience` is collected but **deliberately not used** in fit. No proxy
  for a protected class.
- Replay/listed cards re-derive the chip from the stored `fit_score` via `fitFromScore`,
  whose thresholds mirror `computeFitSignal` (STRONG≥67 / MODERATE≥34), so a listed or
  replayed card reads identically to the live submit (`apply.service.ts:393-398`).
- Purity / ranking pinned by spec (`apply-fit.spec.ts`).

### 6. Anonymous confirmation contract (luxury / peak-end) — PASS
- Apply returns a definitive `ApplyConfirmationDto` (application id + celebratable
  status + one fit chip + what's-next copy), never an empty 200 (`apply.service.ts:362-382`).
- The confirmation is an **exact allow-list** — `application_id`, `applicant_id`,
  `account_id`, `status`, `fit`, `confirmation` ONLY. Negative-assert spec confirms
  no applicant email and no `hirer_id` ever cross back to the public caller
  (`apply.service.spec.ts:263-276`).
- Replay path validates the stored ledger JSON **field-by-field**
  (`parseLedgerConfirmation` / `parseLedgerFit` / `parseLedgerCopy` return null on any
  shape mismatch → loud 409 `apply_replay_corrupt`), so a malformed ledger row cannot
  smuggle an off-shape object past the type system (`apply.service.ts:421-486`).

### 7. DTOs as PII contract (no raw-entity spread) — PASS
- Every response is an explicit interface allow-list (`ApplicantProfileDto`,
  `MyApplicationCardDto`, `ApplyConfirmationDto`, `FitSignalDto`). Mappers
  `toProfile` / `toCard` / `toConfirmation` enumerate named fields; no raw
  `Applicant` / `Application` / `User` entity is ever spread or returned
  (`apply.service.ts:334-382`).
- `MyApplicationCardDto` carries no `hirer_id`, no `applicant_user_id`, no email —
  pinned by exact key-set assert (`apply.service.spec.ts:185-187`).
- Profile echoes identity (email, names) back to the **owner only**; never to any
  other principal (the only readers are the reads-own routes).
- Input DTOs are fully bounded (email MaxLength 254 + IsEmail; names 80;
  arrays ArrayMaxSize 20 + per-item 120; years 0–80; urls require_protocol;
  cover_note 4000; cursor 512; limit 1–50).

### 8. RLS defense-in-depth — PASS
- `Application`: RLS ENABLED + FORCED. SELECT owner-or-hirer; INSERT pins
  `applicant_user_id = self`; UPDATE owner-pinned.
- `Applicant`: RLS ENABLED + FORCED; `user_id = self` (+ head-coach via
  `TeamSubCoachAssignment`).
- `MarketplaceMutationIdempotency`: RESTRICTIVE deny-all to anon + authenticated;
  service_role bypass only (the ledger is never client-reachable).
- Service-layer owner scoping is layered on top, so a hypothetical RLS regression
  still fails closed at the query `where`.

### 9. Posthog / analytics PII risk — PASS (no analytics in lane)
- Grep for `posthog|capture|track|analytics` across `src/talent-marketplace` →
  **zero matches**. The apply lane emits no analytics events at all, so there is no
  payload that could carry email/name.
- The `posthog-event-names` doctrine pin test contains no apply entries — consistent
  with the lane emitting nothing (nothing to register).

### 10. PII in logs / abuse store — PASS
- Top-of-file guardrail honored: no `console.*` of raw email/phone/IP. Spec actively
  asserts `jo@example.com` never appears across `console.log/error/warn` on a
  happy-path apply (`apply.service.spec.ts:340-391`).
- Idempotency logs use only `user_id` + `route_key` (opaque ids), never PII.
- Anti-bot abuse store (`MarketplaceAbuseSignal`): IP, identity (email/user-id), and
  device are **sha256-hashed before storage** (`in-house-anti-bot.provider.ts:153-155`,
  `:68-72`). No raw PII persisted. Provider fails OPEN by design (gate is
  defense-in-depth, never the sole control).

### 11. Banned-token grep — PASS
- Grep for `@ts-ignore | as any | as unknown as | as never | .catch(()=>undefined) |
  "Coming soon"` across the TM-5 lane → **zero matches**. Test doubles use
  `Object.create(Prototype)` + `Object.assign` to stay structurally typed without a
  forbidden cast; controller spec uses `satisfies User`.

### 12. Doctrine pins (roles-enforced + posthog-event-names) — PASS
- **roles-enforced:** `apply.controller.spec.ts:117-161` pins the exact per-route
  posture — `applyToListing` is `@Public()` + carries `ANTI_BOT_SURFACE_KEY === Apply`
  and is **not** `@Roles` (else RolesGuard would 403 every anonymous applicant);
  `getMyProfile` / `updateMyProfile` / `myApplications` are `@Roles(['student'])` and
  never `@Public()`; no route gated to `coach`/`owner`.
- **posthog-event-names:** no apply events emitted ⇒ no entries required; pin remains
  green (see check #9).
- Module wiring complete: `AntiBotModule` imported; `ApplyService`,
  `MarketplaceIdempotencyService`, `JwtAuthGuard`, etc. all registered
  (`talent-marketplace.module.ts`).

---

## NON-BLOCKING OBSERVATIONS (recorded, below P3 — no action required for merge)

1. **Listing-existence enumeration (201-vs-404).** An anonymous caller can distinguish
   a published listing (201 + confirmation) from a missing/draft/closed one (404
   `job_listing_not_found`) — `apply.service.ts:63-66`, pinned by
   `apply.controller.spec.ts:167-181`. This is the intended public-funnel behavior and
   *mirrors RLS* (drafts are invisible to the public). Listing ids are public UUIDs
   already surfaced by the TM-3 public-browse lane, so the 404 leaks nothing the
   browse surface doesn't. The anti-bot rate ceiling (default 8/IP/10min) bounds
   bulk probing. Not a finding.

2. **Unsigned tuple cursor (divergence from TM-3).** `application-cursor.ts` is an
   unsigned base64url `(created_at, id)` cursor, whereas TM-3's public cursor is
   HMAC-signed. Because `myApplications` re-applies `applicant_user_id = self`
   independently of the cursor, a forged/tampered cursor can only reposition the
   caller within *their own* rows (or degrade to page 1 on malformed input) — it
   cannot widen visibility or leak another applicant's data. The file's own comment
   flags it as an inline copy to be hoisted onto a shared module once TM-3 lands.
   Acceptable for an owner-scoped private list; not a finding.

3. **No `@@unique([applicant_user_id, listing_id])`.** See check #2 note. The
   idempotency contract under audit holds; a semantic single-application constraint
   would be a future hardening, not a defect.

These three are intentionally *not* logged as P3 because each is either a deliberate
design property (1), strictly contained by an independent owner scope (2), or outside
the idempotency contract this PR establishes (3). Lens A may weigh them differently;
flagged here for cross-lens reconciliation.

---

## SHA STABILITY

- Audited at `c7298ae101906e431cde248f5e1e7560b4b645a1` throughout.
- `git rev-parse HEAD` == `c7298ae1…`; working tree clean; branch
  `feat/tm-5-apply-precoach`.
- No code written or pushed to the backend repo during this audit (read-only).

## FALSE-POSITIVE GUARD

- Findings derived from source + the lane's own pin specs (which encode the intended
  contract). No finding contradicts a green pin test. The single enumeration
  observation is explicitly the *documented* design (spec
  `apply.controller.spec.ts:167-181`), so flagging it as a defect would be a
  false positive — hence recorded as a note, not a P-level finding.

---

## RECOMMENDATION

**CLEAN — clear to merge from Lens B.** Reconcile the three non-blocking observations
with Lens A; none blocks merge under R81 (zero P0–P3).

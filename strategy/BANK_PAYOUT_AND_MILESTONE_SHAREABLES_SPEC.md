# BANK-ACCOUNT PAYOUTS + FIRST-PAYMENT WOW (ED.3) + MILESTONE SHAREABLES — Combined Spec

> Single source of truth for three interrelated TGP features that share one **milestone-primitives** backend. Bundled because they all read from / write to the same `CoachMilestone` table and the same Stripe Connect money-movement surface.
>
> Status: draft for operator review (Dynasia). Repo: https://github.com/BradleyGleavePortfolio/tgp-agent-context
> Date: 2026-06-09. Surfaces in scope: coach app + backend. Out of scope: client app payment UI changes (card-only status quo for v1).
> Roman voice + mascot are governed by `tgp-agent-context/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md` (context #6). All user-facing copy here defers to that contract.

---

## 0. The three features and why they are one spec

| Feature | One-line | Shared backbone |
| --- | --- | --- |
| **Bank-Account Payouts** | Let coaches receive payouts to a linked bank account, not only via Stripe Express's managed payout schedule. | Stripe Connect money-movement + new `PayoutMethod` model. |
| **First-Payment Wow Screen (ED.3)** | The single most emotionally important coach moment — their first-ever payment — rendered as a celebratory screen with Roman. | `CoachMilestone` table + Supabase realtime + MMKV gate. |
| **Coach Milestone Shareables** | Auto-generated Instagram-ready graphics for revenue milestones ($5k MRR, $100k Collected, etc.). | Same `CoachMilestone` table + server-side image generation. |

The unifying primitive is **`CoachMilestone`** — a single append-only-ish row per `(coach_id, kind)` that the payment webhook, the nightly cron, the wow screen, and the shareable renderer all read and write. Build it once; the three features are surfaces over it.

---

## 1. Architecture decision (LOCKED)

### 1.1 The four options considered

| Option | What it is | Payout speed | Who files 1099-K | Compliance burden on TGP |
| --- | --- | --- | --- | --- |
| **A — Stripe Connect Express** (status quo) | Stripe-managed dashboard + payout schedule. | T+2 ACH | Stripe | None |
| **B — Stripe Connect Custom + Financial Connections** ✅ **v1** | We control the payout UX; coach links a bank via Stripe Financial Connections; Stripe still moves money + files 1099-K. | T+2 ACH | Stripe | None |
| **C — Stripe Treasury** (flag-flip upgrade) | Stripe-issued financial accounts; stored balance ledger; faster ACH. | T+1 ACH | Stripe | Low (Stripe Treasury terms; approval required) |
| **D — Dwolla / Modern Treasury** (rejected) | We own the bank rails directly. | Varies | **TGP** | High — TGP becomes a TPSO (~$15–25k/yr + 40–60 hrs/yr) |

### 1.2 The decision

- **v1 ships on Option B — Stripe Connect Custom + Stripe Financial Connections.** This is the fastest path to a real bank-payout experience that we control, while Stripe remains the merchant-of-record and the 1099-K filer. Coaches link a bank account through the Stripe Financial Connections widget; we create an `external_account` on the coach's Connect **Custom** account and route payouts there. T+2 ACH.
- **Architect for Option C from day one.** Stripe Treasury becomes a **flag-flip upgrade** (`FEATURE_STRIPE_TREASURY_PAYOUTS`) once Stripe approves us for Treasury access. The `PayoutMethod.kind` enum already reserves `STRIPE_TREASURY`; the routing switch already has a (currently inert) branch for it. See §6.
- **Option D is explicitly rejected for v1.** Moving off Stripe rails would make TGP a Third-Party Settlement Organization (TPSO) and a payment facilitator, inheriting all 1099-K / W-9 / backup-withholding / B-notice obligations. See §5.

### 1.3 Client payment rails for v1

- **Card only (status quo).** No change to the client-side checkout. ACH-from-client (the client paying by bank debit instead of card) is a **future** addition, not v1. The platform-fee formula in §4 is already written to reward the lower-cost ACH rail when it lands, but no ACH-from-client code ships in v1.

---

## 2. Bank-Account Payouts — backend module sketch

### 2.1 New module: `src/payouts-v2/`

A new, self-contained NestJS module. It does not modify the existing `src/checkout/` payment-ops surface; it adds a parallel payout-method layer that the existing Stripe webhook handler delegates to.

```
src/payouts-v2/
├── payouts-v2.module.ts
├── payout-method.service.ts        // PayoutMethodService
├── payout-method.controller.ts     // PayoutMethodController
├── platform-fee.service.ts         // PlatformFeeService (§2.6)
├── stripe-financial-connections.service.ts   // wraps Stripe FC session + external_account creation
├── dto/
│   ├── link-bank-account.dto.ts
│   └── set-default-payout-method.dto.ts
└── payouts-v2.spec.ts
```

**`PayoutMethodService`** — responsibilities:
- `listForCoach(coachId)` → all `PayoutMethod` rows for a coach (cursor-bounded; mirror the repo's existing cursor idiom, default 50 / max 100).
- `createFromFinancialConnections({ coachId, fcSessionId })` → exchange the Financial Connections session for a Stripe bank account token, create an `external_account` on the coach's Connect Custom account, persist a `PayoutMethod` row with `status = PENDING_VERIFICATION`.
- `markVerified(payoutMethodId)` / `markDisabled(payoutMethodId)` → status transitions driven by Stripe `account.external_account.updated` webhooks.
- `setDefault({ coachId, payoutMethodId })` → set `User.default_payout_method_id`, unset `default` on the previously-default row, set it on the new one (single transaction).

**`PayoutMethodController`** — routes (all coach-scoped, guarded by the existing `@Roles('coach')` + auth guard; strict `req.user.id` scope to prevent IDOR per 50-Failures #5):
- `POST /me/payout-methods/financial-connections/session` → returns a Stripe Financial Connections client secret for the widget.
- `POST /me/payout-methods/financial-connections/complete` → body `{ fcSessionId }` → calls `createFromFinancialConnections`, returns the new `PayoutMethod`.
- `GET /me/payout-methods` → cursor-paginated list.
- `POST /me/payout-methods/:id/default` → set default.
- `DELETE /me/payout-methods/:id` → soft-disable (`status = DISABLED`); never allow deleting the only verified method if a payout is in flight.

### 2.2 New Prisma model: `PayoutMethod`

```prisma
enum PayoutMethodKind {
  STRIPE_EXPRESS
  STRIPE_CONNECT_CUSTOM_BANK
  STRIPE_TREASURY
}

enum PayoutMethodStatus {
  PENDING_VERIFICATION
  VERIFIED
  DISABLED
}

model PayoutMethod {
  id                         String              @id @default(cuid())
  coach_id                   String
  kind                       PayoutMethodKind
  stripe_external_account_id String?             // ba_... or fca_... ; null for pure Express
  last4                      String?
  bank_name                  String?
  status                     PayoutMethodStatus  @default(PENDING_VERIFICATION)
  default                    Boolean             @default(false)
  created_at                 DateTime            @default(now())

  coach                      User                @relation("CoachPayoutMethods", fields: [coach_id], references: [id])

  @@index([coach_id])
  @@index([coach_id, status])
}
```

### 2.3 Migration: NEW table only

- The migration creates **only** the `PayoutMethod` table (+ the two new enums) and adds **one** nullable FK column to `User`:
  ```prisma
  // on model User
  default_payout_method_id String?       // nullable FK → PayoutMethod.id
  default_payout_method    PayoutMethod? @relation("UserDefaultPayoutMethod", fields: [default_payout_method_id], references: [id])
  payout_methods           PayoutMethod[] @relation("CoachPayoutMethods")
  ```
- **Existing payout fields on `User` / `Coach` are left untouched.** Whatever Stripe Express account id / payout-schedule fields exist today stay exactly as they are. v1 introduces no destructive schema change. The FK is nullable so the migration is non-blocking and back-compatible: a coach with no `PayoutMethod` row simply falls through to the existing Express flow.
- Migration is additive and reversible (drop table + drop column + drop enums).

### 2.4 Coach signup-flow extension (bank link)

Two entry points, both optional in v1 (see open decision §7):
1. **At the first-payment-received moment** — the wow screen (§3) may surface a secondary CTA: "Link a bank account for faster, direct payouts." (Tappable, dismissible; never blocks the celebration.)
2. **Settings → Payouts** — always available; the canonical place to add/replace/default a bank account.

Flow:
1. Coach taps "Link bank account."
2. App requests `POST /me/payout-methods/financial-connections/session`; backend creates a Stripe Financial Connections session and returns the client secret.
3. App presents the **Stripe Financial Connections widget** (Stripe-hosted; we never see raw bank credentials).
4. On success the widget returns an FC session id; app calls `POST /me/payout-methods/financial-connections/complete { fcSessionId }`.
5. Backend exchanges the session, creates an `external_account` on the **coach's Connect Custom account**, and stores a `PayoutMethod` row (`kind = STRIPE_CONNECT_CUSTOM_BANK`, `status = PENDING_VERIFICATION`, `last4`, `bank_name`).
6. Stripe verifies the account; an `account.external_account.updated` webhook flips the row to `VERIFIED`. If it is the coach's first verified method, set it as default.

### 2.5 Payout routing logic (Stripe `payout.paid` webhook)

The existing Stripe webhook handler gains a thin branch keyed on the coach's effective `PayoutMethod.kind`:

```
on webhook "payout.paid" (and payout.failed / payout.updated):
  resolve coach from the Connect account id on the event
  method = coach.default_payout_method ?? inferred Express method
  switch (method.kind):
    case STRIPE_EXPRESS:
      // existing flow — unchanged. Update PayoutEvent log as today.
    case STRIPE_CONNECT_CUSTOM_BANK:
      // Stripe already routed funds to the linked external_account.
      // We do NOT move money ourselves. Just upsert/append the PayoutEvent log row.
    case STRIPE_TREASURY:
      // FUTURE — flag-gated. If FEATURE_STRIPE_TREASURY_PAYOUTS is off, treat as
      // STRIPE_CONNECT_CUSTOM_BANK. When on, reconcile against the Treasury balance ledger.
```

Key principle: in Option B, **Stripe moves the money in every case**. The backend's job at `payout.paid` is bookkeeping (the existing `PayoutEvent` log), not money movement. This keeps v1 free of any custody/ledger responsibility.

### 2.6 `PlatformFeeService.compute(...)`

```ts
/**
 * PlatformFeeService — the canonical platform-fee calculator.
 *
 * Formula:
 *   base       = round(amount_cents * 0.02)                 // 2% base
 *   card_cost  = the Stripe fee TGP WOULD pay on a card charge of this amount
 *   savings    = max(0, card_cost - stripe_fee_cents)       // only when the actual rail is cheaper
 *   platform_fee_cents = base + round(0.5 * savings)        // 2% + 50% of the savings
 *   coach_net_cents    = amount_cents - platform_fee_cents - stripe_fee_cents
 *
 * card_cost reference (Stripe US card): 2.9% + $0.30.
 *   $50  -> $1.75 ; $200 -> $6.10 ; $1000 -> $29.30
 * future ACH-from-client (Stripe ACH): 0.8% capped at $5.00.
 *
 * Worked examples (see §4 for the full table):
 *   $200 card  : amount=20000, stripe_fee=610  -> { platform_fee:400,  coach_net:18990 }
 *   $200 ACH   : amount=20000, stripe_fee=160  -> savings=450  -> { platform_fee:625,  coach_net:19215 }
 *   $50  card  : amount=5000,  stripe_fee=175  -> { platform_fee:100,  coach_net:4725 }
 *   $1000 card : amount=100000, stripe_fee=2930 -> { platform_fee:2000, coach_net:95070 }
 *   $1000 ACH  : amount=100000, stripe_fee=500 (capped) -> savings=2530 (operator-locked) -> { platform_fee:3265, coach_net:96235 }  // see §2.7 note
 */
compute(input: { amount_cents: number; stripe_fee_cents: number }):
  { platform_fee_cents: number; coach_net_cents: number }
```

- `card_cost` for the savings comparison is computed internally as `round(amount_cents * 0.029) + 30`. The savings term is only positive when the actual rail (`stripe_fee_cents`) costs less than a card would have — i.e. only for the future ACH path. For card payments `savings = 0` and the fee is exactly 2%.
- All math is integer-cents; rounding is `Math.round`. No floats persisted.
- This service is the single source for fee math across checkout, payout-ops earnings summaries, and coach-facing receipts.

### 2.7 Fee-formula appendix — worked examples

These are the operator-locked figures. The platform fee is `2% base + 50% of any savings over a card charge`; the coach nets `amount − platform_fee − stripe_fee`.

| Scenario | Amount | Stripe fee | Card-cost reference | Savings | Platform fee | Coach net |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Card payment | $50.00 | $1.75 | — | — | $1.00 (2%) | $47.25 |
| Card payment | $200.00 | $6.10 | — | — | $4.00 (2%) | $189.90 |
| Future ACH-from-client | $200.00 | $1.60 | $6.10 | $4.50 | $6.25 (2% $4.00 + 50%×$4.50 $2.25) | $192.15 |
| Card payment | $1,000.00 | $29.30 | — | — | $20.00 (2%) | $950.70 |
| Future ACH (Stripe fee capped at $5.00) | $1,000.00 | $5.00 | $29.30 | $25.30 | $32.65 (2% $20.00 + 50%×$25.30 $12.65) | $962.35 |

> **Note on the $1,000 ACH row.** The operator-locked savings figure is **$25.30** (platform fee $32.65, coach net $962.35) — these are the values to honour. Mechanically, `card_cost − capped_stripe_fee = $29.30 − $5.00 = $24.30`; the $1.00 difference is an operator-stated rounding/headroom adjustment on the savings basis. `PlatformFeeService` should reproduce the operator-locked outputs above; flag this row to the operator if a future audit wants the savings basis tightened to the strict `card_cost − stripe_fee` derivation (which would give a $32.15 fee / $962.85 net).

---

## 3. First-Payment Wow Screen (ED.3) — full design

ED.3 is, per the Roman Identity spec §2.6, **"THE moment"** — a coach's first-ever payment. It must feel earned, dignified, and unmistakably theirs.

### 3.1 Backend (event production)

- The **existing payment webhook handler** (on a successful client payment) calls into the milestone layer. On a coach's first-ever successful payment, it writes:
  ```prisma
  CoachMilestone {
    kind:        'FIRST_PAYMENT',
    coach_id:    <coach>,
    payload_json: { amount: "$240.00", clientName: "...", currency: "usd" },  // hydrated form
    consumed_at:  null,
    created_at:   now()
  }
  ```
- It then **publishes to Supabase realtime** channel `coach:{id}:milestones`. **Lock-screen privacy fallback applies:** the realtime payload carries only `{ coach_id, milestone_kind }` — never the amount or client name. The display body is hydrated on consume via an **authenticated REST** call (so a notification on a locked screen leaks nothing financial).

### 3.2 Mobile (consumption)

On **app foreground**:
1. `GET /me/milestones/pending` → returns any unconsumed milestones for the coach.
2. If `FIRST_PAYMENT` is present **and** the local MMKV flag `milestone.first_payment.shown` is **not** set:
3. Render the **WowScreen** with the hydrated `{ coachName, amount }`.
4. Play animation + sound + show share CTA (§3.5, links to the shareable in §3 of part 3 / §3.6).
5. `POST /me/milestones/{id}/consume` → server sets `consumed_at`.
6. On a 200, set the MMKV flag `milestone.first_payment.shown = true`.

The realtime channel is the **fast path** (screen can pop near-instantly while the app is open). The foreground poll is the **fallback** (covers realtime being down or the app being cold-started after the event).

### 3.3 Dual-delivery + idempotency

- **Fast path:** Supabase realtime message on `coach:{id}:milestones` → app fetches `/me/milestones/pending` immediately.
- **Fallback path:** on every app foreground, app polls `/me/milestones/pending` regardless of whether a realtime message arrived.
- **Idempotency key:** `CoachMilestone.consumed_at`. The consume endpoint is the single arbiter of "has this been shown."

### 3.4 Failure modes

| Failure | Behaviour |
| --- | --- |
| Realtime down | Poll path picks it up on the next foreground. No event is lost. |
| Multiple devices | Server guards `consume` with a `consumed_at IS NOT NULL` check. The first device to consume wins (200); the second device gets **409 Conflict** and silently does not render (it sets its local MMKV flag on the 409 too, so it never tries again). |
| "Multiple first payments" (refund then a new payment) | The server only ever writes **ONE** `FIRST_PAYMENT` row per coach. A refund does not delete it; a later payment does not create a second one. The idempotency guard (§3.4) is at write time. |
| MMKV flag lost (reinstall) but milestone already consumed | `/me/milestones/pending` returns nothing for an already-consumed milestone, so the screen never re-fires. The MMKV flag is a local fast-skip, not the source of truth — the server `consumed_at` is. |

### 3.5 Idempotency guard (write side)

- `@@unique([coach_id, kind])` on `CoachMilestone` makes "one FIRST_PAYMENT per coach" a database invariant.
- The webhook writes via an **upsert** with a `consumed_at IS NULL` precondition on update, so a retried webhook delivery cannot resurrect or duplicate a consumed milestone. A conflict on the unique index is swallowed as a no-op (the milestone already exists).

### 3.6 Animation spec

- **Stack:** Lottie + Skia. Particle burst is **local** (Lottie/Skia on-device) — the only data crossing the wire in the realtime payload is `{ coachName, amount }` (and even that is hydrated via REST, not realtime). Animation **degrades gracefully**: if Skia/Lottie is unavailable, fall back to a static composed card with the same copy.
- **Timeline:**
  - `0.0s–1.8s` — particle burst (silver/gold confetti, restrained, not carnival).
  - `0.4s` fade-in — the **Roman mascot** appears holding a **silver platter** with the amount engraved/displayed on it. Mascot uses the **"knowing slight smile"** expression (reserved for milestone moments per Roman Identity §3).
  - Caption settles below the platter.
- **Caption (Roman's voice — exact copy is owned by the Roman Identity spec §2.6):**
  > "Mr. {coachName}. Your first payment has arrived. ${amount}."

  This is the wow-screen short form. The Roman Identity spec also defines the longer celebration and error variants; the wow screen uses the short, composed line above by default and may spend the session's one permitted exclamation only on the celebration variant. Do **not** invent new copy here — defer to context #6.
- **No emoji. One exclamation point maximum**, and only on the celebration variant, per the voice contract.

### 3.7 Sound brief (for a sound designer — do not generate audio)

> **Brief: TGP first-payment chime ("Roman's chime")**
>
> One short cue (target 1.2–1.8s) that plays once as the wow screen appears. The feeling is **calm but celebratory** — a butler quietly acknowledging that something of consequence has happened, not a slot machine.
>
> - **Reference points:** the **AirPods first-pair tone** (soft, warm, two-note chime) and the **Notion task-complete chime** (clean, brief, satisfying). Sit between those two.
> - **Character:** soft attack, warm sustain, gentle decay. No harshness, no bright digital "ding," no fanfare brass. A single resolving interval (e.g. a rising perfect-fourth or major-third) reads as "arrival."
> - **Loudness:** mastered conservatively; this plays unexpectedly and must never startle. Provide a -3 dB and a -9 dB variant.
> - **Deliverables:** `.wav` (48 kHz / 24-bit) + `.m4a`; a full version and a 0.6s "short" version for low-latency replays; mono and stereo.
> - **Out of scope:** no voice, no spoken word (Roman TTS is a separate, later track per Roman Identity open decisions).
>
> Sourcing is an open decision (§7): freelancer vs. stock library (Soundsnap / Epidemic Sound).

---

## 4. Coach Milestone Shareables — design

### 4.1 Milestone kinds + detection criteria

| `kind` | Trigger | Detection criteria |
| --- | --- | --- |
| `FIRST_PAYMENT` | First-ever payment received | Written by the payment webhook (§3.1). Account-lifetime, once-only. |
| `FIRST_1K_COLLECTED` | Lifetime collected ≥ $1,000 | Lifetime sum of net payouts crosses $1,000. |
| `FIRST_5K_MRR` | MRR ≥ $5,000 | Monthly-recurring-revenue (existing analytics service) crosses $5,000. |
| `FIRST_10K_MRR` | MRR ≥ $10,000 | MRR crosses $10,000. |
| `FIRST_25K_MRR` | MRR ≥ $25,000 | MRR crosses $25,000. |
| `FIRST_50K_MRR` | MRR ≥ $50,000 | MRR crosses $50,000. |
| `FIRST_100K_COLLECTED` | Lifetime collected ≥ $100,000 | Lifetime sum of net payouts crosses $100,000. |
| `FIRST_250K_COLLECTED` | Lifetime collected ≥ $250,000 | Lifetime sum of net payouts crosses $250,000. |
| `FIRST_1M_COLLECTED` | Lifetime collected ≥ $1,000,000 | Lifetime sum of net payouts crosses $1,000,000. |

- **MRR** is computed by the existing analytics service (monthly recurring revenue from active recurring packages/subscriptions).
- **Collected** is the lifetime sum of the coach's payouts (gross collected, before platform fee — confirm the exact basis with operator; default = lifetime sum of `coach_net` plus platform fee, i.e. gross volume the coach drove). Each `*_COLLECTED` / `*_MRR` is once-only per coach via the `@@unique([coach_id, kind])` invariant.

### 4.2 Detection cadence

- A **nightly cron at 02:00 UTC** computes each coach's current state (current MRR, current lifetime-collected) and writes a `CoachMilestone` row **only if a threshold is newly crossed** (i.e. no existing row for that `(coach_id, kind)`).
- `FIRST_PAYMENT` is the exception — it is event-driven (webhook), not cron-driven, because the wow screen must fire in near-real-time.
- The cron is idempotent: re-running it the same night writes nothing new (unique constraint + "only if newly crossed").

### 4.3 Image generation

- **Endpoint:** `POST /milestones/{id}/render` → returns presigned URL(s) to:
  - **Square 1:1** — 1080×1080 PNG.
  - **Instagram Story 9:16** — 1080×1920 PNG.
- **Stack:** server-side image generation; implementer's choice. **Satori + Sharp is the lightweight default** (HTML/CSS-ish JSX → SVG → PNG; fast, low memory, no headless browser). Tradeoffs:

  | Approach | Pros | Cons |
  | --- | --- | --- |
  | **Satori + Sharp** (default) | Lightweight, fast, no Chromium, deterministic, cheap to run in a Lambda/worker. | Limited CSS subset; complex gradients/effects need care; custom fonts must be bundled. |
  | **Puppeteer (headless Chrome)** | Full CSS/JS fidelity; pixel-perfect to a web template. | Heavy (Chromium), slower cold starts, more memory, more ops surface. |
  | **Sharp-only compositing** | Tiny, very fast for static layered PNGs. | Manual text layout is painful; poor for rich typography. |

  Default recommendation: **Satori + Sharp**, bundling the TGP brand font and the Roman mascot as a pre-rendered transparent PNG asset. Cache rendered PNGs in object storage keyed by `milestone_id + ratio`; the endpoint returns the presigned URL (regenerate only if missing).

### 4.4 Template

- **Roman mascot** (composed or "knowing slight smile" variant for the milestone), positioned per ratio.
- **Large monetary value** (e.g. "$5,000 MRR", "$100,000 Collected") as the dominant element.
- **Coach's first name** ("Marcus").
- **TGP wordmark** (the canonical wordmark asset).
- **Subtle gradient** background using `{TGP_BRAND_ACCENT_HEX}` (open decision §7).
- **No emoji.**
- **Roman quote in the lower-third** — one of **three rotating quotes per milestone kind** (rotation by `milestone_id` hash so it is stable per render). Quotes are written in Roman's voice and sourced from / approved against the Roman Identity contract. Example set for `FIRST_5K_MRR` (illustrative — final copy approved against context #6):
  1. "Five thousand a month. The work has become a profession."
  2. "Recorded: five thousand monthly. Well earned."
  3. "A notable figure, Mr. {coachName}. Onward."

### 4.5 Share CTA

- **Mobile-side native share sheet** (iOS / Android).
- **Pre-filled caption template**, e.g.: `Hit my first $5k MRR with @growthproject` (handle is an open decision §7 — `@growthproject` vs `@trygrowthproject`).
- **Emoji policy:** spec **defaults to NO emoji** per Roman's voice contract (§1.4 of the identity spec forbids emoji). The operator-suggested example caption with a heart (`🖤`) is offered behind a **toggle** only; default off. Operator confirms.

### 4.6 Tracking

- Every share event writes a **`MilestoneShareLog`** row:
  ```prisma
  model MilestoneShareLog {
    id           String   @id @default(cuid())
    milestone_id String
    platform     String   // "instagram_story" | "instagram_feed" | "ios_share_sheet" | ...
    created_at   DateTime @default(now())

    milestone    CoachMilestone @relation(fields: [milestone_id], references: [id])
    @@index([milestone_id])
  }
  ```
- **No user content is stored** — only `timestamp + milestone_id + platform`. We record that a share happened and which surface; we never capture the caption, the image bytes, or any client-side text.

---

## 5. KYC / 1099 posture (explicit)

**We stay on Stripe Connect Custom. Stripe is the merchant of record. Stripe issues the 1099-K.**

For v1 (Option B), TGP does **NOT**:
- collect W-9s,
- file 1099-K forms,
- file state 1099s,
- perform backup withholding,
- handle IRS B-notices (CP2100 / CP2100A mismatch notices).

All of the above are handled by **Stripe** as part of Connect Custom. This is the deliberate, correct call because the alternative is expensive and slow:

- Becoming a **TPSO / payment facilitator** (which we would be on Option D — Dwolla / Modern Treasury, owning the bank rails directly) would inherit roughly **$15–25k/year** in compliance cost plus an estimated **40–60 hours of operator time in Q1** alone (W-9 collection workflow, 1099-K generation + e-file with the IRS, state filings, backup-withholding logic, B-notice handling, and the associated legal/tax review). That is a dedicated compliance function we do not want to staff for a v1 payout feature.
- Staying on Stripe rails means **zero** of that lands on TGP. Stripe's economies of scale make this strictly cheaper and lower-risk than building it ourselves.

**Recommendation: do NOT move off Stripe rails for v1.** Revisit only if payment volume and margin make in-house rails (and the compliance organisation they require) economically rational — which is not the case at current scale.

---

## 6. Treasury upgrade path (Option B → Option C)

How to flip from Stripe Connect Custom (B) to **Stripe Treasury** (C) once Stripe approves us for Treasury access:

1. **Schema is already ready.** `PayoutMethod.kind` already includes `STRIPE_TREASURY`. On coach migration to Treasury, create a new `PayoutMethod` row with `kind = STRIPE_TREASURY` (the bank-link `external_account` is re-pointed to a Stripe Treasury financial account).
2. **Feature flag:** `FEATURE_STRIPE_TREASURY_PAYOUTS`. When **off** (v1 default), the `STRIPE_TREASURY` routing branch (§2.5) behaves exactly like `STRIPE_CONNECT_CUSTOM_BANK`. When **on**, it enables:
   - **T+1 ACH** payouts (vs. T+2 on Option B).
   - The **Stripe Treasury balance ledger** — a stored-balance financial account per coach, reconciled against `PayoutEvent`.
3. **Fees (surface to coach):** Stripe Treasury charges **0.10% on stored balance** plus **$10/coach/month** if a balance is held. These are surfaced in **Settings → Payouts** as a **"Faster Payouts"** toggle — the coach opts in knowing the trade (faster money vs. a small holding/monthly cost). The toggle writes the coach's preference; the actual migration to a Treasury financial account is gated by both the flag and the coach's opt-in.
4. **No re-architecture required** — Treasury is a flag-flip plus a per-coach opt-in, because the `PayoutMethod` abstraction and the routing switch were built for it from day one.

---

## 7. Open decisions for operator

1. **`{TGP_BRAND_ACCENT_HEX}`** — the exact accent hex for the milestone-graphic gradient. Needed before shareables ship.
2. **Social handle in the share caption** — pre-fill `@growthproject` or `@trygrowthproject`? Verify the operator's actual Instagram handle.
3. **Bank-link prompt placement** — should the "link a bank account" prompt appear **at the first-payment moment** (on the wow screen as a secondary CTA) **OR opt-in from Settings only**? (Default in this spec: both entry points exist, but the wow-screen prompt is dismissible and never blocks the celebration.)
4. **Treasury approval timing** — apply to Stripe for Treasury access **now**, or **wait until volume justifies** the 0.10% + $10/coach/month economics? (No code dependency either way — the path is already flag-gated.)
5. **Sound design sourcing** — bring in a **freelancer** to compose Roman's chime, or use a **stock library** (Soundsnap, Epidemic Sound)? See the brief in §3.7.

---

## 8. Build order (suggested)

1. **Milestone primitive** — `CoachMilestone` table (`@@unique([coach_id, kind])`), the webhook write path for `FIRST_PAYMENT`, the `/me/milestones/pending` + `/me/milestones/{id}/consume` endpoints (with the 409 race guard).
2. **ED.3 wow screen** — Supabase realtime channel + MMKV gate + Lottie/Skia animation + sound integration. (Highest emotional ROI; depends only on #1.)
3. **`src/payouts-v2/`** — `PayoutMethod` model + migration + `PayoutMethodService`/`Controller` + Financial Connections widget + `payout.paid` routing branch + `PlatformFeeService`.
4. **Shareables** — nightly cron detection for the MRR/Collected kinds + `POST /milestones/{id}/render` (Satori + Sharp) + native share sheet + `MilestoneShareLog`.
5. **Treasury readiness** — verify the `STRIPE_TREASURY` branch is inert-but-correct under flag-off; defer the flag-on work until Stripe approval (§7.4).

---

## 9. Sources / cross-references

- Roman voice contract, mascot, and ED.3 first-payment copy: `tgp-agent-context/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md` (context #6).
- Existing payment-ops surface (cursor/pagination idioms, `SplitLedgerService`, `PayoutEvent` log conventions): `tgp-agent-context/specs/HYGIENE_H1_PAYMENT_OPS_BRIEF.md` and `growth-project-backend/src/checkout/payment-ops.controller.ts`.
- Stripe US card pricing reference (2.9% + $0.30) and Stripe ACH (0.8% capped $5.00) used in §2.6 / §4 are Stripe's published US standard rates; confirm against the live Stripe pricing page at implementation time.
- Stripe Treasury fee references (0.10% stored balance + per-account monthly) in §6 are Stripe Treasury's published terms; confirm against the current Stripe Treasury agreement at flag-flip time.

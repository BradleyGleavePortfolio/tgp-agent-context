# B3 — Smart Dunning v2 GAPS Spec

**Status:** Draft for operator review
**Builds on:** Dunning v1 — PR #281, shipped on `main@ed78bbef`
**Scope:** Branded payment recovery links · "human-needed" coach-notification classifier · Day 1/3/7 cadence flip · Stripe retry validation · recovery landing page design
**Doc type:** Specification only. **No source-code is touched by this PR.**

---

## How to read this spec

Dunning v1 is **already built and shipped**. This document does **not** re-spec the cadence engine, the attempt scheduler, the CAS race protection, the send-retry backoff, the 4 templates, or the 6 admin endpoints — all of that exists. Section 0 inventories the shipped surface with real file paths and line counts so engineers do not rebuild it.

Sections 1–8 specify only the **net-new v2 surface**: what is missing, where it plugs into the v1 code, and the hard gates that keep v2 additive (one new table, zero schema mutation on existing tables, zero Stripe API surface changes, zero new deps).

---

## Section 0 — Inventory of what already exists (Dunning v1)

Verified by inspecting the live repo at `/tmp/backend-main/` (`main@ed78bbef`). Do **not** rebuild any of the following.

| Component | Path | Size | Notes |
|---|---|---|---|
| Cadence engine | `src/checkout/dunning.service.ts` | **1,293 lines** | Full lifecycle: `recordFailure` (L204), `recordResolution` (L333), `terminate` (L391), `tick` (L428), `runSweeper`, admin overrides. (Task brief said "~990 lines"; actual is 1,293.) |
| Cadence constant | `src/checkout/dunning.service.ts` L87 | — | `DEFAULT_DUNNING_CADENCE = [{0,soft},{3,urgent},{7,final},{14,cancelled}]` |
| Cadence env parse | `src/checkout/dunning.service.ts` L106 (`resolveDunningConfig`) | — | Reads `DUNNING_CADENCE_DAYS`; **only accepts an override of equal length to the default** (currently 4). This matters for Section 3. |
| Email-build payload | `src/checkout/dunning.service.ts` L1214 (`buildEmailData`) | — | Today emits `billing_portal_url` from `process.env.BILLING_PORTAL_URL ?? 'https://thegrowthproject.app/billing'`, and `coach_name: null`. This is the generic-URL injection point we replace in Section 1. |
| Prisma `DunningState` | `prisma/schema.prisma` L3526 | — | `purchase_id @unique`, `status`, `failure_count`, `last_attempt_number`, `last_failed_amount_cents`, `last_failure_at`, `last_failure_reason`, `grace_period_ends_at`, `cancel_scheduled_at`, `step_index @default(-1)`, `next_attempt_at`, indices on `(status, next_attempt_at)` etc. **Status values are `active \| resolved \| abandoned`** (note: not `resolved`/`cancelled` — see Section 5 correction). |
| Prisma `DunningAttempt` | `prisma/schema.prisma` L3572 | — | `dunning_state_id`, `step_index`, `kind`, `scheduled_for`, `status` (`pending\|sending\|sent\|failed\|failed_permanent\|skipped\|cancelled`), `email_idempotency_key @unique`, `provider_message_id`, `failure_reason`, `retry_count`, `next_retry_at`. **UNIQUE(dunning_state_id, step_index)** gives attempt idempotency. |
| Email templates (4 dunning + receipts) | `src/email/templates/` | — | `payment-reminder-soft.hbs`, `payment-reminder-urgent.hbs`, `payment-final-notice.hbs`, `payment-recovered.hbs`, plus `dunning-final.hbs`. All currently render `<a href="{{billing_portal_url}}">`. |
| Email template keys | `src/email/email.types.ts` L23–28 | — | `DUNNING_FINAL`, `PAYMENT_REMINDER_SOFT`, `PAYMENT_REMINDER_URGENT`, `PAYMENT_FINAL_NOTICE`, `PAYMENT_RECOVERED`. |
| Admin endpoints (6+) | `src/checkout/payment-ops.controller.ts` | — | `POST dunning/run-sweeper` (L264), `GET dunning/:purchaseId` (L273), `POST dunning/:purchaseId/advance` (L287), `POST dunning/:purchaseId/reset` (L300), `POST dunning/:purchaseId/cancel` (L313), `POST dunning/:purchaseId/trigger` (L319), `GET dunning/metrics/snapshot` (L335). |
| Stripe auto-retry wiring | `src/connect/stripe-connect-api.service.ts` L570–571 | — | `automatic_payment_methods[enabled]=true`, `allow_redirects=never`. **This is the actual charge-retry mechanism** (see Section 4). |
| Refund/dispute coach-notify | `src/checkout/refund-dispute-handler.service.ts` | — | Already notifies the coach on `charge.dispute.created/updated/closed` (deep links `tgp://coach/billing/refunds` L29, `tgp://coach/billing/disputes` L30). Section 2 only **confirms** this; it does not rebuild it. |
| Coach-alert emitter | `src/notifications/emitters/coach-alert.emitter.ts` | — | `CoachAlertEmitter.emit({coachId, alertId, alertType, message, severity, clientUserId})`. Mirrors a `CoachAlert` row into in-app + push notification rows. **Section 2 reuses this; does NOT build a new emitter.** |
| Coach branding source | `prisma/schema.prisma` L479 (`CoachProfile`) | — | **There is no `Coach` model.** Branding lives on `CoachProfile.business_name` (L483) and `CoachProfile.branding_logo_url` (L487), plus `branding_accent_color` (L486). The task brief's `Coach.business_name` / `Coach.logo_url` map to these fields. |
| `customer.subscription.deleted` route | `src/checkout/checkout-webhook-handler.service.ts` L142, L718 | — | Already calls `dunning.terminate(purchase.id, 'subscription_deleted')`. Section 2's mid-dunning-cancel notification hooks here. |

**Net result of v1:** failed-payment detection, scheduled multi-step reminder cadence, idempotent sends, race-safe ticks, send-retry backoff, recovery/abandonment terminal handling, and admin tooling are **done**. v2 is purely additive surface on top.

---

## Section 1 — Branded payment recovery links

### 1.1 Problem

Today, all four dunning emails render a single CTA pointing at `{{billing_portal_url}}` — the generic `process.env.BILLING_PORTAL_URL` value injected by `buildEmailData` (`dunning.service.ts` L1227). The client sees a Stripe/portal page with no coach branding, no failed-amount context, and no "talk to my coach" path. v2 replaces this with a **branded, signed, single-use recovery link** per `DunningAttempt`.

### 1.2 New module: `src/payment-recovery/`

> Module sketch only — no code is written in this PR.

```
src/payment-recovery/
  payment-recovery.module.ts        # NestJS module; imports PrismaModule, JwtModule, exports the service
  recovery-token.service.ts         # mint / verify / consume tokens
  payment-recovery.controller.ts    # GET /recover/:token (landing), POST /payment-recovery/:token/confirm
  recovery-token.types.ts           # RecoveryTokenClaims, MintResult
```

### 1.3 New Prisma model (the only schema addition in all of v2)

```prisma
// v2 — branded recovery links. NEW TABLE ONLY. No FK alter on existing tables.
model PaymentRecoveryToken {
  id                 String   @id @default(uuid())
  dunning_attempt_id String   @unique          // 1:1 with the attempt that minted it
  jwt_jti            String   @unique          // the JWT's jti claim; lets us revoke without storing the token
  expires_at         DateTime                  // = next_attempt_at + 24h (see 1.5)
  used_at            DateTime?                 // single-use marker; set on confirm or recordResolution
  ip                 String?                   // captured at confirm (audit)
  ua                 String?                   // captured at confirm (audit)
  created_at         DateTime @default(now())

  @@index([expires_at])
  @@index([jwt_jti])
}
```

Note: **no Prisma `@relation` to `DunningAttempt`** — we store `dunning_attempt_id` as a bare unique string column. This honours the Section 7 hard gate ("no FK alter on existing tables"): adding a relation field on `DunningAttempt` would mutate the existing table. The application layer joins on `dunning_attempt_id` manually.

### 1.4 JWT structure

Tokens are **signed JWTs** (HS256 using a dedicated secret `PAYMENT_RECOVERY_JWT_SECRET`, *not* the auth-session secret). The DB row exists for **revocation + audit**, not for verification — verification is signature + expiry + jti-not-revoked.

```jsonc
{
  "iss": "tgp-payment-recovery",
  "sub": "<dunning_attempt_id>",      // the attempt
  "pid": "<purchase_id>",             // ClientPurchase
  "cid": "<coach_user_id>",           // for branding lookup at render time
  "amt": 4999,                        // last_failed_amount_cents (display only; re-read server-side at confirm)
  "cur": "usd",
  "jti": "<uuid>",                    // matches PaymentRecoveryToken.jwt_jti
  "iat": 1730000000,
  "exp": 1730259200                   // = next_attempt_at + 24h, epoch seconds
}
```

The short token in the URL path (`/recover/:token`) **is** the compact JWT. No DB lookup is needed to render the *expired* page; a valid render still reads `PaymentRecoveryToken` to confirm the jti is live and `used_at IS NULL`.

### 1.5 Expiry rules

- `expires_at = attempt.scheduled_for_of_next_step + 24h`. In v1 terms this is `DunningState.next_attempt_at + 24h` at mint time. The intent: a link stays valid until just past the next reminder, so a client who opens an older email still lands on a working page until the next email's link supersedes it.
- For the **last** cadence step (no next attempt), use `grace_period_ends_at + 24h` as the expiry, falling back to `now + 7d` if grace is null.
- Expiry is enforced **twice**: by the JWT `exp` claim (cheap, no DB) and by `PaymentRecoveryToken.expires_at` (authoritative; survives secret rotation).

### 1.6 Single-use semantics

- A token is **consumed** when `POST /payment-recovery/:token/confirm` succeeds → set `used_at = now()`, capture `ip` + `ua`.
- A token is **invalidated** when the dunning state resolves by any path. `recordResolution` (`dunning.service.ts` L333) and `terminate` (L391) must, as a v2 add, mark **all** `PaymentRecoveryToken` rows for that state's attempts as `used_at = now()` (revoke). Because these run inside the existing resolution transaction, a late click after payment cannot re-trigger a setup-intent flow.
- Verification rejects when: signature invalid · `exp` passed · `expires_at` passed · `used_at IS NOT NULL` · jti not found.

### 1.7 Idempotency

- **One token per attempt:** `PaymentRecoveryToken.dunning_attempt_id @unique`. Minting is `upsert`-by-attempt — re-running the email send for the same attempt (a tick replay) returns the **same** token, never a second row. This mirrors v1's `email_idempotency_key @unique` discipline.
- **Confirm is idempotent:** if `used_at` is already set *and* the matching `DunningState.status` is already `resolved`, `confirm` returns `200 {already_resolved:true}` instead of erroring — so a double-tap on the CTA or a retried POST is safe.
- **Mint is side-effect-free on the cadence:** generating a token does not advance `step_index` or touch `next_attempt_at`; it is read-only against v1 state plus one insert into the new table.

### 1.8 Where it plugs into v1

`buildEmailData` (`dunning.service.ts` L1214) gains a v2 branch (gated by `FEATURE_BRANDED_RECOVERY_LINKS`, Section 6): when on, it calls `RecoveryTokenService.mintForAttempt(attempt)` and sets `recovery_url = ${PUBLIC_RECOVERY_BASE_URL}/recover/${token}` plus `coach_name`, `coach_logo_url` read from `CoachProfile`. When off, it falls back to today's `billing_portal_url` exactly as shipped. The four templates change `href="{{billing_portal_url}}"` → `href="{{recovery_url}}"` with a `{{#unless recovery_url}}{{billing_portal_url}}{{/unless}}` fallback so the templates render correctly under either flag state.

---

## Section 2 — "Human-needed" classifier

### 2.1 Problem

The coach should **not** get pinged on every Day-1 soft failure (Stripe's auto-retry recovers most of those — Section 4). The coach **should** get pinged when a human actually needs to act. v2 introduces `DunningEscalationClassifier` that decides, per cadence step + failure reason, whether to fire a coach notification. It does **not** build a new emitter — it calls the existing `CoachAlertEmitter.emit(...)` (`src/notifications/emitters/coach-alert.emitter.ts`).

### 2.2 Failure-reason taxonomy

We normalise Stripe's `charge.failure_code` / `outcome.reason` (stored today in `DunningState.last_failure_reason` and `DunningAttempt.failure_reason`) into a small enum:

| Normalised reason | Stripe sources (examples) | "Likely auto-recovers"? |
|---|---|---|
| `card_declined_generic` | `generic_decline`, `card_declined` | Yes — issuer may approve a retry |
| `insufficient_funds` | `insufficient_funds` | Yes — funds may arrive |
| `do_not_honor` | `do_not_honor` | Yes — often transient issuer flag |
| `expired_card` | `expired_card` | **No** — needs new card → human |
| `incorrect_cvc` / `incorrect_number` | `incorrect_cvc`, `incorrect_number` | **No** — needs re-entry → human |
| `lost_or_stolen_card` | `lost_card`, `stolen_card` | **No** — needs new card → human |
| `processing_error` | `processing_error`, `try_again_later` | Yes — transient |
| `unknown` | anything unmapped | Treat as **not** auto-recoverable (notify earlier, fail safe) |

The "likely auto-recovers" set used by the Step-1 rule below is exactly `{card_declined_generic, insufficient_funds, do_not_honor}`, matching the operator's decision.

### 2.3 Decision table

| Cadence step (v2: Day 1/3/7) | Kind | Notify coach? | Rule |
|---|---|---|---|
| Step 0 — Day 1 | `soft` | **No** | Auto-retry handles most; pinging here is noise. |
| Step 1 — Day 3 | `urgent` | **Conditional** | **No** notification *if* `failure_reason ∈ {card_declined_generic, insufficient_funds, do_not_honor}` (low-touch retry likely succeeds). **Otherwise notify** (expired/cvc/lost/unknown ⇒ human card action needed). |
| Step 2 — Day 7 | `final` | **Always** | "Client {client.name} payment failed 3 times, will be cancelled in {grace_remaining}. Recovery link: {recovery_url}." |
| (terminal) cancelled | `cancelled` | **Always** | Notify coach **+** offer "Send personal message" flow (deep link to coach→client chat thread). Note: in v2's 3-step cadence there is no separate Day-14 cancelled *reminder step* — this fires from `terminate()` / the grace-expiry sweeper, not from a cadence tick. |
| Refund disputed mid-dunning | — | **Immediate** | **Already exists** in `refund-dispute-handler.service.ts` (`onDisputeOpened`). v2 only **confirms** the path; no new code. |
| Customer cancels mid-dunning (`customer.subscription.deleted` while `DunningState.status='active'`) | — | **Immediate** | New v2 hook: in the `terminate(..., 'subscription_deleted')` path, if the state was `active`, fire a coach alert before marking abandoned. |

> Brief-vs-reality note: the task brief's Step-1 wording reads as a double-negative ("NO unless reason ∈ {set} → low-touch retry will likely succeed"). The operator intent is unambiguous from the rationale: those three reasons are the *auto-recoverable* set, so for them we **suppress** the Day-3 notification; every other reason at Day 3 **notifies**. The table above encodes that intent. Flagged for confirmation in Section 8.

### 2.4 Code sketch (`DunningEscalationClassifier`)

> Sketch only — no code is written in this PR.

```ts
// src/checkout/dunning-escalation.classifier.ts
export type NormalisedFailureReason =
  | 'card_declined_generic' | 'insufficient_funds' | 'do_not_honor'
  | 'expired_card' | 'incorrect_cvc' | 'incorrect_number'
  | 'lost_or_stolen_card' | 'processing_error' | 'unknown';

const AUTO_RECOVERABLE = new Set<NormalisedFailureReason>([
  'card_declined_generic', 'insufficient_funds', 'do_not_honor',
]);

export interface EscalationDecision {
  notifyCoach: boolean;
  severity: 'info' | 'warning' | 'critical';
  alertType: string;            // -> CoachAlertEmitter.emit alertType
  offerPersonalMessage: boolean;
  reason: string;               // structured log reason
}

@Injectable()
export class DunningEscalationClassifier {
  classify(input: {
    stepIndex: number;
    kind: DunningStepKind;
    failureReason: NormalisedFailureReason;
    graceRemainingText: string | null;
  }): EscalationDecision {
    switch (input.stepIndex) {
      case 0: // Day 1 soft
        return { notifyCoach: false, severity: 'info',
                 alertType: 'dunning_soft', offerPersonalMessage: false,
                 reason: 'soft_step_no_notify' };
      case 1: { // Day 3 urgent
        const auto = AUTO_RECOVERABLE.has(input.failureReason);
        return { notifyCoach: !auto, severity: auto ? 'info' : 'warning',
                 alertType: 'dunning_urgent', offerPersonalMessage: false,
                 reason: auto ? 'urgent_auto_recoverable_suppressed'
                              : 'urgent_human_needed' };
      }
      case 2: // Day 7 final
        return { notifyCoach: true, severity: 'warning',
                 alertType: 'dunning_final', offerPersonalMessage: false,
                 reason: 'final_always_notify' };
      default: // terminal cancelled
        return { notifyCoach: true, severity: 'critical',
                 alertType: 'dunning_cancelled', offerPersonalMessage: true,
                 reason: 'cancelled_always_notify' };
    }
  }

  normaliseReason(stripeCode: string | null): NormalisedFailureReason { /* map table 2.2 */ }
}
```

Wiring: the classifier is called inside the existing tick send-path (`dunning.service.ts` `tick`/`sendAttempt`) **after** a reminder is successfully sent. When `notifyCoach` is true and `FEATURE_DUNNING_HUMAN_CLASSIFIER` is on, the service resolves the coach via `ClientPurchase → CoachProfile.user_id`, builds the message, and calls `CoachAlertEmitter.emit({ coachId, alertId, alertType, message, severity, clientUserId })`. The `alertId` is the id of a `CoachAlert` row created via the existing `CoachAlertsService.createAlert` path — we do not invent a new alert store.

The mid-cancel and dispute paths call the classifier with a synthetic `stepIndex = terminal` so the same code produces the immediate-notify decision.

---

## Section 3 — Cadence tuning (Day 1/3/7)

### 3.1 Operator decision

Operator confirmed **Day 1 / 3 / 7 (3 steps)**, replacing the shipped Day 0 / 3 / 7 / 14 (4 steps). Step mapping:

| v2 step | Day | Kind | Template |
|---|---|---|---|
| 0 | 1 | `soft` | `PAYMENT_REMINDER_SOFT` |
| 1 | 3 | `urgent` | `PAYMENT_REMINDER_URGENT` |
| 2 | 7 | `final` | `PAYMENT_FINAL_NOTICE` |

The separate Day-14 `cancelled` cadence step is **dropped**. Cancellation/grace handling still happens via `terminate()` + the grace-period sweeper (which already exist); there is simply no scheduled `cancelled` *reminder email* step.

### 3.2 This is intended to be deploy-time config, but there is a code blocker

The brief asks for this to be a pure `DUNNING_CADENCE_DAYS=1,3,7` env override — **a deploy-time change, not a code change**. Inspecting v1 reveals a constraint: `resolveDunningConfig` (`dunning.service.ts` L106) **only accepts an env override whose length equals the default cadence length** (`parts.length === DEFAULT_DUNNING_CADENCE.length`, L115). The default is 4 steps, so `DUNNING_CADENCE_DAYS=1,3,7` (3 values) is **silently rejected** and the service falls back to the 4-step default.

Two ways to honour the operator decision; flag for confirmation (Section 8):

- **Option A (config-only, preserves "deploy-time" intent):** set `DUNNING_CADENCE_DAYS=1,3,14` (still 4 values) and accept a degenerate 4th step — **not** what the operator wants (keeps a Day-14 cancelled step).
- **Option B (recommended):** make the *one-line* change to `DEFAULT_DUNNING_CADENCE` (L87) to the 3-step `[{1,soft},{3,urgent},{7,final}]` and relax the length-equality check in `resolveDunningConfig` to "length ≤ default and ≥ 1". Then `DUNNING_CADENCE_DAYS=1,3,7` works as a true deploy-time override. This is a **config/constant** change, not a logic-shift in the cadence engine — `tick`, `recordFailure`, CAS, and retry logic are untouched.

> This spec recommends Option B and treats it as the single sanctioned source-code touch *for the v2 build PR* (not this spec PR). The cadence-tuning flag `FEATURE_DUNNING_CADENCE_V2` (Section 6) selects between the v1 4-step constant and the v2 3-step constant so the change is reversible without a redeploy of code.

### 3.3 In-flight state migration plan

The core guarantee: **existing `DunningState.step_index` values remain valid; in-flight states keep their current step until resolved.**

- `step_index` is just an integer cursor into the active cadence array. v1 rows may have `step_index ∈ {-1,0,1,2,3}`. Under v2's 3-step array, valid indices are `{-1,0,1,2}`.
- **Rows with `step_index ≤ 2`:** continue ticking against whichever cadence array is active at tick time. Because the day-offsets only affect *future* `scheduled_for` values (already materialised as `DunningAttempt` rows at `recordFailure` time), an in-flight row's already-scheduled attempts fire on their **original** v1 timeline. New failures opened after cutover use the v2 timeline. No backfill of `scheduled_for` is performed.
- **Rows with `step_index = 3` (already at the old Day-14 cancelled step):** under v2 there is no step 3. `cadenceStep(3)` returns `null` (already handled defensively at `dunning.service.ts` L1250 — `if (index < 0 || index >= cadence.length) return null`). A null step at tick means "cadence exhausted" → the row proceeds to terminal handling exactly as it would have. **No row is orphaned or crashes.**
- **No data migration / Prisma migration is required** for the cadence change itself. The only new migration in v2 is the `PaymentRecoveryToken` table (Section 1.3).
- **Rollout order:** deploy with `FEATURE_DUNNING_CADENCE_V2=OFF`, confirm in-flight rows tick cleanly, then flip the flag (staging first). Flipping back is safe at any time because the constant is selected at config-resolution, and in-flight attempts are already materialised.

---

## Section 4 — Stripe retry validation (reminders-only vs charge-attempts)

**This is the most-misunderstood part of the system. Read it.**

### 4.1 What Stripe does (the actual charge retries)

- On the connected-account PaymentIntents we create, `automatic_payment_methods[enabled]=true` is set (`src/connect/stripe-connect-api.service.ts` L570). For **subscription invoices**, Stripe's **Smart Retries** (a.k.a. automatic retries / dunning *settings* in the Stripe Dashboard → Billing → Revenue Recovery) own the **actual re-charge attempts** against the customer's payment method.
- Stripe decides *when* to re-attempt the charge (its ML schedule, or the fixed schedule configured in the Stripe Dashboard) and emits an `invoice.payment_failed` webhook on each failure and `invoice.paid` / `invoice.payment_succeeded` on success.

### 4.2 What our cadence does (reminders only)

- Our `DunningService` cadence (Day 1/3/7) **does not charge anything.** Each cadence step **sends an email reminder** via `EmailService` and advances `step_index`. There is **no call to Stripe to re-charge** anywhere in `tick`/`sendAttempt`.
- `recordFailure` is driven *by* Stripe's `invoice.payment_failed` webhook; `recordResolution` is driven *by* Stripe's `invoice.paid`. We are a **listener + notifier**, not a charger.

### 4.3 Why this matters / failure modes to avoid

- **We must never trigger a manual `invoice.pay` / PaymentIntent confirm from the cadence.** Doing so would double-charge against Stripe's own retry schedule. v2 introduces **no** Stripe-side charge calls (Section 7 hard gate).
- The recovery landing page's "Update payment method" CTA (Section 5) uses a **Setup Intent** (saves/updates the method) — it does **not** create a charge. After the method is updated, Stripe's next scheduled Smart Retry collects the outstanding invoice, *or* the client can be offered an explicit "pay now" via Stripe's hosted invoice if the operator wants it (open decision, Section 8). Default v2 behaviour: Setup Intent only, let Stripe's retry collect.
- **Cadence day-offsets are independent of Stripe's retry schedule.** Our Day 1/3/7 reminders are not synced to Stripe's retry attempts; they are a parallel human-facing track. This is intentional and correct.

**Summary line for engineers:** *Stripe charges; we remind. The cadence is a notification track layered on top of Stripe Smart Retries, never a second charge path.*

---

## Section 5 — Branded recovery landing page (design)

> Design + endpoint + UX. **No implementation in this PR.** Copy follows the Roman voice contract (PR #1) — warm, plain-spoken, never shaming about a failed payment.

### 5.1 Route + endpoints

- `GET /recover/:token` — server-rendered, mobile-first landing page (also a valid mobile-app deep-link target `tgp://recover/:token`).
- `POST /payment-recovery/:token/confirm` — called after the Stripe Setup Intent confirms client-side. Marks the token `used_at`, captures `ip`/`ua`, and flips dunning state to resolved.

### 5.2 Valid-token page

- **Header:** coach business name + logo from `CoachProfile.business_name` and `CoachProfile.branding_logo_url` (optionally `branding_accent_color` for the CTA tint). Falls back to "The Growth Project" branding when a coach has no logo.
- **Body:** the failed-payment amount (`amount_display`) and the due/cancellation date (from `cancel_scheduled_at ?? grace_period_ends_at`).
- **Primary CTA — "Update payment method":** opens a Stripe **Setup Intent** flow (Stripe Elements). On `setupIntent.succeeded`, the page POSTs to `/payment-recovery/:token/confirm`.
- **Secondary CTA — "Talk to my coach":** opens the in-app deep link to the coach chat thread (`tgp://coach/clients/{clientUserId}` style, matching existing deep-link conventions).
- **Footer:** minimal-tracking footer. **No analytics scripts that log PII** (no third-party pixels, no client identifiers in query strings). Server access logs only.

### 5.3 Confirm flow + state transition

1. Client confirms Setup Intent → new/updated payment method saved on the Stripe customer.
2. Page POSTs `/payment-recovery/:token/confirm`.
3. Server verifies the token (signature, `exp`, `expires_at`, `used_at IS NULL`, jti live), re-reads the authoritative amount server-side (never trusts the `amt` claim for anything but display), sets `PaymentRecoveryToken.used_at = now()`, `ip`, `ua`.
4. Server flips the dunning state to **resolved**.

   > **Schema correction vs the brief:** the brief says set `DunningState.status = 'resolved'`. The shipped enum is `active | resolved | abandoned` (`schema.prisma` L3530) — so `'resolved'` is correct; there is no `'cancelled'` status value. The right call is to invoke the existing `DunningService.recordResolution(purchaseId)` (`dunning.service.ts` L333) rather than writing `status` directly, so cadence cancellation, recovery-email suppression, token revocation (Section 1.6), and metrics all fire consistently.

5. Stripe's next Smart Retry collects the outstanding invoice (Section 4.2); we do not charge from here.
6. Page shows a "you're all set" confirmation.

### 5.4 Expired-token page

- Friendly "this link expired" page (Roman voice — reassuring, not punitive).
- **"Request a new link" CTA** → server mints a fresh token for the current active attempt and emails it within **60s** (enqueue immediate send, not next-tick). If the dunning state is no longer active, show "looks like you're already sorted" instead.

### 5.5 Copy

All page + email copy is authored against the **Roman voice contract (PR #1)**. This spec does not duplicate the contract; the build PR must lint copy against it. Tone guardrails: no blame, short sentences, "we'll sort this out together," human reply path always offered.

---

## Section 6 — Feature flags

All three v2 surfaces ship dark in prod, on in staging, so we can validate before exposure.

| Flag | Default (prod) | Default (staging) | Gates |
|---|---|---|---|
| `FEATURE_BRANDED_RECOVERY_LINKS` | **OFF** | **ON** | Section 1 — token minting, `/recover` route, branded URL injection in `buildEmailData`. When OFF, emails render today's `billing_portal_url`. |
| `FEATURE_DUNNING_HUMAN_CLASSIFIER` | **OFF** | **ON** | Section 2 — classifier-gated coach notifications. When OFF, **no** coach notifications fire from the cadence (preserving v1's current behaviour, which sends none from the cadence today). |
| `FEATURE_DUNNING_CADENCE_V2` | **OFF** | **ON** | Section 3 — selects the 3-step Day 1/3/7 constant over the v1 4-step constant at config-resolution. When OFF, v1 cadence is used. |

Flag mechanics: read at config-resolution / request time so a flip does not require a code redeploy. Each flag is independent — branded links can be validated without touching cadence, and vice-versa. The classifier and branded-link flags are safe to enable together or separately.

---

## Section 7 — Hard gates

These are non-negotiable for the v2 build PR. CI / review must reject any change that violates them.

1. **No schema mutation on existing tables.** The *only* schema change is the **new** `PaymentRecoveryToken` table (Section 1.3). No new columns, no altered columns, no new FKs, no new indices on `DunningState`, `DunningAttempt`, `ClientPurchase`, `CoachProfile`, or any other existing model. `PaymentRecoveryToken` references `dunning_attempt_id` as a **bare unique string** (no Prisma relation) specifically to avoid touching `DunningAttempt`.
2. **No Stripe API surface changes.** No new Stripe calls that create charges; no change to `automatic_payment_methods` wiring (`stripe-connect-api.service.ts` L570). The Setup Intent flow uses existing Stripe Elements paths. We charge nothing from the cadence or the landing page.
3. **No new dependencies.** JWT signing uses the JWT library already in the dependency tree (the one backing the existing `JwtModule`/auth path). Email rendering uses the existing Handlebars template pipeline. Notifications use the existing `CoachAlertEmitter`. No new npm packages.
4. **Reuse, don't rebuild.** Coach notifications go through the existing `CoachAlertEmitter` (no new emitter). Resolution goes through existing `recordResolution`. Dispute notify already exists in `refund-dispute-handler.service.ts` (confirm only).
5. **Additive, reversible, dark-by-default.** Every v2 path is behind a flag (Section 6) defaulting OFF in prod. With all flags OFF, runtime behaviour is byte-identical to shipped v1 except for the dormant new table.

---

## Section 8 — Open operator decisions

1. **Step-1 (Day 3) notification polarity.** Confirm the intent (Section 2.3): for `{card_declined_generic, insufficient_funds, do_not_honor}` we **suppress** the coach notification (auto-recoverable); for all other reasons at Day 3 we **notify**. The brief's wording was a double-negative — please confirm this reading.
2. **Cadence change mechanism (Section 3.2).** Approve **Option B** (one-line `DEFAULT_DUNNING_CADENCE` change + relax the length-equality check so `DUNNING_CADENCE_DAYS=1,3,7` works as a true deploy-time override), versus the config-only Option A which cannot drop to 3 real steps. Recommended: Option B.
3. **Pay-now vs Setup-Intent-only on the landing page (Section 4.3 / 5.3).** Default is Setup Intent only (update the method, let Stripe's Smart Retry collect). Does the operator also want an explicit "pay the outstanding invoice now" button (Stripe hosted invoice / explicit `invoice.pay`)? This is the one place we could touch a Stripe charge path — currently **out of scope** by the Section 7 gate.
4. **Recovery-link expiry window.** Confirm `next_attempt_at + 24h` (Section 1.5). Alternative: a flat 72h from mint, simpler to reason about.
5. **Cancelled-step coach message + "Send personal message" flow (Section 2.3).** Confirm the deep-link target and whether the personal-message flow is in v2 scope or a fast-follow.
6. **Coach resolution path.** Confirm `ClientPurchase → CoachProfile.user_id` is the correct way to find the coach to notify (vs head-coach / team routing for `TeamProfile`-owned clients).
7. **Branding fallback.** Confirm the fallback when `CoachProfile.branding_logo_url` is null — default to TGP brand mark, or suppress the logo entirely?

---

## Appendix — Source references

All file paths and line numbers verified against the live repo at `/tmp/backend-main/` on `main@ed78bbef` (PR #281, Dunning v1). Cross-references:

- Dunning v1 implementation: PR #281 — `src/checkout/dunning.service.ts`, `prisma/schema.prisma` (L3526, L3572).
- Roman voice contract: PR #1 (copy authority for all client-facing strings in Sections 1 and 5).
- Coach branding fields: `prisma/schema.prisma` `CoachProfile` L479 (`business_name` L483, `branding_logo_url` L487, `branding_accent_color` L486).
- Coach-alert emitter: `src/notifications/emitters/coach-alert.emitter.ts`.
- Refund/dispute coach notify: `src/checkout/refund-dispute-handler.service.ts`.
- Stripe auto-retry wiring: `src/connect/stripe-connect-api.service.ts` L570.
- `customer.subscription.deleted` → `terminate`: `src/checkout/checkout-webhook-handler.service.ts` L142, L718.

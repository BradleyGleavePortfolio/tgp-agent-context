# B3 — Smart Dunning v2 GAPS Spec (v2 respec)

**Status:** Operator-locked (2026-06-09). Supersedes the original 3-step draft.
**Builds on:** Dunning v1 — PR #281, shipped on `main@ed78bbef`
**Scope:** 4-attempt charge cadence (Day 0/1/3/7) + Day-10 **hard lockout** · late-reversal handler · in-app blockers · mobile lockout screen · 3-channel coach notify at Day 7 · immediate-clear recovery · branded recovery links
**Doc type:** Specification only. **No source-code is touched by this PR. No migrations are applied.**

---

## §0 — Preamble

**This respec (PR #6) supersedes the original 3-step cadence.** The first draft of this document specified a reminders-only Day 1/3/7 cadence with a "human-needed" notify-suppress classifier, no terminal lockout, no late-reversal handling, and no mobile/in-app blocker surface. The operator reviewed it on **2026-06-09** and locked a materially different design:

- The cadence is now **five conceptual steps over four charge attempts plus a terminal lockout day**: charge on Days 0/1/3/7, then a **Day-10 hard lockout** with no charge.
- Notification is no longer "suppress on auto-recoverable, notify later." It is a **channel-escalation ladder**: each step adds transports (push → +email → +in-app blocker → +coach-all-channels).
- A **late-reversal handler** is added: if a charge that previously cleared dunning is later reversed (chargeback, late ACH fail, fraud hold, dispute), a new **compressed** dunning cycle starts.
- Lockout is **Option A "hard lockout"**: the mobile app collapses to a payment-update screen only; the coach app shows the client as `LOCKED`.
- Recovery is **Option A "immediate clear on success"**: a successful retry charge resolves dunning, restores entitlements, and dismisses all blockers in the **same request** — no `pending_resolution` intermediate state.

The original sections §1–§8 are **rewritten** below. New sections **§6 (late-reversal)**, **§7 (Day-10 sweep)**, **§8 (mobile screens)**, **§9 (coach notify service)** are added, alongside the retained **§10 (branded JWT recovery landing page)** and **§11 (operator open decisions)**. All copy follows the Roman voice contract (PR #1, `strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md` on branch `spec/roman-identity`).

> **Grounding discipline.** Every code claim below is verified against the live repo at `/tmp/backend-main/` (`main@ed78bbef`, PR #281 Dunning v1) with file paths and line numbers. Where the operator brief named a field that does not exist in the shipped schema, this spec flags the discrepancy and points at the real field (see §1, §9, §11).

---

## §1 — Codebase inventory (Dunning v1)

Verified by inspecting the live repo at `/tmp/backend-main/` (`main@ed78bbef`). Do **not** rebuild any of the following.

| Component | Path | Size | Notes |
|---|---|---|---|
| Cadence engine | `src/checkout/dunning.service.ts` | **1,293 lines** | Full lifecycle: `recordFailure` (L204), `recordResolution` (L333), `terminate` (L391), `tick`, `runSweeper` (L839), admin overrides. |
| Cadence constant | `src/checkout/dunning.service.ts` L87 | — | `DEFAULT_DUNNING_CADENCE = [{0,soft},{3,urgent},{7,final},{14,cancelled}]` — **4 elements.** |
| Cadence env parse | `src/checkout/dunning.service.ts` L106 (`resolveDunningConfig`) | — | Reads `DUNNING_CADENCE_DAYS`; accepts an override **only when `parts.length === DEFAULT_DUNNING_CADENCE.length`** (L114–115, default length 4). **See §3 — with the new 4-element cadence `0,1,3,7` the length check passes; this is NO LONGER A BLOCKER.** |
| Email-build payload | `src/checkout/dunning.service.ts` L1214 (`buildEmailData`) | — | Emits `billing_portal_url` from `process.env.BILLING_PORTAL_URL ?? 'https://thegrowthproject.app/billing'`, `coach_name: null`. The branded-URL injection point (§10). |
| Prisma `DunningState` | `prisma/schema.prisma` L3526 | — | `purchase_id @unique`, `status`, `failure_count`, `last_attempt_number`, `last_failed_amount_cents`, `last_failure_at`, `last_failure_reason`, `grace_period_ends_at`, `cancel_scheduled_at`, `resolved_at`, `abandoned_at`, `step_index @default(-1)`, `next_attempt_at`, `entered_at`, `recovered_at`, `escalated_at`. **Status values are `active \| resolved \| abandoned`** (L3530) — there is **no `cancelled` status**. **There is no `last_attempt_at` field** — the timestamp of the most recent failure is `last_failure_at` (see §7). |
| Prisma `DunningAttempt` | `prisma/schema.prisma` L3572 | — | `dunning_state_id`, `step_index`, `kind`, `scheduled_for`, `status` (`pending\|sending\|sent\|failed\|failed_permanent\|skipped\|cancelled`), `superseded_at`, `email_idempotency_key @unique`, `provider_message_id`, `failure_reason`, `retry_count`, `next_retry_at`. **UNIQUE(dunning_state_id, step_index)** gives attempt idempotency. |
| Email templates (4 dunning + receipts) | `src/email/templates/` | — | `payment-reminder-soft.hbs`, `payment-reminder-urgent.hbs`, `payment-final-notice.hbs`, `payment-recovered.hbs`, plus `dunning-final.hbs`. All currently render `<a href="{{billing_portal_url}}">`. |
| Email template keys | `src/email/email.types.ts` L23–28 | — | `DUNNING_FINAL`, `PAYMENT_REMINDER_SOFT`, `PAYMENT_REMINDER_URGENT`, `PAYMENT_FINAL_NOTICE`, `PAYMENT_RECOVERED`. |
| Admin endpoints (7) | `src/checkout/payment-ops.controller.ts` | — | `POST dunning/run-sweeper` (L264), `GET dunning/:purchaseId` (L273), `POST dunning/:purchaseId/advance` (L287), `POST dunning/:purchaseId/reset` (L300), `POST dunning/:purchaseId/cancel` (L313), `POST dunning/:purchaseId/trigger` (L319), `GET dunning/metrics/snapshot` (L335). |
| Stripe auto-retry wiring | `src/connect/stripe-connect-api.service.ts` L570–571 | — | `automatic_payment_methods[enabled]=true`, `allow_redirects=never`. **Note re §3:** v2 changes the operator model — our cadence now **does** drive charge retries (see §3.3). |
| Refund/dispute coach-notify | `src/checkout/refund-dispute-handler.service.ts` | — | Already notifies the coach on `charge.dispute.created/updated/closed`; resolves `ClientPurchase` from charge id via `ConnectTransfer.source_stripe_charge_id` / `SplitLedgerEntry` / PI metadata (L37, L142–162). Refund flow flips `ClientPurchase.status='refunded'`, `entitlement_active=false` (L44–47). **§6 reuses this charge-resolution path.** |
| Coach-alert emitter | `src/notifications/emitters/coach-alert.emitter.ts` | — | `CoachAlertEmitter.emit({coachId, alertId, alertType, message, severity, clientUserId})`. Writes an in-app `Notification` row **and** calls `notifications.pushToCoach(...)` — i.e. it already fans out **in-app + push** (L40–70). **§9 reuses this; email is the only transport it does not cover.** |
| Coach branding/contact source | `prisma/schema.prisma` L479 (`CoachProfile`) | — | **There is no `Coach` model and no `CoachProfile.business_email` field.** Branding lives on `CoachProfile.business_name` (L483), `branding_logo_url` (L487), `branding_accent_color` (L486). The brief's `coach_profile.business_email` does **not** exist — the coach's email is `User.email` (L157) reached via `ClientPurchase.coach_user_id` → `User`. See §9 + §11. |
| Coach push token | `prisma/schema.prisma` L186 (`User.expo_push_token`) | — | `expo_push_token` is on **`User`**, not `CoachProfile`. The brief's `expo_push_token` resolves to `coach.user.expo_push_token` via `ClientPurchase.coach_user_id` → `User` (L186). |
| Purchase → coach link | `prisma/schema.prisma` L3287–3288 | — | `ClientPurchase.coach_user_id` → `User` (`@relation("ClientPurchaseCoach")`). Single hop to the coach `User` for email + push token + in-app alert. |
| Entitlement field | `prisma/schema.prisma` L3309 (`ClientPurchase.entitlement_active Boolean @default(false)`) | — | **Entitlement is `ClientPurchase.entitlement_active`, not an `entitlements.active` table.** The brief's `entitlements.active = false` maps to `ClientPurchase.entitlement_active = false` (set on the refund/expiry paths today at L555, L700, L840, L859). |
| `invoice.paid` → `recordResolution` | `src/checkout/checkout-webhook-handler.service.ts` L967 | — | Resolution is already wired off `invoice.paid` / `invoice.payment_succeeded`. **§5's immediate-clear path hooks here.** |
| `invoice.payment_failed` → `recordFailure` | `src/checkout/checkout-webhook-handler.service.ts` L1005 | — | Failure detection is already wired. |
| Webhook charge-event routing | `src/checkout/checkout-webhook-handler.service.ts` L161–166 | — | `charge.refunded`, `charge.refund.updated`, `charge.dispute.created/updated/closed` are **already routed**. **§6's late-reversal handler attaches to these existing case arms — no new webhook registration.** |
| `customer.subscription.deleted` route | `src/checkout/checkout-webhook-handler.service.ts` L142 | — | Already calls `dunning.terminate(...)`. |
| Cron infrastructure | `@nestjs/schedule` `@Cron` | — | Established pattern: named cron-expression constants at fixed UTC times, e.g. `src/users/gdpr-scrub.scheduler.ts` L2/L35 and `src/wearables/maintenance/wearable-processed-event-prune.scheduler.ts` L2/L42 (04:00 UTC). **§7's Day-10 sweep follows this pattern.** |

**Net result of v1:** failed-payment detection, scheduled multi-step cadence, idempotent sends, race-safe ticks (CAS `pending → sending`), send-retry backoff, recovery/abandonment terminal handling, dispute coach-notify, and admin tooling are **done**. v2 adds charge-attempt semantics to the cadence, the lockout terminal, the reversal cycle, the blocker/lockout client surfaces, and the 3-channel coach notify.

---

## §2 — Schema deltas

The v1→v2 schema change set stays **minimal and zero-mutation-elsewhere**: one retained new table plus two **nullable/defaulted** columns on `DunningState` (a default-or-nullable column add is the only mutation permitted on an existing table because it cannot break existing rows or reads).

### 2.1 Retained from v1: `PaymentRecoveryToken` (new table, branded links — §10)

```prisma
// v2 — branded recovery links. NEW TABLE ONLY. No FK alter on existing tables.
model PaymentRecoveryToken {
  id                 String   @id @default(uuid())
  dunning_attempt_id String   @unique          // 1:1 with the attempt that minted it
  jwt_jti            String   @unique          // the JWT's jti claim; revoke without storing the token
  expires_at         DateTime
  used_at            DateTime?
  ip                 String?
  ua                 String?
  created_at         DateTime @default(now())

  @@index([expires_at])
  @@index([jwt_jti])
}
```

`dunning_attempt_id` is a **bare unique string** (no Prisma `@relation`) so `DunningAttempt` is not mutated.

### 2.2 NEW columns on `DunningState`

```prisma
model DunningState {
  // ...all existing v1 fields unchanged...

  // v2 — Day-10 hard lockout (§7). Null until the lockout sweep flips it.
  // Nullable: preserves every existing row and read path unchanged.
  locked_out_at  DateTime?

  // v2 — late-reversal cycle counter (§6). 0 = first/normal dunning cycle.
  // Incremented each time a previously-resolved state re-enters dunning
  // because a cleared charge was reversed. Drives copy-variant selection
  // (regular vs "again"/"second time" framing). Defaulted: zero-mutation
  // on existing rows (they read back 0).
  reversal_count Int       @default(0)
}
```

Both are **nullable / defaulted**, so the **zero-mutation-elsewhere gate holds**: existing rows continue to read and write exactly as before; no backfill, no breaking change to any query. No new indices are added (lockout sweep reuses the existing `@@index([status])` — see §7.2).

### 2.3 Exact Prisma model diff

```diff
 model DunningState {
   id                       String         @id @default(uuid())
   purchase_id              String         @unique
   purchase                 ClientPurchase @relation(fields: [purchase_id], references: [id], onDelete: Cascade)
   status                   String         @default("active") // active | resolved | abandoned
   failure_count            Int            @default(0)
   last_attempt_number      Int?
   last_failed_amount_cents Int?
   last_failure_at          DateTime?
   last_failure_reason      String?
   grace_period_ends_at     DateTime?
   cancel_scheduled_at      DateTime?
   resolved_at              DateTime?
   abandoned_at             DateTime?
   step_index               Int            @default(-1)
   next_attempt_at          DateTime?
   entered_at               DateTime?
   recovered_at             DateTime?
   escalated_at             DateTime?
   created_at               DateTime       @default(now())
   updated_at               DateTime       @updatedAt
+  // v2 — Day-10 hard lockout (§7)
+  locked_out_at            DateTime?
+  // v2 — late-reversal cycle counter (§6)
+  reversal_count           Int            @default(0)

   attempts DunningAttempt[]

   @@index([status])
   @@index([status, cancel_scheduled_at])
   @@index([status, next_attempt_at])
 }
```

No other model is touched. `PaymentRecoveryToken` (2.1) is the only net-new table.

---

## §3 — Cadence config

### 3.1 Operator-locked cadence (5 conceptual steps, 4 charge attempts + lockout)

| Day | Step index | Charge attempt? | Client push | Client email | In-app blocker | Coach notify |
|---|---|---|---|---|---|---|
| **0** | 0 | **YES** initial charge | YES on failure | NO | NO | NO |
| **1** | 1 | **YES** retry | YES | YES | NO | NO |
| **3** | 2 | **YES** retry | YES | YES | **YES** — "you're going to lose access" pop-up | NO |
| **7** | 3 | **YES** retry | YES | YES | **YES** pop-up | **YES** — in-app + email + push (all three) |
| **10** | (sweep) | **NO** | — | — | **LOCKED OUT (hard)** | (already notified at Day 7) |

The charge attempts live at Days **0, 1, 3, 7** → the cadence env array is **4 elements**. Day 10 is a separate terminal sweep (§7), not a cadence charge step.

### 3.2 Env var + default constant update

```
DUNNING_CADENCE_DAYS=0,1,3,7        # 4 elements
```

- The shipped default constant `DEFAULT_DUNNING_CADENCE` (`dunning.service.ts` L87) is **4 elements**. The build PR updates its `dayOffset` / `kind` values to the v2 mapping below (constant edit, not engine logic):

| step | day | kind | template |
|---|---|---|---|
| 0 | 0 | `soft` | `PAYMENT_REMINDER_SOFT` |
| 1 | 1 | `urgent` | `PAYMENT_REMINDER_URGENT` |
| 2 | 3 | `final` | `PAYMENT_FINAL_NOTICE` |
| 3 | 7 | `final` (escalated) | `PAYMENT_FINAL_NOTICE` |

- **The L106 `resolveDunningConfig` length-check is NO LONGER A BLOCKER.** It requires `parts.length === DEFAULT_DUNNING_CADENCE.length` (L114). With the default length staying **4** and `DUNNING_CADENCE_DAYS=0,1,3,7` also being **4 elements**, the check **passes** and the override is accepted as a pure deploy-time config. The original spec's "Option B relax the length check" recommendation is **withdrawn** — no length-check change is needed.

> The original spec flagged this length check as a code blocker because it tried to drop to a 3-element array. The locked 4-element cadence sidesteps it entirely. The only sanctioned source edit for the *build* PR is updating the `dayOffset`/`kind` values inside the 4-element default constant; the engine (`tick`, `recordFailure`, CAS, retry backoff) is untouched.

### 3.3 Per-step channel matrix (authoritative)

This is the operator table from 3.1, restated as the channel contract the `DunningEscalationClassifier` (§4) resolves per step. **Note the v2 shift:** unlike v1 (reminders-only), the cadence steps now correspond to **actual charge retries**. The charge re-attempt mechanism is the build-PR decision flagged in §11 (Stripe Smart Retries schedule aligned to Days 0/1/3/7, **or** explicit cadence-driven PaymentIntent confirm); either way the **notification channel ladder below is fixed**.

| Step | Day | Charge | push | email | in-app blocker | coach |
|---|---|---|---|---|---|---|
| 0 | 0 | initial | on failure only | — | — | — |
| 1 | 1 | retry | yes | yes | — | — |
| 2 | 3 | retry | yes | yes | yes (pop-up) | — |
| 3 | 7 | retry | yes | yes | yes (pop-up) | **yes (in-app + email + push)** |
| — | 10 | none | — | — | LOCKED OUT | (already notified) |

---

## §4 — DunningEscalationClassifier (REWRITE)

The v1 model — "suppress coach notify on auto-recoverable failure reasons, notify later" — is **removed**. v2 replaces it with a deterministic **channel-escalation resolver** keyed on `step_index`. Failure-reason taxonomy is retained only for **logging/analytics**, never to gate a channel.

### 4.1 Per-step channel resolver

| Step (day) | Channels fired after the charge attempt resolves as *failed* |
|---|---|
| **Step 0 (Day 0)** | **push-only-on-failure.** No email, no blocker, no coach. |
| **Step 1 (Day 1)** | **push + email.** No blocker, no coach. |
| **Step 2 (Day 3)** | **push + email + in-app blocker** (the "you're going to lose access" pop-up, §8.2). No coach. |
| **Step 3 (Day 7)** | **push + email + in-app blocker + coach (all 3 channels via §9).** This is the escalation peak. |
| **Day-10 sweep** | **No client notify** (the client is being locked out, not reminded) and **no coach notify** (the coach was already notified at Step 3). |

### 4.2 Code sketch (sketch only — no code written in this PR)

```ts
// src/checkout/dunning-escalation.classifier.ts
export interface ChannelDecision {
  push: boolean;
  email: boolean;
  inAppBlocker: boolean;        // render the Day-3/Day-7 pop-up (§8.2)
  coachAllChannels: boolean;    // fan out via CoachNotifierService.notifyDunningStep7 (§9)
  blockerVariant: 'none' | 'day3' | 'day7';
  copyKey: string;              // selects copy block in §C (regular vs late-reversal — §6)
}

@Injectable()
export class DunningEscalationClassifier {
  resolve(input: {
    stepIndex: number;          // 0..3
    isLateReversalCycle: boolean; // DunningState.reversal_count > 0 (§6)
  }): ChannelDecision {
    const lr = input.isLateReversalCycle;
    switch (input.stepIndex) {
      case 0: return { push: true, email: false, inAppBlocker: false,
                       coachAllChannels: false, blockerVariant: 'none',
                       copyKey: lr ? 'lr_step0_noop' : 'day0' };
      case 1: return { push: true, email: true, inAppBlocker: false,
                       coachAllChannels: false, blockerVariant: 'none',
                       copyKey: lr ? 'lr_step1_noop' : 'day1' };
      case 2: return { push: true, email: true, inAppBlocker: true,
                       coachAllChannels: false, blockerVariant: 'day3',
                       copyKey: lr ? 'lr_day3' : 'day3' };
      case 3: return { push: true, email: true, inAppBlocker: true,
                       coachAllChannels: true, blockerVariant: 'day7',
                       copyKey: lr ? 'lr_day7' : 'day7' };
      default: return { push: false, email: false, inAppBlocker: false,
                        coachAllChannels: false, blockerVariant: 'none',
                        copyKey: 'noop' };
    }
  }
}
```

Wiring: called inside the existing tick send-path (`dunning.service.ts` `tick`/`sendAttempt`) after a charge attempt resolves as failed. Push/email use the existing `EmailService` + push transports; `coachAllChannels` calls `CoachNotifierService.notifyDunningStep7(dunningStateId)` (§9); `inAppBlocker` writes the blocker flag the mobile client reads (§8.2). For a **late-reversal** cycle (`reversal_count > 0`) the resolver returns the **compressed** copy keys and the cycle is entered at Step 2 (§6.2), so Steps 0/1 are skipped entirely.

---

## §5 — Recovery flow (immediate clear on success — Option A)

On **any** successful retry charge, dunning resolves in the **same request**. There is **no `pending_resolution` intermediate state.**

### 5.1 Exact code path

1. **Entry point.** A successful charge surfaces as Stripe `invoice.paid` / `invoice.payment_succeeded`, already routed at `checkout-webhook-handler.service.ts` L152–155 and already calling `dunning.recordResolution(purchaseId)` at **L967**. If the build PR adopts cadence-driven PaymentIntent confirms (§11), the same `recordResolution` call is made inline on the charge-success branch of the retry job — identical downstream behaviour.
2. **`recordResolution(purchaseId)` (`dunning.service.ts` L333)** — already, in one transaction:
   - guards `status === 'active'` (idempotent: a second call is a no-op);
   - cancels `pending` cadence attempts, stamps `superseded_at` on `sending`/`failed` rows (CAS-safe, L347–358);
   - sets `status='resolved'`, `resolved_at`, `recovered_at`, clears `cancel_scheduled_at` and `next_attempt_at` (L360–369);
   - increments the `dunning_recovered_total` metric and logs `dunning.recovered`.
3. **v2 additions inside the same `recordResolution` transaction:**
   - **Restore entitlement same-request:** `ClientPurchase.entitlement_active = true` (mirrors the activation writes at `checkout-webhook-handler.service.ts` L394/L758). If `locked_out_at` was set, also clear it: `locked_out_at = null` (lifts the hard lockout, §7/§8.1 — the mobile guard re-reads on next request and restores full nav).
   - **Dismiss in-app blockers same-request:** clear the blocker flag the client reads (§8.2), so the next client request renders no pop-up and no lockout screen.
   - **Revoke recovery tokens:** mark all `PaymentRecoveryToken` rows for the state's attempts `used_at = now()` (§10.6).
   - **Emit `dunning.resolved` event** (in addition to the existing `dunning.recovered` log) for downstream consumers (analytics, coach feed "client recovered" entry).
4. **Confirmation email** (`sendRecoveryEmail`, L380) fires when `step_index >= 0`, exactly as v1.

### 5.2 Why same-request is safe

`recordResolution` runs in the existing resolution transaction with CAS-scoped attempt updates (PR #281 P1-1). Clearing `locked_out_at` + `entitlement_active=true` + blocker flag in that same transaction guarantees a client whose card just succeeded sees access restored on their **very next** API call — no eventual-consistency window, no `pending_resolution` row. A late duplicate success webhook hits the `status !== 'active'` guard and no-ops.

---

## §6 — Late-reversal handler (NEW)

If a charge that **previously cleared dunning** is later reversed by Stripe, start a **new, compressed** dunning cycle.

### 6.1 Detection

- **Triggers:** `charge.refunded`, `charge.dispute.created`, and a previously-cleared `invoice.payment_failed`/`charge.failed` (late ACH fail / fraud hold) — **all already routed** in `checkout-webhook-handler.service.ts` (L155 for `invoice.payment_failed`; L161–166 for refund/dispute). **No new webhook registration.**
- **Charge → purchase resolution** reuses the existing path in `refund-dispute-handler.service.ts` (L142–162): `ConnectTransfer.source_stripe_charge_id` → `SplitLedgerEntry` → PI metadata fallback.
- **"Previously cleared" test:** the resolved purchase has a `DunningState` with `status='resolved'` **and** `resolved_at IS NOT NULL`, and the reversed charge timestamp is **at or after** that `resolved_at`. Only then is this a late reversal of a cleared payment (vs a reversal of a charge that was never in dunning, which routes to the existing refund/dispute coach-notify and does **not** open a dunning cycle).

### 6.2 Compressed-cadence logic

A late reversal does **not** restart at Day 0. It **enters at Step 2 (Day 3-equivalent)** immediately:

- **Skip Steps 0 and 1** (Days 0/1). On cycle open: set `status='active'`, `step_index=2`, `reversal_count = reversal_count + 1`, clear `resolved_at`/`recovered_at`, schedule the next attempt for the Day-7-equivalent.
- **Immediate Step-2 fan-out:** in-app blocker + push + email fire **now** (the compressed Day-3 copy, §6.3).
- **Step 3 (Day-7-equivalent):** coach notify all channels (§9), blocker escalated.
- **Day-10-equivalent:** hard lockout sweep (§7) flips `locked_out_at` + `entitlement_active=false`.

So the compressed timeline is **enter-at-blocker → +4 days coach-notify → +3 days lockout**, preserving the same 3-day and 7-day gaps as the tail of the normal cadence but with no soft on-ramp.

### 6.3 Copy variant selection by `reversal_count`

`DunningState.reversal_count` selects the copy block:

- `reversal_count == 0` → regular copy (§C.1–§C.7).
- `reversal_count >= 1` → **late-reversal copy** (§C.8): the **Day-3 push/blocker** reads *"Your last payment update failed — you will be locked out in 3 days"*; the **Day-7 escalation** uses the *"again" / "second time"* framing; the **Day-10 lockout** copy is identical to the regular lockout. The classifier (§4.2) reads `reversal_count > 0` as `isLateReversalCycle` and returns the `lr_*` copy keys.

### 6.4 Idempotency rules (refund-after-dispute must NOT double-trigger)

- **One active cycle per state.** Opening a reversal cycle is guarded: if the state is **already `active`** (a cycle is in flight), the handler **no-ops** — it does not re-increment `reversal_count` or re-schedule. This is the critical rule that stops `charge.dispute.created` *then* a follow-on `charge.refunded` (issuer refunded the dispute) from opening two cycles: the second event sees `status='active'` and returns.
- **Event-keyed idempotency.** Each reversal event is recorded by its Stripe `event.id` (reusing the existing webhook idempotency/dedup layer that already guards the routed events). A redelivered `charge.dispute.created` with the same `event.id` is dropped before reaching the cycle-open logic.
- **Dispute→refund ordering.** `charge.dispute.created` opens the cycle (if not already active); a subsequent `charge.refunded` for the **same charge** within the same dispute is treated as the dispute's resolution and **does not** open a second cycle (guarded by the active-cycle check above). A `charge.refunded` for a charge with **no** prior dispute opens a cycle normally.
- **Increment-once-per-cycle.** `reversal_count` increments exactly once per *cycle open*, never per webhook event — so a triple-redelivered reversal still shows `reversal_count = 1`.

---

## §7 — Day-10 lockout sweep (NEW cron)

A new daily cron, **separate from the cadence tick/retry cron**, performs the hard lockout.

### 7.1 Schedule

- `@Cron` named job (`@nestjs/schedule`), following the established fixed-UTC-time pattern in `src/users/gdpr-scrub.scheduler.ts` (L2/L35) and `src/wearables/maintenance/wearable-processed-event-prune.scheduler.ts` (L42).
- **Runs once daily at 02:00 UTC.** Named constant `DUNNING_LOCKOUT_SWEEP_CRON_EXPRESSION = '0 2 * * *'`.
- It is **not** the retry/tick loop. It only performs lockouts; it never sends reminders or attempts charges.

### 7.2 Query

A row is locked out when it reached the final charge step (Step 3, Day 7) and **3 more days elapsed** with no resolution. Because the schema field is `last_failure_at` (there is **no** `last_attempt_at` — see §1), the authoritative query is:

```ts
// Day-10 = Day-7 final step + 3 days, still unresolved, not already locked.
const candidates = await prisma.dunningState.findMany({
  where: {
    status: 'active',
    step_index: 3,                               // reached the Day-7 final charge step
    locked_out_at: null,                         // not already locked (idempotent re-run)
    last_failure_at: { lt: subDays(new Date(), 3) },
  },
});
```

> **Field-name correction vs the brief.** The brief's query used `last_attempt_at`; the shipped `DunningState` has no such column. The equivalent is `last_failure_at` (`schema.prisma` L3537). The query reuses the existing `@@index([status])`; no new index is added (§2.2). `step_index: 3` is the Day-7 final step under the v2 cadence (§3.2).

### 7.3 Action (per candidate, in one transaction)

1. `DunningState.locked_out_at = now()`.
2. `ClientPurchase.entitlement_active = false` (the field at `schema.prisma` L3309; mirrors the existing deactivation writes at `checkout-webhook-handler.service.ts` L555/L700/L840).
3. Optionally stamp `abandoned_at` / leave `status='active'` with `locked_out_at` set as the lockout marker — **decision flagged in §11** (whether hard-lockout keeps `status='active'` or transitions to a terminal status). Default in this spec: keep `status='active'` and use `locked_out_at` as the lockout signal so a same-request recovery (§5) can still clear it via `recordResolution`.
4. **No client notify** (client is being locked, §4.1) and **no coach notify** (coach was notified at Step 3, §9). Idempotent: `locked_out_at: null` in the WHERE clause means a re-run never double-locks.

---

## §8 — Mobile screens (NEW)

React Native (Expo) app. Deep-link conventions follow the existing `tgp://...` scheme used across the codebase (e.g. `tgp://coach/clients/{userId}`, `refund-dispute-handler.service.ts` L28–30).

### 8.1 Hard-lockout payment-update screen (Day 10)

When `locked_out_at IS NOT NULL` for the signed-in client's purchase, the app collapses to a **single screen**. No bottom-tab nav, no other route reachable.

**Screen contract**

| Field | Value |
|---|---|
| Route name | `PaymentLockoutScreen` (registered as the **sole** screen in a dedicated `LockoutStack`) |
| Navigation guard | Root navigator reads entitlement/lockout on auth resume and on every cold start: if `lockout.active === true` (server flag derived from `locked_out_at != null && entitlement_active === false`), the router mounts **only** `LockoutStack` and unmounts `MainTabs`. No `goBack`, no deep-link can escape it; all `tgp://` deep links resolve to `PaymentLockoutScreen` while locked. |
| Props | `{ amountDisplay: string; coachBusinessName: string \| null; coachLogoUrl: string \| null; brandingAccentColor: string \| null; recoveryUrl: string; supportUrl: string }` |
| Layout | Full-screen, centred. Coach logo (fallback TGP mark) → headline → body copy → **primary button** "Update Payment" → **secondary text button** "Contact Support". No dismiss affordance, no back gesture. |
| Buttons | **Update Payment** → opens the branded recovery flow (§10 `recoveryUrl`, Stripe payment sheet → on success, backend attempts one immediate charge; if it succeeds, lockout clears **same-request** per §5, router re-mounts `MainTabs` on next resume). **Contact Support** → opens `supportUrl` (mailto/help deep link). |
| Copy | Roman lockout copy, §C.6 (straight + dry variant, 1-in-8 rotation per session). |

**Single recovery path:** client updates card → backend attempts one immediate charge → on success, `recordResolution` clears `locked_out_at`, restores `entitlement_active`, dismisses blockers (§5) → router restores full nav. On failure, the screen stays and shows the Roman "still declined" line (§C.6 error variant).

### 8.2 In-app blocker pop-up (Day 3 + Day 7 variants)

A blocker the client must acknowledge but which (unlike lockout) still allows app use after dismissal.

| Field | Value |
|---|---|
| Component | `DunningBlockerModal` |
| Modal vs full-screen | **Modal** (centred card over a dimmed scrim), **not** full-screen. Lockout (§8.1) is the full-screen escalation; the blocker is a modal so the client can still navigate after acknowledging. |
| Dismissible? | **Yes, soft-dismiss.** "Not now" closes it for the session, but it **re-presents on next app foreground/cold start** while the dunning state is active and the blocker flag is set. It is **not** permanently dismissible; only resolution (§5) clears it. |
| Trigger | Server sets a blocker flag at Step 2 (Day 3) and Step 3 (Day 7) via the classifier (§4). The client reads it on session start. |
| Day-3 variant | Headline "you're going to lose access" pop-up. Copy §C.3 (straight + dry). CTA buttons: **"Update Payment"** (primary → recovery flow §10) · **"Not now"** (soft-dismiss). |
| Day-7 variant | Same component, **escalated** copy (§C.5 — "last chance" framing). Same two CTAs. Visual treatment uses the accent/urgent tint. |
| Roman quip | Dry-joke variant rotates **1-in-8 per session** per the Roman spec (PR #1 §1.5). Never two quips in a row; quip is at the situation's expense, never the client's. |

---

## §9 — Coach notify service (NEW)

At **Day 7 (Step 3)** the coach is notified across **all three transports** from a **single trigger point**.

### 9.1 Contract

```ts
// CoachNotifierService.notifyDunningStep7(dunningStateId: string): Promise<void>
```

One call, fan-out to three transports:

1. **In-app** — bell-icon feed entry. Reuses the existing `CoachAlertEmitter.emit(...)` path (`coach-alert.emitter.ts`), which already writes a `Notification` row of kind `COACH_ALERT`.
2. **Push** — coach mobile app. Sent **only if** the coach `User.expo_push_token` is present (`schema.prisma` L186). Reuses `notifications.pushToCoach(...)` (already invoked inside `CoachAlertEmitter.emit`, L60).
3. **Email** — to the coach's email. **The brief named `coach_profile.business_email`, which does not exist** (§1). The email goes to **`User.email`** (L157) reached via `ClientPurchase.coach_user_id` → `User`. If a dedicated `CoachProfile.business_email` is desired, it must be **added by the build PR** (out of scope for this markdown-only PR) — flagged in §11. Default behaviour: `coach.user.email`.

### 9.2 Resolution + payload

- Resolve the coach: `DunningState.purchase_id` → `ClientPurchase` → `coach_user_id` → `User` (`schema.prisma` L3287–3288) for `email` + `expo_push_token`; → `CoachProfile` for `business_name`/branding if rendering a branded email.
- Email template carries **retry history** (the `DunningAttempt` rows for the state: step, scheduled_for, status, failure_reason) and a **deeplink to the dunning detail** admin/coach view (`tgp://coach/billing/...` style, matching existing deep links).

### 9.3 Idempotency keys

Each transport is keyed by **`dunning_state_id` + transport name** so a retried `notifyDunningStep7` does **not** triple-send:

```
coach_notify:{dunning_state_id}:inapp
coach_notify:{dunning_state_id}:push
coach_notify:{dunning_state_id}:email
```

Before dispatching a transport, check/insert its key (reusing the same dedup discipline as `DunningAttempt.email_idempotency_key @unique`, L29). If the key exists, that transport is skipped. So a redelivered trigger re-runs `notifyDunningStep7` safely; already-sent transports are no-ops, only a genuinely-failed transport retries.

### 9.4 Retries

A transport that throws is retried with bounded exponential backoff (mirroring the v1 send-retry discipline, PR #281 P2-3, `DunningAttempt.next_retry_at`/`retry_count`). The in-app transport is the durable source of truth (it always writes the feed row first); push/email are best-effort with retry. The single trigger point + per-transport keys mean a partial failure (e.g. push succeeds, email throws) retries **only** email on the next attempt.

---

## §10 — Branded JWT recovery landing page (retained)

Retained from the original spec (PaymentRecoveryToken approach). The "Update Payment" buttons in §8.1 and §8.2 open this flow.

### 10.1 Route + endpoints

- `GET /recover/:token` — server-rendered, mobile-first landing page; also a valid deep-link target `tgp://recover/:token`.
- `POST /payment-recovery/:token/confirm` — called after the Stripe payment sheet confirms; marks the token `used_at`, captures `ip`/`ua`, and routes to the immediate-clear flow (§5).

### 10.2 JWT structure

Signed JWT (HS256, dedicated secret `PAYMENT_RECOVERY_JWT_SECRET`, **not** the auth-session secret). The DB row (`PaymentRecoveryToken`, §2.1) exists for **revocation + audit**; verification is signature + `exp` + `jti`-live + `used_at IS NULL`.

```jsonc
{
  "iss": "tgp-payment-recovery",
  "sub": "<dunning_attempt_id>",
  "pid": "<purchase_id>",
  "cid": "<coach_user_id>",     // branding lookup at render
  "amt": 4999,                  // display only; re-read server-side at confirm
  "cur": "usd",
  "jti": "<uuid>",              // matches PaymentRecoveryToken.jwt_jti
  "iat": 1730000000,
  "exp": 1730259200             // = next_attempt_at + 24h
}
```

### 10.3 Expiry, single-use, idempotency

- `expires_at = next_attempt_at + 24h` at mint time; for the final step (no next attempt) use `grace_period_ends_at + 24h`, falling back to `now + 7d`. Enforced twice: JWT `exp` (cheap) and `PaymentRecoveryToken.expires_at` (authoritative).
- **Single-use:** consumed on confirm (`used_at = now()`); revoked when the state resolves (§5.3 marks all rows `used_at`).
- **One token per attempt:** `dunning_attempt_id @unique`; minting is `upsert`-by-attempt (tick replay returns the same token).
- **Confirm idempotent:** if `used_at` is already set **and** the state is already `resolved`, return `200 {already_resolved:true}`.

### 10.4 Page behaviour

- **Header:** `CoachProfile.business_name` + `branding_logo_url` (+ `branding_accent_color` for the CTA tint); fallback to TGP brand mark when logo is null (fallback choice flagged §11).
- **Body:** failed amount + lockout/cancellation date.
- **Primary CTA "Update Payment":** Stripe payment sheet. On success, the backend attempts **one immediate charge** (single recovery path, §8.1); success routes through §5 (same-request clear).
- **Secondary CTA "Contact Support" / "Talk to my coach":** in-app deep link.
- **Expired-token page:** Roman "this link expired" page (§C.7) with a "Request a new link" CTA that mints a fresh token for the active attempt and emails it within 60s; if the state is no longer active, show "looks like you are already sorted."
- **No PII-logging analytics scripts**; server access logs only.

---

## §11 — Operator open decisions (for sign-off before builder dispatch)

1. **Charge-retry mechanism for Days 0/1/3/7.** v2 makes the cadence steps *charge attempts* (§3.3). Confirm the mechanism: **(a)** align Stripe Smart Retries to Days 0/1/3/7 and keep us a listener, or **(b)** drive explicit cadence PaymentIntent confirms from the retry job. (b) touches a Stripe charge path that v1 deliberately avoided (`stripe-connect-api.service.ts` L570). Pick one; the notification ladder (§4) is unaffected either way.
2. **`CoachProfile.business_email` does not exist (§9.1).** Confirm whether the Day-7 coach email goes to **`User.email`** (default, no schema change), or whether the build PR should **add** a `CoachProfile.business_email` column (a second existing-table mutation beyond §2 — would need a new gate exception).
3. **Lockout terminal status (§7.3).** When Day-10 fires, keep `status='active'` + `locked_out_at` set (so same-request recovery via `recordResolution` can clear it), or transition to a terminal `status` value? The shipped enum is `active | resolved | abandoned` only — there is no `locked_out` status. Default in this spec: keep `active` + use `locked_out_at` as the signal.
4. **Recovery-link expiry window (§10.3).** Confirm `next_attempt_at + 24h`, or a flat 72h from mint.
5. **Branding fallback (§10.4).** When `CoachProfile.branding_logo_url` is null — default to the TGP brand mark, or suppress the logo?
6. **Roman voice on transactional email — RESOLVED (Option 3, 2026-06-09).** The Roman identity spec (PR #1 §0, §4) had listed transactional email as out of scope. The operator locked **Option 3 — "Roman is the brand voice for the user-facing app"** (2026-06-09 12:06 PT), which **extends** Roman's voice to **all** dunning and transactional email. The Day-1/3/7 dunning emails in §C are therefore canonical Roman copy. See `ROMAN_VOICE_POLICY.md` §2.3 (email scope) and §10 (decision #10). No further sign-off required.
7. **Quip rate on high-stakes financial surfaces — RESOLVED (Option 3, 2026-06-09).** Locked to the operator-set flags: **`roman_quip_rate_client = 0.125`** (~1-in-8) on client dunning surfaces and **`roman_quip_rate_coach = 0.083`** (~1-in-12) on the Day-7 coach notifications. "Never two quips in a row" is enforced locally; money/lockout surfaces may opt out of a quip on any given render regardless of assignment. See `ROMAN_VOICE_POLICY.md` §5 (locked flags) and §3.2 (quip rules). No further sign-off required.
8. **Coach routing for team-owned clients.** Confirm `ClientPurchase.coach_user_id` is always the right coach to notify, vs head-coach/team routing for `TeamProfile`-owned clients.
9. **In-app blocker re-present cadence (§8.2).** Confirm soft-dismiss re-presents on next foreground (default), vs once-per-day, vs once-per-step.
10. **Coach-app LOCKED badge behaviour.** Confirm a locked-out client shows in the coach roster with a red "LOCKED" badge, cannot send messages, and cannot view past content — and whether the coach can trigger a manual recovery nudge from that row.

---

## §C — Copy variants (Roman brand voice, Option 3 — `ROMAN_VOICE_POLICY.md`)

**Option 3 locked (2026-06-09).** Roman is the **brand voice** of the user-facing app, including **all dunning email** (the earlier transactional-email scope conflict is resolved in Roman's favour — see §11.6). All copy below is authored against the canonical **`ROMAN_VOICE_POLICY.md`** (repo root), which extends the original `strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md` (PR #1, branch `spec/roman-identity`) to brand-voice scope.

Rules applied (from `ROMAN_VOICE_POLICY.md` §3): no emoji; **no contractions in the straight variant** ("you will," not "you'll"); **contractions permitted only in the dry-joke variant** (the softening is the delivery); short complete sentences; formal-but-warm, never sycophantic, never American-casual; the dry quip is at the **situation's** expense, never the client's; **never two quips in a row**; max one honorific per message (prefer `{firstName}`); no weak apologies. Quip rate is operator-locked at **`roman_quip_rate_client = 0.125`** (~1-in-8) on client surfaces and **`roman_quip_rate_coach = 0.083`** (~1-in-12) on the Day-7 coach surfaces (§11.7). Money-failure surfaces (every variant below) **never** trigger the `smile` avatar — dunning is `neutral` throughout (`ROMAN_VOICE_POLICY.md` §4). Tokens: `{firstName}`, `{coachName}`, `{clientName}`, `{amount}`, `{cardLast4}`, `{lockoutDate}`, `{reason}`, `{dunningDetailDeeplink}` (see `ROMAN_VOICE_POLICY.md` §10b token glossary). Each item ships **≥2 variants** (straight + dry Roman) so the rotation has material; **34 variant strings total** (17 items × straight + dry).

### C.1 Day 0 — push (card decline)
- **Straight:** "A small matter, {firstName}: your payment did not go through. I will try again tomorrow. You need do nothing for now."
- **Dry Roman:** "A small matter, {firstName}: your card declined. I'll have another word with it tomorrow."

### C.2 Day 1 — push + email (retry)
- **Push — straight:** "{firstName}, your payment is still outstanding. I attempted it again today without success. Updating your card will settle it."
- **Push — dry Roman:** "{firstName}, the payment and I are not yet on speaking terms. A fresh card would help our negotiations."
- **Email body — straight:**
  "Good day, {firstName}.

  Your payment of {amount} has not yet cleared. I attempted it again today, and it was declined. The card on file ends {cardLast4}.

  Update your payment method and I will see the rest sorted. Nothing else is required of you.

  — Roman, on behalf of {coachName}"
- **Email body — dry Roman:**
  "Good day, {firstName}.

  Your payment of {amount} remains unpersuaded. I tried once more today; the card ending {cardLast4} held firm.

  A fresh card usually settles the argument. I'll handle the rest.

  — Roman, on behalf of {coachName}"

### C.3 Day 3 — push + email + in-app blocker ("your access is at risk")
- **Push — straight:** "{firstName}, your access is at risk. Three attempts have not cleared {amount}. Please update your card to keep things in order."
- **Push — dry Roman:** "{firstName}, your access is on thin ice. The card ending {cardLast4} and I have tried three times now."
- **Email — straight:**
  "Good day, {firstName}.

  Your payment of {amount} has now failed three times. If it remains unsettled, you will lose access to your programme. Update your card and I will restore everything at once.

  — Roman, on behalf of {coachName}"
- **Email — dry Roman:**
  "Good day, {firstName}.

  Three attempts, three refusals. Your access is genuinely at risk now. Update the card and I'll put it all back the moment it clears.

  — Roman, on behalf of {coachName}"
- **In-app blocker (Day-3 pop-up) — straight:**
  Headline: "You are going to lose access."
  Body: "Your payment of {amount} has not cleared after three attempts, {firstName}. Update your card now and you will keep everything. If it stays unpaid, your access will be locked."
  Primary: "Update Payment" · Secondary: "Not now"
- **In-app blocker (Day-3 pop-up) — dry Roman:**
  Headline: "You are going to lose access."
  Body: "I have asked your card three times, {firstName}, and three times it's said no. Update it now and we'll forget this ever happened. Leave it, and the door locks."
  Primary: "Update Payment" · Secondary: "Not now"

### C.4 Day 7 — push + email (last chance) + escalated blocker
- **Push — straight:** "{firstName}, this is the last reminder. Your payment of {amount} is still outstanding. Without it, your access will be locked in three days."
- **Push — dry Roman:** "{firstName}, last call. The card ending {cardLast4} has had every chance. Three days until the lights go out."
- **Email — straight:**
  "Good day, {firstName}.

  This is the final notice. Your payment of {amount} remains unpaid after four attempts. In three days your access will be locked on {lockoutDate}. Update your card now and I will restore everything immediately.

  — Roman, on behalf of {coachName}"
- **Email — dry Roman:**
  "Good day, {firstName}.

  The final notice, and I do not send many. {amount} is still outstanding after four attempts. On {lockoutDate} the door locks. A working card stops it, and I'll have you back in at once.

  — Roman, on behalf of {coachName}"
- **In-app blocker (Day-7 escalated pop-up) — straight:**
  Headline: "Last chance before lockout."
  Body: "Your payment of {amount} has failed four times, {firstName}. On {lockoutDate} your access will be locked. Update your card now to keep everything."
  Primary: "Update Payment" · Secondary: "Not now"
- **In-app blocker (Day-7 escalated pop-up) — dry Roman:**
  Headline: "Last chance before lockout."
  Body: "Four attempts, {firstName}, and the card hasn't budged. On {lockoutDate} the door locks for good. One working card is all it takes, and I'll let you straight back in."
  Primary: "Update Payment" · Secondary: "Not now"

### C.5 Day 7 — coach notifications (all three channels)
- **Coach in-app (bell feed) — straight:** "{clientName}'s payment failed — they will be locked out in 3 days."
- **Coach in-app — dry Roman:** "{clientName}'s payment has failed four times. They lock out in 3 days unless the card cooperates."
- **Coach push — straight:** "{clientName} payment failed — locks out in 3 days. Open to review."
- **Coach push — dry Roman:** "{clientName}'s card has run out of excuses. Lockout in 3 days. Tap to review."
- **Coach email — full template — straight:**
  "Good day, {coachName}.

  One of your clients, {clientName}, has a payment that will not clear. I have attempted it four times and it remains unpaid. Unless it is settled, their access will be locked on {lockoutDate}.

  Retry history:
  • Day 0 — {amount} — declined ({reason})
  • Day 1 — {amount} — declined ({reason})
  • Day 3 — {amount} — declined ({reason})
  • Day 7 — {amount} — declined ({reason})

  You may wish to reach out to them directly. The full record is here: {dunningDetailDeeplink}

  — Roman"
- **Coach email — dry Roman:**
  "Good day, {coachName}.

  {clientName}'s card and I have had four conversations this week, none of them productive. {amount} is still outstanding, and their access locks on {lockoutDate}.

  Retry history:
  • Day 0 — {amount} — declined ({reason})
  • Day 1 — {amount} — declined ({reason})
  • Day 3 — {amount} — declined ({reason})
  • Day 7 — {amount} — declined ({reason})

  A word from you may carry more weight than mine has. The record is here: {dunningDetailDeeplink}

  — Roman"

### C.6 Day 10 — lockout screen
Dignified, **never** condescending (`ROMAN_VOICE_POLICY.md` §3.5). Leads with the canonical "household ledger" stem.
- **Straight:** "The household ledger remains unsettled, {firstName}. Your payment of {amount} did not clear after several attempts. Access will resume the moment billing is current. Update your card to restore everything at once; I will be here when it is done."
  Subline (error / still declined): "That card was declined as well. Try another, or contact support and I will see what can be arranged."
- **Dry Roman:** "The door is locked, {firstName}. The ledger never did balance — {amount} stayed outstanding despite my best efforts. Set it right with a fresh card and I'll have you back inside straight away."
  Subline (error / still declined): "That one declined too. We're nothing if not persistent. Try another card, or contact support."

### C.7 Recovery — expired link page
- **Straight:** "This link has expired, {firstName}. No harm done. Request a fresh one below and I will send it within the minute."
- **Dry Roman:** "This link has expired, {firstName}. Links, like milk, do not keep. Request a new one and I'll have it to you within the minute."

### C.8 Late-reversal copy (reversal_count ≥ 1)
- **Day-3 push (compressed entry) — straight:** "{firstName}, your last payment update failed. You will be locked out in 3 days unless it is settled. Update your card to keep your access."
- **Day-3 push — dry Roman:** "{firstName}, the payment we thought was settled has come undone. Three days to a lockout. A fresh card sets it right."
- **Late-reversal Day-3 in-app blocker — straight:**
  Headline: "Your last payment update failed."
  Body: "The payment that restored your access has been reversed, {firstName}. You will be locked out in 3 days unless your card is updated. Update it now to keep everything."
  Primary: "Update Payment" · Secondary: "Not now"
- **Late-reversal Day-3 in-app blocker — dry Roman:**
  Headline: "Your last payment update failed."
  Body: "We have been here before, {firstName} — the payment came undone again. Three days until lockout. Update the card and I'll consider the matter closed, this time for good."
  Primary: "Update Payment" · Secondary: "Not now"
- **Late-reversal Day-7 escalation ("again"/"second time" framing) — straight:**
  "Good day, {firstName}. This is the second time a settled payment has come undone. Your access will be locked on {lockoutDate} unless {amount} clears. Update your card now and I will restore everything at once. — Roman, on behalf of {coachName}"
- **Late-reversal Day-7 escalation — dry Roman:**
  "Good day, {firstName}. Twice now a payment has slipped through after I thought it settled. On {lockoutDate} the door locks. A working card ends the cycle, and I'll let you back in immediately. — Roman, on behalf of {coachName}"
- **Late-reversal Day-10 lockout:** identical to §C.6 (regular lockout copy — straight + dry Roman).

---

## Appendix — Source references

All file paths and line numbers verified against the live repo at `/tmp/backend-main/` on `main@ed78bbef` (PR #281, Dunning v1).

- Dunning v1 engine: `src/checkout/dunning.service.ts` — `DEFAULT_DUNNING_CADENCE` L87 (4 elements), `resolveDunningConfig` L106 (length-check L114), `recordResolution` L333, `terminate` L391, `runSweeper` L839, `buildEmailData` L1214.
- Prisma `DunningState` L3526 (status enum L3530, `last_failure_at` L3537, `step_index` L3552); `DunningAttempt` L3572 (`email_idempotency_key @unique`).
- `ClientPurchase`: `coach_user_id` L3287, `entitlement_active` L3309.
- `User`: `email` L157, `expo_push_token` L186 (push token lives on User, not CoachProfile).
- `CoachProfile` L479: `business_name` L483, `branding_accent_color` L486, `branding_logo_url` L487 — **no `business_email`**.
- Webhook routing: `src/checkout/checkout-webhook-handler.service.ts` — `customer.subscription.deleted` L142, `invoice.paid`/`payment_succeeded` L152–155 → `recordResolution` L967, `invoice.payment_failed` L155 → `recordFailure` L1005, `charge.refunded`/`dispute.*` L161–166, entitlement deactivation L555/L700/L840.
- Charge→purchase resolution + dispute coach-notify: `src/checkout/refund-dispute-handler.service.ts` L37, L142–162; deep links L28–30.
- Coach-alert emitter (in-app + push fan-out): `src/notifications/emitters/coach-alert.emitter.ts` L40–70.
- Stripe auto-retry wiring: `src/connect/stripe-connect-api.service.ts` L570–571.
- Cron pattern (@nestjs/schedule, fixed UTC): `src/users/gdpr-scrub.scheduler.ts` L2/L35; `src/wearables/maintenance/wearable-processed-event-prune.scheduler.ts` L2/L42.
- Roman voice contract: PR #1 — `strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md` (branch `spec/roman-identity`). Note §0/§4 scope: transactional email currently out of Roman scope (see §11.6).

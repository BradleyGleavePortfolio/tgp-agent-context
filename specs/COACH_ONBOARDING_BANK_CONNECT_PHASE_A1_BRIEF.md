# Coach Onboarding — Phase A.1 Bank-Connect Brief

**Date:** 2026-06-09
**Track:** Coach onboarding (mobile)
**Phase:** A.1 — Connect Bank Account as **parallel** option to Stripe Connect
**Status:** Spec (locked by operator 2026-06-09)
**Depends on:** PR #374 merged (`f123ef1` — bank-payout/ACH Phase A backend) ✅; v1-6 coach admin shipped (mobile) — sequencing rule
**Backend API surface:** already shipped in PR #374 — `/payouts/bank-accounts` family of endpoints
**Mobile repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Web repo:** N/A (no web app exists; mobile-only — operator-locked)

---

## 0. Operator instruction (verbatim)

> "in the coach onboarding, we need to add 'connect ban kaccount' as a parallel option to stripe account as well - that needs to be in scope"

Interpretation: during the coach onboarding flow, the "Connect Stripe" step gets a sibling CTA: **"Connect Bank Account"**. Both are valid paths to a payable state. Coach picks one (or both — additive, not exclusive).

---

## 1. Why parallel, not replacement

Stripe Connect remains the default for cards. Bank-Connect (ACH via the backend's `PayoutsV2` module) gives coaches a lower-fee payout option AND a payable destination that doesn't require Stripe onboarding (KYC handled differently, see backend spec). Some coaches will only have one or the other ready on signup day; we don't want either side blocking the other.

Backend already supports both — PR #374 added bank-account create / verify / set-default. PR #374 explicitly left the mobile UX for Phase A.1 (this brief).

---

## 2. Surfaces in scope

### 2.1 Coach onboarding screen — `PayoutSetupScreen` (or equivalent)

Current shape (post-PR #228/#229): single "Connect Stripe" CTA. Change to:

```
┌─────────────────────────────────────────┐
│  How will you receive payments?         │
│                                         │
│  Pick one to start. You can add the     │
│  other later in Settings.               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [Stripe logo]                  │    │
│  │  Connect Stripe                 │    │
│  │  Cards + faster setup.          │    │
│  │  Fees: 2.9% + $0.30 / charge.   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [Bank icon]                    │    │
│  │  Connect Bank Account           │    │
│  │  ACH direct deposit.            │    │
│  │  Fees: 0.8% capped at $5.       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Both work. You can connect both later. │
│                                         │
└─────────────────────────────────────────┘
```

Both CTAs are equally weighted visually. No "recommended" badge. No copy that implies one is primary.

### 2.2 Settings → Payouts (post-onboarding)

Existing settings screen gets a "Payout methods" list with:
- Stripe Connect status (Connected / Not connected / Action required)
- Bank Account status (with last-4 if present)
- Add Stripe / Add Bank Account CTAs as appropriate
- Set default payout destination radio

### 2.3 Roman voice strings

All new strings go through Roman's voice contract. Examples:

- Onboarding hero (Roman intro line above the two CTAs):
  - `"Two ways to receive payment. Either works, and you may add the other at any time."`
- Stripe-connect success toast:
  - `"Stripe is connected. Your card payments will route here."`
- Bank-connect success toast:
  - `"Your bank account is connected. ACH payouts will route here."`
- Stripe-connect failure:
  - `"Stripe did not finish connecting. The error: {reason}. I will try again on your next attempt."`
- Bank-connect failure:
  - `"Your bank account did not verify. The error: {reason}. Please review and re-enter the details."`
- Verification-pending:
  - `"Your bank account is awaiting verification. I will notify you when it is ready."`

No exclamations on these — none qualify as the rationed milestone. No emoji. No "Oops!" / "My bad."

---

## 3. Mobile API integration (already shipped by PR #374)

Endpoints to call (verify exact paths in PR #374 spec — placeholder shapes):
- `POST /payouts/bank-accounts` — create (routing #, account #, account name)
- `POST /payouts/bank-accounts/:id/verify` — start micro-deposit verification (or whatever PR #374 chose)
- `POST /payouts/bank-accounts/:id/confirm-micro-deposits` — submit amounts
- `GET /payouts/bank-accounts` — list (for Settings)
- `PATCH /payouts/payout-methods/default` — set default destination
- `DELETE /payouts/bank-accounts/:id` — remove

**Feature flag:** `FEATURE_BANK_PAYOUTS_V2` is set on the BACKEND. Mobile reads it from `/me/feature-flags` (or whatever the existing flag-fetch pattern is). When flag is OFF for this coach, the "Connect Bank Account" CTA is hidden and the onboarding falls back to Stripe-only.

---

## 4. Validation & UX rules

### 4.1 Inputs

- Routing number: 9 digits, ABA checksum (front-end mod-10 validation as a UX guardrail; backend re-verifies)
- Account number: 4-17 digits typically (no strict UX cap; backend authoritative)
- Account holder name: 2-80 chars
- Account type: checking / savings (radio)

### 4.2 Sensitive-input handling

- Masked account-number entry (show last 4 only after blur)
- No clipboard auto-paste on routing/account fields (privacy)
- No analytics events that include any digits of routing/account — only event names + status

### 4.3 Micro-deposit flow

- Two ~$0.0X deposits land in 1-3 business days
- "Verify deposits" screen accepts two amounts in cents
- Up to 3 verification attempts before lockout — locked state shows Roman error string + "Contact support" link

### 4.4 Empty / failure / loading states

- All three explicit: spinner with Roman string, error card with Roman string + retry, success toast
- Network failure must not crash the onboarding flow — back button always returns to PayoutSetup with state preserved

---

## 5. Telemetry

PostHog events (read existing `useTelemetry()` hook):

- `onboarding_payout_setup_viewed` — props: `{coachId}`
- `onboarding_stripe_connect_started` — props: `{coachId}`
- `onboarding_stripe_connect_completed` — props: `{coachId, durationMs}`
- `onboarding_stripe_connect_failed` — props: `{coachId, errorCode}`
- `onboarding_bank_connect_started` — props: `{coachId}`
- `onboarding_bank_connect_submitted` — props: `{coachId}` (no PII)
- `onboarding_bank_connect_verification_started` — props: `{coachId}`
- `onboarding_bank_connect_verification_completed` — props: `{coachId}`
- `onboarding_bank_connect_verification_failed` — props: `{coachId, attemptNumber}`
- `onboarding_bank_connect_locked_out` — props: `{coachId}`
- `onboarding_payout_method_set_default` — props: `{coachId, method: 'stripe' | 'bank'}`

---

## 6. Accessibility

- Both CTAs are buttons (not links), `accessibilityRole="button"`
- VoiceOver/TalkBack labels include "Connect Stripe — cards plus faster setup" and "Connect Bank Account — ACH direct deposit"
- Account number field labeled "Account number, sensitive" (so screen readers warn)
- Minimum touch target 44x44 pt iOS / 48dp Android

---

## 7. Out of scope (Phase A.1)

- Plaid bank-link UX (PR #374 used a non-Plaid path — confirm with backend spec)
- Tax-form collection (W-9 / W-8BEN) — separate track
- 1099 / payout-history dashboards — separate track
- Multi-currency / non-USD bank accounts
- International ACH (only US ACH in Phase A)
- Web UX (no web app exists)

---

## 8. Test plan (mobile)

Unit tests for:
- Validators (routing checksum, account-number length, account-type selector)
- Reducer / state machine for bank-connect flow (idle → submitting → pending-verify → verifying → verified | locked-out | failed)
- Roman-voice string fixtures (snapshot, with quip-allowance asserted as ZERO for these surfaces)

Integration tests for:
- PayoutSetupScreen renders both CTAs when flag ON, Stripe-only when flag OFF
- Stripe success path
- Bank-connect happy path through verification
- Bank-connect lockout after 3 failed verifications
- Settings → Payouts shows both methods + default-toggle works

12+ tests minimum.

---

## 9. Dispatch conditions

This Phase A.1 builder is dispatched **after**:
1. PR #229 (v1-5 mobile community) merged — ✅ done @ 5adba07
2. PR #376 (MWB-1 backend) merged
3. v1-6 (coach admin inbox + moderation) builder dispatched and merged
4. This brief reviewed by operator

Builder model: Opus 4.8.
Auditor model: GPT-5.5.

---

## 10. Sources

- PR #374 — bank-payout/ACH Phase A backend (merged `f123ef1`)
- Operator instruction 2026-06-09: "connect bank account as parallel option to stripe in coach onboarding"
- `AI_BUTLER_ROMAN_IDENTITY_SPEC.md` — voice contract for all surfaced strings
- `MASTER_BUILD_PLAN.md` — sequencing
- Apple Human Interface Guidelines — Account input fields, Onboarding
- Material Design 3 — Form patterns, Onboarding
- NACHA Operating Rules — ACH return codes (for verification-failure error mapping)

---

**Owner sign-off:** Dynasia G (operator), 2026-06-09 — verbatim instruction captured §0.

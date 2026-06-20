# A12 · Referral tracking (bidirectional + first-payment celebration)

**Status:** NOT STARTED (ZERO; substrate adjacent in invite-codes + share-link modules)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A12
**Tier/lane:** Tier 4 / T4.A12

---

## State of build

**ZERO.** Substrate adjacent in `invite-codes/` + `share-link/` modules — extend rather than greenfield.

## Operator-expanded scope — bidirectional + first-payment celebration

- **Client → client referrals** (a client refers a friend to their coach)
- **Coach → coach referrals** (a coach refers another coach to TGP)
- **First-payment trigger event:** when a referred party (whether client paying their coach, OR coach paying TGP seat fee) processes their first payment, the system AUTOMATICALLY fires:
  1. **Popup to the referrer:** *"Your referral just processed their first payment! Here's a gift from us →"*
  2. **Free TGP shirt fulfillment** (shipping address collection → fulfillment provider integration)
- Reward types per side:
  - **Client-side:** storefront discount / free week / cash via Connect
  - **Coach-side:** TGP swag (shirt for first, ladder up later) + month free, etc.

## What to build

- **`Referral` model** (`referrer_user_id`, `referred_user_id`, `type: client_to_client | coach_to_coach`, `status`, `first_payment_at`, `reward_fulfilled_at`, `idempotency_key`)
- **Unique referral URL per user** (extend `share-link/` for personalized tokens)
- **Stripe-webhook attribution:** on `payment_intent.succeeded` for a referred user → flip referral to fulfilled → trigger gift workflow
- **Gift fulfillment integration:** shirt-shipping provider (Printful, Shopify, etc. — operator-decide)
- **Celebration popup component** (mobile + web) — on-doctrine, Roman voice ("Your referral just processed…")
- **Coach-side dashboard:** referral leaderboard, total referrals, total revenue attributed

## Acceptance criteria

- [ ] `Referral` model migrated with RLS policy
- [ ] Unique referral URL generates per user (e.g. `tgp.fit/r/<token>`)
- [ ] Stripe webhook attribution: payment_intent.succeeded → referral fulfilled (idempotent)
- [ ] Gift fulfillment integration ships (operator-selected provider)
- [ ] Celebration popup renders on mobile + web; Roman voice on copy
- [ ] Free TGP shirt fulfills automatically on first coach-to-coach referral
- [ ] Coach dashboard renders leaderboard + attribution metrics
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** **elevated** (financial attribution + PII shipping address)
- **Idempotency:** **critical** — Stripe webhook retries must not double-fulfill
- **Audit events:** every referral fulfillment + shirt order = `AuditEvent`
- **Voice/UI:** **Roman voice** on celebration popup (this is *the* celebration moment); Maya voice on dashboard
- **Anti-badge-theater (§9):** rewards tied to real outcome (first payment), not vanity. Passes test.
- **PII:** shipping address stored encrypted at rest; minimal-retention policy

## Dependencies

- **Blocks:** nothing further
- **Blocked by:** Tier 1–3 gates; Stripe Connect spine (already PROD)

## Operator decisions (locked)

> "Referral tracking engine - client to client, coach to coach - For coach-coach referrals, i want a popup that states 'Your referral jsut processed their first payment! Here's a gift from us →' and its a free TGP shirt!"

## Open operator questions

- Fulfillment provider: Printful, Shopify Print, or in-house? (Operator-decide before build.)
- Ladder-up reward structure beyond first shirt: defer to v2?

## Previous-operator working notes

*First operator on this item appends here.*

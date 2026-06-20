# A8 · Hyperscaler lead funnel

**Status:** MOSTLY built (all four primitives shipped, the 7-step welding is missing)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A8
**Tier/lane:** Tier 4 / T4.A8
**Rank rationale:** Operator: "I want this to be hyperscaler quality flow."

---

## State of build

**MOSTLY** — all four primitives shipped, integration missing.

**What's built:**
- `storefront/` (20+ files including guest-checkout, reconciliation, recovery, rate-limiter, idempotency, PII scrub)
- `contracts/` (envelope + template + signed-PDF + providers + webhooks — e-sign engine)
- `checkout/` (purchase-split-handler, dunning, dunning-v2)
- `landing-pages/` (custom-domain + DNS verifier + lead-rate-limiter + section-schemas + CRM dir)
- `CoachLandingPage`, `CoachLandingPageSection`, `CoachLandingLead`, `CoachLandingPageView`
- Mobile: `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `CheckoutReturnScreen`, `OnboardingStep1…10`, `LeanQ1…6`, `Day1Win`, `PurchaseUnpackScreen`

## Operator-expanded scope — the 7-step hyperscaler funnel

1. **TGP creates the landing page for the coach** (template-driven, drop-in customization, on-doctrine)
2. **Coach puts link in bio** (Instagram/TikTok/X) — short branded URL
3. **Prospect lands → reads → guest checkout** (no account required; already supported by `guest-checkout.service`)
4. **Superlink to download the app** (deep-link that survives App Store / Play Store install)
5. **App opens → auto-assigns the prospect to the coach** (no manual code entry)
6. **App auto-assigns the package they just bought on the web page** (no re-selection)
7. **Coach gets notified, client lands on Day-1 Win**

## What to build (the welding)

- Funnel composer that chains the 7 steps into a coach-configurable single setup screen
- Superlink generation + deferred-deep-link handling
- Landing-page → guest-checkout → install → auto-assign-coach-and-package atomic flow
- End-to-end test: simulate prospect → page → checkout → install → app open → coach assigned + package assigned

## Acceptance criteria

- [ ] Funnel composer screen ships (coach configures in one screen)
- [ ] Short branded URL generation (e.g. `tgp.fit/coach/handle`)
- [ ] Superlink survives App Store install (use Branch.io or AppsFlyer or Apple Universal Links + Google App Links)
- [ ] App-open handler auto-assigns coach + package (idempotent, audit-logged)
- [ ] End-to-end test passes in CI
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard (lead row scoped to coach)
- **Idempotency:** **critical** — auto-assign must not double-assign on retry
- **Audit events:** lead-created, coach-assigned, package-assigned all emit `AuditEvent`
- **Voice/UI:** Maya voice on coach composer; Roman voice on Day-1 Win arrival
- **Security:** rate-limit lead submission per IP+coach (already via `lead-rate-limiter`)

## Dependencies

- **Blocks:** nothing further
- **Blocked by:** Tier 1–3 gates

## Operator decisions (locked)

> "I want this to be hyperscaler qquality flow - TGP create your landing page → put link in bio → client can do a gyues checkout → superlink to download — auto assinged to them → auto assigned the package they bought on the web page."

## Open operator questions

- Superlink provider: Branch.io, AppsFlyer, or roll our own with Universal/App Links?

## Previous-operator working notes

*First operator on this item appends here.*

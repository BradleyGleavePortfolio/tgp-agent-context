# A13 — Money Flow Engine: Reservation Logic, Stripe Stack, and Branding

**Status:** Design locked, pending operator implementation.
**Owner:** *(set by operator on dispatch)*
**Supersedes:** A13 v1 spec stub in `roadmap/specs/A13-money-flow-engine.md`
**Companion file:** keep `specs/A13-money-flow-engine.md` as the operator's acceptance-criteria checklist; this doc is the design rationale + locked product decisions feeding into it.

---

## 0. North Star

TGP becomes the **financial operating system for coaching businesses**, not an app with a payments feature bolted on. Coaches, sub-coaches, and clients manage money inside TGP. Stripe is invisible infrastructure. Stripe's dashboard is sealed off. Off-brand interactions are minimized to legally mandatory disclosures only.

Two product principles that drive every decision below:

1. **HC delinquency becomes a forecasting problem, not a collection problem.** Funds are pre-reserved as sales arrive, not chased after the due date.
2. **The Stripe dashboard is a leak in our product.** Every interaction users have with `stripe.com` is a competing UX experience for our payments feature. We close the leak.

---

## 1. Reservation Logic — Locked Rules

### 1.1 Custody model
- **Option A: Stripe Connect with delayed/manual payouts.** Money stays in the SC's Stripe Connect balance.
- TGP does NOT custody funds directly. No Stripe Treasury, no money-transmitter licensing, no sponsor-bank relationship in v1.
- TGP enforces a "spendable vs reserved" split via virtual ledger on top of Stripe's balance.

### 1.2 Reservation rate calculation
- Reservation rate is **derived, not flat.** Recomputed weekly per SC↔HC rule.
- Formula: `target_reserve / forecasted_sales_to_obligation_date`.
- Example: SC owes HC $200 on the 5th, has 24 days remaining in cycle, historical sales = $50 avg × 24 sales forecast = $1200. Reservation rate = 200/1200 ≈ 17% per sale.
- Recompute trigger: weekly cron + on every materially-large sale (>20% of forecast).

### 1.3 Overshoot behavior — roll forward
- If by day 20 the reserved bucket has $250 against a $200 obligation, the extra $50 **rolls forward** into next cycle's reservation bucket.
- Strong months buffer weak months. SC sees: "Reserved this cycle: $200 ✓ | Pre-funded next cycle: $50."
- This is the TGP-equivalent of a SaaS treasury team's monthly rollover policy.

### 1.4 Behind-pace escalation ladder
When reservation pace falls behind forecast, siphon rate steps up:
- **20% siphon (default)** — normal pace.
- **40% siphon** — gap detected, deadline closing.
- **80% siphon** — emergency pace, near-due-date shortfall.

Trigger logic: comparison of current reserved balance vs linear-pace target by day-of-cycle. Push notification fires at each step-up: "You're $X behind on this month's HC payment. We're now reserving Y% of each sale until you catch up."

### 1.5 Shortfall waterfall (partial-pay, never all-or-nothing)
On obligation due date:
1. **Settled-confirmed reserved funds → released to HC immediately.**
2. **Settled-unconfirmed reserved funds → released to HC on T+2 buffer** (catches highest-probability ACH returns: R01 NSF, R03 no account, R04 invalid account, all return within 2 biz days).
3. **Remainder pulled from SC's card-on-file** (Stripe-stored card, charged automatically).
4. **Still short → dunning ladder activates** (day 0 → day 3 → day 7, per A03 spec).
5. **HC sees real-time status:** "$147 paid today, $53 follows on [date], dunning in progress."

Cash velocity matters. Partial payments always beat all-or-nothing holds.

### 1.6 Float ownership
- **TGP keeps the float** on reserved funds sitting in Stripe Connect balances awaiting release.
- Documented as a TGP revenue line in the financial model.
- At small scale: rounding error. At $50M ARR: real revenue. Spec the structure now.

### 1.7 Tax/1099 implications
- **Deferred to Year 2.** Spec acknowledges the obligation, does not scope it.
- Note: if TGP starts custodying funds via Treasury in the future, 1099 issuance flips from Stripe to TGP. v1 stays on Connect rails, so Stripe handles 1099-K issuance for SCs/HCs.

### 1.8 Stripe dashboard lockdown ("fish to water")
- **Every SC Connect account is configured with `payouts.schedule = manual`.**
- SCs physically cannot withdraw funds via `dashboard.stripe.com`. Every payout request flows through TGP API → reservation engine validates → Stripe API executes.
- This is the architectural choice that makes the reservation system real, not theater. Same pattern Toast and Square use for restaurant operators.
- Stripe Express dashboard access is **disabled** on Connect account creation.

### 1.9 SC reservation dashboard — the highest-stakes screen in A13
The SC needs continuous visibility into:
- Spendable balance
- Reserved balance (per active HC rule)
  - Settled-confirmed portion (ready to release)
  - Settled-unconfirmed portion (clearing date)
- Pending inbound (ACH not yet settled, won't count this cycle)
- Forecast: "At current pace, you'll be $X over / $X short by due date"
- Current siphon rate and what triggered it

First time an SC sees "we withheld $10 from your $50 sale" without context, they'll think TGP stole their money. UX must be unmistakable, calm, and trust-building.

### 1.10 Rule scope — percent rules bypass reservation entirely
- **Percent-of-revenue rules** (HC takes X% of every SC sale) are routed at the moment of sale. No reservation engine needed — money is pre-reserved by definition.
- **Flat-monthly rules** and **hybrid rules (flat + percent over threshold)** are the actual reservation-engine targets.
- This simplifies the engine: only run reservation logic for rules where reservation is meaningful.

### 1.11 Other locked decisions from earlier scoping
- **Failed-payment dunning ladder** for flat charges (day 0 → day 3 → day 7). Inherits from A03.
- **`monthly_cap_cents` optional field** on percent rules (default null = no cap).
- **Automatic same-month refund clawback**, cross-month manual handling.
- **HC "Money from team" rollup widget** (~3-5 files, dashboard surface).
- **Rule changes take effect next cycle only.** Never mid-cycle.
- **Flat means flat.** No zero-revenue exception unless rule is hybrid with $0 floor.
- **31st-of-month → last-day-of-month fallback** (inherits Stripe Subscriptions behavior).

---

## 2. The 5-State Ledger — ACH-Aware Settlement Tracking

Current 2-state model (spendable / reserved) doesn't survive contact with ACH. Replaced by:

| State | Definition | Reservable? | Payable to HC? |
|---|---|---|---|
| **Pending** | ACH initiated, not settled | No | No |
| **Settled-unconfirmed** | ACH settled, inside return window (~5 biz days unauth, 60 consumer disputes) | Yes (virtually) | No (until T+2 buffer clears) |
| **Settled-confirmed** | Past unauth return window | Yes | Yes |
| **Reserved** | Earmarked for HC obligation | — | Yes (when due) |
| **Reversed** | ACH return / NSF / dispute | Negative balance event | Clawback required |

Card sales skip Pending and Settled-unconfirmed (land in Settled-confirmed in ~2 days). ACH sales stair-step through all states.

### Channel-aware forecasting
The weekly reservation-rate recompute reads SC's card vs ACH mix:
- **Card-heavy SC (80%+ card):** trusts ~95% of inbound to arrive by due date.
- **ACH-heavy SC (80%+ ACH):** must compute "how much settled-confirmed money will I have by the obligation date given current pending/unconfirmed pipeline?"
- ACH-heavy SCs hit the escalation ladder **earlier** because less time exists for late sales to settle into payable status.

### Clawback handling (the nightmare scenario)
Scenario: HC paid $200 on the 5th. On day 10, an ACH that funded $80 of that reservation bounces (NSF). SC's balance goes -$80.

Handling:
1. **ACH return webhook** detected by TGP.
2. **SC balance** marked negative; future withdrawals **gated** until restored.
3. **Dunning ladder activates** (day 0/3/7) to recover from SC.
4. **If unresolved at day 14:** HC notified of clawback risk. TGP either eats the loss (small scale) or pursues SC via collections (large scale).
5. **Velocity-based ACH risk scoring** — v2 enhancement. First-time ACH from new SC client: longer hold. SC with 6 months clean history: shorter hold.

---

## 3. The Stripe Stack — Five Products, One Job Each

### 3.1 Stripe Connect (Custom)
**Job:** Custody, multi-party money movement, KYC, payout control.
- **Connect Custom** (not Standard, not Express) — TGP owns the entire onboarding UX.
- Every SC has a Connect Custom account.
- **`payouts.schedule = manual`** locked on every account.
- TGP collects KYC fields via TGP-branded forms, submits via Stripe API.
- No SC ever sees a `stripe.com` page during onboarding.

### 3.2 Stripe Financial Connections
**Job:** User-friendly bank linking + balance check + NSF prevention for inbound ACH.
- Plaid-equivalent: client logs into their bank via Stripe-hosted modal, account verified in ~10 seconds.
- No micro-deposits, no routing-number typing.
- **Balance pre-check** before initiating debit (where bank supports). Kills most NSF returns at the door.
- **Custom branding object** passed in session creation: TGP logo, TGP green, "Connect your bank to TGP."

### 3.3 Stripe Payment Element + Elements
**Job:** Client-facing checkout UI, drop-in but TGP-themed.
- Use **Stripe Elements (low-level individual components)** wrapped in TGP-branded containers.
- Shows card, bank (via Financial Connections), Apple Pay, Google Pay, Link, Cash App Pay based on what's enabled.
- Subscription billing auto-initiated 2 business days before cycle date (Same-Day ACH lands the day before due date).

### 3.4 Same-Day ACH (inbound)
**Job:** Collapse client-payment settlement to T+0/T+1.
- Inbound debits initiated before ~2pm ET settle same business day.
- Cost: ~1% (capped at $5) vs 0.8% standard. Marginal premium.
- Limit: $1M per transaction (NACHA recently raised from $100K).
- **Note:** Faster settlement does NOT shorten the return window. Use Financial Connections balance check to mitigate NSF risk separately.

### 3.5 Instant Payouts via RTP/FedNow (outbound)
**Job:** Instant, irrevocable outbound payments to HC/SC banks.
- Default outbound rail: **RTP/FedNow** when receiving bank supports (most major US banks do in 2026).
- Settlement: seconds. Irrevocability: complete. Once HC has the money, no clawback possible from the rail itself.
- Fallback: **ACH credit** (~T+1) for banks not on RTP network.
- Premium upsell: **Instant Payouts to debit card** (1.5% fee, immediate, works on any debit card). TGP keeps margin on this.

### Rail policy summary

| Flow | Default rail | Fallback | Premium |
|---|---|---|---|
| Client → SC (inbound) | Same-Day ACH via Financial Connections | Standard ACH with Plaid Auth | Card (always available) |
| SC reserved → HC (internal release on due date) | Internal ledger update + RTP credit | ACH credit | — |
| TGP → SC personal bank (withdrawal) | RTP/FedNow | ACH credit | Debit-card Instant Payout (1.5% fee) |
| TGP → HC personal bank (HC payout) | RTP/FedNow | ACH credit | Debit-card Instant Payout (1.5% fee) |

### Cost reality check
Per $50 transaction, rough numbers:

| Rail | Cost |
|---|---|
| Standard ACH | ~$0.40 |
| Same-Day ACH | ~$0.50 |
| Financial Connections + Same-Day ACH | ~$0.50-0.80 |
| Card | ~$1.75 |
| RTP outbound | ~$0.25-0.50 |

TGP absorbs the ~$0.10-0.40 fast-rail premium in v1. v2 can pass-through to SC as a platform fee toggle.

### What's NOT in the stack
- **Stripe Treasury** — explicitly out. Triggers money-transmitter compliance. Not needed for v1 product.
- **Plaid** — replaced by Stripe Financial Connections (same capability, integrated billing).
- **Third-party KYC vendors** (Persona, Alloy, etc.) — Stripe Connect Custom covers identity verification natively.

---

## 4. Branding — Sealing the Stripe Leaks

Stripe is rails, TGP is brand. The user experiences payments as a TGP feature throughout.

### 4.1 Surfaces where Stripe leaks, and how each is sealed

**Checkout / payment forms (client side)**
- Use individual Stripe Elements wrapped in TGP-branded containers.
- Custom domain for hosted pages: `pay.tgp.app` (or equivalent), not `checkout.stripe.com`.
- Only mandatory Stripe mark: "Secured by Stripe" footnote in ~10px grey at modal bottom.

**Bank verification flow (Financial Connections)**
- Custom branding object on session creation: TGP logo, primary color, secondary color.
- Modal copy: "Connect your bank to TGP," not "Connect your bank to Stripe."
- Bank logos (Chase, BofA, etc.) stay — clients expect to see them.

**Connect account onboarding (SC/HC side)**
- **Connect Custom** (not Express). TGP owns every screen.
- KYC forms built by TGP, submitted to Stripe via API.
- Zero `connect.stripe.com` page loads during onboarding.
- Trade-off: TGP takes on KYC form-building and ongoing identity verification UX. For a treasury-grade product, worth it.

**Payout notifications**
- **Disable Stripe's default payout emails** (Connect → Notifications → off).
- TGP fires its own notification on webhook arrival: "Your payout of $X just landed in your account ending 4421." Push + email + in-app, all TGP-branded.

**Receipts and statements**
- Set statement descriptor on every charge: `TGP COACHING` or per-SC `TGP * COACH_NAME` (22 chars max, ASCII).
- Custom email receipts via Stripe receipt template, themed with TGP logo and support email. Or disable Stripe receipts entirely and send TGP-native receipts.

### 4.2 Where "Stripe" will still appear (unavoidable)
1. **"Secured by Stripe"** footnote on Financial Connections modal (~10px grey, compliance).
2. **Bank statement line item** if a refund happens (rare, configurable via descriptor).
3. **Dispute/chargeback notices** from card issuers (legal requirement to name the processor).
4. **Connect terms-of-service link** during onboarding (one line, one click).

Outside these four, normal users never see "Stripe."

### 4.3 TGP-branded vocabulary (replaces Stripe jargon throughout)

| Stripe term | TGP term |
|---|---|
| Stripe Connect account | **TGP Wallet** (placeholder — pending naming choice) |
| Connect balance | **TGP balance** |
| Instant Payout | **TGP FastCash** (placeholder — pending naming choice) |
| Reserved funds | **TGP Locked** or **HC Reserve** |
| Settled vs unsettled ACH | **Cleared / Clearing** |
| Plaid / Financial Connections | **"Link your bank to TGP"** |
| Same-Day ACH | (silent — just default speed) |
| Payouts dashboard | **Your TGP Money** |
| ACH (the acronym) | **Bank transfer** |
| NSF return | **Bank rejected the payment** |
| Chargeback | **Disputed charge** |

Users never see "ACH," "Connect," "Stripe," "Plaid," or "NSF" in normal flows.

### 4.4 Branding decisions still open
- **Naming for the money surface:** "TGP Wallet" used as placeholder. Alternatives: "TGP Treasury" (premium signal), "Coach Wallet" / "Coach Cash" (playful, brand-aligned), "TGP Money" (simple, owns the category). Operator/owner decision pending.
- **Naming for instant outbound:** "TGP FastCash" placeholder. Alternatives: "TGP Instant," "TGP Express Withdraw," "TGP Now."
- **Visual treatment of reservation dashboard:** Maya voice + numbers-forward per existing TGP doctrine. Specific layout owned by design pass during operator implementation.

---

## 5. Operator Scope and Sequencing

### 5.1 Operator count
- **A13 v2 total:** 22-28 operators (was 10-14 in v1 stub).
- Growth came from: reservation engine (+6), 5-state ACH ledger (+4), branding/UX layer (+3), Connect Custom KYC forms (+2), Plaid → Financial Connections migration (+2 if Plaid currently in use).

### 5.2 Recommended split — two sub-PRs
**A13a — Card-only money flow (~12-15 operators)**
- Rule types (percent / flat / hybrid / custom-date)
- Reservation engine with derived rate + escalation ladder + roll-forward
- Custody lockdown (Connect Custom + manual payout schedule)
- SC reservation dashboard (card-only state model)
- Partial-pay waterfall (card-only)
- TGP-branded checkout via Stripe Elements
- HC rollup widget
- Payment notifications swap (TGP-native)

**A13b — ACH integration + fast rails (~10-13 operators)**
- 5-state ledger replacing 2-state model
- Financial Connections + Same-Day ACH inbound
- RTP/FedNow outbound
- Channel-aware forecasting
- Clawback handling + dunning integration
- Branded ACH UX layer
- Instant Payout (debit card) premium upsell

A13a ships first and is usable for card-paying clients (70%+ of TGP's actual base by industry norms). A13b unlocks SC↔HC bank-rail flows + client ACH for the remainder.

Validating reservation math on the card-only model first means bugs surface without ACH-state-machine complexity layered on top.

### 5.3 Doctrine flags (carry from v1, expanded)
- **RLS tier:** **TIER 1 (financial)** — every model in A13 enforces tier-1 policy.
- **Idempotency:** **MANDATORY** — every transfer, every reservation tick, every scheduler execution has an idempotency key. Re-running is a no-op.
- **Audit events:** every MoneyFlowRule mutation, every reservation rate change, every payout execution emits an `AuditEvent` row.
- **Voice/UI:** Maya voice on all surfaces. Numbers-forward, calm, trust-building. No marketing copy on the reservation dashboard.
- **Dispute traceability:** every `ConnectTransfer.id` traceable to originating `MoneyFlowRule.id` + reservation pace at execution + idempotency key + 5-state ledger snapshot.

---

## 6. Acceptance Criteria (delta from v1 stub)

In addition to v1 stub criteria:

- [ ] Connect Custom onboarding flow ships, zero `stripe.com` page loads.
- [ ] `payouts.schedule = manual` enforced on every Connect account at creation.
- [ ] Reservation engine derives rate weekly per active rule.
- [ ] Escalation ladder (20/40/80) triggers on pace lag, with SC push notif at each step.
- [ ] Roll-forward logic for overshoot verified across two consecutive cycles.
- [ ] Partial-pay waterfall releases settled-confirmed funds on due date, settled-unconfirmed on T+2.
- [ ] Stripe dashboard payout attempt by SC is **blocked** (verified via test SC account).
- [ ] Financial Connections modal renders with TGP branding (logo, primary color, copy).
- [ ] Statement descriptor confirmed as `TGP COACHING` (or per-SC variant) on test charge.
- [ ] Stripe default payout emails disabled; TGP-native notification fires on webhook.
- [ ] 5-state ledger persisted in DB with transitions logged as AuditEvents.
- [ ] ACH return webhook handler tested with simulated NSF return, SC balance goes negative, withdrawal gate engages.
- [ ] RTP/FedNow payout to test HC account verified, fallback to ACH credit verified on non-RTP bank.
- [ ] SC reservation dashboard shows: spendable, reserved (split by settlement state), pending pipeline, forecast, current siphon rate + trigger reason.
- [ ] HC rollup widget shows: total inflows this cycle, per-SC breakdown, projected vs actual, dispute log.
- [ ] All PRs dual-CLEAN (backend lint + frontend lint + tests + migrations).

---

## 7. Open Operator Decisions

1. **Naming:** "TGP Wallet" / "TGP Treasury" / "Coach Wallet" / "TGP Money" — owner decision.
2. **Instant outbound naming:** "TGP FastCash" / "TGP Instant" / "TGP Now" — owner decision.
3. **Premium Instant Payout pricing:** absorb the 1.5% (TGP eats), pass through (SC pays), or markup (TGP keeps 0.5%)?
4. **First-time ACH velocity scoring:** v1 flat 5-day hold or risk-tiered from day 1? Recommendation: v1 flat, v2 risk-tiered. Confirm.
5. **HC payout cadence flexibility:** rule supports custom billing day (1-28 + last-day-of-month). Should rules also support semi-monthly or weekly cadences in v1? Recommendation: monthly only in v1, semi-monthly in v2.

---

## 8. References

- v1 spec stub: [`roadmap/specs/A13-money-flow-engine.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/specs/A13-money-flow-engine.md)
- v2 master plan §1.A A13: [`roadmap/TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md)
- Doctrine invariants: [`roadmap/DOCTRINE_INVARIANTS.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/DOCTRINE_INVARIANTS.md)
- Stripe Connect Custom docs: https://docs.stripe.com/connect/custom-accounts
- Stripe Financial Connections docs: https://docs.stripe.com/financial-connections
- Stripe Same-Day ACH: https://docs.stripe.com/payments/ach-debit
- Stripe Instant Payouts: https://docs.stripe.com/connect/instant-payouts
- RTP/FedNow on Stripe: https://docs.stripe.com/payouts/instant-payouts-banks

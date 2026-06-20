# TGP Wallet — Borrow Cash Surface

**Status:** Concept locked, legal/regulatory pathway TBD. Operator: do NOT spec implementation until lending license and legal counsel are engaged.
**Source:** Owner ruling 2026-06-19. "Small loans idea is gold."
**Companion:** `A13_MONEY_FLOW_DESIGN.md` (Wallet rails this rides), `IDIOT_INDEX_RULINGS.md` §2.8.

---

## 1. The Thesis

TGP holds float on SC reserved funds. TGP sees real-time SC revenue, payment health, cash flow forecasts (A22), and behavioral data (A20). **TGP knows whether an SC can afford a $5K bridge loan better than any bank does.** That underwriting advantage is the moat.

Adding a "Borrow Cash" surface inside TGP Wallet creates:
- An additional revenue line (interest income).
- A retention hook (once a coach owes TGP money, switching costs go up).
- A natural extension of the financial-OS-for-coaching positioning.

---

## 2. The Math (Owner Sanity Check)

**Owner-stated baseline scenario:**

| Variable | Value |
|---|---|
| Active coach borrowers | 100 |
| Average loan size | $5,000 |
| Monthly interest rate | 3% |
| Annual default rate | 10% |

**Calculations:**

- **Deployed capital:** 100 × $5,000 = **$500,000**
- **Gross monthly interest:** $500K × 3% = **$15,000/month**
- **Gross annual interest:** **$180,000/year**
- **Annual default writedown:** $500K × 10% = **$50,000**
- **Net annual yield:** $180K − $50K = **$130,000**
- **Net yield % on capital:** $130K / $500K = **26%**

### Sensitivity table

| Default rate | Net yield/year | Net yield % |
|---|---|---|
| 5% | $155,000 | 31% |
| 10% (baseline) | $130,000 | 26% |
| 15% | $105,000 | 21% |
| 20% | $80,000 | 16% |
| 25% | $55,000 | 11% |
| 30% | $30,000 | 6% |
| 35% | $5,000 | 1% (break-even) |

**Conclusion:** Highly profitable up to ~30% default rate. Industry baseline for unsecured small business lending: 15-25%. With TGP's underwriting visibility (real-time revenue, payment health, behavioral data), default rate should land at 8-15% — comfortably profitable.

### Scale projection

| Borrowers | Capital deployed | Net yield @ 10% default |
|---|---|---|
| 100 | $500K | $130K/year |
| 500 | $2.5M | $650K/year |
| 1,000 | $5M | $1.3M/year |
| 5,000 | $25M | $6.5M/year |

At 5,000 borrowers — which is achievable when TGP hits gym-tenant scale — Borrow Cash becomes a $5M+/year revenue line on its own.

---

## 3. The Hard Part — Legal Enforcement

**Owner concern:** "How to legally enforce my loans is hard."

This is the right concern. Three legal/regulatory dimensions:

### 3.1 Lending license requirements
- **State-by-state licensing:** Each US state has its own commercial/consumer lending licensing regime. Most require a Money Lender License or equivalent. Many cap interest rates.
- **Federal:** Not directly licensed at federal level for commercial lending, but subject to UCC Article 9 (secured transactions) and federal usury caps.
- **3% monthly = 36% APR.** This is above many state usury caps for **consumer** lending (often 12-25%). For **commercial** lending (loans to businesses, not individuals), most states have higher or no caps. **TGP must structure loans as commercial loans to coach businesses, not personal loans to individuals.**

### 3.2 Path of least friction — three options

**Option A: Partner with a licensed lender.**
- TGP underwrites and surfaces the loan offer; partner lender (e.g., Lendio, Pipe, Capchase) actually issues the loan.
- TGP earns a referral fee + revenue share on interest.
- Pros: zero licensing burden, ships in months.
- Cons: lower margin (~30-50% of interest income), less control of UX.

**Option B: Get licensed in priority states first.**
- TGP applies for commercial lender licenses in CA, FL, TX, NY (largest coach markets).
- TGP issues loans directly.
- Pros: full margin, full UX control.
- Cons: 6-12 months per state, legal fees, ongoing compliance overhead.

**Option C: Hybrid — partner now, license later.**
- v1 ships via partner lender for speed.
- TGP collects underwriting performance data on the partner book.
- Once data shows clean default rates AND scale justifies licensing, transition to direct issuance.
- Pros: fastest to market, optionality on the upside.
- Cons: switching costs when transition happens.

**Recommendation: Option C.** Ship Borrow Cash as a partner-backed product in v1 to validate demand and underwriting model. Transition to direct issuance once volume justifies the licensing investment.

### 3.3 Enforcement mechanics

Even with a license, collecting on defaults is hard. Mitigations:

- **Auto-debit from TGP Wallet:** loans repay automatically from incoming SC revenue. Borrower opts in to this at loan acceptance. Significantly reduces voluntary default — money never reaches the coach's hands before paying TGP first.
- **Reserve gating:** active loan creates a reserve tier on SC's Wallet. Like the HC obligation reserve but for loan repayment. SC's spendable balance is computed after reserve.
- **Cross-default to other TGP obligations:** if a coach defaults on a TGP loan, that becomes a credit event flagged across the platform (visible to HCs, future loan requests, etc.).
- **Collateral via Connect balance freeze:** TGP can freeze SC's outbound payouts if loan goes delinquent. This is a stronger lever than any traditional lender has — TGP controls the cash flow source.
- **Personal guarantee + UCC-1 filing:** for larger loans (>$10K), require personal guarantee and file UCC-1 against coach's business assets. Standard small-business lending practice.

### 3.4 Regulatory exposure
- **Truth in Lending Act (TILA):** applies to consumer loans, not commercial. If TGP structures correctly (loans to LLCs / sole prop businesses for business purposes), TILA does not apply.
- **State usury caps:** as noted, commercial loans have higher caps. Some states (e.g., NY) require careful structuring.
- **Anti-discrimination (ECOA):** applies to commercial too. TGP must not discriminate in lending decisions based on protected classes. The advantage: AI underwriting based on revenue/payment data is inherently fair-lending-compliant if properly audited.
- **Disclosure requirements:** APR, fees, repayment terms must be clearly disclosed. Required regardless of state.

**Conclusion:** legal pathway exists, but **must not be DIY.** Engage commercial lending counsel before any v1 design work.

---

## 4. The Product Surface — TGP Wallet "Borrow Cash"

### 4.1 UI placement
- New section in TGP Wallet labeled "Borrow Cash" (placeholder; final naming TBD per IDIOT_INDEX §2.13).
- Surfaces only when coach is eligible (active for 6+ months, payment history clean, revenue >$2K/month).
- Pre-approved offer shown like Shopify Capital model: "You're pre-approved for up to $X based on your TGP history. Tap to learn more."

### 4.2 Loan terms (v1 defaults)
- **Min/max:** $500 to $25,000.
- **Interest rate:** 3%/month (36% APR equivalent). Commercial rate only.
- **Term:** 3, 6, or 12 months.
- **Repayment:** auto-debit from incoming SC revenue. Repayment rate: 10-25% of each sale until loan paid.
- **Origination fee:** 2-3% of loan amount, deducted at issuance.
- **No prepayment penalty.**

### 4.3 Underwriting model
Inputs (all already in TGP data):
- Monthly recurring revenue (MRR) and trend.
- Payment health (failed payments, dunning events).
- Active client count + retention rate.
- HC obligation track record (does this SC pay HC reliably?).
- Time on platform.
- Behavioral profile (A20) — reliability indicators.

Output: pre-approved amount + rate adjustment per risk tier.

### 4.4 Repayment surface
- "You owe $X. At current sales pace, you'll be paid off on [date]."
- Daily auto-debit ledger visible in Wallet.
- Option to make manual extra payments.
- If sales drop below threshold, auto-pause repayment for 14 days (one-time, with notification).

### 4.5 Default handling
- Day 0 (missed minimum auto-debit threshold): friendly notification.
- Day 7: formal delinquency notice; reserve gating engages (no outbound payouts beyond essentials).
- Day 30: cross-default flag set; future TGP transactions limited.
- Day 60: full TGP payout freeze; collections process begins per partner lender or direct.
- Day 90: write-off; legal recovery pursued for loans >$5K.

---

## 5. Dependencies

- **A13 in production.** Borrow Cash rides A13 Wallet rails entirely.
- **A22 cash flow forecast.** Forecast model = underwriting input.
- **A20 behavioral profile.** Reliability signal for underwriting.
- **ZION data capture live.** All underwriting signals require longitudinal data.
- **Legal counsel engaged.** Commercial lending counsel + state-by-state regulatory mapping. **This is the gating dependency.**
- **Partner lender selected** (Option C path) — Lendio, Pipe, Capchase, or equivalent.

---

## 6. Est. Operators

- **v1 (partner-lender model):** 12-18 operators for the TGP-side product (offer surface, repayment auto-debit, reserve gating, default handling, partner-lender API integration).
- **v2 (direct issuance):** additional 25-40 operators (loan origination flow, state-by-state compliance modules, collections workflow, regulatory reporting).

**v1 is the right scope for 2026.** v2 only triggers if v1 validates demand + clean default performance.

---

## 7. Open Owner Questions

1. **Partner vs direct (Option A/B/C):** confirm Option C (hybrid) recommendation.
2. **Final naming:** "Borrow Cash" / "TGP Cash" / "TGP Capital" / "Coach Capital" / other?
3. **Eligibility threshold:** confirm "active 6+ months, clean payment history, MRR >$2K" as the eligibility cut, or tune.
4. **Max loan size v1:** $25K cap appropriate, or lower for v1 (e.g., $10K) to limit downside while learning?
5. **Repayment rate cap:** repayment can siphon up to 25% of incoming sales — too aggressive? Shopify Capital uses 10-17% of sales as repayment rate. Recommend cap at 20% for v1.

---

## 8. Strategic Note

If TGP becomes the operating account + payments + lending product for coaches, **the switching cost for any individual coach approaches infinity.** Competitors selling pure coaching CRMs cannot dislodge a coach whose business operates on TGP Wallet, who has an outstanding TGP loan, whose revenue auto-flows through TGP rails.

This is the long-term moat. Borrow Cash isn't just a revenue line — it's the bonding agent that locks coaches to the platform.

**Build it carefully. The legal pathway determines the timeline.**

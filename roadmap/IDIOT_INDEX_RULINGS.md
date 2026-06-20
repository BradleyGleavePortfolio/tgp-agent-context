# Idiot-Index & Think-In-Limits Rulings

**Source:** Musk-framework audit of TGP run 2026-06-19.
**Status:** Owner-ruled; ready for operator action. Items marked **VERIFY-NEEDED** require operator to confirm current build state before scoping additional work.
**Companion files:**
- `ZION_DATA_CAPTURE_CHECKLIST.md` — data capture strategy
- `NEW_A_ITEMS_BACKLOG.md` — A14-A22 new features surfaced by this audit
- `STAGE_4_ARCHITECTURE_PASS.md` — gym-as-config-layer architecture audit (scheduled)
- `TGP_WALLET_BORROW_CASH.md` — small-loans surface inside TGP Wallet

---

## 1. Frameworks Applied

- **Idiot Index** = `cost of finished part / cost of raw materials`. If high, we're being stupid somewhere.
- **Think in Limits** = work backwards from what's actually possible (physics, information theory, network effects, attention), not forwards from current implementation.

---

## 2. Surface-by-Surface Rulings

### 2.1 AI-drafts-response-coach-approves
- **Audit finding:** Massive idiot index — coaches spend hours typing what AI can draft in milliseconds.
- **Owner ruling:** "Already exists" — **VERIFY-NEEDED.**
- **Operator task:** Confirm current state of AI-drafted client responses. Document where it lives, what quality bar it hits, what gaps remain. Likely candidate to upgrade if half-built.

### 2.2 AI program generation from structured intake
- **Audit finding:** 30-60x productivity unlock if coaches go from 30-90 minute manual program build to 90-second review-and-edit.
- **Owner ruling:** "Already exists" — **VERIFY-NEEDED.**
- **Operator task:** Confirm AI program generation is wired to intake data (A2 imports + onboarding intake). Verify it covers strength + conditioning + nutrition program archetypes. Document gaps.

### 2.3 Client onboarding floor
- **Audit finding:** Client should sign up → AI-guided intake → auto-generated starter program → payment configured → first workout, all in <10 minutes with zero coach involvement.
- **Owner ruling:** Auto-assignment flow is right for **non-PT clients, general users, and gym members.** For PT clients, the question "which package would you like to buy from your coach?" must be in the flow before program assignment.
- **Locked design:**
  - **PT client flow:** signup → coach-pricing/package selection → payment → AI intake → AI-generated starter program → coach review queued asynchronously.
  - **Non-PT / general user / gym member flow:** signup → AI intake → AI auto-assigns starter program → optional package upsell later → workout.
- **Operator task:** Spec this two-track onboarding flow. Likely lives between A2 (import tooling) and A8 (lead funnel).

### 2.4 Crowdsourced exercise demo library
- **Audit finding:** Industry duplicates the same 500 exercises millions of times. Crowdsourced library with revenue share solves it.
- **Owner ruling:** Good idea, but two blockers — **how do we pay them, and how do we track usage?**
- **Locked answers:**
  - **Payment rail:** Use the existing A13 TGP Wallet infrastructure. Royalty earnings accrue to coach's TGP balance, withdrawable via the standard outbound rails (RTP/FedNow or ACH).
  - **Usage tracking:** Per-exercise demo gets a unique `exercise_demo_id`. Every program assignment that includes that demo, every client view in-app, and every "use this demo" import by another coach fires an `ai_actions` event (per ZION schema). Royalty calc is a nightly cron job that sums events × per-event royalty rate × distributes to creator's balance.
  - **Royalty rate (v1 default):** $0.01 per client view of a demo when used in another coach's program. Tunable per category. Floor pays out monthly with a $5 minimum to keep accounting clean.
- **Operator task:** Spec as A19 in the new-A-items backlog.

### 2.5 Payment processor margin
- **Audit finding:** TGP should bury the processor cut inside a transparent platform fee.
- **Owner ruling:** Actual plan is **5% all-in coach-facing fee** with **~2% TGP profit** as core revenue model. At ~10 PTs or ~2 gyms of volume, **switch processors from Stripe to Adyen** to reduce processor cost from 2.9% → 1.6%, lowering total coach burden to **3.6%** while keeping TGP margin intact.
- **Locked design:**
  - **Stage 1 (now):** Stripe at 2.9%, coach charged 5%, TGP keeps ~2%.
  - **Stage 2 (trigger: ~10 active PTs OR ~2 gym tenants OR $1M+ ARR processed):** migrate to Adyen at 1.6%. Coach fee drops to 3.6% all-in. TGP keeps ~2%.
  - **Trigger condition:** Adyen requires $1M+ ARR processed to onboard. Reaching that volume IS the migration trigger.
- **Operator task:** A13 spec should leave a `payment_processor` enum field (`stripe | adyen`) at the Connect-account level. Architecture decision: build the processor abstraction layer now so the Stage 2 swap is a config flip, not a rewrite. **This is an A13a scope addition.**

### 2.6 Coach onboarding (A2) — full migration flow
- **Audit finding:** Coach should sign into Trainerize/Everfit/MyPTHub via OAuth or paste credentials with consent, TGP pulls everything via API or headless automation in <10 minutes.
- **Owner ruling:** "Love your idea, lets run with this WAYY better flow."
- **Locked design:**
  - **Tier 1: OAuth/API** where the source app supports it. Trainerize has a partner API; Everfit has limited API; MyPTHub minimal.
  - **Tier 2: Credentialed headless automation** where Tier 1 isn't available. Coach pastes login with consent, TGP runs headless session, pulls programs / clients / billing / cards.
  - **Tier 3: File upload fallback** (current export-and-upload model) for sources with neither.
  - **All tiers feed the same internal import pipeline** so coach experience is uniform regardless of source.
- **Operator task:** A2 spec rewrite. Likely **15-22 operators total** (up from earlier 8-12 estimate) because of headless automation complexity. Worth it — this is the #1 acquisition unlock for coaches with years of existing data.

### 2.7 Voice-first coaching
- **Audit finding:** Coach speaks 30 seconds, AI transcribes intent, drafts personalized messages to N clients, coach one-taps to send. Defining differentiator opportunity.
- **Owner ruling:** "LOVE IT. Needs careful planning on implementation."
- **Locked design considerations:**
  - **Privacy:** voice transcription happens server-side; transcripts logged to `ai_actions` table for audit (per ZION).
  - **Targeting:** voice command names target group (e.g. "everyone who missed Monday's workout") rather than individual client picking, which is the time-savings unlock.
  - **Personalization:** AI rewrites the same core message in each client's preferred voice (per behavioral personalization profile, A20).
  - **Approval surface:** scrollable card stack of N drafted messages, one-tap-send or one-tap-edit per card. Bulk approve all if coach trusts the output.
  - **Latency budget:** <5 seconds from voice-end to first draft visible. Otherwise UX dies.
- **Operator task:** Spec as A17 in new-A-items backlog. Estimated 10-15 operators. **Careful planning** flag honored — needs design pass before operator dispatch.

### 2.8 Small loans / Borrow Cash inside TGP Wallet
- **Audit finding:** Predictive cash flow + TGP holding float = natural lending product.
- **Owner ruling:** "Gold idea. 100 coaches × $5k loan × 3% monthly × 10% default = profits basically."
- **Math sanity check (back-of-envelope):**
  - 100 coaches × $5,000 average loan = $500,000 deployed capital.
  - 3% monthly interest = $15,000/month gross interest = $180,000/year.
  - 10% default rate × $500K = $50,000 written off per year.
  - Net: ~$130,000/year on $500K capital = ~26% net yield.
  - **Sensitivity:** at 20% default rate, net drops to $80K/year = 16% yield. Still profitable but tighter.
- **Locked design and concerns:** see `TGP_WALLET_BORROW_CASH.md`. Legal enforcement is the hard part — covered in detail there.

### 2.9 Wearable auto-logging (A6 extension)
- **Audit finding:** A6 + ML to detect exercises and auto-log sets/reps from accelerometer data.
- **Owner ruling:** "Only works if they have a wearable on and synced."
- **Locked stance:** Real constraint. Auto-logging is an **opt-in enhancement layer** on top of A6, not a replacement for manual logging. Manual logging stays the default; auto-logging is the magic-moment for wearable-equipped clients.
- **Operator task:** Spec as A18 in new-A-items backlog, marked as **post-A6 enhancement** rather than core A6 scope.

### 2.10 Behavioral personalization engine
- **Audit finding:** Personalized behavioral psychology = the single biggest LTV lever in fitness coaching.
- **Owner ruling:** "Genius. We need harder data collection parameters for this — getting every piece of data we can onto TGP database." This is one of the **biggest must-dos of 2026.**
- **Locked design:** Behavioral personalization requires the full data capture buildout — see `ZION_DATA_CAPTURE_CHECKLIST.md`. The personalization engine itself (A20) is a downstream feature; data capture is the unblocker.
- **Operator priority:** Data capture buildout = top-3 priority for 2026. A20 personalization engine follows once data exists.

### 2.11 Multi-layer franchise hierarchy
- **Audit finding:** HC → SC → JC → Client. Each layer configurable cut. "Org chart as a service" for coaching industry.
- **Owner ruling:** "ABSOLUTELY the right way to think."
- **Locked design:** A4 (team QA) and A13 (money flow) must both spec for **arbitrary depth from day one**, not 2-level hardcode.
  - `MoneyFlowRule` table: rules apply between any two tiers in the hierarchy, not just HC↔SC.
  - `team_hierarchy` table: self-referential, supports unbounded depth.
  - Permissions cascade: parent has full visibility into descendants, descendants have zero upward visibility.
- **Operator task:** A4 and A13 spec updates. A4 likely re-scoped from ~5 operators to 10-15 for true N-level. A13 picks up small additional scope for routing money through multiple intermediate tiers.

### 2.12 Stage 4 gym vertical — config layer vs parallel app
- **Audit finding:** Gym = coach with location-based memberships, scheduled classes, front-desk operations. Most data model already exists. Could be 30-50% the cost of the 140-220 operator estimate if architected as config layer.
- **Owner ruling:** "Well, let's actually schedule that passover."
- **Operator task:** See `STAGE_4_ARCHITECTURE_PASS.md`. Architecture audit scheduled before Stage 4 chapter scoping begins.

### 2.13 Predictive churn intervention
- **Audit finding:** ML watches all signals, fires intervention before churn hits. Upstream of A3 dunning.
- **Owner ruling:** Implicitly approved via "all this health data is MASSIVE for future training" comment.
- **Operator task:** Spec as A16. Depends on ZION data capture being live (so model has training data).

### 2.14 Negative-space cuts (do less)
- **Owner ruling implicit; flagging here for confirmation:**
  - **Dedicated nutrition tracking:** integrate with MyFitnessPal/Cronometer/Apple Health, don't build from scratch. **CONFIRM/REJECT.**
  - **Form analysis video (F1):** already killed.
  - **Deep messaging features (threads, reactions, gallery):** build minimum viable messenger; route complexity to AI summarization + drafting. **CONFIRM/REJECT.**
  - **Stage 4 from scratch:** rejected in favor of config-layer audit.

---

## 3. Two Highest-Leverage Bets

Per the audit, biggest impact per operator-hour:

1. **AI Program Generation (A14)** — VERIFY-NEEDED. If half-built, finish it. If solid, document and move on. 20-30 operators if greenfield.
2. **AI Response Drafting (A15)** — VERIFY-NEEDED. Same logic. 8-12 operators if greenfield.

Combined: 28-42 operators for a potential 5-10x change in coach productivity. Same investment as A13 v2, arguably bigger upside.

---

## 4. Open Questions for Owner

1. **Negative-space confirms:** confirm/reject the cuts in §2.14 above.
2. **Voice-first scope split:** A17 as one big feature, or split into A17a (transcription + targeting) and A17b (per-client personalization)?
3. **Crowdsourced demo royalty rate:** $0.01/view default — confirm or tune.
4. **Stage 2 processor migration trigger:** confirm $1M ARR processed as the trigger (Adyen's minimum), OR set TGP-internal trigger lower (e.g. $500K ARR) to start migration prep early.
5. **A4 N-level depth limit:** unbounded, or cap at 4 levels (HC/SC/JC/Client) for v1 sanity?

---

## 5. Operator Dispatch Notes

When this doc gets picked up:
- Start by completing the **VERIFY-NEEDED audits** (§2.1, §2.2). These answer "what new work is actually new vs polish on existing."
- Spec stubs for A14-A22 go in `roadmap/specs/`.
- All new A-items must respect doctrine invariants (RLS tiers, idempotency, audit events, dispute traceability).
- Cross-reference `ZION_DATA_CAPTURE_CHECKLIST.md` — most new features need new tables/events landed first.

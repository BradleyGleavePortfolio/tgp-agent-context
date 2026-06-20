# New A-Items Backlog (A14–A22)

**Source:** Musk-framework audit 2026-06-19.
**Status:** Owner-approved direction; stubs pending operator spec passes.
**Cross-refs:** `IDIOT_INDEX_RULINGS.md` for design rationale; `ZION_DATA_CAPTURE_CHECKLIST.md` for data dependencies.

---

## Backlog Summary

| Item | Title | Status | Est. Operators | Depends On |
|---|---|---|---|---|
| **A14** | AI Program Generation | **VERIFY-NEEDED** (owner: "already exists") | 20-30 if greenfield, 5-10 if polish | A2 imports, ZION data capture |
| **A15** | AI Response Drafting | **VERIFY-NEEDED** (owner: "already exists") | 8-12 if greenfield, 3-5 if polish | A11, ZION |
| **A16** | Predictive Churn Intervention | New | 15-20 | ZION, A3 |
| **A17** | Voice-First Coaching | New | 10-15 | A15, A20 |
| **A18** | Wearable Auto-Logging | New, post-A6 | 20-30 | A6 mature |
| **A19** | Crowdsourced Exercise Library | New | 12-18 | A13 wallet rails |
| **A20** | Behavioral Personalization Engine | New | 25-35 | ZION fully live |
| **A21** | Payment Fee Margin Layer | Added to A13a | 3-5 | A13 in flight |
| **A22** | TGP Cash Flow Forecast | Post-A13 | 15-20 | A13 in production |

**Total new operator scope (max): ~128-180 operators** added on top of existing A1-A13 roadmap.

---

## A14 — AI Program Generation

**Status:** **VERIFY-NEEDED.** Owner indicated "already exists" — operator must audit current state vs the GOAL below before scoping.

**Cross-ref:** Full GOAL state defined in `IDIOT_INDEX_RULINGS.md` §2.2.1–2.2.5. Summary below.

### GOAL state (locked target)

Single textbox with a mic icon. Coach either:
- **Types** ~90 seconds of plain-language brief, OR
- **Speaks** 30-60 seconds aloud. Audio is processed **speech-native** (audio → multi-modal model directly), NOT speech-to-text. Tone, emphasis, pauses preserved as signal.

Either mode → AI builds the full program **live/streaming** — program renders block by block as it generates, not after a delay. Surfaces with a **plain-language thesis** above the program explaining design choices.

Total time from input to coach-approved program: **<2 minutes.**

### Why speech-native matters
- Tone carries urgency/concern ("cranky knee" said worried → more cautious programming).
- Emphasis reveals priority ("she *really* wants strength" ≠ "she wants strength").
- Disfluency is information (hesitation on session length → flexible duration).
- Coach's natural framing becomes the AI's thesis language.

### Architecture requirements
- Multi-modal model with native audio input (GPT-4o-class, Gemini native audio, Claude with audio). **Whisper → text → LLM pipeline is explicitly rejected.**
- Streaming generation: program builds visibly token-by-token / block-by-block.
- Thesis is mandatory output.
- Audio + transcript + final program logged to `ai_actions` (ZION).
- Latency budget: thesis visible <3 sec post input-end. Full program <30 sec.

### Audit checklist for operator (measures distance from GOAL)
- [ ] Single-textbox plain-language brief input exists? (y/n)
- [ ] Microphone in same input element? (y/n)
- [ ] Voice path is **speech-native** or speech-to-text? **(document precisely)**
- [ ] Program renders **live/streaming**, or single-shot after delay?
- [ ] Every generated program ships with a thesis?
- [ ] End-to-end latency: input-end → thesis-visible, input-end → program-complete — actual numbers?
- [ ] Coach approval/edit/regenerate workflow exists? Quality?
- [ ] Current model: multi-modal? Audio-native?
- [ ] Audio + transcript + program logged to `ai_actions`?
- [ ] Coach decisions (approve/edit/reject) captured for training?
- [ ] Inputs include: A2-imported history, prior adherence, wearable recovery, A20 behavioral profile?

**Audit operator's job: measure distance from GOAL, not confirm "is anything there." Gap to GOAL is the actual A14 work even if generation exists today.**

**Operator estimate:**
- If GOAL fully met: document, close.
- If text-only single-textbox + streaming + thesis but no speech-native: ~8-12 operators to add audio-native input + retraining loop.
- If basic generation but multi-step form / no thesis / no streaming: ~15-22 operators.
- If missing entirely: 20-30 operators.

**Why this matters:** Single biggest coach time-saver in TGP. 30-90 minute manual program build → <2-minute speech-to-approved-program. Idiot index drops from ~30-60x to ~1.5x.

**Doctrine flags:**
- AI prompts + audio + retrieved context + final program output all logged to `ai_actions` (ZION).
- Coach approval/edit/reject event captured for training feedback loop.
- Program version history mandatory (`program_versions` table).
- Audio retention: configurable, default 90 days. Transcript + final program retained indefinitely for training corpus.

---

## A15 — AI Response Drafting

**Status:** **VERIFY-NEEDED.** Owner indicated "already exists" — operator must audit current state.

**Audit checklist for operator:**
- [ ] Does TGP currently AI-draft client message responses?
- [ ] Does it draft in coach's individual voice/tone?
- [ ] Surface: inline in inbox, separate review queue, or both?
- [ ] One-tap-send UX implemented?
- [ ] Bulk draft for "N clients who all need similar response" supported?
- [ ] Quality data — does coach approve >50% as-is, or always edit?

**If solid:** document and close. **If half-built:** finish pass. **If missing:** spec, 8-12 operators.

**Why this matters:** Coaches spend 5-15 min/client/week on check-ins. 50 clients × 10 min = 8.3 hours/week of typing. AI-drafted + one-tap-approve = 15 min/week. 30x time saver.

**Doctrine flags:**
- Every draft, every edit, every send logged to `ai_actions`.
- Coach edits become training signal for that coach's voice.
- Drafts never auto-send without explicit coach action.

---

## A16 — Predictive Churn Intervention

**Status:** New.

**Scope:**
- ML model trained on TGP churn data (login frequency, workout completion, check-in tone, payment health, wearable signals).
- Inference daily per active client.
- When `P(churn within 30 days) > 60%`, automated personalized intervention fires.
- Coach notified after the intervention, not before (preventing coach paralysis on every signal).
- Intervention channels: in-app, push, email, SMS — escalating per A3 dunning ladder.

**Differentiation from A3:**
- A3 = dunning for billing failures (reactive on payment events).
- A16 = upstream behavioral intervention before billing fails (predictive on adherence signals).

**Dependencies:**
- ZION data capture must be live (no training data without it).
- A3 infrastructure provides the delivery rails.
- A20 behavioral profiles improve intervention personalization.

**Est. operators:** 15-20.

**Doctrine flags:**
- Model decisions logged to `intervention_events`.
- Outcome (did client re-engage? churn anyway?) captured for model retraining.
- Coach can override / silence interventions per client.

---

## A17 — Voice-First Coaching

**Status:** New. Owner: "LOVE IT. Needs careful planning on implementation."

**Scope (locked rulings from IDIOT_INDEX_RULINGS §2.7):**
- Coach speaks 30 seconds into phone, audio transcribed server-side.
- AI parses **intent + target group** (e.g., "everyone who missed Monday's workout").
- AI drafts personalized message per target client, in coach's voice (per A20 voice profile).
- Scrollable card stack UI: per-message preview, one-tap-send or one-tap-edit.
- Bulk approve option for trusted-output coaches.
- Latency budget: <5 seconds from voice-end to first draft visible.

**Privacy:**
- Audio transcripts logged to `ai_actions` for audit.
- Transcripts deleted after N days (default 90, configurable).
- No third-party voice processors; use Whisper-class on-platform models or enterprise-grade STT.

**Why this matters:** Defining differentiator. No coaching app does this. Voice-first is the floor for coach interaction at scale.

**Est. operators:** 10-15.

**Open owner question:** split into A17a (transcription + targeting + draft) and A17b (per-client personalization layer)? Recommendation: single PR; the per-client layer is what makes voice-first valuable.

---

## A18 — Wearable Auto-Logging

**Status:** New, post-A6.

**Owner ruling acknowledged:** "Only works if they have a wearable on and synced."

**Scope:**
- ML model detects exercise type from accelerometer data (push, pull, squat patterns).
- Auto-logs set + estimated reps.
- Weight estimation: hybrid — client confirms weight at start of set, ML counts reps automatically.
- **Opt-in enhancement layer** on top of A6, not replacement for manual logging.
- Manual logging stays the default; auto-logging is the magic moment for wearable-equipped clients.

**Dependencies:**
- A6 must be fully shipped and stable (cross-provider unification, inference layer).
- Apple Watch SDK + Whoop + Garmin accelerometer access.

**Est. operators:** 20-30.

**Doctrine flags:**
- Auto-logged reps marked as `auto_logged: true` in `workout_logs` for distinction from manual entry.
- Confidence score per detection stored for future model retraining.

---

## A19 — Crowdsourced Exercise Library

**Status:** New. Owner approved with the blockers: "How do I pay them, how do I track usage?"

**Locked design (from IDIOT_INDEX_RULINGS §2.4):**

### Payment rail
- Royalties accrue to coach's **TGP Wallet balance** via existing A13 infrastructure.
- Withdrawable via standard outbound rails (RTP/FedNow or ACH).
- No separate payment integration needed.

### Usage tracking
- Each demo has unique `exercise_demo_id`.
- Events captured in `demo_usage_events` (per ZION):
  - Program assignment that includes the demo (`assigned_event`).
  - In-app client view (`viewed_event`).
  - Import by another coach into their own library (`imported_event`).
- Nightly cron sums events × per-event royalty rate × distributes to creator's balance.

### Royalty rate (v1 default)
- **$0.01 per client view** when used in another coach's program.
- Tunable per category (e.g., novel/specialty demos worth more).
- Monthly payout with $5 minimum to keep accounting clean.

### Library moderation
- Demos enter "pending review" on upload.
- Auto-checks: video quality, exercise classification, no copyright issues.
- TGP-flagged for manual review if auto-checks fail.
- Approved demos enter the searchable global library.

**Est. operators:** 12-18.

**Open owner question:** royalty rate $0.01/view — confirm or tune?

**Strategic note:** Even if royalty volume stays small initially, the **data asset** is huge — exercise demos with movement classifications become training data for A18 wearable auto-logging.

---

## A20 — Behavioral Personalization Engine

**Status:** New. Owner: "Genius. We need harder data collection parameters for this."

**This is the single biggest LTV lever in coaching software.** No competitor does this.

**Scope:**
- Per-client behavioral profile built from:
  - Onboarding intake (psychological style questions)
  - Check-in tone analysis (A11 + LLM sentiment over time)
  - Response-to-intervention history (what nudge styles worked, what didn't)
  - Engagement patterns (when they log in, how they respond to streaks)
- Intervention library:
  - Gentle nudge
  - Drill-sergeant push
  - Social comparison ("X% of other clients hit their goal this week")
  - Monetary loss aversion ("you've earned $42 in unused training value")
  - Identity reinforcement ("you're the kind of person who shows up")
- Engine matches intervention to profile at intervention-trigger time (driven by A16).

**Dependencies:**
- ZION data capture fully live (no profile without longitudinal data).
- A11 check-in summaries running (provides tone signal).
- A16 churn prediction provides trigger.

**Est. operators:** 25-35.

**Strategic note:** This is the moat. Once TGP knows each client's psychological profile better than the coach does, switching costs become enormous. Long-tail differentiator that compounds with every check-in.

**Doctrine flags:**
- Behavioral profile = TIER 1 privacy (most sensitive client data).
- Coach has read access; client has read+delete access; TGP-internal access tightly audited.
- Profile contributions traceable per signal (which check-in led to which profile update).

---

## A21 — Payment Fee Margin Layer

**Status:** Added to A13a scope per IDIOT_INDEX_RULINGS §2.5.

**Locked design:**
- Coach-facing fee: **5% all-in** in Stage 1 (Stripe at 2.9%, TGP keeps ~2%).
- Trigger condition: **$1M+ ARR processed** OR ~10 active PTs OR ~2 gym tenants.
- Stage 2: migrate to Adyen at 1.6%. Coach fee drops to 3.6% all-in. TGP keeps ~2%.
- Architecture: `payment_processor` enum field (`stripe | adyen`) at Connect-account level. Build abstraction now so Stage 2 is a config flip, not a rewrite.

**Est. operators:** 3-5 added to A13a.

**Open owner question:** Stage 2 trigger — $1M ARR (Adyen minimum) or earlier (~$500K) to start migration prep?

---

## A22 — TGP Cash Flow Forecast

**Status:** Post-A13. Becomes the daily-engagement hook for the money surface.

**Scope:**
- Predictive cash flow management for SCs.
- Forecasts revenue 30 / 60 / 90 days out using:
  - Historical sales velocity
  - Active subscription book
  - Seasonal patterns
  - Outstanding obligations (HC cuts, expected refunds)
- Surfaces:
  - "Based on current pace, you'll have $X spendable on [date]"
  - "Your HC obligation is $Y in N days — you're tracking to be $Z over/under"
  - "Suggested rule adjustment: lower your flat owed to HC for next cycle, sales are slow"
- Could enable future bridge-loan products (see `TGP_WALLET_BORROW_CASH.md`).

**Dependencies:**
- A13 in production with sufficient money-flow event history (~3 months minimum).
- ZION data capture live.

**Est. operators:** 15-20.

---

## Cross-Cutting Themes

### Theme 1: Most A14-A22 items depend on ZION
A20, A16, A14, A15, A22 all require longitudinal event data to be valuable. **ZION data capture must be prioritized as a foundation layer** — sequencing matters.

### Theme 2: A13 is the financial backbone
A19 royalties, A22 forecasting, future lending products all ride A13's TGP Wallet + ledger + rails. Building A13 well unlocks everything downstream.

### Theme 3: AI-driven coach productivity is the killer category
A14 + A15 + A17 + A20 collectively = "coach productivity stack." This is the category TGP can own. No competitor has the full stack.

### Theme 4: Verification before greenfield work
A14 and A15 are flagged VERIFY-NEEDED. Before any operator scopes new work on these, current build state must be audited. Could save 30+ operators of redundant work.

---

## Recommended Sequencing (rough order)

1. **ZION data capture PR1-2** (event scaffolding + identity expansion) — unblocks everything.
2. **A13a + A21** (card-only money flow with margin layer) — financial foundation.
3. **A14 + A15 verification audits** — close the "do we have this?" question.
4. **A2 rewrite** (per IDIOT_INDEX_RULINGS §2.6, OAuth/API/headless tiers) — coach acquisition unlock.
5. **A13b** (ACH + fast rails).
6. **A16** (predictive churn) — depends on ZION live.
7. **A11 + A20** (behavioral personalization buildout).
8. **A17** (voice-first coaching).
9. **A19** (crowdsourced demos).
10. **A18** (wearable auto-logging, post-A6 mature).
11. **A22** (cash flow forecast).
12. **STAGE_4_ARCHITECTURE_PASS** before Stage 4 chapter scoping.

---

## Operator Dispatch Notes

- Every new A-item gets a spec stub in `roadmap/specs/AXX-name.md` before operator dispatch.
- Stubs follow the existing A01-A13 spec stub format.
- VERIFY-NEEDED items get an **audit-first** dispatch — operator runs the audit, reports findings, owner rules on next steps before further work.
- Every A-item respects doctrine invariants. Every new table goes through RLS-tier assignment.

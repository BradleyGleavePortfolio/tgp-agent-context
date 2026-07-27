# A2 · Migration / import tooling

**Status:** SUBSTRATE BUILT — DARK / DEFAULT-OFF, UNPROVEN ON LIVE ACCOUNTS (newest-wins, Op 73 · 2026-07-22) *(was: NOT STARTED (ZERO))*
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A2
**Tier/lane:** Tier 4 / T4.A2 (first Tier 4 lane)
**Rank rationale:** Operator: "extremely important, #1 after TM and prior in-flight work is done." Master Plan flags as App Store launch-gate prerequisite ("REQUIRED before marketing").

---

> **NEWEST-WINS SUPERSEDE (2026-07-22, Op 73 reconciliation — this block overrides the older `NOT STARTED (ZERO)` framing above/below on conflict; historical prose retained, not rewritten).**
> The `NOT STARTED (ZERO)` / "State of build: ZERO" claim is **STALE and superseded by newest evidence** from the importer wave (see `handoffs/importer-wave/current-state.json` and `handoffs/importer-wave/R3_MERGE_RUNBOOK.md`). Production truth:
> - The **importer "coach-is-the-key" bridge substrate exists across backend, extension, and mobile** — pairing/intent plumbing, the site-agnostic adapter surface, and a landed R3-CLEAN backend product path (IMPORTER-F, backend `main` `1e6b3bf`). This is **not** zero.
> - **V5 multi-adapter fixture proof is complete** (adapter normalization proven against fixtures, not live accounts).
> - The entire pipeline is **fully dark / default-OFF**: no live flag flip has occurred, and no live-account import has run end-to-end.
> - **Real-account TrueCoach full-loop is UNPROVEN** (fixture-level only); **multi-site autonomy is LOW** (site-agnostic in design; not demonstrated across live sites).
> **No completion/launch claim is made.** What remains is live-account proof + operator-gated flag enablement, not greenfield build. See `DECISION_LOG.md` (Op-73, 2026-07-22 · NEWEST-WINS RECONCILIATION) for the authoritative supersession map, and the C1/M5 slice authorization for the role-gated onboarding follow-on.

> **NEWEST-WINS SUPERSEDE (2026-07-27, Op 74 — this block overrides BOTH the older framing and the Op-73 block above on the two points below; all historical prose is retained, not rewritten, per R5/R132).**
> Governing rulings: [`R-IMPORTER-AUTONOMY-1`](../rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md) and [`R-DUNNING-BAR-1`](../rulings/R-DUNNING-BAR-1_2026-07-27.md). Baseline: [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json).
>
> **1. The one-site v0.3 ceiling is SUPERSEDED as a ceiling.** The core product bar is now **autonomous, site-agnostic, browser-agnostic importing** — a coach points TGP at any source they are authorized to access, and TGP autonomously acquires and deterministically reconstructs it, regardless of site or browser host. v0.3 (one adapter, one host) remains valid and unrewritten as **the milestone it actually was** — the first end-to-end validation of the generic pipeline — and may **never** be cited to argue that multi-site or multi-browser support is out of scope or deferred by definition. Adding a site is **data/blueprint work with core diff == 0**, not a core code change. Every consent, security, audit, flag, rollback, and evidence gate is preserved unchanged; see R-IMPORTER-AUTONOMY-1 §"Gates preserved (non-negotiable)".
>
> **2. The "Billing migration" items below are STALE and are HEREBY STRUCK from importer scope.** Specifically, the *What to build* bullet **"Billing migration: detect imported clients with active subs → prompt coach to set up equivalent Stripe Connect plans"** and the acceptance criterion **"Billing migration creates Stripe Connect plans at parity with imported sub structure"** predate — and directly contradict — the operator's R5-protected verbatim billing-capture exclusion, recorded at Op 55 and binding on **both v0.3 and v1.0 importer capture**:
>
> > *"Hmm - ok then forget it - we just need to grab workout, client history, messaging, ect. and leave JUST billing info behind."*
> > *(Preserved byte-for-byte including the original spelling, per R5. Do NOT paraphrase or "correct" this quote.)*
>
> **The importer must never capture, stage, log, reconstruct, or claim completion for any billing data, from any source site, in any browser host.** Billing is accounted as an explicit `excluded` family with a reason — it is **not** a failure. Widening the site surface widens the exclusion with it. The two struck bullets remain visible above/below as historical record and are **NOT deleted**; they are simply **not buildable**, and any brief citing them is defective.
>
> **Not a contradiction with the dunning bar.** [`R-DUNNING-BAR-1`](../rulings/R-DUNNING-BAR-1_2026-07-27.md) raises the bar on TGP's **own** billing/entitlement state (see `A03-reengagement-dunning.md`). That is a different subject from source-site billing data and grants the importer **no** billing access whatsoever. Any doc that reads "we are building serious dunning" as "the importer may now touch billing" is wrong on its face.
>
> **No completion claim.** `truth_boundaries.no_e2e_proof_yet` still holds: V5 certified the **deterministic-fixture** path only; a certified real-account live full-loop run remains **DEFERRED and NOT claimed**. All importer flags remain **default-OFF**. Op 74 authorizes **no build, no landing, and no flag flip** — see [`OWNERSHIP_AND_PR_LADDER.md`](../../handoffs/op74/OWNERSHIP_AND_PR_LADDER.md).

## State of build

*(Historical framing below — superseded by the newest-wins block above: importer bridge substrate exists across backend/extension/mobile and V5 fixture proof is complete; the "ZERO" claim describes the ORIGINAL Trainerize-CSV/spreadsheet productization scope, which remains largely unbuilt, but the broader importer substrate is NOT zero.)*

~~ZERO.~~ No dedicated Trainerize/Everfit CSV importer, spreadsheet upload, or program-format converter has shipped **for the productization scope in "What to build" below**; the site-agnostic import bridge substrate (pairing/adapter/pipeline) exists but is dark/default-off (superseded Op 73).

## What to build

- Trainerize CSV/JSON importer with field mapping to TGP schema
- Spreadsheet importer (name, email, start date, program columns)
- Branded invite emails: "Your coach [Name] has moved to TGP. Download the app to continue."
- Program-format conversion: parse Trainerize program export → TGP `WorkoutProgram` + `WorkoutPlan` schema
- Billing migration: detect imported clients with active subs → prompt coach to set up equivalent Stripe Connect plans

## Acceptance criteria

- [ ] Trainerize CSV importer handles their 2026 export format; field-mapping UI confirmed
- [ ] Spreadsheet importer accepts arbitrary column orders via mapping UI
- [ ] Branded invite emails A/B-tested for open rate ≥40%
- [ ] Program format conversion preserves set/rep/RPE structure
- [ ] Billing migration creates Stripe Connect plans at parity with imported sub structure
- [ ] Idempotency: re-uploading same file produces no duplicates
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard (imports scoped to importing coach)
- **Idempotency:** **critical** — re-importing same file must be a no-op
- **Audit events:** every imported client = `AuditEvent` row
- **Voice/UI:** Maya voice on import status messaging

## Dependencies

- **Blocks:** nothing (entry lane); but A3–A13 benefit from real test data
- **Blocked by:** Tier 1 + Tier 2 + Tier 3 complete

## Operator decisions (locked)

> "extremely important, #1 after TM and prior in-flight work is done (infra and plumbing need done, too)."

## Open operator questions

- Fulfillment of branded invite emails: which transactional provider? (Resend, SendGrid, Postmark?)
- Trainerize export: is there a 2026 schema spec, or reverse-engineer from a real export?

## Previous-operator working notes

*First operator on this item appends here.*

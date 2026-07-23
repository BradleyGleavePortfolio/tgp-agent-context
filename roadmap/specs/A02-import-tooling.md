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

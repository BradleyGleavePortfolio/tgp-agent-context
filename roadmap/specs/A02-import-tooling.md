# A2 · Migration / import tooling

**Status:** NOT STARTED (ZERO)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A2
**Tier/lane:** Tier 4 / T4.A2 (first Tier 4 lane)
**Rank rationale:** Operator: "extremely important, #1 after TM and prior in-flight work is done." Master Plan flags as App Store launch-gate prerequisite ("REQUIRED before marketing").

---

## State of build

ZERO. No Trainerize/Everfit importer, no spreadsheet upload, no program-format converter.

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

# A1 · Roman P4 close-out

**Status:** IN FLIGHT (POST_H_LADDER Tier 1 lane T1.B)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A1
**Tier/lane:** Tier 1 / T1.B (NOT Tier 4 — A1 is the only A-item that lives in Tier 1)
**Rank rationale:** Operator: "before anything else, it's in our original plans for the next operator." Already on POST_H_LADDER Tier 1.

---

## State of build

Roman flagship voice/chat coach is PROD (`roman/`, `RomanSession`, `RomanMessage`, `RomanChatScreen`). The P4 close-out is the final transaction-correct plumbing pass.

Outstanding (per POST_H_LADDER §2.2):
- Backend N1 `recentPushes` pre-commit
- Mobile F1 MMKV gate

## What to build

Per [`plans/ROMAN_P4_OPTION_C_EXPLAINED.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/ROMAN_P4_OPTION_C_EXPLAINED.md). Close the two open items above to dual-CLEAN.

## Acceptance criteria

- [ ] Backend N1 `recentPushes` pre-commit landed and audited dual-CLEAN
- [ ] Mobile F1 MMKV gate landed and audited dual-CLEAN
- [ ] Both PRs merged
- [ ] `current-state.json` reflects `T1.B: complete`

## Doctrine flags

- **RLS tier:** standard (Roman messages are user-scoped)
- **Idempotency:** voice/chat operations must be retry-safe
- **Audit events:** Roman session events emitted
- **Voice/UI:** Roman voice (celebration register) is the literal product

## Dependencies

- **Blocks:** Tier 2+ unlocking (Tier 1 gate)
- **Blocked by:** nothing (in flight)

## Operator decisions (locked)

> "before anything else, it's in our original plans for the next operator."

## Previous-operator working notes

*First operator on this item appends here. Format: `YYYY-MM-DD operator##: <one paragraph of what you touched, hit, suggested>`.*

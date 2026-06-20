# A11 · AI check-in summaries (client-side)

**Status:** PARTIAL (substrate present, client-facing digest + classification outstanding)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A11
**Tier/lane:** Tier 4 / T4.A11
**Rank rationale:** Operator: "for clients, high" — client-side summary surface, not just coach-side digest.

---

## State of build

**PARTIAL.**

**What's built:**
- `CheckIn` model present
- `coach-check-ins.controller`, `client-check-ins.controller`
- `community/ai-triage/` (closest analogue — triages community messages with Claude)
- `CoachBriefService` (82KB, already reads check-in data for daily briefs)
- `HolisticInsightCache` + `holistic-insights.service`

## Operator scope clarification

"For clients, high" — **client-side summary surface, not just coach-side digest.** Client gets a weekly summary of their own check-ins: trends in mood/energy/soreness/sleep, weekly themes, "your coach noticed X."

## What to build

- Dedicated **client-facing weekly digest screen** showing trends in mood/energy/soreness/sleep + weekly themes
- **Per-check-in AI urgency classification** (1–5 score, surfaced in coach inbox A9)
- **Suggested-coach-reply panel** (coach-side, **editable, not auto-sent** — guardrail against AI-impersonating-coach)
- **Weekly-theme aggregation** across coach's whole roster (so coach sees "12 clients reported sleep issues this week")

## Acceptance criteria

- [ ] Client digest screen renders weekly summary every Monday
- [ ] Trend charts for mood / energy / soreness / sleep (4-week rolling)
- [ ] Per-check-in urgency score surfaced in A9 inbox
- [ ] Suggested-reply panel is always editable; **never auto-sends** (R1 anti-pattern guard)
- [ ] Roster-level weekly theme view ships for coach
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard
- **Idempotency:** weekly digest cron retry-safe
- **Audit events:** AI-suggested replies log `AiSuggestionEvent` (model + prompt + accepted/edited/rejected)
- **Voice/UI:** Maya voice on client digest (calm, supportive); Maya voice on suggested coach reply (coach-authored voice — match coach's tone)
- **AI cost gating:** **MUST** flow through Coach AI Budget (T3.B cap)
- **Critical guardrail:** suggested-reply panel never auto-sends. R1 anti-pattern violation otherwise.

## Dependencies

- **Blocks:** nothing further
- **Blocked by:** Tier 1–3 gates
- **Ties to:** C1 (smart check-in forms — when those ship, they become additional input streams)

## Operator decisions (locked)

> "AI check-in summaries - for clients, high"

## Open operator questions

- Tone of client digest: pure data ("you slept 6.2h avg") vs. coached ("your sleep was a bit low this week — try…")? Operator decides.

## Previous-operator working notes

*First operator on this item appends here.*

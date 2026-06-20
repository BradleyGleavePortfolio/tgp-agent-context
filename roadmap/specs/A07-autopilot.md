# A7 · Closed-loop adaptive autopilot

**Status:** PARTIAL (substrate present, auto-write loop unwritten)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A7
**Tier/lane:** Tier 4 / T4.A7
**Rank rationale:** Operator: "MOAT feature, so important."

---

## State of build

**PARTIAL** — substrate present, loop unwritten.

**What's built:**
- `WorkoutProgram` (template + cloned), `WorkoutPlan`, `WorkoutPlanRevision`, `WorkoutProgramRevision`, `ClientWorkoutAssignment`, `WorkoutPlanExercise`, `WorkoutBuilderIdempotencyKey`, `ExerciseSet.rpe`, `Intensity` enum
- AI write path: `AIDraft`, `AiActionDraft`, `PendingAiDraftsScreen`, `useCoachAckActions`
- `WeeklyInsightCron` (`src/ai/coach/weekly-insight.cron.ts`) generates per-client adjustment suggestions
- `CoachBriefService` (82KB) surfaces them

## What to build

- Rule+LLM layer that **automatically writes** the next-week program revision from trailing RPE + completion + wearable HRV
- Coach-approval queue with bulk approve / per-row override
- Per-coach model that learns coach philosophy over time (deferrable v2)

## Acceptance criteria

- [ ] Auto-write engine produces `WorkoutPlanRevision` rows nightly for active clients
- [ ] Coach-approval queue UI: bulk approve, per-row override, edit-and-approve
- [ ] Revisions are idempotent (re-running for same week + client = no-op)
- [ ] Cost per client per week stays within $0.X budget (operator decides exact figure on first dispatch)
- [ ] Per-coach learning: deferred to v2, but interface stub in place
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard
- **Idempotency:** **critical** — auto-write must not produce duplicate revisions on retry
- **Audit events:** every auto-written revision = `AuditEvent` with model + prompt + cost
- **Voice/UI:** Maya voice on approval queue
- **AI cost gating:** **MUST** flow through Coach AI Budget; land within T3.B cap ($40/3.125×/$125 per coach/month)

## Dependencies

- **Blocks:** nothing further (terminal autopilot leaf)
- **Blocked by:** **A6** (wearable shared `RecoverySignal` interface) — hard dependency. Plus Tier 1–3 gates.

## Operator decisions (locked)

> "MOAT feature, so important."

## Open operator questions

- Per-coach learning model: ship in v1 or defer to v2? (Currently slated for v2.)
- Budget per client per week for auto-write: operator to set after first cost-modeling pass.

## Previous-operator working notes

*First operator on this item appends here.*

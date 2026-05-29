# PR-11 BUILD BRIEF — on_completion / on_milestone trigger glue

**Repo:** growth-project-backend (NestJS). **Pillar 3. Type: BUILD.**
**Branch:** `pr11/trigger-glue` off latest default (will have PR-2/3/4/6/7/8/9/10).

## GOAL
PR-9 seeds `on_completion` and `on_milestone` ScheduledDrops with `fire_at = NULL` (pending-trigger) — PR-10's cron deliberately skips them. PR-11 wires the actual TRIGGERS: when a buyer COMPLETES the triggering asset (on_completion) or a named MILESTONE is emitted (on_milestone), flip the matching pending-trigger drop to due (set fire_at=now) so PR-10's cron delivers it next tick — OR materialise inline at the trigger if that's cleaner/consistent. Reuse the SAME materialisation + idempotency path.

## CONTEXT TO READ FIRST (authoritative)
- /home/user/workspace/specs/PR8_BRIEF.md — the cadence payload shapes: on_completion = `{ depends_on_content_id?: string }` (fires when buyer completes the triggering asset; if no depends_on, document the default — e.g. completion of the immediately-prior content in display_order); on_milestone = `{ milestone_key: string }` (fires on a named milestone emit).
- /home/user/workspace/specs/PR9_BUILD_REPORT.md — how drops are seeded (snapshot, fire_at NULL for these two) + the per-type idempotency keys you must reuse.
- /home/user/workspace/specs/PR10_BUILD_REPORT.md — how the cron picks up due drops + the resolver dispatch path + idempotency. PR-11 should make trigger drops become due so the SAME cron/dispatch delivers them, or call the SAME dispatch helper directly.
- /home/user/workspace/specs/PR7_BUILD_REPORT.md — resolver registry + at-least-once + materialised_ref IS NULL gate.
- PACKAGES_DRIP_FEED_MASTER_PLAN.md §1 + §3.

## FIND THE EXISTING COMPLETION / MILESTONE SIGNALS (do NOT invent new tracking)
- **on_completion:** Find how the app ALREADY records a client completing a workout / workout plan / meal plan (the existing completion events/tables — e.g. workout-session-complete, plan-complete, the same signal the app uses for progress). Hook into that existing completion path. When a buyer completes content X, look up that buyer's pending-trigger ScheduledDrops whose `depends_on_content_id` resolves to X (or, if depends_on omitted, the drop whose triggering asset = the just-completed asset per the documented default) and fire them.
- **on_milestone:** Find whether the app emits named milestones (streaks, goals, weight targets, program completion, etc.). If a milestone/event system exists, subscribe to it; when milestone `milestone_key` is emitted for a buyer, fire that buyer's pending-trigger drops with matching milestone_key. If NO milestone system exists yet, build the MINIMAL emit seam: a `MilestoneService.emit(clientId, milestoneKey)` that fan-out triggers can call, wired to at least one real existing milestone signal (e.g. program/package completion) so it's not dead code — and document which milestone_keys are currently emitted. Do NOT build a speculative milestone taxonomy; wire the ones that exist.

## TRIGGER -> FIRE
- On trigger, find the buyer's pending-trigger ScheduledDrops (status pending, fire_at NULL, materialised_ref NULL) matching the trigger, and either:
  (a) set fire_at=now() so PR-10's next cron tick delivers them (SIMPLER, preferred — reuses all of PR-10's dispatch/idempotency/alert/retry for free), OR
  (b) call PR-10's dispatch helper directly to deliver inline at the trigger.
  PREFER (a) unless inline is clearly better. Document the choice.
- Idempotent: the same completion/milestone firing twice must NOT deliver the drop twice (materialised_ref IS NULL gate + the trigger only flips fire_at on still-pending drops; PR-10's claim/idempotency handles the rest).
- A trigger that matches no pending drop is a no-op (common — most completions won't have a waiting drop).

## CRITICAL CORRECTNESS (50-Failures gate)
- Reuse existing completion/milestone signals — do NOT create a parallel tracking system.
- Idempotent triggers (double-emit -> single delivery; rely on materialised_ref + PR-10 claim + PR-9/PR-7 idempotency keys).
- Snapshot semantics preserved (the drop already snapshotted its content at purchase; the trigger just releases it).
- on_completion default (when depends_on_content_id omitted) DOCUMENTED + tested.
- Performance: the completion-path hook must be a cheap indexed lookup (buyer_id + trigger), not a full scan — confirm an index exists (the ScheduledDrop indexes from PR-3 should cover; add a narrow index only if measurably needed and additive).
- Do NOT change PR-9 inline path or PR-10 cron query (other than the trigger flipping fire_at).

## SCOPE GUARDRAILS
- Backend only. Trigger glue ONLY (completion hook + milestone emit/subscribe + flip-to-due).
- NO media upload (PR-12), NO mobile (PR-13), NO refund/cancel (PR-16), NO push-to-existing (PR-17). Do NOT add new client-facing completion UI (mobile is PR-13).

## VERIFICATION
1. nest build + tsc + eslint clean.
2. Tests:
   - Buyer completes the triggering asset -> matching on_completion pending-trigger drop gets fire_at=now (or delivered) and is then dispatched (via cron or inline) exactly once.
   - on_completion with explicit depends_on_content_id fires on THAT content's completion; with omitted depends_on fires per the documented default.
   - Milestone emit -> matching on_milestone drop fires; non-matching milestone_key is a no-op.
   - Double completion / double milestone emit -> delivered exactly once (idempotent).
   - Completion with no waiting drop -> no-op, no error.
   - Buyer A's completion does NOT fire buyer B's drops (scope).
3. Existing suite passes (3428+ / whatever PR-10 left).

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr11/trigger-glue`, PR against default, report PR URL.
- PR description: which existing completion + milestone signals you hooked, the trigger->fire mechanism (flip fire_at vs inline) + why, the on_completion default rule, idempotency, the milestone emit seam (if built) + which keys are live, test results.

## DELIVERABLE
Report: (a) PR URL, (b) which existing completion/milestone signals hooked, (c) trigger->fire mechanism + choice rationale, (d) on_completion default rule, (e) idempotency approach, (f) milestone keys currently live, (g) test results. Copy to /home/user/workspace/specs/PR11_BUILD_REPORT.md.

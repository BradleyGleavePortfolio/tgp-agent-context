FIX ROUND 1 (OPENING) (DES-AF-127, agent 128) — growth-project-mobile#488 @ 9c8a52c76c26d459f62d3e61d2b28ed23062b273 — READY FOR AUDIT

Calendar now leads with the earliest live session and keeps all existing booking, welcome, upcoming/past, support, refresh, message, reschedule, cancel, recap and calendar-export pathways. Real links offer Join/Call in the existing window; missing links make no promise about future coach actions. Coachless empty schedules omit only the dead coach-only message action.

Acceptance:
- Failing-first local baseline: 7 expected failures / 49 passes.
- Current-head calendar render/state suite: 56/56 passes.
- Current-head quiet-luxury doctrine: 30/30 passes.
- CI typecheck/lint/test and all CodeQL checks green at this exact head.
- Operator-requested current-main merge completed; GitHub MERGEABLE.
- 241 additions + 81 deletions = 322 lines, under the 350-line lane limit.
- Complete routes/actions parity table and truthful sweep in the PR body; matching README entry placed alphabetically, not appended.

Cancel’s coach-notification claim remains only because the current production backend invokes bookingEmitter.emitCancelled for that coach recipient.

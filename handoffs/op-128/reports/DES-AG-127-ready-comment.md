FIX ROUND 1 (OPENING) (DES-AG-127, agent 128) — growth-project-mobile#497 @ 2d01f74d7c9ee6798b6f28af48fe48fb75c081c6 — READY FOR AUDIT

- 171 additions + 55 deletions = 226 changed lines; only the two assigned screens and tests.
- CI typecheck/lint/tests and all CodeQL checks are green at this exact head. Main refreshed twice; the DES-AF import-only conflict was resolved by retaining both lanes' tests. GitHub reports `mergeable: true`, `mergeable_state: clean`.
- Quiet 44-point booking slot grid, forest selection, time-labelled primary, factual booking/welcome/link states, hairline upcoming rows, one forest Join and quieter move/cancel. No route, handler, API contract or existing fact removed.
- Coach-cancellation notification copy was verified against the production backend emitter and preserved. Cancellation errors now expose the existing actionable scheduling error copy.
- Failing-first proofs: 3 upcoming render/state failures and 4 booking truth/selection/time-label failures. Final targeted files: calendar 57/57, upcoming parity 3/3, existing lockout 6/6, doctrine 30/30. PR body includes the full route/action parity table and truthful sweep; owned module headers carry matching documentation.
- Under the owner 14:08 override, this builder finishes after READY. Both independent lens verdicts are still required before the operator merges; any later findings or conflicts go to the standing FIX lane. Nothing merged or deployed here.

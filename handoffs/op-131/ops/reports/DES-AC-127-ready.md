FIX ROUND 1 (OPENING) (DES-AC-127, agent 128) — growth-project-mobile#486 @ b76e2288d7742ca14a66e93e3e104d9077519a22 — READY FOR AUDIT

163 changed lines (136 additions + 27 deletions), under the 250-line job cap. Current main merged before opening as requested; the owned README entry is inside the matching section, not appended. GitHub reports MERGEABLE.

All required checks are green at this exact head, including Typecheck/lint/test and both CodeQL analyses. CI: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685646981

Corrected local baseline at main d0875d26: six expected presentation assertions fail, two pass. Implementation and post-main-refresh targeted tests: 8/8 pass. The initial tests-only CI stopped at an unsupported RNTL14 fixture query; that was corrected and is not claimed as a behavioral red result. Saved local evidence is in ops/reports/DES-AC-127-local-baseline.log and DES-AC-127-refreshed-local-test.log.

Client view: Cormorant/tabular calorie hero; monochrome QuietBar rows with real current-day food totals; matching-ID coach attribution or neutral Your target; fiber, notes and valid effective date retained. Failed/loading totals never become a fabricated zero. Simple/full target visibility and pull-to-refresh remain tested; no navigation file, edit path, target calculation, API contract or access boundary changes.

Fixed B1: coachless clients are no longer told that an absent coach has not set their targets. Full action parity table and truthful sweep are in the PR body.

Awaiting both independent lenses at this exact head. No production action performed.

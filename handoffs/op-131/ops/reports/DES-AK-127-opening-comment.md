FIX ROUND 1 (OPENING) (DES-AK-127, agent 128) — growth-project-mobile#482 @ 01ffe9146f9580fcba2f2ba2291f7eb7a41363fd — READY FOR AUDIT

307 changed lines (237 additions + 70 deletions). All four checks are green at this head.

Fixed B1 false coach attribution, B2 Hall label/message destination mismatch and B3 unsupported coach promises for coachless accounts. Today now uses a date-led, text-first hairline layout; underlined shell segments keep existing labels/unread counts. Available compose, Find and Classroom use already registered routes and real flag/membership truth. All existing cohort/thread/event/challenge/message/safety/leaderboard handlers remain reachable.

Failing-first CI at tests-only 5c0010ee: lint/typecheck passed; seven expected assertions failed across the two touched-screen suites (677 others passed). https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680706319

Final full CI, including lint/typecheck/tests: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681554443

After shared deps became READY, three targeted files passed locally through heavy.sh, individually: Today 10/10, shell/leaderboard 5/5, coach-message 5/5. Existing open-handle warning on the coach-message suite is not treated as a launch blocker.

Parity inventory, truthful sweep and module README are included. No shared voice helper, navigator, production flag, dependency, lockfile or backend change. Awaiting both exact-head lenses; no merge/deploy performed.

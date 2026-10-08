FIX ROUND 1 (OPENING) (DES-AM-127, agent 128) — growth-project-mobile#487 @ c26d932d7d7a9d767ff0266218c463d26b8c52ee — READY FOR AUDIT

347 changed lines (270 additions + 77 deletions); T1 mobile only. Final typecheck/lint/full tests, actions analysis, JavaScript/TypeScript analysis and CodeQL are green. GitHub confirms MERGEABLE; latest main incorporated per the README instruction, with only the existing Notifications entry edited in place.

B1: Home failed requests no longer falsely report an empty inbox.
B2: Unsupported coach/reminder empty-state promises replaced with neutral refresh guidance.
U: unfilled hairline rows, full text, readable 15/13 pt Inter, dot/weight unread, 44 pt header targets, real preferences link, no dead already-read informational controls, and failed pagination stops loading while retaining rows.

Failing-first rendered baseline: 2 center and 4 Home assertions fail at the pre-implementation head. Local final center 33/33, Home 5/5, doctrine/truthful-copy 30/30 pass under the global lock. All eight kinds' original target/mark-read behavior and every existing action remain tested; parity table and truthful sweep are in the PR body. No device/screenshot evidence is claimed.

Report: ops/reports/DES-AM-127.md. Builder remains available for exact-head audit findings. No PR merge, deploy or production writes.

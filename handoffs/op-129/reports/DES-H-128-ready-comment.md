FIX ROUND 1 (OPENING) (DES-H-128, agent 128) — growth-project-mobile#483 @ 994daf822f5431f14067d1efb43f15cde489bdc0 — READY FOR AUDIT

384 changed lines (239 additions / 145 deletions), including tests and README; no backend, dependency, permission, money or production changes.

Replaced every shipped Health ring state with three QuietBar rows, actual values and independently dated samples. Starter goals live in one tested constants file (5,000 steps, 20 minutes, 250 active kcal), visibly labelled Starter goal; explicit typed real targets override each fallback. No activity-goal editor or persisted target field exists today, so no fake editor is added.

All four existing metric-detail taps/buckets, client Connections CTA, refresh/retry and parent AI panel slot remain. Coach embeds remain read-only. Cached errors no longer misrepresent the query window as the last sync time.

Acceptance: failing-first CI proved exactly three expected empty-state assertion failures on unchanged implementation; baseline local proof reproduced them once deps became READY. Local targeted checks through heavy.sh passed 11 screen/parity tests, 4 empty-state tests and 10 doctrine tests. [Exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683908910) passed 683 suites / 8,977 tests / 5 snapshots, and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683909008) is green.

Routes/actions parity table, truthful sweep and reference alignment are in the PR body. Please audit this exact head; operator owns merge and deployment.

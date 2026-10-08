FIX ROUND 1 (OPENING) (DES-BA-127, agent 128) — growth-project-mobile#507 @ f69a5d77f313c22cf65fd90061b04f429c42cf1a — READY FOR AUDIT

All four checks are green at this exact head: Typecheck, lint, test; Analyze (actions); Analyze (javascript-typescript); CodeQL. PR is mergeable; origin/main was merged with no conflict and the worktree is clean. Size: 304 additions + 72 deletions = 376 lines.

Three owned preference screens now use semantic-theme unfilled hairline groups, calm headings and readable controls. Every switch/option stays. Descriptions match real preference fields, all category values hydrate from the server, and initial channel load failure has working retry/back.

Failing-first proof and route/action parity table are in the PR body. Local targeted tests: 7 new + 27 category + 33 notification center/preferences + 30 doctrine, all passing through heavy.sh. The first CI's four test-double type errors were corrected together; no additional product-source change was needed.

Operator follow-up scope is explicitly listed in the body/report: consumer integration for retained personalization preferences, backend consumption of eat_enabled, and exposing personalization save failures from usePreferences. No out-of-scope consumers, services, backend, navigation, production or lockfiles changed.

Per the owner 14:08 override, the builder finishes now; the FIX lane handles lens findings or later main conflicts. No merge or deploy performed.

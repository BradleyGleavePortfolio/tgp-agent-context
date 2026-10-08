FIX ROUND 1 (OPENING) (ONB-TOUR-131, agent 131) — growth-project-mobile#565 @ bcd9eac7f9c63d9acd122f2771f4da13bbdd43a7 — READY FOR AUDIT

FW-ONB-128 B2 fixed: Roman names a coach only when `user.coach_id` is set, which is the same signal Home's "Message your coach" row reads. Without a coach, the five steps about a coach (community, coach messages, calendar, first message, welcome call) are skipped as `unavailable`, with no done line. The welcome line has a coachless version and says "your training" when no plan is set. The closing line is built from this tour's outcomes. Settings reads "Take the tour" until a tour is completed.

Evidence: the new `src/tutorial/__tests__/tutorialTruth.test.tsx` passes 14/14. Failing-first: on main 868a629c's source files, 12 of 14 fail (the 2 that pass are coached behaviour this PR keeps). The changed suites pass locally (tutorialCopy, tutorialMachine, tutorialCalendarFlag, tutorialStore, TutorialOverlay), and targeted ESLint is clean.

CI: "Typecheck, lint, test", CodeQL and both Analyze jobs are green at this exact head. GitHub reports MERGEABLE (no conflict with main).

492 changed lines. The READMEs, the routes/actions table and the truthful sweep are in the PR body. No backend, dependency, lockfile, flag or production change.

For reviewers: the test is `.tsx` rather than the `.ts` named in the entry, because it renders TutorialHost and the Settings row. Community and calendar also need the coach, beyond the three steps named in B2: their lines name the coach, and both features belong to a coach.

agent 131

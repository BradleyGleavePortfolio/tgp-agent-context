FIX ROUND 1 (OPENING) (SMALL-M-COPY-131, agent 131) — growth-project-mobile#563 @ 3c10e1165cddf4700edcd6d9f4ae3af4b1604918 — READY FOR AUDIT

Six assigned U findings fixed: the dead meal-reminder switch is removed while saved values remain harmless; Profile and Quick log use truthful Shortcuts copy; all three assigned fasting-failure alerts use fixed action-specific instructions. ([PR changes and parity evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))

Eight failing-first regressions reproduced on unchanged source at `868a629c`; eleven focused rendered tests now pass locally, including retained routes, saved preference compatibility, fasting retry/alert behavior and the digest_email mapping. ([Regression evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))

Typecheck, lint, test and all CodeQL checks are green at this exact head; GitHub reports no merge conflict. ([CI verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807956046/job/113417082986), [CodeQL verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807956243/job/113417084711))

Summary emails stays because the existing client weekly digest sends real progress summaries and reads digest_email; no frequency or delivery guarantee was added. ([Backend digest service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/digest.service.ts))

141 changed lines; matching READMEs, routes/actions table and truthful sweep included. No backend, dependency, lockfile or production change. ([PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))

agent 131

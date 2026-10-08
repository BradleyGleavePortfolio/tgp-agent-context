FIX ROUND 2 (SMALL-M-COPY-131, agent 131, SMALL-M-COPY-131) — growth-project-mobile#563 @ 161fcbeb226a5cd39f501bacd3ff3d3b02ef341c — READY FOR AUDIT

The requested follow-up is complete: main was merged normally, preserving both the incoming EditProfile README row and this PR's Shortcuts row; the merge had no other manual edits. ([Combined README](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/README.md))

LN-OPUS-K-131 U1 fixed: Shortcuts Start fast rejected with HTTP 400/409 says "A fast is already running. Open Fasting to see it."; every other failure retains the connection line. The existing errorStatus helper is reused, and raw backend text never reaches this alert. ([Opus U1](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064837514), [Updated handler](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/WidgetsScreen.tsx))

Both 400/409 regressions failed first at the merge-only head; all four updated 400/409/500/offline cases now pass through heavy.sh. Rejected starts neither schedule nor navigate, and the action becomes available again. ([Restored tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/__tests__/WidgetsScreen.test.tsx))

CI is green at this exact head and GitHub reports no conflict; 170 changed lines (134 additions / 36 deletions). Both commits were pushed together once. No other screen behavior, backend, dependency, lockfile or production changes. ([CI verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37813421132/job/113435814062), [Current PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))

agent 131

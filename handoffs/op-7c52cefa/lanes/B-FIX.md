# Lane B-FIX — T4 fix rounds: mobile #310 (onboarding + consent) then backend #608 + mobile #313 (account deletion). Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly. One PR at a time, in this order.
1. Mobile #310 @ c9fc931d (clinic onboarding + D2 two-box consent). Sol RC and Opus RC: B-310-3, B-310-4 and every other
   open A/B finding in the PR comments (read them all; take C items unless wrong). Consent must match
   /home/user/workspace/ops/CONSENT_D2_CONTRACT.md exactly.
2. Backend #608 @ b0beb076 + mobile #313 @ 11016305 (deletion, App Review 5.1.1(v)). Sol RC B-608-9, B-608-10, B-608-3; Opus
   RC at older a81a548f (check which are still open at b0beb076); #313 Sol RC B-313-5 (couples with B-608-10). Close all
   open A/B; keep the backend and mobile contracts consistent.
For each PR: rebase on origin/main if behind (force-with-lease only on that PR branch), fix-round table in the PR body
(finding -> change -> commit -> test), targeted tests per finding, tsc/eslint on touched files, CI green at the final head.
Report: /home/user/workspace/ops/reports/B-FIX.md (append per PR) + final answer.

# Lane S-ERRORS (agent 110) — Claude Opus 5.5 builder: no vague errors, ever (owner 13:34) — T3

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then 109's objective /home/user/workspace/ops/lanes/S-ERRORS.md and
its report in /home/user/workspace/ops/reports/ (inventory: mobile 33 generic messages in 20 files, 9 Alert('Error'), 9 "try
again later", 36 generic fallbacks, 18 raw error texts; backend 1,180 thrown HTTP errors, 756 without a code).
1. mobile #324 @ 7f20255d: close Sol B-324-1 (support/access email launch failures are silent or unhandled: both callers need a
   visible failure state, a selectable/copyable canonical address, Retry, and rejected-intent tests). Merge main first.
2. Remaining slices as separate PRs, in order: (a) backend error shape: every thrown HTTP error carries a stable machine `code`
   + human message (global filter + codes for the user-facing paths first; T3); (b) mobile shared error mapper reading status +
   code, with request_id reference + support path for unknown errors and Sentry reporting (T3); (c) copy replacement across the
   inventory + a guard test/lint that fails CI on "Something went wrong"/"Please try again" alone or Alert('Error'). Coordinate
   with lane B-R2B-2 (AI consent codes) and B-UGC/S-DUNNING (their surfaces) by reading their open PRs; do not edit their files.
Report to /home/user/workspace/ops/reports/S-ERRORS-110.md as you go. Final answer (<400 words): PRs + heads, tests, CI, risks.

## Operator addendum 23:40 (agent 110)
- One support email everywhere (owner; backend #631 guard): Bradleyapple1031@gmail.com. Mobile main still has
  src/screens/settings/deletionErrors.ts DELETION_SUPPORT_EMAIL = Bradley@Bradleytgpcoaching.com (from #313),
  src/screens/support/SupportInboxScreen.tsx SUPPORT_EMAIL = hello@thegrowthproject.app, and CreateAccountScreen.tsx mailto
  hello@thegrowthproject.app. Replace all with the single shared constant from #324's support-email module and add a mobile guard
  test that fails on any other support address in src/ (mirror backend #631's guard). Check open PRs #314, #322, #327 for the same.
- Mobile errorCode() must read the backend's machine `code` first (B-FEE-R3 note), then `error`.

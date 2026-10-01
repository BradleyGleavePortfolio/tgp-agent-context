# Lane S-ERRORS — no generic or vague errors anywhere (mobile + backend). T2 (T3 if auth/consent surfaces change). Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
Owner 13:34 PDT (near-verbatim): "We also need to fix the fact that tgp throws generic and undescript failure notes - like
ever - users notice and churn from having unresolvable issues from bad error codes!" Rule: no generic or vague errors,
ever. Every failure a user can see says what happened and what to do next, in plain words, with no exclamation marks.

## Start after mobile #306 merges (it adds `src/utils/authFailure.ts`, the auth-screen mapper you extend).

## Deliver
1. Inventory (put the table in your report): every user-visible failure string and fallback in mobile `src/` (Alerts,
   toasts, inline errors, empty/error states, catch blocks that show text, ErrorBoundary), and every backend error
   response shape (HttpException bodies without a stable `error` code, raw 500s, validation pipe output).
2. Backend: one error body shape everywhere, `{ error: STABLE_CODE, message: plain sentence, request_id }`; global
   exception filter maps unknown errors to `INTERNAL_ERROR` with the request id (no stack/PII to clients); validation
   errors name the field. Keep existing codes stable (mobile relies on them).
3. Mobile: one app-wide mapper (extend utils/authFailure.ts into a shared module) from code -> specific message +
   action (retry, log in, reset password, update card, contact coach, contact support). Unknown errors show a short
   reference ID (the backend request_id when present) + "Contact support", and go to Sentry without passwords, tokens or
   health data. Offline/timeouts get their own copy. Replace every generic string found in step 1.
4. Guard: a test that fails the build if a generic phrase appears in user-facing mobile strings (e.g. "Something went
   wrong", "An error occurred", "Unknown error", "Error" alone, "Please try again" without a reason) or if a backend
   HttpException is thrown without a stable code. Allowlist only with a reason comment.
5. Owner 14:19 PDT: one support email. Support email is Bradleyapple1031@gmail.com. Add one SUPPORT_EMAIL constant per
   repo and replace every support mailto/text: mobile WelcomeScreen.tsx (~69), CreateAccountScreen.tsx (access-request
   mailto), SupportInboxScreen.tsx SUPPORT_EMAIL (from #306), every "Contact support" link from the mapper; backend
   src/public-pages/public-pages.html.ts SUPPORT_EMAIL. Add a test that fails if any other support address remains.
Open PRs against main (backend and mobile separately), tier header, fix-round tables. Report:
/home/user/workspace/ops/reports/S-ERRORS.md + final answer (PR URLs, heads, inventory counts before/after, tests, CI,
open risks).

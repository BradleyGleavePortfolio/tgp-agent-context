# ONB-RESEND-128 (FIXWAVE-128, Claude Opus 5.5, agent 128) — mobile, T3

## Scope traced
FW-ONB-128 B1: no way to get a new sign-up confirmation link. Backend `POST /auth/resend-verification` (auth.controller.ts:359-368,
live in prod deploy 23, enumeration-safe, throttled). Mobile never called it.
Files: src/services/api.ts (authApi.resendVerification), new src/screens/auth/ResendVerificationLink.tsx, CreateAccountScreen.tsx
(verify step only), EmailVerifiedScreen.tsx (link_problem only), LoginScreen.tsx (email-unconfirmed error only), auth README,
new __tests__/ResendVerificationLink.test.tsx, one case added to __tests__/CreateAccountScreen.test.tsx.

## B list
- B1 fixed: a new client whose confirmation email is lost/expired can tap Send a new link on the verify step, the Login "not
  confirmed yet" error (email sign-in only) and the expired-link screen (email field). Neutral sent copy, 60 s pause,
  429/offline/400/other-failure states, Contact support on failure/limit where the screen has it.

## U list
- none beyond B1 (EmailVerified link_problem body no longer says "contact support for a new link").

## C one-liners
- C (edge, deferred to 10k clients): no signup-policy gate on `email_confirmation_resend` (prod advertises true; endpoint live).

## PRs
- growth-project-mobile#518, branch agent128/onb-resend-128, head cd4a29d23c5cebbdf94f923d94595ddbcdb5b928, 361+/7- (368 lines,
  8 files). Local: ResendVerificationLink.test.tsx 10/10, CreateAccountScreen.test.tsx green. Failing-first: new test file
  imports a component/API method absent on main. CI: green at head (Typecheck, lint, test; CodeQL). Verdicts: not waited for (owner 14:08 override).
- Overlap: m#502 (EmailVerified, README) and m#504 (Login, README) open; based on main c44763a1, diff minimal.

## Not fixed (needs operator)
- none.

## HANDOFF
15:12 PDT: PR m#518 open at cd4a29d2, CI green, READY comment posted
(https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/518#issuecomment-6047899333). Builder finished per owner 14:08
override; lens verdicts pending. Any REQUEST CHANGES goes to the FIX lane on branch agent128/onb-resend-128 (worktree
/home/user/workspace/wt/ONB-RESEND-128-mobile). If m#502 or m#504 merges first, expect small conflicts in EmailVerifiedScreen.tsx,
LoginScreen.tsx and src/screens/auth/README.md: merge origin/main, keep both sides (the resend render lines are self-contained).

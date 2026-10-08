**Tier:** T3
**Why:** auth surface: a public, unauthenticated endpoint is now called from three sign-up/sign-in screens; copy must stay enumeration-safe.
**T4 trigger scan:** no auth/session/token logic changed, no RLS/tenancy, no PII stored or logged, no money, no credentials, no destructive data. The address is sent only to the existing backend endpoint, never stored.
**T3 trigger scan:** auth screens (CreateAccount verify step, Login error box, EmailVerified link_problem) gain one secondary action. Endpoint `POST /auth/resend-verification` is live in production deploy 23 (backend `src/auth/auth.controller.ts:359-368`), throttled server-side, same answer for any address.
**Bounded T1:** README rows, test fixtures.
**Canonical builder:** ONB-RESEND-128 (Claude Opus 5.5, agent 128)
**Parent owner:** FW-ONB-128 B1 (ops/reports/FW-ONB-128.md)
**Acceptance evidence:** new `src/screens/auth/__tests__/ResendVerificationLink.test.tsx` (10 tests: sent/limit/offline/invalid/missing/failed states, 60 s pause, EmailVerified link_problem, Login unconfirmed vs wrong password) and one new case in `CreateAccountScreen.test.tsx` (verify step sends to the stored address). Failing-first: the new test file imports `ResendVerificationLink` and `authApi.resendVerification`, which do not exist on main. Local runs green for both files.
**Promotion triggers:** none.

## What changes for coaches/clients
A new client whose confirmation email went to spam, was deleted or expired can now tap **Send a new link**:
- on the "Check your inbox" step after creating an account (sent to the address the server stored);
- under the sign-in error "Your email is not confirmed yet" (email sign-in only; never for Apple or Google, where no link was sent);
- on the "This link has expired or was already used" screen (enter the email, then Send a new link). Its body no longer says "contact support for a new link".

After a tap: "If an account is waiting for confirmation, a new link is on its way. Check the spam folder too." (never claims delivery: the backend answers the same for any address). Then a 60 s pause before "Send another link". Too many requests (429), no connection, a bad address (400) and any other failure each get their own line; the failure and limit lines offer Contact support where the screen has it.

## B/U list
- B1 (FW-ONB-128): sign-up dead-ends on a lost or expired confirmation email; no screen offered a new link. Fixed.
- C (edge, deferred to 10k clients): no signup-policy gate on `email_confirmation_resend`; production advertises it true and the endpoint is live.

## Routes/actions before -> after
| Screen | Action | Before | After |
|---|---|---|---|
| CreateAccount verify | I verified my email | sign in, route | same |
| CreateAccount verify | Use a different email | back to form | same |
| CreateAccount verify | Log in / Contact support (error, notices) | Login / SupportInbox | same |
| CreateAccount verify | Send a new link | missing | POST /auth/resend-verification (stored address) |
| Login error | Contact support | SupportInbox | same |
| Login error (email unconfirmed) | Send a new link | missing | POST /auth/resend-verification (typed address) |
| EmailVerified link_problem | Sign in / Contact support | Login / SupportInbox | same |
| EmailVerified link_problem | Send a new link | missing | email field + POST /auth/resend-verification |
| EmailVerified confirmed | Continue / Sign in | back / Login | same, no resend |

Parity proven in tests: EmailVerified Sign in -> `replace('Login')`, Contact support -> `SupportInbox`; CreateAccount verify keeps Use a different email; existing CreateAccount suite green.

## Truthful sweep
New copy: no first person, no emojis, no exclamation marks, no delivery claim, no claim the account exists. Colours from `useTheme().semanticColors` (light fallback), no hex literals; text >= 14 pt, tap targets >= 44 pt, hairline email field, text-link secondary action (the forest primary stays the screen's one primary).

## Overlap
m#502 (EmailVerifiedScreen, auth README) and m#504 (LoginScreen, auth README) are open on nearby files. Based on main c44763a1; diff kept minimal (EmailVerified: 1 import, 1 body line, 1 render line; Login: one state flag and one render line). README edits are two cells and one new row.

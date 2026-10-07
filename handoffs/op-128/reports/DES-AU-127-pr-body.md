Tier: T1
Why: Bounded visual/copy refresh of four existing pre-sign-in screens.
T4 trigger scan: Auth handlers, token/session storage, provider gates, password policy and error mapping unchanged. No security, consent, credential or server changes.
T3 trigger scan: No schema, backend, package, endpoint or navigation change.
Bounded T1: Owned four auth screen files, their tests and only matching auth README rows; under 400 changed lines including tests.
Canonical builder: DES-AU-127, agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Failing-first input presentation proof; targeted rendered action/state parity; provider/error regression tests; AST equality of all 18 named auth handlers/effects; CI required before READY.
Promotion triggers: Any authentication, provider gate, token, validator or error-map change requires promotion and remains out of scope.

## What changes for coaches/clients
The welcome page emphasizes Sign in while retaining account creation. Sign-in and password recovery use bone, semantic colors, hairline inputs, Inter controls, quieter status icons and neutral instructions. Reset password requirements are readable outside the input. Recovery forms scroll with keyboard-aware insets; back/support targets are at least 44 pt. Google typography/dimensions and Apple native button/component remain unchanged; provider colors resolve through the theme.

## B/U list
- B: none introduced or identified within frozen scope.
- U1: quieter hierarchy, comfortable type, hairline fields, scrolling forms and readable recovery requirements.
- U2: remove unsupported results slogan, unverified returning-user greeting and first-person choice labels; distinguish reset request from delivery.

## Routes/actions before -> after
| Screen / before label | After label | Destination or effect (unchanged) |
| --- | --- | --- |
| Welcome / Get Started | Create account (secondary text) | `navigate('CreateAccount')` |
| Welcome / Log In | Sign in (forest primary) | `navigate('Login')` |
| Login / Email, Password | Same | Same email/password setters; prefilled email sanitation unchanged |
| Login / Forgot password? | Same | `navigate('ForgotPassword')` |
| Login / Sign In | Sign in | Same `handleLogin`; validation, loading, token/cache/onboarding writes, role gate and auth event unchanged |
| Login / Continue with Google | Same | Same policy visibility, loading gate and `handleGoogleLogin` |
| Login / Apple native SIGN_IN | Same | Same native component, wrapper dimensions, loading gate and `handleAppleLogin` |
| Login / Yes, sign me in | Sign in to existing account (secondary text) | Same confirmed Apple/Google handler; no provider gate bypass |
| Login / I am new, create an account | Create a new account | Same pending-state clear + `navigate('CreateAccount')` |
| Login / Sign up | Same | `navigate('CreateAccount')` |
| Login / error Contact support | Same | `navigate('SupportInbox')` only when same mapper offers support |
| Login recovery / Continue as a client | Same | Same acknowledgeRecovery; busy gate, persisted recovery and role gates unchanged |
| Login recovery / Contact support | Same | `navigate('SupportInbox')` |
| ForgotPassword / Back | Same | `goBack()` |
| ForgotPassword / Email | Same | Same setter and error clear |
| ForgotPassword / Send Reset Link | Send reset link; busy Submitting... | Same trimmed-email shape gate + `authApi.forgotPassword` + submitted/error state |
| ForgotPassword submitted / Contact support | Same | `navigate('SupportInbox')` |
| ForgotPassword submitted / Back to Login | Back to login | `navigate('Login')` |
| ResetPassword / Back to login | Same | `navigate('Login')` |
| ResetPassword / New password, Confirm new password | Same | Same setters, token/editability/submitting gates |
| ResetPassword / Show password, Hide password | Same | Same shared visibility toggle for both inputs |
| ResetPassword / Update password | Same | Same match/policy checks, Supabase setSession/updateUser/signOut and error mapping |
| ResetPassword completed / Go to login | Same | `navigate('Login')` |

No route, action, notice, conditional provider or support path removed. Existing conditional recovery notices remain state-driven. The reset success render test initializes its done hook; it does not execute Supabase. Separate unchanged source guards and handler AST equality prove the session/update/sign-out contract.

## Truthful sweep (old-main line references)
| File:line / before | What is known on screen | After |
| --- | --- | --- |
| WelcomeScreen.tsx:32 / The work is quiet. The results are not. | No user/results data on welcome | Sign in or create an account. |
| LoginScreen.tsx:462 / Welcome back. | No verified returning-user state | Sign in. |
| LoginScreen.tsx:600,603 / Yes, sign me in | Existing-account confirmation effect, not first-person product voice | Sign in to existing account |
| LoginScreen.tsx:612,615 / I am new, create an account | Account-creation destination, not first-person product voice | Create a new account |
| ForgotPasswordScreen.tsx:82 / Enter your email to get a reset link | Submission does not prove mail delivery | Enter your email to request a reset link |
| ForgotPasswordScreen.tsx:147 / Sending... | Anonymous reset request pending | Submitting... |

True optional coach-code note and submitted-request/privacy copy retained verbatim. All error strings, provider explanatory copy, coach recovery notice and reset outcome messages remain unchanged. Only action/title casing changed elsewhere. No fabricated counts, promises, exclusivity claims or new first-person/hype strings.

## Evidence
- Local tests run sequentially, one file per heavy.sh invocation: 109 distinct tests across 11 files pass (four-screen parity/presentation + provider/role/recovery/error guards + doctrine/truthful guards).
- Failing-first proof: existing reset input lacked its Inter font and hairline bottom border. Test failed on main presentation before screen edits.
- AST equality proof: Login 13, ForgotPassword 2 and ResetPassword 3 named handlers/effects are identical to main.
- Auth README: only these screens' existing Key files/state-machine rows updated; ResetPassword row added beside ForgotPassword, not appended.
- No native screenshot/device pass, store build, deployment or production mutation performed.
- Main will be merged and CI/conflict status checked before READY.

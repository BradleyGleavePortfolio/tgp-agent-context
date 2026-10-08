Tier: T1
Why: bounded, visual-only Create account presentation; no auth, consent, validation, persistence, request or navigation changes.
T4 trigger scan: none; auth/PII/consent handlers and payloads are frozen and untouched.
T3 trigger scan: none; no shared architecture, dependency or navigator changes.
Bounded T1: YES; one screen, existing tokens, local styles, screen-specific tests, own README row only.
Canonical builder: GPT-6.1 Sol (DES-AV-127, agent 128).
Parent owner: operator agent 128.
Acceptance evidence: failing-first semantic-theme tests, then 143 targeted tests passing via ops/heavy.sh; see below.
Promotion triggers: any change to consent wording/links/checks, auth requests, validation, signup state machine, PII persistence or shared routing would require re-grading and operator routing.

## What changes for coaches/clients
- A calm, bone-page Create account form: unfilled hairline inputs, quiet small-caps field labels, Inter readable/tappable text and one Cormorant headline.
- One forest primary action; existing-account recovery actions remain visible but no longer compete as a second filled primary.
- Theme-semantic colours throughout this screen, including readable placeholders, loading feedback and the coach-sharing notice presentation. Dark remains hidden for launch.
- All existing fields, consent text/links, role choice, email/Apple/Google sign-up, support, recovery and verification actions stay in place with their existing handlers.

## B/U list
- B: none within this visual-only change.
- U fixed: card-like, shadowed signup inputs and default type distracted from the account task; hairlines and consistent readable typography replace them.
- No deferred edge work, dependencies, lockfile or production changes.

## Routes/actions before -> after
| Label / control | Before | After |
| --- | --- | --- |
| Coach invite code | Edit code; blur previews the code | Same |
| Paste invite code | Read clipboard on tap, extract code/join URL, preview or show guidance | Same |
| Request access | Open support email draft when a code is required | Same |
| Request-access fallback Copy / Try again | Copy support address / reopen draft | Same |
| Full name / Email / Password / Phone (optional) | Edit existing registration values; password remains secure | Same |
| Client / coach role options | Existing RoleChoice sets intended role and opens register view | Same |
| Here to train instead? / Coach clients instead? | Return to role-choice view when allowed; blocked during signup | Same |
| Terms of Service / Privacy Policy | Open their existing legal pages | Same |
| Create account | Existing validation then register or signup-with-code; verify / existing transition | Same |
| Continue with Google | Existing policy-gated Google signup and outcome handling | Same |
| Apple Sign-Up | Existing native Apple control and signup handling | Same |
| Sign in | Navigate Login | Same |
| Existing-email Log in | Navigate Login with typed email | Same; secondary visual weight |
| Reset password | Navigate ForgotPassword for applicable signup issues | Same |
| Signup-pending Back | Clear issue and return to registration | Same |
| Contact support (signup issue / error / role outcome / withdrawal) | Navigate SupportInbox in the corresponding existing state | Same |
| Verification-error Log in | Navigate Login with typed email | Same |
| I verified my email | Existing login/check and role-selection/auth handoff | Same; frozen wording |
| Use a different email | Return to register view | Same |
| Create a client account instead | Existing explicit client re-choice when coach signup is unavailable and not unconfirmed | Same |
| Sign in to check | Navigate Login when coach signup outcome is unconfirmed | Same |
| Check again | Reload signup policy; return to coach form or show existing status | Same |

Parity evidence: `CreateAccountScreen.test.tsx` renders client/coach/code/unknown-policy/provider/verification/withdrawal states and exercises the registration, clipboard, request-access fallback, provider, role-change and handoff handlers. New visual-redo parity test additionally checks all five fields, both legal links, providers, Sign in, paste, optional phone submission and different-email return together. `CreateAccountFixRound5.test.tsx` renders recovery/refusal states and checks Log in, Reset password, Back and Contact support. Existing legal test opens both exact URLs. `CreateAccountCoachSharing.test.tsx` verifies both current-production and advertised-notice policy states and all three signup payloads.

## Truthful sweep (before styling)
No unsupported line found in the changed screen. All rendered strings remain verbatim.
| File:line at base main | Copy family | What is true / treatment |
| --- | --- | --- |
| CreateAccountScreen.tsx:900-975 | Verification, email, pairing/role outcome, errors and actions | Driven by existing signup response, typed/stored email and failure state; unchanged |
| CreateAccountScreen.tsx:986,1017-1094 | Loading and coach-withdrawal outcomes | Existing policy/request-outcome variants; unchanged |
| CreateAccountScreen.tsx:1113-1253 | Role choice, client/coach title/instruction, signup issues/errors | Existing policy/role/typed-code/error variants; unchanged |
| CreateAccountScreen.tsx:1258-1381 | Field labels, previews and request-access | Neutral input instructions or existing preview/email state; unchanged |
| CreateAccountScreen.tsx:1388-1466 | Legal sentence/links, coach-sharing notice, signup providers and Sign in | Frozen consent and functional action labels; unchanged |

The frozen first-person label “I verified my email” is intentionally preserved. Consent wording, links, notice version, all validation rules, signup logic and role-choice logic are untouched.

## Acceptance evidence
- Failing first: both new light/dark semantic render assertions failed against unchanged screen (legacy colours instead of active theme); new parity test already passed.
- `CreateAccountScreen.test.tsx`: 79 passed.
- `CreateAccountCoachSharing.test.tsx`: 2 passed.
- `CreateAccountFixRound5.test.tsx`: 24 passed.
- `copyVoice.guard.test.ts`: 8 passed.
- `quietLuxuryDoctrine.test.ts`: 30 passed, including existing truthful-copy/state/action guards.
- Every local run used `/home/user/workspace/ops/heavy.sh`, one targeted Jest file per run; full-project typecheck/lint/test delegated to CI.
- Only CreateAccountScreen's existing row in the shared auth README changed. No other screen documentation edited.
- No device screenshot or native build produced; render assertions cover the active light/dark semantic tokens. No new backend dependency.

## Quiet-luxury checklist
- [x] No new heavy display weight, false/hype copy, emojis or exclamation marks.
- [x] No new large radius, shadow, gradient, particles, FAB or banner.
- [x] Primary buttons use theme accent; fields have hairline borders and no fill/shadow.
- [x] No navigation pathway, action, consent or validation removed.
- [x] README updated with the screen; no dependency or lockfile change.

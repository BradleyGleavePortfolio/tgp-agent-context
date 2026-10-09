CLIENT-POLISH-134 (agent 134), SHOTS-134B item c: **B16 B29**. Sign in: the underline inputs curled up at both ends, and "CONTINUE WITH GOOGLE" was uppercase and letter-spaced (seen in a web render, SHOTS-134B 5; from the code: LoginScreen.tsx input `borderRadius: Radius.md` on a bottom-only hairline, `googleButtonText` spread the uppercase provider-button type).

### Change
- `LoginScreen.tsx`: the email/password input keeps its bottom hairline and drops the corner radius; `googleButtonText` uses `typography.bodyMd`, the same as Create account (sentence case, Google's own button text). The now-unused provider typography import is removed.
- `ForgotPasswordScreen.tsx`, `ResetPasswordScreen.tsx` (the rest of the sign-in flow): their underline inputs drop the same 2 pt corner radius. Create account's inputs already had none.
- Presentation only: no copy, data, endpoint or navigation change.

### Before -> after
| Screen | Before | After |
|---|---|---|
| Sign in, email and password | bottom hairline with a 12 pt radius: the line curls up at both ends | straight bottom hairline |
| Sign in, Google button | "CONTINUE WITH GOOGLE", 13 pt, letter-spaced 1.6 | "Continue with Google", body medium, as on Create account |
| Forgot password, Reset password inputs | bottom hairline with a 2 pt radius | straight bottom hairline |

### Parity table
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 00 AUTH (Sign in) | src/screens/auth/LoginScreen.tsx | underline fields, sentence-case provider button | none left from this finding |
| 02 CREATE (reference for the Google label) | src/screens/auth/CreateAccountScreen.tsx (unchanged) | same Google label style now on both screens | none |
| none (Forgot / Reset password) | src/screens/auth/ForgotPasswordScreen.tsx, ResetPasswordScreen.tsx | same underline field as Sign in | none |

### WHY / WHEN / WHO
The Sign in inputs were moved to a bottom hairline (quiet-luxury auth pass) but kept the boxed-input radius; the Google label kept the uppercase provider-button type from before AUTH-ENTRY-133 gave Create account sentence case.

### Tests (heavy.sh, one file at a time; seen in a test)
- new `src/screens/auth/__tests__/authUnderlineInputs134.test.tsx` 3/3: Sign in email and password and Forgot password email have a hairline bottom border, no full border and no corner radius; the Sign in Google label has no uppercase transform or wide tracking.
- `ResetPasswordPresentation` 4/4 (+1 assertion: no corner radius).
- kept green: ForgotPasswordReadiness 5, LoginGoogleGate 4, LoginRoleChoiceGate 11, LoginRoleGateFixRound5 11, LoginCoachAttemptRecovery 9, AuthFailuresFixRound6 12, ProviderFailuresFixRound7 12, AuthEntryPrototype133 8, ResetPasswordScreen 9, quietLuxuryDoctrine 34, insetsCorners133 58. tsc clean, eslint 0 errors.

### Not seen on a device
Check Sign in on Android and iPhone: the field lines end square, and the Google button reads "Continue with Google".

agent 134

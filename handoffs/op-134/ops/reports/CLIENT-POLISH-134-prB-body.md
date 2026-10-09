CLIENT-POLISH-134 (agent 134), PR B of 2: client follow-ups left by agent 133's builders. Bugs **B13 B29** (AUTH-ENTRY-133 optional items, LN-OPUS-C-133 U1 on m#611, REDO-SETTINGS-133 optional NEED). No new endpoint, no navigation change.

### Items (JOBS134 CLIENT-POLISH-134)
3. **Sign up / Log in.**
   - **No lone "or".** Create account showed the providers block on every iPhone (`Platform.OS === 'ios' || googleEnabled`), so an iPhone without Sign in with Apple and without Google showed "or" with nothing above it. `AppleSignInButton` now reports when it actually shows (`onAvailable`, called once after its own availability check), and the divider renders only when Apple showed or Google is advertised. Android: Apple never shows, so "or" appears only under Google. Log in (from the code): its "or" is already only rendered with the Google button under it, so it never stands alone; no change there.
   - **The pinned footer never covers the fields with the keyboard open.** With a typed code, the footer (sharing sentence, Create account, terms) was about 280 pt on a 360x800 Android phone (estimated from the styles: two 16 pt margins per line), leaving about 140 pt of form above a 300 pt keyboard. Now: footer lines drop the extra 16 pt margins (the footer's 8 pt gap spaces them), and while the keyboard is open the three items move together to the end of the form (sentence above the button, terms under it, as pinned), then pin again when it closes. The swap only changes the footer's children, so the field being typed in is never remounted (tested).
4. **"Add a coach code" accepts a pasted invite link.** Pasting `https://…/join/<code>`, `tgp://join/<code>` or `…?code=<code>` fills the field with the code inside it (the same `lib/inviteCodeInput.extractInviteCode` the sign-up Paste button uses) and sends that code; a typed code is sent as typed. **One coach-code endpoint:** the Settings row used `POST /auth/attach-invite-code`, the coachless Home / Messages sheet (`components/coachless/CoachCodeSheet`) uses `POST /coachless/coach-code/redeem`. Both now use **`POST /coachless/coach-code/redeem`** (existing). Why this one: it is the post-signup redemption route; it writes through the same single attach writer (`InviteCodesService.attachUserToCoachByCode`) and adds the Idempotency-Key ledger, the featured-coach pause refusal (`coach_not_accepting`, which the Settings path skipped) and specific refusal codes; the sheet needs its coach card and next-step payload, which attach-invite-code does not return. Settings now sends one Idempotency-Key per attempt (reused on a retry of the same code, as the sheet does) and shows the sheet's refusal lines (`coachlessCopy.refusalLine`). Its route is behind the `FEATURE_COACHLESS_HOME` kill switch, which is on in production (RECON133; from ops notes, not re-checked live); while off, the screen says "Coach code entry is paused right now", like the sheet.
   - Copy: the coachless screen no longer says "your coach" ("Enter the code a coach shared to connect this account." / "Enter the code the coach shared.").

### Before -> after
| Screen | Before | After |
|---|---|---|
| Create account, iPhone without Apple and without Google | lone "or" above the form | no divider |
| Create account, Android with Google | Google, "or" | unchanged |
| Create account, 360x800 Android, code typed, keyboard open | pinned footer about 280 pt; form window about 140 pt (estimated) | footer items inline at the end of the form; pinned slot 36 pt; form window about 384 pt |
| Create account footer, keyboard closed | sentence / button / terms with 16 pt margins on each line | same three items on the footer's 8 pt gap (closer to prototype 02) |
| Add a coach code, pasted join link | raw link sent, refused as an invalid code | field shows the code inside the link; that code is redeemed |
| Add a coach code, endpoint | `/auth/attach-invite-code`, no idempotency, no featured pause | `/coachless/coach-code/redeem` like the sheet |

### Parity table
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 02 CREATE | src/screens/auth/CreateAccountScreen.tsx | Apple first, "or", fields, pinned Create account + terms line | "or" hidden when no provider shows (prototype assumes Apple); with the keyboard open the footer sits at the end of the form (prototype shows no keyboard state) |
| 02 CREATE (provider button) | src/components/AppleSignInButton.tsx | official Apple button, unchanged look | new optional `onAvailable` callback only |
| none (Settings, decision 133-14) | src/screens/client/settings/AddCoachCodeScreen.tsx | same look, one Join button, sharing sentence | endpoint and refusal copy now match the coachless sheet |

### WHY / WHEN / WHO
- Lone "or": m#591 (AUTH-ENTRY-133, 4790df4c) put the divider inside the providers block keyed on `Platform.OS === 'ios'`, not on a shown Apple button (its own C edge).
- Tall footer: m#591 pinned the sharing sentence and terms with the older `legalText` 16 pt margins (its own C edge).
- Pasted link refused and two endpoints: m#611 (REDO-SETTINGS-133, 3abed53a) sent the raw text to attach-invite-code per decision 133-14; LN-OPUS-C-133 U1 and the REDO-SETTINGS-133 optional NEED.

### Tests (heavy.sh, one file at a time; seen in a test)
- new `src/screens/auth/__tests__/createAccountFooterKeyboard134.test.tsx` 6/6: no "or" on iOS without Apple/Google; "or" under Apple when it shows; Android "or" only under Google; no providers block on Android without Google; keyboard show moves sentence + button + terms inline (one Create account), pinned slot = 12 + footer bottom padding, form window at least three fields on 360x800 with a 300 pt keyboard; keyboard hide pins again; the typed field is not remounted.
- `AddCoachCodeScreen.test.tsx` 9/9 (rewritten for the shared endpoint): insets at 24/47; one redeem with key + sharing version, user patched, session re-read; refusal line, key kept for the same code, new key for a new code; `coach_not_accepting`; three pasted link forms fill the field and redeem the code; typed code kept as typed.
- kept green: AuthEntryPrototype133 8/8 (2 snapshots updated: `testID="create-account-or"`, terms line margin), CreateAccountScreen 80/80, CreateAccountCoachSharing 2/2, CreateAccountFixRound5 24/24, ProviderFailuresFixRound7 12/12, AuthFailuresFixRound6 12/12, LoginGoogleGate 4/4, LoginRoleChoiceGate 11/11, ResendVerificationLink 10/10, settingsLook133 6/6, appleAccountCopy 3/3, coachSharingNotice 3/3, quietLuxuryDoctrine 34/34, truthfulCopy 20/20, copyVoice 8/8. `tsc --noEmit` clean, eslint clean (only pre-existing warnings).

### Not seen on a device
Nothing here was seen on a phone. Check on a device: Create account on an Android 360x800 phone with a code typed and the keyboard open (footer moves under the fields, comes back on close; iOS uses the will-show/will-hide events); an iPhone signed out of iCloud (no Apple button, no "or"); Settings > Add a coach code with a pasted join link and a live code.

agent 134

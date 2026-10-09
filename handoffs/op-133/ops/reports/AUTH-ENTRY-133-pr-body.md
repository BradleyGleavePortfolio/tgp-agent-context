**Tier:** T3 (auth entry UI: copy, layout, flow order; no auth logic change)
**Why:** B11 B12 B13 B17. The owner's install shows a "GP" box, a bare welcome page, sign-up screens jammed under the Android status bar and a role choice made of beige cards with chevrons. Prototype 00-02 is the approved flow (owner 16:20: about 90% the same flow, keep our button counts).
**T4 trigger scan:** auth screens touched, but no change to session handling, token storage, request bodies, role computation or policy gating. `handleRegister`, `handleAppleSignup`, `handleGoogleSignup`, `intendedRoleForRequest`, the invite-code paths and the verify step logic are unchanged. The role is still committed only through `setIntendedRole`; it now waits for Continue instead of the row tap. No new storage, no new endpoint.
**T3 trigger scan:** user-visible auth copy and order (Apple/Google above the form; terms line in the pinned footer under Create account, the sharing sentence directly above it).
**Bounded T1:** README rows (src/screens/auth/README.md).
**Canonical builder:** AUTH-ENTRY-133 (claude_opus_5_5), agent 133 lane. **Parent owner:** operator agent 133.
**Acceptance evidence:** jest (below), snapshots at 360x800 and 390x844 insets, parity table. **Not seen on a device** (no device or simulator here): nothing in this PR was seen on a phone.
**Promotion triggers:** any change to auth request bodies, token storage or role logic would make this T4. None here.

## What changes for clients and coaches
- Welcome (00): a small TGP wordmark (never "GP"), the overline "Personal training, in your pocket", the serif title "The Growth Project", a short camel rule, "A plan, daily targets, and a coach who knows you.", then one forest **Get started** (opens account creation) and a **Log in** link. Same two actions as before; only the emphasis moves.
- Role (01): eyebrow WELCOME, "How will you use The Growth Project?", two quiet rows between hairlines with serif labels and radios. A tap only selects; **Continue** stays disabled until a choice is made. **I have an invite code** opens the client form with the code field focused. Picking "I'm here to train" shows "No coach code yet? You can add one after you sign up." A back chevron returns to Welcome (to Welcome by name when there is no history, B08 pattern).
- Create account (02): eyebrow "Joining Bradley" once a code or join link resolves (coach first name), else "Joining as a client" / "Joining as a coach"; "Create your account."; **Continue with Apple** first (iOS), Google under it when the signup policy advertises it (production does, 16:58), "or", then the email form with a show/hide password eye. Create account is the one filled button, pinned above the gesture bar with the terms line under it; the coach-sharing sentence sits directly above it when a code is typed. Back returns to the role step with the choice kept.
- Every step (role, form, verify, preparing, coach-unavailable) uses the shared `Screen` from m#577: insets from react-native-safe-area-context and 12 pt breathing room under the status bar (B13), `PrimaryButton` (radius.button 12, owner 17:07 rounded corners), `Headline` serif roles (lineHeight >= 1.25x, no clipped descenders).

## Bugs
- B11 S2 welcome logo "GP" box: fixed (TGP wordmark).
- B12 S2 welcome bare vs prototype AUTH: fixed.
- B13 account-creation screens squished to the top: fixed (shared Screen on every step).
- B17 S3 role choice crammed cards with chevrons: fixed (radio rows + one Continue + invite-code link).

## WHY / WHEN / WHO
- B11: the "GP" text box is from the initial commit f861d39b (2026-03-15) and survived every redo. B12: the copy "Sign in or create an account." with filled Sign in came from 36d8b3b1 in m#504 (agent 128, DES-AU-127, 10-07), which simplified the page before the prototype existed.
- B13: WelcomeScreen used `SafeAreaView` from 'react-native' (iOS-only padding) since f861d39b; CreateAccountScreen's root has been a bare `View` with no inset since it was created, kept by 039c3bc4 in m#503 (DES-AV-127). The auth stack runs `headerShown: false` (AuthNavigator.tsx), so on Android nothing padded the status bar.
- B17: RoleChoice cards (surface fill, icons, chevron, tap commits) came from 56d4fc62 in #306 (clinic/m4 signup role choice, 10-01).

## Parity table
| Prototype | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 00 AUTH | src/screens/auth/WelcomeScreen.tsx | overline, serif title, camel rule, tagline, filled Get started -> CreateAccount, Log in link -> Login, bone page, room under the status bar, no Roman | small TGP wordmark above (entry item 1: TGP, never GP). The old "Have a code from your coach?" note is gone (the prototype has none; the code path is now the role step's "I have an invite code" link and the form field). |
| 01 ROLE | CreateAccountScreen.tsx role step, src/components/auth/RoleChoice.tsx | WELCOME eyebrow, question copy, two 88 pt hairline rows with serif labels, prototype sublines, radios, Continue disabled until chosen, "I have an invite code", back chevron, skipped when a code or link is present | Coachless line: the entry's "You can join a coach any time from Settings." would be untrue (Settings has no join-a-coach row, from the code); shipped "No coach code yet? You can add one after you sign up.", which is true (RoleSelection after sign-up asks for a code). The coach row shows whenever the live policy has `role_choice` (production true), the same switch as the prototype's coach-self-select flag. The form keeps its "Coach clients instead?" link (existing pathway). |
| 02 CREATE | CreateAccountScreen.tsx register step | eyebrow "Joining <coach>" / "Joining as a client", "Create your account.", Apple first, "or", email and password, invite code optional, filled Create account pinned at the bottom with the terms line under it, back chevron | FULL NAME instead of FIRST NAME (the backend keeps one display name that coaches see). PHONE (OPTIONAL) kept (existing field). The invite code field stays first, where it is today (it decides pairing and shows "You will be paired with ..." before the details). Google sits under Apple when advertised; Android shows Google only (Apple is iOS-only). Inputs keep the hairline underline (doctrine: no cream fills), not boxes. Show-password eye added (entry item 4). |
| 75 ROLE coach row | RoleChoice.tsx | "I coach clients" / "Your practice in one place: clients, programs and messages." | none |
| 76 CREATE coach | CreateAccountScreen.tsx | eyebrow "Joining as a coach", no code field | title stays "Create your coach account." (lane 134 owns the coach track). |

## Routes and actions before -> after
| Screen | Before | After |
| --- | --- | --- |
| Welcome | Sign in (filled) -> Login; Create account (text) -> CreateAccount; code note (no action) | Get started (filled) -> CreateAccount; Log in (link) -> Login; note removed |
| Role | row tap -> commits role, opens form | row tap selects; Continue -> form with that role; I have an invite code -> client form, code focused; Back -> goBack, or Welcome with no history |
| Create account | Create account, Google, Apple, Paste code, Request access (code required), Terms, Privacy, Sign in, change-role link, Log in / Reset password / Contact support / Back on signup issues, Contact support on errors | all kept, same handlers; new Back (-> role step, or leave) and Show/Hide password |
| Verify | I verified my email, Send a new link, Use a different email, Log in, Contact support | same (I verified my email is now the shared PrimaryButton) |
| Coach unavailable | Sign in to check / Create a client account instead, Check again, Contact support | same (the filled one is now PrimaryButton) |
Parity proven in tests: AuthEntryPrototype133.test.tsx (role states, invite-code link, back with and without history, provider order, one filled button, show-password, insets), WelcomeScreen.test.tsx (two actions and their targets), CreateAccountScreen.test.tsx (every field, provider, legal link and sign-in action reachable).

## Truthful sweep
Every new line is neutral or true from state: "Joining <name>" only after the server preview says the code is valid; the coachless line points to the RoleSelection step every non-coach sign-up reaches (CreateAccountScreen `navigation.replace('RoleSelection')`). No exclamation marks, no first person, no emojis, theme colours only (semantic tokens, `radius.button`).

## Tests (local, ops/heavy.sh, one file at a time, with m#577 merged)
TESTS_PLACEHOLDER

Size: SIZE_PLACEHOLDER

agent 133

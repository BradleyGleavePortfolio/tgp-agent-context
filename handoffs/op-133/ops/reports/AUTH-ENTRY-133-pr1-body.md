**Tier:** T3 (auth entry UI: copy, layout, action emphasis; no auth logic change)
**Why:** B11 B12 B13 (welcome part). The owner's install opens on a "GP" text box, a bare page and a welcome jammed under the Android status bar. Prototype 00 AUTH is the approved first screen (owner 16:20: flow about 90% the prototype, keep our button counts).
**T4 trigger scan:** none. No session handling, token storage, request, role or policy code is touched; WelcomeScreen only navigates.
**T3 trigger scan:** user-visible auth copy and action emphasis on the first screen.
**Bounded T1:** README rows (src/screens/auth/README.md).
**Canonical builder:** AUTH-ENTRY-133 (claude_opus_5_5), agent 133 lane. **Parent owner:** operator agent 133.
**Acceptance evidence:** jest (below), snapshots at 360x800 (insets 24/16) and 390x844 (insets 47/34), parity table. **Not seen on a device:** no phone or simulator here; nothing in this PR was seen on a device.
**Promotion triggers:** none expected; any change to auth requests or token storage would make it T4.

Part 1 of 2 for AUTH-ENTRY-133 (split to keep each PR under 800 lines). Part 2 (role and create account, prototype 01-02) is a separate PR; the two do not depend on each other.

## What changes for clients and coaches
The first screen now matches prototype 00: a small TGP wordmark (never "GP"), the overline "PERSONAL TRAINING, IN YOUR POCKET", the serif title "The Growth Project", a short camel rule and "A plan, daily targets, and a coach who knows you." Below it, one forest **Get started** (opens account creation, where the role question comes first) and a **Log in** link. Same two actions as before; the filled one is now the new-user path, as in the prototype. The page uses the shared `Screen` from m#577: insets from react-native-safe-area-context (Android and iOS) and 12 pt of breathing room under the status bar; the button is the shared `PrimaryButton` (radius.button 12, owner 17:07 rounded corners).

## Bugs
- B11 S2 welcome logo "GP" box: fixed (TGP wordmark, typography.h3, letter-spaced).
- B12 S2 welcome bare vs prototype AUTH: fixed (eyebrow, serif title, rule, tagline, Get started + Log in).
- B13 (welcome part) top of screen under the status bar: fixed (shared Screen). The sign-up steps are part 2.

## WHY / WHEN / WHO
- B11: the "GP" box came with the initial commit f861d39b (2026-03-15) and survived every redo since.
- B12: the copy "Sign in or create an account." with a filled Sign in and a text Create account came from 36d8b3b1 in m#504 (agent 128, DES-AU-127, 10-07), which simplified the page before the prototype existed.
- B13: WelcomeScreen used `SafeAreaView` from 'react-native' since f861d39b. That component pads iOS only, and the auth stack runs `headerShown: false` (AuthNavigator.tsx), so on Android nothing kept the page off the status bar.

## Parity table
| Prototype | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 00 AUTH | src/screens/auth/WelcomeScreen.tsx | overline copy, serif display title, camel rule, tagline, filled Get started -> CreateAccount, Log in link -> Login, bone page, room under the status bar, no Roman | A small TGP wordmark sits above (entry item 1: TGP, never GP). The old "Have a code from your coach? You can add it now or later." note is gone: the prototype has none, and part 2 adds "I have an invite code" on the role step (the form keeps the code field). |

## Routes and actions before -> after
| Control | Before | After |
| --- | --- | --- |
| Filled button | "Sign in" -> Login | "Get started" -> CreateAccount |
| Text action | "Create account" -> CreateAccount | "Log in" (link) -> Login |
| Code note | text, no action | removed (code entry stays on CreateAccount) |
Both destinations are still reachable from Welcome; button count unchanged (one filled, one text). Proven in WelcomeScreen.test.tsx (each press, its target, exactly two actions).

## Truthful sweep
Every line on the page is a product description or a label; nothing claims a state. No exclamation marks (test asserts), no first person, no emojis, theme colours only (semantic tokens), no hardcoded radius.

## Tests (local, ops/heavy.sh, one file at a time, on origin/main a279e1f6 + this commit)
- src/screens/auth/__tests__/WelcomeScreen.test.tsx: 4/4, 2 snapshots (360x800, 390x844)
- src/__tests__/quietLuxuryDoctrine.test.ts: 34/34
- src/__tests__/truthfulCopy.guard.test.ts: 20/20

Size: 266 changed lines without the snapshot (WelcomeScreen.tsx 191, its test 73, README 4).

agent 133

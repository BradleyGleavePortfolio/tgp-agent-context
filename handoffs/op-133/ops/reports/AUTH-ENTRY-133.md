# AUTH-ENTRY-133 (agent 133, claude_opus_5_5) — B11, B12, B13, B17; prototype 00, 01, 02 (75-76 coach row only)

Worktree /home/user/workspace/wt/AUTH-ENTRY-133-mobile, branch agent133/auth-entry-133 (off mobile main df7b8ae9).
Status: DONE, both PRs MERGED (m#588 18:33, m#591 18:37 PDT) on dual APPROVE at the READY heads. Drain 18:55: nothing open, no follow-up. m#577 merged 18:03; brought in with `git merge origin/main` (rules Q1: never rebase; the
operator mail said rebase, merge used instead). Split for the 800-line cap: m#588 welcome (00) 266 lines, m#591 role + create (01-02) 791 lines.

## Scope traced (from the code)
- B11: src/screens/auth/WelcomeScreen.tsx:30 renders a "GP" text box.
- B12: Welcome copy "Sign in or create an account.", filled "Sign in" + text "Create account" vs prototype 00 eyebrow/serif/rule/tagline,
  "Get started" filled + "Log in" link (same two actions).
- B13: WelcomeScreen uses SafeAreaView from 'react-native' (no Android inset); CreateAccountScreen root is a bare View (no top inset at all,
  header only marginTop xl), so every step sits under the Android status bar.
- B17: CreateAccountScreen 'role' step + src/components/auth/RoleChoice.tsx: surface-filled bordered cards with icons and chevrons,
  tap = commit; title "How will you use the app?".
- Production GET /api/auth/signup-policy (16:58): role_choice true, providers email/google/apple, invite code optional. So the role
  step (01) is live for every codeless signup.
- Honest-copy check: "You can join a coach any time from Settings." — Settings has no join-a-coach row (from the code; the code entry is
  RoleSelection after sign-up and Messages when coachless_home is on). Shipped instead: see PR body.

## B list
(none found beyond the entry's bugs)

## U list
(none)

## C one-liners
- C (edge): on an iOS device without Sign in with Apple the "or" divider shows with only Google (or nothing) above it.
- C (edge): with a typed code and the sharing sentence, the pinned footer is about 190 pt tall; on 360x800 with the keyboard open the form scrolls in a short window.

## PRs
- m#588 agent133/auth-entry-welcome-133 @ 759679962449a4ea48bf11d03161086734025e84 — B11 B12 B13 (welcome), points 1, 2, 5.
- m#591 agent133/auth-entry-133 @ 4790df4c83dc72f6c29d0e8d37013358f809a413 — B13 (sign-up steps) B17, points 3, 4, 5.

## Not fixed (needs operator)
- Copy: the entry's coachless line "You can join a coach any time from Settings." is untrue today (no Settings row). Shipped "No coach code yet?
  You can add one after you sign up." Default: keep; if a Settings join row is wanted, that is a new item (lane 132/133 settings).

## HANDOFF
- FINAL (18:56): m#588 merged 18:33 (Sol LN-SOL-A APPROVE, Opus LN-OPUS-A APPROVE, B none U none); m#591 merged 18:37 (Sol LN-SOL-B APPROVE,
  Opus LN-OPUS-B APPROVE, B none U none). No open PRs, no unpushed work. Operator 18:24 kept the coachless copy (REDO-SETTINGS-133 makes it
  true), so needs operator: 0.
- SAFE STOP (18:58): already stopped. PR state: m#588 MERGED @ 759679962449a4ea48bf11d03161086734025e84; m#591 MERGED @
  4790df4c83dc72f6c29d0e8d37013358f809a413. Unfinished: none (nothing unpushed, no claims held, worktree clean on agent133/auth-entry-133).
  Next agent first: nothing required. Optional later items (not started): the two C edges above (lone "or" divider on iOS without Apple;
  tall pinned footer on 360x800 with keyboard and sharing sentence).
- m#588 @ 759679962449a4ea48bf11d03161086734025e84 (agent133/auth-entry-welcome-133): Welcome = prototype 00. B11 (TGP wordmark), B12
  (eyebrow, serif title, rule, tagline, Get started filled -> CreateAccount, Log in link -> Login), B13 (shared Screen insets). 266 lines.
  CI green, clean. READY: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/588#issuecomment-6072347234
- m#591 @ 4790df4c83dc72f6c29d0e8d37013358f809a413 (agent133/auth-entry-133): Role = 01 (radio rows, one Continue, "I have an invite code",
  coachless line, back) and Create = 02 (Apple first, Google when advertised, eyebrow "Joining <coach first name>", show-password,
  OPTIONAL marks, pinned Create account + terms line), every sign-up step on the m#577 Screen/PrimaryButton (B13), B17. 791 lines.
  CI green, clean. READY: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/591#issuecomment-6072347415
- Tests run locally (heavy.sh, one file at a time): AuthEntryPrototype133 8/8, WelcomeScreen 4/4, CreateAccountScreen 80/80, FixRound5 24/24,
  FixRound6 12/12, FixRound7 12/12, CoachSharing 2/2, quietLuxuryDoctrine 34/34, truthfulCopy 20/20, copyVoice 8/8, darkMode 18/18.
- Not seen on a device: nothing; evidence is jest snapshots at 360x800 and 390x844 insets.
- Process notes: main brought in with `git merge origin/main` (never rebase, Q1) although the 18:03 mail said rebase. Split into 2 PRs for the
  800-line cap; they are independent. ResendVerificationLink.tsx untouched. No NEED files.
- Needs operator: resolved 18:24 (copy kept; REDO-SETTINGS-133 adds the Settings row).
- Differences kept on purpose (in the parity tables): FULL NAME not FIRST NAME, PHONE (OPTIONAL) kept, invite code field first, hairline inputs,
  "Coach clients instead?" link kept, coach title "Create your coach account." kept.

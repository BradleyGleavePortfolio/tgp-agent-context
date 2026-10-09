# SHOTS-134B report (agent 134, wave 1g continuation) — WORKSPACE ONLY
Started 21:43 PDT, finished 22:25 PDT 10-08. Continues SHOTS-134 (ops/reports/SHOTS-134.md HANDOFF). No PR, no push, no commit,
no product src/ change. Every PNG is a "web render, not a device"; every finding below is "seen in a web render" unless marked
"from the code". Sample data only (invented "Jordan Hale" / "Alex Morgan", example.com addresses).

Rendered head: mobile main **b8c8e8bf** (b8c8e8bf19027a50e3b1864d46dbcdab1fc480f3). Main moved during the lane (5fa5bd7b at 21:43,
b8c8e8bf at 22:13 with m#622 coach-consult routing + K3/K4, m#626 coach insets, m#630 coach card, m#633 coach home, m#636 share
link, m#605/m#606 tour). Every screen was re-rendered on b8c8e8bf. Backend read only at origin/main e2b03908.

## Log
- 21:43 read header P1-P15, WAVE 1g, SHOTS-134 HANDOFF. Fetched main (5fa5bd7b), moved the detached worktree to it.
- 21:45-22:08 extended the SHOTS-134 harness (shots134/harness): coach + client fixtures, coachless scenario, coach consultation
  resume at K1-K4 (fake api), client consultation flows (W1>P0>G1>G2>B1, coachless W1>P0>G2), auth flow with role choice
  (signup-policy role_choice true = production default, from the code: backend auth.service.ts signupRoleChoiceEnabled, desired
  state "unset" = on), CoachWizardNavigator scenario. Builds through ops/heavy.sh only.
- 22:13 fetched main again: b8c8e8bf. Moved the worktree, rebuilt, re-captured all 31 screens x 2 sizes (62 PNGs) and the 6
  before/after sheets.

## PNGs (all in /home/user/workspace/shots134/, each -360x800.png and -390x844.png; listed in shots134/INDEX.md)
Entry order: coach-home, coach-clients, coach-wizard (K0 via CoachWizardNavigator), coach-k0, coach-k1, coach-k2, coach-k3,
coach-k4, client-home-coached, client-home-coached-tour, client-home-coachless, client-progress, client-habits, onb-w1, onb-p0,
onb-g1, onb-g2, onb-b1, onb-coachless-w1, onb-coachless-p0, onb-coachless-g2, auth-welcome, auth-signup-role,
auth-signup-role-chosen, auth-signup, auth-login, auth-role, client-roman, client-roman-coachless, client-settings, coach-settings.
Before/after sheets (owner's build-7 phone screenshots left, web render right), shots134/compare/:
01-coach-onboarding.png, 02-welcome-and-role.png, 03-client-onboarding.png, 04-client-home.png, 05-roman-chat.png,
06-prototype-parity-coach.png (prototype 77-81 vs render). The personal support address visible in the owner's old Stripe screenshot
is redacted in sheet 01.

## What improved (seen in a web render, vs the owner's build-7 screenshots)
- Coach onboarding: the old wizard opened on Stripe/payouts; main now mounts the coach consultation (from the code:
  navigation/CoachWizardNavigator.tsx:986 CoachConsultationFlow). K0-K4 render close to prototype 77-81: serif questions, one
  forest CTA, chapter bar, Finish later, rounded inputs and chips, Roman's line on K0. K5-K8 are not on main yet.
- Coach Home (m#633): month-net hero "$1,840", clients/check-ins pair, "One needs you; five are steady." The square cream
  "Today's brief" / "Money" cards seen on 5fa5bd7b are gone.
- Welcome, role choice and Create account match prototype 00-02 (row choice with radio, Continue commits, "Joining as a client").
- Client onboarding is now the consultation: W1 Roman welcome, P0 consent, chapter eyebrows ("CHAPTER 1 OF 8 · GOALS"), Roman
  lines, single choice rows, chips. Coachless W1/G2 avoid "your coach".
- First-open tour card (m#605/606): Roman card, step bar, "Skip", underlined "Begin" (the near-black Begin button seen on
  5fa5bd7b is gone).
- Roman chat: bubbles, chips, rounded composer, "Not medical advice" line; coachless header reads "AI ASSISTANT".
- Clients list, Progress "The full picture", Habits, Settings: calm, rounded, consistent eyebrows.

## Findings ("seen in a web render"; none fixed, no product code touched)
1. Coachless client Home still shows "Food and water logging need active access." + filled "View access" button, macros as
   dashes — same as the owner's photo 1000021160. Not improved yet. From the code: screens/client/HomeScreen.tsx:409;
   entitlements/PaywallSheet.tsx:47 COACHLESS_TITLE 'Logging comes with coaching'; backend answers active:false for a coachless
   client. Covered by CLIENT-POLISH-134 / COACHLESS items (B22/B24) — not on b8c8e8bf.
2. Coachless consent P0 still says "The Growth Project and your coach collect…" and "your messages with your coach" for a client
   with no coach (from the code: lib/consultation/copy.ts:33). Consent copy is versioned with the server -> Proposed below.
3. Client tab bar: "Community" label truncates to "Commu…" at 360 and 390 (6 tabs). In build 7 it wrapped to "Communi/ty".
   Font metrics on a phone may differ; worth a device check.
4. Coach Home top tab strip: the last tab ("Actions") is cut at the right edge at both widths (scrollable strip). At 360 the date
   line and "GOOD MORNING, JORDAN" stack onto two lines. The serif "1" in the "At risk" row reads like a capital I.
5. Sign in: inputs use a bottom-only hairline with radius 12, so the underline curls up at both ends (from the code:
   screens/auth/LoginScreen.tsx:672-676). "CONTINUE WITH GOOGLE" is uppercase and letter-spaced on Sign in
   (ProviderTypography.button, constants/theme.ts:87/96 textTransform uppercase; LoginScreen.tsx:725) while Create account shows
   sentence-case "Continue with Google".
6. P0 consent at 360x800: the tick box is below the fold, so Continue looks disabled with no visible reason until you scroll.
7. Client Home: "Add Allergies and restrictions to set daily targets." — capital "Allergies" mid-sentence, and it says targets
   need allergies while targets are already shown. Home also has two message entry points ("Message Jordan" in the header and a
   "Message your coach" row; the row tile shows "C" when the tutorial payload has no coach name — sample-data dependent).
8. Coach consultation: K2 and K4 offer "Skip", K3 offers neither Skip nor Continue (tap a chip advances). Small inconsistency;
   check against prototype 80.
9. Roman header subtitle wraps to two lines at 360 ("AI ASSISTANT · WORKING WITH YOUR / COACH").
10. Copy check: Coach Home "Up $320 on this point in September" (screens/coach/command-center/coachHomeCopy.ts:52) reads oddly;
    "than this time in September" may be clearer. Owner's call.
Likely web-only, not counted: Settings "Haptics" switch thumb renders teal (react-native-web Switch default; code sets
thumbColor, screens/client/SettingsScreen.tsx:276-277). auth-role ("Pair with your coach") is the post-sign-in RoleSelection
screen, not the role choice; role choice is auth-signup-role.

## Harness limits (say these with the images)
react-native-web in headless Chromium, not a device; SafeAreaView from safe-area-context pads with CSS env() = 0 on web (Home);
other insets injected (360: 24/0, 390: 47/34); "9:41" is a harness marker; no keyboard, haptics, motion. Some reads have no
fixture and show their empty state: coach-home (payouts, ltv-metrics, at-risk), coach-clients (invite-codes), client screens
(community/me, insights/holistic, roman/sessions?limit=1), onboarding (consent/coach-sharing-notice), coach-settings (AI budget,
booking options, notification prefs, delete-account status, profile). Settings screens show the top of the screen only.

## Proposed (needs operator)
1. Coachless consent wording (finding 2): the consent text is versioned and server-recorded; a coachless variant needs a new
   consent version on backend and mobile. Default: include it in the next COACHLESS / CLIENT-POLISH lane, not build 8.
2. Re-run these shots after CLIENT-POLISH-134 (B22/B24 coachless Home) and COACH-CONSULT-M2-134 (K5-K8) merge, so the owner sees
   the coachless Home fixed and the whole coach consultation. Default: yes, same harness, ~10 minutes of builder time.

## HANDOFF
- State: done. Head rendered b8c8e8bf. 62 PNGs + 6 compare sheets in /home/user/workspace/shots134 (INDEX.md lists every one as
  "web render, not a device"). Notify written.
- Harness: /home/user/workspace/shots134/harness. Rebuild: `cd shots134/harness && /home/user/workspace/ops/heavy.sh ./build.sh
  dist`, then `./run_all.sh 1`, `./run_all.sh 2`, `./run_all.sh 3` (each synchronous), `python3 capture.py dist
  /home/user/workspace/shots134 coach-k0` for the flow-only K0, `python3 compare.py` for the sheets. To follow main: `git -C
  /home/user/workspace/wt/SHOTS-134-mobile checkout --detach origin/main` after fetching the clone. Scenarios: `?s=<file stem>`
  (App.tsx), fixtures in mock.ts / coachFixtures.ts / clientFixtures.ts; unmatched GETs answer 404 and are logged in
  shots134/_capture_log.json.
- Nothing pushed, no PR, no product file changed. The worktree is detached at b8c8e8bf with no edits.
- Needs operator: 2 (Proposed 1 and 2).

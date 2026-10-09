# SHOTS-134 report (agent 134, wave 1g) — WORKSPACE ONLY
Started 21:34 PDT (04:34 UTC). Worktree /home/user/workspace/wt/SHOTS-134-mobile (detached, main 382692d8).
Time box: if no screen renders by ~21:59 PDT, stop and HANDOFF.

## Log
- 21:34 started; reading code, linking deps.
- 21:36 deps linked (ops/link_deps.sh mobile). No esbuild in deps; Python Playwright is installed; chromium-1217 is present.
- 21:37 harness project made OUTSIDE src/ at /home/user/workspace/shots134/harness (package.json main index.js, app.json web-only
  metro "single" output, babel-preset-expo, metro.config.js with watchFolders [worktree, deps/mobile/node_modules], symlinks on,
  native-only modules (stripe, react-native-health(-connect), crisp, posthog, expo-sqlite) resolved to stubs/native-stub.js).
- 21:38 `heavy.sh npx expo export --platform web --output-dir dist-probe` WORKED: 21 s, 179 modules, including a relative import of
  the worktree's src/constants/colors (cross-folder resolution is fine).
- 21:39 capture.py (Python Playwright, local http server, viewports 360x800 / 390x844 at scale 2, waits for window.__SHOT_READY,
  logs console errors and window.__UNMATCHED API calls) produced /tmp/shots-probe/probe-360x800.png. It timed out on __SHOT_READY
  because dist-probe was exported before App.tsx set the flag (expected), and logged one 404 (probably favicon; not checked).
- 21:40 SAFE STOP from the operator (credits). No more bundling.

## Findings
None. No product screen rendered yet, so there are no "seen in a web render" findings.

## HANDOFF
Status: stopped on operator SAFE STOP. Pipeline proven (export plus screenshot); zero product screens captured. Nothing in any
product repo changed. No PR, no push.

Approach (keep it): a separate Expo project in shots134/harness that imports real screens from /home/user/workspace/wt/SHOTS-134-mobile
by relative path ('../../wt/SHOTS-134-mobile/src/...'), exported for web by Metro through heavy.sh, then captured by harness/capture.py:
`python3 capture.py <dist> /home/user/workspace/shots134 <screen1,screen2> [360x800,390x844]`.

Exact next steps for agent 135:
1. Rewrite harness/App.tsx as a screen switcher on `?s=` (URL query). Seed AsyncStorage `user_data` (role coach or client,
   coached or coachless) and secureStorage `supabase_token` (web falls back to AsyncStorage; see src/screenshots/seed.ts for
   the keys), then render SafeAreaProvider (initialMetrics top 24 / 47) > QueryClientProvider (retry off) > ThemeProvider >
   NavigationContainer (Root theme colours) with initialState, mounting CoachNavigator (tabs CommandCenter, ClientsStack >
   ClientsList, SettingsStack), ClientNavigator inside EntitlementProvider (tabs Home, Home > Habits, MoreTab > Progress /
   Settings / RomanChat), AuthNavigator, and the coach consultation / ConsultationOnboardingNavigator. Load the fonts with
   useFonts (Cormorant Garamond 400/500, Inter 400/500/600) before rendering. Set window.__SHOT_READY about 1.5 s after the
   first paint.
2. Mock the network by setting `api.defaults.adapter` (default export of src/services/api.ts) to a harness adapter with sample data
   (src/screenshots/fixtures.ts plus mockAdapter.ts show the client shapes; add coach endpoints). Put unmatched URLs in
   window.__UNMATCHED and add fixtures until the list is empty. Look for other fetch clients (for example
   src/services/commandCenterApi.ts).
3. Bundle with the clinic profile flags from eas.json (assumed build 8 profile: FF_CONSULTATION_ONBOARDING, FF_CLIENT_TUTORIAL,
   FF_ROMAN_CHAT, FF_MWB_PROGRAMS, FF_COMMUNITY_*, FF_COACH_BRIEF, FF_CLIENT_CALENDAR = true; USE_MOCK_COMMAND_CENTER=false) and
   EXPO_PUBLIC_API_URL / SUPABASE_URL = http://127.0.0.1:0, SUPABASE_ANON_KEY=screenshot. Run one export at a time through heavy.sh.
   Expect more native-only imports that fail on web; add them to STUBBED in metro.config.js.
4. Capture in the entry's order, write <screen>-<w>x<h>.png to shots134/, list each in INDEX.md as "web render, not a device",
   and record findings (clipped text, square corners, crowded top, overlap) as "seen in a web render".

Proposed (needs operator): default = assign the steps above to a fresh SHOTS job in the next wave, with the same time box.

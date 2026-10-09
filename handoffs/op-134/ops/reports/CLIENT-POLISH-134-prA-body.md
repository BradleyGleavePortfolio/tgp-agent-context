CLIENT-POLISH-134 (agent 134), PR A of 2: client follow-ups left by agent 133's builders. Bugs **B13 B16 B28** (B29 polish). Presentation only: no data, endpoint or navigation change.

### Items (JOBS134 CLIENT-POLISH-134)
1. **Leaderboard onto the shared `Screen`** (REDO-INSETS-133 leftover 1). Leaderboard and Leaderboard settings now take their top from `Screen` (`src/ui`, m#577): react-native-safe-area-context insets + `layout.statusBarGap` (12). The three test files that mocked `react-native-safe-area-context` without `SafeAreaInsetsContext` now give the mock the context (null = no provider = zero insets), as REDO-INSETS-133 asked. `insetsCorners133.test.tsx` no longer exempts Leaderboard from "takes the top from the Screen wrapper", and its source guards (no literal radius, no react-native SafeAreaView, no fixed top) now also cover LeaderboardSettingsScreen.
2. **Connected devices: chevrons + `radius.chip`** (REDO-DEVICES-133). The shared `ScreenTopBar` back chevron on the list, loading and error states when the stack can go back (operator 18:33 "chevrons yes"; the More stack hides the native header). The 6 pt status dot `borderRadius: 3` becomes `radius.chip` (U-594-1). No row chevrons: no row on this screen opens a detail screen (each row's one action opens the connect sheet or the disconnect confirm), and the 18:33 rule puts chevrons only on rows that open a detail screen.

### Before -> after
| Screen | Before | After |
|---|---|---|
| Leaderboard (board, loading, error, coachless) | own `useSafeAreaInsets` / `SafeAreaView`: top = insets.top, flush under the status bar | `Screen edges={['top']}`: top = insets.top + 12 (B13 B28); Back, Settings, hero, sticky self row, opt-in card unchanged |
| Leaderboard settings | own `useSafeAreaInsets`: top = insets.top; Save name button radius **4**; name field square | `Screen edges={['top']}`: insets.top + 12; Save name `radius.button` (12); name field `radius.input` (12) (B16) |
| Connected devices | no back control (swipe / Android back only); status dot radius literal 3 | `ScreenTopBar` back chevron (44 pt, shared) on list, loading and error; dot `radius.chip` |

### Parity table
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| none (no prototype screen; CATALOG luxury bar, Q5/Q10b) | src/screens/client/LeaderboardScreen.tsx | shared Screen top inset + 12 like every redo screen; rows, opt-in, Back/Settings kept | Top bar keeps its "Back" text link (not the bare chevron) to keep today's controls; horizontal rhythm stays 20 |
| none | src/screens/client/LeaderboardSettingsScreen.tsx | shared Screen top; rounded button/field tokens | none beyond tokens |
| none (CATALOG `progress-details` style back chevron) | src/screens/client/wearables/ConnectionsScreen.tsx | shared ScreenTopBar chevron like Profile (m#596) and Add a coach code (m#611) | no chevrons on rows (no row opens a detail screen) |

### WHY / WHEN / WHO
- Leaderboard insets: the screens got their own inset hooks in 27f773f3 (m#438, B-LEADER-125); REDO-INSETS-133 (m#586) moved 16 screens to `Screen` but left Leaderboard because its test mocks lacked `SafeAreaInsetsContext`.
- Leaderboard settings 4 pt button: de6cf489 (m#512), before the rounded tokens (Q10b, m#577).
- Connections dot literal radius: m#594 (REDO-DEVICES-133, 61624e69), U-594-1 from LN-OPUS-A-133. Back chevron proposed there, approved 18:33, cancelled by the 18:55 drain.

### Tests (heavy.sh, one file at a time; seen in a test)
- new `src/__tests__/leaderboardScreenInsets134.test.tsx` 6/6: board, coachless shell and settings at insets.top + 12 on 360x800 (top 24) and 390x844 (top 47).
- new `src/screens/client/wearables/__tests__/connectionsBackChevron134.test.tsx` 6/6: Back on list/loading/error goes back, only Back added to the button set, no Back outside a stack, dot = radius.chip, both phones.
- kept green: leaderboardRedo 6/6, leaderboardNameRejected 4/4, communityLeaderboardEntry 5/5, LeaderboardScreen 16/16, insetsCorners133 58/58, quietLuxuryDoctrine 34/34, connectionsRedesign133 6/6, ConnectionsScreen 37/37, ConnectionsScreen.emptyImport 5/5. `tsc --noEmit` clean, eslint clean on changed files.

### Not seen on a device
Nothing here was seen on a phone. Evidence is the test renderer at 360x800 and 390x844 only. On a device, check: Community > Leaderboard top spacing and the opt-in name field with the keyboard open (iOS padding behaviour kept); More > Connected devices back chevron on Android and iOS.

agent 134

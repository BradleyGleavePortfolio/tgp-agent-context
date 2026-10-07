Tier: T3
Why: customer-facing privacy copy: Coach sharing claimed control over what the coach sees while Apple Health / Health Connect data ignores those switches; copy-only fix, no behaviour or data change.
T4 trigger scan: none (no auth, tenancy, consent records, money, credentials or destructive data; the backend gate is the separate owner decision N3, not built here)
T3 trigger scan: privacy and consent wording shown to clients (Settings > Privacy > Coach sharing, Connect and Disconnect sheets)
Bounded T1: NO (privacy claim)
Canonical builder: Claude Opus 5.5 (CF-BODY-J3-128, agent 129)
Parent owner: operator agent 129
Acceptance evidence: 5 new tests fail on main and pass here (list below); the 4 touched test files pass locally (2 + 10 + 37 + 31 tests); CI
Promotion triggers: the owner chooses N3 (coach wearable reads follow the switches) -> the devices line must change with that backend PR

## What changes for clients and coaches
- Coach sharing (Settings > Privacy) now says it covers four logs: "Choose which of these logs your coach sees." Under the four switches one
  line says Apple Health and Health Connect are not covered by them, that the coach can see what they bring in, and that data already shared
  stays after a disconnect. A "Connected devices" row opens Connected devices. Shown where the More screen offers Connected devices (iPhone,
  Health Connect builds, tutorial); nothing changes when there is no coach.
- A client with no coach no longer reads "so your coach can personalize ..." on Connect or "your coach stops seeing ..." on Disconnect. Connect
  says the data shows activity, heart rate and sleep in Health and that a coach they join can see it; Disconnect says data already brought in
  stays in the account. Coached copy is unchanged, word for word.
- Coaches: nothing changes.

## B / U (source: ops/reports/FW-BODY-128.md)
- B2 (FW-BODY grade B, privacy claim): a coached client turns Weigh-ins and Workouts to "Not shared" and their coach still sees Apple Health
  body weight, workouts, sleep and heart rate on the Fitness and Recovery tabs. Fixed by telling the truth on that screen (smallest fix named
  in the audit). The backend gate is owner decision N3 (recommended: after launch).
- U10: coachless clients were told about "your coach" on Connect and Disconnect. Fixed.

## Truthful sweep (every new line and the fact behind it)
| Line | Fact (code) |
|---|---|
| "Choose which of these logs your coach sees." | the four switches are fitness.workouts / food_macros / body_metrics / habits_progress (src/api/coachSharingApi.ts:9) |
| "Connected devices, such as Apple Health and Health Connect, are not covered by these switches." | backend main fd190078 src/wearables/samples/wearable-samples.service.ts getSeries -> assertCoachOwnsClient: coach_id match only, no consent call |
| "Your coach can see the data they bring in" | coach ClientDetailScreen.tsx Fitness and Recovery tabs (always present) read GET /v1/wearables/samples?clientId |
| "data already shared stays with your coach after you disconnect" | fetchSamples has no connection-status filter; soft-disconnect keeps samples (same statement already in disconnectCopy.ts) |
| Coachless Connect: "so your activity, heart rate and sleep show there" | Health = WearablesShell (Fitness + Recovery); same words as the More row "View activity, heart rate and sleep" |
| Coachless Connect: "If you join a coach, your coach can see this data too." | the coach read checks the coach link only, so a coach joined later reads earlier samples too |
| Coachless Disconnect: "Data already brought in stays in your account." | soft-disconnect changes connection status only; samples stay under the user |
No first person, no exclamation marks, no emojis. The owner-account lines are unchanged and still describe the owner account; nothing
claims exclusive access.

## Routes/actions before -> after
| Screen | Label | Before | After |
|---|---|---|---|
| Coach sharing | Workouts / Food logs / Weigh-ins / Check-ins and habits switches | grant / revoke that scope | unchanged |
| Coach sharing | Try again (load failed) | re-read GET /consent/me | unchanged |
| Coach sharing | Connected devices (new row) | (none) | navigate('Connections'), same More stack (test reads ClientNavigator) |
| Connect sheet | Continue, Try again, Continue import, Open/Get Health Connect, Log in again, Cancel/Close | as before | unchanged (copy prop only) |
| Disconnect dialog | Cancel / Disconnect | close / soft-disconnect | unchanged (copy prop only) |
| Connections | Connect, Reconnect, Disconnect, pull to refresh, Try again | as before | unchanged (passes coachless to the sheet and dialog) |
Parity is proven by the existing CoachSharingScreen / ConnectionsScreen / ConnectProviderSheet tests (all still pass) plus the new row
test (press -> navigate('Connections')) and the More-stack registration test.

## Failing-first (run locally on this head's tests with main e634d19e's source files checked out)
- coachlessDeviceCopy.test.ts: "a client with no coach is not told about a coach" FAILS on main.
- CoachSharingScreen.test.tsx: "says which logs the switches cover, states connected devices, and opens Connected devices" and "an Android
  build with Health Connect: shown" FAIL on main.
- ConnectionsScreen.test.tsx: "a client with no coach: the sheet gets the coachless copy and Disconnect names no coach" FAILS on main.
- ConnectProviderSheet.test.tsx: "a client with no coach: no coach personalizes anything, and a coach they join can see the data" FAILS on main.
Everything else in those files passes on both.

## Scope, open PRs and size
- Based on mobile main e634d19e; diff kept minimal. `git diff --name-only origin/main...origin/<branch>` for every open PR on the board:
  none touches these files. src/screens/client/README.md is also edited by m#521, m#520, m#514, m#494, m#490, m#485; this PR adds one
  paragraph before "## Data flow", far from their hunks (lines 17-60).
- ConnectionsScreen.tsx and DisconnectConfirmDialog.tsx are touched only to pass the coachless flag (one hook call in ConnectionsScreen, the
  only parent of both); the sheet and dialog take an optional prop, so their other tests (which mock the user cache) are untouched.
- CF-SHARE-UI-128 (next on this screen): coachSharingCopy.ts is complete for J3; that job restyles only.
- Size: 235 changed lines (220 additions, 15 deletions; tests 125). No new dependency, no lockfile, no backend change.
- READMEs: src/screens/settings/README.md (CoachSharingScreen section), src/screens/client/README.md (coachless device copy).
- Works against current production: no new endpoint; copy and navigation only.

C (one line each)
- C: the join sentence (coach_sharing_join_v1) names the four logs, not device data; it is versioned with the backend, so a change needs both repos.
- C: iOS permission strings in app.json say "your coach" for coachless clients too (native strings; store build change).
- C (edge, deferred to 10k clients): the 403 disconnect line "contact your coach" (non-client accounts only).

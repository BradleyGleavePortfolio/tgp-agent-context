# CF-BODY-J3-128 — honest sharing copy (B2) + coachless copy (U10) (Claude Opus 5.5, BUILDER, T3 copy, mobile, agent 129)
Status: STOPPED by operator 16:36 PDT 10-07 (credits); PR open, CI was running. Source: ops/reports/FW-BODY-128.md B2, U10, job J3.
PR: growth-project-mobile#531 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/531
Branch agent129/cf-body-j3-128, head 18bec1b58536a52f6723911db85397b61d987919, based on mobile main e634d19e.
Worktree /home/user/workspace/wt/CF-BODY-J3-128-mobile. Size 235 lines (220+/15-, tests 125). PR body: ops/reports/CF-BODY-J3-128_pr_body.md.

## Open PRs touching this area (git diff --name-only origin/main...origin/<branch>, 16:12 PDT)
None of the open mobile PR branches on the board touches the files changed here. src/screens/client/README.md is also edited by
m#521, m#520, m#514, m#494, m#490, m#485 (their hunks are lines 17-60; mine is one paragraph before "## Data flow").

## Scope traced (facts the copy rests on)
- Backend main fd190078: GET /v1/wearables/samples?clientId -> wearable-samples.service.ts getSeries -> assertCoachOwnsClient
  (coach_id match only, owner bypass), no FITNESS_* consent; fetchSamples has no connection-status filter, so data already brought in
  stays visible to the coach after a disconnect (matches disconnectCopy.ts).
- Coach app: ClientDetailScreen.tsx Fitness + Recovery tabs are unconditional (HealthFitnessTab / SleepRecoveryTab).
- CF-SHARE-GATE-128 gates check-ins / dashboard / command center only, not wearables: the B2 line stays true after it.
- Production desired state: every cloud tracker credential unset -> only Apple Health / Health Connect connectable.
- Coachless signal: useCoachlessClient() (user known and no coach_id; backend user payloads carry coach_id). Read once in
  ConnectionsScreen (only parent of the sheet and the dialog) and passed as an optional prop, so the sheet tests that mock the user cache
  are untouched.

## B list
- B2 (FW-BODY): Coach sharing claimed control over what the coach sees while device health data ignores the switches. FIXED in m#531 by
  copy (the audit's smallest fix). Backend gate = owner decision N3 (not built; recommended default: after launch).
## U list
- U10 (FW-BODY): coachless Connect / Disconnect copy said "your coach". FIXED in m#531.
## C one-liners
- C: join sentence coach_sharing_join_v1 names the four logs, not device data (versioned with the backend; both repos to change).
- C: app.json iOS health permission strings say "your coach" for coachless clients too (native strings).
- C (edge, deferred to 10k clients): 403 disconnect line "contact your coach" (non-client accounts only).

## Changes (m#531)
1. coachSharingCopy.ts: intro "Choose which of these logs your coach sees. ..."; devicesNote / devicesLink / devicesLinkHint (complete,
   so CF-SHARE-UI-128 only restyles).
2. CoachSharingScreen.tsx: devices line + "Connected devices" row -> navigate('Connections') under the switches, shown where More shows
   that row (iPhone, Health Connect builds, tutorial); no-coach, loading and error states unchanged.
3. ConnectProviderSheet.tsx: onDeviceDisclosure(name, provider, coachless) + optional coachless prop; coached text unchanged.
4. disconnectCopy.ts + DisconnectConfirmDialog.tsx: coachless variant; coached text unchanged. ConnectionsScreen.tsx passes the flag.
5. READMEs: src/screens/settings/README.md, src/screens/client/README.md.

## Tests
- Local (heavy.sh, one file each): coachlessDeviceCopy 2/2, CoachSharingScreen 10/10, ConnectionsScreen 37/37, ConnectProviderSheet 31/31.
- Failing-first (this head's tests with main e634d19e source checked out): 5 new tests fail on main (1 + 2 + 1 + 1), all others pass.

## PRs
| PR | head | lines | CI | READY | Opus | Sol |
|---|---|---:|---|---|---|---|
| m#531 | 18bec1b5 | 235 | pending | not yet | - | - |

## Not fixed (needs operator)
- N3 (owner): coach access to device health data follows the Coach sharing switches (backend wearable-samples.service.ts
  assertCoachOwnsClient + wearable-insights.service.ts, T4). Recommended default: after launch; if chosen, the devices line changes with it.

## HANDOFF
- Branch agent129/cf-body-j3-128, PR growth-project-mobile#531, head 18bec1b58536a52f6723911db85397b61d987919 (all pushed; nothing local).
- Done: B2 Coach sharing devices line + Connected devices row; U10 coachless Connect/Disconnect copy; tests pass locally, 5 fail-first on main; READMEs.
- CI at 16:36: CodeQL green, "Typecheck, lint, test" in progress. READY comment NOT posted, notify written as stopped.
- Left: when CI is green at 18bec1b5, post `FIX ROUND 1 (OPENING) (CF-BODY-J3-128, agent 129) — growth-project-mobile#531 @ 18bec1b58536a52f6723911db85397b61d987919 — READY FOR AUDIT`; owner decision N3 stays open.

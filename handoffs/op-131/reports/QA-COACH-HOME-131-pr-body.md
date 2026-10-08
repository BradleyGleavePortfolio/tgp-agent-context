Tier: T2
Why: coach Home hides its only links to Stripe setup and Money while the roster numbers load or fail, colours numbers red and gold (gold fails AA), and has 12 pt, 34 pt tall top tabs. Team shows a red error next to a false "No sub-coaches yet".
T4 trigger scan: none (no auth, tenancy, PII flow, money movement, credentials or destructive data; reads and endpoints are unchanged).
T3 trigger scan: none (no API contract, route or navigator change; the Stripe and Money entries inside the header are unchanged and only stay on screen longer).
Bounded T1: NO (eight screens plus one new component).
Canonical builder: QA-COACH-HOME-131 (agent 131)
Parent owner: operator agent 131
Acceptance evidence: `src/__tests__/qaCoachHome131.test.tsx` (16 tests). Failing-first: run locally against main e1688b51, 15 failed (header gone while loading and after a failure, header mounted twice, red and gold numbers, "At-Risk" 12 pt stone tabs, generic "Unable to load ... Retry" on the four list tabs, red Team error plus "No sub-coaches yet"); the parity test (every tab and KPI tile opens its screen) passed before and after, as intended. At this head, run one file at a time: qaCoachHome131 16/16, commandCenterScreens 28/28, coachHomeAudit13 7/7, coachDay1Hunt05 6/6, coachCheckInReviewFu126 9/9, TeamManagementScreen 14/14, coachSaasBlockers 29/29, iosNonP2PSurfacesMatrix 181/181, commandCenterNavigation 11/11, quietLuxuryDoctrine 30/30.
Promotion triggers: any change to what the setup checklist or Money card links to, to the Stripe onboarding flow, or to the command-center endpoints.

## What changes for coaches/clients
Coaches: opening Home now always shows the setup checklist and the Money card at the top, also while the roster numbers are still loading (a quiet skeleton sits below them) and when the numbers fail to load (one sentence, "Roster numbers could not load.", and a "Try again" button). The header no longer flashes in, out and in on every open. Numbers are plain ink; instead of red or gold, the at-risk tile says "Need attention" (or "Needs attention" for one client) and the open alerts tile says "Waiting in Actions". The top tabs are easier to read and tap: 14 pt labels, 44 pt tall, "At risk" in sentence case. The At risk, Streaks, Inbox and Actions tabs show the same skeleton while loading and a calm sentence naming what did not load, with "Try again". On Team, a failed load says "Your team could not load." with "Try again", without red, and no longer also claims "No sub-coaches yet". Clients: nothing changes.

## B/U list (AUD-FIN-DESIGN-129)
- U1 (fixed, seen in a test): setup checklist and Money card hidden while loading (R1) and after a failed read (R2). Now rendered in every state, with SkeletonScreen or LoadFailedNotice below.
- U2 (fixed, seen in a test): red #B91C1C and gold #C5A253 numbers (R3). Values are ink; the need is said in words. KpiTile no longer has a `valueColor` prop (its only other user, MoneyScreen, never passed one).
- U3 (fixed, seen in a test): 12 pt stone tab labels, 34 pt tabs, "At-Risk" (R7). Now `typography.bodySmall` (Inter 14 pt), `textMuted` (4.9:1 on bone) / `accentText` from `useTheme().semanticColors`, `minHeight: 44`, "At risk".
- U4 (fixed, seen in a test): Team red error plus the false empty line (R4). Now LoadFailedNotice; the empty line renders only when the read succeeded.
- C7 (fixed, seen in a test): header flash from the 'idle' first frame. Overview starts in 'loading'; the header keeps its place in both returns and mounts once.
- New shared piece: `src/components/coach/LoadFailedNotice.tsx` (one `textPrimary` sentence, forest `accentText` "Try again" text button on HapticPressable, 44 pt, no red, icon or fill). CoachErrorState was not used because it carries a red chip and an avatar.

## Routes/actions before -> after
| Label | Before | After |
| --- | --- | --- |
| Setup checklist and Money card (Home header) | shown only once numbers loaded | shown in loading, error and data states; mounted once (tested) |
| Overview retry | "Retry" -> getOverview again | "Try again" -> getOverview again (tested) |
| Clients at risk tile | opens At risk tab | same (tested) |
| Active streaks tile | opens Streaks tab | same (tested) |
| Unread messages tile | opens Inbox tab | same (tested) |
| Open alerts tile | opens Actions tab | same (tested) |
| Top tabs Overview / At risk / Streaks / Inbox / Actions | switch tab | same (tested) |
| Pull to refresh (all five tabs) | reload | same |
| At risk / Streaks / Inbox / Actions retry | "Retry" -> reload | "Try again" -> reload (tested) |
| Rows: at-risk, streak and alert rows -> onSelectClient; inbox rows -> onOpenThread; Dismiss | as before | unchanged code; covered by commandCenterScreens and coachHomeAudit13 |
| Team retry | "Tap to retry" line -> load | "Try again" button -> load (tested) |
| Team Invite | opens SubCoachInviteModal | same; still shown when the load failed (tested) |
| Team sub-coach card | opens SubCoachDetail | unchanged code |

## Truthful-copy sweep
- "Unable to load roster data. Check your connection and try again." -> "Roster numbers could not load." The cause is not always the connection, so no cause is claimed. Same pattern: "At-risk clients could not load.", "Win streaks could not load.", "The inbox could not load.", "The action queue could not load.", "Your team could not load."
- "No sub-coaches yet. Tap Invite to add your first one." now appears only when the read succeeded and returned none.
- "Need attention" / "Needs attention" matches the tile's existing screen-reader label ("clients need your attention"). "Waiting in Actions" is true: the tile opens the Action Queue, which lists the same open alerts (FU-CHECKIN-126).
- No first person, no exclamation marks, no emojis, no new hex literals; colours come from the theme.

## Docs
- `src/screens/coach/command-center/README.md`: states, skeleton and calm error, Home header rule, monochrome numbers, tab spec, LoadFailedNotice, test coverage.
- `src/components/README.md`: LoadFailedNotice row.

## Not in this PR (needs operator, defaults in brackets)
- KpiTile keeps its cream fill on bone [leave].
- Team CapacityBar and ScoreBadge still colour-code red / gold, and Team still loads with a spinner [separate redo lane].
- CoachLtvDashboard keeps its own older error copy [separate lane].
- A failed pull-to-refresh keeps the old numbers without a notice [leave].
- LoadFailedNotice could become the shared calm error for other coach screens [reuse after merge].

agent 131

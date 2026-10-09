**COACH-HOME-134 (agent 134).** The coach's first tab (Command Center › Overview) built to `design-targets/mobile/coach-home-solo` for every coach (owner 20:5x: "the home target solo is amazing"). Head coaches get the same layout with today's Home cards (setup checklist, brief, Money) below it; the head-coach target is not built (operator 21:00).

Bugs: **B29** (pages not world-class: the coach Home), **B13 / B28 / B39** (coach side: the tab row sat flush under the iPhone status bar, with an iOS-only offset; now the shared `Screen` gives insets.top + 12 on both platforms), **B16** (no rectangle card on this screen: the urgent card uses `radius.card`).

Lines: 595 + 201 = 796 (tests count, no snapshots). No new endpoints, routes or flags.

## Parity table — coach-home-solo (`design-targets/mobile/coach-home-solo/luxury.jpg`)

| Target element | Today's file | Status | What matches | What differs and why |
|---|---|---|---|---|
| Top inset under the status bar | `CommandCenterScreen.tsx` | built | Shared `Screen edges={['top']}`: insets.top + 12 (`layout.statusBarGap`) | Same on Android and iOS (was iOS + 0, Android + 8) |
| Overline row: date left, greeting right | `CoachHomeSections.tsx` `HomeOverline` | built | `QuietOverline` 11 pt caps, hairline under it; "Thursday, October 8" / "Good evening, Sarah" | First name from the signed-in profile; without one, the greeting alone. Tabs stay above it (every tab still reachable) |
| "JUNE SO FAR" | `EarningsHero` | built | "October so far" overline | — |
| Hero "$14,280" | `EarningsHero` | built (real figure only) | Cormorant 64/80 (1.25x, Android-safe), tabular, one line; net to the coach for the calendar month so far | Shown when the month has a charge or a nonzero net (head-coach split income, refunds of earlier sales: B-633-SOL-D-134-1). Otherwise "No earnings yet this month." + "Client payments land here as they come in."; a sub-coach reads "Payments run through your head coach's practice."; a failed read says "This month's earnings could not load." with Try again. Never a $0 hero or a dash |
| "up $620 vs May" | `EarningsHero` | adapted | "Up $620 on this point in September" from the server's `changeCents` against the same span of last month | Plain words, no arrow; accent ink when up, muted when down (never red); hidden with nothing to compare |
| "10 days in, on pace for $18,400" | `EarningsHero` | built | Same sentence | The pace appears from day 7 with a positive net (an early-month pace is noise); "3 days in" before that |
| MRR, last 6 months (bars) | — | left out (no data) | — | No monthly history exists: `ltv-metrics` returns only current MRR and the MRR 30 days ago. No invented bars |
| Stat row: Students 47 "+3 this month" | `StatRow` | adapted | Hairline three-up row, small-caps label, serif number: Clients `roster_size`, "8 active today" (`active_today`) | "Clients" is the app's word. "+3 this month" left out: no new-clients-this-month field |
| Retention 94% | `StatRow` | built (real only) | 100 - `churn_rate_pct` (cancels this month / active at month start), "this month" | Hidden without a real base (no active clients, or no churn and no MRR a month ago). The free cell then shows Check-ins (7-day rate) |
| Next payout $3,840 "lands Friday" | `StatRow` | built (real only) | Stripe's next pending/in-transit payout (`coachMoneyApi.payouts`), "lands Friday" / "lands Oct 20" / "on its way" | Hidden when Stripe has none or Connect is not set up; Check-ins fills the cell |
| "See full earnings" | `OverviewScreen.tsx` | built | Quiet text link | Opens Money (`SettingsStack › CoachMoney`, the Money card's route) |
| "YOUR STUDENTS TODAY" + "Three need you; Forty-four are steady." | `OverviewScreen.tsx` | built | "Your clients today" overline; serif sentence from `roster_size` and `at_risk_count` ("Three need you; nine are steady.", "All 47 are steady.") | "clients", the app's word |
| MOST URGENT card (photo, name, italic reason, "Send a message") | `ClientCard urgent` | adapted (monogram) | `radius.card` hairline card, "Most urgent" overline, serif name, italic `top_factor`, "Active yesterday" from `last_active_at`, "Send a message" → the client's thread; card → the client's file | Clients cannot upload a photo (no upload endpoint, no picker) and `AtRiskEntry` has no `avatar_url`, so the face is the `MonogramBadge` (56 pt initials). Never a silhouette or grey circle |
| Two client rows with photos and time | `ClientCard` | adapted (monogram) | The next two at-risk clients (server order, most urgent first): 36 pt monogram, name, reason, last active, chevron → file | Same monogram reason |
| "View all 47" | `OverviewScreen.tsx` | built | Quiet text link | Opens the Clients list |
| Bottom tab bar (4 icons) | `CoachNavigator` | not in this entry | — | Navigator unchanged |

Kept from today (not in the target; entry: keep every real number, card and action): the five top tabs; At risk ("Need attention"), Open alerts ("Waiting in Actions"), Unread messages, Active streaks and Check-ins as hairline rows, each opening its tab; the Home cards (setup checklist, brief, Money), now below today's clients; the LTV dashboard, now only once there are clients.

**coach-home-headcoach**: not built (operator 21:00). Head coaches see the solo layout; their Money card stays below it.

**No clients** (K-LAND 86 sends new coaches to Clients): the overline, "No earnings yet this month.", "Your clients today", "No clients yet." + "When a client joins, the one who needs you most shows here first." and a quiet "Go to Clients". No stat row, no 0%, no dash wall (the LTV block of dashes is hidden).

## Before -> after

| Screen | Before | After |
|---|---|---|
| Overview (`OverviewScreen.tsx`) | Setup/Money cards on top, then a grid of six boxed KPI tiles ("8 of 12" active, 60% check-ins, at risk, streaks, unread, alerts), then the LTV dashboard (dashes for a new coach) | Date + greeting, one serif month-so-far hero (or one calm line), hairline stat row, "Your clients today" with the most urgent client first, count rows, then the Home cards and LTV dashboard |
| Command Center host (`CommandCenterScreen.tsx`) | `useSafeAreaInsets` with `insets.top + (Platform.OS === 'ios' ? 0 : 8)`: tabs flush under the iPhone status bar | Shared `Screen edges={['top']}`: insets.top + 12 on both, theme background |

## Data (existing reads only)

`commandCenterApi.getOverview` (roster, active today, check-ins, at risk, alerts, unread, streaks), `getAtRisk` (urgent card and rows), `getLtvMetrics` (churn for retention), `GET /v1/coach/money/summary` with a calendar-month window (the Money screen's endpoint; `toSummary` rejects any other window), `coachMoneyApi.payouts` (next payout). Each read settles on its own; only the newest load writes.

## Not seen on a device

Nothing here was seen on a phone. Rendered only through jest at 360x800 (24 pt inset) and 390x844 (47 pt inset): `src/__tests__/coachHome134.test.tsx`. Not seen: real Stripe payout dates, long amounts shrinking to fit, large text sizes, the serif on an Android device.

## WHY / WHEN / WHO

- The tile grid and the cards above it: Command Center from bab0c117 (#112, 2026-05-12); cards added by 4522eb8e (2026-10-03); calm states by da05524f (#554, QA-COACH-HOME-131, 2026-10-08). Built as a KPI dashboard, never against a luxury target.
- The flush top on iPhone: 88da5311 (#433, AUDIT-13-125, 2026-10-06) used `insets.top + 0` on iOS (B39 iPhone-only wrapper).
- The 0-client dash wall: the LTV dashboard renders dashes without clients (65a15bee, #157); d468e2f7 (#414, HUNT-05-124) removed the red 0% but kept the tiles.

## Tests (each file alone, local)

`coachHome134` 11/11 (new; split-income and refund-only months added in fix round 2), `qaCoachHome131` 16/16, `coachHomeAudit13` 7/7, `coachDay1Hunt05` 6/6, `commandCenterScreens` 28/28, `coachCheckInReviewFu126` 9/9, `commandCenterNavigation` 11/11, `quietLuxuryDoctrine` 34/34, `copyVoice.guard` 8/8, `safeAreaInsets133` 17/17; `tsc --noEmit` clean; eslint clean on changed files. Updated expectations (from the code): "8 of 12" became "8 active today" under Clients; the no-clients test now expects the calm line instead of a "—" check-in tile; the tab-row source test now expects the shared `Screen`.

Outside this entry (proposed to the operator, not in this PR): the Money card's red attention pill and the square boxed Home cards below.

agent 134

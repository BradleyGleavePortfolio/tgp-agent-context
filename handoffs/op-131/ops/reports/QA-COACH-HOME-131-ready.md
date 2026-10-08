FIX ROUND 1 (OPENING) (QA-COACH-HOME-131, agent 131) — growth-project-mobile#554 @ da05524f07dcca64465e50634d62478e4887a1fe — READY FOR AUDIT

Entry: FIX_PLANS_130_131 C3 QA-COACH-HOME-131 (AUD-FIN-DESIGN-129 U1-U4, C7). Based on main e1688b51, no conflict.

- U1 (seen in a test): the setup checklist and Money card render in loading, error and data states, mounted once; SkeletonScreen or LoadFailedNotice "Roster numbers could not load." + Try again below them.
- U2 (seen in a test): KPI values are ink; "Need attention" / "Needs attention" and "Waiting in Actions" say the need in words. KpiTile `valueColor` removed (MoneyScreen never passed it).
- U3 (seen in a test): top tabs Inter 14 pt, textMuted (4.92:1 on bone) / accentText from the theme, minHeight 44, "At risk".
- U4 (seen in a test): Team failed load says "Your team could not load." + Try again, no red, and hides "No sub-coaches yet".
- At risk / Streaks / Inbox / Actions (seen in a test): skeleton while loading, calm named error with Try again.
- C7 (seen in a test): starts 'loading', header mounts once (no flash).
- Parity (seen in a test): all five tabs, the four KPI tiles, every Try again, Team Invite.

Evidence: `src/__tests__/qaCoachHome131.test.tsx` 16 tests; 15 failed on main e1688b51, all pass at this head. Related suites pass locally one file at a time (commandCenterScreens, coachHomeAudit13, coachDay1Hunt05, coachCheckInReviewFu126, TeamManagementScreen, coachSaasBlockers, iosNonP2PSurfacesMatrix, commandCenterNavigation, quietLuxuryDoctrine); `tsc --noEmit` clean. CI green at this head.
Size: 13 files, 764 changed lines. No new casts, empty catches, dependencies, lockfile edits or hex literals.
Not in this PR (defaults in the PR body): KpiTile cream fill, Team CapacityBar / ScoreBadge colours and spinner, CoachLtvDashboard error copy, stale numbers after a failed refresh.

agent 131

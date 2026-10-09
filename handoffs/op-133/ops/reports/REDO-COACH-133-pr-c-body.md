[133] REDO-COACH-133 PR (c) of 3. QA-COACH-SET-129 (AUD-FIN-DESIGN-129) plus the R3 visual pass on coach Settings. Owner 17:10 "start the mobile redesigns that were unfinished", ruling 17:07 (Q10b) rounded corners. Builds on DS-PRIMITIVES-133 (#577).

- **Tier:** T2, mobile presentation only.
- **Why:** coach Settings still used a sans 28/500 title under a fixed 60 pt top, 13 pt uppercase section headers, cream card fills with 4 pt corners, 11-12 pt text, Title Case labels and a red Sign out.
- **T4 trigger scan:** none. Sign out, password change, bio save, account deletion and cancel-deletion keep their handlers, endpoints and confirmations; only their look and the sign-out dialog's case change.
- **T3 trigger scan:** none. No route, param, flag, navigator, dependency or lockfile change; every `navigate(...)` target is unchanged.
- **Bounded T1:** `settings/styles.ts`, the header, section headers, label case.
- **Canonical builder:** REDO-COACH-133 (agent 133 lane). **Parent owner:** agent 133 (coach files claimed for agent 134 until it starts).
- **Acceptance evidence:** tests below at this head. Not seen on a device.
- **Promotion triggers:** none found.

## What changes for coaches
- Title "Settings" is the shared serif `Headline` (h1 32/40) under the real status-bar inset (`insets.top + 12 + 12`), not a fixed 60 pt.
- Every section opens with the shared 11 pt `Overline` (was 13 pt uppercase).
- Profile: a "Coach" overline over the name in serif (h2), the email below, a hairline initials circle, a hairline under the block; no cream card.
- Sections are rounded hairline groups (`radius.card` 16, no fill), rows are 56 pt with hairline dividers, values use the theme text colours, and the Active clients count and AI credits percent read in serif tabular numerals.
- Bio and password dialogs: bone card with 16 pt corners, serif title, rounded hairline inputs (`radius.input`), 48 pt rounded buttons (`radius.button`); the counter is 13 pt.
- Sign out is a quiet outlined ink button with 12 pt corners; it is not an alarm, so no red. Delete my account keeps the error colour.
- Sentence case on visible labels: Client management, Active clients, Invite codes, Coach tools, Workout builder, Booking inbox, Appointment types, Time off, Blocked users, Change password, Edit bio, Privacy and data, Trust and privacy, App preferences, Booking options, Coach edition, Sign out (row and dialog). Accessibility labels are unchanged (tests and screen readers rely on them).

## B/U list
- U5 ("—" while the client count loads or fails): ALREADY FIXED ON MAIN by COACH-SETTINGS-131 (`formatClientCount(null)`, SettingsScreen.tsx:52-60), covered by `SettingsScreen.coachSettings131.test.tsx`. Dropped (R1).
- U9 (Notification preferences through `ClientsStack`): ALREADY FIXED ON MAIN (`navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false })`, :303-305). Dropped (R1).
- U R3.1 sans title + fixed 60 pt top: fixed. U R3.2 13 pt uppercase section headers: fixed. U R3.3 cream fills, radius 4 / 2: fixed. U R3.4 text below 13 pt: fixed. U R3.5 Title Case: fixed. U R3.6 red Sign out: fixed.

## WHY / WHEN / WHO
- Title, fixed 60 pt top, section headers, cream sections and the red Sign out: f861d39b "Initial commit" (2026-03-15); the styles moved into `settings/styles.ts` in 8cbde425 (2026-05-17, "security hardening v1 ... screen splits") and onto theme colours in cff8ad0e (#74), both without a visual change. The radius 4 / 2 comments date from the doctrine's square-corner rule (df82d6eb, #52), which the owner reversed at 17:07.

## Parity table
| Reference folder | File | What matches | What differs and why |
|---|---|---|---|
| coach-home-solo | SettingsScreen.tsx, settings/* | bone page, serif title, 11 pt overlines, hairlines, generous 24 pt gutters, serif tabular number, quiet text colours | The reference is coach Home, not Settings: there is no Settings target, so its language is applied to the existing rows. Groups are rounded hairline cards (owner 17:07) rather than flat rows. No filled forest button on this screen: nothing here is a primary action. |
| drafts-queue | settings dialogs | serif title, one filled forest action (Save) and a quiet Cancel | Corners rounded per the owner. |

## Routes/actions before -> after
All rows, toggles and dialogs stay, with the same handlers and targets: Billing, BlockedUsers, BothPillars, ClientsStack > BulkInvite / CoachBookingInbox / CoachBookingOptions / CoachInvites / CoachTimeOff / CoachWorkoutBuilder / FeaturedCoachEditor / InviteCodes / NotificationPreferences, CoachConnect, CoachMoney, CoachPackagesList, CoachTeamProfile, DataExport, DeleteAccount, ImportData, RomanChat, RomanConversations, SupportInbox, TrustCenter; bio and password dialogs; haptics toggle; cancel deletion; sign out. Before -> after: identical; no row added or removed.

## Truthful sweep
No new claims; copy changes are case only. Theme colours only (the dialog veil `rgba(0,0,0,0.7)` is unchanged and pre-existing). No new motion. Radii from `radius.*` except the 28 pt avatar circle (half of 56).

## Evidence (tests run locally at this head, one file at a time through heavy.sh)
New `screens/coach/__tests__/coachSettingsLook133.test.ts` 6/6; SettingsScreen.coachSettings131 + coachSettingsMoneyRow 20/20 (theme mocks gain `semanticColors` for Headline / Overline); imessageDmRoutes, romanConversationsReachable (source literal now `<Overline style={styles.sectionHeader}>`), coachSettingsTruthfulness (`Workout builder`), coachBookingOptions, coachSaasBlockers, romanFlagOff 63/63. TeamProfile132 + CoachBillingScreen.backendShape 25/25 (their theme mocks also gain `semanticColors`; the first CI run failed on exactly these two mocks, fixed at this head). `tsc --noEmit` clean for touched files; eslint 0 errors. Not seen on a device or simulator.

README: `src/screens/coach/README.md` SettingsScreen row (doctrine section 8).

agent 133

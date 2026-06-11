# External UI/UX Audit — Main-Branch Coach Screens (2026-06-10)

**Source:** External auditor (verbatim, Dynasia-supplied)
**Scope:** Currently-shipped coach screens on `growth-project-mobile` **main** (NOT the v1-6 PR #231 community surfaces)
**Repo HEAD at audit:** `76b1a48a87b1f67a4ced35c4a10d742454346360` (post PR #230 safe-area pack merge)
**Captured by:** Computer orchestrator on behalf of Dynasia (CPO) — seeded this thread

---

## Overall Rating: 6.5/10

The bones are solid — theming system, haptics, skeletons, accessibility labels — all genuinely good engineering. But several UI decisions are eye-wateringly bad.

---

## 10 Things That Are ASS / Hurt My Eyes

### 1. CoachHomeScreen — `paddingTop: 60` hardcoded everywhere

Every screen just slaps `paddingTop: 60` at the top and calls it a day. That's not safe area handling — that's a prayer that nobody uses a phone taller or shorter than an iPhone 12. On Android or newer notched devices, this will clip content directly under the status bar or leave a comically large dead zone. Use `useSafeAreaInsets()` or `<SafeAreaView>`. This same crime is committed in `ClientsListScreen`, `RiskBoardScreen`, and more.

### 2. CoachHomeScreen — Mixed `borderRadius` values with no system

You have `borderRadius: 4` (labeled `// radius.lg`), `borderRadius: 2` (labeled `// radius.md`), and `borderRadius: 999` all in the same screen. `radius.lg = 4px` is microscopic — that's basically a sharp corner. The comment says "lg" but 4px looks like you forgot to round it. Meanwhile the invite pill uses `borderRadius: 999` for a pill. There's no visual consistency and the radius tokens are clearly mislabeled.

### 3. ClientDetailScreen — 9 tabs in a horizontal scroll with icons AND text

There are nine tabs: Summary, Logs, Plan, Progress, Fitness, Recovery, Workouts, Timeline, Weekly. That is too many tabs. The user has to scroll horizontally just to discover that Timeline and Weekly exist — those are essentially the same concept. The horizontal tab scroll means there's zero visual affordance that more tabs exist beyond the viewport. A coach opening this screen for the first time has zero idea that Sleep/Recovery or Weekly tabs are even there.

### 4. ClientDetailScreen — `TouchableOpacity` mixed with `HapticPressable`

The header back button, the message button, and the archive button all use raw `TouchableOpacity`, while the rest of the app uses `HapticPressable`. This is inconsistent — some taps get haptic feedback, others don't, with no logic behind which ones do. The archive icon in the header is especially jarring because it's a destructive action and the most important one to confirm with haptics, yet it uses the plain `TouchableOpacity`.

### 5. RiskBoardScreen — CormorantGaramond serif title on a data dashboard

The Risk Board title uses `fontFamily: 'CormorantGaramond_400Regular'` at `fontSize: 32`. Cormorant Garamond is an elegant editorial serif — it's completely wrong for a churn-risk data board used by a coach triaging clients in distress. It looks like a wedding invitation header above a list of red-flagged clients. The subtitle under it immediately switches to `Inter_400Regular`, making the typographic clash even more glaring.

### 6. SettingsScreen — "Invite Codes (bulk)" and "Bulk invite clients" are both listed separately

In the Settings screen there are two invite-related rows in "Client Management" (Bulk invite clients → BulkInvite, and Invites & email → CoachInvites), PLUS a third row in "Coach Tools" labeled Invite Codes (bulk) → CoachBulkInvite. Three invite entry points with subtly different names pointing to different screens. A coach will click all three trying to figure out which one actually sends invites. This is a navigation information architecture disaster.

### 7. CoachEarningsScreen — `sectionTitle` text is `textTransform: 'uppercase'` at `fontSize: 13`

The section headers ("THIS MONTH", "FEES · THIS MONTH", "RECENT PAYOUTS") are uppercase at 13px with `letterSpacing: 0.4`. That's fine as a design pattern, but these tiny allcaps headers are directly followed by financial numbers at `fontSize: 22`. The visual jump from a 13px allcaps label to a 22px number with no intermediate hierarchy is abrupt and choppy. There's also no section divider — the screen is just one long raw scroll of labels and numbers with hairline borders, making it look like a raw data dump, not a financial dashboard.

### 8. ClientsListScreen — The privacy banner is always visible, forever

```tsx
<View style={styles.privacyBanner}>
  "Your students see what they share. You only see what they log."
</View>
```

This "Psych #2" privacy banner shows on every single visit to the clients list. It never dismisses. It takes up 40px of vertical space permanently above the search bar. After the 3rd visit, a coach doesn't need to be told this — it's patronizing and wastes screen real estate that could show another client card. This should be a one-time first-launch banner, not permanent chrome.

### 9. CoachHomeScreen — The `metricCard` is `width: '47%'` with `flexGrow: 1` in a `flexWrap` grid

The metrics grid uses `width: '47%'` + `flexGrow: 1` + `flexWrap: 'wrap'` with `gap: 10`. This is a recipe for jagged layouts. If a 5th metric card ever gets added, it will render as a single full-width card on the second row instead of continuing the 2-column grid. The layout has no defense against this. Use a proper 2-column grid via `numColumns` in a `FlatList` or a CSS grid equivalent, not percentage widths with flex grow.

### 10. CoachHomeScreen — "No new client signals." empty state below Quick Actions

When there are no red-flag clients and no overdue check-ins, the screen renders:

```
Recent Activity
[checkmark icon]
"No new client signals."
"Weight-trend and missed-check-in alerts will appear here when they fire."
```

This is the happy path — everything is fine! — but the copy is sterile and clinical. "No new client signals" sounds like a server health dashboard. A fitness coaching app's happy state should feel motivating, not like a monitoring console. It should say something like "All clients on track" or show a brief engagement summary. The grey checkmark icon on a grey background at the bottom of the scroll is visually forgettable.

---

## Quick Summary Table

| # | Screen | Issue | Severity |
|---|---|---|---|
| 1 | All screens | Hardcoded `paddingTop: 60` instead of safe area | 🔴 High |
| 2 | CoachHome | Mislabeled/inconsistent border radius tokens | 🟡 Medium |
| 3 | ClientDetail | 9-tab horizontal scroll — tabs are invisible | 🔴 High |
| 4 | ClientDetail | `TouchableOpacity` vs `HapticPressable` inconsistency | 🟡 Medium |
| 5 | RiskBoard | Cormorant Garamond on a data board | 🟡 Medium |
| 6 | Settings | 3 overlapping "invite" entries in different sections | 🔴 High |
| 7 | CoachEarnings | No visual hierarchy on financial numbers | 🟡 Medium |
| 8 | ClientsList | Permanent privacy banner that never dismisses | 🟡 Medium |
| 9 | CoachHome | Fragile 47% width metric grid | 🟠 Low-Med |
| 10 | CoachHome | Clinical empty state copy on the happy path | 🟠 Low-Med |

---

## Orchestrator validation notes (2026-06-10)

Spot-checked the audit against the repo:

- **#1 paddingTop: 60 confirmed** — 10+ coach screens on main still use the literal: `CoachHomeScreen.tsx:485`, `ClientsListScreen.tsx:212`, `RiskBoardScreen.tsx:268,362`, `ClientRiskDetailScreen.tsx:207`, `ClientMessagesScreen.tsx:488`, `CoachInvitesScreen.tsx:562`, `MessagesScreen.tsx:206`, `ProgramTemplatesScreen.tsx:313`, `coach/settings/styles.ts:15`. PR #230 (safe-area pack, merged 2026-06-10 02:51 UTC) only added `StatusBarBand` + push-banner inset; it did NOT migrate these literals.
- **#3 9-tab ClientDetailScreen confirmed** — `src/screens/coach/ClientDetailScreen.tsx` defines `type TabKey` and `tabs: { key: TabKey; label: string; icon: IoniconName }[]` array with all 9 tabs.
- **#6 three invite screens confirmed** — `BulkInviteScreen.tsx`, `CoachInvitesScreen.tsx`, `CoachBulkInviteScreen.tsx`, and `InviteCodesScreen.tsx` (plus `InviteCodeRedeemersScreen.tsx`) all exist as separate files in `src/screens/coach/`.

# Growth Project Mobile — UI/UX Teardown · Findings Register

**Source:** Operator-supplied teardown DOCX (`growth_project_mobile_findings.docx`), digested 2026-06-10 22:19 PDT.
**Companion to:** [`04_external_teardown_three_tier_2026-06-10.md`](04_external_teardown_three_tier_2026-06-10.md) (prose narrative of the same 35 findings).
**This file:** structured register — one row per finding, file/line citations, principle, issue, fix. Use this when scoping work or filing tickets; use `04_` when reading for argument.

## Scope

A code-grounded audit of the `growth-project-mobile` repository (Expo / React Native, TypeScript) evaluated against the Mobile App Design Intelligence framework: Miller's Law, Hick's Law, CALM, completion drive, polish-as-trust, and the 7 anti-patterns. Coverage includes both coach and client screens, the day-one and Lean onboarding flows, navigation, theme tokens, community, wearables, and AI surfaces.

## Summary

| Tier | Count | Definition |
| --- | --- | --- |
| Horrific | 13 | Things actively harming product perception |
| Mid | 12 | Not broken — but failing to differentiate |
| Dominate | 10 | Foundations that, polished further, would put the app in the Revolut / Apple / Strava conversation |

## Root-cause meta-patterns

1. **Doctrine inconsistency** — the team has the right doctrine (Lean onboarding, day-one quiet luxury, client HomeScreen restraint, wearables CALM) but applies it unevenly across the coach side, MoreScreen, and Templates.
2. **Engineering completeness ≠ UX completeness** — offline-first, idempotency keys, debounce persistence, WCAG matrix, biometric unlock, sub-coach role gating: the engineering substrate is series-B quality, the visible UX is PMF quality.
3. **Two of everything** — two onboarding flows, two bulk-invite screens, two AI stub surfaces, three color systems. Every "we will clean it up later" has not been cleaned up.

## Highest-leverage moves

- **Ship one move:** H1 + H2 + H10 — fix the navs and kill the stubs.
- **Ship two:** add D5 — composite completion rings on Home.

---

## Tier 1 — Horrific

### H1. "More" tab is a 13-item flat dump with near-duplicate items

| Field | Value |
| --- | --- |
| File | `src/screens/client/MoreScreen.tsx` |
| Lines | 27–119 |
| Principle | Miller's Law, Hick's Law, anti-pattern: graveyard menu |
| Issue | Single flat list of 13 routes (Guidance, Membership, Recipes, Fasting, Community, Profile, Settings, Report, Learn, Widgets, Grocery List, Shopping List, Prep Guide). Items 11–12 ("Grocery List" / "Shopping List") are indistinguishable. Hick's Law: choice time grows logarithmically; indistinguishable choices freeze the user. |
| Fix | Group into ≤4 chunks (Plan / Reference / You / Settings) or promote 2–3 to primary nav and demote the rest behind a single "All tools" sheet. Merge Grocery + Shopping into one list. |

### H2. Coach tab bar carries 6 destinations

| Field | Value |
| --- | --- |
| File | `src/navigation/CoachNavigator.tsx` |
| Lines | 528–593 |
| Principle | Apple HIG (5 tab max), Material 3 (3–5), Miller's Law |
| Issue | Mounts CommandCenter + ClientsStack + Templates + Messages + Team (head-coach only) + SettingsStack — six tabs. Icons compress, tap targets shrink toward 44pt floor, mental model fractures. Hierarchy also wrong: "Templates" is a sub-noun of clients and does not deserve peer status with Clients itself. |
| Fix | Collapse Templates into a Clients-stack sub-tab or a Builder FAB. Reserve the tab bar for verbs, not noun shelves. Target 5 tabs max. |

### H3. Two complete onboarding flows live in the tree simultaneously

| Field | Value |
| --- | --- |
| File | `src/screens/onboarding/`, `src/navigation/OnboardingNavigator.tsx` |
| Lines | Navigator 15–24 |
| Principle | Anti-pattern: two products in a trench coat |
| Issue | Both the 6-step Lean flow (`LeanQ1GoalScreen … LeanQ6Screen`) AND the 10-step legacy (`OnboardingStep1 … OnboardingStep10`) exist. The legacy navigator still imports all ten. Either it runs in some build path (two first impressions) or it is dead code in the user's binary — either way, confidence-killer and permanent maintenance tax. |
| Fix | Delete `OnboardingStep*` and its navigator. The Lean Q1–Q6 flow is doctrinally aligned with day-one quiet-luxury treatment. |

### H4. 40+ native Alert.alert calls contradict the team's own stated doctrine

| Field | Value |
| --- | --- |
| File | Across `LogScreen`, `ActiveWorkoutScreen`, `HabitsScreen`, `FastingScreen`, `GroceryListScreen`, `CommunityScreen`, `EditProfileScreen`, `AIWorkoutDraftScreen`, `ProgramTemplatesScreen`, `BulkInviteScreen`, others |
| Lines | 40+ separate `Alert` invocations |
| Principle | Polish-as-trust, brand integrity (Rule 8 in-app feel) |
| Issue | `src/screens/day-one/CoachPairingScreen.tsx` lines 9–13 explicitly states: "errors render below the input without an Alert (Rule 8 in-app feel — never a native modal that breaks the brand)." Day-one follows the rule; ~85 other screens violate it. Every native iOS Alert snaps the user out of the bone/cream/Cormorant world into Apple chrome. |
| Fix | Build one in-brand `ConfirmSheet` component and route every destructive confirm + error through it. Inline error states for form fields. |

### H5. Active-workout reorder UX is "Up" and "Down" text buttons

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachWorkoutBuilderScreen.tsx` |
| Lines | 14–17 (header), 302–332 (impl) |
| Principle | Polish-as-trust: the surface that does the actual labor must feel best |
| Issue | Coach reorders exercises by tapping a "Up" Pressable and a "Down" Pressable. File header confesses: "Reorder is intentionally simple — up/down arrow buttons on each row instead of pulling in a drag-and-drop dependency." A coach building a 6-exercise day taps 10–15 times to reorder. This is the coach's daily core workflow. |
| Fix | Add `react-native-draggable-flatlist` (~4 kB). One drag handle. Ship it. |

### H6. Coach Home is a five-section feature dump

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachHomeScreen.tsx` |
| Lines | 232–477 |
| Principle | CALM framework, "one peak moment" doctrine, anti-pattern: feature-fear leakage |
| Issue | Stacks `StripeSetupBanner`, `NewClientBanner`, `AIBudgetMount`, greeting + invite pill + settings, 4-metric grid, `RiskBoard` widget, Weight Trend Alerts, Overdue Check-ins, two Quick Actions rows, Recent Activity empty state. Compare to client `HomeScreen.tsx` which says "Home is one thought, not eleven." Coach side has the opposite doctrine. |
| Fix | Pick the one verb the coach needs at 8 a.m. — "Who needs me today?" — and lead with the Risk Board list. Everything else lives behind it. |

### H7. Three competing color systems in one codebase

| Field | Value |
| --- | --- |
| File | `src/theme/tokens.ts` (modern), `src/constants/colors.ts` (legacy), direct token imports (bypass) |
| Lines | Spread across 90+ screens |
| Principle | Design-system integrity, dark-mode parity, brand consistency |
| Issue | 77 screens use `useTheme()` + semantic tokens (correct). `TeamManagementScreen`, `SubCoachDetailScreen`, `ClientReassignModal`, `LeaderboardSettingsScreen`, `ReportScreen` import legacy `Colors` from `src/constants/colors`. 9 screens (including `MembershipScreen`, `CoachBriefScreen`, `AdminControlRoomScreen`, `ProfileScreen`, `PrivateCommunityHubScreen`) import `colors` as tokens directly, bypassing the theme provider. The legacy `Colors` path will not respond to dark-mode toggle. |
| Fix | Pick the `useTheme()` + semantic tokens path everywhere. Migrate the other two. Add an ESLint rule blocking direct color imports. |

### H8. Client tab bar has `tabBarShowLabel: false`

| Field | Value |
| --- | --- |
| File | `src/navigation/ClientNavigator.tsx` |
| Lines | 559–560 |
| Principle | Polish-as-trust failure, learnability research (NN/g) |
| Issue | Hides all client tab labels — icons only. Three of the five icons are ambiguous: is "+" log food or log workout? Is the silhouette profile or more? Unlabeled tabs cost first-time users ~20% slower task completion. |
| Fix | Show 10pt labels. They cost almost no pixel space and reclaim meaningful learnability. |

### H9. Coach Home "Quick Actions" is pure cargo cult

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachHomeScreen.tsx` |
| Lines | 410–460 |
| Principle | Anti-pattern: re-railing the user who is already on the rail |
| Issue | Two rows render "View Clients" (already a primary tab AND a metric card), "Messages" (already a primary tab), and "Risk Board" (already rendered as a widget above). Every Quick Action is a duplicate path to something already on the screen. |
| Fix | Remove the section, or replace with net-new actions: "Send broadcast to all clients," "Schedule check-in calls," "Bulk approve AI drafts." |

### H10. Two stub screens ship in production behind feature flags

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachBriefScreen.tsx`, `src/screens/coach/AdminControlRoomScreen.tsx` |
| Lines | CoachBrief 1–10, AdminControlRoom 1–6 |
| Principle | No-placeholder doctrine, anti-pattern: surfaces that pretend to work |
| Issue | `CoachBriefScreen`: "Daily morning brief for coaches. STUB: backend not live yet; the adapter returns an empty, stale payload." `AdminControlRoomScreen`: "STUB: backend not live; renders empty payload." Both mounted in `CoachNavigator` behind feature flags. Any flag misfire lands a paying coach on a screen rendering real copy against no data. |
| Fix | Replace with a single "Coming soon — we'll email you when this opens" card, or do not register the route until backend ships. |

### H11. Templates use a field literally named `emoji` that contains "FL", "LB", "RC"

| Field | Value |
| --- | --- |
| File | `src/screens/coach/ProgramTemplatesScreen.tsx` |
| Lines | 25–95 |
| Principle | Anti-pattern: demo-data-frozen-in |
| Issue | `interface ProgramTemplate { emoji: string; … }` is populated with two-letter abbreviations: `emoji: 'FL', 'LB', 'RC', 'MP', 'MW'`. Template cards render text where a real icon or color-coded tile should be, AND the type system lies. |
| Fix | Give each template a proper Ionicon + duotone tile (matching the wearables `recoveryTheme` pattern), or commit to a luxury monogram treatment (Cormorant initials in cream-on-forest squares). |

### H12. Duplicate `BulkInviteScreen` and `CoachBulkInviteScreen` both exist

| Field | Value |
| --- | --- |
| File | `src/screens/coach/BulkInviteScreen.tsx` (v1) and `CoachBulkInviteScreen.tsx` (legacy) |
| Lines | BulkInvite header 13–18 |
| Principle | Anti-pattern: fork the model, fork the user |
| Issue | Header confesses: "Companion to the v1 backend contract — coexists with the legacy `CoachBulkInviteScreen` (Sprint B v2). The legacy screen is preserved for now…" Both are reachable via different code paths or deep links. |
| Fix | Ship one. Delete one. Now. Add a migration log entry so the next "v3" never repeats the pattern. |

### H13. MoreScreen has 13 entries but no search and no chunking

| Field | Value |
| --- | --- |
| File | `src/screens/client/MoreScreen.tsx` |
| Lines | 1, full file |
| Principle | Information architecture, Miller's Law (companion to H1) |
| Issue | At 13 items the screen still does not include the most basic affordance the iOS Settings app uses — search. No `SearchBar`, no `SectionList`, no recent-routes tray. Same flat `ScrollView`. User memorizes positions as a memory tax this screen earned by refusing to organize itself. |
| Fix | Add a `SearchBar` at the top + group into sections + a "recent" 3-route tray. `SectionList` component swap. |

---

## Tier 2 — Mid / Uninspiring

### M1. Coach metric grid is generic stat-square 101

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachHomeScreen.tsx` |
| Lines | 281–325 |
| Principle | Tactile-data tier (Revolut, Linear, Lattice case studies) |
| Issue | Four identical white cards each with a circle icon + big number + small caption: Active Clients / Logs Today / Total kcal / Logging Rate. Functional and WCAG-passing. Also indistinguishable from a 2018 admin dashboard. All four metrics scream equally — which means none do. |
| Fix | Hierarchy between metrics: most important is large + editorial, secondary as inline pills, tertiary in a sparkline strip. |

### M2. No motion identity beyond `FadeInView` and `Animated.timing`

| Field | Value |
| --- | --- |
| File | Across screens (Reanimated 4 installed, ~0 usages) |
| Lines | n/a |
| Principle | Premium motion vocabulary (Strive, Ladder, Future) |
| Issue | Day-one welcome does one 600ms fade + lift. Coach Home wraps sections in `FadeInView`. That is the entire vocabulary. `expo-haptics` + `HapticPressable` are already wired but motion is absent. |
| Fix | Build 4–5 reusable Reanimated primitives (spring-in, number-rollup, ring-fill, badge-pop, list-settle). Apply at polish-as-trust pressure points: logged-food cell, finished-set tick, week-over-week chart. |

### M3. Client Workout screen is a six-section data buffet

| Field | Value |
| --- | --- |
| File | `src/screens/client/WorkoutScreen.tsx` |
| Lines | Full file |
| Principle | "Home is one thought" doctrine (applied on HomeScreen, missed here) |
| Issue | Stacks 3 stat cards + bar chart + muscle-group breakdown + Quick Start + Routines + Recent Workouts. Six sections, each fighting for attention. The restraint that produced the good `HomeScreen.tsx` was never applied here. |
| Fix | Pick one verb the user is here for ("Train today") and lead with that. Demote the rest behind a "More stats" tap. |

### M4. No mascot, character, or warm visual presence anywhere

| Field | Value |
| --- | --- |
| File | Brand surface, app-wide |
| Lines | n/a |
| Principle | CALM framework Part II — character absorbs negative emotion |
| Issue | Fitness is high-friction (the user is, by definition, behind on something they care about). Duolingo, Headspace, Calm all use a character or warm visual presence at friction moments. This app shows nothing when the user misses 3 workouts. |
| Fix | Add one discreet "presence" mark — a small editorial illustration, a single line of empathetic copy, a soft animation — at the friction moments. Mariage Frères monogram, not tablecloth. |

### M5. `Alert.prompt` is iOS-only and the team knows it

| Field | Value |
| --- | --- |
| File | `src/screens/client/LogScreen.tsx`, `src/screens/client/ActiveWorkoutScreen.tsx` |
| Lines | LogScreen 83 (comment); ActiveWorkout 240, 568, 776 |
| Principle | Cross-platform brand parity |
| Issue | LogScreen comment: "works on iOS + Android (`Alert.prompt` is iOS-only)." So they coded around it once. Meanwhile ActiveWorkout still calls `Alert.alert` for destructive flows ("Cancel Workout? Progress will not be saved."). Android users see different chrome than iOS users. |
| Fix | One in-brand `ConfirmSheet`. Route every destructive confirm through it. Same on both platforms. |

### M6. Community surface is structurally restrained but visually empty

| Field | Value |
| --- | --- |
| File | `src/screens/community/CommunityTabScreen.tsx` |
| Lines | Full file |
| Principle | Narrow social, deep emotion (Strava case study) |
| Issue | Cleanly enforces three Space types (Today / Hall / Cohorts) + DMs. Architecture is right. Render layer is generic React Native lists. No avatar group, no social proof, no kudos animation, no thread-card hierarchy. Strava's leaderboard is plain text — with a 200ms spring on rank change. That spring is the whole product. |
| Fix | Add one tap-and-hold Kudos primitive with a 200ms spring on giver's count + soft haptic on receiver's phone. Add "3 people you train with posted today" proof above the fold. |

### M7. AI Workout Draft review screen is a giant editable JSON

| Field | Value |
| --- | --- |
| File | `src/screens/coach/AIWorkoutDraftScreen.tsx` |
| Lines | Full file (892 lines) |
| Principle | Outcome-first synthesis (Part VII) |
| Issue | Renders the draft as nested editable inputs: weeks → days → exercises, each row a `TextInput`. Footer shows model + token + cost provenance (good — trust cue). But the review experience is a JSON form. No preview of what the client will see, no diff vs. last week's plan, no estimated session duration. |
| Fix | Add a "Preview as client" tab, a session-duration chip computed from sets × reps × rest, a diff view from previous program. |

### M8. Leaderboard renders rank with a `width:${score}%` Bootstrap bar

| Field | Value |
| --- | --- |
| File | `src/screens/client/LeaderboardScreen.tsx` |
| Lines | 46–61 |
| Principle | Typography as identity |
| Issue | `ScoreBar` is a 3pt-tall bar with `width:${score}%`. Functional. Boring. The header comment says "no celebration chrome, no emoji" — on-brand restraint, but the alternative is not chrome, it is typography. Currently looks like Bootstrap-3 progress. |
| Fix | Render rank as 60pt Cormorant Garamond next to a 1pt hairline. Animate the digit on rank-change. This is the move that fits bone/cream/oxblood. |

### M9. Empty states across the app are clinical, not warm

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachHomeScreen.tsx` (and most empty states) |
| Lines | 466–476 |
| Principle | CALM warmth on the empty state (wearables panel doctrine) |
| Issue | "No signals today" state is correct — no false positive, no celebration — but flat. The wearables team got it right: `ClientWearableInsightPanel.tsx` lines 16–25 describes "CALM warmth on the empty state … the 'we computed nothing' branch reads as a calm promise, not a failure." The rest of the app got the cold half of restraint. |
| Fix | Port the calm-promise pattern to every empty list. One sentence of warm prose + a single editorial flourish. |

### M10. Coach Settings mixes 39 buttons in one ScrollView

| Field | Value |
| --- | --- |
| File | `src/screens/coach/SettingsScreen.tsx` |
| Lines | Full file |
| Principle | Hick's Law (39 → 13 = 1.6× decision-time reduction) |
| Issue | 39 `Pressable` / `TouchableOpacity` / `HapticPressable` callsites in a single screen. Even with section headers, it is an iPhone Settings app in one route. Apple Settings handles 60+ rows by hard sectioning, hairline rules, consistent right-chevrons. This has the rows and none of the spatial choreography. |
| Fix | Split into 3 sub-screens: Account / Coaching / Workspace. |

### M11. Legacy `OnboardingStep1` collects 10 fields without progressive disclosure

| Field | Value |
| --- | --- |
| File | `src/screens/onboarding/OnboardingStep1.tsx … Step10.tsx` |
| Lines | n/a |
| Principle | Progressive disclosure (companion to H3 — content vs. existence) |
| Issue | The 10-step flow front-loaded everything. The Lean Q1–Q6 successor shows the doctrine the team has learned: only what you need, with skip affordances. The legacy version is preserved as a museum of the old way. |
| Fix | Delete it. Stop confusing your own team. |

### M12. Lean onboarding wheelpicker is custom-rolled with FlatList

| Field | Value |
| --- | --- |
| File | `src/screens/onboarding/LeanQ5Screen.tsx` |
| Lines | 11 (header) |
| Principle | Platform conventions vs. bespoke "almost right" |
| Issue | Header: "Birth year uses a FlatList-based WheelPicker — no third-party lib." Fine engineering decision. UX cost: iOS spinning drum / Android Material picker conventions are absent. Custom wheels feel "almost right" — haptic snap wrong, inertia wrong, visible-rows accessibility wrong. |
| Fix | Either invest the polish (spring decay, haptic per tick, accessible row count) or use the platform picker behind an in-brand wrapper. |

---

## Tier 3 — Room to Dominate

### D1. Client HomeScreen is a luxury good — push it further

| Field | Value |
| --- | --- |
| File | `src/screens/client/HomeScreen.tsx` |
| Lines | 1–14 (manifesto), full file |
| Principle | "One peak moment" doctrine |
| Issue | Header reads like a designer's manifesto: "Home is one thought, not eleven." Explicitly lists every section deliberately removed. Doctrinally perfect, visually still quiet. |
| Fix | Animate the date headline's first letter with a 400ms ink-bleed reveal on cold start. Add a single Reanimated ring closure when CONTINUE's underlying intent is met. Let the 2×2 number grid roll up on data-change. |

### D2. Bone/cream/ink/forest/oxblood palette is Revolut-tier — make it visible as identity

| Field | Value |
| --- | --- |
| File | `src/theme/tokens.ts` |
| Lines | 57–365 |
| Principle | Polish-as-trust, brand identity as design system |
| Issue | Two pillars (Body=forest, Wealth=oxblood), full WCAG-verified contrast matrix (e.g. "FBF7F0 on 4A0404 ~15.01:1 PASS"), semantic tokens for light + dark mode. Real design system, not starter Tailwind. But the user does not perceive it as identity yet. |
| Fix | Custom launch screen (no Expo splash). Pillar selector on first launch with 600ms cross-fade. Monogrammed app-icon variants. Subtle Body-vs-Wealth color shift on every primary CTA. |

### D3. Wearables surface is the team's best work — port its patterns app-wide

| Field | Value |
| --- | --- |
| File | `src/screens/client/wearables/ClientWearableInsightPanel.tsx`, `RevolutGlowChart.tsx` |
| Lines | Insight panel 11–32 |
| Principle | CALM framework, polish-as-trust |
| Issue | Header reads like the framework's table of contents: "Bucket tint at low saturation … Confidence chip is a NEUTRAL pill, never green-for-good … Progressive disclosure / skeleton-of-the-real-layout … CALM warmth on the empty state … Reduce-motion honoured." Doctrine-perfect. Currently isolated to wearables. |
| Fix | Port the `RevolutGlowChart` drag-glow to Workout-volume chart, Logging-rate weekly chart, Coach Logs-Today metric. One signature chart treatment = recognizable identity. |

### D4. Day-one onboarding is already executing quiet luxury — earn one moment of theatre

| Field | Value |
| --- | --- |
| File | `src/screens/day-one/WelcomeScreen.tsx`, `CoachPairingScreen.tsx`, `ReadyScreen.tsx` |
| Lines | Doctrine comments at top of each |
| Principle | Quiet luxury allows one moment of theatre per major flow |
| Issue | All three carry doctrine comments — "quiet-luxury doctrine: no celebrations," "Rule 8 in-app feel," reduce-motion respected, MMKV resume-state per step. This is what the rest of the app should feel like. |
| Fix | Add one emotionally-loaded touch — user's name in 36pt Cormorant on Ready, a 1-second hold before dashboard reveal, a single haptic on day-one-completed. |

### D5. Apple-Watch-Rings-style completion drive for daily macros + workout + habits

| Field | Value |
| --- | --- |
| File | Composite of HomeScreen + macro tracking + workout + habit data |
| Lines | n/a |
| Principle | Completion drive (Apple Activity, Duolingo streaks) |
| Issue | Currently macros + workout + habits render as separate cards/screens. Visible-but-incomplete progress is the highest-engagement primitive ever shipped. The data model already exists. |
| Fix | Composite. Single "Today" hero element on Home: three concentric arcs (macros / workout / habits) closing in real time. Tap → drill into one ring. ~2-week build, 10× retention move. |

### D6. Strava-style local Kudos in private community

| Field | Value |
| --- | --- |
| File | `src/screens/community/` |
| Lines | n/a |
| Principle | Narrow social, deep emotion |
| Issue | Scaffolding exists (`CommunitySpaceScreen`, `CommunityThreadScreen`, three Space types, realtime badges via `useCommunityBadge`). Moderation, blocking, realtime are done. What's missing is the one social primitive that creates pull. Strava's Kudos is functionally a Like, emotionally a tribe handshake. |
| Fix | Add tap-and-hold Kudos with 200ms spring on giver's count + soft haptic on receiver's phone. No comments, no shares, no algorithm. |

### D7. CALM framework on AI surfaces is half-done — finish it

| Field | Value |
| --- | --- |
| File | `src/screens/coach/CoachBriefScreen.tsx`, `AdminControlRoomScreen.tsx`, `AIWorkoutDraftScreen.tsx`, `AIMealPlanDraftScreen.tsx` |
| Lines | Various headers |
| Principle | AI transparency, trust accrual |
| Issue | CoachBrief / AdminControlRoom enforce "every AI block requires the coach to approve before posting." Wearables panel enforces "Confidence chip is a NEUTRAL pill, never green-for-good." Workout draft shows provenance chips. MealPlan draft and CoachBrief don't. |
| Fix | Add provenance chips — which model, when, on what data — to every AI surface visible to the coach. Trust accrues to apps that show their AI's homework. |

### D8. HapticPressable foundation is built — apply it as a designed vocabulary

| Field | Value |
| --- | --- |
| File | `src/components/HapticPressable.tsx`, `src/services/HapticService.ts` |
| Lines | Used app-wide |
| Principle | Polish-as-trust, sensory identity |
| Issue | `HapticPressable` wraps every primary tap with `intent="light"|"medium"|"heavy"`. Hooks everywhere. Intent-to-haptic mapping is currently arbitrary. Tesla's turn-stalk haptic vs. door-handle haptic are different on purpose — that intentionality is what users feel as premium. |
| Fix | Document the haptic-intent vocabulary (5 mappings, one card): logged-set = medium, finished workout = heavy, navigation = light, destructive confirm = custom warning. Audit every callsite against it. 2-day project. |

### D9. Offline-first write path is engineering luxury — surface it as UX

| Field | Value |
| --- | --- |
| File | `src/screens/client/ActiveWorkoutScreen.tsx`, `LogScreen.tsx` |
| Lines | Active 35–58 (architecture doc); Log 295 (toast) |
| Principle | Polish-as-trust: show competence in the chrome |
| Issue | Writes go to `expo-sqlite` with `sync_status=pending`. Sync engine pushes when connectivity allows. Retry on `NetInfo` reconnect. "Saved offline" toast exists. Most users will never notice this exists. They should. |
| Fix | Persistent micro-pill in header: "synced ✓" / "2 pending" / "sync paused (offline)". Turns hidden engineering into a daily reliability signal. |

### D10. Hand-typed comments across the codebase are an unrecognized brand asset

| Field | Value |
| --- | --- |
| File | Distributed across screen file headers |
| Lines | n/a |
| Principle | Explicit doctrine beats implicit taste |
| Issue | Codebase contains manifesto fragments: "Quiet-luxury doctrine: no celebrations, no trophy chrome, no particle burst." "Home is one thought, not eleven." "Numbers over adjectives." "Confidence chip is a NEUTRAL pill, never green-for-good." "Rule 8 in-app feel — never a native modal that breaks the brand." These are the founding text of an internal design system — sitting in `// comments`. |
| Fix | Lift into a `DESIGN_DOCTRINE.md` in repo root. Link from every screen header. Treat new PRs against it. |

---

## Cross-reference

- Prose narrative of the same 35 findings: [`04_external_teardown_three_tier_2026-06-10.md`](04_external_teardown_three_tier_2026-06-10.md)
- v1-6 mobile UX audits already in flight: [`01_v1-6_mobile_UX_DESIGN_audit_PR-231.md`](01_v1-6_mobile_UX_DESIGN_audit_PR-231.md), [`05_v1-6_mobile_UX_REAUDIT_R2.md`](05_v1-6_mobile_UX_REAUDIT_R2.md), [`06_v1-6_mobile_UX_REAUDIT_R3.md`](06_v1-6_mobile_UX_REAUDIT_R3.md)

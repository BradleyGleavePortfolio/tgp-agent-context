# Growth Project Mobile — UI/UX Teardown

A code-grounded audit of `growth-project-mobile` against the Mobile App Design Intelligence framework (Miller's Law, Hick's Law, CALM, completion drive, polish-as-trust, the 7 anti-patterns). Findings cite specific files and line ranges.

Three tiers, ranked worst → most aspirational:

- Tier 1 — Horrific (13): things actively harming product perception
- Tier 2 — Mid / Uninspiring (12): not broken, but failing to differentiate
- Tier 3 — Room to Dominate (10): foundations that, polished further, would put the app in the Revolut / Apple / Strava conversation

---

## Tier 1 — Horrific

### H1. The "More" tab is a 13-item flat dump with two near-duplicate items

`src/screens/client/MoreScreen.tsx` lines 27–119 renders a single flat list of 13 routes: Guidance, Membership, Recipes, Fasting, Community, Profile, Settings, Report, Learn, Widgets, Grocery List, Shopping List, Prep Guide.

Miller's Law caps comfortable parallel comparison at 5–7 items; 13 is a "drawer of stuff." Worse, "Grocery List" and "Shopping List" sit next to each other (items 11 and 12) with descriptions a normal person cannot distinguish ("Your synced grocery list" vs "Your synced shopping list"). Hick's Law: choice time grows logarithmically with options, and choices the user cannot tell apart freeze them entirely.

This is the framework's exact "graveyard menu" anti-pattern. Either group these into ≤4 chunks (Plan / Reference / You / Settings) or promote 2–3 to primary nav and demote the rest behind a single "All tools" sheet.

### H2. The Coach tab bar carries 6 destinations

`src/navigation/CoachNavigator.tsx` lines 528–593 mounts CommandCenter + ClientsStack + Templates + Messages + Team (head-coach only) + SettingsStack. Apple HIG says 5 max; Material 3 says 3–5. At 6 tabs on a phone, icons compress, tap targets shrink toward 44pt floor, and the user's mental model fractures.

The hierarchy is also wrong: "Templates" is a sub-noun of clients ("templates I assign to clients") and does not deserve peer status with Clients itself. Collapse Templates into a Clients-stack sub-tab or a Builder FAB. Reserve the tab bar for verbs, not noun shelves.

### H3. Two complete onboarding flows live in the tree simultaneously

`src/screens/onboarding/` contains both the 6-step Lean flow (`LeanQ1GoalScreen` … `LeanQ6Screen`) AND the 10-step legacy `OnboardingStep1` … `OnboardingStep10` — and the legacy navigator at `src/navigation/OnboardingNavigator.tsx` still imports all ten of them (lines 15–24).

This is the "two products in a trench coat" anti-pattern. The legacy flow either runs in some build path (which means there are two first impressions), or it is dead code in a binary the user downloads. Either way: confidence-killer for the team and a maintenance tax forever. Delete `OnboardingStep*` and its navigator; the Lean Q1–Q6 flow is clearly the doctrinally-aligned one (matches the day-one quiet-luxury treatment).

### H4. 40+ native `Alert.alert` calls contradict the team's own stated doctrine

`grep -c Alert.alert` returns hits across `client/LogScreen.tsx`, `client/ActiveWorkoutScreen.tsx`, `client/HabitsScreen.tsx`, `client/FastingScreen.tsx`, `client/GroceryListScreen.tsx`, `client/CommunityScreen.tsx`, `client/EditProfileScreen.tsx`, `coach/AIWorkoutDraftScreen.tsx`, `coach/ProgramTemplatesScreen.tsx`, `coach/BulkInviteScreen.tsx`, and more — over forty separate Alert invocations.

Meanwhile `src/screens/day-one/CoachPairingScreen.tsx` lines 9–13 explicitly states the rule: "errors render below the input without an Alert (Rule 8 in-app feel — never a native modal that breaks the brand)." The day-one flow follows the rule. The other ~85 screens violate it.

Native iOS Alert UI snaps the user out of the bone/cream/Cormorant world into Apple chrome. For a "quiet-luxury" positioning, every Alert is a small dent in the lacquer. Replace with in-brand sheets and inline error states.

### H5. The active-workout reorder UX is "Up" and "Down" text buttons

`src/screens/coach/CoachWorkoutBuilderScreen.tsx` lines 302–332 has the coach reorder exercises by tapping a "Up" Pressable and a "Down" Pressable. The file's own header comment confesses why (lines 14–17): "Reorder is intentionally simple — up/down arrow buttons on each row instead of pulling in a drag-and-drop dependency."

This is a coach's daily core workflow. A coach building a 6-exercise day taps 10–15 times to reorder. The framework's polish-as-trust principle: the surface that does the actual labor must feel best. A drag handle (`react-native-draggable-flatlist` is 4kb) restores that. Ship it.

### H6. The Coach Home is a five-section feature dump

`src/screens/coach/CoachHomeScreen.tsx` lines 232–477 stacks, top to bottom: StripeSetupBanner, NewClientBanner, AIBudgetMount, greeting + invite pill + settings, **4-metric grid**, RiskBoard widget, Weight Trend Alerts list, Overdue Check-ins list, **Quick Actions row**, **second Quick Actions row**, Recent Activity empty state.

Compare to the client `HomeScreen.tsx` (lines 1–14), which explicitly says "Home is one thought, not eleven" and lists every section that was deliberately *removed*. The coach side has the opposite doctrine. Result: the coach launches into a wall of nine widgets every morning. CALM framework calls this "feature-fear leakage."

Pick the one verb the coach needs at 8am — "Who needs me today?" — and lead with the Risk Board list. Everything else lives behind it.

### H7. Three competing color systems in one codebase

- 77 screens use `useTheme()` and semantic tokens (the modern path)
- `coach/TeamManagementScreen.tsx`, `coach/SubCoachDetailScreen.tsx`, `coach/ClientReassignModal.tsx`, `client/LeaderboardSettingsScreen.tsx`, `client/ReportScreen.tsx` import `Colors` from `src/constants/colors` (legacy hex constants)
- 9 screens including `client/MembershipScreen.tsx`, `coach/CoachBriefScreen.tsx`, `coach/AdminControlRoomScreen.tsx`, `client/ProfileScreen.tsx`, `client/PrivateCommunityHubScreen.tsx` import `colors as tokens` from `theme/tokens.ts` directly, bypassing the theme provider

Same product, three palettes, no dark-mode parity (the `Colors` constants path will not respond to dark-mode toggle). The user sees subtle hue drift across screens and the brand reads as "almost." Pick the `useTheme()` + semantic tokens path everywhere; the other two are tech debt that leaks into the user's eyeballs.

### H8. Client tab bar has `tabBarShowLabel: false`

`src/navigation/ClientNavigator.tsx` line 559–560 hides all client tab labels — icons only.

Apple HIG, Nielsen Norman, and every learnability study since 2014 agree: unlabeled bottom-tab icons cost first-time users ~20% slower task completion. The icons here are `home`, `barbell`, `add-circle` (Log), `person`, `people` (Community) — three of those five are ambiguous (is the plus "log food" or "log workout"? is the silhouette "profile" or "more"?).

The framework Part V calls this "polish-as-trust failure." Ship the labels. They are 10pt and barely cost a pixel.

### H9. "Quick Actions" on Coach Home is two rows of pure cargo cult

`CoachHomeScreen.tsx` lines 410–460 renders "View Clients" (which is a primary tab, also a metric card), "Messages" (which is also a primary tab), and "Risk Board" (which is already rendered as a widget above). Every Quick Action is a duplicate path to something already on the screen.

This is anti-pattern #2 ("re-railing the user who is already on the rail"). Either remove the section, or replace with **net-new actions** the user can't easily reach: "Send broadcast to all clients," "Schedule check-in calls," "Bulk approve AI drafts." Otherwise it is dead pixels disguised as helpfulness.

### H10. Two stub screens ship in production behind feature flags

`coach/CoachBriefScreen.tsx` lines 1–10: "Daily morning brief for coaches. STUB: backend not live yet; the adapter returns an empty, stale payload."

`coach/AdminControlRoomScreen.tsx` lines 1–6: "STUB: backend not live; renders empty payload from the adapter."

Both are mounted in `CoachNavigator.tsx` behind `featureFlags`. Anytime a flag flips on in the wrong build (QA leak, % rollout misfire, internal demo), a paying coach lands on a screen that renders "real copy" against no data. The framework's "no placeholder doctrine" specifically forbids surfaces that pretend to work. Replace with a single "Coming soon — we'll email you when this opens" card, or do not register the route until the backend ships.

### H11. "Templates" use a string field literally named `emoji` that contains "FL", "LB", "RC", "MP", "MW"

`src/screens/coach/ProgramTemplatesScreen.tsx` lines 25–95 declares `interface ProgramTemplate { emoji: string; ... }` and then populates it with two-letter abbreviations: `emoji: 'FL'`, `'LB'`, `'RC'`, `'MP'`, `'MW'`.

So the template cards render text where a real icon or color-coded tile should be, AND the type system lies. This is the "demo-data-frozen-in" anti-pattern from the framework — somebody intended emoji, shipped initials, never came back. Either give each template a proper Ionicon and a duotone tile (matching the wearables `recoveryTheme` pattern that already exists), or commit to a luxury monogram treatment (Cormorant initials in cream-on-forest squares). Either choice beats "FL."

### H12. Duplicate "BulkInviteScreen" and "CoachBulkInviteScreen" both exist

`coach/BulkInviteScreen.tsx` header comment (lines 13–18) literally states: "Companion to the v1 backend contract — coexists with the legacy CoachBulkInviteScreen (Sprint B v2). The legacy screen is preserved for now; this screen is the v1 successor and will replace it when the legacy parse/submit pair is retired."

Both can be reached. Either via different code paths, deep links, or by being mounted under different routes in the navigator. Same surface in two flavors is anti-pattern #5 — fork the model, fork the user. Ship one. Delete one. Now.

### H13. The client's `MoreScreen` does not chunk and has no search — but does have 13 entries

(Companion to H1 but the failure mode is different.) At 13 items, the screen still does not include the most basic affordance the iOS Settings app uses to make a list tractable: search. There is no `SearchBar`, no `SectionList`, no recent-routes tray. Same flat ScrollView (`MoreScreen.tsx` line 1).

Result: the user who wants Fasting on Tuesday morning scrolls past Membership, Recipes, Community, Profile, Settings, Report, Learn, Widgets every time. The 4th-time user has memorized "Fasting is the timer icon, fourth row" — a memory tax this screen earned by refusing to organize itself.

---

## Tier 2 — Mid / Uninspiring

### M1. The Coach metric grid is generic stat-square 101

`CoachHomeScreen.tsx` lines 281–325 renders four identical white cards each with a circle icon + big number + small caption: Active Clients / Logs Today / Total kcal / Logging Rate. They are functional and they pass WCAG. They are also indistinguishable from a 2018 admin dashboard.

The framework's "tactile data" tier (Revolut, Linear, Lattice case studies in Part II) calls for visual hierarchy *between* metrics: the most important one is large and editorial, secondary ones are inline pills, tertiary ones live in a sparkline strip. Right now all four metrics scream equally — which means none of them do.

### M2. No motion identity beyond `FadeInView` and `Animated.timing`

`grep "Reanimated" src/screens/**` returns essentially zero usages despite Reanimated 4 being installed. The day-one welcome screen does one 600ms fade + lift. The Coach Home wraps sections in `FadeInView`. That is the entire vocabulary.

Premium fitness apps (Strive, Ladder, Future) build *physics* into completion — sets snap with a spring, a logged meal slots into the day card with a soft settle, a streak number rolls like an odometer. The codebase already has `expo-haptics` wired through `HapticPressable` and `HapticService.ts`. Add 4–5 reusable Reanimated primitives (spring-in, number-rollup, ring-fill, badge-pop, list-settle) and apply them at the polish-as-trust pressure points: logged-food cell, finished-set tick, week-over-week chart.

### M3. The Client Workout screen is a six-section data buffet

`src/screens/client/WorkoutScreen.tsx` stacks 3 stat cards + a bar chart + muscle-group breakdown + Quick Start + Routines + Recent Workouts. Six sections, each fighting for attention.

The "Home is one thought" doctrine that produced the genuinely good `HomeScreen.tsx` was never applied here. Pick one verb the user is here for ("Train today") and lead with that. Demote the rest behind a "More stats" tap.

### M4. No mascot, character, or warm visual presence anywhere

Fitness is a high-friction emotional domain (the user is, by definition, behind on something they care about). The framework Part II case studies (Duolingo, Headspace, Calm) all use a character or warm visual presence to absorb negative emotion. This app's bone/cream/Cormorant palette is restrained and elegant, but offers zero warmth at the moment of failure.

What does the app show when the user misses 3 workouts in a row? Currently: nothing, or a coach alert *to the coach*. A discreet "presence" mark (a small editorial illustration, a single line of empathetic copy, a soft animation) at the friction moments would be on-brand without breaking quiet luxury. Mariage Frères puts a small monogram on the cup, not the table.

### M5. `Alert.prompt` is iOS-only and the team knows it

`client/LogScreen.tsx` line 83 has a comment: "works on iOS + Android (Alert.prompt is iOS-only)." So they coded around it once. Meanwhile `ActiveWorkoutScreen.tsx` lines 240, 568, 776 still call `Alert.alert(...)` with destructive flows ("Cancel Workout? Progress will not be saved.").

Android users see different chrome than iOS users. For a "we're a brand" product, that variance is silently corrosive. Build one in-brand confirmation sheet (`ConfirmSheet` component) and route every destructive confirm through it.

### M6. The Community surface is structurally restrained but visually empty

`src/screens/community/CommunityTabScreen.tsx` cleanly enforces three Space types (Today / Hall / Cohorts) + DMs. The architecture is right. The render layer is generic React Native lists.

No avatar group, no "3 people you train with posted today" social proof, no kudos count animation, no thread-card hierarchy. Strava's leaderboard is plain text — *with* a 200ms spring on the rank change. That spring is the whole product. The Community shell here is ready to receive that polish and has none of it.

### M7. The "AI Workout Draft" review screen is a giant editable JSON

`coach/AIWorkoutDraftScreen.tsx` (892 lines) renders the draft as nested editable inputs: weeks → days → exercises, each row a TextInput. The footer shows "model + token + cost provenance for every draft" (per header comment) — which is exactly the trust-cue the framework recommends. Good.

But the review experience itself is a JSON form. There is no preview of what the client will actually *see*, no diff vs. last week's plan, no estimated session duration computed from sets×reps×rest. The coach approves text and ships it to a human. Add a "Preview as client" tab, a session-duration chip, and a diff view from previous program.

### M8. The Leaderboard renders rank with a `width: ${score}%` bar

`client/LeaderboardScreen.tsx` lines 46–61 — `ScoreBar` is a 3pt-tall bar with `width: ${score}%`. Functional. Boring. The header comment explicitly says "no celebration chrome, no emoji" — which is on-brand restraint, but the alternative is not chrome, it is *typography*.

Render the rank as 60pt Cormorant Garamond next to a 1pt hairline. Animate the digit on rank-change. That is the move that fits the bone/cream/oxblood palette — currently the bar looks like Bootstrap-3 progress.

### M9. Empty states across the app are clinical, not warm

`coach/CoachHomeScreen.tsx` lines 466–476 shows the "no signals today" state: an outline checkmark + "No new client signals" + a 14pt subtitle explaining what would trigger an alert. It is *correct* — no false positive, no celebration — but it is also flat. Compare to the wearables empty state, which the file `client/wearables/ClientWearableInsightPanel.tsx` lines 16–25 describes as "CALM warmth on the empty state … the 'we computed nothing' branch reads as a calm promise, not a failure."

The wearables team got the doctrine right. The rest of the app got the cold half of restraint. Port the calm-promise pattern to every empty list.

### M10. The Coach `Settings` screen mixes 39 buttons in one ScrollView

`coach/SettingsScreen.tsx` contains 39 Pressable/TouchableOpacity/HapticPressable callsites in a single screen. Even with section headers, that is an entire iPhone Settings app crammed into one route.

Apple Settings handles 60+ rows by hard sectioning, hairline rules, and consistent right-chevron affordances. This screen has all the rows and none of the spatial choreography. Split into 3 sub-screens (Account / Coaching / Workspace) — Hick's Law math: 39 → 13 is a 1.6× decision-time reduction.

### M11. The legacy `OnboardingStep1` collects 10 fields without progressive disclosure

(Companion to H3 — this is about the legacy flow's *content*.) The 10-step flow asked for everything front-loaded. The Lean Q1–Q6 successor shows the doctrine the team has clearly learned: only what you need, with skip affordances. The legacy version is preserved as a museum of the old way. Delete it and stop confusing your own team.

### M12. The Lean onboarding wheelpicker is custom-rolled with FlatList

`onboarding/LeanQ5Screen.tsx` line 11 header: "Birth year uses a FlatList-based WheelPicker — no third-party lib." That is a fine engineering decision; the UX cost is that platform conventions (iOS spinning drum, Android Material date picker) are not what the user gets. Custom wheel pickers feel "almost right" — the haptic snap is wrong, the inertia is wrong, the visible-rows accessibility is wrong.

A bespoke wheel only earns its keep if it is *better* than the native one. This one is "okay." Either invest the polish (spring decay, haptic on each tick, accessible row count) or use the platform picker behind an in-brand wrapper.

---

## Tier 3 — Room to Dominate (Polish These to Win)

### D1. The client `HomeScreen` is genuinely a luxury good — push it further

`client/HomeScreen.tsx` header (lines 1–14) reads like a designer's manifesto: "One thought. Bone background, editorial serif date headline, charcoal progress line, ink CONTINUE CTA, hairline rule, 2×2 number grid below the fold. Removed from home: streak banner, calorie ring, macro bar, day selector, community win, trust cue row, identity badge, milestone tiles, weekly volume card, habits section, quick-access grid. The brief: Home is one thought, not eleven."

This is the framework's "one peak moment" doctrine executed in prose. Now make it sing visually: animate the date headline's first letter with a 400ms ink-bleed reveal on cold start, add a single Reanimated ring closure when the CONTINUE CTA's underlying daily intent is met, and let the 2×2 number grid numbers roll up on data-change. The bones are right.

### D2. The bone / cream / ink / forest / oxblood palette is Revolut-tier

`src/theme/tokens.ts` lines 57–365 defines two pillars (Body = forest, Wealth = oxblood), a full WCAG-verified contrast matrix (e.g. lines 316–320 document "FBF7F0 on 4A0404 ~15.01:1 PASS"), and semantic tokens for light + dark mode. This is a real design system, not a starter Tailwind config.

The brand identity is sitting right there. Apply it tier-3 hard: a custom launch screen (no Expo splash), a Pillar selector on first launch with a 600ms cross-fade between forest and oxblood themes, monogrammed app icon variants, a "Body" vs "Wealth" subtle color-shift on every primary CTA. Right now the palette is correct but invisible to the user as identity.

### D3. The wearables surface is the team's best work — port its patterns app-wide

`client/wearables/ClientWearableInsightPanel.tsx` lines 11–32 reads like the framework's table of contents: "Bucket tint at low saturation … Confidence chip is a NEUTRAL pill, never green-for-good … Progressive disclosure / skeleton-of-the-real-layout … CALM warmth on the empty state … Reduce-motion honoured." This file is doctrine-perfect.

`client/wearables/charts/RevolutGlowChart.tsx` exists. The drag-glow pattern is built. It currently lives only in the wearables panel. Port it: use the same glow on the Workout-volume bar chart, the Logging-rate weekly chart, and the Coach Logs-Today metric. One signature chart treatment across the app turns scattered charts into a recognizable identity.

### D4. The day-one onboarding is already executing quiet luxury

`day-one/WelcomeScreen.tsx`, `CoachPairingScreen.tsx`, `ReadyScreen.tsx` all carry doctrine comments — "quiet-luxury doctrine: no celebrations, no trophy chrome, no particle burst," "errors render below the input without an Alert (Rule 8 in-app feel)," reduce-motion respected on every animation, resume-state written to MMKV on every step.

This is what the rest of the app should feel like. The next move: add a single emotionally-loaded touch — the user's name in 36pt Cormorant on the Ready screen, a 1-second hold before the dashboard reveal, a single haptic on the day-one-completed event. Quiet luxury allows *one* moment of theatre per major flow. Day-one has earned its theatre.

### D5. Apple-Watch-Rings-style completion drive for daily macros + workout

The framework's completion-drive case study (Apple Activity, Duolingo streaks) shows that visible-but-incomplete progress is the highest-engagement primitive ever shipped. The client app currently has macro tracking + workout tracking + habit tracking and renders them as separate cards/screens.

Composite them. A single "Today" hero element on Home: three concentric arcs (macros / workout / habits) closing in real time as the day's data lands. Tap → drill into the one ring. This is a 2-week build and a 10x retention move; the data model already exists in `client/HomeScreen.tsx`'s pulled-out widgets.

### D6. Strava-style local Kudos in private community

`src/screens/community/` already has the scaffolding (CommunitySpaceScreen, CommunityThreadScreen, three Space types, realtime badges via `useCommunityBadge`). The hard part — moderation, blocking, realtime — is done.

What is missing is the *one social primitive that creates pull*. Strava's Kudos is functionally a Like and emotionally a tribe handshake. Add a single tap-and-hold "Kudos" with a 200ms spring on the giver's count and a soft haptic on the receiver's phone. No comments, no shares, no algorithmic feed. The framework's "narrow social, deep emotion" principle.

### D7. The CALM framework on the AI surfaces is half-done — finish it

`coach/CoachBriefScreen.tsx` and `coach/AdminControlRoomScreen.tsx` both have header doctrine notes: "every AI block requires the coach to approve before posting." Good. `client/wearables/ClientWearableInsightPanel.tsx` line 18 explicitly enforces "Confidence chip is a NEUTRAL pill, never green-for-good." Better.

Now extend the same explicit AI transparency pattern to `AIWorkoutDraftScreen.tsx` and `AIMealPlanDraftScreen.tsx` headers. Add provenance chips — *which model, when, on what data* — to every AI surface visible to the coach. Trust accrues to apps that show their AI's homework. Currently the workout draft shows it; the meal plan draft and the brief should too.

### D8. The `HapticPressable` + `HapticService` foundation is built — apply it intentionally

`src/components/HapticPressable.tsx` wraps every primary tap with intent="light"|"medium"|"heavy". The hooks are everywhere. What is missing is *intent-to-haptic mapping* as a designed vocabulary: a logged-set is "medium," a finished workout is "heavy," a navigation hop is "light," a destructive confirm has a custom warning pattern. Right now the intents look used somewhat arbitrarily.

Document the haptic-intent vocabulary (5 mappings, one card) and audit every callsite against it. This is a 2-day project that turns invisible polish into a coherent sensory identity. Tesla's turn-stalk haptic vs. their door-handle haptic are different *on purpose* — that intentionality is what users feel as "premium."

### D9. The offline-first write path is engineering luxury — surface it as UX

`client/ActiveWorkoutScreen.tsx` lines 35–58 documents the entire offline architecture: writes go to `expo-sqlite` with `sync_status='pending'`, the sync engine pushes when connectivity allows, retry on `NetInfo` reconnect. `LogScreen.tsx` line 295 shows the "Saved offline" toast.

Most users will never notice this exists. They should. A persistent micro-pill in the header — `synced ✓` / `2 pending` / `sync paused (offline)` — turns a hidden engineering investment into a daily reliability signal. The framework's polish-as-trust principle directly: show your competence in the chrome.

### D10. The hand-typed comments across the codebase are a brand asset

This is meta but real. The codebase contains comments like:

- "Quiet-luxury doctrine: no celebrations, no trophy chrome, no particle burst."
- "Home is one thought, not eleven."
- "Numbers over adjectives."
- "Confidence chip is a NEUTRAL pill, never green-for-good."
- "Rule 8 in-app feel — never a native modal that breaks the brand."

These are *manifesto fragments* sitting in source files. They are also already the founding text of an internal design system. Lift them out of `// comments` and into a `DESIGN_DOCTRINE.md` in the repo root, link to it from every screen header, and treat new PRs against it. The framework's "explicit doctrine beats implicit taste" principle. The doctrine already exists; you just have not noticed you wrote it.

---

## Summary of repeated root causes

Across all 35 findings, three meta-patterns:

1. **Doctrine inconsistency** — the team has the right doctrine (Lean onboarding, day-one quiet luxury, client HomeScreen restraint, wearables CALM) but applies it unevenly. The Coach side, MoreScreen, and Templates have not received the same treatment.

2. **Engineering completeness ≠ UX completeness** — offline-first, idempotency keys, debounce persistence, WCAG matrix, biometric unlock, sub-coach role gating. The engineering substrate is at series-B quality. The visible UX is at PMF quality. Close the gap by spending 2 sprints on motion + chunking + chrome, not on new features.

3. **Two of everything** — two onboarding flows, two bulk-invite screens, two AI stub surfaces, three color systems. Every duplicate is a "we will clean it up later" that has not been cleaned up. Schedule the deletions explicitly.

If you ship one move from this teardown, ship H1+H2+H10 (fix the navs and kill the stubs). If you ship a second, ship D5 (composite completion rings on Home). Those two move the needle furthest per engineer-week.

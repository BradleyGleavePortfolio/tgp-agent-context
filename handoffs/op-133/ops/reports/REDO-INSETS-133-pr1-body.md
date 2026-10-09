[133] REDO-INSETS-133 (APPLY-INSETS-133, PR 1 of 2). Bugs: B13, B28, B39 (status-bar tops), owner ruling 17:07 (Q10b, rounded corners). Builds on DS-PRIMITIVES-133 (m#577: `src/ui` `Screen`, radius tokens).

**Tier:** T1 (mobile presentation only).
**Why:** 14 client screens hardcode a 56/60 pt top (too tight under a notch, wrong on Android edge-to-edge), Timeline doubles its top under a native header, and every listed file carries 0-4 pt square corners the owner rejected ("I want nice rounded corners, luxurious, not rectangles").
**T4 trigger scan:** none. No auth, tenancy, money logic, PII/health data, credentials or destructive data paths change. ClientPackages / PackageCheckout / PurchaseUnpack change only their wrapper and styles; every handler, API call and purchase branch is untouched.
**T3 trigger scan:** none (no navigation, routes, API shape, flags or storage change).
**Bounded T1:** styles, the page wrapper and one RoutineBuilder layout move (Save routine becomes the pinned `Screen` footer, same button, same handler).
**Canonical builder:** REDO-INSETS-133 (claude_opus_5_5, agent 133). **Parent owner:** operator agent 133.
**Acceptance evidence:** tests below; rendered through the tests' renderer at 360x800 and 390x844. Not seen on a device.
**Promotion triggers:** none.

## What changes for clients (plain words)
- The title of each of these screens now sits a calm 12 pt under the real status bar on every phone (Android included) instead of a fixed 56/60 pt guess. Timeline loses the extra gap it had under its back bar.
- Buttons, fields, photos, message bubbles and the thread sheet have soft rounded corners (12 / 16 / 24 pt, pills for chips) instead of 0-4 pt squares. Plain hairline rows stay plain lines.
- Routine builder: Save routine stays pinned above the tab bar and rises with the keyboard.
- No button, row, route or tab was added or removed.
- Shared with coaches: `components/messaging/MessageBubble.tsx` and `ThreadV2Parts.tsx` are also used by coach threads (agent 134 please note): bubbles 16 pt, reply stub 6 pt, pin sheet top 24 pt, its Save 12 pt. Nothing else in coach files changes.

## B/U list
- B13 / B28 / B39 (top spacing, this file list): fixed. U: none found.
- Found here (from the code): Timeline adds `insets.top` under the native back-only header and `insets.bottom` above the tab bar: double gaps. Fixed.

## R1 (briefs re-checked against main df7b8ae9)
Every row in APPLY-INSETS-133 was still true; nothing dropped. MoreScreen, PlanScreen, MembershipScreen are DS-PRIMITIVES-133's (not here). Report moves to PR 2 (restyle to the progress-details reference) to keep both PRs under 800 lines.

## WHY / WHEN / WHO
- Fixed tops: `paddingTop: 60` / `56` were written per screen with no shared wrapper, from the first commit (f861d39b, initial import: Workout, Education, Grocery) and copied by later screens (6146407c #17 Messages, 75ef36de #35 RecipeDetail `top: 56`). There was no `Screen` until DS-PRIMITIVES-133.
- Square corners: the 4 pt / 0 pt values and their `// radius.lg` comments come from the luxury wave rewrites (4faec4a8 #53 "radius cleanup") enforcing doctrine rule 5 (`radius.lg = 4`), which the owner reversed at 17:07.
- Timeline double inset: #107 (e0c64dac) gave the screen its own `insets.top`; #335 (8a601887, reachability) later put it under `backOnlyHeader()`, so both apply.

## Parity table (CATALOG reference: progress-details and plan; no prototype screen for these)
| Reference | Today's file | What matches | What differs and why |
|---|---|---|---|
| progress-details (back arrow, serif title, generous top) | WorkoutScreen, EditProfile, Widgets, ClientPackages, PurchaseUnpack, CoachGuidelines, RoutineBuilder | Title band under the status bar with the same 12 pt breathing room on every phone; 24 pt gutters kept | Each screen keeps its own title/actions (owner 16:20: button counts stay) |
| plan (rounded photo tile, overline, hairline list) | RecipesScreen, RecipeDetailScreen | Recipe photos are 16 pt rounded tiles; tags and filters are pills; detail back/save sit on a top bar under the inset | No hero photo when the recipe has none (README: no decorative placeholders) |
| progress-details (hairline sections) | EducationScreen, GroceryList, PrepGuide, CoachGuidelines | Rows and sections are hairlines without boxes or corners; chips are pills; serif line heights >= 1.25 | Lesson list keeps its numbered rows |
| CATALOG universal (one forest action, rounded) | MessagesScreen + MessageBubble + ThreadV2Parts | 16 pt bubbles, rounded composer field, circular send, 24 pt sheet top; header band runs under the status bar | iMessage-style tail not added (out of scope) |
| — | LeaderboardScreen, TimelineScreen | Rounded buttons/field/progress bars | Leaderboard keeps its safe-area-context insets (already correct); Timeline relies on its native header |

## Truthful sweep
No copy changed in PR 1. No new states. Loading, empty and error states keep their copy and actions.

## Evidence (tests run locally, one file at a time)
- NEW `src/__tests__/insetsCorners133.test.tsx` (55): Grocery and PrepGuide rendered in a SafeAreaProvider at 360x800 (top 24) and 390x844 (top 47): page top = insets.top + 12, Back reachable; source guard over all 18 files: no literal radius, no `SafeAreaView` from react-native, no fixed 40-99 pt top on header/page blocks, every screen takes its top from `src/ui`, Timeline never adds `insets.top`.
- Green: EditProfile, Education, educationLaunch, GroceryOneList, GroceryPrep.parity, MessagesScreenCache/NoCoach/V2, Recipes allergens/quiet/saved, RoutineBuilder.parity, Widgets, WorkoutScreen.calm130, CoachGuidelines, purchaseUnpackScreen, TimelineScreen, Leaderboard (3), ClientPackages.purchase, PackageCheckout.buyer, workoutLogging126/2126, quietLuxuryDoctrine, truthfulCopy.guard, iosHide/iosStore/moneyClient124/clientPlansOnePlace128/coachlessGateVersionB/followUp*/clientDeadTaps126, MessageBubble, coach ClientMessagesScreen.integration, navigation homeWorkoutEntry130/trainOpensYouStack131/clientTabLabels, communityLeaderboardEntry, roman P3 host tests, ActiveWorkout persistence. `tsc --noEmit` clean.
- Fixture-only test edits: purchaseUnpackScreen + truthfulCopy.guard read the ScrollView at `<testID>-scroll` (the wrapper's id); RoutineBuilder parity's theme mock gains `semanticColors` (the wrapper reads the page colour).
- Not seen on a device: the iOS page-sheet top of PackageCheckout, the Messages composer with the keyboard open, and RoutineBuilder's footer above the keyboard on Android.

## Reviewer checklist
- [x] No `fontWeight: '700'`/`'800'`; no "Coming Soon"; no emoji; no exclamation marks.
- [x] Corners use the semantic radius tokens; no literal radius; no 0-4 pt button or card.
- [x] No `SafeAreaView` from `react-native`; screens use `Screen` or react-native-safe-area-context.
- [x] No floating widgets; no TODO/FIXME.
- [x] README: docs/QUIET_LUXURY_DOCTRINE.md section 8 row added.

agent 133

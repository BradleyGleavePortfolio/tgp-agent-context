# REDO-INSETS-133 (agent 133 lane, builder claude_opus_5_5) — APPLY-INSETS-133 minus More/Plan/Membership
Worktree /home/user/workspace/wt/REDO-INSETS-133-mobile, branch agent133/redo-insets-133 off origin/main df7b8ae9.
Status 18:59 PDT (safe stop, owner 18:57): all three PRs MERGED. No open PR, no unpushed work.

## R1 verification (main df7b8ae9, from the code)
All 17 screens sit in Home/Workout/More stacks with headerShown false inside the tab navigator (tab bar owns the bottom), except
Timeline (backOnlyHeader native header). Fixed tops still true: Workout :1008 60, EditProfile :738 60, Education :404 60 / :536 56,
Grocery :357 60, PrepGuide :335 60, Recipes :375 60, Report :222 56, RoutineBuilder :395 56, Widgets :174 60, ClientPackages :610 56,
PackageCheckout :239 56 (modal), PurchaseUnpack :554 56, CoachGuidelines :154 56, Messages :885/:912 56, RecipeDetail absolute
`top: 56` buttons. Leaderboard already takes insets from react-native-safe-area-context (radius only). NEW finding: Timeline adds
insets.top UNDER the native back-only header (double top gap) and insets.bottom above the tab bar (#335 added the header, #107 the
insets). Hardcoded radii (count): Workout 2, Education 10, Grocery 6, PrepGuide 7, Recipes 5, RecipeDetail 5, Report 7,
RoutineBuilder 1, PurchaseUnpack 4, CoachGuidelines 5, Messages 5, Leaderboard 4, Timeline 2, MessageBubble 3, ThreadV2Parts 2;
legacy token users radius.lg/md (4/2): EditProfile, Widgets, ClientPackages, PackageCheckout. Nothing in the list was already fixed.

## PR 1 — insets + corners (16 screens + 2 shared messaging parts), 21 files, +276/-290
- Screen wrapper (src/ui, edges ['top'] — tab bar owns the bottom): Workout (testID workout -> workout-scroll kept), EditProfile,
  Education (list + detail), Grocery, PrepGuide, Recipes, RecipeDetail (top bar replaces absolute top: 56 buttons), RoutineBuilder
  (save button now the pinned keyboard-aware footer), Widgets, ClientPackages (both branches), PackageCheckout (modal: iOS page sheet
  edges [], Android ['top']), PurchaseUnpack (4 branches), CoachGuidelines. Messages: the wrapper's useScreenInsets on the 3 thread
  headers (KeyboardAvoidingView + composer kept as is). Timeline: no insets (native header + tab bar own them). Leaderboard: keeps
  its safe-area-context insets (its tests mock that module without the context the wrapper reads).
- Radius tokens: buttons radius.button 12, inputs radius.input 12, cards/image tiles radius.card 16, thread sheet top radius.sheet 24,
  chips/dots/progress bars/circles radius.chip, tags/nested reply stub radius.control 6. Hairline-only sections and rows lose their
  radius (no box, no corner): PrepGuide sections/week selector, CoachGuidelines cards, Grocery item rows (surface fill dropped).
- Past the list (R3): Education serif line heights (title 32/40, progress 24/30, lesson number 18/23, empty 20/25), chips and cards
  get full hairlines (a bottom-only border on a rounded box draws a broken curve), Recipe photos become rounded 16 tiles, search field
  rounded with a full hairline, PurchaseUnpack system 600 weights -> Inter 500 / Cormorant h3 / eyebrow tokens, Messages composer
  becomes a rounded field and the send button a circle, CoachGuidelines retry 600 -> 500, Leaderboard name field rounded.
- Tests: new src/__tests__/insetsCorners133.test.tsx (Grocery + PrepGuide rendered at 360x800 / 24 pt and 390x844 / 47 pt through
  SafeAreaProvider: top = insets.top + 12; source guard: no literal radius, no RN SafeAreaView, no fixed 40-99 top on header/page
  blocks, wrapper import, Timeline never adds insets.top). Fixture-only edits: purchaseUnpackScreen + truthfulCopy.guard read the
  ScrollView at `<testID>-scroll`; RoutineBuilder parity mock gains semanticColors.
- Shared with coach threads: components/messaging/MessageBubble.tsx and ThreadV2Parts.tsx (tell agent 134 in the PR).

## PR 2 — Report (progress-details reference), #593, 3 files +142/-162
Screen wrapper (testID report), hairline sections with overlines instead of boxed cards, serif tabular numbers, Cormorant cover, quiet
tip line, radius tokens; copy "My Report" -> "Weekly report" (no first person), sentence case. U found+fixed: today's totals showed 0
before/without a read; now "--". New test src/__tests__/reportScreen133.test.tsx (4, failing on main); client README row rewritten.

## Not seen on a device
Nothing here was seen on a phone. Rendered only through jest at 360x800 and 390x844 (Grocery, PrepGuide).

## PR 3 — WorkoutHistoryEdit top inset (#608), 2 files +47/-4
topBar paddingTop = useScreenInsets().top + layout.statusBarGap (base live-workout style had a fixed 56). Save radius line left to
REDO-LIVE-133 #583 (its 2 lines); no overlapping lines, so either merge order works. Test src/__tests__/workoutHistoryEditInsets133.test.tsx.

## HANDOFF
- #586 MERGED @ 5c03b39efff859d180c77a684eac2d159a344fea (16 screens + MessageBubble/ThreadV2Parts: Screen insets, rounded tokens).
- #593 MERGED @ 76436690d41a4e59aa4d9e681c83e529eca0ac2e (Weekly report restyle, "--" for unread totals).
- #608 MERGED @ 3cdf7abb3ec533eca11ff61d23bf4cd424e24e37 (WorkoutHistoryEdit top inset; Sol A + Opus A APPROVE).
- Bugs: B13, B28, B39 fixed on every listed screen. U found and fixed: Timeline double inset (#586); Report 0 totals before/without a read (#593).
- Unfinished: nothing pushed or half-done. Not started (cancelled by drain, never received here): 18:33 chevrons, 18:50 Privacy > Roman.
- Known leftovers for a next agent: (1) Leaderboard still takes its own safe-area-context insets, not `Screen` (its tests mock the
  module without SafeAreaInsetsContext; give those mocks the context, then move it). (2) WorkoutHistoryEdit keeps the live-workout
  stylesheet's own bar; only its top inset changed; its Save radius is #583's (REDO-LIVE-133). (3) WorkoutScreen.calm130 "500 lb"
  test failed once on CI for #608 and passed on re-run: possible flake, watch it.
- Next agent first: on a device, open Train, Edit workout, Messages (keyboard open), Routine builder (Android keyboard) and Package
  checkout (iOS page sheet); none were seen on a phone, only jest renders at 360x800 and 390x844.
- Shared with coaches: MessageBubble.tsx and ThreadV2Parts.tsx (radius only); agent 134 told in #586.
- Main came in with `git merge origin/main` every time (Q1 forbids rebase).

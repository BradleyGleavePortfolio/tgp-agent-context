# REDO-COACH-133 (agent 133 lane, builder claude_opus_5_5) — coach redesign (QA-COACH-128, QA-SHEETS-128 coach part, QA-COACH-SET-129)
Worktree /home/user/workspace/wt/REDO-COACH-133-mobile. Status: building (17:20 PDT). Mobile main df7b8ae9 at start.
References: design-targets/mobile/coach-home-solo, coach-workout-builder, drafts-queue (opened).

## R1 verification against main df7b8ae9 (17:15-17:20)
- QA-COACH-128 CoachNavigator: still true — filled glyphs (people, barbell/document-text, chatbubble, people-circle, settings), bar
  sc.bgSurface + 1 pt border, label 10/600 (CoachNavigator.tsx:705-708), no tab haptic. -> PR (a).
- ClientsList: 13 pt eyebrows (date :417, title :439), invite pill radius 4 (:455), fixed paddingTop 60 (:523), hero 64/68 (1.06x). -> PR (a).
- CoachWorkoutBuilder: 14 plain Pressables (:1625-1966) with no pressed state; 13 pt uppercase caption label (:1988/:2025); radius 4 (:2070, :2084). -> PR (a).
- ProgramsLibrary: radius 12/14/8 hardcoded (:410/:415/:425), plain Pressables (:304/:355). -> PR (a).
- QA-SHEETS-128 coach part: hardcoded radii still at AiBuilderSheet.tsx:197-203, WeekAiSheet.tsx:257-260, AdjustForClient.tsx:117-118,
  RevisionHistorySheet.tsx:106-107, ClientCopyBar.tsx:58-59; plain Pressables. Direction reversed by Q10b (tokens, not 4). -> PR (b).
- QA-COACH-SET-129: U5 ALREADY FIXED on main (COACH-SETTINGS-131, `formatClientCount(null)` = "—", SettingsScreen.tsx:52-60);
  U9 ALREADY FIXED (navigate('ClientsStack', { screen: 'NotificationPreferences', initial: false }) at :303-305). Dropped.
  What remains for (c) is the visual pass: sans 28/500 title, fixed paddingTop 60, cream card fills (surface), 13 pt uppercase section
  headers, Title Case labels, radius 4/2, TouchableOpacity rows. -> PR (c).

## Dependency
DS-PRIMITIVES-133 not pushed/merged at 17:20 (no origin/agent133/ds-primitives-133). PRs open only after it merges (R4).

## Log
- 17:20 read header Q1-Q10b, REDESIGN WAVE R1-R5, my entry, REDO-AUDIT-133 sections 4-5, DS-PRIMITIVES-133 API, CATALOG + 3 images.
- 17:25-18:00 built PR (a) on agent133/redo-coach-133, PR (b) on agent133/redo-coach-133-sheets, PR (c) on agent133/redo-coach-133-settings
  (each origin/main + the DS branch merged in, targeted tests green one file at a time, tsc clean for touched files, eslint 0 errors).
- 18:03 operator: DS-PRIMITIVES-133 merged as #577 (a279e1f6). Brought main in with `git merge origin/main` on all three branches
  (Q1 forbids rebase; same result, no force-push). Sizes vs main: (a) 10 files +274/-135, (b) 7 files +163/-61, (c) 14 files +195/-108.
- 18:10 opened growth-project-mobile#589 (PR a). Waiting for CI before READY, then (b), then (c).
- 18:24 #589 CI green; READY posted at 5e82996e. Both lenses APPROVE at that head (LN-SOL-A-133, LN-OPUS-A-133).
- 18:27 opened #599 (PR b); 18:36 CI green, READY at e8576a01 (merge-tree clean against main da6442e3).
- 18:38 PR (c): merged main da6442e3 into agent133/redo-coach-133-settings, tests re-run (look 6/6, coachSettings131 + moneyRow 20/20,
  doctrine + imessageDmRoutes + romanConversationsReachable + truthfulness 48/48), opened #609.
- 18:45 #589 and #599 MERGED (dual APPROVE at 5e82996e and e8576a01). #599 body corrected for U-599-C-1 (the AI summary does exist and stays Inter).
- 18:47 #609 first CI run failed: TeamProfile132 and CoachBillingScreen.backendShape mock useTheme with colors only (Overline needs
  semanticColors). Fixed both mocks, 25/25 locally, pushed ea9aba95; CI green.
- 18:55 operator stop-and-drain. 18:58 READY on #609 at ea9aba95. No new PR or follow-up started.

## HANDOFF
- State: done at 18:59 PDT. Drain respected: nothing new opened after 18:55.
- PRs:
  - growth-project-mobile#589 (a) QA-COACH-128 tab bar, Clients, Workout builder, Programs — MERGED (APPROVE Sol + Opus at 5e82996e).
  - growth-project-mobile#599 (b) QA-SHEETS-128 coach AI sheets — MERGED (APPROVE Sol + Opus at e8576a01).
  - growth-project-mobile#609 (c) coach Settings visual pass — OPEN, CI green, READY at ea9aba95749cdb3afe6a21a5c661aac56ae8d92a,
    clean merge-tree against main d0267454; waiting only on the two lenses. Branch agent133/redo-coach-133-settings.
- B=0 U=15 fixed (a 4, b 5, c 6). R1 drops: QA-COACH-SET-129 U5 and U9 already fixed on main (COACH-SETTINGS-131).
- Rules: main brought in with `git merge origin/main` (Q1 forbids rebase; the 18:03 "rebase" request was met by merging). No force-push.
- Lens U not acted on (drain): U-589-SOL-A-133-1 — ClientsListScreen.tsx:496,529 keep literal 22 / 3 circle radii
  (avatar and dot), allowed by coachRedesign133.test.ts:45-48; smallest fix is `radius.chip` (999) on both and dropping the allowance.
- NEED repos/tgp-agent-context/handoffs/op-132/COORDINATION.md — the agent 133 claim line for the coach files (CoachNavigator,
  ClientsList, CoachWorkoutBuilder, ProgramsLibrary, coach ai-builder/ai-entry sheets, coach SettingsScreen + settings/*) was not
  written by this builder; operator to add or close it — REDO-COACH-133.
- Not seen on a device or simulator: all evidence is tests (360x800 / 390x844 inset renders), tsc, eslint, CI.
- Bodies: ops/reports/REDO-COACH-133-pr-{a,b,c}-body.md. Worktree /home/user/workspace/wt/REDO-COACH-133-mobile (branch
  agent133/redo-coach-133-settings checked out; leave it).
- 18:59 SAFE STOP (operator 18:58). Nothing was mid-step: no unpushed change, worktree clean. No claim held, nothing else started.
- Unfinished: none in progress. Not started (cancelled by the drain): the U-589-SOL-A-133-1 radius fix above.
- Next agent, first: watch #609 at ea9aba95 for the Sol and Opus verdicts. On REQUEST CHANGES, fix only its Bs on
  agent133/redo-coach-133-settings, push once, wait for CI green, post FIX ROUND 2. GitHub showed mergeable UNKNOWN at 18:59 (still
  recomputing after main moved); a local merge-tree against main d0267454 was clean. Then the 22 / 3 radius follow-up in ClientsListScreen.

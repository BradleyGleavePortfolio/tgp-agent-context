COACH-INSETS-A-134 (agent 134, WAVE 1d). Bugs: **B13 B28 B39** (top spacing and safe areas from react-native-safe-area-context), **B16** (no plain rectangles: radius tokens), **B29** (flat pages: rounded, serif line heights that never clip). Presentation only: no data, endpoint, copy or navigation change.

## What changed
- Nine coach screens sit inside the shared `Screen` primitive (`src/ui`, m#577) and take `insets.top + layout.statusBarGap` (12) instead of a fixed `paddingTop: 56/60`: AIWorkoutDraft, AIMealPlanDraft, ClientInsight, CoachInboxV2, legacy Messages, RiskBoard, ClientReassignModal, SubCoachDetail, CoachTeamProfile. Two more, whose header band must run up under the status bar (`ClientMessagesScreen` thread header, `ClientDetailScreen` with `client-detail/styles.ts`), take the same top from the primitive's `useScreenInsets` hook, the way #586 did for the client thread.
- Every literal corner in the 12 listed files becomes a token: buttons `radius.button` 12, inputs `radius.input` 12, cards/panels/dialogs `radius.card` 16, chips/avatars/badges/bars/send button `radius.chip`.
- Serif line heights raised to 1.2 x the size or more where they were below it (Messages title 32/35 -> 32/39; client detail numbers 44/46 -> 53, 22/26 -> 27, 28/32 -> 34, nudge title 22/26 -> 27).
- `ClientReassignModal` (presentation `modal`): iOS page sheet owns the home indicator (`edges ['bottom']`, no top inset, 24 pt top padding); Android owns the top (`edges ['top']`, tab bar owns the bottom).
- The Messages tab headers (v2 inbox and legacy) and the Risk board header (a Clients-stack page whose title comes first, no Back control) add 12 under the Screen top, so their titles sit where the Clients and Settings tabs put theirs (`insets.top + 12 + 12`).
- Test fixtures only: five existing tests' `useTheme` mocks gain `semanticColors` (the `Screen` root reads `semanticColors.bgPrimary`); no assertion changed.

## Before -> after (per screen, from the code)
| Screen (src/screens/coach/) | Before | After |
| --- | --- | --- |
| AIWorkoutDraftScreen | `paddingTop: 56` page; 15 corners `4` | `Screen edges ['top']` (insets.top + 12); buttons 12, fields 12, week/day/summary cards and reject dialog 16 |
| AIMealPlanDraftScreen | `paddingTop: 56` page; 17 corners `4` | same as above (day/meal cards 16, item and macro fields 12) |
| ClientInsightScreen | `paddingTop: 56` page; corners 4/4/3/4 | `Screen edges ['top']`; sections 16, retry and Send check-in 12, bullet dot pill |
| CoachInboxV2 (Messages tab, v2) | header `paddingTop: 60`, no inset; search 2, chips 14, rows 4, avatar 4, badge 4 | `Screen edges ['top']` + header 12; search 12, chips pill, rows 16, avatar circle, badge pill; title line height 39 |
| MessagesScreen (Messages tab, legacy) | header `paddingTop: 60`; search 2, rows 4, avatar 4, badge 4 | same as CoachInboxV2 |
| ClientMessagesScreen (thread) | header band `paddingTop: 56`; avatar 18, composer 22, send 20 | header band `useScreenInsets().top + 12`; avatar and send pill, composer 12 (matches the client thread in #586) |
| RiskBoardScreen | `paddingTop: 60` page (both branches); chips 4, rows 4 | `Screen edges ['top']` + header 12 (both branches); chips pill, rows 16 |
| ClientDetailScreen + client-detail/styles.ts | `container` `paddingTop: 56` (all three branches); 33 corners 0-22 in styles.ts, retry 4 inline | `container` has no top; the screen adds `useScreenInsets().top + 12` on the skeleton, error and main branches; styles.ts corners all tokens (cards 16, buttons 12, inputs 12, chips/avatars/bars pill); retry 12. The Workouts underline tab keeps its square `0` (inline in ClientDetailScreen, asserted by coachClientWorkoutsMakeover127) |
| ClientReassignModal | `paddingTop: 56`, gutter 16; corners 4/16/4/4/4 | `Screen` with platform edges (above), gutter 24; option cards 16, reason field 12, buttons 12, check pill |
| SubCoachDetailScreen | ScrollView content `paddingTop: 56`, gutter 16; corners 4 x5 | `Screen edges ['top']` (scrolling), gutter 24; cards and client rows 16, buttons 12 |
| CoachTeamProfileScreen | `paddingTop: 56` on all three branches, gutter 20; corners 4 x3 | `Screen edges ['top']` on all three branches, gutter 24; CTA 12, setup dialog 16, field 12 |

## Parity table (P4)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| none (00-86 cover auth, consultation, tour, Roman and the coach consultation K0-K8; no frame shows these coach screens) | the 12 files above | on all 12 files: the Screen top (insets.top + 12, from react-native-safe-area-context), rounded tokens (owner 17:07), serif line heights >= 1.2 x size. 24 pt page gutter only where the Screen content owns it (ClientReassignModal, SubCoachDetailScreen, CoachTeamProfileScreen: was 16/16/20) and where it already was 24 (RiskBoard header, chips and list; Inbox v2 and legacy Messages header and search) | inner gutters are kept as today, not 24: AIWorkoutDraft, AIMealPlanDraft and ClientInsight header, scroll and footer 20; ClientMessages header 20, thread list and composer 16; Inbox v2 and legacy Messages conversation list 16; ClientDetail header, tabs and scroll 20 (client-detail/styles.ts). Kept on purpose: this job moves insets and corners only (presentation, no layout redesign); a uniform 24 pt gutter is a follow-up. No prototype frame to match; the bar is design-targets CATALOG ("the bar, not the blueprint") and Q10b. Hierarchy, copy and button counts are unchanged |

## WHY / WHEN / WHO (root cause, from `git log -S`)
- Fixed tops were written before the safe-area primitive existed: AIWorkoutDraft, AIMealPlanDraft, ClientInsight `a0d9ca2c` (#139, 2026-05-13); CoachInboxV2 `222d128c` (M-MSG-121, 2026-10-05, copied the legacy 60); legacy Messages `f861d39b` (initial commit); ClientMessages `6146407c` (#17); RiskBoard `35b33908` (PTM Phase 1E); client-detail/styles.ts `8cbde425` (screen split); ClientReassignModal and SubCoachDetail `ad708df6` (#120); CoachTeamProfile `829ab1d6` (#153).
- The 4 pt corners are the old doctrine rule 5 ("radius.lg = 4"), overridden by the owner on 10-08 17:07 (decision 133-4).

## Tests (local, via heavy.sh, one file at a time)
- New `src/screens/coach/__tests__/coachInsetsA134.test.tsx` (61): Risk board, AI workout draft and the reassign modal rendered through `SafeAreaProvider` at 360x800 (24/16 insets) and 390x844 (47/34): root top = insets.top + 12 (sheet: 0 top, 24 padding, bottom clears the home indicator); source guard over the 11 files + styles.ts: no literal radius, no `SafeAreaView` from react-native, no fixed 40-99 top on header/page blocks, Screen/useScreenInsets import, ClientDetailScreen insets on all three branches, serif line height >= 1.2 x size.
- Passing locally: aiWorkoutDraftKeep131, coachAi, aiMealPlanDraftReview125, RiskBoardScreen, qaCoachStates131, CoachInboxV2, ClientMessagesScreenV2, ClientMessagesScreen.integration, coachCheckInReviewFu126, TeamProfile132, coachClientWorkoutsMakeover127, clientArchiveCopy132, coachSaasBlockers, coachFoodConsent124, coachFoodReview124, coachWeekly131, workoutLogging2126, InviteCtaWiring, coachTeamP0Blockers, ClientPayments, skeleton, clientWearablePromptsRoute. `tsc --noEmit` clean; eslint 0 errors (3 old warnings).

## Not seen on a device
Nothing here was seen on a phone. Rendered only through jest at 360x800 and 390x844 (Risk board, AI workout draft, reassign modal); the rest is from the code. Worth a look on a device: the reassign modal on an iOS page sheet and on Android, the coach thread header band under the status bar, and the client detail header.

## Left as is (listed)
- `ClientRiskDetailScreen`: registered in ClientsStack but nothing navigates to it since AUDIT-13-125 (Risk board rows open ClientDetail) — unreachable, untouched.
- Shared messaging parts (`components/messaging/MessageBubble.tsx`, `ThreadV2Parts.tsx`) were rounded in #586; untouched here.
- Proposed (needs operator): Risk board, SubCoachDetail and CoachTeamProfile have no on-screen Back control (iOS edge swipe and Android system back work). Adding a `ScreenTopBar` back is a small navigation-affordance change outside this presentation-only job. Default: a follow-up job.

`ClientDetailScreen.tsx` is outside the entry's file list but is the only way to move `client-detail/styles.ts` off the fixed 56 (a static StyleSheet cannot read insets); root lines only, no open PR touches it (NEED in the job report, default proceed).

Body corrected for B-626-SOL-D-134-1 (gutter claim in the parity row); no code change.

agent 134

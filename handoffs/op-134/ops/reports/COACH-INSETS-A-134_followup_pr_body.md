COACH-INSETS-A-134 follow-up (agent 134; operator YES on the two "Proposed" items in m#626). Bugs: **B08** (Back has nowhere to go: three pushed coach screens had no Back at all, and iOS has no hardware back) and **B29** (flat pages: 16/20 pt page gutters next to 24 pt ones). Presentation plus one Back control per screen: no data, endpoint or copy change. The only navigation addition is `navigation.goBack()` on the new Back.

## What changed
- **Back** on Risk board, SubCoachDetail and CoachTeamProfile (Business profile). Each uses the same control and place as the other coach detail screens (AIWorkoutDraft, ClientInsight, ClientDetail): `arrow-back` 24 in `colors.textPrimary`, at the top left on the 24 pt gutter, first under the Screen top (`insets.top + 12`). The target is an explicit 44 x 44 box (`layout.touchMin`) with `accessibilityRole="button"` and `accessibilityLabel="Back"`.
  - It shows only when `navigation.canGoBack()`. A screen opened with nothing below it (a resume or deep link) gets no dead Back. Risk board then keeps the extra 12 that lines its title up with the Clients and Settings tabs.
  - Risk board shows it on both branches (locked and board). SubCoachDetail shows it on the loaded page and on the load error, which now sits inside `Screen` instead of a bare full-screen View. Business profile shows it on all three branches (error, setup, loaded).
- **Gutters**: page-level horizontal padding on the twelve m#626 files is now the `layout.gutter` token (24), never 16 or 20:

| File | Before | After |
| --- | --- | --- |
| AIWorkoutDraftScreen, AIMealPlanDraftScreen, ClientInsightScreen | header, scroll and footer 20 | 24 (scroll keeps 20 top / 40 bottom) |
| CoachInboxV2, legacy MessagesScreen | header and search 24, conversation list 16 | all 24 |
| ClientMessagesScreen (thread) | header 20; message list, composer and error banner 16 | all 24 |
| RiskBoardScreen | 24 (literal) | 24 (`layout.gutter`) |
| client-detail/styles.ts + ClientDetailScreen | header, tabs, scroll and plan-form sheet 20; skeleton rows 16 | all 24 |
| CoachTeamProfileScreen | page 24 (Screen); setup dialog inset 20 | dialog inset 24 |
| ClientReassignModal, SubCoachDetailScreen | 24 (Screen) | unchanged |

## Before -> after (Back, per screen, from the code)
| Screen | Before | After |
| --- | --- | --- |
| RiskBoardScreen (ClientsStack, pushed from the Clients list) | no Back; a coach on iOS had to edge-swipe | Back first under the Screen top when it can go back |
| SubCoachDetailScreen (TeamStack, pushed from Team) | no Back on the page or on the load error; the error View also ignored insets | Back on both; the error sits inside `Screen edges ['top']` |
| CoachTeamProfileScreen (SettingsStack, pushed from Settings) | no Back on any branch | Back on error, setup and loaded |

## Parity table (P4)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| none (no prototype frame shows these coach screens) | the twelve files above | 24 pt page gutter on every page-level block; Back placed like the other coach detail screens, 44 pt target | message bubbles, cards and rows keep their own inner padding (only page gutters move). Back shows only when there is a screen to return to (no dead control). Hierarchy and copy are unchanged |

## WHY / WHEN / WHO
- The three stacks set `headerShown: false`. These screens were written without their own Back: RiskBoard `35b33908` (PTM Phase 1E), SubCoachDetail `ad708df6` (#120), CoachTeamProfile `829ab1d6` (#153). Android system back and the iOS edge swipe worked; nothing on screen did. The gap was found in m#626 (from the code).
- The 16/20 gutters date from the same introducing commits (#139, #17, M-MSG-121, the client-detail split `8cbde425`), before `layout.gutter` existed.

## Tests (local, via heavy.sh, one file at a time)
- New `src/screens/coach/__tests__/coachBackGutter134.test.tsx` (26). At 360x800 (24/16 insets) and 390x844 (47/34):
  - each of the three screens shows Back under `insets.top + 12`, sized 44 x 44, labelled "Back", and it calls `goBack` once;
  - SubCoachDetail's load error and Business profile's setup and error states also have Back;
  - there is no Back when `canGoBack()` is false;
  - a source guard checks that every page-level block on the twelve files uses `paddingHorizontal: layout.gutter`.
- Green: coachInsetsA134 61, RiskBoardScreen 16, qaCoachStates131 13, TeamProfile132 11, coachSaasBlockers 29, coachTeamP0Blockers 19, aiWorkoutDraftKeep131 10, aiMealPlanDraftReview125 4, coachAi 16, CoachInboxV2 10, ClientMessagesScreenV2 7, ClientMessagesScreen.integration 3, coachClientWorkoutsMakeover127 8, clientArchiveCopy132 7, coachCheckInReviewFu126 9, commandCenterNavigation 11. `tsc --noEmit` is clean; eslint has 0 errors.
- Fixtures only: `canGoBack: () => false` was added to three navigation mocks (RiskBoardScreen.test, qaCoachStates131, coachInsetsA134). No assertion changed.

## Not seen on a device
Nothing here was seen on a phone. It was rendered only through jest at 360x800 and 390x844. Worth a look on a device:
- the Back on Risk board and Business profile, on iOS and Android;
- the thread composer at 24 pt on a 360 pt Android phone.

agent 134

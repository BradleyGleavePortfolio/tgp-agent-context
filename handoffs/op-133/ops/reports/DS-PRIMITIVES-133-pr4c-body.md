[133] DS-PRIMITIVES-133 PR 3 of 4 (insets). Bugs: B39, B13, B28. Retargeted to main after #577 merged (origin/main merged in, one push). Tier: T1, mobile presentation only.

## What
JOBS entry point 5. The 8 lane-133 files stop using SafeAreaView from 'react-native', which is iOS only and pads nothing on Android edge-to-edge (RN 0.85). They now take insets from react-native-safe-area-context:
| File | Edges | Why |
|---|---|---|
| client/HomeScreen | top, left, right | tab root; the tab bar owns the bottom |
| client/MoreScreen | top, left, right | tab root |
| client/MembershipScreen | top, left, right | MoreStack, headerShown false |
| client/BloodworkEntryScreen (4 states) | top, left, right | MoreStack, headerShown false |
| client/PlanScreen | left, right | under `backOnlyHeader`, which owns the status bar; the `Platform.OS === 'android' ? 50 : 20` guess becomes 20 |
| client/Day1WinScreen | all | rendered by RootNavigator outside the tab navigator |
| components/BloodworkDisclaimerModal | all (native) | page sheet on iOS, full-screen modal on Android |
| components/trust/TrustExplainerSheet | bottom, on the sheet | the sheet runs to the screen edge; its padding clears the gesture bar (additive inset); top corners `radius.sheet` 24 |

Q10b: every literal radius in these files becomes a token (Home CTAs and skeleton `radius.button`, Plan cards `radius.card`, notes `radius.input`, retry `radius.button`, Membership action `radius.button`, Bloodwork cards/inputs/submit, Day1Win card/skeleton/continue, disclaimer button, sheet handle `radius.chip`). `src/__tests__/safeAreaInsets133.test.ts` guards all 8 files.

Not in this PR: auth/WelcomeScreen also uses SafeAreaView from 'react-native', but it belongs to AUTH-ENTRY-133. APPLY-INSETS-133 (REDO-AUDIT-133) lists More, Plan and Membership; this PR covers those three, so that job can drop them.

## WHY / WHEN / WHO
SafeAreaView from 'react-native' only pads on iOS. With Android edge-to-edge always on (RN 0.85), these screens draw under the status bar (B28, B13), and Plan used a hardcoded 50 pt Android guess instead. Home came in with 4faec4a8 (#53, luxury wave 3), More with 1ff53fb7 (#5), TrustExplainerSheet with 83b65cb8 (#45), and Plan's guess dates from the initial commit f861d39b.

## Parity table
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 00 / 03 (top breathing room) | Home, More, Membership, Bloodwork | the status bar is cleared on both platforms, then the screen's own 24 / 32 / 12 pt header padding (Bloodwork has none of its own; the flag is off, so nobody reaches it, LN-OPUS-B C) | These screens keep their own layout; full `Screen` adoption belongs to CLIENT-HOME-133 and the REDO jobs. |
| none: no prototype screen (existing app sheet) | TrustExplainerSheet | no parity claim. This is a mechanical migration: the bottom inset now comes from safe-area-context, so the sheet reaches the screen edge and pads for the gesture bar; top corners use the Q10b sheet token `radius.sheet` 24 | The "Got it" button keeps its look but now uses `radius.button` instead of a pill. Prototype 37 is the full-screen consultation summary, not a sheet; the earlier row citing it was wrong (B-582-SOL-A-133-1, B-582-SOL-B-1, LN-OPUS-B-133). |

## Evidence
Locally: safeAreaInsets133 17/17; Day1WinScreen 16/16 and packagePrompt 6/6; HomeScreen foodUi131 19/19, honestCopy127 17/17, macroMode 5/5, todayTargets 3/3; HomeChildCards 5/5; homeWorkoutEntry130 4/4; MembershipScreen.status128 14/14; membershipWebsiteLinkIos 4/4; MealPlan.quiet 11/11; assignedWorkoutEntry127 15/15; deliveredContentOpens 10/10; coachlessGateVersionB 19/19; trainOpensYouStack131 2/2; clientTabLabels 1/1; truthfulCopy 20/20. tsc is clean and eslint shows 0 errors. Not seen on a device.

agent 133

# AUD-FIN-BODY-129: finishing the FW-BODY-128 audit (AUD-FIN-129 instance, Claude Opus 5.5, agent 129, read-only)
Status: DONE 16:27 PDT 10-07. No code pushed, no PRs, no comments, no production reads or writes.
Unchecked list (STOPPED_HALFWAY.md section A, FW-BODY-128): "B1 not confirmed on a real iPhone". There is no iPhone or iOS simulator
in this sandbox, so I confirmed B1 with a throwaway jest render test that simulates the iOS keyboard event, plus the React Native
native rule and the sheet geometry. The full test is copied to ops/reports/AUD-FIN-BODY-129_throwaway.test.tsx.txt. It ran only in my
detached worktree /home/user/workspace/wt/AUD-FIN-BODY-129-mobile and was never committed or pushed.
Heads: mobile main a1be6fb2, m#520 (WEIGH-KB-128) 29d3de2a, backend main c3324d4a. Since FW-BODY-128's read (mobile 4185b9b2,
backend c7caffff), only the Health screen files changed in this area (DES-H, m#483 merged). ProgressScreen, ReportScreen,
coachSharing, ConnectProviderSheet, disconnectCopy, useMacroTargets and api.ts are unchanged on mobile. On the backend, src/weight,
src/wearables and src/consent are unchanged. So the original report still applies at current main; I do not repeat it here.

## B list (both from FW-BODY-128; 0 new)
B1. CONFIRMED at render level and in the native code. It is still live on main a1be6fb2, and m#520 fixes it.
- Story: a new client on an iPhone taps + on Progress (or Day-1 "Log your starting weight"). The number pad opens over the Log
  weight sheet and the weight field and Save stay under it. There is no Done key and nothing closes the pad, so the first weigh-in
  cannot be saved.
- Fix: m#520 at 29d3de2a: CI green, READY at head, 409 lines, no Opus or Sol verdict yet (board 16:06). The same throwaway test
  passes the "fixed" checks there (R4). Still open: one look on a Face ID iPhone on the TestFlight build after it merges.
B2. Still open and unchanged (CODE-ONLY, row C4). The fix rows CF-BODY-J3-128 (copy) and CF-SHARE-GATE-128 (backend gate) exist in
  CLIENTFIX-128, but no branch exists for either: `git ls-remote` found no agent12*/cf-body* or agent12*/cf-share* in either repo.

## REPRODUCED (throwaway jest render test, RNTL 14 / RN 0.85.3, iOS preset; 393 x 852 pt window, simulated 291 pt keyboard)
Evidence: ops/reports/AUD-FIN-BODY-129_jest_main_a1be6fb2.txt (tests 0-2 pass, test 4 fails) and
ops/reports/AUD-FIN-BODY-129_jest_m520_29d3de2a.txt (tests 1-2 fail, tests 0 and 4 pass).
| # | Finding | Test | Head | Observed |
|---|---|---|---|---|
| R1 | Nothing in the Log weight sheet reacts when the iOS keyboard opens. The weight field's ancestor chain has no KeyboardAvoidingView and no onLayout listener. After `keyboardWillShow` no ancestor style changes, and the highest paddingBottom stays 40 (the sheet's own padding), so the sheet stays at the bottom under the pad. | 1 (passes = bug) | main a1be6fb2 | 0 listeners; changed styles []; paddingBottom chain [0,40,0,0,0,0] |
| R2 | The decimal pad gets no Done key. The field is keyboardType "decimal-pad" with autoFocus true; returnKeyType, inputAccessoryViewID and inputAccessoryViewButtonLabel are all unset; there is no onSubmitEditing and no "Done" element. (Why this means no key on a device: C1.) | 2 (passes = bug) | main | as stated |
| R3 | Tapping the dimmed area does nothing (0 Keyboard.dismiss calls). The Modal is transparent, animationType "slide", with no presentationStyle, so there is no swipe-down to close it. It also has no onRequestClose, so Android Back does nothing while the sheet is open (U1 below). | 2 | main | dismiss 0; presentationStyle null; onRequestClose undefined |
| R4 | m#520 fixes R1-R3 at render level. After the keyboard event the avoider's paddingBottom becomes exactly 291, so the whole sheet rides above the pad. The field gets returnKeyType "done" and inputAccessoryViewID "progress-log-weight-keyboard", and a "Done" control sits inside the accessory view with that nativeID. Tapping the dimmed area calls Keyboard.dismiss once. | 4 (passes = fixed) | m#520 29d3de2a | paddingBottom chain [0,40,0,291,0,0,0]; accessory 1; dismiss 1 |

## CODE-ONLY (traced; file:line, handler, path)
| # | Finding | Where |
|---|---|---|
| C1 | React Native adds its own Done bar to a number or decimal pad only when the field sets a non-default returnKeyType or an inputAccessoryViewButtonLabel. Main sets neither (R2), so on a real iPhone the pad has no Done or return key. | react-native 0.85.3 React/Fabric/Mounting/ComponentViews/TextInput/RCTTextInputComponentView.mm:644-666 (`setDefaultInputAccessoryView`, called from `updateProps` :335; the allowed return keys are listed at :628-641). Mobile src/screens/client/ProgressScreen.tsx:784-793 (weight field), :771 (Modal). |
| C2 | Geometry. The sheet is about 287 pt tall and anchored to the bottom (overlay flex-end). Measured from the bottom: Save about 40-84 pt, weight field about 165-214 pt, Close X about 236-261 pt. Any iPhone keyboard covers Save and the field: classic iPhones are 216 pt per the [zoul/ios-keyboards catalogue](https://github.com/zoul/ios-keyboards), and Face ID iPhones are taller (exact pad height not verified here). On taller pads the Close X is hidden too, which leaves no way out. Nothing app-wide moves the sheet: package.json has no keyboard library (no KeyboardProvider, IQKeyboardManager, avoid-softinput or keyboard-aware). | ProgressScreen.tsx styles :1135-1184 (overlay flex-end; sheet padding 24 / paddingBottom 40; header 29 + 20; inputs 2x14 padding + 2 border + ~19 line; Save 20 + 2x14 + ~16). |
| C3 | Remaining device risk. Two 2026 posts say iOS shows a floating "Done" pill on decimal pads ([technetexperts](https://www.technetexperts.com/react-native-ios-keyboard-shifted-left/), [Stack Overflow mirror](https://react614.rssing.com/chan-75533267/latest.php)). The mirror's case is an iOS 17 simulator removing the pill with an empty InputAccessoryView, which matches React Native's own bar from C1, not a system key. Only a device can rule out a system dismiss key on iOS 26/27. Even with one, the field and Save stay hidden while typing (R1), so B1 stands. | web; C1 |
| C4 | B2 unchanged. The handler checks only `coach_id`, never the client's Coach sharing switches (FITNESS_*), and the client copy still says "Choose what your coach sees." | Backend GET /v1/wearables/samples?clientId: src/wearables/samples/wearable-samples.controller.ts:65 @Controller('v1/wearables/samples'), :88 @Get(), :168 `getSeries(req.user.id, req.user.role, query)` -> wearable-samples.service.ts:250-260 -> `assertCoachOwnsClient` :326-348 (where: id, coach_id, role student). Mobile src/components/coachSharing/coachSharingCopy.ts:5, CoachSharingScreen.tsx:79. |
| C5 | Checked, no finding. (a) The Disconnect confirm says "Data already shared stays with your coach", which matches the soft-disconnect. (b) Roman's device-health reads (b#843 read_history health_day) pass through the single consent-gated AI egress (box 2). (c) An offline Save shows "The service could not be reached. Check your connection and try again." | (a) mobile src/screens/client/wearables/disconnectCopy.ts:41, :46-50. (b) backend src/roman/tools/roman-extra-history.ts:95; src/ai-egress/ai-egress.service.ts:200 `assertMaySend`. (c) mobile src/types/common.ts:55-56 via ProgressScreen.tsx:385. |

## U list (new)
U1 (REPRODUCED, R3): Android Back does nothing while the Log weight sheet is open (Modal has no onRequestClose, ProgressScreen.tsx:771).
  The Close X still works, so this is not a dead end. m#520 adds onRequestClose={closeLogModal}; nothing else to do.

## C one-liners
- C (edge, deferred to 10k clients): double tap on Save. This was already in FW-BODY-128. My test for it hung on RNTL 14's async press, and
  I dropped it rather than spend time on an edge case. m#520 disables Save while saving.

## Proposed fix jobs (none overlap files claimed in CLIENTFIX-128: CF-BODY-J2 backend src/weight/*, CF-BODY-J3 coachSharing + ConnectProviderSheet + disconnectCopy, CF-BODY-J4 ReportScreen)
- No new job for B1: m#520 is the fix. It needs the Opus and Sol lenses at 29d3de2a before the 23:00 mobile cut.
- J1B-129 (GPT-6.1 Sol, T1 mobile, about 120 lines; launch AFTER m#520 merges and BEFORE DES-P-128, same file). Covers the FW-BODY-128
  U items m#520 left out: U2 (empty "Body Stats" heading; BMI from height_cm in monochrome, or hide the heading), U3 (invented
  "/ 2000 kcal" when there is no target), U12 (Start/Change measured from the period's first entry). Files:
  src/screens/client/ProgressScreen.tsx, src/screens/client/__tests__/ProgressScreen.truth.test.tsx (new), README row.

## Not fixed (needs operator)
1. Route both lenses to m#520 at 29d3de2a now. The render evidence (R4) and the failing-on-main proof are above. Recommended default:
   merge before 23:00 if both approve, then do one Log weight check on a Face ID iPhone in the TestFlight build (field and Save
   visible, Done closes the pad).
2. B2: launch CF-BODY-J3-128 (copy, small) now. CF-SHARE-GATE-128 (T4 backend gate) per the owner. Neither has started.

## HANDOFF
Complete; nothing in flight. Worktree /home/user/workspace/wt/AUD-FIN-BODY-129-mobile (detached, back at main a1be6fb2, holds the
untracked throwaway test; never commit it). To re-run against any head:
`git -C <wt> checkout -q --detach <sha> && cd <wt> && /home/user/workspace/ops/heavy.sh npx jest src/screens/client/__tests__/zzAudFinBody129.throwaway.test.tsx --ci`.
Expected: on a head where B1 is open, tests 1-2 pass and 4 fails; on a head where it is fixed, tests 1-2 fail and 4 passes.

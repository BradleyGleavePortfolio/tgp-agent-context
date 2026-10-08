# WEIGH-KB-128 (FIXWAVE-128, agent 128) — Log weight on iPhone

## Scope traced
FW-BODY-128 B1 + J1 row. mobile src/screens/client/ProgressScreen.tsx (Log weight Modal), README row, new test
src/screens/client/__tests__/ProgressScreen.weighIn.test.tsx. Base: mobile main c44763a1.

## B list
- B1 fixed: sheet in KeyboardAvoidingView (iOS padding), tap-outside Keyboard.dismiss, iOS InputAccessoryView "Done",
  Save disabled when empty/saving, "Saving" label, ref guard (one POST per double tap), Android back closes.

## U list
- U6 fixed (40-1,500 lb copy; non-number copy). U1 fixed (goal = profile.target_weight_lbs). U8 fixed (monochrome Change).
  U9 fixed ("Wed 7 Oct"). Not done: U2, U3, U12 (left for DES-P-128 / follow-up).

## C one-liners
- None new.

## PRs
- growth-project-mobile#520, head 29d3de2a0fddbbfa014f20f68f595a62b01ce776 (after merging origin/main; README row conflict resolved), 409 changed lines (187+/47- screen, 173 test, 2 README).
  Note: total exceeds the 300 guidance for adding J1 items (modal re-indent + tests); J1 extras ~70 lines. Under 800 cap.
- Local: new test 9/9 fail on main, 9/9 pass on branch; ProgressScreen.chart 8/8; quietLuxuryDoctrine 30/30.
- CI: green at 29d3de2a (Typecheck/lint/test, CodeQL); mergeable clean. READY comment posted. Verdicts: not waited for (owner 14:08 override).

## Not fixed (needs operator)
- None. Device check on one iPhone recommended (jest cannot render the native keyboard).

## HANDOFF
Branch agent128/weigh-kb-128, worktree /home/user/workspace/wt/WEIGH-KB-128-mobile. If a lens asks to trim to <300 lines, drop
formatLogDate (U9) and the U1/U8 lines + their 3 tests. Lens findings go to the FIX lane.

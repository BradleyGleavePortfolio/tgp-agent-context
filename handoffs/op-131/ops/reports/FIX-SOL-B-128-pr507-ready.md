FIX ROUND 2 (DES-BA-127, agent 128, FIX-SOL-B-128) — growth-project-mobile#507 @ f39057d4aca2a554f354b7ade218ad2e0b858ae6 — READY FOR AUDIT

B1 fixed — an ordinary user disabling System now changes the existing sender gate, `digest_email`, rather than the unused weekly-summary field. Hydration uses that same gate; descriptions correctly say daily and weekly summary email. Files: src/screens/settings/NotificationPreferencesScreen.tsx:89,166,436; read-state and exact-payload regression src/screens/settings/__tests__/PreferenceScreens.calm.test.tsx:72-95.

B2 fixed — all five Personalization sections visibly state that their choices are stored only and do not currently change Home, alert delivery, wording, measurements or calendar layouts. Every original option and save handler remains; Notification settings opens the existing real delivery-control route. Files: src/screens/client/PreferencesScreen.tsx:243,276-285,301,317,332; visible-copy, navigation and retained-action assertions src/screens/settings/__tests__/PreferenceScreens.calm.test.tsx:126-163.

Both verdicts read in full: Sol's two Bs addressed, Opus approved the previous head. No finding silently skipped. Backend consumer integration and preference-save error exposure remain operator follow-ups, not expanded into this bounded fix.

One targeted heavy.sh run under the owner's credit emergency: PreferenceScreens.calm.test.tsx, 7/7 passing, including all existing category/channel/personalization actions and semantic light/dark variants. No optional polish, additional test runs or new job.

First fix CI passed 690 suites / 9,139 tests but failed the older source-string guard requiring the obsolete field and copy. Updated only those two expectations in src/__tests__/clientDeadTaps126.test.ts:41-42; no second local run under the owner's instruction.

Origin/main merge was already up to date, with no conflict. Size: 333 additions + 76 deletions = 409 lines. Required CI and all CodeQL checks SUCCESS at this exact head; GitHub MERGEABLE. PR body/parity table and only owned README entries updated.

No PR merge, deployment or production change. Finish/handoff now under the owner's credit emergency; both lenses must review this new exact head before operator merge.

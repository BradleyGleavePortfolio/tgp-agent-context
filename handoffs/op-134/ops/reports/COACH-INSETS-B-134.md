# COACH-INSETS-B-134 (agent 134, builder claude_opus_5_5)
Worktree /home/user/workspace/wt/COACH-INSETS-B-134-mobile. Bugs B13 B28 B39 B16 B29 + U-589-SOL-A-133-1.

## PR 1 — m#625 (branch agent134/coach-insets-b-134)
Head 1358497bd235603eab96b0a3e414b5e9acc663b1 (merged origin/main 4de164bf, m#576; README commit; then a fixture fix).
CI run 1 at e37756d9 failed ONLY qaCoachHome131 (its safe-area mock lacked SafeAreaInsetsContext; seen in a test, CI) -> fixed at 1358497b.
Team, InviteCodes (legacy), CoachInvites, InviteCodeRedeemers, ProgramTemplates on the shared `Screen` (edges ['top']), rounded tokens;
ClientsList 22/3 -> radius.chip; coachRedesign133 allowance dropped. New test coachInsetsB134.test.tsx (25). Status: CI pending.

## PR 2 — m#627 (branch agent134/coach-insets-b-134-payments)
Head 8035d6d8e39986633ba18935c93ef664be3c57bf (merged origin/main e8b20e6f, then README row). Packages, Content, Subscribers, Payouts
on `Screen`; Edit package top bars via useScreenInsets (keyboard column kept); rounded tokens. New test coachPaymentsInsets134 (19).
Leftovers (not my files, from the code): payments/contents/ContentAttachForm, PushConfirmModal, MediaAssetPicker literal radii;
Subscribers "Started —" for a missing date (copy).

## Not changed (listed)
- CoachBillingScreen: no visible entry (Settings row removed CF-COACH-BILLING-129; StripeSetupBanner only in CoachHomeScreen). From the code.
- CoachHomeScreen (`Dashboard`): no caller, no push/linking target. From the code.
- ProgramTemplatesScreen emoji tiles: off in production/clinic (mwbPrograms true). Proposed (needs operator): leave; default leave.

## Status (READY posted)
- m#625 READY @ 1358497b (CI green, CLEAN). m#627 READY @ 8035d6d8 (CI green, CLEAN). Waiting for LN-OPUS-D-134 / LN-SOL-D-134 verdicts.

## HANDOFF
- m#625 MERGED (merge b8df4155) @ 1358497bd235603eab96b0a3e414b5e9acc663b1. Opus D + Sol D APPROVE, B=0 U=0. Covers Team, Invite codes (legacy),
  Invites, Who joined, Guideline templates (+ client picker sheet) on `Screen` edges ['top'], rounded tokens; ClientsList 22/3 -> radius.chip
  (U-589-SOL-A-133-1 done; the coachRedesign133 allowance is gone).
- m#627 MERGED (merge da96213e) @ 8035d6d8e39986633ba18935c93ef664be3c57bf. Opus D + Sol D APPROVE, B=0 U=0. Covers Packages, Package content,
  Subscribers, Payouts on `Screen`; Edit package top bars via useScreenInsets (preview: iOS sheet 12 pt, Android inset + 12); rounded tokens.
- Bugs: B13 B28 B39 B16 B29 fixed on every reachable screen in my list (corners and insets only; no copy or layout restyle).
- Left as they are (unreachable, from the code): CoachBillingScreen (no entry since CF-COACH-BILLING-129; StripeSetupBanner lives only
  in CoachHomeScreen), CoachHomeScreen (`Dashboard`, no caller and no push/linking target).
- Proposed (needs operator), default = next coach polish wave: (1) payments/contents/ContentAttachForm, PushConfirmModal and MediaAssetPicker
  still have literal 2/4 radii; (2) Subscribers shows "Started —" for a missing date; (3) ProgramTemplatesScreen emoji tiles (off in
  production/clinic, mwbPrograms true).
- Not seen on a device. The only renders were jest renders at 360x800 and 390x844 (Invites, Who joined, Packages, Subscribers).
- Nothing unpushed or half-done. Main came in with `git merge origin/main` only (no rebase, no force-push).

## B3 round (operator mail 21:3x) — branch agent134/coach-insets-b3-134 (off origin/main 382692d8)
- Done locally, all tests green, tsc clean, eslint 0 errors: corners in ContentAttachForm, PushConfirmModal and MediaAssetPicker, plus PushPromptSheet
  (the only bottom sheet: its top went from radius.lg 16 to radius.sheet 24, and its forest button from radius.sm 0 to radius.button).
  Subscribers line now omits a missing or unreadable Started/Renews date. Templates: the initials tile is gone.
- Correction (from the code): Templates never had emoji characters. Since #54 the field named `emoji` has held two-letter initials (FL, LB, RC, MP, MW)
  in a tinted 48 pt tile. My earlier "emoji tiles" note was wrong. The tile and the field are now removed.
- New test src/screens/coach/__tests__/coachSheetsB3134.test.tsx (12 tests).

## HANDOFF
- m#625 MERGED (b8df4155) @ 1358497b. Opus D + Sol D APPROVE, B=0 U=0. Team, Invite codes, Invites, Who joined, Guideline templates on `Screen`; ClientsList radius.chip.
- m#627 MERGED (da96213e) @ 8035d6d8. Opus D + Sol D APPROVE, B=0 U=0. Packages, Content, Subscribers, Payouts on `Screen`; Edit package via useScreenInsets.
- m#634 MERGED (e3c55596) @ 6631a7b7a7f1c2a22d96856cab9a507eb2e43d84. Opus D + Sol D APPROVE, B=0 U=0 (B3 round from the operator mail). Package-content sheets on
  tokens (push prompt sheet 24, buttons and fields 12); Subscribers omits a missing or unreadable date; Templates initials tile removed. My earlier "emoji"
  label was wrong: they were initials (corrected in the PR body).
- Left alone, unreachable (from the code): CoachBillingScreen, CoachHomeScreen. Nothing unpushed. Not seen on a device; jest renders at 360x800 and 390x844 only.
- No open items and nothing needs the operator.

# REDO-SETTINGS-133 (agent 133 lane, builder claude_opus_5_5): APPLY-SETTINGS-133, then APPLY-PROFILE-133
Worktree /home/user/workspace/wt/REDO-SETTINGS-133-mobile. PR bodies: ops/reports/redo-settings-133/pr{1,2,3}_body.md.

## Status (18:49 PDT)
| PR | Branch @ head | Scope | Lines | State |
|---|---|---|---|---|
| m#585 | agent133/redo-settings-133 @ 95215c3f | Notifications, Trust & Privacy, Blocked users, My data, Delete account | ~765 | MERGED (READY posted at the head) |
| m#596 | agent133/redo-profile-133 @ ddb5957a6ddb8a829b608cc6b58146b11e16b8da | Profile (APPLY-PROFILE-133, U2) | 228 | MERGED (READY posted at the head) |
| m#611 | agent133/redo-settings-133-b @ 3abed53a1cdd28636b6dc41d6b352b0f87049b69 | client Settings + SettingsSection on Screen and QuietRow; decision 133-14 Add a coach code | 719 | CI green, READY posted at the head (18:49) |

## What was done
- Part 1 (#585): the five shared screens use Screen/ScreenTopBar/Headline from #577, with rounded token corners and serif h1 32/40. Notifications gets a quiet Try again for the first-load and next-page errors. My data gains a back control (it had none). Delete, export and block logic unchanged.
- Profile (#596): the 21 static colorTokens become semanticColors (textMuted 4.92:1 on bone; U2 fixed). The fixed top 60 becomes Screen plus a back chevron (it had none under the headerless More stack). The name is the h1, the tiles use radius.card and the monogram is round. Sign out becomes a TextLink. All routes are kept.
- Settings (#611): Screen + ScreenTopBar + h1. Section titles use the 11 pt Overline. QuietRow rows. Round steppers and monogram. The password sheet uses radius.sheet/input and PrimaryButton.
- Decision 133-14 (operator 18:24, in #611, since that PR stays under 800 lines):
  - The "Add a coach code" row shows only when there is no coach_id.
  - It opens the AddCoachCode screen (MoreStack). That screen shows the same CoachSharingNotice and version as RoleSelection and calls `authApi.attachInviteCode(code, version)` once per tap. Errors use inviteAttachErrorMessage.
  - Success: patchUserCache({coach_id, role}), then refreshEntitlement, then authEvents.emit('login').
  - Tests cover the row being shown only when coachless and the attach call.

## Decisions and notes
- The operator's 18:03 mail said "rebase". Q1 forbids it, so I did not rebase.
  - Part 1 was never pushed before the rebuild, so I reset the local branch to origin/main and checked out my files again (no force-push).
  - The other branches take main through `git merge origin/main`.
- Split into 3 PRs: everything together came to about 1,190 changed lines.
- #578 (QuietRow) merged into the ds-primitives branch, not main. Settings waited for #587, which re-landed it on main.
- NEED (DS-PRIMITIVES-133, nice to have): QuietRow has no `accessibilityLabel` override, so rows read "label, detail".
- NEED (operator, optional): `components/coachless/CoachCodeSheet` (/coachless/coach-code/redeem, with live check and welcome) already exists for coachless Home and Messages. The Settings flow uses attachInviteCode as instructed. One flow could be chosen later.
- Not seen on a device: all three PRs. Android descender clipping, real insets and press feel are unverified.
- Coach Settings (agent 134) opens the five part-1 screens, as #585's body says. The coach Settings file itself was not touched.
- ClientTutorialSetting (TOUR-133) was not touched.

## HANDOFF
- Done: #585 and #596 merged. #611 is READY at 3abed53a1cdd28636b6dc41d6b352b0f87049b69 and awaiting the lens audits (merges on dual APPROVE).
- Open items: none blocking. The two NEEDs above are optional.
- Local only (do not push): agent133/redo-settings-133-wip (the old combined branch, kept for reference).

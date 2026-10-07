Done: a community report for "Self-harm or suicide" now opens its "Report sent" confirmation with 911 and the 988 Suicide & Crisis Lifeline. The two leaderboard screens now show the server's reason when the community content filter refuses a display name. Not done yet: CI and the independent audit.

## Tier header
- Tier: T3, safety copy (crisis routing on a report confirmation) plus error copy for a backend content filter.
- Why: FW-COMM-128 U11 (no crisis line after a self-harm report) and the client half of U10. Without it, a refused leaderboard name would keep showing "Try again" when trying again cannot work.
- T4 trigger scan: no change to auth, authorization, tenancy, consent, PII, money, credentials or deletion. The report request is unchanged (same endpoint, body and Idempotency-Key).
- T3 trigger scan: safety copy (911 / 988) on the report confirmation is the T3 item. No prompt, quota, schema or dependency change.
- Bounded T1: one pure copy helper and its use in SafetyMenu. Three catch blocks in the two leaderboard screens now use the existing `contentRejectedMessage` helper.
- Canonical builder: CF-COMM-SAFE-128, agent 129 (Claude Opus 5.5).
- Parent owner: operator agent 129.
- Acceptance evidence: targeted jest files ran one at a time through `/home/user/workspace/ops/heavy.sh`: SafetyMenu 14/14, communitySafetyApi 15/15, leaderboardNameRejected 4/4 (see Failing-first).
- Promotion triggers: none needed. Any change to report routing or moderation goes to the operator.

## What changes for coaches/clients
- Anyone who reports a post, reply, win, voice note, challenge comment or DM as "Self-harm or suicide" now sees this first: "If someone is in immediate danger, call 911. To reach the 988 Suicide & Crisis Lifeline, call or text 988." The unchanged 24-hour review sentence follows. The other seven reasons keep the current confirmation word for word. Every community Report goes through `SafetyMenu`, so this one change covers all of those surfaces.
- Leaderboard: the backend PR on branch `agent129/cf-comm-safe-128` (growth-project-backend) adds the content filter. When it refuses a name (422 `community.content.rejected`), the opt-in card and Leaderboard settings now show the server's reason ("This display name was not saved ... Choose another name.") instead of "Could not save ... Try again." Any other failure keeps the generic copy. Against today's production backend nothing changes, because it never returns that 422 on opt-in.

## B/U list
- B: none.
- U11 (FW-COMM-128), fixed: a bystander who reports self-harm got only the 24-hour line, with no crisis number when it mattered.
- U10 (FW-COMM-128, client half), fixed: a refused display name now shows the server's reason, so the client is not stuck on "Try again".

## Routes/actions before -> after
| Label/action | Before | After |
|---|---|---|
| "..." on another member's content | opens the Report / Block sheet | unchanged |
| Report -> 8 reasons | POST /community/moderation/reports | unchanged |
| Report sent, "Self-harm or suicide" | 24-hour line only | 911 + 988 first, then the 24-hour line |
| Report sent, other 7 reasons | 24-hour line | unchanged |
| Block name | confirm -> POST /community/blocks | unchanged |
| Delete (own content) | confirm -> onDelete | unchanged |
| Cancel | closes the sheet | unchanged |
| Leaderboard Opt in | POST /me/leaderboard/opt-in, then reload | unchanged; a refused name shows the server's reason |
| Leaderboard Try again | reload | unchanged (still leads back to the opt-in card) |
| Leaderboard Back / Settings | goBack / LeaderboardSettings | unchanged |
| Settings switch | opt in / out, reverts on error | unchanged; a refused name shows the server's reason |
| Settings Save name | saves the name | unchanged; a refused name shows the server's reason and keeps the typed name |
| Settings Back | goBack | unchanged |

Parity tests:
- `SafetyMenu.test.tsx` "keeps every action reachable: Report, all eight reasons, Block and Cancel", plus the existing Block and Delete tests.
- `leaderboardRedo.test.tsx` (unchanged) still covers Back, Settings, Opt in, Save name and opt-out.
- `leaderboardNameRejected.test.tsx` checks that Try again still returns to the opt-in card.

## Truthful sweep
- The new crisis line states fixed, true routing facts: 911 for immediate danger, and the 988 Suicide & Crisis Lifeline by call or text. These match community guideline 7 and Roman's crisis templates, and the Lifeline is given its official name. No first person, no exclamation marks, no emojis, and no response-time promise beyond the approved 24-hour sentence.
- The refused-name message uses the server's own words. Other failures keep the generic copy.

## Overlap with open PRs
No open PR touches these files. I ran `git diff --name-only origin/main...origin/<branch>` for all 16 board branches at 16:09 PDT. This PR is based on main a1be6fb2 and the diff is kept minimal.

## README
- `src/components/README.md`: SafetyMenu row.
- `src/screens/client/LEADERBOARD.md`: Error state and Display name section.

## Failing-first
- New tests were run locally against main's source at 16:23-16:25 PDT, before the fix.
- `SafetyMenu.test.tsx` "a self-harm report leads with 911 and the 988 Lifeline, then the review line" FAILED: the alert showed only the 24-hour line.
- `leaderboardNameRejected.test.tsx`: 3 of 4 FAILED, because the screens showed the generic "Could not save ..." copy. The control test (generic failure) passed.
- After the fix, all three files pass.

Size: 210 changed lines (195 added, 15 deleted) in 9 files, tests included.

agent 129

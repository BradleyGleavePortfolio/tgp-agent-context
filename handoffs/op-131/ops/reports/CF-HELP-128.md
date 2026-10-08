# CF-HELP-128 — Change email support row

## Scope traced
- Assigned CLIENTFIX-128 row interpreted using the task name and explicit owner default: add Settings > Account > Change email, opening a prefilled support draft, not self-serve auth changes.
- Base mobile main: 084ed613. Source: FW-ACCOUNT-128 first-week polish item 6.
- Keep SettingsScreen integration minimal because CF-SETTINGS-128 owns its existing switches/password changes.
- Reuse supportMailto, useSupportEmail and SupportEmailFallback. No automatically included account data, no auth/backend changes.

## B list
- None.

## U list
- U1: clients have no Change email entry after signup. Add an honest support-email row with a prepared subject and request template.

## C one-liners
- None newly investigated.

## PRs
- Not opened yet. Failing-first rendered parity proof being prepared.

## Not fixed (needs operator)
- The original report's FWA-HELP-128 table lists a separate backend help-page vocabulary correction (help-pages.html.ts:665, “profile tab” → “You tab”). This task explicitly names the change-email row; do not mix a backend PR into this one-PR mobile assignment.

## HANDOFF
- In progress. Worktree: /home/user/workspace/wt/CF-HELP-128-mobile; branch agent128/cf-help-128.

# CF-DATA-COPY-128 — data screens copy

## Scope traced
- Assigned FWA-DATA-COPY-128 only: DataExportScreen, DeleteAccountScreen export reminder only, BlockedUsersScreen, SupportInboxScreen, targeted tests and matching module documentation.
- Current base main: 084ed613. [Merged PR #516](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/516) already corrected Delete account's Settings vocabulary and Blocked users' Retry/unblock failures; those fixes are left untouched.
- Both client More and coach Settings stacks already register DataExport; the reminder can use the existing route without an API or navigator change.

## B list
- None reported in the assigned account audit scope.

## U list
- U5 remaining: export session-ended guidance names a nonexistent Settings row; Delete account's correct My data reminder is not tappable.
- U6: export note says data cannot be recovered as soon as deletion is confirmed, rather than after the grace period.
- U8 remaining: empty block list mentions only conversations, not community.
- U10 Support: heading and open-chat action use title case.

## C one-liners
- None added; no edge-case work.

## PRs
- In progress; tests-first regression assertions added.

## Not fixed (needs operator)
- None within assigned scope.

## HANDOFF
- Builder active. Own worktree: /home/user/workspace/wt/CF-DATA-COPY-128-mobile; branch agent128/cf-data-copy-128.

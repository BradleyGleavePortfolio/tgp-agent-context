# DES-BB-127 (agent 128, Claude Opus 5.5) — privacy and data screens
## Scope traced
TrustCenterScreen, settings/DataExportScreen, settings/DeleteAccountScreen, settings/BlockedUsersScreen on mobile main c00a2a5f; checked against backend system.controller trust-meta, data-export controller and the AI provider.
## B list
None. No false legal or consent line found.
## U list (fixed in m#516)
- TrustCenter:501 "within 24 hours" -> "Usually ready to download in about a minute"
- DeleteAccount:662 "Data & Privacy" -> "My data in Settings, under Privacy and data"
- BlockedUsers:56 "Pull to retry" (no pull exists) -> "tap Retry"; :85 generic error -> what to do next; added a stale-list notice with Retry
## C
- Trust meta "Last security update" shows the backend floor (2026-04-25) because LAST_SECURITY_DEPLOY_AT is not set (C/U backend; operator: set it in deploy CI).
## PRs
m#516 head dd9b5e7de439476ccb4ef4c23271c48642520d62, 547 lines (over the entry's 500 target, under the 800 cap). CI green 14:57; READY posted. Verdicts: pending (builder finished per 14:08 override).
## Not fixed (needs operator)
- backend system.controller.ts:13 floor date: set LAST_SECURITY_DEPLOY_AT on deploy (optional).
## HANDOFF
READY posted at 14:58 at dd9b5e7d. Lens findings go to the FIX lane. Worktree: /home/user/workspace/wt/DES-BB-127-mobile.

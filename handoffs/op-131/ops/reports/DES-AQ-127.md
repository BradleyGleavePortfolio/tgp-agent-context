# DES-AQ-127 — Community direct messages and Find

Builder: DES-AQ-127, agent 128. Status: WITHDRAWN by the owner override; no branch, worktree, commit or push was created. A fresh agent owns the next screen.

## Scope traced
- Exact entry read: CommunityDmListScreen, CommunityDmThreadScreen, CommunityFindScreen, shared community MessageBubble and their tests.
- One PR under 400 changed lines; messaging/moderation/report/block behavior frozen.
- Depends on DES-AA #491 merged; then branch agent128/des-aq-127 from origin/main in /home/user/workspace/wt/DES-AQ-127-mobile.

## B list
- Prep observation only: DM list labels every participant "Coach"/"your coach", even for member conversations; default the label to neutral unless the actual coach id matches. [Read-only DM list](/home/user/workspace/wt/RO-mobile/src/screens/community/CommunityDmListScreen.tsx).
- Prep observation only: DM thread treats a failed query as an empty conversation and its "Start the conversation" action is a no-op; separate error/empty states and use ComposerInput's existing focus handle. [Read-only thread](/home/user/workspace/wt/RO-mobile/src/screens/community/CommunityDmThreadScreen.tsx).

## U list
- Pending source trace and truthful sweep.

## C one-liners
- None.

## PRs
- None.

## Not fixed (needs operator)
- No changes made; the task was withdrawn before its branch condition was met.

## HANDOFF
- Read-only preparation stopped; do not resume this job in this agent.
- A fresh agent can reuse the two prep observations above; check current main and #491 state first.

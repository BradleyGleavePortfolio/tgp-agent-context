# CF-ROMAN-COPY-M-128 — Roman app copy

## Scope traced
- Assigned CLIENTFIX-128 row only: FW-ROMAN-128 U3 mobile, U4 and U6 unpinned mobile wording.
- Baseline main: 084ed613bcd22c49d9cfa090e537d6ac5c1b92c0.
- Worktree: `/home/user/workspace/wt/CF-ROMAN-COPY-M-128-mobile`; branch `agent128/cf-roman-copy-m-128`.
- Coach relationship comes from `useCurrentUser().coach_id`; pinned consultation/server consent text and consent-ledger behavior stay unchanged.
- Shared refusal/modal/sheet wiring must be changed so copy variants reach all client AI entry points.

## B list
- None inherited from FW-ROMAN-128.

## U list
- U3: clients without a coach must not be told their coach is in Messages or sees their information.
- U4: load-state wording must name manual Try again, not promise an automatic retry.
- U6: unpinned directions must say Settings > Roman and AI, matching the current Settings row.

## C one-liners
- Existing Roman chat visual modernization is a separate lane, not included.

## PRs
- Not opened yet; failing-first regression being prepared.

## Not fixed (needs operator)
- No new scope requiring operator action identified.

## HANDOFF
- In progress. Finish this one PR to green CI, merge current origin/main before READY, post READY once, then notify and stop without waiting for lenses.

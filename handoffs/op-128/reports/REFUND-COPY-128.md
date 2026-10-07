# REFUND-COPY-128

## Scope traced
- Assigned FIXWAVE-128 row only: ClientPackagesScreen refund fine print and its existing purchase test.
- Existing in-app contact path verified: You > Settings > Support opens SupportInbox; no new action is required.
- Own worktree: `/home/user/workspace/wt/REFUND-COPY-128-mobile`; branch: `agent128/refund-copy-128`.
- Base: `c44763a1`; open m#473 touches nearby client documentation/Membership, not ClientPackagesScreen or its purchase test.

## B list
- B1: A client asks their coach for a refund as the screen says, but the coach has no refund control and cannot issue it.
- Fix: name The Growth Project team as refund issuer and direct the client to You > Settings > Support.

## U list
- None in assigned scope.

## C one-liners
- None.

## PRs
- Pending.
- Failing-first copy proof on unmodified base: expected team/support wording absent and false coach-refund wording present. New rendered assertions were added first. Per the explicit one-test-run limit, no pre-fix Jest run was started.
- Single targeted Jest run next: `src/__tests__/ClientPackagesScreen.purchase.test.tsx`; existing tests prove purchasing, ending plans, back/message/coach-code/retry, card update and inclusions action parity.
- Documentation exception: the assignment expressly limits this PR to one copy line plus its test; no README or other surface changes.

## Not fixed (needs operator)
- None in assigned scope; future coach refund controls remain agent 129's separate work.

## HANDOFF
- In progress. Production and all payment behaviour remain unchanged.

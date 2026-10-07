# CF-HOME-START-128

## Scope traced
- Assigned row only: FW-TRAIN-128 J6 / U7, Home hero navigation.
- Home reads history, assignments and the signed-in user's saved workout; the assignment detail is registered in More, the live workout in Train.
- DES-K2-128 PR #515 touches Home supporting-section styles. This fix stays minimal on main and does not change those sections.

## B list
- None.

## U list
- U7: Home's named Start and Resume buttons currently open only the Train tab, rather than the named assignment or saved session.

## C one-liners
- None.

## PRs
- Pending implementation and failing-first proof.

## Not fixed (needs operator)
- None.

## HANDOFF
- Worktree: `/home/user/workspace/wt/CF-HOME-START-128-mobile`.
- Branch: `agent128/cf-home-start-128`.
- Main baseline: `084ed613`.
- Tests updated first; production Home code unchanged for failing-first proof.

# CF-PROFILE-128 (CLIENTFIX-128, agent 128) — stopped by OWNER STOP 15:27 PDT

## Scope traced
FW-ACCOUNT-128 U1: src/screens/client/ProfileScreen.tsx read legacy names only; server row (/auth/me, GET /profile) uses current_weight_lbs, date_of_birth, goal_type, dietary_pattern, has_gym_membership, macro_target_*. Clinic onboarding writes only to the server, so the cache stays stale until next sign-in.

## Change (DRAFT m#522, head 563b6657ad5144641e91d6c79303e8b26c9494f6, +228/-55, 3 files)
- New src/screens/client/profileDisplay.ts: buildProfileRows (resolveProfileFields + label maps, no raw enums, Height and Allergies rows added), buildTargetRows (/me/macros/current first, else macro_target_*, else legacy; TDEE row dropped).
- ProfileScreen: focus effect (registered BEFORE the sharing effect, because tests call useFocusEffect.mock.calls.at(-1)) reads profileApi.get() and macrosApi.currentForSelf(); user-id tagged state; sentence case; "No daily targets yet."
- quietLuxuryDoctrine.test.ts: 'Sign Out' -> 'Sign out'.

## B list: none. U list: U1 (+ Profile title case).
## C: lean-onboarding cache stores current_weight in kg under the legacy name; only shown when GET /profile fails (C, edge, deferred to 10k clients).

## Not done / HANDOFF
- No tests run (local or CI). CI not checked. No READY comment. No verdicts.
- Still to do: failing-first test src/screens/client/__tests__/ProfileScreen.savedValues.test.tsx with a server-shaped row (mock profileApi.get + macrosApi.currentForSelf; invoke useFocusEffect.mock.calls.at(-2) for the new effect); unit test for profileDisplay; parity table in PR body; README row (src/screens/client/README.md ProfileScreen line) + QUIET_LUXURY_DOCTRINE section 8; run quietLuxuryDoctrine + truthfulCopy.guard tests via heavy.sh; mark ready, CI green, READY comment.
- Worktree: /home/user/workspace/wt/CF-PROFILE-128-mobile, branch agent128/cf-profile-128.

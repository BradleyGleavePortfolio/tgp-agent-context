# CF-MONEY-MEMBER-128 (agent 129 CLIENTFIX, Claude Opus 5.5) — FW-MONEY-128:MONEY-MEMBER-128

Status: STOPPED by operator at 16:37 PDT (credits); branch pushed, no PR. Fixes FW-MONEY-128 B-3 (Membership "Status: Active" from the coach link alone) and
U-4 ("Pull to refresh" with no RefreshControl; ink primary instead of forest).
Branch agent129/cf-money-member-128, worktree /home/user/workspace/wt/CF-MONEY-MEMBER-128-mobile, based on mobile main e634d19e.
No push yet.

## Scope traced
- MembershipScreen.tsx (main e634d19e): `accessGranted = Boolean(currentUser?.coach_id)` drives "Active" — false for a coach-linked
  client with no plan (backend ClientEntitlementGuard requires a paid/active/trialing ClientPurchase; coach link grants nothing).
- Plan read: clientPaymentsApi.getPaymentStatus() (GET /v1/checkout/purchases + GET /v1/clients/me/coach/packages; coachless -> empty list,
  state none). Entitlement: useEntitlement() (GET /v1/checkout/entitlement, same rows). Both live in production.
- Open PRs touching my files: none touch MembershipScreen.tsx. src/screens/client/README.md is touched by m#521, m#514, m#494, m#490,
  m#485 (other rows; the Membership row at line 29 is untouched by them) -> minimal README edit, said in PR body.
- CF-MONEY-PLANS-128 (in progress, no branch yet) edits ClientPackagesScreen.tsx (U-7 may remove the Current plan card). So Membership does
  NOT import currentPlanLine from ClientPackagesScreen (a later removal there would break Membership at runtime); it carries its own line
  with the same rules and words.

## B list
- B-3 (FW-MONEY-128): fixing in this PR.

## U list
- U-4 (FW-MONEY-128): fixing in this PR.

## C one-liners
- A coachless client who still has a live plan would read "Awaiting coach access": C (edge, deferred to 10k clients).

## PRs
- none (branch agent129/cf-money-member-128 pushed @ f4d1d1694344ae8d5365b784fe471a519370ee7b, no PR opened, no CI, no verdicts)

## Not fixed (needs operator)
- none so far

## Failing-first (16:31 PDT, local, main e634d19e MembershipScreen + new test)
src/screens/client/__tests__/MembershipScreen.status128.test.tsx: 10 failed, 1 passed (the coachless case already true on main).
B-3 test "a coach link without a plan is not Active": "Unable to find an element with text: No active plan" (main renders Active).

## HANDOFF
Branch agent129/cf-money-member-128 (own branch, pushed, no PR), head f4d1d1694344ae8d5365b784fe471a519370ee7b, based on mobile main e634d19e, worktree /home/user/workspace/wt/CF-MONEY-MEMBER-128-mobile.
Done: MembershipScreen.tsx (membershipStatus(): status from getPaymentStatus + useEntitlement, never coach link alone; RefreshControl + focus re-read; one forest primary Your plans / View coaching plans -> ClientPackages; Message your coach secondary; semantic tokens, hairlines, 44pt back), new test MembershipScreen.status128.test.tsx (failing-first on main 10/11 fail; now 13/13 pass), useFocusEffect added to membershipWebsiteLinkIos mock; local targeted passes: membershipWebsiteLinkIos 4/4, truthfulCopy.guard 20/20, paymentsConnectPackages 32/32, quietLuxuryDoctrine 30/30.
Left: src/screens/client/README.md Membership row (line 29), typecheck (CI; local file-rooted tsc not finished), git merge origin/main, open PR with tier header + parity table + 'diff kept minimal, based on main', CI green, READY comment, verdicts.

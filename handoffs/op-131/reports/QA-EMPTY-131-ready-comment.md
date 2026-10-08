FIX ROUND 1 (OPENING) (QA-EMPTY-131, agent 131) — growth-project-mobile#555 @ 042bb82dd9450b8a337170d7a043c313be293a41 — READY FOR AUDIT

Entry: FIX_PLANS_130_131 C3 row QA-EMPTY-131 (source AUD-FIN-DESIGN-129 U6, U8). T1 mobile, style and copy only.

- `ui/empty-states/EmptyState`: the CTA now presses through HapticPressable (light). It is forest, radius 4, at least 44 pt, with an Inter 16 label. The body uses textMuted.
- `components/EmptyState`: Cormorant h3 title, muted Inter subtitle and semantic theme colours. It uses the same CTA, which now has role button.
- `EmptyStateNoClients`: Cormorant h2 headline. The buttons read "Share your code" and "Open invite codes" (the button opens Invite codes, not Settings), are 44 pt and have radius 4. Copy is 44 pt. The code box is unfilled with the theme hairline. The Copy haptic goes through HapticService.
- The CheckoutReturn title and PurchaseUnpack's "You're in" now use `typography.h2`.

B: none. U: U6 and U8 fixed, plus three new Us fixed (the mislabelled Settings button, the CTA with no button role, and the Copy haptic ignoring the switch). Grades are in the PR body.
Failing first on main e1688b51: 9 of 9 new tests failed for the intended reasons. They pass at this head, along with the related suites listed in the PR body.
Size: 11 files, 389 changed lines. Merge with main 2bed5deb is clean. CI is green at this head (CI "Typecheck, lint, test" and CodeQL).
Not touched: EmptyStateNoWorkouts.tsx (m#542), src/components/community/EmptyState.tsx, docs/QUIET_LUXURY_DOCTRINE.md.

agent 131

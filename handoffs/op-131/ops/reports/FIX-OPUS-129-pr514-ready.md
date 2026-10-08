FIX ROUND 2 (FIX-500-128, agent 129, FIX-OPUS-129) — growth-project-mobile#514 @ 7691dc6096b198c5ecdfbf64af492a55823f0fcd — READY FOR AUDIT

Fixes the GPT-6.1 Sol REQUEST CHANGES at d3a4f15d (comment 6047850446). Claude Opus 5.5 approved d3a4f15d (6047784340); both lenses please review this head.

- **B1 fixed** (unknown source denied a meal plan): a missing `source` is now unknown, not library. The summary stays neutral ("{n} recipe(s) available to this account."), and "None of these come from a meal plan." shows only for an explicit `source: 'library'` (`PrepGuideScreen.tsx:95`, `:219`). Regression test: `GroceryPrep.parity.test.tsx:160` "unknown source ... never denies a meal plan". It failed against the d3a4f15d screen and passes now.
- **U1 fixed** (week filter that does nothing): the week selector now depends on `week_filter_applied === true`, not on the source. It also still shows once the client has left the current week, so they can always get back (`PrepGuideScreen.tsx:98`, typed at `:58`). NUTR-BE sends `false` for both sources, so production hides arrows that would change nothing. Tests: `:181` covers a plan source with the flag undefined or false (no arrows; failed first, passes now). `:189` covers the flag true (selector shown), and `:197` covers coming back to the current week. The parity test "both week arrows" now uses a guide that filters by week.
- Backend check: production is backend deploy 26 at 87f4489b. It includes NUTR-BE b#853, and `prep-guide.service.ts` there returns `source: 'plan' | 'library'`, `week_filter_applied: false` and `prep_day_suggestions: []`. So in production, a library guide shows the true no-plan line, a plan guide says "from your meal plan", and no week arrows show.
- Not changed: Sol C (failure copy after an ambiguous lost response) is C (edge, deferred to 10k clients). Opus Cs are unchanged too (title-case alert titles, local EmptyState).
- README row edited in place (`src/screens/client/README.md`). The PR body's parity table, truthful sweep and evidence are updated.
- origin/main (a1be6fb2) merged with no conflict. Size: +158 / −31 = 189 changed lines in 4 files. No dependency, navigator or backend change.
- CI at this head: 4/4 SUCCESS (Typecheck, lint, test; CodeQL; both Analyze jobs). Local runs (ops/heavy.sh): GroceryPrep.parity 24/24 and quietLuxuryDoctrine 30/30. With the d3a4f15d screen, the 3 new B1/U1 cases fail.

agent 129

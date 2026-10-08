FIX ROUND 1 (OPENING) (DES-AE-127, agent 128) — growth-project-mobile#485 @ ea0c96ea423cd3ea07d964ce177cb2387001f8fd — READY FOR AUDIT

Tier T1. 270 changed lines (232 additions, 38 deletions), including tests.

B1: neutral empty-state copy no longer invents a coach relationship.
U1: incomplete assignments use “To complete”, not “Upcoming”.
U2: assigned workouts use scheduled-date overlines, readable hairline prescribed exercise rows and catalog names; history editing uses a serif title, semantic hairline inputs and one 44-point forest save action.

Full CI typecheck/lint/test and all CodeQL checks green at this exact head. GitHub REST confirms mergeable=true / mergeable_state=clean. Latest main was merged; README-only conflicts retain other workers' ClientMacros/Habits entries verbatim and both own-screen entries in alphabetical positions.

Targeted owned-screen suite 11/11 and existing workoutSession124 regression 11/11 pass locally after the latest refresh. Doctrine also passes. Baseline screen proof: seven failures on unchanged main, four behavior-parity cases pass. Routes/actions and truthful sweep are in the PR body; no path or save/cancel behavior removed.

Owner 14:08 override: builder finishes after READY; standing lenses/FIX lane own subsequent review. No PR merge, deployment or production changes.

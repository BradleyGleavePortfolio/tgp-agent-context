# Lane S-MWB (agent 111) — Claude Opus 5.5 builder: coach "Programs" master workout builder, Phase 1 (day-1 blocker; no PR yet)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; prompt v5 section 4.8 (Programs; binding), 4.9 (flags), 4.11-4.13 (newer
owner decisions win) and section 9 (tiers) in /home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md;
/home/user/workspace/repos/tgp-agent-context/FLAGS_LAUNCH_LEDGER.md (MWB rows). Owner words: "a non-client specific, overreaching
master workout builder system — I give every male an intro package, let me build it once, save it, and use it for everyone +
auto-assign tools". Rules: more functionality, not less; hyperscaler quality; no generic errors (specific, recoverable, with a
visible reference); WCAG 2.2 AA; every number/list from live routes; nothing fake or dead reachable.
Recon first (30 min max, read-only): map the June MWB backend (MWB-1/2/3/5: #376/#381/#386/#385; flags FEATURE_MWB_TEMPLATES,
FEATURE_MWB_AUTOSAVE_UNDO (needs MWB_AUTOSAVE_LOCK_TOKEN_SECRET), FEATURE_NAMED_REGIMES) on backend main b9ee8e0a: endpoints,
DTOs, RLS, tests; the mobile Templates tab (hard-coded text today), the existing single-workout builder (opens only from a client
page), package contents fan-out of workout_program (verify it also fires on $0 invite grants, backend #595), and #607's
3-program rule table (must keep working). Write the gap list in your report before coding.
Build Phase 1 as a short stack of reviewable PRs (grade each T0-T4 in its body; anything touching entitlements/package grants or
bulk writes across clients is at least T3):
1. Coach "Programs" tab replacing Templates: library with search, goal tag, weeks x days, assigned count; create/edit on a
   week-by-day grid where each day opens the existing workout builder with autosave + undo; duplicate, archive, revision history,
   promote to a named regime; a saved-workouts library.
2. Bulk-assign a program to many clients with a start date (cloned per client, idempotent, partial-failure reporting per client)
   and "Add to package" so everyone who joins gets it (including $0 grants).
3. Any backend gaps found in recon (small backend PRs; register env names per #624; migrations: ask the operator for a prefix —
   next free 20270223000000 — before creating one).
Mobile flags: EXPO_PUBLIC_FF_MWB_* per the ledger; backend flags go on via the launch-flag manifest (backend #637, not merged) —
list the exact manifest entries needed in your report; do not edit #637.
Merge mains with merge commits (mobile e3986e89+, backend b9ee8e0a+). Tests via heavy.sh (targeted jest --runInBand; tsc once per
repo per round). Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/S-MWB-111.md
(append as you go). Final answer (<400 words): PRs, heads, tiers, what a coach can do now, tests, CI, open gaps.

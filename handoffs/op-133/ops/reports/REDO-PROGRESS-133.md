# REDO-PROGRESS-133 (agent 133 lane, builder claude_opus_5_5) — APPLY-PROGRESS-133 (DES-P-128, never started)
Worktree /home/user/workspace/wt/REDO-PROGRESS-133-mobile. Reference: design-targets/mobile/progress-details/luxury.jpg ("The full picture").
Reach: More > Progress.

## Status (19:2x PDT)
- PR A growth-project-mobile#610 (weight trend), head ab3acfa59f1a933f5c45b66791c13c3e44ca514d, 559 lines, CI green
  (Typecheck, lint, test; CodeQL), MERGEABLE, READY posted. No reviews yet.
- PR B (today's food U3, BMI U2, weigh-ins, sheet): branch agent133/redo-progress-133-b @ 8113224f (pushed, NO PR yet), 739 lines on
  top of A. Body ready: ops/reports/REDO-PROGRESS-133-prB-body.md.
- PR C (frame, Body numbers U12, inline Log weight, FAB gone, report foot row): branch agent133/redo-progress-133-c @ 72fc8280
  (pushed, NO PR yet), 635 lines on top of B. Body ready: ops/reports/REDO-PROGRESS-133-prC-body.md.
- Why three: the redesign is about 1,930 changed lines (old ProgressScreen.tsx is 1,325 lines; its own churn alone is ~1,200), so
  under 800 per PR needs three, and they touch the same file, so B and C are sequential (no stacked PR bases after the #578
  incident).

## Earlier notes (resolved)
- 18:10: #578 (QuietRow, WheelBand, QuietSection title) had merged into its stale stacked base; it reached main later as #587, so
  QuietRow is on main now. No action needed.
- Mail said "rebase onto origin/main": header Q1 forbids rebase, so main came in with `git merge origin/main` (no force-push).

## R1 verification against main df7b8ae9 (ProgressScreen.tsx)
All APPLY rows were still on main (line numbers match the audit): FAB :807-817 / style :1231-1242; cream boxes :975, :1027,
:1078, :1122, :1143 (emptyChart), :1174; sub-13 pt text :179, :957, :999, :1015, :1043, :1067, :1115, :1193, :1201, :1227;
uppercase :181, :1046, :1196, :1322 (Save label); Title Case "Body Stats" :759, "Recent Entries" :783, "Weight Trend" :708/:718,
"Goal Progress" :675; 15 hardcoded radii; header paddingTop 60 under a native header (:939); serif line heights 26/30, 32/35, 22/26.
WEIGH-KB U2 (empty Body Stats heading :758-777), U3 (invented "/ 2000 kcal" :594), U12 (Start = period's first entry :443) were open.
Flag: romanFirstPaymentBodyweightPolish defaults OFF and eas.json does not set it, so the owner's build shows the static chart;
the redesign draws that one (WeightTrendChart) and leaves the flag-on ProgressChartCard path unchanged.

## What each PR does (APPLY rows)
- A #610: chart in a hairline overline section (no cream box, no Title Case); underline text tabs 7D/30D/90D/All beside it; static
  ink line with dashed guides and tabular labels; one period sentence ("Down 3 lb / over the last 30 days"); All = every weigh-in
  (3,650 days, was 365).
- B: today's food as QuietRows with real targets only and "—" until the read lands, failed-read line (U3); BMI from height_cm,
  monochrome, no empty heading (U2); weigh-ins as hairline rows; sheet on radius.sheet / radius.input with PrimaryButton Save.
- C: Screen under the native header (no paddingTop 60); "The full picture" + Since overline; run line + Share link; Body numbers
  with the goal bar, BMI and energy rows; Log weight as the one inline forest PrimaryButton (FAB removed); "View progress report"
  foot row; Start/Change/goal/Since/run from every weigh-in (U12). Every action kept: chart, 7D/30D/90D/All, goal, body stats,
  entries, Log weight, report link, weigh-in share.

## Evidence
- Renders (react-native-web, real fonts and tokens, demo data): ops/reports/REDO-PROGRESS-133-render/prA-full-{360,390}.png,
  prB-full-{360,390}.png, prB-sheet-390.png, prC-full-{360,390}.png, prC-empty-390.png, prC-sheet-390.png. Harness (not
  committed, git-excluded): wt/REDO-PROGRESS-133-mobile/.render-progress133/run.sh <full|empty|sheet> <w> <h>.
- Not seen on a device by me.
- Tests at C (one file at a time): fullPicture 9/9, measures 8/8, trend 8/8, weighIn 9/9, chart 8/8, quietLuxuryDoctrine 34/34,
  romanP3HostWiring 35/35, romanP3FlagOff 11/11; tsc clean at A, B and C; eslint clean.

## NEED (for DS-PRIMITIVES-133, via the operator)
- NEED src/ui/buttons/PrimaryButton.tsx — an optional `accessibilityLabel` prop (default = label). The Log weight sheet's Save
  must keep the label "Save weight log entry" that src/__tests__/quietLuxuryDoctrine.test.ts:303 presses (I may not edit that
  test), while the visible text should read "Save". Until then the visible label is "Save weight log entry". — REDO-PROGRESS-133

## HANDOFF
- Done: #610 (PR A) open, CI green at ab3acfa59f1a933f5c45b66791c13c3e44ca514d, READY posted.
- Waiting on merges, then needs a builder or the operator (each step is mechanical; bodies are written):
  1. After #610 merges: in the worktree `git checkout agent133/redo-progress-133-b && git fetch -q origin && git merge origin/main`
     (README.md row may conflict: keep the B row), run the 8 test files above one at a time, push, then
     `gh pr create --base main --head agent133/redo-progress-133-b --title "[133] REDO-PROGRESS-133 B: U2 U3 today's food, BMI,
     weigh-ins and the sheet to progress-details" --body-file ops/reports/REDO-PROGRESS-133-prB-body.md`; CI green; READY.
  2. After B merges: same with agent133/redo-progress-133-c (title "[133] REDO-PROGRESS-133 C: U12 + FAB: the full picture frame,
     Body numbers, inline Log weight", body ops/reports/REDO-PROGRESS-133-prC-body.md).
- Until C lands the owner's build shows the new chart (A) or chart + lower half (B) inside the old top half; the full screen needs C.
- Needs operator: 2 (open B after #610 merges and C after B merges, or relaunch me for it; the PrimaryButton accessibilityLabel NEED).

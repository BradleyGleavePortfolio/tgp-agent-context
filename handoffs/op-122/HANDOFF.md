# Operator 122 -> 123 handoff (2026-10-05 17:58 PDT)

Owner stopped the fleet at 17:55 ("stop all agents asap", 41k/45k). No agents are running. GitHub is the truth: re-check every head
before acting. Lane files: handoffs/op-122/ops/ (JOBS122.md has every job entry; _COMMON_122.md has the shared rules incl. the 17:38
note: use `gh api .../actions/runs/<id>/jobs`, not `gh run view`, which hits the 60/hour IP limit).

## State
- Launch path 3/7: 1 Privacy, 3 Coach (mobile m#345 merged 17:43; backend live), 4 Failed payments (backend deploy 5; lockout m#352
  merged 17:47; FEATURE_DUNNING_V2 OFF). Step 5 Health Connect: code + flag merged/live; only the owner device pass on the 10-07 build.
  Step 2 Money: payment sheet m#342 + trials left. Step 6: programs flags, m#339, m#340. Step 7: builds (Expo build 10-07).
- Backend main 0521b3930e34bf20d8594dc5d043174c1d49d784, main CI GREEN. Production = eb2e9e03 (deploy 5, 17:42, migrations applied).
  Main is ahead of prod by b#735 (booking options), b#655 (approve-to-adjust, flag off), b#726 (broadcasts split 1, flag off), all with
  migrations. FIRST ACTION: dispatch fly-deploy.yml release_sha=<current main 40 hex> confirm=deploy migrations=apply-migrations,
  approve production (pending_deployments), check /health + /readyz.
- Mobile main 7083b7a1f91744fdc8101f7255417f778562e639 (CI green at fb904a75; check 7083b7a1 = m#341 merge).

## Backend open PRs
| PR | Head | Verdicts | Next |
|---|---|---|---|
| b#643 reminders flag on | 2234862b | dual APPROVE (RM1) at this head | merge to main any time (m#341 already merged); flag applies via env sync |
| b#725 lockout allow-list strict table | b3caa5b1 | dual APPROVE at 1dbc59b6; refresh b3caa5b1 NOT reviewed (LA1 cancelled) | LA1 delta pair (entry in JOBS122), then merge |
| b#736 AI guide crisis before limit | 58a31e6f (unaudited fix push by cancelled B-AIG2) | both RC at f2dd87ad (B-736: Tylenol bottle + "hang myself" missed; "overdose on cardio/creatine", "hurt myself deadlifting" false 911/988) | check the fix commit covers all five, then lens pair, merge |
| b#737 programs flags on | f743dc73 | none (MF2 cancelled) | MF2 pair; merge ONLY after owner confirms GitHub secret MWB_AUTOSAVE_LOCK_TOKEN_SECRET exists |
| Roman stack #667 c5102cae -> #665 4dde3ffe -> #666 8cfad607 -> #668 fefe73c6 -> #669 -> #670 | #669 31573c83, #670 30f09747 (unaudited pushes by cancelled B-RMNC3) | #667/#665/#668 dual APPROVE; #669 Opus APPROVE / Sol RC (B-669-1 meals aggregate without "today") at ef71cb9c; #670 dual APPROVE at dc159eaf | verify RMNC3 push fixes B-669-1 (ops/reports/AUD-SOL-RMN4-122.md), delta pair on #669/#670, land #670->#669->#668->#666->#665->#667, #667 to main |
| b#671-#707 trials | 4315136a | needs main refresh + R75 cast fix in 2 specs + delta pair | HOLD until owner confirms the Stripe webhook change |

## Mobile open PRs
| PR | Head | Verdicts | Next |
|---|---|---|---|
| m#339 voice sweep | 0b0de03d | dual APPROVE (VC1) | conflicts with main (CoachEarningsScreen deleted in main; CoachPackageEditScreen): refresh (B-339R entry), voice check, delta pair, merge |
| m#381 coach booking options editor | feab0c3b | both RC: B-381-1 (14+ days notice hides all times; ruling: editor refuses 14+ days) | M-AVAIL2 entry, then delta pair, merge (needs b#735 deployed) |
| m#382 programs flags in production/clinic profiles | 695460e7 | none (MF2 cancelled) | MF2 pair; merge before the 10-07 build, with b#737 |
| m#342 payment sheet (collapsed #344/#343) | 4c79b67c | dual APPROVE train (10-04), tree = audited top | main refresh (B-SHEET7 entry: conflicts expected-env.json, ClientPackagesScreen.tsx), delta pair, merge |
| m#340 tax CSV | 62794564 (rebased onto main by cancelled B-340, unaudited) | Sol RC 10-03; FR1 never audited | confirm diff is CSV-only, lens pair, merge |
| m#338 trial setting | 48b5e6b5 | dual APPROVE | HOLD with trials |
| m#336 | e043bb44 | dead base | likely superseded by scheduling m#365-#367 (B-367-1 fix); owner OK needed to close |

## Owner to-dos
1. Stripe webhook we_1UMt9WDUoC5CCVhShvAELVmI: add refund.updated, keep customer.subscription.trial_will_end (gates trials).
2. MWB_AUTOSAVE_LOCK_TOKEN_SECRET: GitHub > growth-project-backend > Settings > Secrets and variables > Actions > New repository secret,
   64+ characters 0-9a-f (gates b#737 programs flags). Agent 122 did not create it (needs owner authorization).
3. Health Connect device pass + Android push check on the 10-07 build; Supabase Pro day 1.
4. Optional: authorize closing superseded PRs m#331 (Roman chats, split landed) and b#657 (coachless, split landed); the safety check
   blocked agent 122 from closing them without owner OK.

## Notes
- Up-to-date is off: after several main merges, check main CI. Two green PRs broke main once today (b#658 + b#721 -> fixed by b#734).
- Open Cs worth tickets: C-380-4 (raw text on unknown restart error), C-380-5 (dispute push does not open the client), C-734-1 (revoked code
  shows "has expired"), Opus C-337 (raising sets shows negative "% less volume", fix before the adjust flag turns on), C-669-1 (800 mg
  ibuprofen gets 911), AI guide hourly throttle still blocks crisis, Roman ROMAN_DAILY_COST_CAP_USD $25/day is platform-wide.
- Reports for every job: /home/user/workspace/ops/reports (sandbox; key findings are in the PR comments).

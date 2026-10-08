# Operator agent 131 HANDOFF (2026-10-07, written 21:57-22:10 PDT)

Read with: handoffs/op-131/AGENT_132_START_PROMPT.md (your prompt), ops/FLEET131.md (full log), ops/OWNER_DECISIONS_131.md
(owner words, verbatim), ops/HOLD.txt, ops/PROPOSALS131.md (every worker proposal with its default), reports/ (29 worker reports).
GitHub main wins over anything written here. Re-verify every head before acting.

## What agent 131 did
- 20:10-20:44 recon (ops/RECON131.md). 20:45 launched 25 agents (14 lanes, 11 builders), then 4 more by 21:05: 29 in all.
- Merged 17 PRs, all via merge_if_dual.sh with both lenses APPROVE at the exact head and checks green:
  b#873, m#544 (20:44); m#546, m#537, b#855 (21:05); b#865, b#875, b#876, m#545, m#542, m#547, m#548, m#550, m#553 (21:31);
  b#874, m#555, m#554 (21:51). Merged today: 153.
- Deploys: 33 (f0cd518a, 20:56), 34 (46523a56, 21:51, no migrations), 35 (21598a39, 22:06, apply-migrations for b#874's
  20270405000000_coach_ai_budget_exact_usage). /health and /readyz ok after each. Production = backend main 21598a39.
  Deployed today: 17.
- Flag: FEATURE_ROMAN_PLAYBOOK on in production since 21:18 (fly-env-sync plan 37726665200: 1 to set, 77 unchanged; apply
  37726828741 with deploy_staged=true; the machine proved every declared value; /health and /readyz 200).
- Owner wind-down (credit budget) started 21:50; no agent was launched after 21:10. All 29 agents ended cleanly on the
  stop rules by 22:03, with their work pushed.

## Credits (owner readings only; never estimate)
- About 1.2k at 20:45 (swarm launch), 9k at 21:05, 10.6k at 21:08, budget 45k. 25 agents burned about 24k an hour by the
  owner's readings, so lanes idling in loops are expensive: size the lens pool to the builders actually running.
- A one-off alert automation fires at 22:20 (straight-line 41k time) in its own thread; it does no work.

## iOS build 7 and the APK: agent 132, tonight (owner 21:10)
- Expo token: saved by the owner in the secure form (user scope, "Expo access token (EAS builds)", host api.expo.dev,
  Always allow). Find it with list_credentials and pass its handle in bash api_credentials. Never print it.
- eas-cli: install in a private prefix, patch build/fetch.js so only api.expo.dev requests use the proxy agent
  (SoT ~4243-4245), run with https_proxy=$HTTPS_PROXY and EXPO_TOKEN=proxy-injected. Install without the Expo credential
  attached (the credential proxy only allows api.expo.dev).
- iOS: from a clean mobile main worktree, `eas build -p ios --profile clinic --auto-submit --non-interactive`
  (app.json ios.buildNumber 7, ascAppId 6765847915). Then ask the owner for TestFlight approval.
- APK: eas.json "preview" (and "development") build Android APKs (buildType apk); "clinic" extends "production" (store
  builds). Confirm with the owner which env the APK needs before building. app.json android.versionCode is 5.
- If m#551 (iPhone credit packs) merges before the cut: App Store Connect availability must be US only and the App Review
  note must describe the external checkout link. Publish no clinic OTA after m#551 merges until availability is US only
  (LN-OPUS-E-131: OTA is on and scripts/eas-update-guard.js gives clinic updates the clinic env).

## Merge holds (ops/HOLD.txt)
- b#871 failed-payment copy: dual approved at fa38982e; merge only after the owner's yes (owner decision 1 below).
- b#872 coach AI respects sharing: FIX ROUND 2 at b84193df; needs both lenses at that head.
- Lifted: CREDIT-PAY-131 (m#551, b#877): owner said yes to the US external link at 20:54.
- Order note: b#874 merged before b#870, so b#870 gets the merge-main round (coach-ai-budget.service.ts: keep both sides).

## Open PRs (heads verified on GitHub at 22:03), oldest first
| PR | head | lines | state | next |
|---|---|---:|---|---|
| b#870 credit refill rollover | 87f7f275 | 479 | FIX ROUND 3 READY; conflicts after b#874 | merge-main round (FIX-OPUS), then both lenses |
| b#871 failed-payment copy | fa38982e | 166 | dual approved, HOLD | owner decision 1 |
| b#872 coach AI sharing gate | b84193df | 520 | FIX ROUND 2 READY | both lenses |
| b#877 credit-pack checkout (backend) | dc6149d7 | 386 | dual approved, conflicts after b#874 | merge-main round, both lenses again, merge, deploy, then fly-env-sync (two pack return links) |
| b#878 coach rows without client secrets | 3ec27c47 | 159 | READY 21:52, CI green | both lenses (privacy, T3+) |
| m#549 home food UI | 371c555b | 371 | FIX ROUND 2 READY 22:02 (Sol B=1 fixed: a failed first water read no longer shows a false zero) | Opus and Sol delta reviews |
| m#551 iPhone credit packs | ae7e2a94 | 786 | Sol APPROVE, Opus REQUEST CHANGES (B=2 false copy), conflicts | FIX ROUND 2 (copy only), merge-main, Opus delta |
| m#552 calmer fasting | f41ea9b1 | 747 | Opus APPROVE, Sol REQUEST CHANGES (B=1: "all fasts" label must say "recent fasts"), conflicts | fix + merge-main, both lenses |
| m#556 coach calm error and skeleton states | 53f10d0a | 746 | READY 21:55, CI green | both lenses |

## Not started (the roster order is the priority)
- Wave 1 remainder (13): COACH-SETTINGS-131 (m#546 merged, unblocked), PACKAGE-ARCHIVE-COPY-131, AI-DRAFT-KEEP-131,
  BROADCAST-KEEP-131, MEAL-TEMPLATES-ROUTE-131 (m#545 merged; check CoachNavigator.tsx against m#551), TEAMPROFILE-131,
  ONB-N2-COPY-131, COACH-TIMELINE-STATES-131 then CLIENT-ARCHIVE-COPY-131, SMALL-BE-COPY-131 (Opus: roman-post-check line;
  its dunning items wait for b#871), SMALL-M-COPY-131 (add FAST-CALM-FIN-131's two copy items), ALLERGY-CHOICES-131 (Opus),
  CHURN-LABELS-131 (Opus; after b#872). Entries: handoffs/op-129/FIX_PLANS_130_131.md and the 131 prompt section 3.5.
- Wave 2 (37): D2 rows (28), C4 TEAM-* (6, fold in the owner's team sharing rule), PACKAGE-SHARE-BE/M-131 (after the iOS
  submission), COACH-PAY-FLIP-131 (after the owner's yes; reword refund lines in m#534 and ClientPackagesScreen).
- New, proposed to the owner with defaults (decisions 4-7 below): COACH-PAY-SUBCOACH-131, credit-pack non-refundable line,
  ROMAN-ED-FLAG-131 (Opus, T4), WORKOUT-SUSPEND-131 (about 10 lines). Owner YES already, not built: PB-FAIL-LIMIT-131 (Opus):
  charged failed playbook attempts count toward the 6 h limit (playbook-builder.service.ts:176, :229-238). Low urgency from
  the code: the playbook cron is '0 */6 * * *' UTC (playbook-builder.scheduler.ts:38), so failures already retry at most
  every 6 hours. First playbook run with the flag on: 06:00 UTC (23:00 PDT).

## Owner decisions still open (numbering of the 21:21 message; defaults in brackets)
1. b#871 failed-payment copy as shown [merge as is].
2. No-coach screen wording [keep the new wording].
3. Android purchases [stay hidden until the app is on Google Play; then choose Google's link program or Play billing].
4. Sub-coach money buttons [own clients only, same full-refund warning, head coach notified; build before COACH-PAY-FLIP].
5. "Credit packs are non-refundable." beside pack prices [yes; CREDIT-PAY-131 ended before adding it].
6. Eating-disorder coach alert [private alert without message text, only with a coach, Roman tells the client].
7. Workout left suspended over 12 hours still counts the gap [small follow-up].
8. Standing rule on platform rules [cheapest legal path always; no tricking review, no going around device-maker data terms,
   client health data shared only with the client's consent]. The owner's 21:21 words are in OWNER_DECISIONS_131.md.

## Owner-only items
- Stripe Dashboard: confirm the live webhook sends checkout.session.completed and checkout.session.expired before any
  coach buys a pack (production has never processed a Stripe event).
- App Store Connect: US-only availability and the external-link review note if m#551 ships; privacy labels; listing fixes.
- Supabase: Apple sign-in on; Google return address tgp://auth/callback allowed.
- Tester accounts (Roman playbook and memory checks, steps 3-4 of the playbook sequence), TestFlight approval, first real
  push on a phone after build 7 reaches TestFlight.

## Lessons from agent 131
1. Builders must wait for CI and post READY before ending: HOME-FOOD-UI-131 ended with CI pending and no READY.
2. Lenses idle in loops cost credits; 12 lenses for about 10 builders was more than needed.
3. When a file-sharing pair is ready out of order, merge the ready one and give the other its merge-main round.
4. Check every open owner decision tied to a flag before applying fly-env-sync (D7's follow-up was not built when the
   playbook flag went on; low impact here only because the cron is 6-hourly).
5. Decision numbers differ between operators' lists. Cite decisions by topic plus number, and keep one numbering in
   OWNER_DECISIONS.
6. The GitHub token file expires; refresh ops/.ghtoken on every GitHub call (a stale file gave 401 at 21:16).
7. board.json is a dict: {"updated_pdt", "updated_epoch", "prs", "merged_last_4h"}.
8. A relative worktree path once created wt/ inside a clone; always pass absolute paths to git worktree add.

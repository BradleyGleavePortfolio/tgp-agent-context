# Operator agent 131 HANDOFF (2026-10-07, final update 23:50-23:59 PDT)

Read with: handoffs/op-131/AGENT_132_START_PROMPT.md (your prompt), ops/FLEET131.md (full log), ops/OWNER_DECISIONS_131.md
(owner words, verbatim), ops/HOLD.txt, ops/PROPOSALS131.md (worker proposals with defaults, first wave), reports/ (all worker
reports, each ending in HANDOFF; the restart wave's "Proposed" sections are summarised below).
GitHub main wins over anything written here. Re-verify every head before acting.

## What agent 131 did
- 20:10-20:44 recon (ops/RECON131.md). 20:45 launched 25 agents, 29 by 21:05. Wind-down 1 from 21:50; all ended by 22:03.
- 22:35 the owner gave more budget ("You have 22.2k credits left so keep going"). 22:45 relaunched 12 (6 lenses, 2 Opus fixers,
  4 builders). Wind-down 2 from 23:45 (automation 838aba4f); all 12 ended cleanly by 23:51.
- Merged 31 PRs, all via merge_if_dual.sh with both lenses APPROVE at the exact head and checks green. Merged today: 167.
  - Wave 1 (17): b#873, m#544, m#546, m#537, b#855, b#865, b#875, b#876, m#545, m#542, m#547, m#548, m#550, m#553, b#874, m#555, m#554.
  - Restart (14): b#870 (credit refill rollover), m#549 (home food UI), m#556 (coach calm error and loading states), b#877
    (credit-pack checkout, backend), b#879 (playbook 6-hour limit counts charged failed attempts, owner D7), m#551 (iPhone credit
    packs through the US web link), m#552 (calmer fasting), m#557 (consultation wording), m#558 (package archive copy), b#878
    (coach replies without client push token, deletion hash or sign-in id; sub-coach scope fix in coach.service.ts), m#560
    (broadcast text kept on Back), b#872 (coach AI respects sharing; HOLD lifted 23:36), m#559 (coach Settings), m#561 (AI
    workout draft keeps edits; model and cost footer removed).
- Deploys 33-37. 35 (21598a39, 22:06, apply-migrations for 20270405000000_coach_ai_budget_exact_usage), 36 (ee4bf222, 23:25),
  37 (652b07a8 = backend main, live 23:51, run 37739627312; /health and /readyz ok). No prisma change after 35. Deployed today: 19.
- Flags: FEATURE_ROMAN_PLAYBOOK on since 21:18. COACH_AI_PACK_SUCCESS_URL and COACH_AI_PACK_CANCEL_URL (b#877, not secret) are
  NOT set: plan 37740058514 said 2 to set, 78 unchanged; apply 37740133744 failed before staging (nothing changed). From the code,
  .github/workflows/fly-env-sync.yml:359 only accepts values matching [a-z0-9_]+([.,][a-z0-9_]+)*, and these links hold ':', '/',
  '?', '=', '{', '}' and capitals. While the manifest holds them, EVERY apply fails, so fix this before any other flag change
  (owner decision 11). Build 7 does not need them: the US-link iPhone checkout sends its return links inline.

## Credits (owner readings only)
- About 1.2k at 20:45, 9k at 21:05, 10.6k at 21:08, 22.8k used at 22:35 (22.2k left), 34k used at 23:49 (11k left of 45k).
- By those readings the fleet used about 1k credits per agent-hour (about 21.6k for about 23 agent-hours, 20:45-22:35).
  The 21:12 projection (41k at 22:20) assumed 25 agents for a full hour and was far too high: agents finished jobs and the fleet
  shrank. Project from agent-hours, not from the first 20 minutes.

## iOS build 7 and the APK: agent 132 (owner 21:10; the owner did not change it)
- Mobile main now includes m#551 (iPhone credit packs through the US web checkout link). Before build 7 goes to App Review the
  owner must set App Store Connect availability to the US only and add the review note about the external link. Merging
  published nothing: mobile has no OTA workflow (only ci.yml and codeql.yml). Publish no clinic OTA until availability is US only.
- Expo token: owner vault, "Expo access token (EAS builds)", host api.expo.dev, user scope, Always allow. list_credentials gives
  the handle. eas-cli: private prefix install without the credential, patch build/fetch.js so only api.expo.dev uses the proxy
  agent, run with https_proxy=$HTTPS_PROXY and EXPO_TOKEN=proxy-injected (SoT ~4243-4245).
- iOS: `eas build -p ios --profile clinic --auto-submit --non-interactive` from a clean mobile main worktree (buildNumber 7,
  ascAppId 6765847915). APK: eas.json preview (buildType apk) unless the owner picks another env. android.versionCode 5.
- CI flake to know before the cut (COACH-SETTINGS-131, from the code and CI runs): WorkoutScreen.calm130.test.tsx fails at random
  because the newest chart bucket excludes "now" (WorkoutScreen.tsx:420-427, `d < weekEnd`); the same bound hides a session whose
  server time is seconds ahead of the phone. Smallest fix: inclusive newest bucket, or date the fixture a minute earlier.

## Open PRs
- b#871 failed-payment copy @ fa38982e: dual approved, HOLD (owner decision 1). The only open agent127-131 PR at 23:45.

## Not started (roster order is the priority)
- Wave 1 remainder (7): MEAL-TEMPLATES-ROUTE-131 (m#551 merged: unblocked), TEAMPROFILE-131, COACH-TIMELINE-STATES-131 then
  CLIENT-ARCHIVE-COPY-131, SMALL-BE-COPY-131 (Opus; its dunning items wait for b#871), SMALL-M-COPY-131 (add FAST-CALM-FIN-131's
  two copy items), ALLERGY-CHOICES-131 (Opus), CHURN-LABELS-131 (Opus; b#872 merged: unblocked). Entries: FIX_PLANS_130_131.md
  C3 rows and section 3.5 of ops/AGENT_131_START_PROMPT_BY_129.md.
- Wave 2 (37): D2 rows (28), C4 TEAM-* (6, with the owner's team sharing rule), PACKAGE-SHARE-BE/M (after the iOS submission),
  COACH-PAY-FLIP (after the owner's yes).
- Proposed by restart workers (defaults in their reports):
  - FLY-ENV-URL-132 (T4, first; owner decision 11): let fly-env-sync accept URL characters for the two COACH_AI_PACK_* names
    only, with a test, then plan and apply. Fallback: set both to "unset" in the manifest so other flag changes can apply.
  - SUBCOACH-SCOPE-V1 (T4 Opus, owner decision 10): src/v1/v1-coach.service.ts thread, message and draft lookups (:385, :462,
    :543, :599) spread the caller scope so a team sub-coach could read or post in an unassigned client's thread. Same AND fix
    as b#878. Production check 23:4x (counts only): 0 TeamSubCoachAssignment, 0 SubCoachAssignment, 0 SubCoachInvite rows, so
    nobody can reach it yet. Fix before teams are switched on.
  - m#551 follow-ups (FIX-OPUS-B-131): CreditPackCheckoutScreen.tsx:144-153 ignores `preselect` (a pack tap lands on the list);
    AIBudgetTutorialModal.tsx:111 says the Coach Home meter shows usage on a card shown when no meter is shown; PR bodies of
    m#551 and b#877 still say "Owner decision 10 pending" (the owner said yes at 20:54).
  - b#872 C (accepted as C): insights stored before the deploy, for a client whose switch was already off, are not hidden.
  - COACH-SETTINGS-131 P-1: Settings rows that open ClientsStack screens switch to the Clients tab and Back does not return.
  - LN-OPUS-F-131 U: useClientDetailData.ts:53 starts an archived client's header button as "Archive client".
  - Worktrees left by FIX-OPUS-B-131: wt/FIX-551-mobile, wt/FIX-877-backend, wt/FIX-872-backend (clean, merged).

## Owner decisions still open (defaults in brackets)
1. b#871 failed-payment copy [merge as is].
2. No-coach screen wording [keep the new wording].
3. Android purchases [stay hidden until the app is on Google Play].
4. Sub-coach money buttons [own clients only, same warning, head coach notified; before COACH-PAY-FLIP].
5. "Credit packs are non-refundable." beside pack prices [yes; now a small mobile follow-up, since m#551 merged without it].
6. Eating-disorder coach alert [private alert without message text, Roman tells the client].
7. Workout left suspended over 12 hours still counts the gap [small follow-up].
8. Standing rule [cheapest legal path always].
9. APK environment [preview profile].
10. Sub-coach thread scope fix [agent 132 does it first, T4 Opus].
11. Credit-pack return links blocked by the flag tool [agent 132 lets the tool accept these two links, reviewed by both lenses].
(Agent 131's 23:12 offer to cut build 7 itself got no answer, so the owner's 21:10 plan stands: agent 132 cuts it.)

## Owner-only items
- Stripe Dashboard: live webhook sends checkout.session.completed and checkout.session.expired before any coach buys a pack.
- App Store Connect: US-only availability and the external-link review note (m#551 is in build 7); privacy labels; listing.
- Supabase: Apple sign-in on; Google return address tgp://auth/callback allowed.
- Tester accounts (Roman playbook and memory checks), TestFlight approval, first real push on a phone.

## Lessons from agent 131
1. Builders must post READY with CI green before ending (HOME-FOOD-UI-131 did not; the restart builders all did).
2. Lens pools idle at a cost; the restart's 6 lenses for 4 builders and 2 fixers emptied their queues by 23:34.
3. Merge whichever PR of a shared-file pair is ready first. Test-merge the rest locally before merging (done at 23:12: no conflicts).
4. Check open owner decisions tied to a flag before fly-env-sync.
5. Decision numbers differ between operators' lists: cite by topic and number.
6. Background loops must start from a bash call WITH api_credentials ["github"]: loops started without it got 401 for 33 minutes.
7. Never put a pkill pattern in the same bash call as the command line it might match: `pkill -f '[d]eploy_when_green.sh <sha>'`
   killed its own shell. Kill in a separate call.
8. Pass deploy_when_green.sh the FULL 40-hex SHA; a short SHA reads as "main moved" and stops.
9. A lens's tenancy claim can be wrong: on b#878 Opus said the scope gated reads, and Sol proved a sub-coach hole. Keep both lenses.

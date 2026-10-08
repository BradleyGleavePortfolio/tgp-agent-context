# JOBS132: entries for operator agent 132's workers (2026-10-08 13:05 PDT). Read _COMMON_132.md first (header Q1-Q9).
# FP = /home/user/workspace/tgp-agent-context/handoffs/op-129/FIX_PLANS_130_131.md   SP = /home/user/workspace/tgp-agent-context/handoffs/op-131/AGENT_132_START_PROMPT.md
# R131 = /home/user/workspace/tgp-agent-context/handoffs/op-131/ops/reports   Repos: BradleyGleavePortfolio/growth-project-{backend,mobile}

## CLINIC-APK-132 (builder A, Claude Opus 5.5, mobile, T4 because it switches a money surface on a distributed build)
Worktree /home/user/workspace/wt/CLINIC-APK-132-mobile, branch agent132/clinic-apk-132 (off mobile main 14faa32f).
Owner 12:52: "lets make one last full apk build for andriod with all the features ios has today". Today's Android test app was
built with eas.json profile "preview", which lacks every EXPO_PUBLIC_FF_* switch that profile "clinic" (the iPhone build) turns on.
1. Read `sed -n '85,97p' SP` and the HANDOFF of R131/PACKS-BOTH-131.md (only that section).
2. eas.json: new build profile "clinic-apk": extends "clinic"; android.buildType "apk"; distribution "internal"; channel
   "clinic-apk"; environment "production"; env: add EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK "true" and keep TGP_ANDROID_HEALTH_CONNECT
   "1". Check (EAS docs or the eas-cli source in /home/user/workspace/tools/eas) whether "extends" merges env; if it does not, copy
   clinic's whole env. The result must equal clinic's switches plus the Android pack link.
3. app.json android.versionCode 5 -> 6 (owner: no over-the-air updates needed; 6 always installs over the current test app).
   Leave ios.buildNumber 7 and every store profile unchanged (the Play pack switch stays off in store builds: owner decision 14).
4. scripts/validate-app-config.js EXPECTED_CHANNELS row, config/expected-env.json releaseProfiles entry, the README release-profile
   row; update the tests named in the HANDOFF (scripts/__tests__/{validateAppConfigUpdates,easUpdateGuard,releaseEnvProfile,
   expectedEnv}.test.js, src/__tests__/androidCreditPackLink.test.tsx, src/config/__tests__/androidHealthConnectConfig.test.js) and
   add one test proving clinic-apk resolves to clinic's EXPO_PUBLIC_FF_* set plus EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK.
5. PR body: tier header, "What changes": the Android test app gets the iPhone feature set (list the switches), profile table
   before/after. READY at the green head, then wait for verdicts (Q3). The operator merges and cuts the APK from wt/BUILD-mobile.

## ALLERGY-FIN-132 (builder B, Claude Opus 5.5, T4 health data; PR 2 then PR 4)
Worktree /home/user/workspace/wt/ALLERGY-FIN-132-mobile (on m#569's branch agent131/allergy-consult-sesame-131 @ ec513fc9).
PR 3 belongs to NUT-FREE-132 (separate builder); skip it.
PR 2, m#569 fix round 2: read `sed -n '98,100p' SP`, Sol's verdict https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693
and the HANDOFF of R131/ALLERGY-CHOICES-131.md. Fix B-569-SOL-M-131-1: RecipesScreen.tsx:171-193 (handleAllergySubmit) writes
AsyncStorage 'user_data', which Edit Profile no longer reads; save through patchUserCache from src/lib/userCache (check its
signature) so Edit Profile shows the same chips, plus a composition test (Recipes save -> Edit Profile reads it). Then
`git merge origin/main` (expected conflict only src/screens/client/README.md: keep both rows). One push, CI green, READY as
`FIX ROUND 2 (<JOB ID from the existing READY line on m#569>, agent 132, ALLERGY-FIN-132) — ...`.
## NUT-FREE-132 (builder B2, Claude Opus 5.5, backend, T4 health data; one PR)
Worktree /home/user/workspace/wt/NUT-FREE-132-backend, branch agent132/nut-free-132 (off backend main cd0f90ed). `sed -n '99p' SP`.
PR 3, NUT-FREE-132 (backend, from the code): src/recipes/allergens.ts (map near :51-62) knows 'nut allergy' and 'peanut allergy'
but not the lean onboarding answer (mobile src/screens/onboarding/lean/LeanQ6Screen.tsx:63 saves value 'nut_free', label
"Nut-free"). Map it to the same allergens as 'nut allergy'. Failing-first test. LEFTHOOK=0. READY. End.
(ALLERGY-FIN-132 continues:) PR 4, FISH-CONSULT-132 (mobile; waits for m#569 to merge, waiting rule Q9): after the merge, in the mobile worktree
`git fetch -q origin && git checkout -b agent132/fish-consult-132 origin/main`; add Fish to the consultation allergy question next
to Sesame (the definitions and copy files m#569 touched) with a test; steps in the ALLERGY-CHOICES-131 HANDOFF. READY. End.

## FLAG-TOOL-132 (builder C, Claude Opus 5.5, backend, T4 money settings; one PR)
Worktree /home/user/workspace/wt/FLAG-TOOL-132-backend, branch agent132/flag-tool-132 (off backend main cd0f90ed). LEFTHOOK=0.
PR 5, FLAG-TOOL-132 (owner decision 11; owner chose the operator's default at 12:52: remove the two values). fly-env-sync apply
fails on COACH_AI_PACK_SUCCESS_URL and COACH_AI_PACK_CANCEL_URL (.github/workflows/fly-env-sync.yml:359 value pattern), so no
flag can change. In .github/fly-env-desired-state.json set both to the file's "unset" form and correct their gate text (it still
says "owner decision 10 pending"; the owner said yes on 7 Oct 20:54). Prove in the PR body, from the code, that nothing needs them:
list every caller of the credit-pack checkout in backend src (coach-ai-credit-pack.service.ts:104-113 uses args, then
COACH_AI_PACK_*, then STRIPE_CHECKOUT_*, then https://app.trygrowthproject.com/billing/*) and the mobile caller
(CreditPackCheckoutScreen.tsx:115-116 and :194 send tgp:// links). Run any test or validator that reads the desired-state file
(`rg -l fly-env-desired-state scripts test .github src`). READY. End.

## SUBCOACH-SCOPE-V1-132 (builder C2, Claude Opus 5.5, backend, T4 tenancy; one PR)
Worktree /home/user/workspace/wt/SUBCOACH-SCOPE-V1-132-backend, branch agent132/subcoach-scope-v1-132 (off backend main cd0f90ed).
PR 6, SUBCOACH-SCOPE-V1-132 (owner decision 10): `sed -n '155p' SP`. src/v1/v1-coach.service.ts thread, message and draft lookups
(:385, :462, :543, :599) build `{ id: clientId, ...scope, role: 'student' }`, so a team sub-coach could read or post in an
unassigned client's thread; check the :133 list `where` too. Fix the way b#878 did (`gh pr diff 878 -R
BradleyGleavePortfolio/growth-project-backend`). Failing-first tests: an unassigned sub-coach is refused; the head coach and an
assigned sub-coach still work. LEFTHOOK=0. READY. End.

## SMALL-BE-COPY-132 (builder F, Claude Opus 5.5, backend, T2; one PR)
Worktree /home/user/workspace/wt/SMALL-BE-COPY-132-backend, branch agent132/small-be-copy-132 (off backend main cd0f90ed).
Entry: row SMALL-BE-COPY-131 at line 154 of /home/user/workspace/tgp-agent-context/handoffs/op-131/ops/AGENT_131_START_PROMPT_BY_129.md
(`sed -n '154p'`), renamed -132. Its dunning items waited for b#871, which is merged: include them. From the code on main:
meal-plans.service.ts:41-48 ("0 kcal" for an empty value), roman-post-check.ts:722 ("Today tab"), the "Restart billing" copy near
coach-client-payments.service.ts:295. Copy only: if a line needs money logic, write it up. Never quote crisis copy. LEFTHOOK=0. READY. End.

## CHURN-LABELS-132 (builder G, Claude Opus 5.5, backend, T4 privacy; one PR)
Worktree /home/user/workspace/wt/CHURN-LABELS-132-backend, branch agent132/churn-labels-132 (off backend main cd0f90ed).
Entry: row CHURN-LABELS-131 at line 157 of the same file (`sed -n '157p'`), renamed -132; b#872 is merged, so it is unblocked.
Trace the churn-risk factor labels a coach sees against the client's sharing switches (the sharing audit), fix any label that
reveals data the client did not share, failing-first tests. LEFTHOOK=0. READY. End.

## COACH-SCREENS-132 (builder D, GPT-6.1 Sol, mobile, T1; two PRs)
Worktree /home/user/workspace/wt/COACH-SCREENS-132-mobile, branch agent132/meal-templates-route-132 (off mobile main 14faa32f).
PR 7, MEAL-TEMPLATES-ROUTE-132: FP row 183 (`sed -n '183p' FP`). About 20 lines. READY.
PR 8, TEAMPROFILE-132: FP row 184. About 100 lines. Fresh branch agent132/teamprofile-132 off origin/main after PR 7's READY.
READY. End. Mobile redo rules (parity table, truthful sweep, README row) apply.

## CLIENT-DETAIL-132 (builder E, GPT-6.1 Sol, mobile, T1/T2; two PRs)
Worktree /home/user/workspace/wt/CLIENT-DETAIL-132-mobile, branch agent132/coach-timeline-states-132 (off mobile main 14faa32f).
PR 9, COACH-TIMELINE-STATES-132: FP row 174 (its predecessor COACH-WEEKLY-131 is merged; confirm on main). About 120 lines. READY.
PR 10, CLIENT-ARCHIVE-COPY-132: FP row 175, plus owner decision 19 (yes, 12:52): an archived client's page still offers
"Archive client" (src/screens/coach/client-detail/useClientDetailData.ts isArchived near :36 and :53): show the true state.
Fresh branch agent132/client-archive-copy-132 off origin/main after PR 9's READY; it shares files with PR 9, so keep hunks small
and away from PR 9's lines; if PR 9 has merged before your READY, `git merge origin/main` first. The archive copy talks about
money (the plan keeps charging): state only what the code does; if a fix needs money logic, write it up (Q3). READY. End.

## LN-OPUS-132 (lens, Claude Opus 5.5; instances A and B) and LN-SOL-132 (lens, GPT-6.1 Sol; instances A and B)
No worktree: read code with gh, `git -C /home/user/workspace/growth-project-<repo> fetch` + `git show`, and the read-only worktrees
/home/user/workspace/wt/RO-backend and /home/user/workspace/wt/RO-mobile. Slices: instance A = builders CLINIC-APK-132,
ALLERGY-FIN-132 (m#569 included), NUT-FREE-132, FLAG-TOOL-132, SUBCOACH-SCOPE-V1-132; instance B = builders COACH-SCREENS-132,
CLIENT-DETAIL-132, SMALL-BE-COPY-132, CHURN-LABELS-132.
Follow Q4 and Q5. Each READY PR in your slice gets exactly one verdict from you at its head. For T4 PRs (CLINIC-APK-132, m#569,
NUT-FREE-132, FISH-CONSULT-132, FLAG-TOOL-132, SUBCOACH-SCOPE-V1-132, CHURN-LABELS-132) run the T4 scan in full. m#569: Opus already approved
ec513fc9; the fix round moves the head, so review the delta (the B fix, the merge of main, the changed lines).

## ROMAN-V11-PLAN-132 (planner, Claude Opus 5.5, read-only, time box 40 minutes)
Owner 12:52: "roman intelligence increase is largely built - finish it" and "get the next 10 PR's after that under way for v1.1".
Write /home/user/workspace/ops/V11_PLAN_132.md:
1. Inventory: every Roman v1.1 item in SoT A7 (A7.2 and its build plan, near lines 1575-1590 of
   /home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md) and any v1.1 plan under tgp-agent-context (rg -il 'v1.1|v1_1'),
   each marked built and on / built but off / partly built / not built, with file paths on backend main cd0f90ed and mobile main
   14faa32f ("from the code"). Known: FEATURE_ROMAN_MEMORY, TOOLS and PLAYBOOK are on; no FEATURE_ROMAN_INSIGHTS, OUTREACH or ACTIONS
   in backend src (verify; look for partial work too, e.g. src/roman/tools/roman-baselines.ts, background jobs).
2. The next 10 PRs that finish it, in merge order, each with: ID (ROMAN-<NAME>-132), repo, tier (A3; Roman work is usually T4 =
   Opus builder + both lenses), the goal in plain words for clients and coaches, files, new flag (off until both lenses and the
   owner say yes), failing-first tests, size (under 800 lines), depends-on. Group them so no two PRs in flight share a file.
3. Ready-to-paste JOBS132 entries in this file's style (worktree paths /home/user/workspace/wt/<ID>-<repo>, branches agent132/...).
4. Owner decisions with recommended defaults (spend no money: use the existing AI gateway; health data only with consent).
No branches, PRs, comments or GitHub writes. Report /home/user/workspace/ops/reports/ROMAN-V11-PLAN-132.md with HANDOFF; notify.

## APPSTORE-PACK-132 (Claude Opus 5.5, read-only plus web research, time box 45 minutes)
Owner 12:52: "get app store submission requirements put together cohesively for me (screenshots, noites, what forms left to do,
ect)". Write one Markdown file for the owner: /home/user/workspace/deliverables/TGP-App-Store-Submission-Pack.md (not in any repo).
Plain words, coaches and clients first, no terminal commands, no secrets, no emails, never the clinic partner's name.
1. Every App Store Connect section for app 6765847915, each marked done / to do / check, with what to enter: App Information
   (name, subtitle, category, content rights, age rating), Pricing and Availability (US only: build 7 has the US credit-pack
   link, m#551), App Privacy (data types drafted from the code: health and fitness, contact info, identifiers, purchases, user
   content, usage, diagnostics; linked or not; tracking), the version page (screenshots, promotional text, description,
   keywords, support URL, marketing URL, copyright, build 7), App Review Information (contact, demo accounts as placeholders the
   owner fills in, notes), release option, TestFlight (test information, internal testers; Expo could not create the tester group:
   Apple refused that one step for its key), export compliance (check app.json/Info.plist), HealthKit, Sign in with Apple,
   in-app account deletion, AI chat safety and the medical disclaimer.
2. Screenshots: today's required sizes and counts from Apple's current documentation (iPad only if app.json supports tablets),
   the 6-8 screens to capture (client and coach), captions, and how to capture them from TestFlight build 7.
3. Paste-ready drafts: subtitle (30 characters), promotional text (170), description, keywords (100), review notes (the US
   external purchase link for coach AI credit packs and the current Apple rule for the US storefront, verified on Apple's site;
   HealthKit use; how to reach Roman; crisis routing; demo account placeholders). App copy rules apply (no first person, no
   exclamation marks, no emojis).
4. The remaining steps in order, each marked owner-only.
Sources: mobile repo (wt/RO-mobile: app.json, eas.json, privacy and terms links in src), R131/STORE-AUD-129.md,
R131/IOS-RELEASE-129.md, SoT store sections, Apple's developer pages (cite every Apple rule with its URL inline). Report
/home/user/workspace/ops/reports/APPSTORE-PACK-132.md with HANDOFF; notify.

## AUDIT-FIX-132 (builder H, Claude Opus 5.5, backend, T4 security; one PR; added 13:22 under ruling OR-132-1)
Worktree /home/user/workspace/wt/AUDIT-FIX-132-backend, branch agent132/audit-fix-132 (off backend main cd0f90ed). LEFTHOOK=0.
Since 10:52 PDT the backend job "npm audit (high+critical, whole graph)" fails on every PR: critical handlebars advisories
GHSA-8r5x-fm3f-whwj and GHSA-p8wg-vrv2-v86f (plus moderate GHSA-xw65-4hp5-5hc7), vulnerable >=4.0.0 <=4.7.9, patched 4.7.10
(npm latest 4.7.10). handlebars 4.7.9 is a DIRECT production dependency (package.json exact pin; used by src/email/email.service.ts
and src/notifications/digest.service.ts); ts-jest wants ^4.7.9.
1. package.json: "handlebars": "4.7.10" (keep the exact pin). Lockfile: `npm install handlebars@4.7.10 --save-exact
   --package-lock-only --ignore-scripts` (this lockfile edit is allowed for this job only); confirm one copy at 4.7.10 and no other
   lockfile churn (git diff --stat).
2. Prove the gate passes locally: `npm audit --package-lock-only --include=prod --include=dev --include=optional --include=peer
   --audit-level=high --json > /tmp/audit132.json; node scripts/ci/audit-gate.mjs --audit /tmp/audit132.json --audit-exit $?
   --lockfile package-lock.json --exceptions .github/audit-exceptions.json`. Run the email and digest spec files (heavy.sh, one at
   a time). Do not add an exception: a patched version exists.
3. PR body: tier header (T4 security), the advisories with links, the two production call sites, test evidence. READY at the green
   head, then wait for verdicts (Q3). The operator merges and deploys.

## V11-*-PLAN-132 (five read-only planners, Claude Opus 5.5, time box 40 minutes each; launched 13:43 for the owner's v1.1)
Owner 13:36 (verbatim): "v1.1 plan in my head / Importer - finally completed - coach import flow tested and bulletproofed - works
honestly and simplicity for PLG style usage is key / Refferal system is built and rewards for coach to coach refferals have real
rewards to lead Cost to acq user to slash for TGP / Coaches can have complete, amazing Sub-Coach logistics and TONS of optionality in
running teams / The webpage - guest checkout - auto assingment flow is bulletproof and functional / The landing page has
customization optionality (VSL pages, images placed in) - but it should always follow a basic flow - landing page -> Collect info /
TGP Account Creation -> checkout -> download TGP with qr code to scan in case their on desktop / If we get those 3 things done - v1.1
will be world class and honestly the best product for coaches and small teams of independent fitness leaders in the US market".
Owner 13:41: "The churn detection system! Thats ALSO needs to be made to OUTSTANDING quality in V1.1". Owner 13:20: best features
for the first 5 coaches and clients; 13:21: "the importer must be exactly as its planned - leaderbaords are great for coaches to have
challenges for clients". Quality bar: "hyperscaler quality" (owner 13:16).
Every planner writes /home/user/workspace/ops/V11_<PILLAR>_PLAN_132.md:
1. Inventory against the owner's goal: each piece built and on / built but off / partly built / not built, with file paths on
   backend main and mobile main (fetch first; "from the code"), plus production switch state from .github/fly-env-desired-state.json.
   Specs and handoffs may be stale: the code wins.
2. The PR plan to reach the goal: IDs (<PILLAR>-<NAME>-132), repo, tier (SoT A3; money, auth, tenancy, PII/health = T4: Claude Opus
   5.5 builder + both lenses), the goal in plain words for coaches and clients, files, new switches (off until both lenses and the
   owner say yes), failing-first tests, size (each under 800 lines), depends-on, and waves where no two PRs in flight share a file.
   Check overlaps with open PRs (ops/board/board.md) and with /home/user/workspace/ops/V11_PLAN_132.md (Roman v1.1).
3. Ready-to-paste JOBS132 entries (worktrees /home/user/workspace/wt/<ID>-<repo>, branches agent132/<id-lower>).
4. Owner decisions with recommended defaults. Spend no money (no new paid vendor or service; anything that costs cash needs the
   owner's yes). Health data only with consent. Store rules: no tricking app review; iPhone money flows follow the App Store rules
   (US external purchase link rules for digital goods; coaching services sold 1:1 are person-to-person services).
5. A one-screen summary at the top in plain words (what exists, what is missing, the PRs, the decisions).
No branches, PRs, comments or GitHub writes; no production writes (Supabase SELECT only if truly needed, counts only, no records).
Report /home/user/workspace/ops/reports/<ID>.md with HANDOFF; notify line.
- V11-FUNNEL-PLAN-132 (PILLAR FUNNEL): the coach's web landing page (customizable: VSL video, images), info collection and TGP
  account creation, guest checkout (Stripe), automatic assignment of the buyer to the coach, then "download TGP" with a QR code on
  desktop. Sources: tgp-agent-context/roadmap/specs/A08-lead-funnel.md, SoT (rg -n -i 'guest checkout|landing|storefront|funnel|
  auto.?assign'), backend public pages, storefront, checkout and webhook code, mobile deep links and invite flows.
- V11-IMPORTER-PLAN-132 (PILLAR IMPORTER): the importer exactly as planned: SoT A7.3 (lines 1618-1673 of
  /home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md) and the importer north star file it names; coach import flow
  tested and bulletproof, honest results, simple for product-led use. Sources: tgp-agent-context/handoffs/importer-wave/*
  (current-state.json first), the importer code in backend and mobile (src/screens/coach/import-journey/) and any other importer
  package in the repos. Map every A7.3 invariant to code and tests.
- V11-TEAMS-PLAN-132 (PILLAR TEAMS): complete sub-coach logistics and lots of options for running teams. Sources: line 174 of
  /home/user/workspace/tgp-agent-context/handoffs/op-131/AGENT_132_START_PROMPT.md (C4 team PRs and the owner's team sharing rule),
  /home/user/workspace/tgp-agent-context/handoffs/op-129/FIX_PLANS_130_131.md (TEAM-* rows), roadmap/specs/A04-team-qa.md, SoT team
  decisions, backend team/sub-coach code (b#878, b#883), mobile team screens.
- V11-REFERRAL-PLAN-132 (PILLAR REFERRAL): coach-to-coach referrals with real rewards that cut TGP's cost to acquire coaches (client
  referrals only if cheap to add). Sources: roadmap/specs/A12-referrals.md, invite-code and share-link code, coach subscription and
  Stripe code. Rewards that cost no cash first (for example free months of the coach's TGP fee); list any cash reward as an owner decision.
- V11-CHURN-PLAN-132 (PILLAR CHURN): the churn detection system at outstanding quality for coaches with a handful of clients:
  honest, explainable signals, no false risk, respects the client's sharing switches, actionable for the coach. Sources:
  /home/user/workspace/ops/reports/CHURN-LABELS-132.md (its findings and the 4 Proposed items), b#886, backend churn and PTM code
  (src/admin/ptm, ptm-heuristic.service.ts, the weighted engine, churn-intervention.service.ts, broadcast segments), mobile coach
  at-risk screens, SoT churn decisions.

### ADDENDUM 13:47 to every V11-*-PLAN-132 (owner 13:45, binding)
Owner 13:45 (verbatim): "all plans must taKE INTO ACCOUNT mobile pathway placement - luxury doctrine and mobile design ideologies from
the app and github documents, best-in-class rivals and inspiration, and the unique proposition of TGP "The platform for Online fitness
in the post-AI era" - how to not just be a pretty version of exisitng ideas but what would make us SUPERIOR entirely to what exists! I
want plans for amazing existing product idea - then seperately their additional ideas pitched, as an addition - make sense?"
Add to your plan (time box now 60 minutes from launch, due 14:45 PDT):
A. Pathway placement: for every coach-, client- or buyer-facing piece, where it lives (tab > screen > entry point, or web URL > step),
   how many taps from home, and what it replaces. Sources: /home/user/workspace/wt/RO-mobile/docs/reachability.md, the screen READMEs
   (src/screens/*/README.md). Rule 6 of /home/user/workspace/tgp-agent-context/handoffs/op-131/ops/lanes131/_COMMON_131.md lines 280-310:
   no pathway or function is cut; list the routes, buttons and actions before and after.
B. Design: /home/user/workspace/wt/RO-mobile/docs/QUIET_LUXURY_DOCTRINE.md, src/theme/README.md, docs/HAPTICS.md,
   docs/SKELETON_LOADERS.md, docs/dark-mode.md, docs/charting.md, docs/share-card.md, ENGINEERING_RULES.md; owner: "LUXURIOUS, SIMPLE,
   MENTALLY DELOADING, AND CALM!". Each PR names the doctrine rules it follows; web pages follow the same doctrine.
C. Rivals and inspiration: research the best-in-class products for your pillar (fitness-coaching platforms and the best outside
   fitness), with cited URLs: what they do well, where they fall short, and exactly how TGP becomes superior, not a prettier copy.
D. TGP's proposition: SoT A7.5 (lines 1674-1700 of TGP_SOURCE_OF_TRUTH.md): the platform for online fitness in the post-AI era;
   AI-native, not AI-added (Roman between sessions; AI drafts for the coach).
E. Structure the plan file in two parts: PART A = the owner's idea exactly as he stated it (the importer exactly per A7.3), built to
   outstanding quality (inventory, PRs, waves, JOBS entries, decisions). PART B = separately, your additional ideas pitched as optional
   additions, each with: the idea in plain words, why it makes TGP superior, the rival gap it exploits, size in PRs, cost (must be no
   cash unless flagged as an owner decision), and what it depends on. Nothing from PART B goes into PART A.

## RESCUE WAVE 15:20 (operator 132; owner 15:02-15:13 "FIX EVERYTHING", "launch the agent wave NOW", iOS build 8 tonight). Header Q11 binds.

### SETUP-STALE-132 (claude_opus_5_5) — B07, B38 (and the wizard part of B10)
Worktrees: /home/user/workspace/wt/SETUP-STALE-132-backend and /home/user/workspace/wt/SETUP-STALE-132-mobile.
PR 1 backend (first): src/common/cache-control.interceptor.ts sends `private, max-age=60` on authenticated GETs (line ~82;
NO_STORE_PREFIXES lines ~35-40), so phones cache personal data for 60 s and read stale state after writes. Make every response to an
authenticated request `Cache-Control: private, no-store`; keep the existing no-store prefixes; keep public caching only where a route is
genuinely public and unauthenticated (list those routes in the PR body). Spec tests for both. Evidence for the PR body: prod coach
onboarding row at current_step 4 while the phone posted step 3 → 400 STEP_OUT_OF_ORDER (src/coach/coach-onboarding.service.ts:176-183).
PR 2 mobile: (a) the API client (src/services/api.ts — you own this file in this wave; nobody else edits it) sends `Cache-Control:
no-cache` on GETs so a phone never serves a cached personal response, even from an old server; (b) advanceWizardTo
(src/api/coachSetupApi.ts:306-327) self-heals on 400 STEP_OUT_OF_ORDER: re-read progress fresh and continue from the server's step; show
"moved on another device" only when a real second device moved it, calmly, without a raw UUID; (c) tests. Do not edit
CoachWizardNavigator.tsx (COACH-EDGES-132 owns it) or RootNavigator.tsx (START-HANG-132). Then wait for verdicts on both PRs (Q3).

### START-HANG-132 (claude_opus_5_5) — B35, B36, B37
Worktree: /home/user/workspace/wt/START-HANG-132-mobile.
Owner 15:02: reopening the app as a coachless client shows the TGP logo ~0.5 s, "Locked" for under 0.1 s, then an endless spinner
(screenshot S9 in BRIEF section 3); the app never opens. Find exactly why: every await in RootNavigator bootstrapAuth (~:667-865),
consultationApplies (~:342), the re-bootstrap on auth events (~:433), PersistedQueryCacheGate restore, useBiometricGate, re-entrancy
(a second bootstrap while the first runs; token-refresh event loops), anything that keeps authState 'loading' or the restore gate pending
forever. One PR (<800 lines): (1) one time-box helper (about 8 s) around every network await on the startup path, each falling back the
way that path already intends; (2) a calm startup error screen modelled on prototype screen 44 ("I couldn't reach the server. Your
answers are safe." + one green "Try again"), never an endless spinner; (3) the biometric gate shows no "Locked" text unless the user
opted in — while checking it renders the plain splash background — and never blocks when the opt-in flag is off or unreadable;
(4) a re-entrancy guard (latest bootstrap wins; no loop on refresh events); (5) tests for each path, including a promise that never
settles. Do not edit src/services/api.ts (SETUP-STALE-132 owns it). If the real cause is in token/session storage, fix it there with
tests and say so in the PR. Then wait for verdicts (Q3).

### COACH-EDGES-132 (gpt_6_1_sol) — B01, B05, B08, B09, B10, and the calm Stripe-not-ready state of B06
Worktree: /home/user/workspace/wt/COACH-EDGES-132-mobile.
One PR (<800 lines) on the CURRENT coach wizard (the consultative redesign is planned separately by R12; do not redesign):
(1) StepLayout (src/navigation/CoachWizardNavigator.tsx ~150-230) uses react-native-safe-area-context insets top and bottom: the
progress indicator is never under the status bar, Back and the footer sit above the gesture bar, plus a few points of extra top
breathing room (owner: "let it breathe by a few pixels"); (2) Back always works: with no navigation history (resumed mid-wizard) Back
goes to the previous step route explicitly; decide and explain the first step; (3) src/lib/coachSetup/errors.ts: calm, short copy, no
raw reference UUID in the main text (a small "Reference" line only where support needs it); keep SUPPORT_EMAIL exactly as is (owner's
choice, guarded by a test); (4) Stripe step when Connect is not ready (CONNECT_NOT_CONFIGURED, S0): no red box; one calm line that
payouts open soon, "finish setup now and connect Stripe later from Get paid", and the primary button continues setup: the coach is
never blocked; (5) src/screens/auth/ResendVerificationLink.tsx: a visible countdown while cooling down, a clear "Sent. Check your inbox
and your spam folder." confirmation, an honest error: every tap sends or says why not. Do not edit RootNavigator.tsx,
src/services/api.ts or src/api/coachSetupApi.ts (other builders own them). Tests for each; mobile screen redo rules (parity table,
truthful sweep, README row). Then wait for verdicts (Q3).

### COACHLESS-LOG-132 (claude_opus_5_5) — B22, B23, B24, B25
Worktrees: /home/user/workspace/wt/COACHLESS-LOG-132-backend and /home/user/workspace/wt/COACHLESS-LOG-132-mobile.
Owner 14:57 (verbatim): "That pop-up saying logging comes with a coach will NOT go away no matter what you click, it instantly pops
back up blocking everything in-app - and why would logging eb disabled entirely for non-coach clients??? THATS NOT MY INTEDNED DESIGN!"
Approved packet decision 1 (later slice, planned by R04): clients with no code attach to Bradley as the house coach.
(1) Find exactly why the coachless sheet/lock re-opens instantly (src/entitlements/PaywallSheet.tsx COACHLESS_TITLE and its trigger,
the Train lock S7, Home "Food and water logging need active access" S6) and fix the loop. (2) Make the owner's design true now: a
client without a coach can log food, water and workouts and see their targets from day one — the mobile gates AND any backend guard on
those routes (find the entitlement guards on the food, water and workout logging endpoints). Coach-only features (messaging a coach,
coach programs, paid packages) keep honest gates. (3) Replace blocking locks with a gentle, dismissible "Join a coach with their code"
card where it helps; the Home header must not say "Message your coach" when there is no coach (B25). (4) Tests in both repos. No
Stripe calls, no price or take-rate change. Backend PR first if the backend gates. If the backend change is not small and safe, STOP
and write it up for the operator with options and a default. Then wait for verdicts (Q3).

### ADDENDUM 15:31 to COACHLESS-LOG-132 (owner 15:29, binding; wins over the entry above)
Owner (verbatim): "they can do everything a normal coached client can, besides getting direct coaching, and generally all of that
isnt behind a locked page its jsut empty for them inherently". So remove every lock / paywall wall / "Logging comes with coaching" /
"need active access" surface for coachless clients — not just logging: everything a coached client can use (targets, plan, logging,
Roman, check-ins, progress) works for them; places that need a real coach (coach messages, coach feedback) are calm empty states with
an optional "join a coach with their code" entry. Do not build the house-coach auto-attach. Keep paid-package and money flows as they are.
If this makes your PR larger than 800 lines, split it (backend first, then mobile) and say so in the READY body.

### ADDENDUM 15:31 to every rescue builder (owner 15:29): "we don't do build 8 until this is PERFECTION". No tonight deadline:
quality over speed. Same rules, same order; take the time to get it right and test it properly.

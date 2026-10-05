# TGP Source of Truth

The one current-state document for the TGP launch. It supersedes every scattered state and reconstruction document: LIVE_STATE.md,
the current-state parts of LAST_OPERATOR_STATE.md, handoffs/op-*/HANDOFF_AGENT_*.md, the state columns of LAUNCH_ONE_PAGER.md and
FLAGS_LAUNCH_LEDGER.md, and handoffs/op-121/RECON_AGENT_121.md (moved here). Those files stay for history only.
Still binding beside this file (laws and logs, not state): AGENT_RULES.md, MODEL_ROUTING.md, MERGE_DEPENDENCY_GUIDE.md,
OPERATOR_STANDING_ORDERS.md, DECISION_LOG.md (verbatim owner decisions), and the scope approved in LAUNCH_ONE_PAGER.md v2.1.
Maintenance: the active operator overwrites this file at every milestone (heads, stages, decisions, to-dos, fleet). History goes to
LAST_OPERATOR_STATE.md. The next operator starts here.

Placed 2026-10-05 12:30 PDT by agent 121 on the owner's order. Content written 12:10 PDT (times from `date`). Sources: the four owner documents (handoff v4, agent rules, EXECUTE
doctrine, T0-T4 routing), tgp-agent-context main e2581c8 (AGENT_RULES.md, MODEL_ROUTING.md, MERGE_DEPENDENCY_GUIDE.md,
OPERATOR_STANDING_ORDERS.md, DECISION_LOG.md, LAUNCH_ONE_PAGER.md v2.1, FLAGS_LAUNCH_LEDGER.md, LIVE_STATE.md, LAST_OPERATOR_STATE.md,
handoffs op-115 through op-120), the agent 120 ops snapshot (backend branch wip/op120/ops-snapshot 0fdb49a7: _COMMON_120.md, JOBS120.md,
FLEET.md, ops/reports), and live checks of GitHub, Fly and Supabase (read-only) between 12:04 and 12:10 PDT.
GitHub is the truth. Every head below was read from GitHub at 12:04-12:10 PDT.

## 0. Sixty-second summary

- Production backend 5da537d6 (#661 + #702 card-secrets fix, deployed 11:44). /health ok, /readyz db up. 190 migrations applied, 0 pending
  (latest 20270311000000_subscription_checkout_terms). Backend main 5da537d6, mobile main b79ca594 (Health Connect landed 11:29).
- Launch path 1/7. Steps 2 (money) and 5 (Health Connect) are closest. Merged today 10, deployed today 2 (agent 120 count).
- Every handoff head matches GitHub except messaging: B-MSG2-120 pushed #708-#711 at 11:47-11:49 and posted no FIX ROUND / READY comment.
  That is unfinished work. #711 Schema parity shows "failure" from a cancelled dependency install; it needs a rerun.
- New since the handoff: b#671 (trials bottom) now conflicts with main in ci.yml; m#342 (sheet bottom) conflicts in config/expected-env.json.
- Not in the handoff, found today: m#321 (package editor shows the $19.99 minimum or free rule) is dual-approved and was meant to land with
  fees, but it never merged. m#340 (tax CSV) sits on the closed m#332 branch and must be retargeted onto m#351. m#336 sits on a dead branch
  (retarget onto m#367).
- Scheduling migration preflight run read-only today: 0 overlapping pairs, 0 inverted ranges (CoachingSession has 0 rows). Re-run right
  before the scheduling deploy.
- No owner decisions are open. The owner has not said EXECUTE to agent 121 yet.

## 1. How agent 121 thinks and acts (digest of the four documents + repo copies)

Weights: AGENT_RULES.md = LAW (G01-G22, EFFECTIVE 2026-09-18; the repo copy wins over the attachment that says PROPOSED). EXECUTE doctrine =
MENTALITY. MODEL_ROUTING.md = PROCESS. The handoff = first prompt. DECISION_LOG.md newest entries at the bottom are binding.

- EXECUTE doctrine: after the owner says EXECUTE, act as CEO/CPO/CTO of the launch. Two-way doors (flag flips with a tested off path, OTA,
  copy, CI tooling, splits, closing superseded PRs) are operator calls. Escalate only direction, spend, irreversible or security forks,
  each with a recommended default. Escalate decisions, not chores.
- Owner messages: first line `Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> | credits used
  <n>/45k` (his last credits number). Last line "Your next step: ..." or "Nothing needed from you." No emojis, no exclamation marks, short
  plain sections, numbered decisions with a default, no risk sections ("Faster than light"). He is on Windows: never hand him terminal
  commands; secrets only through the secure credential form; dashboard work = exact URL + click path.
- Product copy: no first person, no generic errors, never name the clinic partner in any repo (tgp-agent-context is public).
- Spend nothing without his word. EAS stays on Free. Supabase Pro is his action on launch day 1.
- Model routing: grade every PR before work. T0/T1 GPT-6 Luna; T2 GPT-6.1 Sol; T3 Claude Opus 5.5; T4 Opus 5.5 + Sol (both lenses).
  Kimi K3 only as overflow. One-strike promotion. Wall clock first.
- Merges: only audited exact heads with every required check green: `gh pr merge N --merge --match-head-commit <sha>`. Rule 11: a split
  stack lands as one. Rule 12: a pure main merge where every PR file stays byte-identical needs only the operator MERGE-ONLY TREE CHECK
  (tools/tree_check.sh + green checks); restacks, conflict fixes and fix rounds need both lenses at the exact head. Refresh one PR at a
  time; stack depth max 2; migrations additive with a newer timestamp; keep a merge crew alive until the train is empty.
- PR size: any PR opened after 12:33 PDT 10-04 over 1,500 changed lines fails automatically. Grandfathered PRs keep 3,000, but (owner
  11:48 10-05) any NOT-READY PR over 3,000 is split into pieces of 1,500 or less; no open PR over 5k gets reviewed before a split.
- Deploys: standing approval for audited main with green CI. `gh workflow run fly-deploy.yml --ref main -f release_sha=<sha> -f
  confirm=deploy` (+ `-f migrations=apply-migrations` only when the release adds migrations), wait for main CI first, approve the pending
  production deployment, check /health and /readyz. Never run fly-secrets-set.yml. Flags change only through fly-env-sync (plan, apply,
  verify) from an audited one-line manifest PR.
- Commits as Bradley Gleave <bradley@bradleytgpcoaching.com>, no AI co-author line. R15: no sandbox-only files; everything lives in GitHub.
- Fleet: dynamic, sized to agent 121's own credits, up to 15. Agent 120 burned about 17k credits an hour at 7-15 agents. Ask the owner for
  the credits number every 30 minutes; stop launching at about 8k left. One job = one agent = one or two PRs.

## 2. Production, accounts and mains (verified 12:04-12:10 PDT)

| Item | State |
|---|---|
| Backend production | 5da537d6, fly-deploy 37357733219 success; previous ee55f814 (recurring 09:33), f48267f9 (fees 10-04) |
| Fly app | backend-spring-lake-3890, https://api.trygrowthproject.com |
| Supabase | rpyfdsgxxltzutgqeouk, Free plan; 190 migrations, 0 pending; User 1 row; ClientPurchase 0; StripeProcessedEvent 0; native trials 0; CoachMessage RLS on + forced; CoachingSession 0 rows |
| Stripe | webhook we_1UMt9WDUoC5CCVhShvAELVmI (refund.updated not yet added) |
| Play | com.growthproject.app (recreated by the owner after Google deleted the old app 09-30) |
| Backend | main 5da537d6, 88 open PRs |
| Mobile | main b79ca594, 42 open PRs |

Production flags today (manifest .github/fly-env-desired-state.json on main): FEATURE_AI_CONSENT_LEDGER_ENABLED=true. Unset (off):
every FEATURE_COMMUNITY_*, BOOKING_REMINDERS_ENABLED (after #632 only the literal "on" enables it), FEATURE_WEARABLES_INGEST_POST,
FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO, FEATURE_NAMED_REGIMES, FEATURE_DUNNING_V2, secret GOOGLE_CLIENT_IDS,
MWB_AUTOSAVE_LOCK_TOKEN_SECRET. FEATURE_ROMAN_CHAT_ENABLED sits in "excluded" ("stays off until the owner decides otherwise"; he has
decided: live Roman is day 1). Unset means on for SIGNUP_ROLE_CHOICE_ENABLED, COACH_WELCOME_SCHEDULER_ENABLED, WORKOUT_REMINDERS_ENABLED.

## 3. Agent 120 work log (10-05, from the handoff, JOBS120 and GitHub)

- 09:2x took over from agent 119 (died about 16:42 10-04 without a final handoff); rebuilt state from GitHub, Fly, Supabase and the 119
  snapshot. 09:27 restack note #661/#702. 09:28 wave 1 (15 agents). 09:33 recurring DEPLOYED (ee55f814). 09:44 37 old ci/* branches deleted.
- 09:47 owner drain to 7 (reached about 10:06). 09:57 Roman day 1 + v1.1 plan. 10:31-10:33 all scheduling day 1. 10:40 one-pager v2.1
  approved. 10:3x messaging inbox #660 split into #708-#711.
- 11:22 #661 fast-forwarded to #702's audited head; 11:28 #661 MERGED (main 5da537d6). 11:29 Health Connect H1-H8 MERGED (mobile main
  b79ca594, merge-only tree check PASS).
- 11:28 owner: 37.7k/45k credits. Agent 120 stopped launching, cancelled the L3 lens pair and B-MSG2 (nothing pushed then).
- 11:40-11:44 #661 deploy (production 5da537d6). B-PUSH3 done (#693 cc0a167f READY). B-DUNR2 partial (#705 open, D2d plan written).
  B-TR8 pushed, not READY.
- 11:44 owner: restart the smallest stopped job; B-MSG2-120 relaunched 11:45 and pushed #708-#711 11:47-11:49 with no completion comment.
- 11:48 B-CM9 done: coach #674/#676/#677/#703 READY with green checks.
- 11:52 closed 16 superseded originals with owner approval (b#627 #654 #628 #634 #641 #648 #651 #656 #660; m#317 #322 #325 #328 #329
  #332 #334; branches kept). m#331 split left for agent 121 as the first job. Last repo commit e2581c8 (11:53).

## 4. Stack-by-stack state (heads verified on GitHub 12:04-12:10 PDT)

DA = dual APPROVE (Opus 5.5 + Sol) at that exact head. RC = request changes.

| Stack | PRs @ head | State | Next |
|---|---|---|---|
| Fees, recurring, card secrets | b#681-#686 #697; b#678-#680 #696 #701; b#661 #702 | DEPLOYED | m#321 (fee rule in the package editor) DA at 4f5b058d, behind, clean: rule 12 land |
| Health Connect | m#359-#364 #369 #370 | MERGED 11:29 | flag PR FEATURE_WEARABLES_INGEST_POST -> B-HC12-120 (C-370-2 per-type/day batching + 429 Retry-After vs 60/min; C-370-3 sleep double count) -> owner device pass -> Play forms |
| Push (day 1) | b#692 346cf4a8 Sol APPROVE, behind/clean; b#693 cc0a167f FR6 READY (2,965) | READY | Opus PUSH3 on both + Sol #693 delta -> merge #692 then #693 -> deploy with migrations (20270307000000) -> Android device check |
| Coach | b#674 3a07a0de FR6 READY (2,995, 5 lines room); #676 fadb2960, #677 e3940bd0 merge-only READY; #703 ebde8b3b READY | READY | delta lens pair -> main refresh as its own merge-only round -> land as one -> deploy -> m#345-#351 |
| Dunning | b#687 d86b31a6 FR4 READY; #688 2662d01a, #704 764af2e1 RESTACK READY; #705 2a03d7dd IN PROGRESS | partial | D2d PR on #705 (ops/reports/B-DUNR2-120.md: migration 20270318000000 billing_paused_at/restarted_at, ClientBillingLease serialization, billing_busy; Sol B-705-2..5, Opus B-705-1..3) -> lens pair -> B-DUNB-120 (#689/#690 onto #705, decision-7 full-refund piece C-680-16) -> D5 #691. Lands as one (C-688-12) |
| Trials | b#671 ea7a9740 (now DIRTY: ci.yml), #672 b0654c80, #673 14b7a7a2 FR12 (2,996), #706 9567f8bd, #707 81ec2756 | CI green, NOT READY | conflict refresh on #671 (needs lens delta) -> PR bodies, T5 probe replay on #707, READY -> lens pair over the train -> land -> deploy -> m#338 (DA 48b5e6b5) |
| Messaging (day 1) | b#708 80995735, #709 d0381321, #710 ec99aba0, #711 56cabb77 | B-MSG2 unfinished; #708-#710 green; #711 Schema parity cancelled | finish B-MSG2 (FIX ROUND comments, rerun #711) -> MSG3 lens pair -> M-MSG-120 mobile inbox |
| Lockout | m#352 c89f719c, #353 9d47045b, #354 68c7f080 FR2 READY | no lens verdicts | L3 lens pair |
| Payment sheet | m#342 e3226f3b (now DIRTY: expected-env.json), #343 691e0cf0, #344 88659e21 | DA, HOLD | waits for D4 #690 + native card-update composition + final-main Analyze; conflict refresh then deltas; C-344-12 gates the #705 deploy |
| Invite codes (day 1) | b#658 4de7a6dc FR1 READY | | INV3 lens pair -> M-INV-120 mobile codes screen |
| Coachless (day 1) | b#657 (conflicts: fly manifest, ci.yml, launch-flags.md) | never reviewed | B-SPLIT-COACHLESS-120 |
| Broadcasts (day 1) | b#659 (Opus RC, Sol BLOCK at fa9a7cbd) | | B-SPLIT-BCAST-120 (fix A/B) |
| Scheduling (day 1) | b#712-#720 split READY (tree == #634 + main); b#653 9a23e3b2; m#365-#367, m#336 (dead base); b#643 flag (RC both); m#341 RC both | split READY | SCHA/SCHB lens pairs; mobile pairs; B-SCHED-FIX-120; S-AVAIL-120 (coach booking options); retarget m#336; preflight 0/0 today |
| Roman (day 1) | b#667 -> #665 -> #666 -> #668 -> #669 -> #670; b#655 (approve-to-adjust) + m#337; m#331 (5,067, Sol BLOCK, conflicts) | never reviewed | B-SPLIT-ROMANCHATS-120 first; RA/RB lens pairs; pool debit + daily cap; M-ROMANCAP-120 pop-up; flag PRs |
| Coach setup wizard | m#345 DA; #346 Opus APPROVE / Sol RC (B-346-3, C-346-7); #347 restack DA | queued | B-WIZ3-120 after coach deploy |
| Coach money mobile | m#348 90501f84 (DIRTY vs #347), #349 35aa8163, #350 6fb21216 (red by design), #351 352d768e | READY, never reviewed | lens pair after wizard; land as one |
| Programs | m#355-#358 RC both | queued | B-MWB409-120 (backend 409 details), B-PROG2-120, B-PROG4-120 -> FEATURE_MWB_* flag PR |
| Remainder | m#312 8016a79e DA (behind), m#335 641fe891 DA (behind), m#339 Sol RC (DIRTY), m#340 2e77dcb6 FR1 unaudited (base = closed m#332 branch) | | rule 12 land #312/#335; B-COPY fix round #339; retarget #340 onto #351 + lens pair |
| Google sign-in | b#642 4fee3c02 DA, behind, clean | | rule 12 land + GOOGLE_CLIENT_IDS manifest flip (handoff placed it after D5) |
| Community core flags | b#650 629712a0 (5 lines) | never reviewed | after the community day-1 pieces deploy |

Size headroom to protect: b#674 2,995, b#673 2,996, b#693 2,965 (any fix moves tests to the tests-only piece first).
Oversize NOT-READY PRs to split before review (owner 11:48): b#605 12,817, #591 11,446, #592 6,249, #589 6,140; also over 3k: b#587,
#525, #601, #602, #593, #618 (dependabot). Most are the paused importer or the pre-#651 Roman stack (#598/#601-#603/#605, superseded by
#622/#626/#665-#670): agent 121 verifies and closes superseded ones with comments (branches kept).

## 5. Owner decisions (binding; newest last; DECISION_LOG.md has the verbatim text)

Foundation (09-30 to 10-03)
- 09-30: personal-training service only (no medical claims); Apple first; 2% take rate (coach payout = price - card fees - 2%, no client
  surcharge); minimum paid price $19.99 or free; App Review basis 3.1.3(d) one-to-one coaching, no Apple IAP; role choice at signup
  (R-ROLE-CHOICE-1); minimum age 16+; Roman chats never visible to coaches; coach has one refillable AI bucket; T0-T4 routing replaced.
- 10-01: open signup for every role, codes optional, coachless client is first-class; coachless banner + $49/mo code GP-BRADLEY; two
  packages (free clinic + $49/mo public); voluntary cancel = access through the paid period; non-pay = 10-day lockout, live; dunning 1A
  (card update charges the open invoice and unlocks) and 2A (cancel in dunning voids the invoice, access ends now); native Stripe screens,
  no hosted portal in the client journey; keep AI chats forever (user and account deletion still erase); voice notes reportable and ON at
  launch; "hyperscaler quality is a day-1 blocker / wall clock is resource #1 / smooth is fast / more functionality, not less"; support
  email Bradleyapple1031@gmail.com; Android through Google Play (PWA scrapped); day-1 flags: community, MWB templates/autosave/named
  regimes/AI live-create, dunning v2.
- 10-02: recurring packages "LITERALLY MOST CRITICAL OF ALL", never one-time-only; Apple Pay / Google Pay in the sheet (off by config until
  the merchant ID exists); live free-form Roman chat in v1.0; real free trials (coach sets days, card up front); community-live-tests
  required on main; standing merge and deploy approval.
- 10-03: the clinic binary ships Health Connect on day 1; merge-only exception (rule 12); Supabase Pro approved (owner upgrades).

10-04
- 12:01 R-DISPUTE-PAUSE: a dispute on any charge of a recurring plan pauses all billing and ends access; no auto-restore; the coach
  restarts. One-time purchases unchanged; coach alert with exact amounts still applies.
- 12:14 Supabase Pro on launch day 1; EAS stays Free; Play reviewer accounts on the next APK after steps 1-6.
- 12:28 cap 15 (later 5, then dynamic). 12:33 1,500-line automatic fail for new PRs; open PRs grandfathered at 3,000.

10-05
- 09:43 delete old ci/* (done); failed refund after access ended = alert the coach only; dispute inquiries also pause; full refund on a
  recurring plan pauses billing and ends access (coach restarts); fast-follow items run in a parallel lane and ship day 1 if they clear.
- 09:43-09:46 push + annex (coachless, invite codes, broadcasts, inbox) day 1; split #634 under 1,500.
- 09:47 drain to 7 (agent 120 only). 09:57 Roman upgrades day 1 + v1.1 plan.
- 10:31-10:33 all scheduling day 1; coaches decide times and availability (notice, booking window, buffers, daily max; defaults = today's
  rules); onboarding gate dropped; ONE SHARED TRIAL RULE: one free trial per client per coach, of any kind.
- 10:39 fleet size dynamic per operator (up to 15); no risk sections in owner-facing documents.
- 10:40 LAUNCH_ONE_PAGER v2.1 approved (binding scope and order).
- 10:44 / 11:20 / 11:22 Roman v1.1 decisions 1-9 (planning/ROMAN_V1_1_PLAN.md section 9): coaches see Roman's proposals only;
  approve-to-adjust stays day 1; voice in v1.2; bloodwork with an "Ask your coach" button; notes survive chat deletion.
- 11:40-11:41 layered AI limits: the coach's monthly pool (src/ai-credits, exists) is debited every Roman turn, plus a client daily cap.
  Cap hit: pop-up "You've used your maximum AI allotment today." (503 ROMAN_CAPACITY_REACHED / AI_DAILY_QUOTA_EXCEEDED); an exhausted
  coach pool gets its own code and copy.
- 11:48-11:52 NOT-READY PRs over 3,000 split into pieces of 1,500 or less (clean ones may stay); no open PR over 5k reviewed; 16 superseded
  originals closed; m#331 split is agent 121's first job.

## 6. Owner to-do (his actions only)

1. Stripe Dashboard: add refund.updated to webhook we_1UMt9WDUoC5CCVhShvAELVmI. Confirm customer.subscription.trial_will_end is on before
   the trials deploy.
2. Apple Sign-in key (fly-apple-signin-set.yml through the secure form). Confirm POSTHOG_KEY (server value is too short to be real).
3. Apple Pay merchant ID (EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER) + Stripe Apple Pay certificate, when he wants Apple Pay live.
4. Play Console: Data safety + App content > Health apps (Health Connect data types). Agent 121 sends the click path and draft answers.
5. Health Connect device pass before the clinic Android build. Android push device check after the push deploy.
6. Next build: install, sign up as coach, run setup (packages, programs seed, welcome text, appointment types, QR); account-deletion device
   pass before Apple submission; create the two Play reviewer accounts and fill App access.
7. Launch day 1: Supabase Pro.
Done: FCM V1 key (09:51 10-05); iOS push key in Expo; Stripe destination, retry rule, setup/refund/trial events (10-04); Play app recreated;
Health apps declaration filed 10-04; ci/* cleanup.

## 7. Day-1 blockers (what stands between today and submission + go-live)

1. Coach backend not landed: one delta lens pair, main refresh, land, deploy. Then wizard m#345-#347 and coach money m#348-#351 (never
   reviewed; #348 conflicts with its base).
2. Money: trials train not READY and #671 conflicts; sheet m#342-#344 held and #342 conflicts; m#321 not landed; m#338 waits for trials.
3. Failed payments: D2d not built; #689/#690 RC; D5 #691 behind it; FEATURE_DUNNING_V2 stays off until the C-680-18 guard lands. Lockout
   m#352-#354 has no lens verdicts.
4. Push: Opus PUSH3 + Sol delta, then deploy with migrations and the Android check.
5. Messaging: B-MSG2 unfinished; mobile inbox M-MSG-120 not built.
6. Community annex: invite codes need INV3 + mobile codes screen; coachless #657 and broadcasts #659 need splits and fixes; community core
   flags (b#650) and voice notes after.
7. Scheduling: nine split pieces + #653 + four mobile PRs unreviewed; B-SCHED-FIX-120 and S-AVAIL-120 (coach availability controls)
   not built; reminders flag "on" (b#643, RC both).
8. Roman: whole stack unreviewed; m#331 split; pool debit + daily cap + M-ROMANCAP pop-up; flag registration and flip.
9. Health Connect: flag PR, B-HC12-120, device pass, Play forms.
10. Programs: three builders, then MWB flags (+ MWB_AUTOSAVE_LOCK_TOKEN_SECRET); MWB AI live-create has no lane yet.
11. Remainder: m#312/#335 land; m#339 fix round; m#340 retarget + lenses.
12. Builds and review: EAS Free builds per platform (clinic profile flags final), device pass, App Store + Play submission.
13. Owner keys: Apple Sign-in, POSTHOG_KEY, refund.updated.

## 8. Pre-launch functionality (everything day 1 must do)

- Accounts: email + Apple sign-in (Google after b#642 + GOOGLE_CLIENT_IDS); role choice at signup; coachless client first-class with code
  entry and the $49/mo banner; account deletion (done); privacy policy + trust center (done).
- Coach onboarding: setup wizard, packages editor with the $19.99-or-free rule inline, coach Money page + Home Money card, payout settings
  under Earnings, tax CSV export; invite codes + QR bound to free or prepaid packages; daily signup counts.
- Money: one-time and recurring packages via Stripe subscriptions (deployed), native PaymentSheet with card update (Apple Pay / Google Pay
  by config), 2% fee settlement (deployed), refunds with coach alerts, free trials (one shared trial per client per coach, coach sets
  0-30 days, card up front, trial-ending notice).
- Failed payments: dunning emails, card update charges the open invoice and unlocks, cancel in dunning voids and ends access, 10-day
  lockout screens, R-DISPUTE-PAUSE (dispute or inquiry pauses billing and ends access, coach restarts), full refund on recurring pauses.
- Health: Health Connect (Android) + Apple Health connect, 30-day history import, health and sleep views, ingest flag on.
- Programs: coach program library, templates, autosave/undo, named regimes, bulk assign, program-as-package delivery; AI live-create.
- Messaging and community: coach-client inbox, broadcasts, community spaces with report/block/moderation, voice notes reportable and on.
- Push: delivery on iOS and Android with generic lock-screen text (no email or health details) and Android channels; workout reminders
  from the first-session day; coach welcome message scheduler.
- Scheduling: appointment types, no double booking, coach approval or instant confirm, request expiry, reminders, coach and client calendar
  screens, phone time zone, coach-set open hours, time off, notice, booking window, buffers, daily max.
- Roman: client-data answers, safety checks, live chat behind box-2 consent, 30-case quality test, "your conversations", approve-to-adjust
  (coach sees proposals only), coach pool debit + client daily cap with the pop-up.
- Quality: impersonal voice across shipped copy (m#339), no generic errors, reachability map wired (m#335), reminders toggle (m#312).

Flags to flip after each piece deploys (one audited manifest PR each, then fly-env-sync): FEATURE_WEARABLES_INGEST_POST=true;
community core (b#650) then FEATURE_COMMUNITY_VOICE_NOTES; BOOKING_REMINDERS_ENABLED="on" (b#643; "true" silently disables);
FEATURE_MWB_TEMPLATES / FEATURE_MWB_AUTOSAVE_UNDO (+ secret) / FEATURE_NAMED_REGIMES; FEATURE_DUNNING_V2 after C-680-18; GOOGLE_CLIENT_IDS
-> github-secret; FEATURE_ROMAN_CHAT_ENABLED moved from excluded to flags, plus FEATURE_ROMAN_ADJUST_ENABLED; mobile EXPO_PUBLIC_FF_ROMAN_CHAT
and MWB flags in the clinic EAS profile.

## 9. First moves for agent 121 (after EXECUTE, in order)

1. Launch the 15 slots in section 10. Create ops/lanes121 (JOBS121.md entries first, _COMMON_121.md); snapshot ops/ to
   wip/op121/ops-snapshot.
2. B-SPLIT-ROMANCHATS-121 (m#331) goes first. Finish messaging (B-MSG2 close-out + #711 rerun). Coach delta lens pair. Opus PUSH3 + Sol
   #693 delta.
3. Rule 12 lands at once: m#321, m#312, m#335, b#642 (tree check + green checks). Retarget m#340 onto m#351 and m#336 onto m#367.
4. Land + deploy coach; land push, deploy with migrations.
5. Trials: #671 conflict refresh, finish READY, lens pair, land, deploy, m#338.
6. Dunning D2d builder, lens pair, B-DUNB-120, D5. Then sheet refresh + deltas.
7. Lens pairs: lockout L3, MSG3, INV3, SCHA/SCHB, Roman RA/RB. Builders: B-HC12, B-WIZ3, programs (MWB409, PROG2, PROG4), coachless and
   broadcast splits, M-MSG, M-INV, M-ROMANCAP, B-SCHED-FIX, S-AVAIL, MWB AI live-create lane.
8. Flag PRs as each piece deploys; then EAS builds and the device pass.

## 10. Fleet plan: 15 slots, launched on the owner's EXECUTE

Owner order 12:30 PDT 10-05: 15 parallel agents on EXECUTE. Mix: 4 lens pairs (8 agents) on work that is READY now, 7 builders on the
long poles. Lenses use little CI; 7 builders stay under the 20-job Actions cap. One job = one agent = one or two PRs, then it ends and its
slot goes to the wave 2 queue. Builder model per MODEL_ROUTING.md: T3/T4 work is built by Claude Opus 5.5 and audited by both lenses.

| Slot | Job | Model | Scope | Step |
|---|---|---|---|---|
| 1 | AUD-OPUS-CM10-121 | Claude Opus 5.5 | coach delta at b#674 3a07a0de, #676 fadb2960, #677 e3940bd0, #703 ebde8b3b | 3 Coach |
| 2 | AUD-SOL-CM10-121 | GPT-6.1 Sol | same heads | 3 Coach |
| 3 | AUD-OPUS-PUSH4-121 | Claude Opus 5.5 | full PUSH3 lens on b#692 346cf4a8 + #693 cc0a167f | day 1 push |
| 4 | AUD-SOL-PUSH4-121 | GPT-6.1 Sol | #693 delta (already APPROVE on #692) | day 1 push |
| 5 | AUD-OPUS-SCHA-121 | Claude Opus 5.5 | scheduling split b#712-#716; then SCHB b#717-#720 + #653 | day 1 scheduling |
| 6 | AUD-SOL-SCHA-121 | GPT-6.1 Sol | same queue | day 1 scheduling |
| 7 | AUD-OPUS-INV3-121 | Claude Opus 5.5 | invite codes b#658 4de7a6dc; then MSG3 on b#708-#711 once slot 10 posts READY | day 1 annex |
| 8 | AUD-SOL-INV3-121 | GPT-6.1 Sol | same queue | day 1 annex |
| 9 | B-SPLIT-ROMANCHATS-121 | Claude Opus 5.5 | split m#331 (5,067) into pieces of 1,500 or less, resolve the authActions.ts conflict (owner: first job) | day 1 Roman |
| 10 | B-MSG-FIN-121 | Claude Opus 5.5 | finish B-MSG2 on b#708-#711 (verify the 11:47 CoachMessage RLS fix + restacks, FIX ROUND comments, Schema parity rerun); then M-MSG-121 mobile inbox | day 1 messaging |
| 11 | B-TR9-121 | Claude Opus 5.5 | trials: #671 ci.yml conflict refresh, PR bodies, T5 probe replay on #707, READY over #671-#673/#706/#707 | 2 Money |
| 12 | B-DUND2D-121 | Claude Opus 5.5 | D2d PR on #705 per ops/reports/B-DUNR2-120.md (migration 20270318000000, ClientBillingLease, billing_busy; B-705-1..5) | 4 Failed payments |
| 13 | B-HC12-121 | Claude Opus 5.5 | Health Connect C-370-2 (per-type/day batching, 429 Retry-After) + C-370-3 (sleep double count); then the FEATURE_WEARABLES_INGEST_POST manifest PR | 5 Health Connect |
| 14 | B-SPLIT-COACHLESS-121 | Claude Opus 5.5 | split b#657 under 1,500 per piece, resolve its main conflicts | day 1 annex |
| 15 | B-SPLIT-BCAST-121 | Claude Opus 5.5 | split b#659 under 1,500 per piece with the Opus RC / Sol BLOCK fixes (A/B) | day 1 annex |

Wave 2 queue (fills slots as they free, in this order): lockout L3 pair (m#352-#354); Roman RA/RB pairs (b#665-#670, #667, #655, m#337,
m#331 pieces); B-WIZ3 (after the coach deploy) then the coach money pair (m#348-#351); dunning lens pair over #687/#688/#704/#705 + D2d,
then B-DUNB (#689/#690, C-680-16) and D5 #691; trials lens pair; programs builders B-MWB409, B-PROG2, B-PROG4; B-SCHED-FIX; S-AVAIL
(coach booking options); M-INV mobile codes screen; M-ROMANCAP pop-up + coach-pool debit check; sheet conflict refresh + deltas (after
D4); m#339 copy fix round; m#340 lens pair; MWB AI live-create lane; scheduling mobile pairs (m#365-#367, #336, #341); flag manifest PRs.

Operator work (not slots): rule 12 lands of m#321, m#312, m#335, b#642; retarget m#340 onto m#351 and m#336 onto m#367; rerun the #711
Schema parity check; merges, deploys, flag syncs; close superseded oversize PRs with comments; credits check every 30 minutes; keep this
file current.

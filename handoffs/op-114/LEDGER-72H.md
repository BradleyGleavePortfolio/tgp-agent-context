# TGP operator ledger — owner decisions + to-dos, last 72 hours (agent 114, compiled 2026-10-02 18:50 PDT)

Sources: v6 prompt sections 0.A, 4.12-4.14, 7, 12 (to 16:06); LAST_OPERATOR_STATE agent 110/111/112/113/114 sections; LIVE_STATE owner log;
GitHub board 18:45 PDT. Newest wins. Verbatim owner quotes are in LAST_OPERATOR_STATE.md.

## A. Standing owner rules (binding above everything except AGENT_RULES)
- 10-01 20:38: hyperscaler quality or it is a day-1 blocker; wall clock is resource #1; do it right, do it smooth; more functionality, not less.
- 10-02 16:17: max safe GitHub-CI parallelism; everything built, tested, audited by 10/7; pristine UX, aha moments, Apple-level simplicity.
- 10-01 13:00: do it right or fail; nothing in launch scope is optional; messaging plan approved, all day 1.
- 10-02 16:04: RECURRING packages are the most critical item; never one-time-only.
- Orchestrator only (10-02 12:26): operator grades, decides, routes, merges, deploys, records; builders write code.
- Spend no money (no EAS builds). Never name the clinic partner. Coach welcome text runtime-only. No generic errors. Quiet Luxury copy.
- Messages end "Your next step: ..." or "Nothing needed from you."; escalate decisions, not chores; never remind about Google Play.
- Branch-protection changes need the owner's exact words. Commit identity irrelevant.
- Authority: push + merge (audited exact heads, green, current) and standing deploy approval (audited main, CI green, plan -> apply ->
  deploy -> verify), granted 10-01 20:32 / 10-02 12:10-12:11, carried by 113 and 114 (EXECUTE 10-02 18:22).
- Lane budget: as many as safe (12:38 ruling); pause launches at disk > 80%, avail mem < 1.5 GB, heavy queue > 6 for 10 min.
  16:59: credits may be near the end -> agent 114 runs lean: 6 PR sets here, 6 in sub-manager 114-S.

## B. Product decisions (newest wins)
- Positioning: 1:1 personal training; no Apple IAP; Stripe in-app (13:37 10-01). Open signup; coachless accounts first-class (13:28).
- Two identical packages: free clinic + $49/mo public (13:35); $19.99 floor (#629); fee = price - actual Stripe fee - 2% (S-FEE #627).
- Refund/chargeback: alert coach, net TGP 2% + Stripe fees from the coach's next sale (OR-111-1). Lost disputes on subscriptions by hand v1.0 (OR-111-2).
- Stripe immersion: native TGP-themed PaymentSheet; native billing screens; no hosted portal (OR-110-2, 20:32).
- Recurring via native PaymentSheet (Subscription default_incomplete, first-invoice PI), payment-intent refuses renewing (OR-113-1, OR-112-23).
- 16:34: Apple Pay + Google Pay in the sheet = yes (off-by-config until merchant ID); live free-form Roman chat v1.0 = yes; real free
  trials = yes (coach sets days, card up front, one per client per coach, trial-ending notice); community-live-tests required = yes (applied 16:41).
- AI chats kept forever unless the client deletes them or the account (20:32 + OR-110-1). Voice notes reportable and ON at launch after device pass.
- Cancel timing A (period end); lockout audited, tested, then flipped (13:43). Dunning retries Days 1/3/7 (owner Stripe settings).
- Diagnostic quiz off (another product); Build Week Day 1 points to the consultation (OR-112-12, #644/#649 live).
- Android = Google Play (PWA scrapped, 14:28); Play app/testers are the owner's later task.
- Programs builder: reuse the June backend (09:53). Roman: grounded, box-2 consent, butler tone.
- OR-112-1 #642 Google sign-in after #608 deployed. OR-112-2/3 reminders + device push (Expo Push, receipts, quiet copy). OR-113-5 quiet hours 21:00-08:00 enforced.
- OR-112-4 #634 zero-row pre-deploy queries mandatory. OR-112-5 + OR-113-9 auto-expiry (48h / 1h before / 30-min min; quiet close > 24h).
- OR-112-6 community: account deletion fails closed on voice erasure failure; #610 Cs -> B-UGC-5 (#652) before launch.
- OR-112-7 + OR-113-11 wearables: Health Connect on in clinic Android; 15 reads only; flips after #608 deploy + device pass.
- OR-112-8 Roman chats order #635 -> #326 -> #331. OR-112-9 coach #329 T4; #332 audited alone then merged into #329; coach CSV export v1.0 if time.
- OR-112-10 + OR-113-3 release: live pk required on clinic/production (checked OK 16:52); order #333 -> #330 -> #305; preview build + forced
  pre-JS crash to Sentry before first build (C-330-2); Sentry IP storage off.
- OR-112-13 pairs merge together: #634/#325, #641/#329+#332, #628/#322, #627/#321, #640/#328, #609/#312, #608/#636/#327, #654/#334.
- OR-112-15 consent items; OR-112-21 #315 T4, specific policy-link failure message, impersonal SupportEmailFallback copy.
- OR-112-16 + OR-113-6 idempotent package create inside #641. OR-112-17 C-608-2 step-up + C-608-7 HMAC before launch (built in #608 R7).
- OR-112-18 MWB: autosave owner/visibility check before launch; flips in order after #640 deploys.
- OR-112-19 Connect return/refresh URLs via manifest after #641 deploys (probe branded host first).
- OR-112-20 #649 pre-deploy SELECT (done; #649 live). OR-112-22 Day 1 sheet payment failure = launch blocker (#334).
- OR-113-4 pending migration prefixes keep their numbers. OR-113-8 #305 rulings (C-305-7, C-305-2, C-305-3). OR-113-10 release-evidence-gate
  T4 follow-up. OR-113-12 no owner transcript reads. OR-113-13 reachability rulings (#335).
- OR-114-1: #611 splits the operational restore runbook into a follow-up; tier stays T4.

## C. Where agent 113 left off (17:31 PDT, verified on GitHub 18:45)
- Production = backend main 53b6d472 (#610 deployed 16:55). Mobile main aae30ac0 (#330 merged 17:08). No repo activity since 17:45.
- 113's lenses were all finished; every later fix round waits for 114's audits (owner 17:04). In-flight builder lanes died with the
  session; their last pushes are on GitHub: #628/#322 (R5, CI red), #640/#328 (fix round b9d00d56 green / #328 red), #641 green /
  #329 red, #647 red / #648 BEHIND, #609/#312 green, #656 B-TRIALS red, #661 secrets follow-up green, #650 flags green, #652 red.
- Annex session (1f6fdf2e): #657 red, #658 green, #659 green, #660 red; A5/A6 nothing mergeable. Reserved prefixes 20270301-20270306.

## D. To-do (operator view; owner = 114 unless marked 114-S or OWNER)
Batch 1 running (18:40): #627 R7 dual, #314 R7 dual, #645 dual delta, #608 CodeQL round + dual, #327 main merge + delta, #654 + #334
recurring (build -> dual full), #611 round 6 -> dual. Merge train after: #627+#321 -> retarget #654 -> #654+#334; #608+#327 (C-636-6 probe)
-> deploy -> #642 flip; #314 -> deploy -> #650 community flags; #645; #611 (+#315 from 114-S) after owner facts.
114-S: #305, #317, #326, #315, #634+#325 (zero-row queries), #651 (then FEATURE_ROMAN_CHAT_ENABLED + close #602/#603/#605/#598 model part).
Next wave (114, as slots free): #656 trials (pairs with #654), #628/#322 dunning R5 CI, #641/#329/#332 coach Money, #640/#328 MWB,
#647/#648 notifications + quiet hours -> #643 flip, #609/#312, #661, #652, #653/#336 auto-expiry, #331 Roman chats, #335 reach,
#655/#337 approve-to-adjust, annex #657-#660, Connect URLs manifest, MWB autosave owner check, release-evidence-gate T4, B-UGC follow-ups,
native client billing screens, notification follow-ups (7), deletion follow-ups (legacy export fn, C-313-5, recipes, bookmark),
messaging (Telegram-grade items not in A3/A4), coach daily brief, S-ERRORS slices, SupportEmailFallback copy.
Release: C04 coach setup after owner signs up; C11 App Store package; native build after #305/#330/#317/#314/#325; 2 TestFlight passes.
OWNER: FCM V1 key; Stripe live settings (retries, branding, charge.dispute.closed, pk_live on Fly + EAS); Apple Pay merchant ID;
#611 facts (Supabase plan/PITR, Anthropic ZDR, Mux live?, vendor plans); SENTRY_AUTH_TOKEN (sensitive EAS var); install build + sign up as coach.

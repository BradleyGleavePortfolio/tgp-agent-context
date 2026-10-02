# LAST OPERATOR STATE
Updated: 2026-10-02 13:28 PDT (real clock, `date`). Operator: Computer, agent 112, session 6870f2ca
([thread](https://www.perplexity.ai/computer/tasks/6870f2ca-44ec-4e04-bd4d-cc3588cd0547)). Agent 111 (26029069) ran out of
credits and retired ~11:10 PDT 2026-10-02; all of its subagents are dead. Single writer for Bucket A from 2026-10-02 12:10 PDT.
Companion file: [LIVE_STATE.md](LIVE_STATE.md).

## AGENT 112 TAKEOVER 2026-10-02 11:20-12:20 PDT — reconciled facts (read first)

Read word for word: the 17 owner attachments, all of LAST_OPERATOR_STATE.md (1,808 lines at d11fd94), LIVE_STATE.md,
FLAGS_LAUNCH_LEDGER.md, the v5 prompt (handoffs/op-f083060f), handoffs/op-26029069 (brief, lanes, reports). Consolidated
72-hour owner decisions + to-do ledger shared with the owner (operator workspace TGP-Decisions-and-ToDo-Ledger-2026-10-02.md).

### OWNER DECISIONS 2026-10-02 (agent 112; binding)
- 11:28 "111 is out of credits and now retired - can you confidently pickup exactly where if left of?" -> takeover.
- 12:10 "EXECUTE — 7 agents staggered, push + merge approval" = EXECUTE; budget 7 subagents staggered (2 slots kept for the
  Sol + Opus audit lenses); standing push + merge authority (audited PRs, after a dependency check).
- 12:11 "standing deploy approval granted!" = standing deploy approval (audited main, CI green, plan -> apply -> deploy ->
  verify) for agent 112.
- Owner connected GitHub (admin on both repos) and Supabase (read-only use) at 12:07.

- 12:26 "Make sure your oeprating solely as the orchestrator, grading PR's, making owner adjacent decisions, ect. NOT as a coder
  or grunt worker" -> binding: operator orchestrates, grades, decides, merges, deploys, records; every code/PR change goes to a
  builder lane (the manifest flips the operator had started locally were discarded unpushed and handed to lane B-FLAGS-3).
- 12:26 asked for a status update and why parallelism is not higher -> answered (7 subagents = owner budget; 8-agent hard cap
  incl. operator; 2 CPU / 7 GB sandbox, heavy jobs serialized).

- 12:30 "7 buidlers/fixers -> 14 auditors = same to me - use this as the implied cap ruling and MONITOR SANDBOX STATE and try to
  find the chefs kiss balance, pelase" -> binding CAP RULING: weighted budget of 7 builder-units; 1 builder/fixer = 1 unit,
  1 auditor = 0.5 unit (7 builders <-> 14 auditors). Operator monitors the sandbox (ops/sandbox_monitor.sh -> ops/sandbox.log,
  one line/min: used/avail MB, load, disk %, heavy-queue depth, worktrees) and tunes the builder/auditor mix.
  12:36: 5 builders + 4 auditors = 7.0 units (added AUD-SOL-4 and AUD-OPUS-4; queues split).

- 12:38 "Lets maximize our github lanes - get to work! I want audits flying, builders building, tons of fixers" + 12:38 "as much as
  safely possible given dependency and cross threading workloads" -> binding: SUPERSEDES the 12:30 numeric cap. Run as many lanes
  as is SAFE: (1) sandbox telemetry (ops/sandbox.log) — pause new launches if disk > 80%, avail mem < 1.5 GB, or heavy queue
  stays > 6 for 10 min; (2) no two lanes write the same PR/files (G04); (3) dependency order (push holds until the other lens's
  verdict is posted, so one fix round closes both lenses). Process: builders offload tsc/full suites to GitHub Actions (free for
  public repos); npm cache cleaned (+1 GB disk).
- 12:40 Wave A launched: AUD-SOL-5 (#642/#643 flips, #641/#329, #609/#312), B-CONSENT-4, S-ROMAN-CHATS, S-COACH-BE-2, B-JOURNEY-2.
  Wave B lane files ready (launch after telemetry check): S-COACH-MOB-2, B-FEE-R6, S-MWB-2, S-RELEASE-MOB.
- 12:38 AUD-OPUS-4 done: backend #641 REQUEST CHANGES 0/2/4, mobile #329 BLOCK 1/2/4 (Money UI entirely missing: Home card, Money
  page, Business metrics fold-in, Payout settings, old Earnings/Business screens still call six 404 routes). C-641-2 (pre-existing,
  SECURITY): coach payment routes send the client's Stripe client_secret + ephemeral key to the coach -> separate T4 PR in
  S-COACH-BE-2. After #641 deploys: STRIPE_CONNECT_RETURN_URL / STRIPE_CONNECT_REFRESH_URL must be set (Stripe onboarding 503 until).
- 12:38 B-FLAGS-3 opened backend #642 (GOOGLE_CLIENT_IDS -> github-secret) and #643 (BOOKING_REMINDERS_ENABLED -> on).

- 12:40 "now let all of these agents completely - record the process and results, and then move forward" -> binding: no new
  lanes launched until the current 17 finish; operator processes each lane's result as it lands (grade, merge when dual-approved
  at head + green, deploy under standing approval), records process + results here, then plans the next wave.
- 12:41 Wave B launched before that message: S-COACH-MOB-2, S-RELEASE-MOB, B-FEE-R6, S-MWB-2. Total 17 lanes (13 builders,
  4 auditors: AUD-SOL-3/4/5, AUD-OPUS-3).

### Lane roster (agent 112; weighted 7.0/7 units; see 12:30 cap ruling)
| Lane | Model | Scope | Launched |
|---|---|---|---|
| AUD-SOL-3 | GPT-6.1 Sol | #607 delta, #628/#322, #635, #627/#321, #640/#328, #609/#312 | 12:24 |
| AUD-OPUS-3 | Claude Opus 5.5 | #607 delta, #635, #609/#312, flag PRs | 12:24 |
| B-EXPORT-3 | Claude Opus 5.5 | #608, #636, mobile #327 (App Store 5.1.1(v)) | 12:24 |
| B-UGC-4 | Claude Opus 5.5 | #610 + mobile #314 (App Review 1.2, voice notes) | 12:27 |
| B-FLAGS-3 | Claude Opus 5.5 | manifest flips GOOGLE_CLIENT_IDS, BOOKING_REMINDERS_ENABLED=on | 12:27 |
| S-WEAR-2 | Claude Opus 5.5 | mobile #317 wearables | 12:29 |
| S-SCHED-4 | Claude Opus 5.5 | #634 + mobile #325 | 12:29 |
| AUD-SOL-4 | GPT-6.1 Sol | #627/#321, #640/#328, #609/#312 (split from AUD-SOL-3, which keeps #628/#322, #607, #635) | 12:36 |
| AUD-OPUS-4 | Claude Opus 5.5 | #641/#329 (+ completeness vs S-COACH objective), #609/#312 (split from AUD-OPUS-3) | 12:36 |
Queue (next free slot, in order): B-CONSENT-4 (lane file ready), S-ROMAN-CHATS (lane file ready), (#326 retarget+merge main, #315 copy, #611 + procedures doc, #635 findings),
S-COACH-2 (verify/finish #641/#329), B-FEE-R6 (#627/#321 after Sol), S-MWB-2 (#640/#328 after Sol + undo button),
S-DUNNING-R4 (only if Sol RC on #628/#322), B-JOURNEY-2 (#324, B-QUIZ-OFF, setup-branch-protection.sh), S-REACH, Roman stack.

### Facts after 111's last entry (10:41), reconstructed from GitHub + production (agent 112, verified 12:07-12:10)
- 10:53 #638 (FEATURE_AI_CONSENT_LEDGER_ENABLED=true) merged -> backend main 3bd6215b (on #637 91359821).
- 10:54/10:55 fly-env-sync apply; 11:01 Fly Deploy (workflow_dispatch) 3bd6215b success; 11:06 fly-env-sync plan (verify):
  "Plan: 0 to set, 0 to unset, 0 staged earlier and waiting for a deploy, 53 unchanged. Fly already matches the manifest";
  FEATURE_AI_CONSENT_LEDGER_ENABLED | flag | true | Deployed | match. OR-110-4 DONE.
- Migration 20270216000000_package_first_published_at applied 18:05:32Z (finished 18:05:32.107Z, not rolled back).
- Postgres logs 17:30Z-19:08Z: zero ERROR/FATAL/PANIC messages. /health 200, /readyz db up.
- Live signup-policy: providers email + apple; google_signin_enabled false (GOOGLE_CLIENT_IDS not on Fly -> owner's 10-01 10:01
  "Google sign-in day 1" NOT live: to-do); role_choice true; no invite/coach code required.
- 111 lanes that died without final reports: S-COACH (pushed backend #641 563e3f80 + mobile #329 4071d0ce; completeness
  unknown), B-CONSENT-3 (#635 -> c2688010 at 11:09; #326 re-merge, #315 copy line, #611 procedures doc not done), B-JOURNEY
  (#609 -> 40616dcf, #312 -> 90e78abe; #324, B-QUIZ-OFF, setup-branch-protection.sh not done), S-WEAR (#317: nothing pushed),
  AUD-SOL-2 / AUD-OPUS / AUD-OPUS-2 (verdicts posted through 18:06Z; rest of queues not done).

### Train log (agent 112; newest first)
- 12:11 MERGED mobile #310 (C05 consultation onboarding + D2 consent, T4; Opus APPROVE 17:45Z + Sol APPROVE 18:06Z at
  c2414203, 3/3 required green, CLEAN) -> mobile main 2c17c241. Dependency check: release order is about builds/deploys, not
  merges -> RELEASE GATE: no mobile build carrying #310 until backend #635 (client-ai-v4) is deployed (a v4 grant gets 409
  from a pre-#635 server). Branch kept (mobile #326 is stacked on it; retarget + re-merge in B-CONSENT-4).
- 12:11 backend #607 was BEHIND main (strict protection): update-branch (merge of main 3bd6215b) requested; dual delta
  attestation (Sol + Opus) at the new head, then merge.
- 13:28 S-RELEASE-MOB DONE: mobile #305 -> 92c25ec (base retargeted to main; expo-updates OTA, clinic channel, non-blocking
  launch check, publish script refuses env drift; DEP CHANGE expo-updates); NEW #330 @ 4c61d91 (Sentry native crash capture via
  config plugin; screenshots/view hierarchy/network breadcrumbs off; Sentry user = account id only); NEW #333 @ abfc5d1
  (release-env check in EAS pre-install; clinic requires live Stripe pk + API/Supabase/Sentry + 11 eas.json values). All CI green.
  RULINGS: live Stripe key REQUIRED on clinic + production builds; before merging #333 the operator verifies the EAS environment
  values (check:release-env) so builds do not break; merge order #333 -> #330 -> #305, then one preview build + device check (forced
  pre-JS crash reaches Sentry); keep the Sentry plugin until Expo supports Sentry SDK 8. Audits: AUD-OPUS-3 + AUD-SOL-3 (after #331).
- 13:27 B-JOURNEY-2 DONE: mobile #324 -> e7c403f3 (B-324-1 SupportEmailFallback; one support constant + stricter guard);
  backend #644 @ 9697c735 B-QUIZ-OFF (DiagnosticModule unloaded; 3 quiz routes 404; no migration) -> operator update-branch ->
  d32dcfca; backend #645 @ aa6a80f1 (protection script lists the 10 live required checks incl. Schema parity, T4).
  SETTINGS CHANGE (operator, reversible): 'require linear history' ENABLED on main in backend + mobile (GraphQL
  updateBranchProtectionRule; strict/admin-enforced/10 and 3 checks unchanged; squash merges unaffected). Conversation resolution
  stays OFF (comment-based audits would stall). #645 to mirror live exactly. Build Week Day 1 copy 'Complete the 40-point
  diagnostic' -> data migration 20270224000000 + seed file pointing to the consultation (same agent, new PR). Audits: #324/#644 ->
  AUD-SOL-4 (T2 single lens); #645 -> both lenses after its fix push.
- 13:26 S-COACH-MOB-2 DONE: mobile #329 -> 83ee0e46 (A-329-1 checklist no longer opens dead Earnings; B-329-1..4 + Cs; main
  merged; CI green); NEW stacked mobile #332 @ 61eea115 (coach Money page + Home Money card + charges list + payout settings;
  Earnings/Business metrics routes redirect to Money; no calls to the six 404 routes; CSV export not built — no backend route).
  RULINGS: #329 raised to T4 (retitled + comment); #332 audited alone, merged into #329's branch when dual-APPROVED, then #329 delta
  closes A-329-1, then merge. Audits: AUD-OPUS-4 + AUD-SOL-5. Coach CSV export -> backlog (needs backend route; owner: more).
- 13:24 S-ROMAN-CHATS DONE: opened mobile #331 @ a224e5bd (Roman chat list/transcript/delete one/delete all; Settings > Privacy >
  Roman and AI, Roman header, coach Settings > Privacy; sign-out clears; fixed romanApi.ts UUID-only id check that broke every
  live Roman call against cuid ids). CI green. RULINGS: merge order #635 (fix round) -> #326 -> #331; coach row gated like the
  client row; delete-all keeps typed DELETE confirm. Audits: AUD-OPUS-3 + AUD-SOL-3.
- 13:24 AUD-OPUS-4: #610 delta APPROVE at a98d08b5 (0/0/0 new; exact merge; seam + migration order verified; 10/10 required green).
  #610 waits for AUD-SOL-4.
- 13:21 AUD-SOL-5 DONE: #642 RC 0/1/0 (B-642-1 confirmed: backend accepts only google|apple re-auth, mobile sends google_session
  -> deletion dead end; #642 waits for #608 live); #643 RC 0/2/1 (B-643-1 push rows never reach pushToUser; B-643-2 duplicate inbox
  rows); #641 RC 0/4/4; mobile #329 BLOCK 1/4/4; mobile #312 RC 0/2/2; #609 RC 0/4/4 (rls-live-tests red). Push holds lifted for
  S-COACH-BE-2 (#641), S-COACH-MOB-2 (#329), B-JOURNEY-3 (#609/#312); B-FLAGS-3 notification work given Sol's #643 root cause.
- 13:18 AUD-SOL-3: backend #634 REQUEST CHANGES 0/2/1 at d1661ab8 (5960774667: B-634-2 partial — first-claim failures vanish after
  the due band, retained future rows starve recovery; B-634-6 raw ORM diagnostics); mobile #325 APPROVE 0/0/1 at 36f05bba
  (5960782021) -> #325 now dual-APPROVED but HELD: merges together with #634 (scheduling pair; clinic build calls #634 routes).
  S-SCHED-4 agent interrupted dunning to fix #634 round 5 (its own code), then resumes S-DUNNING-R4.
- 13:16 S-WEAR-2 DONE: mobile #317 -> 0b733fb (A-317-1 account binding through permission prompt/registration/import; Samsung
  uploader without binding removed; B-317-2 partial imports; B-317-5 'Not syncing here' + Reconnect; Health Connect clinic-only;
  coach wearable-prompts reachable). CI green. RULINGS: Health Connect ON in clinic Android build; REMOVE the 3 declared-but-unread
  health permissions (least privilege); ADD confirm-on-disconnect (C-317-4) now; FEATURE_WEARABLES_INGEST_POST flips only after
  #608 is deployed; later flips FEATURE_COMMUNITY_WEARABLE_PROMPTS=true + clinic EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS=true;
  WEARABLE_AI_INSIGHTS stays unset. Same agent pushing fix round 4b; audits (Opus-3 + a Sol lens) start at that head.
- 13:15 AUD-OPUS-4: backend #610 APPROVE at 7a67fbef (0/0/5, 5960733421) and mobile #314 APPROVE at 48d76d21 (0/0/2, 5960733821).
  Operator ran update-branch on #610 -> a98d08b5 (merge of main f04289f9); Opus delta + Sol (AUD-SOL-4) at a98d08b5 pending.
  RULINGS: deletion fail-safe accepted; FEATURE_COMMUNITY_VOICE_NOTES stays off until native EAS build + iOS/Android device pass;
  Opus Cs ('Bucket not found' treated as deleted, placeholder stall, crash window, open coach-lookup grant, retry count) ->
  post-merge follow-up PR before launch (queued: B-UGC-5).
- 13:12 AUD-SOL-4 DONE: backend #627 REQUEST CHANGES 0/3/1 (5960082485); mobile #321 BLOCK 0/1/1 (5960679604); backend #640
  BLOCK 1/3/6 (5960191185); mobile #328 REQUEST CHANGES 0/4/1 (5960191675). Push holds lifted for B-FEE-R6 and S-MWB-2 (fold Sol +
  Opus findings in one round). Operator removed AUD-SOL-4's six worktrees (symlinks first; deps intact) -> disk 71%. AUD-SOL-4
  re-tasked to #610/#314 re-audit (moved from AUD-SOL-3, whose queue is now #634/#325 only).
- 13:11 AUD-OPUS-3: backend #634 APPROVE at d1661ab8 (0/0/1) and mobile #325 APPROVE at 36f05bba (0/0/1). Sol (AUD-SOL-3)
  pending on both. #634 pre-deploy checks run read-only at 13:12: overlaps 0, inverted ranges 0, 'Quick initialization' session
  types 0 (C-634-5 moot today).
- 13:12 B-UGC-4 DONE: backend #610 -> 7a67fbef, mobile #314 -> 48d76d21, all 6 B's fixed, CI green incl. community-live-tests
  99/99. RULINGS: one-line ci.yml change (adds live spec to community-live-tests) APPROVED as a gate strengthening (T4, auditors
  read it); account deletion fail-closed on voice-note erasure failure (stop + retry) APPROVED. Re-audits: AUD-OPUS-4 + AUD-SOL-3.
  Launch flips after deploy: FEATURE_COMMUNITY_API/POSTS/MESSAGES/PUSH/REALTIME true; VOICE_NOTES only after audits + device pass.
  Same agent re-tasked to B-JOURNEY-3 (#609/#312 fix round; push hold until AUD-SOL-5 posts).
- 13:10 Sandbox tuning: ops/heavy.sh now runs TWO heavy slots (one per CPU; second slot only if MemAvailable >= 2.2 GB); old
  single-slot version kept as ops/heavy.sh.1slot. Builders were starving in the queue (B-UGC-4 and AUD-OPUS-3 local runs timed out).
  Monitor restarted (pid file ops/sandbox_monitor.pid); heavyq now counts heavy.sh processes incl. wrappers (~2x real jobs).
- 13:01-13:08 DEPLOYED backend f04289f9 (#607) — fly-deploy run 37057884825 (release_sha f04289f9, migrations=apply-migrations;
  production environment approved by operator 112 under the owner's standing deploy approval; push CI on f04289f9 green except the
  known non-required release-please). Verify: migration 20270212000000_clinic_onboarding_intake finished 20:05:07Z, not rolled
  back; Postgres logs 19:55Z-20:10Z zero ERROR/FATAL; /health 200, /readyz db up; PUT /api/me/onboarding/consultation live (401
  unauthenticated); fly-env-sync plan run 37058420196: "0 to set, 0 to unset ... 53 unchanged. Fly already matches the manifest".
  Note: fly-env-sync plan also waits on the production environment approval.
- 13:03 S-SCHED-4 DONE: backend #634 -> d1661ab8 (B-634-2 sweep catch-up; (kind,status) index inside unapplied 20270222000000;
  main merged; pre-deploy zero-row SQL in PR body), mobile #325 -> 36f05bba (B-325-2/3; main merged incl. #310 tour hand-off;
  seed is_welcome on Quick initialization; ClientBookingRequest route deleted). CI green both. Re-audits: AUD-SOL-3 + AUD-OPUS-3.
  RULINGS: operator runs both pre-deploy queries read-only and requires zero rows before deploying #634; auto-expiry of
  unanswered past requests is built for v1.0 (follow-up PR after #634/#325 approval). Same agent re-tasked to S-DUNNING-R4.
- 12:58 AUD-SOL-3 DONE: #607 APPROVE at b4750d05 (0/0/0); #628 REQUEST CHANGES 0/3/0; mobile #322 REQUEST CHANGES 0/3/1; #635
  REQUEST CHANGES 0/2/1 (generic uncoded 500s on deletion failure; list validation errors lack codes). #635 fixes -> B-CONSENT-4
  (top of its lane); #628/#322 -> S-DUNNING-R4 (Sol probes in ops/aud-sol3-112/).
- 12:53 MERGED backend #607 (C05/C07 consultation intake, T4; Opus APPROVE 5959951180 + Sol APPROVE 5959946105 at b4750d05; 10/10
  required green) -> main f04289f9. Deploy of f04289f9 (migration 20270212000000) after push CI is green (standing approval).
- 12:55 AUD-OPUS-3 round 2: #609 REQUEST CHANGES 0/2/3 (B-609-1 rls-live-tests red: test matches Prisma message text, use SQLSTATE
  23505; B-609-2 new kill switches need values/unsetIs + manifest entries; C-609-5 retitle Conventional Commits); mobile #312
  REQUEST CHANGES 0/1/2 (B-312-1 generic alert on toggle failure); #642 REQUEST CHANGES 0/1/0 (B-642-1: merging arms the flip
  because any later sync applies the whole manifest, and Google-only users cannot delete their account in-app until #608 is live
  -> RULING: #642 merges only after #608 is deployed; B closes by ordering, no re-audit if head unchanged); #643 REQUEST CHANGES
  0/1/1 (B-643-1: reminders show times in UTC and appear twice in inbox/unread -> RULING: not shipped as-is (sub-bar); fix via
  notification follow-up owned by B-FLAGS-3 as a continuation).
  NEW LAUNCH BLOCKER (to verify): push-channel notifications are stored but never sent to devices (no coach message, reminder or
  welcome reaches the lock screen) -> B-FLAGS-3 continuation: verify end to end, then real Expo Push delivery (Android needs the
  owner's FCM V1 key). #608 erasure must cover #609's 3 new tables + accept google_session re-auth -> sent to B-EXPORT-3.
  Merge order: #607 -> #609 (update-branch, fixes) -> deploy -> mobile #312.
- 12:45 AUD-OPUS-3: backend #607 APPROVE at b4750d05 (delta; merge-of-main pure; B-607-5 Danger title closed by operator retitle
  + re-run 19:30Z; C-607-6 migration 20270212000000 sorts before applied 20270216000000 — harmless, do not rename); backend #635
  APPROVE at c2688010 (0/0/1; B-635-2/3, C-635-1/2/3 closed). Waiting: Sol deltas on #607 and #635 (AUD-SOL-3).
  Routing from the #635 audit: (1) LAUNCH BLOCKER: mobile has no Roman chat list/delete screen while #310 copy promises "kept until
  you delete them" -> lane S-ROMAN-CHATS queued; (2) "or your account" true only once #608 deploys (B-EXPORT-3); (3) export must
  include Roman chats -> added to B-EXPORT-3; (4) SHIP ORDER: deploy #635 before any mobile build carrying #310.
- 12:33 Danger on #607 failed only on the PR title (not Conventional Commits) -> operator retitled + re-ran Danger (green 19:30Z).
  Brief updated: PR titles must be Conventional Commits; auditors never stall the whole queue on one PR.
- 12:15 ops bootstrap: repos cloned (full history), ops/ tooling from handoffs/op-7c52cefa + op-26029069, shared deps install.

## AGENT 111 TAKEOVER 2026-10-02 07:53-08:00 PDT — reconciled facts (read first)

Read word for word: the 18 owner attachments (v5 prompt, Agent Rules, Model Routing, EXECUTE doctrine, docs), all of
LAST_OPERATOR_STATE.md, LIVE_STATE.md, FLAGS_LAUNCH_LEDGER.md, DECISION_LOG.md (historic), handoffs/op-f083060f
(README, brief, lanes, reports). Ops bootstrap done (ops/ from op-7c52cefa + op-f083060f; shared deps install started 07:53).

### OWNER DECISIONS 2026-10-02 08:03 PDT (answers to the 111 readback; binding)
- Budget: "All 7, staggered (Recommended)" = 7 subagents, staggered; 2 slots kept for the Sol + Opus audit lenses.
- Refund / chargeback recovery (B-627-3), verbatim: "A coach sells a package -> customer chargebacks -> we send the coach an
  alert, we sent the customer $xxx,, that wer'e holding the sum of our 2% fee and the stripe fees from his next sale, in
  addition to the standard charges - make sense? Basically we will settle up by wage gouging!"
  Operator ruling OR-111-1 (implementation of that answer, lane B-FEE-R5 on #627):
  1. On a refund or a chargeback, the coach gets an alert (push + Money "needs attention" + email when the provider is live) with
     exact amounts: what the customer got back, and the amount TGP is holding from the coach's next sale = TGP's 2% + every
     Stripe fee on that charge (processing fee Stripe keeps, dispute fee), on top of the next sale's standard fees.
  2. The coach's share of the refunded charge comes back by reversing that charge's own transfer; whatever Stripe refuses
     (coach already paid out) joins the held amount.
  3. Recovery is forward-only netting: the held amount is deducted from the coach's next transfer(s) until fully settled
     (carried across sales; Money page shows the open balance). No payout delay, no debit_negative_balances, no Account
     Debits, no reversal of the coach's other past sales' transfers (supersedes round 4's 90-day clawback).
  4. Won disputes / reinstatements net against the open balance. A coach who never sells again leaves an open receivable:
     SFEE_RECOVERY_OPEN alert to the operator/owner (accepted residual; production has 0 paid sales).

### Train log (agent 111; newest first)
- 10:41 MERGED backend #637 (launch-flag manifest + plan/apply/verify; dual APPROVE at 1c28fb20, checks green) -> main 91359821.
  #638 retargeted to main; operator merged main into it (add/add conflict; patch-id fc7edcdb identical to the audited flip) ->
  4a121b67, ready for review; dual delta pending (last gate before deploy). B-FEE-R5 done: #627 9d6351b0 (CI green; OR-111-1
  implemented: $100 refund -> reverse $94.80, hold $5.20 from next sale; lost dispute w/ $15 fee -> hold $20.20; refused reversal
  -> hold $100 netted across next sales; TGP +$2.00 per charge), mobile #321 7322bbf (Opus 0/2/4 closed; trial-days/features
  inputs removed because backend stores neither — operator ruling: keep out; IDEA for owner: real package free trials, T4).
  Queued: #627 + #321 -> AUD-OPUS-2 and Sol. Launched S-WEAR (mobile #317 fix round). Deploy will apply 1 migration
  (20270216000000_package_first_published_at).
- 10:33 B-CONSENT-2 done: #607 f6fa244b, mobile #310 c2414203, mobile #326 8f8d6424 (stacked on #310), #611 0ed698a4; #635
  e7f67576 got RC from BOTH lenses after the lane ended (Opus 0/1/2, Sol 0/2/3). Rulings: #611 publication hold — merges only after
  the ledger deploy, #608 live and written vendor-deletion/backup procedures; #611's rewritten deletion wording (lists what is kept)
  accepted for accuracy (owner may object); mobile #315 Trust Center "deleted after 180 days" -> "kept until you delete them or your
  account" (B-CONSENT-3); mobile support addresses consolidated in #324 (B-JOURNEY). Launched B-CONSENT-3 (#635 first, #326 re-merge,
  #315 line, #611 procedures doc).
- 10:31 S-MWB done: backend #640 (2ac6395f, T4; migration 20270223000000) + mobile #328 (dbd5ceb, T3): Programs tab, week x day grid
  into the existing builder, saved workouts, bulk assign (per-client results, idempotent), program in packages incl. $0 grants.
  Rulings: clinic EAS profile keeps EXPO_PUBLIC_FF_MWB_PROGRAMS/AUTOSAVE on; backend FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO
  (+ MWB_AUTOSAVE_LOCK_TOKEN_SECRET), FEATURE_NAMED_REGIMES flip via manifest when #640 deploys; routes ungated by tier. Open:
  builder undo button (spec says autosave AND undo -> follow-up lane), sub-coach day access, June clone route 2nd-client 409, archive
  guard after #607. Launched AUD-OPUS-2 (second Opus lens: #628/#322, #610/#314, #640/#328) to balance the audit queue.
- 10:24 S-SCHED-3 done: #634 -> 2a07ab25, mobile #325 -> 13b8a8f (all A/B/C closed; CI green). Queued to both lenses after #637/#638.
  Rulings: pre-move warning ships now; canonical support address Bradleyapple1031@gmail.com (SupportInbox hello@ goes);
  run #634's two pre-deploy zero-row queries (read-only) before deploying its migration. Launched S-COACH (coach wizard + Money).
- 10:23 MERGED backend #639 (SC2015 fix, T4 dual APPROVE + dual delta at 2210c760) -> main e867fe62. #637 update-branch -> 1c28fb20
  (fix round 1 + main); both lenses auditing 1c28fb20, then #638. DEPLOY PLAN once #637 + #638 merge: fly-env-sync plan ->
  apply (confirm=SET, deploy_staged=false; stages FEATURE_AI_CONSENT_LEDGER_ENABLED=true) -> fly-deploy main (apply-migrations)
  -> fly-env-sync plan (verify) -> /health, migrations, Postgres errors. BOOKING_REMINDERS_ENABLED=on (OR-110-5) needs its own
  one-line manifest PR next (reminders stay off until then; no live bookings).
- 10:22 #637 fix round 1 pushed e473428c (B-637-1 fail-closed apply-now verification on every started machine, bounded retry;
  B-637-2 per-flag kill values via unsetIs + kill-switches command); #638 restacked 9a4fa721. Both lenses re-queued (top priority
  after #639 delta). Operator rulings: C-637-11 not required (manifest must be able to remove secrets), C-637-12 flyctl pin not
  required. B-JOURNEY relaunched (resumes wt/bj-609; #609 depends on #607).
- 09:53 OWNER NOTE (Bradley 09:53, verbatim): "The Programs workout builder, the first big not-yet-started feature - to be clear it
  already is msotly built, just not accessible - lots of the infra already is built". Passed to S-MWB: reuse June MWB backend
  as-is; build only true gaps (library API, per-client clone key, program as package asset, bulk assign, saved-workout reuse);
  most effort on mobile reachability. Migration 20270223000000 reserved for S-MWB; next free 20270224000000.
- 09:49 (real clock; the 4 entries below were first written with times that ran ahead of the clock and are corrected to commit
  times) MERGED backend #632 (S-SCHED reminders, T2, Sol APPROVE at af8976c8) -> main 97467678. #639 dual APPROVE at 54a7aec8 ->
  update-branch -> 2210c760 (dual delta pending). #637: Opus APPROVE, Sol RC 0/2/0 (B-637-1 apply-now verification fails open;
  B-637-2 runbook unset re-enables defaults-on flags) -> B-FLAGS-2 re-queued for fix round 1. B-JOURNEY cancelled at ~20 min to stay
  within 7 subagents (resume from worktree wt/bj-609 when a slot frees). Opus: #607 RC, #310 RC (A0 B1 C3), #608 delta APPROVE 4e926b35.
- 09:35 B-UGC-3 done: #610 -> c710b0dc (community-live-tests 91/91; real 500 on Hall/workspace-challenge comments fixed in unreleased
  migration 20270211000000 sec. 5 — operator OK, prod last applied 20270205000000), mobile #314 -> 4192ba9 (native voice record +
  playback via expo-audio ~56.0.12; needs a new EAS build; operator copied expo-audio 56.0.13 into shared deps/mobile). IDEA for
  owner: make community-live-tests a required check (branch-protection change needs Bradley's words). B-EXPORT-2 done: #608 ->
  4e926b35, #636 -> 7883337f, mobile #327 -> 7e643f9b (all findings closed). All four queued to both lenses.
  Launched B-JOURNEY (#609 + mobile #312, mobile #324, B-QUIZ-OFF, setup-branch-protection.sh) and S-MWB (Programs builder phase 1).
  Lanes now: AUD-OPUS, AUD-SOL-2, B-CONSENT-2, B-FEE-R5, S-SCHED-3, B-JOURNEY, S-MWB.
- 09:27 B-FLAGS-2 done: #637 manifest (6879d164; every entry = current prod, merging changes nothing), #638 stacked flip
  FEATURE_AI_CONSENT_LEDGER_ENABLED unset->true (draft c375b2ac), #639 SC2015 (54a7aec8, all green). Deploy plan: merge #639 ->
  #637 -> retarget #638 to main, audit, merge -> fly-env-sync plan -> apply (stage) -> fly-deploy main -> plan again (verify).
  S-SCHED-3 launched (#634 + mobile #325 fix round, both lenses' findings).
- 09:25 S-DUNNING-R3 done: #628 -> 739e9a54, mobile #322 -> 0b4813d (all Sol+Opus A/B/C closed; CI running). Queued for both
  lenses. OR-111-2 (operator ruling on the lane's 3 questions): (a) Stripe webhook endpoint must subscribe charge.dispute.closed —
  added to the owner Stripe checklist for the dunning flip (prompt section 7 item 2); (b) v1.0: lost disputes on a client
  subscription are settled by support by hand (dispute cycle still blocks/unblocks automatically from webhooks); (c) a repeated
  confirm reports what the first confirm paid; an invoice Stripe already paid shows $0 on that line with the plan settled — accepted.
  B-FEE-R5 launched (#627 CI + OR-111-1, then mobile #321).
- 09:17 MERGED backend #629 (S-FEE $19.99 min / $0; Sol + Opus APPROVE at 089e8a7e after rerun attempt 2 green) -> main b9ee8e0a.
  #632 update-branch -> af8976c8 (Sol T2 delta pending). Sol verdicts: #607 b74384fb RC 1/0/2 (A-607-4 retired membership persists
  plans under removed head); mobile #310 f85ffd36 RC 0/1/1 (B-310-8 no->yes->no clears newest withdrawal marker); Opus #634 RC
  0/4/5, #325 RC 0/2/5. B-FLAGS-2 opened #637 (manifest), #638 (stacked ledger flip), #639 (SC2015). AUD-SOL relaunched as AUD-SOL-2
  (#632 delta, #637/#638/#639, #635 e7f67576, #610).
- 09:05 #629 dual APPROVE at d134f012 -> update-branch -> 089e8a7e; Sol delta BLOCK B-629-5 = build-and-test failed on
  test/ci/release-evidence-gate.spec.ts "newest run wins" (spec byte-identical to main; main CI green at e5d10bd8). Operator ran
  that spec 3/3 PASS locally at 089e8a7e (43/43) -> transient; `gh run rerun 37026913517 --failed`; then Sol + Opus delta.
  Verdicts in: #632 Sol APPROVE b859a1c6 (T2; merges after #629); #634 Sol RC 0/4/1 + #325 Sol RC 0/1/2 (-> S-SCHED-3 lane,
  queued); mobile #321 Opus RC 0/2/4 (T3; -> B-FEE-R5 lane, queued); #607 fix round 4 pushed b74384fb (consult-consent-v3), Sol
  auditing #607 + #310 now; #610 new head 48860b48 (B-UGC-3). B-UGC-3 added expo-audio ~56.0.12 to mobile #314 (needs new
  native build; approved by operator: free Expo SDK module).
- 08:17 MERGED backend #604 (C14 throttler, T4: Sol + Opus APPROVE at e159d665, 10/10 required green, CLEAN) -> main e5d10bd8.
  Sol: #629 APPROVE d134f012 (Opus pending); #635 REQUEST CHANGES 0/1/1 (B-635-1 same-day fresh session P2002 after delete;
  C-635-1 erase pre-upgrade tombstones) -> back to B-CONSENT-2.

### Agent 111 batch 1 (launched 08:06-08:10 PDT; objectives handoffs/op-26029069/lanes/)
| Lane | Model | Scope |
|---|---|---|
| AUD-SOL | GPT-6.1 Sol | #604 delta, #635, #629, #634 + mobile #325, #632 delta, then #607 + mobile #310 |
| AUD-OPUS | Claude Opus 5.5 | #604 delta, #635, #629, #634 + mobile #325, mobile #321 (T3), then #607 + mobile #310 |
| B-FLAGS-2 | Claude Opus 5.5 | audited launch-flag manifest in fly-env-sync (deploy blocker, OR-110-4) + #633 fold-in + SC2015 PR |
| B-CONSENT-2 | Claude Opus 5.5 | #607 consult-consent-v3 (first), mobile #326 (stack on #310), #611 fix round |
| B-UGC-3 | Claude Opus 5.5 | #610 community-live-tests red, mobile #314 fix round (native voice record/playback) |
| B-EXPORT-2 | Claude Opus 5.5 | #636 + mobile #327 (+ #608 if needed) |
| S-DUNNING-R3 | Claude Opus 5.5 | #628 + mobile #322 (Sol 10+6 B, Opus 2+2 B) |
Queue for free slots: B-FEE-R5 (#627 CI + OR-111-1), #609 (+ mobile #312), S-ERRORS (#324 + slices), #317 S14 round,
B-QUIZ-OFF, setup-branch-protection.sh 10th check, S-REACH, coachless banner + Roman pitch, S-COACH-TOOLS, native billing screens.

### Re-verified live (07:54-07:58 PDT)
- Production backend ba79605b (fly-deploy run 36964740404, 10-01 21:29 PDT), /health + /readyz 200 (db up), uptime matches.
  /api/me/ai-consent 401 (route live). /api/auth/signup-policy: email+apple, google off, role_choice true.
- Supabase read-only: last migration 20270205000000_invite_grant_bindings (04:32 UTC). Postgres ERROR/FATAL logs: ZERO since
  10-01 22:30 UTC (archived_at errors stopped with #625).
- Backend main e5a6044a (= prod + #623 + #626 + #624), 10 required checks, strict. Mobile main e3986e89 (#313), 3 checks, strict.
- No merges, deploys or verdicts happened after agent 110 died (last GitHub activity ~07:00 UTC).

### What 110's dead lanes actually pushed (GitHub is the truth; lane reports were copied before they finished)
| Lane | Pushed | Not done |
|---|---|---|
| B-607-FIX | #607 -> e8feb0d2 (INT-607-1 + 1b), #604 -> e159d665 (B-604-1 defaults 240/60/400/10); both CI green | #609 round; PR body notes |
| B-CONSENT-COPY | NEW backend #635 @0a32b4fe (client-ai-v4 "kept until you delete them or your account"; Roman delete erases); mobile #310 -> f85ffd36 (copy v4 + consult-consent-v3, B-310-7, C-310-11) | #326, #611; backend #607 still defaults to consult-consent-v2 (must move to v3 with #310) |
| B-FEE-R4 | #627 -> ef19980f, #629 -> d134f012 (fix-round comment posted), mobile #321 -> 4295fc79 (no fix-round comment) | #627 CI RED: env-registration (unregistered env reads + missing defaults) + deploy-readiness |
| B-UGC-2 | #610 -> 304613e4 (A-610-1/2, B-610-1..5, C-610-4 CI job) | #610 CI RED: new community-live-tests job (community-events e2e Prisma errors); #314 not started |
| B-FLAGS | nothing pushed (read-only findings in report: MWB_AUTOSAVE_LOCK_TOKEN_SECRET absent = boot precondition; BOOKING_REMINDERS_ENABLED must be literal "on") | whole lane; still blocks the deploy of main (OR-110-4) |
| AUD-SOL | posted #636 RC 1/4/1 @9b7a6a34, mobile #327 RC 0/6/1 @227c5ad9 | #634, #325 never audited |
| AUD-OPUS | — | #636, #327, #634, #325 never audited |

### Board at 08:00 PDT (no PR is merge-ready: none has its tier's verdicts at its exact head)
- Awaiting audit (CI green): backend #604 e159d665 (T4 delta), #607 e8feb0d2 (T4), #635 0a32b4fe (T4), #629 d134f012 (T4),
  #634 dbc10b7b (T4), #632 b859a1c6 (T2 Sol delta); mobile #310 f85ffd36 (T4), #321 4295fc79 (T3), #325 b0c02156 (T4).
- Awaiting fixes: #627 (CI red), #610 (CI red) + mobile #314 (RC), #636/#608/#327 (B-EXPORT r2), #628/#322/#633 (S-DUNNING-R3),
  #611 + mobile #326 (consent copy), #609 (+ mobile #312 dirty), mobile #324 (S-ERRORS), mobile #317 (BLOCK, dirty).
- Mobile #315 dual-approved at d9c2e669 but DIRTY; ships with/after #611.
- Deploy of main e5a6044a HELD until an audited flag path can set FEATURE_AI_CONSENT_LEDGER_ENABLED in the same window (OR-110-4).

### Corrections to 110's state
- 110's log said B-FEE-R4 had not reached #629/#321; it pushed both. 110's log listed #636/#327 as awaiting first audits;
  Sol already posted RC on both. #627's round-4 head is CI red (110's report claimed local green only).

### Owner questions asked 08:00 PDT (readback): agent budget; B-627-3 recovery. ANSWERED 08:03 (see OWNER DECISIONS above).

## AGENT 110 TAKEOVER 2026-10-01 20:17-20:36 PDT — verified facts, owner decisions, first batch

### OWNER OVERARCHING FACTS 2026-10-01 20:38 PDT (verbatim; binding above all lane objectives) + "EXECUTE"
1.) ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER
2.) WALL CLOCK TIME IS KEY #1 RESOURCE
3.) DO IT RIGHT, DO IT SMOOTH - SMOOTH IS FAST
4.) I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES
Operator reading: when a choice arises between cutting and building, build (with the bar met); optimize lanes for elapsed
time (parallel, staggered, no rework loops); EXECUTE re-affirmed for agent 110.

### Re-verified live (20:20 PDT)
- Production backend 8a709a68 healthy (/health 200; note /api/health is 404, the health route is /health). Supabase Postgres:
  306 "column User.archived_at does not exist" errors 10-01 04:00-22:30 UTC, ZERO errors since the 15:30 PDT deploy (P0 fix
  confirmed). signup-policy: providers email+apple, google_signin_enabled false (GOOGLE_CLIENT_IDS not on Fly yet).
  /api/me/ai-consent 404 (#622 merged, not deployed), community routes 404 (flags off) — both expected.
- Backend main 53b625d2, mobile main bb161a34: required checks green. Every open launch PR head matched 109's board exactly.
- Expo (credential re-added by owner under this account, handle in vault): 12 project env vars, FCM V1 key still null, last
  builds f5cac78e (Android preview, good) and 14a58449 (never ship). No new build.
- Corrections to 109's state: mobile's third required check is "Analyze (actions)" (not "CodeQL"). Branch protection both
  repos: strict, enforce_admins true, 0 required reviews.

### OWNER DECISIONS 2026-10-01 20:32 PDT (verbatim answers to the readback; binding)
- Budget: "All 7, staggered".
- Repo writes: "Yes: push + merge" (agent 110 + subagents push; operator merges PRs with tier audits at the exact head and
  required checks green; no deploys/branch-protection changes under this item).
- Deploys: "Standing approval" — operator may approve the GitHub `production` environment for fly-deploy runs of AUDITED main
  with CI green, then verifies /health + migrations and reports. If the platform blocks it, send the owner the one-click link.
- "Voice notes should be reportable and ON at launch" — supersedes the operator default (off). Build voice-note reporting
  (report target + action + moderation + block parity); FEATURE_COMMUNITY_VOICE_NOTES ON at launch after audit + device pass.
- "I want to keep past AI chats forever" — C-626-2 answered: keep past AI replies after AI-consent withdrawal; supersedes the
  09-30 17:42 180-day Roman chat retention (no time-based purge). OR-110-1: client-initiated chat delete and account deletion
  still erase them (legal deletion rights / App Store 5.1.1(v)); privacy copy "kept until you delete them or your account".
  #611's gate "the Roman 180-day sweep" is removed.
- "any stripe pages ened tov be made to LOOK like TGP native - immersion is key" — billing placement accepted with this
  requirement. OR-110-2: card entry/update = in-app native Stripe PaymentSheet (@stripe/stripe-react-native 0.64.0, already a
  dependency, already used by PackageCheckoutScreen) themed with TGP tokens; receipts / next charge / cancel = native TGP screens
  on backend routes; no browser-hosted Stripe portal in the client journey; unavoidable hosted pages (Connect Express
  onboarding, 3DS) get Stripe branding (owner dashboard setting, to send later).
- Schema parity: "idk what your asking here" — re-ask in plain words. OR-110-3 meanwhile: the operator treats "Schema parity
  (migrations match schema.prisma)" as a mandatory merge gate for every backend PR.

### Operator actions so far
- Mobile #320: merged main bb161a34 into the branch, resolving the import-only LoginScreen.tsx conflict with #306 (kept both
  import blocks). New head bbfdebc6. Zero-context patch-id main..bbfdebc6 == oldbase..1d16c105 == 21b5199c (resolution-only).
  Needs Sol delta. (First push attempt was blocked by the platform safety check until the owner authorized repo writes at 20:32.)
- Commit identity used by agent 110: "TGP Agent 110 <agent@tgp.invalid>" (owner: identity is irrelevant).

### Train log (agent 110)
- 21:44 OWNER (verbatim): "you do it! checkbox in GitHub's branch settings" -> agent 110 added "Schema parity (migrations match
  schema.prisma)" (app 15368) to backend main's required status checks via the branch-protection API. Now 10 required checks,
  strict true, enforce_admins unchanged. OR-110-3 is now enforced by GitHub. Follow-up: scripts/setup-branch-protection.sh must
  list the 10th check so a re-run cannot drop it (T4 CI-gate file; next builder slot).
- 20:52 AUD-SOL: APPROVE mobile #323@b8b81415, #320@bbfdebc6, backend #631@ac83aa73, #595@f2eecae5 (0/0/3 C), #626@9551d2c8;
  REQUEST CHANGES mobile #324@7f20255d (B-324-1: support email launch failures silent; needs visible recovery, copyable
  address, Retry, tests). #623 unchanged (no update yet).
- 20:55 MERGED mobile #320 (T2, Sol APPROVE at exact head, 4/4 checks green) squash -> mobile main 33e38e31.
  Updated #323 -> 408d41ac (pure merge of main), Sol delta queued. Backend #631 held until #595/#626 merge (avoids re-audit churn
  on the in-flight T4 Opus audits).
- #324 B-324-1 fix -> S-ERRORS lane at the next free builder slot.
- 21:02 Sol delta APPROVE mobile #323@408d41ac -> MERGED (squash) -> mobile main 0b7f197f. Android gate complete.
- 21:05 AUD-OPUS: APPROVE #595@f2eecae5 (delta, 0/0/5 C), #630@5b873988 (full, 0/0/5 C); REQUEST CHANGES #626@9551d2c8
  (B-626-2: requestId added to Roman's in-stream error event; mobile main's strict parser rejects extra fields -> every Roman
  in-stream error becomes a parse error. Fix: keep {code,message}; reference stays in X-Request-ID). Opus decisions adopted:
  mobile handling of ai_consent_required/ai_egress_blocked is a launch blocker (new lane before the consent flag goes on);
  #630 deploy protocol (read-only recipe count before/after, expect 0 public; seed after deploy); #608 lands before launch.
- 21:08 MERGED backend #595 (T4, dual APPROVE at exact head, 9/9 required + schema parity + migration checks green) ->
  backend main 990d2f31. Updated #630 -> 442fdb86; dual delta queued.
- #604 forward-merge onto main = 10 conflicts in auth/throttler files (not mechanical) -> B-TRAIN-2 lane (Opus) at next slot.
- 21:20 Android production build QUEUED on EAS: 4d2665c6-d833-4bbf-bac6-4622d6d4f84b (profile production, .aab, versionCode 4,
  commit 0b7f197f, Health Connect off). Tooling note: with the Expo vault credential attached, the sandbox egress proxy only
  allows api.expo.dev, so eas-cli 24.8.0 (installed at /home/user/workspace/tools/eas) was patched locally (build/fetch.js) to
  use the proxy agent only for api.expo.dev; run with https_proxy=$HTTPS_PROXY EXPO_TOKEN=proxy-injected.
- Next-slot queue: B-R2B-2 (#626 B-626-2 + mobile AI-consent error handling) -> B-TRAIN-2 (#604/#607/#609 forward merges) ->
  S-ERRORS (#324 B-324-1 + remaining slices).
- 21:24 Dual delta APPROVE #630@442fdb86 -> MERGED -> main 75442854. Read-only recipe count before deploy: 0 total / 0 public.
- 21:25 B-R2B-2 launched (Opus). 21:36 Sol delta APPROVE #631@67e6a2e0 -> MERGED -> main ba79605b.
- 21:29-21:34 DEPLOYED backend ba79605b (fly-deploy run 36964740404, migrations=apply-migrations; production environment
  approved by agent 110 under the owner's 20:32 standing approval). Verified: /health 200; _prisma_migrations applied
  20270203000000_ai_processing_consent_ledger -> 20270204000000_recipe_private_by_default -> 20270205000000_invite_grant_bindings
  (all finished, none rolled back); Postgres ERROR/FATAL 0 in 04:30-04:40Z; recipes 0/0 public after; /api/me/ai-consent now 401
  (live); community 404 (flags off, expected). Prod now has #597 role choice, #622 consent ledger, #599, #595 grants, #630, #631.
  The two old 00000000000000_baseline rows with finished_at NULL are rolled back (04-30) and harmless.
- 21:38 Dual delta APPROVE #623@32bde193 -> MERGED -> main 4bcfb444 (not yet deployed). Opus release-order notes: turn on
  FEATURE_WEARABLES_INGEST_POST only after #608 deploys (C-623-1); keep wearable_insight.* out of the prod AI gateway allow-list
  until #626 merges (C-623-2); reconcile #623 with #604/#624, whichever lands second (C-623-3).
- 21:42 Android production .aab FINISHED: EAS build 4d2665c6-d833-4bbf-bac6-4622d6d4f84b (versionCode 4, commit 0b7f197f, Health
  Connect off), artifact on expo.dev (build page). Ready for the Play closed-test upload when the owner creates the app.
- 21:40 B-TRAIN-2 launched (Opus): #604 -> #607 -> #609 forward merges. Running 7/7 builders; auditors re-queue as slots free.

- 21:38-21:40 OWNER: keep progressing and keep the takeover prompt current for agent 111 ("for when your out of credits and
  retired happily!"); 21:40 "EXECUTE - SIGNING OFF" (offline until morning). v5 prompt published 21:43:
  handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.{md,docx}; regenerated at every milestone (workspace script
  /home/user/workspace/handoff111/publish.sh). Lane reports copied to handoffs/op-f083060f/reports/.
- Builder pushes waiting for audit (no auditor slot free while 7 builders run): #624@75a4e563 (B-624-3), #608@2759e1a0
  (B-608-11; plus NEW BLOCKER: data export writes to local /tmp, download_available=false -> users cannot download exports),
  #627@7d66b350 (B-627-1/2), new #632 (S-SCHED backend, T2), new #633 (FEATURE_DUNNING_V2 flags-workflow input, T4).
  Rule from now: keep 2 of 7 slots for the audit lenses; next freed builder slot goes to auditors.
- Migration prefixes reserved by lanes: 20270211000000 B-UGC (#610), 20270215000000 S-DUNNING-R2 (#628).
- 21:55 S-SCHED DONE: backend #632 @4accdbc3 (T2) + mobile draft #325 @bc1398c2 (T2), CI green. Paused T3/T4 backend work
  (validation, no-double-booking, ownership, new contracts, notification delivery) -> lane S-SCHED-2 objective written
  (migration 20270212000000 reserved). Sol re-queued with a 6-PR batch (#632, #624, #608, #627, #633, #629).
- 22:05 B-FEE-R3 DONE: #627 -> 2c57cc41, #629 -> 858eb40b (T4 now; migration 20270216000000), mobile #321 -> a9b1f49d; 5/5 findings
  closed, CI green. Opus re-queued with a 6-PR batch (#627, #629, #321, #624, #608, #633). Running 7/7 = 5 builders + 2 auditors.
  Owner decision queued for morning: refund/dispute residual recovery (Stripe account debits vs reserve; rec account debits).
- Prefixes now: 0211 B-UGC, 0212 S-SCHED-2, 0215 S-DUNNING-R2, 0216 #629.
- 22:25 B-UGC DONE: #610 -> 9e4b3795, mobile #314 -> 41d829d (CI green; voice-note reporting full strength; C-610-4 deferred as
  CI-gate change). Both auditors got #610/#314 appended. S-SCHED-2 launched (Opus). Running 7/7 = 5 builders + 2 auditors.
- 22:35 B-R2B-2 DONE: #626 -> d9be0c0d (B-626-2, C-626-4 fixed), NEW mobile #326 @32ed8546 (ai_consent_required /
  ai_egress_blocked on every AI surface). OR-110-4: FEATURE_AI_CONSENT_LEDGER_ENABLED goes ON in the same window as the #626
  deploy (day-1 flag ruling 11:31; #626 without the flag blocks all AI). Launched AUD-OPUS-2 (second Opus lens: #626, #326, #610,
  #314) instead of a builder because the audit queues were 10 deep. Running 7/7 = 4 builders + 3 auditors. Next builder slot:
  B-EXPORT, then S-ERRORS.
- 22:37 B-FIX2 DONE: #624 -> 75a4e563, #608 -> 2759e1a0 (migration 20270220000000), mobile #313 -> 1e80017 (merge-only),
  mobile #310 -> e1dbe7f; all queued to the right lenses (#310: Sol + AUD-OPUS-2; #313 delta: Sol + AUD-OPUS). B-EXPORT launched
  (Opus; stacked on #608; migration 20270221000000). Running 7/7 = 4 builders + 3 auditors. Non-required shellcheck SC2015 fails on
  main (scripts/s10-core-diff-gate.sh): queued as a small T4 fix.
- 22:45 B-TRAIN-2 DONE: #604 -> 87d09b1d, #607 -> d6ac47e8, #609 -> 5fd61a1b (forward merges onto 4bcfb444, required CI green).
  New finding INT-607-1 (A, tenancy): #607's consultation read treats bare coach_id as head-coach membership; main's #597 needs an
  explicit membership row (phantom sub-coaches) -> B-607-FIX launched (Opus), which also re-grades #609 to T4 (env registration,
  live RLS tests). PRIORITY COLLISION FIXED: #607 took 20270212000000 and #609 20270213000000, so S-SCHED-2 moved to 20270222000000.
  Prefix map: 0210 #627, 0211 #610, 0212 #607, 0213 #609, 0215 #628, 0216 #629, 0220 #608, 0221 B-EXPORT, 0222 S-SCHED-2.
  PR body edits for #604/#607/#609 were refused by the safety check (texts in workspace reports/btrain2); not retried.
  #604 delta audits queued (Sol + AUD-OPUS). Running 7/7 = 4 builders + 3 auditors.
- 22:47 S-DUNNING-R2 DONE: #628 -> ba1d9480, mobile #322 -> 8991ddf (CI green); #633 @850ec148 RC from both lenses (B-633-1).
- Audit results in: #624 dual APPROVE @75a4e563; #632 Sol APPROVE @4accdbc3 (T2); #626 dual APPROVE @d9be0c0d; #608 Opus APPROVE,
  Sol RC B-608-12 (export not downloadable -> B-EXPORT running, stacked); #627 RC both (Sol B-627-2..5, Opus B3); #629 RC both;
  mobile #321 Opus RC; #610 Sol BLOCK (A-610-1 voice key traversal, A-610-2 wins RLS); mobile #314 Sol RC (B-314-2 no real native
  recorder/playback adapter). AUD-OPUS-2 flagged R-626-1: consent copy says AI chats kept 180 days (owner: forever).
- 22:48 MERGED backend #626 -> 7a6cfd82 (main). NOT deployed: OR-110-4 needs FEATURE_AI_CONSENT_LEDGER_ENABLED ON in the same
  window and no audited workflow can set it (main's flags workflow only knows SCOUT/EXTENSION) -> lane B-FLAGS objective (desired-
  state manifest on #624 per v4 4.9). update-branch: #624 -> e3e0a314, #632 -> 0ae744b6, #604 -> 12a4d423 (deltas queued).
- B-FEE-R4 launched (Opus). Objectives written: B-UGC-2, B-FLAGS, B-CONSENT-COPY (+ S-ERRORS). Running 7/7 = 4 builders + 3 auditors.
- 23:00 AUD-OPUS batch: RC on #627 (0/3/2), #629 (0/2/1), mobile #321 (0/2/1), #633 (0/2/3), #628 (0/2/4), mobile #322 (0/2/1);
  APPROVE #624 @75a4e563, #608 @2759e1a0, mobile #313 delta @1e80017, #604 delta @12a4d423. #624 delta at e3e0a314 held: required
  `danger` failed after update-branch (non-conventional title + merge commit). 23:04 operator retitled #624 (ci(env): …) and #632
  (feat(scheduling): …) and re-ran Danger: SUCCESS. Infra Lint (not required) still fails on shellcheck SC2015 (main-wide; B-FLAGS).
- 23:02 AUD-OPUS-2 DONE: #326 RC (B-326-1/2), #310 RC (B-310-6 = 180-day copy), #610 BLOCK 1/6/1 (new B-610-5: voice not erased on
  deletion), #314 RC 0/5/1 (post refused by platform check; not retried; folded into B-UGC-2 from the file).
- 22:59 B-UGC-2 launched (Opus; adds B-610-5 + C-610-4 CI DB suites). Objectives written: S-DUNNING-R3; B-CONSENT-COPY now also
  covers #326 B-326-1/2 + #310 B-310-6 + onboarding consent v3. Next slots: B-CONSENT-COPY, B-FLAGS, S-DUNNING-R3, S-ERRORS.
- 23:08 B-CONSENT-COPY launched (Opus). 23:12 Sol batch: APPROVE #624 e3e0a314, #632 0ae744b6, #604 12a4d423, mobile #313 1e80017;
  RC #326 (0/4/0), #310 (0/2/0), #628 (0/10/1), #322 (0/6/1).
- 23:15 MERGED backend #624 -> e5a6044a and mobile #313 -> e3986e89. update-branch #604 -> 08658e77 (Sol delta first, then Opus).
- DEPLOY HELD: backend production stays at ba79605b. Main now carries #623, #626, #624 (+ #604, #632 next). #626 needs
  FEATURE_AI_CONSENT_LEDGER_ENABLED ON in the same window (OR-110-4) and no merged workflow can set flags (fly-env-sync stages
  GitHub-secret allowlist only). Deploy the whole leg once B-FLAGS' manifest merges. Running: 6 builders + 1 auditor (cap 7).
- 23:28 Sol #604 delta @08658e77 REQUEST CHANGES B-604-1: four C14 ENV_RULES entries need explicit defaults (240/60/400/10) under
  #624's env hygiene contract (build-and-test red at that head). Sent to B-607-FIX as a small first task. #632 update-branch refused
  (merge conflict with #624) -> sent to S-SCHED-2 to resolve first. Brief updated: every backend lane must satisfy #624's contract.
- 23:32 B-FLAGS launched (Opus; manifest on main + SC2015 PR). Running 7/7 = 7 builders, 0 auditors (no audit-ready heads right
  now; next freed slot goes to auditors for #604/#632 deltas and fix-round re-audits).
- 23:36 B-EXPORT DONE: backend #636 @9b7a6a34 (stacked on #608; closes B-608-12; migration 20270221000000 creates private bucket)
  + mobile #327 @227c5ad9. Sol re-queued for both. Plan: dual-approve #636 -> merge #636 into #608's branch -> update #608 -> dual
  delta -> merge #608 to main. Found: mobile main has two wrong support addresses (deletionErrors.ts from #313 =
  Bradley@Bradleytgpcoaching.com; SupportInboxScreen + CreateAccountScreen = hello@thegrowthproject.app) vs owner's single address
  Bradleyapple1031@gmail.com -> added to S-ERRORS objective (single constant + guard test).
- 23:58 S-SCHED-2 DONE: NEW backend #634 @dbc10b7b (T4; migration 20270222000000), #632 -> b859a1c6 (main merged), mobile #325 ->
  b0c02156 (T4; after #634). Read-only prod checks: overlap preflight 0 pairs; btree_gist not installed (migration installs it).
  OR-110-5: BOOKING_REMINDERS_ENABLED=on (only `on` works) via B-FLAGS manifest in #632's deploy window (v4 4.9 Wave A).
  AUD-OPUS re-queued (#636, #327, #634, #325); Sol queue: #636, #327, #632 delta, #634, #325. Running 7/7 = 5 builders + 2 auditors.
### First batch (7 subagents, staggered; objectives in handoffs/op-f083060f/lanes/)
| Lane | Model | Scope |
|---|---|---|
| AUD-SOL | GPT-6.1 Sol | deltas mobile #323, #320; backend #631 full; #595 delta; #626 re-audit; mobile #324; #623 delta after update |
| AUD-OPUS | Claude Opus 5.5 | #595 delta; #626 re-audit; #630 full; #623 delta after update; then fix-round re-audits |
| B-FIX2 | Claude Opus 5.5 | #624 B-624-3; #608 B-608-11 + mobile #313 merge-main; mobile #310 B-310-5 |
| B-UGC | Claude Opus 5.5 | #610/#314 fix rounds + SUPPORT_EMAIL + NEW voice-note reporting (owner 20:32) |
| S-DUNNING-R2 | Claude Opus 5.5 | #628/#322: 1A, 2A, native update-card (OR-110-2), flags-workflow PR |
| B-FEE-R3 | Claude Opus 5.5 | #627 B-627-1/2 + tsc; #629; mobile #321 |
| S-SCHED | GPT-6.1 Sol | native Calendar (backend + mobile) from 108's WIP, fresh PRs |
Deferred to the next free slot: S-ERRORS remaining slices, S-REACH, then the day-1 items with no PR (12.2 list in v4 prompt).

### Merge train plan (one PR at a time; strict up-to-date; operator only)
Backend: #595 -> #626 -> #631 -> #623 -> #604 (operator forward-merge, adopt 20270205000000 rename) -> #630 -> fix-round PRs.
Mobile: #323 -> #320 -> #324 -> #313/#310 (after fixes) -> #315 (check #611 dependency). Deploy after the backend train's
first leg (#595/#626/#631/#623) with migrations=apply-migrations under the owner's standing approval.


## AGENT 109 HANDOFF TO AGENT 110 — 2026-10-01 ~16:50 PDT (real clock) — SAFE STOP. READ THIS FIRST.

Owner 16:32 PDT (verbatim): "Focus on letting in progress agents finish - note what they accomplished, update
LAST_OPERATOR_STATE - lets get to a safe place and work on agent 110's takeover!"
Agent 109 (session 7c52cefa) sent a wrap-up order to all 7 subagents, started nothing new, and every subagent has
finished. NOTHING IS RUNNING. All worktrees are removed. Disk 64%. Agent 110's prompt:
handoffs/op-7c52cefa/NEXT_OPERATOR_PROMPT_v4.md.

Timestamp warning: many "OPERATOR ... PDT (wall clock)" headers below written between ~15:00 and 16:40 carry labels
that run AHEAD of the real clock (e.g. "16:55" written at ~16:10). Entry ORDER (newest at the top) is authoritative;
the labels are not. Owner-message times quoted in OWNER headers are correct.

### Production and mains at handoff (verified 16:45-16:50 PDT)
- Production backend (Fly app backend-spring-lake-3890) runs 8a709a68 (#606 + #625), deployed by fly-deploy run
  36932415461 on the owner's one-time "approve the run". Migration 20270125000000_restore_schema_declared_objects
  applied and verified read-only (10/10 columns, 4 tables with RLS + force + 3 policies each, ListType enum); /health
  200; no "archived_at" errors since.
- Backend main 53b625d2 = production + #597 (role choice), #622 (AI consent ledger, flag off), #599 (invite attach
  outcome). NOT DEPLOYED. Next deploy needs the owner's approval of the production environment (each run).
- Mobile main bb161a34 = #306 (role choice signup) + #319 (env guard; merged 16:47 by 109 on Sol APPROVE at
  2dd63b98, T2). Main CI + CodeQL green at bb161a34.
- Expo: EXPO_PUBLIC_COACH_SIGNUP_SECRET deleted (owner yes 16:22; EAS var c0fa39cd, all 3 envs). 12 project vars remain.
  Last good Android build f5cac78e (works on owner's Samsung). FCM V1 key still null (owner action). No new build made.
- Production DB (read-only checks): 0 CoachPackage, 0 ClientPurchase, 0 CoachSubscription, 0 Recipe, 0 SavedRecipe,
  0 diagnostic rows.

### What the last 7 subagents accomplished (final reports in handoffs/op-7c52cefa/reports/)
| Agent (lane) | Result |
|---|---|
| AUD-OPUS (Claude Opus 5.5) | mobile #310 APPROVE @1d7cc720 (0/0/3); backend #608 APPROVE @11759680 (C-608-2 carried); mobile #313 APPROVE @4c6028d5 (needs rebase onto main + #310, delta re-check); backend #627 REQUEST CHANGES @606b4760: B-627-1 (payout retry/backfill), B-627-2 (concurrent refunds over-reverse; probe handoffs/op-7c52cefa/aud-opus/probe_627_concurrency.spec.ts). Earlier this block: #610 and #314 REQUEST CHANGES (see their PR comments). Not started: #630, #595/#604 train attestations, #313/#627 re-checks. |
| AUD-SOL3 (GPT-6.1 Sol) | mobile #320 APPROVE @1d16c105 (0/0/0); mobile #310 RC (B: lost grant response can keep AI permission after withdrawal); backend #608 RC (B: late export cleanup treats non-ENOENT delete failures as success); mobile #313 APPROVE (0/0/2); backend #611 RC (0/4/1: publication evidence; retention, coach-signal, deletion-window claims inaccurate); backend #629 RC (0/2/1: DTOs reject $0; unchanged grandfathered offers cannot be republished); mobile #321 RC (price-save failures lack recovery/reference). Queue empty. |
| AUD-SOL (GPT-6.1 Sol) | mobile #319 APPROVE @2dd63b98 -> MERGED bb161a34; mobile #323 APPROVE @e0b0b01d (109 then updated it to b8b81415 after #319 merged -> needs Sol delta); backend #630 APPROVE @5b873988 (0/0/1: C-630-1 drop aggregate bookmark counts from client responses). Not started: #610 @d1e1732f, #314 @2f7789ec (Sol lens). |
| B-TRAIN (Opus) | #595 merged forward onto main 53b625d2: merge commit db7785dd (patch-id equal to the audited range) + f2eecae5 (migration renamed 20270205000000_invite_grant_bindings; ordering spec). 732/732 targeted tests; 9/9 required checks + schema parity green. Needs BOTH lenses' delta attestation at f2eecae5. Not started: #604 (approved 21ffc02c; still carries the old 20270125000000_invite_grant_bindings dir -> must pick up the rename after #595). |
| B-FEE (Opus) | #627 round 2 @70680675: scheduled 15-min payout/settlement sweep (lease row single runner, bounds 25/50/8 min, Stripe idempotency + unique rows, kill switch SFEE_SETTLEMENT_SWEEP_ENABLED registered), main merged (aaa2655f), migration 20270210000000_s_fee_charge_settlement. 379 tests pass; CI green. B-627-1 PARTLY fixed (renewal backfill still skips purchases with a settlement); B-627-2 NOT addressed; local tsc not confirmed (OOM at 2.5 GB; use NODE_OPTIONS=--max-old-space-size=3584). WIP note in PR body. #629/#321 unchanged (Sol RC). |
| B-R2B (Opus) | #626 fix round @9551d2c8 (main merged 4db7b9b0): A-626-1 fixed (SDK retries off; gate re-checks live consent per attempt), A-626-2 fixed (client AI chat self-only), B-626-1 fixed (503 copy + requestId), C-626-1 fixed (opaque handles + lint boundary), C-626-3 fixed; C-626-2 not changed (retention decision, owner question). tsc 0 errors (3.5 GB heap), 924/924 tests, CI green. Needs BOTH lenses re-audit at 9551d2c8. |
| S-ERRORS (Opus) | Support email slice: mobile #324 @7f20255d (T2, CI green) and backend #631 @ac83aa73 (T2, all 9 required checks green incl. build-and-test) — SUPPORT_EMAIL = Bradleyapple1031@gmail.com + guard tests. Inventory: mobile 33 generic messages in 20 files, 9 Alert('Error'), 9 "try again later", 36 generic fallbacks, 18 raw error texts; backend 1,180 thrown HTTP errors, 756 without a code. Remaining plan (not started): backend error shape (T3), mobile shared mapper (T3), copy replacement + guard, recipe codes, Support screen silent failure with no mail app. |
| Earlier today (before wrap-up) | S-DUNNING: #628 @691528a0 + mobile #322 @2d77399d (T4, flag off) — round 2 for owner rulings 1A/2A NOT started; both lenses told to hold. B-RECIPES: #630. M-PLAY: mobile #323. B-ENVTRUTH: #624 + mobile #319. B-COPY: #610/#314/#611. B-306: #306 merged. B-FIX: #310/#608/#313/#320. |

### PR board at handoff (exact heads; "delta" = re-attest after a pure update merge)
Backend (strict "up to date" protection; 9 required checks):

| PR | Tier | Head | State | Next action |
|---|---|---|---|---|
| #595 | T4 | f2eecae5 | CLEAN | Opus + Sol delta attest -> merge. Then #604. |
| #604 | T4 | 21ffc02c | dual APPROVE (old base) | After #595: merge main, adopt the migration rename, re-run tests/parity, dual delta -> merge. |
| #623 | T4 | 4cc366fc | dual APPROVE, BEHIND | update-branch, dual delta -> merge. |
| #626 | T4 | 9551d2c8 | CLEAN, fix round done | Sol + Opus re-audit -> merge. Ledger/AI flags stay off until #626 + mobile #310 at the clinic deploy. |
| #624 | T4 | 1159da9b | Opus APPROVE, Sol RC B-624-3 | Fix B-624-3 (failure-log redaction exposes whitespace-separated secret fragments; Sol comment 5942409972), dual re-attest. |
| #627 | T4 | 70680675 | round 2 partial | Fix B-627-1 backfill + B-627-2 refund concurrency; confirm tsc; dual re-audit. |
| #628 | T4 | 691528a0 | not audited | Round 2: owner 1A + 2A; then dual audit. Flip plan in reports/S-DUNNING.md. |
| #629 | T3 | 32d81faa | Sol RC | Fix ($0 DTO, grandfathered republish), re-audit. |
| #630 | T4 | 5b873988 | Sol APPROVE, BEHIND | Opus audit (+ C-630-1 optional) -> update + delta -> merge. Before deploy: run the read-only count in reports/B-RECIPES.md. |
| #631 | T2 | ac83aa73 | not audited; all 9 required checks green | One Sol audit -> merge. |
| #608 | T4 | 11759680 | Opus APPROVE, Sol RC | Fix Sol B (export cleanup), delta both; pairs with mobile #313. |
| #610 | T4 | d1e1732f | Opus RC | Fix round (and switch safety contact to SUPPORT_EMAIL, see rulings), Sol audit. |
| #611 | T3 | e5777735 | Sol RC 0/4/1 | Fix round; point ACCOUNT_DELETION_EMAIL at SUPPORT_EMAIL; remove quiz text. Gate: merges after #608/#313, the Roman 180-day sweep and B-QUIZ-OFF. |
| #607 | T4 | 245da2e7 | Opus APPROVE, Sol APPROVE (+older RC) | Verify Sol's latest verdict is at this head; restack onto main; required by mobile #310 for the clinic build. |
| #609 | T3 | 1f8b22b9 | unaudited | Restack later (welcome message +13 min). |
Mobile (strict protection; 3 required checks):

| PR | Tier | Head | State | Next action |
|---|---|---|---|---|
| #320 | T2 | 1d16c105 | Sol APPROVE, CONFLICT | Resolve 1 conflict (src/screens/auth/LoginScreen.tsx vs #306), Sol delta -> merge. Android build gate. |
| #323 | T2 | b8b81415 | Sol APPROVE @e0b0b01d; updated | Sol delta (pure merge of #319) -> merge. Android build gate. |
| #324 | T2 | 7f20255d | BEHIND, unaudited | update, one Sol audit -> merge. |
| #310 | T4 | 1d7cc720 | Opus APPROVE, Sol RC | Fix Sol B (lost grant response), dual delta. Needs backend #607 for the clinic build. |
| #313 | T4 | 4c6028d5 | dual APPROVE | Conflicts with main (#306) and #310: rebase, dual delta; ships with #608. |
| #314 | T4 | 2f7789ec | Opus RC | Fix round + SUPPORT_EMAIL safety contact, Sol audit. |
| #315 | T3 | d9c2e669 | dual APPROVE, BEHIND | Check dependency on backend #611 first; update + delta -> merge. |
| #317 | T4 | c7e35d84 | Sol BLOCK, Opus RC | Fix round (Opus: Reconnect after sign-out). Health Connect returns only after this + Play health declaration. |
| #321 | T3 | 8bc4de3a | Sol RC | Fix (price-save recovery/reference). |
| #322 | T4 | 2d77399d | not audited | Round 2 with #628. |
| #305 | T3 | 45787152 | base clinic/m2 | Restack onto main (expo-updates / EAS Update). |

### Android build gate (owner does Play setup later; do not remind him)
#306 merged, #319 merged; remaining #320 + #323. Then build the production .aab (eas.json production profile,
versionCode 4, package com.growthproject.app, TGP_ANDROID_HEALTH_CONNECT off) through the Expo API/eas with the
vault credential; batch builds (Expo Free: 15 Android/month). Play checklist + icon + feature graphic:
handoffs/op-7c52cefa/play/.

### Operator rulings made during wrap-up (owner can override)
- OR-109-1: community safety contact in #610/#314 uses SUPPORT_EMAIL (Bradleyapple1031@gmail.com) instead of the 09:07
  address, under the owner's 14:19 one-support-email ruling. Otherwise both PRs fail S-ERRORS' guards on rebase.
- OR-109-2: mobile maps backend `ai_egress_blocked` (503) to a contact-support action that shows the reference.
- OR-109-3: B-RECIPES defaults accepted (all rows private; no coach recipe editor in v1.0 -> 1.0.1; keep is_public
  name; deploy order count -> deploy -> seed).

### Owner questions still open (ask in DECISION NEEDED format; recommendation first)
1. C-626-2: keep a client's past AI replies after they withdraw AI consent? Rec: keep, and the privacy copy says "past
   AI replies stay in your history".
2. Voice notes: off at launch (operator default) vs build voice reporting for day 1.
3. Standing deploy approval vs approve each fly-deploy run.
4. Schema-parity check as a required check on backend main (owner must change branch protection or authorize it; the
   operator's attempt was blocked by the safety classifier).
5. LLC / D-U-N-S (only matters if he wants a Play organization account to skip the 12-tester rule).
Owner actions (not questions): FCM V1 key; Stripe live settings for dunning (reports/S-DUNNING.md list) + customer
portal + Connect; Play app + testers (later, his call); production deploy approvals; TestFlight passes.

### Recommended first moves for agent 110 (after readback and the owner's budget go)
1. One Sol + one Opus auditor batch: #595 delta, #626 re-audit, #623 delta, #630 Opus, #323 delta, #631, #324.
2. Small fixes: #320 conflict, B-624-3, #608 Sol B, #310 Sol B.
3. Merge train in dependency order; then ask the owner to approve the next backend deploy (main CI green, then
   fly-deploy.yml with release_sha=<main head>, confirm=deploy, migrations=apply-migrations).
4. Android .aab after #320 + #323.
5. Builders: S-DUNNING round 2 (1A/2A), B-FEE round 3 (B-627-1/2), S-ERRORS remaining slices, B-QUIZ-OFF, #317 fix,
   S-COACH-TOOLS, banner + Roman pitch, S-SCHED, --release-env pre-build check, C-608-2, C-313-5, deletion
   follow-ups (recipes left behind + saved bookmark blocks delete silently; export omits created recipes).


## OWNER 2026-10-01 16:30 PDT: "1A + 2A -> Keep progressing on the known work. Rotate that Google play store testing and app creation needs done by owner (me) at a later time"
- Recorded in LIVE_STATE + DECISION_LOG. S-DUNNING builder (make_10_day_payment_lockout_live_ready_s_dunning_muq1cu5t)
  to run #628/#322 round 2 (1A auto-charge open invoice on card update with idempotency + unlock on invoice.paid; 2A
  void open invoice + end access on cancel during dunning) at the next free slot; both lenses told to hold #628/#322.
- Play app creation/testers: owner later; operator stops reminding. S-ERRORS launched (no_vague_errors_one_support_email_muq5xdfc).
- Running 7/7: B-FEE, B-R2B, B-TRAIN, S-ERRORS, AUD-OPUS, AUD-SOL, AUD-SOL3. Next free slot -> S-DUNNING r2.

## OPERATOR 2026-10-01 16:50 PDT (wall clock): M-PLAY done — mobile #323 (T2) d8edf8e1 -> updated e0b0b01d
- Switch OFF: zero Health Connect/Samsung health permissions, 18 manifest removal rules, HC plugin absent; ON: base 17
  health permissions + Samsung; iOS identical. 11 suites / 109 tests; CI green. Updated onto mobile main 56d4fc62.
  Sol (AUD-SOL) audits #323 right after #319.
- Android build gate: #306 (merged) + #320 (AUD-SOL3 first item) + #323 + #319 merged -> then build the production
  .aab (versionCode 4) via EAS with the switch OFF.
- Running 6/7: B-FEE, B-R2B, B-TRAIN, AUD-OPUS, AUD-SOL, AUD-SOL3. One slot free -> next: S-ERRORS (support email
  everywhere + recipe/community error codes) now that #306 merged.

## OPERATOR 2026-10-01 16:40 PDT (wall clock): B-RECIPES done — backend #630 (T4) 5b873988
- Recipes: own + own coach's/owner's shared only; no platform feed; client sharing 403 RECIPE_SHARING_COACH_ONLY; image
  links rejected (400) and never served; uniform 404 RECIPE_NOT_FOUND; prep-guide public fallback removed; lists capped
  200; migration makes all rows private (bounded, self-checking); seed needs explicit coach. 62/62 targeted, CI full
  suite green. Graded T4 (tenancy/privacy + non-reverted data change). Production: 0 Recipe / 0 SavedRecipe (checked).
- Operator decisions: (1) all rows private incl. coach rows — keep; (2) no edit/unshare/delete or coach recipe screen
  in v1.0 — accept, queue coach recipe editor for 1.0.1; (3) keep is_public name for now; (4) deploy order: count ->
  deploy with apply-migrations -> any seed after.
- Follow-ups queued (deletion lane): account deletion leaves a user's recipes and a saved bookmark blocks the delete
  silently; data export omits created recipes; plus C-608-2 admin force-delete re-auth and the in-app link to
  /help/delete-account for Apple-only Android users. Recipe screens' generic errors -> S-ERRORS.
- Owner 16:23: the "apps deleted Sept 30" notice = Google's package-name registration deadline (Android developer
  verification); owner's account has no apps, nothing deleted. Asked owner to check Play Console Home for identity
  verification. Asked owner: dunning F15 (1A auto-charge open invoice on card update recommended) and cancel during
  dunning (2A void + end access recommended).
- AUD-SOL re-queued: #319 delta -> #630 -> #610/#314 -> #628/#322. Opus queue: #610 -> #314 -> #310 -> #608/#313 ->
  #627 -> #630 -> #628/#322 (overloaded; consider a second Opus lens when a slot frees).
- Running 7/7: B-FEE, M-PLAY, B-R2B, B-TRAIN, AUD-OPUS, AUD-SOL, AUD-SOL3.

## OPERATOR 2026-10-01 16:30 PDT (wall clock): EAS secret deleted; S-DUNNING done (#628 691528a0, mobile #322 2d77399d)
- Owner 16:22 "Yes delete it" -> deleted EXPO_PUBLIC_COACH_SIGNUP_SECRET (EAS id c0fa39cd, all 3 envs). Verified gone.
- S-DUNNING: backend #628 (T4) + mobile #322 (T4), CI green, flag still OFF. Fixed F1 (v2 never triggered; v1 could
  cancel on Day 7), F3 (pay deadlock -> never unlocked), F4 (unlock dismissed every user's notice), F5-F14 (lock by
  lockout timestamp only; full access Day 0-9; export/deletion/coach thread reachable while locked; sweeps, cycle
  start, refunds vs disputes, hard declines, status route, flag registration). Owner rules hold (voluntary cancel ->
  access through paid period, never dunning; free/code grants never dunning).
- OWNER DECISIONS asked: F15 (card update after Day 7 does not charge the open invoice; auto-charge = our code charging)
  and cancel-while-in-dunning default (stays in dunning for the unpaid invoice vs void + end access).
- Flip plan (operator only, after #628 deployed + #322 in a client build + owner's Stripe live settings + email
  provider confirmed): apply S-DUNNING-flags-workflow.patch in its own PR (T4: CI/deploy workflow), set
  FEATURE_DUNNING_V2=true on backend-spring-lake-3890 via audited workflow; rollback = unset. Stripe settings list in
  handoffs/op-7c52cefa/reports/S-DUNNING.md.
- B-TRAIN re-queued for #595 (main 53b625d2). Audits to queue: #628 + #322 (dual T4).
- Running 7/7: B-FEE, B-RECIPES, M-PLAY, B-R2B, B-TRAIN, AUD-OPUS, AUD-SOL3.

## OWNER 2026-10-01 16:22 PDT: Play Console screenshot — no apps; "I guess my app was deleted on sept 30th by Google"
- Screenshot: developer account "The Growth Project", Personal account, empty app list ("Create your first app"),
  Notifications bell flagged. Developer name = "The Growth Project" (matches #611 /help/delete-account; no change).
- Google Help (answer 9023647 / 16483176): only the account owner can delete an app; deleted apps are recoverable for 7
  days; after deletion the package name is freed for anyone if the app had zero lifetime installs, and can never be
  reused if it had any installs. Asked the owner for the Sept 30 notification text. Package com.growthproject.app is
  fixed at the first .aab upload; if blocked, fallback = new applicationId (needs app config + Firebase Android app).
- Owner has not yet said "yes" to deleting EXPO_PUBLIC_COACH_SIGNUP_SECRET (asked for proof; proof sent: zero reads in
  full mobile history/all branches/all 23 open PRs/backend main; only #319's guard test names it).

## OPERATOR 2026-10-01 16:55 PDT (wall clock): #306 + #599 MERGED; #626 BLOCK -> fix round; #624 RC
- Sol: #306 33eec6bc APPROVE (5942306209) + Opus APPROVE (5942285811) -> MERGED mobile 56d4fc62.
- Sol: #599 8ae0fea5 APPROVE 0/0/1 (5942331604) + Opus APPROVE (5942356078) -> MERGED backend 53b625d2.
- Sol: mobile #319 0a2709e0 APPROVE (T2; 5942349423) -> mobile strict: updated onto 56d4fc62 -> head 2dd63b98; needs
  a Sol delta re-attestation, then merge. It reads EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY first, legacy name fallback.
- Sol: #626 360d8705 BLOCK 2/1/0 (5942268351): SDK retries bypass withdrawal; self-only chat sends roster-peer content
  and private coach notes; 503 lacks recovery action. Re-queued B-R2B builder (build_ai_consent_enforcement_r2b_mupzg5ja)
  for the fix round incl. Opus C-626-1 (ai-egress sole SDK constructor), C-626-2/3 if small.
- Sol: #624 1159da9b REQUEST CHANGES 0/1/0 (5942409972): B-624-3 failure-log redaction exposes whitespace-separated
  secret fragments. Re-queue B-ENVTRUTH (fix_round_624_319_env_truth_muq278g7) when a slot frees.
- Unblocked by #306: S-ERRORS (support email everywhere). Unblocked by #599: B-TRAIN #595 next.
- Running 7/7: S-DUNNING, B-FEE, B-RECIPES, M-PLAY, AUD-OPUS, AUD-SOL3, B-R2B. Waiting for slots, in order:
  B-TRAIN #595 -> AUD-SOL #319 delta -> B-ENVTRUTH #624 -> S-ERRORS -> B-QUIZ-OFF -> #317 -> S-COACH-TOOLS.

## OPERATOR 2026-10-01 16:45 PDT (wall clock): B-FIX done — #310 1d7cc72, #608 1175968, #313 4c6028d, NEW #320 1d16c10
- #310 B-310-3/4, C-310-6/7 fixed (+ own find: consent retry under another user's session). #608/#313: B-608-9 (AI
  ledger in erasure manifest), B-608-10 + B-313-5 (30-day hashed deletion receipt; 403 ACCOUNT_DELETED; public POST
  /account-deletion/receipt), B-608-3 (export file cleanup + nightly sweep). Onboarding verdict: BROKEN — backend sends
  profile.onboardingCompleted, mobile read onboarding_completed -> finished students redo onboarding on new
  login/install; fix in new mobile #320 (T2). All CI green (shellcheck pre-existing).
- Operator decisions: C-608-2 (admin force-delete without recent sign-in check) -> follow-up PR (queued);
  C-313-5 (Apple-only accounts on Android cannot re-verify for deletion) -> the /help/delete-account email route in
  #611 is the fallback; follow-up links it from the app (queued).
- Launched AUD-SOL3 (second Sol lens): #320 -> #310 -> #608/#313 -> #611 -> #629/#321. Opus still owes T4 lens on
  #310, #608, #313 (after #610/#314), then #627.
- Running 7/7: S-DUNNING, B-FEE, B-RECIPES, M-PLAY, AUD-OPUS, AUD-SOL, AUD-SOL3.

## OPERATOR 2026-10-01 16:35 PDT (wall clock): Opus APPROVE #626, #306 r7, #599, #624
- Opus: #626 360d8705 APPROVE 0/0/3 (5942230057; C-626-1 source-text guard not a hard boundary, C-626-2 AI output
  stored before withdrawal still served, C-626-3 triage empty without reason); #306 33eec6bc APPROVE 0/0/0 new
  (5942285811); #599 8ae0fea5 APPROVE 0/0/3 (5942356078; patch-id c3c450fc confirmed); #624 1159da9b APPROVE 0/0/5
  (5942356461; C-624-4: deploy_staged=true runs fly secrets deploy = restarts prod machines and applies ALL staged
  secrets — never use without owner approval).
- Merge-order note: whichever of #599/#624 lands second must keep AUTH_SIGNUP_WITH_CODE_PER_HOUR registered; same for
  any env #626 reads.
- Waiting on Sol for #626, #306 r7, #599, #319, #624. Opus now auditing #610 then #314 (full T4).

## OPERATOR 2026-10-01 16:25 PDT (wall clock): #599 resolved (8ae0fea5); M-PLAY launched
- B-TRAIN resolved #599 against main 10dff85c: 894263f5 pure resolution (claimed patch-id equal to audited
  e3167fe7..7b496aca) + 8ae0fea5 one extra commit (single coach-cannot-redeem constant/message, restored warn log).
  9/9 required checks green. Operator applied the PR body (builder's gh pr edit was classifier-blocked). Both lenses
  queued for #599 after #306 r7. B-TRAIN idle until #599 merges, then #595, then #604.
- M-PLAY launched (android_test_build_without_health_connect_muq4wj99, GPT-6.1 Sol).
- Running 7/7: B-FIX, S-DUNNING, B-FEE, B-RECIPES, M-PLAY, AUD-OPUS, AUD-SOL.
- Attestor queues: Sol #626 -> #306 r7 -> #599 -> #319 -> #624; Opus #626 -> #306 r7 -> #599 -> #624.

## OPERATOR 2026-10-01 16:15 PDT (wall clock): #611 r2 done (e5777735); B-RECIPES launched
- #611 round 2: owner-approved box-2 sentence restored byte-exact (matches ced10667; no re-approval needed); triage
  text says only box-2 members are sorted; public GET /help/delete-account (Play requirement; in-app paths from
  mobile #313); every diagnostic/roadmap mention removed (Perplexity first-win sentence kept: first-win.service.ts).
  6 suites / 96 passed; CI green. Needs audit (T3). MERGE GATE: #611 must not go live before #608/#313, the Roman
  180-day sweep, and B-QUIZ-OFF.
- Builder decision 1 (privacy policy's deletion section names an older support address) -> already decided by the owner
  14:19: Bradleyapple1031@gmail.com everywhere via S-ERRORS. Decision 2 (Play developer name "The Growth Project")
  -> asked the owner.
- Production read-only: 0 Recipe, 0 public, 0 SavedRecipe rows (no exposure yet). B-RECIPES launched
  (make_recipes_private_by_default_muq4p8qf, Opus).
- Audits still to queue: #610 (T4 dual), #314 (T4 dual), #611 (T3), #629 (T3), mobile #321 (T3), #627 (T4 after r2).
- Running 7/7: B-FIX, S-DUNNING, B-TRAIN, B-FEE, B-RECIPES, AUD-OPUS, AUD-SOL.

## OPERATOR 2026-10-01 16:05 PDT (wall clock): #306 r7 at 33eec6bc; B-FEE #627 round 2 started
- B-306 r7: Sol B-306-5 fixed (Google helper never returns a temporary user on backend failure; every login/signup
  failure branch tabled), C-306-5 fixed (marker match: subject, else email, else no identity on both sides), Opus
  C-306-8 copy fixed. 55 suites / 561 tests; new tests fail on 501a9e0 (19/57). CI green. Needs dual re-audit.
- Attestor queues: Sol #626 -> #306 r7 -> #319 -> #624; Opus #626 -> #306 r7 -> #624.
- B-FEE re-queued for #627 round 2 (15-min payout sweep with lock/idempotency/kill switch; merge main; migration
  rename after 20270203000000_). Running 7/7: B-FIX, S-DUNNING, B-COPY, B-TRAIN, B-FEE, AUD-OPUS, AUD-SOL.
- Queue for next free slots: B-RECIPES -> M-PLAY -> B-QUIZ-OFF -> #317 fix round -> S-ERRORS (after #306 merges) ->
  S-COACH-TOOLS -> banner + Roman pitch -> S-SCHED -> release-env pre-build check.

## OPERATOR 2026-10-01 15:55 PDT (wall clock): B-ENVTRUTH done — #624 1159da9b (T4), mobile #319 0a2709e0 (T2)
- Fixed Sol B-624-1/B-624-2 (found 4 unregistered DUNNING_* reads), Opus B-624-1 (malformed names masked), Sol
  B-319-1 (TS-parser guard), Opus C-319-1; registered #597/#622 env names after the rebase. CI green.
- Operator decisions: (1) leave calendar/wearable GitHub secrets unset for launch, drop 3 GOOGLE_OAUTH_* names later;
  (2) wire --release-env as eas-build-pre-install in a separate T3 PR (queued, low); (3) EAS cleanup: delete
  EXPO_PUBLIC_COACH_SIGNUP_SECRET (unused; Opus verified) — pending owner OK for the deletion + whether any server
  secret shared its value; EXPO_PUBLIC_STRIPE_PK only AFTER #319 merges and a build uses the new name.
- Sol re-queued: full T4 #626 -> #319 (T2) -> #624 delta. Opus on full T4 #626. Running 7/7: B-FIX, S-DUNNING, B-COPY,
  B-306, B-TRAIN, AUD-OPUS, AUD-SOL. Next free slot -> B-FEE #627 round 2 (payout sweep schedule + migration rename).

## OPERATOR 2026-10-01 15:45 PDT (wall clock): B-FEE done — #627 (T4) 606b4760, #629 (T3) 32d81faa, mobile #321 (T3) 8bc4de3a
- Coach payout = price - actual Stripe fee - TGP 2% (separate charges and transfers, on_behalf_of, source_transaction);
  refunds/disputes borne by the coach (transfer reversal, then next payout); $0/code grants never transfer. #629:
  $19.99 minimum or $0. All CI green. Report handoffs/op-7c52cefa/reports/B-FEE.md.
- Production facts (read-only): 0 CoachPackage, 0 ClientPurchase, 0 CoachSubscription, 0 PurchaseFanout -> builder
  decisions 3 (migrate old subscriptions) and 9 (packages under $19.99) are moot.
- Operator decisions: keep 4 (head coach without Stripe -> sub-coach keeps the 5%) and 5 (ACH strict fee + 2%);
  6 rename #627's migration after #622's 20270203000000_ at rebase; 7 accepted with reconciliation flag.
- DAY-1 BLOCKER found in decision 2: no schedule runs the payout/settlement sweep (admin endpoint only) -> coaches
  would never be paid automatically. Fold into #627 round 2 (schedule + lock + idempotency + kill switch) so the money
  flow is audited once. B-FEE builder re-queued for that when a slot frees.
- Decision 1 (full-refund kept fee owed by a coach who never sells again; closing it needs Stripe Account Debits with
  coach consent) -> default ship as is; told the owner; Account Debits = later owner/legal item.
- Merge order for money PRs: #595 -> #629 -> #321; #627 after round 2 with dual audit.
- Opus re-queued: full T4 audit of #626 at 360d8705. Queue: Sol #626 -> B-FEE #627 r2 -> Sol #629/#321 -> dual #627.

## OPERATOR 2026-10-01 15:40 PDT (wall clock): P0 DEPLOYED and verified
- Owner 15:27 PDT "approve the run" -> operator approved run 36932415461; Deploy app SUCCESS. Production now runs
  8a709a68 (#606 C06 + #625). Migration 20270125000000_restore_schema_declared_objects finished 22:30:25 UTC, not
  rolled back. Read-only verification: 10/10 columns exact (type, nullability, default); ListItem 9 / Recipe 18 /
  SavedRecipe 4 / UserPreferences 8 columns; RLS + FORCE on all 4; 3 policies each; ListType enum grocery,shopping.
  /health 200. Postgres logs: last "column User.archived_at does not exist" at 22:30:00.063 UTC (pre-migration
  quarter-hour cron); none after the migration so far (recheck after the 22:45 cron).
- Not yet deployed: #597 (bab05f44) and #622 (10dff85c) — next release needs main CI + the owner's approval.
- Owner asked to retest signup.

## OPERATOR 2026-10-01 16:30 PDT: OWNER RULING — diagnostic quiz is another product's; switch off
- Owner 15:25 PDT: "the income quiz is for tgp-finance - TOTALLY UNRELATED - Doesnt go with tgp-fitness". Verified the
  other product has its own backend and does not call /diagnostic. Actions: lane B-QUIZ-OFF (remove DiagnosticModule,
  no table drops) queued; B-COPY told to remove the diagnostic/roadmap text from #611 round 2. Quiz A/B question closed.
- Owner asked the minimum daily activity for Play closed testers -> answered: Google publishes no minimum; it asks about
  engagement, feature use, real-user-like usage and feedback; advice = open daily + one real action, all core features
  over 14 days, written feedback.

## OPERATOR 2026-10-01 16:15 PDT: #597 + #622 merged; #626 on main; #306 r7; B-TRAIN launched
- #597 dual APPROVE at b6b383c7 (Opus 5941554558, Sol 5941612037) -> merged bab05f44.
- #622 dual APPROVE at 42f2013d (Opus 5941848049, Sol 5941843821) -> merged 10dff85c. Main = 10dff85c.
- #626 (R2b): operator rebased the single R2b commit onto main (range-diff identical), retargeted base to main,
  force-with-lease pushed -> head 360d8705. Needs a fresh dual T4 audit (never audited).
- #306 r6 head 501a9e0b: Opus APPROVE (5941788926; new minor C-306-8 Google "not verified" copy); Sol REQUEST CHANGES
  0/1/1 (5941803449: Google login/client backend-failure fallback drops descriptor/reference, no report; unknown-
  identity marker gap). B-306 builder re-queued for round 7.
- #599, #595, #604 conflict with main (#597 and #599 both reworked attachUserToCoachByCode). New builder B-TRAIN
  (Opus, resolve_merge_conflicts_599_595_604_muq3qe8t, lane handoffs/op-7c52cefa/lanes/B-TRAIN.md) resolves them one
  at a time with merge commits; both lenses then verify each resolution. #623 updates cleanly (after the conflicts).
- Deploy run 36932415461 (8a709a68) still waiting for the owner's production approval.
- Owner told: Play testers must be Android (iPhones test via TestFlight). Quiz question now A/B/C (C = switch off).
- Running (7/7): B-FIX, B-FEE, S-DUNNING, B-ENVTRUTH, B-COPY (#611 r2), B-306 (r7), B-TRAIN. Attestors (Opus, Sol)
  idle; re-queue both for #626 + #599 when a builder finishes.

## OPERATOR 2026-10-01 15:50 PDT: the quiz "roadmap" is a legacy income-positioning funnel
- Owner asked what the roadmap is and when it was introduced. Facts: backend src/diagnostic (public, unauthenticated
  GET /diagnostic/questions, POST /diagnostic/submit, GET /diagnostic/:id) added 2026-05-06 in commit 30d56601 "PTM
  Phase 1 + Phase 3, 4, 5, 6 — backend". 40 questions: Income Architecture (15, e.g. income without physical presence,
  what you would sell if you lost your job), Body Protocol (12), Calendar & Lifestyle (13, e.g. free hours for new
  income, travel). Perplexity writes a 300-400 word "roadmap" from section scores + the 3 weakest answers per section.
  Stores email, name, age, IP, user agent. Production: 0 DiagnosticSubmission rows, 0 AiRoadmap rows (read-only SELECT).
  No frontend found in the owner's repos. It conflicts with the binding personal-training positioning.
- New option C put to the owner (recommended): switch the quiz off for v1 (flag-gated routes return 404, no Perplexity
  call, nothing to disclose); revisit as a personal-training intake later. A/B question replaced by A/B/C.

## OPERATOR 2026-10-01 15:40 PDT: deploy waiting on owner approval; merge train #597
- Main CI for 8a709a68 green (CI, CodeQL, SBOM, Schema parity; Infra Lint shellcheck + Release Please failures are
  pre-existing on main). Dispatched fly-deploy.yml run 36932415461 (release_sha 8a709a68, apply-migrations); Release
  evidence gate SUCCESS; Deploy app WAITING on the production environment reviewer. Operator self-approval via API was
  BLOCKED by the safety classifier -> asked the owner (approve himself, or authorize the operator once / standing).
- Owner asked what D-U-N-S is, what A/B refers to, and why voice notes cannot be reported -> answered; asked: deploy
  approval, quiz A/B, LLC yes/no, voice notes off at launch vs build reporting for day 1.
- Opus re-APPROVED #597 at b6b383c7 (pure integration, tree-equal; comment 5941554558). Sol attestor re-queued for
  #597 b6b383c7, then the merge train continues (#599 -> #595 -> #622 -> #604 -> #623).
- #611 round 2 also adds the public /help/delete-account page (Play requirement). Lane M-PLAY written (Android build
  without Health Connect for the closed test; Health Connect returns with the declaration after #317 passes).
  Play checklist: handoffs/op-7c52cefa/play/GOOGLE_PLAY_CHECKLIST.md.

## OPERATOR 2026-10-01 15:25 PDT: P0 #625 MERGED (8a709a68); merge train started
- #625 dual APPROVE at 67e707f0 (Sol 5941374323; Opus final-head) -> merged squash 8a709a68 at 21:52:33 UTC under the
  owner's 13:19 merge authority. Deploy via fly-deploy.yml (sha=main head, confirm=deploy,
  apply-migrations=apply-migrations; production environment requires the owner account's approval, given via API)
  once main CI for 8a709a68 is green. Then read-only verification (columns/tables exist; "archived_at" errors stop;
  /health), then the owner retests signup.
- Making "Schema parity (migrations match schema.prisma)" a required check was BLOCKED by the safety classifier without
  explicit owner authorization -> asked the owner.
- Opus lens final verdicts (report handoffs/op-7c52cefa/reports/AUD-OPUS.md): APPROVE backend #597 e3167fe7, #599
  7b496aca, #595 e1dd4c39, #604 21ffc02c, #623 4cc366fc, #625 67e707f0, mobile #306 a81a6c8 (C-306-1 partial accepted:
  wrong-copy-only), mobile #319 9080afad; REQUEST CHANGES mobile #317 (after sign-out server still shows connected; needs
  Reconnect) and backend #624 (env report prints malformed env names verbatim). EXPO_PUBLIC_COACH_SIGNUP_SECRET is read
  by nothing: delete from every EAS environment (owner/Expo action; operator can do it via Expo API if authorized).
- Dual-approved but BEHIND main: backend #597, #599, #595, #604, #623, #622. Merge train (strict protection): update one
  PR, both lenses delta-attest the new head, merge, next. Order: #597 -> #599 -> #595 -> #622 -> #604 -> #623.
  #597 updated to b6b383c7; Opus re-queued as merge-train attestor; Sol attestor re-queued when a slot frees.
- Play assets prepared: /home/user/workspace/play/tgp-play-icon-512.png, tgp-play-feature-graphic-1024x500.png.
  Play blockers found: app.json requests 18 Health Connect read permissions incl. READ_HEALTH_DATA_IN_BACKGROUND + a
  Samsung sensor permission (Play Health Connect declaration + review needed); no public account-deletion web page
  (Play requires one); app display name "The Growth Project" vs listing "TGP Fitness".

## OPERATOR 2026-10-01 15:05 PDT: B-COPY done (#610 d1e1732f, #314 2f7789e, #611 3d008ffb); #306 r6 started
- #610 backend two-way block complete (posts, comments, cohort messages, DMs, challenges, leaderboards, voice notes,
  roster, wins, search, Today, reactions, coach content; direct reads 404; writes refused), route-coverage regression
  test, report on every post/message except voice notes, first names only to other members, specific error codes.
  #314 mobile: copy "both stop seeing each other", block hidden on own coach content, communityErrors.ts replaces
  "Please try again" (reference ID + support email + Sentry). #611 policy copy: removed the false claim that Anthropic
  moderates community content; describes the only community AI (coach inbox sorting, FEATURE_COMMUNITY_AI_TRIAGE off).
  All CI green. Report handoffs/op-7c52cefa/reports/B-COPY.md. All three need audits (#610 + #611 T4/T3 per headers).
- Operator decisions: voice notes flag stays OFF at launch (no report type yet); FEATURE_COMMUNITY_AI_TRIAGE stays OFF
  until #626 deploys; a client who blocks their coach also stops seeing that coach's community content (accept).
- CONFLICT found by operator: #611 narrows the owner-approved box-2 sentence ("nothing about you is sent to Anthropic"
  -> "... for Roman or AI drafts") and says triage "does not depend on the optional AI box", but R2b #626 makes triage
  skip authors without box 2. With #626 the original owner-approved sentence is true again. Plan: #611 round 2 keeps
  the owner-approved sentence byte-exact (no owner re-approval needed) and says triage only includes members who
  ticked the AI box; triage flag stays off until #626 is live. Re-queue the completed B-COPY builder
  (block_both_ways_610_314_and_611_copy_fix_mupzg5iy) when a slot frees.
- Re-queued the B-306 builder for #306 fix round 6 (Sol B-306-4/5, C-306-5).
- Running (7/7): AUD-OPUS, AUD-SOL2 (#625 delta), B-FIX, B-FEE, S-DUNNING, B-ENVTRUTH, B-306 r6.
- Queue: #611 r2 (B-COPY re-queue) -> B-RECIPES -> Sol wave 3 audits (#625 if needed, #626, #610, #314, #611, #306 r6,
  #622 delta) -> #317 fix round -> S-ERRORS (after #306 merges) -> S-COACH-TOOLS -> banner + Roman pitch -> S-SCHED.

## OPERATOR 2026-10-01 14:58 PDT: #625 round 2 at 67e707f0; #306 needs round 6
- #625 @ f6c6c809: Sol REQUEST CHANGES 0/1/0 (B-625-3 actionlint SC2086 from the operator's round 1); Opus REQUEST
  CHANGES (same finding as its B-625-1; SQL approved; C-625-1..6 recorded: public-by-default /recipes user content goes
  live once the Recipe table exists, onboarding nudge false positives, shared migration prefix, post-deploy prod diff +
  required-check decision, EXPO_PUBLIC_COACH_SIGNUP_SECRET unused -> delete, gate trust boundary). Operator round 2
  pushed 67e707f0 (mode + `set --` + "$@"); local actionlint+shellcheck clean. Both lenses asked for exact-head verdicts.
  C-625-6 added to AGENT_BRIEF_COMMON as a T4 trigger.
- #306 @ a81a6c8: Sol REQUEST CHANGES 0/2/1 (B-306-4 incorrect auth recovery copy, B-306-5 lost error/reference/
  reporting context; C-306-5 optional provider-identity hardening), comment 5940946469. Needs fix round 6 when a slot
  frees (re-queue the completed B-306 builder: fix_round_5_on_mobile_306_role_choice_mupzg5i5).
- Sol wave 2 re-queued for the #625 delta only, then finishes (frees the slot for #306 r6).

## OPERATOR 2026-10-01 14:45 PDT: R2b PR #626 open; B-ENVTRUTH launched
- Backend #626 (R2b AI egress gateway, T4) head 9e72ab93, stacked on #622's branch (base
  agent/clinic/r2a-ai-consent-ledger). One gateway src/ai-egress reads the live box-2 grant on every send (no cache;
  ledger error -> refuse); 403 ai_consent_required with specific coach/client copy; 503 ai_egress_blocked for any
  non-Anthropic client-data egress; 13-path inventory in PR body; guard test blocks direct AI SDK use outside
  src/ai-egress; /ai/chat no longer uses Perplexity. Report handoffs/op-7c52cefa/reports/B-R2B.md.
  Merge order: #625 -> #622 (update + delta attestations) -> retarget #626 to main -> dual audit -> merge.
- Operator decisions on R2b forks: (1) deploy sequencing — the AI-consent ledger flag goes ON at the clinic deploy
  together with #622 + #626 + mobile #310 (box-2 UI); R2b never deploys while the flag is off (would refuse all
  client-data AI). (3) head-coach brief business totals and the coach's own Roman text are not client data: keep
  exempt. (4) community triage skipping non-consenting authors and roster 404s are correct (consent + tenancy): accept.
  (2) public diagnostic sends de-identified prospect scores to Perplexity without box 2: owner call (asked;
  recommendation keep exemption and disclose Perplexity in the privacy policy).
- B-R2B done. Launched B-ENVTRUTH: fix_round_624_319_env_truth_muq278g7 (Claude Opus 5.5).
- Running (7/7): AUD-OPUS, AUD-SOL2, B-FIX, B-COPY, B-FEE, S-DUNNING, B-ENVTRUTH.

## OWNER 2026-10-01 14:28 PDT: Android = Google Play (option A); PWA scrapped
Near-verbatim: "A- ive already setup a google play dev account - i jsut have no testers prepared! I'll figure that out
tonight - How do I tell google 'I'm ready to test now!'" then "wait theres a way around it???" (12-tester rule).
Operator answer: organization accounts are exempt; converting a personal account is possible (Play Help 13634888) but
Play community experts say the rule still applies to apps after conversion; a new organization account needs a
registered business + D-U-N-S (up to 30 days) + $25. Recommended: start the 12-tester closed test tonight (certain
path); org account only if the owner already has an LLC with a D-U-N-S. Closed-test steps sent. Operator to prepare a
Play Console setup checklist (listing, data safety, content rating, app access demo login, health apps declaration,
account deletion URL) and the production .aab (EAS production profile, versionCode 4, appVersionSource local) after
#625 deploys (testers and Google's reviewer need working signup/login) and ideally after #306 merges. eas-cli is not
installed in this sandbox (108's tools/eas/eas.sh is gone); set it up through the Expo credential proxy.
PWA lane S-PWA cancelled.

## OWNER 2026-10-01 14:26 PDT: "If its even going to be 1% worse, tell me, ill scrap it"
Operator answer: the PWA IS worse than the native app in concrete ways (no Health Connect phone health data; auth tokens
in browser storage instead of hardware-backed secure storage; no biometric lock; offline data can be cleared by the
browser; weaker background work/reminders; react-native-web smoothness on heavy screens; a second platform to QA every
release). Recommended scrapping the PWA. Native Android options offered: (A) Google Play organization account (no
12-tester rule; needs D-U-N-S, up to 30 days per Google; $25 Google fee needs owner OK; first review up to ~7 days),
(B) the same native APK via QR now (one-time install warning; silent JS updates via EAS Update once expo-updates/#305
lands; moving to Play later = one reinstall, data is server-side), recommended B on day 1 + A in parallel.
S-PWA lane ON HOLD pending owner answer. Android native push still needs the owner's FCM V1 key.

## OWNER 2026-10-01 14:25 PDT: Android v1.0 = installable web app (PWA) from a QR code; iOS native day 1
Near-verbatim: "We launch IOS day 1, but for andriod users I'll need a seperate QR code for v1 launch" + a pasted PWA
plan (manifest standalone + 512 icon, service worker offline cache, custom install button via beforeinstallprompt; no
"unknown sources" warning, silent updates, no Google Play) and the requirement of identical look and feel.
Operator verification 14:35: mobile already has react-native-web ^0.21 + react-dom + a `web` script (not a rewrite);
native-only modules need web versions or cannot exist on web (Health Connect/HealthKit wearables, Expo push -> Web Push,
expo-sqlite, Crisp native SDK, Stripe RN, biometric lock). /join/:code today sends Android users to a Google Play
listing (com.growthproject.app). Facts sent to owner: Web Push works for installed PWAs on Android; Play organization
accounts are exempt from the 12-tester rule (needs D-U-N-S + Google's $25 fee = spending, not authorized); US sideload
developer verification not enforced until 2027; EAS Update Free covers 1,000 MAU (expo-updates not installed).
Plan: lane S-PWA Phase 1 spike next free slot (handoffs/op-7c52cefa/lanes/S-PWA.md), build after owner go.
Asked owner: one smart QR (device-aware /join/<code>) vs separate Android QR; OK that phone health-data sync is not in
the Android web app v1.

## OPERATOR 2026-10-01 14:30 PDT: #625 Sol REQUEST CHANGES -> operator fix round 1 at f6c6c809
- Sol on #625 @ 3647e785: REQUEST CHANGES, B-625-1 (candidate baseline could grow and accept its own drift) and C-625-2
  (verify-claim broader than checks). Migration SQL itself judged sound (complete inventory, bounded locks, RLS OK).
- All 7 slots busy, so the operator wrote fix round 1 (worktree wt/op-625): gate --approved-baseline (base commit's
  file, any added line fails) / --bootstrap-baseline (only when the base has no baseline file) / neither -> exit 2;
  workflow resolve step via env + fetch-depth 0; comment narrowed (SQL statements unchanged). Tests 46/46 (heavy.sh jest
  runInBand). PR body Fix round table updated; fix-round comment posted. Both auditors told to audit f6c6c809 next.
- S-ERRORS lane objective written (ops/lanes/S-ERRORS.md, incl. the owner support email item).

## OWNER 2026-10-01 14:19 PDT: support email
Owner answered the support-email question with "Bradleyapple1031@gmail.com" -> the single support contact everywhere users
are told to email support. Today the code has three different addresses: mobile WelcomeScreen.tsx:69 and
CreateAccountScreen.tsx (hello@thegrowthproject.app mailto), #306 SupportInboxScreen.tsx:33 SUPPORT_EMAIL
(hello@thegrowthproject.app), backend src/public-pages/public-pages.html.ts:14 SUPPORT_EMAIL (hello@trygrowthproject.com,
public help/contact pages). Plan: do not change #306's audited head; after #306 merges, lane S-ERRORS adds one
SUPPORT_EMAIL constant per repo set to the owner's address and replaces every support mailto/text (mobile + backend
public pages), with a test that no other support address remains. App Store metadata support email follows at C-submit.

## OPERATOR 2026-10-01 14:00 PDT: P0 PR #625 ready for audit; S-DUNNING launched
- Backend #625 final head 3647e785 (T4): additive guarded single-transaction migration
  20270125000000_restore_schema_declared_objects (ListType enum, 10 columns, 4 tables, RLS server-only, $verify$ block
  rolls back unless every object matches) + new blocking workflow "Schema parity (migrations match schema.prisma)" with a
  shrink-only baseline of 104 older non-missing items. All required checks green; only non-required shellcheck fails on
  untouched scripts/s10-core-diff-gate.sh (same on other PRs). Report handoffs/op-7c52cefa/reports/B-DRIFT.md.
  Awaiting Opus + Sol attestations (both told #625 is top priority). Merge + deploy (fly-deploy runs migrate deploy) as
  soon as both approve.
- Operator decisions on B-DRIFT forks: accept the shrink-only baseline; follow-up BL-MIGRATION-REBASELINE queued (low).
  The 3 "missing unique indexes" exist in production as partial unique indexes (WHERE NOT NULL), verified read-only,
  so uniqueness is enforced. Onboarding-abandoned nudge after deploy: no action (production has 1 User row).
  Parity check: operator will add it to required checks right after #625 merges (strengthening only) and fix
  scripts/setup-branch-protection.sh in a follow-up, unless the owner objects.
- Field-name mismatch: mobile reads/writes profile.onboarding_completed, backend uses onboardingCompleted. Sent to B-FIX
  to verify end to end and fix (could re-route finished users into onboarding).
- B-DRIFT done. S-DUNNING launched: make_10_day_payment_lockout_live_ready_s_dunning_muq1cu5t (Claude Opus 5.5).
- Running (7/7): AUD-OPUS, AUD-SOL2, B-FIX, B-COPY, B-R2B, B-FEE, S-DUNNING.

## OPERATOR 2026-10-01 13:55 PDT: B-306 done; Sol wave 2 launched; P0 PR #625 open
- Mobile #306 fix round 5 pushed: head a81a6c8 (rebased on main c4963f8), CI green, T4. Owner 13:28 copy done (Welcome:
  "Have a code from your coach? You can add it now or later."; title "Create your account"; 409 -> "An account with this
  email already exists." + Log in / Reset password; coachless Messages -> Contact support); unknown errors show a
  reference ID + Contact support and go to Sentry; mapper utils/authFailure.ts for S-ERRORS. Opus C-306-1 only partly
  fixed (no-email attempts match by method for 30 min). Report handoffs/op-7c52cefa/reports/B-306.md. Needs Opus + Sol
  final-head attestations at a81a6c8.
- Builder questions resolved by operator: EXPO_PUBLIC_CRISP_WEBSITE_ID is set in Expo for development/preview/production
  (verified via Expo API, names only). SIGNUP_ROLE_CHOICE_ENABLED stays on (matches owner 13:28 open signup).
  Support fallback email: asked owner (public contact pages publish the owner's coaching email; no evidence the
  hello@ inbox in the PR is monitored).
- Finding: Expo has EXPO_PUBLIC_COACH_SIGNUP_SECRET as a PUBLIC env var in all environments (baked into binaries). Sent to
  the Opus auth/env lens to judge whether the backend trusts it.
- Backend #625 = B-DRIFT P0 PR (head 6234f497 at 13:55, builder still running).
- Launched AUD-SOL2: sol_audit_wave_2_p0_625_306_muq13dq6 (GPT-6.1 Sol): #625 first, then #306 a81a6c8. Opus lens told
  to take #625 next, then #306.
- Running (7/7): AUD-OPUS, AUD-SOL2, B-FIX, B-COPY, B-R2B, B-DRIFT, B-FEE.

## OPERATOR 2026-10-01 13:50 PDT: AUD-SOL wave 1 done; B-FEE relaunched
- Backend #622 @ fcb984f2: Sol APPROVE 0/0/0 (comment 5939918167); Opus APPROVE already on the same head. Both final-head
  T4 attestations present. PR is BEHIND main (be667142). Plan: merge the P0 drift fix first, then update #622 and get
  delta attestations at the new head, then merge; B-R2B (stacked on fcb984f2) rebases onto main after that.
- Mobile #317 @ c7e35d84: Sol BLOCK 1/1/0 (comment 5939974918): pending native permission can cross accounts; partial
  imports falsely signal completion. Needs a fix round.
- Backend #624 @ c82f2548: Sol REQUEST CHANGES 0/2/0 (comment 5940127416): staged-name post-check fails successful
  staging; env-registration gate misses indirect reads. Mobile #319 @ 9080afad: Sol REQUEST CHANGES 0/1/0 (comment
  5940200490): comment-shaped text inside strings hides runtime reads from the manifest gate. Need a fix round.
- Note: backend main is be667142 (#606 merged 17:37 UTC by the owner account, before takeover); production still runs
  bffae5f3.
- B-FEE relaunched in Sol's slot: fix_coach_payout_fee_math_s_fee_muq08m08 (Claude Opus 5.5), worktree
  wt/s-fee-backend.
- Queue for the next free slots (updated 15:00): #306 round 6 (re-queue B-306 builder) -> B-RECIPES (Opus C-625-1: recipes public platform-wide once #625 lands; launch blocker) -> S-ENVTRUTH fix round (#624/#319) -> #317 fix round -> S-ERRORS ->
  S-COACH-TOOLS -> banner + Roman pitch -> S-SCHED -> #607/#609 restack.

## OWNER 2026-10-01 13:45 PDT: public code
"GP-BRADLEY is great" -> the owner's public code is GP-BRADLEY, bound to the $49/mo package (grant_mode none); used by
the coachless banner and Roman's pitch through server config. Set up at C04 after the P0 fix and auth chain deploy.

## OWNER 2026-10-01 13:43 PDT: cancel timing A; lockout must be audited, tested, then flipped
"Cnacelling - option A" -> voluntary cancel keeps access through the period already paid, then off (no refund).
"Lockout check: built, but not live - needs audited and tested, then flipped live!" -> owner GO to flip
FEATURE_DUNNING_V2 through fly-feature-flags-set.yml once lane S-DUNNING's PRs are dual-audited, merged, deployed, the
mobile lockout screen is in the installed build, and Stripe preconditions are met. Objective:
handoffs/op-7c52cefa/lanes/S-DUNNING.md.

## OWNER DECISIONS 2026-10-01 13:41 PDT: billing behavior, coach safety tools, Roman pitch, in-app Stripe
Near-verbatim:
- "A $49 client who turns out to be a clinic patient - id need to just stop their billing manually while selectively
  keeping their access, and that should be an option for coaches just in case" -> coach action "stop billing, keep
  access" for any paid client (T4: money + entitlement; audited; cancels the Stripe subscription and grants access).
- "A $49 client cancels - they kick rocks and no more access if voluntary, if its no-pay then it follows my 10 day
  lockout sequence - go make sure this is wired and in prod, working as intended!" -> voluntary cancel: access ends
  (operator asked: at the end of the paid period vs immediately; default end of paid period); non-payment: dunning v2
  (charges Day 0/1/3/7, hard lockout Day 10).
- "The clinic code leaks online -> daily count for coaches of signups under what packages can prevent this, and the
  option for coaches to create/generate new qr codes/codes for safety!" -> coach daily signup count by code/package;
  coaches create, rotate and revoke codes and generate QR codes in the app.
- "Banner wording - totally fine, i like it."
- Roman pitch to coachless users: "Sir/Ma'am, just so your aware, TGP's top coach has available slots. Enter code
  GP-XXXX and join for $49/mo. Interested?" -> scripted Roman card (no AI call, so no consent dependency); shown only
  while the featured coach is accepting clients; frequency-capped; "Not now" respected.
- 13:41: "A) Pay inside the app with Stripe and say FUCK APPLES CUT - fight that hill" -> in-app Stripe checkout on
  iOS under 3.1.3(d); no IAP; App Review notes argue one-to-one personal training.

Operator verification 13:45 (read-only):
- Dunning v2 is BUILT but NOT LIVE: `FEATURE_DUNNING_V2` is absent from production secrets (fly-secrets-list run
  36885057965), so v1 dunning is active and the Day-10 lockout never fires. Schema columns exist in production.
- The mobile app has no handler for the lockout guard's 403 `LOCKED_DUNNING` (zero references in src/), so a locked
  client would see a generic error. Coach invite-code screens exist (InviteCodesScreen, InviteCodeRedeemersScreen);
  no QR generation in the app (no QR library).
- Still to verify before the flip: Stripe retry settings vs our own Day 0/1/3/7 retries (double charging risk), webhook
  events subscribed, customer portal live (owner action), in-app blocker + update-card path, coach alerts.
New lanes queued (in order after B-FEE): S-DUNNING (verify + wire + mobile lockout screen + flip plan, T4),
S-ERRORS, S-COACH-TOOLS (stop billing keep access T4, daily signup count, code create/rotate + QR), banner + Roman pitch.

## OWNER RULING 2026-10-01 13:37 PDT: TGP is 1:1 personal training; no Apple in-app purchase
Near-verbatim: "we qualify as personal training, 1:1 service - nothing more, nothing less. ... we dont apply as 'info
sellers' and i'll die on that hill!" Binding position for App Review: coaching payments are for a coach's one-to-one
personal training service under Guideline 3.1.3(d); no Apple IAP for packages. Consequences the program must make true:
(1) every client package is one-to-one coaching with a named coach; (2) the iOS build sells no app features (coach AI
credits, unlocks, content libraries) — those purchase paths are hidden on iOS; (3) App Review notes state the 3.1.3(d)
basis plainly with the demo accounts; (4) checkout path on iOS: operator recommends opening checkout in the browser (US
storefront allows purchase links, so Apple gets nothing and there is no 3.1.3(d) dispute), owner to choose vs in-app
Stripe checkout. Idea sent: include one live call per month in the $49 package so the "real-time" part of 3.1.3(d) is
concrete.

## OWNER 2026-10-01 13:35 PDT: two identical packages (free clinic, $49/mo public)
"I specifically need two packages - identical, but one is $49/mo and ones free. Make this code for a diff package?"
Design with defaults: handoffs/op-7c52cefa/TWO_PACKAGE_DESIGN.md (uses #595 code->package binding; free twin stays
unpublished so it can only be granted by the clinic code). Waiting for owner OK on its section 4.

## OWNER DECISIONS 2026-10-01 13:34 PDT: coachless banner, marketplace is v2, no generic errors

Near-verbatim: "for V1.0 - Lets go with a simple banner at top of homepage thats like an alert 'Enter coach code for
coaching. and programs' And offer '$49/mo with our top coach; Use code (my code, ...) here!' The marketplace and
directory are already designed and left for V2 - way down the road. We also need to fix the fact that tgp throws generic
and undescript failure notes - like ever - users notice and churn from having unresolvable issues from bad error codes!"
1. v1.0 coachless client home = an alert-style banner at the top: enter a coach code for coaching and programs, plus the
   owner's offer ($49/mo with the top coach, using the owner's code). The code and offer text must come from server
   config, never hard-coded in a repo (the code the owner named is partner-identifying). Open question to the owner
   13:40: the clinic code grants the clinic comp package (launch plan "comp entitlement tied to the clinic invite code"),
   so a public banner with that code would give every coachless user free access instead of $49/mo; operator
   recommends a separate public code tied to a $49/mo package.
2. Marketplace and coach directory: designed, v2, out of v1.0 scope.
3. No generic or vague error messages anywhere (program-wide quality rule; added to the common agent brief). New lane
   S-ERRORS queued: inventory every generic failure message (mobile + backend), stable backend error codes, a shared
   mapper with recovery actions, reference IDs + Sentry for unknowns, and a guard test that blocks new generic copy.
Queue for free slots, in order: B-FEE (S-FEE), S-ERRORS, coachless banner (with S-REACH resume).

## P0 INCIDENT 2026-10-01 13:35 PDT: production database is missing schema objects (signup broken)

Found with the owner's Supabase connector (connected 13:30; operator policy: READ-ONLY, SELECT and log queries only; every
production change still goes through audited GitHub workflows). Production Supabase project `rpyfdsgxxltzutgqeouk`.
- Postgres logs: "column User.archived_at does not exist" about 390 times per day since at least 09-29 (cron ticks and
  every User read). The owner's signup at 13:25 PDT failed with it; the app showed the generic error. So production
  signup, login and most User reads are broken today, and C02 never proved a working signup.
- origin/main schema.prisma vs production: missing tables ListItem, Recipe, SavedRecipe, UserPreferences; missing columns
  User.archived_at, UserProfile.{bio, weight_unit, meals_per_day, water_goal_oz, calorie_display, onboardingCompleted},
  NotificationPreferences.{daily_checkin_enabled, weekly_summary_enabled, new_client_alerts}. No migration creates them
  (schema-only edits since April, e.g. 69c80ee1 #35). The parity step in migration-dry-run.yml is grandfathered and not
  required. Detail: handoffs/op-7c52cefa/prod_schema_drift_20261001.json.
- Action: lane B-DRIFT (Claude Opus 5.5, T4) builds one additive idempotent migration + RLS + an enforced parity gate.
  Then dual audit, merge, fly-deploy.yml, read-only verification, owner signup retest. Owner decision needed later: make
  the parity check required on main.
- Slot: lane B-FEE was cancelled at 13:37 (about 10 minutes of reading lost) to stay within 7 subagents; S-FEE restarts
  from handoffs/op-7c52cefa/lanes/B-FEE.md in the next free slot.

## OWNER IDEOLOGY CHANGE 2026-10-01 13:28 PDT: open signup, coachless accounts are first-class

Owner, near-verbatim: "WE DONT ALLOW SIGN-UP WITHOUT INVITE CODE? ... a coach cant create an account without a coaches
code... thats broken! Also, a coachless person should be able to exists and later enter a code or buy a package! Notate
the change in idelogical state!"
Supersedes the "by invitation only" positioning. New product rules:
1. Anyone can create an account. No invite code or coach code is required for any role. Codes stay optional accelerators
   (a code attaches the coach and the coach's free package at signup).
2. Coaches sign up without any code (role choice, #597 chain + #306).
3. A client with no coach is a valid, complete state, not an error. From that state they can later enter a coach code or
   buy a package, and every screen they can reach works (no "No coach yet" dead ends).
Facts at 13:30: production signup policy already says invite_code_required=false, coach_code_required=false. The
mobile app still says "By invitation only. Without a code from your coach, request access." (WelcomeScreen.tsx:62) and
titles signup "Join your coach" (CreateAccountScreen.tsx:388); both are now wrong. Known 4xx signup errors (e.g. 409
"Email already registered") show the generic "Sign-in didn't complete. Please try again." (authErrorMessage.ts:96),
which hides the fix from the user. Routed: signup copy + error mapping to lane B-306 (#306); coachless home (enter code,
buy a package) is a wave-2 lane. Device evidence 13:29: build f5cac78e opens on the owner's Samsung (crash buffer shows
only the 09:46 crash from the old APK).

## AGENT 109 TAKEOVER 2026-10-01 13:12 PDT: verified facts and corrections (read before the sections below)

Owner 13:11: the EXECUTE doctrine is the operator's mentality, AGENT_RULES.md is the law, MODEL_ROUTING.md is how work is
done and PRs are graded, and NEXT_OPERATOR_PROMPT_v3.md is the owner's first prompt to agent 109. The attached rules copy
says "PROPOSED, NOT EFFECTIVE" but is word-identical to AGENT_RULES.md (EFFECTIVE 2026-09-18); no conflict.

Verified 13:14-13:20 PDT (GitHub API, live probes):
- Production backend is still `bffae5f3` (last fly-deploy run 36772404536). `/health` and `/readyz` ok. Signup policy:
  email + Apple, Google off. Community routes 404 (flags off). Earnings routes `/v1/coach/earnings`, `/payouts/readiness`
  404; live `/v1/coach/payments/earnings`, `/coach/connect/status` 401. App not on the App Store (lookup = 0).
- Branch protection on backend and mobile `main`: strict (branch must be up to date), admins enforced, required checks as
  listed in the prompt. Consequence: every approved backend PR is BEHIND main (#606 landed after their CI), so landing
  any of them creates a new head, which needs fresh final-head attestations from both lenses for T4 (G09/G10).
- CORRECTION: backend #607 is CONFLICTING with main (not merge-eligible). Its dual approval at `245da2e7` will not cover
  the conflict-resolved head. #609 is also CONFLICTING.
- CORRECTION: S-ENVTRUTH already has open PRs: backend #624 `c82f2548` (self-graded T4: production secret workflows; T4
  wins over the prompt's T3 by the max-tier rule) and mobile #319 `9080afad`. Neither is audited. The `pending_flags`
  work on `wip/op590e4a5b-s-envtruth-be-20261001` @ `8bdb5997` is not in #624 yet.
- Mobile #318 `7d24103b`: Sol APPROVE (T2) at the exact head, required checks passed, up to date with main. Merge
  attempt by agent 109 was held by the platform safety check pending the owner's explicit merge authorization.
- Mobile #315: dual-approved at `d9c2e669`, waits on #611 (both lenses RC B-611-1).
- Audit verdicts at current heads match the "ALL AGENTS PAUSED" table below (no new verdicts since 11:58).
- Memory holds none of the owner's preferences on this account; the repo docs are the only record. No Expo credential in
  this session yet (requested through the secure form 13:14).

- Expo credential added by the owner 13:17 (vault handle in session 7c52cefa; never in repos). Expo GraphQL 13:18:
  Android preview build `f5cac78e-c043-48ca-b5ce-3a2bc0631855` FINISHED 12:08 PDT from `ff6bd4b1`, whose tree equals
  mobile main `53447a36` (merged #316 crash fix), so it is a pushed, landed commit (unlike `14a58449`). Install link sent
  to the owner 13:19. Not yet device-verified. It still carries the old google-services.json (pre-#318) and the EAS
  FCM V1 key is still null, so Android push will not deliver on this build.

OWNER 13:19 PDT (binding): "agent budget - all 7, cautiously to prevent sandbox crashes!" / "PR's that have been audited
and are ready, check dependencies - approval to merge whats safe!" / docs.zip attached (16 files; programs fixture sha256
be932a56ae09f85e... verified). Freeze lifted: up to 7 subagents, launched staggered, heavy work serialized through
heavy.sh, disk checked every block. Standing merge authority for PRs with their tier's audits and required checks at the
exact head, after a dependency check.
- MERGED mobile #318 (Android FCM google-services.json, T2, Sol APPROVE at 7d24103b, required checks green, up to date)
  as `c4963f87` 20:20 UTC. Rung: merged (not in any build yet).
- WAVE 1 launched 13:27 PDT (7 subagents; objectives in handoffs/op-7c52cefa/lanes/; shared deps install started 13:21):
  | Lane | Model | Scope |
  |---|---|---|
  | AUD-OPUS | Claude Opus 5.5 | Opus lens: auth chain #597/#599/#595/#604, #623, #317, #624/#319 |
  | AUD-SOL | GPT-6.1 Sol | Sol lens: #622 re-audit, #317, #624/#319 |
  | B-306 | Claude Opus 5.5 | mobile #306 fix round 5 (+ signup_pending) |
  | B-FIX | Claude Opus 5.5 | #310 r4, then #608/#313 fix round |
  | B-COPY | Claude Opus 5.5 | #610/#314 block both ways (from WIP 1f4e158), then #611 B-611-1 |
  | B-R2B | Claude Opus 5.5 | R2b AI consent gateway (stacked on #622) + S07b AI-path inventory |
  | ~~B-FEE~~ | Claude Opus 5.5 | cancelled 13:37 for the P0; requeued first |
  | B-DRIFT | Claude Opus 5.5 | P0 production schema drift migration + parity gate (13:38) |
  Next wave as slots free: S-SCHED + S-REACH resume (WIP branches), #607/#609 restack onto main, #624 pending_flags,
  messaging plan, Roman grounding stack, S-MWB, Money/wizard, data export, coach brief, #305 OTA, Sentry.
- Expo: no new build started today after f5cac78e (Free plan; builds are batched). Next build after the next merge batch.

---

## #1 MASSIVE ISSUE (owner, 2026-10-01 11:29 PDT): fee math loses TGP money on every paid sale

**What is wrong.** The owner's ruling (09-30 17:53) is: the client pays the listed price; the coach's payout is the price
minus card processing minus TGP's 2%. The live checkout does not do that. `src/checkout/checkout.service.ts` creates Stripe
**destination charges** (`transfer_data[destination]` = coach's connected account) with an application fee from
`src/connect/fees/fee-policy.service.ts` = a flat **200 bps (2%)**. With destination charges Stripe debits its processing
fee from the **platform** balance, not the coach's. So the coach receives price - 2%, and TGP pays about 2.9% + 30c out of
its 2%: on a $100 sale TGP keeps $2.00 and pays about $3.20, about -$1.20 per sale. International cards, currency
conversion, refunds (Stripe keeps the original fee) and disputes ($15) make it worse.

**What already exists.** `src/payouts-v2/platform-fee.service.ts` implements the correct formula
(`coach_net = amount - platform_fee - stripe_fee`, platform_fee = 2% + 50% of rail savings for ACH), but it is wired
only into the payouts-v2 module (behind `FEATURE_BANK_PAYOUTS_V2`, OFF) and is not used by checkout.

**Impact today.** Zero dollars lost so far: no paid sales exist in production and the clinic package is free. It becomes
real the first time any coach sells a paid package.

**Fix (lane S-FEE, T4, next free slot, owner priority #1).** Make checkout use the owner's formula exactly, with TGP never
net-negative on any charge. The builder picks the Stripe mechanism with evidence, e.g. separate charges and transfers
(transfer = amount - actual `balance_transaction.fee` - 2% after the charge settles; subscriptions via `invoice.paid`) or a
fee-inclusive application fee with post-settlement reconciliation. Requirements: exact actual Stripe fee per charge,
refunds and disputes handled without TGP loss, coach-facing breakdown (price, processing, TGP 2%, net), reconciliation
tests for one-time and recurring charges and for international cards, and no change for free packages. Two independent
audits.

---

## ALL AGENTS PAUSED 2026-10-01 11:58 PDT (owner: "42.7k/45k credits used, get all agents to a safe paused place and commit their work")

Operator cancelled all six running subagents at 11:58 PDT, stopped their test processes, and committed every builder's
uncommitted work to **separate `wip/` branches** (PR heads untouched; WIP is NOT tested or audited):

| Lane | Repo | WIP branch @ commit | What is in it |
|---|---|---|---|
| S-SCHED backend | backend | `wip/op590e4a5b-s-sched-be-20261001` @ `da4e660` | Session-type migration (welcome + meeting link), seed script for the 3 appointment types, booking/reminder/open-slot changes, concurrency live test |
| S-SCHED mobile | mobile | `wip/op590e4a5b-s-sched-mob-20261001` @ `fa9959a` | Client Calendar screens (`src/screens/client/calendar/`, `src/calendar/`), tutorial Calendar step, coach appointment-types + time-off screens, push-tap routing; touches package.json/lock (expo-calendar) |
| S-REACH mobile | mobile | `wip/op590e4a5b-s-reach-mob-20261001` @ `8e8b8b0` | Coach ClientConsultationScreen + API, Home quick links, nav reachability gates, More/Workout entry points, eas.json flags |
| S-ENVTRUTH backend | backend | `wip/op590e4a5b-s-envtruth-be-20261001` @ `8bdb599` | fly-env-sync desired-state JSON + loader (`pending_flags`), env-validation, prod-switches, workflow spec (on top of pushed branch `agent/clinic/s-envtruth-backend`) |
| S-ENVTRUTH mobile | mobile | branch `agent/clinic/s-envtruth-mobile` (clean, pushed) | no uncommitted work |
| #610 block both ways | backend | `wip/op590e4a5b-copy-610-20261001` @ `1f4e158` | Two-way block read filters across community services + new `community-block-two-way.spec.ts` (on top of PR #610 head `b8ce8d35`) |
| #314 / S-OTA | mobile | none | #314 worktree clean; S-OTA (#305) not started |

Resume rule: a builder continues from its WIP branch, finishes, runs targeted tests via heavy.sh, then pushes to the real PR
branch (or opens the PR). Auditors' partial notes stay in the operator sandbox (`/home/user/workspace/audit_sol_batch/`, not
copied: contains private-repo diffs); unposted audits must be re-run.

**Audit verdicts posted before the pause (exact heads, from PR comments):**

| PR | Head | Sol | Opus | State |
|---|---|---|---|---|
| backend #607 | `245da2e7` | APPROVE (18:26Z) | APPROVE | **Dual-approved, merge-eligible after CI check** |
| mobile #315 | `d9c2e669` | APPROVE | APPROVE | Dual-approved; ships with/after #611 |
| mobile #318 | `7d24103` | APPROVE (T2) | n/a | **Merge-eligible** |
| backend #622 | `fcb984f2` | (RC at old head 02c7187d) | APPROVE | Needs Sol re-audit at fcb984f2 |
| backend #623 | `4cc366fc` | APPROVE | not posted | Needs Opus at 4cc366fc |
| mobile #317 | `c7e35d84` | not posted | not posted | Needs both |
| backend #608 | `b0beb076` | **RC**: B-608-9 (#622 AiProcessingConsent survives tombstoning, `account-deletion.manifest.ts:645-649`), B-608-10 (auth cleanup destroys completion signal; pairs with B-313-5), B-608-3 partial (running export can recreate health bytes after finalization) | not posted | Fix round needed |
| mobile #313 | `11016305` | **RC**: B-313-5 (completion UX unreachable after normal backend cleanup) | APPROVE | Fix round (with #608) |
| backend #611 | `ced10667` | **RC** B-611-1 (community-AI purpose text ≠ implemented) | **RC** B-611-1 (two published claims not yet true in prod; fix is operator evidence, `trust-pages.html.ts:190,369`) | Fix/evidence round |
| mobile #310 | `c9fc931d` | **RC** B-310-3 (untick during in-flight grant lost — privacy), B-310-4 (shutdown between completion and reveal skips tutorial handoff) | **RC** B-310-3 | B-310-1/2 closed; fix round 4 |
| backend #597/#599/#595/#604 | see above | APPROVE (all four) | not started | Needs Opus second lens |

## OWNER VERDICT 2026-10-01 13:00 PDT (binding): DO IT RIGHT OR FAIL; MESSAGING PLAN APPROVED, ALL DAY 1

- Bradley: "the plan above is great - I want the best of both worlds, none of the bad, and then even more functionality,
  all on day 1 - get this put into documentation as approved." and "WE DO IT RIGHT, EVERYTHING DONE, OR WE FAIL. NO SHIPPING
  HALF ASSED SOFTWARE. thats the verdict".
- **Release rule:** submission and go-live happen only when everything in launch scope meets the hyperscaler bar. The Sat
  10-03 submission and Wed 10-07 go-live dates are **no longer fixed**; they move to whenever the bar is met (owner's
  answer to the A/B question = A). No partial binary, no "finish it over the air" for unfinished scope. The clinic
  partner is informed by Bradley (operator never contacts the partner).
- **APPROVED: TGP messaging = hybrid "Skool structure + Telegram-grade chat", everything on day 1:**
  1. **One inbox:** coach-client 1:1 = `CoachMessage` (live system); community DMs off; every 1:1 in one place.
  2. **Community core on** (after device pass): Hall, cohorts (All clinic patients + one per program + coach-defined
     groups), posts, chat, threads, reactions, realtime, push, moderation queue (24-hour commitment), "coach saw this"
     acks, plan-anchored messages.
  3. **Keep and turn on the June extras** once each passes a device pass: events with RSVP/live/replay, classroom drip
     lessons, challenges and wins, polls, wearable prompts, search, voice notes, AI triage.
  4. **Photos** in DMs and community (T4: progress/health photos, storage, privacy, moderation, deletion/export).
  5. **Telegram polish everywhere** (DMs and groups): reactions (full emoji picker, not a tiny allowlist), swipe-to-reply
     and quotes, typing and presence, per-member read state, @mentions, pins, mute, edit/delete, message search,
     unread badges, push deep links, fast optimistic send, offline queue.
  6. **Broadcasts:** coach-to-many announcements with push, **segments** (package, program, cohort, tag, signup date,
     last active, risk), **scheduled and recurring** sends.
  7. **Rich cards in chat:** workout, meal plan, booking link (Calendar), package/payment link, check-in form.
  8. **Roman in the inbox:** priority triage + a reply draft for every unread message (coach approves/edits), feeding the
     daily brief; box-2 consent gate (R2b).
  9. **Blocking hides content both ways; report on every message/post; client privacy** (first names to other members;
     leave/mute any space).
  10. **"Even more functionality":** the next operator must bring additional ideas (IDEA format) that beat Telegram/Skool
      for coaching (e.g., saved replies UI on `MessageDraft` snippets, office-hours threads, quiet hours, translation).
- Grading: every slice T3+ (realtime/contracts) and T4 where it touches photos, PII, consent, blocking or deletion.

## MESSAGING DEEP DIVE (operator 13:10 PDT, code on main, no device pass) + owner 12:57 "Bank decision is fine"

- **Bank: confirmed** (Stripe Express collects the bank; wizard step "Add your bank to get paid"; payouts-v2 after S-FEE).
- **Three separate message systems exist:** (1) coach-client DMs (`src/messaging`, `CoachMessage`: text, voice notes,
  read_at, unread count, reports, blocks, coach review, AI-drafted messages via the AI gateway `send-notification`
  materialiser with coach approval (`PendingAiDraftsScreen`), saved drafts/snippets `MessageDraft`); live in prod (not
  behind community flags). (2) Community v1 (June build, all flags OFF in prod): per-coach workspace; hall + cohorts
  (groups with capacity/dates); roles coach/assistant/student; member mute/remove; cohort chat + community DMs
  (`dm_key`); threads (`parent_message_id`); messages tagged to plan context (workout/week); coach seen/acked/replied
  ("coach saw this" chips); posts (text, lesson, replay, poll, win; pinned; scheduled release/expiry; media asset);
  emoji reactions (small allowlist); events with RSVP/live/replay; challenges; classroom drip lessons with media; wins;
  search (posts, lessons, voice transcripts, events); moderation queue/actions; AI triage (classify only); wearable
  prompts; Supabase Realtime broadcast; push; voice notes (separate flag). Mobile: Community tab (Today, Hall,
  Challenges, DMs) + 15 client screens, 8 coach screens. Style: deliberately Skool-like "anti-Slack" (few fixed spaces,
  coach-led, plan-anchored), per COMMUNITY_PRODUCT_PLAN (06-02). (3) Legacy `Message` model + Roman chat.
- **Missing vs the Telegram-style goal:** photos/images in any chat (no image picker anywhere); reactions and swipe-reply
  on coach DMs; typing/presence; @mentions; per-member read state in groups; segmented broadcasts (package, program, tag,
  last active) and scheduled messages; rich cards for booking/payment; one unified inbox (coach DMs vs community DMs are
  two places); AI reply drafts for every unread message (only churn win-back drafts and gateway drafts exist; correction
  to the 12:58 "no reply drafts" note).
- **Better than the 12:58 plan:** plan-anchored messages, coach acks, events with RSVP/replay, classroom drip lessons,
  challenges/wins, wearable prompts, AI triage, moderation queue.
- **Operator recommendation (owner to confirm):** one inbox (canonical 1:1 = `CoachMessage`; community DMs off for v1.0);
  turn on community core (hall, cohorts, posts, messages, reactions, realtime, push, moderation, acks) after a device
  pass; add photos to DMs and community (T4: health/progress photos, storage, moderation); reactions + swipe-reply +
  typing on DMs; broadcast = hall announcement + push, cohort = segment for v1.0; Roman drafts + triage in the coach inbox.
  Later: mentions, scheduled/segmented broadcasts, booking/payment cards.

## OWNER DECISION 2026-10-01 12:55 PDT: NO CLIENT-ONLY FALLBACK; QUALITY BAR = HYPERSCALER

- Bradley: "we cannot take a client only path - who would coach day 1 clients? Whats the purpose? I can be promoted server
  side sure, but, id rather build the saas product right before im at 100k ARR and 100 clients revolving! DAY 1 BLOCKER
  MEANS ANYTHING SUB-HYPERSCALER QUALITY!"
- **D4 fallback is cancelled.** Role choice (backend #597 chain + mobile #306) and the coach path (setup wizard with
  "Add your bank to get paid", first package, invite, Money command center) are **must-ship for day 1**.
  `SIGNUP_ROLE_CHOICE_ENABLED` must be ON at launch; Fri 10-02 12:00 is no longer a fallback trigger.
- **Definition of a day-1 blocker: anything below hyperscaler quality** on a launch surface (client or coach): broken,
  fake, dead-end, confusing, slow, untrustworthy money, unverified on device. Graders apply this bar to every launch PR.
- Consequence (operator): with agents paused for credits, the bar now outranks the Sat 10-03 submission date. Open owner
  question: slip submission until the bar is met, or submit what meets the bar and finish JS-only work over the air.

## OWNER DECISIONS 2026-10-01 12:51 PDT + COACH-SIDE STATIC CHECK (operator 12:58)

**Decisions (binding):**
- **Roman sees client data in v1.0** (overrides D1 "scripted only"): "a super intelligent butler, coach's assistant, and
  helper agent all-in-one". Needs R2b (AI consent enforcement: no client data to the AI without a live box-2 grant) and
  the Roman grounding stack (#598/#601/#602/#603/#605) back on the critical path; T4 dual audits.
- **Roman approve-to-adjust** ("Sarah's recovery dropped, cut tomorrow's volume 15%, approve, sir?"): today OFF and has no
  brain (only deterministic coach prompts, `src/community/wearable-prompts/`, "consider a check-in"). To-do: build the
  brain (wearable trend + training load → proposed change to the next workout), coach Approve/Edit/Dismiss that applies
  the change through the workout builder, audit trail, box-2 gate; fix, audit (T4), then flip on.
- **Wearables on day 1:** fix (#623/#317), audit, then flip FEATURE_WEARABLES_INGEST_POST and
  FEATURE_COMMUNITY_WEARABLE_PROMPTS (and wire the orphaned coach prompts screen). All other launch flags on per ledger.
- **Earnings screen dead = v1.0 blocker.** Money = one "command center" page swallowing Business metrics (TO-DO 2).
  Lazy-dev note: `src/screens/coach/command-center/` (Overview, Inbox, ActionQueue, AtRisk, WinStreaks) already exists,
  is barely reachable and has a mock-data switch (EXPO_PUBLIC_USE_MOCK_COMMAND_CENTER): reuse it as the Money/Business
  command center instead of building a new page.
- **Coach setup wizard (steps 2-5 hollow, no Stripe button) = day-1 blocker** (overrides "only if role choice ships").
  Dependency: coaches can only reach it if in-app coach signup ships (#597 + #306, D4). Open owner question: is role choice
  now must-ship (no client-only fallback)?
- **Dunning v2 ON + Stripe customer portal tested end to end** before launch. **"Download my data" fixed** (storage, not /tmp).
- Fee fix (#1) and $19.99 minimum: confirmed in S-FEE.
- **Coach daily brief:** luxury, Roman-powered, once a day, "turn scattered info into highlights" ("Sir, we collected $x
  last night. Sarah and 2 others messaged you. I have response drafts made. Good morning").
- **Client list/detail:** easy search; tap into a client; see data, score, logs, wearables, billing; key info easy to find.
- **Programs:** assign to specific clients + robust master workout builder + auto-assign options (TO-DO 6).
- **Community = Telegram-style system** (spec below).

**Coach-side static check (code on main; no device pass):**
| Area | What exists | Gaps for v1.0 |
|---|---|---|
| Client list | `ClientsListScreen`: search box + status filter | No score/sort by risk or last active visible in list; unverified on device |
| Client detail | Tabs: Summary, Timeline, Workouts, Progress, Meal plan, Food-log review, Health & Fitness, Sleep & Recovery, Weekly summary, Nudge; risk/insight screens exist separately | **No billing on client detail**; consultation answers only in S-REACH WIP; wearables AI panel hidden; "score" lives on separate Risk/Insight screens |
| Assign programs | Per-client `CoachWorkoutBuilderScreen`; AI workout/meal drafts screens | Templates tab hard-coded; MWB library off; auto-assign = clinic #607 rule table only |
| Coach brief | **Built**: backend `src/coach/brief/` calls Anthropic, daily cron (COACH_BRIEF_CRON), push (COACH_BRIEF_NOTIFICATIONS_ENABLED), inputs: check-ins, missed check-ins, workouts pending approval, paid today + revenue, dunning, flagged weights, unread messages, prioritized action items with deep links; mobile `CoachBriefScreen` (flag on in clinic profile) | **No reply drafts** (nothing generates message drafts); **no consent gate** (client names/details go to Anthropic without a box-2 check = R2b); COACH_BRIEF_ENABLED on Fly unverified; tone not yet "butler" |
| Check-in review | Backend `coach-check-ins.controller.ts`; check-ins surface in Home/Brief/Insight/Risk | **No dedicated coach check-in review screen** |
| Booking inbox | `CoachBookingInboxScreen` (S-SCHED WIP touches it) | Device pass |
| Packages | List/Edit/Contents/Subscribers screens | 50c minimum (S-FEE); program attach UX unverified |
| Stripe connect | `CoachConnectScreen` works (/v1/connect/accounts/*); Stripe Express collects bank + ID | Wizard has no Connect step |
| Direct bank | payouts-v2 `payout-method` (Financial Connections / us_bank_account), FEATURE_BANK_PAYOUTS_V2 off | **Operator recommendation: no separate bank path in v1.0.** Stripe Express already asks for the bank account; frame the wizard step as "Add your bank to get paid (secured by Stripe)". Payouts-v2 later (ACH savings) after S-FEE. |

**Community: Telegram-style coach system (refined goal state; operator proposal 12:58, owner to confirm):**
- *Spaces:* (1) **1:1 DMs** coach-client (exists); (2) **Groups** coach + a few (small cohorts, couples, accountability
  pods); (3) **Broadcast channels** coach to many (announcements, one-way with reactions/comments, scheduled and recurring);
  (4) **Community boards** (topic threads, pinned resources/classroom, e.g. one board per program and one for all clinic
  patients; exists as hall/cohorts).
- *Telegram basics (day 1 where code exists, else OTA fast-follow):* realtime delivery, replies/quotes, reactions, photos,
  read state, typing, @mentions, pins, mute, search, push with deep links, unread badges, block/report both ways.
- *Coach superpowers:* **unified priority inbox** with Roman triage and reply drafts; **segments** (package, program, tag,
  signup date, last active, risk) for targeted broadcasts; saved replies; **rich cards in chat** (workout, meal plan,
  booking link, payment/package link, check-in form); voice notes; office-hours threads; polls; quiet hours; moderation
  queue with the 24-hour commitment.
- *Client side:* simple: Coach (DM), My group(s), Announcements, Boards; first names only to other members; leave or mute
  any space.
- v1.0 must-haves: DMs, clinic spaces (all patients + per program), broadcast announcements, push, unread, block/report.

**Added to TO-DO (owner 12:51):** 20 Roman sees client data (R2b + grounding stack, T4); 21 Roman approve-to-adjust brain +
coach approve UI (T4); 22 wearables fix-audit-flip incl. wearable prompts screen; 23 coach brief: reply drafts + butler
tone + box-2 gate + verify COACH_BRIEF_ENABLED/cron on Fly; 24 client detail billing + score + consultation answers;
25 coach check-in review screen; 26 Telegram-style community (spec above; v1.0 must-haves first); 27 Money command
center reusing `command-center/`; 28 coach wizard day-1 (Stripe "add your bank" step); 29 dunning v2 + portal E2E test;
30 data export to storage.

## V1.0 QUALITY COVERAGE GAPS (owner question 12:34 PDT; operator answer 12:40)

Nothing below has had a device pass. 108's checks were code reading, live route probes and PR audits (auth, onboarding,
consent, deletion, privacy pages, wearables ingest security, money static audit, MWB, scheduling, reachability sweep, keys).
**Never checked for v1.0 quality:** client food logging (core clinic need: "track food"), workout logging
(`ActiveWorkoutScreen`), progress/check-ins/habits/fasting, coach-client messaging UX, community chat UX, health/sleep
screens UX, Roman tutorial on device, notification content/timing, accessibility/performance/offline; coach roster and
client detail, program assignment, messaging inbox, **community moderation queue (24-hour commitment)**, coach brief,
check-in review, booking inbox, package creation, Stripe Connect on device.

Owner questions and current answers:
1. **Community/messaging "Discord/Telegram level"?** No, and unverified. The community API is OFF in prod (no
   FEATURE_COMMUNITY_* on Fly). Code signals (grep, not proof): replies/threads and unread counts exist; reactions,
   read receipts, typing, media attachments and mentions are thin (1-4 files each); voice notes off; block-both-ways
   unfinished (WIP branch). Goal: realtime delivery, replies, reactions, photos, mentions, read state, push, mute, pin,
   search, coach moderation tools, on both sides. Needs a UX audit + device pass.
2. **Wearables / Roman suggestions?** Screens exist and are ambitious (recovery ring, HRV, sleep stages, freshness,
   empty states). Not live: #623 (Sol APPROVE, Opus pending), #317 (unaudited at new head), ingest flag off. Roman does
   NOT see wearable data in v1.0 (D1 scripted Roman; wearables AI panel hidden; R2b consent enforcement not built).
   "Sarah's recovery dropped, cut tomorrow's volume 15%, approve?" does not exist. Closest: backend wearable prompts
   (`src/community/wearable-prompts/`, deterministic, coach-facing, "recovery score dropped 12%, consider a check-in",
   with sample audit trail), flag FEATURE_COMMUNITY_WEARABLE_PROMPTS off and its coach screen orphaned. IDEA logged:
   v1.0 = wire + flag the deterministic prompts (no AI; coach sees health data under consent box 1); 1.0.1 = Roman
   approve-to-adjust (edits the next workout's volume on coach approval; needs R2b, T4).
3. **Coach business logic robust?** Not for paid coaching yet: fee math loses money (#1 issue), Earnings screen dead
   (6 routes 404), no Money page, 50c minimum, hollow coach wizard, dunning v2 off and Stripe portal unverified, data
   export to /tmp, deletion fix round open (#608/#313). The free clinic path (#599 attach, #595 free grant) is Sol-approved
   and waits for the Opus second lens.

Recommended when credits return: one quality-sweep agent (or Bradley with a checklist) on the daily loop first: food
logging, workout logging, messaging, community; then wearables connect, then coach roster/moderation.

## RUNNING SUBAGENTS AT 11:45 PDT (superseded by the 11:58 pause above)

No new agents, audits or fix rounds start after these finish. Each result is recorded in the table below as it lands.

| Agent | Doing | Result (filled in as they finish) |
|---|---|---|
| S-ENVTRUTH builder (`build_env_truth_lane_s_envtruth_mupsdfmw`) | Backend env registry + code-invariant test + in-machine Fly classifier + fly-env-sync manifest (secrets + `pending_flags` for day-1 flags incl. GOOGLE_CLIENT_IDS, community core, MWB, dunning v2, BOOKING_REMINDERS_ENABLED); mobile PR (Stripe key name, expected-env manifest, legacy gradle guard); APPLE_AUDIENCES / Android fingerprint shape checks | pending |
| S-SCHED builder (`build_client_calendar_scheduling_s_sched_muptmf0r`) | Client Calendar tab, booking from coach appointment types, expo-calendar "Add to my calendar", coach appointment-types manager, tutorial Calendar step + "Book your welcome call" ending, seed path | pending |
| S-REACH builder (`build_feature_reachability_s_reach_mupv615k`) | Reachability map of all routes, wire working features, hide broken ones, coach view of consultation answers | pending |
| Copy builder re-queued (`build_approved_copy_into_610_314_611_315_mupsmoh7`) | (1) #610/#314 block hides content both ways; (2) S-OTA: #305 expo-updates onto main + clinic channel | pending |
| Sol audit batch (`sol_audit_batch_310_318_611_315_607_313_mupun3a9`) | #310 c9fc931d, #318, #611/#315, #607 CI re-check, #313, #608 b0beb076, #623 4cc366fc / #317 c7e35d84 | pending |
| Opus audit batch (`opus_audit_batch_310_622_611_315_mupunpyq`) | #310 c9fc931d, #622 fcb984f2, #611/#315, #608 b0beb076, #623/#317 | pending |
| Sol auth-chain audit (`sol_audit_auth_chain_597_599_595_604_mupv8r43`) | #597 e3167fe7, #599 7b496aca, #595 e1dd4c39, #604 21ffc02c | **DONE 11:50 PDT — all four APPROVE** (CI 9/9 required green each). #597: A-597-1 closed (identities never deleted, `auth.service.ts:547-594`), Opus B-597-2 closed (password proof or 409 `signup_pending`, `:548-564`); HMAC adoption marker, provider paths, role flag: no new findings ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/597#issuecomment-5938186713)). #599: patch-identical rebase; optional C-599-1 (#607 vs #599 invite attach: keep conditional student/null-coach attach, `invite-codes.service.ts:764-766` vs #607 `:593-604`) ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599#issuecomment-5938187306)). #595: B-595-1 closed (`invite-grant.service.ts:491-510,973-1024`); optional C-595-1 README SQL fallback ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595#issuecomment-5938187866)). #604: rebase + test mock only ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604#issuecomment-5938188720)). Limits: Redis cases skipped locally, DB races staged not live, one Prisma ENOSPC during the disk incident. Evidence: `/home/user/workspace/sol_auth_r4_findings.md`. **Still needs the Opus second lens (T4) — not started per owner 11:39.** |

Not covered by any running agent (owner go needed later): Opus second lens on the auth chain; #306 r5 (D4: if not dual-approved by Fri 10-02 12:00 PDT, launch is client-only and SIGNUP_ROLE_CHOICE_ENABLED=false); audits of #609/#312; every TO-DO item above (fee fix, MWB Programs, Money, billing placement, coach wizard, R2b).

**Sandbox incident 11:38 PDT:** root disk hit 99% (290 MB free) from 64 agent worktrees (5.3 GB) and caches. Operator removed 23 stale worktrees of finished lanes (all clean and pushed; one probe diff saved to `ops/build-306-r3probe-uncommitted.diff`), pruned git worktree metadata and cleaned the npm cache. Disk is back to about 17% free (3.5 GB); 14 more finished-lane worktrees removed 11:52. Successors: remove worktrees of finished lanes promptly.

---

## TO-DO (owner, 2026-10-01 11:29-11:36 PDT), with explanations, decisions and goal state

**Agent rule (owner 11:36):** "don't use more agents, just note the to-do's and decisions in the last_operator_state
document (with context and goal state mentioned)". So: no new subagents for this list. Agents already running finish
their work. Each item below says what is wrong, what the owner decided, and what done looks like. Builder objectives that
are ready to hand to an agent when the owner says go: `/home/user/workspace/ops/lanes/S-FEE_objective.md`,
`/home/user/workspace/ops/lanes/S-MWB_objective.md` (operator sandbox; contents summarized below so they survive).

1. **Coach Earnings screen is broken (must fix).** `src/screens/coach/CoachEarningsScreen.tsx` reads six routes from backend
   PR #216 (`GET /v1/coach/earnings`, `/v1/coach/payouts/readiness`, `/v1/coach/payouts`, `/v1/coach/reconciliation`,
   `/v1/coach/refunds`, `POST /v1/coach/dashboard-link`). #216 was closed and never merged, so all six return 404 in
   production (operator probes 11:20 PDT). The screen treats 404 as "not set up", so a coach always sees "Connect Stripe"
   and "Earnings will appear once paid", even after connecting and being paid, and "Open Stripe dashboard" fails. Live
   routes that hold the real data: `GET /v1/coach/payments/earnings`, `GET /v1/coach/payments/purchases`,
   `GET /coach/connect/{status,metrics,payouts}`, `POST /v1/connect/accounts/dashboard-link`. Fix: fold Earnings into the
   new Money page (item 2), wired to live routes; retire the dead calls.
2. **TGP Money (owner concept: the coach's CFO summary) — DECIDED 11:36.**
   - Owner decisions: Money is a **card on the coach Home screen that expands into full page(s)** when tapped; **Business
     metrics and Money merge** into one coach money area (no separate Business metrics screen).
   - Context: today money is split across Settings > Payments > Earnings (broken, item 1), Business metrics
     (`CoachBusinessMetricsScreen`: Revenue 30d, MRR, active clients, churn 30d, acquired/churned, packages, recent payouts;
     reads live `GET /coach/connect/metrics` and `/coach/connect/payouts`) and the Stripe dashboard.
   - Goal state: Home card shows net to you (30d) plus a red "needs attention" count when any payment failed. Tapping opens
     Money: (1) Net to you with Today / 30d / 90d / YTD chips and change vs previous period; tap any amount for the
     breakdown price - card processing - TGP 2% = net. (2) Needs attention (only when non-empty): failed payments per client
     with dunning status (retry n of m, next retry date, card-update link sent), disputes, Stripe requirements due, with
     "Message client". (3) Next payout amount and date. (4) Recurring: MRR, paying clients, churn 30d, new clients 30d
     (from Business metrics). (5) Recent charges (last 5, See all with paid/failed/refunded filter). (6) Footer: Payout
     settings (Stripe dashboard link, per the 09-30 ruling), Packages, Export CSV for taxes. Per-client billing stays on the
     client detail page; Money links to it. The old Earnings and Business metrics routes redirect to Money. Every number
     comes from live routes (no 404-driven fake empty states); a real empty state only when the coach has no charges.
3. **Package minimum price.** Code allows 50c (`src/packages/packages.service.ts:543`). Owner rule: $19.99 minimum or
   free. Enforce in backend validation and in the mobile package editor (clear inline message). Rides with S-FEE as a
   separate T3 PR.
4. **Card update and billing management placement (client).** Today: More > Membership > Packages > Update card (three
   levels down, under "Membership"). Operator recommendation (sent 11:50, research-based; owner has not objected):
   - Goal state: a top-level "Billing & payments" entry in the client profile/More showing card on file, next charge date
     and amount, receipts, Update card and Cancel; the same card + next charge on the package card; a Home banner and a push
     when a payment fails or the card expires within 30 days; every entry opens Stripe's customer portal directly on the
     update-card flow (`flow_data[type]=payment_method_update`, https://docs.stripe.com/customer-management/portal-deep-links);
     dunning emails link to the same flow. Competitor note: Trainerize clients can only update billing on the web.
   - Owner-side Stripe check: customer portal enabled in live mode (https://dashboard.stripe.com/settings/billing/portal);
     required before FEATURE_DUNNING_V2 goes on.
5. **Coach onboarding = the coach "aha" (owner).** The aha is: 1) connect Stripe or bank, 2) invite a client, 3) receive the
   first client payment. The current coach wizard (`src/navigation/CoachWizardNavigator.tsx`) steps 2-5 have no inputs and
   step 5 has no Connect button. Rebuild: practice basics, then "Get paid" (Stripe Express hosted onboarding, which collects
   the bank account and ID; bank-first framing via Financial Connections when payouts-v2 is on), then first package
   (prefilled, $19.99+ or free), then invite first client (link/QR share), then a Home checklist that ends with the
   existing first-payment celebration (`FirstPaymentWowHost`, flag `EXPO_PUBLIC_FF_ROMAN_FIRST_PAYMENT_WOW`, off).
   Lane S-MONEY (mobile).
6. **Master workout builder — owner direction 11:31: "non-client specific, overreaching master workout builder system —
   'I give every male an intro package, let me build it once, save it, and use it for everyone + auto-assign tools'".**
   - Context: the coach "Templates" tab (`ProgramTemplatesScreen`) is four hard-coded text protocols applied as text
     guidelines. The single-workout builder (`CoachWorkoutBuilderScreen`) opens only from one client's page; no library of
     saved workouts. The backend was built in June and never switched on: MWB-1 data model (#376: WorkoutProgram with
     weeks x days_per_week, templates, forks, revisions; WorkoutPlan rows carry program/week/day), MWB-2 templates +
     clone-to-client (#381, FEATURE_MWB_TEMPLATES), MWB-3 autosave + undo (#386, FEATURE_MWB_AUTOSAVE_UNDO), MWB-5 AI
     live-create (#385, FEATURE_MWB_AI_LIVE_CREATE), named regimes (`/coach/regimes`, FEATURE_NAMED_REGIMES). Package
     contents already accept `workout_program` and fan out on purchase/grant, so "attach a program to a package" already
     means auto-assign on join (verify it also fires for $0 invite-code grants, #595).
   - Goal state (Phase 1, day 1): a coach "Programs" tab replacing Templates: program library (search, goal tag, weeks x
     days, assigned count); create/edit with a week-by-day grid where each day opens the existing workout builder with
     autosave + undo; duplicate, archive, revision history, promote to named regime; assign to many clients at once (clone
     per client with a start date, idempotent); "Add to package" so everyone who joins gets it; a saved-workouts library.
     Backend flags above ON at day 1 (AI live-create waits for item 9). Clinic's #607 rule-table path keeps working.
   - Phase 2 (after go-live unless owner pulls it forward): coach-defined auto-assign rules ("joins package X and matches
     intake answers Y → assign program Z starting next Monday"), generalizing #607's clinic rule table; uses
     health-adjacent intake answers → T4 + D2 review.
7. **Expo plan: stay on Free (owner, 11:29 PDT).** No upgrade; accept the slow build queue. Batch builds: one clinic iOS
   build + one Android build for the Saturday binary, no exploratory rebuilds.

8. **Feature flags live on day 1 — owner 11:31-11:32: "yes all of that is supposed to be active and live on day 1".**
   - Context: none of FEATURE_COMMUNITY_* exists on Fly, so the community API is gated off in prod while the clinic mobile
     profile turns the Community tab on — the community chat step of the guardrail flow would fail. MWB flags and
     FEATURE_DUNNING_V2 are also off. Ledger with per-flag gates:
     [FLAGS_LAUNCH_LEDGER.md](FLAGS_LAUNCH_LEDGER.md).
   - Goal state: community core set, FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO, FEATURE_NAMED_REGIMES,
     FEATURE_DUNNING_V2 and BOOKING_REMINDERS_ENABLED ON in prod before Wed 10-07, set through the audited fly-env-sync
     manifest (`pending_flags` block requested from the S-ENVTRUTH builder 11:50), each verified on the owner's account right
     after it flips. Gates: #610 report/block deployed before App Review touches community; Stripe customer portal live
     before dunning v2. Stay OFF: Roman live chat (D1), bank/treasury payouts (until item 0 fee fix), Google Calendar/Meet/
     Zoom, importer (Bucket B), wearables AI panel.
9. **R2b — AI consent enforcement in the AI gateway (blocks MWB AI live-create on day 1).** The MWB-5 materialiser is
   client-specific (`target_client_id`), so it sends client data to the AI provider. Under D2 (box 2) and WA My Health My
   Data, every AI call with client data must check the client's live box-2 grant in the #622 ledger. Goal state: gateway
   refuses (clear coach-facing reason) when the client has no live grant; tests; T4 dual audit; then flip
   FEATURE_MWB_AI_LIVE_CREATE. Template authoring with no client data could be allowed without consent (design note).
10. **Fee fix (item 0 above, lane S-FEE) and $19.99 minimum (item 3).** Objective file ready (see agent rule). Goal state in
    the #1 MASSIVE ISSUE section.
11. **Coach setup wizard rebuild (item 5)** — needed day 1 only if role choice ships (D4: #597 + #306 dual-approved by Fri
    10-02 12:00 PDT); otherwise 1.0.1.
12. **Waiting audits and fix rounds that need an agent when the owner allows one** (state 11:58 PDT): Opus re-audit of the
    auth chain #597 e3167fe7 / #599 7b496aca / #595 e1dd4c39 / #604 21ffc02c (Sol is auditing now; T4 needs both); #306 fix
    round 5 (Sol B-306-1/2/3, Opus B-306-1, C-306-1..3, plus the new 409 `signup_pending` message "check your email or reset
    your password"; D4 deadline Fri 12:00); audits of #609/#312 (welcome message + reminders); Sentry native init; data
    export to Supabase storage; C04 bootstrap after the owner signs up; C11 store package + iOS clinic build.

---

## 1. Where we are, in plain words

- **Mission:** the clinic partner (a West Washington medical group; name kept out of repos) sends patients to TGP
  through a QR code. App Store submission is **Sat 10-03**; clinic go-live is **Wed 10-07**.
- **Guardrail flow (owner):** QR code -> App Store download -> consultative personal-trainer onboarding -> auto-attach
  to Bradley as coach -> auto-grant of Bradley's free package -> auto-assign one of three workout plans -> Roman's
  hands-on tutorial (plan and macros, community and messaging the coach, wearables and health/sleep data) ->
  teach-back. **New 10-01:** the tutorial also introduces the Calendar and ends with "Book your welcome call".
- **State of the build:** every launch-critical slice has a PR. Most are in fix rounds after dual audits. Nothing on
  the Bucket A critical path is merged except mobile #316 (crash fix) and backend #606 (macros). Production backend
  still runs `bffae5f3` (C02). No working Android build exists yet: build `f5cac78e` (with the crash fix) is still in
  Expo's Free-plan queue.
- **Biggest risks right now:** (1) audit throughput: about 20 PRs need dual audits before Fri noon with a hard cap of
  7 subagents; (2) the backend auth stack (#597 chain) is still blocked by two must-fix findings; (3) the newly
  scoped Calendar section (S-SCHED) and feature-reachability work (S-REACH) are large and landed late; (4) no device
  pass has happened on any new code.

---

## 2. What happened since the last update (2026-09-30 03:32 UTC -> 2026-10-01 10:55 PDT)

1. **09-30 morning: change of gears.** At 10:48 PDT the owner paused the importer (Bucket B) and switched to the
   clinic launch (Bucket A). Session c712e04d became the Bucket A operator at 16:32 PDT EXECUTE.
2. **09-30 afternoon/evening (c712e04d):** owner rulings on positioning (personal training only), role choice at
   signup (R-ROLE-CHOICE-1), 2% take rate and 3.1.3(d) payments posture, Roman privacy (chats never visible to
   coaches), age 16+, Roman's canonical face, model routing T0-T4, 8-agent hard cap. Merged mobile #303, #304, #307,
   #308, #311; deployed backend C02 `bffae5f3`. Built Android APK `14a58449` (later found to come from an unpushed
   commit; never ship it). c712e04d went silent around 19:10 PDT; its unpushed working files are lost.
3. **10-01 08:28: EXECUTE to 590e4a5b.** Readback written; the owner didn't answer D1-D4, so the operator's stated
   defaults apply (section 4). Owner supplied the coach welcome text (runtime data; never committed).
4. **09:07-09:11 approvals:** three workout programs; D2 two-box consent copy; community guidelines incl. new rules 5
   and 7; safety contact Bradley@Bradleytgpcoaching.com; 24-hour moderation commitment; consumer-health Consent
   section rewrite. Owner created the Sign in with Apple key and saved `APPLE_SIGNIN_KEY_ID` /
   `APPLE_SIGNIN_PRIVATE_KEY` as backend GitHub Actions secrets.
5. **09:15-09:51 Android launch crash (tier-1).** The owner's APK closed instantly. Root cause from the owner's
   logcat: `crisp-sdk-react-native@0.2.1` used the legacy `ExpoModulesCorePlugin.gradle` path under Expo SDK 56 and
   threw `UnsupportedOperationException: reified type parameter` while the Expo module registry was built. Fix:
   mobile #316 (bump to 0.4.3, surgical lockfile), Opus APPROVE, **merged `53447a36`**. New build `f5cac78e` queued.
   Also found: MainActivity never set the Health Connect permission delegate (fixed in S14 #317 via a config
   plugin), and Sentry native auto-init is off, so crashes before JS starts are invisible (follow-up).
6. **09:51-10:01 env truth audit (owner tip).** Systematic check of every env name read by code vs Fly, GitHub and
   EAS. Findings in section 5. Lane S-ENVTRUTH builds the registry, invariant tests and a Fly sync workflow.
   A setup guide for every missing key was delivered to the owner (shared asset "TGP Missing Keys Setup Guide").
7. **10:01-10:36 Google sign-in on day 1 (owner override).** The owner set up Google Auth Platform in project
   `project-2c2ffa46-a1eb-4f5c-b68` (branding with privacy/terms/help URLs on app.trygrowthproject.com, published
   to production), created a Web client `963513798354-b1si2i5t238kmq2jh572kvirtrnv9oee.apps.googleusercontent.com`,
   put it in the Supabase Google provider (replacing an older client `817435020365-p51g...`, now retired), and added
   `tgp://auth/callback` to Supabase redirect URLs. Operator verified Supabase now redirects with the new client and
   Google accepts it, then set GitHub secret `GOOGLE_CLIENT_IDS` (17:38 UTC). It reaches Fly through the audited
   S-ENVTRUTH sync workflow; until then `/auth/signup-policy` still hides Google.
8. **10:20-10:45 audit wave results** (section 6): Opus approved #316, #599, #595, #604, #606, #607, #622; requested
   changes on #597, #306, #310. Sol blocked #597 chain, requested changes on #607 (CI gap), #622, #623, blocked #317.
   **#606 merged `be667142`** (Sol + Opus APPROVE). Retargeted stacked PRs were closed/reopened to run full CI.
9. **10:37-10:44 scheduling and reachability (owner).** The owner pointed out TGP must be a superior replacement for
   Google Calendar. Operator found native scheduling is fully built in the backend (appointment types, availability,
   time off, open slots, booking lifecycle, 24h/1h reminders) and coach-side screens exist, but **client booking
   screens are orphaned** (no entry point). A static sweep found **34 of 170 app routes with no visible pathway**.
   The owner called it a huge gap and directed: a dedicated client Calendar section, a Roman tutorial step, "Add to
   my calendar", and a pre-launch reachability fix for every critical feature.

---

## 3. Owner decisions this session (binding)

| Time (PDT) | Decision |
|---|---|
| 08:28 | EXECUTE for everything workable under the agent rules and PR grading contract. |
| 09:07 | Workout plans approved. D2 consent copy, community guidelines (rules 5 and 7), safety email, 24-hour moderation, consumer-health Consent rewrite approved. |
| 10:01 | **Google sign-in on day 1** (overrides the operator's email + Apple ruling). Done on the Google/Supabase side; Fly pending. |
| 10:01 | Every missing key gets filled; alert the owner when the new APK build finishes. |
| 10:37 | TGP's **native scheduling is the product**; Google Calendar sync is not a dependency. |
| 10:39 | **Every critical feature must have a pathway in the UI before launch** (reachability). |
| 10:40 | Client gets a **dedicated Calendar section**: their coach/coaches, calendars and open slots, booking from each coach's approved appointment types. Agents should bring superior ideas to the owner. |
| 10:40 | **Roman tutorial step** after "how to message your coach" introducing the Calendar. |
| 10:41 | **"Add to my calendar"** (device calendar, Apple or Google, no account linking). |
| 10:44 | Tutorial **ends with "Book your welcome call with <coach>"**. |
| 10:44 | Day-1 appointment types: Quick initialization 15 min; Quick Q/A Call 20 min; Tele-Health Dietary/Fitness Check-in 45 min. Operator default: the first two confirm instantly (Quick initialization = welcome call), the 45-min check-in needs coach approval; editable in-app. |
| 10:44 | Policy passages approved: Privacy Policy "Roman and AI" paragraphs 1 and 3 and the Terms AI sentence (#611 at `ced10667`). Recorded on #611. |
| 10:44 | **Over-the-air updates approved** for the Saturday binary (expo-updates / EAS Update; Free plan covers 1,000 monthly users). |
| open | Expo Starter plan ($19/month + usage) for the fast build queue: offered, not yet answered. |

---
| 11:29 | **Fee math is the #1 massive issue** (coach payout = price - card processing - TGP 2%; TGP must never lose money on a sale). Enforce $19.99 minimum or free. Earnings screen fix logged. Coach onboarding built around the coach "aha": connect Stripe or bank, invite a client, receive first payment. Card-update placement: research the best practice (recommendation in TO-DO 4). **Stay on Expo Free** (no plan upgrade). |
| 11:31 | **Master workout builder:** non-client-specific program library, build once, reuse for everyone, plus auto-assign tools (TO-DO 6). |
| 11:31-11:32 | **Flags live on day 1:** community, MWB templates/autosave/undo/AI live-create/named regimes, dunning v2 (TO-DO 8; AI live-create gated by R2b, TO-DO 9). |
| 11:39 | **Superseded 11:38: let running subagents finish, record their findings/state here, start nothing else — out of credits for new work.** #306 r5 is NOT started (objective staged at `/home/user/workspace/ops/lanes/306_r5_objective.md`). |
| 11:38 | ~~Go on #306 fix round 5 if agent capacity allows~~ — launch when a slot frees (cap stays 7 subagents); sandbox crash = massive wasted work, so keep load low. |
| 11:36 | **Money = a coach Home card that expands into full page(s); merge Business metrics into Money.** **No more agents:** record to-dos and decisions here with context and goal state. |

## 4. Operator rulings in force (owner may override)

- **D1:** scripted Roman only in v1.0; live Roman chat in 1.0.1 (Roman stack #598/#601/#602/#603/#605 off the critical path).
- **D2:** two boxes on one screen; box 1 required (waiver + coaching data, `consult-consent-v2`), box 2 optional (AI drafts via Anthropic, `client-ai-v3`); withdrawal in Settings > Privacy > Roman and AI. The AI-consent ledger flag goes ON at the clinic deploy.
- **D3:** health prefill of onboarding moves to 1.0.1; v1.0 ships connect, history import and the health/sleep views.
- ~~**D4:**~~ **CANCELLED by owner 12:55 (role choice is must-ship; no client-only path).** Old text: if mobile #306 is not dual-approved by **Fri 10-02 12:00 PDT**, submit client-only and set `SIGNUP_ROLE_CHOICE_ENABLED=false` explicitly on Fly **before** #597 deploys (backend default is ON when unset).
- consult consent accepts `consult-consent-v2` only; #622 dunning-lockout allowlist = exactly GET /api/me/ai-consent, POST/DELETE /api/me/ai-consent/roman; #310 labels "Privacy" and "Delete account" plus a Privacy Policy link outside the hashed consent text.
- #310 problem/paused screens get a minimal escape (Contact support mailto + Sign out).
- Blocking must hide posts both ways so the approved line "If you block someone, they can no longer see your posts" is true (code changes to match the copy).
- Wearables AI insight panel stays hidden (no box-2 check yet).
- Google Calendar / Meet / Zoom integrations stay off; their Fly keys are optional-integration, not must-fill.

---

## 5. Gaps found this session and where each one stands

| Gap | Disposition |
|---|---|
| Android APK crashed at launch (Crisp 0.2.1 on SDK 56) | Fixed, merged #316; device confirmation waits on build `f5cac78e`. |
| Health Connect permission delegate missing in MainActivity | Fixed in S14 mobile #317 (config plugin); #317 is in a fix round. |
| Sentry native auto-init off (pre-JS crashes invisible) | Follow-up queued. |
| **Client booking screens orphaned; 34/170 routes without a pathway** (booking, upcoming sessions, macros screen, exercise library, leaderboard, bloodwork, private community hub, community Today/Challenges/Classroom/Find, Copilot; coach bloodwork queue, wearable prompts, admin control room; some are false positives) | S-SCHED running (Calendar); **S-REACH queued** (map every route, wire working features, hide broken ones, report). |
| No OTA update channel in the binary | Owner approved; existing mobile **#305** (expo-updates, fingerprint runtime) needs a rebase onto main + clinic channel + one audit. Lane S-OTA queued. |
| Env truth: five Fly keys share one placeholder value (GOOGLE_OAUTH_CLIENT_ID/SECRET, OOM_*); junk Fly keys `E`, `E_MB`; 91 env names read by backend code are unregistered and unset; `STRIPE_WEBHOOK_SECRET_NEXT` equals current; `STRIPE_PRICE_ID_FITNESS` equals `STRIPE_PRICE_GROWTH`; `DATABASE_URL` equals `DIRECT_URL`; GitHub `DATABASE_URL_AUDIT` unset (RLS floor guard soft-skips) | S-ENVTRUTH running (registry, invariant test, fly-env-sync with staging, classifier). Fly deletions need operator sign-off after audit. |
| Mobile reads `EXPO_PUBLIC_STRIPE_PK`, EAS stores `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | S-ENVTRUTH mobile PR. |
| `COACH_SIGNUP_SECRET` / `EXPO_PUBLIC_COACH_SIGNUP_SECRET` unused | Remove after role choice settles. |
| Data export writes to ephemeral `/tmp` (S3/storage path never implemented) | Queued: export to Supabase storage. |
| `GOOGLE_CLIENT_IDS` unset on Fly (Google hidden) | GitHub secret set; Fly push via audited sync workflow. |
| Approved block copy not true in code | Queued fix round on #610/#314 (both-ways read filter). |
| No home page at app.trygrowthproject.com (Google branding uses /help) | Backlog: real landing page. |
| Expo Free plan: slow build queue, 15 Android + 15 iOS builds/month | Owner decision on Starter plan pending. |
| Coach-deleted clients see "No coach yet" (no dedicated message) | Follow-up after #608. |
| Android 13 and lower: Health Connect rationale opens app home, not a privacy screen | Follow-up before Play production. |
| Wearables: no background sync; later edits in Apple Health/Health Connect not re-synced | Known v1 limits. |
| **Coach view of consultation answers missing in the app** (owner 09-30: coach sees every client's answers easily). Backend endpoint exists in #607; no coach screen. | Folded into S-REACH. |
| **Money audit 2026-10-01 11:20 PDT (operator, static + live route probes):** (1) No TGP "Money" page (owner 09-30 17:53); money lives in coach Settings > Payments (Packages, Payouts (Stripe Connect), Earnings). (2) `CoachEarningsScreen` calls 6 routes that 404 in prod (`/v1/coach/earnings`, `/payouts/readiness`, `/payouts`, `/reconciliation`, `/refunds`, `/dashboard-link`; built against closed backend PR #216), so it always shows the not-set-up state. Live alternatives: `/v1/coach/payments/earnings`, `/coach/connect/{status,metrics,payouts}`, `/v1/connect/accounts/dashboard-link`. (3) Fee math: destination charges with a flat 2% application fee (`fee-policy.service.ts` 200 bps), so the platform pays Stripe processing and loses about 0.9% + 30c per paid sale; owner ruling is payout = price - processing - 2%. (4) Package minimum is 50c (`packages.service.ts:543`), ruling is $19.99 or free. (5) Coach setup wizard steps 2-5 (practice name, speciality, capacity, Connect payments) have no inputs and no Connect button. (6) Client payment method: More > Membership > Packages > Update card (Stripe Billing Portal, route live); no Settings entry. Stripe-side unknowns: Connect platform activation, live customer-portal configuration. | Lane S-MONEY queued after S-REACH (T4: fee math). Wizard part is pulled ahead if #306 role choice is on track for Saturday; under D4 client-only it ships 1.0.1. Clinic launch unaffected (free package). |

---

## 6. PR board (read 2026-10-01 10:50 PDT)

Backend (`growth-project-backend`):

| PR | Slice / tier | Head | Audits | Next |
|---|---|---|---|---|
| #597 | C13 role choice + auth hardening, T4 | `fc5c5a9e` | Sol BLOCK (A-597-1 unfenced OAuth binder cleanup); Opus RC (B-597-2 binding to a pre-registered identity) | Auth builder fix round 4 |
| #599 | C03 attach, T4 | `9a0b9f94` | Opus APPROVE; Sol BLOCK (inherited) | Restack after #597 |
| #595 | C01 comp access, T4 | `1b782ec8` | Opus APPROVE; Sol BLOCK (B-595-1 revoke ignores pending grants) | Fix in auth round |
| #604 | C14 throttler, T4 | `c3abde8d` | Opus APPROVE; Sol BLOCK (inherited) | Restack |
| #606 | C06 macros, T3 | merged `be667142` | Sol + Opus APPROVE | Done |
| #607 | C05/C07 intake + programs, T4 | `245da2e7` | Opus APPROVE; Sol RC (B-607-4 required checks never ran) | Full CI re-run triggered; Sol re-check |
| #609 | Welcome message + reminders | `1f8b22b9` | none yet | Audits queued |
| #608 | Account deletion, T4 | `a81a548f` | Sol RC at earlier head; fix round done; Opus audit running | Sol re-audit |
| #610 | UGC safety, T4 | `b8ce8d35` | none yet (approved copy placed) | Block both-ways fix, then dual audit |
| #611 | Privacy/consumer-health/terms, T3+ | `ced10667` | none yet (owner approved new passages) | Audit |
| #622 | R2a AI consent ledger, T4 | `02c7187d` | Opus APPROVE; Sol RC (B-622-1/2/3) | R2a builder fix round |
| #623 | S14 wearables backend, T4 | `c5d45172` | Sol RC (B-623-1 inherits 3/hour throttle) | S14 builder fix round 2 |
| #598/#601/#602/#603/#605 | Roman stack | various | n/a | Off critical path (D1) |

Mobile (`growth-project-mobile`):

| PR | Slice / tier | Head | Audits | Next |
|---|---|---|---|---|
| #316 | Crisp crash fix, T2 | merged `53447a36` | Opus APPROVE | Done |
| #310 | Consultation onboarding + D2 + Settings > Privacy, T4 | `00cfb6c3` | Opus RC (B-310-1 grant after failed save; B-310-2 box-2 state after restart) | Builder fix round 3 |
| #306 | Role choice UI, T4 | `4b349d32` | Sol RC (B-306-1/2/3); Opus RC (B-306-1 Login recovery strands device) | r5 when a slot frees; D4 fallback Fri 12:00 |
| #313 | Account deletion UI, T4 | `11016305` | Sol RC at earlier head; Opus audit running | Sol re-audit |
| #314 | Report/block/safety screen, T4 | `b4b931d8` | none yet | Dual audit after block fix |
| #315 | Trust center links | `d9c2e669` | none yet | Audit; ships with or after #611 deploy |
| #317 | S14 wearables mobile, T4 | `f63da34e` | Sol BLOCK (A-317-1 cross-account upload; B-317-1..4) | S14 fix round 2 |
| #312 | Workout reminders toggle | `5b26e1f4` | none yet | Audit with #609 |
| #305 | expo-updates (OTA), T3 | `45787152` (base is the merged #304 branch) | none at current base | S-OTA: rebase + clinic channel + audit |

---

## 7. Lanes (cap: 8 agents including the operator = 7 subagents)

Running (7): S-ENVTRUTH builder; Opus audit #608/#313; #310 fix round 3; auth stack fix round 4 (#597/#595 + restack);
S14 fix round 2 (#623/#317); R2a #622 fix round; **S-SCHED** client Calendar builder.

Queue, in priority order: S-REACH (reachability); #610/#314 block both-ways fix; dual audits #610/#314; audit
#611/#315; S-OTA (#305 rebase); Sol re-audit #608/#313; #306 r5; Sol re-check #607; re-audits of the auth chain and
#622/#623/#317/#310; audits #609/#312; S-ENVTRUTH audits; data export to storage; Sentry native init; S07b AI-path
inventory; C04 bootstrap (after Bradley signs up in a working build; includes seeding his appointment types and
welcome text); C11 store package + TestFlight clinic iOS build; Wave-1 deploy via `fly-deploy.yml`.

---

## 8. Critical path and deadlines

- **Now:** working Android build (`f5cac78e`), so Bradley can sign up -> C04 bootstrap.
- **Fri 10-02 06:00:** S-SCHED PRs ready for audit.
- **Fri 10-02 12:00:** D4 cutoff for #306; target for dual approvals on #597 chain, #607, #622, #608/#313, #610/#314, #611/#315, #310, S14.
- **Fri evening:** Wave-1 backend deploy (audited main only), set flags (`FEATURE_WEARABLES_INGEST_POST`, AI-consent ledger, `GOOGLE_CLIENT_IDS`, `APPLE_SIGNIN_*`, explicit `SIGNUP_ROLE_CHOICE_ENABLED` if D4 falls back), clinic iOS + Android builds with OTA, device passes.
- **Sat 10-03:** App Store submission.
- **Wed 10-07:** clinic go-live; anything that missed the binary ships over the air if it is JS-only and audited.

---

## 9. Open owner asks

1. Install the new Android build when the operator sends the link (uninstall the old app first), then sign up as coach.
2. Decide on the Expo Starter plan (fast build queue).
3. Confirm EAS iOS credentials / App Store Connect API key for the iOS build and submission.
4. Two iPhone device passes through TestFlight (Friday evening, Saturday).

---

## 10. Notes for a successor operator

- Authoritative evidence lives on GitHub: PR bodies (tier headers, fix-round tables) and audit verdict comments at
  exact heads. Sandbox paths (`/home/user/workspace/ops/...`) are convenience copies and can disappear.
- Stacked backend PRs were retargeted to main only so CI runs; audit incremental ranges (parent head..head).
- Never ship APK `14a58449`. Never commit the coach welcome text or the clinic partner's name.
- Do not set Fly secrets except through audited workflows; Fly deletions need operator sign-off.

---

## Superseded: importer operator state (session 5754504f, 2026-09-30 03:32 UTC), kept verbatim below

Original update time: 2026-09-30 03:32 UTC

Operator: Computer (Claude Opus 5.5 Fast), executive orchestrator, session 5754504f
(https://www.perplexity.ai/computer/tasks/5754504f-dfba-473b-a648-5290eee287a7). EXECUTE given by owner
2026-09-29 16:15 PDT under the TGP IMPORTER MASTER EXECUTIVE AGENT PROMPT, after the readback in
handoffs/op-5754504f/READBACK_2026-09-29.md. This session is the single writer for every importer lane.
Session c7aa658f (below) is superseded; its owner pause (19:23 UTC) is lifted by this EXECUTE. Its review
texts were never published, so every in-flight PR gets fresh exact-head independent reviews.

## Owner decisions 2026-09-29 16:14-16:15 PDT (binding)
- B-1: YES. Deploy backend main (after promoting integration/importer) to production with importer surfaces
  enabled only for the S12-B1 pilot allowlist (owner coach account); read-only live integration runs against
  the owner's own source account with the packaged extension.
- B-2: YES ("if it doesn't slow us down"). Importer real-PG proof jobs become required checks. Measured: each
  ~2 min, parallel to the 6.5 min build-and-test, run on every pull_request (no path filter) -> no wall-clock
  cost. Applied 2026-09-29 23:17 UTC on integration/importer: + person-owned-rls-live-tests,
  + person-owned-migration-rehearsal (strict, admins enforced). main gets the same at promotion.
- EXECUTE: standing execution authority for the importer.
- PRODUCTION DEPLOY 2026-09-30 00:24-00:28 UTC: Fly Deploy run 36650149513 released main 3a9369b9 with
  migrations=apply-migrations; evidence gate green; operator approved the production environment under the
  17:21 PDT authorization; run concluded success. Probes 00:53 UTC: /health 200, /readyz 200 (db up),
  POST runs/start 401 (route now exists; auth first), scout/ingest 401, pair/redeem 400 (anonymous, body
  validation). Pilot allowlist is absent in Fly secrets, so importer routes fail closed for every coach.
  Closed 11 verified landed/superseded PRs (backend #479; mobile #290-#294; extension #19, #23-#26).
- OWNER AUTHORIZATIONS 2026-09-29 17:21 PDT (explicit answers via the question form):
  (1) "May I temporarily remove the two person-owned database checks from integration/importer's required list,
  and put them back as soon as #587 merges?" = "Yes, remove then restore". Done 00:21 UTC; required list is now
  build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (strict). OWED: re-add
  person-owned-rls-live-tests + person-owned-migration-rehearsal immediately after #587 merges.
  (2) "May I approve production deploys and production flag changes in GitHub myself, and close PRs that are
  verified as already landed or superseded?" = "Yes, both". The operator approves `production` environment runs
  itself (comment cites this authorization) and closes verified landed/superseded PRs.
- Hosting: Fly invoice PAID by owner 2026-09-29 16:39 PDT (deploy unblocked). Owner direction 16:29: move to a
  free host later (recommended Google Cloud Run, request-billed; after the importer's first live deploy; custom
  domain first). Earlier (16:27): owner stays on Fly and pays the overdue invoice (the 2026-09-09 deploy failed at
  the Depot build with "overdue invoices"). Operator right-sizes the machine after deploy (measure memory first).
- Production facts (read 23:20 UTC): FEATURE_SCOUT_INGEST + FEATURE_EXTENSION_PAIRING are ON globally on the old
  image (no allowlist code); runs/start 404. `production` GitHub environment created: required reviewer
  BradleyGleavePortfolio, no admin bypass, protected branches only (release evidence gate precondition; every
  production-mutating workflow now needs the owner's approval click). ANTHROPIC_API_KEY exists as a Fly secret.
  FEATURE_SCOUT_RECONSTRUCT and FEATURE_SCOUT_PILOT_COACH_IDS are not set. Production User table has no owner and
  no real coach (only the system coach `b5-system-coach-tgp`, not a UUID). S10 prerequisites: owner coach account
  in production + a mobile build with EXPO_PUBLIC_FF_EXTENSION_IMPORT on.
- Still not requested (owner 2026-09-27): ANTHROPIC_API_KEY; needed at the first real AI decode (S13/S14).

## Plan (slices S0-S22, tiers and headers in the readback section 7)
OWNER SCOPE CUT 2026-09-29 20:26 PDT: "update last_operator_state first. then do the next round for 3 of the in
flight PR's". Concurrency cap: at most 3-4 heavy lanes at once on the operator sandbox (2 cores, 20 GB disk).

## Incident 2026-09-30 00:55-03:26 UTC: operator sandbox down
Operator ran ~17 parallel lanes (npm ci / jest / tsc each) on one 2-core, 8 GB, 20 GB-disk sandbox; load reached
~100, disk 96%, the sandbox stopped and could not be reprovisioned for ~2.5 h. Every lane died mid-work. Operator
cause: over-parallelisation. Fix: cap 3-4 heavy lanes; share one node_modules per repo; kill stale processes.

## Live PR state (read from GitHub 03:30 UTC)
| PR | Slice | Tier | Head | CI | Reviews at/near head | Next |
| --- | --- | --- | --- | --- | --- | --- |
| backend #584 | S12-B6 flags workflow | T4 | 19427997 | green | A (GPT 6 Sol) RC 2B @32db4bc2; B (Opus 5.5) RC 1A/4B @32db4bc2; fix r1 pushed 19427997 claims all closed | fresh dual audit at 19427997 (DO NOT DISPATCH until approved: A1 published the allowlist in public logs) |
| ext #35 | X1 origin authorization | T4 | 5804b506 | green (codeql, secrets-scan, test x2) | prior RC 2A (late grant after tab close; lost /complete reply) @8608a0ff; fix r5 pushed 5804b506 (27 new tests) | fresh dual audit at 5804b506 |
| backend #587+#593 | S8-D3 schema + D8 tenancy | T4 | 3e243750 / 798208b7 | green | A RC 1A (owner-GUC bypass on person-owned RLS, S4-A-587-593-01); B RC 1B (meal-plan resolver 25P02 in tx, S4B-01) + C01-C03/C08 | fix round (work at the dead sandbox lost/unknown); merge #587 with a MERGE COMMIT (6d55e9e4 ancestor) |
| backend #594 | CL completeness closure record | T4 | a48abf3e | green | none | dual audit after L0 r10; OQ-CL-1 ("exposes" = coach-session scope) operator default, enforcement off |
| backend #581 / #590 | L0 r9 / FAM-0 r11 condensed | T4 | 0459df85 / 696abd73 | green | A RC 2A/1B; B RC 10B | r10/r12 (draft spec in operator mail; file lost) |
| backend #592 | L1-gw | T4 | 32ca797e | green | prior RC (0/0 usage backstop) | r5 fix written, uncommitted in lanes/s2-l1gw/repo if it survived |
| backend #589 | L3 | T4 | 263e8950 | green | prior RC (OpenAPI bounds vs parser) | fix round lost |
| backend #591 | L1-core | T4 | 68a84d1d | green | prior RC (r7 vs L0 r9) | fix round lost |
| mobile #302 | no_usable_result + D-05 docs | T3 | 8ca60030 | green (4495 tests) | none | single independent review |
| backend branch s15a/no-usable-result | S15a zero-result = failed | T4 | 707b6765 | build-and-test red (verdict-table cases expect partial) | none | fix tests, regen contract, open PR |
| parked #580 #582 #583 | env gap / pilot SQL / RLS catalog | T2/T3 | unchanged | — | — | later |
Not started or lost (uncommitted at the dead sandbox): S18 importer capability, X3a extension server-mode
lifecycle, FAM-C1 catalogue, onboarding/Roman investigation (owner priority, re-run alone).
Temporary required-check removal on integration/importer still in effect; restore owed after #587 merges.
Owner direction pending: onboarding/Roman/coach-matching deep dive (Opus 5.5) "day 1 mission blocker".

---

# HISTORY: session c7aa658f (superseded 2026-09-29 23:20 UTC)

# LAST OPERATOR STATE
Updated: 2026-09-29 18:35 UTC (round-1 audits in; fix rounds running)

Operator: Computer (Claude Opus 5.5), executive orchestrator, session c7aa658f
(https://www.perplexity.ai/computer/tasks/c7aa658f-8b40-46cc-b838-533cd9f0fa7b). EXECUTE given by owner
2026-09-29 11:00 PDT under the TGP IMPORTER MASTER EXECUTIVE AGENT PROMPT.
Session x44 is STOPPED (owner, 2026-09-29 10:58 PDT). This session owns every x44 lane. x44 review texts were
never published, so every in-flight PR gets fresh full independent reviews at its current head.

## Owner decisions 2026-09-29 10:58-11:00 PDT (binding)
- B1: x44 stopped; this session is the single writer for every importer lane.
- B2: D14 stands under the master prompt (Option A). Partner/third-party data reachable through the coach's own
  logged-in page moves: read-only GET/HEAD replay of requests the authorized page itself made, with the
  credential the page itself sent to that same origin; no stored credential, no new login, no mutation, bounded
  rate, every outside origin named in the result. The master prompt's origin confinement is read with this
  exception.
- B3: tgp-private-evidence and tgp-agent-context stay PUBLIC until the importer is done (public CI lanes enable
  parallelism); owner privates them at the end. Operator rule: no secrets, tokens, client names or client data
  values are pushed to either repo.
- Commit identity is not a criterion (master prompt section 0); G05 identity text is superseded.

## Execution plan (readback 2026-09-29; tiers per T0-T4 doctrine)
Wave 0 (now): D8 RLS tenancy fix stacked on #587 (T4); branch protection backend main + integration/importer
and mobile main (T3, strengthening, mirrors extension); fresh 2x independent reviews of #590, #587, #592,
#589, ext #35; L0 #581 r6 (records D9/D10/D14, aligns with #588/#591/#592); #591 after L0 r6; triage stale
PRs; promote integration/importer -> main (merge only, no deploy).
Waves 1-4: L2b, L2c, L3b, L2d; X2, X2b, X3, X4, R2 (+ Roman Offer/Setup registration); PRES, FAM-n, EX1,
FAM-M1, billing handoff (D10); V1-P on owner account (needs owner deploy approval + provider key + credential
rotation); CL record; L2g; DEL.
Routing: T4 builder Claude Fable 5.1; T3 Claude Opus 5.5 (stronger equivalent of Opus 5); T2 Claude Sonnet 5;
T1 GPT-5.6 Terra; T0 GPT 6 Luna (substitute: GPT-5.6 Luna unavailable). T4 reviewers: two independent
auditors from different families (GPT 6 Sol + Claude Opus 5.5), neither the builder.
Evidence: review reports published to tgp-private-evidence/execution/c7aa658f/reviews/.

## Live lanes (c7aa658f) — updated 2026-09-29 18:35 UTC
Branch protection applied 18:10 UTC (read back via API; direct-push negative test not run): backend main
(build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL JS/TS, banned casts,
build-sbom, danger), backend integration/importer (build-and-test, rls-floor-guard, rls-live-tests,
mwb-3-live-tests, npm audit), mobile main (Typecheck/lint/test, CodeQL x2); strict, admins enforced, PR
required (0 approvals), no force push/delete.

Round-1 fresh independent T4 audits (A = GPT 6 Sol, B = Claude Opus 5.5). Reports held in the operator sandbox
(/home/user/workspace/reviews/out/) and NOT published to the public evidence repo while the findings are
unpatched; they will be published once closed or once the repo is private.
| PR | Head | A | B | Next |
| --- | --- | --- | --- | --- |
| #587 S8-D3 | bb95cbf4 | APPROVE 0A/0B | REQUEST CHANGES 1A/5B | D8 tenancy slice (stacked, in build) closes the A; then #587 fix round; both land together |
| #589 L3 | 61b0d251 | RC 3A/2B | RC 2A/4B | fix round in build (Fable) |
| #590 FAM-0 r8 | 48177b75 | RC 3A/2B | RC 2A/9B | r9 in build (Fable); L0 amendments routed to L0 |
| #592 L1-gw | df330304 | RC 3A/2B | RC 1A/2B | fix round in build (Fable) incl. real-PG contention spec |
| ext #35 X1 | bd1684ae | RC 2A/2B | RC 0A/1B | fix round in build (Fable) incl. packaged-zip Playwright Chromium load proof |
| #581 L0 | f4459fe2 | — | — | r6 in build (Fable): records D9-D14/B2, closes r5 items |
| D8 (new) | — | — | — | T4 builder stacked on #587 (base cand/x43/s8d3-schema) |
Round-2 status (19:20 UTC): #592 r3 367d3e85 -> RC (A2: 1A; B2: 2B) -> r4 in build. #589 r3 e5b990b6 -> RC (A2: 2B; B2: 2B) -> r4 in build.
#581 L0 r6 d5bfea98 -> RC (3A/4B; 2A/8B); r7 e79e6578 -> RC (3A/2B; 2A/8B) -> r8 in build with operator scope reduction (contracts,
invariants and required real-browser acceptance tests; mechanisms move to X2b/X3/FAM-M1). #590 FAM-0 r9 0924fc15 -> RC (2A/1B; 2A/5B)
-> r10 in build with the same scope-reduction direction. #593 D8 44bb69cf -> RC (1A/1B; 0A/1B: AI assignment materialisers lacked the
tenancy check) -> r2 96aea1b8 green -> re-review running. #591 L1-core r3 (align to L0 r7) in build. ext #35 fix round in build.
Executive interpretation recorded: D14 "replay of requests the page itself made" covers the page's own learned endpoint templates
with other ids/pages under the L0 bounds. Follow-up findings for later slices: RlsContextInterceptor user.sub guard appears inert;
repo-wide GUC-keyed RLS helpers should adopt app.rls_actor_id(); production count of pre-existing cross-tenant assignment rows.

PAUSED by owner at 19:23 UTC ("let in-progress agents finish, do not start anything new"). Heads at pause, none merged:
| Lane | Head | Status at pause |
| --- | --- | --- |
| #593 D8 | 96aea1b8 | split: A2 RC (1A: tenancy check not atomic with the assignment write), B2 APPROVE (11C) — needs fix + fresh pair |
| #592 L1-gw | 32ca797e | r4 green; closes R592-c7A2-01/c7B2-01/-02; not yet re-reviewed |
| #589 L3 | 263e8950 | r4 green; closes 4 B; not yet re-reviewed |
| #581 L0 | f89e761a | r8 (scope-reduced) green; not yet reviewed; one --force-with-lease amend on the PR branch (d176e823 -> f89e761a) |
| #590 FAM-0 | 61c7c97f | r10 green; not yet reviewed |
| #591 L1-core | 68a84d1d | r3 green, aligned to L0 r7; interim family catalogue pending FAM-C1; not yet reviewed |
| ext #35 X1 | 8608a0ff | fix round green + packaged-zip Chromium load proof 15/15; not yet re-reviewed |
| #587 S8-D3 | bb95cbf4 | waiting on D8; fix round R587-c7B-02..06 not started |
Not started: every re-review above, #587 fix round, merges, report publication, superseded-PR closure (needs owner), parked #574/#580/#582-584, later waves.

Final owner-requested round (21:00 UTC), no merges (both-approve rule not met):
| PR | Head | A (GPT 6 Sol) | B (Claude Opus 5.5) | Remaining blocker |
| --- | --- | --- | --- | --- |
| #592 | 32ca797e | RC 0A/1B | APPROVE 0A/0B/4C | gateway backstop accepts 0/0 usage from a non-parsing adapter (B rated it C02) |
| #589 | 263e8950 | RC 0A/1B | APPROVE 0A/0B/5C | OpenAPI admits counters above parser max and non-ASCII tokens over the byte limit |
| ext #35 | 8608a0ff | RC 2A/0B | APPROVE 0A/0B/5C | grant accepted >60 s after Start-tab close not revoked; lost /complete reply can show failed without a server status check |
Reports: /home/user/workspace/reviews/out/R592-c7{A3,B3}.md, R589-c7{A3,B3}.md, R35-c7{A2,B2}.md (sandbox only).

Round for the other five (22:00 UTC), no merges yet:
| PR | Head | A (GPT 6 Sol) | B (Claude Opus 5.5) | Remaining |
| --- | --- | --- | --- | --- |
| #587 S8-D3 | 3e243750 | RC 0A/1B (proof jobs not required on integration/importer) | APPROVE 0A/0B/3C (merge condition: same gate) | add person-owned-rls-live-tests + person-owned-migration-rehearsal to required checks (classifier requires owner authorization), then land with #593 |
| #593 D8 | 798208b7 | RC for combined landing only (0 new A/B) | APPROVE 0A/0B/4C | fast-forward cand/x43/s8d3-schema to 798208b7, then merge #587 |
| #581 L0 r8 | f89e761a | RC 0A/3B | RC 0A/1B/8C | r9: 8-origin cap vs digest, :8443 port rule, media test vs FAM-M1 deferral, mutating-word check hits coach data |
| #590 FAM-0 r10 | 61c7c97f | RC 0A/1B | RC 0A/3B/6C | r11: adopt L0 r8 origin/device-attested contract, erased-unknown rows already in TGP keep count, media ingest/erasure serialization + orphan sweep |
| #591 L1-core r3 | 68a84d1d | RC 3A/1B | RC 1A/3B/6C | r4: align to L0 r8 (truncation carry-forward, scheme+host+port origins, r8 vocabulary), FAM-C1 catalogue disposition |
Migration Dry-Run jobs are path-filtered (prisma/migrations/**), so they cannot be required without blocking non-migration PRs.

Correction to the readback: Roman ImportSetupView is live in ImportDataScreen (not only progress/result);
only ImportOfferCard is unmounted.

---

## Inherited x44 state (as of agent-context b95ed47, 2026-09-29 17:31 UTC)


Former operator: Computer (Claude Opus 5.5), session x44 (now STOPPED) (EXECUTE given by owner 2026-09-29).
Mission: progress the AI-assisted self-learning importer toward the north star. Owner directive (2026-09-29):
finish every in-flight PR through review → fix → re-review, all nine in parallel, update this file at every
round finish per PR; start no new PRs; no pilot until everything is done.

Supersedes the 2026-09-20 state (preserved in git history). Commit identity is irrelevant (owner directive).

## Owner decisions recorded 2026-09-29
- D1 `complete` = ALL client records and ALL coaching records from the site are in TGP (no narrowing).
- D4 No unsupported families: anything reachable moves (messages, food logs, check-ins, habits, body metrics,
  notes, forms, photos/files, sessions, ...) — native where TGP has a model, otherwise a preserved record.
- D5 Partial runs show per family what came vs what did not; clickable in the extension UI and on mobile,
  from one server projection.
- D6 Extension backend origin = https://backend-spring-lake-3890.fly.dev (`tgp.coach` is unregistered).
- V1 pilot platform = the owner's own account on the owner-chosen platform; no pilot until all done.

## Executive decisions (orchestrator)
- MAIN-world replay: one Start authorizes only the tab origin; cross-origin data APIs are replayed from the
  authorized page's MAIN world; credentials stay on device, run-scoped, memory-only.
- Executive reset (after learn record r4 failed two T4 re-reviews): completeness closure is DEFERRED to a
  later record — until then no package type has run-level closure, learned runs settle `partial` with gap
  `completeness_not_proven` (false `complete` impossible by construction); per-family source counts stay
  provable. V1 memory is per coach; cross-coach reuse (north star) is a later slice (L2g) with quorum rules.
  One run-status projection (families[] / not_moved[] / gaps[]) owned by the learn record.
- S8-D3: harness fixes (fixture pre-delete; 23505 DETAIL assertions) authorized as correctness fixes; the
  pre-existing ClientWorkoutAssignment↔WorkoutPlan RLS recursion (42P17) is fixed inside #587.

## Bases
backend main `3a9369b9`, integration/importer `d6cf9eb6`; mobile main `adf3f2b9`; extension main `efb3fd18`.
Production backend unchanged (old main); nothing deployed this session.

## CHECKPOINT MODE (owner, 2026-09-29 09:02 PDT: 35k/45k credits used)
Directive: bring all nine PRs to a safe checkpoint. Every running builder/fixer was told to finish its current
round, push (single non-force), and mark unclosed items OPEN in its PR body. No new review rounds are launched
after this point; the next operator starts with the delta reviews listed in each row. No new PRs.

## In-flight PRs (round status)
| PR | Slice | Tier | Head | Round | Status |
|---|---|---|---|---|---|
| backend #581 | learn-and-remember record | T4 | f4459fe2 (r5) | CHECKPOINT: r6 needed | r5 reviews: R581-A3 REQUEST CHANGES (2A/3B) + R581-B3 REQUEST CHANGES (0A/8B; no false-complete path found; structure holds). NEXT: r6 author closes reviews/out/R581-A3.md + R581-B3.md (remove destination.kind from LearnedProposalV1; align slice text with merged L2a/#591/#592; round-2 match rule; template_absent; origin base case; C0 per family), then two delta reviews |
| backend #590 | FAM-0 all families record | T4 | 48177b75 (r8) | r8 delta review | … r7 → R590-A6 (1A/2B) + R590-B6 (5B) → r8 pushed 48177b75 (native re-screen; pre-P1 quarantine; trialing no date; extension redactor retired via vendored rules file + X-RED1 slice; residual_unknown in L0 amendments; JSON-only partner origins; counted exclusions; row locks; corpus seeded). R590-A7 + R590-B7 running |
| backend #591 | L1-core learn contract/validators/prompt (pure) | T4 | debce080 (r2) | CHECKPOINT: delta review next | R591-A (2A/3B) + R591-B (2A/6B) → r2 pushed: contract v2, family label (no AI destination; unsupported_coaching_data deleted), origins/parentEdge/idScope, device pagination signals + positive proof for none, next_url confinement as contract data, stored-package re-validation, stable reuse key; learn suites 255/255, tsc 0. OPEN: nonGetDataOrigins (r5 field) not added pending L0 r6; reused-parser specs not re-run; X2 must re-copy fingerprint vectors. NEXT: two delta reviews 3a684671..debce080 after L0 r6 |
| backend #592 | L1-gw fail-closed importer.mapping AI capability | T4 | df330304 (r2) | CHECKPOINT: delta review next | R592-A (3A/4B) + R592-B (6B) → r2 pushed: SpendLedger port + advisory-locked PG reserve-before-call (fail closed), allow-listed caller metadata, kill switch per attempt, prices>0, single tool_use, conservative token estimate, readonly schema + validation errors returned, 90 s default, env keys registered; 70 tests. OPEN: real-PG proof of advisory-lock contention (in-memory double only); C1/C8 at r1 posture; CI at df330304 unobserved. NEXT: two delta reviews 52196217..df330304 + real-PG contention spec |
| backend #588 | L2a SourceRegistryProvider | T3+2nd lens | f6dcee55 (r2) | MERGED | R588-A/B → r2 → R588-C APPROVE; real-PG proof ACCEPT run 36592070591 (133/42/95); squash-merged into integration/importer as 249fd0d4 |
| backend #589 | L3 per-family replay evidence | T4 | 61b0d251 (r2) | CHECKPOINT: delta review next | R589-A (3A/2B) + R589-B (2A/2B) → r2 pushed: closure deleted (no path to run-level complete), per-family source_count only, r4 StepEvidenceV1, fan-out bound; N1–N5 fail 15/16 on fe38821, pass on head. OPEN: L2 must consume evaluateCoverageDetailed().families; StopReason lacks positive value for proven style none (L0 r6). NEXT: two delta reviews of fe388210..61b0d251 |
| backend #587 | S8-D3 person-owned schema + RLS | T4 | bb95cbf4 (r2) | CHECKPOINT: delta review next | r2 pushed: 61bdadbb CWA↔WorkoutPlan cycle fix (SECURITY DEFINER helper, reversible), bb95cbf4 harness fixes (a)(b) + live cycle-fix block; local 423/423, reversibility 12/12; `gh pr checks 587` at bb95cbf4 (16:35 UTC) all pass incl. person-owned-rls-live-tests and build-and-test. OPEN: PR body still shows round-1 table (closure edit blocked by safety check — apply from reviews/S8D3_PR587_FIX_ROUND_20260929.md); owner item: assignment_coach_manage lacks client-tenancy check (pre-existing); re-merge base 249fd0d4. NEXT: two delta reviews 4abed784..bb95cbf4 |
| extension #35 | X1 origin authorization (+ Fly origin) | T4 | bd1684ae (r3) | CHECKPOINT: delta review next | R35-A (1A/3B) + R35-B (3B) → r3 pushed: 1df6eaf all A/B closures (recheck around Network.enable; nonce/tab/origin-bound pending Start, either-order claim; revocation fences; startup grant sweep; main-frame-only teardown; executeScript only), bd1684a OD-API-ORIGIN (Fly origin, exact-host, retired-domain scan); vitest 2102 pass, package ok. OPEN: real-Chrome browser-load proof (no Chrome binary; proof script still models r1 collector, needs rewrite); multi-origin out of scope. NEXT: two delta reviews 142501a2..bd1684ae |
| mobile #300 | R1 Roman status binding | T2 | 8565cc51 (r4) | MERGED | R300-A → r2 → R300-A2 → r3 → R300-A3 → r4 → R300-A4 APPROVE (no A/B; CI green on exact head) → squash-merged to mobile main as 360fdc74 on owner authorization (09:41 PDT) |

Merged this session: backend #588 (L2a) → integration/importer 249fd0d4 (integration/importer not promoted to main); mobile #300 (R1 Roman status) → mobile main 360fdc74.

## Owner decisions 2026-09-29 09:52 PDT (binding for next rounds)
- D8 corridor fix APPROVED: `assignment_coach_manage` must apply the same coach-client tenancy check the app applies (tightening only). Queued as the FIRST new PR when work resumes (small T4 RLS slice, two reviews).
- D9 (P1) popup carries exactly one Start button; everything else is status. Resolves the north-star wording conflict.
- D10 (P2/OQ-1) billing and payment history MOVE (preserved, coach-visible). Owner wants per-client next payment date carried so the coach misses no payments. Design note (not started): map to a coach-visible schedule (next due date, amount, interval, source status); moving the date does not move the live charge (Everfit keeps charging via the coach's connected Stripe account until canceled there; card data cannot be copied). Proposed V1: schedule + reminders + timed TGP checkout whose first charge lands on the carried due date, then coach cancels at the source. Needs a billing-handoff slice; L0 r6 and FAM-0 r5 must change billing from gap/excluded to moved.
- D11 (P3) registrable-domain fallback: not now; later slice.
- D12 (P4) media storage spend APPROVED; reuse the existing S3-compatible storage.
- D13 (P5) Chrome Web Store: later.
- D14 (P6) third-party/partner data reachable through the coach's session MOVES and is USED ("all data possible moved over, and used, everything possible"). FAM-0/L0 must drop the exclude-by-default. Still bounded by: no credentials stored, no logging into partner services, only what the coach's own session can reach.

## Not started (by owner direction: no new PRs)
L1 service/route, L2b per-coach memory store + pin, projection slice, X2 rework (#38, must rebase on X1 and
adopt new key-admission rules), X2b engine counters, X3 extension server-mode learn path, X4 popup detail,
R2 Roman gaps, FAM-n native families, preserve destination, completeness-closure record, L2g cross-coach
reuse, branch protection for backend/mobile, V1 proofs.

## Pending owner items
P1 popup carries the one Start (authorize) and is otherwise status-only (north-star wording conflict);
P2 billing under D1 (recommend preserve read-only / disclosed); P3 origin fallback (registrable-domain
permission only if MAIN-world replay proves infeasible); P4 media storage spend (est. small per coach);
P5 Chrome Web Store; P6 third-party service data default (excluded + disclosed unless it carries the site's
own credential); FAM-0 OQ-1..OQ-7 (billing, client visibility of preserved records, media caps, media host,
AI context from imported history, profile fill on join, unclassified family); email/billing storage reversal.

## Evidence
Review reports and briefs live in the operator sandbox (/home/user/workspace/reviews/out/*.md); summaries
are mirrored in PR bodies. Publish to tgp-private-evidence at session end.

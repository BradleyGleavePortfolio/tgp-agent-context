# Operator 125 -> agent 126 handoff (2026-10-06)

Start prompt: handoffs/op-125/AGENT_126_PROMPT.md. GitHub is the truth: re-check every head and SHA here before acting on it.
Lane files are in handoffs/op-125/ops/:
- _COMMON_125.md: the rules every subagent got. Copy it to _COMMON_126.md.
- JOBS125.md: every job entry (AUDIT-01..20, lens queues, builders, VERIFY-EXT, safety passes). Reuse the format.
- FLEET125.md: every subagent agent 125 ran.
Subagent reports (ops/reports/<JOB>.md) and ops tools are in the snapshot on backend branch wip/op125/ops-snapshot.

## State (written 15:15 PDT; the FINAL section at the bottom wins over this one)
- Launch path 5/7. Two steps are left: step 5, the owner's Health Connect device pass on the 10-07 build, and step 7, the 10-07 Expo
  build (clinic profile, iPhone and Android) plus store review.
- Agent 125 was acting CEO/CPO/CTO (SoT A4) from about 12:30 to about 15:45 PDT on 10-06. 80+ PRs merged today across both repos
  (agents 124 and 125). Backend main is far ahead of production; one backend deploy was planned for about 15:25 (see FINAL).
- The owner's priorities, verbatim: "TOP PRIOTY for the food and workout logging to be kick ass, and for the flow of money to be
  BULLETPROOF". The iOS build is 10-07.

## What agent 125 did
1. AUDIT-01..20: twenty separate in-depth audits of the owner's list (one auditor each, reports ops/reports/AUDIT-NN-125.md). Every day-1
   B they found was fixed and merged or is in the open-PR list below. Auditor decisions taken at the recommended defaults:
   - AUDIT-05: Roman keeps 988 for real crisis words; gym talk ("I want to die after these burpees") stops triggering it (b#795).
   - AUDIT-14: an approved AI program saves to the coach library on day 1; coach AI metering is post-launch; "Ask AI" stays hidden.
   - AUDIT-02: a paid package can no longer be granted free through the free invite link (b#791, merged).
2. Merges only through ops/merge_if_dual.sh (Opus APPROVE + Sol APPROVE at the exact head, green checks).
3. VERIFY-EXT-125 (Sol): checked another model's 38-item findings list against main. 1 real new day-1 B (backend #732, Health Connect
   rewritten records double-count, now b#802), 17 real but not day 1, 10 fixed, 2 in flight, 8 wrong. Report ops/reports/VERIFY-EXT-125.md.
4. Builders this afternoon:
   - B-DELIV: lessons scope and purchased-file opening (b#798, m#434 merged).
   - B-ROMANADJ: coach-approved Roman set changes reach the client (b#800, m#435 merged).
   - B-ROMANIQ: Roman and coach AI on Claude Sonnet 5.5, coach brief on Claude Opus 5.5 (b#803).
   - B-HC732: Health Connect duplicates (b#802).
   - B-REPORTALERT: support inbox emailed on every report (b#801).
   - B-WEARLIST: server-driven tracker list (b#799, m#436).
   - B-DROPS: coach attaches PDFs/videos to packages; buyer screen flag on (see FINAL).
   - B-LEADER: leaderboard entry inside Community (see FINAL).
5. AI safety passes (owner 14:59), Opus, 12-point checklist:
   - SAFE-DIAG-125: NO-GO, nothing to flip. The diagnostic module is not loaded at all (quiz belongs to TGP Finance, owner 10-01), and
     production routes 404. Not on in production. 4 Cs.
   - SAFE-MWBAI-125: NO-GO, nothing to flip. FEATURE_MWB_AI_LIVE_CREATE turns on nothing that works: the model reply is only saved as a
     note, there is no UI in the build, coaches cannot approve their own drafts (ai-approval.service.ts:92), it is not metered against
     the coach AI pool, and there is no injury handling. Post-launch project; smallest fixes in the report.
   - SAFE-TRIAGE-125: NO-GO for 10-07, GO AFTER FIXES later. b#804 (self-harm and crisis items always count as urgent) MERGED 15:23.
     Later GO needs backend FEATURE_COMMUNITY_AI_TRIAGE=true, AI_GATEWAY_ENABLED=true, AI_GATEWAY_PROVIDER=anthropic,
     AI_GATEWAY_CAPABILITIES=community_ai_triage, plus mobile EXPO_PUBLIC_FF_COMMUNITY_AI_TRIAGE=true in a new build, plus the owner's
     scope OK (SoT says not in clinic scope). Report ops/reports/SAFE-TRIAGE-125.md.
   - The manifest's "stays off until R2b" notes are stale: R2b (b#626 AI consent gate) is merged and deployed. Refresh the notes.
6. Vision recorded in SoT A7.5 "Company north star" (growth ladder, principles, 2030 goals G1-G9, sub-coach plan; teams are FREE).

## Production (machine 860311cee0d008, app backend-spring-lake-3890)
- Before tonight: deploy 14 = ec12a4b3 plus env sync (FEATURE_DUNNING_V2 on). See FINAL for tonight's deploy.
- Secrets on Fly (names only, run 37536038425, 145 names): every "hard" and "prod" required name in src/common/env-validation.ts is
  present, plus ANTHROPIC_API_KEY, Stripe (secret, webhook, publishable, prices), Supabase, Resend + EMAIL_TRANSPORT, Apple and Google
  sign-in, Sentry, Redis, Mux, USDA, ExerciseDB, KMS, PostHog. Missing names are all for features that are off (cloud trackers, AI
  gateway, contracts/HelloSign, OpenAI) or tunables with defaults. One hardening C: DELETION_RECEIPT_SECRET is unset (deletion receipts
  still work, they are just not HMAC-joinable); the owner can add a 32+ character random value through the secure path later.
- Flags ON in production: see .github/fly-env-desired-state.json "flags". Everything off, and why, was sent to the owner at 15:00 and is
  derivable from that file's "gates" and "excluded" notes plus eas.json "clinic". Notable: LEADERBOARD_ENABLED is unset, which means ON
  (leaderboard.service.ts:100); the backend leaderboard has been live, the app just had no way in.
- AI models: Roman ROMAN_MODEL_PHASE_1 claude-sonnet-4-6, background claude-haiku-4-5, COACH_AI_MODEL claude-sonnet-4-6, brief uses
  COACH_AI_MODEL until b#803 deploys (then Sonnet 5.5 for Roman and coach AI, Opus 5.5 for the brief).

## Owner decisions today (all recorded in SoT C1, newest first)
- 15:06 Leaderboard: turn on if usability and placement are good, inside Community (B-LEADER-125).
- 15:03 Purchased PDFs/videos screen ON for the 10-07 build, on condition the coach attach flow is robust (B-DROPS-125).
- 14:59 AI safety passes for workout-builder AI, community AI triage and diagnostic AI (done, verdicts above).
- 14:51 Oura: proceed with Oura despite the API agreement (owner's call, small operation, client permission). No Oura-specific
  exclusions in Roman v1.1.
- 14:49 Roman v1.1 is agent 126's first project. The owner will buy an Oura ring and membership only if it gives instant API access
  (it does for up to 10 users; beyond that needs Oura review). Commission: Oura partners/resellers program.
- 14:25 Sub-coach teams are FREE for now; take rate grows with the coach.
- 14:21-14:30 Vision: "What weight-watchers was for the TV era, we are for the AI era." SoT A7.5.
- Expo: EXPO_PUBLIC_API_URL = https://api.trygrowthproject.com/api is set (owner 14:25).

## Owner to-dos before and during the 10-07 build
0. REMIND THE OWNER (he asked, 15:23): Play Console Health apps declaration and Data safety form are DONE and saved; the Data safety
   form is paused only on the App access reviewer logins. As soon as he confirms the tester accounts exist, remind him to enter the
   client and coach reviewer sign-in details in Play Console (App content > App access) himself, then finish and send for review.
   Instructions file: handoffs/op-125/PLAY_CONSOLE_COMET_10-06.md.
1. Owner and coach accounts (the81stworker@thegrowthproject.site, bradleyapple1031@gmail.com) and the Google testers. When the owner
   account exists, make it owner (one approved UPDATE of the role, see AGENT_124_PROMPT history) and remove BOOTSTRAP_SECRET.
2. Coach account: at least one appointment type and weekly hours, otherwise clients see no booking slots (AUDIT-04).
3. Play Console Health Connect declaration (15 permissions) and the Data safety form.
4. After tonight's deploy: file one test report in the app and check the support inbox gets the email (b#801).
5. Optional: register Polar and Withings developer apps; Garmin contact form sent (Garmin paused new access since spring 2026);
   WHOOP needs a membership and about 17 days' approval; the Oura ring purchase is the owner's call.

## Agent 126 job list, in order
1. Finish what agent 125 left: every PR in "Open PRs at handoff" (FINAL) to dual APPROVE and merge; then ONE backend deploy if anything
   merged after agent 125's deploy (migrations=apply-migrations only if prisma changed), /health and /readyz.
2. 10-07 build day: tell the owner which merged mobile PRs the build carries; support the device pass
   (handoffs/op-123/DEVICE_PASS_10-07.md) and store text (handoffs/op-123/STORE_TEXT_10-07.md).
3. Roman v1.1 (owner's first project for 126): flip PRs R11-F1 (FEATURE_ROMAN_MEMORY) and R11-F2 (FEATURE_ROMAN_PLAYBOOK) per
   backend docs/runbooks/launch-flags.md line ~190 and the AGENT 124 banner (SoT ~2474-2500). Migrations 20270401000000_roman_memory
   and 20270402000000_coach_playbook must be deployed first. Consent v5 paragraph (SoT C1 11:53 owner decisions) applies.
4. Safety follow-ups: SAFE-TRIAGE result (FINAL); SAFE-MWBAI four post-launch fixes; refresh stale R2b manifest notes.
5. Trackers (never set Strava keys: Strava's terms bar showing data to coaches): when the owner registers a provider, keys go in through the secure form only, then FEATURE_WEARABLES_CLOUD_CONNECTORS and
   WEARABLES_OAUTH_REDIRECT_BASE_URL=https://api.trygrowthproject.com/api via a manifest PR and env sync. Redirect URI
   https://api.trygrowthproject.com/api/v1/wearables/connections/oauth/callback; webhooks .../api/v1/wearables/webhooks/<provider>.
6. Sub-coach v1 (SoT A7.5 plan, 5 PRs; teams free).
7. AUDIT follow-ups not yet built (each is in its AUDIT-NN-125 report with file:line): coach bio row; Units and Calorie rows; "Mark
   reviewed" on check-ins; booking U-04-2/3/4; AUDIT-13 four Us; AUDIT-17 three Us; AUDIT-03 N2; AUDIT-08 recipes/templates; AUDIT-14
   auto-assign and coach AI metering; AUDIT-01 items 2 and 3; consultation screens audit.

## Lessons (tools)
- `gh search prs ... in:head` returns nothing; list lens queues with `gh pr list --json headRefName` and filter startswith("agent125/").
- Always use absolute paths for worktrees; start background jobs with setsid.
- Read production flags from .github/fly-env-desired-state.json, never from memory; "unset" can mean ON (LEADERBOARD_ENABLED,
  SIGNUP_ROLE_CHOICE_ENABLED, COACH_WELCOME_SCHEDULER_ENABLED, WORKOUT_REMINDERS_ENABLED).

## FINAL (filled at agent 125's stop)
(pending)

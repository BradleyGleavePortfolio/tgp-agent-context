# Operator 123 -> agent 124 handoff (2026-10-06, final)

Start prompt: handoffs/op-123/AGENT_124_PROMPT.md. GitHub is the truth: re-check every head before acting. Lane files are in
handoffs/op-123/ops/:
- JOBS123.md: every job entry (wave 3, fixers F1-F11, lens queues R3A-R4A).
- _COMMON_123.md: the shared subagent rules.
- FLEET.md: every subagent.

Subagent reports and ops tools are in the snapshot on backend branch wip/op123/ops-snapshot.

## State
- Launch path 5/7. Left: step 5, Health Connect (the owner's device pass on the 10-07 build), and step 7 (the 10-07 Expo build plus store review).
- Backend main 1dbada71420f2b92a8349c3480f17030e4e8a257 = production (deploy 11, 10-06 10:35, run 37504168125, no migrations;
  /health and /readyz ok; /terms no longer says "policy draft"). Main CI and codeql green at 1dbada71.
- Mobile main 7812405dc529755b604fa484cab796e6f84d764f (m#393), CI green. The 10-07 build is made from mobile main.
- Merged into main: 10-05 = 68 (backend 38, mobile 30). 10-06 = 6 (b#743, b#759, m#393, b#757, b#758, b#756).
  Earlier "135" counted 67 split pieces merged into stack branches, so it was wrong. Count only merges into main.

## Owner's handoff list for agent 124 (owner 10-06 10:41-10:52: "Add all eight items to the handoff list"), in this order
Owner 10:41: "coach briefs need to be perfect". Owner 10:48: "we need to turn everything on thats a day 1 blocker".
1. Coach briefs (FIRST). src/coach/brief/coach-brief.service.ts pins BRIEF_CLAUDE_MODEL = 'claude-3-5-sonnet-20241022', a retired
   model, so every brief call fails and every coach gets the deterministic fallback narrative. The brief is in the clinic build
   (eas.json clinic EXPO_PUBLIC_FF_COACH_BRIEF=true), COACH_BRIEF_ENABLED is unset (= on) and COACH_BRIEF_NOTIFICATIONS_ENABLED is on,
   so coaches get the fallback text today. Tested fix: handoffs/op-123/coach-brief-model.patch (apply on backend main with git apply).
   It sets BRIEF_CLAUDE_MODEL = COACH_AI_MODEL (claude-sonnet-4-6, src/ai/coach/coach-ai.constants.ts) and adds
   test/coach-brief-model.spec.ts (model equals COACH_AI_MODEL and ROMAN_MODEL_PHASE_1; no runtime src line names a retired Claude
   id). The new spec fails 2/2 on main 1dbada71 and passes with the fix; coach-brief.service.spec and coach-brief-ttl pass (92 tests).
   Prettier already warned on that file at main. Open the PR, dual lens, merge, deploy, then check one real brief on production
   (the narrative is AI text, not the fallback).
2. Failed-payment handling ON (FEATURE_DUNNING_V2). All code is merged and live since deploy 5 (backend D1-D2c, R-DISPUTE-PAUSE,
   refund and inquiry rulings); mobile lockout m#352-#354 and coach Restart plan m#380 are in the 10-07 build. Only the switch is left.
   Owner first: Stripe live dashboard, customer portal on (https://dashboard.stripe.com/settings/billing/portal) and the retry settings
   for failed payments. Then a small PR that changes flags.FEATURE_DUNNING_V2 in .github/fly-env-desired-state.json from "unset" to
   "true" (its gate text there: #628 + m#322 approved, both merged; portal live). Dual lens, like b#743. Then env-sync plan, apply
   with confirm=SET and deploy_staged=true, then a Stripe test-card pass. RESEND email is already configured on Fly.
3. Deleted accounts must really be wiped. GDPR_SCRUB_DRY_RUN exists on Fly. Its digest (c1fead9a045428a1) differs from the "true"
   digest (d8c5ac2e11c8e492), but the scrub also dry-runs on "1" (src/users/gdpr-scrub.service.ts resolveDryRun). Declare it "false" in
   flags of .github/fly-env-desired-state.json (same PR as item 2 is fine); the plan shows whether production holds "false"; apply if not.
4. Close the first-owner setup door. BOOTSTRAP_SECRET is set on Fly and no owner exists, so POST bootstrap-first-owner is armed. It
   returns 403 once an owner exists, so promote the81stworker@ as soon as he signs up. Then remove BOOTSTRAP_SECRET (declare it "unset"
   in .github/fly-env-desired-state.json flags, which makes apply remove the name; never fly-secrets-set.yml).
5. Play Console Data safety form (owner). The Health apps declaration was filed 10-04 10:37; no record shows Data safety finished.
   Needed before the Android submission.
6. Health Connect device pass on the 10-07 clinic build (owner; launch path step 5).
7. Leftover switches (not a blocker; tidy). Fly digests show these equal "true": FEATURE_SCOUT_INGEST and FEATURE_EXTENSION_PAIRING
   (importer; fails closed because FEATURE_SCOUT_PILOT_COACH_IDS is absent, so nobody reaches it), FEATURE_GOOGLE_CALENDAR_SYNC,
   GOOGLE_CALENDAR_ENABLED, GOOGLE_MEET_ENABLED (no mobile button; GOOGLE_OAUTH_CLIENT_ID and _SECRET share one digest with the OOM_*
   values, so they are placeholders). The three Google names sit under "excluded" in .github/fly-env-desired-state.json ("adopt
   after a read confirms the value"): the digest is that read, so move them into flags as "false" or "unset". The two importer names
   are owned by fly-feature-flags-set.yml (read its inputs before use). Agent 123's OLDER_OPEN_PRS.md said the importer switches were
   off; corrected there.
8. SoT: owner quotes 10:38-10:52 are in C1 and the AGENT 123 banner (agent 123 did this). Keep them current.
Checked and already done (no action): open signup live (signup-policy role_choice true, no code), FCM key in Expo (10-05 09:51) and
iOS push key since May, Stripe webhook events (10-05 17:31), scheduling coach controls, one shared free trial rule, Roman daily cap
pop-up, Roman conversations, coach AI pool debit, programs flags, Health Connect flag, community, codes, broadcasts, no-coach Home.

## Every PR v1 needs is merged
10-06: b#743 (Codes/Broadcasts/no-coach Home flags in manifest), b#759 (operator: unblocked main CI, booking spec clock pin plus
shell-quote 1.12.0), m#393 (coach notification ask; "Send your coach a message" opens 1:1 Messages, hidden without a coach), b#757 (group
chat push to other members; mute/block/ban/quiet respected; no message text), b#758 ("not breathing", "won't wake up", ODed/OD'd/O.D.
spellings -> 911; every "can't breathe" -> 911 as before), b#756 (public pages: no "draft"/"private review", 14-day deletion, no
"we/Email us").

Open PRs are all older parked work, not on the v1 path:
- Backend (43):
  - 15 dependabot bumps, including majors such as NestJS 12.
  - About 15 importer ("scout") stack PRs: 574-593 and 525-529.
  - The parked Roman v2 stack: 598, 601, 602, 603, 605.
  - Custom-exercise PRs 427 and 428.
  - Docs/closure records: 491, 581, 590 and 594.
  - Others: 522 and 584.
- Mobile (12):
  - 7 dependabot bumps.
  - Custom exercise 262, 264 and 265 (flag off).
  - 283 (orphaned invite code, already fixed on main by the unified key, so superseded).
  - 302 (draft import copy).
- Closing needs the owner's OK.

## Production settings (machine 860311cee0d008)
- ON: community API/posts/messages/push/realtime, messaging core v2, Roman chat, Roman adjust, and since 10-06 09:27
  FEATURE_COACH_CODE_TOOLS, FEATURE_COACH_BROADCASTS and FEATURE_COACHLESS_HOME (env-sync plan 37494157051, apply 37494291038).
- Apple: APPLE_AUDIENCES=com.growthproject.app, APPLE_NONCE_REQUIRED unset. The Sign in with Apple key was copied to Fly on 10-06 at
  10:01 (run 37500165590). The owner made a new key and re-saved both GitHub secrets; the 10-01 secret was not a key file.
- OFF: FEATURE_DUNNING_V2 (to be turned ON: owner list item 2), DMs, voice notes.
- On but should be off: importer, extension pairing, Google Calendar sync, Google Meet (owner list item 7).
- fly.toml keeps 1 machine always running (min_machines_running=1). Every deploy or secret change is a brief restart.

## Owner decisions closed (10-06)
- Featured coach = bradleyapple1031@gmail.com (coach account) + code GP-BRADLEY + the pitch line in SoT C1.
- Codes/Broadcasts/no-coach Home ON.
- Build the clinic profile once for iPhone and once for Android.
- Hosting: Supabase Pro with Small compute, about $30 a month, no second server. The owner upgrades it himself; the org also holds the
  project tgp-finance, which is billed under Pro too.
- Owner account = the81stworker@thegrowthproject.site.
- Apple key: done.

## Production accounts (read-only check 10-06 09:39)
The User table has 1 row (contracts-system@, a coach-role system account) and auth has 3 users. Nobody has the owner role. Neither
bradleyapple1031@gmail.com nor the81stworker@thegrowthproject.site has an account yet.
- After the owner signs up the81stworker@ (any role), run one UPDATE "User" SET role='owner' for that email. The owner approved it on
  10-06 at 09:38.
- bradleyapple1031@ signs up as a coach, creates the $49/month package and connects Stripe payouts.
- The owner then saves the featured offer in Settings > Owner > Featured coach.

## Owner to-dos before the 10-07 build
- In the expo.dev production environment:
  - EXPO_PUBLIC_API_URL must end with /api.
  - Add SENTRY_AUTH_TOKEN (sensitive).
  - Add EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES=true (plain text).
- Confirm build numbers: iOS 6, Android 5.
- Stripe live mode: a connected-accounts webhook to /api/v1/webhooks/stripe.
- Supabase: upgrade to Pro, and check that the Apple provider client IDs include com.growthproject.app.
- Play reviewer accounts.
- Sign up the two accounts above (the81stworker@ first: promoting it closes the setup door, item 4).
- Stripe live: customer portal on and failed-payment retry settings (item 2).
- Play Console Data safety form (item 5).

## Older open PRs (owner asked 10-06 10:38; full plain-words list: handoffs/op-123/OLDER_OPEN_PRS.md)
- First check for agent 124: b#593 (D8). Main's RLS policy "assignment_coach_manage" (migration 20260702000000) only checks
  assigned_by_coach_id = caller, so it never checks the client belongs to that coach. The same gap exists on DailyMealPlanAssignment. Check
  whether authenticated PostgREST writes reach these tables on production. If they do, port only that policy as a small T4 PR; it is a B
  under "reachable security". b#593 cannot land alone because it is stacked on #587.
- Superseded, can be closed with the owner's OK: b#598, #601, #602, #603 (the Roman work landed via the later split), b#522, b#584,
  m#262, m#283.

## Carried Cs (edge-case freeze; not day 1)
- Coachless clients still read "Your coach will place you in one."
- No per-cohort mute (only Mute all).
- "Oded" (a name) and "stopped breathing for a few seconds while sleeping" route to 911. Both err to safety.
- A booking push copy builder falls back to the real clock.
- Database connections: 18 Prisma clients. Fix before adding a second server.
- Anon key can list coach packages, including drafts and share tokens (RLS C).
- Leaked-password protection is off.
- Wearable export size.
- Coach list capped at 200.
- Guide call logs lack the coach id.

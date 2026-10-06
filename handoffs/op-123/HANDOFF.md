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
- OFF: FEATURE_DUNNING_V2 (Stripe customer portal in live mode first), DMs, voice notes.
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
- Sign up the two accounts above.

## Older open PRs (owner asked 10-06 10:38; full plain-words list: handoffs/op-123/OLDER_OPEN_PRS.md)
- First check for agent 124: b#593 (D8). Main's RLS policy "assignment_coach_manage" (migration 20260702000000) only checks
  assigned_by_coach_id = caller, so it never checks the client belongs to that coach. The same gap exists on DailyMealPlanAssignment. Check
  whether authenticated PostgREST writes reach these tables on production. If they do, port only that policy as a small T4 PR; it is a B
  under "reachable security". b#593 cannot land alone because it is stacked on #587.
- Superseded, can be closed with the owner's OK: b#598, #601, #602, #603 (the Roman work landed via the later split), b#522, b#584,
  m#262, m#283.

## Carried Cs (edge-case freeze; not day 1)
- The coach brief uses retired model claude-3-5-sonnet-20241022 (src/coach/brief/coach-brief.service.ts BRIEF_CLAUDE_MODEL), so it
  always falls back to the deterministic narrative.
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

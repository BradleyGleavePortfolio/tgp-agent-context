# Operator 123 -> next operator handoff (2026-10-05 22:56 PDT)

No agents are running. GitHub is the truth: re-check every head before acting. Lane files: handoffs/op-123/ops/ (JOBS123.md has every
job entry incl. wave 3 + fix queue + lens queues R3A-R3F; _COMMON_123.md the shared rules; FLEET.md every subagent). Subagent reports
were in the session workspace (ops/reports/, snapshot on backend branch wip/op123/ops-snapshot f309913c); the ones that matter are
summarised here and in the SoT Part B banner "AGENT 123".

## State
- Launch path 5/7. Left: 5 Health Connect (owner device pass on the 10-07 build) and 7 (10-07 Expo build + store review).
- Backend main 2e3a749809da643e4e73ff1175d77bfda4086bed = production (deploy 10, 22:53, run 37420489986, no migrations; /health and
  /readyz ok). Main CI green at 2e3a7498 (Release Please fails on main, pre-existing, not required).
- Mobile main 435e67a97be515703e1915663fc3323176c5257a (m#391 merge; CI was running at 22:55 - check it). Mobile main CI green at
  5098fb22 (m#392).
- Merged today 135 (backend 77, mobile 58). Deployed today 10.

## Production settings (verified on machine 860311cee0d008)
- 20:37 apply 37409749015: community API/posts/messages/push/realtime, messaging core v2, Roman chat, Roman adjust ON.
- 22:36 apply 37419274006 (after b#748): APPLE_AUDIENCES=com.growthproject.app, APPLE_NONCE_REQUIRED unset. /api/auth/signup-policy
  lists apple. NOT done (owner go needed): fly-apple-signin-set.yml (copies the Apple sign-in key from GitHub secrets to Fly so account
  deletion revokes Apple tokens - App Store requirement). Never run fly-secrets-set.yml.
- OFF until the owner says go: FEATURE_COACH_CODE_TOOLS, FEATURE_COACH_BROADCASTS, FEATURE_COACHLESS_HOME. b#743 (manifest, +6/-6)
  has Opus + Sol APPROVE at 3493baaa; merge, then env-sync plan (expect 3 to set) and apply. Owner should save the featured offer first.
- OFF: FEATURE_DUNNING_V2 (Stripe customer portal in live mode first), DMs, voice notes.

## Wave 3 (20 runs launched 21:35, all done) + fixes - merged and deployed
b#747 legacy leaderboard opt-in + removed members own-only (operator), b#745 invite landing per-platform buttons, b#742 feature-off 503s
out of Sentry, b#746 export covers day-1 data, b#748 Apple audience/nonce manifest + key workflow, b#750 payout status re-read from Stripe,
b#751 community push honours Mute all, b#752 cohort assignment authz + block list first names, b#753 community workspace + "All members"
auto-created in /community/me (members may post in the Hall - operator ruling), b#744 Roman/AI guide shared crisis lists (FIX ROUND 1:
bare "possible overdose" -> 911, "I cut myself again" -> 988), b#755 public pages (open signup, coach FAQ, community/leaderboard privacy,
terms zero-tolerance line), b#749 owner-only featured coach list, b#754 AI Guide spends from the coach monthly pool (pool empty -> normal
reply, code COACH_AI_BUDGET_EXHAUSTED).
Mobile (in the 10-07 build): m#389 no composer without a workspace, m#390 iOS camera/photo purpose strings + community terms sheet +
signup terms line + Trust Center security copy + Android mic permission removed, m#392 Trust Center community/leaderboard line
(operator), m#391 owner-only Featured coach editor in Settings (owner accounts now open the coach app).
No-B scouts: RLS (42 new tables forced RLS), coach journey, capacity, build config, Play review (apart from mic).

## Owner docs (this folder)
DEVICE_PASS_10-07.md (tap-by-tap device test with reply form; A4 updated: Apple sign-in should now work; Part B2 menu path is
Settings > Owner > Featured coach), STORE_TEXT_10-07.md (store text, review notes, health disclaimer).

## Open owner decisions (A1.7 22:37)
1. Featured coach account: must be a coach-role account (with the $49 package + Stripe payouts); which email? Code GP-BRADLEY, pitch:
   "Sir/Ma'am, just so you're aware, TGP's top coach has available slots. Enter code GP-BRADLEY and join for $49/mo. Interested?"
2. Codes/Broadcasts/no-coach Home on for the device pass (b#743).
3. Build the clinic profile once per platform (only profile with Health Connect).
4. Hosting: ~$109/mo (Supabase Pro + 2 dedicated Fly machines) vs ~$62/mo shared CPU (scout S-CAPACITY; inspect Prisma pool before
   replicas).
5. Go for fly-apple-signin-set.yml.

## Owner to-dos before the 10-07 build
- expo.dev production environment: EXPO_PUBLIC_API_URL ends with /api; add SENTRY_AUTH_TOKEN (sensitive); add
  EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES=true (plain text). All EXPO_PUBLIC_* plain text or sensitive, never secret.
- Confirm highest TestFlight build is 5 and highest Play versionCode is 4 (this build: iOS 6, Android 5).
- Stripe live mode: a connected-accounts webhook to /api/v1/webhooks/stripe (b#750 covers a missing one when the coach opens Payouts).
- Supabase Apple provider client IDs include com.growthproject.app. Play reviewer accounts. POSTHOG key (optional).

## Carried Cs (edge-case freeze; not day 1)
Trust cue row overclaim (unused component), wearable export size, "ODed" spellings, "not breathing" with a person -> medical scope,
coach list cap 200, Guide call logs lack coach id, anon key can list coach packages incl. drafts/share tokens (RLS C), leaked-password
protection off, /terms intro "company policy draft", download pages "private review", FAQ doc 30-day deletion, community inbox rows not
saved (dup guard), coach push permission prompt on fresh install, Today "Send your coach a message" does nothing while DMs are off.

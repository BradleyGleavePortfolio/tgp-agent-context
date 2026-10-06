# Operator 123 -> next operator handoff (2026-10-05 20:45 PDT)

No agents are running. GitHub is the truth: re-check every head before acting. Lane files: handoffs/op-123/ops/ (JOBS123.md has every
job entry; _COMMON_123.md the shared rules; FLEET.md every subagent). Subagent reports were in the session workspace (ops/reports/); the
ones that matter are summarised here and in the SoT Part B banner "AGENT 123".

## State
- Launch path 5/7: 1 Privacy, 2 Money (trials b#671 + payment sheet m#342 + trial push m#338), 3 Coach, 4 Failed payments (dunning v2
  flag OFF), 6 Remainder (programs on, voice sweep m#339, tax CSV m#340, booking options m#381). Left: 5 Health Connect (owner device
  pass on the 10-07 build; code + flag live since deploy 4) and 7 (10-07 Expo build + store review).
- Backend main 5230306cb63df7290459bb362340a42f385f39d5 = production (deploy 8, 20:35, run 37409368179, no migrations). Main CI green.
- Mobile main a727eb495a0ce381a22c4ac40370c0c69f53a656 (m#386 merge; CI green at a0e225df, check a727eb49).
- Merged today 118 (backend 64 incl. Roman stack pieces into stack branches, mobile 54). Deployed today 8.

## Production flags (env sync apply 37409749015, 20:37, verified on machine 860311cee0d008)
- ON: FEATURE_COMMUNITY_API, _POSTS, _MESSAGES, _PUSH, _REALTIME, FEATURE_MESSAGING_CORE_V2, FEATURE_ROMAN_CHAT_ENABLED,
  FEATURE_ROMAN_ADJUST_ENABLED (plus earlier today: BOOKING_REMINDERS_ENABLED, FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO,
  FEATURE_NAMED_REGIMES, MWB_AUTOSAVE_LOCK_TOKEN_SECRET, FEATURE_WEARABLES_INGEST_POST, GOOGLE_CLIENT_IDS).
- OFF by design (screens merged, waiting on an owner device pass on the 10-07 build): FEATURE_COACHLESS_HOME (m#386),
  FEATURE_COACH_CODE_TOOLS (m#387), FEATURE_COACH_BROADCASTS (m#388). Turning each on = one manifest line PR + lens pair + env sync.
- OFF: FEATURE_DUNNING_V2 (owner must confirm the Stripe customer portal is on in live mode first), DM, voice notes.
- env-truth 37405459790 (names only): ANTHROPIC_API_KEY present (64-127). APPLE_AUDIENCES shape check FAILS -> Sign in with Apple fails
  until the owner sets the Apple sign-in key (A8.6).

## 10-07 Expo build carries (34 mobile merges since the last EAS build ff6bd4b, 10-01)
m#386 388 387 385 384 383 338 339 381 382 340 342 341 352 345 337 365 379 371 355 372 378 321 335 312 359 368 315 305 326 327 314 330 333.
eas.json (m#383): Roman chat on in production + clinic; community tab, hall, cohorts on in production. EXPO_PUBLIC flags are fixed at
build time.

## Open PRs (not dependabot)
| PR | Head | State | Next |
|---|---|---|---|
| b#657 coachless split | c25960a8 | superseded (coachless landed in pieces; mobile m#386) | close with owner OK (decision 1) |
| b#659 broadcasts split | fa9a7cbd | superseded (b#726 + m#388) | close with owner OK (decision 1) |
| m#331 Roman conversations list | 5b58a121 | superseded per agent 122 notes | close with owner OK (decision 1) |
| m#336 S-SCHED-5 request auto-expiry | e043bb44 | superseded per agent 122 notes | close with owner OK (decision 1) |
| b#427/#428, m#262/#264/#265, m#283, importer/scout b#5xx, m#302 | old | not day 1 | leave |
b#650 closed automatically at 20:08 when its replacement b#740 merged (b#740 body said it supersedes b#650).

## Today under operator 123 (18:27-20:45)
Deploys 6 (0521b393, migrations), 7 (e6f9a5ec, migrations), 8 (5230306c). Merged: m#381, b#643, m#342, m#340, b#737, b#725, m#382,
Roman train into #667 (dual APPROVE c5c86cb4), b#738 (proxy-addr critical advisory), m#339, b#736, b#671 trials, m#338, b#739 (pills/OD
-> 988 on AI guide and Roman), b#740 (day-1 flags), b#741 (Roman adjust on), m#383 (eas.json flags), m#384 (C-337 copy), m#385 (code
errors), m#387 (coach Codes screen), m#388 (broadcasts composer), m#386 (coachless Home; FIX ROUND 2 closed both Bs).

## Next actions
1. Owner decisions 1 (close b#657, b#659, m#331, m#336) and 2 (turn on Codes + Broadcasts after the device pass).
2. After the owner's device pass on the 10-07 build: flag PRs for FEATURE_COACH_CODE_TOOLS, FEATURE_COACH_BROADCASTS, then
   FEATURE_COACHLESS_HOME (needs a featured coach configured; the owner saves the Roman pitch text himself, suggested wording:
   "Sir/Ma'am, just so you're aware, TGP's top coach has available slots. Enter code <code> and join for <price>. Interested?").
3. Carried Cs (freeze): C-388 Sentry 503 noise on Messages while broadcasts is off; C-386-a onboarding-agreement screen; Roman sends
   "overdose on cardio" / "can you overdose on creatine?" to 911 (over-routing); dotted "O.D." not routed; the C list in the SoT banner.

## Owner to-dos
- Health Connect device pass + Android push check on the 10-07 build (launch step 5).
- Apple sign-in key (APPLE_AUDIENCES failing). Supabase Pro on day 1. Confirm POSTHOG_KEY. Play reviewer accounts.
- Stripe customer portal on in live mode before dunning v2.
- Try the Codes, Broadcasts and no-coach Home screens on the 10-07 build.

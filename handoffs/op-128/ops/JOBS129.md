# JOBS129.md: new job entries written by operator agent 128 for agent 129 (2026-10-07, 15:40 PDT)
Every agent first reads ops/_COMMON_128.md (shared rules). Older entries (CLIENTFIX-128, LN-OPUS-128, LN-SOL-128, FIX-128, DES-*) are in
ops/JOBS128.md. Auditors never change code or open PRs. No production writes. Never use real customer data.

## EXPLORE-129 (Claude Opus 5.5, AUDITOR, 3 instances: EXPLORE-CLIENT-129, EXPLORE-COACH-129, EXPLORE-SUBCOACH-129; 150 min)
Owner 15:33, quoted exactly: "I also want 3 agents launched that just go through the app like a client, coach, and subcoach - jsut acting like a
normal person but intentionally finding break points - closing the app halfway, turning wifi off, finding neglected features, ect - I want
them to dig deep, especially deep into the UI pathways, stuff we've forgotten about alltogether!"
Personas:
- **CLIENT:** a paid client of a coach with an ACTIVE package; compare with a coachless free user where paths differ.
- **COACH:** an independent coach. Sign-up, Stripe Connect and payouts, packages and checkout links, invites, building and assigning workouts
  and meal plans, messaging, check-ins, Roman for coaches, the AI builder, payments per client.
- **SUBCOACH:** a sub-coach in a head coach's organisation. Assigned clients, what they can and cannot see or do (server and UI), how the head
  coach adds, assigns, reassigns and removes them. A known C to re-grade: an assigned sub-coach has no sharing grant, so sees no client logs
  (coach.service.ts:437).
Method:
1. **Map every pathway from code.** Start at the role's navigator root and list every reachable screen, tab, modal, sheet, deep link, email
   link and push target, every button and its handler, and every state: first run, loading, empty, error, offline, slow, killed mid-action,
   backgrounded, returning after days, expired session, no or expired package, no coach, lots of data. Save the map as
   reports/EXPLORE-<ROLE>-129-map.md. Mark the screens no audit or redo touched on 2026-10-07 (check reports/ and today's merged PR titles)
   as FORGOTTEN, and go deepest there.
2. **Walk days 1 to 14 as a normal person, trying the break points at every step:**
   - close the app halfway through any multi-step flow
   - lose wifi before, during and after a save
   - double-tap; back gesture mid-save; background the app and return
   - open from a push or email link while signed out
   - change time zone; let the session expire
   - delete, then re-add
   - very long names and very large numbers
   - empty accounts and full ones
3. **Prove each finding** with file:line, the handler and the API path. Where you can, reproduce it with a throwaway jest render test in your
   own worktree (never pushed), or with read-only production SELECTs or unauthenticated GETs.
4. **Grade per _COMMON_128.** B = normal use plus money, privacy, safety, data loss, security, store-legal, a false claim or a core dead end,
   with a one-sentence user story. U = a clear UX defect; dead buttons, data lost on close or offline, and false copy are at least U.
   C = "C (edge, deferred to 10k clients)".
5. **Write reports/EXPLORE-<ROLE>-129.md:**
   - a findings table (grade, user story, steps, evidence)
   - the FORGOTTEN features list
   - proposed fix jobs: file-disjoint, under 400 lines each, with model and tier
   Append progress every 30 minutes. Send the operator each B the moment it is proven.

## AUD-FIN-129 (Claude Opus 5.5, AUDITOR, 7 instances; 60 min each)
Finish the "Not checked" list of an audit stopped at 14:46 (STOPPED_HALFWAY.md section A), under that audit's own entry in JOBS128.md.
Instances: AUD-FIN-ONB-129 (FW-ONB-128), AUD-FIN-MONEY-129 (FW-MONEY-128), AUD-FIN-TRAIN-129 (FW-TRAIN-128), AUD-FIN-BODY-129
(FW-BODY-128), AUD-FIN-COACH-129 (FW-COACH-128), AUD-FIN-FOOD-129 (FW-FOOD-128), AUD-FIN-DESIGN-129 (DESIGN-QA-128). Read the original
report first and do not repeat it. Write reports/<INSTANCE>.md with findings and proposed fix jobs that don't overlap files already claimed
in CLIENTFIX-128.

## AUD-COACH-WEEK1-129 (Claude Opus 5.5, AUDITOR, 90 min)
The coach's first week, which no FW-* audit covered: sign-up as a coach, Stripe Connect onboarding and payout status, packages (create,
edit, archive, price changes), checkout links, inviting clients, building and assigning workouts and meal plans, messaging, reviewing
check-ins, Roman for coaches, the AI builder and the AI-credits line, payments per client. B/U/C grading and fix jobs, as in FW-*.

## AUD-ORG-129 (Claude Opus 5.5, AUDITOR, 90 min)
Head coach and sub-coach: roles, invites, assignment and reassignment, permission boundaries (server guards and UI), sharing grants, credit
pooling, removal, and what a removed sub-coach keeps seeing. Grade every finding; fix jobs.

## ROMAN-GUARD-129 (Claude Opus 5.5, BUILDER, T4 backend, under 300 lines)
Fix b#846 U1 (reports/LN-OPUS-A-128.md): an accurate "today" number in a sentence that also mentions "usual", "baseline" or "last month"
gets Roman's whole reply replaced. Keep the guard for wrong numbers. Failing-first test.

## PB-GAP-129 (Claude Opus 5.5, BUILDER, T4 backend, under 200 lines; owner decision 2, default yes)
A coach's playbook rebuild is skipped when that coach's last successful build is under 6 hours old, including the run 3 minutes after each
restart (reports/LN-OPUS-B-128.md). The m#513 copy ("a few times a day, only when something new was added") must stay true.
Failing-first test. Merge before b#855 (FEATURE_ROMAN_PLAYBOOK).

## CF-PROFILE-FIN-129 (GPT-6.1 Sol, FIXER, T1 mobile)
Finish draft mobile#522 per the HANDOFF section of reports/CF-PROFILE-128.md: failing-first test, parity table, README, tests, CI, then mark
the PR ready and post READY.

## IOS-RELEASE-129 (Claude Opus 5.5, PREP, mobile PRs only; no builds and no submissions)
READY by 21:30 PDT so the 23:00 build has it:
1. A PR adding an `eas.json` submit profile for production (no secrets in the repo; credentials stay in Expo) and the `app.json`
   buildNumber bump.
2. A draft of the App Review notes (the demo accounts are a placeholder for the owner's tester accounts; how to reach paid features).
3. Check every iOS permission string (camera, photos, HealthKit, notifications, tracking) against real use; ITSAppUsesNonExemptEncryption;
   account deletion in the app; Sign in with Apple wherever Google sign-in is offered.
Report each B with its fix.

## STORE-AUD-129 (Claude Opus 5.5, AUDITOR)
Compare the App Store listing copy, the screenshot plan and the privacy nutrition labels with what the app really collects and does. Cover
the SDKs (Sentry, PostHog, Crisp, Stripe, Supabase, HealthKit) and the guidelines on purchases of coaching services, account deletion,
sign-in parity and HealthKit use. List every B with an exact fix. No submissions.

## APK-FINAL-129 and SHOTS-129 (GPT-6.1 Sol, RUNNERS, start at 23:00 PDT from mobile main)
Final APK with the workflow on branch ci/APK-127-2, and App Store screenshots with ci/SHOTS-127-2. Copy the workflow onto a fresh ci/*
branch from the 23:00 main SHA. Never merge ci/* branches. Report the artifact links and the main SHA used.

## Wave 2 (launch as each item's predecessor merges)
- **COACH-PAY-M-129** (Claude Opus 5.5, T4 mobile): the coach payments screen per client (payments list, refund, pause, cancel) on the
  CF-COACH-PAY-BE-128 endpoints. Owner: "coaches HAVE to be able to issue refunds".
- **QA wave 2** (Claude Opus 5.5; rows in reports/DESIGN-QA-128.md): QA-PRIM first, then QA-LIVE (after m#521), QA-SETTINGS (after
  CF-SETTINGS), QA-HABITS-CAL-COMM, QA-ROMAN-PROFILE (after m#523 and CF-ROMAN-COPY-M), QA-COACH and QA-SHEETS.

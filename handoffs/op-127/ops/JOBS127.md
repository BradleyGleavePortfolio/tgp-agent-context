# JOBS127 — agent 127 job entries (read _COMMON_127.md first, then ONLY your entry)

## LN-SOL-127 (GPT-6.1 Sol, LENS, T4) — backend #823 at its current head. Time box 30 min.
Review growth-project-backend#823 (revision 0 for new standalone workouts; setExercises writes a manual_edit revision and moves the head)
at its exact current head (was ec96487ae327a189a0112828f54921cbfb63c264). Do not read the Opus verdict first. Background (operator trace):
a NEW standalone workout is saved by createPlan + setExercises (mobile CoachWorkoutBuilderScreen: autosave only when editing an existing
planId; explicit Save always PUTs setExercises). Without a revision the head stays null (AI propose 409, autosave 409). The fix must keep
the head equal to the rows, in the same exercises_json shape autosave and the AI applier read (client_ref etc.), inside the existing
transaction. Check: head == rows after create, after Save, after autosave, after AI apply/undo; tenancy unchanged; version/lock token
moves consistently with autosave so the next autosave/propose is not falsely 409; no change to programs/assigned copies. Post ONE verdict
comment (format in _COMMON_127 item 7). Report ops/reports/LN-SOL-127.md.

## SAFE-AIB-127 (Claude Opus 5.5, SAFETY PASS, T4 AI, read-only) — AI workout builder go/no-go. Time box 50 min.
Plan: tgp-agent-context/handoffs/op-125/AI_MASTER_BUILDER_PLAN.md (read Part 1 and Part 2 sections 0-6). Same 12-point checklist idea
as SAFE-MWBAI-125: (1) the model writes the diff and the server validates it; (2) library-only exercise ids; (3) hard bounds per workout,
per week (24 / beginner 16) and 14-exercise ceiling, including subset Apply; (4) injury contraindications removed server-side, positive
keep-clauses handled, progression cannot load an injured area; (5) no medical claims; (6) coach approval before anything reaches a
client; (7) metering debits the coach AI pool once per call and the out-of-credits state is specific; (8) AI consent box 2 checked before
any client data reaches the provider; (9) tenancy on every route (status, propose, apply, undo, revisions); (10) 409/422/429/503 states
reach the mobile copy (mobile main 5e3e9398: AiBuilderSheet, aiBuilderApi.ts); (11) kill switch works without a build and the app shows
the paused state; (12) flip values exactly: FEATURE_MWB_AI_LIVE_CREATE=true, AI_GATEWAY_ENABLED=true, AI_GATEWAY_PROVIDER=anthropic,
AI_GATEWAY_CAPABILITIES=draft.create_workout_plan,draft.edit_workout_plan (never `*`), AI_GATEWAY_REQUIRE_APPROVAL unset — and confirm
which OTHER gateway capabilities would start calling the provider with those values (must be none). Read backend main bdc9d911 plus the
open b#823 diff (revision 0). Also answer: (a) is the prepared patch /home/user/workspace/ops/reports/B-AIB3-126-AIB3b-wiring.patch
still needed after b#813 merged (per-client generator parity), yes/no with file:line; (b) does the coach-facing builder cover the plan's
"7 coach jobs" on mobile main (list each: works / missing + file:line); (c) any normal-use B that blocks the flip. Run the stub-provider
propose specs only through ops/heavy.sh one file at a time (deps may still be installing; then read only). Verdict GO / GO AFTER FIXES /
NO-GO with the exact fix list. Report ops/reports/SAFE-AIB-127.md. Never flip a flag, never open PRs.

## B-SHARE-127 (Claude Opus 5.5, BUILDER, T4 privacy/consent) — coach sharing folded into the accept the client already taps. 150 min.
Owner 09:24 10-07 (verbatim): "coach sharing - try to just sneak it in somehwere they already click accept". Earlier owner 19:20 10-06
questioned a separate permission prompt when a coach relationship implies normal log sharing.
The launch B (FU-FOODLOG-126 B2, ops/reports/B-SHARE-126.md and FU-FOODLOG-126.md): non-owner coaches see NOTHING of a client's food,
workouts, weigh-ins and habits (consent.service.ts ~328-336 requires FITNESS_* scopes that no app surface grants; the owner role
bypasses, so the owner never saw it). Held attempts: backend #820 (GET /consent/me owner_access metadata, dual-approved) and mobile #451
(separate sharing prompt + settings toggles; Sol REQUEST CHANGES: missing owner_access treated as false falsely promises an owner coach
cannot read logs). Read both PRs, B-SHARE-126.md and the Sol verdict on #451.
Build the owner's design: the client grants coach sharing by tapping the accept/join control they ALREADY tap when a coach relationship
starts. Enumerate every path that links a client to a coach on main (coach code redeem in CoachCodeSheet, invite link/accept, package
purchase incl. guest checkout that links an account, coach-added client, featured coach) and for each: (1) put one plain sentence
directly above or on the existing accept/join/pay button, e.g. "Joining shares your workouts, food logs, weigh-ins and check-ins with
<coach name>. Change this any time in Settings > Privacy." (visible text on that screen, never only inside the general Terms; this is
what keeps it valid under Washington's health-data law: a specific accept for this coach); (2) server-side, record the FITNESS_* consent
grant for that client-coach pair at link time with a source/version marker naming the notice, in the same transaction as the link,
only when the request came from a client surface that showed the notice (send a notice version from mobile; old app builds that do not
send it get no grant, i.e. today's behaviour). No backfill of existing clients, no grants for any other purpose, Roman/AI consent stays
separate and unchanged. Keep a truthful Settings > Privacy control to stop sharing (reuse #451's toggles where sound; fix its owner_access
unknown-vs-false fallback; if #820's metadata is needed, carry it into your backend PR). Privacy policy / trust page: one accurate
sentence if it does not already say coaches see logs. Two PRs at most (backend first, mobile works against current production: no
notice version accepted -> no grant, copy still truthful). Close nothing; the operator closes #820/#451 as superseded. Report
ops/reports/B-SHARE-127.md.

## B-DIGEST-127 (Claude Opus 5.5, BUILDER, T4 email + token) — nightly digest emails with links that work. Time box 120 min. Backend only.
Facts: DigestService (src/notifications/digest.service.ts, scheduler digest.scheduler.ts) sends a coach daily digest at 06:00 UTC (23:00
PDT), a client daily at 07:00 UTC, weekly Sunday 08:00 UTC. Links default to hosts that do not exist: APP_URL default
https://app.thegrowthproject.app, CONSOLE_URL default https://console.thegrowthproject.app (digest.service.ts ~47-49); unsubscribe links
go to <host>/settings/notifications which does not exist (:145, :211); the coach template's "Open coach console" CTA (templates
digest-coach*.hbs) goes nowhere. Last night it actually sent (NotificationDigestLog: 2 coach_daily sent incl. an internal system coach
account "contracts-system", 1 client_daily sent). The real public web host is https://app.trygrowthproject.com (privacy pages live there)
and the API is https://api.trygrowthproject.com — verify both in code/config before using them.
Build: (1) every link in all four templates goes somewhere real (CTA opens the app's existing universal/deep link if one exists on main,
otherwise a real public page; no dead hosts; no first person, no exclamation marks); (2) a working one-click unsubscribe without sign-in:
a signed, expiring, per-user, per-kind token (HMAC with an existing server secret; constant-time compare; no user id guessing) on a public
GET page that confirms and a POST that turns that user's email digest preference off, plus List-Unsubscribe and
List-Unsubscribe-Post headers; reuse the existing preference field the scheduler already reads; (3) digests skip system/internal
accounts (find how "contracts-system" is marked; exclude by that marker, not by email text). Tests failing-first. If a new env name is
needed, add it to ENV_RULES and the manifest as "unset" with a safe code default — never require a new secret. Target READY FOR AUDIT
by 12:30 PDT so it can deploy before 23:00 tonight. Report ops/reports/B-DIGEST-127.md.

## V1-LEDGER-127 (GPT-6.1 Sol, READ-ONLY, 45 min) — the definitive open v1 blocker list.
Sources: every report in /home/user/workspace/ops/reports/*126* and ops/aud-126/**, tgp-agent-context/handoffs/op-126/HANDOFF.md
(incl. "Still open for launch" and "Existing findings not built"), DEVICE_PASS_10-07.md, and SoT A8.9 is NOT in scope (edge cases).
For every B and U listed there, check current mains (wt/RO-backend bdc9d911, wt/RO-mobile 5e3e9398; also `gh pr list` merged since
10-06) and mark FIXED (PR #) or OPEN (file:line on current main). Known open candidates to confirm: help-centre copy saying a paid plan is
required; share-link guest checkout reads saved Stripe readiness (storefront/guest-checkout.service.ts ~262-275; LX-OPUS-126); AI
assignment push paths; recurring-package welcome email may send before payment (billing.service.ts ~706-722, ~808-816); Settings shows
check-in 9:00 for everyone (U-441-1); water "not saved" notice survives a successful retry (U-449-1); iPhone portion picker may open behind
the Add Food sheet; post-launch T4 check-ins mark-reviewed authorisation. EXCLUDE: coach sharing (B-SHARE-127), digest links
(B-DIGEST-127), AI builder (SAFE-AIB-127), coachless copy U-4 (owner choosing wording), anything an edge case under A2.
Output ops/reports/V1-LEDGER-127.md: (1) OPEN list, each with B/U, one-sentence user story, file:line, smallest fix, tier (T0-T4), repo;
(2) grouped into builder jobs of under 600 lines each, one repo per job, with the canonical builder model per SoT A3 (T4 -> Claude Opus
5.5; T2 -> GPT-6.1 Sol; T0/T1 -> GPT-6 Luna) and which jobs can run in parallel without touching the same files; (3) FIXED list (one
line each). No PRs, no code changes.

## R11-PLAN-127 (Claude Opus 5.5, PLANNER, read-only, 50 min) — Roman's increased intelligence: what to build now.
Plan of record: SoT A7.2 (Roman v1.1 plan; read all of A7.2) and A6.4. Already merged per logs: b#769 M1 memory schema (migration
20270401000000), b#770 P2, b#771 P1 playbook schema (20270402000000), b#772 seams, b#773 P3a, b#774 M2, b#775 consent v5, b#811
memory_on capability, m#446 memory consent offer; FEATURE_ROMAN_MEMORY and FEATURE_ROMAN_PLAYBOOK are unset in production. Verify each
on main (PR titles + code), then answer in plain words and engineering detail:
(1) What Roman can do today in production vs what is built-but-off vs not built, per pillar (memory, watching, coach twin, tool-using
turns, butler). (2) The shortest safe path to switch ON memory and coach playbook (what is missing: notes writer, retrieval in the turn,
deletion manifest, privacy policy sentence "notes survive chat deletion", eval cases, metering on every turn, consent gate) with exact
file:line. (3) The next highest-impact slices for "hyper-specific answers" (Pillar E / phase 4 read tools scoped to the caller, budgeted
tool loop, answer contract with citations to the client's own data), each under 600 changed lines, T-graded, with failing-first tests,
merge order, dependencies and which can run in parallel. Target: what 4-6 Claude Opus 5.5 builders can land and deploy TODAY. (4) Ready-
to-paste JOBS entries for each slice in the style of this file. (5) Owner-facing summary (10 lines, plain words, no risk section).
Report ops/reports/R11-PLAN-127.md. No PRs.

## SHOTS-127 (GPT-6.1 Sol, CI BUILDER, T1, throwaway branch) — App Store screenshot pipeline. Time box 120 min.
Goal: real iPhone screenshots of the current app for App Store Connect: 6.9-inch (1320 x 2868, iPhone 16 Pro Max / 17 Pro Max simulator)
and 6.5-inch (1284 x 2778 or 1242 x 2688). app.json ios.supportsTablet is false, so no iPad set. Approach: a workflow-only commit on a
THROWAWAY branch ci/SHOTS-127-<n> created from mobile main (never open a PR, never merge; same pattern as the APK branches
origin/ci/APK-126-2 — read that branch's workflow first). Free GitHub macOS runner (repo is public): npm ci, expo prebuild for iOS
with the eas.json "clinic" profile env (read eas.json; production API), pod install, xcodebuild a simulator Release build (no signing),
boot the simulator, `xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4
--wifiBars 3`, then drive the app with Maestro flows committed on that branch and save screenshots with `xcrun simctl io booted
screenshot`. Credentials come ONLY from GitHub Actions secrets REVIEW_CLIENT_EMAIL, REVIEW_CLIENT_PASSWORD, REVIEW_COACH_EMAIL,
REVIEW_COACH_PASSWORD (the operator sets them later; mask them; if absent, the run still captures the signed-out screens: welcome,
sign-in, role choice). Target shots (client): Home, Train (assigned workout), live workout logging, Log food with macros, Progress,
coach Messages, Roman chat, Calendar booking, Community. (coach): Clients list, client detail, workout builder with Ask AI sheet,
Programs, Money. Upload all PNGs as one artifact per size. First milestone: a green run that builds and captures the signed-out
screens, then the signed-in flows (written and ready even before secrets exist). Report the run URL, artifact names and what each
flow captures in ops/reports/SHOTS-127.md. Never touch EAS, App Store Connect, signing or secrets values. Delete nothing but your own
ci/SHOTS-127-* branches.

## SEED-127 (GPT-6.1 Sol, BUILDER, T2, NO WRITES until the operator says go) — store-review accounts with synthetic sample data. 90 min.
The two store-review accounts exist (a review coach and a review client, created 10-06 via public sign-up; client not yet linked to the
coach). Their passwords are not available to you. STORE_TEXT_10-07.md section 3 (tgp-agent-context/handoffs/op-126/) says what reviewers
must find: an active coaching plan, assigned workouts, included PDF/video files, a booking/session, a coach conversation, Community
membership, leaderboard opt-in available, Roman available, Settings > Privacy, Support. Write /home/user/workspace/ops/seed/seed_review.mjs
(Node 20, no new deps; fetch) that signs in with REVIEW_COACH_EMAIL/PASSWORD and REVIEW_CLIENT_EMAIL/PASSWORD from env and, through the
PUBLIC API only (https://api.trygrowthproject.com/api; read the controllers on main for exact routes and bodies), sets up: coach profile
+ business name "TGP Demo Coaching"; one appointment type + weekly hours; a FREE package (no Stripe charge; check the free-or-at-least-
$19.99 rule) that includes one small PDF and one short video if the upload routes allow; a 4-workout program and one standalone workout;
a coach code; the client redeems the code, takes the free package, gets the program assigned, books one session, exchanges two messages
with the coach, joins Community; synthetic client history the API accepts (a few food logs, one logged workout, three weigh-ins). Every
step idempotent (re-run safe: check before create), `--dry-run` default that only prints the planned calls, `--apply` to write. No direct
SQL, no service-role key, no Stripe calls, nothing for any account except these two. Report the exact plan, routes used, and anything
the API cannot do (e.g. backdated history) in ops/reports/SEED-127.md. Do NOT run --apply.

## B-U4-127 (GPT-6.1 Sol, BUILDER, T2 mobile) — coachless copy, owner-chosen Version B. Time box 75 min. Mobile only.
Owner 09:31 10-07 chose Version B. Source finding: /home/user/workspace/ops/reports/AUD-E2E-CLIENT-126.md "U-4" (read it). When the
signed-in client has NO coach (cached user has no coach_id; confirm the field on main), every gate they hit says exactly:
title "Join a coach to start logging", body "Enter the code your coach gave you.", one primary button "Enter a coach code" that opens
the EXISTING coach-code sheet (CoachCodeSheet; today it is hosted from Home > Messages for coachless clients — reuse that path, do not
build a second sheet). Surfaces: src/entitlements/ProtectedScreen.tsx (both the iOS purchases-hidden branch and the "Choose a Plan"
branch), src/entitlements/PaywallSheet.tsx (COACH_MANAGED_* only for the no-coach case), src/screens/client/ClientPackagesScreen.tsx
empty/gate states (~388-430). Clients WITH a coach keep today's copy exactly. Day 1: src/screens/client/Day1WinScreen.tsx shows only the
"Log your starting weight" card when the client's entitlement is not active (weight logging is not gated); entitled clients keep all
cards. After a successful code join the gate must clear (entitlement refresh already happens in the sheet — verify). Tests failing-first
for each surface. Work against current production (no backend change). Report ops/reports/B-U4-127.md.

## B-GUESTPAY-127 (Claude Opus 5.5, BUILDER, T4 money) — share-link guest checkout reads stale Stripe readiness. Time box 90 min. Backend.
Finding (ops/reports/LX-OPUS-126.md "C for the operator"; read b#821 for the in-app fix): b#821 refreshed the coach's Stripe Connect
readiness for the in-app Buy only; the share-link guest checkout (src/storefront/guest-checkout.service.ts ~262-275 on main) still
reads the saved mirror, so a coach whom Stripe has approved still refuses guest buyers until the coach opens the app (or the reverse).
User story: a new coach finishes Stripe onboarding, posts their share link, and the first buyer is told the coach cannot take payments.
Smallest fix: reuse b#821's refresh helper in the guest path with the same bounds/fallback. Failing-first spec. Also read
ops/reports/AUD-MONEY-E2E-126.md for anything else on the guest path that is a normal-use B (money only). Report ops/reports/B-GUESTPAY-127.md.

## B-WELCOME-127 (Claude Opus 5.5, BUILDER, T4 money-adjacent email) — no "You're enrolled" before payment; one welcome per purchase. 90 min.
Findings: ops/reports/B-GUEST-126.md (line ~42: recurring-package account + "You're enrolled" welcome email may go out before the buyer
pays; billing.service.ts ~706-722 and ~808-816 on main) and ops/reports/AUD-MJ-BILL-126.md J3 (guest welcome email can send twice; raw
Resend POST with no idempotency, guest-checkout.service.ts ~1713/~2063; optional fix: send via EmailService with key
guest-welcome:<checkout id>). User story: a client starts a monthly package, their card is declined, and they still get "You're enrolled".
Fix both with the smallest change: send the enrolment welcome only after payment is confirmed (the same signal that turns entitlement
on), exactly once per purchase (idempotency key / EmailSendLog). No change to charging, entitlement or dunning logic. Do not touch
src/storefront/guest-checkout.service.ts lines owned by B-GUESTPAY-127 (Stripe readiness ~262-275); if you must edit that file, keep to
the email lines and name the overlap in your PR body. Report ops/reports/B-WELCOME-127.md.

## B-HELPCOPY-127 (GPT-6.1 Sol, BUILDER, T1 copy, backend) — coach help centre tells the truth. Time box 60 min.
Finding (ops/reports/AUD-E2E-COACH-126.md B1, read it): https://app.trygrowthproject.com/help/setup, /help/first-client, /help/tour,
/help/faq describe a web "coach console" that does not exist and a paid coach subscription production does not require (owner 10-06
19:23 removed coach subscription tiers; coach tools are mobile-only). File: backend src/public-pages/help-pages.html.ts (COACH_CONSOLE_URL
~53, setup steps ~179-235, first client ~240-300) and the related refusal message billing.service.ts ~1667-1672 if it tells coaches to
subscribe (copy only; do not change the guard). Rewrite to match the app on main: coach steps happen in the mobile app (Settings > Get
paid / Stripe, first package, invite code or share link, programs, booking hours). No first person, no exclamation marks, no claims the
app does not do, never name the clinic partner. Update any test that pins the old text. Report ops/reports/B-HELPCOPY-127.md.

## B-FOODLOG3-127 (GPT-6.1 Sol, BUILDER, T2 mobile) — everyday food/check-in polish (owner: food and workout logging must be kick ass). 90 min.
Fix on mobile main, one PR: (1) U-449-1: "8 oz of water was not saved" notice stays after the client adds water again successfully
(clientStore.logWater never clears loadError on success, ~197-212; ops/aud-126/LX-OPUS-126/mobile-449.md has the smallest fix);
(2) U-441-1: Settings > Notifications shows "Check-in Time 9:00 AM" for every client instead of the Day-1 choice (useSettings.ts:26;
SettingsScreen.tsx ~286-287; show the Day-1 answer kept in account-scoped device storage, or hide the row when none) and U-441-2 first
person "Skip. I'll set this later." -> "Skip for now" (src/screens/day-one/i18n/en.json:75); (3) iPhone: the portion picker may open
BEHIND the Add Food sheet (device-pass item from FU-FOODLOG-126; reproduce by reading the modal stacking on iOS and fix the stacking so
the picker is on top). Then trace once, as a real client on iOS and Android, search food -> pick portion -> add -> edit -> delete ->
repeat meal, and fix any further normal-use U in that flow you can fix in under 150 lines. No backend change. Report ops/reports/B-FOODLOG3-127.md.

## LN-OPUS-127 (Claude Opus 5.5, LENS, T4) — Opus lens queue for agent 127 PRs. Time box 120 min total.
Every 5 minutes (sleep 300 between polls; stop at the time box), list open PRs in both repos whose head branch starts with "agent127/"
and whose latest comment first line is a "FIX ROUND ... — READY FOR AUDIT" naming the CURRENT head sha, and that have no
"AUDIT Claude Opus 5.5" verdict at that head. For each, in order of READY time: full review (30 min box; delta re-review 20 min if you
already reviewed an earlier head), then post ONE verdict comment (format _COMMON_127 item 7). Never read a GPT-6.1 Sol verdict at that
head before posting yours. Report ops/reports/LN-OPUS-127.md (one line per verdict: PR, head, verdict, Bs). If nothing is READY for 30
minutes in a row, finish.

## V1-TRAIN-ENTRY-127 (GPT-6.1 Sol, BUILDER, T2 mobile) — assigned workouts reachable from Home; Resume label. Time box 75 min.
Do ledger rows U-V1-5 and U-V1-8 exactly as written in /home/user/workspace/ops/reports/V1-LEDGER-127.md (read those two sections and the
"Parallel/file ownership" notes). Files: src/screens/client/HomeScreen.tsx, src/screens/client/WorkoutAssignmentDetailScreen.tsx, one
new regression test file. B-U4-127 is editing the coachless gate surfaces (ProtectedScreen, PaywallSheet, ClientPackagesScreen,
Day1WinScreen, maybe the Home code-sheet host): keep your Home edit to the workoutExists / CTA decision only; if both PRs touch HomeScreen
the later one rebases. Report ops/reports/V1-TRAIN-ENTRY-127.md.

## V1-COACH-SETTINGS-127 (GPT-6 Luna, BUILDER, T1 mobile) — coach Settings truthfulness. Time box 60 min.
Do ledger rows U-V1-1 (hide the Meal Templates Settings row for v1; default) and U-V1-4 (bio save: cache and confirm only after the API
succeeds; on failure keep the editor open with "The bio was not saved. Check the connection and try again.") exactly as written in
/home/user/workspace/ops/reports/V1-LEDGER-127.md. Files: src/screens/coach/SettingsScreen.tsx (+ settings/ProfileSection.tsx only if
needed), one new regression test file. Report ops/reports/V1-COACH-SETTINGS-127.md.

## LN-SOL2-127 (GPT-6.1 Sol, LENS, T3/T4) — Sol lens queue for agent 127 PRs. Time box 150 min total.
Same as LN-OPUS-127 but you are the GPT-6.1 Sol lens: every 5 minutes (sleep 300 between polls; stop at the time box), list open PRs in
both repos whose head branch starts with "agent127/" and whose latest "FIX ROUND ... — READY FOR AUDIT" comment names the CURRENT head
sha, and that have no "AUDIT GPT-6.1 Sol" verdict at that head. For each, in order of READY time: full review (30 min box; delta
re-review 20 min if you reviewed an earlier head), then post ONE verdict comment (format _COMMON_127 item 7, model name "GPT-6.1 Sol").
Never read a Claude Opus 5.5 verdict at that head before posting yours. Flag-manifest PRs (e.g. backend agent127/flip-aib-127): check
values against ENV_RULES closed sets, scripts/fly-env/fly-env-manifest.js PRECONDITIONS and the gate text; no code. Report
ops/reports/LN-SOL2-127.md (one line per verdict). If nothing is READY for 30 minutes in a row, finish.

# ---- Roman R11 entries (from ops/reports/R11-PLAN-127.md section 4; operator decisions D2 yes, D3 FEATURE_ROMAN_TOOLS yes, D4 keep Haiku 4.5, D5 defer) ----
Common to every R11 builder entry: backend repo unless marked mobile; worktree from origin/main, branch agent127/<job-lower>, at /home/user/workspace/wt/<JOB>-backend; failing-first tests; one targeted jest file at a time via ops/heavy.sh; size checked before every push; PR body tier header + 'What changes for coaches/clients' + B/U list; FIX ROUND 1 (OPENING) comment after CI green; report ops/reports/<JOB>.md + notify line. No production flag changes, deploys or merges. If your entry says 'then' another entry, do the second only after the first PR is READY. Also read ops/reports/R11-PLAN-127.md sections (2)-(3) for context.
## R11-L1-127 (Claude Opus 5.5, BUILDER, T3 legal copy, 40 min) — privacy policy: Roman's notes, chat deletion, coach-method learning.
Owner basis: A6.4 ("notes survive chat deletion and the privacy policy says so") and the v5 paragraph the owner approved 10-06 12:01
(src/ai-consent/ai-consent.constants.ts:97-110). Copy follows that paragraph; no new promises. In src/public-pages/trust-pages.html.ts:
:35 POLICY_LAST_REVIEWED -> today's date from `TZ=America/Los_Angeles date`. :211 data list: add "Roman's notes and summaries — short
notes Roman keeps about your training, preferences and circumstances, if you allow them". :268: name water and habit logs and bookings
in the list of what Roman receives; replace "and never your coach's private notes about you" with the v5 truth, conditional: "If you
allow Roman's notes in Settings > Privacy > Roman and AI, Roman may keep notes and summaries to personalise his replies, and may learn
your coach's methods, including from your coach's private session notes, without identifying you. Roman never quotes those notes or
shows you another client's information. Your coach never sees your conversations with Roman or his notes about you." :269 add
"Deleting a chat removes its messages but not Roman's notes; deleting your account removes them." :306 retention: add "Roman's notes and
summaries — kept until you delete your account; deleting a chat does not remove them." :430 health-data policy derived information: add
"Roman's notes and summaries". Update test/trust-pages.spec.ts:328-337 failing-first (new sentences asserted; the old "never your
coach's private notes" assertion replaced). No first person in product copy, no exclamation marks. Under 150 lines. Title:
"docs(privacy): Roman's notes survive chat deletion; coach-method learning (R11-L1)". Merge first in the R11 order.

## R11-T2A-127 (Claude Opus 5.5, BUILDER, T4 consent scope, 75 min) — Roman seam 2: tool types, FEATURE_ROMAN_TOOLS, memory-scope send.
Inert on main except one rule that only matters once an augmenter exists. (a) NEW src/roman/tools/roman-tool.types.ts with EXACTLY:
  export const ROMAN_TOOLBOX = 'ROMAN_TOOLBOX';
  export type RomanToolName = 'read_history' | 'exercise_history' | 'food_day' | 'personal_baselines';
  export interface RomanToolDefinition { readonly name: RomanToolName; readonly description: string;
    readonly input_schema: { readonly type: 'object'; readonly properties: Record<string, unknown>; readonly required?: readonly string[] }; }
  export interface RomanToolCaller { readonly id: string; readonly role: string; }
  export interface RomanToolFacts { readonly intake_past_kcal?: readonly number[]; readonly burned_past_kcal?: readonly number[]; }
  export interface RomanToolResult { readonly ok: boolean; readonly content: string; readonly rows: number; readonly truncated: boolean;
    readonly facts?: RomanToolFacts; readonly error_code?: 'bad_input' | 'range_too_large' | 'not_allowed' | 'unavailable'; }
  export interface RomanToolbox { definitions(): readonly RomanToolDefinition[];
    run(caller: RomanToolCaller, name: string, input: unknown, opts: { readonly now: Date }): Promise<RomanToolResult>; }
  export const ROMAN_TOOL_LIMITS = Object.freeze({ max_rounds: 3, max_calls_per_turn: 6, max_result_chars: 12_000,
    turn_wall_ms: 25_000, tool_timeout_ms: 3_000 });
(b) NEW src/roman/tools/roman-tools.feature.ts isRomanToolsEnabled (exact 'true' only, same as roman-memory.feature.ts:14); register
FEATURE_ROMAN_TOOLS in src/common/env-validation.ts after the FEATURE_ROMAN_PLAYBOOK entry (~:2226); manifest
.github/fly-env-desired-state.json add "FEATURE_ROMAN_TOOLS": "unset" after :53 and a note after :134 ("v1.1 tool-using turns, off until
R11-F3; unset = off; emergency kill: unset"); runbook docs/runbooks/launch-flags.md row after :143 and a sentence in :205.
(c) src/roman/roman.service.ts: inject `@Optional() @Inject(ROMAN_TOOLBOX) private readonly toolbox: RomanToolbox | null = null` after
:232 (stored only). (d) Memory-scope rule in streamAssistantTurn: when runAugmenters (:1023-1024) returns >= 1 applied block, read
`this.egress.consentedClients([caller.id], 'memory')` once; if the caller lacks it, drop every block (prompt = exactly today's) and log
`roman.augment_dropped reason=no_memory_scope`; if present, send with `clientDataSubject(caller.id, 'client', 'memory')` at :1079-1081
(the refusal path at :1112 already settles zero). Zero augmenters registered = no extra query (main stays byte-identical).
Failing-first tests in test/roman/r11-seams.spec.ts: fake augmenter + v4 caller -> no block and base-scope send; v5 caller -> block after
client_data and memory-scope send; flag registry + manifest "unset"; isRomanToolsEnabled only for 'true'. Under 300 lines. Title:
"feat(roman): R11-T2A seam 2 — tool types, FEATURE_ROMAN_TOOLS, memory scope for augmented turns (T4, inert)". Then build R11-T2B.

## R11-T1-127 (Claude Opus 5.5, BUILDER, T4 tenancy/PII, 2 h) — Roman read tools scoped to the caller (inert until R11-T2B + R11-F3).
Implements RomanToolbox from src/roman/tools/roman-tool.types.ts exactly as pinned in R11-T2A (build against that text now; open the PR
after R11-T2A merges, merging main first). NEW src/roman/tools/roman-read-tools.ts (class RomanReadToolbox) and
src/roman/tools/roman-exercise-history.ts. Register in src/roman/roman.module.ts: import after :22, providers after :44
(`RomanTimelineReader, RomanReadToolbox, { provide: ROMAN_TOOLBOX, useExisting: RomanReadToolbox }`). Rules: run() refuses every role
but 'student' (not_allowed); the subject is caller.id only, never a value from input; zod-validated input, unknown keys rejected; every
result is compact JSON <= ROMAN_TOOL_LIMITS.max_result_chars with truncated flag; numbers are computed in code, never by the model.
Tools: read_history {kinds subset of food_day, workout_done, workout_missed, weight, water, habit, check_in, wearable_day, message,
booking; from, to as YYYY-MM-DD, <= 31 days} -> RomanTimelineReader.read (src/roman/memory/roman-timeline.reader.ts:145; never the
activity or adjustment kinds); exercise_history {exercise 2-60 chars; from/to default last 90 days, max 180} -> ExerciseSet via
workout.user_id = caller.id, exercise_name contains (case-insensitive), <= 60 sessions, per session date, sets, reps_per_set,
weight_per_set, rpe, top set, est. 1RM (Epley) and volume, plus first-vs-last change in code; food_day {date within 365 days} ->
LoggedFoodEntry for user_id = caller.id on that date, reusing the kcal/macro math of roman-client-context.service.ts (~:760-800) so
numbers match client_data. facts: past-day intake kcal (food_day totals and entries) and past-day active kcal (wearable_day) for the
post-check. Failing-first tests test/roman/tools/roman-read-tools.spec.ts: another user's rows never queried (assert where clauses);
coach role -> not_allowed; > 31 days -> range_too_large; disallowed kind -> bad_input; Epley + change computed; clamp + truncated;
facts populated. Under 600 lines. Title: "feat(roman): R11-T1 read tools scoped to the caller (T4, no caller until R11-T2B)".
Wave 2 for this builder: R11-T3.

## R11-T2B-127 (Claude Opus 5.5, BUILDER, T4 AI spend/egress, 2.5 h) — budgeted tool loop in the Roman turn (behind FEATURE_ROMAN_TOOLS).
After R11-T2A (same builder). NEW src/roman/tools/roman-tool-loop.ts (loop helper) + edits in src/roman/roman.service.ts
streamAssistantTurn only. Active only when isRomanToolsEnabled() && this.toolbox && grounded && bundle; otherwise byte-identical to
today (one streaming call). Loop: up to ROMAN_TOOL_LIMITS.max_rounds calls of this.egress.anthropicMessagesCreate
(ai-egress.service.ts:314) with the same model/thinking/effort/system/messages plus tools = toolbox.definitions(); on stop_reason
tool_use run each tool_use block (<= max_calls_per_turn per turn, each <= tool_timeout_ms; over the limit -> an is_error tool_result),
append the assistant content and the tool_result blocks; after max_rounds or turn_wall_ms, one final call with no tools. The final text
then takes today's path: post-check (:1158), persist once, settle, one delta + done. SSE frames stay delta|done|error only (mobile
src/api/romanApi.ts:180 rejects anything else). Metering: tools turns reserve (max_rounds + 1) x (payload.inputTokenBound +
max_calls_per_turn x max_result_chars) input and (max_rounds + 1) x ROMAN_MAX_OUTPUT_TOKENS output (extend reserveDailySpend :1354 with
an optional output bound); the coach-pool pre-check (:1485-1488) uses worstCaseTurnCents() x (max_rounds + 1); settle once with the
summed usage of every round and debit the coach pool once with the sums (:1045-1052); content-free ledger fields tools, tool_rounds,
tool_calls, tool_names (closed names), tool_errors. Abort and egress refusal settle the known usage. Post-check: merge result facts into
kcal_facts.intake_past_days and burned_past (postCheckContextOf :1691) so a tool-fetched past-day number is not rewritten. Crisis
short-circuit, consent check and pool check stay before any tool call. Failing-first tests test/roman/r11-tool-loop.spec.ts (fake
toolbox + stub client): flag off -> one call, no tools field; tool_use then text -> toolbox gets the session caller, one persisted
reply, only delta/done; max_rounds then a no-tools final call; summed settle + one pool debit; pool pre-check refuses below the tools
worst case; cited past-day kcal survives the post-check; refusal mid-loop settles and throws. Target under 600, hard stop 780. Title:
"feat(roman): R11-T2B budgeted tool loop with full metering (T4, FEATURE_ROMAN_TOOLS off)".

## R11-M4-127 (Claude Opus 5.5, BUILDER, T4 PII/egress/spend, 2.5 h) — Roman's notes from chats (writer, behind FEATURE_ROMAN_MEMORY).
NEW src/roman/memory/roman-notes.schema.ts (closed kinds from prisma/schema.prisma:8718-8721; key `<kind>.<slug>`, slug
^[a-z0-9_]{1,40}$; text 3-160 chars; reject contact details with containsContact from src/roman/playbook/playbook-scrub.ts; default
expiry 30 days for schedule and travel, none otherwise), src/roman/memory/roman-notes.writer.ts, src/roman/memory/roman-notes.scheduler.ts
(@Cron '*/10 * * * *' UTC, name 'roman-notes'). Register in roman.module.ts: import after :28, providers after :51. Each run, only if
isRomanMemoryEnabled() and the Anthropic client exists: up to 25 clients with client-surface user turns newer than
RomanMemoryState.notes_watermark_at; keep only clients in egress.consentedClients(ids, 'memory') and only turns written after their live
client-ai-v5 grant; others get last_outcome 'no_consent' and no call. Per client: <= 40 newest unseen user turns (never Roman replies,
coach messages or any other user), each sanitised and clamped to 1,000 chars, plus the client's live notes (<= 60) so the model can
update them. Admission RomanBackgroundSpendService.reserve({ capability: 'roman.memory', payer: { kind: 'client', clientId }, model:
ROMAN_MODEL_BACKGROUND, inputTokenBound, maxOutputTokens: 800 }) (roman-background-spend.ts:100); refusal -> outcome code, skip.
Send egress.anthropicMessagesCreate(handle, clientDataSubject(clientId, 'client', 'memory'), 'roman.memory', ...); settle (:192).
The model returns JSON notes (<= 12): stable facts the client stated about themself; never inferred conditions, never log numbers the
database already holds. Invalid items are dropped (codes only in logs). One transaction per client: a live note with the same key is
superseded (superseded_at, superseded_by_id); the new note carries source_message_id and source_at; state watermark, last_run_at,
last_outcome 'ok'. Failing-first tests test/roman/memory/roman-notes.writer.spec.ts: flag off -> no reads or calls; v4-only client -> no
call; v5 client -> one call on 'roman.memory' with scope memory; turns before the grant excluded; refusal -> no call; invalid items
dropped; same key supersedes. Under 600 lines (hard stop 780). Title: "feat(roman): R11-M4 notes from chats (T4, flag off)".

## R11-M5-127 (Claude Opus 5.5, BUILDER, T4 PII, 90 min) — client-memory block in the turn (behind FEATURE_ROMAN_MEMORY).
Same builder as R11-L1 (after it). NEW src/roman/memory/roman-client-memory.augmenter.ts (kind 'client_memory'); provide
`{ provide: ROMAN_CLIENT_MEMORY_AUGMENTER, useClass: RomanClientMemoryAugmenter }` in roman.module.ts providers after :47 (import after
:27). Returns null unless isRomanMemoryEnabled() and caller.role === 'student'. Reads RomanClientNote where client_id = caller.id (never
an id from bundle or input), superseded_at null, expires_at null or later than now, newest 40; RomanClientSummary newest 2 week + 1 month
rows if any. Block, <= 2,500 chars, sanitised: "# CLIENT MEMORY" + one instruction line (things this client told you in earlier chats,
dated; use them naturally when relevant; do not list them back; prefer client_data when they disagree) + `<client_memory>` lines
"YYYY-MM-DD · <kind label> · <text>". hash = sha256 of the block; estimated_tokens = ceil(chars / 3.5). Memory consent is enforced by
the R11-T2A seam; merge only after R11-T2A. Failing-first tests test/roman/memory/roman-client-memory.augmenter.spec.ts: flag off -> null;
coach -> null; superseded and expired excluded; newest first and clamp; query scoped to caller.id; through RomanService with the seam: v4
caller gets no block, v5 caller gets the block after client_data. Under 400 lines. Title: "feat(roman): R11-M5 client memory in the turn
(T4, flag off)". Wave 2 for this builder: R11-W1.

## R11-P3B-127 (Claude Opus 5.5, BUILDER, T4 PII/egress/spend, 4 h, two PRs in order) — the coach playbook builder.
PR 1 "feat(roman): R11-P3b-1 playbook source collector (T4, no model, no writes)": NEW src/roman/playbook/playbook-sources.ts
PlaybookSourceCollector.collect(headCoachId, now) -> { roster, items, ledger, digest, consentedClientIds, signals }. Team = head coach +
active sub-coaches (same rule as playbook-signals.service.ts); consented = egress.consentedClients(teamClientIds, 'memory'). Items:
CoachGuideline text (coach-authored), program/template names and exercises, meal plan names and guidance (coach-authored); coach-to-client
CoachMessage only to consented clients, last 90 days, <= 150; CoachingSession.coach_notes_md only for consented clients, last 120 days,
<= 80. Every string through scrubPlaybookText(text, roster) (playbook-scrub.ts:198); <= 600 chars per item, <= 40,000 total. signals =
PlaybookSignalsService.compute(head, { clientIds: consented }). Ledger rows {source_kind, source_id, client_id?}; digest = sha256 of the
sorted ledger. Register PlaybookSignalsService and the collector in roman.module.ts (providers after :45, imports after :24). Tests:
other coaches' rows never read; non-consented clients' messages and notes excluded; roster names scrubbed; caps. Under 550 lines.
PR 2 "feat(roman): R11-P3b-2 playbook builder and schedule (T4, FEATURE_ROMAN_PLAYBOOK off)" after PR 1 merges: NEW
src/roman/playbook/playbook-builder.service.ts + playbook-builder.scheduler.ts. Only while isRomanPlaybookEnabled(): 3 minutes after boot
and every 6 hours, up to 20 head coaches with >= 1 client; skip when digest equals the active playbook's source_digest; admission
background.reserve({ capability: 'roman.playbook', payer: { kind: 'coach', coachId }, model: ROMAN_MODEL_PHASE_1, ... }); subject =
consented.length ? clientDataSubject(consented, 'coach', 'memory') : noClientDataSubject('coach_own_scope') with only coach-authored
items in that case; surface 'roman.playbook'. Model returns sections + red_lines JSON; validatePlaybookDraft (playbook-validate.ts:397)
with validateCoachPlaybook and the private texts (session notes, messages) for the verbatim rule; valid -> one transaction: old active ->
superseded, new version active with source_count, source_digest, model_id, plus CoachPlaybookSource rows; settle spend. Tests: flag off ->
nothing; same digest -> no call; refusal -> no call; invalid draft -> no write; v1 then v2 supersedes; memory-scope subject. Under 600.

## R11-P4-127 (Claude Opus 5.5, BUILDER, T4, 90 min) — coach-method block in the turn (behind FEATURE_ROMAN_PLAYBOOK).
NEW src/roman/playbook/roman-coach-method.augmenter.ts (kind 'coach_method'); provide `{ provide: ROMAN_COACH_METHOD_AUGMENTER,
useClass: RomanCoachMethodAugmenter }` in roman.module.ts providers after :43 (import after :25). Null unless isRomanPlaybookEnabled() and
caller.role === 'student'. Head coach of the client's CURRENT live coach (src/roman/context/roman-coach-scope.ts +
CoachAIBudgetService.resolveHeadCoachId); the one active CoachPlaybook of that head coach, re-validated with validateCoachPlaybook
(coach-playbook.schema.ts) before use (invalid -> null). Block "# COACH METHOD" + one instruction line (how this coach trains, feeds and
recovers clients; shape advice to it; never mention a playbook or that it was learned; never quote the coach's notes) + `<coach_method>`
items per section (<= 12 each) and red lines as plain rules; post_check.red_lines = the red-line phrases. In-process cache by
(coach_id, version), 10 minutes, <= 200 entries. Memory scope enforced by the R11-T2A seam (owner/operator decision D2); merge after
R11-T2A. Tests: flag off -> null; no coach -> null; a former coach's playbook is never used after reassignment; superseded ignored;
invalid stored JSON -> null; through RomanService the coach surface never gets the block. Under 450 lines. Title: "feat(roman): R11-P4
coach method in the turn (T4, flag off)". Next for this builder: R11-C2 if the owner says yes.

## R11-T3-127 (Claude Opus 5.5, BUILDER, T3 prompt/eval, 2 h, wave 2) — answer contract + golden cases for tools, memory and method.
Start when R11-T1, R11-T2B, R11-M5 and R11-P4 are merged. src/roman/roman.prompts.ts: input `tools?: boolean`; only when true add
"# LOOKING THINGS UP" (use a tool when the question needs data outside client_data; ask for the narrowest range) and "# ANSWER CONTRACT"
(name the client's own numbers with their dates; tie advice to the coach's guidelines or method when present; one clear next step; say
plainly when data is missing; never invent a number). roman.service.ts passes tools: true only on tools turns (prompt byte-identical
otherwise). test/roman/eval/stub-model.ts: scripted messages.create with tool_use. test/roman/eval/golden-set.ts G38-G47: bench
progression via exercise_history; "what did I eat last Tuesday" via food_day; three weeks of sleep via read_history; tool tenancy mirror
(persona P2's rows never reach P1); tool error -> plain "cannot see that", no number; v5 note used ("dislikes oats" -> no oats); v4 holder
gets no memory block; coach surface gets neither block; method block shapes advice and the reply never says "playbook"; deleted chat ->
note still present, transcript gone. Layer 7 in roman-golden.eval.spec.ts. Under 600 lines. Title: "test(roman): R11-T3 answer
contract and golden cases G38-G47 (T3)". R11-F3 (tools flip) waits for this PR to be merged and deployed.

## R11-W1-127 (Claude Opus 5.5, BUILDER, T4 health data read-only, 90 min, wave 2) — "your normal": personal baselines tool.
After R11-T1 merges. NEW src/roman/tools/roman-baselines.ts; add personal_baselines to RomanReadToolbox.definitions(). For sleep
minutes, HRV, resting heart rate, steps, active kcal (WearableSample via the same summarizeWearables helper the context uses), weight
trend, protein average (food) and sessions per week: 28-day median and range versus the last 7 days, computed in code; flags reuse
ADJUST_THRESHOLDS (src/roman-adjust/roman-adjust.rules.ts:21-37) so Roman and approve-to-adjust agree; fewer than 7 data days ->
"not enough data". caller.id only, student only. Tests: numbers computed in code; insufficient data; tenancy; clamp. Under 500 lines.
Title: "feat(roman): R11-W1 personal baselines read tool (T4)".

## R11-C2-127 (Claude Opus 5.5, BUILDER, T4 consent, 2 h, OPTIONAL: owner decision D1, default yes) — v5 where clients already accept.
Backend PR (<= 100 lines): src/ai-consent/ai-consent.service.ts:266-268 add the additive field `memory_copy: memoryOn && scope !==
'memory' ? clientAiConsentV5Copy() : null`; tests in test/ai-consent/ai-consent-v5-scope.spec.ts. Mobile PR (growth-project-mobile,
worktree /home/user/workspace/wt/R11-C2-127-mobile): consultation box 2 reads GET /me/ai-consent at mount; when memory_on is true and
memory_copy is a well-formed client-ai-v5 copy, the box shows that paragraph and the grant posts { version: 'client-ai-v5', copy_sha256:
memory_copy.sha256 } (src/lib/consultation/aiConsent.ts:46-48, src/api/aiConsentApi.ts:74-77,176-177); otherwise today's pinned v4
exactly (works against the current production backend, which sends no memory_copy). Same box label, still optional and unticked.
Tests: v4 fallback when the field is absent or malformed; v5 body when present. Lands in today's APK only if lens-clean before the cut;
otherwise next build.


## DESIGN-AUD-127 (Claude Opus 5.5, AUDITOR, read-only, 90 min) — is TGP luxurious, vibrant, world class? Owner question 09:59 10-07.
Owner asked (verbatim): "Is client side food logging and workout logging simple, beautiful UI, luxurious and world class? Is the app
overall luxurious and vibrant, does it speak 'health and mental clarity'? ... go search for those anwsers and find room for improvement".
Answer both questions honestly with evidence, then give a ranked improvement list. Method:
1. Read mobile main (read-only worktree /home/user/workspace/wt/RO-mobile; fetch origin main first via a fresh read-only worktree if
   needed): theme/tokens (colors, typography, spacing, radii, shadows, motion), shared components, and every client screen in the food
   log flow (Log screen, food search, portion picker, meal list, water, macros) and workout flow (Workouts tab, assignment detail, active
   workout logging, rest timer, set entry, finish/summary, history), plus Home, Day-1, Roman chat, check-in, progress. Note empty/loading/
   error states, haptics, animations, dark mode, accessibility (dynamic type, contrast), icon consistency, density.
2. Visual evidence: if /home/user/workspace/ops/shots/ or ops/reports/SHOTS-127* has screenshots, view them (read tool on the PNGs). If
   none exist yet, say the review is code-level and list exactly which screens you could not see.
3. Benchmark against best-in-class apps with web research (pplx_sdk search per the system rules): food logging (MacroFactor, Cronometer,
   MyFitnessPal premium), workout logging (Strong, Hevy, Apple Fitness), calm/wellness feel (Oura, Calm, Headspace, Whoop). Cite sources.
4. Output ops/reports/DESIGN-AUD-127.md: (a) one-paragraph plain answer to each owner question with a 1-10 score and why; (b) top 10
   improvements ranked by visible impact per hour of work, each with: screen, what a client sees today (file:line), what world class looks
   like, the concrete change (tokens/components/copy), estimated changed lines, tier (T1 visual/copy, T2 behaviour); mark which fit in a
   PR under 400 lines and can ship in today's APK; (c) a short "brand feel" direction (palette, type, motion) that says health and mental
   clarity, consistent with the existing brand (do not propose a rebrand). No PRs, no code edits, no GitHub writes. Product copy rules
   apply to any proposed wording (no first person, no emojis, no exclamation marks). Notify line as the common brief says.

## AIB-FINISH-127 (Claude Opus 5.5, BUILDER, T3 mobile, 2.5 h) — finish the AI workout builder's coach jobs (owner: "AI workout building assistance feature done").
Read /home/user/workspace/ops/reports/SAFE-AIB-127.md (U list and table "(b) The plan's 7 coach jobs") and
/home/user/workspace/tgp-agent-context/handoffs/op-125/AI_MASTER_BUILDER_PLAN.md job 6. The builder flips ON today (backend live).
Mobile only, up to two PRs, each under 600 lines, in this order:
PR 1 (T2): (a) U3: a coach can start a NEW workout with AI without saving, closing and reopening: the "Save this workout first..." bar
(CoachWorkoutBuilderScreen.tsx ~1908-1913) becomes Ask AI that saves the new workout first through the existing save path, then opens the
AI sheet; plus a "New workout with AI" entry in ProgramsLibraryScreen.tsx that opens a new workout straight into the AI sheet. (b) U1: the
thinking-stage label reads "Checking training limits" unless an injury area was chosen (aiBuilderCopy.ts:5).
PR 2 (T3): job 6 "Template to client": when the coach opens a workout for a specific client (client page Workouts tab, WorkoutsTab.tsx),
offer "Adjust for <first name>" which makes the client's copy through the existing assign/copy path and opens Ask AI with client_id set
(aiBuilderApi.ts:76-77, useAiBuilder.ts:76-79). First confirm on backend main that the AI builder endpoint accepts client_id, checks the
coach-client relationship and consent server-side, and uses the client's consultation limits; if it does not, STOP PR 2 and report what
backend change is missing (do not build backend). Failing-first tests for each behaviour. Report ops/reports/AIB-FINISH-127.md.

## LN-OPUS2-127 (Claude Opus 5.5, LENS, T3/T4) — second Opus lens queue. Time box 150 min.
Exactly the LN-OPUS-127 entry, but sign verdicts "(LN-OPUS2-127)", report ops/reports/LN-OPUS2-127.md, notify LN-OPUS2-127.txt. To avoid
double work with LN-OPUS-127: take PRs in REVERSE order of READY time (newest first), and before starting each, re-check that no
"AUDIT Claude Opus 5.5" verdict at that head exists and that the PR has no comment "OPUS LENS CLAIM" from another lens in the last 40
minutes; then post a one-line claim comment "OPUS LENS CLAIM (LN-OPUS2-127) @ <sha>" and review. If a GitHub write fails, wait 2 minutes,
retry once, then save the payload under ops/lanes127/ and continue.

## M-MEMHIDE-127 (GPT-6 Luna, BUILDER, T1 mobile, 30 min) — Roman memory offer at the very bottom of Settings > Roman AI (owner 10:09).
Owner 10:09: keep Roman's memory "hidden as much as possible - wayyyy down in settings". In src/screens/settings/RomanAiConsentScreen.tsx
(~408-421) move {renderMemoryOffer()} from directly under the state block to the end of the ScrollView, after the account line and the
Delete account button, under its own divider. No copy change, no logic change, no other surface. Update the one test that pins the order
(or add one: the memory offer renders after roman-ai-delete-account). PR under 100 lines. Report ops/reports/M-MEMHIDE-127.md.

## DES-A-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min) — legibility, appearance, copy, tab labels (design audit PR-A + PR-D).
Source: /home/user/workspace/ops/reports/DESIGN-AUD-127.md — read section (b) rows #1, #2, #3, #7, the U list items U10, U11, U16, and
section (c). One PR under 400 lines: #1 secondary text to #6B675F (colors.ts:23 and the default Typography.body colour, theme/index.ts:119)
with tests; #2 hide the Dark appearance option for launch (Settings > Appearance offers Light and System only; System resolves to light
until dark is complete; keep the code, hide the choice; an account already set to Dark renders light); #3 mood check-in buttons show one
word each; #7 tab bar labels on all client tabs (keep six tabs, sentence case, filled icon when active); U10/U11/U16 as written. No new
dependency. Coordinate: DES-B-127 owns DailySummaryBar/QuantityPickerModal/Health rings; DES-C-127 owns HomeScreen hero/WorkoutScreen
empty states. Report ops/reports/DES-A-127.md.

## DES-B-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min) — calories-left hero + macro progress bars; Health rings restyle (PR-B).
Source: DESIGN-AUD-127.md (b) rows #4 and #8 and section (c) palette. One PR under 400 lines: a small reusable progress-bar component
(forest fill on #E0EBE4 track; data trio protein forest #2C4A36, carbs #457B9D, fat #8A6A2A; tabular figures; fills animate on change
with reduce-motion honoured) used by the Food Log day summary (DailySummaryBar: "kcal left" hero + three macro bars, protein no longer in
error red) and the portion picker; the Health screen's concentric Move/Exercise/Stand rings (HealthFitnessScreen.tsx ~190-228,
cards/ThreeRingHero.tsx) become three labelled horizontal bars with the true metric names (steps is "Steps", not "Stand"). Apple's design
guidelines reserve the Activity rings look; this must not resemble them. Report ops/reports/DES-B-127.md.

## DES-C-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min) — Home and Train hierarchy + live set rows (PR-C + PR-F).
Source: DESIGN-AUD-127.md (b) rows #5, #6, #10 (and #11 if listed under PR-F). Up to two PRs, each under 400 lines. PR 1: Home hero copy
tells the truth ("One workout to go." only when a workout is assigned for today; otherwise a calm factual line such as "Rest day." or "A
clean slate."); the CTA names what it opens; Train tab for a new client leads with Quick Workout / assigned workout, and hides empty stat
row and charts until there is data (calm empty state instead). V1-TRAIN-ENTRY-127 (m#456) already edits HomeScreen workoutExists: rebase
on main after it merges and keep to the hero/CTA copy. PR 2: live workout set rows show the last performance as ghost placeholder values in
the inputs (tap Use or type over), removing the extra "Last time" row; rest timer end fires a local notification when the app is in the
background, only if notifications permission is already granted (no new permission prompt) and no new dependency. Report ops/reports/DES-C-127.md.

## R11-C2B-127 (Claude Opus 5.5, BUILDER, T4 consent, 2.5 h) — Roman memory ON by default (owner 10:18), off switch at the bottom of Settings > Roman AI.
Owner 10:18 10-07 (verbatim): "MEMORY IS ON BY DEFAULT UNLESS THEY SWITCH IT OFF! Roman needs all, every single bit, of data they ever
produce or bring in". This REPLACES R11-C2-127 and the 10:09 "opt-in only" note. Design (no separate memory question anywhere):
1. Consultation box 2 (the Roman consent every client already ticks to use Roman): when the server says memory_on, the box shows the
   server's client-ai-v5 paragraph (owner-approved 10-06 12:01; it names Roman's notes) and the single tick grants client-ai-v5. Same box,
   same label, same tick; no extra step. Otherwise today's pinned v4 exactly. Use the R11-C2-127 entry above (last occurrence) for the
   exact backend additive field (memory_copy) and mobile wiring; it is the base of this job. Do NOT pre-tick anything.
2. Existing v4 holders (very few) get v5 the next time they accept Roman's consent text; no banner, no prompt.
3. Off switch: at the very bottom of Settings > Roman AI (RomanAiConsentScreen; M-MEMHIDE-127 moves the old memory offer block to the
   bottom in its own PR, rebase on it), a row "Roman's memory" with a switch, ON for a client-ai-v5 holder. Turning it OFF records a
   memory withdrawal server-side (Roman stays allowed under v4 scope) and deletes Roman's notes for that client through the existing
   deletion manifest; turning it back ON re-grants v5 with the same text/sha. First check backend main for an existing memory-scope
   withdrawal; add the smallest server endpoint/service change only if missing (consent ledger rules, audit row, notice version).
4. Mobile copy: row label "Roman's memory", helper "Roman keeps notes from chats and logs to give answers that fit. Turn off to stop and
   delete them." No first person, no exclamation marks.
Two PRs max per repo, each under 600 lines; failing-first tests (v4 fallback, v5 grant via box 2, switch off -> withdrawal + notes
deletion, switch on -> re-grant). Report ops/reports/R11-C2B-127.md.

## B-SHARE-GUEST-127 (Claude Opus 5.5, BUILDER, T4 consent, 2 h) — coach sharing for clients who join by buying through a share link.
Source: /home/user/workspace/ops/reports/B-SHARE-127.md (decision 1) and PRs backend#827 / mobile#458 (in review; build on their
branches' design: the same sentence, the same notice version, the same server grant). Gap: guest checkout creates the client account and
links the coach without a FITNESS_* grant (backend src/storefront/guest-checkout.service.ts ~1388 convertGuestToUser), so the coach sees
"Food logs are not shared" for every share-link buyer. User story: a client buys a package from the coach's share link, logs food all week,
and the coach sees nothing. Owner design (09:24): put the sharing sentence on the button the buyer already taps (the Pay/Buy step), never a
separate step and never only in Terms. Steps: (1) find where the share-link buyer taps Pay — backend public storefront page/controller
(src/storefront/storefront-public.controller.ts and any HTML it serves), or another repo (check BradleyGleavePortfolio/tgp-platform-site and
new-website read-only); (2) if it is served by the backend, add the sentence with the coach's name next to Pay, send the notice version with
the checkout request, store it on the GuestCheckout row (no migration if an existing JSON/metadata column can hold it; if a migration is
unavoidable, STOP and report), and grant FITNESS_* at conversion with that version through the same consent service #827 uses; (3) if the
page lives outside both app repos, instead show the sentence once on the first-sign-in screen guest-created accounts already pass through
in the app (mobile) and grant on its existing Continue tap. Base on main; if #827 has not merged yet, branch from agent127/b-share-127 and
say so in the PR body. Failing-first tests. Report ops/reports/B-SHARE-GUEST-127.md.

## LN-SOL4-127 (GPT-6.1 Sol, LENS, T3/T4) — second Sol lens queue. Time box 150 min.
Exactly the LN-SOL2-127 entry, but sign verdicts "(LN-SOL4-127)", report ops/reports/LN-SOL4-127.md, notify LN-SOL4-127.txt. To avoid
double work with LN-SOL3-127: take PRs in REVERSE order of READY time (newest first); before each, re-check that no "AUDIT GPT-6.1 Sol"
verdict at that head exists and that no "SOL LENS CLAIM" comment from another lens is newer than 40 minutes; then post
"SOL LENS CLAIM (LN-SOL4-127) @ <sha>" and review. If a GitHub write fails, wait 2 minutes, retry once, then save the payload and continue.

## AIB-NAMES-127 (Claude Opus 5.5, BUILDER, T3 backend, 75 min) — the AI builder sees exercise names, so swaps and injury screens work on every row.
Source: /home/user/workspace/ops/reports/SAFE-AIB-127.md U2. Existing workout rows go to the model as ids only
(src/ai/gateway/workout-builder/... workout-builder-prompt.ts ~54-56); the injury screen and per-muscle caps only know the 50 seed ids
(validator.ts ~121 `&& ex`; week-limits.ts ~9-11). EXERCISEDB_API_KEY and EXERCISEDB_API_HOST ARE set on Fly, so production search returns
ExerciseDB ids. User story: a coach asks "swap squats for something knee-friendly" on a workout built from search results and the squat is
missed, and progression on those rows is not injury-screened. Smallest fix: send name (and muscle group when known) per row from the
seed LIBRARY or the row's stored exercise name/catalog data; make the injury screen and week limits classify non-seed rows by name/muscle
(conservative: unknown muscle never bypasses the screen — it is flagged, not silently passed). No new provider call, no prompt-size blowup
(cap per row). Failing-first tests. The builder is LIVE in production; keep behaviour for seed rows byte-identical. Report ops/reports/AIB-NAMES-127.md.

# ---- DES screen-redo entries (from ops/reports/DESIGN-AUD-127-jobs-paste.md, 10:47; the LAST occurrence of a heading wins) ----
# DES jobs, ready to paste into JOBS127.md (from DESIGN-AUD-127.md (d)2 + (d)4)

## DES-T-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — truthful copy 1: Home, its cards and Roman's greeting.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: /home/user/workspace/ops/reports/DESIGN-AUD-127.md "(d)A" and "(d)0 TRUTHFUL COPY rule", rows #1-#15. Mobile main f71b425e or
later. One PR under 400 lines.
Files you own (no other tranche-1 job edits them): src/screens/client/HomeScreen.tsx, src/components/home/CoachIntroductionBanner.tsx,
src/components/home/HolisticInsightsTile.tsx, src/components/home/PushPermissionCard.tsx, src/components/tutorial/TutorialHomeSlot.tsx,
src/components/roman/romanVoice.ts (+ their tests and the identity-spec pin test).
Do rows #1-#15 exactly as the table says. State variants, each with a failing-first test: assigned-not-done, in-progress session, done
today, no assignment, coachless, coach lookup 404, insights empty/error, nameless user, coach greeting at 09:00/14:00/20:00 device time.
Home water shows oz like the Food Log. The Home CTA keeps opening the same destination as today for each state (only its label becomes
specific); "Explore the app" becomes "Log a meal" with the same destination. Order: m#456 (V1-TRAIN-ENTRY-127) edits HomeScreen's
workoutExists effect; rebase on main after it merges and reuse its pending-assignment read for the plan name, do not re-implement it.
Row #15 follows the owner-choice default in (d)3 #12 unless the operator says otherwise; say so in the PR body. No layout change (DES-K).
Report ops/reports/DES-T-127.md.

## DES-V-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, TRANCHE 1 / WAVE 1, TODAY'S APK) — truthful copy 2: Train first day, Progress, Profile, Day-1, payments, community, coach placeholders.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md "(d)0" rows #16-#37 and #39. Two PRs in this order, each under 400 lines: PR 1 client training/progress/day-1
(rows #16-#30, #39); PR 2 payments/community/coach (rows #31-#37) + the guard tests.
Files you own: src/screens/client/WorkoutScreen.tsx, src/ui/empty-states/EmptyStateNoWorkouts.tsx, src/screens/client/ProgressScreen.tsx,
src/screens/client/ProfileScreen.tsx, src/screens/client/ReportScreen.tsx, src/screens/day-one/i18n/en.json,
src/screens/client/wearables/onDeviceCopy.ts, src/screens/client/FastingScreen.tsx (early-end cancel only), src/utils/notifications.ts
(fasting copy only), src/screens/client/PurchaseUnpackScreen.tsx, src/screens/client/MembershipScreen.tsx,
src/screens/client/CheckoutReturnScreen.tsx, src/screens/client/PrivateCommunityHubScreen.tsx,
src/screens/coach/payments/CoachPackageEditScreen.tsx, src/screens/coach/payments/CoachPackagesListScreen.tsx,
src/components/coach/ExtensionPairingPanel.tsx, src/__tests__/quietLuxuryDoctrine.test.ts, new src/__tests__/truthfulCopy.guard.test.ts.
Do the rows exactly as written. Train for a new client: assigned workout (if any), Quick Workout, routines (with "Create a routine"
wired to RoutineBuilder), history, then the charts (moved down, not removed). Progress keeps the number and the share button with the
"days in a row with a weigh-in" wording. Row #33: check backend main (read-only) for the purchase notification before keeping "has
been notified". Removals allowed only for rows marked Remove (false or dead); list each in the parity table. Guard: doctrine "coming
soon" check case-insensitive; truthfulCopy.guard.test.ts fails on the retired lines "One workout to go", "Day 7 of 30", "Everything is in
order", "finance pillar", "Your coach will assign your first workout", "Check back after your next session", "Mornings work best",
"our servers". No restyle (DES-P does layout). Report ops/reports/DES-V-127.md.

## DES-F-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — food logging, luxurious and comfortable.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 rows 1-2 and (e); part-1 top-10 #4 and #9 (food half). Images: design-targets/mobile/plan/plan_luxury.jpg,
plan-fullweek/luxury.jpg (look, not content). One PR under 400 lines.
Files you own: src/components/log/DailySummaryBar.tsx, src/components/log/QuantityPickerModal.tsx (macro preview block only),
src/components/log/MealSectionCard.tsx, src/components/log/FoodSearchView.tsx, src/components/WaterTracker.tsx,
src/components/DaySelector.tsx, new src/ui/progress/QuietBar.tsx (+ tests).
Do: (1) QuietBar: forest fill (existing forest token) on an sc.border hairline track, 4 pt tall, label and value Inter 13 pt with
fontVariant tabular-nums, fill animates <=300 ms, no animation under reduce-motion. (2) DailySummaryBar: calories-left hero in Cormorant
(eaten when there is no target), one muted line "of <target> · <eaten> eaten", then Protein / Carbs / Fat bars, all forest (no
Colors.orange, gold or lavender), "<n> g over" in words; simple macro mode keeps showing exactly what it shows today (calories +
protein); every number shown today stays shown (rule 4). (3) Portion preview monochrome, same values. (4) Inter on every Text in these
files; nothing under 13 pt except the weekday overline (11 pt, letter-spaced); muted via sc.textMuted; hairline rows instead of cream
boxes. (5) DaySelector: today = small forest dot, past plain, future sc.textMuted; same day-tap behaviour. (6) "Retry Search" -> "Try
again". Every control keeps its action; tap targets >=44 pt. Do not touch LogScreen.tsx (DES-L). Report ops/reports/DES-F-127.md.

## DES-W-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — live set rows: ghost values, Previous column, comfortable type.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 4; part-1 #10 and #9 (workout half). One PR under 400 lines. Files you own:
src/screens/client/active-workout/SetLogger.tsx, src/screens/client/active-workout/styles.ts (+ tests).
Do: previous weight and reps show as ghost placeholder values in the inputs (sc.textMuted); ticking a row with blank inputs logs the
previous values and shows them as real text; typed values override; no previous = today's behaviour. The separate "Last time ..." line
(SetLogger.tsx:165) becomes a compact "Previous" cell in the same row (e.g. "60 × 10") that stays visible after typing (rule 4); its
"Use" action stays as tap-to-fill on that cell (rule 6). styles.ts: Inter, nothing under 13 pt, fontVariant tabular-nums on weight,
reps and timer text, sc.border hairlines instead of camel #B08D57, tick and inputs >=44 pt. Failing-first tests: blank + tick adopts
previous; typed overrides; Previous cell tap fills; no previous leaves blanks invalid as today. Do not edit ActiveWorkoutScreen.tsx
(DES-R) or ExerciseCard.tsx (DES-X). Report ops/reports/DES-W-127.md.

## DES-L-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, TRANCHE 1 / WAVE 1, TODAY'S APK if time) — add several foods in a row.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 3; part-1 #15. One PR under 250 lines. Files you own: src/screens/client/LogScreen.tsx,
src/components/log/FoodSearchModal.tsx. Do: after a successful add from search, keep the search sheet open with one line "Added <food>."
and a "Done" text action; the totals behind it update; the offline "Saved offline" path is unchanged; every action the sheet has today
stays (search, portion, manual entry, repeat meal, close). Sentence-case alerts ("Missing info", "Delete food"). Do not edit
QuantityPickerModal.tsx (DES-F); if the confirmation needs it, STOP and report. Failing-first tests: two foods added without reopening;
Done closes; a failed add keeps the sheet and the entered portion. Report ops/reports/DES-L-127.md.

## DES-A-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — legibility, appearance, mood words, tab labels (REVISED; replaces the queued draft).
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md part-1 (b) #1, #2, #3, #7, U16 and part-2 (e). One PR under 400 lines. Files you own: src/constants/colors.ts,
src/theme/index.ts, src/theme/ThemeProvider.tsx, src/screens/client/SettingsScreen.tsx (Appearance block :311-335 only),
src/screens/client/habits/constants.ts, src/screens/client/habits/MoodEnergyPicker.tsx, src/navigation/ClientNavigator.tsx (tab
screenOptions and icons only), src/components/home/HomeHeaderActions.tsx, and the ~12 tests that pin #B1A89F.
Do: #1 legacy textMuted #B1A89F -> #6B675F (colors.ts:23) and the default Typography.body colour (theme/index.ts:119); #2 Appearance
offers Light and System, System resolves to light, a stored Dark renders light, dark code kept; #3 one word per mood button, no word in
the emoji slot (constants.ts:5, MoodEnergyPicker.tsx:43), same five choices; #7 labels on all client tabs (Inter 11 pt, sentence case),
OUTLINE glyphs kept, active = forest + medium weight, inactive sc.textMuted, keep all six tabs and every tab route; U16 both Home header
icons 24 pt, same actions. Changed from the queued draft: U10 moved to DES-V, U11 moved to DES-T, icons stay outline. Rebase over
m#458/#454/#451 as they merge (different hunks). If a #B1A89F-pinning test sits next to a file another tranche-1
job owns (e.g. food or Home tests), change only that colour assertion and say so in the PR body. Report ops/reports/DES-A-127.md.

## DES-K-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 1 entry, STARTS WHEN DES-T AND DES-A MERGE (DES-A owns HomeHeaderActions.tsx), not today's APK unless both merge by 12:15) — Home layout per the A23 targets.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 9; images plan/plan_luxury.jpg and coach-home-solo/luxury.jpg (structure only); plan/README.md
rubric. One PR under 400 lines. Files: src/screens/client/HomeScreen.tsx, src/components/home/HomeHeaderActions.tsx.
Do: overline date (small caps, letter-spaced, sc.textMuted); serif headline = DES-T's truthful line; one forest primary action; every
number cell homeCells() returns today, in one hairline row of serif tabular numerals, each keeping its tap-to-Log behaviour; remove the
96 px gap (:444); below-fold cards (profile, coach, push, tutorial, insights, coachless slot, pending invite, dunning) stay, as hairline
sections in the same order; a 32 pt Roman avatar in the header opening Roman chat when featureFlags.romanChat is on (an added route, not
a replacement for the More entry). No copy change beyond layout. Report ops/reports/DES-K-127.md.


## DES-R-127 (Claude Opus 5.5, BUILDER, T2 mobile behaviour, 2 h, WAVE 2 start any time, NOT today's APK) — rest alert in background + quiet finish.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 5; part-1 #11 and #13 as corrected (no particles, QUIET_LUXURY_DOCTRINE §3). One PR under 450 lines.
Files you own: src/screens/client/ActiveWorkoutScreen.tsx (rest timer ~:493-518 and ~:1316-1342 only),
src/screens/client/active-workout/WorkoutFinishSummary.tsx. Do: when the rest timer is running and the app goes to background, schedule
one local notification for the rest end with expo-notifications (already a dependency), ONLY if permission is already granted (never
prompt); cancel it on foreground, skip, adjust, finish and discard; copy "Rest over. Next: <exercise>, set <n>." Finish summary: single
fade <=300 ms, success haptic through the existing haptics service, the three headline numbers (time, sets, volume) in serif tabular
numerals, a PR sentence only for a real PR, and every action the summary has today kept in place (list each in the parity table); no
ParticleBurst, no scale or spring. Failing-first tests: schedule/cancel paths, permission denied (no schedule), parity of finish
actions. If you need styles.ts, wait for DES-W to merge. Report ops/reports/DES-R-127.md.

## DES-H-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 75 min, WAVE 2 after DES-F merges) — Health without invented goals.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)0 row #38; part-1 #8. One PR under 400 lines. Files: src/screens/client/wearables/HealthFitnessScreen.tsx,
src/screens/client/wearables/cards/ThreeRingHero.tsx (or a new bars card that replaces it). Do: replace the concentric rings with
three labelled rows using QuietBar from DES-F: "Active energy", "Exercise minutes", "Steps" (never Move / Exercise / Stand), each with
its real value and sample date ("Tue 6 Oct"); a bar fill only when a real coach or client target exists, otherwise the value alone;
remove the invented RING_GOALS defaults (:71-75). Every metric shown today stays shown; every tap into metric detail
(goToMetricDetail) and the connect CTA stay; coach-embed mode keeps its read-only behaviour. Tests: no data, stale sample, with target,
without target, coach embed, parity of taps. Report ops/reports/DES-H-127.md.

## DES-P-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 2 after DES-V merges) — Progress, "the full picture".
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 12; image design-targets/mobile/progress-details/luxury.jpg (look, not content). One PR under 400
lines. Files: src/screens/client/ProgressScreen.tsx and new presentational components under src/components/progress/. Do: title +
small-caps overline ("SINCE <first log date>" only when a first log exists); BODY section with the latest weight, change since start and
goal in serif tabular numerals between hairlines (only values that exist); weight chart, period switch (7D/30D/90D/All), goal progress,
body stats, recent entries, Log weight, report link and the weigh-in run + share all kept, in a calmer order (latest numbers, chart,
entries, secondary links); text links instead of boxed buttons where the action is secondary. No photos or illustrations. Report
ops/reports/DES-P-127.md.

## DES-X-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 60 min, WAVE 2 after DES-W merges) — exercise card, quieter but identical.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 6 (revised: styling only). One PR under 300 lines. Files:
src/screens/client/active-workout/ExerciseCard.tsx (+ styles.ts after DES-W merges). Do: exercise name in Inter 17 pt medium, sets
summary 13 pt muted, action icons as 24 pt outline glyphs in one row with >=44 pt targets and accessibility labels; same actions, same
order, same tap count, no new sheet. Parity test lists every action before and after. Report ops/reports/DES-X-127.md.

## DES-M-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 2) — Roman chat, the "Guidance" look.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 10; image design-targets/mobile/ai-guide/luxury.jpg (look, not content). One PR under 400 lines.
Files: src/screens/roman/RomanChatScreen.tsx and its presentational children under src/components/roman/ (NOT romanVoice.ts, NOT
consent or memory screens; R11 lanes own those). Do: Roman's messages in Cormorant 19-20 pt with an "ROMAN" small-caps label, the
user's messages right-aligned in Inter with a "YOU" label, no bubbles, hairline separators; any suggestion chips become text links with the
same effect; input on a hairline with a square forest send button; typing, error, retry, consent gate, rate-limit and pool-empty states
unchanged in behaviour. If the owner approves the italic weight ((d)3 #6), use it for Roman's one-line notices only. Report
ops/reports/DES-M-127.md.

## DES-N-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, WAVE 2 after DES-A merges, ONLY ON AN EXPLICIT OWNER YES) — five client tabs.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)3 #2. Default is to keep six tabs; launch this only if the owner says five. One PR under 250 lines.
Files: src/navigation/ClientNavigator.tsx, src/screens/client/MoreScreen.tsx, src/navigation/README.md (+ tutorial target ids if
affected). Do: Community moves from a tab to the first row of More in the clinic build; every Community route, deep link and
notification target keeps working (test each); tutorial steps that pointed at the tab point at the row. Report ops/reports/DES-N-127.md.

## DES-S-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, WAVE 3 after m#458, m#451 and DES-A merge, ONLY ON AN EXPLICIT OWNER YES) — client Settings, grouped.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 14; Stillwater T2.3; guide §4.3 ("5-7 sections"). Two PRs in order, each under 400 lines. File:
src/screens/client/SettingsScreen.tsx (795 lines) + new section components under src/screens/client/settings/. Rule 4 limit: grouping
on ONE screen with small-caps section overlines and hairlines (Account, Training and food, Notifications, Privacy and data, Roman,
Support, About), NOT a drill-down that adds taps; every row, switch and destination stays on the same screen. Parity test enumerates
all rows before and after. Report ops/reports/DES-S-127.md.

## DES-O-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, WAVE 3) — coach landing, A23 look with real counts.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 17; images coach-home-solo/luxury.jpg and coach-home-headcoach/luxury.jpg (look, not content).
First confirm on main which screen a coach lands on (CoachNavigator initialTab: ClientsStack unless mock data; CommandCenterScreen is the
other landing) and redesign that one; one PR under 400 lines. Do: overline date; one hero from real data (active clients; revenue only
if the money API returns real values for this coach); a sentence from real alert counts ("<n> need you. <m> are steady.") only when
both counts are known, otherwise the plain counts; hairline client rows with one-line real reasons; every metric, alert list, quick
action and route on the screen today stays. Report ops/reports/DES-O-127.md.

## DES-Q-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 3) — coach client file, Workouts tab.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 18; image clientfile-workouts/luxury.jpg (look, not content). One PR under 400 lines. Files:
src/screens/coach/client-detail/WorkoutsTab.tsx (+ the tab header in src/screens/coach/ClientDetailScreen.tsx only if it renders the
tabs). AIB-FINISH-127 PR 2 touches WorkoutsTab.tsx: start after it merges. Do: text tabs with an underline (no pills); "<x> of <y>
workouts done this week" only when y (assigned this week) is known, otherwise "<x> workouts this week"; rows with done / missed /
upcoming glyphs, date, duration and RPE where recorded; strength chart only with >=2 points; "Adjust for <first name>" and every other
action kept. Report ops/reports/DES-Q-127.md.

## DES-Z-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 3 after m#460 merges) — coach workout builder, visual pass.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 19; image coach-workout-builder/luxury.jpg + README (look only; the README's "modals are
forbidden" is NOT in scope: the exercise picker stays as it works today). One PR under 400 lines. File:
src/screens/coach/CoachWorkoutBuilderScreen.tsx (styles and layout only). Do: small-caps field overlines, hairline inputs, drag grip and
edit/delete as outline icons with >=44 pt targets, sentence-case primary action in forest; Ask AI, save, autosave pill, reorder,
add-exercise and every other action unchanged. Report ops/reports/DES-Z-127.md.

## DES-J-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min, WAVE 3 after SHOTS-127 signed-in screenshots, OWNER CHOICE (d)3 #4) — one accent.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (e) and (d)3 #4. One PR under 150 lines. Files: src/theme/tokens.ts (lightTokens.accent and accentText,
~:380 and :384) + the contrast/token tests that pin oxblood. Do: forest replaces oxblood as the light accent; textOnAccent contrast
re-verified (AA); founding-tier camel cue untouched. Before/after screenshots of five money and checkout screens in the PR body.
Report ops/reports/DES-J-127.md.


## LN-OPUS3-127 (Claude Opus 5.5, LENS, T3/T4) — third Opus lens queue. Time box 150 min.
Exactly the LN-OPUS2-127 entry, but sign verdicts "(LN-OPUS3-127)", report ops/reports/LN-OPUS3-127.md, notify LN-OPUS3-127.txt.
Priority order: (1) mobile DES-* PRs (screen redo, today's APK) — check the six owner rules in _COMMON_127.md as acceptance criteria,
especially rule 6 (the PR body lists routes/actions before and after and tests prove parity) and rule 1 (no invented copy); (2) the rest,
oldest READY first. Before each PR, re-check that no "AUDIT Claude Opus 5.5" verdict at that head exists and no "OPUS LENS CLAIM" from
another lens is newer than 40 minutes; then post "OPUS LENS CLAIM (LN-OPUS3-127) @ <sha>" and review.

## LN-SOL5-127 (GPT-6.1 Sol, LENS, T3/T4) — third Sol lens queue. Time box 150 min.
Exactly the LN-SOL2-127 entry, but sign verdicts "(LN-SOL5-127)", report ops/reports/LN-SOL5-127.md, notify LN-SOL5-127.txt. Same
priority order and claim rule as LN-OPUS3-127 (DES-* PRs first, with the six owner rules as acceptance criteria), using "SOL LENS CLAIM".

## OWNER DECISIONS 11:26 (apply to DES jobs; these override the entries above where they differ)
- Tabs: keep six with labels (DES-N cancelled). Dark mode: hidden for launch (DES-A). Client Settings grouped on one screen, nothing
  removed: DES-S APPROVED (start after DES-A mobile#467 merges). Forest green for every primary button: DES-J APPROVED (start after DES-A
  merges; do not wait for screenshots).
- Health rings (DES-H amendment): owner 11:26 "maybe populate a basic, easy to hit goal set by default for everyone". So: every client gets
  STARTER goals by default — Steps 5,000, Exercise 20 minutes, Move 250 kcal — used only when no coach- or client-set target exists.
  Honest copy: the ring/goal label says "Starter goal" (or "Starter goal: 5,000 steps") so the client knows nobody set it for them; a
  coach- or client-set target replaces it and the label drops "Starter". If an in-app goal editor already exists, link it; if not, add no
  button (no dead buttons). Keep the values in one constants file with a test.

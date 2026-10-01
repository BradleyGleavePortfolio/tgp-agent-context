# TGP LIVE STATE

- **Updated:** 2026-10-01 10:12 PDT (commit time is authoritative)
- **Operator:** Computer, session 590e4a5b ([thread](https://www.perplexity.ai/computer/tasks/590e4a5b-f81a-47d5-a4a1-914fd923c8a8)), agent 108. Single writer for Bucket A since the owner's EXECUTE at 2026-10-01 08:28 PDT. Session c712e04d is retired as writer (silent since about 19:10 PDT 09-30; its thread is not readable from this session). Its working files that never reached GitHub (onboarding contract v1, `clinic_ops/BRIEF.md`) are lost; this file and the PR bodies are the recovered authority.
- **Governing rules:** [AGENT_RULES.md](AGENT_RULES.md) G01-G22 (effective; commit identity is irrelevant per owner). Model routing: [MODEL_ROUTING.md](MODEL_ROUTING.md).

**Priority order (owner):**
1. **Bucket A, the initial customer journey:** App Store submission Sat 10-03, clinic go-live by Wed 10-07.
2. **Bucket B, the importer:** paused where it stands.

Two recurring terms:
- **Clinic partner:** the medical clinic whose patients join through a QR code. Its name is kept out of public repos.
- **Comp access:** free access granted without an in-app payment.

---

## Merges and builds (19:10)
- Mobile #304 (iOS paywall / App Store posture, T4) merged `9c6d8bfa` after Claude Opus 5.5 and GPT-6.1 Sol APPROVE at the same head plus green CI.
- Mobile #311 (Android minSdk 26 for Health Connect, T1) merged `43475cc6` after GPT-6.1 Sol APPROVE.
- Android internal APK (EAS 14a58449, production API) finished; used for owner coach signup before bootstrap.
- Backend #606 (C06 macros) and #607 (C05/C07 intake, consent-first, coach consultation view) opened, CI green, audits running.
- Open fix rounds: mobile #306 r3, #309, #310; backend auth stack CI (casts), Roman stack CI + consent on every AI path; account deletion + community safety (App Store 5.1.1(v), 1.2); engagement (welcome message, reminders).

## Operator log 10-01 09:15-10:12
- **Android launch crash (tier-1, owner-blocked) root-caused** from owner logcat: `UnsupportedOperationException: reified type parameter` in `expo.modules.crispsdk.ExpoCrispSdkModule.definition` while the Expo module registry builds. `crisp-sdk-react-native@0.2.1` was the only Expo module on the legacy `ExpoModulesCorePlugin.gradle` path under SDK 56. Fix: mobile **#316** (T2, operator-built emergency, Opus audit running) bumps to 0.4.3 (surgical lockfile). EAS preview build `f5cac78e` from `ff6bd4b` queued (eas-cli now runs from this sandbox via the Expo credential proxy: `/home/user/workspace/tools/eas/eas.sh`). Build 14a58449 came from unpushed commit a0dca32; never ship it.
- Also found: MainActivity never calls `HealthConnectPermissionDelegate.setPermissionDelegate` (Health Connect connect would crash) -> S14 lane. Sentry native auto-init is off, so pre-JS crashes are invisible -> follow-up.
- **Env truth audit** (owner tip): findings in operator workspace `ops/envaudit/ENV_TRUTH_FINDINGS_2026-10-01.md`. Highlights: five Fly keys (GOOGLE_OAUTH_CLIENT_ID/SECRET, OOM_*) share one placeholder value; junk Fly keys `E`, `E_MB`; 91 env names read by backend src are unregistered and unset (H4 board blind to them); GOOGLE_CLIENT_ID(S) unset -> Google sign-in/re-auth off; DATA_EXPORT_BUCKET unset -> exports on ephemeral /tmp; mobile reads `EXPO_PUBLIC_STRIPE_PK` but EAS stores `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`; COACH_SIGNUP_SECRET (Fly) and EXPO_PUBLIC_COACH_SIGNUP_SECRET unused; GitHub `DATABASE_URL_AUDIT` unset. Lane S-ENVTRUTH (T3) queued. No Fly deletes without operator sign-off.
- **Ruling:** v1.0 sign-in = email + Apple (Google not configured; owner may override by supplying Google OAuth client IDs).
- **Ruling:** consult consent accepts `consult-consent-v2` only (no live v1 clients; no compat window).
- **Ruling #622:** AI-consent GET/DELETE (and POST) join the dunning lockout allowlist inside #622 before audits.
- **Ruling #310:** UI labels match approved copy (Settings section "Privacy", "Delete account"); add a standard Privacy Policy link on P0 without altering consent text.
- **Heads awaiting audits:** backend #597 `fc5c5a9e`, #599 `9a0b9f94`, #595 `1b782ec8`, #604 `c3abde8d`, #606 `7e00de0c`, #607 `245da2e7`, #609 `1f8b22b9` (stacked PRs retargeted to main for CI; audit incremental ranges), #622 (R2a ledger, lockout fix pending); mobile #306 `4b349d32` (Sol + Opus running), #316 `ff6bd4b1` (Opus running), #310 (final head pending).
- **Running audits:** Sol backend auth+onboarding stacks; Sol #306 r4; Opus #316 then #306.

## Owner directions log (newest first)

| Time (PDT) | Direction | Operator disposition |
|---|---|---|
| 10-01 09:53 | Owner tip: hunt keys named in code but never set / fake / empty values (H4 tests). | Env truth audit done (see Operator log); S-ENVTRUTH lane queued. |
| 10-01 09:15 | Android APK crashes instantly on launch: hunt and fix. | Root cause Crisp 0.2.1 on SDK 56; fix #316; build f5cac78e. |
| 10-01 09:07 | Workout plans approved. Safety and consent messages approved. | Three-program fixture (sha256 be932a56...) approved for C04 seed with notes-level regressions (written cues instead of mismatched demos). Approved: D2 two-box consent copy, community guidelines incl. new rules 5 and 7, safety contact Bradley@Bradleytgpcoaching.com, 24-hour moderation commitment, consumer-health Consent section rewrite for D2. Copy changes go to #610/#314/#611/#315 before their audits. |
| 10-01 08:28 | EXECUTE for everything workable under the agent rules and the PR grading contract (session 590e4a5b). Owner supplied the exact coach welcome message text. Asked for: Apple Sign in key guidance, Android APK install steps for a Mac + Samsung, a plain summary of the three programs, and the full privacy/consent text, community guidelines, safety contact email and 24-hour moderation commitment for approval. | Operator 590e4a5b is single writer. Welcome text is runtime data stored outside every repo (names the clinic partner); set at C04 via the owner endpoint. Readback decisions D1-D4 were not answered, so the operator's stated recommendations apply (see "Operator rulings 10-01" below). |
| 09-30 18:14 | Hard cap of 8 concurrent agents; a sandbox crash is a tier-1 incident. | Operator enforces the cap and a priority queue. |
| 09-30 18:11-18:15 | Coach welcome message auto-sent 13 minutes after onboarding (owner's exact text is runtime data set at bootstrap; it names the clinic partner, so it never enters a repo). Seeded community rooms: backlog, not v1.0. Workout reminders from the client's first-session day and preferred time. Coach sees every client's consultation answers, easily; forms are saved. Never-trackers get calories and protein only in week one, explained by Roman. Apple Health / Health Connect: prefill onboarding and import history on connect, fully tested. | Contract 'v1 additions' items 5-9; engagement and health-import builders queued. |
| 09-30 17:53 | Coach payments (day X): client pays the listed price; the coach's payout is the price minus card processing minus TGP's 2% (no client surcharge). Minimum paid price $19.99, or free. Stripe's dashboard link stays, tucked under Earnings as "Payout settings"; TGP's own Money page is the default money screen. | Supersedes approval-packet defaults #14, #16, #17. |
| 09-30 17:42 | Minimum age stays 16+. Roman chats are stored in the database but never visible to coaches in any app surface or API; only the client and developers with direct database access can read them (180-day retention and client delete stand). All other prototype decision defaults stand except where overridden by owner rulings. | R2/R3 builder told; consent and privacy copy must say chats are private from the coach and staff access is for support, safety and debugging only. |
| 09-30 16:53 | Replace the T0-T4 model routing doctrine with the owner's updated version. T0/T1 GPT-6 Luna, T2 GPT-6.1 Sol, T3 Claude Opus 5.5, T4 Claude Opus 5.5 + GPT-6.1 Sol. | [MODEL_ROUTING.md](MODEL_ROUTING.md) is now canonical. |
| 09-30 16:40 | Roman already has a decided face: the older Black butler in `design/roman/`. The younger man in the mobile `assets/roman/` files is not Roman. | Mobile asset fix PR: canonical art plus a sha256 pin test. |
| 09-30 16:38 | Production deploys of audited main commits, production flag and setting changes, and the C04 production data setup are authorized through 10-07. Submit to App Review as soon as release QA passes. Safety copy: warmer butler tone, and give useful general guidance and a safe next step before the physician line. AI spend: the coach has one refillable AI bucket shared with all of their clients; the owner account sees true dollar cost; starting hard limit $30/month for the owner's bucket. | R4 copy revision; new slice R9 (coach bucket, true-cost view, cap). |
| 09-30 16:32 | EXECUTE for Bucket A. | Operator session c712e04d is the accountable operator and single writer for Bucket A. |
| 09-30 16:31 | (1) Session f32d73ae is dead. (2) Roman's tutorial also explains wearables (connect, health and sleep data) and community and chats. (3) Community: one space with all clinic patients, one space per workout plan, and the coach can divide members by signup date. (4) Apple first. (5) Waiver = one quick "I agree" box that also lets TGP and Roman see the client's in-app data. (6) Roman sees all of the client's own data. (7) Tutorial teach-back: log your first meal and message your coach. (8) Clinic reporting is done by the owner personally; the clinic never sees anything and no patient data flows between the clinic and TGP. | Approval packet defaults #7 and #13 are overridden by (7) and (6). |
| 09-30 11:48 | Client-to-coach payments are filed under App Review Guideline 3.1.3(d) (person-to-person services), processed through Stripe with no Apple in-app purchase, to pass the lowest cost to consumers. TGP is positioned as a B2B / person-to-person service. | Decided. Purchases of 1:1 coach packages stay visible on iOS, and the purchase copy names the individual coach. Hidden on iOS: AI credit packs, group or one-to-many products, and any seat upgrade (flag `EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES`). App Review notes will state the 3.1.3(d) basis. Fallback if Apple disagrees: an external link to web checkout on the US storefront (3.1.1(a)). |
| 09-30 11:47 | Business model: a 2% take rate, not seat fees (payouts-v2 `platform-fee.service.ts` already implements 2% plus 50% of the payment-rail savings). Coach growth is product-led (PLG): download, choose coach, in-app tutorial, simple activation to the first client payment through TGP. Coach signup and Roman's intelligence are required. Client tutorial on day 1; coach tutorial on a later day as a secondary but required priority. | The coach PLG activation plan (P-series) is added: coach funnel, coach tutorial, payments compliance. The coach onboarding track ends by handing off to it. |
| 09-30 11:44 | Anyone who downloads the app must be able to choose client or coach, and each role gets its own onboarding flow. | **Ruling R-ROLE-CHOICE-1:** role choice at account creation is allowed. Details below the table. |
| 09-30 11:43 | "You can't sign up as a coach from a simple app download?" | Answer: correct today. Coach promotion is owner-only through `POST /admin/users/:id/promote`; `/auth/become-coach` is switched off; the app hardcodes the client role. Fixed by C13 and M4. |
| 09-30 11:42 | Build access granted. Bradley creates his account tonight from an APK build. He approves the content plan (Roman flows plus UI design) before it is built; the workout programs can wait until after tonight. | Planning lanes produce plans for approval. Roman, tutorial and onboarding UI are not built until approved. Engineering fixes (auth, paywall, Roman grounding back end) proceed. |
| 09-30 11:42 | A QR code that means "paid outside, let him in, attach the program" is needed, plus free packages as a service. | C01 redesigned: invite codes can be bound to a package in `free` or `prepaid` mode, and a coach can create a $0 package that clients claim. |
| 09-30 11:42 | Roman must know the client's macros, logs, workouts and plan, and be high-intelligence. | Roman intelligence plan (R-series), then T4 build. |
| 09-30 11:42 | Onboarding must be a thorough personal-trainer consultation for every client. | Onboarding consultation plan (O-series). |
| 09-30 11:42 | Sign in with Apple must work on day 1. | C02 (back end) and M1 (mobile). The bug is confirmed live: see the Apple sign-in row in the Bucket A slice table. |
| 09-30 11:42 | Follow the agent rules, use subagents, grade every PR before work, follow the mobile design document, keep working autonomously, and keep this live state in two buckets. | This document. |
| 09-30 10:53 | Personal-training service only: workout and dietary guidance, no medical licensure. Audit the flow, prioritize the Apple launch, and make the flow excellent within 7 days. | Positioning applied. Apple category Health & Fitness; medical device status "No". |
| 09-30 10:48 | Change of gears to the clinic launch. | The importer is paused. |

**R-ROLE-CHOICE-1, in full:**
- Role choice is allowed at account creation only.
- A coach starts on the existing free tier (`CoachSubscription` tier `free`, status `active`), and the choice is audited.
- Existing accounts and attached clients can never change role this way; `/auth/become-coach` stays gated.
- This supersedes the "no self-promotion" clause of R-ONBOARDING-ROLE-GATE-1 for signup time only.

---

## Operator rulings 10-01 (adopted by default under EXECUTE; owner may override)

- **D1 Roman in v1.0:** scripted Roman only (tutorial, plan and macro explanations, reminders, welcome). Live Roman chat ships in 1.0.1. `EXPO_PUBLIC_FF_ROMAN_CHAT` stays off in the clinic profile; the Roman stack (#598/#601/#602/#603/#605) continues off the critical path.
- **D2 consent (WA RCW 19.373):** same screen, two boxes. Box 1 required: training waiver plus collection and use of the client's health and fitness information for coaching (coach and TGP see it). Box 2 optional: Roman and coach AI drafts, with the data sent to Anthropic. Unticked box 2 means no AI processing of that client until they agree in Settings. Withdrawal of box 2 lives in Settings. Copy approved by the owner 10-01 09:07.
- **D3 health prefill:** 1.0.1. v1.0 ships connect, history import and the health and sleep views.
- **D4 role choice fallback:** if mobile #306 is not dual-approved by Fri 10-02 12:00 PDT, submit client-only (`SIGNUP_ROLE_CHOICE_ENABLED=false`); role choice in 1.0.1.

### Production facts (verified 2026-10-01 by 590e4a5b)

- Backend production runs `bffae5f3` (C02), deploy run 36772404536 success; `/health` ok; signup-policy shows Apple on, Google off.
- Fly secret names (read-only list run 36885057965): `APPLE_TEAM_ID` present; `APPLE_SIGNIN_KEY_ID` and `APPLE_SIGNIN_PRIVATE_KEY` absent (deletion-time Apple token revocation would report `not_configured`). No community, wearables-ingest or role-choice flags are set. `ANTHROPIC_API_KEY`, `CRON_COACH_AI_INSIGHT`, `DIAGNOSTIC_AI_ENABLED` exist; the production AI-path inventory (S07b) is open.
- App not public (iTunes lookup 6765847915 = 0 results); no iOS build on record; `eas.json` has no submit profile.
- Wearables gap with no PR: mobile HealthKit / Health Connect normalizers post samples with `userId` to `/v1/wearables/samples/ingest`; the backend schema is `.strict()` and rejects it, and `FEATURE_WEARABLES_INGEST_POST` is unset (503). New slice S14.

### Active lanes (operator 590e4a5b, 10-01 09:05 PDT; cap 8 agents incl. operator)

| Lane | Model | Scope | Status |
|---|---|---|---|
| Auth stack builder | Claude Opus 5.5 | #597 A-597-1/B-597-1 (Sol BLOCK 10-01), then #599 B1, #595 rebase, #604 A1 + SOL-C14-A1 | Running |
| Onboarding backend builder | Claude Opus 5.5 | #606 B606-3, #607 A607-3/A607-2-R1, D2 consult-consent-v2 | Running |
| R2a consent ledger builder | Claude Opus 5.5 | New PR split from #601 (AI consent only, D2 box 2) | Running |
| Mobile onboarding builder | Claude Opus 5.5 | #310 A-05/B-05/B-06 + D2 two boxes + Settings > Privacy | Running |
| Role choice builder | Claude Opus 5.5 | #306 r3 findings (D4 deadline Fri 12:00) | Running |
| Wearables builder | Claude Opus 5.5 | S14 end to end (new PRs, both repos) | Running |
| Deletion auditor | GPT-6.1 Sol | #608 + #313, lens 1 | Running |
| Queue | | Opus audit #608/#313; Opus + Sol audits #610/#314; S07b AI-path inventory; #611/#315 audit + D2 text; #609/#312 audit; #597 re-audits | Queued |

- #597 Sol audit at b49c3177: BLOCK (A-597-1 compensation can delete the winning registration's identity; B-597-1 mixed-case email login). Opus APPROVE at the same head no longer suffices.
- Shared sandbox ops: `/home/user/workspace/ops/heavy.sh` (global queue), `link_deps.sh`, shared deps; agent brief `ops/AGENT_BRIEF_COMMON.md`; D2 contract `ops/CONSENT_D2_CONTRACT.md` (sandbox-local).

### Critical path (10-01)

S01 #597 Sol attest; S02 #599 B1; S03 #595 rebase; S04 #604 A1; S05 Wave-1 deploy. S06 #606 B606-3; S07 consent ledger split from #601 (D2 two scopes); S08 #607 A607-3/A607-2-R1; S09 #310 fixes + D2 copy + withdrawal screen. App Review P0: S11 deletion (#608 + #313), S12 UGC safety (#610 + #314), S13 privacy (#611 + #315). S14 wearables ingest. S16 #306. S17 C04 bootstrap. S18 TestFlight (clinic profile). S19 QA + submit Sat 10-03.

---

## BUCKET A: Initial customer journey (clinic launch)

- **Guardrail flow (owner):** QR code, App Store download, consultative personal-trainer onboarding, auto-attach to the owner as coach, auto-grant of the owner's free package, auto-assign one of three workout plans, then Roman's hands-on tutorial: workout plan and macro targets, community space and messaging the coach, connecting wearables and where health and sleep data live, ending with the teach-back (log first meal, message coach).
- **Positioning:** personal training only; no diagnosis, treatment, or medical claims; Health & Fitness; medical device No.

### Production facts (verified 2026-09-30 by c712e04d)

- App not on the App Store (iTunes lookup for id 6765847915 returns 0 results).
- Backend production ran `3a9369b9`; C02 (`bffae5f3`) deploy run 36772404536 approved 16:38 PDT under the owner's authorization.
- Lean onboarding never saves: mobile sends `current_weight`, `dob`, `primary_goal` and more; `PUT /profile` whitelists `current_weight_lbs`, `date_of_birth`, `goal_type`, and `forbidNonWhitelisted: true` rejects the whole request. The backend macro calculator substitutes 180 lb, 175 cm, age 30.
- Community and cohort modules exist but every mobile community flag defaults off; backend community flags are unclaimed in prod-switches.
- Wearables (HealthKit, Health Connect) code and screens exist; no device verification on record.
- Mobile `assets/roman/` showed the wrong man since 2026-06-10 (#231); canonical art is `design/roman/`.
- No audit verdicts for any open clinic PR exist on GitHub. Two GPT-6 Sol reports from the dead session (backend #598 and #601, both REQUEST CHANGES) reached this session as owner-extracted documents. They are used only as fix input, not as audit evidence; every open PR gets fresh audits at its new head.

### Slices, PRs and status

| Slice | Tier | Builder | PR | Status |
|---|---|---|---|---|
| C02 Apple sign-in contract | T4 | done | [backend #596](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/596) | Merged `bffae5f3`; production deploy approved 16:38 |
| C13 signup role choice | T4 | prior builder | [backend #597](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/597) | Fresh audits running (GPT-6.1 Sol, Claude Opus 5.5) |
| C03 reliable attach | T4 | prior builder | [backend #599](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599) | Fresh audits running |
| C01 comp access (free package binding) | T4 | prior builder | [backend #595](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595) | Fresh audits running; rebase after #599 |
| C14 throttler isolation | T4 (re-graded from T3: auth rate limiting) | prior builder | [backend #604](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604) | Fresh audits running |
| R1 model config | T2 | Claude Fable 5.1 (started before the routing update) | [backend #598](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/598) | Fixing Sol B1/C1 |
| R2 AI consent | T4 | same | [backend #601](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/601) | Fixing Sol A1/A2/B1/C1; consent captured by the onboarding "I agree" box |
| R3 client context | T4 | same | [backend #602](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/602) | Revising: Roman sees all of the client's own data |
| R4 guardrails | T3 | same | [backend #603](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/603) | Revising copy per 16:38 ruling |
| R8 evals | T2 | same | [backend #605](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/605) | Updating with R1-R4 |
| R9 coach AI bucket, owner true-cost view, $30/month cap | T4 | queued | n/a | Queued behind R1-R4 |
| M1 signup policy, paste code, Apple body | T4 (header) | done | [mobile #303](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/303) | Merged `60e43455` with one audit; governance finding G06/G10 recorded |
| M2 core polish, iOS purchase hiding | T4 | prior builder | [mobile #304](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/304) | Fresh audit running (GPT-6.1 Sol); second audit queued |
| M3 expo-updates | T3 | prior builder | [mobile #305](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305) | Fresh audit running |
| M4 role choice UI | T4 | Claude Fable 5.1 (started before the routing update) | [mobile #306](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306) | Fix round for 5 findings running |
| M5 supabase-js pin (Android build blocker) | T2 | prior builder | [mobile #307](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/307) | Merged `b5c29790` (GPT-6.1 Sol APPROVE, CI green) |
| Roman canonical face | T1 | operator | [mobile #308](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/308) | Merged `57cd865b` |
| C04 production bootstrap | T4 | operator | n/a | Waiting on the owner's account (Android build tonight) |
| C05 consultation onboarding and intake storage | T3 mobile / T4 storage | queued | n/a | Spec: owner-extracted prototype (87 screens) |
| C06 macros single source of truth | T3 | queued | n/a | Fix the profile contract; one calculator; floors 1,200/1,500 |
| C07 three programs, auto-assign, clinic spaces | T3 | queued | n/a | One all-patients space, one per plan, signup-date divisions |
| C08/C09 Roman explanations and tutorial | T3 | queued | n/a | Includes wearables and community; teach-back |
| C11/C12 store package and release QA | T3 | operator | n/a | Privacy labels, review notes, demo accounts |

### Merge rules

- Builders per [MODEL_ROUTING.md](MODEL_ROUTING.md). Auditors are independent instances that did not build the change: GPT-6.1 Sol and Claude Opus 5.5.
- T4: two independent audits plus green CI. T3/T2: one independent audit plus green CI. Audit verdicts are posted on the PR.
- Production deploys go through the gated `fly-deploy.yml` workflow under the owner's 2026-09-30 16:38 authorization.

### Owner asks (open, 10-01)

1. Sign up in the Android test build (EAS 14a58449) today; the operator then runs C04.
2. Done 10-01 09:07: three workout programs approved.
3. Done 10-01 09:11: owner created the Sign in with Apple key and saved `APPLE_SIGNIN_KEY_ID` / `APPLE_SIGNIN_PRIVATE_KEY` as GitHub Actions secrets (backend repo). The operator pushes them to Fly with `fly-apple-signin-set.yml`, which ships inside #608 under its T4 audits.
4. Done 10-01 09:07: consent text (two boxes), community guidelines, safety contact email, 24-hour moderation commitment approved (policy pages taken as approved with the D2 change; counsel review still recommended).
5. Confirm EAS iOS credentials / App Store Connect API key.
6. Two iPhone device passes (Friday evening, Saturday) through TestFlight.
7. Received 10-01 08:28: coach welcome message text (runtime data, not in any repo).

---

## BUCKET B: Importer (paused)

- **Status:** paused by the owner on 2026-09-30 at 10:48 PDT ("change of gears"). No importer lane is running in this session. It resumes on the owner's word.
- **EXECUTE history:**
  - EXECUTE was given to session c7aa658f (2026-09-29 11:00 PDT), then to session 5754504f (2026-09-29 16:15 PDT). See `LAST_OPERATOR_STATE.md`.
  - Dead session f32d73ae produced a fresh importer readback (`READBACK_2026-09-30.md`); it never reached GitHub, and an owner-extracted copy exists. That readback has not received EXECUTE.
- **Production:** backend main `3a9369b9` was deployed on 2026-09-30 at 00:28 UTC. `FEATURE_SCOUT_PILOT_COACH_IDS` is unset, so importer routes fail closed for every coach. No pilot run has happened, and there is no owner coach account yet; C04 in Bucket A creates it.
- **Open importer PRs (none merged to main since the deploy):**
  - Backend: #584, #587 (with #593 stacked on it), #590, #581, #592, #589, #591 and #594 (base `integration/importer`).
  - Mobile: #302.
  - Extension: #35 and #38.
  - Branch `s15a`: CI red.
  - Parked: #580, #582 and #583.
- **Owed:**
  - Re-add the `person-owned-rls-live-tests` and `person-owned-migration-rehearsal` required checks on `integration/importer` once #587 merges.
  - Resolve the drift and findings listed in `READBACK_2026-09-30.md` (F-01 to F-13, D-01 to D-20).
- **Next action on resume:** fresh exact-head dual audits of the T4 PRs, then fix rounds, following waves E01–E24 in the readback.

## Operator log 2026-10-01 10:40 PDT
- OWNER DIRECTIVES (10:01-10:39): (1) Google sign-in on day 1 (overrides operator email+Apple-only ruling). Done: Google project project-2c2ffa46-a1eb-4f5c-b68 published to production; new Web client 963513798354-b1si2i5t...apps.googleusercontent.com in Supabase Google provider (old 817435020365-p51g... retired); redirect tgp://auth/callback in Supabase; GitHub secret GOOGLE_CLIENT_IDS set 17:38Z, pushes to Fly via S-ENVTRUTH fly-env-sync after audit. (2) TGP native scheduling is the product; Google Calendar sync is optional/off, not a launch dependency. (3) PRE-LAUNCH: every critical feature must have a pathway in the UI. First static sweep: 34/170 routes with no reference outside navigation (incl. ClientBookingRequest, ClientUpcomingSessions, ClientMacros, ExerciseLibrary, Leaderboard, Bloodwork, PrivateCommunityHub, CommunityChallenges/Classroom/Find/Today, Copilot, BloodworkReviewQueue, AdminControlRoom, CoachCommunityWearablePrompts; some false positives = tabs/deep links/wizard steps). Lane S-REACH (reachability map + wire working features + Roman tutorial booking step + add-to-calendar .ics) queued for next free slot.
- MERGED: mobile #316 (Crisp 0.4.3 crash fix) 53447a36; backend #606 (macros) be667142 (Sol+Opus APPROVE).
- AUDITS: Opus approved #599/#595/#604/#607/#622/#606, REQUEST CHANGES #597 (B-597-2 pre-registered identity bind). Sol BLOCK #597 (A-597-1 unfenced OAuth binder), B-595-1 pending-grant revoke, B-607-4 CI gap (closed/reopened #599/#595/#604/#607/#609 to run full CI), #622 B-622-1/2/3, #623 B-623-1, #317 BLOCK (A-317-1 + B-317-1..4). Opus #310 REQUEST CHANGES (B-310-1/2). Fix rounds running: auth stack, #622, S14, #310, copy (#610/#314/#611/#315), env-truth.
- EAS build f5cac78e (ff6bd4b) still IN_QUEUE (Free plan low-priority queue; Starter $19/mo = owner spending decision, offered).

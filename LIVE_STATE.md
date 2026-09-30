# TGP LIVE STATE

- **Updated:** 2026-09-30 15:45 PDT
- **Operator:** Computer (Claude Opus 5.5 Fast), session f32d73ae ([thread](https://www.perplexity.ai/computer/tasks/f32d73ae-304b-47f5-987b-696c33cd61e6)). This session is the single writer for both buckets.

**Priority order (owner, 2026-09-30 10:48 and 11:42 PDT):**
1. **Bucket A, the initial customer journey:** App Store submission as soon as possible, with the clinic flow working end to end.
2. **Bucket B, the importer:** paused where it stands.

Two recurring terms:
- **Clinic partner:** the medical clinic whose clients join through a QR code. Its name is kept out of public repos.
- **Comp access:** free access granted without an in-app payment.

---

## Owner directions log (newest first)

| Time (PDT) | Direction | Operator disposition |
|---|---|---|
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

## BUCKET A: Initial customer journey (clinic launch)

- **Goal:** QR code → download → sign up → auto-attached to Bradley → personal-trainer consultation onboarding → macro targets explained by Roman → 1 of 3 programs auto-assigned and explained by Roman → Duolingo-grade tutorial → every basic function robust.
- **Coaches:** self-serve signup with their own onboarding.
- **Target:** App Store submission Sat 10-03 (mobile freeze), release Tue 10-06.
- **Plan:** `clinic/PLAN_clinic_launch.md`. Audits: `clinic/recon-mobile.md`, `clinic/recon-backend.md`.

### Production facts (verified 2026-09-30)

- The app is not public on the App Store; the iTunes lookup returns 0. An App Store Connect record exists (id 6765847915).
- The production database has 1 user, the system coach. There is no owner or coach account for Bradley, no clients, and 0 active purchases.
- The RLS public-exposure migration is applied. The Supabase security advisor shows no exposed tables.
- **Sign in with Apple is broken in production.** `POST /api/auth/apple` with the app's request body returns 400 `property identity_token should not exist`.
- Signup policy: invite code not required; providers are email and Apple. Because of a field-name mismatch, the app still always demands an invite code.
- `ANTHROPIC_API_KEY` exists as a Fly secret. Roman is pinned to `claude-3-7-sonnet-20250219`.

### Slices, PRs and status

| ID | Slice | Tier | Lane / builder | PR | Status |
|---|---|---|---|---|---|
| C01 | Comp access: invite code bound to a package (`free` or `prepaid`), claimable $0 packages, revocation | T4 | Backend A, Claude Fable 5.1 | [backend #595](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595) | The first cut (env list) is being reworked into the package-binding design. CI green except `npm audit`, which may predate this PR; being checked. |
| C02 | Apple sign-in contract alias; signup-policy legacy fields | T4 | Backend A, Claude Fable 5.1 | pending | In build (top priority) |
| C03 | Reliable attach: `invite_attached` flag, no re-parenting, clinic Wi-Fi signup limit | T4 | Backend A, Claude Fable 5.1 | pending | Queued after C02 |
| C13 | Signup-time role choice, back end (`intended_role`) | T4 | Backend C13, Claude Fable 5.1 | pending | In build |
| M1 | Signup-policy contract, paste invite code, attach-failure retry, Apple sends `token` (the live contract) | T3 | Mobile B, Claude Opus 5.5 | [mobile #303](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/303) | **MERGED** to mobile main at `60e43455` (audit round 3 APPROVE at `b34c7e9a`, GPT-6 Sol; CI green, 4,569 tests). The Android preview APK build [d3db0b56](https://expo.dev/accounts/the-growth-project/projects/tgp-health-and-wellness/builds/d3db0b56-6439-4c82-90bc-86592cadb648) **FAILED**. Hermes can't compile a non-literal dynamic `import()` in `@supabase/supabase-js` 2.106.x (it loads OpenTelemetry optionally). This blocks every store build from main, not just tonight's. Fix in progress: pin supabase-js to 2.105.0, which is verified clean (2.117.2 also fixes it upstream with a `react-native` export condition), plus a CI guard and a local Hermes compile. EAS env `EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES=true` created in preview and production. |
| M2 | iOS flag `EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES`: hides non-P2P purchases (credit packs, seats and billing, group products); 1:1 coach packages stay visible | T3 | Mobile B | [mobile #304](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/304) | Fixes pushed; head `22104dde`, CI green. Re-audit running. Open owner item: packages carry no service-type field, so every client package is treated as 1:1; the backend 1:1 marker comes in the coach payments work (P slices). |
| M3 | expo-updates OTA (channels, fingerprint runtime), buildNumber and versionCode bump | T3 | Mobile B | [mobile #305](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305) | Fixes pushed; head `1b88f424`, stacked on #304, CI green. On builds 6 and up, iOS purchases stay hidden even if an update changes the flag: it takes both the flag explicitly off and a native build below 6. A publish script refuses a mismatched environment or an unreviewed gate. Re-audit running. |
| M4 | Role choice before signup ("I'm here to train" or "I coach clients"); an invite code always means client; retries without `intended_role` against old backends | T4 | Mobile B | [mobile #306](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306) | Head `bbc1fae`, now targeting main, CI green. Two audits running (Opus, Grok). Needs C13 merged and deployed. |
| M2 | Home message and bell entries, push-tap routing, deferred push prompt, iOS hides purchases, package prompts suppressed | T3 | Mobile B | [mobile #304](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/304) | Open, CI green. Needs an audit. |
| M3 | expo-updates (EAS Update) and build-number bump | T3 | Mobile B | [mobile #305](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305) | Open, CI green. Needs an audit. |
| M4 | Role-choice screen (client or coach), stacked on M1 | T4 | Mobile B | pending | Queued |
| C04 | Production bootstrap: Bradley's owner account, clinic code, QR poster, reviewer demo accounts, store URLs | T4 | Operator | n/a | Waiting on Bradley's signup tonight |
| O | Personal-trainer consultation onboarding (9 chapters, 31 screens, about 4.5 min) plus role choice and the coach onboarding track | T3/T4 | Planner, Claude Opus 5.5 | `clinic/plans/PLAN_onboarding_consultation.md` | **Plan done**; awaiting owner approval. Finding: today's Lean onboarding never saves to the server (field-name mismatch), and the macro calculation substitutes made-up defaults (180 lb, 175 cm, age 30). |
| R | Roman intelligence: one Roman brain; context builder scoped to the client and their coach; model from config (primary `claude-sonnet-5-5`, fallback `claude-sonnet-4-6`); safety router; AI consent; evals | T4 | Planner, then builder Claude Fable 5.1 | `clinic/plans/PLAN_roman_intelligence.md` | **Plan done.** Back-end build of R1 (model plus boot probe; Roman currently returns blank replies because `claude-3-7-sonnet` was retired on 2026-02-19), R2 (consent), R3 (context), R4 (guardrails) and R8 (evals) **in progress**. The consent sheet and Roman UI await owner approval. |
| T | Client tutorial: 7 action-gated steps within the Quiet Luxury rules (no confetti or streak visuals) | T2 | Planner, Claude Sonnet 5 | `clinic/plans/PLAN_tutorial.md` | **Plan done**; awaiting owner approval. |
| PX | Clickable prototype of the onboarding, Roman and tutorial UI, for owner approval | T0 | Claude Opus 5.5 | [TGP Clinic Flow Prototype](https://www.perplexity.ai/computer/a/tgp-clinic-flow-prototype-1pouoYkBTPyVYm0wPu4_TA) | **Delivered 12:40** (87 screens). Approval Packet shared with 20 decisions and recommended defaults. **Waiting for owner approval.** Operator ruling applied: safety-screen answers are never sent to AI; Roman gets only a "clearance recommended" yes/no, which the consent sheet discloses. |
| P | Coach PLG activation: coach onboarding, 5-step coach tutorial, first offer, share link or QR, first client payment on the web, iOS 1:1 purchase gate, App Review notes | T4 (money) | Planner, Claude Opus 5.5 | `clinic/plans/PLAN_coach_plg_activation.md` | **Plan done** (slices P01–P16, decisions D1–D10). **Money bug found:** in-app checkout uses destination charges with exactly a 2% application fee. Stripe debits processing fees from the platform on those, so TGP would lose about 0.9% plus 30¢ per card sale. The canonical `platform-fee.service.ts` (the coach pays processing) is used by no charge path. P01 fixes it before any real payment; production has 0 purchases, so nothing is lost yet. P01 is queued for the next free back-end lane. Also broken: package publish, share-link URLs (`/p/<token>` not served), checkout host `joingrowthproject.com` (no DNS record), earnings API paths. |
| K | Content: 3 four-week programs, selection rules, macro method (floors 1,200 and 1,500 kcal, protein cap 35%), Roman scripts, 7-question intake | T2 | Claude Sonnet 5 | `clinic/content/` | Drafted. 12 exercises are missing from the catalog. Program sign-off is after tonight's APK build. |
| C06–C12 | Macros as a single source of truth, program seeding and auto-assign, Roman explanation screens, tutorial, store package, release QA | T2–T4 | queued | n/a | Queued behind the plans and approvals |

### Merge rules

- **Merge gates:** T4 needs two independent audits (GPT-6 Sol and Claude Opus 5.5, neither of them the builder) plus green CI. T3 and T2 need one independent audit plus green CI.
- **Deploy:** production deploys go through the gated `fly-deploy.yml` workflow, with operator approval under the 2026-09-29 17:21 authorization.

### Owner asks (open)

1. ~~Build access~~: **done 11:58.** The Expo token is saved and verified: account role Owner on `the-growth-project`; the iOS distribution certificate and provisioning profile are valid until 2027-05-02; an App Store Connect API key (95C76WBFA6) is set up for submissions. The operator can build and submit iOS through EAS (eas-cli needs lowercase `https_proxy`).
2. **Tonight:** sign up from the APK. The operator then promotes the account to owner with a free-tier coach seat and creates the clinic code and QR code.
3. **Approve the plans:** onboarding consultation plus the coach track, Roman flows and UI, and the tutorial, when they are delivered.
4. **Approve the workout programs** after tonight.

### Timeline

| Day | Date | Work |
|---|---|---|
| D0 | Wed 09-30 | Plans; auth, paywall and attach fixes; mobile M1–M4 |
| D1 | Thu 10-01 | Merge and deploy wave 1; bootstrap; plan approvals; start onboarding, Roman and macros builds |
| D2 | Fri 10-02 | Programs and auto-assign; Roman screens; tutorial; TestFlight build |
| D3 | Sat 10-03 | Fixes; mobile freeze; submit to App Review |
| D4–D6 | Sun 10-04 to Tue 10-06 | Review window; release |

---

## BUCKET B: Importer (paused)

- **Status:** paused by the owner on 2026-09-30 at 10:48 PDT ("change of gears"). No importer lane is running in this session. It resumes on the owner's word.
- **EXECUTE history:**
  - EXECUTE was given to session c7aa658f (2026-09-29 11:00 PDT), then to session 5754504f (2026-09-29 16:15 PDT). See `LAST_OPERATOR_STATE.md`.
  - This session produced a fresh readback (`READBACK_2026-09-30.md`) and has not received EXECUTE.
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

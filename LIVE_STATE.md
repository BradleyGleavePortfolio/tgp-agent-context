# TGP LIVE STATE

- **Updated:** 2026-09-30 11:55 PDT
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
| M1 | Signup-policy contract, paste invite code, attach-failure retry, Apple sends `token` | T3 | Mobile B, Claude Opus 5.5 | [mobile #303](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/303) | Open, CI green. Update in progress: no-code signup plus Apple `token`. Needs an independent audit. |
| M2 | Home message and bell entries, push-tap routing, deferred push prompt, iOS hides purchases, package prompts suppressed | T3 | Mobile B | [mobile #304](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/304) | Open, CI green. Needs an audit. |
| M3 | expo-updates (EAS Update) and build-number bump | T3 | Mobile B | [mobile #305](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305) | Open, CI green. Needs an audit. |
| M4 | Role-choice screen (client or coach), stacked on M1 | T4 | Mobile B | pending | Queued |
| C04 | Production bootstrap: Bradley's owner account, clinic code, QR poster, reviewer demo accounts, store URLs | T4 | Operator | n/a | Waiting on Bradley's signup tonight |
| O | Personal-trainer consultation onboarding plus the coach onboarding track | T3/T4 | Planner, Claude Opus 5.5 | plan | Planning. **Owner approval required before build.** |
| R | Roman intelligence: grounded client context, current model, guardrails, AI consent, evals | T4 | Planner, Claude Opus 5.5 | plan | Planning; T4 back-end build follows. The Roman flow UI needs owner approval. |
| T | Duolingo-grade client tutorial sequence (day 1) | T2 | Planner, Claude Sonnet 5 | plan | Planning. **Owner approval required before build.** |
| P | Coach PLG activation: coach onboarding hand-off, coach tutorial, first package, share link, first client payment (2% take rate), iOS and Android payment compliance | T4 (money) | Planner, Claude Opus 5.5 | plan | Planning. Released on a later day, after the clinic launch. **Owner approval required before build.** |
| K | Content: 3 four-week programs, selection rules, macro method (floors 1,200 and 1,500 kcal, protein cap 35%), Roman scripts, 7-question intake | T2 | Claude Sonnet 5 | `clinic/content/` | Drafted. 12 exercises are missing from the catalog. Program sign-off is after tonight's APK build. |
| C06–C12 | Macros as a single source of truth, program seeding and auto-assign, Roman explanation screens, tutorial, store package, release QA | T2–T4 | queued | n/a | Queued behind the plans and approvals |

### Merge rules

- **Merge gates:** T4 needs two independent audits (GPT-6 Sol and Claude Opus 5.5, neither of them the builder) plus green CI. T3 and T2 need one independent audit plus green CI.
- **Deploy:** production deploys go through the gated `fly-deploy.yml` workflow, with operator approval under the 2026-09-29 17:21 authorization.

### Owner asks (open)

1. **Build access:** an Expo token for the `the-growth-project` account (secure form) so the operator can run the iOS build and submission. Otherwise Bradley runs them.
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

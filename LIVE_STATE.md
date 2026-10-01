# TGP LIVE STATE

- **Updated:** 2026-09-30 17:50 PDT (commit time is authoritative)
- **Operator:** Computer, session c712e04d ([thread](https://www.perplexity.ai/computer/tasks/c712e04d-91da-4589-b9b1-50d5663183a9)). Single writer for Bucket A since EXECUTE at 16:32 PDT. Session f32d73ae is dead (owner, 16:31); its unpublished plans reached this session as owner-extracted documents.
- **Governing rules:** [AGENT_RULES.md](AGENT_RULES.md) G01-G22 (effective; commit identity is irrelevant per owner). Model routing: [MODEL_ROUTING.md](MODEL_ROUTING.md).

**Priority order (owner):**
1. **Bucket A, the initial customer journey:** App Store submission Sat 10-03, clinic go-live by Wed 10-07.
2. **Bucket B, the importer:** paused where it stands.

Two recurring terms:
- **Clinic partner:** the medical clinic whose patients join through a QR code. Its name is kept out of public repos.
- **Comp access:** free access granted without an in-app payment.

---

## Owner directions log (newest first)

| Time (PDT) | Direction | Operator disposition |
|---|---|---|
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
| M5 supabase-js pin (Android build blocker) | T2 | prior builder | [mobile #307](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/307) | Fresh audit running |
| Roman canonical face | T1 | operator | pending | Canonical art plus sha256 pin test |
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

### Owner asks (open)

1. Sign up in the Android test build tonight when it is ready; the operator then runs C04.
2. Two iPhone device passes (Friday evening, Saturday) through TestFlight.
3. Final approval of the three workout programs once drafted.

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

# RESCUE-132 BRIEF (operator agent 132, 2026-10-08 15:15 PDT). Read this fully. It is the shared brief for planners R01-R15 and the combiner R16.

## 0. Why you exist
The owner installed the Android test app (versionCode 6, built from mobile a3a1c18e; mobile main is now df7b8ae9, same wizard/setup files)
and tried it as a coach and as a client with no coach. Both journeys are broken and ugly. Compared with the approved spec (an 87-screen
prototype and an approval packet), today's app is "like speccing a Gordon Ramsay restaurant and building a fast-food stand". The owner
wants the iOS submission TONIGHT to not be "slop of bugs and crashes" that Apple would reject.

Owner orders (15:02-15:13, close to verbatim):
- "make a 50 point plan to FIX EVERYTHING".
- "Take note of every bug and problem individually - then look through the 87 page ... spec files - then lets get agents planning
  fixes and uncovering the WHY WHEN WHERE HOW AND WHO of every issue and how we're going to turn this around."
- "a special agent that finds out what happened with all the redo screen jobs and PRs - did that just not get deployed, or did it
  really produce this SLOP confidently? WE NEED ANSWERS, WE NEED PLANS."
- "use 15 agents so they can all dig deeper and plan better, then one agent that combines the 15 agents' ideas and plans into one
  orchestrator's plan ... he makes all of the ideas work TOGETHER."
- "encourage them to actually dig extra deep and think of ways to fix it AND maybe even just cut [things] that's unnecessary, maybe
  ways to better design things, better code replacements, etc."
- Standing product rules: "the best features for the first 5 coaches and clients, nothing that requires scale for usability";
  "hyperscaler quality"; "all plans must take into account mobile pathway placement - luxury doctrine and mobile design ideologies
  from the app and github documents, best-in-class rivals and inspiration, and the unique proposition of TGP 'The platform for Online
  fitness in the post-AI era' - how to not just be a pretty version of existing ideas but what would make us SUPERIOR entirely ...
  plans for the existing product idea, then separately additional ideas pitched, as an addition" (= Part A, then Part B).
- 14:44: "Think about how thorough and amazing the client account consultative style onboarding is - that's what we want for coaches too!"
- 14:57: Roman chat should be "a luxurious AI chat room, the UI and class of a premium Anthropic mixed with iMessage".

So: DIG EXTRA DEEP. Quality over speed. Besides fixes, actively propose (a) what to CUT, (b) better designs, (c) better code
replacements (delete-and-replace beats patching where the current code is the problem). BUT tonight's iOS build 8 depends on you: write
your section "Tonight (iOS build 8)" FIRST into your report file as soon as you are confident, then keep digging and fill the rest.

## 0a. OWNER ANSWERS 15:29 PDT (binding; these win over anything below)
- Decision 27, "Full consultation for every client: the short 6-step flow is retired" — owner: "yes" (emphatic). The approved
  consultation becomes every client's onboarding in every build; the lean flow (LeanQ1-Q6, "Where does it begin?") is retired.
- Decision 28, clients without a coach — owner (verbatim): "they can do everything a normal coached client can, besides getting
  direct coaching, and generally all of that isn't behind a locked page, it's just empty for them inherently". So: NO lock pages,
  paywall walls or "comes with coaching" screens for coachless clients anywhere. They get the whole app (consultation, targets,
  plan/programs, logging, Roman, check-ins, progress). Only direct coaching (a real coach's messages, feedback, coach-written work) is
  absent, and those places are simply calm empty states with an optional "join a coach with their code" entry, never a lock.
  (Approved packet decision 1, auto-attaching no-code clients to Bradley as house coach, is NOT confirmed by this answer: treat it as
  an open question for the combiner, default "coachless clients stay coachless; joining a coach is optional".)
- Decision 29, a 21:00 cutoff for iOS build 8 tonight — owner: "no, we don't do build 8 until this is PERFECTION". There is NO
  deadline tonight. Build 8 ships only when the whole app meets the spec. Quality over speed. Your report's section 1 becomes
  "## 1. Build 8 gate": everything in your scope that must be true before build 8 (keep that heading; the combiner accepts the old one).

## 1. Bug register (every problem individually; IDs are shared by all agents; add new ones as B42+ with your scope prefix, e.g. B42-R06)
Owner screenshots (see section 3 for files): S0 coach Stripe step, S1 coach invite step, S2 welcome, S3 role choice, S4 lean "Where
does it begin?", S5 birth year + target weight, S6 client Home, S7 Train lock, S8 Roman chat, S9 endless spinner.

COACH SIGN-UP
- B01 Sign-up progress icons at the top are cut off (Android status bar overlap). Known: coach wizard StepLayout uses SafeAreaView
  from 'react-native' (iOS-only) — src/navigation/CoachWizardNavigator.tsx:150-230, step indicator ~:183.
- B02 Package creation comes before the coach has set up their profile/practice. Same order for EVERY coach (not just the owner).
- B03 Coach questions are "super thin" (name + 6 focus chips). Spec K0-K8 (prototype screens 77-85) is consultative; owner wants it as
  thorough as the client consultation.
- B04 Confirmation email lands in spam. Known: Supabase built-in SMTP; trygrowthproject.com SPF is "include:_spf.google.com ~all" only,
  DMARC p=none, no DKIM/Resend records on any TGP domain; Supabase docs say built-in SMTP is not for production.
- B05 "Resend" looked broken: no /auth/v1/resend in Supabase logs 21:15-21:45Z while the server path works (operator probe 21:52Z);
  likely the silent 60 s cooldown in src/screens/auth/ResendVerificationLink.tsx:23 with no visible countdown/confirmation.
- B06 S0: "Payouts are not switched on for your account yet" — red box, wall of text, raw reference UUID, personal Gmail. Known: Connect
  platform not activated in live Stripe; ConnectModule probes once at boot (backend src/connect/connect.module.ts:68-117) and never re-probes.
- B07 S1: "Your setup moved on another device" — coach could not reach Home. Known: backend CacheControlInterceptor
  (src/common/cache-control.interceptor.ts:82) sends `private, max-age=60` on authed GETs; phone HTTP cache served a stale
  GET /coach/onboarding; advanceWizardTo (mobile src/api/coachSetupApi.ts:306-327) posted step 3 while the server was at 4 →
  400 STEP_OUT_OF_ORDER (backend src/coach/coach-onboarding.service.ts:176-183).
- B08 Back button on the account-creation/setup pages does nothing (navigation.goBack() with no history after resume:
  CoachWizardNavigator.tsx ~347/450/551/644, resumeRoute ~702-708, initialRouteName ~781).
- B09 "Back" text sits under the Android gesture bar (cut off at the bottom of S1).
- B10 Error boxes show raw reference UUIDs and long technical text (S0, S1). Not luxury, not helpful.

CLIENT SIGN-UP / ONBOARDING
- B11 S2: welcome logo is "GP" in a square box, not TGP.
- B12 S2: welcome page is bare vs prototype AUTH (screen 00: eyebrow, serif title, rule, tagline, "Get started" + "Log in").
- B13 Account-creation screens are squished to the top, no breathing room ("subtly stress inducing").
- B14 Not the long consultative onboarding that was planned: the lean 6-step flow (LeanQ1-Q6) shipped. Known: the 31-screen
  consultation exists (src/screens/consultation, src/lib/consultation) behind EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING, which is ON only in
  the eas.json `clinic` profile (development/preview/production: off).
- B15 Letters cut off at the bottom (descenders clipped; serif headline lineHeight on Android).
- B16 Buttons are plain rectangles; "none of these pages feel like the luxurious standard I had redo jobs complete specifically to make
  this app beautiful".
- B17 S3 role choice "How will you use the app?": crammed beige cards with chevrons vs prototype ROLE (screen 01: list rows + radios +
  one Continue + "I have an invite code").
- B18 S4 "Where does it begin?" (Step 3 of 6) asks the client to pick a first action — "awkward and robotic", not in the designed flow.
- B19 S5 birth-year wheel: a bar (selection band) blocks the middle of the scroller and hides the selected year.
- B20 S5 target weight sits on the birth-year page (spec: B4 "Goal weight" is its own question with a wheel and "No number, just the goal").
- B21 "Step N of 6" counters vs spec chapters ("Chapter 2 of 8 · Body basics"), segmented progress bar, "Finish later", time left.

CLIENT APP
- B22 S7 "Logging comes with coaching" pop-up/lock will not go away — it instantly reappears and blocks everything.
- B23 Logging is disabled entirely for clients without a coach — "NOT MY INTENDED DESIGN". Approved packet decision 1: clients with no
  code attach to Bradley as the house coach when they finish the consultation.
- B24 S6 Home: "Food and water logging need active access" + "View access", dashes for macros, a locked dashboard for a new client.
- B25 S6 Home header says "Message your coach" for a client with no coach.
- B26 S6-S8 bottom tab bar has 6 tabs (Home, Train, Food, Calendar, You, Community); "Community" wraps to "Communi-ty". Spec: 4 tabs.
- B27 Roman's image is cut off at the top.
- B28 Everything is squished at the top on every page: "let it breathe by a few pixels".
- B29 Pages are not the world-class design the owner paid redo jobs for (flat, generic, empty states, dashes, odd copy).
- B30 S8 Roman chat "feels prehistoric": wants premium Anthropic x iMessage. Spec screens 69-73 (chips, serif replies, composer, footer).
- B31 S8 Roman says "I cannot see your details at this moment, so I am unable to tell you your name" — Roman has no client context
  (spec: Roman knows name, targets, plan, food log, check-ins). Find out why (consent, flags FEATURE_ROMAN_*, context pipeline, coachless).
- B32 No AI consent sheet seen before Roman answered? (spec screen 68 "Before Roman answers"). Verify.
- B33 Owner never saw the macro reveal, plan reveal, 7-step tutorial, push priming or landing Home of the spec (screens 37-63).
- B34 S6 date line "THURSDAY, THE EIGHTH." reads oddly.

APP START (15:02)
- B35 Re-opening the app as a coachless client: TGP logo ~0.5 s → "Locked" flash (<0.1 s) → endless spinner (S9). The app never opens.
- B36 "Locked" flashes on every cold start even though biometric unlock was never turned on: src/components/BiometricUnlockGate.tsx
  renders "Locked / Verifying…" while status === 'checking'.
- B37 Startup checks have no time limit and no calm error screen (RootNavigator bootstrapAuth ~:667-865 awaits network calls;
  'loading' and PersistedQueryCacheGate renderRestoring both show a bare spinner). Spec screen 44 is the calm error.

SYSTEM / PROCESS
- B38 App-wide stale reads for up to 60 s after any change (same cause as B07; every authed GET).
- B39 30 mobile files use SafeAreaView from 'react-native' (iOS-only); 46 use react-native-safe-area-context.
- B40 Spec features exist but are switched off in the builds the owner installs (consultation flag; preview profile has 3 FF flags,
  production 9, clinic 13). Full flag audit needed.
- B41 The owner is the first person to see these screens on a real phone: no device QA, no prototype-parity gate before builds.

## 2. Already running in parallel (do not duplicate; DO critique/verify their approach in your report)
Builders launched by the operator at 15:20 for the clearest P0s (PRs will appear on GitHub as agent132/<id>):
- SETUP-STALE-132 (Opus): B07/B38 — backend authed GETs `private, no-store`; mobile GET no-cache header; wizard self-heals on STEP_OUT_OF_ORDER.
- START-HANG-132 (Sol): B35-B37 — find the hang, time-box every startup check, calm retry screen, no "Locked" flash.
- COACH-EDGES-132 (Sol): B01, B05, B08, B09, B10 and the calm Stripe-not-ready state of B06 in the current wizard + resend.
- COACHLESS-LOG-132 (Opus): B22-B24 — coachless clients can log from day one; no blocking pop-up; gentle "join a coach" card.

## 3. Paths (everything is local; you share one sandbox with ~20 agents)
- Code, READ-ONLY detached worktrees at the current mains: /home/user/workspace/wt/RESCUE-mobile (df7b8ae9) and
  /home/user/workspace/wt/RESCUE-backend (051583ad). `git log/show/blame` are fine there. NEVER checkout, stash, fetch, commit or make
  worktrees in them or in /home/user/workspace/growth-project-*; never edit any repo.
- Owner context repo (doctrine, SoT, handoffs, decisions): /home/user/workspace/tgp-agent-context (read-only). Key: TGP_SOURCE_OF_TRUTH.md
  (A1-A7 at minimum; last occurrence of a heading wins), NORTH_STAR.md, PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md,
  QUALITY_BAR_RAISE_JOB.md, EMBEDDED_AI_SPEC.md, ROMAN_ED3_REWRITE_PLAN.md, FLAGS_LAUNCH_LEDGER.md, roadmap/specs/A23-mobile-luxury-overhaul.md,
  roadmap/OPERATOR_DECISIONS_LOG.md, handoffs/op-*/ (agent chain history), audits/. Mobile: ENGINEERING_RULES.md, src/theme, README rows.
- Approved spec documents (markdown conversions): /home/user/workspace/specs132/
  Approval-Packet-Client-Journey-v1.md (decisions 1-26, chapters, Quiet Luxury rules), the clinic launch plan (owner attachment) (slices C01-C12;
  NEVER write the clinic partner's name anywhere: say "the clinic partner"), TGP-Fitness-App-Store-package-and-release-blockers.md,
  TGP-Fitness-App-Review-notes.md, TGP-Fitness-App-Store-metadata.md, TGP-Fitness-first-review-screenshot-plan.md,
  Mobile-App-Design-Intelligence.md (NEW from the owner at 15:12: "Mobile App Design Intelligence — Exhaustive Agent Training", 2,529
  lines. Design scopes R06 R08 R10 R11 R12 R13 R14 and R16: read it FULLY and apply it. Others: read its headings and the parts for your scope).
  Program fixture JSON: /home/user/.perplexity/attachments/a5f61065f3c74812898d8f9ac044ec3c/TGP-Fitness-Four-week-master-programs-JSON-fixture.json
- The 87-screen prototype: /home/user/workspace/specs132/proto/index.html (+ js/, css/ with the exact tokens). Rendered screens:
  /home/user/workspace/specs132/shots/NN.png (390x844; labels in shots/index.json; contact sheets shots/sheet_00..10.png, 8 per sheet).
  Index: 00 AUTH, 01 ROLE, 02 CREATE client, 03 W1, 04-05 G1-G2, 06-09 B1-B4, 10-11 L1-L2, 12-16 T1-T4, 17-20 S1-S3b, 21-25 N1-N5,
  26 P0, 27-35 P1-P8, 36 C1, 37 SUM, 38 PREP, 39 MACRO, 40 PLAN, 41-45 states (resume card, resume, offline, server error, under 16),
  46-60 tutorial TU1-TU7, 61-62 push, 63 LAND Home, 64-66 skip/re-offer/no plan, 67 More/Guidance, 68 AI consent, 69-73 Roman chat + chips,
  74 Privacy > Roman, 75 ROLE coach, 76 CREATE coach, 77-85 K0-K8, 86 coach lands on Clients.
  Node playwright works from /home/user (`node -e "require('playwright')"`; chromium cached) if you need to render more states.
- Owner screenshots: contact sheet /home/user/workspace/ops/rescue132/owner_screens_sheet.png; originals
  S0 /home/user/.perplexity/attachments/4cf0b4c3f71a46e88b457e15b478499d/1000021147.jpg, S1 .../4cf0b4c3f71a46e88b457e15b478499d/1000021149-2.jpg,
  S2 .../d9f8290a7997493d94ca557760caa53d/1000021152.jpg, S3 .../d9f8290a7997493d94ca557760caa53d/1000021154-4.jpg,
  S4 .../d9f8290a7997493d94ca557760caa53d/1000021156.jpg, S5 .../d9f8290a7997493d94ca557760caa53d/1000021158-7.jpg,
  S6 .../d9f8290a7997493d94ca557760caa53d/1000021162-5.jpg, S7 .../d9f8290a7997493d94ca557760caa53d/1000021164-6.jpg,
  S8 .../d9f8290a7997493d94ca557760caa53d/1000021166-3.jpg, S9 /home/user/.perplexity/attachments/210efa83da78474d8ee3bd8dc705680a/1000021170.jpg
  (all under /home/user/.perplexity/attachments/).
- Design doctrine in the app repo (read for every UI scope): wt/RESCUE-mobile/docs/QUIET_LUXURY_DOCTRINE.md, docs/reachability.md
  (pathway placement: where each thing lives, taps from Home), docs/HAPTICS.md, docs/SKELETON_LOADERS.md, docs/dark-mode.md,
  src/theme/README.md, the screen READMEs src/screens/*/README.md, ENGINEERING_RULES.md. Rule 6 of the agent 131 common file ("no pathway
  or function is cut") still binds BUILDERS; planners now PROPOSE cuts (owner 15:13) — every cut is an owner decision with a default,
  listing the routes/buttons/actions before and after.
- Operator history: /home/user/workspace/ops/FLEET132.md, ops/lanes13*/JOBS13*.md, ops/reports/, ops/V11_*_PLAN_132.md.
- GitHub: bash with api_credentials ["github"]; repos BradleyGleavePortfolio/growth-project-mobile, -backend, tgp-agent-context.
  Prefer local git; keep GitHub API calls modest (R01 may use more). Never comment on, review, push to or merge any PR.
- Supabase (only if the connector is available to you): project rpyfdsgxxltzutgqeouk; SELECT and log queries ONLY. Never copy personal
  data (emails, names, phone numbers, free text) into reports; ids and counts only.
- Production API: https://api.trygrowthproject.com/api ; health https://backend-spring-lake-3890.fly.dev/health and /readyz.
  Never run the "Fly Logs (operator)" workflow (it prints production logs publicly).

## 4. Hard rules
Read-only: no code edits, branches, PRs, PR comments, pushes, deploys, flag changes, EAS builds, Stripe calls, purchases or spending.
No secrets or customer records in any file. Never name the clinic partner. Do not message the owner. Evidence for every claim
(file:line, commit sha, PR number, log line, prototype screen number) or mark it "unverified". Never estimate credits.
Plain, specific language; no filler. Think like the best mobile product team in the world shipping to 5 coaches and their clients.

## 5. Report: /home/user/workspace/ops/rescue132/reports/<RNN>.md, these headings exactly (the combiner parses them)
# RNN <scope title>
## 1. Build 8 gate (was "Tonight (iOS build 8)") — write FIRST: what in your scope must be fixed/changed/switched before tonight's iPhone submission, why
   (Apple rejection risk or broken use), smallest safe change, and what must NOT go in tonight.
## 2. Verdict — 5 plain lines: what is wrong in your scope and the single biggest reason.
## 3. Findings — one row per bug ID (register + your new B42-RNN ones): What the owner saw | WHERE (screen + file:line) | WHY (root cause +
   evidence) | WHEN (commit/PR/date introduced) | HOW (mechanism) | WHO (job ID / agent number / PR / approving lenses) | Confidence.
## 4. Spec parity — prototype screen number → today's screen/file → gap → severity (S1 broken, S2 off-spec, S3 polish).
## 5. Cut list — what to delete or switch off entirely, and why it is unnecessary for the first 5 coaches and clients.
## 6. Fix plan (Part A) — numbered PR slices: title, repo, files, ~lines (<800 each, >1,500 auto-fails), replacement vs patch, acceptance
   checks (incl. Android 360x800 and iPhone screenshots side by side with the prototype screen), depends on, conflicts with other scopes.
## 7. Better design and better code — concrete replacements (components, patterns, libraries already in the repo) with reasons.
## 8. Part B — ideas that make TGP superior (separate from Part A): what, why superior vs best-in-class rivals, mobile placement, effort.
## 9. Owner decisions — numbered, each with a recommended default.
## 10. Cross-scope notes — what other scopes and the combiner must know (shared files, ordering, contradictions).
When completely done, append a final line `## DONE <RNN> <PDT time>` and give the operator a final answer under 120 words.

## 6. Scopes (do yours; read others only to avoid overlap)
R01 FORENSICS — THE REDO JOBS (gpt_6_1_sol). "Did it just not get deployed, or did it really produce this slop confidently?" Find every
  screen redo / luxury / design / overhaul / Quiet Luxury / consultation / onboarding job and PR in the agent chain (SoT, handoffs op-*,
  OPERATOR_DECISIONS_LOG, roadmap/specs A23, QUALITY_BAR_RAISE_JOB, audits PR248-254, ops/lanes*/JOBS*, PR titles/bodies on GitHub). For each:
  job ID, agent number, PR, dates, screens/files touched, merged?, in the owner's APK (is the commit an ancestor of a3a1c18e?), behind a
  flag (which, and is it on in preview/production?), shipped to which build, reviewed by whom, did the review include real screenshots,
  did it claim parity it did not have. Map each owner screenshot S0-S9 to the code that rendered it and to the redo jobs that should have
  changed it. Timeline (WHEN), WHO, and the honest answer per job: built-but-off / built-for-other-screens / never-built / reverted /
  built-badly-and-approved. End with the root organisational causes and what must change.
R02 BUILDS AND FLAGS (claude_opus_5_5). B14 B40. Every EXPO_PUBLIC_FF_* and backend FEATURE_* flag, per eas.json profile and in
  .github/fly-env-desired-state.json; which spec features exist but are off; what the owner's APK had (find the build profile used for
  versionCode 6 from ops logs/handoffs); the recommended flag set for tonight's iOS build 8 (production profile) with the readiness evidence
  per flag; whether the lean flow can be retired; clinic vs general builds; how flags should work from now on.
R03 STARTUP HANG (gpt_6_1_sol). B35 B36 B37. Every startup path (coach, client with code, coachless, clinic, offline, expired token): find
  every await that can hang, auth-event loops, PersistedQueryCacheGate restore, biometric gate; Supabase auth logs around 21:55-22:05Z if
  available (counts/patterns only). Independently verify START-HANG-132's PR when it appears. Also: crash risks Apple would hit.
R04 COACHLESS ACCESS (claude_opus_5_5). B22 B23 B24 B25 and decision 1 (house coach). Client entitlement model end to end (mobile
  src/entitlements, backend guards), what a coachless client gets on day one, the pop-up loop cause, house-coach attach design, money
  implications (take-rate, free packages), Apple 3.1.1/2.1 implications. Verify COACHLESS-LOG-132's PR.
R05 COACH SETUP MECHANICS (gpt_6_1_sol). B01 B06 B07 B08 B09 B10 B38. The coach wizard state machine (server progress + client), every
  read-after-write staleness in the app beyond the wizard, Stripe Connect gating and the exact owner activation steps, honest error design.
  Verify SETUP-STALE-132 and COACH-EDGES-132 PRs.
R06 LAYOUT, ANDROID AND IOS (claude_opus_5_5). B09 B13 B15 B19 B26 B27 B28 B39. Insets/safe areas, top breathing room, descender clipping,
  wheel band, avatar crops, the 6-tab bar and label wrapping, 360x800 and large-text behaviour; the full file list and one sweep plan.
R07 AUTH ENTRY AND EMAIL (gpt_6_1_sol). B04 B05 B11 B12 B17. Welcome/role/create/verify/resend/login/reset/invite-code vs prototype 00-02,
  75-76; Sign in with Apple requirements for tonight; email deliverability evidence and the exact owner steps (sending domain, DNS records,
  Supabase custom SMTP, rate limits, sender name/address).
R08 CONSULTATION (claude_opus_5_5). B14 B18 B20 B21 and prototype 03-45. Screen-by-screen parity of src/screens/consultation +
  src/lib/consultation vs the prototype, safety (PAR-Q, decision 2), finish later/resume/offline/error/under-16; what it takes to make it
  every client's onboarding; retire the lean flow; tonight vs next.
R09 PROGRAMS AND MACROS (gpt_6_1_sol). B33 (macro + plan reveal). The 3 four-week master programs fixture (in the backend? seeded?),
  auto-assign (A/B/C), Gentle Start for safety yes, single-source macro engine, Train-tab data for coachless and coached clients.
R10 TUTORIAL AND CLIENT TABS (claude_opus_5_5). B24 B25 B26 B29 B33 B34 and prototype 46-67. The 7-step tutorial, push priming, landing
  Home, skip/re-offer, Train/Log/Messages/More vs today's 6 tabs; information architecture, empty states, what to cut.
R11 ROMAN (claude_opus_5_5). B27 B30 B31 B32 and prototype 68-74, decisions 9-13. Why Roman has no context; consent; the chat-room
  redesign (premium Anthropic x iMessage); chips; privacy revocation; "coach teaches Roman" ("Why xyz, sir?"); form of address.
R12 COACH ONBOARDING (claude_opus_5_5). B02 B03 and prototype 75-86 (K0-K8, coach lands on Clients). A consultative coach onboarding as
  thorough as the client's, profile first, money last (first paid offer and Stripe later, guided); the personal link/QR; import offer K7
  (flag off; "the importer must be exactly as it's planned": read ops/V11_IMPORTER_PLAN_132.md); Part B with deep explanations.
R13 COACH DAILY APP (gpt_6_1_sol). What a coach sees after setup: Clients, client detail, programs, messages, check-ins, packages, Get paid,
  Overview checklist; first paid offer + guided Stripe activation (B06 product flow); what the first 5 coaches truly need; cut list.
R14 DESIGN SYSTEM, QUIET LUXURY (claude_opus_5_5). B11 B15 B16 B29. Tokens vs prototype css (exact values), fonts and type scale,
  spacing, buttons (one green button per screen, shape, pressed state), chips, rows, radios, wheels, cards, sheets, motion <=300 ms,
  logo/wordmark (TGP), icons; a component-library replacement plan that makes every screen match; apply Mobile-App-Design-Intelligence.md.
R15 QA AND RELEASE GATE (gpt_6_1_sol). B41. Why nobody saw this before the owner; a prototype-parity gate (rendered side by side),
  device QA (Android 360x800 + iPhone), end-to-end flows sign-up→Home for coach / client with code / coachless / clinic, reviewer rubric
  (lenses must look at screenshots), flag policy; tonight's iOS build 8 checklist vs the release-blockers doc, review notes and metadata:
  everything that would make Apple reject tonight (2.1 completeness, hangs, locked features, 4.8 login, 5.1.1 deletion, AI consent, 3.1.1).
R16 COMBINER (claude_opus_5_5, launched after R01-R15 finish): one orchestrator's plan that makes all ideas work together (see its objective).

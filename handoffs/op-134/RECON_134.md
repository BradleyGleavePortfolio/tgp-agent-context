# TGP recon findings — operator agent 134 (2026-10-08)

Everything agent 134 learned while taking over from agent 133, in one place. It covers the takeover recon (19:2x-20:00 PDT), the product
recon the owner asked for at 20:0x, and the root causes found while the fleet worked. Evidence labels used throughout: "from the code"
(read in the repos), "seen in a test" (jest/CI), "from production SELECT" (read-only database query), "web render" (browser render, not a
device). Nothing here was seen on a phone.

## 1. What the recon covered
- Read in full: the agent 134 start prompt (handoffs/op-133/AGENT_134_START_PROMPT.md); the handoffs of agents 130, 131 and 133; the
  Source of Truth sections on agent rules (A2), the launch path (A7.1), owner decisions (A6, incl. A6.13), the company north star (A7.5)
  and the 2030 goals; the owner's 41-problem bug register; the owner's 11 phone screenshots; all 87 prototype screens (rendered from the
  prototype zip with their notes, specs134/shots); the Onboarding Pathways and Prototype Review document; the four-week master programs
  fixture.
- Checked live: every open PR in both product repos, both main branches, production /health and /readyz, the EAS build list, and
  production data by SELECT only.
- Only skimmed: history before agent 120, the full model-routing document (A3), the Design Intelligence training document (given to
  the builders), and the word-for-word decision log (Part C).

## 2. TGP in one paragraph
"You bring the coaching, and TGP runs the rest." Clients get one app with six tabs (Home, Train, Food, Calendar, You, Community) and
Roman, an AI assistant who knows each client and keeps them on track between sessions. Coaches sell packages through TGP's checkout, get
paid through Stripe, book sessions, build programs (including the AI workout builder), and message clients. Sub-coaches are free to add
as a coach grows; gym tools come later. TGP takes 2% of what a coach sells.
- North star (owner 2026-10-06, SoT A7.5): "the fitness platform for the new Post-AI world"; "What weight-watchers was for the TV era,
  we are for the AI era." TGP is the growth ladder for independent fitness operators: Creator, then Scale (sub-coaches, routing), then
  Gym.
- Today's bar (owner): "a perfect Everfit competitor for small PT operations". 2030 aim: "a 10 fig company".

## 3. Launch path and day-1 scope
- Day 1 (SoT A6.1, owner 2026-10-05): the 7-step launch path, push notifications, community (coachless sign-up and featured coach,
  invite codes, broadcasts, one unified inbox and messaging), the Roman day-1 upgrades, and all scheduling changes.
- The 7 steps (A7.1): 1 Privacy, 2 Money, 3 Coach, 4 Failed payments, 5 Health Connect, 6 Remainder, 7 Builds and review. Agent 130
  recorded 6 of 7 done on 10-07 (agent 134's first message said 1/7 from an older count and was corrected). Step 7 is what remains:
  EAS builds, a device pass, store review.
- Build 8 is the step-7 build that must carry: the consultative onboarding for every client and coach (134-1: the coach consultation,
  prototype 75-86, is in build 8 and the build waits for it), a Roman who knows the client, the luxury screens, an app that opens without
  hanging, and coachless clients who see empty states instead of lock pages.

## 4. History of agents 100-134 (outline)
- Before 10-05: foundations: community, the importer, money, scheduling, push, Health Connect, security.
- 10-05 (agents 120-123): the Source of Truth written; the 7-step launch path approved; the owner's "forget weird edge cases" and
  "ruthless reviewers" rules; two-reviewer merging became standard.
- 10-06 (agents 124-126): Roman's memory planned; the north star written; sub-coach teams made free.
- 10-07 (agents 127-130): the AI workout builder went live; the luxury screen redo ran to 48 PRs; Roman's memory switched on; 136 PRs
  merged in one day.
- 10-08 (agents 131-133): iOS build 7 and the Android test app shipped; the owner's phone test found 41 problems; agent 132 ran the
  rescue; agent 133 found why the consultation never appeared and why Roman was blind, and ran the redesign wave.
- 10-08 evening (agent 134): 94 PRs merged that day across both repos, deploys 8-11, house programs seeded, 39 of the 41 done.

## 5. Standing owner rules that shaped the work
- "NO DO NOT KICKOFF A HALF ASSED BUILD." Never cancel agents: stop them with a message (safe stop plus HANDOFF).
- Coachless clients "can do everything a normal coached client can, besides getting direct coaching ... it's just empty for them
  inherently" (no lock pages).
- The prototype governs onboarding at about 90%; the six client tabs stay. "Nice rounded corners, luxurious, not rectangles."
- Keep the 9 redesigned screens nothing opened yet. Builders are Opus; every PR gets one Opus and one Sol lens; dual APPROVE at the exact
  head; PRs under 800 lines; never rebase.
- Repos are public: no secrets, no personal emails, never name the clinic partner. Supabase SELECT only; no money moves; flags only via
  fly-env-desired-state.json + fly-env-sync.yml; deploys only via fly-deploy.yml at a green main SHA.
- App copy: no first person (Roman excepted), no exclamation marks, no emojis.

## 6. Root causes found (the 41-problem register)
Status per problem is in ops/BUGS134.md (39 DONE at handoff). The causes behind them:
- Consultation never appeared for clients (B14, from agent 133, confirmed by production SELECT): production had no house program set, so
  every client fell to the short flow. Fixed: seed runner (b#896), seed applied 21:18 under the owner's coach account; 1 active house set.
  The exercise catalog in production was empty, so the first apply needed exercise_catalog=upsert.
- Roman could not see client details (B31, from the code): a startup bug in the Nest dependency tokens left services unwired. Agent 134
  found the same class of bug in three more places (b#893): message blocks were never enforced in production, approving an AI draft never
  sent it, and a voice-upload path; a src-wide test now guards it.
- App never opened / "Locked" flash / no try-again screen (B35-B37, from the code): the wait for the session renewal had no time limit
  (src/api api.ts), and startup checks could run forever. Fixed in m#619 (8 s per check, calm "Try again" after 15 s, newest run wins)
  and m#628 (the lock covers the app at once on return for opted-in users).
- Coachless clients locked out of logging (B22-B24, from the code + web render): the server answered active:false for coachless
  clients, so the app showed "Logging comes with coaching" and "Food and water logging need active access." Fixed server side (b#888) and
  app side (m#635).
- Squished to the top / iPhone-only safe area (B13, B28, B39, from the code): screens used a fixed paddingTop of 56/60 or react-native's
  SafeAreaView (iOS only). 24 coach screens still had it at takeover; all moved onto the shared Screen frame (m#625-m#627, m#633).
- Rectangles instead of rounded corners (B16): radius tokens (buttons 12, cards 16, sheets 24) in m#607 plus literal radii removed.
- Coach setup before the consultation (B02, B03): packages came before coach setup and the questions were thin; the coach
  consultation K0-K8 replaced the wizard (b#894, m#620-m#623), and its answers now reach the client's coach card and Roman (b#897, m#630).
- Old data for up to 60 s and "setup moved on another device" (B07, B38): fixed in b#889.
- Approved features off in builds (B40): flags were missing from eas.json build profiles; fixed in m#580.
- Spam folder for confirmation emails (B04): fixed on the owner's side (Resend connected to Supabase Auth).

## 7. Things that differed from the handoff at takeover
- m#612 already had one approval; m#607 had both and only waited on m#590; m#603 and m#582 still showed request-changes at heads whose
  fixes were text-only; m#576 conflicted with main; b#888's code scan was failing.
- The merge script could count a lens's old APPROVE after that lens changed to request-changes. Fixed before any merge.

## 8. Platform and ops findings
- Background jobs in this sandbox die with each bash call unless started with `setsid nohup ... < /dev/null &`.
- GitHub proxy tokens expire about every 20 minutes; loops must re-read the token file each pass.
- PRs retargeted to main lack the required CodeQL checks until closed and reopened.
- A CI failure from a red main stays attached to the PR; `gh run rerun` re-tests the old merge commit. Count only the latest run per
  check, and close/reopen or push to get a fresh run.
- Mobile main went red after m#609 (a duplicate key, TS1117); m#617 fixed it.
- fly-deploy.yml refuses a release that adds migrations unless the migrations input says apply-migrations.
- Mobile version numbers come from app.json (eas.json appVersionSource local, no auto-increment): every build needs a bump PR. At
  handoff app.json still had build 7's numbers; m#642 bumps iOS to 8 and Android to 7.
- EAS builds need a real node_modules (a symlinked one causes a fingerprint mismatch). eas-cli works through the sandbox proxy only with
  its fetch patched so that only api.expo.dev uses the proxy.
- No KVM here, so no Android emulator; screen checks are web renders (react-native-web harness, Playwright) labelled as such.
- Flaky CI tests that pass on rerun: ConnectProviderSheet.attemptFence and .importEpoch, WorkoutScreen.calm130, useBiometricGate.

## 9. Production data facts (SELECT only)
- Three coach accounts: a system coach, the App Review demo coach (one demo client), and the owner's own coach account (created
  2026-10-08). No account has an owner role, so the house set is owned by the owner's coach account (133-10).
- One active house program set after the seed; the exercise catalog was empty before it.

## 10. Design findings
- The prototype (87 screens) is the blueprint for onboarding; the luxury targets in design-targets/mobile are "the bar, not the
  blueprint". The owner chose coach-home-solo for every coach's Home (m#633).
- Clients cannot upload profile pictures today (from the code: UserProfile.avatar_url exists, but there is no upload endpoint and no
  image picker), so faces are initials monograms. Profile pictures are recorded as a v1.1 ideal (SoT A6.14).
- Today's workout on client Home is the serif hero line ("<plan> is ready.") and the full-width "Start <plan>" button (from the code).
- Web-render pass (SHOTS-134B, 62 renders): the coach consultation matches prototype 77-81 closely; open polish items are listed in
  HANDOFF.md (consent coach lines for coachless clients, sign-in underlines, "Continue with Google" case, tab label guard, Home
  "Allergies" line).

## 11. Known gaps
- Nothing has been seen on a real phone since build 7; B41 is the owner's phone pass of build 8.
- The coachless consent text still mentions a coach; a coach-free version needs new backend consent versions (legal text, removals only).
- A live Roman evaluation of "never claims to be the coach" waits for the Roman eval harness (backend PR #605, unmerged).

## Where to find things
handoffs/op-134/HANDOFF.md (state and first moves), ops/BUGS134.md (the register), ops/FLEET134.md (timeline), ops/reports/ (each
agent's report and HANDOFF), ops/lanes134/JOBS134.md (every job entry), TGP_SOURCE_OF_TRUTH.md A6.13-A6.14 (decisions) and the AGENT 134
banner in Part B.

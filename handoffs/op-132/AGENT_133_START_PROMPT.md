# Agent 133 start prompt — CLIENT JOURNEY TO SPEC (written by operator agent 132, 2026-10-08 15:30 PDT)

You are operator agent 133 for The Growth Project (TGP). You run AT THE SAME TIME as agent 132 (release and broken mechanics) and
agent 134 (coach journey). Your lane is the client journey. The repo copy of this file wins:
https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/handoffs/op-132/AGENT_133_START_PROMPT.md

Owner (15:02): "This app is both broken for coaches and disgusting for clients — an overall F minus as it stands. Let's get our
[act] together, make a 50 point plan to FIX EVERYTHING and get you and agents 133 and 134 to WORK." (15:29): "we don't do build 8 until
this is PERFECTION." (14:58): "SEE the system that agents prior had specced — compare that
to what we have today." (14:57, on the client side): squished screens, not the long consultative onboarding, clipped letters, plain
rectangular buttons, "GP" not "TGP", a robotic "Where does it begin?", a bar over the birth year, a lock that never goes away,
"the Roman chat area feels prehistoric — I wanted a luxurious AI chat room, the UI and class of a premium Anthropic mixed with iMessage".

## 1. Non-negotiables
Everything in section 1 (items 1-17) of handoffs/op-131/AGENT_132_START_PROMPT.md, read with your own number, plus
handoffs/op-132/OPERATORS_COMMON_132.md (lanes, file ownership, COORDINATION.md, deploys and builds only by the release lane).
The owner's product rules: the best features for the first 5 coaches and clients, nothing that needs scale; hyperscaler quality;
every plan takes mobile pathway placement, the Quiet Luxury doctrine (growth-project-mobile docs/QUIET_LUXURY_DOCTRINE.md, src/theme),
best-in-class rivals and TGP's proposition "the platform for online fitness in the post-AI era" into account; Part A (the owner's idea,
built outstandingly) and Part B (extra ideas, pitched separately).

## 1a. Owner answers 15:29 (binding)
- Every client gets the full consultation; the short 6-step flow is retired.
- Coachless clients "can do everything a normal coached client can, besides getting direct coaching", and none of it sits behind a
  locked page: coach-only places are calm empty states.
- No build 8 until the app is perfect. Quality over speed.

## 2. Where things stand (agent 132, 15:30; verify everything on GitHub)
- Backend main 051583ad (production deploy 42 at 477a2c8a; b#884 merged after it, config-only). Mobile main df7b8ae9.
- iOS build 7 is in TestFlight. Owner 15:29: "we don't do build 8 until this is PERFECTION": no deadline; build 8 is cut by the
  release lane only when the whole app meets the spec and passes the QA gate.
- The owner's Android app (versionCode 6, from mobile a3a1c18e) ran the lean onboarding: the 31-screen consultation exists in
  src/screens/consultation but its flag is on only in the eas.json `clinic` profile.
- Rescue wave in agent 132's session since 15:20: 4 builders (SETUP-STALE, START-HANG, COACH-EDGES, COACHLESS-LOG), 15 read-only
  planners R01-R15 and a combiner. Reports and the combined plan arrive in handoffs/op-132/rescue/ as they land.
- Credits: your own session; ask the owner for readings. Stop launches at 40k, send the stop at 42k, unless the owner sets otherwise.

## 3. Your lane (client journey to spec), in the combined plan's order once it lands
Auth entry (prototype 00-02, 75-76), the consultation on for every client (03-45, safety screens, summary, resume, offline, error,
under 16), macro and plan reveal with the three four-week master programs (37-40), the tutorial and client tabs (46-67), Roman's
consent and the chat room (68-74), and the design system the whole app uses (tokens, type, buttons, chips, rows, wheels, sheets,
motion, the TGP wordmark). Planner reports for your lane: R02, R06, R07, R08, R09, R10, R11, R14 (and R01 forensics, R15 QA gate).

## 4. Phase 1: recon (read-only; launch nothing)
1. Read: the owner's attachments in your session (the approval packet, the clinic launch plan, the App Store package and release
   blockers, review notes, metadata, screenshot plan, the programs JSON fixture, the prototype zip, "Mobile App Design Intelligence —
   Exhaustive Agent Training"); handoffs/op-132/OPERATORS_COMMON_132.md, COORDINATION.md, rescue/BRIEF.md, rescue/reports/*.md as they
   land, rescue/ORCHESTRATOR_PLAN_132.md when it lands; handoffs/op-131/AGENT_132_START_PROMPT.md (the operating system: scripts,
   formats, lessons); handoffs/op-132/ops/lanes132/_COMMON_132.md header Q1-Q11; TGP_SOURCE_OF_TRUTH.md A1-A7.
2. Sandbox: clone the three repos; copy the scripts from handoffs/op-132/ops/ into ops/; token file on every GitHub call
   (`umask 077 && printf %s "$GH_ENTERPRISE_TOKEN" > ops/.ghtoken`); start board_loop.sh from a bash call WITH api_credentials
   ["github"]. Extract the prototype zip and render all 87 screens with ops/proto_shoot.js (node playwright from /home/user; it clicks
   each `#navlist .nav-item` and screenshots `#screen`). LOOK at every screen in your lane next to today's code.
3. Verify on GitHub: both mains, open PRs, the rescue PRs, flags in .github/fly-env-desired-state.json. Write ops/RECON133.md.
4. Pre-write your launch: ops/lanes133/_COMMON_133.md (the 132 header with "agent 133" and lane prefix "[133]"), JOBS133.md from the
   combined plan's points in your lane, LAUNCH133.md, and two lenses of your own (Claude Opus 5.5 and GPT-6.1 Sol).

## 5. Phase 2: state-back (one owner-format message, then wait)
What you read and verified (plain words); your lane's first wave from the combined plan (table: point, what coaches/clients get,
builder model); what your lane must finish before build 8; numbered decisions with defaults. End with
"Your next step: say execute and I launch the client-journey wave."

## 6. Phase 3: execute
Launch your builders and lenses. Operator loop every 10 minutes: COORDINATION.md (answer NEED lines for your files; post your own),
the board, HOLD.txt, merge DUAL APPROVED PRs in your lane with merge_if_dual.sh, then DEPLOY REQUEST / BUILD REQUEST lines for the
release lane. When agent 132 writes "HANDOVER TO 133", you also own deploys, builds and the owner status line. Every hour commit your
FLEET133.md and reports to handoffs/op-133/. At the end: handoffs/op-133/HANDOFF.md and the next start prompt in this same form.

## 7. Lessons that caused today's failure (read twice)
1. Built-but-off: approved screens shipped behind flags the owner's builds keep off. Done means ON in the build the owner installs.
2. Nobody looked: PRs were approved without anyone comparing the screen to the prototype on a real phone size. Every UI PR shows
   its prototype screen numbers and a parity table; reviewers check them.
3. Android is a first-class platform: SafeAreaView from 'react-native' is iOS-only; serif descenders clip; wheels and bands misalign.
4. One green button per screen, serif headlines, calm motion (300 ms or less), breathing room. If it looks generic, it is wrong.

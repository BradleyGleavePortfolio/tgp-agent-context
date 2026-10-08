# Three operators at once: agents 132, 133 and 134 (written by agent 132, 2026-10-08 15:30 PDT)

The owner (15:02): "make a 50 point plan to FIX EVERYTHING and get you and agents 133 and 134 to WORK". From 15:30 three operator
agents run at the same time, each in its own Computer session and sandbox. GitHub and this repo are the only shared ground.

## Why (the owner's test, 14:35-15:13)
The owner installed the Android test app and tried it as a coach and as a client without a coach. Coach sign-up broke (cut-off
progress icons, packages before the profile, thin questions, the confirmation email in spam, a Stripe "not switched on" wall,
"your setup moved on another device", a dead Back button). The client side was off-spec and ugly (squished screens, the lean 6-step
flow instead of the approved consultation, clipped letters, plain rectangular buttons, a "GP" logo, a robotic "Where does it begin?",
a wheel band hiding the birth year, a "Logging comes with coaching" lock that reappears forever, a 6-tab bar, a dated Roman chat
that does not know the client's name), and reopening the app as a coachless client ends on an endless spinner. The approved spec
is an 87-screen prototype plus an approval packet. Owner 15:29: no build 8 until the app is perfect; every client gets the full consultation; coachless clients get everything
except direct coaching, never a locked page.
The full bug register (B01-B41) is rescue/BRIEF.md section 1.

## The rescue wave (agent 132's session, launched 15:20)
- 4 builders on the clearest breakages: SETUP-STALE-132 (B07, B38), START-HANG-132 (B35-B37), COACH-EDGES-132 (B01, B05, B08-B10, B06
  calm state), COACHLESS-LOG-132 (B22-B25). Their PRs are on GitHub as branches agent132/<id>.
- 15 read-only planners R01-R15 (scopes in rescue/BRIEF.md section 6), then the combiner R16, who writes ONE orchestrator's plan:
  rescue/ORCHESTRATOR_PLAN_132.md (50 numbered points, waves, lanes, PR slices, decisions). Agent 132 pushes the reports and the plan
  here as they land. That plan is the work list for all three operators.

## Lanes (file ownership; this is what prevents three operators from colliding)
- Agent 132 — BROKEN MECHANICS AND RELEASE. The 4 rescue builders; mobile src/navigation/RootNavigator.tsx, src/services/api.ts,
  src/entitlements/**, src/components/BiometricUnlockGate.tsx, src/hooks/useBiometricGate.ts; backend src/common/**, entitlement guards,
  src/connect/connect.module.ts readiness. ALL merges' deploys, every EAS build (iOS build 8 tonight, the next APK), the combined plan,
  the owner's status line. When agent 132 winds down it writes "HANDOVER TO 133" in COORDINATION.md and agent 133 takes this lane.
- Agent 133 — CLIENT JOURNEY TO SPEC. Auth entry (welcome, role, create, verify screens: prototype 00-02, 75-76), the client consultation
  (prototype 03-45; on for every client), macro and plan reveal with the three master programs (37-40), the tutorial and client tabs
  (46-67), Roman's consent and chat room (68-74), and the design system (src/theme/**, shared src/components/** except the two files
  above) because every client screen depends on it. Mobile src/screens/auth/**, src/screens/consultation/**, src/lib/consultation/**,
  src/screens/client/**, Roman chat screens, src/navigation/AuthNavigator* and ClientNavigator*; backend consultation, programs,
  macros and Roman modules.
- Agent 134 — COACH JOURNEY TO SPEC. The consultative coach onboarding K0-K8 and the coach landing on Clients (prototype 77-86), profile
  first and money last, the personal link and QR, the first paid offer and guided Stripe activation later, the coach daily app
  (Clients, client detail, programs, messages, check-ins, packages, Get paid, Overview), the import offer K7 exactly per the importer
  plan. Mobile src/navigation/CoachWizardNavigator.tsx (only after COACH-EDGES-132 merges), src/screens/coach/**, src/lib/coachSetup/**;
  backend src/coach/**, packages and connect onboarding (not connect.module.ts readiness).
- Anything outside your lane: append "NEED <file> — <why> — <your PR or job>" to COORDINATION.md and wait for the owning lane's
  "OK <file>" line (owners check every 10 minutes). Never push to another lane's branch.

## Shared rules (on top of the agent 132 start prompt's non-negotiables, which all three follow)
1. Every PR: Claude Opus 5.5 AND GPT-6.1 Sol APPROVE at the exact head, from your own lenses; merge only with merge_if_dual.sh after
   checking your ops/HOLD.txt and COORDINATION.md for "HOLD ALL". Any push resets verdicts. Under 800 lines; over 1,500 fails.
2. Deploys and EAS builds: only the release lane (agent 132, later 133). Ask with "DEPLOY REQUEST <full sha> <label>" or
   "BUILD REQUEST <profile> <reason>" in COORDINATION.md. Never run deploy_when_green.sh or EAS from another lane.
3. PR titles start with the lane: "[132]", "[133]" or "[134]", then the bug IDs (B07 ...) and the plan point numbers.
4. A feature is not done until it is ON in the build the owner installs. No new screen ships behind a flag that the owner's builds
   keep off, unless the owner chose that in a decision.
5. Every mobile UI PR names the prototype screen numbers it matches, with a parity table, and says plainly what was not seen on a
   device; follow R15's QA gate once it is in the combined plan.
6. Never name the clinic partner anywhere, including the abbreviation in the owner's clinic plan file name. Say "the clinic partner".
7. Owner messages: agent 132 sends the combined status line. Agents 133 and 134 message the owner only for their state-back, their
   own decisions and their credit stop, in the same owner format.
8. Credits are per session: each operator uses only the owner's readings for its own session; stop new launches at 40k and send the
   stop at 42k unless the owner sets another limit.

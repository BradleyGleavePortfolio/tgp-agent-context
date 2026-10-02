# Lane AUD-SOL-5 (agent 112) — third GPT-6.1 Sol audit lens (independent; never push code)

Same contract as /home/user/workspace/ops/lanes/AUD-SOL-3.md (read it, and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully).
Queue (in order; append each verdict to /home/user/workspace/ops/reports/AUD-SOL-5-112.md):
0. backend #642 @ 85950984 (GOOGLE_CLIENT_IDS -> github-secret) and backend #643 @ f21b3c63 (BOOKING_REMINDERS_ENABLED -> on):
   T4 production-ops one-line launch-manifest flips by lane B-FLAGS-3 (wait for green required checks). Fast and decisive: these
   unblock Google sign-in (owner day-1) and reminders. Verify the gate preconditions, what installed builds will show, and that
   merging changes nothing until the operator applies.
1. backend #641 @ 563e3f80 + mobile #329 @ 4071d0ce — T4 money (coach Money read model + coach setup wizard). AUD-OPUS-4 posted
   REQUEST CHANGES 0/2/4 (#641) and BLOCK 1/2/4 (#329) at these heads (Money UI missing). Your lens now so ONE fix round closes both
   lenses: hunt what Opus missed (tenancy: a coach must only ever see their own clients/payments; money math vs the owner rule
   price - processing - 2%; idempotency; Stripe Connect state; copy/error rules). Do not repeat Opus's findings; reference them.
2. backend #609 @ 40616dcf + mobile #312 @ 90e78abe — T4 (welcome message +13 min, runtime text never in repo; workout reminders
   from the first-session day at the preferred time). Moved here from AUD-SOL-4.
Skip any item blocked on CI and come back. No pushes, merges, workflow dispatches or production actions.
Final answer (<400 words): each PR, head, verdict, A/B/C counts, comment URL.

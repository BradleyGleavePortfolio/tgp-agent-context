# Lane S-COACH-MOB-2 (agent 112) — Claude Opus 5.5 builder: coach wizard fixes + the whole Money UI (mobile #329 + stacked PR; T4 money)

Owner decisions: 10-01 11:29 fee math #1, $19.99 min or free, fix Earnings, coach "aha" = connect Stripe/bank, invite a client,
first payment; 11:36 Money = a coach Home card that expands into full pages, Business metrics merge into it; 12:51 Earnings dead =
blocker, Money reuses command-center/, coach wizard = day-1 blocker; 09-30 17:53 Stripe dashboard link = "Payout settings" under
Earnings/Money, TGP Money page is the default; no generic errors ever; "I want more, not less functionality".
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/S-COACH.md (original objective);
the AUD-OPUS-4 verdicts on mobile #329 (BLOCK 1/2/4, comment 5960028238) and backend #641 (REQUEST CHANGES 0/2/4, comment
5960027984) incl. their "Completeness vs S-COACH objective" sections; /home/user/workspace/ops/aud-opus4-112/.
PUSH HOLD: a third Sol lens (AUD-SOL-5) is auditing #641/#329 at 563e3f80/4071d0ce right now. Do not push to #641 or
#329 until its AUDIT comment is posted on that PR (poll gently with gh); read, plan and code locally meanwhile, then fold Sol's
findings into the same round (one round closes both lenses). New PRs/branches you create may be pushed at any time.
Parallel lane: S-COACH-BE-2 (backend #641 + leak PR) and S-COACH-MOB-2 (mobile #329 + stacked Money UI) run at the same time —
read each other's pushes on GitHub; backend owns the API contract, mobile follows it.
Do (one pass; each finding closed with a failing-before test):
1. mobile #329 @ 4071d0ce: close A-329-1's wiring part (the Home checklist and wizard must route to the real Money page, never the
   dead Earnings screen), B-329-1 (publish retry/timeout must never create a duplicate package: idempotency key or server
   lookup), B-329-2 (truthful "payouts not configured" copy with a working action), and the Cs (draft/archived package is not
   "live"; invite tick persisted server-side or derived from server data, not device-only; Stripe tick correct when resuming on the
   last step; checklist load errors shown with a retry). Merge mobile main 2c17c241 first (merge commit).
2. The Money UI as ONE stacked PR on #329's branch (branch agent/clinic/s-coach-money-mob; base = #329 branch; Conventional
   Commits title; tier header T4), built over backend #641's routes (read its controller/DTOs at 563e3f80 and follow the
   S-COACH-BE lane's changes as they land): Home Money card (headline numbers, needs-attention count) expanding into the Money
   page (earnings, payouts, failed payments with the card-update state, refunds/disputes incl. the amount held from the next sale
   once #627's field exists, new clients, Business metrics folded in), "Payout settings" (Stripe Express dashboard link),
   Packages and CSV export entry points in the footer (export only if the backend route exists; otherwise list it as a gap),
   reuse command-center/ components; retire the old Earnings and Business metrics screens: redirect their routes to Money and
   delete every call to the six 404 routes. Every state: loading, empty (no Stripe yet -> the setup action), error with specific
   copy + reference ID, offline.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites per the brief). Never merge, dispatch workflows or touch
production. Report: /home/user/workspace/ops/reports/S-COACH-MOB-2-112.md. Final answer (<400 words).

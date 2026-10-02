# Lane S-COACH (agent 111) — Claude Opus 5.5 builder: coach "Get paid" wizard + TGP Money (day-1 blockers; no PR yet)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; prompt v5 section 4.7 (Money page, coach onboarding; binding), 4.12 and
4.13 (newer owner decisions win: OR-110-2 Stripe immersion — Stripe-hosted pages limited to Connect Express onboarding and 3DS,
themed via Stripe Branding; "TGP never loses money"), section 9 (tiers) in
/home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md. Rules: more functionality,
not less; hyperscaler quality; no generic errors; WCAG 2.2 AA; every number from live routes; nothing fake or dead reachable.
Context: fee model (backend #627, OR-111-1 refund/chargeback netting with an open-balance API) is being rebuilt by lane B-FEE-R5 right
now; dunning (#628/mobile #322) and packages $19.99/$0 (#629 merged, mobile #321) are in review. Build on live/merged routes and
leave clean seams (typed client + feature-detected sections) for the #627 breakdown/open-balance API rather than waiting.
Recon first (<=30 min, read-only): CoachWizardNavigator (steps 2-5 hollow), coach Home, the Earnings screen (calls six 404 routes
from closed PR #216 — retire them), Business metrics, the live routes /v1/coach/payments/earnings, /v1/coach/payments/purchases,
/coach/connect/{status,metrics,payouts}, /v1/connect/accounts/dashboard-link, Stripe Express onboarding link creation,
FirstPaymentWowHost (EXPO_PUBLIC_FF_ROMAN_FIRST_PAYMENT_WOW), invite link/QR share, package creation API. Gap list in your report.
Build (stack of reviewable PRs; grade each; Money UI on live routes is T2, anything touching Connect onboarding/payout state T3+):
1. Coach wizard around the coach "aha" (Bradley: "1) connect Stripe OR bank 2) invite client 3) receive first client payment"):
   practice basics -> Get paid (Stripe Express hosted onboarding collects bank + ID; return/refresh links back into the app; truthful
   status incl. requirements due) -> first package prefilled ($19.99+ or free, matching merged #629 rules) -> invite first client
   (link or QR share) -> Home checklist ending in the first-payment celebration. Always reachable (role choice is must-ship).
2. TGP Money: coach Home card (net to you 30d + red needs-attention count) expanding to the Money page: net with Today/30d/90d/YTD
   chips + change vs previous period, tap any amount for price - processing - TGP 2% = net; Needs attention (failed payments with
   dunning status, disputes, Stripe requirements due, each with "Message client"); next payout amount/date; MRR, paying clients,
   churn 30d, new clients 30d; recent charges (last 5 + See all filtered paid/failed/refunded); footer: Payout settings (Stripe
   dashboard link), Packages, Export CSV for taxes. Old Earnings and Business metrics routes redirect to Money. Retire the 404 calls.
3. Backend gaps only where a number has no live route (small backend PRs; register env names per #624; ask the operator for a
   migration prefix — next free 20270224000000).
Merge mains with merge commits (mobile e3986e89+, backend e867fe62+). Tests via heavy.sh (targeted jest --runInBand; tsc once per
repo per round). Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/S-COACH-111.md.
Final answer (<400 words): PRs, heads, tiers, what a coach can do now, tests, CI, open gaps.

# Commerce Hunt — BUYER SIDE (Client Purchase, Guest Checkout, Web Checkout)

## Who you are
Read-only investigator for "TGP" (The Growth Project / trygrowthproject.com) — a fitness-coaching app. Backend = NestJS, mobile = React Native (Expo). You are Claude Opus 4.7. Do NOT modify any code, do NOT open PRs, do NOT commit. This is a pure HUNT + DESIGN-THINKING pass that produces a written report.

## Repos (read-only)
- Backend: https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git @ d8698b77
- Mobile:  https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-mobile.git @ 6d17664f
The coding subagent infra clones the BACKEND for you (repo_url in metadata). For MOBILE, clone it read-only yourself into a scratch dir (e.g. `/home/user/workspace/tgp/mobile-commerce-hunt-buyer-readonly`) with `git clone <mobile url>` and read from there. Do NOT touch /home/user/workspace/tgp/mobile (operator's read-only main checkout).

## North star context
- North star: 3/10 coaches reach "Activated." ICP = trainers billing $2K–$8K/mo, 10–40 clients.
- Master Workout Builder spec exists at /home/user/workspace/specs/MASTER_WORKOUT_BUILDER_SPEC.md — READ §3.2.1 (sellable/droppable asset seam: `AssignableAssetRef`, `is_sellable`, revision-pointer-for-sale). Your purchase/fulfillment design must be consistent with it.
- A sibling infra-inventory subagent is cataloguing raw checkout/ClientPurchase/packages/storefront/notification/scheduling models → /home/user/workspace/specs/COMMERCE_DRIP_INVENTORY.md. Read it IF present, do NOT block on it.
- A sibling GPT-5.5 agent owns the COACH side (package creation + asset attachment) → /home/user/workspace/specs/COMMERCE_HUNT_COACH.md. Read it IF present, do NOT block on it. Don't duplicate the coach side.
- Known verified issue (still relevant): B7 OPEN — Stripe `transfer.failed`/`payout.failed` events silently ignored (billing.service.ts:365-373). Watch for related checkout/webhook gaps.

## YOUR SCOPE — BUYER SIDE ONLY
You own the CLIENT/BUYER experience of **picking & purchasing packages**, plus **guest checkout** and **web-page checkout** (coaches/sub-coaches have websites coded INTO the TGP app). Produce a written report covering:

1. **Current state — "client picking packages."** Every screen, route, component, endpoint, DTO, service, DB model in the client-facing storefront/package-browse/select/checkout flow today. Cite file:line. Map the actual current page path a CLIENT walks: discover → view package → checkout → confirm → (what happens post-purchase today?).

2. **Current state — guest checkout.** Does a non-logged-in / pre-account buyer flow exist? Trace it end-to-end (backend + mobile). How is a guest converted to a client/account? Where does payment + account creation interleave? Cite file:line.

3. **Current state — web-page checkout (coach/subcoach in-app websites).** Coaches/sub-coaches have storefront websites coded into the TGP app. Find that web/storefront layer, its routes, how a buyer checks out from a coach's public page, and how that ties back to the same ClientPurchase/checkout backend. Cite file:line.

4. **What's broken/weird ALREADY across all three buyer journeys.** Dead/half-wired screens, webhook gaps (recall B7), missing post-purchase state, no receipt/confirmation, broken deep links, currency issues, missing error/loading/empty states, IDOR/auth gaps in purchase endpoints, race conditions on checkout. file:line + severity.

5. **Reuse vs rebuild vs build-new (buyer side).** Verdict per component (REUSE / REFACTOR / RIP-OUT-AND-REBUILD / BUILD-NEW), justified against the new requirement that a purchased package now triggers **content-agnostic post-purchase fulfillment** (drip-feed of workouts, meal plans, PDFs, videos, auto-messages).

6. **Post-purchase fan-out (design thinking — buyer-facing half).** When checkout succeeds (app purchase, guest purchase, OR web-page purchase), what must fire to seed the buyer's drip schedule and deliver immediate-on-checkout assets? You are NOT writing the scheduler runtime (separate drip spec), but define: the post-checkout hook point(s), how all THREE checkout entrypoints converge to one fan-out, and what the buyer sees immediately vs. over time. Note how guest purchases (no account yet) seed a schedule that must later bind to the created account.

7. **Logical target page path (client + guest + web).** Propose ideal end-state flows for each of the three buyer entrypoints, and show how they converge to one purchase + one fan-out path. Contrast with today.

8. **Boundary notes.** Flag anything touching the coach-authoring side or the drip runtime so the final spec stitches cleanly.

## Output
Write your full report to `/home/user/workspace/specs/COMMERCE_HUNT_BUYER.md`. Dense, file:line-grounded, explicit verdicts per component, webhook/payment correctness called out. End with a prioritized "what to build/fix first" list for the buyer side. Then return a concise summary of top findings and recommendations.

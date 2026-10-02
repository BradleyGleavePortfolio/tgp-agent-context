# Lane B-RECUR (agent 113) — Claude Opus 5.5 builder, T4 (money). OWNER'S MOST CRITICAL ITEM.
Method (all 113 builder lanes): read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. gh/git need bash
api_credentials=["github"]. Commit identity: git -c user.name="TGP Agent 113" -c user.email="agent@tgp.invalid". Expo Free: never
start an EAS build. Owner bar (binding): hyperscaler quality, get it right the first time (no audit ping-pong), more functionality
not less, pristine Apple-level UX, no generic errors ever (every failure: what happened + a working next action; unknown -> short
reference + support path + Sentry without PII), Quiet Luxury copy (no emojis, no exclamation marks, plain warm words, no first person
"we/us" in client-facing error copy unless it is a named human).
Process: your own worktree(s) under /home/user/workspace/wt/<lane>-<n>; wait for /home/user/workspace/deps/<kind>/READY, then
link_deps.sh; backend: `/home/user/workspace/ops/heavy.sh npx prisma generate` after linking. Run ONLY targeted jest (your touched
files + new failing-before tests) and eslint/prettier on changed files, all through /home/user/workspace/ops/heavy.sh (never wrap it
in a short timeout). Push early; GitHub CI runs tsc + full suites (stacked PRs get no CI: say so in your report). Every finding you
close gets a test that fails before and passes after. Keep the PR body tier header current (Tier / Why / T4 trigger scan / T3 trigger
scan / Bounded T1 / Builder-owner / Acceptance evidence / Promotion triggers) and add a "Fix round" table (finding -> change ->
commit -> test); if the platform refuses a long PR-body edit, post it as a PR comment instead and say so. Conventional Commits PR
titles. Merging origin/main into your branch is fine (merge commit, no force-push unless your own branch after a rebase). Wait for
required checks at your final head (max ~30 min; fix real failures; rerun the known flake once). Never merge, never dispatch
workflows, never touch production, never change branch protection. Before your final answer: unlink node_modules and remove your
worktrees. Report: /home/user/workspace/ops/reports/<LANE>-113.md (append as you go; end with "## HANDOFF").
Final answer (<400 words): PR number(s), final head SHA(s), CI state at head, per-finding disposition, tests (command + result),
overlaps/conflicts with other open PRs, anything needing an operator/owner decision (with your recommended default).

Owner 16:04 (verbatim): "We absolutely NEED - LITERALLY MOST CRITICAL OF ALL - RECCURING packages and system, for sure - do NOT EVER
compromise down to JUST one time payment as the only path!!!"
Problem: mobile #334 (fix/package-sheet-payment-intent @5b6eb654, Day 1 package sheet -> POST /v1/checkout/payment-intent, native
PaymentSheet) only handles one-time payments. Renewing packages (Package.billing_type=recurring, interval/interval_count, and the
optional second recurring price per /home/user/workspace/ops/TWO_PACKAGE_DESIGN.md) must sell as real Stripe subscriptions. The
GP-BRADLEY $49/mo package is recurring, so this is also the coachless-client revenue path.

Operator design ruling OR-113-1 (binding; owner OR-110-2 "immersion is key": no browser-hosted Stripe pages in the client journey):
recurring packages are sold through the SAME native, TGP-themed Stripe PaymentSheet as one-time packages, not hosted Checkout.
BACKEND (new PR, T4):
 a. New route (e.g. POST /v1/checkout/subscription-intent, or extend payment-intent with a typed mode; pick the cleaner contract and
    justify it) that, for a recurring package, creates the Stripe Subscription ON THE PLATFORM with on_behalf_of = the coach's
    connected account and NO transfer_data / application_fee_percent (this is backend #627's separate-charges-and-transfers mechanism:
    #627 settles every invoice.paid, first invoice and each renewal, via ChargeSettlementService with the actual Stripe fee; reuse its
    helpers, do not fork fee logic), payment_behavior=default_incomplete, payment_settings.save_default_payment_method=on_subscription,
    expand latest_invoice.payment_intent (pinned Stripe-Version is 2024-09-30.acacia; confirm), and returns the PaymentSheet params
    (customer id, ephemeral key, client secret, publishable key, purchase id, subscription id, status). Handle the
    one-time-plus-recurring package shape (first charge today + subscription) per TWO_PACKAGE_DESIGN.md, correctly and tested.
 b. Idempotency: Idempotency-Key per attempt (same key -> same subscription, no duplicate Stripe objects); an existing active/
    trialing subscription to the same package returns a coded 409 (e.g. SUBSCRIPTION_ALREADY_ACTIVE) the app explains; abandoned
    incomplete subscriptions are reused or expired cleanly (no orphan incomplete subs piling up). Entitlement is granted only on
    invoice.paid / payment success webhook (never on client say-so), revoked per existing lifecycle; cancel = cancel_at_period_end
    (access through the paid period, no refund) through a native backend route the app uses (no hosted portal).
 c. POST /v1/checkout/payment-intent must reject a recurring package with a stable coded error (e.g. RECURRING_REQUIRES_SUBSCRIPTION)
    so the one-time path can never silently sell a renewing plan as one charge.
 d. Free ($0) packages and invite-code grants never create Stripe objects. $19.99 minimum rule (#629) respected.
 e. Renewal failures flow into dunning v2 (backend #628, lane S-DUNNING-R5 owns it; coordinate through your report, do not edit #628).
 f. Tests: failing-before tests for every contract point; webhook flows (first invoice paid -> entitlement + settlement; renewal
    invoice.paid -> settlement once; invoice.payment_failed -> dunning hook; customer.subscription.deleted / cancel_at_period_end ->
    access through period end); idempotency/races (double tap, retry after timeout). Stripe test mode: check whether any Stripe TEST key
    is available to CI or this sandbox (workflows, env names; never print secrets). If yes, add a reproducible test-mode script/spec
    proving subscribe -> renewal (test clock) -> cancel -> failed renewal. If not, prove with contract tests against Stripe's
    documented objects and put the exact test-mode verification steps in the PR body as a pre-launch check.
 g. Base: backend #627's branch agent/clinic/s-fee-coach-net (stacked; #627 is about to merge after its B-627-8 fix by lane B-FEE-R7,
    who owns that branch: never push to it; merge its new commits into your branch when they land). Open your PR against that branch
    now (so audits can start) and tell the operator in your report; the operator retargets it to main after #627 merges (then CI runs).
    Migration prefix if you need one: 20270225000000 (yours). Register any new env in ENV_RULES.
MOBILE (extend #334 on its branch fix/package-sheet-payment-intent; you are its only writer):
 h. One shared checkout hook/service used by EVERY purchase entry point (Day 1 package sheet, coach profile / package detail,
    coachless upgrade paths): for recurring packages call the subscription route, present the themed PaymentSheet (same tokens as
    one-time; Apple Pay / Google Pay enabled only when a merchant id is configured; the owner has not provided one yet, so ship it off
    by config, ready to switch on), then wait for the entitlement (bounded backoff polling of the purchase/subscription status, with
    a calm "Confirming your plan" state, never a spinner forever), then the success moment (Apple-level: plan name, price/interval,
    next charge date, what happens next). Cancel in the sheet = no error. Per-cause copy for every failure (offline, card declined,
    authentication failed, SUBSCRIPTION_ALREADY_ACTIVE, RECURRING_REQUIRES_SUBSCRIPTION, package unavailable/price changed, payments not
    configured, unknown -> SupportEmailFallback + short reference). The sheet shows the price with its interval ("$49 per month",
    "renews monthly, cancel anytime") before the user pays. Never log/send secrets to Sentry.
 i. Native "Your plan" management for the client (current plan, next charge date, cancel at period end with a clear confirmation,
    resubscribe) if not already present elsewhere; if another open PR owns that screen (check mobile #322 dunning screens and any
    billing screens), integrate instead of duplicating and note it.
 j. Tests: failing-before tests for recurring routing, PaymentSheet params, entitlement wait (success, timeout copy), per-cause copy,
    cancel. Update #334's body: tier T4, fix round table, and the backend PR link (merge pair: backend PR + #334).
Coordination: B-FEE-R7 owns #627; S-DUNNING-R5 owns #628/#322; S-COACH-3 owns #641/#329/#332. Read their PR diffs for overlap and
keep yours minimal around shared files. Report: /home/user/workspace/ops/reports/B-RECUR-113.md.

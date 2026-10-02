# Lane S-DUNNING round 2 (agent 110) — Claude Opus 5.5 builder (T4, money + access lockout)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then 109's objective /home/user/workspace/ops/lanes/S-DUNNING.md and
report /home/user/workspace/ops/reports/S-DUNNING.md. PRs: backend #628 @ 691528a0, mobile #322 @ 2d77399d (flag off, not yet
audited). Builder: push to these branches only, never merge, never touch Stripe live settings or flags.
Merge current main into each first. Owner rulings to implement:
- 1A (16:30): when a client in dunning updates their card, our code charges the open invoice right away (idempotent) and unlocks
  on success (invoice.paid), with a truthful failure path if the new card also fails.
- 2A (16:30): a client who cancels while in dunning has the unpaid invoice voided and loses access immediately (no Day-10 lock,
  no further collection). Voluntary cancel outside dunning (13:43 option A): access through the paid period, no refund.
- Non-payment: retries Day 0/1/3/7, full access through Day 9, hard lock Day 10; lockout allowlist keeps account deletion,
  data export, support, billing update and the AI-consent routes reachable.
- OR-110-2 (owner 20:32 "stripe pages ... LOOK like TGP native - immersion is key"): the client's update-card flow is NATIVE:
  backend creates a SetupIntent for the client's Stripe customer (respect the existing charge model and where the customer
  lives), mobile collects the card with @stripe/stripe-react-native PaymentSheet themed with TGP design tokens, then backend sets
  the default payment method and (1A) pays the open invoice. Replace Stripe-hosted customer-portal links in client-facing
  dunning surfaces (banner, lockout screen) with this native screen. Dunning emails link to an https://app.trygrowthproject.com
  path that opens that screen as a universal link (add the path to the AASA/assetlinks served by the backend if needed) and
  otherwise shows a calm page telling the client to open the app. Keep the portal code path only if something still needs it,
  and say what.
Tests: fixture end-to-end for 1A/2A/native update, webhook idempotency + replay, concurrent card-update vs retry, Day 0/9/10
boundaries, money in integer minor units. Follow the money: write one worked example per path in the PR body.
Report to /home/user/workspace/ops/reports/S-DUNNING-R2-110.md. Final answer (<400 words): heads, what changed, tests, CI, risks,
the exact Stripe live settings the owner must set (keep reports/S-DUNNING.md's list current), and the flags-workflow patch status
(reports/S-DUNNING-flags-workflow.patch adds FEATURE_DUNNING_V2 to fly-feature-flags-set.yml — prepare it as its own T4 PR).

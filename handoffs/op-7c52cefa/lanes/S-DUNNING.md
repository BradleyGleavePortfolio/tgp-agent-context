# Lane S-DUNNING — make the owner's 10-day non-payment lockout live: audit, test, wire, then flip. Backend + mobile, T4. Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
Owner 13:41: "if its no-pay then it follows my 10 day lockout sequence - go make sure this is wired and in prod, working
as intended!" Owner 13:43: "needs audited and tested, then flipped live!" Owner 13:43: voluntary cancel = access ends at
the end of the period the client already paid for (no refund, no early cut-off).

## Facts (operator 13:45)
- Smart Dunning v2 lives in backend `src/checkout/dunning-v2/` (cadence Day 0/1/3/7 charges, Day-10 hard lockout sweep
  at 02:00 UTC, lockout guard returns 403 `LOCKED_DUNNING`, late-reversal handler, Roman-voice copy, recovery links).
  Gated by `FEATURE_DUNNING_V2` (default OFF). The flag is NOT set in production, so v1 dunning is active today.
- Production schema has the v2 columns (DunningState.locked_out_at, reversal_count; DunningAttempt).
- Mobile has zero references to `LOCKED_DUNNING`: a locked client would see a generic error.

## Deliver
1. Audit the whole v2 path end to end in code and tests and write the findings in your report: trigger (which Stripe
   webhook events open a cycle), retries (who charges on Days 1/3/7: our code or Stripe; prove there is no double
   charging with Stripe's own Smart Retries / subscription retry settings, and state the exact Stripe dashboard setting
   the owner must have), client notices (push/email/in-app with no exclamation marks), coach alerts, Day-10 lockout
   (what is blocked, what stays reachable: billing/update card, data export, account deletion, support), recovery
   (paying unlocks immediately; late reversal), voluntary cancel (cancel_at_period_end -> access through the paid period,
   then off; never routed into dunning), free/comp grants (never enter dunning), idempotency, cron overlap, time zones.
2. Fix every defect found (backend) with tests. Add a deterministic end-to-end test with Stripe fixtures modeled on real
   event payloads covering: fail Day 0 -> retries -> pay on Day 3 (recovered); fail through Day 10 -> locked -> pay ->
   unlocked; voluntary cancel -> access to period end -> off; comp client unaffected.
3. Mobile: handle 403 `LOCKED_DUNNING` everywhere with one calm full-screen state: what happened, amount, "Update
   card" (working path to the Stripe customer portal / update-payment flow), contact coach, and the screens that must
   stay reachable. Pre-lockout in-app banner during Days 0-9. Follow the no-generic-errors rule.
4. Flip plan (do NOT flip): exact env changes for `fly-feature-flags-set.yml`, preconditions (Stripe settings, portal
   live, webhooks subscribed, mobile build containing the lockout screen), post-flip read-only checks (logs, DunningState
   rows), and the rollback (unset flag; behavior returns to v1). The operator flips only after dual audit + owner-visible
   evidence.
Open PRs against main (one backend, one mobile), tier header T4, fix-round tables. Report:
/home/user/workspace/ops/reports/S-DUNNING.md + final answer.

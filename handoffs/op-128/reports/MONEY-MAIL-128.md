# MONEY-MAIL-128 (FIXWAVE-128, agent 128) — payment email replies reach the coach

## Scope traced
FW-MONEY-128 B-2. EmailService.send (src/email/email.service.ts), payment/dunning send sites: dunning-v2 dispatcher (client + coach),
dunning v1 cadence + recovered (src/checkout/dunning.service.ts), guest receipt (src/storefront/checkout-receipt.service.ts), trial ending
(src/packages/trials/trial-notice.service.ts), coach platform billing payment-failed (billing.service.ts), guest checkout recovery
(checkout-recovery.service.ts), payout notice. Templates with "reply" lines.

## B list
- B-2 fixed: payment/dunning emails now set Reply-To = the purchase coach's email (client emails) or SUPPORT_EMAIL (no coach, coach without
  email, lookup failure, platform emails to coaches). Template lines say exactly where a reply goes.

## U list
none.

## C one-liners
- coach-onboarding-welcome.hbs / client-onboarding-welcome.hbs still say "reply" with no Reply-To (left: owner said no other email behaviour changes).
- Guest checkout-recovery reminder (PAYMENT_REMINDER) does not load the coach id, so it replies to support (and says so).

## PRs
- growth-project-backend#857, branch agent128/money-mail-128, head daf0ad193fe60c1fa12223bd904cc156b143c585, +242/-13 = 255 lines, 15 files.
  Local: test/email-reply-to.spec.ts 14/14 pass (one run via heavy.sh). CI: all green at head (build-and-test, CodeQL, banned casts, schema parity, RLS). Verdicts: not waited for (owner 14:08 override).

## Not fixed (needs operator)
none.

## HANDOFF
READY comment posted 15:20 PDT 10-07 (issuecomment-6048027934) at daf0ad193fe60c1fa12223bd904cc156b143c585. Builder finished per owner 14:08
override; no verdicts awaited. Worktree /home/user/workspace/wt/MONEY-MAIL-128-backend (branch agent128/money-mail-128). Review findings go to
the FIX lane: changes live in src/email/email.service.ts (_paymentReplyTo, PAYMENT_REPLY_TEMPLATES), email.types.ts (replyToCoachUserId),
5 caller one-liners, 8 .hbs reply lines, test/email-reply-to.spec.ts. Commits need LEFTHOOK=0.

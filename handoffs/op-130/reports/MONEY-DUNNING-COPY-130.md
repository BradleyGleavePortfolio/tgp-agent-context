# MONEY-DUNNING-COPY-130 — failed-payment push copy (agent 130)

Claude Opus 5.5, T3 money copy, backend. Source: AUD-FIN-MONEY-129 B-2 and U-3. Branch agent130/money-dunning-copy-130,
worktree /home/user/workspace/wt/MONEY-DUNNING-COPY-130-backend. Started 18:17 PDT (times from `TZ=America/Los_Angeles date`).
Owner decision pending (FIX_PLANS decision 1, default yes): the copy is marked locked; the PR body says "Owner decision pending:
merge only after the owner's yes".

## Status
DONE 19:00 PDT. b#871 READY FOR AUDIT at fa38982ea9ef8ba7b796142e869ce03caa838998 (comment 6050633941, 19:00:52), CI green (16 checks,
deploy-readiness-gate skipped as usual), mergeable_state clean, 166 lines. Owner decision pending: merge only after the owner's yes.
m#539 (MONEY-INBOX-130) at 735c4e6a carries the UpdateCard push route line (pushTapRouter.ts:74).

## Scope traced
- Production path (FEATURE_DUNNING_V2 "true" in .github/fly-env-desired-state.json flags; FEATURE_ROMAN_COPY_V2 absent = off):
  Stripe webhook invoice.payment_failed and the hourly v2 sweep -> DunningV2Dispatcher.sendClientPush
  (src/checkout/dunning-v2/dunning-v2.dispatcher.ts:196-235) -> flag off, so DunningV2Renderer.clientPush picks
  DAY0/DAY1/DAY3_PUSH (dunning-v2.copy.ts:58-86 after the change), straight or dry (about 1 in 8) ->
  NotificationsService.pushToUser(client, 'Payment', body, data) (notifications.service.ts:803-839).
- Mobile (main 9b37c5df, read only): the tap handler routes by data.actionScreen (pushNotifications.ts:169-170); an unknown
  screen lands on the notification center (pushTapRouter.ts:254-258); MONEY-INBOX-130 adds the UpdateCard route line. The
  in-app card update (More stack UpdateCard) pays the approved open invoices at once (client-billing.service.ts:42-67, 1A).
- Pinned copies of the same strings: voice-policy.constants.ts LEGACY dunning_day0/1/3 (byte-equal contract,
  voice-policy-lint-contract.spec.ts:105-111) and test/_fixtures/roman-voice-legacy.snapshot.json. Both updated to the new
  straight lines. ROMAN_STEMS unchanged (all stems still present).

## Failing-first (seen in a test, main d6065661, 18:29 PDT)
`npx jest test/dunning-v2-push-truth.spec.ts` on unchanged code: 10 failed, 1 passed (the dispute guard). Received, e.g.:
- Day 0 straight "A small matter, Avery: your payment did not go through. I will try again tomorrow. You need do nothing for now."
- Day 1 straight "... I attempted it again today without success. ..."; Day 1 dry "... the payment and I are not yet on speaking
  terms. A fresh card would help our negotiations."
- Day 3 straight "... Three attempts have not cleared $120.00. ..."; Day 3 dry "... The card ending 4242 and I have tried three times now."
- Every payment-cycle push: data undefined (no route).
After the fix: 11/11 pass (18:34).

## Local checks at the head (one file at a time via heavy.sh, 18:39-18:42)
dunning-v2-copy 28, voice-policy-lint-contract 49, voice-policy-integration 3, src/roman/voice voice-policy.service 84,
test/voice-policy.service 6, dunning-v2-foundation-fixes 44, dunning-v2-e2e-lifecycle 10, dunning-v2-service-fixes 18,
dunning-r3-money-truth-e2e 70, dunning-r2-native-card-1a-2a-e2e 18, dunning-v2-dispute-pause 32: all pass.
check-r75 range OK (no positive token change), vendor-name guard passed, eslint --max-warnings 0 on the 5 changed .ts files clean.

## B list (fixed in b#871)
- B-2 (from the code, now seen in a test): dunning-v2.copy.ts DAY0_PUSH/DAY1_PUSH/DAY3_PUSH promised or counted retries and spoke
  as "I". A client whose card was reported lost, or whose bank asks for 3-D Secure, was told the app would try again and nothing
  was needed, then waited until access locked on Day 10. New lines: what is unpaid, update the card in the app (Day 3: before
  {lockoutDate}); no first person; true for every decline.

## U list (fixed in b#871)
- U-3 (from the code, now seen in a test), backend half: dispatcher.ts:220 (now :223-226) sent the "Payment" push with no data, so a tap opened
  nothing. Payment-cycle pushes now carry { kind: 'dunning_payment', actionScreen: 'UpdateCard' }; dispute pushes carry none.

## C one-liners
- C: lockout_copy (LOCKOUT_SCREEN "did not clear after several attempts", dunning-v2.copy.ts:166) is false for a hard decline,
  but the app never renders lockout_copy (no mobile reader).
- C (edge, deferred to 10k clients): firstName falls back to "there" ("A small matter, there: ...") when the client has no name.

## Proposed (needs operator)
1. ROMAN_V2 dunning_day0/1/3 (src/roman/voice/voice-policy.constants.ts:247-252) make the same retry promise ("I'll try again
   tomorrow", "I tried again today", "Three tries now"), only behind FEATURE_ROMAN_COPY_V2 (off). Smallest fix: copy the new
   straight lines into ROMAN_V2 for those three keys. Default: do it before anyone turns FEATURE_ROMAN_COPY_V2 on; not now.
2. Day 7 dry push "The card ending {cardLast4} has had every chance. Three days until the lights go out." (dunning-v2.copy.ts:115)
   implies retries and jokes on a lockout warning. Default: leave (outside this entry; same owner yes would cover it).
3. Dispute-cycle pushes still carry no data (open nothing). Smallest fix: data { kind: 'dunning_dispute', actionScreen:
   'NotificationCenter' } where the dispute row is. Default: after launch.

## PRs
- b#871 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/871 head fa38982ea9ef8ba7b796142e869ce03caa838998,
  166 lines (tests 124 + fixture 6), CI green, READY posted 19:00. Verdicts: none yet (builder ends after READY, rule 7).

## HANDOFF
- State: b#871 open, READY at fa38982ea9ef8ba7b796142e869ce03caa838998, CI green, no conflict. Branch agent130/money-dunning-copy-130
  (commits 6d937105 fix, fa38982e merge of main 4c3df677). Worktree clean; nothing left only in the sandbox.
- Merge gate: both lenses APPROVE at the head AND the owner's yes on the locked copy (FIX_PLANS decision 1, default yes).
- Review findings or a main conflict go to FIX-OPUS-130 / FIX-SOL-130 (keep this branch; `git merge origin/main`, no rebase,
  LEFTHOOK=0, Bradley Gleave identity).
- Tests to run for any change: test/dunning-v2-push-truth.spec.ts, test/dunning-v2-copy.spec.ts,
  src/roman/voice/__tests__/voice-policy-lint-contract.spec.ts, src/roman/voice/__tests__/voice-policy-integration.spec.ts,
  test/dunning-v2-foundation-fixes.spec.ts. If a copy string changes, LEGACY (voice-policy.constants.ts) and
  test/_fixtures/roman-voice-legacy.snapshot.json must stay byte-equal to the straight lines.
- After merge: the backend deploy carries the new copy and push data; the tap opens UpdateCard only in an app build that has m#539.
- Needs operator: 3 (Proposed 1-3 above, each with a default); plus the owner's yes.

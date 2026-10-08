# MONEY-INBOX-130 — money inbox rows (agent 130, builder, Claude Opus 5.5, T2 mobile)

Status: DONE 18:48 PDT 10-07. m#539 READY FOR AUDIT at 735c4e6a (CI green, mergeable).
Worktree: /home/user/workspace/wt/MONEY-INBOX-130-mobile, branch agent130/money-inbox-130 (cut from mobile main 028f2926, merged
origin/main 9b37c5df at 18:38).
Source: FIX_PLANS_130_131.md entry 3 (MONEY-INBOX-130); reports/AUD-FIN-MONEY-129.md B-1, U-1, U-2 and the mobile half of U-3;
JOBS130.md recon row ("normalizeNotification at notificationsApi.ts:310; pushTapRouter.ts has no UpdateCard route yet. iOS build PR.").

## PRs
| PR | head | lines | CI | READY | verdicts |
|---|---|---:|---|---|---|
| m#539 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/539 | 735c4e6acabd6d7b53e6a64cbc0ad000bdfa7e2e | 313 (+310/-3) | green (Typecheck, lint, test run 37714060410; CodeQL) | posted 18:47 (issuecomment-6050492675) | none yet (builder does not wait) |
PR body: /home/user/workspace/ops/reports/MONEY-INBOX-130-pr-body.md. READY text: /home/user/workspace/ops/reports/MONEY-INBOX-130-ready-comment.md.

## Scope traced (backend 272dc8ef = production deploy 28, mobile 028f2926 / 9b37c5df)
- drip_released rows: drip-dispatcher.cron.ts:490-543 and package-push.service.ts:691-718 write payload.client_purchase_id, no
  payload.title. Mobile before: inboxScreenForKind -> 'Deliverables' with no params (notificationsApi.ts:302); DeliverablesScreen with no
  purchaseId renders "No content listed" (DeliverablesScreen.tsx:246, :255-257, :186-188).
- dunning_blocker rows, two writers: dunning-v2.dispatcher.ts:298-311 (Day 3 / Day 7 / dispute blocker: payload.headline, primaryCta,
  deep link tgp://billing/update) and refund-dispute-handler.service.ts:517-524 (full-refund notice: payload.event 'full_refund_paused',
  no headline, no deep link). Mobile before: no actionScreen, title "Update". Dismissals (read_at) at dunning-v2.service.ts:1050-1057,
  :1726-1733, client-billing.service.ts:1840-1847.
- trial_ending rows: trial-notice.service.ts:434-452, no payload.title (push title "Your free trial", trial-copy.ts:106-121).
  Destination (payload.actionScreen 'ClientPackages' -> notification center) is FW-NOTIF U5, owned by CF-NOTIF-FG-131: not touched.
- coach_new_purchase rows (coach inbox): purchase-fanout.service.ts:694-714, no payload.title (push title "New purchase",
  lock-screen-copy.ts:108-111). Included: the entry's bug line is "Every money notification is titled 'Update'".
- Push "Payment" from dunning-v2.dispatcher.ts:220 has no data (backend half = MONEY-DUNNING-COPY-130); the mobile half is the
  CLIENT_PUSH_ROUTES UpdateCard line (pushTapRouter.ts:74).
- GET /notifications returns full rows incl. payload (notifications.service.ts:624-668).

## What the PR does
- notificationsApi.ts defaultTitleFor: drip_released "New content", trial_ending "Your free trial", dunning_blocker "Payment",
  coach_new_purchase "New purchase" (each = the backend push title for the same event).
- normalizeNotification: a dunning_blocker with payload.headline is titled with the headline and opens 'UpdateCard'; the full-refund
  notice (no headline) keeps no destination (the card screen's "Add a card" is nothing a refunded client needs). drip_released opening
  Deliverables gets actionParams { purchaseId: payload.client_purchase_id }; params a row carries itself still win.
- pushTapRouter.ts: `UpdateCard: () => ({ root: 'MoreTab', screen: 'UpdateCard', initial: false })` (More index kept beneath).
- README src/screens/notifications/README.md: routing rows, titles line, router bullet, test row.
- New test src/__tests__/moneyInboxRows.test.tsx (7 tests; real normalizer, router, NotificationCenterScreen, DeliverablesScreen).

## Evidence
- Failing-first on main 028f2926: 6 of 7 fail: /home/user/workspace/ops/reports/MONEY-INBOX-130-failing-first-main-028f2926.txt
  (titles "Update"; actionParams undefined; blocker no actionScreen; UpdateCard push -> Home/NotificationCenter; Deliverables renders
  "No content listed"). The 7th (coach never sent to the card screen) is a guard, passes before and after.
- With the fix: 7/7 (/home/user/workspace/ops/reports/MONEY-INBOX-130-pass-fixed.txt), again 7/7 after merging main 9b37c5df.
- Existing suites unchanged: notificationsNormalize.test.ts 5/5, pushTapRouter.test.ts 33/33.
- eslint on the 3 code files: clean. Narrow tsc (touched files + their import graph, /tmp/mi130/tsconfig.json): exit 0.

## B list
- B-1 (seen in a test): "New content unlocked" opened "No content is listed for this purchase." Fixed in m#539.

## U list
- U-1 (seen in a test): Day 3 / Day 7 blocker never showed (titled "Update", tap only marked read). Fixed in m#539 (row shows the
  headline, opens UpdateCard; the dispute blocker too).
- U-2 (seen in a test): every money row titled "Update". Fixed in m#539.
- U-3 mobile half (seen in a test): an UpdateCard push or row landed on the Notification center. Fixed in m#539. Backend half open
  (MONEY-DUNNING-COPY-130).

## C one-liners
- C: a read blocker row stays in history with its headline after payment; it opens the card screen in its ordinary state.
- C (edge, deferred to 10k clients): a drip row without client_purchase_id (none written today) still opens an empty Deliverables.
- C: first_payment rows (coach, FEATURE_ROMAN_FIRST_PAYMENT off) still fall back to "Update".

## Proposed (needs operator)
1. U (from the code, pre-existing, outside this entry's one line): client push routes Deliverables, Membership and Timeline
   (pushTapRouter.ts:70, :72, :73) lack `initial: false`. A client who taps "New content" before opening the You tab in that session gets
   a More stack of only [Deliverables] (useNavigationBuilder getStateFromParams); the You tab then shows Deliverables and its Back goes to
   Home, so the You index (Settings, Membership, sign out) is not reachable from the tab until the app restarts (the RootNavigator
   openUpdateCard banner/lockout path at RootNavigator.tsx:324-327 has the same shape). Smallest fix: add `initial: false` to
   those three resolvers. Default: fold into CF-NOTIF-FG-131 (owns pushTapRouter.ts), or a one-line follow-up by FIX-OPUS-130.
2. U (from the code): coach_new_purchase rows (coach inbox) open nothing; deep link tgp://coach/purchases/:id. Default: C for launch.

## HANDOFF
- m#539 (growth-project-mobile, branch agent130/money-inbox-130) is READY FOR AUDIT at 735c4e6acabd6d7b53e6a64cbc0ad000bdfa7e2e: CI green,
  mergeable, 313 changed lines. iOS build PR: lenses should review it among the first four (_COMMON_130 item 10).
- Nothing left unpushed: the worktree is clean at 735c4e6a (shared node_modules symlink is git-ignored). /tmp/mi130/tsconfig.json was a
  throwaway narrow type-check config, not in the repo.
- Review findings or a conflict at this head go to FIX-OPUS-130 (money surface). Re-run: `cd <worktree> &&
  /home/user/workspace/ops/heavy.sh npx jest src/__tests__/moneyInboxRows.test.tsx` (7/7), plus
  src/services/__tests__/notificationsNormalize.test.ts (5/5) and src/services/__tests__/pushTapRouter.test.ts (33/33).
- Coordination: CF-NOTIF-FG-131 owns the rest of pushTapRouter.ts; this PR added only line 74 (UpdateCard). If CF-NOTIF-FG-131 adds a
  route right after Deliverables too, a one-line merge conflict is expected; keep both lines.
- Backend half of U-3 (push data { kind, actionScreen: 'UpdateCard' } at dunning-v2.dispatcher.ts:220) is MONEY-DUNNING-COPY-130; no
  mobile change is needed when it lands.
- Decisions taken (each tested): the full-refund dunning_blocker notice keeps no destination; coach_new_purchase got its title
  ("New purchase") as a money row; trial_ending only got its title (destination left to CF-NOTIF-FG-131).
- Needs operator: the two items under "Proposed (needs operator)" above (defaults given).

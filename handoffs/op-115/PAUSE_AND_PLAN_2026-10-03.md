# Pause and plan — 2026-10-03, 11:58 PDT (operator agent 115)

All 19 agents have stopped. Nothing is half-done: every PR is pushed, and its state and next step are written in its lane report
(ops/reports/*-115.md, copied to handoffs/op-115/). Nothing was cancelled or descoped.

## Landed today

| PR | What | State |
|---|---|---|
| backend #640 | Coach programs delivery | Merged, deployed, checked in production |
| backend #609 | Coach welcome message, workout reminders | Merged, deployed, checked in production (with #647) |
| backend #647 | Booking reminder times in the recipient's time zone | Merged, deployed, checked in production |
| mobile #326 | AI consent error handling | Merged |
| mobile #305 | Over-the-air updates | Merged |

## Where everything else stands (32 open PRs)

### A. Approved by both reviewers; one cheap step from merge (11)
The only step left is a branch update, then two short checks from the reviewers.
- backend #642 (Google sign-in flag), #652 (community voice delete), #664 (multer security bump)
- mobile #312 (workout reminders; needs #609 deployed), #328 (Programs tab), #335 (reachability map; also take the small copy fix C-335-4)
- Pairs that merge together with their backend partner: mobile #315 with backend #611 (privacy), #321 with #627 (payouts), #322 with
  #628 (dunning), #338 with #656 (trials)
- mobile #325 (scheduling): app.json conflict after #305; merge after backend #634 merges and deploys

### B. Pushed and green; waiting for review (11)
- backend #611 privacy policy (App Store blocker; owner answers applied), #627 payouts, #628 dunning, #641 coach Money,
  #648 device push, #654 recurring subscriptions (Opus approved, Sol owed), #656 free trials
- mobile #329 coach setup wizard, #332 Money page, #334 renewing plans, #340 CSV export

### C. Needs builder work first (10)
- backend #634 scheduling: conflict with main after #647 (approved otherwise)
- mobile #317 Apple Health: the branch update broke two Health Connect test expectations after #305 (approved otherwise)
- backend #661: one finding (a late card decline can mark a paid retry as failed)
- mobile #339 copy sweep: one finding (copy claims outcomes the app cannot know)
- mobile #341 notification preferences: overlapping saves race, plus copy
- mobile #331 Roman conversations: fix pushed, one more commit saved as a patch
- backend #651 Roman live chat split: piece A #665 is 4,113 lines and must be cut under 3,000 before review; piece B #666 is ready to
  review after A; piece C is a branch with tests and no fix yet
- backend #653 booking auto-expiry: not started this wave

## How to resume (cheapest order first; follows MERGE_DEPENDENCY_GUIDE.md)

1. Land group A (about 11 merges). Agents: a merge crew of 1 builder (the #634 conflict, the #317 tests, the #325 app.json
   conflict) plus 1 Opus and 1 Sol reviewer for the short checks. The operator merges one PR at a time in this order: #642, #652,
   #664, deploy; mobile #312, #328, #335; #634, deploy, #325; then #317.
2. Review group B. Start with #611 + #315, because the privacy policy blocks App Store submission. Then the recurring packages chain
   (#627 + #321, #654 + #334, #656 + #338: the owner's top priority), then #628 + #322, #641 → #332 → #329 → #340, and #648. Add 1–2
   builders only when findings come back.
3. Group C plus follow-ups. #661, #339, #341, #331, the Roman split (#665 under 3,000 lines first), #653, and three small
   items: a follow-up for C-627-10 (payout retry delay), a CI memory fix (jest ran out of memory on main and on #654), and the size
   rule in the backend dangerfile.

Each step is a separate go/no-go for the owner, so credit spend stays visible.

## What only the owner can do

1. Supabase Pro yes/no. Production is on the Free plan with no restorable backups.
2. Stripe Dashboard: add the events `setup_intent.succeeded` and `customer.subscription.trial_will_end` to the platform webhook
   before #654/#656 deploy.
3. The FCM V1 key for Android push.
4. Apple Sign-in keys: the server's Apple audience check still fails.
5. The server's PostHog key is only 8–15 characters long; a real PostHog project key is much longer. Check that it is the right key.
6. Later: approve one EAS production build (spend), sign up as a coach on that build, and check on a device that deletion works,
   including deleting a Google-only account after #642.

## Timeline, honestly
App Store live on 10-06 is no longer realistic. The submission path is: group A merges, then #611 + #315 published, the recurring
packages chain approved and deployed, an EAS build (owner spend), and Apple review.

## Update 2026-10-03 18:47 PDT
- Owner decided 18:42: the clinic binary ships Health Connect on day 1. #364 updated (78ee52c0). Remaining owner actions for it: Google
  Play Console Data safety, Health apps declaration and Health Connect data-type declaration; the clinic Android build (spend).
- Current queue with full heads: handoffs/op-115/LIVE_QUEUE.md. Launch critical path: HANDOFF_AGENT_116.md section 0.1.


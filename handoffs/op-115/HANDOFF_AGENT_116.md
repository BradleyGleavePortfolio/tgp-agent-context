# TGP Operator Handoff — Agent 116

Prepared by operator agent 115 on 2026-10-03 (started 12:12 PDT; times from `date`, PDT = UTC−7). This document assumes you
remember nothing. Read it top to bottom once, then use the file map in section 11. You are agent **116**; agent 115 wrote this.

## 0. The 60-second version

- You are the operator (orchestrator) for The Growth Project (TGP). You grade, decide, route, merge, deploy and record. Builders
  write product code; you do not. One owner-directed exception: on 2026-10-03 12:12 the owner told agent 115 to split oversized PRs
  itself (section 12). Re-packaging existing code into smaller PRs is that exception, not a license to author features.
- Agent count is 0. STOP-AND-DRAIN is in force: launch no agents and never re-task a finished one until the owner says exactly
  "SCALE 2" or explicitly bumps the count. The owner also paused the fleet on credits at 11:25 10-03: "i need the in flight agents to
  just finish the next pr in their chan and STOP we are at 32k/45k credits used today - we need to get to a safe spot to pause and plan".
- Production backend = `d23fa31773f2e7f14781d243db35067d949f421a` (backend main; #609 + #647 deployed 11:57 PDT 10-03, verified).
  Mobile main = `367e6c48dac676151400d4d4b9959c4cc3c7586a`.
- 32 wave PRs are open: 11 approved by both lenses and only need a branch update plus two short merge-only verdicts; 11 pushed and
  green waiting for review; 10 need builder work first (section 4). Nothing is mergeable without at least one new verdict.
- New hard rules from 10-03 (section 1.2): any PR over 3,000 changed lines is an automatic fail; 1,500+ needs a written keep-or-split
  assessment; a builder works at most 3 related PRs in sequence; read MERGE_DEPENDENCY_GUIDE.md before planning a wave.
- App Store live on 10-06 is no longer realistic. Submission path: land group A, publish #611 + #315 (privacy), land the recurring
  packages chain, one EAS production build (owner spend), Apple review.
- Your first message to the owner is a short readback (section 1.4), then wait for his go on a resume step (section 5).

## 1. Who you are and the rules you live by

### 1.1 Documents and their weight

| Document | Where | Weight |
|---|---|---|
| Agent Rules (G01–G22) | `AGENT_RULES.md` (tgp-agent-context) and the owner's TGP-Agent-Rules.docx | The law. Above everything. G21 now carries the PR size rule. |
| Autonomous Executive Operator Doctrine | owner's TGP_EXECUTE docx | Your mentality: act; escalate decisions, not chores. |
| T0–T4 model routing | `MODEL_ROUTING.md` and the owner's routing docx | How PRs are graded, built and audited. Section 8.2 = PR size gate (new). |
| Operator standing orders | `OPERATOR_STANDING_ORDERS.md` | Owner orders that outlive any session (new 10-03). Read before your first move. |
| Merge dependency guide | `MERGE_DEPENDENCY_GUIDE.md` | Why approved work got redone on 10-03 and the 10 rules that prevent it (new). |
| This handoff | `handoffs/op-115/HANDOFF_AGENT_116.md` | Current truth as of its last commit. |
| Pause and plan | `handoffs/op-115/PAUSE_AND_PLAN_2026-10-03.md` | The owner-facing status and resume plan. |
| Lane reports | `handoffs/op-115/reports/*-115.md` | Each lane's exact final state, evidence links and HANDOFF section. |
| LAST_OPERATOR_STATE.md | repo root | Running log; agent 115 sections are near the top. |
| DECISION_LOG.md | repo root | Owner decisions with verbatim quotes; newest at the bottom. |

### 1.2 Standing owner rules (verbatim where it matters)

- "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH -
  SMOOTH IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES".
- "I WANT A PRISTINE USER EXPERIENCE, AMAZING AHA MOMENTS, AND APPLE LEVEL UI SIMPLICITY AND SCREEN FLOWS".
- Recurring packages are "LITERALLY MOST CRITICAL OF ALL"; never sell one-time-only.
- Spend no money without his word: no EAS builds, no paid plans, no paid CI. 10-03 10:52: "if the anwser is to pay to go faster, lets
  just let everything run its course."
- "dont cancel shit!" (10-03 11:18): never cancel agents or descope work to save credits; drive work to a clean stop instead.
- PR size (10-03 11:02 and 11:26): "anything over 1500 lines becomes a liability one day and a slow-down" and "any PR over 3k LOC is
  jsut an automatic fail - its a huge waste of credits and extends wasted rounds". Counting: additions + deletions; lockfiles,
  generated files and snapshots excluded; tests count. Over 3,000: no audit, lens posts REQUEST CHANGES "SIZE FAIL", builder splits.
  1,500–3,000: operator posts a SIZE ASSESSMENT (KEEP or SPLIT with reason) at the first READY FOR AUDIT. PRs open on 10-03 were
  grandfathered, but the owner then ordered them split one by one (section 12).
- Merge dependencies (10-03 11:34): follow MERGE_DEPENDENCY_GUIDE.md.
- Credits: the owner watches a daily budget (about 45k credits/day). Keep the fleet small, end agents the moment their PR is
  approved, poll sparingly, and reach a safe pause point before the budget runs out.
- Never write the clinic partner's name or the coach welcome text into any repo, PR, commit or state file. tgp-agent-context is
  PUBLIC. Say "the clinic partner".
- Copy: no emojis, no exclamation marks, no generic errors, no first person ("we", "our", "write to us").
- Every message to the owner ends with "Your next step: …" or "Nothing needed from you." Escalate decisions, not chores.
- Branch-protection changes need his exact words.
- T4 work: Claude Opus 5.5 builders; then two lenses (Claude Opus 5.5 and GPT-6.1 Sol) at the exact head. A new head needs new
  verdicts, including a pure merge of main ("merge-only delta": short check that the delta is only main's commits).
- Commit identity: `git -c user.name="TGP Agent 116" -c user.email="agent@tgp.invalid"` (identity is not a gate; DECISION_LOG 09-28).

### 1.3 Authority carried to you

- Merge: only audited exact heads, all required checks green, branch current with main:
  `gh pr merge N --merge --match-head-commit <full sha>` (the flag needs the FULL 40-character sha).
- Standing deploy approval (owner 10-01 20:32, 10-02 12:10–12:11): audited main with main CI green → deploy → verify. You approve the
  GitHub "production" environment on fly-deploy runs (section 9.3).
- Mechanical update-branch on a PR is yours; the new head then needs new verdicts from both lenses.
- Read-only production checks are yours: /health, /readyz, Supabase read-only SQL, fly-env-truth workflow.
- Not yours: branch protection, spending money, EAS builds, Stripe or Apple account settings, Fly secrets, publishing the privacy
  policy before #611 is dual APPROVE.

### 1.4 Your first move

1. Pull tgp-agent-context. Read this file, OPERATOR_STANDING_ORDERS.md, MERGE_DEPENDENCY_GUIDE.md, the agent 115 sections of
   LAST_OPERATOR_STATE.md, and section 12 (split program progress) carefully.
2. Verify on GitHub that the heads in section 4 still match (`gh pr view N --json headRefOid`). Anything moved means someone acted;
   find out who before touching it. Verify production: `curl https://backend-spring-lake-3890.fly.dev/health` and `/readyz`.
3. Send the owner a short readback: rules in force (drain, size rules, no spend), what is live, the three resume steps, the owner
   actions (section 6.1). End with "Your next step: …".

## 2. What happened on 10-03 (agent 115)

- 10:15 owner "SCALE 2 + EXECUTE": launch 16, then drain. 10:19–10:23 launched 9 builders + 7 lenses. 10:27 owner "use github CI
  lanes for speed" → CI lane workflows (one-job targeted jest on ci/** and audit/** branches). 10:45 owner added 3 lenses (19 total).
- 10:49 CI saturation: account capped at 20 concurrent jobs; ~50 queued. Built ops/ci_janitor.sh (cancels runs for superseded heads).
  Owner 10:52: stop-and-drain stays; no paid speed-ups.
- Merges: backend #640 (programs), #609 (welcome message, reminders), #647 (reminder time zones); mobile #326 (AI consent errors),
  #305 (OTA updates). Deploys: d27cd3ec (#640) at ~11:17, d23fa317 (#609 + #647) at 11:57, both verified.
- 11:02 PR size doctrine → MODEL_ROUTING 8.2, AGENT_RULES G21, OPERATOR_STANDING_ORDERS. 11:14 owner answered the #611 privacy
  questions (routed as O-611-1..6). 11:17–11:18 finish mode ("dont cancel shit!"). 11:25 PAUSE. 11:26 3,000-line hard limit.
  11:34 merge dependency guide. 11:3x–11:58 all 19 agents ended cleanly with reports.
- 12:12 owner: write this handoff, then split the monolithic PRs one by one, sequentially, updating GitHub docs as it goes.

## 3. Progress and rulings

### 3.1 Merged and deployed (agent 115)

| PR | What | Merge commit | Production |
|---|---|---|---|
| backend #640 | MWB program delivery (coach Programs) | d27cd3ec | deployed run 37142275262; migration 20270223000000 applied |
| backend #609 | Coach welcome message + workout reminders | 0d33c4d4 | deployed run 37145909812; migration 20270213000000 applied |
| backend #647 | Booking reminder local time, one delivery | d23fa317 | same deploy; migration 20270301000000 applied (0 rows backfilled) |
| mobile #326 | AI consent error mapping | 47124a4d | ships with the next mobile build |
| mobile #305 | expo-updates OTA (fingerprint runtime) | 367e6c48 | ships with the next mobile build |

### 3.2 Operator rulings by agent 115 (binding until changed)

- OR-115-1 (#651 C-651-5): neutral `roman.safety_route` action plus a restricted reason code; no crisis words in logs.
- OR-115-2: keep crisis templates without box-2 consent.
- OR-115-3: #603 carry-overs go in a separate T4 PR (not opened yet).
- OR-115-4: mobile copy sweep PR with a voice guard test (= mobile #339).
- OR-115-5: whichever of #305/#317 merges second fixes the OTA doc line (#305 carried it; merged).
- OR-115-6: PR size rule for new PRs (superseded by the owner's 1,500 / 3,000 rules).
- #611 owner answers (11:14), applied as O-611-1..6 in FIX ROUND 7: deletion paragraph approved and deletion startable in-app or by
  email; no Anthropic zero-retention agreement (30-day sentence); Mux is live (listed); backups plan-agnostic (prod is Supabase Free);
  Stripe redaction, Sentry 90 days, Resend 30 days, PostHog analytics on and session recording off; de-identified aggregate retention
  after deletion with a public no-re-identification commitment (Washington RCW 19.373.010). Owner's wish: keep as much data as is
  lawful; identifiable health data must still be deleted on request (45 days; backups within six months).
- #325: stays draft until #634 merges AND deploys; app.json conflict resolution keeps both hunks.
- #335: fold Opus C-335-4 into its refresh round.
- CoachEarnings: OR-113-13 default stands (hide the Settings row if #332 misses release).
- C-627-10: follow-up PR after #627 merges (needs a nullable column). C-661-3 and C-656-1: whichever of the pair merges second carries
  the combined behaviour.

### 3.3 Governance changed on 10-03 (all in tgp-agent-context)

MODEL_ROUTING.md 8.2 (size gate + hard limit); AGENT_RULES.md G21 pointer; OPERATOR_STANDING_ORDERS.md (new); MERGE_DEPENDENCY_GUIDE.md
(new); DECISION_LOG.md entries 10-03 11:02, 11:26, 11:34.

## 4. Open wave PR board (verdicts at the CURRENT head only; snapshot 12:15 PDT 10-03)

Repos: `BradleyGleavePortfolio/growth-project-backend` and `BradleyGleavePortfolio/growth-project-mobile`. "BEHIND" = needs
update-branch; "DIRTY" = conflict. Re-verify every head before acting.

### A. Approved by both lenses; branch update + merge-only deltas, then merge

| PR | Head (full) | Base | Size | Verdicts at head | Next step | Lane report |
|---|---|---|---|---|---|---|
| backend #642: chore(flags): GOOGLE_CLIENT_IDS -> github-secret, Google sign-in on da | `4fee3c0236eaa793f847a89e9393160b9f12a41c` | `main` | +74/-1 | dual APPROVE @4fee3c02 | BEHIND: update-branch, two merge-only deltas, merge, run the flag sync; owner then creates and deletes a Google-only account in the app. | handoffs/op-115/reports/B-DUNNING-7-115.md |
| backend #652: fix(community): atomic author voice delete, server-only coach lookup,  | `1d43c9d9b95ad14b1f70bd43f95248ce92ea63ff` | `main` | +777/-75 | dual APPROVE @1d43c9d9 | BEHIND: update-branch, merge-only deltas, merge. | handoffs/op-115/reports/AUD-OPUS-CORE-115.md |
| backend #664: fix(deps): bump multer 2.3.0 -> 2.4.0 (GHSA-3pph-fpjx-jg34) | `3e97686116ceb64a975cc209080df2d03ce81aab` | `main` | +18/-35 | dual APPROVE @3e976861 | BEHIND: update-branch, merge-only deltas, merge (security bump). Known flake C-664-1 (provider-wiring spec). | handoffs/op-115/reports/AUD-OPUS-CORE-115.md |
| mobile #312: feat(notifications): C05 item 7 workout reminders toggle in Settings > | `f8375ca66bf11b2cbb721619c90ab10ff885090e` | `main` | +1068/-36 | dual APPROVE @f8375ca6 | BEHIND (no conflict). #609 is now deployed, so: update-branch, merge-only deltas, merge. | handoffs/op-115/reports/B-NOTIF-6-115.md |
| mobile #315: fix(trust-center): open the real privacy policy, link the consumer hea | `8fff3f8f3829aab4079973b38428e2d266bc3f3b` | `main` | +1485/-36 | dual APPROVE @8fff3f8f | BEHIND. Merge together with backend #611 once #611 is dual APPROVE. | handoffs/op-115/reports/B-MOB-A-115.md |
| mobile #321: feat(packages): editor shows the $19.99 minimum or free rule inline (S | `4f5b058d2ec6d22c468eaef0d3db3238978d9465` | `main` | +1736/-111 | dual APPROVE @4f5b058d | BEHIND. Merges with backend #627. | handoffs/op-115/reports/B-FEE-9-115.md |
| mobile #322: feat(dunning): payment lockout + Days 0-9 banner + native Update card  | `23435ec2c099aa5e25c8c0737d92662b73c83855` | `main` | +4573/-50 | dual APPROVE @23435ec2 | BEHIND. Merges with backend #628. C-334-2 interplay with #334. | handoffs/op-115/reports/B-DUNNING-7-115.md |
| mobile #325 (draft): S-SCHED: native Calendar, coach controls, welcome call and lifecycle c | `7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8` | `main` | +5393/-606 | dual APPROVE @7566d38f (draft) | DIRTY: app.json conflict after #305 (keep both hunks, OR-115-5). Stays draft until backend #634 merges AND deploys. | handoffs/op-115/reports/B-MOB-B-115.md |
| mobile #328: feat(programs): coach Programs tab - build once, assign to many, add t | `fb76721fa21476cf36595fcd861a6b5a07630516` | `main` | +6947/-14 | dual APPROVE @fb76721f | BEHIND after #305. Backend #640 is deployed. Update-branch, merge-only deltas, merge. | handoffs/op-115/reports/AUD-OPUS-MOB-PAY-115.md |
| mobile #335: feat(reach): reachability map, wire working screens, coach consultatio | `641fe8914853cca6a2dab76ac90230bbcd525504` | `main` | +2243/-14 | dual APPROVE @641fe891 | BEHIND. Fold Opus C-335-4 (copy must be true when a coach lost access) into the refresh round, then merge-only deltas. | handoffs/op-115/reports/B-MOB-B-115.md |
| mobile #338: feat(packages): coach sets a free trial of 0 to 30 days on renewing pa | `48b5e6b5434fc5db207dcb14d97e5208a3d4b16f` | `main` | +554/-27 | dual APPROVE @48b5e6b5 | BEHIND. Merge together with backend #656, after #656 deploys. | handoffs/op-115/reports/B-TRIALS-3-115.md |

### B. Pushed and green; waiting for review

| PR | Head (full) | Base | Size | Verdicts at head | Next step | Lane report |
|---|---|---|---|---|---|---|
| backend #611: feat(public-pages): accurate privacy policy, consumer health data priv | `5eac8f21bb70460da7dea7be5ce9f84f40870afb` | `main` | +2057/-240 | none at 5eac8f21 (prior dual APPROVE was at 1af96efa) | Opus + Sol audit FIX ROUND 7 (owner answers O-611-1..6). Then update-branch #611 and #315 and merge them together; that publishes the policy. App Store blocker. | handoffs/op-115/reports/B-MOB-A-115.md |
| backend #627 (SPLIT into #681 -> #686; see section 12): fix(billing): coach payout = price - actual Stripe fee - 2% (S-FEE) | `66162285882d75d7619542c9aa581da5cc93145d` | `main` | +13626/-1220 | none at 66162285 (Opus APPROVE and Sol RC 0/1/0 were at 3a5338d7) | Opus + Sol audit FIX ROUND 10 (B-627-10 fixed, main 0d33c4d4 merged). Merge with mobile #321. Follow-up PR for C-627-10 after merge. | handoffs/op-115/reports/B-FEE-9-115.md |
| backend #628 (SPLIT into #687 -> #691; see section 12): fix(dunning-v2): live-ready 10-day lockout + native card update, 1A pa | `dc47e0efe2270e21a00ab8d038a9e7dbb415efe9` | `main` | +11352/-982 | none at dc47e0ef | Opus + Sol audit FIX ROUND 8 (B-628-11, B-628-13, C-628-14/15). Merge with mobile #322. | handoffs/op-115/reports/B-DUNNING-7-115.md |
| backend #641 (SPLIT into #674 -> #676 -> #677 + #675; see section 12): feat(money): coach Money read model, truthful Connect status + refresh | `f60ed603c4d2e8bb97b6dbd12408a975a0d2590a` | `main` | +6671/-67 | none at f60ed603 (Sol RC 0/4/1 and Opus RC 0/1/1 were at 02cd3f88) | Opus + Sol audit FIX ROUND 5. Migration 20270314000000 (4 nullable columns + unique index on ChargeRefund). Then deploy, merge #332 into #329's branch, ship #329, retarget #340. | handoffs/op-115/reports/B-COACH-5-115.md |
| backend #648 (SPLIT into #692 -> #693; see section 12): feat(notifications): deliver inbox notifications to devices via Expo p | `22de1182c3caef1f6e7da8550d74eaf66fb51344` | `main` | +3081/-116 | none at 22de1182 (Sol RC 0/1/0 was at ab607b34) | Opus + Sol audit FIX ROUND 4. Migration 20270307000000 was edited in place; confirm it is not in prod _prisma_migrations before deploy. | handoffs/op-115/reports/B-NOTIF-6-115.md |
| backend #654 (SPLIT into #678 -> #679 -> #680; see section 12): feat(checkout): native Stripe subscriptions and free trials through th | `02c48de710f9f69bfc985336eb14249663bbb638` | `agent/clinic/s-fee-coach-net` | +6064/-26 | Opus APPROVE 0/0/3 @02c48de7; Sol draft RC 0/3/0 unposted | Builder round on the Sol draft findings (resend after Stripe 24h key window makes a second subscription; error label; failed cancel marks payable attempt expired), then Sol. Stacked on #627: retarget to main after #627 merges (4 main-only checks then run). Owner adds setup_intent.succeeded webhook event before deploy. | handoffs/op-115/reports/B-RECUR-3-115.md |
| backend #656 (SPLIT into #671 -> #672 -> #673; see section 12): feat(packages): real free trials on recurring packages, one per client | `86223987ec94511f2a146b62d99f87ed1b2758a8` | `main` | +5601/-10 | none at 86223987 (Sol RC 0/4/1 at b9939d02) | Sol re-audit + first full Opus audit of FIX ROUND 5. Merge with mobile #338, deploy before coaches set trials. Owner adds customer.subscription.trial_will_end webhook event. | handoffs/op-115/reports/B-TRIALS-3-115.md |
| mobile #329 (SPLIT into #345 -> #347; see section 12): feat(coach): setup wizard with Stripe Express onboarding, first packag | `fc7fe73f81613b4d006b144fb5c4d9b80d5c1908` | `main` | +6108/-284 | Sol BLOCK 1/1/0 @fc7fe73f; Opus BLOCK earlier | FIX ROUND 5 READY (B-329-1, C-329-8). A-329-1 stays open until #332 merges into #329's branch. | handoffs/op-115/reports/B-COACH-5-115.md |
| mobile #332: feat(money): coach Money page and Home Money card, retire Earnings and | `90701485330ef94863ee1220463261433989f1fe` | `agent/clinic/s-coach-wizard` | +5626/-1877 | none at 90701485 (Opus RC 0/4/7 at 6c193c80) | FIX ROUND 3 posted (operator posted the builder's draft). Opus + Sol audit. Stacked into #329's branch. | handoffs/op-115/reports/B-COACH-5-115.md |
| mobile #334 (SPLIT into #342 -> #344; see section 12): feat(payments): renewing plans and one-time packages through one nativ | `d466fd1522182f040c9b341e51947e57b62cdca8` | `main` | +5688/-514 | Sol APPROVE @78ba9bc9 (before C-334-3); Opus not this round | FIX ROUND 4 note posted. Opus + Sol audit at d466fd15. Pairs with backend #654. | handoffs/op-115/reports/B-RECUR-3-115.md |
| mobile #340: feat(money): export the tax CSV as a real .csv file attachment (OR-114 | `2e77dcb6171478a8e4acf5e7937d96a346220549` | `agent/clinic/s-coach-money-mob` | +645/-55 | none at 2e77dcb6 (Sol RC at 858c40f2) | FIX ROUND 1 posted. Opus + Sol audit. Stacked on #332: retarget after #332 lands. | handoffs/op-115/reports/B-COACH-5-115.md |

### C. Builder work needed first

| PR | Head (full) | Base | Size | Verdicts at head | Next step | Lane report |
|---|---|---|---|---|---|---|
| backend #634: feat(scheduling): S-SCHED-2 authoritative booking lifecycle, no double | `e18e8055454b04856d2c5ab5568d0a7127b74939` | `main` | +9378/-1286 | Opus APPROVE merge-only @e18e8055; Sol APPROVE @3d989702; Sol merge-only drafted, not posted | DIRTY: conflict with main after #647 (booking.emitter.ts also touched by #648). Builder merges main, then both lenses do merge-only deltas. Merge, deploy, then mobile #325. | handoffs/op-115/reports/B-SCHED-ROMAN-115.md |
| backend #651: feat(roman): data-aware live Roman turns: per-turn grounding, guardrai | `a8fa651c8f131b7d7f61076143671be350af9ce5` | `main` | +8119/-72 | Opus RC, Sol RC @a8fa651c | Superseded by the split: A #665 (too big, cut under 3,000 first), B #666, C branch agent115/roman-split-c-live. Close #651 only when A/B/C are all open and mapped. | handoffs/op-115/reports/B-SCHED-ROMAN-115.md |
| backend #653: feat(scheduling): S-SCHED-5 booking request auto-expiry (T4) | `17b2be255b0087196b9c1c81cc38397330c56c75` | `agent110/s-sched-lifecycle` | +1411/-23 | none; Sol executed two counterexamples at 17b2be25 | DIRTY, based on agent110/s-sched-lifecycle (#634's branch). Rebase on main after #634 merges; fix the counterexamples (duplicate notices after replica takeover; arbitrary error-name logging). | handoffs/op-115/reports/AUD-SOL-CORE-115.md |
| backend #661: fix(payments): never return or keep client Stripe PaymentSheet credent | `f4679fd8e287e5bcd6c0dc8da69c208786f79802` | `main` | +771/-34 | Sol RC B-661-3 @f4679fd8; Opus owes re-audit | Round 3 for B-661-3 (late-delivered earlier decline marks a paid retried purchase failed and drops access). C-661-2 backfill SQL in report; C-661-3 interplay with #654. | handoffs/op-115/reports/B-FEE-9-115.md |
| backend #665 (draft, now A2 of the split; see section 12): feat(roman): client context builder and disclosure route, inert (#651  | `9d54333a5af0060c9ce4fb3457c8310ea89367a1` | `main` | +4113/-0 | not audited | Roman split piece A (context). 4,113 lines: over the 3,000 hard limit; cut it before review (move the 1,009-line personas fixture with the eval harness to C, or split the 1,217-line context service). | handoffs/op-115/reports/B-SCHED-ROMAN-115.md |
| backend #666 (draft): feat(roman): safety router and reply post-check, inert (#651 split 2/3 | `07429136a8640a1ce8f5c44a62023bd32901b2c3` | `agent115/roman-split-a-context` | +1729/-6 | not audited | Roman split piece B (guardrails), based on A. Audit after A; retarget to main when A merges (CodeQL, danger, banned casts only run on main-based PRs). | handoffs/op-115/reports/B-SCHED-ROMAN-115.md |
| mobile #317: fix(wearables): S14 [T4] Apple Health / Health Connect connect, 30-day | `d0407b625e1d2bc63ebe9d063296bc85461842ed` | `main` | +8555/-3305 | Opus APPROVE merge-only @d0407b62; Sol RC 0/1/0 @d0407b62 | Required CI red: the pure merge of main after #305 broke two Health Connect test expectations. Builder updates the expectations; then merge-only deltas; merge. | handoffs/op-115/reports/AUD-SOL-MOB-115.md |
| mobile #331: feat(roman): your conversations with Roman, list, open and delete (T4) | `5b58a1218acb1f5ba15cada8b8eaf8b78c75a058` | `main` | +5028/-39 | Sol BLOCK 1/0/0 @5b58a121; Opus RC 0/1/0 @c621770f | Resume: apply handoffs/op-115/patches/331-round3-wip.patch (commit cd37225), failing-before check, FIX ROUND 3 (late 401 token race; legacy credential migration). | handoffs/op-115/reports/B-MOB-A-115.md |
| mobile #339: fix(copy): impersonal voice across shipped copy with a repo-wide voice | `8165ca9560d2bcd35f92b1cd8468e6c998aa552a` | `main` | +469/-229 | Sol RC B-339-1 @8165ca95; Opus none | Reword copy that claims server outcomes the app cannot know, each with a failing-before test. | handoffs/op-115/reports/B-MOB-A-115.md |
| mobile #341: feat(notifications): device zone via PUT /notifications/timezone, book | `7c791bb39979eb16481ce71a85de652b41368a3a` | `main` | +1712/-254 | Opus RC 0/1/1, Sol RC 0/2/2 @7c791bb3 | Fix round: overlapping preference saves race; 'did not save' on unknown outcome; blank screen on load failure; mute-all copy vs backend; 50-row 'no longer scheduled'. Stacked on #312. | handoffs/op-115/reports/B-NOTIF-6-115.md |

### 4.1 Other open PRs (not in this wave; check history before touching)

- Roman originals superseded by #651: backend #598, #601, #602, #603, #605 (#605 is 12,606 lines). Do not merge; close once the
  #651 split lands and the owner agrees.
- Annex lanes (opened by agents 113/114, never audited in this wave): backend #655 approve-to-adjust (2,058), #657 coachless (3,184),
  #658 coach code tools (2,522), #659 broadcasts (3,928), #660 messaging inbox (3,002); mobile #337 suggestion cards, #336 request
  auto-expiry states (pairs with backend #653). #657, #659 and #660 exceed 3,000 lines: split before any audit.
- Flag flips: backend #643 (BOOKING_REMINDERS_ENABLED on; after #647/#648), #650 (community core flags).
- Older integration/candidate stacks (#427–#594, mobile #262–#302) and dependabot PRs (#471–#475, #612–#621, mobile #276–#286):
  backlog; not launch scope.

## 5. Restart plan (each step is a separate owner go)

Use a merge crew and keep the fleet small (credits). Follow MERGE_DEPENDENCY_GUIDE.md: merge immediately, refresh one PR at a time.

1. **Land group A.** Agents: 1 builder (Claude Opus 5.5) for conflicts and stale tests, 1 Opus lens, 1 Sol lens for merge-only deltas.
   Order: backend #642 → #652 → #664 → deploy (run the flag sync for #642) ; mobile #312 → #328 → #335 (+C-335-4) ; backend #634
   (builder resolves conflict) → deploy → mobile #325 (builder resolves app.json) ; mobile #317 (builder fixes two test expectations).
   Pairs wait for their partner: #315 with #611, #321 with #627, #322 with #628, #338 with #656.
2. **Review group B.** #611 + #315 first (App Store blocker). Then the recurring chain: #627 + #321 → retarget #654 to main → #654
   (+ builder round on the Sol draft) + #334 → #656 + #338 → deploy. Then #628 + #322, #641 → #332 into #329 → #329 → #340, #648.
   Add a builder only when findings come back.
3. **Group C and follow-ups.** #661, #339, #341, #331 (apply the saved patch), Roman split (#665 under 3,000 first, #666, piece C),
   #653, C-627-10 follow-up, a CI memory fix (jest worker OOM on main d23fa317 and on #654), the size rule in the backend dangerfile
   (danger is already a required check), then the annex PRs (split first).

Each backend deploy: main required CI green → `gh workflow run fly-deploy.yml -R BradleyGleavePortfolio/growth-project-backend --ref
main -f release_sha=<full sha> -f confirm=deploy -f migrations=apply-migrations` → approve the production environment (section 9.3)
→ verify /health (new uptime), /readyz, `_prisma_migrations` (0 unfinished; new names finished), and the PR's routes answer 401
unauthenticated. Before deploying a migration with a backfill or SET NOT NULL, check affected row counts read-only.

## 6. To-do lists

### 6.1 Owner actions (ask once, clearly)

1. Supabase Pro yes/no. Production project is on the FREE plan: no restorable backups.
2. Stripe Dashboard, platform webhook: add `setup_intent.succeeded` (before #654 deploys) and `customer.subscription.trial_will_end`
   (before #656 deploys).
3. FCM V1 key in Expo for Android push.
4. Sign in with Apple keys via fly-apple-signin-set.yml (fly-env-truth shows the APPLE_AUDIENCES shape check failing).
5. The server POSTHOG_KEY is 8–15 characters; real PostHog project keys are much longer. Confirm it.
6. Later: approve one EAS production build (spend); sign up as a coach on it; device pass of account deletion, including a
   Google-only account after #642 merges and the flag sync runs.

### 6.2 Operator decisions already made (do not re-ask)

See section 3.2.

### 6.3 Backlog (no lane yet)

C-627-10 follow-up; jest OOM CI fix; dangerfile size rule (backend) and a size check for mobile (making it required needs the owner's
exact words); reword the three hashed P0 consent strings at the next consent version bump (mobile + backend #607) and delete their
guard exceptions; merge queue via an organization-owned repo (owner decision after launch); annex PRs; closing superseded Roman PRs.

## 7. How agent 115 operated

- Lanes: each builder owned a chain of 2–4 related PRs; each lens pair (Opus + Sol) owned a queue file. Shared rules lived in
  `ops/lanes115/_COMMON_115.md` (copy: handoffs/op-115/lanes/_COMMON_115.md).
- Audit claims: a lens creates `ops/lanes115/claims/<repo>-<n>-<head8>-<opus|sol>` before auditing so two lenses never duplicate.
- `wait_audit.sh "<lens>" <secs> <queuefile>` blocks until a queued PR is auditable (ready, green, no claim, no verdict at head).
- `prstate.sh <backend|mobile> <n>`: one-line state (head, merge state, ready, verdicts at head, check buckets), 90 s cache.
- `board.sh`: all wave PRs + MERGEABLE flags + sandbox stats. `ci_janitor.sh`: cancels runs for superseded heads (run each cycle).
- `approve_deploy.sh <run_id> [secs]`: approves the pending production environment on a fly-deploy run.
- CI lanes (handoffs/op-115/ci-lane/): builders and lenses push `ci/<lane>-<topic>` branches; a one-job workflow runs the targeted
  jest specs listed in the commit. Use for failing-before proofs and probes instead of local full suites.
- Copies of all tooling: handoffs/op-115/tools/. Shared node_modules lived in the sandbox (deps/), not in git: recreate with
  install_deps.sh + link_deps.sh.

## 8. Lessons and mistakes (agent 115)

- Strict up-to-date + new-head-needs-new-verdicts made every merge stale every other approved PR; refreshing several at once wasted
  CI and verdicts. Refresh only the next PR in line.
- Ending lenses before the train was empty stranded 11 approved PRs. Keep a merge crew alive until merges are done.
- Giant PRs (up to 13.6k lines) caused 5–10 fix rounds each. Size rules now prevent this.
- Twenty agents saturated the 20-job CI cap; most wall-clock time went to queues. Fewer, smaller PRs move faster.
- Mistake: several state-log entries were first written with guessed clock times; corrected to "unstamped". Always take times from
  `date`.
- Mistake: ordered the #651 split, then the PAUSE stopped it half-way (A and B drafts, C unfinished). Do not start large
  restructures near a budget stop.
- `gh` sometimes falls back to unauthenticated calls (rate-limit errors from some subcommands); use `gh api` with explicit paths.

## 9. Key facts

### 9.1 Systems

- Production backend: https://backend-spring-lake-3890.fly.dev (Fly app backend-spring-lake-3890). Routes are under /api.
- Supabase production project `rpyfdsgxxltzutgqeouk` (org lpwroedsshsuxlhhhqil, FREE plan). Read-only SQL via the Supabase
  connector only. Production has 1 account (system coach); 0 exercise catalog items; 0 coach media assets.
- fly-env-truth.yml (read-only; needs the production environment approved): names and length buckets only. 10-03: MUX_*, RESEND_*,
  SENTRY_DSN present; POSTHOG_KEY short; APPLE_AUDIENCES shape check fails.
- Mobile repo has NO Actions secrets (no EXPO_TOKEN). Free iOS builds on GitHub macOS runners (public repos) are possible later with
  `eas build --local` if the owner adds EXPO_TOKEN and an App Store Connect key.
- GitHub account: personal "User" account (not an org), public repos, Free plan: 20 concurrent jobs, no merge queue.

### 9.2 Required checks

- Backend (11): build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL
  JS/TS, Banned cast tokens, build-sbom, danger, Schema parity, community-live-tests. CodeQL, danger, banned casts and build-sbom only
  run on PRs based on main.
- Mobile: Typecheck, lint, test; Analyze (javascript-typescript); Analyze (actions).
- Known flakes: jest worker out of memory (community-message-shape.live.spec.ts on main; #654 first attempt); provider-wiring symlink
  spec (C-664-1); release-evidence-gate.spec.ts:367. Rerun failed jobs once (`gh run rerun <id> --failed`), then investigate.

### 9.3 Deploy approval

`gh api repos/BradleyGleavePortfolio/growth-project-backend/actions/runs/<id>/pending_deployments` → take the production environment
id → `gh api -X POST .../pending_deployments -F "environment_ids[]=<id>" -f state=approved -f comment="..."` (or tools/approve_deploy.sh).

### 9.4 Migrations

Prisma `migrate deploy` applies pending migrations even when their timestamps are older than applied ones (OR-113-4); 20270213 applied
after 20270224 on 10-03. Prefer renaming timestamps newer than production's latest before merge (guide rule 7).

## 10. Credits and pacing

The owner's daily budget is about 45k credits; on 10-03 the fleet used 32k by 11:25. Rules of thumb: 1 merge crew (3 agents) lands
group A; add builders only for findings; lenses end when their queue is empty; operator polls every 8–10 minutes, not faster.

## 11. File map (tgp-agent-context)

| Path | What |
|---|---|
| AGENT_RULES.md | The law (G01–G22; G21 has the size rule) |
| MODEL_ROUTING.md | T0–T4 grading and routing; 8.2 PR size gate |
| OPERATOR_STANDING_ORDERS.md | Standing owner orders for every operator |
| MERGE_DEPENDENCY_GUIDE.md | Dependency causes and the 10 rules |
| DECISION_LOG.md | Owner decisions, verbatim |
| LAST_OPERATOR_STATE.md | Running operator log |
| handoffs/op-115/HANDOFF_AGENT_116.md | This file |
| handoffs/op-115/PAUSE_AND_PLAN_2026-10-03.md | Owner-facing pause status and resume plan |
| handoffs/op-115/reports/ | 19 lane reports, each ending with HANDOFF |
| handoffs/op-115/lanes/ | _COMMON_115.md (lane rules incl. FINISH MODE, PAUSE, HARD LIMIT), LANES.md, queue files |
| handoffs/op-115/ci-lane/ | CI lane workflows and ci_lane.sh |
| handoffs/op-115/tools/ | board.sh, prstate.sh, wait_audit.sh, ci_janitor.sh, approve_deploy.sh, heavy.sh, link_deps.sh, install_deps.sh, briefs |
| handoffs/op-115/patches/331-round3-wip.patch | Unpushed #331 commit cd37225 |
| handoffs/op-114/ | Agent 114 handoff and notes (background) |

## 12. Split program (owner order 10-03 12:12: split monolithic PRs into chunks under 3,000 lines, one by one)

Agent 115 executes this after writing this handoff and records progress here after every PR. Method:
- Work from the PR's current head. Group its files by seam (schema/migration, services, controllers, mobile screens), keeping each
  piece compiling and its tests with it. Each piece is a new PR: first piece based on main, later pieces stacked on the previous
  piece's branch; each under 3,000 changed lines; pieces inert until the last one wires them in where needed.
- The original PR is left open with a comment linking its pieces ("Split into #a → #b → #c (owner size rule)") and is closed only
  when all pieces are open and CI is green. Prior verdicts do not carry to the pieces; each piece needs fresh Opus + Sol audits.
- Order: unapproved PRs first (they would need full audits anyway), largest first; approved PRs last (splitting them discards
  approvals).

Progress log (newest last):

- 12:22 PDT. **#651 Roman stack done (re-split).** #665 was 4,113 lines. Now: #667 A1 context core (base main, 1,832, head bacd83e1)
  -> #665 A2 context service + controller (2,281, head 802ae6a3) -> #666 B guardrails (1,735, head 6de54b10, rebased, no content
  change) -> #668 C1 live-turn wiring (2,160, head b97c6c8a) -> #669 C2 live-turn fixes (tests only, red by design; builder writes the
  fix from the C3 recipe in reports/B-SCHED-ROMAN-115.md; head b5183859) -> #670 C3 eval harness (1,135, head c1da313a). All drafts.
  Checks: combined tree = old A/B/C heads + main's 19 #647 files (git diff); `tsc --noEmit` passes at A1, A2 and C1; C3 fails only on
  the C2 failing-before spec (expected). Next: builder fix on #669; un-draft in order; Opus + Sol audit each at its exact head;
  close #651 (and later #598/#601/#602/#603/#605) after all six are green.
- 12:31 PDT. **#656 free trials (backend) split.** #656 was 5,611 lines @ 86223987. Now #671 T1 data model + rules + usage ledger
  (base main, 1,727, head a6a2b589; inert; additive migrations) -> #672 T2 coach trial setting + client trial offer + notice service
  (1,328, head e06b5b13) -> #673 T3 checkout + webhook + conflict guard (2,556, head 5743e51f). All drafts. Tree at #673 = #656 head
  (git diff empty). `tsc --noEmit` passes at all three; local jest: one-trial-rule 20/20 at T1; one-trial-rule + package-rules 43/43
  at T2. T1 holds back one module-wiring assertion (and its import) of b-trials-one-trial-rule.spec.ts; T2 restores it. Mobile #338
  now pairs with #673. Owner adds Stripe event customer.subscription.trial_will_end before the deploy. Next: un-draft #671 when its
  CI is green; Opus + Sol audit each piece in order; close #656 after all three are green.
- 12:32 PDT. Roman stack fix: the lockout allow-list line `roman/context/me` moved from C1 into A2 (the route-table spec scans controller
  files on disk). New heads: #665 A2 eb7cb7a8, #666 B 0ec835ca, #668 C1 fabc2268, #669 C2 6386c00b, #670 C3 fb671019 (#667 A1 bacd83e1
  unchanged, CI green 15/15). Local: dunning route-table + both context specs 61/61.
- 12:40 PDT. **#641 coach Money backend split.** #641 @ f60ed603 (6,738 lines, BEHIND) merged with main d23fa317 locally (clean), then
  cut: #674 M1 refund transfer reversal once/review/reconcile + migration 20270314000000 (base main, 2,128, head 9a512028) -> #676 M3
  Money read API + payout reason + HTTPS onboarding return (2,799, head 564f33bf) -> #677 M4 CoachMoneyService unit spec (1,244, head
  4aaee4ed); #675 M2 package-create idempotency (base main, 567, head d1c98430, independent). #675 + #677 = refreshed #641 tree (git
  diff). `tsc --noEmit` passes at all four. Local jest: M1 179/179 (8 suites), M2 99/99, M3 67/67, M4 55/55. Shared file: #675 and
  #672 (trials T2) both change packages.service/controller; the second to merge refreshes. Mobile #329/#332/#340 need #676 deployed.
- 12:48 PDT. **#654 recurring subscriptions split.** #654 @ 02c48de7 (6,090 lines vs #627) merged with #627 @ 66162285 locally (clean),
  then cut: #678 R1 schema + migrations 20270225000000/20270311000000, trial card, error details, Stripe subscription API (base #627
  branch, 747, head 243b1ff4; inert; its tests arrive in R2/R3) -> #679 R2 subscription checkout service + controller + terms snapshot
  (2,863, head 17be43d5) -> #680 R3 webhooks + fix-round specs (2,480, head 8d556f88). Tree at #680 = refreshed #654. `tsc` passes at
  all three; local jest R2 98/98, R3 all seven b-recur suites 133/133. Unposted Sol draft 0/3/0 (AUD-SOL-MONEY reports) applies to
  R2/R3: builder round. Retarget #678 to main after #627 merges. Mobile #334 pairs with #680. Owner adds setup_intent.succeeded.
- 13:04 PDT. **#627 coach net payouts split (6 pieces).** #627 @ 66162285 (14,846 lines, BEHIND) merged with main d23fa317 locally
  (clean), cut with an import-order check (ops tool deps.py, copy in handoffs/op-115/tools/split/): #681 F1 schema + fee policy + ledger
  + Stripe transfer API + checkout call sites (base main, 2,333, head 68a6fa17) -> #682 F2 transfer orchestrator (2,529, 72646af5) ->
  #683 F3 charge settlement + reconciliation (2,895, fcbfe751) -> #684 F4 checkout/refund/sweep/notice wiring (2,464, dd674ca7; first
  live money change) -> #685 F5 specs (2,958, 5c892c39) -> #686 F6 specs (1,667, 6d0d96c4). Tree at #686 = refreshed #627. `tsc`
  passes at all six; local jest per piece: 83, 13, 26, 85, 67, 169, all passing. Recurring stack rebased onto #686 (no conflicts): #678
  87981adb -> #679 f6cc1d8f -> #680 f957ab8b; #678 base is now agent115/fee-split-6-recovery-specs; tsc + 169/169 at #680. Mobile #321
  pairs with #686. Merge order for the money chain: #681..#686 -> deploy -> #678..#680 -> deploy (with #334) -> trials #671..#673.
- 13:14 PDT. **#628 dunning v2 split (5 pieces).** #628 @ dc47e0ef (12,334 lines; already current with main): #687 D1 schema + cadence
  + dispatcher + Stripe billing API + fixtures/fakes (base main, 2,181, head d9f5ede2; inert) -> #688 D2 dunning v2 service (2,534,
  f9abc287) -> #689 D3 client billing service + reconciler (2,462, 41add319; inert) -> #690 D4 billing controller + lockout allow-list +
  guard/scheduler/status + webhooks + wiring (2,415, 934d2871; first live change) -> #691 D5 e2e specs (2,742, f506d682). Tree at #691
  = #628 head. `tsc` passes at all five; local jest: D2 41/41, D3 route-table 36/36, D4 199/199, D5 80/80. Lesson: a new controller and
  the lockout allow-list entries for it must sit in the same piece (the route-table spec scans controllers on disk). Mobile #322 pairs
  with #691.
- 13:37 PDT. **CI review of the splits and fixes.** Several first cuts compiled but broke existing specs at runtime (a spec on main
  whose subject changed in an earlier piece). Fixes: the split tool (tools/split/build_piece.sh) now also runs every existing spec that
  imports a file changed in the piece. #627 re-cut (same final tree): #681 F1 5a19178d (2,503; now carries the checkout, guest-checkout
  and LP-attribution spec updates; 165/165), #682 F2 007d3dcb (2,529), #683 F3 e2af8ca1 (2,895), #684 F4 42e9ca13 (2,606; + recon,
  admin analytics, coach-connect, field-select specs; 209/209), #685 F5 858d3716 (2,958), #686 F6 7be7d396 (1,355). F2 and F3 stay red
  by design (F2 swaps the transfer orchestrator under main's purchase-split handler; F4 carries the updated specs). Recurring stack
  rebased again onto the new F6 (trees unchanged): #678 b89c199d, #679 517def8c, #680 7e55cfcb. #628 re-cut (same final tree): #687 D1
  c2a901a8 (1,840; 18 importing suites pass), #688 D2 6627044c (2,875; cadence + dispatcher moved here; 10 suites pass), #689 D3
  9e77159a (2,462), #690 D4 f72668c2 (2,415; 25 suites pass), #691 D5 70bcaa43 (2,742). Roman #668 C1 is red by design until #669 C2
  (B already removed the exclamation allowance). Other red jobs were the known jest out-of-memory flake; reruns requested.
- **Landing rule for split stacks (operator 115, binding until changed):** pieces are reviewed one by one (that is where the credits
  go). A piece that is red by design (#682, #683, #668) or unsafe to deploy alone (#681 switches checkout to separate charges before
  the transfer machinery exists) is landed as one with the rest of its stack: after every piece has dual APPROVE at its exact head,
  merge top-down into the piece branches (they are not protected), confirm the bottom piece's tree equals the audited top head (git
  diff empty; lenses post a merge-only delta), then merge the bottom piece into main with every required check green, then deploy.
  Stacks whose pieces are each green and inert-until-wired (#667/#665/#666, #671-#673, #674-#677, #687-#691) can land piece by piece
  but must still merge back to back and deploy only after the last piece.
- 13:41 PDT. **#648 device push split.** #648 @ 22de1182 (3,197; current with main): #692 P1 outbox schema + migration 20270307000000
  + quiet hours + preferences + lock-screen copy + Expo client (base main, 815, head 27156167; new files, inert; 6 importing suites
  pass) -> #693 P2 delivery service + emitter wiring + specs (2,382, head 13417e7b; 35 suites pass locally). Tree at #693 = #648 head.
  Before deploy: confirm 20270307000000 is absent from production _prisma_migrations (it was edited in place).
- 13:45 PDT. **Mobile #334 package sheet split.** #334 @ d466fd15 (6,202; BEHIND) merged with mobile main 367e6c48 (clean), cut: #342 S1
  payment core + plan terms + wallet config (base main, 1,685, head 72821495; 15 importing suites pass) -> #343 S2 purchase hook +
  selection sheet + feedback (2,438, af984441; 8 suites) -> #344 S3 package screens + your-plans + subscription/recur tests (2,079,
  f629e0f9; 5 suites). Tree at #344 = refreshed #334. Pairs with backend #680. Split tools now handle mobile (.tsx, double quotes,
  *.test.tsx).
- 13:49 PDT. **Mobile #329 coach wizard split.** #329 @ fc7fe73f (6,392; BEHIND) merged with mobile main 367e6c48 (clean), cut: #345 W1
  setup API + create intent + Connect copy + QR vendor (base main, 1,878, head a4e49588; new modules; 11 suites pass) -> #346 W2
  checklist + first package + get-paid + invite + setup screen (1,922, 4522eb8e; 11 suites) -> #347 W3 wizard navigator + package edit
  screen + setup/round-2 tests (2,592, ea2c72d1; 10 suites). Tree at #347 = refreshed #329. Needs backend #674 -> #676 -> #677
  deployed. #332 (base = #329's branch) is next and will be based on #347.

# Handoff — agent 121 to agents 122 and 123 (2026-10-05, written 14:55 PDT, updated 15:08 PDT)

Owner goal (14:50 PDT): launch path 4/7 by end of day, "truly, without cutting corners". Owner budget today: agent 121's 45k,
plus agent 122's 45k and agent 123's 45k. Agents 122 and 123 run IN PARALLEL, split by repo, so they never touch the same branch.

Read first, in order: TGP_SOURCE_OF_TRUTH.md A1 (owner rules), A2 (the law, including the EDGE-CASE FREEZE and RUTHLESS SCOPE overrides
at the top of A2), A5 (merge rules 11 and 12, plus the 13:37 note: "up to date" is OFF), A7.1 (launch path), then this file. GitHub is the
only truth: re-check every head below before acting.

## Since 14:55
- Deploy 3 DONE 14:56 (release 4bddf24a: push b#692+#693, coach payouts b#674+#676+#677+#703, messaging b#708-#711; 4 migrations;
  /health and /readyz 200).
- Merged b#712 (scheduling train #712-#720 + #653) and b#642 (Google sign-in flag) into main (cb986a4c). Deploy 4 dispatched 15:03
  (run 37379973924, migrations applied, production approved).
- Merged m#378 (Health Connect follow-up). b#731 (Health Connect ingest flag) dual APPROVE (Sol 6003830962, Opus 6003888250); danger
  re-run after the title fix; agent 121 merges it and runs the env sync.

## Launch path now (14:55)
| # | Step | State | Owner of the remaining work |
|---|---|---|---|
| 1 | Privacy | DONE | — |
| 2 | Money | fees, recurring, #661 deployed. Left: payment sheet m#342-#344 (dual APPROVE at heads e3226f3b / 691e0cf0 / 88659e21; held until dunning D4 b#690 is deployed); trials b#671 565893b5, #672 193c6f9a, #673 91d0adcb, #706 87aaf126, #707 2bb4b368 (restacked onto main by B-TR9-121, READY, no review at these heads; CI needs a re-run) + m#338 48b5e6b5 (dual APPROVE). Owner: Stripe webhook refund.updated + confirm trial_will_end before the trials deploy | 122 (trials), 123 (sheet + m#338) |
| 3 | Coach | backend b#674 (+#676, #677, #703) merged 14:43 and in deploy 3 (run 37378685156). Left: mobile wizard m#345 ed29833c (dual APPROVE), m#346 26cf23b7 (Opus APPROVE, Sol RC B-346-3), m#347 8437fb94 (dual APPROVE, restack); money screens m#348 90501f84, #349 35aa8163, #350 6fb21216, #351 352d768e (no verdicts at these heads; #349/#350 red by design until #351; land as one) | 123 |
| 4 | Failed payments | backend dunning: b#687 d86b31a6 (FR4 READY; Opus RC / Sol APPROVE at older f3c7fd37), #688 2662d01a (dual APPROVE at 21714f7b, restacked since), #704 764af2e1 (dual APPROVE at 49d0b66e, restacked since), #705 2a03d7dd (both RC at 5138947c; fixes continue in #724), #724 e77a8d36 (D2d, READY, no review), #689 bb992fed (both RC at head), #690 06307883 (Opus APPROVE, Sol RC at head), #691 e0afe678 (no review), #725 1dbc59b6 (base main, locked client reaches own coach thread, READY, no review), #642 6c4b960f (Google sign-in flag; dual APPROVE at 4fee3c02, main-refreshed; operator 121 merges it today if CI turns green). Then deploy, then mobile lockout m#352 da686cea, #353 78ed4e07, #354 be5c74b1 (FR3 READY: dispute copy fixed; need a delta pair) | 122 (backend), 123 (lockout) |
| 5 | Health Connect | m#359-#364, #369 merged. Left: m#378 2ea649a1 + flag b#731 958d340d (lens pair HC13 running under 121, posts by ~15:25) -> merge -> deploy the flag -> owner device pass | 121 until handoff, then 122 deploys the flag if 121 has not |
| 6 | Remainder | m#312, m#335 merged today. Left: programs m#355-#358 (fixes queued), m#339, m#340 | 123 if budget remains |
| 7 | Builds and review | not started | after 2-6 |

4/7 by end of day = steps 1, 3, 4, 5. Stretch: step 2.

## Lane split
### Agent 121 (finishing now, until its 45k)
Owns until it hands off: deploy 3 (4bddf24a: push, coach payouts, messaging; migrations applied), b#712 scheduling train into main
(dual APPROVE at f2af32dd: Opus 6003771792, Sol 6003779987; danger re-run after the title fix) then deploy 4, b#642 merge + the
GOOGLE_CLIENT_IDS env sync, HC13 verdicts then m#378 + b#731 merge. Writes a closing line in SoT Part B when it stops.

### Agent 122 — backend money lane (growth-project-backend only)
1. Failed payments (step 4): one lens pair over the whole dunning train (#687, #688, #704, #705 + #724, #689, #690, #691, #725) under
   RUTHLESS SCOPE; one fix round per piece that has an item-list B (open Bs today: #689 both lenses, #690 Sol, #705 via #724); one delta
   pair; land top-down as one train (rule 11); deploy with migrations. Reports with every prior verdict: ops/reports/ on backend branch
   wip/op121/ops-snapshot (B-DUND2D-121.md, plus agent 120's dunning reports listed in SoT A9.2).
2. Trials (step 2): re-run CI on the five heads (their runs were cancelled in the GitHub outage; list in
   handoffs/op-121/ops/cancelled_for_priority.txt), one lens pair on the restack/main-refresh delta (3 conflict hunks in #673), land as
   one, deploy after the owner's Stripe webhook change.
3. Owns every backend deploy after agent 121 stops (fly-deploy.yml: release_sha = current main head, confirm=deploy,
   migrations=apply-migrations when prisma/migrations changed; approve the production environment; check /health and /readyz).
   Agent 123's backend flag PRs ride in 122's deploys.

### Agent 123 — mobile lane (growth-project-mobile only, plus reading backend)
1. Coach mobile (step 3): B-WIZ3 fix round for m#346 (Sol B-346-3; plan in SoT A9.2 "B-WIZ3-120"); first review pair over money screens
   m#348-#351 (one train); fix round; delta pair; land wizard (#345-#347) and money (#348-#351) top-down. Coach backend is deployed.
2. Lockout m#352-#354: delta pair on FR3 now (dispute copy fix; B-352-3 deferred, SoT A8.9); land right after agent 122's dunning deploy.
3. Payment sheet m#342-#344 + trial setting m#338: already dual APPROVED; land after agent 122 deploys dunning D4 (b#690) and trials.
4. Programs m#355-#358 if budget remains (step 6).

## Rules that saved the most time today (keep them)
- Up-to-date requirement is OFF: an approved PR with green checks at its exact head merges without a main refresh.
- Land stacks top-down as soon as every piece is dual-approved; do not wait for CI on the pieces (only the bottom PR's final run counts).
  Cancel superseded runs right after landing. Bottom-up is slower (pieces not based on main skip CodeQL, R75, SBOM, danger).
- RUTHLESS SCOPE: lenses hunt only item-list problems; delta reviews 20 min, one PR 30 min, a train 45 min.
- Danger fails a PR whose title is not Conventional Commits: fix the title, re-run danger.
- The R75 gate fails on any new `as any` / `as unknown as` / `as never`, tests included.
- Booking pushes go through the push sender (b#692) only; the move-request line is "Time change requested" / "A client asked to move a
  session. Open the app to review."
- Coordination between 122 and 123: each writes only under its own AGENT banner in SoT Part B; `git pull --rebase` before every push to
  tgp-agent-context; never push to the other's repo lane.

## Owner to-do that gates 4/7
- Health Connect device pass after the flag deploy (step 5).
- Stripe: add refund.updated; confirm customer.subscription.trial_will_end (before trials deploy, step 2).
- Android push check after deploy 3 (push is live once deploy 3 finishes).

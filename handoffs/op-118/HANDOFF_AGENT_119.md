# TGP Operator — current state (agent 118; becomes the first prompt for agent 119)

Updated: 12:03 PDT 10-04 (from `date`). CURRENT-STATE document: section 3 is overwritten at every milestone; history goes to
LAST_OPERATOR_STATE.md. GitHub is the truth: verify every head and verdict there before acting on any line here.

## 0. Summary

Agent 118 STOPPED at 12:03 PDT 10-04 on owner decision 5A (credits 38k/45k): no agents running, no CI of ours in flight, ops/
snapshotted to backend branch wip/op118/ops-snapshot. Agent 119: rebuild the sandbox (section 8), verify heads (section 3), then
resume with the critical path in section 4 under the agent cap below.
Scoreboard at stop: Launch path 1/7 steps done | merged today 4 (#698, #699, #700, mobile #368) | deployed today 2 (2af682ca,
3e9a9a75) | open decisions 4 | credits used 38k/45k (owner, 11:27 PDT 10-04).
AGENT COUNT: owner order 10:32 PDT 10-04 "stop-and-drain to 5 concurrent agents": hold at most 5 concurrent until the owner says
otherwise.
NEW BINDING RULING 12:01 PDT 10-04 (dispute pause, section 9): agent 119 splits dunning D2 #688 and builds it in its own piece.
Play Console: app recreated as com.growthproject.app; Health apps declaration filed; Data safety in progress; App access sign-in
accounts are an owner to-do (section 4). Do not investigate Play further.
Stripe: production webhook destination we_1UMt9WDUoC5CCVhShvAELVmI (2024-09-30.acacia, 21 events) live since 10:25 with the new
secret in Fly; StripeProcessedEvent was still empty at 11:00 (no real event yet). Never run backend workflow fly-secrets-set.yml.

## 1. Owner rules

Section 1 of handoffs/op-117/HANDOFF_AGENT_118.md (v8) stays binding verbatim, plus the owner's 10-04 09:31 message:
- Agent rules = LAW; autonomy doctrine = MENTALITY; model routing = PROCESS. Repo copy on main wins over attachments.
- Every message to the owner starts with "Launch path: <n>/7 steps done | merged today <n> | deployed today <n> | open decisions <n> |
  credits used <n>/45k" (his last number; never 0 unless he said 0) and ends with "Your next step: ..." or "Nothing needed from you."
- Up to 15 agents in parallel; one job = one agent = one or two PRs, then it ends.
- Order of work: (1) fees #681-#686 + #697 as one stack (job one); (2) deploy, then recurring #678-#680 + #696 + #701 with mobile sheet
  #342-#344, and #661; (3) deploy, then trials #671-#673 + mobile #338; (4) coach, then dunning (+#642), then Health Connect, then the
  remainder. Cheap lens pairs on #698, #699, #700, mobile #368 whenever a slot is free. Recurring is most critical of all; never
  one-time-only.
- One builder per stack, bottom-up, until every piece is READY; only then that stack's lens pair. Builders replay every prior probe from
  both lenses and self-check the money list before READY. Under review: A/B fixes only; C items become follow-up PRs.
- Rule 12 (pure main merge, every PR file byte-identical): operator MERGE-ONLY TREE CHECK (ops/tree_check.sh + all required checks
  green). Restacks, conflict fixes, fix rounds: both lenses at the exact head. Deploy with -f migrations=apply-migrations ONLY when the
  release adds migrations or schema changes. Refresh only the PR next to merge.
- Snapshot ops/ to backend branch wip/op118/ops-snapshot at every milestone. If credits or the session may end: stop launching, let CI
  finish, post drafts, snapshot, update this file. Never stop silently. Report merges per hour and credits per merged PR.

## 2. Production (verified 09:33-09:45 PDT 10-04)

https://backend-spring-lake-3890.fly.dev: /health 200 ok, /readyz 200 db up. Release 643817b3586e27ad95cc3c519733fc14d0aaafde
(fly-deploy run 37178577858, success). _prisma_migrations 189 rows, 0 unfinished, latest
20270301000000_notification_zone_provenance_reminder_generation. Backend main b644198b (CI-only since the deploy: #694, #695). Mobile
main 7fdb629a. Supabase org plan: free (Pro approved; owner upgrades in the dashboard). CI queue empty at 09:45.

## 3. State by stack (rebuilt from GitHub 12:03 PDT 10-04)

Sizes are changed lines. "RC" = REQUEST_CHANGES. A verdict counts only at the exact head. Restacks and fix rounds need both lenses
at the exact head (rule 12); a pure main merge needs only the operator MERGE-ONLY TREE CHECK.

| stack | PRs (head, size) | verdicts / state | next action |
|----|----|----|----|
| Fees (job one) | #681 e9650dc4 2,956; #682 70f879a2 2,999; #683 cc183e0a 2,959; #684 6b13af56 2,435; #697 88c72200 1,831; #685 c5e282fb 2,958; #686 8cb7b2d4 1,355 (top) | #681, #682 dual APPROVE. #683 FIX ROUND 16 READY (closes Sol B-683-7/B-683-8; Opus APPROVE was at the prior head); red by design: 9 tests in 3 suites carried by #684. #684/#697/#685/#686 merge-only restacks READY (FR16/FR17). SIZE ASSESSMENT KEEP on #682, #683, #685 | lens pair F3 (#683 delta), then F4 (#684/#697) and F56 (#685/#686) deltas; merge top-down as one (rule 11); deploy |
| Recurring (most critical) | #678 77bce450 2,411; #679 8bbf4a41 2,932; #680 216489ff 2,766; #696 276610a3 1,910; #701 72eb096b 416 | All READY (B-RECUR6A: #678/#679; B-RECUR6B: #680 FR6, #696 FR6 with real test changes, #701 FR1). No lens at these heads | operator restacks onto fees top 8cb7b2d4 after fees verdicts, then lens pairs R1+R2, R3+R4, R5; land with sheet + #661 |
| #661 PaymentSheet | #661 f80f0088 2,843; #702 20d2eb4f 513 | dual APPROVE both | after fees deploy: refresh, short lens deltas, merge #702 into agent/clinic/b-secrets-3 first, PR descriptions (C-661-13); conflict map vs recurring (2 files, 6 hunks) in ops/reports/B-RECUR6B-118.md |
| Payment sheet (mobile) | m#342 56f281ad 2,018; m#343 fd739d58 2,813; m#344 e7fcc5d2 2,086 | #342 Opus APPROVE, Sol RC 2 B; #343 RC both (Opus B-343-6, Sol 3 B); #344 RC both (Sol B-344-1..4, Opus B-344-5/6) | B-SHEET2-118 (#342/#343; cancelled 11:28 before any push; relaunch), then B-SHEET3-118 (#344) |
| Trials | #671 c75002c9 2,291; #672 2690c07c 2,961; #673 5fdb5f5c 2,887; mobile #338 48b5e6b5 | #671 dual APPROVE; #672/#673 FIX ROUND 9 READY (Opus APPROVE at old heads); m#338 dual APPROVE (BEHIND) | lens pair T23 after recurring lands |
| Coach | #674 f9e21a87 2,948; #676 ccd60bbc 2,981; #677 4799c6af 2,918 | #674, #676 RC both (Sol 5982716289/5982716659, Opus 5982843273/5982843389); #677 none | B-CM5-118 (JOBS118 QUEUED item 7), then lenses; mobile #345-#351 after deploy |
| Dunning | #687 38d9b3ab 2,974; #688 2368d5fa 2,976; #689 bb992fed 2,913; #690 06307883 2,913; #691 e0afe678 2,742; #642 4fee3c02 75 | #687 FR2 / #688 FR3 READY (B-DUNA). #689 RC both (B-689-5); #690 Sol RC, Opus APPROVE; #642 dual APPROVE (BEHIND) | split #688 per the dispute ruling (section 9) with one piece building it; then B-DUNB-118 (D3/D4, pass dispute event time as closedAt in D4); then lenses |
| Health Connect (mobile) | m#359 e0f3d2a7; m#360 fde1875e 2,812; m#361 574b32a8 1,793; m#362 b3bc0ce4 2,835; m#363 2858bac5 982; m#364 529ba345 2,937 | #359/#360/#361 dual APPROVE; #362 FR2, #363 restack, #364 FR2 READY (B-HC4) | lens pair #362+#364, then #363 delta; land as one; owner device pass; flag flip |
| Mobile lockout | m#352 ac244d22 2,341; m#353 05d84f27 2,520; m#354 f084cc0f 1,119 | READY (B-LOCK) | lens pair #352+#353, then #354 |
| Mobile coach setup / money | m#345 97c9005e; m#346 2baea5b8; m#347 3beab160; m#348 90501f84; m#349 35aa8163, m#350 6fb21216 (red by design); m#351 352d768e | #345/#346 READY; #347 needs a W3 fix round | lens pair #345+#346, then #347 |
| Remainder | programs m#355-#358 (no verdicts); m#335 641fe891 (dual APPROVE, BEHIND); m#312 8016a79e; m#339 8165ca95 (DIRTY); m#340 2e77dcb6 | | after the stacks above |

Merged 10-04: #698, #699 (deployed 2af682ca), #700 (deployed 3e9a9a75), mobile #368. Deploy note: #700 is live, so the next mobile
build carrying #368 may ship.
Fast-follow (decision 1 default): push #692-#693 (FCM key), Roman (#667-#670, #331), S-SCHED-2 (#634, #653, mobile #365-#367, #336),
annex (#655, #657-#660, mobile #337), #643/#650, mobile #341.

## 4. Critical path and owner-only actions

Fees -> deploy (Stripe events DONE 10:25 via the new destination) -> recurring + sheet + #661 -> [owner:
setup_intent.succeeded; Billing retry "If all retries for a payment fail" = "leave the subscription past-due"] -> deploy -> trials ->
[owner: customer.subscription.trial_will_end] -> deploy. Coach and dunning deploys interleave once fees is on main.
Other owner-only items: Supabase Pro upgrade (plan still free), FCM V1 key, Apple Sign-in keys, POSTHOG_KEY confirm, EAS builds (spend),
Play Console (app recreated 10-04 as com.growthproject.app; Health apps declaration filed 10:37): Data safety form (answers given
11:32-11:50: collected only, never shared; not ephemeral; purposes per item; approximate location yes via PostHog GeoIP, precise no;
no contacts). OWNER TO-DO (deferred 11:56): App access sign-in details: create play-review-coach@trygrowthproject.com (coach, $0
package) and play-review-client@trygrowthproject.com (invited, claims the free package), strong non-expiring passwords kept only in
Play and his password manager, then fill both sign-in sets with the instruction text from the 11:55 message.

OWNER TO-DO, in order (12:03 PDT 10-04):
1. Stripe API keys page (https://dashboard.stripe.com/apikeys): delete both restricted keys used on 10-04 (one was pasted in chat).
   The key saved through the secure form still answered 200 at 12:02. Delete only keys created 10-04 for the webhook work; never an
   older key or the standard secret key (production may use it). The newest key may stay if it was only ever entered in the secure form.
2. Stripe Billing > Revenue recovery > Retries (https://dashboard.stripe.com/revenue_recovery/retries): "If all retries for a payment
   fail" = leave the subscription past-due. DONE by owner 12:08 PDT 10-04 (recurring deploy no longer waits on it).
3. Play Console: finish Data safety; App access sign-in details (two reviewer accounts, see above).
4. Before the clinic build: HC device pass (privacy-link taps on Android 13 and 14+, Samsung flow).
5. When ready to spend (needs his word): Supabase Pro, EAS builds. Keys: FCM V1, Apple Sign-in, POSTHOG_KEY confirm.

## 5. Open decisions (recommended default first)

1. Day-1 scope: fast-follow as listed in section 3 (default).
2. LAUNCH_ONE_PAGER.md: approve as drafted (default).
3. #661 at 3,121 lines: enforced, tests moved to #702 (done on the default, reversible).
4. Delete leftover ci/* branches from 116 jobs (B-T12-116 x4, B-W2-116 x2) and wip/op116/B-W2-116-360: yes (default). Only on the
   owner's explicit word.
Closed 10-04: Stripe destination (default, done 10:25); credit cap = 5A, stop at 38k/45k (12:01); dispute rule = owner ruling
(section 9). Agent 118 decisions taken on defaults and logged in ops/op118/FOLLOWUPS.md (recurring: narrower past_due exemption,
deletion consumes only granted/own-card trials; HC: Samsung row mirrors HC, privacy URL https://app.trygrowthproject.com/privacy).

## 6. Agents in flight

None (agent 118 stopped 12:03 PDT 10-04). Job entries, claims and probes: ops/lanes118/JOBS118.md (see "QUEUED" and "QUEUE HEADS"),
ops/reports/<JOB>.md, ops/aud-118/<JOB>/. Fleet log: ops/op118/FLEET.md. Follow-ups: ops/op118/FOLLOWUPS.md. Merges: ops/op118/MERGES.md.
Next launches, in order, at most 5 concurrent: AUD-OPUS-F3 + AUD-SOL-F3 (#683 cc183e0a); B-DISPUTE-SPLIT (section 9); B-SHEET2-118;
B-CM5-118; then F4/F56 lens deltas; operator restack of recurring onto 8cb7b2d4 and recurring lens pairs; HC, lockout, wizard,
trials lens pairs; B-DUNB-118; B-SHEET3-118.
Pace at stop: 4 merges in about 2.5 hours (1.6 per hour); about 9.5k credits per merged PR (most spend went into stacks now READY).

## 7. Backlog to ticket (no PR yet)

C-680-7 SetupIntent lookup index (migration); first-payment notice duplicate key can abort the outer transaction; C-661-2 credential
backfill (deploy window, count rows first); C-661-10 index; dunning D1 email "your access stays on" vs the Day-10 lockout;
B-APPLE-REVOKE (after Apple keys); #700 out-of-scope items (Prisma validation errors quoting arguments; macros/exercise names in logs).

## 8. Sandbox rebuild

As v8 section 8, but restore ops/ from backend branch wip/op118/ops-snapshot (fall back to wip/op117/ops-snapshot), lanes from
handoffs/op-118/{JOBS118.md,_COMMON_118.md}. Operator helpers: ops/op118/{state.py,prdump.sh}. Clone without --filter=blob:none
(agents need local blobs).

## 9. Binding rulings

Unchanged from v8 section 9 (handoffs/op-117/HANDOFF_AGENT_118.md), plus:

R-DISPUTE-PAUSE (owner, 12:01 PDT 10-04), verbatim: "If someone disputes one charge in a reccuring setup, they should have all
billing paused and acess terminated - coaches should handle restarting access seperately - we need to get agent 119 to split that
3k PR into peices and get one of those to adress this directly".
Meaning for the build: a dispute on any charge of a recurring plan (whether or not it ever failed a renewal) immediately pauses all
billing for that plan and ends the client's access. No automatic restore when the dispute closes; the coach restarts access
separately. This replaces the compressed dispute cycle (lock date) for recurring plans. One-time purchases are unchanged. OR-111-1
(coach alert with exact amounts, transfer reversal, forward-only netting) still applies. Dispute copy in #687 (client and coach) must
match: access has ended, billing is paused, the coach decides on restarting. Work: split D2 #688 (2,976 lines) into pieces under
1,500 where possible, one piece building this rule with its own tests (webhook order and redelivery, concurrency, terminal states,
won/lost disputes, coach restart path); both lenses at the exact heads. Implementation choice (Stripe pause_collection vs cancel,
the coach restart action) is the builder's, recorded in the PR with the R138 gate.

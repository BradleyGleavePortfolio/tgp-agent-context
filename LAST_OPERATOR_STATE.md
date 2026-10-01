# LAST OPERATOR STATE
Updated: 2026-10-01 13:20 PDT (20:20 UTC). Agent 109 took over at 13:12 PDT. Nothing running. Commit time is authoritative.

Operator: Computer, agent 109, session 7c52cefa ([thread](https://www.perplexity.ai/computer/tasks/7c52cefa-29e8-4d2a-9515-4da0e5a78329)).
Single writer for Bucket A from 2026-10-01 13:12 PDT. Agent 108 (session 590e4a5b) is retired: owner 13:12, "agent 108 is
now dead and retired under another perplexity account, out of credits". Companion file: [LIVE_STATE.md](LIVE_STATE.md).
Older sections below are agent 108's snapshot and stay as written unless corrected here.

## OPERATOR 2026-10-01 13:50 PDT: AUD-SOL wave 1 done; B-FEE relaunched
- Backend #622 @ fcb984f2: Sol APPROVE 0/0/0 (comment 5939918167); Opus APPROVE already on the same head. Both final-head
  T4 attestations present. PR is BEHIND main (be667142). Plan: merge the P0 drift fix first, then update #622 and get
  delta attestations at the new head, then merge; B-R2B (stacked on fcb984f2) rebases onto main after that.
- Mobile #317 @ c7e35d84: Sol BLOCK 1/1/0 (comment 5939974918): pending native permission can cross accounts; partial
  imports falsely signal completion. Needs a fix round.
- Backend #624 @ c82f2548: Sol REQUEST CHANGES 0/2/0 (comment 5940127416): staged-name post-check fails successful
  staging; env-registration gate misses indirect reads. Mobile #319 @ 9080afad: Sol REQUEST CHANGES 0/1/0 (comment
  5940200490): comment-shaped text inside strings hides runtime reads from the manifest gate. Need a fix round.
- Note: backend main is be667142 (#606 merged 17:37 UTC by the owner account, before takeover); production still runs
  bffae5f3.
- B-FEE relaunched in Sol's slot: fix_coach_payout_fee_math_s_fee_muq08m08 (Claude Opus 5.5), worktree
  wt/s-fee-backend.
- Queue for the next free slots: S-DUNNING -> S-ENVTRUTH fix round (#624/#319) -> #317 fix round -> S-ERRORS ->
  S-COACH-TOOLS -> banner + Roman pitch -> S-SCHED -> #607/#609 restack.

## OWNER 2026-10-01 13:45 PDT: public code
"GP-BRADLEY is great" -> the owner's public code is GP-BRADLEY, bound to the $49/mo package (grant_mode none); used by
the coachless banner and Roman's pitch through server config. Set up at C04 after the P0 fix and auth chain deploy.

## OWNER 2026-10-01 13:43 PDT: cancel timing A; lockout must be audited, tested, then flipped
"Cnacelling - option A" -> voluntary cancel keeps access through the period already paid, then off (no refund).
"Lockout check: built, but not live - needs audited and tested, then flipped live!" -> owner GO to flip
FEATURE_DUNNING_V2 through fly-feature-flags-set.yml once lane S-DUNNING's PRs are dual-audited, merged, deployed, the
mobile lockout screen is in the installed build, and Stripe preconditions are met. Objective:
handoffs/op-7c52cefa/lanes/S-DUNNING.md.

## OWNER DECISIONS 2026-10-01 13:41 PDT: billing behavior, coach safety tools, Roman pitch, in-app Stripe
Near-verbatim:
- "A $49 client who turns out to be a clinic patient - id need to just stop their billing manually while selectively
  keeping their access, and that should be an option for coaches just in case" -> coach action "stop billing, keep
  access" for any paid client (T4: money + entitlement; audited; cancels the Stripe subscription and grants access).
- "A $49 client cancels - they kick rocks and no more access if voluntary, if its no-pay then it follows my 10 day
  lockout sequence - go make sure this is wired and in prod, working as intended!" -> voluntary cancel: access ends
  (operator asked: at the end of the paid period vs immediately; default end of paid period); non-payment: dunning v2
  (charges Day 0/1/3/7, hard lockout Day 10).
- "The clinic code leaks online -> daily count for coaches of signups under what packages can prevent this, and the
  option for coaches to create/generate new qr codes/codes for safety!" -> coach daily signup count by code/package;
  coaches create, rotate and revoke codes and generate QR codes in the app.
- "Banner wording - totally fine, i like it."
- Roman pitch to coachless users: "Sir/Ma'am, just so your aware, TGP's top coach has available slots. Enter code
  GP-XXXX and join for $49/mo. Interested?" -> scripted Roman card (no AI call, so no consent dependency); shown only
  while the featured coach is accepting clients; frequency-capped; "Not now" respected.
- 13:41: "A) Pay inside the app with Stripe and say FUCK APPLES CUT - fight that hill" -> in-app Stripe checkout on
  iOS under 3.1.3(d); no IAP; App Review notes argue one-to-one personal training.

Operator verification 13:45 (read-only):
- Dunning v2 is BUILT but NOT LIVE: `FEATURE_DUNNING_V2` is absent from production secrets (fly-secrets-list run
  36885057965), so v1 dunning is active and the Day-10 lockout never fires. Schema columns exist in production.
- The mobile app has no handler for the lockout guard's 403 `LOCKED_DUNNING` (zero references in src/), so a locked
  client would see a generic error. Coach invite-code screens exist (InviteCodesScreen, InviteCodeRedeemersScreen);
  no QR generation in the app (no QR library).
- Still to verify before the flip: Stripe retry settings vs our own Day 0/1/3/7 retries (double charging risk), webhook
  events subscribed, customer portal live (owner action), in-app blocker + update-card path, coach alerts.
New lanes queued (in order after B-FEE): S-DUNNING (verify + wire + mobile lockout screen + flip plan, T4),
S-ERRORS, S-COACH-TOOLS (stop billing keep access T4, daily signup count, code create/rotate + QR), banner + Roman pitch.

## OWNER RULING 2026-10-01 13:37 PDT: TGP is 1:1 personal training; no Apple in-app purchase
Near-verbatim: "we qualify as personal training, 1:1 service - nothing more, nothing less. ... we dont apply as 'info
sellers' and i'll die on that hill!" Binding position for App Review: coaching payments are for a coach's one-to-one
personal training service under Guideline 3.1.3(d); no Apple IAP for packages. Consequences the program must make true:
(1) every client package is one-to-one coaching with a named coach; (2) the iOS build sells no app features (coach AI
credits, unlocks, content libraries) — those purchase paths are hidden on iOS; (3) App Review notes state the 3.1.3(d)
basis plainly with the demo accounts; (4) checkout path on iOS: operator recommends opening checkout in the browser (US
storefront allows purchase links, so Apple gets nothing and there is no 3.1.3(d) dispute), owner to choose vs in-app
Stripe checkout. Idea sent: include one live call per month in the $49 package so the "real-time" part of 3.1.3(d) is
concrete.

## OWNER 2026-10-01 13:35 PDT: two identical packages (free clinic, $49/mo public)
"I specifically need two packages - identical, but one is $49/mo and ones free. Make this code for a diff package?"
Design with defaults: handoffs/op-7c52cefa/TWO_PACKAGE_DESIGN.md (uses #595 code->package binding; free twin stays
unpublished so it can only be granted by the clinic code). Waiting for owner OK on its section 4.

## OWNER DECISIONS 2026-10-01 13:34 PDT: coachless banner, marketplace is v2, no generic errors

Near-verbatim: "for V1.0 - Lets go with a simple banner at top of homepage thats like an alert 'Enter coach code for
coaching. and programs' And offer '$49/mo with our top coach; Use code (my code, ...) here!' The marketplace and
directory are already designed and left for V2 - way down the road. We also need to fix the fact that tgp throws generic
and undescript failure notes - like ever - users notice and churn from having unresolvable issues from bad error codes!"
1. v1.0 coachless client home = an alert-style banner at the top: enter a coach code for coaching and programs, plus the
   owner's offer ($49/mo with the top coach, using the owner's code). The code and offer text must come from server
   config, never hard-coded in a repo (the code the owner named is partner-identifying). Open question to the owner
   13:40: the clinic code grants the clinic comp package (launch plan "comp entitlement tied to the clinic invite code"),
   so a public banner with that code would give every coachless user free access instead of $49/mo; operator
   recommends a separate public code tied to a $49/mo package.
2. Marketplace and coach directory: designed, v2, out of v1.0 scope.
3. No generic or vague error messages anywhere (program-wide quality rule; added to the common agent brief). New lane
   S-ERRORS queued: inventory every generic failure message (mobile + backend), stable backend error codes, a shared
   mapper with recovery actions, reference IDs + Sentry for unknowns, and a guard test that blocks new generic copy.
Queue for free slots, in order: B-FEE (S-FEE), S-ERRORS, coachless banner (with S-REACH resume).

## P0 INCIDENT 2026-10-01 13:35 PDT: production database is missing schema objects (signup broken)

Found with the owner's Supabase connector (connected 13:30; operator policy: READ-ONLY, SELECT and log queries only; every
production change still goes through audited GitHub workflows). Production Supabase project `rpyfdsgxxltzutgqeouk`.
- Postgres logs: "column User.archived_at does not exist" about 390 times per day since at least 09-29 (cron ticks and
  every User read). The owner's signup at 13:25 PDT failed with it; the app showed the generic error. So production
  signup, login and most User reads are broken today, and C02 never proved a working signup.
- origin/main schema.prisma vs production: missing tables ListItem, Recipe, SavedRecipe, UserPreferences; missing columns
  User.archived_at, UserProfile.{bio, weight_unit, meals_per_day, water_goal_oz, calorie_display, onboardingCompleted},
  NotificationPreferences.{daily_checkin_enabled, weekly_summary_enabled, new_client_alerts}. No migration creates them
  (schema-only edits since April, e.g. 69c80ee1 #35). The parity step in migration-dry-run.yml is grandfathered and not
  required. Detail: handoffs/op-7c52cefa/prod_schema_drift_20261001.json.
- Action: lane B-DRIFT (Claude Opus 5.5, T4) builds one additive idempotent migration + RLS + an enforced parity gate.
  Then dual audit, merge, fly-deploy.yml, read-only verification, owner signup retest. Owner decision needed later: make
  the parity check required on main.
- Slot: lane B-FEE was cancelled at 13:37 (about 10 minutes of reading lost) to stay within 7 subagents; S-FEE restarts
  from handoffs/op-7c52cefa/lanes/B-FEE.md in the next free slot.

## OWNER IDEOLOGY CHANGE 2026-10-01 13:28 PDT: open signup, coachless accounts are first-class

Owner, near-verbatim: "WE DONT ALLOW SIGN-UP WITHOUT INVITE CODE? ... a coach cant create an account without a coaches
code... thats broken! Also, a coachless person should be able to exists and later enter a code or buy a package! Notate
the change in idelogical state!"
Supersedes the "by invitation only" positioning. New product rules:
1. Anyone can create an account. No invite code or coach code is required for any role. Codes stay optional accelerators
   (a code attaches the coach and the coach's free package at signup).
2. Coaches sign up without any code (role choice, #597 chain + #306).
3. A client with no coach is a valid, complete state, not an error. From that state they can later enter a coach code or
   buy a package, and every screen they can reach works (no "No coach yet" dead ends).
Facts at 13:30: production signup policy already says invite_code_required=false, coach_code_required=false. The
mobile app still says "By invitation only. Without a code from your coach, request access." (WelcomeScreen.tsx:62) and
titles signup "Join your coach" (CreateAccountScreen.tsx:388); both are now wrong. Known 4xx signup errors (e.g. 409
"Email already registered") show the generic "Sign-in didn't complete. Please try again." (authErrorMessage.ts:96),
which hides the fix from the user. Routed: signup copy + error mapping to lane B-306 (#306); coachless home (enter code,
buy a package) is a wave-2 lane. Device evidence 13:29: build f5cac78e opens on the owner's Samsung (crash buffer shows
only the 09:46 crash from the old APK).

## AGENT 109 TAKEOVER 2026-10-01 13:12 PDT: verified facts and corrections (read before the sections below)

Owner 13:11: the EXECUTE doctrine is the operator's mentality, AGENT_RULES.md is the law, MODEL_ROUTING.md is how work is
done and PRs are graded, and NEXT_OPERATOR_PROMPT_v3.md is the owner's first prompt to agent 109. The attached rules copy
says "PROPOSED, NOT EFFECTIVE" but is word-identical to AGENT_RULES.md (EFFECTIVE 2026-09-18); no conflict.

Verified 13:14-13:20 PDT (GitHub API, live probes):
- Production backend is still `bffae5f3` (last fly-deploy run 36772404536). `/health` and `/readyz` ok. Signup policy:
  email + Apple, Google off. Community routes 404 (flags off). Earnings routes `/v1/coach/earnings`, `/payouts/readiness`
  404; live `/v1/coach/payments/earnings`, `/coach/connect/status` 401. App not on the App Store (lookup = 0).
- Branch protection on backend and mobile `main`: strict (branch must be up to date), admins enforced, required checks as
  listed in the prompt. Consequence: every approved backend PR is BEHIND main (#606 landed after their CI), so landing
  any of them creates a new head, which needs fresh final-head attestations from both lenses for T4 (G09/G10).
- CORRECTION: backend #607 is CONFLICTING with main (not merge-eligible). Its dual approval at `245da2e7` will not cover
  the conflict-resolved head. #609 is also CONFLICTING.
- CORRECTION: S-ENVTRUTH already has open PRs: backend #624 `c82f2548` (self-graded T4: production secret workflows; T4
  wins over the prompt's T3 by the max-tier rule) and mobile #319 `9080afad`. Neither is audited. The `pending_flags`
  work on `wip/op590e4a5b-s-envtruth-be-20261001` @ `8bdb5997` is not in #624 yet.
- Mobile #318 `7d24103b`: Sol APPROVE (T2) at the exact head, required checks passed, up to date with main. Merge
  attempt by agent 109 was held by the platform safety check pending the owner's explicit merge authorization.
- Mobile #315: dual-approved at `d9c2e669`, waits on #611 (both lenses RC B-611-1).
- Audit verdicts at current heads match the "ALL AGENTS PAUSED" table below (no new verdicts since 11:58).
- Memory holds none of the owner's preferences on this account; the repo docs are the only record. No Expo credential in
  this session yet (requested through the secure form 13:14).

- Expo credential added by the owner 13:17 (vault handle in session 7c52cefa; never in repos). Expo GraphQL 13:18:
  Android preview build `f5cac78e-c043-48ca-b5ce-3a2bc0631855` FINISHED 12:08 PDT from `ff6bd4b1`, whose tree equals
  mobile main `53447a36` (merged #316 crash fix), so it is a pushed, landed commit (unlike `14a58449`). Install link sent
  to the owner 13:19. Not yet device-verified. It still carries the old google-services.json (pre-#318) and the EAS
  FCM V1 key is still null, so Android push will not deliver on this build.

OWNER 13:19 PDT (binding): "agent budget - all 7, cautiously to prevent sandbox crashes!" / "PR's that have been audited
and are ready, check dependencies - approval to merge whats safe!" / docs.zip attached (16 files; programs fixture sha256
be932a56ae09f85e... verified). Freeze lifted: up to 7 subagents, launched staggered, heavy work serialized through
heavy.sh, disk checked every block. Standing merge authority for PRs with their tier's audits and required checks at the
exact head, after a dependency check.
- MERGED mobile #318 (Android FCM google-services.json, T2, Sol APPROVE at 7d24103b, required checks green, up to date)
  as `c4963f87` 20:20 UTC. Rung: merged (not in any build yet).
- WAVE 1 launched 13:27 PDT (7 subagents; objectives in handoffs/op-7c52cefa/lanes/; shared deps install started 13:21):
  | Lane | Model | Scope |
  |---|---|---|
  | AUD-OPUS | Claude Opus 5.5 | Opus lens: auth chain #597/#599/#595/#604, #623, #317, #624/#319 |
  | AUD-SOL | GPT-6.1 Sol | Sol lens: #622 re-audit, #317, #624/#319 |
  | B-306 | Claude Opus 5.5 | mobile #306 fix round 5 (+ signup_pending) |
  | B-FIX | Claude Opus 5.5 | #310 r4, then #608/#313 fix round |
  | B-COPY | Claude Opus 5.5 | #610/#314 block both ways (from WIP 1f4e158), then #611 B-611-1 |
  | B-R2B | Claude Opus 5.5 | R2b AI consent gateway (stacked on #622) + S07b AI-path inventory |
  | ~~B-FEE~~ | Claude Opus 5.5 | cancelled 13:37 for the P0; requeued first |
  | B-DRIFT | Claude Opus 5.5 | P0 production schema drift migration + parity gate (13:38) |
  Next wave as slots free: S-SCHED + S-REACH resume (WIP branches), #607/#609 restack onto main, #624 pending_flags,
  messaging plan, Roman grounding stack, S-MWB, Money/wizard, data export, coach brief, #305 OTA, Sentry.
- Expo: no new build started today after f5cac78e (Free plan; builds are batched). Next build after the next merge batch.

---

## #1 MASSIVE ISSUE (owner, 2026-10-01 11:29 PDT): fee math loses TGP money on every paid sale

**What is wrong.** The owner's ruling (09-30 17:53) is: the client pays the listed price; the coach's payout is the price
minus card processing minus TGP's 2%. The live checkout does not do that. `src/checkout/checkout.service.ts` creates Stripe
**destination charges** (`transfer_data[destination]` = coach's connected account) with an application fee from
`src/connect/fees/fee-policy.service.ts` = a flat **200 bps (2%)**. With destination charges Stripe debits its processing
fee from the **platform** balance, not the coach's. So the coach receives price - 2%, and TGP pays about 2.9% + 30c out of
its 2%: on a $100 sale TGP keeps $2.00 and pays about $3.20, about -$1.20 per sale. International cards, currency
conversion, refunds (Stripe keeps the original fee) and disputes ($15) make it worse.

**What already exists.** `src/payouts-v2/platform-fee.service.ts` implements the correct formula
(`coach_net = amount - platform_fee - stripe_fee`, platform_fee = 2% + 50% of rail savings for ACH), but it is wired
only into the payouts-v2 module (behind `FEATURE_BANK_PAYOUTS_V2`, OFF) and is not used by checkout.

**Impact today.** Zero dollars lost so far: no paid sales exist in production and the clinic package is free. It becomes
real the first time any coach sells a paid package.

**Fix (lane S-FEE, T4, next free slot, owner priority #1).** Make checkout use the owner's formula exactly, with TGP never
net-negative on any charge. The builder picks the Stripe mechanism with evidence, e.g. separate charges and transfers
(transfer = amount - actual `balance_transaction.fee` - 2% after the charge settles; subscriptions via `invoice.paid`) or a
fee-inclusive application fee with post-settlement reconciliation. Requirements: exact actual Stripe fee per charge,
refunds and disputes handled without TGP loss, coach-facing breakdown (price, processing, TGP 2%, net), reconciliation
tests for one-time and recurring charges and for international cards, and no change for free packages. Two independent
audits.

---

## ALL AGENTS PAUSED 2026-10-01 11:58 PDT (owner: "42.7k/45k credits used, get all agents to a safe paused place and commit their work")

Operator cancelled all six running subagents at 11:58 PDT, stopped their test processes, and committed every builder's
uncommitted work to **separate `wip/` branches** (PR heads untouched; WIP is NOT tested or audited):

| Lane | Repo | WIP branch @ commit | What is in it |
|---|---|---|---|
| S-SCHED backend | backend | `wip/op590e4a5b-s-sched-be-20261001` @ `da4e660` | Session-type migration (welcome + meeting link), seed script for the 3 appointment types, booking/reminder/open-slot changes, concurrency live test |
| S-SCHED mobile | mobile | `wip/op590e4a5b-s-sched-mob-20261001` @ `fa9959a` | Client Calendar screens (`src/screens/client/calendar/`, `src/calendar/`), tutorial Calendar step, coach appointment-types + time-off screens, push-tap routing; touches package.json/lock (expo-calendar) |
| S-REACH mobile | mobile | `wip/op590e4a5b-s-reach-mob-20261001` @ `8e8b8b0` | Coach ClientConsultationScreen + API, Home quick links, nav reachability gates, More/Workout entry points, eas.json flags |
| S-ENVTRUTH backend | backend | `wip/op590e4a5b-s-envtruth-be-20261001` @ `8bdb599` | fly-env-sync desired-state JSON + loader (`pending_flags`), env-validation, prod-switches, workflow spec (on top of pushed branch `agent/clinic/s-envtruth-backend`) |
| S-ENVTRUTH mobile | mobile | branch `agent/clinic/s-envtruth-mobile` (clean, pushed) | no uncommitted work |
| #610 block both ways | backend | `wip/op590e4a5b-copy-610-20261001` @ `1f4e158` | Two-way block read filters across community services + new `community-block-two-way.spec.ts` (on top of PR #610 head `b8ce8d35`) |
| #314 / S-OTA | mobile | none | #314 worktree clean; S-OTA (#305) not started |

Resume rule: a builder continues from its WIP branch, finishes, runs targeted tests via heavy.sh, then pushes to the real PR
branch (or opens the PR). Auditors' partial notes stay in the operator sandbox (`/home/user/workspace/audit_sol_batch/`, not
copied: contains private-repo diffs); unposted audits must be re-run.

**Audit verdicts posted before the pause (exact heads, from PR comments):**

| PR | Head | Sol | Opus | State |
|---|---|---|---|---|
| backend #607 | `245da2e7` | APPROVE (18:26Z) | APPROVE | **Dual-approved, merge-eligible after CI check** |
| mobile #315 | `d9c2e669` | APPROVE | APPROVE | Dual-approved; ships with/after #611 |
| mobile #318 | `7d24103` | APPROVE (T2) | n/a | **Merge-eligible** |
| backend #622 | `fcb984f2` | (RC at old head 02c7187d) | APPROVE | Needs Sol re-audit at fcb984f2 |
| backend #623 | `4cc366fc` | APPROVE | not posted | Needs Opus at 4cc366fc |
| mobile #317 | `c7e35d84` | not posted | not posted | Needs both |
| backend #608 | `b0beb076` | **RC**: B-608-9 (#622 AiProcessingConsent survives tombstoning, `account-deletion.manifest.ts:645-649`), B-608-10 (auth cleanup destroys completion signal; pairs with B-313-5), B-608-3 partial (running export can recreate health bytes after finalization) | not posted | Fix round needed |
| mobile #313 | `11016305` | **RC**: B-313-5 (completion UX unreachable after normal backend cleanup) | APPROVE | Fix round (with #608) |
| backend #611 | `ced10667` | **RC** B-611-1 (community-AI purpose text ≠ implemented) | **RC** B-611-1 (two published claims not yet true in prod; fix is operator evidence, `trust-pages.html.ts:190,369`) | Fix/evidence round |
| mobile #310 | `c9fc931d` | **RC** B-310-3 (untick during in-flight grant lost — privacy), B-310-4 (shutdown between completion and reveal skips tutorial handoff) | **RC** B-310-3 | B-310-1/2 closed; fix round 4 |
| backend #597/#599/#595/#604 | see above | APPROVE (all four) | not started | Needs Opus second lens |

## OWNER VERDICT 2026-10-01 13:00 PDT (binding): DO IT RIGHT OR FAIL; MESSAGING PLAN APPROVED, ALL DAY 1

- Bradley: "the plan above is great - I want the best of both worlds, none of the bad, and then even more functionality,
  all on day 1 - get this put into documentation as approved." and "WE DO IT RIGHT, EVERYTHING DONE, OR WE FAIL. NO SHIPPING
  HALF ASSED SOFTWARE. thats the verdict".
- **Release rule:** submission and go-live happen only when everything in launch scope meets the hyperscaler bar. The Sat
  10-03 submission and Wed 10-07 go-live dates are **no longer fixed**; they move to whenever the bar is met (owner's
  answer to the A/B question = A). No partial binary, no "finish it over the air" for unfinished scope. The clinic
  partner is informed by Bradley (operator never contacts the partner).
- **APPROVED: TGP messaging = hybrid "Skool structure + Telegram-grade chat", everything on day 1:**
  1. **One inbox:** coach-client 1:1 = `CoachMessage` (live system); community DMs off; every 1:1 in one place.
  2. **Community core on** (after device pass): Hall, cohorts (All clinic patients + one per program + coach-defined
     groups), posts, chat, threads, reactions, realtime, push, moderation queue (24-hour commitment), "coach saw this"
     acks, plan-anchored messages.
  3. **Keep and turn on the June extras** once each passes a device pass: events with RSVP/live/replay, classroom drip
     lessons, challenges and wins, polls, wearable prompts, search, voice notes, AI triage.
  4. **Photos** in DMs and community (T4: progress/health photos, storage, privacy, moderation, deletion/export).
  5. **Telegram polish everywhere** (DMs and groups): reactions (full emoji picker, not a tiny allowlist), swipe-to-reply
     and quotes, typing and presence, per-member read state, @mentions, pins, mute, edit/delete, message search,
     unread badges, push deep links, fast optimistic send, offline queue.
  6. **Broadcasts:** coach-to-many announcements with push, **segments** (package, program, cohort, tag, signup date,
     last active, risk), **scheduled and recurring** sends.
  7. **Rich cards in chat:** workout, meal plan, booking link (Calendar), package/payment link, check-in form.
  8. **Roman in the inbox:** priority triage + a reply draft for every unread message (coach approves/edits), feeding the
     daily brief; box-2 consent gate (R2b).
  9. **Blocking hides content both ways; report on every message/post; client privacy** (first names to other members;
     leave/mute any space).
  10. **"Even more functionality":** the next operator must bring additional ideas (IDEA format) that beat Telegram/Skool
      for coaching (e.g., saved replies UI on `MessageDraft` snippets, office-hours threads, quiet hours, translation).
- Grading: every slice T3+ (realtime/contracts) and T4 where it touches photos, PII, consent, blocking or deletion.

## MESSAGING DEEP DIVE (operator 13:10 PDT, code on main, no device pass) + owner 12:57 "Bank decision is fine"

- **Bank: confirmed** (Stripe Express collects the bank; wizard step "Add your bank to get paid"; payouts-v2 after S-FEE).
- **Three separate message systems exist:** (1) coach-client DMs (`src/messaging`, `CoachMessage`: text, voice notes,
  read_at, unread count, reports, blocks, coach review, AI-drafted messages via the AI gateway `send-notification`
  materialiser with coach approval (`PendingAiDraftsScreen`), saved drafts/snippets `MessageDraft`); live in prod (not
  behind community flags). (2) Community v1 (June build, all flags OFF in prod): per-coach workspace; hall + cohorts
  (groups with capacity/dates); roles coach/assistant/student; member mute/remove; cohort chat + community DMs
  (`dm_key`); threads (`parent_message_id`); messages tagged to plan context (workout/week); coach seen/acked/replied
  ("coach saw this" chips); posts (text, lesson, replay, poll, win; pinned; scheduled release/expiry; media asset);
  emoji reactions (small allowlist); events with RSVP/live/replay; challenges; classroom drip lessons with media; wins;
  search (posts, lessons, voice transcripts, events); moderation queue/actions; AI triage (classify only); wearable
  prompts; Supabase Realtime broadcast; push; voice notes (separate flag). Mobile: Community tab (Today, Hall,
  Challenges, DMs) + 15 client screens, 8 coach screens. Style: deliberately Skool-like "anti-Slack" (few fixed spaces,
  coach-led, plan-anchored), per COMMUNITY_PRODUCT_PLAN (06-02). (3) Legacy `Message` model + Roman chat.
- **Missing vs the Telegram-style goal:** photos/images in any chat (no image picker anywhere); reactions and swipe-reply
  on coach DMs; typing/presence; @mentions; per-member read state in groups; segmented broadcasts (package, program, tag,
  last active) and scheduled messages; rich cards for booking/payment; one unified inbox (coach DMs vs community DMs are
  two places); AI reply drafts for every unread message (only churn win-back drafts and gateway drafts exist; correction
  to the 12:58 "no reply drafts" note).
- **Better than the 12:58 plan:** plan-anchored messages, coach acks, events with RSVP/replay, classroom drip lessons,
  challenges/wins, wearable prompts, AI triage, moderation queue.
- **Operator recommendation (owner to confirm):** one inbox (canonical 1:1 = `CoachMessage`; community DMs off for v1.0);
  turn on community core (hall, cohorts, posts, messages, reactions, realtime, push, moderation, acks) after a device
  pass; add photos to DMs and community (T4: health/progress photos, storage, moderation); reactions + swipe-reply +
  typing on DMs; broadcast = hall announcement + push, cohort = segment for v1.0; Roman drafts + triage in the coach inbox.
  Later: mentions, scheduled/segmented broadcasts, booking/payment cards.

## OWNER DECISION 2026-10-01 12:55 PDT: NO CLIENT-ONLY FALLBACK; QUALITY BAR = HYPERSCALER

- Bradley: "we cannot take a client only path - who would coach day 1 clients? Whats the purpose? I can be promoted server
  side sure, but, id rather build the saas product right before im at 100k ARR and 100 clients revolving! DAY 1 BLOCKER
  MEANS ANYTHING SUB-HYPERSCALER QUALITY!"
- **D4 fallback is cancelled.** Role choice (backend #597 chain + mobile #306) and the coach path (setup wizard with
  "Add your bank to get paid", first package, invite, Money command center) are **must-ship for day 1**.
  `SIGNUP_ROLE_CHOICE_ENABLED` must be ON at launch; Fri 10-02 12:00 is no longer a fallback trigger.
- **Definition of a day-1 blocker: anything below hyperscaler quality** on a launch surface (client or coach): broken,
  fake, dead-end, confusing, slow, untrustworthy money, unverified on device. Graders apply this bar to every launch PR.
- Consequence (operator): with agents paused for credits, the bar now outranks the Sat 10-03 submission date. Open owner
  question: slip submission until the bar is met, or submit what meets the bar and finish JS-only work over the air.

## OWNER DECISIONS 2026-10-01 12:51 PDT + COACH-SIDE STATIC CHECK (operator 12:58)

**Decisions (binding):**
- **Roman sees client data in v1.0** (overrides D1 "scripted only"): "a super intelligent butler, coach's assistant, and
  helper agent all-in-one". Needs R2b (AI consent enforcement: no client data to the AI without a live box-2 grant) and
  the Roman grounding stack (#598/#601/#602/#603/#605) back on the critical path; T4 dual audits.
- **Roman approve-to-adjust** ("Sarah's recovery dropped, cut tomorrow's volume 15%, approve, sir?"): today OFF and has no
  brain (only deterministic coach prompts, `src/community/wearable-prompts/`, "consider a check-in"). To-do: build the
  brain (wearable trend + training load → proposed change to the next workout), coach Approve/Edit/Dismiss that applies
  the change through the workout builder, audit trail, box-2 gate; fix, audit (T4), then flip on.
- **Wearables on day 1:** fix (#623/#317), audit, then flip FEATURE_WEARABLES_INGEST_POST and
  FEATURE_COMMUNITY_WEARABLE_PROMPTS (and wire the orphaned coach prompts screen). All other launch flags on per ledger.
- **Earnings screen dead = v1.0 blocker.** Money = one "command center" page swallowing Business metrics (TO-DO 2).
  Lazy-dev note: `src/screens/coach/command-center/` (Overview, Inbox, ActionQueue, AtRisk, WinStreaks) already exists,
  is barely reachable and has a mock-data switch (EXPO_PUBLIC_USE_MOCK_COMMAND_CENTER): reuse it as the Money/Business
  command center instead of building a new page.
- **Coach setup wizard (steps 2-5 hollow, no Stripe button) = day-1 blocker** (overrides "only if role choice ships").
  Dependency: coaches can only reach it if in-app coach signup ships (#597 + #306, D4). Open owner question: is role choice
  now must-ship (no client-only fallback)?
- **Dunning v2 ON + Stripe customer portal tested end to end** before launch. **"Download my data" fixed** (storage, not /tmp).
- Fee fix (#1) and $19.99 minimum: confirmed in S-FEE.
- **Coach daily brief:** luxury, Roman-powered, once a day, "turn scattered info into highlights" ("Sir, we collected $x
  last night. Sarah and 2 others messaged you. I have response drafts made. Good morning").
- **Client list/detail:** easy search; tap into a client; see data, score, logs, wearables, billing; key info easy to find.
- **Programs:** assign to specific clients + robust master workout builder + auto-assign options (TO-DO 6).
- **Community = Telegram-style system** (spec below).

**Coach-side static check (code on main; no device pass):**
| Area | What exists | Gaps for v1.0 |
|---|---|---|
| Client list | `ClientsListScreen`: search box + status filter | No score/sort by risk or last active visible in list; unverified on device |
| Client detail | Tabs: Summary, Timeline, Workouts, Progress, Meal plan, Food-log review, Health & Fitness, Sleep & Recovery, Weekly summary, Nudge; risk/insight screens exist separately | **No billing on client detail**; consultation answers only in S-REACH WIP; wearables AI panel hidden; "score" lives on separate Risk/Insight screens |
| Assign programs | Per-client `CoachWorkoutBuilderScreen`; AI workout/meal drafts screens | Templates tab hard-coded; MWB library off; auto-assign = clinic #607 rule table only |
| Coach brief | **Built**: backend `src/coach/brief/` calls Anthropic, daily cron (COACH_BRIEF_CRON), push (COACH_BRIEF_NOTIFICATIONS_ENABLED), inputs: check-ins, missed check-ins, workouts pending approval, paid today + revenue, dunning, flagged weights, unread messages, prioritized action items with deep links; mobile `CoachBriefScreen` (flag on in clinic profile) | **No reply drafts** (nothing generates message drafts); **no consent gate** (client names/details go to Anthropic without a box-2 check = R2b); COACH_BRIEF_ENABLED on Fly unverified; tone not yet "butler" |
| Check-in review | Backend `coach-check-ins.controller.ts`; check-ins surface in Home/Brief/Insight/Risk | **No dedicated coach check-in review screen** |
| Booking inbox | `CoachBookingInboxScreen` (S-SCHED WIP touches it) | Device pass |
| Packages | List/Edit/Contents/Subscribers screens | 50c minimum (S-FEE); program attach UX unverified |
| Stripe connect | `CoachConnectScreen` works (/v1/connect/accounts/*); Stripe Express collects bank + ID | Wizard has no Connect step |
| Direct bank | payouts-v2 `payout-method` (Financial Connections / us_bank_account), FEATURE_BANK_PAYOUTS_V2 off | **Operator recommendation: no separate bank path in v1.0.** Stripe Express already asks for the bank account; frame the wizard step as "Add your bank to get paid (secured by Stripe)". Payouts-v2 later (ACH savings) after S-FEE. |

**Community: Telegram-style coach system (refined goal state; operator proposal 12:58, owner to confirm):**
- *Spaces:* (1) **1:1 DMs** coach-client (exists); (2) **Groups** coach + a few (small cohorts, couples, accountability
  pods); (3) **Broadcast channels** coach to many (announcements, one-way with reactions/comments, scheduled and recurring);
  (4) **Community boards** (topic threads, pinned resources/classroom, e.g. one board per program and one for all clinic
  patients; exists as hall/cohorts).
- *Telegram basics (day 1 where code exists, else OTA fast-follow):* realtime delivery, replies/quotes, reactions, photos,
  read state, typing, @mentions, pins, mute, search, push with deep links, unread badges, block/report both ways.
- *Coach superpowers:* **unified priority inbox** with Roman triage and reply drafts; **segments** (package, program, tag,
  signup date, last active, risk) for targeted broadcasts; saved replies; **rich cards in chat** (workout, meal plan,
  booking link, payment/package link, check-in form); voice notes; office-hours threads; polls; quiet hours; moderation
  queue with the 24-hour commitment.
- *Client side:* simple: Coach (DM), My group(s), Announcements, Boards; first names only to other members; leave or mute
  any space.
- v1.0 must-haves: DMs, clinic spaces (all patients + per program), broadcast announcements, push, unread, block/report.

**Added to TO-DO (owner 12:51):** 20 Roman sees client data (R2b + grounding stack, T4); 21 Roman approve-to-adjust brain +
coach approve UI (T4); 22 wearables fix-audit-flip incl. wearable prompts screen; 23 coach brief: reply drafts + butler
tone + box-2 gate + verify COACH_BRIEF_ENABLED/cron on Fly; 24 client detail billing + score + consultation answers;
25 coach check-in review screen; 26 Telegram-style community (spec above; v1.0 must-haves first); 27 Money command
center reusing `command-center/`; 28 coach wizard day-1 (Stripe "add your bank" step); 29 dunning v2 + portal E2E test;
30 data export to storage.

## V1.0 QUALITY COVERAGE GAPS (owner question 12:34 PDT; operator answer 12:40)

Nothing below has had a device pass. 108's checks were code reading, live route probes and PR audits (auth, onboarding,
consent, deletion, privacy pages, wearables ingest security, money static audit, MWB, scheduling, reachability sweep, keys).
**Never checked for v1.0 quality:** client food logging (core clinic need: "track food"), workout logging
(`ActiveWorkoutScreen`), progress/check-ins/habits/fasting, coach-client messaging UX, community chat UX, health/sleep
screens UX, Roman tutorial on device, notification content/timing, accessibility/performance/offline; coach roster and
client detail, program assignment, messaging inbox, **community moderation queue (24-hour commitment)**, coach brief,
check-in review, booking inbox, package creation, Stripe Connect on device.

Owner questions and current answers:
1. **Community/messaging "Discord/Telegram level"?** No, and unverified. The community API is OFF in prod (no
   FEATURE_COMMUNITY_* on Fly). Code signals (grep, not proof): replies/threads and unread counts exist; reactions,
   read receipts, typing, media attachments and mentions are thin (1-4 files each); voice notes off; block-both-ways
   unfinished (WIP branch). Goal: realtime delivery, replies, reactions, photos, mentions, read state, push, mute, pin,
   search, coach moderation tools, on both sides. Needs a UX audit + device pass.
2. **Wearables / Roman suggestions?** Screens exist and are ambitious (recovery ring, HRV, sleep stages, freshness,
   empty states). Not live: #623 (Sol APPROVE, Opus pending), #317 (unaudited at new head), ingest flag off. Roman does
   NOT see wearable data in v1.0 (D1 scripted Roman; wearables AI panel hidden; R2b consent enforcement not built).
   "Sarah's recovery dropped, cut tomorrow's volume 15%, approve?" does not exist. Closest: backend wearable prompts
   (`src/community/wearable-prompts/`, deterministic, coach-facing, "recovery score dropped 12%, consider a check-in",
   with sample audit trail), flag FEATURE_COMMUNITY_WEARABLE_PROMPTS off and its coach screen orphaned. IDEA logged:
   v1.0 = wire + flag the deterministic prompts (no AI; coach sees health data under consent box 1); 1.0.1 = Roman
   approve-to-adjust (edits the next workout's volume on coach approval; needs R2b, T4).
3. **Coach business logic robust?** Not for paid coaching yet: fee math loses money (#1 issue), Earnings screen dead
   (6 routes 404), no Money page, 50c minimum, hollow coach wizard, dunning v2 off and Stripe portal unverified, data
   export to /tmp, deletion fix round open (#608/#313). The free clinic path (#599 attach, #595 free grant) is Sol-approved
   and waits for the Opus second lens.

Recommended when credits return: one quality-sweep agent (or Bradley with a checklist) on the daily loop first: food
logging, workout logging, messaging, community; then wearables connect, then coach roster/moderation.

## RUNNING SUBAGENTS AT 11:45 PDT (superseded by the 11:58 pause above)

No new agents, audits or fix rounds start after these finish. Each result is recorded in the table below as it lands.

| Agent | Doing | Result (filled in as they finish) |
|---|---|---|
| S-ENVTRUTH builder (`build_env_truth_lane_s_envtruth_mupsdfmw`) | Backend env registry + code-invariant test + in-machine Fly classifier + fly-env-sync manifest (secrets + `pending_flags` for day-1 flags incl. GOOGLE_CLIENT_IDS, community core, MWB, dunning v2, BOOKING_REMINDERS_ENABLED); mobile PR (Stripe key name, expected-env manifest, legacy gradle guard); APPLE_AUDIENCES / Android fingerprint shape checks | pending |
| S-SCHED builder (`build_client_calendar_scheduling_s_sched_muptmf0r`) | Client Calendar tab, booking from coach appointment types, expo-calendar "Add to my calendar", coach appointment-types manager, tutorial Calendar step + "Book your welcome call" ending, seed path | pending |
| S-REACH builder (`build_feature_reachability_s_reach_mupv615k`) | Reachability map of all routes, wire working features, hide broken ones, coach view of consultation answers | pending |
| Copy builder re-queued (`build_approved_copy_into_610_314_611_315_mupsmoh7`) | (1) #610/#314 block hides content both ways; (2) S-OTA: #305 expo-updates onto main + clinic channel | pending |
| Sol audit batch (`sol_audit_batch_310_318_611_315_607_313_mupun3a9`) | #310 c9fc931d, #318, #611/#315, #607 CI re-check, #313, #608 b0beb076, #623 4cc366fc / #317 c7e35d84 | pending |
| Opus audit batch (`opus_audit_batch_310_622_611_315_mupunpyq`) | #310 c9fc931d, #622 fcb984f2, #611/#315, #608 b0beb076, #623/#317 | pending |
| Sol auth-chain audit (`sol_audit_auth_chain_597_599_595_604_mupv8r43`) | #597 e3167fe7, #599 7b496aca, #595 e1dd4c39, #604 21ffc02c | **DONE 11:50 PDT — all four APPROVE** (CI 9/9 required green each). #597: A-597-1 closed (identities never deleted, `auth.service.ts:547-594`), Opus B-597-2 closed (password proof or 409 `signup_pending`, `:548-564`); HMAC adoption marker, provider paths, role flag: no new findings ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/597#issuecomment-5938186713)). #599: patch-identical rebase; optional C-599-1 (#607 vs #599 invite attach: keep conditional student/null-coach attach, `invite-codes.service.ts:764-766` vs #607 `:593-604`) ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599#issuecomment-5938187306)). #595: B-595-1 closed (`invite-grant.service.ts:491-510,973-1024`); optional C-595-1 README SQL fallback ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595#issuecomment-5938187866)). #604: rebase + test mock only ([comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604#issuecomment-5938188720)). Limits: Redis cases skipped locally, DB races staged not live, one Prisma ENOSPC during the disk incident. Evidence: `/home/user/workspace/sol_auth_r4_findings.md`. **Still needs the Opus second lens (T4) — not started per owner 11:39.** |

Not covered by any running agent (owner go needed later): Opus second lens on the auth chain; #306 r5 (D4: if not dual-approved by Fri 10-02 12:00 PDT, launch is client-only and SIGNUP_ROLE_CHOICE_ENABLED=false); audits of #609/#312; every TO-DO item above (fee fix, MWB Programs, Money, billing placement, coach wizard, R2b).

**Sandbox incident 11:38 PDT:** root disk hit 99% (290 MB free) from 64 agent worktrees (5.3 GB) and caches. Operator removed 23 stale worktrees of finished lanes (all clean and pushed; one probe diff saved to `ops/build-306-r3probe-uncommitted.diff`), pruned git worktree metadata and cleaned the npm cache. Disk is back to about 17% free (3.5 GB); 14 more finished-lane worktrees removed 11:52. Successors: remove worktrees of finished lanes promptly.

---

## TO-DO (owner, 2026-10-01 11:29-11:36 PDT), with explanations, decisions and goal state

**Agent rule (owner 11:36):** "don't use more agents, just note the to-do's and decisions in the last_operator_state
document (with context and goal state mentioned)". So: no new subagents for this list. Agents already running finish
their work. Each item below says what is wrong, what the owner decided, and what done looks like. Builder objectives that
are ready to hand to an agent when the owner says go: `/home/user/workspace/ops/lanes/S-FEE_objective.md`,
`/home/user/workspace/ops/lanes/S-MWB_objective.md` (operator sandbox; contents summarized below so they survive).

1. **Coach Earnings screen is broken (must fix).** `src/screens/coach/CoachEarningsScreen.tsx` reads six routes from backend
   PR #216 (`GET /v1/coach/earnings`, `/v1/coach/payouts/readiness`, `/v1/coach/payouts`, `/v1/coach/reconciliation`,
   `/v1/coach/refunds`, `POST /v1/coach/dashboard-link`). #216 was closed and never merged, so all six return 404 in
   production (operator probes 11:20 PDT). The screen treats 404 as "not set up", so a coach always sees "Connect Stripe"
   and "Earnings will appear once paid", even after connecting and being paid, and "Open Stripe dashboard" fails. Live
   routes that hold the real data: `GET /v1/coach/payments/earnings`, `GET /v1/coach/payments/purchases`,
   `GET /coach/connect/{status,metrics,payouts}`, `POST /v1/connect/accounts/dashboard-link`. Fix: fold Earnings into the
   new Money page (item 2), wired to live routes; retire the dead calls.
2. **TGP Money (owner concept: the coach's CFO summary) — DECIDED 11:36.**
   - Owner decisions: Money is a **card on the coach Home screen that expands into full page(s)** when tapped; **Business
     metrics and Money merge** into one coach money area (no separate Business metrics screen).
   - Context: today money is split across Settings > Payments > Earnings (broken, item 1), Business metrics
     (`CoachBusinessMetricsScreen`: Revenue 30d, MRR, active clients, churn 30d, acquired/churned, packages, recent payouts;
     reads live `GET /coach/connect/metrics` and `/coach/connect/payouts`) and the Stripe dashboard.
   - Goal state: Home card shows net to you (30d) plus a red "needs attention" count when any payment failed. Tapping opens
     Money: (1) Net to you with Today / 30d / 90d / YTD chips and change vs previous period; tap any amount for the
     breakdown price - card processing - TGP 2% = net. (2) Needs attention (only when non-empty): failed payments per client
     with dunning status (retry n of m, next retry date, card-update link sent), disputes, Stripe requirements due, with
     "Message client". (3) Next payout amount and date. (4) Recurring: MRR, paying clients, churn 30d, new clients 30d
     (from Business metrics). (5) Recent charges (last 5, See all with paid/failed/refunded filter). (6) Footer: Payout
     settings (Stripe dashboard link, per the 09-30 ruling), Packages, Export CSV for taxes. Per-client billing stays on the
     client detail page; Money links to it. The old Earnings and Business metrics routes redirect to Money. Every number
     comes from live routes (no 404-driven fake empty states); a real empty state only when the coach has no charges.
3. **Package minimum price.** Code allows 50c (`src/packages/packages.service.ts:543`). Owner rule: $19.99 minimum or
   free. Enforce in backend validation and in the mobile package editor (clear inline message). Rides with S-FEE as a
   separate T3 PR.
4. **Card update and billing management placement (client).** Today: More > Membership > Packages > Update card (three
   levels down, under "Membership"). Operator recommendation (sent 11:50, research-based; owner has not objected):
   - Goal state: a top-level "Billing & payments" entry in the client profile/More showing card on file, next charge date
     and amount, receipts, Update card and Cancel; the same card + next charge on the package card; a Home banner and a push
     when a payment fails or the card expires within 30 days; every entry opens Stripe's customer portal directly on the
     update-card flow (`flow_data[type]=payment_method_update`, https://docs.stripe.com/customer-management/portal-deep-links);
     dunning emails link to the same flow. Competitor note: Trainerize clients can only update billing on the web.
   - Owner-side Stripe check: customer portal enabled in live mode (https://dashboard.stripe.com/settings/billing/portal);
     required before FEATURE_DUNNING_V2 goes on.
5. **Coach onboarding = the coach "aha" (owner).** The aha is: 1) connect Stripe or bank, 2) invite a client, 3) receive the
   first client payment. The current coach wizard (`src/navigation/CoachWizardNavigator.tsx`) steps 2-5 have no inputs and
   step 5 has no Connect button. Rebuild: practice basics, then "Get paid" (Stripe Express hosted onboarding, which collects
   the bank account and ID; bank-first framing via Financial Connections when payouts-v2 is on), then first package
   (prefilled, $19.99+ or free), then invite first client (link/QR share), then a Home checklist that ends with the
   existing first-payment celebration (`FirstPaymentWowHost`, flag `EXPO_PUBLIC_FF_ROMAN_FIRST_PAYMENT_WOW`, off).
   Lane S-MONEY (mobile).
6. **Master workout builder — owner direction 11:31: "non-client specific, overreaching master workout builder system —
   'I give every male an intro package, let me build it once, save it, and use it for everyone + auto-assign tools'".**
   - Context: the coach "Templates" tab (`ProgramTemplatesScreen`) is four hard-coded text protocols applied as text
     guidelines. The single-workout builder (`CoachWorkoutBuilderScreen`) opens only from one client's page; no library of
     saved workouts. The backend was built in June and never switched on: MWB-1 data model (#376: WorkoutProgram with
     weeks x days_per_week, templates, forks, revisions; WorkoutPlan rows carry program/week/day), MWB-2 templates +
     clone-to-client (#381, FEATURE_MWB_TEMPLATES), MWB-3 autosave + undo (#386, FEATURE_MWB_AUTOSAVE_UNDO), MWB-5 AI
     live-create (#385, FEATURE_MWB_AI_LIVE_CREATE), named regimes (`/coach/regimes`, FEATURE_NAMED_REGIMES). Package
     contents already accept `workout_program` and fan out on purchase/grant, so "attach a program to a package" already
     means auto-assign on join (verify it also fires for $0 invite-code grants, #595).
   - Goal state (Phase 1, day 1): a coach "Programs" tab replacing Templates: program library (search, goal tag, weeks x
     days, assigned count); create/edit with a week-by-day grid where each day opens the existing workout builder with
     autosave + undo; duplicate, archive, revision history, promote to named regime; assign to many clients at once (clone
     per client with a start date, idempotent); "Add to package" so everyone who joins gets it; a saved-workouts library.
     Backend flags above ON at day 1 (AI live-create waits for item 9). Clinic's #607 rule-table path keeps working.
   - Phase 2 (after go-live unless owner pulls it forward): coach-defined auto-assign rules ("joins package X and matches
     intake answers Y → assign program Z starting next Monday"), generalizing #607's clinic rule table; uses
     health-adjacent intake answers → T4 + D2 review.
7. **Expo plan: stay on Free (owner, 11:29 PDT).** No upgrade; accept the slow build queue. Batch builds: one clinic iOS
   build + one Android build for the Saturday binary, no exploratory rebuilds.

8. **Feature flags live on day 1 — owner 11:31-11:32: "yes all of that is supposed to be active and live on day 1".**
   - Context: none of FEATURE_COMMUNITY_* exists on Fly, so the community API is gated off in prod while the clinic mobile
     profile turns the Community tab on — the community chat step of the guardrail flow would fail. MWB flags and
     FEATURE_DUNNING_V2 are also off. Ledger with per-flag gates:
     [FLAGS_LAUNCH_LEDGER.md](FLAGS_LAUNCH_LEDGER.md).
   - Goal state: community core set, FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO, FEATURE_NAMED_REGIMES,
     FEATURE_DUNNING_V2 and BOOKING_REMINDERS_ENABLED ON in prod before Wed 10-07, set through the audited fly-env-sync
     manifest (`pending_flags` block requested from the S-ENVTRUTH builder 11:50), each verified on the owner's account right
     after it flips. Gates: #610 report/block deployed before App Review touches community; Stripe customer portal live
     before dunning v2. Stay OFF: Roman live chat (D1), bank/treasury payouts (until item 0 fee fix), Google Calendar/Meet/
     Zoom, importer (Bucket B), wearables AI panel.
9. **R2b — AI consent enforcement in the AI gateway (blocks MWB AI live-create on day 1).** The MWB-5 materialiser is
   client-specific (`target_client_id`), so it sends client data to the AI provider. Under D2 (box 2) and WA My Health My
   Data, every AI call with client data must check the client's live box-2 grant in the #622 ledger. Goal state: gateway
   refuses (clear coach-facing reason) when the client has no live grant; tests; T4 dual audit; then flip
   FEATURE_MWB_AI_LIVE_CREATE. Template authoring with no client data could be allowed without consent (design note).
10. **Fee fix (item 0 above, lane S-FEE) and $19.99 minimum (item 3).** Objective file ready (see agent rule). Goal state in
    the #1 MASSIVE ISSUE section.
11. **Coach setup wizard rebuild (item 5)** — needed day 1 only if role choice ships (D4: #597 + #306 dual-approved by Fri
    10-02 12:00 PDT); otherwise 1.0.1.
12. **Waiting audits and fix rounds that need an agent when the owner allows one** (state 11:58 PDT): Opus re-audit of the
    auth chain #597 e3167fe7 / #599 7b496aca / #595 e1dd4c39 / #604 21ffc02c (Sol is auditing now; T4 needs both); #306 fix
    round 5 (Sol B-306-1/2/3, Opus B-306-1, C-306-1..3, plus the new 409 `signup_pending` message "check your email or reset
    your password"; D4 deadline Fri 12:00); audits of #609/#312 (welcome message + reminders); Sentry native init; data
    export to Supabase storage; C04 bootstrap after the owner signs up; C11 store package + iOS clinic build.

---

## 1. Where we are, in plain words

- **Mission:** the clinic partner (a West Washington medical group; name kept out of repos) sends patients to TGP
  through a QR code. App Store submission is **Sat 10-03**; clinic go-live is **Wed 10-07**.
- **Guardrail flow (owner):** QR code -> App Store download -> consultative personal-trainer onboarding -> auto-attach
  to Bradley as coach -> auto-grant of Bradley's free package -> auto-assign one of three workout plans -> Roman's
  hands-on tutorial (plan and macros, community and messaging the coach, wearables and health/sleep data) ->
  teach-back. **New 10-01:** the tutorial also introduces the Calendar and ends with "Book your welcome call".
- **State of the build:** every launch-critical slice has a PR. Most are in fix rounds after dual audits. Nothing on
  the Bucket A critical path is merged except mobile #316 (crash fix) and backend #606 (macros). Production backend
  still runs `bffae5f3` (C02). No working Android build exists yet: build `f5cac78e` (with the crash fix) is still in
  Expo's Free-plan queue.
- **Biggest risks right now:** (1) audit throughput: about 20 PRs need dual audits before Fri noon with a hard cap of
  7 subagents; (2) the backend auth stack (#597 chain) is still blocked by two must-fix findings; (3) the newly
  scoped Calendar section (S-SCHED) and feature-reachability work (S-REACH) are large and landed late; (4) no device
  pass has happened on any new code.

---

## 2. What happened since the last update (2026-09-30 03:32 UTC -> 2026-10-01 10:55 PDT)

1. **09-30 morning: change of gears.** At 10:48 PDT the owner paused the importer (Bucket B) and switched to the
   clinic launch (Bucket A). Session c712e04d became the Bucket A operator at 16:32 PDT EXECUTE.
2. **09-30 afternoon/evening (c712e04d):** owner rulings on positioning (personal training only), role choice at
   signup (R-ROLE-CHOICE-1), 2% take rate and 3.1.3(d) payments posture, Roman privacy (chats never visible to
   coaches), age 16+, Roman's canonical face, model routing T0-T4, 8-agent hard cap. Merged mobile #303, #304, #307,
   #308, #311; deployed backend C02 `bffae5f3`. Built Android APK `14a58449` (later found to come from an unpushed
   commit; never ship it). c712e04d went silent around 19:10 PDT; its unpushed working files are lost.
3. **10-01 08:28: EXECUTE to 590e4a5b.** Readback written; the owner didn't answer D1-D4, so the operator's stated
   defaults apply (section 4). Owner supplied the coach welcome text (runtime data; never committed).
4. **09:07-09:11 approvals:** three workout programs; D2 two-box consent copy; community guidelines incl. new rules 5
   and 7; safety contact Bradley@Bradleytgpcoaching.com; 24-hour moderation commitment; consumer-health Consent
   section rewrite. Owner created the Sign in with Apple key and saved `APPLE_SIGNIN_KEY_ID` /
   `APPLE_SIGNIN_PRIVATE_KEY` as backend GitHub Actions secrets.
5. **09:15-09:51 Android launch crash (tier-1).** The owner's APK closed instantly. Root cause from the owner's
   logcat: `crisp-sdk-react-native@0.2.1` used the legacy `ExpoModulesCorePlugin.gradle` path under Expo SDK 56 and
   threw `UnsupportedOperationException: reified type parameter` while the Expo module registry was built. Fix:
   mobile #316 (bump to 0.4.3, surgical lockfile), Opus APPROVE, **merged `53447a36`**. New build `f5cac78e` queued.
   Also found: MainActivity never set the Health Connect permission delegate (fixed in S14 #317 via a config
   plugin), and Sentry native auto-init is off, so crashes before JS starts are invisible (follow-up).
6. **09:51-10:01 env truth audit (owner tip).** Systematic check of every env name read by code vs Fly, GitHub and
   EAS. Findings in section 5. Lane S-ENVTRUTH builds the registry, invariant tests and a Fly sync workflow.
   A setup guide for every missing key was delivered to the owner (shared asset "TGP Missing Keys Setup Guide").
7. **10:01-10:36 Google sign-in on day 1 (owner override).** The owner set up Google Auth Platform in project
   `project-2c2ffa46-a1eb-4f5c-b68` (branding with privacy/terms/help URLs on app.trygrowthproject.com, published
   to production), created a Web client `963513798354-b1si2i5t238kmq2jh572kvirtrnv9oee.apps.googleusercontent.com`,
   put it in the Supabase Google provider (replacing an older client `817435020365-p51g...`, now retired), and added
   `tgp://auth/callback` to Supabase redirect URLs. Operator verified Supabase now redirects with the new client and
   Google accepts it, then set GitHub secret `GOOGLE_CLIENT_IDS` (17:38 UTC). It reaches Fly through the audited
   S-ENVTRUTH sync workflow; until then `/auth/signup-policy` still hides Google.
8. **10:20-10:45 audit wave results** (section 6): Opus approved #316, #599, #595, #604, #606, #607, #622; requested
   changes on #597, #306, #310. Sol blocked #597 chain, requested changes on #607 (CI gap), #622, #623, blocked #317.
   **#606 merged `be667142`** (Sol + Opus APPROVE). Retargeted stacked PRs were closed/reopened to run full CI.
9. **10:37-10:44 scheduling and reachability (owner).** The owner pointed out TGP must be a superior replacement for
   Google Calendar. Operator found native scheduling is fully built in the backend (appointment types, availability,
   time off, open slots, booking lifecycle, 24h/1h reminders) and coach-side screens exist, but **client booking
   screens are orphaned** (no entry point). A static sweep found **34 of 170 app routes with no visible pathway**.
   The owner called it a huge gap and directed: a dedicated client Calendar section, a Roman tutorial step, "Add to
   my calendar", and a pre-launch reachability fix for every critical feature.

---

## 3. Owner decisions this session (binding)

| Time (PDT) | Decision |
|---|---|
| 08:28 | EXECUTE for everything workable under the agent rules and PR grading contract. |
| 09:07 | Workout plans approved. D2 consent copy, community guidelines (rules 5 and 7), safety email, 24-hour moderation, consumer-health Consent rewrite approved. |
| 10:01 | **Google sign-in on day 1** (overrides the operator's email + Apple ruling). Done on the Google/Supabase side; Fly pending. |
| 10:01 | Every missing key gets filled; alert the owner when the new APK build finishes. |
| 10:37 | TGP's **native scheduling is the product**; Google Calendar sync is not a dependency. |
| 10:39 | **Every critical feature must have a pathway in the UI before launch** (reachability). |
| 10:40 | Client gets a **dedicated Calendar section**: their coach/coaches, calendars and open slots, booking from each coach's approved appointment types. Agents should bring superior ideas to the owner. |
| 10:40 | **Roman tutorial step** after "how to message your coach" introducing the Calendar. |
| 10:41 | **"Add to my calendar"** (device calendar, Apple or Google, no account linking). |
| 10:44 | Tutorial **ends with "Book your welcome call with <coach>"**. |
| 10:44 | Day-1 appointment types: Quick initialization 15 min; Quick Q/A Call 20 min; Tele-Health Dietary/Fitness Check-in 45 min. Operator default: the first two confirm instantly (Quick initialization = welcome call), the 45-min check-in needs coach approval; editable in-app. |
| 10:44 | Policy passages approved: Privacy Policy "Roman and AI" paragraphs 1 and 3 and the Terms AI sentence (#611 at `ced10667`). Recorded on #611. |
| 10:44 | **Over-the-air updates approved** for the Saturday binary (expo-updates / EAS Update; Free plan covers 1,000 monthly users). |
| open | Expo Starter plan ($19/month + usage) for the fast build queue: offered, not yet answered. |

---
| 11:29 | **Fee math is the #1 massive issue** (coach payout = price - card processing - TGP 2%; TGP must never lose money on a sale). Enforce $19.99 minimum or free. Earnings screen fix logged. Coach onboarding built around the coach "aha": connect Stripe or bank, invite a client, receive first payment. Card-update placement: research the best practice (recommendation in TO-DO 4). **Stay on Expo Free** (no plan upgrade). |
| 11:31 | **Master workout builder:** non-client-specific program library, build once, reuse for everyone, plus auto-assign tools (TO-DO 6). |
| 11:31-11:32 | **Flags live on day 1:** community, MWB templates/autosave/undo/AI live-create/named regimes, dunning v2 (TO-DO 8; AI live-create gated by R2b, TO-DO 9). |
| 11:39 | **Superseded 11:38: let running subagents finish, record their findings/state here, start nothing else — out of credits for new work.** #306 r5 is NOT started (objective staged at `/home/user/workspace/ops/lanes/306_r5_objective.md`). |
| 11:38 | ~~Go on #306 fix round 5 if agent capacity allows~~ — launch when a slot frees (cap stays 7 subagents); sandbox crash = massive wasted work, so keep load low. |
| 11:36 | **Money = a coach Home card that expands into full page(s); merge Business metrics into Money.** **No more agents:** record to-dos and decisions here with context and goal state. |

## 4. Operator rulings in force (owner may override)

- **D1:** scripted Roman only in v1.0; live Roman chat in 1.0.1 (Roman stack #598/#601/#602/#603/#605 off the critical path).
- **D2:** two boxes on one screen; box 1 required (waiver + coaching data, `consult-consent-v2`), box 2 optional (AI drafts via Anthropic, `client-ai-v3`); withdrawal in Settings > Privacy > Roman and AI. The AI-consent ledger flag goes ON at the clinic deploy.
- **D3:** health prefill of onboarding moves to 1.0.1; v1.0 ships connect, history import and the health/sleep views.
- ~~**D4:**~~ **CANCELLED by owner 12:55 (role choice is must-ship; no client-only path).** Old text: if mobile #306 is not dual-approved by **Fri 10-02 12:00 PDT**, submit client-only and set `SIGNUP_ROLE_CHOICE_ENABLED=false` explicitly on Fly **before** #597 deploys (backend default is ON when unset).
- consult consent accepts `consult-consent-v2` only; #622 dunning-lockout allowlist = exactly GET /api/me/ai-consent, POST/DELETE /api/me/ai-consent/roman; #310 labels "Privacy" and "Delete account" plus a Privacy Policy link outside the hashed consent text.
- #310 problem/paused screens get a minimal escape (Contact support mailto + Sign out).
- Blocking must hide posts both ways so the approved line "If you block someone, they can no longer see your posts" is true (code changes to match the copy).
- Wearables AI insight panel stays hidden (no box-2 check yet).
- Google Calendar / Meet / Zoom integrations stay off; their Fly keys are optional-integration, not must-fill.

---

## 5. Gaps found this session and where each one stands

| Gap | Disposition |
|---|---|
| Android APK crashed at launch (Crisp 0.2.1 on SDK 56) | Fixed, merged #316; device confirmation waits on build `f5cac78e`. |
| Health Connect permission delegate missing in MainActivity | Fixed in S14 mobile #317 (config plugin); #317 is in a fix round. |
| Sentry native auto-init off (pre-JS crashes invisible) | Follow-up queued. |
| **Client booking screens orphaned; 34/170 routes without a pathway** (booking, upcoming sessions, macros screen, exercise library, leaderboard, bloodwork, private community hub, community Today/Challenges/Classroom/Find, Copilot; coach bloodwork queue, wearable prompts, admin control room; some are false positives) | S-SCHED running (Calendar); **S-REACH queued** (map every route, wire working features, hide broken ones, report). |
| No OTA update channel in the binary | Owner approved; existing mobile **#305** (expo-updates, fingerprint runtime) needs a rebase onto main + clinic channel + one audit. Lane S-OTA queued. |
| Env truth: five Fly keys share one placeholder value (GOOGLE_OAUTH_CLIENT_ID/SECRET, OOM_*); junk Fly keys `E`, `E_MB`; 91 env names read by backend code are unregistered and unset; `STRIPE_WEBHOOK_SECRET_NEXT` equals current; `STRIPE_PRICE_ID_FITNESS` equals `STRIPE_PRICE_GROWTH`; `DATABASE_URL` equals `DIRECT_URL`; GitHub `DATABASE_URL_AUDIT` unset (RLS floor guard soft-skips) | S-ENVTRUTH running (registry, invariant test, fly-env-sync with staging, classifier). Fly deletions need operator sign-off after audit. |
| Mobile reads `EXPO_PUBLIC_STRIPE_PK`, EAS stores `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | S-ENVTRUTH mobile PR. |
| `COACH_SIGNUP_SECRET` / `EXPO_PUBLIC_COACH_SIGNUP_SECRET` unused | Remove after role choice settles. |
| Data export writes to ephemeral `/tmp` (S3/storage path never implemented) | Queued: export to Supabase storage. |
| `GOOGLE_CLIENT_IDS` unset on Fly (Google hidden) | GitHub secret set; Fly push via audited sync workflow. |
| Approved block copy not true in code | Queued fix round on #610/#314 (both-ways read filter). |
| No home page at app.trygrowthproject.com (Google branding uses /help) | Backlog: real landing page. |
| Expo Free plan: slow build queue, 15 Android + 15 iOS builds/month | Owner decision on Starter plan pending. |
| Coach-deleted clients see "No coach yet" (no dedicated message) | Follow-up after #608. |
| Android 13 and lower: Health Connect rationale opens app home, not a privacy screen | Follow-up before Play production. |
| Wearables: no background sync; later edits in Apple Health/Health Connect not re-synced | Known v1 limits. |
| **Coach view of consultation answers missing in the app** (owner 09-30: coach sees every client's answers easily). Backend endpoint exists in #607; no coach screen. | Folded into S-REACH. |
| **Money audit 2026-10-01 11:20 PDT (operator, static + live route probes):** (1) No TGP "Money" page (owner 09-30 17:53); money lives in coach Settings > Payments (Packages, Payouts (Stripe Connect), Earnings). (2) `CoachEarningsScreen` calls 6 routes that 404 in prod (`/v1/coach/earnings`, `/payouts/readiness`, `/payouts`, `/reconciliation`, `/refunds`, `/dashboard-link`; built against closed backend PR #216), so it always shows the not-set-up state. Live alternatives: `/v1/coach/payments/earnings`, `/coach/connect/{status,metrics,payouts}`, `/v1/connect/accounts/dashboard-link`. (3) Fee math: destination charges with a flat 2% application fee (`fee-policy.service.ts` 200 bps), so the platform pays Stripe processing and loses about 0.9% + 30c per paid sale; owner ruling is payout = price - processing - 2%. (4) Package minimum is 50c (`packages.service.ts:543`), ruling is $19.99 or free. (5) Coach setup wizard steps 2-5 (practice name, speciality, capacity, Connect payments) have no inputs and no Connect button. (6) Client payment method: More > Membership > Packages > Update card (Stripe Billing Portal, route live); no Settings entry. Stripe-side unknowns: Connect platform activation, live customer-portal configuration. | Lane S-MONEY queued after S-REACH (T4: fee math). Wizard part is pulled ahead if #306 role choice is on track for Saturday; under D4 client-only it ships 1.0.1. Clinic launch unaffected (free package). |

---

## 6. PR board (read 2026-10-01 10:50 PDT)

Backend (`growth-project-backend`):

| PR | Slice / tier | Head | Audits | Next |
|---|---|---|---|---|
| #597 | C13 role choice + auth hardening, T4 | `fc5c5a9e` | Sol BLOCK (A-597-1 unfenced OAuth binder cleanup); Opus RC (B-597-2 binding to a pre-registered identity) | Auth builder fix round 4 |
| #599 | C03 attach, T4 | `9a0b9f94` | Opus APPROVE; Sol BLOCK (inherited) | Restack after #597 |
| #595 | C01 comp access, T4 | `1b782ec8` | Opus APPROVE; Sol BLOCK (B-595-1 revoke ignores pending grants) | Fix in auth round |
| #604 | C14 throttler, T4 | `c3abde8d` | Opus APPROVE; Sol BLOCK (inherited) | Restack |
| #606 | C06 macros, T3 | merged `be667142` | Sol + Opus APPROVE | Done |
| #607 | C05/C07 intake + programs, T4 | `245da2e7` | Opus APPROVE; Sol RC (B-607-4 required checks never ran) | Full CI re-run triggered; Sol re-check |
| #609 | Welcome message + reminders | `1f8b22b9` | none yet | Audits queued |
| #608 | Account deletion, T4 | `a81a548f` | Sol RC at earlier head; fix round done; Opus audit running | Sol re-audit |
| #610 | UGC safety, T4 | `b8ce8d35` | none yet (approved copy placed) | Block both-ways fix, then dual audit |
| #611 | Privacy/consumer-health/terms, T3+ | `ced10667` | none yet (owner approved new passages) | Audit |
| #622 | R2a AI consent ledger, T4 | `02c7187d` | Opus APPROVE; Sol RC (B-622-1/2/3) | R2a builder fix round |
| #623 | S14 wearables backend, T4 | `c5d45172` | Sol RC (B-623-1 inherits 3/hour throttle) | S14 builder fix round 2 |
| #598/#601/#602/#603/#605 | Roman stack | various | n/a | Off critical path (D1) |

Mobile (`growth-project-mobile`):

| PR | Slice / tier | Head | Audits | Next |
|---|---|---|---|---|
| #316 | Crisp crash fix, T2 | merged `53447a36` | Opus APPROVE | Done |
| #310 | Consultation onboarding + D2 + Settings > Privacy, T4 | `00cfb6c3` | Opus RC (B-310-1 grant after failed save; B-310-2 box-2 state after restart) | Builder fix round 3 |
| #306 | Role choice UI, T4 | `4b349d32` | Sol RC (B-306-1/2/3); Opus RC (B-306-1 Login recovery strands device) | r5 when a slot frees; D4 fallback Fri 12:00 |
| #313 | Account deletion UI, T4 | `11016305` | Sol RC at earlier head; Opus audit running | Sol re-audit |
| #314 | Report/block/safety screen, T4 | `b4b931d8` | none yet | Dual audit after block fix |
| #315 | Trust center links | `d9c2e669` | none yet | Audit; ships with or after #611 deploy |
| #317 | S14 wearables mobile, T4 | `f63da34e` | Sol BLOCK (A-317-1 cross-account upload; B-317-1..4) | S14 fix round 2 |
| #312 | Workout reminders toggle | `5b26e1f4` | none yet | Audit with #609 |
| #305 | expo-updates (OTA), T3 | `45787152` (base is the merged #304 branch) | none at current base | S-OTA: rebase + clinic channel + audit |

---

## 7. Lanes (cap: 8 agents including the operator = 7 subagents)

Running (7): S-ENVTRUTH builder; Opus audit #608/#313; #310 fix round 3; auth stack fix round 4 (#597/#595 + restack);
S14 fix round 2 (#623/#317); R2a #622 fix round; **S-SCHED** client Calendar builder.

Queue, in priority order: S-REACH (reachability); #610/#314 block both-ways fix; dual audits #610/#314; audit
#611/#315; S-OTA (#305 rebase); Sol re-audit #608/#313; #306 r5; Sol re-check #607; re-audits of the auth chain and
#622/#623/#317/#310; audits #609/#312; S-ENVTRUTH audits; data export to storage; Sentry native init; S07b AI-path
inventory; C04 bootstrap (after Bradley signs up in a working build; includes seeding his appointment types and
welcome text); C11 store package + TestFlight clinic iOS build; Wave-1 deploy via `fly-deploy.yml`.

---

## 8. Critical path and deadlines

- **Now:** working Android build (`f5cac78e`), so Bradley can sign up -> C04 bootstrap.
- **Fri 10-02 06:00:** S-SCHED PRs ready for audit.
- **Fri 10-02 12:00:** D4 cutoff for #306; target for dual approvals on #597 chain, #607, #622, #608/#313, #610/#314, #611/#315, #310, S14.
- **Fri evening:** Wave-1 backend deploy (audited main only), set flags (`FEATURE_WEARABLES_INGEST_POST`, AI-consent ledger, `GOOGLE_CLIENT_IDS`, `APPLE_SIGNIN_*`, explicit `SIGNUP_ROLE_CHOICE_ENABLED` if D4 falls back), clinic iOS + Android builds with OTA, device passes.
- **Sat 10-03:** App Store submission.
- **Wed 10-07:** clinic go-live; anything that missed the binary ships over the air if it is JS-only and audited.

---

## 9. Open owner asks

1. Install the new Android build when the operator sends the link (uninstall the old app first), then sign up as coach.
2. Decide on the Expo Starter plan (fast build queue).
3. Confirm EAS iOS credentials / App Store Connect API key for the iOS build and submission.
4. Two iPhone device passes through TestFlight (Friday evening, Saturday).

---

## 10. Notes for a successor operator

- Authoritative evidence lives on GitHub: PR bodies (tier headers, fix-round tables) and audit verdict comments at
  exact heads. Sandbox paths (`/home/user/workspace/ops/...`) are convenience copies and can disappear.
- Stacked backend PRs were retargeted to main only so CI runs; audit incremental ranges (parent head..head).
- Never ship APK `14a58449`. Never commit the coach welcome text or the clinic partner's name.
- Do not set Fly secrets except through audited workflows; Fly deletions need operator sign-off.

---

## Superseded: importer operator state (session 5754504f, 2026-09-30 03:32 UTC), kept verbatim below

Original update time: 2026-09-30 03:32 UTC

Operator: Computer (Claude Opus 5.5 Fast), executive orchestrator, session 5754504f
(https://www.perplexity.ai/computer/tasks/5754504f-dfba-473b-a648-5290eee287a7). EXECUTE given by owner
2026-09-29 16:15 PDT under the TGP IMPORTER MASTER EXECUTIVE AGENT PROMPT, after the readback in
handoffs/op-5754504f/READBACK_2026-09-29.md. This session is the single writer for every importer lane.
Session c7aa658f (below) is superseded; its owner pause (19:23 UTC) is lifted by this EXECUTE. Its review
texts were never published, so every in-flight PR gets fresh exact-head independent reviews.

## Owner decisions 2026-09-29 16:14-16:15 PDT (binding)
- B-1: YES. Deploy backend main (after promoting integration/importer) to production with importer surfaces
  enabled only for the S12-B1 pilot allowlist (owner coach account); read-only live integration runs against
  the owner's own source account with the packaged extension.
- B-2: YES ("if it doesn't slow us down"). Importer real-PG proof jobs become required checks. Measured: each
  ~2 min, parallel to the 6.5 min build-and-test, run on every pull_request (no path filter) -> no wall-clock
  cost. Applied 2026-09-29 23:17 UTC on integration/importer: + person-owned-rls-live-tests,
  + person-owned-migration-rehearsal (strict, admins enforced). main gets the same at promotion.
- EXECUTE: standing execution authority for the importer.
- PRODUCTION DEPLOY 2026-09-30 00:24-00:28 UTC: Fly Deploy run 36650149513 released main 3a9369b9 with
  migrations=apply-migrations; evidence gate green; operator approved the production environment under the
  17:21 PDT authorization; run concluded success. Probes 00:53 UTC: /health 200, /readyz 200 (db up),
  POST runs/start 401 (route now exists; auth first), scout/ingest 401, pair/redeem 400 (anonymous, body
  validation). Pilot allowlist is absent in Fly secrets, so importer routes fail closed for every coach.
  Closed 11 verified landed/superseded PRs (backend #479; mobile #290-#294; extension #19, #23-#26).
- OWNER AUTHORIZATIONS 2026-09-29 17:21 PDT (explicit answers via the question form):
  (1) "May I temporarily remove the two person-owned database checks from integration/importer's required list,
  and put them back as soon as #587 merges?" = "Yes, remove then restore". Done 00:21 UTC; required list is now
  build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (strict). OWED: re-add
  person-owned-rls-live-tests + person-owned-migration-rehearsal immediately after #587 merges.
  (2) "May I approve production deploys and production flag changes in GitHub myself, and close PRs that are
  verified as already landed or superseded?" = "Yes, both". The operator approves `production` environment runs
  itself (comment cites this authorization) and closes verified landed/superseded PRs.
- Hosting: Fly invoice PAID by owner 2026-09-29 16:39 PDT (deploy unblocked). Owner direction 16:29: move to a
  free host later (recommended Google Cloud Run, request-billed; after the importer's first live deploy; custom
  domain first). Earlier (16:27): owner stays on Fly and pays the overdue invoice (the 2026-09-09 deploy failed at
  the Depot build with "overdue invoices"). Operator right-sizes the machine after deploy (measure memory first).
- Production facts (read 23:20 UTC): FEATURE_SCOUT_INGEST + FEATURE_EXTENSION_PAIRING are ON globally on the old
  image (no allowlist code); runs/start 404. `production` GitHub environment created: required reviewer
  BradleyGleavePortfolio, no admin bypass, protected branches only (release evidence gate precondition; every
  production-mutating workflow now needs the owner's approval click). ANTHROPIC_API_KEY exists as a Fly secret.
  FEATURE_SCOUT_RECONSTRUCT and FEATURE_SCOUT_PILOT_COACH_IDS are not set. Production User table has no owner and
  no real coach (only the system coach `b5-system-coach-tgp`, not a UUID). S10 prerequisites: owner coach account
  in production + a mobile build with EXPO_PUBLIC_FF_EXTENSION_IMPORT on.
- Still not requested (owner 2026-09-27): ANTHROPIC_API_KEY; needed at the first real AI decode (S13/S14).

## Plan (slices S0-S22, tiers and headers in the readback section 7)
OWNER SCOPE CUT 2026-09-29 20:26 PDT: "update last_operator_state first. then do the next round for 3 of the in
flight PR's". Concurrency cap: at most 3-4 heavy lanes at once on the operator sandbox (2 cores, 20 GB disk).

## Incident 2026-09-30 00:55-03:26 UTC: operator sandbox down
Operator ran ~17 parallel lanes (npm ci / jest / tsc each) on one 2-core, 8 GB, 20 GB-disk sandbox; load reached
~100, disk 96%, the sandbox stopped and could not be reprovisioned for ~2.5 h. Every lane died mid-work. Operator
cause: over-parallelisation. Fix: cap 3-4 heavy lanes; share one node_modules per repo; kill stale processes.

## Live PR state (read from GitHub 03:30 UTC)
| PR | Slice | Tier | Head | CI | Reviews at/near head | Next |
| --- | --- | --- | --- | --- | --- | --- |
| backend #584 | S12-B6 flags workflow | T4 | 19427997 | green | A (GPT 6 Sol) RC 2B @32db4bc2; B (Opus 5.5) RC 1A/4B @32db4bc2; fix r1 pushed 19427997 claims all closed | fresh dual audit at 19427997 (DO NOT DISPATCH until approved: A1 published the allowlist in public logs) |
| ext #35 | X1 origin authorization | T4 | 5804b506 | green (codeql, secrets-scan, test x2) | prior RC 2A (late grant after tab close; lost /complete reply) @8608a0ff; fix r5 pushed 5804b506 (27 new tests) | fresh dual audit at 5804b506 |
| backend #587+#593 | S8-D3 schema + D8 tenancy | T4 | 3e243750 / 798208b7 | green | A RC 1A (owner-GUC bypass on person-owned RLS, S4-A-587-593-01); B RC 1B (meal-plan resolver 25P02 in tx, S4B-01) + C01-C03/C08 | fix round (work at the dead sandbox lost/unknown); merge #587 with a MERGE COMMIT (6d55e9e4 ancestor) |
| backend #594 | CL completeness closure record | T4 | a48abf3e | green | none | dual audit after L0 r10; OQ-CL-1 ("exposes" = coach-session scope) operator default, enforcement off |
| backend #581 / #590 | L0 r9 / FAM-0 r11 condensed | T4 | 0459df85 / 696abd73 | green | A RC 2A/1B; B RC 10B | r10/r12 (draft spec in operator mail; file lost) |
| backend #592 | L1-gw | T4 | 32ca797e | green | prior RC (0/0 usage backstop) | r5 fix written, uncommitted in lanes/s2-l1gw/repo if it survived |
| backend #589 | L3 | T4 | 263e8950 | green | prior RC (OpenAPI bounds vs parser) | fix round lost |
| backend #591 | L1-core | T4 | 68a84d1d | green | prior RC (r7 vs L0 r9) | fix round lost |
| mobile #302 | no_usable_result + D-05 docs | T3 | 8ca60030 | green (4495 tests) | none | single independent review |
| backend branch s15a/no-usable-result | S15a zero-result = failed | T4 | 707b6765 | build-and-test red (verdict-table cases expect partial) | none | fix tests, regen contract, open PR |
| parked #580 #582 #583 | env gap / pilot SQL / RLS catalog | T2/T3 | unchanged | — | — | later |
Not started or lost (uncommitted at the dead sandbox): S18 importer capability, X3a extension server-mode
lifecycle, FAM-C1 catalogue, onboarding/Roman investigation (owner priority, re-run alone).
Temporary required-check removal on integration/importer still in effect; restore owed after #587 merges.
Owner direction pending: onboarding/Roman/coach-matching deep dive (Opus 5.5) "day 1 mission blocker".

---

# HISTORY: session c7aa658f (superseded 2026-09-29 23:20 UTC)

# LAST OPERATOR STATE
Updated: 2026-09-29 18:35 UTC (round-1 audits in; fix rounds running)

Operator: Computer (Claude Opus 5.5), executive orchestrator, session c7aa658f
(https://www.perplexity.ai/computer/tasks/c7aa658f-8b40-46cc-b838-533cd9f0fa7b). EXECUTE given by owner
2026-09-29 11:00 PDT under the TGP IMPORTER MASTER EXECUTIVE AGENT PROMPT.
Session x44 is STOPPED (owner, 2026-09-29 10:58 PDT). This session owns every x44 lane. x44 review texts were
never published, so every in-flight PR gets fresh full independent reviews at its current head.

## Owner decisions 2026-09-29 10:58-11:00 PDT (binding)
- B1: x44 stopped; this session is the single writer for every importer lane.
- B2: D14 stands under the master prompt (Option A). Partner/third-party data reachable through the coach's own
  logged-in page moves: read-only GET/HEAD replay of requests the authorized page itself made, with the
  credential the page itself sent to that same origin; no stored credential, no new login, no mutation, bounded
  rate, every outside origin named in the result. The master prompt's origin confinement is read with this
  exception.
- B3: tgp-private-evidence and tgp-agent-context stay PUBLIC until the importer is done (public CI lanes enable
  parallelism); owner privates them at the end. Operator rule: no secrets, tokens, client names or client data
  values are pushed to either repo.
- Commit identity is not a criterion (master prompt section 0); G05 identity text is superseded.

## Execution plan (readback 2026-09-29; tiers per T0-T4 doctrine)
Wave 0 (now): D8 RLS tenancy fix stacked on #587 (T4); branch protection backend main + integration/importer
and mobile main (T3, strengthening, mirrors extension); fresh 2x independent reviews of #590, #587, #592,
#589, ext #35; L0 #581 r6 (records D9/D10/D14, aligns with #588/#591/#592); #591 after L0 r6; triage stale
PRs; promote integration/importer -> main (merge only, no deploy).
Waves 1-4: L2b, L2c, L3b, L2d; X2, X2b, X3, X4, R2 (+ Roman Offer/Setup registration); PRES, FAM-n, EX1,
FAM-M1, billing handoff (D10); V1-P on owner account (needs owner deploy approval + provider key + credential
rotation); CL record; L2g; DEL.
Routing: T4 builder Claude Fable 5.1; T3 Claude Opus 5.5 (stronger equivalent of Opus 5); T2 Claude Sonnet 5;
T1 GPT-5.6 Terra; T0 GPT 6 Luna (substitute: GPT-5.6 Luna unavailable). T4 reviewers: two independent
auditors from different families (GPT 6 Sol + Claude Opus 5.5), neither the builder.
Evidence: review reports published to tgp-private-evidence/execution/c7aa658f/reviews/.

## Live lanes (c7aa658f) — updated 2026-09-29 18:35 UTC
Branch protection applied 18:10 UTC (read back via API; direct-push negative test not run): backend main
(build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL JS/TS, banned casts,
build-sbom, danger), backend integration/importer (build-and-test, rls-floor-guard, rls-live-tests,
mwb-3-live-tests, npm audit), mobile main (Typecheck/lint/test, CodeQL x2); strict, admins enforced, PR
required (0 approvals), no force push/delete.

Round-1 fresh independent T4 audits (A = GPT 6 Sol, B = Claude Opus 5.5). Reports held in the operator sandbox
(/home/user/workspace/reviews/out/) and NOT published to the public evidence repo while the findings are
unpatched; they will be published once closed or once the repo is private.
| PR | Head | A | B | Next |
| --- | --- | --- | --- | --- |
| #587 S8-D3 | bb95cbf4 | APPROVE 0A/0B | REQUEST CHANGES 1A/5B | D8 tenancy slice (stacked, in build) closes the A; then #587 fix round; both land together |
| #589 L3 | 61b0d251 | RC 3A/2B | RC 2A/4B | fix round in build (Fable) |
| #590 FAM-0 r8 | 48177b75 | RC 3A/2B | RC 2A/9B | r9 in build (Fable); L0 amendments routed to L0 |
| #592 L1-gw | df330304 | RC 3A/2B | RC 1A/2B | fix round in build (Fable) incl. real-PG contention spec |
| ext #35 X1 | bd1684ae | RC 2A/2B | RC 0A/1B | fix round in build (Fable) incl. packaged-zip Playwright Chromium load proof |
| #581 L0 | f4459fe2 | — | — | r6 in build (Fable): records D9-D14/B2, closes r5 items |
| D8 (new) | — | — | — | T4 builder stacked on #587 (base cand/x43/s8d3-schema) |
Round-2 status (19:20 UTC): #592 r3 367d3e85 -> RC (A2: 1A; B2: 2B) -> r4 in build. #589 r3 e5b990b6 -> RC (A2: 2B; B2: 2B) -> r4 in build.
#581 L0 r6 d5bfea98 -> RC (3A/4B; 2A/8B); r7 e79e6578 -> RC (3A/2B; 2A/8B) -> r8 in build with operator scope reduction (contracts,
invariants and required real-browser acceptance tests; mechanisms move to X2b/X3/FAM-M1). #590 FAM-0 r9 0924fc15 -> RC (2A/1B; 2A/5B)
-> r10 in build with the same scope-reduction direction. #593 D8 44bb69cf -> RC (1A/1B; 0A/1B: AI assignment materialisers lacked the
tenancy check) -> r2 96aea1b8 green -> re-review running. #591 L1-core r3 (align to L0 r7) in build. ext #35 fix round in build.
Executive interpretation recorded: D14 "replay of requests the page itself made" covers the page's own learned endpoint templates
with other ids/pages under the L0 bounds. Follow-up findings for later slices: RlsContextInterceptor user.sub guard appears inert;
repo-wide GUC-keyed RLS helpers should adopt app.rls_actor_id(); production count of pre-existing cross-tenant assignment rows.

PAUSED by owner at 19:23 UTC ("let in-progress agents finish, do not start anything new"). Heads at pause, none merged:
| Lane | Head | Status at pause |
| --- | --- | --- |
| #593 D8 | 96aea1b8 | split: A2 RC (1A: tenancy check not atomic with the assignment write), B2 APPROVE (11C) — needs fix + fresh pair |
| #592 L1-gw | 32ca797e | r4 green; closes R592-c7A2-01/c7B2-01/-02; not yet re-reviewed |
| #589 L3 | 263e8950 | r4 green; closes 4 B; not yet re-reviewed |
| #581 L0 | f89e761a | r8 (scope-reduced) green; not yet reviewed; one --force-with-lease amend on the PR branch (d176e823 -> f89e761a) |
| #590 FAM-0 | 61c7c97f | r10 green; not yet reviewed |
| #591 L1-core | 68a84d1d | r3 green, aligned to L0 r7; interim family catalogue pending FAM-C1; not yet reviewed |
| ext #35 X1 | 8608a0ff | fix round green + packaged-zip Chromium load proof 15/15; not yet re-reviewed |
| #587 S8-D3 | bb95cbf4 | waiting on D8; fix round R587-c7B-02..06 not started |
Not started: every re-review above, #587 fix round, merges, report publication, superseded-PR closure (needs owner), parked #574/#580/#582-584, later waves.

Final owner-requested round (21:00 UTC), no merges (both-approve rule not met):
| PR | Head | A (GPT 6 Sol) | B (Claude Opus 5.5) | Remaining blocker |
| --- | --- | --- | --- | --- |
| #592 | 32ca797e | RC 0A/1B | APPROVE 0A/0B/4C | gateway backstop accepts 0/0 usage from a non-parsing adapter (B rated it C02) |
| #589 | 263e8950 | RC 0A/1B | APPROVE 0A/0B/5C | OpenAPI admits counters above parser max and non-ASCII tokens over the byte limit |
| ext #35 | 8608a0ff | RC 2A/0B | APPROVE 0A/0B/5C | grant accepted >60 s after Start-tab close not revoked; lost /complete reply can show failed without a server status check |
Reports: /home/user/workspace/reviews/out/R592-c7{A3,B3}.md, R589-c7{A3,B3}.md, R35-c7{A2,B2}.md (sandbox only).

Round for the other five (22:00 UTC), no merges yet:
| PR | Head | A (GPT 6 Sol) | B (Claude Opus 5.5) | Remaining |
| --- | --- | --- | --- | --- |
| #587 S8-D3 | 3e243750 | RC 0A/1B (proof jobs not required on integration/importer) | APPROVE 0A/0B/3C (merge condition: same gate) | add person-owned-rls-live-tests + person-owned-migration-rehearsal to required checks (classifier requires owner authorization), then land with #593 |
| #593 D8 | 798208b7 | RC for combined landing only (0 new A/B) | APPROVE 0A/0B/4C | fast-forward cand/x43/s8d3-schema to 798208b7, then merge #587 |
| #581 L0 r8 | f89e761a | RC 0A/3B | RC 0A/1B/8C | r9: 8-origin cap vs digest, :8443 port rule, media test vs FAM-M1 deferral, mutating-word check hits coach data |
| #590 FAM-0 r10 | 61c7c97f | RC 0A/1B | RC 0A/3B/6C | r11: adopt L0 r8 origin/device-attested contract, erased-unknown rows already in TGP keep count, media ingest/erasure serialization + orphan sweep |
| #591 L1-core r3 | 68a84d1d | RC 3A/1B | RC 1A/3B/6C | r4: align to L0 r8 (truncation carry-forward, scheme+host+port origins, r8 vocabulary), FAM-C1 catalogue disposition |
Migration Dry-Run jobs are path-filtered (prisma/migrations/**), so they cannot be required without blocking non-migration PRs.

Correction to the readback: Roman ImportSetupView is live in ImportDataScreen (not only progress/result);
only ImportOfferCard is unmounted.

---

## Inherited x44 state (as of agent-context b95ed47, 2026-09-29 17:31 UTC)


Former operator: Computer (Claude Opus 5.5), session x44 (now STOPPED) (EXECUTE given by owner 2026-09-29).
Mission: progress the AI-assisted self-learning importer toward the north star. Owner directive (2026-09-29):
finish every in-flight PR through review → fix → re-review, all nine in parallel, update this file at every
round finish per PR; start no new PRs; no pilot until everything is done.

Supersedes the 2026-09-20 state (preserved in git history). Commit identity is irrelevant (owner directive).

## Owner decisions recorded 2026-09-29
- D1 `complete` = ALL client records and ALL coaching records from the site are in TGP (no narrowing).
- D4 No unsupported families: anything reachable moves (messages, food logs, check-ins, habits, body metrics,
  notes, forms, photos/files, sessions, ...) — native where TGP has a model, otherwise a preserved record.
- D5 Partial runs show per family what came vs what did not; clickable in the extension UI and on mobile,
  from one server projection.
- D6 Extension backend origin = https://backend-spring-lake-3890.fly.dev (`tgp.coach` is unregistered).
- V1 pilot platform = the owner's own account on the owner-chosen platform; no pilot until all done.

## Executive decisions (orchestrator)
- MAIN-world replay: one Start authorizes only the tab origin; cross-origin data APIs are replayed from the
  authorized page's MAIN world; credentials stay on device, run-scoped, memory-only.
- Executive reset (after learn record r4 failed two T4 re-reviews): completeness closure is DEFERRED to a
  later record — until then no package type has run-level closure, learned runs settle `partial` with gap
  `completeness_not_proven` (false `complete` impossible by construction); per-family source counts stay
  provable. V1 memory is per coach; cross-coach reuse (north star) is a later slice (L2g) with quorum rules.
  One run-status projection (families[] / not_moved[] / gaps[]) owned by the learn record.
- S8-D3: harness fixes (fixture pre-delete; 23505 DETAIL assertions) authorized as correctness fixes; the
  pre-existing ClientWorkoutAssignment↔WorkoutPlan RLS recursion (42P17) is fixed inside #587.

## Bases
backend main `3a9369b9`, integration/importer `d6cf9eb6`; mobile main `adf3f2b9`; extension main `efb3fd18`.
Production backend unchanged (old main); nothing deployed this session.

## CHECKPOINT MODE (owner, 2026-09-29 09:02 PDT: 35k/45k credits used)
Directive: bring all nine PRs to a safe checkpoint. Every running builder/fixer was told to finish its current
round, push (single non-force), and mark unclosed items OPEN in its PR body. No new review rounds are launched
after this point; the next operator starts with the delta reviews listed in each row. No new PRs.

## In-flight PRs (round status)
| PR | Slice | Tier | Head | Round | Status |
|---|---|---|---|---|---|
| backend #581 | learn-and-remember record | T4 | f4459fe2 (r5) | CHECKPOINT: r6 needed | r5 reviews: R581-A3 REQUEST CHANGES (2A/3B) + R581-B3 REQUEST CHANGES (0A/8B; no false-complete path found; structure holds). NEXT: r6 author closes reviews/out/R581-A3.md + R581-B3.md (remove destination.kind from LearnedProposalV1; align slice text with merged L2a/#591/#592; round-2 match rule; template_absent; origin base case; C0 per family), then two delta reviews |
| backend #590 | FAM-0 all families record | T4 | 48177b75 (r8) | r8 delta review | … r7 → R590-A6 (1A/2B) + R590-B6 (5B) → r8 pushed 48177b75 (native re-screen; pre-P1 quarantine; trialing no date; extension redactor retired via vendored rules file + X-RED1 slice; residual_unknown in L0 amendments; JSON-only partner origins; counted exclusions; row locks; corpus seeded). R590-A7 + R590-B7 running |
| backend #591 | L1-core learn contract/validators/prompt (pure) | T4 | debce080 (r2) | CHECKPOINT: delta review next | R591-A (2A/3B) + R591-B (2A/6B) → r2 pushed: contract v2, family label (no AI destination; unsupported_coaching_data deleted), origins/parentEdge/idScope, device pagination signals + positive proof for none, next_url confinement as contract data, stored-package re-validation, stable reuse key; learn suites 255/255, tsc 0. OPEN: nonGetDataOrigins (r5 field) not added pending L0 r6; reused-parser specs not re-run; X2 must re-copy fingerprint vectors. NEXT: two delta reviews 3a684671..debce080 after L0 r6 |
| backend #592 | L1-gw fail-closed importer.mapping AI capability | T4 | df330304 (r2) | CHECKPOINT: delta review next | R592-A (3A/4B) + R592-B (6B) → r2 pushed: SpendLedger port + advisory-locked PG reserve-before-call (fail closed), allow-listed caller metadata, kill switch per attempt, prices>0, single tool_use, conservative token estimate, readonly schema + validation errors returned, 90 s default, env keys registered; 70 tests. OPEN: real-PG proof of advisory-lock contention (in-memory double only); C1/C8 at r1 posture; CI at df330304 unobserved. NEXT: two delta reviews 52196217..df330304 + real-PG contention spec |
| backend #588 | L2a SourceRegistryProvider | T3+2nd lens | f6dcee55 (r2) | MERGED | R588-A/B → r2 → R588-C APPROVE; real-PG proof ACCEPT run 36592070591 (133/42/95); squash-merged into integration/importer as 249fd0d4 |
| backend #589 | L3 per-family replay evidence | T4 | 61b0d251 (r2) | CHECKPOINT: delta review next | R589-A (3A/2B) + R589-B (2A/2B) → r2 pushed: closure deleted (no path to run-level complete), per-family source_count only, r4 StepEvidenceV1, fan-out bound; N1–N5 fail 15/16 on fe38821, pass on head. OPEN: L2 must consume evaluateCoverageDetailed().families; StopReason lacks positive value for proven style none (L0 r6). NEXT: two delta reviews of fe388210..61b0d251 |
| backend #587 | S8-D3 person-owned schema + RLS | T4 | bb95cbf4 (r2) | CHECKPOINT: delta review next | r2 pushed: 61bdadbb CWA↔WorkoutPlan cycle fix (SECURITY DEFINER helper, reversible), bb95cbf4 harness fixes (a)(b) + live cycle-fix block; local 423/423, reversibility 12/12; `gh pr checks 587` at bb95cbf4 (16:35 UTC) all pass incl. person-owned-rls-live-tests and build-and-test. OPEN: PR body still shows round-1 table (closure edit blocked by safety check — apply from reviews/S8D3_PR587_FIX_ROUND_20260929.md); owner item: assignment_coach_manage lacks client-tenancy check (pre-existing); re-merge base 249fd0d4. NEXT: two delta reviews 4abed784..bb95cbf4 |
| extension #35 | X1 origin authorization (+ Fly origin) | T4 | bd1684ae (r3) | CHECKPOINT: delta review next | R35-A (1A/3B) + R35-B (3B) → r3 pushed: 1df6eaf all A/B closures (recheck around Network.enable; nonce/tab/origin-bound pending Start, either-order claim; revocation fences; startup grant sweep; main-frame-only teardown; executeScript only), bd1684a OD-API-ORIGIN (Fly origin, exact-host, retired-domain scan); vitest 2102 pass, package ok. OPEN: real-Chrome browser-load proof (no Chrome binary; proof script still models r1 collector, needs rewrite); multi-origin out of scope. NEXT: two delta reviews 142501a2..bd1684ae |
| mobile #300 | R1 Roman status binding | T2 | 8565cc51 (r4) | MERGED | R300-A → r2 → R300-A2 → r3 → R300-A3 → r4 → R300-A4 APPROVE (no A/B; CI green on exact head) → squash-merged to mobile main as 360fdc74 on owner authorization (09:41 PDT) |

Merged this session: backend #588 (L2a) → integration/importer 249fd0d4 (integration/importer not promoted to main); mobile #300 (R1 Roman status) → mobile main 360fdc74.

## Owner decisions 2026-09-29 09:52 PDT (binding for next rounds)
- D8 corridor fix APPROVED: `assignment_coach_manage` must apply the same coach-client tenancy check the app applies (tightening only). Queued as the FIRST new PR when work resumes (small T4 RLS slice, two reviews).
- D9 (P1) popup carries exactly one Start button; everything else is status. Resolves the north-star wording conflict.
- D10 (P2/OQ-1) billing and payment history MOVE (preserved, coach-visible). Owner wants per-client next payment date carried so the coach misses no payments. Design note (not started): map to a coach-visible schedule (next due date, amount, interval, source status); moving the date does not move the live charge (Everfit keeps charging via the coach's connected Stripe account until canceled there; card data cannot be copied). Proposed V1: schedule + reminders + timed TGP checkout whose first charge lands on the carried due date, then coach cancels at the source. Needs a billing-handoff slice; L0 r6 and FAM-0 r5 must change billing from gap/excluded to moved.
- D11 (P3) registrable-domain fallback: not now; later slice.
- D12 (P4) media storage spend APPROVED; reuse the existing S3-compatible storage.
- D13 (P5) Chrome Web Store: later.
- D14 (P6) third-party/partner data reachable through the coach's session MOVES and is USED ("all data possible moved over, and used, everything possible"). FAM-0/L0 must drop the exclude-by-default. Still bounded by: no credentials stored, no logging into partner services, only what the coach's own session can reach.

## Not started (by owner direction: no new PRs)
L1 service/route, L2b per-coach memory store + pin, projection slice, X2 rework (#38, must rebase on X1 and
adopt new key-admission rules), X2b engine counters, X3 extension server-mode learn path, X4 popup detail,
R2 Roman gaps, FAM-n native families, preserve destination, completeness-closure record, L2g cross-coach
reuse, branch protection for backend/mobile, V1 proofs.

## Pending owner items
P1 popup carries the one Start (authorize) and is otherwise status-only (north-star wording conflict);
P2 billing under D1 (recommend preserve read-only / disclosed); P3 origin fallback (registrable-domain
permission only if MAIN-world replay proves infeasible); P4 media storage spend (est. small per coach);
P5 Chrome Web Store; P6 third-party service data default (excluded + disclosed unless it carries the site's
own credential); FAM-0 OQ-1..OQ-7 (billing, client visibility of preserved records, media caps, media host,
AI context from imported history, profile fill on join, unclassified family); email/billing storage reversal.

## Evidence
Review reports and briefs live in the operator sandbox (/home/user/workspace/reviews/out/*.md); summaries
are mirrored in PR bodies. Publish to tgp-private-evidence at session end.

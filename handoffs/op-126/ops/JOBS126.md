# JOBS126 — agent 126 fleet (from 18:05 PDT 10-06). Read /home/user/workspace/ops/lanes126/_COMMON_126.md first, then ONLY your entry.

Owner 17:56 10-06 (verbatim parts): "Run this as a fleet, not solo" / "reviewers use the verdict format merge_if_dual.sh reads, so approved
PRs merge right away" / "All mobile AI builder PRs merged by 00:30, then a new APK."
AI builder plan: /home/user/workspace/tgp-agent-context/handoffs/op-125/AI_MASTER_BUILDER_PLAN.md. Head-start reports from agent 125:
/home/user/workspace/ops/reports/HS-AIB4-125.md, HS-AIB5-125.md, B-AIB2-126.md, SAFE-MWBAI-125.md.
Operator merges with ops/merge_if_dual.sh as soon as both lenses APPROVE at the exact head and CI is green. Workers never merge.
Where an entry says you OWN an existing PR, _COMMON item 7 ("never push to PRs you did not open") does not apply to that PR: push to its
branch, merge main in when needed (never rebase, never force-push).

# AI MASTER WORKOUT BUILDER — BUILDERS

## B-AIB5P-126 (Claude Opus 5.5, BUILDER, T3 mobile) — m#439 paused state, never hidden. Time box 40 min (hard stop 18:50).
You OWN growth-project-mobile#439 (branch agent126/b-aib5-126, head c138b4c4). Worktree: reuse /home/user/workspace/wt/HS-AIB5-125-mobile
if it exists and is clean on that branch, else create /home/user/workspace/wt/B-AIB5P-126-mobile from origin/agent126/b-aib5-126.
Read HS-AIB5-125.md and the PR #439 checklist. Owner rule: the AI builder is never hidden. Change the Ask AI entry so status
`not_configured` AND `paused` both show the button and the sheet with a clear paused state and specific copy (plan PART 1 "Launch state"
and section 3); `no_credits` shows the no-credits state; ONLY a 404 from the status route (old backend, route not deployed) hides it.
A network error on status keeps the entry visible with a retry state. Propose must still work when the builder has no lock_token yet
(send none; backend b#809 will accept that). Update the specs (status 404 hides; not_configured/paused visible; tap shows paused copy, no
propose call). Keep the PR under 800 changed lines total. Merge origin/main in first if main moved. CI green, then post a NEW READY comment
per _COMMON item 5 with job B-AIB5P-126 at the new head. Report /home/user/workspace/ops/reports/B-AIB5P-126.md. Notify line when done.

## B-AIB2-126 (Claude Opus 5.5, BUILDER, T4 AI) — finish and split b#809 (generator). Time box 120 min (hard stop 20:10).
You OWN growth-project-backend#809 (draft, branch agent126/b-aib2-126, head c0984e2a, 1,112 changed lines, build-and-test RED at
https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37553060457). Worktree: reuse
/home/user/workspace/wt/HS-AIB2-125-backend if present and clean, else create /home/user/workspace/wt/B-AIB2-126-backend from
origin/agent126/b-aib2-126. Read /home/user/workspace/ops/reports/B-AIB2-126.md, the PR body checklist, plan sections 0-6 and the plan
entry "B-AIB2-126" (section 8). Steps: (1) read the failing CI job log and fix it; re-run test/aib2-*.spec.ts through heavy.sh.
(2) SPLIT: b#809 keeps the generator (validator, safety constants, prompt, service, controller, propose route) under 800 lines (target
600). Move the subset-approval change (ai-approval.service.ts + ai-gateway.controller.ts accepted_change_ids + its spec) to a NEW PR
from a new branch agent126/b-aib2b-126 based on agent126/b-aib2-126 (stacked; retarget to main when b#809 merges). (3) Fixes the mobile
builder needs (HS-AIB5-125 "Not fixed"): approve returns materialised_ref.lock_token (lockTokenFor from
src/workout-builder/lock-token.helper.ts); propose accepts a request WITHOUT lock_token (skip the stale check only then). (4) Section 4
per-mode max_tokens (create 8000, edit 6000, explain 1500), never send temperature. (5) PR bodies: SAFE checklist 1-12 each with
file:line. b#808 (AIB-4) owns the status route and manifest: do not touch them. If b#808 merges first, merge main in. Mark b#809 ready
when CI is green and post READY per _COMMON item 5 (job B-AIB2-126); same for the second PR. Report: append to
/home/user/workspace/ops/reports/B-AIB2-126.md (new section "agent 126 run"). Notify line when done.

## B-AIB3-126 (Claude Opus 5.5, BUILDER, T4 AI) — per-client context v2 + substitutions. Time box 120 min (hard stop 20:10).
Run the plan entry "B-AIB3-126" (plan section 8) exactly; read plan sections 1, 2, 6. B-AIASSIGN-125 is already merged on main (b#806),
so start from origin/main. Build the pure modules first (workout-context.service.ts, substitution table) so they do not depend on b#809;
the wiring into the AIB-2 validator lands in this PR only if b#809 has merged by then — otherwise leave a clearly named follow-up in the
report and keep this PR independent of b#809's files. Branch agent126/b-aib3-126, worktree /home/user/workspace/wt/B-AIB3-126-backend.
ONE backend PR under 800 (target 600). READY per _COMMON item 5. Report /home/user/workspace/ops/reports/B-AIB3-126.md.

## B-AIB6-126 (Claude Opus 5.5, BUILDER, T3 mobile) — AI entry points + history + draft polish. Time box 150 min (hard stop 20:40).
Run the plan entry "B-AIB6-126" (plan section 8; read PART 1 screens, sections 3 and 6), with this change: m#439 (AIB-5) is not merged
yet, so branch agent126/b-aib6-126 from origin/agent126/b-aib5-126 and open the PR with base agent126/b-aib5-126 (stacked, so the diff
shows only your work). As soon as m#439 merges: `gh pr edit <n> --base main`, merge origin/main into your branch, push. B-AIB5P-126 is
changing m#439 now (paused state): merge origin/agent126/b-aib5-126 into your branch when it moves; never edit the files it owns
(src/components/coach/ai-builder/*, src/api/aiBuilderApi.ts, the CoachWorkoutBuilderScreen hunk) except to import from them. Same
never-hidden rule: entry points show the paused state; only a 404 status hides them. RevisionHistorySheet uses the b#808 route (hidden if
404). Worktree /home/user/workspace/wt/B-AIB6-126-mobile. ONE mobile PR under 800 (target 600). Must be READY by 22:30 so it can merge
before 00:30. READY per _COMMON item 5. Report /home/user/workspace/ops/reports/B-AIB6-126.md.

# LENS PAIRS (one verdict each per PR at the exact head; the operator merges on dual APPROVE + green CI)
Common lens rules (all six lens jobs below): two independent lenses on the same queue; never read the other lens's verdict for that head
before posting yours. Before each review: `gh api repos/BradleyGleavePortfolio/<repo>/pulls/<n> --jq .head.sha`, the PR's comments
(READY line, earlier verdicts) and the CI state (`gh pr view <n> --repo ... --json statusCheckRollup`). Review only PRs whose latest
builder comment says READY FOR AUDIT at the CURRENT head (or that the operator names). If a lens of your model already posted a verdict
at the current head, skip it. If CI shows a real failure caused by the PR, REQUEST CHANGES naming the check.
Verdict comment FIRST LINE, exactly (ops/merge_if_dual.sh parses it; the dashes are em dashes U+2014):
`AUDIT Claude Opus 5.5 (<JOB>) — growth-project-<repo>#<n> @ <full 40-hex sha> — VERDICT: APPROVE`
or `AUDIT GPT-6.1 Sol (<JOB>) — growth-project-<repo>#<n> @ <full 40-hex sha> — VERDICT: REQUEST CHANGES`.
Then A/B/C counts, findings with ids B-<pr>-<n>, file:line, the one-sentence normal-user story for every B. Grade only against
_COMMON_126 "What you hunt": APPROVE when there is no B. Cs are a one-line list and never block. AI builder PRs also check the plan's
SAFE checklist 1-12 (plan section 2): a checklist item that fails for a normal coach or client on flip is a B. Re-check the head sha
right before posting. Write each verdict to /home/user/workspace/ops/aud-126/<JOB>/<repo>-<n>.md first. After each verdict append one
line to /home/user/workspace/ops/lanes126/notify/<JOB>.txt: `<repo>#<n> @ <sha8> <VERDICT> B=<n>`. Lenses run NO local
npm/jest/tsc/eslint except one targeted spec through heavy.sh when CI cannot answer the question. Lenses never push code, merge or
deploy. Time box 20 minutes per PR (T4 25). When your queue is empty, poll every 3 minutes (cheap: one gh call) for up to 30 minutes for
new READY PRs on your queue, then finish with your final answer; the operator will message you with new work.

## LB-OPUS-126 (Claude Opus 5.5) and LB-SOL-126 (GPT-6.1 Sol) — BACKEND lens pair
Queue in order: (1) b#808 @ 9487faa2 (AIB-4 status route, revisions list, manifest). OWNER ASKED FOR A CAREFUL REVIEW OF THE FLAG-SYNC
CHANGE: .github/workflows/fly-env-sync.yml now lets flag values contain `_` and `,`. Check: how values flow from
.github/fly-env-desired-state.json through scripts/fly-env/fly-env-manifest.js into flyctl (argv vs shell string; any eval, word
splitting, glob, newline or `=` injection; quoting), that `*` stays rejected for AI_GATEWAY_CAPABILITIES, that "unset" semantics and
the plan/apply confirm=SET gate are unchanged, that the precondition mwb-ai-live-needs-gateway cannot be bypassed, and that the five
names are all "unset" today. (2) b#809 and its split PR from B-AIB2-126 when READY. (3) B-AIB3-126's PR when READY. (4) B-CRON-126's PR
(scheduler registered twice) when READY. (5) B-R11F-126's Roman v1.1 flip PR(s) when READY. (6) any other backend PR on a branch
starting agent126/ with a READY comment.

## LM-OPUS-126 (Claude Opus 5.5) and LM-SOL-126 (GPT-6.1 Sol) — MOBILE AI builder lens pair
Queue in order: (1) m#439 (AIB-5 Ask AI) ONLY after B-AIB5P-126 posts its new READY comment (paused state, never hidden); review the
whole PR at that head (plan PART 1 + sections 3, 6; haptics, Reduce Motion, screen-reader labels, copy rules, works against the CURRENT
production backend where the status route 404s). (2) B-AIB6-126's PR when READY. (3) any agent126/ mobile PR from the FU builders if
the LF pair has not reached it.

## LF-OPUS-126 (Claude Opus 5.5) and LF-SOL-126 (GPT-6.1 Sol) — FOLLOW-UP lens pair (mobile + backend)
Queue: every READY PR from FU-CHECKIN-126, FU-BOOK-126, FU-COPY-126, FU-FIRSTRUN-126, FU-FOODLOG-126, FU-WORKLOG-126, in the order they
post READY. List: `gh pr list --repo BradleyGleavePortfolio/growth-project-<repo> --state open --json number,headRefName --jq
'.[]|select(.headRefName|startswith("agent126/fu-"))|.number'`. Mobile PRs first (they must merge before the 10-07 build freeze 09:30).

# PRODUCTION FINDING — duplicate scheduler (operator found 17:58)
Evidence: Fly logs since deploy 16 boot (00:40:58Z) show "drip-dispatcher tick skipped: prior tick still running" at EXACTLY :00 every
minute, from the very first minute, while ScheduledDrop has ZERO rows (runOnce is instant). ScheduleModule.forRoot() is imported twice:
src/app.module.ts:169 and src/data-export/data-export.module.ts:32 (since #171, 2026-05-12). On Nest 11 (@nestjs/core 11.1.27) dynamic
modules are keyed by reference by default, so two ScheduleModule instances each register every @Cron/@Interval: every timed job in the
app runs twice per schedule, concurrently. Guarded jobs skip the second copy (that is the warning); unguarded jobs run twice.

## B-CRON-126 (Claude Opus 5.5, BUILDER, T4 money) — every timed job runs once. Time box 50 min (hard stop 19:00).
Confirm the cause first with a small Nest testing-module probe or by reading @nestjs/core 11 module-key code in
/home/user/workspace/deps/backend/node_modules (if READY) — write the proof in your report. Smallest reversible fix: remove
`ScheduleModule.forRoot()` from data-export.module.ts imports (AppModule's forRoot is global); keep everything else. Add a regression
test that fails on main: e.g. a static test that `ScheduleModule.forRoot(` appears only in src/app.module.ts, and/or a testing-module
check that a decorated cron is registered once. Branch agent126/b-cron-126, worktree /home/user/workspace/wt/B-CRON-126-backend. ONE
backend PR (tiny). PR body: the user story ("every reminder, digest, billing and payout job ran twice at the same moment; now once") and
the proof. READY per _COMMON item 5. Report /home/user/workspace/ops/reports/B-CRON-126.md. Never deploy.

## AUD-CRONX-126 (Claude Opus 5.5, AUDITOR, read-only, T4 money) — what the double run could have done. Time box 40 min (hard stop 18:50).
List every @Cron / @Interval / @Timeout in src (about 35 files: `git -C /home/user/workspace/wt/RO-backend grep -l "@Cron(\|@Interval("
-- src`). For each: what it does, whether two concurrent copies in the SAME process are safe (instance flag, claim-by-write conditional
update, unique constraint, Stripe idempotency key, advisory lock) or not. Money first (charges, settlements, payouts, recurring
billing, dunning, refunds, invoices), then anything that sends to users (push, email, SMS, in-app), then data writes. For every job that
is NOT safe twice: one sentence on what a normal user would have seen (double push, double email, double charge attempt), and a
read-only SQL query (Postgres, quoted Prisma table names like "ScheduledDrop") the operator can run to check whether it actually
happened in production (e.g. duplicate rows per user per day). Do not run SQL yourself (you have no database access). Report
/home/user/workspace/ops/reports/AUD-CRONX-126.md with a table, the queries, B/U/C. No PRs. Notify line when done.

# SAFETY AND BUILD DAY

## SAFE-AIB-PRE-126 (Claude Opus 5.5, SAFETY PRE-PASS, T4 AI, read-only) — find flip blockers early. Time box 45 min (hard stop 18:55).
Run the plan's SAFE checklist 1-12 (plan section 2; output format as in SAFE-MWBAI-125, /home/user/workspace/ops/reports/SAFE-MWBAI-125.md)
against the OPEN PR heads, not main: b#808, b#809 (as of now; it is being split), m#439. Read via `git fetch -q origin
pull/<n>/head:refs/remotes/pr/<n>` in /home/user/workspace/wt/RO-backend or RO-mobile and `git show pr/<n>:<path>` (do not check out).
Also check SAFE-MWBAI-125's six blockers: which are closed by these PRs (file:line) and which are still open and owned by nobody. Output
per PR: blockers (B) with file:line and the smallest fix, so the builders can fix them before the lenses. Report
/home/user/workspace/ops/reports/SAFE-AIB-PRE-126.md. Then post ONE comment on each of b#808, b#809, m#439 whose first line is
`SAFETY PRE-PASS (SAFE-AIB-PRE-126) — growth-project-<repo>#<n> @ <sha> — <n> blockers` followed by the blocker list (this is not a
verdict; lenses still decide). Notify line when done. Never flip a flag.

## S-BUILDDAY-126 (GPT-6.1 Sol, DOCS, T0) — the owner's 10-07 build-day sheets, current. Time box 60 min (hard stop 19:10).
Inputs: /home/user/workspace/tgp-agent-context/handoffs/op-123/DEVICE_PASS_10-07.md and STORE_TEXT_10-07.md (written 10-05 from older
mains), SoT A1.7 (owner message rules: plain words, no terminal commands, no risk sections, never name the clinic partner) and the
merged mobile/backend PRs since those were written: `gh pr list --repo BradleyGleavePortfolio/growth-project-<repo> --state merged
--limit 200 --json number,title,mergedAt` (merged after 2026-10-05). Production flags: backend .github/fly-env-desired-state.json on
main; mobile eas.json profile "clinic" (extends "production"). Write two refreshed drafts:
/home/user/workspace/ops/reports/S-BUILDDAY-126/DEVICE_PASS_10-07.md (iPhone + Android tap-through: what to tap, what should happen,
in plain words; add the new day-1 features: Ask AI in the workout builder with its paused state, AI program approve-and-assign, PDFs and
videos for sale, leaderboard in Community, Health Connect, sign in with Apple, support report; mark each step client or coach account)
and /home/user/workspace/ops/reports/S-BUILDDAY-126/STORE_TEXT_10-07.md (store listing text and review notes updated so every claim is
true for this build; list each changed claim and why). Also a short list of every mobile PR merged since 10-05 in plain words
(…/S-BUILDDAY-126/WHATS_IN_THE_BUILD.md). No PRs; the operator commits these. Notify line when done.

# ROMAN v1.1 SWITCH-ON (owner 17:56: "Roman v1.1 switch-on PRs once the AI builder work is moving")

## B-R11F-126 (Claude Opus 5.5, BUILDER, T4 AI/config) — R11-F1 memory and R11-F2 playbook flip PRs. Time box 60 min (hard stop 19:20).
Read SoT A6 entries on Roman v1.1 and the AGENT 124 banner (`grep -n "R11-F1\|R11-F2\|A-ROMAN11-124\|ROMAN_MEMORY\|ROMAN_PLAYBOOK"
/home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md`), backend docs/runbooks/launch-flags.md (~line 135 and 190) and the
manifest notes for FEATURE_ROMAN_MEMORY / FEATURE_ROMAN_PLAYBOOK. Both migrations are deployed (deploy 15: 20270401000000 roman_memory,
20270402000000 coach_playbook). Verify every R11-F1 and R11-F2 precondition on main with file:line (slices merged and deployed, consent
gates, background cost cap, kill switch, mobile surfaces in the 10-07 clinic build or not needed). If all are met: open TWO small
manifest PRs (agent126/r11-f1-126: "FEATURE_ROMAN_MEMORY": "true"; agent126/r11-f2-126: "FEATURE_ROMAN_PLAYBOOK": "true"), each updating
the manifest note and the runbook row, with the precondition evidence in the body. If a precondition is NOT met: do not open that PR;
write the gap and the smallest fix in your report. READY per _COMMON item 5. Report /home/user/workspace/ops/reports/B-R11F-126.md.
Never run fly-env-sync, never deploy.

# FOLLOW-UP BUILDERS (mobile Us from agent 125's audits; must merge before the 09:30 freeze, so READY by 20:00)
Each: read the named sections of the named report in /home/user/workspace/ops/reports/, confirm the finding still holds on current main
(m#426-m#433 and b#786-b#807 fixed many things), then fix. ONE PR per repo, under 600 lines, branch agent126/fu-<name>-126, worktree
/home/user/workspace/wt/FU-<NAME>-126-<repo>. Mobile fixes must work against the CURRENT production backend. READY per _COMMON item 5.
Report /home/user/workspace/ops/reports/<JOB>.md. Time box 75 min (hard stop 19:25).

## FU-CHECKIN-126 (Claude Opus 5.5, T3 mobile) — coach check-in review + Coach Home leftovers.
AUDIT-06-125.md U4 ("Mark reviewed" on each unreviewed check-in in the coach client Timeline, POST
/coach/clients/:clientId/check-ins/:id/reviewed is live) and AUDIT-13-125.md U-A13-5 (Pending actions count), U-A13-6 (LTV:CAC hint
for a setting that does not exist: remove or reword truthfully), U-A13-7 ("Schedule call" toast "Booking integration pending": route to
the real booking flow or remove), U-A13-8 (At-Risk empty state jargon).

## FU-BOOK-126 (Claude Opus 5.5, T3 mobile) — coach booking leftovers.
AUDIT-04-125.md U-04-2 (booking window copy vs setting), U-04-3 (coach can mark a session completed / no-show; backend routes exist —
confirm), U-04-4 (CoachBookingInboxScreen formatRange: readable "Wed, Oct 7 · 9:00–9:30 AM").

## FU-COPY-126 (GPT-6.1 Sol, T2 mobile) — dead rows, generic errors, stale "coming soon".
AUDIT-17-125.md U-5 (duplicate bulk-invite rows: keep the v2 one), U-6 (redeemers 404 "coming soon" copy: route is live), U-7 (generic
"Please try again." / "Unknown error" alerts -> specific copy); AUDIT-03-125.md N2 / U3 (coachless "Message your coach" -> open the
in-app coach-code sheet); AUDIT-08-125.md U7 (alerts titled "Error", "Recipe not found." on network error); AUDIT-12-125.md U-12-4
(client Settings "Units" and "Calorie Display" rows that nothing reads: remove them). T2 only; if anything needs auth/money/PII code,
stop and report it (promotion rule).

## FU-FIRSTRUN-126 (Claude Opus 5.5, T3 core flow, backend + mobile) — Day-1 answers must save.
AUDIT-01-125.md U-01-2 (Day-1 fallback writes rejected with 400 when the last onboarding answer did not reach the server: mobile
src/screens/day-one/api.ts:121-181 vs the backend DTOs; smallest fix in the report "Not fixed") and U-01-3 with the recommended default
copy (completion eyebrow "YOUR FIRST STEP", check-in card "Check off today's habits"). m#411 (agent 124, offline resume) is being closed
by the operator; do not build on it.

## FU-FOODLOG-126 (Claude Opus 5.5, AUDITOR-BUILDER, T3; owner TOP PRIORITY) — food logging on the 10-07 build.
Trace the client food-logging path as a normal user on the clinic build: search, barcode, quick add, custom foods, recent/favourites,
edit and delete an entry, meal sections, daily totals vs targets, the coach's view of the log, offline add then reconnect (one normal
offline moment only). Find Bs and Us per _COMMON_126 (C gets zero time) and fix the ones that are small and safe. Before fixing, list
open PRs touching the same files.

## FU-WORKLOG-126 (Claude Opus 5.5, AUDITOR-BUILDER, T3; owner TOP PRIORITY) — workout logging on the 10-07 build.
Trace the client workout path: today's assigned workout, start, log sets/reps/weight, rest timer, swap an exercise, finish and the
summary, history and PRs, the coach seeing the session, a coach edit reaching the client, one normal offline moment. Find Bs and Us
and fix the small, safe ones. Do not touch CoachWorkoutBuilderScreen or src/components/coach/ai-builder/* (AI builder PRs own them).

# OWNER 18:01 SCOPE (binding): "The double scheduler is now top priority, above everything else." / "Check every money job (billing,
# settlement, payouts, dunning) to confirm it can't do the same work twice." / "Tonight, app changes are limited to the AI builder plus
# fixes for food logging, workout logging and money; everything else waits until after the build. Sub-coach waits."
# OWNER 18:03 OVERRIDE (binding, replaces the scope line above): "disregard what I said, everything is in your scope IF ITS NOT OPENING OLD
# WORK ALREADY CLOSED OR COMPLETED". FU-CHECKIN / FU-BOOK / FU-COPY / FU-FIRSTRUN relaunched 18:04 (never reopen closed PRs, e.g. m#411).
# LF lens pair reviews all FU PRs.

# MONEY JOBS — CAN ANY OF THEM DO THE SAME WORK TWICE? (read-only auditors, Claude Opus 5.5, T4 money). Time box 45 min (hard stop 18:55).
Context: section "PRODUCTION FINDING — duplicate scheduler" above. Until B-CRON-126 deploys, every @Cron/@Interval in production runs
as TWO concurrent copies in the same process at the same second; webhooks can also arrive twice. For EVERY timed job, queue consumer,
webhook handler and retry path in your area (list them with file:line first: `git -C /home/user/workspace/wt/RO-backend grep -n
"@Cron(\|@Interval(\|@Timeout(" -- src` plus the services they call): can two concurrent runs, or a re-run after a crash, do the same
money work twice (create two charges/invoices/payment intents, settle twice, transfer/payout twice, refund twice, send two dunning
emails, double-count a fee or earnings)? For each, cite the guard with file:line: claim-by-write conditional update (WHERE status=...
returning only won rows), unique DB constraint (prisma/schema.prisma @@unique / migration), deterministic Stripe idempotency key (show
how the key is built: must be identical across the two copies), advisory lock, instance flag (note: an instance flag only protects the
same instance; both copies call the same singleton, so it does protect against this bug but not against two machines). Verdict per job:
SAFE (guard cited) / UNSAFE (one plain sentence: what a normal coach or client would see) / UNKNOWN (what is missing). For every UNSAFE
or UNKNOWN: a read-only Postgres query (quoted Prisma table names, last 30 days) the operator can run to count whether it actually
happened, and the smallest fix (file:line, ~lines). No PRs, no SQL yourself (no database access), no Stripe calls. Report
/home/user/workspace/ops/reports/<JOB>.md (table + queries + B/U/C); notify line /home/user/workspace/ops/lanes126/notify/<JOB>.txt.
## AUD-MJ-BILL-126 — recurring billing and purchases: subscriptions/recurring packages, invoice creation, charge attempts, checkout
   receipts, purchase fan-out (src/billing, src/packages, src/payments, src/stripe* and their crons/webhooks).
## AUD-MJ-SETTLE-126 — settlement and fees: ChargeSettlementService (incl. SFEE invoice backfill), platform/service fees, refunds,
   credit notes, ledger entries.
## AUD-MJ-PAYOUT-126 — payouts: Stripe Connect transfers, payout sync (B-PAYOUTSYNC-123), coach earnings/balances, transfer.failed alerts.
## AUD-MJ-DUNNING-126 — dunning v1 and v2 (FEATURE_DUNNING_V2 is off in production: check what runs with it off), payment retries,
   card-update reminders, pause/cancel on failed payment, past-due emails/pushes.

# ROMAN v1.1 — consent surface in the 10-07 build (operator 18:10, after B-R11F-126: flips not ready; M3a/M4/M5/P3b/P4 unbuilt)
## B-R11C-126 (Claude Opus 5.5, BUILDER, T4 consent, backend + mobile) — v5 memory consent offer, server-gated. Time box 90 min (hard stop 19:45).
Read /home/user/workspace/ops/reports/B-R11F-126.md (rows 3 and 7, "F1 items 4 and 5"). Today GET /me/ai-consent returns
`upgrade` (the v5 memory copy) to EVERY v4 client (backend src/ai-consent/ai-consent.service.ts:254), even though Roman memory does not
exist yet; the 10-07 mobile build ignores it (mobile src/api/aiConsentApi.ts:42-56, consentVersion.ts:40 pins client-ai-v4).
Goal: clients on the 10-07 build can give the v5 memory consent LATER, when memory actually ships, without a new store build.
Backend PR (tiny, branch agent126/r11c-126-backend): return `upgrade: null` unless FEATURE_ROMAN_MEMORY is exactly "true" (reuse
isRomanMemoryEnabled from roman-memory.feature.ts:14); test that fails on main (flag unset -> upgrade null; flag true + base scope ->
v5 copy). Mobile PR (branch agent126/r11c-126-mobile): parse `upgrade` (zod, optional/nullable, tolerant of its absence on old
servers); when non-null, Settings > Privacy > Roman and AI shows the v5 offer with the server's copy and grants client-ai-v5 with its
sha256 exactly as the backend expects (read the grant DTO); when null, nothing new is shown. Keep v4 first-consent flow unchanged.
Copy rules (no first person, no emojis, no exclamation marks, no generic errors). Each PR under 400 lines. Do NOT touch the privacy
policy (that sentence ships with the memory flip, not before). READY per _COMMON item 5 (job B-R11C-126) on both PRs by 19:45 so the
mobile one merges before the 09:30 freeze. Report /home/user/workspace/ops/reports/B-R11C-126.md.

# OWNER 18:12 (binding): "just hold at 20+ agents, then in 30 minutes stop-and-drain back to 10". At 18:42 the operator sends WRAP UP to
# every worker except: B-CRON-126, LB-OPUS-126, LB-SOL-126, B-AIB2-126, B-AIB3-126, B-AIB6-126, LM-OPUS-126, LM-SOL-126, FU-FOODLOG-126,
# FU-WORKLOG-126. WRAP UP = within 10 minutes push complete work, post READY/STATUS, finish the report with ## HANDOFF, remove worktrees.

# MONEY FIX (operator 18:20, from AUD-MJ-BILL-126)
## B-GUEST-126 (Claude Opus 5.5, BUILDER, T4 money) — guest checkout: never charge without an account, never email twice. Time box 70 min (hard stop 19:35).
Read /home/user/workspace/ops/reports/AUD-MJ-BILL-126.md fully (UNSAFE rows and "Noticed outside scope", lines ~90-111). Production
"GuestCheckout" has 0 rows today, so nobody is affected yet; this is before-launch hardening of a money path.
(1) VERIFY first (code + a targeted spec), then fix if confirmed: a guest buyer who is slow to pay or retries after a card decline
can end up charged with no account (lost-webhook-reconcile.service.ts:179-216 + guest-checkout.service.ts:919-931; smallest fix in the
report). User story must be one plain sentence. If it does not reproduce, say why with file:line and do not change it.
(2) The "converted" write at guest-checkout.service.ts:1645 is unconditional, so the webhook and the reconciler (or a retry) can both
send the guest the welcome/receipt email: make the write conditional (claim-by-write on the prior status) and send the email only from
the copy that wins (~12 lines) + a spec that fails on main. Branch agent126/b-guest-126, worktree
/home/user/workspace/wt/B-GUEST-126-backend, ONE backend PR under 400 lines. READY per _COMMON item 5. Report
/home/user/workspace/ops/reports/B-GUEST-126.md. Never touch Stripe or production.

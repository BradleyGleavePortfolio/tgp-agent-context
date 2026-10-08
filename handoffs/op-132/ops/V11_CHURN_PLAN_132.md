# V11_CHURN_PLAN_132 — Churn detection v1.1 for coaches with a handful of clients (V11-CHURN-PLAN-132, agent 132, 2026-10-08 14:20 PDT)
# Read-only plan. Code read at backend main cd0f90ed and mobile main edf36a88 (fetched 13:44 PDT). Re-fetched 14:09 PDT: backend main is
# 63441690 (b#887 merged; only package files changed) and mobile main is a3a1c18e (m#572, m#574 merged; neither touches a file this plan
# edits). Every finding is "from the code" (no test was run by this planner); the one arithmetic check was run in node. Structure per the 13:47 addendum: PART A = the
# owner's idea exactly as stated; PART B = additional ideas, separate and optional. Nothing from PART B is inside PART A.

## Summary (one screen, plain words)

**The owner's ask (13:41):** "The churn detection system! Thats ALSO needs to be made to OUTSTANDING quality in V1.1". Entry: honest,
explainable signals, no false risk, respects the client's sharing switches, actionable for the coach, for coaches with a handful of clients.

**What exists.** Every night at 04:00 UTC the server scores each client from check-ins, weigh-ins, workouts, food logs, app opens, the
coach's own messages and finance-app signals (src/ptm). A coach sees a red/amber/green level and one reason in Command Center > At risk, the
Overview "Clients at risk" tile, Clients > At risk (Risk board) and Actions. A "crossed into the red risk band (NN%)" alert also goes to the
notification inbox and push. An AI win-back draft, edit and send flow exists on the server, but the app never calls it. The lists already
need all four Coach sharing switches (CF-SHARE-GATE-128). b#886 (CHURN-LABELS-132) hides finance reasons. It had both lens APPROVEs
(board 13:47); b#887 has now merged and b#886's head f60b0aad (main merged in) is green on CI (15 passed, 1 skipped). It waits only for
the merge-only delta check and the merge.

**What is wrong today (from the code):**
1. A brand-new client who has not logged anything yet scores 0.6000000000000001. That is over the 0.6 red line, so the coach gets a critical
   "crossed into the red risk band (60%)" alert on day one. Missing logs count as misses from the first day, finance counts for everyone, and
   a rounding edge pushes 0.6 over the line.
2. Reasons fire for things the coach never asked for. For example, a coach who does not use weigh-ins still sees "No weight logged in
   last 14 days".
3. "3+ missed check-ins" really counts late check-ins, so a client who stops completely never gets it. Two factors can never fire because
   nothing emits their signal.
4. "Last active" resets whenever the coach sends a message.
5. The red alerts, the alert inbox, GET /coach/alerts and the broadcast "risk" segment ignore Coach sharing. The alert text also shows the
   raw percentage that coaches are never meant to see.
6. Archived clients stay on every at-risk list. A sub-coach sees an empty Risk board.
7. It is not actionable on the phone. Each client shows one label, with no "why", no draft or send, and no Pause or Handled. The
   ClientRiskDetail screen is unreachable because it reads an owner-only API.

**PART A: 7 PRs in 4 waves.** Backend PRs are T4: Claude Opus 5.5 builds and both lenses review. Mobile PRs are T3. Every new surface sits
behind FEATURE_CHURN_V11, which stays off until both lenses and the owner say yes.
- B1 CHURN-HONEST: the engine counts only real stops, gives new clients a grace period, measures check-in silence truthfully, and leaves
  finance and the coach's own silence out of client risk.
- B2 CHURN-ALERTS: alerts and the broadcast segment follow Coach sharing and never show a percentage.
- B3 CHURN-LISTS: archived clients leave the lists, "last active" means the client, and sub-coaches see their assigned clients.
- B4 CHURN-STATE: the coach can Pause or mark Handled, and the app remembers when they reached out and whether the client came back.
- B5 CHURN-NEEDSYOU: one "Needs you" list with plain-sentence reasons and an "as of" time.
- M1 CHURN-M-LIST: the At risk tab redone in calm words, with a Why disclosure, Pause and Mark handled.
- M2 CHURN-M-WRITE: one forest "Write to Alex" button (AI draft, edit, send), after which the row shows "Reached out" and later "Came back".

**Owner decisions (A9, with defaults):**
- Show levels as words, not red or amber dots.
- The coach's own message gap stops counting as client risk.
- Finance leaves the score.
- The "risk" broadcast segment follows Coach sharing.
- App opens stay as a signal, and Trust & Privacy gets one sentence about them.
- Pause reasons are neutral codes only.
- At most one push per client per 7 days.
- Sub-coaches see assigned clients only.
- When to switch FEATURE_CHURN_V11 on.

**PART B (optional pitches):** learning what brings clients back, automatic outcome labels, a renewal and program-end radar, a Monday digest,
client "I'm away", Roman's gentle return, a team health view, an owner calibration report, wearable context, coach-chosen signals, and
partial-sharing checks.

---

# PART A — the owner's idea exactly as stated: churn detection at outstanding quality

## A1. Inventory (code wins over specs; production switch state from backend main .github/fly-env-desired-state.json)

None of PTM_SCORING_ENABLED, PTM_SCORING_CRON, COACH_ALERT_RED_TRANSITION_ENABLED, PTM_WEIGHTED_ACTIVATION_OUTCOMES or
PTM_RECOMPUTE_BATCH_LIMIT appears in the desired-state file, so production runs the code defaults: scoring on at 04:00 UTC, red alerts on,
and the weighted engine threshold at 20 labels. FEATURE_COACH_BROADCASTS is true. The churn draft has no flag; it is gated by AI consent
box 2.

| Piece | State | Where (backend main cd0f90ed / mobile main edf36a88) | Switch in production |
|---|---|---|---|
| Signal collection (ClientSignal, 11 emitters) | built and on | src/ptm/ptm.service.ts; hooks table src/ptm/README.md; coach sends write `message_received` + `coach_note_received` on the CLIENT (src/messaging/messaging.service.ts:856-865); app_open in src/auth/auth.guard.ts; finance via src/admin/federation | none (always on) |
| Heuristic engine (14 factors, sum, clamp) | built and on | src/ptm/ptm-heuristic.service.ts:74-289; buckets src/ptm/ptm.types.ts:110-122 (red = > 0.6) | PTM_SCORING_ENABLED unset = on (src/ptm/ptm.scheduler.ts:46) |
| Nightly recompute + red-transition alert | built and on | src/ptm/ptm-recompute.service.ts:111-167 (alert :129-167, message with % :149-155), batch = users with any signal in 30 days :172-187 | COACH_ALERT_RED_TRANSITION_ENABLED unset = on (:135) |
| Weighted engine v2 | built, inactive | src/ptm/ptm-weighted.service.ts (auto-activates at 20 labelled outcomes; label text :159 "Weighted: <signal> observed N (cohort weight W)") | PTM_WEIGHTED_ACTIVATION_OUTCOMES unset = 20 |
| Outcome labels (training set) | partly built: owner-only, manual | src/admin/ptm/admin-ptm.service.ts:198 (only writer) | none |
| Owner PTM admin | built and on (owner only) | src/admin/ptm/* (RolesGuard 'owner', admin-ptm.controller.ts:46) | none |
| Coach Risk board API | built and on | src/coach/coach.controller.ts:94-121 -> admin-ptm.service.ts:404-540; roster = `coach_id = caller` only (src/coach/coach.service.ts:364-372) | none |
| Command Center at-risk list + KPI | built and on | src/coach/command-center/command-center.service.ts getAtRisk (bucket red/amber, top label, fallback copy), KPI `at_risk_count` = risk > 0.3 | none |
| Churn at-risk (top 3 + suggested action), AI draft, send, dismiss | built, no app caller | src/coach/command-center/churn-intervention.service.ts; routes command-center.controller.ts:227-347 | AI egress box-2 consent; rate limit 20/h |
| Factor label sharing map | partly built (b#886 open, CI green) | src/coach/command-center/churn-factor-scopes.ts (b#886 head f60b0aad) | none |
| Coach alerts + inbox + push | built and on | src/coach/coach-alerts.service.ts:88-114 (no consent check); src/notifications/emitters/coach-alert.emitter.ts:60-91 (inbox body = alert text); GET /coach/alerts src/coach/coach-alerts.controller.ts:48 (no filter); check-in alerts src/check-ins/check-ins.service.ts:178, :189 (call sites), :206-249 (createAlert, no consent check) | coach_alert push/in-app default on (src/notifications/notifications.service.ts:191-193) |
| Broadcast "risk" segment | built and on | src/broadcasts/segment-resolver.service.ts:165-184 (no Coach sharing check) | FEATURE_COACH_BROADCASTS true |
| Mobile Command Center > At risk | built and on | src/screens/coach/command-center/AtRiskScreen.tsx (dot + one label; row -> ClientDetail) | none |
| Mobile Overview "Clients at risk" tile | built and on | src/screens/coach/command-center/OverviewScreen.tsx:166-174 | none |
| Mobile Clients > At risk pill -> Risk board | built and on | src/screens/coach/ClientsListScreen.tsx:185-211; src/screens/coach/RiskBoardScreen.tsx (bucket word, last signal; row -> ClientDetail :150-158) | none |
| Mobile Actions (alert rows incl. high churn risk) | built and on | src/screens/coach/command-center/ActionQueueScreen.tsx | none |
| Mobile ClientRiskDetail (why list, history, fixed nudge) | built, unreachable | src/screens/coach/ClientRiskDetailScreen.tsx reads owner-only /admin/ptm/clients/:id (src/services/ptmApi.ts:182-183); registered src/navigation/CoachNavigator.tsx:383, no navigate call (AUDIT-13-125); docs/reachability.md:223 lists "Risk board row" as its entry (stale: that row opens ClientDetail) | none |
| Legacy Dashboard risk widget | built, owner only, unreachable | src/screens/coach/CoachHomeScreen.tsx:136-143, :354-376 (reachability.md:225, entry "none (legacy CoachHomeScreen)") | none |
| In-app AI win-back draft, pause, handled, reached out, came back | not built | ChurnIntervention has status, sent_at and dismissed_at, but no came-back field (prisma/schema.prisma:5738-5768) | none |
| Expectations (what the coach asked for) | not built (data exists) | ClientWorkoutAssignment scheduled_for / completed_at (prisma/schema.prisma:2664-2700); no check-in cadence column | none |
| New-client grace | not built | User.created_at exists (schema.prisma:180); no coach-link date column | none |

## A2. Findings that block "outstanding" (from the code; B = ordinary-use harm, one plain sentence each)

- **CH-B1 False red on day one.** For a new client who opened the app but has not logged yet, the factors are coach_note_gap_10d +0.15 (no
  coach message yet), weight_skip_14d +0.15, workout_skip_10d +0.10, meal_skip_7d +0.08 and finance_eod_skip_5plus +0.12. They sum to
  0.6000000000000001 (checked in node), which is > AMBER_MAX 0.6 (ptm.types.ts:120), so the client is red. The previous prediction is
  null, so ptm-recompute.service.ts:138-162 sends a critical alert, inbox row and push "<name> crossed into the red risk band (60%)."
  (ptm-heuristic.service.ts:104-199: an absent history is Infinity days and counts as a miss). How a coach hits it: they invite a client
  in the morning and wake up to a red alert. If the coach did send a welcome, the client still shows amber 0.35 with "No weight logged in
  last 14 days".
- **CH-B2 Finance for everyone.** `finance_eod_skip_5plus` adds +0.12 to every client without the finance app
  (ptm-heuristic.service.ts:183-199). This is CHURN-LABELS-132 Proposed 1. b#886 hides the label, not the score.
- **CH-B3 Reasons without an expectation.** Weigh-in, workout and food-log "skip" factors fire for clients who were never asked to log
  that (ptm-heuristic.service.ts:118-181). Only check-ins have a daily norm, and workout assignments are ignored even though
  ClientWorkoutAssignment knows what was scheduled and missed. How a coach hits it: a strength-only coach sees "No meal logged in last 7
  days" on every client.
- **CH-B4 The check-in reason measures the wrong thing.** `checkin_miss` is emitted only when a check-in arrives after a gap of 3 or more
  days (check-ins.service.ts:174). So "3+ missed check-ins in last 14 days" (ptm-heuristic.service.ts:79-92) means "3 late check-ins".
  A client who stops checking in never gets it, and the consecutive-misses alert fires only when they come back.
- **CH-B5 Dead factors.** No code emits `streak_dropped` or `consistency_low` (src/ptm/README.md signal table). "Streak dropped" (+0.20)
  and "Consistency below 60%" (+0.10) can therefore never fire.
- **CH-B6 "Last active" is the coach.** last_signal_at is the newest ClientSignal of any type (admin-ptm.service.ts:494, :533-534;
  churn-intervention.service.ts:236, :274-301). A coach message writes two signals on the client, so the Risk board shows "last signal:
  just now" for a client who has been silent for 3 weeks.
- **CH-B7 Coach silence counted as client risk.** coach_note_gap_10d (+0.15, ptm-heuristic.service.ts:104-116) measures the coach and
  shows it as a reason the client may quit.
- **CH-B8 Alerts ignore Coach sharing and show the raw score.** createAlert has no consent check (coach-alerts.service.ts:88-114). The
  inbox row body is the alert text (coach-alert.emitter.ts:66-70), GET /coach/alerts lists every row (coach-alerts.controller.ts:48), and
  the payload carries risk_score (ptm-recompute.service.ts:156-161). Only the Command Center list filters these rows
  (command-center.service.ts:160-168). The "(60%)" in the alert text exposes the number that admin-ptm.service.ts:516-519 nulls for
  coaches. The check-in alerts (consecutive_misses, streak_dropped) are also created and pushed without a habits-sharing check.
- **CH-B9 Broadcast "risk" segment ignores sharing.** segment-resolver.service.ts:165-184 picks clients by PTM bucket without checking Coach
  sharing (CHURN-LABELS-132 Proposed 3).
- **CH-B10 Archived clients stay "at risk".** The rosters filter `deleted_at` only (src/sub-coach/sub-coach-scope.service.ts:153, :161;
  coach.service.ts:365-367), so a former client stays on the lists and keeps getting nightly scores and alerts.
- **CH-B11 Sub-coach Risk board is empty.** riskBoardClientIds uses `coach_id = caller` (coach.service.ts:364-372), but a sub-coach owns no
  clients through coach_id (the Command Center already fixed this with SubCoachScopeService). The churn draft IDOR check is coach_id
  only too (churn-intervention.service.ts generateChurnDraft). This is tenancy (T4) and overlaps the TEAMS pillar.
- **CH-B12 Not actionable on the phone.** The At risk row shows one label. There is no "why", no draft or send in the app, and no pause
  or handled. Because of that, a coach who already spoke to a client is reminded again every night.
- C (edge, deferred to 10k clients):
  - Notification rows written before the fix keep their percentage text.
  - `days_since_checkin` on /at-risk is really days since any signal (the app does not show it).
  - A client silent for over 30 days keeps their last prediction because the batch skips them.
  - The weighted engine would auto-activate at 20 owner labels with engine-text reasons; it is inactive, see PART B-2.
  - Check-in backfill dates are recorded as "now".

## A3. Pathway placement (coach home = the Command Center tab; nothing is cut; flag off = today's screens unchanged)

| Surface | Before (route, taps from home) | After (FEATURE_CHURN_V11 on) | Replaces |
|---|---|---|---|
| Command Center > At risk tab | Coach tabs > Command Center (home) > top tab "At risk" (1 tap). Rows: colour dot + one label. Row tap -> ClientDetail (2 taps) | Same tab, same label "At risk" (tab labels unchanged). Sections "Needs you" then "Watch" (words, no colours), each row: first name, one plain reason, "Reached out Tue" / "Paused until Oct 20" when true. Row tap -> ClientDetail (2 taps, unchanged). Trailing "Why" disclosure (2 taps) expands in place, one row at a time: up to 3 reasons with numbers, up to 2 "Going well" lines, "Your last message: 12 days ago", "Checked 4:00 this morning"; ONE forest primary "Write to Alex" (3 taps -> draft sheet, Send = 4 taps); text actions "Mark handled" and "Pause..." (date + neutral reason sheet). Footer when true: "2 clients are not included because they do not share all four kinds of logs with you." | The one-label row; the unreachable ClientRiskDetail why-list and fixed nudge |
| Overview > "Clients at risk" tile | 0 taps (on home), tap -> At risk tab (1) | Same place and target; count = "Needs you" count; subtext in words | count of risk > 0.3 |
| Clients tab > header "At risk" pill -> Risk board | 2 taps; rows: name, email, bucket word, last signal (any kind); filters All/Red/Amber/Green; row -> ClientDetail (3) | Same route and pill; rows add the top reason and "Last active" (client-originated); filter chips keep 4 slots relabelled All / Needs you / Watch / Steady; row -> ClientDetail (3, unchanged) | colour-coded bucket, coach-polluted "last signal" |
| Actions tab (alert rows) | 1 tap; "high churn risk" rows -> ClientDetail | Same; row text "May need a check-in: no check-in for 6 days" | "crossed into the red risk band (60%)" |
| Notification inbox (header bell) + push | push -> inbox row "<name> crossed into the red risk band (60%)."; deep link tgp://coach/clients/<id> | Only for clients sharing the logs behind it; text "<first name> may need a check-in: <reason>."; same deep link; at most once per client per 7 days | percentage alert |
| Write flow (new) | none in the app (server-only draft/send) | Why disclosure > "Write to Alex" > sheet: draft from shared reasons (or "Write your own" when AI is not allowed), edit, Send, Cancel | the Coach AI tab is not touched |
| ClientRiskDetail screen | unreachable (owner-only API) | unchanged in M1/M2; retired in the optional T1 cleanup after M2 (Removed surfaces entry, D11) | n/a |
| ClientDetail, legacy Dashboard, Broadcast composer | as today | not touched in PART A (m#573 owns ClientDetail now); the composer's "risk" segment silently follows sharing | n/a |

Taps from home to a sent message: 4 (At risk > Why > Write > Send). Everfit needs its web dashboard, then expanding the row, then
"Draft a reach out" (see A5).

## A4. Design rules every PR names (mobile docs on main; owner: "LUXURIOUS, SIMPLE, MENTALLY DELOADING, AND CALM!")

- **docs/QUIET_LUXURY_DOCTRINE.md**
  - §1: tokens only; Cormorant Garamond at weight 500 or less, for the screen title only.
  - §2: nothing shows unless it is real. Behind the flag the legacy list stays; there is no "coming soon".
  - §3: no celebration when a client "came back"; it is one plain line.
  - §4: no hype and no exclamation marks. Copy says "may need a check-in", never "at risk of quitting" or "churn".
  - §5: radius 4, bone page, forest single accent.
  - §6: no banner or FAB.
  - §8: README rows in the same PR.
  - §9: paste the checklist into each mobile PR.
- **Mobile screen redo rules (op-131 _COMMON_131 lines 280-310)**
  - 1: honest copy driven by state, with a test per variant. Nothing true to say means nothing is shown.
  - 2: no dead buttons.
  - 3: monochrome data. Levels are words, not red dots. Hairlines, not boxes. One forest primary per screen, so only one row expands at a
    time. 44 pt targets. Text 13 pt or larger. Tabular numerals for day counts.
  - 4/6: profile stays at 2 taps, and each PR body has the "Routes/actions before -> after" table plus a parity test.
  - 5: details sit behind the Why disclosure.
  - 7: useTheme semantic tokens only (docs/dark-mode.md).
  - 8: no tab or navigator change.
- **Supporting mobile docs**
  - docs/SKELETON_LOADERS.md: SkeletonScreen on first load.
  - QuietStates: one calm error with "Try again".
  - docs/HAPTICS.md: HapticPressable "light" for the disclosure and Mark handled, the existing send intent for Send.
  - Motion: 300 ms or less for the expand.
  - docs/charting.md: no chart in PART A (PART B-1 may use TgpSparkline per its theming rules).
  - docs/share-card.md: never on this surface, because client risk is never shareable.
  - src/theme/README.md: WCAG AA pairings.
  - ENGINEERING_RULES.md §1 tenant isolation (scope every query), §3 errors (no raw 5xx text), §5 DTO hygiene, §6 env validation for the
    new switch, §7 no dead code, §10 new-feature checklist.

## A5. Best-in-class rivals and how TGP becomes superior (not a prettier copy)

| Product | What it does well | Where it falls short | TGP superior move (PART A) |
|---|---|---|---|
| ABC Trainerize | Auto client tags: "Not Signed In Lately" (adjustable 7 days), "Not Messaged Lately", "Not Responded Lately", low workout or nutrition compliance, program expiring, failing payments ([Trainerize help](https://help.trainerize.com/hc/en-us/articles/208689156-Auto-Client-Tags-Attending-To-Clients-Needing-Attention)). Weekly "clients needing attention" email ([Trainerize help](https://help.trainerize.com/hc/en-us/articles/208688826-Managing-General-Notification-and-Auto-Message-Settings)). Compliance counts only trainer-scheduled workouts ([Trainerize help](https://help.trainerize.com/hc/en-us/articles/360022256632-Measuring-Client-Engagement-and-Compliance)) | Tags name the problem ("Not Signed In Lately") but the help pages read show no per-client sentence saying what changed, by how much, or as of when | Reasons only for what the coach scheduled (B1 extends Trainerize's scheduled-only rule to every reason), joined into one sentence-level picture, consent-aware per reason |
| Everfit | Check-in Dashboard with At Risk / Need Attention / On Track. Coach-set signals and thresholds; "No activity" after 14 days ([Everfit help](https://help.everfit.io/en/articles/15999847-configure-your-check-in-dashboard)). Follow-up alerts when an at-risk client has not replied in 24 hours or the status changes week to week ([Everfit help](https://help.everfit.io/en/articles/16000596-check-in-dashboard-review-client-insights)). Manual status change with a reason for the week ([Everfit help](https://help.everfit.io/en/articles/16000615-check-in-dashboard-complete-client-check-ins)). Olly AI "Draft a reach out" ([Everfit help](https://help.everfit.io/en/articles/15393086-olly-on-check-in-dashboard-beta)) | The dashboard is opened from the web app and is in beta ([Everfit help](https://help.everfit.io/en/articles/14495409-check-in-dashboard-overview-beta)). Status is weekly. The pages read describe no tracking of whether a reach-out worked | Phone-first in 4 taps. Nightly reasons, each with an "as of". Drafts written only from what the client shares. Pause and Handled with neutral reasons. "Came back" closes the loop (B4/B5/M2) |
| TrueCoach | One-screen dashboard: "Needs Attention" (missed workouts, declining compliance, unusual activity), "Due Soon" (program nearing its end), quick-connect actions such as Send a message, and Reminders for vacations and check-ins ([TrueCoach](https://truecoach.co/features/dashboard/)). Compliance = exercises completed vs assigned over 7/30/90 days ([TrueCoach help](https://help.truecoach.co/en/articles/2403919-managing-your-clients)) | A third-party write-up says the dashboard names who is slipping and the coach writes the rest, and that the flag is a 20% compliance drop ([webrun.ai](https://webrun.ai/automate/apps/truecoach)) | The reason comes as a sentence with its numbers, plus "Going well" lines, and the first draft is written for the coach from the reasons the client shares |
| Kahunas | Client dashboard shows last activity, package and weeks with the coach, and a wearable "Health Score AI" (sleep, stress, anxiety) that coaches are told to use to message clients ([Kahunas help](https://help.kahunas.io/en/articles/223-client-dashboard-walkthrough)) | A third-party review reports a client app around 3 stars with crashes ([Trainera](https://trainera.fit/blogs/trainerize-vs-kahunas)). Mental-state scores are sensitive | TGP never infers mental state and never scores health. Reasons are behaviour facts the client chose to share (A9 D7, PART B-9) |
| Gainsight (best outside fitness) | Scorecards: each measure has help text explaining its levels, a validity period that shows when a score is stale, and alerts on significant score change ([Gainsight](https://www.gainsight.com/blog/scorecards-quantifying-customer-health/)). Onboarding accounts are scored on different measures than mature ones ([Gainsight](https://www.gainsight.com/blog/customer-health-scores/)). Subjective measures can be set by hand ([Gainsight docs](https://support.gainsight.com/gainsight_nxt/05Scorecards/01About/Scorecards_Overview)) | Built for B2B customer-success teams: an admin configures grading schemes, weights and validity periods ([Gainsight docs](https://support.gainsight.com/gainsight_nxt/05Scorecards/01About/Scorecards_Overview)); not shaped for a coach with 5 clients on a phone | The same discipline at coach scale: each reason is one explained sentence, "Checked 4:00 this morning" plays the validity period, the first week is a grace period, and Pause or Handled is the manual measure |

**What makes TGP superior (one line each):**
- Consent-aware at the reason level. The rival pages read describe no client control over what feeds the coach's view.
- Expectation- and tenure-aware, so new and unasked-for gaps are never "risk".
- Explained in sentences with numbers and freshness.
- One calm action with an AI draft that cites only shared facts.
- A closed loop (reached out, then came back).
- No notification storms: one push per client per week at most.

## A6. TGP's proposition (SoT A7.5: "the fitness platform for the post-AI world"; AI-native, not AI-added)

The engine does the noticing every night. The coach does the human part: one tap opens an AI draft written from the reasons the client
shares, and the coach edits and sends it. That gives one coach the leverage of a team (A7.5 principle: "AI drafts give one coach the
leverage of a team"). The system then checks whether the client came back, so the coach learns what works without spreadsheets. Roman
between sessions is PART B-6, kept separate.

## A7. The PR plan (IDs CHURN-<NAME>-132; each under 800 lines; failing-first tests fail on main and pass at head)

| # | ID | Repo | Tier / builder | Goal in plain words | Files (exclusive within its wave) | New switch | Size | Depends on |
|---|---|---|---|---|---|---|---|---|
| B1 | CHURN-HONEST-132 | backend | T4 health data; Claude Opus 5.5 + both lenses | A client counts only for something they were doing and stopped; new clients, missing apps and the coach's own silence never count | src/ptm/ptm-heuristic.service.ts, src/coach/command-center/churn-factor-scopes.ts (new keys), test/ptm-heuristic.service.spec.ts, NEW test/churn-honest-132.spec.ts, src/ptm/README.md, docs/ptm.md | none (only removes false reasons; PTM_SCORING_ENABLED stays the kill switch, D12) | ~550 | b#886 merged |
| B2 | CHURN-ALERTS-132 | backend | T4 privacy/push | Coaches are alerted only about clients who share the logs behind the alert, never with a percentage, never for archived clients | src/ptm/ptm-recompute.service.ts, src/coach/coach-alerts.service.ts, src/check-ins/check-ins.service.ts (alert emitters only), src/broadcasts/segment-resolver.service.ts, test/ptm-recompute.service.spec.ts, test/broadcasts/segment-resolver.spec.ts, NEW test/churn-alerts-sharing-132.spec.ts, src/coach/README.md (alerts section) | none (fix) | ~450 | b#886 merged |
| B3 | CHURN-LISTS-132 | backend | T4 privacy + tenancy | Lists show only current clients, "last active" means the client, sub-coaches see their assigned clients | src/admin/ptm/admin-ptm.service.ts, src/coach/command-center/command-center.service.ts, src/coach/command-center/churn-intervention.service.ts, src/coach/coach.service.ts (riskBoardClientIds via SubCoachScopeService), test/coach-ptm-risk-board.spec.ts, test/command-center.service.spec.ts, test/churn-intervention.service.spec.ts, NEW test/churn-lists-132.spec.ts, src/admin/ptm/README.md | none (fix) | ~450 | b#886 merged; TEAMS dedup of the sub-coach item (D10) |
| B4 | CHURN-STATE-132 | backend | T4 PII + tenancy + schema | The coach can Pause (until a date, neutral reason) or mark Handled (7 days); the app records reached-out and came-back | prisma/schema.prisma + NEW migration, src/account-deletion/account-deletion.manifest.ts, src/data-export/data-export.service.ts + README, NEW src/coach/churn/{churn-v11.feature.ts, churn-state.service.ts, churn-state.controller.ts, churn.module.ts, README.md}, src/app.module.ts (register), src/common/env-validation.ts, .github/fly-env-desired-state.json, docs/runbooks/launch-flags.md, .env.example, NEW test/churn-state-132.spec.ts | FEATURE_CHURN_V11 (only 'true' is on; unset = off; new routes 404 while off) | ~650 | b#884 merged; not in flight with ROMAN-GATES-132, ROMAN-ACTIONS-132 or ROMAN-OUTREACH-132 (shared env/schema/manifest/export files) |
| B5 | CHURN-NEEDSYOU-132 | backend | T4 privacy + tenancy | One list the app can trust: who needs the coach, why in sentences with numbers, what is going well, when it was checked, what the coach already did | NEW src/coach/churn/{needs-you.service.ts, needs-you.controller.ts, came-back.scheduler.ts}, src/coach/churn/churn.module.ts, src/coach/churn/README.md, src/coach/command-center/command-center.service.ts (KPI when on), src/ptm/ptm-recompute.service.ts (alert respects pause/handled/reached-out), NEW test/churn-needs-you-132.spec.ts, NEW test/churn-came-back-132.spec.ts | uses FEATURE_CHURN_V11 | ~700 (over 800: came-back scheduler moves to a follow-up in the same wave) | B1, B2, B3, B4 merged |
| M1 | CHURN-M-LIST-132 | mobile | T3; Claude Opus 5.5; both lenses | The coach sees in calm words who needs them and why, and can pause or mark handled | src/screens/coach/command-center/AtRiskScreen.tsx, NEW src/components/coach/NeedsYouRow.tsx, NEW src/screens/coach/command-center/PauseSheet.tsx, src/services/commandCenterApi.ts, src/screens/coach/command-center/OverviewScreen.tsx, src/screens/coach/RiskBoardScreen.tsx, src/screens/coach/command-center/README.md, src/screens/coach/RISK_BOARD.md, docs/reachability.md (rows 211, 222-223), docs/QUIET_LUXURY_DOCTRINE.md (surface row), NEW src/__tests__/churnNeedsYou132.test.tsx | reads the server: GET answers 404 while off -> legacy list, unchanged | ~650 | B5 merged; m#573 merged (doctrine file) |
| M2 | CHURN-M-WRITE-132 | mobile | T3 | "Write to Alex" opens a draft from what Alex shares; edit, send; the row then says "Reached out" and later "Came back" | NEW src/screens/coach/command-center/WriteToClientSheet.tsx, src/components/coach/NeedsYouRow.tsx, src/services/commandCenterApi.ts, src/screens/coach/command-center/README.md, src/screens/TrustCenterScreen.tsx ("Who can see your data" line, :313; D3) + src/screens/__tests__/trustCenterTruth.test.tsx, NEW src/__tests__/churnWrite132.test.tsx | same | ~550 | M1 merged |
| (opt) | CHURN-M-RETIRE-132 | mobile | T1 | Remove the unreachable ClientRiskDetail screen (D11) | src/screens/coach/ClientRiskDetailScreen.tsx, src/navigation/CoachNavigator.tsx:23,192,383, src/services/ptmApi.ts (getClientPtm stays for owner tools if used), RISK_BOARD.md + reachability.md "Removed surfaces" | none | ~380 (mostly deletion) | M2 merged |

**Engine rules in B1 (the heart of "no false risk"):**
- **A stop needs a habit.** A silence reason fires only if the habit existed before the gap:
  - check-ins: 3 or more in the 14 days before the gap;
  - weigh-ins: 2 or more in the 30 days before;
  - food logs: on 3 or more days in the 14 days before;
  - workouts: from assignments when any exist (scheduled_for in the last 14 days, before today, completed_at null: "Missed 3 of the last
    4 assigned workouts", which needs at least 2 missed and at least half), otherwise 2 or more in the 21 days before.
  An absent history means "not started", which shows nothing.
- **Grace.** No silence reason until the client has been with the coach for that reason's window. Use User.created_at, or the
  invite-redemption date if the client linked later; the builder checks the schema, since there is no coach-link column today.
- **Check-in silence, honestly measured.** NEW key `checkin_silence_4d`, "No check-in for N days", read from the latest `checkin_streak`
  signal age (one is emitted on every check-in); +0.20. `checkin_miss_3plus` keeps its key, is relabelled "Checked in late 3 times in
  14 days" and moves to +0.08.
- **Finance.** `finance_eod_skip_5plus` only fires for clients with at least one `finance_eod` signal ever (D4).
- **Coach silence.** `coach_note_gap_10d` stays in factors with contribution 0 and the label "No message from you in 10+ days", which
  B5 shows as the "You" line (D2). The protective `coach_note_recent` is unchanged.
- **Rounding.** The stored riskScore is rounded to 2 decimals, so 0.6000000000000001 becomes 0.6 (amber), and every reader benefits
  without being edited.
- **Scope map.** New keys go into churn-factor-scopes.ts: `checkin_silence_4d` -> habits, `workout_assigned_missed` -> workouts. b#886 is
  fail-closed, so a key left out would stay hidden.

**Level rule in B5:**
- `needs_you`: rounded risk over 0.6, or any reason of 0.15 or more.
- `watch`: risk over 0.3 and up to 0.6.
- Excluded from both: archived, the first 7 days, Paused until a date, Handled (7 days), and "Reached out" (7 days after a send, unless a
  new high reason appears after it).
- The level always needs all four switches (CF-SHARE-GATE-128). `not_checked_count` gives the honest footer.
- `as_of` = computed_at. Up to 3 reasons, using coachVisibleFactors from b#886. Up to 2 "Going well" lines.
- Response: `GET /coach/churn/needs-you` -> `{ as_of, counts{needs_you, watch, not_checked}, items[{ client_id, first_name, level,
  reasons[{key,text,days|count}], going_well[text], you_line|null, status{paused_until, pause_reason, handled_until, reached_out_at,
  came_back_at}, suggested:'write'|'none' }] }` and `GET /coach/churn/clients/:id` (same shape for one client).
- Came-back: a nightly job at 04:30 UTC sets ChurnIntervention.returned_at when a client-originated signal arrives within 7 days of
  sent_at.

**Failing-first tests (each fails on main):**
- **B1**
  - A day-2 client with no logs and no coach message: score 0.3 or less, no factor, no alert (main: red 0.6000000000000001).
  - No finance app: no finance factor.
  - Last check-in 6 days ago after daily check-ins: "No check-in for 6 days" (main: nothing).
  - 3 of 4 assigned workouts missed: that sentence.
  - A strength-only client with no food history: no meal factor.
  - Coach silent for 12 days while the client is active: score unchanged.
- **B2**
  - A client who turned food logs off: no red alert row, push or inbox row, and GET /coach/alerts omits the old risk row.
  - The alert text has no "%".
  - An archived client: no alert.
  - The "risk" segment excludes non-sharing and archived clients.
  - Check-in alerts need habits sharing.
- **B3**
  - An archived client is absent from the Risk board, at-risk, churn-at-risk and the KPI.
  - "Last active" ignores message_received and coach_note_received.
  - A sub-coach sees an assigned client on /coach/clients/risk-board (main: empty), and does not see an unassigned one.
- **B4**
  - Routes answer 404 while off.
  - A sub-coach can pause only assigned clients.
  - Pause is capped at 60 days, and reasons outside {away, break, other} return 400.
  - Manifest and export include the new rows.
  - Desired state shows "unset".
- **B5**
  - Paused, handled and reached-out clients leave needs_you, and come back on a new high reason.
  - The first 7 days are excluded.
  - not_checked_count is correct.
  - came_back_at is set by a client signal and not by a coach message.
  - The KPI equals counts.needs_you when on.
- **M1**
  - Flag off: the legacy list renders identically.
  - Sections, word levels, the Why disclosure (one at a time), the as-of line, the honest empty state "No one needs you right now.
    Checked 4:00 this morning.", the footer only when true, Pause and Handled calls.
  - Parity: row -> ClientDetail, the 4 Risk board filters, Overview tile -> At risk.
- **M2**
  - The draft loads with an idempotency key; Send fires once.
  - AI refusal copy: "Alex has not allowed AI drafts. Write your own message below."
  - Any other draft failure falls back to "Write your own".
  - After a send the row shows "Reached out today".
  - No exclamation marks.
  - The Trust & Privacy sentence (D3) appears.

**Waves (no two PRs in flight share a file):**

| Wave | Start when | PRs |
|---|---|---|
| 0 | now | prerequisites: b#887 is done (merged, backend main 63441690); b#886 at f60b0aad (main merged in, CI green) gets the merge-only delta check and merges; b#884 merges; m#573 merges |
| 1 | b#886 merged | B1, B2, B3 in parallel (disjoint files above); B4 too if ROMAN-GATES-132, ROMAN-ACTIONS-132 and ROMAN-OUTREACH-132 are not in flight, else right after they merge |
| 2 | B1-B4 merged | B5 |
| 3 | B5 merged (+ m#573) | M1 |
| 4 | M1 merged | M2 (then the optional CHURN-M-RETIRE-132) |

Merge order: b#886, then B1/B2/B3 (any order), B4, B5, M1, M2. Switch-on is D9.

**Overlap check (13:47 board; V11_PLAN_132.md):**
- Open PRs:
  - b#886 owns churn-intervention.service.ts, command-center.service.ts, churn-factor-scopes.ts and test/command-center.service.spec.ts,
    so wave 1 waits for it.
  - b#884 owns the desired-state file (B4 waits).
  - m#573 owns ClientDetailScreen.tsx, src/screens/coach/README.md and QUIET_LUXURY_DOCTRINE.md (M1 waits; PART A never edits
    ClientDetail).
  - b#882, b#883, b#885 and m#575 share no file (b#887 has merged). The old dependabot PRs (b#615-621, m#279-286) touch only package
    files; m#302 (import) shares none.
- Roman v1.1:
  - ROMAN-GATES-132 shares env-validation, desired state, launch-flags and .env.example with B4.
  - ROMAN-ACTIONS-132 and ROMAN-OUTREACH-132 share schema, manifest and export with B4.
  - No Roman PR touches src/ptm, src/coach or src/broadcasts.
  - Roman D3 ("sensitive signals never a client message") holds: PART A never messages a client without the coach pressing Send.
- Other V11 plans (read 14:15 PDT in /home/user/workspace/ops; their rule: one PR per shared file in flight, the first READY merges
  first, the other runs `git merge origin/main` before opening):
  - TEAMS-SHARE-RULE-132 and TEAMS-PERF-132 share command-center.service.ts, coach.service.ts and churn-intervention.service.ts with
    B3 and B5 (V11_TEAMS_PLAN_132.md:227, :238-239). Default: the operator drops B3 item (c), the sub-coach Risk board scope, into
    TEAMS-SHARE-RULE-132, the team sharing rule for every reader including churn (D10). B3 keeps (a) and (b).
  - Config files (env-validation, desired state, launch-flags, .env.example): B4 with TEAMS-SWITCH-132, ROMAN-GATES-132,
    FUNNEL-GATES-132, REFERRAL-SCHEMA-132 and the importer switch PRs.
  - Schema, manifest, export, app.module: B4 with ROMAN-ACTIONS-132, ROMAN-OUTREACH-132, TEAMS-ROUTING-132, TEAMS-DIGEST-132,
    REFERRAL-*, and IMPORTER PEOPLE-1 / LEARNRUN-2.
  - Mobile: CoachNavigator.tsx (only the optional CHURN-M-RETIRE-132) with TEAMS-UI-132, TEAMS-ROUTING-M-132, FUNNEL-EDITOR-M-132,
    REFERRAL-SCREEN-M-132 and the importer mobile PR. docs/reachability.md and QUIET_LUXURY_DOCTRINE.md (M1) with the IMPORTER
    JOURNEY PRs.
  - PART A never edits ClientsListScreen.tsx, CommandCenterScreen.tsx or ClientDetailScreen.tsx.
  - No other plan touches src/ptm, coach-alerts, segment-resolver, check-ins.service.ts, AtRiskScreen, RiskBoardScreen,
    OverviewScreen, commandCenterApi or TrustCenterScreen.

## A8. Ready-to-paste JOBS132 entries

```
## CHURN-HONEST-132 (builder CH1, Claude Opus 5.5, backend, T4 health data; one PR; time box 2 h)
Worktree /home/user/workspace/wt/CHURN-HONEST-132-backend, branch agent132/churn-honest-132 (off backend main AFTER b#886 merges). LEFTHOOK=0.
PR B1 of the churn v1.1 train (/home/user/workspace/ops/V11_CHURN_PLAN_132.md A7 "Engine rules in B1"). In src/ptm/ptm-heuristic.service.ts:
a silence factor fires only when the habit existed before the gap and the client has been with the coach for the window (absent history =
nothing); NEW checkin_silence_4d "No check-in for N days" (+0.20) from the latest checkin_streak signal age; checkin_miss_3plus relabelled
"Checked in late 3 times in 14 days" (+0.08); workouts from ClientWorkoutAssignment when any exist ("Missed N of the last M assigned
workouts"); finance_eod_skip_5plus only with finance history; coach_note_gap_10d contribution 0, label "No message from you in 10+ days";
riskScore rounded to 2 decimals. Add the new keys to src/coach/command-center/churn-factor-scopes.ts. Docs: src/ptm/README.md factor table,
docs/ptm.md. Failing-first: NEW test/churn-honest-132.spec.ts (A7 B1 list; the day-2 client must fail on main with 0.6000000000000001 red)
+ test/ptm-heuristic.service.spec.ts updated. heavy.sh, one file at a time. Under 800 lines. Title "fix(ptm): churn reasons only for real
stops; new clients, missing apps and coach silence never count (T4)". npm audit line per Q10 if still red. READY. End.

## CHURN-ALERTS-132 (builder CH2, Claude Opus 5.5, backend, T4 privacy/push; one PR; time box 2 h)
Worktree /home/user/workspace/wt/CHURN-ALERTS-132-backend, branch agent132/churn-alerts-132 (off backend main AFTER b#886 merges). LEFTHOOK=0.
PR B2 (V11_CHURN_PLAN_132.md A2 CH-B8, CH-B9). src/ptm/ptm-recompute.service.ts maybeFireRedTransitionAlert: no alert unless the client
shares all four (ConsentService.grantedScopesByClient with the head coach; owner bypass as today), not archived, not in the first 7 days;
text "<first name> may need a check-in: <top coach-visible reason, from coachVisibleFactors (b#886)>." with no percentage; payload without
risk_score. src/coach/coach-alerts.service.ts listForCoach: check-in alerts only for habits-sharing clients, risk alerts only for all-four
(same rule as command-center.service.ts:160-168, implemented locally; do not edit command-center.service.ts). src/check-ins/check-ins.service.ts:
consecutive_misses / streak_dropped alerts only with habits sharing. src/broadcasts/segment-resolver.service.ts 'risk': all-four sharing,
not archived. src/coach/README.md alerts section. Failing-first: NEW test/churn-alerts-sharing-132.spec.ts (A7 B2 list) +
test/ptm-recompute.service.spec.ts + test/broadcasts/segment-resolver.spec.ts. Under 800 lines. Title "fix(alerts): churn alerts and the
risk segment follow Coach sharing; no percentage (T4)". READY. End.

## CHURN-LISTS-132 (builder CH3, Claude Opus 5.5, backend, T4 privacy + tenancy; one PR; time box 2 h)
Worktree /home/user/workspace/wt/CHURN-LISTS-132-backend, branch agent132/churn-lists-132 (off backend main AFTER b#886 merges). LEFTHOOK=0.
PR B3 (A2 CH-B6, CH-B10, CH-B11). Archived clients out of getRiskBoardForCoach (src/admin/ptm/admin-ptm.service.ts), getAtRisk and the
at_risk_count KPI (src/coach/command-center/command-center.service.ts), getChurnAtRisk (churn-intervention.service.ts). last_signal_at /
last_active_at / the fallback label read client-originated signals only (signal_type not in message_received, coach_note_received):
admin-ptm.service.ts:494, churn-intervention.service.ts:236. src/coach/coach.service.ts riskBoardClientIds uses SubCoachScopeService
(head = roster, sub = assigned; owner bypass unchanged) - drop this item if the operator gives it to a TEAMS PR. src/admin/ptm/README.md.
Failing-first: NEW test/churn-lists-132.spec.ts (A7 B3 list) + the three existing specs. Under 800 lines. Title "fix(coach): at-risk lists
show current clients, the client's own last activity, and a sub-coach's assigned clients (T4)". READY. End.

## CHURN-STATE-132 (builder CH4, Claude Opus 5.5, backend, T4 PII + tenancy + schema; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/CHURN-STATE-132-backend, branch agent132/churn-state-132 (off backend main AFTER b#884 merges; never in flight
with ROMAN-GATES-132, ROMAN-ACTIONS-132 or ROMAN-OUTREACH-132). LEFTHOOK=0.
PR B4. NEW model ClientRiskState {id, coach_id (head coach), client_id, paused_until?, pause_reason? enum away|break|other, handled_until?,
updated_by, updated_at; @@unique([coach_id, client_id])}; ChurnIntervention + returned_at?, returned_signal?; one migration; manifest rows
(delete with client or coach); export rows for the client. NEW src/coach/churn/: churn-v11.feature.ts (isChurnV11Enabled, only 'true',
pattern src/roman/tools/roman-tools.feature.ts), churn-state.service.ts, churn-state.controller.ts (PUT/DELETE
/coach/churn/clients/:clientId/pause {until <= 60 days, reason}, POST/DELETE .../handled (7 days); scope via SubCoachScopeService; audit
row per change; 404 while off), churn.module.ts, README.md; register in src/app.module.ts. Switch rows: env-validation, desired state
"unset" + note "off until both lenses and the owner say yes; emergency kill: unset", docs/runbooks/launch-flags.md, .env.example =false.
Failing-first: NEW test/churn-state-132.spec.ts (A7 B4 list) + manifest test + test/ci/fly-env-manifest.spec.ts. Under 800 lines. Title
"feat(coach): pause and handled state for churn, reached-out tracking (switch off) (T4)". READY. End.

## CHURN-NEEDSYOU-132 (builder CH1 again, Claude Opus 5.5, backend, T4 privacy + tenancy; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/CHURN-NEEDSYOU-132-backend, branch agent132/churn-needsyou-132 (off backend main AFTER B1-B4 merge). LEFTHOOK=0.
PR B5 (A7 "Level rule in B5"). NEW src/coach/churn/needs-you.service.ts + needs-you.controller.ts: GET /coach/churn/needs-you and GET
/coach/churn/clients/:id (shape in A7), behind isChurnV11Enabled (404 off), scope via SubCoachScopeService, all four switches for the level,
reasons via coachVisibleFactors, not_checked count. NEW came-back.scheduler.ts (04:30 UTC; returned_at when a client-originated signal
arrives within 7 days of sent_at). src/coach/command-center/command-center.service.ts: at_risk_count = counts.needs_you when on.
src/ptm/ptm-recompute.service.ts: no alert while paused, handled or reached out. README rows. Failing-first: NEW
test/churn-needs-you-132.spec.ts + NEW test/churn-came-back-132.spec.ts (A7 B5 list). Under 800 lines (else came-back moves to a
follow-up). Title "feat(coach): one Needs you list with plain reasons, as-of and coach state (switch off) (T4)". READY. End.

## CHURN-M-LIST-132 (builder CH5, Claude Opus 5.5, mobile, T3; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/CHURN-M-LIST-132-mobile, branch agent132/churn-m-list-132 (off mobile main AFTER CHURN-NEEDSYOU-132 and m#573 merge).
PR M1 (A3 table, A4 rules). AtRiskScreen.tsx: GET /coach/churn/needs-you; 404 -> today's list unchanged. Sections "Needs you" / "Watch"
(words, no colour dots), NEW src/components/coach/NeedsYouRow.tsx (row tap -> ClientDetail as today; trailing "Why" disclosure, one open at a
time: reasons, Going well, You line, "Checked <time>"; text actions Mark handled and Pause...), NEW PauseSheet.tsx (date <= 60 days; Away /
Taking a break / Other). OverviewScreen tile count + words; RiskBoardScreen rows add the top reason and client "Last active", filters
relabelled All / Needs you / Watch / Steady. Mobile redo rules: parity table, truthful sweep, README rows (command-center README,
RISK_BOARD.md, reachability.md 211/222-223, doctrine surface row). Failing-first: NEW src/__tests__/churnNeedsYou132.test.tsx (A7 M1 list).
Under 800 lines. Title "feat(coach): At risk shows who needs you and why, in calm words (server switch) (T3)". READY. End.

## CHURN-M-WRITE-132 (builder CH5 again, Claude Opus 5.5, mobile, T3; one PR; time box 2 h)
Worktree /home/user/workspace/wt/CHURN-M-WRITE-132-mobile, branch agent132/churn-m-write-132 (off mobile main AFTER CHURN-M-LIST-132 merges).
PR M2. NEW src/screens/coach/command-center/WriteToClientSheet.tsx from NeedsYouRow's single forest primary "Write to <first name>":
POST /coach/command-center/churn-at-risk/:clientId/draft {idempotency_key}, editable text, Send -> POST
/coach/command-center/churn-interventions/:id/send {message_text, idempotency_key}, Cancel -> /dismiss; AI-consent refusal (status code: read it from
churn-intervention.service.ts) -> "<first name> has not allowed AI drafts. Write your own message below."; any other draft failure ->
empty composer "Write your own". Row shows "Reached out
today" / "Came back <day>". src/screens/TrustCenterScreen.tsx "Who can see your data" line (:313) + "Your coach can also see when you last opened the app." (update src/screens/__tests__/trustCenterTruth.test.tsx) (D3, only if the
owner says yes). Failing-first: NEW src/__tests__/churnWrite132.test.tsx (A7 M2 list). Under 800 lines. Title "feat(coach): write to a
client from At risk with a draft from what they share (T3)". READY. End.
```

## A9. Owner decisions (recommended defaults; no money, no new vendor; health data only with consent; no store-rule impact)

| # | Decision | Recommended default |
|---|---|---|
| D1 | Churn levels on coach screens as words ("Needs you", "Watch", "Steady") instead of red/amber/green dots | Yes (doctrine: monochrome data, no red) |
| D2 | The coach's own message gap stops counting as client risk; shown as "Your last message: N days ago" | Yes |
| D3 | App opens stay a signal (not a log; no switch) and Trust & Privacy says "Your coach can also see when you last opened the app." (CHURN-LABELS Proposed 2) | Yes |
| D4 | Finance leaves the score unless the client has finance history (labels already follow finance.summary in b#886) (Proposed 1) | Yes |
| D5 | Broadcast "risk" segment uses the same all-four sharing rule (Proposed 3) | Yes |
| D6 | Weighted engine: no change in v1.1 (inactive; reaches coaches only after 20 owner labels); coach copy and an explicit switch come with PART B-2 (Proposed 4) | Yes, and the owner does not label 20 outcomes before B-2 |
| D7 | Pause reasons are neutral codes only (Away, Taking a break, Other), no free text, no health reasons, up to 60 days | Yes |
| D8 | At most one "may need a check-in" push per client per 7 days; none in the first 7 days or while paused/handled/reached out; COACH_ALERT_RED_TRANSITION_ENABLED stays the kill switch | Yes |
| D9 | FEATURE_CHURN_V11 on when M2 is in an installed build, both lenses approved B4/B5/M1/M2, and the owner says yes | On for all coaches at once (one switch) |
| D10 | Sub-coaches see and act on assigned clients only on every churn surface (Risk board, list, Write) | Yes; TEAMS may own the Risk board scope fix |
| D11 | Retire the unreachable ClientRiskDetail screen (owner-only API) in a T1 cleanup after M2 | Yes |
| D12 | B1-B3 ship without a new switch (they remove false or leaking output) | Yes |

Spend: none. Drafts use the existing churn draft endpoint, the existing Anthropic client and its 20/hour limit. Whether a draft counts
against the coach's AI allowance was not verified; the CH5 builder checks it from the code and reports it (no estimate).

---

# PART B — additional ideas (optional; pitched separately; none is inside PART A)

| # | Idea in plain words | Why it makes TGP superior | Rival gap it exploits | Size | Cost | Depends on |
|---|---|---|---|---|---|---|
| B-1 | "What brings them back": a calm monthly line per coach ("4 of 5 clients you wrote to came back within a week"), plus per-reason hit rates that tune that coach's windows (for example, a weekend-off roster gets a longer check-in window) | Precision a coach can feel; the system learns each coach's clients without data science | Everfit and Trainerize thresholds are manual workspace settings ([Everfit](https://help.everfit.io/en/articles/15999847-configure-your-check-in-dashboard), [Trainerize](https://help.trainerize.com/hc/en-us/articles/208689156-Auto-Client-Tags-Attending-To-Clients-Needing-Attention)) | 2 PRs (backend T4, mobile T3) | none | B4, B5 |
| B-2 | Automatic outcome labels (archived with a reason, package cancelled, refund) feed ClientOutcome, plus an explicit weighted-engine switch with coach copy | Real ground truth instead of owner hand labels; the weighted engine becomes honest before it ever reaches a coach | Gainsight Smart Scores predict an outcome from historical data ([Gainsight](https://www.gainsight.com/blog/creating-a-balanced-scorecard-in-gainsight/)); TGP has no such history yet, so automatic labels create it | 2 PRs (backend T4) | none | B4 |
| B-3 | Renewal and program-end radar: "Plan ends in 5 days", "Package renews in 3 days", "Payment failed" as reasons (read-only; dunning v2 state) | The biggest churn moments of paid coaching sit in one list with training and engagement | TrueCoach "Due Soon" ([TrueCoach](https://truecoach.co/features/dashboard/)) and Trainerize "program expiring" / "failing payments" tags ([Trainerize help](https://help.trainerize.com/hc/en-us/articles/208689156-Auto-Client-Tags-Attending-To-Clients-Needing-Attention)) are separate flags | 2 PRs (backend T4 money read, mobile T3) | none (no Stripe call) | B5 |
| B-4 | Monday digest: one calm push at 8:00 local, "2 clients may need you this week", opening Needs you | A weekly rhythm without email noise | Trainerize sends a weekly needing-attention email ([Trainerize](https://help.trainerize.com/hc/en-us/articles/208688826-Managing-General-Notification-and-Auto-Message-Settings)) | 1 PR | none (push only) | B5 |
| B-5 | Client "I'm away until Oct 20" from More > Coach: pauses churn reasons and tells the coach | Respects client autonomy, and the coach's list stays true without guessing | The rival pages read describe coach-side tools only: Trainerize deactivation ([Trainerize](https://help.trainerize.com/hc/en-us/articles/208689116-How-to-Deactivate-and-Reactivate-Clients)), Everfit manual status ([Everfit](https://help.everfit.io/en/articles/16000615-check-in-dashboard-complete-client-check-ins)), TrueCoach vacation reminders ([TrueCoach](https://truecoach.co/features/dashboard/)) | 2 PRs (backend T4, mobile T3) | none | B4 |
| B-6 | Roman gentle return: with the client's Roman outreach switch on, when a client drifts Roman offers a smaller week ("a 20-minute version"), never mentions risk, and the coach row says "Roman offered a lighter week" | AI-native between sessions (A7.5); the client gets help before the coach has to chase | Trainerize segments clients who "stopped engaging" into automated email flows ([Trainerize blog](https://www.trainerize.com/blog/how-to-turn-prospects-into-clients-with-email-marketing/)) | 2 PRs (T4) | existing AI pools | ROMAN-OUTREACH-132, B5; Roman D3 holds |
| B-7 | Team health: the head coach sees each sub-coach's Needs-you count and median time to reach out | Leverage for small teams | Trainerize Studio shows each trainer's client compliance and weekly logins, and can tag clients a trainer has not messaged ([Trainerize Studio FAQ](https://resources.trainerize.com/studio-faq)); time to reach out and came-back rates are TGP's addition | 1-2 PRs (T4 tenancy) | none | TEAMS plan, B5 |
| B-8 | Owner calibration report: flags raised, came back, archived within 30 days, false-flag rate per reason (admin only) | Keeps the engine honest as TGP scales | Gainsight alerts on significant score changes ([Gainsight](https://www.gainsight.com/blog/scorecards-quantifying-customer-health/)); a per-reason false-flag rate is TGP's addition | 1 PR | none | B-2 |
| B-9 | Wearable context (only with Health sharing): "Sleep down 1.5 h this week" as context, never risk, never a mental-state score | Context a coach can act on kindly | Kahunas shows "Health Score AI (sleep, stress, anxiety)" ([Kahunas](https://help.kahunas.io/en/articles/223-client-dashboard-walkthrough)) | 2 PRs (T4 health) | none | HealthKit/Health Connect sharing scopes |
| B-10 | Coach-chosen signals: "What matters in your coaching: check-ins, workouts, weigh-ins, food logs" | The coach's standard, not ours | Everfit lets the coach tune signal thresholds ([Everfit](https://help.everfit.io/en/articles/15999847-configure-your-check-in-dashboard)), but the dashboard is opened from the web app ([Everfit](https://help.everfit.io/en/articles/14495409-check-in-dashboard-overview-beta)) | 2 PRs (backend T4 schema, mobile T3) | none | B1, B4 |
| B-11 | Partial-sharing check: for a client who shares 3 of 4 logs, compute the level only from what they share (today they are simply not checked) | More clients covered without reading anything unshared | The rival pages read describe no client sharing control over the coach's view | 1-2 PRs (T4 privacy) | none | B5 |

---

## Appendix — what this plan did not verify
- No tests were run. All B items are "from the code"; the day-one red is backed by the node sum 0.6000000000000001 > 0.6.
- Production values come from the desired-state file, not live Fly secrets. Live coach and client counts were not read (no Supabase
  query: not needed for the plan).
- The default Coach sharing switch state for new clients was not checked. CH-B1's alert fires regardless of sharing (CH-B8).
- Rival facts come from vendor help pages; the TrueCoach 20% and Kahunas rating figures come from third-party pages, as marked.

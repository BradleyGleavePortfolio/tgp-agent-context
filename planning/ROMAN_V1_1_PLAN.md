# Roman v1.1 — from "a quick glance" to a coach-trained butler who watches everything

Written by operator agent 120, 2026-10-05, at the owner's request (DECISION_LOG.md, 09:57 PDT 10-05). Status: PLAN, revision 2 (owner
feedback 10:44 PDT 10-05: watching, butler and hyper-specific scopes approved; memory and coach twin revised below). Open decisions in section 9. Nothing here changes day 1. Day 1 ships the upgrades already built (section 1).

## 0. The goal in one paragraph

Today Roman reads one fixed snapshot of the client (about 2,000 tokens, capped at 3,500), answers the question, and forgets. In v1.1
Roman becomes three things at once:
- A student of the coach: he learns how this coach programs, cues, adjusts, and talks, and answers the way this coach would.
- A watcher: he sees every log, check-in, wearable sync, missed session and message as it happens, and keeps a running, cited memory
  of each client.
- A butler and friend: he speaks first when something matters, remembers what the client told him, does small jobs for them, and
  gives advice that names their own numbers, their own patterns and their coach's own rules.

The test for "hyper-intelligent": every answer contains at least one fact the client did not type in that conversation, at least one
link to the coach's own approach, and nothing generic that would fit any other client.

## 1. Where day 1 leaves Roman (the base v1.1 builds on)

| Piece | What it gives | PR |
|---|---|---|
| Client context | One snapshot per turn: profile, goals, injuries, targets, today's food, 7-day food, plan, last 8 workouts, 30-day weight, last 7 check-ins, 7 days of wearable aggregates, coach guidelines, last 8 coach messages, own posts, meal plan | #667, #665 |
| Safety | Safety router for medical and crisis topics, reply post-check, crisis templates, clearance instruction | #666, #669 |
| Live turns | Grounding and guardrails in real chats; daily AI spend cap per client | #668, #669 |
| Quality gate | 30 scripted conversations (G1-G30) run on every change | #670 |
| Chats | Clients list, reopen and delete their conversations | mobile #331 (split) |
| Approve-to-adjust | Roman proposes recovery-based workout changes; the coach approves, edits, dismisses or undoes | #655, mobile #337 |

Limits that v1.1 removes: a fixed snapshot with no memory between turns; no knowledge of the coach beyond pasted guidelines; silent
until asked; one model call per turn with no way to look further; 7-day wearable window; no pattern detection; no actions.

## 2. Pillar A — Memory: Roman sees everything about his client, directly

What the client feels: "He remembered my knee from three weeks ago, that I travel on Thursdays, and that I hate oats."

Owner direction (10:44): Roman reads the database and logs for each client directly; clients do not delete specific items from Roman's
view.

Design:
- Live reads, not a copy: Roman reads the client's own records straight from the production database through read tools scoped to
  that client (section 6): logs, check-ins, workouts, weight, wearables, meal plans, messages with the coach, bookings, adjustments,
  app activity. No separate fact store to drift out of date.
- Timeline: one ordered view of every event for the client, built from the existing tables and the app activity logs (no new copy of
  the data), so Roman can walk back through months in order.
- Rolling summaries (a cache, not a second source of truth): a background job writes daily, weekly and monthly summaries per client
  with links back to the source rows, so long histories fit in a turn. They are rebuilt from the database whenever needed.
- Things the client tells Roman ("night shifts", "two kids", "hates oats", "left knee surgery 2019") are saved as Roman's notes on the
  client, with the source message and date, and an expiry for things that change. Roman updates them when the client says something
  new; there is no client control to remove single items from Roman's view.
- Transparency stays read-only: GET /roman/context/me (already built) shows what Roman used; nothing on that screen deletes anything.
- Deleting the account still erases everything, Roman's notes and summaries included (existing delete-account path and deletion
  manifest), as the privacy policy promises.
- Retrieval: Postgres with pgvector (a Supabase extension) for meaning search over summaries and notes, exact queries for numbers.
- Unchanged unless the owner rules otherwise (section 9): never other users' rows; coach private session notes, bloodwork and purchases
  stay out.

## 3. Pillar B — Watching: Roman notices patterns before anyone asks

What the client feels: "Your HRV has been under your normal for four days and you slept under six hours three nights running; your
coach usually drops volume when that happens. Want me to ask for a lighter session tomorrow?"

Design:
- Personal baselines: for each client and metric (sleep, HRV, resting heart rate, steps, weight, protein, training volume, adherence),
  a rolling personal normal and range. Roman talks in "your normal", not population averages.
- Signal detectors (code, not the model): deviation from baseline, streaks, missed-session runs, plateau, rapid weight change, protein
  shortfall streak, late-night logging, check-in sentiment drop. Each detector emits an `RomanInsight` with the exact numbers and dates.
- Pattern finder (weekly): correlations inside one client's own data with plain-language guardrails (minimum sample size, no medical
  claims): "Your squat sessions after under six hours of sleep averaged 8 percent less volume (n=9)."
- The model explains and ranks insights; it never invents them. Every number Roman says must come from an insight or a tool read.

## 4. Pillar C — The coach's twin: Roman thinks like this coach, speaks as Roman

What the coach feels: "He answers the way I coach. He knows my exercises, my diet rules, how I think about training and sleep."
What the client feels: still Roman, the same warm butler voice, now carrying their coach's methods.

Design:
- Coach playbook (`CoachPlaybook`): a structured, versioned profile per coach covering the coach's methods and beliefs:
  - Exercises: go-to movements, exercises they avoid, substitutions by injury and equipment, technique cues, warm-up habits.
  - Training ideology: split and frequency, progression model, volume and intensity, training to failure or not, deload rhythm, cardio
    stance, how they handle missed sessions and plateaus.
  - Dieting guidelines: macro method, protein targets, flexible vs strict, meal timing, cutting and bulking approach, refeeds and diet
    breaks, supplements they endorse or reject, how they handle a bad day of eating.
  - Sleep and recovery ideology: sleep targets, wind-down habits, what to change after poor sleep or low HRV, rest-day rules.
  - Red lines: things this coach never wants said or done (for example "never push through joint pain").
- Voice: Roman keeps his own butler voice for every client. The playbook shapes what he advises, never who he sounds like.
- Sources, in order of strength:
  - every approve, edit or dismiss of a Roman suggestion (#655);
  - the coach's programs, templates, meal plans and edits in the builders;
  - the coach's guidelines and the content of their messages to clients (methods, not tone);
  - a 5-minute onboarding interview Roman runs with the coach, plus a short "teach Roman" prompt after any edit.
- The coach sees and edits the playbook in plain words ("Roman's notes on how you coach") and can lock any line.
- Every Roman answer is conditioned on the playbook; the reply post-check (#666) adds a red-line and "matches this coach's method" check.
- Learning metric: share of Roman suggestions the coach approves without edits; target over 80 percent within 30 days of use.

## 5. Pillar D — The butler: Roman speaks first and does small jobs

What the client feels: a friend who checks in at the right moment and takes chores off their plate.

Proactive messages (`RomanOutreach`):
- Morning brief (optional): today's session, the one thing to focus on, and one personal note ("travel day: here is the 25-minute
  hotel version your coach approved").
- Moments: a personal best, a streak, a missed-session run, a bad-sleep run, a check-in that sounds low, the day before a booking.
- Rules: quiet hours and push preferences from #692/#693; a daily cap (section 9); the coach chooses which moment types Roman may
  use for their clients; crisis-adjacent signals never get a cheerful message, they go to the safety router and the coach.

Actions with confirmation (tools Roman can call, each idempotent and logged):
- Log food from text or a photo, log water, log a workout the client describes.
- Move a session to another slot inside the coach's availability (scheduling, once it ships).
- Swap an exercise from the coach's approved substitution list.
- Draft a message to the coach for the client ("Tell Sam my knee is sore"), sent only when the client taps send.
- Anything that changes training load or the plan goes through approve-to-adjust (#655): the coach decides.

Friend, not a bot: a stable persona, first-name basis, remembers the small stuff, never fake enthusiasm, never pretends to be human,
says plainly when he does not know or when data is missing (data_quality already exists).

## 6. Pillar E — Hyper-specific answers: Roman can look things up mid-answer

- From one snapshot to tool use: the model gets read tools scoped to the caller (workouts in a range, sleep and HRV in a range, food
  by day, check-ins, weight, messages with the coach, the coach playbook, memories, insights). It fetches what the question needs,
  across any time window the data allows, inside a per-turn query and token budget.
- Model routing by job (MODEL_ROUTING applies to product AI too): the strongest model for client conversations and coach-twin
  answers; a cheaper model for summaries, memory extraction and insight wording; deterministic code for numbers.
- Answer contract: cite the client's own numbers with dates; tie advice to the coach's playbook; one clear next step; a short "why"
  on request ("what Roman saw" already exists as GET /roman/context/me and grows to show memories and insights used).

## 7. Safety, privacy and cost (non-negotiable)

- Consent: wearable and training reads stay behind AI consent box 2; proactive outreach needs its own on/off switch for the client.
- Medical boundary: the safety router and crisis templates (OR-115-1, OR-115-2) sit in front of every new path, including outreach and
  actions. No diagnoses, no medication advice, no naming conditions.
- Control: clients do not remove single items from Roman's view (owner, 10:44); the coach sees insights and the playbook, not the
  client's private chat text (section 9 decision 3).
- Retention: chats kept until the client deletes them (owner ruling); Roman's notes and summaries are erased with the account (deletion
  manifest); the privacy policy's AI-provider retention sentence stays accurate.
- Cost: per-client daily spend cap stays (#669); a monthly cap per client and per coach; summaries run in batches; caching of the
  playbook and baselines.
- Quality gate grows from 30 to 200+ scripted multi-week personas, scored on: uses the client's own data correctly, matches the coach
  playbook, safe, warm, specific, no invented numbers. A release fails if any safety case fails or the specificity score drops.

## 8. Build plan (PR slices under 1,500 lines; T4 unless noted; Claude Opus 5.5 builders; Opus + GPT-6.1 Sol lenses)

| Phase | Weeks after launch | Slices |
|---|---|---|
| 1. Memory and timeline | 1-2 | client timeline view over existing tables + activity logs; summary cache job; Roman's notes from chats; pgvector retrieval; deletion manifest entries |
| 2. Baselines and insights | 2-3 | baselines job; 10 detectors with tests; weekly pattern finder with sample-size guards; insight API; coach insight feed |
| 3. Coach twin | 2-4 | CoachPlaybook schema (exercises, training, diet, sleep, red lines) + builder from programs, meal plans and #655 feedback; coach interview + teach-Roman prompt; playbook editor (mobile); post-check red lines + method match |
| 4. Tool-using turns | 3-4 | read tools scoped to caller; budgeted tool loop; answer contract + citations; "what Roman saw" v2 |
| 5. Butler | 4-6 | outreach engine (rules, caps, quiet hours, coach controls); morning brief; moments; action tools with confirmation (log food text/photo, water, workout, substitution, draft-to-coach, reschedule) |
| 6. Eval and rollout | continuous | golden set to 200+ personas; LLM-judge rubric + weekly human review; staged rollout by coach cohort behind flags (FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_INSIGHTS, FEATURE_ROMAN_PLAYBOOK, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_OUTREACH, FEATURE_ROMAN_ACTIONS), each a kill switch |

Rough size: 30-40 PRs. With 7-15 agents in parallel this fits in about 4-6 weeks after launch, with the coach twin and memory first
because every other pillar reads them.

Success measures: coach approves Roman suggestions unedited over 80 percent; client weekly active use of Roman; replies to outreach;
answers that cite the client's own data (target 95 percent of data questions); zero safety-case failures; AI cost per active client
inside the cap; client retention for clients who use Roman versus those who do not.

## 9. Owner decisions (recommended default first)

Answered 10:44 PDT 10-05: watching, butler and hyper-specific scopes approved; Roman reads each client's data and logs directly; no client
removal of single items; the playbook covers exercises, diet, training and sleep ideology, with Roman's own butler voice. The butler
approval is taken as accepting defaults 2, 4 and 5 below.

1. Coach private session notes: Roman may read them to learn the coach's approach, only if the coach turns it on, and never quotes
   them to the client. Default: yes, coach opt-in. OPEN.
2. Proactive messages: at most one morning brief plus two moment messages a day, inside quiet hours, client can turn off. ACCEPTED.
3. What the coach sees: Roman's insights and the playbook, not the client's private chat text. Default: yes. OPEN.
4. Actions without coach approval: logging, swaps from the coach's substitution list, moving a session inside the coach's
   availability; load changes go through approve-to-adjust. ACCEPTED.
5. Photo food logging in v1.1. ACCEPTED.
6. Voice conversations: v1.2. Default: v1.2. OPEN.
7. Bloodwork stays out of Roman in v1.1. Default: stays out. OPEN.
8. Monthly AI spend cap per client and per coach. Default: keep the daily cap, add a monthly cap at launch review. OPEN.
9. When a client deletes a Roman chat (day-1 feature), Roman's notes learned from it stay, and the privacy policy says so plainly.
   Default: yes. OPEN.

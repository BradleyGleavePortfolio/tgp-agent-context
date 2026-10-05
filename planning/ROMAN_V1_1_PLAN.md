# Roman v1.1 — from "a quick glance" to a coach-trained butler who watches everything

Written by operator agent 120, 2026-10-05, at the owner's request (DECISION_LOG.md, 09:57 PDT 10-05). Status: PLAN, revision 2 (owner
feedback 10:44 PDT 10-05: watching, butler and hyper-specific scopes approved; memory and coach twin revised below). All decisions answered (section 9). Nothing here changes day 1. Day 1 ships the upgrades already built (section 1).

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
- Never other users' rows. Coach private session notes: read for learning, never shown to the client. Bloodwork: discussed only when
  the client asks or uploads, always with the "Ask your coach" button. Purchases stay out.

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
  - the coach's private session notes (all coaches; never quoted or shown to the client).
- The coach never sees the playbook or Roman's memory (owner 11:22: no way to look into how or why); it is learned from the sources
  above and applied behind the scenes. Coaches see only what Roman proposes.
- Every Roman answer is conditioned on the playbook; the reply post-check (#666) adds a red-line and "matches this coach's method" check.
- Learning metric: share of Roman suggestions the coach approves without edits; target over 80 percent within 30 days of use.

## 5. Pillar D — The butler: Roman speaks first and does small jobs

What the client feels: a friend who checks in at the right moment and takes chores off their plate.

Proactive messages (`RomanOutreach`):
- Morning brief (optional): today's session, the one thing to focus on, and one personal note ("travel day: here is the 25-minute
  hotel version your coach approved").
- Moments: a personal best, a streak, a missed-session run, a bad-sleep run, a check-in that sounds low, the day before a booking.
- Rules: quiet hours and push preferences from #692/#693; a daily cap (section 9); crisis-adjacent signals never get a cheerful message, they go to the safety router and the coach.

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
- Control: clients do not remove single items from Roman's view (owner, 10:44); coaches see Roman's proposals only, never his memory,
  playbook or reasoning (owner, 11:22).
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
| 2. Baselines and insights | 2-3 | baselines job; 10 detectors with tests; weekly pattern finder with sample-size guards; insight API (client-facing only) |
| 3. Coach twin | 2-4 | CoachPlaybook schema (exercises, training, diet, sleep, red lines) + builder from programs, meal plans, guidelines, private session notes and #655 feedback; post-check red lines + method match (no coach-facing screen) |
| 4. Tool-using turns | 3-4 | read tools scoped to caller; budgeted tool loop; answer contract + citations; "what Roman saw" v2 |
| 5. Butler | 4-6 | outreach engine (rules, caps, quiet hours, coach controls); morning brief; moments; action tools with confirmation (log food text/photo, water, workout, substitution, draft-to-coach, reschedule); file upload to Roman (lab PDFs, photos) with the "Ask your coach" button |
| 6. Eval and rollout | continuous | golden set to 200+ personas; LLM-judge rubric + weekly human review; staged rollout by coach cohort behind flags (FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_INSIGHTS, FEATURE_ROMAN_PLAYBOOK, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_OUTREACH, FEATURE_ROMAN_ACTIONS), each a kill switch |

Rough size: 30-40 PRs. With 7-15 agents in parallel this fits in about 4-6 weeks after launch, with the coach twin and memory first
because every other pillar reads them.

Success measures: coach approves Roman suggestions unedited over 80 percent; client weekly active use of Roman; replies to outreach;
answers that cite the client's own data (target 95 percent of data questions); zero safety-case failures; AI cost per active client
inside the cap; client retention for clients who use Roman versus those who do not.

## 9. Owner decisions (all answered 10:44 and 11:20 PDT 10-05)

1. Coach private session notes: Roman reads them for ALL coaches (no opt-in) to learn each coach's approach; he never quotes or reveals
   them to the client. ANSWERED: "yes, for all".
2. Proactive messages: at most one morning brief plus two moment messages a day, inside quiet hours, client can turn off. ACCEPTED.
3. What the coach sees of Roman: what Roman wants to do, never how or why he got there (owner 11:20 + 11:22: "the coach can see what
   roman wants to do and such, but he shouldnt be digging into the internal memory of roman and the logistics behind it - hes jsut smart
   and capable, no way to look into how or why"). Coaches see Roman's proposals (approve-to-adjust #655 + m#337 stays on day 1, with
   Roman's one sentence and the client's own metrics the coach can already see) and approve, edit or dismiss them. Coaches never see
   Roman's notes, memory, playbook, insights pipeline, prompts or reasoning, and no client chat text.
4. Actions without coach approval: logging, swaps from the coach's substitution list, moving a session inside the coach's
   availability. ACCEPTED.
5. Photo food logging in v1.1. ACCEPTED.
6. Voice conversations: v1.2. ANSWERED.
7. Bloodwork: Roman may discuss it when the client asks or uploads a file to him, and always ends with an "Ask your coach" button that
   opens the client's direct messages with their coach. No diagnosis, no naming conditions (safety router unchanged). ANSWERED. Needs
   file upload to Roman (lab PDFs and photos) in v1.1.
8. AI cap: a daily cap per client, set high enough that hitting it is rare, with a graceful pop-up: "You've used your maximum AI allotment
   today." This pop-up ships on day 1 (M-ROMANCAP-120). ANSWERED.
9. Deleting a Roman chat removes the transcript; Roman's notes learned from it stay; the privacy policy says so plainly before v1.1
   notes ship. ANSWERED: yes.

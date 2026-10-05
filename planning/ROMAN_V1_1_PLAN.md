# Roman v1.1 — from "a quick glance" to a coach-trained butler who watches everything

Written by operator agent 120, 2026-10-05, at the owner's request (DECISION_LOG.md, 09:57 PDT 10-05). Status: PLAN, awaiting the owner
decisions in section 9. Nothing here changes day 1. Day 1 ships the upgrades already built (section 1).

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

## 2. Pillar A — Memory: Roman remembers every client

What the client feels: "He remembered my knee from three weeks ago, that I travel on Thursdays, and that I hate oats."

Design:
- Client timeline: every relevant event (log, check-in, workout done or missed, weight, wearable day, message, booking, adjustment)
  is written once to an append-only `RomanEvent` stream through the existing outbox pattern (the same one push uses, #692/#693).
- Rolling summaries: a background worker turns events into daily, weekly and monthly summaries per client (`RomanEpisode`), each with
  links back to the source rows (provenance). Old detail compresses; facts stay.
- Facts about the person: things the client tells Roman ("night shifts", "two kids", "hates oats", "left knee surgery 2019") become
  `RomanMemory` rows with source message, confidence, and an expiry for things that change. The client can see, correct and delete
  every one of them in the app ("What Roman knows about me"). Deleting a chat deletes the memories that came only from it.
- Retrieval: Postgres with pgvector (a Supabase extension) for meaning search over summaries and memories, plus exact queries for
  numbers. Every turn pulls the relevant memories, not all of them.
- Data rules unchanged: one client's rows only; never coach private session notes, bloodwork, purchases or other users (until the
  owner rules otherwise, section 9); everything with a user id joins the account deletion manifest.

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

## 4. Pillar C — The coach's twin: Roman learns how this coach coaches

What the coach feels: "He answers like I would. He knows I never push through knee pain, I deload every fourth week, and I like
short, direct messages."

Design:
- Coach playbook (`CoachPlaybook`): a structured, versioned profile per coach with sections: programming rules (splits, progression,
  deload rhythm, substitutions), nutrition approach (macro method, flexibility), recovery rules, red lines, tone and voice (length,
  warmth, emoji use, sign-off), and favourite cues. Sources:
  - the coach's programs, templates and edits in the workout builder;
  - every approve, edit or dismiss of a Roman suggestion (#655) — the strongest signal;
  - the coach's own messages to clients (style only, and only with the coach's consent);
  - a 5-minute onboarding interview Roman runs with the coach.
- The coach sees and edits the playbook in plain words ("Roman's notes on how you coach") and can lock any line. Nothing is learned
  silently that the coach cannot see.
- Every Roman answer to a client is conditioned on the coach's playbook; the reply post-check (#666) gains a "would this coach say
  this" check against red lines.
- Learning loop: the share of Roman suggestions the coach approves without edits is the main coach-twin metric. Target: from the day-1
  baseline to over 80 percent approved unedited within 30 days of a coach's use.

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
- Control: the client can see, correct and delete memories; the coach can see insights and the playbook, not the client's private
  chat text (section 9 decision 3).
- Retention: chats kept until the client deletes them (owner ruling); memories and summaries follow the same rule and the deletion
  manifest; the privacy policy's AI-provider retention sentence stays accurate.
- Cost: per-client daily spend cap stays (#669); a monthly cap per client and per coach; summaries run in batches; caching of the
  playbook and baselines.
- Quality gate grows from 30 to 200+ scripted multi-week personas, scored on: uses the client's own data correctly, matches the coach
  playbook, safe, warm, specific, no invented numbers. A release fails if any safety case fails or the specificity score drops.

## 8. Build plan (PR slices under 1,500 lines; T4 unless noted; Claude Opus 5.5 builders; Opus + GPT-6.1 Sol lenses)

| Phase | Weeks after launch | Slices |
|---|---|---|
| 1. Memory and timeline | 1-2 | RomanEvent outbox + emitters; episode summariser worker; RomanMemory extraction + client "What Roman knows" API; pgvector retrieval; mobile memory screen (T4, PII); deletion manifest entries |
| 2. Baselines and insights | 2-3 | baselines job; 10 detectors with tests; weekly pattern finder with sample-size guards; insight API; coach insight feed |
| 3. Coach twin | 2-4 | CoachPlaybook schema + builder from programs and #655 feedback; coach interview flow; playbook editor (mobile); post-check "coach red lines" |
| 4. Tool-using turns | 3-4 | read tools scoped to caller; budgeted tool loop; answer contract + citations; "what Roman saw" v2 |
| 5. Butler | 4-6 | outreach engine (rules, caps, quiet hours, coach controls); morning brief; moments; action tools with confirmation (log food text/photo, water, workout, substitution, draft-to-coach, reschedule) |
| 6. Eval and rollout | continuous | golden set to 200+ personas; LLM-judge rubric + weekly human review; staged rollout by coach cohort behind flags (FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_INSIGHTS, FEATURE_ROMAN_PLAYBOOK, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_OUTREACH, FEATURE_ROMAN_ACTIONS), each a kill switch |

Rough size: 30-40 PRs. With 7-15 agents in parallel this fits in about 4-6 weeks after launch, with the coach twin and memory first
because every other pillar reads them.

Success measures: coach approves Roman suggestions unedited over 80 percent; client weekly active use of Roman; replies to outreach;
answers that cite the client's own data (target 95 percent of data questions); zero safety-case failures; AI cost per active client
inside the cap; client retention for clients who use Roman versus those who do not.

## 9. Owner decisions (recommended default first)

1. Coach private session notes: Roman may read them to learn the coach's approach, only if the coach turns it on, and never quotes
   them to the client. Default: yes, coach opt-in.
2. Proactive messages: at most one morning brief plus two moment messages a day, inside quiet hours, client can turn off. Default: yes.
3. What the coach sees: Roman's insights and the playbook, not the client's private chat text. Default: yes.
4. Actions without coach approval: logging (food, water, workout), swapping from the coach's approved substitution list, and moving a
   session inside the coach's availability. Everything that changes load goes through approve-to-adjust. Default: yes.
5. Photo food logging in v1.1. Default: yes.
6. Talking to Roman by voice: v1.2, not v1.1. Default: v1.2.
7. Bloodwork stays out of Roman in v1.1 (medical risk). Default: stays out.
8. A monthly AI spend cap per client and per coach, set by the owner. Default: keep the day-1 daily cap and add a monthly cap at launch
   review once real usage is known.

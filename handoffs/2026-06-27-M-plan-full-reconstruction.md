# Op 50.5 — M-Plan Full Reconstruction (2026-06-27)

> **Provenance:** Reconstructs the lost `M_PLAN_REALITY_CHECK.md` and the M-series scope/purpose/planner-recipe documents that died with the Op 50.5 sandbox. Covers (A) true M5 scope as the FLOOR doctrine, (B) per-M-job purpose post-reality-check, (C) the planner agent objective recipe for re-spawn, and (D) the next-agent resume tail. Authored by Bradley Gleave per R3.

---

commit as Bradley. This is everything the next agent needs to re-derive
the lost M_PLAN_REALITY_CHECK.md and resume forward motion.

PART A --- TRUE M5 SCOPE (operator-declared FLOOR, not ceiling)

A.1 Operator's verbatim M5 expansion

> "we use resend - but this should be sent as sms, email, phone push
> notif if possible, smart dunning, and migrating coaches should
> automatically get prompted to send a link to download thats
> super-loaded (roman AI prompts this upon client ingest) (auto assigns
> clients to them and skips purchase path options)"

A.2 Operator's verbatim floor doctrine

> "take my M5 scope expansion as my BARE MINIMUM scope and thoroughness
> per M job --- got it? If anything, that M5 scope is TOO SMALL AND
> DUMB"

Interpretation: every other M-slice must match or exceed the depth,
channel-richness, AI-overlay sophistication, and friction-eliminating
defaults shown in M5. Anything narrower fails review.

A.3 M5 broken into A--D sub-slices

M5.A --- Multi-channel transactional notification substrate

- Resend = email transport (already-used baseline)

- SMS transport --- Twilio or AWS SNS (decide via hyperscaler default =
  Twilio for deliverability + reply handling)

- Push transport --- Expo Push (mobile RN) + Web Push (VAPID) for web
  app

- Phone-call fallback --- Twilio Programmable Voice with TTS for
  high-criticality events (failed payment final notice, account
  lockdown)

- Unified NotificationDispatcher service: takes (userId, eventType,
  payload) → resolves user's channel preferences + reachability → fans
  out

- Per-channel templates with shared variables; channel-aware rendering
  (160-char SMS vs HTML email vs push title+body)

- Delivery receipts + bounce/failure tracking persisted to
  notification_delivery table

- Rate-limit + de-dup per (user, eventType, payloadHash) within 5-min
  window

M5.B --- Smart dunning state machine

- Replaces flat "card failed → retry in 3 days" with a state machine:
  at_risk → retry_1 → soft_warn → retry_2 → hard_warn → grace → suspend
  → cancel

- Per-state: channel mix (e.g., soft_warn = email only; hard_warn =
  email + SMS + push; grace = + voice call)

- Behaviour-aware exits: if user opens dunning email or replies SMS,
  state pauses + escalates to coach inbox

- Coach-side dashboard: at-risk clients with stage, last contact, next
  scheduled contact

- Configurable per-coach: aggressive / standard / soft preset

- Auditable: every state transition writes to audit_log (R107)

M5.C --- Migration coach "send super-loaded link" flow

- After a coach completes migration (M1--M4 ingest), system auto-prompts
  coach: "Send your clients a one-tap link to download + claim their
  account"

- Link is super-loaded:

  - Carries migration_session_id + client_id + signed JWT

  - On open: auto-fills email, skips purchase path entirely (coach
    already pays per-seat), auto-assigns the client to the migrating
    coach

  - First in-app screen is Roman AI welcome with the client's name +
    program context already loaded

- Coach UI: progress bar showing how many of N clients have clicked,
  downloaded, claimed

- Bulk and individual resend (each resend respects M5.B rate limits)

- Universal links / App Links so the link opens the native app if
  installed, else falls to web

M5.D --- Roman AI overlay at client ingest

- When a coach finishes ingesting a client (via any M-slice path), Roman
  AI:

  - Reads ingested profile (goals, history, packages, check-in cadence)

  - Drafts a personalized welcome message + first check-in prompt +
    Day-1 plan stub

  - Surfaces to coach as a confirm/edit card before send

  - Once coach confirms, Roman triggers M5.C link-send via M5.A
    multi-channel dispatch

- Roman remembers ingest context across sessions so the first real
  coaching conversation feels continuous, not cold

A.4 What "M5 is the FLOOR" means concretely

Every M-slice must demonstrate at minimum:

1.  Multi-channel reach where user-facing --- never email-only

2.  Stateful workflow (state machine, not single-shot)

3.  Roman AI overlay at every human handoff point

4.  Frictionless defaults (auto-assign, skip-purchase, pre-fill,
    super-loaded links)

5.  Coach-side observability (progress, audit trail, dashboard)

6.  Audit-log + RLS coverage (R107 + R125)

7.  Hyperscaler-grade transport choices --- no homegrown SMTP, no DIY
    push

PART B --- PURPOSE OF EACH M-JOB (post-reality-check)

B.1 The migration spine (M1 → M4)

The "M" series exists to solve coach migration off competitor
platforms (Trainerize, TrueCoach, CoachRx) onto TGP without coaches
losing clients, history, programs, or revenue continuity.

M1 --- Universal Import Substrate

- M1.α (gated on H6-α merge): ImportSession table + SHA256 idempotency.
  Single canonical record per migration attempt; identical re-uploads
  no-op rather than duplicate. Carries provenance (source platform, file
  hash, coach_id, timestamps). Audit-log every transition.

- M1.β: Preview/commit two-phase ingest UI --- coach uploads, sees a
  parsed preview of clients/programs/packages, edits errors, then
  commits. Roman AI overlay drafts welcome + intent for each client
  during preview. Multi-format input (CSV, XLSX, JSON, screenshot OCR
  fallback).

- Purpose: make migration safely idempotent, previewable, and
  Roman-augmented --- the spine every adapter below feeds into.

M2 --- Trainerize Adapter (trivialized to 4-field reality)

- Reality check finding: Trainerize export is 4-field roster only (name,
  email, plus minimal contact). No programs, no history, no packages, no
  check-ins exportable.

- Therefore M2 is reduced to: parse 4-field CSV → upsert client shell →
  trigger M5.C super-loaded claim link → Roman generates onboarding
  intake to fill the gaps.

- Purpose: convert Trainerize's barren export into a hot client list
  ready for re-onboarding inside TGP, with Roman doing the rebuild work
  the export can't.

M3 --- Spreadsheet/Free-Form Adapter

- For coaches whose data lives in Google Sheets / Excel / Numbers (a
  huge cohort).

- Column-mapping wizard (heuristic + LLM-assisted) maps arbitrary
  spreadsheet shapes onto canonical Client / Program / Package / CheckIn
  types.

- Preview/commit handoff to M1.β.

- Purpose: capture the long tail of coaches who never used a SaaS
  platform.

M4 --- Trainerize JSON Adapter (KILL)

- Originally planned for a deep Trainerize JSON export. Reality check
  confirmed no such export exists.

- Decision: kill M4. Log as OPERATOR_DECISIONS_LOG ruling #7. Reallocate
  effort to competitor adapters (M-NEW below).

B.2 The activation engine (M5)

Already detailed in Part A. Purpose: turn a freshly-migrated client list
into actually-onboarded, paying, retained users --- across email + SMS +
push + voice + smart dunning + super-loaded links + Roman AI.

B.3 The deep-content slices (M8 → M9)

M8 --- Program / Workout Migration (pivot or kill)

- Original goal: import full workout programs (sets, reps, progressions,
  periodization) from competitors.

- Reality check: Trainerize doesn't expose programs. TrueCoach and
  CoachRx have richer exports but inconsistent shapes.

- Pivot: narrow to TrueCoach + CoachRx (where data exists) and provide a
  "Roman-rebuild from screenshot" path for Trainerize coaches (OCR +
  LLM reconstruction of a workout PDF/screenshot).

- Purpose: preserve coaches' library IP across the move.

M9 --- Check-in History / Client Notes Migration (pivot or kill)

- Same shape as M8. Where the source platform exposes notes (CoachRx,
  TrueCoach partial), import natively. Where it doesn't (Trainerize),
  provide screenshot-bulk-upload + Roman summarization.

- Purpose: preserve relational context (the "I know your story" feel).

B.4 The commercial layer (M10)

M10 --- Billing / Subscription Migration

- Move the coach's existing client billing relationships into TGP's
  Stripe Connect.

- Roman confirm/edit step: shows each client's existing price +
  cadence + next charge, asks coach to confirm.

- Smart proration + grace handling.

- Webhooks back to M5.B smart dunning for failures.

- Purpose: without this, migrating coaches lose revenue continuity =
  blocker. With it, switching cost goes to near zero.

B.5 The first-touch UX (M11)

M11 --- Mobile + Web Migration Wizard + Day-1 Win

- Wizard UI on both mobile (RN) and web that walks a migrating coach
  through M1 → M10 in a single guided flow with progress visualization.

- "Day-1 Win" = within first session, coach sees ≥1 client claim + ≥1
  Roman-generated welcome sent + billing reconciled = visible proof the
  move worked.

- Purpose: convert the migration from a project into a product moment.
  This is the marketing surface.

B.6 NEW (added per reality check) --- Competitor Adapters

M-NEW-TC --- TrueCoach Adapter

- TrueCoach exposes richer CSV/JSON with clients, programs, check-ins.

- Map onto canonical types, route through M1.β preview/commit.

M-NEW-CRX --- CoachRx Adapter

- CoachRx supports bulk-CSV import flow ([[CoachRx
  2026-05-04]](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge))
  which doubles as an export shape we can mirror in reverse.

M-NEW-AC --- Assistant Coach Adapter

- Per [[Assistant Coach 2026-04-13 data-portability
  post]](https://assistantcoach.fit/blog/data-portability-fitness-coaching-software/),
  their export shape is known.

Purpose for all three: offer best-in-class migration *from* every
realistic competitor, not just Trainerize.

PART C --- THE PLANNER AGENT (HOW THE LOST DOCUMENT WAS GENERATED)

C.1 Subagent identity

- subagent_id: m_plan_reality_check_vs_trainerize_limits_mqvzzvkg

- subagent_type: general_purpose

- model override: gpt_5_5 (explicitly chosen for adversarial reasoning
  depth)

- status at sandbox death: COMPLETED --- wrote M_PLAN_REALITY_CHECK.md
  (~800--1500 lines) --- file LOST when sandbox died.

C.2 Why GPT-5.5 specifically

Operator command verbatim: *"use a gpt5.5 agent to try and flush our M
plans against reality - now"*. GPT-5.5 was picked for two reasons: (1)
operator named the model, (2) the task is angry-adversarial
scope-vs-reality reconciliation where a non-default lens is preferred.

C.3 Objective shape (reconstruct verbatim-equivalent for re-spawn)

text

ROLE: Angry-adversarial planner. Your job is to rip the existing
M-series plan

(M1--M11) apart against the documented reality of what competitor
platforms

actually expose for export. Do not be diplomatic. Mark every assumption
that

turns out to be wrong. Kill slices that cannot exist. Reshape slices
that can

only partially exist. Add slices that the reality check reveals are
required.

CONTEXT (give the subagent these pre-loaded):

\- The current M-series tree (M1.α, M1.β, M2, M3, M4, M5.A-D, M8, M9,
M10, M11)

\- Operator's M5 scope expansion (verbatim, Part A.1 above)

\- Operator's M-floor doctrine (verbatim, Part A.2 above)

\- Operator's autonomy mode (hyperscaler-default on unknowns, file
metaphoric

options for product-direction decisions and keep moving)

\- Doctrine bindings: R0/R3, R52, R71, R72, R74/R86, R76, R78, R82, R98,
R107, R125

RESEARCH TASKS (the subagent must execute, citing sources inline):

1\. Trainerize: what can actually be exported? Roster fields, program
data,

check-ins, notes, billing? Cite Trainerize Help Center articles
directly.

2\. TrueCoach: same questions, cite sources.

3\. CoachRx: same questions, cite sources.

4\. Assistant Coach: same questions, cite sources.

5\. Resend, Twilio, Expo Push, Web Push (VAPID), Twilio Voice: what's
the

hyperscaler-grade integration pattern? Cite docs.

6\. Stripe Connect for billing migration: what's the canonical "import
existing

subscription" path? Cite Stripe docs.

DELIVERABLE (write to M_PLAN_REALITY_CHECK.md):

For each M-slice (M1.α, M1.β, M2, M3, M4, M5.A, M5.B, M5.C, M5.D, M8,
M9,

M10, M11), emit:

\- VERDICT (one of: KEEP / RESHAPE / KILL / EXPAND)

\- P0-P5 priority

\- Reality-grounded scope (what can actually be built given source data)

\- Floor-check (does it meet M5-floor doctrine? if not, what's
missing?)

\- Landmines (technical, legal, UX, billing, R125 RLS, R98 PII)

\- Open product-direction decisions (use metaphoric option format, e.g.

"Door A: \... \| Door B: \... \| Door C: \...") plus the agent's
default pick

per autonomy-mode rules

\- Citations for every claim about external platforms

ADDITIONALLY emit:

\- "Slices to ADD" section --- any new M-NEW-* the reality check
requires

\- "Cross-cutting landmines" section

\- "Recommended build order" with explicit gates (e.g. M5.A blocks
M5.B-D)

CONSTRAINTS:

\- No padding. If a section is short because reality is thin, say so.

\- Cite primary sources only --- vendor docs, help centers, official
blog posts.

\- Never speculate about a vendor's export shape; if unknown, mark
UNKNOWN and

list the verification step needed.

\- Bradley authorship for any commits (but this subagent writes the file
only,

does not commit).

C.4 Known outputs already preserved

The reality check completed and produced OPERATOR_DECISIONS_LOG ruling
#4 (Trainerize = 4-field roster only) with these citations, all of which
survived the sandbox death:

- [[Trainerize Help Center --- What information can be
  exported]](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize)

- [[Trainerize Help Center --- Transfer
  data]](https://help.trainerize.com/hc/en-us/articles/26458988419220)

- [[Assistant Coach --- Data portability in fitness coaching software
  (2026-04-13)]](https://assistantcoach.fit/blog/data-portability-fitness-coaching-software/)

- [[CoachRx --- Bulk CSV import: TrueCoach & Trainerize bridge
  (2026-05-04)]](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)

What's lost: per-slice VERDICT/P-tier/landmines/option-doors for every
M-slice, and the recommended build order. Re-spawn the planner with the
objective in C.3 to regenerate.

C.5 Spawn recipe (drop-in for next agent)

text

run_subagent(

subagent_type="general_purpose",

model="gpt_5_5",

task_name="M-plan reality check (respawn)",

user_description="Re-deriving lost M-plan adversarial reality check",

objective=<the full C.3 block above, verbatim>,

)

After it finishes, immediately commit the resulting markdown to\
tgp-agent-context/planning/M_PLAN_REALITY_CHECK.md (note: durable
location\
under planning/, not /tmp/) so it survives the next sandbox death.

PART D --- RESUME POINT FOR THE NEXT AGENT

1.  Read this handoff + the earlier 2026-06-27-op-50.5-sandbox-death.md
    stash.

2.  Re-spawn the planner per C.5 → wait → commit output to
    tgp-agent-context/planning/.

3.  In parallel: re-dispatch H6A Lens A (Opus 4.8) + Lens B (GPT-5.5)
    angry-adversarial audits of PR #493; re-dispatch H6B β-breakers
    builder (3rd respawn, 90-min budget, 15-min heartbeat,
    push-every-commit).

4.  Finalize PR #493 body per the file inventory + flags in the prior
    handoff.

5.  Once planner output lands, rewrite A2_MIGRATION_PLANNER_BRIEF.md and
    M1_ALPHA_BUILDER_BRIEF.md against M-floor doctrine + Trainerize
    4-field reality.

6.  Draft remaining builder briefs: M1.β, M2, M3, M5.A, M5.B, M5.C,
    M5.D, M8-pivot, M9-pivot, M10, M11, M-NEW-TC, M-NEW-CRX, M-NEW-AC.

7.  Log M4-KILL as OPERATOR_DECISIONS_LOG ruling #7.

END M-PLAN RECONSTRUCTION --- paste verbatim to
tgp-agent-context/handoffs/2026-06-27-M-plan-full-reconstruction.md and
commit as Bradley Gleave <bradley@bradleytgpcoaching.com>.

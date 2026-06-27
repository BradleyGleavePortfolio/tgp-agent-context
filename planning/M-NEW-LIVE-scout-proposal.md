# M-NEW-LIVE — "AI Scout" Live Account Mirror Adapter (Proposal)

> **Provenance:** Operator-proposed pivot (Bradley Gleave, 2026-06-27) collapsing the per-vendor M-adapter mess (M2/M3/M8/M9/M-NEW-TC/CRX/AC) into a single universal browser-based scout architecture. Becomes the new M-series spine pending reality-check planner ratification (see `planning/M_PLAN_REALITY_CHECK_v2.md`). Authored by Bradley Gleave per R3.

---

M-NEW-LIVE --- "AI Scout" Live Account Mirror Adapter

This is a great pivot. It collapses the M2/M3/M8/M9/M-NEW-* mess
(every-platform-has-a-different-export-shape) into one universal pipe.
Let me file it properly so the next agent can pick it up.

The core idea (in TGP terms)

A coach grants temporary access (their login session, an OAuth token
where available, or a delegated browser session). A scout agent opens
their existing platform inside a sandboxed browser, walks every page a
human coach would see (clients list → each client → programs → check-ins
→ notes → billing → messages), and streams what it observes ---
structured --- into a TGP migration_observations table in real time. A
second pass (the reconstructor) reads from migration_observations,
normalizes into TGP's canonical Client / Program / Package / CheckIn /
Note / Billing shape, runs Roman AI overlay, and presents the M1.β
preview/commit UI to the coach for confirmation.

Net effect: the export-shape question disappears. We don't depend on
what a vendor *chose* to expose --- we mirror what the *coach* can see.

Why this dominates the per-vendor adapter plan

- Universal: one engine, every platform (Trainerize, TrueCoach, CoachRx,
  Assistant Coach, MyPTHub, Everfit, even a private spreadsheet inside
  Notion). Kills M2/M3/M-NEW-TC/CRX/AC as separate slices --- they all
  become *scout profiles*.

- Bypasses the Trainerize 4-field cage: the export gives us 4 fields,
  but the coach can *see* the whole client. Scout sees what the coach
  sees.

- Live progress: coach watches the scout work, in real time, building
  trust ("oh look --- it found Sarah's last 6 weeks of check-ins").
  This is also the Day-1 Win moment for M11.

- Roman gets full context: the richer the mirror, the better Roman's
  welcomes/programs/check-in drafts.

- Floor-doctrine compliant: stateful (scan state machine), multi-channel
  (status notifications), Roman-overlaid (reconstruction step),
  frictionless (no manual CSV juggling), coach-observable (live progress
  dashboard), audit + RLS covered.

Architecture --- three layers

Layer 1: The Scout (browser-side agent)

- Runs in an isolated browser sandbox we control (think Browserbase /
  Playwright cloud / E2B browser). Never in the coach's local browser
  --- too risky, too unreliable.

- Coach hands over access via one of three modes, in preference order:

  1.  OAuth / API key where the vendor exposes it (rare but cheapest)

  2.  Delegated session --- coach logs in via our proxy login page; we
      capture the auth cookie scoped to that vendor's domain only,
      encrypted at rest, auto-expired on completion

  3.  Live screen-share co-pilot --- coach drives, scout reads alongside
      (for vendors with hard MFA / CAPTCHA / device trust)

- Scout has a per-vendor *profile* (a YAML-ish recipe): selectors,
  pagination patterns, rate-limit etiquette, anti-bot accommodations.
  Profiles are versioned and CI-tested against synthetic accounts.

- Scout streams every observation as it sees it: {vendor, page_url,
  entity_type, raw_payload, parsed_payload, observed_at,
  scout_session_id}.

Layer 2: The Live Mirror (migration_observations table)

- Append-only, encrypted at rest, RLS scoped to coach_id (R125 Tier 1).

- Schema is intentionally loose --- raw + parsed JSON columns ---
  because the scout sees messy real-world data. Normalization happens
  downstream.

- Audit-log every write (R107).

- PII auto-redacted at observation time per R98 + erasure-token (H6A
  substrate already provides this).

- 7-day TTL on raw observations once reconstruction commits; parsed
  normalized data persists in canonical tables.

Layer 3: The Reconstructor + Roman Overlay

- Reads from migration_observations, applies vendor-agnostic
  normalization rules + LLM-assisted disambiguation (Roman) for
  ambiguous fields ("is this a 'package' or a 'program'?").

- Roman drafts welcomes, first check-in prompts, Day-1 plans per client
  during reconstruction (so M5.D is built in, not bolted on).

- Hands off to M1.β preview/commit UI: coach sees a full diff of "what
  the scout found" vs "what TGP will create," edits inline, then
  commits → triggers M5.C super-loaded link send.

Where this slots into the M-tree (revised)

  -----------------------------------------------------------------------
  Slice                              Status under this plan
  ---------------------------------- ------------------------------------
  M1.α ImportSession + SHA256        KEEP --- scout session =
  idempotency                        ImportSession variant

  M1.β Preview/commit + Roman +      KEEP --- becomes the universal
  multi-format                       commit UI

  M2 Trainerize 4-field CSV          DEMOTE to fallback path when scout
                                     can't run

  M3 Spreadsheet                     KEEP (for non-platform coaches)

  M4 Trainerize JSON                 KILL (already decided)

  M5.A-D Multi-channel + dunning +   KEEP (this is the activation engine
  super-load + Roman                 downstream)

  M8/M9 Programs + check-ins         ABSORBED into scout (it sees
  migration                          programs + check-ins natively)

  M10 Billing migration              KEEP --- billing is a separate scout
                                     module

  M11 Migration wizard + Day-1 Win   KEEP, *upgraded* --- live scout
                                     progress IS the Day-1 Win

  M-NEW-TC / CRX / AC Per-vendor     COLLAPSE into scout profiles
  adapters                           (configs, not slices)

  M-NEW-LIVE (this one)              NEW P0 --- becomes the spine
  -----------------------------------------------------------------------

Decision doors (operator-pickable; defaults set per autonomy doctrine)

Door A --- Scout runtime location

- A1: Cloud-hosted browser sandbox (Browserbase / our own Playwright
  cluster) --- default pick (hyperscaler-grade, observable, replayable)

- A2: Coach's local browser via extension --- cheaper but fragile, hard
  to audit

- A3: Hybrid --- A1 by default, A2 only for vendors with hard
  device-trust MFA

Door B --- Credential handling

- B1: Vendor OAuth where it exists, encrypted delegated cookies where it
  doesn't --- default pick

- B2: Coach-supplied API token only (limits us to ~10% of vendors)

- B3: Co-pilot screen-share only (zero credential storage; slower)

Door C --- Real-time vs batch streaming

- C1: Stream every observation live to migration_observations as it's
  seen, render to coach's dashboard live --- default pick (this is the
  Day-1 Win moment)

- C2: Batch --- scout completes, then dumps. Simpler, but kills the
  trust moment.

Door D --- Scout intelligence ceiling

- D1: Deterministic recipes per vendor (YAML selectors) --- default pick
  for v1, evolvable

- D2: Pure LLM-driven "use the site like a human" agent --- flexible
  but expensive + flaky

- D3: Hybrid --- deterministic for known vendors, LLM fallback for
  unknown ones --- default for v2

Door E --- Legal / ToS posture

- E1: Coach-authorized access only, scoped tokens, coach controls
  scope + duration, full audit trail, vendor-by-vendor ToS review before
  enabling --- default pick (defensible: coach is accessing their own
  account through a tool of their choosing)

- E2: Aggressive --- ignore ToS, assume "coach's data = coach's
  right." Higher legal risk.

- E3: Conservative --- only run on vendors whose ToS explicitly permits
  delegated access (kills 80% of use cases)

Landmines to flag before building

1.  ToS / legal: several vendors prohibit automated access in ToS. Door
    E1 is the only defensible posture, and even then we need a
    per-vendor legal sign-off matrix. Highest-risk slice on the roadmap.

2.  MFA / device trust: Trainerize, TrueCoach increasingly enforce
    device fingerprinting. Door A3 hybrid is mandatory.

3.  CAPTCHA: scout must degrade gracefully to co-pilot mode on
    challenge.

4.  Rate limiting / shadow bans: scout must throttle to
    "human-realistic" rates per vendor profile.

5.  PII in flight: R98 + erasure-token must be applied at observation
    time, not at commit. H6A substrate is the prereq.

6.  Audit-log volume: scout produces thousands of writes per session ---
    H6B circuit breakers + H6A async-safe path must be in place. Hard
    dependency on H6 complete.

7.  Data quality: the scout sees what the *coach* sees, which includes
    the coach's own data hygiene problems. Reconstructor + Roman must
    handle ambiguity gracefully and surface conflicts in M1.β preview.

8.  Vendor breakage: any UI redesign at Trainerize breaks the scout
    profile. Need profile-versioning + CI synthetic-account tests + a
    "scout health" dashboard.

9.  Cost: browser-sandbox minutes per migration. Estimate 5--30 min of
    scout time per coach. Must be priced.

10. R125 RLS: migration_observations must be Tier-1 scoped (coach_id +
    scout_session_id). Cross-coach leakage = legal nightmare.

Build sequencing (proposal)

- Phase 0 --- H6A + H6B + H6C must merge first (audit-log + breakers +
  PII coverage are hard prereqs).

- Phase 1 (P0) --- M1.α + scout-substrate (migration_observations table,
  scout-session lifecycle, RLS, audit-log integration).

- Phase 2 (P0) --- First scout profile (pick highest-value vendor ---
  likely TrueCoach since the data is richest, validates the architecture
  end-to-end).

- Phase 3 (P0) --- Reconstructor + M1.β preview/commit + Roman overlay
  (M5.D-equivalent built in).

- Phase 4 (P1) --- Trainerize scout profile (proves the "see what the
  coach sees" thesis on the most data-starved vendor).

- Phase 5 (P1) --- M5.A-D activation engine wired to scout completion.

- Phase 6 (P1) --- CoachRx + Assistant Coach + MyPTHub + Everfit scout
  profiles.

- Phase 7 (P2) --- M10 billing scout module (likely a separate, more
  sensitive subsystem).

- Phase 8 (P2) --- M11 wizard with live scout progress as the
  centerpiece.

What I'd ask the planner to do next

Re-spawn the GPT-5.5 reality-check planner (per Part C of the prior
handoff) with this addendum prepended to its objective:

NEW SCOPE ADDITION: The operator has proposed a "live AI scout"
universal mirror adapter (M-NEW-LIVE). Treat this as the new spine of
the M-series. Re-rank every existing M-slice's verdict against this
architecture: which slices does it absorb, which does it demote, which
does it elevate? Specifically validate the Door A--E decisions against
vendor reality (ToS, MFA, rate limits, CAPTCHA frequency). Identify the
smallest viable first scout profile that proves the architecture. Cite
legal/ToS findings per vendor inline.

Paste-to-GitHub block

Copy the entire response above into
tgp-agent-context/planning/M-NEW-LIVE-scout-proposal.md and commit as
Bradley Gleave <bradley@bradleytgpcoaching.com>. Log a new
OPERATOR_DECISIONS_LOG ruling #8: *"M-series spine pivots to live AI
scout (M-NEW-LIVE). Per-vendor adapters demoted to scout profiles. M8/M9
absorbed. M2 demoted to fallback. Doors A1/B1/C1/D1+D3-v2/E1 set as
defaults pending planner re-run."*

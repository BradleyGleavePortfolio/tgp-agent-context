# HealthKit / Wearables / Sleep+Recovery — Next-Operator Handoff

**Owner:** Dynasia G <dynasia@trygrowthproject.com>
**Created:** 2026-05-30
**Status:** Planning phase — implementation pending

---

## North Star

Coaches at Growth Project bill $2-8K/mo for transformational coaching. They need health/fitness AND sleep/recovery data from every notable wearable + app their clients use, surfaced in a **decacorn-quality** experience that:

1. Tells the coach (per client) what's going on and what to do about it
2. Tells the client (themselves) what's going on and how to improve it
3. Lives inside a restrained-luxury mobile design language (Phantom CALM + Apple cognitive de-load + Revolut tactile-data)
4. Splits visually into TWO buckets: **Sleep & Recovery** and **Health & Fitness**

---

## User Directives (verbatim, in order)

### Directive 1 — Two planning agents → unified plan → build/audit/merge loop
> "Then run 2 Opus 4.8 subagents for Apple HealthKit + wearables + Samsung/Apple Health + Oura + sleep. Agent 1: UI/UX bible study → (1) data brought in, (2) named pages/paths/coach-per-client views, (3) best design per bible+luxury restrained theme. Agent 2: coding plan, existing foundation audit, concrete PR-chunked plan with parallelization avoiding rebase collisions. Then YOU make one staged plan. Build: Builder→audit→clean/dirty→fix/merge→re-audit→repeat until CLEAN→merge. Isolated workspaces, push every 2 min, decide parallel/serial. When I wake up I want PR18 MERGED and wearables expansion DONE. ALL healthkit info in NEW `tgp-agent-context/applehealthkit/` as next-operator handoff."

### Directive 2 — Scope: every notable device
> "I need the healthkit to include wearable watches, apps, whoop and oura rings, and every notable device for sleep/health data!"

### Directive 3 — Two visual buckets
> "I want it split up - health and fitness, then separated 'sleep and recovery'"
> "I want the expansion/pages split into two buckets visually - sleep and recovery, then health and fitness!"

### Directive 4 — Real connections, not display only
> "I need it to connect to Oura rings, Whoop, all major health apps, all major health watches/wearables!"

### Directive 5 — Dual-role embedded AI
> "I want the internal AI, both the coach side AND the client side to live on the new pages, as a small part, which can summarize the data into a general outlook + give insights"
>
> - **Coach AI example:** "They're lacking deep wave sleep, they probably have lights on, should I send this message to them: 'Hey, I saw your sleep data this week, do you sleep with lights on?'"
> - **Client AI example:** "Your REM sleep came in at 15% of total sleep time, and you slept about 45min under recommended amounts, we can improve this by getting a sleep mask and setting a 'go to bed' alarm!"

---

## Two Visual Buckets (Locked Information Architecture)

### Bucket A — Health & Fitness
Real connectors required (must be live OAuth/SDK, not display-only):
- Apple HealthKit (iOS native, on-device)
- Google Fit / Health Connect (Android native)
- Garmin Connect (Garmin Health API / Connect IQ)
- Fitbit (Fitbit Web API)
- Strava (Strava API v3)
- Polar (Polar Accesslink API)
- Samsung Health (Samsung Health SDK)
- Wahoo (Wahoo Cloud API)
- Withings (Withings API — body comp, BP)
- Peloton (partner API)
- MyFitnessPal (optional v2 — nutrition)

### Bucket B — Sleep & Recovery
Real connectors required:
- Oura Ring (Oura Cloud API v2)
- Whoop (Whoop API v1)
- Eight Sleep (Eight Sleep API)
- Withings Sleep Analyzer (Withings API)
- Apple Watch sleep (via HealthKit)
- Samsung Galaxy Watch sleep (via Samsung Health)
- Garmin sleep + Body Battery (via Garmin Connect)
- Fitbit sleep (via Fitbit Web API)
- Polar sleep + Nightly Recharge (via Polar Accesslink)
- Beddit (via HealthKit)

Note: many devices report to BOTH buckets — Apple Watch logs workouts AND sleep, Garmin logs running AND sleep, etc. The taxonomy bucket is per-metric, not per-device. UI shows the metric in the right bucket regardless of provider.

---

## Embedded AI — Dual Role

### Coach-side AI (lives on coach's per-client detail view)
- **Role:** Diagnostic + outreach proposal
- **Output:** observation → hypothesis → suggested coach action with draft message (one-tap approve/edit/send)
- **Confidence calibration:** "I think" 50% / "Fairly sure" 70% / "Confident" 85% / "Certain" 95% / "Verified" 100%
- **Never:** auto-send messages, medicalize, claim treatment, overclaim

### Client-side AI (lives on client's bucket pages)
- **Role:** Self-coaching insight + concrete intervention
- **Output:** data observation → norm comparison → low-friction next action (alarm, gear, schedule, behavior)
- **Surface:** "small part" of the page — progressive disclosure, not dominant

### Architecture
- Insights endpoint per side × per bucket (coach H&F, coach S&R, client H&F, client S&R)
- LLM call with structured prompt: latest metrics + client baseline + cohort norms + bucket-specific science
- Output schema: `{ observation, hypothesis (coach only), suggested_action, suggested_message_draft (coach only), confidence_level, source_metrics[] }`
- Cache 6h unless new sync arrives
- Audit log of all insights shown
- Coach message approval workflow (never auto-send)

---

## Quality Bar (R0 Decacorn)

For every decision: "What would Apple/Notion/Google choose?"

Specifically for this expansion:
- **Apple cognitive de-load:** complexity moved not eliminated; one concept per moment; Miller's 5±2 caps
- **Apple Watch ring model:** ambient progress, completion drive, peak-end closure
- **Strava principle:** design the activity not the app session — outcome > opens
- **Phantom CALM in S&R bucket:** Clarity, Animation, Light feedback, Mascot-presence at anxiety moments (sleep data can be anxiety-provoking)
- **Revolut tactile data in H&F bucket:** scrubable charts, tier-differentiated polish
- **Outcome metric, not vanity:** track sleep quality change / recovery score change / habit completion — NOT dashboard opens
- **50 Failures of AI Code:** every PR audited against the full checklist

---

## Build Process Locks

- Author identity on every commit: `Dynasia G <dynasia@trygrowthproject.com>` — NO Co-authored-by, NO trailers
- `api_credentials=["github"]` for all git network ops
- R31/R32: auditor ≠ builder, SHA-pinned verdicts
- R61: push every ~2 min
- Isolated worktrees per PR unit (file-disjoint by write-set)
- Builder → R1 audit → fix (if NOT CLEAN) → R2 audit → loop until CLEAN → merge
- Foundation PR (canonical schema + ingestion abstraction) lands FIRST
- Then parallel per-provider connector PRs (file-disjoint)
- Then bucket UI PRs consuming canonical schema
- Then embedded-AI insights PR (foundation + coach panel + client panel)

---

## Files in this Directory (added incrementally as work progresses)

- `HANDOFF_FOR_NEXT_OPERATOR.md` (this file) — owner directive, scope, quality bar
- `AGENT_1_UX_PLAN.md` — UX bible study output (pending)
- `AGENT_2_CODING_PLAN.md` — existing-foundation audit + PR-chunked coding plan (pending)
- `UNIFIED_BUILD_PLAN.md` — synthesized staged plan (pending)
- `PROVIDER_MATRIX.md` — per-provider OAuth/API/SDK details, rate limits, backfill windows (pending)
- `EMBEDDED_AI_SPEC.md` — coach + client AI panel specs, prompt templates, output schema, guardrails (pending)
- `BUILD_REPORTS/` — per-PR build notes (created as PRs land)
- `AUDIT_REPORTS/` — per-PR audit verdicts (created as PRs audit)

---

## State at Handoff

PR-18 finish loop in flight (round-3 re-audits running in parallel as of 2026-05-30 23:51 PDT). HealthKit/wearables expansion will begin once PR-18 is fully merged.

# TGP Talent Marketplace — Product Spec (operator-locked)

**Owner:** Bradley Gleave · **Captured by:** Agent 46 · **Date:** 2026-06-16
**Status:** Product decisions LOCKED by operator. Architecture/PR-chain rebuild = next planner stage (supersedes the head-coach-only framing in `TALENT_MARKETPLACE_PLAN_183.md` §2; that doc's code inventory & TM-0…TM-10 chain are still a useful base but must be re-planned against THIS spec).
**Design doctrine:** ENG §11 quiet-luxury + uploaded Mobile App Design Intelligence (emotional design, Apple cognitive de-load, sustainable gamification — tasteful, NO badge theater, outcomes-over-opens, Coach Maya voice, ≤300ms motion, semantic theme tokens only).

> **Scope boundary:** This is the **TALENT MARKETPLACE** — a two-sided coach JOB BOARD where hirers (head-coaches, solo coaches, gym owners) recruit NEW coaches, and external job-hunters (plus existing coaches) apply. DISTINCT from the **Consumer Marketplace** (`CONSUMER_MARKETPLACE_SPEC.md`, clients discover & book coaches). The two share infrastructure (Stripe Connect, RLS spine, revocable badge engine, calendar engine, reviews-as-signal) but are SEPARATE products with **separate profiles** per marketplace.

---

## 1. Core concept
A two-sided job board. **Hirers** post job listings; **job-hunters** (external non-TGP coaches AND existing TGP coaches) browse and apply with a lightweight applicant profile. Hirer reviews applicants, invites to a call via the in-app calendar, selects one → applicant **auto-flips to sub-coach** under the hirer → heavy onboarding → the ongoing coach↔sub-coach relationship runs entirely inside TGP's already-built head-coach tooling (scheduling, payments, client assignment, program sharing, messaging).

## 2. The hiring flow (canonical)
1. Hirer (verified head-coach / solo coach / gym owner) **posts a job listing** (states comp/expectations).
2. Job-hunter **browses listings publicly (no account, SEO-indexed)**; on **Apply**, creates a **pre-coach account** + lightweight applicant profile (states what they want → two-way fit).
3. Hirer sees applicants, uses **applicant-tracking** (shortlist, notes, status) + saved searches + "candidates like this" + new-applicant alerts.
4. Hirer **invites to a call** via the in-app calendar (reused engine).
5. Hirer **selects** → applicant **auto-flips to sub-coach** under the hirer.
6. **Heavy onboarding** fires on flip (see 3.4); gates taking clients.
7. Ongoing relationship managed in **existing** TGP head-coach tooling. Money rail (2% to operator + head-coach relational % when toggled) applies to the sub-coach's resulting sales.

## 3. Confirmed product decisions

### 3.1 Who participates
- **Hirers (post listings, browse applicants, make offers):** head-coaches, solo coaches, AND gym owners. Must be **verified** to post (anti fake-listing).
- **Applicants:** external non-TGP coaches (job-hunters) AND existing TGP coaches. Apply + admin-approval curation still applies to listing quality where relevant.

### 3.2 Acquisition hooks (decision a, d)
- **BOTH:** publicly browsable open job listings (no account) AND a "get discovered by gyms" pitch to draw external coaches.
- **SEO:** job listings are **SEO-indexable** — "personal trainer jobs Seattle" → TGP listing → apply. A primary top-of-funnel for ACQUIRING COACHES (mirrors the consumer marketplace's city-SEO play). schema.org JobPosting structured data.

### 3.3 Profiles & accounts (decisions b, c, e)
- **Browse without account; account required before Apply.**
- Applicant profile is a **lightweight applicant/"pre-coach" profile** — NOT the full coach profile, and SEPARATE from any consumer-marketplace profile.
- At Apply, the job-hunter creates a **pre-coach account**; all basic info is indexed/stored and **carried forward** so that on the flip-to-sub-coach it auto-populates. Any missing data is requested at the flip.
- Two-way fit: applicant states desired comp/role; listing states offered comp/expectations; a **match indicator** surfaces fit (decision o).

### 3.4 Onboarding-on-flip checklist (decisions f, h)
Fires the moment the hirer flips the applicant to sub-coach. Gates the ability to take clients:
1. Accept terms.
2. **Stripe Connect** payout setup.
3. **Identity verification (Stripe Identity)** + **background check (Checkr)** — see 3.6.
4. Profile completion (fill any data missing from the lightweight applicant profile).
5. Done → can take clients via existing tooling.

### 3.5 Post-hire management (decision g)
NOT out of TGP's hands. The sub-coach relationship runs on the **already-built** head-coach tooling: in-app scheduling, payment flow, client assignment, program sharing, messaging. The talent marketplace HANDS OFF cleanly into these existing surfaces. Money: 2% platform fee to operator on all sales + head-coach relational % when the head coach toggles it (per Consumer spec §2.7 — same rail).

### 3.6 Verification & trust (decisions h, i)
- **Light gate to APPLY:** account + basic applicant profile; anti-bot (3.7).
- **Heavy gate to be PLACED (on flip):** **Checkr background check + Stripe Identity are MANDATORY** for placement (these people may train clients in person). Insurance/credentials per the shared badge engine; higher bar for in-person/hybrid modality.
- Reuses the **shared revocable badge/credential engine** (cert tiers, trust badges, verified-client signal) so hirers evaluate candidates with the same trust stack clients see.

### 3.7 Anti-abuse / security (decision j) — RIGID
- **Listings:** only **verified** head-coaches/solo-coaches/gym-owners may post (prevents fake listings posted to harvest applicant PII).
- **Applications — deep anti-fake/bot protection:** throttled application rate-limits, monitored/anomaly-watched submissions, and explicit anti-bot systems (e.g. challenge/verification on suspicious patterns, velocity checks, duplicate-device/identity heuristics). Treat the apply endpoint as a high-abuse surface.
- **PII (decision k):** stored in TGP's existing data system (which already holds bloodwork, physical, sleep, messaging data). Background-check/identity raw flows go through Checkr/Stripe; store results + necessary records per existing data governance. **NOTE: PII/RLS/auth surface → operator-approval gate per doctrine; RLS write-scope policies mandatory on all applicant/PII tables.**

### 3.8 Hirer tooling (decision l) — ALL
- Applicant-tracking view: shortlist, notes, interview-scheduled, hired/passed pipeline.
- Saved searches.
- "Candidates like this" recommendations.
- Alerts when a great new applicant appears.

### 3.9 Job-hunter tooling (decision m) — ALL
- Portfolio/showcase: sample programs, intro video, client results.
- Application-status tracking.
- Specialty-matched job alerts.
- Tasteful "profile strength" nudges (luxury-doctrine gamification — competence signal, not vanity).

### 3.10 Calendar / interview (decision n)
- **Reuse the existing calendar engine** ("anyone can book onto Tom's calendar"). No separate or rebuilt booking system. The "invite to a call" step uses this engine.

### 3.11 Web parity — EVERY page has a web equivalent (operator addition 2026-06-16)
**Every mobile screen in the talent marketplace gets a corresponding web page, at full parity** — job listing, listings browse/scroll, the apply flow + applicant profile, application-status tracking, the hirer's applicant-tracking pipeline, candidate detail, etc. Web is first-class (Airbnb model): a job-hunter can discover a listing on Google, build their applicant profile, and apply entirely on web OR in-app; a hirer can post and screen on web OR in-app. SEO job listings (§3.2, schema.org JobPosting) are a subset of this broader web-parity requirement. **Each mobile PR pairs with a web PR for the same surface.** Consumes the same talent-marketplace API (SSR / Next.js web lane).

## 4. Shared foundation (both marketplaces)
Coach/Connect identity (REUSE existing `/coach/connect/*`), RLS spine (A1–A4), revocable badge engine, calendar engine, reviews-as-signal, faceted search. Profiles are SEPARATE per marketplace but a coach is one underlying identity.

## 5. Relationship to PR #183
#183 built a head-coach→sub-coach hiring pipeline (application, admin review queue, talent pool, offers, Connect) but: (a) framed hiring as admin-curated pool, not a public two-sided job board; (b) has P0 architectural defects (wrong RLS model, duplicate Connect surface) → REBUILD per `TALENT_MARKETPLACE_PLAN_183.md`. The salvageable IP (idempotency ledger, transactional offer accept, tuple pagination, structured Stripe errors, compensation-term validation) ports forward. The rebuild chain must be RE-PLANNED to add: public/SEO listings, lightweight applicant profile + pre-coach account, two-way fit, anti-bot apply surface, applicant-tracking, job-hunter portfolio/alerts, calendar reuse, and the auto-flip-to-sub-coach + heavy onboarding handoff.

## 6. Open architecture items (next planner stage, NOT product decisions)
- Re-plan the TM-0…TM-10 chain against this two-sided-job-board spec (add listings, applicant profile, anti-bot, applicant-tracking, fit-matching, SEO web lane).
- Sequencing vs. Consumer Marketplace and Wave-1.5 RLS spine; what's the shared-foundation build order.
- Anti-bot system selection (challenge provider, velocity/anomaly tooling).

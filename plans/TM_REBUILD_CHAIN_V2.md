# TM Rebuild Chain V2 — Re-Planned Against the Two-Sided Job-Board Spec

**Planner:** Opus 4.8 (PLAN-ONLY — no code, no PRs, no branch mutation; R68 ADR discipline)
**Date:** 2026-06-16
**Authoritative inputs:** `TALENT_MARKETPLACE_SPEC.md` (operator-LOCKED) supersedes the `TALENT_MARKETPLACE_PLAN_183.md` §2 TM-0…TM-10 chain. Old-branch IP confirmed by reading `BradleyGleavePortfolio/growth-project-backend` src at ref `714a69af`.
**Doctrine refs:** AGENT_RULES R56–R73 (R68 ADR, R70 fail-fast, R71 file-ownership, R72 dual audit, R73 mobile planner brief, R82 tracked issues), ENGINEERING_RULES §1–§11, MOBILE_APP_DESIGN_INTELLIGENCE.

---

## 0. Honest summary: this re-plan vs the superseded chain

The superseded PLAN_183 §2.2 chain (TM-0…TM-10) was correct **code-craft** but built for the **wrong product shape**: an *admin-curated talent POOL* where a head-coach browses approved applicants (`GET /talent/pool`, Scale+ gated) and extends offers. The LOCKED spec re-frames the product as a **two-sided, publicly browsable, SEO-indexed JOB BOARD**: hirers (verified head-coaches, solo coaches, **and gym owners**) post **job listings**; external job-hunters browse with **no account**, create a **lightweight pre-coach account at Apply**, and apply against a specific listing with a **two-way fit indicator**; the apply endpoint is a **high-abuse anti-bot surface**; hirers get a full **applicant-tracking** stack (shortlist, notes, pipeline stages, saved searches, "candidates like this", alerts); job-hunters get **portfolio/showcase, status tracking, specialty alerts, profile-strength nudges**; selection **auto-flips the applicant to sub-coach** and fires a **heavy onboarding checklist** (terms → Stripe Connect payout → identity + background check → profile completion) before they can take clients; and **every mobile surface pairs with a web/SSR page** (Next.js lane, schema.org JobPosting). This V2 chain therefore (a) **adds 6 new domain concerns** absent from PLAN_183 — `JobListing`, `Applicant/pre-coach profile`, `Application` (listing-scoped, replacing the pool-scoped `CoachApplication` semantics), `ApplicantTracking` (shortlist/notes/stages), anti-bot/velocity infra, and fit-match scoring; (b) **doubles the surface** with a parallel **web/SSR lane** paired to each mobile PR; (c) **honors the operator salvage directive** — it PORTS the genuinely-good `714a69af` IP file-by-file (idempotency ledger, transactional accept, partial unique indexes, structured Stripe errors, tuple pagination, PII omission, comp-term validation, the ~1,500 LOC test suites) while **rewriting the RLS into the spine idiom**, **reusing the existing `/coach/connect/*` surface** (dropping `CoachConnectAccount` + `/talent/connect/*`), and **closing #183** via a TM-0 ADR. The old "admin review queue → pool" path is **retained but demoted** to a listing-quality moderation concern, not the primary funnel.

> **Salvage ground-truth (confirmed by reading `714a69af`):** the offer service's `$transaction` accept with conditional `updateMany WHERE status='pending'` + withdraw-others + placed-flip is real and good; `MarketplaceIdempotencyService.claimOrReplay/markCompleted/releaseClaim` is real (and `releaseClaim` **swallows its own error and relies on non-existent "operational cleanup"** = the P1-8 stale-claim bug to fix with a TTL sweep); `connect-account.service.ts` has the structured `PAYMENTS_PROVIDER_*` / `CONNECT_ONBOARDING_UNAVAILABLE` envelopes, a 10s `AbortController`, deterministic Stripe `Idempotency-Key`s, and the **hand-rolled `hashReturnUrl`** (replace with `crypto.createHash`); `coach-application.service.ts` exports `parseTupleCursor`/`buildTupleCursor` and omits PII; `talent-pool.service.ts` `canViewTalentPool` gates on role=coach + active `CoachSubscription` + `TALENT_POOL_PRICE_ID` but **does not exclude sub-coaches** (the P1-4 gap). The legacy `findReplay`/`record` + `WorkPreferences` alias are dead and DROP. **Migration re-date floor moved: `main`'s latest is now `20261219000000`, not `20261215000200` — re-date all TM migrations AFTER `20261219000000`.**

---

## 1. Re-planned dependency-ordered PR chain

Naming: `TM-*` = backend, `TM-W*` = web/SSR (Next.js), `TM-M*` = mobile. Every builder = **Opus 4.8**; every audit = **DUAL GPT-5.5** (Auditor A = correctness/security/RLS, Auditor B = tests/contracts/hygiene); every `TM-M*` adds an **R73 GPT-5.5 Planner brief** stage first. **Each PR ≤ 400 PRODUCTION LOC** (tests + migrations excluded from the cap). RLS columns assume the spine idiom (`app.current_user_id()` / `app.is_owner()` + `service_role` bypass; anon → zero rows); the literal template is `20261215000200_contracts_rls/migration.sql`.

### 1.1 Backend chain

| PR | Scope | Est PROD LOC | Depends on | Blast radius | RLS / tenant notes | Stripe / idempotency / webhook | Parallel? | SALVAGE from `714a69af` |
|---|---|---|---|---|---|---|---|---|
| **TM-0 (ADR)** | R68 decision-of-record: rebuild-not-patch on current `main`; **reuse `/coach/connect/*`, DROP `CoachConnectAccount` + `/talent/connect/*`**; migration re-date policy (after `20261219000000`); two-sided job-board re-scope; **close #183** with R82 tracked issue. Records both background-check paths (open item §6). | ~90 (md) | — | none (docs) | states spine idiom + write-scope mandate | states Connect reuse + webhook event-id idempotency policy | **Serial — gates ALL** | n/a (documents the salvage manifest) |
| **TM-1 (schema + RLS foundation)** | Prisma: enums + new tables `JobListing`, `Applicant` (pre-coach profile), `Application` (listing-scoped), `CoachOffer`, `MarketplaceMutationIdempotency`. **NO `CoachConnectAccount`.** ONE migration re-dated after `20261219000000`: `ENABLE`+`FORCE` RLS, `service_role` bypass (Primitive A), `app.current_user_id()`/`app.is_owner()` policies **incl. WRITE-SCOPE on every applicant/PII/financial table** (`Applicant`, `Application`, `CoachOffer`), RESTRICTIVE deny-all on ledger, partial unique indexes. Public-read SELECT only on `JobListing` where `status='published'`. | ~390 | TM-0 | **high (schema.prisma + migration)** | **OWNS all new-table policies**; head-coach→applicant scope **REUSES `TeamSubCoachAssignment` non-archived predicate** (no new team-scope expr); anon reads published listings only | ledger table RESTRICTIVE deny-all | **Serial (foundation)** | **partial unique indexes** (one-pending-per-`(head_coach,application)`; one-accepted-per-`application`); ledger table shape (`status`/`completed_at`, response nullable) — collapsed into one clean DDL |
| **TM-2 (listing CRUD + publish)** | `JobListingService` + DTOs + controller slice. Verified-hirer create/edit/publish/close; comp+expectations fields; `HirerVerifiedGuard` (head-coach **OR** solo coach **OR** gym owner, all `verified`). schema.org JobPosting field shaping deferred to TM-W2. | ~360 | TM-1 | medium | hirer-owns-own-listing write-scope; published listings public-read | listing mutation idempotency (DB unique) | After TM-1 | **comp-term server-side validation** (`validateCompensationTerms` per comp type) — repurposed to validate listing offered-comp |
| **TM-3 (public listing browse + SEO API)** | `GET /listings` (public, no auth) + `GET /listings/:id`; faceted filter (specialty/location/modality/comp); keyset pagination; PII-free public payload; JobPosting JSON-LD payload builder consumed by TM-W2. | ~300 | TM-2 | low | `@Public()`; anon → published rows only (RLS-enforced) | none | After TM-2; **∥ with TM-4** | **keyset tuple pagination** (`parseTupleCursor`/`buildTupleCursor`); **PII omission** in browse payload |
| **TM-4 (idempotency ledger svc + TTL sweep)** | `MarketplaceIdempotencyService` (`claimOrReplay`/`markCompleted`/`releaseClaim`) **+ stale-claim TTL/staleness sweep in `claimOrReplay`** (fixes P1-8). **DROP** legacy `findReplay`/`record`. | ~190 | TM-1 | low | RESTRICTIVE deny-all (set in TM-1) | core idempotency engine for all mutating routes | **∥ with TM-2/TM-3** (own file) | **the full ledger service** (`claimOrReplay`/`markCompleted`/`releaseClaim`); **fix** the `releaseClaim` swallow-error stale-claim bug |
| **TM-5 (pre-coach account + applicant profile + Apply)** | Pre-coach account creation at Apply; lightweight `Applicant` profile CRUD; `POST /listings/:id/apply` (creates account + profile + `Application`, carries data forward for the flip). Two-way fit indicator compute (desired vs offered). **Behind TM-6 anti-bot middleware.** | ~390 | TM-1, TM-4 | medium-high (auth/PII) | applicant-reads-own (`current_user_id`); write-scope on `Applicant`/`Application`; **operator-approval gate (PII)** | apply idempotency via ledger (TM-4) | After TM-4 | **idempotent-submit P2002 race recovery** + **tuple cursor** for "my applications"; **PII discipline** patterns |
| **TM-6 (anti-bot / abuse surface)** | Rate-limit + velocity/anomaly checks + challenge-on-suspicious + duplicate-device/identity heuristics, applied to `POST /listings/:id/apply` (+ account-create). Pluggable provider adapter (provider TBD — open item §6). | ~340 | TM-1 | medium (guards apply path) | n/a (gate layer); logs to PII-governed store | n/a | After TM-1; **∥ with TM-2/3/4**, must land **before TM-5 ships to prod** | none (new capability; reuse repo's existing throttler conventions, not old branch) |
| **TM-7 (admin listing moderation + applicant review)** | Demoted ex-pool path: `GET /admin/listings` + `/admin/applications` review queue with `claimOrReplay`; listing-quality approval. Owner-only. | ~210 | TM-2, TM-5, TM-4 | low | owner-only (`is_owner()`) | review idempotency ledger | After TM-5; **∥ with TM-8** | **admin list + `:id/review` atomic claim-or-replay**; tuple-cursor admin pagination |
| **TM-8 (hirer applicant-tracking)** | `ApplicantTracking`: shortlist, notes, pipeline stages (`new/screening/interview/offer/hired/passed`), saved searches, "candidates like this", new-applicant alerts. Per-listing scoped to the owning hirer. | ~400 (likely split 2: 8a tracking+stages, 8b saved-search+reco+alerts) | TM-5 | medium | hirer-reads-only-own-listing-applicants (**reuse `TeamSubCoachAssignment` predicate** for head-coach scope); write-scope on notes/stages | none | After TM-5; **∥ with TM-7** | **PII omission** discipline in candidate cards; **keyset pagination** for saved-search results |
| **TM-9 (job-hunter tooling)** | Applicant portfolio/showcase (sample programs, intro video, results), application-status tracking, specialty-matched alerts, tasteful profile-strength nudges. | ~340 | TM-5 | low | applicant-reads/writes-own | none | After TM-5; **∥ with TM-7/TM-8** | **PII discipline**; reuses `Application` status enum semantics from old state machine |
| **TM-10 (Connect reuse adapter)** | **Thin adapter** mapping marketplace onboarding onto the **existing `/coach/connect/*`** service — onboarding-link + status. **No second Stripe account model.** APPEND-ONLY on the shared Connect surface. | ~210 | TM-1, TM-0 | **medium (touches shared `/coach/connect/*`)** | reuse existing Connect RLS (do not add policies) | **reuse existing Stripe idempotency keys; APPEND-ONLY on shared connectApi (R71)** | After TM-1; **∥ with TM-7/8/9** | **structured Stripe errors** (`PAYMENTS_PROVIDER_*`, `CONNECT_ONBOARDING_UNAVAILABLE`), **10s AbortController**, **deterministic idempotency keys**; **replace hand-rolled `hashReturnUrl` with `crypto.createHash`** |
| **TM-11 (calendar reuse: invite-to-call)** | Thin "invite to a call" adapter onto the **existing calendar engine** (no rebuild). Hirer schedules interview from a tracked applicant. | ~180 | TM-8 | low (consumes calendar) | inherits calendar engine RLS | none | After TM-8 | none (reuse existing engine) |
| **TM-12 (auto-flip + heavy onboarding checklist)** | On hirer selection: `CoachOffer` create/accept lifecycle (`$transaction` flip + withdraw-others) → **auto-flip applicant→sub-coach** (creates `TeamSubCoachAssignment`) → fire onboarding checklist gates: accept terms → Connect payout (TM-10) → identity + background check (path per §6 open item) → profile completion → can-take-clients. `HeadCoachOnlyGuard`+`NoActiveSubCoachGuard` on create (fixes P1-4). Hands off to existing head-coach tooling. | ~400 (split 2: 12a offer-lifecycle+flip, 12b onboarding-checklist+gates) | TM-5, TM-4, TM-10, TM-8 | **high (offers + team + Connect)** | offer read/write policies (TM-1); head-coach-only create; flip writes `TeamSubCoachAssignment` | accept/reject ledger keys; onboarding link best-effort outside txn; **Chain B ContractEnvelope seam at accept** (don't build, don't foreclose) | **Serial — convergence point** | **the entire `$transaction` accept-with-withdraw-others**; **partial-unique backstop mapping to 409**; **anonymous-applicant fail-closed** (now resolved by mandatory pre-coach account at Apply); **comp-term validation** |
| **TM-13 (revenue-split payment intents)** | `createMarketplacePaymentIntent`; thread `application_fee_amount` (2% operator) + `transfer_data.destination`; `payment_intent.succeeded` webhook → split ledger. Keep head-coach relational % a **separate ledger** (do not auto-apply / collide). | ~400 (likely 2 PRs) | TM-10, TM-12 | **high (billing)** | split-ledger write-scope RLS | **MoR `automatic_tax`, `PaymentFailure.stripe_event_id @unique`, `$transaction` (ENG §9), webhook sig verify** | Serial after TM-12 | **`calculateFee()` pure math** (the genuine scaffold) — implement the `throw`-by-design `createMarketplacePaymentIntent` |
| **TM-14 (Connect `account.updated` webhook)** | Event-driven `onboarding_completed`; replaces polling (fixes P1-7). | ~170 | TM-10 | medium (**webhook router**) | n/a | **webhook sig verify + event-id idempotency** | **∥ with TM-13** | reuses old polling logic as fallback only |
| **TM-15 (RLS + cross-tenant test lane)** | Live RLS-lane specs (`jest.rls.config.js`) per NEW table + cross-tenant isolation + offer-race concurrency + anon-sees-only-published-listings. Fixes P1-6. | ~360 (tests — excluded from cap) | TM-12 | low (test-only) | **proves** isolation per table | proves idempotency replay + offer race | **∥ after TM-12** | **PORT/adapt the 6 existing test suites (~1,500 LOC):** application svc/dto, offer svc (703 LOC), connect svc, talent-pool, cors-config, env-validation |

### 1.2 Web / SSR lane (Next.js) — each pairs with a mobile surface

| PR | Scope | Est PROD LOC | Depends on | Blast radius | Notes | Parallel? | SALVAGE |
|---|---|---|---|---|---|---|---|
| **TM-W2** | Public job-listing page + listings browse/scroll (SSR), **schema.org JobPosting JSON-LD**, city/specialty SEO landing pages. Consumes TM-3 API. | ~380 | TM-3 | low (web app) | first top-of-funnel; SEO-indexable, no account | After TM-3 | PII-free public payload contract from TM-3 |
| **TM-W5** | Apply flow + applicant-profile builder on web (full parity). Consumes TM-5; behind TM-6 anti-bot. | ~380 | TM-5, TM-6 | low | operator-approval gate (PII) | After TM-5/6; ∥ with TM-M5 | two-way fit display from TM-5 |
| **TM-W8** | Hirer applicant-tracking pipeline + candidate detail on web. Consumes TM-8. | ~390 | TM-8 | low | parity with TM-M8 | After TM-8; ∥ with TM-M8 | candidate-card PII discipline |
| **TM-W9** | Application-status tracking + portfolio/showcase on web. Consumes TM-9. | ~300 | TM-9 | low | parity with TM-M9 | After TM-9 | — |
| **TM-W12** | Onboarding-on-flip + Connect redirect on web. Consumes TM-12/TM-10. | ~300 | TM-12 | low | trust-building handoff | After TM-12 | structured Stripe error UX |

### 1.3 Mobile lane — each gated by an R73 GPT-5.5 Planner brief first

| PR | Screen | Est PROD LOC | Backend dep | Notes | SALVAGE |
|---|---|---|---|---|---|
| **TM-M2** | `JobListingsBrowse` + `ListingDetail` | ≤400 | TM-3 | Hick's/Miller's; one primary "Apply" tap | — |
| **TM-M5** | `ApplyFlow` + `ApplicantProfile` builder | ≤400 | TM-5, TM-6 | pre-coach account create; two-way fit chip; reuse `generateIdempotencyKey` | — |
| **TM-M8** | `ApplicantTrackingPipeline` + `CandidateDetail` | ≤400 | TM-8 | progressive disclosure of filters | — |
| **TM-M9** | `ApplicationStatus` (**wire ORPHANED existing screen**) + `PortfolioShowcase` + alerts | ≤400 | TM-9 | wire orphaned `ApplicationStatusScreen` into navigator + R73 polish; CALM celebration on approved/placed | **port existing `ApplicationStatusScreen.tsx` status maps + token-only colors + a11y** |
| **TM-M12** | `OfferAccept`/`OnboardingChecklist` + `ConnectOnboardingRedirect` | ≤400 | TM-12, TM-10 | accept = peak moment celebration; Connect handoff feels in-app (ENG R8) | — |

---

## 2. Critical path + parallel waves (4-wide queue)

**Critical path (serial spine):**
`TM-0 → TM-1 → TM-5 → TM-12 → TM-13`
(TM-1 schema is the serial foundation; TM-5 the Apply/account funnel; TM-12 the auto-flip convergence; TM-13 the money rail. TM-6 anti-bot is a hard prerequisite for *shipping* TM-5 to prod even though it parallelizes in build.)

**Waves for a 4-wide queue:**

- **Wave 0 (serial gate):** `TM-0` (ADR — must merge before any builder dispatched).
- **Wave 1 (serial foundation):** `TM-1` (schema+RLS). Nothing else can land first; everything rebases on it.
- **Wave 2 (4-wide, after TM-1):** `TM-2` (listing CRUD) ∥ `TM-4` (ledger+TTL) ∥ `TM-6` (anti-bot) ∥ `TM-10` (Connect adapter). All touch disjoint files.
- **Wave 3 (4-wide):** `TM-3` (public browse, after TM-2) ∥ `TM-5` (Apply+profile, after TM-4/TM-6) ∥ `TM-14` (Connect webhook, after TM-10) ∥ `TM-W2` (SEO web, after TM-3 — slots in late in this wave).
- **Wave 4 (4-wide, after TM-5):** `TM-7` (admin moderation) ∥ `TM-8` (applicant-tracking) ∥ `TM-9` (job-hunter tooling) ∥ `TM-M2`/`TM-W5` (UI pairs as backend greens).
- **Wave 5 (convergence, mostly serial):** `TM-11` (calendar invite, after TM-8) then `TM-12` (auto-flip+onboarding — convergence point) ∥ `TM-M8`/`TM-W8` (tracking UIs).
- **Wave 6 (4-wide, after TM-12):** `TM-13` (revenue split) ∥ `TM-15` (RLS/cross-tenant tests) ∥ `TM-M12`/`TM-W12` (onboarding UIs) ∥ `TM-M9`/`TM-W9` (status/portfolio UIs).

---

## 3. R71 file-ownership matrix (collision-prone PRs only)

| PR | OWNS (exclusive write) | MUST-NOT-TOUCH | Collision protocol |
|---|---|---|---|
| **TM-1** | `prisma/schema.prisma` (TM tables), new TM migration dir | any existing migration timestamp; `/coach/connect/*`; billing; webhook router | shared-append-only on `schema.prisma`; **second merger rebases** (no parallel schema PR) |
| **TM-10** | `src/talent-marketplace/connect-adapter.*` | `CoachConnectAccount` (dropped); the core `/coach/connect/*` service internals — **APPEND-ONLY**, add no new Connect account model | any change to shared Connect signatures → ADR + operator sign-off first |
| **TM-12** | `coach-offer.service/dto`, flip→`TeamSubCoachAssignment` write path, onboarding-checklist svc | `schema.prisma` (owned by TM-1); billing intents (TM-13); the Connect service (TM-10 owns the adapter) | converges TM-4/TM-5/TM-8/TM-10 — serialize; do not co-merge with TM-13 |
| **TM-13** | revenue-routing svc, split-ledger, marketplace payment-intent path | sub-coach relational-% ledger (separate); `/coach/connect/*` internals; webhook router (TM-14 owns `account.updated`) | keep split ledger and relational-% ledger **physically separate** (flag to auditor) |
| **TM-14** | `account.updated` handler registration in **webhook router** | `payment_intent.succeeded` handler (TM-13 owns) | webhook router is shared — append-only handler registration; coordinate merge order with TM-13 |
| **TM-6** | anti-bot middleware/guards on apply path | `Application`/`Applicant` service bodies (TM-5 owns) | TM-6 must merge before TM-5 ships to prod; gate layer only |
| **TM-7 vs TM-8** | TM-7 owns admin moderation controllers; TM-8 owns tracking tables/services | each other's controllers | both read `Application`; neither mutates the other's stage/notes tables |
| **TM-W\*** | their own Next.js route dirs | the mobile app; backend services | web lane is its own app — low collision; pin to the backend API contract version |

All TM-1 RLS policies use the spine idiom verbatim from `20261215000200_contracts_rls/migration.sql`; the head-coach→applicant visibility predicate **reuses the existing `TeamSubCoachAssignment` non-archived `EXISTS(...)` clause** (Inconsistency-Tax avoidance) — do not author a new team-scope expression.

---

## 4. Operator decision / open-items list

1. **Talent-side background check: IN-HOUSE vs Checkr/Stripe Identity — UNRESOLVED, operator must pick.** Spec §3.6 names **Checkr + Stripe Identity as MANDATORY for placement**, but the operator decided **build in-house F-KYC** for the *consumer* marketplace (to avoid per-coach vendor fees). The talent side has people who may train clients in person — a higher bar. **Both paths are noted; do NOT silently pick.** This gates the TM-12b onboarding-checklist build. *(Recommend resolving before Wave 5.)*
2. **Anti-bot provider selection (TM-6).** Challenge provider (e.g. hCaptcha/Turnstile-class), velocity/anomaly tooling, duplicate-device/identity heuristics vendor vs in-house. Gates TM-6 implementation detail (the adapter is provider-pluggable, but a default must be chosen). Spec §6 flags this open.
3. **Web SSR lane sequencing vs the Consumer Marketplace.** Both marketplaces want a Next.js SEO surface. Decide: one shared web app/shell or two? Affects whether `TM-W*` lands in the consumer web app or a standalone talent web app. Shared-foundation build order (RLS spine A1–A4) sequencing also lives here.
4. **TM-0 ADR to close #183 (R82).** Confirm: close #183, file the tracked umbrella issue, adopt Connect reuse + migration re-date floor (`> 20261219000000`). **PII/RLS/auth surface = operator-approval gate** before TM-1, TM-5, TM-8, TM-12, TM-13 merge.
5. **Gym-owner hirer identity.** Spec adds gym owners as hirers; confirm the `verified` predicate + the entity model (gym-owner = a User role, or a Gym affiliation?) so `HirerVerifiedGuard` (TM-2) and listing ownership RLS are authored correctly.
6. **Chain B contract envelope at offer-accept.** TM-12 leaves an extensible post-commit hook for a future onboarding `ContractEnvelope`; confirm whether to wire it now or keep as a seam.

---

## 5. First wave to dispatch — recommendation

Kick off in this order; the ADR and schema are hard serial gates, then go 4-wide:

1. **TM-0 (ADR) — dispatch FIRST, alone.** It is the R68 gate: it records rebuild-not-patch, Connect reuse / `CoachConnectAccount` drop, the migration re-date floor (`> 20261219000000`), the two-sided re-scope, and **closes #183 (R82)**. It also captures the unresolved background-check decision (open item #1) so builders aren't blocked guessing. No code; ~90 LOC markdown; needs operator sign-off (PII/auth gate).
2. **TM-1 (schema + RLS) — dispatch immediately after TM-0 merges.** The serial foundation everything rebases on. Owns `schema.prisma` + the single re-dated migration; authors all new-table RLS in the spine idiom (reusing the `TeamSubCoachAssignment` predicate); ports the partial unique indexes + ledger table shape from `714a69af`. Operator-approval gate (new PII/financial tables).
3. **Then go 4-wide (Wave 2), the moment TM-1 is green:** **TM-4** (idempotency ledger + TTL sweep — own file, fixes P1-8) ∥ **TM-6** (anti-bot scaffold — gate layer) ∥ **TM-2** (listing CRUD — first product surface) ∥ **TM-10** (Connect reuse adapter — append-only on `/coach/connect/*`). These four touch disjoint files (no R71 collisions) and unblock the Apply funnel (TM-5) and the convergence (TM-12) fastest.

> **Why not start TM-5/TM-12 sooner:** TM-5 (Apply) needs both the ledger (TM-4) and the anti-bot gate (TM-6) live, and must not ship to prod before TM-6; TM-12 is the convergence point and depends on TM-5/TM-8/TM-10. Front-loading TM-4/TM-6/TM-2/TM-10 in Wave 2 maximizes the 4-wide queue while respecting the serial schema gate.

---

### Source-of-truth references (verified for this plan)
- LOCKED spec: `tgp-agent-context/plans/TALENT_MARKETPLACE_SPEC.md` (operator-locked, 2026-06-16).
- Superseded base inventory: `tgp-agent-context/plans/TALENT_MARKETPLACE_PLAN_183.md`.
- Salvage IP confirmed by reading `BradleyGleavePortfolio/growth-project-backend` `src/talent-marketplace/*` at ref `714a69af` (offer, idempotency, connect-account, application, talent-pool, revenue-routing services).
- RLS spine template: `prisma/migrations/20261215000200_contracts_rls/migration.sql` (on `main`). Migration re-date floor confirmed against `main`'s latest migration `20261219000000`.
- Connect reuse target confirmed: `src/coach-connect` + `src/connect` exist on `main` (PR #215/#216).

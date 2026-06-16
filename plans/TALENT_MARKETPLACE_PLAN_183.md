# Plan — PR #183 Talent Marketplace (Phase 2, R81 rebuild lane)

**Planner:** Opus 4.8 (plan-only; no code, no PRs, no branch mutation)
**Date:** 2026-06-16
**Subject PR:** #183 `feat(phase-11/talent-marketplace)` — head `714a69af`, base `main`, **+4762 / −6 across 27 files**, OPEN, CONFLICTING, no CI, last touched 2026-05-24.
**Doctrine refs:** `AGENT_RULES.md` (R56–R73), `ENGINEERING_RULES.md` §1–§11, `tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (R73 source of truth).

> **Honesty note for the operator:** the PR body undersells the branch. It claims "scaffold + two test suites." The branch actually carries **5 audit rounds** of hardening (idempotency ledger, atomic claim, partial unique indexes, FORCE RLS), **6 test suites (~1,500 LOC)**, and a real Stripe Connect Express HTTP client. The *code-craft* is good. The problem is **architectural drift against `main`**: it was hardened against a Supabase-style RLS model that **`main` does not use**, and it ships a Connect surface that **collides** with the already-merged Connect work (PRs #215/#216). That is why it must be rebuilt, not patched. Details below.

---

## 1. WHAT EXISTS NOW (ground truth)

### 1.1 Data model (Prisma + 4 migrations)

**4 enums:**
- `CoachClientType` = {fitness, wellness, both}
- `CoachApplicationStatus` = {pending, reviewed, approved, pool, placed, inactive}
- `CoachCompensationType` = {commission, rev_share, flat, hybrid}
- `CoachOfferStatus` = {pending, accepted, rejected, withdrawn}

**4 tables** (3 advertised + 1 added during audits):

| Table | Key fields | Notable constraints |
|---|---|---|
| `CoachApplication` | `id` (uuid), `applicant_user_id?` (FK→User SetNull), `email`, names, `certifications[]`, `specializations[]`, `years_experience`, `sample_program_url?`, `preferences` (jsonb), `availability_hours_per_week`, `preferred_client_type`, `background_verified`, `status`, `reviewer_user_id?`, `reviewer_score?`, `reviewer_notes?`, `idempotency_key?` | unique `idempotency_key`; index `(status, created_at DESC, id DESC)` for keyset pagination; FKs to User on applicant + reviewer |
| `CoachConnectAccount` | `id` (uuid), `user_id` (unique FK→User Cascade), `stripe_account_id` (unique), `onboarding_completed`, `capabilities` (jsonb), `country` default US, `default_currency` default usd | 1:1 with User; unique on both `user_id` and `stripe_account_id` |
| `CoachOffer` | `id` (uuid), `head_coach_id` (FK→User Cascade), `applicant_user_id?` (FK SetNull), `application_id` (FK→CoachApplication Cascade), `compensation_type`, `compensation_terms` (jsonb), `client_capacity`, `onboarding_message?`, `status`, `accepted_at?`, `idempotency_key?` | unique `idempotency_key`; **partial unique** `(head_coach_id, application_id) WHERE status='pending'`; **partial unique** `(application_id) WHERE status='accepted'` |
| `MarketplaceMutationIdempotency` | `id` (uuid), `user_id`, `route_key`, `idempotency_key`, `response` (jsonb, nullable), `status` ('in_progress'\|'completed'), `completed_at?` | composite unique `(user_id, route_key, idempotency_key)`; CHECK on status |

**User model** extended with 5 optional relations (additive; no existing rows broken).

**Migration state — 4 forward-only files:**
1. `20260507000000_phase11_talent_marketplace` — enums, 3 tables, RLS `ENABLE` + Supabase-style policies.
2. `20260524000000_..._idempotency_and_one_accepted` — idempotency ledger table + one-accepted partial unique index.
3. `20260524010000_..._idempotency_atomic_claim` — adds `status`/`completed_at`, drops `response NOT NULL`.
4. `20260703000000_force_rls_marketplace_tables` — `FORCE ROW LEVEL SECURITY` + RESTRICTIVE deny-all on the ledger + status CHECK.

> **Migration-conflict risk:** file #4 is timestamped `20260703`, but `main` already has migrations dated `20261212`+ (the real RLS spine). The `20260507`/`20260524` files sort **before** large swaths of `main`'s history. Re-homing these into a clean lane means **re-dating every migration to land after `main`'s latest** (`20261215000200`). Do not replay the old timestamps.

### 1.2 Backend surfaces (`src/talent-marketplace/`, 10 files)

**Controller** (`coach-application.controller.ts`, single `@Controller()`):

| Method | Path | Guard | Real / Stub |
|---|---|---|---|
| POST | `/apply/coach` | `@Public()` | **Real.** Idempotent submit; passes `req.user?.id` if caller happens to be authed. |
| GET | `/applications/me` | JwtAuthGuard | **Real.** Lists own applications. |
| GET | `/admin/applications` | Jwt + RolesGuard `owner` | **Real.** Status filter + tuple-cursor pagination. |
| PATCH | `/admin/applications/:id/review` | Jwt + RolesGuard `owner` | **Real.** Atomic claim-or-replay idempotency; UUID `Idempotency-Key` header required. |
| GET | `/talent/pool` | Jwt + RolesGuard `coach` | **Real.** Scale+ gated keyset search; omits PII. |
| POST | `/talent/connect/onboarding-link` | JwtAuthGuard | **Real.** Idempotent; creates Express acct + account-link via live Stripe HTTP. |
| GET | `/talent/connect/status` | JwtAuthGuard | **Real.** DB-mirror + lazy Stripe refresh when not onboarded. |
| POST | `/talent/offers` | Jwt + RolesGuard `coach` | **Real.** Entitlement re-check + compensation-term validation. |
| PATCH | `/talent/offers/:id/accept` | JwtAuthGuard | **Real.** Transactional flip + withdraw-others + best-effort onboarding link. |
| PATCH | `/talent/offers/:id/reject` | JwtAuthGuard | **Real.** Transactional conditional reject. |

**Services:**
- `coach-application.service.ts` — CRUD + forward-only state machine; idempotent submit with P2002 race recovery; exports `parseTupleCursor`/`buildTupleCursor`.
- `coach-offer.service.ts` (612 LOC) — create/accept/reject; `$transaction` atomic acceptance; `validateCompensationTerms` per type; calls Connect on accept. **Most complex file.**
- `connect-account.service.ts` — `fetch`-based Stripe Connect Express client (accounts, account_links, accounts/:id), 10s AbortController timeout, structured non-leaking errors (`PAYMENTS_PROVIDER_*`, `CONNECT_ONBOARDING_UNAVAILABLE`), deterministic Stripe idempotency keys.
- `marketplace-idempotency.service.ts` — atomic `claimOrReplay`/`markCompleted`/`releaseClaim` + legacy `findReplay`/`record`.
- `talent-pool.service.ts` — `canViewTalentPool` (role=coach → active CoachSubscription → `TALENT_POOL_PRICE_ID` match, fail-closed in prod) + keyset search.
- `revenue-routing.service.ts` — **genuine scaffold.** `calculateFee()` is real pure math; `createMarketplacePaymentIntent()` **throws by design**.

**Wiring:** `AppModule` registers `TalentMarketplaceModule`; `main.ts` adds `Idempotency-Key` + `X-Recent-Auth-Token` to CORS `allowedHeaders`; `env-validation.ts` adds `TALENT_POOL_PRICE_ID` (prod tier).

**Tests (6 suites, ~1,500 LOC):** application service/dto, offer service (703 LOC), connect service, talent-pool, cors-config, env-validation. Prisma + Stripe `fetch` mocked; no live DB/RLS test (the spine's `jest.rls.config.js` lane is untouched).

### 1.3 What's explicitly DEFERRED (Track 8.5, per PR body + code)
- **Head-coach browse-and-hire UI** (`GET /talent/pool` returns data; no mobile screen).
- **Revenue-split payment intents** — `RevenueRoutingService.createMarketplacePaymentIntent` throws; not threaded into subscription billing.
- **Connect `account.updated` webhook** — `onboarding_completed` is *polled* via `getAccountStatus`, not event-driven.
- **Marketing-site public application form** (separate repo).
- **Signed invite-token flow** for anonymous applicants — accept/reject **fails closed** (403) when `applicant_user_id IS NULL`. Functional but a dead-end UX until built.
- **1099/tax** — relies on Stripe automatic.

### 1.4 Mobile side (what exists today on `growth-project-mobile` main)
- `src/screens/applicant/ApplicationStatusScreen.tsx` (~340 LOC) — **real but ORPHANED.** Status label/description maps, token-only colors, a11y. **Not referenced in any navigator** (`grep` of `src/navigation/` = 0 hits). Dead screen until wired.
- `src/services/talentMarketplaceApi.ts` — only `GET /applications/me`. None of submit / pool / offers / connect.
- `src/__tests__/talentMarketplace.test.tsx` — source-level guards (no full mount; "RN renderer setup deferred to Track 8.5").
- **Connect collision:** mobile already ships `coachConnectApi.ts` (PR #215/#216, endpoints `/coach/connect/*`) and `connectApi.ts` (`ConnectAccountView`, `is_fully_onboarded`, dashboard links). **PR #183's backend uses a *different* Connect surface (`/talent/connect/*`, table `CoachConnectAccount`) than the merged `/coach/connect/*` work.** Two parallel Connect models is a contract hazard — see §1.5.
- **No screens** for: coach application form, pool browse/search, offer inbox/accept/reject, Connect onboarding redirect from the marketplace flow.

### 1.5 Honest quality assessment vs R0/R81 bar

**P0 — blocks merge (architectural, not cosmetic):**

1. **RLS model is wrong for this repo.** PR #183 policies use `current_setting('request.jwt.claims', true)::jsonb ->> 'sub'` (Supabase auth model) and grant to `TO authenticated`. **`main`'s spine uses `app.current_user_id()` / `app.is_owner()` helpers, `TO public` / `TO service_role`, set transaction-scoped by `RlsContextInterceptor` reading `req.user.sub`** (ENGINEERING_RULES §2: "Never reference `auth.uid()` directly"). The PR's policies will **never match** under the live interceptor — they effectively deny everything to the app's own role or rely on a JWT claim path the backend doesn't set. This is a from-scratch RLS rewrite, not a tweak.
2. **No write-scope RLS policies on a financial table.** `CoachConnectAccount` (a financial/Connect table per §2) has only a SELECT policy. ENGINEERING_RULES §2 requires write-scope policies on Connect/financial tables. `CoachOffer` (money terms) likewise SELECT-only.
3. **Connect-surface duplication.** Ships a second Connect account model (`CoachConnectAccount` + `/talent/connect/*`) alongside the merged `/coach/connect/*` (PR #215/#216). R11 says build outward, never shrink — so the resolution is to **reuse the existing Connect account**, not maintain two. Needs a deliberate reconciliation decision (ADR per R68).

**P1 — must fix in rebuild:**
4. **Role-mismatch in offer accept/reject:** controller comment says "OWNER via RolesGuard hierarchy bypass," but `acceptOffer`/`rejectOffer` carry only `JwtAuthGuard` (no RolesGuard) and authorize purely by `applicant_user_id === caller`. Correct for applicants, but there's **no `HeadCoachOnlyGuard`/`NoActiveSubCoachGuard`** on `POST /talent/offers` (ENGINEERING_RULES §1: team/billing/Connect/revenue routes must carry these). A sub-coach with role=coach + a stray active CoachSubscription could create offers. The service `canViewTalentPool` checks role=coach but **does not exclude sub-coaches**.
5. **`req.user.sub` vs `req.user.id` consistency:** code uses `req.user.id` (correct per §11). But the RLS interceptor keys on `user.sub`. Whichever path the rebuild picks must be consistent end-to-end (the auth guard sets the full Prisma user; `.id` is canonical).
6. **No live RLS/cross-tenant test.** The spine has `jest.rls.config.js` + `test/cross-tenant-isolation.spec.ts`; PR #183 adds **zero** RLS-lane tests. R81 bar requires cross-tenant isolation proof per new table.
7. **Connect webhook gap = stale state.** Lazy polling in `getAccountStatus` only refreshes when a coach hits status; payout-readiness can be stale at offer-accept time. Acceptable as a documented deferral *only if* the webhook PR is in the chain (it is, below).
8. **`releaseClaim` swallows errors** → a crash between claim and markCompleted leaves an `in_progress` row that 409s all retries until "operational cleanup" (which doesn't exist). Needs a TTL/sweeper or a `created_at`-based staleness check in `claimOrReplay`.

**P2 — polish:**
9. `hashReturnUrl` is a hand-rolled non-crypto hash for Stripe idempotency namespacing — fine, but a `crypto.createHash` one-liner is cleaner and audit-friendly.
10. README/PR body claim only 2 test suites; actual is 6 — doc drift.
11. `WorkPreferences` back-compat type alias and the legacy `findReplay`/`record` methods are **dead on a fresh lane** (no prior callers) — delete per ENGINEERING_RULES §7.
12. Migration #3 uses `ADD COLUMN IF NOT EXISTS` / defensive backfill — harmless but signals it was patching its own earlier migration; on a fresh lane these collapse into one clean DDL.

**What's genuinely good (keep the design, port the logic):** idempotency-ledger pattern, transactional accept with withdraw-others, partial unique indexes, structured non-leaking Stripe errors, keyset (tuple) pagination, PII omission in pool browse, compensation-term server-side validation. This is the salvageable IP.

---

## 2. HOW TO BEST FINISH IT (the rebuild plan)

### 2.1 Salvage vs rebuild — recommendation: **REBUILD FRESH on current `main`, porting logic file-by-file.**

Reasoning in 7th-grade terms: the old branch was built for a different "lock system" on the database (RLS) than the one the app now uses, and it accidentally builds a *second* Stripe payout setup next to the one we already finished. Trying to patch it means untangling 5 old audit rounds and 4 mis-dated database migrations against a moving `main`. It's cleaner and safer to **open a fresh lane on today's `main` and copy over the good logic** (the offer state machine, idempotency, Stripe error handling) while **rewriting the database-lock rules to match `main`** and **reusing the existing Stripe payout account** instead of making a new one. Close #183 with a pointer to the rebuild chain (R82: a tracked GitHub issue, not a bare comment).

### 2.2 Dependency-ordered PR chain (each ≤400 LOC)

Naming follows the spine convention; "TM" = Talent Marketplace lane. RLS columns assume the **`app.current_user_id()` / `app.is_owner()` + `service_role` bypass** idiom (the contracts migration is the reference template).

| PR | Scope | LOC | Depends on | Blast radius | RLS / tenant | Stripe idempotency/webhook | Parallel? |
|---|---|---|---|---|---|---|---|
| **TM-0 (ADR)** | Decision-of-record (R68): rebuild-not-patch; **reuse existing `/coach/connect/*` ConnectAccount, drop `CoachConnectAccount`**; migration re-dating policy; close #183. | ~80 (md) | — | none (docs) | states the spine idiom to use | states reuse of existing Connect | **Serial — gates all** |
| **TM-1 (schema+RLS)** | Prisma: 3 enums + `CoachApplication`, `CoachOffer`, `MarketplaceMutationIdempotency` (NO `CoachConnectAccount` — reuse existing). One migration, **re-dated after `main`'s latest**, with `ENABLE`+`FORCE` RLS, `service_role` bypass, `app.current_user_id()`/`app.is_owner()` policies incl. **write-scope on CoachOffer**, RESTRICTIVE deny-all on ledger. | ~380 | TM-0 | high (schema) | **owns all new-table policies**; head-coach scope reuses `TeamSubCoachAssignment` predicate | ledger table only | Serial (foundation) |
| **TM-2 (application flow)** | `coach-application.{service,dto,controller-slice}`, module skeleton, `parseTupleCursor`. Public submit (idempotent) + `/applications/me` + admin list/review. | ~390 | TM-1 | medium | applicant-reads-own; owner via `is_owner()` | submit idempotency (DB unique) | After TM-1 |
| **TM-3 (admin review queue)** | Could fold into TM-2 if under budget; else split: `admin/applications` list + `:id/review` with `claimOrReplay`. | ~200 | TM-2 | low | owner-only (`is_owner()`) | review idempotency ledger | Serial after TM-2 |
| **TM-4 (idempotency ledger svc)** | `MarketplaceIdempotencyService` (claim/markCompleted/releaseClaim) **+ stale-claim TTL sweep** (fixes P1-8). Drop legacy `findReplay`/`record`. | ~200 | TM-1 | low | RESTRICTIVE deny-all (set in TM-1) | core idempotency engine | **Parallel with TM-2/TM-3** (own files) |
| **TM-5 (talent pool search)** | `TalentPoolService` + `/talent/pool` + `SearchPoolQueryDto`. `canViewTalentPool` **+ NoActiveSubCoachGuard** (fixes P1-4). PII omission. | ~260 | TM-2 (cursor), TM-1 | medium | reads `approved`/`pool`; entitlement+sub-coach guard | none | After TM-2 |
| **TM-6 (Connect reuse adapter)** | **Thin adapter** mapping marketplace needs onto the **existing** `/coach/connect/*` ConnectAccount (per TM-0). Onboarding-link + status via existing service; no second Stripe account model. | ~220 | TM-1 | medium (touches shared Connect) | reuse existing Connect RLS | reuse existing Stripe idempotency; **append-only on shared connectApi** (R71) | Serial after TM-1 |
| **TM-7 (offer lifecycle)** | `CoachOfferService` create/accept/reject, `$transaction` flip + withdraw-others, `validateCompensationTerms`, `HeadCoachOnlyGuard` on create. Wires TM-4 ledger + TM-6 Connect. | ~400 | TM-2, TM-4, TM-5, TM-6 | high | offer read/write policies (TM-1); head-coach-only create | accept/reject ledger keys; onboarding link best-effort | **Serial — convergence point** |
| **TM-8 (RLS + cross-tenant tests)** | Live RLS-lane specs (`jest.rls.config.js`) per new table + cross-tenant isolation + offer-race concurrency. Fixes P1-6. | ~350 | TM-7 | low (test-only) | **proves** isolation | proves idempotency replay | **Parallel after TM-7** |
| **TM-9 (revenue-split payment intents)** | Implement `createMarketplacePaymentIntent`; thread `application_fee_amount`+`transfer_data.destination`; `payment_intent.succeeded` webhook → split ledger. **Track 8.5 core.** | ~400 (likely 2 PRs) | TM-6, TM-7 | high (billing) | split-ledger write-scope RLS | **MoR `automatic_tax`, `PaymentFailure.stripe_event_id @unique`, `$transaction` (ENG §9)** | Serial after TM-7 |
| **TM-10 (Connect account.updated webhook)** | Event-driven `onboarding_completed`; replaces polling. Fixes P1-7. | ~180 | TM-6 | medium (webhook router) | n/a | **webhook sig verify, event-id idempotency** | Parallel with TM-9 |
| **TM-M1..M5 (mobile)** | See §3 — each its own PR, each gated by an **R73 GPT-5.5 Planner brief**. | ≤400 each | backend endpoint live | mobile only | n/a | reuse `generateIdempotencyKey` | Parallel per-screen after their backend dep |

**Critical path (serial):** TM-0 → TM-1 → TM-2 → TM-7 → TM-9.
**Parallelizable in the 5-wide queue:** {TM-4} ∥ {TM-2→TM-3}; then {TM-5, TM-6} after TM-2/TM-1; then {TM-8, TM-10} after TM-7; mobile PRs each fire once their backend dep is green.

### 2.3 Coupling with the RLS spine (A1–A4) and Chain B/C
- **A1–A4 RLS spine:** TM-1's policies **must** be authored in the spine idiom (helpers `app.current_user_id()`/`app.is_owner()`, `service_role` bypass = Primitive A, anon→zero rows). Use `20261215000200_contracts_rls/migration.sql` as the literal template. The head-coach→applicant visibility scope should **reuse the `TeamSubCoachAssignment` non-archived predicate** already used by Tier-2 coach-team + contracts policies — do not invent a new team-scope expression (Inconsistency Tax).
- **Chain B (contracts) / C:** `CoachOffer.accepted` is the natural trigger point for a future onboarding **ContractEnvelope** (Chain B). Flag TM-7 as the integration seam; don't build it now, but don't foreclose it — keep `acceptOffer`'s post-commit hook extensible.
- **Sub-coach revenue share (ENG §11):** the 5%-only-when-toggled rule is a *different* mechanism than marketplace `compensation_terms`. TM-9 must not collide with or auto-apply the sub-coach 5% — keep them separate ledgers. Flag for the auditor.

### 2.4 R66/R70/R71 process gates for the lane
- Every builder runs the **R70 fail-fast lane** then full **R66 `npx jest --runInBand`** before push, logged to `/home/user/workspace/`.
- **R71 file-ownership:** TM-1 owns `prisma/schema.prisma` + new migration (shared-append-only — second merger rebases). TM-6/TM-9 touch shared Connect/billing — enumerate OWNS / MUST-NOT-TOUCH in each brief.
- Each PR: builder (Opus 4.8) → GPT-5.5 audit (R72 full sweep) → fix → re-audit until clean. Mobile PRs add the **R73 Planner** stage first.

---

## 3. SCOPE-EXPANSION HOOKS (room for the operator's luxury mobile design doc)

### 3.1 Named mobile UI placeholders (the design doc fills these)
Each is a **future mobile PR** gated by an R73 GPT-5.5 Planner brief (`PLANNER_BRIEF_<PR>_<SCREEN>.md`). Backend endpoint dependency noted.

- **`[SCREEN: CoachApplicationForm]`** → backend `POST /apply/coach` (TM-2). *(Note: PR body says this lives on the marketing site; if the design doc wants it in-app, that's ADDED SCOPE.)* Default path: single-tap submit with smart defaults on `preferred_client_type`/`preferences`.
- **`[SCREEN: ApplicationStatus]`** → `GET /applications/me` (TM-2). **Already exists but ORPHANED** — needs (a) navigator wiring, (b) R73 polish pass. Anti-pattern 4 (Empty Confirmation) risk on `approved`/`placed` transitions → add a CALM/celebration micro-interaction.
- **`[SCREEN: TalentPoolBrowse]`** → `GET /talent/pool` (TM-5). Head-coach search/filter. Hick's Law: one primary "view candidate" tap; filters progressively disclosed. Miller's Law: ≤5 cards-worth of actionable elements above the fold.
- **`[SCREEN: CandidateDetail + MakeOffer]`** → `POST /talent/offers` (TM-7). Compensation-type picker = the key Hick's-Law decision; smart-default to most-common arrangement.
- **`[SCREEN: OfferInbox + AcceptReject]`** → `PATCH /talent/offers/:id/{accept,reject}` (TM-7). Accept is a **peak moment** (§6.2) — design the celebration; it also branches into Connect onboarding.
- **`[SCREEN: ConnectOnboardingRedirect]`** → `/coach/connect/*` (TM-6, reused). Quiet, trust-building handoff to Stripe-hosted flow (ENG R8: must feel in-app/branded; never visibly "leave the app").
- **`[SCREEN: OfferManagement (head-coach)]`** → list/withdraw sent offers (TM-7 + a withdraw endpoint not yet built — minor ADDED SCOPE).

### 3.2 Where a luxury (R73) design pass applies
- **Palette/type:** ENG §11 quiet-luxury — Cormorant Garamond / Inter, bone/forest (`#FAF8F5`, `#4A7C59`, `#1A1A1A`); **semantic theme tokens only, no hardcoded hex** (the existing `talentMarketplace.test.tsx` already enforces this — keep that guard).
- **Coach Maya voice:** any applicant-facing copy (status descriptions, offer messaging, onboarding nudges) routes through the Maya voice; current `STATUS_DESCRIPTION` strings are functional-but-flat → candidate for a voice pass.
- **Motion budget:** max 300ms per interaction (R73 / Roman spec); celebration on offer-accept and application-approved.
- **Anti-patterns to watch:** #4 Empty Confirmation (status changes), #7 Polish-as-Afterthought (design motion in parallel with TM-M PRs, not after), #5 Inconsistency Tax (reuse existing card/list vocabulary, esp. shared Connect UI).
- **No emoji / no gamification chrome** (ENG §11) — the marketplace is a professional/financial surface; keep it calm.

### 3.3 Proposed tracking issues (LIST for operator approval — not yet filed, per R82)
1. `[TM] Close #183; rebuild talent marketplace on current main (RLS-spine + Connect reuse)` — the ADR/umbrella.
2. `[TM] Reconcile dual Connect surfaces: /coach/connect vs /talent/connect` (decision needed).
3. `[TM] Migration re-dating: re-home phase-11 migrations after 20261215000200`.
4. `[TM] Anonymous-applicant signed invite-token flow (unblocks accept/reject for null applicant_user_id)`.
5. `[TM] Idempotency-ledger stale-claim TTL sweep`.
6. `[TM] Mobile: wire orphaned ApplicationStatusScreen into navigator + R73 polish`.

---

## ADDED SCOPE (operator)

> _Operator: paste the incoming luxury mobile design document's requirements here. The §3.1 `[SCREEN: …]` placeholders and §2.2 TM-M PR rows are the slots they map onto. Each new mobile screen requirement triggers an R73 GPT-5.5 Planner brief before any builder is dispatched. Backend endpoint dependencies are already enumerated per screen; flag here any screen that needs a NEW backend endpoint so it can be inserted into the backend chain (§2.2) at the right dependency point._

### Operator clarification — 2026-06-16 (Bradley Gleave, via Agent 46)

**IMPORTANT scope correction:** The six "client-facing" ideas the operator initially raised here belong to a SEPARATE product — the **Consumer Marketplace** (clients discover & book coaches), now specced in `CONSUMER_MARKETPLACE_SPEC.md`. **PR #183 is the TALENT MARKETPLACE** (gyms / growing head-coaches hiring NEW coaches) — its original intent stands. The two are distinct products that SHARE infrastructure (coach profiles, Stripe Connect, RLS spine, the revocable badge engine). Talent-marketplace product decisions are still being gathered with the operator (next stage). The §1/§2 inventory and TM-0…TM-10 rebuild chain above remain valid for the talent marketplace. Do NOT fold the consumer-marketplace scope into this lane.

<details><summary>(superseded) earlier consumer-facing capture — see CONSUMER_MARKETPLACE_SPEC.md instead</summary>

The marketplace is being re-scoped from "coach application/hiring pipeline" (head-coach hires sub-coaches) to **a CLIENT-FACING coach discovery & booking marketplace** (clients find and engage coaches). This is a meaningful expansion of the original #183 intent and adds new backend surfaces. Six confirmed requirements + the design doc (`mobile_design_doc_extracted.txt`, R73 source-of-truth supplement) below.

**Confirmed requirements (operator):**

1. **Searchable coach location + practice modality.** Every coach profile carries a location (geocoded/searchable) and a modality flag: `in_person` / `hybrid` / `online`. Location is a primary search axis. → NEW backend: coach-profile table extension (location, geo, modality), location search/index. Inserts as a new schema concern in TM-1 (or a TM-1b profile-schema PR).

2. **"At your gym" suggested grouping.** A client with a gym membership sees coaches under their gym's control FIRST, as a separated "At your gym" suggested group, above the general marketplace. → Reuses gym-membership + gym-scope RLS spine; needs a coach↔gym affiliation/control relationship and a ranked-grouping query. Couples to A2 `app.current_gym_ids()`.

3. **"TGP Certified" admin-granted status stamps (think deeply — tiered).** Admin/owner roles grant revocable trust stamps that render as approval seals on profiles. Operator wants this designed deeply: candidate for a TIERED ladder (Verified → Certified → Elite/Master) rather than one binary flag, earned via criteria + admin approval, revocable. The single strongest trust/conversion lever. → NEW backend: certification table (tier, granted_by, granted_at, criteria_snapshot, revoked_at), admin grant/revoke endpoints w/ audit log, RLS (admin-write, public-read of active stamps).

4. **Coach review system + rich profile.** Clients leave reviews on their coach. Profile shows: reviews, tenure on TGP, clients served, TGP Certified status, AND client reviews. → NEW backend: review table (relationship-gated — see open Q D), aggregate rating, profile aggregation endpoint (tenure, clients-served count, cert tier, review summary).

5. **Web-UI translatable marketplace + SEO.** Marketplace pages + coach profiles must render as web UI for SEO — target "Best Personal Trainers in Seattle" → land on TGP Seattle marketplace pre-filtered by location. → NEW surface: SSR/SEO web pages (separate web app or Next.js marketing surface) consuming the same marketplace API; city/location landing pages; structured data (schema.org LocalBusiness/Person). This is a GROWTH track, likely its own lane beyond the mobile/backend chain.

6. **Slice by client GOAL — free-text search OR stacked filters.** Clients search by goal via free text ("build muscle at home") OR stacked filters (online + hypertrophy + woman-led + …). → NEW backend: coach taxonomy/tags (specialization, modality, goal, coach attributes like woman-led), filterable + free-text search. Extends TM-5 talent-pool search into a full faceted client-facing search.

**Open product decisions (A–H) surfaced to operator — defaults pending operator answers:**
- A. Certification tiers: binary vs tiered ladder (operator leaning deep/tiered).
- B. How stamp is earned: admin-discretion vs criteria-gated vs auto-threshold.
- C. Booking/lead flow: full in-app booking+payment (Stripe Connect) vs lead-gen first.
- D. Review integrity: relationship-gated (only verified clients) vs open.
- E. Coach self-controls: availability/capacity/pricing/listing self-managed vs admin/gym-controlled.
- F. Search ranking & fairness: rating-first vs at-your-gym-first vs balanced w/ new-coach fairness boost.
- G. Trust & safety: surface real-world creds (NASM/CPT) + insurance + background-check + report path now vs defer.
- H. Monetization: marketplace take-rate vs coach subscription vs free-for-gyms retention feature.

**Design doctrine to apply (from operator's uploaded design doc + ENG §11 quiet-luxury):** emotional design (feeling > function), Apple cognitive de-load (Hick's/Miller's/progressive disclosure), sustainable gamification (NO badge theater — relevant to the cert stamps: make them competence signals, not vanity), outcomes-over-opens, calm/professional financial surface, Coach Maya voice, ≤300ms motion, semantic theme tokens only.

**Chain impact:** This expansion roughly DOUBLES the backend surface (coach profiles, certifications, reviews, faceted search, optional booking/payments) and adds a whole WEB/SEO lane. The original TM-0…TM-10 chain (head-coach→sub-coach hiring) and this client-facing discovery layer may be TWO related products sharing infrastructure. Operator decision pending on whether to merge them into one chain or run client-facing discovery as its own lane (TM-C* = client-facing) on top of the shared coach-profile/Connect/RLS foundation.

**RESOLVED 2026-06-16:** Two SEPARATE marketplaces. Consumer-facing = `CONSUMER_MARKETPLACE_SPEC.md` (own lane, TM-C*). Talent = this doc (#183 rebuild, TM-0…TM-10). Shared foundation: coach profile, Stripe Connect (reuse existing), RLS spine, badge engine, reviews, faceted search.

</details>

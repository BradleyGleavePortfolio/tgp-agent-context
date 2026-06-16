# Opus 4.8 Planner Brief — PR #183 Talent Marketplace (Phase 2 R81 rebuild lane)

## Role & model
You are an **Opus 4.8 Planner/Architect** (NOT a builder — do NOT write production code, do NOT open PRs, do NOT modify the branch). Your deliverable is a written plan. Under the TGP / Growth Project R81 doctrine.

## Context
PR **#183** "feat(phase-11/talent-marketplace): application + pool + Stripe Connect Express scaffold" was intentionally PARKED ("not needed for now") and is now being pulled into **Phase 2 as a from-scratch R81 rebuild lane** by operator Bradley Gleave. It is CONFLICTING with `main`, has NO CI checks, untouched since 2026-05-24. Head `714a69af`, base `main`, +4762/−6 across 27 files.

PR body summary: ships data model (Prisma: `CoachApplication`, `CoachConnectAccount`, `CoachOffer` models; enums `CoachClientType`, `CoachApplicationStatus`, `CoachCompensationType`, `CoachOfferStatus`; User model extended), application flow, admin review queue, talent pool search, and Stripe Connect Express onboarding scaffolding. The head-coach browse-and-hire UI and revenue-split payment intents were deferred to "Track 8.5."

## Repo
- Backend: `https://github.com/BradleyGleavePortfolio/growth-project-backend` (PR #183 lives here)
- Mobile: `https://github.com/BradleyGleavePortfolio/growth-project-mobile` (luxury mobile design doc will target this)
- Context: `https://github.com/BradleyGleavePortfolio/tgp-agent-context`

## Your three deliverables (write to `/home/user/workspace/plan_183_talent_marketplace.md`)

### 1. WHAT EXISTS NOW (ground truth)
Read PR #183's diff and the current `main`. Produce a precise inventory:
- Data model: every model/enum/field added, relationships, migration state.
- Backend surfaces: every endpoint/service/module the PR adds (application flow, admin review queue, talent pool search, Stripe Connect Express onboarding) — what each does, what's a real implementation vs. a scaffold/stub.
- What's explicitly DEFERRED in the PR (Track 8.5: head-coach browse-and-hire UI, revenue-split payment intents).
- Mobile side: what (if anything) exists in the mobile repo for talent marketplace today.
- Honest assessment of quality vs. R0/R81 bar: where are the banned patterns, RLS gaps, missing tests, contract risks, Stripe webhook/idempotency gaps? (This PR predates the R81 regime — assume it is NOT clean.)

### 2. HOW TO BEST FINISH IT (the rebuild plan)
Given it's CONFLICTING + no-CI + pre-R81, it almost certainly needs a from-scratch R81 rebuild, not a patch. Propose:
- Whether to salvage the branch vs. rebuild fresh on current `main` (recommend, with reasoning).
- A **dependency-ordered chain of ≤400-LOC PRs** (data model → application flow → admin queue → talent pool → Stripe Connect → payment intents → mobile UI), each with: scope, est. LOC, blast radius, what it depends on, RLS/tenant-isolation requirements, Stripe idempotency/webhook requirements.
- Which PRs are independent (parallelizable in the 5-wide queue) vs. serial.
- Where this lane intersects the existing RLS spine (A1-A4) and Chain B/C — flag any coupling.

### 3. SCOPE-EXPANSION HOOKS (leave room for the operator's additions)
The operator is attaching a **luxury mobile design document** and wants to ADD scope/detail. Structure your plan so new scope slots in cleanly:
- Identify the mobile UI surfaces the talent marketplace needs (coach application screen, pool browse/search, hire flow, Connect onboarding, offer management) as named placeholders the design doc will fill.
- Flag every place a "luxury design" pass (quiet-luxury palette, Coach Maya voice, R73 mobile design intelligence) would apply.
- Leave an explicit "ADDED SCOPE (operator)" section at the bottom for me to paste the design doc's requirements into.

## Constraints
- Do NOT write production code or open PRs. Plan only.
- If you file any tracking issues, follow R82 (GitHub issue, not bare comment) — but prefer to just LIST proposed issues in the plan for operator approval first.
- Reference the repo's `AGENT_RULES.md`, `ENGINEERING_RULES.md`, and `tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (R73 source of truth) where relevant.
- Be honest about defects — the operator rewards signal, not optimism.

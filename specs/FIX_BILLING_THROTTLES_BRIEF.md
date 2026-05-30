# FIX BRIEF — Billing webhook completeness + Stripe-write throttles (B7, B2, B3, B8, B1, B4-remainder)

Repo: growth-project-backend. Type: MONEY/SECURITY FIX (🔴💰). Branch: `fix/billing-throttles`.
PR title: `Fix: payout-failed webhook handling + Stripe-write throttles + start-subscription DTO`

## Why
Six open billing-surface issues (verified in `audits/issue-registers-2026-05/OPEN_ISSUES_PRUNED_2026-05-28.md`). All in billing/connect/owner-billing files — DISJOINT from PR-17 (`src/packages/*`) AND from the AI-gateway fix stream. Most dangerous: B7 (silently swallowed failed coach payouts).

## Scope — EXACTLY these issues
1. **B7 (🔴💰 swallowed payout failures)** — `src/billing/billing.service.ts:365-373`: the webhook switch has no `transfer.failed` / `payout.failed` cases, so failed coach payouts hit the default "ignoring unhandled" branch and are dedup-swallowed — coaches think they were paid. Add explicit `transfer.failed` and `payout.failed` (and `payout.canceled` if Stripe emits it for this flow) cases that record the failure and surface it (log + the existing coach-notification/alert mechanism if one exists; if none exists, at minimum a structured error event + a persisted failure marker that an ops/coach surface can read — do NOT invent a new notification kind unless a trivial reuse exists). Verify the exact current switch structure + how other cases record state, and mirror it. Keep idempotent on Stripe replay.
2. **B2 (🔴💰)** — `coach-billing.controller.ts:54` and `mobile-coach-billing.controller.ts:88`: neither portal-session POST has `@Throttle`. Add `@Throttle` to both (mirror the project's existing Stripe-write throttle limits).
3. **B3 (🔴💰)** — `owner-billing.controller.ts:69-74` `start-subscription` (Stripe createCustomer/createSubscription) — no `@Throttle` on file. Add it.
4. **B8 (🔴💰)** — `connect.controller.ts:62-83` `onboarding-link` + `dashboard-link` POSTs — no `@Throttle`; single-use Stripe links can be burned/rate-limited. Add `@Throttle` to both.
5. **B1 (🧹 dedupe drift risk)** — portal-session logic duplicated across `coach-billing.controller.ts:54` and `mobile-coach-billing.controller.ts:88`. Extract the shared logic into a single service method both controllers call (do NOT change behavior — pure refactor to remove drift). Keep it minimal; if extraction risks scope-creep, at MINIMUM ensure both have identical throttle + behavior and note the dedupe as a follow-up. Prefer the clean extraction.
6. **B4-remainder (🧹 validation)** — `start-subscription` body is an inline `{ plan?; trialDays? }` type with no runtime validation. Add a `StartSubscriptionDto` with `@IsIn` on `plan` (the valid plan enum) and `@IsInt/@Min/@Max` on `trialDays`, wired through the global `ValidationPipe`.

## Guardrails
- Do NOT touch any `src/packages/*` file, `prisma/schema.prisma`, any migration, or any `ai*` file (collision-free with PR-17 and the AI stream).
- Reuse the repo's existing `@Throttle` import + limit/ttl conventions (find an existing Stripe-write `@Throttle` and match it). Reuse `class-validator` + the global pipe.
- B7 must NOT change the happy-path payout/transfer success handling — only ADD the failure cases. No money math changes.

## Tests (real)
- B7: a `transfer.failed` / `payout.failed` event is handled (not swallowed) — records the failure + does NOT mark the coach as paid; idempotent on replay (second identical event = no-op, no double-record). Assert the default "ignoring unhandled" branch is NOT hit for these types.
- B2/B3/B8: each targeted route carries a `@Throttle` (assert metadata, or integration 429 if a harness exists).
- B4: `start-subscription` rejects an invalid `plan` and a bad `trialDays` via the DTO; accepts a valid body.
- B1: both portal-session controllers produce identical behavior via the shared method (assert the extracted method is called by both).
- Run typecheck + lint + billing-area tests; report actual counts.

## Deliverables
- Branch + PR vs default. Pull latest default first. Push every ~2 min (R61).
- `/home/user/workspace/specs/FIX_BILLING_THROTTLES_BUILD_REPORT.md`: file:line per issue, the B7 failure-case handling + idempotency proof, the throttle limits used, the DTO, actual tsc/lint/test counts.
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.

Owner decision 10 pending: merge only after the owner's yes.

**Tier:** T4 (money copy: what a coach is told to buy when the AI credit pool is used up; return links for the paid checkout).
**Why:** CREDIT-REFILL-130 B3, backend part. Roman, AI guidance and the AI gateway told every coach to add a credit pack, but only the iOS US-link build (growth-project-mobile#551) and development builds sell one. CREDIT-REFILL-130 U2: `COACH_AI_PACK_SUCCESS_URL` and `COACH_AI_PACK_CANCEL_URL` were unset, so the in-app checkout never saw its return link.
**T4 trigger scan:** money: copy only. No charge, price, pool or ledger change, no Stripe change, and the checkout service is unchanged (it already reads `COACH_AI_PACK_*`). Auth, RLS, PII, credentials: none (the headers are client-supplied and only choose wording). Env: two non-secret values declared in the manifest. The operator applies them with fly-env-sync after merge; no `fly secrets set`.
**T3 trigger scan:** one new global interceptor (`APP_INTERCEPTOR`) that reads two request headers into an `AsyncLocalStorage` store. Only copy depends on them.
**Bounded T1:** copy on three pool-empty paths.
**Canonical builder:** CREDIT-PAY-131 (agent 131).
**Parent owner:** CREDIT-REFILL-130 (B3, U2) and CREDIT-PAY-130.
**Acceptance evidence:** local jest, one file at a time:
- `ai-credits-caller-purchase-policy` 16/16: decision table, renewal sentence and copy rules, plus a real Nest app over HTTP showing the headers stay in scope after awaits, in a 402 thrown after an await, and across 6 concurrent requests.
- `ai/ai-guide-coach-pool` 7/7 and `ai-credits-gateway-402` 3/3.
- `roman/roman-c2-pool` 4/4 and `roman/roman-rmn2-fixes` 6/6.
- `ci/fly-env-manifest` 69/69, `ci/fly-env-workflows` 15/15, `env-validation` 50/50, `prod-readiness/env-registration` 30/30, `throttler-isolation` 28/28.
- After merging main: `roman/r11-seams` 22/22, `ci/fly-env-manifest` 69/69 and the new spec 16/16 again.
- `fly-env-manifest.js validate` passes (53 flags), and every `kill-switches` line is in `docs/runbooks/launch-flags.md`.
- ESLint is clean on the 10 changed files.

Failing-first, on main b72e2c45: the new AI guidance test fails (a coach whose build sells nothing gets "...Add a credit pack to keep using AI guidance..."). The new gateway test also fails (message "AI budget exhausted — top up to continue").
**Promotion triggers:** none beyond T4.

## What changes for coaches and clients

- A coach whose AI credits are used up is told to add a credit pack only from a build that sells one. That means the iOS US-link build (`X-Client-Purchase-Policy: p2p-and-ai-credits`) and development builds (`all` from iOS).
- Everyone else (iOS store builds without the link, Android release builds, web, server jobs) is told when the credits renew, for example "They renew on November 1."
  - Roman: "The AI credits on your coaching account are used up for this month, so Roman cannot answer right now. They renew on November 1. Your clients, messages and the rest of the app work as usual."
  - AI guidance: the same shape.
  - AI gateway: "The AI credits on your coaching account are used up for this month. They renew on November 1." It was "AI budget exhausted — top up to continue".
- Client copy is unchanged. The headers only choose wording; no request is allowed or refused because of them.
- The current mobile app maps the Roman and AI builder 402s by code to its own text. So today the visible change is the AI guidance reply (shown as written) and any caller that shows the server message.
- U2: after merge, the operator's fly-env-sync sets these two values:
  - `COACH_AI_PACK_SUCCESS_URL=com.growthproject.app://checkout/success?session_id={CHECKOUT_SESSION_ID}`
  - `COACH_AI_PACK_CANCEL_URL=com.growthproject.app://checkout/cancel`

  These are the links the in-app checkout (`CreditPackCheckoutScreen` WebView) recognises. The US-link build sends `tgp://` links inline and does not depend on them. Unset falls back to `STRIPE_CHECKOUT_*`, as today.

## Env manifest diff

Only `COACH_AI_PACK_SUCCESS_URL` and `COACH_AI_PACK_CANCEL_URL` (in `flags` and `gates`). In `env-validation.ts`, those two rules gain `values` and `unsetIs`, which are descriptive only and never read at runtime. The runbook gains the two generated kill lines.

## B / U

- B3 (CREDIT-REFILL-130, backend part): fixed.
- U2 (CREDIT-REFILL-130): fixed in the manifest. It takes effect when the operator runs fly-env-sync after merge.
- C: the renewal date is shown in UTC. The pool renews at 00:00 UTC on the 1st, which is the afternoon before in the US, so credits come back a little sooner than the date says.
- C: the headers are client-supplied, so a modified client can only change wording.
- C: Stripe recommends a universal link for `success_url`. The app scheme is used here (Proposed: a universal link with an apple-app-site-association path).

Companion PR: growth-project-mobile#551.

agent 131

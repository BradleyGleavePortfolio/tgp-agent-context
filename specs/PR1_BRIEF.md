# PR-1 BUILD BRIEF — Fix In-App Client Checkout (P0-a / P0-b)

**Repo:** growth-project-mobile (React Native / Expo). **Pillar 2 (harden infra). Type: FIX/REWIRE.**
**Branch:** `pr1/fix-in-app-checkout` off the default branch.

## THE BUG (P0-a) — in-app client checkout calls 4 non-existent backend routes
`mobile/src/api/clientPaymentsApi.ts` calls routes under `/v1/clients/me/coach/*` that DO NOT EXIST on the backend. Every purchase attempt 404s, and the 404 is then mis-translated into a misleading "not enabled yet" / "payments not configured" empty state, so the buyer thinks the coach hasn't turned on payments.

The REAL backend checkout API is the `CheckoutController` mounted at `/v1/checkout/*`. The correct, working reference client is already in the codebase: `PackageCheckoutScreen` correctly hits `POST /v1/checkout/sessions`. Use that as the template for what the real contract looks like.

Specific offending lines to inspect and rewire in `clientPaymentsApi.ts` (line numbers approximate, verify against current file): ~147, ~179-189, ~202-205, ~251-259. These call `/v1/clients/me/coach/*` style routes. Rewire ALL of them to the real `/v1/checkout/*` endpoints exposed by the backend `CheckoutController` (verify the actual route list by inspecting how `PackageCheckoutScreen` / the checkout flow calls them; the controller exposes session creation + a confirm endpoint + likely a list/status route).

## THE BUG (P0-b) — confirm endpoint verb/path mismatch
`mobile/.../CheckoutReturnScreen.tsx` (~lines 53-54) does `POST /clients/me/coach/checkout/confirm`. The real backend endpoint is `GET /v1/checkout/sessions/:id/confirm`. Result: confirmation never succeeds → permanent "confirmation pending" after a successful Stripe payment. Fix the verb (POST→GET) AND the path to the real one, passing the session id in the path.

## THE BUG (the swallowed 404) — `isNotConfigured`
Wherever the client maps errors (look for `isNotConfigured` or similar logic that decides the "payments not enabled yet" empty state — likely in `clientPaymentsApi.ts` and/or `ClientPackagesScreen.tsx`), a 404 is being interpreted as "coach hasn't configured payments." After rewiring to the real routes this should largely disappear, but you MUST also fix the error mapping so that a genuine 404/transport error is NOT silently shown as "not configured." A true "coach has no published packages / payments not connected" state should be derived from real signal (empty package list / explicit backend flag), not from a 404 on a broken route. Surface real errors to the user (retryable error state), do not swallow them.

## SCOPE GUARDRAILS (do NOT exceed)
- This PR is FIX/REWIRE ONLY. Do NOT add drip-feed, do NOT add new models, do NOT touch backend. Mobile repo only.
- Do NOT delete Surface A or refactor package surfaces — that is PR-5, a later PR. Leave it alone.
- Keep the diff tight: API client rewiring + confirm screen verb/path + error-mapping fix + any minimal screen wiring needed for those to compile and work.
- Match existing code style, error-handling conventions, and the patterns used by the working `PackageCheckoutScreen`.

## VERIFICATION REQUIRED before you report done
1. Confirm the exact real route list by reading the backend contract as expressed in the working mobile checkout path (`PackageCheckoutScreen` and the checkout return flow). If anything about the real routes is ambiguous from the mobile side, state the assumption explicitly in your report.
2. Run the repo's typecheck / lint (e.g. `tsc`/`eslint` per package.json scripts). It MUST pass.
3. Run any existing tests that touch payments/checkout. Add a focused unit test if the repo has a testing pattern for api clients; otherwise document why not.
4. Grep the whole mobile repo for any OTHER call sites still hitting `/v1/clients/me/coach/` checkout routes and fix them too (don't leave half the app on dead routes).

## COMMIT / PR RULES (STRICT)
- Commit identity MUST be: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`
- NO "Co-Authored-By" and NO "Generated with" trailers in the commit message. None.
- Make the commits on branch `pr1/fix-in-app-checkout` and OPEN A PR against the default branch. Report the PR URL.
- PR description: what was broken, the exact route mapping (old → new) for each call site, the confirm verb/path fix, the error-mapping fix, and how you verified.

## DELIVERABLE
Report back: (a) PR URL, (b) full list of call-site changes old→new, (c) typecheck/test results, (d) any assumptions made about the real backend routes, (e) any other dead-route call sites you found and fixed.

# Lane B-PAYSHEET (agent 112, round 3) — Claude Opus 5.5 builder, NEW mobile PR (launch blocker OR-112-22)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Commit identity: git -c user.name="TGP Agent 112" -c user.email="agent@tgp.invalid".
gh/git need bash api_credentials=["github"]. Owner: wall clock is the #1 resource, quality non-negotiable. Expo Free: never start an EAS build.

Bug (found by AUD-OPUS-6, see /home/user/workspace/ops/reports/AUD-OPUS-6-112.md lines ~16 and ~46): mobile
src/components/PackageSelectionSheet.tsx (the Day 1 / RootNavigator package sheet) POSTs {package_id, idempotency_key} to
/v1/checkout/sessions. The backend rejects it with 400 (forbidNonWhitelisted) and that route never returns PaymentSheet secrets, so
a client can never pay from this sheet and sees the generic "Payment failed. Please try again." / "Payment is not available right now.
Please try again later."
Fix (new branch from mobile origin/main f34b5b99, e.g. fix/package-sheet-payment-intent):
1. Read the backend contract on backend main 9cfd70d6 (/home/user/workspace/repos/growth-project-backend, `git fetch origin main`):
   POST /v1/checkout/payment-intent request DTO and response (client secret, ephemeral key, customer id, publishable key, purchase id,
   idempotency semantics, error codes). Reuse any existing mobile helper that already calls payment-intent correctly (grep src/ for
   payment-intent / initPaymentSheet) instead of writing a second client.
2. Make the sheet: create the PaymentIntent with the right body and a stable idempotency key per attempt, pass customerId +
   ephemeral key + client secret to Stripe initPaymentSheet/presentPaymentSheet, handle success (purchase confirmed / entitlement
   refresh as the rest of the app does), cancel (no error), and failures with SPECIFIC copy per cause (offline, card declined /
   authentication failed from Stripe, backend error codes such as package unavailable / price changed / payments not configured,
   anything else -> support email via the shared SupportEmailFallback + short reference). No first-person copy, no "try again later".
   Never log or send client secrets to Sentry.
3. Tests: a failing-before test that asserts the request goes to /v1/checkout/payment-intent with a body the backend DTO accepts
   (mirror the backend DTO field list in the test and cite it) and that PaymentSheet gets customerId/ephemeral key/client secret;
   per-cause copy tests; cancel path. They must fail on main and pass after.
4. Check open mobile PRs touching the same file (`gh pr list -R BradleyGleavePortfolio/growth-project-mobile --json number,files`
   or `gh pr diff`), especially #321, #329, #332; keep your diff minimal to avoid conflicts and list overlaps in the PR body.
Process: worktree /home/user/workspace/wt/b-paysheet; `bash /home/user/workspace/ops/link_deps.sh mobile`; targeted jest via
/home/user/workspace/ops/heavy.sh only (never wrap it in a short timeout); eslint; the guards CI runs. Open the PR with a Conventional
Commits title, e.g. "fix(payments): Day 1 package sheet takes payment through payment-intent", body with the tier header (T4: money),
what/why, tests, failing-before evidence. Wait for the 3 required checks green (max 30 min).
Unlink node_modules and remove the worktree at the end. Report: /home/user/workspace/ops/reports/B-PAYSHEET-112.md ending with
"## HANDOFF FOR AGENT 113". Never merge, dispatch workflows or touch production.
Final answer (<250 words): PR number, head, CI, what changed, tests, overlaps.

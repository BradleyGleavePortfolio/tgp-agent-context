# tgp-importer-extension PR #3 — Lens B (Adversarial) RE-AUDIT — Fixer Round 2

- **PR:** #3 `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `28d2287fd6c4b0106f2a9846c1548ab2bc1b96bf` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`
- **Prior Lens B head:** `b606308f` — FAIL (P2=1, P3=3)
- **Lens:** B (adversarial dual-lens, R72) — AUDIT ONLY, no commits/merge. Isolated from Lens A.
- **Date:** 2026-07-14

## Verdict summary

**FAIL** — P0=0 P1=0 P2=0 **P3=1**. **Nothing merge-blocking** (`blocking_ids: []`). All four prior
findings are **fully resolved and verified**; the new refresh-coalescing change is sound and tested.
The single residual P3 is a **prose-accuracy nit** about a pre-existing, out-of-diff source-platform
fetch — merge is not blocked.

Fixer commit `28d2287` = surgical: bound scout fetches, coalesce refresh, drop unused permissions,
add `pair.js` `.catch`, + 3 new test files. No auth-boundary regressions.

---

## Prior findings — verification (all RESOLVED)

### [P2-1] Unbounded scout ingest/complete fetches — RESOLVED ✓
- `background.js:97` — `/api/scout/ingest` now `fetchWithTimeout(fetch, …)`.
- `background.js:128` — `/api/scout/ingest/complete` now `fetchWithTimeout`, wrapped in try/catch
  that tags a timeout as `complete_timeout` and rethrows other errors → `handleStartIngest` surfaces
  `ingest_failed` instead of hanging. Runs are idempotent (backend de-dupes), so re-run is harmless.
- Regression-guarded by `test/ingest-timeout-bound.spec.js` (asserts both endpoints route through
  `fetchWithTimeout` and **no** bare `fetch(\`${TGP_API_ORIGIN}/api/scout/…\`)` remains). Verified.

### [P3-1] Unused `cookies` / `scripting` permissions — RESOLVED ✓
Both removed from `manifest.json.permissions`. Independently confirmed zero `chrome.cookies.*` /
`chrome.scripting.*` usage in prod JS (static `content_scripts` do not require the `scripting`
permission; capture uses `chrome.debugger`, not `cookies`). Nothing breaks. Guarded by test.

### [P3-2] `*://*.truecoach.co/*` cleartext-http broadening — RESOLVED ✓
Both `host_permissions` and `content_scripts.matches` changed `*://*.truecoach.co/*` →
`https://*.truecoach.co/*`. Cleartext-http injection surface eliminated. Guarded by test.

### [P3-3] `popup/pair.js` missing `.catch` (sole sign-in could wedge) — RESOLVED ✓
`popup/pair.js:61` now chains `.catch(() => { showError("Something went wrong pairing this
device. Try again."); disableSubmit(false); })` — a `chrome.runtime.sendMessage` reject can no longer
leave the submit button permanently disabled or produce an unhandled rejection. Guarded by test.

---

## New change reviewed — refresh coalescing (single-flight): SOUND

`shared/session.js` adds a module-level `refreshInFlight` guard splitting `refreshAccessToken` into a
coalescing wrapper + `refreshAccessTokenOnce`. Adversarially verified:
- **Atomic coalesce.** The `if (refreshInFlight !== null) return refreshInFlight;` → assign runs with
  **no `await` between check and set**, so concurrent same-tick callers share one promise / one
  network call (`test/refresh-coalesce.spec.js` proves `calls === 1` for 3 parallel refreshes).
- **CAS epoch commit preserved.** `refreshAccessTokenOnce` still snapshots `{token, epoch}` under the
  lock, does the network outside the lock, and commits only if `snapshot.epoch === stateEpoch` — a
  logout mid-refresh still discards the mint. All coalesced callers get `null` (fail-closed).
- **No stale reference.** `.finally(() => { refreshInFlight = null; })` clears after settle; coalesced
  callers hold their own promise reference, unaffected by the module-var reset. Post-settle callers
  start a fresh refresh.
- **Purpose is real.** Prevents presenting the same refresh token twice in parallel on cold-wake
  (backend reuse-detection would otherwise force a re-pair). Genuine hardening, not churn.
- **Rejection behavior unchanged** vs `b606308` (the underlying body never rejects in normal
  operation; any `readRefreshToken` throw propagates identically to before). No regression.

---

## FINDING (residual, non-blocking)

### [P3-NEW] "Every fetch is bounded" headline is still literally imprecise

The PR body's bolded claim **"Every fetch is bounded."** is not universally true:
`extractors/truecoach/net.js:58` (`await fetch(\`${TRUECOACH_API_BASE}${path}\`, …)`) is an
**unbounded** raw `fetch` to the TrueCoach **source** API with no `AbortController` / deadline. It is
**pre-existing at base** (`fdea3b4`) and **untouched by this PR** (empty diff), and it runs inside the
extractor on the MV3 service worker, so a hung source-platform request can still pin the worker.

Severity is **P3, not blocking**, and lower than the prior P2 because: (a) every *auth/TGP* fetch
(pair-redeem, refresh, scout ingest, scout complete) is now genuinely bounded — the exact gaps flagged
last round are fixed; (b) the residual is a source-platform capture fetch outside the auth boundary
and outside the PR's diff; (c) the commit message accurately scopes the work as "bound scout fetches."
The defect is purely that the **PR-body prose over-generalizes**. Fix: narrow the headline to "Every
auth + scout fetch is bounded," or wrap the TrueCoach extractor fetch in `fetchWithTimeout` too.

---

## Notes / non-findings (checked, cleared)

- **Test quality.** `ingest-timeout-bound.spec.js` and `pair-ui-catch.spec.js` are source-text
  (regex) assertions rather than behavioral tests — brittle, but the underlying behavior is covered
  by real tests (`net.spec.js` for the timeout mechanism; `refresh-coalesce.spec.js` behavioral).
  Density is **not** gamed: excluding both weak specs, ratio still clears the 2.0 floor. Not scored.
- **Gates (reproduced).** `check:banned` clean; `check:loc` prod_added **560** / cap 600; `check:flags`
  `PAIRING_ENABLED === true`; `check:ratio` **2.112** (test_added 1183 / floor 2.0). Honest, diff-scoped.
- **Tests.** `npx vitest run` → **211/211 pass, 19 files** (was 207/16; +4 tests / +3 files match diff).
- **R3 identity.** `28d2287` authored **and** committed as `Bradley Gleave
  <bradley@bradleytgpcoaching.com>`; no AI/agent/co-author tokens in the message.
- **Auth boundary intact.** Trusted-sender gate, fail-closed `establishSession`, memory-only access
  token + `storage.session`-only refresh, no-secret-to-disk snapshot — all still hold at this head.

resolved_ids: P2-1, P3-1, P3-2, P3-3
blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=1

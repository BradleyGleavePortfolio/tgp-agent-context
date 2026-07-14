# tgp-importer-extension PR #3 — Lens A (Adversarial) RE-AUDIT — Fixer Round 2 — FINAL

- **PR #3** `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `28d2287fd6c4b0106f2a9846c1548ab2bc1b96bf` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`. AUDIT ONLY — no commits/merge. Isolated from Lens B.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR, not only prior findings.
- **Date:** 2026-07-14

## VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=2 — nothing merge-blocking (blocking_ids: [])

Every prior finding is fully resolved and verified. The new refresh single-flight change is sound
and tested. The auth boundary (CAS refresh/logout, trusted-sender gate, fail-closed establish,
memory-only access token + `storage.session`-only refresh) remains intact — the fixer commit is
surgical with no regressions. Two residual **non-blocking P3s** remain, both truthfulness/prose
drift: shipped docs contradict the tightened permission set, and the "every fetch is bounded"
headline is still literally false for one pre-existing source-read fetch.

---

## Prior findings — RESOLVED (re-verified at this head)

- **[P2] unbounded scout ingest/complete fetches** — FIXED. `background.js:97` (`makeSender.attempt`)
  and `:126` (`completeIngest`) now route through `fetchWithTimeout(fetch, …)`. `completeIngest`
  wraps the call, tags a timeout as `complete_timeout`, and rethrows so the caller surfaces
  `ingest_failed` instead of hanging the MV3 worker. Locked by `test/ingest-timeout-bound.spec.js`
  (asserts both endpoints go through `fetchWithTimeout` **and** no bare `fetch(\`${TGP_API_ORIGIN}/api/scout/`
  remains). Independently confirmed: zero bare TGP-scout `fetch(` at HEAD. ✓
- **[P3] unused `cookies` / `scripting` permissions** — FIXED. Both removed from `manifest.json`.
  Independently confirmed zero `chrome.cookies.*` / `chrome.scripting.*` usage in prod JS. Static
  `content_scripts` need no `scripting` permission; capture uses `debugger`; source-cookie sending
  rides `credentials:"include"` + `host_permissions`, not the `chrome.cookies` API — so removal is
  safe and does not break capture. ✓
- **[P3] cleartext `*://*.truecoach.co/*` broadening** — FIXED. Both `host_permissions` and
  `content_scripts.matches` changed to `https://*.truecoach.co/*` (https-only). ✓
- **[P3] `popup/pair.js` missing `.catch`** — FIXED. `redeemPairingCode(code).then(…).catch(…)` now
  re-enables the submit button and shows retry copy, so a `chrome.runtime.sendMessage` reject can no
  longer wedge the sole sign-in surface. Locked by `test/pair-ui-catch.spec.js`. ✓
- **[P3] concurrent refresh not coalesced** — FIXED (see below). ✓

## New change — refresh single-flight coalescing: SOUND

`shared/session.js` adds a module-level `refreshInFlight` guard: the first `refreshAccessToken()`
starts `refreshAccessTokenOnce()`, concurrent callers receive the same in-flight promise, and
`.finally` clears it. This prevents the same refresh token being POSTed twice in parallel on a cold
service-worker wake (which would trip backend reuse-detection and force a re-pair).

Adversarially verified:
- **Atomic check-and-set** — no `await` between the `refreshInFlight !== null` read (line 123) and
  the assignment (line 126), so two synchronous callers cannot both start a refresh.
- **CAS epoch preserved under coalescing** — the snapshot `{token, epoch}` belongs to the first
  caller; the commit publishes only if `snapshot.epoch === stateEpoch`. A logout (or newer
  establish) landing mid-flight bumps the epoch, so ALL coalesced callers receive `null` and fail
  closed — a cleared session can never be resurrected, a newer session is never clobbered.
- **No permanent wedge** — every await inside `refreshAccessTokenOnce` is bounded (`fetchWithTimeout`
  15 s deadline; storage ops settle), so `refreshInFlight` always clears; a rejected transition
  still runs `.finally`.
- Proven by `test/refresh-coalesce.spec.js`: 3 parallel `refreshAccessToken()` → `calls === 1`, all
  receive the same minted token.

---

## RESIDUAL FINDINGS (both non-blocking)

### [P3-A] Shipped docs contradict the tightened permission set (in-scope doc drift)

The fixer removed `cookies` and changed the host wildcard to `https://*.truecoach.co/*`, and its
commit message claims a "least-privilege manifest" + "https-only truecoach hosts". But
`docs/DESIGN.md` — **a file this PR modifies** (numstat 55/23) — still documents the OLD state and
was NOT reconciled (the fixer's DESIGN.md diff contains no permission-text changes):

- `docs/DESIGN.md:341-342` — *"Reading the source platform's session cookie … **requires** the
  `cookies` permission — **already present** in [the manifest]."* At HEAD the `cookies` permission is
  **gone**. The claim is now false, and its rationale was always imprecise (cookie-sending rides
  `credentials:"include"` + `host_permissions`, not the `chrome.cookies` API).
- `docs/DESIGN.md:253` and `:381` — both still document the Tier-1 host wildcard as
  `*://*.truecoach.co/*` (cleartext http), contradicting the `https://*.truecoach.co/*` the manifest
  now ships.
- The **PR body** likewise still lists `*://*.truecoach.co/*` under "Permissions rationale (least
  privilege)" and its "Every fetch is bounded" bullet still names only "pair-redeem and refresh"
  (never mentions the now-bounded scout fetches).

**Impact:** the shipped design doc misdescribes a security-relevant permission surface. The code is
*stricter/safer* than the docs, so there is no runtime exposure — but a maintainer reading DESIGN
§"Cookies API" would believe `cookies` is load-bearing and could re-add it (re-broadening), and the
`*://` cleartext wildcard in the doc directly contradicts the hardening this PR advertises.
**Fix:** update DESIGN.md §§(cookies, Tier-1 wildcard) and the PR body to `https://*.truecoach.co/*`,
drop the `cookies`-required claim, and note scout fetches are now bounded.

### [P3-B] "Every fetch is bounded" headline is still literally false (pre-existing, out-of-diff)

The PR's "Every fetch is bounded" bullet is not true: `extractors/truecoach/net.js:58` (`rawFetch`)
is a raw `fetch` to the TrueCoach **source** API with no time deadline. It is **pre-existing at
base, untouched by this PR**, and is abort-cancellable via the run `signal` (so `onAuthLost` /
worker-death cancels it) — but it has no `fetchWithTimeout`-style deadline. Every *auth + TGP*
fetch (pair-redeem, refresh, scout ingest, scout complete) IS now bounded, so this is prose
over-generalization rather than the prior scout-fetch P2. **Fix:** narrow the headline to "every
auth + scout fetch," or wrap the extractor read in `fetchWithTimeout` in a follow-up.

---

## Adversarial sweep — cleared (no new P0–P2)

- **Log allow-list complete.** All 6 emitted `logNetworkEvent` codes (`pair_timeout`,
  `pair_network_error`, `pair_body_parse_error`, `refresh_timeout`, `refresh_network_error`,
  `refresh_body_parse_error`, `refresh_rotation_persist_failed`) are in `KNOWN_EVENTS`; unknowns fall
  back to `unknown_network_event` — no throw, no caller-text smuggling.
- **`fetchWithTimeout` integration** spreads `{...init, signal}`; no caller passes a competing signal,
  so nothing is clobbered. The scout ingest POST never carried the run abort-signal before or after —
  no regression.
- **Trusted-sender gate / fail-closed establish / token-storage discipline** unchanged and intact.
- **CI not weakened.** `.github/workflows/ci.yml` change is only `fetch-depth: 0` (full history so
  diff-scoped gates resolve the merge-base); all four gates + `npm test` still run as separate steps.
- **Gates + density honest.** Independently reproduced: prod_added **560** (cap 600), test_added
  **1183**, ratio **2.112** (floor 2.0); `PAIRING_ENABLED === true` pinned; banned-token net clean.
  **211/211 vitest pass, 19 files.** R3: `28d2287` authored + committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>, no AI/co-author tokens.
- Two new specs (`ingest-timeout-bound`, `pair-ui-catch`) are source-text regex assertions (brittle),
  but behavior is covered by real tests and the ratio clears the floor without them — density not gamed.

resolved_ids: P2-unbounded-scout-fetch, P3-unused-cookies-scripting, P3-cleartext-truecoach-wildcard, P3-pairjs-missing-catch, P3-refresh-not-coalesced
blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=2

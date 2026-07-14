# tgp-importer-extension PR #3 — Lens A (Adversarial) Live Audit

- **PR:** #3 `feat: pairing-code auth as the sole session path (v0.3.0-rc.1)`
- **Head audited:** `b606308ff656a9ff9f335ee59b27a8e0a6271edf` (confirmed via `git rev-parse HEAD`)
- **Base:** `main`, merge-base `fdea3b4`
- **Lens:** A (adversarial dual-lens, R72) — AUDIT ONLY, no commits, isolated from Lens B
- **Date:** 2026-07-14
- **CI:** green (independently re-verified below)

## Verdict summary

**CLEAN** — P0=0 P1=0 P2=0 **P3=3**

The in-scope security posture is sound. The sole-session-path invariant holds, the
refresh/logout race is closed with an epoch compare-and-swap, fetches are bounded and
fail closed, logs are PII-free by allow-list, there are no silent catches, `PAIRING_ENABLED`
ships `true` in lockstep with its merged backend contract (R109 / NO-DARK-MERGES), R3
commit identity is correct, and the CI gates are honest. No blocking defect. Three
non-blocking **P3** advisories are recorded below (not soft-passed): concurrent-refresh
coalescing, a missing `.catch` on the sole sign-in surface, and a cleartext-`http`
host-permission wildcard. Plus one pre-existing, out-of-scope note.

---

## What was verified GOOD (genuinely holds — no soft-pass)

- **Sole no-session→session path.** `redeemPairingCode` (`shared/pairing.js`) is the ONLY
  producer of a `session_established` message, and `establishSession`
  (`shared/session.js:91`) is the ONLY writer of `accessTokenInMemory` /
  `REFRESH_TOKEN_KEY`. `popup/login.js` is deleted; `login.html`→`pair.html`. Pairing is
  the single sign-in surface — grep-confirmed no inline login / OAuth / signup remains.
- **Token storage discipline.** Access token in memory only (`session.js:31`); refresh
  token only in `chrome.storage.session` (`:26,97,166`) — survives SW restart, cleared on
  browser restart (intentional re-pair). Nothing written to `.local` / `.sync`. No token
  value is logged, broadcast, or returned to any caller.
- **Refresh vs logout race is closed (epoch CAS).** `refreshAccessToken` (`session.js:118`)
  snapshots `{token, epoch}` under the mutex, runs the network call OUTSIDE the lock (so a
  hung refresh can't block a logout), then re-enters the lock and commits ONLY if
  `snapshot.epoch === stateEpoch` (`:161`). A `clearTokens` (`:77`) landing mid-refresh
  bumps the epoch, so a stale refresh can never resurrect a cleared session. Rotation
  persist failure fails closed WITHOUT publishing the new access token (`:164-171`) — no
  torn pair, no asymmetric wipe. `establishSession` is persist-first, same fail-closed
  contract (`:95-105`).
- **Establish trust boundary.** `session_established` (secret-bearing) is gated by
  `isTrustedExtensionPage(sender)` (`background.js:280`): extension id match **plus**
  `sender.tab === undefined` **plus** a `chrome-extension://<id>/` URL. A compromised
  content script (which has a `tab`) is rejected before any token is read (`:313-314`).
  `onMessageExternal` is never registered; cross-extension senders have no entry.
- **Bounded, fail-closed fetches.** `fetchWithTimeout` (`shared/net.js`) races an
  `AbortController` with a 15s timer that is always cleared in `.finally`; timeouts are
  tagged and mapped to `null`/structured errors at every call site (redeem + refresh).
- **PII-free logging.** `shared/log.js` maps every event through a strict `KNOWN_EVENTS`
  allow-list; anything unrecognized collapses to `"unknown_network_event"`. No body, no
  token, no URL, no coach-identifying text is ever logged.
- **No silent catches.** Every `catch` in the new code either logs a PII-free event and
  returns a structured error, or returns a fail-closed sentinel. `withStateLock`'s
  `.then(()=>undefined,()=>undefined)` (`session.js:45`) only keeps the *lock chain* alive;
  the actual `run` promise still surfaces its resolution/rejection to the caller — not a
  swallowed application error.
- **Flag discipline (R109).** `PAIRING_ENABLED = true` (`shared/protocol.js`); the redeem
  backend contract is merged, so the sole auth path is live, not dark. The `!PAIRING_ENABLED`
  branches in `pair.js:44` / `pairing.js:53` remain as an honest lockstep-rollback guard.
- **Gates are honest (re-verified live).** With `RATIO_BASE=$(git merge-base main HEAD)`:
  prod LOC added = **523** (cap 600 ✓); test:src ratio = **2.084** (floor 2.0 ✓);
  `PAIRING_ENABLED===true` ✓; banned-token/silent-catch scan net clean ✓. `classify()`
  correctly buckets `scripts/`→ignore, `test/`→test, else prod — no gate laundering.
- **Tests.** `npx vitest run` → **207 tests / 16 files pass**, matching the PR claim.
- **R3 identity.** Head commit author = `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✓.
- **Site-agnostic product framing holds.** Pairing/session code talks only to
  `api.tgp.coach` (coach binding); capture is host-agnostic with `optional_host_permissions:
  ["*://*/*"]` for runtime expansion. The static truecoach matches are consistent with the
  shipped RC's declared scope ("Transfer your TrueCoach clients").

---

## FINDINGS (all P3 — non-blocking advisories)

### [P3-1] No coalescing of concurrent `refreshAccessToken` on cold SW wake

On a cold service-worker wake, two operations that both call `getAccessToken`
(`session.js:182`) find `accessTokenInMemory` undefined and each invoke
`refreshAccessToken`. Both snapshot the *same* refresh token under the lock (neither has
committed, so the epoch is unchanged) and both POST it to `/auth/extension/refresh`. The
epoch CAS makes the *commit* safe — the first to return bumps the epoch, the second sees
`snapshot.epoch !== stateEpoch` and discards. But the refresh token has now been presented
to the backend **twice**. If the backend enforces rotating-refresh-token reuse detection
(e.g. GoTrue outside its reuse-interval), the second presentation can invalidate the whole
token family → the persisted rotated token is then dead → the next refresh fails → forced
re-pair.

**Severity: P3.** Strictly fail-closed (worst case is an extra re-pair, never a session
leak or torn pair), and conditional on backend reuse-detection semantics that may tolerate
a short reuse window. Not blocking.

**Suggested fix:** coalesce in-flight refreshes — cache the in-progress
`refreshAccessToken()` promise and have concurrent callers await the same one, clearing it
on settle.

### [P3-2] `popup/pair.js` fires the sole sign-in without a `.catch`

`pair.js:54`: `void redeemPairingCode(code).then((result) => { ... })`. `disableSubmit(false)`
is only reached inside the resolve branch. `redeemPairingCode` awaits
`sendMessage({kind:"session_established", ...})` unguarded (`pairing.js:102`); if that
promise rejects (transient SW-wake failure / port closed with no response), the returned
promise rejects, producing an **unhandled rejection** and leaving the submit button
**permanently disabled** with no error copy — a dead sole sign-in surface until the popup
is reopened.

**Severity: P3.** Low likelihood on the happy path: the popup is a trusted extension page,
so `isTrustedExtensionPage` passes and `background.js:321` always calls `sendResponse` (both
branches) → the promise resolves. The reject path needs a transient messaging failure. Not
blocking, but the sole auth UI should degrade gracefully.

**Suggested fix:** add `.catch(() => { showError("Something went wrong. Please try again."); disableSubmit(false); })`.

### [P3-3] `manifest.json` adds a cleartext-`http` host-permission + content-script wildcard

This PR added `*://*.truecoach.co/*` to **both** `host_permissions` and `content_scripts.matches`
(diff confirmed against `main`). The `*://` scheme wildcard includes `http://`, so the
content script (`content/main.js`) can be injected over cleartext HTTP on any truecoach.co
subdomain — a least-privilege deviation from the existing `https://app.truecoach.co/*` entry.
Blast radius is limited (secret-bearing paths are separately guarded and tokens only travel
to `https://api.tgp.coach`), but an active MITM on `http://*.truecoach.co` could get the
capture script injected.

**Severity: P3.** Not blocking. **Suggested fix:** pin the scheme to `https://*.truecoach.co/*`
in both arrays.

---

## Notes / non-findings (checked, cleared)

- **`completeIngest` body mismatch (PRE-EXISTING, OUT OF SCOPE).** `background.js`'s
  `completeIngest` sends `body: JSON.stringify({ intent_id, platform })` and does not check
  `res.ok`. Against the backend `ScoutCompleteDto` (which requires `terminal_status` and,
  under `forbidNonWhitelisted`, rejects the extra `platform`) this likely always 400s and
  fails silently. **However** this code is unchanged by PR #3 — it predates the diff — so it
  is out of scope here. Flagging for a separate follow-up, not counted against this PR.
- `debugger` permission and `optional_host_permissions: ["*://*/*"]` are pre-existing (not
  added by this PR) — noted, not a finding.
- `withStateLock` chain-continuation does not swallow application errors (see GOOD section).
- No `any` / banned type-assertions in the new modules (R75) — gate re-run clean.

---

## Root-cause posture

The concurrency and fail-closed design is deliberate and correct at the commit boundary;
the only real gap (P3-1) is the *pre-network* coalescing step, which the epoch CAS does not
and cannot cover. The two other P3s are robustness/least-privilege polish, not defects in
the session-security core.

VERDICT: CLEAN

# tgp-importer-extension PR #3 — Lens B (Adversarial) Live Audit

- **PR:** #3 `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `b606308ff656a9ff9f335ee59b27a8e0a6271edf`
- **Base / merge-base:** `main` @ `fdea3b4d43ba681093d7f98f6f3f16c04ba701bf`
- **Lens:** B (adversarial dual-lens, R72) — AUDIT ONLY, no commits/merge. Isolated from Lens A.
- **Date:** 2026-07-14

## Verdict summary

**FAIL** — P0=0 P1=0 **P2=1** **P3=3**. **No finding is merge-blocking** (`blocking_ids: []`).

The auth-boundary hardening this RC exists to deliver is **genuinely sound and verified true**:
refresh/logout compare-and-swap race, trusted-sender gate on secrets, fail-closed session
establishment, memory-only access token + `storage.session`-only refresh token, no silent
error swallows, allow-listed PII-free logging, and honest diff-scoped CI gates all hold under
adversarial inspection. The FAIL is advisory-only: one PR headline claim ("Every fetch is
bounded") is **demonstrably false** for the capture/ingest path, plus three P3 least-privilege /
robustness gaps. None block merge; all should be corrected or the prose narrowed.

---

## What was verified GOOD (no soft-pass; these genuinely hold)

- **Refresh/logout CAS race is real and correct.** `refreshAccessToken` (`shared/session.js`)
  snapshots `{token, epoch}` under `withStateLock`, performs the network call **outside** the
  lock, and commits the minted token only if `snapshot.epoch === stateEpoch`. A logout landing
  during an in-flight refresh bumps the epoch, so the refresh's commit is discarded — a dead
  session cannot be resurrected. Verified against the concurrency spec.
- **Session-establishment secret-trust gate.** `background.js:280 isTrustedExtensionPage` requires
  `sender.id === chrome.runtime.id` **AND** `sender.tab === undefined` **AND**
  `sender.url.startsWith('chrome-extension://<id>/')`. A compromised content script (same ext id,
  but carries a `tab` + web-page URL) is rejected — ID-only trust is correctly deemed insufficient
  for a `session_established` payload. `onMessageExternal` is never registered, so cross-extension
  senders have no entry point. Sound (§13.4).
- **Fail-closed session establishment.** `establishSession` (`shared/session.js:91`) resolves
  `{ok:false,'invalid_token_payload'}` on any non-string/empty token **without mutating** state;
  persists the refresh token to `chrome.storage.session` **before** setting the in-memory access
  token, and returns `session_persist_failed` without touching memory if the persist throws — no
  torn access/refresh pair. `pair.js` reports success only on the worker's `{ok:true}` ack.
- **Token storage discipline.** Refresh token lives **only** in `chrome.storage.session`; access
  token is **memory-only**; `storage.local` holds only the non-secret snapshot
  (`{kind,intent,progress,lastError}`) — `intent` is `{intentId,platform,status}`, `lastError` is
  a coach-facing string. No token material reaches disk, even with `debugger` held. Confirmed by
  tracing every `storage.local.set`.
- **Auth-critical fetches are bounded.** `redeemPairingCode` (`shared/pairing.js:62`) and the
  refresh path both go through `fetchWithTimeout` (`shared/net.js`, `AbortController` + 15 s
  deadline, `.finally` clears the timer, timeouts tagged `TimeoutError`). Redeem maps timeout /
  network / parse / backend-`code` failures to distinct coach copy, never echoes server text, and
  fails closed on the `session_established` ack.
- **No silent swallows.** `check:banned` source-pattern net is honest; the one remaining
  `.catch(() => undefined)` (content `platform_tab_live` broadcast, and background best-effort
  popup broadcasts) is a legitimately non-actionable UI outcome, not a swallowed failure.
- **Flag discipline (R109 / NO-DARK-MERGES).** `PAIRING_ENABLED === true` pinned by `check:flags`;
  the sole no-session→session path is live and its backend contract is merged. No dark-merged
  dead-end.
- **CI gates are diff-scoped and honest.** Independently reproduced against merge-base: prod_added
  **523** (cap 600), test_added **1090**, ratio **2.084** (floor 2.0) — matches PR body exactly.
  Gates compute file sets from the diff (no hardcoded allow-list), so a new source file cannot be
  silently omitted. R3 commit-identity net correctly `--no-merges`-excludes the synthetic PR merge.
- **Tests.** `npx vitest run` → **207/207 pass, 16 files**, including refresh-vs-logout concurrency
  and timeout coverage. Density is real, not padded.

---

## FINDINGS

### [P2-1] "Every fetch is bounded" is false — ingest/complete fetches are unbounded raw `fetch`

The PR body's headline invariant reads **"Every fetch is bounded."** It is not. Two production
`fetch` calls have no `AbortController`, no deadline, no `fetchWithTimeout`:

| Site | Endpoint | Bounded? |
|---|---|---|
| `background.js:96` (`makeSender.attempt`) | `POST /api/scout/ingest` | **NO** — raw `fetch` |
| `background.js:126` (`completeIngest`) | `POST /api/scout/ingest/complete` | **NO** — raw `fetch` |

Both are **pre-existing at base** (`fdea3b4:139` / `:169`), and the bullet's *following* sentence
correctly scopes the new `fetchWithTimeout` to "pair-redeem and refresh." So the auth-critical
surface is genuinely bounded — but the **bolded headline claim is literally untrue** for the
capture/ingest path, and the gap is real: a hung ingest POST has no client deadline. In MV3 an
in-flight `fetch` keeps the service worker alive (up to the platform ~5-min cap) with no
`TimeoutError`, and the coach sees no "took too long" copy — contradicting the PR's own test-plan
intent ("pull network mid-redeem → … no hang"). The run is idempotent per the header comment, so
this is reliability, not security. **Non-blocking, but the claim must be corrected**: either wrap
the two ingest fetches in `fetchWithTimeout`, or narrow the prose to "every *auth* fetch."

### [P3-1] Unused `cookies` / `scripting` permissions contradict the least-privilege rationale

`manifest.json` retains `"cookies"` and `"scripting"` permissions, but neither `chrome.cookies.*`
nor `chrome.scripting.*` appears anywhere in production JS (grep: zero hits). Both **pre-exist at
base**, and the PR's "Permissions rationale (least privilege)" section justifies `host_permissions`
and `debugger` but is **silent** on these two. A least-privilege claim that leaves two unused
high-value permissions in the manifest is incomplete. Static `content_scripts` injection does not
require the `scripting` permission (that is for `chrome.scripting.executeScript`), so it is
genuinely dead. Drop both, or add an explicit rationale. Non-blocking (not regressed by this PR).

### [P3-2] `*://*.truecoach.co/*` broadens host + content-script match to cleartext http

This PR adds `*://*.truecoach.co/*` to both `host_permissions` and `content_scripts.matches`
(diff vs base). The `*://` scheme includes **http**, and `*.truecoach.co` covers all subdomains, so
`content/main.js` will now inject on cleartext-http TrueCoach subdomains. The PR body discloses the
"Tier-1 wildcard addition" but the wording "no permissions were broadened beyond the Tier-1
wildcard" undersells that the scheme now includes http. Risk is low — `content/main.js` is minimal
(sends only `platform_tab_live`, captures no token) — but a security-hardening PR should pin
`https://*.truecoach.co/*` rather than `*://`. Non-blocking.

### [P3-3] `popup/pair.js:54` has no `.catch`; a `sendMessage` reject wedges the sole sign-in form

`void redeemPairingCode(code).then((result) => { … })` has no rejection handler.
`redeemPairingCode` guards its `fetch` and `res.json()`, but **awaits `chrome.runtime.sendMessage`
unguarded** (`shared/pairing.js:102`). `chrome.runtime.sendMessage` can reject ("The message port
closed before a response was received" / "receiving end does not exist") on a service-worker
teardown race. If it rejects: (a) an unhandled promise rejection, and (b) the submit button stays
**permanently disabled** — `disableSubmit(false)` runs only inside the `.then` error branch — so the
coach is stuck on the sole sign-in surface with no error until the popup is reopened. Reachability
is narrow (the real popup is a trusted extension page, so the router's `establishSession` branch
does call `sendResponse`), and it is fail-closed (no session minted). Add a `.catch` that
re-enables the button and shows retry copy. Non-blocking.

---

## Notes / non-findings (checked, cleared)

- `start_ingest` is gated only by the outer `sender.id === chrome.runtime.id` check, not
  `isTrustedExtensionPage` — this is **correct**: the content script legitimately originates ingest
  with the page's own captured `sourceToken`; no secret is minted and no TGP session is created via
  this path.
- `establishSession` bumps `stateEpoch` after a successful persist, so a concurrent
  `refreshAccessToken` CAS observes the new epoch and discards a stale in-flight refresh. Consistent
  with the logout path. Sound.
- `clearTokens` is local-only (no server revocation) — accurately disclosed in the PR body and
  `docs/DESIGN.md`; no revocation is claimed, so not a truthfulness gap.
- R3 commit-identity gate: `--no-merges` correctly excludes the synthetic GitHub merge commit;
  branch commits authored/committed as Bradley Gleave, no AI/co-author tokens.

## Root cause of the FAIL

The determinism of the auth work is excellent, but the PR's **headline prose over-claims** ("Every
fetch is bounded"; an unqualified "least privilege") relative to what the diff actually does — the
capture path keeps unbounded fetches and two unused permissions persist. The gaps are pre-existing
and non-blocking, but an adversarial lens does not soft-pass a demonstrably false invariant.

blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=1 P3=3

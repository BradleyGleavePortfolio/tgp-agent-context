# tgp-importer-extension PR #3 — Lens A RE-AUDIT — Fixer Round 4 (895c3ae) — FINAL

- **PR #3** `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `895c3ae663e5b8aacb67d842513b334b83d25d4e` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`. AUDIT ONLY — no commits/merge. Isolated from Lens B.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR; verify prior
  signal-composition fix + doc fixes AND hunt new defects.
- **Date:** 2026-07-14

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0 (blocking_ids: [])

Fixer commit `895c3ae` **root-fixes the `fetchWithTimeout` caller-signal drop** that was the sole
open P2 from the prior head (`76d229e`), and lands **behavioral** regression tests that prove it
(not the earlier source-grep-only assertion). The two residual P3 doc/description drifts are also
resolved: `docs/first-principles.md` and `docs/DESIGN.md` read cleanly, and the PR body's permission
surface now matches the shipped `https://`-only manifest. The auth boundary is untouched by this
commit and remains intact. No new P0–P3 found.

---

## Prior findings — status at this head

- **[P2] `fetchWithTimeout` drops caller `signal` (in-flight abort dead + false comment)** — **FIXED.**
  `shared/net.js:14-46` now composes the caller signal onto its own timeout controller:
  - captures `callerSignal = init.signal`;
  - if already aborted → `controller.abort()` immediately (fail-closed fast path);
  - else `callerSignal.addEventListener("abort", onCallerAbort, { once: true })`;
  - strips `init.signal` via destructure so the controller is the **single** owner of the signal
    handed to `fetchImpl` (`{ ...rest, signal: controller.signal }`);
  - `.finally` clears the timer AND `removeEventListener` (no leak on either resolution path).
  The extractor (`extractors/truecoach/net.js:57-73`) reverts to passing `signal` straight into
  `fetchWithTimeout`'s init; the dead local-controller composition code is gone and the comment
  ("fetchWithTimeout composes caller signal + finite deadline") is now accurate.
- **[P3] `docs/first-principles.md` garbled "historical note: was once `manifest.json`."** — **FIXED.**
  Rewritten to a clean sentence; dangling fragment removed.
- **[P3] PR-body / DESIGN cleartext + cookies drift** — **FIXED.** `docs/DESIGN.md` cookies rationale
  reads cleanly ("…the `cookies` API permission is not required and is intentionally omitted (least
  privilege)."); PR body permissions now list `https://*.truecoach.co/*`, matching the manifest.

---

## Fix quality — verified sound

- **Behavioral tests (not grep).** `test/net.spec.js` adds two real tests under
  "fetchWithTimeout — caller signal composition":
  - *"caller abort is composed (not dropped by timeout controller)"* — starts the fetch, calls
    `ac.abort()`, asserts the promise rejects `AbortError` AND that the signal seen by `fetchImpl`
    is `.aborted`. This would have caught the prior signal-drop (the exact behavioral gap Lens B
    flagged at `76d229e`).
  - *"pre-aborted caller signal fails closed immediately"* — pre-aborts, asserts immediate
    `AbortError` rejection.
  These exercise the composition path directly rather than asserting source text.
- **Single-owner invariant.** Only `controller.signal` is passed to `fetchImpl`; caller signal is
  destructured out of `rest`, so there is no override collision (the root cause at `76d229e`).
- **No listener leak.** `{ once: true }` + `removeEventListener` in `.finally` on both timeout and
  normal completion.

---

## Adversarial sweep — cleared (no new P0–P3)

- **Scope.** `git show --stat 895c3ae` = `docs/DESIGN.md`, `docs/first-principles.md`,
  `extractors/truecoach/net.js`, `shared/net.js`, `test/net.spec.js` only (+79/−38). Auth core
  (`background.js`, `shared/session.js`, `shared/pairing.js`, `popup/pair.js`, `manifest.json`,
  `shared/log.js`) untouched.
- **Auth boundary intact** (re-verified, unchanged from previously-sound state): trusted-sender gate
  `isTrustedExtensionPage` (no-tab + `chrome-extension://<id>/`); refresh single-flight coalescing +
  epoch-CAS commit vs logout; fail-closed `establishSession` (`invalid_token_payload` w/o mutation);
  refresh token only in `chrome.storage.session`; access token memory-only; log allow-list enforced.
- **All prod fetch bounded.** Grep for a bare unbounded prod `fetch(` → NONE; every prod call routes
  through `fetchWithTimeout` (redeem/refresh/scout/source). Manifest still least-privilege (no
  `cookies`/`scripting`; `https://`-only TrueCoach hosts).
- **Gates honest** (reproduced): prod_added **592**/cap 600; test_added **1232**; ratio **2.081**/
  floor 2.0 (healthier than the razor-thin `76d229e` 594/2.007); `PAIRING_ENABLED === true` pinned;
  banned-token net clean (source patterns + R3 identity + AI/co-author net). **214/214 vitest pass,
  19 files.**
- **R3 identity.** `895c3ae` authored + committed as Bradley Gleave
  <bradley@bradleytgpcoaching.com>; no AI/co-author tokens. CI unchanged.
- **Below-threshold observation (NOT a finding).** The PR body's "every fetch bounded" bullet's
  explanatory sentence still enumerates "pair-redeem and refresh" while the headline is accurate and
  the manifest/code are correct — no misrepresentation of a shipped artifact, so below P3.

blocking_ids: (none)

VERDICT: CLEAN

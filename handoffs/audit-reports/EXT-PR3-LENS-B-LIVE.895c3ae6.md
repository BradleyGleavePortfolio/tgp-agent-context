# tgp-importer-extension PR #3 — Lens B (Adversarial) RE-AUDIT — Fixer Round 4 — FINAL

- **PR #3** `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `895c3ae663e5b8aacb67d842513b334b83d25d4e` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`. AUDIT ONLY — no commits/merge. Isolated from Lens A.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR.
- **Date:** 2026-07-14

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0

Fixer commit `895c3ae` is a correct root-cause fix for the prior signal-drop defect and cleans up
the residual doc/description drift. The `fetchWithTimeout` caller-signal composition is verified
sound (no unhandled-rejection, listener-leak, or double-signal path), the new tests are behavioral
(not source-grep), and the auth boundary is untouched. No P0–P3 remains across the whole PR.

---

## Prior findings — all RESOLVED (verified)

- **[P2] `fetchWithTimeout` silently dropped the caller `signal`** (TrueCoach in-flight abort was
  dead code) → **FIXED at root cause.** `shared/net.js` now composes the caller signal:
  - captures `init.signal` as `callerSignal`; if already aborted → `controller.abort()` (fail-closed);
    else `addEventListener("abort", …, {once:true})` → `controller.abort()`;
  - strips `signal` from `init` via `const { signal: _ignored, ...rest } = init` so exactly one signal
    (`controller.signal`) reaches `fetchImpl` — no override/clobber;
  - `finally` clears the timer **and** `removeEventListener`s the caller handler (no leak).
  `extractors/truecoach/net.js rawFetch` is simplified to just pass the caller `signal` through; the
  dead composition block and false comment are gone. Caller abort (`onAuthLost` / crawl-cancel) now
  genuinely cancels an in-flight source GET. ✓
- **[P3] `first-principles.md` garbled sentence** → FIXED: reworded to a clean two-sentence
  "`cookies` permission is NOT declared (least privilege). Session reuse uses in-tab
  `credentials:"include"` under host_permissions; the Cookies API is intentionally omitted." No
  dangling `` `manifest.json`. `` fragment (also removed from `DESIGN.md:342`). ✓
- **[P3] PR body advertised cleartext `*://*.truecoach.co/*`** → FIXED: the body's Permissions
  rationale now reads `https://*.truecoach.co/*`, matching the shipped manifest. ✓

---

## Adversarial verification of the new `fetchWithTimeout` (crux of this round)

Traced every settlement path — all correct:
- **Caller abort:** `controller.abort()` → the single `controller.signal` on the fetch fires →
  fetch rejects `AbortError` → race rejects `AbortError`; `isTimeout()` correctly returns false, so
  callers distinguish caller-abort from timeout. `finally` clears the timer (timeout never fires).
- **Timeout:** `setTimeout` → `controller.abort()` + `reject(TimeoutError)`; the explicit
  `reject` settles the race with `TimeoutError` (preserving the tagged-timeout contract). The fetch's
  later `AbortError` lands on an already-settled race reaction — **no unhandled rejection**.
- **Pre-aborted caller signal:** `controller.abort()` synchronously before the race; `fetchImpl`
  receives an aborted signal → immediate `AbortError` → fails closed; timer cleared in `finally`.
- **No caller signal (redeem / refresh / scout):** `callerSignal = null`; no listener; `rest === init`
  minus `signal`; fetch gets `controller.signal` (timeout-only) — identical to prior behavior, no
  regression for those callers.
- **Listener lifecycle:** `{once:true}` self-removes on fire; `finally` `removeEventListener` covers
  the non-fired paths. No leak, idempotent double-abort.
- **init property preservation:** destructure-rest keeps `method/headers/body/credentials`; only
  `signal` is replaced.
- **New tests are behavioral:** `test/net.spec.js` now asserts (a) caller abort propagates to the
  fetch signal and rejects `AbortError`, and (b) a pre-aborted signal fails closed — directly
  exercising the composition, not a source-grep. Closes the prior "source-grep only" gap.

## Adversarial sweep — no new P0–P3

- **All prod fetches bounded:** zero bare `fetch(` outside `fetchWithTimeout`/`fetchImpl` remain.
- **Auth core untouched by `895c3ae`** (touches only `shared/net.js`, `extractors/truecoach/net.js`,
  `docs/DESIGN.md`, `docs/first-principles.md`, `test/net.spec.js`). `background.js` / `session.js` /
  `pairing.js` / `manifest.json` unchanged from the previously-verified sound state: trusted-sender
  gate, refresh single-flight coalescing + epoch-CAS commit, fail-closed `establishSession`, refresh
  token only in `chrome.storage.session`, access token memory-only, PII-free allow-listed logging.
- **Manifest** still least-privilege: no `cookies`/`scripting`; `https://`-only TrueCoach hosts.
- **Gates honest** (reproduced): LOC prod_added **592** (cap 600), test_added **1232**, ratio
  **2.081** (floor 2.0); `PAIRING_ENABLED === true` pinned; banned-token net clean. **214/214 vitest
  pass, 19 files.** R3: `895c3ae` authored + committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>, no AI/co-author tokens. CI unchanged.

## Notes / non-findings (checked, cleared)

- The "Every TGP auth/ingest fetch AND source-platform fetch is bounded" bullet's supporting
  sentence still lists only "pair-redeem and refresh" as examples. The headline claim is now **true
  and complete** (all four TGP fetches + the TrueCoach source fetch are bounded), and the sentence is
  a non-exhaustive illustration, not a false statement — not a finding.
- Two older specs (`ingest-timeout-bound`, `pair-ui-catch`) remain source-text assertions; brittle
  but supplementary, and the behavior they lock is now also covered by behavioral tests. Not gamed.

resolved_ids: P2-fetchwithtimeout-signal-drop, P3-first-principles-garbled, P3-prbody-cleartext-wildcard
blocking_ids: (none)

VERDICT: CLEAN

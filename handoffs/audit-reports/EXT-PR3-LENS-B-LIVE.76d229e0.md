# tgp-importer-extension PR #3 — Lens B (Adversarial) RE-AUDIT — Fixer Round 3 — FINAL

- **PR #3** `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `76d229e08c5e5209c56597db5fdc9d6dfff0ddac` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`. AUDIT ONLY — no commits/merge. Isolated from Lens A.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR.
- **Date:** 2026-07-14

## VERDICT: FAIL with counts P0=0 P1=0 P2=1 P3=2 — nothing merge-blocking (blocking_ids: [])

The fixer commit `76d229e` bounds the source-platform fetch and correctly aligns the shipped
DESIGN docs with the least-privilege manifest. But in adding "caller abort composition" to the
TrueCoach `rawFetch`, it introduced a real defect: **`fetchWithTimeout` silently discards the
caller-supplied `signal`**, so the new abort wiring is dead code and its own comment ("caller's
signal still cancels the crawl") is false — a regression from the prior head where in-flight source
reads were cancellable. Two residual P3 doc/description drifts remain. The auth boundary (CAS
refresh/logout, coalescing, trusted-sender gate, fail-closed establish, storage-session-only
refresh) is untouched by this commit and remains intact.

---

## Prior residual findings — status at this head

- **Unbounded TrueCoach source fetch** — bounded now (15 s deadline via `fetchWithTimeout`), **but
  the fix introduced [P2-B1] below** (caller-abort no longer works). Partially resolved / regressed.
- **DESIGN cookies + cleartext drift** — FIXED. `docs/DESIGN.md:250,378` now say
  `https://*.truecoach.co/*`; `:339` rewrites the cookies rationale to "*uses in-tab
  `credentials:"include"` … the `cookies` API permission is not required and is intentionally
  omitted (least privilege).*" Accurate and matches the manifest. ✓
- **PR body overclaim** — PARTIALLY fixed; see **[P3-B2]** (permissions rationale still lists the
  cleartext wildcard).

---

## FINDINGS

### [P2-B1] `fetchWithTimeout` drops the caller `signal` → TrueCoach in-flight abort is dead code + false comment

`extractors/truecoach/net.js:62-91` now builds a local `AbortController`, forwards the caller's
`signal` into it (`signal.addEventListener("abort", () => controller.abort())`), and passes
`controller.signal` as `init.signal` to `fetchWithTimeout`. But `shared/net.js:23` executes:

```js
fetchImpl(url, { ...init, signal: controller.signal })   // fetchWithTimeout's OWN controller
```

The explicit `signal:` key **overrides** the spread `init.signal`. So the underlying `fetch`
listens only to `fetchWithTimeout`'s internal 15 s-timeout controller; the extractor's composed
controller is attached to **nothing**. Aborting it (crawl cancellation / `onAuthLost` →
`controller.abort()` in `background.js handleStartIngest`) no longer cancels an in-flight TrueCoach
GET — it runs to completion or the 15 s timeout. Only the pre-request `sleep(rateMs, signal)` stays
abortable.

- **Regression:** at the prior head the bare `fetch(url, {…, signal})` wired the caller signal
  directly, so in-flight reads cancelled immediately. That is now lost.
- **False comment:** the shipped comment "*Abort either path via the shared controller; caller's
  signal still cancels the crawl*" is untrue for in-flight requests.
- **Root cause / latent trap:** `fetchWithTimeout` silently ignores any caller-supplied `init.signal`
  for *every* caller. Today only the TrueCoach extractor passes one (redeem/refresh/scout pass none,
  so they are unaffected), but the next caller that passes a signal will hit the same silent drop.

**Impact:** fail-safe and bounded (15 s cap; the request targets the coach's own TrueCoach session,
so no leak). In the pathological *hung-request* case the new code is strictly better than the old
(15 s vs ∞); the regression is limited to a delayed cancel of a fast in-flight read. Hence **P2,
non-blocking** — but it should not ship as-is: the abort-composition code is dead and misdescribed.
**Fix:** have `fetchWithTimeout` honor an incoming `init.signal` (e.g. abort its controller when the
caller signal fires, or `AbortSignal.any([...])`), rather than overriding it; then the extractor's
composition works as its comment claims.

### [P3-B1] `docs/first-principles.md:73` — garbled/incomplete sentence after the edit

The rewrite left a dangling clause:

> *Design consequence:* `cookies` permission is NOT declared (least privilege; in-tab
> credentials:include is used) — historical note: was once
> `manifest.json`.

Reads as "*… historical note: was once `manifest.json`.*" — the sentence is broken (the old trailing
"`manifest.json`." line was not cleaned up). Shipped-doc quality defect. **Fix:** complete or drop
the "historical note" clause. Non-blocking.

### [P3-B2] PR body still advertises the cleartext `*://*.truecoach.co/*` host permission

The PR description's "Permissions rationale (least privilege)" still lists
`host_permissions: … *://*.truecoach.co/*`, while the shipped `manifest.json:24-25,33` is
`https://*.truecoach.co/*`. The review-facing description therefore misrepresents the shipped
permission surface (describes a *broader*, cleartext set than ships). The "Every TGP auth/ingest
fetch AND source-platform fetch is bounded" bullet's explanatory sentence also still names only
"pair-redeem and refresh." Code is stricter/safer than described, so no runtime exposure, but a
reviewer approves against a stale rationale. **Fix:** update the PR body to `https://` and mention
the scout + source fetches. Non-blocking.

---

## Adversarial sweep — cleared (no new P0–P2 beyond the above)

- **Auth core untouched.** `76d229e` touches only `docs/DESIGN.md`, `docs/first-principles.md`,
  `extractors/truecoach/net.js`, and one test. `background.js` / `shared/session.js` /
  `shared/pairing.js` / `manifest.json` are unchanged from the previously-verified sound state:
  trusted-sender gate (`isTrustedExtensionPage`, requires no-tab + `chrome-extension://<id>/`),
  refresh single-flight coalescing + epoch-CAS commit, fail-closed `establishSession`
  (`invalid_token_payload` without mutation), refresh token only in `chrome.storage.session`,
  access token memory-only. All intact.
- **rawFetch structure otherwise correct**: `once:true` listener + `finally { removeEventListener }`
  (no leak), already-aborted fast path handled, `!res.ok` still throws.
- **Manifest** still least-privilege: no `cookies`/`scripting`; `https://`-only TrueCoach hosts.
- **Gates honest** (reproduced): LOC prod_added **594** (cap 600 — thin but within), test_added
  **1192**, ratio **2.007** (floor 2.0 — thin but within); `PAIRING_ENABLED === true` pinned;
  banned-token net clean. **212/212 vitest pass, 19 files.** R3: `76d229e` authored + committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>, no AI/co-author tokens.
- The new spec `truecoach source fetch is bounded` is a source-text regex assertion (asserts
  `fetchWithTimeout` is referenced and the bare `fetch(` is gone). It locks the timeout wiring but
  would NOT catch the [P2-B1] signal-drop — behavioral gap, not gamed density.

blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=1 P3=2

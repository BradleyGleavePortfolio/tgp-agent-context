# tgp-importer-extension PR #3 — Lens A (Adversarial) RE-AUDIT — Fixer Round 3 — FINAL

- **PR #3** `feat(auth): handle session_established in background router [IMPORTER-C2]`
- **Head audited:** `76d229e08c5e5209c56597db5fdc9d6dfff0ddac` (confirmed checked out)
- **Base / merge-base:** `main` @ `fdea3b4d`. AUDIT ONLY — no commits/merge. Isolated from Lens B.
- **Standard:** angry adversarial FULL re-audit — hunt ANY P0–P3 across the whole PR.
- **Delta since last audit (`28d2287`):** one commit `76d229e`, 4 files
  (`extractors/truecoach/net.js`, `docs/DESIGN.md`, `docs/first-principles.md`,
  `test/ingest-timeout-bound.spec.js`).
- **Date:** 2026-07-14

## VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=2 — nothing merge-blocking (blocking_ids: [])

The prior residuals are addressed and the auth boundary remains intact. But the fixer that bounded
the TrueCoach source fetch **introduced a subtle correctness regression** — the caller's crawl-abort
signal no longer reaches the source fetch — and left two garbled sentences in the very docs it set
out to "align." Both are non-blocking P3s (bounded, no security/data impact), but flagged because
each is a genuine, newly-introduced defect that reads as correct.

---

## Prior residuals — status

- **[P3] unbounded TrueCoach source fetch** — BOUNDED (goal met), but with a new defect. `rawFetch`
  (`extractors/truecoach/net.js`) now calls `fetchWithTimeout(fetch, url, { …, signal: controller.signal })`,
  so a 15 s deadline now applies. ✓ for bounding. **See [P3-A]** for the abort-composition regression.
- **[P3] DESIGN cookies/cleartext drift** — FIXED (with a prose artifact). `docs/DESIGN.md:250` and
  `:378` now say `https://*.truecoach.co/*`; the "Cookies API" note now states the `cookies`
  permission is "not required and is intentionally omitted (least privilege)." ✓ **See [P3-B]** for
  the dangling-fragment prose defect.
- **[P3] PR body overclaim** — PARTIALLY fixed. The "Every fetch is bounded" headline is reworded to
  "Every TGP auth/ingest fetch AND source-platform fetch is bounded" (now accurate). **But the PR
  body's "Permissions rationale" still lists `*://*.truecoach.co/*`** — stale vs the shipped
  `https://*.truecoach.co/*` manifest. **Folded into [P3-B].**

---

## FINDINGS (both non-blocking)

### [P3-A] Broken caller-abort composition — the crawl-abort signal never reaches the source fetch

`rawFetch` builds a local `AbortController` (`C_ext`), wires the caller's `signal` to abort it, and
passes `signal: C_ext.signal` **inside the `init` object** to `fetchWithTimeout`. But
`fetchWithTimeout` (`shared/net.js:22`) does:

```js
return Promise.race([
    fetchImpl(url, { ...init, signal: controller.signal }),  // controller = INTERNAL timeout ctrl
    timeout,
]);
```

The explicit `signal: controller.signal` **after** the spread **overrides** `init.signal`. So the
underlying `fetch` listens only to `fetchWithTimeout`'s internal *timeout* controller — never to
`C_ext`. The result: when the crawl is aborted mid-flight (`background.js:225 controller.abort()`
via `onAuthLost`, threaded to `extractor.run({ signal })` at `:245`), the in-flight TrueCoach GET is
**not cancelled**; only the 15 s timeout can abort it. The entire `C_ext` composition (the
`onCallerAbort` listener, the `signal.aborted` early branch) is dead code, and the code comment
*"caller's signal still cancels the crawl"* is false for the network call.

**Impact (bounded, non-security):** on auth-loss mid-crawl the current source GET leaks for up to
15 s (or until it completes) instead of aborting instantly. The crawl still terminates — the next
`sleep(rateMs, signal)` (`net.js:57`) rejects on the raw caller signal, and the subsequent TGP send
fails closed (`getAccessToken` → `no_session`). No token/data exposure (idempotent GET on the
coach's own source session). Hence P3, not P2 — but it is a real, newly-introduced regression that
looks correct.

**Also:** the added regression test (`test/ingest-timeout-bound.spec.js` "truecoach source fetch is
bounded") is a **source-grep** assertion (`/fetchWithTimeout/` present, no bare `fetch(\`${TRUECOACH_API_BASE}`)
— it verifies routing but NOT that caller-abort works, so it gives false confidence and would not
catch this bug.

**Fix:** have `fetchWithTimeout` compose an incoming `init.signal` with its timeout controller
(e.g. `AbortSignal.any([init.signal, controller.signal])`), or abort the extractor's own controller
on timeout and pass only `C_ext.signal`.

### [P3-B] Doc-accuracy defects in the "align DESIGN with least privilege" commit

The commit whose stated purpose is doc accuracy leaves three prose problems:

1. **`docs/DESIGN.md:342`** — the replaced line ends at "…intentionally omitted (least privilege)."
   but the original trailing "`manifest.json`." was left dangling on the next line, producing a
   stray fragment: *"…(least privilege). / `manifest.json`."*
2. **`docs/first-principles.md:70-71`** — the edit reads *"`cookies` permission is NOT declared
   (least privilege; in-tab credentials:include is used) — historical note: was once / `manifest.json`."*
   The sentence is truncated/garbled ("was once `manifest.json`.").
3. **PR body** "Permissions rationale (least privilege)" still lists `*://*.truecoach.co/*`, stale
   vs the shipped `https://*.truecoach.co/*` manifest (the shipped docs were corrected; the PR
   description was not).

**Impact:** cosmetic-to-accuracy. The shipped manifest is correct and stricter than the stale PR
prose, so no runtime exposure — but a maintainer reading these garbled/stale lines gets a wrong
picture of the permission model. P3. **Fix:** delete the two dangling "`manifest.json`." fragments
and update the PR body to `https://*.truecoach.co/*`.

---

## Adversarial sweep — cleared (no new P0–P2)

- **Bounding goal achieved.** Every prod network call (pair-redeem, refresh, scout ingest/complete,
  and now the TrueCoach source read) routes through `fetchWithTimeout`'s 15 s deadline — no unbounded
  `fetch(` remains in prod. (The abort *composition* is broken — [P3-A] — but the *timeout* bound
  holds.)
- **Refresh single-flight, trusted-sender gate, fail-closed establish, token-storage discipline,
  log allow-list** — all unchanged from `28d2287` and re-confirmed intact.
- **Gates + density honest.** Independently reproduced: prod_added **594** (cap 600 — 6 LOC
  headroom), test_added **1192**, ratio **2.007** (floor 2.0 — thin margin; the +34/-… source-read
  change with only +9 grep-test LOC pulled it toward the floor, but it is honest, not gamed).
  `PAIRING_ENABLED === true` pinned; banned-token net clean. **212/212 vitest pass, 19 files.**
- **R3 identity:** `76d229e` authored + committed as Bradley Gleave <bradley@bradleytgpcoaching.com>,
  no AI/co-author tokens.
- **CI** unchanged — all four gates + `npm test` still run as separate steps.

resolved_ids: P3-truecoach-unbounded-fetch (bounded), P3-design-cookies-cleartext-drift (docs corrected), P3-prbody-every-fetch-overclaim (headline fixed)
blocking_ids: (none)

VERDICT: FAIL with counts P0=0 P1=0 P2=0 P3=2

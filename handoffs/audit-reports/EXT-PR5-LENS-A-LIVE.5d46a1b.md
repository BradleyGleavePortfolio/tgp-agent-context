# EXT PR #5 — LENS A (independent, read-only, adversarial FULL P0–P3 re-audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #5 — "feat(replay): bounded autonomous replay engine (PR-C1a)"
- **Exact head audited:** `5d46a1bb5c85f021a1e7c0167d51a8d1868988b0` (confirmed checked out; = tip of `refs/pull/5/head`)
- **Base:** `main` @ `a6e248aa20c724f4e1a2ca3eb81e98f9b8ab25cb` (merged PR #4), which is the **merge-base** with HEAD.
- **Topology:** PR #5 is now **two commits** on top of merged main — `5f55abc` (engine) + `5d46a1b`
  (fixer r3, this head). Not stacked on an unmerged parent; no merge bubble.
- **Lens:** A — independent / read-only. Did **not** read Lens B output, did **not** modify source,
  did **not** merge, did **not** approve.
- **Prior round (r2, `5f55abc`):** Lens A FAIL P3=1 (digit-led `:param` grammar asymmetry). This head is the fixer.
- **Date:** 2026-07-14

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0 — blocking_ids: []

The fixer commit `5d46a1b` **resolves my prior Lens A P3** at the root, with behavioral coverage, and
introduces **no regression** under independent adversarial probing. The whole-PR security posture
(SSRF confinement, id-injection encoding, auth-loss fail-closed, bounded termination, inert
site-agnostic engine) continues to hold. All CI-equivalent gates reproduce green against merged main.
No new P0–P3 surfaced. Lens A is CLEAN.

---

## Prior Lens A P3 — RESOLVED (root fix, independently re-verified)

**[PR5-A-P3 digit-led-param-not-filled] → FIXED.** The r2 defect was a cross-module `:param` grammar
disagreement: `blueprint.js` detected a param with `/:[A-Za-z0-9_]/` (digit-led accepted) while the
engine's `fillTemplate` substituted only `/:[A-Za-z_][A-Za-z0-9_]*/g` (digit-led NOT filled), so an
accepted `template:"/x/:1"` was fetched literally as `/x/:1`.

The fix establishes **one source of truth**: `blueprint.js` now exports
`PARAM_NAME_CHARS = "A-Za-z0-9_"` (`blueprint.js:45`). Both sides build their regex from it —
normalizer presence check `new RegExp(`:[${PARAM_NAME_CHARS}]`)` (`blueprint.js:215`) and engine
substitution `PARAM_TOKEN = new RegExp(`:[${PARAM_NAME_CHARS}]+`, "g")` (`engine.js:68`). A template
this file accepts is exactly a template the engine fills.

**Behavioral re-verification (independent harness):**
- Prior repro now passes: `template:"/x/:1"` fan-out over id `7` → engine fetches `https://api.test/x/7`
  (was literal `/x/:1`). ✓
- Multi-param `/x/:1/y/:_k/z/:name` filled from one id `a/b`, each `encodeURIComponent`'d →
  `https://api.test/x/a%2Fb/y/a%2Fb/z/a%2Fb`, `status:complete`. ✓
- Added edge test `test/replay-engine-edge.spec.js:272-291` locks `/x/:1/y/:name` → `/x/42/y/42` with a
  throw-on-unexpected-URL fetch stub that would catch any literal-`:param` regression. ✓

## No regression from widening the substitution grammar (adversarial)

- **Bare/trailing colon is not a param:** `/a:/b`, `/a/:`, `/health` normalize with no param and
  correctly require no `forEach` (no name char follows the colon). ✓
- **Presence detection still fires:** `/x/:1`, `/x/:_k`, `/x/:9a` without a `forEach` are each rejected
  ("template has a :param but no forEach set to fill it"). Normalizer and engine agree on the exact set. ✓
- The token class only *widened to include digit-led names* (the intended fix); it did not begin
  matching non-param colons.

---

## Whole-PR adversarial sweep — no P0–P3 (prior fixes still hold)

- **SSRF / origin confinement:** `buildUrl` concatenates the normalized allowlist-confined `apiBase`
  with a root-relative path; `:params` filled via `encodeURIComponent`, query via
  `URLSearchParams.set`. Probe: fan-out ids `../../evil`, `https://evil.com/x`, `a/b?c#d` all encode
  to on-origin segments (`..%2F..%2Fevil`, `https%3A%2F%2Fevil.com%2Fx`, `a%2Fb%3Fc%23d`) — **zero escapes**.
- **Required `allowedOrigins` fail-closed:** off-allowlist `apiBase` and `undefined` allowedOrigins each
  **throw before any fetch** (probe: 0 fetches).
- **Auth loss fails closed:** `AuthLostError` propagates out of `runReplay` (probe: stops after the
  auth-loss page); abort → `{status:"cancelled"}`.
- **Bounded / terminates:** global `maxPages`/`maxEntities` + per-step `maxPagesPerStep` + per-context
  `visited` URL set + bounded retry (`maxAttempts=3`); forEach iterates a snapshot; self-referential
  `collectAs === forEach` rejected by the normalizer.
- **Locked envelope:** emits `{ sourceId, sourcePlatform, capturedAt, payload }`; synthetic sourceId is
  URL-free (`step#ctx#page#index`); dedupe key `[step.id, ctxLabel, sourceId]` keeps parent-scoped ids distinct.
- **Honest terminal status:** `failed` (degraded & 0 emitted) / `partial` (degraded or truncated) /
  `complete` (whole untruncated walk); `emit` awaited (backpressure).
- **Inert / no leakage:** no `console.*` / `chrome.*` / `Authorization` / `Bearer` / token handling
  (only two comment mentions). Engine imported **only by tests** (unwired — acceptable chained-PR slice).

## Gates & identity — reproduced at `5d46a1b`

- `check:banned` OK (word-boundary anchored per R3_CLARIFY_1); `check:flags` `PAIRING_ENABLED=true` OK.
- `check:loc` PR-mode `prod_added=328 prod_removed=2 cap=400 OK`; push-mode `cap=600 OK`.
- `check:ratio` `prod_added=328 test_added=1221 ratio=3.723 floor=2 OK`.
- `npx vitest run` → **23 files / 428 tests passed** (+1 vs r2: the digit-led edge test).
- Both PR commits (`5f55abc`, `5d46a1b`) authored **and** committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>; no AI/co-author tokens.

## Recommendation

**CLEAN at `5d46a1b`.** My sole prior Lens A finding is root-fixed via a single shared
`PARAM_NAME_CHARS` grammar, with behavioral coverage and no regression; every earlier P2/P3 remains
fixed and no security or data-integrity defect exists. This head is ready for a fresh dual-lens
convergence check and, on CLEAN/CLEAN + CI green, merge per R14/R138. Read-only audit — no approval
given (agents are not authorized to approve PRs).

resolved_ids: PR5-A-P3-digit-led-param-not-filled
new_ids: (none)
blocking_ids: (none)

VERDICT: CLEAN

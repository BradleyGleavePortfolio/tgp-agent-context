# EXT PR #6 — LENS A (independent, read-only, adversarial FULL P0–P3 audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #6 — "feat(replay): wire start_import orchestration + Start Import CTA (PR-C1b)"
- **Exact head audited:** `ab5dc610d28d8490c3d4e13441583e10141492bb` (checked out; R124 verified both ways — `gh pr view 6 .headRefOid` == local `git rev-parse HEAD`)
- **Base:** `main` @ `5eabeec0ee53735753059f72581148052c9f2ac4` (merged PR #5), which is the **merge-base** with HEAD.
- **Topology:** single commit on top of merged main; no merge bubble, not stacked on an unmerged parent.
- **Lens:** A — independent / read-only. Did **not** read Lens B output, did **not** modify source, did **not** merge, did **not** approve.
- **Round:** dual-lens r1.
- **Date:** 2026-07-14

## VERDICT: FAIL — P0=0 P1=0 P2=1 P3=2 — blocking_ids: [A-01]

The MANDATORY wiring-layer security controls all hold under independent adversarial probing: the trusted-extension-page gate rejects a content-script-shaped sender, the single-flight guard is set synchronously before the async handler, the observed tab origin is the injected SSRF allowlist (enforced by `normalizeBlueprint` inside `runReplay` **before any fetch**), the source bearer is threaded through the crawl at the orchestration layer, and a source 401/403 fails closed via `AuthLostError` **without** clearing the TGP tokens. No P0/P1 surfaced.

One **P2** functional-completeness gap blocks a CLEAN verdict: the shipping Start Import CTA never supplies a `sourceToken`, so the button as wired cannot authenticate a real crawl against a bearer-gated source. Two **P3** robustness notes accompany it. Per the standard (ANY P0–P3 ⇒ FAIL) this round is **FAIL**, and the PR is **NOT merge-ready** regardless.

---

## MANDATORY controls — independently re-verified (all hold)

- **Trusted-page gate (not id-alone).** `isTrustedExtensionPage` (`background.js:425`) requires `sender.id === chrome.runtime.id` **AND** `sender.tab === undefined` **AND** `sender.url` starts with `chrome-extension://<id>/`. Probe: a content-script-shaped sender `{id: <own-id>, url: <web-url>, tab:{...}}` is refused `untrusted_sender` (`background.js:481`); a foreign id is dropped at the listener entry guard (`background.js:439`, returns `false`, no response). ✓ Confirmed by `test/start-import.spec.js` sender-trust suite.
- **Synchronous single-flight.** `importInFlight` is set at `background.js:491` **in the router**, before `handleStartImport` is invoked, so two messages racing before the first `await` cannot both start. Released in `.finally()` (`background.js:492`). Probe: first run hung on its refresh fetch → second ack is `import_in_progress`; after a fast-failing run settles the guard is released. ✓
- **Injected tab-origin allowlist (SSRF).** `tabOriginAllowlist` (`background.js:276`) returns `[u.origin]` for https only, else `null` (non-https → `unsafe import origin`, no network). The value is passed to `runReplay`, which calls `normalizeBlueprint(blueprint, { allowedOrigins })` (`engine.js:100`) — an off-allowlist `apiBase` throws **before any fetch**. Probe: `detectPlatform` uses hostname-suffix matching (`hostname === suffix || endsWith("."+suffix)`), so `app.truecoach.co.evil.com` does **not** resolve to truecoach; and even a forced origin mismatch fails closed at normalization. ✓ Confirmed by the origin-confinement e2e (`hosts === [api.tgp.coach, app.truecoach.co]`).
- **Source auth loss ≠ TGP logout.** `makeSourceFetch` (`background.js:293`) maps source `401/403` to `AuthLostError`; `handleStartImport`'s catch (`background.js:387`) surfaces "source sign-in required…" and does **not** call `clearTokens()` (only `makeSender`'s own TGP-401 path clears TGP tokens). Probe: source 401 **and** 403 both → `ingest_failed`, refresh token still present in `sessionMap`, zero `auth_required` broadcasts. ✓
- **Bearer at the orchestration layer.** Every source request carries `Authorization: Bearer <sourceToken>` verbatim when a token is provided (`background.js:295`); the ingest envelope crosses with `sourceId`/`sourcePlatform:"truecoach"` and `complete` is called exactly once. ✓ (e2e asserts `Bearer SRC-TOKEN` on every source request.)
- **Data-only blueprint + fail-closed resolver.** `truecoachBlueprint()` is JSON-lossless (no functions), GET-only, root-relative templates, collect-before-consume fan-out. `resolveBlueprint` hands back a **fresh** blueprint per call and throws `UnknownPlatformError` for every unregistered / non-string id. ✓

## Gates reproduced at exact head (CI-equivalent)

- `check:banned` → OK (source patterns + `origin/main` commit-identity clean).
- `check:loc` → prod_added **303** / cap **400**, prod_removed 16. OK.
- `check:flags` → `PAIRING_ENABLED=true` (sole auth path). OK.
- `check:ratio` → prod_added 303, test_added 609, ratio **2.010** ≥ floor 2.0. OK.
- `npm test` → **467 passed** (27 files), incl. 4 new specs.
- **R3:** head `ab5dc61` author AND committer both `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Conforming.

---

## Findings

### [A-01] P2 — Shipping Start Import CTA never supplies `sourceToken` (BLOCKING this round)
`requestStartImport` (`popup/popup.js:70`) sends only `{ kind: "start_import", url }`. `handleStartImport` therefore computes `sourceToken = ""` (`background.js:362`) and `makeSourceFetch("")` emits **no** `Authorization` header (`background.js:295`, guarded on `sourceToken.length > 0`). Consequently the button, as shipped, drives a crawl authenticated **only** by `credentials: "include"` cookies. TrueCoach's API is bearer-gated (`extractors/truecoach/net.js` sends `Bearer` + `Role: Trainer`), so a real CTA-initiated crawl will most likely `401` → "source sign-in required" and never ingest.

- **Scope note (fair):** the PR-C1b *mandate* is "the e2e path must carry the source bearer" at the **background/orchestration** layer — that IS satisfied and is exercised by a real e2e test injecting `sourceToken`. The gap is the **UI token producer**: nothing plumbs the in-tab captured source bearer into the CTA message.
- **Recommendation:** either (a) thread the captured source bearer (capture buffer → popup) into `requestStartImport`, or (b) explicitly document the deferral in the PR body/DESIGN and gate/flag the CTA as not-yet-functional. As written the PR presents a Start Import button that cannot complete an authenticated import, which a reviewer would reasonably read as a functional regression.

### [A-02] P3 — `completeIngest` does not check `res.ok` (pre-existing, now in the success path's blast radius)
`completeIngest` (`background.js:130`) awaits `fetchWithTimeout` but never inspects `res.ok`/status. A non-2xx `/api/scout/ingest/complete` is treated as success, so the new `start_import` path broadcasts `ingest_succeeded` (`background.js:375`) even if the backend did not settle the intent. This is **pre-existing** (also used by `handleStartIngest`) and not introduced by this PR, but the new success path depends on it. Contrast `makeSender`, which does check `res.ok` (`background.js:124`). Recommend a follow-up asserting `res.ok` in `completeIngest`.

### [A-03] P3 — Source 5xx surfaces as low-signal "import failed"
A source `500` (and other non-401/403 `!ok`) becomes an `HttpError` inside `makeSourceFetch` (`background.js:300`); the engine converts it to a `failed` result and `handleStartImport` reports the generic `"import failed"` (`background.js:379`) with the status code dropped. Behaviorally correct and fail-closed (not misreported as a sign-in prompt), but the lost status code weakens diagnosability. Non-blocking. (Related, informational: `credentials: "include"` on source fetches is deliberate session reuse and is bounded by the `allowedOrigins` confinement — not a leak.)

---

## Method / integrity
- Read-only. No source edits, no merge, no approval. Adversarial probes reasoned against the exact-head source and the reproduced test/gate runs.
- Independent of Lens B (not read).
- Recommendation to coordinator: return to fixer for **A-01** (decide: plumb the source bearer into the CTA, or explicitly document the deferral + flag the CTA), optionally address **A-02/A-03**, then re-audit at the new exact head. Do **not** merge at `ab5dc61`.

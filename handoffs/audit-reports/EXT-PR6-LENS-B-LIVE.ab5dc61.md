# EXT PR #6 — LENS B (independent, read-only, adversarial FULL P0–P3 audit)

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #6 — "feat(replay): wire start_import orchestration + Start Import CTA (PR-C1b)"
- **Exact head audited:** `ab5dc610d28d8490c3d4e13441583e10141492bb` (confirmed checked out; matches `gh api pulls/6 .head.sha`; `mergeable=true`, state OPEN).
- **Base:** `main` @ `5eabeec0ee53735753059f72581148052c9f2ac4` (merged PR #5). `git merge-base origin/main HEAD = 5eabeec`, `origin/main = 5eabeec` — not stale, not stacked.
- **Round:** 1 (first dual-lens round for PR #6).
- **Lens:** B — independent / read-only. Did **not** read Lens A output, did **not** modify source, did **not** merge, did **not** approve (agents are not authorized to approve PRs).
- **Scope (diff vs 5eabeec):** 9 files, +928/−16. Prod: `background.js` (+154), `extractors/truecoach/blueprint.js` (+56), `shared/replay/resolve.js` (+41), `popup/popup.js` (+68/−16), `popup/popup.html` (+16, non-JS). Tests: 4 spec files (+609).
- **Date:** 2026-07-14

## VERDICT: FAIL — P0=0 P1=0 P2=1 P3=3 (+1 advisory) — blocking_ids: [PR6-B-P2-cta-omits-source-bearer]

No security regression: the trusted-extension-page gate, SSRF confinement (required `allowedOrigins`, hardcoded apiBase, root-relative templates), the synchronous single-flight guard, and source-auth-loss token isolation (source `AuthLostError` never calls `clearTokens()`) are all correctly implemented and independently verified. Gates and R3 identity reproduce clean at the exact head. However, one **P2 correctness gap** blocks CLEAN: the shipping Start Import CTA emits no source bearer, so the mandatory "e2e path carries the source bearer so it truly authenticates" is satisfied only under test injection — not from the actual entrypoint. Three P3s + one advisory accompany it.

---

## Security invariants — independently verified PASS

- **Trusted-page gate (§13.4):** `isTrustedExtensionPage` (background.js:425) requires `sender.id === chrome.runtime.id` **AND** `sender.tab === undefined` **AND** an `chrome-extension://<id>/` URL. `start_import` is gated on it (background.js:481), returning `{ok:false,error:"untrusted_sender"}` for a content-script-shaped sender (same id + a `tab`). Confirmed by `test/start-import.spec.js` (foreign id dropped with no ack; content-script sender rejected). ID-only trust is correctly insufficient.
- **SSRF confinement:** `tabOriginAllowlist` (background.js:276) returns `[origin]` only for `https:` URLs, else `null` → "unsafe import origin", no fetch. `allowedOrigins` is threaded into `runReplay` → `normalizeBlueprint`, which throws **before any fetch** on missing/off-allowlist origin. Critically, `apiBase` is **hardcoded** to `TRUECOACH_API_BASE` (not derived from the tab URL), so even if `detectPlatform` were fooled by a look-alike host (`app.truecoach.co.evil.com`), the apiBase-origin-∈-allowlist check fails closed. All blueprint templates are root-relative (`/…`, not `//`), and `buildUrl` composes them onto the fixed apiBase; origin cannot be swapped. Confirmed by the origin-confinement e2e (only `api.tgp.coach` + `app.truecoach.co` contacted).
- **Single-flight:** `importInFlight` (background.js:270) is set **synchronously in the router** before the async handler and cleared in `.finally()` (background.js:491-492). A second concurrent `start_import` gets `{ok:false,error:"import_in_progress"}`. The race where two messages both pass before the first awaits is genuinely closed. Verified by the hang-the-refresh test.
- **Source-auth-loss token isolation:** `makeSourceFetch` (background.js:293) maps source 401/403 → `AuthLostError`; `handleStartImport`'s catch surfaces "source sign-in required…" and does **NOT** call `clearTokens()`. Only `makeSender`'s TGP-401 path (background.js:113/120) clears TGP tokens. Verified: after a source 401 the refresh token remains in `sessionMap` and **no** `auth_required` is broadcast.
- **Envelope:** entities cross the ingest boundary as the LOCKED camelCase `{ sourceId, sourcePlatform, capturedAt, payload }` (engine.js:233), wrapped by `makeScoutIngestBody` with the snake outer body (`intent_id`, `entity_type`). Verified by the e2e body assertions.
- **Data-only blueprint:** `truecoachBlueprint()` is JSON-round-trip lossless (no functions), GET-only, root-relative; normalizes under the injected allowlist and fails closed without one. Resolver hands back a **fresh** blueprint per call (no shared mutable steps array).

## Findings

### PR6-B-P2-cta-omits-source-bearer  (P2, BLOCKING)
The C1b brief (DECISION_V03_AUTONOMOUS_CRAWL.md:226-227) makes it MANDATORY that "the e2e path must carry the source bearer so it truly authenticates." The orchestration *can* carry it — `makeSourceFetch` adds `Authorization: Bearer <sourceToken>` when present — and the e2e **test** proves it by injecting `sourceToken` into `dispatch`. But the **only production producer** of `start_import` is `popup/popup.js:74`, which sends `{ kind: "start_import", url }` with **no `sourceToken`**. So from the real Start Import CTA, `message.sourceToken` is `""` → `makeSourceFetch` sends **no Authorization header**, and the crawl relies solely on `credentials:"include"` cookies. TrueCoach's proxy API is Bearer-protected (the hand-mapped `extractors/truecoach/net.js` sends explicit `Bearer` + `Role:Trainer`), so a real click against the sole registered platform will 401 → `AuthLostError` → "source sign-in required" and import **nothing**. The failure is honest (fails closed), which is why this is P2 not P1 — but the shipping feature is non-functional against its only supported platform, and the PR's "bearer end-to-end" claim describes a path only tests exercise. **Recommend:** either wire the in-tab source-token capture into the CTA message, or explicitly scope token-threading to a follow-up PR (C2/capture) and soften the PR claim so the delivered-vs-deferred boundary is truthful. Note: token capture is not named as a C1b deliverable in the brief, so this may be an intended C1b/C2 seam — but as-wired the headline flow cannot authenticate, and that must be recorded, not implied-working.

### PR6-B-P3-partial-reported-as-succeeded  (P3)
`handleStartImport` treats `result.status === "complete" || "partial"` identically (background.js:373): both call `completeIngest` and broadcast `ingest_succeeded`. The engine **deliberately** distinguishes `partial` (degraded = a page was skipped, or truncated = a budget/per-step cap cut the walk — i.e. real, silent data loss) from `complete` (a whole, untruncated walk) (engine.js:298-312). Collapsing `partial → ingest_succeeded` discards the honest partial signal the product model explicitly promises ("honest status complete|partial|failed|cancelled"). A coach whose crawl silently dropped clients/notes sees an unqualified "succeeded." No data is fabricated and `complete` still occurs, hence P3 — but it is a genuine status-fidelity regression against doctrine. **Recommend:** surface partial distinctly (e.g. `ingest_succeeded` + a `degraded/truncated` warning, or a `partial` terminal status the popup renders).

### PR6-B-P3-tgp-authloss-status-muddle  (P3)
On a **TGP-side** (not source) auth loss mid-crawl, `makeSender` throws a plain `Error("auth_required")` (background.js:114/121) — **not** an `AuthLostError`. That error is raised from the un-wrapped `await emit(...)` inside the engine (engine.js:240), propagates out of `runReplay` (engine.js:295, since it is neither `AuthLostError` nor `AbortError`), and lands in `handleStartImport`'s catch where `isAuthLost(err)` is `false` → `detail = "auth_required"`. Meanwhile `onAuthLost` has already `controller.abort()`-ed and broadcast the friendlier "session expired — please sign in again". The terminal snapshot therefore ends `ingest_failed` / `lastError:"auth_required"`, overwriting the friendlier copy in an order-dependent way. Functionally correct (fails closed, routes to pairing) but the surfaced status/text is muddled. **Recommend:** have `makeSender` throw an `AuthLostError` (or classify "auth_required" in the catch) so TGP auth loss produces a single, consistent terminal message.

### PR6-B-P3-single-flight-only-start_import  (P3)
The `importInFlight` guard covers only `start_import`. The legacy `start_ingest` path (`handleStartIngest`, the pre-C1b mapped-extractor route) is **not** enrolled, so a `start_ingest` and a `start_import` — or two `start_ingest` — can run concurrently, driving two crawls that POST to `/api/scout/ingest` under distinct intent IDs. Backend de-dupes per `sourceId` and the intents differ, so this is not corruption; but "a single-flight guard prevents concurrent runs" is only half-true at the router. **Recommend:** share one in-flight guard across both ingest entrypoints (or document why start_ingest is exempt).

### PR6-B-ADV-ratio-margin  (advisory, not scored)
`check:ratio` passes at **2.010** (test_added=609 vs a 606 floor for prod_added=303) — a **3-line** margin. LOC headroom (303/400) is comfortable; ratio headroom is not. Any trivial prod addition on this branch, or a test trim, drops it below the R74 floor of 2.0. Not a violation now; flagged so a fixer round does not accidentally break the gate.

## Gates & identity — reproduced at `ab5dc61`

- `check:banned` — OK (source patterns + origin/main commit identity clean).
- `check:loc` — PR-mode base=origin/main `prod_added=303 prod_removed=16 cap=400 OK`.
- `check:flags` — `PAIRING_ENABLED=true` OK (sole auth path enabled).
- `check:ratio` — base=origin/main `prod_added=303 test_added=609 ratio=2.010 floor=2 OK` (thin — see ADV).
- `npx vitest run` → **27 files / 467 tests passed**.
- Commit `ab5dc61` authored **and** committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author/GitHub/noreply trailers (word-boundary scan clean). R3-CONFORMING.

## Recommendation

**FAIL at `ab5dc61` — NOT merge-ready.** No P0/P1; all security invariants hold and R3/gates are green. The blocking issue is **PR6-B-P2-cta-omits-source-bearer**: the mandatory bearer-authenticated e2e is proven only by test injection while the shipping CTA supplies no token, so the headline import cannot authenticate against the sole registered platform. Resolve the P2 (wire the token or truthfully scope-defer + adjust the claim) and the three P3s, then re-audit at the exact fixer head. Read-only audit — no approval given.

resolved_ids: (none — first round)
new_ids: PR6-B-P2-cta-omits-source-bearer, PR6-B-P3-partial-reported-as-succeeded, PR6-B-P3-tgp-authloss-status-muddle, PR6-B-P3-single-flight-only-start_import, PR6-B-ADV-ratio-margin
blocking_ids: PR6-B-P2-cta-omits-source-bearer, PR6-B-P3-partial-reported-as-succeeded, PR6-B-P3-tgp-authloss-status-muddle, PR6-B-P3-single-flight-only-start_import

VERDICT: FAIL

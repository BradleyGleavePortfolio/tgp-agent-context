# EXT PR #6 (EXT-C1b) — Lens A LIVE Audit r2 (correctness + security)

- **Repo:** tgp-importer-extension (BradleyGleavePortfolio)
- **PR:** #6 — "feat: replay C1b wiring (autonomous source-bearer import)"
- **Head (verified live):** `55f24d57c625cbd2745ad3fc9226e6d41168d02a`
- **Base main / merge-base:** `5eabeec0ee53735753059f72581148052c9f2ac4`
- **Prior head (r1):** `ab5dc61`
- **State / mergeable:** OPEN / MERGEABLE (GitHub)
- **R124 both-ways:** local HEAD == `gh` headRefOid == `55f24d5` ✓
- **Auditor:** Lens A (independent, adversarial), read-only (R13). No fixes, no approval, no merge.
- **Verdict:** **CLEAN** — 0 × P0, 0 × P1, 0 × P2, 0 × P3. All six r1 findings root-fixed; no regression.

---

## VERDICT SUMMARY

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

R14 merge gate ("clear of ANY P0–P3 in any regard") — **met on the Lens A axis.** Merge still requires a convergent-CLEAN Lens B (see companion report) and the standard operator merge procedure.

---

## r1 FINDINGS — RE-VERIFIED AT `55f24d5`

r1 (head `ab5dc61`) surfaced one convergent P2 + five P3s. Each is independently re-checked at the exact fixer head by direct diff inspection:

1. **CTA source-bearer wiring (r1 P2) — FIXED.** `handleStartImport` now obtains the real source bearer via `collectSourceToken(message.tabId, allowedOrigins)` (`background.js:337`) and injects it through `makeSourceFetch` into the per-page `fetchJson`. Content side: `wireCollector` (`content/main.js`) answers a `collect_source_token` request. Token is **memory-only**: never written to popup DOM, `chrome.storage`, logs, telemetry, PR body, or the backend ingest payload. Grep for token/bearer near `log(`/`console.`/`broadcast`/`storage`/`sendResponse` returns only comments and the unrelated TGP `establishSession(accessToken, refreshToken)` path — **no source-token leak**.
2. **completeIngest non-2xx (r1 P3) — FIXED.** `completeIngest` (`background.js:142`) throws `complete ${res.status}` on `!res.ok` and `complete_timeout` on a bounded timeout; never claims `ingest_succeeded` without a backend ack.
3. **source-5xx diagnostic signal (r1 P3) — FIXED.** `engine.js` records `lastSkipStatus` (status number, or `malformed`/error-name category — **never a body**) on skip; `failDetail`/`partialDetail` surface it as "source responded N". PII-free.
4. **partial / degraded / truncated fidelity (r1 P3) — FIXED.** `partial` walk maps to a **distinct** `ingest_partial` state (amber), not `ingest_succeeded`; `partialDetail` reports degraded/truncated cause + record count only.
5. **TGP auth-loss unification (r1 P3) — FIXED.** TGP double-401 → `tgpAuthLost()` + `clearTokens()` → route to pairing ("session expired"). SOURCE 401/403 → `AuthLostError` with **NO** `clearTokens()` → "source sign-in required". Two distinct fail-closed paths; source auth loss never logs the coach out of TGP.
6. **single-flight cross-entrypoint (r1 P3) — FIXED.** `importInFlight` is set **synchronously in the router** (pre-await, so no race window) and **shared** across both `start_import` and legacy `start_ingest`; a second concurrent run is rejected `import_in_progress`.

---

## CLEAN DIMENSIONS (independently verified at `55f24d5`)

- **SSRF confinement.** `tabOriginAllowlist(url)` requires `https:` and returns `[origin]` only; `handleStartImport` rejects a null (non-https) allowlist with "unsafe import origin". The same allowlist is passed to `runReplay` and re-asserted in `collectSourceToken` (live-origin re-read).
- **Source-token fail-closed on navigation.** `collectSourceToken` re-reads the tab's **live** origin via `chrome.tabs.get` and requires it in `allowedOrigins`; a tab navigated off-origin after the CTA yields `""` (token-less → downstream fails closed). Non-number tabId, missing content script, or a reply without `{ok:true, token:string}` all yield `""`.
- **Sender trust.** Token-bearing / crawl-triggering messages (`start_import`, `session_established`) are gated on `isTrustedExtensionPage` (id match **+** extension-origin URL **+** no originating tab) — a compromised content script that shares the extension id is rejected (§13.4). `onMessageExternal` is never registered; the router drops any sender whose id ≠ `chrome.runtime.id`.
- **Content collector.** `wireCollector` answers `collect_source_token` only when `sender.id === runtime.id`; `sendResponse` is called synchronously; the JWT-shaped bearer is read on demand from the tab's own storage and returned once — never stored/logged. Same-origin storage → same-origin source fetch: no cross-origin token movement.
- **Blueprint resolver.** `resolve.js` returns a **fresh** blueprint per run (factory registry — no shared-mutable-state bug); unregistered platform fails closed with `UnknownPlatformError` (crawl never starts).
- **Bounded crawl.** engine budget caps (`maxPages`/`maxEntities`) → `truncated`; retries bounded via `isRetryable` + `maxAttempts`; abort is a normal terminal (`cancelled`) carrying `lastSkipStatus`.
- **Entity envelope integrity.** `makeSender` posts each entity VERBATIM (`{sourceId, sourcePlatform, capturedAt, payload}`) — no re-map/rename that would 400 the backend (R80-CLARIFY-1).
- **popup `.catch(() => undefined)`.** Doctrine-exempt (best-effort broadcast + button re-enable); the real import outcome is surfaced by worker `status_snapshot` push → `render()`, so no error is hidden.
- **R3 identity.** Both branch commits (`ab5dc61`, `55f24d5`) author == committer == Bradley Gleave — CLEAN.

---

## GATES (independently executed at `55f24d5`, clean node_modules present)

- **check:banned** → `OK: banned-token net clean` (source patterns + origin/main commit identity).
- **check:loc** → `prod_added=398 prod_removed=34 cap=600` → **OK** (≤ cap; per-PR net well within budget).
- **check:flags** → `PAIRING_ENABLED=true (sole auth path)` → **OK** (no dark-merged dead-end).
- **check:ratio** → `prod_added=398 test_added=1107 ratio=2.781 floor=2` → **OK** (R74 met with margin).
- **npm test (vitest run)** → **30 files passed, 489/489 tests passed**, exit 0 (14.32s).

### Adversarial banned sweep (all added lines, prod + test)
R75 doctrine tokens (`as any` / `as unknown as` / `as never` / `@ts-ignore` / `.catch(()=>null)` / `.catch(()=>{})` / empty `catch {}` / `Coming soon`): **NONE.** The two `.catch(() => undefined)` additions are project-doctrine-exempt (documented in `scripts/check-banned.mjs`) and gate-clean.

---

VERDICT: CLEAN

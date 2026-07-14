# MOBILE PR #285 — FULL Lens B Live Audit (angry-adversarial, independent)

- **Repo:** growth-project-mobile
- **PR:** #285 — "feat(import): wire live extension pairing (mint+poll), default-off (PR-M2)"
- **Audited head (verified live, R124):** `bd9a41af9cd172563fa5582ca0e5e7e0845d8070` (== `bd9a41a`)
- **Base:** `main` @ `1695517` (PR-M1 / #284)
- **Diff:** +1600 / -11 across 9 files (single commit)
- **Auditor stance:** independent, read-only (R11/R13). No edits to the audited repo.
- **Verdict:** **FINDINGS** — one non-zero count (banned-cast net additions = +2). All other P0–P3 checks clean.

---

## 1. Gate reality (independently re-run at bd9a41a, not trusted from PR body)

Environment was rebuilt from the lockfile (`npm ci`, 1099 pkgs, eslint pinned 8.57.1, typescript ~6.0.3) after clearing a corrupted, concurrently-written `node_modules`. All gates then run locally:

| Gate | PR-body claim | Independently observed | Result |
|---|---|---|---|
| `tsc --noEmit` (typecheck) | clean | **exit 0, no diagnostics** | PASS |
| `eslint` (`--max-warnings=99999`) | 0 errors | **0 errors, 75 warnings** (all in pre-existing unrelated files; **zero** in the 9 PR files) | PASS |
| `jest` full suite | 295 suites / 3562 tests (+42) | **295 passed / 295 total; 3562 passed / 3562 total; 5 snapshots** | PASS (exact match) |
| Net prod SLOC | 396 (≤400) | **400 added SLOC** (blank/comment-excluded), before subtracting removed lines → still ≤400 | PASS (R76) |
| Test:prod ratio | 2.23 (≥2.0) | **882 / 400 = 2.21** | PASS (R74) |
| R3 identity | clean | single commit, author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/agent tokens | PASS |

Jest printed the benign "did not exit one second after" open-handle notice — not a failure; exit code 0.

Note on SLOC: my counter excludes blank + comment-only lines and does **not** subtract removed prod lines, so 400 is a conservative *upper bound*. The PR-body's 396 is within comment-classification variance; both land at/under the R76 400 ceiling. Ratio differs trivially (2.21 vs 2.23) for the same reason; both clear R74.

---

## 2. THE FINDING — banned-cast net additions (+2), R75

R75 / Appendix A: **banned-cast net additions are P0**, counted by net delta, not weighted by impact. Net removals = 0, net additions = 2 → **count is not zero**.

**F-1 (P0 by letter, test-only impact)** — `src/api/__tests__/extensionPairApi.test.ts:94`
```js
await extensionPairApi.init('truecoach').then(spy).catch(() => {});
```
`.catch(() => {})` is a banned swallow token. Ironically this line lives in the test *"does not swallow a rejection into a resolved value"* — the swallow is intentional scaffolding, but it still trips the doctrine's net-count.
**Fix (removes token, strengthens the assertion):**
```js
await expect(extensionPairApi.init('truecoach')).rejects.toBeTruthy();
expect(spy).not.toHaveBeenCalled();
```

**F-2 (P0 by letter, test-only impact)** — `src/hooks/__tests__/useExtensionPairing.test.tsx:64`
```js
}) as unknown as typeof AppState.addEventListener);
```
`as unknown as` double-cast to force the `AppState.addEventListener` mock signature.
**Fix (removes token; `@ts-expect-error` is NOT on the banned list, unlike `@ts-ignore`):**
```js
// @ts-expect-error RN addEventListener overloads don't narrow for a test double
jest.spyOn(AppState, 'addEventListener').mockImplementation((_e: string, cb: (s: string) => void) => {
  appStateHandler = cb;
  return { remove: jest.fn() };
});
```

Both are **test-only**: no production type-safety is eroded, no runtime behavior affected. But the user's bar is explicit — "CLEAN only if all counts are zero" — and R75 counts by net delta. Hence FINDINGS, not CLEAN.

Mitigating context: mobile CI (`.github/workflows/ci.yml`) has **no** banned-token/LOC/ratio/doctrine gate — only validate:config, lint (max-warnings 99999), tsc, jest. So these two tokens will **not** red CI; the doctrine is enforced only by this audit. That is exactly why the numeric PR-body claims had to be re-derived here rather than trusted.

---

## 3. Everything else — independently checked, CLEAN

**Endpoint / schema truth (R80).** `src/api/extensionPairApi.ts`: `PAIR_INIT_PATH='/extension/pair/init'` posts `{chosen_platform}`; `PAIR_STATUS_PATH='/extension/pair/status'` posts `{code}` in the **body** (test asserts never a query). Response types `PairInitResponse`/`PairStatusResponse` consumed defensively (`res.data?.…`). Matches the contract mapping table in `docs/importer/MOBILE_IMPORT_DECISION.md`.

**Default-off, no off-path network.** `featureFlags.ts`: `extensionImport: readFlag('EXPO_PUBLIC_FF_EXTENSION_IMPORT', false)` — default OFF; kill-switch parses truthy/falsy strings and absent→false (covered by `importDataFlagOff.test.ts`). Route (CoachNavigator) and Settings row are gated `{featureFlags.extensionImport && …}`, statically pinned by the flag-off doctrine test. Hook fails closed: `useExtensionPairing(enabled = featureFlags.extensionImport)` with `if (!enabled) return` guarding `start()`, so **no network path exists when the feature is OFF**.

**Mint / poll transitions.** `start()`: single-flight (`mintInFlightRef`) + duplicate-intent guard (skip if minting/waiting) → `go('minting')` → on success sets code/expiry, arms expiry timer, schedules poll; missing code/expiry → `failed`. `doPoll()`: `paired`→terminal, `expired`→terminal, `pending`/`unknown`→back off & keep waiting.

**Backoff / AppState / expiry / unmount.** Bounded exponential backoff `2000 → ×1.5 → 15000` cap; `MAX_POLL_FAILURES=5` before `failed`. AppState listener pauses polling in background, resumes/expires on foreground, re-arms expiry timer. `armExpiryTimer` + `isExpiredLocally` respect the **server-authoritative** `expiresAt`. Unmount effect sets `mountedRef=false` and `clearTimers()`; every async continuation re-checks `mountedRef`/`statusRef` before `setState`.

**Cancel races / duplication.** `cancel()` = LOCAL abandon (no server cancel endpoint exists) → `go('cancelled')`, only emits telemetry if it was active. Mid-mint cancel handled: post-await guards `statusRef.current !== 'minting'` bail out. `mintInFlightRef` + status guards prevent duplicate mint intents; `ExtensionPairingPanel` auto-mints once via `startedRef`.

**Unknown / malformed statuses (fail-closed).** `decodePairStatus` (in `types/extensionImport.ts`, on main from #284) returns `'unknown'` for unrecognized/garbled values; the hook treats `unknown` as a non-terminal wait and **never** promotes it to `paired`. HTTP: 401/403→`authExpired`, 404→`unavailable`, other→counted network failure.

**PII / secrets (R98).** All `track()` payloads carry only `{ platform, reason? }` — never code/token. Pairing code is sent only in the request body to the pairing service (its purpose) and shown in the UI; it is never logged, stored, or put in telemetry, the PR body, or the backend payload beyond the intended `{code}`. Tests assert serialized telemetry does **not** match `/token|password|secret|bearer/i`. Diff scans: no `console.*`, no TODO/FIXME/placeholder/"Coming soon".

**Paired terminal honesty.** Both the hook doc and `ExtensionPairingPanel` render `paired` as "running in the browser extension" — **no** importing/partial/complete state, **no** page/entity counts. Consistent with the documented "no mobile-readable progress contract" decision. No invented progress anywhere.

**Accessibility / Quiet Luxury (R87).** `accessibilityRole="header"/"button"/"summary"`, `accessibilityLiveRegion="polite"` on status regions, spaced-digit `accessibilityLabel` for the code, `accessibilityState={{disabled}}` on the gated button, `accessibilityHint`s on platform rows. Typography uses `fontWeight: '600'` only (the earlier '700' regression was fixed, per the decision-doc retraction). Countdown clamps at zero.

**M1 hardening.** `safeImportLoginUrl` still gates external opens (https-only, public sites); `Linking.canOpenURL` guarded; failure → honest `failed` message. `importDataFlagOff.test.ts` still green and does not touch the Day-1 `CoachPairing` invite flow.

**CodeQL.** `codeql.yml` present; the diff introduces no new injection/eval/dynamic-require/secret-handling surface (network via existing axios client; no string-built SQL/DOM). No new CodeQL-class risk identified.

---

## 4. Counts

| Category | Count |
|---|---|
| P0 | 2 (banned-cast net additions, test-only) |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

Because counts are not all zero, **VERDICT: FINDINGS** (CLEAN was reserved for all-zero per the mandate).

---

## 5. Recommended remediation (test-only, ~2 lines)

1. `extensionPairApi.test.ts:94` → replace `.then(spy).catch(() => {})` with `await expect(...).rejects.toBeTruthy();`.
2. `useExtensionPairing.test.tsx:64` → drop `as unknown as typeof AppState.addEventListener`; use a `@ts-expect-error` annotated `mockImplementation` with a typed callback.

Re-run full `jest` after (both files are exercised by the suite). No production code change required; behavior, contract, and honesty guarantees are already sound.

_Auditor: independent Lens B. Read-only. Delivered as response per R13; this file is the durable checkpoint._

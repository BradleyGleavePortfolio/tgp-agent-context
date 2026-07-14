# MOBILE PR #285 — Lens A LIVE Audit (correctness + security)

- **Repo:** growth-project-mobile (BradleyGleavePortfolio)
- **PR:** #285 — "PR-M2: live extension pairing"
- **Head (verified live):** `bd9a41af9cd172563fa5582ca0e5e7e0845d8070`
- **Base main:** `1695517` (`169551777a95f9b1e89e4a8a5f75bf53ae23dcd8`)
- **Mergeable / state:** MERGEABLE / CLEAN (GitHub)
- **Auditor:** Lens A (independent, adversarial), read-only (R13). No fixes, no approval, no merge.
- **Verdict:** **FINDINGS** — 2 × P0 (R75 banned-cast net additions). All other P0–P3 dimensions CLEAN.

---

## VERDICT SUMMARY

| Severity | Count |
|---|---|
| P0 | 2 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |

R14 merge gate requires "clear of ANY P0–P3 in any regard." **Not met** — 2 P0 + 1 P3. Both P0s are test-scope with benign substance, but R75 is a doctrine-declared bright-line P0 ("banned in `src/`+`test/` … any positive net = red and **Lens A P0**"), with clean allowed alternatives available and unused. An adversarial auditor does not downgrade a doctrine-declared P0 on "benign substance" grounds.

---

## FINDINGS

### P0-1 — R75 banned-cast net addition: `.catch(() => {})`
- **File:** `src/api/__tests__/extensionPairApi.test.ts:94`
- **Line:** `await extensionPairApi.init('truecoach').then(spy).catch(() => {});`
- **Rule:** R75 (R100.A2) — `.catch(()=>{})` is on the explicit banned list; banned in `src/`+`test/`; any positive net = P0.
- **Net math:** +1 addition, 0 offsetting removals ⇒ net +1.
- **Substance:** benign — the test is titled "does not swallow a rejection into a resolved value"; the `.catch` merely absorbs the expected rejection after asserting the `.then` fulfillment spy was NOT called. Not a real error-swallow. **But the rule is mechanical and admits no substance exception.**
- **Fix (allowed form):** assert the rejection directly, e.g.
  `await expect(extensionPairApi.init('truecoach')).rejects.toBeDefined(); expect(spy).not.toHaveBeenCalled();`
  or use the two-arg `.then(spy, () => {})` rejection handler (not `.catch(()=>{})`).

### P0-2 — R75 banned-cast net addition: `as unknown as`
- **File:** `src/hooks/__tests__/useExtensionPairing.test.tsx:64`
- **Line:** `}) as unknown as typeof AppState.addEventListener);`
- **Rule:** R75 (R100.A2) — `as unknown as` is on the explicit banned list; banned in `src/`+`test/`; any positive net = P0.
- **Net math:** +1 addition, 0 offsetting removals ⇒ net +1.
- **Substance:** benign — casts a mock `addEventListener` implementation; `as unknown as` appears in 15 pre-existing test files (established convention). **But R75 counts NET NEW additions in the diff precisely to stop this convention from compounding (`as unknown as` grew +68% — the regression R75 closes). Pre-existing usage grants no pass.**
- **Fix (allowed form):** type the mock return concretely, e.g. cast the returned subscription `{ remove: jest.fn() } as NativeEventSubscription` and let `mockImplementation` infer, or annotate the callback params so no whole-signature cast is needed.

### P3-1 — PR body missing `R100 Self-Check` heading
- **File:** PR #285 description.
- **Rule:** R100 pack (line 822) — builders "document PASS/FAIL/N/A per rule in the PR description under an `R100 Self-Check` heading."
- **Observation:** the body has a "Gates (verified on this head)" section but no per-rule R100 Self-Check, and it does not disclose the +2 banned-cast additions. Hygiene gap, not a correctness/security defect.

---

## CLEAN DIMENSIONS (independently verified at `bd9a41a`)

- **Endpoint truth — CONFIRMED.** Builder claims `POST /extension/pair/init` and `POST /extension/pair/status`. Verified against the live backend OpenAPI contract (growth-backend, raw fetch): both `/api/extension/pair/init` and `/api/extension/pair/status` exist, are bearer/mobile-callable, request/response schemas match (status enum `pending|paired|expired`). The PR-body "brief-named → real" mapping table is **accurate** — no mismatch. `scout/*` are POST writers only; **no mobile-readable progress read exists**, so the honesty claims hold.
- **Transport** (`src/api/extensionPairApi.ts`): thin; `init` posts `{chosen_platform}`, `status` posts `{code}` in **body** (never query); never logs/stores/inspects code or token; errors propagate.
- **default-OFF / no network when off:** `enabled` defaults to `featureFlags.extensionImport` (unconditionally `false`); `start()` early-returns if `!enabled` — no network path when off.
- **mint→poll state machine:** statuses idle|minting|waiting|paired|expired|authExpired|unavailable|failed|cancelled; server-authoritative expiry; single-flight mint (guards on mintInFlight + status).
- **Bounded backoff:** `POLL_BASE_MS=2000 → POLL_MAX_MS=15000`, `×1.5`, cap of `MAX_POLL_FAILURES=5` consecutive before retryable `failed`.
- **AppState lifecycle:** pause on background / resume on foreground; local-expiry re-checked on resume.
- **Abort/unmount:** teardown effect clears timers and sets `mountedRef=false`; no late poll/setState.
- **Cancel-mid-mint race:** post-mint guard `if (!mountedRef.current || statusRef.current !== 'minting') return` — a cancel during the in-flight mint is honored.
- **Fail-closed:** `decodePairStatus` returns non-terminal on unknown/malformed status; never promoted to `paired`.
- **Auth loss:** 401/403 → `authExpired`; 404 → `unavailable`; generic → `failed` after 5 consecutive.
- **PII/token:** code/token never logged, stored, or emitted in telemetry; `track()` carries only `{platform, reason}`.
- **Honest paired terminal:** copy = "Your import is now running in the browser extension…"; UI never renders importing/partial/complete or any count/%/entity — no fabricated progress or completion.
- **Accessibility (R87):** `accessibilityLiveRegion="polite"`, spaced code label ("4 8 2 9 1 3"), button roles/labels; countdown clamps at 0, zero-pads seconds.
- **Quiet Luxury / R0:** `fontWeight` max `'600'` (no 700/800).
- **URL hardening regression:** `safeImportLoginUrl` / URL-hardening files **not touched** by this PR — N/A, no regression.
- **LOC (R76):** prod SLOC added = **400 gross**, net **<400** after 11 deletions in `ImportDataScreen.tsx` ⇒ ≤400 cap **met** (at the ceiling — observation, not a finding). Builder claim "396" consistent.
- **Ratio (R74):** raw `1037/517 = 2.006`; SLOC `≈882/396 = 2.23`. Both ≥ 2.0 (raw margin thin — observation).
- **R3 identity:** author + committer = Bradley Gleave — CLEAN at `bd9a41a`.
- **PR body accuracy:** endpoint mapping + gate figures corroborated; only gap is the missing R100 Self-Check (P3-1).

---

## GATES

- **tsc `--noEmit`:** see "Gate execution" below.
- **ESLint:** see below.
- **jest:** see below.
- **CodeQL:** CI-only (`codeql.yml` present) — cannot run locally; not evaluated here.

### Gate execution note
Local gate execution was obstructed by **concurrent-agent contention in the shared sparse worktree**: a parallel session (different shell snapshot) repeatedly ran `rm -rf node_modules && npm ci` in the same directory, deadlocking the npm cache lock and wiping in-progress installs. Multiple clean install attempts did not yield linked `node_modules/.bin` within the audit window. Where gates could not be independently executed, this report does **not** assert them as passing on the auditor's authority; the builder's PR body reports tsc clean / eslint 0 errors / 295 suites · 3562 tests green (+42), and no positive evidence was found contradicting those claims. The **verdict does not depend on the gates** — the two P0 findings are established by direct diff inspection at the exact head.

**Gate attempt result (appended):** The parallel install ultimately **exited without linking `node_modules/.bin`** (Monitor event `INSTALL_EXITED_NO_BINS`). A direct `node node_modules/typescript/bin/tsc --noEmit` run emitted **only environmental errors** — `Cannot find module 'react-native'`, `Cannot find name '__DEV__'`, missing `@types`/`react-native-svg` declarations — i.e. artifacts of an **incomplete `node_modules`** (react-native itself unresolved, which false-positives every RN-importing file). **No genuine type error in any PR-touched file** (`extensionPairApi.ts`, `useExtensionPairing.ts`, `ExtensionPairingPanel.tsx`, `ImportDataScreen.tsx`, `events.ts`) was observed; the errors are toolchain-dependency artifacts, not code defects. tsc/eslint/jest therefore remain **not independently validated** — an infra limitation on the gates only. The two P0 findings stand on direct diff inspection and are unaffected.

---

## APPENDIX — banned-token full-diff sweep (added lines, `src/**`)

```
src/api/__tests__/extensionPairApi.test.ts:94  +    await extensionPairApi.init('truecoach').then(spy).catch(() => {});
src/hooks/__tests__/useExtensionPairing.test.tsx:64  +  }) as unknown as typeof AppState.addEventListener);
```
Counts: `as unknown as`=1, `.catch(()=>{})`=1, `as any`=0, `as never`=0, `@ts-ignore`=0, `Coming soon`=0. Removed-line offsets: 0. **Net banned-cast additions = +2.**
Prod files (`extensionPairApi.ts`, `useExtensionPairing.ts`, `ExtensionPairingPanel.tsx`, `ImportDataScreen.tsx`, `events.ts`): **clean** of all banned tokens.

---

VERDICT: FINDINGS

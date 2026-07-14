# MOBILE PR #284 — LENS A (Correctness / Security / Product-Invariant) — LIVE ADVERSARIAL AUDIT

- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **PR:** #284 — "feat(importer): default-off coach Import Data entry (v0.3 site-agnostic slice)"
- **Audited head (verified):** `c1cf0c1c2819e3f1953b46fb4c40a2650da46215` ✅ resolves from `c1cf0c1`, matches `headRefOid`
- **Base:** `main` @ `09b6cac809438b8e9e54494c6330f06415caca53`
- **Merge-base:** `09b6cac…` (branches cleanly off main; no divergence)
- **Lens:** A — navigation/role authz, flag kill-switch, site-agnostic picker, SSRF/exfil on external URL open, safe Linking, accessibility, truthful copy/no-false-progress, typed-future dead-code, i18n, telemetry privacy, canonical gates (LOC/ratio/control-bytes/casts), CI/R3, real backend-contract fidelity.
- **Method:** full line-by-line read of all 14 changed files; independent gate recomputation; live GitHub check-runs at the exact head; empirical execution of the SSRF guard under WHATWG URL; backend OpenAPI fidelity cross-check against `growth-project-backend` `docs/contracts/importer-openapi.json`.
- **Mode:** READ-ONLY. No modify / no merge.

## YOUR JOB (R11)
Findings produced independently from evidence. The PR body's "Gates" / "Contracts verified" blocks were treated as **hypotheses to verify** — the backend-contract block **verified TRUE**; the "gates all green / no regressions" block was **REFUTED** by live CI (see P1-1 / P2-1).

---

## HEADLINE

**The audited head has RED CI, and the failure is introduced by this PR.** The required check `Typecheck, lint, test` is **failure** at `c1cf0c1`: the repo's own doctrine test `src/__tests__/quietLuxuryDoctrine.test.ts` fails with a single offender — `screens/coach/ImportDataScreen.tsx` — because the new screen uses `fontWeight: '700'` (line 196), which the Quiet-Luxury doctrine bans in shipped screens/components. Jest at the exact head: **1 suite / 1 test failed, 291 suites / 3416 tests passed**. This alone means the PR **cannot be CLEAN** under R14 (CI-green precondition) and makes the PR body's "**171** import-flow tests + 103 nav/coach tests green (no regressions)" and "lint 0 errors" claims **materially false**.

Separately, the `safeImportLoginUrl` guard — which the PR advertises as rejecting "private/loopback/link-local hosts (IPv4 ranges + IPv6 literals incl. bracket-stripped `[::1]`/`fc00::`/`fe80::`)" — has a **verified loopback/private bypass** via IPv4-mapped IPv6 literals (`https://[::ffff:127.0.0.1]`) and only partial fe80::/10 coverage.

The rest of the slice is genuinely well-built: the product invariant is respected (coach-side extension importer, not Day-1 client pairing, not A02 CSV; honest copy that never claims progress/completion), the flag kill-switch is correct and default-OFF unconditionally, telemetry is slug-only with a base-layer PII strip + try/catch, and **every backend-contract claim in the PR body is TRUE** and accurately mirrored. But it is **not mergeable** in its current state.

**VERDICT: FINDINGS** — P0=0, P1=1, P2=2, P3=4.

---

## VERIFICATION OF PR-BODY CLAIMS

| PR body claim | Reality at `c1cf0c1` | Verdict |
|---|---|---|
| "tsc --noEmit clean; **lint 0 errors**; 171 import-flow + 103 nav/coach tests green (**no regressions**)" | Live check-run `Typecheck, lint, test` = **failure**; jest = **1 suite/1 test failed**, offender `screens/coach/ImportDataScreen.tsx` in `quietLuxuryDoctrine.test.ts` | ❌ FALSE — CI red, real regression |
| "Canonical prod LOC **370** (≤400)" | Recomputed comment/blank-excluded added code lines across the 8 non-test src files = **370** | ✅ TRUE |
| "Canonical test:src ratio **2.09**" | 774 test / 370 src (same method) = **2.09** (raw added-line ratio is 915/487 = 1.88; PR uses the canonical code-line method, disclosed as "canonical") | ✅ TRUE (canonical) |
| "Banned-cast scan clean across the diff" | No `as any` / `as unknown as` / `@ts-ignore` / `@ts-nocheck` / TODO / FIXME in the diff | ✅ TRUE |
| Backend contracts: pair/init `{pairing_code,expires_at}`, pair/status `{status: pending\|paired\|expired}`, redeem/scout extension-only, terminal `success\|partial\|failed`, no mobile progress endpoint | Cross-checked against `importer-openapi.json`: `PairInitDto`/`PairInitResult`/`PairStatusDto{code}`/`PairStatusResult.status` enum/`ScoutCompleteDto.terminal_status` enum/`ErrorEnvelope{statusCode,error,message(str\|str[]),path,timestamp,code?,request_id?}` — all match exactly | ✅ TRUE |
| "no dead flag path; route + entry gated together, no orphan route" | Route `<Screen name="ImportData">` and the Settings row are both wrapped in `featureFlags.extensionImport &&`; static + runtime tests pin it; no linking/deep-link registration of `ImportData` | ✅ TRUE |

Live CI (exact head), `gh api …/commits/c1cf0c1…/check-runs`: `CodeQL` success, `Analyze (javascript-typescript)` success, `Analyze (actions)` success, **`Typecheck, lint, test` failure**. Failing step is `Test`; failing assertion `src/__tests__/quietLuxuryDoctrine.test.ts:80` `expect(offenders).toEqual([])` → received `["screens/coach/ImportDataScreen.tsx"]`.

---

## FINDINGS

### P1-1 — CI is RED at the audited head: new screen violates the enforced Quiet-Luxury doctrine (R14 / R1 / R79)
**File:** `src/screens/coach/ImportDataScreen.tsx:196` (diff line 667)
`title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary }`.
The repo enforces `docs/QUIET_LUXURY_DOCTRINE.md` via `src/__tests__/quietLuxuryDoctrine.test.ts`, whose first assertion bans `fontWeight: '700' | '800'` in `src/screens` + `src/components`. `ImportDataScreen.tsx` is in scope and is the sole offender, so the required CI job `Typecheck, lint, test` fails at `c1cf0c1` (jest: 1 suite / 1 test failed, 3416 passed). This is a **regression introduced by this PR** (the file does not exist on `main`, which is green for this test). Under R14, CI-green is a precondition for CLEAN; a red required check blocks merge.
The doctrine module explicitly instructs: *"If any of these assertions fail, do NOT add the offending file to an allowlist — fix the file."*
**Fix:** change the `title` weight to `'600'` (the file already uses `'600'` for `sectionHeader` and `primaryBtnText`), or the doctrine-approved heading weight; re-run `npm test -- --testPathPattern quietLuxuryDoctrine` to green. No allowlist entry.

### P2-1 — PR body asserts "no regressions / gates green" that are refuted by live CI (R2 / R109 — evidence integrity)
The PR body's "Gates" block states "lint 0 errors" and "171 import-flow tests + 103 nav/coach tests green (**no regressions**)." At the exact audited head the required check is **failure** and jest shows a **real regression** (P1-1) directly attributable to a file this PR adds. A green-gate claim that the exact head refutes is materially false evidence, independent of the underlying bug — an auditor cannot rely on the PR's self-attested gate status. (The LOC/ratio/contract claims, by contrast, verified true — this finding is scoped to the test/lint "green" assertion only.)
**Fix:** after P1-1 is fixed and CI re-greens, restate the gate block to reflect the actual passing run; do not assert green until the check-run is green at the pushed head.

### P2-2 — `safeImportLoginUrl` loopback/private bypass via IPv4-mapped IPv6 (advertised SSRF control fails)
**File:** `src/utils/safeImportLoginUrl.ts` — `isPrivateOrLoopbackHost`
The guard strips brackets then checks `startsWith('fc'|'fd'|'fe8')` plus a **dotted-decimal IPv4 regex**. IPv4-mapped IPv6 literals are neither: `https://[::ffff:127.0.0.1]` normalizes (WHATWG URL) to host `::ffff:7f00:1` — no `fc/fd/fe8` prefix, no dotted-quad match — so the function **returns the URL** (accepted). Empirically verified under Node 20 WHATWG URL:
```
https://[::ffff:127.0.0.1]/login  => host [::ffff:7f00:1]  => ACCEPTED
https://[::ffff:10.0.0.5]/…       => …                     => ACCEPTED (private)
https://[0:0:0:0:0:ffff:7f00:1]/… => [::ffff:7f00:1]        => ACCEPTED
```
This defeats the PR body's explicit invariant ("rejects … private/loopback/link-local hosts … IPv6 literals"). The sink is `Linking.openURL` (the coach's own browser, not a server fetch), so blast radius is bounded (local-network probing / phishing via the browser handoff, no credential leak), which is why this is P2 not P1 — but it is a verified bypass of a control the PR advertises and tests claim to cover, and the fix is trivial.
**Fix:** detect IPv4-mapped IPv6 (`::ffff:<v4>` and its hex form) and run the v4 checks on the embedded address; better, parse a real IPv6 and range-check loopback/ULA/link-local/mapped rather than string-prefixing.

### P3-1 — IPv6 link-local range fe80::/10 only partially covered
**File:** `src/utils/safeImportLoginUrl.ts` — `startsWith('fe8')`
Link-local is `fe80::/10` (fe80–febf). Only `fe8*` is caught; `fe90::`, `fea0::`, `febf::` are **accepted** (verified). Same bounded browser-handoff sink as P2-2. Fold into the same host-classification fix (range check, not prefix).

### P3-2 — False-positive rejection of legitimate public DNS hosts beginning `fc`/`fd`/`fe8`
**File:** `src/utils/safeImportLoginUrl.ts` — `startsWith('fc'|'fd'|'fe8')` applied to *all* hostnames
Because bracket-stripping only affects IPv6 literals, the IPv6 prefix heuristic also runs against DNS names. Verified: `https://fcbarcelona.com/login` and `https://fdny.gov/login` are **rejected**, so a coach whose prior/custom platform lives on such a domain can never enable "Open login page." A correctness/product defect (the Custom/Other path is the site-agnostic guarantee). Root cause shared with P2-2/P3-1: the function does not distinguish IPv6 literals (originally bracketed) from DNS hostnames.
**Fix:** only apply IPv6 classification when the original host was bracketed.

### P3-3 — Test/prod URL-normalization parity risk (shorthand-IP loopback defense is env-dependent)
**Files:** `src/utils/safeImportLoginUrl.ts`, `index.ts`, `jest.setup.js`
The guard's defense against IPv4 shorthand loopback (`https://2130706433`, `0x7f000001`, `0177.0.0.1`) relies on WHATWG normalization to dotted-decimal — which the jest/jest-expo (Node) test env provides, so the tests pass. But **no `react-native-url-polyfill` is registered** (`index.ts` polyfills only `react-native-get-random-values`); the RN/Hermes runtime `URL` may not normalize shorthand hosts identically, in which case those forms would reach the dotted-quad regex as a non-matching host and be **accepted in-app** while green in CI. I could not prove RN 0.85.3's exact `URL` behavior in-sandbox, and the pre-existing `safeExternalEventUrl` also uses `new URL`, so the project already depends on runtime `URL`. Flag for runtime verification; safest hardening is to register `react-native-url-polyfill/auto` (guaranteeing WHATWG parity with the tests) and/or classify hosts without relying on normalization.

### P3-4 — `SUPPORTED_IMPORT_PHASES` does not match the phases the screen actually renders
**Files:** `src/types/extensionImport.ts`, `src/screens/coach/ImportDataScreen.tsx`
The constant (doc'd as "the states this PR is allowed to render") lists `platformSelected`, which the screen **never constructs** (`selectPlatform` goes straight to `customUrlEntry` or `openingLogin`), and **omits `failed`**, which the screen **does** construct and render (`openLogin` error path). The constant is documentary/test-pinned only (runtime rendering is driven by direct `state.phase ===` checks, not this list), so there is no functional bug — but it slightly misrepresents the honest render surface it claims to define. Low. Align the list to `{intro, customUrlEntry, openingLogin, awaitingExtension, failed}`.
*(Related observation, not a finding: the deferred `ImportFlowState` members `pairing/paired/learning/importing/partial/complete/cancelled` are unused today. They are type-only, zero-runtime, and explicitly justified in the decision record as frozen PR-M2 vocabulary — acceptable under R21/R57, but the mismatch above is the concrete artifact of that model.)*

---

## AREAS EXAMINED AND FOUND CLEAN

- **Navigation / role authz:** `ImportData` registered only inside `SettingsStackNavigator` in `CoachNavigator.tsx` (coach-only stack; client navigator untouched); route + Settings row gated together by the flag; no deep-link/linking registration → no flag-off reachability. No role bypass.
- **Feature-flag kill switch:** `extensionImport: readFlag('EXPO_PUBLIC_FF_EXTENSION_IMPORT', false)` — default OFF unconditionally (not `isDev`); OFF removes both the route and the row and mounts no screen/network path. `importDataFlagOff.test.ts` pins default-false, env truthy/falsy parsing, single route registration, guard-before-screen ordering, and non-touch of `CoachPairing`.
- **Product invariant:** coach-side extension importer only; does not touch `CoachPairingScreen` (Day-1 client invite) or A02 CSV; honest slice, default-off.
- **Site-agnostic picker:** data-driven catalog, Custom/Other always present and last; shortcuts are launch URLs only, no per-platform mapped tooling.
- **Safe Linking:** `canOpenURL` gate before `openURL`; `try/catch` → calm recoverable `failed` state; interim `openingLogin` state.
- **Truthful copy / no false progress:** awaiting-extension copy explicitly "nothing is imported until you confirm"; tests assert no `complete/finished/%/imported successfully` anywhere.
- **Accessibility:** header role on title, button roles + labels + hints on rows, `accessibilityLiveRegion="polite"` on status, labelled url input, `accessibilityState.disabled` on the gated open button.
- **Telemetry privacy:** only `{ platform: slug }` / `{ reason: 'invalid_url'|'open_failed' }`; base `src/lib/analytics.ts` `track` wraps in try/catch (R71 resilience) and runs `stripPII`; tests assert no `http(s)://`, no 6-digit codes, no `token|password|secret`.
- **i18n:** repo has **no** i18n framework (no i18next/useTranslation anywhere); hardcoded English is the established codebase convention → not a finding.
- **Control bytes / casts:** no C0/C1 control chars, zero-width, BOM, or NBSP in any new source; incidental non-ASCII is em-dash/arrow (comments) and one U+2026 ellipsis in UI copy (renders fine). No banned casts.
- **R3 identity:** all three commits (`4b07484`, `15974ea`, `c1cf0c1`) authored **and** committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No AI/agent trailers.
- **Backend-contract fidelity:** verified true against the frozen OpenAPI (see table).

---

## CI GATE (recomputed)

- Canonical prod LOC (comment/blank-excluded added code lines, 8 non-test src files): **370** ≤ 400 ✅
- Canonical test:src ratio: **774 / 370 = 2.09** ≥ 2.0 ✅ (raw added-line ratio 1.88; PR discloses the canonical code-line method)
- Required check `Typecheck, lint, test`: **RED** (see P1-1) ❌

---

VERDICT: FINDINGS

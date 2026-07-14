# MOBILE PR #284 — LENS B (LIVE, adversarial full P0–P3 hunt)

- **PR:** `feat(importer): default-off coach Import Data entry (v0.3 site-agnostic slice)` (#284, OPEN)
- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **Head audited:** `c1cf0c1c2819e3f1953b46fb4c40a2650da46215`
- **R124 SHA verify:** `gh api …/pulls/284 .head.sha` == local `git rev-parse HEAD` == `c1cf0c1…` ✅ (both ways)
- **Lens:** B (architecture / test reality + density / observability / banned-cast / LOC). Independent; Lens A not read; no modify/merge.
- **Verdict:** **NOT CLEAN** — 1× P0, 2× P1, 1× P2, 5× P3.

---

## VERDICT SUMMARY

CI is **RED on the exact merge head** and the PR body affirmatively claims it is green. That alone blocks merge under R14/R138 and is an integrity violation. Independent of the counting-convention question, the P0 stands.

The functional slice itself is genuinely good: default-OFF kill switch is real, the honest awaiting-extension states never fake progress/completion, telemetry is PII-free, accessibility is strong, the backend contract mirror is accurate, and Day-1 `CoachPairing`/A02 CSV import are untouched. The blockers are (1) a self-inflicted CI regression + false green claim, (2) LOC/ratio cap breaches under the reproducible line count, and (3) a security guard that does not keep the promise its own docstring makes on the IPv6 vector the brief calls out.

---

## P0 — BLOCKING

### [P0] LB-01 · CI is RED on head `c1cf0c1`; PR body claims all-green (R14 / R138 / gate integrity)

**Live evidence (reproduced, not asserted):**
- `gh run view 29317815879 --json headSha,conclusion` → `headSha=c1cf0c1…`, `event=pull_request`, **`conclusion=failure`**.
- `gh pr checks 284` → **`Typecheck, lint, test  fail`** (CodeQL passes).
- Failing suite: `src/__tests__/quietLuxuryDoctrine.test.ts › does not use fontWeight 700 or 800 in shipped screens or components`. Jest summary: **`Tests: 1 failed, 3416 passed`**, **`Test Suites: 1 failed, 291 passed`**.
- Root cause is **this PR's** code: `src/screens/coach/ImportDataScreen.tsx:196`
  `title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary }`.
  The doctrine scanner (`src/__tests__/quietLuxuryDoctrine.test.ts:72–81`, regex `/fontWeight\s*:\s*['"](?:700|800)['"]/` over `src/screens` + `src/components`) rejects 700/800.
- **Regression is introduced here:** `git grep -lE "fontWeight:\s*['\"](700|800)['\"]" main -- src/screens src/components` → **0 offenders on `main`**; replicating the test at `c1cf0c1` → exactly **1 offender: `ImportDataScreen.tsx`**.

**False claim:** PR body "Gates" section states *"`tsc --noEmit` clean; lint 0 errors; **171** import-flow tests + 103 nav/coach tests green (no regressions)"*. The full `npm test` (what CI runs, and the doctrine standard) is RED. This is the cherry-picked-subset-green pattern the sibling EXT-PR4 Lens B flagged as P0.

**Fix:** change the `title` weight to `'600'` (the doctrine test explicitly forbids adding the file to an allowlist — *"fix the file"*). Then re-run full `npm test`, not a subset, and correct the PR body's green claim. Re-audit on the new head.

---

## P1 — BLOCKING

> **Convention note (applies to LB-02 and LB-03).** This mobile repo has **no `check:loc`/`check:ratio` CI gate** (only `typecheck`/`lint`/`test` in `.github/workflows/ci.yml`; no gate scripts in `package.json` or `scripts/`), so the **auditor is the gate**. R74/R76 say *"lines added"*, and the only extant tooling in the ecosystem (the extension repo's `check-loc`/`check-test-ratio.mjs`, e.g. `prod_added=817`) counts **raw added lines**. Under that reproducible method (`git diff --numstat main...c1cf0c1`) both caps are breached. The PR's self-reported "canonical 370 / 2.09" is a **comment/blank-stripped recount** (I reproduce it exactly as SLOC = 370 prod, ratio 2.09) that no counting tool in this repo produces. If the operator's canonical counter is SLOC, LB-02/LB-03 downgrade to non-findings — the P0 above still holds. I record them as P1 per the reproducible reading and the rule's literal wording.

### [P1] LB-02 · Prod LOC over the 400 cap — 487 > 400, no R86 exception (R76 / R23 / R9(g))

`git diff --numstat main...c1cf0c1`, non-test `.ts/.tsx` under `src/` (docs excluded per R76):

| file | +lines |
|---|---|
| src/screens/coach/ImportDataScreen.tsx | 243 |
| src/types/extensionImport.ts | 79 |
| src/constants/importPlatforms.ts | 59 |
| src/utils/safeImportLoginUrl.ts | 59 |
| src/screens/coach/SettingsScreen.tsx | 20 |
| src/config/featureFlags.ts | 10 |
| src/navigation/CoachNavigator.tsx | 10 |
| src/analytics/events.ts | 7 |
| **prod total** | **487** |

487 > 400 by 87 lines. No `R86 EXCEPTION REQUESTED` block / `[LOC-EXEMPT:]` marker in the PR body or decision doc. R9(g) makes going past the cap "even by one line" an operator-sign-off item. (SLOC recount = 370; see convention note.)

### [P1] LB-03 · test:src ratio below floor — 1.878 < 2.0, no exception label (R74 / R100.A1)

Test `.ts/.tsx` added = 915 (importPlatforms 104 + flagOff 100 + ImportDataScreen 397 + contract 157 + safeImportLoginUrl 157). `915 / 487 = 1.878 < 2.0`. No exception justification present. (SLOC recount = 774/370 = 2.09; see convention note.) Note that ratio "compliance" under SLOC is partly propped up by tautological contract-test assertions (see LB-08).

---

## P2

### [P2] LB-04 · `safeImportLoginUrl` SSRF guard bypassed by IPv4-mapped IPv6 — reaches loopback/private/link-local (in-scope: IPv6 safety)

`src/utils/safeImportLoginUrl.ts:16–40` promises (docstring) to block *"a private, loopback, or link-local host … SSRF-style abuse of the browser handoff."* It does not, for IPv4-mapped IPv6. Empirically (Node WHATWG `URL`, the same parser RN/Hermes use):

| input | normalised `hostname` | guard result | should be |
|---|---|---|---|
| `https://[::ffff:127.0.0.1]/` | `[::ffff:7f00:1]` | **allowed** | blocked (loopback) |
| `https://[::ffff:192.168.0.1]/` | `[::ffff:c0a8:1]` | **allowed** | blocked (private) |
| `https://[::ffff:169.254.1.1]/` | `[::ffff:a9fe:…]` | **allowed** | blocked (link-local) |

After bracket-strip the host is `::ffff:7f00:1` — not `localhost`/`::`/`::1`, not `fc/fd/fe8`, and the IPv4 regex (`^\d+\.\d+\.\d+\.\d+$`) can't match a colon form, so `isPrivateOrLoopbackHost` returns `false`. The URL then flows to `Linking.openURL`. The dedicated test file (`safeImportLoginUrl.test.ts`) never exercises a mapped-IPv6 host, so the gap is masked.

**Impact caveat (honest):** the only input path is the coach's own Custom/Other field, and the sink is the *external system browser* (not an in-app fetch) — there is no remote-attacker leverage or credential/data exfiltration. This is a defense-in-depth control that silently fails on an explicitly in-scope vector, not a remotely exploitable SSRF. P2, not higher.

**Fix:** detect `::ffff:` (and `::` embedded IPv4) forms, extract the trailing dotted-quad, and run it through the IPv4 range checks; add mapped-IPv6 cases to the test matrix.

---

## P3

### [P3] LB-05 · IPv6 link-local range only partially covered (`fe80::/10`)
`safeImportLoginUrl.ts:24` uses `host.startsWith('fe8')`, which catches only `fe8x`. `fe80::/10` spans `fe80`–`febf`, so `https://[fe90::1]/`, `[fea0::1]`, `[feb0::1]` are **allowed**. Untested. Fix: match `fe[89ab]` (or parse the first hextet and check the top-10-bit range).

### [P3] LB-06 · Over-blocks legitimate public domains starting `fc`/`fd`/`fe8`
The `startsWith('fc'|'fd'|'fe8')` IPv6-prefix checks run on **every** hostname, not just bracketed IPv6 literals (brackets are already stripped, so origin is lost). Verified: `https://fcbarcelona.com/`, `https://fd-coaching.com/` → `isPrivateOrLoopbackHost` returns `true` → `safeImportLoginUrl` returns `null` → rejected. This silently breaks the PR's headline "site-agnostic, any public site" Custom/Other promise for those domains. No accept-case test guards it. Fix: apply the `fc/fd/fe8` checks only when the host is an IPv6 literal (was bracketed / contains `:`).

### [P3] LB-07 · Truthfulness / doc drift (non-CI)
- Decision doc line 53: *"CI gates (typecheck, lint, jest, **LOC, ratio**) enforce the invariants."* — false for this repo; `ci.yml` runs only typecheck/lint/test, and there is no LOC/ratio gate in `package.json`/`scripts/`.
- PR body: *"Canonical prod LOC 370 (<=400); … ratio 2.09"* — not reproducible via the standard `git diff --numstat` (which yields 487 / 1.878); it is a comment-stripped recount (see LB-02/03 convention note).
- PR body: guard "rejects … private/loopback/link-local (IPv4 ranges + IPv6 literals incl. … `fe80::`)" overstates completeness given LB-04/LB-05.

### [P3] LB-08 · `SUPPORTED_IMPORT_PHASES` self-description inaccurate + tautological contract tests
`src/types/extensionImport.ts:72–78` documents the const as *"Phases this PR is allowed to render."* But:
- It lists `platformSelected`, which the screen **never constructs** (`selectPlatform` goes `intro → openingLogin | customUrlEntry`; grep confirms no `platformSelected` producer in `src/`).
- It **omits `failed`**, which the screen **does** render (`ImportDataScreen.tsx:48,65,111–121`); the contract test even asserts `failed ∉ SUPPORTED_IMPORT_PHASES`.
No test ties the const to the screen's actual rendered set, so it is decorative. Several `extensionImport.contract.test.ts` assertions are tautologies over hand-built literals (e.g. lines 42–45, 122–126, 36–40, 71–74 check arrays/objects against their own contents), padding test LOC with thin runtime value; only their TypeScript compile-time conformance is load-bearing. Not a functional bug, but the honest-states scaffolding does not mean what it says.

### [P3] LB-09 · Enum-narrowing claim exceeds the frozen contract
The frozen backend OpenAPI (`growth-project-backend docs/contracts/importer-openapi.json`, verified read-only) types `PairStatusResult.status` and `ScoutCompleteDto.terminal_status` as plain **`string`** (no `enum`). The mobile types narrow to `'pending'|'paired'|'expired'` / `'success'|'partial'|'failed'` and the test claims these *"match the backend enum values"* — plausible from DESIGN, but **not verifiable from the frozen artifact**, so the assertion overstates what the contract guarantees.

---

## What I verified GREEN (no finding)

- **R124 SHA:** head matches both ways (`c1cf0c1…`).
- **Kill switch / flag default-off:** `featureFlags.extensionImport` = `readFlag('EXPO_PUBLIC_FF_EXTENSION_IMPORT', false)` — unconditional `false` (not `isDev`); `CoachNavigator.tsx` registers the `ImportData` `<Screen>` only inside `{featureFlags.extensionImport && …}`; `SettingsScreen.tsx` gates the row identically. Runtime + static flag-off tests present and real (env-var resolution via `isolateModules` is genuine).
- **Coach-only:** entry lives in the coach `SettingsStack`; no client navigator touched.
- **Honest states / no fake progress:** screen renders only `intro/customUrlEntry/openingLogin/awaitingExtension/failed`; `awaitingExtension` copy explicitly says *"nothing is imported until you confirm in the extension"*; a behavioral test asserts no `complete|imported successfully|finished` and no `\d{1,3}%` anywhere.
- **No fake API:** screen mounts **no network path**; extension-only endpoints (`pair/redeem`, `scout/*`) are typed but never called; no mobile progress endpoint invented.
- **Backend contract mirror:** `PairInitDto/Result`, `PairStatusDto/Result`, `ErrorEnvelope` (incl. `message: string | string[]`, optional `code`/`request_id`) match the frozen slice; the 7 paths exist as claimed. Accurate.
- **Day-1 / A02 isolation:** no diff to `CoachPairingScreen` or A02 CSV import; flag-off test asserts `SettingsScreen` does not reference `CoachPairing`.
- **Telemetry:** platform slug + coarse step only; test asserts no URL/6-digit code/token/password/secret in any payload.
- **Accessibility:** header role, button roles, `accessibilityLiveRegion="polite"`, labelled URL input, `accessibilityState.disabled` on the gated open button — all test-backed.
- **Linking failure:** `canOpenURL` checked before `openURL`; both the unsupported and throw paths recover to a calm, retryable `failed` state (tested).
- **Control chars:** scan of all added lines for NUL/ESC/zero-width/BOM/NBSP → 0.
- **R3 authorship:** all three branch commits authored + committed as Bradley Gleave (verified via `git log`).

---

## Re-audit gate
Not CLEAN until: (1) full `npm test` green on the new head (fix `fontWeight`); (2) LOC/ratio either under cap by the reproducible line count or carrying a signed R86/R74 exception; (3) mapped-IPv6 loopback/private bypass closed with tests. LB-05/06/07/08/09 should be fixed or explicitly waived.

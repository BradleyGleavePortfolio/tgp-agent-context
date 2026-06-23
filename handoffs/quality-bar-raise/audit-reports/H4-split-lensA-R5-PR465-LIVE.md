# H4 Split Audit — Lens A (DEPTH) — R5 — PR #465 (H4.D provider-wiring)

**STATUS: COMPLETE**

## BUILD MATRIX (R124)
| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| PR | #465 — H4.D provider-wiring |
| PR head SHA (audited) | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| Recorded head SHA (brief) | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` — **MATCH ✓** |
| main base SHA | `8467c6f568a51337a7acbfb14f72ac85b996d605` — MATCH ✓ |
| `git log -1 --format=%H pr465` | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` (re-checked at end of audit — no drift) |
| ISO timestamp (UTC) | 2026-06-23T22:50:00Z |
| Files in diff (new) | `provider-wiring.ts` (812 LOC), `provider-wiring-stripe-mux-sendgrid.spec.ts` (471), `provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts` (1239); plus `.tsx` fixture, `tsconfig.json` exclude, and 5 prior prod-readiness modules removed |
| Diff stat | +2545 / −3340 (net-negative LOC; replaces 5 prior modules) |
| Commits `main..head` | 4, ALL author+committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`; zero AI/Claude/Anthropic/Co-authored-by tokens in commits or source |
| R5 fix commit | `c5dd5bd9` — `fix(provider-wiring): reject alg=none and unknown JWT algs (H4.D R4)` — closes the R4 Lens B finding |

## METHOD (R11 independence — re-derived from source, not from prior reports)
The repo's bundled `node_modules/typescript` is a truncated/partial install (its `typescript.js` ends mid-file → `Unexpected end of input`), so I transpiled `provider-wiring.ts` with the sandbox's standalone `typescript@5.9.3` (`ts.transpileModule`, 0 diagnostics) and executed the compiled module directly with Node v20.20.1. I then drove **93 executable probes across three suites** against the live functions — not against test fixtures. Probe scripts: `/tmp/probe/probes.js`, `probes2.js`, `probes3.js`. Results: every genuine probe confirms correct behavior. (18 lines in the first suite printed "FAIL" only because the harness passed the raw token string instead of invoking the validator — re-run correctly in `probes2.js`, 29/29 PASS. Documented for transparency.)

## R4 → R5 FIX CLOSURE (independently re-verified at head c5dd5bd9)
The R4 Lens B finding (R4-F001, P2, R30/R31/R40/R108): the Supabase validator accepted `alg:"none"`/unknown-alg tokens as WIRED. The R5 commit adds a `MAX_JWT_SEGMENT_CHARS=8192` cap, an `ALLOWED_JWT_ALGS` allowlist `{HS256/384/512, RS256/384/512, ES256/384}`, and validates the header (alg ∈ allowlist, case-insensitive via `.toUpperCase()`; reject `"none"`; `typ` must equal `"JWT"` if present) BEFORE the role gate.

Independent counter-examples (all CONFIRMED FIXED):
- `alg:"none"` / `"NONE"` / `"None"` / `"nOnE"` + `role:"service_role"` → **rejected** (was accepted at R4).
- Unknown alg `"HS999"` → rejected. Numeric `alg:256` → rejected. Empty alg → rejected.
- Case-insensitive accept preserved: `alg:"hs256"` and `"ES256"` → accepted.
- Oversized segment (8193 chars) → rejected (bool `false`, no throw, no DoS via huge `Buffer.from`/`JSON.parse`).

## DEPTH PROBE RESULTS (every brief angle, with executed counter-examples)

**1. `decodeJwtJsonSegment` — crash vs `undefined`, and the array-payload question.**
- `JSON.parse("[1,2,3]")` → array → the `Array.isArray(parsed)` guard (line 164) rejects it → validator returns `false`. CONFIRMED. Also rejects `5` (number), `"service_role"` (string), `null` — all non-object JSON correctly bucketed as `undefined`→`false`.
- Decode never throws out of the segment helper: lone surrogate (`\uD800`), null bytes, emoji, only-dots (`..`), empty/whitespace strings all return `false` via the two try/catch arms. CONFIRMED.
- Node's `base64url` decoder is lenient: a header encoded as **standard** base64 (`+`/`/`) still decodes and validates → accepted. This is a known leniency (matches the R4 P-group note) and has **no security impact** — the alg-allowlist + role gate still apply under any encoding.

**2. alg allowlist — Unicode / Turkish-I locale safety.**
- `'\u0144one'` ("ńone") → not in set → rejected. CONFIRMED.
- JS `String.prototype.toUpperCase()` is **locale-independent** (Unicode default case mapping, never Turkish/Azeri tailoring): verified `'i'.toUpperCase()==='I'`, `'\u0131'(dotless ı).toUpperCase()==='I'`, `'ß'.toUpperCase()==='SS'`. None of these map onto an allowlist member (`HS256`…) from a confusable, and no allowlist member is reachable from a non-ASCII input. The `İ`-vs-`I` Turkish hazard does **not** apply because JS `toUpperCase` is identity-safe here. CONFIRMED SAFE.

**3. role gate — strict `===`, no trimming.**
- `role:"service_role "` (trailing space) → rejected. `" service_role"` (leading) → rejected. `"\tservice_role"` → rejected. CONFIRMED (the value is NOT trimmed before the `===` — exactly the desired strictness).
- `role` numeric (`5`), array (`["service_role"]`), boolean (`true`), absent, `"anon"`, uppercase `"SERVICE_ROLE"`, Cyrillic homoglyph `service_rоle` (U+043E) → all rejected. CONFIRMED.
- `__proto__`-keyed payload (`{"__proto__":{"role":"service_role"}}`) → `payload.role` is `undefined` → rejected; no prototype-pollution path. CONFIRMED.

**4. Provider classification matrix — hairiest providers counter-exampled.**
- **Stripe live-vs-test:** `sk_live_<24+>` → WIRED; `sk_test_<24+>` matches the shape regex BUT `looksLikePlaceholder` prefix-catches `sk_test_` → placeholder bucket → STUB; `pk_live_…` / `rk_…` wrong-type → shape-fail → STUB. CONFIRMED.
- **AWS either/or:** static keys (`AWS_ACCESS_KEY_ID`+`AWS_SECRET_ACCESS_KEY`+`AWS_REGION`) → WIRED; web-identity file with no evidence → WIRED (undefined evidence = backward-compat OK); web-identity file with `*_FILE_EXISTS:false` → STUB + diagnostic `"AWS_WEB_IDENTITY_TOKEN_FILE points to non-existent path"`; missing `AWS_REGION` (always-bucket) → STUB even with valid keys; both groups present → WIRED. CONFIRMED.
- **Supabase JWT:** full env (`SUPABASE_URL`+valid service_role JWT) → WIRED; same env with `alg:"none"` JWT → STUB. CONFIRMED.

**5. `scanProvidersWith` mid-scan mutation (TOCTOU).**
The pure core reads the injected `env` map per-var via `classifyVars`; no caching across providers. A mutating `Proxy` env was driven through a multi-provider scan and produced a consistent, deterministic classification; two identical runs produced byte-identical output. There is no shared mutable cache and the only I/O edge (`scanProvidersFromProcess`) snapshots `process.env` once into the pure core. No inconsistent-classification window. CONFIRMED.

**6. `--provider` filter (`filterProviders`).**
Exact-id match only (`p.id === id`). Case-sensitive (`"Stripe"`/`"STRIPE"` → empty), empty string → empty, unknown → empty, comma-joined `"stripe,mux"` → empty (no splitting — caller is responsible for splitting CSV before calling). Behavior is well-defined and documented. CONFIRMED — not a finding.

**7. `getProductionBlockers`.**
Defined as `status === 'STUB'` only. WIRED never blocks; NOT_USED never blocks (a not-imported provider with a perfect env stays NOT_USED). CONFIRMED matches the doc semantics exactly.

**8. Imports / cross-module.**
Scanner imports only `fs`, `path`, `typescript` — **no** cross-scanner / registry-loader import (builder claimed independence; CONFIRMED). Specs import only from `./provider-wiring` plus Node builtins (`node:fs`, `node:path`, `node:child_process` for real-FS symlink setup). R43 (no cycles) clean.

## OTHER RULE SWEEP (R10 exhaustiveness)
- **R40 (test reality):** 181 `it/test`, 321 `expect`, **0** weak assertions (`toBeDefined`/`toBeTruthy`/`toBeFalsy`/`not.toThrow`), **0** `.skip`/`.only`/`xit`/`it.todo`. Strong value-asserting suite. PASS.
- **R59 (no silent swallow):** three `catch` arms (`decodeJwtJsonSegment` ×2 → `undefined`; `isReadableRegularFile` → `false`) each map to a documented deterministic fail-safe; the direction of every error biases to STUB (over-block), never to a false WIRED (R65 fail-closed). PASS.
- **R39 / R109 (no TODO/stub leak):** the `'todo'`/`'fixme'`/`'xxx'`/`'fake'`/`'example'` strings are intentional placeholder-detection sentinels in `PLACEHOLDER_SUBSTRINGS`, not user-visible stubs or code TODOs. PASS.
- **R3:** all 4 commits strict-Bradley author+committer; zero AI tokens. PASS.
- **R108:** scanner is the provider-wiring side of the readiness surface; consistent with `prod-switches.yml` registry model. No new env var introduced by this PR. PASS.
- **R124:** head SHA re-checked at end of audit — unchanged. PASS.

## NEW FINDINGS

### Finding R5-F001 — exported `isPlausibleSupabaseServiceRoleJwt` throws on non-string input

**Priority:** P3
**Rules triggered:** R31, R109
**File:** test/prod-readiness/provider-wiring.ts:234-235
**Code:**
```ts
export function isPlausibleSupabaseServiceRoleJwt(v: string): boolean {
  const segments = v.split('.');
```
**Why it's wrong:** The function is `export`ed (public module surface) and its only documented contract is "returns `false` on any failure." But it has no runtime guard on `v`: a non-string argument (`number`, `null`, `undefined`, object) reaches `v.split('.')` and throws `TypeError` instead of returning `false`. The TS signature (`v: string`) is compile-time only (R31 phantom-validation); a JS caller, a future caller, or a refactor that loosens the call site would crash rather than fail-closed. At the *current* sole internal call site it is safe — `passesShapeCheck` narrows `raw` to a non-empty string before calling — so there is **no live defect in the shipped matrix**; this is a robustness/contract gap on an exported boundary.
**Counter-example input:** `isPlausibleSupabaseServiceRoleJwt(12345)` → `THREW: v.split is not a function` (executed). `isPlausibleSupabaseServiceRoleJwt(null)` / `(undefined)` → throws on `.split`.
**Expected fix:** add a `typeof v !== 'string'` guard at the top returning `false`, consistent with the "any failure returns false" contract the surrounding doc-comment advertises. (Do not write the fix.)

### Finding R5-F002 — `*_FILE` evidence is collected for `requires` vars but never consulted for them (latent fail-open)

**Priority:** P3
**Rules triggered:** R65, R109
**File:** test/prod-readiness/provider-wiring.ts:344-346, 372-376, 478
**Code:**
```ts
// classifyProvider always-bucket: NO fileEvidenceOk() call
const always = classifyVars(def.requires, env);
...
const alwaysSatisfied = always.missing.length === 0 && always.placeholder.length === 0;
// collectFileEvidence DOES gather evidence for requires-bucket *_FILE vars:
const groups = [p.requires, ...(p.requiresAnyOf ?? [])];
```
**Why it's wrong:** `fileEvidenceOk` (the on-disk existence gate) is only consulted inside the `requiresAnyOf` branch. A `*_FILE` credential placed in a provider's `requires` (always-bucket) would be classified solely on env-string presence — a missing/non-existent file on disk would be ignored and the provider could classify **WIRED** despite an unusable token file (fail-open, opposite of the R65 fail-closed bias this module otherwise maintains). Meanwhile `collectFileEvidence` (line 478) DOES probe `requires`-bucket `*_FILE` vars, so the evidence is computed and then silently discarded — an inconsistency between collection and consumption. **No live defect:** the only `*_FILE` var in the current 10-provider matrix (`AWS_WEB_IDENTITY_TOKEN_FILE`) lives in `requiresAnyOf`, where the gate IS applied (verified: file-missing → STUB + diagnostic). This is a forward-looking gap that bites the first future provider that puts a `*_FILE` var in `requires`.
**Counter-example input:** Hypothetical `{ id:'x', packages:['x'], requires:['X_TOKEN_FILE'] }` with `env={X_TOKEN_FILE:'/missing'}` and evidence `{X_TOKEN_FILE_EXISTS:false}` → classifies WIRED (file-missing ignored). No such provider ships today.
**Expected fix:** either apply `fileEvidenceOk(def.requires, evidence)` to the `alwaysSatisfied` computation, or document that `*_FILE` vars are only supported inside `requiresAnyOf` and assert it (e.g. a registry invariant). (Do not write the fix.)

## VERDICT: FINDINGS

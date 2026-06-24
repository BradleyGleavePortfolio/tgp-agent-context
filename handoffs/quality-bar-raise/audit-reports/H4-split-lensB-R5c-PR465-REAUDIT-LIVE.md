# H4 Split Re-Audit — Lens B (BREADTH, GPT-5.5) — R5c — PR #465 (H4.D provider-wiring)

## VERDICT: **NOT CLEAN — 1 finding (1 × P3)**

One P3 breadth finding: a **cross-path diagnostic inconsistency** that directly violates the documented
`ProviderReport.diagnostic` contract. It is **latent** (unreachable for all 10 shipped providers — no
`*_FILE` var lives in a `requires` bucket) and has **zero soundness impact** (the affected path still
fail-closes to STUB). It is reported under the strict zero-finding doctrine because (a) it is a real,
live-reproduced doc-vs-impl parity defect, (b) it is a consistency gap *between* the `requires` and
`requiresAnyOf` code paths — squarely Lens B's mandate — and (c) the spec that "covers" it (case 20) only
asserts `status`, silently tolerating the missing diagnostic.

The R5b fixer delta (deleted spec case 18, removed redundant `|| v.length === 0`, corrected `isPathShaped`
doc-comment) is internally consistent, matches the fixer brief exactly, transpiles clean, and is
live-verified. R3 / R75 / R40 / banned-cast gate / LOC gate / test-density gate / file-boundaries all PASS.

| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| PR | #465 — H4.D provider-wiring |
| Branch | `wave-h4d-provider-wiring` |
| Required head SHA | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` |
| HEAD at audit start | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` — **MATCH ✓** |
| HEAD at audit end | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` — no drift ✓ |
| Base (PR fork point) | `868000088fab1fc5929e02291bec4d4928e99aaf` (H4.A #458 on main) |
| R5b fix commit | `fec7073` — non-discriminating empty-string spec + isPathShaped comment |
| Files in PR diff | 5: `provider-wiring.ts` (+936), 2 spec files, 1 `.tsx` fixture, `tsconfig.json` |
| Lens A R5c (sibling) | **CLEAN** — depth lens did not surface the cross-path diagnostic gap (it is a breadth/consistency defect, not a soundness one) |
| Toolchain | repo `node_modules` absent in sandbox (same as all prior rounds). Verified by transpiling the 3 TS files with standalone `typescript` (vercel-bundled lib) and executing a runtime harness under Node v20.20.1; spec/impl syntax confirmed via `parseDiagnostics`. |

---

## FINDINGS

### R5c-F001-LensB — P3 — `requires`-bucket `*_FILE` missing-on-disk produces STUB with NO diagnostic (cross-path inconsistency + doc-contract violation)

- **Category:** cross-file/cross-path consistency; doc-vs-impl parity (Lens B mandate). NOT a soundness fail-open.
- **Location:**
  - `test/prod-readiness/provider-wiring.ts:470-473` — `alwaysSatisfied` ANDs `fileEvidenceOk(def.requires, evidence)` but the surrounding block emits **no** `diagnostic` when that gate is the sole reason for failure.
  - Contrast site that DOES emit it: `provider-wiring.ts:505-514` (the `requiresAnyOf` else-branch sets `diagnostic = fileEvidenceDiagnostic(...)`).
  - Contract it violates: `provider-wiring.ts:177-183` — `ProviderReport.diagnostic` JSDoc: *"explanation for a non-WIRED status that the present/missing/placeholder buckets alone don't capture — e.g. a credential file that is referenced but does not exist on disk. Absent when the buckets fully explain the status."*
- **Defect:** When a `*_FILE` var sits in a provider's `requires` array (not in a `requiresAnyOf` group), is set + non-placeholder + path-shaped, but its `<VAR>_FILE_EXISTS` evidence is `false`, `classifyProvider` returns `status: 'STUB'` with the file var in `env_vars_present`, `env_vars_missing: []`, `env_vars_placeholder: []`, and **`diagnostic: undefined`**. The buckets therefore do NOT explain the STUB, yet no diagnostic is attached — the precise situation the JSDoc says a diagnostic MUST cover (and it even names this exact example: "a credential file that is referenced but does not exist on disk"). The parallel `requiresAnyOf` path handles the identical situation correctly, so the two credential-grouping paths are inconsistent.
- **Live repro** (transpiled module, Node v20.20.1):
  ```
  synthetic = {id, packages:['x'], requires:['X_TOKEN_FILE'], requiresAnyOf:[]}
  classifyProvider(synthetic, true, {X_TOKEN_FILE:'/missing'}, {X_TOKEN_FILE_EXISTS:false})
    => {status:'STUB', present:['X_TOKEN_FILE'], missing:[], placeholder:[], diagnostic:undefined}
        ^ buckets clean, STUB unexplained, no diagnostic  ← contract violation

  // contrast — requiresAnyOf path on shipped aws-s3 provider:
  classifyProvider(aws-s3, true, {AWS_REGION, AWS_ROLE_ARN, AWS_WEB_IDENTITY_TOKEN_FILE},
                   {AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS:false})
    => diagnostic: "AWS_WEB_IDENTITY_TOKEN_FILE points to non-existent path"  ← correct
  ```
- **Why the existing test masks it:** spec case 20 (`test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts:1522-1530`, *"20. *_FILE var in requires + evidence FILE_EXISTS=false → STUB"*) asserts **only** `r.status === 'STUB'` — it does not assert `r.diagnostic`, so it passes despite the missing explanation. The describe-block comment (lines 1509-1513) itself notes the path is "latent."
- **Soundness impact:** NONE. Classification is correct (fail-closed STUB). The only loss is operator-facing diagnosability for a code path no shipped provider currently exercises.
- **Reachability:** Latent. None of the 10 seeded `PROVIDERS` put a `*_FILE` var in `requires` (the only `*_FILE` vars live in `aws-s3.requiresAnyOf`). Reachable today only via a synthetic `ProviderDef`. Becomes live the moment any future provider declares a mandatory (non-alternative) credential-file var in `requires`.
- **Recommended fix:** In `classifyProvider`, after computing `alwaysSatisfied`, when `always.missing.length === 0 && always.placeholder.length === 0 && !fileEvidenceOk(def.requires, evidence)`, set
  `diagnostic = fileEvidenceDiagnostic(def.requires, evidence)` — mirroring the existing `requiresAnyOf` branch (lines 508-514). This collapses the two paths onto one diagnostic rule and satisfies the JSDoc contract. Then strengthen spec case 20 to also assert
  `expect(r.diagnostic).toBe('X_TOKEN_FILE points to non-existent path')` so the contract is pinned and the path stops being a non-discriminating control for the diagnostic.

---

## R5b DELTA SANITY (the three fixer changes) — all internally consistent ✓

| Change | Verified | Cross-provider parity |
|---|---|---|
| Removed `\|\| v.length === 0` from `isPlausibleSupabaseServiceRoleJwt` (`provider-wiring.ts:297`) | Live: `''` → `false` via downstream `segments.length !== 3` (`''.split('.')` → `['']`, len 1). `null/undefined/12345/{}` → `false`; valid `service_role` JWT → `true`; `alg=none` → `false`; `role:'anon'` → `false`. | Type-guard pattern (`typeof v !== 'string' → false`) is unique to this validator (it is the only `unknown`-typed validator); the other `KEY_SHAPE_VALIDATORS` are `(v: string)` regex predicates fed `raw.trim()` by `passesShapeCheck`. No contradiction. |
| Deleted spec case 18 (`...twilio-aws...spec.ts`) | Cases now run 14,15,16,17,**19**,… — a numbering gap (no "18"). Cosmetic only; cases 14-17 (null/undefined/number/object) still pin the `typeof` clause. `it()` count 145+58=203 (was 204; −1 as expected). | Matches fixer-brief instruction ("DELETE case 18 entirely"). |
| Corrected `isPathShaped` doc-comment (`provider-wiring.ts:332-341`) | New comment states it is a non-authoritative pre-gate that admits URL-like inputs; authoritative check is `fileEvidenceOk`. Live: `'/var/run/secrets/token'`→true, `'https://evil/x'`→true, `''`→false, `'has space'`→false. Comment now matches regex behavior `^[\w.\-/@+=,:~]+$`. | Consistent with the `AWS_WEB_IDENTITY_TOKEN_FILE` / `AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE` validators that call it; no sibling-provider drift. |

---

## WHOLE-PR BREADTH SWEEP vs main

| Provider | STUB-by-default | Evidence gate | Identity/shape verification | Fail-open? |
|---|---|---|---|---|
| Supabase | ✓ (requires URL+service-role JWT) | n/a (no `*_FILE`) | `isPlausibleSupabaseServiceRoleJwt` — offline header(alg-allowlist, no `none`)+payload(`role==='service_role'` hard gate) | none |
| Stripe | ✓ | n/a | `sk_(live\|test)_…{24,}` secret-only (rejects pk_/rk_); `whsec_…{20,}` | none |
| OpenAI | ✓ | n/a | `sk-…{20,}` | none |
| AWS S3 | ✓ | `fileEvidenceOk` on both file-bearing groups (IRSA + Pod Identity) | ARN regex; URI regex (http+https for link-local); path-shape on file vars | none (IRSA now requires BOTH ARN+file; Pod Identity branch parallel) |
| Twilio / Cloudflare / Mux / SendGrid / Fly / Sentry | ✓ | n/a | no key-shape validator (relies on presence + placeholder) | none — but see Note 2 |

- **Either/or semantics (`requiresAnyOf`):** `.some(isSatisfied)` (OR across groups), each group `.every` (AND within). Best-gap group surfaced deterministically (`reduce` keeps earlier on tie). Correct and consistent.
- **`*_FILE` evidence symmetry:** `collectFileEvidence` flattens `[requires, ...requiresAnyOf]`, so the edge always probes every file var; `fileEvidenceOk` is consulted in BOTH `alwaysSatisfied` and the `requiresAnyOf` `isSatisfied`. The ONE asymmetry is diagnostic emission — see R5c-F001-LensB.
- **AST import discovery:** type-only import/export erasure handled (`isTypeOnlyImport`/`isTypeOnlyExport`); `.tsx/.mts/.cts` scanned, `.d.ts` excluded; `require`/dynamic-`import`/side-effect/namespace all covered; computed specifiers safely skipped. Consistent across both spec suites.
- **Determinism:** all helpers pure over injected maps; `collectFileEvidence` is the sole fs touch for evidence, `scanProvidersFromProcess` the sole `process.env`/cwd touch. No nondeterminism introduced by the R5b delta.

---

## RULE VERIFICATION

| Rule | Result | Evidence |
|---|---|---|
| **R3 identity** | **PASS** | All 7 PR commits (`5b8acb1,4c0baab,becbe68,7929d45,c5dd5bd,02790a6,fec7073`) have author **and** committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. |
| **R75 banned tokens (prose)** | **PASS** | `git diff 8680000..HEAD \| grep -iE '^\+.*(claude\|anthropic\|co-authored\|assistant\|ai-generated)'` → empty. |
| **Banned-cast CI gate (R100.A2)** | **PASS** | Ran the gate's exact pathspec (`test/**/*.ts` incl. `provider-wiring.ts`, excl. `*.spec.*`) + token list over added lines → 0 hits (incl. parametrized empty-catch regex). |
| **LOC gate (R100.A3)** | **PASS** | Net LOC in gate scope = **3063** (>400) BUT PR **title** carries `[LOC-EXEMPT: …]` (gate reads the live PR title, not commit bodies). `tsconfig.json` is outside the LOC pathspec (`*.config.json` ≠ `tsconfig.json`). |
| **Test-density gate (R100.A1)** | **PASS** | src-side added in gate scope (`src/**`, `scripts/**/*.ts`, `dangerfile.js`) = **0** → ratio N/A → auto-pass. No `[TEST-EXEMPT]` needed. |
| **R40 assertion strength** | **PASS** | No `toBeDefined/toBeTruthy/toBeFalsy/not.toThrow/.skip/.only/xit/fit/fdescribe/it.todo` in either spec (the lone `.only-two` grep hit is a JWT string literal, not `.only`). |
| **LOC-EXEMPT marker (per brief #5)** | **PASS w/ note** | Gate is PR-title-based, so per-commit markers are not gate-required. Commit bodies: present on `fec7073/02790a6/7929d45`, absent on `5b8acb1/4c0baab/becbe68/c5dd5bd`. Not a CI failure. See Note 1. |
| **File boundaries** | **PASS** | PR touches only `test/prod-readiness/**` + root `tsconfig.json` (a necessary, benign exclude of the `__fixtures__` tree so tsc does not type-check the deliberately-raw `.tsx` fixture). |
| **TS syntax** | **PASS** | `parseDiagnostics` = 0 for `provider-wiring.ts`, both spec files. Transpile of `provider-wiring.ts` emits 0 diagnostics. |
| **Runtime harness** | **PASS** | 17/17 probes PASS (JWT type-guard, alg/role gates, isPathShaped contract, requires-vs-anyOf diagnostic contrast). |

---

## NON-FINDINGS (considered, declined to elevate — recorded for the angry-passover record)

1. **Per-commit `[LOC-EXEMPT]` absent on 4 commits** — NOT a finding. `.github/workflows/r100-quality-gate.yml` reads the **live PR title** for the marker and measures the cumulative PR diff; commit-body markers are decorative. PR #465's title carries `[LOC-EXEMPT: …]`, so the gate passes.
2. **No key-shape validators for Twilio/Cloudflare/Mux/SendGrid/Fly/Sentry/`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`** — pre-existing, documented opt-in design ("Vars with no known shape fall back to the placeholder/length checks"). A present-but-malformed value for these slots would WIRE, but that is the accepted design and was passed by all prior rounds; not introduced or changed by the R5b delta.
3. **Comment "length checks already applied in classifyVars" (`provider-wiring.ts:199`, echoed at :397)** — `classifyVars` enforces empty/whitespace→missing/placeholder (a length-0 check) but no minimum-length floor, so "length checks" is loosely worded. Defensible (the empty check IS a degenerate length check); too weak to elevate over two prior clean depth/breadth rounds. Noted only.
4. **Spec case numbering gap (14-17, then 19)** — cosmetic label artifact of the brief-mandated case-18 deletion. Not a defect.
5. **LOC-EXEMPT title prose says "both files under test/**"** — stale wording (the PR has 5 files incl. `tsconfig.json`, which is not under `test/**`). The marker's presence is what the gate checks; "genuine prod LOC = 0" holds w.r.t. the gate's pathspec (`tsconfig.json` uncounted). Operator prose only; not a gate or code defect.
6. **`isPathShaped` admits URLs** — was R5b-F002-LensA; CLOSED by the corrected comment (the helper is intentionally non-authoritative; `fileEvidenceOk` is the on-disk gate). Re-verified live.

---

## SUMMARY

PR #465 @ `fec7073` correctly applies both R5b fixer changes and remains soundness-clean across every classification path (17/17 live probes; 0 TS diagnostics). All identity/banned-token/LOC/test-density/assertion/boundary gates pass. The single P3, **R5c-F001-LensB**, is a latent cross-path inconsistency: the `requires`-bucket `*_FILE` missing-on-disk case fail-closes to STUB but, unlike the parallel `requiresAnyOf` path, attaches no `diagnostic`, violating the documented `ProviderReport.diagnostic` contract — and spec case 20 only asserts `status`, masking it. No soundness impact; unreachable for the 10 shipped providers. Fix = mirror the `requiresAnyOf` diagnostic assignment into the `alwaysSatisfied` branch and assert the diagnostic in case 20.

**VERDICT: NOT CLEAN — 1 finding (R5c-F001-LensB, P3).**

# H4 Split Re-Audit — Lens B (BREADTH, GPT-5.5) — R5d — PR #465 (H4.D provider-wiring)

## VERDICT: **CLEAN — 0 findings**

The R5c fix for `R5c-F001-LensB` is correct, minimal, and single-sourced. Both the `alwaysSatisfied`
(plain-`requires`) branch and the `requiresAnyOf` branch now emit the missing-file diagnostic through the
**same** `fileEvidenceDiagnostic(group, evidence)` helper — there is no near-duplicate template string and
no wording drift. The `"… points to non-existent path"` literal exists in **exactly one place** in the
implementation (`provider-wiring.ts:440`). Spec case 20 is upgraded to a strong, mutation-killable
`.toBe(...)` assertion on `diagnostic`. The whole-PR breadth re-audit vs `main` surfaces no soundness,
contract, or parity defect; all doctrine gates (R3 / R75 / R40 / banned-cast / LOC-EXEMPT / file
boundaries) PASS. The R5c delta touches only the impl (one `if` block) and the spec (case-20 assertions)
and introduces no regression.

| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| PR | #465 — H4.D provider-wiring |
| Branch | `wave-h4d-provider-wiring` |
| Required head SHA | `382c8077e79ba9321edacfe105ef858eb28047fc` |
| HEAD at audit start | `382c8077e79ba9321edacfe105ef858eb28047fc` — **MATCH ✓** |
| Base (PR fork point) | `5b8acb1^` = `868000088fab1fc5929e02291bec4d4928e99aaf` (H4.A #458 on main) |
| R5c fix commit | `382c807` — emit diagnostic on `alwaysSatisfied` `*_FILE`-missing branch + pin in spec |
| Files in PR diff | 5: `provider-wiring.ts`, 2 spec files, 1 `.tsx` fixture, `tsconfig.json` (3082 insertions, 1 deletion) |
| Lens A R5c (sibling) | CLEAN — no regression to depth invariants (JWT guard, IRSA gate, role gate, fileEvidenceOk) |
| Toolchain | repo `node_modules` absent in sandbox (same as all prior rounds). Verified via standalone `typescript@5` (`tsc --noEmit`, strict) over the impl + both specs, and a Node v20.20.1 runtime harness executing `classifyProvider` directly. Jest not runnable in-sandbox (no repo deps); covered by runtime harness + tsc. |

---

## R5c FIX VERIFICATION (R5c-F001-LensB closure)

### 1. Single-source diagnostic template (Lens B mandate — no string drift) — **PASS**

- `fileEvidenceDiagnostic` is defined once (`provider-wiring.ts:436-441`); the only place the literal
  template `` `${missingFileVar} points to non-existent path` `` lives is **line 440**.
- Both emission sites call that one helper:
  - `provider-wiring.ts:483` (NEW, `alwaysSatisfied`/plain-`requires` branch): `diagnostic = fileEvidenceDiagnostic(def.requires, evidence)`
  - `provider-wiring.ts:524` (pre-existing `requiresAnyOf` else-branch): `diagnostic = fileEvidenceDiagnostic(best.group, evidence)`
- `grep "points to non-existent path"` over the impl returns **one** hit (line 440). No inline near-duplicate, no byte-divergent copy. This is the strongest possible form of the fix the prior round recommended ("collapse the two paths onto one diagnostic rule").
- The new guard `if (always.missing.length===0 && always.placeholder.length===0 && !fileEvidenceOk(def.requires, evidence))` is the exact logical mirror of the anyOf guard (`best.result.missing===0 && best.result.placeholder===0 && !fileEvidenceOk(best.group, evidence)`). When the guard is true, `fileEvidenceOk` is `false`, so `fileEvidenceDiagnostic` is guaranteed to return a `string` (not `undefined`) — `diagnostic` can never be assigned `undefined` here.

### 2. Spec case 20 strength + mutation — **PASS**

- `provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts:1522-1536`: synthetic provider
  `requires:['X_TOKEN_FILE'], requiresAnyOf:[]`, `env {X_TOKEN_FILE:'/missing'}`, `evidence {X_TOKEN_FILE_EXISTS:false}`.
- Asserts `status === 'STUB'` **and** `diagnostic === 'X_TOKEN_FILE points to non-existent path'`
  (plus two redundant `.toContain` guards — harmless, matches fixer brief "var name + 'points to non-existent path'").
- **Mutation (live-verified):** deleting the new `if` block (impl 477-484) → `diagnostic` is `undefined` → the `.toBe(...)` assertion goes red. The case is now a discriminating control for the diagnostic, not just status.

### 3. Live runtime confirmation (Node v20.20.1, transpiled module)

```
case 20  classifyProvider(syn,true,{X_TOKEN_FILE:'/missing'},{X_TOKEN_FILE_EXISTS:false})
         => status STUB | diagnostic "X_TOKEN_FILE points to non-existent path"
            present:['X_TOKEN_FILE'] missing:[] placeholder:[]   ← buckets clean, STUB now EXPLAINED ✓
case 21  ...{X_TOKEN_FILE_EXISTS:true}  => status WIRED | diagnostic undefined ✓
anyOf    aws-s3 IRSA-only, AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS:false
         => status STUB | diagnostic "AWS_WEB_IDENTITY_TOKEN_FILE points to non-existent path" ✓
```
Both code paths produce byte-identical wording for the same condition. Cross-path inconsistency from R5c is gone.

---

## WHOLE-PR BREADTH SWEEP vs main (angry passover)

| Provider | STUB-by-default | Evidence gate | Identity/shape verification | Fail-open? |
|---|---|---|---|---|
| Supabase | ✓ | n/a | `isPlausibleSupabaseServiceRoleJwt` — offline alg-allowlist (rejects `none`/unknown) + `role==='service_role'` hard gate | none |
| Stripe | ✓ | n/a | `sk_(live\|test)_…{24,}` secret-only (rejects pk_/rk_); `whsec_…{20,}` | none |
| OpenAI | ✓ | n/a | `sk-…{20,}` | none |
| AWS S3 | ✓ | `fileEvidenceOk` on BOTH file-bearing groups (IRSA, Pod Identity) | ARN regex; container URI regex; path-shape pre-gate on file vars | none |
| Twilio / Cloudflare / Mux / SendGrid / Fly / Sentry | ✓ | n/a (no `*_FILE`) | presence + placeholder fallback (documented opt-in design) | none (see NF-2) |

- **Diagnostic emission is now symmetric** across `requires` and `requiresAnyOf` — the single asymmetry flagged in R5c is closed. `collectFileEvidence` flattens `[requires, ...requiresAnyOf]`, so the edge always probes every `*_FILE` var; `fileEvidenceOk` gates both branches; `fileEvidenceDiagnostic` explains both.
- **Either/or semantics:** `.some(isSatisfied)` (OR across groups), `.every` within a group; best-gap group surfaced via `reduce` (keeps earlier on tie). Correct, deterministic.
- **Purity boundary intact:** `classifyProvider` reads only injected `env`/`evidence`; `collectFileEvidence` is the sole fs touch, `scanProvidersFromProcess` the sole `process.env`/cwd touch. R5c delta adds no I/O.
- **AST import discovery:** type-only import/export erasure (`isTypeOnlyImport`/`isTypeOnlyExport`); `.tsx/.mts/.cts` scanned, `.d.ts` excluded; require/dynamic-import/side-effect/namespace covered. Unchanged by R5c.
- **New comment (impl 469-473)** accurately describes the guard ("buckets clean but the sole reason the always-bucket fails is a `*_FILE` whose file is missing on disk"). No doc-vs-impl drift.

---

## RULE VERIFICATION

| Rule | Result | Evidence |
|---|---|---|
| **R3 identity** | **PASS** | All 8 PR commits (`5b8acb1,4c0baab,becbe68,7929d45,c5dd5bd,02790a6,fec7073,382c807`) have author **and** committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Per-commit author/committer listed and confirmed. |
| **R75 banned tokens** | **PASS** | `git diff 5b8acb1^..HEAD -- '*' \| grep -iE '^\+.*(claude\|anthropic\|co-authored\|assistant\|ai-generated)'` → empty. |
| **R40 assertion strength** | **PASS** | No `toBeDefined/toBeTruthy/toBeFalsy/not.toThrow/.only/.skip/.todo/xit/fit/fdescribe/xdescribe` in either spec. New case-20 assertions are `.toBe(...)` / `.toContain(...)`. |
| **Banned casts** | **PASS** | Added lines contain no `as any` / `as unknown` / `@ts-ignore` / `@ts-expect-error` / `eslint-disable`. |
| **LOC-EXEMPT / LOC gate** | **PASS** | Gate reads the live PR title (carries `[LOC-EXEMPT: …]`) and measures cumulative diff; per-commit body markers are decorative. R5c fix commit `382c807` body carries `[LOC-EXEMPT] test-tree only`. `tsconfig.json` is outside the LOC pathspec. |
| **File boundaries** | **PASS** | PR touches only `test/prod-readiness/**` + root `tsconfig.json` (benign `exclude` of the `__fixtures__` tree so tsc does not type-check the deliberately-raw `.tsx` fixture; introduced in `becbe68`). R5c delta (`382c807`) touches only `provider-wiring.ts` + one spec — both under `test/prod-readiness/`. |
| **TSC** | **PASS** | Standalone `tsc --noEmit` (strict, skipLibCheck, node+jest types) over `provider-wiring.ts` + both specs → exit 0, 0 diagnostics. |
| **Runtime harness** | **PASS** | Cases 20/21 + aws IRSA contrast + NOT_USED parity executed under Node v20.20.1; all match expected. |
| **Test counts** | **PASS** | 145 + 58 = **203** `it()` blocks (unchanged from R5c; R5c added assertions to existing case 20, no new `it`). |

---

## NON-FINDINGS (considered, declined to elevate — angry-passover record)

1. **Per-commit `[LOC-EXEMPT]` absent on 4 commits** (`5b8acb1,4c0baab,becbe68,c5dd5bd`) — NOT a finding. The R100 gate keys on the **live PR title** marker + cumulative diff, not commit bodies. Consistent with R5/R5b/R5c clean verdicts. No regression: the R5c commit itself carries the marker.
2. **No key-shape validators for Twilio/Cloudflare/Mux/SendGrid/Fly/Sentry/`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`** — pre-existing, documented opt-in design ("Vars with no known shape fall back to the placeholder/length checks"). Not introduced or changed by R5c.
3. **`diagnostic` carried on `NOT_USED` status when a `*_FILE` in `requires` is missing** — live-observed (`NOT_USED` + `"X_TOKEN_FILE points to non-existent path"`). NOT a new defect: the **pre-existing** `requiresAnyOf` branch already exhibits identical behavior (e.g. aws-s3, sdk not imported, file missing), and it passed every prior round. The JSDoc says "non-WIRED status", which includes `NOT_USED`. The R5c fix merely brings the `requires` branch to the same (already-accepted) parity. Cosmetic at most; latent (no shipped provider routes `*_FILE` through plain `requires`).
4. **Diagnostic single-field overwrite when BOTH a `requires` `*_FILE` and the best `requiresAnyOf` group are file-missing** — the anyOf else-branch (524) would overwrite the always-branch value (483). Not a contract violation (a valid diagnostic is still present); the field is single-valued by design. Latent — unreachable for all 10 shipped providers. Noted only.
5. **Spec case numbering gap (…17, then 19, 20, 21)** — cosmetic artifact of the R5b-mandated case-18 deletion. Not a defect.
6. **`tsconfig.json` outside `test/**`** — necessary, benign `exclude` so tsc skips the raw `.tsx` fixture. Accepted in all prior rounds.

---

## SUMMARY

The R5c delta does exactly what the prior recommendation asked, in the cleanest form: one shared
`fileEvidenceDiagnostic` helper feeds both the `requires` and `requiresAnyOf` diagnostic emission sites, so
there is provably no template-string drift; the previously non-discriminating spec case 20 is now a strong,
mutation-killable `.toBe` pin. No new defect was introduced, and the whole-PR breadth sweep (provider parity,
fail-closed semantics, purity boundary, doctrine gates) is clean. **R5c-F001-LensB is closed. Verdict: CLEAN.**

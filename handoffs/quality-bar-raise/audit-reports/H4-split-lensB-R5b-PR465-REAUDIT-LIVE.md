# H4 Split Audit — Lens B (BREADTH, GPT-5.5) — R5b RE-AUDIT — PR #465 (H4.D provider-wiring)

## VERDICT: CLEAN

Zero findings. All three R5 findings (R5-F001 Lens B P1, R5-F001 Lens A P3, R5-F002 Lens A P3) are independently verified CLOSED. The IRSA + Pod Identity contracts are AWS-doc-faithful, every new spec case discriminates against the unfixed code, R3/R75/R40/R74 all pass, and 24 live probes against the transpiled module confirm runtime behavior matches every asserted outcome.

---

## 1. BUILD MATRIX + SHA PIN

| Item | Value |
|---|---|
| Repo | `BradleyGleavePortfolio/growth-project-backend` |
| PR | #465 — H4.D provider-wiring |
| Branch | `wave-h4d-provider-wiring` |
| Required head SHA (brief) | `02790a6452d05882b89ea4f6a89fbd8149ea2022` |
| Observed HEAD at audit start | `02790a6452d05882b89ea4f6a89fbd8149ea2022` — **MATCH ✓** |
| Observed HEAD at audit end | `02790a6452d05882b89ea4f6a89fbd8149ea2022` — no drift ✓ |
| R5 base (prior audited head) | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| R5 fix commit | `02790a6` — `fix(provider-wiring): tighten AWS credential contract + Pod Identity branch + JWT/FILE hardening (H4.D R5)` |
| Files in R5 diff | 3 (all under `test/prod-readiness/`) |
| Diff numstat | `provider-wiring.ts` +149/−29; `…twilio-aws-fly…spec.ts` +346/−40; `…stripe-mux-sendgrid.spec.ts` +113/−19 |
| Toolchain | repo `node_modules` absent (jest/tsc not installable in sandbox — same as prior rounds). Live verification performed by transpiling `provider-wiring.ts` with standalone `typescript` (vercel-bundled lib) via `ts.transpileModule` and executing the compiled module under Node v20.20.1. |
| Live probes | 24/24 PASS (`/tmp/verify.js`) — IRSA/Pod-Identity classification, all regexes, JWT type guard, R5-F002 synthetic gate. |
| ISO timestamp (UTC) | 2026-06-24 |

---

## 2. PRIOR-FINDING CLOSURE VERIFICATION

### R5-F001 (Lens B, P1) — IRSA missing `AWS_ROLE_ARN` — **CLOSED ✓**
`provider-wiring.ts:155` — the IRSA group is now `['AWS_ROLE_ARN', 'AWS_WEB_IDENTITY_TOKEN_FILE']` (both required). Live probe `c2`: env `{AWS_REGION, AWS_WEB_IDENTITY_TOKEN_FILE}` with no role ARN → **STUB** with `AWS_ROLE_ARN` in `env_vars_missing`. Pre-fix this classified WIRED (fail-open). Spec cases 2 & 3 lock both directions. A new `AWS_ROLE_ARN` regex validator (`^arn:aws[a-z0-9-]*:iam::\d{12}:role/[\w+=,.@/-]+$`) was added and registered in `KEY_SHAPE_VALIDATORS`.

### NEW — EKS Pod Identity branch — **ADDED & CORRECT ✓**
`provider-wiring.ts:156` — `['AWS_CONTAINER_CREDENTIALS_FULL_URI', 'AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE']` (both required). Structurally parallel to IRSA. Probe `c5` → WIRED; `c8` (file evidence false) → STUB + exact diagnostic. AWS-doc-faithful (see §6).

### R5-F001 (Lens A, P3) — JWT type guard — **CLOSED ✓**
`provider-wiring.ts:290–295` — signature widened `string`→`unknown`; guard `if (typeof v !== 'string' || v.length === 0) return false;` at top. Probes `jwt.null/num/obj/empty` → `false` (no throw); `jwt.valid` → `true`. Sole internal caller (`KEY_SHAPE_VALIDATORS.SUPABASE_SERVICE_ROLE_KEY`, validator type `(v: string) => boolean`) passes a `string`, which `unknown` accepts — widening is consumer-compatible, no `any` leak.

### R5-F002 (Lens A, P3) — `*_FILE` evidence ungated in `requires` — **CLOSED ✓**
`provider-wiring.ts:464–467` — `alwaysSatisfied` now ANDs `fileEvidenceOk(def.requires, evidence)`. Predicate is byte-identical in shape to the `requiresAnyOf` use-site (`fileEvidenceOk(c.group, evidence)`), so no gate drift. `fileEvidenceOk([], evidence)` returns `true` vacuously (`fileVarsOf([]).every(...)` on empty array) → no regression for the 10 shipped providers (none have a `*_FILE` in `requires`). Synthetic probes `syn.false` (evidence false → STUB) and `syn.true` (evidence true → WIRED) confirm the gate now fires; pre-fix `syn.false` would have classified WIRED.

---

## 3. BREADTH SWEEP TABLE

| Sweep | Rule(s) | Result |
|---|---|---|
| Commit identity (all 6 PR commits) | R3 | **PASS** — every author+committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`; R5 body has zero `claude/anthropic/co-authored/assistant/agent/ai-generated` tokens. |
| Banned tokens (added lines, `c5dd5bd9..head`) | R75 | **PASS** — no `@ts-ignore`/`@ts-nocheck`/`as any`/`as unknown as`/`as never`/`eslint-disable`/`.catch(()=>…)`/`.skip`/`.only`. |
| Assertion strength (added lines) | R40 | **PASS** — all new `expect()` are value-equality (`toBe`/`toEqual`/`toContain`); zero `toBeDefined`/`toBeTruthy`/`toBeFalsy`/`not.toThrow`/`toBeUndefined`. |
| Test hygiene at HEAD | R40 | **PASS** — no `.only`/`.skip`/`xit`/`fit`/`fdescribe`/`it.todo` in either spec. 204 `it()` / 365 `expect()` across the two specs. |
| LOC ratio (R5 commit) | R74 | **PASS** — test-LOC added 459 (113+346) vs impl module 149 added → 3.08× ≥ 2.0. (Most of the 149 are multi-line reformatting of `PROVIDERS` literals; genuine logic delta is far smaller.) |
| LOC marker | R76 | **PASS** — `[LOC-EXEMPT] test-tree only` present in commit body; entire scope under `test/prod-readiness/`. |
| File boundaries | — | **PASS** — diff touches ONLY the 3 named files. |
| Imports | R43 | **PASS** — zero new imports added to `provider-wiring.ts`; specs import only from `./provider-wiring` + Node builtins. All symbols used by new tests (`isPlausibleSupabaseServiceRoleJwt`, `EvidenceMap`, `ProviderDef`, `KEY_SHAPE_VALIDATORS`, `passesShapeCheck`) are imported. |
| Exported contract | R31 | **PASS** — only `isPlausibleSupabaseServiceRoleJwt` signature changed (`string`→`unknown`, widening). No other exported symbol changed shape. |
| Determinism | — | **PASS** — `fileEvidenceOk` is a pure `.every` over a filtered array; gate change preserves determinism. Best-group reducer is order-stable (ties resolve to the first/static group). |
| Regex contract | — | **PASS** — see §3a. |
| Dead-code removal (`dormant`) | R39 | **PASS** — see §3b. |
| Non-discriminating controls | — | **PASS** — see §3c. |

### 3a. Regex contract line-read (all live-verified)

| Validator | Pattern | Verdict |
|---|---|---|
| `AWS_ROLE_ARN` | `^arn:aws[a-z0-9-]*:iam::\d{12}:role/[\w+=,.@/-]+$` | Anchored ✓. `\d{12}` enforces *exactly* 12 digits — probes confirm 3-digit (`arn.3dig`) and 13-digit (`arn.13dig`) both rejected. Partition class `aws[a-z0-9-]*` accepts `aws`, `aws-cn`, `aws-us-gov` (`arn.gov` ✓). Non-IAM ARN `arn:aws:s3:::…` rejected (`arn.s3` ✓). No nested quantifier → no ReDoS. |
| `AWS_CONTAINER_CREDENTIALS_FULL_URI` | `^https?:\/\/[^\s]+$` | Accepts both `http://` (Pod Identity loopback `169.254.170.23`, `uri.http` ✓) and `https://`. Rejects `ftp://` and scheme-less host (`uri.ftp`, `uri.noscheme` ✓). Linear, no ReDoS. |
| `AWS_WEB_IDENTITY_TOKEN_FILE` / `AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE` | `isPathShaped` = `v.length>0 && /^[\w.\-/@+=,:~]+$/.test(v)` | Empty string rejected (`file.empty` ✓ — no empty slip-through). Whitespace rejected (`file.space` ✓). Real token path accepted (`file.ok` ✓). Single char class + `+` → no ReDoS. Loose-by-design; on-disk existence is gated separately by `fileEvidenceOk`. |

### 3b. `dormant()` dead-code removal
The R5 commit removes `function dormant()` from the twilio/aws spec. Verified: (a) at base `c5dd5bd9` `dormant` was **defined but never called** in that file — the only other "dormant" token was a test *title string* (`'dormant: no path hint…'`, which calls `classifyProvider` directly). (b) It was introduced by commit `5b8acb1` (the original H4.D feat commit) — i.e. **earlier in this same PR**, so its removal is a legitimate own-goal cleanup, not deletion of main's code. (c) The stripe-mux-sendgrid spec keeps its *own* local `dormant` because that file genuinely uses it (lines 135/187/484). No cross-file breakage. **Not a finding.**

### 3c. Non-discriminating-control sweep (21 new cases + reformatted controls)
Every case whose outcome depends on the R5 change was confirmed to FAIL on unfixed code via live probe, so none are assertion-theater:
- Cases 2,3 (IRSA missing-var) — pre-fix WIRED, post-fix STUB. ✓
- Cases 4,8 (file-evidence diagnostic) — assert exact diagnostic string. ✓
- Cases 6,7 (Pod Identity missing-var) — surface the correct missing var. ✓
- Cases 12,13 (region gate) — STUB + `AWS_REGION` missing. ✓
- Cases 20,21 (R5-F002 synthetic) — the ONLY difference is the evidence boolean; STUB vs WIRED diverge exactly on the gate. Pre-fix case 20 was WIRED. ✓
- Cases 14–18 (type guard) — pre-fix 14–17 *threw*; post-fix `false`. ✓
- Regex tests (stripe spec) — each asserts both a `true` and a `false` branch on the same validator. ✓

Minor over-sweep notes (NOT findings) recorded in §7.

---

## 4. (folded into §2 above)

---

## 5. (folded into §3 above)

---

## 6. AWS-DOCS CROSS-REFERENCE TABLE

Confirmed against AWS official docs ([EKS Pod Identity how-it-works](https://docs.aws.amazon.com/eks/latest/userguide/pod-id-how-it-works.html), [Container credential provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-container-credentials.html), [EKS Pod Identity launch blog](https://aws.amazon.com/blogs/containers/amazon-eks-pod-identity-a-new-way-for-applications-on-eks-to-obtain-iam-credentials/)).

| Auth mode | Required env vars (AWS docs) | In contract? | Verdict |
|---|---|---|---|
| IRSA / web identity | `AWS_ROLE_ARN` **and** `AWS_WEB_IDENTITY_TOKEN_FILE` (both injected by the pod-identity webhook; SDK's `WebIdentityTokenFileCredentialsProvider` needs both) | both, in one group | **CORRECT ✓** |
| IRSA optional | `AWS_ROLE_SESSION_NAME` (optional per AWS) | absent | **CORRECT ✓** (must NOT be required) |
| EKS Pod Identity | `AWS_CONTAINER_CREDENTIALS_FULL_URI` (= `http://169.254.170.23/v1/credentials`) **and** `AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE` (= `/var/run/secrets/pods.eks.amazonaws.com/serviceaccount/eks-pod-identity-token`) | both, in one group | **CORRECT ✓** — test fixtures use these exact AWS-documented values. |
| Static keys | `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ always `AWS_REGION`) | both | **CORRECT ✓** |

On the brief's `AWS_CONTAINER_AUTHORIZATION_TOKEN` (in-memory) question: the SDK container-credential provider *does* support a literal-token variant, but **EKS Pod Identity specifically injects the `_FILE` variant** (confirmed by AWS docs above and the aws-sdk issue threads). Since this scanner targets the EKS Pod Identity deployment mode (per its comments and fixtures), requiring the `_FILE` variant is the faithful contract; adding `_TOKEN` as a separate alternative would over-broaden the matcher and is correctly **omitted**. **Not a finding.**

---

## 7. ANGRY OVER-SWEEP NOTES (hunted hard; none rise to a finding)

1. **Always-bucket `*_FILE` has no diagnostic.** When a `*_FILE` var sits in `requires` and its file is missing, `classifyProvider` correctly STUBs (fail-closed), but the `fileEvidenceDiagnostic("…points to non-existent path")` message is emitted *only* inside the `requiresAnyOf` branch — the always-bucket path produces no diagnostic. Synthetic case 20 asserts only `status==='STUB'`, so this asymmetry is uncovered. **Severity: none/P4.** No shipped provider has a `*_FILE` in `requires`; R5-F002's contract was strictly "gate fires → STUB," which holds. Purely a future diagnostic-quality nicety. Logged for the next provider that puts a file var in `requires`.

2. **`fileEvidenceOk` value-coercion.** The gate keys on strict `!== false`; a *string* `"false"` in the evidence map would be treated as present/OK. Irrelevant here — evidence is produced by `collectFileEvidence` as real booleans and `EvidenceMap` is typed `Record<string, boolean>`. No external untyped ingress. Not a finding.

3. **Case 11 doesn't isolate the R5 change.** "partial static + complete IRSA → WIRED" classifies WIRED both pre- and post-fix (the IRSA pair is complete in the fixture). It is a valid positive control for any-of semantics, not assertion theater, but it does not *discriminate* the role-ARN tightening. Cases 2/3 cover that. No action.

4. **Case 18 (empty-string JWT) doesn't isolate the new `length===0` clause.** `''.split('.')` → `['']` (length 1 ≠ 3) → `false` even without the empty guard, so the test passes with or without that specific sub-clause. It still asserts the correct contract output. Cosmetic redundancy, not a defect.

5. **`isPathShaped` is intentionally permissive** (`-`, `..`, `~` etc. pass). This is a documented shape heuristic; real-world unusability is caught by the on-disk `fileEvidenceOk` gate. `FULL_URI` `[^\s]+` is likewise loose-by-design. Consistent with the module's "shape, not validity" doctrine. Not findings.

6. **R74 fixer-brief figure mismatch (informational).** The fixer brief stated "prod +29"; actual `provider-wiring.ts` numstat is +149/−29 (the +149 is dominated by multi-line reformatting of the `PROVIDERS` object literals). Ratio still clears 2.0× and the whole scope is `[LOC-EXEMPT]` test-tree. No rule impact.

---

### Final statement
All R5 findings closed with discriminating regression coverage; the IRSA + Pod Identity contracts match AWS documentation exactly; no new defects across R3/R75/R40/R74/LOC/imports/boundaries/determinism/regex/exported-contract. **VERDICT: CLEAN.**

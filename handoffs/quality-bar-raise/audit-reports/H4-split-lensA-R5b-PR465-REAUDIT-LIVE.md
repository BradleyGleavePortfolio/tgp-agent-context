# H4 Split Re-Audit — Lens A (DEPTH, Opus 4.8) — R5b — PR #465 (H4.D provider-wiring)

## 1. SHA PIN
| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| Branch | `wave-h4d-provider-wiring` |
| PR | #465 |
| Required head SHA | `02790a6452d05882b89ea4f6a89fbd8149ea2022` |
| HEAD at audit START | `02790a6452d05882b89ea4f6a89fbd8149ea2022` — **MATCH ✓** |
| HEAD at audit END | `02790a6452d05882b89ea4f6a89fbd8149ea2022` — **MATCH ✓ (no drift)** |
| R5 base (fix diff from) | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| Method | Transpiled `provider-wiring.ts` via standalone `typescript@5.9.3` (`ts.transpileModule`, 0 diagnostics), executed with Node v20.20.1. Drove the live functions + a source-mutation harness (each spec case re-run against baseline AND against a module with the relevant prod predicate inverted). Jest is not installed in the sandbox, so the 21 spec cases were mutation-tested by replicating their exact inputs/expectations against the live module rather than via the jest runner. |

## 2. VERDICT: **FINDINGS** (2 × P3 — both test-efficacy / doc-accuracy; zero soundness fail-opens)

The three R5 fixes (IRSA strict + Pod Identity branch + JWT type guard + `requires`-bucket file gate) are **all correctly implemented and soundness-clean** — verified live with 48 executed probes + 21 mutation tests. The two findings are quality issues in the *test* surface and a *comment* contract, not classification defects. Under the strict zero-finding doctrine they are reported for closure before merge.

---

## 3. FINDINGS

### R5b-F001-LensA — P3 — non-discriminating spec control (case 18: empty-string JWT)
- **Category:** test-efficacy / non-discriminating control (same defect class as the `propertyName` baseline finding closed in PR #464 R5d-LensB).
- **Location:** `test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts` — case `18. empty string → false` (`expect(isPlausibleSupabaseServiceRoleJwt('')).toBe(false)`).
- **What it claims to cover:** the `v.length === 0` clause of the new fail-closed type guard in `isPlausibleSupabaseServiceRoleJwt` (`provider-wiring.ts:294`).
- **Why it does not discriminate (live proof):** empty string is *already* terminated by the pre-existing `segments.length !== 3` check (`''.split('.')` → `['']`, length 1). The expected outcome (`false`) holds whether the type guard is present, absent, or has only the `length===0` clause removed:
```
case18 vs M3_drop_typeguard      | baseline=true mutated=true | discriminates= *** NO ***
case18 vs guard_typeof_only      | baseline=true mutated=true | discriminates= *** NO ***
```
  (mutated=true means the assertion still passes with the guard removed → the test cannot detect the regression it was written to guard.)
- **Soundness impact:** NONE. Prod genuinely rejects `''` (via the segment-length check). This is purely that the test does not validate the line it was added to protect. The `v.length === 0` sub-clause of the prod guard is itself redundant for empty-string (harmless defensive code).
- **Discriminating fix:** the empty-string input cannot discriminate any guard mutation; to actually exercise the guard, the empty/blank coverage must use an input that reaches `.split` *only* when the guard is absent — already covered by cases 14–17 (null/undefined/number/object). Either (a) drop case 18 as redundant and rely on 14–17 for guard coverage, or (b) keep it but re-label it as general happy-path/contract coverage (not guard-clause coverage), and optionally remove the redundant `|| v.length === 0` clause from prod since the segment check subsumes it.

### R5b-F002-LensA — P3 — `isPathShaped` comment contract is inaccurate (claims URL-rejection it does not perform)
- **Category:** contract/comment accuracy (R109-adjacent). No soundness impact.
- **Location:** `test/prod-readiness/provider-wiring.ts:330-340` (`isPathShaped`), regex `^[\w.\-/@+=,:~]+$`.
- **Defect:** the doc-comment states the helper accepts a path "rather than a URL … any value containing whitespace or characters that never appear in a credential-file path." The character class admits `:` and `/`, so a URL passes:
```
isPathShaped('https://evil/x') => true   (doc claims URLs rejected)
```
- **Soundness impact:** NONE. `isPathShaped` is an internal (non-exported) *shape* pre-gate. For `*_FILE` vars the authoritative check is `fileEvidenceOk`, which consults `<VAR>_FILE_EXISTS` produced by `collectFileEvidence → isReadableRegularFile`. A URL-as-path resolves to no regular file → `_EXISTS:false` → STUB. Verified end-to-end: a URL value in `AWS_WEB_IDENTITY_TOKEN_FILE` cannot fail open to WIRED in the production edge path (evidence is always collected there).
- **Discriminating fix:** correct the comment to describe it as a loose shape gate that also admits URL-like strings (authoritative existence is `fileEvidenceOk`), OR tighten the regex to reject the `://` scheme separator if URL-rejection is genuinely intended. Comment-only fix is sufficient since the gate is non-authoritative.

---

## 4. PRIOR-FINDING CLOSURE TABLE
| Prior finding | Priority | Status @ 02790a64 | Live proof |
|---|---|---|---|
| **R5-F001 (Lens B)** — IRSA missing `AWS_ROLE_ARN` | P1 | **CLOSED ✓** | IRSA branch is now `['AWS_ROLE_ARN','AWS_WEB_IDENTITY_TOKEN_FILE']`. File-only (no ARN) → STUB with `env_vars_missing` ⊇ `AWS_ROLE_ARN`; role-only (no file) → STUB ⊇ `AWS_WEB_IDENTITY_TOKEN_FILE`; both+`_EXISTS:true` → WIRED. (probes 1–4, all PASS) |
| **NEW: Pod Identity branch** | — | **PRESENT & CORRECT ✓** | Branch `['AWS_CONTAINER_CREDENTIALS_FULL_URI','AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE']` parallel to IRSA. URI-only → STUB; file-only → STUB; both+`_EXISTS:true` → WIRED; both+`_EXISTS:false` → STUB. `fileEvidenceOk` consulted for the auth token file. (probes 5–8 PASS; `collectFileEvidence` flattens `requiresAnyOf` so the new `*_FILE` is probed at the edge) |
| **R5-F001 (Lens A)** — JWT throws on non-string | P3 | **CLOSED ✓** | Signature is `(v: unknown)`; guard `if (typeof v !== 'string' \|\| v.length === 0) return false;` at top. Live: `null/undefined/12345/{}/''` → `false` (no throw); valid JWT → `true`. (probes 14–19 PASS) |
| **R5-F002 (Lens A)** — `*_FILE` in `requires` ungated | P3 | **CLOSED ✓** | `alwaysSatisfied` now ANDs `fileEvidenceOk(def.requires, evidence)`. Synthetic provider with `X_TOKEN_FILE` in `requires` + `X_TOKEN_FILE_EXISTS:false` → STUB; `:true` → WIRED. (axis-5 probes PASS) |

---

## 5. MUTATION-TEST RESULTS (all 21 new spec cases)
Each case re-run against baseline (must PASS) and against a module with the relevant prod predicate inverted/removed (must turn red). **20 / 21 discriminate.**

| Case | Mutation applied | Discriminates? |
|---|---|---|
| 1 IRSA full → WIRED | IRSA drops ARN | YES |
| 2 file-only → STUB+missing ARN | IRSA drops ARN | YES |
| 3 role-only → STUB+missing file | IRSA = `['AWS_ROLE_ARN']` only | YES |
| 4 IRSA file-missing diag | anyOf drops `fileEvidenceOk` | YES |
| 5 PodID full → WIRED | drop PodID branch | YES |
| 6 PodID uri-only → STUB | drop PodID branch | YES |
| 7 PodID file-only → STUB | drop PodID branch | YES |
| 8 PodID file-missing diag | anyOf drops `fileEvidenceOk` | YES |
| 9 static+IRSA → WIRED | `.some`→`.every` (OR→AND) | YES |
| 10 static+PodID → WIRED | `.some`→`.every` | YES |
| 11 partial-static+IRSA → WIRED | drop IRSA branch | YES |
| 12 no-region+IRSA → STUB | `requires` region removed | YES |
| 13 no-region+PodID → STUB | `requires` region removed | YES |
| 14 null → false | drop type guard | YES |
| 15 undefined → false | drop type guard | YES |
| 16 number → false | drop type guard | YES |
| 17 object → false | drop type guard | YES |
| **18 empty-string → false** | drop type guard / drop length clause | **NO → R5b-F001-LensA** |
| 19 valid JWT → true | invert role gate | YES |
| 20 requires-FILE `_EXISTS:false` → STUB | alwaysSatisfied drops `fileEvidenceOk` | YES |
| 21 requires-FILE `_EXISTS:true` → WIRED | invert `fileEvidenceOk` | YES |

---

## 6. ANGRY OVER-SWEEP (axes considered and rejected with live rationale)
| Axis | Probe | Result / rationale |
|---|---|---|
| IRSA third-party malformed pod (file, no ARN) | `{REGION,TOKEN_FILE}` | STUB ✓ — no longer WIRED. Closed. |
| Regex anchoring/injection (ARN) | newline prefix/suffix, leading junk, `sts` service, empty role name, 11/13-digit acct | all correctly rejected; `^…$` anchored; `aws-cn` partition accepted (15 probes PASS) |
| Regex anchoring (URI) | newline injection, prefix junk, space, bare scheme | all rejected; `http://` loopback + `https://` accepted (PASS) |
| Regex anchoring (`*_FILE`) | newline/tab injection, empty, whitespace, embedded space | all rejected; absolute/relative/colon paths accepted (PASS) |
| `_EXISTS:undefined` semantics | IRSA both present, no evidence | WIRED (documented backward-compat). Production edge ALWAYS populates evidence via `collectFileEvidence`, so undefined only occurs in pure unit tests — not a production fail-open. |
| Empty `requires` / empty `requiresAnyOf` | synthetic providers | vacuously WIRED (pre-existing semantics, unchanged); `fileEvidenceOk([])` returns true vacuously without throwing (PASS) |
| Non-`*_FILE` var in `requires` | synthetic | gate is inert (no `*_FILE` → no-op); present→WIRED, missing→STUB (PASS) |
| Static-keys path regression | clean `AKIA…`/secret | WIRED ✓ (initial FAILs were fixture artifacts: `AKIAIOSFODNN7EXAMPLE` trips the `example` placeholder substring — corrected, PASS) |
| Mixed presence (static + lone token file, no ARN) | clean keys | WIRED via static-keys branch ✓ (OR-semantics correct) |
| `isPathShaped` admits URLs | `https://evil/x` | comment inaccurate → **R5b-F002-LensA**; but no soundness impact (existence gate compensates) |
| URI trailing-newline `$` leniency | `http://x\n` matches (no `/m`, `$` pre-final-NL) | benign: `passesShapeCheck` trims input before validating; env values are trimmed in the classification path. Not a finding. |
| Dead-code `dormant()` removal | `grep -r dormant test/` | removed helper in twilio-aws spec was genuinely uncalled there (line 374 is a test-name string using `classifyProvider` directly); the `dormant()` in the stripe-mux spec is a separate file-local def, still defined+used (135/187/484). Removal clean — not a finding. |
| Determinism | full-seed scan ×2 | byte-identical ✓ |
| Prototype pollution / role gate strictness | (re-confirmed from R5) `__proto__` payload, trailing-space role, homoglyph | all rejected (unchanged by R5b diff) |

---

## 7. RULE VERIFICATION TABLE
| Rule | Result | Evidence |
|---|---|---|
| **R3 identity** | PASS | All 6 PR commits author+committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` (via `gh api …/pulls/465/commits`). R5 commit body has zero `claude/anthropic/co-authored/assistant/agent/ai-generated` tokens. |
| **R75 banned tokens** | PASS | No genuine violations on added lines. The 6 grep hits (`'fixme'`,`'todo'`,`'xxx'` in `PLACEHOLDER_SUBSTRINGS`; `STRIPE_WEBHOOK_SECRET:'todo'`; `SUPABASE_SERVICE_ROLE_KEY:'TODO'`) are placeholder-detection **data sentinels / test fixtures** — the strings are the *subject under test*, not code-rot markers. No `@ts-ignore`/`as any`/`as unknown as`/`as never`/`.catch(()=>…)`/`console.`/`debugger`. |
| **R40 assertion strength** | PASS | 25 new `it()`, 59 new `expect()`. Zero weak matchers (`toBeDefined/toBeTruthy/toBeFalsy/not.toThrow/toBeNull/toBeUndefined`), zero `.skip/.only/xit/it.todo`. All value-equality (`toBe`/`toEqual`/`arrayContaining`). |
| **R74 ratio (R5 commit)** | PASS | test +459 (113+346) / prod +149 = **3.08×** ≥ 2.0. (All three files live under `test/prod-readiness/`, so LOC-EXEMPT applies regardless.) |
| **LOC-EXEMPT marker** | PASS | `[LOC-EXEMPT] test-tree only` present in commit body; all touched files under `test/prod-readiness/`. |
| **Imports** | PASS | `provider-wiring.ts` imports only `fs`, `path`, `typescript`; no sibling-scanner/registry import. |
| **Determinism** | PASS | byte-identical across runs. |
| **File boundaries** | PASS | Diff `c5dd5bd9..02790a64` touches exactly the 3 reported files, all under `test/prod-readiness/`. |

---

## SUMMARY
PR #465 @ `02790a64` closes all three prior R5 findings (R5-F001 LensB P1, R5-F001 LensA P3, R5-F002 LensA P3) and correctly adds the EKS Pod Identity branch. 48 live probes + 21 mutation tests confirm classification soundness with no fail-opens. Two P3 quality findings remain for closure under the strict zero-finding doctrine: (1) spec case 18 (empty-string) is a non-discriminating control for the type-guard fix; (2) `isPathShaped`'s comment overstates URL-rejection it does not perform (no soundness impact). All R3/R75/R40/R74/LOC/imports/determinism/boundary checks pass.

**VERDICT: FINDINGS — 2 × P3.**

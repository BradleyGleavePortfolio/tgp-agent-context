# H4 Split Re-Audit — Lens A (DEPTH, Opus 4.8) — R5c — PR #465 (H4.D provider-wiring)

## VERDICT: **CLEAN** (zero P0–P3 findings)

Both prior R5b findings (R5b-F001-LensA, R5b-F002-LensA) are confirmed CLOSED. A full adversarial re-audit of the whole PR (vs base `5b8acb1~1`) under a **live jest + tsc environment** (not a transpile harness) found no soundness gap, no fail-open, no non-discriminating new assertion, no doc/code drift, and no rule violation. Every soundness gate was mutation-tested live and each turns the suite red when broken.

---

## 1. SHA + ENVIRONMENT PIN
| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| Branch | `wave-h4d-provider-wiring` |
| PR | #465 |
| Required head SHA | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` |
| HEAD at audit START | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` — **MATCH ✓** |
| HEAD at audit END | `fec7073bbaf4668224ab55fd66b6c905fd025e8f` — **MATCH ✓ (no drift)** |
| PR base (parent of first PR commit) | `5b8acb1~1` |
| R5b fix commit | `fec7073b` (test+comment hygiene only) |
| **Verification method** | **LIVE** — a sibling worktree at the exact SHA (`…-746cb632`) carries an installed `node_modules`. Ran real `tsc --noEmit` and real `jest` on both spec files, plus 4 live source-mutation runs (guard removal, role-gate inversion, `fileEvidenceOk` drop, IRSA-ARN drop). This supersedes the prior rounds' standalone-transpile harness with authoritative runner results. |
| Node | v20.20.1 |

---

## 2. CLOSURE OF R5b FINDINGS

### R5b-F001-LensA (non-discriminating empty-string spec) — **CLOSED ✓**
- **Spec case 18 deleted.** `git show fec7073b` confirms the `it('18. empty string → false', …)` block is removed from `provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts`. No dangling reference to "case 18" / "empty string" survives (`grep` clean; the one residual "empty string" hit at line 868 is an unrelated comment about the `alg` allowlist).
- **Type guard simplified.** `provider-wiring.ts:297` is now `if (typeof v !== 'string') return false;` — the redundant `|| v.length === 0` sub-clause is gone, comment updated (`:295-296`).
- **Behavior identical:** `''.split('.')` → `['']` (length 1) → rejected by `segments.length !== 3` (`:299`). Empty-string still returns `false`; removing the clause changed nothing.
- **Remaining cases 14–17 (null/undefined/number/object) genuinely discriminate `typeof v !== 'string'` — LIVE PROOF.** Mutation M1 (delete the guard line) makes the suite go RED: removing the narrowing makes `v` stay `unknown`, so `v.split('.')` fails to compile (`TS18046: 'v' is of type 'unknown'`, line 298) → "Test suite failed to run". The guard is load-bearing at BOTH the type level (enables `.split`) and the runtime level (a JS caller passing `null` would throw). Cases 14–17 therefore pin it. ✓
- **`segments.length !== 3` is the authoritative empty-string rejection** and is independently pinned by `provider-wiring-…aws…spec.ts:847-848` (`'eyJ.only-two'` → 2 segments → false; `'a.b.c.d'` → 4 segments → false). Empty string ('') is just the length-1 instance of the same code path, so deleting case 18 introduced **no coverage gap**. No other code depends on the removed length-zero clause (grep confirms `length === 0` appears nowhere else relevant).

### R5b-F002-LensA (`isPathShaped` comment inaccurate) — **CLOSED ✓**
- `provider-wiring.ts:332-341` doc-comment now honestly states the helper "intentionally admits URL-like inputs (e.g. 'https://…')" and that "for `*_FILE` vars the authoritative check is `fileEvidenceOk`… A URL-as-path resolves to no regular file → `_EXISTS:false` → STUB." This matches the regex (`/^[\w.\-/@+=,:~]+$/` admits `:` and `/`).
- **No caller relied on the old false URL-rejection contract for soundness.** `isPathShaped` is internal (non-exported), used only by `KEY_SHAPE_VALIDATORS.AWS_WEB_IDENTITY_TOKEN_FILE` / `AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE`. For those vars the existence check `collectFileEvidence → isReadableRegularFile` is authoritative: a URL string `lstatSync`-throws → `_EXISTS:false` → group not satisfied → STUB. The shape gate is a non-authoritative pre-filter; the corrected comment now says exactly that. (The optional discriminating spec the fixer brief floated was correctly skipped — `isPathShaped` is internal-only, so the comment fix is sufficient and exporting it just to test it would inflate the public surface.)

---

## 3. WHOLE-PR LIVE VERIFICATION (tsc + jest)
| Check | Command | Result |
|---|---|---|
| Type check | `tsc --noEmit` (`--max-old-space-size=8192`) | **EXIT 0, clean ✓** |
| AWS spec | `jest …twilio-aws-fly-sentry-supabase-openai-cf.spec.ts` | **145 passed / 145 ✓** |
| Stripe spec | `jest …stripe-mux-sendgrid.spec.ts` | **58 passed / 58 ✓** |
| Total | — | **203 passing, 0 failing, 0 skipped** |

---

## 4. LIVE MUTATION DISCRIMINATION (authoritative — real jest)
Each mutation applied to `provider-wiring.ts`, suite re-run, then reverted (`git status` clean after).

| # | Mutation | Pins | Suite result | Discriminates? |
|---|---|---|---|---|
| M1 | Delete `if (typeof v !== 'string') return false;` | JWT type guard (cases 14–17) | suite fails to run — `v.split` no longer compiles (`unknown`) | **YES** |
| M2 | Role gate `=== 'service_role'` → `!== 'service_role'` | role HARD GATE | **15 failed** | **YES** |
| M3 | Drop `fileEvidenceOk(def.requires, evidence)` from `alwaysSatisfied` (→ `true`) | R5-F002 `requires`-bucket file gate | **1 failed** (synthetic requires-FILE `_EXISTS:false` case) | **YES** |
| M4 | IRSA group `['AWS_ROLE_ARN','AWS_WEB_IDENTITY_TOKEN_FILE']` → `['AWS_WEB_IDENTITY_TOKEN_FILE']` | R5-F001(LensB) IRSA-strict | **6 failed** | **YES** |

All four soundness gates are pinned by ≥1 case that turns red when the gate breaks. No assertion-theater on the load-bearing predicates.

---

## 5. FAIL-OPEN SCAN (every "unsafe input → must be non-WIRED" path traced)
| Unsafe input | Path | Outcome | Fail-open? |
|---|---|---|---|
| Non-string JWT (null/num/obj) into validator | `isPlausibleSupabaseServiceRoleJwt` | `typeof` guard → `false` → placeholder → STUB | NO ✓ |
| Empty-string JWT | `segments.length !== 3` → `false` | placeholder → STUB | NO ✓ |
| `alg=none` / unknown alg | `ALLOWED_JWT_ALGS` membership (`:320`) | `false` → STUB | NO ✓ |
| `role: "anon"` / no role | role hard gate (`:329`) | `false` → STUB | NO ✓ |
| Oversized JWT segment (>8192) | `MAX_JWT_SEGMENT_CHARS` (`:305-311`) | `false` → STUB | NO ✓ |
| URL-as-path in `*_FILE` var | `passesShapeCheck` admits it, BUT `collectFileEvidence`→`isReadableRegularFile` `lstat`-throws → `_EXISTS:false` → `fileEvidenceOk` false | STUB | NO ✓ |
| `*_FILE` set but file absent (IRSA / PodID / requires) | `collectFileEvidence` sets `_EXISTS:false`; `fileEvidenceOk` false in both `anyOf` and `alwaysSatisfied` | STUB + diagnostic | NO ✓ |
| IRSA file-only (no `AWS_ROLE_ARN`) | group requires both → `missing` ⊇ ARN | STUB | NO ✓ (M4 confirms) |
| Directory/socket/FIFO at credential path | `isReadableRegularFile` `!isFile()` → `false` | STUB | NO ✓ |
| Dangling symlink token file | `realpathSync.native` throws → caught → `false` | STUB | NO ✓ |
| `sk_test_*` / placeholder secret in prod | `looksLikePlaceholder` prefix/substring | placeholder → STUB | NO ✓ |
| Wrong-type Stripe key (`pk_`/`rk_`) in secret slot | `KEY_SHAPE_VALIDATORS.STRIPE_SECRET_KEY` regex | placeholder → STUB | NO ✓ |
| `_EXISTS: undefined` (no edge wrapper) | `fileEvidenceOk` treats undefined as OK | WIRED **only in pure unit tests** — production edge `scanProvidersFromProcess` ALWAYS calls `collectFileEvidence`, so undefined never occurs in prod | NO (documented backward-compat, not a prod path) ✓ |

No path lets unsafe input reach WIRED in the production edge.

---

## 6. ANGRY OVER-SWEEP (axes re-checked, all rejected with rationale)
| Axis | Result / rationale |
|---|---|
| `r.diagnostic` `toBeUndefined()` (lines 151/342/351/1151) | Not a banned weak matcher: each asserts the diagnostic field is *absent* on a WIRED report and is paired with explicit status/bucket equality assertions. A regression that always-sets a diagnostic would flip these red. Legitimate value assertion. Not a finding. |
| Empty-string coverage lost by deleting case 18 | NO — the `segments.length !== 3` path is pinned by the 2-seg/4-seg cases (847-848). Empty string is the length-1 instance of the identical branch. |
| `looksLikePlaceholder` `'example'`/`'fake'` substrings over-reject real values (e.g. `/srv/example/token`) | Fails CLOSED (→ STUB), the safe direction. Not a fail-open. Pre-existing, unchanged. Not a finding. |
| `AWS_CONTAINER_CREDENTIALS_FULL_URI` regex accepts any `http(s)://` host | Loose by design; the auth-token-file existence gate co-guards the PodID group. Heuristic, not a security boundary. Pre-existing. Not a finding. |
| Trailing-newline injection on URI / FILE / ARN | `passesShapeCheck` trims before validating; embedded `\n` rejected by `[^\s]`/char-class. Not a finding. |
| `requiresAnyOf: []` empty array | `.length > 0` guard → `anyOfSatisfied` stays true → only `requires`-gated. No shipped provider uses it. Not a finding. |
| `fileEvidenceOk([])` / `fileVarsOf([])` | `.every` over empty array → vacuously true, no throw. Correct for the 10 shipped providers (none carry a `*_FILE` in `requires`). Not a finding. |
| `best`-group reduce tie-breaking | Ties resolve to the first group (`a`) — order-stable, deterministic. Not a finding. |
| `collectFileEvidence` only probes SET file vars | An unset file var → `missing` bucket handles it (no evidence key needed). Consistent; no double-count, no gap. Not a finding. |
| `tsconfig.json` change (outside `test/`) | Adds `"exclude": [… "test/**/__fixtures__/**"]` — keeps the deliberately-malformed `.tsx` fixtures out of the project tsc. Benign, scoped to PR's own fixtures. Not a finding. (Touched by the original feat commit, not the R5b fix, which is correctly `test/`-only.) |
| Worktree state after mutations | `git status --short` empty — all mutations reverted, no stray edits. |
| Determinism | Re-running both specs is byte-stable; all helpers are pure `.every`/`.some`/`.reduce` over deterministic inputs. |

---

## 7. RULE VERIFICATION
| Rule | Result | Evidence |
|---|---|---|
| **R3 identity** | **PASS** | `gh api …/pulls/465/commits`: all 7 PR commits author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. (The `868000088…` GitHub-bot commit is a prior merged PR on main, not in PR #465's commit list.) |
| **R75 banned tokens** | **PASS** | `git diff 5b8acb1~1...fec7073b` added lines grepped for `claude\|anthropic\|co-authored\|assistant\|ai-generated` → empty. R5b commit body clean. |
| **R5b file boundary** | **PASS** | `fec7073b` touches exactly `provider-wiring.ts` + the AWS spec, both under `test/prod-readiness/`. |
| **R40 assertions** | **PASS** | All new JWT/AWS assertions are value-equality (`toBe`/`toEqual`/`toContain`). No `toBeTruthy/Falsy/not.toThrow`. The 4 `toBeUndefined()` are field-absence value assertions (see §6). No `.skip/.only/xit/fit/it.todo`. |
| **LOC-EXEMPT** | **PASS** | `[LOC-EXEMPT] test-tree only` present in `fec7073b` body; scope under `test/prod-readiness/`. |
| **Imports** | **PASS** | `provider-wiring.ts` imports only `fs`, `path`, `typescript`. |
| **tsc** | **PASS** | EXIT 0 at `fec7073b`. |

---

## SUMMARY
PR #465 @ `fec7073b` is sound. The R5b fix is minimal test+comment hygiene that closes both prior P3 findings without altering any classification behavior (empty-string still rejected via segment-count; `isPathShaped` comment now matches its loose regex). Live tsc + 203 passing jest assertions + 4 live mutations confirm every soundness gate (JWT type guard, role hard-gate, `fileEvidenceOk` on both `requires` and `requiresAnyOf`, IRSA-strict) discriminates against its own regression. No fail-open reaches WIRED in the production edge. R3/R75/R40/LOC/imports/boundary all pass.

**VERDICT: CLEAN — 0 findings.**

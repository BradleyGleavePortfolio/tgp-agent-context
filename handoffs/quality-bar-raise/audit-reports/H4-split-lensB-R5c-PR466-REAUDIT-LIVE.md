# H4 Split R5c — Lens B RE-AUDIT (adversarial) — PR #466 (H4.F auto-flipper)

- **Verdict: NOT CLEAN — 1 finding (1×P3)**
- Lens: **B — breadth / cross-file consistency / contracts / doc-vs-impl parity / public-API surface / doctrine**
- Model: GPT-5.5 (adversarial auditor mandate — "find ANY AND ALL problems… rank them, then passover again — angrily")
- Repo: `BradleyGleavePortfolio/growth-project-backend`, PR `#466`, branch `wave-h4f-auto-flipper`
- **Audited head: `680db783d1f365524dc5f7ddbed7583adf5f7d15`** (post-R5c fixer) — matches required SHA.
- Base / last shared ancestor: `868000088fab1fc5929e02291bec4d4928e99aaf` (H4.A merge on the stacked branch).
- Audit time: `2026-06-24`.

---

## Bottom line

All **five** R5b defects the R5c fixer was tasked to close are **confirmed closed and proven by tests** (263/263 green, tsc clean, mutation-discrimination verified live). The fixer's delta (d62a5cf..680db78) is minimal, scoped to `test/prod-readiness/`, and well-commented.

The substance is sound. However, the angry passover surfaced **one genuine breadth defect the R5c fixer introduced**: the new defense-in-depth gate inside `runFlyctl` reads `process.env` directly, while the existing `commit()` outer gate reads the documented injectable `opts.env ?? process.env`. This is a **two-source authorization drift** on the security-critical mutation path — exactly the class the Lens B mandate told me to hunt ("no two-gate drift"). It is **fail-closed** (no security regression) but it creates an **undocumented coupling on the public `CommitOptions.env` option**, already visible as test-setup friction in the fixer's own spec. Under the strict zero-finding doctrine applied to every prior round of this PR, it should be closed (one-line docstring or one-line gate change).

### R5c closure verification (all five CONFIRMED closed)

| R5b defect | Closure check @ 680db78 | Status |
|---|---|---|
| R5b-F001-LensA (P2) — indent-digit comment poisoning leak | `YAML_BLOCK_SCALAR_INDENT_DIGIT_RE.exec(m[3])` (`:642`) now runs against the **indicator token only** (HEADER_RE group 3), never the whole line. HEADER_RE group 3 widened to a capture `([|>]…)` (`:625`); the `[ \t]*(?:#.*)?$` tail consumes the comment *outside* group 3, so `PASSWORD: >- # see \|9` yields `m[3]="\>-"` → digit 0 → no floor inflation. **Mutation check: reverting `m[3]`→`lines[i]` turns 4 poison spec cases red (live-confirmed).** | ✅ CLOSED |
| R5b-F002-LensB (P2) — stale `commit()` docstring | Docstring (`:1063-1069`) rewritten: *"An ordinary failing flip does not abort the rest… However, a fatal security signal — `FlyBinIdentityMismatch` … or `FlyctlTimeoutError` … aborts the commit immediately (fail-closed) and propagates… The mutex is released in both the success and abort paths."* Accurately states abort behavior for both error types; semantically mirrors the catch-site SECURITY comment (`:1171-1176`). R125 surface parity holds (see Passover note). | ✅ CLOSED |
| R5b-F003-LensA / R5b-F001-LensB (P3) — duplicated SECURITY comment | Exactly **one** `SECURITY (F002)` paragraph remains (`grep` → single hit at `:1171`). Duplicate deleted. | ✅ CLOSED |
| R5b-F002-LensA (P3) — ungated `__runFlyctlForTest` primitive | Defense-in-depth gate added at the TOP of `runFlyctl` (`:899-901`): `if (!autoFlipEnabled(process.env)) throw …`. Seam routes through `runFlyctl` and inherits it. New spec asserts the seam refuses + `execFileSync` never called when env unset (`auto-flipper.spec.ts:386-401`). | ✅ CLOSED |
| R5b-F003-LensB (P3) — seam form divergence + over-claiming docstring | `__runFlyctlForTest` converted from `export const = runFlyctl` alias to `export function __runFlyctlForTest(args): void { runFlyctl(args); }` (`:943-945`) — now matches the 6 pre-existing `export function __…ForTest` seams in FORM. Docstring corrected to *"function (not a `const` alias)… in form, not only in name."* No longer over-claims. | ✅ CLOSED |

### Doctrine / hygiene gates (all PASS)

- **R3 identity:** all 7 PR commits — author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` (`2a58c17, de43a17, 3c8b828, b2d1096, c624492, d62a5cf, 680db78`). ✅
- **R75 banned tokens:** `git diff 868000088..HEAD | grep -iE '^\+.*(claude|anthropic|co-authored|assistant|ai-generated)'` → empty. ✅
- **File boundaries / [LOC-EXEMPT]:** diff bounded to the 3 `test/prod-readiness/` files (auto-flipper.ts, auto-flipper.spec.ts, redactor.spec.ts). All test-tree → genuine prod LOC = 0; `[LOC-EXEMPT]` enforced at the live PR title per H4.A/B/C/D/E/G precedent. ✅
- **Public-API surface (R5c delta vs R5b head):** ONLY change is `__runFlyctlForTest` `export const` → `export function` (same name, same signature, same arity). `runFlyctl` stays module-private. Nothing else added/removed/re-exported. Tree-wide grep: `__runFlyctlForTest` imported ONLY by `auto-flipper.spec.ts`; no barrel/index re-export of `runFlyctl`. ✅
- **Other `__…ForTest` seams:** the 6 pre-existing seams (`__resolveFlyBinForTest`, `__getResolvedFlyBinPathForTest`, `__getResolvedFlyBinIdentityForTest`, `__resetResolvedFlyBinForTest`, `__seedResolvedFlyBinPathWithoutIdentityForTest`, `__resetFlyBinWarnedForTest`, `:286-345`) are all read/reset/resolve helpers over cached resolution state — **none execute flyctl or mutate secrets.** `runFlyctl` is the only mutating primitive, now gated. No other ungated-primitive seam. ✅
- **Spec hygiene:** no `.only`/`.skip`/`xit`/`fit`/`xdescribe`/`fdescribe` in either changed spec. New redactor poison cases use value-equality `.toBe(...)` (R40) incl. both with- and without-`secretValues` variants + boundary control. ✅
- **TSC:** `NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit` → exit 0, clean. ✅
- **Tests:** `jest test/prod-readiness/` → **3 suites, 263/263 passed.** ✅

---

## FINDINGS

### R5c-F001-LensB — P3 — Two-source authorization drift: `runFlyctl` gates on `process.env`, `commit()` gates on the injectable `opts.env`

- **Files:**
  - `test/prod-readiness/auto-flipper.ts:899` — `if (!autoFlipEnabled(process.env)) { throw … 'defense-in-depth gate' }` (NEW, R5c).
  - `test/prod-readiness/auto-flipper.ts:1073-1074` — `const env = opts.env ?? process.env; if (!autoFlipEnabled(env)) { throw … }` (the outer `commit()` gate).
  - `test/prod-readiness/auto-flipper.ts:811-813` — `CommitOptions.env?: NodeJS.ProcessEnv` (public, documented injection seam — but the field itself carries NO docstring about this coupling).

- **Defect:** Both gates call the SAME predicate `autoFlipEnabled(...)` (so the mandate's "no copy-pasted predicate" check passes) — **but they feed it DIFFERENT environment sources.** The outer `commit()` gate honors a caller-supplied `opts.env`; the new inner `runFlyctl` gate ignores `opts.env` and reads `process.env` unconditionally. The two gates therefore answer the same logical question ("is auto-flip authorized?") against two different inputs within a single `commit()` call.

- **Why it's broke (breadth/contract):** `CommitOptions.env` is a public, documented injection point. A caller who authorizes via the documented contract — `commit({ plan, env: { READINESS_AUTO_FLIP: 'true' } })` — **and uses the default runner** (no `opts.run` override) passes the outer gate, enters `doCommit`, and then has EVERY row rejected by the inner `runFlyctl` gate (because real `process.env` lacks the flag). Those rejections are not `FlyBinIdentityMismatch`/`FlyctlTimeoutError`, so they are caught and recorded in `failed[]` with the opaque message `runFlyctl: READINESS_AUTO_FLIP is not enabled (defense-in-depth gate)` — neither the clean outer refusal nor a mutation. The documented `env` injection is silently insufficient for a real-runner commit; an additional, undocumented `process.env` precondition exists.
  This is not theoretical: the R5c fixer's own spec had to add `useAutoFlipEnv()` (which sets `process.env[AUTO_FLIP_ENV]`) to **every** default-runner describe block — including `commit timeout via default runner aborts (re-throws)…` at `auto-flipper.spec.ts:1056`, which calls `commit({ plan: p, env: ENABLED_ENV })` and only works because `process.env` is ALSO set by the hook. That setup friction is the drift surfacing in practice.

- **Severity rationale (P3, not P2):** The divergence is strictly **fail-closed** — the inner gate is purely *additive/stricter*, reading the authoritative real environment. It can NEVER cause an unintended mutation (the reverse case, `process.env` enabled + `opts.env` disabled, is blocked first by the outer gate). In production `opts.env` is never supplied, so both gates see the same `process.env` and the coupling is invisible. No security regression; the cost is contract clarity + maintainer confusion. Hence P3, but a real finding under the zero-finding doctrine.

- **Repro:**
  ```
  git show HEAD:test/prod-readiness/auto-flipper.ts | sed -n '899p;1073,1074p'
  # 899:    if (!autoFlipEnabled(process.env)) {           <- inner, real env
  # 1074:   if (!autoFlipEnabled(env)) {  (env = opts.env ?? process.env)  <- outer, injectable
  ```
  Behavioral repro (conceptual): `commit({ plan: <nonempty to_set>, env: { READINESS_AUTO_FLIP: 'true' } })` with `process.env.READINESS_AUTO_FLIP` unset and no `opts.run` → returns with all rows in `failed[]` carrying the `defense-in-depth gate` message; no clean refusal, no mutation.

- **Recommended fix (pick one, one line):**
  - **(a) Document the coupling (lowest churn):** add a docstring to `CommitOptions.env` stating that the real (`execFileSync`) runner's defense-in-depth gate always consults `process.env`, so a real-runner commit requires the flag in the *process* environment regardless of `opts.env`. This makes the two-source behavior an explicit contract rather than a surprise.
  - **(b) Single-source the authorization (cleaner):** pass the already-resolved authorization down to `doCommit`/the runner so the inner belt-and-suspenders gate consults the same `env` the outer gate used (or make the inner gate a no-op assertion documented as "reachable only via the seam"), eliminating the divergence entirely.
  Either closes the finding; (a) is the minimal one-line change consistent with the rest of this PR.

---

## Passover #2 (angry re-read — items explicitly checked and CLEARED)

- **R125 docstring↔comment parity:** `commit()` docstring (`:1063`) and catch-site SECURITY comment (`:1171`) are **semantically identical** (both name `FlyBinIdentityMismatch` + `FlyctlTimeoutError`, both say fail-closed / abort / propagate). The mandate's "byte-equivalent" phrasing is a verification aid, not a requirement; R125 "identical surface" is about behavior described consistently, which holds. NOT a finding.
- **F001 grammar parity:** HEADER_RE group 3 `[|>](?:[+-][1-9]?|[1-9][+-]?)?` is byte-identical in grammar to VALUE_RE's indicator `([|>])(?:([+-])([1-9])?|([1-9])([+-])?)?`. Both enforcers (pass f / pass h) recognize the same surface. `INDENT_DIGIT_RE` against `m[3]` correctly extracts the digit for every legal form (`\|`, `\|-`, `\|2`, `\|-2`, `\|2-`, `\>+1`, `\>1+`) and 0 for bare/chomp-only. Adversarial inputs (`#>9`, `# x \|8 y`, `# see \|9`, `# ref >5`) all neutralized — live-confirmed via mutation. No residual leak in the changed grammar.
- **Seam form parity:** `__runFlyctlForTest` (`export function`, `:943`) now matches all 6 siblings (`:286-345`) in form, not only name. Docstring no longer over-claims. ✅
- **Mutex release on abort:** `try { await prev; return await doCommit } finally { release() }` (`:1085-1090`) unchanged by R5c — `finally` fires on the new abort-throw path. (Brief rule R-mutex: untouched, as required.) ✅
- **`__runFlyctlForTest` "only consumed by auto-flipper.spec.ts":** tree-wide grep confirms the claim. ✅
- **No secret values in new fixtures:** poison fixture uses synthetic `SuperSecretValue_abc`; R2 error-path tests use `sk_test_FAKE_DO_NOT_REPLACE_R2`. No real secret echoed. ✅
- **AUDIT_OPERATOR = 'Bradley Gleave'** (`:35`) — operator's real name, not a banned R75 token; pre-existing, not an R5c change. ✅

---

## Build / test evidence

```
git rev-parse HEAD            → 680db783d1f365524dc5f7ddbed7583adf5f7d15
npm ci                        → exit 0
jest test/prod-readiness/     → 3 suites, 263 passed, 263 total
tsc --noEmit (8 GB heap)      → exit 0 (clean)
Mutation discrimination       → revert INDENT_DIGIT_RE.exec(m[3])→(lines[i]): 4 poison cases RED (confirmed)
R3 author/committer           → Bradley Gleave <bradley@bradleytgpcoaching.com> (all 7 commits)
R75 banned-token diff scan    → empty
Public-API delta (R5c)        → __runFlyctlForTest: export const → export function (only change)
```

## Recommendation

The five R5b defects are correctly and provably closed; the security substance of this PR is sound and fully tested. **Close R5c-F001-LensB (P3)** before merge — a one-line docstring on `CommitOptions.env` (fix option a) or a one-line single-sourcing of the inner gate (option b) resolves the only outstanding two-source authorization drift. It does not undermine any of the five closures.

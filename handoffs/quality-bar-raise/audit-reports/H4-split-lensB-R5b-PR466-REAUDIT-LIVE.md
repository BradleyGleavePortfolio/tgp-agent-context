# H4 Split R5b — Lens B RE-AUDIT (adversarial) — PR #466 (H4.F auto-flipper)

- **Verdict: NOT CLEAN — 3 findings (1×P2, 2×P3)**
- Lens: **B — breadth / cross-file consistency / contracts / doc-vs-impl parity / public-API surface / doctrine**
- Model: GPT-5.5 (adversarial auditor mandate)
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- PR: `#466`, branch `wave-h4f-auto-flipper`
- **Audited head: `d62a5cf9a9ae59e80093ebff79c2cd94b2f49c93`** (post-R5 fixer) — matches required SHA.
- Base: `main` @ `8680000` (last shared ancestor on the stacked branch is the H4.A merge `8680000`)
- Audit time: `2026-06-24T~04:30Z`
- Mandate: "find ANY AND ALL problems… breakdown why things are broke, rank them, then passover again — angrily." Not a rubber-stamp.

---

## Bottom line

The three R5 fixes (R5-F001 YAML grammar parity, R5-F002 fatal-signal abort, R5-F003 `runFlyctl` unexport) are **functionally closed and proven by tests** (256/256 green, tsc clean). The R5 fixer was clean on substance. **However, it shipped three quality defects of its own** — one of which (F002 below) is a **public-contract doc-vs-impl drift on the exported `commit()` function** that actively misrepresents the new security-critical abort behavior to anyone reading the contract. Under the strict zero-finding doctrine applied to the sibling waves, these must be closed before merge.

### R5 closure verification (all three CONFIRMED closed)

| R5 finding | Closure check | Status |
|---|---|---|
| R5-F001 (YAML header+comment leak) | `YAML_BLOCK_SCALAR_VALUE_RE` (`:389`) now `/^([\|>])(?:([+-])([1-9])?\|([1-9])([+-])?)?[ \t]*(?:#.*)?$/` — indicator + `[ \t]*(?:#.*)?$` tail are now **byte-for-byte the same surface** as `YAML_BLOCK_SCALAR_HEADER_RE` (`:624`). R125 "identical surface" invariant is now actually true. 7 new redactor cases assert no-leak incl. bare-header regression. | ✅ CLOSED |
| R5-F002 (fatal signal swallowed) | `doCommit` per-row catch (`:1159`) re-throws `FlyBinIdentityMismatch`/`FlyctlTimeoutError`; ordinary errors still continue per-row. Mutex `commit()` (`:1057-1067`) uses `try/…/finally release()`, so abort still releases the lock (test #11 proves a subsequent `commit()` proceeds). | ✅ CLOSED |
| R5-F003 (`runFlyctl` exported+ungated) | `runFlyctl` demoted to module-private (`:887`, no `export`); only gated `commit()`/`flip()` plus `__runFlyctlForTest` seam (`:926`) are exported. Repo-wide tree grep: **no module imports `runFlyctl`; no barrel/index re-export.** Spec #12 asserts `Object.keys(exports)` excludes `runFlyctl`. | ✅ CLOSED |

### Doctrine / hygiene gates (all PASS)

- **R3 identity:** all 6 PR commits — author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. (2a58c17, de43a17, 3c8b828, b2d1096, c624492, d62a5cf) ✅
- **R75 banned tokens:** `git diff 8680000..HEAD | grep -iE '^\+.*(claude|anthropic|co-authored|assistant|ai-generated)'` → empty. ✅
- **[LOC-EXEMPT] / R76:** net +3454 LOC (>400 cap). The CI gate (R100.A3, `r100-quality-gate.yml:156-181`) reads the **live PR title**, which carries an operator-signed `[LOC-EXEMPT: …]` matching the H4.A/B/C/D/E/G precedent. ✅ (Note: the mandate's "every commit must carry [LOC-EXEMPT]" is satisfied at the correct enforcement point — the PR title, not the commit body.)
- **File boundaries:** diff bounded to the 3 `test/prod-readiness/` files. ✅
- **Public API surface diff (R5-only):** removed `export` from `runFlyctl`; added `export const __runFlyctlForTest`. Exactly the operator-approved Option-2 surface change; nothing else added/removed. ✅
- **TSC:** `tsc --noEmit` (6 GB heap) → clean, exit 0. ✅
- **Tests:** `jest test/prod-readiness/` → **3 suites, 256/256 passed** (auto-flipper.spec 198 incl. redactor.spec, full dir 256). ✅

---

## FINDINGS

### R5b-F001-LensB — P3 — Duplicated SECURITY comment block in `doCommit` catch (copy-paste artifact)

- **File:** `test/prod-readiness/auto-flipper.ts:1146-1158`
- **Defect:** The R5 fixer's F002 catch carries the **exact same 6-line `// SECURITY (F002): …` comment twice, verbatim**, immediately before the `if (err instanceof FlyBinIdentityMismatch || …)` guard. This is a pure copy-paste artifact introduced by commit `d62a5cf` (visible in the diff hunk as two identical comment paragraphs).
- **Why it's broke:** Dead/duplicated documentation on the single most security-sensitive branch in the module. A maintainer diffing this block will wonder whether the second paragraph was meant to describe a *second* condition that got dropped — it invites exactly the kind of misread the R5 fixer was trying to prevent. Sibling waves (H4.A/D) carry no such duplication; this is parity drift.
- **Repro:** `git show HEAD:test/prod-readiness/auto-flipper.ts | sed -n '1146,1158p'` → two identical `SECURITY (F002)` paragraphs.
- **Fix:** Delete the duplicate paragraph (keep one copy of lines 1147-1152).

### R5b-F002-LensB — P2 — Stale public contract on exported `commit()`: "One failing flip does not abort the rest" is now FALSE

- **File:** `test/prod-readiness/auto-flipper.ts:1044` (docstring on `export async function commit`)
- **Defect:** The contract docstring states verbatim: *"Runs strictly sequentially … One failing flip does not abort the rest."* As of this same PR's R5-F002 change, that blanket guarantee is **no longer true**: a `FlyBinIdentityMismatch` (binary-swap refusal) or `FlyctlTimeoutError` (host hang) now **aborts the entire commit and propagates** — the remaining rows are NOT attempted. The docstring was not updated to reflect the behavior the fixer deliberately introduced.
- **Why it's broke:** This is a doc-vs-impl parity violation on the **exported public mutation entry point**. An operator or maintainer reading the contract is actively misled into believing a swapped/attacker binary is recorded as a benign per-row `failed[]` entry while the loop continues — which is precisely the dangerous mental model R5-F002 was filed to kill. The implementation is now correct; the contract that documents it lies. Lens B's doc-vs-impl mandate (item 9) makes this a flag, and because it concerns the security-critical abort semantics on a public symbol, it rates P2 rather than P3.
- **Repro:** `git show HEAD:test/prod-readiness/auto-flipper.ts | sed -n '1040,1046p'` vs the catch at `:1159` that re-throws.
- **Fix:** Qualify the sentence, e.g. *"An **ordinary** failing flip does not abort the rest; a fatal security signal (`FlyBinIdentityMismatch`) or a `FlyctlTimeoutError` aborts the commit immediately (fail-closed) and propagates to the caller."* Mirror the wording already present in the catch comment at `:1147-1152` so contract and implementation describe the same surface (the very R125 "identical surface" principle this PR claims to uphold).

### R5b-F003-LensB — P3 — Test-seam convention divergence: `export const` alias vs the module's `export function __…ForTest` pattern

- **File:** `test/prod-readiness/auto-flipper.ts:926` (`export const __runFlyctlForTest = runFlyctl;`), docstring `:919-925`
- **Defect:** The mandate required confirming the new seam matches existing test-seam patterns. It does **not**, in form: all six pre-existing seams in this module are **function declarations** — `export function __resolveFlyBinForTest(...)`, `__getResolvedFlyBinPathForTest`, `__getResolvedFlyBinIdentityForTest`, `__resetResolvedFlyBinForTest`, `__seedResolvedFlyBinPathWithoutIdentityForTest`, `__resetFlyBinWarnedForTest` (`:286-343`). The new one is a **`const` reference alias**. The seam's own docstring (`:924`) claims it is *"matching the existing `__…ForTest` convention"* — which is true in spirit (a `__`-prefixed test-only export) but not in form (alias, not function wrapper).
- **Why it's (mildly) broke:** Convention drift the mandate explicitly asked to surface. Functionally sound — `runFlyctl` is a hoisted, never-reassigned function declaration, so the alias binding is stable and the spec exercises it green. No runtime risk; the divergence is stylistic + a slightly over-claiming docstring.
- **Repro:** compare `:926` against `:286`/`:291`/`:296`/`:304`/`:314`/`:343`.
- **Fix (optional, low priority):** Either (a) make it a wrapper for form-parity: `export function __runFlyctlForTest(args: readonly string[]): void { runFlyctl(args); }`, or (b) soften the docstring to "test-only export (`__…ForTest` naming), aliasing the module-private `runFlyctl`" so it doesn't over-claim form parity. Author's discretion — flagged per mandate, not blocking on its own.

---

## Passover #2 (angry re-read — items explicitly checked and cleared)

- **Grammar parity, adversarial inputs:** `|`, `>`, `|-`, `|+`, `|2`, `|-2`, `|2-`, each ± trailing ` # comment` — VALUE_RE and HEADER_RE agree on every form. Bare `PASSWORD: |-` (header only, no body) is preserved literally, not rewritten to `***` (regression test asserts it). No asymmetry found.
- **Error-type name consistency (R5-F002 mandate):** exactly one spelling each — `FlyBinIdentityMismatch` (class `:133`, throw sites, `instanceof` guard `:1159`, specs) and `FlyctlTimeoutError` (class `:663`). No `…Error`/non-`Error` drift. Specs assert `.rejects.toThrow(FlyBinIdentityMismatch)` / `toBeInstanceOf(FlyctlTimeoutError)` — the re-throw is asserted `instanceof` the documented class. ✅
- **Mutex release on abort:** `try { await prev; return await doCommit } finally { release() }` — finally fires on throw; test #11 confirms no permanent lock. ✅
- **`runFlyctl` reachability:** module-private; `opts.run ?? runFlyctl` (`:1072`) is the only internal default-runner use; `:808` docstring reference is accurate. No external caller, no re-export. ✅
- **No `.only`/`.skip`/assertion-free tests** introduced in the R5 spec additions. ✅
- **No secret values** echoed in any new test fixture or assertion message. ✅

## Build / test evidence

```
git rev-parse HEAD            → d62a5cf9a9ae59e80093ebff79c2cd94b2f49c93
tsc --noEmit                  → exit 0 (clean; required --max-old-space-size=6144, large NestJS project)
jest test/prod-readiness/     → 3 suites, 256 passed, 256 total
  - auto-flipper.spec.ts + redactor.spec.ts → 198 passed
R3 author/committer           → Bradley Gleave <bradley@bradleytgpcoaching.com> (all 6 commits)
R75 banned-token diff scan    → empty
```

## Recommendation

Close **R5b-F002-LensB (P2)** before merge — it is a one-line docstring correction but it concerns the public contract of the security-critical abort path. **R5b-F001-LensB (P3)** delete-the-duplicate-comment is trivial and should ride along. **R5b-F003-LensB (P3)** is author's discretion. None of the three undermine the three R5 fix closures, which are correct and fully tested.

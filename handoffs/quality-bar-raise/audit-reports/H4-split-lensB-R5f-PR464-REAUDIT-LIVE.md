# H4.B PR #464 — R5f RE-AUDIT (Lens B, BREADTH, GPT-5.5)

## VERDICT: CLEAN

Zero findings. The R5e fixer commit `5f074581` closes both R5d findings
(Lens A sixth-arm soundness fix + Lens B baseline removal) with discriminating
artifacts, and the full angry over-sweep surfaces no new non-discriminating
control, no R3/R75/R40/R74/LOC/import/boundary/export/determinism/double-arm
violation. The sole adjacent observation (an arguably *redundant* IIFE case) is
recorded as an over-sweep note, not a finding, because its two outcomes do
diverge on its named invariant.

---

## 1. SHA PIN + BUILD MATRIX

| Item | Value |
|---|---|
| Head audited (START) | `5f0745819dbaa9da092b54ff75967683dcc0197c` ✅ pinned |
| Head audited (END, no drift) | `5f0745819dbaa9da092b54ff75967683dcc0197c` |
| main base HEAD | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| R5e prior head | `bb5083e42922ac3e93323e743feee468d95485e9` |
| Branch | `wave-h4b-env-discovery` |
| Lens | B — BREADTH (static line-read + TS-API contract reasoning; live exec NOT required from this lens) |
| Round diff `bb5083e4..5f074581` | `env-discovery.ts` (+15/-3), `env-discovery.spec.ts` (+35/-9) |
| Build posture | Static/contract only — no transpile performed (depth/live is Lens A's mandate). TS-API reasoning against `typescript@5.9.3` (repo-pinned) semantics. |

**Topology note (carried from R5d, re-confirmed):** `8467c6f` (main HEAD) is
NOT an ancestor of `5f074581`. The brief's nominal R3 range therefore enumerates
inherited GitHub-web base commits authored by `BradleyGleavePortfolio
<bradleyapple1031@gmail.com>` / committer `GitHub <noreply@github.com>` which are
**not PR contributions** and explicitly out of scope per the R5f brief and the
Lens B R5d note. The PR's own contribution set is `c9ae7391..5f074581` (9
commits); that is the R3-relevant set and it passes in full (§5).

---

## 2. FINDINGS

**NONE.**

---

## 3. PRIOR-FINDING CLOSURE VERIFICATION

### 3a. R5d-F001-LensA (sixth arm — named FunctionExpression / ClassExpression) — **CLOSED**

New arm present in `collectStringConsts` (env-discovery.ts:392-404), AFTER all
five existing arms, BEFORE the `ts.forEachChild` recursion:

```ts
} else if (
  (ts.isFunctionExpression(node) || ts.isClassExpression(node)) &&
  node.name &&
  ts.isIdentifier(node.name)
) {
  bumpBinding(node.name.text);
}
```

**Contract proof (item 12 — CONFIRMED).** For
`const K='FOO'; const f = function K(){ return process.env[K]; };`:
- Outer `const K` → `VariableDeclaration` arm → `bumpBinding("K")` → K=1.
- `const f` → `VariableDeclaration` arm → `bumpBinding("f")` → f=1.
- RHS `function K(){…}` parses as `FunctionExpression` with
  `.name = Identifier{ text: "K" }`. It satisfies neither
  `isFunctionDeclaration` nor `isClassDeclaration` (arm 4 misses it), but the
  new arm 6's `isFunctionExpression(node) && node.name && isIdentifier(node.name)`
  fires → `bumpBinding("K")` → K=2.
- K=2 → ambiguous → dropped from resolvable map → `process.env[K]` → `[]`. ✔
- **Without** the arm: K=1 → resolves `'FOO'` → `['FOO']` (the live-proven false
  positive on `bb5083e4`). Two outcomes diverge `[] ↔ ['FOO']` → the arm pins
  the invariant. **CONFIRM.**

Identical walk for `const C = class K { m(){ return process.env[K]; } }`:
`ClassExpression.name = Identifier{"K"}` → arm 6 → K=2 → `[]`. ✔

### 3b. R5d-F001-LensB (non-discriminating propertyName baseline) — **CLOSED** (item 13)

The misleading-title baseline
(`'does not count propertyName: a renamed-only destructure with no string source resolves []'`,
`const {x:K}=o; process.env[K] → []`) is **REMOVED** (grep `renamed-only
destructure` → not present). The paired discriminating case
(`'…a file-scope const named by propertyName still resolves cleanly'`,
`const {x:K}=o; const x='FOO'; process.env[x] → ['FOO']`) **PERSISTS** at
spec:1107 and retains full propertyName-discrimination coverage (if `x` were
wrongly counted via propertyName, x=2 → dropped → `['FOO']` flips to `[]`).
Removal is the cleaner of the two fixes Lens B offered. **CONFIRM.**

### 3c. Carried prior closures (regression spot-check, contract)

| Round | Finding | Artifact @ 5f074581 | Status |
|---|---|---|---|
| R4 (LensA P2) | `Parameter` un-counted | `isParameter` arm | ✅ present |
| R5 (LensA P2) | `BindingElement` un-counted | `isBindingElement` arm | ✅ present |
| R5b (LensA P3) | Func/Class/Enum/Module `.name` un-counted | 4-decl arm w/ `node.name && isIdentifier` | ✅ present |
| R5b (LensB P3) | propertyName regression non-discriminating | discriminating case spec:1107 | ✅ present |
| R5c (LensA P3) | `ImportEqualsDeclaration` un-counted | 5th arm | ✅ present |
| R5c (LensB P3) | `declare module "x"` control non-discriminating | replaced by `declare module "FOO"`/`'BAR'` spec:1197 | ✅ present |
| R5d (LensA P3) | named Func/Class **expression** un-counted | 6th arm spec-backed | ✅ **closed this round** |
| R5d (LensB P3) | propertyName baseline non-discriminating | baseline removed | ✅ **closed this round** |

No prior closure regressed.

---

## 4. NEW R5e SPEC CASES — DISCRIMINATION CONTRACT (item 3, R40)

All four new `it` cases assert value-equality `expect([...extractEnvVarRefs(code)]).toEqual([...])` (R40 ✔).

| Case (spec line) | Shape | Asserts | Drop-arm-6 mutant | Diverges? |
|---|---|---|---|---|
| named FunctionExpression `:1208` | `const f = function K(){…env[K]}` | `[]` | K=1 → `['FOO']` | ✅ |
| named ClassExpression `:1216` | `const C = class K { m(){…env[K]} }` | `[]` | K=1 → `['FOO']` | ✅ |
| named IIFE FuncExpr `:1224` | `(function K(){…env[K]})()` | `[]` | K=1 → `['FOO']` | ✅ |
| anonymous FuncExpr control `:1234` | `const f = function(){…env[K]}` | `['FOO']` | drop `node.name &&` half → `isIdentifier(undefined)` throws → red | ✅ (pins guard-half) |

The anonymous control discriminates the *other* half of the arm guard
(`node.name &&`): with the guard dropped, `ts.isIdentifier(undefined)` throws on
the anonymous form, so the case fails red. Both halves of the new arm are pinned.

---

## 5. BREADTH SWEEP TABLE

| Axis | Scope | Result |
|---|---|---|
| **R3 author+committer** | PR commits `c9ae7391..5f074581` (9) | ✅ all `Bradley Gleave <bradley@bradleytgpcoaching.com>` on both an/cn (incl. new `5f074581`) |
| **R3 body/trailer tokens** | bodies of the 9 PR commits | ✅ NONE (`claude/anthropic/assistant/co-authored/\bAI\b/agent/copilot/gpt` → none) |
| R3 (base-ancestor caveat) | inherited `868000088…` etc. | ⚠ GitHub-web base commits by `BradleyGleavePortfolio` — not PR work, out of scope per brief + R5d topology note. Not a finding. |
| **R75 banned tokens** | added lines `bb5083e4..5f074581` | ✅ NONE |
| **R40 assertions (new cases)** | 4 new `it` | ✅ all `expect([...extractEnvVarRefs(code)]).toEqual([...])` value-equality |
| **R74 ratio** | added lines `bb5083e4..5f074581` | ✅ test +35 / prod +15 = **2.33×** ≥ 2.0 (matches fixer-reported 2.33×) |
| **LOC budget marker** | commit body | ✅ `[LOC-EXEMPT] test-tree only` present; whole diff under `test/prod-readiness/` |
| **File boundaries** | round diff | ✅ ONLY `env-discovery.ts` + `env-discovery.spec.ts` |
| **Imports** | `env-discovery.ts` added lines | ✅ zero new top-level imports (arm uses existing `ts.*`) |
| **Exported contract** | `env-discovery.ts` | ✅ `collectStringConsts` + `countBindings` (local closure) both un-exported |
| **Determinism** | counting | ✅ Map-based `bumpBinding` + `ts.forEachChild` walk; order-independent counts, deterministic Set output |
| **Double-arm match (item 11)** | 6 arms | ✅ `FunctionExpression`/`ClassExpression` kinds match no other arm; `if/else-if` short-circuits regardless → single match, no double-count |
| **Secret leakage** | new spec literals | ✅ only `'FOO'`, ids `K/C/f/v/m` — no secrets |
| **CI surface** | round diff | ✅ no `.yml`/workflow/`package.json`/`tsconfig` touched |
| **Comment hygiene (Change 4)** | `collectStringConsts` block comment | ✅ updated FIVE→SIX with FunctionExpression/ClassExpression enumerated |

---

## 6. ANGRY OVER-SWEEP NOTES (considered, all rejected as non-findings)

- **IIFE case `:1224` is redundant with named-FuncExpr case `:1208`.** Both are
  `FunctionExpression` with `name=Identifier{"K"}`; the parenthesize-and-call
  wrapper changes nothing at the binding layer — same arm, same mechanism, same
  `K=2 → []`. *Considered as a non-discrimination finding and REJECTED:* the
  operator criterion is "two outcomes don't diverge on its named invariant."
  The IIFE case's outcomes DO diverge under the arm-drop mutant
  (`[] ↔ ['FOO']`). Redundant ≠ non-discriminating. The brief required ≥3 new
  cases; 4 were added; the extra costs nothing and the LOC budget is exempt.
  Not a finding.

- **Anonymous default export controls `:1181`/`:1190`** (`export default
  function(){}` / `export default class {}` + `const K='FOO'` → `['FOO']`,
  titled "no throw, no pollution"). The "no pollution" half is non-discriminating
  *in isolation* (an anonymous declaration can never introduce a `K`-named
  binding to pollute). *Considered and REJECTED* (same disposition as R5d): the
  "no throw" half IS discriminating — drop the arm-4 `node.name &&` guard and
  `ts.isIdentifier(undefined)` throws on the nameless declaration, failing the
  case red. The case is load-bearing on the guard-half, pre-existing, and
  out of R5e diff scope. Not a finding.

- **Pre-existing "does not …" controls** (`:122`, `:587`, `:833`, `:1500`, etc.):
  spot-checked titles; all are name-resolution / non-string-key / rest-element /
  wrapper-rejection controls vetted across five prior rounds by two lenses. No
  newly-surfaced non-discrimination. Out of R5e scope. Not findings.

- **R74 prod-LOC composition.** Prod `+15` includes ~3 comment lines (FIVE→SIX
  block update) + the arm. *Considered* whether comment-line inflation of the
  denominator masks a sub-2.0 code ratio — REJECTED: comments inflate the
  *denominator*, which would only *lower* the ratio; the reported 2.33× is thus
  conservative, and even arm-code-only the ratio stays ≥2.0. Not a finding.

- **Contract re-walk of item 12 (angry pass).** Re-verified that
  `function K(){…}` as a `const f =` RHS is a `FunctionExpression` (not a
  `FunctionDeclaration` — declarations require statement position), so arm 4
  genuinely missed it pre-R5e and arm 6 genuinely catches it now. The divergence
  (`[]` with arm vs `['FOO']` without) is real and pins the invariant. CONFIRM.

---

## 7. CONCLUSION

`5f074581` is a clean, minimal, test-tree-only fix that closes both R5d findings
with discriminating coverage and introduces no new defect across any swept axis.
**VERDICT: CLEAN — 0 findings.**

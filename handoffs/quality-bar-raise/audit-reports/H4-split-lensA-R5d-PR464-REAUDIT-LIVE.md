# H4.B Env-Discovery — Lens A (DEPTH, Opus 4.8) — R5d RE-AUDIT (Round 4, post-R5c-fixer)

- **PR:** #464 (TGP Wave 1, H4.B env-discovery)
- **Head SHA audited (start AND end):** `bb5083e42922ac3e93323e743feee468d95485e9` ✅ pinned, re-confirmed unchanged at end (R124)
- **main base SHA:** `8467c6f568a51337a7acbfb14f72ac85b996d605`
- **Branch:** `wave-h4b-env-discovery`
- **Lens role:** DEPTH — compile + EXECUTE the scanner against adversarial counter-examples; source comments' self-claims NOT trusted.
- **Method:** TS `5.9.3` installed (matches repo `typescript@5.9.3` exactly), prod `env-discovery.ts` transpiled to CommonJS with a stubbed `registry-loader`, `extractEnvVarRefs` exercised live + mutation-tested against `bb5083e4`.
- **Round history:** R4 Parameter (closed `67ade350`) → R5 BindingElement (closed `2b45c39e`) → R5b Function/Class/Enum/Module decl-name + propertyName control (closed `36a0aba4`) → R5c ImportEqualsDeclaration + module-name control (closed `bb5083e4`). Each round revealed one binder-family deeper.

---

## VERDICT: FINDINGS

**1 finding — `R5d-F001-LensA` (P3, SOUNDNESS / false positive).** The angry depth sweep found the **NEXT binder-family deeper**, exactly as the mandate predicted: **named `FunctionExpression` / `ClassExpression`** introduce an Identifier-named value binding scoped to their own body that can legally shadow a same-named file-scope `const`, and `countBindings` does **not** count them (it only counts `FunctionDeclaration`/`ClassDeclaration`). Live-proven false positive `["FOO"]` on the audited SHA. Same defect class as every prior accepted round, one family deeper.

Both R5c arms (ImportEqualsDeclaration prod arm + the replaced `declare module "FOO"` control) are **confirmed discriminating** by live mutation. All prior ledger cases (R4/R5/R5b/R5c) **regression-green**. The R5c fix itself is correct and complete for the family it targeted.

---

## R5d-F001-LensA (NEW, P3 — SOUNDNESS / FALSE POSITIVE) — named function/class **expressions** are an uncounted value-introducing binder

### What
`countBindings` (env-discovery.ts:349-396) counts five binder kinds across five arms:
1. `VariableDeclaration` (incl. catch / for-of / for-in vars)
2. `Parameter` (R4)
3. `BindingElement` (R5)
4. `FunctionDeclaration | ClassDeclaration | EnumDeclaration | ModuleDeclaration` (R5b)
5. `ImportEqualsDeclaration` (R5c)

Arm 4 matches **declarations** only. A **named function expression** (`const f = function K(){…}`) parses as `ts.FunctionExpression`, and a **named class expression** (`const C = class K {…}`) parses as `ts.ClassExpression` — **neither satisfies `ts.isFunctionDeclaration` / `ts.isClassDeclaration`**, so arm 4 never fires for them. Yet both introduce a **value binding** via a direct `Identifier` `.name`:

- A named function expression's name is bound **inside its own body** and shadows any outer binding of the same name within that body (ES spec: the name is added to a dedicated function-expression scope).
- A class expression's name is bound **inside the class body** (including method bodies) and shadows outer bindings there.

So `process.env[K]` inside such a body resolves (per TS/JS scoping) to the function/class — **not** to the outer file-scope `const K`. Because the binding is uncounted, the const stays `bindingCounts === 1`, remains resolvable, and the scanner **fabricates the const's value** — the precise fail-closed-invariant violation R4/R5/R5b/R5c each closed one family shallower.

### Live proof (executed against `bb5083e4`)
```
*** DIVERGES from want ***   named func-expr shadow        => ["FOO"]  want []
*** DIVERGES from want ***   named class-expr shadow       => ["FOO"]  want []
*** DIVERGES from want ***   named IIFE func-expr shadow   => ["FOO"]  want []
(matches want)               anon func-expr (control)      => ["FOO"]  want ["FOO"]
```
Counter-example (func-expr):
```ts
const K = 'FOO';
const f = function K(){ return process.env[K]; };  // K here = the function, NOT 'FOO'
```
Counter-example (class-expr):
```ts
const K = 'FOO';
const C = class K { m(){ return process.env[K]; } }; // K here = the class, NOT 'FOO'
```
Both are **valid TypeScript**. The scanner returns `["FOO"]` for each; the correct answer is `[]` (the name resolves to a non-string-const binding at the use site). The anonymous control (`function(){…}` — no name, no binding) correctly stays `["FOO"]`.

### AST confirmation (no arm matches)
```
FunctionExpression name= K isFunctionDeclaration? false
ClassExpression    name= K isClassDeclaration?    false
```
`.name` is an `Identifier`, yet `isFunctionDeclaration`/`isClassDeclaration` both return false → the binding is invisible to ambiguity tracking. (`isFunctionExpression`/`isClassExpression` are the matching predicates, and they are not referenced anywhere in `countBindings`.)

### Impact
Identical class to the accepted R4/R5/R5b/R5c findings: a fabricated env-var name flows into `crossReference` as a phantom `UNDECLARED` (or a false `TRACKED` if the const value happens to collide with a registry name) — violating the discovery soundness contract ("a name resolves ONLY when bound exactly once"). The trigger is contrived (same-named string const + named func/class expression + dynamic `process.env[K]` inside it), but it is valid TS and **structurally the most plausible of all the binder families to date** — named function expressions (`const handler = function handler(){…}`) are idiomatic, far more common than namespace-scoped `import K = require(...)`. By the consistency standard applied across every prior round of this PR, it is in-scope and must close before merge.

### Discriminating fix (one arm, zero new imports)
Add to `countBindings`, sibling to the existing arms (before the `forEachChild` recursion):
```ts
} else if (
  (ts.isFunctionExpression(node) || ts.isClassExpression(node)) &&
  node.name &&
  ts.isIdentifier(node.name)
) {
  // A named function/class EXPRESSION binds its own name inside its body
  // (function-expression scope / class body), shadowing a same-named file-scope
  // const at any process.env[K] use-site within it. FunctionExpression/
  // ClassExpression are NOT FunctionDeclaration/ClassDeclaration, so arm 4 misses
  // them. Count toward ambiguity (fail-closed, R59). node.name && guards the
  // anonymous forms (function(){}, class{}), which bind nothing.
  bumpBinding(node.name.text);
}
```
**Fix verified live** (patched build): the two shadow cases flip `["FOO"] → []` while the anonymous control stays `["FOO"]`:
```
FIX named func-expr shadow:  []       (want [])
FIX named class-expr shadow: []       (want [])
FIX anon func-expr control:  ["FOO"]  (want [FOO])
```
Add ≥2 discriminating spec cases mirroring the func-expr and class-expr counter-examples, each asserting `expect([...extractEnvVarRefs(code)]).toEqual([])`, plus retain an anonymous-expression control asserting `['FOO']` to pin the `node.name &&` guard-half.

---

## MUTATION TESTS OF THE R5c CHANGES (both killed — arms discriminate)

Two mutants compiled and executed against the three R5c spec cases:

### Mutant 1 — drop the new `ImportEqualsDeclaration` arm (the NEW R5c prod arm)
```
MUTANT1   A import K=require ns shadow  => ["FOO"]   (spec asserts [] → FAILS RED ✓)
MUTANT1   B import K=ns.X ns shadow     => ["FOO"]   (spec asserts [] → FAILS RED ✓)
ORIGINAL  A => []   B => []
```
Both new R5c spec cases (A, B) flip to `["FOO"]` when the arm is removed → they **fail red** → **discriminating**. The arm is load-bearing and the tests pin it.

### Mutant 2 — drop `ts.isIdentifier(node.name)` from the four-decl arm guard (the R5c-F002 REPLACED control)
```
MUTANT2   C declare module "FOO" pin   => []       (spec asserts ['BAR'] → FAILS RED ✓)
ORIGINAL  C => ["BAR"]
```
The replaced control `declare module "FOO" {}` + `const FOO='BAR'` + `process.env[FOO]` flips `['BAR'] → []` when the `isIdentifier` guard is dropped (StringLiteral `.text` "FOO" gets bumped → `FOO` bound twice → ambiguous → dropped) → **fails red** → **discriminating**. The R5c-F002 replacement genuinely pins the guard-half — the prior non-discriminating `declare module "x"` control is correctly gone (confirmed removed in the diff; no `declare module "x"` remains).

### Recursion-depth confirmation (axis 15)
Cases A and B place the `import =` **inside a `namespace`**; both resolve to `[]` only because `ts.forEachChild` recurses into the `ModuleBlock`. Both pass live → the recursive descent reaches nested-in-namespace binders. ✓

---

## PRIOR-FINDING CLOSURE TABLE (all live-executed against `bb5083e4`)

| Round | Finding | Probe | Result |
|---|---|---|---|
| R4 | Parameter shadow | `function f(K){return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement obj-destructure param | `function f({K}){return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement arr-destructure param | `function f([K]){return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement renamed `{x:K}` | `const {x:K}=o; const x='FOO'; process.env[K]` | `[]` ✅ |
| R5b | FunctionDeclaration shadow (nested) | `function f(){function K(){} return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5b | ClassDeclaration shadow | `class K {}` nested + const | `[]` ✅ |
| R5b | EnumDeclaration shadow | `enum K {}` nested + const | `[]` ✅ |
| R5b | ModuleDeclaration shadow | `namespace K {}` nested + const | `[]` ✅ |
| R5b | propertyName NON-counted (discriminating) | `const {x:K}=o; const x='FOO'; process.env[x]` | `['FOO']` ✅ |
| R5c | ImportEqualsDeclaration (require form) | spec case A | `[]` ✅ |
| R5c | ImportEqualsDeclaration (qualified form) | spec case B | `[]` ✅ |
| R5c | `declare module "FOO"` guard pin | spec case C | `['BAR']` ✅ |
| — | catch-var shadow | `try{}catch(K){process.env[K]} const K='FOO'` | `[]` ✅ |
| — | catch bare (no binding) | `const K='FOO'; try{}catch{process.env[K]}` | `['FOO']` ✅ |
| — | for-of loop var shadow | `for(const K of arr){process.env[K]} const K='FOO'` | `[]` ✅ |
| — | baseline lone const | `const K='FOO'; process.env[K]` | `['FOO']` ✅ |

No regression in any prior-closed case.

---

## ANGRY OVER-SWEEP (axes considered + rejected, with live rationale)

| Axis | Outcome | Rationale (live where run) |
|---|---|---|
| **Named func/class EXPRESSION** | **FINDING R5d-F001** | Uncounted value binder, live false positive `["FOO"]`. The next family deeper. |
| `TypeAliasDeclaration` + same-name const | rejected | `type K=string; const K='FOO'; process.env[K]` → `['FOO']` ✅. Type/value namespaces don't collide; no second value binding; const correctly resolves. |
| `InterfaceDeclaration` + same-name const | rejected | `interface K {} const K='FOO'; process.env[K]` → `['FOO']` ✅. Type-only, no value binding, no pollution. |
| `TypeParameter` `<K>` shadowing value | rejected | `function f<K>(){process.env[K]} const K='FOO'` → `['FOO']` ✅. Type param is type-only; the value-namespace `K` IS the outer const, so resolution is correct, not a false positive. |
| Labeled statement `K:` | rejected | `const K='FOO'; K: for(;;){process.env[K];break;}` → `['FOO']` ✅. A label is not a value binding; `K` in value position is the const. Correct. |
| `import type {K}` (module-scope, type) | rejected | `import type {K} from 'x'; function f(){const K='FOO'; return process.env[K];}` → `['FOO']` ✅. Type-only import; inner const bound once; correct. |
| `NamespaceImport` / `ImportClause` / `ImportSpecifier` (value imports) | rejected | Module-scope only. A same-named module-scope `const` is a TS duplicate-identifier error → no LEGAL shadow constructible. Not exploitable (consistent with R5c brief note). |
| `for (let K=0; …)` init var | rejected | `for(let K=0;…){process.env[K]} const K='FOO'` → `[]` ✅. Counted via `VariableDeclaration` arm. |
| Anonymous default fn/class `node.name &&` guard | rejected | Anonymous control → `['FOO']`, no throw ✅. Guard load-bearing (prior round: `isIdentifier(undefined)` throws). |
| `declare module "x"` (lowercase, non-colliding) — old control | rejected | Confirmed REMOVED from the diff; replaced by the colliding `declare module "FOO"` discriminating control. |
| Determinism (axis 14) | rejected | Re-ran identical input twice → byte-identical (`["Z","Y"]` == `["Z","Y"]`). `bumpBinding` Map is order-independent. |
| Double-arm match / double-count | rejected | Each new arm matches a mutually-exclusive `node.kind`; `ImportEqualsDeclaration` cannot also be a Variable/Param/Binding/Decl node. No double count. |
| Secret leakage in spec literals | rejected | New literals are `'FOO'` / `'BAR'` only. No secrets. |

---

## R3 / R75 / R40 / R74 / LOC / imports / determinism / boundary VERIFICATION TABLE

| Axis | Result |
|---|---|
| **R124 SHA pin** | `bb5083e42922ac3e93323e743feee468d95485e9` confirmed at START and END. No drift. ✅ |
| **R3 commit identity** | All 8 PR-unique commits (`c9ae739`→`bb5083e`, range `8467c6f..HEAD` minus pre-existing main history) have author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. R5c commit body contains no `Claude/AI/Anthropic/Assistant/agent/Co-authored-by` token. (GitHub-authored `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` commits are pre-existing repo ancestors, NOT introduced by this PR.) ✅ |
| **R75 banned tokens** (added lines only, `36a0aba4..bb5083e4`) | grep for `TODO/FIXME/XXX/HACK/@ts-ignore/@ts-nocheck/eslint-disable/as any/as unknown as/as never/console./debugger` → **NONE**. ✅ |
| **R40 assertion strength** (3 new/changed cases) | All use `expect([...extractEnvVarRefs(code)]).toEqual([...])` — value equality (`[]`, `[]`, `['BAR']`). No weak matchers. All 3 discriminate (mutation-proven). ✅ |
| **R74 test:prod ratio** (`36a0aba4..bb5083e4`) | +34 spec / +10 prod = **3.4×** (net 29/8 = 3.6×). ≥ 2.0×. ✅ |
| **LOC budget** | `[LOC-EXEMPT] test-tree only` marker present in R5c commit body; scope is entirely under `test/prod-readiness/`. ✅ |
| **File boundaries** | Diff touches ONLY `test/prod-readiness/env-discovery.ts` + `test/prod-readiness/env-discovery.spec.ts`. ✅ |
| **New imports** | `env-discovery.ts` prod delta adds **zero** imports (reuses `ts.*`). ✅ |
| **Exported contract** | `collectStringConsts` and `countBindings` remain **un-exported** (internal); tested only via public `extractEnvVarRefs`. ✅ |
| **Determinism** | Re-ran twice on same input → byte-identical. ✅ |

---

## SUMMARY

The R5c fixer correctly and completely closed the `ImportEqualsDeclaration` binder family (live A/B/C all green; mutation-killed both arms; the non-discriminating `declare module "x"` control is gone, replaced by a discriminating colliding-name control that flips `['BAR'] → []` under guard regression). Every prior R4/R5/R5b/R5c ledger case remains green. Process gates (R3/R75/R40/R74/LOC/imports/boundary/determinism/contract) all pass.

The angry depth sweep then found the **next binder family deeper**, as the round-on-round pattern predicted: **named `FunctionExpression` / `ClassExpression`** are value-introducing, Identifier-named, valid TS, body-scoped shadows of file-scope consts, and **uncounted** by `countBindings` (arm 4 matches *declarations* only). Live-proven false positive `["FOO"]` on `bb5083e4` (`R5d-F001-LensA`, P3). A one-arm fix (`isFunctionExpression || isClassExpression`, guarded by `node.name && isIdentifier`) is verified live to close it; it must land with ≥2 discriminating spec cases before merge, per the strict zero-finding doctrine.

VERDICT: FINDINGS (1 × P3)

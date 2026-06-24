# H4.B Env-Discovery — Lens A (DEPTH) — R5c RE-AUDIT (Round 3, post-R5b-fixer)

- **PR:** #464 (TGP Wave 1, H4.B env-discovery)
- **Head SHA audited (start AND end):** `36a0aba4f77a48ab53fab7967cac83c5e5d919cd` ✅ pinned, re-confirmed unchanged at end (R124)
- **main base SHA:** `8467c6f568a51337a7acbfb14f72ac85b996d605`
- **Lens role:** DEPTH — compile + EXECUTE the scanner against adversarial counter-examples; source comments' self-claims NOT trusted.
- **Method:** TS 5.9.3 installed (matches repo `typescript@5.9.3` exactly), prod `env-discovery.ts` transpiled with a stubbed `registry-loader`, `extractEnvVarRefs` exercised live + mutation-tested.
- **Round history:** R4 param-shadow (closed) → R5 BindingElement-shadow (closed) → R5b declaration-name-shadow + propertyName test-efficacy (closed by this fixer). Each round revealed one binder-family deeper.

---

## VERDICT: FINDINGS

Two findings. **R5c-F001 is NEW and unique to this depth lens** — a real soundness gap (false-positive env fabrication), the binder-family one level deeper than R5b, exactly the case the mandate predicted (`import K = require('x')`). **R5c-F002** is a test-efficacy gap independently corroborated by Lens B R5c.

---

## R5c-F001 (NEW, Lens A DEPTH, P3 — SOUNDNESS / FALSE POSITIVE) — `ImportEqualsDeclaration` is an uncounted value-introducing binder

### What
`countBindings` (env-discovery.ts:346-388) counts six binder kinds across four arms:
1. `VariableDeclaration` (incl. catch vars, for-of/for-in loop vars)
2. `Parameter` (R4)
3. `BindingElement` (R5)
4. `FunctionDeclaration | ClassDeclaration | EnumDeclaration | ModuleDeclaration` (R5b)

It does **NOT** count `ImportEqualsDeclaration` — `import K = require('x')` (CommonJS import-equals) and `import K = ns.X` (qualified import-equals). Both introduce a **value binding** via a direct `Identifier` `.name`, and both are **valid TypeScript inside a namespace/module** (where they can legally shadow a same-named file-scope `const`).

Because the binding is uncounted, a name shadowed by a namespace-scoped import-equals stays `bindingCounts === 1`, remains in the resolvable const map, and `process.env[K]` at the import's use-site **fabricates the const's value** — the precise fail-closed-invariant violation R4/R5/R5b each closed one binder-family shallower.

### Live proof (executed against the audited SHA)
```
A1 import K=require nested ns shadows const   ["FOO"]   ← FALSE POSITIVE (should be [])
A2 import K=qualified ns shadows const        ["FOO"]   ← FALSE POSITIVE (should be [])
B1 baseline lone const resolves               ["FOO"]   (control — correct)
```
Counter-example A1:
```ts
const K = 'FOO';
namespace N {
  import K = require('./x');          // value binding K, shadows outer const within N
  export const v = process.env[K];    // K here = the import, NOT 'FOO'
}
```
At the use-site inside `N`, `K` resolves (per TS scoping) to the import alias, not the outer string const — so attributing env var `FOO` is unsound. The scanner returns `["FOO"]`.

### AST confirmation (no arm matches)
```
ImportEqualsDeclaration name=K nameIsId=true
isVariableDeclaration:false  isParameter:false  isBindingElement:false
isFunctionDeclaration:false  isClassDeclaration:false
isEnumDeclaration:false      isModuleDeclaration:false
```
`.name` is an `Identifier`, yet every counted predicate returns false → the binding is invisible to ambiguity tracking.

### Impact
Same class as the accepted R4/R5/R5b findings: a fabricated env-var name flows into `crossReference` as a phantom `UNDECLARED` (or a false `TRACKED` if the const value happens to be a registry name) — i.e. the discovery soundness contract ("a name resolves ONLY when bound exactly once") is violated. Trigger is contrived (requires `namespace` + `import =` + same-named string const + dynamic `process.env[K]`), but it is **valid TS** and structurally identical to every prior accepted finding. By the consistency standard applied across this PR's rounds, it is in-scope.

### Fix (one arm, zero new imports)
Add to `countBindings`:
```ts
} else if (ts.isImportEqualsDeclaration(node) && ts.isIdentifier(node.name)) {
  // import K = require('x') / import K = ns.X introduce a value binding via an
  // Identifier .name that can shadow a same-named file-scope const inside a
  // namespace/module. Count it toward ambiguity (R5c-F001).
  bumpBinding(node.name.text);
}
```
(`node.name` on `ImportEqualsDeclaration` is always an `Identifier`, but the `isIdentifier` guard keeps the arm uniform and defensive.) Add discriminating spec cases mirroring A1/A2 → `expect(...).toEqual([])`.

---

## R5c-F002 (Lens A DEPTH, P3 — TEST EFFICACY) — `declare module "x"` control is non-discriminating for the `isIdentifier` guard-half

### What
The R5b commit added three "no throw, no pollution" controls. Two of them (anonymous default **function** / **class**, spec:1167/1176) genuinely discriminate the `node.name &&` guard-half — I confirmed `ts.isIdentifier(undefined)` **throws** (`Cannot read properties of undefined (reading 'kind')`), so removing `node.name &&` makes those tests throw → they fail → they pin the guard.

But the third control, `declare module "x" {}` (spec:1183), does **NOT** discriminate the `ts.isIdentifier(node.name)` guard-half.

### Mutation proof
Mutant B = drop only `ts.isIdentifier(node.name)` (keep `node.name &&`), recompiled and executed:
```
MUTANT B  shadowFn (expect [])          = []      (4 shadow tests still pass)
MUTANT B  declMod "x" (expect ['FOO'])  = ['FOO'] (CONTROL STILL GREEN — mutation survives)
MUTANT B  declMod "FOO" colliding       = []      (the REAL bug the guard prevents: ['BAR']→[])
ORIGINAL  declMod "FOO" colliding       = ['BAR']
```
The `isIdentifier` guard is load-bearing: it stops a string-named module (`declare module "FOO"`) from polluting `bindingCounts` and falsely dropping a same-named const (a false negative, `['BAR']→[]`). The shipped control uses module name `"x"` (no colliding const), so the mutation ships green. Identical defect class to the propertyName non-discriminating case the **same commit** just closed for Lens B.

### Note on calibration
Lens B R5c independently flagged this same control. Production code is correct; this is a future-regression-pinning gap only, no runtime/security impact. Recommend a colliding-name discriminating shape:
```ts
'declare module "FOO" {}', "const FOO = 'BAR';", 'const v = process.env[FOO];'  // expect ['BAR']
```
which flips to `[]` if `isIdentifier` is ever dropped.

---

## CONFIRMED-CLOSED DATA POINTS (incidental verification of prior findings — all live-executed)

| Prior finding | Probe | Result |
|---|---|---|
| R5b decl-name shadow — function | `function f(){function K(){}return process.env[K]} const K='FOO'` | `[]` ✅ |
| R5b decl-name shadow — class | `class K {}` nested | `[]` ✅ |
| R5b decl-name shadow — enum (H1) | `enum K {}` nested | `[]` ✅ |
| R5b decl-name shadow — namespace | `namespace K {}` nested | `[]` ✅ |
| R5b shadow cases discriminate | Mutant A (drop whole decl arm) → shadowFn | `['FOO']` (tests catch it) ✅ |
| R5b propertyName discriminating | `const {x:K}=o; const x='FOO'; process.env[x]` | `['FOO']`; flips to `[]` if propertyName counted ✅ |
| anon default fn/class controls | `ts.isIdentifier(undefined)` throws → `node.name &&` is pinned | ✅ discriminate |
| R4 param shadow | `function f(K){return process.env[K]} const K='FOO'` | (via family) `[]` ✅ |
| R5 BindingElement shadow | obj/arr/renamed/nested destructure params | family intact ✅ |
| for-of loop var | `for(const K of arr){process.env[K]} const K='FOO'` | `[]` ✅ (goes through VariableDeclaration arm) |
| catch bound | `try{}catch(K){process.env[K]} const K='FOO'` | `[]` ✅ |
| catch bare (no binding) | `try{}catch{process.env[K]} const K='FOO'` | `['FOO']` ✅ (correct — no binding introduced) |
| computed binding name | `const {[K]:v}=obj; process.env[K]` | `['FOO']` ✅ (K is a reference, `v` is the bound name) |
| anon default fn guard | `export default function(){}` + const + read | `['FOO']`, no throw ✅ |
| string-literal module guard | `declare module "x" {}` + const + read | `['FOO']`, no throw ✅ |
| double-count safety | each arm is a mutually-exclusive `node.kind`; catch-var is itself a VariableDeclaration (not separately matched) | no double-count ✅ |

---

## ANGRY RE-SWEEP (axes from the mandate)

| Axis | Result |
|---|---|
| **R124 SHA pin** | `36a0aba4...` confirmed at start AND end. ✅ |
| **R3 commit identity** | Author = committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` (dev identity; auditor identity reserved for ctx pushes). No AI/Claude/Co-authored token. ✅ |
| **R75 banned tokens** (added lines only) | grep over `+` lines for `TODO/FIXME/XXX/HACK/@ts-ignore/@ts-nocheck/eslint-disable/console./debugger` → NONE. ✅ |
| **R40 assertion strength** (8 new cases) | All use `expect([...extractEnvVarRefs(code)]).toEqual([...])` — value equality, no weak matchers. 7/8 discriminate; case 8 (`declare module "x"`) does not → **R5c-F002**. |
| **R74 test:prod ratio** (R5b diff) | +74 spec / +17 prod = **4.35×**. ✅ |
| **LOC budget** | `[LOC-EXEMPT] test-tree only` marker present. ✅ |
| **Determinism** | Re-ran discovery twice on the same input → byte-identical (`["Z","Y","Q","W"]`). `bumpBinding` Map counting is order-independent; `found`/`names` Sets spread in insertion order. ✅ |
| **New imports / module surface** | R5b prod delta adds zero imports (reuses `ts.*`). ✅ |
| **Exported contract** | `collectStringConsts`/`countBindings` remain internal; tested only via public `extractEnvVarRefs`. ✅ |
| **Anonymous-default guard, no-throw** | `node.name &&` confirmed load-bearing (isIdentifier(undefined) throws); guards exercised. ✅ |
| **declare module string-literal, no pollution** | No throw; lowercase `"x"` never reaches `ENV_VAR_NAME`; correct. ✅ |
| **File boundaries** | R5b diff touches only `env-discovery.ts` + `env-discovery.spec.ts`. ✅ |

---

## SUMMARY

The R5b fixer correctly closed the declaration-name binder family (function/class/enum/module) and the propertyName test-efficacy gap; all live-confirmed. The angry depth sweep then found the **next binder-family deeper**: `ImportEqualsDeclaration` (`import K = require(...)` / `import K = ns.X`) is value-introducing, Identifier-named, valid inside namespaces, and **uncounted** — producing a live false-positive `["FOO"]` (R5c-F001). A secondary test-efficacy gap (R5c-F002, the non-discriminating `declare module "x"` control) was confirmed by mutation and corroborates Lens B R5c.

Both are P3, consistent with the severity assigned to every prior round's binder-family finding. R5c-F001 is actionable production code; R5c-F002 is a one-line spec hardening.

VERDICT: FINDINGS

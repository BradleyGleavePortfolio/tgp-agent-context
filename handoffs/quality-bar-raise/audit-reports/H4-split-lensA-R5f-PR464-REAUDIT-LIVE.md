# H4.B Env-Discovery — Lens A (DEPTH, Opus 4.8) — R5f RE-AUDIT (Round 5, post-R5e-fixer)

## VERDICT: CLEAN

**Zero findings.** The R5e fixer correctly and completely closed both R5d findings
(Lens A named FunctionExpression/ClassExpression binder family; Lens B
non-discriminating propertyName baseline). Both halves of the new sixth arm are
mutation-killed live. Every prior R4/R5/R5b/R5c/R5d ledger case is
regression-green. The angry next-binder-family sweep found **no** further
uncounted value-introducing binder constructable as a legal same-scope shadow —
the binder-family ladder has bottomed out. All process gates
(R3/R75/R40/R74/LOC/imports/boundary/determinism/double-arm/contract) pass.

---

## 1. SHA PIN

| Item | Value |
|---|---|
| Head audited (START) | `5f0745819dbaa9da092b54ff75967683dcc0197c` ✅ |
| Head audited (END, no drift) | `5f0745819dbaa9da092b54ff75967683dcc0197c` ✅ |
| main base | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| R5c prior head | `bb5083e42922ac3e93323e743feee468d95485e9` |
| Branch | `wave-h4b-env-discovery` |
| Lens role | DEPTH — compile + EXECUTE; source comments NOT trusted |
| Toolchain | TypeScript `5.9.3` (exact repo match), prod `env-discovery.ts` transpiled to CommonJS with a stubbed `registry-loader`, `extractEnvVarRefs` exercised + mutation-tested live |

Round history: R4 Parameter (`67ade350`) → R5 BindingElement (`2b45c39e`) →
R5b Function/Class/Enum/Module decl-name (`36a0aba4`) → R5c
ImportEqualsDeclaration (`bb5083e4`) → R5d named FunctionExpression/ClassExpression
(`5f074581`, this round's subject).

---

## 2. MUTATION-TEST RESULTS — NEW R5d SIXTH ARM (both halves killed)

Built two mutants by exact-text replacement on the transpiled prod source,
re-transpiled to CJS, executed live.

### Mutant 1 — drop the ENTIRE sixth arm (`isFunctionExpression || isClassExpression` predicate-or + guard + bump)
```
MUT1 A named func-expr => ["FOO"]   spec asserts []  → FAIL RED ✓
MUT1 B named class-expr => ["FOO"]  spec asserts []  → FAIL RED ✓
MUT1 C anon control => ["FOO"]      (unaffected, correct)
```
Both shadow cases flip `[] → ["FOO"]` when the arm is removed → spec cases A and
B **fail red** → the arm is load-bearing and the tests pin it.

### Mutant 2 — drop the `node.name &&` guard-half (keep `(isFuncExpr||isClassExpr) && isIdentifier(node.name)`)
```
MUT2 C anon func-expr  => THROW: Cannot read properties of undefined (reading 'kind')
MUT2 anon class-expr   => THROW: Cannot read properties of undefined (reading 'kind')
MUT2 A named func still => []   (named path unaffected)
```
With the guard dropped, the anonymous function/class expression has
`node.name === undefined`, and `ts.isIdentifier(undefined)` dereferences
`undefined.kind` → throws. The anonymous control case
(`spec:1234`, asserts `['FOO']`) therefore **fails red** → the `node.name &&`
guard-half is genuinely pinned by the anonymous control, exactly as the case
comment claims (live-verified, comment not trusted on faith).

**Both mutants killed.** The arm and its guard-half are each independently
discriminated by the shipped spec cases.

---

## 3. LENS-B FIX VERIFICATION — non-discriminating propertyName baseline DELETED

- The R5d-F001-LensB baseline (`it('does not count propertyName: a renamed-only
  destructure with no string source resolves []', …)`, formerly `spec:1110`,
  `const {x:K}=o; const v=process.env[K]` → `[]`) is **REMOVED**.
- Live grep for its distinctive markers — `renamed-only`, `no string source`,
  `resolves []` — returns **zero hits** (exit 1).
- The paired **discriminating** case survives at `spec:1107`
  (`'does not count propertyName: a file-scope const named by propertyName still
  resolves cleanly'`, `const {x:K}=o; const x='FOO'; process.env[x]` → `['FOO']`).
  Live-verified: returns `['FOO']`; under the propertyName-counted regression `x`
  would be bound twice → ambiguous → flip to `[]`. The invariant remains pinned
  at the suite level with no false-confidence baseline. ✅

---

## 4. PRIOR-FINDING CLOSURE TABLE (all live-executed against `5f074581`)

| Round | Finding / probe | Code | Result |
|---|---|---|---|
| R4 | Parameter shadow | `function f(K){return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement obj-param | `function f({K}){…} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement arr-param | `function f([K]){…} const K='FOO'` | `[]` ✅ |
| R5 | BindingElement renamed `{x:K}` | `const {x:K}=o; const x='FOO'; process.env[K]` | `[]` ✅ |
| R5b | FunctionDeclaration (nested) | `function f(){function K(){} return process.env[K];} const K='FOO'` | `[]` ✅ |
| R5b | ClassDeclaration | nested `class K {}` + const | `[]` ✅ |
| R5b | EnumDeclaration | nested `enum K {}` + const | `[]` ✅ |
| R5b | ModuleDeclaration | nested `namespace K {}` + const | `[]` ✅ |
| R5b | propertyName discriminating | `const {x:K}=o; const x='FOO'; process.env[x]` | `['FOO']` ✅ |
| R5c | ImportEqualsDeclaration (require) | `namespace N{import K=require('./x');…} const K='FOO'` | `[]` ✅ |
| R5c | ImportEqualsDeclaration (qualified) | `namespace N{import K=Outer.Inner.X;…} const K='FOO'` | `[]` ✅ |
| R5c | `declare module "FOO"` guard pin | `declare module "FOO"{} const FOO='BAR'; process.env[FOO]` | `['BAR']` ✅ |
| **R5d** | **named func-expr shadow** | `const K='FOO'; const f=function K(){return process.env[K];}` | `[]` ✅ |
| **R5d** | **named class-expr shadow** | `const K='FOO'; const C=class K{m(){return process.env[K];}}` | `[]` ✅ |
| **R5d** | **named IIFE func-expr shadow** | `const K='FOO'; (function K(){return process.env[K];})()` | `[]` ✅ |
| **R5d** | **anon func-expr control** | `const K='FOO'; const f=function(){return process.env[K];}` | `['FOO']` ✅ |
| **R5d** | **async named func-expr** | `const K='FOO'; const f=async function K(){return process.env[K];}` | `[]` ✅ |
| **R5d** | **anon class-expr control** | `const K='FOO'; const C=class{m(){return process.env[K];}}` | `['FOO']` ✅ |
| — | catch-var shadow | `try{}catch(K){process.env[K]} const K='FOO'` | `[]` ✅ |
| — | catch bare (no binding) | `const K='FOO'; try{}catch{process.env[K]}` | `['FOO']` ✅ |
| — | for-of loop var shadow | `for(const K of arr){process.env[K]} const K='FOO'` | `[]` ✅ |
| — | baseline lone const | `const K='FOO'; process.env[K]` | `['FOO']` ✅ |

**No regression in any prior-closed case.** All 22 probes match want.

---

## 5. ANGRY OVER-SWEEP — NEXT BINDER-FAMILY HUNT (all considered + rejected, live)

The R5d arm was the predicted "next family deeper." R5f hunts the one after it.
Every value-introducing `.name`-bearing construct in the TS grammar was
live-probed for a constructable same-scope shadow false positive. **None found.**

| Axis | Outcome | Live rationale |
|---|---|---|
| **ArrowFunction** | rejected | `const K='FOO'; const f=()=>process.env[K]` → `['FOO']` ✅. Arrows are anonymous in their own scope; the name lives on the LHS `VariableDeclaration` (already counted). No own-name binding. |
| **MethodDeclaration** | rejected | `class C{K(){} m(){return process.env[K];}} const K='FOO'` → `['FOO']` ✅. Method name is a member, not a body-scope value binding; `K` in `m` resolves to the outer const. Correct, no false positive. |
| **GetAccessor** | rejected | `class C{get K(){…} m(){…process.env[K]}} const K='FOO'` → `['FOO']` ✅. Member name, not a binding. |
| **SetAccessor** | rejected | `class C{set K(v){} m(){…process.env[K]}} const K='FOO'` → `['FOO']` ✅. Same. |
| **PropertyDeclaration** | rejected | `class C{K=1; m(){return process.env[K];}} const K='FOO'` → `['FOO']` ✅. Class field is a member; `K` in method body resolves to outer const. Exactly the brief's predicted correct outcome. |
| **ConstructorDeclaration** | rejected | `class C{constructor(){} m(){…process.env[K]}} const K='FOO'` → `['FOO']` ✅. No name binding. |
| **Generator `function* K(){}`** | rejected | nested `function* K(){}` + const → `[]` ✅. Parses as FunctionDeclaration (asteriskToken); already covered by arm 4. |
| **Async named func-expr** | rejected | `const f=async function K(){…}` shadow → `[]` ✅ (table §4). FunctionExpression+modifiers; new arm 6 covers. |
| **Constructor parameter property** | rejected | `class C{constructor(public K:string){this.x=process.env[K];}} const K='FOO'` → `[]` ✅. Parameter bound in ctor scope; counted via Parameter arm. |
| **TypeAliasDeclaration** | rejected | `type K=string; const K='FOO'; process.env[K]` → `['FOO']` ✅. Type/value namespaces disjoint; no second value binding. |
| **InterfaceDeclaration** | rejected | `interface K{} const K='FOO'; process.env[K]` → `['FOO']` ✅. Type-only. |
| **TypeParameter `<K>`** | rejected | `function f<K>(){return process.env[K];} const K='FOO'` → `['FOO']` ✅. Type param is type-only; value-namespace `K` IS the outer const → correct resolution. |
| **ConditionalType `infer K`** | rejected | `type T=X extends infer K?K:never; const K='FOO'; process.env[K]` → `['FOO']` ✅. Type-only, no value binding. |
| **Labeled statement `K:`** | rejected | `const K='FOO'; K:for(;;){process.env[K];break;}` → `['FOO']` ✅. Label is not a value binding. |
| **SatisfiesExpression wrap** | rejected | `const K='FOO' satisfies string; process.env[K]` → `['FOO']` ✅. `unwrapExpression` passes through; const resolves. |
| **AsExpression (`as const`) wrap** | rejected | `const K='FOO' as const; process.env[K]` → `['FOO']` ✅. Pass-through correct. |
| **ObjectBindingPattern shorthand + default** | rejected | `const {K='FOO'}=o; process.env[K]` → `[]` ✅. Bound via BindingElement (R5 arm); destructured name has no resolvable string → correctly drops. |
| **Decorator-captured class name** | rejected | covered by ClassDeclaration arm (`@dec class K{}` is a ClassDeclaration); no expression-form gap. |
| Anonymous default fn/class (`node.name &&` guard) | rejected | anon controls → `['FOO']`, no throw ✅; guard load-bearing (Mutant 2 throws when dropped). |
| **Determinism** | rejected | re-ran identical input twice → byte-identical (`["A","B","C"]==["A","B","C"]`; also `["Z","Y"]==["Z","Y"]`). `bumpBinding` Map + `forEachChild` are order-independent. |
| **Double-arm match** | rejected | The six arms gate on mutually-exclusive `node.kind`; FunctionExpression/ClassExpression kinds cannot also satisfy Variable/Param/BindingElement/decl/ImportEquals predicates. The `if/else-if` chain short-circuits regardless → no node double-counts. |
| Secret leakage | rejected | new spec literals are `'FOO'`/`'BAR'` only. No secrets. |

**Conclusion of the hunt:** the remaining `.name`-bearing constructs are either
(a) members (method/accessor/property/ctor — not body-scope value bindings, no
shadow), (b) type-only (type alias/interface/type param/infer — disjoint
namespace), or (c) already-counted (arrow LHS via VariableDeclaration; generator
via FunctionDeclaration; ctor param via Parameter; destructure default via
BindingElement). The module-scope-only value binders
(`ImportClause`/`ImportSpecifier`/`NamespaceImport`/`ExportAssignment`) cannot
legally co-exist with a same-named module-scope `const` (TS duplicate-identifier
error), so no shadow is constructible — consistent with every prior round's
reasoning. **The binder-family ladder has bottomed out; no R5f finding.**

---

## 6. R3 / R75 / R40 / R74 / LOC / IMPORTS / DETERMINISM / BOUNDARY / CONTRACT TABLE

| Axis | Result |
|---|---|
| **SHA pin** | `5f0745819dbaa9da092b54ff75967683dcc0197c` confirmed START and END, no drift ✅ |
| **R3 commit identity (R5e)** | author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>` ✅ |
| **R3 full range `8467c6f..HEAD`** | 9 PR-own commits (`c9ae739`→`5f074581`) all `Bradley Gleave <bradley@bradleytgpcoaching.com>` on both an/cn; pre-PR ancestors are GitHub-web base commits (`BradleyGleavePortfolio`/`GitHub`), not PR contributions ✅ |
| **R3 body tokens** | PR-own bodies `c9ae739..HEAD` scanned for `claude/anthropic/assistant/co-authored/agent/\bAI\b` → **NONE** ✅ |
| **R75 banned tokens** (added lines `bb5083e4..5f074581`) | `TODO/FIXME/XXX/HACK/@ts-ignore/@ts-nocheck/eslint-disable/as any/as unknown as/as never/.catch(()=>/console./debugger` → **NONE** ✅ |
| **R40 assertions** (4 new cases) | all `expect([...extractEnvVarRefs(code)]).toEqual([...])` value equality (`[]`,`[]`,`[]`,`['FOO']`); all 4 discriminate (Mutants 1&2) ✅ |
| **R74 ratio** (`bb5083e4..5f074581`) | added: spec +35 / prod +15 = **2.33×**; net 26/12 = **2.17×**. Both ≥ 2.0× ✅ |
| **LOC budget** | `[LOC-EXEMPT] test-tree only` marker present in R5e body; entire diff under `test/prod-readiness/` ✅ |
| **File boundaries** | diff touches ONLY `env-discovery.ts` + `env-discovery.spec.ts` ✅ |
| **New imports** | prod delta adds **zero** imports (reuses `ts.*`) ✅ |
| **Exported contract** | `extractEnvVarRefs` still exported (`:200`); `collectStringConsts` (`:338`) and `countBindings` (local) remain un-exported; tested only via public API ✅ |
| **Determinism** | re-ran twice → byte-identical ✅ |
| **Double-arm match** | mutually-exclusive kinds + `else-if` short-circuit → no double count ✅ |

---

## SUMMARY

The R5e fixer landed exactly what the R5e brief and the R5d findings demanded:
a sixth `countBindings` arm
(`(ts.isFunctionExpression(node) || ts.isClassExpression(node)) && node.name &&
ts.isIdentifier(node.name)`) that counts named function/class **expression**
self-bindings, plus four discriminating spec cases, plus deletion of the
non-discriminating propertyName baseline. Live execution against `5f074581`
confirms: the named func-expr / class-expr / IIFE / async shadows all
fail-closed-drop to `[]`; the anonymous controls correctly stay `['FOO']`; both
mutation halves are killed (Mutant 1 → A/B flip red; Mutant 2 → anon control
throws); the Lens-B baseline is gone; all 22 prior-ledger probes are
regression-green.

The angry next-family sweep probed every remaining `.name`-bearing TS construct
(members, type-only declarations, already-counted binders, module-scope-only
imports) and found **no** constructable false positive — the binder-family ladder
that drove R4→R5→R5b→R5c→R5d has bottomed out. All process gates pass.

**VERDICT: CLEAN (0 findings).**

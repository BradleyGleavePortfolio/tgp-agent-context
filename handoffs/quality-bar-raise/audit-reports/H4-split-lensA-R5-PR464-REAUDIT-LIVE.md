# H4 Split Audit — PR #464 (H4.B env-discovery) — Lens A (Opus 4.8) — R5 RE-AUDIT LIVE (DEPTH)

STATUS: COMPLETE — adversarial depth re-sweep finalized 2026-06-23T23:46:00Z

## BUILD MATRIX (R124)
- backend repo: `BradleyGleavePortfolio/growth-project-backend`
- ctx repo: `BradleyGleavePortfolio/tgp-agent-context`
- main HEAD (base): `8467c6f568a51337a7acbfb14f72ac85b996d605`
- PR head SHA audited: `2b45c39e29814e2633e305b50bffe3bb232cb867` (post-R5-fixer — MATCH to brief)
- prior audit head: `67ade350ed31369360bcbb7e1e9dc9ca40957178`
- branch: `wave-h4b-env-discovery`
- head commit `2b45c39e` = `fix(env-discovery): count BindingElement identifiers in fail-closed binding map (H4.B R5)`; author+committer `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R3 PASS on prod repo); body taint scan (`claude|co-authored|assistant|agent|anthropic|ai-generated`) → EMPTY (R3 PASS)
- fixer commit touches: `test/prod-readiness/env-discovery.ts` (+11), `test/prod-readiness/env-discovery.spec.ts` (+95/-12). Whole-file sizes: env-discovery.ts 622 LOC, spec 1420 LOC.
- audit-repo identity used: **Claude Auditor <auditor@bradleytgpcoaching.com>** (operator-approved fallback for tgp-agent-context ONLY)
- ISO timestamp UTC: 2026-06-23T23:46:00Z
- methodology: LIVE AST execution. Actual source `env-discovery.ts` transpiled via TypeScript 5.9.3 (`ts.transpileModule`, module=commonjs) with only the `./registry-loader` import stubbed (untouched by the audited functions); `extractEnvVarRefs` / `collectStringConsts` driven against hand-built adversarial counter-examples; `countBindings` re-implemented identically and instrumented to observe per-name binding counts (double-count probe).

## R124 SHA PIN — START & END
`git rev-parse pr464` at sweep START and END → `2b45c39e29814e2633e305b50bffe3bb232cb867` both times. No drift. Not INFRA_DEATH.

## R5-F001 CLOSURE VERIFICATION (one data point — incidental, per mandate)
The fixer added a third arm at `env-discovery.ts:358-368`:
```ts
} else if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) {
  bumpBinding(node.name.text);
}
```
All 11 brief-mandated regression shapes were executed LIVE against the actual transpiled source:

| # | Shape | Input | Expected | Observed | Status |
|---|---|---|---|---|---|
| 1 | obj-destructured param | `function f({KEY}){return process.env[KEY];} const KEY='DATABASE_URL';` | `[]` | `[]` | CLOSED ✓ |
| 2 | arr-destructured param | `function f([K]){return process.env[K];} const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 3 | arrow obj-destructured param | `const g=({K})=>process.env[K]; const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 4 | renamed destructured param | `const g=({x:K})=>process.env[K]; const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 5 | nested destructured param | `function h({a:{K}}){return process.env[K];} const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 6 | obj-destructured catch | `try{}catch({K}){process.env[K];} const K='QUX';` | `[]` | `[]` | CLOSED ✓ |
| 7 | obj-destructured for-of | `for(const {K} of arr){process.env[K];} const K='LOOP';` | `[]` | `[]` | CLOSED ✓ |
| 8 | obj-destructured var-decl | `const {K}=o; const K='FOO'; process.env[K];` | `[]` | `[]` | CLOSED ✓ |
| 9 | arr-destructured var-decl | `const [K]=a; const K='FOO'; process.env[K];` | `[]` | `[]` | CLOSED ✓ |
| 10 | let-destructured | `let {K}=o; const K='FOO'; process.env[K];` | `[]` | `[]` | CLOSED ✓ |
| 11 | renamed-only no-source (propertyName control) | `const {x:K}=o; process.env[K];` | `[]` | `[]` | CLOSED ✓ |

**Double-count probe** (instrumented `countBindings`, observed per-name counts):

| Shape | Observed counts | Verdict |
|---|---|---|
| `function h({a:{K}}){}` | `{K:1}` | single count through nested pattern — no double-count ✓ |
| `function f({K}){} const K=1;` | `{K:2}` | correctly ambiguous ✓ |
| `const {...rest}=o` | `{rest:1}` | rest element counted ✓ |
| `const [...rest]=a` | `{rest:1}` | array rest counted ✓ |
| `const {K=5}=o` | `{K:1}` | default-valued counted once ✓ |
| `for(const {K} in o){}` | `{K:1}` | for-in destructure reached ✓ |
| `const {[expr]:K}=o` | `{K:1}` | computed key: only bound name counted, `expr` not ✓ |
| `const {a:{b:{K}}}=o` | `{K:1}` | deep nest single count ✓ |
| `const {a:[K]}=o` | `{K:1}` | array-in-obj single count ✓ |

**R5-F001 is CLOSED. The fix is mechanically correct, complete for the destructuring class, and introduces no double-counting.** `propertyName` is correctly never counted; rest/default/computed/nested/for-in/for-of/catch all reach the new arm exactly once.

## REGRESSION SWEEP — no pre-existing behaviour broken by the new arm
| Behaviour | Input | Expected | Observed | Status |
|---|---|---|---|---|
| prop access | `process.env.FOO` | `[FOO]` | `[FOO]` | PASS |
| string elem | `process.env["BAR"]` | `[BAR]` | `[BAR]` | PASS |
| const-keyed resolves | `const K='BAZ'; env[K]` | `[BAZ]` | `[BAZ]` | PASS |
| destructure env | `const {A,B}=process.env` | `[A,B]` | `[A,B]` | PASS |
| aliased destructure env | `const {A:a,B:b}=process.env` | `[A,B]` | `[A,B]` | PASS |
| let key not resolved | `let K='FOO'; env[K]` | `[]` | `[]` | PASS |
| reassigned let | `let K='FOO'; K='BAR'; env[K]` | `[]` | `[]` | PASS |
| as const key | `const K='FOO' as const; env[K]` | `[FOO]` | `[FOO]` | PASS |
| bracket process env | `process['env'].HID` | `[HID]` | `[HID]` | PASS |
| computed destr key | `const K='FOO'; const {[K]:v}=process.env` | `[FOO]` | `[FOO]` | PASS |
| ambiguous double const | `const K='FOO'; const K2=1; {const K='BAR';} env[K]` | `[]` | `[]` | PASS |
| import.meta ignored | `import.meta.env.VITE_X` | `[]` | `[]` | PASS |

Legitimate single-binding resolution still works; the new arm only ADDS bindings to the count (the safe / fail-closed direction). No false-negative regression observed.

## SPEC QUALITY (R40 / R74 / R109 / R110 / R75)
- **R40 (assertion strength):** all 11 new cases use `expect([...extractEnvVarRefs(code)]).toEqual([])` — exact-equality assertions, not truthiness. Strong.
- **No `.only` / `.skip` / `xit` / `xdescribe`** anywhere in the spec (grep → NONE).
- **R74 (test:prod ratio):** spec 1420 / scanner 622 ≈ 2.28 — healthy.
- **R75 (banned casts):** `as any` / `as unknown` / `@ts-ignore` / `@ts-expect-error` / `: any` in the two changed files → NONE.
- **R110 (secrets):** secret-shaped tokens in the diff → NONE.
- **R109 (no stub):** real executable logic + assertions; no stubs/TODO placeholders.
- The reformat of the three prior R4 test cases (`[...].join('\n')` collapsed onto one line) is cosmetic (Prettier line-joining); semantics and assertions unchanged — verified by reading the diff.

## R5b DEPTH ADVERSARIAL RE-SWEEP — angry pass for what the destructure fix STILL misses

The fixer (and the documented invariant at `env-discovery.ts:333-336`) claims:
> "A name therefore resolves ONLY when it is bound exactly once in the file and that single binding is a string-valued `const` variable declaration."

`countBindings` now counts three binder kinds: `VariableDeclaration`, `Parameter`, `BindingElement` (each with an `Identifier` name). It does **NOT** count the four other value-introducing **declaration** forms whose name is a direct `Identifier`: `FunctionDeclaration`, `ClassDeclaration`, `EnumDeclaration`, `ModuleDeclaration` (namespace). Each of these introduces a name into scope and can shadow a same-named file-scope string `const` — so the documented invariant is violated and a fabricated env var results. Live-executed against the actual source:

| # | Shape | Input | Expected (per invariant) | Observed | Status |
|---|---|---|---|---|---|
| A1 | nested function-decl shadow | `function f(){ function K(){} return process.env[K]; } const K='FOO';` | `[]` (K bound twice) | `["FOO"]` | **FAIL → R5b-F001** |
| A2 | nested class-decl shadow | `function f(){ class K {} return process.env[K]; } const K='FOO';` | `[]` | `["FOO"]` | **FAIL → R5b-F001** |
| A3 | nested enum-decl shadow | `function f(){ enum K {A} return process.env[K]; } const K='FOO';` | `[]` | `["FOO"]` | **FAIL → R5b-F001** |
| A4 | nested namespace shadow | `function f(){ namespace K {} return process.env[K]; } const K='FOO';` | `[]` | `["FOO"]` | **FAIL → R5b-F001** |
| C1 | control: declaration but no string const | `function f(){ function K(){} return process.env[K]; }` | `[]` | `[]` | PASS (nothing to fabricate) |
| C2 | control: legit single const | `const K='FOO'; process.env[K];` | `[FOO]` | `[FOO]` | PASS |

Non-exploitable adjacent forms (confirmed, NOT findings):
- **Imports** (`import K from 'x'`, `import {K} from 'x'`): ImportClause/ImportSpecifier names are uncounted, but imports are module-scope-only and cannot coexist with a same-named module-scope `const` (redeclaration error) nor appear in a nested scope, so no shadow vector exists. Returned `[]` in tests (no string source).
- **Named function/class expressions** (`const f = function K(){}`): `K` is scoped to the expression body only and cannot collide with a file-scope const at the use site; out of scope.
- `interface` / `type`: type-only, introduce no value binding — irrelevant.

## NEW FINDING

### Finding R5b-F001 — Fail-closed ambiguity guard misses declaration-name shadows (function / class / enum / namespace), fabricating env-var names from same-named single `const`s

**Priority:** P3 (genuine soundness/invariant violation of the established R4/R5 class; lower real-world incidence than the param/destructure shapes already fixed — exploitation requires a nested same-named `FunctionDeclaration`/`ClassDeclaration`/`EnumDeclaration`/`ModuleDeclaration` shadowing a file-scope string `const` with a dynamic `process.env[name]` read in that nested scope. Per the operator zero-finding doctrine, any P0–P3 blocks merge.)
**Rules triggered:** R59 (fail-closed / never-swallow intent), R65 (silent-failure sweep), R109 (completeness of the guard), R11 (exhaustive what-it-silently-accepts sweep), R125 (defense-in-depth — R4 fixed identifier params, R5 fixed binding elements, but the structurally identical *declaration-name* shadows remain unguarded).
**File:** `test/prod-readiness/env-discovery.ts:346-371` (`collectStringConsts.countBindings`)
**Why it's wrong:**
`countBindings` bumps a name for exactly three node kinds whose `.name` is an `Identifier`: `VariableDeclaration`, `Parameter`, `BindingElement`. But a `FunctionDeclaration`, `ClassDeclaration`, `EnumDeclaration`, and `ModuleDeclaration` (namespace) each ALSO carry a direct `Identifier` `.name` and each introduces a value binding into scope. None is counted. AST contract (each `.name` is `SyntaxKind.Identifier`):
```
function K(){}     FunctionDeclaration  name=Identifier "K"   ← introduces value binding K, NOT counted
class K {}         ClassDeclaration     name=Identifier "K"   ← NOT counted
enum K {A}         EnumDeclaration      name=Identifier "K"   ← NOT counted
namespace K {}     ModuleDeclaration    name=Identifier "K"   ← NOT counted
```
When such a declaration shadows a file-scope `const K='FOO'` (string) inside a nested scope, `bindingCounts.get('K')` stays at `1`, the const remains in the resolvable map, and a dynamic `process.env[K]` read *inside the shadowing scope* — where `K` is the function/class/enum/namespace, not the string — resolves to `'FOO'`, **fabricating an env var the code never reads under that name**. This is the identical fail-closed gap as R4-F001 (params) and R5-F001 (binding elements), one binder-kind family deeper. The doc comment at lines 333-336 explicitly promises a name "resolves ONLY when it is bound exactly once in the file" — declaration-name shadows silently violate that invariant.
**Counter-example input (all live-verified against the transpiled source → each yields `["FOO"]`; expected `[]`):**
```ts
function f(){ function K(){} return process.env[K]; }  const K = 'FOO';   // ⇒ ["FOO"]
function f(){ class K {}     return process.env[K]; }  const K = 'FOO';   // ⇒ ["FOO"]
function f(){ enum K {A}     return process.env[K]; }  const K = 'FOO';   // ⇒ ["FOO"]
function f(){ namespace K {} return process.env[K]; }  const K = 'FOO';   // ⇒ ["FOO"]
```
As with R5-F001, the leak is confined to UPPER_SNAKE names by `ENV_VAR_NAME` — but those are precisely the names this scanner classifies, so the false-positive surface is the real one. Effect: a spurious UNDECLARED/TRACKED classification (false ship-block or mis-track), i.e. a false positive, not a false negative.
**Expected fix (findings only — do NOT implement in this audit):**
In `countBindings`, also count the declaration forms whose `.name` is an `Identifier`:
```ts
} else if (
  (ts.isFunctionDeclaration(node) ||
   ts.isClassDeclaration(node) ||
   ts.isEnumDeclaration(node) ||
   ts.isModuleDeclaration(node)) &&
  node.name && ts.isIdentifier(node.name)
) {
  bumpBinding(node.name.text);
}
```
(Guard `node.name &&` because `FunctionDeclaration`/`ClassDeclaration` names are optional, e.g. `export default function(){}`, and `ModuleDeclaration` names can be a string literal for `declare module "x"`.) Add spec regression cases for nested function-decl, class-decl, enum-decl, and namespace shadows — each asserting `[]`. This completes the guard so it actually matches its documented "bound exactly once" invariant.

## DOCTRINE RULE COVERAGE (R1–R126) — highlights
- **R3 PASS** (Bradley author+committer on head `2b45c39e`; body taint-free). **R124 PASS** (head SHA pinned, no drift start/end). **R74 PASS** (test:scanner ≈ 2.28). **R75 PASS** (0 banned casts in diff). **R76 PASS** (test-tree only; `[LOC-EXEMPT]` present in commit body, justified). **R40/R117/R123 PASS** (assertion-bearing spec, no `.skip`/`.only`). **R112 PASS** (no `any`/`unknown` introduced). **R109/R110 PASS** (no stub, no secrets). **R59/R65 PARTIAL** — R5-F001 (binding elements) now CLOSED, but the fail-closed binding-ambiguity guard remains **incomplete for declaration-name shadows** → see R5b-F001.
- Security R24–R36, data R67–R70, concurrency R51–R55, API R80–R99: N/A (pure in-memory static-analysis test harness; no DB/HTTP/auth/PII/payments/UI/IaC surface). Filesystem walk (`walkTs`/`readUtf8OrNull`) unchanged this round: realpath symlink-cycle guard + NUL-byte binary skip intact, read-only repo-rooted, no path-traversal sink.

## SUMMARY
- R5-F001 (destructured BindingElement shadows): **CLOSED** — fix correct, complete for the destructuring class, no double-count, no regression. 11/11 brief cases + 12/12 regression cases pass.
- R5b-F001 (declaration-name shadows: function/class/enum/namespace): **NEW P3** — same fail-closed invariant gap, one binder-family deeper; reproduced live; violates the code's own documented "bound exactly once" contract.

## VERDICT
VERDICT: FINDINGS

# H4 Split Audit — PR #464 (H4.B env-discovery) — Lens A (Opus 4.8) — R5 LIVE

STATUS: PASS COMPLETE — depth sweep finalized 2026-06-23T22:45:00Z

## BUILD MATRIX (R124)
- backend repo: `BradleyGleavePortfolio/growth-project-backend`
- ctx repo: `BradleyGleavePortfolio/tgp-agent-context`
- main HEAD (base): `8467c6f568a51337a7acbfb14f72ac85b996d605`
- PR head SHA audited: `67ade350ed31369360bcbb7e1e9dc9ca40957178` (== recorded R4/R5 head — MATCH)
- PR base SHA: `8467c6f568a51337a7acbfb14f72ac85b996d605`
- branch: `wave-h4b-env-discovery`
- commits since main: 5; head commit `67ade350` = `fix(env-discovery): count param/catch shadows in fail-closed binding map (H4.B R4)`, author+committer `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R3 PASS on prod repo)
- files in diff: `test/prod-readiness/env-discovery.ts` (new, 611 LOC), `test/prod-readiness/env-discovery.spec.ts` (new, 1349 LOC); plus deletes of 5 prior prod modules + 5 prior specs (net prod LOC negative, test-tree)
- audit-repo identity used: **Claude Auditor <auditor@bradleytgpcoaching.com>** (operator-approved fallback for tgp-agent-context ONLY)
- ISO timestamp UTC: 2026-06-23T22:45:00Z
- methodology: LIVE AST execution. Scanner compiled to JS via TypeScript 5.9.3 (`tsc --module commonjs --target ES2020`); `extractEnvVarRefs` / `collectStringConsts` / `extractEnvRuleNames` driven against hand-built adversarial counter-examples; AST node kinds dumped via `ts.SyntaxKind` to verify the compiler-API contract each comment claims.

## R124 FINAL CHECK
Re-ran `git log -1 --format=%H pr464` at sweep start AND end → `67ade350ed31369360bcbb7e1e9dc9ca40957178` both times. No SHA drift. Not INFRA_DEATH.

## R4 FINDING CLOSURE VERIFICATION (R4-F001 / L464-001 — identifier param/catch shadows)
| Probe | Input | Expected | Observed (live) | Status |
|---|---|---|---|---|
| identifier function-param shadow | `function f(K){return process.env[K];} const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| identifier arrow-param shadow | `const g=(K)=>process.env[K]; const K='BAR';` | `[]` | `[]` | CLOSED ✓ |
| identifier method-param shadow | `class C{m(K){return process.env[K];}} const K='ZAP';` | `[]` | `[]` | CLOSED ✓ |
| param-only, no const | `function f(K){return process.env[K];}` | `[]` | `[]` | CLOSED ✓ |

The `ts.isParameter(node) && ts.isIdentifier(node.name)` arm added at env-discovery.ts:352-358 closes the **identifier-named** parameter case. Verified live.

## CATCH-CLAUSE INTENTIONAL DEVIATION — REASONING CONFIRMED CORRECT (brief mandate)
The fixer deliberately did NOT add a `ts.CatchClause` arm and documented the reasoning at env-discovery.ts:347-349 / 327-331. I verified this against the TS compiler-API contract by dumping the AST:

```
try{}catch(K){process.env[K];}
  TryStatement → CatchClause
    VariableDeclaration  nameKind=Identifier   ← catch var IS a VariableDeclaration
      Identifier "K"
```

A catch-clause variable parses as a `ts.VariableDeclaration` whose `parent` is the `CatchClause` and whose `name` is an `Identifier`. It is therefore ALREADY counted by the existing `ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)` branch (env-discovery.ts:350-351). Adding a separate `CatchClause` arm would double-count the same node and would (in single-binding cases) corrupt legitimate resolution.

Live confirmation of the exact probe the brief specified:
| Input | Expected | Observed | Status |
|---|---|---|---|
| `try{}catch(K){process.env[K];} const K='QUX';` | `[]` (K bound twice → ambiguous → dropped) | `[]` | CORRECT ✓ |
| `try{}catch(K){process.env[K];}` (K sole binding, no const) | `[]` (no const to fabricate from) | `[]` | CORRECT ✓ |
| `const K='FOO'; process.env[K]; try{}catch(M){}` (separate catch var) | `[FOO]` (K bound once) | `[FOO]` | CORRECT ✓ |

**Verdict on the deviation: the fixer's reasoning HOLDS and is correct.** No finding here.

## R5 DEPTH ADVERSARIAL SWEEP (live AST execution)
| # | Category | Input | Expected | Observed | Status |
|---|---|---|---|---|---|
| 1 | prop access | `process.env.FOO` | `[FOO]` | `[FOO]` | PASS |
| 2 | string elem | `process.env['FOO']` | `[FOO]` | `[FOO]` | PASS |
| 3 | const-keyed | `const K='FOO'; process.env[K]` | `[FOO]` | `[FOO]` | PASS |
| 4 | destructure | `const {FOO,BAR}=process.env` | `[BAR,FOO]` | `[BAR,FOO]` | PASS |
| 5 | rename `{FOO: bar}` | uses propertyName | `[FOO]` | `[FOO]` | PASS |
| 6 | rename+default `{FOO: bar='x'}` | `[FOO]` | `[FOO]` | PASS |
| 7 | default `{FOO='x'}` | `[FOO]` | `[FOO]` | PASS |
| 8 | rest `{FOO, ...rest}` | `[FOO]` | `[FOO]` | PASS |
| 9 | nested `{FOO:{BAR}}` (FOO is the env key) | `[FOO]` | `[FOO]` | PASS |
| 10 | computed literal `{["FOO"]:x}` | `[FOO]` | `[FOO]` | PASS |
| 11 | computed const `const K='FOO';{[K]:x}` | `[FOO]` | `[FOO]` | PASS |
| 12 | array binding `const [a]=process.env` | `[]` | `[]` | PASS |
| 13 | aliased lowercase prop `{foo: BAR}` | `[]` (key `foo` fails ENV_VAR_NAME) | `[]` | PASS |
| 14 | as const | `const K='FOO' as const; env[K]` | `[FOO]` | `[FOO]` | PASS |
| 15 | satisfies | `const K=('FOO' satisfies string); env[K]` | `[FOO]` | `[FOO]` | PASS |
| 16 | paren | `const K=('FOO'); env[K]` | `[FOO]` | `[FOO]` | PASS |
| 17 | angle cast | `const K=<string>'FOO'; env[K]` | `[FOO]` | `[FOO]` | PASS |
| 18 | non-null on string | `const K='FOO'!; env[K]` | `[FOO]` | `[FOO]` | PASS |
| 19 | no-subst template | `` const K=`FOO`; env[K] `` | `[FOO]` | `[FOO]` | PASS |
| 20 | template with subst | `` const K=`FOO${x}`; env[K] `` | `[]` | `[]` | PASS |
| 21 | let reassigned | `let K='FOO'; K='BAR'; env[K]` | `[]` | `[]` | PASS |
| 22 | var hoist | `env[K]; var K='FOO'` | `[]` | `[]` | PASS |
| 23 | const decl-after-use | `env[K]; const K='FOO'` | `[FOO]` (static; over-discovery is the safe direction) | `[FOO]` | PASS |
| 24 | dead code after return | `function f(){return; process.env.DEAD_VAR;}` | `[DEAD_VAR]` (intentional over-discovery) | `[DEAD_VAR]` | PASS |
| 25 | `if(false){}` block | `if(false){process.env.NEVER;}` | `[NEVER]` (intentional) | `[NEVER]` | PASS |
| 26 | block-const shadow | `const K='FOO';{const K='FOO';}env[K]` | `[]` (2 var-decls → ambiguous) | `[]` | PASS |
| 27 | let-shadow-const | `const K='FOO'; let K... ; env[K]` | `[]` | `[]` | PASS |
| 28 | **obj-destructured param `{K}`** | **`[]`** (param binds K dynamically) | **`[FOO]`** | **FAIL → R5-F001** |
| 29 | **arr-destructured param `[K]`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 30 | **renamed destructured param `{x:K}`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 31 | **arrow obj-destructured param `({K})`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 32 | **nested destructured param `{a:{K}}`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 33 | **destructured const-decl `const {K}=o`** | **`[]`** (K is a 2nd binding of the name) | **`[FOO]`** | **FAIL → R5-F001** |
| 34 | **destructured arr const-decl `const [K]=a`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 35 | **renamed destructure const-decl `const {x:K}=o`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 36 | **let destructure `let {K}=o`** | **`[]`** | **`[FOO]`** | **FAIL → R5-F001** |
| 37 | rest param `...K` | `[]` | `[]` | PASS (rest-param name is the Parameter's own Identifier → counted) |
| 38 | default-valued ident param `K=1` | `[]` | `[]` | PASS |
| 39 | ENV_RULES as-const/satisfies/reorder | (re-derived, R4 baseline) | correct | PASS |

## NEW FINDINGS

## Finding R5-F001 — Fail-closed ambiguity guard misses destructured binding-element shadows (binding patterns in params AND variable declarations), fabricating env-var names from same-named single `const`s

**Priority:** P2
**Rules triggered:** R59 (fail-closed / never-swallow intent), R65 (#36 silent-failure / 50-failures sweep), R109 (no-stub / completeness of the guard), R11 (exhaustive what-it-silently-accepts sweep), R125 (defense-in-depth — the R4 fix patched one binding shape but not the structurally identical sibling shapes)
**File:** `test/prod-readiness/env-discovery.ts:346-360` (`collectStringConsts.countBindings`)
**Code:**
```ts
const countBindings = (node: ts.Node): void => {
  // A catch-clause variable is itself a VariableDeclaration node (parent =
  // CatchClause), so this branch already counts catch bindings — no separate
  // CatchClause case is needed, and adding one would double-count.
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    bumpBinding(node.name.text);
  } else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
    bumpBinding(node.name.text);
  }
  ts.forEachChild(node, countBindings);
};
```
**Why it's wrong:**
The binding-count walk only bumps a name when the node's `name` is a *direct* `ts.Identifier`. Names introduced through a **binding pattern** are carried on `ts.BindingElement` nodes, not on the `VariableDeclaration`/`Parameter` node itself — the declaration's `name` is an `ObjectBindingPattern` / `ArrayBindingPattern` (NOT an Identifier), so neither arm fires, and the inner `BindingElement` identifier is never counted. AST contract (dumped live with `ts.SyntaxKind`):
```
function f({K}){...}
  Parameter  nameKind=ObjectBindingPattern        ← Parameter.name is NOT an Identifier
    ObjectBindingPattern
      BindingElement nameKind=Identifier "K"       ← the real binding, never counted

const {K}=o
  VariableDeclaration  nameKind=ObjectBindingPattern   ← same: name is a pattern, not Identifier
    ObjectBindingPattern
      BindingElement nameKind=Identifier "K"
```
Because the destructured `K` is not counted, a same-named single file-scope `const K='FOO'` keeps `bindingCounts.get('K') === 1`, stays in the resolvable map, and a dynamic `process.env[K]` read *inside the scope where the destructured `K` shadows it* resolves to `FOO` — fabricating an env var that the code never actually reads under that name. This is the **identical fail-closed gap as R4-F001**, one structural layer deeper: the R4 fixer patched the `Identifier`-named parameter shape but left every binding-pattern shape (destructured params AND destructured variable declarations, object/array/nested/renamed) unguarded. The doc comment at lines 313-336 claims the map "resolves ONLY when [a name] is bound exactly once in the file" — destructured bindings violate that invariant silently. Effect: a spurious UNDECLARED/TRACKED classification (false ship-block or mis-track), i.e. a false positive, not a false negative.
**Counter-example input (all live-verified → each yields `["FOO"]` / `["DATABASE_URL"]`; expected `[]`):**
```ts
// (a) object-destructured parameter — realistic env-helper shape
function f({KEY}) { return process.env[KEY]; }  const KEY = 'DATABASE_URL';   // ⇒ ["DATABASE_URL"]  (should be [])
// (b) array-destructured parameter
function f([K])  { return process.env[K];   }  const K = 'FOO';              // ⇒ ["FOO"]           (should be [])
// (c) renamed / nested destructured parameter
const g = ({x: K}) => process.env[K];          const K = 'FOO';              // ⇒ ["FOO"]
function h({a:{K}}) { return process.env[K]; }  const K = 'FOO';             // ⇒ ["FOO"]
// (d) destructured *variable declaration* shadow (no param involved)
const o = { K: 1 }; const { K } = o;  const K = 'FOO';  process.env[K];      // ⇒ ["FOO"]
const a = [1];      const [K] = a;    const K = 'FOO';  process.env[K];      // ⇒ ["FOO"]
let   { K } = o;                      const K = 'FOO';  process.env[K];      // ⇒ ["FOO"]
```
Lowercase shadows (`{k}`/`const k='foo'`) are still gated out by `ENV_VAR_NAME`, so the leak is confined to UPPER_SNAKE names — but those are exactly the env-var-shaped names this scanner classifies, so the false-positive surface is the real one.
**Expected fix:**
In `countBindings`, also count `ts.isBindingElement(node) && ts.isIdentifier(node.name)` toward `bindingCounts` (a BindingElement's `name` identifier is the bound name; its optional `propertyName` is the source key and must NOT be counted). This makes any name introduced by an object/array/nested/renamed binding pattern — in a parameter OR a variable declaration — count as a binding, so a same-named `const` becomes ambiguous and is dropped (fail-closed), matching the catch/identifier-param behaviour. Add spec cases for: obj-destructured param `{K}`, arr-destructured param `[K]`, renamed `{x:K}`, nested `{a:{K}}`, arrow `({K})`, and a destructured variable-declaration shadow `const {K}=o` — each asserting empty resolution. Do NOT write the fix in this audit (findings only).

## DOCTRINE RULE COVERAGE (R1–R126) — highlights
- R3 PASS (Bradley on all 5 prod commits; head `67ade350`). R124 PASS (head SHA pinned, no drift). R74 PASS (test:scanner ratio ≈ 2.1). R75 PASS (0 net banned-cast). R76 PASS (test-tree; net prod LOC negative). R40/R117/R123 PASS (assertion-bearing spec, no `.skip`). R112 PASS (no `any`/`unknown` introduced). R66/R111 PASS (no dead/unused decls). R110 PASS (no secrets in diff/history). R118/R103 PASS (CodeQL surface — pure static analysis, no sink).
- R59 / R65 / R109 / R11 / R125: the F002 fail-closed binding-ambiguity guard is **incomplete for binding-pattern shadows** → see R5-F001.
- Security R24–R36, data R67–R70, concurrency R51–R55, API R80–R99: N/A (pure in-memory static-analysis test harness; no DB/HTTP/auth/PII/payments/UI/IaC surface). Filesystem walk (`walkTs`/`readUtf8OrNull`) re-confirmed: realpath-tracked symlink-cycle guard intact, NUL-byte binary skip intact, no path-traversal sink (read-only, repo-rooted).

## VERDICT
VERDICT: FINDINGS

# H4 Split Lens B R5 — PR #464 LIVE

## BUILD MATRIX (R124)

```
backend repo:    BradleyGleavePortfolio/growth-project-backend
ctx repo:        BradleyGleavePortfolio/tgp-agent-context
main HEAD:       8467c6f568a51337a7acbfb14f72ac85b996d605
PR head SHA:     67ade350ed31369360bcbb7e1e9dc9ca40957178
PR base SHA:     8467c6f568a51337a7acbfb14f72ac85b996d605
ISO timestamp:   2026-06-23T22:42:07Z
```

## Scope swept

- Confirmed `git log -1 --format=%H pr464` = `67ade350ed31369360bcbb7e1e9dc9ca40957178` at audit start and again before verdict.
- Read the binding R5 brief, full rule set, both R4 reports, and the original builder report.
- Walked the PR diff and line-read `test/prod-readiness/env-discovery.ts` and `test/prod-readiness/env-discovery.spec.ts`.
- Checked R75 raw-token additions in the target diff: none found.
- Checked target diff whitespace: clean.
- Counted target spec shape: 162 test blocks, 209 assertion calls, 0 skipped/only blocks.
- Verified the R4-required direct parameter and direct catch shadow cases by executing the audited scanner: `paramIdentifier []`, `catchIdentifier []`.
- Verified the R4 brief deviation on catch handling: a direct `catch (K)` binding is represented as a `VariableDeclaration` under `CatchClause`, so adding a separate catch arm for direct identifiers would double-count.

## Finding R5-F001 — Destructured bindings still bypass fail-closed const-key ambiguity

**Priority:** P2
**Rules triggered:** R10, R11, R40, R59, R65, R108, R109, R117
**File:** `test/prod-readiness/env-discovery.ts:350-357`
**Code:**
```ts
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      bumpBinding(node.name.text);
    } else if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
      // Function, method, and arrow-function parameters all parse as
      // ParameterDeclaration (NOT VariableDeclaration), so the original walk
      // missed them. A parameter shadows any file-scope const of the same name
      // inside the body, so it must count toward ambiguity (R4 F001).
      bumpBinding(node.name.text);
    }
```
**Why it's wrong:**
The ambiguity map now counts direct identifier variable declarations and direct identifier parameters, but it still ignores identifiers introduced inside binding patterns (`BindingElement`). A destructured parameter, destructured catch binding, or destructured loop variable named `K` can shadow a same-named file-scope string const; the scanner then resolves `process.env[K]` inside the dynamic scope to the file-scope const and fabricates an env-var name. The R4 regression tests cover only direct `K` parameters/catch variables, so the missing binding-pattern branch is not pinned.

**Counter-example input:**
```ts
function f({ K }) { return process.env[K]; }
const K = 'FOO';
```
Focused execution against the audited implementation produced:
```text
destructuredParam ["FOO"]
destructuredArrowParam ["BAR"]
destructuredCatch ["QUX"]
forOfDestructure ["LOOP"]
```
Each should be empty because `K` is dynamic inside the local binding scope and the file-wide resolver has no lexical-scope tracking.

**Expected fix:**
Count all identifier bindings inside binding patterns, not just direct `VariableDeclaration.name` and direct `Parameter.name` identifiers. Recursively walk `BindingName` nodes for variables, parameters, catch variables, and loop declarations; bump every `BindingElement` identifier so any same-named const becomes ambiguous and is dropped. Add regression tests for destructured function parameters, arrow parameters, catch bindings, and `for...of` destructuring asserting an empty discovery result.

VERDICT: FINDINGS

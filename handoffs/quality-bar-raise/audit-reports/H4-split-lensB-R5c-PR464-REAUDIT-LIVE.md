# H4.B PR #464 — R5c RE-AUDIT (round 3, post-R5b-fixer) — Lens B (BREADTH) — LIVE

## BUILD MATRIX (R124)

```
backend repo:    BradleyGleavePortfolio/growth-project-backend
ctx repo:        BradleyGleavePortfolio/tgp-agent-context
main HEAD (base): 8467c6f568a51337a7acbfb14f72ac85b996d605
PR head audited:  36a0aba4f77a48ab53fab7967cac83c5e5d919cd  (post-R5b-fixer)
prior R5b head:   2b45c39e29814e2633e305b50bffe3bb232cb867
branch:           wave-h4b-env-discovery
audit-repo id:    Claude Auditor <auditor@bradleytgpcoaching.com>  (operator-approved fallback, ctx ONLY)
ISO timestamp:    2026-06-24T00:30:00Z
lens role:        BREADTH (contracts, exported surface, test-shape, regex, R75/R40/R3, imports, determinism, CI, file boundaries)
methodology:      Static line-read of the R5b commit (36a0aba) prod + spec deltas + surrounding
                  collectStringConsts region; TS AST-API reasoning for guard discrimination;
                  R75 grep on added lines only; R3 git log over the whole branch.
                  (Jest + typescript NOT installed in this sparse worktree — no node_modules;
                  LIVE execution unavailable this round, so guard discrimination is established
                  by TS-compiler-API contract reasoning, stated explicitly below.)
```

## R124 SHA PIN
`git rev-parse HEAD` == `36a0aba4f77a48ab53fab7967cac83c5e5d919cd` at audit START and again at audit END. **No drift.** Not INFRA_DEATH.

## Scope swept
- Read in full: this re-audit brief, R5b fixer brief, prior R5/R5b Lens A + Lens B reports.
- R5b fixer pass = exactly ONE commit on top of R5 head: `36a0aba` (`2b45c39..36a0aba`).
- Line-read the R5b prod delta (`env-discovery.ts` +17: new 4th arm in `countBindings`) and spec delta (`env-discovery.spec.ts` +74: 8 new cases) and the full `collectStringConsts` region (lines 338-411).
- R3 / R75 / R40 / R74 / LOC / imports / determinism / file-boundary / CI / exported-contract sweeps, then re-swept angrily for discrimination gaps.

## PRIOR FINDING CLOSURE

### R5b-F001 Lens A (FunctionDeclaration/ClassDeclaration/EnumDeclaration/ModuleDeclaration names un-counted) → **CLOSED ✓ (prod)**
The fixer added the prescribed 4th arm to `countBindings` (`env-discovery.ts:369-386`):
```ts
} else if (
  (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) ||
   ts.isEnumDeclaration(node) || ts.isModuleDeclaration(node)) &&
  node.name && ts.isIdentifier(node.name)
) {
  bumpBinding(node.name.text);
}
```
Logic is sound: each named declaration introduces a value binding that can shadow a same-named file-scope const, so counting it makes the const ambiguous (bound > 1) → dropped per the R59 fail-closed policy. The arm only ever *increases* a name's count, so it can only drop genuinely multiply-bound names — no legitimate single-const resolution is lost. The `node.name &&` guard correctly handles anonymous default exports; the `ts.isIdentifier` guard correctly skips string-literal module names. Recursion via `ts.forEachChild` reaches nested declarations. **Production code: correct.**

### R5b-F001 Lens B (propertyName non-discriminating regression test) → **CLOSED ✓**
New discriminating case at spec:1116 — `const {x:K}=o; const x='FOO'; process.env[x]` expects `['FOO']`. If `propertyName` "x" were wrongly counted, "x" would be bound twice → ambiguous → dropped → `[]`. So `['FOO']` vs `[]` genuinely flips on the invariant. **Discriminating. Closed.**

## NEW FINDING — R5c-F001 (P3, Lens B, test-efficacy)

**The R5b fixer's own new control test (case 8) repeats the exact non-discrimination defect it was dispatched to fix.**

The new guard has TWO halves: `node.name &&` (null-guard for anonymous default exports) AND `ts.isIdentifier(node.name)` (type-guard for string-literal module names). The 3 control cases were meant to pin both halves:

- **Cases 6 & 7** (`export default function(){}` / `export default class {}` + `const K='FOO'` + `process.env[K]` → `['FOO']`) — **DISCRIMINATING for the `node.name &&` half. ✓** With `node.name &&` removed, `ts.isIdentifier(undefined)` evaluates `undefined.kind` → throws `TypeError`, so `extractEnvVarRefs` throws and the `toEqual(['FOO'])` assertion fails red. Good.

- **Case 8** (`declare module "x" {}` + `const K='FOO'` + `process.env[K]` → `['FOO']`) — **NON-DISCRIMINATING for the `ts.isIdentifier(node.name)` half. ✗**

  TS-API contract: `ts.ModuleDeclaration.name` for `declare module "x"` is a `ts.StringLiteral`, and `StringLiteral` carries a `.text` property (value `"x"`) exactly like `Identifier`. If `ts.isIdentifier(node.name)` were dropped from the guard (keeping `node.name &&`), `bumpBinding(node.name.text)` would run with `node.name.text === "x"` — **no throw**, and it bumps the name `"x"`, NOT `"K"`. The const `K` therefore stays bound-once and still resolves `'FOO'`. **Result is `['FOO']` whether or not the `isIdentifier` guard is present** → the test ships green under regression of the invariant it names.

  This is the SAME defect class — a control whose two outcomes don't diverge on the invariant — that R5b just closed for `propertyName`. The fixer fixed one instance and introduced another for the sibling guard-half. The test's "no throw" claim is vacuously true (StringLiteral.text always resolves), and "no pollution" is invisible because the chosen module name `"x"` can never collide with the chosen const name `"K"`.

  **Discriminating fix (test-only):** make the module name collide with the const name —
  ```ts
  const code = ['declare module "K" {}', "const K = 'FOO';", 'const v = process.env[K];'].join('\n');
  expect([...extractEnvVarRefs(code)]).toEqual(['FOO']);
  ```
  With the `isIdentifier` guard present (correct): the string module name `"K"` is skipped, `K` is bound once → `['FOO']`. With `isIdentifier` dropped: `"K"` gets bumped from the StringLiteral name → `K` bound twice → ambiguous → dropped → `[]`. The two halves now diverge → the control pins the guard.

  **Severity P3:** production code is correct (the `isIdentifier` guard works); this is purely a future-regression-pinning gap, identical in kind and severity to the prior round's accepted propertyName finding. No runtime/security impact.

## BREADTH SWEEP (R3 / R75 / R40 / R74 / LOC / imports / determinism / boundaries / CI / contract)

| Axis | Result |
|---|---|
| **R3 commit identity** (R5b pass `2b45c39..36a0aba`, and all 7 branch commits `8467c6f..HEAD`) | Every branch commit author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No Claude/AI/Agent/Assistant/Co-authored token in any body or trailer. **PASS.** |
| **R75 banned tokens** (added 91 LOC only) | grep for `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>...)` spaced variants, `Coming soon`, `lorem`, `John Doe`, `foo@bar.com` → **NONE.** PASS. |
| **R40 assertion quality** (8 new cases) | All 8 use `expect([...extractEnvVarRefs(code)]).toEqual([...])` — strong value equality, no `toBeDefined`/`toBeTruthy`/`not.toThrow`/`expect(true)`. 7 of 8 discriminate their named invariant; **case 8 does not** (R5c-F001 above). The 4 shadow cases (2-5) each flip `[]`→`['FOO']` if their specific binder clause is removed from the prod arm — strong. (One pre-existing `toBeDefined` at spec:239 is a guard immediately followed by stronger `toBe` chains — not in this round's diff, not a finding.) |
| **R74 test-to-prod ratio** (R5b diff) | +17 prod / +74 spec = **4.35×**. Strong. |
| **LOC budget** | `[LOC-EXEMPT] test-tree only` marker present in R5b commit body. +91 LOC. PASS. |
| **Imports / new module surface** | R5b prod delta adds **zero** imports (uses already-imported `ts.*` predicates). PASS. |
| **Exported contract** | `collectStringConsts` remains **un-exported** (internal); tests exercise it only through the public `extractEnvVarRefs` boundary — correct contract-level testing. Exported surface unchanged by R5b. PASS. |
| **Determinism** | New arm uses the same `bumpBinding` Map + deterministic `ts.forEachChild` walk; order-independent counting. No nondeterminism introduced. PASS. |
| **Secret leakage** | New test literals are `'FOO'` only (plus pre-existing `BAR`/`QUX`/`LOOP`). No secrets. PASS. |
| **File boundaries** | R5b diff touches exactly `test/prod-readiness/env-discovery.ts` and `…/env-discovery.spec.ts`. No prod-app/CI/config files. PASS. |
| **CI surface** | Pure parse-only AST counting (`ts.createSourceFile`, no type-checker, no I/O in `countBindings`). No new CI surface. PASS. |
| **Double-count / double-arm match** | Checked: a single AST node cannot satisfy two arms (VariableDeclaration / Parameter / BindingElement / the 4 Declaration kinds are mutually-exclusive `node.kind` values). Catch-var double-count explicitly avoided (comment at :347, catch binding is itself a VariableDeclaration). No double-count risk. PASS. |

## ANGRY OVER-SWEEP NOTES
- The 4 shadow cases (function/class/enum/namespace) rely on `ts.createSourceFile` producing the corresponding declaration node even for semantically-questionable nesting (e.g. `namespace K {}` inside a function body). The parser is lenient and emits the node regardless of semantic validity, so `countBindings` sees it — the cases are structurally valid. (Could not LIVE-confirm this round: no node_modules. Confidence high from TS-parser contract; flagged as the single execution-coverage caveat.)
- No `.skip` / `.only` / `xit` anywhere in the spec. 176 `it` blocks, 228 `expect` calls.
- The `node.name &&` half being discriminated by a *thrown TypeError* (cases 6/7) rather than a value divergence is acceptable — a throw fails the `toEqual` just as cleanly — but it means both control halves lean on indirect signals; the proposed `declare module "K"` shape is the cleaner value-divergence pin for the `isIdentifier` half.

## VERDICT RATIONALE
Production code across all rounds is correct and fail-closed. One **P3 test-efficacy** finding: the R5b-added string-literal-module control (case 8) is non-discriminating for the `ts.isIdentifier(node.name)` guard-half — the identical defect class the same commit closed for propertyName — so a future edit dropping that guard-half would ship green. Test-only, no runtime impact, low severity, but it is a real and actionable gap under the "find ANY problem" mandate.

VERDICT: FINDINGS

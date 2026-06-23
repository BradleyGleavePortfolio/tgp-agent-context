# H4.B PR #464 — R5 RE-AUDIT — Lens B (BREADTH) — LIVE

## BUILD MATRIX (R124)

```
backend repo:    BradleyGleavePortfolio/growth-project-backend
ctx repo:        BradleyGleavePortfolio/tgp-agent-context
main HEAD (base): 8467c6f568a51337a7acbfb14f72ac85b996d605
PR head audited:  2b45c39e29814e2633e305b50bffe3bb232cb867  (post-R5-fixer)
prior R5 head:    67ade350ed31369360bcbb7e1e9dc9ca40957178
branch:           wave-h4b-env-discovery
audit-repo id:    Claude Auditor <auditor@bradleytgpcoaching.com>  (operator-approved fallback, ctx ONLY)
ISO timestamp:    2026-06-23T23:10:00Z
lens role:        BREADTH (contracts, exported surface, test-shape, regex, R75/R40/R3, imports, determinism, CI, file boundaries)
methodology:      LIVE AST execution — env-discovery.ts + registry-loader.ts compiled via TypeScript 5.9.3
                  (tsc --module commonjs --target ES2020), extractEnvVarRefs() driven against 28 adversarial
                  counter-examples incl. the exact R5-F001 closure inputs and propertyName-discrimination probes.
```

## R124 SHA PIN
`git rev-parse HEAD` == `2b45c39e29814e2633e305b50bffe3bb232cb867` at audit START and again at audit END. **No drift.** Not INFRA_DEATH.

## Scope swept
- Read in full: re-audit brief, R5 fixer brief, prior R5 Lens A + Lens B reports.
- Fixer pass = exactly ONE commit on top of R4 head: `2b45c39` (`67ade35..2b45c39`).
- Line-read the fixer prod delta (`env-discovery.ts` +11) and spec delta (`env-discovery.spec.ts` +83/-12) and the surrounding `collectStringConsts` region.
- LIVE-executed the compiled scanner against R5-F001 closure inputs, non-regression inputs, exotic binding shapes, and a propertyName-discrimination probe.
- R3 / R75 / R40 / R74 / LOC / imports / determinism / file-boundary / CI sweeps (below), then re-swept angrily.

## PRIOR FINDING CLOSURE — R5-F001 (BindingElement identifiers un-counted) → **CLOSED ✓**
The fixer added the prescribed third arm to `countBindings` (`env-discovery.ts:358-368`):
```ts
} else if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) {
  bumpBinding(node.name.text);
}
```
LIVE execution — every converged R5-F001 input now resolves `[]` (was fabricating an env-var):

| # | Input | Expected | Observed (live) | Status |
|---|---|---|---|---|
| 1 | `function f({K}){return process.env[K];} const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 2 | `function f([K]){return process.env[K];} const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 3 | `const g=({K})=>process.env[K]; const K='FOO';` | `[]` | `[]` | CLOSED ✓ |
| 4 | `const g=({x:K})=>process.env[K]; const K='FOO';` (rename) | `[]` | `[]` | CLOSED ✓ |
| 5 | `function h({a:{K}}){return process.env[K];} const K='FOO';` (nested) | `[]` | `[]` | CLOSED ✓ |
| 6 | `try{}catch({K}){void process.env[K];} const K='QUX';` | `[]` | `[]` | CLOSED ✓ |
| 7 | `for(const {K} of arr){void process.env[K];} const K='LOOP';` | `[]` | `[]` | CLOSED ✓ |
| 8 | `const {K}=o; const K='FOO'; const v=process.env[K];` | `[]` | `[]` | CLOSED ✓ |
| 9 | `const [K]=a; const K='FOO'; const v=process.env[K];` | `[]` | `[]` | CLOSED ✓ |
| 10 | `let {K}=o; const K='FOO'; const v=process.env[K];` | `[]` | `[]` | CLOSED ✓ |

**Angry over-sweep — 12 EXOTIC shapes NOT in the spec, all correctly fail-closed (live):** for-in/for-of non-destructured `K`, `{a:[K]}`, `[[K]]`, `{K=1}`, `[K=1]`, `for(const [K] of o)`, `{...K}` obj-rest, module-scope `{K=1}`, double-destructure same name, obj-rest param `{...K}`, arr-rest param `[...K]` — **every one resolved `[]`.** The recursive `ts.forEachChild(node, countBindings)` reaches every `BindingElement` regardless of nesting depth, so the fix is structurally complete, not just patched for the enumerated cases.

**Non-regression (live):** `const K='FOO'; process.env[K]` → `["FOO"]` ✓; `process.env.FOO` → `["FOO"]` ✓. The new arm only ever *increases* a name's binding count, so it can only drop names that are genuinely multiply-bound (strictly fail-closed) — no legitimate single-const resolution is lost.

## BREADTH SWEEP (R3 / R75 / R40 / R74 / LOC / imports / determinism / boundaries / CI)

| Axis | Result |
|---|---|
| **R3 commit identity** (fixer pass `67ade35..2b45c39`) | `2b45c39` author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No Claude/AI/Agent/Assistant/Co-authored token in body, trailer, or fields. **PASS.** (Branch ancestry contains dependabot/GitHub commits, but those are repo history shared with main's lineage — not part of this PR's changeset; the PR diff is the 12-file set below.) |
| **R75 banned tokens** (added lines only) | grep of `^\+` lines for `@ts-ignore`/`as any`/`as unknown`/`as never`/`.catch(()=>…)`/`Coming soon`/`lorem ipsum`/`John Doe`/`foo@bar`/TODO/FIXME → **NONE. PASS.** |
| **R40 assertion quality** (new spec) | All 11 new `it()` blocks assert `expect([...extractEnvVarRefs(code)]).toEqual([])` — concrete value equality, no `toBeDefined`/`toBeTruthy`/`not.toThrow`/`expect(true)`. **PASS** (one caveat → R5b-F001 below). |
| **.skip/.only/xit/fit** | NONE in the new spec or whole file. **PASS.** |
| **R74 test:prod ratio** (fixer diff) | prod +11 / 0; test +83 / -12. Test-heavy. **PASS.** |
| **LOC budget** | `[LOC-EXEMPT] test-tree only` marker present in commit body. Whole-PR net = 2042 ins − 3339 del (negative). **PASS.** |
| **Imports / new module surface** | Fixer diff adds NO imports; the change is a single `else if` arm inside existing `collectStringConsts`. No new module surface. **PASS.** |
| **Exported contract** | `collectStringConsts` is module-internal (not exported); exported surface (`extractEnvVarRefs`, `discoverEnvVars`, …) unchanged. No contract change. **PASS.** |
| **Determinism** | `countBindings` and both passes use `ts.forEachChild` (source-order, deterministic); `extractEnvVarRefs` returns a `Set` in source-insertion order. Re-ran probes twice — identical output. **PASS.** |
| **Secret leakage** | New test literals are `'FOO'/'BAR'/'QUX'/'LOOP'`. No secrets. **PASS.** |
| **File boundaries** | Whole PR touches only `test/prod-readiness/*` + deletion of root `OPERATOR_KEYS_NEEDED.md` (doc for the deleted `operator-keys-generator`). No `src/`, no CI/workflow, no IaC. **PASS.** |
| **CodeQL / sink surface** | Pure in-memory AST counting; no new sink, no fs/network path introduced by the fixer. **PASS.** |
| **tsc type-safety** | `ts.isBindingElement` / `ts.isIdentifier` are real TS compiler-API guards; `node.name.text` is `string`. Type-safe (compile emitted; only environmental `@types/node`-missing notices). **PASS.** |

## NEW FINDING

### R5b-F001 — Spec case 11 ("does not count propertyName") is non-discriminating: it cannot fail if `propertyName` WERE wrongly counted
**Priority:** P3
**Rules:** R40 (assertion must actually validate the claimed behavior), R117 (regression must pin the invariant it names)
**File:** `test/prod-readiness/env-discovery.spec.ts` — the 11th new case:
```ts
it('does not count propertyName: a renamed-only destructure with no string source resolves []', () => {
  const code = ['const { x: K } = o;', 'const v = process.env[K];'].join('\n');
  expect([...extractEnvVarRefs(code)]).toEqual([]);
});
```
**Why it's weak (root cause + counter-example):**
The whole point of the fixer carefully bumping `BindingElement.name` and NOT `BindingElement.propertyName` is the invariant *"the source key `x` in `{x: K}` is never counted as a binding."* This case is named and commented to lock that invariant — but its assertion cannot detect a violation of it. In `const {x:K}=o; process.env[K]`, `K` is bound once and there is no string-valued const source for `K`, so the result is `[]` **whether or not `propertyName` is counted** (counting `x` would only set `bindingCounts['x']=1`, which never touches `K`'s resolvability). The test would stay green under the exact regression it claims to guard against.

A test that *does* discriminate (LIVE-verified against this head → `["FOO"]`, and would flip to `[]` if `propertyName` were ever counted):
```ts
// propertyName `x` must NOT be counted: x stays bound-once and resolves to FOO
const { x: K } = o;
const x = 'FOO';
const v = process.env[x];
// expect ["FOO"]; if propertyName x were counted, x→ambiguous→dropped→[]
```
**Live evidence:** I ran both. Case-11-as-written → `[]` (passes regardless). The discriminating probe above → `["FOO"]` — confirming the *prod code is correct* (propertyName genuinely not counted), but the *regression suite does not pin it*.
**Severity rationale:** Production behavior is CORRECT and live-verified — this is a **test-efficacy gap, not a prod defect**. The propertyName-non-count invariant currently has zero discriminating coverage, so a future edit that counts `propertyName` would ship green. Surfacing under the operator's "find ANY problem" mandate and the brief's explicit question ("does the spec actually test that propertyName is NOT counted, or just that the binding resolves cleanly?"). Answer: **it does not test it.**
**Expected fix:** Replace or augment case 11 with the discriminating shape above (a file-scope `const x='FOO'` used as `process.env[x]` alongside `const {x:K}=o`), asserting `["FOO"]`. One test case, test-tree only.

## DEPTH/BREADTH PROBE LEDGER (live)
- R5-F001 closure: 10/10 brief inputs → `[]` ✓
- Angry exotic over-sweep: 12/12 additional binding shapes → `[]` ✓
- Non-regression: single-const + prop-access still resolve ✓
- propertyName discrimination: prod correct (`["FOO"]`); spec does not pin → R5b-F001
- Determinism: stable across repeated runs ✓

## VERDICT
VERDICT: FINDINGS

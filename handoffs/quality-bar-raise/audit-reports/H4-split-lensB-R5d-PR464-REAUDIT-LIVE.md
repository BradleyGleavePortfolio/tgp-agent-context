# H4.B PR #464 — R5d RE-AUDIT (Lens B, BREADTH, GPT-5.5)

## VERDICT: FINDINGS (1 × P3, test-efficacy)

One low-severity, suite-mitigated test-efficacy finding (`R5d-F001-LensB`). All
soundness axes, both R5c-fixer changes, R3/R75/R40/R74/LOC/imports/boundary/
determinism/double-arm/CI sweeps are otherwise CLEAN. The R5c-F002 contract
(`isIdentifier(node.name)` guard pin) is **CONFIRMED discriminating**.

---

## 1. SHA PIN + BUILD MATRIX

| Item | Value |
|---|---|
| Head audited (START) | `bb5083e42922ac3e93323e743feee468d95485e9` |
| Head audited (END, no drift) | `bb5083e42922ac3e93323e743feee468d95485e9` |
| main base | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| R5b prior head | `36a0aba4f77a48ab53fab7967cac83c5e5d919cd` |
| Branch | `wave-h4b-env-discovery` |
| Lens | B — BREADTH (static line-read + TS-API contract reasoning; live exec not required) |
| Files in round diff `36a0aba4..bb5083e4` | `test/prod-readiness/env-discovery.ts` (+10/-2), `test/prod-readiness/env-discovery.spec.ts` (+34/-5) |

**Topology note (important):** `8467c6f` (current `main` HEAD) is **NOT an
ancestor** of `bb5083e4` (`git merge-base --is-ancestor` → NO). The brief's R3
range `8467c6f..HEAD` therefore enumerates inherited base-branch commits
(GitHub-web merge commits authored by `BradleyGleavePortfolio
<bradleyapple1031@gmail.com>` / committer `GitHub <noreply@github.com>`) that are
**not PR contributions**. The PR's own 8 contribution commits are the closure
ledger `c9ae7391..bb5083e4`; those are the R3-relevant set and all pass (see §5).

---

## 2. FINDINGS

### R5d-F001-LensB — P3 — test-efficacy — non-discriminating `propertyName` baseline control

- **Location:** `test/prod-readiness/env-discovery.spec.ts:1110-1116`
  - `it('does not count propertyName: a renamed-only destructure with no string source resolves []', ...)`
  - body: `const { x: K } = o; const v = process.env[K];` → asserts `[]`.
- **Contract proof of non-discrimination:**
  - Named invariant of the case title: *"does not count propertyName."*
  - Code has **no** string-valued const for `K` (or for `x`). `collectStringConsts`
    second pass only populates `map` from `VariableDeclaration` string-const
    initializers; here there is none. So `process.env[K]` resolves to `[]`
    **regardless** of whether `propertyName "x"` is counted as a binding.
  - Outcome-A (guard correct, propertyName NOT counted): `x`=0, `K`=1, no string → `[]`.
  - Outcome-B (regression, propertyName WRONGLY counted): `x`=1, `K`=1, still no string for `K` → `[]`.
  - The two outcomes **do not diverge** on the named invariant. Per the R5d
    operator criterion ("Any control whose two outcomes don't diverge on its
    named invariant is a finding"), this is a finding by definition. It is the
    same defect class as R5c-F002 (a control that ships green under regression of
    the invariant it names).
- **Mitigation (why P3, not higher):** the adjacent paired case at
  `env-discovery.spec.ts:1117-1129`
  (`'does not count propertyName: a file-scope const named by propertyName still resolves cleanly'`,
  `const { x: K } = o; const x = 'FOO'; process.env[x]` → `['FOO']`) **IS**
  fully discriminating: if `propertyName "x"` were counted, `x` would reach
  `bindingCounts === 2`, drop from the resolvable map, and flip `['FOO']` → `[]`.
  So the propertyName invariant **is** pinned at the suite level; the suite gives
  no false confidence. Finding 1110 is therefore a redundant/over-claiming
  *baseline* whose title asserts discrimination it does not itself provide.
- **Discriminating fix (pick one):**
  1. **Retitle** 1110 to drop the discrimination claim, e.g.
     `'a renamed-only destructure with no string source resolves [] (no-throw baseline)'`; or
  2. **Delete** 1110 as redundant — case 1117 already covers propertyName both
     for "not counted" and "resolves cleanly"; or
  3. **Strengthen** 1110 to a colliding shape that flips, e.g.
     `const { x: K } = o; const K = 'FOO'; process.env[K]` — but note this then
     duplicates the BindingElement-shadow family (K bound twice → `[]`), so (1)
     or (2) is cleaner.

---

## 3. CONTRACT VERIFICATION — R5c-F002 replacement (CONFIRM/REFUTE)

**CONFIRMED — the new control IS discriminating on the `isIdentifier(node.name)`
guard-half.**

Case `env-discovery.spec.ts:1213-1224`:
```
declare module "FOO" {}
const FOO = 'BAR';
const v = process.env[FOO];   → asserts ['BAR']
```
AST contract walk:
- `declare module "FOO" {}` → `ModuleDeclaration` with `.name =
  StringLiteral{ text: "FOO" }`.
- **Guard PRESENT (current code, line 373-388 4th arm):**
  `(isModuleDeclaration(node)) && node.name && ts.isIdentifier(node.name)` →
  `isIdentifier(StringLiteral)` is **false** → arm skipped → `FOO` not bumped by
  the module. `const FOO='BAR'` bumps `FOO`=1. Single binding + const string →
  `map{FOO→'BAR'}` → `process.env[FOO]` resolves `'BAR'` → `['BAR']`. ✔ matches assertion.
- **Guard DROPPED (mutation):** `node.name` is truthy (`StringLiteral`), so
  `bumpBinding(node.name.text)` runs; `StringLiteral.text === "FOO"` → `FOO`
  bumped by module **and** by const → `FOO`=2 → ambiguous → dropped from map →
  `process.env[FOO]` → `[]`.
- Outcomes diverge `['BAR']` ↔ `[]` → **discriminating**. The old
  non-discriminating `declare module "x" {}` + `const K` control is fully
  REMOVED (grep `declare module "x"` → not present). R5c-F002 is correctly closed.

## 3b. CONTRACT VERIFICATION — R5c-F001 fifth arm (import-equals)

Both new shadow cases flip on removal of the 5th arm → discriminating:

- **Case A** `:1170-1180` (`import K = require('./x')` inside `namespace N`,
  outer `const K='FOO'`): `ImportEqualsDeclaration.name = Identifier{"K"}`. 5th
  arm `isImportEqualsDeclaration(node) && isIdentifier(node.name)` →
  `bumpBinding("K")`; with outer const → `K`=2 → ambiguous → `[]` ✔. Drop arm →
  `K`=1 → `'FOO'` → `['FOO']`. Diverges.
- **Case B** `:1182-1193` (`import K = Outer.Inner.X` qualified): same — `.name`
  is `Identifier{"K"}` (the qualified `moduleReference` does not affect `.name`)
  → `bumpBinding("K")` → `K`=2 → `[]` ✔. Drop arm → `['FOO']`. Diverges.

---

## 4. PRIOR-FINDING CLOSURE VERIFICATION

| Round | Finding | Required artifact @ bb5083e4 | Status |
|---|---|---|---|
| R4 (LensA P2) | `Parameter` un-counted | `isParameter` arm `env-discovery.ts:355` | ✅ present |
| R5 (LensA P2) | `BindingElement` un-counted | `isBindingElement` arm `:361` | ✅ present |
| R5b (LensA P3) | Function/Class/Enum/Module `.name` un-counted | 4-decl arm `:373-388` w/ `node.name && isIdentifier` guard | ✅ present |
| R5b (LensB P3) | `propertyName` regression test non-discriminating | discriminating case `spec:1117-1129` | ✅ present (note: baseline 1110 → R5d-F001-LensB) |
| R5c (LensA P3) | `ImportEqualsDeclaration` un-counted | 5th arm `:389-393` | ✅ present + 2 discriminating cases `spec:1170-1193` |
| R5c (LensB P3 / F002) | `declare module "x"` control non-discriminating | replaced by `declare module "FOO"`/`'BAR'` `spec:1213-1224`; old removed | ✅ closed (confirmed §3) |

No regression in any prior closure.

---

## 5. BREADTH SWEEP TABLE

| Axis | Scope | Result |
|---|---|---|
| **R3 author+committer** | PR commits `c9ae7391..bb5083e4` (8) | ✅ all `Bradley Gleave <bradley@bradleytgpcoaching.com>` on both an/cn |
| **R3 body/trailer tokens** | bodies of the 8 PR commits | ✅ NONE (`claude/anthropic/assistant/co-authored/\bAI\b/agent` → none) |
| R3 (brief range caveat) | `8467c6f..HEAD` | ⚠ range includes inherited GitHub-web base commits (not PR work); `8467c6f` is not an ancestor of head — see Topology note. Not a finding. |
| **R75 banned tokens** | added lines `36a0aba4..bb5083e4` | ✅ NONE (the two `import`-string matches are inside comment prose, not import stmts) |
| **R40 assertions (new cases)** | 3 new/replaced `it` | ✅ all `expect([...extractEnvVarRefs(code)]).toEqual([...])` value equality |
| R40 (pre-existing) | whole spec | `toBeDefined`/`toContain`/`toMatch` at 239/495-539/219/316/529 are pre-existing, out of round-diff scope, accepted prior rounds — over-sweep note, not a round finding |
| **R74 ratio** | `36a0aba4..bb5083e4` | ✅ test+34 / prod+10 = 3.4× (net 29/8 = 3.6×) ≥ 2.0 |
| **LOC budget marker** | commit body | ✅ `[LOC-EXEMPT] test-tree only` present; entire diff under `test/prod-readiness/` |
| **File boundaries** | round diff | ✅ ONLY `env-discovery.ts` + `env-discovery.spec.ts` |
| **Imports** | `env-discovery.ts` added lines | ✅ zero new top-level imports (uses existing `ts.*`) |
| **Exported contract** | `env-discovery.ts` | ✅ `collectStringConsts` (fn `:338`) and `countBindings` (local arrow `:349`) remain un-exported |
| **Determinism** | counting + resolution | ✅ `bumpBinding` Map + `ts.forEachChild` walk; order-independent counts, deterministic Set output |
| **Double-arm match** | 5 arms | ✅ each gated on mutually-exclusive `node.kind`; `ImportEqualsDeclaration` kind matches no other arm; `if/else-if` short-circuits regardless |
| **Secret leakage** | new spec literals | ✅ only `'FOO'`,`'BAR'`,`'./x'`, ids `K/X/N/Outer/Inner` — no secrets |
| **CI surface** | round diff | ✅ no `.yml`/workflow/`package.json`/`tsconfig` touched |

---

## 6. ANGRY OVER-SWEEP NOTES (considered, mostly rejected)

- **Anonymous default function/class export controls** (`spec:1196-1211`,
  `export default function(){}` / `export default class {}` + `const K` →
  `['FOO']`): titles claim "no throw, **no pollution**." The "no pollution" half
  is non-discriminating in isolation (anonymous → no `K`-named binding can ever
  pollute). **BUT** the "no throw" half IS discriminating: dropping the
  `node.name &&` guard from the 4th arm makes `ts.isIdentifier(node.name)` /
  `node.name.text` throw on the undefined name → test goes red. The primary
  safety invariant (optional-name null-guard) is pinned. **Rejected as a finding**
  — unlike R5d-F001, these cases pin a real guard. (Could be argued a P4 nit on
  the "no pollution" wording; not elevated.)
- **`namespace K {}` nested-shadow case** (`spec:1166-1168`): verified
  `ModuleDeclaration.name = Identifier{"K"}` → 4th arm bumps → `K`=2 → `[]`;
  drop 4th arm → `['FOO']`. Discriminating. Clean.
- **Map-text on `StringLiteral`:** confirmed `StringLiteral.text` exists (drives
  the §3 mutation), so the `isIdentifier` guard is the *only* thing standing
  between correct and regressed behavior — guard is load-bearing, not cosmetic.
- **5th-arm `isIdentifier(node.name)` guard:** `ImportEqualsDeclaration.name` is
  structurally always `Identifier` (TS grammar), so the guard is always-true and
  cannot itself be independently discriminated by a spec case — but it is
  harmless, uniform with siblings, and defensive. Not a finding (a redundant
  always-true guard is not a soundness or efficacy defect).
- **Scope-blindness of `bumpBinding`** (a namespace-scoped `K` marks a
  file-scope `const K` ambiguous even though real TS scoping would not shadow):
  this is the **documented, intentional** R59 fail-closed design ("never swallow;
  drop any name bound >1 anywhere"). Consistent across all 5 arms. Not a finding.
- **`TypeAliasDeclaration`/`InterfaceDeclaration`** (type-only, no value
  binding): correctly NOT in any arm; a bare type-name Identifier child is
  visited by `forEachChild` but matches no arm → not bumped. No pollution. Clean.
- **Next-binder-family hunt:** remaining value-introducing `.name` binders
  (`ImportClause`/`ImportSpecifier`/`NamespaceImport`/`NamespaceExportDeclaration`/
  `ExportAssignment`) are module-scope-only; a same-named module-scope `const`
  redeclaration is a TS *error*, so no legal shadow is constructible → not
  exploitable, correctly omitted (consistent with prior-round reasoning). No new
  binder-family finding for R5d.

---

## SUMMARY

- **VERDICT: FINDINGS** — 1 finding: `R5d-F001-LensB` (P3, test-efficacy,
  suite-mitigated).
- R5c-F001 (5th arm) and R5c-F002 (module-name control replacement) both
  CONFIRMED correctly implemented and discriminating.
- All R3/R75/R40/R74/LOC/imports/boundary/determinism/double-arm/CI axes clean.
- SHA `bb5083e4` pinned at START and END, no drift.

# H4 Split Re-Audit — Lens A (DEPTH, Opus 4.8) — R5d — PR #465 (H4.D provider-wiring)

## VERDICT: **CLEAN** (zero P0–P3 findings)

R5c-F001-LensB (the lone P3 from the breadth lens) is confirmed **CLOSED**. The R5c fixer delta
(`382c8077`, +17 lines across 2 files, test-tree only) is minimal, correct, and well-scoped: it adds a
diagnostic-emission block to the `alwaysSatisfied` / plain-`requires` branch that mirrors the existing
`requiresAnyOf` branch, plus three assertions on spec case 20. A full adversarial re-audit of the whole PR
(vs base `5b8acb1~1`) under a **live tsc + jest environment** (sibling `…-746cb632` node_modules symlinked
onto this worktree at `382c8077`) found no soundness gap, no fail-open, no non-discriminating assertion, no
contract drift, and no new defect introduced by the delta. All four prior R5c-Lens-A mutation-discrimination
guarantees are preserved (re-run live). The new diagnostic line is itself mutation-pinned.

---

## 1. SHA + ENVIRONMENT PIN
| Item | Value |
|---|---|
| Repo | BradleyGleavePortfolio/growth-project-backend |
| Branch | `wave-h4d-provider-wiring` |
| PR | #465 |
| Required head SHA | `382c8077e79ba9321edacfe105ef858eb28047fc` |
| HEAD at audit START | `382c8077e79ba9321edacfe105ef858eb28047fc` — **MATCH ✓** |
| HEAD at audit END | `382c8077e79ba9321edacfe105ef858eb28047fc` — **MATCH ✓ (no drift; worktree clean after all mutations reverted)** |
| PR base (parent of first PR commit) | `5b8acb1~1` |
| R5c fix commit | `382c8077` — emit diagnostic on `alwaysSatisfied` `*_FILE`-missing branch + pin in spec |
| R5c→R5d delta | `git diff fec7073b..382c807` = 2 files, +17/-0 (`provider-wiring.ts` +11, AWS spec +6) |
| **Verification method** | **LIVE** — symlinked the installed `node_modules` from sibling worktree `…-746cb632` (HEAD `fec7073b`) onto this worktree checked out at `382c8077`, then ran real `tsc --noEmit` and real `jest` on both spec files, plus 5 live source mutations (new R5c diagnostic line + the 4 prior R5c guarantees). Symlink removed after; worktree restored to pristine `382c8077`. |
| Node | v20.20.1 |

---

## 2. CLOSURE — R5c-F001-LensB — **CLOSED ✓**

**The finding:** when `classifyProvider` routes a `*_FILE` env var through the plain `requires` bucket (not
`requiresAnyOf`) and the file is missing on disk, status correctly returned `STUB` but `diagnostic` was left
`undefined` — violating the `ProviderReport.diagnostic` JSDoc contract (`provider-wiring.ts:177-183`, which
names this exact "credential file referenced but not on disk" case) and diverging from the `requiresAnyOf`
path which emits `"<VAR> points to non-existent path"`.

**The fix (`provider-wiring.ts:474-484`):**
```ts
if (
  always.missing.length === 0 &&
  always.placeholder.length === 0 &&
  !fileEvidenceOk(def.requires, evidence)
) {
  diagnostic = fileEvidenceDiagnostic(def.requires, evidence);
}
```
- **Wording parity confirmed:** both branches funnel through the SAME helper `fileEvidenceDiagnostic`
  (`provider-wiring.ts:436-441`), which returns `` `${missingFileVar} points to non-existent path` ``. The
  `requiresAnyOf` branch (`:519-525`) calls `fileEvidenceDiagnostic(best.group, evidence)`; the new branch
  calls `fileEvidenceDiagnostic(def.requires, evidence)`. Wording is therefore identical by construction —
  not a copied literal that could drift.
- **Branch-condition correctness:** the guard `!fileEvidenceOk(def.requires, evidence)` is true iff some
  file var in `requires` has `<VAR>_FILE_EXISTS === false`; `fileEvidenceDiagnostic` then finds that same
  var, so the assigned value is ALWAYS a defined string here (never `undefined`). The diagnostic is set only
  when buckets are clean (`missing===0 && placeholder===0`) — i.e. precisely the case the buckets do NOT
  explain — satisfying the JSDoc contract.
- **Spec pin (`…twilio-aws…spec.ts:1529-1535`, case 20):** now asserts, in addition to `status === 'STUB'`:
  - `expect(r.diagnostic).toBe('X_TOKEN_FILE points to non-existent path')` (exact value),
  - `expect(r.diagnostic).toContain('X_TOKEN_FILE')` (var name),
  - `expect(r.diagnostic).toContain('points to non-existent path')` (contract substring).
  All value/substring matchers (R40-compliant). The `toContain` pair is redundant w.r.t. the `toBe` (which
  already pins the full string) — harmless over-assertion exactly as the fixer brief requested; not a defect.

**Live mutation (M0 — the new line):** commenting out `diagnostic = fileEvidenceDiagnostic(def.requires, evidence);`
on the always-branch turns case 20 **RED**:
```
expect(r.diagnostic).toBe('X_TOKEN_FILE points to non-existent path')
  Expected: "X_TOKEN_FILE points to non-existent path"
  Received: undefined          → 1 failed, suite RED
```
The new assertion is load-bearing. ✓

---

## 3. WHOLE-PR LIVE VERIFICATION (tsc + jest @ 382c8077)
| Check | Command | Result |
|---|---|---|
| Type check | `tsc --noEmit` (`--max-old-space-size=8192`) | **EXIT 0, clean ✓** |
| AWS/Twilio/etc spec | `jest …twilio-aws-fly-sentry-supabase-openai-cf.spec.ts` | **145 passed / 145 ✓** |
| Stripe spec | `jest …stripe-mux-sendgrid.spec.ts` | **58 passed / 58 ✓** |
| Total | both specs in one run | **203 passing, 0 failing, 0 skipped ✓** |

---

## 4. REGRESSION GUARD — prior R5c-Lens-A mutation guarantees (all re-run LIVE @ 382c8077)
Each mutation applied to `provider-wiring.ts`, suite re-run, then reverted (`git status` clean after each).

| # | Mutation | Pins | Result @ R5c (fec7073b) | Result @ R5d (382c8077) | Discriminates? |
|---|---|---|---|---|---|
| M1 | Delete `if (typeof v !== 'string') return false;` (`:297`) | JWT type guard (cases 14–17) | compile-fail | **compile-fail** — `tsc` `error TS18046: 'v' is of type 'unknown'` at `:298` (`v.split`) | **YES ✓** |
| M2 | Role gate `=== 'service_role'` → `!== 'service_role'` (`:329`) | role HARD GATE | 15 failed | **15 failed** | **YES ✓** |
| M3 | Drop `fileEvidenceOk(def.requires, evidence)` from `alwaysSatisfied` → `true` (`:473` only) | `requires`-bucket file gate (R5-F002) | 1 failed (case 20 status) | **1 failed** (case 20) | **YES ✓** |
| M4 | IRSA group `['AWS_ROLE_ARN','AWS_WEB_IDENTITY_TOKEN_FILE']` → `['AWS_WEB_IDENTITY_TOKEN_FILE']` (`:146`) | IRSA-strict (both ARN+file) | 6 failed | **6 failed** | **YES ✓** |

Counts are **identical** to R5c. The R5c delta touched none of these paths or their pinning cases. M3 note:
the new diagnostic block (`:478-484`) recomputes `!fileEvidenceOk(def.requires, evidence)` independently, but
the `alwaysSatisfied` predicate at `:473` is unchanged, so M3 still flips case 20's `status` to `WIRED` and
the status assertion still fires. No guarantee regressed. ✓

---

## 5. FAIL-OPEN SCAN — delta-focused (every "unsafe/missing-evidence → must be non-WIRED" path re-traced)
| Scenario | Path under 382c8077 | Outcome | Fail-open? |
|---|---|---|---|
| `*_FILE` in `requires`, `_EXISTS:false` | `fileEvidenceOk(requires)` false → `alwaysSatisfied` false → STUB; new block sets diagnostic | STUB + diagnostic | NO ✓ |
| `*_FILE` in `requires`, `_EXISTS:true` | `fileEvidenceOk` true → `alwaysSatisfied` true; new block guard `!fileEvidenceOk` false → no diagnostic | WIRED, diagnostic absent | NO ✓ |
| Could new block attach diagnostic to a WIRED report? | block fires only when `!fileEvidenceOk(requires)` ⇒ `alwaysSatisfied` is necessarily `false` ⇒ status ≠ WIRED | diagnostic only ever on STUB | NO ✓ |
| Could new block set `diagnostic = undefined` (clobber)? | guard guarantees a `false`-evidence file var exists ⇒ `fileEvidenceDiagnostic` returns a defined string; `diagnostic` was `undefined` before this point anyway | always a defined string | NO ✓ |
| `requires` file-missing AND `requiresAnyOf` satisfied | new block sets diagnostic; `if(anyOfSatisfied)` true-branch records present vars, does NOT clear diagnostic; `alwaysSatisfied` false → STUB | STUB + requires-file diagnostic | NO ✓ |
| All 10 shipped providers (none carry `*_FILE` in `requires`) | `fileEvidenceOk([...non-file vars])` vacuously true → `!true` false → new block never entered | unchanged behavior | NO ✓ (delta is inert for shipped set) |

The R5c delta introduces **no** path that lets unsafe input or missing evidence reach `WIRED`, and never
attaches a diagnostic to a `WIRED` report.

---

## 6. ANGRY OVER-SWEEP (delta-specific axes, all rejected with rationale)
| Axis | Result / rationale |
|---|---|
| `fileEvidenceOk(def.requires, evidence)` now evaluated **twice** (`:473` in `alwaysSatisfied`, `:481` in new block) | Pure function over the same injected maps → identical result; micro-redundancy only, zero behavioral effect. Not a defect. |
| Cross-branch diagnostic clobber (always-branch sets, then `requiresAnyOf` else-branch overwrites at `:524`) | Only possible for a hypothetical provider with `*_FILE` in BOTH `requires` AND an unsatisfied `requiresAnyOf` group whose own file is missing. No shipped provider does this; `ProviderReport.diagnostic` is a single field by contract; either message is correct. Latent, non-shipped, single-field-by-design. Not a finding. |
| `toContain('X_TOKEN_FILE')` + `toContain('points to non-existent path')` redundant after `toBe(full string)` | Over-assertion, not under-assertion — strictly safe, requested by fixer brief. Not a finding. |
| New comment (`:474-477`) accuracy | States it "mirrors the requiresAnyOf branch" and emits "the same human-readable diagnostic both paths use" — accurate; both call `fileEvidenceDiagnostic`. No doc/code drift. |
| Could the delta change any existing case's outcome? | The 6 added spec lines are all inside case 20; the 11 added prod lines are a new `if` block whose guard is false for every shipped provider and every pre-existing test (none route `*_FILE` through `requires`). 203/203 unchanged from R5c. No collateral. |
| Worktree hygiene after 5 mutations | `git status --short` empty; `git diff --stat` empty; temporary `node_modules` symlink removed. Pristine `382c8077`. |
| Determinism | `fileEvidenceDiagnostic` uses `.find` over `fileVarsOf(group)` (declaration order) → deterministic first-missing-var selection. No nondeterminism added. |

---

## 7. RULE VERIFICATION
| Rule | Result | Evidence |
|---|---|---|
| **R3 identity** | **PASS** | All 8 PR commits (`5b8acb1,4c0baab,becbe68,7929d45,c5dd5bd,02790a6,fec7073,382c807`) author **and** committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. |
| **R75 banned tokens** | **PASS** | `git diff 5b8acb1~1..HEAD` added lines grepped for `claude\|anthropic\|co-authored\|assistant\|ai-generated` → empty (exit 1). Same grep on the `382c807` delta only → empty. |
| **R40 assertion strength** | **PASS** | New case-20 assertions are `toBe` + two `toContain` (value/substring). No `toBeDefined/Truthy/Falsy/not.toThrow/.skip/.only/xit/fit/it.todo`. |
| **File boundaries (R5c fix)** | **PASS** | `382c807` touches exactly `provider-wiring.ts` + the AWS spec, both under `test/prod-readiness/`. |
| **Full-PR file scope** | **PASS** | 5 files: `provider-wiring.ts` (+947), 2 spec files, 1 `.tsx` fixture, `tsconfig.json` (+1 fixtures-exclude line). Unchanged vs R5c; R5c delta added no new files. |
| **LOC-EXEMPT marker** | **PASS** | `[LOC-EXEMPT] test-tree only` present in `382c807` body; PR title carries `[LOC-EXEMPT: …]` (the gate reads the live title). |
| **tsc** | **PASS** | EXIT 0 at `382c807`. |
| **jest** | **PASS** | 203 passing / 0 failing / 0 skipped. |

---

## CLOSURE SECTION
- **R5c-F001-LensB:** **CLOSED ✓** — diagnostic now emitted on the `alwaysSatisfied`/plain-`requires`
  `*_FILE`-missing branch via the shared `fileEvidenceDiagnostic` helper (identical wording to the
  `requiresAnyOf` path); case 20 pins the exact diagnostic string + var name; removing the new line turns
  case 20 RED (live-verified).
- **Prior R5c-Lens-A mutation guarantees:** **ALL PRESERVED ✓** — JWT type guard (M1 → compile-fail),
  role hard-gate (M2 → 15 failed), `fileEvidenceOk` in `alwaysSatisfied` (M3 → 1 failed), IRSA-strict gate
  (M4 → 6 failed). Counts identical to R5c; the delta touched none of these paths.

## SUMMARY
PR #465 @ `382c8077` is sound. The R5c fixer change is a minimal, contract-correct, test-tree-only delta that
closes the breadth lens's lone P3 by converging the two credential-grouping paths onto one diagnostic rule.
Live tsc (EXIT 0) + 203 passing jest assertions + 5 live mutations confirm the new diagnostic line and all
four prior soundness gates each discriminate against their own regression. No fail-open reaches WIRED; no
diagnostic is ever attached to a WIRED report. R3/R75/R40/LOC/boundary/scope all pass.

**VERDICT: CLEAN — 0 findings.**

# H4.F PR #466 — R5c Re-Audit (Lens A, depth)

- **SHA audited:** `680db783d1f365524dc5f7ddbed7583adf5f7d15` (branch `wave-h4f-auto-flipper`, HEAD verified)
- **Lens:** A (depth — per-function semantic + mutation discrimination)
- **Model:** Opus 4.8
- **Mandate:** Adversarial — find ANY AND ALL problems, including NEW defects introduced by the R5c delta. Not a "was it fixed" confirmation pass.

## VERDICT: **NOT CLEAN — 1 finding (R5c-F001-LensA, P2)**

The R5c fixer closed all 5 R5b defects correctly and with mutation-discriminating tests (verified live). However, the R5c delta itself introduced one new **fail-closed gate-source drift**: the new defense-in-depth gate inside `runFlyctl` reads `process.env`, while the `commit()`/`flip()` gates read the documented `opts.env ?? process.env`. The two gates therefore disagree on their env source. This is fail-CLOSED (no leak, no unauthorized mutation) but silently breaks the documented `CommitOptions.env` authorization channel for callers using the default runner.

---

## FINDINGS

### R5c-F001-LensA — gate env-source drift between `runFlyctl` and `commit()` (P2, fail-closed)

- **File/lines:** `test/prod-readiness/auto-flipper.ts:899` (new gate) vs `:1074` (commit gate); channel documented at `:813` (`CommitOptions.env`) and forwarded by `flip()` at `:1243`–`:1247`.
- **Defect:** The R5c fixer added (correctly, in intent) a defense-in-depth gate at the top of `runFlyctl`:
  ```ts
  if (!autoFlipEnabled(process.env)) { throw new Error('runFlyctl: READINESS_AUTO_FLIP is not enabled (defense-in-depth gate)'); }
  ```
  The predicate **function** (`autoFlipEnabled`) is identical to the one `commit()` uses, but the **argument differs**:
  - `commit()` (`:1074`): `autoFlipEnabled(opts.env ?? process.env)`
  - `flip()` (`:1243`/`shouldCommit` `:1202`): also `opts.env ?? process.env`
  - `runFlyctl()` (`:899`): `autoFlipEnabled(process.env)` — **ignores `opts.env`**

  `CommitOptions.env` is a documented authorization input (`:813`, "`env?`") and is the authoritative gate source for both `commit()` and `flip()`. Because `doCommit`'s default runner is `runFlyctl` (`:1096`, `run = opts.run ?? runFlyctl`), a caller that authorizes a real mutation via `commitOpts.env` while `process.env` does **not** carry the flag will:
  1. Pass `shouldCommit` (uses `opts.env`) and the `commit()` refusal gate (`:1074`, uses `opts.env`).
  2. Enter `doCommit`, call `runFlyctl` per row.
  3. Hit the new gate (`:899`, reads `process.env`) → throws the generic `Error`.
  4. That generic error is caught at `:1170`; it is **not** `FlyBinIdentityMismatch`/`FlyctlTimeoutError`, so it falls through to the per-row `failed.push(...)` (`:1180`–`:1184`) and the loop continues.
  5. `commit()` returns a `FlipResult` with **every row in `failed[]`**, each carrying the message "runFlyctl: READINESS_AUTO_FLIP is not enabled (defense-in-depth gate)".

  So an authorized-via-`opts.env` commit silently degrades to all-rows-failed instead of mutating. It is **fail-closed** (no secret mutated, no leak), but it breaks the documented `env`-injection authorization channel and contradicts the fixer's own comment claim that the gate uses "the same capability flag the gated entry points use" (the *flag* is the same; the *source* is not).
- **Concrete live evidence the drift is real (not theoretical):** the test at `auto-flipper.spec.ts:1056` ("commit timeout via default runner …") calls `commit({ plan, env: ENABLED_ENV })` with **no** `opts.run`, i.e. the default `runFlyctl`. It only passes because its describe block (`:1031`) was given `useAutoFlipEnv()` (`:1032`), which sets `process.env[AUTO_FLIP_ENV]` **separately**. Passing `ENABLED_ENV` as `opts.env` is *not sufficient* for the default runner — `process.env` must also be set. That extra step is the drift made manifest and is now baked into the test scaffolding.
- **Repro/mutation:** Call `flip(registryFor, current, { commit: true, env: { READINESS_AUTO_FLIP: 'true' } })` with `process.env.READINESS_AUTO_FLIP` unset and the default runner → result has every `to_set` row in `failed[]` rather than a mutation or a clean top-level refusal. (Not currently covered by any spec; the suite always co-sets `process.env` via `useAutoFlipEnv` whenever the default runner is exercised, masking the divergence.)
- **Why P2 (not P3):** introduced by the exact delta under audit; a silent behavioral regression on a public/documented API option; the failure surfaces as opaque per-row `failed[].error` strings rather than a clear top-level refusal. **Not P1/P0** because it is fail-closed — no secret leak, no unauthorized mutation, and the realistic CLI path (operator sets `process.env`, passes no `opts.env`) works correctly.
- **Recommended fix (pick one):**
  1. **Unify the source.** Thread the effective env into the primitive: pass `opts.env ?? process.env` down to `runFlyctl` (e.g. `runFlyctl(args, env)`), so both gates evaluate the identical value. The seam `__runFlyctlForTest` would default its env to `process.env`. This makes the gates truly identical, as the mandate expects.
  2. **Document + pin the divergence.** If the primitive-level gate is *intended* to be process-global (a reasonable design for a capability flag), update `CommitOptions.env`'s doc (`:813`) and the `runFlyctl` comment (`:894`–`:898`) to state that `opts.env` governs only planning/refusal while actual mutation additionally requires `process.env`, and add a spec pinning the all-rows-failed behavior when the two diverge. Option 1 is preferred (removes the foot-gun rather than documenting it).

---

## CLOSURE OF ALL 5 R5b DEFECTS — VERIFIED

| R5b defect | Closure | Evidence |
|---|---|---|
| **R5b-F001-LensA** (P2) indent-digit leak: digit regex ran against whole header line, comment `\|N`/`>N` poisoned the indent and skipped the continuation secret | **CLOSED** | `auto-flipper.ts:642` now runs `YAML_BLOCK_SCALAR_INDENT_DIGIT_RE.exec(m[3])` against the captured indicator substring (group 3 of header RE, `:625`), never the line. The comment is matched by `(?:#.*)?` **outside** group 3, so it can never enter `m[3]`. **Live mutation:** reverting `m[3]`→`lines[i]` turns **exactly 4** redactor cases red (`\|9`, `>5`, `>9`, `\|8` forms); the `\|2` boundary control and the secretValues-set variant stay green. Matches the commit's "four cases red" claim. |
| **R5b-F002-LensB** (P2) `commit()` docstring contract drift | **CLOSED** | Docstring `auto-flipper.ts:1059`–`:1070` now states fatal `FlyBinIdentityMismatch`/`FlyctlTimeoutError` abort + propagate (fail-closed), ordinary failures continue per-row, mutex released on both paths — mirrors the inline SECURITY comment at `:1171`–`:1176`. |
| **R5b-F003-LensA / R5b-F001-LensB** (P3) duplicated SECURITY (F002) comment | **CLOSED** | `grep -c` for the comment paragraph returns **1**; one copy deleted above the `doCommit` re-throw guard. |
| **R5b-F002-LensA** (P3) defense-in-depth gate | **CLOSED** (gate present; see F001 re: env source) | New gate at `auto-flipper.ts:899`–`:901`. Seam routes through `runFlyctl` (`:944`) so it inherits the gate. **Live mutation:** removing the gate turns the one gate test (`spec:386` "seam refuses … when READINESS_AUTO_FLIP is unset") red and the others green (1 failed / 140 passed). Discriminating. *Caveat:* the gate's env source diverges from `commit()` → see R5c-F001-LensA. |
| **R5b-F003-LensB** (P3) seam form parity | **CLOSED** | `__runFlyctlForTest` is now `export function __runFlyctlForTest(args) { runFlyctl(args); }` (`:943`–`:945`), not a `const` alias. Docstring (`:933`–`:942`) corrected: no longer over-claims, notes it inherits the `autoFlipEnabled` guard and matches the `__…ForTest` function-declaration convention. |

## NEW-DEFECT SCAN ON THE R5c DELTA (each touched site)

- **Indent-digit regex on `m[3]`:** correct and complete. `m[3]` is purely the indicator token (`[|>](?:[+-][1-9]?|[1-9][+-]?)?`); `>-`,`|`,`|+` → no digit (floor = headerIndent); `|2`,`|-2`,`|2-` → digit extracted correctly. No other YAML construct (folded `>2`, chomping `|+`, inline non-comment) regresses; inline non-block headers fail the header RE and fall to the value-based pass. Single call site (`:642`) confirmed. **No new leak.**
- **`runFlyctl` gate:** placed as the first statement, before `warnIfPathResolvedFlyBin`/`assertFlyBinUnchanged`/`execFileSync` — never execs when unset (test + mutation confirm). Sole defect is the env-source drift (F001).
- **Seam const→function conversion:** semantically identical pass-through; `typeof __runFlyctlForTest === 'function'` test (`:382`) still green. No behavior change beyond inheriting the gate.
- **`commit()` docstring rewrite:** documentation only; matches code.
- **Duplicate-comment deletion:** comment only; the live re-throw guard (`:1177`–`:1179`) is untouched and correct.
- **`useAutoFlipEnv()` helper (`spec:93`):** save/restore of `process.env[AUTO_FLIP_ENV]` is correct (handles undefined-prior case). Added to exactly the describe blocks that drive the default `runFlyctl`. Not spurious — the `:1031` redactor-shapes block needs it for the default-runner timeout test at `:1056`.

## REQUIRED-VERIFICATION RESULTS

- **TSC:** `npx tsc --noEmit` — **0 errors** (no `prod-readiness` diagnostics).
- **Tests:** `npx jest test/prod-readiness/` — **263 passed / 263 total, 3 suites passed**. (auto-flipper.spec + redactor.spec alone = 205; full dir incl. registry-loader = 263. Matches the ~260+ expectation.)
- **Mutation discrimination:** R5b-F001 fix → 4 cases red on revert (verified live). R5b-F002 gate → 1 case red on revert (verified live). No non-discriminating *new* assertions found (the `\|2` boundary control at `redactor.spec.ts` is intentionally non-discriminating and labeled "was passing").
- **Fail-open scan:** none. All gate/exit paths (`commit():1074`, `runFlyctl():899`, `shouldCommit():1202`, `flip()` error rethrows `:1224`/`:1237`) fail-closed; the F001 drift also fails closed.
- **R75 grep on added lines** (`claude|anthropic|co-authored|assistant|ai-generated`): **empty/clean**.
- **R3 identity on all 7 PR commits** (`2a58c17`..`680db78`): all authored & committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No auditor/AI identity. Clean.
- **CI on `680db783`:** **all green** — build-and-test, danger, R75/R100.A2 banned-cast, CodeQL, size-label, rls-floor-guard, LOC budget (R100.A3), rls-live-tests, Test density (R100.A1), mwb-3-live-tests — all SUCCESS. PR mergeable.

## BOTTOM LINE

R5c is a high-quality fix pass: all 5 R5b defects are genuinely closed with live-verified, mutation-discriminating tests, and no new leak or fail-open path was introduced. The one issue is a fail-closed design inconsistency (R5c-F001-LensA, P2): the new `runFlyctl` gate reads `process.env` while the documented `commit()`/`flip()` gates read `opts.env ?? process.env`, breaking the `CommitOptions.env` authorization channel for default-runner callers. Recommend threading the effective env into `runFlyctl` (preferred) or documenting + pinning the divergence. No security regression; not a merge blocker on safety grounds, but should be resolved to honor the gate-parity intent the fixer stated.

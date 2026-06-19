# H4 Split Audit — Lens A (Opus 4.8) — R4 — PR #465 (H4.D provider-wiring)

**STATUS: IN PROGRESS**

## BUILD MATRIX (R124)
| Item | Value |
|---|---|
| PR | #465 — H4.D provider-wiring |
| Branch | `wave-h4d-provider-wiring` |
| Head SHA | `7929d4592b069bfe427ce911ca7466e43a5adc46` |
| main base SHA | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| Snapshot ref | `refs/heads/wip/h4d-provider-wiring-fixer-r3-final-20260619` — PRESENT at head ✓ |
| PR state | OPEN, mergeable, base `main` |
| CI | ALL GREEN (banned-cast, CodeQL, LOC budget, test density, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label) |
| Diff stat | +2400 / −3340 (replaces 5 prior prod-readiness modules; net NEGATIVE LOC) |
| New source | `test/prod-readiness/provider-wiring.ts` (755 LOC) |
| New tests | 2 specs (471 + 1151 LOC) + 1 `.tsx` disk fixture (21 LOC) |
| tsconfig | adds `"exclude": [...,"test/**/__fixtures__/**"]` (sensible — was no exclude before) |

## R3 FINDINGS CLOSURE (prior-round fixes verified independently)
| Prior finding | Fix claim | Lens A independent verification |
|---|---|---|
| H4.D R3 F001 — iss/ref OR-gate too permissive | role gate hardened to strict `payload.role === 'service_role'` | VERIFIED. Probes A2/A3/A6/A7/A21 — anon, no-role, uppercase, Cyrillic homoglyph, and iss/ref-only all REJECTED; only exact `service_role` accepted. |
| H4.D R3 F002 — symlink token files wrongly rejected | lstat→realpath.native→stat chain | VERIFIED. Probes S3/S6/S12 — symlink→file, multi-hop k8s `..data` chain, 2-hop all ACCEPT; S2/S4/S5/S7/S8 dir/dangling/loop/fifo REJECT. |
| H4.D R3 F003 — `.tsx` imports + type-only erasure | TSX scan + type-only exclusion | VERIFIED. Probes F2/F3/F6/F10/F11 type-only erased; F4/F5/F12/F13/F14 mixed/namespace runtime kept; F23-25 tsx/jsx parse; disk fixture `uses-stripe.tsx` exercised by 4 test cases. |

## R3 AUTHORSHIP (strict Bradley, zero AI tokens)
All 4 commits `main..head` authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/agent tokens in source or test files (TODO/xxx/fixme hits are placeholder-vocabulary fixtures only). PASS.

## R4 EXHAUSTIVE SWEEP — Pass 1 (executed re-derivation, R11)
Method: copied source to `/tmp/probe/src/`, compiled with tsc, executed `require()`-based probes. Compiled artifact byte-verified IDENTICAL to PR head.

**109 probes executed, 109 confirm correct behavior (1 apparent divergence E1 resolved as probe artifact, not code defect):**

| Group | Probes | Result |
|---|---|---|
| A. Supabase service_role hard gate | A1–A22 (22) | All correct: strict `===`, rejects ws/case/homoglyph/array/object/number role; 3-segment + non-empty sig + valid header alg + typ-if-present=JWT; old `eyJbad.abc.def` regex bypass rejected |
| B. passesShapeCheck + trim | B1–B21 (21) | Value trimmed before validate; Stripe sk_(live\|test)_≥24, rejects pk_/rk_/short; whsec_≥20; OpenAI sk-≥20 incl sk-proj; internal/embedded newline rejected (no /m, \n not in char class) |
| C. looksLikePlaceholder | C1–C10 (10) | sk_test_ prefix, substring vocab case-insensitive, empty/ws→placeholder |
| D. classifyVars ordering | D1–D5 (5) | placeholder runs before shape; empty string→missing (not placeholder); sk_test→placeholder→STUB |
| E. AWS requiresAnyOf + file evidence | E1–E6 (6) | static-keys OR web-identity-file; file-evidence false→STUB+diagnostic; absent evidence→backward-compat OK; AWS_REGION always required |
| F. extractModuleSpecifiers type-only | F1–F27 (27) | type-only erased, mixed/namespace/side-effect/require/dynamic-import runtime kept, computed skipped, comment/string ignored, tsx/jsx parsed |
| H. isSdkImported | H1–H5 (5) | package OR path-hint; fly (no packages) via hint only |
| S. symlink/file-evidence I/O | S1–S12 (12) | regular/symlink→file/chain accept; dir/dangling/loop/fifo/nonexistent reject; empty/unset not probed |

### Notable (NOT a finding — documented for completeness)
- **E1 / C10**: A legitimate credential value that by chance contains a placeholder substring (`xxx`, `todo`, `fake`, `example`) anywhere, or starts with `sk_test_`, is conservatively bucketed as placeholder → STUB. This is the INTENDED fail-safe-toward-STUB design (false-positive STUB, never false-negative WIRED). A real AWS access key containing `XXX` (my fabricated `AKIAXXXX...`) tripped it; a realistic key wires correctly. Direction of error is SAFE (over-blocks, never under-blocks a prod ship). No finding.

## TEST QUALITY
- Assertion density: 306 `expect` across 170 `it/test` = 1.8 expects/test.
- test:src LOC = 1622:755 = 2.14.
- Zero `.skip(`/`.only(`/`xit(`/`it.todo`; zero weak assertions (no bare toBeDefined/toBeTruthy/expect(true)/not.toThrow).
- `.tsx` fixture read from disk by real integration tests (not in-memory only) — strong independence.

## R4 EXHAUSTIVE SWEEP — Pass 2 (fresh adversarial angles)
33 additional probes:
| Group | Probes | Result |
|---|---|---|
| P. JWT base64url encoding edges | P1–P8 | empty/dots-only segs rejected; `__proto__` key ≠ role; large payload OK. **Lenient decoder** accepts std-base64 & extra padding (P2/P3) but role gate still rejects anon/garbage under any encoding — confirmed separately, no security impact |
| Q. requiresAnyOf best-group reporting | Q1–Q3 | fewest-gap group surfaced as actionable; AWS_REGION in always-bucket |
| S2. scanProvidersWith end-to-end | S2a–S2f | WIRED/NOT_USED/STUB end-to-end; getProductionBlockers catches broken webhook |
| T. filterProviders | T1–T3 | exact-id, case-sensitive, unknown→empty |
| U. Unicode/normalization | U1–U4 | fullwidth≠ascii; toLowerCase; placeholder beats valid-shape |
| V. NOT_USED short-circuit | V1–V1b | not-imported→NOT_USED even with perfect env; never a blocker |
| W. exotic import syntax | W1–W7 | import assertions/attributes, nested dynamic import, property `.require()` ignored, template-literal require ignored, mixed type/runtime decls |
| Extra | UTF-8/null-byte/boolean role | invalid UTF-8, `service_role\0`, `role:true` all rejected |

**STATUS: PASS 1 COMPLETE / PASS 2 COMPLETE**

## R59 ERROR-HANDLING COMPLIANCE
Three `catch` blocks (lines 155, 161, 478) + documented dangling-link path (466). Each maps to a deterministic documented fail-safe value (`undefined`→invalid JWT→false; `false`→unusable token file→STUB). No silent swallow hiding a logic defect. R59 PASS.

## DOCTRINE RULE COVERAGE R1–R126 (Lens A, PR #465)
| Rule(s) | Topic | Verdict |
|---|---|---|
| R1–R2 | Scope / target correctness | PASS — head SHA byte-matches brief; correct files |
| R3 | Strict Bradley prod identity, zero AI tokens | PASS — 4/4 commits Bradley author+committer; no AI tokens |
| R4 | Exhaustive sweep not regression check | PASS — 142 probes, 2 passes, fresh angles in pass 2 |
| R11 | Independence / re-derive from source | PASS — compiled & executed; artifact byte-identical to head |
| R16/R78 | Single canonical VERDICT token | PASS — see VERDICT |
| R30/R31/R40 | Hard credential gate (service_role) | PASS — strict `===`, no homoglyph/case/ws/type bypass |
| R59 | No silent error swallow | PASS — deterministic documented fail-safe catches |
| R65 | Fail-closed direction | PASS — all error directions bias toward STUB (over-block), never false WIRED |
| R109 | Static-analysis correctness (AST not regex) | PASS — type-only erasure, tsx/jsx, computed-skip all correct |
| R124 | Build matrix recorded | PASS — above |
| R5–R10, R12–R15, R17–R29, R32–R39, R41–R58, R60–R64, R66–R77, R79–R108, R110–R123, R125–R126 | (process, reporting, hygiene, test-quality, LOC-budget, snapshot-ref, CI, no-skip/no-weak-assert, placeholder-vocab parity, etc.) | PASS — no violation observed; test:src 2.14, density 1.8, 0 skip/only, 0 weak assert, snapshot ref present, CI all green, net-negative LOC |

## NEW FINDINGS
_None._ Zero findings at any severity P0–P3.

## VERDICT: CLEAN

PR #465 (H4.D provider-wiring) passes the Lens A R4 exhaustive sweep with zero findings. All three prior-round R3 fixes (F001 role gate, F002 symlink resolution, F003 tsx/type-only) independently verified correct. Fail-safe direction confirmed throughout (errors bias to STUB, never false-WIRED). R3 identity strict-Bradley clean. Merge-ready pending Lens B agreement.

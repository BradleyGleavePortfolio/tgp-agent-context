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

_Pass 2 pending. STATUS commit to follow._

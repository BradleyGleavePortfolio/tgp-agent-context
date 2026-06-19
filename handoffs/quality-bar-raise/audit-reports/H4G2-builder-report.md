## BUILD MATRIX
- main HEAD pre-work: 868000088fab1fc5929e02291bec4d4928e99aaf
- branch: wave-h4g2-operator-keys
- final head SHA: 39d76e32e887d399b0f7822a6076a626c33c3304
- PR number: #462
- files changed: test/prod-readiness/operator-keys-generator.ts (new), test/prod-readiness/operator-keys-generator.spec.ts (new), OPERATOR_KEYS_NEEDED.md (regenerated, docs/generated — R76-excluded)
- net prod LOC (excluding test/lockfile/data/docs): 289  (operator-keys-generator.ts; spec + the .md are excluded)
- net test LOC: 583  (operator-keys-generator.spec.ts)
- test:src ratio: 2.02  (583 / 289)
- snapshot branches pushed: wip/h4g-init-snapshot-20260619T141821Z, wip/h4g2-init-snapshot-20260619T152248Z
- CI status at exit: all-green (LOC budget, Test density, Banned casts, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label, CodeQL — all pass)
- R3 identity check: pass — sole commit authored & committed by Bradley Gleave <bradley@bradleytgpcoaching.com>; no banned identity/vendor tokens. The committed OPERATOR_KEYS_NEEDED.md was regenerated with a vendor-neutral seed (the PR #457 original contained "OpenAI"/"Anthropic" which are banned R3 tokens).
- R75 banned-tokens check: pass — zero cast tokens / stub literals in the diff (CI "Banned cast tokens" job green)
- timestamp UTC: 2026-06-19T15:31:00Z (approx, at report authoring)

## STEPS TAKEN
- Shared setup with H4.G1 (same clone, R3 identity, base verified, H4.A deps confirmed). Framework confirmed Jest (not Vitest).
- Read PR #457 operator-keys-generator.ts and learning-ledger.ts (for the ledger shape context).
- Refactored operator-keys-generator.ts to be fully self-contained: defined `OperatorKeysInput` and its sub-shapes (`SwitchEntry`, `ProviderReport`, `AppliedFlip`, `EnvVarOrigin`, `StubPattern`) as local structural interfaces with a documented JSDoc schema. Removed ALL cross-scanner imports. The one cross-scanner RUNTIME dependency in the source — `describePatterns()` imported from stub-scanner — was converted into a passed-in `stub_patterns?` input field (section 6 now renders only when provided), keeping the generator decoupled.
- Hardened `writeOperatorKeysMarkdown` to an **atomic** write (render to a sibling temp file, then `fs.renameSync` over the target) per the spec-coverage requirement.
- Authored test/prod-readiness/operator-keys-generator.spec.ts — 65 Jest cases covering: every empty/populated section branch, BLOCKER-before-WARNING ordering, section 1–6 numerical ordering, pipe escaping, the R75-safe middle-dot token display, determinism, `stripVolatile`, atomic on-disk write (no temp left behind, overwrite), and `assertNoDrift` (missing/clean/timestamp-only/real-drift). Disk tests run against a per-test temp dir so the committed file is never touched.
- Regenerated the committed OPERATOR_KEYS_NEEDED.md from this generator using a vendor-neutral seed (payment-processor / object-storage / etc.) so the checked-in artifact is consistent with the code and R3-clean (44 lines).
- Local gates: `tsc --noEmit` strict == exit 0; `jest` operator-keys spec == 65 passing; R75 grep clean; no vendor tokens.
- Pushed init snapshot, committed, pushed branch, opened PR #462, applied the [LOC-EXEMPT] marker, re-ran the LOC job, confirmed all-green.

## DECISIONS & DEVIATIONS
- **Part of the H4.G -> H4.G1 + H4.G2 split** (see H4.G1 report for the rationale: combined self-contained prod LOC = 580 > 400 cap). This PR carries operator-keys-generator only. Split documented in both PR bodies.
- **`describePatterns()` runtime import removed.** The source imported `describePatterns` from stub-scanner (a scanner NOT on main). Per the brief's STOP CONDITION on cross-scanner imports, I refactored it to a `stub_patterns?: StubPattern[]` input field. Behaviour preserved: section 6 renders the same Token/Severity/Intent table when the orchestrator supplies the inventory, and is omitted otherwise.
- **OPERATOR_KEYS_NEEDED.md regenerated.** The PR #457 artifact (354 lines) was produced by the old code and contained banned vendor tokens (OpenAI, Anthropic). I regenerated it from my generator with a vendor-neutral seed so it is both R3-clean and byte-consistent with the current generator. The drift test runs against a temp dir, so the committed file's content is not asserted by any test — but it is now self-consistent for human review.
- **CI LOC gate + [LOC-EXEMPT] marker** — same reconciliation as H4.G1. The gate counts test/** lines; prod LOC by R76 is 289 (< 400) and the overage is R76-excluded spec code (+ generated md). Title carries `[LOC-EXEMPT: diff under test/ harness; prod 289<400, overage is R76-excluded specs + generated md]`. Test-density gate passes (src-side = 0).
- Title set via `gh api -X PATCH .../pulls/462` because `gh pr edit` errors on projectCards GraphQL.

## OPEN ITEMS
- `OperatorKeysInput` shape is defined locally here. It must stay aligned with the orchestrator H4.H and the `ReadinessReport` produced by H4.G1's reporter (overlapping fields: switches_unset_required ~ switches_unset_in_prod, providers_stubbed ~ providers filtered to STUB, unregistered_in_code). H4.H should map its aggregate report onto this input; a shared types module is the natural future consolidation.

VERDICT: BUILT

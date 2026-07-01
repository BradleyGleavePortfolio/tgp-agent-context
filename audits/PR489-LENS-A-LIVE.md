# PR #489 — Lens A Audit @ 00e597d8 — claude_opus_4_8 (round 3)

## DISPATCH HEADER (R78 / R124)

- PR: #489 (Wave 1.5, H4 — R100 deploy-readiness orchestrator)
- Branch: `wave-h4-orchestrator`
- Head SHA (verify both ways): `00e597d8ce47914120412ce904e4469e1ba62fd4`
- Round 2 archived at `audits/PR489-LENS-A-LIVE.59b6340d.archive.md` (R5).
- Round 3 fixer commit (R3-clean, Bradley Gleave author+committer):
  - `00e597d8` — fix(ci): run deploy-readiness comment job on test-job failure via always() (PR489 R72-r2)
- The exact `if:` line at `.github/workflows/h4-readiness.yml` line 143: `if: ${{ always() && github.event_name == 'pull_request' }}`.
- R109 exception (operator ruling 2026-06-30 16:22 PDT): `it.skip` strict-gate at `test/deploy-readiness.spec.ts:1083-1106` stands. DO NOT flag.
- Auditor: `claude_opus_4_8` (R-META-4).
- Lens isolation: MUST NOT read `PR489-LENS-B-LIVE.md` (R11).
- Live-push every finding (R52).
- VERDICT line (R78) last.
- New doctrine in effect: R130–R137. Verify:
  1. `always()` correctly allows commenting on test-job failure but does NOT break the `pull_request`-only trigger gate.
  2. No elevated scope leak; test job still `contents: read`; comment job still `pull-requests: write` and NO PR-controlled code execution.
  3. All `actions/*` remain SHA-pinned with version comments.

## FINDINGS

(populated live)

## VERDICT

(populated last)

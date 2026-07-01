# PR #489 — Lens B Audit @ 00e597d8 — gpt_5_5 (round 3)

## DISPATCH HEADER (R78 / R124)

- PR: #489 (Wave 1.5, H4 — R100 deploy-readiness orchestrator)
- Branch: `wave-h4-orchestrator`
- Head SHA (verify both ways): `00e597d8ce47914120412ce904e4469e1ba62fd4`
- Round 2 archived at `audits/PR489-LENS-B-LIVE.59b6340d.archive.md` (R5).
- Round 3 fixer commit (R3-clean, Bradley Gleave author+committer):
  - `00e597d8` — fix(ci): run deploy-readiness comment job on test-job failure via always() (PR489 R72-r2)
- The exact `if:` line at `.github/workflows/h4-readiness.yml` line 143: `if: ${{ always() && github.event_name == 'pull_request' }}`.
- Your round-2 finding was that missing `always()` skipped the comment job when the test job failed. Verify the fix landed correctly with the right semantics (`always() && pr-only`).
- R109 exception (operator ruling 2026-06-30 16:22 PDT): `it.skip` strict-gate stands. DO NOT flag.
- Auditor: `gpt_5_5` (R-META-4).
- Lens isolation: MUST NOT read `PR489-LENS-A-LIVE.md` (R11).
- Live-push every finding (R52).
- VERDICT line (R78) last.
- New doctrine in effect: R130–R137. Verify the CI security invariants still hold at head:
  1. Test job: `contents: read` only, no `pull-requests` scope, runs npm ci / prisma / tests.
  2. Comment job: `pull-requests: write` only, `needs: test-deploy-readiness`, `if: ${{ always() && github.event_name == 'pull_request' }}`, no PR-controlled code execution, only `actions/download-artifact` + `actions/github-script`, both SHA-pinned.
  3. No `continue-on-error` re-introduced.

## FINDINGS

(populated live)

## VERDICT

(populated last)

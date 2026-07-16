# Process Finding — 2026-07-16 Backend PR #509 R3 merge-identity incident (R3-INC-2)

**Date:** 2026-07-16 01:10 UTC
**Wave:** importer-wave (Op 57)
**Repo:** growth-project-backend (https://github.com/BradleyGleavePortfolio/growth-project-backend)
**PR:** #509 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/509
**Incident ID:** R3-INC-2 (see `handoffs/importer-wave/current-state.json` → `r3_process_incidents`)
**Status:** OPEN — under investigation; NOT fixed; NOT hidden.
**Rule implicated:** R3 (Operator Identity on every commit — SACRED). Related: R5 (never lose / record honestly), `merge_procedure_change_2026_07_14`.

## Summary

Backend D1 (the golden TrueCoach client-payload fixture) was committed via PR #509
and landed on backend `main` through a **GitHub server-created squash merge**.

- The **source PR head `81f0b70a54a512a454289dade7755b34902e3564` was R3-clean** —
  author AND committer both `Bradley Gleave <bradley@bradleytgpcoaching.com>`.
- The **resulting merge commit on backend main is NOT R3-compliant**:
  - SHA: `171829326c50778af25c38aa10ff09665e58b512`
  - author: `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`
  - committer: `GitHub <noreply@github.com>`

R3 requires that **both** author and committer be `Bradley Gleave
<bradley@bradleytgpcoaching.com>` with no AI/agent/service tokens. The
GitHub-synthesized envelope does not satisfy this.

## Repeat of R3-INC-1

This is the **same failure class** as R3-INC-1 (extension PR #5, commit `5eabeec`):
a GitHub-generated squash stamps a non-Bradley author/committer identity. R3-INC-1
produced `merge_procedure_change_2026_07_14`, which mandated that future TGP merges
use an **identity-safe manual squash + lease-safe fast-forward** (never GitHub
squash) so the identity is correct at creation time. **That prescribed procedure
was not followed for PR #509.** The exact reason the GitHub squash path was used is
**under investigation.**

## Blast radius (bounded)

- **Identity metadata only** — the author/committer of a single merge commit.
- **No** code, test, data, flag, auth, PII, RLS, or billing impact.
- **Content is verified** on merged main:
  - D1 golden fixture `test/fixtures/truecoach/clients.golden.json` byte-pinned:
    blob sha1 `826fc5124a1cb6d45c9fbb87b5d3437974b8c3c2`, 2668 bytes,
    sha256 `af0387fea53dac5a9622c7de6d142c53986b6f4995784eccd6c51f204557e71f`.
  - Source extension path `test/fixtures/cdp-traces/truecoach-clients.json`
    @ `4f116836ddb5449524dd51e995a7e4c012f79493`.
  - Backend spec `test/truecoach-golden-fixture.spec.ts`: **5/5 pass** on merged main.
  - Strict `tsc` exit 0; **15 pre-merge CI checks green**; **zero production LOC**;
    dual Lens A + Lens B CLEAN; billing excluded; no auth/PII/RLS/flags/mobile changes.

## Remediation decision

- **NOT rewritten / NOT force-pushed.** Force-pushing an identity-corrected rewrite
  over already-published shared backend `main` is a destructive, provenance-altering
  operation and is **deliberately declined** (consistent with the R3-INC-1 decision).
  backend `main` remains `171829326c50778af25c38aa10ff09665e58b512`.
- **NOT mislabeled.** Canonical state does **not** claim commit `1718293` is R3-clean.
  The published commit retains its GitHub-synthesized identity and is recorded as such.

## Hard gate (in force)

**No further production-main merges on ANY TGP repo (extension, backend, mobile)
until a non-destructive R3-compliant merge path is proven end-to-end.** IMPORTER-F is
additionally blocked on this gate (alongside the still-open D2 decision).

## Prospective fix

1. Prove and adopt the identity-safe manual squash + lease-safe fast-forward path
   (`merge_procedure_change_2026_07_14`) on a real TGP merge **before** any further
   production-main merge.
2. Investigate why PR #509 bypassed the mandated procedure and close the gap so that
   GitHub-generated squash cannot be used for TGP production merges (e.g. process
   checklist / tooling guard).
3. Include R3-INC-1 **and** R3-INC-2 in the R137 wave postmortem at v0.3 green.

## Cross-references

- `handoffs/importer-wave/current-state.json` → `r3_process_incidents[R3-INC-2]`,
  `repos.backend.main_head_r3_note`, `merge_procedure_change_2026_07_14.known_violation`,
  `decision_record_op57_reconcile_2026_07_16`.
- `handoffs/importer-wave/OPERATOR_HANDOFF.md` §2, §6.
- `DECISION_LOG.md` → 2026-07-16 entry.

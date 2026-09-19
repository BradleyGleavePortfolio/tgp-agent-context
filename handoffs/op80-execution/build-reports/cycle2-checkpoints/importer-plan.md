# R110 builder checkpoint — plan before source edits

Recorded 2026-09-17. Requested Astra inherits the parent; runtime identity unverified.

Read the entire pinned context AGENT_RULES.md (including first-principles and
autonomy addendum), execution brief, and the preserved report at
`/tmp/tgp-op80-cycle2-inputs/context/handoffs/op80-execution/build-reports/pagination-fix-r3/BUILD_REPORT.md`.
The report is in context, not importer. Importer HEAD is the exact requested
`fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`, initially clean.

## Plan / decision checkpoint

Goal: prevent staged and PR-history credentials entering source, using real
gitleaks rather than handwritten credential detection. Root cause: hook and CI
currently have no scanner.

Options: documentation-only fails enforcement; an unpinned external action adds
unnecessary license/token/supply-chain coupling; a pinned upstream binary with
a small fail-closed wrapper reuses the same behavior locally and in CI.
Select the last, pending upstream CLI verification.

Five steps: question literal obsolete CLI names against the pinned binary;
delete extra control features and scanner reimplementation; simplify to one
wrapper and existing lefthook plumbing; shorten feedback with bounded real
scanner controls; automate only the tested staged and full-history-range paths.
Apple/Notion/Google lens: explicit failures, least privilege, reversible narrow
changes, no credentials in logs. GOOD: timely prevention. BAD excluded:
untrusted PR code with write tokens, silent command/base failures, unverified
downloads, broad allowlists. Re-review on scanner upgrade; rollback is a
reviewed revert, never a runtime bypass switch.

1. Verify public release/checksum and native CLI behavior, retain provenance.
2. Add default-rule configuration, checksum-pinned local bootstrap/wrapper,
   lefthook command, PR-head workflow, focused hook tests/docs only.
3. Real bounded controls: clean/staged canary, unstaged versus staged,
   commit then remove history, missing binary/base, shallow repo, nonzero
   scanner, bad download/checksum. Never commit to product history.
4. Redacted tracked-tree/history scan: local input has only 61 reachable
   commits and an 812 KiB pack, so a one-worker time-bounded scan is not an
   expensive history scan. Stop and report sanitized findings if needed.
5. Freeze staged tree, input-relative patch, archive, alternate-index
   reconstruction, checksums, full 55-row and R109–R126 checklists.

## Resource / publication handoff

Backend owns heavy slot. No npm install, broad typecheck, or full suite started;
request parent allocation before those. Native scanner/control work only.
Source ownership remains importer clone only; evidence lives here. No commit,
remote write, API credentials, DB/customer calls or subdelegation.
Parent: archive this checkpoint; remote durability/publication and required
status wiring are yours. Independent audit and remote evidence remain blockers.

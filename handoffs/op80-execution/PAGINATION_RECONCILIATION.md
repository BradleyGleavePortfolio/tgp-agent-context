# Pagination recovery: diagnostic reconciliation and repair decision

## Build matrix and audit validity

Input importer commit: `093b6b01c29123361b043ddd0f36cd4c578cffe2`; tree: `5a606a476b3e9010cdd277841f400aeed8d00fbf`; main/base: `0111be661922234d670bbf23e23d270eec1b4a4e`. Backend main: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`; mobile main: `a5933fd6de5616493de75f0db907098b149b955c`. Context moved from `d480cd3a9082a40229f1170c675d97e862baa0cc` to `0b1f882e472109b69cac956f01d96e7acb0ad7ba` during the diagnostic round.

The parent caused that context movement by publishing newly authorized documents. Canonical R124 says “If any SHA changes mid-audit,” which is stricter than the older preamble's PR-head-only wording. The Astra lens therefore closes INFRA_DEATH; the Fable lens delivered FINDINGS using a narrower interpretation. Both sets of code reproductions remain useful diagnostics, but neither report is accepted as a valid final release audit. No prior CLEAN is carried forward.

The next release audit will use separate read-only clones of all involved repositories pinned to one recorded build matrix. Publishing evidence elsewhere must not mutate those input clones. Every actual PR-head change still invalidates the audit.

## Repair decisions

| Diagnostic | Parent disposition | Required outcome |
|---|---|---|
| A1 / F1 / F2: malformed array or continuation treated as exhausted | Accept, high priority; both lenses reproduced core cases. | Invalid source structure cannot become clean completion; preserve accepted records and report a bounded typed incomplete outcome. |
| A2: deadline/cancellation ends at headers | Accept; real streaming-body reproduction. | Deadline and cancellation cover response body consumption and retain their error classifications. |
| A3: repeated Set construction after exhausted fan-out cap | Accept; operation-count evidence, not speculative timing. | Dedupe state is reused and exhausted contexts do not perform quadratic work. |
| A4: redirect confinement | Accept at code-boundary level; no live exploit claimed. | Reject redirects before any off-origin hop; no new origin permissions. |
| A5: lossy UTF-16 parameter/cursor serialization | Accept. | Reject malformed parameter strings before I/O; malformed runtime cursors cannot silently change on the wire. Preserve valid Unicode. |
| A6: exact-cap final fan-out falsely partial | Accept. | Mark budget exhaustion only when required work remains, not merely when a completed run equals the cap. |
| A7 / A8: hardcoded/non-actionable partial copy | Accept. | Stable message catalog keys, untranslated transport reason codes, and a supported recovery action without claiming a blind retry repairs deterministic defects. |
| A9: inaccurate ceiling comment / excess historical commentary | Accept factual correction. | Concise invariant comments; explain loss of safe integer progression, move history to documentation. |
| F3: overly broad validation claim | Accept scope/documentation mismatch; budget widening needs behavioral tests. | Explicit malformed restrictive budgets fail before I/O; document which fields are validated rather than implying every legacy field follows a new policy. Preserve existing valid contracts. |
| F4: unreachable nullish fallback | Accept after producer review. | Remove phantom fallback; retain legitimate unknown-reason handling. |
| F5: undocumented descriptor/result change | Accept. | Producer-facing documentation states validation changes and complete reason vocabulary. |
| F6: zero/negative safe page starts | Observation, not accepted as a defect. | Existing contract/tests explicitly permit safe integers; no verified platform-independent basis to ban zero/negative starts. Preserve unless evidence demands a separate contract change. |
| F7: 3-second waitFor | Observation, not a demonstrated failure. | No arbitrary timeout inflation. Retain behavior tests; fix only if a real flake or lifecycle defect is reproduced. |
| M1/M2 and Fable repo-wide controls | Separate release blocker, not waived or hidden. | Track enforcement gaps, exact-head remote checks, live protection evidence and coverage separately from replay repairs. |
| M3: explicit empty-test setting | Small configuration repair. | Explicitly fail empty selection and preserve a negative control; current pinned runtime already fails empty selections. |

## Containment and verification

Question rebuilding recovered work: retain it. Delete phantom defenses and repeated work rather than add a parallel importer. Keep fixes in the replay/transport/display boundary with failing regression cases first, no dependency upgrades, no auth weakening, no source writes, and no native-completion claim.

The fixer's output is a current candidate, not self-audit approval. Measure cumulative added production LOC and test density against main; do not remove tests or misclassify test helpers to satisfy a gate. Run focused suites serially and coordinate the full suite with the backend runner on this two-CPU sandbox. Parent reviews, commits and publishes; final Astra/Fable auditors are separate from the fixer.

The Roman-led cross-surface outcome remains tracked separately in [activation issue #22](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/issues/22). A repaired replay engine is not the finished coach migration experience.

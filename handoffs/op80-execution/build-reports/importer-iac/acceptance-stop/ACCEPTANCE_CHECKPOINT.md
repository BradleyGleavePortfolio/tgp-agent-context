# Acceptance checkpoint — blocked at early SCA; all execution slots released

No native/scanner/network/test/install work remains active. Stop-on-first-failure rule applied at the early Python SCA exit1. No dependency copy, synthetic commit, final47 controls, fresh secret scopes, npm gates/audit or full suite started. Original source HEAD/index and all nine R110 files remain unchanged.

- Original HEAD fc7fdf6e50df08cccad86da37c8b0f15f4b72e81.
- Frozen candidate tree ef0c1abf2f0a7dfbee432631ad4dbf6b288e3398.
- Transient pip-audit2.10.1 installed ONCE from29-wheel exact/hash lock; primary wheel hash matched parent pin99ef3f600a317c1945f1e89e227ef26e1c2d618429b8bd3fa6f4f7c440c4611a.
- Early audit ran2026-09-17T21:41:22.599558Z,2.626s,exit1. Retained stderr: “Found 4 known vulnerabilities in 2 packages.”
- Existing Checkov environment/requirements unchanged; installed96target pins match exact lock, bootstrap pip25.0.1 recorded separately.

## Exact packages/advisories from retained native HTTP cache

| Package pin | Advisory identifiers (overlapping aliases grouped for readability) | Feed fixed versions / constraint |
|---|---|---|
| asteval1.0.6 | GHSA-9w56-46f6-3qhx | fixed_in1.0.9; Checkov3.3.19 Requires-Dist asteval==1.0.6 |
| asteval1.0.6 | GHSA-89v8-rhwq-hf77 / CVE-2026-55244 / PYSEC-2026-3807 | fixed_in1.0.9; same exact upstream constraint |
| ecdsa0.19.2 | CVE-2024-23342 / GHSA-wj6h-64fc-37mp / PYSEC-2026-1325 | fixed_in empty; Checkov3.3.19 Requires-Dist ecdsa<1.0.0,>=0.19.0 |

No severity assigned, no exploitability/reachability test performed, no mitigation or suppression granted. Asteval cannot simply be bumped within the declared Checkov dependency constraint; ecdsa has no fixed version listed by this feed. Parent must decide a separately scoped remediation/tool choice; no product edits/upgrades or additional research/execution occurred after stop.

## Evidence-runner defect — original native JSON lost, explicitly not concealed

acceptance_lib.py used phase name python96-audit to write python96-audit.json, colliding with the native --output filename. The runner overwrote the completed native JSON with its execution record. Original native stdout(empty), stderr, execution record and96nativeHTTPcache responses survive. This is a real worker evidence-capture error; it is NOT a clean native report or a silently successful rerun.

Source-only offline decoding recovered all96HTTP200 dependency response bodies, verified cache filename SHA224(URL), decoded package/version identity against96pins, and preserved original-cache/decoded-body SHA256 provenance in RECOVERED_ADVISORY_EVIDENCE.json. Five raw PyPI advisory records contain overlapping aliases; native stderr reported four vulnerabilities. The table groups them into three alias-connected families; it does NOT rewrite the native count or pretend to reconstruct original native JSON byte-for-byte. First offline decoder's assertion expecting4raw records failed; its source is preserved, and corrected offline processing retains5raw records. No scanner/advisory request was rerun.

Evidence:
- SCA_LOCK_CHECKPOINT.json:29toolpins,96targetinventory and integrity checkpoint.
- sca-tool-install.json/stdout/stderr: one hash-locked wheel-only installation.
- python96-audit.json: execution metadata ONLY, not the lost scanner report.
- python96-audit.stderr: native finding count; STOP.json: slot release.
- RECOVERED_ADVISORY_EVIDENCE.json: explicitly labeled offline reconstruction and all96cache origins.
- recovered-advisory-cache/asteval-1.0.6.json and ecdsa-0.19.2.json: actual decoded native response bodies.

Retain earlier native136green,46controls plus1targeted, originalciRED/fixedGREEN and failed selector evidence separately. Full acceptance remains blocked. Any corrective report capture, remedial tooling or acceptance resumption requires explicit parent allocation; no automatic rerun.

VERDICT: FINDINGS

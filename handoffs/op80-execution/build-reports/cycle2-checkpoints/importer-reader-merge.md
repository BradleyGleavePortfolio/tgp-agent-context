# Fail-closed discoveries and bounded repairs

The real merge-resolution control reproduced missing coverage with
`--full-history` alone (`controls-merge-red-v2.log`, scanner exit 0 despite a
merge-only canary). Adding `-m` made both PR-range and all-history controls
detect it (`controls-targeted.log`). The first attempt at this fixture failed
Git identity setup before scanning; that distinct infrastructure log is retained
as `controls-merge-red.log`, not claimed as the defect reproduction.

A second real control found that gitleaks 8.30.0 can return exit 0 when its Git
diff reader exits nonzero with empty stderr. Both the required legacy `protect`
and modern `git --staged` command reproduced this. The wrapper now places a
small temporary Git supervisor ahead of PATH, records failed `diff`/`log`
readers, and refuses a clean result if any reader failed. Optional remote/config
probe failures are not incorrectly treated as failed scans.
This is process-error supervision, not a regex scanner or new control feature.
The pinned scanner still performs all secret detection and rule evaluation.

The same targeted run exposed two synthetic-control construction problems:
assigning test JWTs to `credentialName` created additional generic-key matches;
changing the header suffix to a letter removed its generic-key trigger. Tests
now retain the original variable class and change the header's numeric suffix.
No allowlist was widened, no real data was used, and no assertions were removed.

Parent archival requested. No package installation or heavy gate has started.

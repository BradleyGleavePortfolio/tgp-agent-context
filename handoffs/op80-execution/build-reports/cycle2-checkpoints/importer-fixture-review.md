# Parent review requested — exact synthetic matches only

Offline classification script and sanitized JSON are retained. No network
credential validation was performed and no credential-shaped literal is printed.

* Six JWT matches: header explicitly selects HS256, but five signatures decode
  to only 11 or 12 bytes (HS256 requires 32 bytes), and the sixth has an invalid
  base64url length. All are constants injected into `fakePageStore`. Five
  integration files replace global fetch with Vitest mocks; the collector
  test exercises local stores directly. These are deliberately malformed
  JWT-shaped fixtures, not operational signed HS256 credentials.
* The generic-api-key match is a constant used as a `requestHeaders` property
  name in an explicitly synthetic fixture served under `.invalid`, not a
  credential value. Its exact literal hash and contextual assertion are recorded.

Proposed exceptions: four rule-specific allowlists with `condition = "AND"`,
`regexTarget = "secret"`, fully anchored escaped exact matched literals, and
fully anchored enumerated exact test filenames. Three JWT literals cover the
six exact files; the header-name literal covers only its one file.
No operator-email, entropy, generic JWT, whole test directory, commit,
baseline or fingerprint suppressions.

Real controls will prove a changed canary in the same test paths still blocks,
the exact fixture shape outside its permitted file still blocks, and a
commit-then-remove canary remains detected in PR history.

Please confirm this narrow exception proposal before it is added. Until review,
the real seven-findings result remains blocking and the default-only config is
the implementation target.

# Before lockfile resolution

Two real security negative tests ran before remediation: shell-quote 1.8.3 fails to reject injected newline operator; deepmerge-ts 7.1.5 exhausts stack on merged cycles. Both failed as expected, no shell payload executed, no network or DB. See security-red.log.

Actual Prisma 6.19.3 config source dynamically imports the named default-safe deepmerge function and hands it to c12 merger (dist/index.js:894–917). It does not consume a removed custom API; both versions preserve representative nested object/array merge values and 8.0.0 preserves cycles instead of exhausting stack. Additional actual config-file load/validate/generate required.

Manifest exact-pins existing resolved versions. Only direct runtime updates js-yaml4.3.2 and ws8.21.0; Danger13.0.8 (smallest published fixed command-injection release) removes parse-git-config and uses Octokit20.1.2. No Danger14/Prisma major or Nest12.
Nest11 latest still pins vulnerable multer2.2.0, so keep verified Nest11.1.26 and narrowly override multer2.3.0. Keep Swagger11.4.4 with scoped yaml4.3.2 override instead of unrelated API/tool changes.
Remove inherited global minimatch9 override: it forces an object API onto test-exclude requiring callable minimatch3, causing the preserved C1 Babel coverage failure. Restore consumer-major-compatible lock resolution; retain exact existing diff9.0.0 override.
Parent may archive manifest-manual.patch and this checkpoint before lockfile-only resolution.
One failed metadata/pack attempt (nonexistent shell-quote1.8.5) preserved; registry versions establish fixed1.9.0 exists. No force/audit suppression used.

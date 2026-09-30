# Before clean private installation

Full lockfile audit now reports zero vulnerabilities (including dev), audit-candidate-4.log.
Not yet a verified installation/build or release claim.

All resolution attempts retained. npm10 retained Swagger's nested yaml4.1.1 under parent-scoped `$js-yaml` override even after targeted refresh; replaced that non-effective configuration with exact `js-yaml@4.1.1:4.3.2` selector, which removes vulnerable nested copy without forcing YAML3 consumers to another major.
Targeted compatible transitive updates resolved Babel/browser mapping/body parser/brace expansion/fast-uri/form-data/shell-quote/undici. Direct pins remain as checkpoint02, except corrected YAML override.
Removed global minimatch override restores consumer-major dependencies; no Jest/CI flag changes.

Next: one clean private npm ci with lifecycle scripts disabled, npm ls/engine checks, explicit private Prisma generation, build/typecheck, real dependency compatibility tests and bounded existing tests. Full suite remains unallocated.
Parent archival paths: current candidate package.json/package-lock.json and this evidence directory.

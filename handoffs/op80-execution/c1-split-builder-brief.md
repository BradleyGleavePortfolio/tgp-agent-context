# C1 exact sequential split brief

## Authority and unchanged inputs

User requests continued implementation and whatever can safely run in parallel without shared writers/tools. This is a continuation of the C1 local builder, not an independent audit or consumer dispatch.

Read this full brief, retain the canonical R100 55-row and R109–126 requirements from your original brief, and recheck the immutable context rule inputs. Do not alter any canonical rules.

- Immutable backend main: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`.
- Immutable complete C1 review tree: `3c3d09cf95851fb91e66ed20fe770a1a8164845c`, patch SHA256 `851eb12eefa459409e6b38717a2e971ac2dff4bfde3e728a1d042d88bf9ba603`.
- Frozen original C1 clone `/tmp/tgp-op80-c1-build` is now READ ONLY. Parent migration proof reads its schema/migration; no writes, generation or tests there.
- Immutable context `/tmp/tgp-op80-cycle-inputs/context` at `9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab`; importer input `093b6b01c29123361b043ddd0f36cd4c578cffe2`; mobile input `a5933fd6de5616493de75f0db907098b149b955c`.
- ONLY writable product clone: `/tmp/tgp-op80-c1-split`, detached at backend main, with its own copied dependencies. Evidence ONLY `/home/user/workspace/operator80/execution/c1-split/`.
- Separate frozen recovery tree `a8908132a9c4882dbe80f9fbc1052532c7e68c3b` is not your base and must not be integrated by you.

## Task

Prepare and verify the two coherent slices you proposed, sequentially in your one owned clone:

1. C1a: nullable UUID persistence, current-owner issuance checks and stored-ID echo on existing endpoints, legacy/retry safety assertions and generated echo contract. No session endpoint or session-dependent assertions in this first slice.
2. C1b: owner-bound retained session lookup, DTO/route/no-store/security assertions and moved complete chain assertion; next generated contract version. Depends exactly on frozen C1a.

Preserve every assertion in the complete candidate across these slices. Do not compress formatting, remove safety tests, change gate definitions, add exceptions or reinterpret the all-code cap. Each slice must pass the actual backend workflow net-code cap of 400 and test:source >=2; measure both explicitly. Do not claim the old combined 175-test result applies automatically to either new tree.

Use tree objects and input-relative patches to represent dependencies without commits. Deliver C1a base-relative patch/tree; C1b C1a-relative patch/tree; cumulative final patch; verify both reconstruction paths. The final combined semantic delta should be only the necessary contract-version/doc/split-test placement changes; enumerate any other difference from the frozen review tree.

OWN only the original C1 assigned schema section, one additive pairing migration, pairing controller/service/DTO/tests, importer-contract generator/version/output, contract assertions and decision documentation. No dependency versions, auth issuer/guards, shared middleware, scout ingestion, dunning, mobile/extension source or CI edits.

## Parallel resource boundary

You alone own private C1 split generation, scoped lint/type and bounded single-worker pairing/contract tests; use sanitized Node20 and local-only network denial. No full suite yet. No installation, audit repeat, DB, server, browser, remote queries/writes, commits or subdelegation.

Parent independently owns a new synthetic disposable DB migration proof using the unchanged original migration and native PostgreSQL client, not your private dependencies or Prisma generator. Neither lane edits the other's files or test outputs. Stop and ask if another required resource appears.

No consumer freeze: init is still explicitly non-idempotent, known-ID retrieval cannot recover a lost unknown ID, and paired means setup only. Preserve role/retention/capacity/auth-race findings and default-off behavior; no activation authorization is implied.

## Completion

Freeze both slice trees, provide patch checksums and reconstruction evidence, per-slice exact test/measurement results and complete 55+18 self-check with applicable findings. Report any failed split honestly. Release ownership/resources explicitly; no further broad exploration once this bounded packet is complete.

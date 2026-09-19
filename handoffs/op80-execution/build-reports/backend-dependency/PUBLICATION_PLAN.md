# Backend Dependency Repair: Publication Plan

Parent-owned clone `/tmp/tgp-op80-backend-publication` has no remotes and retains local origin/main at c23. Its staged tree must remain b2bb. Publication uses the authorized Bradley Gleave identity, ordinary installed hooks, an ordinary branch push and a draft PR; never a hook bypass, force push or merge.

## Exclusive execution sequence

1. Wait for diagnostics to release its bounded execution slot. Check available disk and confirm no second heavy validation is active.
2. Privately copy the frozen producer's installed dependencies once, without hardlinks or escaping symlinks. Compare source-before, private-copy and source-after path/type/mode/hash inventories and distinct file inodes.
3. Copy the existing pinned Prettier 3.9.6 into a private tool-only npm global prefix, not product node_modules. Hash-verify the copy and preserve the source. No installation, package change or lockfile change.
4. Run `npm prefix` and `npx prettier --version` with a clean allowlisted environment, private npm prefix/cache, offline mode and the vetted Node network guard. The local prefix must still be the publication repo and formatter version exactly 3.9.6.
5. Install the repo's actual lefthook pre-commit/commit-msg hooks from the private dependency copy. Inspect the generated hooks and run an ordinary Bradley-identity commit once. Retain complete native output and explicit exit status; stop on any failure.
6. Verify resulting tree b2bb, clean tracked files, author/committer identity and unchanged producer dependency hashes. Record commit SHA and hook result in the PR body.
7. Read the remote main/branch state, add only the known backend origin and ordinary-push the new branch. Create a draft PR with the complete body. Keep all inherited machine/control findings open, and verify exact-head remote checks before any independent/release claim.

The repository's native hook invokes parallel tsc/eslint/Prettier commands. That hook occupies the single exclusive validation slot; parallelism internal to the repository hook is preserved rather than rewriting its configuration. The optional quick preflight script is absent and therefore N/A, not an executed preflight pass.

## Evidence integrity

Each command receives a new exclusive-created output directory. Native stdout/stderr, native JSON when applicable, command metadata and result metadata have distinct names. A nonzero exit or timeout stops the sequence; no output file is reused to overwrite prior failure evidence.

No full suite, installation, Prisma generation, database access, shared writable binary, security-setting mutation or consumer implementation is authorized by this plan.

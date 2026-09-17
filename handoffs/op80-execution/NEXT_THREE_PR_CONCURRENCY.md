# Next Three Importer PRs: Dependency and Ownership Control

## Rolling three-PR execution window

The user renewed the direction at 2026-09-17 14:01 PDT: move as fast as possible, parallelize safely and keep three PRs planned ahead. The immediate release-blocker window is below; the original three activation workstreams remain farther down the dependency chain, not three currently independent implementations.

| Next candidate PR | Customer-goal contribution | Current owner and state | Dependency and resource boundary |
|---|---|---|---|
| Backend dependency repair | Make the backend safe to build and unblock recovery/C1 verification | Existing worker preparing narrow fixes for the test-network harness and a reproduced Swagger/YAML graph inconsistency; audit zero, type/build/lint/focused coverage passed | Sole backend candidate writer; package/tests paused during importer verification; no schema, contract or application edits |
| Importer secret-scanning plus bounded IaC prerequisite | Close the scanner gap without introducing an unchecked workflow | R110 frozen and locally verified; isolated R120 writer now allocated private pinned installation and native controls | Independent of backend runtime; exclusive bounded verification slot; no npm/full suite, replay or consumer edits |
| Backend diagnostic sanitization | Prevent database failures from exposing import/customer details while preserving useful diagnostics | Parent preparing the four-path recovered slice; builder queued after backend owner releases | Starts from the accepted dependency candidate; meaningful missing tests required to reach density; no DB/contract changes |

Lookahead after each slot advances: input validation with a forward 2.x generated contract, deployment-compatible database identity recovery, then integration of C1a/C1b. The database recovery may require several independently safe PRs; a read-only architect now makes those stages concrete instead of leaving the rollout problem until implementation.

Parallel work is backend source/evidence preparation, importer R120 native verification, and read-only database rollout design. Only the importer may run allocated heavy validation now. The parent handles frozen evidence, publication, next-slice preparation and the ownership ledger; no M5 or extension-consumer implementation begins before the binding C1 landing/freeze.

## Decision

User direction, verbatim:

> Check for parallization blockers for the next 3 PR's you have planned. Would we be able to work on all three without subagents trampiling eachother or calling the same code/tools? Can you handle management o three PR's in cycles without issue? Go see if thats possible without any issues - whatever CAN be papalized safely, do it!

The next three activation slices are backend C1 durable paired intent, mobile M5 coach onboarding, and the extension server-intent consumer. These are three coordinated PR cycles, not three immediately independent coding tasks. This record implements the user's September 17 request to parallelize safe work without agents overwriting one another.

Execution found that C1's fully tested combined patch exceeds the actual backend all-code cap (454 net lines). C1 therefore requires sequential C1a issuance/storage and C1b owned-lookup PRs before its contract can freeze. The three activation workstreams are unchanged, but they are not honestly describable as exactly three landing PRs anymore; cap-compliant sub-slices and prerequisite repairs must precede the consumers.

The active ruling explicitly requires C1 to land and freeze before M5 begins, and requires C1 freeze before extension consumption ([binding ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md)). Existing pagination and backend recovery remain prerequisite work, not newly completed releases.

## Dependency graph

```text
Frozen backend recovery ---- reconciliation of shared schema/contract ----+
Backend security/CI blockers -------------------- landing gates ---------+
                                                                        v
C1a -> C1b -> integrated-tree tests -> dual audit + CI -> land/freeze
                                                                  |
                                    +-----------------------------+----+
                                    v                                  v
Mobile prerequisite stack -> M5 implementation              Extension consumer
PR289 -> PR290 -> PR291 -> PR292                              ^
                                                  pagination repair lands
```

C1 coding can begin on pinned current backend main in an isolated clone while the recovered integrity candidate remains frozen. Both eventually change `prisma/schema.prisma` and the generated importer contract, so integration is serialized by the parent and reverified; neither agent may overwrite the other's candidate. The recovery is not silently abandoned, and a local C1 build is not permission to land around outstanding security gates.

Parent-only composition was then tested in a separate bare repository/index. The recovery patch reconstructed exactly `a8908132`; checking the complete frozen C1 patch over it failed in `scripts/importer-contract.ts` and `docs/contracts/importer-openapi.json`. The schema hunks did not conflict textually. This is a confirmed integration dependency, not merely a likely overlap.

The generator conflict has a concrete cause: recovery raises the contract from 1.4.0 to 2.0.0, while the isolated C1 review candidate raises 1.4.0 to 1.5.0. Parent must preserve the breaking recovery version and choose forward versions according to final landing order, then regenerate the complete artifact and rerun contract checks. Never hand-merge generated JSON or downgrade a landed 2.x contract to a draft 1.x version. The C1 split builder remains on its explicitly pinned base; its provisional versions are not a consumer freeze.

## Three PR lanes

| Slice | Work permitted now | Coding unblock condition | Exclusive future ownership |
|---|---|---|---|
| C1 backend durable paired intent | C1a/C1b frozen; parent integration and remaining-gate resolution next | Backend recovery writer closed; parent has reserved schema and contract generation | `src/extension-pair/**`, pairing-specific tests, ExtensionPairCode schema section and its additive migration, generated importer contract |
| M5 mobile onboarding | Read-only prerequisite reconciliation and acceptance/file inventory; no M5 implementation | C1 landed and contract frozen; PR289–292 stack reconciled into an audited base | Actual coach wizard, importer screen/panel/state/API consumer and associated tests, only after explicit dispatch |
| Extension server-intent consumer | Read-only seam review complete; pagination repair published as draft, not accepted or landed | C1 contract frozen; pagination ownership released and its accepted changes integrated into the consumer base | Pairing storage, popup pairing, Start/intent path and associated tests; replay fixes are not rewritten |

Mobile prerequisite refs declare a stack, not four independent PRs: [PR289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289) is based on main, [PR290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290) on PR289, [PR291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291) on PR290, and [PR292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292) on PR291. The parent verified all four are draft at inspection; previous CI results are not current audit approval.

Deeper object inspection found that this declared stack is stale: PR290 descends from PR289's original `4be69b9`, not its final `2235498`. Three later PR289 amendments are missing from PR290–292, affecting the dependency declarations/lockfile, dependency guard and documentation. Preserve them before integration; do not treat PR292 as the complete combined snapshot.

The parent then ran a non-checkout `git merge-tree --write-tree` between final289 and PR292. It exited 0 with tree `06417d3625146f981dbc16c88e8f79ff39977b2d`, showing that these frozen inputs compose without textual conflicts. This is not a commit, rebase, remote change, installed-tree validation, behavioral test or landing approval. All input HEADs remained unchanged. The full readiness report and machine-readable ancestry/file inventory are preserved beside this plan.

## Collision and resource locks

- **Backend schema and contract:** C1's writer has frozen both slices and released ownership. Cycle 2 dependency builder `cycle2_dependency_builder_mu5ytcm7` is now the sole backend writer in a new private clone, limited to dependency remediation and approved compatibility evidence. The recovered 27-file candidate and all C1 candidates are immutable; parent performs read-only sequencing now and owns eventual composition and generated-contract integration after that writer releases ownership.
- **Mobile state and navigation:** One mobile coding owner at a time. Readiness review cannot edit, rebase, install packages, or implement M5 against a speculative API.
- **Extension shared worker:** The pagination fixer has frozen its candidate and explicitly released ownership. Cycle 2 R110 builder `cycle2_secrets_builder_mu5ytcme` owns only secret-scanning configuration, hook/package plumbing, its workflow and tests in a new private clone at `fc7fdf6`. It may not change `background.js`, replay/network code, the message catalog, manifest permissions or consumer behavior. The future consumer must start from the accepted repair base, not the old `093b6b0` input; C1 freeze is still required.
- **Dependencies and generators:** Per-lane copies, never writable shared `node_modules`, lockfiles, Prisma generated output, test result files or working directories. Parent controls package installations and expensive generators.
- **Tests:** One full-suite resource slot across the sandbox. Focused tests must be bounded; agents request the slot before large suites or live DB tests. No two agents run the same validation just to produce duplicate evidence.
- **External actions:** Parent alone performs GitHub queries, commits, pushes, PR edits, tracking issues and merges. Agents have no remote-write authority. No shared DB, browser login, real account, production flag, port or server is allocated to a new lane.
- **Audits:** Fresh Astra/Fable lenses each get separate read-only pinned inputs and evidence paths. All involved SHAs remain stationary during the audit; any fix invalidates prior approval and starts a new exact-head cycle.

## Managed cycle

1. Reserve exact files, base SHAs, evidence directory and test resources; checkpoint brief hash and actual dispatch ID.
2. Build locally with failing regression tests first; surface missing contracts rather than inventing them.
3. Freeze candidate, release writer ownership, verify patch/tree and local gates.
4. Parent integrates dependencies and publishes only when applicable gates permit; exact-head CI and fresh independent dual audits follow.
5. Repair findings in one writer lane, refreeze, and repeat the exact-head review. A contract change reblocks affected consumers.
6. Land only with all required approvals and gates; then unlock dependent implementation. Final cross-repository acceptance uses one pinned matrix.

This supports management of three PR cycles with staged concurrency. It cannot guarantee zero issues, and it deliberately trades some simultaneous coding for fewer conflicting edits, stale contracts and repeated expensive tests.

## Dispatch checkpoint

- **C1:** `c1_durable_intent_builder_mu5vm602` completed and released writer/generator/test resources. C1a is frozen at tree `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556`, 202 net workflow lines, 2.895 test/source density and 158 focused tests passed. C1b is frozen relative to A at `660e436ecbf911b6984b40ed43d135e3dc308378`, 252 net lines, 2.200 density and 175 focused tests passed. Both passed strict typecheck, scoped lint and deterministic generation. Sequential and cumulative patch reconstruction matched exactly; all ten original final spec files remain byte-identical. These are overlapping suite counts, not 333 distinct tests. The combined 454-line patch remains review-only.
- **M5 readiness:** `m5_prerequisite_readiness_mu5vm609` completed with FINDINGS and released ownership. Its read-only clone remains at `a5933fd`; no product changes, installations or tests were performed.
- **Pagination:** `pagination_boundary_fixer_mu5un0lr` completed with FINDINGS and released ownership. Parent committed the unchanged final tree `88256320` as `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81` and published it to existing draft PR21. Its final local full-suite log records 51 files / 1,529 passed; the actual installed pre-commit hooks and committed-head gates also passed. Independent approval and outstanding repository controls remain release gates.
- **Parent:** GitHub, evidence publication, integration decisions, extension seam inventory, resource allocation and audit reconciliation. No second C1, M5 or extension consumer coding agent is active.

The earlier C1/readiness lanes used their separate context input at `9b4f55d`. The newly active Cycle 2 builders use a different immutable context clone at `ad2259c0649e4e53a663a2600343da1a08ac8b35`, not the parent publication branch. Each dispatch's own brief hash, complete matrix, prediction and actual ID are recorded in `dispatch-ledger.jsonl`; do not substitute one round's pins for another.

The parent read both complete per-slice 55+18 self-checks and preserved their FINDINGS verdicts. The 18 bounded synthetic DB checks ran on original tree `3c3d09cf`; unchanged runtime/migration evidence maps to the split, but no whole-tree DB rerun, CI PostgreSQL 15 equivalence, full migration chain or live auth proof is claimed. Contract versions 1.5.0/1.6.0 remain provisional pending recovery's 2.x integration. Full-suite/integration proof, inherited security/control failures, independent review and exact-head remote gates remain outstanding; neither C1 slice is committed, published or landed, and consumers remain blocked.

Safe concurrency actually completed: backend construction alongside read-only mobile readiness and pagination closeout, then isolated C1 splitting alongside parent migration and composition checks. No parallel worker wrote mobile or the future extension consumer, no shared writable dependency/generator output was allocated, and no duplicate full-suite run was dispatched. Final split evidence is preserved in `build-reports/c1-split/`; original patch bytes are in deterministic archives listed in `build-reports/PATCH_ARCHIVES.md`.

Cycle 2 is now active: backend dependency remediation and importer real secret-scanner enforcement use separate clones. Backend completed generation/type/build and eight compatibility probes, then froze a pause tree and released all writer/execution slots. Importer completed its native scanner, hook and lightweight checks; its first full suite was contaminated by an evidence-runner environment setting and is preserved. One authorized corrected run passed all 51 files and 1,534 tests on the unchanged frozen tree, with no source edits or second installation. Importer is now report-only; the same backend worker has the exclusive remaining validation slot, including one full suite. No live DB access is allocated. Parent owns read-only recovery decomposition, checkpoint publication and external actions.

Parent read-only measurement confirms the recovery's database/proof kernel alone is 897 workflow lines and exposes an unresolved old-writer/new-schema rollout dependency. An unchanged mechanical split is not safe. `RECOVERY_SEQUENCING.md` records independently useful candidate boundaries, their density failures, staged-rollout requirements and preservation of all 21 live assertions. This does not waive the gate or claim new tested slices.

## Extension consumer seam inspection

The parent read the pinned importer at `093b6b0`. `shared/pairing.js` consumes access/refresh tokens and chosen platform, sends `session_established`, and owns no storage; `shared/session.js` alone owns token persistence and serializes establish/clear/refresh with an epoch guard. `background.js` handles the trusted-page session message and currently self-mints both `ext-...` legacy and `imp-...` replay IDs.

The future consumer therefore needs one coherent change across pairing decode, the session-owned non-secret correlation state, the trusted session message and Start's ID selection. It must preserve single-flight behavior, clear correlation with account/session changes, survive worker rehydration without persisting bearer tokens to disk, and define behavior for old redeem responses. A separate popup-only patch would leave Start on its old self-minted ID.

Likely test ownership is `test/pairing.spec.js`, session lifecycle tests, `test/storage-policy.spec.js`, Start/ingest settlement tests and shared background mocks. The pagination repair also changes `background.js` and `test/helpers/background-mock.js`; its writer has released ownership, but the consumer must still wait for its accepted base and C1 freeze.

First-install setup, arbitrary-site selection, source permission expansion and native-result completion are later distinct activation capabilities, not bundled into this narrow server-intent consumer. C1's new durable setup ID must never be described as proof of accepted Start or complete migration.

## Additional implementation blockers found by readiness

- **Role policy:** The ruling's sub-coach/gym-owner terminology does not match the current mobile entry and backend pair guards. A mobile allowlist must not invent privileges; C1 retains current authenticated coach/owner eligibility while the parent resolves policy before M5 dispatch.
- **Mobile lifecycle:** PR291's mirror preserves pending codes, not a durable paired intent. Owner hydration/switch races, late responses and crash-before-init-reply require explicit evidence and C1 retry semantics; an unknown lost ID cannot be recovered by an endpoint that requires that ID.
- **Truthful UI:** Existing paired-state copy implies running and roster deltas imply import results. M5 must distinguish setup, accepted Start and intent-scoped native outcomes, preserve accessibility, and keep Skip/Do-later usable without claiming cancellation.
- **Wizard boundary:** Use the actual coach wizard's Step5-to-Step6 interstitial without inventing a seventh backend step or altering client onboarding.

These are discovered blockers, not reasons to discard the existing stack. The closed readiness report defines one future mobile owner, exact shared paths and the acceptance matrix.

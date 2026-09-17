# Next Three Importer PRs: Dependency and Ownership Control

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
C1 local build -> tests -> frozen candidate -> dual audit + CI -> land/freeze
                                                                  |
                                    +-----------------------------+----+
                                    v                                  v
Mobile prerequisite stack -> M5 implementation              Extension consumer
PR289 -> PR290 -> PR291 -> PR292                              ^
                                                  pagination repair lands
```

C1 coding can begin on pinned current backend main in an isolated clone while the recovered integrity candidate remains frozen. Both eventually change `prisma/schema.prisma` and the generated importer contract, so integration is serialized by the parent and reverified; neither agent may overwrite the other's candidate. The recovery is not silently abandoned, and a local C1 build is not permission to land around outstanding security gates.

## Three PR lanes

| Slice | Work permitted now | Coding unblock condition | Exclusive future ownership |
|---|---|---|---|
| C1 backend durable paired intent | Implement and test the narrow control-plane contract locally | Backend recovery writer closed; parent has reserved schema and contract generation | `src/extension-pair/**`, pairing-specific tests, ExtensionPairCode schema section and its additive migration, generated importer contract |
| M5 mobile onboarding | Read-only prerequisite reconciliation and acceptance/file inventory; no M5 implementation | C1 landed and contract frozen; PR289–292 stack reconciled into an audited base | Actual coach wizard, importer screen/panel/state/API consumer and associated tests, only after explicit dispatch |
| Extension server-intent consumer | Parent read-only seam review; current pagination fixer continues its existing lane | C1 contract frozen; pagination ownership released and its accepted changes integrated into the consumer base | Pairing storage, popup pairing, Start/intent path and associated tests; replay fixes are not rewritten |

Mobile prerequisite refs declare a stack, not four independent PRs: [PR289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289) is based on main, [PR290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290) on PR289, [PR291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291) on PR290, and [PR292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292) on PR291. The parent verified all four are draft at inspection; previous CI results are not current audit approval.

Deeper object inspection found that this declared stack is stale: PR290 descends from PR289's original `4be69b9`, not its final `2235498`. Three later PR289 amendments are missing from PR290–292, affecting the dependency declarations/lockfile, dependency guard and documentation. Preserve them before integration; do not treat PR292 as the complete combined snapshot.

The parent then ran a non-checkout `git merge-tree --write-tree` between final289 and PR292. It exited 0 with tree `06417d3625146f981dbc16c88e8f79ff39977b2d`, showing that these frozen inputs compose without textual conflicts. This is not a commit, rebase, remote change, installed-tree validation, behavioral test or landing approval. All input HEADs remained unchanged. The full readiness report and machine-readable ancestry/file inventory are preserved beside this plan.

## Collision and resource locks

- **Backend schema and contract:** C1 is the only active backend writer. The recovered 27-file candidate and its evidence are immutable; parent owns eventual composition, generated contract regeneration, and resulting-tree verification.
- **Mobile state and navigation:** One mobile coding owner at a time. Readiness review cannot edit, rebase, install packages, or implement M5 against a speculative API.
- **Extension shared worker:** The pagination fixer has frozen its candidate and explicitly released ownership. Parent integration now owns `background.js`, `shared/net.js`, replay files, message catalog, manifest, package metadata and shared test mocks. The future consumer must start from the accepted repair base, not the old `093b6b0` input; C1 freeze is still required.
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

- **C1:** `c1_durable_intent_builder_mu5vm602` froze a complete review tree `3c3d09cf` after 175 focused tests, strict type/scoped lint and deterministic contract generation. The combined 454-net-line patch cannot publish as one PR. A bounded continuation prepares C1a/C1b sequentially in new clone `/tmp/tgp-op80-c1-split`; the original clone and tree remain read-only for parent migration proof.
- **M5 readiness:** `m5_prerequisite_readiness_mu5vm609` completed with FINDINGS and released ownership. Its read-only clone remains at `a5933fd`; no product changes, installations or tests were performed.
- **Pagination:** `pagination_boundary_fixer_mu5un0lr` completed with FINDINGS and released ownership. Parent committed the unchanged final tree `88256320` as `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81` and published it to existing draft PR21. Its final local full-suite log records 51 files / 1,529 passed; the actual installed pre-commit hooks and committed-head gates also passed. Independent approval and outstanding repository controls remain release gates.
- **Parent:** GitHub, evidence publication, integration decisions, extension seam inventory, resource allocation and audit reconciliation. No second C1, M5 or extension consumer coding agent is active.

Each new lane's brief hash, input matrix and actual ID are recorded in `dispatch-ledger.jsonl`. Their read-only context input is a separate clone at `9b4f55d`, not the parent publication branch.

## Extension consumer seam inspection

The parent read the pinned importer at `093b6b0`. `shared/pairing.js` consumes access/refresh tokens and chosen platform, sends `session_established`, and owns no storage; `shared/session.js` alone owns token persistence and serializes establish/clear/refresh with an epoch guard. `background.js` handles the trusted-page session message and currently self-mints both `ext-...` legacy and `imp-...` replay IDs.

The future consumer therefore needs one coherent change across pairing decode, the session-owned non-secret correlation state, the trusted session message and Start's ID selection. It must preserve single-flight behavior, clear correlation with account/session changes, survive worker rehydration without persisting bearer tokens to disk, and define behavior for old redeem responses. A separate popup-only patch would leave Start on its old self-minted ID.

Likely test ownership is `test/pairing.spec.js`, session lifecycle tests, `test/storage-policy.spec.js`, Start/ingest settlement tests and shared background mocks. The current pagination repair also changes `background.js` and `test/helpers/background-mock.js`, so this consumer is intentionally not dispatched while that writer owns them.

First-install setup, arbitrary-site selection, source permission expansion and native-result completion are later distinct activation capabilities, not bundled into this narrow server-intent consumer. C1's new durable setup ID must never be described as proof of accepted Start or complete migration.

## Additional implementation blockers found by readiness

- **Role policy:** The ruling's sub-coach/gym-owner terminology does not match the current mobile entry and backend pair guards. A mobile allowlist must not invent privileges; C1 retains current authenticated coach/owner eligibility while the parent resolves policy before M5 dispatch.
- **Mobile lifecycle:** PR291's mirror preserves pending codes, not a durable paired intent. Owner hydration/switch races, late responses and crash-before-init-reply require explicit evidence and C1 retry semantics; an unknown lost ID cannot be recovered by an endpoint that requires that ID.
- **Truthful UI:** Existing paired-state copy implies running and roster deltas imply import results. M5 must distinguish setup, accepted Start and intent-scoped native outcomes, preserve accessibility, and keep Skip/Do-later usable without claiming cancellation.
- **Wizard boundary:** Use the actual coach wizard's Step5-to-Step6 interstitial without inventing a seventh backend step or altering client onboarding.

These are discovered blockers, not reasons to discard the existing stack. The closed readiness report defines one future mobile owner, exact shared paths and the acceptance matrix.

# Operator 80: TGP Importer Recovery and Execution Plan

Evidence captured September 17, 2026. Owner: Bradley Gleave. Scope: full supplied-document review, repository reconstruction, fresh bounded verification, product direction, and an executable continuation plan. This is not an independent R14 audit, a product-code delivery, or a production-readiness certification.

## Executive conclusion

TGP has substantial importer infrastructure, but it does not yet have the finished, site-agnostic, zero-post-start-work migration experience described in the handoff. The merged extension can replay a registered TrueCoach blueprint; newer inference and integrity repairs survive on unmerged branches; native reconstruction still has material coverage limits ([extension resolver](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/shared/replay/resolve.js), [recovery ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json), [destination families](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/scout/reconstruct/families.ts)).

The user's activation concern is real at the code-contract level. The app can open a source login page on the current device, then tell the coach to enter a code in a browser extension, while pairing itself only issues credentials and the extension still requires its own Start action ([mobile entry](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ImportDataScreen.tsx), [pairing service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/extension-pair/extension-pair.service.ts), [worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js)). A correct importer hidden behind this gap is not a finished product.

Decision: **resume and integrate the existing repairs; do not rebuild the importer. Make browser activation and native-result reconciliation explicit release blockers, not polish to add later.** Treat “all platforms, all available history, within five minutes” as the demanding goal-state contract to prove, never a claim inferred from unit tests or a successful first batch.

## What was read and how conflicts are resolved

### Supplied material

All text in the three supplied Word handoffs and the complete 1,464-line uploaded AGENT_RULES file was read, not just summarized from filenames. The importer handoff footer was checked separately. The previously supplied engineering and agent skills are installed in the personal skill library; the engineering modules were used for this investigation.

- **Importer expansion/work-deletion handoff:** Defines a general migration machine: observe, understand, act, observe again, verify, import, verify the result. Reuse MV3, pairing, capture, replay, the locked extractor interface, the TrueCoach oracle, and backend ingest. Prefer network evidence, converge other evidence into the same representation, and keep model proposals separate from a deterministic read-only executor.
- **Autonomous executive handoff:** Delegates normal product and engineering decisions, demands requirement deletion before optimization, and calls for explicit pre-build choices such as BUILD SMALLER and VALIDATE FIRST. Its older request to wait for approval and its stale rule range are not used to recreate routine approval delays under the current user directive.
- **Separate-product operator handoff:** Supplies valuable continuity lessons: inspect actual trees, pin exact SHAs, distrust stale PR descriptions, distinguish dispatch from completion, and preserve failures honestly. It is not the TGP importer handoff. No private operational details from that other product are reproduced here or used to authorize unrelated work.
- **AGENT_RULES:** The uploaded snapshot is not the latest constitution. Canonical repository rules explicitly enumerate R1-R126 and R130-R138, leaving R127-R129 nonexistent; they also supersede server-side production-main merging and routine approval latency without waiving independent audits ([canonical rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/AGENT_RULES.md)).

### Authority and truth boundaries

Use current user intent, the live canonical constitution, relevant repository rulings, and exact current code together. Never transplant another project's rule numbering, treat a missing rule as permission, invent a lost audit report, or call an unmerged proposal “landed.”

The zero-action/five-minute amendment is preserved in open extension PR19, not merged main; it explicitly supersedes the older Learn/Confirm/manual-discovery acceptance path and moves A1-A4 before final integration and V1 ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19)). Adopt that explicit target for planning, then reconcile the documentation surfaces before implementation rather than silently relying on the older main-plan scoreboard.

## TGP at product level

TGP is organized as a coaching-business platform, with a B2B marketing surface, a substantial backend, and a React Native/Expo mobile app; the platform-site README distinguishes it from the course site and coaching funnel ([platform repository](https://github.com/BradleyGleavePortfolio/tgp-platform-site), [backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend), [mobile repository](https://github.com/BradleyGleavePortfolio/growth-project-mobile)). Repository breadth is not evidence that every feature is deployed or customer-ready.

The inspected codebase spans coach/client identity and rosters, training and workout creation, nutrition and habits, messaging and communities, scheduling, content, billing and payment recovery, integrations, and AI-assisted workflows ([backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend), [mobile repository](https://github.com/BradleyGleavePortfolio/growth-project-mobile)). The importer should be the migration path into those native workflows, not a disconnected data archive or another destination that a coach must manually configure.

Proposed customer definition of success: “My existing coaching business is here, the data makes sense, and I can use it immediately.” Luxury means this result is understandable, trustworthy, calm, fast, recoverable, and accessible; visual refinement cannot compensate for the wrong account, a hidden entry point, a missing history family, or a false success message.

## The predecessor's actual stopping point

### Evidence hierarchy

The newest preserved context is `110d28022c791c26de83995a195e754bfa22a5eb`, on `ops/importer-recovery-2026-09-16`, rather than September 9 context main ([recovery commit](https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/110d28022c791c26de83995a195e754bfa22a5eb)). Its final ledger entries record backend round-two auditors paused pending the canonical context SHA; several supporting reports are referenced by old workspace paths rather than committed files ([dispatch ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json)).

This is the strongest recoverable predecessor state. The available evidence does not independently label that exact session “Operator 79,” so I do not fabricate a final conversation or claim access to its dead workspace.

### Exact build matrix

| Surface | Exact SHA at capture | Interpretation |
|---|---|---|
| Context main | `32445a75c7ee6a0018c1f3979519b3e62ed67fc8` | Canonical doctrine baseline; recovery branch is newer ([context](https://github.com/BradleyGleavePortfolio/tgp-agent-context)) |
| Context recovery | `110d28022c791c26de83995a195e754bfa22a5eb` | Last preserved predecessor dispatch state ([commit](https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/110d28022c791c26de83995a195e754bfa22a5eb)) |
| Extension main | `0111be661922234d670bbf23e23d270eec1b4a4e` | Merged C2a-era foundation and replay ceilings ([runtime](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js)) |
| Pagination repair R2 | `093b6b01c29123361b043ddd0f36cd4c578cffe2` | Latest recoverable pagination code, not PR21 head ([commit](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/commit/093b6b01c29123361b043ddd0f36cd4c578cffe2)) |
| Membership repair R3 | `312280bb22739e712052f50b620ab87f3d0d4b91` | Latest preserved membership candidate ([commit](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/commit/312280bb22739e712052f50b620ab87f3d0d4b91)) |
| Backend main | `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` | Includes a newer dunning correction absent from repair ancestry ([backend](https://github.com/BradleyGleavePortfolio/growth-project-backend)) |
| Backend integrity R2 | `6b263c2f342a561ca8a64e5efa077e6c90601a4a` | Latest preserved integrity/security repair ([commit](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/6b263c2f342a561ca8a64e5efa077e6c90601a4a)) |
| Mobile main | `a5933fd6de5616493de75f0db907098b149b955c` | Gated settings importer, not completed onboarding integration ([screen](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ImportDataScreen.tsx)) |

### Reconstructed sequence

1. **September 10:** Extension foundation splits had reached main; PR19 preserved the zero-effort goal, PR20 checkpointed endpoint-role inference, and PR21 proposed strict pagination validation ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19), [PR20](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/20), [PR21](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21)).
2. **September 16, pagination:** Audits of PR21 found sparse cursor paths, special query keys, and unadvanceable numeric page walks; fixes progressed through `cda79e4` and `093b6b0`, followed by an R3 fixer dispatch ([pagination repair brief](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/importer-recovery-2026-09-16/PAGINATION_FIX.md), [ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json)).
3. **September 16, membership:** Work progressed through `c1f53af`, `6c2fb6a`, and `312280b`; the last ledger status says product fixes were pushed and verified but remained non-mergeable pending shared controls, exact-head checks, signing/reviewer policy, and fresh dual audits ([ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json)).
4. **September 16, backend:** Original PR522 became a broader integrity repair at `f3f6db5`, then `6b263c2`; the preserved R2 record claims 7,888 full-suite and 21 live PostgreSQL tests, but explicitly does not claim mergeability ([ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json)). Those are predecessor-reported results, not tests I reran.
5. **Last durable action:** Backend R2 auditors were dispatched and paused awaiting the context pin; no terminal dual-CLEAN verdict is preserved there ([ledger](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/dispatch.json)).

No remote pagination R3 branch was found in the current repository inventory. Its unpushed contents, if any, remain unrecovered; the correct restart is the last preserved R2 tree plus a fresh evidence-driven repair/review cycle, not invented R3 code.

### Open PRs are not the full work inventory

| Work | PR head | Current assessment |
|---|---|---|
| Goal amendment | PR19, `69d35e52ad9e83795c5092b6f9ae3876aeed60f1` | Documentation proposal; reconcile before resuming the stale main-plan baton ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19)) |
| Endpoint roles | PR20, `93a678a4e4c6b1703f95c313ea342deb59f33a72` | Explicitly paused pending the membership seam; fresh targeted tests reproduce 69 pass / 10 fail ([PR20](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/20)) |
| Pagination | PR21, `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d` | Stale relative to recovered repairs; old green checks cannot certify R2/R3 ([PR21](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21)) |
| Ingest identity | Backend PR522, `e045cfc5e70124061b13e5dc4f4f4efb6132cceb` | Original LOC gate is red; newer R2 repair has no current PR/check set proving its release readiness ([PR522](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/522)) |
| Mobile deterministic install | PR289, `22354984d9e3af0deb2d32271ce9ab5e5accb92a` | Open; listed checks green, not an independent audit certificate ([PR289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289)) |
| Mobile flags/review switch | PR290, `ed0342e976bfd2992755d85afb1678bd135c327a` | Open; listed CI green ([PR290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290)) |
| Durable pairing/correlation | PR291, `d2f0d31c6898f8642153df7a53644c1f38f26114` | Open; listed CI green ([PR291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291)) |
| Pairing usability | PR292, `340886776e3af0c22b97aae666b1b0f331820f5f` | Open; listed CI green ([PR292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292)) |

## Importer architecture: implemented versus missing

### Browser extension

- **Installed infrastructure:** MV3 worker, popup, pairing, source-token collection, capture lifecycle, replay, progress, ingestion and terminal reporting exist ([worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js)).
- **Actual platform reach:** The running resolver registers TrueCoach only; generic inference primitives are not yet an unknown-platform execution path ([resolver](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/shared/replay/resolve.js)).
- **Permission reach:** The manifest has broad optional host declarations, but its content-script matches are TrueCoach-specific; a declaration is not proof that the runtime requests access and attaches correctly to an arbitrary site ([manifest](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/manifest.json)).
- **Start/correlation:** The worker creates a timestamp-derived `imp-...` intent when Start Import is handled rather than consuming the already-planned server-minted cross-device intent ([worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js), [onboarding ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md)).
- **Safety already worth retaining:** Shared single-flight control, trusted extension-page checks for Start Import and token establishment, observed-origin confinement, source/TGP authentication distinction, bounded replay, and backend acknowledgment before successful ingest settlement are implemented ([worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js)).
- **Completion boundary:** Its successful notification follows replay/ingest settlement, not an end-to-end native-record reconciliation gate; that boundary is insufficient for the PR19 goal ([worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js), [PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19)).

### Discovery and inference

The merged foundation provides bounded capture normalization, shape signatures and URL-template inference; the recovered membership branch adds snapshot-local provenance, semantic revalidation and a validated observation-selection capability without wiring runtime behavior ([recovery brief](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/ops/importer-recovery-2026-09-16/handoffs/importer-recovery-2026-09-16/BRIEF.md), [membership commit](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/commit/312280bb22739e712052f50b620ab87f3d0d4b91)). Endpoint roles must consume that authority rather than recreate an independent URL matcher; PR20 itself acknowledges that dependency ([PR20](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/20)).

Still required by the goal: relationship/pagination evidence, confidence and contradictions, safe blueprint compilation, learn-session integration, generic page observations, a closed safe-action vocabulary, planner validation, autonomous discovery, and a real unknown-platform proof ([goal amendment](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19), [execution epic](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/issues/10)). Synthetic fixtures validate contracts; they do not establish that a real coach can migrate.

### Backend identity, storage and reconstruction

The current main ingest service deduplicates on coach, intent and source ID, omitting entity family; overlapping IDs across families can therefore be silently suppressed by `skipDuplicates` ([ingest service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/scout/scout-ingest.service.ts)). This is a data-integrity blocker, not a cosmetic defect.

The newer backend R2 repair expands the identity to `(coach_id, intent_id, entity_type, source_platform, source_id)` in staging and the reconstruction ledger, and includes strict platform/timestamp validation, diagnostic privacy hardening, live migration tests and an explicit LOC exception request ([repair commit](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/6b263c2f342a561ca8a64e5efa077e6c90601a4a)). It is materially broader than “add entity_type to the index.”

The repair's merge base with current main is `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`; main's later `c23b9d9f` dunning fix is not its ancestor. An integration must preserve that fix and its tests, resolve overlapping code deliberately, and rerun verification on the resulting tree; never copy the entire repair tree over current main ([repair](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/6b263c2f342a561ca8a64e5efa077e6c90601a4a), [backend history](https://github.com/BradleyGleavePortfolio/growth-project-backend)).

Today's `clients` reconstruction writes tenant-owned `Person` records, while `workouts` and `client_history` use the generic `ScoutReconstructedEntity` destination; billing has no registered reconstruction family ([family registry](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/scout/reconstruct/families.ts)). Those generic records are useful infrastructure, but PR19 explicitly excludes staging/audit artifacts from the finished native-migration claim ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19)).

Pairing currently returns access/refresh credentials and the chosen platform, not a durable import lifecycle shared by app and worker ([pairing service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/extension-pair/extension-pair.service.ts)). Preserve the existing token authority; extend the approved control-plane contract instead of creating a second login or parallel migration backend.

### Mobile discovery and truthfulness

The current screen is default-off and reached through Settings, opens the source using native `Linking`, and then instructs the coach to use the browser extension; it does not provide the complete desktop installation/handoff journey ([mobile entry](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ImportDataScreen.tsx)). This is a code-level journey gap; it was not tested on a real mobile device in this session.

The paired panel can say “Your import is still running in the browser extension” when the roster delta is zero, although pairing is not evidence that Start was accepted; a roster delta also is not an intent-specific reconciliation result ([paired panel](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/components/coach/ExtensionPairingPanel.tsx), [worker](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js)). Replace inference from UI side effects with authoritative lifecycle facts.

The existing ruling already places coach-only importer onboarding between Payments and Ready, with Skip/Do later/resume, no client self-promotion, and backend C1 before mobile M5 and extension consumption of the server intent ([onboarding ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md)). The new plan implements that direction rather than inventing another onboarding system.

## Fresh verification performed

These are direct Operator 80 verification results, not independent audit verdicts. Node was `22.23.2`, matching the repository CI's Node 22 major; locked extension dependencies were installed without lifecycle scripts, with zero reported dependency vulnerabilities at installation.

| Snapshot | Fresh tests | Existing gates in isolated checkout | Actual diff metrics |
|---|---|---|---|
| Extension main `0111be6` | 1,305 passed, 47 files | Pass | No added production code against itself; diff-only formatting scope is empty |
| Pagination R2 `093b6b0` | 1,428 passed, 49 files | Pass | 95 production JS lines added; 856 test lines added; ratio 9.011 |
| Membership R3 `312280b` | 1,445 passed, 51 files | Pass | 356 production JS lines added; 1,757 test lines added; ratio 4.935 |
| Paused roles `93a678a` | Targeted role suite: 69 passed, 10 failed | Not certified | Remains WIP; failures are not waived as “tests wrong” |

Commands included `npm test` and `GITHUB_BASE_REF=main PROD_LOC_CAP=400 npm run gates`. Main and both recovered repair snapshots initially failed semantic type-checking because TypeScript resolved a `string_decoder` JavaScript dependency outside the repository under the sandbox's parent dependency tree. Moving the same committed trees and locked dependencies into an isolated `/tmp` checkout made all three existing gates pass, without editing code, config, pins or gates.

The combined verification command exceeded the tool window, but saved logs for both repair suites and their final exit markers were recovered; no partial log was treated as a pass. Subsequent isolated-gate runs returned explicit zero exit codes. Coverage percentage, real browser execution, backend live-database behavior, and mobile runtime tests were not measured here.

Remote push checks for the two recovered extension heads are green, but neither is represented by a current exact-head PR/CodeQL set establishing all landing requirements ([membership push check](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35063371094/job/104688273842), [pagination push check](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/actions/runs/35059323209/job/104676086602)). Fresh local gates are useful evidence, not a substitute for those requirements.

## The activation contract: no hidden importer

### Constraint, not excuse

Installing the TGP app does not establish that an extension is enabled in the correct desktop browser profile. Chrome documents explicit Add/Enable steps, and even its phone “Add to desktop” path completes on the computer; runtime permission requests must occur within a user gesture ([installation guidance](https://support.google.com/chrome_webstore/answer/2664769?hl=en-GB), [permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions)).

Therefore “auto-connect” should mean automatic detection, correct routing and continuation after legitimate authorization, not silent installation, permission bypass or background scraping of unrelated tabs. The following is the proposed acceptance contract, not a description of existing behavior.

### Intended customer journey

1. **Find it naturally.** A server-provisioned coach sees “Bring your coaching business into TGP” at the approved onboarding point. Settings permanently exposes Import Data, and an empty roster offers the same entry. Existing users get a contextual, dismissible setup prompt. Clients bypass coach migration.
2. **Know what happens.** Explain what can be brought over, that the source remains unchanged, why the browser is needed, and what the coach will see afterward. Use one primary action and a clear “Do this later,” not a feature dump or permission wall.
3. **Reach the right device.** On a supported desktop browser, continue directly. On mobile, say “Continue on your computer” and offer a user-initiated copy/share of a safe setup location tied to authenticated server state. Do not send messages automatically or put login tokens in URLs.
4. **Install visibly.** Provide the verified official distribution link for the actual supported browser. Keep a return-to-setup path visible. On first installation, open a concise setup surface; do not assume the coach discovers or pins a toolbar icon.
5. **Confirm the connection.** Distinguish extension detected, extension enabled, correct browser profile, correct TGP account, pairing valid, source tab detected, and source signed in. A failed handshake shows a concrete next action, not an indefinite spinner.
6. **Authorize narrowly.** Request only the approved source origin and required capabilities through an explicit gesture. Explain browser warnings accurately, including the debugger capability where applicable. Permission refusal remains recoverable. Multiple necessary origins must be discovered/authorized safely before a successful accepted Start, or settle as blocked rather than silently expanding access.
7. **Start once.** Show source, destination and a concise migration scope, then accept one Start Import tied to the durable server intent. Pairing alone never starts a source crawl. Duplicate clicks must resolve to the same run rather than create duplicates.
8. **Remove post-start chores.** Discovery, validation, capture, reconstruction and reconciliation are system work. No required manual browsing, uploads, mapping, exports, teaching, or repeated confirmations on the successful path.
9. **Explain progress truthfully.** Show “Finding your data,” “Bringing it into TGP,” and “Checking the result” only from actual lifecycle events. Use verified counts and scope, not invented percentage progress. Closing the popup must not silently lose the run; restart/auth-loss behavior must be proved.
10. **End in a useful place.** Complete only after source-visible coverage, native records and relationships reconcile. Deep-link to the imported roster/workouts/history. For partial, blocked, timed-out or failed outcomes, identify what arrived, what did not, why, and the safe recovery action.

Suggested setup copy:

> Bring your coaching business into TGP. Connect your current platform in your computer's browser, then start once. TGP will do the migration work and show you what was verified.

Suggested paired-but-not-started copy:

> Your browser is connected. Open your source platform, finish signing in, then select Start Import.

Suggested incomplete-result copy:

> Some data could not be verified. Your verified records are available below; this import is not complete.

These are proposed copy directions. Do not publish a five-minute or universal-platform promise on the live acquisition surface before its stated evidence gate passes.

### A single authoritative lifecycle

Design one server-owned intent contract with explicit lifecycle and durable timestamps, tenant/account/device binding, selected source, authorization state, capability version, counts by family, unresolved scope, and terminal reasons. Treat setup states separately from migration states; render views from the same facts rather than creating a second state machine in each UI.

The migration path should distinguish accepted Start, discovery, ingestion, native reconstruction, reconciliation and terminal settlement. Cancellation, authentication loss, deadline expiry, worker restart and network loss need explicit transitions; a “paired” boolean, HTTP 2xx, staging row or roster count cannot stand in for them.

A shared contract is the minimum mechanism. Do not introduce a new generic orchestration platform, duplicate queue, second identity store, or parallel status service unless a measured requirement proves the existing architecture cannot serve it.

## Execution order and ownership

The capability chain and activation chain proceed toward the same acceptance gate. Parallel product work is permitted only after disjoint OWNS lists, dependency order and exact dispatch facts are recorded; the following lanes are a plan, not claims that agents are already running.

### Recover and make current work reviewable

| Unit | Ownership and action | Exit evidence |
|---|---|---|
| Continuity reconciliation | Context docs only: preserve September 16 branch, attach this plan, recover reports where available, mark missing reports explicitly, reconcile PR19 and stale epic baton | One current map; no branch deletion or invented CLEAN |
| Shared release controls | Dedicated extension governance lane, separate from membership/pagination production files | Exact check names, signing/reviewer policy and permitted landing mechanism reconciled without weakening protection |
| Pagination continuation | Existing replay/normalization/runtime-outcome files and tests only; start from `093b6b0`, not stale PR21 | Fresh complete-diff dual audits; reproduce/fix all findings; exact-head CI |
| Membership continuation | Existing membership/snapshot/template files and tests only; preserve `312280b` | Fresh complete-diff dual audits, consumer-contract clarity, no runtime expansion |
| Backend integrity | Preserve `6b263c2`, current-main dunning behavior and all relevant tests; inspect cumulative schema/validation/diagnostics diff | Isolated live DB proof, migration/rollback rehearsal, exact resulting-tree CI and dual audits |
| Mobile prerequisites | Reconcile PR289-292 rather than recreate their fixes; serialize overlapping pairing/flag changes | Each exact candidate has its own evidence and dual audit status; current-main integration remains clean |

The backend repair requests a real LOC exception and documents a coordinated schema/code switch, not a normal rolling mixed-version deployment ([repair](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/6b263c2f342a561ca8a64e5efa077e6c90601a4a)). Do not self-grant that exception, remove tests, minify code, or alter the gate to manufacture compliance; first evaluate a safe coherent split, and preserve the explicit blocked state if a required owner-granted waiver or signing capability is unavailable.

### Finish inference and autonomous discovery

The binding proposed order is `C2a → C2b → C2c → C3a → A1 → A2 → A3 → A4 → C3b → V1`; C2a already has merged foundation work and must not be restarted from the stale epic instruction ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19), [epic](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/issues/10)).

- **C2b:** Finish roles, pagination evidence, candidate IDs and relationship edges using the canonical membership seam. Preserve contradictions and uncertainty; do not choose an endpoint merely because its URL resembles a known vendor.
- **C2c:** Compile only representable, origin-confined graphs accepted by the existing normalizer. Confidence must have component-level reasons and a refusal path, not a magic aggregate score that hides missing history.
- **C3a:** Implement bounded session observation and inference snapshots with start/stop/restart/detach behavior. Learning is internal autonomous work, not an instruction for the coach to browse.
- **A1-A2:** Add compact generic page evidence and a deterministic closed vocabulary of safe read-only actions. Validate effects, destination, context, budgets and before/after evidence; a button's label or HTTP verb alone does not prove a source operation is non-destructive.
- **A3-A4:** Let the model propose only schema-constrained actions against observed evidence. The executor owns policy; page text is untrusted and cannot grant authority. Bound retries, loops, no-progress steps, navigation, payload sizes and elapsed time.
- **C3b:** Connect validated discovery to the existing replay/ingest path, native reconstruction and reconciliation. Do not report terminal success before the final native result is verified.
- **V1:** Prove TrueCoach as the regression oracle and a structurally different unknown source with zero new target-specific production adapter code. Include a family/history path discovered without coach pre-navigation and a forced incomplete case.

### Build the activation path alongside the capability work

- **C1 control-plane contract first:** Freeze server-issued intent/correlation, lifecycle reads, expiry/cancel/retry semantics and compatibility with the old extension path. Reuse the established token authority.
- **Extension activation slice:** Consume C1, provide first-install setup/return flow, minimum-permission requests, real connection detection, and correct-account/source preflight. Keep this ownership separate from the active inference/replay repair lanes.
- **M5 app slice:** After C1, implement the approved coach-only onboarding location, Skip/Do later/resume, Settings/empty-state re-entry, desktop handoff, authoritative status and result deep links.
- **Native-family slices:** Inventory source families against actual native destination schemas; implement one coherent family/relationship slice at a time with provenance, idempotency, access control and result verification. An unsupported family remains explicitly unresolved.
- **Cross-surface qualification:** Meet on one pinned extension/backend/mobile/distribution build matrix and run the fresh-profile acceptance suite below. Default-off staging is containment; a hidden feature is never labeled released.

### Billing and sensitive data

The supplied mission requires billing metadata, and the recovered backend repair distinguishes permitted status/amount/currency/interval/date/payment-status/brand-last4 metadata from prohibited payment credentials ([repair](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/6b263c2f342a561ca8a64e5efa077e6c90601a4a)). Plan that native metadata work explicitly, without moving money, changing subscriptions, importing PAN/CVV/payment tokens, or representing saved-payment-method migration as ordinary data copying.

Preserve tenant isolation, data minimization, source read-only behavior, short-lived secret handling and redacted diagnostics throughout. Reusable learned knowledge comes only after verified results and contains structural evidence, never customer records or credentials; it is a later optimization rather than a prerequisite for the first honest migration.

## Release acceptance: how “done” is proved

### Fresh-customer journey tests

| Scenario | Required evidence |
|---|---|
| New coach on mobile, no extension | Finds the importer at the right time, understands desktop requirement, reaches a verified setup path, can postpone and resume |
| Existing coach with an empty roster | Import entry is discoverable without documentation or developer coaching |
| Fresh desktop browser profile | Official install, enable, return-to-setup, pairing and correct account all work; toolbar pinning is not a hidden prerequisite |
| Extension disabled/missing/wrong profile | Concrete diagnosis and next action; no false “connected” |
| Permission denied/revoked or source logged out | Honest recoverable state; no silent broader grants or background access |
| Two coaches, two profiles, concurrent pairing | No cross-account state reuse, token leakage or wrong-tenant import |
| Duplicate Start/retry | Same intent is safely resumed/deduplicated; counts distinguish observed, accepted, deduped and native records |
| Popup closed/worker suspended/network interrupted | Durable truth survives, or the run explicitly settles recoverably; no fake completion |
| Unknown-source discovery | Zero required coach actions after accepted Start; no target-specific production knowledge added |
| Native reconstruction and relationships | Source coverage reconciles to actual usable domain records, not only generic staging |
| Deadline/omission/reconciliation mismatch | Non-success with exact unresolved scope; verified records retained without relabeling partial as complete |
| Accessibility and polish | Screen-reader labels, focus order, readable contrast, sufficient touch targets, reduced motion and coherent errors verified on real surfaces |

### Goal-state scoreboard

The proposed PR19 gate starts the five-minute clock at accepted Start after minimum authorization, and succeeds only when all available authorized source data/history has been imported into native records and reconciled; any incomplete, unsafe, timed-out or unreconciled result must remain non-success ([PR19](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19)). The older 98%-recall scoreboard is not sufficient evidence for this stronger complete-migration contract.

Instrument at least:

- **Activation funnel:** Entry seen → setup opened → supported desktop reached → extension detected → paired → source authorized → Start accepted.
- **Customer effort:** Required actions after accepted Start: zero on the successful path.
- **Time:** Setup time measured separately from accepted-Start-to-native-reconciliation time.
- **Completeness:** Source-visible inventory by family, relationship and history range; unknown scope remains unknown, not zero.
- **Integrity:** Staged/native/deduplicated/skipped/failed counts with provenance; reconciliation must explain every discrepancy.
- **Safety:** Source writes, credential persistence and false-success events: zero.
- **Outcome usefulness:** Deep links open records that support the expected TGP workflows.

For unbounded account sizes or externally throttled sources, do not pretend a universal five-minute guarantee follows from one passing fixture. Preserve the ambition, measure the actual envelope, keep terminal outcomes honest, and never hide setup work by starting the clock at a convenient later event.

### Operational launch checklist

Verify the actual distribution artifact/version and store identity, extension permissions and update path, supported browser/profile matrix, API origin/DNS/TLS, live auth/pairing behavior, database migration state, deployed flag values, native writers, observability, retention and rollback. Pin all participating artifacts and exercise real authorized accounts under the project's data-access boundaries.

No GitHub releases were returned for the extension during this inventory; that alone does not prove a Web Store listing does not exist. The official distribution and deployed environment remain unverified, and no real-account migration was performed.

## How Operator 80 will enforce the standard

### Rules as checks, not promises

1. Read and pin canonical rules and current state at pickup; run an initial/final fetch and zombie sweep.
2. Preserve new user directives in GitHub immediately; checkpoint foreground work before long commands and at named milestones.
3. Record the R138 four-question decision for meaningful choices; do not ask the user to select routine identities, branches, copy, implementation details or normal sequencing.
4. Use Bradley Gleave `<bradley@bradleytgpcoaching.com>` for both author and committer; verify both identities and the pushed SHA. Never use AI/coauthor trailers.
5. Declare exact ownership, base, head, tree, dependencies and stop conditions before any builder/fixer/auditor dispatch.
6. Write behavioral failing tests first for product changes; run actual repository gates against the actual PR base. Preserve the stricter LOC/test-density/coverage/security requirements.
7. Keep author/fixer separate from both independent audit lenses. Both must inspect the same final candidate and return zero P0-P3 findings in the required fresh round; never combine an old CLEAN with a new head.
8. Reconcile real GitHub checks, signing, owner-review and branch-protection requirements; an internal audit is not automatically a GitHub approval.
9. Land product main only through the canonical git-native identity-preserving process, never server-side `gh pr merge`, force-push or admin bypass.
10. Report implemented, tested, audited, merged, deployed and customer-verified separately. A green test, a dispatch, an open PR or a default-off flag is not another of those states.

These checks implement the canonical R1/R3/R4/R5/R14/R124/R126/R138 framework without claiming the platform can run forever or that missing signing/waiver authority can be invented ([canonical rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/AGENT_RULES.md)). If an exceptional boundary blocks one lane, record it and continue the highest-value authorized reversible work.

### Musk/Bezos standards made concrete

- **Question and delete first:** Challenge “the coach must find the extension,” “pairing means running,” and “each vendor needs another scraper.” Remove those assumptions before optimizing their implementation, following the ordered question/delete/simplify/accelerate/automate framework ([algorithm discussion](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)).
- **Work backward from the coach:** Start with a usable migrated business, not the number of shipped modules; fix defects where they originate rather than passing them to the next screen or operator, consistent with Amazon's Customer Obsession, Ownership and Highest Standards principles ([Amazon principles](https://www.amazon.jobs/content/en/our-workplace/leadership-principles)).
- **Speed through small safe changes:** Reduce overlapping ownership and repeated audit churn, use isolated reproducible environments and preserve exact evidence. Apply bounded rollout, alarms and rollback rather than treating human latency or a blanket permission grant as a reliability strategy ([AWS continuous delivery](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/)).
- **Measure waste honestly:** Track elapsed build/audit/fix/landing cycles and repeated findings. Treat the handoff's complexity/value heuristic and doctrine's cycle-time thresholds as prompts for investigation, not invented numerical measurements.

The four-question decision for this plan is preserved in the accompanying recovery checkpoint and DECISION_LOG entry. The chosen answer is BUILD SMALLER on the existing architecture, with VALIDATE FIRST for universal autonomous discovery and complete native reconciliation.

## Immediate next executable unit

**Resume the recovered repair cycle, not the stale PR descriptions:** pin context `110d280` plus this new planning branch, preserve membership `312280b`, pagination `093b6b0` and backend `6b263c2`, reconcile the missing audit evidence and shared release-control blockers, then prepare current exact-head review candidates without losing current-main changes.

In parallel only where ownership is disjoint, freeze the approved C1 lifecycle/activation contract and turn the fresh-profile journey into acceptance tests. Do not restart C2a, unpause PR20 before membership is accepted, flip the importer flag to conceal missing setup, or call a staged record a native migration.

This session completed reconstruction, fresh extension verification and planning. It changed documentation only; it did not merge product code, enable flags, alter repository security, touch production databases, migrate customer data, or certify completion of the importer.

## Publication status and continuation safety

The earlier recovery checkpoint and DECISION_LOG entry were committed and pushed successfully as `d480cd3a9082a40229f1170c675d97e862baa0cc` on `docs/op80-importer-reconstruction` ([saved checkpoint](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/d480cd3a9082a40229f1170c675d97e862baa0cc/handoffs/op80/RECOVERY_CHECKPOINT.md)). Both git author and committer were verified as the identity specified by the supplied project rules.

The subsequent tool action to commit/push this complete plan and open its context PR was blocked by an authorization check before execution. It was not retried or bypassed. This full plan is therefore a delivered local document, not a published GitHub PR; the activation issue is a prepared draft, not a created issue. No new issue number or PR URL is claimed.

Continue from the saved checkpoint plus these delivered files. Do not interpret the publication block as a product defect, permission to bypass the gate, or evidence that the final report is already on the remote branch.

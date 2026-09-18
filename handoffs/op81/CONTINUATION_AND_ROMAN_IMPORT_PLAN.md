# Operator 81: Importer Continuation and Roman-Led Migration

Status: proposed execution plan, revision 2. Independent review evidence and its current verdict are recorded in [Audit and Publication Record](AUDIT_AND_PUBLICATION_RECORD.md); this header is not an approval assertion. Prepared September 17, 2026 PDT. Owner of record: Bradley Gleave. This document plans future work; it does not approve a product merge, activate a flag, run a customer import, or certify production readiness.

## Problem statement

TGP must move a coach's business, not merely extract some JSON. The product is successful when a coach encounters the offer naturally, connects the correct accounts with minimal authorization, presses Start once, and finds usable clients and coaching history inside TGP without teaching the importer which pages to visit.

Two problems must be solved together. First, Operator 80 stopped during the independent audit of backend dependency PR #524, with downstream repairs preserved at different evidence levels; second, account pairing and an extension do not yet constitute a discoverable end-to-end migration journey. The preserved archive explicitly leaves C1, M5, browser activation, native-family writing, and final reconciliation unfinished. ([PR #524][pr524], [Operator 80 checkpoint][op80checkpoint], [Roman journey contract][op80roman])

The architecture remains **observe → understand → act → observe again → verify → import → verify result**. Reuse the capture policy, session boundary, replay engine, locked ingest envelope, and TrueCoach oracle; do not build a competing migration platform or another collection of vendor scrapers. ([Real-goal execution plan][goal])

### Authority and interpretation

- **Current task:** complete and audit this plan, preserve it in GitHub, and notify the owner in-app. Implementation is the next execution phase, not silently included in this planning delivery.
- **Quality rules:** current canonical AGENT_RULES, not the uploaded file's stale heading, govern future builds; R14 requires independent exact-head audit cycles, and R138 does not waive them. Pure context-document changes are audit-exempt, but the owner explicitly requested this separate product-plan audit. ([Canonical rules][rules])
- **Goal precedence:** incorporate the owner's zero-effort, five-minute direction recorded in open importer PR #19 as the target, while accurately labeling it unmerged; do not confuse a target amendment with shipped behavior. ([Goal amendment][pr19])
- **Onboarding placement decision:** the latest owner request says “after onboarding.” Place the Roman offer immediately after authoritative coach-onboarding completion, at first coach-home entry; do not add a seventh backend step or block access to the app. This supersedes only the older Payments-to-Ready interstitial placement, not its C1-before-M5 dependency, server-side eligibility, skippability, or default-off gates. ([Previous placement ruling][ruling])
- **Billing decision:** import useful authorized billing records and history as read-only business data, consistent with the supplied expansion handoff. This supersedes older blanket billing exclusions only for record migration; payment credentials, charges, subscription transfer, and payment-provider migration remain excluded.

## Goals

These are acceptance targets, not measured results.

1. **Finish inherited work honestly:** every inherited finding has evidence, an owner, a disposition, and a required exact-head acceptance gate. No green CI label substitutes for independent approval.
2. **Make migration discoverable:** every eligible new coach in an enabled cohort encounters one skippable Roman offer after onboarding; returning coaches can find “Import my records” in one named home entry and Settings.
3. **Preserve identity:** every setup, accepted run, staged record, native result, and review screen is tied to one server-owned coach and import intent. Zero cross-account exposure or silent account switching.
4. **Deliver the zero-effort target:** after minimum authorization and one accepted Start, the successful path needs zero coach actions and finishes source accounting plus native reconciliation within 300 seconds.
5. **Earn completion:** no run says “complete” while a required family, historical period, relationship, or native destination is unknown, missing, conflicted, or unverified.

## Non-goals

- **No replacement engine:** no parallel crawler, second token store, general agent framework, giant ontology, vendor-specific production selector packs, or arbitrary model-generated JavaScript.
- **No deceptive convenience:** no silent extension install, source-password collection, assumed source login, all-sites surveillance, or claim that a mobile source tab is running a desktop extension.
- **No source-side business changes:** no sending messages, inviting clients, editing source records, charging cards, canceling subscriptions, or transferring payment credentials.
- **No phone-only execution promise:** the current browser route requires a supported desktop browser. Phone-only migration needs a separately designed and proven executor; postponement must remain graceful.
- **No product release through this document:** no production flags, schema migration, PR merge, branch-protection change, or customer data access is authorized by publishing the plan.

## User stories

- **Established coach:** I want Roman to offer migration at the right moment so I do not need to discover an extension in a settings menu.
- **Phone-first coach:** I want a clear computer handoff that remembers my TGP account so I understand what happens on each device.
- **Returning paired coach:** I want to use the existing connection without signing into TGP again, while seeing the destination account before importing.
- **Coach on an unfamiliar platform:** I want to choose my current site rather than wait for TGP to ship another vendor adapter.
- **Coach who postpones:** I want to continue using TGP and resume the same setup without repeating the onboarding questions.
- **Coach with a partial migration:** I want an exact explanation of what is available, what is missing, and the next safe recovery action, not a false success.
- **Future operator:** I want immutable evidence and an explicit dependency graph so I do not restart completed work, overwrite a repair, or audit a moving target.

## Verified starting point and evidence boundaries

### Pinned repository matrix

Main heads were rechecked during this planning session. These are source baselines, not deployment attestations.

| Repository | Main SHA |
|---|---|
| Importer | `0111be661922234d670bbf23e23d270eec1b4a4e` ([manifest][manifest]) |
| Backend | `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` ([schema][schema]) |
| Mobile | `a5933fd6de5616493de75f0db907098b149b955c` ([coach navigation][coachnav]) |
| Canonical context | `32445a75c7ee6a0018c1f3979519b3e62ed67fc8` ([rules][rules]) |
| Separate Op 80 archive branch | `3300d31539df4428c9b8f5f85215a4842c30728c`, not main ([checkpoint][op80checkpoint]) |

### Open work to preserve, not restart

| Item | Evidence and next disposition |
|---|---|
| Backend #524 dependency repair | Draft head `238f0f1f152ebbb1b4691f555e98c888473d8ee7`, tree `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`; executed remote checks passed, deployment gate skipped, no submitted GitHub reviews at this inspection. Resume the interrupted audit, not deployment. ([PR #524][pr524]) |
| Importer #21 pagination | Draft head `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`; corrected candidate and historical evidence exist, but independent final acceptance remains open. ([PR #21][pr21], [checkpoint][op80checkpoint]) |
| Importer #23 secrets | Draft head `15636ff2cc32ef68b2a3efd7dbd1e9f766bcafad`, stacked on #21, not independent of it; passed checks do not close required-control gaps. ([PR #23][pr23], [checkpoint][op80checkpoint]) |
| Importer #20 endpoint roles | Draft head `93a678a4e4c6b1703f95c313ea342deb59f33a72`; failing test check observed during the as-is inspection. Diagnose on its actual head and reconcile with accepted pagination before continuing C2b; do not rebuild C2a. ([PR #20][pr20]) |
| Backend #522 identity patch | Open candidate `e045cfc5e70124061b13e5dc4f4f4efb6132cceb`; the existing proposal is not the whole deployment-compatible identity solution. Preserve it and reconcile it against the recovered staged rollout rather than merging overlapping fixes independently. ([PR #522][pr522], [recovery sequencing][recovery]) |
| Mobile #289–292 | Declared sequential stack; Op 80 found #290–292 missing three final #289 amendments. Clean textual composition is not behavioral validation; preserve amendments, then audit the composed chain. ([Stack analysis][op80queue]) |
| C1a and C1b | Reconstructable archived candidates at trees `404dd55d2fde7ab9fab46fb4ea1d27a9d79a7556` and `660e436ecbf911b6984b40ed43d135e3dc308378`; not landed or a consumer freeze. Their provisional 1.x contracts conflict with recovery's forward 2.x lineage. ([Preservation and dependency record][op80queue]) |

### What the code currently does, and what it does not prove

- **Extension entry:** the active Start path uses a TrueCoach blueprint for clients and per-client notes; broader legacy extraction is not equivalent to the active universal path. Generic inference, active discovery, native completion, and Roman activation remain separate unfinished capabilities. ([TrueCoach blueprint][tcblueprint], [worker][worker], [goal][goal])
- **Packaging blocker:** the manifest registers `content/main.js` as a classic content script, while that file contains an ESM export; this session's classic-script parse failed with `Unexpected token 'export'`. Add an actual packaged-extension load test rather than treating module-oriented tests as browser proof. ([Manifest][manifest], [content script][content])
- **Destination gap:** staged/reconstructed labels are not native workout plans or histories; even reconstructed `Person` records do not automatically satisfy the existing User-based coach roster. Solve the native roster/claim bridge without fabricating authenticated users. ([Reconstruction families][families], [coach service][coachservice])
- **Contract gap:** mobile review calls and strict response decoding do not match the current backend entities contract, and roster-count changes are not intent-scoped migration results. Replace these signals with the generated contract and authoritative intent status. ([Mobile API][reviewapi], [mobile types][reviewtypes], [backend DTO][entitiesdto])
- **Audit interruption:** the supplied PDF records later dependency-test and logger-redaction findings, an aborted audit runner, quarantined tooling, and two fixers stopped by changing report pins. The remote archive inspected here preserves earlier briefs/checkpoints but not those final full dependency-audit reports or final diagnostics patches; their recovery remains an explicit prerequisite, not a claim of lost work or a fabricated finding list.

The prior as-is study ran importer main's unit suite successfully, but that result is neither an audit of any PR head nor an end-to-end browser/native-data proof. This planning session does not rerun product suites merely to manufacture another green badge.

## Requirements

P0/P1/P2 below are product priority labels, not audit finding severities.

| Priority | Requirement | Acceptance condition | Dependency |
|---|---|---|---|
| P0 | Recover exact inherited state | Every artifact is recovered-and-hashed, remotely reproducible, or explicitly missing/unverified | Recovery gate |
| P0 | One durable owned intent | A lost init response, app restart, double tap, or account switch cannot create an untraceable or foreign run | C1 integration plus lifecycle extension |
| P0 | Discoverable Roman journey | Eligible coach sees the post-onboarding offer; Skip works; Home and Settings resume the same intent | Frozen C1, reconciled mobile stack |
| P0 | Honest desktop setup | Missing install, disabled extension, wrong profile, expired pairing, and unsupported device have distinct recoverable states | Verified distribution and handshake |
| P0 | Single Start | Valid authorization leads to one server-accepted run with a fixed deadline; no further routine coach action | Source preflight, idempotent start |
| P0 | Bounded generic discovery | Finite read-only executor, no vendor-specific core, no arbitrary model code, no secret-bearing evidence | C2/C3/A-series |
| P0 | Native reconciliation | Every discovered family and dependency is accounted for in usable native records or a non-success outcome | Native writers and reconciliation |
| P0 | Accessible truthful UI | Keyboard/screen-reader, contrast, dynamic text, reduced motion, errors and progress tested on actual surfaces | Shared design components |
| P0 | Real unknown-platform proof | TrueCoach regression plus a genuinely different real platform, same pinned release matrix | V1 |
| P1 | Reusable non-secret learned structure | Cache hit is revalidated; stale or contradictory evidence invalidates it without weakening safety | Proven generic discovery |
| P1 | Source-mix and performance optimization | Improve measured bottlenecks without relaxing completeness, permission or deadline semantics | Instrumented pilots |
| P2 | Optional desktop conveniences | QR continuation or supported auto-popup enhancement may improve setup, but are not correctness dependencies | Proven baseline handoff |

## Finish Operator 80's interrupted cycle

### Recovery gate: preserve, reconcile, then allocate

Operator 81 owns this gate. No builder edits an inherited candidate until the manifest is complete.

1. Re-query every relevant PR head/base/check/review and compare with the table above. Pin context rules, product SHAs, candidate trees, briefs, reports, and toolchain together.
2. Recover the complete transfer bundle if present in prior artifacts or GitHub refs, including both #524 auditor reports, report corrections, aborted-run output, runner controls, environment restoration record, D1/D2 patches, and prepared validation tests. Never execute recovered scripts just to see what they do.
3. Hash and store originals immutably; distinguish remote archive contents from local-only path references. Reconstruct patches in new isolated worktrees and compare trees. A manifest that names 69 files does not prove 69 files were archived.
4. If the final audit reports or patches cannot be recovered, label the specific gap. Reproduce and independently audit #524 from its published exact head; reimplement only unrecoverable repairs from demonstrated red tests, preserving the distinction between reconstruction and recovery.
5. Do not revive the old quarantined dependency environment or transfer its process assumptions to this sandbox. Prefer a fresh locked, isolated dependency tree with sufficient disk capacity; serialize heavy tests rather than engineering another shared `node_modules` lending system.
6. Treat the suspected Git-wrapper child-process explanation as unproven. If it matters, use a bounded read-only control and record wrapper processes separately; never disable leak detection or delete the failed run to obtain green.

### Audit and repair #524

The archived #524 target is the three-file dependency delta at `238f0f1`, not downstream diagnostics, importer #23, or a moving documentation branch; Op 80 explicitly required full lockfile and relevant consumer review. ([PR #524][pr524], [checkpoint][op80checkpoint])

- **Evidence ledger:** assign stable finding IDs with severity, source report/hash, base-versus-regression attribution, affected file/line, counterexample, repair owner, verification, and exact disposition. Do not invent IDs for absent reports.
- **Scope:** dependency compatibility/assertion gaps stay in the dependency lane; logger redaction and public-error behavior get separately owned diagnostics lanes. Inherited issues remain visible and release-blocking where doctrine requires; “out of diff” is not “closed.”
- **Tests first:** reproduce each test gap against the pinned old behavior; strengthen actual consumer assertions without replacing the relevant packages with mocks. Keep original failures, full-suite provenance, skipped/todo inventory, graph/SBOM recurrence, and scanner results separately.
- **New candidate:** any repair changes the audit head and invalidates prior approval. Rerun the real hooks, exact-head CI and applicable full tests; compare synthetic-merge trees rather than claiming CI checked a different product commit.
- **Fresh independence:** one Astra-by-inheritance lens and one explicitly selected Fable lens, separate read-only clones, no sharing conclusions before each reports, neither the builder nor fixer. Each reads the complete diff and fulfills the canonical 55+18 reporting obligations; both must be CLEAN with zero unresolved P0–P3 before product landing.
- **Enforcement:** resolve the inherited branch protection, eligible-reviewer, fail-open SAST, required-status, SBOM, and scanner gaps as explicit governed work. Obtain required settings approval; do not bypass rules with an admin merge.

Astra is requested through model inheritance because the available catalog has no separate Astra selector. Record requested model, dispatch ID, input hash, and any returned runtime model evidence; do not claim inheritance independently proves a concrete runtime identifier.

### Immediate three-slice rolling queue

Once upstream evidence is reconciled, preserve Op 80's next-three-unpublished window rather than leapfrogging it. ([Queue][op80queue], [validation boundary][validation])

| Order | Slice and owner | Required output before advancing |
|---|---|---|
| Next backend slice | D1 public diagnostic sanitization, one backend builder | Recover tree `410ac3a7…` if available; retain original assertions; reproduce red and verify the reconstructed candidate. Existing bounded evidence is historical, not a fresh full-suite pass. |
| Following slice | D2 mandatory diagnostics boundary coverage, same serialized lane | Recover tree `ad166457…`; preserve all original cases; prove final composition and regression coverage. D2 is mandatory, not optional “test cleanup.” |
| Third slice | Validation/redaction and forward 2.x contract, sole generator owner | Recover prepared tests if available, run them, validate before any write/analytics, preserve useful billing metadata and credential filtering, generate the full contract deterministically. |

Importer #21/#23 review and source-only UI design may proceed independently. No M5 or extension-intent consumer coding begins against an unfrozen C1 contract.

## Product experience: Roman brings the feature to the coach

### Entry, tone, and durable discovery

On the first eligible coach-home entry after completed onboarding, show one Roman card with his existing face and the question: **“Have you coached on another platform before, sir?”** Use the requested wording when that form of address is appropriate to the person's known preference; otherwise omit the address rather than infer gender. Responses are “Yes,” “I am starting fresh,” and a quiet “Later.”

“Yes” reveals “Would you like to bring your clients and coaching history into TGP?” with one primary action, “Import my records.” “Later” dismisses the offer, persists the decision per account, and leaves a compact “Continue import setup” card plus Settings → Import my records; “starting fresh” removes the promotional reminder but preserves the permanent Settings entry.

The flow is a deterministic task card, not a dependency on an LLM generating exactly the right chat response. When Roman chat is available, a typed “Import my records” action routes to the same controller; if chat generation is unavailable, import setup still works with approved static copy. Respect the existing Roman feature gate: no Roman face or voice when that gate is off, but an enabled importer still has a plain-language functional entry.

The current Roman identity already specifies short, composed, non-gushing sentences, no emoji, and a face-plus-voice invariant; reuse its avatar, copy ownership and state conventions. ([Roman identity][romanidentity], [copy module][romancopy], [chat surface][romanchat])

### Screen-by-screen contract

| Surface | Primary presentation | Action and resulting truth |
|---|---|---|
| Source selection | “Where are your records?” Searchable familiar platform names plus “Find another platform.” No “fully supported” badges without evidence. | Choose a navigation shortcut, not a vendor adapter or completeness guarantee. |
| Phone continuation | “Continue on your computer. I will keep your place here.” Explain that the computer performs the import and the phone follows progress. | Open/copy a trusted TGP setup address, then enter the short pairing code in the extension. Optional share uses the OS sheet only after the coach chooses it. No automatic email. |
| Desktop setup | One compact checklist: Importer available → Connected to TGP → Previous platform ready. Show the real store destination only when verified. | Detect the extension's version/capabilities; if missing or disabled, show the exact install/enable remedy and preserve the intent. |
| Source browser | Open the chosen HTTPS origin, or let the coach browse and press “Use this site.” State “Sign in directly to your coaching platform.” | Bind an explicitly selected tab and allowed origin. Source credentials never pass through a Roman chat form. |
| Ready | Extension-owned card: “Ready to bring these records into TGP?” Show source site/account, destination workspace/account, read-only promise and scope. | One “Start importing” action, after all permissions and source authorization are complete. |
| Running | Stable status panel: “Finding your records,” “Bringing your records across,” “Checking everything in TGP.” Display measured per-family counts and freshness, plus an accessible secondary “Stop import” control on both the extension task and owned phone progress view. | No second routine confirmation, user mapping, exports/uploads, teaching navigation, or manual selection of client pages. Stop requests cancellation, not deletion of imported records. |
| Verified result | “Your import is complete. Your records are ready in TGP.” Show verified families, coverage dates, created/already-present counts and native links. | “Open my clients” is primary; “Review import details” is secondary. Both inspect actual records, not a staging-only success page. |
| Incomplete result | “I could not complete this import.” One reason and one safe recovery action; details identify missing families or periods. | Existing verified records remain labeled as partial. Retry cannot manufacture a new success or erase the old outcome. |

The summary is optional inspection after writes, not another approval gate. Closing the UI does not mean canceling the run.

“Stop import” stops local source activity immediately and requests the server fence without a confirmation ritual. Until acknowledged, show “Stopping” or, when offline, “Stopped on this computer. I am waiting to confirm the server has stopped”; do not claim a terminal outcome locally. The server resolves duplicate requests and completion/timeout races, and the final view states which verified records remain. A phone stop request must reach the same arbiter; an offline phone cannot claim it has stopped the desktop executor.

### Browser behavior without impossible promises

Chrome installation and approval belong to the browser; Google's documented installation flow explicitly requires the user's Add to Chrome/Add extension interaction, and organizational policy can block installation. The product must explain this before sending a phone-first coach to a source login. ([Chrome installation guidance][install])

Optional host permissions require a user gesture; use “Use this site” or “Connect this site” before Start and request only the chosen origins, never a blanket all-sites grant. Preflight must resolve required source app/API origins; if a new permission becomes necessary after Start, stop truthfully rather than silently widen access or count a prompted run as zero-touch success. ([Chrome permissions][permissions])

Use a persistent extension-owned task tab as the reliable desktop home, plus a dismissible contextual on-page launcher on the selected authorized site after login readiness is observed. The launcher opens the trusted extension surface; it does not receive tokens or privileged commands from arbitrary page messages. An on-page rendering alone is not trusted identity proof, so source and destination confirmation plus Start occur on the extension-owned origin.

An automatically opened toolbar popup is an enhancement, not a prerequisite: `action.openPopup` became generally available in Chrome 127 while the inspected manifest allows Chrome 116. Feature-detect and test any use, retain the persistent fallback, do not raise the minimum version merely for animation, and never repeatedly steal focus or cover a login form. ([Chrome release note][popup], [manifest][manifest])

After source login, observe positive authorized account/data evidence, not just URL or page-title changes. If source workspace identity cannot be established safely, keep the state “Confirm source account” before Start rather than guessing. Do not click login/MFA/CAPTCHA or bypass access controls.

The source principal/workspace is a run-lifetime invariant, not a one-time preflight check. Every admitted observation and replay batch must be attributable to the Start-bound source identity through the G3 source-evidence contract and G5 executor; origin/tab equality alone is insufficient. A same-origin workspace switch, shared-cookie change, changed principal on refresh, contradictory response or loss of reliable attribution stops capture/actions, fences further writes and invalidates uncommitted evidence from the changed or ambiguous session. Preserve a partial/blocked outcome and the original provenance; a different source account needs a new explicitly authorized attempt. Delayed responses must carry the evidence epoch under which their request was admitted and cannot be relabeled to a new source identity.

Custom targets have two distinct policy classes. Private, loopback, link-local and other non-public destinations, privileged/non-HTTPS schemes, and redirects into denied destinations are hard-denied even if a person grants browser permission; apply this to the effective destination and every redirect, with DNS/rebinding protections in any network component. Only an independently validated public HTTPS app/API origin may enter the existing pre-Start permission flow. Unverifiable or suspected lookalike source identities remain blocked for verification; a permission click is not proof of source legitimacy.

### Luxury means less work, not more decoration

Reuse TGP's bone/cream/ink/forest palette, editorial Cormorant headings, Inter body copy, semantic dark-mode tokens, and existing Roman assets; do not introduce a new visual brand or mascot. The token comments identify low-contrast stone/gold combinations, so they must not be used as small body text merely because they are existing tokens. ([TGP tokens][tokens])

Layout specification:

- **Mobile:** safe-area-aware single column, one headline, one short Roman sentence, one primary CTA; details expand in place. A sticky action must not cover large text, keyboard content, or the bottom safe area.
- **Desktop:** one responsive task panel with source/destination identity at the top, progress or setup in the center, and one primary action below. Keep expert diagnostics collapsed.
- **Progress:** indeterminate while scope is unknown; determinate only with an evidenced, stable denominator. Do not “smooth” counts into fabricated progress, show 100% before native reconciliation, or leave a spinner claiming work after the heartbeat becomes stale. ([Apple progress guidance][appleprogress])
- **Interaction:** minimum 44×44-point mobile targets, visible keyboard focus, logical traversal, WCAG AA contrast, dynamic type/200% zoom, reduced-motion parity, and polite deduplicated announcements. Never communicate state by color alone.
- **Motion:** subtle existing transitions only; no confetti, bouncing Roman, fake typing delays, or animated loading rituals that make setup slower.
- **Errors:** state the fact, remedy and retained progress. Avoid blame, unexplained technical error codes, or an automatic retry loop that repeats revoked authorization.

## Technical architecture and contracts

### One control plane, existing execution engine

```text
Coach onboarding completes
    -> Roman offer / permanent Import entry
    -> existing pairing + server-owned import intent
    -> supported desktop extension, same destination account
    -> selected source tab + permissions + login preflight
    -> one accepted Start and fixed 300-second deadline
    -> observe / infer / bounded safe discovery / replay
    -> locked ingest envelope + idempotent staging
    -> native writers + identity/relationship ledger
    -> source coverage and native reconciliation
    -> durable terminal result -> app/extension review
```

Roman owns explanation and routing, never authentication, source actions, identity inference by conversational assertion, or the success decision. Backend owns authority and settlement; the extension owns the selected source session and bounded read-only execution.

### Setup and account continuity

The archived C1 proposal already adds a server-issued ID to existing pairing init/status/redeem and an owned session lookup; it is non-idempotent on init, cannot recover a lost unknown ID, and retains setup in pairing rows. Do not pretend that proposal already solves the full lifecycle. ([C1 checkpoint and limitations][op80queue])

Preserve and integrate C1a/C1b, then extend the smallest existing contract needed for:

- **Crash-safe creation:** persist an account-scoped idempotency key before init; retry returns the same owned setup. Add authenticated current-setup retrieval for crash-before-response, with no foreign-ID enumeration.
- **Independent lifetimes:** expire and purge short-lived pairing challenges without deleting durable intent/result identity or permanently exhausting the six-digit code space. Preserve the current token authority and single-use redeem semantics.
- **Destination binding:** redeem conveys the server-owned intent and authorized destination identity; the extension stores non-secret correlation beside its existing session owner. Never accept a client-supplied coach ID as authority.
- **Account mismatch:** if this extension is paired to another TGP account, stop before capture and offer explicit disconnect/re-pair. Do not silently switch accounts because a setup URL was opened.
- **Minimal bridge:** use the existing pairing code in a trusted extension form. A shareable setup URL contains at most a non-authorizing opaque locator, never bearer/refresh tokens, pairing codes, email addresses, or source credentials; the locator alone returns no owner data and grants no session.
- **Optional later convenience:** a QR/deep-link flow must be an audited single-use challenge with expiry, replay protection, sender/origin validation and explicit device/account binding, not “put the token in a URL.”

First-connect authorization may require the short code; returning valid paired coaches do not repeat it. Account binding happens once and is checked again before Start, not through another TGP login form inside the popup.

**Disconnect is a server-confirmed security action, not local erasure.** Before G3 freeze, the auth owner must define revocation of this extension connection through the existing session authority, without logging out unrelated devices or creating another token authority. Confirmed disconnect revokes its refresh capability and server binding, fences its active run, rejects future Start/ingest/native-commit mutations from the old binding even while an old access token has not expired, and prevents in-flight refresh from resurrecting it. Stop local capture and clear local credentials immediately; if offline or remote revocation fails, say “Disconnected on this computer; server confirmation pending” and block re-pair until confirmation or an explicitly designed safe recovery.

Leaving the task UI does not revoke anything. Ordinary app sign-out clears the app's account-scoped state but does not silently claim the independent extension connection is revoked; expose a separate “Disconnect importer” action with the scoped effect described above. Previously authorized results remain owned and reviewable after reauthentication. The exact revocation/binding implementation and failure recovery are frozen with auth-owner proof before consumer development.

### Proposed run-state contract

These are proposed additive semantics, not claims about current API responses. Freeze them through the authoritative backend generator, produce consumer fixtures, and test old/new compatibility before implementing consumers.

- **Setup state:** `created`, `awaiting_extension`, `paired`, `awaiting_source_auth`, `source_ready`, `expired`. Pairing never implies a run.
- **Execution phase:** `discovering`, `transferring`, `reconciling`; set only after server-accepted Start.
- **Terminal outcome:** `complete`, `partial`, `blocked`, `failed`, `cancelled`, `timed_out`. Use one terminal arbiter, not independent popup/backend verdicts.
- **Identity fields:** server `import_intent_id`, authenticated owner, selected source origin/workspace identity, bound extension session, contract version, sequence/version.
- **Timing:** immutable `accepted_start_at`, `deadline_at`, `last_observed_at`; deadlines are server-owned, not reset by retries, UI reopen or worker restart.
- **Counts:** per family `observed_unique`, `staged_unique`, `created_native`, `already_present_verified`, `rejected`, `unresolved`, plus explicit coverage and reason codes. “Sent” is not “stored”; HTTP 200 is not proof every record was created.
- **Result:** owned native destinations and a coverage manifest; no record-level personal data in analytics or browser logs.

Every transition uses ownership and compare-and-set/idempotency guards. Duplicate Start returns the same accepted run. Once terminal, late client completions cannot overwrite it; cancellation/timeout fence new ingest and native commits through an execution epoch checked at commit. In-flight transactions either commit before the fence or are rejected/rolled back with explicit accounting; never leave a forever-success race.

Worker restart can resume only from non-secret bounded checkpoints with valid source/session evidence and the original deadline. If safe resume is unavailable, settle explicitly as interrupted/incomplete; a new user-requested attempt is linked to the old result and is not a reset disguised as the same five-minute run.

Chrome service workers can terminate and lose globals, so keep durable intent/status on the backend and persist only non-secret bounded extension checkpoint data using the existing storage policy; do not keep a worker alive indefinitely or persist raw source captures to solve lifecycle problems. ([Chrome lifecycle][lifecycle])

### API sequencing and compatibility

Reuse existing pairing, Scout ingest, progress/status and reconstruction infrastructure. Add or extend owned Start/cancel/current-setup/result operations only where the current contract lacks the needed authority; do not introduce a second event bus or polling service.

Required contract decisions before consumer freeze:

1. Idempotent setup recovery, current-setup lookup, pairing challenge retirement and retained intent lifetime.
2. Server-accepted Start/cancel/deadline, extension-specific disconnect/revocation, and capability/version negotiation.
3. Source principal/workspace attribution for the entire run, evidence epochs, and origin scope distinct from the friendly platform shortcut.
4. Intent-required review requests and a single generated response schema, fixing current mobile drift.
5. Backward compatibility for legacy extension-minted intents: readable as legacy where authorized, never silently promoted to new verified-complete semantics.
6. Reuse the existing realtime transport where suitable; otherwise bounded foreground-only status reads with backoff, an immediate refresh on focus, and explicit stale state. Document any polling exception under the current rules instead of silently introducing a second timer owner.

### Integrity repair before native scale

Do not merge #522 as a substitute for the recovered wider identity design. Op 80 identified missing platform identity, incompatible old writers, source-ID-only cursor skipping, and a 1,335-line recovery that cannot be landed unchanged under the actual workflow gate. ([Recovery analysis][recovery])

Preserve the proposed **E → T/Q0 → B/drain → R → N/Q1 → C** rollout, with independent proof and measured size for each stage:

- **E:** additive nullable platform provenance; keep old selectors and RLS working.
- **T/Q0:** compatibility writer and reader decoder; claim known provenance transactionally, refuse contradictions.
- **B/drain:** bounded resumable unambiguous backfill; fence/drain obsolete writers.
- **R:** require canonical platform and introduce wide uniqueness while retaining narrow constraints.
- **N/Q1:** promote wide-identity writers and compatible composite-cursor emission.
- **C:** contract obsolete uniqueness only when all writers/readers and proof are ready.

These must be separately promoted release artifacts, not merely migrations placed into different files within one deployment that applies them all before rolling the app. Preserve all original 21 live cases and their 62 assertion expressions, including identity/RLS/rollback coverage, and add mixed-version, concurrency, cursor and late-ingest proof; widening identity can make narrowing rollback lossy, so use forward repair rather than deleting records. ([Recovery evidence][recovery], [staged rollout handoff][rollout])

### Generic discovery without a vendor scraper backlog

Continue the GitHub chain **C2a → C2b → C2c → C3a → A1 → A2 → A3 → A4 → C3b → V1**, with native writers and reconciliation as V1 prerequisites; C2a already exists and must not be restarted. Interpret Learn/Confirm as internal autonomous stages after Start, not repeated coach work. ([Goal amendment][pr19], [execution plan][goal])

- **Evidence:** bounded redacted network JSON, DOM/table/SSR structure where needed, and safe official exports converge into provenance-bearing observations. Field meaning and relationships need evidence; shape similarity alone is not enough.
- **Inference:** deterministic role/pagination/identity-edge inference and compiler emit an untrusted blueprint that passes the existing normalizer immediately before execution.
- **AI boundary:** the planner receives minimized non-secret structural evidence and chooses only from finite observed read-only affordances. Page text is untrusted data, not an instruction source; no page can authorize data exfiltration, broaden scope, or override budgets.
- **Executor:** allowlisted navigation/expand/read/pagination actions, origin/tab confinement, bounded retries, cancellation and rate-limit handling. A GET is not automatically harmless; reject logout/delete/send/payment/export-creation affordances unless the modeled operation is proven read-only.
- **Service constraints:** do not bypass access restrictions or violate explicit automation prohibitions; flag unsupported access and seek an authorized method. Export flows that require source writes, email delivery, manual upload, or a new authorization cannot be smuggled into zero-touch success.
- **Cache:** store only non-secret structure with schema/version/provenance/freshness; revalidate against current evidence. No learned raw client values or persistent source credentials.

### Native destinations and identity

Before calling any family complete, publish a source-to-native contract for its fields, required relationships, units/time zones, conflicts and provenance. Existing generic reconstructed entities remain evidence/transition structures, not permanent substitutes for native features. ([Current reconstruction][families])

| Family | Required product result |
|---|---|
| Clients, profile and organization relationships | Coach-owned usable roster/client detail, with a non-login imported identity and an explicit later claim/invite boundary |
| Exercises, workouts and programs | Native exercise references, program/plan structure, ordering, assignments and relevant media references |
| Completed sessions and historical sets | Native client-linked session history with performed dates, set values, units and provenance |
| Notes, goals, assessments, measurements, check-ins and nutrition | Correct native client timeline/domain records, respecting typed values and historical ordering |
| Billing and business history | Read-only invoices, payment-state/history and package/relationship metadata where authorized; no executable charge/subscription side effect |
| Additional discovered family | Native destination must exist and be validated, or report an unresolved family and refuse full completion |

Imported identity must not create a login, send invitations, or merge people solely by email. Keep canonical source namespace plus workspace/account scope and source ID; when an existing native person cannot be matched unambiguously, record a conflict rather than overwrite.

Use provenance-aware idempotent native writers and a per-intent write ledger. Preserve coach edits; default conflicts to non-destructive unresolved outcomes. User-facing views must refresh from the native domain and link by owned native IDs, not a roster delta.

**Migrating history is not performing a new live business action.** Every native-family contract must suppress unintended assignment/completion notifications, messages, emails, drip/progression triggers, webhooks, invitations, payment actions and scheduled operational workflows. Reuse native invariants and persistence primitives through an audited import context or equivalent narrow mechanism; do not blindly invoke public live-action methods or create a parallel domain store. Preserve genuinely future source assignments as imported, inactive scheduling metadata until their explicit later activation through a separate native workflow; importing them does not silently activate delivery or automation. This policy applies to existing native-linked clients, retries and partial runs, not only newly imported non-login people.

### What “all available” and five minutes mean

At accepted Start, define the authorization scope and source snapshot/observation boundary. During autonomous discovery, build a coverage manifest for every observed family: source total or alternative completeness basis, pagination terminal evidence, date windows, relationship closure, exclusions and contradictions.

For each family, reconcile unique source identities against verified created/already-present native identities and unresolved/rejected identities. Unsupported, unobserved, permission-blocked, or unknown is never silently zero or “not applicable.” Attachments and media must have an explicit durable destination policy or appear as gaps; expired source-only URLs cannot masquerade as migrated assets.

Success requires both structural completeness and native relationship validation, not just equal counts. If the platform provides no reliable completeness basis, final status remains incomplete; “every page we happened to visit succeeded” is insufficient.

The 300-second clock covers autonomous discovery, transfer, native writing and reconciliation, not just extraction. Login, installation and minimum permission approval occur before Start; no hidden bulk pre-crawl may move work outside the clock. Enforce one deadline through retries and restarts, budget time for final reconciliation, and stop new work at the deadline; a late result cannot be called a five-minute success.

No evidence currently proves a universal five-minute bound for arbitrarily large or rate-limited accounts. Preserve that ambition as a measured target and a strict truthful outcome rule, not a marketing guarantee; benchmark account-size and source-limit envelopes during pilots without redefining “all available” to exclude inconvenient data.

## Execution map, ownership, and release gates

Dates would be fictional before recovery and sizing. “When” therefore means explicit dependency gates; each row may require multiple independently useful PRs to pass both the canonical production-LOC limit and the repository's actual counted-code gate.

| Gate | Work and owner | Exit evidence |
|---|---|---|
| G0 | Op 81 recovery and #524 audit closeout | Immutable manifest, reconciled findings, clean repaired head, enforceable release gates |
| G1 | Backend D1 → D2 → validation; importer #21/#23 in disjoint lanes | Exact-head tests/audits, recovered assertions, no scanner waiver |
| G2 | Backend staged identity recovery and contract integration | Disposable real PostgreSQL proof on CI-compatible version, mixed-version compatibility, complete cursor/RLS/rollback tests |
| G3 | C1a/C1b integration plus lifecycle gaps | Forward 2.x generated contract, crash-safe setup, authoritative run semantics and consumer fixtures frozen |
| G4 | Mobile stack reconciliation then M5; extension consumer and packaged-load fix | Real post-onboarding entry, intent continuity, browser load/handshake and account mismatch proof; still dark |
| G5 | Browser setup UI plus C2b/C2c/C3a and A1–A4; native-family lanes | Fully usable internal journey, safe generic discovery, native writers and deadline arbitration |
| G6 | C3b integration and V1 | One-click/zero-action real-platform proof, native reconciliation, truthful adverse paths, accessibility validation |
| G7 | Authorized canary rollout | Verified distribution, current security/privacy and data-access approval, rollback drill, monitored cohorts |

### Constraint and cost discipline

Use the existing evidence/dispatch ledger, not a new coordination service. Before each wave, Op 81 records the following distinction and revisits assumptions when their evidence changes.

| Constraint | Classification and reason | Revisit condition |
|---|---|---|
| Browser install/permission gestures and source authentication | External trust boundary, supported by current browser behavior and source access policy | Browser/source behavior changes; reverify before relying on a new capability |
| Correct account ownership, source lifetime attribution, RLS and honest completion | Product safety invariant | Do not trade away for speed; improve implementation while preserving the invariant |
| Independent exact-head audits, identity-correct publication and generated contracts | Active governed safety process | A formal evidence-based rule change, never an informal workaround |
| One writer per mutable path/schema/generator | Current concurrency control | Demonstrated disjoint ownership or a proven isolation mechanism |
| One heavy validation slot | Resource assumption for this sandbox and shared fixtures, not an eternal global rule | Measured CPU/RAM/disk/database isolation proves safe parallelism without duplicated evidence |
| Five-minute target | Owner product target, not proof about arbitrary sources or account sizes | Measure the declared source/size envelope; never redefine an incomplete run as success |
| QR, toolbar auto-popup and extra handoff infrastructure | Optional conveniences, not correctness requirements | Add only if measured setup friction justifies cost; delete before optimizing |

For each slice, record dispatch → first audit → final audit → landing times, audit/fixer round counts, handoffs, resource-wait time, repeated test runs and known tool/resource cost. Establish the theoretical minimum as the shortest safe process retaining all mandatory proof and independence, not zero audits; compare actual and minimum in the same measured units. Unknown monetary/tool costs remain explicitly unmeasured, with collection assigned before the first implementation-wave retrospective; do not invent a ratio. Use elapsed active/wait time, rounds and test-run counts as available engineering measures without presenting them as monetary cost.

R130's ratio of at least 3× triggers a redesign review in the order question/delete/simplify/accelerate/automate. R137 also requires a root-cause note for more than three audit rounds, a doctrine-gap note for more than one lens disagreement, and a review of wave-median outliers; keep those distinct from ordinary finding repair. Op 81 owns the ledger and retrospective, with links to the exact review artifacts and explicit unavailable fields. ([Measurement doctrine][rules])

Concurrency is conditional, not theatrical:

- **One writer per mutable area:** schema/contracts/generators, mobile navigation/state, extension worker/session, each with named paths and a pinned base.
- **One heavy validation slot:** no simultaneous full suites, shared writable dependencies, generated output or database fixtures; no duplicate runs for multiple reports.
- **Independent useful work:** read-only UI specifications, source contracts and threat modeling can proceed while upstream audits run; consumers cannot code against an invented API.
- **Parent-owned remote actions:** builders/auditors return immutable artifacts; Op 81 owns commits, PR descriptions, integration, publication and evidence mapping.
- **Changed prerequisites:** reblock dependent acceptance, preserve old candidates, re-pin explicitly, then revalidate. Never silently patch the auditor's input.

### Required product PR packet

Every future product PR includes purpose/non-goals, exact base/head/tree and cross-repo matrix, before/after evidence, assertion inventory, canonical and actual workflow size/density measurements, full R100 and R109–R126 self-checks, four-question R138 decision, rollback and privacy scope, native hooks/CI, two independent full-diff audits, and finding closure.

No P0–P3 is waived by “small change,” “only tests,” “inherited,” or “already green.” Use the R3 identity-safe manual squash/fast-forward procedure only after all product gates; never server-side merge, force-push, or rewrite history. ([Canonical rules][rules])

## Acceptance and verification

### Functional scenarios

1. Given a server-eligible coach with completed onboarding and enabled rollout, first Home entry shows the Roman offer once; clients never see a role-escalating import path.
2. Given “Later” or “starting fresh,” normal TGP remains usable; a permanent entry exists, and another account cannot inherit the choice or intent.
3. Given a phone without a supported executor, setup explains the computer requirement before source login and preserves the place; it never reports connected.
4. Given missing/disabled/old/wrong-profile extension, the task gives the specific remedy and verifies capability before proceeding.
5. Given pairing init response loss, retries recover the same setup; reused/expired codes fail safely and a retained intent does not reserve a code forever.
6. Given destination mismatch, no capture/import starts; during an active run, same-origin workspace switch, another tab's shared-cookie account change, different-principal refresh and delayed old/new responses cannot stage or write another source business under the original run. Ambiguity fences the run without requiring the coach to supervise a successful import.
7. Given private/loopback/link-local destinations, non-HTTPS or privileged schemes, or redirects into denied targets, no permission gesture overrides the deny. Only independently validated public HTTPS app/API origins may receive pre-Start permission; unverifiable/lookalike identities remain blocked, not trusted by consent alone.
8. Given one accepted Start, duplicate taps/retries produce one run and the original deadline; no mapping, export, upload or teaching navigation is requested on the successful path.
9. Given popup close, worker termination, app background, network loss or lost acknowledgement, status remains truthful and idempotent; no duplicate native data or fabricated success.
10. Given login expiry, CAPTCHA, permission revocation, unknown source family, inaccessible history or a new required origin, the run refuses complete and records the exact blocker.
11. Given duplicate IDs across family/platform/workspace or a source-ID cursor boundary, no collision, dropped page or cross-tenant association occurs.
12. Given ingestion succeeds but native records or relationships are absent, the app cannot show complete or count the rows as usable clients.
13. Given cancellation/deadline races with ingest and native transactions, fencing and final reconciliation produce one stable terminal result with accurate retained counts.
14. Given retry after a terminal incomplete run, provenance prevents duplicate or destructive writes; the original result remains accessible.
15. Given success, family counts, date coverage, native detail screens and history agree; links work in the owning account and fail closed elsewhere.
16. Given malicious source text or imported markup, no instruction injection, code execution, HTML injection, credential leakage, or model-directed external request occurs.
17. Given a native-linked client, historical assignments/completions/check-ins/billing and future assignments preserve correct native state while producing zero unintended notifications, messages, drip activations, webhooks, invitations or financial actions, including retries and partial runs.
18. Given confirmed extension disconnect, old refresh/Start/ingest requests fail, in-flight refresh cannot resurrect the binding, and active-run commits are fenced; offline local cleanup never claims confirmed server revocation or signs out unrelated devices.
19. Given an unfamiliar coach on extension or phone progress, Stop is discoverable without instructions and accessible by keyboard/screen reader; offline, duplicate, completion and timeout races converge on one truthful server outcome without deleting verified records.

### Evidence ladder

- **Unit/property tests:** normalizers, pagination, source identity, action policy, deadlines, state transitions, cursor stability, copy and token-free storage.
- **Generated contract tests:** actual producer and both consumers, old/new versions, missing/extra fields, required intent and terminal semantics.
- **Integration tests:** real database constraints, transactions, RLS/role predicates, staged deployment binaries, idempotent writer and rollback refusal.
- **Packaged-browser tests:** load the actual extension build in the minimum supported Chrome and current stable; confirm content-script execution, permission gestures, trusted-message boundaries, lifecycle, focus behavior and cancellation.
- **App/desktop journey tests:** real coach wizard completion, app restart/account switch, desktop continuation, source login, extension UI and native result deep links; no fixture screenshot substituted for a live path.
- **V1 real evidence:** TrueCoach oracle regression plus a structurally different authorized real coaching platform, with at least one non-empty, fully reconciled `complete` run on each source, zero required post-Start actions and elapsed time at most 300 seconds. Pin all product SHAs, source observation dates, browser, counts, relationships, clock, zero-action trace, negative controls and redacted evidence; all-partial or all-timeout runs cannot pass V1.
- **Human usability/accessibility:** unfamiliar coaches complete unprompted tasks on phone plus computer, screen readers and large text. Record confusion and abandonment rather than claiming “luxury” from a design review alone.

A plan review cannot certify this ladder. No live-account test occurs without authorization and approved data handling.

## Success metrics and rollout

Instrument a privacy-safe funnel: offer viewed → import selected → desktop ready → paired → source ready → Start accepted → native complete/incomplete → native review opened. Use opaque correlation, low-cardinality reason codes and aggregate durations, never source credentials, raw URLs with queries, client names, messages, health values or payment data.

Proposed release criteria:

| Metric | Target and measurement |
|---|---|
| Discoverability | 100% of eligible enabled new-coach test sessions reach the skippable offer after onboarding; one Home/Settings resume route works in every lifecycle test |
| Usability | At least 9 of 10 unfamiliar-coach pilot participants complete authorized setup and find native results without moderator instruction; measure setup time separately |
| Full completion before expansion | Predeclare a source/account-size envelope before pilot enrollment; at least 90% of at least 10 first accepted runs by distinct coaches within that envelope must be fully reconciled `complete` within 300 seconds. Partial, blocked, failed, timed-out and cancelled accepted runs remain in the denominator; retries are reported separately and cannot replace failed first runs. No post-hoc removal of an inconvenient source/account and no broad launch from a single successful platform. |
| Zero-touch execution | Zero required coach actions after accepted Start in every successful V1/pilot acceptance trace |
| Speed | Every run labeled five-minute complete has native reconciliation at or before 300 seconds; publish the observed size/source envelope, not an unsupported universal rate |
| Integrity and trust | Zero false-complete outcomes, cross-tenant exposures, unauthorized source writes, credential leaks or duplicate native identities in required tests and pilot |
| Accessibility | No unresolved blocking keyboard/screen-reader/contrast/large-text issue on any setup, running, result or recovery surface |
| Activation | Establish baseline during the first approved cohort; compare migration completion and first useful native-record interaction before expanding, without fabricating retention/revenue impact |

Ship default-off behind existing backend pairing/ingest/reconstruction and mobile importer controls, plus one clearly owned journey rollout capability if needed. Do not couple safety to Roman chat availability or remove result access when new starts are disabled.

Rollout: internal synthetic accounts → authorized TrueCoach and unknown-platform proof → small opt-in coach cohort → expand only after complete integrity/usability evidence. The first sign of cross-tenant exposure, credential leakage, unauthorized source action, false completion or duplicate identity stops new starts immediately; preserve evidence and safe access to existing results.

The completion threshold is a proposed go/no-go minimum, not statistical proof of a universal success rate. Publish per-source and account-size outcomes, setup abandonment and the complete denominator alongside aggregate results; poor outcomes on a source block expansion to that source even if another source lifts the aggregate. Changing an envelope or threshold requires a recorded prospective decision and a fresh cohort, not rewriting prior results.

Use capability/version negotiation to prevent incompatible app/extension/backend combinations. Disabling new starts must also define active-run behavior: safety-critical incidents fence execution; ordinary rollout rollback may allow compatible active runs to settle under their original deadline. Do not delete imported records as rollback; use provenance and an audited forward repair.

This follows staged exposure, failure detection and contained rollback rather than releasing to everyone at once. ([AWS continuous-delivery practice][aws])

## R138 decision record and three-lens plan audit

### Four-question decision gate

- **Musk five principles:** question whether every prompt, handoff service and scaffold is necessary; delete repeated confirmations, hidden settings-only activation, competing state owners and vendor adapters; simplify to one intent and one engine; accelerate with disjoint preparation and small slices; automate only the proven read-only actions and acceptance gates.
- **Hyperscaler practice:** immutable inputs, exact artifact promotion, compatible expand/contract rollout, canary exposure and automatic stop conditions contain risk while permitting progress. ([AWS practice][aws])
- **Good without bad:** deliver a visible concierge experience without fake pairing, excessive permissions, leaked credentials, source mutations or false-complete claims.
- **Root cause:** address broken continuity between onboarding, device, identity, engine and native data, and the interrupted evidence chain. A prettier popup alone fixes neither.

Decision: preserve the inherited recovery sequence and build one Roman-led migration journey around the existing importer. Documentation rollback is a new revert commit; product rollback is separately specified per slice and cannot include lossy database narrowing.

### Independent plan-audit brief

Ask a fresh Astra-by-inheritance reviewer to read this full plan and the pinned source/Op 80 evidence without editing the draft. This is a plan audit, not #524's resumed product audit and not a replacement for the later Astra/Fable dual R14 cycle.

The reviewer must challenge:

1. **Musk lens:** is the sequence question → delete → simplify → accelerate → automate actually applied; what work, state, prompt or service should be removed; are hidden dependencies or race conditions unresolved?
2. **Bezos lens:** work backward from the coach's complete business becoming useful in TGP; test phone-only, unfamiliar-source, interrupted, wrong-account and partial-result cases; identify where the customer must do the software's work. ([Customer obsession][amazon])
3. **Apple lens:** does each screen have a clear primary action, accurate status and a reversible exit; is the experience accessible, calm and legible across app and browser, including error states? ([Progress guidance][appleprogress])
4. **Evidence and doctrine:** identify every unearned claim, missing inherited artifact, unsafe privilege, unbounded promise, prerequisite inversion and incomplete acceptance criterion.

Each finding needs severity, exact section, counterexample, minimal correction and verification criterion. Preserve the original report, record the disposition of every finding, revise the plan, then request a fresh full-plan pass on the revised hash until no unresolved plan-level P0–P3 remains. Never describe this as personal endorsement by Musk, Bezos or Apple, or as production certification.

## Open decisions and successor handoff

These do not prevent publishing the plan, but their named gates prevent unsafe execution.

| Decision/evidence gap | Owner | Blocking point and default |
|---|---|---|
| Final Op 80 audit reports, diagnostics patches and validation tests | Op 81 recovery | G0: recover or explicitly re-establish; no fictional closure |
| Eligible reviewer and missing security enforcement | Repository/security owner with Op 81 | Product merge/release: no bypass; settings changes separately authorized |
| Exact native model for each discovered family, attachments and imported roster claim | Backend/domain owner | G5/G6: no full completion without a usable destination and tested relationships |
| Role terminology mismatch | Auth owner | G3/G4: retain server-authorized coach/owner behavior; no inferred sub-coach/gym-owner privilege |
| Source lifetime identity and extension revocation mechanism | Auth/backend/extension owners | G3: freeze attribution, evidence epochs, existing-authority revocation, commit fencing and truthful offline behavior before consumers |
| Verified store listing, stable extension identity and supported browser matrix | Extension/release owner | G4/G7: no invented listing, automatic-install claim or unsupported-device promise |
| Authorized unknown platform and representative account sizes | Product owner | V1: fixtures do not close real-platform proof |
| Model/data-processing scope, retention/deletion and vendor authorization | Security/privacy owner | Before live data: minimize evidence, approved processors, explicit retention and deletion tests |
| Status transport and existing realtime fit | Backend/mobile owners | G3: one authority and timer owner; any rules exception recorded before build |

Every implementation handoff must end with: exact matrix; what changed; what ran and did not; open findings; resource/ownership release; next three slices with dependencies; real GitHub artifact locations; and the statement “product release authorized” or “not authorized,” supported by evidence.

Do not retire the Op 80 archive or overwrite its historical reports. This plan is the newer continuation entry point; its publication must be linked from the context README and DECISION_LOG so the next operator cannot mistake an old branch's checkpoint for current acceptance.

[rules]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/AGENT_RULES.md
[goal]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/docs/REAL_GOAL_EXECUTION_PLAN.md
[pr19]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/19
[pr20]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/20
[pr21]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/21
[pr23]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/23
[pr522]: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/522
[pr524]: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/524
[op80checkpoint]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/EXECUTION_CHECKPOINT.md
[op80queue]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/NEXT_THREE_PR_CONCURRENCY.md
[op80roman]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/ROMAN_IMPORT_JOURNEY.md
[recovery]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/RECOVERY_SEQUENCING.md
[rollout]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/build-reports/recovery-rollout/CYCLE3_ROLLOUT_IMPLEMENTATION_HANDOFF.md
[validation]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/3300d31539df4428c9b8f5f85215a4842c30728c/handoffs/op80-execution/NEXT_VALIDATION_SLICE.md
[ruling]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md
[manifest]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/manifest.json
[content]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/content/main.js
[worker]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/background.js
[tcblueprint]: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/blob/0111be661922234d670bbf23e23d270eec1b4a4e/extractors/truecoach/blueprint.js
[schema]: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/prisma/schema.prisma
[families]: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/scout/reconstruct/families.ts
[coachservice]: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/coach/coach.service.ts
[entitiesdto]: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7/src/scout/scout-entities.dto.ts
[reviewapi]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/api/importReviewApi.ts
[reviewtypes]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/types/importReview.ts
[coachnav]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachNavigator.tsx
[tokens]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts
[romanidentity]: https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/32445a75c7ee6a0018c1f3979519b3e62ed67fc8/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md
[romancopy]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/lib/roman/copy.ts
[romanchat]: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/roman/RomanChatScreen.tsx
[install]: https://support.google.com/chrome_webstore/answer/2664769?hl=en
[permissions]: https://developer.chrome.com/docs/extensions/reference/api/permissions
[popup]: https://developer.chrome.com/blog/extension-news-july-2024
[lifecycle]: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
[appleprogress]: https://developer.apple.com/design/human-interface-guidelines/progress-indicators
[amazon]: https://www.amazon.jobs/content/en/our-workplace/leadership-principles
[aws]: https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/

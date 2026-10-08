# V11_IMPORTER_PLAN_132 — Importer v1.1: exactly as planned (SoT A7.3), tested, honest, simple (V11-IMPORTER-PLAN-132, agent 132,
# 2026-10-08 13:42-14:40 PDT; revised for the owner's 13:45 addendum A-E)

Basis (fetched 13:44 PDT, "from the code" unless marked): backend main cd0f90ed823d43dc8a9f0937554dc59fce7b6b94 (production deploy 40),
mobile main edf36a8856f345086abdfe867aa2b1d6f32cb45a, extension (BradleyGleavePortfolio/tgp-importer-extension) main efb3fd18, backend
side branch integration/importer 249fd0d4. Plan of record: SoT A7.3 (TGP_SOURCE_OF_TRUTH.md:1618-1673) plus the owner decisions of
2026-09-29 (SoT :5833-5899, D1-D14). handoffs/importer-wave/current-state.json is dated 2026-07-28 and is stale; the code wins.
Re-checked 14:10 PDT: backend main 63441690 (adds only b#887, the handlebars bump) and mobile main a3a1c18e (adds m#572 clinic-apk
and m#574 team profile); no importer file changed, the importer flags are still unset in every eas.json profile, and the Import
Data route (CoachNavigator.tsx:558, SettingsScreen.tsx:468) is unchanged.
Read-only planning: no branches, PRs, comments or GitHub writes; no Supabase reads.

## One screen (plain words)

What exists. The careful, rule-following half of the importer is built on backend main and switched off: it receives what the
browser extension captures, rebuilds clients and workout programs as real TGP records, checks the result, and only says "complete"
when the check proves it (src/scout/, 64 files; 79 files under test/scout/). The extension can replay a site page by page from a data
description and never keeps passwords. The phone has an Import Data screen (Settings > Import Data, switch off) with a site picker,
a pairing code for the extension, and a status card. Guards in CI keep competitor names out of core code in all three repos.

What is missing. The parts that make it "any site, Start once": the AI step that reads a new site's structure (built only in huge,
unmerged PRs on a side branch that is 1,372 commits behind main), the memory that lets the next coach start instantly, automatic
re-learning when a site changes, the one-tap origin grant in the extension, most kinds of data (messages, check-ins, body metrics,
photos, notes, payment dates), a per-kind "what came and what did not" result, and the Roman journey as the live screen. Nothing
has run on a real coach account. Today a new site still needs a JSON file committed and deployed, which A7.3 forbids.

The plan. PART A: 46 PRs in 14 builder jobs and 8 waves, each PR under 800 lines, rebuilt lean on main from the reviewed designs in
the stale PRs, which are then closed. Order: foundations (registry, people, origin grant, learn contract) -> AI step with hard spend
caps -> learn run and memory -> proof of truth and every data kind -> the Roman journey on the phone and the one-Start popup ->
proofs, cross-coach reuse, the owner's own pilot, then deleting the old TrueCoach oracle. Every new switch is off until both lenses
and the owner say yes. PART B: 9 optional ideas (phone-only import, bring-any-file, parallel-run sync, client continuity, receipt,
team import, Roman first-week brief, switch-day kit, moving live subscriptions), none required by A.

Decisions for the owner (section A7): retire the side branch (yes); the pilot platform; the $5 Chrome Web Store fee (needed for
self-serve installs); AI spend caps; health-data consent for imported data; media caps; confirm D10/D14/D1; reuse quorum.

---------------------------------------------------------------------------------------------------------------------------------

# PART A — the owner's idea exactly as stated: the importer per A7.3, built to outstanding quality

Owner (13:36): "Importer - finally completed - coach import flow tested and bulletproofed - works honestly and simplicity for PLG
style usage is key"; (13:21) "the importer must be exactly as its planned". A7.3 is the plan. Nothing from PART B is in PART A.

## A0. Why this is superior, not a prettier copy (rivals with sources; TGP proposition)

TGP proposition (SoT A7.5, :1674-1700): the platform for online fitness in the post-AI era; AI-native, not AI-added; "a perfect
everfit competitor for small PT operations" today; the creator -> team -> gym ladder without migrating. The importer is the on-ramp:
a coach leaves Everfit/Trainerize/TrueCoach for TGP with their whole business in one Start.

| Product | What it does well | Where it falls short | How A7.3 makes TGP superior |
|---|---|---|---|
| ABC Trainerize | CSV client import with column mapping; rows that fail are listed to redo by hand ([help](https://help.trainerize.com/hc/en-us/articles/360040719692-How-to-bulk-import-client-lists-into-Trainerize)) | Its own help says there is no way to transfer data between accounts ([help](https://help.trainerize.com/hc/en-us/articles/26458988419220-Can-I-Transfer-Programs-or-Other-Data-from-One-Account-to-Another)); export is names and contacts only, no history, programs or progress ([help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize)) | TGP moves history, programs and every reachable record through the coach's own session, not a contact CSV |
| Everfit | Review step before adding CSV clients ([help](https://help.everfit.io/en/articles/3620629-adding-multiple-clients)); a staffed "complimentary migration, handled for you" ([Everfit](https://everfit.io/trainerize-migration/)) | The migration is human labour: "We export and import your data for you" | Self-serve in one Start, no staff, no waiting days, the same quality for coach 5 and coach 5,000 |
| TrueCoach | Client CSV with 15 profile fields, sent by email ([help](https://help.truecoach.co/en/articles/5811721-how-to-export-clients)) | The documented client export carries no programs or workout history | TGP reads the live structure, so nothing depends on what the old vendor chose to export |
| CoachRx | Upload -> review -> submit bulk CSV flow ([help](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)) | "It does not migrate prior training history"; "CoachRx starts a fresh history for each imported client" | Clients arrive with their past; nothing restarts |
| Concierge rivals (Gymkee, FitFocus, BrixFit) | Staff rebuild clients and programs from a CSV or even a screenshot, in 48 hours to 14 days ([Gymkee](https://gymkee.com/switch/everfit/), [FitFocus](https://www.fitfocus.io/vs/everfit), [BrixFit](https://brixfit.app/everfit-alternative)) | Manual, slow, unverifiable, does not scale | Minutes, machine-verified, with an honest per-kind result |
| Shopify Store Migration (best outside fitness) | CSV or "connect your account", then review ([Shopify](https://www.shopify.com/blog/store-migration-shopify-app)); a clear import order: products, customers, then orders ([help](https://help.shopify.com/en/manual/migrating-to-shopify)) | Fixed list of sources; orders, reviews and menus "require separate tools or manual setup" | Any site, including never-seen ones, with CORE DIFF = 0; TGP verifies, not the coach |
| StoreShift (Shopify app) | Test mode vs production, retry only failed items, errors by entity ([listing](https://apps.shopify.com/store-shift?locale=th)) | Per-platform connectors | Same honesty per family, without per-platform code |
| Notion importers | Authorize -> pick -> import; keeps structure, comments and user mapping ([help](https://www.notion.com/en-US/help/import-data-into-notion), [Confluence](https://www.notion.com/help/import-from-confluence)) | "Only import content on desktop or web, not on mobile"; fixed importer list; 5 GB limits | Phone-led journey with live progress; learned sources, not a list |
| Atlassian (Notion -> Confluence) | Maps users, comments, mentions | Asks the user to copy a Notion `token_v2` cookie into a form ([Atlassian](https://support.atlassian.com/confluence-cloud/docs/import-data-from-notion-into-confluence/)) | Credentials are capabilities: never stored, learned or sent to a model (A7.3 invariant) |
| Apple Move to iOS | Code pairing, private link, category picker ([Apple](https://support.apple.com/en-us/118670)) | "Make sure that all of your content transferred"; some content moves by hand | Same calm pairing, but TGP proves what moved and lists what did not, with reasons |

The superiority is structural: (1) any site, learned as data, CORE DIFF = 0; (2) the whole business, not contacts; (3) truth owned
by deterministic code, `complete` only when proven; (4) learned once, instant for the next coach; (5) zero coach work after Start;
(6) AI used where it is strongest (reading structure) and fenced where it is dangerous (no tools, no network, no writes, caps).

## A1. Inventory against A7.3 (status, paths, switches)

Production switches (backend .github/fly-env-desired-state.json): FEATURE_SCOUT_INGEST "unset" and FEATURE_EXTENSION_PAIRING
"unset" ("Importer (Bucket B) is paused for launch"); FEATURE_SCOUT_RECONSTRUCT and FEATURE_SCOUT_PILOT_COACH_IDS are read by the code
and not declared (off). AI_GATEWAY_CAPABILITIES holds only the two workout capabilities (no importer capability). Mobile eas.json
production/clinic/clinic-apk set neither EXPO_PUBLIC_FF_EXTENSION_IMPORT nor EXPO_PUBLIC_FF_IMPORT_REVIEW (both default false in
src/config/featureFlags.ts:481,495). The extension is not on the Chrome Web Store (D13 "later"), so installs are sideloaded.

| # | A7.3 piece | Status | Where (backend unless marked) |
|---|---|---|---|
| 1 | Capture + ingest | built, off | src/scout/scout-ingest.{controller,service,dto}.ts; extension shared/capture*.js, shared/ingest-ack.js; test/scout/scout-ingest.idempotency.spec.ts |
| 2 | Pairing (phone <-> extension) | built, off | src/extension-pair/ (16 files, 11 specs); mobile src/components/coach/ExtensionPairingPanel.tsx, src/hooks/useExtensionPairing.ts, src/storage/importPairingMirror.ts; extension shared/pairing.js |
| 3 | Decode with AI | not on main | no AI in src/scout (`git grep anthropic|prompt src/scout` = none). Designs: b#591 L1-core (+11,446), b#592 L1-gw (+6,202), both on integration/importer, checkpointed 09-29 |
| 4 | Learn as data, strict validators | partly built | data-only mapping specs src/scout/reconstruct/mapping-spec.ts, native rules native/native-rules.ts, signed induction manifests induction/{contract,parse,verify,manifest-registry}.ts. All loaded from committed JSON dirs (source-mapper-registry.ts:42, native-rule-registry.ts:21, manifest-registry INDUCTION_MANIFESTS_DIR). Learned-blueprint compiler only in ext#38 (+6,738, open) |
| 5 | Registry that can read learned data | side branch only | L2a SourceRegistryProvider (#588) merged into integration/importer 249fd0d4, not main |
| 6 | Import into native records | partly built | clients: native/person-writer.ts (S8-D1); programs/plans/exercises: native/native-writers.ts; Person model prisma/schema.prisma:8252, ImportNativeProvenance :8306. Not built: history, messages, check-ins, body metrics, habits, food logs, notes, forms, photos/files, sessions, payment schedule. S8-D2 b#577 and S8-D3 b#587 open |
| 7 | Verify, honest terminal | built | one arbiter src/scout/lifecycle/arbiter.ts (complete only from a reconciliation verdict; default partial/reconciliation_not_performed); reconciliation/reconcile.ts, facts.service.ts; reason codes lifecycle/reason-codes.ts. Only proving basis: `source_signed_enumeration` (induction/contract.ts:16,21), so a learned run can never prove complete yet; per-family evidence b#589 (+5,936) and closure record b#594 open |
| 8 | Remember (structure only) + instant next coach | not built | L2b per-coach store and L2g cross-coach reuse "not started" (SoT :5892-5897) |
| 9 | Drift detect + re-learn | not built | none |
| 10 | Start once, origin confinement | partly built | extension replay engine shared/replay/{engine,blueprint,resolve,state}.js, credential policy shared/credential-policy.js; origin grant X1 only in ext#35 (+7,786/-1,409, open) |
| 11 | Roman journey (mobile) | partly built | ImportDataScreen uses import-journey/ImportSetupView; ImportOfferCard, ImportProgressView, ImportResultView, ImportStatusFrame are leaf views, README: "Not registered, production-reachable"; status card components/coach/ImportRunStatusJourney.tsx, ImportRunVerdictCard.tsx (R1 m#300 merged); m#302 open, conflicting |
| 12 | Popup = one Start + status | partly built | extension popup/{popup.html,popup.js,outcome.js,pair.html,pair.js}, shared/import-status.js; D9 not yet enforced |
| 13 | Vendor-name guard in every importer repo | built | backend ci.yml:56,59 + .vendor-name-guard.json; mobile ci.yml:31; extension .vendor-name-guard.json; source-picker shortcuts are data (mobile src/constants/importPlatforms.ts:24-28) |
| 14 | CORE DIFF = 0 gate | built (file form) | scripts/s10-core-diff-gate.sh: a new source = an allowed set of per-source JSON files; test/scout/s10/s10-unseen.e2e.spec.ts |
| 15 | Legacy oracle quarantined | built | src/scout/reconstruct/sources/truecoach.json (allow-listed "retire: V1 learned-path parity"); extension extractors/truecoach* |
| 16 | North star text in repos | drift | backend and mobile docs/importer/NORTH_STAR.md lack "The AI step" that A7.3 (:1644-1655) and the extension copy have |
| 17 | D8 assignment tenancy | done | migration 20270319000000_cwa_coach_manage_client_tenancy (D8, B-D8-124), so b#593 is obsolete |

Stale importer PRs (all base integration/importer except the extension; sizes are the reason they cannot land under today's
800-line rule): b#574 (+184), b#577 (+1,531), b#580 (+581), b#581 docs (+350), b#582 (+1,057), b#583 (+626), b#587 (+4,357/-620),
b#589 (+5,936), b#590 docs (+350), b#591 (+11,446), b#592 (+6,202), b#593 (+3,252, obsolete), b#594 docs (+308); b#525-529 on retired
branches; ext#35 (+7,786/-1,409), ext#38 (+6,738), ext#20 (superseded by #32); m#302 (+167, conflicting).

## A2. Every A7.3 invariant mapped to code and tests (and the PR that closes the gap)

| A7.3 rule | Code today | Tests today | Gap -> PR |
|---|---|---|---|
| NEW SOURCE -> CORE DIFF = 0 | file-form gate scripts/s10-core-diff-gate.sh | s10-unseen.e2e/pg specs | learned packages live in the DB, gate's allowed set becomes empty -> REGISTRY-1/2, LEARNRUN-2/3, PROOF-1 |
| No vendor names in core | guards in 3 repos | scripts/vendor-name-guard.self-test.mjs; extension test/policy-*.spec.js | ratchet shrinks to zero legacy -> RETIRE-1/2 |
| AI returns data only, read-only source | none | none | schema-constrained output, no tools/network, only observed fields -> LEARN-1..4, AIGATE-1 |
| Deterministic software owns truth; AI never decides complete | lifecycle/arbiter.ts, reconcile.ts, native writers | test/scout/lifecycle/arbiter.spec.ts, s11 journey pg specs | learned runs need proven per-family evidence + closure -> TRUTH-1..3 |
| Credentials are capabilities | extension shared/credential-policy.js, shared/session.js | credential-policy-regression, storage-policy, session-* specs | origin grant tied to the Start gesture; digest redaction; backend refuses credential-shaped fields -> ORIGIN-1..3, EXTLEARN-1, LEARN-2 |
| Prompt built live from the validator contract; version + hash recorded | none | none | LEARN-3, LEARNRUN-1 |
| Injection defence + adversarial corpus in CI | none | none | LEARN-4 |
| Caps per run/coach/day, global spend cap, kill switch, timeouts; remembered = 0 AI calls | none for importer (Roman has its own pool, src/roman/background/roman-background-spend.ts) | none | AIGATE-2, LEARNRUN-3 |
| Best model from config; eval gate; no silent downgrade; model recorded | gateway providers src/ai/gateway/providers/* | none for importer | AIGATE-3 |
| Remember structure only; next coach instant; drift re-learn | none | none | LEARNRUN-2/3, REUSE-1/2 |
| Roman journey is the coach UX; popup status only | partial (A1 #11-12) | import-journey/__tests__ (8 files) | JOURNEY-1..3, POPUP-1 |
| Legacy oracle deleted at V1 parity | quarantined | truecoach mapper specs | owner pilot, then RETIRE-1/2 |

## A3. Pathway placement (rule 6: nothing is cut; routes and actions before -> after)

Coach tabs (docs/reachability.md:211-217): CommandCenter (home), Clients, Templates, Messages, Team (head coach), Community (flag),
Settings. Client pathways are unchanged in PART A.

| Piece | Where it lives | Taps from home | Replaces | Routes/actions before -> after |
|---|---|---|---|---|
| Import offer (Roman ImportOfferCard) | Coach tabs > CommandCenter (src/screens/coach/command-center/CommandCenterScreen.tsx) > one card, only for a head or solo coach with 0 clients, no saved decision, both switches on | 0 to see, 1 to start | nothing (addition) | before: none -> after: primary "Bring my clients" -> ImportData; "Later" -> recordDecision (src/hooks/useImportOfferDecision.ts) and the card hides; during a run the card shows "resume" -> ImportData |
| Import journey | Settings tab > SettingsHome > "Import Data" row (SettingsScreen.tsx:468) > ImportData (CoachNavigator.tsx:557-558) | 2 (or 1 from the offer) | ImportDataScreen's own intro/picker/status blocks, replaced by the Roman views | before: Back; pick platform; Custom URL; Open login site; pairing code mint/poll; status card -> after: all kept, same route; plus Continue on computer (handoff), live progress, verdict, "What moved" disclosure, Try again; no new route |
| Desktop step | Chrome on the computer > TGP extension popup | n/a | popup's extra actions become status | before: Start + Check status + pairing page -> after: exactly one Start (authorizes the open site's origin, D9) + status lines + per-family detail |
| Live progress | ImportData progress view; resume card on CommandCenter | 1 | ImportRunStatusJourney inside ImportData | phase, receipts, last update time, Stop status; no global banner |
| Verdict + per-family result | ImportData result view | 1-2 | ImportRunVerdictCard | complete / partial / failed with reasons; rows per family "came N of M", not_moved list, gaps; each row expands in place |
| Imported clients | Clients tab > ClientsList (imported people, "Invite pending", "Imported from your old site" provenance line) > ClientDetail | 1-2 | nothing | existing invite actions unchanged; imported rows gain the existing Invite action |
| Imported history | ClientDetail Timeline (existing) rows marked "Imported" | 2 | nothing | read-only rows; no edit actions added |

Every mobile PR carries the "Routes/actions before -> after" table in its body and a parity test (navigation targets and handlers
reachable), and updates docs/reachability.md, src/screens/coach/README.md, src/screens/coach/import-journey/README.md,
src/navigation/README.md (QUIET_LUXURY_DOCTRINE section 8).

## A4. Design rules each PR follows (B)

Mobile and popup PRs: Quiet-Luxury Doctrine (mobile docs/QUIET_LUXURY_DOCTRINE.md) s2 no fake features (entries hidden until the
backend path is on), s3 no celebration when an import completes (a sentence and a number, no confetti, no share card), s4 no hype,
no exclamation marks, "complete" only from the server verdict, s5 radius 4, bone page, forest as the single accent, motion from
theme tokens (<= 300 ms for waits), s6 no global banner or floating widget for a running import, s8 README updates; screen redo
rules 1-8 (_COMMON_131.md:280-310: honest copy, no dead buttons, ONE forest primary action per screen, all info present, mentally
deloading, no pathway cut, theme tokens only for dark-mode readiness per docs/dark-mode.md, forest primary buttons); progress uses
QuietBar (src/ui/progress/QuietBar.tsx), first reads show Skeleton from src/ui/skeletons (docs/SKELETON_LOADERS.md), never zero
counts; haptics only through src/components/HapticPressable.tsx per docs/HAPTICS.md; counts are tabular numerals, no charts (docs/charting.md not needed); no share card
(docs/share-card.md is out of scope). Backend PRs: ENGINEERING_RULES.md s1 tenant isolation, s2 RLS on every new table with a live
test, s3 error handling, s5 DTO/schema hygiene, s6 env vars declared with boot validation, s7 no dead code, s9 Stripe/payments
(FAM-7 touches no Stripe code), s10 new-feature checklist.
Roman on/off: the journey speaks as Roman only when the coach's Roman setting is on; neutral by default (A7.3).

## A5. The PR plan (46 PRs, 14 jobs, 8 waves)

Rules for all: fresh branch off origin/main; under 800 lines (rebuild lean: reuse code from the stale PR where it passed review,
cut verbosity; about 28k lines in total vs about 51k added by the open stale PRs); failing-first tests in the same PR; new switches
default off and declared in fly-env-desired-state.json "unset", .env.example and docs/runbooks/launch-flags.md by ONE PR per wave
only (those three files are also in ROMAN-GATES-132's set: importer switch PRs wait until it merges); prisma/schema.prisma PRs take
the operator's schema lock (one schema PR in flight across all v1.1 plans). T4 = Claude Opus 5.5 builder + both lenses; T2 = GPT-6.1
Sol builder; T1 = Sol builder. Each stale PR is closed as "superseded by <IDs>" by the operator when its last slice merges.

| ID | Repo | Tier | Goal in plain words | Main files (NEW = new file) | Switch | Failing-first tests | Lines | Depends | Wave |
|---|---|---|---|---|---|---|---|---|---|
| NS-1 | backend | T1 | Repo north star matches A7.3 | docs/importer/NORTH_STAR.md (+AI step) | - | none (docs) | 15 | - | 1 |
| NS-2 | mobile | T1 | same | docs/importer/NORTH_STAR.md | - | none (docs) | 15 | - | 1 |
| GAUNTLET-1 | backend | T2 | Pin honest results under stress before changing anything | NEW test/scout/gauntlet/*.spec.ts, NEW test/fixtures/scout/gauntlet/* | - | 429 Retry-After, session expiry mid-run, duplicate pages, empty family, unmapped family, 2,000 clients, hostile strings: never `complete` without reconciliation | 700 | - | 1 |
| REGISTRY-1 | backend | T4 | One registry that can later read learned data | NEW src/scout/reconstruct/source-registry.{provider,module}.ts + specs | - | provider = disk loaders byte-for-byte; refuses malformed | 700 | - | 1 |
| REGISTRY-2 | backend | T4 | Every reader resolves through it | families.ts, scout-{reconstruct,roster,entities,ingest}.service.ts, scout.service.ts, scout.module.ts, facts.service.ts, lifecycle.service.ts, induction/observation.* | - | NEW test/scout/orchestration/settle-registries.spec.ts; s10/s11 suites unchanged | 650 | REG-1 | 2 |
| PEOPLE-1 | backend | T4 | Imported records owned by a not-yet-joined client (S8-D3 schema) | prisma/schema.prisma, NEW migration + down, account-deletion manifest, data export | - | live RLS: coach A cannot read coach B's imported people; deletion/export cover them | 700 | lock | 1 |
| PEOPLE-2 | backend | T4 | Writers use it | native/{person-writer,native-writers,native-provenance}.ts | - | create-only, provenance-verified writes | 600 | P-1 | 2 |
| PEOPLE-3 | backend | T4 | Imported people on the importer roster read (S8-D2) | scout-roster.{service,dto}.ts, docs/contracts/importer-openapi.json | - | roster lists imported people with provenance, tenant-scoped | 650 | P-2, REG-2 | 3 |
| PEOPLE-4 | backend | T4 | Imported people in the coach's Clients list as invite-pending | coach client-list service (from b#577 at 96b36ebc) | - | sub-coach sees only assigned imported people | 600 | P-3 | 4 |
| ORIGIN-1 | extension | T4 | Start gesture grants one https origin, bound to tab and nonce | NEW shared/origin-grant.js, background.js, manifest.json | - | grant refused without Start; revoked on tab close; startup sweep | 750 | - | 1 |
| ORIGIN-2 | extension | T4 | Replay runs only in the granted page's MAIN world | shared/replay/engine.js, content/main.js | - | cross-origin replay refused; main-frame-only teardown | 700 | O-1 | 2 |
| ORIGIN-3 | extension | T4 | Vendor knowledge quarantined; backend origin exact (D6) | extractors/* -> legacy/, .vendor-name-guard.json, shared/net.js | - | guard fails on a vendor name in core | 500 | O-2 | 3 |
| LEARN-1 | backend | T4 | The learn contract (families, fields, types, identity, relations) generated from the native contract | NEW src/scout/learn/{learn-contract,contract-from-native}.ts | - | contract changes when a native field changes; hash stable | 700 | - | 1 |
| LEARN-2 | backend | T4 | Validators: only observed fields, origin and next_url confinement, no credential-shaped fields | NEW src/scout/learn/validators.ts | - | each rule has a refusing case | 750 | L-1 | 2 |
| LEARN-3 | backend | T4 | Live prompt: goal, contract, verified examples; version + hash | NEW src/scout/learn/prompt-builder.ts | - | prompt changes with the contract; source content only inside delimited untrusted blocks | 600 | L-2 | 3 |
| LEARN-4 | backend | T4 | Adversarial injection corpus as a required CI test | NEW test/scout/learn/injection/*.json + spec | - | every corpus item yields refused or data-only output | 700 | L-3 | 4 |
| AIGATE-1 | backend | T4 | importer.mapping capability: no tools, no network, one schema-constrained answer | NEW src/ai/gateway/importer/*, ai-gateway.config.ts (known list only) | FEATURE_IMPORTER_AI_LEARN (off) | invalid output -> typed error, never a write | 650 | L-1 | 2 |
| AIGATE-2 | backend | T4 money | Caps: calls/tokens per run, per-coach daily, global daily spend + kill switch, timeouts; reserve before call | NEW src/ai/gateway/importer/importer-spend.ts (+ table if the existing AI credit ledger does not fit: lock) | IMPORTER_AI_DAILY_CAP_USD | each cap fails closed to an honest partial | 750 | AG-1 | 3 |
| AIGATE-3 | backend | T4 | Model from config, must pass the importer eval; recorded per run; no silent downgrade | NEW importer-model.config.ts, NEW test/ai/importer/eval.spec.ts | IMPORTER_AI_MODEL | unknown/unevaluated model refused | 600 | AG-2 | 4 |
| EXTLEARN-1 | extension | T4 | Structure digest with minimal redacted samples (X2) | NEW shared/learn/{digest,redact}.js | - | no value, email, token or cookie survives redaction | 700 | O-2 | 3 |
| EXTLEARN-2 | extension | T4 | Learned-package -> replay blueprint compiler (deterministic) | NEW shared/learn/compile.js | - | same package -> same blueprint; unknown roles refused | 700 | X-1 | 4 |
| LEARNRUN-1 | backend | T4 | Server learn step: digest in -> prompt -> model -> validators -> package for this run | NEW src/scout/learn/learn.{service,controller,module}.ts, scout.module.ts, lifecycle/reason-codes.ts, importer-openapi.json | reads FEATURE_IMPORTER_AI_LEARN (declared by AIGATE-1) | budget/invalid/timeout -> partial with a reason; prompt version, contract hash, model stored | 750 | L-4, AG-3 | 5 |
| EXTLEARN-3 | extension | T4 | Server-mode learn path (X3) | background.js, shared/protocol.js | - | no package -> no replay; status shows why | 650 | X-2, LR-1 | 5 |
| TRUTH-1 | backend | T4 | Proven per-family source count from replay terminal enumeration (L3, part 1) | induction/{contract,verify}.ts + decision addendum | - | chain without terminal evidence = unknown | 700 | - | 4 |
| TRUTH-2 | backend | T4 | Coverage consumes it (L3, part 2) | reconciliation/{coverage,facts.service}.ts | - | per-family counts provable; run stays partial without closure | 650 | T-1 | 5 |
| LEARNRUN-2 | backend | T4 privacy | Per-coach memory of learned structure (no client data, no secrets) | prisma/schema.prisma (lock), NEW migration, learn.module.ts, deletion + export | - | live RLS; a stored package with a sample value is refused | 700 | LR-1 | 6 |
| EXTLEARN-4 | extension | T4 | Engine counters for per-family evidence (X2b) | shared/replay/state.js, shared/progress.js | - | counts match fixture totals | 500 | X-3, T-1 | 6 |
| TRUTH-3 | backend | T4 | Closure: a learned run is `complete` only when every family is proven and nothing failed (D1) | reconciliation/reconcile.ts, NEW docs/decisions/<date>-completeness-closure.md (from b#594) | - | one missing record -> partial with the family named | 600 | T-2 | 6 |
| TRUTH-4 | backend | T4 | One projection: families[] / not_moved[] / gaps[] (D5) | NEW src/scout/projection/*, scout.module.ts, importer-openapi.json | - | tenant-scoped; numbers equal the ledger | 650 | T-3 | 6 |
| LEARNRUN-3 | backend | T4 | Registry reads memory: next run on that site uses 0 AI calls; drift -> re-learn within caps | source-registry.provider.ts, NEW src/scout/learn/drift.ts | - | remembered = 0 calls; changed structure -> re-learn; failed re-learn -> partial structure_drift_unresolved | 650 | LR-2, REG-2 | 7 |
| FAM-1..7 | backend | T4 health/PII | Every reachable kind lands (D4): 1 preserved records for kinds TGP has no model for (lock), 2 workout history, 3 exercise matching (EX1 record), 4 messages (read-only imported thread), 5 body metrics + check-ins, 6 photos/files to existing storage (D12, lock if a table), 7 payment schedule preserved read-only (D10, no Stripe) | native/{native-families,native-rules,native-writers}.ts + one NEW writer per kind | - | per kind: create-only, tenant-scoped, provenance, deletion/export; consent rule of OD-6 | 600-780 each | TRUTH-3, P-2 | 6-8 (in order) |
| JOURNEY-1 | mobile | T2 | Roman journey live in ImportData: pick/enter -> computer handoff + pairing -> live progress | src/screens/coach/ImportDataScreen.tsx, import-journey/{ImportProgressView,ImportStatusFrame,importJourneyCopy.ts,i18n/en.json,README.md}, src/hooks/useImportRunStatus.ts | uses extensionImport, importReview | parity test; no count shown before the first read; Roman off = neutral | 700 | - (reads today's status API) | 5 |
| JOURNEY-2 | mobile | T2 | Truthful verdict with per-family detail; folds in m#302 | import-journey/ImportResultView.tsx, src/api/importRunStatusApi.ts, src/types/importRunStatus.ts, src/components/coach/importVerdictContent.ts | - | complete only from server; each family row; not_moved reasons | 700 | T-4 | 7 |
| JOURNEY-3 | mobile | T2 | Offer card on CommandCenter (PLG entry) | command-center/CommandCenterScreen.tsx, hooks/useImportOfferDecision.ts, docs/reachability.md | - | shows only for 0 clients + no decision + switches on; Later hides it | 400 | J-2 | 7 |
| POPUP-1 | extension | T2 | One Start, everything else status (D9), per-family detail | popup/{popup.html,popup.js,outcome.js}, shared/import-status.js | - | exactly one actionable control | 500 | T-4, O-3 | 7 |
| PROOF-1 | backend | T2 | V1 proof: two structurally independent fixture sites, learned (recorded model output), imported, verified, remembered (second coach 0 AI calls), drift; core-diff gate with an EMPTY allowed set | NEW test/scout/v1-proof/*, scripts/s10-core-diff-gate.sh mode | - | the proof itself | 700 | LR-3, FAM-1..3 | 8 |
| REUSE-1/2 | backend | T4 privacy | Cross-coach reuse after a quorum of proven runs (L2g), structure only | learn/reuse.ts, schema (lock) | FEATURE_IMPORTER_SHARED_MEMORY (off) | coach B never sees coach A's data; quorum enforced | 650 each | LR-3 | 8 |
| RETIRE-1/2 | backend, extension | T2 | Delete the TrueCoach oracle after the owner pilot proves parity; guard allow-list shrinks | sources/truecoach.json, extractors/truecoach*, .vendor-name-guard.json | - | guard + suites green without the oracle | 300 each | pilot | 8 |

Waves (no two PRs in flight share a file; within a job PRs run in order):
- W1 now: NS-1, NS-2, GAUNTLET-1, REGISTRY-1, PEOPLE-1 (lock), ORIGIN-1, LEARN-1.
- W2: REGISTRY-2, PEOPLE-2, ORIGIN-2, LEARN-2, AIGATE-1 (switch files).
- W3: PEOPLE-3, ORIGIN-3, LEARN-3, AIGATE-2 (switch files; lock if a table), EXTLEARN-1.
- W4: PEOPLE-4, LEARN-4, AIGATE-3 (switch files), EXTLEARN-2, TRUTH-1.
- W5: LEARNRUN-1 (reason codes), EXTLEARN-3, TRUTH-2, JOURNEY-1.
- W6: LEARNRUN-2 (lock), EXTLEARN-4, TRUTH-3, TRUTH-4, FAM-1 after LEARNRUN-2 (lock).
- W7: LEARNRUN-3, FAM-2..5, JOURNEY-2, JOURNEY-3, POPUP-1.
- W8: FAM-6, FAM-7, PROOF-1, REUSE-1/2 (switch files), owner pilot (switches on for the owner only via FEATURE_SCOUT_PILOT_COACH_IDS), RETIRE-1/2.
Shared-file checks: scout.module.ts is touched by REGISTRY-2 (W2), LEARNRUN-1 (W5), TRUTH-4 (W6) only; importer-openapi.json by
PEOPLE-3 (W3), LEARNRUN-1 (W5), TRUTH-4 (W6); reason-codes.ts by LEARNRUN-1 only; switch files by one PR per wave; mobile READMEs
and docs/reachability.md by one mobile PR at a time (JOURNEY job is sequential).
Overlaps: open board PRs (b#882-887, m#573-575, ops/board/board.md 13:44) touch no importer file. V11_PLAN_132 (Roman) excludes the
importer; shared files are only the switch files (.env.example, launch-flags.md, fly-env-desired-state.json: wait for
ROMAN-GATES-132) and prisma/schema.prisma (schema lock). Other v1.1 pillars: CommandCenterScreen.tsx may be in FUNNEL/TEAMS/CHURN
plans: JOURNEY-3 re-checks the board before it starts.

Definition of done for v1.1 (the owner's "finally completed"): PROOF-1 green in CI; GAUNTLET-1 green; the owner's own account on
the owner-chosen site imports with zero routine actions after Start and shows a verdict the owner checks by hand; RETIRE-1/2
merged; every switch flipped only with both lenses and the owner's yes.

## A6. Ready-to-paste JOBS132 entries

(Operator first clones BradleyGleavePortfolio/tgp-importer-extension for the extension worktrees; no clone exists in the workspace.)

## IMPORTER-NS-132 (builder, GPT-6.1 Sol, backend + mobile docs, T1; two PRs)
Worktrees /home/user/workspace/wt/IMPORTER-NS-132-backend and /home/user/workspace/wt/IMPORTER-NS-132-mobile, branch
agent132/importer-ns-132 in each (off origin/main). PR 1 backend, PR 2 mobile: insert the "The AI step (owner, 2026-09-27)" section
into docs/importer/NORTH_STAR.md exactly as in SoT A7.3 (TGP_SOURCE_OF_TRUTH.md:1644-1655), placed after "Invariants" as in the
extension copy (`gh api repos/BradleyGleavePortfolio/tgp-importer-extension/contents/docs/NORTH_STAR.md`). About 15 lines each.
Docs-only (say so in the body). READY. End.

## IMPORTER-GAUNTLET-132 (builder, GPT-6.1 Sol, backend, T2 test-only; two PRs)
Worktree /home/user/workspace/wt/IMPORTER-GAUNTLET-132-backend, branch agent132/importer-gauntlet-132. PR 1 GAUNTLET-1 (plan A5):
NEW test/scout/gauntlet/ on the existing s10/s11 harness (test/fixtures/scout/s11/s11-sources.ts, test/scout/s11/*.pg.spec.ts): the
seven stress cases; assert terminal_status and reason codes; never `complete` without a reconciliation verdict. A red case that
shows a real bug: do not fix; write it up for the operator (Q3). Under 800 lines. READY. PR 2 PROOF-1 when LEARNRUN-3 and FAM-1..3
have merged (fresh branch agent132/importer-proof-132). READY. End.

## IMPORTER-REGISTRY-132 (builder, Claude Opus 5.5, backend, T4; two PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-REGISTRY-132-backend, branch agent132/importer-registry-132. Source design: L2a
(`git -C <wt> show 249fd0d4 --stat`; b#588). PR 1 REGISTRY-1: NEW provider + module + specs; consumers untouched. PR 2 REGISTRY-2
(fresh branch agent132/importer-registry-2-132 after PR 1 merges): switch the consumers listed in A5; s10/s11 suites unchanged.
Each under 800 lines; failing-first. READY each.

## IMPORTER-PEOPLE-132 (builder, Claude Opus 5.5, backend, T4 tenancy/PII; four PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-PEOPLE-132-backend, branch agent132/importer-people-132. Designs: S8-D3 b#587 @ 0a6b5657,
S8-D2 b#577 @ 96b36ebc (`gh pr diff`). PR 1 PEOPLE-1 (take the operator's schema lock; migration with down.sql; live RLS suite;
deletion manifest and export entries), PR 2 PEOPLE-2, PR 3 PEOPLE-3 (after REGISTRY-2), PR 4 PEOPLE-4, each on a fresh branch
agent132/importer-people-<n>-132. Anything about who may see a client's data: fail closed and state it in the PR body. READY each.

## IMPORTER-ORIGIN-132 (builder, Claude Opus 5.5, extension, T4 credentials; three PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-ORIGIN-132-extension, branch agent132/importer-origin-132. Design: ext#35 @ 04db1b00 and
its review closures (SoT :5876; open item: real-Chrome browser-load proof). PR 1-3 = ORIGIN-1..3 (A5). D6 origin https://backend-spring-lake-3890.fly.dev exact host. Never read,
store or log a credential; tests prove it. READY each.

## IMPORTER-LEARN-132 (builder, Claude Opus 5.5, backend, T4; four PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-LEARN-132-backend, branch agent132/importer-learn-132. Design: b#591 @ 68a84d1d (contract
v2; no AI destination; origins/parentEdge/idScope; pagination signals). PR 1-4 = LEARN-1..4, pure code under NEW src/scout/learn/
(no Nest wiring until LEARNRUN-1). Never quote hostile corpus strings in PR comments; describe them by file:line. READY each.

## IMPORTER-AIGATE-132 (builder, Claude Opus 5.5, backend, T4 money; three PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-AIGATE-132-backend, branch agent132/importer-aigate-132. Design: b#592 @ 32ca797e
(SpendLedger reserve-before-call, kill switch per attempt, single tool_use, conservative token estimate). PR 1-3 = AIGATE-1..3.
Reuse the existing AI credit/spend code before adding a table. Never add importer.mapping to AI_GATEWAY_CAPABILITIES and never touch
production flags; cap values come from owner decision OD-4. READY each.

## IMPORTER-EXTLEARN-132 (builder, Claude Opus 5.5, extension, T4; four PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-EXTLEARN-132-extension, branch agent132/importer-extlearn-132. Design: ext#38 @ 055b5e6b,
rebased in spirit on ORIGIN (key-admission rules). PR 1-4 = EXTLEARN-1..4 in A5 waves. READY each.

## IMPORTER-LEARNRUN-132 (builder, Claude Opus 5.5, backend, T4; three PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-LEARNRUN-132-backend, branch agent132/importer-learnrun-132. PR 1 LEARNRUN-1 (after
LEARN-4 and AIGATE-3), PR 2 LEARNRUN-2 (schema lock), PR 3 LEARNRUN-3. Reads FEATURE_IMPORTER_AI_LEARN (declared "unset" by AIGATE-1); no switch-file edits. READY each.

## IMPORTER-TRUTH-132 (builder, Claude Opus 5.5, backend, T4; four PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-TRUTH-132-backend, branch agent132/importer-truth-132. Designs: b#589 @ 263e8950 (L3),
b#594 @ a48abf3e (closure record). PR 1-4 = TRUTH-1..4. COMPLETENESS_BASIS_KINDS is append-only: the addendum goes in PR 1. READY each.

## IMPORTER-FAMILIES-132 (builder, Claude Opus 5.5, backend, T4 health/PII; seven PRs, then wait for verdicts)
Worktree /home/user/workspace/wt/IMPORTER-FAMILIES-132-backend, branch agent132/importer-fam-<n>-132 per PR. Design: FAM-0 b#590 @
696abd73, EX1 record docs/decisions/2026-09-28-ex1-exercise-resolution.md (only on integration/importer: `git show
origin/integration/importer:docs/decisions/2026-09-28-ex1-exercise-resolution.md`). FAM-1..7 in order (A5). Health kinds
follow OD-6 consent. Payment schedule is display-only: no Stripe call, no charge moved (Q9). READY each.

## IMPORTER-JOURNEY-132 (builder, GPT-6.1 Sol, mobile, T2; three PRs)
Worktree /home/user/workspace/wt/IMPORTER-JOURNEY-132-mobile, branch agent132/importer-journey-132. PR 1 JOURNEY-1, PR 2 JOURNEY-2
(after TRUTH-4; supersedes m#302), PR 3 JOURNEY-3. Mobile screen redo rules apply (parity table, truthful sweep, README rows; A3,
A4). READY each. End.

## IMPORTER-POPUP-132 (builder, GPT-6.1 Sol, extension, T2; one PR)
Worktree /home/user/workspace/wt/IMPORTER-POPUP-132-extension, branch agent132/importer-popup-132. POPUP-1 after TRUTH-4 and ORIGIN-3.
READY. End.

## IMPORTER-REUSE-132 (builder, Claude Opus 5.5, backend + extension, T4 privacy; four PRs)
Worktrees /home/user/workspace/wt/IMPORTER-REUSE-132-backend and -extension, branch agent132/importer-reuse-132. REUSE-1/2 after
LEARNRUN-3 (quorum from OD-10); RETIRE-1 (backend) and RETIRE-2 (extension) only after the owner's pilot verdict. READY each. End.

## A7. Owner decisions (recommended defaults)

- OD-1 Base: retire integration/importer; rebuild lean on main under 800 lines per PR; close the stale PRs as superseded (b#574,
  577, 580-583, 587, 589-594; ext#20, 35, 38; m#302; b#525-529). Default: yes.
- OD-2 V1 pilot: the owner's own account on the owner-chosen platform (owner 09-29). Default: the platform the owner coaches on
  today; switches on only for FEATURE_SCOUT_PILOT_COACH_IDS = the owner.
- OD-3 Chrome Web Store listing: a one-time $5 developer fee ([Chrome docs](https://developer.chrome.com/docs/webstore/register),
  [publish guide](https://github.com/GoogleChrome/webstore-docs/blob/master/publish.md)). Cash, so the owner decides. Without it coaches
  must sideload, which is not product-led. Default: yes, unlisted first, after PROOF-1.
- OD-4 AI caps (provider cost on the existing key): default per run 6 calls / 200k tokens / 90 s each; per coach 3 learn runs a day;
  global $25 a day with the kill switch; remembered sites 0 calls.
- OD-5 Model: the strongest available frontier model in config, eval-gated, never silently downgraded. Default: the gateway's current
  provider (anthropic), model pinned in IMPORTER_AI_MODEL.
- OD-6 Consent for imported health data (body metrics, check-ins, food logs, photos): default stored as coach-held records visible
  to the coach; shown to the client only after they join and accept; Roman uses it only with the client's AI consent (box 2).
- OD-7 Media caps (D12 approved storage): default 2 GB per coach per import; beyond that, partial with the reason named.
- OD-8 Confirm D10 (payment history and next due date preserved, display only), D14 (partner data reachable through the coach's
  session moves), D1 (complete = ALL records). Default: confirmed as written 09-29.
- OD-9 Offer card audience: default head or solo coaches with 0 clients; never sub-coaches.
- OD-10 Cross-coach reuse quorum: default 2 independent coaches with proven per-family counts; structure only.
- OD-11 Legacy oracle as a bridge for early coaches: default no (A7.3: oracle only).

---------------------------------------------------------------------------------------------------------------------------------

# PART B — additional ideas, pitched separately (optional; none is needed for PART A)

| # | Idea in plain words | Why it makes TGP superior | Rival gap it exploits | Size | Cost | Depends on |
|---|---|---|---|---|---|---|
| B1 | Phone-only import: the coach logs in to the old site inside TGP's in-app browser and presses Start there; same origin grant and replay, no computer, no extension | The whole move from the phone in minutes; real PLG | Notion imports are desktop/web only ([Notion](https://www.notion.com/en-US/help/import-data-into-notion)); rivals need exports or staff | 6 PRs (T4: credentials) | none; App Review risk is an owner decision (never read credentials; disclose plainly) | A waves 1-5 |
| B2 | Bring any file: drop whatever export exists (CSV, spreadsheet, PDF programs, screenshots) and the same learn contract turns it into records with the same verdict | Works even when the old site is closed or the login is lost | CSV imports bring the roster, not the history ([CoachRx](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)); program rebuilds are manual or staffed ([Gymkee](https://gymkee.com/switch/everfit/)) | 4 PRs | AI tokens inside OD-4 caps | LEARN, AIGATE, FAMILIES |
| B3 | Parallel-run sync: re-import changes daily until the coach's switch day, with no duplicates | No double entry while clients move over | Switch guides have coaches run both apps by hand and retire the old one "after one check-in cycle" ([BrixFit](https://brixfit.app/blog/switch-from-everfit-to-brixfit)) | 3 PRs | none (remembered sites use 0 AI calls) | LEARNRUN-3 |
| B4 | Client continuity: an imported client joins and finds their history; Roman's first words are grounded in it (with consent) | The client's first day is not blank | "CoachRx starts a fresh history" ([CoachRx](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)) | 3 PRs | Roman tokens within its pool | FAMILIES, OD-6, Roman plan |
| B5 | Import receipt: one calm page per run: per kind found vs moved, reasons, time, model and prompt version | The coach can prove a faithful move | Apple tells the user to "make sure that all of your content transferred" ([Apple](https://support.apple.com/en-us/118670)); Shopify's app leaves orders and reviews to "separate tools or manual setup" ([Shopify](https://www.shopify.com/blog/store-migration-shopify-app)) | 2 PRs | none | TRUTH-4 |
| B6 | Team import: sub-coaches and their client assignments come across into a TGP team, head coach approves | Teams move as teams | Trainerize suggests separate imports per trainer ([help](https://help.trainerize.com/hc/en-us/articles/360040719692-How-to-bulk-import-client-lists-into-Trainerize)) | 3 PRs (T4 tenancy) | none | FAMILIES, V11-TEAMS plan |
| B7 | Roman first-week brief: after import, a coach-only draft of who needs attention this week, from imported history | AI-native value on day one | Imported clients elsewhere start with a fresh history ([CoachRx](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)), so there is nothing to read on day one | 2 PRs | AI tokens within caps | FAMILIES, V11-CHURN plan |
| B8 | Switch-day kit: one message plus QR and link so clients install TGP with their coach's brand | Fewer lost clients on switch day | Switch guides leave re-onboarding to the coach: "expect to rebuild your core programs manually" ([CoachingPortal](https://coachingportal.io/blog/switching-from-trainerize)); invite clients "in two batches" ([BrixFit](https://brixfit.app/blog/switch-from-everfit-to-brixfit)) | 2 PRs | none | V11-FUNNEL plan (QR) |
| B9 | Move live subscriptions at the next due date through TGP checkout | Payments continue without a gap | "Not all platforms can take over an existing Stripe subscription mid-cycle" ([PT Suite](https://www.pt-suite.com/blog/truecoach-5-percent-transaction-fee-explained-2026)) | 3 PRs (T4 money) | Stripe fees on the existing account; owner decision; iPhone payment flows must follow the App Store rules (checked before any build) | FAM-7, owner yes |

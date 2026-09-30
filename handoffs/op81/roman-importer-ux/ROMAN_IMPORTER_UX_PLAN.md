# Roman importer UX plan

**Build-ready planning proposal · documentation publication · 18 September 2026**
**Planner:** Astra, independent planning lane. **Builder:** `roman_importer_ui_builder_mu7hkdgm`, separate from this planner. **Audience:** mobile builder, extension/setup-web/lifecycle/native-domain owners, parent orchestrator, later independent reviewers.
**Purpose:** help an eligible coach move from an optional first-home offer to a single authorized desktop Start and then to demonstrably usable native TGP records, without overstating what happened.

## 1. Executive decision: build the presentation now; integrate only on authority

**UX-P1 is approved at Tier 1 and is running with separate builder `roman_importer_ui_builder_mu7hkdgm` on mobile base `a5933fd6de5616493de75f0db907098b149b955c`.** No implementation clearance or mobile PR is claimed. The approved scope is in [BUILD_SLICES.md](BUILD_SLICES.md). It owns new mobile leaf components and a test-only navigation host for question → value → source selection → computer handoff. It does **not** register a production route, call an import API, change auth/session/persistence, or consume a draft setup contract. Other screens in this document are a build-ready design for subsequent slices, not permission to activate them.

The target is **one accepted Start followed by autonomous migration into verified native records**; it is not currently product-accepted functionality. The canonical placement is the first coach home after authoritative onboarding, not a blocking interstitial or seventh wizard step. [Canonical journey and gates](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

**Current C1 dependency, observed 18 September 2026:** [Backend PR #526](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526) remains **open draft**, now at `881c4c791727adef8d423931e1cca83a0ffbb9c9` on `925780e0a1906593e5383c618311b6b17364b8dc`. Both bounded repair reviews are complete; overall **integration/release HOLD** remains, the consumer contract is **unfrozen**, and G3 is not accepted. Final hosted checks are pending at this observation; no green final result is preclaimed. Setup recovery does not supply Start, source lifetime authority, or native completion. The original `8e25c27` is preserved history, not the current head. [Publication and bounded review status](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526)

**Reading performed:** the complete user-supplied guide, all 2,662 lines / 17,820 words of its extraction, and all eight original DOCX tables; the DOCX contains no embedded media. The full private read ledger distinguishes this complete read from selective inspection of older design references; it is not published with these documents. [Public provenance summary](README.md#provenance-and-reading)

**Status vocabulary:** “implemented”, “tested”, “reviewed”, “merge-eligible”, “landed”, “deployed”, and “product-accepted” remain separate. This planning deliverable claims none of those statuses for the proposed experience. [Current G09/G18 rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md)

## 2. Verified current state and visible reconciliations

### 2.1 Live sources, not assumptions about merged work

Live refs were rechecked at **2026-09-18 21:33 UTC**: context main `160928b98c57a6034cd8b7bcfba537e81c63f054`, mobile main `a5933fd6de5616493de75f0db907098b149b955c`; the inspected mobile checkout was clean at the same main SHA. [Pinned context commit](https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/160928b98c57a6034cd8b7bcfba537e81c63f054), [pinned mobile commit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c)

| Current source | What it actually establishes | Planning consequence |
|---|---|---|
| `CoachNavigator.tsx` | Real-data initial tab is `ClientsStack`; first route is `ClientsList`. `CommandCenter` is initial only in mock mode. `CoachHomeScreen` is preserved under nested `Dashboard`. [Navigation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachNavigator.tsx) | First-home offer goes on the actual Clients landing, not only on a legacy Home or mock Overview. Do not switch the initial tab as part of this work. |
| `RootNavigator.tsx` + `CoachWizardNavigator.tsx` | Coach onboarding checks the server; failures other than the handled incomplete state may fall through to coach navigation. The wizard's local completion key is informational, not authoritative. [Root](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/RootNavigator.tsx), [wizard](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachWizardNavigator.tsx) | Reaching home is **not** proof of authoritative completion. Unknown/error completion suppresses the unsolicited offer. Do not rewrite bootstrap in UX-P1. |
| `ImportDataScreen.tsx` | Source tap opens the source site on the phone, then mounts legacy pairing. [Current screen](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ImportDataScreen.tsx) | Proposed handoff reverses this: computer instructions before source login; picking a shortcut never starts pairing/import. |
| `ExtensionPairingPanel.tsx` | Current panel auto-initializes pairing, observes roster delta/reconstruction, and contains “still running”/“Nothing was imported” claims beyond the available evidence. [Panel](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/components/coach/ExtensionPairingPanel.tsx) | Do not reuse its authority or result copy. Retire those branches when the accepted integration replaces them, not by pretending UX-P1 fixes live behavior. |
| Flags and navigation | `extensionImport` and `romanChat` are distinct default-off flags; ImportData is registered under Settings when import is enabled. [Flags](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/config/featureFlags.ts), [routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachNavigator.tsx) | Roman off must remove Roman voice/face without removing a valid neutral importer. Import off removes entries and side-effecting mounts. |
| Settings / empty states | Import Data is under **Client Management**, after Active Clients; no-clients state already owns invitation flow. Filtered empty results are not necessarily an empty roster. [Settings](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/SettingsScreen.tsx), [Clients](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ClientsListScreen.tsx), [invite empty state](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/ui/empty-states/EmptyStateNoClients.tsx) | Reuse Settings location; add a secondary import entry around, not inside, invitation authority. Never offer “bring your first clients” on a failed load or search miss. |
| Native destinations | `ClientDetail` takes `clientId`/`clientName`; Clients list is typed as `User[]`, and client detail starts on local `summary` tab without an imported-family deep-link parameter. [Navigator](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachNavigator.tsx), [Clients](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ClientsListScreen.tsx), [detail](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ClientDetailScreen.tsx) | Staging/Person IDs must not be passed as User IDs. No invented workout/history deep links. |

### 2.2 Preserve PR 289–292; do not treat them as main

All four were **open / `merged_at: null`** on the read snapshot. [289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289), [290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290), [291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291), [292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292)

| PR | Exact head | Base observed | Preserve / do not overclaim |
|---|---|---|---|
| [289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289) | `22354984d9e3af0deb2d32271ce9ab5e5accb92a` | `a5933fd6de5616493de75f0db907098b149b955c` | Dependency/CI reproducibility work is separate from importer acceptance. |
| [290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290) | `ed0342e976bfd2992755d85afb1678bd135c327a` | `4be69b90583e0ba8f5394a94db6e494b5cf86730` | Import-review gating is a useful donor. It is not in main, and this base is not final PR 289 head. |
| [291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291) | `d2f0d31c6898f8642153df7a53644c1f38f26114` | `ed0342e976bfd2992755d85afb1678bd135c327a` | Account-scoped pairing mirror, restore check, sign-out clearing, and support correlation are prior work to preserve, not a final C1 consumer or durable run model. |
| [292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292) | `340886776e3af0c22b97aae666b1b0f331820f5f` | `d2f0d31c6898f8642153df7a53644c1f38f26114` | Digit-by-digit code announcement and actual copy success/failure handling are design donors. Do not silently inherit font-scale caps as the whole accessibility solution. |

The canonical plan also records downstream omission of final PR 289 amendments; parent must reconcile exact composition instead of bulk cherry-picking this preserved stack. [Composition warning](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

### 2.3 Resolve contradictions explicitly

| Tension | Ruling for this proposal |
|---|---|
| Older Payments→Ready concept vs canonical continuation | First authenticated coach home **after** authoritative onboarding; optional inline card. Never modal, gating overlay, or backend step. [Canonical ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md) |
| Guide's universal onboarding/early-auth advice vs existing six-step coach authority | Apply its low-friction/value-first principle inside the optional import task; do not move authentication, payments, or onboarding authority. new user-supplied guide (privately retained; not published), [current wizard](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachWizardNavigator.tsx) |
| Guide's 300ms celebration, mascot motion, glow, gamification suggestions vs TGP restraint | Use a clear result and real next destination as emotional closure. No confetti, bouncing avatar, fake typing, XP, streak, gradient, glow, trophy, or progress ring. Static presentation is deliberate; optional later fade uses existing motion tokens and reduced-motion handling. user-supplied guide (privately retained; not published), [Quiet-Luxury doctrine](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/docs/QUIET_LUXURY_DOCTRINE.md) |
| User calls the design Stillwater; repository concrete implementation is quiet-luxury tokens | “Stillwater” here means the existing bone/cream/ink/forest, Cormorant/Inter, restrained geometry. Do not introduce a new named design system. [Actual tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts), [doctrine](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/docs/QUIET_LUXURY_DOCTRINE.md) |
| Static `useTheme().colors` vs real dark semantics; forest doctrine vs oxblood semantic accent | Use `semanticColors` for background/text/disabled/border; retain existing forest token for the primary fill, warm light text, visible semantic text-colored border in dark mode. Do not globally recolor the app or accidentally turn this into an oxblood rebrand. [ThemeProvider](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/ThemeProvider.tsx), [tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts) |
| Older docs' “paired/running”, reconstruction counts, “shipped” terminology | Pairing is only setup; staging/receipts are not usable native records; a document label does not prove deployment or product acceptance. [Legacy decision record](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/docs/importer/MOBILE_IMPORT_DECISION.md), [canonical truth rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md) |
| Older numbered rule/LOC review ceremonies vs current constitution | Apply G01–G22 at live context SHA; parent assigns consequence-based review. Do not import superseded quota rules into the build. [AGENT_RULES](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md) |
| C1 source “frozen” vs consumer contract “unfrozen” | UX-P1/P2 can render explicit inputs; no generated schema, service, persistent intent, or lifecycle consumer until parent records actual contract freeze and G2/lifecycle acceptance. [Published C1 scope and limitations](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526) |

## 3. Product definition: WHAT / WHEN / WHERE / HOW / WHO / WHY

**WHAT:** a deterministic, optional migration setup journey led by Roman when enabled, followed by an authoritative cross-device run and a truthful result. It is not free-form chat and does not build a second migration engine.

**WHEN:** offer at the first eligible coach-home entry after a positive authoritative onboarding completion signal. Resume the existing setup/run instead of minting a second one. Show no promotion while identity, eligibility, onboarding, or feature availability is unknown. Pairing and readiness occur before Start; only accepted Start begins the run deadline.

**WHERE:** actual Clients landing; existing Settings → Client Management → Import my records; a secondary genuine-empty-roster entry; and optional typed Roman action pointing to the same controller. Desktop extension-owned task tab performs install/pair/source authorization/Start/run controls. Phone shows setup continuity and server-backed status, not source credentials or autonomous extraction.

**HOW:** one decision at a time, consistent Back behavior, calm factual progress, one visible primary action, optional technical details. Hide engine internals without hiding uncertainty. Preserve selection and accepted run identity through approved authority, not client guesses.

**WHO:** coach accounts with explicit allowed migration authority for the selected TGP workspace; no client/student role. Unknown role or owner/sub-coach label alone is not permission. Coach-account and workspace eligibility must be supplied by the approved server/controller; Roman's feature flag changes presentation, never permission. Mobile builder owns UI; setup/backend owner owns setup identity; extension owner owns browser permissions/source context; lifecycle owner owns accepted Start/fences; native domain owners own usability/readback; parent owns acceptance.

**WHY:** reduce effort and doubt so a coach can find and use their migrated client records. Emotional goals are capability at setup, control at authorization, reassurance during uncertainty, and confidence only when a native destination really works. Do not optimize time in app, repeated importer opens, or a fabricated success animation.

### Prioritized coach stories

1. As a coach who has just completed onboarding, I want an optional import offer in my normal home so I can explore it without losing access to coaching.
2. As a phone-first coach, I want clear computer instructions and recoverable setup so I do not waste time signing in on the wrong device.
3. As a coach with more than one account or workspace, I want source and destination confirmed before Start so the right records go to the right place.
4. As a coach whose transfer was interrupted, I want confirmed and unconfirmed records distinguished so I do not assume loss or create duplicates.
5. As a coach using large text or a screen reader, I want the same complete choices and status information without clipped codes or color-only signals.
6. As a coach who chose Later or starting fresh, I want ordinary coaching to remain available and a permanent Settings entry when I decide to return.

### Scope and priority

- **Must:** authoritative eligibility; nonblocking first-home offer; Later/fresh/settings/resume; source shortcuts; phone→computer handoff; verified official install; account/profile/permission recovery; paired≠running; single accepted Start; calm honest phases; complete/partial/blocked/interrupted distinctions; verified native destinations; all accessibility and localization requirements below.
- **Should:** recover continuity across devices/refresh; expose safe support reference and phase detail; contextual verified-family navigation where an actual route exists.
- **Could, later:** typed Roman chat shortcut to the same task controller, never an LLM deciding import authority.
- **Will not:** new universal design system, new engine, client invitations/auth provisioning as a side effect, source password collection, auto-email handoff, payments/subscription migration, fabricated per-record totals, unapproved notifications, gamification, or live integration in UX-P1.

## 4. Entry, eligibility, and navigation contract

### 4.1 Eligibility inputs (requirements, not an invented API)

The eventual host needs separately authoritative values for: current authenticated account/workspace, allowed coach migration role, positive onboarding completion, import rollout availability, Roman presentation availability, offer decision for that account/workspace, current setup/run lookup, and freshness/error state. **Do not invent endpoint names or add fields to draft C1.** Parent assigns missing ownership before UX-I1.

Priority order:
1. Import off / role denied → no new entry, no importer service mounts; protect direct navigation as well.
2. Identity or onboarding unknown → no unsolicited offer. Existing coaching work stays available. Manual Settings attempt may show “Import setup is unavailable right now. Please try again.” only from a real recoverable check, not a fabricated run.
3. Onboarding incomplete → no offer; authoritative wizard continues unmodified.
4. Existing accepted run → compact status/resume entry; do not ask the onboarding question again.
5. Existing setup → compact “Continue import setup”; no new setup until authoritative lookup resolves.
6. Account/workspace decision = starting fresh → suppress full offer and promotional resume. Settings remains while feature/role permit; generic empty-state import entry remains an optional utility, not a nag.
7. Decision = later → compact “Continue import setup”; no repeated full-card prompt or push reminder.
8. Eligible / no decision / no active setup → full question on first qualifying home entry.

“First” cannot be reliably implemented from component mount count, a device-global boolean, empty roster, or local onboarding flag. Persist the offer decision **per authoritative account/workspace** through an approved existing preference mechanism or an explicitly owned future addition. This is a dependency, not permission for UX-P1 to add storage. Until that owner exists, production offer wiring is blocked; leaf presentation is not.

### 4.2 Exact home placement

**Future host: `ClientsListScreen`, not `CoachHomeScreen`.** Put one full-width inline card after the Clients heading/count + Invite action and before the existing privacy notice/search/filter controls. It is part of the scrollable list header; it must not squeeze the roster into a tiny fixed viewport on small screens. Preserve the privacy notice, Invite behavior, search, filters, loading, error, and client rows. Never overlay bottom tabs or auto-focus the question on every render. [Current host structure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ClientsListScreen.tsx)

Implementation proposal for UX-I1: move the present header/search/filter content into the existing `FlatList`'s `ListHeaderComponent`, adding the card in that order; use a consistent list host for loading/error/empty content, without nesting a virtualized list inside a vertical ScrollView. This bounded host-layout change needs its own regression evidence. Do not touch it in UX-P1.

- **Yes:** replace the question inside the same card with the value question; preserve scroll position. Primary becomes **Import my records**. Secondary **Later**. An inline Back returns to the first question.
- **I am starting fresh:** collapse the card; retain normal Clients page. No forced invite, confetti, modal, or LLM response. Persist that decision later through the approved owner. Do not show a “saved” toast before acknowledgment.
- **Later:** collapse to compact resume row. No guilt language and no system permission request.
- **Existing setup:** compact row contains label plus actual current setup state, not “Import running” unless an accepted run exists.
- **Terminal run:** compact “Review import result” only if there is a retrievable authoritative result; do not forever show an old success promotion after it has been reviewed.

### 4.3 Secondary entries and Back

| Entry | Action | Back / exit |
|---|---|---|
| Home value CTA | Navigate to the existing Settings stack `ImportData` task route after integration; one controller, not another importer | Header Back / Android Back returns to originating Clients page; internal step Back first returns to previous step |
| Compact resume | Resolve current authoritative setup/run before choosing screen | No new init on each tap, focus, or back navigation |
| Settings row | Rename visible label to **Import my records**; retain position under Client Management after Active Clients | Back returns to Settings, not a hardcoded home |
| True empty Clients | Secondary text button below existing invite action: **Bring records from another platform** | Same route; invitation flow unchanged |
| Search/filter empty, loading, error | No empty-roster promotion | Existing retry/clear-search controls remain |
| Optional Roman typed action | **Import my records** invokes the same typed controller | Chat is not required; no conversational “yes” interpreted as authorization |
| Existing imported client | Only actual verified result link to existing native route | Native Back behaves normally; review context retained by approved controller |

No new bottom tab, global floating Roman button, forced chat thread, or new onboarding step. Phone navigation dismissal **does not cancel** a run. Desktop tab close/crash is an interruption condition, not user-confirmed cancellation. “Stop import” is an explicit distinct action.

## 5. Screen-by-screen journey and exact copy

All copy in this section is **proposed `en` locale source text**, not claims about current capability. Keys go in one feature-local dictionary; placeholders are described at §7.6. Do not construct grammatical sentences from fragmented strings. Use neutral defaults; the only `sir` variant is selected from an explicit stored address preference. Other locales require reviewed translations, not a claim that English-only is fully localized.

### S0 — optional home question / value (UX-P1)

**Feeling:** welcomed, free to choose. **Who acts:** coach. **Primary task:** choose whether to explore importing. **Trigger:** §4 eligibility in later host integration.

| Key | Exact English | Condition / action |
|---|---|---|
| `offer.question` | Have you coached on another platform before? | Roman neutral address / neutral product variant |
| `offer.questionSir` | Have you coached on another platform before, sir? | Roman enabled AND explicit address preference only |
| `offer.yes` | Yes | Value variant, no API call |
| `offer.fresh` | I am starting fresh | Dismiss full promotion; future preference acknowledgment |
| `common.later` | Later | Nonblocking compact resume |
| `offer.value` | Would you like to bring your clients and coaching history into TGP? | After Yes |
| `common.importRecords` | Import my records | Source selection |
| `offer.resume` | Continue import setup | Existing setup or Later |
| `offer.review` | Review import result | Actual retrievable terminal result |
| `empty.import` | Bring records from another platform | Genuine successful empty roster only |
| `common.back` | Back | Previous task step, or origin if first step |
| `common.setupTitle` | Import setup | Navigation title |
| `common.statusTitle` | Import status | Navigation title |
| `common.resultTitle` | Import result | Navigation title |

No message like “I have prepared everything” on a card impression. No promise of an account's full history before scope has been established. Roman neutral portrait, 48dp; no avatar if Roman is off.

### S1 — source shortcuts, not support promises (UX-P1)

**Feeling:** capable. **Where:** ImportData task content after integration. **Primary task:** select a source shortcut, then Continue; selection alone does not navigate externally.

| Key | Exact English | Behavior |
|---|---|---|
| `source.title` | Where are your records? | Screen heading |
| `source.body` | Choose a shortcut, or enter another site. Available records are checked on your computer. | Always |
| `source.note` | A listed site is a shortcut, not a guarantee that every record can be imported. | Supporting disclosure, not hidden terms |
| `source.continue` | Continue | Enabled after a catalog selection or validated custom URL |
| `source.customLabel` | Site address | Visible input label |
| `source.customHint` | Enter the secure web address you use to sign in. | Custom selection only |
| `source.invalid` | Enter a valid public HTTPS address. | Inline feedback; keep text intact |
| `source.noCredentials` | Do not include a password or sign-in code. | Custom input helper |

Use existing catalog names **TrueCoach, Trainerize, Everfit, My PT Hub, Custom / Other** (preserve actual catalog punctuation in UI). No “supported”, “fully compatible”, preferred ranking, fabricated adapter list, logo shopping wall, or source count badge. Existing names and URLs are data-driven shortcuts, not compatibility evidence. [Catalog](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/constants/importPlatforms.ts)

Custom input: URL keyboard, autocorrect off, no autocapitalization; allow paste. Existing URL guard is local scheme/host/embedded-credential validation, **not** proof of trusted setup origin or source authority. Select → Continue → computer handoff; source login happens later on desktop. Do not gather passwords, OTPs, cookies, exports, or client data on this screen. [Current URL guard](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/utils/safeImportLoginUrl.ts)

### S2 — phone-to-computer handoff (UX-P1 layout; UX-I2 operational controls)

**Feeling:** oriented, not stranded. **Primary task:** open the same setup on a computer. **Where:** phone view plus approved setup-web entry; no source login on phone.

| Key | Exact English | Condition / action |
|---|---|---|
| `handoff.title` | Continue on a computer | Heading |
| `handoff.body` | You will need Chrome on a computer. Keep this setup open while you connect the TGP extension. | Baseline instruction |
| `handoff.source` | Selected site: {sourceName} | Human label, never raw credential-bearing URL |
| `handoff.stepOne` | Open this setup on your computer. | Instruction, not a claimed issued URL |
| `handoff.stepTwo` | Connect the official TGP extension. | Instruction |
| `handoff.stepThree` | Sign in to your source and review Start. | Instruction |
| `handoff.copy` | Copy setup link | Only verified non-authorizing link exists |
| `handoff.share` | Share setup link | Explicit OS share gesture, never auto-email |
| `handoff.copied` | Setup link copied. | Clipboard promise resolved |
| `handoff.copyFailed` | The setup link could not be copied. Try again. | Clipboard rejects |
| `handoff.waiting` | Waiting for your computer | Link delivered or setup created, not paired |
| `handoff.openHelp` | How to continue | Inline short numbered help, no browser settings automation |
| `handoff.noComputer` | I will use a computer later | Return to origin; future acknowledged resume state |
| `handoff.saved` | You can return to this setup from Settings. | Only after recoverable setup/decision is actually persisted |
| `handoff.unavailable` | The setup link is unavailable. Try again. | Operational link lookup failure |

The trusted setup URL must be owned/verified, HTTPS, and carry only a **non-authorizing locator**. No pairing secret, access token, account email, source credential, run authorization, or signed bearer capability in URL/QR/share content. Exact host is unresolved; do not invent `tgp.../import` as if deployed. Account authentication and ownership checking happen at the destination. [Canonical handoff contract](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

Offer Copy as primary, Share as secondary, Later as tertiary; a same-device QR is not useful on the phone and is not required. If no approved link exists, do not render a fake URL, enabled copy button, or success toast. UX-P1 renders instructional layout only and test callbacks; operational controls are not released until UX-I2.

### S3 — desktop install / return / profile resolution (later integration)

**Feeling:** in control of what is installed. **Owner:** setup-web + extension. **Primary task:** install the official extension or open the existing extension-owned task tab.

Layout: centered native-feeling setup content, max readable width 560 logical pixels, same hierarchy; installed state replaces install card rather than stacking both. Persistent extension-owned task tab is the primary reliability surface; a toolbar popup auto-open is convenience, not the only route. Use browser-required user gestures; do not promise mobile Chrome extension support. The canonical plan distinguishes browser popup mechanisms/version constraints; final minimum version belongs to the verified extension release, not guessed copy. [Browser handoff requirements](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

| Key | Exact English | Evidence/action |
|---|---|---|
| `install.title` | Connect the TGP extension | Setup heading |
| `install.body` | Install the official TGP extension in this Chrome profile, then return here. | Listing/ID independently verified by owner |
| `install.openStore` | Open official Chrome listing | Exact approved listing only; never a generic search result |
| `install.return` | I have installed the extension | Recheck/handshake, not “installed” proof |
| `install.openTask` | Open import setup | Installed compatible extension-owned task tab |
| `install.notDetected` | The extension is not available in this Chrome profile. | Handshake absent; do not pretend to know why |
| `install.check` | Check extension setup | Shows short help: installed, enabled, profile, version |
| `install.disabled` | Enable the TGP extension in this Chrome profile, then try again. | Only verified disabled condition; otherwise explain as possible cause |
| `install.profile` | Use the Chrome profile where you installed the TGP extension. | Profile mismatch known or help instruction, no claim of detection |
| `install.update` | Update the TGP extension, then reopen import setup. | Explicit incompatible version signal |
| `install.policy` | This browser does not allow the extension. Use an approved computer or ask your administrator. | Managed-policy evidence, not generic handshake timeout |
| `install.unverified` | The official extension listing could not be verified. Setup cannot continue here. | Fail closed; no sideload recommendation |
| `common.checkAgain` | Check again | Bounded explicit recheck, not duplicate setup |

Missing/disabled/other-profile cannot always be distinguished by a web page. When no trustworthy signal exists, show the generic not-available state with separate help possibilities. Do not turn a timeout into a diagnosis. Install return should recover the same setup locator after authentication, not mint a new code on each return.

### S4 — TGP account and pairing (later integration)

**Feeling:** safe about destination identity. **Primary task:** connect the intended TGP account/setup to this extension. Pairing is authorization setup, never the import.

| Key | Exact English | Evidence/action |
|---|---|---|
| `account.title` | Confirm your TGP account | Authenticated desktop context |
| `account.destination` | Import destination: {workspaceName} | Verified display name; safely escaped |
| `account.signIn` | Sign in to TGP to continue this setup. | Existing approved sign-in, no new auth system |
| `account.mismatch` | This setup belongs to a different TGP account. Sign in to the account that created it. | Ownership mismatch; do not reveal other account details |
| `account.switch` | Use a different TGP account | Existing account-switch path, never transfer setup ownership |
| `pair.title` | Connect this computer | Setup stage |
| `pair.codeHelp` | Enter this code in the TGP extension on your computer. | Only actual unexpired pairing-code path, if frozen contract retains it |
| `pair.copy` | Copy code | Actual clipboard action |
| `pair.copied` | Code copied. | Only success |
| `pair.copyFailed` | The code could not be copied. Try again. | Failure |
| `pair.expiry` | This code expires at {time}. | Server expiry, locale/timezone formatted |
| `pair.expired` | This setup code has expired. Get a new code to continue. | Server-confirmed expiry |
| `pair.newCode` | Get a new code | Approved replacement operation; not replay old authority |
| `pair.checking` | Checking this computer's connection | Redeem response missing / possession not confirmed |
| `pair.connected` | This computer is connected. Your import has not started. | Confirmed possession/readiness for this setup; paired marker alone is insufficient |
| `pair.pending` | Pairing was recorded. This computer's connection still needs to be confirmed. | Server paired marker, uncertain token possession |
| `pair.retry` | Check connection | Recover current state; no blind re-redeem |

Codes must not be stored in analytics, logs, notifications, screenshots sent to support, or deep links. Visually group actual digits for legibility; screen reader speaks individual characters, not a large number. Code lifetime is not the run deadline. On code replacement clear prior copy confirmation. Reuse the useful donor behavior from PR 292 without declaring the old pairing contract accepted. [PR 292 changes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292/files)

Recovery requirement: distinguish lost init response, known setup with missing code, consumed code with lost redeem/token response, expired/revoked setup, and genuine token possession. C1-S1 alone does not resolve all of these. Do not route any ambiguity to Ready/Start. [Published C1 scope and limitations](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526)

### S5 — source login, permission, and ready review (later integration)

**Feeling:** informed control with minimal jargon. **Owner:** extension/source-lifetime authority. **Primary task:** sign in directly to the chosen source, select the intended source tab/workspace, grant narrow necessary permissions, then review Start.

| Key | Exact English | Condition/action |
|---|---|---|
| `sourceLogin.title` | Open your coaching platform | Desktop only |
| `sourceLogin.body` | Sign in on the platform's own website. Do not enter its password or sign-in code in TGP. | No unsupported blanket privacy promise |
| `sourceLogin.open` | Open selected site | Validated catalog/custom source URL in desktop tab |
| `sourceLogin.select` | Use this source tab | User-selected tab + origin capture |
| `sourceLogin.permissions` | Allow access to this source | Browser permission prompt only when needed; explain exact selected origin |
| `sourceLogin.denied` | Access was not granted. Allow access to the selected source to continue. | Permission denied |
| `sourceLogin.scope` | Source: {sourceName} · {sourceWorkspaceName} | Only verified source principal/workspace display |
| `sourceLogin.scopeUnknown` | The source account could not be confirmed. Check the selected tab before continuing. | Cannot safely bind principal/workspace |
| `sourceLogin.changed` | The source account changed. This import cannot continue with a different account. | Fence same-origin principal/workspace switch, including shared-cookie changes |
| `ready.title` | Ready to import | Only all prerequisites proven |
| `ready.body` | Start once. Keep this Chrome profile and the import setup tab open while your records are transferred and checked. | Desktop |
| `ready.destination` | To: {workspaceName} | Confirmed TGP workspace |
| `ready.source` | From: {sourceName} · {sourceWorkspaceName} | Confirmed selected source scope |
| `ready.limit` | After Start is accepted, this attempt has up to five minutes. Setup time is separate. | Reflects fixed 300-second lifecycle requirement, not a guarantee of success |
| `ready.review` | What will be checked | Expand family scope/exclusions, no nested required tour |
| `ready.start` | Start import | Desktop authoritative Start action; only one visual primary |
| `ready.starting` | Confirming Start | Pending accepted response; disabled local button, no progress claim |
| `ready.startUnknown` | Start has not been confirmed. Check the current attempt before trying again. | Lost response; recover same idempotent identity |

Before Start, show the actual source principal/workspace and destination workspace together. A tab title or URL host alone is not principal proof. If attribution cannot remain bound across refreshes/shared cookies/account switches, fence rather than silently continue under a different source. Do not offer broader “all sites” permissions to make an ambiguous source work. [Canonical source-boundary requirements](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

Family details may name clients, programs/workouts, nutrition, history, notes/check-ins and permitted billing history **only to the extent the approved run scope supports them**. Explain unsupported/excluded families plainly before Start when known. Never label a shortcut as a guarantee that those families exist or are fully readable. Billing is read-only historical information, not payment credentials, subscription transfer, charges, or live collection. [Native scope and exclusions](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

**singleStart rule:** one accepted server run identity, immutable accepted-start timestamp and deadline. A disabled button is only immediate UX feedback; retries, double taps, tabs, refreshes, and multiple devices require server idempotency and fences. A lost response performs authoritative lookup/recovery, not a new attempt. No run timer begins at source selection, pairing, or button press. Installation/login/minimum permission occur before Start, but bulk discovery, transfer, native writing, and reconciliation remain inside the accepted 300-second window; no hidden pre-Start bulk work may make the clock look faster. [Lifecycle authority](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

### S6 — calm progress (later integration)

**Feeling:** reassured without false certainty. **Primary task:** wait or explicitly stop; normal phone use remains available.

| Key | Exact English | Condition |
|---|---|---|
| `progress.title` | Import in progress | Accepted Start and current nonterminal server state |
| `progress.finding` | Finding records | Actual source discovery phase |
| `progress.transferring` | Transferring records | Actual transfer phase |
| `progress.checking` | Checking records in TGP | Native mapping/readback phase, not receipt validation alone |
| `progress.unknownTotal` | The full source total is not known yet. | Coverage incomplete/unknown |
| `progress.receipts.one` / `.other` | {count} record receipt confirmed / {count} record receipts confirmed | Counts transfer acknowledgments, not clients usable |
| `progress.native.one` / `.other` | {count} client record verified in TGP / {count} client records verified in TGP | Intent-attributed native readback only |
| `progress.lastUpdate` | Last update: {time}. | Actual observation timestamp, not render time |
| `progress.statusUnknown` | Current status unconfirmed | Unavailable or stale authority |
| `progress.stale` | Updates are unavailable. The import's current status has not been confirmed. | Polling failure/stale observation |
| `progress.return` | Return to coaching | Phone returns to origin without cancellation |
| `progress.stop` | Stop import | Explicit stop action; never hidden behind Back |
| `progress.stopping` | Stop requested. Waiting for confirmation. | Server fence unconfirmed |
| `progress.offlineStop` | This phone is offline. Stop the import from the extension on your computer. | Do not claim remote Stop succeeded |
| `progress.details` | View transfer details | Optional family/status details, safe reference, no secrets |

Layout: current phase heading + two concise lines + restrained phase list. Use indeterminate status when total is unknown; no fabricated percentage, changing ETA, ring, completed check mark for a merely staged family, animated heartbeat, or progress that advances with time rather than evidence. Optional actual per-family counts are labelled **received / verified / unconfirmed** with units. Distinguish transfer records from client records; never add unlike units into a “clients imported” total.

Use server time/deadline only if displaying elapsed/remaining time. Prefer “Started at {time}” plus actual state to a dramatic countdown. At deadline, request authoritative status; if offline show unconfirmed status, not automatic local “timed out” as a server fact. The backend still must enforce the fixed deadline regardless of a stale UI. No new timer on reconnection/retry/phase changes.

Desktop explicit Stop should immediately stop local collection and request the server fence. Phone Stop can request the server fence but cannot prove desktop cessation while offline. Do not require a second confirmation just to stop; resulting detail can explain already-written records. Closing the view is not Stop. [Cancellation and interruption rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

### S7 — result and recovery (later integration)

**Feeling:** grounded confidence or clear, non-blaming next action. **Primary task:** open a verified native destination, or follow the actual recovery step. Never hide partial/unknown counts inside a success screen.

| Key | Exact English | Evidence gate / action |
|---|---|---|
| `result.complete.title` | Your records are ready | All required coverage/family/relationship/native checks pass for declared scope |
| `result.complete.roman` | I have checked the imported records in TGP. They are ready to use. | Roman enabled and complete proof |
| `result.complete.neutral` | The imported records have been checked in TGP and are ready to use. | Roman off, same proof |
| `result.scope` | Checked scope: {scopeLabel}. | Exact declared scope, no implied whole-account coverage |
| `result.openClients` | Open clients in TGP | Verified usable roster route and bridge |
| `result.openClient` | Open {clientName} | Verified authorized native `clientId` resolves |
| `result.partial.title` | Some records are ready | At least one verified usable native subset; other scope not complete |
| `result.partial.body` | Review the verified records and the items that still need attention. | Do not call all records ready |
| `result.reviewVerified` | Review verified records | Only real supported destination; otherwise omit |
| `result.unconfirmed.title` | Some records are unconfirmed | Receipts missing/ambiguous; not proof of failure |
| `result.unconfirmed.one` / `.other` | {count} unconfirmed client record / {count} unconfirmed client records | Known attempted client count with acknowledgment uncertainty |
| `result.unconfirmed.body` | These records may already have reached TGP. Their transfer has not been confirmed. | Truthful lost-ack state |
| `result.coverageUnknown` | Source completeness has not been confirmed. | Unknown source traversal/coverage |
| `result.nativeUnknown` | Availability in TGP has not been confirmed. | No native usability proof |
| `result.blocked.title` | Import needs attention | Known prerequisite/source/permission/authority blocker |
| `result.blocked.body` | {reason} | Approved reason-key sentence, not raw exception |
| `result.failed.title` | Import did not complete | Actual terminal failure; may retain native subset |
| `result.failed.body` | Review the confirmed records and the items that could not be completed. | No “nothing imported” unless proved zero effects |
| `result.interrupted.title` | Import was interrupted | Actual interrupted terminal state; not just phone offline |
| `result.interrupted.body` | The current result needs to be checked before another attempt. | Authoritative reconcile first |
| `result.timeout.title` | This import attempt reached its time limit | Server timed-out/fenced status |
| `result.timeout.body` | Review the records that were confirmed before deciding what to do next. | No automatic fresh five-minute window |
| `result.cancelled.title` | Import stopped | Cancellation/fence confirmed |
| `result.cancelled.body` | Records already written may remain in TGP. Review the confirmed result. | Do not imply rollback |
| `result.checkStatus` | Check current result | Read current state, not Start |
| `result.recovery` | Review recovery steps | Actual supported next step |
| `result.retry` | Start a new attempt | Only explicit reconciled terminal retry policy permits it |
| `result.support` | Get help | Existing approved support path; attach no secrets |
| `result.reference` | Support reference: {reference} | Only real safe correlation reference |
| `result.close` | Return to coaching | Always available, no implied acceptance of completeness |
| `result.zero` | No records were found in the checked scope. | Complete coverage proves zero |
| `result.transferOnly` | Transfer confirmed. Availability in TGP has not been confirmed. | Transfer proof, no native proof |
| `result.reasonUnknown` | The import needs attention before it can continue. | Unknown safe reason key |
| `result.unavailable` | The import result is unavailable right now. Check again when you are connected. | Retrieval failure; retain last-observed timestamp if safe |

**Required example:** if evidence establishes 12 confirmed transfer receipts and **22 unconfirmed client records**, show exactly those two separately labelled facts; do not say “22 failed”, “12 usable clients”, “34 total source clients”, or “complete”. Add “Source completeness has not been confirmed” and “Availability in TGP has not been confirmed” when those proofs are absent. The preserved outcome candidate uses this distinction; it is not native completion authority. [Preserved transfer-outcome candidate PR #25](https://github.com/BradleyGleavePortfolio/tgp-importer-extension/pull/25)

A record may be proven failed only by a specific attributable rejection/failure signal with defined semantics. An HTTP failure after a possibly committed write or a missing acknowledgment is not sufficient proof that the record never arrived. Retrying unconfirmed records must reconcile against durable identity to prevent duplicates; UI offers no “Retry all” shortcut around that control.

For partial native success, show a family row per relevant scope with status text and verified count, then unresolved counts/reason. Only verified native rows get a destination action. For complete with zero records, use a dedicated factual state **“No records were found in the checked scope.”** only when source coverage genuinely proves zero; do not show “Your records are ready.” Unknown/blocked empty results are not a successful zero-record import.

## 6. Annotated textual wireframes

Coordinates are logical pixels, not fixed-height screenshots. Boxes show grouping; every content area can grow. All action labels are sentence case even if adjacent legacy screens use uppercase. Final handset safe areas are supplied by platform insets.

### A. First real coach-home entry

```text
[system safe top inset]
  Clients                     [Invite]       existing header, 24px side inset
  <existing count>                           not a migrated-record counter
  ┌──────────────────────────────────────┐   radius.lg=4; padding 16
  │ [Roman neutral 48]                   │   omitted when Roman off
  │ Have you coached on another          │   h2; wraps, no line limit
  │ platform before?                     │
  │ [ Yes                              ] │   primary, min 48 high
  │ [ I am starting fresh              ] │   secondary, min 48 high
  │ [ Later                            ] │   text action, min 48 high
  └──────────────────────────────────────┘   16px after card
  <existing privacy notice>
  [Search clients]
  [All] [Active] [Archived]
  <actual roster / loading / error / empty>
[existing bottom tabs + safe bottom handling]
```

One scroll host in final integration. At 320px/200% text, card grows and roster moves below; no overlay or fixed hero steals scrolling. Invite remains functional. The inline Yes→value replacement uses same card position, heading **“Would you like to bring your clients and coaching history into TGP?”**, primary **Import my records**, then Later and Back. There is no fourth simultaneous question.

### B. Source selection

```text
[Back]                       Import setup     48px navigation targets
Where are your records?                       h1, 24px side inset
Choose a shortcut, or enter another site.
Available records are checked on your computer.

( ) TrueCoach                                 min 56px row; 16px padding
( ) Trainerize                                full row selectable
( ) Everfit
( ) My PT Hub
( ) Custom / Other                            checked state spoken

[Site address]                                only when custom selected
[ https://...                              ]  min 48px; grow for text
Do not include a password or sign-in code.
<inline invalid message, if any>

A listed site is a shortcut, not a guarantee
that every record can be imported.
[ Continue                                ]  in scroll flow; disabled with reason
[ Later                                   ]
[bottom inset + 24px]
```

No source logos, support badges, hidden recommended default, or instant browser launch. Four named rows plus one custom row are a single choice group. Help is supporting text, not a sixth required decision.

### C. Phone handoff

```text
[Back]                       Import setup
[Roman neutral 48, if enabled]
Continue on a computer
Selected site: TrueCoach
You will need Chrome on a computer. Keep this
setup open while you connect the TGP extension.

  1  Open this setup on your computer.
  2  Connect the official TGP extension.
  3  Sign in to your source and review Start.

[ Copy setup link                         ]  only real verified link
[ Share setup link                        ]  explicit OS share
<actual copy feedback / waiting status>
[ How to continue                         ]  expands help
[ I will use a computer later             ]  no auto-email or promise before save
```

UX-P1 implements heading/instructions/Back/Later only. The wireframe's operational controls are future UX-I2, not placeholder production controls.

### D. Desktop ready / mobile paired status

```text
Desktop extension-owned task tab             Phone status
─────────────────────────────────────        ───────────────────────────
Ready to import                              This computer is connected.
From: <verified source + workspace>           Your import has not started.
To: <verified TGP workspace>
<actual included/excluded scope summary>      Review and start the import
[What will be checked]                       on your computer.
Start once. Keep this Chrome profile...
After Start is accepted, this attempt...
[ Start import                       ]       [Return to coaching]
[Back to source setup]                       [Check connection]
```

No mobile Start button competing with the reviewed desktop authority. If product later adds another initiator, server singleStart semantics must still be identical; this proposal does not require it.

### E. Calm progress / uncertain status

```text
[Back]                       Import status
Import in progress
Transferring records                          actual current phase
12 record receipts confirmed                  not "12 clients ready"
The full source total is not known yet.
Last update: 14:42                             actual observation

Finding records     <actual status word>
Transferring records  In progress
Checking records in TGP  Not yet confirmed

[Return to coaching]
[Stop import]                                 distinct deliberate action
[View transfer details]
```

On lost status, title becomes **“Current status unconfirmed”**, phase freezes as last observed, and body uses `progress.stale`. Remove any “alive” animation. Primary becomes Check current result; a phone network failure does not declare the desktop interrupted. No percentage or countdown invented from receipts.

### F. Partial / unconfirmed outcome

```text
[Back]                       Import result
Some records are unconfirmed
12 record receipts confirmed
22 unconfirmed client records
These records may already have reached TGP.
Their transfer has not been confirmed.
Source completeness has not been confirmed.
Availability in TGP has not been confirmed.

[Check current result]                        no native destination yet
[Review recovery steps]                       real supported path only
[Get help]   <actual safe support reference>
[Return to coaching]
```

If native subset is separately proven, heading **Some records are ready**, add **“8 client records verified in TGP”** as an explicitly separate fixture example, and offer only verified destinations. Do not subtract these values unless the authority defines identical units/scopes.

### G. Verified completion

```text
[Back]                       Import result
[Roman neutral 48, if enabled]
Your records are ready
I have checked the imported records in TGP.
They are ready to use.
Checked scope: <authoritative scope label>.

Clients             <verified count>   [Open]
<other real family> <verified count>   <real action or no link>

[Open clients in TGP]                          only known usable route
[View transfer details]
[Return to coaching]
```

Use neutral portrait for initial delivery; the older Roman spec leaves additional milestone-smile use as an open operator decision, so a new import-specific celebratory face is not a dependency. Real native records are the reward, not a celebration animation. [Roman identity, §6](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md)

## 7. Component, visual, localization, and accessibility specification

### 7.1 Reuse current system precisely

The current tokens define Cormorant Garamond headings, Inter body/UI, spacing 4/8/12/16/24/32/48/64, 4px card corners, forest `#2C4A36`, bone `#F5EFE4`, and a 400ms base motion token. `typography.button` is not a current token; use actual body/UI tokens rather than stale README examples. [Tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts), [theme README](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/README.md)

| Element | Proposed implementation |
|---|---|
| Screen shell | Existing navigation stack conventions; `react-native-safe-area-context` insets for header/footer once, not double SafeAreaView+manual inset. ScrollView for standalone task body; FlatList header for roster host. Keyboard avoidance for custom URL only. |
| Horizontal padding | `spacing.xl` = 24; 320px width gives 272px content. Maintain inset at 200% font; let text wrap, not shrink. Tablet max content width 560 with centered container. |
| Vertical rhythm | 24 after navigation; heading→body 12; body→group 24; related controls 8; card internal 16; groups 24/32; footer bottom max(safe inset,16)+16 when no native tab handling, never duplicate consumed inset. |
| Heading | Screen `typography.h1` = 32/35 Cormorant regular; card `h2` = 24/29; subordinate h3 = 20/24. Display weight max 500. Allow scaling and lines to grow. |
| Body | `typography.body` 16/26 Inter; secondary `bodySmall` 14/22. Buttons `bodyMd` 16/26 medium. Count labels remain plain Inter, not giant vanity counters. |
| Microcopy | `caption` 12/18 only for genuinely secondary metadata; critical instructions/errors/permission reasons never below bodySmall. Do not use 10px micro/11px eyebrow for actionable import guidance. |
| Cards | `radius.lg` 4; semantic surface; subtle existing border; no decorative shadow necessary. Inputs `radius.md` 2. Primary buttons `radius.sm` 0. Pill only for small labelled status chips, not all controls. |
| Primary | Forest token fill; `semanticColors.textOnAccent` light label; 48px minimum height + 12 vertical/16 horizontal padding, wrap labels; dark-mode 1px `semanticColors.textMuted` border for distinguishable edge. No parent opacity for disabled. |
| Secondary/text actions | Semantic text, underlined where link-like; ≥48×48 touch area, 8px separation; no forest-on-dark small body text. Active focus outline uses semantic primary text with 2px separation. |
| Selected source | Radio semantics, visible check/radio mark + “Selected” accessibility state; 1px semantic primary outline, no color-only cue. 56px minimum row height, grows for text. |
| Disabled | `semanticColors.disabledBg` + `textOnDisabled`; `accessibilityState.disabled=true`; nearby reason when not self-evident. Not opacity-dimmed whole row. |
| Error/warning | Plain factual heading and text; optional existing Ionicon with semantic meaning. State text conveys meaning independently of color; no invented error palette. |
| Roman | Bundled `RomanAvatar`, explicit neutral crop, 48px at introduction/card; 32px only on compact persistent Roman-voiced surface if needed. No new mascot media. Not an interactive button. |
| Motion | UX-P1 static; press feedback can use `HapticPressable disableAnimation` or plain Pressable with existing tokens. No spring/scale/fake typing. Later optional single 400ms fade only when reduced-motion preference is resolved false; do not animate while setting is unknown. |

`ThemeProvider.colors` is a static legacy flat map; dark-mode roles come from `semanticColors`. Current light background/surface/text/muted values are `#F5EFE4 / #FFFDF8 / #1A1A18 / #6B675F`; dark values are `#121110 / #1C1A18 / #EBE6DE / #A09B94`. Use token references, not duplicated hex literals. [ThemeProvider](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/ThemeProvider.tsx), [semantic tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts)

The existing HapticPressable has scale animation by default and a disableAnimation prop; the shared reduced-motion hook initially returns false while asynchronously reading system preference. Therefore static first-slice presentation is safer than assuming the default prevents the first frame from animating. [Pressable](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/components/HapticPressable.tsx), [reduced-motion hook](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/hooks/useReducedMotion.ts)

### 7.2 Small screens / keyboard / safe areas

- Test 320×568, 375×667, 390×844, 430px wide; landscape short viewport; notched and non-notched devices. Use logical dimensions, not pixels assumed from a web screenshot.
- At 200% text, stack source label/status and multi-action rows vertically; never shrink body, cap whole-screen scaling, or clip with `numberOfLines={1}`. Header title may wrap; Back target remains ≥48.
- Footer actions are in scroll content for initial delivery. If later made sticky, subtract footer height + safe inset from content, ensure focused input remains visible, and keep long translated action text readable.
- Code display can wrap into deliberate character groups; provide copy action and full screen-reader character sequence. Do not ellipsize a code or rely on `adjustsFontSizeToFit` as the only accessibility strategy.
- Keep bottom tabs visible on home; task screens follow existing nested stack behavior. Do not globally restyle navigation safe areas in this slice.

### 7.3 Screen readers / focus

- Screen heading has header role; actions have button role; radio group/selected state represented with supported RN accessibility roles/states. Input has visible label and associated hint/error in the reading order.
- Reading order: navigation → title → explanatory copy → options → validation/status → primary → secondary. Decorative chevrons/dividers are hidden; Roman is announced once, not once per nested container.
- On explicit in-place Yes→value or step advance, focus the new heading once; not on background polls, count changes, app resume, or every render. Preserve focus if caller returns from OS share/clipboard.
- Progress announces actual phase transitions politely, not every poll or counter increment. Terminal result announced once. Errors that block the user's action are announced promptly; provide visible text too.
- Pairing codes use localized individual-character speech. Support references may be copied/spelled separately. Never announce credentials or raw exception payloads.
- Disabled controls expose reason; busy Start says Confirming Start, not “Import started”. Android hardware Back, iOS gesture Back, and visible Back must agree on step/exit semantics.

### 7.4 Reduced motion / haptics / dark mode

- No perpetual spinner masquerading as activity. A real finite request may show a static busy label; progress phases need no animation at all.
- No celebratory haptic on pairing, received staging, or unverified completion. A light optional action haptic is not authority and may be absent without losing information.
- System Reduce Motion on or unresolved → no entrance/position/scale animation. Mid-session preference changes stop nonessential effects.
- Minimum measured contrast: body/action text 4.5:1, large text/non-text meaningful control boundary 3:1. Check actual computed combinations, not comments in old docs. Never rely on gold/stone as small instructional text.
- Verify both semantic themes, pressed/focused/disabled/selected/error states and Roman monogram fallback. Do not make a theme-store or preference change to style this feature.

### 7.5 Roman voice policy

Short complete sentences; first-person singular only when Roman is enabled; no contractions, emoji, hype, exclamation, dry jokes about loss, “we”, or unsupported “I have logged it / I will retry / nothing is lost”. Face and voice co-locate on persistent Roman surfaces. Neutral importer copy remains when Roman is off. The current identity spec and existing copy module establish this register; this feature gets one local dictionary, not scattered inline prose or another persona. [Roman identity](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md), [existing copy discipline](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/lib/roman/copy.ts)

### 7.6 Localization contract

Use `src/screens/coach/import-journey/i18n/en.json` plus typed helper as the feature's only copy home, matching the existing local i18n approach without adding a dependency. Separate full neutral/Roman strings only where wording differs. Do not modify shared Roman copy ownership in UX-P1. [Existing local pattern](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/day-one/i18n/strings.ts)

- `{count}` uses locale number formatting and explicit zero/one/other forms. Units must be supplied by typed UI context; do not substitute receipts into client wording.
- `{time}` is derived from actual server timestamp and user's locale/time zone; include date/zone when necessary across days/devices. No render-time timestamp posing as last update.
- `{sourceName}` is catalog name or safe normalized host label; `{workspaceName}`, `{sourceWorkspaceName}`, `{clientName}` are plain escaped text. Long names wrap. Never interpolate raw URL query, HTML, exception, email, or secret.
- `{scopeLabel}` is a reviewed human scope description from approved data, not arbitrary server prose. `{reason}` maps a known reason key to a full localized sentence; unknown keys show “The import needs attention before it can continue.”
- `{reference}` only actual safe correlation ID; hide row when absent. Do not synthesize a fake support number.
- Pseudo-localize at +40% length; test RTL alignment with logical start/end paddings, icons mirrored only where direction represents navigation. Preserve source identifiers/code character order with appropriate bidirectional isolation.
- All accessibility labels/hints/status strings are localized too. Prevent missing key/placeholder literals in release; tests require dictionary completeness. English is the initial authored locale; no unreviewed claim of translation coverage.

## 8. State and authority matrix

These are **conceptual presentation states**, not proposed wire enums. The future adapter maps only accepted contract states to them. UX-P1 needs only controlled entry/setup props; UX-P2 can use explicit fixtures. Neither defines backend persistence.

| Presentation state | Required authority / dependency | Allowed action / wording | Forbidden inference |
|---|---|---|---|
| Hidden | Import off / role denied / incomplete onboarding | No offer/service mount | Roman flag grants permission |
| Eligibility unknown | Identity/onboarding check unresolved | Normal coaching; no unsolicited offer | Home arrival means onboarding complete |
| Question/value | Positive completion + role + availability + no conflicting current setup/decision | Optional Yes/fresh/Later | Empty roster means new coach |
| Deferred/fresh | Acknowledged account/workspace preference | Compact resume / Settings only as specified | Device-global flag is cross-account truth |
| Setup creating | Explicit user setup request after prerequisites | Preparing setup / Back | Mounting question begins run |
| Setup unknown after response loss | Recoverable approved setup lookup | Check current setup | Blind second setup creation |
| Handoff ready | Valid current setup + trusted locator | Copy/share real link | Shared locator authorizes import |
| Extension unavailable | Missing handshake or verified reason | Generic help, or precise reason when proven | Missing = disabled = wrong profile |
| Paired marker only | Redeem record exists, possession uncertain | Pairing recorded; check connection | Paired = token possession = running |
| Connected pre-start | Valid extension session/setup ownership confirmed | Your import has not started | Starts 300-second timer |
| Source not ready | Login/origin permission/principal/scope incomplete | Correct source setup | URL validation = compatible source |
| Ready | Setup possession + source lifetime authority + intended destination + accepted contract | Start once on desktop | Presence of button is authorization |
| Start pending / unknown | Request initiated, acceptance response unknown | Confirming Start / recover same identity | Button tap/time elapsed = acceptedStart |
| Running | Authoritative accepted run ID/timestamp/deadline/current state | Actual phase, actual counts, explicit Stop | Paired/status heartbeat/CI is execution proof |
| Status stale/offline | Last observed authority + stale/unavailable indicator | Current status unconfirmed, timestamp, check again | Phone offline = run interrupted |
| Stop pending | Stop requested, server fence unconfirmed | Stop requested; waiting | Phone says stopped before fence |
| Interrupted | Actual lifecycle interruption classification | Reconcile result before recovery | Tab close rolls back imported records |
| Timed out | Server fixed-deadline terminal fence | Time limit reached, review actual subset | New screen/retry gets new 300 seconds |
| Cancelled | Stop/fence terminal confirmed | Import stopped; writes may remain | Cancel = rollback/zero effects |
| Blocked | Specific prerequisite/authority/source blocker | Exact safe reason + appropriate corrective action | User must repeatedly press Start |
| Failed | Authoritative terminal failure | Did not complete + any confirmed subset | Every attempted record failed |
| Partial native | Some attributable native records verified, scope remainder unresolved/failed/excluded | Some records ready; verified destinations only | Receipt total = native total |
| Unconfirmed transfer | Attempt count known, receipts missing/ambiguous | 22 unconfirmed client records, may have arrived | Unconfirmed = failed or duplicate-safe |
| Complete native | Source coverage + required families + relationships + native readback for declared scope all proven | Records ready, scope and verified destinations | Staged/paired/CI green = complete |
| Proven zero | Complete source coverage says zero in declared scope | No records found in checked scope | Missing/blocked traversal means zero |
| Result unavailable | Read fails or account unauthorized | No secret/detail leakage; retry/auth route | Old cached result is current truth |

### Data the final UI needs, without naming a new API

| Information | Authority owner | UI use / absence behavior |
|---|---|---|
| Authenticated TGP account/workspace/role + onboarding completion | Existing account/onboarding backend and approved mobile host | Eligibility; unknown fails closed for offer without blocking coaching |
| Offer decision / source preference / existing setup locator | Parent-designated account preference/setup owner | Cross-device resume; no UX-P1 storage |
| Setup identity, expiry, pairing status, token-possession recovery | Frozen C1 successor + extension session owner | Separate setup from run; ambiguity shows connection check |
| Official listing, extension ID/minimum version, trusted setup origin | Extension release/setup-web owner | Install/return; missing verification blocks activation |
| Selected source origin, principal/workspace, scope, permission/lifetime binding | Extension/source authority + backend fences | Pre-start display and lifetime checks; loss fences |
| Accepted run ID, immutable accepted start/deadline, status/version/freshness | Frozen lifecycle service | singleStart, calm progress, stop and timeout truth |
| Family coverage/receipts/rejections/unconfirmed counts with units | Engine/receipt reconciliation owner | Separate transfer truth from native usability |
| Native entity IDs, relationships, readback proof and destination capability | G2 identity + native domain owners | Enable only actually usable destination actions |
| Safe support correlation + permitted recovery policy | Approved support/lifecycle contract | Real reference / constrained next action, never raw tokens |

**Concurrency requirements:** account/workspace switch clears sensitive visible state before any new read; in-flight responses from old scope cannot repaint. Return/refresh resolves current setup/run before creation. One accepted start survives duplicate clicks/devices. Terminal state cannot be overwritten by stale running polls. Counts are not assumed monotonic across different scopes/reconciliations; display latest version with labels rather than animating every delta as success. All of these are integration requirements, not client-local substitutes for server authority.

## 9. Native destination policy: usable means usable

The canonical plan identifies the current User-versus-Person native identity bridge as unresolved and forbids turning imports into login accounts, auto-invites, or email-only identity merges. Historical imports must not trigger live notifications, coaching workflows, charges, or subscription transitions. [Native product boundary](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

### Enablement rules

1. A **transfer receipt** proves the defined acknowledgment only.
2. A **staged record** proves staging only.
3. A **native write** without relationships/readback is not yet proof that the coach can use it.
4. A **verified native destination** requires same-workspace authorization, resolved native entity identity, expected family/relationship content and successful readback through the destination's real data path.
5. Complete requires those checks across the declared required scope plus source completeness, not merely a nonzero count.

| Result action | Existing destination | Enable only when | Otherwise |
|---|---|---|---|
| Open clients in TGP | `ClientsStack → ClientsList` | Native roster bridge exposes verified imported clients to this account; capability test passes | Show status/recovery only; no “open imported clients” promise |
| Open {clientName} | `ClientsStack → ClientDetail {clientId, clientName}` | Real existing destination ID, ownership and readback verified; never staging ID | No row action; factual verification status |
| Workouts / nutrition / timeline row | Existing client detail/domain screens as actually supported | Domain owner verifies current route, valid params and native content | Show verified summary without a fabricated deep link; do not invent `ImportReview`/history route |
| Billing history | Existing approved read-only native surface, if verified later | History-only mapping and authorization; zero live payment side effects | No destination CTA until native owner supplies it |

Actual current route shapes come from the navigator and client-detail implementation; family-specific tab selection is not presently a route parameter, so this plan does not pretend it is. [Routes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/CoachNavigator.tsx), [client detail](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ClientDetailScreen.tsx)

If the engine has completed transfer but the native bridge is unavailable, say **“Transfer confirmed. Availability in TGP has not been confirmed.”** Do not call it complete, send the user to an empty client file, or make a second importer engine to bypass the gap. G2/native integration is the owner of that gap.

## 10. Build architecture, ownership, and sequence

### Reuse, not parallel architecture

- Keep the current `ImportData` task route in the Settings stack when integration is authorized. Replace its legacy body/controller in one bounded integration slice; do not add an independently orchestrated `RomanMigrationFlow` stack/provider.
- New presentation directory owns only views/copy and view input types. Use callbacks for navigation/actions; screen/container later adapts frozen service data. No global importer store in UX-P1.
- Keep platform names in the current catalog, approved URL validation in its existing utility, Roman assets in existing avatar, theme in existing tokens, localization local as already practiced.
- Existing pairing panel/hooks/PR-stack work are donor evidence. Parent chooses precise forward-port changes after contract freeze; no automatic wholesale reuse of assumptions or destructive “restart”.
- A final controller may use current application query/navigation conventions; this plan does not preselect a new framework, scheduler, event bus, second engine, or persistence format.

### Ownership map

| Owner | Files/surfaces | Can start now? | Must not own implicitly |
|---|---|---|---|
| Separate mobile UX-P1 builder | New `src/screens/coach/import-journey/**` only | Yes, after parent scope approval | Existing route/auth/session/persistence/backend/extension/schema |
| Mobile presentation UX-P2 builder | Additional pure view states/tests in same directory; one writer at a time | Yes after P1 handoff if parent authorizes | Production completion/navigation or live contract consumers |
| Mobile integration owner | `ClientsListScreen`, `SettingsScreen`, `ImportDataScreen`, bounded `CoachNavigator` typing, current hooks as approved; docs/tests | No, pending dependency freeze and authority inputs | Root authentication rewrite, global theme/i18n refactor |
| Backend setup owner | C1 durable setup/recovery/frozen DTOs | Separate existing lane | Accepted Start/native results implied by setup status |
| Extension/setup-web owner | Official install/return, source tab/profile permissions and task tab | Separate approved contract-dependent lane | A second source extraction/migration engine |
| Lifecycle + engine owner | Start identity/deadline/fences, source lifetime, reconciliation/status | Separate lane | UI timer as server enforcement |
| Native domain owners | G2 identity bridge, client/history mapping/readback and side-effect suppression | Separate dependency lane | Treat staging as product usability |
| Parent + independent reviewer(s) | Scope/risk/composition/review/acceptance | Parent dispatch now | Planner self-review as independent acceptance |

See [BUILD_SLICES.md](BUILD_SLICES.md) for exact base, files, commands, forbidden edits, and autonomous UX-P1 dispatch. UX-P1 is approved as **initial consequence Tier 1** because it is unreachable pure leaf-view preparation, with appropriate tests and targeted independent review; it is not subject to a universal Tier 4 classification. Production host wiring is a meaningful customer behavior change and parent must classify/review that later scope accordingly under current G06. There is no universal old LOC quota in this handoff. [Current review rules](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md)

## 11. Acceptance and failure tests

These are **required evidence**, not tests performed by this planning lane. Mark implementation/render/device/integration/product evidence separately. A source grep is not a substitute for an interaction or real native-read test.

### 11.1 Immediately buildable UX-P1 tests

| ID | Given / action | Expected |
|---|---|---|
| P01 | Render question, tap Yes | Value replaces question locally; no network/storage/analytics action |
| P02 | Tap I am starting fresh / Later | Distinct callback exactly once; no fake persistence confirmation |
| P03 | Roman on/off; address neutral/sir | Correct exact question; no inferred gender; off has no face/first-person Roman claim |
| P04 | Select each catalog item | Selected state announced; no URL open, pairing init, supported badge, or success claim |
| P05 | Custom malformed, HTTP, embedded credentials, local/private host, valid public HTTPS | Existing validator feedback; valid advances only to instructional handoff; input preserved on Back |
| P06 | Source→handoff→Back, Android Back callback, Later | Correct local traversal/origin callback; no second setup or fake accepted run |
| P07 | 320/375/430 widths, 200% text, +40% pseudo-localization | Controls and full copy accessible by scrolling; no clipping, overlap, tiny target, or forced font shrink |
| P08 | Dark/light disabled/selected/focus | Measured contrast thresholds, explicit selected state; no static light-only backgrounds |
| P09 | Screen reader / reduced-motion on | Correct order and labels; no duplicate Roman, hidden actionable controls, initial motion or polling announcements |
| P10 | Mount/unmount/re-render all new views; trigger all actions with side-effect mocks that throw | Zero import API/auth/storage/Linking/Clipboard/Share/analytics calls; test host unreachable in production |
| P11 | Missing dictionary key/placeholder, singular/plural counts in copy unit tests | Typed key completeness; no raw keys or unresolved interpolation in release output |
| P12 | Existing production entry/flags source diff | No modified host/navigator/service/flag/package/generated files; legacy behavior not falsely claimed fixed |

### 11.2 Later host and cross-device integration tests

| ID | Scenario | Expected |
|---|---|---|
| E01 | Completed authoritative coach onboarding, enabled import, no decision | One nonblocking offer on first real Clients landing, not a modal/7th step |
| E02 | Onboarding 5xx/timeout but Root reaches coach | No unsolicited offer; Clients still works |
| E03 | Client/student, denied role, unknown workspace, feature off; direct route attempt | No importer authority/mount; neutral denied/recoverable behavior as approved |
| E04 | Later, fresh, resume, app restart, second device, account switch | Correct acknowledged account/workspace decision; no leak/repeated full promotion |
| E05 | True zero roster vs search miss/filter miss/load failure | Secondary import utility only on genuine empty success; no duplicate full card + empty promotion |
| E06 | Home/Settings/empty/Roman typed entry | Same controller/current lookup; Back returns to origin; no duplicate tasks |
| E07 | Handoff copy succeeds/fails; share cancelled; link opened in wrong account | Feedback matches actual action; share cancellation is not failure/success; ownership enforced |
| E08 | URL with secret/email/credential-bearing query; unverified setup/store host | Never exported/opened as trusted setup; fail closed, no generic search fallback |
| E09 | Extension missing/disabled/wrong profile/old version/policy blocked | Precise state only if proven; otherwise generic unavailable + distinct help possibilities |
| E10 | Extension installed while tab closed; browser returns; popup cannot open | Persistent task tab path works and resumes same setup after required auth |
| E11 | Lost init response, consumed code lost redeem/token response, expired/revoked code | No blind duplicate init, no false connection/ready; approved recovery or explicit blocked step |
| E12 | Pairing succeeds; source not signed in | “Import has not started”; no running phase/timer; correct source step |
| E13 | Source permission denied, wrong selected tab, principal unknown | Start disabled with clear remedy; no source password collection |
| E14 | Source same-origin account switch, changed workspace, shared-cookie change, refreshed principal mismatch during run | Source lifetime fence stops unsafe continuation; no cross-account writes; factual blocked result |
| E15 | Double click, two tabs/devices, network retry, lost Start response | One accepted run ID; same original acceptedStart/deadline; recover rather than new attempt |
| E16 | Phone background/close/refresh during run | Run not implicitly cancelled, new timer not created; current authority reread on return |
| E17 | Desktop task tab crash/extension disable; phone still online | Actual interruption classification/reconciliation, not spinner forever or fabricated completion |
| E18 | Stale polling, out-of-order version, network reconnect after terminal | Old running response cannot replace terminal; stale label and timestamp accurate |
| E19 | Phone Stop online/offline; desktop Stop | Immediate desktop local stop where applicable; server fence enforced; phone offline never claims it stopped desktop |
| E20 | Deadline 300 seconds, delayed messages, attempts to reset/retry after fence | Fixed authoritative deadline and no post-fence writes; UI reload does not reset it |
| E21 | 12 confirmed receipts / 22 unconfirmed clients, coverage/native unknown | Exactly labelled evidence; no “22 failed”, native CTA, total denominator, or complete banner |
| E22 | Proven failure of one record; ambiguous timeout of another | Distinct rejected vs unconfirmed categories; retry policy reconciles duplicates |
| E23 | Staging success/roster count increase without run attribution | No native success or imported-client claim |
| E24 | Verified subset, required-family failure, missing relationship | Partial result, verified-only navigation; no overall complete |
| E25 | Complete scope + native bridge/readback passes | Ready result; valid same-workspace Clients/ClientDetail navigation with real ID |
| E26 | Staging/Person ID supplied where current route expects native User ID | Action absent/rejected safely; no broken client file or silent identity coercion |
| E27 | Imported historical records containing email/payment/history | No login account auto-provision, invite, notification, charge, workflow, or email-only merge |
| E28 | Complete source coverage genuinely zero vs unreadable source | Proven zero wording only for former; blocked/unknown for latter |
| E29 | Result read fails, sign-out/account change during fetch, expired local snapshot | No stale cross-account details, no invented status; recover current server result |
| E30 | Support reference absent/malformed, error contains credentials | Hide unsafe detail; no fake reference, raw payload, secret logging/telemetry |

### 11.3 Product acceptance, distinct from CI

- Observed first-time coach can find the optional offer, defer without losing ordinary coaching navigation, return through Settings, complete the phone/desktop path, understand paired vs started, and find a verified native record without coaching from the test moderator.
- Test the real official install on a clean supported desktop profile and an already-installed profile; include wrong account/profile and denied-permission recovery. A mocked handshake is UI evidence only.
- Real V1 evidence must include the TrueCoach oracle regression and a structurally different authorized real coaching source, with at least one non-empty fully reconciled complete run on each, zero required post-Start actions, and native completion at or before 300 seconds. Pin product SHAs, source observation dates, browser/version, scope/counts/relationships, accepted clock and redacted negative-control evidence. All-partial or all-timeout runs do not pass V1. CI is not that product evidence. [Canonical V1 definition](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)
- Product acceptance remains blocked if any destination is simulated, native results are represented only by staging counts, or the run lacks complete authority/coverage checks, regardless of polished UI.

These criteria align to canonical G6 real V1 and G7 canary, rather than treating a local build or green pipeline as acceptance. [Canonical acceptance gates](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

## 12. Measurement without invented baselines

**Baseline: not measured in this planning task.** Numbers below are proposed targets or canonical acceptance targets, not current performance claims. UX-P1 adds no production analytics calls; instrumentation belongs to a separately approved integration owner using existing conventions.

| Outcome / guardrail | Definition | Target / measurement |
|---|---|---|
| Eligible offer correctness | Eligible, feature-enabled, authoritative-complete test cases with correct first-home offer / all such cases | 100% in acceptance matrix; also 0 offers in ineligible/unknown cases |
| Setup usability | Unfamiliar coaches who finish setup and find actual native results without moderator intervention / observed unfamiliar coaches | Canonical ≥9/10; record every observed failure/recovery |
| Autonomous completion | First accepted distinct runs meeting full scoped native completion ≤300s / all first accepted runs in predefined supported source/size envelope | Canonical ≥90% over at least 10 distinct runs; all partial/failed/blocked/timed-out/cancelled accepted runs stay in denominator; retries separate |
| Post-Start burden | Required user actions after accepted Start on successful run | Canonical 0; pre-start login/permissions measured separately |
| Truthfulness | Complete claims without coverage/native proof; paired-as-running; unconfirmed-as-failed | 0, include fixture and real-run negative tests |
| Isolation/safety | Cross-account exposure/writes, duplicate native records from retry, post-fence writes, secret leakage | 0; safety failure blocks activation, not averaged away |
| Findability | Eligible coach can later locate Settings entry; verified result CTA resolves correct destination | Measure task success and time; set threshold after baseline pilot, not invented |
| Accessibility | Required P07–P09/device screen-reader criteria passed | 100% required criteria; report untested combinations explicitly |
| Recovery clarity | Coach correctly describes what is known/unknown and next safe action in partial/interrupted test | Measure in moderated pilot; proposed ≥9/10 understanding target, separate from canonical run metric |

Canonical numerical targets come from the continuation plan; the understanding target is a new UX proposal for parent approval. [Canonical metrics](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

Suggested later events (names conceptual, do not add a second analytics pipeline): offer shown/decision, entry origin, source shortcut selected (catalog ID only), handoff action result, extension readiness category, setup connection category, authoritative accepted Start, phase transition, result category, verified destination opened. Run outcomes come from authoritative records; client button taps do not stand in for acceptance. Only approved opaque correlation/attempt IDs if privacy policy allows; no source URLs, client names/emails, pairing codes, tokens, credential text, or raw errors. Deduplicate first impressions per qualified decision period and first accepted run metrics per authoritative run ID.

## 13. Open decisions and integration hold points

These are concrete owner questions, not reasons to delay UX-P1.

| Needed decision/proof | Owner | Blocks |
|---|---|---|
| Authoritative onboarding/coach-workspace eligibility value available to home without auth rewrite | Parent + mobile/account owner | UX-I1 host wiring |
| Account/workspace preference owner for Later/fresh/seen and acknowledgement/resume semantics | Parent + approved preference/backend owner | Persistent offer behavior |
| Exact accepted C1 version, compatibility/G2 completion, consumed-code/token-possession recovery | Backend setup owner + parent acceptance | All setup consumer integration |
| Official Chrome listing URL, extension ID/version support and trusted setup origin | Extension release/setup-web owner | Operational handoff/install |
| Source principal/workspace authority and lifetime revalidation/fence | Source/lifecycle owners | Ready, Start, continued transfer |
| Start, deadline, Stop/cancel, interrupted recovery and retry policy frozen together | Lifecycle owner | Running/terminal production UI |
| Native User/Person bridge, run-attributed family verification, destination capabilities | G2/native domain owners | Native results and completion |
| Safe support destination/reference contract and privacy-approved telemetry | Support/privacy/integration owners | Operational support/analytics, not presentation |
| Whether additional milestone smile is approved | Roman product owner | Optional future expression only; neutral portrait is default |

**Close-out:** the actionable work is separated: the approved Tier 1 presentation/navigation slice is running with a separate builder; integrated authority and native usability remain explicit gates. Do not hold the active first slice for unrelated backend review, and do not use its completion as permission to cross those gates.

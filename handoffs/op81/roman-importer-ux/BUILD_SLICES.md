# Roman importer — build slices and autonomous builder handoff

**Planning handoff · documentation publication · 18 September 2026 · Astra UX planning lane**

## Approved work now running

**UX-P1 only is approved at Tier 1.** Separate builder `roman_importer_ui_builder_mu7hkdgm` is running on mobile base `a5933fd6de5616493de75f0db907098b149b955c` while backend reviews continue. No implementation clearance or mobile PR is claimed. This is a local presentation/navigation candidate, not production importer integration, a release, or product acceptance. All descriptions below are proposed work unless explicitly labelled current.

### Current boundary

Live mobile `main` and the inspected clean checkout both resolve to **a5933fd6de5616493de75f0db907098b149b955c**; preserved [PR 289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289), [PR 290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290), [PR 291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291), and [PR 292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292) were open, not merged, at the read snapshot. [Exact base](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c)

**Current C1 dependency, observed 18 September 2026:** [Backend PR #526](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526) remains **open draft**, now at `881c4c791727adef8d423931e1cca83a0ffbb9c9` on `925780e0a1906593e5383c618311b6b17364b8dc`. Both bounded repair reviews are complete; overall **integration/release HOLD** remains, the consumer contract is **unfrozen**, and G3 is not accepted. Final hosted checks are pending at this observation; no green final result is preclaimed. Setup recovery does not supply Start, source lifetime authority, or native completion. The original `8e25c27` is preserved history, not the current head. [Publication and bounded review status](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526)

The canonical ruling is an optional offer at first coach home **after authoritative onboarding**, not a Payments→Ready interstitial or seventh onboarding step. [Canonical placement and dependencies](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

## UX-P1 — immediately buildable, no backend dependency

**Objective:** demonstrate a polished, accessible question → value → source shortcut → computer-handoff journey with local Back/Later behavior in render tests. No production route reaches it yet. This is useful UI preparation, not a pretend operational importer.

**Base:** create one new isolated worktree/branch from exact mobile `a5933fd6de5616493de75f0db907098b149b955c`. Recheck live main before work; if changed, report and agree a new base rather than silently composing changes. Do not use PR 292 as the base or bulk cherry-pick the stack. Preserve all donor branches and worktrees. Apply current authorship and review rules, not stale numbered quota procedures. [G01/G04/G05/G06/G09](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md)

**Single owner:** separate mobile UX-P1 builder `roman_importer_ui_builder_mu7hkdgm`. Parent owns dispatch, scope changes, review assignment, and later composition. This planner is not the builder or reviewer.

**Approved initial consequence tier: Tier 1.** This unreachable pure leaf-view slice requires appropriate tests and targeted independent review, not universal Tier 4 review. Production integration must be separately classified by its actual consequences. [Current G06](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md)

### Exact new-file ownership

Create only this feature-local directory (names may be combined if simpler; do not expand scope):

```text
src/screens/coach/import-journey/
  ImportOfferCard.tsx             # full question/value and compact resume variants
  ImportSetupView.tsx             # controlled source/custom-source/handoff view
  importJourneyCopy.ts            # typed localized lookup + explicit voice variant
  i18n/en.json                    # exact English strings from UX plan, one copy home
  __tests__/ImportOfferCard.test.tsx
  __tests__/ImportSetupView.test.tsx
  __tests__/ImportJourney.navigation.test.tsx  # test-only in-memory host
  __tests__/importJourneyCopy.test.ts
  README.md                      # inputs, limits, test commands, not production-wired
```

No new application state machine, provider, global store, hook architecture, dependency, asset generator, or schema. A discriminated union of view props is enough. Follow the existing feature-local English dictionary/typed helper convention rather than adding an i18n library. [Existing localization pattern](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/day-one/i18n/strings.ts)

### Inputs, not authority

- `ImportOfferCard`: explicit `variant: question | value | resume`, `romanEnabled`, `addressForm: neutral | sir`, action callbacks. Default address is neutral; `sir` is only an explicit preference supplied by a future host. Component does not read identity or decide eligibility.
- `ImportSetupView`: explicit `step: source | customSource | computerHandoff`, selected catalog ID, custom URL text and validation feedback, `romanEnabled`, callbacks for selection/change/continue/back/later. These are **view-model types**, never claimed to be backend DTOs or lifecycle enums.
- Test-only host: local React state demonstrates question→value→source→handoff, custom source validation, Back preserving selection, Later returning to a mock host slot. It is under `__tests__`, not registered or exported into a production navigator. No Storybook install required.
- Handoff has the truthful instruction, “You will need Chrome on a computer.” It does **not** claim a link exists, a code was minted, preferences were saved, or a computer was paired. Operational handoff controls belong to later integration; UX-P1 must not create placeholder production buttons or URLs.
- Reuse `IMPORT_PLATFORMS` for names and `safeImportLoginUrl` for local custom-input format feedback only; **do not open** any source URL. Validation is not source compatibility, origin permission, or authority. [Catalog](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/constants/importPlatforms.ts), [URL guard](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/utils/safeImportLoginUrl.ts)
- Reuse `RomanAvatar` with explicit `crop="neutral"`, `size={48}`; static presentation, no fake typing or bounce. Use existing theme tokens and semantic dark colors; see main plan §7. [Avatar](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/components/roman/RomanAvatar.tsx), [tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts)

### Forbidden edits / side effects

Do not edit `RootNavigator`, `CoachWizardNavigator`, `CoachNavigator`, `ClientsListScreen`, existing `SettingsScreen`, `ImportDataScreen`, `ExtensionPairingPanel`, pairing/reconstruction hooks, services, feature flags, source catalog, generated types, auth/session storage, analytics pipeline, package manifests/lockfiles, backend, or extension. Do not import any live pairing/run service into the new directory. Do not call API, Linking, Clipboard, Share, analytics, storage, or authentication from it. No fake completion screen or sample success reachable in production. No `acceptedStart` or setup-token model invented here.

The absence of production host wiring is **intentional**, not a missing task: current home entry is not sufficient onboarding proof, and the current importer starts the legacy pairing flow on mount. [Root gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/navigation/RootNavigator.tsx), [existing importer](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/screens/coach/ImportDataScreen.tsx), [pairing panel](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/components/coach/ExtensionPairingPanel.tsx)

### UX-P1 acceptance / builder evidence

1. Render every owned view at 320/375/430 logical-pixel widths, light/dark, normal/200% text, and RTL layout simulation; all content scrolls, no clipped code/label, controls ≥48×48, visible text wraps.
2. Exact copy, neutral/sir explicit variants, Roman off = no portrait and no Roman first-person speech. Source choices carry no “supported” badge, completeness guarantee, or start side effect.
3. Render-test traversal: Yes→value→Import my records→source→select→Continue→handoff; Back reverses locally and retains selection. Starting fresh/Later each call only their own host callback once. Android Back and header Back share callback semantics in the test host.
4. Custom URL invalid → inline feedback; valid public HTTPS → handoff only. No source login opens on phone. Neutral current catalog labels unchanged.
5. Assert zero API/auth/storage/analytics/Linking calls on render and interactions. A source scan alone is insufficient; mock known side-effect modules to throw if called and exercise the views. No production navigator registration or import of the test host.
6. VoiceOver/TalkBack reading order: Roman (once), question, choices; selected source identified; Back labelled; no duplicated parent/child announcements. Static screens remain static with reduced motion.
7. Run focused Jest tests, scoped ESLint, and `npm run typecheck`; record exit status and full command/output. Existing package scripts are `test`, `typecheck`, and `lint`. [Package scripts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/package.json)
8. If baseline toolchain/dependency issues block a check, report exact baseline vs candidate evidence; **do not** silently absorb PR 289 dependency fixes or rewrite lockfiles. Missing runtime/device preview = unverified visual criterion, not “passed.”
9. Return changed files, base/head, screenshots if actually rendered, tests and limitations, local handoff. No PR/push/deployment unless parent explicitly authorizes a later action.

### Suggested validation commands (builder runs, planner has not run them)

```bash
npm test -- --runInBand src/screens/coach/import-journey/__tests__
npx --no-install eslint src/screens/coach/import-journey --ext .ts,.tsx
npm run typecheck
git diff --check
git status --short
```

An exact committed-lock dependency install (for example, `npm ci`) in the isolated environment is allowed. Do not modify package manifests or lockfiles, upgrade dependencies, or silently absorb donor dependency changes to make this slice pass. Record baseline failures separately. Device/screen-reader evidence is additional to Jest, not implied by it.

**Done means:** implemented/tested local UI candidate within these bounds, ready for independently assigned review. It does not mean reviewed, merged, deployed, contract-compatible, or product-accepted. [G09/G18](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md)

## Subsequent slices — do not start automatically

| Slice | Owner and scope | Hard prerequisites | Acceptance boundary |
|---|---|---|---|
| UX-P2 | Mobile presentation builder: pure pairing/progress/result/recovery panels with explicit fixtures | UX-P1 visual conventions; no wire DTO dependency | Truthful state matrix render tests, no production registration or live calls; fixture counters labelled test data in documentation |
| UX-I1 | Mobile integration owner: first-home host, Settings/empty-state entries, single existing ImportData route controller, authoritative offer/resume preference | Accepted G2 identity rollout; C1 consumer contract frozen; authoritative onboarding/eligibility and preference owner signed off; released feature gates; lost-response recovery design | No offer on unknown onboarding; no auth/session authority changes smuggled into host UI; sign-out/account-switch isolation; Later/fresh persist correctly |
| UX-I2 | Coordinated mobile + extension + setup-web owners: trusted desktop handoff, official install/return, pairing readback | UX-I1; official listing/ID/version and trusted setup origin verified; accepted setup consume/token recovery contract; same-account ownership enforced | New and installed extension paths, disabled/profile/policy/update states, expiry/recovery; pairing never runs import |
| UX-I3 | Extension/lifecycle owner with mobile consumer: source authorization, acceptedStart, progress, Stop, terminal results | Frozen Start/deadline/cancel/retry/status/source-authority contract; durable duplicate protection; lifecycle acceptance | Exactly one accepted run, ≤300-second deadline from original accepted start, refresh/retry cannot reset; no post-fence writes |
| UX-I4 | Backend/native domain owners plus mobile integration: attributed native results + existing destinations | G2 native identity and domain mapping; verified family coverage/relationships/readback; invite/workflow suppression; destination capability mapping | No staging-as-usable, no raw staging ID navigation, no accidental live invites/charges; real client-file evidence |
| UX-A | Parent's product acceptance lane, not this planner | All integrated slices + real V1 cross-device run then scoped canary | Canonical G6/G7 and measured user outcome; CI alone insufficient |

The dependencies above follow the canonical G2–G7 sequence; UX-P1/P2 are deliberately non-consuming work in parallel, not waivers of those gates. [Canonical release sequence](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md)

## Approved builder handoff (already dispatched)

> Build only UX-P1 in `BUILD_SLICES.md`, using `ROMAN_IMPORTER_UX_PLAN.md` §§4–7 and §11 for copy, layout, and tests. Base exact mobile a5933fd6de5616493de75f0db907098b149b955c in an isolated worktree after rechecking live main. Own only new `src/screens/coach/import-journey/**` files. Create controlled presentational components and a test-only local navigation harness. No production entry wiring, backend/extension/source/schema/auth/storage/generated-contract edits, live calls, fake completion, dependency changes, PR, or push. C1-S1 is not consumer-frozen. Reuse tokens, RomanAvatar, catalog, URL validation, and local typed i18n conventions. Return a local candidate and evidence; stop and report any boundary collision. Parent will assign independent review and authorize integration separately.

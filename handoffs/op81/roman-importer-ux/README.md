# Roman importer UX planning and build index

**Status observed: 18 September 2026, 15:00 PDT. Documentation-only publication; not a product release.**

## Read next

1. [Detailed UX plan](ROMAN_IMPORTER_UX_PLAN.md): full screen journey, exact English copy/localization keys, textual wireframes, layout/token/accessibility rules, authority matrix, native-destination requirements, and acceptance/failure tests.
2. [Build slices and approved handoff](BUILD_SLICES.md): bounded first-slice files, base, exclusions, validation, and later dependency gates.

## Current progress and limits

- **UX-P1 is approved at Tier 1 and running** with separate builder `roman_importer_ui_builder_mu7hkdgm`, on [mobile base a5933fd](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c). This is parent-reported dispatch status, not an implementation clearance, finished UI, mobile PR, or product acceptance.
- The active scope is unreachable pure leaf views, localized copy and a test-only navigation host. No production route wiring, import API calls, auth/session/persistence change, generated-contract consumption, backend/extension edits, or simulated production completion. Appropriate tests and targeted independent review apply; later integration has its own consequence classification. [Approved slice](BUILD_SLICES.md)
- [Backend C1 draft #526](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526) is at `881c4c791727adef8d423931e1cca83a0ffbb9c9` on `925780e0a1906593e5383c618311b6b17364b8dc`. Both bounded repair reviews are complete; integration/release HOLD and an unfrozen consumer contract remain. Final hosted checks are pending at this observation. No accepted G3, contract freeze, merge or deployment is implied.
- Exact committed-lock dependency installation in an isolated build environment is permitted, without package/lockfile modifications. This does not authorize a dependency upgrade or unreviewed donor integration. [Builder boundaries](BUILD_SLICES.md)

The governing sources are [AGENT_RULES at 160928b](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/AGENT_RULES.md) and the [canonical Roman continuation plan](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/handoffs/op81/CONTINUATION_AND_ROMAN_IMPORT_PLAN.md). Neither is changed by this publication. Only UX-P1 is currently approved for implementation; the remaining plan is proposed integration work behind explicit authority/dependency gates.

## Provenance and reading

The planner read the entire newly supplied Mobile App Design Intelligence guide: **2,662 extracted lines / 17,820 words**, plus all eight original DOCX tables; the original contains no embedded media. The attachment, extraction, raw source snapshots, private read ledger and independent review material are **not published** here. This is a reading statement, not independent validation of the guide's external statistical claims.

Actual mobile source was inspected at [a5933fd](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c), including navigation/onboarding, Clients home, Settings/import, Roman components, theme, localization and accessibility patterns. Preserved [PR 289](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/289), [290](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/290), [291](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/291) and [292](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/292) were open, not merged, at the planning read. Their exact heads and bases remain in the detailed plan as history, not assumed main implementation.

Public design sources include the [current design reference](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md), [Roman identity](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/160928b98c57a6034cd8b7bcfba537e81c63f054/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md), [mobile tokens](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/src/theme/tokens.ts) and [Quiet-Luxury doctrine](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a5933fd6de5616493de75f0db907098b149b955c/docs/QUIET_LUXURY_DOCTRINE.md). The newly supplied guide is privately retained, not replaced by those older references.

## Publication scope

These three Markdown files are a planning/progress publication only. No product source, canonical rules, canonical continuation plan, repository settings, source account, schema, deployment or live import is changed. The planner/publisher is neither the UI builder nor its independent reviewer. No private reports or probes were used as public evidence. Product tests/device previews have not been performed by this planning lane; builder and integrated acceptance evidence remain separate.

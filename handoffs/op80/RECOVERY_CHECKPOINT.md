# Operator 80: importer recovery checkpoint

Recorded 2026-09-17. This is an evidence checkpoint and planning record, not a product audit, merge authorization, or production-readiness claim.

## Current user directive

The following excerpt is preserved verbatim from the current request:

> Then make a plan to ;
>
> 1.) Follow AGENT-RULES without ever straying from them, utilizing them to avoid mistakes
> 2.) Use elon musks and bezos level of standards and thought processes to upkeep our incredible standard
> 3.) Act autonymously, 100%, never stopping to ask me questions or such (including commits, commit identity chocies, small productg decisions, ect) - defaulting to highest standard
> 4.) make sure the importer tool wont "work great" and "get downlaoded with tgp" but it doesnt auto conenct to the users browesrs OR give them clear prompting to go use it - so itll be missing/ hidden anyways - it eneds to be SUPER easy and explaiend!
>
> GO!

## Recovered source of truth

All four newly supplied documents were read in full, including the importer handoff footer. The supplied AGENT_RULES snapshot is older than the repository constitution. Live rules are R1-R126 and R130-R138; R127-R129 do not exist. No rules are being rewritten or waived.

The separate-product handoff supplies recordkeeping lessons only. Its private operational details are deliberately not reproduced here and do not authorize work on that product.

The newest durable TGP recovery record is [context commit 110d280](https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/110d28022c791c26de83995a195e754bfa22a5eb), not context main. Its dispatch ledger preserves interrupted work and references some reports that existed only in the previous workspace. A dispatch is not a completed audit.

| Surface | Exact recovered SHA | Meaning |
|---|---|---|
| Context main | `32445a75c7ee6a0018c1f3979519b3e62ed67fc8` | Canonical rules baseline |
| Context recovery branch | `110d28022c791c26de83995a195e754bfa22a5eb` | Newest preserved September 16 work ledger |
| Extension main | `0111be661922234d670bbf23e23d270eec1b4a4e` | Merged foundation only |
| Pagination R2 branch | `093b6b01c29123361b043ddd0f36cd4c578cffe2` | Newer than PR21; R3 fixer dispatched but no R3 remote branch found at capture |
| Membership R3 branch | `312280bb22739e712052f50b620ab87f3d0d4b91` | Product fixes preserved; ledger explicitly says non-mergeable |
| Backend main | `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7` | Current main baseline |
| Backend integrity R2 branch | `6b263c2f342a561ca8a64e5efa077e6c90601a4a` | Newer than PR522; final dual audit dispatches paused in preserved ledger |
| Mobile main | `a5933fd6de5616493de75f0db907098b149b955c` | Existing gated settings flow |

The latest preserved context action dispatched the backend R2 dual audit and recorded both lenses paused pending the canonical context SHA. Pagination R3 work may have been unpushed; do not invent its contents. Membership R3 and backend R2 do survive remotely. Exact previous-operator numbering is not independently attested, so this is the latest recoverable predecessor state rather than a fabricated final chat.

## Immediate execution boundary

1. Preserve all recovered branches. Do not force-push, delete, or close predecessor work.
2. Inspect the complete predecessor branch ancestry and current-main deltas before integration.
3. Re-run bounded extension verification in the repository's Node 22 environment; label local checks separately from remote CI and independent audits.
4. Publish the detailed reconstruction, current gaps, activation contract, dependency order, and exact restart point.
5. Make no product-code changes, production flag changes, customer data imports, or main merges during this investigation-and-plan task.

## Activation acceptance direction

The complete customer journey must include finding Import Data, reaching the correct desktop browser, installing/enabling the extension, pairing the correct TGP account, authorizing the source, accepting one Start Import, observing truthful progress, and opening usable native results. Pairing is not importing; ingestion is not native reconciliation.

No silent installation or permission bypass is promised. Chrome requires explicit installation/enabling and user-gesture permission requests ([Chrome installation help](https://support.google.com/chrome_webstore/answer/2664769?hl=en-GB), [permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions)). The plan will remove avoidable work around those legitimate authorization steps, not remove consent.

## R138 Decision Gate

1. **Musk algorithm:** Question the assumption that a bundled extension is an activated migration feature. Delete duplicate setup state and required post-start coach work; reuse the existing extension, pairing, ingest and replay infrastructure before introducing new components. This follows question, delete, simplify, accelerate, automate in that order ([algorithm discussion](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)).
2. **Hyperscaler practice:** Pin artifacts and validate the actual customer path, then release through bounded stages with rollback rather than equating green unit tests with production safety ([AWS continuous delivery](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/)).
3. **Good without bad:** Preserve autonomous progress and obvious setup without silent permission grants, source writes, misplaced credentials, or false completion.
4. **Root cause:** Repair the cross-surface lifecycle contract, not just install copy or a hidden feature flag. The separate immediate reliability path resumes existing integrity repairs instead of rebuilding them.

Decision: BUILD SMALLER on the existing architecture; VALIDATE FIRST for unknown-platform autonomy and five-minute complete native migration. This checkpoint changes documentation only. Rollback is an additive correction or isolated documentation revert; no source or destination customer data changes.

## Continuity

The current session's memory-only retrieval found no prior TGP history. It did not modify code or supply an independent product audit. No product builders or auditors have been dispatched in this session. No unattended execution has been scheduled, and no perpetual-running guarantee is made.
